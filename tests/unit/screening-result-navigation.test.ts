import { describe, expect, it } from 'vitest'
import { screeningState } from '../helpers/screening-state.ts'
import { createInitialSession, sessionReducer } from '../../src/frontend/state/session.ts'
import { selectResult } from '../../src/frontend/state/result.ts'

describe('Story 3.7 — første resultat gjennom eksisterende kontrollport', () => {
  it('sperrer manglende tall, rapport og ufullført liste uten å produsere snapshot', () => {
    const initial = createInitialSession()
    expect(sessionReducer(initial, { type: 'navigate', step: 'resultat' })).toBe(initial)
    const state = { ...screeningState({ report: 'unconfirmed' }), resultSnapshot: null }
    expect(sessionReducer(state, { type: 'navigate', step: 'resultat' })).toBe(state)
  })
  it('ferdig kontroll gir første snapshot; Uavklart TG3 gir informasjon selv med fullført kontroll', () => {
    for (const report of [undefined, 'tg3'] as const) {
      let state = { ...screeningState({ report }), resultSnapshot: null }
      if (report === 'tg3') state = { ...sessionReducer(state, { type: 'report-tg3-register', generation: 1, findingId: 'F4-TG3-1', field: 'status', value: 'unresolved' }), resultSnapshot: null }
      const next = sessionReducer(state, { type: 'navigate', step: 'resultat' })
      expect(next.currentStep).toBe('resultat')
      expect(next.resultSnapshot?.assessment.recommendation).toBe(report ? 'Innhent mer informasjon' : 'Gå videre')
    }
  })
  it('retur uten endring bevarer samme snapshot og kontroller; senere besøk fornyer ikke historisk resultat', () => {
    let state = screeningState()
    const snapshot = state.resultSnapshot
    state = sessionReducer(state, { type: 'navigate', step: 'resultat' })
    state = sessionReducer(state, { type: 'navigate', step: 'tallgrunnlag' })
    state = sessionReducer(state, { type: 'register-value', field: 'L', rawValue: '1000000' })
    state = sessionReducer(state, { type: 'navigate', step: 'resultat' })
    expect(state.currentStep).toBe('resultat')
    expect(state.resultSnapshot).toBe(snapshot)
    expect(selectResult(state).status).toBe('historical')
  })
  it.each(['selecting', 'analysing'] as const)('historisk navigasjon forlater %s og avviser sent svar/filvalg', status => {
    let state = screeningState()
    const snapshot = state.resultSnapshot
    const selected = state.report.selected!
    const outcome = state.report.outcome!
    state = sessionReducer(state, { type: 'report-selecting', generation: 2 })
    const correlation = { generation: 2, sessionId: 'late', requestId: 'new-analysis' }
    if (status === 'analysing') {
      state = sessionReducer(state, { type: 'report-selected', generation: 2, selected })
      state = sessionReducer(state, { type: 'report-start', correlation })
    }
    state = sessionReducer(state, { type: 'navigate', step: 'resultat' })
    expect(state.report.status).toBe('failed')
    expect(state.report.generation).toBe(3)
    expect(state.report.error).toBe('interrupted')
    const abandoned = state
    state = sessionReducer(state, { type: 'report-selected', generation: 2, selected })
    state = sessionReducer(state, { type: 'report-response', correlation, ok: true,
      body: { kind: 'analysis', correlation, outcome: { ...outcome, requestId: correlation.requestId } } })
    state = sessionReducer(state, { type: 'report-error', generation: 2, code: 'transport-failure' })
    expect(state.report).toBe(abandoned.report)
    expect(state.resultSnapshot).toBe(snapshot)
    expect(selectResult(state).status).toBe('historical')
  })
})
