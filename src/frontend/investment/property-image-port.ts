import { PREVIEW_BUDGET_ERROR } from './property-image-policy.ts'

type Envelope = { sourceName: string; targetName: string; callbackId?: number; streamId?: number;
  action?: string; callback?: number; stream?: number; success?: boolean }
type Stream = { request: Envelope; started: boolean }
/** Structural boundary also testable in Node without libDOM/Worker globals. */
export interface PreviewRawWorker {
  postMessage(message: unknown, transfer: readonly unknown[]): void
  addEventListener(type: string, listener: (event: { data?: unknown }) => void): void
  removeEventListener(type: string, listener: (event: { data?: unknown }) => void): void
  terminate(): void
}

/** Owned PDF.js-compatible port. Aborting the real worker also settles pending PDF.js
 * promises/streams, allowing its normal destroy() to clear cached bitmaps and listeners.
 * Protocol numbers are pinned to the installed PDF.js 6.4.299 MessageHandler.
 */
export class PreviewWorkerPort extends EventTarget {
  readonly ready: Promise<void>
  private readyResolve!: () => void
  private readyReject!: (reason: Error) => void
  private callbacks = new Map<string, Envelope>()
  private streams = new Map<string, Stream>()
  private stopped = false
  private readonly worker: PreviewRawWorker
  private readonly onStop: (budgetExceeded: boolean) => void
  constructor(worker: PreviewRawWorker, onStop: (budgetExceeded: boolean) => void) {
    super(); this.worker = worker; this.onStop = onStop
    this.ready = new Promise((resolve, reject) => { this.readyResolve = resolve; this.readyReject = reject })
    // Installed before PDFWorker attaches to this proxy port.
    worker.addEventListener('message', this.receive)
    worker.addEventListener('error', this.error)
    worker.addEventListener('messageerror', this.error)
  }
  private receive = (event: { data?: unknown }) => {
    const value = event.data as Envelope & { type?: string }
    if (value?.type === PREVIEW_BUDGET_ERROR) { this.onStop(true); this.terminate(); return }
    if (this.stopped) return
    const message = value as Envelope
    if (message?.action === 'ready') this.readyResolve()
    if (message?.callbackId && message.callback) this.callbacks.delete(`${message.targetName}:${message.callbackId}`)
    if (message?.streamId) {
      const key = `${message.targetName}:${message.streamId}`
      if (message.stream === 8 && message.success) { const stream = this.streams.get(key); if (stream) stream.started = true }
      if ([2, 3, 5].includes(message.stream ?? 0) || message.stream === 8 && !message.success) this.streams.delete(key)
    }
    this.dispatchEvent(new MessageEvent('message', { data: value }))
  }
  private error = () => { this.onStop(false); this.terminate() }
  postMessage(message: Envelope, transfer?: readonly unknown[]) {
    if (this.stopped) { this.replyAfterStop(message); return }
    if (message.callbackId && message.action) this.callbacks.set(`${message.sourceName}:${message.callbackId}`, message)
    if (message.streamId && message.action) this.streams.set(`${message.sourceName}:${message.streamId}`, { request: message, started: false })
    this.worker.postMessage(message, transfer ?? [])
  }
  private emit(request: Envelope, response: object) {
    this.dispatchEvent(new MessageEvent('message', { data: { sourceName: request.targetName, targetName: request.sourceName, ...response } }))
  }
  private replyAfterStop(message: Envelope) {
    // Asynchronous replies preserve MessageHandler's sendWithPromise bookkeeping.
    queueMicrotask(() => {
      const reason = { name: 'AbortException', message: 'Local PDF preview worker was stopped.' }
      if (message.callbackId) this.emit(message, message.action === 'Terminate'
        ? { callback: 1, callbackId: message.callbackId, data: null }
        : { callback: 2, callbackId: message.callbackId, reason })
      else if (message.streamId && message.stream === 1) this.emit(message, { stream: 2, streamId: message.streamId, success: true })
      else if (message.streamId && message.stream === 6) this.emit(message, { stream: 7, streamId: message.streamId, reason })
      else if (message.streamId && message.action) this.emit(message, { stream: 8, streamId: message.streamId, reason })
    })
  }
  terminate() {
    if (this.stopped) return
    this.stopped = true
    this.worker.removeEventListener('message', this.receive)
    this.worker.removeEventListener('error', this.error)
    this.worker.removeEventListener('messageerror', this.error)
    this.worker.terminate()
    this.readyReject(new Error('Local PDF preview worker was stopped.'))
    const reason = { name: 'AbortException', message: 'Local PDF preview worker was stopped.' }
    for (const request of this.callbacks.values()) this.emit(request, { callback: 2, callbackId: request.callbackId, reason })
    this.callbacks.clear()
    for (const { request, started } of this.streams.values()) this.emit(request,
      { stream: started ? 5 : 8, streamId: request.streamId, reason })
    this.streams.clear()
  }
}
