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
