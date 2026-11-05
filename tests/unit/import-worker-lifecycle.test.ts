import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

const state = vi.hoisted(() => ({
  plans: [] as { reply?: unknown; hold?: boolean; messages?: unknown[]; error?: Error; termination?: Promise<number>; terminateError?: boolean }[],
  workers: [] as { name: string; bytes?: Uint8Array; env?: Record<string, string>; terminate: ReturnType<typeof vi.fn> }[],
}))
vi.mock('node:worker_threads', async () => {
  const { EventEmitter } = await import('node:events')
  return { Worker: class extends EventEmitter {
    terminate: ReturnType<typeof vi.fn>
    constructor(url: URL, options?: { workerData?: { bytes?: Uint8Array }; env?: Record<string, string> }) {
      super()
      const plan = state.plans.shift()
      if (!plan) throw new Error('Unexpected worker')
      this.terminate = vi.fn(() => plan.terminateError ? Promise.reject(new Error('termination failed')) : plan.termination ?? Promise.resolve(0))
      state.workers.push({ name: url.pathname.split('/').at(-1)!, bytes: options?.workerData?.bytes, env: options?.env, terminate: this.terminate })
      queueMicrotask(() => {
        for (const message of plan.messages ?? []) this.emit('message', message)
        if (plan.error) this.emit('error', plan.error)
        else if (!plan.hold) this.emit('message', plan.reply)
      })
    }
  } }
})
import { extractImport } from '../../src/backend/documents/extract-import.ts'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'

const format = { status: 'format-validated' as const, documentName: 'synthetic.pdf', reportHash: 'a'.repeat(64), originalBytes: new Uint8Array([1, 2]), pageCount: 41 }
const group = (start: number, count: number) => ({ kind: 'extracted', textBytes: 0, attachments: [],
  pages: Array.from({ length: count }, (_, index) => ({ pdfPage: start + index + 1, text: '', status: 'blank', reason: null, rasterUnprocessed: false })) })
beforeEach(() => { state.plans.length = 0; state.workers.length = 0 })
afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers() })
function deferredTermination() {
  let resolve!: (value: number) => void
  const promise = new Promise<number>(finish => { resolve = finish })
  return { promise, resolve }
}

describe('bounded import worker ownership', () => {
  it('awaits prior group termination before starting the next parser', async () => {
    const closed = deferredTermination()
    state.plans.push({ reply: group(0, 20), termination: closed.promise }, { reply: group(20, 20) }, { reply: group(40, 1) })
    const pending = extractImport(format)
    await vi.waitFor(() => expect(state.workers[0]?.terminate).toHaveBeenCalledOnce(), { timeout: 1000 })
    expect(state.workers).toHaveLength(1)
    closed.resolve(0)
    expect((await pending).pages).toHaveLength(41)
    expect(state.workers).toHaveLength(3)
    expect(state.workers[0]!.bytes!.buffer).toBeInstanceOf(SharedArrayBuffer)
    expect(state.workers.every(worker => worker.bytes === state.workers[0]!.bytes)).toBe(true)
    expect([...format.originalBytes]).toEqual([1, 2])
    expect(state.workers.every(worker => worker.terminate.mock.calls.length === 1)).toBe(true)
  })
  it.each(['error', 'malformed', 'termination'] as const)('stops after a later group %s and attempts termination', async failure => {
    state.plans.push({ reply: group(0, 20) }, failure === 'error' ? { error: new Error('parser failed') }
      : failure === 'malformed' ? { reply: group(0, 20) } : { reply: group(20, 20), terminateError: true }, { reply: group(40, 1) })
    await expect(extractImport(format)).rejects.toThrow()
    expect(state.workers).toHaveLength(2)
    expect(state.workers.every(worker => worker.terminate.mock.calls.length === 1)).toBe(true)
    expect(state.plans).toHaveLength(1)
  })

  it('retains streamed pages and exact text when an in-flight parser exhausts resources', async () => {
    const first = group(0, 1).pages[0]!
    const second = { pdfPage: 2, text: 'TG3\nBevart tekst', status: 'readable', reason: null, rasterUnprocessed: true }
    const metadata = [{ id: 'report', name: 'report.pdf', isPdf: true }]
    state.plans.push({ messages: [{ kind: 'attachments', attachments: metadata }, { kind: 'page', page: first, textBytes: 0 },
      { kind: 'operation', phase: 'text', pdfPage: 2 }, { kind: 'text', page: second, textBytes: Buffer.byteLength(second.text) }],
      error: Object.assign(new Error('bounded parser'), { code: 'ERR_WORKER_OUT_OF_MEMORY' }) },
    { reply: { ...group(2, 1), attachments: metadata, textBytes: Buffer.byteLength(second.text) } })
    const result = await extractImport({ ...format, pageCount: 3 })
    expect(result.pages).toEqual([first, { ...second, status: 'unknown', reason: expect.stringContaining('ressursgrense') }, group(2, 1).pages[0]])
    expect(result.attachments).toEqual(metadata)
    expect(state.workers).toHaveLength(2)
  })
  it('restarts at the next untouched page when cleanup exhausts resources', async () => {
    const first = group(0, 1).pages[0]!
    state.plans.push({ messages: [{ kind: 'page', page: first, textBytes: 0 }, { kind: 'operation', phase: 'cleanup', pdfPage: 1 }],
      error: Object.assign(new Error('bounded cleanup'), { code: 'ERR_WORKER_OUT_OF_MEMORY' }) }, { reply: group(1, 2) })
    expect((await extractImport({ ...format, pageCount: 3 })).pages).toEqual(group(0, 3).pages)
    expect(state.workers).toHaveLength(2)
  })
  it('rejects malformed page progress even when a valid final reply follows', async () => {
    state.plans.push({ messages: [{ kind: 'page', page: group(1, 1).pages[0], textBytes: 0 }], reply: group(0, 1) })
    await expect(extractImport({ ...format, pageCount: 1 })).rejects.toThrow('invalid-format')
  })
  it('retains the hard text-limit rejection after completed pages', async () => {
    state.plans.push({ messages: [{ kind: 'page', page: group(0, 1).pages[0], textBytes: 0 }], reply: { kind: 'text-limit' } })
    await expect(extractImport({ ...format, pageCount: 2 })).rejects.toThrow('text-limit')
  })
  it('preserves bounded delivered chunks as incomplete when OOM interrupts text extraction', async () => {
    const parts = ['TG3\n', 'Bevart 🌊 tekst']
    const text = parts.join(''), size = Buffer.byteLength(text)
    state.plans.push({ messages: [
      { kind: 'operation', phase: 'text', pdfPage: 1 },
      { kind: 'chunk', pdfPage: 1, text: parts[0], textBytes: Buffer.byteLength(parts[0]!) },
      { kind: 'chunk', pdfPage: 1, text: parts[1], textBytes: size },
    ], error: Object.assign(new Error('OOM mid-text'), { code: 'ERR_WORKER_OUT_OF_MEMORY' }) },
    { reply: { ...group(1, 1), textBytes: size } })
    const result = await extractImport({ ...format, pageCount: 2 })
    expect(result.pages[0]).toMatchObject({ pdfPage: 1, text, status: 'incomplete', reason: expect.stringContaining('ressursgrense') })
    expect(result.pages[0]!.text.slice(4)).toBe(parts[1])
    expect(result.pages[1]).toEqual(group(1, 1).pages[0])
  })
  it('continues chunk counters from a conservative per-item quota at the next page', async () => {
    const first = { ...group(0, 1).pages[0]!, text: '🌊', status: 'readable' }
    const second = { ...group(1, 1).pages[0]!, text: 'X', status: 'readable' }
    state.plans.push({ messages: [{ kind: 'chunk', pdfPage: 1, text: '🌊', textBytes: 6 },
      { kind: 'text', page: first, textBytes: 6 }, { kind: 'page', page: first, textBytes: 6 },
      { kind: 'chunk', pdfPage: 2, text: 'X', textBytes: 7 }, { kind: 'page', page: second, textBytes: 7 }],
      reply: { ...group(0, 2), pages: [first, second], textBytes: 7 } })
    expect((await extractImport({ ...format, pageCount: 2 })).pages.map(page => page.text)).toEqual(['🌊', 'X'])
  })
  it('accepts the first verified attachment metadata after initialization OOM', async () => {
    const metadata = [{ id: 'report', name: 'report.pdf', isPdf: true }]
    state.plans.push({ error: Object.assign(new Error('startup OOM'), { code: 'ERR_WORKER_OUT_OF_MEMORY' }) },
      { messages: [{ kind: 'attachments', attachments: metadata }], reply: { ...group(0, 1), attachments: metadata } })
    expect((await extractImport({ ...format, pageCount: 1 })).attachments).toEqual(metadata)
    expect(state.workers).toHaveLength(2)
  })
  it('does not treat explicitly empty verified attachments as unknown metadata', async () => {
    state.plans.push({ reply: group(0, 1) },
      { error: Object.assign(new Error('startup OOM'), { code: 'ERR_WORKER_OUT_OF_MEMORY' }) },
      { reply: { ...group(1, 1), attachments: [{ id: 'changed', name: 'changed.pdf', isPdf: true }] } })
    await expect(extractImport({ ...format, pageCount: 2 })).rejects.toThrow('invalid-format')
  })
  it('preserves completed pages and stops after two consecutive startup resource failures', async () => {
    state.plans.push({ reply: group(0, 1) },
      { error: Object.assign(new Error('startup OOM'), { code: 'ERR_WORKER_OUT_OF_MEMORY' }) },
      { error: Object.assign(new Error('startup OOM'), { code: 'ERR_WORKER_OUT_OF_MEMORY' }) })
    const result = await extractImport({ ...format, pageCount: 5 })
    expect(result.pages[0]).toEqual(group(0, 1).pages[0])
    expect(result.pages.slice(1).map(page => page.pdfPage)).toEqual([2, 3, 4, 5])
    expect(result.pages.slice(1).every(page => page.status === 'unknown' && page.rasterUnprocessed && page.reason?.includes('to forsøk'))).toBe(true)
    expect(state.workers).toHaveLength(3)
    expect(state.workers.every(worker => worker.terminate.mock.calls.length === 1)).toBe(true)
  })
  it.each(['replace', 'omit'] as const)('rejects a final reply that can %s pending text', async kind => {
    const first = group(0, 1).pages[0]!
    const pending = { ...group(1, 1).pages[0]!, text: 'Bevart tekst', status: 'readable', reason: null }
    const size = Buffer.byteLength(pending.text)
    state.plans.push({ messages: [{ kind: 'page', page: first, textBytes: 0 }, { kind: 'text', page: pending, textBytes: size }],
      reply: { ...group(0, 2), pages: kind === 'omit' ? [first] : [first, { ...pending, text: 'Erstattet' }], textBytes: size } })
    await expect(extractImport({ ...format, pageCount: 2 })).rejects.toThrow('invalid-format')
  })
  it('the RSS timer retains chunks and metadata and awaits termination before another parser', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    vi.spyOn(process, 'memoryUsage').mockReturnValue({ rss: 1000, heapTotal: 0, heapUsed: 0, external: 0, arrayBuffers: 0 })
    const closed = deferredTermination(), text = 'Bevart tekst', size = Buffer.byteLength(text)
    const metadata = [{ id: 'report', name: 'report.pdf', isPdf: true }]
    const first = group(0, 1).pages[0]!
    state.plans.push({ hold: true, termination: closed.promise, messages: [{ kind: 'attachments', attachments: metadata },
      { kind: 'page', page: first, textBytes: 0 }, { kind: 'operation', phase: 'text', pdfPage: 2 },
      { kind: 'chunk', pdfPage: 2, text, textBytes: size }] },
      { reply: { ...group(2, 1), attachments: metadata, textBytes: size } })
    const pending = extractImport({ ...format, pageCount: 3 }, { resourceLimitBytes: 500 })
    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(10)
    expect(state.workers[0]!.terminate).toHaveBeenCalledOnce()
    expect(state.workers).toHaveLength(1)
    closed.resolve(0)
    const result = await pending
    expect(result.pages[0]).toEqual(first)
    expect(result.pages[1]).toMatchObject({ pdfPage: 2, text, status: 'incomplete', reason: expect.stringContaining('ressursgrense') })
    expect(result.pages[2]).toEqual(group(2, 1).pages[0])
    expect(result.attachments).toEqual(metadata)
    expect(state.workers).toHaveLength(2)
  })
  it('terminates the isolated public container before independent counting and keeps the snapshot', async () => {
    const closed = deferredTermination(), bytes = new Uint8Array([37, 80, 68, 70, 45])
    state.plans.push({ reply: { kind: 'opened' }, termination: closed.promise }, { reply: { kind: 'counted', pageCount: 1 } })
    const pending = validatePdf(bytes, 'synthetic.pdf', { maxPages: 200 })
    bytes.fill(0)
    await vi.waitFor(() => expect(state.workers[0]?.terminate).toHaveBeenCalledOnce(), { timeout: 1000 })
    expect(state.workers).toHaveLength(1)
    closed.resolve(0)
    const result = await pending
    expect(result.status).toBe('format-validated')
    if (result.status === 'format-validated') expect([...result.originalBytes]).toEqual([37, 80, 68, 70, 45])
    expect(state.workers.map(worker => worker.name)).toEqual(['pdf-container-worker.ts', 'pdf-page-tree-worker.ts'])
    expect(state.workers[0]!.env).toEqual({ DISABLE_SYSTEM_FONTS_LOAD: '1' })
    expect(state.workers.every(worker => worker.terminate.mock.calls.length === 1)).toBe(true)
  })
  it.each(['invalid', 'unavailable', 'malformed', 'error', 'termination'] as const)('profile200 container %s stops before counting with cleanup', async failure => {
    state.plans.push(failure === 'error' ? { error: new Error('DO-NOT-EXPOSE') }
      : failure === 'termination' ? { reply: { kind: 'opened' }, terminateError: true }
        : { reply: failure === 'malformed' ? null : failure === 'invalid' ? { kind: 'invalid', name: 'InvalidPDFException' } : { kind: 'unavailable' } })
    const pending = validatePdf(new Uint8Array([37, 80, 68, 70, 45]), 'synthetic.pdf', { maxPages: 200 })
    if (failure === 'invalid') expect(await pending).toMatchObject({ status: 'failed', error: { code: 'invalid-container' } })
    else await expect(pending).rejects.toThrow(/^PDF-behandlingen kunne ikke gjennomføres\. Prøv igjen\.$/)
    expect(state.workers).toHaveLength(1)
    expect(state.workers[0]!.terminate).toHaveBeenCalledOnce()
  })
})
