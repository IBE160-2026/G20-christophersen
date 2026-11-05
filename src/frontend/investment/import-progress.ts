import type { ImportSlot } from '../state/prospectus.ts'
import { importErrorMessage } from '../analysis/import-messages.ts'
export function importProgressText(slot: ImportSlot) {
  if (slot.status === 'selecting') return 'Leser fil og beregner dokumentets SHA-256 lokalt …'
  if (slot.status === 'loading') return 'Venter på lokal dokumentbehandling. Ingen nye KI-kall er startet.'
  if (slot.error) return importErrorMessage(slot.error)
  if (slot.status === 'imported') return slot.outcome?.economy.analysis?.provenance === 'saved-same-document'
    ? 'Lagret analyse av samme dokument er hentet.'
    : slot.outcome?.economy.analysis?.provenance === 'live-document' ? 'Dokument- og økonomianalyse klar.'
      : 'Dokumentuttrekk klart. Videre KI-analyse har ikke startet.'
  return 'Import starter når du velger fil.'
}
