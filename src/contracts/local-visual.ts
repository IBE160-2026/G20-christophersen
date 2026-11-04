import { z } from 'zod'
import { ReportHashSchema } from './document-analysis.ts'

/** Regioner i originalsidens render, normalisert fra øvre venstre hjørne. */
export const VisualRegionSchema = z.strictObject({
  x: z.number().min(0).max(1), y: z.number().min(0).max(1),
  width: z.number().positive().max(1), height: z.number().positive().max(1),
}).refine(box => box.x + box.width <= 1.001 && box.y + box.height <= 1.001, 'Regionen ligger utenfor originalside.')
export const VisualLineSchema = z.strictObject({ text: z.string().min(1).max(4000), confidence: z.number().min(0).max(1), box: VisualRegionSchema,
  cropReading: z.strictObject({ text: z.string().min(1).max(4000), confidence: z.number().min(0).max(1) }).optional(),
  conflictingReading: z.strictObject({ text: z.string().min(1).max(4000), confidence: z.number().min(0).max(1) }).optional(),
})
export const VisualSymbolSchema = z.strictObject({
  grade: z.enum(['TG0', 'TG1', 'TG2', 'TG3', 'TGIU']).nullable(), box: VisualRegionSchema,
  confidence: z.number().min(0).max(1), text: z.string().max(100),
  readings: z.array(z.strictObject({ text: z.string().max(100), confidence: z.number().min(0).max(1) })).max(2).optional(),
  agreement: z.literal('two-pass').optional(),
})
export const LocalVisualPageSchema = z.strictObject({
  pdfPage: z.number().int().min(1).max(200), width: z.number().positive(), height: z.number().positive(),
  rasterDigest: ReportHashSchema.nullable(), lines: z.array(VisualLineSchema).max(2000),
  symbols: z.array(VisualSymbolSchema).max(500), error: z.string().max(1000).nullable(),
})
export const LocalVisualEvidenceSchema = z.strictObject({
  version: z.literal('local-visual-1'), documentHash: ReportHashSchema, documentName: z.string().min(1).max(255),
  pages: z.array(LocalVisualPageSchema).max(200),
})
export const VisualFindingSchema = z.strictObject({
  component: z.string().min(1).max(200), description: z.string().min(1).max(2000), grade: z.enum(['TG2', 'TG3']),
  componentRegion: VisualRegionSchema, deviationRegion: VisualRegionSchema, gradeRegion: VisualRegionSchema,
  componentLines: z.array(z.number().int().nonnegative()).min(1).max(12),
  deviationLines: z.array(z.number().int().nonnegative()).min(1).max(80),
  boundaryLines: z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()]),
  symbolIndex: z.number().int().nonnegative(), confidence: z.number().min(0).max(1),
  nextColumn: z.literal(true).optional(),
})
export const VisualAnalysisSchema = LocalVisualEvidenceSchema.safeExtend({
  pages: z.array(LocalVisualPageSchema.safeExtend({
    status: z.enum(['processed', 'uncertain', 'unavailable']), reason: z.string().max(2000).nullable(),
    findings: z.array(VisualFindingSchema).max(200),
  })).max(200),
})
export const VisualSourceSchema = z.strictObject({
  method: z.literal('local-vision'), documentHash: ReportHashSchema, documentName: z.string().min(1).max(255),
  pdfPage: z.number().int().min(1).max(200), quote: z.string().min(1).max(2000), region: VisualRegionSchema,
  rasterDigest: ReportHashSchema, extractorVersion: z.literal('local-visual-1'),
})
export type LocalVisualEvidence = z.infer<typeof LocalVisualEvidenceSchema>
export type LocalVisualPage = z.infer<typeof LocalVisualPageSchema>
export type VisualAnalysis = z.infer<typeof VisualAnalysisSchema>
export type VisualSource = z.infer<typeof VisualSourceSchema>
export type VisualRegion = z.infer<typeof VisualRegionSchema>
type VisualLine = LocalVisualPage['lines'][number]
/** Et separat faktisk utsnitt kan støtte helsidens OCR, uten å endre score. */
export function hasCorroboratedVisualLine(line: VisualLine): boolean {
  const normalize = (text: string) => text.toUpperCase().replace(/\s+/gu, '')
  return !line.conflictingReading && line.confidence >= 0.5 && Boolean(line.cropReading && line.cropReading.confidence >= 0.5
    && normalize(line.text) === normalize(line.cropReading.text))
}
const visualMiddle = (box: VisualRegion) => box.y + box.height / 2
export const isVisualComponentName = (text: string) => text.length <= 150 && /[\p{L}]/u.test(text)
  && !/[.!?;:]$/u.test(text) && text.split(/\s+/u).length <= 12
  && !/^(?:tilstandsrapport|beskrivelse|vurdering|konsekvens|årstall|kilde|oppdrags|side\b|tg\s*\d|tilstandsgrad|forhold som|oppsummering|innhold)/iu.test(text)
export const visualHeadingAligned = (line: VisualLine, symbol: LocalVisualPage['symbols'][number]) =>
  Math.abs(visualMiddle(line.box) - visualMiddle(symbol.box)) <= Math.max(0.012, symbol.box.height * 0.6)
  && line.box.x >= symbol.box.x + symbol.box.width - 0.008 && line.box.x - symbol.box.x - symbol.box.width < 0.10

/** Samme kolonnegrenser brukes ved uttrekk og ved validering av avledet bevis. */
export function visualLayoutForHeading(page: LocalVisualPage, symbolIndex: number, heading: VisualLine,
  reliable: (line: VisualLine) => boolean = line => line.confidence >= 0.7) {
  const symbol = page.symbols[symbolIndex]!
  const right = page.symbols.filter(other => other.box.x > symbol.box.x + 0.18 && (hasSupportedVisualGrade(other)
    || page.lines.some(line => reliable(line) && visualHeadingAligned(line, other) && isVisualComponentName(line.text))
    || other.grade === null && Math.abs(other.box.y - symbol.box.y) < 0.05)).map(other => {
      // Et rent TG-token ligger lenger inn enn et helt farget skilt. De
      // gjentatte avsnittsetikettene viser kolonnens faktiske venstrekant.
      const anchors = page.lines.filter(line => line.box.y >= other.box.y && Math.abs(line.box.x - other.box.x) < 0.06
        && /^(?:Beskrivelse|Vurdering av avvik|Konsekvens\s*\/?\s*tiltak)\s*:?[ \t]*$/iu.test(line.text)).map(line => line.box.x)
      return Math.min(other.box.x, ...anchors)
    })
  const columnEnd = right.length ? Math.min(...right) - 0.015 : 0.98, columnStart = symbol.box.x - 0.025
  const nextHeader = page.symbols.filter(other => Math.abs(other.box.x - symbol.box.x) < 0.12 && other.box.y > symbol.box.y + symbol.box.height / 2)
    .reduce((end, other) => Math.min(end, other.box.y), 0.94)
  const inColumn = (line: VisualLine) => line.box.x >= columnStart && line.box.x < columnEnd && line.box.x + line.box.width <= columnEnd + 0.015
  const selected = (line: VisualLine) => inColumn(line) && line.box.x < symbol.box.x + 0.16
  const intersectsColumn = (line: VisualLine) => line.box.x < columnEnd && line.box.x + line.box.width > columnStart
  const belowHeading = (line: VisualLine) => line.box.y > heading.box.y + heading.box.height / 2 && line.box.y < nextHeader
  return { columnStart, columnEnd, nextHeader, inColumn, selected, intersectsColumn, belowHeading }
}

/** Bare et siste avviksavsnitt ved venstre spaltebunn kan fortsette til
 * høyre spaltetopp. Rapportoverskrift og eksplisitt tiltaksetikett avgrenser
 * mottaket; bilder, nye overskrifter og uklar kolonnegeometri avviser kobling. */
export function visualNextColumn(page: LocalVisualPage, symbolIndex: number, heading: VisualLine, labelIndex: number) {
  const label = page.lines[labelIndex], symbol = page.symbols[symbolIndex]
  if (!label || !symbol || symbol.box.x > 0.35 || label.box.y < 0.70) return null
  const indexed = page.lines.map((line, index) => ({ line, index }))
  const report = indexed.filter(({ line }) => /^Tilstandsrapport\s*$/iu.test(line.text) && line.box.y < 0.25)
  if (report.length !== 1) return null
  if (report[0]!.line.conflictingReading || report[0]!.line.confidence < 0.7 && !hasCorroboratedVisualLine(report[0]!.line)) return null
  const top = report[0]!.line.box.y
  const ends = indexed.filter(({ line }) => line.box.x > symbol.box.x + 0.25 && line.box.y > top && line.box.y < 0.45
    && /^(?:Konsekvens\s*\/?\s*tiltak|Tiltak|Kostnadsestimat|Anbefalte tiltak)\s*:?[ \t]*$/iu.test(line.text))
    .sort((a, b) => a.line.box.y - b.line.box.y)
  const boundary = ends[0]
  if (!boundary) return null
  const rightStart = boundary.line.box.x - 0.012
  if (rightStart < 0.40 || rightStart > 0.70) return null
  // En senere komponent i venstre spalte eller en ny komponent før den
  // høyre avslutningen betyr at avviket ikke har entydig leserekkefølge.
  if (page.symbols.some(other => other !== symbol && (other.box.x < rightStart && other.box.y > symbol.box.y + symbol.box.height
    || other.box.x >= rightStart && other.box.y >= top && other.box.y < boundary.line.box.y))) return null
  const footer = (line: VisualLine) => /^(?:Oppdragsnr\.?\s*:|Befaringsdato\s*:|Side\s*:\s*\d+\s+av\s+\d+)/iu.test(line.text)
  const left = indexed.filter(({ line }) => line.box.y > label.box.y + label.box.height / 2
    && line.box.x < rightStart && line.box.x + line.box.width > symbol.box.x - 0.025 && !footer(line))
  const right = indexed.filter(({ line }) => line.box.y >= top && line.box.y < boundary.line.box.y
    && line.box.x + line.box.width > rightStart && line.box.x < 0.98)
  if (!right.length || [...left, ...right].some(({ line }) => /^(?:Beskrivelse|Vurdering av avvik|Tilstandsrapport|Konsekvens|Tiltak)\s*[:/]?/iu.test(line.text))) return null
  if ([...left, ...right].some(({ line }) => isVisualComponentName(line.text) && /^\p{Lu}/u.test(line.text)
    && !/^(?:Det|Den|De|Dette|Disse|Som|Og|Men|Ved|For|På|Av|Er|Har|Mangler)\b/iu.test(line.text))) return null
  if (left.some(({ line }) => line.box.x < symbol.box.x - 0.025 || line.box.x + line.box.width > rightStart
    || line.box.x > symbol.box.x + 0.16)
    || right.some(({ line }) => line.box.x < rightStart || line.box.x > rightStart + 0.16 || line.box.x + line.box.width > 0.98)) return null
  const sort = (a: typeof left[number], b: typeof left[number]) => a.line.box.y - b.line.box.y || a.line.box.x - b.line.box.x
  return { body: [...left.sort(sort), ...right.sort(sort)], boundary, heading }
}

/** En konsistent omskrevet kilde må fortsatt oppfylle den opprinnelige geometrien.
 * Ingen OCR-linje inne i avviksbåndet kan falle ut ved innrykk eller bredde. */
export function visualFindingGeometryError(page: LocalVisualPage, finding: z.infer<typeof VisualFindingSchema>,
  reliable: (line: VisualLine) => boolean = line => line.confidence >= 0.7): string | null {
  const symbol = page.symbols[finding.symbolIndex]
  if (!symbol) return 'Ukjent gradsymbol.'
  const components = finding.componentLines.map(index => ({ line: page.lines[index], index }))
  const headings = components.filter(item => item.line && visualHeadingAligned(item.line, symbol) && isVisualComponentName(item.line.text))
  if (headings.length !== 1) return 'Komponent og gradsymbol ligger ikke entydig på samme rad.'
  const heading = headings[0]!.line!, layout = visualLayoutForHeading(page, finding.symbolIndex, heading, reliable)
  if (!layout.inColumn(heading)) return 'Komponentoverskriften krysser kolonnegrensen.'
  const aligned = page.lines.filter(line => reliable(line) && visualHeadingAligned(line, symbol) && isVisualComponentName(line.text))
  if (aligned.length !== 1 || aligned[0] !== heading) return 'Andre OCR-linjer gjør komponentkoblingen tvetydig.'
  if (page.symbols.some((other, index) => index !== finding.symbolIndex && visualHeadingAligned(heading, other))) return 'Flere symboler kan tilhøre komponenten.'
  const label = page.lines[finding.boundaryLines[0]], boundary = page.lines[finding.boundaryLines[1]]
  const firstLabel = page.lines.map((line, index) => ({ line, index })).filter(({ line }) => layout.selected(line) && layout.belowHeading(line)
    && /^Vurdering av avvik\s*:?[ \t]*$/iu.test(line.text)).sort((a, b) => a.line.box.y - b.line.box.y)[0]
  if (firstLabel?.index !== finding.boundaryLines[0]) return 'Et tidligere avviksavsnitt kan ikke utelates fra komponenten.'
  const flow = finding.nextColumn ? visualNextColumn(page, finding.symbolIndex, heading, finding.boundaryLines[0]) : null
  if (finding.nextColumn && (!flow || flow.boundary.index !== finding.boundaryLines[1])) return 'Kolonnefortsettelsen er ikke entydig avgrenset.'
  if (!label || !boundary || !layout.selected(label) || !layout.belowHeading(label)
    || !finding.nextColumn && (!layout.selected(boundary) || !layout.belowHeading(boundary) || boundary.box.y <= label.box.y)) return 'Avviksgrensene ligger ikke under komponenten i samme kolonne.'
  const body = flow?.body ?? page.lines.map((line, index) => ({ line, index })).filter(({ line }) => layout.intersectsColumn(line)
    && line.box.y > label.box.y + label.box.height / 2 && line.box.y < boundary.box.y)
    .sort((a, b) => a.line.box.y - b.line.box.y || a.line.box.x - b.line.box.x)
  if (!finding.nextColumn && body.some(({ line }) => !layout.selected(line)) || JSON.stringify(body.map(item => item.index)) !== JSON.stringify(finding.deviationLines)) return 'Avviksblokken inneholder utelatte eller feilordnede OCR-linjer.'
  const description = page.lines.filter(line => layout.selected(line) && layout.belowHeading(line) && /^Beskrivelse\s*:?[ \t]*$/iu.test(line.text)).sort((a, b) => a.box.y - b.box.y)[0]
  const continuation = page.lines.map((line, index) => ({ line, index })).filter(({ line }) => layout.intersectsColumn(line) && layout.belowHeading(line)
    && line.box.y < (description?.box.y ?? label.box.y) && line.box.y < label.box.y
    && Math.abs(line.box.x - heading.box.x) < 0.02 && isVisualComponentName(line.text))
    .sort((a, b) => a.line.box.y - b.line.box.y || a.line.box.x - b.line.box.x)
  if (!description && continuation.length || continuation.some(item => !reliable(item.line) || !finding.componentLines.includes(item.index))) return 'Komponentnavnets fortsettelse er uavklart eller utelatt.'
  const room = components.filter(item => item.line && item.line.box.y < heading.box.y)
  if (room.length > 1 || room.some(item => !layout.inColumn(item.line!) || heading.box.y - item.line!.box.y >= 0.08
    || !/^[A-ZÆØÅ0-9 .-]+\s*>\s*[A-ZÆØÅ0-9 .-]+$/u.test(item.line!.text))) return 'Romreferansen er ikke entydig over komponenten i samme kolonne.'
  const possibleRooms = page.lines.map((line, index) => ({ line, index })).filter(({ line }) => layout.inColumn(line)
    && line.box.y < heading.box.y && heading.box.y - line.box.y < 0.08 && /^[A-ZÆØÅ0-9 .-]+\s*>\s*[A-ZÆØÅ0-9 .-]+$/u.test(line.text))
  if (possibleRooms.length > 1 || possibleRooms.some(item => !reliable(item.line) || !finding.componentLines.includes(item.index))) return 'Romreferansen er uavklart eller utelatt.'
  const allowed = new Set([headings[0]!.index, ...continuation.map(item => item.index), ...room.map(item => item.index)])
  if (components.some(item => !item.line || !allowed.has(item.index))) return 'Komponentlinjen ligger utenfor navneblokken.'
  if (JSON.stringify([...possibleRooms.map(item => item.index), headings[0]!.index, ...continuation.map(item => item.index)]) !== JSON.stringify(finding.componentLines)) return 'Komponentnavnets linjer har feil rekkefølge.'
  return null
}
export function composeVisualComponent(lines: readonly { text: string }[]) {
  const parts = lines.map(line => line.text)
  return parts.length > 1 && /^[A-ZÆØÅ0-9 .-]+\s*>\s*[A-ZÆØÅ0-9 .-]+$/u.test(parts[0]!)
    ? `${parts[0]} · ${parts.slice(1).join(' ')}` : parts.join(' ')
}

/** Faktisk OCR-sikkerhet beholdes. To avlesninger må gi samme eksplisitte
 * token i både fullside og utsnitt; nærhet og farge alene gir ingen grad. */
export function visualGradeToken(text: string): 'TG0' | 'TG1' | 'TG2' | 'TG3' | 'TGIU' | null {
  // Vision kan velge kyrillisk/ gresk T i et ellers isolert TG-skilt.
  // Normaliseringen gjelder bare skiltets strenge tokengrammatikk.
  const normalized = text.toUpperCase().replace(/[ТΤ]/gu, 'T').replace(/\s+/gu, '')
  const matches = [...normalized.matchAll(/TG([0-3]|IU)(?![\p{L}\p{N}])/gu)]
  if (matches.length !== 1) return null
  const prefix = normalized.slice(0, matches[0]!.index), suffix = normalized.slice(matches[0]!.index + matches[0]![0].length)
  if (!/^[!0OJI•().-]*$/u.test(prefix) || !/^[!•().-]*$/u.test(suffix)) return null
  return `TG${matches[0]![1]}` as 'TG0' | 'TG1' | 'TG2' | 'TG3' | 'TGIU'
}
export function hasSupportedVisualGrade(symbol: z.infer<typeof VisualSymbolSchema>): boolean {
  if (!symbol.grade) return false
  if (symbol.confidence >= 0.8 && visualGradeToken(symbol.text) === symbol.grade) return true
  return symbol.agreement === 'two-pass' && symbol.readings?.length === 2
    && symbol.readings.every(reading => reading.confidence >= 0.3 && visualGradeToken(reading.text) === symbol.grade)
}

export function visualRegionUnion(boxes: readonly VisualRegion[]): VisualRegion {
  const x = Math.min(...boxes.map(box => box.x)), y = Math.min(...boxes.map(box => box.y))
  return { x, y, width: Math.max(...boxes.map(box => box.x + box.width)) - x,
    height: Math.max(...boxes.map(box => box.y + box.height)) - y }
}

/** Avledet OCR-kilde er aldri et ordrett PDF.js-tekstområde. */
export function sourcesForVisualFinding(analysis: VisualAnalysis, page: VisualAnalysis['pages'][number], finding: VisualAnalysis['pages'][number]['findings'][number]): VisualSource[] {
  if (!page.rasterDigest || !page.lines[finding.boundaryLines[1]] || finding.deviationLines.some(index => !page.lines[index])) return []
  const splitX = page.lines[finding.boundaryLines[1]]!.box.x - 0.012
  const segments = finding.nextColumn ? [false, true].map(right => finding.deviationLines.map(index => page.lines[index]!)
    .filter(line => (line.box.x >= splitX) === right)).filter(lines => lines.length)
    .map(lines => ({ quote: lines.map(line => line.text).join('\n'), region: visualRegionUnion(lines.map(line => line.box)) })) : []
  return [
    { quote: finding.component, region: finding.componentRegion },
    { quote: finding.grade, region: finding.gradeRegion },
    ...(finding.nextColumn ? segments
      : [{ quote: finding.description, region: finding.deviationRegion }]),
  ].map(source => VisualSourceSchema.parse({ ...source, method: 'local-vision', documentHash: analysis.documentHash,
    documentName: analysis.documentName, pdfPage: page.pdfPage, rasterDigest: page.rasterDigest!, extractorVersion: analysis.version }))
}
