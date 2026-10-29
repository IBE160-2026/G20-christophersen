import { readFile } from 'node:fs/promises'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'
import { extractImport } from '../../src/backend/documents/extract-import.ts'
import { createOfflineImport } from '../../src/backend/import/offline-adapter.ts'
import type { ImportRole } from '../../src/contracts/document-import.ts'
export async function importFixture(name = 'mixed-12.pdf', role: ImportRole = 'prospectus', parentHash: string | null = null, requestId = 'synthetic-import') {
  const bytes = new Uint8Array(await readFile(new URL(`../fixtures/sales-prospectus/${name}`, import.meta.url)))
  const format = await validatePdf(bytes, name, { maxPages: 200 })
  if (format.status !== 'format-validated') throw new Error('synthetic format')
  const { pages, attachments } = await extractImport(format)
  const outcome = await createOfflineImport({ hash: format.reportHash, name, pages, attachments, requestId, role, parentHash, attachmentId: null })
  return { selected: { bytes, hash: format.reportHash, file: new File([bytes], name) }, outcome }
}
