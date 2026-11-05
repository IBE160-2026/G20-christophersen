import { createHash } from 'node:crypto'
import { newProspectusPdf } from './new-prospectus-pdf.ts'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'
import { extractImport } from '../../src/backend/documents/extract-import.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { estimateRent } from '../../src/backend/rent/ssb-rent.ts'
import { extractRentalProperty } from '../../src/domain/rental-property.ts'
import type { DocumentImport } from '../../src/contracts/document-import.ts'

export const rentalLines = ['Adresse: Fasitveien 4, 4005 Stavanger', 'Kommune: Stavanger', 'Boligtype: Leilighet', 'BRA-i: 50 m2', 'Antall rom: 2', 'Prisantydning: 3 000 000 kr', 'Fellesgjeld: 0 kr', 'Omkostninger: 75 000 kr']
export async function rentalDocument(lines = rentalLines) {
  const bytes = newProspectusPdf(lines), name = 'syntetisk-leilighet.pdf'
  const format = await validatePdf(new Uint8Array(bytes), name, { maxPages: 200 })
  if (format.status !== 'format-validated') throw new Error('Ugyldig syntetisk PDF')
  const { pages, attachments } = await extractImport(format)
  const hash = createHash('sha256').update(bytes).digest('hex')
  const outcome = await createCodeFirstImport({ hash, name, pages, attachments, requestId: 'rental-test', role: 'prospectus', parentHash: null, attachmentId: null })
  return { outcome, selected: { bytes: new Uint8Array(bytes), hash, file: new File([new Uint8Array(bytes)], name) } }
}
export function fixtureRent(outcome: DocumentImport) {
  return estimateRent(extractRentalProperty(outcome), { now: () => new Date('2026-11-04T12:00:00Z') })
}
