import { z } from 'zod'
import { RegisteredValueSchema, RegisteredRecurringValueSchema } from './financial-input.ts'
import { DecimalStringSchema, FinancialIssueSchema, FinancialValidationSchema } from './financial-validation.ts'
import { CostBreakdownSchema, FinancialSourceSchema, FinancialSourcesSchema } from './financial-basis.ts'

// Kontrollmetadata følger bare feltene nøkkeltallet faktisk avhenger av.
export const FinancialMetricInputSchema = z.strictObject({
  field: z.enum(['P', 'L', 'D', 'J']),
  registered: z.union([RegisteredRecurringValueSchema, RegisteredValueSchema]),
  source: z.union([FinancialSourcesSchema.shape.L, FinancialSourceSchema]),
  decimal: DecimalStringSchema.nullable(),
  normalization: FinancialValidationSchema.shape.fields.shape.L.shape.normalization,
  unit: z.literal('NOK'),
})

export const FinancialMetricBasisSchema = z.strictObject({
  formula: z.string(),
  inputs: z.array(FinancialMetricInputSchema),
  year: z.string().nullable(),
  // Kostnadsinnhold er dokumentasjon i D/J-totalene, aldri et ekstra fratrekk.
  costBreakdown: CostBreakdownSchema.nullable(),
})

export const ExactFinancialValueSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('amount'), amount: DecimalStringSchema, unit: z.literal('NOK/year') }),
  // Ingen dividering: presentasjon kan senere vise forholdstallet i prosent.
  z.strictObject({
    kind: z.literal('ratio'), numerator: DecimalStringSchema,
    denominator: DecimalStringSchema, unit: z.literal('ratio'),
  }),
])

export const FinancialMetricSchema = z.discriminatedUnion('status', [
  z.strictObject({
    status: z.literal('available'), value: ExactFinancialValueSchema,
    basis: FinancialMetricBasisSchema, issues: z.tuple([]),
  }),
  z.strictObject({
    status: z.literal('unavailable'), value: z.null(),
    basis: FinancialMetricBasisSchema, issues: z.array(FinancialIssueSchema).min(1),
  }),
])

export const FinancialMetricsSchema = z.strictObject({
  grossYield: FinancialMetricSchema,
  noi: FinancialMetricSchema,
  netYield: FinancialMetricSchema,
  cashFlowBeforeTax: FinancialMetricSchema,
})

export type FinancialMetricBasis = z.infer<typeof FinancialMetricBasisSchema>
export type FinancialMetric = z.infer<typeof FinancialMetricSchema>
export type FinancialMetrics = z.infer<typeof FinancialMetricsSchema>
