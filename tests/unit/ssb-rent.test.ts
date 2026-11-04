import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { estimateRent } from '../../src/backend/rent/ssb-rent.ts'
import { RentEstimateSchema } from '../../src/contracts/rent-estimate.ts'
import type { RentalProperty } from '../../src/contracts/rent-estimate.ts'

const originalMetadata = JSON.parse(readFileSync(new URL('../fixtures/ssb/09897-metadata.json', import.meta.url), 'utf8'))
const originalData = JSON.parse(readFileSync(new URL('../fixtures/ssb/09897-2025.json', import.meta.url), 'utf8'))
const now = () => new Date('2026-11-04T12:00:00.000Z')
function property(): RentalProperty {
  const hash = 'a'.repeat(64)
  const sources = [{ documentHash: hash, documentName: 'syntetisk.pdf', pdfPage: 1, quote: 'Leilighet', start: 0, end: 9, method: 'pdf-text' as const, printedPage: null }]
  return { documentHash: hash, documentName: 'syntetisk.pdf', address: { value: 'Eksempelgata 1, 4006 Stavanger', sources }, municipality: { value: 'Stavanger', sources }, district: null,
    area: { value: 50, basis: 'BRA-i', sources }, rooms: { value: 2, sources }, propertyType: { value: 'apartment', sources }, issues: [] }
}
function transport(metadata = structuredClone(originalMetadata), data = structuredClone(originalData)) {
  return vi.fn<typeof fetch>().mockImplementation(async input => Response.json(String(input).includes('/metadata?') ? metadata : data))
}

describe('SSB-leieagent med ekte, offentlige 2025-celler', () => {
  it('bruker verifisert Stavanger-celle, skiller måned/år og viser konservativt usikkerhetsspenn', async () => {
    const fetcher = transport()
    const result = await estimateRent(property(), { fetch: fetcher, now })
    expect(result).toMatchObject({ status: 'estimated', monthly: '12200', annual: '146400', low: '8500', high: '15900', statisticsYear: '2025', sourceUpdated: '2025-12-22T07:00:00Z' })
    expect(RentEstimateSchema.safeParse(result).success).toBe(true)
    expect(result.observations).toEqual([{ zoneCode: '05.00', zoneLabel: 'Stavanger', sizeCode: '2.050', area: 50, monthly: '12200' }])
    expect(result.formula).toContain('12200')
    expect(result.limitations.join()).toContain('ikke et statistisk konfidens- eller prediksjonsintervall')
    expect(fetcher).toHaveBeenCalledTimes(2)
    const url = new URL(result.sourceUrl!)
    expect(url.searchParams.get('valueCodes[Tid]')).toBe('2025')
    expect(url.searchParams.get('valueCodes[ContentsCode]')).toBe('Husleie')
    expect(fetcher.mock.calls.map(([url]) => String(url)).join()).not.toMatch(/Eksempelgata|syntetisk|4006/)
  })
  it('interpolerer mellom 50 og 60 m² med kontrollerbare råceller og eksakt vekt', async () => {
    const input = property(); input.area!.value = 55
    const result = await estimateRent(input, { fetch: transport(), now })
    expect(result).toMatchObject({ monthly: '12500', annual: '150000', low: '8700', high: '16300' })
    expect(result.observations.map(item => item.monthly)).toEqual(['12200', '12800'])
    expect(result.formula).toContain('(55 − 50) / 10 = 0.5')
    expect(result.formula).toContain('12200 + (12800 − 12200) × 0.5 = 12500.00')
  })
  it('bruker alle Oslo-soner ved ukjent bydel og snevrer bare ved eksplisitt kjent bydel', async () => {
    const input = property(); input.municipality!.value = 'Oslo'
    const broad = await estimateRent(input, { fetch: transport(), now })
    expect(broad).toMatchObject({ monthly: '15600', low: '8700', high: '23400' })
    expect(broad.observations).toHaveLength(4)
    expect(broad.limitations.join()).toContain('Bydel er uavklart')
    input.district = { value: 'Frogner', sources: input.address!.sources }
    const precise = await estimateRent(input, { fetch: transport(), now })
    expect(precise).toMatchObject({ monthly: '16700', low: '11600', high: '21800' })
    expect(precise.observations).toHaveLength(1)
    input.district.value = 'Ukjent lokalt stedsnavn'
    expect((await estimateRent(input, { fetch: transport(), now })).monthly).toBe(broad.monthly)
  })
  it('gir bredere spenn ved BRA/P-ROM og støtter 5–8 rom uten å skape egen romgruppe', async () => {
    const input = property(); input.area!.basis = 'P-ROM'
    const result = await estimateRent(input, { fetch: transport(), now })
    expect(result).toMatchObject({ low: '7900', high: '16500' })
    input.rooms!.value = 8; input.area!.value = 120
    const large = await estimateRent(input, { fetch: transport(), now })
    expect(large).toMatchObject({ status: 'estimated', monthly: '19600' })
    expect(large.observations[0]?.sizeCode).toBe('5.120')
  })
  it('følger dimensjonsindekser selv om JSON-stat-rekkefølgen endres', async () => {
    const data = structuredClone(originalData)
    data.id = ['Tid', 'ContentsCode', 'AntRomBRA', 'Soner2']; data.size = [1, 1, 25, 16]
    data.value = Array.from({ length: 400 }, (_, index) => originalData.value[(index % 16) * 25 + Math.floor(index / 16)])
    const result = await estimateRent(property(), { fetch: transport(undefined, data), now })
    expect(result.monthly).toBe('12200')
  })
  it('velger nyeste metadataår før nå, og avviser mer enn tre år gammelt datagrunnlag', async () => {
    const metadata = structuredClone(originalMetadata)
    metadata.dimension.Tid.category.index['2099'] = 14; metadata.dimension.Tid.category.label['2099'] = '2099'; metadata.size[3]++
    expect((await estimateRent(property(), { fetch: transport(metadata), now })).statisticsYear).toBe('2025')
    const fetcher = transport()
    const stale = await estimateRent(property(), { fetch: fetcher, now: () => new Date('2029-01-01T00:00:00Z') })
    expect(stale.status).toBe('unavailable'); expect(stale.limitations.join()).toContain('mer enn tre år gammelt')
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
  it('ekstrapolerer ikke og stopper mangler, motstrid, annen boligtype og ukjent kommune', async () => {
    for (const mutate of [
      (p: RentalProperty) => { p.area!.value = 25 },
      (p: RentalProperty) => { p.area!.value = 75 },
      (p: RentalProperty) => { p.rooms!.value = 9 },
      (p: RentalProperty) => { p.address = null },
      (p: RentalProperty) => { p.rooms = null },
      (p: RentalProperty) => { p.propertyType!.value = 'unsupported' },
      (p: RentalProperty) => { p.municipality!.value = 'Ålesund' },
      (p: RentalProperty) => { p.issues.push('Arealene er motstridende.') },
    ]) {
      const input = property(); mutate(input)
      const result = await estimateRent(input, { fetch: transport(), now })
      expect(result.status).toBe('unavailable'); expect(result.monthly).toBeNull()
      expect(RentEstimateSchema.safeParse(result).success).toBe(true)
    }
  })
  it('tolker nullcelle, uventet struktur og feil statistikkår som utilgjengelig', async () => {
    for (const mutate of [
      (d: typeof originalData) => { d.value[207] = null },
      (d: typeof originalData) => { d.value[207] = 0 },
      (d: typeof originalData) => { d.value.pop() },
      (d: typeof originalData) => { d.dimension.Soner2.category.index['05.00'] = 100 },
      (d: typeof originalData) => { d.id[0] = 'Uventet' },
      (d: typeof originalData) => { d.dimension.Tid.category.index = { '2024': 0 }; d.dimension.Tid.category.label = { '2024': '2024' } },
    ]) {
      const data = structuredClone(originalData); mutate(data)
      const result = await estimateRent(property(), { fetch: transport(undefined, data), now })
      expect(result.status).toBe('unavailable'); expect(result.monthly).toBeNull(); expect(result.observations).toEqual([])
    }
  })
  it('håndterer HTTP-feil, ugyldig JSON og for store svar uten leie', async () => {
    for (const response of [new Response('nei', { status: 429 }), new Response('nei', { status: 503 }), new Response('ikke JSON'),
      new Response('x'.repeat(256 * 1024 + 1)), new Response('{}', { headers: { 'content-length': '99999999' } })]) {
      const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response)
      const result = await estimateRent(property(), { fetch: fetcher, now })
      expect(result.status).toBe('unavailable'); expect(result.monthly).toBeNull(); expect(fetcher).toHaveBeenCalledTimes(1)
    }
  })
  it('avbryter før nettverkskall og deler ikke cache mellom injiserte transporter', async () => {
    const controller = new AbortController(); controller.abort()
    const fetcher = transport()
    expect((await estimateRent(property(), { fetch: fetcher, now, signal: controller.signal })).status).toBe('unavailable')
    expect(fetcher).not.toHaveBeenCalled()
    await estimateRent(property(), { fetch: fetcher, now }); await estimateRent(property(), { fetch: fetcher, now })
    expect(fetcher).toHaveBeenCalledTimes(4)
  })
  it('mellomlagrer bare offentlige data, henter reviderte celler etter 15 minutter og holder objekter adskilt', async () => {
    vi.resetModules()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(now())
    const metadata = structuredClone(originalMetadata), data = structuredClone(originalData)
    const fetcher = transport(metadata, data)
    vi.stubGlobal('fetch', fetcher)
    try {
      const { estimateRent: cachedEstimate } = await import('../../src/backend/rent/ssb-rent.ts')
      const firstProperty = property(), secondProperty = property()
      secondProperty.documentHash = 'b'.repeat(64)
      secondProperty.documentName = 'annet-objekt.pdf'
      secondProperty.address!.value = 'Annen gate 2, 4006 Stavanger'
      secondProperty.area!.value = 60
      for (const field of [secondProperty.address, secondProperty.municipality, secondProperty.district, secondProperty.area, secondProperty.rooms, secondProperty.propertyType]) {
        if (field) field.sources = field.sources.map(source => ({ ...source, documentHash: secondProperty.documentHash, documentName: secondProperty.documentName }))
      }
      const first = await cachedEstimate(firstProperty)
      const second = await cachedEstimate(secondProperty)
      expect(first).toMatchObject({ monthly: '12200', annual: '146400', documentHash: firstProperty.documentHash, property: firstProperty })
      expect(second).toMatchObject({ monthly: '12800', annual: '153600', documentHash: secondProperty.documentHash, property: secondProperty })
      expect(second.property).not.toBe(first.property)
      expect(first.property.address!.value).toBe('Eksempelgata 1, 4006 Stavanger')
      expect(fetcher).toHaveBeenCalledTimes(2)

      // SSB reviderer cellen mens klientens 15-minutters cache fortsatt gjelder.
      data.value[207] = 13200
      metadata.updated = data.updated = '2026-11-04T12:15:00Z'
      vi.setSystemTime(new Date('2026-11-04T12:14:59.000Z'))
      const beforeExpiry = await cachedEstimate(firstProperty)
      expect(beforeExpiry).toMatchObject({ monthly: '12200', annual: '146400', fetchedAt: '2026-11-04T12:14:59.000Z' })
      expect(fetcher).toHaveBeenCalledTimes(2)

      vi.setSystemTime(new Date('2026-11-04T12:15:01.000Z'))
      const revised = await cachedEstimate(firstProperty)
      expect(fetcher).toHaveBeenCalledTimes(4)
      expect(revised).toMatchObject({ monthly: '13200', annual: '158400', sourceUpdated: '2026-11-04T12:15:00Z', property: firstProperty })
      expect(first).toMatchObject({ monthly: '12200', annual: '146400' })
      expect(second).toMatchObject({ monthly: '12800', annual: '153600', property: secondProperty })
      expect(RentEstimateSchema.safeParse(revised).success).toBe(true)
    } finally {
      vi.unstubAllGlobals()
      vi.useRealTimers()
      vi.resetModules()
    }
  })
})
