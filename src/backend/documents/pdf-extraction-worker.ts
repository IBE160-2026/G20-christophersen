import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { parentPort, workerData } from 'node:worker_threads'
import { extractPage, inspectStreamBytes } from './pdf-extraction-core.ts'
import type { Inspection, TextPage } from './pdf-extraction-core.ts'
import type { DocumentBasis } from '../../contracts/document-analysis.ts'

// Same exact, isolated parser bridge as Story 2.2; no regex interpretation of PDF bytes.
const WORKER_SHA256 = 'bb422f60804477de4a0b09091d8347a916a387755ed1cbad24ccaec1d09c78bf'
interface Dict {
  has(key: string): boolean
  get(key: string): unknown
  getRaw(key: string): unknown
  getKeys(): string[]
}
interface Stream {
  dict: Dict
  length: number
  pos: number
  getBytes(): Uint8Array
  reset(): void
  getOriginalStream(): Stream
}
interface Manager {
  pdfDocument: { xref: { fetchIfRef(value: unknown): unknown; getCatalogObj(): Dict; encrypt?: unknown }; _globalIdFactory: unknown; catalog: Record<string, unknown> }
  initDocument(recovery: boolean): Promise<void>
  ensureCatalog(method: string, args: boolean[]): Promise<Map<number, [Dict | Error, unknown]>>
  cleanup(): Promise<void>
  terminate(reason: Error): void
}
interface Parser {
  LocalPdfManager: new (options: object) => Manager
  Page: new (options: object) => TextPage
  Dict: new (...args: never[]) => Dict
  Ref: new (...args: never[]) => object
  Name: new (...args: never[]) => { name: string }
  BaseStream: new (...args: never[]) => Stream
  Stream: new (...args: never[]) => Stream
  DefaultPartialEvaluatorOptions: object
  WorkerTask: new (name: string) => { finish(): void; terminate(): void }
  setVerbosityLevel(level: number): void
}
let manager: Manager | undefined
let reply: { kind: 'extracted'; pages: DocumentBasis['pages'] } | { kind: 'unavailable' } = { kind: 'unavailable' }
const pages: DocumentBasis['pages'] = []
const originalWarn = console.warn
const originalInfo = console.info
let messages: string[] = []
// Diagnostics stay inside the isolated worker and are never returned as PDF/user text.
console.warn = console.info = (...args: unknown[]) => { messages.push(args.map(String).join(' ')) }
try {
  const source = await readFile(new URL(import.meta.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs')), 'utf8')
  if (createHash('sha256').update(source).digest('hex') !== WORKER_SHA256) throw new Error('Incompatible parser')
  const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(source + '\nexport { LocalPdfManager, Page, Dict, Ref, Name, BaseStream, Stream, DefaultPartialEvaluatorOptions, WorkerTask, setVerbosityLevel };\n').toString('base64')
  const parser = await import(moduleUrl) as Parser
  parser.setVerbosityLevel(5)
  const handler = {
    send() {},
    async sendWithPromise(kind: string, data: { kind?: string; filename?: string }) {
      if (kind === 'FetchBinaryData' && data.kind === 'standardFontDataUrl' && data.filename && /^[a-zA-Z0-9_.-]+$/.test(data.filename)) {
        return Uint8Array.from(await readFile(new URL(`./standard_fonts/${data.filename}`, import.meta.resolve('pdfjs-dist/package.json'))))
      }
      throw new Error('Unsupported parser resource request')
    },
  }
  manager = new parser.LocalPdfManager({ docId: 'extraction', source: Uint8Array.from(workerData.bytes), enableXfa: false,
    // Internal equivalent of public stopAtErrors:true; retain the pinned defaults.
    evaluatorOptions: { ...parser.DefaultPartialEvaluatorOptions, ignoreErrors: false, useWorkerFetch: false }, handler })
  try { await manager.initDocument(false) } catch (error) {
    if (!(error instanceof Error) || error.name !== 'XRefParseException') throw error
    await manager.initDocument(true)
  }
  const leaves = await manager.ensureCatalog('getAllPageDicts', [false])
  if (leaves.size !== workerData.pageCount) throw new Error('Changed physical page basis')
  const { xref, catalog } = manager.pdfDocument
  const resolve = (raw: unknown) => {
    const value = xref.fetchIfRef(raw)
    if (raw instanceof parser.Ref && value == null) throw new Error('Unresolved reference')
    return value
  }
  function inspectContents(dict: Dict): Inspection {
    try {
      if (!dict.has('Contents')) return 'empty'
      const content = resolve(dict.getRaw('Contents'))
      const streams = Array.isArray(content) ? content : [content]
      let result: Inspection = 'empty'
      for (const value of streams) {
        const stream = resolve(value)
        if (!(stream instanceof parser.BaseStream)) return 'unknown'
        if (xref.encrypt) return 'unknown' // Original stream bytes may still be encrypted.
        const raw = stream.getOriginalStream()
        // NullStream is a forgiving recovery, not proof of an empty original stream.
        if (!(raw instanceof parser.Stream)) return 'damaged'
        const declaredLength = resolve(stream.dict.getRaw('Length'))
        if (!Number.isInteger(declaredLength) || declaredLength !== raw.length) return 'unknown'
        const rawFilter = resolve(stream.dict.getRaw('Filter') ?? stream.dict.getRaw('F'))
        const filters = rawFilter == null ? [] : Array.isArray(rawFilter) ? rawFilter.map(resolve) : [rawFilter]
        if (!filters.every(filter => filter instanceof parser.Name)) return 'unknown'
        // Predictors/encryption need a separately verified decoder; never guess emptiness.
        if (resolve(stream.dict.getRaw('DecodeParms') ?? stream.dict.getRaw('DP')) != null) return 'unknown'
        const originalPosition = raw.pos
        raw.reset()
        const inspected = inspectStreamBytes(Uint8Array.from(raw.getBytes()), filters.map(filter => (filter as { name: string }).name))
        raw.pos = originalPosition
        if (inspected === 'damaged') return inspected
        if (inspected === 'unknown') result = inspected
        else if (inspected === 'content' && result !== 'unknown') result = inspected
      }
      return result
    } catch { return 'unknown' }
  }
  function otherContent(dict: Dict): boolean | null {
    try {
      // Unknown extensions cannot silently become a blank proof. These entries are
      // page-tree/metadata/presentation only; Contents and content-bearing keys are
      // inspected separately. Resources alone never paint a page.
      const nonContent = new Set(['Type', 'Parent', 'Kids', 'Count', 'LastModified', 'Resources',
        'MediaBox', 'CropBox', 'BleedBox', 'TrimBox', 'ArtBox', 'BoxColorInfo', 'Rotate',
        'Thumb', 'Dur', 'Trans', 'Metadata', 'StructParents', 'ID', 'PZ', 'Tabs', 'UserUnit', 'Contents'])
      const contentKeys = ['Annots', 'AA', 'PresSteps', 'VP', 'RichMedia', 'AP', 'XFA']
      // Read raw entries, not PDF.js's annotation normalizer (which drops malformed entries).
      let current: Dict | null = dict
      const seen = new Set<Dict>()
      while (current) {
        if (seen.has(current)) return null
        seen.add(current)
        if (current.getKeys().some(key => !nonContent.has(key) && !contentKeys.includes(key))) return null
        for (const key of contentKeys) {
          if (!current.has(key)) continue
          const value = resolve(current.getRaw(key))
          if (key === 'Annots') {
            if (!Array.isArray(value)) return null
            if (value.length === 0) continue
            if (value.some(item => !(resolve(item) instanceof parser.Dict))) return null
          }
          if (value == null) return null
          return true
        }
        const parent = current.has('Parent') ? resolve(current.getRaw('Parent')) : null
        if (parent !== null && !(parent instanceof parser.Dict)) return null
        current = parent as Dict | null
      }
      const root = xref.getCatalogObj()
      if (!(root instanceof parser.Dict)) return null
      const catalogMetadata = new Set(['Type', 'Pages', 'Version', 'PageLabels', 'Names', 'Dests',
        'PageLayout', 'PageMode', 'Outlines', 'ViewerPreferences', 'OpenAction', 'Metadata', 'MarkInfo',
        'StructTreeRoot', 'Lang', 'OutputIntents', 'Perms', 'AcroForm', 'XFA', 'NeedsRendering'])
      if (root.getKeys().some(key => !catalogMetadata.has(key))) return null
      if (root.has('XFA')) return null // Global XFA has no trustworthy physical-page mapping.
      if (root.has('NeedsRendering') && resolve(root.getRaw('NeedsRendering')) !== false) return null
      if (root.has('AcroForm')) {
        const form = resolve(root.getRaw('AcroForm'))
        if (!(form instanceof parser.Dict)) return null
        const defaults = new Set(['Fields', 'NeedAppearances', 'SigFlags', 'CO', 'DR', 'DA', 'Q'])
        if (form.getKeys().some(key => !defaults.has(key))) return null
        const fields = form.has('Fields') ? resolve(form.getRaw('Fields')) : []
        if (!Array.isArray(fields) || fields.length > 0) return null
        // Empty form scaffolding does not paint a page. Non-empty/global fields
        // need a mapping we have not established, so remain unknown above.
        for (const key of form.getKeys().filter(key => key !== 'Fields')) {
          const value = resolve(form.getRaw(key))
          if (key === 'CO' && (!Array.isArray(value) || value.length > 0)) return null
          if (key === 'DR' && !(value instanceof parser.Dict)) return null
          if (key === 'DA' && typeof value !== 'string') return null
          if (key === 'NeedAppearances' && typeof value !== 'boolean') return null
          if (['SigFlags', 'Q'].includes(key) && typeof value !== 'number') return null
        }
      }
      return false
    } catch { return null }
  }
  const documentMessages = [...messages]
  for (const [pageIndex, [dict, ref]] of leaves) {
    messages = [...documentMessages]
    if (dict instanceof Error) {
      pages.push({ pdfPage: pageIndex + 1, text: '', status: 'unknown', reason: 'PDF-sidens innhold kunne ikke kontrolleres.' })
      continue
    }
    const page = new parser.Page({ pdfManager: manager, xref, pageIndex, pageDict: dict, ref,
      globalIdFactory: manager.pdfDocument._globalIdFactory,
      ...Object.fromEntries(['fontCache', 'builtInCMapCache', 'standardFontDataCache', 'globalColorSpaceCache',
        'globalImageCache', 'systemFontCache', 'nonBlendModesSet'].map(key => [key, catalog[key]])) })
    const inspection = inspectContents(dict)
    const other = otherContent(dict)
    const task = new parser.WorkerTask(`Extract physical page ${pageIndex + 1}`)
    try {
      pages.push(await extractPage(pageIndex + 1, page, inspection, other, handler, task, () => {
        if (messages.some(message => /ignoring|Invalid stream|not available|failed/i.test(message))) return 'loss'
        return messages.length ? 'uncertain' : null
      }))
    } finally { task.terminate(); task.finish(); await manager.cleanup() }
  }
  reply = { kind: 'extracted', pages }
} catch {
  // A parser/mapping failure after startup cannot certify any physical page.
  // Preserve the trusted 2.2 positions; do not invent a damaged-document cause.
  if (manager) reply = { kind: 'extracted', pages: Array.from({ length: workerData.pageCount }, (_, index) => ({
    ...(pages[index] ?? { pdfPage: index + 1, text: '', status: 'unknown', reason: 'PDF-sidens innhold kunne ikke kontrolleres.' }),
  })) }
}
finally {
  try { manager?.terminate(new Error('Extraction finished')) } catch { reply = { kind: 'unavailable' } }
  try { await manager?.cleanup() } catch { reply = { kind: 'unavailable' } }
  console.warn = originalWarn
  console.info = originalInfo
}
parentPort?.postMessage(reply)
