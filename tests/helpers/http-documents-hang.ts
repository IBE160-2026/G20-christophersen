import { Worker } from 'node:worker_threads'
import type { validatePdf as Validate } from '../../src/backend/documents/validate-pdf.ts'
export { extractPdf } from '../../src/backend/documents/extract-pdf.ts'
/** Both the parser thread and the blocked main thread belong to the request process. */
export const validatePdf: typeof Validate = async () => {
  new Worker('setInterval(() => {}, 1000)', { eval: true })
  while (true) { /* PDF-like synchronous parser hang, unresponsive to cooperative abort. */ }
}
