import { createHash } from 'node:crypto'
import type { DocumentImport, PdfSource } from '../../contracts/document-import.ts'
import type { RiskAnalysis, RiskFinding } from '../../contracts/property-risk.ts'
import type { ImportBasis } from './local-plan.ts'

const identifier = (basis: ImportBasis, page: number, start: number, kind: string) =>
  createHash('sha256').update(`${basis.hash}:${page}:${start}:${kind}`).digest('hex').slice(0, 24)

function source(basis: ImportBasis, pdfPage: number, start: number, end: number): PdfSource {
  const page = basis.pages[pdfPage - 1]!
  return { documentHash: basis.hash, documentName: basis.name, pdfPage, start, end,
    quote: page.text.slice(start, end), printedPage: null, method: 'pdf-text' }
}

const unexaminedPattern = /hulltaking er ikke foretatt|(?:er |har )?ikke (?:vært )?undersøkt|ikke (?:er )?tilgjengelig for (?:kontroll|inspeksjon|undersøkelse)|uten mulighet for inspeksjon/i
/** Classification of retained wording, never a technical diagnosis. */
export function deviationStatus(description: string): RiskFinding['status'] | null {
  const statements = description.split(/(?<=[.!?])\s+|\r?\n|[,;]\s*men\s+|\s+men\s+/u)
    .map(text => text.replace(/^[•*−\s-]+/u, '').trim()).filter(Boolean)
  const observed = statements.filter(text => !/^(?:det (?:er|ble) )?ikke (?:påvist|registrert|avdekket|observert|funnet)\b|^ingen (?:avvik|feil|skader|lekkasje|fukt)(?:\b|[.!])/i.test(text))
  const problems = observed.filter(text => !unexaminedPattern.test(text))
  if (!problems.length) return observed.length ? 'not-investigated' : null
  return problems.every(text => /\bmulig(?:e)?\b|kan (?:være|forekomme)|kan ikke utelukkes|risiko for|mistanke om/i.test(text)) ? 'possible' : 'documented'
}

/** These formats bind a named component, explicit grade and deviation together.
 * A legend, a summary count, or nearby graphic never supplies the grade. */
export function extractExplicitTechnicalFindings(basis: ImportBasis): DocumentImport['technical']['findings'] {
  const findings: DocumentImport['technical']['findings'] = []
  const patterns = [
    /^[ \t]*Tilstandsgrad[ \t]*:[ \t]*T[ \t]*G[ \t]*([23])[ \t]*\r?\nBygningsdel[ \t]*:[ \t]*([^\r\n]+)\r?\n([^\r\n]+)(?:\r?\n|$)/gim,
    /^[ \t]*Bygningsdel[ \t]*:[ \t]*([^\r\n]+)\r?\n[ \t]*Tilstandsgrad[ \t]*:[ \t]*(?:T[ \t]*G[ \t]*)?([23])[ \t]*\r?\n[ \t]*Vurdering av avvik[ \t]*:[ \t]*\r?\n([^\r\n]+)(?:\r?\n|$)/gim,
    /^[ \t]*([^\r\n:]{1,200}?)[ \t]+[-–—|][ \t]*TG[ \t]*([23])[ \t]*\r?\n[ \t]*Vurdering av avvik[ \t]*:[ \t]*\r?\n([^\r\n]+)(?:\r?\n|$)/gim,
  ]
  for (const page of basis.pages) {
    if (page.status !== 'readable') continue
    for (const [format, pattern] of patterns.entries()) for (const match of page.text.matchAll(pattern)) {
      const component = match[format === 0 ? 2 : 1]!.trim(), description = match[3]!.trim()
      if (!component || component.length > 200 || !description || match[0].length > 2000 || findings.length >= 200) continue
      if (deviationStatus(description) !== 'documented') continue
      const sources = [source(basis, page.pdfPage, match.index, match.index + match[0].length)]
      // A longer list remains a risk block and unresolved manifest text, rather
      // than pretending its first line represents a complete deviation.
      const following = page.text.slice(match.index + match[0].length).split(/\r?\n/, 1)[0] ?? ''
      if (/^[ \t]*[•*−-]/u.test(following) || !/[.!?][ \t]*$/u.test(description)) continue
      const findingId = 'local-technical-' + identifier(basis, page.pdfPage, match.index, 'explicit')
      const grade = `TG${match[format === 0 ? 1 : 2]}` as 'TG2' | 'TG3'
      const origin = { documentName: basis.name, reportHash: basis.hash, pdfPage: page.pdfPage }
      findings.push({ kind: 'checkable', findingId, conditionId: findingId, component, description, grade, sources,
        source: origin, original: { findingId, description, grade, source: origin, uncertainties: [] } })
    }
  }
  return findings
}

/** Local evidence discovery is always partial, independently of report confirmation.
 * Unknown layouts, graphical grades and page continuations are never certified. */
export function analyzeTechnicalRisks(basis: ImportBasis): RiskAnalysis {
  const findings: RiskFinding[] = []
  const examinedPages: number[] = [], unreadPages: number[] = []
  const longPages = new Set<number>()
  const unexaminedBlocks: { page: number; start: number; end: number }[] = []
  const explicitFindings = extractExplicitTechnicalFindings(basis)
  const limitations = [
    'Lokal analyse finner eksplisitte tekniske avvik og manglende undersøkelser. Den beviser ikke fullstendig TG2/TG3-dekning.',
    'Grafiske grader, tabeller, sammendrag og fortsettelser må kontrolleres i originalrapporten. Ukjent grad er ikke TG0.',
  ]
  const add = (page: number, start: number, end: number, status: RiskFinding['status'], title: string, description: string, grade: RiskFinding['grade'] = null) => {
    if (findings.length >= 200) {
      if (!limitations.includes('Grensen på 200 lokale tekniske risikofunn er nådd; ytterligere forhold er ikke undersøkt.')) limitations.push('Grensen på 200 lokale tekniske risikofunn er nådd; ytterligere forhold er ikke undersøkt.')
      return
    }
    const partial = basis.pages[page - 1]!.status !== 'readable'
    findings.push({ id: 'technical-' + identifier(basis, page, start, status), domain: 'technical', category: 'technical', status: partial ? 'possible' : status,
      grade: partial ? null : grade, title, description: partial ? `Ufullstendig og ukontrollert tekstuttrekk: ${description}`.slice(0, 2000) : description,
      sourceQuality: partial ? 'partial-text' : 'readable-text',
      consequence: partial ? 'Mulig forhold fra bevart tekst. Sideinnholdet kunne ikke leses fullstendig og pålitelig; funnet og eventuell grad er ikke avklart.' : status === 'not-investigated' ? 'Tilstanden i dette området er ikke avklart ved undersøkelsen.' : 'Forholdet kan påvirke vedlikeholdsbehov og bruk; omfang og kostnad er ikke avklart.',
      action: partial ? 'Kontroller original PDF-side før forholdet eller en tilstandsgrad legges til grunn. Ufullstendig tekst er ikke et bekreftet TG-funn.' : status === 'not-investigated' ? 'Avklar behov for videre undersøkelse med bygningssakkyndig.' : 'Kontroller hele avviket, tilstandsgraden og foreslåtte tiltak i originalrapporten.', sources: [source(basis, page, start, end)] })
  }
  for (const page of basis.pages) {
    if (!['readable', 'blank'].includes(page.status) || page.rasterUnprocessed) unreadPages.push(page.pdfPage)
    if (!['readable', 'unknown', 'incomplete'].includes(page.status) || !page.text.trim()) continue
    examinedPages.push(page.pdfPage)
    for (const match of page.text.matchAll(/Vurdering av avvik[ \t]*:[ \t]*(?:\r?\n)?/gi)) {
      const bodyStart = match.index + match[0].length
      const rest = page.text.slice(bodyStart)
      const ending = rest.search(/\r?\n[ \t]*(?:Konsekvens\s*\/\s*tiltak|Beskrivelse|Årstall[ \t]*:|Oppdragsnr\.?[ \t]*:|Tilstandsrapport|Vurdering av avvik[ \t]*:)/i)
      const rawEnd = ending < 0 ? page.text.length : bodyStart + ending
      let end = rawEnd
      // Keep the first bounded source intact. Overflow remains a visible limit;
      // no truncated quote is represented as the complete deviation.
      if (end - match.index > 1900) {
        end = page.text.lastIndexOf('\n', match.index + 1900)
        longPages.add(page.pdfPage)
        if (end <= bodyStart) continue
      }
      const description = page.text.slice(bodyStart, end).trim()
      if (!description || !/[\p{L}]/u.test(description)) continue
      const status = deviationStatus(description)
      if (status === null) continue
      const explicit = explicitFindings.find(finding => finding.sources.some(item => item.pdfPage === page.pdfPage && item.start <= match.index && item.end >= bodyStart))
      const title = status === 'not-investigated' ? 'Undersøkelse mangler' : explicit?.component ?? description.split(/\r?\n/, 1)[0]!.replace(/^[•*−\s-]+/u, '').slice(0, 140)
      if (status === 'not-investigated') unexaminedBlocks.push({ page: page.pdfPage, start: match.index, end })
      add(page.pdfPage, match.index, end, status, title, description.slice(0, 2000), explicit?.grade ?? null)
    }
    for (const match of page.text.matchAll(/[^\r\n]*(?:hulltaking er ikke foretatt|(?:er |har )?ikke (?:vært )?undersøkt|ikke (?:er )?tilgjengelig for (?:kontroll|inspeksjon|undersøkelse)|uten mulighet for inspeksjon)[^\r\n]*/gi)) {
      const description = match[0].trim()
      if (unexaminedBlocks.some(block => block.page === page.pdfPage && match.index >= block.start && match.index < block.end)) continue
      if (!description || match[0].length > 2000 || /(?:BYGNINGSSAKKYNDIGE SER|TILSTANDSGRAD|TG IU|KONSTRUKSJONER SOM IKKE ER UNDERSØKT|IKKE UNDERSØKT\/IKKE TILGJENGELIG)/i.test(description)) continue
      add(page.pdfPage, match.index, match.index + match[0].length, 'not-investigated', 'Undersøkelse mangler', description)
    }
  }
  for (const finding of explicitFindings) {
    if (findings.some(item => item.sources.some(itemSource => finding.sources.some(findingSource => itemSource.pdfPage === findingSource.pdfPage && itemSource.start >= findingSource.start && itemSource.start < findingSource.end)))) continue
    const first = finding.sources[0]!
    add(first.pdfPage, first.start, first.end, 'documented', finding.component, finding.description, finding.grade)
  }
  if (longPages.size) limitations.push(`Avviksbeskrivelser på fysisk PDF-side ${[...longPages].join(', ')} er for lange for komplett lokal tolkning; kontroller originalen.`)
  if (unreadPages.length) limitations.push('Uleste eller ufullstendige sider og sider med ubehandlet raster gir uavklart teknisk dekning.')
  if (findings.some(finding => finding.sourceQuality === 'partial-text')) limitations.push('Mulige funn fra bevart, ufullstendig tekst er ukontrollerte kandidater. De bekrefter verken avvik, tilstandsgrad eller fullstendig lesing av siden.')
  if (basis.attachments.length) limitations.push('Vedlegg er ikke undersøkt av den lokale risikoanalysen.')
  return { method: 'local-rules-1', coverage: examinedPages.length ? 'partial' : 'unavailable', examinedPages, unreadPages, findings, limitations: [...new Set(limitations)] }
}
