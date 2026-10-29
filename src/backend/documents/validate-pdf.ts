import { createHash } from 'node:crypto'
import { getDocument, PDFWorker, VerbosityLevel } from 'pdfjs-dist/legacy/build/pdf.mjs'
import type { AnalysisError } from '../../contracts/document-analysis.ts'
import { countPdfPages } from './count-pdf-pages.ts'

type DocumentError = Extract<AnalysisError, { kind: 'document' }>
type FormatErrorCode = 'invalid-format' | 'invalid-container' | 'page-limit'

type ReportIdentity = {
  documentName: string
  reportHash: string
}

/** A format-only outcome. Text reliability and analysis completion are separate steps. */
export type PdfFormatOutcome =
  | (ReportIdentity & {
    status: 'format-validated'
    originalBytes: Uint8Array
    pageCount: number
  })
  | (ReportIdentity & {
    status: 'failed'
    pageCount: number | null
    error: DocumentError
  })

function failure(identity: ReportIdentity, code: FormatErrorCode, pageCount: number | null): PdfFormatOutcome {
  const reasons: Record<FormatErrorCode, string> = {
    'invalid-format': 'Filen kunne ikke åpnes som PDF. Velg en PDF-tilstandsrapport.',
    'invalid-container': 'PDF-beholderen kunne ikke åpnes og sidetelles. Velg en intakt PDF-tilstandsrapport.',
    'page-limit': 'PDF-en har mer enn 30 sider. Velg en rapport på høyst 30 sider.',
  }
  return { ...identity, status: 'failed', pageCount,
    error: { kind: 'document', code, target: { kind: 'document' }, reason: reasons[code] } }
}

async function destroyResources(task: ReturnType<typeof getDocument> | undefined, worker: PDFWorker | undefined) {
  let failed = false
  try {
    await task?.destroy()
  } catch {
    failed = true
  }
  try {
    worker?.destroy()
  } catch {
    failed = true
  }
  if (failed) throw new Error('PDF-behandlingen kunne ikke avsluttes. Prøv igjen.')
}

/** Uses bytes only; documentName is display metadata and is never opened as a path. */
export async function validatePdf(bytes: Uint8Array, documentName: string, profile: { maxPages: 30 | 200 } = { maxPages: 30 }): Promise<PdfFormatOutcome> {
  // Snapshot before awaiting: caller mutation and PDF.js buffer transfer must not change the original.
  const originalBytes = Uint8Array.from(bytes)
  const identity = { documentName, reportHash: createHash('sha256').update(originalBytes).digest('hex') }
  let task: ReturnType<typeof getDocument> | undefined
  let worker: PDFWorker | undefined
  try {
    // Own the worker so it is released even when transport destruction rejects.
    worker = new PDFWorker({ verbosity: VerbosityLevel.ERRORS })
    task = getDocument({ data: Uint8Array.from(originalBytes), worker, verbosity: VerbosityLevel.ERRORS })
    await task.promise
    const pageCount = await countPdfPages(originalBytes)
    if (pageCount === null) return failure(identity, 'invalid-container', null)
    if (pageCount > profile.maxPages) {
      const result = failure(identity, 'page-limit', pageCount)
      if (result.status === 'failed') result.error.reason = `PDF-en har mer enn ${profile.maxPages} sider. Velg en fil på høyst ${profile.maxPages} sider.`
      return result
    }
    if (!Number.isInteger(pageCount) || pageCount < 1) return failure(identity, 'invalid-container', null)
    // The Count-independent traversal also validates every actual page's metadata.
    return { ...identity, status: 'format-validated', originalBytes, pageCount }
  } catch (error) {
    // Operational failures must not claim the caller supplied a damaged PDF.
    if (!(error instanceof Error) || !['InvalidPDFException', 'PasswordException', 'UnknownErrorException'].includes(error.name)) {
      throw new Error('PDF-behandlingen kunne ikke gjennomføres. Prøv igjen.')
    }
    // Header is used only to describe a parser failure, never as proof of a valid PDF.
    const hasPdfHeader = Buffer.from(originalBytes.subarray(0, 1024)).includes('%PDF-')
    return failure(identity, hasPdfHeader ? 'invalid-container' : 'invalid-format', null)
  } finally {
    // Destroys the document transport, page caches and worker, including rejected loading tasks.
    await destroyResources(task, worker)
  }
}
