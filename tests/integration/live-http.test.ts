import { createServer } from 'node:http'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import express from 'express'
import { afterEach, expect, it } from 'vitest'
import { createAnalysisRouter } from '../../src/backend/http/analysis-route.ts'
import { AnalysisHttpResponseSchema } from '../../src/contracts/analysis-http.ts'
import type { LifecycleEvent } from '../../src/backend/http/run-pipeline.ts'

const originalKey = process.env.OPENAI_API_KEY
const cleanups: (() => Promise<void>)[] = []
afterEach(async () => {
  for (const close of cleanups.splice(0)) await close()
  if (originalKey === undefined) delete process.env.OPENAI_API_KEY
  else process.env.OPENAI_API_KEY = originalKey
})
async function serve(production = false) {
  if (!production) process.env.OPENAI_API_KEY = 'fictional-offline-only'
  const events: LifecycleEvent[] = []
  const directory = await mkdtemp(join(tmpdir(), 'ibe160-live-transport-'))
  const startedFile = join(directory, 'started')
  const transport = new URL('../helpers/http-live-sdk-transport.ts', import.meta.url)
  transport.searchParams.set('started', startedFile)
  const analysis = createAnalysisRouter({ mode: 'live', onLifecycle: event => events.push(event),
    ...(production ? {} : { transportModule: transport.href }) })
  const app = express(); app.use('/api', analysis)
  const server = createServer(app)
  await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve) })
  cleanups.push(async () => {
    const closed = new Promise<void>(resolve => server.close(() => resolve()))
    server.closeAllConnections(); await analysis.stop(); await closed
    await rm(directory, { recursive: true, force: true })
  })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('No listener')
  const url = `http://127.0.0.1:${address.port}/api`
  async function post(name: string, requestId = 'first', generation = '1', signal?: AbortSignal) {
    const bytes = await readFile(new URL('../fixtures/property-cases/F1-tilstandsrapport.pdf', import.meta.url))
    const form = new FormData(); form.append('file', new Blob([bytes]), name)
    return fetch(`${url}/analysis`, { method: 'POST', signal, body: form,
      headers: { 'X-Session-Id': 'session', 'X-Request-Id': requestId, 'X-Analysis-Generation': generation, 'X-Analysis-Mode': 'demo' } })
  }
  return { url, events, post, startedFile }
}
it.each([['empty.pdf', 'completed', null], ['transport.pdf', 'failed', 'transport-failure'], ['invalid.pdf', 'failed', 'invalid-response'], ['incomplete.pdf', 'failed', 'invalid-response']])(
  '4.3 AC1/3: real HTTP/process/SDK offline %s, durable duplicate and safe mode metadata', async (name, status, code) => {
    const { url, post, events } = await serve()
    const metadata = await fetch(`${url}/analysis-config`)
    expect(await metadata.json()).toEqual({ mode: 'live' })
    const result = AnalysisHttpResponseSchema.parse(await (await post(name!)).json())
    if (result.kind !== 'analysis') throw new Error('Expected analysis outcome')
    expect(result).toMatchObject({ kind: 'analysis', outcome: { mode: 'live', status } })
    if (result.outcome.status === 'failed') expect(result.outcome.error.code).toBe(code)
    else expect(result.outcome.findings).toEqual([])
    expect(events.map(event => event.kind)).toEqual(['process-started', 'adapter-permitted', 'process-closed'])
    const duplicate = await post(name!, 'new-request', '99')
    expect(duplicate.status).toBe(409)
    expect(await duplicate.json()).toEqual({ kind: 'rejected', code: 'duplicate-analysis' })
    expect(events.filter(event => event.kind === 'adapter-permitted')).toHaveLength(1)
    expect(events.filter(event => event.kind === 'process-closed')).toHaveLength(2)
  })
it('4.3 AC3: production missing key is safe live failure after document gate, never fallback', async () => {
  const previous = process.env.OPENAI_API_KEY
  delete process.env.OPENAI_API_KEY
  try {
    const { post } = await serve(true)
    const result = AnalysisHttpResponseSchema.parse(await (await post('missing-key.pdf')).json())
    if (result.kind !== 'analysis' || result.outcome.status !== 'failed') throw new Error('Expected failed live outcome')
    expect(result).toMatchObject({ kind: 'analysis', outcome: { mode: 'live', status: 'failed', error: { code: 'adapter-failure' } } })
    expect(result.outcome.error.reason).toContain('OPENAI_API_KEY')
  } finally { if (previous !== undefined) process.env.OPENAI_API_KEY = previous }
})
it('4.3 AC5: abort terminates actual live child before lock release and marker survives', async () => {
  const { events, post, startedFile } = await serve()
  const controller = new AbortController()
  const pending = post('abort.pdf', 'aborted', '1', controller.signal)
  const rejected = expect(pending).rejects.toThrow()
  await new Promise<void>((resolve, reject) => {
    const start = Date.now()
    const poll = async () => {
      const started = await readFile(startedFile, 'utf8').catch(() => '')
      if (started === 'started') resolve()
      else if (Date.now() - start > 5000) reject(new Error('SDK transport not started'))
      else setTimeout(() => { void poll() }, 10)
    }; poll()
  })
  controller.abort(); await rejected
  await new Promise<void>((resolve, reject) => {
    const start = Date.now()
    const poll = () => {
      if (events.some(event => event.kind === 'process-closed')) resolve()
      else if (Date.now() - start > 5000) reject(new Error('Child did not close'))
      else setTimeout(poll, 10)
    }; poll()
  })
  const duplicate = await post('abort.pdf', 'after-abort', '2')
  expect(await duplicate.json()).toEqual({ kind: 'rejected', code: 'duplicate-analysis' })
  expect(events.filter(event => event.kind === 'adapter-permitted')).toHaveLength(1)
})

it('4.3 AC2: production HTTP/SDK preserves nonempty findings and source uncertainty', async () => {
  const { post } = await serve()
  const result = AnalysisHttpResponseSchema.parse(await (await post('nonempty.pdf')).json())
  if (result.kind !== 'analysis' || result.outcome.status !== 'completed') throw new Error('Expected completed extraction')
  expect(result.outcome.findings).toMatchObject([{ findingId: 'known', grade: 'TG3', source: {
    documentName: 'nonempty.pdf', reportHash: result.outcome.reportHash, pdfPage: 2,
  } }])
  expect(result.outcome.uncertainCandidates).toMatchObject([{ findingId: 'uncertain', original: {
    grade: '?', uncertainties: ['Ukjent grad og kilde'],
  } }])
  expect(result.outcome.mode).toBe('live')
})
