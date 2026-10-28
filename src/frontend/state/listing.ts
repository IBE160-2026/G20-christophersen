import type { ListingCorrelation, ListingDraft } from '../../contracts/listing.ts'
export interface ListingState {
  url: string; objectCode: string | null; generation: number; status: 'idle' | 'loading' | 'ready' | 'failed'
  active: ListingCorrelation | null; draft: ListingDraft | null; error: string | null
  applied: { draft: ListingDraft; financing: ListingState['financing']; D: string | null; J: string | null; periodD: string; yearD: string; periodJ: string; yearJ: string; sourceD: string; sourceJ: string } | null
  financing: { equity: string; annualInterest: string; months: string; year: string }
}
export function createListingState(): ListingState {
  return { url: '', objectCode: null, generation: 0, status: 'idle', active: null, draft: null, error: null, applied: null,
    financing: { equity: '', annualInterest: '', months: '', year: '' } }
}
