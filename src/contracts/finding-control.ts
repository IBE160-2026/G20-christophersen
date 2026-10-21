import { z } from 'zod'
import { CheckableFindingSchema } from './document-analysis.ts'

/** Brukerens representasjon av rapportfunnet; aldri en ny adapteroriginal. */
export const FindingCorrectionSchema = CheckableFindingSchema.pick({ grade: true, description: true, source: true })
export type FindingCorrection = z.infer<typeof FindingCorrectionSchema>
export interface FindingDraft { grade: string; description: string; pdfPage: string }
export type FindingErrors = Partial<Record<keyof FindingDraft | 'source', string>>
export interface FindingControl {
  findingId: string
  revision: number
  correction: FindingCorrection | null
  draft: FindingDraft | null
  confirmedRevision: number | null
  errors: FindingErrors
}
