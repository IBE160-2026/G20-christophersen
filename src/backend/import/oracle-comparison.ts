import { createHash } from 'node:crypto'
import { DocumentImportSchema } from '../../contracts/document-import.ts'
import type { PdfSource } from '../../contracts/document-import.ts'

export type FrozenOracle = {
  version: number; kind: string; authoredBeforeComparison: string
  original: { file: string; sha256: string; pageCount: number; pagesSha256: string }
  reportPages: number[]
  findings: { component: string; grade: string; description: string; sources: { pdfPage: number; quote: string }[] }[]
  economy: { ownership: string; ownershipSources: { pdfPage: number; quote: string }[]; fields: { id: string; amount: string; period: string; year: string | null; allowedYears?: (string | null)[]; includedIn: string | null; debtPart: string | null; source: { pdfPage: number; quote: string }; relationSources?: { pdfPage: number; quote: string }[] }[]
    unknownFields: { id: string; status: string; amount: null; period: string; year: null; nature: string; includedIn: null; debtPart: null; sources: never[]; alternatives: never[] }[] }
}
const normalized = (text: string) => text.trim().toLocaleLowerCase('nb').replace(/\s+/g, ' ').replace(/[.!?]+$/, '').trimEnd()
/** Compare the untouched schema/source-validated import, before human corrections.
 * Component + independently authored condition text identify a condition; model IDs never do.
 */
export function compareWithOracle(raw: unknown, oracle: FrozenOracle) {
  const deviations: { code: string; subject: string }[] = []
  const report = (code: string, subject: string) => deviations.push({ code, subject })
  const parsed = DocumentImportSchema.safeParse(raw)
  if (!parsed.success) return { accepted: false, deviations: [{ code: 'invalid-schema-or-source', subject: 'document' }] }
  const result = parsed.data
  if (result.reportHash !== oracle.original.sha256 || result.pageCount !== oracle.original.pageCount || createHash('sha256').update(JSON.stringify(result.pages)).digest('hex') !== oracle.original.pagesSha256) report('wrong-original', 'document')
  if (result.coverage.technical.status !== 'complete' || result.technical.status !== 'complete') report('incomplete-analysis', 'technical')
  if (result.cost?.status !== 'completed' || result.cost.actualUsd === null || result.cost.reason !== null) report('incomplete-cost', 'cost')
  if (result.technical.limitations.length) report('technical-limitations', 'technical')
  const reportPages = result.sections.flatMap(section => Array.from({ length: section.endPage - section.startPage + 1 }, (_, index) => section.startPage + index))
  if (JSON.stringify([...new Set(reportPages)].sort((a,b)=>a-b)) !== JSON.stringify(oracle.reportPages)) report('report-area', 'technical')
  const supports = (sources: PdfSource[], expected: { pdfPage: number; quote: string }) => {
    const text = result.pages[expected.pdfPage - 1]?.text ?? ''
    const start = text.indexOf(expected.quote)
    if (start < 0) return false
    // A quote may cross adjacent source blocks; union the original source intervals.
    let cursor = start
    for (const source of sources.filter(source => source.pdfPage === expected.pdfPage).sort((a,b)=>a.start-b.start)) {
      if (source.start <= cursor && source.end > cursor) cursor = source.end
    }
    return cursor >= start + expected.quote.length
  }
  const matched = new Set<number>()
  for (const expected of oracle.findings) {
    const subject = expected.component + ': ' + expected.description
    const possible = result.technical.findings.map((finding, index) => ({ finding, index })).filter(({ finding, index }) => !matched.has(index) && normalized(finding.component) === normalized(expected.component) && normalized(finding.description) === normalized(expected.description))
    // Equal prose can describe different physical conditions. Prefer the expected
    // original anchors before falling back to an unmatched condition for diagnostics.
    const index = possible.find(({ finding }) => expected.sources.every(source => supports(finding.sources, source)))?.index ?? possible[0]?.index ?? -1
    if (index < 0) { report('missing-finding', subject); continue }
    matched.add(index)
    const finding = result.technical.findings[index]!
    if (finding.grade !== expected.grade) report('wrong-grade', subject)
    if (expected.sources.some(source => !supports(finding.sources, source)) || finding.sources.some(source => !expected.sources.some(expected => expected.pdfPage === source.pdfPage))) report('wrong-finding-source', subject)
  }
  result.technical.findings.forEach((finding,index)=> { if (!matched.has(index)) report('extra-finding', finding.component + ': ' + finding.description) })
  if (result.economy.ownership !== oracle.economy.ownership) report('economy-ownership', 'ownership')
  if (oracle.economy.ownershipSources.some(source=>!supports(result.economy.ownershipSources,source))) report('economy-ownership-source', 'ownership')
  for (const expected of oracle.economy.fields) {
    const field = result.economy.fields.find(field=>field.id===expected.id)
    if (!field || field.status !== 'available' || field.nature !== 'fact' || field.alternatives.length || (['amount','period','includedIn','debtPart'] as const).some(key=>field[key] !== expected[key]) || !(expected.allowedYears ?? [expected.year]).includes(field.year)) report('economy-value-or-relation', expected.id)
    if (!field || !supports(field.sources, expected.source)) report('economy-source', expected.id)
    if (!field || expected.relationSources?.some(source=>!supports(field.sources,source))) report('economy-relation-source', expected.id)
  }
  for (const expected of oracle.economy.unknownFields) {
    const field = result.economy.fields.find(field=>field.id===expected.id)
    if (!field || (['status','amount','period','year','nature','includedIn','debtPart'] as const).some(key=>field[key] !== expected[key]) || field.sources.length || field.alternatives.length) report('unknown-economy-field', expected.id)
  }
  for (const field of result.economy.fields) if (![...oracle.economy.fields,...oracle.economy.unknownFields].some(expected=>expected.id===field.id)) report('extra-economy-field', field.id)
  return { accepted: deviations.length === 0, deviations }
}
