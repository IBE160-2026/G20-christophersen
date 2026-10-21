import { describe, expect, it } from 'vitest'
import { bindAnalysisOutcome } from '../../src/contracts/analysis-validation.ts'
import { createReportState, findingListAssessment, reportDeficiencies, reportReducer } from '../../src/frontend/state/report.ts'
import type { ReportState } from '../../src/frontend/state/report.ts'
import { createInitialSession, isFinancialConfirmed, sessionReducer } from '../../src/frontend/state/session.ts'
import type { SessionState } from '../../src/frontend/state/session.ts'

const hash = 'a'.repeat(64)
const documentName = 'list.pdf'
const source = { documentName, reportHash: hash, pdfPage: 1 }
function completed(kind: 'empty' | 'tg2' | 'tg3' | 'uncertain' = 'tg2'): ReportState {
  const context = { contractVersion: '2' as const, extractionVersion: '1' as const, mode: 'demo' as const,
    requestId: 'request', reportHash: hash, documentName, pageCount: 1,
    pages: [{ pdfPage: 1, status: 'readable' as const, text: 'Original rapporttekst', reason: null }] }
  return { ...createReportState(), generation: 1, status: 'completed',
    selected: { file: new File(['%PDF original bytes'], documentName), bytes: new Uint8Array([1, 2, 3]), hash },
    outcome: bindAnalysisOutcome(context, { contractVersion: '2', extractionVersion: '1', status: 'completed',
      findings: kind === 'empty' ? [] : [{ findingId: 'roof', grade: kind === 'uncertain' ? '?' : kind === 'tg3' ? 'TG3' : 'TG2',
        description: 'Tak', source: kind === 'uncertain' ? null : source, uncertainties: kind === 'uncertain' ? ['Original usikkerhet'] : [] }], limitations: [] }) }
}
const confirm = (state: ReportState) => reportReducer(state, { type: 'report-list-confirm', generation: state.generation,
  reportHash: state.selected?.hash ?? '', documentName, listRevision: state.listRevision })
const finding = (state: ReportState, type: 'report-finding-confirm' | 'report-finding-edit' | 'report-finding-cancel' | 'report-finding-apply' | 'report-finding-reject') =>
  reportReducer(state, { type, generation: state.generation, findingId: 'roof' })
const tg3 = (state: ReportState, field: 'status' | 'reason' | 'basis', value: string) =>
  reportReducer(state, { type: 'report-tg3-register', generation: state.generation, findingId: 'roof', field, value })

function financialSession(report: ReportState): SessionState {
  let session = createInitialSession()
  for (const [field, rawValue] of [['P', '16000000'], ['L', '1900000'], ['D', '400000'], ['J', '800000'], ['Ymin', '7']] as const) {
    session = sessionReducer(session, { type: 'register-value', field, rawValue })
    session = sessionReducer(session, { type: 'register-source', field, source: { kind: 'assumption', description: `Kontrollert ${field}`, conflict: null } })
  }
  for (const field of ['L', 'D', 'J'] as const) {
    session = sessionReducer(session, { type: 'register-period', field, period: 'year' })
    session = sessionReducer(session, { type: 'register-year', field, year: '2026' })
  }
  session = sessionReducer(session, { type: 'register-rent-nature', rentNature: 'expected' })
  session = sessionReducer(session, { type: 'confirm-financial' })
  expect(isFinancialConfirmed(session)).toBe(true)
  return { ...session, report, currentStep: 'kontroller-funn' as const }
}

describe('Story 2.11 — separat bekreftelse av gjeldende liste', () => {
  it('AC1: analyse og enkeltfunn bekrefter aldri listen; separat handling binder revisjon og bevarer opphav', () => {
    const before = completed()
    expect(confirm(before)).toBe(before)
    const controlled = finding(before, 'report-finding-confirm')
    expect(controlled.listConfirmationRevision).toBeNull()
    expect(reportDeficiencies(controlled).status).toBe('information-required')
    const confirmed = confirm(controlled)
    expect(confirmed.listConfirmationRevision).toBe(confirmed.listRevision)
    expect(confirmed.outcome).toBe(before.outcome)
    expect(confirmed.selected).toBe(before.selected)
    expect(confirmed.findingControls).toBe(controlled.findingControls)
    expect(findingListAssessment(confirmed).controlCompleted).toBe(true)
    expect(reportDeficiencies(confirmed)).toMatchObject({ status: 'no-known-deficiencies', recommendation: null, priority: null, triggers: [] })
    expect(confirm(confirmed)).toBe(confirmed)
  })
  it('AC2 RT10: completed findings: [] krever eksplisitt kontroll, uten økonomisk anbefaling', () => {
    const before = completed('empty')
    expect(findingListAssessment(before)).toMatchObject({ canConfirm: true, confirmed: false, controlCompleted: false })
    expect(reportDeficiencies(before).status).toBe('information-required')
    expect(reportDeficiencies(confirm(before))).toMatchObject({ status: 'no-known-deficiencies', recommendation: null })
  })
  it.each(['missing', 'ready', 'analysing', 'failed'] as const)('AC2: %s blir aldri tilstrekkelig av en listehandling', status => {
    const state = { ...completed('empty'), status, outcome: null }
    expect(confirm(state)).toBe(state)
    expect(findingListAssessment(state)).toMatchObject({ canConfirm: false, confirmed: false, controlCompleted: false })
    expect(reportDeficiencies(state).status).toBe('information-required')
  })
  it('AC2 AT18: failed delresultat beholder feilårsak, mål, begrensning, usikkerhet og kjent alvorlig TG3', () => {
    const before = completed('tg3')
    const uncertain = completed('uncertain').outcome
    if (before.outcome?.status !== 'completed' || uncertain?.status !== 'completed') throw new Error('fixture')
    const state: ReportState = { ...before, status: 'failed', error: 'timeout', outcome: { ...before.outcome, status: 'failed',
      error: { kind: 'analysis', code: 'timeout', target: { kind: 'page', pdfPage: 1 }, reason: 'Kjent lokal årsak' },
      partialResult: { completeness: 'incomplete', findings: before.outcome.findings,
        uncertainCandidates: uncertain.uncertainCandidates.map(item => ({ ...item, findingId: 'wall' })), limitations: ['Delvis lest rapport'] } } }
    expect(confirm(state)).toBe(state)
    const reasons = reportDeficiencies(state).triggers.map(item => item.message).join(' ')
    for (const text of ['timeout', 'Kjent lokal årsak', 'PDF-side: 1', 'Delvis lest rapport', 'Original usikkerhet', 'roof: Tak', 'Alvorlig TG3 er uavklart']) expect(reasons).toContain(text)
    expect(reportDeficiencies(state)).toEqual(reportDeficiencies(state))
  })
  it('AC2: uløst kritisk usikkerhet kan ikke bekreftes; avvisning fjerner bare kandidatens mangel', () => {
    let state = completed('uncertain')
    if (state.outcome?.status !== 'completed') throw new Error('fixture')
    state = { ...state, outcome: { ...state.outcome, limitations: ['Selvstendig rapportbegrensning'] } }
    expect(confirm(state)).toBe(state)
    expect(finding(state, 'report-finding-confirm')).toBe(state)
    const rejected = finding(state, 'report-finding-reject')
    const confirmed = confirm(rejected)
    expect(findingListAssessment(confirmed).confirmed).toBe(true)
    expect(reportDeficiencies(confirmed).triggers).toHaveLength(1)
    expect(reportDeficiencies(confirmed).triggers[0]?.message).toContain('Selvstendig rapportbegrensning')
    expect(confirmed.outcome).toBe(state.outcome)
  })
  it('AC2: brukt korrigering og enkeltkontroll kan løse kandidat, mens originalen består', () => {
    const before = completed('uncertain')
    let state = finding(before, 'report-finding-edit')
    for (const [field, value] of [['grade', 'TG2'], ['pdfPage', '1']] as const) state = reportReducer(state, { type: 'report-finding-draft', generation: 1, findingId: 'roof', field, value })
    state = finding(state, 'report-finding-apply')
    expect(confirm(state)).toBe(state)
    state = confirm(finding(state, 'report-finding-confirm'))
    expect(reportDeficiencies(state).status).toBe('no-known-deficiencies')
    expect(state.outcome).toBe(before.outcome)
    expect(state.listConfirmationRevision).toBe(1)
  })
  it('AC3: listebekreftelse avklarer aldri TG3; eksplisitt Uavklart fullfører menneskelig kontroll', () => {
    let state = confirm(finding(completed('tg3'), 'report-finding-confirm'))
    expect(findingListAssessment(state)).toMatchObject({ confirmed: true, tg3Handled: false, controlCompleted: false })
    expect(state.tg3Resolutions).toEqual([])
    state = tg3(state, 'status', 'unresolved')
    expect(findingListAssessment(state)).toMatchObject({ confirmed: true, tg3Handled: true, controlCompleted: true })
    expect(reportDeficiencies(state)).toMatchObject({ recommendation: 'Innhent mer informasjon', priority: 1 })
    expect(reportDeficiencies(state).triggers).toHaveLength(1)
    expect(reportDeficiencies(state).triggers[0]?.code).toBe('unresolved-tg3')
    expect(state.listConfirmationRevision).toBe(0)
  })
  it('AC3/4: ugyldig Avklart er ikke håndtert; separat status/tekst bevarer listebekreftelsen', () => {
    let state = confirm(finding(completed('tg3'), 'report-finding-confirm'))
    state = tg3(state, 'status', 'resolved')
    state = tg3(state, 'reason', '  ')
    state = tg3(state, 'basis', 'Elektriker ref 42')
    expect(findingListAssessment(state).controlCompleted).toBe(false)
    expect(state.listConfirmationRevision).toBe(0)
    state = tg3(state, 'reason', 'Kontrollert for førstevurdering')
    expect(findingListAssessment(state).controlCompleted).toBe(true)
    expect(reportDeficiencies(state).status).toBe('no-known-deficiencies')
  })
  it.each([['description', 'Et annet alvorlig takforhold'], ['pdfPage', '2']] as const)('AC3/4: gammel Uavklart-binding fullfører ikke kontrollen etter endret %s og ny listebekreftelse', (field, value) => {
    const before = completed('tg3')
    if (before.outcome?.status !== 'completed') throw new Error('fixture')
    let state: ReportState = { ...before, outcome: { ...before.outcome, pageCount: 2 } }
    const outcome = state.outcome
    state = tg3(confirm(finding(state, 'report-finding-confirm')), 'status', 'unresolved')
    expect(findingListAssessment(state).controlCompleted).toBe(true)
    const registration = state.tg3Resolutions
    state = finding(state, 'report-finding-edit')
    state = reportReducer(state, { type: 'report-finding-draft', generation: 1, findingId: 'roof', field, value })
    state = confirm(finding(finding(state, 'report-finding-apply'), 'report-finding-confirm'))
    expect(state.tg3Resolutions).toBe(registration)
    expect(findingListAssessment(state)).toMatchObject({ confirmed: true, tg3Handled: false, controlCompleted: false })
    expect(reportDeficiencies(state).triggers[0]?.message).toContain('annet eller ukjent rapportgrunnlag')
    state = tg3(state, 'status', 'unresolved')
    expect(findingListAssessment(state)).toMatchObject({ confirmed: true, tg3Handled: true, controlCompleted: true })
    expect(reportDeficiencies(state).recommendation).toBe('Innhent mer informasjon')
    expect(state.outcome).toBe(outcome)
  })
  it.each(['report-finding-apply', 'report-finding-reject'] as const)('AC4 RT11/12: %s opphever listebekreftelsen og gammel revisjon ignoreres', type => {
    const confirmed = confirm(finding(completed(), 'report-finding-confirm'))
    const edited = finding(confirmed, 'report-finding-edit')
    const changed = finding(edited, type)
    expect(changed.listConfirmationRevision).toBeNull()
    expect(changed.listRevision).toBe(1)
    expect(changed.outcome).toBe(confirmed.outcome)
    expect(reportReducer(changed, { type: 'report-list-confirm', generation: 1, reportHash: hash, documentName, listRevision: 0 })).toBe(changed)
    if (type === 'report-finding-apply') expect(confirm(changed)).toBe(changed)
    const recontrolled = type === 'report-finding-apply' ? finding(changed, 'report-finding-confirm') : changed
    expect(confirm(recontrolled).listConfirmationRevision).toBe(1)
  })
  it('AC4 RT13/14/19: ubrukt utkast, Avbryt og uendret retur bevarer liste- og finansgrunnlag', () => {
    const confirmed = confirm(finding(completed(), 'report-finding-confirm'))
    const draft = finding(confirmed, 'report-finding-edit')
    expect(findingListAssessment(draft).confirmed).toBe(true)
    const cancelled = finding(draft, 'report-finding-cancel')
    expect(cancelled.listConfirmationRevision).toBe(0)
    const session = financialSession(cancelled)
    const returned = sessionReducer(session, { type: 'navigate', step: 'tallgrunnlag' })
    expect(returned.report).toBe(cancelled)
    expect(returned.financial).toBe(session.financial)
    expect(returned.financialRevision).toBe(session.financialRevision)
    expect(isFinancialConfirmed(returned)).toBe(true)
    expect(returned.report.outcome).toBe(confirmed.outcome)
  })
  it('AC4 RT19: ekte listehandling etter separat TG3-endring bevarer faktisk bekreftet finans og liste', () => {
    const original = financialSession(confirm(finding(completed('tg3'), 'report-finding-confirm')))
    let session = original
    for (const [field, value] of [['status', 'unresolved'], ['status', 'resolved'], ['reason', 'Kontrollert for førstevurdering'], ['basis', 'Takrapport ref T-42']] as const) {
      session = sessionReducer(session, { type: 'report-tg3-register', generation: 1, findingId: 'roof', field, value })
      session = sessionReducer(session, { type: 'report-list-confirm', generation: 1, reportHash: hash, documentName, listRevision: 0 })
      expect(isFinancialConfirmed(session)).toBe(true)
      expect(session.financial).toBe(original.financial)
      expect(session.financialRevision).toBe(original.financialRevision)
      expect(session.report.listConfirmationRevision).toBe(0)
      expect(session.report.findingControls).toBe(original.report.findingControls)
    }
    expect(findingListAssessment(session.report).controlCompleted).toBe(true)
  })
  it('AC4: feil identitet, gammel generasjon og rapportbytte ignorerer listehandlinger', () => {
    const state = finding(completed(), 'report-finding-confirm')
    const action = { type: 'report-list-confirm' as const, generation: 1, reportHash: hash, documentName, listRevision: 0 }
    for (const update of [{ generation: 0 }, { reportHash: 'b'.repeat(64) }, { documentName: 'other.pdf' }, { listRevision: 42 }]) expect(reportReducer(state, { ...action, ...update })).toBe(state)
    const replaced = reportReducer(confirm(state), { type: 'report-selecting', generation: 2 })
    expect(replaced.listConfirmationRevision).toBeNull()
    expect(reportReducer(replaced, action)).toBe(replaced)
    const mismatched = { ...state, selected: { ...state.selected!, hash: 'b'.repeat(64) } }
    expect(confirm(mismatched)).toBe(mismatched)
    expect(reportDeficiencies(mismatched).status).toBe('information-required')
  })
})
