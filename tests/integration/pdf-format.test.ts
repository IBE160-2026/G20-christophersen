import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { getDocument, PDFWorker, VerbosityLevel } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { describe, expect, it, vi } from 'vitest'
import { AnalysisErrorSchema, AnalysisOutcomeSchema, DocumentBasisSchema } from '../../src/contracts/document-analysis.ts'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'

const directory = new URL('../fixtures/property-cases/', import.meta.url)
const fixture = (name: string) => readFile(new URL(name, directory))
type Oracle = {
  cases: {
    caseId: string; documentName: string; pageCount: number
    financialInputs: { P: string; L: string | null; D: string; J: string; Ymin: string }
    findings: { grade: string; description: string; documentName: string; pdfPage: number; printedPage: number | null }[]
  }[]
}
const oracle: Oracle = JSON.parse(await readFile(new URL('expected.json', directory), 'utf8'))
const hashes: Record<string, string> = JSON.parse(await readFile(new URL('sha256.json', directory), 'utf8'))

// Fixture inspection only: this does not implement or approve Story 2.3's reliability method.
async function fixtureTexts(name: string): Promise<string[]> {
  const task = getDocument({ data: Uint8Array.from(await fixture(name)), verbosity: VerbosityLevel.ERRORS })
  try {
    const document = await task.promise
    const texts: string[] = []
    for (let number = 1; number <= document.numPages; number++) {
      const page = await document.getPage(number)
      const content = await page.getTextContent()
      texts.push(content.items.map(item => 'str' in item ? item.str : '').join('\n'))
    }
    return texts
  } finally {
    await task.destroy()
  }
}

describe('Story 2.2 AC1 – faktiske bytes og sidegrense (RT-1 formatdel / RT-2)', () => {
  it('godtar 30 sider, bevarer faktisk sidetall og alle originalbytes', async () => {
    const bytes = await fixture('text-30-pages.pdf')
    const original = Buffer.from(bytes)
    const result = await validatePdf(bytes, 'ikke-en-filendelse.txt')
    expect(result.status).toBe('format-validated')
    if (result.status !== 'format-validated') throw new Error('Expected format-only success')
    expect(result.pageCount).toBe(30)
    expect(Buffer.from(result.originalBytes)).toEqual(original)
    expect(bytes).toEqual(original)
    expect(result.reportHash).toBe(hashes['text-30-pages.pdf'])
  })
  it('avviser 31 sider med trygg dokumentfeil og faktisk sidetall', async () => {
    const result = await validatePdf(await fixture('text-31-pages.pdf'), 'rapport.pdf')
    expect(result).toMatchObject({ status: 'failed', pageCount: 31,
      error: { kind: 'document', code: 'page-limit', target: { kind: 'document' } } })
    if (result.status !== 'failed') throw new Error('Expected document failure')
    expect(AnalysisErrorSchema.safeParse(result.error).success).toBe(true)
    expect(result.error.reason).toContain('30 sider')
    expect(result).not.toHaveProperty('findings')
  })
  it.each([
    ['invalid-format.pdf', 'invalid-format'], ['damaged-container.pdf', 'invalid-container'],
  ])('avviser %s selv med PDF-navn, uten rå parserinnhold', async (file, code) => {
    const result = await validatePdf(await fixture(file), '../../private/hemmelig.pdf')
    expect(result).toMatchObject({ status: 'failed', pageCount: null,
      error: { kind: 'document', code, target: { kind: 'document' } } })
    if (result.status !== 'failed') throw new Error('Expected document failure')
    expect(AnalysisErrorSchema.safeParse(result.error).success).toBe(true)
    expect(JSON.stringify(result.error)).not.toMatch(/DO-NOT-EXPOSE|hemmelig|InvalidPDF|Error:|stack/)
    expect(result).not.toHaveProperty('findings')
  })
  it('avviser tom input som dokumentfeil', async () => {
    const result = await validatePdf(new Uint8Array(), 'tom.pdf')
    expect(result).toMatchObject({ status: 'failed', pageCount: null, error: { code: 'invalid-format' } })
  })
  it.each([30, 31])('grensefixture med %s sider har faktisk tekst på hver filside', async count => {
    const texts = await fixtureTexts(`text-${count}-pages.pdf`)
    expect(texts).toHaveLength(count)
    texts.forEach((text, index) => expect(text).toContain(`Dette er faktisk tekst på PDF-posisjon ${index + 1}.`))
  })
})

describe('Story 2.2 AC2 – SHA-256 gjelder originalbytes, navn er metadata', () => {
  it('gir identiske bytes samme hash under ulike og stilignende navn', async () => {
    const bytes = await fixture('F1-tilstandsrapport.pdf')
    const first = await validatePdf(bytes, 'vanlig.pdf')
    const second = await validatePdf(bytes, '../../private/finnes-ikke.pdf')
    expect(first.status).toBe('format-validated')
    expect(second.status).toBe('format-validated')
    expect(first.reportHash).toBe(second.reportHash)
    expect(second.documentName).toBe('../../private/finnes-ikke.pdf')
    expect(first.reportHash).toBe(hashes['F1-tilstandsrapport.pdf'])
  })
  it('gir endrede, fortsatt gyldige PDF-bytes ny hash ved samme navn', async () => {
    const first = await validatePdf(await fixture('F1-tilstandsrapport.pdf'), 'samme.pdf')
    const second = await validatePdf(await fixture('F1-tilstandsrapport-endret.pdf'), 'samme.pdf')
    expect(first.status).toBe('format-validated')
    expect(second.status).toBe('format-validated')
    expect(second.pageCount).toBe(first.pageCount)
    expect(second.reportHash).not.toBe(first.reportHash)
    expect(second.reportHash).toBe(hashes['F1-tilstandsrapport-endret.pdf'])
  })
  it('bevarer bare valgt Buffer-slice og snapshot selv om kalleren endrer input mens parseren laster', async () => {
    const bytes = await fixture('F1-tilstandsrapport.pdf')
    const padded = Buffer.concat([Buffer.from('prefix'), bytes, Buffer.from('suffix')])
    const slice = padded.subarray(6, 6 + bytes.length)
    const pending = validatePdf(slice, 'snapshot.pdf')
    slice.fill(0)
    const result = await pending
    expect(result.status).toBe('format-validated')
    if (result.status !== 'format-validated') throw new Error('Expected format-only success')
    expect(Buffer.from(result.originalBytes)).toEqual(bytes)
    expect(result.reportHash).toBe(createHash('sha256').update(bytes).digest('hex'))
  })
})

describe('Story 2.2 AC3 – format er delutfall, ingen lesbarhet eller analysefullføring', () => {
  it('godtar tekstløs container som format med originalbytes og én side', async () => {
    const bytes = await fixture('without-text-layer.pdf')
    const result = await validatePdf(bytes, 'bilde.pdf')
    expect(result.status).toBe('format-validated')
    if (result.status !== 'format-validated') throw new Error('Expected format-only success')
    expect(result.pageCount).toBe(1)
    expect(Buffer.from(result.originalBytes)).toEqual(bytes)
    expect(await fixtureTexts('without-text-layer.pdf')).toEqual([''])
    expect(AnalysisOutcomeSchema.safeParse(result).success).toBe(false)
    expect(DocumentBasisSchema.safeParse(result).success).toBe(false)
    expect(result).not.toHaveProperty('pages')
    expect(result).not.toHaveProperty('findings')
    expect(result).not.toHaveProperty('readable')
  })
  it('rydder ekte PDF.js-workers ved suksess, sideavvisning og parserfeil', async () => {
    const destroy = vi.spyOn(PDFWorker.prototype, 'destroy')
    try {
      for (const name of ['text-30-pages.pdf', 'text-31-pages.pdf', 'invalid-format.pdf', 'damaged-container.pdf']) {
        destroy.mockClear()
        await validatePdf(await fixture(name), name)
        expect(destroy).toHaveBeenCalledTimes(1)
      }
    } finally {
      destroy.mockRestore()
    }
  })
})

describe('Story 2.2 AC4 – uavhengig fiktiv F1–F4-fasit og RT-5', () => {
  it.each(oracle.cases)('$caseId: navn, alle funntekster/grader og faktiske filsider samsvarer', async item => {
    const bytes = await fixture(item.documentName)
    const result = await validatePdf(bytes, item.documentName)
    expect(result).toMatchObject({ status: 'format-validated', pageCount: item.pageCount,
      documentName: item.documentName, reportHash: hashes[item.documentName] })
    const texts = await fixtureTexts(item.documentName)
    expect(texts[0]).toContain(item.documentName)
    const actualGrades = texts.flatMap((text, index) => Array.from(text.matchAll(/Tilstandsgrad: (TG[23])/g),
      match => ({ grade: match[1], pdfPage: index + 1 })))
    expect(actualGrades).toEqual(item.findings.map(finding => ({ grade: finding.grade, pdfPage: finding.pdfPage })))
    for (const finding of item.findings) {
      expect(finding.documentName).toBe(item.documentName)
      expect(texts[finding.pdfPage - 1]).toContain(finding.description)
      if (finding.printedPage !== null) {
        expect(texts[finding.pdfPage - 1]).toContain(`Trykt side ${finding.printedPage}`)
      }
    }
  })
  it('bevarer låste input, F3s manglende leie og F4s RT-5-kilde før adapterbruk', () => {
    expect(oracle.cases.map(item => item.financialInputs)).toEqual([
      { P: '16000000', L: '1900000', D: '400000', J: '800000', Ymin: '7' },
      { P: '16000000', L: '1400000', D: '400000', J: '800000', Ymin: '7' },
      { P: '16000000', L: null, D: '400000', J: '800000', Ymin: '7' },
      { P: '16000000', L: '1900000', D: '400000', J: '800000', Ymin: '7' },
    ])
    expect(oracle.cases[3]!.findings[1]).toMatchObject({ grade: 'TG3', description: 'Alvorlig lekkasje i tak',
      documentName: 'F4-tilstandsrapport.pdf', pdfPage: 4, printedPage: 2 })
  })
})
