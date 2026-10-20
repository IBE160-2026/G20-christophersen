import type { AnalysisAdapter } from '../../src/backend/analysis/adapter.ts'
export const createAdapter = (): AnalysisAdapter => ({ mode: 'demo', async analyze() {
  await new Promise(resolve => setTimeout(resolve, 35_000))
  return { contractVersion: '2', extractionVersion: '1', status: 'completed', findings: [], limitations: [] }
} })
