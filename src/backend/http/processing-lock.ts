/** Én prosess i den lokale appen, delt mellom gammel og ny dokumentinngang. */
export function createProcessingLock() {
  let occupied = false
  return { acquire() { if (occupied) return false; occupied = true; return true }, release() { occupied = false } }
}
export type ProcessingLock = ReturnType<typeof createProcessingLock>
