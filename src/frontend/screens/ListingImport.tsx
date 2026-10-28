import { useEffect, useState } from 'react'
import type { Dispatch } from 'react'
import type { ListingCorrection } from '../../contracts/listing.ts'
import { listingSuggestions, validateListingUrl } from '../../domain/listing.ts'
import { financingSuggestion } from '../../domain/financing.ts'
import { ListingClient } from '../analysis/listing-client.ts'
import type { SessionAction, SessionState } from '../state/session.ts'

export function ListingImport({ session, dispatch }: { session: SessionState; dispatch: Dispatch<SessionAction> }) {
  const state = session.listing
  const [client] = useState(() => new ListingClient(dispatch))
  useEffect(() => { client.abort() }, [state.generation, client])
  useEffect(() => () => client.abort(), [client])
  const draft = state.draft
  const suggested = draft ? listingSuggestions(draft) : null
  const financing = financingSuggestion({ ...state.financing, cashRequired: suggested?.cashRequired ?? null, sharedAnnualPayment: suggested?.sharedAnnualPayment ?? null })
  return <section className="listing-import" aria-labelledby="listing-title">
    <h2 id="listing-title">Importer fra FINN</h2>
    <p>Én boliglenke gir et utkast til kontroll. Du kan alltid registrere tall og velge tilstandsrapport som PDF manuelt.</p>
    <label htmlFor="listing-url">FINN-boliglenke</label>
    <input id="listing-url" type="url" autoComplete="off" value={state.url} onChange={event => dispatch({ type: 'listing-url', url: event.target.value })} aria-describedby="listing-object-note" />
    <p id="listing-object-note" className="meta">En gyldig lenke til en annen annonse starter et nytt objekt og tømmer tidligere tall og valgt rapport. Import bekrefter ingen tall.</p>
    {state.url && !validateListingUrl(state.url) && <p>Oppgi en HTTPS-lenke til én boligannonse på finn.no uten port eller brukerinformasjon.</p>}
    <button type="button" disabled={!validateListingUrl(state.url) || state.status === 'loading'} onClick={() => { void client.import(state) }}>{state.status === 'loading' ? 'Henter annonse …' : 'Hent FINN-grunnlag'}</button>
    <p role="status">{state.error ?? (state.status === 'ready' ? 'Importutkast klart. Kontroller kilden og hvert felt før bruk.' : '')}</p>
    {draft && <>
      <p><a href={draft.original.url} target="_blank" rel="noreferrer">Åpne FINN-annonsen {draft.original.listingCode}</a> · Hentet {draft.original.fetchedAt}</p>
      {draft.original.fields.map(field => {
        const correction: ListingCorrection = draft.corrections[field.id] ?? { rawAmount: field.amount ?? '', period: field.period, year: field.year ?? '', includedIn: field.includedIn, rawDebtPart: field.debtPart ?? '', note: '', reviewed: false }
        const update = (changes: Partial<ListingCorrection>) => dispatch({ type: 'listing-correction', id: field.id, correction: { ...correction, ...changes, reviewed: false } })
        return <fieldset className="listing-field" key={field.id}>
          <legend>{field.label}</legend>
          <p>Original: {field.amount === null ? 'Ukjent' : `${field.amount} NOK`} · {field.status} · {field.period} · {field.year ?? 'år ukjent'}</p>
          {field.source && <p><a href={field.source.url} target="_blank" rel="noreferrer">Kilde</a>: <q>{field.source.quote}</q></p>}
          {field.alternatives.map((alternative, index) => <p key={index}>Motstrid: {alternative.amount} NOK · <a href={alternative.url} target="_blank" rel="noreferrer">Kilde</a>: <q>{alternative.quote}</q></p>)}
          <label htmlFor={`listing-${field.id}`}>Kontrollert beløp for {field.label} (NOK)</label>
          <input id={`listing-${field.id}`} inputMode="decimal" value={correction.rawAmount} onChange={event => update({ rawAmount: event.target.value })} />
          <label htmlFor={`listing-note-${field.id}`}>Begrunnelse/kilde for retting av {field.label}</label>
          <input id={`listing-note-${field.id}`} value={correction.note} onChange={event => update({ note: event.target.value })} />
          {(field.category === 'one-off' || field.category === 'recurring') && <>
            <label htmlFor={`listing-included-${field.id}`}>Inkludering for {field.label}</label>
            <select id={`listing-included-${field.id}`} value={correction.includedIn ?? '__unknown'} onChange={event => update({ includedIn: event.target.value === '__unknown' ? null : event.target.value })}>
              <option value="__unknown">Ukjent</option><option value="">Separat post</option>
              {draft.original.fields.filter(parent => parent.category === field.category && parent.id !== field.id).map(parent => <option key={parent.id} value={parent.id}>Inkludert i {parent.label}</option>)}
            </select>
          </>}
          {field.category === 'recurring' && <>
            <label htmlFor={`listing-debt-${field.id}`}>Renter og avdrag i {field.label} (NOK, også 0)</label>
            <input id={`listing-debt-${field.id}`} inputMode="decimal" value={correction.rawDebtPart} onChange={event => update({ rawDebtPart: event.target.value })} />
            <label htmlFor={`listing-period-${field.id}`}>Periode for {field.label}</label>
            <select id={`listing-period-${field.id}`} value={correction.period} onChange={event => update({ period: event.target.value as ListingCorrection['period'] })}>
              <option value="unknown">Ukjent</option><option value="month">Måned</option><option value="year">År</option><option value="once">Engang</option>
            </select>
            <label htmlFor={`listing-year-${field.id}`}>År for {field.label}</label>
            <input id={`listing-year-${field.id}`} inputMode="numeric" value={correction.year} onChange={event => update({ year: event.target.value })} />
          </>}
          <label><input type="checkbox" checked={correction.reviewed} onChange={event => dispatch({ type: 'listing-correction', id: field.id, correction: { ...correction, reviewed: event.target.checked } })} />Jeg har kontrollert {field.label}, inkludert eventuell 0 og motstrid.</label>
        </fieldset>
      })}
      <label><input type="checkbox" checked={draft.completeOperatingCosts} onChange={event => dispatch({ type: 'listing-complete-costs', complete: event.target.checked })} />Jeg har kontrollert at alle eierbetalte driftskostnader er med, og avklart inkludering og rentedeler.</label>
      <h3>Finansieringsforutsetninger</h3>
      <p>Kontantbehov: {suggested?.cashRequired ?? 'Ukjent'} NOK. Fellesgjelden finansieres ikke på nytt.</p>
      <label htmlFor="listing-equity">Egenkapital (NOK)</label>
      <input id="listing-equity" inputMode="decimal" value={state.financing.equity} onChange={event => dispatch({ type: 'listing-financing', field: 'equity', value: event.target.value })} />
      <label htmlFor="listing-equity-range">Egenkapital med slider (NOK)</label>
      <input id="listing-equity-range" type="range" min="0" max={suggested?.cashRequired ?? '0'} step="0.01" disabled={suggested?.cashRequired === null} value={state.financing.equity || '0'} onChange={event => dispatch({ type: 'listing-financing', field: 'equity', value: event.target.value })} />
      {([{ field: 'annualInterest', label: 'Årsrente (%)' }, { field: 'months', label: 'Løpetid (måneder)' }, { field: 'year', label: 'År for gjeldsbetjening' }] as const).map(({ field, label }) => <div key={field}>
        <label htmlFor={`listing-finance-${field}`}>{label}</label><input id={`listing-finance-${field}`} inputMode="decimal" value={state.financing[field]} onChange={event => dispatch({ type: 'listing-financing', field, value: event.target.value })} />
      </div>)}
      <p>Eget lån: {financing.loan ?? 'Ukjent'} NOK · Månedlig betaling: {financing.monthly ?? 'Ukjent'} NOK · Årlig egen betaling: {financing.annual ?? 'Ukjent'} NOK</p>
      <p>Forslag P: {suggested?.P ?? 'Ukjent'} · D: {suggested?.D ?? 'Ukjent'} · J: {financing.J ?? 'Ukjent'} NOK/år</p>
      {suggested?.issues.map(issue => <p key={issue}>{issue}</p>)}
      {financing.error && <p>{financing.error}</p>}
      <p>Rettede eller manglende verdier krever begrunnelse. P erstattes med forslaget. D/J fylles bare når feltet er blankt og forslaget er komplett; manuelle registreringer bevares. L og Ymin oppgis manuelt.</p>
      <button type="button" disabled={suggested?.P === null} onClick={() => dispatch({ type: 'listing-apply' })}>Bruk kontrollert grunnlag</button>
    </>}
  </section>
}
