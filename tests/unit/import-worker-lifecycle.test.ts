import { describe, expect, it, vi, beforeEach } from 'vitest'

const state = vi.hoisted(() => ({
  plans: [] as { reply?: unknown; error?: Error; termination?: Promise<number>; terminateError?: boolean }[],
  workers: [] as { name: string; terminate: ReturnType<typeof vi.fn> }[],
}))
vi.mock('node:worker_threads', async () => {
  const { EventEmitter } = await import('node:events')
  return { Worker: class extends EventEmitter {
    terminate: ReturnType<typeof vi.fn>
    constructor(url: URL) {
      super()
      const plan = state.plans.shift()
      if (!plan) throw new Error('Unexpected worker')
      this.terminate = vi.fn(() => plan.terminateError ? Promise.reject(new Error('termination failed')) : plan.termination ?? Promise.resolve(0))
      state.workers.push({ name: url.pathname.split('/').at(-1)!, terminate: this.terminate })
      queueMicrotask(() => plan.error ? this.emit('error', plan.error) : this.emit('message', plan.reply))
    }
  } }
})
import { extractImport } from '../../src/backend/documents/extract-import.ts'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'

const format = { status: 'format-validated' as const, documentName: 'synthetic.pdf', reportHash: 'a'.repeat(64), originalBytes: new Uint8Array([1, 2]), pageCount: 41 }
const group = (start: number, count: number) => ({ kind: 'extracted', textBytes: 0, attachments: [],
  pages: Array.from({ length: count }, (_, index) => ({ pdfPage: start + index + 1, text: '', status: 'blank', reason: null, rasterUnprocessed: false })) })
beforeEach(() => { state.plans.length = 0; state.workers.length = 0 })
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
