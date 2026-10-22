import { createReportState, findingListAssessment, reportReducer } from './report.ts'
import type { ReportAction, ReportState } from './report.ts'
import type {
  FinancialField, RegisteredFinancialInput, RecurringField, RegisteredPeriod,
} from '../../contracts/financial-input.ts'
import { FinancialFieldSchema } from '../../contracts/financial-input.ts'
import { validateFinancialBasis } from '../../domain/financial-basis.ts'
import { parseFinancialDecimal } from '../../domain/validation.ts'
import type { CostItem, FinancialSource, FinancialSources, RentNature } from '../../contracts/financial-basis.ts'
import type { ResultChange, ResultSnapshot } from '../../contracts/result.ts'
import { calculateResultSnapshot, describeResultChange, resultBinding, sameResultBinding } from './result.ts'

export interface SessionState {
  financial: RegisteredFinancialInput
  sources: FinancialSources
  costItems: CostItem[]
  nextCostId: number
  currentStep: 'tallgrunnlag' | 'tilstandsrapport' | 'kontroller-funn' | 'resultat'
  report: ReportState
  financialRevision: number
  changedFields: FinancialField[]
  explicitZeros: FinancialField[]
  confirmationAttempts: number
  resultSnapshot: ResultSnapshot | null
  resultChanges: ResultChange[]
}

export type SessionAction = ReportAction
  | { type: 'calculate-result' }
  | { type: 'register-value'; field: FinancialField; rawValue: string }
  | { type: 'register-period'; field: RecurringField; period: RegisteredPeriod }
  | { type: 'register-year'; field: RecurringField; year: string }
  | { type: 'navigate'; step: SessionState['currentStep'] }
  | { type: 'confirm-financial' }
  | { type: 'check-zero'; field: FinancialField; checked: boolean }
  | { type: 'register-source'; field: FinancialField; source: FinancialSource }
  | { type: 'register-rent-nature'; rentNature: RentNature }
  | { type: 'add-cost' }
  | { type: 'change-cost'; id: string; update: Partial<Omit<CostItem, 'id'>> }
  | { type: 'remove-cost'; id: string }

export function createInitialSession(): SessionState {
  const source = (): FinancialSource => ({ kind: '', description: '', conflict: null })
  return {
    financial: {
      P: { rawValue: '', confirmed: false },
      L: { rawValue: '', confirmed: false, period: '', year: '' },
      D: { rawValue: '', confirmed: false, period: '', year: '' },
      J: { rawValue: '', confirmed: false, period: '', year: '' },
      Ymin: { rawValue: '', confirmed: false },
    },
    sources: { P: source(), L: { ...source(), rentNature: '' }, D: source(), J: source(), Ymin: source() },
    costItems: [],
    nextCostId: 1,
    currentStep: 'tallgrunnlag', report: createReportState(),
    financialRevision: 0, changedFields: [], explicitZeros: [], confirmationAttempts: 0,
    resultSnapshot: null, resultChanges: [],
  }
}

/** Kandidaten valideres av samme domain-autoritet før bekreftelse kan settes.
 * Den eksplisitte nullkontrollen gjelder bare gjeldende, uendret feltgrunnlag.
 */
export function confirmationCandidate(state: SessionState) {
  let values = { ...state.financial }
  for (const field of FinancialFieldSchema.options) values = { ...values, [field]: {
    ...values[field], confirmed: parseFinancialDecimal(values[field].rawValue) !== '0' || state.explicitZeros.includes(field),
  } }
  return { values, sources: state.sources, costItems: state.costItems }
}

export function isFinancialConfirmed(state: SessionState): boolean {
  return validateFinancialBasis({ values: state.financial, sources: state.sources, costItems: state.costItems }).issues.length === 0
}

function invalidate(state: SessionState, update: Partial<SessionState>, fields: FinancialField[]): SessionState {
  let financial = { ...state.financial, ...(update.financial ?? {}) }
  const changedFields = [...state.changedFields]
  for (const field of fields) {
    if (state.financial[field].confirmed && !changedFields.includes(field)) changedFields.push(field)
    financial = { ...financial, [field]: { ...financial[field], confirmed: false } }
  }
  return { ...state, ...update, financial, changedFields,
    financialRevision: state.financialRevision + 1,
    explicitZeros: state.explicitZeros.filter((field) => !fields.includes(field)),
  }
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  if (action.type === 'calculate-result') return { ...state, resultSnapshot: calculateResultSnapshot(state), resultChanges: [] }
  const next = reduceSession(state, action)
  if (!state.resultSnapshot || sameResultBinding(resultBinding(state), resultBinding(next))) return next
  const change = describeResultChange(action, state)
  return { ...next, resultChanges: [...state.resultChanges.filter(item => item.kind !== change.kind || item.target !== change.target || item.message !== change.message), change] }
}

function reduceSession(state: SessionState, action: SessionAction): SessionState {
  if (action.type === 'report-start' && (!isFinancialConfirmed(state) || state.currentStep === 'tallgrunnlag')) return state
  if (action.type.startsWith('report-')) return { ...state, report: reportReducer(state.report, action as ReportAction) }
  if (action.type === 'navigate') {
    if (action.step === 'resultat') {
      if (state.resultSnapshot) {
        const binding = resultBinding(state)
        const previous = state.resultSnapshot.binding
        // Story 3.8 fornyer bare finans. Rapport-, liste- og TG3-endringer
        // må fortsatt beholde historisk resultat frem til sin egen kontrollflyt (3.9).
        const pendingFinancialChange = state.resultChanges.some(change => change.kind === 'financial')
        const financialChangeOnly = (pendingFinancialChange || !sameResultBinding(previous, binding)) && sameResultBinding(previous, {
          ...binding, financialRevision: previous.financialRevision, financialConfirmations: previous.financialConfirmations,
        })
        if (financialChangeOnly && isFinancialConfirmed(state) && findingListAssessment(state.report).controlCompleted) {
          return { ...state, currentStep: 'resultat', resultSnapshot: calculateResultSnapshot(state), resultChanges: [] }
        }
        return { ...state, currentStep: 'resultat', report: reportReducer(state.report, { type: 'report-abandon' }) }
      }
      if (!isFinancialConfirmed(state) || !findingListAssessment(state.report).controlCompleted) return state
      return { ...state, currentStep: 'resultat', resultSnapshot: calculateResultSnapshot(state), resultChanges: [] }
    }
    if (action.step === state.currentStep || (action.step !== 'tallgrunnlag' && !isFinancialConfirmed(state))
      || (action.step === 'kontroller-funn' && state.report.status !== 'completed')) return state
    return { ...state, currentStep: action.step, report: reportReducer(state.report, { type: 'report-abandon' }) }
  }
  if (action.type === 'confirm-financial') {
    const candidate = confirmationCandidate(state)
    if (validateFinancialBasis(candidate).issues.length !== 0) return { ...state, confirmationAttempts: state.confirmationAttempts + 1 }
    return { ...state, financial: candidate.values, changedFields: [], confirmationAttempts: state.confirmationAttempts + 1 }
  }
  if (action.type === 'check-zero') {
    if (parseFinancialDecimal(state.financial[action.field].rawValue) !== '0' || state.explicitZeros.includes(action.field) === action.checked) return state
    return { ...state, explicitZeros: action.checked ? [...state.explicitZeros, action.field] : state.explicitZeros.filter((field) => field !== action.field),
      financial: { ...state.financial, [action.field]: { ...state.financial[action.field], confirmed: false } } }
  }
  if (action.type === 'register-source') {
    const source = { ...state.sources[action.field], ...action.source }
    if (JSON.stringify(source) === JSON.stringify(state.sources[action.field])) return state
    return invalidate(state, { sources: { ...state.sources, [action.field]: source } }, [action.field])
  }
  if (action.type === 'register-rent-nature') {
    if (action.rentNature === state.sources.L.rentNature) return state
    return invalidate(state, { sources: { ...state.sources, L: { ...state.sources.L, rentNature: action.rentNature } } }, ['L'])
  }
  if (action.type === 'add-cost' || action.type === 'change-cost' || action.type === 'remove-cost') {
    const costItems = action.type === 'add-cost'
      ? [...state.costItems, { id: `cost-${state.nextCostId}`, label: '', rawAmount: '', rawDebt: '', includedIn: null }]
      : action.type === 'change-cost'
        ? state.costItems.map((item) => item.id === action.id ? { ...item, ...action.update } : item)
        : state.costItems.filter((item) => item.id !== action.id)
    if (JSON.stringify(costItems) === JSON.stringify(state.costItems)) return state
    return invalidate(state, { costItems, nextCostId: state.nextCostId + (action.type === 'add-cost' ? 1 : 0) }, ['D', 'J'])
  }

  if (action.type !== 'register-value' && action.type !== 'register-period' && action.type !== 'register-year') return state
  const value = state.financial[action.field]
  const update = action.type === 'register-value'
    ? { rawValue: action.rawValue }
    : action.type === 'register-period' ? { period: action.period } : { year: action.year }
  if (Object.entries(update).every(([key, content]) => value[key as keyof typeof value] === content)) return state
  // Kostnadspostenes D- og J-bidrag deler perioden/året fra D.
  const affected: FinancialField[] = action.field === 'D' && action.type !== 'register-value' && state.costItems.length > 0
    ? ['D', 'J'] : [action.field]
  return invalidate(state, { financial: { ...state.financial, [action.field]: { ...value, ...update } } }, affected)
}
