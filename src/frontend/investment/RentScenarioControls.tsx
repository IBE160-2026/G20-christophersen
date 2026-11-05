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
    <h3 id="rent-scenario-title">Prøv forventet månedsleie</h3>
    <p id="rent-scenario-help">{edited ? 'Egen leieforutsetning i scenarioet.' : 'Starter på scenarioets gjeldende leiegrunnlag.'} Justering oppdaterer årsleie og tilgjengelige avkastningstall. Dette er ikke dokumentert leie eller individuell markedsleie.</p>
    {edited && <p>Scenarioår: {year ?? 'ikke oppgitt'}. Valgt leie er din forutsetning for dette scenarioet. Publiserte beløp brukes uendret uten prisjustering, også når referansens periode er en annen.</p>}
    <label htmlFor="scenario-rent-monthly">Forventet månedsleie i scenarioet (kr)</label>
    <div className="rent-scenario-input"><input id="scenario-rent-monthly" inputMode="decimal" value={monthly} onChange={event => onChange(event.target.value)} aria-describedby="rent-scenario-help rent-scenario-value" />
      <output id="rent-scenario-value" data-testid="scenario-rent-annual">{valid ? `${money(new Decimal(parsed).times('12').toFixed())} kr/år` : 'Ugyldig månedsleie'}</output></div>
    <input aria-label="Juster forventet månedsleie" aria-describedby="rent-scenario-help" aria-valuetext={valid ? `${money(parsed)} kroner per måned` : 'Ugyldig månedsleie'} type="range" min="0" max={maximum} step="1" value={valid ? parsed : '0'} onChange={event => onChange(event.target.value)} />
    <button type="button" className="quiet-button" disabled={!reference} onClick={() => reference && onChange(reference.value)}>Tilbakestill til publisert leiereferanse ↺</button>
    <p className="metric-caption">{reference ? `Tilbakestilling bruker ${money(reference.value)} kr/mnd fra ${reference.publisher}, ${reference.period}, som en ubekreftet scenarioforutsetning uten prisjustering.` : 'Ingen relevant publisert romreferanse er tilgjengelig for tilbakestilling.'}</p>
  </div>
}
