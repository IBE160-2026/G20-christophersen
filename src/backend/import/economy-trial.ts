import { createHash } from 'node:crypto'
import { ListingKeySchema } from '../../contracts/listing.ts'
import { quoteContainsAmount, quoteContainsYear } from './representative-oracle.ts'
import { ImportPageSchema, PdfSourceSchema } from '../../contracts/document-import.ts'
import type { PdfSource } from '../../contracts/document-import.ts'
import { createLocalPlan, sourceFor } from './local-plan.ts'
import type { ImportBasis } from './local-plan.ts'
import { canonicalJson, semanticDigest } from './semantic-request.ts'
import { createEconomyRequest, EconomyTrialOutputSchema } from './economy-request.ts'
import { assessLivePreflight, captureSemanticWire } from './live-preflight.ts'
import type { SdkWire } from './live-preflight.ts'
import { captureTokenCountWire, createTokenCountRequest, COUNT_PRICE_EVIDENCE } from './token-count.ts'
import { validatePdf } from '../documents/validate-pdf.ts'
import { extractImport } from '../documents/extract-import.ts'
import { GLOBAL_STANDARD_PRICE, costOf } from './budget.ts'

const hash = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
/** Caller retains the private bytes and all physical pages; this module writes no files. */
export function prepareEconomyTrial(bytes: Uint8Array, originalBasis: ImportBasis, selectedPages: number[]) {
  const basis = structuredClone(originalBasis)
  if (hash(bytes) !== basis.hash) throw new Error('economy-original-mismatch')
  if (!basis.pages.length || basis.pages.length > 200 || basis.pages.some((page, i) => !ImportPageSchema.safeParse(page).success || page.pdfPage !== i + 1)) throw new Error('economy-physical-ledger-invalid')
  if (!selectedPages.length || new Set(selectedPages).size !== selectedPages.length || selectedPages.some(n => !Number.isSafeInteger(n) || !basis.pages[n - 1] || basis.pages[n - 1]!.status !== 'readable' || !basis.pages[n - 1]!.text.trim())) throw new Error('economy-selected-page-unreadable')
  const selected = [...selectedPages].sort((a, b) => a - b)
  // Keep original page positions when proposing local fields; omitted text is never inspected.
  const localBasis = { ...basis, pages: basis.pages.map(page => selected.includes(page.pdfPage) ? page : { ...page, text: '', status: 'unknown' as const, reason: 'Utelatt fra økonomiprøven.' }) }
  const local = createLocalPlan(localBasis)
  const sources = selected.flatMap(pdfPage => {
    const text = basis.pages[pdfPage - 1]!.text
    return Array.from({ length: Math.ceil(text.length / 2000) }, (_, i) => sourceFor(basis, pdfPage, i * 2000, Math.min(text.length, (i + 1) * 2000)))
  })
  const request = createEconomyRequest({ scope: 'selected-economy-only', document: { hash: basis.hash, name: basis.name, role: basis.role, parentHash: basis.parentHash }, selectedPages: selected,
    pages: selected.map(pdfPage => ({ pdfPage, text: basis.pages[pdfPage - 1]!.text })), sourceAnchors: sources.map(({ pdfPage, start, end }) => ({ pdfPage, start, end })), localFields: local.fields.map(field => ({ ...field, sources: field.sources.map(({ pdfPage, start, end }) => ({ pdfPage, start, end })), alternatives: field.alternatives.map(item => ({ amount: item.amount, source: { pdfPage: item.source.pdfPage, start: item.source.start, end: item.source.end } })), originalText: '' })) })
  const packet = { version: 1, purpose: 'selected-economy-only', basis, selectedPages: selected, originalSha256: basis.hash,
    pagesDigest: hash(canonicalJson(basis.pages)), request, requestDigest: semanticDigest(request),
    ledger: basis.pages.map(page => ({ pdfPage: page.pdfPage, status: page.status, rasterUnprocessed: page.rasterUnprocessed ?? false, sent: selected.includes(page.pdfPage), reason: selected.includes(page.pdfPage) ? 'Valgt lesbart tekstlag; raster er ikke behandlet.' : 'Eksplisitt utelatt fra økonomiprøven.' })),
    technical: { status: 'unresolved', coverageComplete: false },
    proposedOracle: { provenance: 'machine-proposed', humanApproved: false, fields: local.fields, sourceAnchors: sources, missing: local.fields.filter(field => field.status === 'missing').map(field => field.id), rawSelectedText: selected.map(pdfPage => ({ pdfPage, text: basis.pages[pdfPage - 1]!.text })) },
    externalCalls: 0, reservationsCreated: 0 }
  return packet
}
export type EconomyTrial = ReturnType<typeof prepareEconomyTrial>
export function verifyEconomyTrial(packet: EconomyTrial, bytes: Uint8Array, basis: ImportBasis) {
  try { return canonicalJson(packet) === canonicalJson(prepareEconomyTrial(bytes, basis, packet.selectedPages)) } catch { return false }
}
export function validateEconomyTrialOutput(raw: unknown, packet: EconomyTrial) {
  const output = EconomyTrialOutputSchema.parse(raw)
  const sources: PdfSource[] = [...output.fields.flatMap(field => [...field.sources, ...field.alternatives.map(item => item.source)]), ...output.observations.flatMap(item => item.sources), ...output.limitations.flatMap(item => item.sources)]
  for (const source of sources) {
    PdfSourceSchema.parse(source)
    if (!packet.selectedPages.includes(source.pdfPage) || canonicalJson(source) !== canonicalJson(sourceFor(packet.basis, source.pdfPage, source.start, source.end))) throw new Error('economy-output-source-mismatch')
  }
  if (new Set(output.fields.map(field => field.id)).size !== output.fields.length) throw new Error('economy-duplicate-field')
  if (output.fields.length !== ListingKeySchema.options.length || ListingKeySchema.options.some(id => !output.fields.some(field => field.id === id))) throw new Error('economy-fixed-fields-required')
  for (const field of output.fields) {
    const local = packet.proposedOracle.fields.find(item => item.id === field.id)!
    if (field.category !== local.category) throw new Error('economy-field-category-mismatch')
    if (field.includedIn !== null || field.debtPart !== null) throw new Error('economy-unverified-relation')
    if (field.status === 'available' && (field.amount === null || !field.sources.length) || ['missing', 'unavailable'].includes(field.status) && field.amount !== null
      || (field.status === 'conflict') !== (field.alternatives.length > 0)) throw new Error('economy-field-evidence-required')
    if (field.amount !== null && !field.sources.some(source => quoteContainsAmount(source.quote, field.amount!))
      || field.year !== null && !field.sources.some(source => quoteContainsYear(source.quote, field.year!))
      || field.alternatives.some(item => item.amount !== null && !quoteContainsAmount(item.source.quote, item.amount))) throw new Error('economy-unsupported-value')
    const quarter = field.sources.some(source => /\bkvartal/iu.test(source.quote))
    if (field.period === 'once' && (field.category === 'recurring' || quarter)
      || quarter && field.period !== 'unknown'
      || field.period === 'month' && !field.sources.some(source => /(?:\bper|\bpr\.?|\/)\s*(?:måned|mnd)\b|\bmånedlig\b/iu.test(source.quote))
      || field.period === 'year' && !field.sources.some(source => /(?:\bper|\bpr\.?|\/)\s*år\b|(?<!\p{L})årlig(?!\p{L})/iu.test(source.quote))) throw new Error('economy-unsupported-period')
    if (local.amount !== null && (field.amount !== local.amount || local.status === 'conflict')) {
      const evidence = [{ amount: field.amount, sources: field.sources }, ...field.alternatives.map(item => ({ amount: item.amount, sources: [item.source] }))]
      if (field.status !== 'conflict' || [local.amount, ...local.alternatives.map(item => item.amount)].some(amount => !evidence.some(item => item.amount === amount && item.sources.some(source => quoteContainsAmount(source.quote, amount!))))) throw new Error('economy-local-explicit-mismatch')
    }
    if (local.amount !== null) {
      const cited = [...field.sources, ...field.alternatives.map(item => item.source)]
      if (!local.sources.some(original => cited.some(source => source.pdfPage === original.pdfPage && source.start < original.end && source.end > original.start && quoteContainsAmount(source.quote, local.amount!)))) throw new Error('economy-local-source-mismatch')
    }
    if (local.status === 'conflict') {
      const cited = [...field.sources, ...field.alternatives.map(item => item.source)]
      const originals = [...local.sources, ...local.alternatives.map(item => item.source)]
      // Equal amounts do not erase independently qualified period/year evidence.
      if (originals.some(original => !cited.some(source => source.pdfPage === original.pdfPage && source.start <= original.start && source.end >= original.end))) throw new Error('economy-local-conflict-source-loss')
      const periods = new Set(originals.map(source => /\bper\s+måned\b/iu.test(source.quote) ? 'month' : /\bper\s+år\b/iu.test(source.quote) ? 'year' : local.category === 'recurring' ? 'unknown' : 'once'))
      const years = new Set(originals.map(source => source.quote.match(/\bi\s+(\d{4})\b/iu)?.[1] ?? null))
      if (periods.size > 1 && field.period !== 'unknown' || years.size > 1 && field.year !== null) throw new Error('economy-local-conflicting-qualifiers')
    }
    const originalText = field.sources.map(source => source.quote).join('\n')
    if (field.originalText !== originalText) throw new Error('economy-original-text-mismatch')
  }
  if (output.observations.some(item => !item.sources.some(source => source.quote.includes(item.raw)))) throw new Error('economy-raw-observation-mismatch')
  const qualifications = packet.selectedPages.flatMap(pdfPage => {
    const text = packet.basis.pages[pdfPage - 1]!.text
    return [...text.matchAll(/\bkvartal\w*|\bmva\b|\bmerverdiavgift\w*/giu)].map(match => ({ raw: match[0], source: sourceFor(packet.basis, pdfPage, match.index, match.index + match[0].length) }))
  })
  if (qualifications.some(item => !output.observations.some(observation => observation.raw.includes(item.raw) && observation.sources.some(source => source.pdfPage === item.source.pdfPage && source.start <= item.source.start && source.end >= item.source.end)))) throw new Error('economy-qualification-observation-required')
  return { ...output, candidate: { confirmed: false as const, requiresHumanReview: true as const, humanReferenceComparison: 'required' as const, semanticCompleteness: 'unresolved' as const,
    rawSelectedText: structuredClone(packet.proposedOracle.rawSelectedText), qualifications } }

}
/** No live transport is exposed. Approvals bind the complete immutable package, not a checkbox. */
export async function prepareEconomyPreflight(packet: EconomyTrial, bytes: Uint8Array, basis: ImportBasis, approvals: { oracleDigest?: string; liveRequestDigest?: string } = {}) {
  if (!verifyEconomyTrial(packet, bytes, basis)) throw new Error('economy-package-mismatch')
  const format = await validatePdf(bytes, basis.name, { maxPages: 200 })
  if (format.status !== 'format-validated') throw new Error('economy-original-format-invalid')
  const extracted = await extractImport(format)
  if (canonicalJson(extracted.pages) !== canonicalJson(basis.pages) || canonicalJson(extracted.attachments) !== canonicalJson(basis.attachments)) throw new Error('economy-original-extraction-mismatch')
  const wire: SdkWire = await captureSemanticWire(packet.request)
  const assessment = assessLivePreflight(packet.request, basis.hash, wire, { price: GLOBAL_STANDARD_PRICE })
  const blockers = [...assessment.blockers]
  if (approvals.oracleDigest !== hash(canonicalJson(packet.proposedOracle))) blockers.push('economy-human-oracle-approval-required')
  if (approvals.liveRequestDigest !== packet.requestDigest) blockers.push('economy-paid-live-approval-required')
  return { ready: false as const, blockers, requestDigest: packet.requestDigest, oracleDigest: hash(canonicalJson(packet.proposedOracle)), wire,
    tokenCount: { request: createTokenCountRequest(packet.request), wire: await captureTokenCountWire(packet.request), priceEvidence: COUNT_PRICE_EVIDENCE, externalCalls: 0 },
    budget: { capUsd: '0.20', initializedByPreparation: false, maximumInputTokens: 40_000, maximumOutputTokensIncludingReasoning: 8_000, conservativeGenerationReserveUsd: costOf(40_000, 8_000, GLOBAL_STANDARD_PRICE, true) },
    externalCalls: 0, reservationsCreated: 0 }
}
