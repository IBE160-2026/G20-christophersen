import { useEffect, useRef } from 'react'
import { sourceTarget } from '../pdf/source-page.ts'
import { SourceReview } from '../pdf/SourceReview.tsx'
import { FindingControl } from './FindingControl.tsx'
import type { Dispatch } from 'react'
import type { ReportClient } from '../analysis/report-client.ts'
import { reportDeficiencies, analysisStatus, currentFinding } from '../state/report.ts'
import type { SessionAction, SessionState } from '../state/session.ts'
import { isFinancialConfirmed } from '../state/session.ts'

export function ReportAnalysis({ session, dispatch, client }: {
  session: SessionState; dispatch: Dispatch<SessionAction>; client: ReportClient
}) {
  const report = session.report
  const list = useRef<HTMLHeadingElement>(null)
  const outcome = report.outcome
  const extraction = outcome?.status === 'completed' ? outcome : outcome?.partialResult
  const deficiencies = reportDeficiencies(report)
  const selectedFinding = report.view.findingId ? currentFinding(report, report.view.findingId) : null
  const selectedCandidate = extraction?.uncertainCandidates.find(candidate => candidate.findingId === report.view.findingId)
  const summary = selectedFinding ? `${selectedFinding.grade} · ${selectedFinding.description}` : selectedCandidate ? `Usikkert funn · ${selectedCandidate.original.description}` : null
  const target = (source: unknown) => sourceTarget(source, { hash: report.selected?.hash ?? '', documentName: report.selected?.file.name.trim() ?? '' })
  const sourceIssue = !selectedFinding && selectedCandidate ? target(selectedCandidate.original.source).issue : null
  const onView = (view: typeof report.view) => dispatch({ type: 'report-view', generation: report.generation, view })
  useEffect(() => {
    const element = list.current
    if (session.currentStep !== 'kontroller-funn' || report.status !== 'completed' || !element) return
    // Først synlig listestart, ikke seksjonens kant/padding, gir ferdiglistehendelse.
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 1)) {
        dispatch({ type: 'report-list-visible', generation: report.generation })
        observer.disconnect()
      }
    }, { root: element.closest('.workspace'), threshold: 1 })
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
    {(session.currentStep === 'kontroller-funn' || outcome?.status === 'failed') && extraction && <section className="report-findings" aria-labelledby="findings-title"
      data-list-visible-generation={report.listVisibleGeneration ?? undefined}>
      <h2 ref={list} id="findings-title">{outcome?.status === 'failed' ? 'Delresultat — ufullstendig analyse' : 'Funnliste — ikke bekreftet'}</h2>
      {outcome?.status === 'completed' && extraction.findings.length === 0 && extraction.uncertainCandidates.length === 0
        && <p>Analyse fullført — ingen TG2/TG3 funnet. Listen må fortsatt kontrolleres og bekreftes.</p>}
      <SourceReview report={report} summary={summary} sourceIssue={sourceIssue} onView={onView}>
      <ol className="finding-list">
        {[...extraction.findings, ...extraction.uncertainCandidates].map(candidate => {
          const finding = currentFinding(report, candidate.findingId)
          const control = report.findingControls.find(item => item.findingId === candidate.findingId)
          return <li key={candidate.findingId}>
          {finding ? <>
          <h3><button className="finding-select" type="button" aria-pressed={report.view.findingId === finding.findingId} onClick={() => onView({ ...report.view, findingId: finding.findingId, pdfPage: finding.source.pdfPage })}>{finding.grade} · {finding.description}</button></h3>
          <p>{finding.source.documentName} · PDF-side {finding.source.pdfPage} · {finding.findingId}</p>
          <p>{control?.correction ? 'Brukerkorrigert' : 'Opprinnelig KI-uttrekk'} · {control?.confirmedRevision === (control?.revision ?? 0) ? 'Kontrollert og bekreftet mot originalrapporten' : 'Ikke kontrollert'}</p>
          </> : <>
          <h3><button className="finding-select" type="button" aria-pressed={report.view.findingId === candidate.findingId} onClick={() => onView({ ...report.view, findingId: candidate.findingId, pdfPage: target(candidate.original.source).page })}>Usikkert funn · {candidate.original.description}</button></h3>
          <p>Opprinnelig grad: {candidate.original.grade ?? 'Ikke oppgitt'} · {candidate.findingId}</p>
          <p>Oppgitt dokument: {candidate.original.source?.documentName ?? 'Ikke oppgitt'} · Oppgitt PDF-side: {candidate.original.source?.pdfPage ?? 'Ikke oppgitt'} (usikker kilde)</p>
          {candidate.kind === 'uncertain' && <ul>{candidate.issues.map(issue => <li key={issue.code}>{issue.code}: {issue.reason}</li>)}</ul>}
          <ul>{candidate.original.uncertainties.map((text, index) => <li key={index}>{text}</li>)}</ul>
          </>}
          {control?.draft && <p>Redigert utkast — ikke brukt</p>}
          {report.status === 'completed' && report.view.findingId === candidate.findingId && <FindingControl report={report} candidate={candidate} dispatch={dispatch} />}
        </li>})}
      </ol>
      </SourceReview>
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
