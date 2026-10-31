import { expect, it } from 'vitest'
import { readEconomyResponse } from '../../src/frontend/investment/economy-api-response.ts'

it('gjenkjenner manglende rute fra både gammel tekstserver og ny JSON-server', async () => {
  for (const response of [new Response('API-ruten er ikke tilgjengelig.', { status: 404 }),
    Response.json({ error: 'api-route-unavailable' }, { status: 404 })]) {
    await expect(readEconomyResponse(response)).rejects.toThrow('economy-route-unavailable')
  }
})

it('avviser tekst, HTML og ugyldig JSON uten å vise responsinnhold', async () => {
  for (const response of [new Response('<html>Proxyfeil</html>', { status: 502 }),
    new Response('API-ruten', { headers: { 'Content-Type': 'application/json' } })]) {
    await expect(readEconomyResponse(response)).rejects.toThrow('economy-response-not-json')
  }
  await expect(readEconomyResponse(Response.json(null))).rejects.toThrow('invalid-response')
  await expect(readEconomyResponse(Response.json([]))).rejects.toThrow('invalid-response')
})

it('bevarer gyldige JSON-resultater og kjente API-feilkoder', async () => {
  await expect(readEconomyResponse(Response.json({ readyForApproval: true }))).resolves.toEqual({ readyForApproval: true })
  await expect(readEconomyResponse(Response.json({ error: 'analysis-active' }, { status: 409 }))).resolves.toEqual({ error: 'analysis-active' })
})
