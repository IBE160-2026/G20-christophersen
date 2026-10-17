import { z } from 'zod'

// Rå registrering: numerisk gyldighet og normalisering tilhører domain i Story 1.4.
export const FinancialFieldSchema = z.enum(['P', 'L', 'D', 'J', 'Ymin'])
export const RecurringFieldSchema = z.enum(['L', 'D', 'J'])
export const RegisteredPeriodSchema = z.enum(['', 'year', 'month', 'unknown'])

const RegisteredValueSchema = z.strictObject({
  rawValue: z.string(),
  confirmed: z.literal(false),
})

const RegisteredRecurringValueSchema = RegisteredValueSchema.extend({
  period: RegisteredPeriodSchema,
  year: z.string(),
})

export const RawFinancialInputSchema = z.strictObject({
  P: RegisteredValueSchema,
  L: RegisteredRecurringValueSchema,
  D: RegisteredRecurringValueSchema,
  J: RegisteredRecurringValueSchema,
  Ymin: RegisteredValueSchema,
})

export type FinancialField = z.infer<typeof FinancialFieldSchema>
export type RecurringField = z.infer<typeof RecurringFieldSchema>
export type RegisteredPeriod = z.infer<typeof RegisteredPeriodSchema>
export type RawFinancialInput = z.infer<typeof RawFinancialInputSchema>
