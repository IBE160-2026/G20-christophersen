import Big from 'big.js'
import { ListingImportSchema, ListingKeySchema } from '../contracts/listing.ts'
import type { ListingDraft, ListingField, ListingImport } from '../contracts/listing.ts'
import { parseFinancialDecimal } from './validation.ts'
import { financingSuggestion } from './financing.ts'
import { validateFinancialBasis } from './financial-basis.ts'
const Decimal = Big()
Decimal.strict = true

/** Bare kanonisk FINN-boligidentitet. URL-parseren får ikke skjule eksplisitt :443. */
export function validateListingUrl(raw: string): { url: string; listingCode: string } | null {
  if (raw !== raw.trim() || !/^https:\/\/(?:www\.)?finn\.no\//.test(raw)) return null
  const authority = raw.slice(8).split('/')[0]!
  if (authority.includes('@') || authority.includes(':')) return null
  try {
    const url = new URL(raw)
    if (url.hash || url.username || url.password || url.port || !['finn.no', 'www.finn.no'].includes(url.hostname)) return null
    const modern = /^\/realestate\/homes\/ad\/(\d+)\/?$/.exec(url.pathname)
    const legacy = url.pathname === '/realestate/homes/ad.html' ? url.searchParams.getAll('finnkode') : []
    if (modern && [...url.searchParams.keys()].some(key => /finnkode/i.test(key))) return null
    const code = modern?.[1] ?? (legacy.length === 1 && /^\d+$/.test(legacy[0]!) ? legacy[0] : null)
    if (!code) return null
    // Ingen andre kodebærende parametere eller dupliserte koder.
    if ([...url.searchParams.keys()].some(key => /finnkode/i.test(key) && key !== 'finnkode')) return null
    return { url: `https://www.finn.no/realestate/homes/ad/${code}`, listingCode: code }
  } catch { return null }
}
export function createListingDraft(original: ListingImport): ListingDraft {
  return { original: ListingImportSchema.parse(original), corrections: {}, completeOperatingCosts: false }
}
export function effectiveListingFields(draft: ListingDraft): ListingField[] {
  return draft.original.fields.map(field => {
    const correction = draft.corrections[field.id]
    if (!correction) return field
    const changed = parseFinancialDecimal(correction.rawAmount) !== field.amount || correction.period !== field.period || (correction.year || null) !== field.year || correction.includedIn !== field.includedIn || parseFinancialDecimal(correction.rawDebtPart) !== field.debtPart
    const reviewed = correction.reviewed && (!(changed || field.status !== 'available') || correction.note.trim() !== '')
    return { ...field, amount: parseFinancialDecimal(correction.rawAmount), period: correction.period,
      year: correction.year || null, includedIn: correction.includedIn,
      debtPart: parseFinancialDecimal(correction.rawDebtPart), status: reviewed ? 'available' : 'conflict' }
  })
}
export function listingSuggestions(draft: ListingDraft) {
  const fields = effectiveListingFields(draft)
  const get = (id: string) => fields.find(field => field.id === id)
  const checked = (id: string) => draft.corrections[id]?.reviewed === true
  const amount = (id: string) => {
    const field = get(id)
    return field?.status === 'available' && checked(id) && field.amount !== null && new Decimal(field.amount).gte('0') ? field.amount : null
  }
  const issues: string[] = []
  const price = amount('price'), sharedDebt = amount('sharedDebt'), costs = amount('purchaseCosts')
  let P: string | null = null
  if (price !== null && new Decimal(price).gt('0') && sharedDebt !== null) P = new Decimal(price).plus(sharedDebt).toFixed()
  else issues.push('Pris og fellesgjeld må være kjent og kontrollert før P kan foreslås.')
  const total = amount('totalPrice')
  if (get('totalPrice')?.status === 'conflict' || (total !== null && (costs === null || P === null || !new Decimal(P).plus(costs).eq(total)))) {
    P = null; issues.push('FINN-totalpris avviker eller kan ikke avstemmes mot pris, fellesgjeld og omkostninger.')
  } else if (get('totalPrice')?.amount !== null && get('totalPrice')?.amount !== undefined && !checked('totalPrice')) {
    P = null; issues.push('Oppgitt FINN-totalpris må kontrolleres.')
  }
  // Engangskostnader må ha eksplisitt inkludering. Kontrollert omkostningstotal er roten.
  let oneOff: string | null = costs
  // Kjente/konfliktfylte originalposter beholdes også når en retting blir blank/ugyldig.
  const active = (field: ListingField) => {
    const original = draft.original.fields.find(item => item.id === field.id)!
    return original.amount !== null || original.status === 'conflict' || original.status === 'available' || Boolean(draft.corrections[field.id]?.rawAmount.trim())
  }
  const oneOffFields = fields.filter(field => field.category === 'one-off' && active(field))
  const seen = new Set<string>()
  for (const field of oneOffFields) {
    if (field.amount === null || new Decimal(field.amount).lt('0') || seen.has(field.id) || !checked(field.id) || field.status !== 'available' || field.includedIn === null) { oneOff = null; break }
    seen.add(field.id)
    if (field.id === 'purchaseCosts') {
      if (field.includedIn !== '') oneOff = null
    } else if (field.includedIn === '' && oneOff !== null) oneOff = new Decimal(oneOff).plus(field.amount!).toFixed()
    else if (field.includedIn !== 'purchaseCosts' || costs === null || new Decimal(field.amount!).gt(costs)) oneOff = null
  }
  if (costs !== null) {
    const includedSum = oneOffFields.filter(field => field.amount !== null && field.includedIn === 'purchaseCosts').reduce((sum, field) => sum.plus(field.amount!), new Decimal('0'))
    if (includedSum.gt(costs)) oneOff = null
  }
  if (oneOff === null) issues.push('Engangskostnadenes inkludering må avklares før kontantbehov beregnes.')
  const cashRequired = price !== null && oneOff !== null ? new Decimal(price).plus(oneOff).toFixed() : null
  const recurring = fields.filter(field => field.category === 'recurring' && active(field))
  let D: string | null = null, sharedAnnualPayment: string | null = null, year: string | null = null
  const debtPayment = get('sharedDebtPayment')
  const knownDebtPayment = amount('sharedDebtPayment')
  if (sharedDebt === '0') sharedAnnualPayment = '0'
  else if (knownDebtPayment !== null && debtPayment?.year && ['month', 'year'].includes(debtPayment.period)) {
    sharedAnnualPayment = new Decimal(knownDebtPayment).times(debtPayment.period === 'month' ? '12' : '1').toFixed()
  }
  const knownOperating = ['commonCosts', 'propertyTax', 'municipalFees'].every(id => amount(id) !== null)
  if (sharedDebt === '0' && knownDebtPayment !== null && new Decimal(knownDebtPayment).gt('0')) sharedAnnualPayment = null
  let validBreakdown = recurring.length === 0
  if (recurring.length > 0 && recurring.every(field => checked(field.id) && field.status === 'available'
    && field.amount !== null && new Decimal(field.amount).gte('0') && field.debtPart !== null && new Decimal(field.debtPart).gte('0') && field.includedIn !== null && field.year !== null && /^\d{4}$/.test(field.year) && ['month', 'year'].includes(field.period))) {
    const years = new Set(recurring.map(field => field.year))
    if (years.size === 1) {
      year = recurring[0]!.year
      const basis = validateFinancialBasis({ values: {
        P: { rawValue: '1', confirmed: false }, L: { rawValue: '', confirmed: false, period: '', year: '' },
        D: { rawValue: '', confirmed: false, period: 'year', year: year! }, J: { rawValue: '', confirmed: false, period: 'year', year: year! },
        Ymin: { rawValue: '', confirmed: false },
      }, sources: { P: { kind: '', description: '', conflict: null }, L: { kind: '', description: '', conflict: null, rentNature: '' }, D: { kind: '', description: '', conflict: null }, J: { kind: '', description: '', conflict: null }, Ymin: { kind: '', description: '', conflict: null } },
      costItems: recurring.map(field => ({ id: field.id, label: field.label,
        rawAmount: new Decimal(field.amount!).times(field.period === 'month' ? '12' : '1').toFixed(),
        rawDebt: new Decimal(field.debtPart!).times(field.period === 'month' ? '12' : '1').toFixed(), includedIn: field.includedIn || null })),
      })
      validBreakdown = basis.costBreakdown.annualD !== null && basis.costBreakdown.annualJ !== null
      if (draft.completeOperatingCosts && knownOperating && validBreakdown) D = basis.costBreakdown.annualD
      // Egen gjeldspost må avstemmes mot rentedelene, uten ny summering.
      if (sharedAnnualPayment !== null && (basis.costBreakdown.annualJ === null
        || !new Decimal(sharedAnnualPayment).eq(basis.costBreakdown.annualJ))) sharedAnnualPayment = null
    }
  }
  if (!validBreakdown) sharedAnnualPayment = null
  if (D === null) issues.push('Full D krever komplett, kontrollert kostnadsinnhold med kjent fordeling, inkludering, periode og år.')
  if (sharedAnnualPayment === null) issues.push('Full J krever kjent betaling av fellesgjeld.')
  return { P, D, year, cashRequired, sharedAnnualPayment, issues }
}

/** Samme årsvilkår styrer både forhåndsvisning og atomisk bruk. */
export function listingFinancingSuggestion(draft: ListingDraft, financing: { equity: string; annualInterest: string; months: string; year: string }) {
  const suggested = listingSuggestions(draft)
  const result = financingSuggestion({ ...financing, cashRequired: suggested.cashRequired, sharedAnnualPayment: suggested.sharedAnnualPayment })
  const debt = effectiveListingFields(draft).find(field => field.id === 'sharedDebtPayment')
  const yearValid = /^\d{4}$/.test(financing.year) && (suggested.sharedAnnualPayment === '0' || debt?.year === financing.year)
    && (suggested.year === null || suggested.year === financing.year)
  return { ...result, J: yearValid ? result.J : null,
    yearIssue: yearValid ? null : 'Oppgi et år for gjeldsbetjening som samsvarer med kontrollerte kostnader og fellesgjeldsbetaling.' }
}

/** Fast felttilstedeværelse og unik identitet kontrolleres etter runtimekontrakten. */
export function validateListingImport(input: unknown): ListingImport {
  const listing = ListingImportSchema.parse(input)
  const identity = validateListingUrl(listing.url)
  if (!identity || identity.listingCode !== listing.listingCode || new Set(listing.fields.map(field => field.id)).size !== listing.fields.length
    || ListingKeySchema.options.some(key => !listing.fields.some(field => field.id === key))) throw new Error('Ugyldig annonsegrunnlag')
  for (const field of listing.fields) {
    const category = ['price', 'totalPrice', 'sharedDebt'].includes(field.id) ? 'price' : ['purchaseCosts', 'documentTax'].includes(field.id) ? 'one-off' : ListingKeySchema.options.includes(field.id as typeof ListingKeySchema.options[number]) ? 'recurring' : field.category
    if (field.category !== category) throw new Error('Feil feltkategori')
    if ((field.status === 'missing' || field.status === 'unavailable') && field.amount !== null) throw new Error('Ukjent felt har beløp')
    if (field.status === 'available' && (!field.source || field.amount === null)) throw new Error('Felt mangler kilde')
    if (field.status === 'conflict' && field.alternatives.length === 0) throw new Error('Konflikt mangler alternativer')
    if (field.source && validateListingUrl(field.source.url)?.listingCode !== listing.listingCode) throw new Error('Feil feltkilde')
    if (field.alternatives.some(source => validateListingUrl(source.url)?.listingCode !== listing.listingCode)) throw new Error('Feil konfliktkilde')
  }
  return listing
}
