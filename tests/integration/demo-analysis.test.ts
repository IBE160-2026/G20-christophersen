import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'
import { extractPdf } from '../../src/backend/documents/extract-pdf.ts'
import { analyzeDocument } from '../../src/backend/analysis/analyze-document.ts'
import { createDemoAdapter } from '../../src/backend/analysis/demo-adapter.ts'
import { AnalysisOutcomeSchema } from '../../src/contracts/document-analysis.ts'
import { validateAnalysisOutcome } from '../../src/contracts/analysis-validation.ts'

const root = new URL('../fixtures/property-cases/', import.meta.url)
// Uavhengig, håndskrevet fasit fra Story 2.2, aldri produktets lagrede svar.
const oracle = JSON.parse(await readFile(new URL('expected.json', root), 'utf8')) as {
  cases: { documentName: string; pageCount: number; findings: {
    id: string; description: string; grade: string; documentName: string; pdfPage: number; printedPage: number | null
  }[] }[]
}
async function basis(file: string, documentName = file, directory = root) {
  const bytes = await readFile(new URL(file, directory))
  const format = await validatePdf(bytes, documentName)
  if (format.status !== 'format-validated') throw new Error('Forventet gyldig PDF-fixture.')
  const extraction = await extractPdf(format, { requestId: 'story-2-4', mode: 'demo' })
  expect(extraction.document.reportHash).toBe(createHash('sha256').update(bytes).digest('hex'))
  return extraction
}

describe('Story 2.4 AC1/AC3 – ekte PDF-pipeline og lokale lagrede svar', () => {
  it('standard demo virker i ny prosess uten miljønøkler og med nettfunksjoner sperret', () => {
    const helper = new URL('../helpers/demo-without-network.mjs', import.meta.url)
    expect(execFileSync(process.execPath, [fileURLToPath(helper)], {
      env: {}, encoding: 'utf8', timeout: 15_000,
    }).trim()).toBe('demo: completed; nettforespørsler: 0; miljøvariabler: 0')
  })

  it.each(oracle.cases)('$documentName følger kontrakt og uavhengig side-/funnfasit', async expected => {
    const { document, error } = await basis(expected.documentName)
    expect(error).toBeNull()
    const result = await analyzeDocument(document)
    expect(AnalysisOutcomeSchema.safeParse(result).success).toBe(true)
    expect(validateAnalysisOutcome(result, {
      contractVersion: '2', extractionVersion: '1', requestId: document.requestId,
      reportHash: document.reportHash, documentName: document.documentName,
      mode: 'demo', pageCount: expected.pageCount,
    }).success).toBe(true)
    expect(result.status).toBe('completed')
    if (result.status !== 'completed') throw new Error('Forventet fullført demo.')
    expect(result.uncertainCandidates).toEqual([])
    // Demoopphav følger mode/merking; de komplette F1–F4-uttrekkene har ingen rapportmangel.
    expect(result.limitations).toEqual([])
    expect(result.findings.map(finding => ({
      id: finding.findingId, description: finding.description, grade: finding.grade,
      documentName: finding.source.documentName, pdfPage: finding.source.pdfPage,
    }))).toEqual(expected.findings.map(({ id, description, grade, documentName, pdfPage }) => ({
      id, description, grade, documentName, pdfPage,
    })))
    for (const finding of result.findings) {
      expect(finding.source.reportHash).toBe(document.reportHash)
      const originalPage = document.pages[finding.source.pdfPage - 1]!
      expect(originalPage.status).toBe('readable')
      expect(originalPage.text).toContain(`Tilstandsgrad: ${finding.grade}`)
      expect(originalPage.text).toContain(finding.description)
      expect(finding.original.source).toEqual(finding.source)
    }
    // Alle eksplisitte grader finnes på de fysiske sidene; ikke bare antall/JSON.
    const physicalGrades = document.pages.flatMap(page => Array.from(
      page.text.matchAll(/Tilstandsgrad: (TG[23])/g), match => ({ pdfPage: page.pdfPage, grade: match[1] })))
    expect(result.findings.map(finding => ({ pdfPage: finding.source.pdfPage, grade: finding.grade }))).toEqual(physicalGrades)
    if (expected.documentName.startsWith('F4')) {
      expect(document.pages[3]!.text).toContain('Trykt side 2')
      expect(result.findings.find(finding => finding.grade === 'TG3')?.source.pdfPage).toBe(4)
    }
  })

  it('samme PDF gir identisk resultat ved gjentakelse og etter mutert retur', async () => {
    const { document } = await basis('F4-tilstandsrapport.pdf')
    const first = await analyzeDocument(document)
    const pristine = structuredClone(first)
    for (let attempt = 0; attempt < 3; attempt++) expect(await analyzeDocument(document)).toEqual(pristine)
    if (first.status !== 'completed') throw new Error('Forventet fullført demo.')
    first.findings[0]!.source.pdfPage = 1
    first.limitations.push('Mutert retur')
    expect(await analyzeDocument(document)).toEqual(pristine)
    const newRequest = await analyzeDocument({ ...document, requestId: 'ny-forespørsel' })
    expect(newRequest).toEqual({ ...pristine, requestId: 'ny-forespørsel' })
  })

  it('samme adapter holder samtidige F1/F4-kall og returmutasjoner adskilt', async () => {
    const f1 = (await basis('F1-tilstandsrapport.pdf')).document
    const f4 = (await basis('F4-tilstandsrapport.pdf')).document
    const adapter = createDemoAdapter()
    const documents = [f1, f4, f1, f4].map((document, index) => ({
      ...document, requestId: `delt-adapter-${index}`,
    }))
    const results = await Promise.all(documents.map(document => analyzeDocument(document, adapter)))
    for (const [index, result] of results.entries()) {
      const document = documents[index]!
      const expected = oracle.cases.find(item => item.documentName === document.documentName)!
      expect(result).toMatchObject({ status: 'completed', requestId: document.requestId,
        reportHash: document.reportHash, documentName: document.documentName })
      if (result.status !== 'completed') throw new Error('Forventet fullført demo.')
      expect(result.findings.map(finding => ({ id: finding.findingId, grade: finding.grade,
        description: finding.description, pdfPage: finding.source.pdfPage }))).toEqual(
        expected.findings.map(finding => ({ id: finding.id, grade: finding.grade,
          description: finding.description, pdfPage: finding.pdfPage })))
      for (const finding of result.findings) expect(finding.source.reportHash).toBe(document.reportHash)
    }
    const pristine = structuredClone(results)
    const first = results[0]!
    const repeatedF1 = results[2]!
    if (first.status !== 'completed' || repeatedF1.status !== 'completed') throw new Error('Forventet fullført demo.')
    expect(first.findings).not.toBe(repeatedF1.findings)
    expect(first.findings[0]!.source).not.toBe(repeatedF1.findings[0]!.source)
    expect(first.findings[0]!.original).not.toBe(repeatedF1.findings[0]!.original)
    first.findings[0]!.source.pdfPage = 1
    first.limitations.push('Mutert første F1-retur')
    expect(results.slice(1)).toEqual(pristine.slice(1))
    expect(await Promise.all(documents.map(document => analyzeDocument(document, adapter)))).toEqual(pristine)
  })

  it('identiske bytes med nytt navn finner samme hash uten å skrive om originalkilden', async () => {
    const { document } = await basis('F1-tilstandsrapport.pdf', '../../annet-navn.pdf')
    const result = await analyzeDocument(document)
    expect(result.status).toBe('completed')
    if (result.status !== 'completed') throw new Error('Forventet lagret uttrekk.')
    expect(result.findings).toEqual([])
    expect(result.uncertainCandidates[0]?.original.source?.documentName).toBe('F1-tilstandsrapport.pdf')
    expect(result.uncertainCandidates[0]?.issues.map(issue => issue.code)).toEqual(['document-mismatch'])
  })
})

describe('Story 2.4 AC2 – riktig rapport, ingen cache fra annen PDF', () => {
  it('F2 under F1-navn får F2-hash og aldri F1-uttrekket', async () => {
    const { document } = await basis('F2-tilstandsrapport.pdf', 'F1-tilstandsrapport.pdf')
    const result = await analyzeDocument(document)
    expect(result.status).toBe('completed')
    if (result.status !== 'completed') throw new Error('Forventet F2-uttrekk.')
    expect(result.findings).toEqual([])
    expect(result.uncertainCandidates.map(candidate => candidate.findingId)).toEqual(['F2-TG2-1'])
    expect(result.uncertainCandidates[0]?.original.source?.reportHash).toBe(document.reportHash)
  })

  it.each(['F1-tilstandsrapport-endret.pdf', 'text-30-pages.pdf'])('%s gir manglende demosvar selv under F1-navn', async file => {
    const { document, error } = await basis(file, 'F1-tilstandsrapport.pdf')
    expect(error).toBeNull()
    const result = await analyzeDocument(document)
    expect(result).toMatchObject({ status: 'failed', mode: 'demo', reportHash: document.reportHash,
      error: { kind: 'analysis', code: 'adapter-failure', reason: 'Det finnes ikke et lagret demo-uttrekk for denne rapporthashen.' }, partialResult: null })
    expect(result).not.toHaveProperty('findings')
  })

  it.each(['mixed-status.pdf', 'uncertain-content.pdf', 'blank-variants.pdf'])('%s stanser før demooppslag og bevarer dokumentfeil', async file => {
    const directory = new URL('../fixtures/pdf-readability/', import.meta.url)
    const { document, error } = await basis(file, file, directory)
    let lookups = 0
    const adapter = createDemoAdapter(async () => { lookups++; throw new Error('Skal ikke kalles') })
    expect(await analyzeDocument(document, adapter)).toMatchObject({ status: 'failed', error, partialResult: null })
    expect(lookups).toBe(0)
  })
})
