import Big from 'big.js'
import { parseFinancialDecimal } from './validation.ts'
const Decimal = Big()
Decimal.strict = true
Decimal.DP = 50
export interface FinancingInput { cashRequired: string | null; equity: string; annualInterest: string; months: string; sharedAnnualPayment: string | null }
/** Separat brukerforutsetning. Måneden øreavrundes før årsbetalingen beregnes. */
export function financingSuggestion(input: FinancingInput) {
  const cash = input.cashRequired === null ? null : parseFinancialDecimal(input.cashRequired)
  const equity = parseFinancialDecimal(input.equity), interest = parseFinancialDecimal(input.annualInterest)
  const validMoney = (value: string | null) => value !== null && new Decimal(value).gte('0')
  if (!validMoney(cash) || !validMoney(equity) || new Decimal(equity!).gt(cash!)) return { loan: null, monthly: null, annual: null, J: null, error: 'Oppgi egenkapital mellom 0 og kontantbehovet.' }
  const loan = new Decimal(cash!).minus(equity!).toFixed()
  if (!validMoney(interest) || new Decimal(interest!).gt('100') || !/^[1-9]\d{0,3}$/.test(input.months) || Number(input.months) > 1200) return { loan, monthly: null, annual: null, J: null, error: 'Oppgi rente fra 0 til 100 % og løpetid fra 1 til 1200 hele måneder.' }
  const r = new Decimal(interest!).div('1200')
  const monthly = loan === '0' ? '0.00' : r.eq('0') ? new Decimal(loan).div(input.months).toFixed(2, Decimal.roundHalfUp)
    : new Decimal(loan).times(r).div(new Decimal('1').minus(new Decimal('1').plus(r).pow(-Number(input.months)))).toFixed(2, Decimal.roundHalfUp)
  const annual = new Decimal(monthly).times('12').toFixed(2)
  const shared = input.sharedAnnualPayment === null ? null : parseFinancialDecimal(input.sharedAnnualPayment)
  return { loan, monthly, annual, J: validMoney(shared) ? new Decimal(annual).plus(shared!).toFixed(2) : null, error: null }
}
