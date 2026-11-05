import { inflateSync } from 'node:zlib'
import type { DocumentBasis } from '../../contracts/document-analysis.ts'

type PageRecord = DocumentBasis['pages'][number]
export type Inspection = 'empty' | 'content' | 'unknown' | 'damaged' | 'limit'
export type TextItem = { str: string; hasEOL?: boolean }
export type TextChunk = { items: TextItem[] }
export type TextPage = {
  extractTextContent(options: object): Promise<void>
}

class DecodeBudgetExceeded extends Error {}

/** Strict enough to prove complete ASCII85 decoding; never accepts a missing terminator. */
function ascii85(bytes: Uint8Array, limit?: number): Uint8Array {
  // z expands one encoded byte to four decoded bytes. Bound before allocating,
  // and grow compact storage instead of retaining one JS number per byte.
  let result = new Uint8Array(Math.min(4096, limit ?? 4096))
  let used = 0
  const append = (byte: number) => {
    if (limit !== undefined && used >= limit) throw new DecodeBudgetExceeded()
    if (used === result.length) {
      const expanded = new Uint8Array(Math.min(Math.max(1, result.length * 2), limit ?? 0x7fffffff))
      expanded.set(result); result = expanded
    }
    result[used++] = byte
  }
  let group: number[] = []
  let ended = false
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i]
    if ([0, 9, 10, 12, 13, 32].includes(byte)) continue
    if (ended) throw new Error('Trailing ASCII85 data')
    if (byte === 126 && bytes[++i] === 62) { ended = true; continue }
    if (byte === 122 && group.length === 0) { append(0); append(0); append(0); append(0); continue }
    if (byte < 33 || byte > 117) throw new Error('Invalid ASCII85')
    group.push(byte - 33)
    if (group.length === 5) { flush(4); group = [] }
  }
  if (!ended || group.length === 1) throw new Error('Incomplete ASCII85')
  if (group.length) { const length = group.length; while (group.length < 5) group.push(84); flush(length - 1) }
  function flush(count: number) {
    const value = group.reduce((sum, digit) => sum * 85 + digit, 0)
    if (value > 0xffffffff) throw new Error('Invalid ASCII85 group')
    for (let n = 0; n < count; n++) append((value >>> (24 - n * 8)) & 255)
  }
  return result.subarray(0, used)
}

/** DecodeStreams grow their cache for the requested length before decoding.
 * Probe in small steps, then borrow the decoded view without copying it.
 */
export function readBoundedStream(stream: { pos: number; reset(): void; getBytes(length: number): Uint8Array }, limit: number): Uint8Array {
  stream.reset()
  let length = 0
  while (length <= limit) {
    const requested = Math.min(4096, limit + 1 - length)
    const chunk = stream.getBytes(requested)
    length += chunk.length
    if (chunk.length < requested || length > limit) break
  }
  stream.reset()
  return stream.getBytes(length)
}

/** Independent full decode prevents PDF.js's forgiving decoders from proving false emptiness. */
export function inspectStreamBytes(raw: Uint8Array, filters: string[], maxDecodedBytes?: number): Inspection {
  try {
    let bytes = raw
    for (const filter of filters) {
      if (filter === 'ASCII85Decode' || filter === 'A85') bytes = ascii85(bytes, maxDecodedBytes)
      else if (filter === 'FlateDecode' || filter === 'Fl') {
        const decoded = inflateSync(bytes, { info: true, ...(maxDecodedBytes ? { maxOutputLength: maxDecodedBytes } : {}) }) as unknown as { engine: { bytesWritten: number }; buffer: Uint8Array }
        if (decoded.engine.bytesWritten !== bytes.length) return 'damaged'
        bytes = decoded.buffer
      } else return 'unknown'
      if (maxDecodedBytes !== undefined && bytes.length > maxDecodedBytes) return 'limit'
    }
    if (maxDecodedBytes !== undefined && bytes.length > maxDecodedBytes) return 'limit'
    return bytes.every(byte => [0, 9, 10, 12, 13, 32].includes(byte)) ? 'empty' : 'content'
  } catch (error) {
    return error instanceof DecodeBudgetExceeded || error instanceof Error && 'code' in error && error.code === 'ERR_BUFFER_TOO_LARGE' ? 'limit' : 'damaged'
  }
}

/** A page-local extraction failure never removes that physical page or a delivered text chunk. */
export class TextBudgetExceeded extends Error {}
export interface TextBudget { pageBytes: number; totalBytes: number; used: number }

export async function extractPage(pdfPage: number, page: TextPage, inspection: Inspection,
  hasOtherContent: boolean | null, handler: object, task: object,
  diagnostics: () => 'loss' | 'uncertain' | null, budget?: TextBudget, onTextChunk?: (text: string, textBytes?: number) => void): Promise<PageRecord> {
  // Structural emptiness proves no text operators exist; avoid forgiving parser shortcuts.
  if (inspection === 'empty' && hasOtherContent === false && diagnostics() === null) return { pdfPage, text: '', status: 'blank', reason: null }
  const items: TextItem[] = []
  let rejected = false
  let pageBytes = 0
  let exceeded = false
  try {
    await page.extractTextContent({ handler, task, includeMarkedContent: false, disableNormalization: false,
      sink: { desiredSize: Infinity, ready: Promise.resolve(), enqueue(chunk: TextChunk) {
        // PDF.js reuses/empties its chunk arrays after enqueue.
        const delivered: string[] = []
        for (const item of chunk.items) {
          if (typeof item.str !== 'string') continue
          if (budget) {
            const count = Buffer.byteLength(item.str + (item.hasEOL ? '\n' : ''), 'utf8')
            pageBytes += count; budget.used += count
            if (pageBytes > budget.pageBytes || budget.used > budget.totalBytes) { exceeded = true; throw new TextBudgetExceeded('Tekstgrensen er overskredet.') }
          }
          items.push({ str: item.str, hasEOL: item.hasEOL })
          if (onTextChunk) delivered.push(item.str + (item.hasEOL ? '\n' : ''))
        }
        if (onTextChunk) {
          const text = delivered.join('')
          let deliveredQuota = (budget?.used ?? 0) - Buffer.byteLength(text)
          for (let start = 0; start < text.length;) {
            let end = Math.min(start + 4096, text.length)
            // Keep surrogate pairs together so UTF-8 counters stay exact.
            if (end < text.length && /[\uD800-\uDBFF]/.test(text[end - 1])) end--
            const delta = text.slice(start, end)
            deliveredQuota += Buffer.byteLength(delta)
            onTextChunk(delta, budget ? deliveredQuota : undefined); start = end
          }
        }
      } } })
  } catch { rejected = true }
  if (exceeded) throw new TextBudgetExceeded('Tekstgrensen er overskredet.')
  // PDF.js already supplies word/gap spaces; font changes can split one word.
  const text = items.map(item => item.str + (item.hasEOL ? '\n' : '')).join('')
  const hasText = text.trim().length > 0
  const diagnostic = diagnostics()
  const limitReason = inspection === 'limit' ? ' Innholdsstrømmens dekoding overskred grensen på 1 MiB.' : ''
  if ((rejected || inspection === 'damaged' || diagnostic === 'loss') && hasText) {
    return { pdfPage, text, status: 'incomplete', reason: 'Tekstuttrekket er kjent ufullstendig på denne PDF-siden.' + limitReason }
  }
  if (rejected || inspection === 'damaged' || diagnostic === 'loss') {
    return { pdfPage, text, status: 'unreadable', reason: 'Tekstlesingen ble avvist på denne PDF-siden.' + limitReason }
  }
  if (inspection === 'limit') return { pdfPage, text, status: 'unknown', reason: limitReason.trim() }
  if (inspection === 'unknown' || diagnostic === 'uncertain' || hasOtherContent === null) {
    return { pdfPage, text, status: 'unknown', reason: 'Sideinnholdet kunne ikke inspiseres fullstendig og pålitelig.' }
  }
  if (hasText) return { pdfPage, text, status: 'readable', reason: null }
  return { pdfPage, text, status: 'unreadable', reason: 'PDF-siden har innhold uten et lesbart tekstlag.' }
}
