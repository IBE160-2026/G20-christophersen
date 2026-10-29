import { expect, it } from 'vitest'
import { ListingKeySchema } from '../../src/contracts/listing.ts'
import type { ImportBasis } from '../../src/backend/import/local-plan.ts'
import { quoteContainsAmount, representativeHash, representativeTemplates, validateRepresentativeOracle } from '../../src/backend/import/representative-oracle.ts'
import type { RepresentativeManifest } from '../../src/backend/import/representative-oracle.ts'

function controlledCase(summary = false, priceText = '3 000 000') {
  const basis: ImportBasis = { hash: 'a'.repeat(64), name: 'original.pdf', role: 'prospectus', requestId: 'unit-only', parentHash: null, attachmentId: null, attachments: [], pages: [
    { pdfPage: 1, text: `Eierform: eierseksjon\nPrisantydning: ${priceText} kr` + (summary ? '\nOppsummering tak TG2: Lekkasje.' : ''), status: 'readable', reason: null, rasterUnprocessed: false },
    { pdfPage: 2, text: 'TILSTANDSRAPPORT\nTilstandsgrad: TG2\nBygningsdel: tak\nLekkasje.\nTILSTANDSRAPPORT - SLUTT', status: 'readable', reason: null, rasterUnprocessed: false },
  ] }
  const manifest: RepresentativeManifest = { version: 1, caseId: 'unit-only', importedAt: '2026-01-01T00:00:00.000Z', original: { file: 'original.pdf', sha256: basis.hash, pageCount: 2, pagesSha256: representativeHash(JSON.stringify(basis.pages)) } }
  const templates = representativeTemplates(manifest, basis)
  // Controlled simulated human inputs exercise the gate; these are never real review evidence.
  const review = JSON.parse(JSON.stringify(templates.review))
  review.attestation = { reviewer: 'Synthetic test operator', reviewedAt: new Date().toISOString(), originalReadIndependently: true, beforeAnyModelOutput: true, realSalesProspectus: true, selectionRationale: 'Simulated assertion for gate test only', scope: 'single-document-trial' }
  for (const page of review.pages) Object.assign(page, { visualOriginalChecked: true, textLayerMatchesOriginal: true, rasterChecked: true, role: page.pdfPage === 2 ? 'report' : 'economy', note: 'Simulated full visual review.' })
  for (const block of review.blocks) Object.assign(block, { reviewed: true, note: 'Simulated full text review.' })
  for (const candidate of review.candidates) Object.assign(candidate, { disposition: 'finding', findingIndex: 0, reason: 'Simulated original condition.', evidence: [{ pdfPage: candidate.pdfPage, quote: basis.pages[candidate.pdfPage - 1]!.text.slice(candidate.start, candidate.end) }] })
  for (const field of review.economy) Object.assign(field, { reviewed: true, note: 'Simulated all-pages review, no inferred zero.' })
  review.reportBoundary = { reviewed: true, note: 'Simulated entire second physical page.', sources: [{ pdfPage: 2, quote: 'TILSTANDSRAPPORT' }] }
  const oracle = { version: 1, kind: 'representative-single-document-trial', authoredBeforeComparison: 'Synthetic gate input before any output', original: manifest.original, reportPages: [2], findings: [{ component: 'tak', grade: 'TG2', description: 'Lekkasje.', sources: [{ pdfPage: 2, quote: 'Tilstandsgrad: TG2\nBygningsdel: tak\nLekkasje.' }] }], economy: { ownership: 'eierseksjon', ownershipSources: [{ pdfPage: 1, quote: 'Eierform: eierseksjon' }], fields: [{ id: 'price', amount: '3000000', period: 'once', year: null, includedIn: null, debtPart: null, source: { pdfPage: 1, quote: `Prisantydning: ${priceText} kr` } }], unknownFields: ListingKeySchema.options.filter(id => id !== 'price').map(id => ({ id, status: 'missing', amount: null, period: 'unknown', year: null, nature: 'unknown', includedIn: null, debtPart: null, sources: [], alternatives: [] })) } }
  if (summary) oracle.findings[0]!.sources.push({ pdfPage: 1, quote: 'Oppsummering tak TG2: Lekkasje.' })
  return { basis, manifest, templates, review, oracle }
}

it('creates wholly pending human templates without copying locally recognized expectations', () => {
  const { templates } = controlledCase()
  expect(templates.review.attestation).toBeNull()
  expect(templates.oracle.findings).toEqual([])
  expect(templates.oracle.economy).toEqual({ ownership: null, ownershipSources: [], fields: [], unknownFields: [] })
  expect(templates.review.pages.every(page => !page.visualOriginalChecked && page.textLayerMatchesOriginal === null)).toBe(true)
  expect(templates.review.blocks.every(block => !block.reviewed)).toBe(true)
  expect(templates.review.candidates[0]?.disposition).toBe('pending')
  expect(templates.review.economy).toHaveLength(9)
})
it('accepts only complete controlled assertions with original source quotes and every coverage item', () => {
  const { basis, manifest, review, oracle } = controlledCase()
  expect(validateRepresentativeOracle(oracle, review, manifest, basis)).toEqual(oracle)
})
it('allows summary sources alongside report evidence and requires duplicate candidates to target their exact source', () => {
  const value = controlledCase(true)
  value.review.candidates[0].disposition = 'duplicate'
  expect(validateRepresentativeOracle(value.oracle, value.review, value.manifest, value.basis)).toEqual(value.oracle)
  value.oracle.findings[0]!.sources.pop()
  expect(() => validateRepresentativeOracle(value.oracle, value.review, value.manifest, value.basis)).toThrow('representative-candidate-mismatch')
  const summaryOnly = controlledCase(true)
  summaryOnly.oracle.findings[0]!.sources.shift()
  expect(() => validateRepresentativeOracle(summaryOnly.oracle, summaryOnly.review, summaryOnly.manifest, summaryOnly.basis)).toThrow('representative-finding-without-report-source')
})
it('blocks pending, post-output, missing-page/block/economy and mismatched report assertions', () => {
  for (const mutate of [
    (value: ReturnType<typeof controlledCase>) => { value.review.attestation = null },
    (value: ReturnType<typeof controlledCase>) => { value.review.attestation.beforeAnyModelOutput = false },
    (value: ReturnType<typeof controlledCase>) => { value.review.pages.pop() },
    (value: ReturnType<typeof controlledCase>) => { value.review.blocks.pop() },
    (value: ReturnType<typeof controlledCase>) => { value.review.candidates.pop() },
    (value: ReturnType<typeof controlledCase>) => { value.review.economy.pop() },
    (value: ReturnType<typeof controlledCase>) => { value.review.pages[1].role = 'other' },
    (value: ReturnType<typeof controlledCase>) => { value.review.attestation.reviewedAt = '2025-01-01T00:00:00.000Z' },
    (value: ReturnType<typeof controlledCase>) => { value.review.attestation.reviewedAt = '2099-01-01T00:00:00.000Z' },
  ]) {
    const value = controlledCase(); mutate(value)
    expect(() => validateRepresentativeOracle(value.oracle, value.review, value.manifest, value.basis)).toThrow(/representative-/)
  }
})
it('blocks invented quotes, altered grades, unknown zeros, missing fixed fields and relation without evidence', () => {
  for (const mutate of [
    (value: ReturnType<typeof controlledCase>) => { value.oracle.findings[0]!.sources[0]!.quote = 'Invented original sentence' },
    (value: ReturnType<typeof controlledCase>) => { value.oracle.findings[0]!.grade = 'TG3' },
    (value: ReturnType<typeof controlledCase>) => { value.review.candidates[0].grade = 'TG3' },
    (value: ReturnType<typeof controlledCase>) => { value.review.candidates[0].findingIndex = 99 },
    (value: ReturnType<typeof controlledCase>) => { value.review.candidates[0].evidence = [{ pdfPage: 1, quote: 'Eierform: eierseksjon' }] },
    (value: ReturnType<typeof controlledCase>) => { value.review.reportBoundary.sources = [{ pdfPage: 1, quote: 'Eierform: eierseksjon' }] },
    (value: ReturnType<typeof controlledCase>) => { value.oracle.economy.unknownFields.pop() },
    (value: ReturnType<typeof controlledCase>) => { value.oracle.economy.unknownFields[0] = { ...value.oracle.economy.unknownFields[0]!, amount: '0' } as never },
    (value: ReturnType<typeof controlledCase>) => { value.oracle.economy.fields[0]!.includedIn = 'commonCosts' as never },
    (value: ReturnType<typeof controlledCase>) => { value.oracle.economy.ownershipSources = [] },
    (value: ReturnType<typeof controlledCase>) => { value.oracle.findings.push(structuredClone(value.oracle.findings[0]!)) },
  ]) {
    const value = controlledCase(); mutate(value)
    expect(() => validateRepresentativeOracle(value.oracle, value.review, value.manifest, value.basis)).toThrow(/representative-/)
  }
})
it('blocks unread physical pages and attachments even when a human claims review', () => {
  const unread = controlledCase(); unread.basis.pages[1]!.status = 'unreadable'; unread.basis.pages[1]!.reason = 'No text layer'
  unread.manifest.original.pagesSha256 = representativeHash(JSON.stringify(unread.basis.pages))
  expect(() => validateRepresentativeOracle(unread.oracle, unread.review, unread.manifest, unread.basis)).toThrow('representative-unread-pages-or-attachments')
  const attachment = controlledCase(); attachment.basis.attachments.push({ id: 'x', name: 'report.pdf', isPdf: true })
  expect(() => validateRepresentativeOracle(attachment.oracle, attachment.review, attachment.manifest, attachment.basis)).toThrow('representative-unread-pages-or-attachments')
})
it('blocks unprocessed raster in report pages while allowing unrelated photos outside the report', () => {
  const report = controlledCase(); report.basis.pages[1]!.rasterUnprocessed = true
  report.manifest.original.pagesSha256 = representativeHash(JSON.stringify(report.basis.pages))
  expect(() => validateRepresentativeOracle(report.oracle, report.review, report.manifest, report.basis)).toThrow('representative-unprocessed-report-raster')
  const photo = controlledCase(); photo.basis.pages[0]!.rasterUnprocessed = true
  photo.manifest.original.pagesSha256 = representativeHash(JSON.stringify(photo.basis.pages))
  expect(validateRepresentativeOracle(photo.oracle, photo.review, photo.manifest, photo.basis)).toEqual(photo.oracle)
})
it('uses contract-sized expectations and exposes only bounded safe validation paths and codes', () => {
  for (const [key, length] of [['component', 201], ['description', 2001]] as const) {
    const value = controlledCase(), privateValue = 'PRIVATE-ADDRESS-DO-NOT-PRINT'
    value.oracle.findings[0]![key] = privateValue.repeat(length).slice(0, length)
    Object.assign(value.oracle, { 'PRIVATE-UNKNOWN-KEY': privateValue })
    let message = ''
    try { validateRepresentativeOracle(value.oracle, value.review, value.manifest, value.basis) } catch (error) { message = (error as Error).message }
    expect(message).toContain(`oracle.findings[0].${key}=too_big`)
    expect(message).toContain('oracle=unrecognized_keys')
    expect(message).not.toContain(privateValue); expect(message).not.toContain('PRIVATE-UNKNOWN-KEY')
    expect(message.length).toBeLessThan(1100)
  }
})
it('allows identical condition labels and prose at distinct physical sources but rejects exact duplicates', () => {
  const value = controlledCase(), finding = value.oracle.findings[0]!
  // Controlled independent conditions share wording; each still has a distinct report anchor.
  value.basis.pages.push({ ...value.basis.pages[1]!, pdfPage: 3 })
  value.manifest.original.pageCount = 3; value.manifest.original.pagesSha256 = representativeHash(JSON.stringify(value.basis.pages))
  value.oracle.reportPages.push(3)
  value.oracle.findings.push({ ...structuredClone(finding), sources: finding.sources.map(source => ({ ...source, pdfPage: 3 })) })
  value.review.pages.push({ ...value.review.pages[1], pdfPage: 3 })
  const template = representativeTemplates(value.manifest, value.basis).review
  value.review.blocks = template.blocks.map(block => ({ ...block, reviewed: true, note: 'Simulated complete text review.' }))
  value.review.candidates = template.candidates.map(candidate => ({ ...candidate, disposition: 'finding', findingIndex: candidate.pdfPage === 3 ? 1 : 0, reason: 'Simulated distinct physical condition.', evidence: [{ pdfPage: candidate.pdfPage, quote: value.basis.pages[candidate.pdfPage - 1]!.text.slice(candidate.start, candidate.end) }] }))
  value.review.reportBoundary.sources.push({ pdfPage: 3, quote: 'TILSTANDSRAPPORT' })
  expect(validateRepresentativeOracle(value.oracle, value.review, value.manifest, value.basis)).toEqual(value.oracle)
  value.oracle.findings[1]!.sources = structuredClone(finding.sources).reverse()
  expect(() => validateRepresentativeOracle(value.oracle, value.review, value.manifest, value.basis)).toThrow('representative-duplicate-finding')
})
it('checks amounts, debt parts and explicit years lexically without deriving financial values', () => {
  const grouped = controlledCase(); grouped.oracle.economy.fields[0]!.amount = '3000000.00'
  expect(validateRepresentativeOracle(grouped.oracle, grouped.review, grouped.manifest, grouped.basis)).toEqual(grouped.oracle)
  const nonbreaking = controlledCase()
  nonbreaking.basis.pages[0]!.text = nonbreaking.basis.pages[0]!.text.replace('3 000 000', '3\u00a0000\u00a0000')
  nonbreaking.oracle.economy.fields[0]!.source.quote = nonbreaking.oracle.economy.fields[0]!.source.quote.replace('3 000 000', '3\u00a0000\u00a0000')
  nonbreaking.manifest.original.pagesSha256 = representativeHash(JSON.stringify(nonbreaking.basis.pages))
  expect(validateRepresentativeOracle(nonbreaking.oracle, nonbreaking.review, nonbreaking.manifest, nonbreaking.basis)).toEqual(nonbreaking.oracle)
  for (const patch of [{ amount: '3000001' }, { debtPart: '1000' }, { year: '2025' }, { allowedYears: ['2025'] }]) {
    const value = controlledCase(), field = value.oracle.economy.fields[0]!
    Object.assign(field, { relationSources: [field.source] }, patch)
    expect(() => validateRepresentativeOracle(value.oracle, value.review, value.manifest, value.basis)).toThrow('representative-economy-transcription-mismatch')
  }
})
it('transcribes unambiguous dot grouping, dot decimals and grouped comma decimals without changing quotes', () => {
  for (const [printed, amount] of [['3.000.000', '3000000'], ['3000000.50', '3000000.50'], ['3.000.000,50', '3000000.50'], ['3 000 000,50', '3000000.50'], ['3.000,50', '3000.50']]) {
    const value = controlledCase(false, printed), field = value.oracle.economy.fields[0]!
    field.amount = amount!
    const quote = `Prisantydning: ${printed} kr`
    expect(validateRepresentativeOracle(value.oracle, value.review, value.manifest, value.basis).economy.fields[0]!.source.quote).toBe(quote)
    field.amount = '3000001'
    expect(() => validateRepresentativeOracle(value.oracle, value.review, value.manifest, value.basis)).toThrow('representative-economy-transcription-mismatch')
  }
})
it('rejects ambiguous three-digit separators and partial numeric prefix or suffix transcriptions', () => {
  for (const [printed, amount] of [['3.000', '3000'], ['3.000', '3'], ['3,000', '3000'], ['3000000.500', '3000000.5'], ['3.000.000', '3'], ['3000000.50', '3000000'], ['3.000.000,50', '50']]) {
    const value = controlledCase(false, printed)
    value.oracle.economy.fields[0]!.amount = amount!
    expect(() => validateRepresentativeOracle(value.oracle, value.review, value.manifest, value.basis)).toThrow('representative-economy-transcription-mismatch')
  }
})

it('delt leksikalsk beløpskontroll avviser Unicode-minus som positiv verdi', () => {
  expect(quoteContainsAmount('Prisantydning: − 125 000 kr', '125000')).toBe(false)
  expect(quoteContainsAmount('Prisantydning: - 125 000 kr', '125000')).toBe(false)
  expect(quoteContainsAmount('Prisantydning: 125 000 kr', '125000')).toBe(true)
})
