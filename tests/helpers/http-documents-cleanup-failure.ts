import { Worker } from 'node:worker_threads'
import type { validatePdf as Validate } from '../../src/backend/documents/validate-pdf.ts'
export { extractPdf } from '../../src/backend/documents/extract-pdf.ts'
export const validatePdf: typeof Validate = async () => {
  new Worker('setInterval(() => {}, 1000)', { eval: true })
  throw new Error('PRIVATE: parser destroy failed while worker still exists')
}
