import { createHash } from 'node:crypto'
import { getDocument, VerbosityLevel } from 'pdfjs-dist/legacy/build/pdf.mjs'
import type { AnalysisError } from '../../contracts/document-analysis.ts'

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

/** Uses bytes only; documentName is display metadata and is never opened as a path. */
export async function validatePdf(bytes: Uint8Array, documentName: string): Promise<PdfFormatOutcome> {
  // Snapshot before awaiting: caller mutation and PDF.js buffer transfer must not change the original.
  const originalBytes = Uint8Array.from(bytes)
  const identity = { documentName, reportHash: createHash('sha256').update(originalBytes).digest('hex') }
  let task: ReturnType<typeof getDocument> | undefined
  try {
    task = getDocument({ data: Uint8Array.from(originalBytes), verbosity: VerbosityLevel.ERRORS })
    const document = await task.promise
    const pageCount = document.numPages
    if (pageCount > 30) return failure(identity, 'page-limit', pageCount)
    if (!Number.isInteger(pageCount) || pageCount < 1) return failure(identity, 'invalid-container', null)
    return { ...identity, status: 'format-validated', originalBytes, pageCount }
  } catch {
    // Header is used only to describe a parser failure, never as proof of a valid PDF.
    const hasPdfHeader = Buffer.from(originalBytes.subarray(0, 1024)).includes('%PDF-')
    return failure(identity, hasPdfHeader ? 'invalid-container' : 'invalid-format', null)
  } finally {
    // Destroys the document transport, page caches and worker, including rejected loading tasks.
    await task?.destroy()
  }
}
