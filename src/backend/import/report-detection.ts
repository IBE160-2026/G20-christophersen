import type { DocumentImport, PdfSource } from '../../contracts/document-import.ts'
import type { ImportBasis } from './local-plan.ts'

type Evidence = { pdfPage: number; start: number; end: number }
type Cover = Evidence & { explicit: boolean; closing: boolean }
type Numbering = Evidence & { number: number; total: number; assignment: string | null }

const available = (page: ImportBasis['pages'][number]) => ['readable', 'unknown', 'incomplete'].includes(page.status) && Boolean(page.text.trim())
const safe = (page: ImportBasis['pages'][number]) => page.status === 'readable' && !page.rasterUnprocessed
const assignment = (text: string) => {
  const forward = text.match(/Oppdragsnr\.?[ \t]*:[ \t]*([\p{L}\p{N}][\p{L}\p{N}/-]{2,60})/iu)
  const backward = text.match(/([\p{L}\p{N}][\p{L}\p{N}/-]{2,60})[ \t]*Oppdragsnr\.?[ \t]*:/iu)
  return forward?.[1] && !/^(?:Side|Befaringsdato|Rapportdato)$/i.test(forward[1]) ? forward[1] : backward?.[1] ?? null
}
const source = (basis: ImportBasis, item: Evidence): PdfSource => ({
  documentHash: basis.hash, documentName: basis.name, pdfPage: item.pdfPage,
  start: item.start, end: item.end, quote: basis.pages[item.pdfPage - 1]!.text.slice(item.start, item.end),
  printedPage: null, method: 'pdf-text',
})

/** Rapportgrenser er strukturelle kandidater. Ukjent tekst og raster blir
 * aldri oppgradert ved hjelp av rapportnavn, paginering eller opplastingsrolle. */
export function detectReportSections(basis: ImportBasis): DocumentImport['sections'] {
  const covers: Cover[] = [], numbering: Numbering[] = []
  for (const page of basis.pages) {
    if (!available(page)) continue
    for (const match of page.text.matchAll(/^[^\r\n]{0,200}?(?:TILSTANDSRAPPORT|BOLIGSALGSRAPPORT)(?:[ \t]*[-–:][ \t]*(START|SLUTT))?[ \t]*[^\r\n]*$/gim)) {
      if (match[0].length > 2000 || /innholdsfortegnelse/i.test(page.text)) continue
      const explicit = Boolean(match[1]) && /^[ \t]*(?:FIKTIV SEPARAT )?(?:TILSTANDSRAPPORT|BOLIGSALGSRAPPORT)/i.test(match[0])
      const closing = explicit && match[1]?.toUpperCase() === 'SLUTT'
      // Omtale i løpende tekst og gjentatte rapportfootere er ikke omslag.
      const heading = /^[ \t]*(?:FIKTIV SEPARAT )?(?:TILSTANDSRAPPORT|BOLIGSALGSRAPPORT)[ \t]*$/i.test(match[0])
        || /^[ \t]*[\p{Lu}\p{N} .,’'/-]*\d{4}(?:Tilstandsrapport|Boligsalgsrapport)[ \t]*$/u.test(match[0])
      const metadata = assignment(page.text) && /Befaringsdato|Rapportdato/i.test(page.text)
      if (!explicit && !(heading && metadata) && !(heading && basis.role === 'report' && page.pdfPage === 1)) continue
      covers.push({ pdfPage: page.pdfPage, start: match.index, end: match.index + match[0].length, explicit, closing })
    }
    for (const match of page.text.matchAll(/Side[ \t]*:?[ \t]*(\d{1,3})[ \t]+av[ \t]+(\d{1,3})(?!\d)/gi)) {
      const number = Number(match[1]), total = Number(match[2])
      if (number < 1 || total < number || total > 200) continue
      numbering.push({ pdfPage: page.pdfPage, start: match.index, end: match.index + match[0].length, number, total, assignment: assignment(page.text) })
    }
  }
  const explicitStarts = covers.filter(item => item.explicit && !item.closing)
  const explicitEnds = covers.filter(item => item.closing)
  const candidates: DocumentImport['sections'] = explicitStarts.slice(0, 10).map((start, index) => {
    const next = explicitStarts[index + 1]
    const ends = explicitEnds.filter(end => (end.pdfPage > start.pdfPage || end.pdfPage === start.pdfPage && end.start > start.start)
      && (!next || end.pdfPage < next.pdfPage || end.pdfPage === next.pdfPage && end.start < next.start))
    const end = ends.length === 1 ? ends[0] : undefined
    const endPage = end?.pdfPage ?? (next ? Math.max(start.pdfPage, next.pdfPage - 1) : basis.pages.length)
    const certain = Boolean(end) && explicitStarts.length === 1 && explicitEnds.length === 1
      && basis.pages.slice(start.pdfPage - 1, endPage).every(safe)
    return { documentHash: basis.hash, startPage: start.pdfPage, endPage, certainty: certain ? 'certain' : 'ambiguous',
      basis: [source(basis, start), ...(end ? [source(basis, end)] : [])] }
  })
  for (const cover of covers.filter(item => !item.explicit && !item.closing)) {
    // Rapportfootere kan inneholde både tittel og metadata. Bare et omslag
    // som stemmer med beregnet side én, kan starte en paginert rapport.
    const id = assignment(basis.pages[cover.pdfPage - 1]!.text)
    const ownNumbers = numbering.filter(item => item.pdfPage === cover.pdfPage)
    if (ownNumbers.some(item => item.number !== 1)) continue
    const runs = numbering.filter(item => item.pdfPage - item.number + 1 === cover.pdfPage && item.assignment === id && id !== null)
    const totals = [...new Set(runs.map(item => item.total))]
    const total = totals.length === 1 ? totals[0]! : null
    const endPage = total ? Math.min(cover.pdfPage + total - 1, basis.pages.length) : basis.pages.length
    const completeNumbers = total !== null && cover.pdfPage + total - 1 <= basis.pages.length
      && Array.from({ length: total - 1 }, (_, index) => index + 2).every(number => {
        const entries = numbering.filter(item => item.pdfPage === cover.pdfPage + number - 1)
        return entries.length === 1 && entries[0]!.number === number && entries[0]!.total === total && entries[0]!.assignment === id
      }) && (!ownNumbers.length || ownNumbers.length === 1 && ownNumbers[0]!.total === total && ownNumbers[0]!.assignment === id)
    const evidence: Evidence[] = [cover, ...runs.slice(0, 1), ...runs.slice(-1)]
    const unique = [...new Map(evidence.map(item => [`${item.pdfPage}:${item.start}:${item.end}`, item])).values()]
    candidates.push({ documentHash: basis.hash, startPage: cover.pdfPage, endPage,
      certainty: completeNumbers && basis.pages.slice(cover.pdfPage - 1, endPage).every(safe) ? 'certain' : 'ambiguous',
      basis: unique.map(item => source(basis, item)) })
  }
  const unique = [...new Map(candidates.map(item => [`${item.startPage}:${item.endPage}`, item])).values()].slice(0, 10)
  // Flere rapporter krever eksplisitt valg/avstemming i eksisterende port.
  return unique.length > 1 ? unique.map(item => ({ ...item, certainty: 'ambiguous' })) : unique
}
