import { useEffect, useMemo, useRef, useState } from 'react'
import { calculateFinancialScenario } from '../../domain/financial-scenario.ts'
import type { FinancialScenario, ScenarioBasis, ScenarioControls } from '../../domain/financial-scenario.ts'
import type { ScenarioWorkerRequest, ScenarioWorkerResponse } from './scenario-worker.ts'

interface State { key: string; scenario: FinancialScenario | null; pending: boolean; error: string | null }

/** Main-thread work stops before annuity exponentiation. Every result is input-bound. */
export function useFinancialScenario(basis: ScenarioBasis, controls: ScenarioControls): { scenario: FinancialScenario; pending: boolean } {
  const key = JSON.stringify({ basis, controls })
  const payload = useMemo(() => JSON.parse(key) as { basis: ScenarioBasis; controls: ScenarioControls }, [key])
  const cache = useRef(new Map<string, FinancialScenario>())
  const [state, setState] = useState<State>({ key: '', scenario: null, pending: true, error: null })
  const placeholder = useMemo(() => {
    // Blank equity exits financingSuggestion before any power calculation.
    // Independent yield/NOI remain available while CF and all debt curves clear.
    const result = calculateFinancialScenario(payload.basis, { ...payload.controls, equity: '' })
    return { ...result, controls: { ...payload.controls }, issues: [...payload.basis.issues] }
    // The key captures the entire basis and controls, including provenance.
  }, [payload])
  useEffect(() => {
    const saved = cache.current.get(key)
    if (saved) { setState({ key, scenario: saved, pending: false, error: null }); return }
    let active = true
    let worker: Worker | null = null
    let deadline: ReturnType<typeof setTimeout> | null = null
    const clearDeadline = () => { if (deadline !== null) clearTimeout(deadline) }
    setState({ key, scenario: null, pending: true, error: null })
    try {
      worker = new Worker(new URL('./scenario-worker.ts', import.meta.url), { type: 'module' })
      worker.onmessage = (event: MessageEvent<ScenarioWorkerResponse>) => {
        if (!active || event.data.requestId !== key) return
        clearDeadline()
        if (event.data.kind === 'error') setState({ key, scenario: null, pending: false, error: event.data.error })
        else if (event.data.kind === 'base') {
          if (cache.current.size >= 4) cache.current.delete(cache.current.keys().next().value!)
          cache.current.set(key, event.data.scenario)
          setState({ key, scenario: event.data.scenario, pending: false, error: null })
        }
        worker?.terminate()
      }
      worker.onerror = () => { clearDeadline(); if (active) setState({ key, scenario: null, pending: false, error: 'Scenarioet kunne ikke beregnes lokalt.' }); worker?.terminate() }
      const request: ScenarioWorkerRequest = { kind: 'base', requestId: key, ...payload }
      worker.postMessage(request)
      deadline = setTimeout(() => {
        if (!active) return
        active = false; worker?.terminate()
        setState({ key, scenario: null, pending: false, error: 'Lokal scenarioberegning overskred 15 sekunder og er stoppet. Prøv en kortere nedbetalingstid.' })
      }, 15000)
    } catch {
      clearDeadline(); worker?.terminate()
      setState({ key, scenario: null, pending: false, error: 'Nettleseren kunne ikke starte lokal scenarioberegning.' })
    }
    return () => { active = false; clearDeadline(); worker?.terminate() }
    // The key captures every input; navigation alone does not change the worker.
  }, [key, payload])
  if (state.key !== key || state.pending) return { scenario: placeholder, pending: true }
  if (state.error) return { scenario: { ...placeholder, issues: [...placeholder.issues, state.error] }, pending: false }
  return { scenario: state.scenario ?? placeholder, pending: false }
}
