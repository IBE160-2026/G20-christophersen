import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { parentPort, workerData } from 'node:worker_threads'
import { extractPage, inspectStreamBytes, TextBudgetExceeded } from './pdf-extraction-core.ts'
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
  getBytes(length?: number): Uint8Array
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
  Stream: new (bytes: Uint8Array) => Stream
  Lexer: new (stream: Stream, commands: object) => { getObj(): unknown }
  EvaluatorPreprocessor: { opMap: object }
  Cmd: new (...args: never[]) => { cmd: string }
  EOF: unknown
  DefaultPartialEvaluatorOptions: object
  WorkerTask: new (name: string) => { finish(): void; terminate(): void }
  setVerbosityLevel(level: number): void
}
let manager: Manager | undefined
let reply: { kind: 'extracted'; pages: DocumentBasis['pages']; attachments?: { id: string; name: string; isPdf: boolean }[] } | { kind: 'unavailable' | 'text-limit' } = { kind: 'unavailable' }
const pages: (DocumentBasis['pages'][number] & { rasterUnprocessed?: boolean })[] = []
const originalWarn = console.warn
const originalInfo = console.info
let messages: string[] = []
// Diagnostics stay inside the isolated worker and are never returned as PDF/user text.
console.warn = console.info = (...args: unknown[]) => { messages.push(args.map(String).join(' ')) }
try {
  const source = await readFile(new URL(import.meta.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs')), 'utf8')
  if (createHash('sha256').update(source).digest('hex') !== WORKER_SHA256) throw new Error('Incompatible parser')
  const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(source + '\nexport { LocalPdfManager, Page, Dict, Ref, Name, BaseStream, Stream, DefaultPartialEvaluatorOptions, WorkerTask, setVerbosityLevel, Lexer, Cmd, EOF, EvaluatorPreprocessor };\n').toString('base64')
  const parser = await import(moduleUrl) as Parser
  parser.setVerbosityLevel(5)
  const handler = {
    send() {},
    async sendWithPromise(kind: string, data: { kind?: string; filename?: string }) {
      const directory = data.kind === 'standardFontDataUrl' ? 'standard_fonts' : data.kind === 'cMapUrl' ? 'cmaps' : null
      if (kind === 'FetchBinaryData' && directory && data.filename && /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(data.filename)) {
        return Uint8Array.from(await readFile(new URL(`./${directory}/${data.filename}`, import.meta.resolve('pdfjs-dist/package.json'))))
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
  const bounded = workerData.importProfile === true
  const budget = bounded ? { pageBytes: 128 * 1024, totalBytes: 1024 * 1024, used: 0 } : undefined
  // Pinned Catalog.attachments contains FileSpec.serializable metadata only. Never request attachmentContent.
  const attachments: { id: string; name: string; isPdf: boolean }[] = []
  if (bounded && catalog.attachments instanceof Map) {
    if (catalog.attachments.size > 40) throw new TextBudgetExceeded()
    for (const [id, metadata] of catalog.attachments as Map<string, { filename?: string }>) {
      const name = metadata.filename ?? id
      if (Buffer.byteLength(id) > 1024 || Buffer.byteLength(name) > 1024) throw new TextBudgetExceeded()
      attachments.push({ id, name, isPdf: /\.pdf$/i.test(name) })
    }
  }
  const resolve = (raw: unknown) => {
    const value = xref.fetchIfRef(raw)
    if (raw instanceof parser.Ref && value == null) throw new Error('Unresolved reference')
    return value
  }
  function inspectContents(dict: Dict): { status: Inspection; reason: string | null } {
    const resultOf = (status: Inspection, reason: string | null = null) => ({ status, reason })
    try {
      if (!dict.has('Contents')) return resultOf('empty')
      const content = resolve(dict.getRaw('Contents'))
      const streams = Array.isArray(content) ? content : [content]
      let result: Inspection = 'empty'
      for (const value of streams) {
        const stream = resolve(value)
        if (!(stream instanceof parser.BaseStream)) return resultOf('unknown', 'Innholdsstrømmens struktur eller referanse kunne ikke kontrolleres.')
        if (xref.encrypt) return resultOf('unknown', 'Kryptert innholdsstrøm kunne ikke verifiseres uavhengig.') // Original stream bytes may still be encrypted.
        const raw = stream.getOriginalStream()
        // NullStream is a forgiving recovery, not proof of an empty original stream.
        if (!(raw instanceof parser.Stream)) return resultOf('damaged')
        const declaredLength = resolve(stream.dict.getRaw('Length'))
        if (!Number.isInteger(declaredLength) || declaredLength !== raw.length) return resultOf('unknown', 'Innholdsstrømmens deklarerte lengde kunne ikke verifiseres.')
        const rawFilter = resolve(stream.dict.getRaw('Filter') ?? stream.dict.getRaw('F'))
        const filters = rawFilter == null ? [] : Array.isArray(rawFilter) ? rawFilter.map(resolve) : [rawFilter]
        if (!filters.every(filter => filter instanceof parser.Name)) return resultOf('unknown', 'Innholdsstrømmens filterstruktur kunne ikke kontrolleres.')
        // Predictors/encryption need a separately verified decoder; never guess emptiness.
        if (resolve(stream.dict.getRaw('DecodeParms') ?? stream.dict.getRaw('DP')) != null) return resultOf('unknown', 'Innholdsstrømmens dekodingsparametre er ikke uavhengig verifisert.')
        const originalPosition = raw.pos
        raw.reset()
        const inspected = inspectStreamBytes(Uint8Array.from(raw.getBytes()), filters.map(filter => (filter as { name: string }).name), bounded ? 1024 * 1024 : undefined)
        raw.pos = originalPosition
        if (inspected === 'damaged') return resultOf(inspected)
        if (inspected === 'unknown') result = inspected
        else if (inspected === 'content' && result !== 'unknown') result = inspected
      }
      return resultOf(result, result === 'unknown' ? 'Innholdsstrømmens dekoding er ikke uavhengig verifisert.' : null)
    } catch { return resultOf('unknown', 'Innholdsstrømmens struktur eller referanse kunne ikke kontrolleres.') }
  }
  function otherContent(dict: Dict): { content: boolean | null; textLoss: boolean; uncertainAnnotation: boolean; reason: string | null } {
    let content = false
    let textLoss = false
    let uncertainAnnotation = false
    const unknown = () => ({ content: null, textLoss, uncertainAnnotation, reason: 'Annet sideinnhold, skjemastruktur eller referanse kunne ikke kontrolleres fullstendig.' })
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
        if (seen.has(current)) return unknown()
        seen.add(current)
        if (current.getKeys().some(key => !nonContent.has(key) && !contentKeys.includes(key))) return unknown()
        for (const key of contentKeys) {
          if (!current.has(key)) continue
          const value = resolve(current.getRaw(key))
          if (key === 'Annots') {
            if (!Array.isArray(value)) return unknown()
            if (value.length === 0) continue
            for (const item of value) {
              const annotation = resolve(item)
              if (!(annotation instanceof parser.Dict)) return unknown()
              const subtype = resolve(annotation.getRaw('Subtype'))
              // Any uninspected appearance can carry selectable PDF text, not
              // just FreeText. Widget types/values may also be inherited.
              if (annotation.has('AP') || (subtype instanceof parser.Name && subtype.name === 'Widget')) uncertainAnnotation = true
              const fieldType = resolve(annotation.getRaw('FT'))
              if (subtype instanceof parser.Name && (subtype.name === 'FreeText' ||
                (subtype.name === 'Widget' && fieldType instanceof parser.Name && fieldType.name === 'Tx'))) {
                const annotationText = resolve(annotation.getRaw(subtype.name === 'FreeText' ? 'Contents' : 'V'))
                // Page.extractTextContent reads Contents, never annotation appearances/values.
                if (typeof annotationText === 'string' && annotationText.trim()) textLoss = true
                else uncertainAnnotation = true
              }
            }
          }
          if (value == null) return unknown()
          content = true
        }
        const parent = current.has('Parent') ? resolve(current.getRaw('Parent')) : null
        if (parent !== null && !(parent instanceof parser.Dict)) return unknown()
        current = parent as Dict | null
      }
      const root = xref.getCatalogObj()
      if (!(root instanceof parser.Dict)) return unknown()
      const catalogMetadata = new Set(['Type', 'Pages', 'Version', 'PageLabels', 'Names', 'Dests',
        'PageLayout', 'PageMode', 'Outlines', 'ViewerPreferences', 'OpenAction', 'Metadata', 'MarkInfo',
        'StructTreeRoot', 'Lang', 'OutputIntents', 'Perms', 'AcroForm', 'XFA', 'NeedsRendering'])
      if (root.getKeys().some(key => !catalogMetadata.has(key))) return unknown()
      if (root.has('XFA')) return unknown() // Global XFA has no trustworthy physical-page mapping.
      if (root.has('NeedsRendering') && resolve(root.getRaw('NeedsRendering')) !== false) return unknown()
      if (root.has('AcroForm')) {
        const form = resolve(root.getRaw('AcroForm'))
        if (!(form instanceof parser.Dict)) return unknown()
        const defaults = new Set(['Fields', 'NeedAppearances', 'SigFlags', 'CO', 'DR', 'DA', 'Q'])
        if (form.getKeys().some(key => !defaults.has(key))) return unknown()
        const fields = form.has('Fields') ? resolve(form.getRaw('Fields')) : []
        if (!Array.isArray(fields) || fields.length > 0) return unknown()
        // Empty form scaffolding does not paint a page. Non-empty/global fields
        // need a mapping we have not established, so remain unknown above.
        for (const key of form.getKeys().filter(key => key !== 'Fields')) {
          const value = resolve(form.getRaw(key))
          if (key === 'CO' && (!Array.isArray(value) || value.length > 0)) return unknown()
          if (key === 'DR' && !(value instanceof parser.Dict)) return unknown()
          if (key === 'DA' && typeof value !== 'string') return unknown()
          if (key === 'NeedAppearances' && typeof value !== 'boolean') return unknown()
          if (['SigFlags', 'Q'].includes(key) && typeof value !== 'number') return unknown()
        }
      }
      return { content, textLoss, uncertainAnnotation, reason: null }
    } catch { return unknown() }
  }
  // Conservatively mark raster-bearing pages even when a digital footer exists.
  function raster(dict: Dict): boolean {
    const visited = new Set<unknown>()
    const inline = (stream: Stream) => {
      const position = stream.pos
      try {
        stream.reset()
        const bytes = Uint8Array.from(stream.getBytes(1024 * 1024 + 1))
        if (bytes.length > 1024 * 1024) return true
        const lexer = new parser.Lexer(new parser.Stream(bytes), parser.EvaluatorPreprocessor.opMap)
        for (let tokens = 0; tokens < 250_000; tokens++) {
          const token = lexer.getObj()
          if (token === parser.EOF) return false
          // Stop before consuming image bytes. Strings, names and comments are not commands.
          if (token instanceof parser.Cmd && token.cmd === 'BI') return true
        }
        return true
      } catch { return true } finally { stream.pos = position }
    }
    const inspect = (resources: unknown, depth: number): boolean => {
      if (depth > 16) return true
      const resolved = resolve(resources)
      if (!(resolved instanceof parser.Dict)) return false
      const objects = resolve(resolved.getRaw('XObject'))
      if (!(objects instanceof parser.Dict)) return false
      for (const key of objects.getKeys()) {
        const value = resolve(objects.getRaw(key))
        if (visited.has(value)) continue
        visited.add(value)
        if (value instanceof parser.BaseStream) {
          const subtype = resolve(value.dict.getRaw('Subtype'))
          if (subtype instanceof parser.Name && subtype.name === 'Image') return true
          if (subtype instanceof parser.Name && subtype.name === 'Form' && (inline(value) || inspect(value.dict.getRaw('Resources'), depth + 1))) return true
        }
      }
      return false
    }
    try {
      const contents = resolve(dict.getRaw('Contents'))
      for (const item of Array.isArray(contents) ? contents : contents == null ? [] : [contents]) {
        const stream = resolve(item)
        if (!(stream instanceof parser.BaseStream) || inline(stream)) return true
      }
      let current: Dict | null = dict
      while (current) {
        if (inspect(current.getRaw('Resources'), 0)) return true
        current = current.has('Parent') ? resolve(current.getRaw('Parent')) as Dict : null
      }
      return false
    } catch { return true }
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
      const extracted = await extractPage(pageIndex + 1, page, inspection.status, other.content, handler, task, () => {
        if (other.textLoss) return 'loss'
        if (messages.some(message => /ignoring|Invalid stream|not available|failed/i.test(message))) return 'loss'
        return messages.length ? 'uncertain' : null
      }, budget)
      // Text-layer reliability and unprocessed raster are independent in the new envelope.
      // A logo must not hide usable economy text; raster inside the report still blocks coverage.
      if (bounded) Object.assign(extracted, { rasterUnprocessed: raster(dict) })
      if (extracted.status === 'readable' && other.uncertainAnnotation) {
        extracted.status = 'unknown'
        extracted.reason = 'Annotasjonens tekstgrunnlag kunne ikke kontrolleres fullstendig.'
      }
      if (extracted.status === 'unknown') extracted.reason = inspection.reason ?? other.reason ?? extracted.reason
      pages.push(extracted)
    } finally { task.terminate(); task.finish(); await manager.cleanup() }
  }
  reply = { kind: 'extracted', pages, ...(bounded ? { attachments } : {}) }
} catch (error) {
  // A parser/mapping failure after startup cannot certify any physical page.
  // Preserve the trusted 2.2 positions; do not invent a damaged-document cause.
  if (error instanceof TextBudgetExceeded) reply = { kind: 'text-limit' }
  else if (manager) reply = { kind: 'extracted', pages: Array.from({ length: workerData.pageCount }, (_, index) => ({
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
