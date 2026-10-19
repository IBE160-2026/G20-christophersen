import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { Worker as PageTreeWorker } from 'node:worker_threads'
import { getDocument, PDFWorker, VerbosityLevel } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { describe, expect, it, vi } from 'vitest'
import { AnalysisErrorSchema, AnalysisOutcomeSchema, DocumentBasisSchema } from '../../src/contracts/document-analysis.ts'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'
import { countPdfPages } from '../../src/backend/documents/count-pdf-pages.ts'

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
const structures = new URL('../fixtures/pdf-structure/', import.meta.url)
const structureHashes: Record<string, string> = JSON.parse(await readFile(new URL('sha256.json', structures), 'utf8'))

function withDeclaredCount(bytes: Buffer, actual: number, declared: string): Buffer {
  const marker = `/Count ${actual}`
  const replacement = `/Count ${declared}`
  expect(replacement.length).toBe(marker.length)
  const source = bytes.toString('latin1')
  expect(source.split(marker)).toHaveLength(2)
  return Buffer.from(source.replace(marker, replacement), 'latin1')
}

// Add a genuine nested Pages node to the 31-page fixture via an incremental
// xref update. Both root and branch lie about Count, but keep all 31 leaf refs.
async function nestedUnderstatedTree(): Promise<Buffer> {
  const bytes = await fixture('text-31-pages.pdf')
  const source = bytes.toString('latin1')
  const kids = source.match(/\/Count 31 \/Kids \[([\s\S]*?)\] \/Type \/Pages/)![1]!
  expect(kids.match(/\d+ 0 R/g)).toHaveLength(31)
  expect(source.match(/\/Parent 37 0 R/g)).toHaveLength(31)
  const base = source.replaceAll('/Parent 37 0 R', '/Parent 69 0 R')
  const previousXref = source.match(/startxref\s+(\d+)\s+%%EOF/)![1]!
  const root = '\n37 0 obj\n<< /Type /Pages /Count 1 /Kids [69 0 R] >>\nendobj\n'
  const branch = `69 0 obj\n<< /Type /Pages /Parent 37 0 R /Count 1 /Kids [${kids}] >>\nendobj\n`
  const rootOffset = base.length + 1
  const branchOffset = base.length + root.length
  const xrefOffset = branchOffset + branch.length
  return Buffer.from(base + root + branch + `xref\n37 1\n${String(rootOffset).padStart(10, '0')} 00000 n \n69 1\n${String(branchOffset).padStart(10, '0')} 00000 n \ntrailer\n<< /Root 35 0 R /Size 70 /Prev ${previousXref} >>\nstartxref\n${xrefOffset}\n%%EOF\n`, 'latin1')
}

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
  it.each(['text-30-pages-object-stream.pdf', 'text-30-pages-linearized.pdf'])('bevarer støtte for %s', async name => {
    const bytes = await readFile(new URL(name, structures))
    const result = await validatePdf(bytes, name)
    expect(result).toMatchObject({ status: 'format-validated', pageCount: 30, reportHash: structureHashes[name] })
    if (result.status !== 'format-validated') throw new Error('Expected format success')
    expect(Buffer.from(result.originalBytes)).toEqual(bytes)
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(structureHashes[name])
  })
  it('avviser 31 sider med trygg dokumentfeil og faktisk sidetall', async () => {
    const result = await validatePdf(await fixture('text-31-pages.pdf'), 'rapport.pdf')
    expect(result).toMatchObject({ status: 'failed', pageCount: 31,
      error: { kind: 'document', code: 'page-limit', target: { kind: 'document' } } })
    if (result.status !== 'failed') throw new Error('Expected document failure')
    expect(AnalysisErrorSchema.safeParse(result.error).success).toBe(true)
    expect(result.error.reason).toContain('30 sider')
    expect(result.reportHash).toBe(hashes['text-31-pages.pdf'])
    expect(result.documentName).toBe('rapport.pdf')
    expect(result).not.toHaveProperty('findings')
  })
  it.each(['30', '01', '00'])('kan ikke skjule side 31 med deklarert /Count %s', async declared => {
    const bytes = withDeclaredCount(await fixture('text-31-pages.pdf'), 31, declared)
    const original = Buffer.from(bytes)
    const result = await validatePdf(bytes, 'manipulert.pdf')
    expect(result).toMatchObject({ status: 'failed', pageCount: 31, error: { kind: 'document', code: 'page-limit' } })
    if (result.status !== 'failed') throw new Error('Expected document failure')
    expect(AnalysisErrorSchema.safeParse(result.error).success).toBe(true)
    expect(result.reportHash).toBe(createHash('sha256').update(original).digest('hex'))
    expect(bytes).toEqual(original)
    expect(result).not.toHaveProperty('findings')
  })
  it('traverserer også nestede Kids selv når både root og gren underrapporterer Count', async () => {
    const bytes = await nestedUnderstatedTree()
    expect(await countPdfPages(bytes)).toBe(31)
    expect(await validatePdf(bytes, 'nestet.pdf')).toMatchObject({ status: 'failed', pageCount: 31, error: { code: 'page-limit' } })
  })
  it('traverserer bare valgt byte-slice selv når workerdata har en større underliggende buffer', async () => {
    const original = withDeclaredCount(await fixture('text-31-pages.pdf'), 31, '01')
    const padded = Buffer.concat([Buffer.alloc(17, 65), original, Buffer.alloc(19, 66)])
    const slice = padded.subarray(17, 17 + original.length)
    expect(slice.byteOffset).toBeGreaterThan(0)
    expect(slice.buffer.byteLength).toBeGreaterThan(slice.length)
    expect(await countPdfPages(slice)).toBe(31)
    expect(slice).toEqual(original)
  })
  it.each(['29', '31'])('returnerer faktisk 30 sider og originalbytes når Count er %s', async declared => {
    const bytes = withDeclaredCount(await fixture('text-30-pages.pdf'), 30, declared)
    const result = await validatePdf(bytes, 'tretti.pdf')
    expect(result).toMatchObject({ status: 'format-validated', pageCount: 30 })
    if (result.status !== 'format-validated') throw new Error('Expected format success')
    expect(Buffer.from(result.originalBytes)).toEqual(bytes)
  })
  it('sidetretraverseringen avviser skadet referanse også når den ligger etter deklarert siste side', async () => {
    const original = await fixture('F1-tilstandsrapport.pdf')
    const damaged = Buffer.from(original.toString('latin1').replace('/Count 4', '/Count 1').replace('5 0 R', '0 0 R'), 'latin1')
    expect(await countPdfPages(damaged)).toBeNull()
    expect(await validatePdf(damaged, 'skjult-skade.pdf')).toMatchObject({ status: 'failed', error: { code: 'invalid-container' } })
  })
  it.each(['4', '1'])('avviser også skjult ødelagt sidemetadata ved Count=%s', async declared => {
    const original = (await fixture('F1-tilstandsrapport.pdf')).toString('latin1')
    const metadata = '/Rotate 0 /Trans <<\n\n>>'
    const replacement = '/Rotate 11 1 R'.padEnd(metadata.length)
    const first = original.indexOf(metadata)
    const second = original.indexOf(metadata, first + metadata.length)
    expect(second).toBeGreaterThan(first)
    const damaged = Buffer.from((original.slice(0, second) + replacement + original.slice(second + metadata.length))
      .replace('/Count 4', `/Count ${declared}`), 'latin1')
    expect(await validatePdf(damaged, 'skjult-metadatafeil.pdf'))
      .toMatchObject({ status: 'failed', error: { code: 'invalid-container' } })
  })
  it.each(['4 0 R', '10 0 R'])('avviser gjentatt/syklisk sidereferanse %s og rydder workeren', async ref => {
    const source = (await fixture('F1-tilstandsrapport.pdf')).toString('latin1')
    // Include trailing space to preserve byte offsets; root Pages is object 10.
    const token = '5 0 R '
    const damaged = Buffer.from(source.replace(token, ref.padEnd(token.length)), 'latin1')
    expect(damaged.toString('latin1')).not.toBe(source)
    expect(await validatePdf(damaged, 'syklisk.pdf')).toMatchObject({ status: 'failed', error: { code: 'invalid-container' } })
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
    expect(result.reportHash).toBe(createHash('sha256').update(await fixture(file)).digest('hex'))
    expect(result.documentName).toBe('../../private/hemmelig.pdf')
    expect(result).not.toHaveProperty('findings')
  })
  it('avviser tom input som dokumentfeil', async () => {
    const result = await validatePdf(new Uint8Array(), 'tom.pdf')
    expect(result).toMatchObject({ status: 'failed', pageCount: null, error: { code: 'invalid-format' } })
    expect(result.reportHash).toBe(createHash('sha256').update(new Uint8Array()).digest('hex'))
    expect(result.documentName).toBe('tom.pdf')
  })
  it('avviser skadet sidetre selv om PDF.js gjenoppretter et positivt sideantall', async () => {
    const original = await fixture('F1-tilstandsrapport.pdf')
    const damaged = Buffer.from(original.toString('latin1').replace('5 0 R', '0 0 R'), 'latin1')
    expect(damaged).not.toEqual(original)
    const result = await validatePdf(damaged, 'skadet-sidetre.pdf')
    expect(result).toMatchObject({ status: 'failed', error: { code: 'invalid-container' } })
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
  it('avslutter den faktiske sidetre-workeren ved suksess, sidegrense og skadet tre', async () => {
    const terminate = vi.spyOn(PageTreeWorker.prototype, 'terminate')
    try {
      for (const bytes of [await fixture('text-30-pages.pdf'),
        withDeclaredCount(await fixture('text-31-pages.pdf'), 31, '01'),
        Buffer.from((await fixture('F1-tilstandsrapport.pdf')).toString('latin1').replace('5 0 R', '0 0 R'), 'latin1')]) {
        terminate.mockClear()
        await countPdfPages(bytes)
        expect(terminate).toHaveBeenCalledTimes(1)
        expect(terminate.mock.instances[0]).toMatchObject({ threadId: -1 })
      }
    } finally {
      terminate.mockRestore()
    }
  })
  it('rydder worker og skjuler rå feil når transportoppryddingen avvises', async () => {
    const probe = getDocument({ data: Uint8Array.from(await fixture('F1-tilstandsrapport.pdf')) })
    await probe.promise
    await probe.destroy()
    const prototype = Object.getPrototypeOf(probe) as typeof probe
    const original = prototype.destroy
    const destroy = vi.spyOn(prototype, 'destroy').mockImplementation(async function (this: typeof probe) {
      // Model a transport rejection after normal transport cleanup, before worker cleanup.
      await original.call(this)
      throw new Error('DO-NOT-EXPOSE cleanup internals')
    })
    const workerDestroy = vi.spyOn(PDFWorker.prototype, 'destroy')
    try {
      await expect(validatePdf(await fixture('F1-tilstandsrapport.pdf'), 'rapport.pdf'))
        .rejects.toThrow(/^PDF-behandlingen kunne ikke avsluttes\. Prøv igjen\.$/)
      expect(workerDestroy).toHaveBeenCalledTimes(1)
      expect(workerDestroy.mock.instances[0]).toMatchObject({ destroyed: true })
    } finally {
      destroy.mockRestore()
      workerDestroy.mockRestore()
    }
  })
  it('beskriver ikke workerfeil som skadet rapport og eksponerer ingen rå detaljer', async () => {
    const create = vi.spyOn(PDFWorker.prototype, 'promise', 'get').mockRejectedValue(new Error('DO-NOT-EXPOSE worker setup'))
    const destroy = vi.spyOn(PDFWorker.prototype, 'destroy')
    try {
      await expect(validatePdf(await fixture('F1-tilstandsrapport.pdf'), 'rapport.pdf'))
        .rejects.toThrow(/^PDF-behandlingen kunne ikke gjennomføres\. Prøv igjen\.$/)
      expect(destroy).toHaveBeenCalledTimes(1)
    } finally {
      create.mockRestore()
      destroy.mockRestore()
    }
  })
  it.each(['error', 'exit', 'messageerror', 'unavailable'])('sidetre-worker %s gir trygg driftsfeil og avsluttet tråd', async failure => {
    const originalOnce = PageTreeWorker.prototype.once
    const terminate = vi.spyOn(PageTreeWorker.prototype, 'terminate')
    const once = vi.spyOn(PageTreeWorker.prototype, 'once').mockImplementation(function (this: PageTreeWorker, ...args: Parameters<typeof originalOnce>) {
      const result = originalOnce.apply(this, args)
      if (args[0] === 'message') queueMicrotask(() => {
        if (failure === 'exit') void this.terminate()
        else if (failure === 'unavailable') this.emit('message', { kind: 'unavailable' })
        else this.emit(failure, new Error('DO-NOT-EXPOSE page-tree internals'))
      })
      return result
    })
    try {
      await expect(validatePdf(await fixture('F1-tilstandsrapport.pdf'), 'intakt.pdf'))
        .rejects.toThrow(/^PDF-behandlingen kunne ikke gjennomføres\. Prøv igjen\.$/)
      expect(terminate).toHaveBeenCalled()
      expect(terminate.mock.instances.at(-1)).toMatchObject({ threadId: -1 })
    } finally {
      once.mockRestore()
      terminate.mockRestore()
    }
  })
  it('skjuler rå feil også når siste PDF.js-workerdestroy feiler', async () => {
    const originalDestroy = PDFWorker.prototype.destroy
    const destroy = vi.spyOn(PDFWorker.prototype, 'destroy').mockImplementation(function (this: PDFWorker) {
      originalDestroy.call(this)
      throw new Error('DO-NOT-EXPOSE last destroy')
    })
    try {
      await expect(validatePdf(await fixture('F1-tilstandsrapport.pdf'), 'rapport.pdf'))
        .rejects.toThrow(/^PDF-behandlingen kunne ikke avsluttes\. Prøv igjen\.$/)
    } finally { destroy.mockRestore() }
  })
  it('skjuler rå feil hvis sidetre-workerens terminate avvises etter ressursfrigjøring', async () => {
    const original = PageTreeWorker.prototype.terminate
    const terminate = vi.spyOn(PageTreeWorker.prototype, 'terminate').mockImplementation(async function (this: PageTreeWorker) {
      await original.call(this)
      throw new Error('DO-NOT-EXPOSE native terminate')
    })
    try {
      await expect(countPdfPages(await fixture('F1-tilstandsrapport.pdf')))
        .rejects.toThrow(/^PDF-sidene kunne ikke kontrolleres\. Prøv igjen\.$/)
      expect(terminate.mock.instances[0]).toMatchObject({ threadId: -1 })
    } finally { terminate.mockRestore() }
  })
})

describe('Story 2.2 AC4 – uavhengig fiktiv F1–F4-fasit og RT-5', () => {
  it('byteinventaret dekker alle de ti navngitte 2.2-fixturene, også avviste og tekstløse filer', async () => {
    expect(Object.keys(hashes).sort()).toEqual([
      'F1-tilstandsrapport.pdf', 'F2-tilstandsrapport.pdf', 'F3-tilstandsrapport.pdf', 'F4-tilstandsrapport.pdf',
      'F1-tilstandsrapport-endret.pdf', 'text-30-pages.pdf', 'text-31-pages.pdf',
      'without-text-layer.pdf', 'invalid-format.pdf', 'damaged-container.pdf',
    ].sort())
    for (const [name, hash] of Object.entries(hashes)) {
      expect(createHash('sha256').update(await fixture(name)).digest('hex'), name).toBe(hash)
    }
  })
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
