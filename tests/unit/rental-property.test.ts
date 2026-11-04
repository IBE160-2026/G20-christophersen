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
    if (signal.startsWith('Boligtype:')) {
      expect(property.propertyType).toBeNull()
      expect(property.issues.join(' ')).toContain('Motstridende boligtyper')
    } else expect(property.propertyType?.value).toBe('apartment')
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

describe('Generiske megleroppsett og skille mellom objekttotal og etasjer', () => {
  const compact = 'Fasitveien 4\n4005 STAVANGER\nSALGSOBJEKT Leilighet\nBRA‑I/ BRA TOTAL 50/ 55 kvm\nANTALL ROM 2\nGårdsnummer 12, bruksnummer 34 i Stavanger kommune.'
  it('leser alle boligopplysninger uten ekstra input og beholder originale Unicode-spenn', () => {
    const input = document(compact), property = extractRentalProperty(input)
    expect(property).toMatchObject({ address: { value: 'Fasitveien 4 4005 STAVANGER' }, municipality: { value: 'Stavanger' }, area: { value: 50, basis: 'BRA-i' }, rooms: { value: 2 }, propertyType: { value: 'apartment' }, issues: [] })
    for (const field of [property.address, property.municipality, property.area, property.rooms, property.propertyType]) {
      for (const source of field!.sources) expect(input.pages[source.pdfPage - 1]!.text.slice(source.start, source.end)).toBe(source.quote)
    }
    expect(property.area!.sources[0]!.quote).toContain('50/ 55')
  })
  it('leser Unicode og spaltet BRA-i-total uten å forveksle etasjeareal med total', () => {
    const input = document(`${compact.replace('BRA‑I/ BRA TOTAL 50/ 55 kvm', 'AREAL TOTALT\nBRA ‑ i: 50 kvm')}\nBRUKSAREAL FORDELT PÅ ETASJE\nKjeller\nBRA‑i: 20 kvm\n1. etasje\nBRA‑i: 30 kvm`)
    expect(extractRentalProperty(input).area).toMatchObject({ value: 50, basis: 'BRA-i' })
    expect(extractRentalProperty(input).issues).toEqual([])
  })
  it('summerer ikke etasjer når objekttotal mangler', () => {
    const property = extractRentalProperty(document('BRUKSAREAL FORDELT PÅ ETASJE\nKjeller\nBRA‑i: 20 kvm\n1. etasje\nBRA‑i: 30 kvm'))
    expect(property.area).toBeNull(); expect(property.issues.join(' ')).toContain('Areal mangler')
  })
  it('bruker ikke setningen etter kommune som navn og godtar ikke tomme budskjemafelter', () => {
    const input = document(`${compact}\nkommune vedrørende en tidligere søknad.\nAdresse:\nOppdragsnummer:\nAdresse:\nPostnr.: Sted:`)
    input.propertyIdentity = [{ kind: 'address', value: 'Oppdragsnummer:', source: { documentHash: input.reportHash, documentName: input.documentName, pdfPage: 1, start: input.pages[0]!.text.indexOf('Adresse:'), end: input.pages[0]!.text.indexOf('Adresse:') + 'Adresse:\nOppdragsnummer:'.length, quote: 'Adresse:\nOppdragsnummer:', method: 'pdf-text', printedPage: null } }]
    const property = extractRentalProperty(input)
    expect(property.municipality?.value).toBe('Stavanger'); expect(property.address?.value).toBe('Fasitveien 4 4005 STAVANGER'); expect(property.issues).toEqual([])
    expect(extractRentalProperty(document('kommune vedrørende en tidligere søknad.')).municipality).toBeNull()
  })
  it('bevarer reell motstrid mellom to eksplisitte kommuner og objekttotaler', () => {
    const property = extractRentalProperty(document(`${compact}\nKommune: Bergen\nBRA-i: 60 m²`))
    expect(property.municipality).toBeNull(); expect(property.area).toBeNull(); expect(property.issues.join(' ')).toContain('Motstridende')
  })
  it('gjenbruker samme adresse med/uten poststed, men ikke en annen gate', () => {
    const property = extractRentalProperty(document(`${compact}\nAdresse: Fasitveien 4`))
    expect(property.address?.sources).toHaveLength(2); expect(property.issues).toEqual([])
    expect(extractRentalProperty(document(`${compact}\nAdresse: Annenveien 5`)).address).toBeNull()
  })
  it('skiller dokumentert enebolig fra leilighet og tomteareal', () => {
    const property = extractRentalProperty(document(compact.replace('Leilighet', 'Enebolig').replace('50/ 55', '196/ 196') + '\nTOMTESTØRRELSE 80.6 kvm'))
    expect(property).toMatchObject({ propertyType: { value: 'unsupported' }, area: { value: 196 }, rooms: { value: 2 } })
    expect(property.issues.join(' ')).toContain('støtter bare enkeltleiligheter')
  })
  it('leser eksplisitt boligtype/eierform uten å utlede boligtype fra eierform alene', () => {
    expect(extractRentalProperty(document('Boligtype/eierform\nLeilighet / Eiet')).propertyType?.value).toBe('apartment')
    expect(extractRentalProperty(document('Boligtype/eierform\nBygård / Eiet')).propertyType?.value).toBe('unsupported')
    expect(extractRentalProperty(document('Eierform: Eiet')).propertyType).toBeNull()
  })
})

describe('Review: feltgrenser og etasjefortsettelser', () => {
  it('bevarer Kommune Oslo som etikett, men ikke løpende kommune vedrørende-setning', () => {
    expect(extractRentalProperty(document('Kommune Oslo')).municipality?.value).toBe('Oslo')
    expect(extractRentalProperty(document('KOMMUNE BERGEN')).municipality?.value).toBe('BERGEN')
    expect(extractRentalProperty(document('kommune vedrørende tidligere søknad')).municipality).toBeNull()
  })
  it('bruker ikke neste etikett eller meglerkontorets kommune som objektkommune', () => {
    expect(extractRentalProperty(document('Kommune:\nBoligtype\nLeilighet')).municipality).toBeNull()
    expect(extractRentalProperty(document('Kommune: Oslo\nMeglerkontor\nKommune: Bergen')).municipality?.value).toBe('Oslo')
  })
  it('bærer etasjekontekst over sideskift og gjenopptar bare ved eksplisitt total', () => {
    const input = document('BRUKSAREAL FORDELT PÅ ETASJE\nBRA-i: 20 m²')
    input.pages.push({ ...input.pages[0]!, pdfPage: 2, text: '1. etasje\nBRA-i: 30 m²' })
    expect(extractRentalProperty(input).area).toBeNull()
    input.pages[1]!.text += '\nAREAL TOTALT\nBRA-i: 50 m²'
    expect(extractRentalProperty(input).area?.value).toBe(50)
  })
  it('kompakt total og totaloverskrift etter etasjer avslutter etasjefilteret', () => {
    for (const total of ['AREAL TOTALT\nBRA-i: 50 m²', 'BRA-I/ BRA TOTAL 50/ 55 kvm']) {
      const property = extractRentalProperty(document(`BRUKSAREAL FORDELT PÅ ETASJE\nBRA-i: 20 m²\n${total}`))
      expect(property.area?.value).toBe(50)
      expect(property.issues.join(' ')).not.toMatch(/Areal mangler|Motstridende areal/)
    }
  })
  it.each(['Boligtype: Leilighet / Næring', 'Boligtype: Leilighet / Enebolig', 'Boligtype/eierform\nLeilighet / Næring'])('velger ikke første boligtype skjult: %s', text => {
    const property = extractRentalProperty(document(text))
    expect(property.propertyType).toBeNull(); expect(property.issues.join(' ')).toContain('Uavklart boligtype')
  })
  it.each(['50/ 20', '50/ 0', '50/ -2'])('kontrollerer intern/total-relasjonen %s før arealet kan brukes', values => {
    const property = extractRentalProperty(document(`BRA-I/ BRA TOTAL ${values} kvm`))
    expect(property.area).toBeNull(); expect(property.issues.join(' ')).toMatch(/Motstridende areal|Ugyldig areal/)
  })
})
