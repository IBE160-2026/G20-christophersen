import { expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ScenarioFinancing } from '../../src/frontend/investment/ScenarioFinancing.tsx'
import { calculateFinancialScenario } from '../../src/domain/financial-scenario.ts'
import type { ScenarioBasis } from '../../src/domain/financial-scenario.ts'

it.each([
  ['4050000', '4152340', '0', '0'],
  ['8600000', '8816090', '0', '0'],
  ['3000000', '1000000', '1000000', '1000000'],
])('beholder belåningsslider ved eksakt endepunkt P=%s, kontantbehov=%s, fellesgjeld=%s, egenkapital=%s', (P, cashRequired, sharedDebt, equity) => {
  const basis: ScenarioBasis = { P, cashRequired, sharedDebt, L: '288000', D: '36000', sharedAnnualPayment: '0', year: '2026', issues: [],
    provenance: { P: 'Testgrunnlag', cashRequired: 'Testgrunnlag', L: 'Egen forutsetning', D: 'Egen forutsetning', sharedAnnualPayment: 'Testgrunnlag' } }
  const controls = { equity, annualInterest: '5.5', months: '12' }
  const scenario = calculateFinancialScenario(basis, controls)
  const markup = renderToStaticMarkup(<ScenarioFinancing basis={basis} controls={controls} scenario={scenario} onChange={() => {}} />)
  expect(markup).toContain('aria-label="Juster belåningsgrad"')
  expect(markup).not.toContain('Oppgi belåningsgrad mellom')
  expect(markup).toContain('Årsbeløp er 12 ganger månedsnivået')
})
