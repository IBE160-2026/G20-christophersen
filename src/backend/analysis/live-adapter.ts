import { Worker } from 'node:worker_threads'
import type { AdapterOutcome } from '../../contracts/document-analysis.ts'
import { DocumentBasisSchema } from '../../contracts/document-analysis.ts'
import { getDocumentBasisError } from '../../contracts/analysis-validation.ts'
import { AnalysisAdapterError } from './adapter.ts'
import type { AnalysisAdapter } from './adapter.ts'
import type { AnalysisBackend } from './backend-config.ts'
import { LIVE_ANALYSIS_SETTINGS } from './backend-config.ts'
import { createLiveRequest } from './live-request.ts'

type LiveBackend = Extract<AnalysisBackend, { mode: 'live' }>
const safeError = (code: 'timeout' | 'interrupted' | 'transport-failure' | 'invalid-response' | 'adapter-failure') =>
  new AnalysisAdapterError(code, {
    timeout: 'Live-analysen overskred fristen på 120 sekunder.',
    interrupted: 'Live-analysen ble avbrutt.',
    'transport-failure': 'Live-leverandøren kunne ikke fullføre forespørselen. Kontroller tilkobling og kapasitet.',
    'invalid-response': 'Live-leverandøren returnerte ikke et gyldig fullført uttrekk.',
    'adapter-failure': 'Live-analysen kunne ikke behandle dokumentgrunnlaget.',
  }[code])

/** One request, one absolute deadline. Factory-bound abort belongs to the caller. */
export function createLiveAdapter(backend: LiveBackend, options: { signal?: AbortSignal } = {}): AnalysisAdapter {
  return { mode: 'live', async analyze(input) {
    const document = DocumentBasisSchema.parse(input)
    if (document.mode !== 'live' || getDocumentBasisError(document)) throw safeError('adapter-failure')
    if (options.signal?.aborted) throw safeError('interrupted')
    const request = createLiveRequest(document)
    const deadline = performance.now() + LIVE_ANALYSIS_SETTINGS.timeout
    const controller = new AbortController()
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
    let worker: Worker | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    let stopReject!: (error: AnalysisAdapterError) => void
    const stopped = new Promise<never>((_resolve, reject) => { stopReject = reject })
    const check = () => {
      if (performance.now() >= deadline) throw safeError('timeout')
      if (controller.signal.aborted || options.signal?.aborted) throw safeError('interrupted')
    }
    const stop = () => {
      controller.abort()
      // The losing I/O promises are observed by Promise.race. Actual resources are
      // cancelled here; worker termination is awaited in finally.
      if (reader) void reader.cancel().catch(() => {})
      stopReject(safeError(performance.now() >= deadline ? 'timeout' : 'interrupted'))
    }
    options.signal?.addEventListener('abort', stop, { once: true })
    const expire = () => {
      const remaining = deadline - performance.now()
      if (remaining > 0) timer = setTimeout(expire, remaining)
      else stop()
    }
    timer = setTimeout(expire, Math.max(0, deadline - performance.now()))
    let cleanupFailed = false
    let result: AdapterOutcome | undefined
    let failure: AnalysisAdapterError | undefined
    try {
      check()
      const transport = backend.responses.create(request, { signal: controller.signal }).asResponse()
      void transport.then(response => {
        if (controller.signal.aborted) void response.body?.cancel().catch(() => {})
      }, () => {})
      const response = await Promise.race([transport, stopped])
      check()
      if (!response.body) throw safeError('invalid-response')
      reader = response.body.getReader()
      const chunks: Uint8Array[] = []
      while (true) {
        const chunk = await Promise.race([reader.read(), stopped])
        check()
        if (chunk.done) break
        chunks.push(chunk.value)
      }
      worker = new Worker(new URL('./live-response-worker.ts', import.meta.url), { workerData: { document, chunks } })
      const parsed = new Promise<AdapterOutcome>((resolve, reject) => {
        worker!.once('message', (reply: { kind?: string; outcome: AdapterOutcome }) => {
          if (reply.kind === 'validated') resolve(reply.outcome)
          else reject(safeError('invalid-response'))
        })
        worker!.once('error', () => reject(safeError('invalid-response')))
        worker!.once('messageerror', () => reject(safeError('invalid-response')))
        worker!.once('exit', () => reject(safeError('invalid-response')))
      })
      const outcome = await Promise.race([parsed, stopped])
      check()
      result = outcome
    } catch (error) {
      failure = error instanceof AnalysisAdapterError ? error : safeError('transport-failure')
    } finally {
      if (timer) clearTimeout(timer)
      options.signal?.removeEventListener('abort', stop)
      controller.abort()
      if (reader) {
        try {
          void reader.cancel().catch(() => {})
          reader.releaseLock()
        } catch { cleanupFailed = true }
      }
      if (worker) {
        try { await worker.terminate() } catch { cleanupFailed = true }
        worker.removeAllListeners()
      }
    }
    // Cleanup is part of the same absolute deadline.
    if (performance.now() >= deadline) throw safeError('timeout')
    if (options.signal?.aborted) throw safeError('interrupted')
    if (cleanupFailed) throw safeError('adapter-failure')
    if (failure) throw failure
    if (!result) throw safeError('adapter-failure')
    return result
  } }
}
