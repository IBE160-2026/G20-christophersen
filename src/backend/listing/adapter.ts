import type { ListingImport } from '../../contracts/listing.ts'
import { validateListingUrl } from '../../domain/listing.ts'
import { listingRequest } from './request.ts'
import { parseListingResponse } from './response.ts'
export type ListingTransport = (request: ReturnType<typeof listingRequest>, options: { signal: AbortSignal; maxRetries: 0 }) => Promise<unknown>
export interface ListingAdapter { import(url: string, signal?: AbortSignal): Promise<ListingImport> }
export class ListingAdapterError extends Error {
  readonly code: 'busy' | 'already-attempted' | 'unavailable'
  constructor(code: ListingAdapterError['code']) { super('FINN-import kunne ikke fullføres.'); this.code = code }
}
/** One instance is retained for the server lifetime. Abort never releases pending transport. */
export function createListingAdapter(transport: ListingTransport, options: { timeoutMs?: number; now?: () => Date } = {}): ListingAdapter {
  const attempted = new Set<string>()
  let busy = false
  return { async import(raw, externalSignal) {
    const identity = validateListingUrl(raw)
    if (!identity || externalSignal?.aborted) throw new ListingAdapterError('unavailable')
    if (busy) throw new ListingAdapterError('busy')
    if (attempted.has(identity.listingCode)) throw new ListingAdapterError('already-attempted')
    busy = true
    attempted.add(identity.listingCode)
    const controller = new AbortController()
    const abort = () => controller.abort()
    externalSignal?.addEventListener('abort', abort, { once: true })
    let timer: ReturnType<typeof setTimeout> | undefined
    const deadline = new Promise<never>((_resolve, reject) => {
      controller.signal.addEventListener('abort', () => reject(new ListingAdapterError('unavailable')), { once: true })
      timer = setTimeout(abort, options.timeoutMs ?? 120_000)
    })
    // Observe settlement separately: Promise.race returning does not mean I/O stopped.
    const pending = Promise.resolve().then(() => transport(listingRequest(raw, identity.listingCode), { signal: controller.signal, maxRetries: 0 }))
    void pending.then(() => { busy = false }, () => { busy = false })
    try {
      const rawResponse = await Promise.race([pending, deadline])
      if (controller.signal.aborted) throw new ListingAdapterError('unavailable')
      return parseListingResponse(rawResponse, raw, (options.now?.() ?? new Date()).toISOString())
    } catch { throw new ListingAdapterError('unavailable') }
    finally {
      clearTimeout(timer)
      externalSignal?.removeEventListener('abort', abort)
    }
  } }
}
