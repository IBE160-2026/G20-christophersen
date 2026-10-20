import { z } from 'zod'
import { AnalysisOutcomeSchema } from './document-analysis.ts'

const CorrelationId = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/)
/** Transport correlation only. Report hash and mode always come from backend code. */
export const AnalysisHttpCorrelationSchema = z.strictObject({
  sessionId: CorrelationId,
  requestId: CorrelationId,
  generation: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
})
export type AnalysisHttpCorrelation = z.infer<typeof AnalysisHttpCorrelationSchema>
export const AnalysisHttpRejectionCodeSchema = z.enum([
  'invalid-request', 'unsupported-media-type', 'payload-too-large',
  'analysis-active', 'duplicate-analysis', 'processing-failure', 'processing-timeout',
])
export type AnalysisHttpRejectionCode = z.infer<typeof AnalysisHttpRejectionCodeSchema>
/** A rejection has no invented report identity or competing analysis terminal schema. */
export const AnalysisHttpResponseSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('analysis'), correlation: AnalysisHttpCorrelationSchema, outcome: AnalysisOutcomeSchema }),
  z.strictObject({ kind: z.literal('rejected'), code: AnalysisHttpRejectionCodeSchema }),
]).refine(response => response.kind !== 'analysis' || response.correlation.requestId === response.outcome.requestId,
  { message: 'HTTP-korrelasjonen må ha samme requestId som analyseutfallet.' })
export type AnalysisHttpResponse = z.infer<typeof AnalysisHttpResponseSchema>
