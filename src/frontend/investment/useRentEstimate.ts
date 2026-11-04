import { useEffect, useState } from 'react'
import type { DocumentImport } from '../../contracts/document-import.ts'
import { RentEstimateSchema } from '../../contracts/rent-estimate.ts'
import type { RentEstimate } from '../../contracts/rent-estimate.ts'

export type RentState = { status: 'idle' | 'loading' | 'ready' | 'failed'; result: RentEstimate | null }
/** Objektidentitet kontrolleres både ved respons og ved hver render, også før effect-cleanup. */
export function useRentEstimate(outcome: DocumentImport | null) {
  const [attempt, setAttempt] = useState(0)
  const [stored, setStored] = useState<{ outcome: DocumentImport; attempt: number; state: RentState } | null>(null)
  useEffect(() => {
    if (!outcome) return
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25_000)
    let current = true
    void (async () => {
      try {
        const response = await fetch('/api/rent-estimate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ outcome }), signal: controller.signal })
        if (!response.ok) throw new Error('Leieoppslag feilet')
        const parsed = RentEstimateSchema.safeParse(await response.json())
        if (!parsed.success || parsed.data.documentHash !== outcome.reportHash || parsed.data.property.documentHash !== outcome.reportHash
          || parsed.data.property.documentName !== outcome.documentName) throw new Error('Feil objektgrunnlag')
        if (current) setStored({ outcome, attempt, state: { status: 'ready', result: parsed.data } })
      } catch { if (current) setStored({ outcome, attempt, state: { status: 'failed', result: null } }) }
      finally { clearTimeout(timeout) }
    })()
    return () => { current = false; clearTimeout(timeout); controller.abort() }
  }, [outcome, attempt])
  const state: RentState = !outcome ? { status: 'idle', result: null }
    : stored?.outcome === outcome && stored.attempt === attempt ? stored.state : { status: 'loading', result: null }
  return { ...state, retry: () => setAttempt(value => value + 1) }
}
