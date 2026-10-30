import { beforeAll, describe, expect, it } from 'vitest'
import { selectScenarioBasis } from '../../src/frontend/state/scenario.ts'
import { calculateFinancialScenario } from '../../src/domain/financial-scenario.ts'
import { createInitialSession, sessionReducer } from '../../src/frontend/state/session.ts'
import { selectResult } from '../../src/frontend/state/result.ts'
import { screeningState } from '../helpers/screening-state.ts'
import { importFixture } from '../helpers/import-fixture.ts'
let fixture: Awaited<ReturnType<typeof importFixture>>
beforeAll(async () => { fixture = await importFixture() })
describe('Scenarioadapter fra faktisk aktivt grunnlag', () => {
  it('tom økt er ukjent uten eksempeløkonomi', () => {
    expect(selectScenarioBasis(createInitialSession())).toMatchObject({ P: null, L: null, D: null, cashRequired: null, sharedAnnualPayment: null, year: null })
  })
  it('leser ubekreftet input med perioder og opphav uten å bekrefte eller endre screening', () => {
    const state = sessionReducer(screeningState(), { type: 'register-value', field: 'L', rawValue: '2000000' }), financial = state.financial, report = state.report, snapshot = state.resultSnapshot
    const before = structuredClone({ financial: state.financial, sources: state.sources, costItems: state.costItems, revision: state.financialRevision })
    const basis = selectScenarioBasis(state)
    expect(basis).toMatchObject({ P: '16000000', L: '2000000', D: '400000', year: '2026', cashRequired: null })
    expect(basis.provenance.L).toContain('Egen forutsetning')
    const result = calculateFinancialScenario(basis, { equity: '1000000', annualInterest: '5', months: '300' })
    expect(result.grossYield).toBe('12.5'); expect(result.monthly).toBeNull()
    expect(state.financial).toBe(financial); expect(state.report).toBe(report); expect(state.resultSnapshot).toBe(snapshot)
    expect({ financial: state.financial, sources: state.sources, costItems: state.costItems, revision: state.financialRevision }).toEqual(before)
    expect(selectResult(state).status).toBe('historical')
    expect(state.financial.L.confirmed).toBe(false)
  })
  it('normaliserer måned med eksakt desimal og blokkerer forskjellige år bare for avhengige tall', () => {
    const state = screeningState({ values: { L: '100000,01' }, periods: { L: 'month' } })
    state.financial.D.year = '2025'
    const basis = selectScenarioBasis(state)
    expect(basis.L).toBe('1200000.12'); expect(basis.D).toBeNull()
    expect(calculateFinancialScenario(basis, { equity: '', annualInterest: '', months: '' }).grossYield).toBe('7.50000075')
  })
  it('kildekonflikt og ukjent periode blir ikke en antatt verdi', () => {
    const state = screeningState()
    state.sources.L.conflict = { rawValue: '1800000', description: 'Annen kilde' }
    state.financial.D.period = 'unknown'
    expect(selectScenarioBasis(state)).toMatchObject({ P: '16000000', L: null, D: null })
  })
  it('importkandidat gir kontantbehov, men driftssubtotal er ikke full drift', () => {
    const state = createInitialSession()
    state.prospectus.prospectus = { ...state.prospectus.prospectus, status: 'imported', selected: fixture.selected, outcome: fixture.outcome }
    const basis = selectScenarioBasis(state)
    expect(basis).toMatchObject({ P: '3200000', L: null, D: null, cashRequired: '3075000' })
    expect(basis.provenance.P).toContain('mixed-12.pdf')
    expect(Object.values(state.financial).every(field => !field.confirmed)).toBe(true)
  })
  it('avvikende manuell pris får ikke dokumentets kontantbehov eller tilbakefylt importpris', () => {
    let state = createInitialSession()
    state.prospectus.prospectus = { ...state.prospectus.prospectus, status: 'imported', selected: fixture.selected, outcome: fixture.outcome }
    state = sessionReducer(state, { type: 'register-value', field: 'P', rawValue: '5000000' })
    state = sessionReducer(state, { type: 'register-source', field: 'P', source: { kind: 'assumption', description: 'Annen pris', conflict: null } })
    expect(selectScenarioBasis(state)).toMatchObject({ P: '5000000', cashRequired: null, sharedAnnualPayment: null })
  })
  it.each(['selecting', 'loading', 'failed'] as const)('bruker ikke gammelt importgrunnlag under status %s', status => {
    const state = screeningState()
    state.prospectus.prospectus = { ...state.prospectus.prospectus, status, selected: fixture.selected, outcome: fixture.outcome }
    expect(selectScenarioBasis(state)).toMatchObject({ P: null, L: null, D: null, cashRequired: null, sharedAnnualPayment: null })
  })
  it('avviser mismatchende dokumenthash, også når status sier imported', () => {
    const state = createInitialSession()
    state.prospectus.prospectus = { ...state.prospectus.prospectus, status: 'imported', selected: { ...fixture.selected, hash: 'a'.repeat(64) }, outcome: fixture.outcome }
    expect(selectScenarioBasis(state).cashRequired).toBeNull()
  })
  it('manuell kildekonflikt kan ikke erstattes av dokumentkandidat', () => {
    const state = createInitialSession()
    state.prospectus.prospectus = { ...state.prospectus.prospectus, status: 'imported', selected: fixture.selected, outcome: fixture.outcome }
    state.sources.P.conflict = { rawValue: '4000000', description: 'Uavklart pris' }
    expect(selectScenarioBasis(state)).toMatchObject({ P: null, cashRequired: null })
  })
})
