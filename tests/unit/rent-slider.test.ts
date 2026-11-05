import { expect, it } from 'vitest'
import { withScenarioRent, withScenarioOperatingCosts } from '../../src/frontend/investment/rent-scenario.ts'
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

it('samlet drift erstatter kjente kostnader uten dobbelttelling eller endring av dokumentgrunnlag', () => {
  const before = structuredClone(basis)
  const edited = withScenarioOperatingCosts(basis, '3000,50')
  const result = calculateFinancialScenario(edited, controls)
  expect(edited.D).toBe('36006')
  expect(result.noi).toBe('107994')
  expect(Number(result.netYield)).toBeCloseTo(107994 / 4050000 * 100, 12)
  expect(result.preliminaryNoi).toBe('118803')
  expect(edited.provenance.D).toContain('Erstatter')
  expect(basis).toEqual(before)
  expect(withScenarioOperatingCosts(basis, null)).toBe(basis)
})

it.each(['', '-1', 'feil'])('ugyldig/blank totaldrift %s blir ukjent mens bruttoyield beholdes', monthly => {
  const result = calculateFinancialScenario(withScenarioOperatingCosts({ ...basis, D: '10000' }, monthly), controls)
  expect(result.grossYield).not.toBeNull()
  expect(result.noi).toBeNull(); expect(result.netYield).toBeNull(); expect(result.cashFlow).toBeNull()
})

it('gyldige scenarioforutsetninger viser egne mangler uten foreldede kontrollmangler for leie og drift', () => {
  const incomplete = { ...basis, issues: ['L: Verdien mangler.', 'D: Perioden mangler.', 'Rapportdekning er ufullstendig.'] }
  const complete = withScenarioOperatingCosts(withScenarioRent(incomplete, '16000'), '3000')
  expect(complete.issues.join(' ')).not.toMatch(/L:|D:/)
  expect(complete.issues).toContain('Rapportdekning er ufullstendig.')
  expect(incomplete.issues).toContain('D: Perioden mangler.')
})
