import { useEffect, useRef } from 'react'
import type { Dispatch } from 'react'
import type { FinancialField, RegisteredFinancialInput } from '../../contracts/financial-input.ts'
import type { CostBreakdown, FinancialSources } from '../../contracts/financial-basis.ts'
import { RentNatureSchema, SourceKindSchema } from '../../contracts/financial-basis.ts'
import type { FinancialIssue } from '../../contracts/financial-validation.ts'
import type { SessionAction } from '../state/session.ts'

export function SourceNote({ field, value, sources, issues, errorDescription, dispatch }: {
  field: FinancialField; value: string; sources: FinancialSources; issues: FinancialIssue[]; errorDescription: string; dispatch: Dispatch<SessionAction>
}) {
  const source = sources[field]
  const describedBy = `source-summary-${field} ${errorDescription}`.trim()
  const sharedSourceError = issues.some((issue) => issue.code === 'source-conflict' || issue.code === 'unsupported-actual-rent')
  const missingMetadata = errorDescription !== ''
  const update = (change: Partial<typeof source>) => dispatch({ type: 'register-source', field, source: { ...source, ...change } })
  const conflictButton = useRef<HTMLButtonElement>(null)
  const conflictInput = useRef<HTMLInputElement>(null)
  const hadConflict = useRef(false)
  useEffect(() => {
    if (source.conflict !== null && !hadConflict.current) conflictInput.current?.focus()
    if (source.conflict === null && hadConflict.current) conflictButton.current?.focus()
    hadConflict.current = source.conflict !== null
  }, [source.conflict])
  return (
    <div className="source-note">
      <div className="source-controls">
        <div>
          <label htmlFor={`source-kind-${field}`}>Opphav for {field}</label>
          <select id={`source-kind-${field}`} value={source.kind} aria-describedby={describedBy} aria-invalid={sharedSourceError || (missingMetadata && source.kind === '') || undefined}
            onChange={(event) => update({ kind: SourceKindSchema.parse(event.target.value) })}>
            <option value="">Ikke oppgitt</option><option value="source">Oppgitt kilde</option><option value="assumption">Egen forutsetning</option>
          </select>
        </div>
        <div>
          <label htmlFor={`source-${field}`}>Kilde / forutsetning for {field}</label>
          <input id={`source-${field}`} type="text" autoComplete="off" value={source.description}
            onChange={(event) => update({ description: event.target.value })} aria-describedby={describedBy} aria-invalid={sharedSourceError || (missingMetadata && source.description.trim() === '') || undefined} />
        </div>
        {field === 'L' && <div>
          <label htmlFor="rent-nature-L">Leiegrunnlag for L</label>
          <select id="rent-nature-L" value={sources.L.rentNature} aria-describedby={describedBy} aria-invalid={sharedSourceError || (missingMetadata && sources.L.rentNature === '') || undefined}
            onChange={(event) => dispatch({ type: 'register-rent-nature', rentNature: RentNatureSchema.parse(event.target.value) })}>
            <option value="">Ikke oppgitt</option><option value="expected">Forventet leie</option><option value="actual">Faktisk leie med oppgitt kilde</option>
          </select>
        </div>}
      </div>
      <p className="meta source-summary" id={`source-summary-${field}`}>
        {source.kind === 'source' ? 'Oppgitt kilde' : source.kind === 'assumption' ? 'Egen forutsetning' : 'Opphav ikke oppgitt'}
        {source.description.trim() !== '' && `: ${source.description}`}
        {field === 'L' && (sources.L.rentNature === 'expected' ? ' · Forventet leie, ikke dokumentert faktisk leie.'
          : sources.L.rentNature === 'actual' ? ' · Faktisk leie er brukeroppgitt; kildegrunnlaget må kontrolleres.' : ' · Leiegrunnlag ikke oppgitt.')}
      </p>
      {source.conflict === null ? <button id={`conflict-add-${field}`} className="secondary-action" type="button" ref={conflictButton}
        onClick={() => update({ conflict: { rawValue: '', description: '' } })}>Oppgi kildekonflikt for {field}</button>
        : <div className="source-conflict" aria-labelledby={`conflict-title-${field}`}>
          <h3 id={`conflict-title-${field}`}>Uløst kildekonflikt for {field}</h3>
          <p>Gjeldende registrering: {value || 'Ikke oppgitt'} {field === 'Ymin' ? '%' : 'NOK'} · {source.description || 'Opphav mangler'}.</p>
          <p className="meta">Sammenlign i samme enhet, og samme periode/år som feltet over. Ingen kilde velges automatisk.</p>
          <div className="source-controls">
            <div><label htmlFor={`conflict-value-${field}`}>Annen kildeverdi for {field}</label>
              <input id={`conflict-value-${field}`} ref={conflictInput} inputMode="decimal" autoComplete="off" value={source.conflict.rawValue}
                aria-describedby={describedBy} aria-invalid="true"
                onChange={(event) => update({ conflict: { ...source.conflict!, rawValue: event.target.value } })} /></div>
            <div><label htmlFor={`conflict-source-${field}`}>Annen kilde for {field}</label>
              <input id={`conflict-source-${field}`} autoComplete="off" value={source.conflict.description}
                aria-describedby={describedBy} aria-invalid="true"
                onChange={(event) => update({ conflict: { ...source.conflict!, description: event.target.value } })} /></div>
          </div>
          <p className="field-issue" id={`source-issue-${field}-source-conflict`}>{issues.find((entry) => entry.code === 'source-conflict')?.message} Verdien er utilstrekkelig.</p>
          <p className="meta">Rett gjeldende verdi og opphav over etter kildekontroll. Fjern deretter den avklarte motstriden.</p>
          <button id={`conflict-remove-${field}`} className="secondary-action" type="button" onClick={() => update({ conflict: null })}>Fjern avklart motstrid for {field}</button>
        </div>}
      {issues.filter((entry) => entry.code === 'unsupported-actual-rent').map((entry) => <p className="field-issue" id={`source-issue-${field}-${entry.code}`} key={entry.code}>{entry.message} {entry.action}</p>)}
    </div>
  )
}

export function CostBreakdownInput({ financial, result, issues, dispatch }: {
  financial: RegisteredFinancialInput; result: CostBreakdown; issues: FinancialIssue[]; dispatch: Dispatch<SessionAction>
}) {
  const firstInput = useRef<HTMLInputElement>(null)
  const addButton = useRef<HTMLButtonElement>(null)
  const previousCount = useRef(result.items.length)
  useEffect(() => {
    if (result.items.length > previousCount.current) firstInput.current?.focus()
    if (result.items.length < previousCount.current) addButton.current?.focus()
    previousCount.current = result.items.length
  }, [result.items.length])
  const costIssues = issues.filter((entry) => entry.target === 'cost')
    .filter((entry, index, entries) => entries.findIndex((other) => other.code === entry.code && other.message === entry.message) === index)
  const describedBy = `cost-context${costIssues.length > 0 ? ' cost-issues' : ''}`
  return (
    <section className="cost-breakdown" aria-labelledby="cost-title">
      <h2 id="cost-title">Kostnadsinnhold i D og J</h2>
      <p>Beskriv kostnader som inngår i totalene over. Oppgi hele postens beløp og rentedelen/avdrag separat, også når den er 0.</p>
      <p className="meta" id="cost-context">Postene følger perioden og året for D: {financial.D.period === 'year' ? 'År' : financial.D.period === 'month' ? 'Måned' : 'Periode ikke kjent'} · {financial.D.year || 'År ikke oppgitt'}. Alle beløp er NOK. Oppgitt innhold kan være et delgrunnlag.</p>
      {result.items.map((item, index) => {
        const change = (update: Parameters<typeof dispatch>[0] & { type: 'change-cost' }) => dispatch(update)
        return <fieldset className="cost-item" key={item.id} aria-describedby={describedBy}>
          <legend>Kostnadspost {index + 1}</legend>
          <div className="cost-controls">
            <div><label htmlFor={`${item.id}-label`}>Navn på post {index + 1}</label><input id={`${item.id}-label`} aria-describedby={describedBy} aria-invalid={item.status === 'invalid' ? true : undefined}
              ref={index === result.items.length - 1 ? firstInput : undefined} value={item.label}
              onChange={(event) => change({ type: 'change-cost', id: item.id, update: { label: event.target.value } })} /></div>
            <div><label htmlFor={`${item.id}-amount`}>Samlet beløp, post {index + 1} (NOK)</label><input id={`${item.id}-amount`} inputMode="decimal" value={item.rawAmount} aria-describedby={describedBy} aria-invalid={item.status === 'invalid' ? true : undefined}
              onChange={(event) => change({ type: 'change-cost', id: item.id, update: { rawAmount: event.target.value } })} /></div>
            <div><label htmlFor={`${item.id}-debt`}>Herav renter/avdrag, post {index + 1} (NOK)</label><input id={`${item.id}-debt`} inputMode="decimal" value={item.rawDebt} aria-describedby={describedBy} aria-invalid={item.status === 'invalid' ? true : undefined}
              onChange={(event) => change({ type: 'change-cost', id: item.id, update: { rawDebt: event.target.value } })} /></div>
            <div><label htmlFor={`${item.id}-included`}>Inngår allerede i, post {index + 1}</label>
              <select id={`${item.id}-included`} value={item.includedIn ?? ''} aria-describedby={describedBy} aria-invalid={item.status === 'invalid' ? true : undefined}
                onChange={(event) => change({ type: 'change-cost', id: item.id, update: { includedIn: event.target.value || null } })}>
                <option value="">Selvstendig post</option>
                {item.includedIn !== null && !result.items.some((other) => other.id === item.includedIn) && <option value={item.includedIn}>Tidligere post er fjernet — velg på nytt</option>}
                {result.items.filter((other) => other.id !== item.id).map((other) => <option value={other.id} key={other.id}>{other.label || `Kostnadspost ${result.items.indexOf(other) + 1}`}</option>)}
              </select></div>
          </div>
          <p className="cost-contribution">{item.D !== null && item.J !== null ? `${item.amount} NOK = D ${item.D} + J ${item.J} NOK` : 'Oppdelingen kan ikke vurderes ennå.'}
            {item.status === 'included' && ` · Inngår i ${result.items.find((other) => other.id === item.includedIn)?.label || 'oppgitt post'}; telles ikke på nytt.`}
            {item.status === 'invalid' && ' · Må kontrolleres.'}</p>
          <button id={`${item.id}-remove`} className="secondary-action" type="button" onClick={() => dispatch({ type: 'remove-cost', id: item.id })}>Fjern post {index + 1}</button>
        </fieldset>
      })}
      <button id="cost-add" className="secondary-action" type="button" ref={addButton} onClick={() => dispatch({ type: 'add-cost' })}>Legg til kostnadsinnhold</button>
      <p className="cost-contribution" id="cost-summary">{result.D !== null && result.J !== null
        ? `Oppgitt bidrag uten dobbelttelling: D ${result.D} NOK · J ${result.J} NOK (perioden for D).`
        : result.items.length === 0 ? 'Ingen kostnadsposter oppgitt.' : 'Oppgitt bidrag kan ikke summeres før postene er rettet.'}</p>
      <p className="meta">Oppdelingen er innhold i registrerte D/J, ikke et tillegg. Renter og avdrag hører bare til J. Registrerte totaler og øvrige kostnader endres ikke automatisk.</p>
      {costIssues.length > 0 && <div id="cost-issues">{costIssues.map((entry) => <p className="field-issue" key={`${entry.code}-${entry.message}`}>{entry.message} {entry.action}</p>)}</div>}
    </section>
  )
}
