import { z } from 'zod'
import { RegisteredValueSchema } from './financial-input.ts'
import { FinancialSourceSchema } from './financial-basis.ts'
import { DecimalStringSchema, FinancialIssueSchema } from './financial-validation.ts'
import { FinancialMetricSchema } from './finance.ts'

// Regelavgjørelse og eksakt sammenlikning er adskilt fra senere presentasjon.
export const FinancialThresholdDecisionSchema = z.discriminatedUnion('status', [
  z.strictObject({
    status: z.enum(['passed', 'breached']),
    comparison: z.strictObject({
      left: DecimalStringSchema, operator: z.literal('>='), right: DecimalStringSchema,
    }),
    issues: z.tuple([]),
  }),
  z.strictObject({
    status: z.literal('unavailable'), comparison: z.null(),
    issues: z.array(FinancialIssueSchema).min(1),
  }),
])

export const NetYieldThresholdSchema = z.strictObject({
  decision: FinancialThresholdDecisionSchema,
  basis: z.strictObject({
    formula: z.literal('100 * NOI >= P * Ymin'),
    metric: FinancialMetricSchema,
    minimumYield: z.strictObject({
      registered: RegisteredValueSchema, source: FinancialSourceSchema,
      decimal: DecimalStringSchema.nullable(), unit: z.literal('percent'),
    }),
  }),
})

export const CashFlowThresholdSchema = z.strictObject({
  decision: FinancialThresholdDecisionSchema,
  basis: z.strictObject({
    formula: z.literal('L−D−J >= 0'), metric: FinancialMetricSchema,
  }),
})

export type FinancialThresholdDecision = z.infer<typeof FinancialThresholdDecisionSchema>
export type NetYieldThreshold = z.infer<typeof NetYieldThresholdSchema>
export type CashFlowThreshold = z.infer<typeof CashFlowThresholdSchema>
