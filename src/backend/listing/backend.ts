import type OpenAI from 'openai'
import type { ClientOptions } from 'openai'
import { createAnalysisBackend } from '../analysis/backend-config.ts'
import { createListingAdapter, type ListingAdapter } from './adapter.ts'

export const MAX_LISTING_RESPONSE_BYTES = 120_000
export type ListingBackend = { enabled: false; code: 'disabled' | 'configuration' } | { enabled: true; adapter: ListingAdapter }
type Environment = Readonly<{ FINN_IMPORT_ENABLED?: unknown; FINN_IMPORT_ACCESS_REFERENCE?: unknown; FINN_IMPORT_COST_REFERENCE?: unknown; OPENAI_API_KEY?: unknown }>
type Dependencies = { environment?: Environment; fetch?: ClientOptions['fetch']; createClient?: (options: ClientOptions) => Pick<OpenAI, 'responses'>; timeoutMs?: number }

/** Bound SDK success/error reads while retaining ownership of real body cancellation. */
function boundedFetch(fetch: typeof globalThis.fetch) {
  const bodies = new Set<Promise<void>>()
  return {
    async settled() { await Promise.all(bodies); bodies.clear() },
    fetch: (async (url, init) => {
      const response = await fetch(url, init)
      if (!response.body) return response
      const reader = response.body.getReader()
      let finish!: () => void
      bodies.add(new Promise<void>(resolve => { finish = resolve }))
      let cancellation: Promise<void> | undefined
      const cancel = () => {
        cancellation ??= reader.cancel().catch(() => {}).finally(() => { reader.releaseLock(); finish() })
        return cancellation
      }
      let bytes = 0
      const body = new ReadableStream<Uint8Array>({
        async pull(controller) {
          try {
            const chunk = await reader.read()
            if (chunk.done) {
              // A cancelled read may report done before the source's cancel settles.
              if (!cancellation) { reader.releaseLock(); finish() }
              controller.close(); return
            }
            bytes += chunk.value.byteLength
            if (bytes > MAX_LISTING_RESPONSE_BYTES) throw new Error('Response size limit')
            controller.enqueue(chunk.value)
          } catch {
            void cancel()
            controller.error(new Error('Listing response unavailable'))
          }
        },
        cancel,
      })
      return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers })
    }) as typeof globalThis.fetch,
  }
}

/** All three operator gates precede even reading the backend key. No startup request. */
export function createListingBackend(dependencies: Dependencies = {}): ListingBackend {
  const environment = dependencies.environment ?? process.env
  if (environment.FINN_IMPORT_ENABLED !== 'true') return { enabled: false, code: 'disabled' }
  const reference = (value: unknown) => typeof value === 'string' && value.trim().length > 0
  if (!reference(environment.FINN_IMPORT_ACCESS_REFERENCE) || !reference(environment.FINN_IMPORT_COST_REFERENCE)) return { enabled: false, code: 'configuration' }
  try {
    const transport = boundedFetch(dependencies.fetch ?? globalThis.fetch)
    const backend = createAnalysisBackend('live', { environment, fetch: transport.fetch, createClient: dependencies.createClient })
    if (backend.mode !== 'live') throw new Error('Invalid backend')
    return { enabled: true, adapter: createListingAdapter(async (request, options) => {
      // asResponse avoids SDK success-body buffering; boundedFetch also covers SDK errors.
      try {
        const response = await backend.responses.create(request, { signal: options.signal, maxRetries: 0 }).asResponse()
        return JSON.parse(await response.text()) as unknown
      } finally {
        // The adapter may return on its deadline; keep its busy guard until the source stops.
        await transport.settled()
      }
    }, { timeoutMs: dependencies.timeoutMs }) }
  } catch { return { enabled: false, code: 'configuration' } }
}
