import { describe, expect, it } from 'vitest'
import { screeningState } from '../helpers/screening-state.ts'
import { isFinancialConfirmed, sessionReducer } from '../../src/frontend/state/session.ts'
import type { SessionAction, SessionState } from '../../src/frontend/state/session.ts'
import { resultBinding, selectResult } from '../../src/frontend/state/result.ts'
import { findingListAssessment } from '../../src/frontend/state/report.ts'

function finish(state: SessionState) {
  for (const step of ['tilstandsrapport', 'kontroller-funn', 'resultat'] as const) state = sessionReducer(state, { type: 'navigate', step })
  return state
}
function confirm(state: SessionState) { return sessionReducer(state, { type: 'confirm-financial' }) }

describe('Story 3.8 — ny resultatnavigasjon etter relevant finanskontroll', () => {
  it('BT-12 AC1/2: L-endring er historisk frem til bekreftelse og ny navigasjon, deretter full F2-fasit', () => {
    const before = screeningState()
    const old = before.resultSnapshot!
    let state = sessionReducer(before, { type: 'register-value', field: 'L', rawValue: '1400000' })
    expect(state.financial).toMatchObject({ P: { confirmed: true }, L: { confirmed: false }, D: { confirmed: true }, J: { confirmed: true }, Ymin: { confirmed: true } })
    expect(selectResult(state)).toMatchObject({ status: 'historical', changes: expect.arrayContaining([expect.objectContaining({ target: 'L' })]) })
    state = finish(state)
    expect(state.resultSnapshot).toBe(old)
    state = confirm(state)
    expect(selectResult(state).status).toBe('historical')
    state = finish(state)
    expect(selectResult(state).status).toBe('current')
    expect(state.resultSnapshot).not.toBe(old)
    expect(state.resultSnapshot!.binding).toEqual(resultBinding(state))
    expect(state.resultSnapshot!.binding.financialRevision).toBe(old.binding.financialRevision + 1)
    expect(state.resultSnapshot!.assessment).toMatchObject({ recommendation: 'Forkast', priority: 2,
      metrics: { grossYield: { value: { numerator: '1400000', denominator: '16000000' } }, noi: { value: { amount: '1000000' } },
        netYield: { value: { numerator: '1000000', denominator: '16000000' } }, cashFlowBeforeTax: { value: { amount: '200000' } } } })
    expect(state.report).toBe(before.report)
    expect(state.resultChanges).toEqual([])
    expect(old.assessment).toMatchObject({ recommendation: 'Gå videre', metrics: { noi: { value: { amount: '1500000' } } } })
  })

  it.each([
    ['P', '20000000', { grossYield: { value: { denominator: '20000000' } }, netYield: { value: { denominator: '20000000' } }, noi: { value: { amount: '1500000' } }, cashFlowBeforeTax: { value: { amount: '700000' } } }, 'Gå videre', 3, ['net-yield-requirement-met', 'cash-flow-nonnegative', 'technical-basis-sufficient']],
    ['D', '900000', { grossYield: { value: { numerator: '1900000' } }, netYield: { value: { numerator: '1000000' } }, noi: { value: { amount: '1000000' } }, cashFlowBeforeTax: { value: { amount: '200000' } } }, 'Forkast', 2, ['net-yield-below-minimum']],
    ['J', '1600000', { grossYield: { value: { numerator: '1900000' } }, netYield: { value: { numerator: '1500000' } }, noi: { value: { amount: '1500000' } }, cashFlowBeforeTax: { value: { amount: '-100000' } } }, 'Forkast', 2, ['negative-cash-flow']],
  ] as const)('AC2: %s fornyer alle avhengige tall fra gjeldende årsgrunnlag', (field, rawValue, metrics, recommendation, priority, codes) => {
    const before = screeningState()
    const after = finish(confirm(sessionReducer(before, { type: 'register-value', field, rawValue })))
    expect(selectResult(after).status).toBe('current')
    expect(after.resultSnapshot!.assessment.metrics).toMatchObject(metrics)
    expect(after.resultSnapshot!.assessment).toMatchObject({ recommendation, priority })
    expect(after.resultSnapshot!.assessment.triggers.map(trigger => trigger.code)).toEqual(codes)
    expect(after.report).toBe(before.report)
  })

  it('BT-13 AC3: manglende og ubekreftet Ymin blokkerer; bekreftet 10 % endrer screening uten tallendring', () => {
    const before = screeningState()
    let state = sessionReducer(before, { type: 'register-value', field: 'Ymin', rawValue: '' })
    const missing = sessionReducer(state, { type: 'calculate-result' })
    expect(missing.resultSnapshot!.assessment.recommendation).toBe('Innhent mer informasjon')
    expect(missing.resultSnapshot!.assessment.metrics).toEqual(before.resultSnapshot!.assessment.metrics)
    state = missing
    state = sessionReducer(state, { type: 'register-value', field: 'Ymin', rawValue: '10' })
    const unconfirmed = sessionReducer(state, { type: 'calculate-result' })
    expect(unconfirmed.resultSnapshot!.assessment.recommendation).toBe('Innhent mer informasjon')
    expect(unconfirmed.resultSnapshot!.assessment.metrics).toEqual(before.resultSnapshot!.assessment.metrics)
    expect(finish(state).resultSnapshot).toBe(missing.resultSnapshot)
    state = confirm(state)
    expect(selectResult(state).status).toBe('historical')
    expect(state.resultSnapshot).toBe(missing.resultSnapshot)
    state = finish(state)
    expect(selectResult(state).status).toBe('current')
    expect(state.resultSnapshot!.assessment.recommendation).toBe('Forkast')
    expect(state.resultSnapshot!.assessment.metrics).toEqual(before.resultSnapshot!.assessment.metrics)
    expect(state.resultSnapshot!.assessment.basis.financialBasis.values.Ymin).toMatchObject({ rawValue: '10', confirmed: true })
    expect(state.resultSnapshot).not.toBe(missing.resultSnapshot)
    expect(missing.resultSnapshot!.assessment.recommendation).toBe('Innhent mer informasjon')
  })

  const metadata: [string, (state: SessionState) => SessionAction][] = [
    ['periode', () => ({ type: 'register-period', field: 'L', period: 'month' })],
    ['år', () => ({ type: 'register-year', field: 'L', year: '2025' })],
    ['kilde', state => ({ type: 'register-source', field: 'L', source: { ...state.sources.L, description: 'Ny kontrollert kilde' } })],
    ['kostnadsinnhold', () => ({ type: 'change-cost', id: 'cost-1', update: { rawAmount: '150000', rawDebt: '30000' } })],
  ]
  it.each(metadata)('AC1/2: endret %s krever relevant bekreftelse før fornyelse', (_name, action) => {
    const before = screeningState({ costs: true })
    let state = sessionReducer(before, action(before))
    expect(isFinancialConfirmed(state)).toBe(false)
    expect(finish(state).resultSnapshot).toBe(before.resultSnapshot)
    // Endret år for L krever at de andre årsgrunnlagene gjøres sammenlignbare.
    if (_name === 'år') for (const field of ['D', 'J'] as const) state = sessionReducer(state, { type: 'register-year', field, year: '2025' })
    state = finish(confirm(state))
    expect(selectResult(state).status).toBe('current')
    expect(state.resultSnapshot!.binding).toEqual(resultBinding(state))
    expect(state.report).toBe(before.report)
    const metrics = state.resultSnapshot!.assessment.metrics
    if (_name === 'periode') {
      expect(metrics.grossYield.basis.inputs.find(input => input.field === 'L')).toMatchObject({
        registered: { rawValue: '1900000', period: 'month', year: '2026' },
        normalization: { factor: '12', annualValue: '22800000', year: '2026' },
      })
      expect(metrics).toMatchObject({ grossYield: { value: { numerator: '22800000', denominator: '16000000' } },
        noi: { value: { amount: '22400000' } }, netYield: { value: { numerator: '22400000', denominator: '16000000' } },
        cashFlowBeforeTax: { value: { amount: '21600000' } } })
    }
    if (_name === 'kostnadsinnhold') {
      expect(state.resultSnapshot!.assessment.basis.financialBasis).toMatchObject({
        costItems: [expect.objectContaining({ id: 'cost-1', rawAmount: '150000', rawDebt: '30000' }), expect.anything()],
        values: { D: { rawValue: '400000', confirmed: true }, J: { rawValue: '800000', confirmed: true } },
      })
      for (const metric of ['grossYield', 'noi', 'netYield', 'cashFlowBeforeTax'] as const) {
        expect(metrics[metric].value).toEqual(before.resultSnapshot!.assessment.metrics[metric].value)
      }
      expect(metrics.noi.basis.costBreakdown).toMatchObject({ D: '120000', J: '30000', annualD: '120000', annualJ: '30000',
        items: [expect.objectContaining({ id: 'cost-1', amount: '150000', D: '120000', J: '30000' }), expect.objectContaining({ status: 'included' })] })
      expect(before.resultSnapshot!.assessment.basis.financialBasis.costItems[0]).toMatchObject({ rawAmount: '120000', rawDebt: '20000' })
    }
  })

  it.each(['1400000', '3000000'])('AC4 F4: endret L=%s beholder uavklart TG3 som prioritet 1', rawValue => {
    let before = screeningState({ report: 'tg3' })
    before = sessionReducer(before, { type: 'report-tg3-register', generation: 1, findingId: 'F4-TG3-1', field: 'status', value: 'unresolved' })
    before = sessionReducer(before, { type: 'calculate-result' })
    const after = finish(confirm(sessionReducer(before, { type: 'register-value', field: 'L', rawValue })))
    expect(selectResult(after).status).toBe('current')
    expect(after.resultSnapshot!.assessment).toMatchObject({ priority: 1, recommendation: 'Innhent mer informasjon' })
    expect(after.resultSnapshot!.assessment.triggers.some(trigger => trigger.code.includes('tg3'))).toBe(true)
    expect(after.report).toBe(before.report)
    expect(after.resultSnapshot!.binding.tg3Revision).toBe(before.resultSnapshot!.binding.tg3Revision)
    expect(after.resultSnapshot!.assessment.metrics.grossYield.value).toMatchObject({ numerator: rawValue })
  })

  it('AC4: rapportfeil overlever finansberegning og åpner ikke en ny UI-port', () => {
    const before = screeningState({ report: 'error' })
    const edited = confirm(sessionReducer(before, { type: 'register-value', field: 'L', rawValue: '3000000' }))
    expect(finish(edited).resultSnapshot).toBe(before.resultSnapshot)
    const evaluated = sessionReducer(edited, { type: 'calculate-result' })
    expect(evaluated.resultSnapshot!.assessment).toMatchObject({ recommendation: 'Innhent mer informasjon', priority: 1 })
    expect(evaluated.report).toBe(before.report)
    expect(evaluated.report.error).toBe('analysis-failed')
  })

  it('AC4: gyldig separat TG3-avklaring gjenbrukes uendret etter finansfornyelse', () => {
    let before = screeningState({ report: 'tg3' })
    for (const [field, value] of [['status', 'resolved'], ['reason', 'Taket er kontrollert'], ['basis', 'Fagrapport T-42, 2026-10-22']] as const) {
      before = sessionReducer(before, { type: 'report-tg3-register', generation: 1, findingId: 'F4-TG3-1', field, value })
    }
    before = sessionReducer(before, { type: 'calculate-result' })
    expect(before.resultSnapshot!.assessment.recommendation).toBe('Gå videre')
    const after = finish(confirm(sessionReducer(before, { type: 'register-value', field: 'L', rawValue: '1400000' })))
    expect(selectResult(after).status).toBe('current')
    expect(after.report).toBe(before.report)
    expect(after.resultSnapshot!.assessment.recommendation).toBe('Forkast')
    expect(after.resultSnapshot!.binding.tg3Revision).toBe(before.resultSnapshot!.binding.tg3Revision)
  })

  it('AC5: ugyldig forsøk bevarer historisk snapshot; retting/bekreftelse gir nytt gjeldende resultat', () => {
    const before = screeningState()
    let state = confirm(sessionReducer(before, { type: 'register-value', field: 'L', rawValue: '-1' }))
    expect(isFinancialConfirmed(state)).toBe(false)
    expect(finish(state).resultSnapshot).toBe(before.resultSnapshot)
    state = finish(confirm(sessionReducer(state, { type: 'register-value', field: 'L', rawValue: '1400000' })))
    expect(selectResult(state).status).toBe('current')
    expect(state.resultSnapshot!.assessment.recommendation).toBe('Forkast')
    expect(state.report).toBe(before.report)
  })

  it('AC5: uendret retur og gjentatt bekreftelse beholder samme snapshot', () => {
    const before = screeningState()
    let state = sessionReducer(before, { type: 'navigate', step: 'tallgrunnlag' })
    state = sessionReducer(state, { type: 'register-value', field: 'L', rawValue: state.financial.L.rawValue })
    state = finish(confirm(state))
    expect(state.resultSnapshot).toBe(before.resultSnapshot)
    expect(selectResult(state).status).toBe('current')
    expect(state.financialRevision).toBe(before.financialRevision)
  })

  it.each([false, true])('review R1 AC5: gjenbekreftet nullkontroll ved identisk finansbinding, rapportendring=%s', reportChange => {
    let state = sessionReducer(screeningState(), { type: 'register-value', field: 'J', rawValue: '0' })
    state = sessionReducer(state, { type: 'check-zero', field: 'J', checked: true })
    state = finish(confirm(state))
    const before = state
    const snapshot = before.resultSnapshot!
    state = sessionReducer(state, { type: 'navigate', step: 'tallgrunnlag' })
    state = sessionReducer(state, { type: 'check-zero', field: 'J', checked: false })
    expect(selectResult(state).status).toBe('historical')
    expect(finish(state).resultSnapshot).toBe(snapshot)
    state = sessionReducer(state, { type: 'check-zero', field: 'J', checked: true })
    state = confirm(state)
    expect(isFinancialConfirmed(state)).toBe(true)
    expect(resultBinding(state)).toEqual(snapshot.binding)
    expect(selectResult(state).status).toBe('historical')
    if (reportChange) {
      state = sessionReducer(state, { type: 'report-finding-reject', generation: 1, findingId: 'F1-TG2-1' })
      state = sessionReducer(state, { type: 'report-list-confirm', generation: 1, reportHash: state.report.selected!.hash,
        documentName: state.report.selected!.file.name, listRevision: state.report.listRevision })
      expect(findingListAssessment(state.report).controlCompleted).toBe(true)
    }
    state = finish(state)
    if (reportChange) {
      expect(selectResult(state).status).toBe('historical')
      expect(state.resultSnapshot).toBe(snapshot)
      return
    }
    expect(selectResult(state).status).toBe('current')
    expect(state.resultSnapshot).not.toBe(snapshot)
    expect(state.resultSnapshot!.binding).toEqual(resultBinding(state))
    expect(state.resultChanges).toEqual([])
    expect(state.report).toBe(before.report)
    expect(snapshot.assessment.metrics.cashFlowBeforeTax.value).toMatchObject({ amount: '1500000' })
  })

  it.each(['tg3', 'funn', 'rapport'] as const)('scope: finansbekreftelse fornyer ikke resultat etter endret %s-binding (3.9)', kind => {
    const before = screeningState({ report: kind === 'tg3' ? 'tg3' : undefined })
    let state = before
    if (kind === 'tg3') state = sessionReducer(state, { type: 'report-tg3-register', generation: 1, findingId: 'F4-TG3-1', field: 'status', value: 'unresolved' })
    if (kind === 'funn') {
      state = sessionReducer(state, { type: 'report-finding-reject', generation: 1, findingId: 'F1-TG2-1' })
      state = sessionReducer(state, { type: 'report-list-confirm', generation: 1, reportHash: state.report.selected!.hash, documentName: state.report.selected!.file.name, listRevision: state.report.listRevision })
    }
    if (kind === 'rapport') state = sessionReducer(state, { type: 'report-error', generation: 1, code: 'analysis-failed' })
    state = finish(confirm(sessionReducer(state, { type: 'register-value', field: 'L', rawValue: '1400000' })))
    expect(selectResult(state).status).toBe('historical')
    expect(state.resultSnapshot).toBe(before.resultSnapshot)
  })
})
