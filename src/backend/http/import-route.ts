import { Router } from 'express'
import type { Request } from 'express'
import { AnalysisHttpCorrelationSchema } from '../../contracts/analysis-http.ts'
import { ImportHttpResponseSchema, ImportRoleSchema, IMPORT_MAX_PDF_BYTES } from '../../contracts/document-import.ts'
import { ReportHashSchema } from '../../contracts/document-analysis.ts'
import { HttpRejection, receivePdf } from './receive-pdf.ts'
import { ImportRejection, runImport } from './run-import.ts'
import type { ImportPipelineOptions } from './run-import.ts'
import { createProcessingLock } from './processing-lock.ts'
import type { ProcessingLock } from './processing-lock.ts'

export function createImportRouter(options: ImportPipelineOptions & { lock?: ProcessingLock } = {}) {
  const router = Router(), lock = options.lock ?? createProcessingLock()
  const markers = new Set<string>(), active = new Map<Request, AbortController>(), pending = new Set<Promise<void>>()
  let stopping = false
  router.get('/document-import-config', (_request, response) => { response.setHeader('Cache-Control', 'no-store'); response.json({ mode: 'demo', liveEnabled: false, codeFirst: true, semanticBudgetUsd: '0.20', maxPages: 200, maxBytes: IMPORT_MAX_PDF_BYTES }) })
  router.post('/document-import', async (request, response) => {
    response.setHeader('Cache-Control', 'no-store')
    const reject = (code: string, status: number) => {
      if (response.destroyed || response.writableEnded) return
      response.setHeader('Connection', 'close'); request.resume()
      const parsed = ImportHttpResponseSchema.safeParse({ kind: 'rejected', code })
      response.status(status).json(parsed.success ? parsed.data : { kind: 'rejected', code: 'processing-failure' })
    }
    const rawGeneration = request.get('X-Analysis-Generation')
    const correlation = AnalysisHttpCorrelationSchema.safeParse({ sessionId: request.get('X-Session-Id'), requestId: request.get('X-Request-Id'),
      generation: rawGeneration && /^(0|[1-9]\d*)$/.test(rawGeneration) ? Number(rawGeneration) : undefined })
    const role = ImportRoleSchema.safeParse(request.get('X-Document-Role'))
    const retained = request.get('X-Retained-Bytes') ?? '0'
    const parent = request.get('X-Parent-Hash') ?? null
    const attachmentId = request.get('X-Attachment-Id') ?? null
    if (request.get('X-Import-Mode') && request.get('X-Import-Mode') !== 'demo') { reject('live-disabled', 403); return }
    if (!correlation.success || !role.success || !/^(0|[1-9]\d*)$/.test(retained) || Number(retained) > IMPORT_MAX_PDF_BYTES
      || (parent !== null && !ReportHashSchema.safeParse(parent).success) || (attachmentId !== null && attachmentId.length > 1024)
      || (role.data === 'prospectus' && (parent !== null || Number(retained) !== 0))) { reject('invalid-request', 400); return }
    if (stopping) { reject('processing-failure', 503); return }
    if (!lock.acquire()) { reject('analysis-active', 409); return }
    const controller = new AbortController()
    const started = performance.now()
    const timeout = setTimeout(() => {
      controller.abort()
      reject('processing-timeout', 504)
      if (!request.complete && !request.destroyed) request.destroy()
    }, options.deadlineMs ?? 60_000)
    let finished!: () => void
    const completion = new Promise<void>(resolve => { finished = resolve })
    pending.add(completion); active.set(request, controller)
    const abort = () => controller.abort(), close = () => { if (!response.writableEnded) abort() }
    request.once('aborted', abort); response.once('close', close)
    let upload: Awaited<ReturnType<typeof receivePdf>> | undefined
    try {
      upload = await receivePdf(request)
      if (controller.signal.aborted) throw new ImportRejection('processing-timeout', 504)
      if (upload.bytes.length + Number(retained) > IMPORT_MAX_PDF_BYTES) throw new ImportRejection('payload-too-large', 413)
      const input = { ...upload, ...correlation.data, role: role.data, parentHash: parent, attachmentId }
      upload.bytes = Buffer.alloc(0); upload = undefined
      const outcome = await runImport(input, controller.signal, markers, { ...options, deadlineMs: Math.max(1, (options.deadlineMs ?? 60_000) - (performance.now() - started)) })
      if (!controller.signal.aborted && !response.destroyed && !response.writableEnded) response.json(ImportHttpResponseSchema.parse({ kind: 'document-import', correlation: correlation.data, outcome }))
    } catch (error) {
      if (!response.destroyed && !response.writableEnded) {
        const known = error instanceof HttpRejection || error instanceof ImportRejection
        reject(known ? error.code : 'processing-failure', known ? error.status : 500)
      }
    } finally {
      clearTimeout(timeout)
      if (upload) upload.bytes = Buffer.alloc(0)
      request.off('aborted', abort); response.off('close', close)
      if (!request.complete && !request.destroyed) await new Promise<void>(resolve => request.once('close', resolve))
      active.delete(request); pending.delete(completion); lock.release(); finished()
    }
  })
  return Object.assign(router, { async stop() { stopping = true; for (const [request, controller] of active) { controller.abort(); request.destroy() }; await Promise.allSettled([...pending]) } })
}
