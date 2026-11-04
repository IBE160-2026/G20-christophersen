import Big from 'big.js'
import { commonCostContent } from '../../domain/common-cost-content.ts'
import type { EconomyField, PdfSource } from '../../contracts/document-import.ts'
import type { ImportBasis } from './local-plan.ts'
import { parseNorwegianMoney } from './norwegian-money.ts'
const Decimal = Big(); Decimal.strict = true
const validDate = (value: string) => {
  if (!/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(value)) return false
  const [day, month, year] = value.split('.').map(Number)
  const date = new Date(Date.UTC(year!, month! - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month! - 1 && date.getUTCDate() === day
}
/** Narrow, source-bound prose grammar. No absence-to-zero inference. */
export function enrichExplicitEconomy(basis: ImportBasis, fields: EconomyField[], source: (page: number, start: number, end: number) => PdfSource) {
  const debt = fields.find(field => field.id === 'sharedDebt')!, common = fields.find(field => field.id === 'commonCosts')!
  const zero: PdfSource[] = [], corroboration: PdfSource[] = [], adverse: PdfSource[] = []
  const compositions: { sources: PdfSource[]; amounts: string[] }[] = []
  for (const page of basis.pages.filter(page => page.status === 'readable')) {
    for (const match of page.text.matchAll(/Seksjonen har ingen gjeld per\.?[ \t]{0,80}([\d.]{1,40})(?![\d.\p{L}])/giu)) {
      const evidence = source(page.pdfPage, match.index, match.index + match[0].length)
      ;(validDate(match[1]!.replace(/\.$/, '')) ? zero : adverse).push(evidence)
    }
    for (const match of page.text.matchAll(/Ingen lån registrert for sameiet\./gi)) corroboration.push(source(page.pdfPage, match.index, match.index + match[0].length))
    for (const match of page.text.matchAll(/(?:Seksjonen har (?!ingen gjeld per\.?\s*\d)[^\n.]{0,120}(?:gjeld|lån)[^\n.]{0,120}|(?:Fellesgjeld|Sameiet har (?:gjeld|lån))[^\n]{0,120}(?:ukjent|uavklart|ikke oppgitt|kr\.?\s*\d)[^\n]{0,80}|(?:Fellesgjeld|Felleskostnader)[^\n]{0,50}-\s*\d[^\n]{0,80})/gi)) adverse.push(source(page.pdfPage, match.index, match.index + match[0].length))
    for (const match of page.text.matchAll(/Sameiet har (?:gjeld|lån)[^\n.]{0,200}/gi)) adverse.push(source(page.pdfPage, match.index, match.index + match[0].length))
    const pattern = /Inkluderer:[ \t]*Felleskostnader:[ \t]*(\d[\d \u00a0]*,[-–‑])\s*\nInternett:[ \t]*(\d[\d \u00a0]*,[-–‑])\s*\nA-konto fyring:[ \t]*(\d[\d \u00a0]*,[-–‑])/gi
    for (const match of page.text.matchAll(pattern)) {
      const amounts = match.slice(1).map(value => parseNorwegianMoney(value!).amount)
      if (match[0].length <= 2000 && amounts.every((amount): amount is string => amount !== null)) compositions.push({ amounts, sources: [source(page.pdfPage, match.index, match.index + match[0].length)] })
    }
    for (const match of page.text.matchAll(/Felleskostnadene (?:inkluderer|inkluderer ikke|ekskluderer)[^.]{0,900}\./gi)) {
      const evidence = source(page.pdfPage, match.index, match.index + match[0].length)
      common.sources.push(evidence)
    }
    for (const match of page.text.matchAll(/(?:Det er målere[\s\S]{0,300}?avregnes[\s\S]{0,100}?31\.12\.|[^\n]{0,100}(?:gjeldsandel|rentedel)[^\n]{0,100})/gi)) {
      common.sources.push(source(page.pdfPage, match.index, match.index + match[0].length))
      if (/gjeldsandel|rentedel/i.test(match[0])) common.status = 'conflict'
    }
  }
  if (commonCostContent(common.sources.map(item => item.quote)).conflict) common.status = 'conflict'
  if (zero.length && corroboration.length) {
    if (debt.amount !== null && debt.amount !== '0') debt.status = 'conflict'
    else if (debt.status !== 'conflict' && !adverse.length) Object.assign(debt, { amount: '0', status: 'available', nature: 'fact', originalText: zero[0]!.quote })
    debt.sources.push(...zero, ...corroboration)
  }
  if (adverse.length) {
    debt.sources.push(...adverse)
    debt.status = 'conflict'
  }
  if (compositions.length) {
    common.sources.push(...compositions.flatMap(item => item.sources))
    const consistent = common.amount !== null && compositions.every(item => item.amounts.reduce((sum, amount) => sum.plus(amount), new Decimal('0')).eq(common.amount!)
      && item.amounts.every((amount, index) => amount === compositions[0]!.amounts[index]))
    if (!consistent) common.status = 'conflict'
    else {
      // These are explanatory children. Only the recurring parent is summed.
      for (const [index, label] of ['Felleskostnader – grunndel', 'Internett', 'A-konto fyring'].entries()) fields.push({ ...common, id: ['commonCostsBase', 'commonCostsInternet', 'commonCostsHeating'][index]!, label, category: 'informational', amount: compositions[0]!.amounts[index]!, includedIn: 'commonCosts', sources: compositions.flatMap(item => item.sources), alternatives: [], originalText: compositions[0]!.sources[0]!.quote })
      if (common.status === 'available' && common.period === 'month' && debt.status === 'available' && debt.amount === '0') { common.includedIn = ''; common.debtPart = '0' }
    }
  }
  for (const field of fields) if (field.status === 'conflict' && field.alternatives.length === 0 && field.sources.length) field.alternatives.push({ amount: null, source: field.sources.at(-1)! })
  for (const field of fields) field.sources = field.sources.filter((item, index, items) => items.findIndex(other => other.pdfPage === item.pdfPage && other.start === item.start && other.end === item.end) === index).slice(0, 12)
}
