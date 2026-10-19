import { useEffect, useReducer, useRef } from 'react'
import { FinancialInput } from './screens/FinancialInput.tsx'
import { createInitialSession, isFinancialConfirmed, sessionReducer } from './state/session.ts'

function App() {
  const [session, dispatch] = useReducer(sessionReducer, undefined, createInitialSession)
  const heading = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(session.currentStep)
  const confirmed = isFinancialConfirmed(session)
  const financialStep = session.currentStep === 'tallgrunnlag'
  const status = confirmed ? 'Bekreftet tallgrunnlag' : session.changedFields.length ? 'Endret — må oppdateres' : 'Ubekreftet tallgrunnlag'
  useEffect(() => {
    if (previousStep.current !== session.currentStep) heading.current?.focus()
    previousStep.current = session.currentStep
  }, [session.currentStep])

  return (
    <div className="app-shell">
      <a className="skip-link" href={`#${session.currentStep}`}>Hopp til arbeidsinnhold</a>
      <header className="app-header">
        <p className="product-name">Property Acquisition Agent</p>
        <p className="meta">Demo · lagret KI-uttrekk</p>
      </header>
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
            const available = step.number === 2 && confirmed
            const current = step.number === 2 && !financialStep
            return <li className={`step${current ? ' step-current' : ''}`} key={step.number}>
              <button className="step-control" type="button" aria-current={current ? 'step' : undefined}
                aria-disabled={available ? undefined : 'true'} aria-describedby={available ? undefined : `step-${step.number}-reason`}
                onClick={() => { if (available) {
                  dispatch({ type: 'navigate', step: 'tilstandsrapport' })
                  if (current) heading.current?.focus()
                } }}>
                <span className="step-number" aria-hidden="true">{step.number}</span>
                <span><span className="step-name">{step.name}</span>
                  <span className="step-status">Trinn {step.number} · {current ? 'Gjeldende' : available ? 'Gjenstår · Tilgjengelig' : 'Gjenstår · Utilgjengelig'}</span></span>
              </button>
              {!available && <p className="step-reason meta" id={`step-${step.number}-reason`}>{step.reason}</p>}
            </li>
          })}
        </ol>
      </nav>
      <main className="workspace" tabIndex={0} aria-labelledby={session.currentStep}>
        <div className="screen-heading">
          <div>
            <h1 id={session.currentStep} tabIndex={-1} ref={heading}>{financialStep ? 'Tallgrunnlag' : 'Tilstandsrapport'}</h1>
            <p>{financialStep ? 'Samle og kontroller tall, perioder og kilder for ett boligutleieobjekt.' : 'Tallgrunnlaget er bekreftet. Ingen rapportanalyse er startet.'}</p>
          </div>
          <span className="status-label">{status}</span>
        </div>
        {financialStep ? <FinancialInput financial={session.financial} sources={session.sources} costItems={session.costItems} session={session} dispatch={dispatch} />
          : <section className="financial-input" aria-labelledby="report-next-title">
            <h2 id="report-next-title">Rapportgrunnlag</h2>
            <p>Rapportvalg og analyse er ennå ikke tilgjengelig.</p>
            <button className="secondary-action" type="button" onClick={() => dispatch({ type: 'navigate', step: 'tallgrunnlag' })}>Tilbake til Tallgrunnlag</button>
          </section>}
      </main>
    </div>
  )
}
export default App
