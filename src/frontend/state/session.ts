import type {
  FinancialField, RawFinancialInput, RecurringField, RegisteredPeriod,
} from '../../contracts/financial-input.ts'
import type { CostItem, FinancialSource, FinancialSources, RentNature } from '../../contracts/financial-basis.ts'

export interface SessionState {
  financial: RawFinancialInput
  sources: FinancialSources
  costItems: CostItem[]
  nextCostId: number
  currentStep: 'tallgrunnlag'
}

export type SessionAction =
  | { type: 'register-value'; field: FinancialField; rawValue: string }
  | { type: 'register-period'; field: RecurringField; period: RegisteredPeriod }
  | { type: 'register-year'; field: RecurringField; year: string }
  | { type: 'navigate'; step: 'tallgrunnlag' }
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
    currentStep: 'tallgrunnlag',
  }
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  if (action.type === 'navigate') return state
  if (action.type === 'register-source') {
    return {
      ...state,
      sources: { ...state.sources, [action.field]: { ...state.sources[action.field], ...action.source } },
      financial: { ...state.financial, [action.field]: { ...state.financial[action.field], confirmed: false } },
    }
  }
  if (action.type === 'register-rent-nature') {
    return { ...state, sources: { ...state.sources, L: { ...state.sources.L, rentNature: action.rentNature } },
      financial: { ...state.financial, L: { ...state.financial.L, confirmed: false } } }
  }
  if (action.type === 'add-cost' || action.type === 'change-cost' || action.type === 'remove-cost') {
    const costItems = action.type === 'add-cost'
      ? [...state.costItems, { id: `cost-${state.nextCostId}`, label: '', rawAmount: '', rawDebt: '', includedIn: null }]
      : action.type === 'change-cost'
        ? state.costItems.map((item) => item.id === action.id ? { ...item, ...action.update } : item)
        : state.costItems.filter((item) => item.id !== action.id)
    return {
      ...state, costItems, nextCostId: state.nextCostId + (action.type === 'add-cost' ? 1 : 0),
      financial: { ...state.financial, D: { ...state.financial.D, confirmed: false }, J: { ...state.financial.J, confirmed: false } },
    }
  }

  const value = state.financial[action.field]
  const update = action.type === 'register-value'
    ? { rawValue: action.rawValue }
    : action.type === 'register-period'
      ? { period: action.period }
      : { year: action.year }

  return {
    ...state,
    financial: {
      ...state.financial,
      [action.field]: { ...value, ...update, confirmed: false },
    },
  }
}
