import { describe, expect, it } from 'vitest'
import { bindAnalysisOutcome } from '../../src/contracts/analysis-validation.ts'
import type { Tg3Field, Tg3Resolution } from '../../src/contracts/tg3-resolution.ts'
import { validateTg3Resolution } from '../../src/domain/tg3-resolution.ts'
import { evaluateKnownDeficiencies } from '../../src/domain/screening.ts'
import { createReportState, currentTg3Findings, currentFinding, reportDeficiencies, reportReducer } from '../../src/frontend/state/report.ts'
import type { ReportState } from '../../src/frontend/state/report.ts'
import { createInitialSession, sessionReducer } from '../../src/frontend/state/session.ts'

const hash = 'a'.repeat(64)
const current = { grade: 'TG3' as const, description: 'Elektrisk anlegg ikke dokumentert', source: { reportHash: hash, documentName: 'tg3.pdf', pdfPage: 2 } }
const valid: Tg3Resolution = { status: 'resolved', reason: 'Etterfølgende kontroll fant ikke behov for umiddelbar utbedring', basis: 'Kontroll fra autorisert elektriker, 2026-10-15, ref E-42', binding: current }
function completed(two = false): ReportState {
  const findings = [{ findingId: 'electric', ...current, uncertainties: [] }, ...(two ? [{ findingId: 'roof', grade: 'TG3', description: 'Alvorlig lekkasje i tak', source: { ...current.source, pdfPage: 4 }, uncertainties: [] }] : [])]
  return { ...createReportState(), generation: 1, status: 'completed', selected: { file: new File(['%PDF'], 'tg3.pdf'), bytes: new Uint8Array(), hash },
    outcome: bindAnalysisOutcome({ contractVersion: '2', extractionVersion: '1', requestId: 'request', mode: 'demo', reportHash: hash, documentName: 'tg3.pdf', pageCount: 4,
      pages: Array.from({ length: 4 }, (_, i) => ({ pdfPage: i + 1, text: 'Rapport', status: 'readable' as const, reason: null })) },
    { contractVersion: '2', extractionVersion: '1', status: 'completed', findings, limitations: [] }) }
}
const register = (state: ReportState, field: Tg3Field, value: string, findingId = 'electric') => reportReducer(state, { type: 'report-tg3-register', generation: 1, findingId, field, value })
function resolve(state = completed(), findingId = 'electric') {
  for (const field of ['status', 'reason', 'basis'] as const) state = register(state, field, valid[field], findingId)
  return state
}
function correct(state: ReportState, field: 'grade' | 'description' | 'pdfPage', value: string) {
  state = reportReducer(state, { type: 'report-finding-edit', generation: 1, findingId: 'electric' })
  state = reportReducer(state, { type: 'report-finding-draft', generation: 1, findingId: 'electric', field, value })
  return reportReducer(state, { type: 'report-finding-apply', generation: 1, findingId: 'electric' })
}

describe('Story 2.10 — sju FR-5-eksemplers avklaringsdel', () => {
  it('FR5-1/AC1/2: eksplisitt status og begge konkrete brukertekster gir anvendbar avklaring, original/provenance beholdes', () => {
    const before = completed()
    const state = resolve(before)
    expect(validateTg3Resolution(current, state.tg3Resolutions[0]!.resolution)).toEqual({ applicable: true, errors: {} })
    expect(state.outcome).toBe(before.outcome)
    expect(currentFinding(state, 'electric')).toEqual(currentFinding(before, 'electric'))
    expect(state.selected).toBe(before.selected)
    expect(state.tg3Resolutions[0]!.resolution).toEqual(valid)
    expect(reportDeficiencies(state).triggers.map(item => item.code)).toEqual(['incomplete-report'])
  })
  it('FR5-2: eksplisitt Uavklart beholdes og navngis som mangel', () => {
    const state = register(resolve(), 'status', 'unresolved')
    expect(state.tg3Resolutions[0]?.resolution.status).toBe('unresolved')
    expect(reportDeficiencies(state).triggers.find(item => item.code === 'unresolved-tg3')?.message).toContain('Elektrisk anlegg ikke dokumentert')
  })
  it.each(['', ' ', '\t\n'] )('FR5-3: blank/whitespace %j i begge tekstfelt gir konkrete feltfeil', value => {
    for (const field of ['reason', 'basis'] as const) {
      const validation = validateTg3Resolution(current, { ...valid, [field]: value })
      expect(validation.applicable).toBe(false)
      expect(validation.errors[field]).toBeTruthy()
      expect(reportDeficiencies(register(resolve(), field, value)).triggers.some(item => item.code === 'unresolved-tg3')).toBe(true)
    }
  })
  it.each(['', 'unknown', 'Ukjent', 'RESOLVED'])('FR5-4: status %j er ingen eksplisitt Avklart', status => {
    expect(validateTg3Resolution(current, { ...valid, status })).toMatchObject({ applicable: false, errors: { status: expect.any(String) } })
  })
  it('FR5-4: manglende registrering er uavklart', () => {
    expect(validateTg3Resolution(current, null).applicable).toBe(false)
  })
  it('FR5-5/AC3: ett av to avklart lar det andre blokkere med eget navn/kilde', () => {
    const state = resolve(completed(true))
    const assessment = evaluateKnownDeficiencies({ tg3Findings: currentTg3Findings(state) })
    expect(assessment).toMatchObject({ recommendation: 'Innhent mer informasjon', priority: 1 })
    expect(assessment.triggers).toHaveLength(1)
    expect(assessment.triggers[0]?.message).toContain('roof: Alvorlig lekkasje i tak (tg3.pdf, PDF-side 4)')
  })
  it('FR5-6: alle avklart gir ingen automatisk Gå videre eller økonomisk anbefaling', () => {
    const state = resolve(resolve(completed(true)), 'roof')
    expect(evaluateKnownDeficiencies({ tg3Findings: currentTg3Findings(state) })).toMatchObject({ status: 'no-known-deficiencies', recommendation: null, priority: null })
  })
  it('FR5-7: endret status gir gjeldende mangel, tømt tekst er uavklart', () => {
    const state = resolve()
    for (const [field, value] of [['status', 'unresolved'], ['reason', ''], ['basis', ' ']] as const) {
      const changed = register(state, field, value)
      expect(changed.tg3Revision).toBe(state.tg3Revision + 1)
      expect(reportDeficiencies(changed).triggers.some(item => item.code === 'unresolved-tg3')).toBe(true)
    }
  })
})

describe('Story 2.10 — forholdsbinding, negative overganger og revisjonsisolasjon', () => {
  it('AC4: ren whitespace-representasjon beholder avklaring men opphever listekontroll', () => {
    const before = { ...resolve(), listConfirmationRevision: 0 }
    const state = correct(before, 'description', ' Elektrisk  anlegg\nikke dokumentert ')
    expect(validateTg3Resolution(currentFinding(state, 'electric')!, state.tg3Resolutions[0]!.resolution).applicable).toBe(true)
    expect(state.tg3Revision).toBe(before.tg3Revision)
    expect(state.listConfirmationRevision).toBeNull()
    expect(state.listRevision).toBe(1)
  })
  it.each([['description', 'Alvorlig lekkasje i tak'], ['description', 'Bedre formulering uten sikkert forholdsbevis'], ['pdfPage', '4']] as const)('AC4: stabil ID og endret %s gir ukjent anvendbarhet, ikke automatisk overføring', (field, value) => {
    const before = resolve()
    const state = correct(before, field, value)
    expect(state.tg3Resolutions).toBe(before.tg3Resolutions)
    const validation = validateTg3Resolution(currentFinding(state, 'electric')!, state.tg3Resolutions[0]!.resolution)
    expect(validation).toMatchObject({ applicable: false, errors: { binding: expect.any(String) } })
    expect(reportDeficiencies(state).triggers.some(item => item.code === 'unresolved-tg3')).toBe(true)
    const textOnly = register(state, 'reason', 'Endret tekst alene overfører ikke avklaring')
    expect(textOnly.tg3Resolutions[0]?.resolution.binding).toBe(before.tg3Resolutions[0]?.resolution.binding)
    expect(validateTg3Resolution(currentFinding(textOnly, 'electric')!, textOnly.tg3Resolutions[0]!.resolution).applicable).toBe(false)
    const registered = register(textOnly, 'status', 'resolved')
    expect(validateTg3Resolution(currentFinding(registered, 'electric')!, registered.tg3Resolutions[0]!.resolution).applicable).toBe(true)
    expect(registered.tg3Revision).toBe(textOnly.tg3Revision + 1)
  })
  it.each(['documentName', 'reportHash', 'pdfPage'] as const)('AC4: annen %s bryter binding selv ved identisk funn-ID/tekst', field => {
    const changed = { ...current, source: { ...current.source, [field]: field === 'pdfPage' ? 4 : 'other' } }
    expect(validateTg3Resolution(changed, valid)).toMatchObject({ applicable: false, errors: { binding: expect.any(String) } })
  })
  it('AC5: faktisk endring bevarer finans-, liste- og enkeltfunnkontroll uten mutasjon; uendret registrering er idempotent', () => {
    let report = resolve()
    report = reportReducer(report, { type: 'report-finding-confirm', generation: 1, findingId: 'electric' })
    report = { ...report, listConfirmationRevision: report.listRevision }
    const session = { ...createInitialSession(), report, financialRevision: 7 }
    const changed = sessionReducer(session, { type: 'report-tg3-register', generation: 1, findingId: 'electric', field: 'basis', value: 'Ny konkret elektrikerkontroll, ref E-43' })
    expect(changed.financial).toBe(session.financial)
    expect(changed.financialRevision).toBe(7)
    expect(changed.report.findingControls).toBe(report.findingControls)
    expect(changed.report.listRevision).toBe(report.listRevision)
    expect(changed.report.listConfirmationRevision).toBe(report.listConfirmationRevision)
    expect(changed.report.outcome).toBe(report.outcome)
    expect(register(changed.report, 'basis', 'Ny konkret elektrikerkontroll, ref E-43')).toBe(changed.report)
    expect(reportReducer(changed.report, { type: 'report-view', generation: 1, view: { findingId: 'electric', pdfPage: 2, zoom: 2 } }).tg3Resolutions).toBe(changed.report.tg3Resolutions)
  })
  it('utkast og avbryt endrer ikke TG3; avvist/TG2/usikkert/feilet/ukjent og sen hendelse registrerer ingen avklaring', () => {
    const state = resolve()
    const draft = reportReducer(state, { type: 'report-finding-edit', generation: 1, findingId: 'electric' })
    expect(draft.tg3Revision).toBe(state.tg3Revision)
    expect(reportReducer(draft, { type: 'report-finding-cancel', generation: 1, findingId: 'electric' }).tg3Resolutions).toBe(state.tg3Resolutions)
    const rejected = reportReducer(state, { type: 'report-finding-reject', generation: 1, findingId: 'electric' })
    for (const invalid of [rejected, correct(state, 'grade', 'TG2'), { ...state, status: 'failed' as const }, { ...state, selected: { ...state.selected!, hash: 'b'.repeat(64) } }]) {
      expect(register(invalid, 'reason', 'Vil ikke registreres')).toBe(invalid)
      if (invalid === rejected) expect(currentTg3Findings(invalid)).toEqual([])
    }
    expect(register(state, 'status', 'resolved', 'unknown')).toBe(state)
    expect(reportReducer(state, { type: 'report-tg3-register', generation: 0, findingId: 'electric', field: 'status', value: 'unresolved' })).toBe(state)
  })
  it.each(['source', 'grade'] as const)('usikker %s kan ikke få anvendbar TG3-avklaring før eksplisitt korrigering', field => {
    const state = completed()
    if (state.outcome?.status !== 'completed') throw new Error('fixture')
    const first = state.outcome.findings[0]!
    const outcome = bindAnalysisOutcome({ contractVersion: '2', extractionVersion: '1', requestId: 'request', mode: 'demo', reportHash: hash, documentName: 'tg3.pdf', pageCount: 4,
      pages: Array.from({ length: 4 }, (_, i) => ({ pdfPage: i + 1, text: 'Rapport', status: 'readable' as const, reason: null })) },
      { contractVersion: '2', extractionVersion: '1', status: 'completed', findings: [{ ...first.original, ...(field === 'source' ? { source: null } : { grade: '?' }) }], limitations: [] })
    const uncertain = { ...state, outcome }
    expect(currentFinding(uncertain, 'electric')).toBeNull()
    expect(register(uncertain, 'status', 'resolved')).toBe(uncertain)
    expect(currentTg3Findings(uncertain)).toEqual([])
    expect(reportDeficiencies(uncertain).triggers.some(item => item.message.includes('electric:'))).toBe(true)
    const corrected = correct(uncertain, field === 'source' ? 'pdfPage' : 'grade', field === 'source' ? '2' : 'TG3')
    expect(currentTg3Findings(corrected)).toHaveLength(1)
    expect(validateTg3Resolution(currentFinding(corrected, 'electric')!, null).applicable).toBe(false)
    expect(validateTg3Resolution(currentFinding(corrected, 'electric')!, resolve(corrected).tg3Resolutions[0]!.resolution).applicable).toBe(true)
  })
  it('ny rapport tømmer gjeldende avklaringer/revisjon og ignorerer gammelt samme-ID-svar', () => {
    const replacement = reportReducer(resolve(), { type: 'report-selecting', generation: 2 })
    expect(replacement.tg3Resolutions).toEqual([])
    expect(replacement.tg3Revision).toBe(0)
    expect(register(replacement, 'status', 'resolved')).toBe(replacement)
  })
  it('stabil mangelrekkefølge og alle samtidige TG3-mangler, også ved andre kritiske rapportfeil', () => {
    const inputs = currentTg3Findings(completed(true))
    const a = evaluateKnownDeficiencies({ reportDeficiencies: [{ code: 'incomplete-report', reason: 'Kjent rapportbegrensning' }], tg3Findings: inputs })
    const b = evaluateKnownDeficiencies({ reportDeficiencies: [{ code: 'incomplete-report', reason: 'Kjent rapportbegrensning' }], tg3Findings: [...inputs].reverse() })
    expect(a).toEqual(b)
    expect(a.triggers.map(item => item.code)).toEqual(['incomplete-report', 'unresolved-tg3', 'unresolved-tg3'])
  })
})


it('taklekkasje får forholdsnøytral veiledning uten å endre validering', () => {
  const roof = { ...current, description: 'Alvorlig lekkasje i tak' }
  expect(validateTg3Resolution(roof, null).errors.basis).toBe('Oppgi konkret eksternt avklaringsgrunnlag, for eksempel vurdering fra relevant fagkyndig med dato eller referanse.')
  expect(validateTg3Resolution(roof, { ...valid, binding: roof }).applicable).toBe(true)
})
