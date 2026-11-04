import { describe, expect, it } from 'vitest'
import { enrichImportWithLocalVisual, fitVisualEvidence } from '../../src/backend/documents/visual-import.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { codeFirstBasis } from '../helpers/code-first.ts'

describe('automatisk lokal bildefallback i dokumentimport', () => {
  it('bevarer lesbar tekstimport uten å kreve lokalt OCR-verktøy', async () => {
    const original = await createCodeFirstImport(codeFirstBasis(['TILSTANDSRAPPORT - START\nTilstandsgrad: TG2\nBygningsdel: Tak\nDet er påvist skader i taket.\nTILSTANDSRAPPORT - SLUTT']))
    expect(original.technical.findings).toHaveLength(1)
    expect(await enrichImportWithLocalVisual(original, new Uint8Array())).toBe(original)
  })
  it('beholder hele identifiserte rapportområdet ved bildefeil og utelater prospektets øvrige sider', async () => {
    const basis = codeFirstBasis(['Prospekt', 'TILSTANDSRAPPORT - START', 'Ufullstendig rapporttekst', 'TILSTANDSRAPPORT - SLUTT', 'Vedlegg'])
    basis.pages[2]!.status = 'unknown'
    const original = await createCodeFirstImport(basis)
    const result = await enrichImportWithLocalVisual(original, new Uint8Array())
    expect(result.visualAnalysis?.pages.map(page => page.pdfPage)).toEqual([2, 3, 4])
    expect(result.visualAnalysis?.pages.every(page => page.status === 'unavailable' && page.findings.length === 0)).toBe(true)
    expect(result.coverage).toEqual(original.coverage)
    expect(result.economy).toEqual(original.economy)
    expect(result.technical).toEqual(original.technical)
    expect(result.pages).toEqual(original.pages)
  })
  it('forsøker alle fysiske sider i separat rapport med ukjente grenser, aldri et helt uidentifisert prospekt', async () => {
    const basis = codeFirstBasis(['Ukjent grafisk rapport', 'Uleselig side'])
    basis.pages[1]!.status = 'unreadable'
    const prospectus = await createCodeFirstImport(basis)
    expect(await enrichImportWithLocalVisual(prospectus, new Uint8Array())).toBe(prospectus)
    basis.role = 'report'
    const report = await createCodeFirstImport(basis)
    const result = await enrichImportWithLocalVisual(report, new Uint8Array())
    expect(result.visualAnalysis?.pages.map(page => page.pdfPage)).toEqual([1, 2])
    expect(result.coverage.technical.status).toBe('incomplete')
    expect(result.cost?.reservedUsd).toBe('0.00000000')
  })
  it('bevarer tekstimport og forklarer bildesider når samlet tidsbudsjett er brukt opp', async () => {
    const basis = codeFirstBasis(['Ukjent grafisk rapport']); basis.role = 'report'; basis.pages[0]!.status = 'unknown'
    const original = await createCodeFirstImport(basis)
    const result = await enrichImportWithLocalVisual(original, new Uint8Array(), { deadlineMs: 0 })
    expect(result.visualAnalysis?.pages[0]).toMatchObject({ pdfPage: 1, status: 'unavailable', findings: [] })
    expect(result.visualAnalysis?.pages[0]?.reason).toContain('tidsbudsjett')
    expect(result.pages).toEqual(original.pages)
    expect(result.economy).toEqual(original.economy)
    expect(result.technical).toEqual(original.technical)
  })
  it('bevarer originale kilder og utelater hele bildepager eksplisitt før svargrensen', async () => {
    const basis = codeFirstBasis(['Adresse: Testveien 12\nPrisantydning: 3 000 000 kr']); basis.role = 'report'
    const original = await createCodeFirstImport(basis)
    const budget = Buffer.byteLength(JSON.stringify(original)) + 1600
    const result = fitVisualEvidence(original, { version: 'local-visual-1', documentHash: original.reportHash, documentName: original.documentName,
      pages: [{ pdfPage: 1, width: 1000, height: 1400, rasterDigest: 'a'.repeat(64), error: null, symbols: [],
        lines: Array.from({ length: 12 }, (_, index) => ({ text: 'Fiktiv avvikstekst '.repeat(180), confidence: 1, box: { x: 0.1, y: 0.1 + index * .02, width: .5, height: .01 } })) }] }, budget)
    expect(Buffer.byteLength(JSON.stringify(result))).toBeLessThanOrEqual(budget)
    expect(result.visualAnalysis?.pages[0]).toMatchObject({ pdfPage: 1, rasterDigest: null, lines: [], symbols: [], findings: [], status: 'unavailable' })
    expect(result.visualAnalysis?.pages[0]?.reason).toContain('svarbudsjett')
    expect(result.economy).toEqual(original.economy)
    expect(result.pages).toEqual(original.pages)
    expect(result.coverage.technical.status).toBe('incomplete')
  })
  it('returnerer opprinnelig ufullstendig tekstgrunnlag med alle begrunnelser når ingen ekstra bildemetadata får plass', async () => {
    const original = await createCodeFirstImport(codeFirstBasis(['Ukjent rapporttekst']))
    const budget = Buffer.byteLength(JSON.stringify(original))
    const result = fitVisualEvidence(original, { version: 'local-visual-1', documentHash: original.reportHash, documentName: original.documentName,
      pages: [{ pdfPage: 1, width: 1, height: 1, rasterDigest: null, error: 'Bildeanalyse utilgjengelig.', lines: [], symbols: [] }] }, budget)
    expect(result).toBe(original)
    expect(Buffer.byteLength(JSON.stringify(result))).toBeLessThanOrEqual(budget)
    expect(result.coverage).toEqual(original.coverage)
    expect(result.coverage.technical.status).toBe('incomplete')
  })
})

it('rasterlogo alene utløser ikke OCR av lesbar prosa; grafiske detaljer og manglende tekst prioriteres uten skjult dekning', async () => {
  const { pagesNeedingVisualSupplement } = await import('../../src/backend/documents/visual-import.ts')
  const basis = codeFirstBasis([
    'TILSTANDSRAPPORT - START\n' + 'Dette er lesbar digital informasjon om rapportens forutsetninger. '.repeat(10),
    'Vinduer\nBeskrivelse\n' + 'Vinduene er undersøkt med grafisk tilstandsgrad. '.repeat(8),
    'Side 3',
    'TILSTANDSRAPPORT - SLUTT',
  ])
  basis.pages[0]!.rasterUnprocessed = true
  basis.pages[1]!.rasterUnprocessed = true
  basis.pages[2]!.status = 'unreadable'
  const original = await createCodeFirstImport(basis)
  expect(pagesNeedingVisualSupplement(original).map(page => page.pdfPage)).toEqual([2, 3])
  const result = await enrichImportWithLocalVisual(original, new Uint8Array(), { deadlineMs: 0 })
  expect(result.visualAnalysis?.pages.map(page => page.pdfPage)).toEqual([1, 2, 3, 4])
  expect(result.visualAnalysis?.pages[0]?.reason).toContain('ikke bildekontrollert')
  expect(result.pages).toEqual(original.pages)
  expect(result.coverage.technical.status).toBe('incomplete')
})

it('lesbar uløst TG-kandidat får bildesupplement også uten rasterflagg', async () => {
  const { pagesNeedingVisualSupplement } = await import('../../src/backend/documents/visual-import.ts')
  const original = await createCodeFirstImport(codeFirstBasis(['TILSTANDSRAPPORT - START\nUavklart TG2\nTILSTANDSRAPPORT - SLUTT']))
  expect(original.pages[0]?.rasterUnprocessed).toBe(false)
  expect(pagesNeedingVisualSupplement(original).map(page => page.pdfPage)).toEqual([1])
  const result = await enrichImportWithLocalVisual(original, new Uint8Array(), { deadlineMs: 0 })
  expect(result.visualAnalysis?.pages[0]?.reason).toContain('tidsbudsjett')
})
