import { describe, expect, it } from 'vitest'
import { analyzeLegalRisks } from '../../src/backend/import/legal-risk.ts'
import { codeFirstBasis } from '../helpers/code-first.ts'

describe('lokalt juridisk risikosøk', () => {
  it('bevarer fysisk side og ordrett kilde for utleieenhet uten å utlede utleieforbud', () => {
    const texts = Array.from({ length: 58 }, () => '')
    texts[57] = 'Utleiedelen i underetasjen er ikke\ngodkjent som egen boenhet. Kjøper må undersøke videre bruk.'
    const basis = codeFirstBasis(texts), result = analyzeLegalRisks(basis)
    const finding = result.findings.find(item => item.category === 'rental-approval')!
    expect(finding).toMatchObject({ status: 'documented', grade: null, domain: 'legal' })
    expect(finding.sources[0]).toMatchObject({ documentHash: basis.hash, documentName: basis.name, pdfPage: 58 })
    const source = finding.sources[0]!
    expect(texts[57]!.slice(source.start, source.end)).toBe(source.quote)
    expect(finding.consequence).toContain('ikke et generelt utleieforbud')
    expect(result.coverage).toBe('partial')
  })
  it('skiller manglende godkjenningsdokumentasjon fra eksplisitt lovlighetsavvik', () => {
    const result = analyzeLegalRisks(codeFirstBasis(['Det foreligger ikke dokumentasjon på at bruksendringen er godkjent. Avvikene anses som lovlighetsmangler.']))
    expect(result.findings.map(item => item.status)).toEqual(['possible', 'documented'])
    expect(result.findings.every(item => item.category === 'use-approval')).toBe(true)
  })
  it('fanger servitutter og konkrete utleiebegrensninger, uten å kalle bruksrett et dokumentert problem', () => {
    const result = analyzeLegalRisks(codeFirstBasis(['Tinglyst adkomstrett gjelder naboens vei. Korttidsutleie er begrenset til 60 døgn per år.']))
    expect(result.findings.map(item => [item.category, item.status])).toEqual([['easement', 'possible'], ['rental-restriction', 'documented']])
  })
  it.each([
    'Det er ikke kjent at det foreligger regler som er til hinder for at hele eiendommen leies ut.',
    'Dette betyr imidlertid ikke at ulovlig oppførte bygg blir lovlige.',
    'Det utstedes ikke ferdigattest for eldre tiltak.',
    'Det er ingen kjente servitutter på eiendommen.',
    'Utleieenheten er godkjent av kommunen.',
    'Ingen begrensninger i utleie er registrert.',
    'Oppgjørshonorar og utskrift av heftelser/servitutter kr 250 per stk.',
  ])('unngår falskt problem fra generell eller benektende tekst: %s', text => {
    expect(analyzeLegalRisks(codeFirstBasis([text])).findings).toHaveLength(0)
  })
  it('beholder betingede opplysninger som mulige problemer', () => {
    const result = analyzeLegalRisks(codeFirstBasis(['Dersom utleieenheten ikke er godkjent, må dette avklares.']))
    expect(result.findings[0]?.status).toBe('possible')
  })
  it('fanger konkrete bruksforbud og krav til utleietillatelse', () => {
    const result = analyzeLegalRisks(codeFirstBasis(['Det er tinglyst byggeforbud på tomten. Boligen kan ikke leies ut. Fremleie krever styrets godkjenning.']))
    expect(result.findings.map(item => [item.category, item.status])).toEqual([
      ['easement', 'documented'], ['rental-restriction', 'documented'], ['rental-restriction', 'documented'],
    ])
  })
  it('viser utilgjengelig dekning og hopper over tekst fra uleselig side', () => {
    const basis = codeFirstBasis(['Utleieenheten er ikke godkjent.'])
    basis.pages[0]!.status = 'incomplete'
    expect(analyzeLegalRisks(basis)).toMatchObject({ coverage: 'unavailable', examinedPages: [], unreadPages: [1], findings: [] })
  })
  it('leser tilgjengelig tekst konservativt når raster og vedlegg gjenstår', () => {
    const basis = codeFirstBasis(['Utleieenheten er ikke godkjent.'])
    basis.pages[0]!.rasterUnprocessed = true
    basis.attachments = [{ id: 'avtale', name: 'Avtale.pdf', isPdf: true }]
    const result = analyzeLegalRisks(basis)
    expect(result).toMatchObject({ coverage: 'partial', examinedPages: [1], unreadPages: [1] })
    expect(result.limitations.join(' ')).toContain('Innebygde vedlegg')
  })
  it('rapporterer overskridelse fremfor å kalle en avkortet funnliste komplett', () => {
    const basis = codeFirstBasis([Array.from({ length: 201 }, (_, index) => `Utleieenhet ${index} er ikke godkjent.`).join(' ')])
    const result = analyzeLegalRisks(basis)
    expect(result.findings).toHaveLength(200)
    expect(result.coverage).toBe('partial')
    expect(result.limitations.join(' ')).toContain('funngrensen')
  })
  it.each([
    'Det er ikke påvist ulovlig bruk av boenheten.',
    'Det er ikke slik at utleie er forbudt.',
    'Utleieenheten var ikke godkjent, men er nå godkjent av kommunen.',
  ])('skiller benektede og eksplisitt løste historiske forhold: %s', text => {
    expect(analyzeLegalRisks(codeFirstBasis([text])).findings).toEqual([])
  })
  it('binder negasjon og usikkerhet til riktig påstand', () => {
    const result = analyzeLegalRisks(codeFirstBasis(['Utleie er mulig, men boenheten er ikke godkjent. Ingen servitutter er registrert, men det er tinglyst veirett til naboen.']))
    expect(result.findings.map(item => [item.category, item.status])).toEqual([['rental-approval', 'documented'], ['easement', 'possible']])
    expect(analyzeLegalRisks(codeFirstBasis(['Dersom samtykke mangler, er utleie forbudt.'])).findings[0]?.status).toBe('possible')
  })
  it.each(['Ferdigattest mangler for bruksendringen.', 'Midlertidig brukstillatelse foreligger ikke.'])('bevarer kontrollbehov med motsatt ordstilling: %s', text => {
    expect(analyzeLegalRisks(codeFirstBasis([text])).findings[0]).toMatchObject({ category: 'use-approval', status: 'possible' })
  })
})
