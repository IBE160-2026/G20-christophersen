import { expect, it } from 'vitest'
import express from 'express'
import { createServer } from 'node:http'
import { once } from 'node:events'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { createRentRouter } from '../../src/backend/http/rent-route.ts'
import { estimateRent } from '../../src/backend/rent/ssb-rent.ts'
import { RentEstimateSchema } from '../../src/contracts/rent-estimate.ts'
import { rentalDocument, ssbFixtureFetch } from '../helpers/rental-fixture.ts'

it('faktisk HTTP-rute utleder dokumentgrunnlag, sender bare statistikkoder til SSB og validerer respons', async () => {
  const external: string[] = []
  const app = express()
  app.use('/api', createRentRouter({ estimate: (property, options) => estimateRent(property, { ...options, now: () => new Date('2026-11-04T12:00:00Z'), fetch: async (url, init) => { external.push(String(url)); expect(init?.body).toBeUndefined(); return ssbFixtureFetch(url, init) } }) }))
  const server = createServer(app); server.listen(0, '127.0.0.1'); await once(server, 'listening')
  try {
    const address = server.address(); if (!address || typeof address === 'string') throw new Error('listener')
    const url = `http://127.0.0.1:${address.port}/api/rent-estimate`, fixture = await rentalDocument()
    const post = (body: unknown) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const response = await post({ outcome: fixture.outcome })
    expect(response.status).toBe(200); expect(response.headers.get('cache-control')).toBe('no-store')
    const result = RentEstimateSchema.parse(await response.json())
    expect(result).toMatchObject({ status: 'estimated', monthly: '12200', annual: '146400', low: '8500', high: '15900', statisticsYear: '2025' })
    expect(result.property.area?.sources[0]?.quote).toContain('BRA-i: 50 m2')
    expect(external).toHaveLength(2); expect(external.every(value => value.startsWith('https://data.ssb.no/') && !value.includes('Fasitveien') && !value.includes(fixture.outcome.reportHash))).toBe(true)
    const invalid = structuredClone(fixture.outcome); invalid.propertyIdentity[0]!.source.quote = 'feil'
    expect((await post({ outcome: invalid })).status).toBe(400)
    expect((await post({ outcome: fixture.outcome, url: 'https://annet.no' })).status).toBe(400)
    expect(external).toHaveLength(2)
    const partial = await createCodeFirstImport({ hash: fixture.outcome.reportHash, name: fixture.outcome.documentName,
      requestId: 'partial-rental', role: 'prospectus', parentHash: null, attachmentId: null, attachments: [],
      pages: [...fixture.outcome.pages, { pdfPage: 2, text: '', status: 'unreadable', reason: 'Syntetisk ulest side', rasterUnprocessed: true }] })
    const partialResponse = await post({ outcome: partial })
    expect(partialResponse.status).toBe(200)
    const partialResult = RentEstimateSchema.parse(await partialResponse.json())
    expect(partialResult.status).toBe('estimated')
    expect(partialResult.limitations.join(' ')).toContain('1 ufullstendig leste sider')
    const noProperty = await rentalDocument(['Adresse: Fasitveien 4'])
    const unsupported = await post({ outcome: noProperty.outcome })
    expect(unsupported.status).toBe(200); expect(await unsupported.json()).toMatchObject({ status: 'unavailable', monthly: null })
    expect(external).toHaveLength(4)
  } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())) }
})
