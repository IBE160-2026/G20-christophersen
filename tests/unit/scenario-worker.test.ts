import { afterEach, expect, it, vi } from 'vitest'
import type { ScenarioWorkerRequest, ScenarioWorkerResponse } from '../../src/frontend/investment/scenario-worker.ts'
import type { ScenarioBasis } from '../../src/domain/financial-scenario.ts'
const basis: ScenarioBasis = { P: '1000000', L: '120000', D: '20000', cashRequired: '1000000', sharedAnnualPayment: '0', year: '2026', issues: [],
  provenance: { P: 'Test', L: 'Forutsetning', D: 'Forutsetning', cashRequired: 'Test', sharedAnnualPayment: 'Test' } }
afterEach(() => vi.unstubAllGlobals())
async function worker() {
  vi.resetModules()
  const scope: { onmessage: ((event: { data: ScenarioWorkerRequest }) => void) | null; postMessage: ReturnType<typeof vi.fn> } = { onmessage: null, postMessage: vi.fn() }
  vi.stubGlobal('self', scope)
  await import('../../src/frontend/investment/scenario-worker.ts')
  return scope
}
it('worker svarer med eksakt requestbinding og grunnberegning uten sensitivitet eller bekreftelse', async () => {
  const scope = await worker()
  const request: ScenarioWorkerRequest = { kind: 'base', requestId: 'object-a-input-2', basis, controls: { equity: '1000000', annualInterest: '0', months: '12' } }
  scope.onmessage!({ data: request })
  const response = scope.postMessage.mock.calls[0]![0] as ScenarioWorkerResponse
  expect(response).toMatchObject({ kind: 'base', requestId: 'object-a-input-2', error: null, scenario: { cashFlow: '100000', sensitivity: [] } })
  expect(response).not.toHaveProperty('confirmed'); expect(response).not.toHaveProperty('recommendation')
  expect(request.basis).toEqual(basis)
})
it('sensitivitetsworker inkluderer valgt mellomrente og bevarer bindingen separat', async () => {
  const scope = await worker()
  const request: ScenarioWorkerRequest = { kind: 'sensitivity', requestId: 'object-b-5.7', basis, controls: { equity: '500000', annualInterest: '5.7', months: '12' } }
  scope.onmessage!({ data: request })
  const response = scope.postMessage.mock.calls[0]![0] as ScenarioWorkerResponse
  expect(response).toMatchObject({ kind: 'sensitivity', requestId: 'object-b-5.7', error: null })
  if (response.kind !== 'sensitivity') throw new Error('Expected sensitivity response')
  expect(response.points).toHaveLength(22)
  // Independent Decimal reference: 42 964.30/month × 12; NOI 100 000/year.
  expect(response.points.find(point => point.annualInterest === '5.7')?.cashFlow).toBe('-415571.6')
})
