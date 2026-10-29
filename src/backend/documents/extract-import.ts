import { Worker } from 'node:worker_threads'
import { z } from 'zod'
import { ImportPageSchema } from '../../contracts/document-import.ts'
import type { PdfFormatOutcome } from './validate-pdf.ts'

export class ImportFailure extends Error {
  readonly code: 'text-limit' | 'invalid-format' | 'page-limit' | 'unsupported-synthetic' | 'response-limit' | 'live-disabled' | 'memory-limit'
  constructor(code: ImportFailure['code']) { super(code); this.code = code }
}
const ReplySchema = z.strictObject({ kind: z.literal('extracted'), pages: z.array(ImportPageSchema).max(200),
  attachments: z.array(z.strictObject({ id: z.string().max(1024), name: z.string().max(1024), isPdf: z.boolean() })).max(40) })
export async function extractImport(format: Extract<PdfFormatOutcome, { status: 'format-validated' }>) {
  const worker = new Worker(new URL('./pdf-extraction-worker.ts', import.meta.url), {
    workerData: { bytes: Uint8Array.from(format.originalBytes), pageCount: format.pageCount, importProfile: true },
    resourceLimits: { maxOldGenerationSizeMb: 256 },
  })
  try {
    return await new Promise<z.infer<typeof ReplySchema>>((resolve, reject) => {
      const fail = () => reject(new ImportFailure('invalid-format'))
      worker.once('message', value => {
        if (value?.kind === 'text-limit') { reject(new ImportFailure('text-limit')); return }
        const parsed = ReplySchema.safeParse(value)
        if (parsed.success && parsed.data.pages.length === format.pageCount && parsed.data.pages.every((page, index) => page.pdfPage === index + 1)) resolve(parsed.data)
        else fail()
      })
      worker.once('error', fail); worker.once('messageerror', fail); worker.once('exit', fail)
    })
  } finally { await worker.terminate() }
}
