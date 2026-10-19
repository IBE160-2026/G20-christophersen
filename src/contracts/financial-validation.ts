import { z } from 'zod'
import {
  FinancialFieldSchema, RecurringFieldSchema,
  RegisteredValueSchema, RegisteredRecurringValueSchema,
} from './financial-input.ts'

// Kun kanonisk desimaltekst ved modulgrensen; råstrengen ligger i registered.
export const DecimalStringSchema = z.string().regex(/^(?!-0$)-?(?:0|[1-9]\d*)(?:\.\d*[1-9])?$/)

export const FinancialIssueSchema = z.strictObject({
  field: FinancialFieldSchema,
  target: z.enum(['value', 'confirmation', 'period', 'year']),
  code: z.enum([
    'missing-value', 'not-numeric', 'must-be-positive', 'must-be-nonnegative',
    'unconfirmed-zero', 'unconfirmed-value', 'missing-period', 'unknown-period',
    'unsupported-period', 'missing-year', 'invalid-year', 'different-years',
  ]),
  message: z.string(),
  action: z.string(),
  relatedFields: z.array(RecurringFieldSchema),
})

const ValidatedValueSchema = z.strictObject({
  registered: RegisteredValueSchema,
  valueStatus: z.enum(['missing', 'invalid', 'valid']),
  decimal: DecimalStringSchema.nullable(),
  status: z.enum(['sufficient', 'insufficient']),
  issues: z.array(FinancialIssueSchema),
})

const ValidatedRecurringValueSchema = ValidatedValueSchema.extend({
  registered: RegisteredRecurringValueSchema,
  // Kontrollgrunnlag: sufficient gjelder bare numerikk, bekreftelse og periode/år.
  // Kilde/kostnadsinnhold må også vurderes før senere gyldig bruk.
  normalization: z.strictObject({
    year: z.string(),
    factor: z.enum(['1', '12']),
    annualValue: DecimalStringSchema,
  }).nullable(),
})

export const FinancialValidationSchema = z.strictObject({
  fields: z.strictObject({
    P: ValidatedValueSchema,
    L: ValidatedRecurringValueSchema,
    D: ValidatedRecurringValueSchema,
    J: ValidatedRecurringValueSchema,
    Ymin: ValidatedValueSchema,
  }),
  commonYear: z.string().nullable(),
  issues: z.array(FinancialIssueSchema),
})

export type FinancialIssue = z.infer<typeof FinancialIssueSchema>
export type FinancialValidation = z.infer<typeof FinancialValidationSchema>
