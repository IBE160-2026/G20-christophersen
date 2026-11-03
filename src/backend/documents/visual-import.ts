import { DocumentImportSchema, IMPORT_MAX_RESPONSE_BYTES, type DocumentImport } from '../../contracts/document-import.ts'
import type { LocalVisualEvidence } from '../../contracts/local-visual.ts'
import { extractLocalVisualEvidence } from './local-visual-ocr.ts'
import { addVisualTechnical } from '../import/visual-technical.ts'

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
    || outcome.manifest?.candidates.some(candidate => candidate.pdfPage === page.pdfPage && candidate.disposition === 'unresolved'))) return outcome
  // Ved tidsgrensen prioriteres detaljblokker før omslag og rapportvedlegg.
  // Samtlige sider beholdes i sidekartet, også de som ikke blir ferdig lest.
  const ordered = [...reportPages].sort((a, b) => Number(/Vurdering av avvik/iu.test(b.text)) - Number(/Vurdering av avvik/iu.test(a.text)) || a.pdfPage - b.pdfPage)
  const remainingBytes = Math.max(0, IMPORT_MAX_RESPONSE_BYTES - Buffer.byteLength(JSON.stringify(outcome)))
  const evidence = await extractLocalVisualEvidence(bytes, outcome.reportHash, outcome.documentName, ordered.map(page => page.pdfPage), {
    deadlineMs: Math.max(0, (options.deadlineMs ?? 35_000) - (performance.now() - started)), maxOutputBytes: Math.floor(remainingBytes / 3),
  })
  evidence.pages.sort((a, b) => a.pdfPage - b.pdfPage)
  return fitVisualEvidence(outcome, evidence)
}

/** Valgfri bildeanalyse skal ikke fortrenge en ellers brukbar tekstimport.
 * Hele sideposter utelates med begrunnelse; belegg kuttes aldri midt i en side.
 */
export function fitVisualEvidence(outcome: DocumentImport, evidence: LocalVisualEvidence, maxBytes = IMPORT_MAX_RESPONSE_BYTES): DocumentImport {
  const budget = Math.min(maxBytes, IMPORT_MAX_RESPONSE_BYTES)
  const limited = structuredClone(evidence)
  let result = addVisualTechnical(outcome, limited)
  while (Buffer.byteLength(JSON.stringify(result)) > budget) {
    const largest = limited.pages.filter(page => page.rasterDigest !== null).sort((a, b) => Buffer.byteLength(JSON.stringify(b)) - Buffer.byteLength(JSON.stringify(a)))[0]
    if (!largest) {
      const fallback = structuredClone(outcome)
      fallback.coverage.technical.status = 'incomplete'; fallback.technical.status = 'blocked'
      if (fallback.coverage.technical.reasons.length < 100) {
        fallback.coverage.technical.reasons.push('Lokal bildeanalyse fikk ikke plass i svarbudsjettet. Alle rapportsider må kontrolleres i originalen.')
        if (Buffer.byteLength(JSON.stringify(fallback)) <= budget) return DocumentImportSchema.parse(fallback)
      }
      // Ingen ekstra metadata får plass. Det opprinnelige tekstgrunnlaget
      // beholder sine kilder og dekningsbegrunnelser; det kuttes ikke for OCR.
      return outcome
    }
    Object.assign(largest, { width: 1, height: 1, rasterDigest: null, lines: [], symbols: [], error: 'Bildebelegget fikk ikke plass i importens samlede svarbudsjett; siden er ikke bildekontrollert.' })
    result = addVisualTechnical(outcome, limited)
  }
  return result
}
