import type { DocumentImport, ImportRole } from '../../contracts/document-import.ts'
import type { AnalysisHttpCorrelation } from '../../contracts/analysis-http.ts'
import type { ListingCorrection } from '../../contracts/listing.ts'
import type { SelectedReport } from './report.ts'
import type { ListingState } from './listing.ts'

export interface ImportSlot {
  status: 'idle' | 'selecting' | 'ready' | 'loading' | 'imported' | 'failed'; selected: SelectedReport | null; outcome: DocumentImport | null
  active: AnalysisHttpCorrelation | null; error: string | null
}
export interface ProspectusState {
  generation: number; prospectus: ImportSlot; report: ImportSlot; corrections: Record<string, ListingCorrection>; completeOperatingCosts: boolean
  financing: ListingState['financing']; coverageRevision: number; identityChecked: boolean; areaChecked: boolean
}
export type ProspectusAction =
  | { type: 'import-selecting'; generation: number; role: ImportRole }
  | { type: 'import-selected'; generation: number; role: ImportRole; selected: SelectedReport }
  | { type: 'import-start'; role: ImportRole; correlation: AnalysisHttpCorrelation }
  | { type: 'import-response'; role: ImportRole; correlation: AnalysisHttpCorrelation; body: unknown; ok: boolean }
  | { type: 'import-error'; role: ImportRole; generation: number; code: string }
  | { type: 'import-economy-result'; generation: number; documentHash: string; requestDigest: string; outcome: unknown }
  | { type: 'import-abandon' }
  | { type: 'import-restore-integrated' }
  | { type: 'import-correction'; id: string; correction: ListingCorrection }
  | { type: 'import-complete-costs'; complete: boolean }
  | { type: 'import-financing'; field: keyof ListingState['financing']; value: string }
  | { type: 'import-apply' }
  | { type: 'import-identity'; checked: boolean }
  | { type: 'import-area'; checked: boolean }
export const emptySlot = (): ImportSlot => ({ status: 'idle', selected: null, outcome: null, active: null, error: null })
export function createProspectusState(): ProspectusState {
  return { generation: 0, prospectus: emptySlot(), report: emptySlot(), corrections: {}, completeOperatingCosts: false,
    financing: { equity: '', annualInterest: '', months: '', year: '' }, coverageRevision: 0, identityChecked: false, areaChecked: false }
}
export function technicalImport(state: ProspectusState) { return state.report.selected ? state.report.outcome : state.prospectus.outcome }
