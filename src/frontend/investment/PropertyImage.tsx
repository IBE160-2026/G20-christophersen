import { useEffect, useRef, useState } from 'react'
import { getDocument, OPS, PDFWorker } from 'pdfjs-dist'
import type { PDFDocumentLoadingTask, PDFPageProxy, RenderTask } from 'pdfjs-dist'
import type { SelectedReport } from '../state/report.ts'
import { largeRasterSize, previewSize, PROPERTY_IMAGE_LIMITS, rasterRgba } from './property-image-policy.ts'
import { PreviewWorkerPort } from './property-image-port.ts'
import type { PreviewRawWorker } from './property-image-port.ts'

type Preview = { bytes: Uint8Array; hash: string; kind: 'image' | 'page' | 'failed'; page: number; resourceLimit?: boolean }
type Raster = { width: number; height: number; bitmap?: CanvasImageSource & { width?: number; height?: number; displayWidth?: number; displayHeight?: number }; data?: unknown; kind?: unknown; transferMaps?: unknown }

function rasterCanvas(value: unknown): { canvas: HTMLCanvasElement; pixels: number } | null {
  if (!value || typeof value !== 'object') return null
  const image = value as Raster
  if (!largeRasterSize(image.width, image.height) || image.transferMaps) return null
  const dimensions = previewSize(image.width, image.height)!
  const canvas = document.createElement('canvas')
  canvas.width = dimensions.width; canvas.height = dimensions.height
  const context = canvas.getContext('2d')
  if (!context) return null
  try {
    // PDF.js can return an ImageBitmap or a JPEG-decoder VideoFrame.
    const bitmapWidth = image.bitmap?.displayWidth ?? image.bitmap?.width
    const bitmapHeight = image.bitmap?.displayHeight ?? image.bitmap?.height
    if (image.bitmap && bitmapWidth === image.width && bitmapHeight === image.height) {
      context.drawImage(image.bitmap, 0, 0, canvas.width, canvas.height)
    } else {
      const rgba = rasterRgba(image.width, image.height, image.kind, image.data)
      if (!rgba) return null
      const original = document.createElement('canvas')
      original.width = image.width; original.height = image.height
      const originalContext = original.getContext('2d')
      if (!originalContext) return null
      const pixels = originalContext.createImageData(image.width, image.height)
      pixels.data.set(rgba); originalContext.putImageData(pixels, 0, 0)
      context.drawImage(original, 0, 0, canvas.width, canvas.height)
      original.width = 0; original.height = 0
    }
    return { canvas, pixels: image.width * image.height }
  } catch { canvas.width = 0; canvas.height = 0; return null }
}

/** Current loaded bytes only. No photo identification, network images, OCR or analysis dispatch. */
export function PropertyImage({ selected, onOpen }: { selected: SelectedReport | null; onOpen: (page: number) => void }) {
  const holder = useRef<HTMLDivElement>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const current = selected && preview?.bytes === selected.bytes && preview.hash === selected.hash ? preview : null
  useEffect(() => {
    const target = holder.current
    if (!target) return
    target.replaceChildren()
    if (!selected) return
    let active = true, timedOut = false, budgetExceeded = false
    let render: RenderTask | undefined
    let best: { canvas: HTMLCanvasElement; pixels: number; page: number } | null = null
    let displayed: HTMLCanvasElement | null = null
    const pendingImages = new Set<() => void>()
    let task: PDFDocumentLoadingTask | undefined, pdfWorker: PDFWorker | undefined, port: PreviewWorkerPort | undefined
    let destroyed: Promise<void> | undefined
    const destroy = () => {
      if (destroyed) return destroyed
      // The port settles pending PDF.js requests even after its native worker has closed.
      port?.terminate()
      destroyed = (task?.destroy() ?? Promise.resolve()).catch(() => undefined).finally(() => pdfWorker?.destroy())
      return destroyed
    }
    const fail = () => { if (active) setPreview({ bytes: selected.bytes, hash: selected.hash, kind: 'failed', page: 1, resourceLimit: budgetExceeded }) }
    const timer = window.setTimeout(() => {
      timedOut = true; for (const stop of pendingImages) stop()
      render?.cancel(); fail(); void destroy()
    }, PROPERTY_IMAGE_LIMITS.deadlineMs)
    const ensureActive = () => { if (!active || timedOut || budgetExceeded || destroyed) throw new Error('preview-stopped') }
    const publish = (canvas: HTMLCanvasElement, kind: 'image' | 'page', page: number) => {
      ensureActive()
      canvas.className = 'property-document-image__canvas'
      canvas.dataset.previewKind = kind
      canvas.setAttribute('role', 'img')
      canvas.setAttribute('aria-label', kind === 'image'
        ? `Raster fra ${selected.file.name}, PDF-side ${page}. Motivet er ikke identifisert.`
        : `Dokumentforhåndsvisning av ${selected.file.name}, PDF-side ${page}.`)
      displayed = canvas; target.replaceChildren(canvas)
      setPreview({ bytes: selected.bytes, hash: selected.hash, kind, page })
    }
    void (async () => {
      try {
        port = new PreviewWorkerPort(new Worker(new URL('./property-image-worker.ts', import.meta.url), { type: 'module' }) as unknown as PreviewRawWorker, limit => {
          budgetExceeded = limit
          for (const stop of pendingImages) stop()
          render?.cancel(); fail(); void destroy()
        })
        await port.ready
        ensureActive()
        pdfWorker = PDFWorker.create({ port: port as unknown as Worker })
        task = getDocument({ data: selected.bytes.slice(), worker: pdfWorker, stopAtErrors: true,
          maxImageSize: PROPERTY_IMAGE_LIMITS.decodedPixels, canvasMaxAreaInBytes: PROPERTY_IMAGE_LIMITS.decodedPixels * 4,
          cMapUrl: '/pdfjs/cmaps/', cMapPacked: true, standardFontDataUrl: '/pdfjs/standard_fonts/',
          wasmUrl: '/pdfjs/wasm/', iccUrl: '/pdfjs/iccs/' })
        const pdf = await task.promise
        ensureActive()
        let inspected = 0
        for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, PROPERTY_IMAGE_LIMITS.pages); pageNumber++) {
          const page: PDFPageProxy | null = await pdf.getPage(pageNumber).catch(() => null)
          ensureActive()
          if (!page) continue
          try {
          const operators = await page.getOperatorList().catch(() => null)
          ensureActive()
          if (!operators || operators.fnArray.length > PROPERTY_IMAGE_LIMITS.operators) continue
          for (let index = 0; index < operators.fnArray.length && inspected < PROPERTY_IMAGE_LIMITS.images; index++) {
            const operation = operators.fnArray[index], args = operators.argsArray[index]
            if (operation !== OPS.paintImageXObject && operation !== OPS.paintInlineImageXObject) continue
            inspected++
            let image: unknown
            if (operation === OPS.paintInlineImageXObject) image = args[0]
            else if (typeof args[0] === 'string') {
              const objects = args[0].startsWith('g_') ? page.commonObjs : page.objs
              if (objects.has(args[0])) image = objects.get(args[0])
              else image = await new Promise<unknown>(resolve => {
                // Image delivery can follow the operator list. Wait briefly, never indefinitely.
                const finish = (value: unknown) => {
                  window.clearTimeout(wait); pendingImages.delete(stop); resolve(value)
                }
                const stop = () => finish(null)
                const wait = window.setTimeout(stop, 150)
                pendingImages.add(stop)
                objects.get(args[0], finish)
              })
            }
            ensureActive()
            const candidate = rasterCanvas(image)
            if (candidate && (!best || candidate.pixels > best.pixels)) {
              if (best) { best.canvas.width = 0; best.canvas.height = 0 }
              best = { ...candidate, page: pageNumber }
            } else if (candidate) { candidate.canvas.width = 0; candidate.canvas.height = 0 }
          }
          } finally { page.cleanup() }
          if (inspected >= PROPERTY_IMAGE_LIMITS.images) break
        }
        ensureActive()
        if (best) publish(best.canvas, 'image', best.page)
        else {
          const page = await pdf.getPage(1)
          ensureActive()
          const natural = page.getViewport({ scale: 1 })
          const dimensions = previewSize(natural.width, natural.height)
          if (!dimensions) throw new Error('invalid-page-size')
          const canvas = document.createElement('canvas')
          canvas.width = dimensions.width; canvas.height = dimensions.height
          render = page.render({ canvas, viewport: page.getViewport({ scale: dimensions.scale }), background: '#ffffff' })
          await render.promise
          publish(canvas, 'page', 1)
          page.cleanup()
        }
      } catch { fail() }
      finally {
        window.clearTimeout(timer)
        if (best && best.canvas !== displayed) { best.canvas.width = 0; best.canvas.height = 0 }
        await destroy()
      }
    })()
    return () => {
      active = false; window.clearTimeout(timer)
      for (const stop of pendingImages) stop()
      render?.cancel(); void destroy()
      target.replaceChildren()
      if (displayed) { displayed.width = 0; displayed.height = 0 }
      if (best && best.canvas !== displayed) { best.canvas.width = 0; best.canvas.height = 0 }
    }
  }, [selected])

  const message = !selected ? 'Last opp en salgsoppgave for å se dokumentet.'
    : current?.resourceLimit ? 'Dokumentforhåndsvisningen nådde ressursgrensen. Åpne originalen.'
      : current?.kind === 'failed' ? 'Dokumentforhåndsvisning er utilgjengelig. Åpne originalen.'
      : 'Forbereder lokal dokumentforhåndsvisning …'
  return <figure className="property-document-image">
    <div className="property-document-image__surface" aria-busy={Boolean(selected && !current)}>
      <div ref={holder} hidden={!current || current.kind === 'failed'} />
      {(!current || current.kind === 'failed') && <p className="property-document-image__placeholder" role="status">{message}</p>}
    </div>
    {selected && <figcaption className="property-document-image__caption">
      <span>{current && current.kind !== 'failed'
        ? `${selected.file.name} · fysisk PDF-side ${current.page}. ${current.kind === 'image' ? 'Raster fra dokumentet; motivet er ikke identifisert.' : 'Originalside, ikke et identifisert eiendomsfoto.'}`
        : selected.file.name}</span>
      <button className="property-document-image__open" type="button" onClick={() => onOpen(current?.page ?? 1)}>Åpne originaldokument</button>
    </figcaption>}
  </figure>
}
