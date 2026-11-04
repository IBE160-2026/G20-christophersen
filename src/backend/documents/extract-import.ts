import { Worker } from 'node:worker_threads'
import { z } from 'zod'
import { ImportPageSchema } from '../../contracts/document-import.ts'
import type { PdfFormatOutcome } from './validate-pdf.ts'

export class ImportFailure extends Error {
  readonly code: 'text-limit' | 'invalid-format' | 'page-limit' | 'unsupported-synthetic' | 'response-limit' | 'live-disabled' | 'memory-limit'
  constructor(code: ImportFailure['code']) { super(code); this.code = code }
}
const ReplySchema = z.strictObject({ kind: z.literal('extracted'), pages: z.array(ImportPageSchema).max(200),
  textBytes: z.number().int().min(0).max(1024 * 1024),
  attachments: z.array(z.strictObject({ id: z.string().max(1024), name: z.string().max(1024), isPdf: z.boolean() })).max(40) })

/** A worker lifetime bounds parser/font allocations, which cleanup alone cannot
 * return to the OS. Groups cover every physical page with one shared text budget.
 */
export async function extractImport(format: Extract<PdfFormatOutcome, { status: 'format-validated' }>) {
  const pages: z.infer<typeof ImportPageSchema>[] = []
  let attachments: z.infer<typeof ReplySchema>['attachments'] = []
  let textBytes = 0
  for (let startPage = 0; startPage < format.pageCount; startPage += 20) {
    const endPage = Math.min(startPage + 20, format.pageCount)
    // Transfer a dedicated copy: the original snapshot remains owned by the
    // request, while structured cloning and the parser make no extra byte copies.
    const bytes = Uint8Array.from(format.originalBytes)
    const worker = new Worker(new URL('./pdf-extraction-worker.ts', import.meta.url), {
      workerData: { bytes, pageCount: format.pageCount, importProfile: true, startPage, endPage, textBytes },
      transferList: [bytes.buffer], resourceLimits: { maxOldGenerationSizeMb: 256 },
    })
    try {
      const group = await new Promise<z.infer<typeof ReplySchema>>((resolve, reject) => {
        const fail = () => reject(new ImportFailure('invalid-format'))
        worker.once('message', value => {
          if (value?.kind === 'text-limit') { reject(new ImportFailure('text-limit')); return }
          const parsed = ReplySchema.safeParse(value)
          if (parsed.success && parsed.data.textBytes >= textBytes && parsed.data.pages.length === endPage - startPage
            && parsed.data.pages.every((page, index) => page.pdfPage === startPage + index + 1)) resolve(parsed.data)
          else fail()
        })
        worker.once('error', fail); worker.once('messageerror', fail); worker.once('exit', fail)
      })
      pages.push(...group.pages)
      textBytes = group.textBytes
      if (startPage === 0) attachments = group.attachments
    } finally {
      // Await termination before starting another parser, even on malformed replies.
      await worker.terminate()
    }
  }
  return { kind: 'extracted' as const, pages, attachments }
}
