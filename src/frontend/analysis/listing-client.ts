import type { Dispatch } from 'react'
import type { SessionAction } from '../state/session.ts'
import type { ListingState } from '../state/listing.ts'
/** Generasjonsvern eies av reduceren; abort er bare ressurskontroll. */
export class ListingClient {
  private controller: AbortController | null = null
  private dispatch: Dispatch<SessionAction>
  private transport: typeof fetch
  constructor(dispatch: Dispatch<SessionAction>, transport: typeof fetch = fetch) { this.dispatch = dispatch; this.transport = transport }
  abort() { this.controller?.abort(); this.controller = null }
  async import(state: ListingState) {
    this.abort()
    const controller = new AbortController()
    this.controller = controller
    const correlation = { generation: state.generation, requestId: crypto.randomUUID() }
    this.dispatch({ type: 'listing-start', correlation })
    const timer = setTimeout(() => controller.abort(), 125_000)
    try {
      const transport = this.transport
      const response = await transport('/api/listing', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: state.url, correlation }), signal: controller.signal })
      const text = await response.text()
      if (text.length > 120_000) throw new Error('Respons for stor')
      const body: unknown = JSON.parse(text)
      this.dispatch({ type: 'listing-response', correlation, body, ok: response.ok })
    } catch { this.dispatch({ type: 'listing-error', correlation }) }
    finally { clearTimeout(timer); if (this.controller === controller) this.controller = null }
  }
}
