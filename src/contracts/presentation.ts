import { z } from 'zod'
import { FinancialMetricSchema } from './finance.ts'
import type { FinancialMetrics } from './finance.ts'
import { CashFlowThresholdSchema, FinancialThresholdDecisionSchema, NetYieldThresholdSchema } from './thresholds.ts'
import type { CashFlowThreshold, NetYieldThreshold } from './thresholds.ts'

// Hvert terskelobjekt eier allerede metrikken som ble vurdert i 3.2.
export type FinancialPresentationInput = Pick<FinancialMetrics, 'grossYield' | 'noi'> & {
  netYield: NetYieldThreshold
  cashFlowBeforeTax: CashFlowThreshold
}

export const PresentedFinancialMetricSchema = z.strictObject({
  name: z.string(),
  unit: z.enum(['%', 'kr/år']),
  year: z.string().nullable(),
  partialLabel: z.literal('Delgrunnlag').nullable(),
  statusLabel: z.enum(['Beregnet', 'Ikke beregnbart']),
  displayValue: z.string().nullable(),
  // Det eksakte originalgrunnlaget og konkrete feltårsaker bevares samlet.
  metric: FinancialMetricSchema,
  threshold: z.strictObject({
    decision: FinancialThresholdDecisionSchema,
    basis: z.union([NetYieldThresholdSchema.shape.basis, CashFlowThresholdSchema.shape.basis]),
    minimumDisplayValue: z.string().nullable(),
    minimumDetailValue: z.string().nullable(),
  }).nullable(),
  detail: z.strictObject({
    displayValue: z.string(),
    decimalPlaces: z.number().int().nonnegative(),
    approximate: z.boolean(),
  }).nullable(),
  rounding: z.strictObject({
    code: z.enum(['hidden-net-yield-breach', 'negative-rounded-to-zero']),
    explanation: z.string(),
  }).nullable(),
})

export const PresentedFinancialMetricsSchema = z.strictObject({
  grossYield: PresentedFinancialMetricSchema,
  noi: PresentedFinancialMetricSchema,
  netYield: PresentedFinancialMetricSchema,
  cashFlowBeforeTax: PresentedFinancialMetricSchema,
})

export type PresentedFinancialMetric = z.infer<typeof PresentedFinancialMetricSchema>
export type PresentedFinancialMetrics = z.infer<typeof PresentedFinancialMetricsSchema>
