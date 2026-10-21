import Big from 'big.js'
import type { FinancialBasis } from '../contracts/financial-basis.ts'
import type { FinancialField, RecurringField } from '../contracts/financial-input.ts'
import type { FinancialMetric, FinancialMetricBasis, FinancialMetrics } from '../contracts/finance.ts'
import { validateFinancialBasis } from './financial-basis.ts'

const Decimal = Big()
Decimal.strict = true

type CalculationField = Exclude<FinancialField, 'Ymin'>

function calculateMetric(
  input: FinancialBasis, fields: readonly CalculationField[], formula: string, kind: 'amount' | 'ratio',
): FinancialMetric {
  const yearFields = fields.filter((field): field is RecurringField => field !== 'P')
  const validated = validateFinancialBasis(input, yearFields)
  const basis: FinancialMetricBasis = {
    formula,
    inputs: fields.map((field) => {
      const value = validated.fields[field]
      return {
        field, registered: value.registered, source: validated.registeredBasis.sources[field],
        decimal: value.decimal, normalization: 'normalization' in value ? value.normalization : null,
        unit: 'NOK',
      }
    }),
    year: validated.commonYear,
    costBreakdown: fields.includes('D') || fields.includes('J') ? validated.costBreakdown : null,
  }
  const issues = fields.flatMap((field) => validated.fields[field].issues)
  if (issues.length > 0) return { status: 'unavailable', value: null, basis, issues }

  // Felles validering garanterer bekreftede årsverdier og positiv P før bruk.
  const annualRent = validated.fields.L.normalization!.annualValue
  const numerator = fields.includes('D')
    ? new Decimal(annualRent).minus(validated.fields.D.normalization!.annualValue).toFixed()
    : annualRent
  const value = kind === 'ratio'
    ? { kind, numerator, denominator: validated.fields.P.decimal!, unit: 'ratio' as const }
    : { kind, amount: fields.includes('J')
      ? new Decimal(numerator).minus(validated.fields.J.normalization!.annualValue).toFixed()
      : numerator, unit: 'NOK/year' as const }
  return { status: 'available', value, basis, issues: [] }
}

/** Fire uavhengige delberegninger; ingen terskel, anbefaling eller rapportinput.
 * Hver beregning bruker samme valideringsautoritet for bare sine årsavhengigheter.
 * Alle beløp er eksakte strenger; yield bevarer teller/nevner uten dividering.
 */
export function calculateFinancialMetrics(input: FinancialBasis): FinancialMetrics {
  return {
    grossYield: calculateMetric(input, ['P', 'L'], 'L/P', 'ratio'),
    noi: calculateMetric(input, ['L', 'D'], 'L−D', 'amount'),
    netYield: calculateMetric(input, ['P', 'L', 'D'], '(L−D)/P', 'ratio'),
    cashFlowBeforeTax: calculateMetric(input, ['L', 'D', 'J'], 'L−D−J', 'amount'),
  }
}
