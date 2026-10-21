import { useEffect, useId, useRef, useState } from 'react'
import type { Dispatch } from 'react'
import type { CheckableFinding, UncertainCandidate } from '../../contracts/document-analysis.ts'
import { currentFinding } from '../state/report.ts'
import type { ReportAction, ReportState } from '../state/report.ts'

export function FindingControl({ report, candidate, dispatch, onRejected }: {
  report: ReportState; candidate: CheckableFinding | UncertainCandidate; dispatch: Dispatch<ReportAction>; onRejected: () => void
}) {
  const id = useId()
  const opener = useRef<HTMLButtonElement>(null)
  const form = useRef<HTMLFieldSetElement>(null)
  const control = report.findingControls.find(item => item.findingId === candidate.findingId)
  const rejected = Boolean(control?.rejection)
  const draft = control?.draft
  const errors = control?.errors
  const hadDraft = useRef(Boolean(draft))
  const focusNewErrors = useRef(false)
  const previousControl = useRef(control)
  const [announcement, setAnnouncement] = useState('')
  const current = currentFinding(report, candidate.findingId)
  const original = candidate.original
  useEffect(() => {
    if (hadDraft.current && !draft) opener.current?.focus()
    if (!hadDraft.current && draft) form.current?.querySelector('select')?.focus()
    hadDraft.current = Boolean(draft)
  }, [draft])
  useEffect(() => {
    if (focusNewErrors.current && errors && Object.keys(errors).length > 0) {
      form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    }
    focusNewErrors.current = false
  }, [errors])
  useEffect(() => {
    const before = previousControl.current
    previousControl.current = control
    if (!control || control === before) return
    if (control.rejection && !before?.rejection) {
      setAnnouncement('Funnet er avvist og holdes utenfor aktive rapportfunn. Originalen er bevart.')
      onRejected()
    } else if (control.revision !== (before?.revision ?? 0)) {
      setAnnouncement('Korrigeringen er brukt. Funnet må kontrolleres og bekreftes på nytt.')
    } else if (control.confirmedRevision !== null && control.confirmedRevision !== before?.confirmedRevision) {
      setAnnouncement('Funnet er kontrollert og bekreftet mot originalrapporten.')
    } else if (before?.draft && !control.draft) {
      setAnnouncement('Utkastet er forkastet. Gjeldende funn og kontrollstatus er beholdt.')
    } else if (!before?.draft && control.draft) setAnnouncement('')
  }, [control, onRejected])
  const action = (type: 'report-finding-confirm' | 'report-finding-edit' | 'report-finding-apply' | 'report-finding-cancel' | 'report-finding-reject') => {
    focusNewErrors.current = type === 'report-finding-apply'
    dispatch({ type, generation: report.generation, findingId: candidate.findingId })
  }
  return <section className="finding-control" aria-label="Kontroll av valgt funn">
    <p role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    {rejected && <p>Brukeravvist KI-uttrekk — ikke aktivt rapportfunn. Avvisningen betyr ingen TG3-avklaring, utbedring eller teknisk godkjenning.</p>}
    <p>Kontroll av uttrekket gjelder gjeldende versjon mot originalrapporten. Dette bekrefter ikke listen og avklarer ikke TG3.</p>
    <div className="finding-actions">
      <button type="button" className="secondary-action" disabled={!current || control?.confirmedRevision === (control?.revision ?? 0)} onClick={() => action('report-finding-confirm')}>Bekreft</button>
      <button ref={opener} type="button" className="secondary-action" disabled={rejected} aria-expanded={Boolean(draft)} onClick={() => action('report-finding-edit')}>Korriger</button>
      <button type="button" className="secondary-action" disabled={rejected} onClick={() => action('report-finding-reject')}>Avvis</button>
    </div>
    {!current && !rejected && <p className="field-issue">Usikkert uttrekk kan ikke bekreftes. Korriger mot en kontrollerbar kilde først.</p>}
    <section className="origin-detail" aria-label="Opprinnelig KI-uttrekk">
      <h4>Opprinnelig KI-uttrekk</h4>
      <p>{original.grade ?? 'Grad ikke oppgitt'} · {original.description}</p>
      <p>Oppgitt dokument: {original.source?.documentName ?? 'Ikke oppgitt'} · Oppgitt PDF-side: {original.source?.pdfPage ?? 'Ikke oppgitt'}</p>
      <p>Oppgitt rapporthash: {original.source?.reportHash ?? 'Ikke oppgitt'} · Funn-ID: {original.findingId}</p>
      {candidate.kind === 'uncertain' && <ul>{candidate.issues.map(issue => <li key={issue.code}>{issue.reason}</li>)}</ul>}
      {original.uncertainties.length > 0 && <ul>{original.uncertainties.map((uncertainty, index) => <li key={index}>{uncertainty}</li>)}</ul>}
    </section>
    {control?.correction && <section aria-label="Brukerens korrigering"><h4>Brukerens korrigering — {rejected ? 'historisk, ikke aktiv' : 'gjeldende'}</h4>
      <p>{control.correction.grade} · {control.correction.description}</p>
      <p>{control.correction.source.documentName} · PDF-side {control.correction.source.pdfPage} · SHA-256: {control.correction.source.reportHash}</p>
    </section>}
    {draft && <fieldset ref={form} disabled={rejected} className="finding-edit"><legend>Redigert utkast — ikke brukt</legend>
      <p>Utkastet påvirker ikke gjeldende funnliste. Kontroller grad, beskrivelse og fysisk PDF-side mot {report.outcome?.documentName}.</p>
      {(['grade', 'description', 'pdfPage'] as const).map(field => {
        const label = field === 'grade' ? 'Grad fra rapporten' : field === 'description' ? 'Beskrivelse fra rapporten' : 'Fysisk PDF-side'
        const props = { id: `${id}-${field}`, value: draft[field], 'aria-invalid': Boolean(control.errors[field]), 'aria-describedby': control.errors[field] ? `${id}-${field}-error` : undefined,
          onChange: (event: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>) => dispatch({ type: 'report-finding-draft', generation: report.generation, findingId: candidate.findingId, field, value: event.currentTarget.value }) }
        return <div className="finding-edit-field" key={field}><label htmlFor={props.id}>{label}</label>
          {field === 'grade' ? <select {...props}><option value="">Velg rapportgrad</option><option>TG2</option><option>TG3</option></select>
            : field === 'description' ? <textarea {...props} rows={3} /> : <input {...props} inputMode="numeric" />}
          {control.errors[field] && <p className="field-issue" id={`${id}-${field}-error`}>{control.errors[field]}</p>}
        </div>
      })}
      {control.errors.source && <p role="alert" className="field-issue">{control.errors.source}</p>}
      {!rejected && <div className="finding-actions"><button type="button" className="primary-action" onClick={() => action('report-finding-apply')}>Bruk korrigering</button>
        <button type="button" className="secondary-action" onClick={() => action('report-finding-cancel')}>Avbryt</button></div>}
    </fieldset>}
  </section>
}
