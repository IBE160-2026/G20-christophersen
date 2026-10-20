import { useEffect, useRef } from 'react'
import type { Dispatch } from 'react'
import type { ReportClient } from '../analysis/report-client.ts'
import { reportDeficiencies, analysisStatus } from '../state/report.ts'
import type { SessionAction, SessionState } from '../state/session.ts'
import { isFinancialConfirmed } from '../state/session.ts'

export function ReportAnalysis({ session, dispatch, client }: {
  session: SessionState; dispatch: Dispatch<SessionAction>; client: ReportClient
}) {
  const report = session.report
  const list = useRef<HTMLElement>(null)
  const outcome = report.outcome
  const extraction = outcome?.status === 'completed' ? outcome : outcome?.partialResult
  const deficiencies = reportDeficiencies(report)
  useEffect(() => {
    const element = list.current
    if (session.currentStep !== 'kontroller-funn' || report.status !== 'completed' || !element) return
    // Bare faktisk skjæringsflate i den rullbare arbeidsflaten teller som synlig liste.
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting && entry.intersectionRect.height > 0 && entry.intersectionRect.width > 0)) {
        dispatch({ type: 'report-list-visible', generation: report.generation })
        observer.disconnect()
      }
    }, { root: element.closest('.workspace') })
    observer.observe(element)
    return () => observer.disconnect()
  }, [report.status, report.generation, session.currentStep, dispatch])
  const canStart = isFinancialConfirmed(session) && report.selected !== null && ['ready', 'failed'].includes(report.status)
  return <section className="financial-input report-analysis" aria-labelledby="report-next-title">
    <h2 id="report-next-title">Rapportgrunnlag</h2>
    <p>Demo · lagret KI-uttrekk. Velg én tekstbasert PDF på høyst 30 sider og 50 MiB.</p>
    {session.currentStep === 'tilstandsrapport' && <><label htmlFor="report-file">Velg tilstandsrapport (PDF)</label>
    <input id="report-file" type="file" accept="application/pdf,.pdf" onChange={event => { void client.select(event.currentTarget.files?.[0] ?? null, report) }} /></>}
    {report.selected && <p className="report-identity">Gjeldende dokument: <strong>{report.selected.file.name}</strong><br />SHA-256: {report.selected.hash}</p>}
    <p id="analysis-status">{analysisStatus(report)}</p>
    <p id="analysis-start-reason">{!isFinancialConfirmed(session) ? 'Kontroller og bekreft gyldig tallgrunnlag før analyse.'
      : !report.selected ? 'Velg én rapport før du starter analysen.'
        : report.status === 'completed' ? 'Uendret rapportuttrekk gjenbrukes. Velg en ny rapport for ny analyse.'
          : report.status === 'analysing' ? 'En analyse pågår. Ny start er sperret.' : 'Start analyse sender den valgte rapporten én gang.'}</p>
    {session.currentStep === 'tilstandsrapport' && <button className="primary-action" type="button" aria-disabled={!canStart} aria-describedby="analysis-start-reason" onClick={() => { void client.start(isFinancialConfirmed(session), report) }}>Start analyse</button>}
    {report.status === 'analysing' && <button className="secondary-action" type="button" onClick={() => {
      dispatch({ type: 'report-abandon' }); client.abort()
    }}>Avbryt analyse</button>}
    {outcome?.status === 'failed' && <div className="field-issue">
      <p>{outcome.error.kind === 'document' ? 'Dokumentfeil' : 'Analysefeil'}: {outcome.error.code}.</p>
      <p>{outcome.error.reason ?? 'Årsaken er ikke kjent.'}</p>
      {outcome.error.target?.kind === 'page' && <p>Berørt PDF-side: {outcome.error.target.pdfPage}</p>}
      {outcome.error.target?.kind === 'finding' && <p>Berørt funn: {outcome.error.target.findingId}</p>}
    </div>}
    {(session.currentStep === 'kontroller-funn' || outcome?.status === 'failed') && extraction && <section ref={list} className="report-findings" aria-labelledby="findings-title"
      data-list-visible-generation={report.listVisibleGeneration ?? undefined}>
      <h2 id="findings-title">{outcome?.status === 'failed' ? 'Delresultat — ufullstendig analyse' : 'Funnliste — ikke bekreftet'}</h2>
      {outcome?.status === 'completed' && extraction.findings.length === 0 && extraction.uncertainCandidates.length === 0
        && <p>Analyse fullført — ingen TG2/TG3 funnet. Listen må fortsatt kontrolleres og bekreftes.</p>}
      <ol className="finding-list">
        {extraction.findings.map(finding => <li key={finding.findingId}>
          <h3>{finding.grade} · {finding.description}</h3>
          <p>{finding.source.documentName} · PDF-side {finding.source.pdfPage} · {finding.findingId}</p>
          <p>Opprinnelig KI-uttrekk · Ikke kontrollert</p>
        </li>)}
        {extraction.uncertainCandidates.map(candidate => <li key={candidate.findingId}>
          <h3>Usikkert funn · {candidate.original.description}</h3>
          <p>Opprinnelig grad: {candidate.original.grade ?? 'Ikke oppgitt'} · {candidate.findingId}</p>
          <p>Oppgitt dokument: {candidate.original.source?.documentName ?? 'Ikke oppgitt'} · Oppgitt PDF-side: {candidate.original.source?.pdfPage ?? 'Ikke oppgitt'} (usikker kilde)</p>
          <ul>{candidate.issues.map(issue => <li key={issue.code}>{issue.code}: {issue.reason}</li>)}</ul>
          <ul>{candidate.original.uncertainties.map((text, index) => <li key={index}>{text}</li>)}</ul>
        </li>)}
      </ol>
      {extraction.limitations.length > 0 && <div><h3>Begrensninger</h3><ul>{extraction.limitations.map((text, index) => <li key={index}>{text}</li>)}</ul></div>}
      <p>Fullført analyse er ikke brukerens kontroll eller bekreftelse av funnlisten.</p>
    </section>}
    {deficiencies.status === 'information-required' && <aside className="local-deficiencies" aria-labelledby="report-deficiencies-title">
      <h2 id="report-deficiencies-title">{deficiencies.recommendation}</h2>
      <ul>{deficiencies.triggers.map((trigger, index) => <li key={index}>{trigger.message}</li>)}</ul>
      <p>{deficiencies.nextAction}</p>
    </aside>}
    {report.status === 'completed' && session.currentStep !== 'kontroller-funn' && <button className="secondary-action" type="button" onClick={() => dispatch({ type: 'navigate', step: 'kontroller-funn' })}>Gå til Kontroller funn</button>}
    {session.currentStep === 'kontroller-funn' && <button className="secondary-action" type="button" onClick={() => dispatch({ type: 'navigate', step: 'tilstandsrapport' })}>Tilbake til Tilstandsrapport</button>}
    <button className="secondary-action" type="button" onClick={() => dispatch({ type: 'navigate', step: 'tallgrunnlag' })}>Tilbake til Tallgrunnlag</button>
  </section>
}
