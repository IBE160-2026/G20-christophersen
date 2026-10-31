import { z } from 'zod'
import { PdfSourceSchema } from './pdf-source.ts'

export const RiskFindingSchema = z.strictObject({
  id: z.string().min(1).max(200), domain: z.enum(['legal', 'technical']),
  title: z.string().min(1).max(300), description: z.string().min(1).max(2000),
  status: z.enum(['documented', 'possible', 'not-investigated']),
  category: z.enum(['rental-approval', 'use-approval', 'easement', 'rental-restriction', 'technical']),
  consequence: z.string().min(1).max(2000), action: z.string().min(1).max(2000),
  grade: z.enum(['TG2', 'TG3']).nullable(), sources: z.array(PdfSourceSchema).min(1).max(12),
  sourceQuality: z.enum(['readable-text', 'partial-text']).optional(),
})
export const RiskAnalysisSchema = z.strictObject({
  method: z.literal('local-rules-1'), coverage: z.enum(['partial', 'unavailable']),
  examinedPages: z.array(z.number().int().min(1).max(200)).max(200),
  unreadPages: z.array(z.number().int().min(1).max(200)).max(200),
  findings: z.array(RiskFindingSchema).max(200), limitations: z.array(z.string().min(1).max(2000)).max(100),
})
export const PropertyRiskSchema = z.strictObject({ legal: RiskAnalysisSchema, technical: RiskAnalysisSchema })

export type RiskFinding = z.infer<typeof RiskFindingSchema>
export type RiskAnalysis = z.infer<typeof RiskAnalysisSchema>
export type PropertyRisk = z.infer<typeof PropertyRiskSchema>
