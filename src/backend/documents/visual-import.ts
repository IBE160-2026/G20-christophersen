import { DocumentImportSchema, IMPORT_MAX_RESPONSE_BYTES, type DocumentImport } from '../../contracts/document-import.ts'
import type { LocalVisualEvidence } from '../../contracts/local-visual.ts'
import { extractLocalVisualEvidence } from './local-visual-ocr.ts'
import { addVisualTechnical } from '../import/visual-technical.ts'
import { prepareTechnicalInterpretation } from '../import/technical-interpretation.ts'

function withInterpretation(outcome: DocumentImport): DocumentImport {
  const plan = prepareTechnicalInterpretation(outcome)
  if (!plan.candidateCount && !outcome.visualAnalysis) return outcome
  const result = { ...outcome, technicalInterpretation: plan }
  if ((plan.candidateCount || plan.unresolvedPages.length) && result.coverage.technical.status === 'complete') {
    result.coverage = structuredClone(result.coverage); result.technical = structuredClone(result.technical)
    result.coverage.technical.status = 'incomplete'; result.technical.status = 'blocked'
  }
  return DocumentImportSchema.parse(result)
}

/** A raster flag alone can mean a logo. Readable digital prose remains the
 * primary basis; visual work targets missing text, grade layouts and charts.
 * Pages omitted here retain their original incomplete coverage below.
 */
export function pagesNeedingVisualSupplement(outcome: DocumentImport): DocumentImport['pages'] {
  return outcome.pages.filter(page => {
    if (!['readable', 'blank'].includes(page.status)) return true
    if (outcome.manifest?.candidates.some(candidate => candidate.pdfPage === page.pdfPage && candidate.disposition === 'unresolved')) return true
    if (!page.rasterUnprocessed) return false
    return page.text.trim().length < 200
      || /^[ \t]*(?:Beskrivelse|Vurdering av avvik|Fordeling av tilstandsgrader|Oppsummering av (?:avvik|tilstand)|Sammendrag av boligens tilstand)\b/imu.test(page.text)
  })
}

/** Bildeanalyse følger rapportområdet, uten case-spesifikke sider eller navn.
 * Et helt uidentifisert prospekt sendes ikke automatisk til OCR. Separat rapport
 * beholder derimot alle sine fysiske sider som aktuelt, usikkert rapportgrunnlag.
 */
export async function enrichImportWithLocalVisual(outcome: DocumentImport, bytes: Uint8Array, options: { deadlineMs?: number } = {}): Promise<DocumentImport> {
  const started = performance.now()
  const inReport = (pdfPage: number) => outcome.sections.some(section => pdfPage >= section.startPage && pdfPage <= section.endPage)
    || (outcome.role === 'report' && outcome.sections.length === 0)
  const reportPages = outcome.pages.filter(page => inReport(page.pdfPage))
  // Bevar tekstbaserte importer/replay. Grafiske/rasterbaserte og ufullstendige
  // sider krever en separat lesemåte; tekststatusen deres oppgraderes aldri.
  if (!reportPages.some(page => page.rasterUnprocessed || !['readable', 'blank'].includes(page.status)
    || outcome.manifest?.candidates.some(candidate => candidate.pdfPage === page.pdfPage && candidate.disposition === 'unresolved'))) {
    const result = withInterpretation(outcome)
    return Buffer.byteLength(JSON.stringify(result)) <= IMPORT_MAX_RESPONSE_BYTES ? result : outcome
  }
  // Ved tidsgrensen prioriteres detaljblokker før omslag og rapportvedlegg.
  // Samtlige sider beholdes i sidekartet, også de som ikke blir ferdig lest.
  const supplement = new Set(pagesNeedingVisualSupplement(outcome).map(page => page.pdfPage))
  const ordered = reportPages.filter(page => supplement.has(page.pdfPage)).sort((a, b) => Number(/Vurdering av avvik|^Beskrivelse/imu.test(b.text)) - Number(/Vurdering av avvik|^Beskrivelse/imu.test(a.text)) || a.pdfPage - b.pdfPage)
  const remainingBytes = Math.max(0, IMPORT_MAX_RESPONSE_BYTES - Buffer.byteLength(JSON.stringify(outcome)))
  const evidence = await extractLocalVisualEvidence(bytes, outcome.reportHash, outcome.documentName, ordered.map(page => page.pdfPage), {
    deadlineMs: Math.max(0, (options.deadlineMs ?? 35_000) - (performance.now() - started)), maxOutputBytes: Math.floor(remainingBytes / 3),
  })
  // Keep the complete report overview, including pages deliberately read only
  // through digital text. Skipping OCR can never certify graphical coverage.
  for (const page of reportPages) if (!supplement.has(page.pdfPage)) evidence.pages.push({ pdfPage: page.pdfPage,
    width: 1, height: 1, rasterDigest: null, lines: [], symbols: [],
    error: 'Digitalt tekstlag er beholdt. Siden er ikke bildekontrollert; eventuelt grafisk innhold må kontrolleres i originalen.' })
  evidence.pages.sort((a, b) => a.pdfPage - b.pdfPage)
  return fitVisualEvidence(outcome, evidence)
}

/** Valgfri bildeanalyse skal ikke fortrenge en ellers brukbar tekstimport.
 * Hele sideposter utelates med begrunnelse; belegg kuttes aldri midt i en side.
 */
export function fitVisualEvidence(outcome: DocumentImport, evidence: LocalVisualEvidence, maxBytes = IMPORT_MAX_RESPONSE_BYTES): DocumentImport {
  const budget = Math.min(maxBytes, IMPORT_MAX_RESPONSE_BYTES)
  const limited = structuredClone(evidence)
  let result = withInterpretation(addVisualTechnical(outcome, limited))
  while (Buffer.byteLength(JSON.stringify(result)) > budget) {
    // Bevar originalbelegg før valgfri planmetadata ved en trang svargrense.
    const evidenceOnly = addVisualTechnical(outcome, limited)
    if (Buffer.byteLength(JSON.stringify(evidenceOnly)) <= budget) return evidenceOnly
    const largest = limited.pages.filter(page => page.rasterDigest !== null).sort((a, b) => Buffer.byteLength(JSON.stringify(b)) - Buffer.byteLength(JSON.stringify(a)))[0]
    if (!largest) {
      const fallback = structuredClone(outcome)
      fallback.coverage.technical.status = 'incomplete'; fallback.technical.status = 'blocked'
      if (fallback.coverage.technical.reasons.length < 100) {
        fallback.coverage.technical.reasons.push('Lokal bildeanalyse fikk ikke plass i svarbudsjettet. Alle rapportsider må kontrolleres i originalen.')
        const prepared = withInterpretation(fallback)
        if (Buffer.byteLength(JSON.stringify(prepared)) <= budget) return prepared
        if (Buffer.byteLength(JSON.stringify(fallback)) <= budget) return DocumentImportSchema.parse(fallback)
      }
      // Ingen ekstra metadata får plass. Det opprinnelige tekstgrunnlaget
      // beholder sine kilder og dekningsbegrunnelser; det kuttes ikke for OCR.
      return outcome
    }
    Object.assign(largest, { width: 1, height: 1, rasterDigest: null, lines: [], symbols: [], error: 'Bildebelegget fikk ikke plass i importens samlede svarbudsjett; siden er ikke bildekontrollert.' })
    result = withInterpretation(addVisualTechnical(outcome, limited))
  }
  return result
}
