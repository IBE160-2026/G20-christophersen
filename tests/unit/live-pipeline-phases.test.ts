import { fork } from 'node:child_process'
import { EventEmitter } from 'node:events'
import { afterEach, expect, it, vi } from 'vitest'
import { runPipeline } from '../../src/backend/http/run-pipeline.ts'

vi.mock('node:child_process', () => ({ fork: vi.fn() }))
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })
const context = { contractVersion: '2', extractionVersion: '1', requestId: 'phase',
  reportHash: 'b'.repeat(64), documentName: 'phase.pdf', mode: 'live', pageCount: 1 }
const completed = { ...context, status: 'completed', validationScope: 'structure-and-source', findings: [], uncertainCandidates: [], limitations: [] }
function setup() {
  let now = 0
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  const child = Object.assign(new EventEmitter(), { pid: 123, exitCode: null, signalCode: null,
    send: vi.fn(() => true), kill: vi.fn(() => true) })
  vi.mocked(fork).mockReturnValue(child as unknown as ReturnType<typeof fork>)
  const input = { bytes: Buffer.from('%PDF-fixture'), documentName: 'phase.pdf', requestId: 'phase', sessionId: 'phase' }
  const markers = new Set<string>()
  const pending = runPipeline(input, new AbortController().signal, markers, { mode: 'live' })
  return { child, input, markers, pending, setTime(value: number) { now = value } }
}
it('4.3 R1: document phase <60s, live >60s <120s completes, waits for real close', async () => {
  const { child, pending, markers, input, setTime } = setup()
  setTime(59_999)
  child.emit('message', { kind: 'adapter-ready', context })
  expect(markers.size).toBe(1)
  setTime(179_998)
  child.emit('message', { kind: 'outcome', outcome: completed })
  let settled = false
  void pending.then(() => { settled = true })
  await new Promise(resolve => setImmediate(resolve))
  expect(child.kill).toHaveBeenCalledExactlyOnceWith('SIGKILL')
  expect(settled).toBe(false)
  child.emit('close')
  await expect(pending).resolves.toMatchObject({ status: 'completed', mode: 'live' })
  expect(input.bytes.length).toBe(0)
})
it('4.3 R1: 120s terminal arrival loses before timer callback, marker survives cleanup', async () => {
  const { child, pending, markers, setTime } = setup()
  setTime(10_000)
  child.emit('message', { kind: 'adapter-ready', context })
  setTime(130_000)
  child.emit('message', { kind: 'outcome', outcome: completed })
  await new Promise(resolve => setImmediate(resolve))
  expect(child.kill).toHaveBeenCalledExactlyOnceWith('SIGKILL')
  child.emit('close')
  await expect(pending).resolves.toMatchObject({ status: 'failed', error: { code: 'timeout' } })
  expect(markers.size).toBe(1)
})
it('4.3 R3: document at 60s never grants adapter permission', async () => {
  const { child, pending, markers, setTime } = setup()
  child.emit('message', { kind: 'context', context })
  setTime(60_000)
  child.emit('message', { kind: 'adapter-ready', context })
  await new Promise(resolve => setImmediate(resolve))
  expect(child.send).toHaveBeenCalledTimes(1)
  expect(markers.size).toBe(0)
  child.emit('close')
  await expect(pending).resolves.toMatchObject({ status: 'failed', error: { code: 'timeout' } })
})
it('4.3 R1: production transport handshake preserves 120s after configuration', async () => {
  const { child, pending, setTime } = setup()
  child.emit('message', { kind: 'adapter-ready', context })
  setTime(5_000)
  child.emit('message', { kind: 'live-request-started', startedAt: process.hrtime.bigint() })
  setTime(124_999)
  child.emit('message', { kind: 'outcome', outcome: completed })
  await new Promise(resolve => setImmediate(resolve))
  child.emit('close')
  await expect(pending).resolves.toMatchObject({ status: 'completed' })
})

it('4.3 R1: delayed production start IPC cannot restart an already elapsed live deadline', async () => {
  const { child, pending, setTime } = setup()
  child.emit('message', { kind: 'adapter-ready', context })
  setTime(10_000)
  child.emit('message', { kind: 'live-request-started', startedAt: process.hrtime.bigint() - 120_000_000_000n })
  child.emit('message', { kind: 'outcome', outcome: completed })
  await new Promise(resolve => setImmediate(resolve))
  child.emit('close')
  await expect(pending).resolves.toMatchObject({ status: 'failed', error: { code: 'timeout' } })
})

for (const phase of ['document', 'adapter', 'transport'] as const) {
  it(`4.3: silent ${phase} expires from its timer and holds resources until close`, async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const { child, pending, markers, input, setTime } = setup()
    child.emit('message', { kind: 'context', context })
    if (phase !== 'document') child.emit('message', { kind: 'adapter-ready', context })
    if (phase === 'transport') {
      vi.spyOn(process.hrtime, 'bigint').mockReturnValue(0n)
      child.emit('message', { kind: 'live-request-started', startedAt: 0n })
    }
    const duration = phase === 'document' ? 60_000 : 120_000
    setTime(duration)
    await vi.advanceTimersByTimeAsync(duration)
    let settled = false
    void pending.then(() => { settled = true })
    expect(child.kill).toHaveBeenCalledExactlyOnceWith('SIGKILL')
    expect(settled).toBe(false)
    expect(markers.size).toBe(phase === 'document' ? 0 : 1)
    child.emit('close')
    await expect(pending).resolves.toMatchObject({ status: 'failed', error: { code: 'timeout' } })
    expect(input.bytes.length).toBe(0)
    expect(vi.getTimerCount()).toBe(0)
  })
}

for (const invalid of ['before-permit', 'duplicate', 'future', 'malformed'] as const) {
  it(`4.3: ${invalid} transport handshake fails safely`, async () => {
    const { child, pending, markers } = setup()
    child.emit('message', { kind: 'context', context })
    vi.spyOn(process.hrtime, 'bigint').mockReturnValue(1_000_000n)
    if (invalid !== 'before-permit') child.emit('message', { kind: 'adapter-ready', context })
    if (invalid === 'duplicate') child.emit('message', { kind: 'live-request-started', startedAt: 0n })
    child.emit('message', { kind: 'live-request-started', startedAt: invalid === 'future' ? 2_000_000n : invalid === 'malformed' ? 'invalid' : 0n })
    child.emit('message', { kind: 'outcome', outcome: completed })
    await new Promise(resolve => setImmediate(resolve))
    expect(child.kill).toHaveBeenCalledExactlyOnceWith('SIGKILL')
    child.emit('close')
    await expect(pending).resolves.toMatchObject({ status: 'failed', error: { code: 'adapter-failure' } })
    expect(markers.size).toBe(invalid === 'before-permit' ? 0 : 1)
  })
}
