import { sourceFor } from './local-plan.ts'
import type { ImportBasis } from './local-plan.ts'
import type { PdfSource } from '../../contracts/document-import.ts'

export type NorwegianMoney = { amount: string | null; minorUnits: string | null; ambiguity: string | null }
const unresolved = (ambiguity: string): NorwegianMoney => ({ amount: null, minorUnits: null, ambiguity })
/** Ren transkripsjon av norsk tallsyntaks. Ingen flyttall, avrunding eller avgiftsberegning. */
export function parseNorwegianMoney(raw: string): NorwegianMoney {
  if (!raw || raw !== raw.trim()) return unresolved('unsupported-syntax')
  if (/^[+\-\u2212\u2011\u2013\u2014]/u.test(raw)) return unresolved('signed-unsupported')
  if (/[%‰]/u.test(raw)) return unresolved('percentage-not-money')
  const wholeSuffix = /,[-\u2011\u2013]$/u.test(raw)
  const token = wholeSuffix ? raw.slice(0, -2) : raw
  if (/[/:\u2013\u2014]/u.test(token) || /^\d{1,2}\.\d{1,2}\.\d{2,4}$/u.test(raw) || /^\d{4}-\d{2}-\d{2}$/u.test(raw)) return unresolved('date-or-range-not-money')
  if (/[eE]/u.test(raw)) return unresolved('scientific-notation-unsupported')
  const ungrouped = /^\d+(?:,\d{1,2})?$/u.test(token)
  const spaceGrouped = /^\d{1,3}(?:[ \u00a0\u202f]\d{3})+(?:,\d{1,2})?$/u.test(token)
  const dotGrouped = /^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/u.test(token)
  if (!ungrouped && !spaceGrouped && !dotGrouped) return unresolved('unsupported-syntax')
  if (wholeSuffix && token.includes(',')) return unresolved('unsupported-syntax')
  if (dotGrouped && !wholeSuffix && !token.includes(',') && token.split('.').length === 2) return unresolved('ambiguous-single-dot-group')
  const normalized = token.replace(/[. \u00a0\u202f]/gu, '')
  const [integer = '', fraction = ''] = normalized.split(',')
  if (integer.length > 78) return unresolved('amount-too-long')
  const minorUnits = BigInt(integer) * 100n + BigInt(fraction.padEnd(2, '0'))
  const kronor = minorUnits / 100n, cents = minorUnits % 100n
  const amount = cents === 0n ? kronor.toString() : `${kronor}.${cents.toString().padStart(2, '0').replace(/0$/u, '')}`
  return { amount, minorUnits: minorUnits.toString(), ambiguity: null }
}

export type EconomyQualifier = { kind: 'vat-included' | 'vat-excluded' | 'vat' | 'quarter' | 'month' | 'year' | 'term' | 'date-range'; raw: string; source: PdfSource }
/** Bevarer eksplisitte kvalifikasjoner som egne kildespenn. De bindes ikke til et beløp ved gjetting. */
export function createEconomyQualifierCatalogue(basis: ImportBasis, selectedPages: number[]): EconomyQualifier[] {
  const result: EconomyQualifier[] = []
  const patterns: { kind: EconomyQualifier['kind']; expression: RegExp }[] = [
    { kind: 'vat-included', expression: /\b(?:inkl(?:udert)?\.?)\s*(?:mva\.?|merverdiavgift)\b/giu },
    { kind: 'vat-excluded', expression: /\b(?:eks(?:kl(?:udert)?)?\.?|eksklusive|uten)\s*(?:mva\.?|merverdiavgift)\b/giu },
    { kind: 'vat', expression: /\bmva\b|\bmerverdiavgift\w*|\bavgift(?:sgrunnlag|sbeløp|ssats)?\b|\d+(?:,\d+)?\s*%/giu },
    { kind: 'quarter', expression: /\bkvartal\w*/giu },
    { kind: 'month', expression: /(?:\bper|\bpr\.?|\/)\s*(?:måned|mnd)\b|\bmånedlig\b/giu },
    { kind: 'year', expression: /(?:\bper|\bpr\.?|\/)\s*år\b|(?<!\p{L})årlig(?!\p{L})/giu },
    { kind: 'term', expression: /\btermin\s*\d+(?:\s*[/-]\s*\d{4})?|\b\d+\.?\s*termin\b/giu },
    { kind: 'date-range', expression: /\b\d{1,2}\.\d{1,2}(?:\.\d{4})?\s*[-–—]\s*\d{1,2}\.\d{1,2}\.\d{4}\b/gu },
  ]
  for (const pdfPage of [...new Set(selectedPages)].sort((a, b) => a - b)) {
    const page = basis.pages[pdfPage - 1]
    if (!page || page.status !== 'readable') throw new Error('economy-selected-page-unreadable')
    for (const { kind, expression } of patterns) {
      for (const match of page.text.matchAll(expression)) result.push({ kind, raw: match[0], source: sourceFor(basis, pdfPage, match.index, match.index + match[0].length) })
    }
  }
  return result.sort((a, b) => a.source.pdfPage - b.source.pdfPage || a.source.start - b.source.start || a.kind.localeCompare(b.kind))
}

/** Alle numeriske kandidater i valgte sider; katalogen fastslår ikke at hvert tall er et pengebeløp. */
export function createEconomyMoneyCatalogue(basis: ImportBasis, selectedPages: number[]) {
  const candidates: ({ id: string; raw: string; source: PdfSource; kind: 'numeric-candidate' } & NorwegianMoney)[] = []
  for (const pdfPage of [...new Set(selectedPages)].sort((a, b) => a - b)) {
    const page = basis.pages[pdfPage - 1]
    if (!page || page.status !== 'readable') throw new Error('economy-selected-page-unreadable')
    // Hele tegnsekvensen konsumeres før validering: ugyldige tall gir aldri et gyldig prefiks/suffiks.
    const tokens = /(?<![\p{L}\d.,:/+\-\u2212\u2011\u2013\u2014])(?:[+\-\u2212\u2011\u2013\u2014]\s*)?\d+(?:(?:[.,:/–—+−eE%‰\u2011-]\d*)|(?:[ \u00a0\u202f]\d{3}(?!\d)))*(?:[ \u00a0\u202f]*[%‰])?(?![\p{L}\d]|[.,:/]\d)/gu
    // En feilgruppert sum rett ved kr/NOK må ikke tilby sikre delbeløp.
    // Bare heltallsgrupper før en eventuell siste desimalkomma undersøkes;
    // desimalkolonner på faktura blir dermed ikke slått sammen.
    const malformedGroups = [...page.text.matchAll(/(?<![\p{L}\d.,])\d+(?:[ \u00a0\u202f]+\d+)+(?:,\d{1,2})?(?![\d.,])/gu)].filter(match => {
      const before = page.text.slice(0, match.index), after = page.text.slice(match.index + match[0].length)
      return (/(?:\bkr\.?|\bNOK)[ \u00a0\u202f]*$/iu.test(before) || /^[ \u00a0\u202f]*(?:kr\b|NOK\b)/iu.test(after))
        && parseNorwegianMoney(match[0]).amount === null
    })
    for (const match of page.text.matchAll(tokens)) {
      let raw = match[0]
      // Et enkelt sluttpunktum er tegnsetting bare når resten allerede er et
      // gyldig norsk tall og neste tegn er setningsgrense. Ugyldige fortsettelser beholdes.
      if (raw.endsWith('.') && !raw.endsWith('..') && parseNorwegianMoney(raw.slice(0, -1)).amount !== null
        && /^(?:$|[ \t]*(?:\r\n|\r|\n)|\s+(?:\p{L}|$))/u.test(page.text.slice(match.index + raw.length))) raw = raw.slice(0, -1)
      // Årstall er ikke sikre pengebeløp; et pengebeløp med samme sifre må ha entydig kontekst.
      const currencyAdjacent = /(?:\bkr\.?|\bNOK)[ \u00a0\u202f]*$/iu.test(page.text.slice(0, match.index))
        || /^[ \u00a0\u202f]*(?:kr\b|NOK\b)/iu.test(page.text.slice(match.index + raw.length))
      const isYear = /^(?:19|20)\d{2}$/u.test(raw) && !currencyAdjacent
      const malformedGroup = malformedGroups.some(group => match.index >= group.index && match.index < group.index + group[0].length)
      const parsed = raw.length > 2000 ? unresolved('amount-too-long') : malformedGroup ? unresolved('malformed-currency-group') : isYear ? unresolved('possible-year-not-money') : parseNorwegianMoney(raw)
      if (raw.length > 2000) throw new Error('economy-numeric-token-too-long')
      candidates.push({ id: `v${candidates.length.toString(36)}`, raw, ...parsed, source: sourceFor(basis, pdfPage, match.index, match.index + raw.length), kind: 'numeric-candidate' })
    }
  }
  return candidates
}
