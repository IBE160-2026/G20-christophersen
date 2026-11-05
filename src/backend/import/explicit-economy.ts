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
  const municipal = fields.find(field => field.id === 'municipalFees')!, tax = fields.find(field => field.id === 'propertyTax')!
  const commonLists: PdfSource[] = [], taxInMunicipal: PdfSource[] = []
  const taxCandidates: { amount: string; evidence: PdfSource; supported: boolean }[] = []
  const optionalTotals: { amount: string; evidence: PdfSource }[] = [], proseTotals: { amount: string; evidence: PdfSource }[] = []
  const purchaseLedgers: { amount: string; taxAmount: string | null; evidence: PdfSource; valid: boolean }[] = []
  const record = (field: EconomyField, amount: string, period: EconomyField['period'], evidence: PdfSource) => {
    if (field.amount === null && field.status !== 'conflict') Object.assign(field, { amount, period, status: 'available', nature: 'fact', originalText: evidence.quote })
    else if (field.amount !== amount || field.period !== period) {
      field.status = 'conflict'
      field.alternatives.push({ amount, source: evidence })
    }
    field.sources.push(evidence)
  }
  for (const page of basis.pages.filter(page => page.status === 'readable')) {
    // A bounded cost ledger establishes inclusion only when every mandatory
    // row sums to its explicitly named total. Optional packages stay outside.
    const ledgerTotals = /^[ \t]*(?:(?:kr\.?|NOK)[ \t]*)?(\d[\d. \u00a0\u202f]*,[-–‑])[ \t]*\(Omkostninger totalt(?: ved prisantydning| \(uten [^()\r\n]{1,80}\))?\)[ \t]*$/gim
    for (const match of page.text.matchAll(ledgerTotals)) {
      const amount = parseNorwegianMoney(match[1]!).amount
      if (amount === null) continue
      const preceding = page.text.slice(Math.max(0, match.index - 1600), match.index)
      const heading = [...preceding.matchAll(/^[ \t]*Omkostninger:[ \t]*\r?\n/gim)].at(-1)
      if (!heading) continue
      const start = Math.max(0, match.index - 1600) + heading.index
      const bodyStart = start + heading[0].length
      const lines = page.text.slice(bodyStart, match.index).split(/\r?\n/).map(line => line.trim()).filter(line => line && !/^[-–—]+$/u.test(line))
      let sum = new Decimal('0'), taxAmount: string | null = null, valid = lines.length > 0
      for (const line of lines) {
        const row = /^(?:(?:kr\.?|NOK)[ \t]*)?(\d[\d. \u00a0\u202f]*,[-–‑])[ \t]*\((.{1,180})\)$/iu.exec(line)
        const rowAmount = row ? parseNorwegianMoney(row[1]!).amount : null
        if (!row || rowAmount === null) { valid = false; break }
        const optional = /valgfri(?:tt|e)?|boligkjøperpakke\*/iu.test(row[2]!)
        if (optional) { if (!/\(uten /iu.test(match[0])) valid = false; continue }
        sum = sum.plus(rowAmount)
        if (/^Dokumentavgift(?:\b|[ (])/iu.test(row[2]!)) {
          if (taxAmount !== null) valid = false
          taxAmount = rowAmount
        }
      }
      purchaseLedgers.push({ amount, taxAmount, evidence: source(page.pdfPage, start, match.index + match[0].length), valid: valid && sum.eq(amount) })
    }
    for (const match of page.text.matchAll(/Seksjonen har ingen gjeld per\.?[ \t]{0,80}([\d.]{1,40})(?![\d.\p{L}])/giu)) {
      const evidence = source(page.pdfPage, match.index, match.index + match[0].length)
      ;(validDate(match[1]!.replace(/\.$/, '')) ? zero : adverse).push(evidence)
    }
    for (const match of page.text.matchAll(/Ingen lån registrert for sameiet\./gi)) corroboration.push(source(page.pdfPage, match.index, match.index + match[0].length))
    for (const match of page.text.matchAll(/(?:Seksjonen har (?!ingen gjeld per\.?\s*\d)[^\n.]{0,120}(?:gjeld|lån)[^\n.]{0,120}|(?:Fellesgjeld|Sameiet har (?:gjeld|lån))[^\n]{0,120}(?:ukjent|uavklart|ikke oppgitt|kr\.?\s*\d)[^\n]{0,80}|(?:Fellesgjeld|Felleskostnader)[^\n]{0,50}-\s*\d[^\n]{0,80})/gim)) {
      // A complete labelled monetary entry has already been reconciled by the
      // amount grammar. Prose/unknown debt outside such entries stays adverse.
      const lineStart = page.text.lastIndexOf('\n', match.index) + 1
      const lineEnd = page.text.indexOf('\n', match.index)
      const line = page.text.slice(lineStart, lineEnd < 0 ? page.text.length : lineEnd)
      if (/^[ \t]*Totalpris inkl\.? omkostninger og fellesgjeld[ \t]+kr\.?[ \t]+\d[\d. \u00a0]*(?:,\d{1,2}|,[-–‑])?[ \t]*$/i.test(line)) continue
      if (!debt.sources.some(item => item.pdfPage === page.pdfPage && item.start <= match.index && item.end >= match.index + match[0].length)) adverse.push(source(page.pdfPage, match.index, match.index + match[0].length))
    }
    for (const match of page.text.matchAll(/Sameiet har (?:gjeld|lån)[^\n.]{0,200}/gi)) adverse.push(source(page.pdfPage, match.index, match.index + match[0].length))
    for (const match of page.text.matchAll(/Sameiet har ikke lån\./gi)) corroboration.push(source(page.pdfPage, match.index, match.index + match[0].length))
    for (const match of page.text.matchAll(/Kommunale avgifter utgjør kr\.?[ \t]*(\d[\d. \u00a0]*,[-–‑]) pr\. år\./gi)) {
      const amount = parseNorwegianMoney(match[1]!).amount
      if (amount !== null) record(municipal, amount, 'year', source(page.pdfPage, match.index, match.index + match[0].length))
    }
    for (const match of page.text.matchAll(/Eiendomsskatten er beregnet til kr\.?[ \t]*(\d[\d. \u00a0]*,[-–‑])[\s\S]{0,240}?i de kommunale avgiftene\./gi)) {
      const amount = parseNorwegianMoney(match[1]!).amount
      if (amount === null) continue
      const evidence = source(page.pdfPage, match.index, match.index + match[0].length)
      const supported = /inklud(?:ert|dert) i de kommunale avgiftene/i.test(match[0])
        && !/\b(?:ikke|ekskludert|måned|mnd|kvartal|termin|halvår|uke|dag)\b/i.test(match[0])
      taxCandidates.push({ amount, evidence, supported })
    }
    for (const match of page.text.matchAll(/^[ \t]*kr\.?[ \t]*(\d[\d. \u00a0]*(?:,\d{1,2}|,[-–‑])?)[ \t]*\(Totalpris inkl\.? omk\.? og valgfrie omkostninger\)[ \t]*$/gim)) {
      const amount = parseNorwegianMoney(match[1]!).amount
      if (amount !== null) optionalTotals.push({ amount, evidence: source(page.pdfPage, match.index, match.index + match[0].length) })
    }
    for (const match of page.text.matchAll(/^[ \t]*Totalpris(?:[ \t]+(?:inkl\.? omkostninger(?: og fellesgjeld)?|er))?[ \t]*:?[ \t]+kr\.?[ \t]*(\d[\d. \u00a0]*(?:,\d{1,2}|,[-–‑])?)[ \t]*$/gim)) {
      const amount = parseNorwegianMoney(match[1]!).amount
      if (amount !== null) proseTotals.push({ amount, evidence: source(page.pdfPage, match.index, match.index + match[0].length) })
    }
    for (const match of page.text.matchAll(/Fellesutgiftene utgjør kr\.?[ \t]*(\d[\d. \u00a0]*,[-–‑]) pr\. mnd\. og inkluderer:\s*([^.]*(?:\.[^\n]*)?)/gi)) {
      const amount = parseNorwegianMoney(match[1]!).amount
      if (amount === null || match[0].length > 2000) continue
      const evidence = source(page.pdfPage, match.index, match.index + match[0].length)
      record(common, amount, 'month', evidence)
      commonLists.push(evidence)
    }
    for (const match of page.text.matchAll(/I følge styreleder[^.]{0,500}\.[^]{0,200}?Omfanget av kostnadene er uvisst[^.]{0,100}\./gi)) {
      if (match[0].length <= 2000) common.sources.push(source(page.pdfPage, match.index, match.index + match[0].length))
    }
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
  const total = fields.find(field => field.id === 'totalPrice')!
  for (const item of proseTotals) {
    const qualified = optionalTotals.filter(optional => optional.amount === item.amount)
    if (qualified.length) continue
    record(total, item.amount, 'once', item.evidence)
  }
  for (const item of optionalTotals) {
    const related = proseTotals.filter(prose => prose.amount === item.amount)
    fields.push({ ...total, id: `optionalTotalPrice${fields.length}`, label: 'Totalpris inkludert valgfrie omkostninger', category: 'informational', amount: item.amount, period: 'once', status: 'available', nature: 'fact', originalText: item.evidence.quote,
      sources: [item.evidence, ...related.map(prose => prose.evidence)], alternatives: [], includedIn: null, debtPart: null })
  }
  const purchase = fields.find(field => field.id === 'purchaseCosts')!, documentTax = fields.find(field => field.id === 'documentTax')!
  for (const item of purchaseLedgers) {
    record(purchase, item.amount, 'once', item.evidence)
    if (item.valid && item.taxAmount !== null) record(documentTax, item.taxAmount, 'once', item.evidence)
  }
  for (const item of taxCandidates) {
    const annualParent = municipal.status === 'available' && municipal.period === 'year' && municipal.amount !== null
    if (!item.supported) {
      tax.sources.push(item.evidence)
      tax.status = 'conflict'
      tax.alternatives.push({ amount: item.amount, source: item.evidence })
      continue
    }
    record(tax, item.amount, annualParent ? 'year' : 'unknown', item.evidence)
    if (annualParent) {
      tax.sources.push(...municipal.sources)
      taxInMunicipal.push(item.evidence)
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
  // An explicit ledger zero is sufficient; independent no-loan prose adds
  // corroboration but is never inferred from missing debt information.
  debt.sources.push(...corroboration)
  const price = fields.find(field => field.id === 'price')!
  const purchaseReconciles = [price, debt, purchase, total].every(field => field.status === 'available' && field.amount !== null)
    && new Decimal(price.amount!).plus(debt.amount!).plus(purchase.amount!).eq(total.amount!)
  if (purchaseReconciles && purchaseLedgers.length > 0 && purchaseLedgers.every(item => item.valid && item.amount === purchase.amount)) {
    purchase.includedIn = ''
    if (documentTax.status === 'available' && documentTax.amount !== null && purchaseLedgers.every(item => item.taxAmount === documentTax.amount)) documentTax.includedIn = 'purchaseCosts'
  }
  if (debt.status === 'available' && debt.amount === '0' && corroboration.length && commonLists.length
    && commonLists.every(item => /inkluderer:\s*Felles byggforsikring, drift og vedlikehold, bank, strøm i\s*fellesareal, brann- og sprinklerkontroll\./i.test(item.quote))
    && common.status === 'available' && municipal.status === 'available' && tax.status === 'available' && taxInMunicipal.length) {
    const includesMunicipal = commonCostContent(common.sources.map(item => item.quote)).included.has('kommunale avgifter')
    // Tax is an explanatory child, never added on top of its municipal parent.
    municipal.includedIn = includesMunicipal ? 'commonCosts' : commonCostContent(common.sources.map(item => item.quote)).excluded.has('kommunale avgifter') ? '' : null
    municipal.debtPart = '0'
    municipal.sources.push(...taxInMunicipal, ...commonLists)
    tax.includedIn = 'municipalFees'
    tax.debtPart = '0'
    common.includedIn = ''
    common.debtPart = '0'
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
