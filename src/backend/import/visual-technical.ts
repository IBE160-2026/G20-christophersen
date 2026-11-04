import { createHash } from 'node:crypto'
import { DocumentImportSchema, normalizeImportText } from '../../contracts/document-import.ts'
import type { DocumentImport } from '../../contracts/document-import.ts'
import { LocalVisualEvidenceSchema, composeVisualComponent, hasSupportedVisualGrade, sourcesForVisualFinding, visualRegionUnion, isVisualComponentName, visualHeadingAligned, visualLayoutForHeading, visualFindingGeometryError, hasCorroboratedVisualLine, visualNextColumn } from '../../contracts/local-visual.ts'
import type { LocalVisualEvidence, LocalVisualPage, VisualAnalysis } from '../../contracts/local-visual.ts'
import { deviationStatus } from './technical-risk.ts'
import { isTechnicalComponent } from './technical-summary.ts'

const normalize = (value: string) => value.toLocaleLowerCase('nb-NO').replace(/[•*−]/gu, '').replace(/\s+/gu, ' ').trim()
const componentName = isVisualComponentName
const deviationLabel = (text: string) => /^Vurdering av avvik\s*:?[ \t]*$/iu.test(text)
const endingLabel = (text: string) => /^(?:Konsekvens\s*\/?\s*tiltak|Tiltak|Kostnadsestimat|Anbefalte tiltak)\s*:?[ \t]*$/iu.test(text)

/** OCR-geometri binder bare en komponent og et eksplisitt lest gradsymbol
 * i samme kolonne til et avgrenset avvik. Fortsettelser gjettes aldri. */
function resolvePage(page: LocalVisualPage, originalText = ''): VisualAnalysis['pages'][number] {
  const findings: VisualAnalysis['pages'][number]['findings'] = []
  if (page.error || !page.rasterDigest) return { ...page, findings, status: 'unavailable', reason: page.error ?? 'Originalsiden kunne ikke rendres lokalt.' }
  const unresolved: string[] = []
  const corroboratedText = normalizeImportText(originalText).text
  const reliable = (line: LocalVisualPage['lines'][number], threshold: number) => !line.conflictingReading && (line.confidence >= threshold
    || hasCorroboratedVisualLine(line)
    || line.confidence >= 0.5 && corroboratedText.includes(normalizeImportText(line.text).text))
  const reliableLabel = (line: LocalVisualPage['lines'][number]) => reliable(line, 0.7)
    || !line.conflictingReading && line.confidence >= 0.5 && corroboratedText.replace(/[^\p{L}]/gu, '').includes(normalizeImportText(line.text).text.replace(/[^\p{L}]/gu, ''))
  for (const [symbolIndex, symbol] of page.symbols.entries()) {
    if (symbol.grade !== 'TG2' && symbol.grade !== 'TG3') { if (symbol.grade === null) unresolved.push('Uavklart gradsymbol.'); continue }
    if (!hasSupportedVisualGrade(symbol)) { unresolved.push('TG-symbolet har utilstrekkelig lokal lesesikkerhet eller mangler samsvarende avlesninger.'); continue }
    const aligned = page.lines.map((line, index) => ({ ...line, index })).filter(line =>
      reliable(line, 0.7) && visualHeadingAligned(line, symbol) && componentName(line.text))
    if (aligned.length !== 1) { unresolved.push('Gradsymbolet kunne ikke kobles entydig til én bygningsdel.'); continue }
    const heading = aligned[0]!
    if (page.symbols.some((other, index) => index !== symbolIndex && visualHeadingAligned(heading, other))) {
      unresolved.push('Flere gradsymboler kan tilhøre samme bygningsdel.'); continue
    }
    const layout = visualLayoutForHeading(page, symbolIndex, heading, line => reliable(line, 0.7))
    const { columnStart, columnEnd } = layout
    const lines = page.lines.map((line, index) => ({ ...line, index })).filter(line => layout.selected(line) && layout.belowHeading(line))
      .sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x)
    const labels = lines.filter(line => deviationLabel(line.text))
    if (!labels.length || !reliableLabel(labels[0]!)) { unresolved.push('Avviksoverskrift mangler eller er utydelig under bygningsdelen.'); continue }
    const label = labels[0]!, sameColumnEnd = lines.find(line => line.box.y > label.box.y && endingLabel(line.text))
    const flow = sameColumnEnd ? null : visualNextColumn(page, symbolIndex, heading, label.index)
    const boundary = sameColumnEnd ?? (flow ? { ...flow.boundary.line, index: flow.boundary.index } : null)
    if (!boundary || !reliableLabel(boundary)) { unresolved.push('Avviket mangler en sikker avslutning i samme eller entydig neste kolonne.'); continue }
    if (labels.some(other => other !== label && other.box.y < boundary.box.y)) { unresolved.push('Flere avviksoverskrifter gir tvetydig avgrensning.'); continue }
    const potentialBody = flow ? flow.body.map(({ line, index }) => ({ ...line, index })) : page.lines.map((line, index) => ({ ...line, index })).filter(line => layout.intersectsColumn(line)
      && line.box.y > label.box.y + label.box.height / 2 && line.box.y < boundary.box.y)
    if (!flow && potentialBody.some(line => !layout.selected(line))) {
      unresolved.push('Avviksblokken har innrykk eller brede OCR-linjer som ikke kan kobles fullstendig.'); continue
    }
    const body = flow ? potentialBody : potentialBody.sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x)
    if (body.some(line => isTechnicalComponent(line.text) || /^(?:Beskrivelse|Vurdering av avvik|Tilstandsrapport)\s*:?[ \t]*$/iu.test(line.text))) {
      unresolved.push('En ny komponent eller overskrift bryter avviket før avslutningen.'); continue
    }
    if (!body.length || body.some(line => !reliable(line, 0.6)) || body.length > 80) { unresolved.push('Avviksteksten kunne ikke leses fullstendig med tilstrekkelig sikkerhet.'); continue }
    const description = body.map(line => line.text).join('\n')
    if (description.length > 2000 || !/[.!?)]\s*$/u.test(description) || deviationStatus(description) !== 'documented') { unresolved.push('Avviksteksten er uavsluttet, benektet eller usikker.'); continue }
    // Et eksplisitt rom rett over bygningsdelen beholdes sammen med komponenten.
    const rooms = page.lines.map((line, index) => ({ ...line, index })).filter(line => line.box.x >= columnStart && line.box.x < columnEnd
      && line.box.y < heading.box.y && heading.box.y - line.box.y < 0.08 && /^[A-ZÆØÅ0-9 .-]+\s*>\s*[A-ZÆØÅ0-9 .-]+$/u.test(line.text))
    if (rooms.length > 1 || rooms.some(line => !reliable(line, 0.7) || !layout.inColumn(line))) {
      unresolved.push('Romreferansen ved komponenten er tvetydig eller uleselig.'); continue
    }
    const descriptionLabel = lines.find(line => /^Beskrivelse\s*:?[ \t]*$/iu.test(line.text))
    const continuation = page.lines.map((line, index) => ({ ...line, index })).filter(line => layout.intersectsColumn(line) && layout.belowHeading(line)
      && line.box.y < (descriptionLabel?.box.y ?? label.box.y) && line.box.y < label.box.y
      && Math.abs(line.box.x - heading.box.x) < 0.02 && componentName(line.text))
      .sort((a, b) => a.box.y - b.box.y || a.box.x - b.box.x)
    if (!descriptionLabel && continuation.length || continuation.some(line => !reliable(line, 0.7) || !layout.selected(line))) {
      unresolved.push('Komponentnavnets fortsettelse kunne ikke leses sikkert og fullstendig.'); continue
    }
    const component = rooms.length === 1 ? [rooms[0]!, heading, ...continuation] : [heading, ...continuation]
    if (composeVisualComponent(component).length > 200) { unresolved.push('Komponentnavnet er for langt for en entydig kobling.'); continue }
    const finding: VisualAnalysis['pages'][number]['findings'][number] = { component: composeVisualComponent(component), description, grade: symbol.grade,
      componentRegion: visualRegionUnion(component.map(line => line.box)), deviationRegion: visualRegionUnion(body.map(line => line.box)), gradeRegion: symbol.box,
      componentLines: component.map(line => line.index), deviationLines: body.map(line => line.index), boundaryLines: [label.index, boundary.index], symbolIndex,
      confidence: Math.min(symbol.confidence, ...component.map(line => line.confidence), ...body.map(line => line.confidence)), ...(flow ? { nextColumn: true as const } : {}) }
    const geometryError = visualFindingGeometryError(page, finding, line => reliable(line, 0.7))
    if (geometryError) { unresolved.push(geometryError); continue }
    findings.push(finding)
  }
  return { ...page, findings, status: 'uncertain', reason: [...new Set(unresolved), 'Lokal OCR har undersøkt siden; sikker kobling av enkelte funn beviser ikke at alle grader og avvik på siden er lest.'].join(' ').slice(0, 2000) }
}

export function analyzeVisualTechnical(evidence: LocalVisualEvidence, originalPages: readonly { pdfPage: number; text: string }[] = []): VisualAnalysis {
  const parsed = LocalVisualEvidenceSchema.parse(evidence)
  return { ...parsed, pages: parsed.pages.map(page => resolvePage(page, originalPages.find(original => original.pdfPage === page.pdfPage)?.text)) }
}

/** Den visuelle analysen utvider risikooversikten, aldri kontroll-/finansgrunnlag. */
export function addVisualTechnical(outcome: DocumentImport, evidence: LocalVisualEvidence): DocumentImport {
  if (evidence.documentHash !== outcome.reportHash || evidence.documentName !== outcome.documentName) throw new Error('visual-document-mismatch')
  const visualAnalysis = analyzeVisualTechnical(evidence, outcome.pages), result = structuredClone(outcome)
  result.visualAnalysis = visualAnalysis
  if (visualAnalysis.pages.some(page => page.status !== 'processed') && result.coverage.technical.status === 'complete') {
    result.coverage.technical.status = 'incomplete'; result.technical.status = 'blocked'
    result.coverage.technical.reasons.push('Nytt visuelt sidegrunnlag har usikre grader eller avvik. Komplett TG-dekning kan ikke bekreftes.')
  }
  const risk = result.propertyRisk?.technical
  if (!risk) return DocumentImportSchema.parse(result)
  let overflow = false
  for (const page of visualAnalysis.pages) for (const finding of page.findings) {
    const id = 'visual-' + createHash('sha256').update(`${outcome.reportHash}:${page.pdfPage}:${finding.symbolIndex}:${finding.component}:${finding.grade}:${finding.description}`).digest('hex').slice(0, 24)
    if (risk.findings.some(item => item.id === id)) continue
    const sameDetail = risk.findings.find(item => item.evidenceKind === 'detail' && item.status === 'documented' && item.grade === finding.grade
      && item.component && normalize(item.component) === normalize(finding.component) && normalize(item.description) === normalize(finding.description)
      && item.sources.some(source => source.pdfPage === page.pdfPage))
    if (sameDetail) {
      sameDetail.component = finding.component; sameDetail.description = finding.description
      sameDetail.sourceQuality = 'local-visual'; sameDetail.visualSources = sourcesForVisualFinding(visualAnalysis, page, finding)
      continue
    }
    // Bare ordrett samme komponent og avvik på samme side fjernes fra den
    // usikre tekstlisten. Liknende formuleringer er ikke sikker identitet.
    risk.findings = risk.findings.filter(item => !(item.sourceQuality === 'partial-text' && item.component
      && normalize(item.component) === normalize(finding.component)
      && item.sources.some(source => source.pdfPage === page.pdfPage)
      && normalize(item.description.replace(/^Ufullstendig og ukontrollert tekstuttrekk:\s*/u, '')) === normalize(finding.description)))
    if (risk.findings.length >= 200) { overflow = true; continue }
    risk.findings.push({ id, domain: 'technical', category: 'technical', status: 'documented', component: finding.component,
      title: finding.component, description: finding.description, grade: finding.grade, sourceQuality: 'local-visual', evidenceKind: 'detail', sources: [],
      visualSources: sourcesForVisualFinding(visualAnalysis, page, finding),
      consequence: 'Gradsymbol, bygningsdel og avvik er koblet med lokal bildeanalyse og OCR. Teksten er avledet og må leses mot originalen.',
      action: 'Åpne original PDF-side og kontroller grad, avvik og foreslåtte tiltak før bruk i beslutninger.' })
    if (!risk.examinedPages.includes(page.pdfPage)) risk.examinedPages.push(page.pdfPage)
    if (!risk.unreadPages.includes(page.pdfPage)) risk.unreadPages.push(page.pdfPage)
    risk.coverage = 'partial'
  }
  risk.examinedPages.sort((a, b) => a - b); risk.unreadPages.sort((a, b) => a - b)
  if (overflow) risk.limitations.push('Funnkapasiteten er nådd; flere visuelt koblede forhold finnes i sideanalysen og må kontrolleres i originalen.')
  if (visualAnalysis.pages.length) risk.limitations.push('Lokalt avledede bilde-/OCR-kilder har egne originalregioner. Forsøkte sider og enkeltfunn beviser ikke komplett TG-dekning.')
  return DocumentImportSchema.parse(result)
}
