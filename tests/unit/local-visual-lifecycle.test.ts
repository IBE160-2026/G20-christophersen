import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'
import { createHash } from 'node:crypto'
import { afterEach, expect, it, vi } from 'vitest'
import { setImportMeasurementSink, type ImportMeasurement } from '../../src/backend/documents/import-measurement.ts'

const state = vi.hoisted(() => ({ callbacks: [] as ((error: Error | null, stdout: string) => void)[] }))
vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
  execFile: vi.fn((...args: unknown[]) => { state.callbacks.push(args.at(-1) as (error: Error | null, stdout: string) => void); return { kill: vi.fn() } }),
}))
vi.mock('node:fs/promises', async importOriginal => ({
  ...await importOriginal<typeof import('node:fs/promises')>(),
  readFile: vi.fn(async () => Buffer.from('synthetic Swift source')),
  stat: vi.fn(async () => ({ isFile: () => true })),
}))
import { spawn } from 'node:child_process'
import { extractLocalVisualEvidence } from '../../src/backend/documents/local-visual-ocr.ts'

afterEach(() => { setImportMeasurementSink(undefined); vi.useRealTimers(); vi.clearAllMocks(); state.callbacks.length = 0 })
it('finishes native measurements once and ignores a pending ps reply after OCR closes', async () => {
  const platform = Object.getOwnPropertyDescriptor(process, 'platform')!
  Object.defineProperty(process, 'platform', { ...platform, value: 'darwin' })
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'] })
  const child = Object.assign(new EventEmitter(), { pid: 1234, stdin: new PassThrough(), stdout: new PassThrough(), kill: vi.fn() })
  vi.mocked(spawn).mockReturnValue(child as unknown as ReturnType<typeof spawn>)
  const measurements: ImportMeasurement[] = []
  setImportMeasurementSink(measurement => measurements.push(measurement))
  try {
    const bytes = new Uint8Array([1, 2, 3]), hash = createHash('sha256').update(bytes).digest('hex')
    const pending = extractLocalVisualEvidence(bytes, hash, 'synthetic.pdf', [1])
    await vi.advanceTimersByTimeAsync(100)
    expect(state.callbacks).toHaveLength(1)
    child.emit('error', new Error('synthetic interruption'))
    child.emit('close', 1)
    await pending
    expect(measurements).toEqual([{ process: 'local-ocr', phase: 'visual', point: 'end', rss: 0 }])
    state.callbacks[0]!(null, '999999')
    expect(measurements).toHaveLength(1)
  } finally {
    Object.defineProperty(process, 'platform', platform)
    child.stdin.destroy(); child.stdout.destroy()
  }
})
