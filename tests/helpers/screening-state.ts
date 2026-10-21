import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { bindAnalysisOutcome } from '../../src/contracts/analysis-validation.ts'
import { FinancialFieldSchema } from '../../src/contracts/financial-input.ts'
import type { FinancialField, RecurringField, RegisteredPeriod } from '../../src/contracts/financial-input.ts'
import { createInitialSession, sessionReducer } from '../../src/frontend/state/session.ts'

// PRD-addendum BT-fasit er håndskrevet i forventningene, aldri beregnet av formatfunksjonen.
const fixtures = new URL('../fixtures/property-cases/', import.meta.url)
const oracle = JSON.parse(readFileSync(new URL('expected.json', fixtures), 'utf8')) as {
  cases: { caseId: string; documentName: string; pageCount: number;
    financialInputs: Record<FinancialField, string>;
    findings: { id: string; grade: string; description: string; pdfPage: number }[] }[]
}

export function screeningState(options: {
  values?: Partial<Record<FinancialField, string>>
  periods?: Partial<Record<RecurringField, RegisteredPeriod>>
  report?: 'error' | 'unconfirmed' | 'tg3'
  costs?: boolean
  beforeCalculation?: (state: ReturnType<typeof createInitialSession>) => ReturnType<typeof createInitialSession>
} = {}) {
  let state = createInitialSession()
  for (const field of FinancialFieldSchema.options) {
    state = sessionReducer(state, { type: 'register-value', field, rawValue: oracle.cases[0]!.financialInputs[field] })
    state = sessionReducer(state, { type: 'register-source', field,
      source: { kind: field === 'L' ? 'assumption' : 'source', description: `Kontrollert grunnlag ${field}`, conflict: null } })
  }
  for (const field of ['L', 'D', 'J'] as const) {
    state = sessionReducer(state, { type: 'register-period', field, period: 'year' })
    state = sessionReducer(state, { type: 'register-year', field, year: '2026' })
  }
  state = sessionReducer(state, { type: 'register-rent-nature', rentNature: 'expected' })
  state = sessionReducer(state, { type: 'confirm-financial' })
  for (const field of FinancialFieldSchema.options) {
    if (options.values?.[field] !== undefined && options.values[field] !== '' && !(field === 'P' && options.values.P === '0')) {
      state = sessionReducer(state, { type: 'register-value', field, rawValue: options.values[field] })
    }
  }
  for (const field of ['L', 'D', 'J'] as const) {
    if (options.periods?.[field] !== undefined) state = sessionReducer(state, { type: 'register-period', field, period: options.periods[field] })
  }
  if (options.costs) {
    state = sessionReducer(state, { type: 'add-cost' })
    state = sessionReducer(state, { type: 'change-cost', id: 'cost-1', update: { label: 'Felleskostnader', rawAmount: '120000', rawDebt: '20000' } })
    state = sessionReducer(state, { type: 'add-cost' })
    state = sessionReducer(state, { type: 'change-cost', id: 'cost-2', update: { label: 'Forsikring', rawAmount: '10000', rawDebt: '0', includedIn: 'cost-1' } })
  }
  state = sessionReducer(state, { type: 'confirm-financial' })
  state = sessionReducer(state, { type: 'navigate', step: 'tilstandsrapport' })
  const fixture = oracle.cases.find(item => item.caseId === (options.report === 'tg3' ? 'F4' : 'F1'))!
  const bytes = new Uint8Array(readFileSync(new URL(fixture.documentName, fixtures)))
  const hash = createHash('sha256').update(bytes).digest('hex')
  const selected = { bytes, hash, file: new File([bytes], fixture.documentName) }
  const correlation = { sessionId: 'story-3-6', requestId: 'component-result', generation: 1 }
  const outcome = bindAnalysisOutcome({ contractVersion: '2', extractionVersion: '1', mode: 'demo',
    requestId: correlation.requestId, reportHash: hash, documentName: fixture.documentName, pageCount: fixture.pageCount,
    pages: Array.from({ length: fixture.pageCount }, (_, index) => ({ pdfPage: index + 1, text: 'Fiktiv rapport', status: 'readable', reason: null })),
  }, { contractVersion: '2', extractionVersion: '1', status: 'completed', limitations: [],
    findings: fixture.findings.map(item => ({ findingId: item.id, grade: item.grade, description: item.description,
      source: { documentName: fixture.documentName, reportHash: hash, pdfPage: item.pdfPage }, uncertainties: [] })) })
  state = sessionReducer(state, { type: 'report-selecting', generation: 1 })
  state = sessionReducer(state, { type: 'report-selected', generation: 1, selected })
  state = sessionReducer(state, { type: 'report-start', correlation })
  state = sessionReducer(state, { type: 'report-response', correlation, ok: true, body: { kind: 'analysis', correlation, outcome } })
  state = sessionReducer(state, { type: 'report-list-visible', generation: 1 })
  for (const finding of fixture.findings) state = sessionReducer(state, { type: 'report-finding-confirm', generation: 1, findingId: finding.id })
  if (options.report !== 'unconfirmed') state = sessionReducer(state, { type: 'report-list-confirm', generation: 1, reportHash: hash,
    documentName: fixture.documentName, listRevision: state.report.listRevision })
  if (options.report === 'error') state = sessionReducer(state, { type: 'report-error', generation: 1, code: 'analysis-failed' })
  // Mangelfasit: rapporten er allerede kontrollert og andre felt bekreftet
  // før ett finansfelt fjernes/ugyldiggjøres ved den testede tilstandsgrensen.
  for (const field of FinancialFieldSchema.options) {
    if (options.values?.[field] === '' || (field === 'P' && options.values?.P === '0')) {
      state = sessionReducer(state, { type: 'register-value', field, rawValue: options.values![field]! })
    }
  }
  if (options.beforeCalculation) state = options.beforeCalculation(state)
  state = sessionReducer(state, { type: 'calculate-result' })
  return state
}
