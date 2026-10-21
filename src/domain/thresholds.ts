import Big from 'big.js'
import type { FinancialBasis } from '../contracts/financial-basis.ts'
import type {
  CashFlowThreshold, FinancialThresholdDecision, NetYieldThreshold,
} from '../contracts/thresholds.ts'
import { calculateFinancialMetrics } from './finance.ts'
import { validateFinancialBasis } from './financial-basis.ts'

const Decimal = Big()
Decimal.strict = true

function compare(left: string, right: string): FinancialThresholdDecision {
  return {
    status: new Decimal(left).gte(right) ? 'passed' : 'breached',
    comparison: { left, operator: '>=', right }, issues: [],
  }
}

/** Ymin er prosent, ikke forholdstall. Kryssmultiplikasjon krever ingen divisjon. */
export function evaluateNetYieldThreshold(input: FinancialBasis): NetYieldThreshold {
  const metric = calculateFinancialMetrics(input).netYield
  const validated = validateFinancialBasis(input, ['L', 'D'])
  const minimumYield = validated.fields.Ymin
  const basis: NetYieldThreshold['basis'] = {
    formula: '100 * NOI >= P * Ymin', metric,
    minimumYield: {
      registered: minimumYield.registered, source: validated.registeredBasis.sources.Ymin,
      decimal: minimumYield.decimal, unit: 'percent',
    },
  }
  const issues = [...metric.issues, ...minimumYield.issues]
  if (metric.status === 'unavailable' || minimumYield.status === 'insufficient') {
    return { decision: { status: 'unavailable', comparison: null, issues }, basis }
  }
  // 3.1 garanterer positiv P og eksakt NOI/P for tilgjengelig nettoyield.
  if (metric.value.kind !== 'ratio') throw new Error('Nettoyield må ha eksakt teller og nevner.')
  return {
    decision: compare(new Decimal(metric.value.numerator).times('100').toFixed(),
      new Decimal(metric.value.denominator).times(minimumYield.decimal!).toFixed()),
    basis,
  }
}

/** Uavhengig nullgrense; P og Ymin inngår ikke i kontantstrømgrunnlaget. */
export function evaluateCashFlowThreshold(input: FinancialBasis): CashFlowThreshold {
  const metric = calculateFinancialMetrics(input).cashFlowBeforeTax
  const basis: CashFlowThreshold['basis'] = { formula: 'L−D−J >= 0', metric }
  if (metric.status === 'unavailable') {
    return { decision: { status: 'unavailable', comparison: null, issues: metric.issues }, basis }
  }
  if (metric.value.kind !== 'amount') throw new Error('Kontantstrøm må ha et eksakt årsbeløp.')
  return { decision: compare(metric.value.amount, '0'), basis }
}
