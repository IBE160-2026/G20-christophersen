import { z } from 'zod'

// Rå tekst og kontrollstatus; numerisk gyldighet/normalisering eies av domain.
export const FinancialFieldSchema = z.enum(['P', 'L', 'D', 'J', 'Ymin'])
export const RecurringFieldSchema = z.enum(['L', 'D', 'J'])
export const RegisteredPeriodSchema = z.enum(['', 'year', 'month', 'unknown'])

export const RegisteredValueSchema = z.strictObject({
  rawValue: z.string(),
  confirmed: z.boolean(),
})

export const RegisteredRecurringValueSchema = RegisteredValueSchema.extend({
  period: z.string(),
  year: z.string(),
})

// Valideringen må kunne forklare også ustøttet periode, og motta eksplisitt
// bekreftet grunnlag uten at den selv utfører en bekreftelseshandling.
export const RegisteredFinancialInputSchema = z.strictObject({
  P: RegisteredValueSchema,
  L: RegisteredRecurringValueSchema,
  D: RegisteredRecurringValueSchema,
  J: RegisteredRecurringValueSchema,
  Ymin: RegisteredValueSchema,
})

const RawValueSchema = RegisteredValueSchema.extend({ confirmed: z.literal(false) })
const RawRecurringValueSchema = RawValueSchema.extend({
  period: RegisteredPeriodSchema,
  year: z.string(),
})

export const RawFinancialInputSchema = z.strictObject({
  P: RawValueSchema,
  L: RawRecurringValueSchema,
  D: RawRecurringValueSchema,
  J: RawRecurringValueSchema,
  Ymin: RawValueSchema,
})

export type FinancialField = z.infer<typeof FinancialFieldSchema>
export type RecurringField = z.infer<typeof RecurringFieldSchema>
export type RegisteredPeriod = z.infer<typeof RegisteredPeriodSchema>
export type RawFinancialInput = z.infer<typeof RawFinancialInputSchema>
export type RegisteredFinancialInput = z.infer<typeof RegisteredFinancialInputSchema>
