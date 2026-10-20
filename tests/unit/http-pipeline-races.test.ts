import { fork } from 'node:child_process'
import { EventEmitter, getEventListeners } from 'node:events'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AnalysisOutcomeSchema } from '../../src/contracts/document-analysis.ts'
import { runPipeline } from '../../src/backend/http/run-pipeline.ts'

vi.mock('node:child_process', () => ({ fork: vi.fn() }))
beforeEach(() => { vi.mocked(fork).mockReset() })
afterEach(() => { vi.restoreAllMocks() })

const context = { contractVersion: '2' as const, extractionVersion: '1' as const,
  requestId: 'race', reportHash: 'a'.repeat(64), documentName: 'race.pdf', mode: 'demo' as const, pageCount: 1 }
const input = () => ({ bytes: Buffer.from('%PDF-fixture'), documentName: 'race.pdf', requestId: 'race', sessionId: 'race' })
const completed = () => AnalysisOutcomeSchema.parse({ ...context, status: 'completed',
  validationScope: 'structure-and-source', findings: [], uncertainCandidates: [], limitations: [] })
function processDouble() {
  const child = Object.assign(new EventEmitter(), {
    pid: 123, exitCode: null, signalCode: null,
    send: vi.fn(() => true), kill: vi.fn(() => true),
  })
  vi.mocked(fork).mockReturnValue(child as unknown as ReturnType<typeof fork>)
  return child
}

describe('Story 2.5 – uavhengig review av IPC-/abort-race og cleanup', () => {
  it('retur levert etter absolutt frist blir timeout før timer-callback, og venter på close', async () => {
    let now = 10
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    const child = processDouble()
    const document = input()
    const controller = new AbortController()
    const markers = new Set<string>()
    const pending = runPipeline(document, controller.signal, markers, {})
    let settled = false
    void pending.finally(() => { settled = true })
    child.emit('message', { kind: 'adapter-ready', context })
    expect(markers.size).toBe(1)
    now = 60_010
    child.emit('message', { kind: 'outcome', outcome: completed() })
    await new Promise(resolve => setImmediate(resolve))
    expect(settled).toBe(false)
    expect(child.kill).toHaveBeenCalledExactlyOnceWith('SIGKILL')
    child.emit('close')
    await expect(pending).resolves.toMatchObject({ status: 'failed', error: { code: 'timeout' } })
    expect(markers.size).toBe(1)
    expect(document.bytes.length).toBe(0)
    expect(child.eventNames()).toEqual([])
    expect(getEventListeners(controller.signal, 'abort')).toEqual([])
  })

  it('abort vinner over allerede kølagt terminalmelding og beholder adaptermarkør', async () => {
    const child = processDouble()
    const document = input()
    const controller = new AbortController()
    const markers = new Set<string>()
    const pending = runPipeline(document, controller.signal, markers, {})
    const rejected = expect(pending).rejects.toMatchObject({ code: 'processing-failure', status: 499 })
    child.emit('message', { kind: 'adapter-ready', context })
    controller.abort()
    child.emit('message', { kind: 'outcome', outcome: completed() })
    await new Promise(resolve => setImmediate(resolve))
    expect(child.kill).toHaveBeenCalledExactlyOnceWith('SIGKILL')
    child.emit('close')
    await rejected
    expect(markers.size).toBe(1)
    expect(document.bytes.length).toBe(0)
    expect(child.eventNames()).toEqual([])
    expect(getEventListeners(controller.signal, 'abort')).toEqual([])
  })

  it('mismatchet prosesskontekst gir trygg feil uten adaptertillatelse eller beholdte lyttere', async () => {
    const child = processDouble()
    const document = input()
    const markers = new Set<string>()
    const pending = runPipeline(document, new AbortController().signal, markers, {
      onLifecycle: () => { throw new Error('PRIVATE diagnostics failure') },
    })
    const rejected = expect(pending).rejects.toMatchObject({ code: 'processing-failure', status: 500, message: 'processing-failure' })
    child.emit('message', { kind: 'adapter-ready', context: { ...context, requestId: 'other-request' } })
    await new Promise(resolve => setImmediate(resolve))
    expect(markers.size).toBe(0)
    expect(child.send).toHaveBeenCalledTimes(1)
    child.emit('close')
    await rejected
    expect(document.bytes.length).toBe(0)
    expect(child.eventNames()).toEqual([])
  })
})
