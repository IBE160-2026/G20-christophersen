import express from 'express'
import { createServer, type Server } from 'node:http'
import { afterEach, expect, it, vi } from 'vitest'
import { createListingRouter } from '../../src/backend/http/listing-route.ts'
import { createListingAdapter } from '../../src/backend/listing/adapter.ts'
import { listingUrl, listingFixture, responseFixture } from '../fixtures/listing/finn.ts'
const servers: Server[] = []
afterEach(async () => { await Promise.all(servers.splice(0).map(server => new Promise<void>((resolve, reject) => { server.close(error => error ? reject(error) : resolve()); server.closeAllConnections() }))) })
async function start(options: Parameters<typeof createListingRouter>[0] = {}) {
  const app = express(); app.use('/api', createListingRouter(options))
  const server = createServer(app)
  await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve) })
  servers.push(server)
  const address = server.address(); if (!address || typeof address === 'string') throw new Error('Mangler port')
  return `http://127.0.0.1:${address.port}/api/listing`
}
const correlation = { generation: 1, requestId: 'test-listing' }
const body = { url: listingUrl, correlation }
const post = (url: string, value: unknown) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) })
it('FI-1: deaktivert kanal gjør ingen ekstern transport selv med injisert adapter', async () => {
  const transport = vi.fn(async () => responseFixture())
  const url = await start({ adapter: createListingAdapter(transport) })
  const response = await post(url, body)
  expect(response.status).toBe(503); expect(await response.json()).toEqual({ kind: 'rejected', code: 'disabled' })
  expect(transport).not.toHaveBeenCalled()
})
it('kontrollert adapter returnerer validert grunnlag og korrelasjon', async () => {
  const transport = vi.fn(async () => responseFixture())
  const url = await start({ enabled: true, adapter: createListingAdapter(transport, { now: () => new Date(listingFixture().fetchedAt) }) })
  const response = await post(url, body)
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ kind: 'listing', correlation, listing: listingFixture() })
  expect(transport).toHaveBeenCalledTimes(1)
})
it('avviser ugyldig URL, credentials, port og overstor kropp før adapter', async () => {
  const adapter = { import: vi.fn(async () => listingFixture()) }
  const url = await start({ enabled: true, adapter })
  for (const invalid of ['http://finn.no', listingUrl.replace('www.finn.no', 'user@www.finn.no'), listingUrl.replace('www.finn.no', 'www.finn.no:443')]) expect((await post(url, { ...body, url: invalid })).status).toBe(400)
  expect((await post(url, { ...body, huge: 'x'.repeat(5000) })).status).toBe(413)
  expect(adapter.import).not.toHaveBeenCalled()
})
it('feil side og ufullført handling blir trygg avvisning uten intern feildetalj', async () => {
  const bad = responseFixture(); bad.output[0]!.action!.url = listingUrl.replace('476576649', '123')
  const url = await start({ enabled: true, adapter: createListingAdapter(async () => bad) })
  const response = await post(url, body)
  expect(response.status).toBe(502); expect(await response.json()).toEqual({ kind: 'rejected', code: 'unavailable' })
})

it('FINN-2: gate-approved production backend uses stubbed SDK and returns retained-attempt status', async () => {
  const { createListingBackend } = await import('../../src/backend/listing/backend.ts')
  const transport = vi.fn(async () => new Response(JSON.stringify(responseFixture()), { headers: { 'Content-Type': 'application/json' } }))
  const backend = createListingBackend({ environment: { FINN_IMPORT_ENABLED: 'true', FINN_IMPORT_ACCESS_REFERENCE: 'test-access', FINN_IMPORT_COST_REFERENCE: 'test-cost', OPENAI_API_KEY: 'synthetic-only' }, fetch: transport })
  const url = await start(backend)
  expect((await post(url, body)).status).toBe(200)
  const repeated = await post(url, { ...body, url: 'https://finn.no/realestate/homes/ad.html?finnkode=476576649' })
  expect(repeated.status).toBe(409)
  expect(await repeated.json()).toEqual({ kind: 'rejected', code: 'already-attempted' })
  expect(transport).toHaveBeenCalledTimes(1)
})

it('FINN-2: incomplete operator approvals return safe configuration status without key access', async () => {
  const { createListingBackend } = await import('../../src/backend/listing/backend.ts')
  const key = vi.fn(() => { throw new Error('must not read key') })
  const environment = Object.defineProperty({ FINN_IMPORT_ENABLED: 'true', FINN_IMPORT_ACCESS_REFERENCE: 'approved' }, 'OPENAI_API_KEY', { get: key })
  const url = await start(createListingBackend({ environment }))
  const response = await post(url, body)
  expect(response.status).toBe(503)
  expect(await response.json()).toEqual({ kind: 'rejected', code: 'configuration' })
  expect(key).not.toHaveBeenCalled()
})

it('FINN-2: concurrent request returns busy without consuming the other code', async () => {
  let release!: () => void
  const transport = vi.fn(async () => { await new Promise<void>(resolve => { release = resolve }); return responseFixture() })
  const url = await start({ enabled: true, adapter: createListingAdapter(transport) })
  const first = post(url, body)
  await vi.waitFor(() => expect(transport).toHaveBeenCalledTimes(1))
  const busy = await post(url, { ...body, url: listingUrl.replace('476576649', '123') })
  expect(busy.status).toBe(409); expect(await busy.json()).toEqual({ kind: 'rejected', code: 'busy' })
  release()
  expect((await first).status).toBe(200)
  expect(transport).toHaveBeenCalledTimes(1)
})
