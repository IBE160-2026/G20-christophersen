import { describe, expect, it } from 'vitest'
import { RawFinancialInputSchema } from '../../src/contracts/financial-input.ts'
import type { FinancialField } from '../../src/contracts/financial-input.ts'
import { createInitialSession, sessionReducer } from '../../src/frontend/state/session.ts'
import type { SessionState } from '../../src/frontend/state/session.ts'

function freezeSession(state: SessionState) {
  for (const value of Object.values(state.financial)) Object.freeze(value)
  Object.freeze(state.financial)
  return Object.freeze(state)
}

describe('Story 1.3 — råregistrering og aktiv økt', () => {
  it('AC1: starter med fem blanke, ubekreftede verdier og uten antatt periode/år', () => {
    const state = createInitialSession()
    expect(RawFinancialInputSchema.parse(state.financial)).toEqual({
      P: { rawValue: '', confirmed: false },
      L: { rawValue: '', confirmed: false, period: '', year: '' },
      D: { rawValue: '', confirmed: false, period: '', year: '' },
      J: { rawValue: '', confirmed: false, period: '', year: '' },
      Ymin: { rawValue: '', confirmed: false },
    })
    expect(createInitialSession().financial).not.toBe(state.financial)
  })

  it('AC2: bevarer måned, år, ukjent og uoppgitt periode med hvert sitt rå år', () => {
    let state = freezeSession(createInitialSession())
    for (const [field, rawValue, period, year] of [
      ['L', '120000', 'month', '2026'],
      ['D', '400000', 'year', '2025'],
      ['J', '0', 'unknown', ' 2026 '],
    ] as const) {
      state = sessionReducer(state, { type: 'register-value', field, rawValue })
      state = sessionReducer(state, { type: 'register-period', field, period })
      state = sessionReducer(state, { type: 'register-year', field, year })
      expect(state.financial[field]).toEqual({ rawValue, period, year, confirmed: false })
    }
    state = sessionReducer(state, { type: 'register-period', field: 'L', period: '' })
    state = sessionReducer(state, { type: 'register-year', field: 'L', year: '' })
    expect(state.financial.L).toEqual({ rawValue: '120000', period: '', year: '', confirmed: false })
  })

  it.each<FinancialField>(['P', 'L', 'D', 'J', 'Ymin'])('AC3: %s bevarer råstreng og skiller registrert 0 fra sletting uten bekreftelse', (field) => {
    const original = freezeSession(createInitialSession())
    let state = original
    for (const rawValue of [' 01 234,56700 ', '0', '', '-1', 'ikke et tall']) {
      state = sessionReducer(freezeSession(state), { type: 'register-value', field, rawValue })
      expect(state.financial[field].rawValue).toBe(rawValue)
      expect(state.financial[field].confirmed).toBe(false)
      expect(original.financial[field].rawValue).toBe('')
      expect(RawFinancialInputSchema.safeParse(state.financial).success).toBe(true)
    }
  })

  it('AC3/AC4: registrerer F1, bevarer ved navigasjon og holder F3s slettede L blank', () => {
    let state = createInitialSession()
    for (const [field, rawValue] of Object.entries({ P: '16000000', L: '1900000', D: '400000', J: '800000', Ymin: '7' })) {
      state = sessionReducer(state, { type: 'register-value', field: field as FinancialField, rawValue })
    }
    for (const field of ['L', 'D', 'J'] as const) {
      state = sessionReducer(state, { type: 'register-period', field, period: 'year' })
      state = sessionReducer(state, { type: 'register-year', field, year: '2026' })
    }
    const before = freezeSession(state)
    for (let i = 0; i < 3; i++) {
      state = sessionReducer(state, { type: 'navigate', step: 'tallgrunnlag' })
      expect(state).toBe(before)
    }
    state = sessionReducer(state, { type: 'register-value', field: 'L', rawValue: '' })
    expect(state.financial.L).toEqual({ rawValue: '', period: 'year', year: '2026', confirmed: false })
    expect(state.financial.P).toBe(before.financial.P)
    expect(state.financial.Ymin).toEqual({ rawValue: '7', confirmed: false })
    expect(before.financial.L.rawValue).toBe('1900000')
    expect(createInitialSession().financial.L.rawValue).toBe('')
  })
})
