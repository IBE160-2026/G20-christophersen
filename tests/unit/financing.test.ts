import { describe, expect, it } from 'vitest'
import { financingSuggestion } from '../../src/domain/financing.ts'
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
  it.each(['', '0', '-1', '1.5', '1201', '99999999999999', 'abc'])('blokkerer ugyldig løpetid %s', months => {
    expect(financingSuggestion({ ...input, months }).monthly).toBeNull()
  })
  it.each(['-1', '3075001', 'abc', ''])('blokkerer ugyldig egenkapital %s', equity => expect(financingSuggestion({ ...input, equity }).loan).toBeNull())
  it.each(['', '-1', '101', 'abc'])('krever eksplisitt gyldig rente %s', annualInterest => expect(financingSuggestion({ ...input, annualInterest }).monthly).toBeNull())
})
