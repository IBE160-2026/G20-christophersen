import type { ReportAction, ReportState } from '../state/report.ts'

interface ClientDependencies {
  fetch: typeof fetch
  hash: (bytes: Uint8Array<ArrayBuffer>) => Promise<string>
  id: () => string
}
const defaults: ClientDependencies = {
  fetch: (...args) => fetch(...args),
  hash: async bytes => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), byte => byte.toString(16).padStart(2, '0')).join(''),
  id: () => crypto.randomUUID(),
}
/** Effekter eier ingen vurdering; reduceren etterprøver også alle sene utfall. */
export class ReportClient {
  private controller: AbortController | null = null
  private generation = 0
  private running = false
  private readonly sessionId: string
  private readonly dispatch: (action: ReportAction) => void
  private readonly dependencies: ClientDependencies
  constructor(dispatch: (action: ReportAction) => void, dependencies: ClientDependencies = defaults) {
    this.dispatch = dispatch
    this.dependencies = dependencies
    this.sessionId = dependencies.id()
  }
  async select(file: File | null, state: ReportState) {
    this.abort()
    const generation = this.generation = Math.max(this.generation, state.generation) + 1
    this.dispatch({ type: 'report-selecting', generation })
    if (!file) { this.dispatch({ type: 'report-error', generation, code: 'missing-report' }); return }
    try {
      const bytes = new Uint8Array(await file.arrayBuffer())
      const hash = await this.dependencies.hash(bytes)
      if (generation !== this.generation) return
      this.dispatch({ type: 'report-selected', generation, selected: { file, bytes, hash } })
    } catch { this.dispatch({ type: 'report-error', generation, code: 'file-read-failure' }) }
  }
  async start(financialConfirmed: boolean, state: ReportState) {
    if (this.running || !financialConfirmed || !state.selected || !['ready', 'failed'].includes(state.status)) return
    this.running = true
    const controller = this.controller = new AbortController()
    const correlation = { sessionId: this.sessionId, requestId: this.dependencies.id(), generation: state.generation }
    this.dispatch({ type: 'report-start', correlation })
    const body = new FormData()
    body.append('file', state.selected.file)
    try {
      const response = await this.dependencies.fetch('/api/analysis', { method: 'POST', body, signal: controller.signal,
        headers: { 'X-Session-Id': correlation.sessionId, 'X-Request-Id': correlation.requestId, 'X-Analysis-Generation': String(correlation.generation) } })
      let result: unknown
      try { result = await response.json() } catch { result = null }
      this.dispatch({ type: 'report-response', correlation, body: result, ok: response.ok })
    } catch {
      this.dispatch({ type: 'report-error', generation: correlation.generation, code: controller.signal.aborted ? 'interrupted' : 'transport-failure' })
    } finally {
      if (this.controller === controller) { this.controller = null; this.running = false }
    }
  }
  abort() {
    this.controller?.abort()
    this.controller = null
    this.running = false
  }
}
