import { readFile } from 'node:fs/promises'
import { describe, expect, it, vi } from 'vitest'
import { createListingBackend } from '../../src/backend/listing/backend.ts'
import { createListingAdapter } from '../../src/backend/listing/adapter.ts'
import { ListingClient } from '../../src/frontend/analysis/listing-client.ts'
import { createListingState } from '../../src/frontend/state/listing.ts'
import { listingUrl, responseFixture } from '../fixtures/listing/finn.ts'

const environment = { FINN_IMPORT_ENABLED: 'true', FINN_IMPORT_ACCESS_REFERENCE: 'access-approval', FINN_IMPORT_COST_REFERENCE: 'cost-approval', OPENAI_API_KEY: 'synthetic-test-key' }
function backend(fetch: typeof globalThis.fetch, timeoutMs?: number) { return createListingBackend({ environment, fetch, timeoutMs }) }
function sdkResponse(raw = responseFixture()) { return new Response(JSON.stringify(raw), { headers: { 'Content-Type': 'application/json' } }) }

describe('FINN-2 gated official SDK transport, entirely stubbed fetch', () => {
  it('closed and incomplete gates never read key, construct client or use transport', () => {
    for (const gate of [{}, { FINN_IMPORT_ENABLED: 'false' }, { FINN_IMPORT_ENABLED: 'true' }, { FINN_IMPORT_ENABLED: 'true', FINN_IMPORT_ACCESS_REFERENCE: 'ok', FINN_IMPORT_COST_REFERENCE: '  ' }]) {
      const readKey = vi.fn(() => { throw new Error('must not read') })
      const createClient = vi.fn(() => { throw new Error('must not construct') })
      const fetch = vi.fn(() => { throw new Error('must not fetch') })
      const env = Object.defineProperty({ ...gate }, 'OPENAI_API_KEY', { get: readKey })
      expect(createListingBackend({ environment: env, createClient, fetch }).enabled).toBe(false)
      expect(readKey).not.toHaveBeenCalled(); expect(createClient).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled()
    }
  })
  it('invalid approved configuration safely returns configuration without fetch', () => {
    const fetch = vi.fn()
    expect(createListingBackend({ environment: { ...environment, OPENAI_API_KEY: '' }, fetch })).toEqual({ enabled: false, code: 'configuration' })
    expect(fetch).not.toHaveBeenCalled()
  })
  it('SDK uses fixed endpoint/settings and exact original legacy/tracking URL once', async () => {
    const url = 'https://finn.no/realestate/homes/ad.html?utm_source=test&finnkode=476576649'
    const raw = responseFixture(); raw.output[0]!.action!.url = url
    const fetch = vi.fn(async () => sdkResponse(raw))
    const configured = backend(fetch)
    expect(fetch).not.toHaveBeenCalled()
    if (!configured.enabled) throw new Error('configuration')
    expect((await configured.adapter.import(url)).listingCode).toBe('476576649')
    expect(fetch).toHaveBeenCalledTimes(1)
    const [endpoint, init] = fetch.mock.calls[0] as unknown as [unknown, RequestInit]
    expect(String(endpoint)).toBe('https://api.openai.com/v1/responses')
    expect(JSON.parse(init.body as string)).toMatchObject({ model: 'gpt-6.1-sol', max_tool_calls: 1, store: false, input: expect.stringContaining(url) })
    await expect(configured.adapter.import(listingUrl)).rejects.toMatchObject({ code: 'already-attempted' })
    expect(fetch).toHaveBeenCalledTimes(1)
  })
  it.each(['sdk-error', 'wrong-open', 'old-schema'])('rejects %s safely without SDK retry', async mode => {
    const fetch = vi.fn(async () => {
      if (mode === 'sdk-error') return new Response('private key and provider detail', { status: 429 })
      const raw = responseFixture()
      if (mode === 'wrong-open') raw.output[0]!.action!.url = listingUrl + '?tracking=rewritten'
      else raw.output[1]!.content![0]!.text = '{"listingCode":"476576649","url":"' + listingUrl + '","price":"3000000"}'
      return sdkResponse(raw)
    })
    const configured = backend(fetch)
    if (!configured.enabled) throw new Error('configuration')
    await expect(configured.adapter.import(listingUrl)).rejects.toMatchObject({ code: 'unavailable', message: 'FINN-import kunne ikke fullføres.' })
    await expect(configured.adapter.import(listingUrl)).rejects.toMatchObject({ code: 'already-attempted' })
    expect(fetch).toHaveBeenCalledTimes(1)
  })
  it('rejects the unchanged historical recording honestly through the official SDK', async () => {
    const recording = await readFile(new URL('../../.docs/process/arbeidsokter/finn-open-page-2026-10-28/response.json', import.meta.url), 'utf8')
    const url = 'https://www.finn.no/realestate/homes/ad.html?finnkode=476576649'
    const fetch = vi.fn(async () => new Response(recording, { headers: { 'Content-Type': 'application/json' } }))
    const configured = backend(fetch)
    if (!configured.enabled) throw new Error('configuration')
    await expect(configured.adapter.import(url)).rejects.toMatchObject({ code: 'unavailable' })
    expect(fetch).toHaveBeenCalledTimes(1)
  })
  it.each([200, 429, 500])('deadline includes a stalled SDK %s body, without retry or repeated attempts', async status => {
    const cancel = vi.fn()
    const fetch = vi.fn(async () => new Response(new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('{')) }, cancel }), { status }))
    const configured = backend(fetch, 20)
    if (!configured.enabled) throw new Error('configuration')
    const started = performance.now()
    await expect(configured.adapter.import(listingUrl)).rejects.toMatchObject({ code: 'unavailable', message: 'FINN-import kunne ikke fullføres.' })
    expect(performance.now() - started).toBeLessThan(1000)
    await vi.waitFor(() => expect(cancel).toHaveBeenCalledTimes(1))
    await vi.waitFor(async () => { await expect(configured.adapter.import(listingUrl)).rejects.toMatchObject({ code: 'already-attempted' }) })
    expect(fetch).toHaveBeenCalledTimes(1)
  })
  it.each([200, 429, 500])('byte limit cancels streamed SDK %s body before collecting unread remainder or deadline', async status => {
    const encoder = new TextEncoder()
    let reads = 0
    // 1000 characters = 3000 UTF-8 bytes. The 41st chunk crosses 120000 bytes,
    // while remaining chunks deliberately never finish (JSON/HTTP parsing cannot decide).
    const cancel = vi.fn()
    const fetch = vi.fn(async () => new Response(new ReadableStream({
      pull(controller) { reads++; controller.enqueue(encoder.encode('€'.repeat(1000))) },
      cancel,
    }, { highWaterMark: 0 }), { status }))
    const configured = backend(fetch, 2000)
    if (!configured.enabled) throw new Error('configuration')
    const started = performance.now()
    const result = expect(configured.adapter.import(listingUrl)).rejects.toMatchObject({ code: 'unavailable', message: 'FINN-import kunne ikke fullføres.' })
    await vi.waitFor(() => expect(cancel).toHaveBeenCalledTimes(1), { timeout: 500 })
    await result
    expect(performance.now() - started).toBeLessThan(1000)
    expect(reads).toBe(41)
    await expect(configured.adapter.import(listingUrl)).rejects.toMatchObject({ code: 'already-attempted' })
    expect(fetch).toHaveBeenCalledTimes(1)
  })
  it.each([200, 429, 500])('production transport keeps ownership through pending SDK %s source cancellation', async status => {
    let release!: () => void
    const cancel = vi.fn(() => new Promise<void>(resolve => { release = resolve }))
    const fetch = vi.fn(async () => new Response(new ReadableStream({
      start(controller) { controller.enqueue(new TextEncoder().encode('{')) },
      cancel,
    }), { status }))
    const configured = backend(fetch, 20)
    if (!configured.enabled) throw new Error('configuration')
    const first = configured.adapter.import(listingUrl)
    await expect(first).rejects.toMatchObject({ code: 'unavailable' })
    await vi.waitFor(() => expect(cancel).toHaveBeenCalledTimes(1))
    await expect(configured.adapter.import(listingUrl.replace('476576649', '123'))).rejects.toMatchObject({ code: 'busy' })
    expect(fetch).toHaveBeenCalledTimes(1)
    release()
    await vi.waitFor(async () => { await expect(configured.adapter.import(listingUrl)).rejects.toMatchObject({ code: 'already-attempted' }) })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

})

describe('FINN-2 process lifetime attempt and concurrency ownership', () => {
  it.each(['abort', 'timeout'])('%s leaves abort-ignoring transport busy until actual settlement', async mode => {
    let resolve!: (raw: unknown) => void
    const transport = vi.fn(() => new Promise<unknown>(done => { resolve = done }))
    const adapter = createListingAdapter(transport, { timeoutMs: mode === 'timeout' ? 5 : 1000 })
    const controller = new AbortController()
    const first = adapter.import(listingUrl, controller.signal)
    await Promise.resolve()
    if (mode === 'abort') controller.abort()
    await expect(first).rejects.toMatchObject({ code: 'unavailable' })
    await expect(adapter.import(listingUrl)).rejects.toMatchObject({ code: 'busy' })
    await expect(adapter.import(listingUrl.replace('476576649', '123'))).rejects.toMatchObject({ code: 'busy' })
    resolve(responseFixture()); await Promise.resolve(); await Promise.resolve()
    await expect(adapter.import(listingUrl)).rejects.toMatchObject({ code: 'already-attempted' })
    // Busy rejection must not consume the other code's attempt.
    await expect(adapter.import(listingUrl.replace('476576649', '123'))).rejects.toMatchObject({ code: 'unavailable' })
    expect(transport).toHaveBeenCalledTimes(2)
  })
  it('already-aborted input does not consume an attempt', async () => {
    const transport = vi.fn(async () => responseFixture())
    const adapter = createListingAdapter(transport)
    await expect(adapter.import(listingUrl, AbortSignal.abort())).rejects.toMatchObject({ code: 'unavailable' })
    await expect(adapter.import(listingUrl)).resolves.toBeDefined()
    expect(transport).toHaveBeenCalledTimes(1)
  })
  it('client locks synchronously before React state updates', async () => {
    let release!: (response: Response) => void
    const fetch = vi.fn(() => new Promise<Response>(resolve => { release = resolve }))
    const dispatch = vi.fn()
    const client = new ListingClient(dispatch, fetch)
    const state = { ...createListingState(), url: listingUrl }
    const first = client.import(state)
    await client.import(state)
    expect(fetch).toHaveBeenCalledTimes(1)
    release(new Response(JSON.stringify({ kind: 'rejected', code: 'busy' })))
    await first
    expect(dispatch).toHaveBeenCalledTimes(2)
    await client.import({ ...state, status: 'ready' })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(dispatch).toHaveBeenCalledTimes(2)
  })
})
