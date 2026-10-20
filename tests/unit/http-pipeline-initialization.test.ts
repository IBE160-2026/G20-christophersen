import { EventEmitter, getEventListeners } from 'node:events'
import { fork } from 'node:child_process'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { runPipeline } from '../../src/backend/http/run-pipeline.ts'

vi.mock('node:child_process', () => ({ fork: vi.fn() }))
beforeEach(() => { vi.mocked(fork).mockReset() })
const input = () => ({ bytes: Buffer.from('%PDF-fixture'), documentName: 'fixture.pdf', requestId: 'request', sessionId: 'session' })

describe('HTTP-prosessens delvise initialisering', () => {
  it('allerede avbrutt request frigjør originalreferansen uten å opprette prosess', async () => {
    const document = input()
    const controller = new AbortController()
    controller.abort()
    await expect(runPipeline(document, controller.signal, new Set(), {})).rejects.toMatchObject({ code: 'processing-failure', status: 499 })
    expect(document.bytes.byteLength).toBe(0)
    expect(fork).not.toHaveBeenCalled()
  })

  it('synkron feil under fork frigjør originalreferansen og gir bare trygg transportkode', async () => {
    vi.mocked(fork).mockImplementation(() => { throw new Error('PRIVATE runtime detail') })
    const document = input()
    const pending = runPipeline(document, new AbortController().signal, new Set(), {})
    await expect(pending).rejects.toMatchObject({ code: 'processing-failure', status: 500, message: 'processing-failure' })
    expect(document.bytes.byteLength).toBe(0)
    expect(fork).toHaveBeenCalledOnce()
  })

  it('asynkron spawnfeil avventer close og rydder bytes og alle lyttere', async () => {
    const child = Object.assign(new EventEmitter(), {
      pid: undefined, exitCode: null as number | null, signalCode: null,
      send: vi.fn(() => true), kill: vi.fn(() => true),
    })
    vi.mocked(fork).mockReturnValue(child as unknown as ReturnType<typeof fork>)
    const document = input()
    const controller = new AbortController()
    const lifecycle: string[] = []
    const pending = runPipeline(document, controller.signal, new Set(), {
      onLifecycle: event => lifecycle.push(event.kind),
    })
    let settled = false
    void pending.then(() => { settled = true }, () => { settled = true })
    child.exitCode = 1
    child.emit('error', new Error('PRIVATE asynchronous spawn detail'))
    await new Promise(resolve => setImmediate(resolve))
    expect(settled).toBe(false)
    child.emit('close', 1)
    await expect(pending).rejects.toMatchObject({ code: 'processing-failure', status: 500, message: 'processing-failure' })
    expect(lifecycle).toEqual(['process-started', 'process-closed'])
    expect(document.bytes.byteLength).toBe(0)
    expect(child.eventNames()).toEqual([])
    expect(getEventListeners(controller.signal, 'abort')).toEqual([])
    expect(child.kill).not.toHaveBeenCalled()
  })
})
