import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { extractLocalVisualEvidence, readLocalVisualPages } from '../../src/backend/documents/local-visual-ocr.ts'
import { resolveLocalGrade } from '../../src/backend/documents/local-visual-grade.ts'

const page = { pdfPage: 7, width: 2200, height: 3100, rasterDigest: 'a'.repeat(64), lines: [{ text: 'Fiktivt avvik: værslitt dør.', confidence: 1, box: { x: 0.1, y: 0.2, width: 0.5, height: 0.01 } }], symbols: [], error: null }
describe('lokalt bildebevis', () => {
  it('krever to eksplisitte samsvarende avlesninger og beholder reell OCR-sikkerhet', () => {
    expect(resolveLocalGrade([{ text: '0TG 2', confidence: 0.3 }, { text: ') TG 2', confidence: 0.5 }])).toEqual({ grade: 'TG2', confidence: 0.3, agreement: 'two-pass' })
    for (const readings of [[{ text: 'TG3', confidence: 1 }], [{ text: 'TG3', confidence: 1 }, { text: 'TG2', confidence: 1 }], [{ text: '', confidence: 0 }, { text: 'TG2', confidence: 1 }], [{ text: 'TG2', confidence: 0.2 }, { text: 'TG2', confidence: 1 }], [{ text: 'TG12', confidence: 1 }, { text: 'TG12', confidence: 1 }]]) expect(resolveLocalGrade(readings).grade).toBeNull()
  })
  it('bevarer kun hele gyldige bestilte sider ved avbrutt NDJSON', () => {
    const output = JSON.stringify(page) + '\n' + JSON.stringify({ ...page, pdfPage: 8 }).slice(0, -3)
    expect(readLocalVisualPages(output, [7, 8])).toEqual([page])
  })
  it('avviser ugyldige områder og ubestilte sider uten å gjette på reparasjoner', () => {
    const outside = { ...page, pdfPage: 8, lines: [{ ...page.lines[0], box: { x: 0.9, y: 0.2, width: 0.5, height: 0.01 } }] }
    const output = [JSON.stringify(outside), '{avbrutt}', JSON.stringify({ ...page, pdfPage: 9 }), JSON.stringify(page), ''].join('\n')
    expect(readLocalVisualPages(output, [7, 8])).toEqual([page])
  })
  it('beholder første side og aksepterer aldri at senere duplikat erstatter evidens', () => {
    expect(readLocalVisualPages(JSON.stringify(page) + '\n' + JSON.stringify({ ...page, lines: [] }) + '\n', [7])).toEqual([page])
  })
  it('avviser original som ikke samsvarer med oppgitt hash før lokal prosess startes', async () => {
    const result = await extractLocalVisualEvidence(new Uint8Array([1, 2, 3]), 'a'.repeat(64), 'Fiktiv.pdf', [7, 7, 0, 201])
    expect(result.pages).toHaveLength(1)
    expect(result.pages[0]!.error).toContain('hash')
    expect(result.pages[0]!.symbols).toEqual([])
  })
  it('tomt sideutvalg krever ingen runtime eller filskriving', async () => {
    const bytes = new Uint8Array([1, 2, 3]), hash = createHash('sha256').update(bytes).digest('hex')
    expect(await extractLocalVisualEvidence(bytes, hash, 'Fiktiv.pdf', [])).toEqual({ version: 'local-visual-1', documentHash: hash, documentName: 'Fiktiv.pdf', pages: [] })
  })
  it.each(['time', 'bytes'] as const)('starter ikke en lokal prosess uten gjenværende %s-budsjett', async kind => {
    const bytes = new Uint8Array([1, 2, 3]), hash = createHash('sha256').update(bytes).digest('hex')
    const result = await extractLocalVisualEvidence(bytes, hash, 'Fiktiv.pdf', [1, 2], kind === 'time' ? { deadlineMs: 0 } : { maxOutputBytes: 0 })
    expect(result.pages).toHaveLength(2)
    expect(result.pages.every(page => page.error?.includes(kind === 'time' ? 'tidsbudsjett' : 'svarbudsjett') && page.rasterDigest === null)).toBe(true)
  })
})
