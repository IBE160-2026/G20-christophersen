import type { FinancialField } from './financial-input.ts'
import type { ScreeningAssessment } from './screening.ts'

/** Binding innen ett objekt i den aktive frontendøkten; ingen varig historikk. */
export interface ResultBinding {
  documentImport?: { prospectusHash: string | null; reportHash: string | null; inputDigest: string | null; coverageRevision: number; identityChecked: boolean; areaChecked: boolean }
  financialRevision: number
  financialConfirmations: Record<FinancialField, boolean>
  listRevision: number
  listConfirmationRevision: number | null
  findingConfirmations: { findingId: string; revision: number; confirmedRevision: number | null }[]
  limitationReviewRevision: number
  tg3Revision: number
  report: {
    generation: number
    reportHash: string | null
    documentName: string | null
    requestId: string | null
    status: ScreeningAssessment['basis']['reportBasis']['status']
    error: string | null
  }
}

export interface ResultChange {
  kind: 'financial' | 'finding' | 'tg3' | 'report' | 'confirmation'
  target: string
  message: string
  nextAction: string
}

export interface ResultSnapshot {
  readonly binding: ResultBinding
  readonly assessment: ScreeningAssessment
}

export type ResultSelection = { status: 'not-calculated'; label: 'Ikke beregnet'; snapshot: null; unusedDraftFindingIds: string[] }
  | { status: 'current'; label: 'Gjeldende'; snapshot: ResultSnapshot; unusedDraftFindingIds: string[] }
  | { status: 'historical'; label: 'Utdatert'; snapshot: ResultSnapshot; changes: ResultChange[]; unusedDraftFindingIds: string[] }
