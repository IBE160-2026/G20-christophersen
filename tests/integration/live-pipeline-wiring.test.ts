import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import * as childProcess from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, vi } from 'vitest'
import { runPipeline } from '../../src/backend/http/run-pipeline.ts'

vi.mock('node:child_process', async importOriginal => {
  const actual = await importOriginal<typeof import('node:child_process')>()
  return { ...actual, fork: vi.fn(actual.fork) }
})

it('4.3 R1: actual production child grants a full transport deadline after initialization', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'ibe160-live-deadline-wiring-'))
  const releaseFile = join(directory, 'release')
  const transport = new URL('../helpers/http-live-sdk-transport.ts', import.meta.url)
  transport.searchParams.set('release', releaseFile)
  const previousKey = process.env.OPENAI_API_KEY
  process.env.OPENAI_API_KEY = 'fictional-offline-only'
  const controller = new AbortController()
  const input = { bytes: await readFile(new URL('../fixtures/property-cases/F1-tilstandsrapport.pdf', import.meta.url)),
    documentName: 'deadline-wiring.pdf', requestId: 'deadline-wiring', sessionId: 'deadline-wiring' }
  let now = 0
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  let transportAnnounced!: () => void
  const announced = new Promise<void>(resolve => { transportAnnounced = resolve })
  const actualFork = (await vi.importActual<typeof import('node:child_process')>('node:child_process')).fork
  // Keep the OS process and IPC real; only observe its transport announcement.
  vi.mocked(childProcess.fork).mockImplementation((...args: Parameters<typeof childProcess.fork>) => {
    const child = actualFork(...args)
    child.on('message', message => {
      if (typeof message === 'object' && message !== null && 'kind' in message && message.kind === 'live-request-started') transportAnnounced()
    })
    return child
  })
  const events: string[] = []
  const markers = new Set<string>()
  const pending = runPipeline(input, controller.signal, markers, { mode: 'live', transportModule: transport.href,
    onLifecycle: event => {
      events.push(event.kind)
      // The permission deadline starts at zero; model five seconds spent constructing
      // the production backend before its real transport-start announcement arrives.
      if (event.kind === 'adapter-permitted') now = 5_000
    } })
  // Observe rejection immediately, including cleanup on an assertion failure.
  void pending.catch(() => undefined)
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    await Promise.race([announced, new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => reject(new Error('Production transport-start IPC was not received')), 5_000)
    })])
    // 124s from permission, but only 119s from transport start. Removing the
    // real adapter callback or child IPC wiring must prevent this completion.
    now = 124_000
    await writeFile(releaseFile, 'release')
    await expect(pending).resolves.toMatchObject({ status: 'completed', mode: 'live', findings: [] })
    expect(events).toEqual(['process-started', 'adapter-permitted', 'process-closed'])
    expect(markers.size).toBe(1)
    expect(input.bytes.length).toBe(0)
  } finally {
    clearTimeout(timer)
    controller.abort()
    await pending.catch(() => undefined)
    vi.restoreAllMocks()
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY
    else process.env.OPENAI_API_KEY = previousKey
    await rm(directory, { recursive: true, force: true })
  }
}, 10_000)
