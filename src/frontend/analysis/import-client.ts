import type { Dispatch } from 'react'
import { IMPORT_MAX_PDF_BYTES, currentImportContext } from '../../contracts/document-import.ts'
import type { ImportRole } from '../../contracts/document-import.ts'
import type { SessionAction } from '../state/session.ts'
import type { ProspectusState } from '../state/prospectus.ts'

interface Dependencies { fetch: typeof fetch; hash: (bytes: Uint8Array<ArrayBuffer>) => Promise<string>; id: () => string }
const defaults: Dependencies = { fetch: (...args) => fetch(...args), id: () => crypto.randomUUID(),
  hash: async bytes => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), byte => byte.toString(16).padStart(2, '0')).join('') }
export class ImportClient {
  private controller: AbortController | null = null
  private ticket = 0
  private readonly sessionId: string
  private readonly dispatch: Dispatch<SessionAction>
  private readonly dependencies: Dependencies
  constructor(dispatch: Dispatch<SessionAction>, dependencies: Dependencies = defaults) { this.dispatch = dispatch; this.dependencies = dependencies; this.sessionId = dependencies.id() }
  async select(file: File | null, state: ProspectusState, role: ImportRole) {
    this.abort()
    const ticket = ++this.ticket, generation = Math.max(state.generation + 1, ticket)
    this.dispatch({ type: 'import-selecting', generation, role })
    const fail = (code: string) => this.dispatch({ type: 'import-error', role, generation, code })
    if (!file) { fail('missing-file'); return }
    const retained = role === 'report' ? state.prospectus.selected?.file.size ?? 0 : 0
    if (file.size > IMPORT_MAX_PDF_BYTES || file.size + retained > IMPORT_MAX_PDF_BYTES) { fail('payload-too-large'); return }
    try {
      const bytes = new Uint8Array(await file.arrayBuffer()), hash = await this.dependencies.hash(bytes)
      if (this.ticket !== ticket) return
      this.dispatch({ type: 'import-selected', role, generation, selected: { file, bytes, hash } })
      const original = state[role].outcome
      if (hash === state[role].selected?.hash && currentImportContext(original, role)) return
      if (hash === state[role].selected?.hash && original) { fail('incompatible-context'); return }
      const controller = this.controller = new AbortController()
      const correlation = { sessionId: this.sessionId, requestId: this.dependencies.id(), generation }
      this.dispatch({ type: 'import-start', role, correlation })
      const body = new FormData(); body.append('file', file)
      const headers: Record<string, string> = { 'X-Session-Id': correlation.sessionId, 'X-Request-Id': correlation.requestId, 'X-Analysis-Generation': String(generation), 'X-Document-Role': role, 'X-Import-Mode': 'demo', 'X-Retained-Bytes': String(retained) }
      if (role === 'report' && state.prospectus.selected) headers['X-Parent-Hash'] = state.prospectus.selected.hash
      const response = await this.dependencies.fetch('/api/document-import', { method: 'POST', body, headers, signal: controller.signal })
      if (this.ticket !== ticket) return
      let result: unknown
      try { result = await response.json() } catch { result = null }
      this.dispatch({ type: 'import-response', role, correlation, body: result, ok: response.ok })
      if (this.controller === controller) this.controller = null
    } catch { if (this.ticket === ticket) fail(this.controller?.signal.aborted ? 'interrupted' : 'transport-failure') }
  }
  abort() { this.controller?.abort(); this.controller = null; this.ticket++ }
}
