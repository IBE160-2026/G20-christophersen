import Big from 'big.js'
import { financingSuggestion } from './financing.ts'
import { parseFinancialDecimal } from './validation.ts'

const Decimal = Big()
Decimal.strict = true
Decimal.DP = 50

export type ScenarioValue = 'P' | 'L' | 'D' | 'cashRequired' | 'sharedAnnualPayment'
/** Unauthoritative annual amounts. No confirmation flags or screening input. */
export interface ScenarioBasis {
  P: string | null; L: string | null; D: string | null
  cashRequired: string | null; sharedAnnualPayment: string | null
  year: string | null; issues: string[]; provenance: Record<ScenarioValue, string>
}
export interface ScenarioControls { equity: string; annualInterest: string; months: string }
export interface ScenarioPoint {
  month: number; year: string; balance: string; cumulativeCashFlow: string | null
  interest: string; principal: string
}
export interface ScenarioSensitivity { annualInterest: string; cashFlow: string | null }
export interface FinancialScenario {
  basis: ScenarioBasis; controls: ScenarioControls
  loan: string | null; monthly: string | null; annual: string | null; J: string | null
  grossYield: string | null; netYield: string | null; noi: string | null; cashFlow: string | null
  issues: string[]; series: ScenarioPoint[]; sensitivity: ScenarioSensitivity[]
}

function nonnegative(value: string | null): string | null {
  const parsed = value === null ? null : parseFinancialDecimal(value)
  return parsed !== null && new Decimal(parsed).gte('0') ? parsed : null
}

/** Same cent-rounded annuity as production financing. Scenario only; never evaluates a deal. */
export function calculateFinancialScenario(basis: ScenarioBasis, controls: ScenarioControls, options: { includeSensitivity?: boolean } = {}): FinancialScenario {
  const P = nonnegative(basis.P), L = nonnegative(basis.L), D = nonnegative(basis.D)
  const cash = nonnegative(basis.cashRequired), shared = nonnegative(basis.sharedAnnualPayment)
  const issues = [...basis.issues]
  const price = P !== null && new Decimal(P).gt('0') ? P : null
  const grossYield = price !== null && L !== null ? new Decimal(L).times('100').div(price).toFixed() : null
  const noi = L !== null && D !== null ? new Decimal(L).minus(D).toFixed() : null
  const netYield = price !== null && noi !== null ? new Decimal(noi).times('100').div(price).toFixed() : null
  if (price === null) issues.push('Totalpris mangler eller er ugyldig. Yield kan ikke beregnes.')
  if (L === null) issues.push('Leieinntekt mangler eller er ugyldig.')
  if (D === null) issues.push('Fullstendig årlig drift mangler eller er ugyldig.')
  if (shared === null) issues.push('Betaling på fellesgjeld er ukjent. Samlet gjeldsbetaling og kontantstrøm kan ikke beregnes.')
  const financing = financingSuggestion({ ...controls, cashRequired: cash, sharedAnnualPayment: shared })
  if (cash === null) issues.push('Kontantbehov ved kjøp er ukjent. Det settes ikke lik totalpris inklusive fellesgjeld.')
  if (financing.error) issues.push(financing.error)
  const cashFlow = noi !== null && financing.J !== null ? new Decimal(noi).minus(financing.J).toFixed() : null
  const series: ScenarioPoint[] = []
  const sensitivity: ScenarioSensitivity[] = []
  if (financing.loan !== null && financing.monthly !== null) {
    const months = Number(controls.months)
    const r = new Decimal(parseFinancialDecimal(controls.annualInterest)!).div('1200')
    let balance = new Decimal(financing.loan), annualInterest = new Decimal('0'), annualPrincipal = new Decimal('0')
    series.push({ month: 0, year: '0', balance: balance.toFixed(), cumulativeCashFlow: cashFlow === null ? null : '0', interest: '0', principal: '0' })
    for (let month = 1; month <= months; month++) {
      // Bound intermediate schedule precision; repeated multiplication must not
      // grow fifty additional decimal places every month. This is a display
      // projection, never financial input or a screening threshold.
      const interest = balance.times(r).round(50, Decimal.roundHalfUp)
      // The contractual last payment settles the remaining rounding difference.
      const rawPrincipal = new Decimal(financing.monthly).minus(interest)
      const principal = month === months || rawPrincipal.gt(balance) ? balance : rawPrincipal.lt('0') ? new Decimal('0') : rawPrincipal
      balance = balance.minus(principal).round(50, Decimal.roundHalfUp)
      annualInterest = annualInterest.plus(interest)
      annualPrincipal = annualPrincipal.plus(principal)
      if (month % 12 === 0 || month === months) {
        series.push({ month, year: new Decimal(String(month)).div('12').toFixed(), balance: balance.toFixed(2, Decimal.roundHalfUp),
          cumulativeCashFlow: cashFlow === null ? null : new Decimal(cashFlow).times(String(month)).div('12').toFixed(2, Decimal.roundHalfUp),
          interest: annualInterest.toFixed(2, Decimal.roundHalfUp), principal: annualPrincipal.toFixed(2, Decimal.roundHalfUp) })
        annualInterest = new Decimal('0'); annualPrincipal = new Decimal('0')
      }
    }
    const rates = options.includeSensitivity ? Array.from({ length: 21 }, (_, step) => new Decimal('2').plus(new Decimal(String(step)).times('0.5')).toFixed()) : []
    const selectedRate = parseFinancialDecimal(controls.annualInterest)!
    if (options.includeSensitivity && new Decimal(selectedRate).gte('2') && new Decimal(selectedRate).lte('12') && !rates.includes(selectedRate)) rates.push(selectedRate)
    rates.sort((left, right) => new Decimal(left).cmp(right))
    for (const annualInterest of rates) {
      const alternative = financingSuggestion({ ...controls, annualInterest, cashRequired: cash, sharedAnnualPayment: shared })
      sensitivity.push({ annualInterest, cashFlow: noi !== null && alternative.J !== null ? new Decimal(noi).minus(alternative.J).toFixed() : null })
    }
  }
  return { basis: structuredClone(basis), controls: { ...controls }, loan: financing.loan, monthly: financing.monthly,
    annual: financing.annual, J: financing.J, grossYield, netYield, noi, cashFlow,
    issues: [...new Set(issues)], series, sensitivity }
}
