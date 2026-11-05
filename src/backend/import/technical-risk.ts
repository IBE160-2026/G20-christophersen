import { createHash } from 'node:crypto'
import type { DocumentImport, PdfSource } from '../../contracts/document-import.ts'
import type { RiskAnalysis, RiskFinding } from '../../contracts/property-risk.ts'
import type { ImportBasis } from './local-plan.ts'
import { extractTechnicalSummary, isTechnicalComponent, technicalLines } from './technical-summary.ts'

const identifier = (basis: ImportBasis, page: number, start: number, kind: string) =>
  createHash('sha256').update(`${basis.hash}:${page}:${start}:${kind}`).digest('hex').slice(0, 24)

function source(basis: ImportBasis, pdfPage: number, start: number, end: number): PdfSource {
  const page = basis.pages[pdfPage - 1]!
  return { documentHash: basis.hash, documentName: basis.name, pdfPage, start, end,
    quote: page.text.slice(start, end), printedPage: null, method: 'pdf-text' }
}

const unexaminedPattern = /hulltaking er ikke foretatt|(?:er |har )?ikke (?:vært )?undersøkt|ikke (?:er )?tilgjengelig for (?:kontroll|inspeksjon|undersøkelse)|uten mulighet for inspeksjon/i
/** Reuse a complete short source statement when it identifies what was not
 * inspected. Never invent a component or infer a condition grade. */
function unexaminedTitle(description: string, component?: string) {
  if (component) return `${component}: ikke undersøkt`
  const statement = description.replace(/\s+/gu, ' ').replace(/^[•*−\s-]+/u, '').trim()
  if (statement.length <= 160) return statement.replace(/[.!]$/u, '')
  return 'Undersøkelse mangler – se kildebeskrivelsen'
}
/** Classification of retained wording, never a technical diagnosis. */
export function deviationStatus(description: string): RiskFinding['status'] | null {
  const statements = description.replace(/\r?\n(?![ \t]*[•*−-])/gu, ' ').split(/(?<=[.!?])\s+|\r?\n|[,;]\s*men\s+|\s+men\s+/iu)
    .map(text => text.replace(/^[•*−\s-]+/u, '').trim()).filter(Boolean)
  const observed = statements.filter(text => !/^(?:det (?:er|ble) )?ikke (?:påvist|registrert|avdekket|observert|funnet)\b|^ingen (?:avvik|feil|skader|lekkasje|fukt)(?:\b|[.!])/i.test(text))
  const problems = observed.filter(text => !unexaminedPattern.test(text))
  if (!problems.length) return observed.length ? 'not-investigated' : null
  return problems.every(text => /\bmulig(?:e)?\b|kan (?:være|forekomme)|kan ikke utelukkes|risiko for|mistanke om/i.test(text)) ? 'possible' : 'documented'
}

/** Shared text boundaries: headings end a deviation, wrapped problem statements do not. */
export function readTechnicalDeviation(text: string, start: number, pdfPage: number) {
  const rest = text.slice(start)
  const boundary = technicalLines(rest, pdfPage).find(line =>
    /^(?:Konsekvens\s*\/\s*tiltak|Beskrivelse|Årstall[ \t]*:|Oppdragsnr\.?[ \t]*:|Tilstandsrapport|Vurdering av avvik[ \t]*:|Bygningsdel[ \t]*:|Tilstandsgrad[ \t]*:|(?:Uavklart )?oppsummering\b)/iu.test(line.text.trim()) || isTechnicalComponent(line.text))
  const end = boundary ? start + boundary.start : text.length
  return { end, bounded: Boolean(boundary), description: text.slice(start, end).trim() }
}

/** Sidekanter alene knytter aldri tekst sammen. Begge sider må navngi en
 * eksplisitt fortsettelse, og neste side må avslutte avviket før et tiltak. */
function readExplicitContinuation(basis: ImportBasis, pdfPage: number, start: number, bodyStart: number, component: string) {
  const page = basis.pages[pdfPage - 1]!, next = basis.pages[pdfPage]
  if (!next || next.status !== 'readable' || page.rasterUnprocessed || next.rasterUnprocessed) return null
  const first = page.text.slice(bodyStart)
  const footer = /\r?\n[ \t]*(?:Fortsetter på neste side|Fortsettelse på neste side)\.?[ \t]*(?:\r?\n)?$/iu.exec(first)
  if (!footer) return null
  const initial = first.slice(0, footer.index).trim()
  if (!initial || readTechnicalDeviation(initial, 0, pdfPage).bounded) return null
  const anchor = /^[ \t]*(?:Bygningsdel[ \t]*:[ \t]*)?([^\r\n]+?)[ \t]*\((?:forts\.?|fortsettelse)\)[ \t]*\r?\n[ \t]*Vurdering av avvik(?:[ \t]*\((?:forts\.?|fortsettelse)\))?[ \t]*:[ \t]*\r?\n/iu.exec(next.text)
  if (!anchor || anchor[1]!.trim().toLocaleLowerCase('nb-NO') !== component.toLocaleLowerCase('nb-NO')) return null
  const parsed = readTechnicalDeviation(next.text, anchor[0].length, next.pdfPage)
  if (!parsed.bounded || !/^Konsekvens\s*\/\s*tiltak/iu.test(next.text.slice(parsed.end).trimStart()) || !parsed.description) return null
  const description = initial + '\n' + parsed.description
  if (description.length > 2000 || page.text.length - start > 2000 || parsed.end > 2000
    || !/[.!?][ \t]*$/u.test(description) || deviationStatus(description) !== 'documented') return null
  return { description, sources: [source(basis, pdfPage, start, page.text.length), source(basis, next.pdfPage, 0, parsed.end)] }
}

/** These formats bind a named component, explicit grade and deviation together.
 * A legend, a summary count, or nearby graphic never supplies the grade. */
export function extractExplicitTechnicalFindings(basis: ImportBasis): DocumentImport['technical']['findings'] {
  const findings: DocumentImport['technical']['findings'] = []
  const patterns = [
    /^[ \t]*Tilstandsgrad[ \t]*:[ \t]*T[ \t]*G[ \t]*([23])[ \t]*\r?\nBygningsdel[ \t]*:[ \t]*([^\r\n]+)\r?\n(?:[ \t]*Vurdering av avvik[ \t]*:[ \t]*\r?\n)?/gim,
    /^[ \t]*Bygningsdel[ \t]*:[ \t]*([^\r\n]+)\r?\n[ \t]*Tilstandsgrad[ \t]*:[ \t]*(?:T[ \t]*G[ \t]*)?([23])[ \t]*\r?\n[ \t]*Vurdering av avvik[ \t]*:[ \t]*\r?\n/gim,
    /^[ \t]*([^\r\n:]{1,200}?)[ \t]+[-–—|][ \t]*TG[ \t]*([23])[ \t]*\r?\n[ \t]*Vurdering av avvik[ \t]*:[ \t]*\r?\n/gim,
  ]
  for (const page of basis.pages) {
    if (page.status !== 'readable') continue
    for (const [format, pattern] of patterns.entries()) for (const match of page.text.matchAll(pattern)) {
      const component = match[format === 0 ? 2 : 1]!.trim(), bodyStart = match.index + match[0].length
      const parsed = readTechnicalDeviation(page.text, bodyStart, page.pdfPage)
      const continuation = readExplicitContinuation(basis, page.pdfPage, match.index, bodyStart, component)
      const { end } = parsed, description = continuation?.description ?? parsed.description
      if (!component || component.length > 200 || !description || end - match.index > 2000 || findings.length >= 200) continue
      const legacy = !continuation && format === 0 && !/Vurdering av avvik/i.test(match[0]) && !description.includes('\n')
      if (deviationStatus(description) !== 'documented' || !/[.!?][ \t]*$/u.test(description) && !(legacy && parsed.bounded)) continue
      // Multiline prose needs an explicit ending. Page edges are not proof
      // that a continued deviation has ended.
      if (!continuation && !parsed.bounded && description.includes('\n')) continue
      if (findings.some(item => item.sources.some(itemSource => itemSource.pdfPage === page.pdfPage && itemSource.start === match.index))) continue
      const sourceEnd = legacy && page.text[end - 1] !== '\n' && page.text[end] === '\n' ? end + 1 : end
      const sources = continuation?.sources ?? [source(basis, page.pdfPage, match.index, sourceEnd)]
      const findingId = legacy ? 'local-' + createHash('sha256').update(`${basis.hash}:${page.pdfPage}:${match.index}`).digest('hex').slice(0, 24) : 'local-technical-' + identifier(basis, page.pdfPage, match.index, 'explicit')
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
  const add = (page: number, start: number, end: number, status: RiskFinding['status'], title: string, description: string, grade: RiskFinding['grade'] = null, component?: string, contextSources: PdfSource[] = []) => {
    if (findings.length >= 200) {
      if (!limitations.includes('Grensen på 200 lokale tekniske risikofunn er nådd; ytterligere forhold er ikke undersøkt.')) limitations.push('Grensen på 200 lokale tekniske risikofunn er nådd; ytterligere forhold er ikke undersøkt.')
      return
    }
    const partial = basis.pages[page - 1]!.status !== 'readable'
    findings.push({ id: 'technical-' + identifier(basis, page, start, status), domain: 'technical', category: 'technical', status: partial ? 'possible' : status,
      grade: partial ? null : grade, title, description: partial ? `Ufullstendig og ukontrollert tekstuttrekk: ${description}`.slice(0, 2000) : description,
      sourceQuality: partial ? 'partial-text' : 'readable-text', evidenceKind: 'detail', ...(component ? { component } : {}),
      consequence: partial ? 'Mulig forhold fra bevart tekst. Sideinnholdet kunne ikke leses fullstendig og pålitelig; funnet og eventuell grad er ikke avklart.' : status === 'not-investigated' ? 'Tilstanden i dette området er ikke avklart ved undersøkelsen.' : 'Forholdet kan påvirke vedlikeholdsbehov og bruk; omfang og kostnad er ikke avklart.',
      action: partial ? 'Kontroller original PDF-side før forholdet eller en tilstandsgrad legges til grunn. Ufullstendig tekst er ikke et bekreftet TG-funn.' : status === 'not-investigated' ? 'Avklar behov for videre undersøkelse med bygningssakkyndig.' : 'Kontroller hele avviket, tilstandsgraden og foreslåtte tiltak i originalrapporten.', sources: [source(basis, page, start, end), ...contextSources] })
  }
  for (const page of basis.pages) {
    if (!['readable', 'blank'].includes(page.status) || page.rasterUnprocessed) unreadPages.push(page.pdfPage)
    if (!['readable', 'unknown', 'incomplete'].includes(page.status) || !page.text.trim()) continue
    examinedPages.push(page.pdfPage)
    for (const match of page.text.matchAll(/Vurdering av avvik[ \t]*:[ \t]*(?:\r?\n)?/gi)) {
      const bodyStart = match.index + match[0].length
      let end = readTechnicalDeviation(page.text, bodyStart, page.pdfPage).end
      // Keep the first bounded source intact. Overflow remains a visible limit;
      // no truncated quote is represented as the complete deviation.
      if (end - match.index > 1900) {
        end = page.text.lastIndexOf('\n', match.index + 1900)
        longPages.add(page.pdfPage)
        if (end <= bodyStart) continue
      }
      const description = page.text.slice(bodyStart, end).trim()
      if (!description || !/[\p{L}]/u.test(description)) continue
      const explicit = explicitFindings.find(finding => finding.sources.some(item => item.pdfPage === page.pdfPage && item.start <= match.index && item.end >= bodyStart))
      // En eksplisitt videreført blokk er allerede samlet på startsiden.
      if (explicit && explicit.source.pdfPage !== page.pdfPage) continue
      const status = deviationStatus(explicit?.description ?? description)
      if (status === null) continue
      const contextStart = Math.max(0, match.index - 1200)
      const contextLines = technicalLines(page.text.slice(contextStart, match.index), page.pdfPage)
      const previousBoundary = Math.max(...contextLines.filter(line => /Vurdering av avvik|Konsekvens\s*\/\s*tiltak/iu.test(line.text)).map(line => line.start), -1)
      const roomPattern = /^[A-ZÆØÅ0-9 .-]+\s*>\s*[A-ZÆØÅ0-9 .-]+$/u
      const namedLine = [...contextLines].reverse().find(line => line.start > previousBoundary && !roomPattern.test(line.text.trim()) && isTechnicalComponent(line.text))
      const roomLine = namedLine && contextLines.find(line => line.start > previousBoundary && roomPattern.test(line.text.trim()))
      const namedContext = namedLine ? [roomLine?.text.trim(), namedLine.text.trim()].filter(Boolean).join(' · ') : undefined
      const component = explicit?.component ?? (namedContext && namedContext.length <= 200 ? namedContext : undefined)
      const contextSources = explicit ? explicit.sources : component && namedLine ? [namedLine, ...(roomLine ? [roomLine] : [])].map(line => source(basis, page.pdfPage, contextStart + line.start, contextStart + line.end)) : []
      const completeDescription = explicit?.sources.length && explicit.sources.length > 1 ? explicit.description : description
      const title = status === 'not-investigated' ? unexaminedTitle(completeDescription, component) : component ?? description.split(/\r?\n/, 1)[0]!.replace(/^[•*−\s-]+/u, '').slice(0, 140)
      if (status === 'not-investigated') unexaminedBlocks.push({ page: page.pdfPage, start: match.index, end })
      add(page.pdfPage, match.index, end, status, title, completeDescription.slice(0, 2000), explicit?.grade ?? null, component, contextSources)
    }
    for (const match of page.text.matchAll(/[^\r\n]*(?:hulltaking er ikke foretatt|(?:er |har )?ikke (?:vært )?undersøkt|ikke (?:er )?tilgjengelig for (?:kontroll|inspeksjon|undersøkelse)|uten mulighet for inspeksjon)[^\r\n]*/gi)) {
      const description = match[0].trim()
      if (unexaminedBlocks.some(block => block.page === page.pdfPage && match.index >= block.start && match.index < block.end)
        || explicitFindings.some(finding => finding.sources.length > 1 && finding.sources.some(item => item.pdfPage === page.pdfPage && match.index >= item.start && match.index < item.end))) continue
      if (!description || match[0].length > 2000 || /(?:BYGNINGSSAKKYNDIGE SER|TILSTANDSGRAD|TG\s*IU|KONSTRUKSJONER SOM IKKE ER UNDERSØKT|IKKE UNDERSØKT\/IKKE TILGJENGELIG)/i.test(description)
        || /^snødekket eller på annen måte utilgjengelige, blir ikke undersøkt\.?$/iu.test(description)) continue
      add(page.pdfPage, match.index, match.index + match[0].length, 'not-investigated', unexaminedTitle(description), description)
    }
  }
  for (const finding of explicitFindings) {
    if (findings.some(item => item.sources.some(itemSource => finding.sources.some(findingSource => itemSource.pdfPage === findingSource.pdfPage && itemSource.start >= findingSource.start && itemSource.start < findingSource.end)))) continue
    const first = finding.sources[0]!
    add(first.pdfPage, first.start, first.end, 'documented', finding.component, finding.description, finding.grade, finding.component, finding.sources.slice(1))
  }
  const summaries = extractTechnicalSummary(basis).flatMap(item => {
    const status = deviationStatus(item.description)
    return status === null ? [] : [{ ...item, status }]
  })
  const room = 200 - findings.length
  findings.push(...summaries.slice(0, room))
  if (summaries.length > room) limitations.push('Sammendragsfunn er begrenset av funngrensen; primære tekniske avvik er prioritert. Flere sammendragsopplysninger må kontrolleres i originalen.')
  if (findings.length >= 200) limitations.push('Grensen på 200 lokale tekniske risikofunn er nådd; ytterligere forhold er ikke undersøkt.')
  if (findings.some(item => item.evidenceKind === 'summary')) limitations.push('TG-grader fra salgsoppgavens sammendrag er sekundære opplysninger, ikke verifiserte rapportdetaljer. Sammendraget dokumenterer ikke full TG2/TG3-dekning.')
  if (longPages.size) limitations.push(`Avviksbeskrivelser på fysisk PDF-side ${[...longPages].join(', ')} er for lange for komplett lokal tolkning; kontroller originalen.`)
  if (unreadPages.length) limitations.push('Uleste eller ufullstendige sider og sider med ubehandlet raster gir uavklart teknisk dekning.')
  if (findings.some(finding => finding.sourceQuality === 'partial-text')) limitations.push('Mulige funn fra bevart, ufullstendig tekst er ukontrollerte kandidater. De bekrefter verken avvik, tilstandsgrad eller fullstendig lesing av siden.')
  if (basis.attachments.length) limitations.push('Vedlegg er ikke undersøkt av den lokale risikoanalysen.')
  return { method: 'local-rules-1', coverage: examinedPages.length ? 'partial' : 'unavailable', examinedPages, unreadPages, findings, limitations: [...new Set(limitations)] }
}
