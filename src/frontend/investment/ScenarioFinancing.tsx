import Big from 'big.js'
import { parseFinancialDecimal } from '../../domain/validation.ts'
import type { FinancialScenario, ScenarioControls, ScenarioBasis } from '../../domain/financial-scenario.ts'
import { formatFinancialDecimal } from '../../presentation/finance.ts'
const Decimal = Big(); Decimal.strict = true
const money = (value: string | null) => value === null ? 'Ukjent' : `${formatFinancialDecimal(new Decimal(value).toFixed(0))} kr`
export function ScenarioFinancing({ basis, scenario, controls, onChange }: {
  basis: ScenarioBasis; scenario: FinancialScenario; controls: ScenarioControls; onChange: (value: ScenarioControls) => void
}) {
  const equity = parseFinancialDecimal(controls.equity), rate = parseFinancialDecimal(controls.annualInterest)
  const months = /^[1-9]\d{0,3}$/.test(controls.months) ? Number(controls.months) : null
  const wholeYears = months !== null && months % 12 === 0 ? String(months / 12) : ''
  const set = (field: keyof ScenarioControls, value: string) => onChange({ ...controls, [field]: value })
  return <aside className="finance-panel" aria-label="Interaktiv finansiering">
    <div className="eyebrow">DINE FORUTSETNINGER</div><h3>Finansiering</h3>
    <div className="finance-field"><label htmlFor="scenario-equity">Egenkapital <span>kr</span></label>
      <input id="scenario-equity" inputMode="decimal" value={controls.equity} placeholder="Oppgi egenkapital" onChange={e => set('equity', e.target.value)} />
      {basis.cashRequired !== null && equity !== null && new Decimal(equity).gte('0') && new Decimal(equity).lte(basis.cashRequired) && <input aria-label="Juster egenkapital" type="range" min="0" max={basis.cashRequired} step="1" value={equity} onChange={e => set('equity', e.target.value)} />}
      <p className="metric-caption">Kontantbehov {money(basis.cashRequired)}</p></div>
    <div className="finance-field"><label htmlFor="scenario-rate">Rente <span>%</span></label><input id="scenario-rate" inputMode="decimal" placeholder="Oppgi rente" value={controls.annualInterest} onChange={e => set('annualInterest', e.target.value)} />
      {rate !== null && new Decimal(rate).gte('0') && new Decimal(rate).lte('15') && <input aria-label="Juster rente" type="range" min="0" max="15" step="0.1" value={rate} onChange={e => set('annualInterest', e.target.value)} />}</div>
    <div className="finance-field"><label htmlFor="scenario-years">Nedbetalingstid <span>år</span></label><input id="scenario-years" inputMode="numeric" value={wholeYears} placeholder={months === null ? 'Oppgi antall år' : 'Angitt i måneder'} onChange={e => set('months', /^\d+$/.test(e.target.value) ? new Decimal(e.target.value).times('12').toFixed() : '')} />
      {months !== null && months >= 12 && months <= 480 && months % 12 === 0 && <input aria-label="Juster nedbetalingstid i år" type="range" min="1" max="40" step="1" value={wholeYears} onChange={e => set('months', new Decimal(e.target.value).times('12').toFixed())} />}
      <details><summary>Presis løpetid i måneder</summary><label htmlFor="scenario-months">Hele måneder (1–1200)</label><input id="scenario-months" inputMode="numeric" value={controls.months} onChange={e => set('months', e.target.value)} /></details></div>
    <div className="finance-summary"><div className="finance-line"><span>Privat lån</span><strong>{money(scenario.loan)}</strong></div><div className="finance-line"><span>Privat lån per måned</span><strong>{money(scenario.monthly)}</strong></div><div className="finance-line"><span>Fellesgjeld per år</span><strong>{money(basis.sharedAnnualPayment)}</strong></div><div className="finance-total"><span>Samlet betaling per år</span><strong>{money(scenario.J)}</strong></div></div>
    <button type="button" className="quiet-button" onClick={() => onChange({ equity: '', annualInterest: '', months: '' })}>Nullstill scenario ↺</button>
    <p className="metric-caption">Scenario · bekrefter ingen tall og endrer ingen kontrollert vurdering.</p>
  </aside>
}
