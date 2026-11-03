import { describe, expect, it } from 'vitest'
import { selectPropertyRisks } from '../../src/frontend/investment/property-risk.ts'
import { createInitialSession } from '../../src/frontend/state/session.ts'
import { importControlOutcome } from '../../src/domain/document-import.ts'
import { importFixture } from '../helpers/import-fixture.ts'
import type { RiskFinding } from '../../src/contracts/property-risk.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { codeFirstBasis } from '../helpers/code-first.ts'

async function fixture(name = 'mixed-12.pdf') {
  const { selected, outcome } = await importFixture(name)
  const state = createInitialSession()
  state.prospectus.prospectus = { selected, outcome, status: 'imported', active: null, error: null }
  state.report = { ...state.report, selected, outcome: importControlOutcome(outcome), documentImport: outcome, status: 'completed' }
  return state
}
describe('Risikooversiktens aktuelle og etterprøvbare grunnlag', () => {
  it('bevarer salgsoppgavens sammendrag og originaler når separat rapport blir gjeldende, med status- og identitetssperrer', async () => {
    const prospectusBasis = { ...codeFirstBasis(['Adresse: Testveien 8\nForhold som har fått TG2:\nVinduer\nDet er påvist råte i karmene.\nKonsekvens/tiltak:\nInnhent faglig vurdering.']), name: 'salgsoppgave.pdf' }
    const prospectus = await createCodeFirstImport(prospectusBasis)
    const state = createInitialSession()
    const selected = { hash: prospectusBasis.hash, file: new File([], prospectusBasis.name), bytes: new Uint8Array() }
    state.prospectus.prospectus = { selected, outcome: prospectus, status: 'imported', active: null, error: null }
    const reportBasis = { ...codeFirstBasis(['TILSTANDSRAPPORT - START\nAdresse: Testveien 8\nBygningsdel: Tak\nTilstandsgrad: TG3\nVurdering av avvik:\nDet er påvist lekkasje.\nKonsekvens/tiltak:\nUndersøk taket.\nTILSTANDSRAPPORT - SLUTT']), role: 'report' as const, name: 'rapport.pdf', parentHash: prospectusBasis.hash }
    const report = await createCodeFirstImport(reportBasis), reportSelected = { hash: reportBasis.hash, file: new File([], reportBasis.name), bytes: new Uint8Array() }
    state.prospectus.report = { selected: reportSelected, outcome: report, status: 'imported', active: null, error: null }
    state.report = { ...state.report, selected: reportSelected, outcome: importControlOutcome(report), documentImport: report, status: 'completed' }
    const risks = selectPropertyRisks(state)
    const summary = risks.documented.find(item => item.evidenceKind === 'summary')
    expect(summary?.sources).toEqual(prospectus.propertyRisk!.technical.findings[0]!.sources)
    expect(summary?.sources.every(source => source.documentName === 'salgsoppgave.pdf' && source.documentHash === prospectusBasis.hash)).toBe(true)
    expect(risks.reportEvidence?.documentName).toBe('rapport.pdf')
    expect(risks.reportEvidence?.ranges[0]?.source.documentHash).toBe(reportBasis.hash)
    expect(risks.documented.some(item => item.evidenceKind === 'detail' && item.grade === 'TG3')).toBe(true)
    report.propertyIdentity[0]!.value = 'Annen vei 2'
    const conflicted = selectPropertyRisks(state)
    expect(conflicted.documented.filter(item => item.domain === 'technical')).toEqual([])
    expect(conflicted.possible.find(item => item.evidenceKind === 'summary')?.sources).toEqual(summary?.sources)
    expect(conflicted.gaps.join(' ')).toContain('motstridende eiendomsidentitet')
    state.prospectus.report.status = 'selecting'
    expect(selectPropertyRisks(state).possible.filter(item => item.domain === 'technical')).toEqual([])
    state.prospectus.report.status = 'imported'
    state.prospectus.prospectus.status = 'selecting'
    expect(selectPropertyRisks(state).documented).toEqual([])
    expect(selectPropertyRisks(state).possible).toEqual([])
  })
  it('holder salgsoppgavens og rapportens sammendragskilder atskilt ved samme bytehash og ulike filnavn', async () => {
    const basis = codeFirstBasis(['Adresse: Testveien 8\nForhold som har fått TG2:\nVinduer\nDet er påvist råte i karmene.\nKonsekvens/tiltak:\nInnhent faglig vurdering.'])
    const prospectus = await createCodeFirstImport({ ...basis, name: 'salgsoppgave-navn.pdf' })
    const report = await createCodeFirstImport({ ...basis, name: 'rapport-navn.pdf', role: 'report', parentHash: basis.hash })
    const state = createInitialSession(), selected = { hash: basis.hash, file: new File([], prospectus.documentName), bytes: new Uint8Array() }, reportSelected = { ...selected, file: new File([], report.documentName) }
    state.prospectus.prospectus = { selected, outcome: prospectus, status: 'imported', active: null, error: null }
    state.prospectus.report = { selected: reportSelected, outcome: report, status: 'imported', active: null, error: null }
    state.report = { ...state.report, selected: reportSelected, outcome: importControlOutcome(report), documentImport: report, status: 'completed' }
    const risks = selectPropertyRisks(state)
    const summaries = risks.documented.filter(item => item.evidenceKind === 'summary')
    expect(summaries).toHaveLength(2)
    expect(summaries.map(item => item.sources[0]!.documentName).sort()).toEqual(['rapport-navn.pdf', 'salgsoppgave-navn.pdf'])
    expect(summaries.every(item => item.sources.every(source => source.documentHash === basis.hash))).toBe(true)
    expect(risks.reportEvidence?.documentName).toBe('rapport-navn.pdf')
  })
  it('bevarer sammendrag som eget kildebelagt risikofunn uten å gjøre det til rapportkontrollgrunnlag', async () => {
    const basis = codeFirstBasis(['TILSTANDSRAPPORT - START\nAdresse: Testveien 8\nTILSTANDSRAPPORT - SLUTT\nForhold som har fått TG2:\nVinduer\nDet er påvist råte i karmene.\nKonsekvens/tiltak:\nInnhent faglig vurdering.'])
    const outcome = await createCodeFirstImport(basis), state = createInitialSession()
    const selected = { hash: basis.hash, file: new File([], basis.name), bytes: new Uint8Array() }
    state.prospectus.prospectus = { selected, outcome, status: 'imported', active: null, error: null }
    state.report = { ...state.report, selected, outcome: importControlOutcome(outcome), documentImport: outcome, status: 'completed' }
    const risks = selectPropertyRisks(state)
    expect(risks.documented).toContainEqual(expect.objectContaining({ evidenceKind: 'summary', component: 'Vinduer', grade: 'TG2', sources: expect.arrayContaining([expect.objectContaining({ documentHash: basis.hash, pdfPage: 1 })]) }))
    expect(outcome.technical.findings).toHaveLength(0)
    expect(risks.technicalCoverage).toContain('ufullstendig')
    expect(risks.reportEvidence).toMatchObject({ documentName: basis.name, ranges: [{ startPage: 1, endPage: 1, certainty: 'certain', source: { documentHash: basis.hash, documentName: basis.name, pdfPage: 1 } }] })
    state.prospectus.prospectus.status = 'selecting'
    expect(selectPropertyRisks(state).reportEvidence).toBeUndefined()
    expect(selectPropertyRisks(state).documented).toEqual([])
  })
  it('starter med manglende undersøkelser og uten en vellykket tomanalyse', () => {
    const risks = selectPropertyRisks(createInitialSession())
    expect(risks.documented).toEqual([])
    expect(risks.gaps.join(' ')).toContain('ikke undersøkt')
    expect(risks.technicalCoverage).toContain('ikke undersøkt')
  })
  it('skjuler tidligere funn ved nytt salgsoppgavevalg og ved uferdig separat rapport', async () => {
    const state = await fixture()
    expect(selectPropertyRisks(state).documented.length).toBeGreaterThan(0)
    state.prospectus.prospectus.status = 'selecting'
    expect(selectPropertyRisks(state).documented).toEqual([])
    state.prospectus.prospectus.status = 'imported'
    for (const status of ['selecting', 'loading', 'failed'] as const) {
      state.prospectus.report.status = status
      expect(selectPropertyRisks(state).documented.filter(item => item.domain === 'technical')).toEqual([])
      expect(selectPropertyRisks(state).technicalCoverage).toContain('ikke ferdig importert')
    }
  })
  it('viser juridiske treffsikkerhetsgrupper og eksplisitt ikke undersøkt med kilder', async () => {
    const state = await fixture(), outcome = state.prospectus.prospectus.outcome!
    const source = outcome.economy.fields.flatMap(field => field.sources)[0]!
    const item: RiskFinding = { id: 'legal-example', title: 'Ikke godkjent bruksenhet', description: 'Syntetisk avvik', domain: 'legal', category: 'rental-approval',
      status: 'documented', grade: null, consequence: 'Bruken må avklares.', action: 'Kontroller kommunale dokumenter.', sources: [source] }
    outcome.propertyRisk = { legal: { method: 'local-rules-1', coverage: 'partial', examinedPages: [1], unreadPages: [2], findings: [item, { ...item, id: 'possible', status: 'possible' }, { ...item, id: 'unchecked', status: 'not-investigated' }], limitations: ['Kun lokale regler.'] },
      technical: { method: 'local-rules-1', coverage: 'unavailable', examinedPages: [], unreadPages: [], findings: [], limitations: [] } }
    const risks = selectPropertyRisks(state)
    expect(risks.documented).toContainEqual(item)
    expect(risks.possible).toContainEqual(expect.objectContaining({ id: 'possible' }))
    expect(risks.unexamined).toContainEqual(expect.objectContaining({ id: 'unchecked', sources: [source] }))
    expect(risks.gaps.join(' ')).toContain('PDF-sider 2')
    expect(risks.limitations).toContain('Kun lokale regler.')
  })
  it('bevarer rapportkilden og viser ikke avviste funn eller rettinger som dokumenterte fakta', async () => {
    const state = await fixture(), first = state.report.outcome!.status === 'completed' ? state.report.outcome!.findings[0]! : null
    if (!first) throw new Error('Syntetisk funn mangler')
    const risks = selectPropertyRisks(state)
    expect(risks.documented.find(item => item.id === `controlled-${first.findingId}`)?.sources[0]).toMatchObject({ documentHash: state.report.selected!.hash, pdfPage: first.source.pdfPage })
    expect(risks.documented.find(item => item.id === `controlled-${first.findingId}`)?.controlNote).toContain('brukerkontroll gjenstår')
    state.report.findingControls = [{ findingId: first.findingId, revision: 1, rejection: { revision: 1 }, correction: null, draft: null, confirmedRevision: null, errors: {} }]
    expect(selectPropertyRisks(state).documented.some(item => item.id === `controlled-${first.findingId}`)).toBe(false)
    state.report.findingControls[0]!.rejection = null
    state.report.findingControls[0]!.correction = { grade: 'TG2', description: 'Brukerrettet beskrivelse', source: first.source }
    const corrected = selectPropertyRisks(state)
    expect(corrected.documented.some(item => item.id === `controlled-${first.findingId}`)).toBe(false)
    expect(corrected.possible).toContainEqual(expect.objectContaining({ id: `controlled-${first.findingId}`, description: 'Brukerrettet beskrivelse', grade: 'TG2' }))
  })
  it('sier ufullstendig selv om deluttrekk har tekniske funn', async () => {
    const state = await fixture()
    state.report.documentImport!.coverage.technical.status = 'incomplete'
    state.report.documentImport!.coverage.technical.reasons = ['Ubehandlet rapportside.']
    const risks = selectPropertyRisks(state)
    expect(risks.documented.length).toBeGreaterThan(0)
    expect(risks.technicalCoverage).toContain('ufullstendig')
    expect(risks.limitations).toContain('Ubehandlet rapportside.')
  })
  it('viser identitetskonflikt også for integrert rapport', async () => {
    const risks = selectPropertyRisks(await fixture('integrated-identity-conflict-12.pdf'))
    expect(risks.documented.filter(item => item.domain === 'technical')).toEqual([])
    expect(risks.possible.some(item => item.grade === 'TG3')).toBe(true)
    expect(risks.gaps.join(' ')).toContain('motstridende eiendomsidentitet')
  })
  it('bevarer hele avviksblokken ved overlapp med et kortere TG-funn', async () => {
    const basis = codeFirstBasis(['TILSTANDSRAPPORT - START\nAdresse: Testveien 8\nBygningsdel: Tak\nTilstandsgrad: TG3\nVurdering av avvik:\nDet er påvist lekkasje.\nSkadene omfatter hele takkonstruksjonen og kan kreve utskifting.\nKonsekvens/tiltak\nInnhent faglig vurdering.\nTILSTANDSRAPPORT - SLUTT'])
    const outcome = await createCodeFirstImport(basis), state = createInitialSession()
    const selected = { hash: basis.hash, file: new File([], basis.name), bytes: new Uint8Array() }
    state.prospectus.prospectus = { selected, outcome, status: 'imported', active: null, error: null }
    state.report = { ...state.report, selected, outcome: importControlOutcome(outcome), documentImport: outcome, status: 'completed' }
    const risks = selectPropertyRisks(state)
    expect(risks.documented).toHaveLength(1)
    expect(risks.documented[0]?.description).toContain('hele takkonstruksjonen')
    expect(risks.documented[0]?.sources.some(source => source.quote?.includes('hele takkonstruksjonen'))).toBe(true)
  })
  it('samler juridiske funn fra separat rapport med riktig originaldokument', async () => {
    const state = await fixture()
    const basis = { ...codeFirstBasis(['Adresse: Testveien 8\nUtleieenheten er ikke godkjent som egen bruksenhet.']), role: 'report' as const, name: 'separat-juridisk.pdf', parentHash: state.prospectus.prospectus.selected!.hash }
    const outcome = await createCodeFirstImport(basis), selected = { hash: basis.hash, file: new File([], basis.name), bytes: new Uint8Array() }
    state.prospectus.report = { selected, outcome, status: 'imported', active: null, error: null }
    state.report = { ...state.report, selected, outcome: importControlOutcome(outcome), documentImport: outcome, status: 'completed' }
    expect(selectPropertyRisks(state).documented).toContainEqual(expect.objectContaining({ category: 'rental-approval', sources: [expect.objectContaining({ documentName: basis.name })] }))
  })
  it('teller unike forhold og holder bakgrunn og dekningsmetadata separat uten å endre uttrekket', async () => {
    const basis = codeFirstBasis([
      'Kjelleretasjen har en utleieenhet som ikke er godkjent.',
      'Utleid leilighet er ikke godkjent som egen bruksenhet.',
      'Etter husleieloven gjelder at fremleie krever styrets samtykke.',
    ])
    const outcome = await createCodeFirstImport(basis), state = createInitialSession()
    const original = structuredClone(outcome)
    const selected = { hash: basis.hash, file: new File([], basis.name), bytes: new Uint8Array() }
    state.prospectus.prospectus = { selected, outcome, status: 'imported', active: null, error: null }
    const risks = selectPropertyRisks(state)
    expect(risks.documented).toHaveLength(1)
    expect(risks.documented[0]?.sources.map(source => source.pdfPage)).toEqual([1, 2])
    expect(risks.background).toHaveLength(1)
    expect(risks.gaps.length).toBeGreaterThan(0)
    expect(outcome).toEqual(original)
    state.prospectus.prospectus.status = 'selecting'
    expect(selectPropertyRisks(state).documented).toEqual([])
    expect(selectPropertyRisks(state).background).toEqual([])
  })
  it('viser alvorlig TG3 og utleiegodkjenning før andre godkjenningsspørsmål og TG2', async () => {
    const state = await fixture(), legal = state.prospectus.prospectus.outcome!.propertyRisk!.legal
    const source = state.prospectus.prospectus.outcome!.economy.fields.flatMap(field => field.sources)[0]!
    const common = { domain: 'legal' as const, status: 'documented' as const, grade: null, consequence: 'Avklar bruk.', action: 'Se original.', sources: [source] }
    legal.findings = [
      { ...common, id: 'a-other', category: 'use-approval', title: 'Godkjenning må kontrolleres', description: 'Et konkret lovlighetsforhold.' },
      { ...common, id: 'z-rental', category: 'rental-approval', title: 'Utleieenhet er ikke godkjent', description: 'Utleieenhet er ikke godkjent.' },
    ]
    const order = selectPropertyRisks(state).documented
    expect(order[0]?.grade).toBe('TG3')
    expect(order[1]?.category).toBe('rental-approval')
    expect(order[2]?.category).toBe('use-approval')
    expect(order.slice(3).map(item => item.grade)).toEqual(['TG2', 'TG2'])
  })
})

it('samler sammendrag og lokal grafisk detalj én gang med begge kildetyper og usikkert sidekart', async () => {
  const { addVisualTechnical } = await import('../../src/backend/import/visual-technical.ts')
  const basis = codeFirstBasis(['Forhold som har fått TG2:\nTaktekking\nDet er påvist lekkasje.\nKonsekvens/tiltak:\nUndersøk taket.', 'TILSTANDSRAPPORT - START\nTILSTANDSRAPPORT - SLUTT'])
  const original = await createCodeFirstImport(basis)
  const box = (x: number, y: number, width: number, height = .02) => ({ x, y, width, height })
  const outcome = addVisualTechnical(original, { version: 'local-visual-1', documentHash: basis.hash, documentName: basis.name, pages: [{ pdfPage: 2, width: 600, height: 800, rasterDigest: 'c'.repeat(64), error: null,
    lines: [{ text: 'Taktekking', confidence: .99, box: box(.15, .20, .28) }, { text: 'Vurdering av avvik:', confidence: .99, box: box(.10, .25, .30) }, { text: 'Det er påvist lekkasje.', confidence: .99, box: box(.10, .30, .30) }, { text: 'Konsekvens/tiltak:', confidence: .99, box: box(.10, .35, .30) }],
    symbols: [{ grade: 'TG2', confidence: .99, box: box(.10, .20, .03), text: 'TG2' }],
  }] })
  const state = createInitialSession(), selected = { hash: basis.hash, file: new File([], basis.name), bytes: new Uint8Array() }
  state.prospectus.prospectus = { selected, outcome, status: 'imported', active: null, error: null }
  state.report = { ...state.report, selected, outcome: importControlOutcome(outcome), documentImport: outcome, status: 'completed' }
  const risks = selectPropertyRisks(state)
  const technical = risks.documented.filter(item => item.domain === 'technical')
  expect(technical).toHaveLength(1)
  expect(technical[0]).toMatchObject({ sourceQuality: 'local-visual', grade: 'TG2', evidenceKind: 'detail', members: expect.arrayContaining([expect.objectContaining({ evidenceKind: 'summary' }), expect.objectContaining({ sourceQuality: 'local-visual' })]) })
  expect(technical[0]!.sources.some(source => source.method === 'pdf-text')).toBe(true)
  expect(technical[0]!.sources.some(source => source.method === 'local-vision' && source.start === undefined)).toBe(true)
  expect(risks.reportEvidence?.visualPages).toEqual([expect.objectContaining({ pdfPage: 2, rendered: true, status: 'uncertain', findings: 1 })])
  expect(risks.technicalCoverage).toContain('ufullstendig')
  // Missing raster provenance must never manufacture summary/detail identity.
  outcome.visualAnalysis = undefined
  expect(selectPropertyRisks(state).documented.filter(item => item.domain === 'technical')).toHaveLength(2)
})

it('bevarer alle OCR-regioner og opphav når samme detalj også finnes i rapportkontrollen', async () => {
  const { addVisualTechnical } = await import('../../src/backend/import/visual-technical.ts')
  const basis = codeFirstBasis(['Bygningsdel: Bad øst\nTilstandsgrad: TG3\nVurdering av avvik:\n• Det er påvist lekkasje.\nKonsekvens/tiltak\nUtbedring anbefales.'])
  const original = await createCodeFirstImport(basis)
  expect(original.technical.findings).toHaveLength(1)
  const box = (x: number, y: number, width: number, height = .02) => ({ x, y, width, height })
  const outcome = addVisualTechnical(original, { version: 'local-visual-1', documentHash: basis.hash, documentName: basis.name, pages: [{ pdfPage: 1, width: 600, height: 800, rasterDigest: 'c'.repeat(64), error: null,
    lines: [{ text: 'Bad øst', confidence: .99, box: box(.15, .20, .28) }, { text: 'Vurdering av avvik:', confidence: .99, box: box(.10, .25, .30) }, { text: '• Det er påvist lekkasje.', confidence: .99, box: box(.10, .30, .30) }, { text: 'Konsekvens/tiltak', confidence: .99, box: box(.10, .35, .30) }],
    symbols: [{ grade: 'TG3', confidence: .99, box: box(.10, .20, .03), text: 'TG3' }],
  }] })
  const visualSources = outcome.propertyRisk!.technical.findings.find(item => item.sourceQuality === 'local-visual')!.visualSources!
  expect(visualSources).toHaveLength(3)
  const state = createInitialSession(), selected = { hash: basis.hash, file: new File([], basis.name), bytes: new Uint8Array() }
  state.prospectus.prospectus = { selected, outcome, status: 'imported', active: null, error: null }
  state.report = { ...state.report, selected, outcome: importControlOutcome(outcome), documentImport: outcome, status: 'completed' }
  const details = selectPropertyRisks(state).documented.filter(item => item.domain === 'technical')
  expect(details).toHaveLength(1)
  expect(details[0]!.id).toMatch(/^controlled-/u)
  expect(details[0]!.sourceQuality).toBe('local-visual')
  expect(details[0]!.visualSources).toEqual(visualSources)
  expect(details[0]!.sources.filter(source => source.method === 'local-vision')).toEqual(visualSources)
  expect(details[0]!.sources.some(source => source.method === 'pdf-text')).toBe(true)
  expect(new Set(details[0]!.sources.filter(source => source.method === 'local-vision').map(source => JSON.stringify(source.region))).size).toBe(3)
})
