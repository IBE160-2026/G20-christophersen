import { describe, expect, it } from 'vitest'
import { AnalysisStartupSchema, AnalysisHttpResponseSchema } from '../../src/contracts/analysis-http.ts'
import { createFailedAnalysis } from '../../src/contracts/analysis-validation.ts'

describe('HTTP-konvoluttens doble request-identitet', () => {
  it('godtar samsvar og avviser et ellers gyldig utfall fra en annen request', () => {
    const outcome = createFailedAnalysis({ contractVersion: '2', extractionVersion: '1', requestId: 'request-1',
      reportHash: 'a'.repeat(64), documentName: 'rapport.pdf', mode: 'demo', pageCount: null },
    { kind: 'document', code: 'invalid-format', target: { kind: 'document' }, reason: null })
    const envelope = { kind: 'analysis', correlation: { sessionId: 'session', requestId: 'request-1', generation: 0 }, outcome }
    expect(AnalysisHttpResponseSchema.safeParse(envelope).success).toBe(true)
    expect(AnalysisHttpResponseSchema.safeParse({ ...envelope, correlation: { ...envelope.correlation, requestId: 'request-2' } }).success).toBe(false)
    expect(AnalysisHttpResponseSchema.safeParse({ ...envelope, outcome: { ...outcome, requestId: 'request-2' } }).success).toBe(false)
  })
})

it('4.3: startup metadata accepts only explicit safe mode, never settings or secrets', () => {
  for (const mode of ['demo', 'live']) expect(AnalysisStartupSchema.parse({ mode })).toEqual({ mode })
  for (const invalid of [{}, { mode: 'unknown' }, { mode: 'live', apiKey: 'fictional' }, { mode: 'live', settings: {} }]) {
    expect(AnalysisStartupSchema.safeParse(invalid).success).toBe(false)
  }
})
