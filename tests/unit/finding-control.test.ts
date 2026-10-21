import { describe, expect, it } from 'vitest'
import { bindAnalysisOutcome } from '../../src/contracts/analysis-validation.ts'
import { validateFindingCorrection } from '../../src/domain/finding-control.ts'
import { createReportState, currentFinding, reportDeficiencies, reportReducer } from '../../src/frontend/state/report.ts'
import type { ReportState } from '../../src/frontend/state/report.ts'
import { createInitialSession, sessionReducer } from '../../src/frontend/state/session.ts'

const hash = 'a'.repeat(64)
const context = { contractVersion: '2' as const, extractionVersion: '1' as const, mode: 'demo' as const,
  requestId: 'request', reportHash: hash, documentName: 'rt11.pdf', pageCount: 5 }
const original = { findingId: 'rt11', grade: 'TG3', description: 'Feil uttrekk av tak', source: { documentName: 'rt11.pdf', reportHash: hash, pdfPage: 4 }, uncertainties: [] }
function completed(uncertain = false): ReportState {
  return { ...createReportState(), generation: 1, status: 'completed',
    selected: { file: new File(['%PDF'], 'rt11.pdf'), bytes: new Uint8Array(), hash },
    outcome: bindAnalysisOutcome({ ...context, pages: Array.from({ length: 5 }, (_, index) => ({ pdfPage: index + 1, text: 'Originaltekst', status: 'readable' as const, reason: null })) },
      { contractVersion: '2', extractionVersion: '1', status: 'completed', findings: [uncertain ? { ...original, grade: '?', source: null } : original], limitations: [] }) }
}
function act(state: ReportState, type: 'report-finding-edit' | 'report-finding-apply' | 'report-finding-cancel' | 'report-finding-confirm') {
  return reportReducer(state, { type, generation: 1, findingId: 'rt11' })
}
function edit(state: ReportState, field: 'grade' | 'description' | 'pdfPage', value: string) {
  return reportReducer(state, { type: 'report-finding-draft', generation: 1, findingId: 'rt11', field, value })
}
function draft(state = completed()) {
  state = act(state, 'report-finding-edit')
  state = edit(state, 'grade', 'TG2')
  state = edit(state, 'description', 'Slitt takoverflate')
  return edit(state, 'pdfPage', '5')
}

describe('Story 2.8 — kontroll, utkast og immutabel original', () => {
  it('AC1: Bekreft binder gjeldende enkeltfunn og kilde uten original-/liste-/TG3-endring', () => {
    const before = completed()
    const originalJson = JSON.stringify(before.outcome)
    const confirmed = act(before, 'report-finding-confirm')
    expect(confirmed.findingControls[0]).toMatchObject({ confirmedRevision: 0, revision: 0, correction: null, draft: null })
    expect(confirmed.outcome).toBe(before.outcome)
    expect(JSON.stringify(confirmed.outcome)).toBe(originalJson)
    expect(currentFinding(confirmed, 'rt11')).toEqual(currentFinding(before, 'rt11'))
    expect(confirmed.listConfirmationRevision).toBeNull()
    expect(confirmed.listRevision).toBe(0)
    expect(act(confirmed, 'report-finding-confirm')).toBe(confirmed)
  })
  it('AC2: separate utkast endrer verken gjeldende versjon, revisjon eller bekreftelser', () => {
    const confirmed = { ...act(completed(), 'report-finding-confirm'), listConfirmationRevision: 0 }
    const state = draft(confirmed)
    expect(currentFinding(state, 'rt11')).toMatchObject({ grade: 'TG3', source: { pdfPage: 4 } })
    expect(state.findingControls[0]).toMatchObject({ draft: { grade: 'TG2', pdfPage: '5' }, confirmedRevision: 0 })
    expect(state.listRevision).toBe(0)
    expect(state.listConfirmationRevision).toBe(0)
    expect(state.outcome).toBe(confirmed.outcome)
  })
  it('AC2: funnbytte og økt-/trinnretur bevarer utkast og grunnlag', () => {
    const state = draft()
    const moved = reportReducer(state, { type: 'report-view', generation: 1, view: { findingId: 'annet', pdfPage: 2, zoom: 1.5 } })
    expect(moved.findingControls).toBe(state.findingControls)
    const session = sessionReducer({ ...createInitialSession(), report: moved }, { type: 'navigate', step: 'tallgrunnlag' })
    expect(session.report).toBe(moved)
    expect(session.report.listRevision).toBe(0)
    expect(session.report.findingControls[0]?.draft).toEqual(state.findingControls[0]?.draft)
  })
  it('AC3 RT-11: Bruk endrer bare gjeldende versjon, opphever bekreftelser og følger fysisk side', () => {
    const before = { ...act(completed(), 'report-finding-confirm'), listConfirmationRevision: 0, view: { findingId: 'rt11', pdfPage: 4, zoom: 1 } }
    const state = act(draft(before), 'report-finding-apply')
    expect(state.outcome).toBe(before.outcome)
    expect(currentFinding(state, 'rt11')).toEqual({ findingId: 'rt11', grade: 'TG2', description: 'Slitt takoverflate', source: { documentName: 'rt11.pdf', reportHash: hash, pdfPage: 5 } })
    expect(state.findingControls[0]).toMatchObject({ revision: 1, draft: null, confirmedRevision: null })
    expect(state.listConfirmationRevision).toBeNull()
    expect(state.listRevision).toBe(1)
    expect(state.view.pdfPage).toBe(5)
    expect(act(state, 'report-finding-confirm').findingControls[0]?.confirmedRevision).toBe(1)
  })
  it('AC4: Avbryt beholder brukt retting, status og revisjoner; neste utkast starter fra gjeldende', () => {
    const applied = act(draft(), 'report-finding-apply')
    const confirmed = { ...act(applied, 'report-finding-confirm'), listConfirmationRevision: 1 }
    let state = act(confirmed, 'report-finding-edit')
    expect(state.findingControls[0]?.draft).toEqual({ grade: 'TG2', description: 'Slitt takoverflate', pdfPage: '5' })
    state = edit(state, 'grade', 'TG3')
    state = act(state, 'report-finding-cancel')
    expect(currentFinding(state, 'rt11')).toEqual(currentFinding(confirmed, 'rt11'))
    expect(state.findingControls[0]).toMatchObject({ draft: null, confirmedRevision: 1, revision: 1 })
    expect(state.listRevision).toBe(1)
    expect(state.listConfirmationRevision).toBe(1)
    expect(state.outcome).toBe(confirmed.outcome)
  })
  it.each(['', '0', '-1', '6', '1.5', 'fem', '1e0', '999999999999999999999999'])('AC4: ugyldig fysisk side %j gir konkret mangel uten mutasjon/gjetting', value => {
    const before = { ...act(completed(), 'report-finding-confirm'), listConfirmationRevision: 0 }
    const state = act(edit(draft(before), 'pdfPage', value), 'report-finding-apply')
    expect(state.findingControls[0]?.errors.pdfPage).toContain('fysisk PDF-side')
    expect(state.findingControls[0]?.draft?.pdfPage).toBe(value)
    expect(state.findingControls[0]?.confirmedRevision).toBe(0)
    expect(state.listConfirmationRevision).toBe(0)
    expect(state.listRevision).toBe(0)
    expect(currentFinding(state, 'rt11')).toEqual(currentFinding(before, 'rt11'))
  })
  it('ukjent grad og kilde blir ikke gjettet; usikkert funn kan ikke bekreftes før gyldig bruk', () => {
    const before = completed(true)
    expect(act(before, 'report-finding-confirm')).toBe(before)
    const initial = act(before, 'report-finding-edit')
    expect(initial.findingControls[0]?.draft).toMatchObject({ grade: '', pdfPage: '' })
    const invalid = act(initial, 'report-finding-apply')
    expect(invalid.findingControls[0]?.errors).toHaveProperty('grade')
    expect(invalid.findingControls[0]?.errors).toHaveProperty('pdfPage')
    expect(currentFinding(invalid, 'rt11')).toBeNull()
    const applied = act(draft(invalid), 'report-finding-apply')
    expect(currentFinding(applied, 'rt11')?.grade).toBe('TG2')
    expect(applied.outcome).toBe(before.outcome)
    expect(reportDeficiencies(applied).triggers).toHaveLength(1)
    expect(reportDeficiencies(before).triggers.length).toBeGreaterThan(1)
  })
  it('tom beskrivelse og ugyldig rapportidentitet gir separate felt-/kildemangler', () => {
    const state = act(edit(draft(), 'description', '  '), 'report-finding-apply')
    expect(state.findingControls[0]?.errors.description).toBeTruthy()
    expect(state.listRevision).toBe(0)
    expect(validateFindingCorrection({ grade: 'TG2', description: 'Tak', pdfPage: '5' }, { ...context, reportHash: '' }).errors.source).toBeTruthy()
  })
  it('rapportbytte nullstiller kontroller og ignorerer alle gamle/ukjente handlinger', () => {
    const applied = act(draft(), 'report-finding-apply')
    const replacement = reportReducer(applied, { type: 'report-selecting', generation: 2 })
    expect(replacement.findingControls).toEqual([])
    expect(replacement.listRevision).toBe(0)
    const actions = (['report-finding-edit', 'report-finding-confirm', 'report-finding-apply', 'report-finding-cancel'] as const).map(type => ({ type, generation: 1, findingId: 'rt11' }))
    for (const action of actions) {
      expect(reportReducer(replacement, action)).toBe(replacement)
      expect(reportReducer(applied, { ...action, findingId: 'ukjent' })).toBe(applied)
    }
    expect(reportReducer(applied, { type: 'report-finding-confirm', generation: 0, findingId: 'rt11' })).toBe(applied)
  })
  it('uavhengig review: identifiserte feil består til de respektive feltene er rettet', () => {
    let state = act(edit(edit(edit(draft(), 'grade', ''), 'description', ' '), 'pdfPage', '99'), 'report-finding-apply')
    state = edit(state, 'grade', 'TG2')
    expect(state.findingControls[0]?.errors).toHaveProperty('description')
    expect(state.findingControls[0]?.errors).toHaveProperty('pdfPage')
    expect(state.findingControls[0]?.errors).not.toHaveProperty('grade')
    state = edit(state, 'pdfPage', '88')
    expect(state.findingControls[0]?.errors).toHaveProperty('pdfPage')
    state = edit(state, 'pdfPage', '5')
    expect(state.findingControls[0]?.errors).not.toHaveProperty('pdfPage')
    expect(state.findingControls[0]?.errors).toHaveProperty('description')
    expect(state.listRevision).toBe(0)
  })
  it('uavhengig review: B-handlinger bevarer As brukte korrigering, bekreftelse og nye utkast', () => {
    let state = completed()
    const outcome = state.outcome
    if (outcome?.status !== 'completed') throw new Error('test fixture')
    const other = { ...outcome.findings[0]!, findingId: 'other', original: { ...outcome.findings[0]!.original, findingId: 'other' } }
    state = { ...state, outcome: { ...outcome, findings: [...outcome.findings, other] } }
    state = act(act(draft(state), 'report-finding-apply'), 'report-finding-confirm')
    state = edit(act(state, 'report-finding-edit'), 'description', 'Ubrukt andreutkast')
    const a = state.findingControls.find(item => item.findingId === 'rt11')
    for (const type of ['report-finding-edit', 'report-finding-apply', 'report-finding-confirm', 'report-finding-edit', 'report-finding-cancel'] as const) {
      state = reportReducer(state, { type, generation: 1, findingId: 'other' })
      expect(state.findingControls.find(item => item.findingId === 'rt11')).toBe(a)
      expect(currentFinding(state, 'rt11')).toMatchObject({ grade: 'TG2', source: { pdfPage: 5 } })
    }
  })
  it('uavhengig review: ny brukt retting opphever nyere bekreftelser og bevarer første original', () => {
    const before = completed()
    let state = act(act(draft(before), 'report-finding-apply'), 'report-finding-confirm')
    state = { ...state, listConfirmationRevision: 1 }
    state = edit(act(state, 'report-finding-edit'), 'pdfPage', '2')
    state = edit(state, 'description', 'Ny kontrollert representasjon')
    state = act(state, 'report-finding-apply')
    expect(currentFinding(state, 'rt11')).toMatchObject({ source: { pdfPage: 2 }, description: 'Ny kontrollert representasjon' })
    expect(state.findingControls[0]).toMatchObject({ revision: 2, confirmedRevision: null, draft: null })
    expect(state.listRevision).toBe(2)
    expect(state.listConfirmationRevision).toBeNull()
    expect(state.outcome).toBe(before.outcome)
  })
  it.each(['documentName', 'reportHash'] as const)('uavhengig review: mismatchet original %s beholdes som opphav gjennom eksplisitt retting', field => {
    const before = completed()
    const outcome = bindAnalysisOutcome({ ...context, pages: Array.from({ length: 5 }, (_, i) => ({ pdfPage: i + 1, text: 'Rapport', status: 'readable', reason: null })) },
      { contractVersion: '2', extractionVersion: '1', status: 'completed', findings: [{ ...original, source: { ...original.source, [field]: 'feil' } }], limitations: [] })
    let state: ReportState = { ...before, outcome }
    expect(currentFinding(state, 'rt11')).toBeNull()
    expect(act(state, 'report-finding-confirm')).toBe(state)
    state = act(state, 'report-finding-edit')
    expect(state.findingControls[0]?.draft?.pdfPage).toBe('4')
    state = act(state, 'report-finding-apply')
    expect(currentFinding(state, 'rt11')?.source).toEqual(original.source)
    expect(state.findingControls[0]?.confirmedRevision).toBeNull()
    expect(state.outcome).toBe(outcome)
    if (outcome.status !== 'completed') throw new Error('test fixture')
    expect(outcome.uncertainCandidates[0]?.original.source?.[field]).toBe('feil')
  })
  it('uavhengig review: sen draft-hendelse kan ikke endre nytt grunnlag med samme funn-ID', () => {
    const state = { ...draft(), generation: 2 }
    expect(reportReducer(state, { type: 'report-finding-draft', generation: 1, findingId: 'rt11', field: 'grade', value: 'TG3' })).toBe(state)
  })

})

describe('Story 2.9 — eksplisitt brukeravvisning med bevart opphav', () => {
  const reject = (state: ReportState) => reportReducer(state, { type: 'report-finding-reject', generation: 1, findingId: 'rt11' })
  it('AC1/3: avvisning fjerner påstått TG3 fra aktiv seleksjon og bevarer original/PDF uten teknisk avklaring', () => {
    const before = completed()
    const originalJson = JSON.stringify(before.outcome)
    const rejected = reject(before)
    expect(currentFinding(rejected, 'rt11')).toBeNull()
    expect(rejected.findingControls[0]).toMatchObject({ rejection: { revision: 1 }, revision: 1, confirmedRevision: null })
    expect(rejected.status).toBe('completed')
    expect(rejected.outcome).toBe(before.outcome)
    expect(JSON.stringify(rejected.outcome)).toBe(originalJson)
    expect(rejected.selected).toBe(before.selected)
    expect(reportDeficiencies(rejected).status).toBe('information-required')
    expect(rejected).not.toHaveProperty('tg3Resolution')
  })
  it('AC2: avviser ett, øker listen én gang og bevarer andre originaler, rettinger, utkast og bekreftelser', () => {
    let before = completed()
    if (before.outcome?.status !== 'completed') throw new Error('test fixture')
    const other = { ...before.outcome.findings[0]!, findingId: 'other', original: { ...before.outcome.findings[0]!.original, findingId: 'other' } }
    before = { ...before, outcome: { ...before.outcome, findings: [...before.outcome.findings, other] } }
    for (const type of ['report-finding-edit', 'report-finding-apply', 'report-finding-confirm', 'report-finding-edit'] as const) {
      before = reportReducer(before, { type, generation: 1, findingId: 'other' })
    }
    before = act(before, 'report-finding-confirm')
    before = { ...before, listConfirmationRevision: before.listRevision }
    const otherControl = before.findingControls.find(item => item.findingId === 'other')
    const rejected = reject(before)
    expect(rejected.listRevision).toBe(before.listRevision + 1)
    expect(rejected.listConfirmationRevision).toBeNull()
    expect(rejected.findingControls.find(item => item.findingId === 'other')).toBe(otherControl)
    expect(currentFinding(rejected, 'other')).toEqual(currentFinding(before, 'other'))
    expect(rejected.outcome).toBe(before.outcome)
  })
  it('AC1/4: brukt korrigering og ugyldig ubrukt utkast bevares separat og kan ikke reaktivere', () => {
    let before = act(act(draft(), 'report-finding-apply'), 'report-finding-confirm')
    before = act(edit(act(before, 'report-finding-edit'), 'pdfPage', '99'), 'report-finding-apply')
    before = { ...before, view: { findingId: 'rt11', pdfPage: 5, zoom: 1.5 }, listConfirmationRevision: 1 }
    const control = before.findingControls[0]!
    const rejected = reject(before)
    expect(rejected.findingControls[0]?.correction).toBe(control.correction)
    expect(rejected.findingControls[0]?.draft).toBe(control.draft)
    expect(rejected.findingControls[0]?.errors).toBe(control.errors)
    expect(rejected.findingControls[0]?.confirmedRevision).toBeNull()
    expect(rejected.listRevision).toBe(2)
    expect(rejected.view).toEqual({ findingId: 'rt11', pdfPage: 4, zoom: 1.5 })
    expect(currentFinding(rejected, 'rt11')).toBeNull()
    for (const type of ['report-finding-reject', 'report-finding-edit', 'report-finding-apply', 'report-finding-cancel', 'report-finding-confirm'] as const) {
      expect(reportReducer(rejected, { type, generation: 1, findingId: 'rt11' })).toBe(rejected)
    }
    expect(edit(rejected, 'grade', 'TG3')).toBe(rejected)
    const moved = reportReducer(rejected, { type: 'report-view', generation: 1, view: { findingId: 'other', pdfPage: 2, zoom: 1 } })
    const returned = sessionReducer({ ...createInitialSession(), report: moved }, { type: 'navigate', step: 'tallgrunnlag' })
    expect(returned.report.findingControls).toBe(rejected.findingControls)
    expect(returned.report.listRevision).toBe(2)
  })
  it('AC3: avvist usikker kandidat er ikke uløst aktiv kandidat, mens rapportbegrensninger består', () => {
    const before = completed(true)
    if (before.outcome?.status !== 'completed') throw new Error('test fixture')
    const limited = { ...before, outcome: { ...before.outcome, limitations: ['Rapportbegrensning består'] }, view: { findingId: 'rt11', pdfPage: null, zoom: 1 } }
    const rejected = reject(limited)
    expect(currentFinding(rejected, 'rt11')).toBeNull()
    const reasons = reportDeficiencies(rejected).triggers.map(item => item.message)
    expect(reasons).toHaveLength(2)
    expect(reasons.some(reason => reason.includes('Rapportbegrensning består'))).toBe(true)
    expect(reasons.some(reason => reason.includes('rt11:'))).toBe(false)
    expect(rejected.view.pdfPage).toBeNull()
    expect(rejected.outcome).toBe(limited.outcome)
  })
  it.each(['document', 'analysis'] as const)('AC3: %s-feil med delresultat tillater ingen avvisning eller falsk fullføring', kind => {
    const before = completed()
    if (before.outcome?.status !== 'completed') throw new Error('test fixture')
    const failed: ReportState = { ...before, status: 'failed', error: 'timeout', outcome: { ...context, status: 'failed',
      error: kind === 'document' ? { kind, code: 'unreadable-text', target: null, reason: null } : { kind, code: 'timeout', target: null, reason: null },
      partialResult: { findings: before.outcome.findings, uncertainCandidates: [], limitations: ['Delresultat'], completeness: 'incomplete' } } }
    expect(reject(failed)).toBe(failed)
    expect(reportDeficiencies(reject(failed)).status).toBe('information-required')
  })
  it('AC4: ukjent funn, feil rapportidentitet og gammel generasjon ignoreres; rapportbytte overfører ingen avvisning', () => {
    const before = completed()
    expect(reportReducer(before, { type: 'report-finding-reject', generation: 0, findingId: 'rt11' })).toBe(before)
    expect(reportReducer(before, { type: 'report-finding-reject', generation: 1, findingId: 'unknown' })).toBe(before)
    for (const selected of [{ ...before.selected!, hash: 'b'.repeat(64) }, { ...before.selected!, file: new File(['%PDF'], 'other.pdf') }]) {
      const mismatched = { ...before, selected }
      expect(reject(mismatched)).toBe(mismatched)
    }
    const replacement = reportReducer(reject(before), { type: 'report-selecting', generation: 2 })
    expect(replacement.findingControls).toEqual([])
    expect(replacement.listRevision).toBe(0)
    expect(reject(replacement)).toBe(replacement)
  })
})


describe('Story 2.9 — uavhengige negative prøver', () => {
  it('avvisning av én usikker kandidat fjerner ikke en annens mangel eller rapportbegrensninger', () => {
    const before = completed(true)
    if (before.outcome?.status !== 'completed') throw new Error('test fixture')
    const first = before.outcome.uncertainCandidates[0]!
    const second = { ...first, findingId: 'other-uncertain', original: { ...first.original, findingId: 'other-uncertain' } }
    const state = { ...before, outcome: { ...before.outcome, uncertainCandidates: [first, second], limitations: ['Rapportbegrensning beholdes'] } }
    const rejected = reportReducer(state, { type: 'report-finding-reject', generation: 1, findingId: 'rt11' })
    const reasons = reportDeficiencies(rejected).triggers.map(item => item.message)
    expect(reasons.some(reason => reason.includes('rt11:'))).toBe(false)
    for (const issue of second.issues) expect(reasons).toContain(`Rapportgrunnlaget er ufullført: other-uncertain: ${issue.reason}`)
    expect(reasons).toContain('Rapportgrunnlaget er ufullført: Rapportbegrensning beholdes')
    expect(rejected.outcome).toBe(state.outcome)
    expect(rejected.findingControls.some(item => item.findingId === second.findingId)).toBe(false)
  })
  it.each([
    { source: { ...original.source, reportHash: 'b'.repeat(64) }, expectedPage: null },
    { source: { ...original.source, documentName: 'other.pdf' }, expectedPage: null },
    { source: { ...original.source, pdfPage: 99 }, expectedPage: 99 },
  ])('avvisning etter retting gjenoppretter ærlig originalkilde: $source', ({ source, expectedPage }) => {
    const before = completed()
    const outcome = bindAnalysisOutcome({ ...context, pages: Array.from({ length: 5 }, (_, index) => ({ pdfPage: index + 1, text: 'Originaltekst', status: 'readable' as const, reason: null })) },
      { contractVersion: '2', extractionVersion: '1', status: 'completed', findings: [{ ...original, source }], limitations: [] })
    const state = act(draft({ ...before, outcome, view: { findingId: 'rt11', pdfPage: null, zoom: 1 } }), 'report-finding-apply')
    expect(currentFinding(state, 'rt11')?.source.pdfPage).toBe(5)
    const rejected = reportReducer(state, { type: 'report-finding-reject', generation: 1, findingId: 'rt11' })
    expect(rejected.view.pdfPage).toBe(expectedPage)
    expect(currentFinding(rejected, 'rt11')).toBeNull()
    expect(rejected.outcome).toBe(outcome)
    expect(outcome.status === 'completed' && outcome.uncertainCandidates[0]?.original.source).toEqual(source)
    expect(rejected.findingControls[0]?.correction).toBe(state.findingControls[0]?.correction)
  })
})
