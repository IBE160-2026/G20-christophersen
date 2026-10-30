import { calculateFinancialScenario } from '../../domain/financial-scenario.ts'
import type { FinancialScenario, ScenarioBasis, ScenarioControls, ScenarioSensitivity } from '../../domain/financial-scenario.ts'

export interface ScenarioWorkerRequest { requestId: string; basis: ScenarioBasis; controls: ScenarioControls; kind: 'base' | 'sensitivity' }
export type ScenarioWorkerResponse = { kind: 'base'; requestId: string; scenario: FinancialScenario; error: null }
  | { kind: 'sensitivity'; requestId: string; points: ScenarioSensitivity[]; error: null }
  | { kind: 'error'; requestId: string; error: string }
// Deliberately local computation only. No HTTP client, session reducer or confirmation.
const scope = ((globalThis as unknown as { self?: unknown }).self ?? globalThis) as {
  onmessage: ((event: { data: ScenarioWorkerRequest }) => void) | null
  postMessage: (message: ScenarioWorkerResponse) => void
}
scope.onmessage = event => {
  const request = event.data
  try {
    const result = calculateFinancialScenario(request.basis, request.controls, { includeSensitivity: request.kind === 'sensitivity' })
    if (request.kind === 'sensitivity') scope.postMessage({ kind: 'sensitivity', requestId: request.requestId, points: result.sensitivity, error: null })
    else scope.postMessage({ kind: 'base', requestId: request.requestId, scenario: result, error: null })
  } catch {
    scope.postMessage({ kind: 'error', requestId: request.requestId, error: 'Scenarioet kunne ikke beregnes lokalt.' })
  }
}
