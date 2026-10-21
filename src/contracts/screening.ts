import { z } from 'zod'
import { FinancialBasisSchema } from './financial-basis.ts'
import { Tg3FindingSchema } from './tg3-resolution.ts'
import { FinancialIssueSchema } from './financial-validation.ts'
import type { FinancialBasis } from './financial-basis.ts'
import type { FindingListBasis } from './finding-control.ts'
import type { FinancialMetrics } from './finance.ts'
import type { CashFlowThreshold, NetYieldThreshold } from './thresholds.ts'

// Bare allerede kjente mangler. Ingen påstand om dokument-/analysefullføring.
export const KnownReportDeficiencySchema = z.strictObject({
  code: z.enum(['missing-report', 'incomplete-report', 'unresolved-tg3']),
  reason: z.string().trim().min(1),
})

// Utelatt delgrunnlag er ikke vurdert. Et mottatt finansgrunnlag valideres i sin helhet.
export const KnownDeficiencyInputSchema = z.strictObject({
  financialBasis: FinancialBasisSchema.optional(),
  reportDeficiencies: z.array(KnownReportDeficiencySchema).default([]),
  tg3Findings: z.array(Tg3FindingSchema).default([]),
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

/** Full screening krever begge hele grunnlag; ingen påstand fra utelatt delinput. */
export interface ScreeningInput {
  financialBasis: FinancialBasis
  reportBasis: FindingListBasis
}

export type EconomicScreeningTrigger = {
  kind: 'economic'
  code: 'net-yield-below-minimum' | 'net-yield-requirement-met'
  target: 'netYield'
  message: string
  threshold: NetYieldThreshold
} | {
  kind: 'economic'
  code: 'negative-cash-flow' | 'cash-flow-nonnegative'
  target: 'cashFlowBeforeTax'
  message: string
  threshold: CashFlowThreshold
}

interface ScreeningSupport {
  scope: 'screening'
  basis: ScreeningInput
  metrics: FinancialMetrics
  thresholds: { netYield: NetYieldThreshold; cashFlow: CashFlowThreshold }
}

export type ScreeningAssessment = ScreeningSupport & (
  (Omit<Extract<KnownDeficiencyAssessment, { status: 'information-required' }>, 'scope'> & {
    partialBasis: true
  }) | {
    status: 'rejected'
    recommendation: 'Forkast'
    priority: 2
    partialBasis: false
    triggers: EconomicScreeningTrigger[]
    explanation: string
    nextAction: string
  } | {
    status: 'proceed'
    recommendation: 'Gå videre'
    priority: 3
    partialBasis: false
    triggers: (EconomicScreeningTrigger | {
      kind: 'technical'
      code: 'technical-basis-sufficient'
      target: 'report'
      message: string
    })[]
    explanation: string
    nextAction: string
  }
)
