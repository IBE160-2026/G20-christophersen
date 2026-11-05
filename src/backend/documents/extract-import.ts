import { Worker } from 'node:worker_threads'
import { z } from 'zod'
import { ImportPageSchema } from '../../contracts/document-import.ts'
import { emitImportMeasurement, ImportMeasurementSchema } from './import-measurement.ts'
import type { PdfFormatOutcome } from './validate-pdf.ts'

export class ImportFailure extends Error {
  readonly code: 'text-limit' | 'invalid-format' | 'page-limit' | 'unsupported-synthetic' | 'response-limit' | 'live-disabled' | 'memory-limit' | 'server-outdated'
  constructor(code: ImportFailure['code']) { super(code); this.code = code }
}
const ReplySchema = z.strictObject({ kind: z.literal('extracted'), pages: z.array(ImportPageSchema).max(200),
  textBytes: z.number().int().min(0).max(1024 * 1024),
  attachments: z.array(z.strictObject({ id: z.string().max(1024), name: z.string().max(1024), isPdf: z.boolean() })).max(40) })
const ProgressSchema = z.strictObject({ kind: z.enum(['page', 'text']), page: ImportPageSchema, textBytes: z.number().int().min(0).max(1024 * 1024) })
const ChunkSchema = z.strictObject({ kind: z.literal('chunk'), pdfPage: z.number().int().min(1).max(200), text: z.string().min(1).max(4096), textBytes: z.number().int().min(0).max(1024 * 1024) })
const OperationSchema = z.strictObject({ kind: z.literal('operation'), phase: z.enum(['content-inspection', 'text', 'raster', 'cleanup']), pdfPage: z.number().int().min(1).max(200) })

/** Parser isolates share one read-only original, and release their font caches
 * before another starts. Completed pages survive a bounded resource failure;
 * malformed protocol messages still reject the entire result.
 */
export async function extractImport(format: Extract<PdfFormatOutcome, { status: 'format-validated' }>, options: { measure?: boolean; resourceLimitBytes?: number } = {}) {
  const pages: z.infer<typeof ImportPageSchema>[] = []
  let attachments: z.infer<typeof ReplySchema>['attachments'] | undefined
  let startupFailures = 0
  let textBytes = 0
  // Public callers may supply a normal array. Snapshot once, before awaiting.
  const shared = format.originalBytes.buffer instanceof SharedArrayBuffer && format.originalBytes.byteOffset === 0 && format.originalBytes.byteLength === format.originalBytes.buffer.byteLength
  const bytes = shared ? format.originalBytes : new Uint8Array(new SharedArrayBuffer(format.originalBytes.byteLength))
  if (bytes !== format.originalBytes) bytes.set(format.originalBytes)
  while (pages.length < format.pageCount) {
    const startPage = pages.length, endPage = Math.min(startPage + 20, format.pageCount)
    const worker = new Worker(new URL('./pdf-extraction-worker.ts', import.meta.url), {
      workerData: { bytes, pageCount: format.pageCount, importProfile: true, startPage, endPage, textBytes, measure: options.measure },
      resourceLimits: { maxOldGenerationSizeMb: 256, maxYoungGenerationSizeMb: 16 },
    })
    let monitor: ReturnType<typeof setInterval> | undefined
    try {
      const group = await new Promise<z.infer<typeof ReplySchema> & { attachmentsKnown: boolean; startupFailure: boolean }>((resolve, reject) => {
        const completed: z.infer<typeof ImportPageSchema>[] = []
        let pending: z.infer<typeof ImportPageSchema> | undefined
        let activePage = startPage + 1
        let initialized = false
        const chunks: string[] = []
        let chunkBytes = 0
        let used = textBytes, settled = false
        let groupAttachments: z.infer<typeof ReplySchema>['attachments'] | undefined
        const fail = (code: 'invalid-format' | 'text-limit' = 'invalid-format') => { if (!settled) { settled = true; reject(new ImportFailure(code)) } }
        const finish = (result: z.infer<typeof ReplySchema>, startupFailure = false) => { if (!settled) { settled = true; resolve({ ...result, attachmentsKnown: groupAttachments !== undefined, startupFailure }) } }
        const resourceFailure = () => {
          if (settled) return
          // Text already delivered retains its exact offsets. The unfinished
          // operation is explicitly uncertain, including optional raster work.
          const pdfPage = startPage + completed.length + 1
          if (initialized && pdfPage <= endPage && (!completed.length || activePage === pdfPage)) completed.push({ ...(pending ?? { pdfPage, text: chunks.join('') }), status: chunks.length && !pending ? 'incomplete' : pending?.status === 'incomplete' || pending?.status === 'unreadable' ? pending.status : 'unknown',
            reason: `${pending?.reason ? pending.reason + ' ' : ''}Kontrollen av denne PDF-siden ble avbrutt ved parserens ressursgrense.`, rasterUnprocessed: true })
          finish({ kind: 'extracted', pages: completed, textBytes: used, attachments: groupAttachments ?? [] }, !initialized)
        }
        // This soft guard leaves headroom below runImport's unchanged 512 MiB
        // process guard, even when a synchronous parser blocks its own loop.
        if (options.resourceLimitBytes !== undefined) monitor = setInterval(() => { if (process.memoryUsage().rss > options.resourceLimitBytes!) resourceFailure() }, 10)
        worker.on('message', (value: unknown) => {
          if (settled) return
          if (typeof value !== 'object' || value === null || !('kind' in value)) { fail(); return }
          if (value.kind === 'measurement' && 'measurement' in value) {
            const measured = ImportMeasurementSchema.safeParse(value.measurement)
            if (!measured.success || measured.data.process !== 'node') { fail(); return }
            emitImportMeasurement(measured.data); return
          }
          if (value.kind === 'attachments') {
            const metadata = z.strictObject({ kind: z.literal('attachments'), attachments: ReplySchema.shape.attachments }).safeParse(value)
            if (!metadata.success) { fail(); return }
            if (groupAttachments && JSON.stringify(groupAttachments) !== JSON.stringify(metadata.data.attachments)) { fail(); return }
            groupAttachments = metadata.data.attachments; initialized = true; return
          }
          if (value.kind === 'operation') {
            const operation = OperationSchema.safeParse(value)
            if (!operation.success || operation.data.pdfPage !== (operation.data.phase === 'cleanup' ? activePage : startPage + completed.length + 1)) { fail(); return }
            activePage = operation.data.pdfPage; initialized = true
            return
          }
          if (value.kind === 'chunk') {
            const chunk = ChunkSchema.safeParse(value)
            if (!chunk.success || pending || chunk.data.pdfPage !== startPage + completed.length + 1) { fail(); return }
            const size = Buffer.byteLength(chunk.data.text)
            if (chunk.data.textBytes < used + size || chunkBytes + size > 128 * 1024) { fail(); return }
            chunks.push(chunk.data.text); chunkBytes += size; used = chunk.data.textBytes; initialized = true; activePage = chunk.data.pdfPage
            return
          }
          if (value.kind === 'page' || value.kind === 'text') {
            const progress = ProgressSchema.safeParse(value)
            if (!progress.success || progress.data.page.pdfPage !== startPage + completed.length + 1 || progress.data.textBytes < used
              || Buffer.byteLength(progress.data.page.text) > 128 * 1024
              || pending && progress.data.kind === 'page' && progress.data.page.text !== pending.text
              || chunks.length > 0 && progress.data.page.text !== chunks.join('')
              || progress.data.textBytes < textBytes + completed.reduce((sum, page) => sum + Buffer.byteLength(page.text), 0) + Buffer.byteLength(progress.data.page.text)) { fail(); return }
            used = progress.data.textBytes; initialized = true; activePage = progress.data.page.pdfPage
            if (progress.data.kind === 'page') { completed.push(progress.data.page); pending = undefined; chunks.length = 0; chunkBytes = 0 }
            else if (pending) fail()
            else pending = progress.data.page
            return
          }
          if (value.kind === 'text-limit') { fail('text-limit'); return }
          const parsed = ReplySchema.safeParse(value)
          if (!parsed.success || parsed.data.textBytes < used || !parsed.data.pages.length || parsed.data.pages.length > endPage - startPage
            || !parsed.data.pages.every((page, index) => page.pdfPage === startPage + index + 1 && Buffer.byteLength(page.text) <= 128 * 1024)
            || parsed.data.textBytes < textBytes + parsed.data.pages.reduce((sum, page) => sum + Buffer.byteLength(page.text), 0)
            || completed.some((page, index) => JSON.stringify(page) !== JSON.stringify(parsed.data.pages[index]))
            || (pending || chunks.length) && (!parsed.data.pages[completed.length] || parsed.data.pages[completed.length]!.text !== (pending?.text ?? chunks.join('')))
            || groupAttachments && JSON.stringify(groupAttachments) !== JSON.stringify(parsed.data.attachments)) { fail(); return }
          groupAttachments = parsed.data.attachments
          finish(parsed.data)
        })
        worker.once('error', error => { if ('code' in error && error.code === 'ERR_WORKER_OUT_OF_MEMORY') resourceFailure(); else fail() })
        worker.once('messageerror', () => fail()); worker.once('exit', () => fail())
      })
      pages.push(...group.pages)
      textBytes = group.textBytes
      if (group.attachmentsKnown) {
        if (attachments && JSON.stringify(attachments) !== JSON.stringify(group.attachments)) throw new ImportFailure('invalid-format')
        attachments = group.attachments
      }
      startupFailures = group.startupFailure ? startupFailures + 1 : 0
      if (startupFailures >= 2) {
        for (let pdfPage = pages.length + 1; pdfPage <= format.pageCount; pdfPage++) pages.push({ pdfPage, text: '', status: 'unknown', rasterUnprocessed: true,
          reason: 'PDF-parseren kunne ikke startes innen ressursgrensen etter to forsøk. Siden er ikke kontrollert.' })
      }
    } finally {
      if (monitor) clearInterval(monitor)
      await worker.terminate()
    }
  }
  return { kind: 'extracted' as const, pages, attachments: attachments ?? [] }
}
