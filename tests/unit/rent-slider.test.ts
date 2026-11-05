import { expect, it } from 'vitest'
import { withScenarioRent } from '../../src/frontend/investment/rent-scenario.ts'
import { calculateFinancialScenario } from '../../src/domain/financial-scenario.ts'
import type { ScenarioBasis } from '../../src/domain/financial-scenario.ts'

const basis: ScenarioBasis = { P: '4050000', L: '144000', D: null, cashRequired: null, sharedAnnualPayment: '0',
  preliminaryOperatingSubtotal: '25197', preliminaryCostYear: null, year: '2025', issues: ['Ukjente kostnader er ikke null.'],
  provenance: { P: 'Dokument', L: 'SSB-referanse', D: 'Ukjent', cashRequired: 'Ukjent', sharedAnnualPayment: 'Dokument' } }
const controls = { equity: '', annualInterest: '', months: '' }

it('prøvd leie og publisert reset gir uavhengig kontrollert matematikk uten å endre fakta eller ukjente', () => {
  const before = structuredClone(basis)
  for (const monthly of ['15000', '13891']) {
    const edited = withScenarioRent(basis, monthly), result = calculateFinancialScenario(edited, controls)
    expect(edited.L).toBe(String(Number(monthly) * 12))
    expect(Number(result.grossYield)).toBeCloseTo(Number(monthly) * 12 / 4050000 * 100, 12)
    expect(Number(result.preliminaryNoi)).toBe(Number(monthly) * 12 - 25197)
    expect(Number(result.preliminaryNetYield)).toBeCloseTo((Number(monthly) * 12 - 25197) / 4050000 * 100, 12)
    expect(result.netYield).toBeNull(); expect(result.cashFlow).toBeNull()
    expect(edited.provenance.L).toContain('Egen leieforutsetning')
    expect(edited.provenance.L).toContain('ikke dokumentert leie')
    expect(edited.issues).toContain('Ukjente kostnader er ikke null.')
  }
  expect(basis).toEqual(before)
  expect(withScenarioRent(basis, null)).toBe(basis)
})

it.each(['', '-1', 'feil'])('ugyldig leie %s fjerner berørte tall uten å gjeninnføre tidligere leie', monthly => {
  const result = calculateFinancialScenario(withScenarioRent(basis, monthly), controls)
  expect(result.grossYield).toBeNull(); expect(result.preliminaryNoi).toBeNull()
})
