import Big from 'big.js'
import type { FinancialMetric } from '../contracts/finance.ts'
import type {
  FinancialPresentationInput, PresentedFinancialMetric, PresentedFinancialMetrics,
} from '../contracts/presentation.ts'
import type { CashFlowThreshold, NetYieldThreshold } from '../contracts/thresholds.ts'

const Decimal = Big()
Decimal.strict = true

/** Lokaliserer ferdig desimaltekst; ingen konvertering til binært flyttall. */
function norwegian(fixed: string): string {
  const negative = fixed.startsWith('-') && !new Decimal(fixed).eq('0')
  const [integer, fraction] = fixed.replace(/^-/, '').split('.')
  return `${negative ? '−' : ''}${integer!.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')}${fraction === undefined ? '' : `,${fraction}`}`
}

function amountAt(amount: string, decimals: number): string {
  return new Decimal(amount).toFixed(decimals, Decimal.roundHalfUp)
}

function percentAt(numerator: string, denominator: string, decimals: number): string {
  // Egen konstruktør per divisjon; verken global Big-konfigurasjon eller
  // finans-/terskelmodulenes presisjon kan påvirkes av visningsbehov.
  const Division = Big()
  Division.strict = true
  Division.DP = decimals
  Division.RM = Division.roundHalfUp
  return new Division(numerator).times('100').div(denominator).toFixed(decimals)
}

function formatMetric(
  name: string, metric: FinancialMetric, partialBasis: boolean,
  threshold: NetYieldThreshold | CashFlowThreshold | null = null,
): PresentedFinancialMetric {
  const ratio = metric.status === 'available' ? metric.value.kind === 'ratio' : name.endsWith('yield')
  const minimum = threshold && 'minimumYield' in threshold.basis
    ? threshold.basis.minimumYield.decimal : null
  const result: PresentedFinancialMetric = {
    name, unit: ratio ? '%' : 'kr/år', year: metric.basis.year,
    partialLabel: partialBasis ? 'Delgrunnlag' : null,
    statusLabel: metric.status === 'available' ? 'Beregnet' : 'Ikke beregnbart',
    displayValue: null, metric: structuredClone(metric),
    threshold: threshold ? {
      decision: structuredClone(threshold.decision),
      basis: structuredClone(threshold.basis),
      minimumDisplayValue: minimum === null ? null : norwegian(amountAt(minimum, 3)),
      minimumDetailValue: minimum === null ? null : norwegian(minimum),
    } : null,
    detail: null, rounding: null,
  }
  if (metric.status === 'unavailable') return result

  if (metric.value.kind === 'amount') {
    const { amount } = metric.value
    const normal = amountAt(amount, 0)
    result.displayValue = norwegian(normal)
    result.detail = {
      displayValue: norwegian(amount), decimalPlaces: amount.split('.')[1]?.length ?? 0, approximate: false,
    }
    if (new Decimal(amount).lt('0') && new Decimal(normal).eq('0')) {
      result.rounding = {
        code: 'negative-rounded-to-zero',
        explanation: threshold?.decision.status === 'breached'
          ? 'Kontantstrømmen er negativ før avrunding. Visningen 0 kr/år betyr ikke at nullgrensen er bestått; regelen bruker det uavrundede beløpet.'
          : 'Beløpet er negativt før avrunding. Visningen 0 kr/år skjuler fortegnet; detaljen viser det uavrundede beløpet.',
      }
    }
    return result
  }

  const { numerator, denominator } = metric.value
  const normal = percentAt(numerator, denominator, 3)
  result.displayValue = norwegian(normal)
  const hiddenBreach = threshold?.decision.status === 'breached' && minimum !== null
    && new Decimal(normal).gte(amountAt(minimum, 3))
  let decimals = 8
  let detail = percentAt(numerator, denominator, decimals)
  // Her velges bare lesbar detaljpresisjon. Det mottatte eksakte terskel-
  // utfallet avgjøres aldri på nytt og endres ikke av sammenlikningen.
  while (threshold?.decision.status === 'breached' && minimum !== null && new Decimal(detail).gte(minimum)) {
    decimals *= 2
    detail = percentAt(numerator, denominator, decimals)
  }
  result.detail = {
    displayValue: norwegian(detail), decimalPlaces: decimals,
    approximate: !new Decimal(detail).times(denominator).eq(new Decimal(numerator).times('100')),
  }
  if (hiddenBreach) {
    result.rounding = {
      code: 'hidden-net-yield-breach',
      explanation: 'Nettoyield er under avkastningskravet før avrunding. Hovedvisningen skjuler forskjellen; regelen bruker uavrundet grunnlag uten toleransemargin. Se detaljverdien og det eksakte kravet.',
    }
  }
  return result
}

/** Enveis presentasjon av allerede beregnede tall/terskler, ingen ny gyldighet
 * eller anbefaling. Kalleren oppgir kjent delgrunnlag fra felles kontroll.
 */
export function formatFinancialMetrics(
  input: FinancialPresentationInput, context: { partialBasis: boolean },
): PresentedFinancialMetrics {
  return {
    grossYield: formatMetric('Bruttoyield', input.grossYield, context.partialBasis),
    noi: formatMetric('NOI', input.noi, context.partialBasis),
    netYield: formatMetric('Nettoyield', input.netYield.basis.metric, context.partialBasis, input.netYield),
    cashFlowBeforeTax: formatMetric('Kontantstrøm før skatt', input.cashFlowBeforeTax.basis.metric,
      context.partialBasis, input.cashFlowBeforeTax),
  }
}
