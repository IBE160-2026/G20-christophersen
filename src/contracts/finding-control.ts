import { z } from 'zod'
import { CheckableFindingSchema } from './document-analysis.ts'
import type { AnalysisOutcome } from './document-analysis.ts'
import type { KnownReportDeficiency } from './screening.ts'
import type { Tg3Finding } from './tg3-resolution.ts'

/** Brukerens representasjon av rapportfunnet; aldri en ny adapteroriginal. */
export const FindingCorrectionSchema = CheckableFindingSchema.pick({ grade: true, description: true, source: true })
export type FindingCorrection = z.infer<typeof FindingCorrectionSchema>
export interface FindingDraft { grade: string; description: string; pdfPage: string }
export type FindingErrors = Partial<Record<keyof FindingDraft | 'source', string>>
export interface FindingControl {
  findingId: string
  revision: number
  rejection: { revision: number } | null
  correction: FindingCorrection | null
  draft: FindingDraft | null
  confirmedRevision: number | null
  errors: FindingErrors
}

/** Rent kontrollgrunnlag, delt av state, UI og senere screening. */
export interface FindingListBasis {
  status: 'missing' | 'selecting' | 'ready' | 'analysing' | 'completed' | 'failed'
  outcome: AnalysisOutcome | null
  error: string | null
  reportIdentity: { reportHash: string; documentName: string } | null
  limitationReviews?: LimitationReview[]
  tg3Revision?: number
  controls: FindingControl[]
  listRevision: number
  listConfirmationRevision: number | null
  tg3Findings: Tg3Finding[]
}
export interface FindingListAssessment {
  canConfirm: boolean
  confirmed: boolean
  pendingFindingIds: string[]
  tg3Handled: boolean
  controlCompleted: boolean
  reportDeficiencies: KnownReportDeficiency[]
}

/** Separat menneskelig vurdering; original begrensning er aldri endret. */
export const LimitationReviewSchema = z.strictObject({
  index: z.number().int().nonnegative(),
  original: z.string().min(1),
  declaration: z.literal('general-noncritical'),
  reason: z.string().trim().min(1),
  reportHash: z.string().regex(/^[a-f0-9]{64}$/),
  documentName: z.string().min(1),
  requestId: z.string().min(1),
  listRevision: z.number().int().nonnegative(),
  tg3Revision: z.number().int().nonnegative(),
})
export type LimitationReview = z.infer<typeof LimitationReviewSchema>
