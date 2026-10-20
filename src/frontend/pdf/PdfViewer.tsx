import { useEffect, useRef, useState } from 'react'
import { getDocument, GlobalWorkerOptions, TextLayer } from 'pdfjs-dist'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import './text-layer.css'
import type { SelectedReport } from '../state/report.ts'

GlobalWorkerOptions.workerSrc = workerUrl

export function PdfViewer({ selected, sourceIssue, pageNumber, zoom, onPage, onZoom }: {
  selected: SelectedReport; sourceIssue: string | null; pageNumber: number | null; zoom: number
  onPage: (page: number) => void; onZoom: (zoom: number) => void
}) {
  const [loaded, setLoaded] = useState<{ bytes: Uint8Array; document: PDFDocumentProxy } | null>(null)
  const [failure, setFailure] = useState<{ bytes: Uint8Array; message: string } | null>(null)
  const [display, setDisplay] = useState<{ key: string; status: string } | null>(null)
  const holder = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(window.innerHeight)
  useEffect(() => {
    const target = holder.current?.parentElement
    if (!target) return
    const observer = new ResizeObserver(entries => setWidth(Math.floor(entries[0]?.contentRect.width ?? 0)))
    observer.observe(target)
    const resize = () => setHeight(window.innerHeight)
    window.addEventListener('resize', resize)
    return () => { observer.disconnect(); window.removeEventListener('resize', resize) }
  }, [])
  const document = loaded?.bytes === selected.bytes ? loaded.document : null
  const key = `${selected.hash}:${pageNumber}:${zoom}:${width}:${height}`
  useEffect(() => {
    let active = true
    const task = getDocument({ data: selected.bytes.slice(),
      cMapUrl: '/pdfjs/cmaps/', cMapPacked: true, standardFontDataUrl: '/pdfjs/standard_fonts/',
      wasmUrl: '/pdfjs/wasm/', iccUrl: '/pdfjs/iccs/', stopAtErrors: true,
    })
    void task.promise.then(pdf => {
      if (active) setLoaded({ bytes: selected.bytes, document: pdf })
    }).catch(() => { if (active) setFailure({ bytes: selected.bytes, message: 'Original-PDF kunne ikke åpnes. Dokumentet eller en lokal visningsressurs kan ikke leses.' }) })
    return () => { active = false; void task.destroy().catch(() => undefined) }
  }, [selected.bytes])
  const valid = pageNumber !== null && Number.isInteger(pageNumber) && pageNumber >= 1
    && (!document || pageNumber <= document.numPages)
  useEffect(() => {
    const target = holder.current
    if (!target || !document || !valid || pageNumber === null) return
    let active = true
    let render: RenderTask | undefined
    let text: TextLayer | undefined
    // Nytt detached tre per forsøk. Bare siste ferdige side kan publiseres.
    target.replaceChildren()
    setDisplay({ key, status: 'Laster originalside' })
    void (async () => {
      const page = await document.getPage(pageNumber)
      if (!active) return
      const natural = page.getViewport({ scale: 1 })
      const available = Math.max(200, (target.parentElement?.clientWidth ?? target.clientWidth) - 16)
      const availableHeight = Math.max(200, parseFloat(getComputedStyle(target.parentElement!).maxHeight) - 16)
      const viewport = page.getViewport({ scale: Math.min(available / natural.width, availableHeight / natural.height, 1.5) * zoom })
      const wrapper = window.document.createElement('div')
      wrapper.className = 'pdf-page'
      wrapper.style.width = `${viewport.width}px`; wrapper.style.height = `${viewport.height}px`
      wrapper.style.setProperty('--scale-factor', `${viewport.scale}`)
      wrapper.style.setProperty('--total-scale-factor', `${viewport.scale}`)
      const canvas = window.document.createElement('canvas')
      const ratio = window.devicePixelRatio || 1
      canvas.width = Math.floor(viewport.width * ratio); canvas.height = Math.floor(viewport.height * ratio)
      canvas.style.width = `${viewport.width}px`; canvas.style.height = `${viewport.height}px`
      canvas.setAttribute('aria-hidden', 'true')
      const layer = window.document.createElement('div'); layer.className = 'textLayer'
      wrapper.append(canvas, layer)
      render = page.render({ canvas, viewport, transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0] })
      await render.promise
      if (!active) return
      const content = await page.getTextContent()
      if (!active) return
      text = new TextLayer({ textContentSource: content, container: layer, viewport })
      await text.render()
      if (!active) return
      target.replaceChildren(wrapper)
      setDisplay({ key, status: 'Originalside tilgjengelig' })
    })().catch(() => { if (active) { target.replaceChildren(); setDisplay({ key, status: 'Originalside kunne ikke vises. Lokal PDF-visningsfeil.' }) } })
    return () => { active = false; render?.cancel(); text?.cancel(); target.replaceChildren() }
  }, [document, pageNumber, zoom, valid, key])
  const reason = sourceIssue ?? (pageNumber === null ? 'Kildens PDF-side er ikke kjent. Ingen side er valgt.'
    : !valid ? 'Oppgitt PDF-side er utenfor originaldokumentet. Ingen side er valgt.'
      : failure?.bytes === selected.bytes ? failure.message
        : !document ? 'Laster original-PDF'
          : display?.key === key ? display.status : 'Laster originalside')
  const ready = document && valid && display?.key === key && display.status === 'Originalside tilgjengelig'
  const busy = valid && !sourceIssue && failure?.bytes !== selected.bytes
    && (!document || display?.key !== key || display.status === 'Laster originalside')
  return <section className="pdf-viewer" aria-label="Original-PDF">
    <p className="pdf-identity"><strong>{selected.file.name}</strong> · {pageNumber === null ? 'PDF-side ukjent' : `PDF-side ${pageNumber}`}{document ? ` av ${document.numPages}` : ''}</p>
    <div className="pdf-controls">
      <button type="button" className="secondary-action" disabled={!document || !valid || pageNumber === null || pageNumber <= 1} onClick={() => onPage(pageNumber! - 1)}>Forrige PDF-side</button>
      <button type="button" className="secondary-action" disabled={!document || !valid || pageNumber === null || pageNumber >= document.numPages} onClick={() => onPage(pageNumber! + 1)}>Neste PDF-side</button>
      <label>PDF-zoom <select value={zoom} onChange={event => onZoom(Number(event.target.value))}>
        <option value={1}>Hel side</option><option value={1.5}>150 %</option><option value={2}>200 %</option><option value={3}>300 %</option>
      </select></label>
    </div>
    <p id="pdf-status" role="status" aria-live="polite" aria-atomic="true">{selected.file.name} · {pageNumber === null ? 'PDF-side ukjent' : `PDF-side ${pageNumber}`}: {reason}{reason.endsWith('.') ? '' : '.'}</p>
    <div className="pdf-scroll" tabIndex={0} role="region" aria-label="Les originalside, rull ved behov" aria-busy={busy}>
      <div ref={holder} className="pdf-canvas-holder" hidden={!ready} data-pdf-page={ready ? pageNumber : undefined} />
    </div>
  </section>
}
