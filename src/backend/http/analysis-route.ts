import { Router } from 'express'
import type { Request, Response } from 'express'
import { AnalysisStartupSchema, AnalysisHttpCorrelationSchema, AnalysisHttpResponseSchema } from '../../contracts/analysis-http.ts'
import type { AnalysisHttpRejectionCode } from '../../contracts/analysis-http.ts'
import { HttpRejection, receivePdf } from './receive-pdf.ts'
import { runPipeline } from './run-pipeline.ts'
import type { PipelineOptions } from './run-pipeline.ts'

/** Server-instance lifetime equals process lifetime in the loopback server. No report cache. */
export function createAnalysisRouter(options: PipelineOptions = {}) {
  const router = Router()
  const startup = AnalysisStartupSchema.parse({ mode: options.mode ?? 'demo' })
  router.get('/analysis-config', (_request, response) => {
    response.setHeader('Cache-Control', 'no-store')
    response.json(startup)
  })
  const active = new Set<string>()
  const markers = new Set<string>()
  const pending = new Set<Promise<void>>()
  const requests = new Map<Request, AbortController>()
  let stopping = false
  const reject = (response: Response, status: number, code: AnalysisHttpRejectionCode) => {
    if (!response.destroyed && !response.writableEnded) response.status(status).json({ kind: 'rejected', code })
  }
  router.post('/analysis', async (request: Request, response: Response) => {
    const generation = request.get('X-Analysis-Generation')
    const correlation = AnalysisHttpCorrelationSchema.safeParse({
      sessionId: request.get('X-Session-Id'), requestId: request.get('X-Request-Id'),
      generation: generation && /^(0|[1-9]\d*)$/.test(generation) ? Number(generation) : undefined,
    })
    response.setHeader('Cache-Control', 'no-store')
    // Rejections stop receiving rather than keeping an unbounded body in the socket.
    const closeUpload = () => {
      response.setHeader('Connection', 'close')
      // Discard transport bytes without retaining chunks. Connection: close lets Node
      // flush the rejection before gracefully closing the socket; immediate destroy
      // can reset an actively-writing client before it receives the 413.
      request.resume()
    }
    if (stopping) { closeUpload(); reject(response, 503, 'processing-failure'); return }
    if (!correlation.success) { closeUpload(); reject(response, 400, 'invalid-request'); return }
    const { sessionId, requestId } = correlation.data
    if (active.has(sessionId)) { closeUpload(); reject(response, 409, 'analysis-active'); return }
    // Before the first await, including upload and regardless of hash/request/generation.
    active.add(sessionId)
    const controller = new AbortController()
    let finished!: () => void
    const completion = new Promise<void>(resolve => { finished = resolve })
    pending.add(completion)
    requests.set(request, controller)
    const abort = () => controller.abort()
    const close = () => { if (!response.writableEnded) abort() }
    request.once('aborted', abort)
    response.once('close', close)
    let upload: Awaited<ReturnType<typeof receivePdf>> | undefined
    try {
      upload = await receivePdf(request)
      if (controller.signal.aborted) return
      const input = { ...upload, sessionId, requestId }
      upload.bytes = Buffer.alloc(0)
      upload = undefined
      const outcome = await runPipeline(input, controller.signal, markers, options)
      if (controller.signal.aborted || response.destroyed || response.writableEnded) return
      response.json(AnalysisHttpResponseSchema.parse({ kind: 'analysis', correlation: correlation.data, outcome }))
    } catch (error) {
      if (!controller.signal.aborted && !response.destroyed && !response.writableEnded) {
        closeUpload()
        const failure = error instanceof HttpRejection ? error : new HttpRejection('processing-failure', 500)
        reject(response, failure.status, failure.code)
      }
    } finally {
      if (upload) upload.bytes = Buffer.alloc(0)
      upload = undefined
      request.off('aborted', abort)
      response.off('close', close)
      // A rejected upload's transport must also close before the flow is released.
      if (!request.complete && !request.destroyed) await new Promise<void>(resolve => request.once('close', resolve))
      active.delete(sessionId)
      requests.delete(request)
      pending.delete(completion)
      finished()
    }
  })
  return Object.assign(router, {
    async stop() {
      stopping = true
      for (const [request, controller] of requests) {
        controller.abort()
        request.destroy()
      }
      await Promise.allSettled([...pending])
    },
  })
}
