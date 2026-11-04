import { createHash } from 'node:crypto'
import { validatePdf } from '../documents/validate-pdf.ts'
import { extractImport, ImportFailure } from '../documents/extract-import.ts'
import { createCodeFirstImport } from '../import/semantic-adapter.ts'
import { attachUploadedEconomy } from '../import/uploaded-economy-cache.ts'
import { attachSavedEconomy } from '../import/saved-economy.ts'
import { createOfflineImport } from '../import/offline-adapter.ts'
import { enrichImportWithLocalVisual } from '../documents/visual-import.ts'
import type { ImportRole } from '../../contracts/document-import.ts'
import { IMPORT_MAX_RESPONSE_BYTES } from '../../contracts/document-import.ts'
const send = (value: unknown) => new Promise<void>((resolve, reject) => process.send?.(value, error => error ? reject(error) : resolve()))
process.once('message', async (input: { bytes: Uint8Array; documentName: string; requestId: string; role: ImportRole; parentHash: string | null; attachmentId: string | null }) => {
  let bytes: Uint8Array | undefined = input.bytes
  try {
    const hash = createHash('sha256').update(bytes).digest('hex')
    const format = await validatePdf(bytes, input.documentName, { maxPages: 200 })
    input.bytes = new Uint8Array()
    if (format.status !== 'format-validated') throw new ImportFailure(format.error.code === 'page-limit' ? 'page-limit' : 'invalid-format')
    bytes = format.originalBytes
    const extracted = await extractImport(format)
    const permitted = new Promise<number>(resolve => process.once('message', (permission: { remainingMs?: number }) => resolve(permission.remainingMs ?? 0)))
    await send({ kind: 'adapter-ready', hash })
    const remainingMs = await permitted, adapterStarted = performance.now()
    const basis = { hash, name: input.documentName, requestId: input.requestId, role: input.role, parentHash: input.parentHash,
      attachmentId: input.attachmentId, pages: extracted.pages, attachments: extracted.attachments }
    let outcome
    try { outcome = await createOfflineImport(basis) } catch (error) {
      if (!(error instanceof ImportFailure) || error.code !== 'unsupported-synthetic') throw error
      outcome = await createCodeFirstImport(basis)
      if (basis.role === 'prospectus') {
        outcome = await attachSavedEconomy(outcome, bytes!, basis)
        outcome = await attachUploadedEconomy(outcome, bytes!, basis)
      }
      outcome = await enrichImportWithLocalVisual(outcome, bytes!, { deadlineMs: Math.max(0, remainingMs - (performance.now() - adapterStarted) - 2500) })
    }
    if (Buffer.byteLength(JSON.stringify(outcome)) > IMPORT_MAX_RESPONSE_BYTES) throw new ImportFailure('response-limit')
    await send({ kind: 'outcome', outcome })
  } catch (error) { await send({ kind: 'rejected', code: error instanceof ImportFailure ? error.code : 'processing-failure' }).catch(() => undefined) }
  finally { bytes = undefined; input.bytes = new Uint8Array() }
})
