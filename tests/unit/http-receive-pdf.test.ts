import { Readable } from 'node:stream'
import type { IncomingMessage } from 'node:http'
import { describe, expect, it, vi } from 'vitest'
import { MAX_METADATA_BYTES, receivePdf } from '../../src/backend/http/receive-pdf.ts'

function input(chunks: Buffer[], type = 'multipart/form-data; boundary=unit-boundary') {
  const stream = Readable.from((async function* () {
    for (const chunk of chunks) { yield chunk; await new Promise(resolve => setImmediate(resolve)) }
  })()) as IncomingMessage
  stream.headers = { 'content-type': type }
  return stream
}
const prefix = '--unit-boundary\r\nContent-Disposition: form-data; name="file"; filename="fixture.bin"\r\nContent-Type: application/octet-stream'
const suffix = '\r\n--unit-boundary--\r\n'
const bytes = Buffer.from('%PDF-1.7\r\n--unit-boundaryNOT-A-DELIMITER\r\noriginal bytes')

describe('HTTP strømparser – eksakte metadata- og chunkgrenser', () => {
  it('hver eneste byte kan komme i separat chunk uten å endre originalen', async () => {
    const body = Buffer.concat([Buffer.from(prefix + '\r\n\r\n'), bytes, Buffer.from(suffix)])
    expect(await receivePdf(input(Array.from(body, byte => Buffer.from([byte]))))).toEqual({ bytes, documentName: 'fixture.bin' })
  })

  it.each([false, true])('hele metadata på/over 1 MiB, valgfri slutt-CRLF=%s', async finalCrlf => {
    const closing = Buffer.from(finalCrlf ? suffix : suffix.slice(0, -2))
    for (const extra of [0, 1]) {
      const header = Buffer.from(prefix + ' '.repeat(MAX_METADATA_BYTES - Buffer.byteLength(prefix) - 4 - closing.length + extra) + '\r\n\r\n')
      const request = input([header, bytes, ...Array.from(closing, byte => Buffer.from([byte]))])
      try {
        if (extra) await expect(receivePdf(request)).rejects.toMatchObject({ code: 'payload-too-large', status: 413 })
        else expect(await receivePdf(request)).toEqual({ bytes, documentName: 'fixture.bin' })
      } finally { request.destroy() }
    }
  })

  it('fragmentert stor metadata skannes én gang og små filchunks samles i faste blokker', async () => {
    const header = Buffer.from(prefix + ' '.repeat(MAX_METADATA_BYTES - Buffer.byteLength(prefix) - 4 - Buffer.byteLength(suffix)) + '\r\n\r\n')
    const file = Buffer.alloc(256 * 1024, 0x61)
    const stream = Readable.from((function* () {
      for (let offset = 0; offset < header.length; offset += 3) yield header.subarray(offset, offset + 3)
      for (let offset = 0; offset < file.length; offset += 3) yield file.subarray(offset, offset + 3)
      yield Buffer.from(suffix)
    })()) as IncomingMessage
    stream.headers = { 'content-type': 'multipart/form-data; boundary=unit-boundary' }
    const allocate = vi.spyOn(Buffer, 'allocUnsafe')
    const concat = vi.spyOn(Buffer, 'concat')
    try {
      expect(await receivePdf(stream)).toEqual({ bytes: file, documentName: 'fixture.bin' })
      // Header storage never grows with fragment count; four 64 KiB blocks hold the file.
      expect(allocate.mock.calls.filter(([size]) => size === MAX_METADATA_BYTES)).toHaveLength(1)
      expect(allocate.mock.calls.filter(([size]) => size === 64 * 1024)).toHaveLength(4)
      expect(concat.mock.calls.reduce((largest, [buffers]) => Math.max(largest, buffers.length), 0)).toBeLessThanOrEqual(4)
      // A single final file join; metadata fragments are never concatenated as a growing prefix.
      expect(concat.mock.calls.filter(([, length]) => length === file.length)).toHaveLength(1)
    } finally { allocate.mockRestore(); concat.mockRestore(); stream.destroy() }
  }, 10_000)

  it('multipart med en ekstra fil eller skjult felt kan aldri bli ett filresultat', async () => {
    for (const part of ['file', 'metadata']) {
      const body = Buffer.concat([Buffer.from(prefix + '\r\n\r\n'), bytes,
        Buffer.from(`\r\n--unit-boundary\r\nContent-Disposition: form-data; name="${part}"\r\n\r\nhidden${suffix}`)])
      const request = input([body])
      await expect(receivePdf(request)).rejects.toMatchObject({ code: 'invalid-request' })
      request.destroy()
    }
  })
})
