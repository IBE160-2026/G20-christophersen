import { useId, useRef, useState, useEffect, useLayoutEffect } from 'react'
import type { Dispatch } from 'react'
import type { FindingCorrection } from '../../contracts/finding-control.ts'
import type { Tg3Field, Tg3Resolution as Resolution } from '../../contracts/tg3-resolution.ts'
import { validateTg3Resolution } from '../../domain/tg3-resolution.ts'
import type { ReportAction } from '../state/report.ts'

export function Tg3Resolution({ current, resolution, findingId, generation, dispatch }: {
  current: FindingCorrection; resolution: Resolution | null; findingId: string; generation: number; dispatch: Dispatch<ReportAction>
}) {
  const id = useId()
  const group = useRef<HTMLFieldSetElement>(null)
  useLayoutEffect(() => {
    const active = document.activeElement
    if (active instanceof HTMLElement && group.current?.contains(active) && active.matches('select, textarea')) {
      active.scrollIntoView({ block: 'nearest' })
    }
  })
  const validation = validateTg3Resolution(current, resolution)
  const previous = useRef(validation.applicable)
  const [announcement, setAnnouncement] = useState('')
  useEffect(() => {
    if (previous.current !== validation.applicable) setAnnouncement(validation.applicable
      ? 'TG3-avklaringen er gyldig registrert for førstevurdering.' : 'TG3-avklaringen er uavklart. Se oppgitte mangler.')
    previous.current = validation.applicable
  }, [validation.applicable])
  const register = (field: Tg3Field, value: string) => dispatch({ type: 'report-tg3-register', generation, findingId, field, value })
  return <fieldset ref={group} className="finding-edit tg3-resolution"><legend>Separat TG3-avklaring</legend>
    <p>Brukeroppgitt grunnlag for {current.description} · {current.source.documentName} · PDF-side {current.source.pdfPage}.</p>
    <p>Avklart betyr tilstrekkelig grunnlag for førstevurdering og screening. Det betyr ikke nødvendigvis utbedret eller teknisk godkjent. Dette er ikke KI-fakta; grunnlaget verifiseres ikke eksternt.</p>
    <p role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    <p>{validation.applicable ? 'Brukerbekreftet avklaring for førstevurdering' : 'Uavklart TG3 — utilstrekkelig avklaringsgrunnlag'}</p>
    {validation.errors.binding && <div className="field-issue" id={`${id}-binding`}>
      <p>{validation.errors.binding}</p>
      <p>Tidligere registrert status: {resolution?.status === 'resolved' ? 'Avklart' : resolution?.status === 'unresolved' ? 'Uavklart' : 'Ukjent'}. Registrert for {resolution?.binding.description} · {resolution?.binding.source.documentName} · PDF-side {resolution?.binding.source.pdfPage}.</p>
      <p>Kontroller begrunnelse og konkret eksternt grunnlag mot gjeldende forhold, og velg status for gjeldende grunnlag.</p>
    </div>}
    <div className="finding-edit-field"><label htmlFor={`${id}-status`}>TG3-status for gjeldende forhold</label>
      <select id={`${id}-status`} value={validation.errors.binding ? '' : resolution?.status === 'resolved' || resolution?.status === 'unresolved' ? resolution.status : ''}
        aria-invalid={Boolean(validation.errors.status || validation.errors.binding)} aria-describedby={`${id}-status-error${validation.errors.binding ? ` ${id}-binding` : ''}`}
        onChange={event => register('status', event.currentTarget.value)}>
        <option value="">Velg status</option><option value="unresolved">Uavklart</option><option value="resolved">Avklart</option>
      </select>
      <p id={`${id}-status-error`} className={validation.errors.status ? 'field-issue' : undefined}>{validation.errors.status ?? 'Statusen gjelder dette rapportforholdet og de registrerte tekstene.'}</p>
    </div>
    {(['reason', 'basis'] as const).map(field => <div className="finding-edit-field" key={field}>
      <label htmlFor={`${id}-${field}`}>{field === 'reason' ? 'Kort begrunnelse for TG3-avklaring' : 'Konkret eksternt avklaringsgrunnlag'}</label>
      <textarea id={`${id}-${field}`} rows={3} value={resolution?.[field] ?? ''} aria-invalid={Boolean(validation.errors[field])}
        aria-describedby={validation.errors[field] ? `${id}-${field}-error` : undefined} onChange={event => register(field, event.currentTarget.value)} />
      {validation.errors[field] && <p className="field-issue" id={`${id}-${field}-error`}>{validation.errors[field]}</p>}
    </div>)}
  </fieldset>
}
