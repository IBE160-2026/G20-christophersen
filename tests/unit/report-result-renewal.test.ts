import { describe, expect, it } from 'vitest'
import { screeningState } from '../helpers/screening-state.ts'
import { sessionReducer } from '../../src/frontend/state/session.ts'
import type { SessionState } from '../../src/frontend/state/session.ts'
import { calculateResultSnapshot, resultBinding, selectResult } from '../../src/frontend/state/result.ts'
import { currentFinding, findingListAssessment } from '../../src/frontend/state/report.ts'
import type { Tg3Field } from '../../src/contracts/tg3-resolution.ts'

const tg3Id = 'F4-TG3-1'
const navigate = (state: SessionState) => sessionReducer(state, { type: 'navigate', step: 'resultat' })
const finding = (state: SessionState, type: 'report-finding-edit' | 'report-finding-apply' | 'report-finding-confirm' | 'report-finding-reject' | 'report-finding-cancel', findingId = 'F1-TG2-1') =>
  sessionReducer(state, { type, generation: state.report.generation, findingId })
const register = (state: SessionState, field: Tg3Field, value: string) => sessionReducer(state,
  { type: 'report-tg3-register', generation: state.report.generation, findingId: tg3Id, field, value })
const list = (state: SessionState) => sessionReducer(state, { type: 'report-list-confirm', generation: state.report.generation,
  reportHash: state.report.selected!.hash, documentName: state.report.selected!.file.name, listRevision: state.report.listRevision })
function tg3(resolved = false, values: { L?: string } = {}) {
  return screeningState({ report: 'tg3', values, beforeCalculation: state => {
    state = register(state, 'status', resolved ? 'resolved' : 'unresolved')
    if (resolved) {
      state = register(state, 'reason', 'Takforholdet er tilstrekkelig undersøkt for førstevurdering')
      state = register(state, 'basis', 'Fagrapport T-42 datert 2026-10-22')
    }
    return state
  } })
}
function draft(state: SessionState, findingId: string, field: 'description' | 'pdfPage', value: string) {
  state = finding(state, 'report-finding-edit', findingId)
  return sessionReducer(state, { type: 'report-finding-draft', generation: state.report.generation, findingId, field, value })
}
function expectRenewed(state: SessionState, before: SessionState) {
  expect(selectResult(state).status).toBe('current')
  expect(state.resultSnapshot).not.toBe(before.resultSnapshot)
  expect(state.resultSnapshot!.binding).toEqual(resultBinding(state))
  expect(state.resultChanges).toEqual([])
  expect(state.resultSnapshot!.assessment.metrics).toEqual(before.resultSnapshot!.assessment.metrics)
  expect(state.financial).toBe(before.financial)
}

describe('Story 3.9 — rapportkontroll og separat TG3-fornyelse', () => {
  it('AC1: ubrukt utkast overlever funn-/trinnbytte; Resultat og Avbryt beholder gjeldende snapshot', () => {
    const before = screeningState()
    let state = draft(before, 'F1-TG2-1', 'description', 'Ubrukt retting')
    state = sessionReducer(state, { type: 'report-view', generation: 1, view: { findingId: null, pdfPage: 1, zoom: 2 } })
    for (const step of ['tallgrunnlag', 'tilstandsrapport', 'kontroller-funn', 'resultat'] as const) state = sessionReducer(state, { type: 'navigate', step })
    expect(selectResult(state)).toMatchObject({ status: 'current', unusedDraftFindingIds: ['F1-TG2-1'] })
    expect(state.resultSnapshot).toBe(before.resultSnapshot)
    expect(state.report.findingControls[0]!.draft?.description).toBe('Ubrukt retting')
    expect(findingListAssessment(state.report).controlCompleted).toBe(true)
    state = navigate(finding(state, 'report-finding-cancel'))
    expect(state.resultSnapshot).toBe(before.resultSnapshot)
    expect(selectResult(state)).toMatchObject({ status: 'current', unusedDraftFindingIds: [] })
    expect(state.report.outcome).toBe(before.report.outcome)
  })

  it('AC2/6: ugyldig Bruk bevarer grunnlaget; gyldig Bruk krever både funnkontroll og listebekreftelse før nytt snapshot', () => {
    const before = screeningState()
    const oldJson = JSON.stringify(before.resultSnapshot)
    let state = finding(draft(before, 'F1-TG2-1', 'pdfPage', '999'), 'report-finding-apply')
    expect(state.report.findingControls[0]!.errors.pdfPage).toBeTruthy()
    expect(navigate(state).resultSnapshot).toBe(before.resultSnapshot)
    expect(selectResult(state).status).toBe('current')
    state = sessionReducer(state, { type: 'report-finding-draft', generation: 1, findingId: 'F1-TG2-1', field: 'pdfPage', value: '3' })
    state = finding(state, 'report-finding-apply')
    expect(selectResult(state).status).toBe('historical')
    expect(state.report.listConfirmationRevision).toBeNull()
    expect(navigate(list(state)).resultSnapshot).toBe(before.resultSnapshot)
    state = finding(state, 'report-finding-confirm')
    expect(navigate(state).resultSnapshot).toBe(before.resultSnapshot)
    state = navigate(list(state))
    expectRenewed(state, before)
    const basis = state.resultSnapshot!.assessment.basis.reportBasis
    expect(basis.controls[0]).toMatchObject({ revision: 1, confirmedRevision: 1, correction: { source: { pdfPage: 3 } }, draft: null })
    expect(basis.listConfirmationRevision).toBe(basis.listRevision)
    expect(basis.outcome).toEqual(before.report.outcome)
    expect(state.resultSnapshot!.assessment.recommendation).toBe('Gå videre')
    expect(JSON.stringify(before.resultSnapshot)).toBe(oldJson)
  })

  it('AC2: avvist TG3 er inaktiv original, ikke teknisk avklaring; ny listebekreftelse fornyer resultat', () => {
    const before = tg3()
    let state = finding(before, 'report-finding-reject', tg3Id)
    expect(selectResult(state).status).toBe('historical')
    expect(navigate(state).resultSnapshot).toBe(before.resultSnapshot)
    state = navigate(list(state))
    expectRenewed(state, before)
    expect(state.resultSnapshot!.assessment).toMatchObject({ priority: 3, recommendation: 'Gå videre' })
    expect(state.resultSnapshot!.assessment.basis.reportBasis).toMatchObject({ tg3Findings: [], controls: expect.arrayContaining([expect.objectContaining({ findingId: tg3Id, rejection: { revision: 1 } })]) })
    expect(state.report.tg3Resolutions).toBe(before.report.tg3Resolutions)
    expect(state.report.tg3Resolutions[0]!.resolution.status).toBe('unresolved')
    expect(state.report.outcome).toBe(before.report.outcome)
    expect(before.resultSnapshot!.assessment.recommendation).toBe('Innhent mer informasjon')
  })

  it.each([
    ['status', 'unresolved', 'Innhent mer informasjon', 1],
    ['reason', 'Ny begrunnelse for samme kontrollerte takforhold', 'Gå videre', 3],
    ['basis', 'Ny konkret fagrapport T-43', 'Gå videre', 3],
  ] as const)('AC3/6 FR5-1/2/7: endret %s bevarer kontroll og fornyer bare ved resultatnavigasjon', (field, value, recommendation, priority) => {
    const before = tg3(true)
    const oldJson = JSON.stringify(before.resultSnapshot)
    let state = register(before, field, value)
    expect(selectResult(state)).toMatchObject({ status: 'historical', changes: expect.arrayContaining([expect.objectContaining({ kind: 'tg3', target: tg3Id })]) })
    expect(state.report.findingControls).toBe(before.report.findingControls)
    expect(state.report.listConfirmationRevision).toBe(before.report.listConfirmationRevision)
    expect(state.report.outcome).toBe(before.report.outcome)
    expect(state.report.tg3Revision).toBe(before.report.tg3Revision + 1)
    state = navigate(state)
    expectRenewed(state, before)
    expect(state.resultSnapshot!.assessment).toMatchObject({ recommendation, priority })
    expect(state.resultSnapshot!.assessment.basis.reportBasis.tg3Findings[0]!.resolution?.[field]).toBe(value)
    expect(JSON.stringify(before.resultSnapshot)).toBe(oldJson)
  })

  it.each([['reason', ' '], ['basis', '\t'], ['status', 'unknown'], ['status', '']] as const)('AC3 FR5-3/4/7: ugyldig %s=%j er prioritet 1 og bevarer historisk snapshot frem til relevant håndtering', (field, value) => {
    const before = tg3(true)
    let state = register(before, field, value)
    expect(findingListAssessment(state.report)).toMatchObject({ confirmed: true, controlCompleted: false })
    expect(navigate(state).resultSnapshot).toBe(before.resultSnapshot)
    const assessment = calculateResultSnapshot(state).assessment
    expect(assessment).toMatchObject({ recommendation: 'Innhent mer informasjon', priority: 1 })
    expect(assessment.triggers[0]!.message).toContain(tg3Id)
    state = navigate(register(state, 'status', 'unresolved'))
    expectRenewed(state, before)
    expect(state.resultSnapshot!.assessment.recommendation).toBe('Innhent mer informasjon')
  })

  it.each([['1900000', 'Gå videre', 3], ['1400000', 'Forkast', 2]] as const)('AC3 FR5-6: gyldig Avklart gir økonomiavhengig utfall ved L=%s', (L, recommendation, priority) => {
    const before = tg3(false, { L })
    let state = register(before, 'status', 'resolved')
    state = register(state, 'reason', 'Tilstrekkelig undersøkt')
    state = register(state, 'basis', 'Fagrapport T-42')
    state = navigate(state)
    expectRenewed(state, before)
    expect(state.resultSnapshot!.assessment).toMatchObject({ recommendation, priority })
    expect(currentFinding(state.report, tg3Id)?.grade).toBe('TG3')
  })

  it.each([
    ['description', ' Alvorlig  lekkasje i tak ', true],
    ['description', 'Elektrisk anlegg ikke dokumentert', false],
    ['description', 'Bedre formulering uten kjent forholdsbevis', false],
    ['pdfPage', '2', false],
  ] as const)('AC4: korrigert %s=%j bruker felles forholdsvalidering, anvendbar=%s', (field, value, applicable) => {
    const before = tg3(true)
    let state = finding(draft(before, tg3Id, field, value), 'report-finding-apply', tg3Id)
    state = list(finding(state, 'report-finding-confirm', tg3Id))
    expect(state.report.tg3Resolutions).toBe(before.report.tg3Resolutions)
    expect(findingListAssessment(state.report).controlCompleted).toBe(applicable)
    expect(calculateResultSnapshot(state).assessment.recommendation).toBe(applicable ? 'Gå videre' : 'Innhent mer informasjon')
    if (!applicable) {
      expect(navigate(state).resultSnapshot).toBe(before.resultSnapshot)
      state = register(state, 'reason', 'Tekst alene overfører ikke tidligere forholdsbinding')
      expect(findingListAssessment(state.report).controlCompleted).toBe(false)
      state = register(state, 'status', 'unresolved')
    }
    state = navigate(state)
    expectRenewed(state, before)
    expect(state.resultSnapshot!.assessment.recommendation).toBe(applicable ? 'Gå videre' : 'Innhent mer informasjon')
    expect(state.resultSnapshot!.assessment.basis.reportBasis.controls.find(control => control.findingId === tg3Id)!.correction)
      .toEqual(state.report.findingControls.find(control => control.findingId === tg3Id)!.correction)
    expect(state.report.outcome).toBe(before.report.outcome)
  })

  it.each([false, true])('AC5/6: ny rapport med feil=%s ignorerer gammelt/sent svar og bruker bare nytt kontrollert grunnlag', failed => {
    const before = tg3(true)
    const replacement = screeningState()
    const pending = { sessionId: 'new-session', requestId: 'abandoned-report', generation: 2 }
    const correlation = { ...pending, requestId: 'new-report', generation: 3 }
    let state = sessionReducer(before, { type: 'report-selecting', generation: 2 })
    expect(selectResult(state).status).toBe('historical')
    expect(state.report.findingControls).toEqual([])
    expect(state.report.tg3Resolutions).toEqual([])
    state = sessionReducer(state, { type: 'report-selected', generation: 2, selected: replacement.report.selected! })
    expect(navigate(state).resultSnapshot).toBe(before.resultSnapshot)
    state = sessionReducer(state, { type: 'report-start', correlation: pending })
    // Et faktisk pågående generasjon-2-forløp erstattes før svar. Svaret
    // leveres direkte etterpå, uavhengig av om en nettverksabort lykkes.
    state = sessionReducer(state, { type: 'report-selecting', generation: 3 })
    state = sessionReducer(state, { type: 'report-selected', generation: 3, selected: replacement.report.selected! })
    state = sessionReducer(state, { type: 'report-start', correlation })
    const active = state.report
    state = sessionReducer(state, { type: 'report-response', correlation: pending, ok: true,
      body: { kind: 'analysis', correlation: pending, outcome: { ...replacement.report.outcome!, requestId: pending.requestId } } })
    state = sessionReducer(state, { type: 'report-error', generation: 2, code: 'transport-failure' })
    expect(state.report).toBe(active)
    if (failed) {
      state = sessionReducer(state, { type: 'report-error', generation: 3, code: 'analysis-failed' })
      expect(navigate(state).resultSnapshot).toBe(before.resultSnapshot)
      expect(calculateResultSnapshot(state).assessment).toMatchObject({ recommendation: 'Innhent mer informasjon', priority: 1 })
      expect(state.report.error).toBe('analysis-failed')
      return
    }
    const outcome = { ...replacement.report.outcome!, requestId: correlation.requestId }
    state = sessionReducer(state, { type: 'report-response', correlation, ok: true, body: { kind: 'analysis', correlation, outcome } })
    expect(navigate(state).resultSnapshot).toBe(before.resultSnapshot)
    state = navigate(list(finding(state, 'report-finding-confirm')))
    expectRenewed(state, before)
    expect(state.resultSnapshot!.binding.report).toMatchObject({ generation: 3, requestId: 'new-report', reportHash: replacement.report.selected!.hash })
    expect(state.resultSnapshot!.assessment.basis.reportBasis).toMatchObject({ tg3Findings: [], reportIdentity: { documentName: 'F1-tilstandsrapport.pdf' } })
    expect(state.resultSnapshot!.assessment.recommendation).toBe('Gå videre')
  })
})
