import type { AnalysisAdapter } from '../../src/backend/analysis/adapter.ts'
export const createAdapter = (): AnalysisAdapter => ({ mode: 'demo', async analyze() { throw new Error('PRIVATE PDF CONTENT') } })
