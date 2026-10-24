import { useEffect, useRef, useState } from 'react'
import type { Dispatch } from 'react'
import type { FindingListBasis } from '../../contracts/finding-control.ts'
import { applicableLimitationReview } from '../../domain/finding-control.ts'
import { findingListBasis } from '../state/report.ts'
import type { ReportState } from '../state/report.ts'
import type { SessionAction } from '../state/session.ts'

export function LimitationReviewDetails({ basis, index }: { basis: FindingListBasis; index: number }) {
  const review = applicableLimitationReview(basis, index)
  const previous = basis.limitationReviews?.find(item => item.index === index)
  return <>
    <p>Opprinnelig KI-begrensning: {basis.outcome?.status === 'completed' ? basis.outcome.limitations[index] : basis.outcome?.partialResult?.limitations[index]}</p>
    {previous && <>
      <p>{review ? 'Brukerbekreftet vurdering: kontrollert og ikke kritisk for screening i denne revisjonen.' : 'Tidligere brukervurdering — gjelder ikke gjeldende rapportgrunnlag. Kontroller på nytt.'}</p>
      <p>Din begrunnelse: {previous.reason}</p>
      <p>Ikke et KI-faktum, ingen teknisk avklaring og ingen fjerning av begrensningen.</p>
    </>}
  </>
}

export function LimitationReviewControl({ report, index, dispatch }: {
  report: ReportState; index: number; dispatch: Dispatch<SessionAction>
}) {
  const [reason, setReason] = useState('')
  const [declared, setDeclared] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const revokeButton = useRef<HTMLButtonElement>(null)
  const reasonField = useRef<HTMLTextAreaElement>(null)
  const basis = findingListBasis(report)
  const review = applicableLimitationReview(basis, index)
  const isApplicable = review !== null
  const wasApplicable = useRef(isApplicable)
  useEffect(() => {
    if (isApplicable !== wasApplicable.current) {
      setAnnouncement(isApplicable ? 'Din vurdering er registrert for denne revisjonen. Andre mangler består.' : 'Vurderingen er trukket tilbake. Begrensningen blokkerer screening igjen.')
      if (isApplicable) revokeButton.current?.focus()
      else reasonField.current?.focus()
    }
    wasApplicable.current = isApplicable
  }, [isApplicable])
  const outcome = report.outcome
  const canReview = report.status === 'completed' && !report.error && outcome?.status === 'completed'
    && report.selected?.hash === outcome.reportHash && report.selected.file.name.trim() === outcome.documentName
  const prefix = `limitation-${report.generation}-${index}`
  return <li>
    <LimitationReviewDetails basis={basis} index={index} />
    <p role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    {review ? <button ref={revokeButton} className="secondary-action" type="button" onClick={() => { setReason(''); setDeclared(false); dispatch({ type: 'report-limitation-revoke', generation: report.generation, index }) }}>Trekk tilbake vurdering av begrensning {index + 1}</button>
      : canReview && <fieldset className="finding-edit limitation-review">
        <legend>Vurder generell begrensning {index + 1}</legend>
        <p>Bruk bare for generell informasjon du har kontrollert mot originalrapporten. Manglende eller motstridende kritisk informasjon, ufullstendig lesing og uløst kritisk usikkerhet skal fortsatt blokkere screening.</p>
        <div className="finding-edit-field"><label htmlFor={`${prefix}-reason`}>Kort begrunnelse for at begrensning {index + 1} ikke er kritisk</label>
        <textarea ref={reasonField} id={`${prefix}-reason`} value={reason} onChange={event => setReason(event.currentTarget.value)} /></div>
        <label className="limitation-declaration" htmlFor={`${prefix}-declaration`}><input id={`${prefix}-declaration`} type="checkbox" checked={declared} onChange={event => setDeclared(event.currentTarget.checked)} />Jeg har kontrollert originalrapporten. Dette er en generell begrensning; den innebærer ikke manglende eller motstridende kritisk informasjon, ufullstendig lesing eller uløst kritisk usikkerhet.</label>
        <button className="secondary-action" type="button" disabled={!reason.trim() || !declared} onClick={() => {
          if (!reason.trim() || !declared || outcome?.status !== 'completed') return
          dispatch({ type: 'report-limitation-review', generation: report.generation, review: { index, original: outcome.limitations[index]!,
            declaration: 'general-noncritical', reason, reportHash: outcome.reportHash, documentName: outcome.documentName,
            requestId: outcome.requestId, listRevision: report.listRevision, tg3Revision: report.tg3Revision } })
        }}>Kontrollert og ikke kritisk for screening — begrensning {index + 1}</button>
        <p>Din vurdering gjelder bare denne rapportrevisjonen. Andre kritiske mangler og separat TG3-status består.</p>
      </fieldset>}
  </li>
}
