import { parentPort, workerData } from 'node:worker_threads'
import { getDocument, PDFWorker, VerbosityLevel } from 'pdfjs-dist/legacy/build/pdf.mjs'

let task: ReturnType<typeof getDocument> | undefined
let worker: PDFWorker | undefined
let reply: { kind: 'opened' | 'unavailable' } | { kind: 'invalid'; name: string } = { kind: 'unavailable' }
try {
  worker = new PDFWorker({ verbosity: VerbosityLevel.ERRORS })
  task = getDocument({ data: workerData, worker, verbosity: VerbosityLevel.ERRORS })
  await task.promise
  reply = { kind: 'opened' }
} catch (error) {
  if (error instanceof Error && ['InvalidPDFException', 'PasswordException', 'UnknownErrorException'].includes(error.name)) reply = { kind: 'invalid', name: error.name }
} finally {
  try { await task?.destroy() } catch { reply = { kind: 'unavailable' } }
  try { worker?.destroy() } catch { reply = { kind: 'unavailable' } }
}
parentPort?.postMessage(reply)
