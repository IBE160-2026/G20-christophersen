import { ListingKeySchema } from '../../../src/contracts/listing.ts'
import type { ListingField, ListingImport } from '../../../src/contracts/listing.ts'
import { createListingDraft } from '../../../src/domain/listing.ts'
export const listingUrl = 'https://www.finn.no/realestate/homes/ad/476576649'
/** Syntetisk fasit fra specen, ingen påstand om live-annonsens innhold. */
export function listingFixture(): ListingImport {
  const amounts: Record<string, string> = { price: '3000000', totalPrice: '3275000', purchaseCosts: '75000', documentTax: '75000', sharedDebt: '200000', commonCosts: '5000' }
  return { listingCode: '476576649', url: listingUrl, fetchedAt: '2026-10-28T12:00:00.000Z', fields: ListingKeySchema.options.map(id => ({
    id, label: id, category: ['price', 'totalPrice', 'sharedDebt'].includes(id) ? 'price' : ['purchaseCosts', 'documentTax'].includes(id) ? 'one-off' : 'recurring',
    status: amounts[id] === undefined ? 'missing' : 'available', amount: amounts[id] ?? null, currency: 'NOK',
    period: ['commonCosts', 'propertyTax', 'municipalFees', 'sharedDebtPayment'].includes(id) ? 'month' : 'once', year: ['commonCosts', 'propertyTax', 'municipalFees', 'sharedDebtPayment'].includes(id) ? '2026' : null,
    source: amounts[id] === undefined ? null : { url: listingUrl, quote: `${id}: ${amounts[id]} NOK` }, alternatives: [],
    includedIn: id === 'documentTax' ? 'purchaseCosts' : id === 'purchaseCosts' ? '' : null, debtPart: null,
  } as ListingField)) }
}
export function checkedDraft() {
  const draft = createListingDraft(listingFixture())
  for (const field of draft.original.fields) if (field.status === 'available') draft.corrections[field.id] = {
    rawAmount: field.amount!, period: field.period, year: field.year ?? '', rawDebtPart: field.debtPart ?? '', includedIn: field.includedIn, note: '', reviewed: true,
  }
  return draft
}
export function responseFixture(listing = listingFixture()): { status: string; output: { type: string; status: string; action?: { type: string; url: string }; content?: { type: string; text: string }[] }[] } {
  const { fetchedAt: _fetchedAt, ...extraction } = listing
  return { status: 'completed', output: [
    { type: 'web_search_call', status: 'completed', action: { type: 'open_page', url: listingUrl } },
    { type: 'message', status: 'completed', content: [{ type: 'output_text', text: JSON.stringify(extraction) }] },
  ] }
}

export function completeDraft() {
  const draft = checkedDraft()
  draft.completeOperatingCosts = true
  for (const id of ['commonCosts', 'propertyTax', 'municipalFees', 'sharedDebtPayment']) {
    const field = draft.original.fields.find(item => item.id === id)!
    field.status = 'available'; field.amount = id === 'commonCosts' ? '5000' : id === 'sharedDebtPayment' ? '1000' : '200'
    field.source = { url: listingUrl, quote: 'Syntetisk kontrollgrunnlag' }
    field.debtPart = id === 'commonCosts' || id === 'sharedDebtPayment' ? '1000' : '0'
    field.includedIn = id === 'commonCosts' ? '' : 'commonCosts'
    draft.corrections[id] = { rawAmount: field.amount, period: 'month', year: '2026', rawDebtPart: field.debtPart, includedIn: field.includedIn, note: '', reviewed: true }
  }
  return draft
}
