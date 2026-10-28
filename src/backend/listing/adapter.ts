import type { ListingImport } from '../../contracts/listing.ts'
import { validateListingUrl } from '../../domain/listing.ts'
import { listingRequest } from './request.ts'
import { parseListingResponse } from './response.ts'
export type ListingTransport = (request: ReturnType<typeof listingRequest>, options: { signal: AbortSignal; maxRetries: 0 }) => Promise<unknown>
export interface ListingAdapter { import(url: string, signal?: AbortSignal): Promise<ListingImport> }
/** Ingen SDK-klient eller nøkkel konstrueres her. Én injisert forespørsel, ingen retry. */
export function createListingAdapter(transport: ListingTransport, options: { timeoutMs?: number; now?: () => Date } = {}): ListingAdapter {
  return { async import(raw, externalSignal) {
    const identity = validateListingUrl(raw)
    if (!identity || externalSignal?.aborted) throw new Error('Ugyldig import')
    const controller = new AbortController()
    const abort = () => controller.abort()
    externalSignal?.addEventListener('abort', abort, { once: true })
    let timer: ReturnType<typeof setTimeout> | undefined
    const deadline = new Promise<never>((_resolve, reject) => {
      controller.signal.addEventListener('abort', () => reject(new Error('Import avbrutt')), { once: true })
      timer = setTimeout(abort, options.timeoutMs ?? 120_000)
    })
    try {
      const rawResponse = await Promise.race([transport(listingRequest(identity.url, identity.listingCode), { signal: controller.signal, maxRetries: 0 }), deadline])
      return parseListingResponse(rawResponse, identity.url, (options.now?.() ?? new Date()).toISOString())
    } finally {
      clearTimeout(timer)
      externalSignal?.removeEventListener('abort', abort)
    }
  } }
}
