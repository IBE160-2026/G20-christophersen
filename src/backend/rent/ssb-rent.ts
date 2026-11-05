import Big from 'big.js'
import { z } from 'zod'
import type { RentalProperty, RentEstimate } from '../../contracts/rent-estimate.ts'
import { assessPublishedReferences } from './published-references.ts'
import staticMetadata from './data/09897-metadata.json' with { type: 'json' }
import staticData from './data/09897-2025.json' with { type: 'json' }

const Decimal = Big(); Decimal.strict = true
const API = 'https://data.ssb.no/api/pxwebapi/v2/tables/09897'
const IDS = ['Soner2', 'AntRomBRA', 'ContentsCode', 'Tid']
const DimensionSchema = z.object({
  category: z.object({
    index: z.record(z.string().min(1).max(80), z.number().int().nonnegative().max(10_000)),
    label: z.record(z.string(), z.string().max(300)),
  }),
})
const DatasetSchema = z.object({
  version: z.literal('2.0'), class: z.literal('dataset'), updated: z.iso.datetime(),
  id: z.array(z.string()).length(4), size: z.array(z.number().int().positive().max(1000)).length(4),
  dimension: z.record(z.string(), DimensionSchema),
  value: z.array(z.number().finite().positive().max(1_000_000).nullable()).max(10_000),
})
type Dataset = z.infer<typeof DatasetSchema>

function parseDataset(input: unknown, metadata: boolean): Dataset {
  const parsed = DatasetSchema.safeParse(input)
  if (!parsed.success) throw new Error('SSB svarte med et ukjent eller ugyldig dataformat.')
  const dataset = parsed.data
  if (new Set(dataset.id).size !== IDS.length || IDS.some(id => !dataset.id.includes(id))) throw new Error('SSBs dimensjoner er endret.')
  let cells = 1
  for (const [position, id] of dataset.id.entries()) {
    const dimension = dataset.dimension[id]
    if (!dimension) throw new Error('SSB mangler en forventet dimensjon.')
    const indices = Object.values(dimension.category.index).sort((a, b) => a - b)
    if (indices.length !== dataset.size[position] || indices.some((value, index) => value !== index)
      || Object.keys(dimension.category.index).some(code => !dimension.category.label[code])) throw new Error('SSBs dimensjonsindeks er ugyldig.')
    cells *= indices.length
  }
  if (cells > 10_000 || (!metadata && dataset.value.length !== cells) || (metadata && dataset.value.length !== 0)) throw new Error('SSBs antall dataceller er ugyldig.')
  return dataset
}

function normalize(value: string) { return value.toLocaleLowerCase('nb-NO').replace(/^\s*\d{4}\s+/, '').replace(/\s+kommune\s*$/, '').trim() }
const MUNICIPALITIES: Record<string, string[]> = {
  oslo: ['01.01', '01.02', '01.03', '01.04'], bergen: ['03.01', '03.02'], trondheim: ['04.01', '04.02'],
  stavanger: ['05.00'], kristiansand: ['06.00'], tromsø: ['07.00'],
  bærum: ['02.01'], nesodden: ['02.01'], lørenskog: ['02.01'],
}
const DISTRICTS: Record<string, string[]> = {
  '01.01': ['sentrum', 'frogner', 'ullern', 'st.hanshaugen', 'st. hanshaugen', 'sankt hanshaugen'],
  '01.02': ['grünerløkka', 'gamle oslo', 'sagene', 'nordre aker', 'vestre aker'],
  '01.03': ['østensjø', 'nordstrand', 'bjerke'], '01.04': ['søndre nordstrand', 'grorud', 'stovner', 'alna'],
  '03.01': ['bergenhus'], '03.02': ['arna', 'ytrebygda', 'åsane', 'fana', 'fyllingsdalen', 'laksevåg', 'årstad'],
  '04.01': ['midtbyen', 'østbyen', 'nedre elvehavn'], '04.02': ['lerkendal', 'heimdal'],
}

function geography(property: RentalProperty) {
  const zones = property.municipality ? MUNICIPALITIES[normalize(property.municipality.value)] : null
  if (!zones) return null
  const district = property.district ? normalize(property.district.value).replace(/^bydel\s+/, '') : null
  const precise = district ? zones.find(zone => DISTRICTS[zone]?.includes(district)) : null
  return { zones: precise ? [precise] : zones, broad: zones.length > 1 && !precise }
}

function cell(dataset: Dataset, coordinates: Record<string, string>) {
  let index = 0
  for (const [position, id] of dataset.id.entries()) {
    const offset = dataset.dimension[id]!.category.index[coordinates[id]!]
    if (offset === undefined) throw new Error('SSB mangler valgt kombinasjon av område, rom, areal og år.')
    index = index * dataset.size[position]! + offset
  }
  const value = dataset.value[index]
  if (value === null || value === undefined || value <= 0) throw new Error('SSB har ikke publisert en gyldig leie for valgt kombinasjon.')
  return new Decimal(String(value))
}
function rounded(value: Big, mode: 0 | 1 | 3 = Decimal.roundHalfUp) { return value.div('100').round(0, mode).times('100').toFixed(0) }

export async function estimateRent(property: RentalProperty, options: { snapshot?: { metadata: unknown; data: unknown }; now?: () => Date; signal?: AbortSignal } = {}): Promise<RentEstimate> {
  const now = options.now?.() ?? new Date()
  const base: RentEstimate = {
    version: 'local-rent-1', kind: 'statistical-reference', snapshotDate: '2026-11-04',
    published: assessPublishedReferences(property, now),
    marketEstimate: { status: 'unavailable', monthly: null, reason: 'Materialet gir statistiske gruppereferanser, men mangler individuelle sammenligningsobjekter og dokumentert areal-, standard- og beliggenhetsjustering. Individuell markedsleie er ikke beregnet.' }, documentHash: property.documentHash, property, status: 'unavailable',
    monthly: null, low: null, high: null, annual: null, statisticsYear: null, fetchedAt: now.toISOString(),
    sourceUrl: null, sourceUpdated: null, method: 'Lokal statistisk sammenligning · SSB 09897 (2025), kontrollert 04.11.2026 · lineær interpolasjon og merket ytterpunktstilnærming inntil 2 m² · local-rent-1',
    limitations: [...property.issues], observations: [], formula: null, areaMethod: null,
  }
  const unavailable = (reason: string) => ({ ...base, limitations: [...base.limitations, reason] })
  if (property.propertyType?.value === 'unsupported') return unavailable('Boligtypen i dokumentet er ikke en enkeltleilighet. Denne leiemodellen støtter bare enkeltleiligheter; ingen SSB-celle brukes som leie for hele objektet.')
  if (property.issues.length) return unavailable('Dokumentgrunnlaget inneholder uavklarte opplysninger; automatisk leieestimat er ikke beregnet.')
  if (!property.address || !property.municipality || !property.area || !property.rooms || property.propertyType?.value !== 'apartment') return unavailable('Adresse, kommune, internt areal, rom og én leilighet må kunne identifiseres i salgsoppgaven.')
  if (!Number.isInteger(property.rooms.value) || property.rooms.value < 1 || property.rooms.value > 8 || !Number.isFinite(property.area.value) || property.area.value <= 0) return unavailable('Rom eller areal ligger utenfor modellens støttede grunnlag.')
  const region = geography(property)
  if (!region) return unavailable('Adressen kan ikke knyttes sikkert til en støttet SSB-prissone. Tettsted eller bydel blir ikke gjettet.')
  try {
    if (options.signal?.aborted) return unavailable('Leieberegningen ble avbrutt.')
    const metadata = parseDataset(options.snapshot?.metadata ?? staticMetadata, true)
    const years = Object.keys(metadata.dimension.Tid!.category.index).filter(year => /^\d{4}$/.test(year) && Number(year) <= now.getUTCFullYear()).sort()
    const year = years.at(-1)
    if (!year) return unavailable('SSB har ikke publisert et gyldig statistikkår.')
    base.statisticsYear = year; base.sourceUpdated = metadata.updated
    const age = Math.max(0, now.getUTCFullYear() - Number(year))
    if (age > 3) return unavailable('SSBs siste tilgjengelige statistikkår er mer enn tre år gammelt. Automatisk leieestimat er ikke beregnet.')
    const rooms = String(Math.min(5, property.rooms.value))
    const sizes = Object.keys(metadata.dimension.AntRomBRA!.category.index).flatMap(code => {
      const match = /^([1-5])\.(\d{3})$/.exec(code)
      return match?.[1] === rooms && Number(match[2]) > 0 ? [{ code, area: Number(match[2]) }] : []
    }).sort((a, b) => a.area - b.area)
    const area = property.area.value
    if (!sizes.length) return unavailable(`SSB har ingen publiserte arealpunkter for romgruppen ${property.rooms.value} rom.`)
    let lower = sizes.findLast(size => size.area <= area), upper = sizes.find(size => size.area >= area)
    const boundary = !lower ? sizes[0]! : !upper ? sizes.at(-1)! : null
    if (boundary) {
      if (new Decimal(String(area)).minus(String(boundary.area)).abs().gt('2')) return unavailable(`Dokumentets areal ${area} m² og ${property.rooms.value} rom ligger utenfor SSBs publiserte arealpunkter for romgruppen (${sizes[0]!.area}–${sizes.at(-1)!.area} m²), mer enn 2 m² fra ytterpunktet. Ingen ekstrapolering er utført.`)
      lower = upper = boundary
    }
    // Both bounds exist after either bracketing or the explicitly limited boundary rule.
    if (!lower || !upper) return unavailable('SSBs relevante arealpunkter mangler.')
    if (region.zones.some(zone => metadata.dimension.Soner2!.category.index[zone] === undefined)) return unavailable('SSBs prissoner er endret; geografitilpasningen må kontrolleres.')
    const url = new URL(`${API}/data`)
    for (const [key, value] of Object.entries({ lang: 'no', 'valueCodes[Soner2]': '*', 'valueCodes[AntRomBRA]': '*', 'valueCodes[ContentsCode]': 'Husleie', 'valueCodes[Tid]': year })) url.searchParams.set(key, value)
    base.sourceUrl = url.href
    const dataset = parseDataset(options.snapshot?.data ?? staticData, false)
    if (Object.keys(dataset.dimension.Tid!.category.index).join() !== year || Object.keys(dataset.dimension.ContentsCode!.category.index).join() !== 'Husleie'
      || dataset.updated !== metadata.updated) throw new Error('SSBs data samsvarer ikke med valgt statistikkår eller metadata.')
    const weight = lower.area === upper.area ? new Decimal('0') : new Decimal(String(area)).minus(String(lower.area)).div(String(upper.area - lower.area))
    const observations: RentEstimate['observations'] = []
    const calculations: string[] = []
    const estimates = region.zones.map(zone => {
      const values = [lower, upper].filter((size, index, all) => index === 0 || size.code !== all[0]!.code).map(size => {
        const value = cell(dataset, { Soner2: zone, AntRomBRA: size.code, ContentsCode: 'Husleie', Tid: year })
        observations.push({ zoneCode: zone, zoneLabel: dataset.dimension.Soner2!.category.label[zone]!, sizeCode: size.code, area: size.area, monthly: value.toFixed(0) })
        return value
      })
      const estimate = values[0]!.plus((values[1] ?? values[0]!).minus(values[0]!).times(weight))
      calculations.push(`${zone}: ${values[0]!.toString()} + (${(values[1] ?? values[0]!).toString()} − ${values[0]!.toString()}) × ${weight.toString()} = ${estimate.toFixed(2)} kr/mnd`)
      return estimate
    })
    const min = estimates.reduce((a, b) => a.lt(b) ? a : b), max = estimates.reduce((a, b) => a.gt(b) ? a : b)
    const point = min.plus(max).div('2')
    const monthly = rounded(point)
    const limitations = [
      ...base.limitations,
      `Statistikkår ${year}; ingen inflasjonsjustering til dagens nivå.`,
      'Spennet viser bare laveste/høyeste relevante SSB-sone etter arealtilpasning og avrunding. Det er ikke et individuelt usikkerhets-, konfidens- eller prediksjonsintervall. Ingen prosentmargin eller udokumentert påslag brukes.',
      'SSB-snapshot er statisk og ble kontrollert 04.11.2026. Beregningstidspunktet er ikke en ny kildeoppdatering.',
      'Gjelder umøblert bolig uten tillegg for balkong, garasje, strøm eller oppvarming. Standard, etasje og utsikt er ikke prisjustert.',
      'Årsleie er månedsleie × 12 før ledighet, kostnader og skatt. Estimatet dokumenterer ikke oppnådd leie eller tillatelse til utleie.',
    ]
    if (boundary) limitations.push(`Ytterpunktstilnærming: dokumentareal ${area} m² → SSB-referanse ${boundary.area} m². Referanseverdien brukes uendret før vanlig avrunding, uten lineær ekstrapolasjon. Dette er ikke en direkte SSB-prediksjon for ${area} m².`)
    if (region.broad) limitations.push('Bydel er uavklart. Alle SSB-soner i kommunen inngår; midtpunktet mellom laveste og høyeste sone brukes uten påstått geografisk sannsynlighet.')
    if (property.area.basis !== 'BRA-i') limitations.push(`Arealgrunnlaget er ${property.area.basis}; forskjell fra internt leilighetsareal er en usikkerhetskilde.`)
    return {
      ...base, status: 'estimated', monthly, annual: new Decimal(monthly).times('12').toFixed(0),
      low: rounded(min, Decimal.roundDown),
      high: rounded(max, Decimal.roundUp), observations, limitations,
      areaMethod: { kind: boundary ? 'nearest-boundary' : lower.area === upper.area ? 'exact' : 'interpolated', documentArea: area, lowerArea: lower.area, upperArea: upper.area, weight: weight.toFixed() },
      formula: `${boundary ? `Ytterpunktstilnærming ${area} → ${boundary.area} m²; referanseverdi uendret, arealvekt 0` : lower.area === upper.area ? `Publisert arealpunkt ${area} m²; arealvekt 0` : `Arealvekt (${area} − ${lower.area}) / ${upper.area - lower.area} = ${weight.toString()}`}. ${calculations.join('; ')}. Punkt = (${min.toString()} + ${max.toString()}) / 2 = ${point.toFixed(2)} kr/mnd; avrundet til nærmeste 100 kr. Sonespenn = ${min.toString()}–${max.toString()} kr/mnd; avrundes utover til 100 kr. Ingen prosentmargin.`,
    }
  } catch (error) {
    return unavailable(error instanceof Error && !['AbortError', 'TimeoutError', 'SyntaxError'].includes(error.name) && !error.message.includes('fetch failed')
      ? error.message.slice(0, 300) : 'Det lokale SSB-grunnlaget kunne ikke valideres. Ingen gyldig leie er satt.')
  }
}
