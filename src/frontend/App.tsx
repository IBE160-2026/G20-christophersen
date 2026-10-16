function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#tallgrunnlag">Hopp til arbeidsinnhold</a>

      <header className="app-header">
        <p className="product-name">Property Acquisition Agent</p>
        <p className="meta">Demo · lagret KI-uttrekk</p>
      </header>

      <nav className="step-navigation" aria-label="Vurderingens fire trinn">
        <ol className="stepper">
          <li className="step step-current">
            <a className="step-control" href="#tallgrunnlag" aria-current="step">
              <span className="step-number" aria-hidden="true">1</span>
              <span>
                <span className="step-name">Tallgrunnlag</span>
                <span className="step-status">Trinn 1 · Gjeldende</span>
              </span>
            </a>
          </li>
          {[
            { number: 2, name: 'Tilstandsrapport', reason: 'Krever gyldig og bekreftet tallgrunnlag.' },
            { number: 3, name: 'Kontroller funn', reason: 'Krever fullført rapportanalyse og synlig funnliste.' },
            { number: 4, name: 'Resultat', reason: 'Krever bekreftet tallgrunnlag og kontrollert, bekreftet funnliste.' },
          ].map((step) => (
            <li className="step" key={step.number}>
              <button
                className="step-control"
                type="button"
                aria-disabled="true"
                aria-describedby={`step-${step.number}-reason`}
              >
                <span className="step-number" aria-hidden="true">{step.number}</span>
                <span>
                  <span className="step-name">{step.name}</span>
                  <span className="step-status">Trinn {step.number} · Gjenstår · Utilgjengelig</span>
                </span>
              </button>
              <p className="step-reason meta" id={`step-${step.number}-reason`}>{step.reason}</p>
            </li>
          ))}
        </ol>
      </nav>

      <main className="workspace" tabIndex={0} aria-labelledby="tallgrunnlag">
        <div className="screen-heading">
          <div>
            <h1 id="tallgrunnlag" tabIndex={-1}>Tallgrunnlag</h1>
            <p>Samle og kontroller tall, perioder og kilder for ett boligutleieobjekt.</p>
          </div>
          <span className="status-label">Ubekreftet tallgrunnlag</span>
        </div>

        <section className="empty-state" aria-labelledby="empty-title">
          <h2 id="empty-title">Ingen tall registrert</h2>
          <p>Registrering og bekreftelse av tall er ennå ikke tilgjengelig.</p>
          <p>Tilstandsrapport åpnes først når tallgrunnlaget er gyldig og bekreftet.</p>
        </section>
      </main>
    </div>
  )
}

export default App
