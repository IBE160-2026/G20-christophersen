import { validatePdf as validate } from '../../src/backend/documents/validate-pdf.ts'
export { extractPdf } from '../../src/backend/documents/extract-pdf.ts'
export const validatePdf: typeof validate = async (...args) => {
  await new Promise(resolve => setTimeout(resolve, 30_000))
  return validate(...args)
}
