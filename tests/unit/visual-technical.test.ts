import { describe, expect, it } from 'vitest'
import { analyzeVisualTechnical, addVisualTechnical } from '../../src/backend/import/visual-technical.ts'
import { sourcesForVisualFinding, visualRegionUnion, visualFindingGeometryError, type LocalVisualEvidence, type LocalVisualPage } from '../../src/contracts/local-visual.ts'
import { DocumentImportSchema } from '../../src/contracts/document-import.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { codeFirstBasis } from '../helpers/code-first.ts'

const box = (x: number, y: number, width = 0.25, height = 0.012) => ({ x, y, width, height })
const line = (text: string, x: number, y: number, confidence = 1) => ({ text, confidence, box: box(x, y) })
function page(): LocalVisualPage {
  return { pdfPage: 1, width: 1190, height: 1684, rasterDigest: 'b'.repeat(64), error: null,
    symbols: [{ grade: 'TG3', box: box(0.08, 0.2, 0.035, 0.02), confidence: 1, text: 'TG3' }],
    lines: [line('Bad øst', 0.13, 0.204), line('Beskrivelse', 0.08, 0.24), line('Vurdering av avvik:', 0.08, 0.30),
      line('• Det er påvist lekkasje.', 0.08, 0.33), line('Konsekvens/tiltak', 0.08, 0.36)] }
}
const evidence = (input = page()): LocalVisualEvidence => ({ version: 'local-visual-1', documentHash: 'a'.repeat(64), documentName: 'test.pdf', pages: [input] })

describe('lokal visuell TG-kobling', () => {
  function continuedColumn() {
    const input = page()
    input.lines = [line('Tilstandsrapport', 0.13, 0.15), line('Bad øst', 0.13, 0.754), line('Beskrivelse', 0.08, 0.80),
      line('Vurdering av avvik:', 0.08, 0.86), line('• Det er påvist lekkasje', 0.08, 0.89),
      line('og råte i bjelkelaget.', 0.54, 0.21), line('Konsekvens/tiltak', 0.54, 0.25)]
    input.symbols[0]!.box.y = 0.75
    return input
  }
  it('bevarer avvik fra venstre spaltebunn til høyre spaltetopp i leserekkefølge', async () => {
    const input = continuedColumn(), result = analyzeVisualTechnical(evidence(input)), finding = result.pages[0]!.findings[0]!
    expect(finding).toMatchObject({ nextColumn: true, description: '• Det er påvist lekkasje\nog råte i bjelkelaget.', deviationLines: [4, 5] })
    const sources = sourcesForVisualFinding(result, result.pages[0]!, finding)
    expect(sources).toHaveLength(4)
    expect(sources.slice(2).map(source => source.quote)).toEqual(['• Det er påvist lekkasje', 'og råte i bjelkelaget.'])
    const basis = codeFirstBasis(['Rapport i to kolonner']); basis.pages[0]!.status = 'unknown'
    const ev = evidence(input); ev.documentHash = basis.hash; ev.documentName = basis.name
    const imported = addVisualTechnical(await createCodeFirstImport(basis), ev)
    expect(DocumentImportSchema.safeParse(imported).success).toBe(true)
    const invalidBoundary = structuredClone(imported)
    invalidBoundary.visualAnalysis!.pages[0]!.findings[0]!.boundaryLines[1] = 2000
    expect(DocumentImportSchema.safeParse(invalidBoundary).success).toBe(false)
    imported.visualAnalysis!.pages[0]!.findings[0]!.deviationLines.reverse()
    expect(DocumentImportSchema.safeParse(imported).success).toBe(false)
  })
  it.each(['new-component', 'low-confidence', 'missing-end', 'crossing', 'missing-report', 'missing-line', 'unknown-heading', 'weak-report', 'late-left'] as const)('avviser usikker kolonnefortsettelse: %s', kind => {
    const input = continuedColumn()
    if (kind === 'new-component') input.symbols.push({ grade: 'TG2', confidence: 1, text: 'TG2', box: box(.53, .19, .035, .02) })
    if (kind === 'low-confidence') input.lines[5]!.confidence = .4
    if (kind === 'missing-end') input.lines.pop()
    if (kind === 'crossing') input.lines[5]!.box.x = .40
    if (kind === 'missing-report') input.lines[0]!.text = 'En ukjent overskrift'
    if (kind === 'missing-line') input.lines.splice(6, 0, line('Ventilasjon', .54, .23))
    if (kind === 'unknown-heading') input.lines.splice(5, 0, line('Solcelleanlegg', .54, .20))
    if (kind === 'weak-report') input.lines[0]!.confidence = .1
    if (kind === 'late-left') input.lines.push(line('Solcelleanlegg', .08, .945))
    expect(analyzeVisualTechnical(evidence(input)).pages[0]!.findings).toEqual([])
  })
  it('utelater ikke høyre avvikslinjer nær rapportoverskriften', () => {
    const input = continuedColumn(); input.lines.push(line('Det gjelder ikke badet.', .54, .17))
    const finding = analyzeVisualTechnical(evidence(input)).pages[0]!.findings[0]
    expect(finding?.description).toContain('Det gjelder ikke badet.')
  })
  it('kontrakten avviser en senere avviksoverskrift som utelater første avsnitt', () => {
    const input = continuedColumn()
    const finding = analyzeVisualTechnical(evidence(input)).pages[0]!.findings[0]!
    input.lines.push(line('Vurdering av avvik:', .08, .875), line('Det er store skader i taket.', .08, .865))
    finding.boundaryLines[0] = 7
    expect(visualFindingGeometryError(input, finding)).toContain('tidligere avviksavsnitt')
    expect(analyzeVisualTechnical(evidence(input)).pages[0]!.findings).toEqual([])
  })
  it('kobler eksplisitt gradsymbol, bygningsdel og hele avviket med originale regioner', () => {
    const result = analyzeVisualTechnical(evidence()), found = result.pages[0]!.findings[0]!
    expect(found).toMatchObject({ component: 'Bad øst', description: '• Det er påvist lekkasje.', grade: 'TG3', componentLines: [0], deviationLines: [3], symbolIndex: 0 })
    expect(result.pages[0]!.status).toBe('uncertain')
    expect(found.gradeRegion).toEqual(page().symbols[0]!.box)
  })
  it('bevarer flere avvikslinjer uten å blande kolonner', () => {
    const input = page()
    input.lines.splice(4, 0, line('• Det er registrert råte.', 0.08, 0.345), line('Helt annet avvik.', 0.56, 0.34))
    input.symbols.push({ grade: 'TG1', confidence: 1, text: 'TG1', box: box(0.53, 0.2, 0.035, 0.02) })
    expect(analyzeVisualTechnical(evidence(input)).pages[0]!.findings[0]!.description).toBe('• Det er påvist lekkasje.\n• Det er registrert råte.')
  })
  it('tar ikke høyre kolonnes prosa når dens gradsymbol er uleselig', () => {
    const input = page(); input.lines.push(line('Skader fra annen bygningsdel.', 0.58, 0.345))
    input.symbols.push({ grade: null, confidence: 0, text: '', box: box(0.53, 0.2, 0.035, 0.02) })
    expect(analyzeVisualTechnical(evidence(input)).pages[0]!.findings[0]!.description).toBe('• Det er påvist lekkasje.')
  })
  it('fotofarger inne i kolonnen skaper ikke en falsk kolonnegrense', () => {
    const input = page(); input.lines[3]!.box.width = 0.38
    input.symbols.push({ grade: null, confidence: 0, text: '', box: box(0.32, 0.6, 0.04, 0.02) })
    expect(analyzeVisualTechnical(evidence(input)).pages[0]!.findings).toHaveLength(1)
  })
  it('bevarer komponentnavn som fortsetter på neste linje før beskrivelsen', () => {
    const input = page(); input.lines[0]!.text = 'Utvendige vannledninger'
    input.lines.splice(1, 0, line('og avløpsledninger', 0.13, 0.22))
    expect(analyzeVisualTechnical(evidence(input)).pages[0]!.findings[0]!.component).toBe('Utvendige vannledninger og avløpsledninger')
  })
  it('avviser et avvik når innrykket tekst ellers ville falle utenfor uttrekket', () => {
    const input = page()
    input.lines.splice(4, 0, line('Skaden omfatter også bjelkelaget.', 0.29, 0.345))
    const result = analyzeVisualTechnical(evidence(input))
    expect(result.pages[0]!.findings).toEqual([])
    expect(result.pages[0]!.reason).toContain('innrykk eller brede OCR-linjer')
  })
  it('avviser en OCR-linje som krysser kolonnegrensen istedenfor å forkorte avviket', () => {
    const input = page()
    input.symbols.push({ grade: 'TG1', confidence: 1, text: 'TG1', box: box(0.53, 0.2, 0.035, 0.02) })
    const crossing = line('Skaden omfatter også tilstøtende konstruksjoner.', 0.08, 0.345)
    crossing.box.width = 0.55; input.lines.splice(4, 0, crossing)
    expect(analyzeVisualTechnical(evidence(input)).pages[0]!.findings).toEqual([])
  })
  it('avviser usikker navnefortsettelse slik at rom eller plassering ikke forsvinner', () => {
    const input = page(); input.lines[0]!.text = 'Vanntett sjikt'
    input.lines.splice(1, 0, line('i badet i kjeller', 0.13, 0.22, 0.4))
    const result = analyzeVisualTechnical(evidence(input))
    expect(result.pages[0]!.findings).toEqual([])
    expect(result.pages[0]!.reason).toContain('Komponentnavnets fortsettelse')
  })
  it.each([0.4, 1])('utelater ikke en mulig navnefortsettelse uten Beskrivelse-etikett (score %s)', confidence => {
    const input = page()
    input.lines[0]!.text = 'Bad'
    input.lines[1] = line('i andre etasje', 0.13, 0.23, confidence)
    const result = analyzeVisualTechnical(evidence(input))
    expect(result.pages[0]!.findings).toEqual([])
    expect(result.pages[0]!.reason).toContain('Komponentnavnets fortsettelse')
  })
  it('senere avviksavsnitt etter første avslutning gjør ikke første funn tvetydig', () => {
    const input = page(); input.lines.push(line('Vurdering av avvik:', 0.08, 0.60))
    expect(analyzeVisualTechnical(evidence(input)).pages[0]!.findings).toHaveLength(1)
  })
  it('godtar avgrenset avvik som avslutter med parentes', () => {
    const input = page(); input.lines[3]!.text = '• Det er påvist avvik (ved sluk)'
    expect(analyzeVisualTechnical(evidence(input)).pages[0]!.findings).toHaveLength(1)
  })
  it('bevarer sikkert rom over bygningsdelen', () => {
    const input = page(); input.lines.push(line('LOFT > BAD', 0.08, 0.17))
    expect(analyzeVisualTechnical(evidence(input)).pages[0]!.findings[0]!.component).toBe('LOFT > BAD · Bad øst')
  })
  it('utelater ikke en uleselig romreferanse eller en komponentoverskrift som krysser kolonner', () => {
    const room = page(); room.lines.push(line('KJELLER > BAD', 0.08, 0.17, 0.4))
    expect(analyzeVisualTechnical(evidence(room)).pages[0]!.findings).toEqual([])
    const crossing = page(); crossing.lines[0]!.box.width = 0.55
    crossing.symbols.push({ grade: 'TG1', confidence: 1, text: 'TG1', box: box(0.53, 0.2, 0.035, 0.02) })
    expect(analyzeVisualTechnical(evidence(crossing)).pages[0]!.findings).toEqual([])
  })
  it('godtar lavere OCR-sikkerhet bare med samsvarende bevart tekst på samme fysiske side', () => {
    const input = page(); input.lines[3]!.confidence = 0.5
    expect(analyzeVisualTechnical(evidence(input)).pages[0]!.findings).toHaveLength(0)
    expect(analyzeVisualTechnical(evidence(input), [{ pdfPage: 1, text: '• Det er påvist lekkasje.' }]).pages[0]!.findings).toHaveLength(1)
    expect(analyzeVisualTechnical(evidence(input), [{ pdfPage: 2, text: '• Det er påvist lekkasje.' }]).pages[0]!.findings).toHaveLength(0)
    expect(analyzeVisualTechnical(evidence(input), [{ pdfPage: 1, text: '• Det er ikke påvist lekkasje.' }]).pages[0]!.findings).toHaveLength(0)
  })
  it('bevarer faktisk lav OCR-score når et separat tekstutsnitt bekrefter samme linje', () => {
    const input = page(), body = input.lines[3]!
    body.confidence = 0.5; body.cropReading = { text: '• Det er påvist lekkasje.', confidence: 0.5 }
    const result = analyzeVisualTechnical(evidence(input))
    expect(result.pages[0]!.findings).toHaveLength(1)
    expect(result.pages[0]!.findings[0]!.confidence).toBe(0.5)
    expect(result.pages[0]!.status).toBe('uncertain')
    body.cropReading.text = '• Det er ikke påvist lekkasje.'
    expect(analyzeVisualTechnical(evidence(input)).pages[0]!.findings).toEqual([])
    body.cropReading = { text: body.text, confidence: 0.4 }
    expect(analyzeVisualTechnical(evidence(input)).pages[0]!.findings).toEqual([])
  })
  it('beholder score men avviser motstridende OCR selv med sikkert tekstlag', () => {
    const input = page()
    input.lines[3] = { ...input.lines[3]!, conflictingReading: { text: '• Det er ikke påvist lekkasje.', confidence: 1 } }
    expect(input.lines[3]!.confidence).toBe(1)
    expect(analyzeVisualTechnical(evidence(input), [{ pdfPage: 1, text: '• Det er påvist lekkasje.' }]).pages[0]!.findings).toEqual([])
  })
  it('kontrakten etterprøver separat linjeutsnitt og tillater ikke endret benektelse', async () => {
    const basis = codeFirstBasis(['Uleselig raster']); basis.pages[0]!.status = 'unreadable'
    const input = evidence(); input.documentHash = basis.hash; input.documentName = basis.name
    input.pages[0]!.lines[3]!.confidence = 0.5
    input.pages[0]!.lines[3]!.cropReading = { text: input.pages[0]!.lines[3]!.text, confidence: 0.5 }
    const result = addVisualTechnical(await createCodeFirstImport(basis), input)
    expect(DocumentImportSchema.safeParse(result).success).toBe(true)
    result.visualAnalysis!.pages[0]!.lines[3]!.cropReading!.text = 'Ingen skader.'
    expect(DocumentImportSchema.safeParse(result).success).toBe(false)
  })
  it('avviser to gradsymboler som begge kan tilhøre samme komponent', () => {
    const input = page(); input.symbols.push({ grade: 'TG2', confidence: 1, text: 'TG2', box: box(0.08, 0.201, 0.035, 0.02) })
    expect(analyzeVisualTechnical(evidence(input)).pages[0]!.findings).toHaveLength(0)
  })
  it('bevarer lav faktisk badge-sikkerhet ved to samsvarende eksplisitte bildeavlesninger', () => {
    const input = page(), symbol = input.symbols[0]!
    symbol.confidence = 0.3; symbol.text = '! TG3'; symbol.agreement = 'two-pass'
    symbol.readings = [{ text: '! TG3', confidence: 0.3 }, { text: '0TG3', confidence: 0.3 }]
    const result = analyzeVisualTechnical(evidence(input))
    expect(result.pages[0]!.findings).toHaveLength(1)
    expect(result.pages[0]!.findings[0]!.confidence).toBe(0.3)
    symbol.readings[1]!.text = 'TG2'
    expect(analyzeVisualTechnical(evidence(input)).pages[0]!.findings).toHaveLength(0)
    symbol.readings = [{ text: 'TG3', confidence: 0.3 }]
    expect(analyzeVisualTechnical(evidence(input)).pages[0]!.findings).toHaveLength(0)
    symbol.readings = [{ text: 'TG3', confidence: 0.3 }, { text: 'TG12', confidence: 0.3 }]
    expect(analyzeVisualTechnical(evidence(input)).pages[0]!.findings).toHaveLength(0)
  })
  it('avviser umerket ny komponent inne i avviksblokken', () => {
    const input = page(); input.lines.splice(4, 0, line('Ventilasjon', 0.08, 0.34))
    expect(analyzeVisualTechnical(evidence(input)).pages[0]!.findings).toHaveLength(0)
  })
  it.each(['grade', 'symbol-confidence', 'heading-confidence', 'body-confidence', 'ambiguous-heading', 'no-deviation', 'no-ending', 'negated', 'possible', 'unterminated', 'next-heading', 'render-error', 'digest'] as const)('avviser usikkert belegg: %s', kind => {
    const input = page()
    if (kind === 'grade') input.symbols[0]!.grade = null
    if (kind === 'symbol-confidence') input.symbols[0]!.confidence = 0.5
    if (kind === 'heading-confidence') input.lines[0]!.confidence = 0.4
    if (kind === 'body-confidence') input.lines[3]!.confidence = 0.4
    if (kind === 'ambiguous-heading') input.lines.push(line('Tak', 0.13, 0.204))
    if (kind === 'no-deviation') input.lines[2]!.text = 'Uklart avsnitt'
    if (kind === 'no-ending') input.lines.pop()
    if (kind === 'negated') input.lines[3]!.text = 'Ingen skader.'
    if (kind === 'possible') input.lines[3]!.text = 'Det er mulig lekkasje.'
    if (kind === 'unterminated') input.lines[3]!.text = 'Avviket fortsetter'
    if (kind === 'next-heading') input.symbols.push({ grade: null, confidence: 1, text: '?', box: box(0.08, 0.28, 0.035, 0.02) })
    if (kind === 'render-error') input.error = 'Lokal OCR var utilgjengelig.'
    if (kind === 'digest') input.rasterDigest = null
    expect(analyzeVisualTechnical(evidence(input)).pages[0]!.findings).toEqual([])
  })
  it('avgrenser samme kolonne og tar aldri avvik fra neste bygningsdel', () => {
    const input = page()
    input.symbols.push({ grade: 'TG2', confidence: 1, text: 'TG2', box: box(0.08, 0.27, 0.035, 0.02) })
    input.lines.push(line('Tak', 0.13, 0.274))
    expect(analyzeVisualTechnical(evidence(input)).pages[0]!.findings.map(item => item.component)).toEqual(['Tak'])
  })
  it('integrerer uten å endre økonomi, PDF-tekst eller kontrollgrunnlag', async () => {
    const basis = codeFirstBasis(['Ufullstendig teknisk side']); basis.pages[0]!.status = 'unknown'
    const original = await createCodeFirstImport(basis), input = evidence()
    input.documentHash = basis.hash; input.documentName = basis.name
    const result = addVisualTechnical(original, input), finding = result.propertyRisk!.technical.findings.find(item => item.sourceQuality === 'local-visual')!
    expect(result.economy).toEqual(original.economy)
    expect(result.pages).toEqual(original.pages)
    expect(result.technical).toEqual(original.technical)
    expect(result.coverage.technical.status).not.toBe('complete')
    expect(finding.grade).toBe('TG3')
    expect(finding.sources).toEqual([])
    expect(finding.visualSources).toHaveLength(3)
    expect(finding.visualSources![0]).toMatchObject({ documentHash: basis.hash, documentName: basis.name, pdfPage: 1, method: 'local-vision', quote: 'Bad øst' })
    expect(finding.visualSources![0]).not.toHaveProperty('start')
    expect(DocumentImportSchema.safeParse(result).success).toBe(true)
    for (const mutation of ['hash', 'quote', 'region', 'symbol', 'ocr', 'references', 'no-evidence', 'quality'] as const) {
      const tampered = structuredClone(result), item = tampered.propertyRisk!.technical.findings.find(value => value.sourceQuality === 'local-visual')!
      if (mutation === 'hash') item.visualSources![0]!.documentHash = 'c'.repeat(64)
      if (mutation === 'quote') item.visualSources![0]!.quote = 'Oppdiktet'
      if (mutation === 'region') item.visualSources![0]!.region.x = 0.3
      if (mutation === 'symbol') tampered.visualAnalysis!.pages[0]!.symbols[0]!.grade = 'TG2'
      if (mutation === 'ocr') tampered.visualAnalysis!.pages[0]!.lines[0]!.text = 'Annen komponent'
      if (mutation === 'references') tampered.visualAnalysis!.pages[0]!.findings[0]!.deviationLines = [999]
      if (mutation === 'no-evidence') delete tampered.visualAnalysis
      if (mutation === 'quality') item.sourceQuality = 'readable-text'
      expect(DocumentImportSchema.safeParse(tampered).success, mutation).toBe(false)
    }
  })
  it('avviser visuelle funn fra et annet dokument', async () => {
    const original = await createCodeFirstImport(codeFirstBasis(['test']))
    expect(() => addVisualTechnical(original, evidence())).toThrow('visual-document-mismatch')
  })
  it.each(['component-column', 'symbol-row', 'boundary-before-component', 'omitted-body', 'omitted-name', 'omitted-name-without-description', 'ambiguous-heading'] as const)('kontrakten avviser konsistent omskrevet geometri: %s', async kind => {
    const basis = codeFirstBasis(['Ufullstendig teknisk side']); basis.pages[0]!.status = 'unknown'
    const input = evidence(); input.documentHash = basis.hash; input.documentName = basis.name
    const result = addVisualTechnical(await createCodeFirstImport(basis), input)
    const analysis = result.visualAnalysis!, visualPage = analysis.pages[0]!, finding = visualPage.findings[0]!
    const risk = result.propertyRisk!.technical.findings.find(item => item.sourceQuality === 'local-visual')!
    if (kind === 'component-column') visualPage.lines[0]!.box.x = 0.58
    if (kind === 'symbol-row') visualPage.symbols[0]!.box.y = 0.10
    if (kind === 'boundary-before-component') {
      visualPage.lines[2]!.box.y = 0.10; visualPage.lines[3]!.box.y = 0.12; visualPage.lines[4]!.box.y = 0.15
    }
    if (kind === 'omitted-body') visualPage.lines.push(line('Det er også påvist skader i bjelkelaget.', 0.08, 0.345))
    if (kind === 'omitted-name') visualPage.lines.push(line('i badet i kjeller', 0.13, 0.22, 0.4))
    if (kind === 'omitted-name-without-description') visualPage.lines[1] = line('i andre etasje', 0.13, 0.23, 0.4)
    if (kind === 'ambiguous-heading') visualPage.lines.push(line('Tak', 0.13, 0.204))
    // Oppdater alle avledede regioner og risikokilder konsistent; bare den
    // geometriske koblingen eller fullstendigheten er nå feil.
    finding.componentRegion = visualRegionUnion(finding.componentLines.map(index => visualPage.lines[index]!.box))
    finding.deviationRegion = visualRegionUnion(finding.deviationLines.map(index => visualPage.lines[index]!.box))
    finding.gradeRegion = visualPage.symbols[finding.symbolIndex]!.box
    risk.visualSources = sourcesForVisualFinding(analysis, visualPage, finding)
    expect(DocumentImportSchema.safeParse(result).success).toBe(false)
  })
  it('teller samme eksplisitte tekst- og bildedetalj én gang og bevarer begge kildetyper', async () => {
    const basis = codeFirstBasis(['Bygningsdel: Bad øst\nTilstandsgrad: TG3\nVurdering av avvik:\n• Det er påvist lekkasje.\nKonsekvens/tiltak\nUtbedring anbefales.'])
    const original = await createCodeFirstImport(basis), input = evidence()
    input.documentHash = basis.hash; input.documentName = basis.name
    const result = addVisualTechnical(original, input)
    const details = result.propertyRisk!.technical.findings.filter(item => item.grade === 'TG3' && item.evidenceKind === 'detail')
    expect(details).toHaveLength(1)
    expect(details[0]!.sources.length).toBeGreaterThan(0)
    expect(details[0]!.visualSources).toHaveLength(3)
    expect(result.technical.findings).toEqual(original.technical.findings)
  })
})
