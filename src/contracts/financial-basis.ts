import { z } from 'zod'
import { RegisteredFinancialInputSchema } from './financial-input.ts'
import { DecimalStringSchema, FinancialValidationSchema } from './financial-validation.ts'

export const SourceKindSchema = z.enum(['', 'source', 'assumption'])
export const RentNatureSchema = z.enum(['', 'expected', 'actual'])
export const FinancialSourceSchema = z.strictObject({
  kind: SourceKindSchema,
  description: z.string(),
  // Gjeldende verdi/kilde er den første kandidaten. Ingen kandidat velges automatisk.
  conflict: z.strictObject({ rawValue: z.string(), description: z.string() }).nullable(),
})
export const FinancialSourcesSchema = z.strictObject({
  P: FinancialSourceSchema,
  L: FinancialSourceSchema.extend({ rentNature: RentNatureSchema }),
  D: FinancialSourceSchema,
  J: FinancialSourceSchema,
  Ymin: FinancialSourceSchema,
})

export const CostItemSchema = z.strictObject({
  id: z.string().min(1),
  label: z.string(),
  rawAmount: z.string(),
  rawDebt: z.string(),
  includedIn: z.string().nullable(),
})

// Hele kontrollgrunnlaget følger verdiene, også ved senere bekreftelse.
export const FinancialBasisSchema = z.strictObject({
  values: RegisteredFinancialInputSchema,
  sources: FinancialSourcesSchema,
  costItems: z.array(CostItemSchema),
})

export const CostBreakdownSchema = z.strictObject({
  items: z.array(CostItemSchema.extend({
    amount: DecimalStringSchema.nullable(),
    D: DecimalStringSchema.nullable(),
    J: DecimalStringSchema.nullable(),
    status: z.enum(['counted', 'included', 'invalid']),
  })),
  // Oppgitt delinnhold, aldri et tillegg til de registrerte D-/J-totalene.
  D: DecimalStringSchema.nullable(),
  J: DecimalStringSchema.nullable(),
  annualD: DecimalStringSchema.nullable(),
  annualJ: DecimalStringSchema.nullable(),
})

export const FinancialBasisValidationSchema = FinancialValidationSchema.extend({
  registeredBasis: FinancialBasisSchema,
  costBreakdown: CostBreakdownSchema,
})

export type SourceKind = z.infer<typeof SourceKindSchema>
export type RentNature = z.infer<typeof RentNatureSchema>
export type FinancialSource = z.infer<typeof FinancialSourceSchema>
export type FinancialSources = z.infer<typeof FinancialSourcesSchema>
export type CostItem = z.infer<typeof CostItemSchema>
export type FinancialBasis = z.infer<typeof FinancialBasisSchema>
export type CostBreakdown = z.infer<typeof CostBreakdownSchema>
export type FinancialBasisValidation = z.infer<typeof FinancialBasisValidationSchema>
