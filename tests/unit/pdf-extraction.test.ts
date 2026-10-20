import { deflateSync } from 'node:zlib'
import { describe, expect, it, vi } from 'vitest'
import { extractPage, inspectStreamBytes } from '../../src/backend/documents/pdf-extraction-core.ts'
import type { TextChunk } from '../../src/backend/documents/pdf-extraction-core.ts'

type ExtractOptions = { sink: { enqueue(chunk: TextChunk): void } }
const pageWith = (extract: (options: ExtractOptions) => Promise<void>) => ({ extractTextContent: extract as (options: object) => Promise<void> })
const silent = () => null

describe('Story 2.3 – kontrollerte ekstraksjonsfeil og statusrekkefølge', () => {
  it('kopierer leverte chunks og bevarer delvis tekst ved senere avvisning', async () => {
    const page = pageWith(async ({ sink }) => {
      const chunk = { items: [{ str: 'TG3', hasEOL: true }, { str: 'Lekkasje i tak' }] }
      sink.enqueue(chunk)
      chunk.items.length = 0
      throw new Error('DO-NOT-EXPOSE extraction internals')
    })
    const result = await extractPage(4, page, 'content', false, {}, {}, silent)
    expect(result).toMatchObject({ pdfPage: 4, text: 'TG3\nLekkasje i tak', status: 'incomplete' })
    expect(result.reason).not.toMatch(/DO-NOT-EXPOSE|internals/)
  })
  it('kjent avvist lesing uten tekst er unreadable med fysisk side', async () => {
    const result = await extractPage(7, pageWith(async () => { throw new Error('secret') }), 'content', false, {}, {}, silent)
    expect(result).toMatchObject({ pdfPage: 7, text: '', status: 'unreadable' })
  })
  it.each(['unknown', 'damaged'] as const)('rå %s skjules aldri av gjenværende tekst', async inspection => {
    const page = pageWith(async ({ sink }) => sink.enqueue({ items: [{ str: 'A' }] }))
    const result = await extractPage(1, page, inspection, false, {}, {}, silent)
    expect(result.status).toBe(inspection === 'damaged' ? 'incomplete' : 'unknown')
    expect(result.text.trim()).toBe('A')
  })
  it('ufullført inspeksjon av annet innhold gir unknown også med tekst', async () => {
    const page = pageWith(async ({ sink }) => sink.enqueue({ items: [{ str: 'A' }] }))
    expect((await extractPage(1, page, 'content', null, {}, {}, silent)).status).toBe('unknown')
  })
  it.each(['loss', 'uncertain'] as const)('diagnostikk %s blir aldri tidlig blank', async diagnostic => {
    const page = pageWith(async () => {})
    const result = await extractPage(1, page, 'empty', false, {}, {}, () => diagnostic)
    expect(result.status).toBe(diagnostic === 'loss' ? 'unreadable' : 'unknown')
  })
  it('diagnostikk om teksttap har prioritet over usikker inspeksjon', async () => {
    const page = pageWith(async ({ sink }) => sink.enqueue({ items: [{ str: 'TG2' }] }))
    expect((await extractPage(1, page, 'unknown', null, {}, {}, () => 'loss')).status).toBe('incomplete')
  })
  it('bevist tom innholdsstrøm uten annet innhold trenger ingen operatorlesing', async () => {
    const extract = vi.fn(async () => { throw new Error('Should not parse proven empty bytes') })
    expect(await extractPage(3, pageWith(extract), 'empty', false, {}, {}, silent))
      .toEqual({ pdfPage: 3, text: '', status: 'blank', reason: null })
    expect(extract).not.toHaveBeenCalled()
  })
  it('whitespace fra tekstoperator er innhold og aldri blank', async () => {
    const page = pageWith(async ({ sink }) => sink.enqueue({ items: [{ str: '  ', hasEOL: true }] }))
    expect(await extractPage(2, page, 'content', false, {}, {}, silent))
      .toMatchObject({ pdfPage: 2, text: '  \n', status: 'unreadable' })
  })
})

describe('Story 2.3 – full dekoding for strukturelt blankbevis', () => {
  const whitespace = Uint8Array.from([0, 9, 10, 12, 13, 32])
  it('PDF-whitespace er eksakte syntaksbytes, ikke en tekstlengdegrense', () => {
    expect(inspectStreamBytes(whitespace, [])).toBe('empty')
    expect(inspectStreamBytes(Uint8Array.from([11]), [])).toBe('content')
    expect(inspectStreamBytes(Uint8Array.from([65]), [])).toBe('content')
  })
  it('verifiserer Flate checksum/avslutning fremfor å godta en dekodet prefiks', () => {
    const compressed = deflateSync(whitespace)
    expect(inspectStreamBytes(compressed, ['FlateDecode'])).toBe('empty')
    expect(inspectStreamBytes(compressed.subarray(0, -2), ['FlateDecode'])).toBe('damaged')
    expect(inspectStreamBytes(Buffer.concat([compressed, Buffer.from('extra')]), ['FlateDecode'])).toBe('damaged')
    const badChecksum = Buffer.from(compressed)
    badChecksum[badChecksum.length - 1] ^= 255
    expect(inspectStreamBytes(badChecksum, ['FlateDecode'])).toBe('damaged')
  })
  it('krever komplett ASCII85 inkludert terminator og gyldig siste gruppe', () => {
    expect(inspectStreamBytes(Buffer.from('z~>'), ['ASCII85Decode'])).toBe('empty')
    expect(inspectStreamBytes(Buffer.from('z'), ['ASCII85Decode'])).toBe('damaged')
    expect(inspectStreamBytes(Buffer.from('!~>'), ['ASCII85Decode'])).toBe('damaged')
    expect(inspectStreamBytes(Buffer.from('z~>payload'), ['ASCII85Decode'])).toBe('damaged')
  })
  it('ustøttet filter gir unknown selv for rå whitespace', () => {
    expect(inspectStreamBytes(whitespace, ['UnrecognisedFilter'])).toBe('unknown')
  })
})
