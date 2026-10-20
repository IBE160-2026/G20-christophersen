import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { Worker } from 'node:worker_threads'
import { describe, expect, it, vi } from 'vitest'
import { extractPdf } from '../../src/backend/documents/extract-pdf.ts'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'
import { bindAnalysisOutcome } from '../../src/contracts/analysis-validation.ts'
import { DocumentBasisSchema } from '../../src/contracts/document-analysis.ts'

const root = new URL('../fixtures/pdf-readability/', import.meta.url)
const propertyRoot = new URL('../fixtures/property-cases/', import.meta.url)
const oracle = JSON.parse(await readFile(new URL('expected.json', root), 'utf8')) as Record<string, unknown>
const hashes = JSON.parse(await readFile(new URL('sha256.json', root), 'utf8')) as Record<string, string>
const properties = JSON.parse(await readFile(new URL('expected.json', propertyRoot), 'utf8')) as {
  cases: { documentName: string; pageCount: number; findings: { pdfPage: number; grade: string; description: string; printedPage: number | null }[] }[]
}
const request = { requestId: 'extraction-test', mode: 'demo' as const }
const completed = { contractVersion: '2', extractionVersion: '1', status: 'completed', findings: [], limitations: [] }
async function formatFile(name: string, directory = root) {
  const format = await validatePdf(await readFile(new URL(name, directory)), name)
  if (format.status !== 'format-validated') throw new Error('Expected format-validated fixture')
  return format
}
async function extractFile(name: string, directory = root) { return extractPdf(await formatFile(name, directory), request) }

function preservesPositions(document: Awaited<ReturnType<typeof extractPdf>>['document']) {
  expect(DocumentBasisSchema.safeParse(document).success).toBe(true)
  expect(document.pages.map(page => page.pdfPage)).toEqual(Array.from({ length: document.pageCount }, (_, i) => i + 1))
}

describe('Story 2.3 AC1/AC2 – ekte parser og fysisk kilde', () => {
  it.each(properties.cases)('$documentName bevarer hele F1–F4-fasiten før adapter', async original => {
    const { document, error } = await extractFile(original.documentName, propertyRoot)
    preservesPositions(document)
    expect(document.pageCount).toBe(original.pageCount)
    expect(document.pages.every(page => page.status === 'readable')).toBe(true)
    expect(error).toBeNull()
    for (const finding of original.findings) {
      const text = document.pages[finding.pdfPage - 1]!.text
      expect(text).toContain(`Tilstandsgrad: ${finding.grade}`)
      expect(text).toContain(finding.description)
      if (finding.printedPage !== null) expect(text).toContain(`Trykt side ${finding.printedPage}`)
    }
    const actual = document.pages.flatMap(page => Array.from(page.text.matchAll(/Tilstandsgrad: (TG[23])/g),
      match => ({ pdfPage: page.pdfPage, grade: match[1] })))
    expect(actual).toEqual(original.findings.map(({ pdfPage, grade }) => ({ pdfPage, grade })))
  })
  it('bevarer tabellrader, kolonneblokker, norske tegn og blandet tekst/bilde fra separat fasit', async () => {
    const { document, error } = await extractFile('layout.pdf')
    preservesPositions(document)
    expect(error).toBeNull()
    for (const page of oracle['layout.pdf'] as { pdfPage: number; text: string[] }[]) {
      const actual = document.pages[page.pdfPage - 1]!
      expect(actual.status).toBe('readable')
      page.text.forEach(text => expect(actual.text).toContain(text))
    }
    expect(document.pages[0]!.text).toMatch(/TG2 +Slitt overflate på baderomsgulv\nTG3 +Alvorlig lekkasje i tak/)
    expect(document.pages[1]!.text).toMatch(/Venstre kolonne\nTilstandsgrad: TG2\nRåte i vinduskarm\nHøyre kolonne\nTilstandsgrad: TG3\nLekkasje ved pipe/)
    expect(document.pages[3]!.text.trim()).toBe('A')
  })
  it.each(['text-30-pages.pdf', 'text-30-pages-object-stream.pdf', 'text-30-pages-linearized.pdf'])('beholder alle 30 sider i %s', async name => {
    const directory = name === 'text-30-pages.pdf' ? propertyRoot : new URL('../fixtures/pdf-structure/', import.meta.url)
    const { document, error } = await extractFile(name, directory)
    preservesPositions(document)
    expect(document.pages).toHaveLength(30)
    expect(error).toBeNull()
    document.pages.forEach((page, i) => {
      expect(page.status).toBe('readable')
      expect(page.text).toContain(`Dette er faktisk tekst på PDF-posisjon ${i + 1}.`)
    })
  })
  it('bruker faktisk bladrekkefølge når både rot og nestet gren har feil Count', async () => {
    const { document, error } = await extractFile('nested-count.pdf')
    preservesPositions(document)
    expect(document.pageCount).toBe(3)
    expect(error).toBeNull()
    expect(document.pages.map(page => page.text.trim())).toEqual(['Fysisk side 1', 'Fysisk side 2', 'Fysisk side 3'])
  })
  it('ukjent fysisk mapping blir aldri godkjent som readable og alle 2.2-posisjoner beholdes', async () => {
    const format = await formatFile('layout.pdf')
    const { document, error } = await extractPdf({ ...format, pageCount: 5 }, request)
    preservesPositions(document)
    expect(document.pages.map(page => page.status)).toEqual(Array(5).fill('unknown'))
    expect(error?.code).toBe('unknown-readability')
    expect(error?.reason).toContain('1, 2, 3, 4, 5')
  })
  it('bevarer snapshot, originalhash og navn når parseren får kopi av en Buffer-slice', async () => {
    const original = await readFile(new URL('layout.pdf', root))
    const padded = Buffer.concat([Buffer.alloc(17), original, Buffer.alloc(23)])
    const bytes = padded.subarray(17, 17 + original.length)
    const format = await validatePdf(bytes, '../../private/rapport.txt')
    if (format.status !== 'format-validated') throw new Error('Expected format success')
    const pending = extractPdf(format, { ...request, mode: 'live' })
    bytes.fill(0)
    const { document } = await pending
    expect(Buffer.from(format.originalBytes)).toEqual(original)
    expect(document.reportHash).toBe(createHash('sha256').update(original).digest('hex'))
    expect(document.documentName).toBe('../../private/rapport.txt')
    expect(document.mode).toBe('live')
    expect(document.contractVersion).toBe('2')
    expect(document.extractionVersion).toBe('1')
  })
})

describe('Story 2.3 AC3/AC4 – konservativ blankregel og fullføringssperre', () => {
  it.each(['blank-variants.pdf', 'textless-content.pdf', 'mixed-status.pdf', 'uncertain-content.pdf',
    'structural-content.pdf', 'catalog-form.pdf', 'catalog-xfa.pdf', 'catalog-empty-form.pdf', 'catalog-empty-dict.pdf', 'encrypted-content.pdf'])('%s følger forhåndsskrevet sidestatusfasit og bevarer feilgrunnlaget', async name => {
    const { document, error } = await extractFile(name)
    preservesPositions(document)
    expect(document.pages.map(page => page.status)).toEqual(oracle[name])
    expect(error?.kind).toBe('document')
    const blocked = bindAnalysisOutcome(document, completed)
    expect(blocked).toMatchObject({ status: 'failed', error })
    expect(blocked).not.toHaveProperty('findings')
    expect(JSON.stringify(error)).not.toMatch(/UnrecognisedFilter|XRef|Error:|stack|DO-NOT-EXPOSE|999/)
  })
  it('blank alene blokkerer ikke sammen med lesbar rapporttekst', async () => {
    const { document, error } = await extractFile('readable-blank.pdf')
    expect(document.pages.map(page => page.status)).toEqual(['readable', 'blank'])
    expect(error).toBeNull()
    expect(bindAnalysisOutcome(document, completed)).toMatchObject({ status: 'completed', findings: [] })
  })
  it('beholder alle uleste fysiske sider og kjente årsaker etter en blank side', async () => {
    const { document, error } = await extractFile('mixed-status.pdf')
    expect(document.pages).toHaveLength(5)
    expect(error?.target).toEqual({ kind: 'page', pdfPage: 3 })
    expect(error?.reason).toContain('Berørte PDF-sider: 3, 4, 5.')
    for (const page of document.pages.slice(2)) expect(error?.reason).toContain(`PDF-side ${page.pdfPage}: ${page.reason}`)
    // Gate executes before adapter validation, even with a malformed adapter response.
    expect(bindAnalysisOutcome(document, null)).toMatchObject({ status: 'failed', error })
  })
  it('bevarer kjent delvis tekst når en senere innholdsstrøm er skadet', async () => {
    const { document, error } = await extractFile('uncertain-content.pdf')
    expect(document.pages[4]).toMatchObject({ pdfPage: 5, status: 'incomplete' })
    expect(document.pages[4]!.text).toContain('Tilstandsgrad: TG2 - Slitt gulv')
    expect(error?.reason).toContain('PDF-side 5: Tekstuttrekket er kjent ufullstendig')
  })
  it('den eksisterende vektorfixturen blir aldri blank', async () => {
    const { document, error } = await extractFile('without-text-layer.pdf', propertyRoot)
    expect(document.pages[0]).toMatchObject({ pdfPage: 1, status: 'unreadable' })
    expect(error?.code).toBe('unreadable-text')
  })
  it('fixturebytes matcher separat SHA-256-inventar', async () => {
    for (const [name, hash] of Object.entries(hashes)) {
      expect(createHash('sha256').update(await readFile(new URL(name, root))).digest('hex'), name).toBe(hash)
    }
  })
})

describe('Story 2.3 – workeropprydding og trygge driftsfeil', () => {
  it.each(['layout.pdf', 'mixed-status.pdf', 'blank-variants.pdf'])('avslutter den faktiske uttrekksworkeren etter %s', async name => {
    const format = await formatFile(name)
    const terminate = vi.spyOn(Worker.prototype, 'terminate')
    try {
      await extractPdf(format, request)
      expect(terminate).toHaveBeenCalledTimes(1)
      expect(terminate.mock.instances[0]).toMatchObject({ threadId: -1 })
    } finally { terminate.mockRestore() }
  })
  it.each(['error', 'messageerror', 'exit', 'unavailable', 'invalid-pages'])('rydder også ved kontrollert %s', async failure => {
    const format = await formatFile('layout.pdf')
    const original = Worker.prototype.once
    const terminate = vi.spyOn(Worker.prototype, 'terminate')
    const once = vi.spyOn(Worker.prototype, 'once').mockImplementation(function (this: Worker, ...args: Parameters<typeof original>) {
      const result = original.apply(this, args)
      if (args[0] === 'message') queueMicrotask(() => {
        if (failure === 'exit') void this.terminate()
        else if (failure === 'unavailable') this.emit('message', { kind: 'unavailable' })
        else if (failure === 'invalid-pages') this.emit('message', { kind: 'extracted', pages: [] })
        else this.emit(failure, new Error('DO-NOT-EXPOSE parser details'))
      })
      return result
    })
    try {
      await expect(extractPdf(format, request)).rejects.toThrow(/^PDF-teksten kunne ikke kontrolleres\. Prøv igjen\.$/)
      expect(terminate).toHaveBeenCalled()
      expect(terminate.mock.instances.at(-1)).toMatchObject({ threadId: -1 })
    } finally { once.mockRestore(); terminate.mockRestore() }
  })
  it('ryddet tråd og trygg melding når siste terminate avvises', async () => {
    const format = await formatFile('layout.pdf')
    const original = Worker.prototype.terminate
    const terminate = vi.spyOn(Worker.prototype, 'terminate').mockImplementation(async function (this: Worker) {
      await original.call(this)
      throw new Error('DO-NOT-EXPOSE cleanup details')
    })
    try {
      await expect(extractPdf(format, request)).rejects.toThrow(/^PDF-teksten kunne ikke kontrolleres\. Prøv igjen\.$/)
      expect(terminate.mock.instances[0]).toMatchObject({ threadId: -1 })
    } finally { terminate.mockRestore() }
  })
})

describe('Story 2.3 review – faktisk PDF-regresjon', () => {
  it.each(['annotated-xfa.pdf', 'annotated-uncertain.pdf', 'annotation-text-loss.pdf', 'parser-diagnostics.pdf'])('%s beholder tekst, status og fullføringssperre', async name => {
    const { document, error } = await extractFile(name)
    preservesPositions(document)
    expect(document.pages.map(page => page.status)).toEqual(oracle[name])
    document.pages.forEach(page => expect(page.text).toContain('Tilstandsgrad: TG2 - Slitt gulv'))
    expect(error?.kind).toBe('document')
    expect(bindAnalysisOutcome(document, completed)).toMatchObject({ status: 'failed', error })
    if (name === 'parser-diagnostics.pdf') expect(error?.target).toEqual({ kind: 'page', pdfPage: 1 })
  })
  it('bevarer tilstøtende TG3-fragmenter gjennom fontbytte', async () => {
    const { document, error } = await extractFile('text-fragments.pdf')
    expect(error).toBeNull()
    expect(document.pages[0]!.text.trim()).toBe('Tilstandsgrad: TG3 - Lekkasje i tak')
  })
  it('laster sammensatt fonts innebygde CMaps fra lokal PDF.js-pakke', async () => {
    const { document, error } = await extractFile('cmap-text.pdf')
    expect(error).toBeNull()
    expect(document.pages[0]!.text.trim()).toBe('Tilstandsgrad: TG3 - Lekkasje i tak')
  })
  it('bevarer radvis kolonnerekkefølge og avgrenser readable til digital tekst over skann', async () => {
    const { document, error } = await extractFile('review-layout.pdf')
    expect(error).toBeNull()
    expect(document.pages.map(page => page.status)).toEqual(oracle['review-layout.pdf'])
    expect(document.pages[0]!.text).toMatch(/TG2 +TG3\nRåte i vinduskarm +Lekkasje ved pipe/)
    expect(document.pages[1]!.text.trim()).toBe('Digital topptekst')
    expect(document.pages[1]!.text).not.toContain('TG3')
  })
  it('godtar ikke mutert formatsnapshot med en annen rapporthash', async () => {
    const format = await formatFile('readable-blank.pdf')
    const before = format.reportHash
    const grade = Buffer.from(format.originalBytes).indexOf('TG2')
    expect(grade).toBeGreaterThan(0)
    format.originalBytes[grade + 2] = '3'.charCodeAt(0)
    await expect(extractPdf(format, request)).rejects.toThrow(/^PDF-teksten kunne ikke kontrolleres\. Prøv igjen\.$/)
    expect(format.reportHash).toBe(before)
  })
  it('bevarer trygt kjent årsakskategori for uavklart dekoding og referanse', async () => {
    const { document } = await extractFile('uncertain-content.pdf')
    expect(document.pages[0]!.reason).toMatch(/dekoding/i)
    expect(document.pages[1]!.reason).toMatch(/referanse|struktur/i)
    expect(document.pages[0]!.reason).not.toBe(document.pages[1]!.reason)
  })
})
