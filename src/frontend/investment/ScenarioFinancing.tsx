import Big from 'big.js'
import { useState } from 'react'
import { parseFinancialDecimal } from '../../domain/validation.ts'
import { equityForLeverage } from '../../domain/financing.ts'
import type { FinancialScenario, ScenarioControls, ScenarioBasis } from '../../domain/financial-scenario.ts'
import { formatFinancialDecimal } from '../../presentation/finance.ts'
const Decimal = Big(); Decimal.strict = true
Decimal.DP = 50
const money = (value: string | null) => value === null ? 'Ukjent' : `${formatFinancialDecimal(new Decimal(value).toFixed(0))} kr`
export function ScenarioFinancing({ basis, scenario, controls, onChange }: {
  basis: ScenarioBasis; scenario: FinancialScenario; controls: ScenarioControls; onChange: (value: ScenarioControls) => void
}) {
  const equity = parseFinancialDecimal(controls.equity), rate = parseFinancialDecimal(controls.annualInterest)
  const months = /^[1-9]\d{0,3}$/.test(controls.months) ? Number(controls.months) : null
  const wholeYears = months !== null && months % 12 === 0 ? String(months / 12) : ''
  const price = parseFinancialDecimal(basis.P ?? ''), cash = parseFinancialDecimal(basis.cashRequired ?? ''), shared = parseFinancialDecimal(basis.sharedDebt ?? '')
  const hasCapitalBasis = price !== null && new Decimal(price).gt('0') && cash !== null && new Decimal(cash).gte('0') && shared !== null && new Decimal(shared).gte('0')
  const limits = hasCapitalBasis ? { min: new Decimal(shared!).times('100').div(price!).toFixed(), max: new Decimal(cash!).plus(shared!).times('100').div(price!).toFixed() } : null
  const capitalKey = `${price}:${cash}:${shared}`
  const [ltvInput, setLtvInput] = useState<{ raw: string; equity: string; capitalKey: string; roundedBoundary: 'minimum' | 'maximum' | null } | null>(null)
  const activeInput = ltvInput?.equity === controls.equity && ltvInput.capitalKey === capitalKey ? ltvInput : null
  const activeLtv = activeInput?.raw ?? null
  const visibleLtv = activeLtv ?? (scenario.leverage === null ? '' : new Decimal(scenario.leverage).toFixed(2))
  const parsedLtv = parseFinancialDecimal(visibleLtv)
  const exactSliderValue = activeInput === null ? scenario.leverage : activeInput.roundedBoundary === 'maximum' ? limits?.max ?? null : activeInput.roundedBoundary === 'minimum' ? limits?.min ?? null : parsedLtv
  const validLtv = exactSliderValue !== null && limits !== null && new Decimal(exactSliderValue).gte(limits.min) && new Decimal(exactSliderValue).lte(limits.max)
  const set = (field: keyof ScenarioControls, value: string) => { if (field === 'equity') setLtvInput(null); onChange({ ...controls, [field]: value }) }
  const setLeverage = (raw: string) => {
    const result = equityForLeverage({ price, cashRequired: cash, sharedDebt: shared, leverage: raw })
    const nextEquity = result.equity ?? ''
    setLtvInput({ raw, equity: nextEquity, capitalKey, roundedBoundary: result.roundedBoundary })
    onChange({ ...controls, equity: nextEquity })
  }
  const setSliderLeverage = (input: HTMLInputElement) => {
    if (!limits) return
    // Native range values are IEEE doubles. Bind their end stops to the exact
    // funding endpoints instead of validating a rounded double against Big.js.
    const boundary = input.valueAsNumber >= Number(limits.max) ? 'maximum'
      : input.valueAsNumber <= Number(limits.min) ? 'minimum' : null
    if (!boundary) { setLeverage(input.value); return }
    const exact = boundary === 'maximum' ? limits.max : limits.min
    const raw = new Decimal(exact).toFixed(2), nextEquity = boundary === 'maximum' ? '0' : cash!
    setLtvInput({ raw, equity: nextEquity, capitalKey, roundedBoundary: new Decimal(raw).eq(exact) ? null : boundary })
    onChange({ ...controls, equity: nextEquity })
  }
  const financingIssue = basis.cashRequired === null ? 'Kontantbehov mangler. Kontroller pris, omkostninger og inkludering i «Bak tallene».'
    : scenario.issues.find(issue => issue.startsWith('Oppgi egenkapital') || issue.startsWith('Oppgi rente'))
  return <aside className="finance-panel" aria-label="Interaktiv finansiering">
    <div className="eyebrow">DINE FORUTSETNINGER</div><h3>Finansiering</h3>
    <div className="finance-field"><label htmlFor="scenario-equity">Egenkapital <span>kr</span></label>
      <input id="scenario-equity" inputMode="decimal" value={controls.equity} placeholder="Oppgi egenkapital" onChange={e => set('equity', e.target.value)} />
      {basis.cashRequired !== null && equity !== null && new Decimal(equity).gte('0') && new Decimal(equity).lte(basis.cashRequired) && <input aria-label="Juster egenkapital" type="range" min="0" max={basis.cashRequired} step="1" value={equity} onChange={e => set('equity', e.target.value)} />}
      <p className="metric-caption">Kontantbehov {money(basis.cashRequired)}</p></div>
    <div className="finance-field"><label htmlFor="scenario-leverage">Belåningsgrad <span>%</span></label>
      <input id="scenario-leverage" inputMode="decimal" value={visibleLtv} disabled={limits === null} placeholder={limits === null ? 'Kjøpsgrunnlag mangler' : 'Oppgi belåningsgrad'} onChange={e => setLeverage(e.target.value)} />
      {limits !== null && validLtv && <input aria-label="Juster belåningsgrad" type="range" min={limits.min} max={limits.max} step="any" value={exactSliderValue!} onChange={e => setSliderLeverage(e.currentTarget)} />}
      <p className="metric-caption">Privat lån og fellesgjeld / pris uten omkostninger.</p>
      {activeLtv !== null && !validLtv && limits !== null && <p className="field-issue" role="status">Oppgi belåningsgrad mellom {formatFinancialDecimal(new Decimal(limits.min).toFixed(2))} og {formatFinancialDecimal(new Decimal(limits.max).toFixed(2))} %. Grensene følger fellesgjeld og kontantbehov.</p>}
      {activeInput?.roundedBoundary && <p className="metric-caption" role="status">Prosenten er avrundet til to desimaler. {activeInput.roundedBoundary === 'maximum' ? 'Maksimal belåning er valgt; egenkapital 0 kr.' : `Minimal belåning er valgt; egenkapital dekker hele kontantbehovet på ${money(basis.cashRequired)}.`}</p>}
      {scenario.leverage !== null && new Decimal(scenario.leverage).gt('90') && <p className="economy-critical-note">Høy belåning øker finansieringsrisikoen. Lånemulighet må avklares med banken.</p>}</div>
    <div className="finance-field"><label htmlFor="scenario-rate">Rente <span>%</span></label><input id="scenario-rate" inputMode="decimal" placeholder="Oppgi rente" value={controls.annualInterest} onChange={e => set('annualInterest', e.target.value)} />
      {rate !== null && new Decimal(rate).gte('0') && new Decimal(rate).lte('15') && <input aria-label="Juster rente" type="range" min="0" max="15" step="0.1" value={rate} onChange={e => set('annualInterest', e.target.value)} />}</div>
    <div className="finance-field"><label htmlFor="scenario-years">Nedbetalingstid <span>år</span></label><input id="scenario-years" inputMode="numeric" value={wholeYears} placeholder={months === null ? 'Oppgi antall år' : 'Angitt i måneder'} onChange={e => set('months', /^\d+$/.test(e.target.value) ? new Decimal(e.target.value).times('12').toFixed() : '')} />
      {months !== null && months >= 12 && months <= 480 && months % 12 === 0 && <input aria-label="Juster nedbetalingstid i år" type="range" min="1" max="40" step="1" value={wholeYears} onChange={e => set('months', new Decimal(e.target.value).times('12').toFixed())} />}
      <details><summary>Presis løpetid i måneder</summary><label htmlFor="scenario-months">Hele måneder (1–1200)</label><input id="scenario-months" inputMode="numeric" value={controls.months} onChange={e => set('months', e.target.value)} /></details></div>
    {scenario.loan === '0' && <p className="metric-caption">Kontantkjøp av den private andelen: rente og løpetid er ikke nødvendig. Eventuell fellesgjeld beholdes.</p>}
    {financingIssue && <p className="field-issue" role="status">{financingIssue}</p>}
    <div className="finance-summary"><div className="finance-line"><span>Privat lån</span><strong data-testid="scenario-loan">{money(scenario.loan)}</strong></div><div className="finance-line"><span>Fellesgjeld</span><strong>{money(basis.sharedDebt ?? null)}</strong></div><div className="finance-line"><span>Samlet gjeld</span><strong data-testid="scenario-total-debt">{money(scenario.totalDebt)}</strong></div><div className="finance-line"><span>Belåningsgrad</span><strong data-testid="scenario-ltv">{scenario.leverage === null ? 'Ukjent' : `${formatFinancialDecimal(new Decimal(scenario.leverage).toFixed(2))} %`}</strong></div><div className="finance-line"><span>Privat lån per måned</span><strong data-testid="scenario-loan-monthly">{money(scenario.monthly)}</strong></div><div className="finance-line"><span>Betaling på fellesgjeld per år</span><strong>{money(basis.sharedAnnualPayment)}</strong></div><div className="finance-total"><span>Samlet betaling per måned</span><strong data-testid="scenario-debt-monthly">{money(scenario.J === null ? null : new Decimal(scenario.J).div('12').toFixed())}</strong></div></div>
    <details><summary>Forutsetninger for låneberegningen</summary><p>Annuitetslån med månedlig betaling, nominell årsrente og uendret rente. Privat lån = kontantbehov − egenkapital. Renter og avdrag inngår i betalingen; gebyrer er ikke med. Betaling på fellesgjeld legges til én gang. Løpetiden gjelder det private lånet. Årsbeløp er 12 ganger månedsnivået, også når lånet nedbetales på under ett år.</p></details>
    <button type="button" className="quiet-button" onClick={() => { setLtvInput(null); onChange({ equity: '', annualInterest: '', months: '' }) }}>Nullstill scenario ↺</button>
    <p className="metric-caption">Scenario · bekrefter ingen tall og endrer ingen kontrollert vurdering.</p>
  </aside>
}
