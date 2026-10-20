import { Worker } from 'node:worker_threads'
import { createHash } from 'node:crypto'
import { AnalysisContextSchema, CONTRACT_VERSION, DocumentBasisSchema, EXTRACTION_VERSION } from '../../contracts/document-analysis.ts'
import type { AnalysisError, DocumentBasis } from '../../contracts/document-analysis.ts'
import { getDocumentBasisError } from '../../contracts/analysis-validation.ts'
import type { PdfFormatOutcome } from './validate-pdf.ts'

export type PdfExtractionOutcome = {
  document: DocumentBasis
  error: Extract<AnalysisError, { kind: 'document' }> | null
}
export type ExtractionRequest = { requestId: string; mode: 'demo' | 'live' }
const unavailable = () => new Error('PDF-teksten kunne ikke kontrolleres. Prøv igjen.')
function createWorker(bytes: Uint8Array, pageCount: number) {
  try {
    return new Worker(new URL('./pdf-extraction-worker.ts', import.meta.url), { workerData: { bytes: Uint8Array.from(bytes), pageCount } })
  } catch { throw unavailable() }
}
async function terminate(worker: Worker) {
  try { await worker.terminate() } catch { throw unavailable() }
}

/** Consumes the format snapshot; returns the complete basis even when reading is blocked. */
export async function extractPdf(format: Extract<PdfFormatOutcome, { status: 'format-validated' }>, request: ExtractionRequest): Promise<PdfExtractionOutcome> {
  const context = AnalysisContextSchema.parse({ ...request, contractVersion: CONTRACT_VERSION, extractionVersion: EXTRACTION_VERSION,
    reportHash: format.reportHash, documentName: format.documentName, pageCount: format.pageCount })
  const bytes = Uint8Array.from(format.originalBytes)
  if (createHash('sha256').update(bytes).digest('hex') !== context.reportHash) throw unavailable()
  const worker = createWorker(bytes, format.pageCount)
  try {
    const pages = await new Promise<unknown>((resolve, reject) => {
      worker.once('message', (reply: { kind?: string; pages?: unknown }) => {
        if (reply.kind === 'extracted') resolve(reply.pages)
        else reject(unavailable())
      })
      worker.once('error', () => reject(unavailable()))
      worker.once('messageerror', () => reject(unavailable()))
      worker.once('exit', () => reject(unavailable()))
    })
    const parsed = DocumentBasisSchema.safeParse({ ...context, pages })
    if (!parsed.success) throw unavailable()
    return { document: parsed.data, error: getDocumentBasisError(parsed.data) }
  } finally {
    await terminate(worker)
  }
}
