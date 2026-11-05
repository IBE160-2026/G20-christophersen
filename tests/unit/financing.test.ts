import { describe, expect, it } from 'vitest'
import { financingSuggestion, equityForLeverage } from '../../src/domain/financing.ts'
const input = { cashRequired: '3075000', equity: '1075000', annualInterest: '0', months: '240', sharedAnnualPayment: null }
describe('FINN-1 finansieringsfasit', () => {
  it('øreavrunder måned før år og finansierer ikke fellesgjeld på nytt', () => {
    expect(financingSuggestion(input)).toMatchObject({ loan: '2000000', monthly: '8333.33', annual: '99999.96', J: null })
    expect(financingSuggestion({ ...input, sharedAnnualPayment: '12000' }).J).toBe('111999.96')
  })
  it('håndterer null lån og positiv annuitetsrente', () => {
    expect(financingSuggestion({ ...input, equity: '3075000' })).toMatchObject({ loan: '0', monthly: '0.00', annual: '0.00' })
    expect(financingSuggestion({ ...input, annualInterest: '6' })).toMatchObject({ monthly: '14328.62', annual: '171943.44' })
  })
  it('kontantkjøp krever ingen lånevilkår, men ukjent fellesbetaling blir ikke null', () => {
    const cashPurchase = { ...input, equity: input.cashRequired, annualInterest: '', months: '' }
    expect(financingSuggestion(cashPurchase)).toMatchObject({ loan: '0', monthly: '0.00', annual: '0.00', J: null, error: null })
    expect(financingSuggestion({ ...cashPurchase, sharedAnnualPayment: '12000' }).J).toBe('12000.00')
    expect(financingSuggestion({ ...cashPurchase, sharedAnnualPayment: '0' }).J).toBe('0.00')
  })
  it.each(['', '0', '-1', '1.5', '1201', '99999999999999', 'abc'])('blokkerer ugyldig løpetid %s', months => {
    expect(financingSuggestion({ ...input, months }).monthly).toBeNull()
  })
  it.each(['-1', '3075001', 'abc', ''])('blokkerer ugyldig egenkapital %s', equity => expect(financingSuggestion({ ...input, equity }).loan).toBeNull())
  it.each(['', '-1', '101', 'abc'])('krever eksplisitt gyldig rente %s', annualInterest => expect(financingSuggestion({ ...input, annualInterest }).monthly).toBeNull())
})

describe('Belåningsgrad og eksplisitt avrunding ved endepunktene', () => {
  const capital = { price: '4050000', cashRequired: '4152340', sharedDebt: '0' }
  it('regner vanlig belåning som invers egenkapital uten å endre finansgrunnlag', () => {
    expect(equityForLeverage({ ...capital, leverage: '95' })).toEqual({ equity: '304840.00', roundedBoundary: null })
  })
  it('aksepterer det viste avrundede maksimumet og forteller at egenkapital null er valgt', () => {
    expect(equityForLeverage({ ...capital, leverage: '102,53' })).toEqual({ equity: '0', roundedBoundary: 'maximum' })
    expect(equityForLeverage({ ...capital, leverage: '102.54' }).equity).toBeNull()
    expect(equityForLeverage({ ...capital, leverage: '-1' }).equity).toBeNull()
  })
  it('håndterer både opp- og nedavrundede endepunkter ved fellesgjeld', () => {
    const basis = { price: '3000000', cashRequired: '1000000', sharedDebt: '1000000' }
    expect(equityForLeverage({ ...basis, leverage: '33.33' })).toEqual({ equity: '1000000', roundedBoundary: 'minimum' })
    expect(equityForLeverage({ ...basis, leverage: '66.67' })).toEqual({ equity: '0', roundedBoundary: 'maximum' })
    expect(equityForLeverage({ ...basis, leverage: '33.32' }).equity).toBeNull()
    expect(equityForLeverage({ ...basis, leverage: '66.68' }).equity).toBeNull()
    expect(equityForLeverage({ ...basis, leverage: '50' })).toEqual({ equity: '500000.00', roundedBoundary: null })
  })
  it('ukjent kapitalgrunnlag gir aldri antatt null i inverse beregninger', () => {
    expect(equityForLeverage({ ...capital, sharedDebt: null, leverage: '80' }).equity).toBeNull()
    expect(equityForLeverage({ ...capital, price: '0', leverage: '80' }).equity).toBeNull()
  })
})
