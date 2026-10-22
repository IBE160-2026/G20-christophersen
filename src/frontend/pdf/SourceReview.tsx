import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ReportState } from '../state/report.ts'
import { PdfViewer } from './PdfViewer.tsx'

export function SourceReview({ report, summary, sourceIssue, children, onView }: {
  report: ReportState; summary: string | null; sourceIssue: string | null; children: ReactNode
  onView: (view: ReportState['view']) => void
}) {
  const [wide, setWide] = useState(() => matchMedia('(min-width: 1200px)').matches)
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const wholeReport = report.view.findingId === null && report.view.pdfPage !== null
  useEffect(() => {
    const media = matchMedia('(min-width: 1200px)')
    const changed = () => { setWide(media.matches); setOpen(false) }
    media.addEventListener('change', changed)
    return () => media.removeEventListener('change', changed)
  }, [])
  useEffect(() => {
    if (open) { dialog.current?.showModal(); heading.current?.focus() }
    else dialog.current?.close()
  }, [open])
  const close = () => { setOpen(false); opener.current?.focus({ preventScroll: true }) }
  const viewer = report.selected && <PdfViewer selected={report.selected} sourceIssue={sourceIssue} pageNumber={report.view.pdfPage} zoom={report.view.zoom}
    onPage={pdfPage => onView({ ...report.view, pdfPage })} onZoom={zoom => onView({ ...report.view, zoom })} />
  return <div className={`source-review${wide ? ' source-review-wide' : ''}`}>
    <div className="source-findings">{children}
      {!wide && <button ref={opener} className="secondary-action" type="button" disabled={!summary} aria-haspopup="dialog" onClick={() => setOpen(true)}>{wholeReport ? 'Åpne originalrapport' : 'Åpne PDF for valgt funn'}</button>}
    </div>
    {wide && <aside className="source-original" aria-label="Valgt funns originalkilde">{summary ? <><p>{summary}</p>{viewer}</> : <p>Velg et funn for å vise originalkilden.</p>}</aside>}
    {!wide && <dialog ref={dialog} className="pdf-dialog" aria-labelledby="pdf-panel-title" onKeyDown={event => {
      if (event.key !== 'Tab') return
      const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), select:not(:disabled), [tabindex="0"]')]
      const first = controls[0]; const last = controls.at(-1)
      if (event.shiftKey && (window.document.activeElement === first || window.document.activeElement === heading.current)) {
        event.preventDefault(); last?.focus()
      } else if (!event.shiftKey && window.document.activeElement === last) {
        event.preventDefault(); first?.focus()
      }
    }} onCancel={event => { event.preventDefault(); close() }}>
      <h2 ref={heading} id="pdf-panel-title" tabIndex={-1}>{wholeReport ? 'Originalrapport' : 'Originalkilde for valgt funn'}</h2>
      <p>{summary}</p>
      <button type="button" className="secondary-action" onClick={close}>Tilbake til funnkontroll</button>
      {open && viewer}
    </dialog>}
  </div>
}
