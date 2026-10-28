import express, { Router } from 'express'
import type { ListingAdapter } from '../listing/adapter.ts'
import { ListingRequestSchema, ListingResponseSchema } from '../../contracts/listing.ts'
import { validateListingImport, validateListingUrl } from '../../domain/listing.ts'
/** En adapter alene aktiverer ikke ruten. Produksjonsserveren gir ingen adapter. */
export function createListingRouter(options: { enabled?: boolean; adapter?: ListingAdapter } = {}) {
  const router = Router()
  router.post('/listing', express.json({ limit: '4kb', strict: true }), async (request, response) => {
    response.setHeader('Cache-Control', 'no-store')
    const parsed = ListingRequestSchema.safeParse(request.body)
    if (!parsed.success || !validateListingUrl(parsed.data.url)) { response.status(400).json({ kind: 'rejected', code: 'invalid-request' }); return }
    if (!options.enabled || !options.adapter) { response.status(503).json({ kind: 'rejected', code: 'disabled' }); return }
    const controller = new AbortController()
    const close = () => { if (!response.writableEnded) controller.abort() }
    response.once('close', close)
    try {
      const listing = validateListingImport(await options.adapter.import(parsed.data.url, controller.signal))
      if (listing.listingCode !== validateListingUrl(parsed.data.url)!.listingCode) throw new Error('Feil annonse')
      if (!controller.signal.aborted) response.json(ListingResponseSchema.parse({ kind: 'listing', correlation: parsed.data.correlation, listing }))
    } catch {
      if (!controller.signal.aborted) response.status(502).json({ kind: 'rejected', code: 'unavailable' })
    } finally { response.off('close', close) }
  })
  router.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    response.status(typeof error === 'object' && error !== null && 'type' in error && error.type === 'entity.too.large' ? 413 : 400)
      .json({ kind: 'rejected', code: 'invalid-request' })
  })
  return router
}
