import { z } from 'zod'
import Big from 'big.js'
import { ReportHashSchema } from './document-analysis.ts'
import { PublishedRentAssessmentSchema } from './rent-reference.ts'
import { PdfSourceSchema } from './pdf-source.ts'

const Decimal = Big(); Decimal.strict = true
const sources = z.array(PdfSourceSchema).min(1).max(200)
const textField = z.strictObject({ value: z.string().min(1).max(300), sources })
const amount = z.string().max(80).regex(/^(?:0|[1-9]\d*)(?:\.\d+)?$/)

export const RentalPropertySchema = z.strictObject({
  documentHash: ReportHashSchema, documentName: z.string().min(1).max(255),
  address: textField.nullable(), municipality: textField.nullable(), district: textField.nullable(),
  area: z.strictObject({ value: z.number().positive().max(1000), sources, basis: z.enum(['BRA-i', 'BRA', 'P-ROM']) }).nullable(),
  rooms: z.strictObject({ value: z.number().int().min(1).max(20), sources }).nullable(),
  bedrooms: z.strictObject({ value: z.number().int().min(0).max(20), sources }).nullable().optional(),
  propertyType: z.strictObject({ value: z.enum(['apartment', 'unsupported']), sources }).nullable(),
  issues: z.array(z.string().min(1).max(2000)).max(200),
})

export const RentEstimateSchema = z.strictObject({
  version: z.literal('local-rent-1'),
  kind: z.literal('statistical-reference'), snapshotDate: z.literal('2026-11-04'),
  published: PublishedRentAssessmentSchema,
  marketEstimate: z.strictObject({ status: z.literal('unavailable'), monthly: z.null(), reason: z.string().min(1).max(2000) }), documentHash: ReportHashSchema, property: RentalPropertySchema,
  status: z.enum(['estimated', 'unavailable']), monthly: amount.nullable(), low: amount.nullable(), high: amount.nullable(), annual: amount.nullable(),
  statisticsYear: z.string().regex(/^\d{4}$/).nullable(), fetchedAt: z.iso.datetime().max(40), sourceUrl: z.string().url().max(2048).nullable(),
  method: z.string().min(1).max(500), limitations: z.array(z.string().min(1).max(2000)).max(100),
  observations: z.array(z.strictObject({ zoneCode: z.string().min(1).max(50), zoneLabel: z.string().min(1).max(300), sizeCode: z.string().min(1).max(100), area: z.number().positive().max(1000), monthly: amount })).max(100),
  formula: z.string().min(1).max(2000).nullable(), sourceUpdated: z.string().min(1).max(100).nullable(),
  areaMethod: z.strictObject({ kind: z.enum(['exact', 'interpolated', 'nearest-boundary']), documentArea: z.number().positive().max(1000),
    lowerArea: z.number().positive().max(1000), upperArea: z.number().positive().max(1000), weight: amount }).nullable(),
}).superRefine((value, context) => {
  const fail = (message: string) => context.addIssue({ code: 'custom', message })
  if (value.documentHash !== value.property.documentHash) fail('Leieestimatet må gjelde samme dokument som boliggrunnlaget.')
  const selected = value.published.references.find(item => item.reference.id === value.published.selectedReferenceId)
  const normalize = (text: string) => text.toLocaleLowerCase('nb-NO').replace(/\s+kommune\s*$/, '').trim()
  if (selected && (value.property.issues.length > 0 || value.property.propertyType?.value !== 'apartment' || !value.property.area || !value.property.address
    || selected.reference.rooms !== value.property.rooms?.value || normalize(selected.reference.municipality) !== normalize(value.property.municipality?.value ?? '')
    || (selected.reference.district !== null && normalize(selected.reference.district) !== normalize(value.property.district?.value ?? '')))) fail('Valgt publisert referanse må samsvare med dokumentert boligtype, rom og geografi uten blokkerende opplysninger.')
  const amounts = [value.monthly, value.low, value.high, value.annual]
  if (value.status === 'unavailable') {
    if (amounts.some(amount => amount !== null) || value.observations.length > 0 || value.formula !== null || value.areaMethod !== null) fail('Utilgjengelig leieestimat skal ikke inneholde beløp, observasjoner, arealmetode eller formel.')
    return
  }
  const property = value.property
  if (!property.address || !property.municipality || !property.area || !property.rooms || property.propertyType?.value !== 'apartment' || property.issues.length > 0) {
    fail('Et beregnet estimat krever entydig adresse, kommune, areal, romantall og støttet enkeltleilighet uten blokkerende opplysninger.')
  }
  for (const field of [property.address, property.municipality, property.area, property.rooms, property.bedrooms, property.propertyType, property.district]) {
    if (field?.sources.some(source => source.documentHash !== property.documentHash || source.documentName !== property.documentName)) fail('Boligopplysningenes kilder må gjelde samme dokument.')
  }
  if (!value.statisticsYear || Number(value.statisticsYear) < 2012 || !value.sourceUpdated?.trim() || !value.formula?.trim() || value.observations.length === 0) {
    fail('Et beregnet estimat krever statistikkår, kildeoppdatering, formel og SSB-observasjoner.')
  }
  const area = value.areaMethod
  if (!area || area.documentArea !== property.area?.value) fail('Estimatet krever en arealmetode som stemmer med dokumentarealet.')
  else if (!amount.safeParse(area.weight).success) fail('Arealvekten må være et gyldig desimaltall.')
  else {
    const documentArea = new Decimal(String(area.documentArea)), lower = new Decimal(String(area.lowerArea)), upper = new Decimal(String(area.upperArea))
    const weight = new Decimal(area.weight)
    if (area.kind === 'exact' && (!lower.eq(upper) || !lower.eq(documentArea) || !weight.eq('0'))) fail('Eksakt arealpunkt må være lik dokumentarealet og ha vekt null.')
    if (area.kind === 'interpolated' && (!lower.lt(documentArea) || !documentArea.lt(upper) || !weight.eq(documentArea.minus(lower).div(upper.minus(lower))))) fail('Interpolasjon må bruke to omsluttende arealpunkter og korrekt lineær vekt.')
    if (area.kind === 'nearest-boundary' && (!lower.eq(upper) || lower.eq(documentArea) || lower.minus(documentArea).abs().gt('2') || !weight.eq('0'))) fail('Ytterpunktstilnærming krever ett referansepunkt høyst 2 m² fra dokumentarealet og vekt null.')
    const roomGroup = String(Math.min(5, property.rooms?.value ?? 0))
    if (value.observations.some(observation => observation.sizeCode !== `${roomGroup}.${String(observation.area).padStart(3, '0')}` || ![area.lowerArea, area.upperArea].includes(observation.area))) fail('SSB-cellene må bruke arealmetodens referansepunkter i samme romgruppe.')
    for (const zone of new Set(value.observations.map(observation => observation.zoneCode))) {
      const points = value.observations.filter(observation => observation.zoneCode === zone).map(observation => observation.area).sort((a, b) => a - b)
      if (points.join() !== [...new Set([area.lowerArea, area.upperArea])].sort((a, b) => a - b).join()) fail('Hver prissone må inneholde akkurat de relevante arealcellene.')
    }
  }
  try {
    const source = new URL(value.sourceUrl ?? '')
    const validPage = ['ssb.no', 'www.ssb.no'].includes(source.hostname) && /^\/statbank\/table\/09897\/?$/.test(source.pathname)
    const validApi = source.hostname === 'data.ssb.no' && source.pathname === '/api/pxwebapi/v2/tables/09897/data'
    if (source.protocol !== 'https:' || source.username || source.password || source.port || source.hash || (!validPage && !validApi)) fail('Estimatets kilde må være SSBs offisielle tabell 09897 eller det åpne dataendepunktet.')
  } catch { fail('Et beregnet estimat krever en gyldig SSB-kilde.') }
  if (amounts.some(amount => amount === null)) { fail('Et beregnet estimat krever månedsleie, årsleie og begge intervallgrenser.'); return }
  try {
    const [monthly, low, high, annual] = amounts.map(amount => new Decimal(amount!))
    if (amounts.some(amount => !new Decimal(amount!).gt('0'))) fail('Alle leiebeløp må være positive.')
    if (low!.gt(monthly!) || monthly!.gt(high!)) fail('Månedsleien må ligge mellom nedre og øvre intervallgrense.')
    if (!annual!.eq(monthly!.times('12'))) fail('Årsleien må være nøyaktig tolv ganger månedsleien.')
    if (value.observations.some(observation => !new Decimal(observation.monthly).gt('0'))) fail('SSB-observasjoner må ha positiv månedsleie.')
  } catch { fail('Leiebeløpene må være gyldige desimaltall.') }
})

export type RentalProperty = z.infer<typeof RentalPropertySchema>
export type RentEstimate = z.infer<typeof RentEstimateSchema>
