import { createHash } from 'node:crypto'
import { validatePdf } from '../documents/validate-pdf.ts'
import { extractImport, ImportFailure } from '../documents/extract-import.ts'
import { createOfflineImport } from '../import/offline-adapter.ts'
import type { ImportRole } from '../../contracts/document-import.ts'
import { IMPORT_MAX_RESPONSE_BYTES } from '../../contracts/document-import.ts'
const send = (value: unknown) => new Promise<void>((resolve, reject) => process.send?.(value, error => error ? reject(error) : resolve()))
process.once('message', async (input: { bytes: Uint8Array; documentName: string; requestId: string; role: ImportRole; parentHash: string | null; attachmentId: string | null }) => {
  let bytes: Uint8Array | undefined = input.bytes
  try {
    const hash = createHash('sha256').update(bytes).digest('hex')
    const format = await validatePdf(bytes, input.documentName, { maxPages: 200 })
    bytes = undefined; input.bytes = new Uint8Array()
    if (format.status !== 'format-validated') throw new ImportFailure(format.error.code === 'page-limit' ? 'page-limit' : 'invalid-format')
    const extracted = await extractImport(format)
    const permitted = new Promise<void>(resolve => process.once('message', () => resolve()))
    await send({ kind: 'adapter-ready', hash })
    await permitted
    const outcome = await createOfflineImport({ hash, name: input.documentName, requestId: input.requestId, role: input.role, parentHash: input.parentHash,
      attachmentId: input.attachmentId, pages: extracted.pages, attachments: extracted.attachments })
    if (Buffer.byteLength(JSON.stringify(outcome)) > IMPORT_MAX_RESPONSE_BYTES) throw new ImportFailure('response-limit')
    await send({ kind: 'outcome', outcome })
  } catch (error) { await send({ kind: 'rejected', code: error instanceof ImportFailure ? error.code : 'processing-failure' }).catch(() => undefined) }
  finally { bytes = undefined; input.bytes = new Uint8Array() }
})
