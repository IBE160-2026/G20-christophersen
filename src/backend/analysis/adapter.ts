import type { AdapterOutcome, AnalysisContext, AnalysisError, DocumentBasis } from '../../contracts/document-analysis.ts'

/** AD-6: samme komplette, versjonerte input og terminalkontrakt for demo/live. */
export type AnalysisAdapter = {
  readonly mode: AnalysisContext['mode']
  analyze(document: DocumentBasis): Promise<AdapterOutcome>
}

/** Bare kodeeide meldinger kan krysse adapterens grense for driftsfeil. */
export class AnalysisAdapterError extends Error {
  readonly analysisError: Extract<AnalysisError, { kind: 'analysis' }>

  constructor(code: Extract<AnalysisError, { kind: 'analysis' }>['code'], reason: string) {
    super(reason)
    this.analysisError = { kind: 'analysis', code, target: { kind: 'document' }, reason }
  }
}
