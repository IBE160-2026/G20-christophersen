import { useEffect, useRef } from 'react'
import type { Dispatch } from 'react'
import type { SessionState, SessionAction } from './state/session.ts'
import type { ListingClient } from './analysis/listing-client.ts'
import type { ImportClient } from './analysis/import-client.ts'
import { ProspectusImport } from './screens/ProspectusImport.tsx'
import type { ReportClient } from './analysis/report-client.ts'
import { analysisStatus, findingListAssessment } from './state/report.ts'
import { ReportAnalysis } from './screens/ReportAnalysis.tsx'
import { ScreeningResult } from './screens/ScreeningResult.tsx'
import { selectResult } from './state/result.ts'
import { FinancialInput } from './screens/FinancialInput.tsx'
import { isFinancialConfirmed } from './state/session.ts'

export function ControlWorkspace({ session, dispatch, importClient, client, listingClient }: {
  session: SessionState; dispatch: Dispatch<SessionAction>; importClient: ImportClient; client: ReportClient; listingClient: ListingClient
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(session.currentStep)
  const confirmed = isFinancialConfirmed(session)
  const result = selectResult(session)
  const resultStep = session.currentStep === 'resultat'
  const financialStep = session.currentStep === 'tallgrunnlag'
  const reportControl = findingListAssessment(session.report)
  const status = confirmed ? 'Bekreftet tallgrunnlag' : session.changedFields.length ? 'Endret — må oppdateres' : 'Ubekreftet tallgrunnlag'
  useEffect(() => { heading.current?.focus() }, [])
  useEffect(() => {
    if (previousStep.current !== session.currentStep) heading.current?.focus()
    previousStep.current = session.currentStep
  }, [session.currentStep])

  return (
    <div className="app-shell control-workspace">
      <a className="skip-link" href={`#${session.currentStep}`}>Hopp til arbeidsinnhold</a>
      <nav className="step-navigation" aria-label="Vurderingens fire trinn">
        <ol className="stepper">
          <li className={`step${financialStep ? ' step-current' : ''}`}>
            <a className="step-control" href="#tallgrunnlag" aria-current={financialStep ? 'step' : undefined} onClick={(event) => {
              event.preventDefault()
              dispatch({ type: 'navigate', step: 'tallgrunnlag' })
              if (financialStep) heading.current?.focus()
            }}>
              <span className="step-number" aria-hidden="true">1</span>
              <span><span className="step-name">Tallgrunnlag</span>
                <span className="step-status">Trinn 1 · {financialStep ? 'Gjeldende' : 'Fullført'}{session.changedFields.length ? ' · Endret — må oppdateres' : ''}</span></span>
            </a>
          </li>
          {[
            { number: 2, name: 'Tilstandsrapport', reason: 'Krever gyldig og bekreftet tallgrunnlag.' },
            { number: 3, name: 'Kontroller funn', reason: 'Krever fullført rapportanalyse og synlig funnliste.' },
            { number: 4, name: 'Resultat', reason: 'Krever bekreftet tallgrunnlag og kontrollert, bekreftet funnliste.' },
          ].map((step) => {
            const available = step.number === 4 ? result.status !== 'not-calculated' || (confirmed && reportControl.controlCompleted)
              : confirmed && (step.number === 2 || (step.number === 3 && session.report.status === 'completed'))
            const completed = (step.number === 2 && session.report.status === 'completed' && session.report.listVisibleGeneration === session.report.generation)
              || (step.number === 3 && reportControl.controlCompleted) || (step.number === 4 && result.status === 'current')
            const current = (step.number === 2 && session.currentStep === 'tilstandsrapport') || (step.number === 3 && session.currentStep === 'kontroller-funn') || (step.number === 4 && resultStep)
            return <li className={`step${current ? ' step-current' : ''}`} key={step.number}>
              <button className="step-control" type="button" aria-current={current ? 'step' : undefined}
                aria-disabled={available ? undefined : 'true'} aria-describedby={available ? undefined : `step-${step.number}-reason`}
                onClick={() => { if (available) {
                  dispatch({ type: 'navigate', step: step.number === 4 ? 'resultat' : step.number === 3 ? 'kontroller-funn' : 'tilstandsrapport' })
                  if (current) heading.current?.focus()
                } }}>
                <span className="step-number" aria-hidden="true">{step.number}</span>
                <span><span className="step-name">{step.name}</span>
                  <span className="step-status">Trinn {step.number} · {step.number === 4 && result.status === 'historical' ? 'Utdatert — må oppdateres' : current ? `${step.number === 4 && result.status === 'historical' ? 'Utdatert — må oppdateres' : 'Gjeldende'}${completed ? ' · Fullført' : ''}` : completed ? 'Fullført' : available ? 'Gjenstår · Tilgjengelig' : 'Gjenstår · Utilgjengelig'}</span></span>
              </button>
              {!available && <p className="step-reason meta" id={`step-${step.number}-reason`}>{step.reason}</p>}
            </li>
          })}
        </ol>
      </nav>
      <p style={{ position: 'absolute' }} className="visually-hidden" id="report-announcement" role="status" aria-live="polite" aria-atomic="true">{['completed', 'failed', 'analysing'].includes(session.report.status) ? analysisStatus(session.report) : ''}</p>
      <p style={{ position: 'absolute' }} className="visually-hidden" id="result-announcement" role="status" aria-live="polite" aria-atomic="true">{result.status === 'current' ? `Resultat beregnet: ${result.snapshot.assessment.recommendation}.` : result.status === 'historical' ? 'Resultatet er utdatert. Kontroller endret grunnlag før ny vurdering.' : ''}</p>
      <main className="workspace" tabIndex={0} aria-labelledby={session.currentStep}>
        <div className="screen-heading">
          <div>
            <h1 id={session.currentStep} tabIndex={-1} ref={heading}>{financialStep ? 'Tallgrunnlag' : resultStep ? 'Resultat' : session.currentStep === 'kontroller-funn' ? 'Kontroller funn' : 'Tilstandsrapport'}</h1>
            <p>{financialStep ? 'Samle og kontroller tall, perioder og kilder for ett boligutleieobjekt.' : resultStep ? 'Samlet screening med kontrollerbart grunnlag og neste handling.' : 'Velg rapport og kontroller gjeldende analysegrunnlag.'}</p>
          </div>
          <span className="status-label">{resultStep ? result.status === 'historical' ? 'Utdatert / Må bekreftes på nytt' : result.label : status}</span>
        </div>
        {financialStep ? <><ProspectusImport session={session} dispatch={dispatch} client={importClient} role="prospectus" /><FinancialInput financial={session.financial} sources={session.sources} costItems={session.costItems} session={session} dispatch={dispatch} listingClient={listingClient} /></>
          : resultStep ? <ScreeningResult session={session} dispatch={dispatch} /> : <ReportAnalysis session={session} dispatch={dispatch} client={client} importClient={importClient} />}
      </main>
    </div>
  )
}
