import { beforeAll, describe, expect, it } from 'vitest'
import type { DocumentImport } from '../../src/contracts/document-import.ts'
import { RentalPropertySchema, RentEstimateSchema } from '../../src/contracts/rent-estimate.ts'
import type { RentEstimate } from '../../src/contracts/rent-estimate.ts'
import { extractRentalProperty } from '../../src/domain/rental-property.ts'
import { importFixture } from '../helpers/import-fixture.ts'

let fixture: DocumentImport
beforeAll(async () => { fixture = (await importFixture()).outcome })
function document(text: string): DocumentImport {
  return { ...fixture, propertyIdentity: [], pages: [{ ...fixture.pages[0]!, status: 'readable', text }] }
}
const apartment = 'Adresse: Fasitveien 4, 0001 Testby\nKommune: Oslo\nBydel: Sagene\nBoligtype: Leilighet\nBRA-i: 65,5 m²\nAntall rom: 3'
function estimate(): RentEstimate {
  return { version: 'ssb-rent-1', documentHash: fixture.reportHash, property: extractRentalProperty(document(apartment)),
    status: 'estimated', monthly: '12000.01', low: '9000', high: '15000', annual: '144000.12', statisticsYear: '2025',
    fetchedAt: '2026-11-04T10:00:00.000Z', sourceUrl: 'https://www.ssb.no/statbank/table/09897/', method: 'Lineær interpolasjon',
    limitations: ['Usikkerhetsbåndet er en modellforutsetning.'], observations: [{ zoneCode: '01', zoneLabel: 'Oslo', sizeCode: '3', area: 60, monthly: '11500' }],
    formula: '12000.01 × 12 = 144000.12', sourceUpdated: '2025-12-22' }
}

describe('Leieagentens kildebundne boligopplysninger', () => {
  it('leser adresse, kommune, bydel, areal, rom og boligtype med eksakte originalspenn', () => {
    const input = document(apartment), property = extractRentalProperty(input)
    expect(RentalPropertySchema.safeParse(property).success).toBe(true)
    expect(property.address?.value).toBe('Fasitveien 4, 0001 Testby')
    expect(property.municipality?.value).toBe('Oslo')
    expect(property.district?.value).toBe('Sagene')
    expect(property.area).toMatchObject({ value: 65.5, basis: 'BRA-i' })
    expect(property.rooms?.value).toBe(3); expect(property.propertyType?.value).toBe('apartment')
    expect(property.issues).toEqual([])
    for (const field of [property.address, property.municipality, property.district, property.area, property.rooms, property.propertyType]) {
      for (const source of field!.sources) {
        expect(source.documentHash).toBe(input.reportHash)
        expect(input.pages[source.pdfPage - 1]!.text.slice(source.start, source.end)).toBe(source.quote)
      }
    }
  })
  it('leser etikett og verdi på egne linjer samt x-roms, og teller aldri soverom som rom', () => {
    const property = extractRentalProperty(document('Adresse\nFasitveien 4\nBoligtype\nLeilighet\nInternt bruksareal (BRA-i)\n60 m2\nLys 3-roms leilighet\nSoverom: 2'))
    expect(property).toMatchObject({ address: { value: 'Fasitveien 4' }, area: { value: 60 }, rooms: { value: 3 }, propertyType: { value: 'apartment' } })
    expect(extractRentalProperty(document('Soverom: 2\nAntall soverom: 2')).rooms).toBeNull()
  })
  it('prioriterer BRA-i og bruker ikke bodareal eller totalt areal som internt areal', () => {
    const property = extractRentalProperty(document(`${apartment}\nBRA: 70 m²\nP-ROM: 61 m²\nBRA-e: 5 m²\nBod: 5 m²\nTotalt bruksareal: 78 m²`))
    expect(property.area).toMatchObject({ value: 65.5, basis: 'BRA-i' })
    expect(extractRentalProperty(document('BRA-e: 5 m²\nBod: 5 m²\nTotalt bruksareal: 78 m²')).area).toBeNull()
  })
  it('bevarer arealbasis for senere begrensning, uten å falle tilbake fra motstridende BRA-i', () => {
    const bra = extractRentalProperty(document('BRA: 70 m²\nP-ROM: 61 m²'))
    expect(bra.area).toMatchObject({ value: 70, basis: 'BRA' }); expect(bra.issues.join(' ')).not.toContain('BRA-i mangler')
    expect(extractRentalProperty(document('P-ROM: 61 m²')).area?.basis).toBe('P-ROM')
    const conflict = extractRentalProperty(document(`${apartment}\nBRA-i: 66 m²\nBRA: 70 m²`))
    expect(conflict.area).toBeNull(); expect(conflict.issues.join(' ')).toContain('Motstridende areal')
  })
  it('blokkerer motstrid, men samler belegg for den samme verdien', () => {
    const repeated = extractRentalProperty(document(`${apartment}\nAdresse: Fasitveien 4, 0001 Testby\n3-roms leilighet`))
    expect(repeated.address?.sources).toHaveLength(2); expect(repeated.rooms?.sources).toHaveLength(2)
    const conflict = extractRentalProperty(document(`${apartment}\nAdresse: Annenveien 5\nKommune: Bergen\nAntall rom: 2\nBoligtype: Enebolig`))
    expect(conflict.address).toBeNull(); expect(conflict.municipality).toBeNull(); expect(conflict.rooms).toBeNull(); expect(conflict.propertyType).toBeNull()
  })
  it('ignorerer uleselige sider, feil kilder og meglerkontorets adresse', () => {
    const input = document(apartment)
    input.pages.push({ ...input.pages[0]!, pdfPage: 2, status: 'unreadable', text: 'BRA-i: 10 m²\nAntall rom: 1' })
    input.pages[0]!.text += '\nMeglerkontor\nAdresse: Kontorveien 9\n'
    input.propertyIdentity = [{ kind: 'address', value: 'Feilveien 9', source: { documentHash: '0'.repeat(64), documentName: input.documentName, pdfPage: 1, start: 0, end: 7, quote: 'Adresse', method: 'pdf-text', printedPage: null } }]
    const property = extractRentalProperty(input)
    expect(property.address?.value).toBe('Fasitveien 4, 0001 Testby'); expect(property.area?.value).toBe(65.5); expect(property.rooms?.value).toBe(3)
  })
  it('gjenbruker validert propertyIdentity og klassifiserer andre boligtyper eksplisitt', () => {
    const input = document('Fasitveien 4\nBoligtype: Enebolig')
    input.propertyIdentity = [{ kind: 'address', value: 'Fasitveien 4', source: { documentHash: input.reportHash, documentName: input.documentName, pdfPage: 1, start: 0, end: 12, quote: 'Fasitveien 4', method: 'pdf-text', printedPage: null } }]
    const property = extractRentalProperty(input)
    expect(property.address?.value).toBe('Fasitveien 4'); expect(property.propertyType?.value).toBe('unsupported')
    expect(property.issues.join(' ')).toContain('enkeltleiligheter')
  })
  it.each(['Antall boenheter: 2', 'Antall boenheter\n12', 'Eiendommen inneholder seks leiligheter.', 'Bygård', 'Boligtype: Utleiegård', 'Eiendommen er en flermannsbolig.'])('sperrer flerbolig selv om en leilighet omtales: %s', signal => {
    const property = extractRentalProperty(document(`${apartment}\n${signal}`))
    expect(property.propertyType?.value).toBe('apartment')
    expect(property.issues.join(' ')).toContain('Flerboligsignal på fysisk PDF-side 1')
  })
  it('enkeltleilighet i bygård er ikke i seg selv et salg av hele bygården', () => {
    expect(extractRentalProperty(document(`${apartment}\nLys leilighet i en eldre bygård.\nAntall boenheter: 1`)).issues).toEqual([])
  })
  it.each(['Sameiet består av 20 leiligheter.', 'Borettslaget består av seks leiligheter.', 'Bygningen inneholder 3 leiligheter.', 'Bygget\nAntall boenheter: 12'])('fellesskapets enhetstelling sperrer ikke enkeltleiligheten: %s', signal => {
    expect(extractRentalProperty(document(`${apartment}\n${signal}`)).issues).toEqual([])
  })
  it('bevarer flerboligsperren for salgsobjektet etter opplysninger om sameiet', () => {
    expect(extractRentalProperty(document(`${apartment}\nSameiet består av 20 leiligheter.\nSalgsobjektet består av to leiligheter.`)).issues.join(' ')).toContain('Flerboligsignal')
  })
  it.each(['Mulighet for ombygging til 3-roms.', 'Tidligere 3-roms leilighet.', 'Planlagt 3-roms leilighet.'])('bruker ikke hypotetisk eller historisk romantall: %s', text => {
    expect(extractRentalProperty(document(`Boligtype: Leilighet\n${text}`)).rooms).toBeNull()
    const property = extractRentalProperty(document(`Boligtype: Leilighet\nAntall rom: 2\n${text}`))
    expect(property.rooms?.value).toBe(2)
    expect(property.issues.join(' ')).not.toContain('Motstridende romantall')
  })
  it('tydelig nåværende x-roms leilighet gir boligtype uten ekstra etikett', () => {
    const property = extractRentalProperty(document(apartment.replace('Boligtype: Leilighet', 'Lys 3-roms leilighet')))
    expect(property.propertyType?.value).toBe('apartment')
    expect(property.issues).toEqual([])
  })
  it('en mulighet senere på linjen endrer ikke gjeldende romantall', () => {
    const property = extractRentalProperty(document('Lys 2-roms leilighet med mulighet for hjemmekontor.'))
    expect(property.rooms?.value).toBe(2)
    expect(property.propertyType?.value).toBe('apartment')
    expect(extractRentalProperty(document('2-roms leilighet med mulighet for ombygging til 3-roms.')).rooms?.value).toBe(2)
    expect(extractRentalProperty(document('Mulighet for ombygging til 3-roms.')).rooms).toBeNull()
    expect(extractRentalProperty(document('Tidligere 3-roms leilighet.')).rooms).toBeNull()
  })
  it.each(['BRA-i: 0', 'BRA-i: -2 m²', 'Antall rom: 0', 'Antall rom: 2,5'])('eksplisitt ugyldig observasjon sperrer selv med en gyldig kandidat: %s', text => {
    const property = extractRentalProperty(document(`${apartment}\n${text}`))
    expect(property.area?.value).toBe(65.5); expect(property.rooms?.value).toBe(3)
    expect(property.issues.join(' ')).toContain('Ugyldig')
    expect(property.issues.join(' ')).toContain('fysisk PDF-side 1')
    expect(property.issues.join(' ')).toContain(text)
  })
  it('ukjent eksplisitt boligtype gir sperre og bevarer støttet bevis', () => {
    const property = extractRentalProperty(document(`${apartment}\nBoligtype: Næringslokale`))
    expect(property.propertyType?.value).toBe('apartment')
    expect(property.issues.join(' ')).toContain('Uavklart boligtype på fysisk PDF-side 1: «Boligtype: Næringslokale»')
  })
  it('leser nummerert gatenavn uten propertyIdentity', () => {
    expect(extractRentalProperty(document('Adresse: 7. juni-plassen 4, 4005 Stavanger')).address?.value).toBe('7. juni-plassen 4, 4005 Stavanger')
  })
  it('leiekontrakten avviser ugyldige beløp og struktur', () => {
    expect(RentEstimateSchema.safeParse({ version: 'ssb-rent-1', monthly: '-2' }).success).toBe(false)
    expect(extractRentalProperty(document('BRA-i: 0 m²\nAntall rom: 0')).area).toBeNull()
    expect(extractRentalProperty(document('Adressen er Kontorveien 2\nKommunen er Oslo')).address).toBeNull()
    expect(extractRentalProperty(document('Adressen er Kontorveien 2\nKommunen er Oslo')).municipality).toBeNull()
  })
})

describe('Leieestimatets kontraktinvarianter', () => {
  it('godtar eksakt årsbeløp uten flyttallsavrunding', () => {
    expect(RentEstimateSchema.safeParse(estimate()).success).toBe(true)
  })
  it.each([
    { monthly: null }, { low: '0' }, { high: '-1' }, { annual: '0' },
    { low: '12000.02' }, { high: '12000' }, { annual: '144000.13' }, { monthly: 'Infinity' },
    { documentHash: '0'.repeat(64) },
  ])('avviser ufullstendig eller selvmotsigende estimat: %j', override => {
    expect(RentEstimateSchema.safeParse({ ...estimate(), ...override }).success).toBe(false)
  })
  it('utilgjengelig resultat krever tomt beregningsgrunnlag og nullbeløp', () => {
    const unavailable = { ...estimate(), status: 'unavailable', monthly: null, low: null, high: null, annual: null, observations: [], formula: null }
    expect(RentEstimateSchema.safeParse(unavailable).success).toBe(true)
    for (const override of [{ monthly: '100' }, { observations: estimate().observations }, { formula: 'x' }]) {
      expect(RentEstimateSchema.safeParse({ ...unavailable, ...override }).success).toBe(false)
    }
  })
  it('estimert krever tilstrekkelig og entydig boliggrunnlag med kommune, men ikke bydel', () => {
    const valid = estimate()
    expect(RentEstimateSchema.safeParse({ ...valid, property: { ...valid.property, district: null } }).success).toBe(true)
    for (const field of ['address', 'municipality', 'area', 'rooms', 'propertyType'] as const) {
      expect(RentEstimateSchema.safeParse({ ...valid, property: { ...valid.property, [field]: null } }).success).toBe(false)
    }
    expect(RentEstimateSchema.safeParse({ ...valid, property: { ...valid.property, issues: ['Motstrid'] } }).success).toBe(false)
    expect(RentEstimateSchema.safeParse({ ...valid, property: { ...valid.property, propertyType: { ...valid.property.propertyType!, value: 'unsupported' } } }).success).toBe(false)
  })
  it.each([
    { statisticsYear: null }, { sourceUpdated: null }, { sourceUpdated: ' ' }, { formula: null }, { observations: [] },
    { sourceUrl: null }, { sourceUrl: 'https://example.com/' }, { sourceUrl: 'https://www.ssb.no.evil.example/statbank/table/09897/' },
    { sourceUrl: 'http://www.ssb.no/statbank/table/09897/' }, { sourceUrl: 'https://data.ssb.no/unknown' },
  ])('estimert krever reproduserbar SSB-kilde og statistikkgrunnlag: %j', override => {
    expect(RentEstimateSchema.safeParse({ ...estimate(), ...override }).success).toBe(false)
  })
  it('godtar faktisk HTTPS-endepunkt for SSB-data med dimensjonsspørring', () => {
    expect(RentEstimateSchema.safeParse({ ...estimate(), sourceUrl: 'https://data.ssb.no/api/pxwebapi/v2/tables/09897/data?lang=no&valueCodes%5BTid%5D=2025' }).success).toBe(true)
  })
  it('begrenser fritekst, observasjoner og kildeantall', () => {
    expect(RentEstimateSchema.safeParse({ ...estimate(), method: 'x'.repeat(501) }).success).toBe(false)
    expect(RentEstimateSchema.safeParse({ ...estimate(), observations: Array.from({ length: 101 }, () => estimate().observations[0]) }).success).toBe(false)
    const property = extractRentalProperty(document(apartment))
    property.address!.sources = Array.from({ length: 201 }, () => property.address!.sources[0]!)
    expect(RentalPropertySchema.safeParse(property).success).toBe(false)
  })
})
