import { readFile } from 'node:fs/promises'
import { createServer, request } from 'node:http'
import express from 'express'
import { describe, expect, it } from 'vitest'
import { createAnalysisRouter } from '../../src/backend/http/analysis-route.ts'
import { runPipeline } from '../../src/backend/http/run-pipeline.ts'
import type { LifecycleEvent } from '../../src/backend/http/run-pipeline.ts'

const fixture = () => readFile(new URL('../fixtures/property-cases/F1-tilstandsrapport.pdf', import.meta.url))

describe('Story 2.5 – uavhengige HTTP-/ressursprøver i review', () => {
  it('tolv samtidige starter under delvis upload avvises, og serverstopp drenerer upload uten parserstart', async () => {
    const events: LifecycleEvent[] = []
    const router = createAnalysisRouter({ onLifecycle: event => events.push(event) })
    const app = express()
    app.use('/api', router)
    const server = createServer(app)
    let entered!: () => void
    const uploadEntered = new Promise<void>(resolve => { entered = resolve })
    server.once('request', () => entered())
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('No listener')
    const url = `http://127.0.0.1:${address.port}/api/analysis`
    const headers = { 'X-Session-Id': 'burst', 'X-Request-Id': 'upload', 'X-Analysis-Generation': '0' }
    const upload = request(url, { method: 'POST', headers: { ...headers, 'Content-Type': 'multipart/form-data; boundary=review' } })
    upload.on('error', () => undefined)
    const uploadClosed = new Promise<void>(resolve => upload.once('close', resolve))
    try {
      upload.write('--review\r\nContent-Disposition: form-data; name="file"; filename="pending.pdf"\r\n\r\n%PDF-')
      await uploadEntered
      const responses = await Promise.all(Array.from({ length: 12 }, async (_, index) => {
        const response = await fetch(url, { method: 'POST', headers: { ...headers,
          'X-Request-Id': `burst-${index}`, 'X-Analysis-Generation': String(index + 1) }, body: 'different body' })
        return { status: response.status, body: await response.json() }
      }))
      expect(responses).toEqual(Array.from({ length: 12 }, () => ({ status: 409, body: { kind: 'rejected', code: 'analysis-active' } })))
      await router.stop()
      await uploadClosed
      expect(events).toEqual([])
      const stopped = await fetch(url, { method: 'POST', headers, body: 'new request' })
      expect(stopped.status).toBe(503)
      expect(await stopped.json()).toEqual({ kind: 'rejected', code: 'processing-failure' })
    } finally {
      upload.destroy()
      await router.stop()
      await new Promise<void>(resolve => { server.close(() => resolve()); server.closeAllConnections() })
    }
  })

  it('to reelle prosesser som når samme markør får bare én adaptertillatelse og begge termineres', async () => {
    const events: LifecycleEvent[] = []
    const markers = new Set<string>()
    const bytes = await fixture()
    const inputs = [1, 2].map(index => ({ bytes: Buffer.from(bytes), documentName: 'F1-tilstandsrapport.pdf',
      requestId: `race-${index}`, sessionId: 'shared-race' }))
    const results = await Promise.allSettled(inputs.map(input => runPipeline(input, new AbortController().signal, markers, {
      onLifecycle: event => events.push(event),
    })))
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1)
    expect(results.find(result => result.status === 'fulfilled')).toMatchObject({ value: { status: 'completed' } })
    expect(results.find(result => result.status === 'rejected')).toMatchObject({ reason: { code: 'duplicate-analysis', status: 409 } })
    expect(events.filter(event => event.kind === 'adapter-permitted')).toHaveLength(1)
    expect(events.filter(event => event.kind === 'process-closed')).toHaveLength(2)
    expect(inputs.map(input => input.bytes.length)).toEqual([0, 0])
    expect(markers.size).toBe(1)
    for (const event of events.filter(event => event.kind === 'process-started')) expect(() => process.kill(event.pid!, 0)).toThrow()
  })
})
