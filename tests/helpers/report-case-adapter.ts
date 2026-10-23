import type { AnalysisAdapter } from '../../src/backend/analysis/adapter.ts'
import { createDemoAdapter } from '../../src/backend/analysis/demo-adapter.ts'

/** Controlled identical extraction for comparing actual code outcomes in both modes. */
export function createAdapter(mode: 'demo' | 'live'): AnalysisAdapter {
  const stored = createDemoAdapter()
  return { mode, analyze: document => stored.analyze(document) }
}
