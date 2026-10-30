import { useEffect, useState } from 'react'
import type { ImportSlot } from '../state/prospectus.ts'
import { importProgressText } from './import-progress.ts'
export function ImportProgress({ slot }: { slot: ImportSlot }) {
  const [elapsed, setElapsed] = useState({ requestId: null as string | null, seconds: 0 })
  useEffect(() => {
    if (slot.status !== 'loading') return
    const start = Date.now()
    const timer = setInterval(() => setElapsed({ requestId: slot.active?.requestId ?? null, seconds: Math.floor((Date.now() - start) / 1000) }), 1000)
    return () => clearInterval(timer)
  }, [slot.status, slot.active?.requestId])
  return <div><p role="status" aria-live="polite">{importProgressText(slot)}</p>{slot.status === 'loading' && <p aria-hidden="true">Ventetid: {elapsed.requestId === slot.active?.requestId ? elapsed.seconds : 0} s</p>}</div>
}
