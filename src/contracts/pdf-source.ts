import { z } from 'zod'
import { ReportHashSchema } from './document-analysis.ts'

/** Felles ordrett kilde i original-PDF, med fysisk sidetall telt fra én. */
export const PdfSourceSchema = z.strictObject({
  documentHash: ReportHashSchema, documentName: z.string().min(1).max(255), pdfPage: z.number().int().min(1).max(200),
  quote: z.string().min(1).max(2000), start: z.number().int().nonnegative(), end: z.number().int().positive(),
  method: z.literal('pdf-text'), printedPage: z.string().max(80).nullable(),
}).refine(source => source.end > source.start, 'Kildens tekstområde må være positivt.')

export type PdfSource = z.infer<typeof PdfSourceSchema>
