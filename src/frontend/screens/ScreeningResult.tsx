import type { Dispatch } from 'react'
import type { ScreeningAssessment } from '../../contracts/screening.ts'
import type { FindingListBasis } from '../../contracts/finding-control.ts'
import { sourceTarget } from '../pdf/source-page.ts'
import { validateTg3Resolution } from '../../domain/tg3-resolution.ts'
import { FinancialMetrics } from '../components/FinancialMetrics.tsx'
import { selectResult } from '../state/result.ts'
import { isFinancialConfirmed } from '../state/session.ts'
import type { SessionAction, SessionState } from '../state/session.ts'

/** Lokal langforklaring blir i problemtrinnet; øvrige faktiske blokkere beholdes. */
function triggerText(trigger: ScreeningAssessment['triggers'][number], basis: FindingListBasis) {
  const outcome = basis.outcome
  if (trigger.kind === 'report' && trigger.code === 'unresolved-tg3') {
    const finding = basis.tg3Findings.find(item => trigger.reason.startsWith(`${item.findingId}:`))
    if (finding) return `Alvorlig TG3 er uavklart: ${finding.findingId} · ${finding.current.description} (${finding.current.source.documentName}, PDF-side ${finding.current.source.pdfPage}).`
  }
  if (trigger.kind !== 'report' || trigger.code !== 'incomplete-report' || basis.status !== 'failed'
    || (trigger.reason !== (outcome?.status === 'failed' ? outcome.error.reason : null)
      && trigger.reason !== `Dokument-/analysefeil (${basis.error}).`)) return trigger.message
  if (outcome?.status !== 'failed') return `Rapportgrunnlaget er ufullført · ${basis.error ?? 'Analyse ikke fullført'}.`
  const { error } = outcome
  const target = error.target?.kind === 'page' ? `Berørt PDF-side: ${error.target.pdfPage}.`
    : error.target?.kind === 'finding' ? `Berørt funn: ${error.target.findingId}.` : 'Berørt dokument.'
  return `Rapportgrunnlaget er ufullført · ${error.kind === 'document' ? 'Dokumentfeil' : 'Analysefeil'}: ${error.code}. ${target}`
}

/** Resultat leser bare det valgte snapshotet; aktive utkast og nye verdier er ikke beslutningsinput. */
export function ScreeningResult({ session, dispatch }: { session: SessionState; dispatch: Dispatch<SessionAction> }) {
  const result = selectResult(session)
  const back = (step: 'tallgrunnlag' | 'kontroller-funn') => dispatch({ type: 'navigate', step })
  if (result.status === 'not-calculated') return <section className="screening-result">
    <h2>Ikke beregnet</h2><p>Kontroller og bekreft tallgrunnlaget og gjeldende funnliste. Registrer separat status for alvorlig TG3 før første resultat.</p>
    <button className="secondary-action" type="button" onClick={() => back('tallgrunnlag')}>Endre tallgrunnlag</button>
  </section>
  const { assessment } = result.snapshot
  const basis = assessment.basis.reportBasis
  const outcome = basis.outcome
  const extraction = outcome?.status === 'completed' ? outcome : outcome?.partialResult
  const candidates = [...(extraction?.findings ?? []), ...(extraction?.uncertainCandidates ?? [])]
  const historical = result.status === 'historical'
  const sameOriginal = session.report.status === 'completed' && session.report.selected?.hash === basis.reportIdentity?.reportHash
    && session.report.selected?.file.name.trim() === basis.reportIdentity?.documentName
  const canReturnToFindings = isFinancialConfirmed(session) && session.report.status === 'completed'
  const canOpenSource = sameOriginal && canReturnToFindings
  const source = (findingId: string | null, rawPage: string | number | null) => {
    const pdfPage = sourceTarget({ ...basis.reportIdentity, pdfPage: rawPage }, { hash: basis.reportIdentity?.reportHash ?? '', documentName: basis.reportIdentity?.documentName ?? '' }).page
    dispatch({ type: 'report-view', generation: session.report.generation, view: { ...session.report.view, findingId, pdfPage } })
    back('kontroller-funn')
  }
  return <div className={`screening-result${historical ? ' screening-result-historical' : ''}`}>
    {historical && <section className="result-stale" aria-label="Resultatets gyldighet">
      <h2>Utdatert / Må bekreftes på nytt</h2>
      <p>Historisk resultat fra forrige vurdering. Anbefaling, tall og funn nedenfor gjelder bare det tidligere grunnlaget.</p>
      <ul>{result.changes.map((change, index) => <li key={index}>{change.message} {change.nextAction}</li>)}</ul>
    </section>}
    <section className={`recommendation recommendation-${historical ? 'historical' : assessment.status}`} aria-labelledby="recommendation-title">
      <p className="meta">{historical ? 'Historisk kodebestemt anbefaling' : 'Kodebestemt screeninganbefaling'} · Prioritet {assessment.priority}</p>
      <h2 id="recommendation-title">{assessment.recommendation}</h2>
      <p>{assessment.status === 'information-required' ? assessment.explanation.split('. ')[0] + '.' : assessment.explanation}</p>
      <h3>Avgjørende regler og forhold</h3>
      <ul className="result-triggers">{assessment.triggers.map((trigger, index) => <li key={index}>
        <p>{triggerText(trigger, basis)}</p>
        {'action' in trigger && <p>{trigger.action}</p>}
      </li>)}</ul>
      <p className="result-next-action"><strong>Neste handling:</strong> {assessment.nextAction}</p>
    </section>
    {result.unusedDraftFindingIds.length > 0 && <p className="result-draft">Ubrukt korrigeringsutkast for {result.unusedDraftFindingIds.join(', ')} inngår ikke i resultatet. Gjeldende brukt grunnlag er bevart.</p>}
    <FinancialMetrics result={result} />
    <section className="result-report" aria-labelledby="result-report-title">
      <h2 id="result-report-title">Rapportfunn og kontrollgrunnlag</h2>
      <p>{basis.reportIdentity?.documentName ?? 'Ingen rapport'} · {basis.status === 'completed' ? 'Analyse fullført' : 'Ufullført rapportgrunnlag'} · {basis.listConfirmationRevision === basis.listRevision ? 'Funnliste bekreftet' : 'Funnliste ikke bekreftet'}</p>
      {candidates.length === 0 && <p>{basis.status === 'completed' ? 'Ingen TG2/TG3 i dette uttrekket.' : 'Ingen fullført funnliste. Rapportmanglene ovenfor må avklares.'}</p>}
      {canOpenSource && <button className="secondary-action" type="button" onClick={() => source(null, 1)}>Åpne originalrapport i rapportkontroll</button>}
      <ol className="result-findings">{candidates.map(candidate => {
        const control = basis.controls.find(item => item.findingId === candidate.findingId)
        const finding = control?.correction ?? (candidate.kind === 'checkable' ? candidate : null)
        const tg3 = basis.tg3Findings.find(item => item.findingId === candidate.findingId)
        const resolution = tg3?.resolution
        const applicable = tg3 ? validateTg3Resolution(tg3.current, tg3.resolution).applicable : false
        const origin = candidate.original
        const originContent = <div className="result-origin">
          <h4>Opprinnelig KI-uttrekk</h4>
          <p>{origin.grade ?? 'Ukjent grad'} · {origin.description}</p>
          <p>{origin.source?.documentName ?? 'Dokument ikke oppgitt'} · PDF-side {origin.source?.pdfPage ?? 'ikke oppgitt'}</p>
          <p>Oppgitt rapporthash: {origin.source?.reportHash ?? 'Ikke oppgitt'} · Funn-ID: {origin.findingId}</p>
          {candidate.kind === 'uncertain' && candidate.issues.map(issue => <p key={issue.code}>Usikker kilde/grad: {issue.reason}</p>)}
          {origin.uncertainties.map((text, index) => <p key={index}>Usikkerhet: {text}</p>)}
          {control?.correction && <><h4>Brukerens korrigering</h4>{control.rejection && <p>Historisk korrigering — ikke aktivt rapportfunn.</p>}<p>{control.correction.grade} · {control.correction.description}</p><p>{control.correction.source.documentName} · PDF-side {control.correction.source.pdfPage}</p></>}
          <p>{control?.rejection ? 'Brukeravvist — ikke aktivt rapportfunn. Avvisningen er ikke teknisk avklaring.' : control?.confirmedRevision === (control?.revision ?? 0) ? 'Kontrollert og bekreftet av deg mot originalrapporten.' : 'Ikke kontrollert og bekreftet.'}</p>
          {finding?.grade === 'TG3' && <><h4>Separat brukeropplysning om TG3</h4>
            <p>Begrunnelse: {resolution?.reason || 'Ikke oppgitt'}</p><p>Konkret avklaringsgrunnlag: {resolution?.basis || 'Ikke oppgitt'}</p>
            <p>Brukeroppgitt avklaring for førstevurdering; ikke eksternt verifisert og ingen teknisk godkjenning eller påstand om utbedring.</p></>}
        </div>
        return <li key={candidate.findingId}>
          {control?.rejection ? <details className="result-detail"><summary>Brukeravvist KI-uttrekk — {origin.description}</summary>{originContent}
            {canOpenSource && <button type="button" className="secondary-action" onClick={() => source(candidate.findingId, origin.source?.pdfPage ?? null)}>Se avvist original i rapportkontroll</button>}
          </details> : <>
            <h3 className={finding?.grade === 'TG3' ? 'result-severe' : undefined}>{finding ? `${finding.grade} · ${finding.description}` : `Usikkert funn · ${origin.description}`}</h3>
            <p>{finding?.source.documentName ?? origin.source?.documentName ?? 'Ukjent dokument'} · PDF-side {finding?.source.pdfPage ?? origin.source?.pdfPage ?? 'ikke oppgitt'} · {candidate.findingId}</p>
            <p>{control?.correction ? 'Brukerkorrigert rapportfunn' : 'Opprinnelig KI-uttrekk'} · {control?.confirmedRevision === (control?.revision ?? 0) ? 'Kontrollert og bekreftet' : 'Ikke kontrollert'}</p>
            {finding?.grade === 'TG3' && <p className="result-tg3">Alvorlig TG3 · Separat brukerstatus: {applicable ? 'Avklart for førstevurdering' : 'Uavklart'}</p>}
            <details className="result-detail"><summary>Opphav og kontrolldetaljer — {candidate.findingId}</summary>{originContent}</details>
            {canOpenSource && <button className="secondary-action" type="button" onClick={() => source(candidate.findingId, finding?.source.pdfPage ?? origin.source?.pdfPage ?? null)}>Se originalside — {candidate.findingId}</button>}
          </>}
        </li>
      })}</ol>
      {!sameOriginal && historical && <p>Den historiske originalrapporten er erstattet i aktiv økt. Historiske kildehenvisninger er bevart; gjeldende PDF er et annet grunnlag.</p>}
      <details className="result-detail"><summary>Analyseopphav og rapportidentitet</summary>
        <p>Demo · lagret KI-uttrekk. Finans, regler og anbefaling er kodebestemt fra det samme grunnlaget.</p>
        <p>Rapporthash: {basis.reportIdentity?.reportHash ?? 'Ingen'}</p>
        {outcome && <p>Uttrekksversjon: {outcome.extractionVersion} · Kontraktversjon: {outcome.contractVersion} · Forespørsel: {outcome.requestId}</p>}
        {extraction?.limitations.map((text, index) => <p key={index}>Begrensning: {text}</p>)}
      </details>
    </section>
    <div className="result-actions">
      <button className="secondary-action" type="button" onClick={() => back('tallgrunnlag')}>Endre tallgrunnlag</button>
      <button className="secondary-action" type="button" aria-disabled={!canReturnToFindings} aria-describedby={!canReturnToFindings ? 'result-report-return-reason' : undefined} onClick={() => { if (canReturnToFindings) back('kontroller-funn') }}>Gå tilbake til rapportfunn</button>
      {!canReturnToFindings && <p id="result-report-return-reason">Kontroller og bekreft gjeldende tallgrunnlag og fullfør rapportanalysen før retur til rapportfunn.</p>}
    </div>
  </div>
}
