import { readFileSync } from 'node:fs'
import { ListingKeySchema, type ListingField } from '../../../src/contracts/listing.ts'

const recording = new URL('../../../.docs/process/arbeidsokter/finn-open-page-2026-10-28/response.json', import.meta.url)
export const recordedBytes = readFileSync(recording, 'utf8')
export const recordedUrl = 'https://www.finn.no/realestate/homes/ad.html?finnkode=476576649'
export function recordedResponse() { return JSON.parse(recordedBytes) }

/** Kun testkonvertering: gamle modellverdier, aldri nye FINN-sitater eller beregnede importfakta. */
export function convertedRecording() {
  const raw = recordedResponse()
  const message = raw.output.find((item: { type: string }) => item.type === 'message')
  const text = message.content.find((item: { type: string }) => item.type === 'output_text')
  const old = JSON.parse(text.text).fields as Record<string, { value: number | null; source: string | null; period: string | null }>
  const mapping: Record<string, string> = { price: 'prisantydning', totalPrice: 'totalpris', documentTax: 'dokumentavgift', sharedDebt: 'fellesgjeld', commonCosts: 'felleskostnader', propertyTax: 'eiendomsskatt' }
  const fields: ListingField[] = ListingKeySchema.options.map(id => {
    const value = old[mapping[id] ?? '']
    return {
      id, label: id, category: ['price', 'totalPrice', 'sharedDebt'].includes(id) ? 'price' : ['purchaseCosts', 'documentTax'].includes(id) ? 'one-off' : 'recurring',
      status: value?.value != null ? 'available' : 'missing', amount: value?.value != null ? String(value.value) : null,
      currency: 'NOK', period: value?.period === 'per måned' ? 'month' : value?.period === 'per år' ? 'year' : 'unknown',
      year: null, includedIn: null, debtPart: null, alternatives: [],
      source: value?.source ? { url: value.source, quote: `TESTKONVERTERING — modellrapportert opptaksdata, ikke ordrett FINN-sitat: ${mapping[id]} ${JSON.stringify(value)}` } : null,
    }
  })
  text.text = JSON.stringify({ listingCode: '476576649', url: recordedUrl, fields })
  return raw
}
