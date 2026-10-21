import { AnalysisHttpResponseSchema } from '../../contracts/analysis-http.ts'
import type { AnalysisHttpCorrelation } from '../../contracts/analysis-http.ts'
import type { AnalysisOutcome } from '../../contracts/document-analysis.ts'
import { evaluateKnownDeficiencies } from '../../domain/screening.ts'
import type { KnownReportDeficiency } from '../../contracts/screening.ts'
import type { FindingControl, FindingDraft } from '../../contracts/finding-control.ts'
import { validateFindingCorrection } from '../../domain/finding-control.ts'
import { sameTg3Basis } from '../../domain/tg3-resolution.ts'
import type { Tg3Field, Tg3Resolution, Tg3Finding } from '../../contracts/tg3-resolution.ts'
import { sourceTarget } from '../pdf/source-page.ts'

export interface SelectedReport {
  file: File
  bytes: Uint8Array<ArrayBuffer>
  hash: string
}
export interface ReportState {
  generation: number
  status: 'missing' | 'selecting' | 'ready' | 'analysing' | 'completed' | 'failed'
  selected: SelectedReport | null
  active: AnalysisHttpCorrelation | null
  outcome: AnalysisOutcome | null
  error: string | null
  view: { findingId: string | null; pdfPage: number | null; zoom: number }
  listVisibleGeneration: number | null
  findingControls: FindingControl[]
  tg3Revision: number
  tg3Resolutions: { findingId: string; resolution: Tg3Resolution }[]
  listRevision: number
  listConfirmationRevision: number | null
}
export type ReportAction =
  | { type: 'report-tg3-register'; generation: number; findingId: string; field: Tg3Field; value: string }
  | { type: 'report-finding-edit' | 'report-finding-apply' | 'report-finding-cancel' | 'report-finding-confirm' | 'report-finding-reject'; generation: number; findingId: string }
  | { type: 'report-finding-draft'; generation: number; findingId: string; field: keyof FindingDraft; value: string }
  | { type: 'report-view'; generation: number; view: ReportState['view'] }
  | { type: 'report-selecting'; generation: number }
  | { type: 'report-selected'; generation: number; selected: SelectedReport }
  | { type: 'report-start'; correlation: AnalysisHttpCorrelation }
  | { type: 'report-response'; correlation: AnalysisHttpCorrelation; body: unknown; ok: boolean }
  | { type: 'report-error'; generation: number; code: string }
  | { type: 'report-abandon' }
  | { type: 'report-list-visible'; generation: number }
export function createReportState(): ReportState {
  return { view: { findingId: null, pdfPage: null, zoom: 1 }, generation: 0, status: 'missing', selected: null, active: null, outcome: null, error: null, listVisibleGeneration: null,
    findingControls: [], tg3Revision: 0, tg3Resolutions: [], listRevision: 0, listConfirmationRevision: null }
}
function fail(state: ReportState, code: string): ReportState {
  return { ...state, status: 'failed', active: null, outcome: null, error: code, listVisibleGeneration: null }
}
export function reportReducer(state: ReportState, action: ReportAction): ReportState {
  if ('findingId' in action) {
    const outcome = state.outcome
    if (state.status !== 'completed' || outcome?.status !== 'completed' || action.generation !== state.generation
      || state.selected?.hash !== outcome.reportHash || state.selected.file.name.trim() !== outcome.documentName) return state
    const candidate = [...outcome.findings, ...outcome.uncertainCandidates].find(item => item.findingId === action.findingId)
    if (!candidate) return state
    const control = state.findingControls.find(item => item.findingId === action.findingId)
      ?? { findingId: action.findingId, revision: 0, rejection: null, correction: null, draft: null, confirmedRevision: null, errors: {} }
    if (control.rejection) return state
    const current = currentFinding(state, action.findingId)
    if (action.type === 'report-tg3-register') {
      if (!current || current.grade !== 'TG3') return state
      const before = state.tg3Resolutions.find(item => item.findingId === action.findingId)?.resolution
      if ((before?.[action.field] ?? '') === action.value && !(action.field === 'status' && before && !sameTg3Basis(before.binding, current))) return state
      const resolution: Tg3Resolution = { status: '', reason: '', basis: '', ...before,
        [action.field]: action.value, binding: before && action.field !== 'status' ? before.binding : { grade: current.grade, description: current.description, source: { ...current.source } } }
      return { ...state, tg3Revision: state.tg3Revision + 1,
        tg3Resolutions: [...state.tg3Resolutions.filter(item => item.findingId !== action.findingId), { findingId: action.findingId, resolution }] }
    }
    let next: FindingControl = control
    if (action.type === 'report-finding-reject') {
      next = { ...control, rejection: { revision: control.revision + 1 }, revision: control.revision + 1, confirmedRevision: null }
    } else if (action.type === 'report-finding-edit') {
      if (control.draft) return state
      const original = candidate.original
      next = { ...control, errors: {}, draft: { grade: current?.grade ?? (original.grade === 'TG2' || original.grade === 'TG3' ? original.grade : ''),
        description: current?.description ?? original.description,
        pdfPage: current ? String(current.source.pdfPage) : typeof original.source?.pdfPage === 'number' && Number.isInteger(original.source.pdfPage) ? String(original.source.pdfPage) : '' } }
    } else if (action.type === 'report-finding-draft') {
      if (!control.draft) return state
      const draft = { ...control.draft, [action.field]: action.value }
      const validation = validateFindingCorrection(draft, outcome)
      // Vis bare allerede identifiserte feil under inntasting, til deres grunnlag er rettet.
      const errors = Object.fromEntries(Object.entries(validation.errors).filter(([field]) => field in control.errors))
      next = { ...control, draft, errors }
    } else if (action.type === 'report-finding-cancel') {
      if (!control.draft) return state
      next = { ...control, draft: null, errors: {} }
    } else if (action.type === 'report-finding-confirm') {
      if (!current || control.confirmedRevision === control.revision) return state
      next = { ...control, confirmedRevision: control.revision }
    } else if (action.type === 'report-finding-apply') {
      if (!control.draft) return state
      const validation = validateFindingCorrection(control.draft, outcome)
      next = validation.correction
        ? { ...control, correction: validation.correction, draft: null, errors: {}, revision: control.revision + 1, confirmedRevision: null }
        : { ...control, errors: validation.errors }
    }
    return { ...state, findingControls: [...state.findingControls.filter(item => item.findingId !== action.findingId), next],
      ...(next.revision !== control.revision ? { listRevision: state.listRevision + 1, listConfirmationRevision: null,
        view: state.view.findingId === action.findingId ? { ...state.view, pdfPage: next.rejection ? sourceTarget(candidate.original.source, { hash: state.selected.hash, documentName: outcome.documentName }).page : next.correction!.source.pdfPage } : state.view } : {}) }
  }
  if (action.type === 'report-view') return action.generation === state.generation && state.selected
    ? { ...state, view: action.view } : state
  if (action.type === 'report-selecting') return action.generation > state.generation
    ? { ...createReportState(), generation: action.generation, status: 'selecting' } : state
  if (action.type === 'report-selected') return action.generation === state.generation && state.status === 'selecting'
    ? { ...state, status: 'ready', selected: action.selected } : state
  if (action.type === 'report-abandon') return state.status === 'analysing' || state.status === 'selecting'
    ? { ...fail(state, 'interrupted'), generation: state.generation + 1 } : state
  if (action.type === 'report-list-visible') return state.status === 'completed' && action.generation === state.generation
    && state.listVisibleGeneration !== action.generation ? { ...state, listVisibleGeneration: action.generation } : state
  if (action.type === 'report-error') return action.generation === state.generation ? fail(state, action.code) : state
  if (action.type === 'report-start') return state.selected && action.correlation.generation === state.generation
    && (state.status === 'ready' || state.status === 'failed')
    ? { ...state, status: 'analysing', active: action.correlation, outcome: null, error: null, listVisibleGeneration: null } : state
  if (!state.active || state.status !== 'analysing' || action.correlation.generation !== state.generation
    || action.correlation.requestId !== state.active.requestId || action.correlation.sessionId !== state.active.sessionId) return state
  const parsed = AnalysisHttpResponseSchema.safeParse(action.body)
  if (!parsed.success) return fail(state, 'invalid-response')
  const response = parsed.data
  if (response.kind === 'rejected') return fail(state, response.code)
  const { correlation, outcome } = response
  if (correlation.sessionId !== state.active.sessionId || correlation.requestId !== state.active.requestId
    || correlation.generation !== state.generation || outcome.requestId !== state.active.requestId
    || outcome.reportHash !== state.selected?.hash || outcome.documentName !== state.selected?.file.name.trim()
    || outcome.mode !== 'demo') return fail(state, 'metadata-mismatch')
  if (!action.ok && outcome.status === 'completed') return fail(state, 'transport-failure')
  return { ...state, status: outcome.status, active: null, outcome, error: outcome.status === 'failed' ? outcome.error.code : null }
}

/** Gjeldende brukt grunnlag, uten utkast og uten å omskrive analyseutfallet. */
export function currentFinding(state: ReportState, findingId: string) {
  const outcome = state.outcome
  const extraction = outcome?.status === 'completed' ? outcome : outcome?.partialResult
  const control = state.findingControls.find(item => item.findingId === findingId)
  if (control?.rejection) return null
  const correction = control?.correction
  if (correction) return { findingId, ...correction }
  return extraction?.findings.find(item => item.findingId === findingId) ?? null
}

/** Aktive TG3 med separat registrering; anvendbarhet tolkes bare i domain. */
export function currentTg3Findings(state: ReportState): Tg3Finding[] {
  if (state.status !== 'completed' || state.outcome?.status !== 'completed') return []
  return [...state.outcome.findings, ...state.outcome.uncertainCandidates].flatMap(candidate => {
    const current = currentFinding(state, candidate.findingId)
    return current?.grade === 'TG3' ? [{ findingId: candidate.findingId, current: { grade: current.grade, description: current.description, source: current.source },
      resolution: state.tg3Resolutions.find(item => item.findingId === candidate.findingId)?.resolution ?? null }] : []
  })
}

/** Bare kjente mangler; completed er aldri brukerens listebekreftelse. */
export function reportDeficiencies(state: ReportState) {
  const reportDeficiencies: KnownReportDeficiency[] = []
  if (state.status === 'missing' || state.error === 'missing-report') reportDeficiencies.push({ code: 'missing-report', reason: 'Velg én tekstbasert PDF på høyst 30 sider.' })
  else if (state.status !== 'completed') reportDeficiencies.push({ code: 'incomplete-report', reason: state.error ? `Dokument-/analysefeil (${state.error}).` : 'Rapportanalysen er ikke fullført.' })
  else {
    reportDeficiencies.push({ code: 'incomplete-report', reason: 'Funnlisten er ennå ikke kontrollert og bekreftet av deg.' })
    if (state.outcome?.status === 'completed') {
      for (const candidate of state.outcome.uncertainCandidates.filter(item => !currentFinding(state, item.findingId) && !state.findingControls.some(control => control.findingId === item.findingId && control.rejection))) for (const issue of candidate.issues) {
        reportDeficiencies.push({ code: 'incomplete-report', reason: `${candidate.findingId}: ${issue.reason}` })
      }
      for (const limitation of state.outcome.limitations) reportDeficiencies.push({ code: 'incomplete-report', reason: limitation })
    }
  }
  return evaluateKnownDeficiencies({ reportDeficiencies, tg3Findings: currentTg3Findings(state) })
}

export function analysisStatus(report: ReportState) {
  if (report.status === 'completed') return report.listVisibleGeneration === report.generation
    ? 'Analyse fullført — funnlisten er klar.' : 'Uttrekk mottatt — åpne funnlisten i Kontroller funn.'
  if (report.status === 'failed') return `Analysefeil — rapportgrunnlaget er ufullført (${report.error}).`
  if (report.status === 'analysing') return 'Analyserer — rapportgrunnlaget er ufullført.'
  if (report.status === 'selecting') return 'Leser valgt rapport — ingen analyse startet.'
  return report.selected ? 'Rapport valgt — ingen analyse startet.' : 'Ingen rapport valgt. Ingen rapportanalyse er startet.'
}
