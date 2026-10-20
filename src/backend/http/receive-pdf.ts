import type { IncomingMessage } from 'node:http'
import type { AnalysisHttpRejectionCode } from '../../contracts/analysis-http.ts'

export const MAX_PDF_BYTES = 50 * 1024 * 1024
export const MAX_METADATA_BYTES = 1024 * 1024
export class HttpRejection extends Error {
  readonly code: AnalysisHttpRejectionCode
  readonly status: number
  constructor(code: AnalysisHttpRejectionCode, status = 400) {
    super(code)
    this.code = code
    this.status = status
  }
}
const invalid = () => new HttpRejection('invalid-request')
const tooLarge = () => new HttpRejection('payload-too-large', 413)

function knownLength(value: string | string[] | undefined): number | undefined {
  return typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : undefined
}

/** Bounded framing and fixed-size file blocks; never spool uploaded content to disk. */
export async function receivePdf(request: IncomingMessage): Promise<{ bytes: Buffer; documentName: string }> {
  const contentType = request.headers['content-type'] ?? ''
  const match = /^multipart\/form-data;\s*boundary=(?:"([A-Za-z0-9'()+_,./:=? -]{1,70})"|([A-Za-z0-9'()+_,./:=?-]{1,70}))$/i.exec(contentType)
  if (!match) {
    // Ordinary JSON/metadata has its own inclusive 1 MiB cap, never the PDF cap.
    if ((knownLength(request.headers['content-length']) ?? 0) > MAX_METADATA_BYTES) throw tooLarge()
    let length = 0
    for await (const chunk of request.iterator({ destroyOnReturn: false })) {
      length += Buffer.byteLength(chunk)
      if (length > MAX_METADATA_BYTES) throw tooLarge()
    }
    throw new HttpRejection('unsupported-media-type', 415)
  }
  const boundary = match[1] ?? match[2]!
  const start = Buffer.from(`--${boundary}\r\n`)
  const delimiter = Buffer.from(`\r\n--${boundary}`)
  // Total length alone proves excess only above both allowed file and framing budgets.
  if ((knownLength(request.headers['content-length']) ?? 0) > MAX_PDF_BYTES + MAX_METADATA_BYTES) throw tooLarge()
  let pending = Buffer.alloc(0)
  // A single bounded header buffer avoids rebuilding/rescanning a growing prefix.
  let header: Buffer | undefined = Buffer.allocUnsafe(MAX_METADATA_BYTES)
  let headerLength = 0
  let headerWindow = 0
  const blocks: Buffer[] = []
  const blockSize = 64 * 1024
  let block: Buffer | undefined
  let blockLength = 0
  let fileBytes = 0
  let metadataBytes = 0
  let state: 'headers' | 'file' | 'ending' = 'headers'
  let documentName = ''
  const countMetadata = (length: number) => {
    metadataBytes += length
    if (metadataBytes > MAX_METADATA_BYTES) throw tooLarge()
  }
  const append = (chunk: Buffer) => {
    if (fileBytes + chunk.length > MAX_PDF_BYTES) throw tooLarge()
    fileBytes += chunk.length
    let offset = 0
    while (offset < chunk.length) {
      block ??= Buffer.allocUnsafe(blockSize)
      const length = Math.min(blockSize - blockLength, chunk.length - offset)
      chunk.copy(block, blockLength, offset, offset + length)
      blockLength += length
      offset += length
      if (blockLength === blockSize) {
        blocks.push(block)
        block = undefined
        blockLength = 0
      }
    }
  }
  try {
    for await (const raw of request.iterator({ destroyOnReturn: false })) {
      const chunk = Buffer.isBuffer(raw) ? raw : Buffer.from(raw)
      let offset = 0
      if (state === 'headers') {
        while (offset < chunk.length && state === 'headers') {
          countMetadata(1)
          const byte = chunk[offset++]!
          header![headerLength++] = byte
          headerWindow = ((headerWindow << 8) | byte) >>> 0
          if (headerWindow !== 0x0d0a0d0a) continue
          const end = headerLength - 4
          if (!header!.subarray(0, start.length).equals(start)) throw invalid()
          const lines = header!.subarray(start.length, end).toString('utf8').split('\r\n')
          const headers = new Map<string, string>()
          for (const line of lines) {
            const field = /^([A-Za-z-]+):[ \t]*(.*)$/.exec(line)
            if (!field) throw invalid()
            const key = field[1]!.toLowerCase()
            if (!['content-disposition', 'content-type', 'content-length'].includes(key) || headers.has(key)) throw invalid()
            headers.set(key, field[2]!)
          }
          // eslint-disable-next-line no-control-regex -- Reject control bytes in display filenames.
          const disposition = /^form-data;\s*name="file";\s*filename="([^"\r\n\x00-\x1f]{1,255})"$/i.exec(headers.get('content-disposition') ?? '')
          if (!disposition) throw invalid()
          documentName = disposition[1]!.trim()
          if (!documentName) throw invalid()
          if ((knownLength(headers.get('content-length')) ?? 0) > MAX_PDF_BYTES) throw tooLarge()
          // Etter headerne er bare én fil og den begrensede sluttmarkøren tillatt.
          const totalLength = knownLength(request.headers['content-length'])
          if (totalLength !== undefined && totalLength - metadataBytes - delimiter.length - 4 > MAX_PDF_BYTES) throw tooLarge()
          // Name/MIME never decide PDF validity. Container validation follows in isolation.
          header = undefined
          state = 'file'
        }
        if (state === 'headers') continue
      }
      if (state === 'file') {
        pending = pending.length ? Buffer.concat([pending, chunk.subarray(offset)]) : chunk.subarray(offset)
        // A boundary-like sequence in the binary file is data unless its MIME suffix is valid.
        let end = pending.indexOf(delimiter)
        while (end >= 0) {
          const suffix = pending.subarray(end + delimiter.length, end + delimiter.length + 2)
          if (suffix.equals(Buffer.from('--')) || suffix.equals(Buffer.from('\r\n'))) break
          end = pending.indexOf(delimiter, end + 1)
        }
        if (end >= 0) {
          append(pending.subarray(0, end))
          countMetadata(delimiter.length)
          const tail = pending.subarray(end + delimiter.length)
          countMetadata(tail.length)
          pending = Buffer.from(tail)
          state = 'ending'
        } else {
          const safe = Math.max(0, pending.length - delimiter.length - 1)
          append(pending.subarray(0, safe))
          pending = Buffer.from(pending.subarray(safe))
        }
      } else if (state === 'ending') {
        countMetadata(chunk.length)
        pending = Buffer.concat([pending, chunk])
      }
      if (state === 'ending') {
        // Exactly a final --, optionally followed by CRLF; no other part or epilogue.
        const ending = Buffer.from('--\r\n')
        if (pending.length > ending.length || !pending.equals(ending.subarray(0, pending.length))) throw invalid()
      }
    }
    if (state !== 'ending' || (pending.length !== 2 && pending.length !== 4)) throw invalid()
    if (fileBytes === 0) throw invalid()
    if (block) blocks.push(block.subarray(0, blockLength))
    return { bytes: Buffer.concat(blocks, fileBytes), documentName }
  } finally {
    blocks.length = 0
    block = undefined
    header = undefined
    pending = Buffer.alloc(0)
  }
}
