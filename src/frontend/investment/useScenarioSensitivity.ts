import { useEffect, useMemo, useRef, useState } from 'react'
import type { FinancialScenario, ScenarioSensitivity } from '../../domain/financial-scenario.ts'
import type { ScenarioWorkerRequest, ScenarioWorkerResponse } from './scenario-worker.ts'

type State = { key: string; status: 'idle' | 'loading' | 'ready' | 'failed'; points: ScenarioSensitivity[]; error: string | null }
/** New inputs terminate the previous worker; late messages can never label new inputs. */
export function useScenarioSensitivity(scenario: FinancialScenario, enabled: boolean) {
  const cache = useRef(new Map<string, ScenarioSensitivity[]>())
  const key = JSON.stringify({ basis: scenario.basis, controls: scenario.controls })
  const payload = useMemo(() => JSON.parse(key) as Pick<ScenarioWorkerRequest, 'basis' | 'controls'>, [key])
  const [state, setState] = useState<State>({ key: '', status: 'idle', points: [], error: null })
  useEffect(() => {
    if (!enabled) return
    const saved = cache.current.get(key)
    if (saved) { setState({ key, status: 'ready', points: saved, error: null }); return }
    let active = true
    let worker: Worker | null = null
    let deadline: ReturnType<typeof setTimeout> | null = null
    const clearDeadline = () => { if (deadline !== null) clearTimeout(deadline) }
    setState({ key, status: 'loading', points: [], error: null })
    try {
      worker = new Worker(new URL('./scenario-worker.ts', import.meta.url), { type: 'module' })
      worker.onmessage = (event: MessageEvent<ScenarioWorkerResponse>) => {
        if (!active || event.data.requestId !== key) return
        clearDeadline()
        if (event.data.kind === 'error') setState({ key, status: 'failed', points: [], error: event.data.error })
        else if (event.data.kind === 'sensitivity') {
          if (cache.current.size >= 4) cache.current.delete(cache.current.keys().next().value!)
          cache.current.set(key, event.data.points)
          setState({ key, status: 'ready', points: event.data.points, error: null })
        }
        worker?.terminate()
      }
      worker.onerror = () => { clearDeadline(); if (active) setState({ key, status: 'failed', points: [], error: 'Rentefølsomheten kunne ikke beregnes lokalt.' }); worker?.terminate() }
      const request: ScenarioWorkerRequest = { kind: 'sensitivity', requestId: key, ...payload }
      worker.postMessage(request)
      deadline = setTimeout(() => {
        if (!active) return
        active = false; worker?.terminate()
        setState({ key, status: 'failed', points: [], error: 'Rentefølsomheten overskred 30 sekunder og er stoppet. Prøv en kortere nedbetalingstid for grafen.' })
      }, 30000)
    } catch {
      clearDeadline(); worker?.terminate()
      setState({ key, status: 'failed', points: [], error: 'Nettleseren kunne ikke starte lokal renteberegning.' })
    }
    return () => { active = false; clearDeadline(); worker?.terminate() }
  }, [enabled, key, payload])
  if (!enabled) return { status: 'idle' as const, points: [], error: null }
  if (state.key !== key || state.status === 'idle') return { status: 'loading' as const, points: [], error: null }
  return state
}
