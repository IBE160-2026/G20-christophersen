import { ListingImportSchema, ListingKeySchema } from '../contracts/listing.ts'
import type { ListingDraft, ListingImport } from '../contracts/listing.ts'

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
export { effectiveEconomyFields as effectiveListingFields, economySuggestions as listingSuggestions, economyFinancingSuggestion as listingFinancingSuggestion } from './source-economy.ts'

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
    if (field.status !== 'conflict' && field.alternatives.length > 0) throw new Error('Alternativer krever konfliktstatus')
    if (field.status === 'conflict' && field.alternatives.length === 0) throw new Error('Konflikt mangler alternativer')
    if (field.source && validateListingUrl(field.source.url)?.listingCode !== listing.listingCode) throw new Error('Feil feltkilde')
    if (field.alternatives.some(source => validateListingUrl(source.url)?.listingCode !== listing.listingCode)) throw new Error('Feil konfliktkilde')
  }
  return listing
}
