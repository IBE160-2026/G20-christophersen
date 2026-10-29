import { parseFinancialDecimal } from '../../domain/validation.ts'
/** Samme presise tallfelt og slider for FINN og salgsoppgave. */
export function FinancingControls({ prefix, financing, cashRequired, loan, onChange }: {
  prefix: string; financing: { equity: string; annualInterest: string; months: string; year: string }; cashRequired: string | null; loan: string | null
  onChange: (field: 'equity' | 'annualInterest' | 'months' | 'year', value: string) => void
}) {
  const canonical = loan !== null ? parseFinancialDecimal(financing.equity) : null
  const equity = canonical !== null && /^\d+(?:\.\d{1,2})?$/.test(canonical) ? canonical : null
  return <>
    <label htmlFor={`${prefix}-equity`}>Egenkapital (NOK)</label>
    <input id={`${prefix}-equity`} inputMode="decimal" value={financing.equity} onChange={event => onChange('equity', event.target.value)} />
    {equity !== null ? <><label htmlFor={`${prefix}-equity-range`}>Egenkapital med slider (NOK)</label><input id={`${prefix}-equity-range`} type="range" min="0" max={cashRequired ?? '0'} step="0.01" value={equity} onChange={event => onChange('equity', event.target.value)} /></> : <p>Slideren vises når egenkapitalen er et gyldig beløp med høyst to desimaler mellom 0 og kjent kontantbehov. Tallfeltet beholder din nøyaktige verdi.</p>}
    {([{ field: 'annualInterest', label: 'Årsrente (%)' }, { field: 'months', label: 'Løpetid (måneder)' }, { field: 'year', label: 'År for gjeldsbetjening' }] as const).map(({ field, label }) => <div key={field}>
      <label htmlFor={`${prefix}-finance-${field}`}>{label}</label><input id={`${prefix}-finance-${field}`} inputMode="decimal" value={financing[field]} onChange={event => onChange(field, event.target.value)} />
    </div>)}
  </>
}
