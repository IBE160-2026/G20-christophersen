import { AnalysisHttpResponseSchema } from '../../contracts/analysis-http.ts'
import type { AnalysisHttpCorrelation } from '../../contracts/analysis-http.ts'
import type { AnalysisOutcome } from '../../contracts/document-analysis.ts'
import { evaluateKnownDeficiencies } from '../../domain/screening.ts'
import type { KnownReportDeficiency } from '../../contracts/screening.ts'

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
  listVisibleGeneration: number | null
}
export type ReportAction =
  | { type: 'report-selecting'; generation: number }
  | { type: 'report-selected'; generation: number; selected: SelectedReport }
  | { type: 'report-start'; correlation: AnalysisHttpCorrelation }
  | { type: 'report-response'; correlation: AnalysisHttpCorrelation; body: unknown; ok: boolean }
  | { type: 'report-error'; generation: number; code: string }
  | { type: 'report-abandon' }
  | { type: 'report-list-visible'; generation: number }
export function createReportState(): ReportState {
  return { generation: 0, status: 'missing', selected: null, active: null, outcome: null, error: null, listVisibleGeneration: null }
}
function fail(state: ReportState, code: string): ReportState {
  return { ...state, status: 'failed', active: null, outcome: null, error: code, listVisibleGeneration: null }
}
export function reportReducer(state: ReportState, action: ReportAction): ReportState {
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

/** Bare kjente mangler; completed er aldri brukerens listebekreftelse. */
export function reportDeficiencies(state: ReportState) {
  const reportDeficiencies: KnownReportDeficiency[] = []
  if (state.status === 'missing' || state.error === 'missing-report') reportDeficiencies.push({ code: 'missing-report', reason: 'Velg én tekstbasert PDF på høyst 30 sider.' })
  else if (state.status !== 'completed') reportDeficiencies.push({ code: 'incomplete-report', reason: state.error ? `Dokument-/analysefeil (${state.error}).` : 'Rapportanalysen er ikke fullført.' })
  else {
    reportDeficiencies.push({ code: 'incomplete-report', reason: 'Funnlisten er ennå ikke kontrollert og bekreftet av deg.' })
    if (state.outcome?.status === 'completed') {
      for (const candidate of state.outcome.uncertainCandidates) for (const issue of candidate.issues) {
        reportDeficiencies.push({ code: 'incomplete-report', reason: `${candidate.findingId}: ${issue.reason}` })
      }
      for (const limitation of state.outcome.limitations) reportDeficiencies.push({ code: 'incomplete-report', reason: limitation })
    }
  }
  return evaluateKnownDeficiencies({ reportDeficiencies })
}

export function analysisStatus(report: ReportState) {
  if (report.status === 'completed') return report.listVisibleGeneration === report.generation
    ? 'Analyse fullført — funnlisten er klar.' : 'Uttrekk mottatt — åpne funnlisten i Kontroller funn.'
  if (report.status === 'failed') return `Analysefeil — rapportgrunnlaget er ufullført (${report.error}).`
  if (report.status === 'analysing') return 'Analyserer — rapportgrunnlaget er ufullført.'
  if (report.status === 'selecting') return 'Leser valgt rapport — ingen analyse startet.'
  return report.selected ? 'Rapport valgt — ingen analyse startet.' : 'Ingen rapport valgt. Ingen rapportanalyse er startet.'
}
