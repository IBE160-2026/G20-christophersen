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
function snapshot(metadata = structuredClone(originalMetadata), data = structuredClone(originalData)) {
  return { metadata, data }
}

describe('SSB-leieagent med ekte, offentlige 2025-celler', () => {
  it.each([1, 2, 3, 4, 5])('bruker alle faktiske punkter og nabointervaller i romgruppe %i, også ikke-like avstander', async rooms => {
    const points = Object.keys(originalMetadata.dimension.AntRomBRA.category.index).filter(code => code.startsWith(`${rooms}.`)).map(code => ({ code, area: Number(code.split('.')[1]) }))
    const raw = (code: string): number => originalData.value[originalData.dimension.Soner2.category.index['05.00'] * 25 + originalData.dimension.AntRomBRA.category.index[code]]
    for (const [index, point] of points.entries()) {
      const input = property(); input.rooms!.value = rooms; input.area!.value = point.area
      const exact = await estimateRent(input, { snapshot: snapshot(), now })
      expect(exact.status).toBe('estimated'); expect(exact.monthly).toBe(String(raw(point.code)))
      expect(exact.areaMethod).toEqual({ kind: 'exact', documentArea: point.area, lowerArea: point.area, upperArea: point.area, weight: '0' })
      expect(exact.observations.map(item => item.sizeCode)).toEqual([point.code])
      expect(RentEstimateSchema.safeParse(exact).success).toBe(true)
      const next = points[index + 1]
      if (!next) continue
      input.area!.value = point.area + (next.area - point.area) / 4
      const interpolated = await estimateRent(input, { snapshot: snapshot(), now })
      expect(interpolated.monthly).toBe(String(Math.round((raw(point.code) * 0.75 + raw(next.code) * 0.25) / 100) * 100))
      expect(interpolated.observations.map(item => item.sizeCode)).toEqual([point.code, next.code])
      expect(interpolated.areaMethod).toEqual({ kind: 'interpolated', documentArea: input.area!.value, lowerArea: point.area, upperArea: next.area, weight: '0.25' })
      expect(interpolated.formula).toContain(`/ ${next.area - point.area} = 0.25`)
      expect(RentEstimateSchema.safeParse(interpolated).success).toBe(true)
    }
  })
  it.each([1, 2, 3, 4, 5])('avgrenser begge ytterpunkter til nøyaktig 2 m² i romgruppe %i uten ekstrapolasjon', async rooms => {
    const points = Object.keys(originalMetadata.dimension.AntRomBRA.category.index).filter(code => code.startsWith(`${rooms}.`)).map(code => ({ code, area: Number(code.split('.')[1]) }))
    for (const [point, direction] of [[points[0]!, -1], [points.at(-1)!, 1]] as const) {
      const input = property(); input.rooms!.value = rooms; input.area!.value = point.area
      const reference = await estimateRent(input, { snapshot: snapshot(), now })
      for (const distance of [0.1, 1, 2]) {
        input.area!.value = point.area + direction * distance
        const result = await estimateRent(input, { snapshot: snapshot(), now })
        expect(result.status).toBe('estimated'); expect(result.monthly).toBe(reference.monthly)
        expect(result.observations).toEqual(reference.observations)
        expect(result.areaMethod).toEqual({ kind: 'nearest-boundary', documentArea: input.area!.value, lowerArea: point.area, upperArea: point.area, weight: '0' })
        expect(result.low).toBe(reference.low); expect(result.high).toBe(reference.high)
        expect(RentEstimateSchema.safeParse(result).success).toBe(true)
      }
      input.area!.value = point.area + direction * 2.0001
      const saved = snapshot(), rejected = await estimateRent(input, { snapshot: saved, now })
      expect(rejected).toMatchObject({ status: 'unavailable', monthly: null, annual: null, observations: [], areaMethod: null })
      expect(rejected.limitations.join(' ')).toContain('mer enn 2 m²')
    }
  })
  it('avviser tom romgruppe, manglende relevant punkt og null i tilnærming uten å gjette annen sone', async () => {
    const missingGroup = structuredClone(originalMetadata)
    const remaining = Object.keys(missingGroup.dimension.AntRomBRA.category.index).filter(code => !code.startsWith('3.'))
    missingGroup.dimension.AntRomBRA.category.index = Object.fromEntries(remaining.map((code, index) => [code, index])); missingGroup.size[1] = remaining.length
    const input = property(); input.rooms!.value = 3; input.area!.value = 59; input.municipality!.value = 'Oslo'; input.district = { value: 'Gamle Oslo', sources: input.address!.sources }
    const noPoints = await estimateRent(input, { snapshot: snapshot(missingGroup), now })
    expect(noPoints.status).toBe('unavailable'); expect(noPoints.limitations.join(' ')).toContain('ingen publiserte arealpunkter')
    const nullData = structuredClone(originalData)
    nullData.value[originalData.dimension.Soner2.category.index['01.02'] * 25 + originalData.dimension.AntRomBRA.category.index['3.060']] = null
    const nullResult = await estimateRent(input, { snapshot: snapshot(undefined, nullData), now })
    expect(nullResult).toMatchObject({ status: 'unavailable', monthly: null, observations: [], areaMethod: null })
    expect(nullResult.limitations.join(' ')).toContain('ikke publisert en gyldig leie')
    const missingData = structuredClone(originalData)
    const retainedSizes = Object.keys(missingData.dimension.AntRomBRA.category.index).filter(code => code !== '3.060')
    missingData.dimension.AntRomBRA.category.index = Object.fromEntries(retainedSizes.map((code, index) => [code, index]))
    delete missingData.dimension.AntRomBRA.category.label['3.060']
    missingData.size[1] = retainedSizes.length
    missingData.value = originalData.value.filter((_: unknown, index: number) => index % 25 !== originalData.dimension.AntRomBRA.category.index['3.060'])
    const missing = await estimateRent(input, { snapshot: snapshot(undefined, missingData), now })
    expect(missing).toMatchObject({ status: 'unavailable', monthly: null, observations: [] })
    expect(missing.limitations.join(' ')).toContain('mangler valgt kombinasjon')
  })
  it.each(['nullcelle', 'manglende sone'])('avviser hele ytterpunktstilnærmingen ved ukjent Oslo-bydel med én %s og gyldige øvrige soner', async missing => {
    const input = property(); input.rooms!.value = 3; input.area!.value = 59; input.municipality!.value = 'Oslo'
    const data = structuredClone(originalData), size = originalData.dimension.AntRomBRA.category.index['3.060']
    const selectedZones = ['01.01', '01.02', '01.03', '01.04']
    expect(selectedZones.every(zone => originalData.value[originalData.dimension.Soner2.category.index[zone] * 25 + size] > 0)).toBe(true)
    if (missing === 'nullcelle') data.value[originalData.dimension.Soner2.category.index['01.03'] * 25 + size] = null
    else {
      const retainedZones = Object.keys(data.dimension.Soner2.category.index).filter(zone => zone !== '01.03')
      data.dimension.Soner2.category.index = Object.fromEntries(retainedZones.map((zone, index) => [zone, index]))
      delete data.dimension.Soner2.category.label['01.03']
      data.size[0] = retainedZones.length
      data.value = originalData.value.filter((_: unknown, index: number) => Math.floor(index / 25) !== originalData.dimension.Soner2.category.index['01.03'])
    }
    const result = await estimateRent(input, { snapshot: snapshot(undefined, data), now })
    expect(result).toMatchObject({ status: 'unavailable', monthly: null, annual: null, observations: [], areaMethod: null })
    expect(result.limitations.join(' ')).toContain(missing === 'nullcelle' ? 'ikke publisert en gyldig leie' : 'mangler valgt kombinasjon')
  })
  it('bruker verifisert Stavanger-celle, skiller måned/år og viser bare geografisk sonespenn', async () => {
    const saved = snapshot()
    const result = await estimateRent(property(), { snapshot: saved, now })
    expect(result).toMatchObject({ status: 'estimated', monthly: '12200', annual: '146400', low: '12200', high: '12200', statisticsYear: '2025', sourceUpdated: '2025-12-22T07:00:00Z' })
    expect(RentEstimateSchema.safeParse(result).success).toBe(true)
    expect(result.observations).toEqual([{ zoneCode: '05.00', zoneLabel: 'Stavanger', sizeCode: '2.050', area: 50, monthly: '12200' }])
    expect(result.formula).toContain('12200')
    expect(result.limitations.join()).toContain('ikke et individuelt usikkerhets-, konfidens- eller prediksjonsintervall')
    const url = new URL(result.sourceUrl!)
    expect(url.searchParams.get('valueCodes[Tid]')).toBe('2025')
    expect(url.searchParams.get('valueCodes[ContentsCode]')).toBe('Husleie')
  })
  it('interpolerer mellom 50 og 60 m² med kontrollerbare råceller og eksakt vekt', async () => {
    const input = property(); input.area!.value = 55
    const result = await estimateRent(input, { snapshot: snapshot(), now })
    expect(result).toMatchObject({ monthly: '12500', annual: '150000', low: '12500', high: '12500' })
    expect(result.observations.map(item => item.monthly)).toEqual(['12200', '12800'])
    expect(result.formula).toContain('(55 − 50) / 10 = 0.5')
    expect(result.formula).toContain('12200 + (12800 − 12200) × 0.5 = 12500.00')
  })
  it('bevarer gyldig kontrakt for små desimalvekter uten eksponentformat', async () => {
    const input = property(); input.area!.value = 60.0000001
    const result = await estimateRent(input, { snapshot: snapshot(), now })
    expect(result.status).toBe('estimated'); expect(result.areaMethod?.weight).toBe('0.00000001')
    expect(RentEstimateSchema.safeParse(result).success).toBe(true)
  })
  it('bruker alle Oslo-soner ved ukjent bydel og snevrer bare ved eksplisitt kjent bydel', async () => {
    const input = property(); input.municipality!.value = 'Oslo'
    const broad = await estimateRent(input, { snapshot: snapshot(), now })
    expect(broad).toMatchObject({ monthly: '15600', low: '14500', high: '16700' })
    expect(broad.observations).toHaveLength(4)
    expect(broad.limitations.join()).toContain('Bydel er uavklart')
    input.district = { value: 'Frogner', sources: input.address!.sources }
    const precise = await estimateRent(input, { snapshot: snapshot(), now })
    expect(precise).toMatchObject({ monthly: '16700', low: '16700', high: '16700' })
    expect(precise.observations).toHaveLength(1)
    input.district.value = 'Ukjent lokalt stedsnavn'
    expect((await estimateRent(input, { snapshot: snapshot(), now })).monthly).toBe(broad.monthly)
  })
  it('endrer ikke beløp eller spenn ved BRA/P-ROM og støtter 5–8 rom uten å skape egen romgruppe', async () => {
    const input = property(); input.area!.basis = 'P-ROM'
    const result = await estimateRent(input, { snapshot: snapshot(), now })
    expect(result).toMatchObject({ low: '12200', high: '12200' })
    input.rooms!.value = 8; input.area!.value = 120
    const large = await estimateRent(input, { snapshot: snapshot(), now })
    expect(large).toMatchObject({ status: 'estimated', monthly: '19600' })
    expect(large.observations[0]?.sizeCode).toBe('5.120')
  })
  it('følger dimensjonsindekser selv om JSON-stat-rekkefølgen endres', async () => {
    const data = structuredClone(originalData)
    data.id = ['Tid', 'ContentsCode', 'AntRomBRA', 'Soner2']; data.size = [1, 1, 25, 16]
    data.value = Array.from({ length: 400 }, (_, index) => originalData.value[(index % 16) * 25 + Math.floor(index / 16)])
    const result = await estimateRent(property(), { snapshot: snapshot(undefined, data), now })
    expect(result.monthly).toBe('12200')
  })
  it('velger nyeste metadataår før nå, og avviser mer enn tre år gammelt datagrunnlag', async () => {
    const metadata = structuredClone(originalMetadata)
    metadata.dimension.Tid.category.index['2099'] = 14; metadata.dimension.Tid.category.label['2099'] = '2099'; metadata.size[3]++
    expect((await estimateRent(property(), { snapshot: snapshot(metadata), now })).statisticsYear).toBe('2025')
    const saved = snapshot()
    const stale = await estimateRent(property(), { snapshot: saved, now: () => new Date('2029-01-01T00:00:00Z') })
    expect(stale.status).toBe('unavailable'); expect(stale.limitations.join()).toContain('mer enn tre år gammelt')
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
      const result = await estimateRent(input, { snapshot: snapshot(), now })
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
      const result = await estimateRent(property(), { snapshot: snapshot(undefined, data), now })
      expect(result.status).toBe('unavailable'); expect(result.monthly).toBeNull(); expect(result.observations).toEqual([])
    }
  })
  it('bruker identiske lokale råfiler og gjør ingen nettforespørsler ved gjentakelse eller nytt objekt', async () => {
    expect(readFileSync(new URL('../../src/backend/rent/data/09897-2025.json', import.meta.url), 'utf8')).toBe(readFileSync(new URL('../fixtures/ssb/09897-2025.json', import.meta.url), 'utf8'))
    const blocked = vi.fn<typeof fetch>().mockRejectedValue(new Error('Nett er sperret'))
    vi.stubGlobal('fetch', blocked)
    try {
      const first = await estimateRent(property(), { now })
      first.observations[0]!.monthly = '99999'
      const again = await estimateRent(property(), { now })
      expect(again.monthly).toBe('12200'); expect(again.observations[0]!.monthly).toBe('12200')
      const other = property(); other.area!.value = 60
      expect((await estimateRent(other, { now })).monthly).toBe('12800')
      const controller = new AbortController(); controller.abort()
      expect((await estimateRent(property(), { now, signal: controller.signal })).status).toBe('unavailable')
      expect(blocked).not.toHaveBeenCalled()
    } finally { vi.unstubAllGlobals() }
  })
})

it('forklarer konkret boligtypegrensen og bruker aldri leilighetsceller som eneboligleie', async () => {
  const input = property(); input.propertyType!.value = 'unsupported'; input.area!.value = 196; input.rooms!.value = 3
  input.issues = ['Første leiemodell støtter bare enkeltleiligheter.']
  const saved = snapshot(), result = await estimateRent(input, { snapshot: saved, now })
  expect(result.status).toBe('unavailable'); expect(result.monthly).toBeNull(); expect(result.observations).toEqual([])
  expect(result.limitations.join(' ')).toContain('ingen SSB-celle brukes som leie for hele objektet')

})
it('forklarer faktisk areal/rom og publisert spenn når en leilighet ligger utenfor datastøtten', async () => {
  const input = property(); input.area!.value = 196; input.rooms!.value = 3
  const saved = snapshot(), result = await estimateRent(input, { snapshot: saved, now })
  expect(result.status).toBe('unavailable'); expect(result.monthly).toBeNull()
  expect(result.limitations.join(' ')).toContain('196 m² og 3 rom')
  expect(result.limitations.join(' ')).toContain('60–100 m²')
})

it('59 m² bruker uendret 3.060-celle bare i dokumentert Gamle Oslo-sone og gir ingen udokumentert margin', async () => {
  const input = property(); input.area!.value = 59; input.rooms!.value = 3; input.municipality!.value = 'Oslo'
  input.district = { value: 'Gamle Oslo', sources: input.address!.sources }
  const saved = snapshot(), result = await estimateRent(input, { snapshot: saved, now })
  expect(result).toMatchObject({ status: 'estimated', monthly: '18900', annual: '226800', low: '18900', high: '18900', statisticsYear: '2025',
    areaMethod: { kind: 'nearest-boundary', documentArea: 59, lowerArea: 60, upperArea: 60, weight: '0' } })
  expect(result.observations).toEqual([{ zoneCode: '01.02', zoneLabel: originalData.dimension.Soner2.category.label['01.02'], sizeCode: '3.060', area: 60, monthly: '18900' }])
  expect(result.formula).toContain('59 → 60 m²; referanseverdi uendret')
  expect(result.limitations.join(' ')).toContain('ikke en direkte SSB-prediksjon for 59 m²')
  expect(result.limitations.join(' ')).toContain('Ingen prosentmargin')
  expect(RentEstimateSchema.safeParse(result).success).toBe(true)
})
