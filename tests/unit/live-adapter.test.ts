import { Worker } from 'node:worker_threads'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createAnalysisBackend } from '../../src/backend/analysis/backend-config.ts'
import { createLiveAdapter } from '../../src/backend/analysis/live-adapter.ts'
import { analyzeDocument } from '../../src/backend/analysis/analyze-document.ts'
import type { DocumentBasis } from '../../src/contracts/document-analysis.ts'

const document: DocumentBasis = { contractVersion: '2', extractionVersion: '1', requestId: 'live-unit',
  reportHash: 'a'.repeat(64), documentName: 'fictional.pdf', mode: 'live', pageCount: 4,
  pages: Array.from({ length: 4 }, (_, i) => ({ pdfPage: i + 1, status: 'readable', text: `PDF-side ${i + 1}`, reason: null })) }
const empty = { findings: [], limitations: [] }
const envelope = (value: unknown = empty) => ({ status: 'completed', output: [{ type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text: JSON.stringify(value) }] }] })
const candidate = (extra = {}) => ({ findingId: 'one', description: 'Trofast beskrivelse', grade: 'TG3', source: { documentName: document.documentName, reportHash: document.reportHash, pdfPage: 4 }, uncertainties: [], ...extra })
function setup(fetch: typeof globalThis.fetch, signal?: AbortSignal) {
  const backend = createAnalysisBackend('live', { environment: { OPENAI_API_KEY: 'fictional-only' }, fetch })
  if (backend.mode !== 'live') throw new Error()
  return createLiveAdapter(backend, { signal })
}
function reply(value: unknown) { return new Response(JSON.stringify(value), { headers: { 'content-type': 'application/json' } }) }
afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers() })

describe('Story 4.2 — controlled real SDK transport', () => {
  it('accepts terminal empty list and cleans owned parser', async () => {
    const terminate = vi.spyOn(Worker.prototype, 'terminate')
    const fetch = vi.fn<typeof globalThis.fetch>(async () => reply(envelope()))
    expect(await analyzeDocument(document, setup(fetch))).toMatchObject({ status: 'completed', findings: [], uncertainCandidates: [], mode: 'live' })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(terminate.mock.instances[0]).toMatchObject({ threadId: -1 })
  })
  it.each([
    { ...envelope(), error: { code: 'provider-error', message: 'PRIVATE' } },
    { ...envelope(), output: [{ ...envelope().output[0], content: [...envelope().output[0]!.content, ...envelope().output[0]!.content] }] },
    { ...envelope(), output: [{ type: 'unknown-output' }, ...envelope().output] },
    { ...envelope(), output: [{ type: 'reasoning', summary: [] }] },
    ...['incomplete', 'in_progress'].map(status => ({ ...envelope(), output: [{ type: 'reasoning', status, summary: [] }, ...envelope().output] })),
    {}, { status: 'incomplete', output: envelope().output }, { ...envelope(), incomplete_details: { reason: 'max_output_tokens' } },
    { ...envelope(), status: 'failed' }, { ...envelope(), output: [{ type: 'message', status: 'completed', role: 'assistant', content: [{ type: 'refusal', refusal: 'no' }] }] },
    envelope({ findings: [] }), envelope({ findings: 'wrong', limitations: [] }), envelope({ ...empty, P: '1' }),
    envelope({ findings: [candidate(), candidate()], limitations: [] }),
    { ...envelope(), output: [{ ...envelope().output[0], content: [{ type: 'output_text', text: '{broken' }] }] },
    { ...envelope(), output: [{ ...envelope().output[0], status: undefined }] },
  ])('rejects invalid/refused/truncated/nonterminal response %# without repair', async value => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => reply(value))
    expect(await analyzeDocument(document, setup(fetch))).toMatchObject({ status: 'failed', error: { code: 'invalid-response' } })
    expect(fetch).toHaveBeenCalledTimes(1)
  })
  it.each([400, 408, 409, 429, 500, 503])('makes one attempt on HTTP %s without exposing raw failure', async status => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => new Response('PRIVATE-RAW-ERROR', { status }))
    const result = await analyzeDocument(document, setup(fetch))
    expect(result).toMatchObject({ status: 'failed', error: { code: 'transport-failure' } })
    expect(JSON.stringify(result)).not.toContain('PRIVATE')
    expect(fetch).toHaveBeenCalledTimes(1)
  })
  it('does not retry network failures', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => { throw new Error('PRIVATE') })
    expect(await analyzeDocument(document, setup(fetch))).toMatchObject({ status: 'failed', error: { code: 'transport-failure' } })
    expect(fetch).toHaveBeenCalledTimes(1)
  })
  it('preserves RT-5/6/7 original source and uncertainty without guessing', async () => {
    const findings = [candidate(), candidate({ findingId: 'grade', grade: 'TG?', uncertainties: ['Uklar grad'] }),
      candidate({ findingId: 'page', source: { documentName: document.documentName, reportHash: 'b'.repeat(64), pdfPage: '4' } }),
      candidate({ findingId: 'missing', source: null }), candidate({ findingId: 'other', source: { documentName: 'other.pdf', reportHash: null, pdfPage: 4 } })]
    const result = await analyzeDocument(document, setup(async () => reply(envelope({ findings, limitations: [] }))))
    expect(result).toMatchObject({ status: 'completed', requestId: document.requestId, reportHash: document.reportHash })
    if (result.status !== 'completed') throw new Error()
    expect(result.findings[0]?.source.pdfPage).toBe(4)
    expect(result.uncertainCandidates.map(item => item.original)).toEqual(findings.slice(1))
  })
  it('rejects a finding on a proven blank page', async () => {
    const input = { ...document, pages: document.pages.map(page => page.pdfPage === 4 ? { ...page, status: 'blank' as const, text: '' } : page) }
    expect(await analyzeDocument(input, setup(async () => reply(envelope({ findings: [candidate()], limitations: [] }))))).toMatchObject({ status: 'failed', error: { code: 'invalid-response' } })
  })
  it('blocks document errors before fetch', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>()
    const input = { ...document, pages: document.pages.map(page => ({ ...page, status: 'unknown' as const })) }
    expect(await analyzeDocument(input, setup(fetch))).toMatchObject({ status: 'failed', error: { kind: 'document' } })
    expect(fetch).not.toHaveBeenCalled()
  })
  it('aborts before start without fetch', async () => {
    const abort = new AbortController(); abort.abort()
    const fetch = vi.fn<typeof globalThis.fetch>()
    expect(await analyzeDocument(document, setup(fetch, abort.signal))).toMatchObject({ status: 'failed', error: { code: 'interrupted' } })
    expect(fetch).not.toHaveBeenCalled()
  })
  it('cancels streaming body and signal on external abort', async () => {
    const abort = new AbortController()
    const cancel = vi.fn()
    let started!: () => void
    const ready = new Promise<void>(resolve => { started = resolve })
    const fetch = vi.fn<typeof globalThis.fetch>(async () => {
      const body = new ReadableStream<Uint8Array>({ cancel })
      const getReader = body.getReader.bind(body)
      body.getReader = (() => { started(); return getReader() }) as typeof body.getReader
      return new Response(body)
    })
    const pending = analyzeDocument(document, setup(fetch, abort.signal))
    await ready
    abort.abort()
    expect(await pending).toMatchObject({ status: 'failed', error: { code: 'interrupted' } })
    expect(cancel).toHaveBeenCalled()
  })
  it('absolute deadline cancels a hung body after headers', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
    const cancel = vi.fn()
    let started!: () => void
    const ready = new Promise<void>(resolve => { started = resolve })
    const fetch = vi.fn<typeof globalThis.fetch>(async () => { started(); return new Response(new ReadableStream({ cancel })) })
    const pending = analyzeDocument(document, setup(fetch))
    await ready
    await vi.advanceTimersByTimeAsync(120000)
    expect(await pending).toMatchObject({ status: 'failed', error: { code: 'timeout' } })
    expect(cancel).toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })
})


describe('absolute deadline and owned work termination', () => {
  it.each([200, 429])('bounds open HTTP %s body even when underlying cancel never resolves', async status => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
    let started!: () => void
    const ready = new Promise<void>(resolve => { started = resolve })
    const cancel = vi.fn(() => new Promise<void>(() => {}))
    const fetch = vi.fn<typeof globalThis.fetch>(async () => { started(); return new Response(new ReadableStream({ cancel }), { status }) })
    const pending = analyzeDocument(document, setup(fetch))
    await ready
    await vi.advanceTimersByTimeAsync(120000)
    expect(await pending).toMatchObject({ status: 'failed', error: { code: 'timeout' } })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(cancel).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(0)
  })
  it('terminates the parser/validator worker when deadline expires during its work', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
    const terminate = vi.spyOn(Worker.prototype, 'terminate')
    const original = Worker.prototype.once
    vi.spyOn(Worker.prototype, 'once').mockImplementation(function (this: Worker, ...args: Parameters<typeof original>) {
      const result = original.apply(this, args)
      if (args[0] === 'message') queueMicrotask(() => { void vi.advanceTimersByTimeAsync(120000) })
      return result
    })
    const fetch = vi.fn<typeof globalThis.fetch>(async () => reply(envelope()))
    expect(await analyzeDocument(document, setup(fetch))).toMatchObject({ status: 'failed', error: { code: 'timeout' } })
    expect(terminate.mock.instances[0]).toMatchObject({ threadId: -1 })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(0)
  })
  it('rejects a late transport response and cancels its body', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
    let resolveResponse!: (response: Response) => void
    let started!: () => void
    const ready = new Promise<void>(resolve => { started = resolve })
    const cancel = vi.fn()
    const fetch = vi.fn<typeof globalThis.fetch>(async () => { started(); return await new Promise<Response>(resolve => { resolveResponse = resolve }) })
    const pending = analyzeDocument(document, setup(fetch))
    await ready
    await vi.advanceTimersByTimeAsync(120000)
    expect(await pending).toMatchObject({ status: 'failed', error: { code: 'timeout' } })
    resolveResponse(new Response(new ReadableStream({ cancel })))
    await vi.advanceTimersByTimeAsync(0)
    expect(cancel).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})

it('does not apply demo 60s deadline to a valid live response at 61s', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
  const fetch = vi.fn<typeof globalThis.fetch>(async () => await new Promise<Response>(resolve => {
    setTimeout(() => resolve(reply(envelope())), 61000)
  }))
  const pending = analyzeDocument(document, setup(fetch))
  await vi.advanceTimersByTimeAsync(61000)
  expect(await pending).toMatchObject({ status: 'completed', findings: [] })
  expect(fetch).toHaveBeenCalledTimes(1)
  expect(vi.getTimerCount()).toBe(0)
})

it('aborts hung transport before headers at the absolute deadline', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
  let started!: () => void
  const ready = new Promise<void>(resolve => { started = resolve })
  let signal: AbortSignal | null | undefined
  const fetch = vi.fn<typeof globalThis.fetch>(async (_url, init) => {
    signal = init?.signal
    started()
    return await new Promise<Response>((_resolve, reject) => signal?.addEventListener('abort', () => reject(new Error('PRIVATE')), { once: true }))
  })
  const pending = analyzeDocument(document, setup(fetch))
  await ready
  await vi.advanceTimersByTimeAsync(120000)
  expect(await pending).toMatchObject({ status: 'failed', error: { code: 'timeout' } })
  expect(signal?.aborted).toBe(true)
  expect(fetch).toHaveBeenCalledTimes(1)
})


describe('review F1/F2 — terminalization after real worker cleanup', () => {
  it.each(['completed', undefined])('allows valid reasoning status %s plus message', async status => {
    const value = { ...envelope(), output: [{ type: 'reasoning', ...(status === undefined ? {} : { status }), summary: [] }, ...envelope().output] }
    const fetch = vi.fn<typeof globalThis.fetch>(async () => reply(value))
    expect(await analyzeDocument(document, setup(fetch))).toMatchObject({ status: 'completed', findings: [] })
    expect(fetch).toHaveBeenCalledTimes(1)
  })
  it.each(['deadline', 'abort', 'cleanup-failure'] as const)('applies %s after cleanup on a failed extraction', async variant => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
    const abort = new AbortController()
    const original = Worker.prototype.terminate
    const terminate = vi.spyOn(Worker.prototype, 'terminate').mockImplementation(async function (this: Worker) {
      const exit = await original.call(this)
      expect(this.threadId).toBe(-1)
      if (variant === 'deadline') await vi.advanceTimersByTimeAsync(120001)
      else if (variant === 'abort') abort.abort()
      else throw new Error('PRIVATE cleanup failure')
      return exit
    })
    const fetch = vi.fn<typeof globalThis.fetch>(async () => reply({ status: 'completed', output: [] }))
    const outcome = await analyzeDocument(document, setup(fetch, abort.signal))
    expect(outcome).toMatchObject({ status: 'failed', error: {
      code: variant === 'deadline' ? 'timeout' : variant === 'abort' ? 'interrupted' : 'adapter-failure',
    } })
    expect(JSON.stringify(outcome)).not.toContain('PRIVATE')
    expect(terminate).toHaveBeenCalledTimes(1)
    expect(terminate.mock.instances[0]).toMatchObject({ threadId: -1 })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(0)
  })
})
