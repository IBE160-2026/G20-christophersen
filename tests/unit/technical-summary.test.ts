import { describe, expect, it } from 'vitest'
import { codeFirstBasis } from '../helpers/code-first.ts'
import { analyzeTechnicalRisks, deviationStatus, extractExplicitTechnicalFindings } from '../../src/backend/import/technical-risk.ts'
import { extractTechnicalSummary } from '../../src/backend/import/technical-summary.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { RiskAnalysisSchema } from '../../src/contracts/property-risk.ts'

const row = (component: string, body = 'Det er påvist skader.') => `${component}\n${body}\nKonsekvens/ tiltak: Kontroller forholdet.\n`
const heading = 'Forhold som har fått TG2:\n'

describe('kildebelagte TG-sammendrag', () => {
  it('binder eksplisitt TG2/TG3 til navngitte rader og beholder overskrift og fysisk radkilde', async () => {
    const basis = codeFirstBasis(['Salgsoppgave\n', heading + row('Takvindu'), 'Forhold som har fått TG3:\n' + row('Tak', 'Det er påvist lekkasje.') + 'Forhold som har fått TG IU (ikke undersøkt):\n' + row('Ventilasjon')])
    const risk = analyzeTechnicalRisks(basis), summaries = risk.findings.filter(item => item.evidenceKind === 'summary')
    expect(summaries.map(item => [item.component, item.grade, item.sources[0]!.pdfPage])).toEqual([['Takvindu', 'TG2', 2], ['Tak', 'TG3', 3]])
    for (const finding of summaries) {
      expect(finding.sources.some(source => source.quote.includes(`Forhold som har fått ${finding.grade}:`))).toBe(true)
      for (const source of finding.sources) expect(basis.pages[source.pdfPage - 1]!.text.slice(source.start, source.end)).toBe(source.quote)
      expect(finding.action).toContain('kan avvike')
    }
    expect(risk.coverage).toBe('partial')
    expect(RiskAnalysisSchema.safeParse(risk).success).toBe(true)
    const imported = await createCodeFirstImport(basis)
    expect(imported.technical.findings).toEqual([])
    expect(imported.coverage.technical.status).not.toBe('complete')
  })
  it('bevarer flere linjer og komponent/avvik over sidegrense uten å bruke trykt sidenummer', () => {
    const basis = codeFirstBasis([heading + 'Grunnmur og fundamenter\nFIKTIV EIENDOM\n1', 'Det er registrert riss i\npuss og åpning ved muren.\nKonsekvens/ tiltak: Kontroller muren.\nFIKTIV EIENDOM\n2'])
    const [finding] = extractTechnicalSummary(basis)
    expect(finding!.description).toBe('Det er registrert riss i\npuss og åpning ved muren.')
    expect(finding!.sources.map(source => source.pdfPage)).toEqual([1, 2, 1])
    expect(finding!.sources.every(source => basis.pages[source.pdfPage - 1]!.text.slice(source.start, source.end) === source.quote)).toBe(true)
  })
  it.each(['unknown', 'incomplete', 'unreadable'] as const)('lar ikke en %s side videreføre en sammendragsgrad', status => {
    const basis = codeFirstBasis([heading + row('Tak'), 'Avbrutt tekst', row('Ventilasjon')])
    basis.pages[1]!.status = status
    expect(extractTechnicalSummary(basis).map(item => item.component)).toEqual(['Tak'])
  })
  it.each(['Andre opplysninger', 'Om eiendommen', 'Annen dokumentasjon', 'SAMMENDRAG SELGERS EGENERKLÆRING'])('stopper gradkontekst ved ny hoveddel: %s', section => {
    const basis = codeFirstBasis([heading + row('Tak') + section + '\n' + row('Ventilasjon')])
    expect(extractTechnicalSummary(basis).map(item => item.component)).toEqual(['Tak'])
  })
  it('graderer aldri fra legend, oppsummeringstall, tom TG3-liste eller ukjent komponent', () => {
    const basis = codeFirstBasis(['TG2: Vesentlige avvik\n' + row('Tak') + 'Forhold som har fått TG3:\nIngen forhold er vurdert til TG3.\nForhold som har fått TG IU (ikke undersøkt):\n' + row('Bad')])
    expect(extractTechnicalSummary(basis)).toEqual([])
    expect(extractTechnicalSummary(codeFirstBasis([heading + row('Ukjent konstruksjon')]))).toEqual([])
    expect(analyzeTechnicalRisks(codeFirstBasis([heading + row('Tak', 'Det er ikke påvist lekkasje.')])).findings).toEqual([])
  })
  it('samler ikke ulike bad, retninger eller avvik uten hele navngitte rader', () => {
    const basis = codeFirstBasis([heading + row('Bad øst') + row('Bad vest') + row('Loft - Bad - Overflater gulv') + 'Tak\nDet er påvist skade uten sikker avslutning.\n'])
    const findings = extractTechnicalSummary(basis)
    expect(findings.map(item => item.component)).toEqual(['Bad øst', 'Bad vest', 'Loft - Bad - Overflater gulv'])
    expect(new Set(findings.map(item => item.id)).size).toBe(3)
  })
})

describe('avgrenset teknisk avviksprosa', () => {
  it('bevarer flere punkter med eksplisitt grad og sikker avsnittsslutt', () => {
    const basis = codeFirstBasis(['Bygningsdel: Bad øst\nTilstandsgrad: TG3\nVurdering av avvik:\n• Det er påvist lekkasje i\nmembranen.\n• Sluket er skadet.\nKonsekvens/tiltak\nRehabiliter.\n'])
    const [finding] = extractExplicitTechnicalFindings(basis)
    expect(finding).toMatchObject({ component: 'Bad øst', grade: 'TG3', description: '• Det er påvist lekkasje i\nmembranen.\n• Sluket er skadet.' })
    expect(finding!.sources[0]!.quote).not.toContain('Rehabiliter')
    expect(analyzeTechnicalRisks(basis).findings).toHaveLength(1)
  })
  it('forveksler ikke linjeinnpakning med et nytt dokumentert problem', () => {
    expect(deviationStatus('Det kan være fukt i\nkonstruksjonen.')).toBe('possible')
    expect(deviationStatus('Det er ikke påvist\nlekkasje.')).toBeNull()
    expect(deviationStatus('Hulltaking er ikke foretatt da det ikke er fysisk mulig pga tilliggende\nkonstruksjoner.')).toBe('not-investigated')
    expect(deviationStatus('Det er ikke registrert skader.\nDet er påvist lekkasje.')).toBe('documented')
  })
  it('stopper før neste komponent og har ordrett belegg for komponent og rom', () => {
    const basis = codeFirstBasis(['Overflater gulv\nGulvet er flislagt.\nLOFT > BAD - 4M2\nBeskrivelse\nVurdering av avvik:\n• Det er påvist skader.\nInnvendige dører\nDørene er malte.\nBeskrivelse\nVurdering av avvik:\n• Det er påvist skjevheter.\nKonsekvens/tiltak\nJuster dører.\n'])
    const risk = analyzeTechnicalRisks(basis)
    expect(risk.findings).toHaveLength(2)
    expect(risk.findings[0]).toMatchObject({ component: 'LOFT > BAD - 4M2 · Overflater gulv', description: '• Det er påvist skader.' })
    expect(risk.findings[0]!.sources.map(source => source.quote)).toEqual(expect.arrayContaining(['Overflater gulv', 'LOFT > BAD - 4M2']))
    expect(risk.findings[1]).toMatchObject({ component: 'Innvendige dører', description: '• Det er påvist skjevheter.' })
  })
  it('arver ikke en eldre komponent gjennom et tidligere avvik', () => {
    const basis = codeFirstBasis(['Tak\nBeskrivelse\nVurdering av avvik:\n• Lekkasje.\nKonsekvens/tiltak\nKontroller.\nUkjent del\nBeskrivelse\nVurdering av avvik:\n• Skader.\n'])
    expect(analyzeTechnicalRisks(basis).findings[1]!.component).toBeUndefined()
  })
})

describe('review: sikre grenser og prioritet', () => {
  it.each(['Andre opplysninger:', '2. Andre opplysninger:', '3) Om eiendommen.', '4.1 Annen dokumentasjon;'])('stopper også punktuert hoveddel %s', section => {
    const findings = extractTechnicalSummary(codeFirstBasis([heading + row('Tak') + section + '\n' + row('Ventilasjon')]))
    expect(findings.map(item => item.component)).toEqual(['Tak'])
  })
  it('bevarer en ren navneliste som sammendrag uten å finne på avviksprosa', async () => {
    const basis = codeFirstBasis([heading + 'Tak\nVinduer\n'])
    const risk = analyzeTechnicalRisks(basis)
    expect(risk.findings.map(item => [item.component, item.grade, item.description])).toEqual([['Tak', 'TG2', 'Tak'], ['Vinduer', 'TG2', 'Vinduer']])
    expect(risk.findings.every(item => item.consequence.includes('bare komponentnavn'))).toBe(true)
    const outcome = await createCodeFirstImport(basis)
    expect(outcome.technical.findings).toEqual([])
    expect(outcome.coverage.technical.status).not.toBe('complete')
  })
  it.each([false, true])('bevarer begge punkter uten første-bullet-trunkering, avviksmarkør=%s', async marker => {
    const body = '• Det er påvist lekkasje.\n• Rekkverket er skadet.'
    const basis = codeFirstBasis(['TILSTANDSRAPPORT - START\nAdresse: Testveien 8\nTilstandsgrad: TG3\nBygningsdel: Tak\n' + (marker ? 'Vurdering av avvik:\n' : '') + body + '\nKonsekvens/tiltak\nUndersøk.\nTILSTANDSRAPPORT - SLUTT\n'])
    const outcome = await createCodeFirstImport(basis)
    expect(outcome.technical.findings).toHaveLength(1)
    expect(outcome.technical.findings[0]!.description).toBe(body)
    expect(outcome.technical.findings[0]!.sources[0]!.quote).toContain(body)
  })
  it.each([false, true])('overfører ikke gammel grad til neste umarkerte komponent, avviksmarkør=%s', async marker => {
    const basis = codeFirstBasis(['TILSTANDSRAPPORT - START\nAdresse: Testveien 8\nTilstandsgrad: TG3\nBygningsdel: Tak\n' + (marker ? 'Vurdering av avvik:\n' : '') + 'Lekkasje i tak.\nVentilasjon\nBeskrivelse\nVurdering av avvik:\nManglende luftutskifting.\nKonsekvens/tiltak\nUndersøk.\nTILSTANDSRAPPORT - SLUTT\n'])
    const outcome = await createCodeFirstImport(basis)
    expect(outcome.technical.findings).toHaveLength(1)
    expect(outcome.technical.findings[0]).toMatchObject({ component: 'Tak', grade: 'TG3', description: 'Lekkasje i tak.' })
    const ventilation = outcome.propertyRisk!.technical.findings.find(item => item.component === 'Ventilasjon')
    expect(ventilation).toMatchObject({ grade: null, description: 'Manglende luftutskifting.' })
    expect(ventilation!.sources.every(source => !source.quote.includes('Tilstandsgrad: TG3'))).toBe(true)
  })
  it.each([false, true])('avviser kort flerlinjet avvik uten sluttmarkør, avviksmarkør=%s', async marker => {
    const basis = codeFirstBasis(['Tilstandsgrad: TG3\nBygningsdel: Tak\n' + (marker ? 'Vurdering av avvik:\n' : '') + '• Lekkasje i tak.\n• Flere skader må undersøkes.\n'])
    expect(extractExplicitTechnicalFindings(basis)).toEqual([])
    const outcome = await createCodeFirstImport(basis)
    expect(outcome.technical.findings).toEqual([])
    expect(outcome.manifest!.candidates.every(candidate => candidate.disposition === 'unresolved')).toBe(true)
    expect(outcome.coverage.technical.status).not.toBe('complete')
  })
  it('beholder innpakket problemprosa som starter med et komponentord', () => {
    const basis = codeFirstBasis(['Vurdering av avvik:\nSluk mangler\ni dusjsonen.\nKonsekvens/tiltak\nMonter sluk.\n'])
    expect(analyzeTechnicalRisks(basis).findings[0]!.description).toBe('Sluk mangler\ni dusjsonen.')
  })
  it('binder rom før komponent innen samme avviksblokk med eksakte kilder', () => {
    const basis = codeFirstBasis(['LOFT > BAD - 4M2\nOverflater gulv\nBeskrivelse\nVurdering av avvik:\n• Skader.\nKonsekvens/tiltak\nUndersøk.\n'])
    const finding = analyzeTechnicalRisks(basis).findings[0]!
    expect(finding.component).toBe('LOFT > BAD - 4M2 · Overflater gulv')
    expect(finding.sources.map(source => source.quote)).toEqual(expect.arrayContaining(['LOFT > BAD - 4M2', 'Overflater gulv']))
    expect(finding.sources.every(source => basis.pages[source.pdfPage - 1]!.text.slice(source.start, source.end) === source.quote)).toBe(true)
  })
  it('prioriterer primære detaljfunn selv når 200 sammendragsrader kommer først', () => {
    const basis = codeFirstBasis([heading + Array.from({ length: 200 }, (_, i) => row(`Bad ${i + 1}`)).join(''), 'Tak — TG3\nVurdering av avvik:\nDet er påvist lekkasje.\nKonsekvens/tiltak\nUndersøk taket.\n'])
    const risk = analyzeTechnicalRisks(basis)
    expect(risk.findings).toHaveLength(200)
    expect(risk.findings[0]).toMatchObject({ evidenceKind: 'detail', grade: 'TG3', component: 'Tak' })
    expect(risk.findings.filter(item => item.evidenceKind === 'summary')).toHaveLength(199)
    expect(risk.limitations.some(reason => reason.includes('primære tekniske avvik er prioritert'))).toBe(true)
  })
})

it.each(['Ingen skader.', 'Ingen avvik.', 'Det er ikke påvist lekkasje.'])('review: bevarer benektelsen før statusklassifisering: %s', description => {
  const basis = codeFirstBasis(['Forhold som har fått TG3:\nTak\n' + description + '\nKonsekvens/tiltak: Ingen.\n'])
  expect(extractTechnicalSummary(basis)[0]!.description).toBe(description)
  expect(analyzeTechnicalRisks(basis).findings).toEqual([])
})
it.each(['Ukjent skade.', 'Annen dokumentasjon', 'Andre opplysninger:', 'Et ukjent forhold fortsetter\nuten sikker slutt.'])('review: ukjent eller avbrutt prosa blir aldri en ren navneliste: %s', description => {
  const basis = codeFirstBasis(['Forhold som har fått TG3:\nTak\n' + description + '\n'])
  expect(extractTechnicalSummary(basis)).toEqual([])
  expect(analyzeTechnicalRisks(basis).findings).toEqual([])
})
