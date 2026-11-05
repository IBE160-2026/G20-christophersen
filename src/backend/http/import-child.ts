import { recordImportMeasurement, setImportMeasurementSink } from '../documents/import-measurement.ts'
import { createHash } from 'node:crypto'
import { validateOwnedImportPdf } from '../documents/validate-pdf.ts'
import { extractImport, ImportFailure } from '../documents/extract-import.ts'
import { createCodeFirstImport } from '../import/semantic-adapter.ts'
import { attachUploadedEconomy } from '../import/uploaded-economy-cache.ts'
import { attachSavedEconomy } from '../import/saved-economy.ts'
import { createOfflineImport } from '../import/offline-adapter.ts'
import { enrichImportWithLocalVisual } from '../documents/visual-import.ts'
import type { ImportRole } from '../../contracts/document-import.ts'
import { IMPORT_MAX_RESPONSE_BYTES, IMPORT_MAX_PDF_BYTES } from '../../contracts/document-import.ts'
const send = (value: unknown) => new Promise<void>((resolve, reject) => process.send?.(value, error => error ? reject(error) : resolve()))
process.once('message', async (input: { byteLength: number; documentName: string; requestId: string; role: ImportRole; parentHash: string | null; attachmentId: string | null; measure?: boolean }) => {
  let bytes: Uint8Array | undefined
  try {
    if (input.measure) setImportMeasurementSink(measurement => { process.send?.({ kind: 'measurement', measurement }) })
    recordImportMeasurement('input', 'start')
    if (!Number.isInteger(input.byteLength) || input.byteLength < 1 || input.byteLength > IMPORT_MAX_PDF_BYTES) throw new ImportFailure('invalid-format')
    bytes = new Uint8Array(new SharedArrayBuffer(input.byteLength))
    let received = 0
    for await (const chunk of process.stdin) {
      if (!(chunk instanceof Buffer) || received + chunk.length > bytes.length) throw new ImportFailure('invalid-format')
      bytes.set(chunk, received); received += chunk.length
    }
    if (received !== bytes.length) throw new ImportFailure('invalid-format')
    recordImportMeasurement('input', 'end')
    const hash = createHash('sha256').update(bytes).digest('hex')
    const format = await validateOwnedImportPdf(bytes, input.documentName)
    if (format.status !== 'format-validated') throw new ImportFailure(format.error.code === 'page-limit' ? 'page-limit' : 'invalid-format')
    bytes = format.originalBytes
    recordImportMeasurement('extraction', 'start')
    const extracted = await extractImport(format, { measure: input.measure, resourceLimitBytes: 448 * 1024 * 1024 })
    recordImportMeasurement('extraction', 'end')
    const permitted = new Promise<number>(resolve => process.once('message', (permission: { remainingMs?: number }) => resolve(permission.remainingMs ?? 0)))
    await send({ kind: 'adapter-ready', hash })
    const remainingMs = await permitted, adapterStarted = performance.now()
    const basis = { hash, name: input.documentName, requestId: input.requestId, role: input.role, parentHash: input.parentHash,
      attachmentId: input.attachmentId, pages: extracted.pages, attachments: extracted.attachments }
    recordImportMeasurement('analysis', 'start')
    let outcome
    try { outcome = await createOfflineImport(basis); recordImportMeasurement('analysis', 'end') } catch (error) {
      if (!(error instanceof ImportFailure) || error.code !== 'unsupported-synthetic') throw error
      outcome = await createCodeFirstImport(basis)
      recordImportMeasurement('analysis', 'end')
      if (basis.role === 'prospectus') {
        recordImportMeasurement('economy', 'start')
        outcome = await attachSavedEconomy(outcome, bytes!, basis)
        outcome = await attachUploadedEconomy(outcome, bytes!, basis)
        recordImportMeasurement('economy', 'end')
      }
      recordImportMeasurement('visual', 'start')
      outcome = await enrichImportWithLocalVisual(outcome, bytes!, { deadlineMs: Math.max(0, remainingMs - (performance.now() - adapterStarted) - 2500) })
      recordImportMeasurement('visual', 'end')
    }
    recordImportMeasurement('serialization', 'start')
    if (Buffer.byteLength(JSON.stringify(outcome)) > IMPORT_MAX_RESPONSE_BYTES) throw new ImportFailure('response-limit')
    recordImportMeasurement('serialization', 'end')
    await send({ kind: 'outcome', outcome })
  } catch (error) { await send({ kind: 'rejected', code: error instanceof ImportFailure ? error.code : 'processing-failure' }).catch(() => undefined) }
  finally { bytes = undefined }
})
