import { z } from 'zod'
import { FinancialBasisSchema } from './financial-basis.ts'
import { FinancialIssueSchema } from './financial-validation.ts'

// Bare allerede kjente mangler. Ingen påstand om dokument-/analysefullføring.
export const KnownReportDeficiencySchema = z.strictObject({
  code: z.enum(['missing-report', 'incomplete-report']),
  reason: z.string().trim().min(1),
})

// Utelatt delgrunnlag er ikke vurdert. Et mottatt finansgrunnlag valideres i sin helhet.
export const KnownDeficiencyInputSchema = z.strictObject({
  financialBasis: FinancialBasisSchema.optional(),
  reportDeficiencies: z.array(KnownReportDeficiencySchema).default([]),
})

export const CriticalDeficiencySchema = z.discriminatedUnion('kind', [
  FinancialIssueSchema.extend({ kind: z.literal('financial') }),
  KnownReportDeficiencySchema.extend({
    kind: z.literal('report'),
    target: z.literal('report'),
    message: z.string(),
    action: z.string(),
  }),
])

export const KnownDeficiencyAssessmentSchema = z.discriminatedUnion('status', [
  z.strictObject({
    scope: z.literal('known-deficiencies'),
    status: z.literal('information-required'),
    recommendation: z.literal('Innhent mer informasjon'),
    priority: z.literal(1),
    triggers: z.array(CriticalDeficiencySchema).min(1),
    explanation: z.string(),
    nextAction: z.string(),
  }),
  z.strictObject({
    scope: z.literal('known-deficiencies'),
    status: z.literal('no-known-deficiencies'),
    recommendation: z.null(),
    priority: z.null(),
    triggers: z.tuple([]),
    explanation: z.null(),
    nextAction: z.null(),
  }),
])

export type KnownReportDeficiency = z.infer<typeof KnownReportDeficiencySchema>
export type KnownDeficiencyInput = z.input<typeof KnownDeficiencyInputSchema>
export type CriticalDeficiency = z.infer<typeof CriticalDeficiencySchema>
export type KnownDeficiencyAssessment = z.infer<typeof KnownDeficiencyAssessmentSchema>
