import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { createServer, request as httpRequest } from 'node:http'
import type { Server } from 'node:http'
import express from 'express'
import { afterEach, describe, expect, it } from 'vitest'
import { createAnalysisRouter } from '../../src/backend/http/analysis-route.ts'
import { AnalysisHttpResponseSchema } from '../../src/contracts/analysis-http.ts'
import { MAX_METADATA_BYTES, MAX_PDF_BYTES } from '../../src/backend/http/receive-pdf.ts'
import { runPipeline } from '../../src/backend/http/run-pipeline.ts'
import type { LifecycleEvent, PipelineOptions } from '../../src/backend/http/run-pipeline.ts'

const servers: { server: Server; router: ReturnType<typeof createAnalysisRouter> }[] = []
afterEach(async () => {
  await Promise.all(servers.splice(0).map(async ({ server, router }) => {
    const closed = new Promise<void>(resolve => server.close(() => resolve()))
    server.closeAllConnections()
    await router.stop()
    await closed
  }))
})
async function serve(options: PipelineOptions = {}) {
  const app = express()
  const router = createAnalysisRouter(options)
  app.use('/api', router)
  const server = createServer(app)
  servers.push({ server, router })
  await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve) })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('No test listener')
  return `http://127.0.0.1:${address.port}/api/analysis`
}
function headers(session = 'session', request = 'request', generation = '0') {
  return { 'X-Session-Id': session, 'X-Request-Id': request, 'X-Analysis-Generation': generation }
}
function multipart(bytes: Uint8Array, filename = 'F1-tilstandsrapport.pdf', mime = 'application/pdf') {
  const form = new FormData()
  form.append('file', new Blob([Uint8Array.from(bytes)], { type: mime }), filename)
  return form
}
const fixture = (file = 'F1-tilstandsrapport.pdf') => readFile(new URL(`../fixtures/property-cases/${file}`, import.meta.url))
const moduleUrl = (file: string) => new URL(`../helpers/${file}`, import.meta.url).href
async function post(url: string, bytes: Uint8Array, session = 'session', filename?: string) {
  const response = await fetch(url, { method: 'POST', headers: headers(session), body: multipart(bytes, filename) })
  const body = await response.json() as unknown
  return { status: response.status, body: AnalysisHttpResponseSchema.parse(body) }
}
function rawPost(url: string, parts: Buffer[], contentType: string, extraHeaders: Record<string, string> = {}) {
  return new Promise<{ status: number; body: unknown }>((resolve, reject) => {
    const request = httpRequest(url, { method: 'POST', headers: { ...headers(), 'Content-Type': contentType, ...extraHeaders } }, response => {
      const chunks: Buffer[] = []
      response.on('data', chunk => chunks.push(chunk))
      response.once('end', () => resolve({ status: response.statusCode!, body: JSON.parse(Buffer.concat(chunks).toString()) as unknown }))
    })
    request.on('error', reject)
    for (const part of parts) request.write(part)
    request.end()
  })
}
const framing = (boundary = 'story-boundary') => ({
  type: `multipart/form-data; boundary=${boundary}`,
  start: Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.pdf"\r\nContent-Type: application/pdf\r\n\r\n`),
  end: Buffer.from(`\r\n--${boundary}--\r\n`),
})

describe('Story 2.5 HTTP – original, terminalkontrakt og prosesslivsløp', () => {
  it.each(['F1', 'F2', 'F3', 'F4'])('%s følger faktisk PDF og uavhengig fasit med ett adapterkall', async id => {
    const events: LifecycleEvent[] = []
    const url = await serve({ onLifecycle: event => events.push(event) })
    const name = `${id}-tilstandsrapport.pdf`
    const bytes = await fixture(name)
    const result = await post(url, bytes, 'session', name)
    expect(result.status).toBe(200)
    expect(result.body.kind).toBe('analysis')
    if (result.body.kind !== 'analysis' || result.body.outcome.status !== 'completed') throw new Error('Expected completed demo')
    const expected = JSON.parse(await readFile(new URL('../fixtures/property-cases/expected.json', import.meta.url), 'utf8')) as {
      cases: { documentName: string; pageCount: number; findings: { id: string; pdfPage: number; grade: string; description: string }[] }[]
    }
    const oracle = expected.cases.find(item => item.documentName === name)!
    expect(result.body.correlation).toEqual({ sessionId: 'session', requestId: 'request', generation: 0 })
    expect(result.body.outcome).toMatchObject({ reportHash: createHash('sha256').update(bytes).digest('hex'),
      documentName: name, pageCount: oracle.pageCount, mode: 'demo', contractVersion: '2', extractionVersion: '1' })
    expect(result.body.outcome.findings.map(finding => ({ id: finding.findingId, pdfPage: finding.source.pdfPage,
      grade: finding.grade, description: finding.description }))).toEqual(oracle.findings.map(({ id, pdfPage, grade, description }) => ({ id, pdfPage, grade, description })))
    expect(events.map(event => event.kind)).toEqual(['process-started', 'adapter-permitted', 'process-closed'])
    expect(() => process.kill(events[0]!.pid!, 0)).toThrow()
    const duplicate = await fetch(url, { method: 'POST', headers: headers('session', 'new-request', '7'), body: multipart(bytes, name) })
    expect(duplicate.status).toBe(409)
    expect(await duplicate.json()).toEqual({ kind: 'rejected', code: 'duplicate-analysis' })
    expect(events.filter(event => event.kind === 'adapter-permitted')).toHaveLength(1)
  })

  it('navn og MIME er bare metadata, feil signatur/container er dokumentfeil', async () => {
    const url = await serve()
    for (const [file, code] of [['invalid-format.pdf', 'invalid-format'], ['damaged-container.pdf', 'invalid-container']] as const) {
      const response = await post(url, await fixture(file), file)
      expect(response.body).toMatchObject({ kind: 'analysis', outcome: { status: 'failed', error: { kind: 'document', code } } })
    }
    const response = await fetch(url, { method: 'POST', headers: headers('mime'), body: multipart(await fixture(), '../../other.txt', 'text/plain') })
    expect(await response.json()).toMatchObject({ kind: 'analysis', outcome: { status: 'completed', findings: [],
      documentName: '../../other.txt', uncertainCandidates: [{ issues: [{ code: 'document-mismatch' }] }] } })
  })

  it('avviser ugyldig korrelasjon, ingen/flere filer og skjulte metadata', async () => {
    const events: LifecycleEvent[] = []
    const url = await serve({ onLifecycle: event => events.push(event) })
    const bytes = await fixture()
    const response = await fetch(url, { method: 'POST', body: multipart(bytes) })
    expect(response.status).toBe(400)
    for (const form of [new FormData(), multipart(bytes), multipart(bytes)]) {
      if ([...form].length) form.append([...form].length === 1 ? 'extra' : 'file', 'hidden')
      const result = await fetch(url, { method: 'POST', headers: headers(), body: form })
      expect(result.status).toBe(400)
    }
    const form = multipart(bytes)
    form.append('file', new Blob([bytes]), 'second.pdf')
    expect((await fetch(url, { method: 'POST', headers: headers(), body: form })).status).toBe(400)
    expect(events).toEqual([])
  })

  it('metadata 1 MiB er innen grensen, én byte over 413; base64 og ekstra JSON-felt behandles aldri', async () => {
    const events: LifecycleEvent[] = []
    const url = await serve({ onLifecycle: event => events.push(event) })
    for (const length of [MAX_METADATA_BYTES, MAX_METADATA_BYTES + 1]) {
      const json = Buffer.from(JSON.stringify({ padding: 'x'.repeat(length - Buffer.byteLength('{"padding":""}')) }))
      expect(json.byteLength).toBe(length)
      const result = await rawPost(url, [json], 'application/json')
      expect(result.status).toBe(length === MAX_METADATA_BYTES ? 415 : 413)
    }
    const result = await rawPost(url, [Buffer.from(JSON.stringify({ file: (await fixture()).toString('base64'), hidden: true }))], 'application/json')
    expect(result).toEqual({ status: 415, body: { kind: 'rejected', code: 'unsupported-media-type' } })
    expect(events).toEqual([])
  })

  it('PDF akkurat 50 MiB passerer størrelse, én byte over stanses før prosess også chunked', async () => {
    const events: LifecycleEvent[] = []
    const url = await serve({ onLifecycle: event => events.push(event) })
    const frame = framing()
    const original = await fixture()
    const offset = original.lastIndexOf('startxref')
    const largePdf = Buffer.concat([original.subarray(0, offset), Buffer.alloc(MAX_PDF_BYTES - original.length, 32), original.subarray(offset)])
    const exact = await rawPost(url, [frame.start, largePdf, frame.end], frame.type)
    expect(exact.status).toBe(200)
    expect(exact.body).toMatchObject({ kind: 'analysis', outcome: { status: 'failed', pageCount: 4,
      reportHash: createHash('sha256').update(largePdf).digest('hex'), error: { code: 'adapter-failure' } } })
    expect(events.filter(event => event.kind === 'process-started')).toHaveLength(1)
    const over = await rawPost(url, [frame.start, Buffer.alloc(MAX_PDF_BYTES + 1), frame.end], frame.type)
    expect(over).toEqual({ status: 413, body: { kind: 'rejected', code: 'payload-too-large' } })
    expect(events.filter(event => event.kind === 'process-started')).toHaveLength(1)
    const known = await rawPost(url, [], frame.type, { 'Content-Length': String(MAX_PDF_BYTES + MAX_METADATA_BYTES + 1) })
    expect(known.status).toBe(413)
    // Totalen beviser overstor fil etter delheaderne, selv uten filbytes.
    const knownFile = await rawPost(url, [frame.start], frame.type, {
      'X-Session-Id': 'known-file-length',
      'Content-Length': String(frame.start.length + MAX_PDF_BYTES + 1 + frame.end.length),
    })
    expect(knownFile).toEqual({ status: 413, body: { kind: 'rejected', code: 'payload-too-large' } })
    expect(events.filter(event => event.kind === 'process-started')).toHaveLength(1)
  }, 30_000)

  it('vilkårlige chunks og falsk boundary bevarer originalbytehash', async () => {
    const url = await serve()
    const frame = framing()
    const bytes = Buffer.concat([await fixture(), Buffer.from('\r\n--story-boundaryNOT-A-DELIMITER\r\n')])
    const body = Buffer.concat([frame.start, bytes, frame.end])
    const chunks = Array.from(body, byte => Buffer.from([byte]))
    const result = await rawPost(url, chunks, frame.type)
    expect(result.body).toMatchObject({ kind: 'analysis', outcome: { reportHash: createHash('sha256').update(bytes).digest('hex') } })
  })

  it('aktiv lås gjelder under upload med andre requestId/generasjon og slipper etter abort', async () => {
    const url = await serve()
    const frame = framing()
    const waiting = httpRequest(url, { method: 'POST', headers: { ...headers(), 'Content-Type': frame.type } })
    waiting.on('error', () => undefined)
    waiting.write(frame.start)
    await new Promise(resolve => setTimeout(resolve, 30))
    const result = await fetch(url, { method: 'POST', headers: { ...headers('session', 'other', '9'), 'X-Analysis-Mode': 'live' }, body: multipart(await fixture('F2-tilstandsrapport.pdf')) })
    expect(result.status).toBe(409)
    expect(await result.json()).toEqual({ kind: 'rejected', code: 'analysis-active' })
    waiting.destroy()
    await new Promise(resolve => setTimeout(resolve, 30))
    expect((await post(url, await fixture())).status).toBe(200)
  })

  it.each(['http-adapter-failure.ts', 'http-adapter-invalid.ts'])('%s gir trygg feil uten retry og beholder markør', async adapter => {
    const events: LifecycleEvent[] = []
    const url = await serve({ adapterModule: moduleUrl(adapter), onLifecycle: event => events.push(event) })
    const result = await post(url, await fixture())
    expect(result.body).toMatchObject({ kind: 'analysis', outcome: { status: 'failed', error: { kind: 'analysis',
      code: adapter.includes('invalid') ? 'invalid-response' : 'adapter-failure' } } })
    expect(JSON.stringify(result.body)).not.toContain('PRIVATE')
    expect((await post(url, await fixture())).body).toEqual({ kind: 'rejected', code: 'duplicate-analysis' })
    expect(events.filter(event => event.kind === 'adapter-permitted')).toHaveLength(1)
    expect(events.filter(event => event.kind === 'process-started')).toHaveLength(2)
    expect(events.filter(event => event.kind === 'process-closed')).toHaveLength(2)
  })

  it('aktiv sessionlås gjelder under adapterarbeid på tvers av hash og korrelasjon', async () => {
    const events: LifecycleEvent[] = []
    let permitted!: () => void
    const ready = new Promise<void>(resolve => { permitted = resolve })
    const url = await serve({ adapterModule: moduleUrl('http-adapter-hang.ts'), onLifecycle: event => {
      events.push(event)
      if (event.kind === 'adapter-permitted') permitted()
    } })
    const controller = new AbortController()
    const first = fetch(url, { method: 'POST', headers: headers(), body: multipart(await fixture()), signal: controller.signal }).catch(() => undefined)
    try {
      await ready
      const second = await fetch(url, { method: 'POST', headers: headers('session', 'F2-request', '9'),
        body: multipart(await fixture('F2-tilstandsrapport.pdf'), 'F2-tilstandsrapport.pdf') })
      expect(second.status).toBe(409)
      expect(await second.json()).toEqual({ kind: 'rejected', code: 'analysis-active' })
      expect(events.filter(event => event.kind === 'process-started')).toHaveLength(1)
      // An independent session reaches document validation while the first is active.
      const independent = await post(url, await fixture('invalid-format.pdf'), 'independent')
      expect(independent.body).toMatchObject({ kind: 'analysis', outcome: { status: 'failed', error: { code: 'invalid-format' } } })
      expect(events.filter(event => event.kind === 'process-started')).toHaveLength(2)
      expect(events.filter(event => event.kind === 'adapter-permitted')).toHaveLength(1)
    } finally { controller.abort(); await first }
  })

  it.each([
    ['without-text-layer.pdf', 'unreadable-text'],
    ['text-31-pages.pdf', 'page-limit'],
  ])('%s blir dokumentfeil uten adaptertillatelse eller varig markør', async (file, code) => {
    const events: LifecycleEvent[] = []
    const url = await serve({ onLifecycle: event => events.push(event) })
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await post(url, await fixture(file), 'session', file)
      expect(result.status).toBe(200)
      expect(result.body).toMatchObject({ kind: 'analysis', outcome: { status: 'failed', error: { kind: 'document', code } } })
      expect(events.at(-1)?.kind).toBe('process-closed')
    }
    expect(events.filter(event => event.kind === 'process-started')).toHaveLength(2)
    expect(events.filter(event => event.kind === 'process-closed')).toHaveLength(2)
    expect(events.some(event => event.kind === 'adapter-permitted')).toBe(false)
    for (const event of events.filter(event => event.kind === 'process-started')) expect(() => process.kill(event.pid!, 0)).toThrow()
  })

  it('cleanup-feil i parser eier fortsatt workertråder som termineres med prosessen', async () => {
    const events: LifecycleEvent[] = []
    const url = await serve({ documentModule: moduleUrl('http-documents-cleanup-failure.ts'), onLifecycle: event => events.push(event) })
    const result = await post(url, await fixture())
    expect(result.body).toMatchObject({ kind: 'analysis', outcome: { status: 'failed', error: { code: 'adapter-failure' } } })
    expect(events.map(event => event.kind)).toEqual(['process-started', 'process-closed'])
    expect(() => process.kill(events[0]!.pid!, 0)).toThrow()
    // A document failure occurs before marker; a new attempt is allowed and cleaned as well.
    expect((await post(url, await fixture())).status).toBe(200)
    expect(events.filter(event => event.kind === 'process-closed')).toHaveLength(2)
  })

  it('klientabort under parser stopper synkront heng og lar samme session starte igjen', async () => {
    const events: LifecycleEvent[] = []
    let started!: () => void
    const ready = new Promise<void>(resolve => { started = resolve })
    const url = await serve({ documentModule: moduleUrl('http-documents-hang.ts'), onLifecycle: event => {
      events.push(event)
      if (event.kind === 'process-started') started()
    } })
    const controller = new AbortController()
    const pending = fetch(url, { method: 'POST', headers: headers(), body: multipart(await fixture()), signal: controller.signal }).catch(() => undefined)
    await ready
    // Allow the child to enter PDF work before aborting the connection.
    await new Promise(resolve => setTimeout(resolve, 500))
    controller.abort()
    await pending
    for (let attempt = 0; attempt < 100 && !events.some(event => event.kind === 'process-closed'); attempt++) await new Promise(resolve => setTimeout(resolve, 10))
    expect(events.map(event => event.kind)).toEqual(['process-started', 'process-closed'])
    expect(() => process.kill(events[0]!.pid!, 0)).toThrow()
  })

  it('én reell 60 s-frist stopper parserheng, adapterheng og sen retur etter flere steg', async () => {
    const cases: { options: PipelineOptions; events: LifecycleEvent[]; url?: string; elapsed?: number; result?: Awaited<ReturnType<typeof post>> }[] = [
      { options: { documentModule: moduleUrl('http-documents-hang.ts') }, events: [] },
      { options: { adapterModule: moduleUrl('http-adapter-hang.ts') }, events: [] },
      { options: { documentModule: moduleUrl('http-documents-delay.ts'), adapterModule: moduleUrl('http-adapter-delay.ts') }, events: [] },
    ]
    const retained = { bytes: await fixture(), documentName: 'F1-tilstandsrapport.pdf', requestId: 'references', sessionId: 'references' }
    const referenceTimeout = runPipeline(retained, new AbortController().signal, new Set(), {
      documentModule: moduleUrl('http-documents-delay.ts'), adapterModule: moduleUrl('http-adapter-delay.ts'),
    })
    await Promise.all(cases.map(async item => {
      item.url = await serve({ ...item.options, onLifecycle: event => item.events.push(event) })
      const started = performance.now()
      item.result = await post(item.url, await fixture())
      item.elapsed = performance.now() - started
    }))
    expect(await referenceTimeout).toMatchObject({ status: 'failed', error: { code: 'timeout' } })
    expect(retained.bytes.byteLength).toBe(0)
    for (const item of cases) {
      expect(item.result!.body).toMatchObject({ kind: 'analysis', outcome: { status: 'failed', error: { code: 'timeout' } } })
      expect(item.elapsed).toBeGreaterThanOrEqual(59_500)
      expect(item.elapsed).toBeLessThan(65_000)
      expect(item.events.at(-1)?.kind).toBe('process-closed')
      expect(() => process.kill(item.events[0]!.pid!, 0)).toThrow()
    }
    expect(cases[0]!.events.some(event => event.kind === 'adapter-permitted')).toBe(false)
    expect(cases[1]!.events.filter(event => event.kind === 'adapter-permitted')).toHaveLength(1)
    expect((await post(cases[1]!.url!, await fixture())).body).toEqual({ kind: 'rejected', code: 'duplicate-analysis' })
  }, 70_000)

  it('eide inputbytes tømmes ved suksess, adapterfeil, duplikatavvisning og abort', async () => {
    const markers = new Set<string>()
    const input = async () => ({ bytes: await fixture(), documentName: 'F1-tilstandsrapport.pdf', requestId: 'reference', sessionId: 'reference' })
    const success = await input()
    expect((await runPipeline(success, new AbortController().signal, markers, {})).status).toBe('completed')
    expect(success.bytes.byteLength).toBe(0)
    const duplicate = await input()
    await expect(runPipeline(duplicate, new AbortController().signal, markers, {})).rejects.toMatchObject({ code: 'duplicate-analysis' })
    expect(duplicate.bytes.byteLength).toBe(0)
    const failed = await input()
    expect((await runPipeline(failed, new AbortController().signal, new Set(), {
      adapterModule: moduleUrl('http-adapter-failure.ts'),
    })).status).toBe('failed')
    expect(failed.bytes.byteLength).toBe(0)
    const aborted = await input()
    const controller = new AbortController()
    await expect(runPipeline(aborted, controller.signal, new Set(), {
      adapterModule: moduleUrl('http-adapter-hang.ts'),
      onLifecycle: event => { if (event.kind === 'adapter-permitted') queueMicrotask(() => controller.abort()) },
    })).rejects.toMatchObject({ code: 'processing-failure' })
    expect(aborted.bytes.byteLength).toBe(0)
  })

  it('serverstopp venter på faktisk cleanup av en request med hengende adapter', async () => {
    const events: LifecycleEvent[] = []
    let started!: () => void
    const ready = new Promise<void>(resolve => { started = resolve })
    const app = express()
    const router = createAnalysisRouter({ adapterModule: moduleUrl('http-adapter-hang.ts'), onLifecycle: event => {
      events.push(event)
      if (event.kind === 'adapter-permitted') started()
    } })
    app.use('/api', router)
    const server = createServer(app)
    servers.push({ server, router })
    await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve) })
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('No test listener')
    const url = `http://127.0.0.1:${address.port}/api/analysis`
    const pending = post(url, await fixture()).catch(() => undefined)
    await ready
    const closed = new Promise<void>(resolve => server.close(() => resolve()))
    server.closeAllConnections()
    await router.stop()
    await closed
    await pending
    expect(events.map(event => event.kind)).toEqual(['process-started', 'adapter-permitted', 'process-closed'])
    expect(() => process.kill(events[0]!.pid!, 0)).toThrow()
  })

  it('413 når fram mens chunked-klienten fremdeles forsøker å skrive overgrense', async () => {
    const events: LifecycleEvent[] = []
    const url = await serve({ onLifecycle: event => events.push(event) })
    const frame = framing()
    const result = await new Promise<{ status: number; body: unknown }>((resolve, reject) => {
      let timer: ReturnType<typeof setInterval> | undefined
      let responseStarted = false
      const request = httpRequest(url, { method: 'POST', headers: { ...headers(), 'Content-Type': frame.type } }, response => {
        responseStarted = true
        if (timer) clearInterval(timer)
        const chunks: Buffer[] = []
        response.on('data', chunk => chunks.push(chunk))
        response.once('end', () => { resolve({ status: response.statusCode!, body: JSON.parse(Buffer.concat(chunks).toString()) as unknown }); request.destroy() })
      })
      request.on('error', error => { if (timer) clearInterval(timer); if (!responseStarted) reject(error) })
      request.write(frame.start)
      const chunk = Buffer.alloc(1024 * 1024)
      let sent = 0
      const write = () => {
        // Deliberately keep the upload open and try to send more after reaching the cap.
        while (sent < MAX_PDF_BYTES + 4 * chunk.length) {
          sent += chunk.length
          if (!request.write(chunk)) return
        }
        timer = setInterval(() => request.write(chunk), 10)
      }
      request.on('drain', write)
      write()
    })
    expect(result).toEqual({ status: 413, body: { kind: 'rejected', code: 'payload-too-large' } })
    expect(events).toEqual([])
  })

  it('klientabort under adapter terminerer prosessen og beholder duplikatsperre', async () => {
    const events: LifecycleEvent[] = []
    let started!: () => void
    const ready = new Promise<void>(resolve => { started = resolve })
    const url = await serve({ adapterModule: moduleUrl('http-adapter-hang.ts'), onLifecycle: event => {
      events.push(event)
      if (event.kind === 'adapter-permitted') started()
    } })
    const controller = new AbortController()
    const pending = fetch(url, { method: 'POST', headers: headers(), body: multipart(await fixture()), signal: controller.signal }).catch(() => undefined)
    await ready
    controller.abort()
    await pending
    for (let attempt = 0; attempt < 100 && !events.some(event => event.kind === 'process-closed'); attempt++) await new Promise(resolve => setTimeout(resolve, 10))
    expect(events.map(event => event.kind)).toEqual(['process-started', 'adapter-permitted', 'process-closed'])
    expect(() => process.kill(events[0]!.pid!, 0)).toThrow()
    expect((await post(url, await fixture())).body).toEqual({ kind: 'rejected', code: 'duplicate-analysis' })
  })
})
