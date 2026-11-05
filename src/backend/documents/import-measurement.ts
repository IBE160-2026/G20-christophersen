import { getHeapStatistics } from 'node:v8'
import { z } from 'zod'

// Only enumerated operations, physical page numbers and memory counters cross
// the diagnostic boundary. Names, paths and PDF/user text are never included.
export const ImportMeasurementSchema = z.strictObject({
  process: z.enum(['node', 'local-ocr']),
  phase: z.enum(['input', 'container', 'page-tree', 'extraction', 'content-inspection', 'text', 'raster', 'cleanup', 'analysis', 'economy', 'visual', 'serialization']),
  point: z.enum(['start', 'end', 'sample']),
  pdfPage: z.number().int().min(1).max(200).optional(),
  rss: z.number().int().nonnegative(),
  heapLimit: z.number().int().nonnegative().optional(),
  heapUsed: z.number().int().nonnegative().optional(),
  external: z.number().int().nonnegative().optional(),
  arrayBuffers: z.number().int().nonnegative().optional(),
})
export type ImportMeasurement = z.infer<typeof ImportMeasurementSchema>
let sink: ((measurement: ImportMeasurement) => void) | undefined
export function hasImportMeasurementSink() { return sink !== undefined }
export function setImportMeasurementSink(callback: typeof sink) { sink = callback }
export function emitImportMeasurement(measurement: ImportMeasurement) {
  try { sink?.(measurement) } catch { /* Observation cannot change an import. */ }
}
export function recordImportMeasurement(phase: ImportMeasurement['phase'], point: ImportMeasurement['point'], pdfPage?: number) {
  if (!sink) return
  const { rss, heapUsed, external, arrayBuffers } = process.memoryUsage()
  emitImportMeasurement({ process: 'node', phase, point, ...(pdfPage ? { pdfPage } : {}), rss, heapUsed, external, arrayBuffers, heapLimit: getHeapStatistics().heap_size_limit })
}
