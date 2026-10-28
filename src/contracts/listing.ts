import { z } from 'zod'

export const ListingDecimalSchema = z.string().max(80).regex(/^(?:0|[1-9]\d*)(?:\.\d+)?$/)
export const ListingKeySchema = z.enum(['price', 'totalPrice', 'purchaseCosts', 'documentTax', 'sharedDebt', 'commonCosts', 'propertyTax', 'municipalFees', 'sharedDebtPayment'])
export const ListingFieldSchema = z.strictObject({
  id: z.string().min(1).max(80).regex(/^(?!constructor$|prototype$)[a-z][a-zA-Z0-9-]*$/), label: z.string().min(1).max(200),
  category: z.enum(['price', 'one-off', 'recurring', 'informational']),
  status: z.enum(['available', 'missing', 'unavailable', 'conflict']),
  amount: ListingDecimalSchema.nullable(), currency: z.literal('NOK'),
  period: z.enum(['once', 'month', 'year', 'unknown']), year: z.string().regex(/^\d{4}$/).nullable(),
  source: z.strictObject({ url: z.string().max(2048), quote: z.string().min(1).max(2000) }).nullable(),
  alternatives: z.array(z.strictObject({ amount: ListingDecimalSchema, url: z.string().max(2048), quote: z.string().min(1).max(2000) })).max(10),
  // null betyr ukjent fordeling/inkludering. '' betyr eksplisitt separat post.
  includedIn: z.string().max(80).nullable(), debtPart: ListingDecimalSchema.nullable(),
})
export const ListingExtractionSchema = z.strictObject({
  listingCode: z.string().regex(/^\d+$/), url: z.string().max(2048),
  fields: z.array(ListingFieldSchema).max(40),
})
export const ListingImportSchema = ListingExtractionSchema.extend({ fetchedAt: z.iso.datetime() })
export const ListingCorrelationSchema = z.strictObject({
  requestId: z.string().min(1).max(100), generation: z.number().int().nonnegative().safe(),
})
export const ListingRequestSchema = z.strictObject({ url: z.string().max(2048), correlation: ListingCorrelationSchema })
export const ListingResponseSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('listing'), correlation: ListingCorrelationSchema, listing: ListingImportSchema }),
  z.strictObject({ kind: z.literal('rejected'), code: z.enum(['disabled', 'invalid-request', 'unavailable']) }),
])
export type ListingField = z.infer<typeof ListingFieldSchema>
export type ListingImport = z.infer<typeof ListingImportSchema>
export type ListingCorrelation = z.infer<typeof ListingCorrelationSchema>
export interface ListingCorrection {
  rawAmount: string; period: ListingField['period']; year: string; includedIn: string | null; rawDebtPart: string
  note: string; reviewed: boolean
}
export interface ListingDraft {
  original: ListingImport; corrections: Record<string, ListingCorrection>; completeOperatingCosts: boolean
}
