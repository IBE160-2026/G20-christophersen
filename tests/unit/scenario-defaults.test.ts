import { expect, it } from 'vitest'
import { defaultScenarioFinancing } from '../../src/domain/financing.ts'
import { calculateFinancialScenario, type ScenarioBasis } from '../../src/domain/financial-scenario.ts'
const basis: ScenarioBasis = { P: '4050000', cashRequired: '4152340', sharedDebt: '0', sharedAnnualPayment: '0', L: null, D: null, year: null, issues: [], provenance: { P: '', L: '', D: '', cashRequired: '', sharedAnnualPayment: '' } }
it('dekker 20 prosent av prisen samt alle kjøpsomkostninger', () => {
  const controls = defaultScenarioFinancing(basis)
  expect(controls).toEqual({ equity: '912340.00', annualInterest: '6', months: '360' })
  expect(calculateFinancialScenario(basis, controls)).toMatchObject({ leverage: '80', loan: '3240000' })
})
it('trekker fellesgjeld fra privat lån og håndterer allerede høyere belåning', () => {
  const shared = { ...basis, P: '5000000', cashRequired: '4100000', sharedDebt: '1000000' }
  expect(calculateFinancialScenario(shared, defaultScenarioFinancing(shared))).toMatchObject({ leverage: '80', loan: '3000000', totalDebt: '4000000' })
  expect(defaultScenarioFinancing({ ...shared, sharedDebt: '4500000', cashRequired: '600000' }).equity).toBe('600000')
})
it('finner ikke på egenkapital når kjøpsgrunnlaget er ukjent', () => {
  expect(defaultScenarioFinancing({ ...basis, cashRequired: null }).equity).toBe('')
})
