import { Worker } from 'node:worker_threads'

type PageCountReply = { kind: 'counted'; pageCount: number } | { kind: 'invalid-container' } | { kind: 'unavailable' }
const unavailable = () => new Error('PDF-sidene kunne ikke kontrolleres. Prøv igjen.')

async function terminate(worker: Worker) {
  try {
    await worker.terminate()
  } catch {
    throw unavailable()
  }
}

/** Count-independent traversal in the pinned PDF.js parser; never transfers caller bytes. */
export async function countPdfPages(bytes: Uint8Array): Promise<number | null> {
  const worker = new Worker(new URL('./pdf-page-tree-worker.ts', import.meta.url), { workerData: bytes })
  try {
    return await new Promise<number | null>((resolve, reject) => {
      worker.once('message', (reply: PageCountReply) => {
        if (reply.kind === 'counted' && Number.isInteger(reply.pageCount) && reply.pageCount > 0) resolve(reply.pageCount)
        else if (reply.kind === 'invalid-container') resolve(null)
        else reject(unavailable())
      })
      worker.once('error', () => reject(unavailable()))
      worker.once('messageerror', () => reject(unavailable()))
      worker.once('exit', () => reject(unavailable()))
    })
  } finally {
    // Also releases all parser buffers/module state when startup, parsing or cleanup fails.
    await terminate(worker)
  }
}
