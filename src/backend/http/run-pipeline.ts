import { fork } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { AnalysisContextSchema } from '../../contracts/document-analysis.ts'
import type { AnalysisContext, AnalysisOutcome } from '../../contracts/document-analysis.ts'
import { createFailedAnalysis, validateAnalysisOutcome } from '../../contracts/analysis-validation.ts'
import { HttpRejection } from './receive-pdf.ts'

export const LOCAL_PROCESSING_DEADLINE_MS = 60_000
export type LifecycleEvent = { kind: 'process-started' | 'process-closed' | 'adapter-permitted'; pid: number | undefined }
export type PipelineOptions = {
  /** Trusted local modules only; no request/environment field selects executable code. */
  adapterModule?: string
  documentModule?: string
  onLifecycle?: (event: LifecycleEvent) => void
}
export type PipelineInput = { bytes: Buffer; documentName: string; requestId: string; sessionId: string }

/** Parent owns the deadline and process. A blocked child cannot block enforcement. */
export async function runPipeline(input: PipelineInput, signal: AbortSignal, markers: Set<string>, options: PipelineOptions): Promise<AnalysisOutcome> {
  if (signal.aborted) {
    input.bytes = Buffer.alloc(0)
    throw new HttpRejection('processing-failure', 499)
  }
  const startedAt = performance.now()
  let child: ReturnType<typeof fork>
  try {
    child = fork(fileURLToPath(new URL('./pipeline-child.ts', import.meta.url)), [], {
      execArgv: [], env: {}, serialization: 'advanced', stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
    })
  } catch {
    input.bytes = Buffer.alloc(0)
    throw new HttpRejection('processing-failure', 500)
  }
  const notify = (kind: LifecycleEvent['kind']) => { try { options.onLifecycle?.({ kind, pid: child.pid }) } catch { /* Diagnostics never control cleanup. */ } }
  notify('process-started')
  let context: AnalysisContext | undefined
  let settled = false
  let timeout: ReturnType<typeof setTimeout> | undefined
  const closed = new Promise<void>(resolve => child.once('close', () => { notify('process-closed'); resolve() }))
  let onMessage: (message: unknown) => void = () => undefined
  let onError: () => void = () => undefined
  let onAbort: () => void = () => undefined
  try {
    return await new Promise<AnalysisOutcome>((resolve, reject) => {
      const fail = (error: HttpRejection) => { if (!settled) { settled = true; reject(error) } }
      const finish = (value: AnalysisOutcome) => { if (!settled) { settled = true; resolve(value) } }
      const expire = () => {
        if (context) finish(createFailedAnalysis(context, { kind: 'analysis', code: 'timeout',
          target: { kind: 'document' }, reason: 'Den lokale dokumentbehandlingen overskred tidsfristen.' }))
        else fail(new HttpRejection('processing-timeout', 504))
      }
      onError = () => {
        if (performance.now() - startedAt >= LOCAL_PROCESSING_DEADLINE_MS) { expire(); return }
        if (context) finish(createFailedAnalysis(context, { kind: 'analysis', code: 'adapter-failure',
          target: { kind: 'document' }, reason: 'Den lokale dokumentbehandlingen kunne ikke fullføres.' }))
        else fail(new HttpRejection('processing-failure', 500))
      }
      onAbort = () => fail(new HttpRejection('processing-failure', 499))
      onMessage = (message: unknown) => {
        if (settled) return
        // IPC may be delivered after the absolute deadline but before the timer callback.
        if (performance.now() - startedAt >= LOCAL_PROCESSING_DEADLINE_MS) { expire(); return }
        if (typeof message !== 'object' || message === null || !('kind' in message)) { onError(); return }
        if ((message.kind === 'context' || message.kind === 'adapter-ready') && 'context' in message) {
          const parsed = AnalysisContextSchema.safeParse(message.context)
          if (!parsed.success || parsed.data.requestId !== input.requestId || parsed.data.documentName !== input.documentName
            || parsed.data.mode !== 'demo' || (context && parsed.data.reportHash !== context.reportHash)) { onError(); return }
          context = parsed.data
          if (message.kind === 'adapter-ready') {
            const key = JSON.stringify([input.sessionId, context.mode, context.reportHash])
            if (markers.has(key)) { fail(new HttpRejection('duplicate-analysis', 409)); return }
            // Synchronous and durable until server stop, before granting the adapter permission.
            markers.add(key)
            notify('adapter-permitted')
            child.send({ kind: 'permit-adapter' }, error => { if (error) onError() })
          }
        } else if (message.kind === 'outcome' && 'outcome' in message && context) {
          const parsed = validateAnalysisOutcome(message.outcome, context)
          if (parsed.success) finish(parsed.data)
          else finish(createFailedAnalysis(context, { kind: 'analysis', code: 'invalid-response',
            target: { kind: 'document' }, reason: 'Den lokale behandlingen returnerte et ugyldig analyseutfall.' }))
        } else onError()
      }
      child.on('message', onMessage)
      child.once('error', onError)
      child.once('exit', onError)
      signal.addEventListener('abort', onAbort, { once: true })
      timeout = setTimeout(expire, Math.max(0, LOCAL_PROCESSING_DEADLINE_MS - (performance.now() - startedAt)))
      child.send({ kind: 'start', bytes: input.bytes, requestId: input.requestId, documentName: input.documentName,
        adapterModule: options.adapterModule, documentModule: options.documentModule }, error => {
        input.bytes = Buffer.alloc(0)
        if (error) onError()
      })
      if (signal.aborted) onAbort()
    })
  } finally {
    // Await real OS process closure before caller can release its active-flow lock.
    if (timeout) clearTimeout(timeout)
    signal.removeEventListener('abort', onAbort)
    child.off('message', onMessage)
    child.off('error', onError)
    child.off('exit', onError)
    // Keep an error handler during termination, including a failed kill/IPC send.
    child.on('error', () => undefined)
    try { if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL') } finally {
      input.bytes = Buffer.alloc(0)
      await closed
      child.removeAllListeners()
      context = undefined
    }
  }
}
