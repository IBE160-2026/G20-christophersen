import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { parentPort, workerData } from 'node:worker_threads'

// PDF.js exposes no public Count-independent page-tree API. Keep this bridge
// coupled to the exact installed legacy bundle, without modifying it or PDF bytes.
const WORKER_SHA256 = 'bb422f60804477de4a0b09091d8347a916a387755ed1cbad24ccaec1d09c78bf'
type Manager = {
  pdfDocument: { xref: unknown; _globalIdFactory: unknown }
  initDocument(recoveryMode: boolean): Promise<void>
  ensureCatalog(method: 'getAllPageDicts', args: [boolean]): Promise<Map<number, [unknown, unknown]>>
  cleanup(): Promise<void>
  terminate(reason: Error): void
}
type ParserModule = {
  LocalPdfManager: new (options: object) => Manager
  Page: new (options: object) => { rotate: number; userUnit: number; view: number[] }
  setVerbosityLevel(level: number): void
}

let manager: Manager | undefined
let reply: { kind: 'counted'; pageCount: number } | { kind: 'invalid-container' } | { kind: 'unavailable' } = { kind: 'unavailable' }
try {
  const source = await readFile(new URL(import.meta.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs')), 'utf8')
  if (createHash('sha256').update(source).digest('hex') !== WORKER_SHA256) throw new Error('Incompatible PDF.js worker')
  // Trusted, hash-checked dependency code only. Isolation prevents the bundle's
  // global worker registration and parser caches from affecting the main process.
  const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(source + '\nexport { LocalPdfManager, Page, setVerbosityLevel };\n').toString('base64')
  const parser = await import(moduleUrl) as ParserModule
  parser.setVerbosityLevel(0)
  manager = new parser.LocalPdfManager({
    // The internal Stream parser assumes byteOffset=0 (the public loader also normalizes).
    docId: 'format-page-tree', source: Uint8Array.from(workerData), enableXfa: false, evaluatorOptions: {},
    handler: { send() {}, sendWithPromise() { return Promise.resolve(null) } },
  })
  try {
    await manager.initDocument(false)
  } catch (error) {
    if (!(error instanceof Error) || error.name !== 'XRefParseException') throw error
    await manager.initDocument(true) // Same xref-recovery path as the normal PDF.js loader.
  }
  const pages = await manager.ensureCatalog('getAllPageDicts', [false])
  // PDF.js can return an Error entry instead of rejecting a malformed page tree.
  for (const [pageIndex, [pageDict, ref]] of pages) {
    if (pageDict instanceof Error) throw pageDict
    // Same metadata access as PDF.js GetPage, for every actual leaf rather than
    // only declared positions. No rendering, content streams or text extraction.
    const page = new parser.Page({
      pdfManager: manager, xref: manager.pdfDocument.xref, pageIndex, pageDict, ref,
      globalIdFactory: manager.pdfDocument._globalIdFactory,
    })
    void page.rotate
    void page.userUnit
    void page.view
  }
  reply = pages.size > 0 ? { kind: 'counted', pageCount: pages.size } : { kind: 'invalid-container' }
} catch (error) {
  if (error instanceof Error && ['InvalidPDFException', 'PasswordException', 'FormatError', 'XRefEntryException', 'XRefParseException'].includes(error.name)) {
    reply = { kind: 'invalid-container' }
  }
} finally {
  try {
    manager?.terminate(new Error('Format inspection finished'))
    await manager?.cleanup()
  } catch {
    reply = { kind: 'unavailable' }
  }
}
parentPort?.postMessage(reply)
