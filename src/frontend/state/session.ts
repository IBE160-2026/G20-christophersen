import type {
  FinancialField, RawFinancialInput, RecurringField, RegisteredPeriod,
} from '../../contracts/financial-input.ts'

export interface SessionState {
  financial: RawFinancialInput
  currentStep: 'tallgrunnlag'
}

export type SessionAction =
  | { type: 'register-value'; field: FinancialField; rawValue: string }
  | { type: 'register-period'; field: RecurringField; period: RegisteredPeriod }
  | { type: 'register-year'; field: RecurringField; year: string }
  | { type: 'navigate'; step: 'tallgrunnlag' }

export function createInitialSession(): SessionState {
  return {
    financial: {
      P: { rawValue: '', confirmed: false },
      L: { rawValue: '', confirmed: false, period: '', year: '' },
      D: { rawValue: '', confirmed: false, period: '', year: '' },
      J: { rawValue: '', confirmed: false, period: '', year: '' },
      Ymin: { rawValue: '', confirmed: false },
    },
    currentStep: 'tallgrunnlag',
  }
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  if (action.type === 'navigate') return state

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
