import { afterEach, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { estimateRent } from '../../src/backend/rent/ssb-rent.ts'
import { extractRentalProperty } from '../../src/domain/rental-property.ts'
import { RentEstimateSchema } from '../../src/contracts/rent-estimate.ts'
import { PublishedRentAssessmentSchema, RentReferenceSchema } from '../../src/contracts/rent-reference.ts'
import { rentalDocument } from '../helpers/rental-fixture.ts'
import records from '../../src/backend/rent/data/published-rents.json' with { type: 'json' }

const now = () => new Date('2026-11-05T12:00:00Z')
async function apartment(city = 'Bergen', rooms = 2, area = 40, district: string | null = null) {
  return extractRentalProperty((await rentalDocument(['Adresse: Testgata 1', `Kommune: ${city}`, 'Boligtype: Leilighet', `BRA-i: ${area} m2`, `Antall rom: ${rooms}`, `Soverom: ${rooms - 1}`, ...(district ? [`Bydel: ${district}`] : [])])).outcome)
}
afterEach(() => vi.unstubAllGlobals())

it('lagrer kontrollerte verdier med kilde, dato, periode, geografi og kjent eller eksplisitt ukjent utvalg', () => {
  const parsed = z.array(RentReferenceSchema).parse(records)
  expect(parsed).toHaveLength(20)
  expect(new Set(parsed.map(item => item.id)).size).toBe(parsed.length)
  expect(parsed.every(item => item.accessedAt === '2026-11-05' && item.publishedAt && item.period && item.geography && item.locator)).toBe(true)
  expect(parsed.every(item => item.sampleSize === null)).toBe(true)
  expect(parsed.filter(item => item.metric === 'annual-change-percent').map(item => [item.municipality, item.value])).toEqual([['Bergen', '7.5'], ['Oslo', '5.5']])
  expect(parsed.find(item => item.id === 'um-2025-bergen')).toMatchObject({ value: '13900', averageAreaM2: 46, population: 'advertisements-and-portfolio', periodEnd: null })
  expect(parsed.find(item => item.id === 'hybel-q3-2026-oslo-2')).toMatchObject({ value: '16267', publishedAt: '2026-10-06', population: 'active-contracts' })
})

it('Nøstegaten-felt velger Bergen toroms uten å gjette bydel eller skalere gjennomsnittsareal', async () => {
  const result = await estimateRent(await apartment(), { now })
  expect(result.published.selectedReferenceId).toBe('hybel-q3-2026-bergen-2')
  expect(result.published.references.map(item => [item.reference.id, item.reference.value])).toEqual([
    ['hybel-q3-2026-bergen-2', '13891'], ['um-2025-bergen', '13900'], ['um-2026-10-bergen-growth', '7.5'],
  ])
  expect(result).toMatchObject({ kind: 'statistical-reference', monthly: '12000', low: '11300', high: '12600', annual: '144000', statisticsYear: '2025', marketEstimate: { status: 'unavailable', monthly: null } })
  expect(result.published.limitations.join(' ')).toContain('ikke arealtilpasset')
  expect(result.published.limitations.join(' ')).toContain('By/tettsted')
  expect(RentEstimateSchema.safeParse(result).success).toBe(true)
})

it('Rostockgata-felt velger Gamle Oslo treroms, og holder blandet nykontraktsnivå og SSB separat', async () => {
  const result = await estimateRent(await apartment('Oslo', 3, 59, 'Gamle Oslo'), { now })
  expect(result.published.selectedReferenceId).toBe('hybel-q3-2026-gamle-oslo-3')
  expect(result.published.references.find(item => item.reference.id === result.published.selectedReferenceId)).toMatchObject({ reference: { value: '20426', rooms: 3, population: 'active-contracts', averageAreaM2: null }, geographyMatch: 'district' })
  expect(result.published.references.find(item => item.reference.population === 'new-contracts')).toMatchObject({ relevance: 'context', reference: { rooms: null, value: '15510', housingType: 'mixed' } })
  expect(result).toMatchObject({ monthly: '18900', low: '18900', high: '18900', marketEstimate: { monthly: null }, areaMethod: { kind: 'nearest-boundary', documentArea: 59, lowerArea: 60 } })
  expect(result.published.references.some(item => item.reference.id === 'um-2025-oslo')).toBe(false)
  const forged = structuredClone(result.published)
  forged.selectedReferenceId = forged.references.find(item => item.reference.population === 'new-contracts')!.reference.id
  expect(PublishedRentAssessmentSchema.safeParse(forged).success).toBe(false)
  expect(RentEstimateSchema.safeParse({ ...result, property: { ...result.property, rooms: { ...result.property.rooms!, value: 2 } } }).success).toBe(false)
  expect(RentEstimateSchema.safeParse({ ...result, marketEstimate: { ...result.marketEstimate, monthly: '25000' } }).success).toBe(false)
})

it('beholder romreferanse uten individuell arealpris når SSB mangler arealdekning', async () => {
  const result = await estimateRent(await apartment('Bergen', 3, 150), { now })
  expect(result).toMatchObject({ status: 'unavailable', monthly: null, published: { selectedReferenceId: 'hybel-q3-2026-bergen-3' }, marketEstimate: { monthly: null } })
  expect(result.published.references.find(item => item.reference.id === 'hybel-q3-2026-bergen-3')!.reference.value).toBe('16759')
  expect(RentEstimateSchema.safeParse(result).success).toBe(true)
})

it('velger ikke leilighetsreferanse ved manglende, motstridende eller feil boligtype', async () => {
  for (const change of ['missing-area', 'conflict', 'house'] as const) {
    const property = await apartment()
    if (change === 'missing-area') property.area = null
    if (change === 'conflict') property.issues.push('Motstridende areal')
    if (change === 'house') property.propertyType!.value = 'unsupported'
    const result = await estimateRent(property, { now })
    expect(result).toMatchObject({ status: 'unavailable', monthly: null, published: { selectedReferenceId: null, references: [] }, marketEstimate: { monthly: null } })
  }
})

it('oppdaterer aldri statiske verdier via nett, muterte resultater, datalder eller kildevekst', async () => {
  const forbidden = vi.fn<typeof fetch>().mockRejectedValue(new Error('Ingen nett'))
  vi.stubGlobal('fetch', forbidden)
  const property = await apartment()
  const first = await estimateRent(property, { now })
  first.published.references[0]!.reference.value = '99999'
  const again = await estimateRent(property, { now })
  expect(again.published.references[0]!.reference.value).toBe('13891')
  expect(again.monthly).toBe('12000')
  const future = await estimateRent(property, { now: () => new Date('2030-11-05T12:00:00Z') })
  expect(future).toMatchObject({ status: 'unavailable', published: { selectedReferenceId: null }, marketEstimate: { monthly: null } })
  expect(future.published.references[0]!.reference.value).toBe('13891')
  const beforePublication = await estimateRent(property, { now: () => new Date('2026-10-01T12:00:00Z') })
  expect(beforePublication.published.references.some(item => item.reference.publisher === 'Hybel / Menon Economics')).toBe(false)
  expect(beforePublication.published.selectedReferenceId).toBeNull()
  expect(forbidden).not.toHaveBeenCalled()
})

it('avviser ugyldige kildeadresser og blandet boligtype som romreferanse uten parserunntak', async () => {
  for (const url of ['ikke en URL', 'javascript:alert(1)', 'https://ukjent.example/kilde']) {
    expect(RentReferenceSchema.safeParse({ ...records[0], sourceUrl: url }).success).toBe(false)
  }
  const result = await estimateRent(await apartment('Oslo', 3, 59, 'Gamle Oslo'), { now })
  const item = result.published.references.find(item => item.reference.housingType === 'mixed')!
  item.relevance = 'room-reference'
  result.published.selectedReferenceId = item.reference.id
  expect(RentEstimateSchema.safeParse(result).success).toBe(false)
})
