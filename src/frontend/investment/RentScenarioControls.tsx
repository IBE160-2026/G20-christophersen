import Big from 'big.js'
import { parseFinancialDecimal } from '../../domain/validation.ts'
import { formatFinancialDecimal } from '../../presentation/finance.ts'

const Decimal = Big(); Decimal.strict = true
const money = (value: string) => formatFinancialDecimal(new Decimal(value).toFixed(0, Decimal.roundHalfUp))

export function RentScenarioControls({ monthly, edited, reference, year, onChange }: {
  monthly: string; edited: boolean; reference: { value: string; publisher: string; period: string } | null; year: string | null; onChange: (value: string) => void
}) {
  const parsed = parseFinancialDecimal(monthly)
  const valid = parsed !== null && new Decimal(parsed).gte('0')
  const maximum = Math.max(50_000, reference ? Number(reference.value) * 2 : 0,
    valid && new Decimal(parsed).lte('1000000000') ? Number(parsed) : 0)
  return <div className="rent-scenario-controls" role="group" aria-labelledby="rent-scenario-title">
    <h3 id="rent-scenario-title">Månedsleie i scenarioet</h3>
    <p id="rent-scenario-help">{edited ? 'Egen forutsetning' : valid ? 'Gjeldende leiegrunnlag' : 'Leieforutsetning mangler'} · juster for å oppdatere økonomien.</p>
    <label htmlFor="scenario-rent-monthly">Forventet månedsleie i scenarioet (kr)</label>
    <div className="rent-scenario-input"><input id="scenario-rent-monthly" inputMode="decimal" value={monthly} onChange={event => onChange(event.target.value)} aria-describedby="rent-scenario-help rent-scenario-value" />
      <output id="rent-scenario-value" data-testid="scenario-rent-annual">{valid ? `${money(new Decimal(parsed).times('12').toFixed())} kr/år` : 'Ugyldig månedsleie'}</output></div>
    <input aria-label="Juster forventet månedsleie" aria-describedby="rent-scenario-help" aria-valuetext={valid ? `${money(parsed)} kroner per måned` : 'Ugyldig månedsleie'} type="range" min="0" max={maximum} step="1" value={valid ? parsed : '0'} onChange={event => onChange(event.target.value)} />
    <button type="button" className="quiet-button" disabled={!reference} onClick={() => reference && onChange(reference.value)}>Tilbakestill til publisert leiereferanse ↺</button>
    <p className="metric-caption">{reference ? `${reference.period} · ${money(reference.value)} kr/mnd. Scenarioår ${year ?? 'ukjent'}, uten prisjustering.` : 'Ingen referanse for tilbakestilling.'}</p>
  </div>
}
