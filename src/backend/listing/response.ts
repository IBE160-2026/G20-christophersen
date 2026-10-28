import { validateListingImport, validateListingUrl } from '../../domain/listing.ts'
import type { ListingImport } from '../../contracts/listing.ts'
const MAX_RESPONSE = 120_000
/** Completed alene er ikke kildebevis: riktig fullført open_page kreves også. */
export function parseListingResponse(raw: unknown, url: string, fetchedAt: string): ListingImport {
  const serialized = JSON.stringify(raw)
  if (!serialized || serialized.length > MAX_RESPONSE) throw new Error('Ugyldig responsstørrelse')
  if (!raw || typeof raw !== 'object') throw new Error('Ugyldig respons')
  const response = raw as { status?: unknown; output?: unknown }
  if (response.status !== 'completed' || !Array.isArray(response.output)) throw new Error('Ufullført respons')
  const identity = validateListingUrl(url)!
  let opened = false
  const texts: string[] = []
  for (const item of response.output as { type?: string; status?: string; action?: { type?: string; url?: string }; content?: { type?: string; text?: string }[] }[]) {
    if (item.type !== 'web_search_call' && item.type !== 'message' && item.type !== 'reasoning') throw new Error('Uventet responsdel')
    if (item.type === 'web_search_call') {
      if (opened) throw new Error('Flere kildehandlinger')
      if (item.status !== 'completed') throw new Error('Ufullført kildehandling')
      if (item.action?.type === 'open_page') {
        if (!item.action.url || validateListingUrl(item.action.url)?.listingCode !== identity.listingCode) throw new Error('Feil åpnet kilde')
        opened = true
      } else throw new Error('Ukjent kildehandling')
    }
    if (item.type === 'message') {
      if (item.status !== 'completed' || !Array.isArray(item.content)) throw new Error('Ufullført melding')
      for (const content of item.content) {
        if (content.type !== 'output_text' || typeof content.text !== 'string') throw new Error('Ugyldig melding')
        texts.push(content.text)
      }
    }
  }
  if (!opened || texts.length !== 1) throw new Error('Mangler entydig kildeuttak')
  const extraction: unknown = JSON.parse(texts[0]!)
  if (!extraction || typeof extraction !== 'object') throw new Error('Ugyldig uttrekk')
  const listing = validateListingImport({ ...extraction, fetchedAt })
  if (listing.listingCode !== identity.listingCode || validateListingUrl(listing.url)?.listingCode !== identity.listingCode) throw new Error('Feil annonseidentitet')
  return listing
}
