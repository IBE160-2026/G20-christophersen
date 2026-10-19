import { describe, expect, it } from 'vitest'
import { FinancialFieldSchema, RegisteredFinancialInputSchema } from '../../src/contracts/financial-input.ts'
import { validateFinancialBasis } from '../../src/domain/financial-basis.ts'
import { confirmationCandidate, createInitialSession, isFinancialConfirmed, sessionReducer } from '../../src/frontend/state/session.ts'
import type { SessionAction, SessionState } from '../../src/frontend/state/session.ts'

function registered(): SessionState {
  const state = createInitialSession()
  for (const [field, rawValue] of Object.entries({ P: '16000000', L: '1900000', D: '400000', J: '800000', Ymin: '7' })) {
    const id = FinancialFieldSchema.parse(field)
    state.financial[id].rawValue = rawValue
    state.sources = { ...state.sources, [id]: { ...state.sources[id], kind: 'assumption', description: `F1 ${field}` } }
  }
  state.sources.L.rentNature = 'expected'
  for (const field of ['L', 'D', 'J'] as const) Object.assign(state.financial[field], { period: 'year', year: '2026' })
  return state
}
function confirmed() { return sessionReducer(registered(), { type: 'confirm-financial' }) }

describe('Story 1.7 — kontroll, bekreftelse og berørt ugyldiggjøring', () => {
  it('AC1/AC3: registrering bekrefter ingenting; eksplisitt kontroll gjelder hele nåværende grunnlag', () => {
    const initial = registered()
    expect(Object.values(initial.financial).every((value) => !value.confirmed)).toBe(true)
    const state = sessionReducer(initial, { type: 'confirm-financial' })
    expect(RegisteredFinancialInputSchema.safeParse(state.financial).success).toBe(true)
    expect(isFinancialConfirmed(state)).toBe(true)
    expect(state.financialRevision).toBe(initial.financialRevision)
    expect(state.sources).toEqual(initial.sources)
    expect(state.costItems).toEqual(initial.costItems)
    expect(initial.financial.L.confirmed).toBe(false)
  })
  it.each([
    ['blank L', { type: 'register-value', field: 'L', rawValue: '' }],
    ['P=0', { type: 'register-value', field: 'P', rawValue: '0' }],
    ['negativ D', { type: 'register-value', field: 'D', rawValue: '-1' }],
    ['tekst J', { type: 'register-value', field: 'J', rawValue: 'abc' }],
    ['ukjent periode', { type: 'register-period', field: 'L', period: 'unknown' }],
    ['ulike år', { type: 'register-year', field: 'J', year: '2025' }],
    ['manglende kilde', { type: 'register-source', field: 'P', source: { kind: '', description: '', conflict: null } }],
    ['konflikt L', { type: 'register-source', field: 'L', source: { kind: 'source', description: 'a', conflict: { rawValue: '1', description: 'b' } } }],
    ['ufullstendig kostnad', { type: 'add-cost' }],
  ] satisfies [string, SessionAction][])('AC2: %s kan ikke bekreftes; rågrunnlaget bevares', (_name, action) => {
    const initial = sessionReducer(registered(), action)
    const state = sessionReducer(initial, { type: 'confirm-financial' })
    expect(state.financial).toBe(initial.financial)
    expect(state.sources).toBe(initial.sources)
    expect(state.costItems).toBe(initial.costItems)
    expect(isFinancialConfirmed(state)).toBe(false)
    expect(state.confirmationAttempts).toBe(1)
    expect(Object.values(state.financial).every((value) => !value.confirmed)).toBe(true)
  })
  it.each(['L', 'D', 'J', 'Ymin'] as const)('AC3: eksplisitt 0 for %s skiller ubekreftet null, bekreftet null og blank', (field) => {
    let state = sessionReducer(registered(), { type: 'register-value', field, rawValue: '0,00' })
    state = sessionReducer(state, { type: 'confirm-financial' })
    expect(isFinancialConfirmed(state)).toBe(false)
    expect(validateFinancialBasis(confirmationCandidate(state)).fields[field].issues.map((entry) => entry.code)).toContain('unconfirmed-zero')
    state = sessionReducer(state, { type: 'check-zero', field, checked: true })
    expect(state.financial[field].confirmed).toBe(false)
    state = sessionReducer(state, { type: 'confirm-financial' })
    expect(isFinancialConfirmed(state)).toBe(true)
    expect(state.financial[field].confirmed).toBe(true)
    state = sessionReducer(state, { type: 'register-value', field, rawValue: '' })
    expect(state.explicitZeros).not.toContain(field)
    expect(isFinancialConfirmed(sessionReducer(state, { type: 'confirm-financial' }))).toBe(false)
  })

  const cases: [string, SessionAction, string[]][] = [
    ...FinancialFieldSchema.options.map((field): [string, SessionAction, string[]] => [`verdi ${field}`, { type: 'register-value', field, rawValue: '8' }, [field]]),
    ...(['L', 'D', 'J'] as const).flatMap((field): [string, SessionAction, string[]][] => [
      [`periode ${field}`, { type: 'register-period', field, period: 'month' }, [field]],
      [`år ${field}`, { type: 'register-year', field, year: '2025' }, [field]],
    ]),
    ...FinancialFieldSchema.options.flatMap((field): [string, SessionAction, string[]][] => [
      [`kildetype ${field}`, { type: 'register-source', field, source: { kind: 'source', description: `F1 ${field}`, conflict: null } }, [field]],
      [`kildebeskrivelse ${field}`, { type: 'register-source', field, source: { kind: 'assumption', description: 'Ny kilde', conflict: null } }, [field]],
      [`kildekonflikt ${field}`, { type: 'register-source', field, source: { kind: 'assumption', description: `F1 ${field}`, conflict: { rawValue: '8', description: 'b' } } }, [field]],
    ]),
    ['leiegrunnlag', { type: 'register-rent-nature', rentNature: 'actual' }, ['L']],
    ['kostnad lagt til', { type: 'add-cost' }, ['D', 'J']],
  ]
  it.each(cases)('AC4: faktisk endring av %s opphever bare berørte felt', (_name, action, affected) => {
    const original = confirmed()
    const state = sessionReducer(original, action)
    expect(state.financialRevision).toBe(original.financialRevision + 1)
    expect(state.changedFields).toEqual(affected)
    for (const field of FinancialFieldSchema.options) expect(state.financial[field].confirmed).toBe(!affected.includes(field))
    expect(isFinancialConfirmed(state)).toBe(false)
    expect(isFinancialConfirmed(original)).toBe(true)
  })
  it.each(['label', 'rawAmount', 'rawDebt', 'includedIn'] as const)('AC4: kostnadens %s er del av D/J-bekreftelsen', (key) => {
    let state = registered()
    state.costItems = [{ id: 'a', label: 'Felles', rawAmount: '120000', rawDebt: '20000', includedIn: null }]
    state = sessionReducer(state, { type: 'confirm-financial' })
    expect(isFinancialConfirmed(state)).toBe(true)
    const before = state
    state = sessionReducer(state, { type: 'change-cost', id: 'a', update: { [key]: key === 'label' ? 'Drift' : key === 'includedIn' ? 'ukjent' : '10000' } })
    expect(state.changedFields).toEqual(['D', 'J'])
    expect(state.financial.P).toBe(before.financial.P)
    const removed = sessionReducer(before, { type: 'remove-cost', id: 'a' })
    expect(removed.changedFields).toEqual(['D', 'J'])
  })
  it('AC4/AC5: identiske registreringer og trinnretur endrer ingen data, revisjon eller bekreftelse', () => {
    let state = confirmed()
    const original = state
    const noops: SessionAction[] = FinancialFieldSchema.options.flatMap((field) => [
      { type: 'register-value', field, rawValue: state.financial[field].rawValue },
      { type: 'register-source', field, source: { ...state.sources[field] } },
    ])
    noops.push({ type: 'register-rent-nature', rentNature: 'expected' }, { type: 'remove-cost', id: 'missing' }, { type: 'change-cost', id: 'missing', update: { label: 'x' } })
    for (const field of ['L', 'D', 'J'] as const) noops.push({ type: 'register-period', field, period: 'year' }, { type: 'register-year', field, year: '2026' })
    for (const action of noops) expect(sessionReducer(state, action)).toBe(original)
    for (const step of ['tilstandsrapport', 'tallgrunnlag', 'tilstandsrapport', 'tallgrunnlag'] as const) {
      state = sessionReducer(state, { type: 'navigate', step })
      expect(state.financial).toBe(original.financial)
      expect(state.sources).toBe(original.sources)
      expect(state.costItems).toBe(original.costItems)
      expect(state.financialRevision).toBe(original.financialRevision)
      expect(isFinancialConfirmed(state)).toBe(true)
    }
    expect(createInitialSession().financial.P.rawValue).toBe('')
  })
  it('AC4: retting og ny bekreftelse fjerner endringsstatus, mens nullkontroll ikke overføres til endret kilde', () => {
    let state = sessionReducer(confirmed(), { type: 'register-value', field: 'J', rawValue: '0' })
    state = sessionReducer(state, { type: 'check-zero', field: 'J', checked: true })
    state = sessionReducer(state, { type: 'confirm-financial' })
    state = sessionReducer(state, { type: 'register-source', field: 'J', source: { kind: 'assumption', description: 'Kontantkjøp', conflict: null } })
    expect(state.explicitZeros).toEqual([])
    expect(state.financial.P.confirmed).toBe(true)
    expect(isFinancialConfirmed(sessionReducer(state, { type: 'confirm-financial' }))).toBe(false)
    state = sessionReducer(state, { type: 'check-zero', field: 'J', checked: true })
    state = sessionReducer(state, { type: 'confirm-financial' })
    expect(isFinancialConfirmed(state)).toBe(true)
    expect(state.changedFields).toEqual([])
  })
  it('AC3/AC5: neste trinn avviser ubekreftet/ugyldig grunnlag', () => {
    const state = registered()
    expect(sessionReducer(state, { type: 'navigate', step: 'tilstandsrapport' })).toBe(state)
  })
  it.each([
    { type: 'register-period', field: 'D', period: 'month' },
    { type: 'register-year', field: 'D', year: '2025' },
  ] satisfies SessionAction[])('AC4: D-kontekstendring opphever også J-kostnadsbekreftelsen: $type', (action) => {
    const state = registered()
    state.costItems = [{ id: 'a', label: 'Felles', rawAmount: '120000', rawDebt: '20000', includedIn: null }]
    const before = sessionReducer(state, { type: 'confirm-financial' })
    expect(isFinancialConfirmed(before)).toBe(true)
    const after = sessionReducer(before, action)
    expect(after.financial.J.confirmed).toBe(false)
    expect(after.changedFields).toEqual(['D', 'J'])
    expect(after.financialRevision).toBe(before.financialRevision + 1)
    expect(after.financial.P).toBe(before.financial.P)
    expect(after.financial.L).toBe(before.financial.L)
    expect(after.costItems).toBe(before.costItems)
  })
  it('AC3: tilbaketrukket nullkontroll sperrer ny bruk uten å endre rågrunnlag/revisjon', () => {
    let state = sessionReducer(registered(), { type: 'register-value', field: 'J', rawValue: '0' })
    state = sessionReducer(state, { type: 'check-zero', field: 'J', checked: true })
    state = sessionReducer(state, { type: 'confirm-financial' })
    const before = state
    state = sessionReducer(state, { type: 'check-zero', field: 'J', checked: false })
    expect(state.explicitZeros).not.toContain('J')
    expect(state.financial.J.confirmed).toBe(false)
    expect(state.financial.J.rawValue).toBe('0')
    expect(state.financialRevision).toBe(before.financialRevision)
    expect(state.financial.P).toBe(before.financial.P)
    expect(sessionReducer(state, { type: 'navigate', step: 'tilstandsrapport' })).toBe(state)
    expect(isFinancialConfirmed(sessionReducer(state, { type: 'confirm-financial' }))).toBe(false)
  })
})
