import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { once } from 'node:events'
import { createServer } from 'node:http'
import express from 'express'
import { expect, it } from 'vitest'
import { createImportRouter } from '../../src/backend/http/import-route.ts'
import { ImportHttpResponseSchema } from '../../src/contracts/document-import.ts'
import type { EconomyField } from '../../src/contracts/document-import.ts'
import { canonicalJson } from '../../src/backend/import/semantic-request.ts'
const original = new URL('../../private/incoming/salgsoppgave.pdf', import.meta.url)
it.skipIf(!existsSync(original))('privat original går gjennom HTTP, import-child og standard integritetsbundet arkivleser', async () => {
  // Missing/invalid archive is a failure whenever the private original is present.
  const historical = JSON.parse(await readFile(new URL('../../private/representative-cases/real-01/economy-trial/approved-test-04/validated-live-result.json', import.meta.url), 'utf8')) as { result: { fields: EconomyField[] } }
  const router = createImportRouter(), app = express()
  app.use('/api', router)
  const server = createServer(app)
  server.listen(0, '127.0.0.1'); await once(server, 'listening')
  try {
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('listener')
    const filename = 'current-private-upload.pdf', body = new FormData()
    body.append('file', new Blob([await readFile(original)]), filename)
    // Only the ephemeral loopback HTTP server is contacted. The child has no API keys.
    const response = await fetch(`http://127.0.0.1:${address.port}/api/document-import`, { method: 'POST', body, headers: {
      'X-Session-Id': 'saved-private-integration', 'X-Request-Id': 'current-private-request', 'X-Analysis-Generation': '1', 'X-Document-Role': 'prospectus',
    } })
    expect(response.status).toBe(200)
    const result = ImportHttpResponseSchema.safeParse(await response.json())
    expect(result.success).toBe(true)
    if (!result.success || result.data.kind !== 'document-import') throw new Error('private-import-failed')
    const outcome = result.data.outcome
    expect(outcome.economy.analysis?.provenance).toBe('saved-same-document')
    expect(outcome.technical.status).toBe('blocked')
    expect(outcome.coverage.technical.status).not.toBe('complete')
    expect(outcome.cost?.status).toBe('blocked')
    expect(outcome.cost?.reservedUsd).toBe('0.00000000')
    expect(outcome.documentName).toBe(filename)
    expect(outcome.economy.fields.length).toBe(historical.result.fields.length)
    for (const expected of historical.result.fields) {
      const current = outcome.economy.fields.find(field => field.id === expected.id)
      const rebound = { ...expected, sources: expected.sources.map(source => ({ ...source, documentName: filename })), alternatives: expected.alternatives.map(item => ({ ...item, source: { ...item.source, documentName: filename } })) }
      // Boolean assertions keep private amounts and source excerpts out of failure reports.
      expect(canonicalJson(current) === canonicalJson(rebound), `Felt ${expected.id} avviker fra privat validert resultat`).toBe(true)
      expect(current?.sources.every(source => source.documentName === filename)).toBe(true)
    }
  } finally {
    await router.stop()
    const closed = new Promise<void>(resolve => server.close(() => resolve()))
    server.closeAllConnections(); await closed
  }
}, 90_000)
