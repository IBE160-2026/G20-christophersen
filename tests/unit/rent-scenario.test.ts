import { beforeAll, expect, it } from 'vitest'
import { createInitialSession, sessionReducer } from '../../src/frontend/state/session.ts'
import { selectScenarioBasis } from '../../src/frontend/state/scenario.ts'
import { selectResult } from '../../src/frontend/state/result.ts'
import { fixtureRent, rentalDocument } from '../helpers/rental-fixture.ts'
import { calculateFinancialScenario } from '../../src/domain/financial-scenario.ts'
let fixture: Awaited<ReturnType<typeof rentalDocument>>
let rent: Awaited<ReturnType<typeof fixtureRent>>
beforeAll(async () => { fixture = await rentalDocument(); rent = await fixtureRent(fixture.outcome) })
it('59→60-estimat fyller bare urørt L, bevarer ukjent fellesgjeld og viker for manuell og dokumentert leie', async () => {
  const apartment = await rentalDocument(['Adresse: Eksempelgata 1, 0194 Oslo', 'Kommune: Oslo', 'Bydel: 1 Gamle Oslo', 'Boligtype: Leilighet', 'BRA-i: 59 m2', 'Antall rom: 3', 'Prisantydning: 8 600 000 kr', 'Felleskostnader: 3660 kr/mnd'])
  const estimate = await fixtureRent(apartment.outcome)
  let session = createInitialSession()
  session.prospectus.prospectus = { ...session.prospectus.prospectus, status: 'imported', ...apartment }
  const initial = selectScenarioBasis(session, estimate)
  expect(initial).toMatchObject({ P: null, L: '226800', D: null, year: '2025' })
  expect(initial.provenance.L).toContain('ubekreftet'); expect(session.financial.L.rawValue).toBe('')
  session = sessionReducer(session, { type: 'register-value', field: 'P', rawValue: '8600000' })
  session = sessionReducer(session, { type: 'register-source', field: 'P', source: { kind: 'source', description: 'Egen registrering fra prisopplysningen; fellesgjeld må avklares', conflict: null } })
  const automatic = selectScenarioBasis(session, estimate)
  expect(Number(calculateFinancialScenario(automatic, { equity: '', annualInterest: '', months: '' }).grossYield)).toBeCloseTo(2.63720930232558, 12)
  expect(automatic.D).toBeNull(); expect(session.financial.P.confirmed).toBe(false)
  for (const action of [
    { type: 'register-value', field: 'L', rawValue: '240000' }, { type: 'register-period', field: 'L', period: 'year' },
    { type: 'register-year', field: 'L', year: '2025' }, { type: 'register-source', field: 'L', source: { kind: 'assumption', description: 'Egen forventning', conflict: null } },
    { type: 'register-rent-nature', rentNature: 'expected' },
  ] as const) session = sessionReducer(session, action)
  expect(selectScenarioBasis(session, estimate)).toMatchObject({ L: '240000', D: null, year: '2025' })
  session = sessionReducer(session, { type: 'register-value', field: 'L', rawValue: '21000' })
  session = sessionReducer(session, { type: 'register-period', field: 'L', period: 'month' })
  session = sessionReducer(session, { type: 'register-source', field: 'L', source: { kind: 'source', description: 'Brukerregistrert leiekontrakt', conflict: null } })
  session = sessionReducer(session, { type: 'register-rent-nature', rentNature: 'actual' })
  expect(selectScenarioBasis(session, estimate)).toMatchObject({ L: '252000', D: null })
  expect(selectScenarioBasis(session, estimate).provenance.L).toContain('Brukerregistrert leiekontrakt')
  expect(selectResult(session).status).toBe('not-calculated')
})
function state() {
  const session = createInitialSession()
  session.prospectus.prospectus = { ...session.prospectus.prospectus, status: 'imported', ...fixture }
  return session
}
it('kobler gratis estimat automatisk til ubekreftet økonomi med prisår og uten screeningbekreftelse', () => {
  const session = state(), before = structuredClone(session), basis = selectScenarioBasis(session, rent)
  expect(rent.status).toBe('estimated')
  expect(basis.L).toBe('146400'); expect(basis.year).toBe('2025'); expect(basis.provenance.L).toContain('2025-nivå')
  expect(basis.issues.join(' ')).toContain('ikke dokumentert leie')
  expect(session).toEqual(before); expect(session.financial.L.confirmed).toBe(false); expect(selectResult(session).status).toBe('not-calculated')
})
it('overstyrer aldri manuell leie, oppgitt faktisk leie, konflikt eller ugyldig input', () => {
  for (const raw of ['99999', '-1', 'feil']) {
    const session = sessionReducer(state(), { type: 'register-value', field: 'L', rawValue: raw })
    expect(selectScenarioBasis(session, rent).provenance.L).not.toContain('SSB-referanse')
  }
  const conflict = state(); conflict.sources.L.conflict = { rawValue: '200000', description: 'Annen kilde' }
  expect(selectScenarioBasis(conflict, rent).L).toBeNull()
  const actual = state(); actual.sources.L.rentNature = 'actual'
  expect(selectScenarioBasis(actual, rent).L).toBeNull()
})
it('et bevisst tømt manuelt felt fylles ikke igjen, mens nytt objekt nullstiller redigering', () => {
  let session = sessionReducer(state(), { type: 'register-value', field: 'L', rawValue: '200000' })
  session = sessionReducer(session, { type: 'register-value', field: 'L', rawValue: '' })
  expect(session.rentManuallyEdited).toBe(true); expect(selectScenarioBasis(session, rent).L).toBeNull()
  session = sessionReducer(session, { type: 'import-selecting', generation: 1, role: 'prospectus' })
  session = sessionReducer(session, { type: 'import-selected', generation: 1, role: 'prospectus', selected: { ...fixture.selected, hash: 'b'.repeat(64) } })
  expect(session.rentManuallyEdited).toBe(false)
})
it('avviser gammelt estimat under objektbytte og ved hashavvik eller utilgjengelighet', () => {
  const session = state(); session.prospectus.prospectus.status = 'selecting'
  expect(selectScenarioBasis(session, rent).L).toBeNull()
  expect(selectScenarioBasis(state(), { ...rent, documentHash: 'c'.repeat(64) }).L).toBeNull()
  expect(selectScenarioBasis(state(), { ...rent, status: 'unavailable', annual: null }).L).toBeNull()
})
it('bevarer samme-år-regelen og manglende drift ved automatisk leie', () => {
  let session = state()
  expect(selectScenarioBasis(session, rent).D).toBeNull()
  for (const action of [
    { type: 'register-value', field: 'D', rawValue: '40000' },
    { type: 'register-period', field: 'D', period: 'year' },
    { type: 'register-year', field: 'D', year: '2026' },
    { type: 'register-source', field: 'D', source: { kind: 'assumption', description: 'Full drift', conflict: null } },
  ] as const) session = sessionReducer(session, action)
  const basis = selectScenarioBasis(session, rent)
  expect(basis.L).toBe('146400'); expect(basis.D).toBeNull(); expect(basis.issues.join(' ')).toContain('ulike år')
  session = sessionReducer(session, { type: 'register-year', field: 'D', year: '2025' })
  expect(selectScenarioBasis(session, rent).D).toBe('40000')
})
