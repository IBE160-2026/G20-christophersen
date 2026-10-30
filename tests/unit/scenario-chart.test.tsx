import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { ScenarioChart } from '../../src/frontend/investment/ScenarioChart.tsx'
import { calculateFinancialScenario } from '../../src/domain/financial-scenario.ts'
import type { ScenarioBasis } from '../../src/domain/financial-scenario.ts'
const basis: ScenarioBasis = { P: '1000000', L: '120000', D: '20000', cashRequired: '1000000', sharedAnnualPayment: '0', year: '2026', issues: [],
  provenance: { P: 'Fiktiv test', L: 'Egen forutsetning', D: 'Egen forutsetning', cashRequired: 'Fiktiv test', sharedAnnualPayment: 'Fiktiv test' } }
it('grafen har navngitte faner, tastaturinspektør og de samme verdiene i datatabellen', () => {
  const scenario = calculateFinancialScenario(basis, { equity: '1000000', annualInterest: '0', months: '24' })
  const markup = renderToStaticMarkup(createElement(ScenarioChart, { scenario }))
  expect(markup).toContain('role="tablist"'); expect(markup).toContain('aria-label="Velg scenariograf"')
  expect(markup).toContain('aria-selected="true"'); expect(markup).toContain('Utforsk grafen')
  expect(markup).toContain('<caption>Akkumulert kontantstrøm · scenario</caption>')
  expect(markup).toContain('200 000,00 kr'); expect(markup).toContain('2 år')
  expect(markup).toContain('ikke totalavkastning'); expect(markup).toContain('initial egenkapital')
})
it('ugyldig finansiering viser mangel fremfor et foreldet/nullfylt diagram', () => {
  const scenario = calculateFinancialScenario(basis, { equity: '', annualInterest: '0', months: '24' })
  const markup = renderToStaticMarkup(createElement(ScenarioChart, { scenario }))
  expect(markup).toContain('role="status"'); expect(markup).toContain('Grafen krever kjent leie')
  expect(markup).not.toContain('<svg'); expect(markup).not.toContain('<table')
})
it('negative kontantstrømmer vises med fortegn også i tilgjengelig tabell', () => {
  const scenario = calculateFinancialScenario({ ...basis, L: '0' }, { equity: '1000000', annualInterest: '0', months: '12' })
  const markup = renderToStaticMarkup(createElement(ScenarioChart, { scenario }))
  expect(markup).toContain('−20 000,00 kr'); expect(markup).toContain('chart-svg')
})
it('pågående oppdatering viser beregning og skjuler alle eldre grafpunkter', () => {
  const scenario = calculateFinancialScenario(basis, { equity: '1000000', annualInterest: '0', months: '24' })
  const markup = renderToStaticMarkup(createElement(ScenarioChart, { scenario, pending: true }))
  expect(markup).toContain('Beregner scenario …'); expect(markup).not.toContain('<svg'); expect(markup).not.toContain('<table')
})

it('for store SVG-koordinater gir eksplisitt visningsgrense uten NaN eller krasj', () => {
  const scenario = calculateFinancialScenario({ ...basis, L: '17' + '0'.repeat(307), D: '0' }, { equity: '1000000', annualInterest: '0', months: '12' })
  const markup = renderToStaticMarkup(createElement(ScenarioChart, { scenario }))
  expect(markup).toContain('Grafverdiene overstiger visningsområdet.')
  expect(markup).not.toContain('<svg'); expect(markup).not.toContain('NaN')
})
