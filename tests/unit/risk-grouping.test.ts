import { describe, expect, it } from 'vitest'
import { groupPropertyRisks, isRiskBackground } from '../../src/frontend/investment/risk-grouping.ts'
import type { PropertyRiskItem } from '../../src/frontend/investment/property-risk.ts'

const make = (id: string, description: string, page = 1, extra: Partial<PropertyRiskItem> = {}): PropertyRiskItem => ({
  id, description, title: 'Utleieenhet er ikke godkjent', domain: 'legal', category: 'rental-approval', status: 'documented', grade: null,
  consequence: 'Bruken må avklares.', action: 'Kontroller originalen.',
  sources: [{ documentHash: 'doc-a', documentName: 'syntetisk.pdf', pdfPage: page, start: 0, end: description.length, quote: description }], ...extra,
})
const basement = () => make('basement', 'Kjelleretasjen er innredet med en utleieenhet som ikke er godkjent.', 4)
const singular = () => make('singular', 'Utleid leilighet er ikke godkjent som egen bruksenhet.', 9)

describe('Konservativ visningsgruppering', () => {
  it('samler ett konkret kjellerforhold og singular utleiereferanse med alle originalene uten mutasjon', () => {
    const input = [basement(), singular()], before = structuredClone(input)
    const grouped = groupPropertyRisks(input)
    expect(grouped).toHaveLength(1)
    expect(grouped[0]?.sources.map(source => source.pdfPage)).toEqual([4, 9])
    expect(grouped[0]?.members).toEqual(input)
    expect(input).toEqual(before)
    expect(groupPropertyRisks([...input].reverse())).toEqual(grouped)
  })
  it.each([
    ['loft', 'Loftet har en utleieenhet som ikke er godkjent.'],
    ['plural', 'Flere utleieenheter er ikke godkjent.'],
    ['two-in-basement', 'Kjelleren har to utleieenheter som ikke er godkjent.'],
    ['plural-in-basement', 'Kjelleren har utleieenheter som ikke er godkjent.'],
  ])('lar singular stå adskilt ved konkurrerende enheter: %s', (_, text) => {
    const result = groupPropertyRisks([basement(), make('other', text, 5), singular()])
    expect(result).toHaveLength(3)
    expect(result.find(item => item.id === 'singular')?.members).toBeUndefined()
  })
  it('skiller to eksplisitte bokstavenheter og en uklar singular referanse', () => {
    const items = ['A', 'B'].map(letter => make(letter, `Leilighet ${letter} er ikke godkjent som bruksenhet.`))
    expect(groupPropertyRisks([...items, singular()])).toHaveLength(3)
    expect(groupPropertyRisks([make('a', 'Leilighet A i kjeller er ikke godkjent.'), make('b', 'Leilighet B i kjeller er ikke godkjent.'), singular()])).toHaveLength(3)
    expect(groupPropertyRisks([basement(), make('a', 'Leilighet A i kjeller er ikke godkjent.'), make('b', 'Leilighet B i kjeller er ikke godkjent.'), singular()])).toHaveLength(4)
  })
  it('bruker kontrollert kildekontekst før sitatet og beholder kjeller, loft og takterrasse separat', () => {
    const quote = 'Det mangler dokumentasjon på godkjenning av bruksendringen.'
    const pages = ['Kjelleretasje: Kjøkken og bad.\n', 'Loftsetasje: Oppholdsrom.\n', 'Takterrasse: Utvidet uteplass.\n'].map((prefix, index) => ({ pdfPage: index + 1, text: prefix + quote }))
    const items = pages.map((page, index) => make(String(index), quote, page.pdfPage, { category: 'use-approval', status: 'possible', sources: [{ documentHash: 'doc-a', documentName: 'syntetisk.pdf', pdfPage: page.pdfPage, start: page.text.indexOf(quote), end: page.text.length, quote }] }))
    const documents = [{ reportHash: 'doc-a', documentName: 'syntetisk.pdf', pages }] as Parameters<typeof groupPropertyRisks>[1]
    expect(groupPropertyRisks(items, documents)).toHaveLength(3)
  })
  it('grupperer ikke ukjent subjekt, tittel eller tekstlikhet alene', () => {
    expect(groupPropertyRisks([singular(), { ...singular(), id: 'other', sources: [{ ...singular().sources[0]!, pdfPage: 10 }] }])).toHaveLength(2)
    expect(groupPropertyRisks([basement(), make('other', 'Kjelleretasjen har påvist ulovlig bruk.', 6, { category: 'use-approval' })])).toHaveLength(2)
  })
  it.each([
    { status: 'possible' as const }, { grade: 'TG2' as const }, { sourceQuality: 'partial-text' as const },
    { sourceQuality: 'readable-text' as const }, { controlNote: 'Brukerrettet funn.' },
  ])('krysser ikke status, grad, kildekvalitet eller brukerretting: %o', boundary => {
    expect(groupPropertyRisks([basement(), { ...singular(), ...boundary }])).toHaveLength(2)
  })
  it('bevarer tekniske funn fra ulike kontroller og to like bad eller ulike takavvik', () => {
    const technical = (id: string, description: string, page: number) => make(id, description, page, { domain: 'technical', category: 'technical', grade: 'TG3' })
    expect(groupPropertyRisks([technical('controlled-a', 'Badet har lekkasje.', 2), technical('controlled-b', 'Badet har lekkasje.', 2)])).toHaveLength(2)
    expect(groupPropertyRisks([technical('a', 'Badet har lekkasje.', 2), technical('b', 'Badet har lekkasje.', 3)])).toHaveLength(2)
    expect(groupPropertyRisks([technical('a', 'Taket har råte.', 2), technical('b', 'Taket har lekkasje.', 2)])).toHaveLength(2)
  })
  it('avstemmer eksakt kildeoverlapp, men aldri ukjent eller motstridende sammenheng', () => {
    const first = singular()
    expect(groupPropertyRisks([first, { ...first, id: 'copy' }])).toHaveLength(1)
    expect(groupPropertyRisks([first, { ...first, id: 'copy', sources: [{ ...first.sources[0]!, documentName: 'annen.pdf' }] }])).toHaveLength(2)
    expect(groupPropertyRisks([basement(), { ...singular(), sources: [{ ...singular().sources[0]!, documentHash: 'doc-b' }] }])).toHaveLength(2)
  })
  it('bevarer kildeunion over kontraktens opprinnelige grense på tolv', () => {
    const items = Array.from({ length: 20 }, (_, index) => make(String(index), 'Kjellerens utleieenhet er ikke godkjent.', index + 1))
    const result = groupPropertyRisks(items)
    expect(result).toHaveLength(1)
    expect(result[0]?.sources).toHaveLength(20)
    expect(result[0]?.members).toHaveLength(20)
  })
  it('flytter bare generell lovforklaring til bakgrunn og bevarer konkrete avvik med lovhenvisning', () => {
    expect(isRiskBackground(make('background', 'Etter husleieloven krever fremleie som hovedregel samtykke.', 1, { category: 'rental-restriction' }))).toBe(true)
    expect(isRiskBackground(make('explanation', 'Regelen innebærer ikke at bygg/ ulovlige tiltak blir lovlige.', 1, { category: 'use-approval' }))).toBe(true)
    expect(isRiskBackground(make('actual', 'Etter bygningsloven er utleieenheten i kjeller ikke godkjent.'))).toBe(false)
    expect(isRiskBackground(make('missing', 'Det foreligger hverken ferdigattest eller midlertidig brukstillatelse.', 1, { category: 'use-approval' }))).toBe(false)
  })
})

describe('Reviewregresjoner for subjekt, kontekst og lovtekst', () => {
  const context = (prefixes: string[], quote: string, extra: Partial<PropertyRiskItem> = {}) => {
    const pages = prefixes.map((prefix, index) => ({ pdfPage: index + 1, text: prefix + quote }))
    const items = pages.map(page => make(`context-${page.pdfPage}`, quote, page.pdfPage, { ...extra, sources: [{ documentHash: 'doc-a', documentName: 'syntetisk.pdf', pdfPage: page.pdfPage, start: page.text.indexOf(quote), end: page.text.length, quote }] }))
    return { items, documents: [{ reportHash: 'doc-a', documentName: 'syntetisk.pdf', pages }] }
  }
  it.each([
    ['Utleieenheten øst i kjelleren er ikke godkjent.', 'Utleieenheten vest i kjelleren er ikke godkjent.'],
    ['Leilighet a i kjeller er ikke godkjent.', 'Leilighet b i kjeller er ikke godkjent.'],
    ['Kjeller øst har en utleieenhet som ikke er godkjent.', 'Kjeller vest har en utleieenhet som ikke er godkjent.'],
  ])('bevarer konkrete enhets-ID-er og retninger: %s', (a, b) => {
    expect(groupPropertyRisks([make('a', a), make('b', b, 2)])).toHaveLength(2)
    expect(groupPropertyRisks([make('a', a), make('repeat', a, 2)])).toHaveLength(1)
  })
  it('bevarer øst og sammensatte himmelretninger med Unicode-grenser', () => {
    const items = [make('a', 'Utleieenheten øst i kjelleren er ikke godkjent.'), make('b', 'Utleieenheten nordøst i kjelleren er ikke godkjent.', 2), basement()]
    const result = groupPropertyRisks(items)
    expect(result).toHaveLength(3)
    expect(result[0]?.displaySubject).toBe('Kjeller · øst')
    expect(result[1]?.displaySubject).toBe('Kjeller · nordøst')
    expect(result[2]?.displaySubject).toBe('Kjeller')
  })
  it('grupperer samme kildeverifiserte kontekst fra faktiske lokale regelspråk, men ikke uten kontekst eller med feil offset', () => {
    const quote = 'Bruksendring er ikke dokumentert.'
    const { items, documents } = context(['Loftsetasje: Oppholdsrom.\n', 'Loftsetasje: Oppholdsrom.\n'], quote, { category: 'use-approval', status: 'possible' })
    expect(groupPropertyRisks(items, documents)).toHaveLength(1)
    expect(groupPropertyRisks(items, documents)[0]?.displaySubject).toBe('Loft')
    expect(groupPropertyRisks(items)).toHaveLength(2)
    const invalid = structuredClone(items)
    invalid[1]!.sources[0]!.start! += 1
    expect(groupPropertyRisks(invalid, documents)).toHaveLength(2)
    const other = context(['Loftsetasje: Oppholdsrom.\n', 'Kjelleretasje: Oppholdsrom.\n'], quote, { category: 'use-approval', status: 'possible' })
    expect(groupPropertyRisks(other.items, other.documents)).toHaveLength(2)
  })
  it('stanser ved nyere bygningsdel og ukjent overskrift i stedet for å arve kjeller', () => {
    const quote = 'Tiltaket er ulovlig.'
    const { items, documents } = context(['Kjeller: Oppholdsrom.\nGarasje: ', 'Kjeller: Oppholdsrom.\nTilbygg: ', 'Kjeller: Oppholdsrom.\nUkjent avdeling: '], quote, { category: 'use-approval' })
    const result = groupPropertyRisks(items, documents)
    expect(result).toHaveLength(3)
    expect(result.map(item => item.displaySubject)).toEqual(['Garasje', 'Tilbygg', undefined])
  })
  it.each(['Anneks: ', 'Kjeller og loft: ', 'Annen avdeling: '])('gir aldri singular kjelleralias til ukjent eller annet kontekstsubjekt: %s', prefix => {
    const { items, documents } = context([prefix], singular().description)
    expect(groupPropertyRisks([basement(), ...items], documents)).toHaveLength(2)
  })
  it('tillater bare uqualifisert singularreferanse og begge dokumenterte ordstillinger', () => {
    expect(groupPropertyRisks([basement(), make('other-building', 'Utleid leilighet i gjestehuset er ikke godkjent.', 9)])).toHaveLength(2)
    expect(groupPropertyRisks([basement(), make('unqualified', 'Utleid leilighet ikke er godkjent som egen bruksenhet.', 9)])).toHaveLength(1)
    expect(groupPropertyRisks([basement(), singular()])).toHaveLength(1)
  })
  it.each([
    'Det mangler både ferdigattest og midlertidig brukstillatelse.',
    'Det mangler dokumentasjon på godkjenning av bruksendringen.',
    'Det foreligger ikke dokumentasjon på at bruksendringen er godkjent.',
  ])('grupperer bare samme konkrete subjekt og samme tillatelsesproblem: %s', quote => {
    const data = context(['Kjelleretasje: Oppholdsrom.\n', 'Kjelleretasje: Oppholdsrom.\n', 'Loftsetasje: Oppholdsrom.\n'], quote, { category: 'use-approval', status: 'possible' })
    const grouped = groupPropertyRisks(data.items, data.documents)
    expect(grouped).toHaveLength(2)
    expect(grouped[0]?.sources).toHaveLength(2)
    expect(grouped[0]?.displaySubject).toBe('Kjeller')
    expect(grouped[1]?.displaySubject).toBe('Loft')
    expect(data.items.every(item => item.displaySubject === undefined)).toBe(true)
  })
  it.each([
    'Etter husleieloven er utleie av leiligheten ikke tillatt uten samtykke.',
    'Etter husleieloven er utleie av rommet ikke tillatt uten samtykke.',
    'Etter husleieloven er utleie av seksjonen ikke tillatt uten samtykke.',
    'Etter husleieloven krever fremleie av leilighet A som hovedregel samtykke.',
    'Etter husleieloven krever fremleie av leilighet a som hovedregel samtykke.',
  ])('beholder konkrete enheter som risiko: %s', text => {
    expect(isRiskBackground(make('specific', text, 1, { category: 'rental-restriction' }))).toBe(false)
  })
  it('krever positiv standardtekst og lar boligen være et generelt begrep i en uttrykkelig hovedregel', () => {
    expect(isRiskBackground(make('generic', 'Etter husleieloven krever fremleie av boligen som hovedregel samtykke.', 1, { category: 'rental-restriction' }))).toBe(true)
    expect(isRiskBackground(make('ambiguous', 'Etter husleieloven krever fremleie samtykke.', 1, { category: 'rental-restriction' }))).toBe(false)
  })
  it('bevarer enhets-ID uavhengig av etterfølgende preposisjon eller adverb', () => {
    const units = ['a', 'b'].map(id => make(id, `Leilighet ${id} på loftet er ikke godkjent.`))
    expect(groupPropertyRisks(units)).toHaveLength(2)
    expect(isRiskBackground(make('specific-adverb', 'Etter husleieloven krever leilighet A normalt samtykke som hovedregel.', 1, { category: 'rental-restriction' }))).toBe(false)
    expect(groupPropertyRisks([make('preposition', 'Leilighet i kjelleren er ikke godkjent.')])[0]?.displaySubject).toBe('Kjeller')
  })
  it('tilordner ikke en felleshenvisning til bare den siste etasjen', () => {
    const quote = 'Avvikene nevnt over anses som lovlighetsmangler.'
    const prefix = 'Kjelleretasje: Endret bruk.\nLoftsetasje: Endret bruk.\n'
    const finding = make('collective', quote, 1, { category: 'use-approval', sources: [{ documentHash: 'doc-a', documentName: 'syntetisk.pdf', pdfPage: 1, start: prefix.length, end: prefix.length + quote.length, quote }] })
    const grouped = groupPropertyRisks([finding], [{ reportHash: 'doc-a', documentName: 'syntetisk.pdf', pages: [{ pdfPage: 1, text: prefix + quote }] }])
    expect(grouped[0]?.displaySubject).toBeUndefined()
    expect(grouped[0]?.sources).toEqual(finding.sources)
  })
})
