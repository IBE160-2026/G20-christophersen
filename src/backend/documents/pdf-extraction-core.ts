import { inflateSync } from 'node:zlib'
import type { DocumentBasis } from '../../contracts/document-analysis.ts'

type PageRecord = DocumentBasis['pages'][number]
export type Inspection = 'empty' | 'content' | 'unknown' | 'damaged'
export type TextItem = { str: string; hasEOL?: boolean }
export type TextChunk = { items: TextItem[] }
export type TextPage = {
  extractTextContent(options: object): Promise<void>
}

/** Strict enough to prove complete ASCII85 decoding; never accepts a missing terminator. */
function ascii85(bytes: Uint8Array): Uint8Array {
  const result: number[] = []
  let group: number[] = []
  let ended = false
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i]
    if ([0, 9, 10, 12, 13, 32].includes(byte)) continue
    if (ended) throw new Error('Trailing ASCII85 data')
    if (byte === 126 && bytes[++i] === 62) { ended = true; continue }
    if (byte === 122 && group.length === 0) { result.push(0, 0, 0, 0); continue }
    if (byte < 33 || byte > 117) throw new Error('Invalid ASCII85')
    group.push(byte - 33)
    if (group.length === 5) { flush(4); group = [] }
  }
  if (!ended || group.length === 1) throw new Error('Incomplete ASCII85')
  if (group.length) { const length = group.length; while (group.length < 5) group.push(84); flush(length - 1) }
  function flush(count: number) {
    const value = group.reduce((sum, digit) => sum * 85 + digit, 0)
    if (value > 0xffffffff) throw new Error('Invalid ASCII85 group')
    for (let n = 0; n < count; n++) result.push((value >>> (24 - n * 8)) & 255)
  }
  return Uint8Array.from(result)
}

/** Independent full decode prevents PDF.js's forgiving decoders from proving false emptiness. */
export function inspectStreamBytes(raw: Uint8Array, filters: string[]): Inspection {
  try {
    let bytes = raw
    for (const filter of filters) {
      if (filter === 'ASCII85Decode' || filter === 'A85') bytes = ascii85(bytes)
      else if (filter === 'FlateDecode' || filter === 'Fl') {
        const decoded = inflateSync(bytes, { info: true }) as unknown as { engine: { bytesWritten: number }; buffer: Uint8Array }
        if (decoded.engine.bytesWritten !== bytes.length) return 'damaged'
        bytes = decoded.buffer
      } else return 'unknown'
    }
    return bytes.every(byte => [0, 9, 10, 12, 13, 32].includes(byte)) ? 'empty' : 'content'
  } catch { return 'damaged' }
}

/** A page-local extraction failure never removes that physical page or a delivered text chunk. */
export async function extractPage(pdfPage: number, page: TextPage, inspection: Inspection,
  hasOtherContent: boolean | null, handler: object, task: object,
  diagnostics: () => 'loss' | 'uncertain' | null): Promise<PageRecord> {
  // Structural emptiness proves no text operators exist; avoid forgiving parser shortcuts.
  if (inspection === 'empty' && hasOtherContent === false && diagnostics() === null) return { pdfPage, text: '', status: 'blank', reason: null }
  const items: TextItem[] = []
  let rejected = false
  try {
    await page.extractTextContent({ handler, task, includeMarkedContent: false, disableNormalization: false,
      sink: { desiredSize: Infinity, ready: Promise.resolve(), enqueue(chunk: TextChunk) {
        // PDF.js reuses/empties its chunk arrays after enqueue.
        items.push(...chunk.items.filter(item => typeof item.str === 'string').map(item => ({ str: item.str, hasEOL: item.hasEOL })))
      } } })
  } catch { rejected = true }
  const text = items.map(item => item.str + (item.hasEOL ? '\n' : ' ')).join('')
  const hasText = text.trim().length > 0
  const diagnostic = diagnostics()
  if ((rejected || inspection === 'damaged' || diagnostic === 'loss') && hasText) {
    return { pdfPage, text, status: 'incomplete', reason: 'Tekstuttrekket er kjent ufullstendig på denne PDF-siden.' }
  }
  if (rejected || inspection === 'damaged' || diagnostic === 'loss') {
    return { pdfPage, text, status: 'unreadable', reason: 'Tekstlesingen ble avvist på denne PDF-siden.' }
  }
  if (inspection === 'unknown' || diagnostic === 'uncertain' || hasOtherContent === null) {
    return { pdfPage, text, status: 'unknown', reason: 'Sideinnholdet kunne ikke inspiseres fullstendig og pålitelig.' }
  }
  if (hasText) return { pdfPage, text, status: 'readable', reason: null }
  return { pdfPage, text, status: 'unreadable', reason: 'PDF-siden har innhold uten et lesbart tekstlag.' }
}
