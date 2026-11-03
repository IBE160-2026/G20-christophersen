import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { extractLocalVisualEvidence } from '../../src/backend/documents/local-visual-ocr.ts'
import { analyzeVisualTechnical } from '../../src/backend/import/visual-technical.ts'
import { visualReportPdf } from '../helpers/visual-report-pdf.ts'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'
import { extractPdf } from '../../src/backend/documents/extract-pdf.ts'
import { rasterVisualReportPdf } from '../helpers/raster-visual-report.ts'
import { runImport } from '../../src/backend/http/run-import.ts'

describe.skipIf(process.platform !== 'darwin' || process.env.PAA_TEST_LOCAL_VISION !== '1')('ekte lokal renderer og OCR på fiktiv rapport', () => {
  it('binder TG3/TG2 i to kolonner, og tolker aldri farge alene eller TG1 som TG2/TG3', async () => {
    const bytes = visualReportPdf(), hash = createHash('sha256').update(bytes).digest('hex')
    const evidence = await extractLocalVisualEvidence(bytes, hash, 'Fiktiv-generell-rapport.pdf', [1])
    expect(evidence.pages[0]!.error).toBeNull()
    expect(evidence.pages[0]!.symbols.filter(symbol => symbol.grade === 'TG2' || symbol.grade === 'TG3').map(symbol => symbol.grade).sort()).toEqual(['TG2', 'TG3'])
    const format = await validatePdf(bytes, 'Fiktiv-generell-rapport.pdf')
    expect(format.status).toBe('format-validated')
    if (format.status !== 'format-validated') throw new Error('Ugyldig syntetisk test-PDF')
    const { document } = await extractPdf(format, { requestId: 'native-local-visual', mode: 'demo' })
    const analysis = analyzeVisualTechnical(evidence, document.pages)
    expect(analysis.pages[0]!.findings.map(finding => [finding.component, finding.grade]).sort()).toEqual([['Grunnmur', 'TG3'], ['Tak', 'TG2']])
    expect(analysis.pages[0]!.findings.every(finding => finding.description.endsWith('.'))).toBe(true)
    expect(evidence.pages[0]!.symbols.some(symbol => symbol.grade === null)).toBe(true)
    expect(analysis.pages[0]!.status).toBe('uncertain')
  }, 45_000)
  it('bruker bildefallback automatisk i separat vektorrapport uten raster eller kjente rapportgrenser', async () => {
    const bytes = visualReportPdf()
    const outcome = await runImport({ bytes, documentName: 'Annen-fiktiv-rapport.pdf', requestId: 'native-visual-import', sessionId: 'native-visual-import', role: 'report', parentHash: null, attachmentId: null }, new AbortController().signal, new Set())
    expect(outcome.visualAnalysis?.pages[0]?.findings.map(finding => [finding.component, finding.grade]).sort()).toEqual([['Grunnmur', 'TG3'], ['Tak', 'TG2']])
    expect(outcome.propertyRisk?.technical.findings.filter(finding => finding.sourceQuality === 'local-visual')).toHaveLength(2)
    expect(outcome.coverage.technical.status).toBe('incomplete')
    expect(outcome.cost?.reservedUsd).toBe('0.00000000')
  }, 45_000)
  it.each([false, true])('leser faktisk rasterrapport (svart-hvitt=%s) uten PDF-tekst eller fargebasert gradgjetting', async monochrome => {
    const bytes = await rasterVisualReportPdf(visualReportPdf({ monochrome, closeHeading: true }), monochrome)
    const outcome = await runImport({ bytes, documentName: 'Rasterisert-fiktiv-rapport.pdf', requestId: `native-raster-${monochrome}`, sessionId: 'native-raster', role: 'report', parentHash: null, attachmentId: null }, new AbortController().signal, new Set())
    expect(outcome.pages[0]!.text.trim()).toBe('')
    expect(outcome.pages[0]!.rasterUnprocessed).toBe(true)
    const details = outcome.visualAnalysis?.pages[0]?.findings ?? []
    expect(details.map(finding => [finding.component, finding.grade]).sort()).toEqual([['Grunnmur', 'TG3'], ['Tak', 'TG2']])
    expect(details.every(finding => finding.description.endsWith('.') && finding.gradeRegion.x < finding.componentRegion.x && finding.deviationRegion.y > finding.componentRegion.y)).toBe(true)
    expect(outcome.propertyRisk?.technical.findings.filter(finding => finding.sourceQuality === 'local-visual').every(finding => finding.visualSources?.length === 3)).toBe(true)
    expect(outcome.visualAnalysis?.pages[0]!.symbols.filter(symbol => symbol.grade === 'TG2' || symbol.grade === 'TG3')).toHaveLength(2)
    expect(outcome.coverage.technical.status).toBe('incomplete')
  }, 90_000)

  it('bevarer separat TG-token og komponentgeometri når Vision leser dem som én linje', async () => {
    const bytes=visualReportPdf({inlineHeading:true})
    const outcome=await runImport({bytes,documentName:'Innledende-TG-og-navn.pdf',requestId:'inline-native',sessionId:'inline-native',role:'report',parentHash:null,attachmentId:null},new AbortController().signal,new Set())
    const page=outcome.visualAnalysis?.pages[0]
    expect(page?.findings.map(finding=>[finding.component,finding.grade]).sort()).toEqual([['Grunnmur','TG3'],['Tak','TG2']])
    for(const finding of page!.findings) {
      expect(finding.componentLines.map(index=>page!.lines[index]!.text)).toEqual([finding.component])
      expect(finding.componentRegion.x).toBeGreaterThan(finding.gradeRegion.x+finding.gradeRegion.width-0.008)
    }
  },45_000)

  it('leser eksplisitt TG3 på mørkerødt skilt uten grønnkanal og uten dobbelt symbol', async () => {
    const bytes=visualReportPdf({darkRed:true}),hash=createHash('sha256').update(bytes).digest('hex')
    const evidence=await extractLocalVisualEvidence(bytes,hash,'Fiktiv-morkerod-rapport.pdf',[1])
    expect(evidence.pages[0]!.symbols.filter(symbol=>symbol.grade==='TG3')).toHaveLength(1)
    expect(evidence.pages[0]!.symbols.filter(symbol=>symbol.grade==='TG2')).toHaveLength(1)
  },45_000)

})
