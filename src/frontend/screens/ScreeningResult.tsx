import { analysisModeLabel } from '../../contracts/analysis-http.ts'
import type { Dispatch } from 'react'
import type { ScreeningAssessment } from '../../contracts/screening.ts'
import type { FindingListBasis } from '../../contracts/finding-control.ts'
import { sourceTarget } from '../pdf/source-page.ts'
import { validateTg3Resolution } from '../../domain/tg3-resolution.ts'
import { assessFindingList } from '../../domain/finding-control.ts'
import { formatFinancialMetrics } from '../../presentation/finance.ts'
import { LimitationReviewDetails } from './LimitationReview.tsx'
import { FinancialMetrics } from '../components/FinancialMetrics.tsx'
import { selectResult } from '../state/result.ts'
import { isFinancialConfirmed } from '../state/session.ts'
import type { SessionAction, SessionState } from '../state/session.ts'

/** Lokal langforklaring blir i problemtrinnet; øvrige faktiske blokkere beholdes. */
function triggerText(trigger: ScreeningAssessment['triggers'][number], basis: FindingListBasis) {
  const outcome = basis.outcome
  const error = outcome?.status === 'failed' ? outcome.error : null
  const targetReason = error?.target?.kind === 'page' ? `Berørt PDF-side: ${error.target.pdfPage}.`
    : error?.target?.kind === 'finding' ? `Berørt funn: ${error.target.findingId}.` : null
  if (trigger.kind !== 'report' || trigger.code !== 'incomplete-report' || basis.status !== 'failed'
    || (trigger.reason !== (outcome?.status === 'failed' ? outcome.error.reason : null)
      && trigger.reason !== `Dokument-/analysefeil (${basis.error}).` && trigger.reason !== targetReason)) return trigger.message
  if (outcome?.status !== 'failed') return `Rapportgrunnlaget er ufullført · ${basis.error ?? 'Analyse ikke fullført'}.`
  // Dokumentgrensen bevarer alle berørte sider i dette kodegenererte prefikset.
  // Detaljerte lokale sideårsaker følger ikke med inn i Resultat.
  const pageSummary = outcome.error.kind === 'document' ? outcome.error.reason?.match(/^Berørte PDF-sider: \d+(?:, \d+)*\./)?.[0] : null
  return `Rapportgrunnlaget er ufullført · ${outcome.error.kind === 'document' ? 'Dokumentfeil' : 'Analysefeil'}: ${outcome.error.code}. ${pageSummary ?? targetReason ?? 'Berørt dokument.'}`
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
  const listAssessment = assessFindingList(basis)
  const controls = basis.status === 'completed' && outcome?.status === 'completed' ? basis.controls : []
  const candidates = [...(extraction?.findings ?? []), ...(extraction?.uncertainCandidates ?? [])]
  const metrics = formatFinancialMetrics({ grossYield: assessment.metrics.grossYield, noi: assessment.metrics.noi,
    netYield: assessment.thresholds.netYield, cashFlowBeforeTax: assessment.thresholds.cashFlow }, { partialBasis: assessment.partialBasis })
  const displayedTriggers = [...new Map(assessment.triggers.map(trigger => {
    const text = triggerText(trigger, basis)
    return [JSON.stringify([text, 'action' in trigger ? trigger.action : null]), { trigger, text }]
  })).values()]
  const historical = result.status === 'historical'
  const sameOriginal = session.report.selected?.hash === basis.reportIdentity?.reportHash
    && session.report.selected?.file.name.trim() === basis.reportIdentity?.documentName
  const canReturnToFindings = isFinancialConfirmed(session) && session.report.status === 'completed'
  const canOpenSource = sameOriginal && canReturnToFindings
  const source = (findingId: string | null, originalSource: unknown) => {
    const pdfPage = sourceTarget(originalSource, { hash: basis.reportIdentity?.reportHash ?? '', documentName: basis.reportIdentity?.documentName ?? '' }).page
    // Historisk side åpner originalrapporten, uten en nyere aktiv funnversjon som kontekst.
    dispatch({ type: 'report-view', generation: session.report.generation, view: { ...session.report.view, findingId: historical ? null : findingId, pdfPage } })
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
      <ul className="result-triggers">{displayedTriggers.map(({ trigger, text }, index) => <li key={index}>
        <p>{text}</p>
        {trigger.kind === 'economic' && <p>{trigger.target === 'netYield'
          ? `Nettoyield: ${metrics.netYield.displayValue} % · Ditt avkastningskrav (Ymin): ${metrics.netYield.threshold?.minimumDetailValue} %. Regelen bruker uavrundet grunnlag.`
          : `Kontantstrøm før skatt: ${metrics.cashFlowBeforeTax.displayValue} kr/år · Nullgrense: 0 kr/år. Regelen bruker uavrundet grunnlag.`}</p>}
        {'action' in trigger && <p>{trigger.action}</p>}
      </li>)}</ul>
      <p className="result-next-action"><strong>Neste handling:</strong> {assessment.nextAction}</p>
    </section>
    {result.unusedDraftFindingIds.length > 0 && <p className="result-draft">Ubrukt korrigeringsutkast for {result.unusedDraftFindingIds.join(', ')} inngår ikke i resultatet. Gjeldende brukt grunnlag er bevart.</p>}
    <FinancialMetrics result={result} showHistorySummary={false} />
    <section className="result-report" aria-labelledby="result-report-title">
      <h2 id="result-report-title">Rapportfunn og kontrollgrunnlag</h2>
      <p>{basis.reportIdentity?.documentName ?? 'Ingen rapport'} · {basis.status === 'completed' ? 'Analyse fullført' : 'Ufullført rapportgrunnlag'} · {listAssessment.confirmed ? 'Funnliste bekreftet' : 'Funnliste ikke bekreftet'}</p>
      {candidates.length === 0 && <p>{basis.status === 'completed' ? 'Ingen TG2/TG3 i dette uttrekket.' : 'Ingen fullført funnliste. Rapportmanglene ovenfor må avklares.'}</p>}
      {canOpenSource && <button className="secondary-action" type="button" onClick={() => source(null, { ...basis.reportIdentity, pdfPage: 1 })}>Åpne originalrapport i rapportkontroll</button>}
      <ol className="result-findings">{candidates.map(candidate => {
        const control = controls.find(item => item.findingId === candidate.findingId)
        const finding = control?.correction ?? (candidate.kind === 'checkable' ? candidate : null)
        const tg3 = basis.tg3Findings.find(item => item.findingId === candidate.findingId)
        const resolution = tg3?.resolution
        const validation = tg3 ? validateTg3Resolution(tg3.current, tg3.resolution) : null
        const applicable = validation?.applicable ?? false
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
            <p>Registrert brukerstatus: {resolution?.status === 'resolved' ? 'Avklart' : resolution?.status === 'unresolved' ? 'Uavklart' : 'Ikke oppgitt'}.</p>
            <p>Begrunnelse: {resolution?.reason || 'Ikke oppgitt'}</p><p>Konkret avklaringsgrunnlag: {resolution?.basis || 'Ikke oppgitt'}</p>
            <p>Avklaringens anvendbarhet: {applicable ? 'Gjelder gjeldende rapportforhold.' : 'Utilstrekkelig grunnlag for gjeldende rapportforhold.'}</p>
            {validation && !applicable && <ul>{Object.entries(validation.errors).map(([field, message]) => <li key={field}>{message}</li>)}</ul>}
            <p>Brukeroppgitt avklaring for førstevurdering; ikke eksternt verifisert og ingen teknisk godkjenning eller påstand om utbedring.</p></>}
        </div>
        return <li key={candidate.findingId}>
          {control?.rejection ? <details className="result-detail"><summary>Brukeravvist KI-uttrekk — {origin.description}</summary>{originContent}
            {canOpenSource && <button type="button" className="secondary-action" onClick={() => source(candidate.findingId, origin.source)}>Se avvist original i rapportkontroll</button>}
          </details> : <>
            <h3 className={finding?.grade === 'TG3' ? 'result-severe' : undefined}>{finding ? `${finding.grade} · ${finding.description}` : `Usikkert funn · ${origin.description}`}</h3>
            <p>{finding?.source.documentName ?? origin.source?.documentName ?? 'Ukjent dokument'} · PDF-side {finding?.source.pdfPage ?? origin.source?.pdfPage ?? 'ikke oppgitt'} · {candidate.findingId}</p>
            <p>{control?.correction ? 'Brukerkorrigert rapportfunn' : 'Opprinnelig KI-uttrekk'} · {control?.confirmedRevision === (control?.revision ?? 0) ? 'Kontrollert og bekreftet' : 'Ikke kontrollert'}</p>
            {finding?.grade === 'TG3' && <p className="result-tg3">Alvorlig TG3 · Separat brukerstatus: {applicable ? 'Avklart for førstevurdering' : 'Uavklart'}</p>}
            <details className="result-detail"><summary>Opphav og kontrolldetaljer — {candidate.findingId}</summary>{originContent}</details>
            {canOpenSource && <button className="secondary-action" type="button" onClick={() => source(candidate.findingId, finding?.source ?? origin.source)}>Se originalside — {candidate.findingId}</button>}
          </>}
        </li>
      })}</ol>
      {!sameOriginal && historical && <p>Den historiske originalrapporten er erstattet i aktiv økt. Historiske kildehenvisninger er bevart; gjeldende PDF er et annet grunnlag.</p>}
      <details className="result-detail"><summary>Analyseopphav og rapportidentitet</summary>
        <p>{analysisModeLabel(session.report.mode)}. Finans, regler og anbefaling er kodebestemt fra det samme grunnlaget.</p>
        <p>Rapporthash: {basis.reportIdentity?.reportHash ?? 'Ingen'}</p>
        {outcome && <p>Uttrekksversjon: {outcome.extractionVersion} · Kontraktversjon: {outcome.contractVersion} · Forespørsel: {outcome.requestId}</p>}
        {extraction && extraction.limitations.length > 0 && <ul>{extraction.limitations.map((_text, index) => <li key={index}><LimitationReviewDetails basis={basis} index={index} /></li>)}</ul>}
      </details>
    </section>
    <div className="result-actions">
      <button className="secondary-action" type="button" onClick={() => back('tallgrunnlag')}>Endre tallgrunnlag</button>
      <button className="secondary-action" type="button" aria-disabled={!canReturnToFindings} aria-describedby={!canReturnToFindings ? 'result-report-return-reason' : undefined} onClick={() => { if (canReturnToFindings) back('kontroller-funn') }}>Gå tilbake til rapportfunn</button>
      {!canReturnToFindings && <p id="result-report-return-reason">Kontroller og bekreft gjeldende tallgrunnlag og fullfør rapportanalysen før retur til rapportfunn.</p>}
    </div>
  </div>
}
