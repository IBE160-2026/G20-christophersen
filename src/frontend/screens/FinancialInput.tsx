import { ListingImport } from './ListingImport.tsx'
import { useEffect, useRef } from 'react'
import type { Dispatch } from 'react'
import type { FinancialField, RegisteredFinancialInput } from '../../contracts/financial-input.ts'
import { RegisteredPeriodSchema } from '../../contracts/financial-input.ts'
import type { CostItem, FinancialSources } from '../../contracts/financial-basis.ts'
import { validateFinancialBasis } from '../../domain/financial-basis.ts'
import { confirmationCandidate, isFinancialConfirmed } from '../state/session.ts'
import type { SessionAction, SessionState } from '../state/session.ts'
import { evaluateKnownDeficiencies } from '../../domain/screening.ts'
import { SourceNote, CostBreakdownInput } from './FinancialBasisInput.tsx'

const fields: { id: FinancialField; label: string; description: string; unit: string }[] = [
  { id: 'P', label: 'Totalpris', description: 'Inklusive eventuell fellesgjeld, uten kjøpsomkostninger.', unit: 'NOK' },
  { id: 'L', label: 'Brutto leieinntekt', description: 'Leieinntekt for det aktuelle objektet og året du oppgir.', unit: 'NOK' },
  { id: 'D', label: 'Eierbetalte driftskostnader', description: 'Eierbetalt drift uten renter og avdrag. Unngå dobbelttelling.', unit: 'NOK' },
  { id: 'J', label: 'Gjeldsbetjening', description: 'Renter og avdrag inklusive eventuell fellesgjeld.', unit: 'NOK' },
  { id: 'Ymin', label: 'Minimumskrav til nettoyield', description: 'Ditt eget avkastningskrav i prosent.', unit: '%' },
]

export function FinancialInput({ financial, sources, costItems, dispatch, session }: {
  financial: RegisteredFinancialInput
  sources: FinancialSources
  costItems: CostItem[]
  session: SessionState
  dispatch: Dispatch<SessionAction>
}) {
  const validation = validateFinancialBasis({ values: financial, sources, costItems })
  const candidate = confirmationCandidate(session)
  const attempted = session.confirmationAttempts > 0
  const attemptValidation = validateFinancialBasis(candidate)
  const assessment = evaluateKnownDeficiencies({ financialBasis: candidate })
  const confirmed = isFinancialConfirmed(session)
  const focusedAttempt = useRef(session.confirmationAttempts)
  useEffect(() => {
    if (focusedAttempt.current === session.confirmationAttempts) return
    focusedAttempt.current = session.confirmationAttempts
    const first = attemptValidation.issues[0]
    if (!first) return
    const costIndex = /^Kostnadspost (\d+)/.exec(first.message)?.[1]
    const costItem = costIndex ? costItems[Number(costIndex) - 1] : undefined
    const costResult = costIndex ? attemptValidation.costBreakdown.items[Number(costIndex) - 1] : undefined
    // Domain avgjør feilen; dette velger bare riktig kontroll for rettingen.
    const costControl = first.code === 'invalid-cost-inclusion' ? 'included'
      : costItem?.label.trim() === '' ? 'label'
        : costResult?.amount === null || costResult?.amount.startsWith('-') ? 'amount' : 'debt'
    const sourceId = first.code === 'source-conflict' ? `conflict-value-${first.field}`
      : first.code === 'missing-rent-nature' ? 'rent-nature-L'
        : sources[first.field].kind === '' || first.code === 'unsupported-actual-rent' ? `source-kind-${first.field}` : `source-${first.field}`
    const id = first.target === 'period' ? `period-${first.field}` : first.target === 'year' ? `year-${first.field}`
      : first.target === 'source' ? sourceId : first.target === 'confirmation' ? `zero-${first.field}`
        : first.target === 'cost' && costItem ? `${costItem.id}-${costControl}` : `value-${first.field}`
    document.getElementById(id)?.focus()
    // Bare et nytt eksplisitt forsøk flytter fokus, ikke løpende retting.
  }, [session.confirmationAttempts, attemptValidation, sources, costItems])
  return (
    <section className="financial-input" aria-labelledby="registration-title">
      <div className="registration-intro">
        <h2 id="registration-title">Registrer finansverdier</h2>
        <p>Oppgi dine tall for ett boligutleieobjekt. Velg periode og år for leie, drift og gjeldsbetjening.</p>
        <p className="meta">Opplysningene beholdes mens siden er åpen. Oppdatering eller lukking av siden avslutter økten.</p>
      </div>
      <ListingImport session={session} dispatch={dispatch} />
      {fields.map(({ id, label, description, unit }) => {
        const value = financial[id]
        const visibleIssues = attempted ? attemptValidation.fields[id].issues : []
        const sourceErrors = validation.fields[id].issues
          .filter((entry) => entry.code === 'source-conflict' || entry.code === 'unsupported-actual-rent')
          .map((entry) => `source-issue-${id}-${entry.code}`).join(' ')
        const costErrors = validation.fields[id].issues.some((entry) => entry.target === 'cost')
        return (
          <div className="financial-row" key={id} role="group" aria-labelledby={`label-${id}`}>
            <div className="registered-value">
              <label id={`label-${id}`} htmlFor={`value-${id}`}>{label} ({id})</label>
              <p className="meta field-definition" id={`hint-${id}`}>{description}</p>
              <div className="value-control">
                <input
                  id={`value-${id}`}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby={`hint-${id} unit-${id} status-${id} source-summary-${id} ${visibleIssues.length ? `field-issues-${id}` : ''} ${sourceErrors}${costErrors ? ' cost-issues' : ''}`.trim()}
                  aria-invalid={visibleIssues.length || sourceErrors || costErrors ? true : undefined}
                  value={value.rawValue}
                  onChange={(event) => dispatch({ type: 'register-value', field: id, rawValue: event.target.value })}
                />
                <span id={`unit-${id}`} className="field-unit">{unit}</span>
              </div>
              <p className="meta field-status" id={`status-${id}`}>
                {value.rawValue === '' ? 'Ikke oppgitt' : value.rawValue === '0' ? '0 registrert' : 'Registrert'} · {value.confirmed ? 'Bekreftet' : session.changedFields.includes(id) ? 'Endret — må kontrolleres på nytt' : 'Ubekreftet'}
              </p>
            </div>
            {id === 'L' || id === 'D' || id === 'J' ? (
              <div className="period-context">
                <div className="period-field">
                  <label htmlFor={`period-${id}`}>Periode for {id}</label>
                  <select
                    id={`period-${id}`}
                    aria-describedby={visibleIssues.length ? `field-issues-${id}` : undefined}
                    aria-invalid={visibleIssues.some((issue) => issue.target === 'period') || undefined}
                    value={financial[id].period}
                    onChange={(event) => dispatch({
                      type: 'register-period', field: id,
                      period: RegisteredPeriodSchema.parse(event.target.value),
                    })}
                  >
                    <option value="">Ikke oppgitt</option>
                    <option value="year">År</option>
                    <option value="month">Måned</option>
                    <option value="unknown">Ukjent</option>
                  </select>
                </div>
                <div className="year-field">
                  <label htmlFor={`year-${id}`}>År for {id}</label>
                  <input
                    id={`year-${id}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    spellCheck={false}
                    aria-describedby={visibleIssues.length ? `field-issues-${id}` : undefined}
                    aria-invalid={visibleIssues.some((issue) => issue.target === 'year') || undefined}
                    value={financial[id].year}
                    onChange={(event) => dispatch({ type: 'register-year', field: id, year: event.target.value })}
                  />
                </div>
              </div>
            ) : <p className="meta unchanged-period">{id === 'P' ? 'Totalpris for objektet' : 'Minimumskrav i prosent'}</p>}
            <SourceNote field={id} value={value.rawValue} sources={sources} issues={validation.fields[id].issues} errorDescription={`${sourceErrors} ${visibleIssues.some((issue) => issue.target === 'source') ? `field-issues-${id}` : ''}`.trim()} dispatch={dispatch} />
            <div className="field-review">
              {(id === 'L' || id === 'D' || id === 'J') && <p className="meta" id={`normalization-${id}`}>
                {validation.fields[id].normalization
                  ? `Registrert ${value.rawValue} NOK × ${validation.fields[id].normalization.factor} = ${validation.fields[id].normalization.annualValue} NOK/år · ${validation.fields[id].normalization.year}.`
                  : 'Årsverdi kan ikke fastsettes før verdi, kjent periode og år er oppgitt.'}
              </p>}
              {validation.fields[id].decimal === '0' && id !== 'P' && <label className="zero-confirmation" htmlFor={`zero-${id}`}>
                <input type="checkbox" id={`zero-${id}`} checked={session.explicitZeros.includes(id)}
                  aria-describedby={visibleIssues.length ? `field-issues-${id}` : `status-${id}`}
                  aria-invalid={visibleIssues.some((issue) => issue.code === 'unconfirmed-zero') || undefined}
                  onChange={(event) => dispatch({ type: 'check-zero', field: id, checked: event.target.checked })} />
                Jeg har kontrollert at {id} er 0 {unit}.
              </label>}
              {visibleIssues.length > 0 && <div id={`field-issues-${id}`}>{visibleIssues.map((issue) =>
                <p className="field-issue" key={`${issue.code}-${issue.message}`}>{issue.message} {issue.action}</p>)}</div>}
            </div>
          </div>
        )
      })}
      <CostBreakdownInput financial={financial} result={validation.costBreakdown} issues={validation.issues} dispatch={dispatch} />
      <div className="registration-note">
        <p>Registrering alene er ikke bekreftelse. En blank verdi er ikke 0; null krever eksplisitt bekreftelse før bruk.</p>
        <p>Kontroller verdier, periode/år, kilder og kostnadsinnhold over før du bekrefter. Bekreftelsen gjelder dette gjeldende grunnlaget.</p>
        <button id="confirm-financial" className="primary-action" type="button" onClick={() => dispatch({ type: 'confirm-financial' })}>Bekreft tallgrunnlaget</button>
        <p role="status" aria-live="polite" id="confirmation-status">{confirmed ? 'Tallgrunnlaget er bekreftet. Tilstandsrapport er tilgjengelig.'
          : session.changedFields.length ? `Endret grunnlag: ${session.changedFields.join(', ')}. Kontroller og bekreft på nytt.`
            : attempted ? 'Tallgrunnlaget er ubekreftet. Kontroller feltene og bekreft på nytt.' : ''}</p>
        {attempted && !confirmed && assessment.status === 'information-required' && <section className="local-deficiencies" aria-labelledby="deficiency-heading">
          <h2 id="deficiency-heading">{assessment.recommendation}</h2>
          <p>{assessment.explanation}</p>
          <p>{assessment.nextAction}</p>
        </section>}
        {confirmed && <button id="next-step" className="secondary-action" type="button" onClick={() => dispatch({ type: 'navigate', step: 'tilstandsrapport' })}>Fortsett til Tilstandsrapport</button>}
      </div>
    </section>
  )
}
