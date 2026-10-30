import { useState } from 'react'
import type { Dispatch } from 'react'
import type { SessionAction, SessionState } from '../state/session.ts'
import { parseFinancialDecimal } from '../../domain/validation.ts'
import Big from 'big.js'
const Decimal = Big(); Decimal.strict = true

/** Explicit user assumptions. Uses normal reducer invalidation, never confirmation. */
export function AssumptionsForm({ session, dispatch, onDone }: { session: SessionState; dispatch: Dispatch<SessionAction>; onDone: () => void }) {
  const [rent, setRent] = useState(''), [cost, setCost] = useState(''), [year, setYear] = useState('')
  const [error, setError] = useState('')
  const valid = (value: string) => { const n = parseFinancialDecimal(value); return n !== null && new Decimal(n).gte('0') }
  return <form className="assumptions-form" onSubmit={event => {
    event.preventDefault()
    if ((!rent.trim() && !cost.trim()) || (!/^\d{4}$/.test(year) || Number(year) === 0) || (rent.trim() && !valid(rent)) || (cost.trim() && !valid(cost))) {
      setError('Oppgi minst én ikke-negativ årsverdi og et firesifret år.'); return
    }
    for (const [field, value] of [['L', rent], ['D', cost]] as const) {
      if (!value.trim()) continue
      dispatch({ type: 'register-value', field, rawValue: value })
      dispatch({ type: 'register-period', field, period: 'year' })
      dispatch({ type: 'register-year', field, year })
      dispatch({ type: 'register-source', field, source: { kind: 'assumption', description: field === 'L' ? `Egen forventning til årlig leie for ${year}.` : `Egen forutsetning om samlet eierbetalt årlig drift for ${year}, uten renter og avdrag.`, conflict: session.sources[field].conflict } })
      if (field === 'L') dispatch({ type: 'register-rent-nature', rentNature: 'expected' })
    }
    onDone()
  }}>
    <p>Egne forutsetninger. Verdiene erstatter registrert leie eller drift og blir ubekreftet. Tomme felt beholder dagens grunnlag.</p>
    <label htmlFor="assumption-rent">Forventet leie per år (kr)</label><input id="assumption-rent" inputMode="decimal" value={rent} onChange={e => setRent(e.target.value)} />
    <label htmlFor="assumption-cost">Samlet eierbetalt drift per år (kr)</label><input id="assumption-cost" inputMode="decimal" value={cost} onChange={e => setCost(e.target.value)} />
    <p>Drift må omfatte alle eierbetalte kostnader, uten renter og avdrag. Ingen tillegg trekkes automatisk fra.</p>
    <label htmlFor="assumption-year">År for forutsetningene</label><input id="assumption-year" inputMode="numeric" value={year} onChange={e => setYear(e.target.value)} />
    <p className="field-issue" role="status">{error}</p><button className="primary-action" type="submit">Bruk som ubekreftede forutsetninger</button>
  </form>
}
