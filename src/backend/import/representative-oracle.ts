import { z } from 'zod'
import { createHash } from 'node:crypto'
import { ListingDecimalSchema, ListingKeySchema } from '../../contracts/listing.ts'
import { createLocalPlan } from './local-plan.ts'
import type { ImportBasis } from './local-plan.ts'
import type { FrozenOracle } from './oracle-comparison.ts'

export const representativeHash = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const text = z.string().trim().min(1).max(4000)
const source = z.strictObject({ pdfPage: z.number().int().min(1).max(200), quote: z.string().min(1).max(2000) })
const period = z.enum(['once', 'month', 'year', 'unknown'])
const year = z.string().regex(/^\d{4}$/).nullable()
const original = z.strictObject({ file: z.literal('original.pdf'), sha256: z.string().regex(/^[a-f0-9]{64}$/), pageCount: z.number().int().min(1).max(200), pagesSha256: z.string().regex(/^[a-f0-9]{64}$/) })
export const RepresentativeManifestSchema = z.strictObject({ version: z.literal(1), caseId: z.string(), importedAt: z.iso.datetime(), original })
export type RepresentativeManifest = z.infer<typeof RepresentativeManifestSchema>
const OracleSchema = z.strictObject({
  version: z.literal(1), kind: z.literal('representative-single-document-trial'), authoredBeforeComparison: text, original,
  reportPages: z.array(z.number().int().positive()).min(1).max(200),
  findings: z.array(z.strictObject({ component: z.string().trim().min(1).max(200), grade: z.enum(['TG2', 'TG3']), description: z.string().trim().min(1).max(2000), sources: z.array(source).min(1).max(12) })).max(200),
  economy: z.strictObject({ ownership: z.enum(['eierseksjon', 'borettslag', 'unknown']), ownershipSources: z.array(source).max(10),
    fields: z.array(z.strictObject({ id: ListingKeySchema, amount: ListingDecimalSchema, period, year, allowedYears: z.array(year).min(1).optional(), includedIn: z.string().max(80).nullable(), debtPart: ListingDecimalSchema.nullable(), source, relationSources: z.array(source).min(1).max(12).optional() })).max(9),
    unknownFields: z.array(z.strictObject({ id: ListingKeySchema, status: z.enum(['missing', 'unavailable']), amount: z.null(), period, year: z.null(), nature: z.literal('unknown'), includedIn: z.null(), debtPart: z.null(), sources: z.array(z.never()).length(0), alternatives: z.array(z.never()).length(0) })).max(9),
  }),
})
const span = { id: z.string(), pdfPage: z.number().int(), start: z.number().int(), end: z.number().int() }
const ReviewSchema = z.strictObject({
  version: z.literal(1),
  attestation: z.strictObject({ reviewer: text, reviewedAt: z.iso.datetime(), originalReadIndependently: z.literal(true), beforeAnyModelOutput: z.literal(true), realSalesProspectus: z.literal(true), selectionRationale: text, scope: z.literal('single-document-trial') }),
  pages: z.array(z.strictObject({ pdfPage: z.number().int(), visualOriginalChecked: z.literal(true), textLayerMatchesOriginal: z.literal(true), rasterChecked: z.literal(true), role: z.enum(['report', 'economy', 'report-and-economy', 'other']), note: text })).min(1).max(200),
  blocks: z.array(z.strictObject({ ...span, reviewed: z.literal(true), note: text })),
  candidates: z.array(z.strictObject({ ...span, grade: z.enum(['TG2', 'TG3']), disposition: z.enum(['finding', 'duplicate', 'not-finding']), findingIndex: z.number().int().nonnegative().nullable(), reason: text, evidence: z.array(source).min(1).max(12) })),
  economy: z.array(z.strictObject({ id: ListingKeySchema, reviewed: z.literal(true), note: text })).length(9),
  reportBoundary: z.strictObject({ reviewed: z.literal(true), note: text, sources: z.array(source).min(1).max(12) }),
  attachments: z.array(z.never()).length(0),
})

// These schema-owned paths and codes help operators without echoing quotes, input values or unknown keys.
const safePathKeys = new Set('version kind authoredBeforeComparison original file sha256 pageCount pagesSha256 reportPages findings component grade description sources pdfPage quote economy ownership ownershipSources fields id amount period year allowedYears includedIn debtPart source relationSources unknownFields status nature alternatives attestation reviewer reviewedAt originalReadIndependently beforeAnyModelOutput realSalesProspectus selectionRationale scope pages visualOriginalChecked textLayerMatchesOriginal rasterChecked role note blocks start end reviewed candidates disposition findingIndex reason evidence reportBoundary attachments'.split(' '))
function safeValidationIssues(label: string, error: z.ZodError) {
  return error.issues.slice(0, 8).map(issue => `${label}${issue.path.slice(0, 10).map(part => typeof part === 'number' ? `[${part}]` : `.${safePathKeys.has(String(part)) ? String(part) : 'field'}`).join('')}=${issue.code}`)
}
const canonicalDecimal = (value: string) => {
  const [integer = '0', fraction = ''] = value.split('.')
  const tail = fraction.replace(/0+$/, '')
  return integer.replace(/^0+(?=\d)/, '') + (tail ? `.${tail}` : '')
}
/** Lexical transcription only: no arithmetic, currency inference or relationship derivation. */
function quoteContainsAmount(quote: string, amount: string) {
  // Consume the entire punctuated token first; unsupported forms must not match a numeric prefix/suffix.
  const numbers = quote.matchAll(/(?<![\d.,])\d+(?:(?:[.,]\d+)|(?:[ \u00a0\u202f]\d{3}(?!\d)))*(?!\d|[.,]\d)/gu)
  for (const number of numbers) {
    if (/-\s*$/.test(quote.slice(0, number.index))) continue
    const token = number[0]
    let decimal: string | null = null
    if (/^\d+(?:[.,]\d{1,2})?$/.test(token)) decimal = token.replace(',', '.')
    else if (/^\d{1,3}(?:[ \u00a0\u202f]\d{3})+(?:[.,]\d{1,2})?$/.test(token)) decimal = token.replace(/[ \u00a0\u202f]/g, '').replace(',', '.')
    // Multiple dot groups, or dot grouping followed by an explicit comma fraction, are unambiguous.
    else if (/^\d{1,3}(?:\.\d{3}){2,}(?:,\d{1,2})?$/.test(token) || /^\d{1,3}\.\d{3},\d{1,2}$/.test(token)) decimal = token.replace(/\./g, '').replace(',', '.')
    if (decimal !== null && canonicalDecimal(decimal) === canonicalDecimal(amount)) return true
  }
  return false
}
function quoteContainsYear(quote: string, value: string) {
  return [...quote.matchAll(/(?<!\d)\d{4}(?!\d)/g)].some(match => match[0] === value)
}

/** Templates contain machine coverage only. Expected facts and all human attestations stay empty. */
export function representativeTemplates(manifest: RepresentativeManifest, basis: ImportBasis) {
  const plan = createLocalPlan(basis)
  const review = {
    version: 1, attestation: null,
    pages: basis.pages.map(page => ({ pdfPage: page.pdfPage, visualOriginalChecked: false, textLayerMatchesOriginal: null, rasterChecked: false, role: null, note: null })),
    blocks: plan.manifest.blocks.map(({ id, pdfPage, start, end }) => ({ id, pdfPage, start, end, reviewed: false, note: null })),
    candidates: plan.manifest.candidates.map(({ id, pdfPage, start, end, grade }) => ({ id, pdfPage, start, end, grade, disposition: 'pending', findingIndex: null, reason: null, evidence: [] })),
    economy: ListingKeySchema.options.map(id => ({ id, reviewed: false, note: null })),
    reportBoundary: { reviewed: false, note: null, sources: [] }, attachments: basis.attachments.map(attachment => ({ ...attachment, status: 'pending' })),
  }
  return { review, oracle: { version: 1, kind: 'representative-single-document-trial', authoredBeforeComparison: '', original: manifest.original, reportPages: [], findings: [], economy: { ownership: null, ownershipSources: [], fields: [], unknownFields: [] } },
    coverage: { blocks: plan.manifest.blocks, candidates: plan.manifest.candidates, residual: plan.manifest.residual, attachments: basis.attachments } }
}

/** Records explicit human claims; software cannot establish who actually read an original. */
export function validateRepresentativeOracle(rawOracle: unknown, rawReview: unknown, manifest: RepresentativeManifest, basis: ImportBasis): FrozenOracle {
  const parsedOracle = OracleSchema.safeParse(rawOracle), parsedReview = ReviewSchema.safeParse(rawReview)
  if (!parsedOracle.success || !parsedReview.success) {
    const issues = [...(!parsedOracle.success ? safeValidationIssues('oracle', parsedOracle.error) : []), ...(!parsedReview.success ? safeValidationIssues('review', parsedReview.error) : [])].slice(0, 8)
    throw new Error(`representative-human-review-pending-or-invalid: ${issues.join('; ').slice(0, 1024)}`)
  }
  const oracle = parsedOracle.data, review = parsedReview.data
  if (JSON.stringify(oracle.original) !== JSON.stringify(manifest.original) || basis.hash !== manifest.original.sha256 || basis.pages.length !== manifest.original.pageCount || representativeHash(JSON.stringify(basis.pages)) !== manifest.original.pagesSha256) throw new Error('representative-original-mismatch')
  if (basis.attachments.length || basis.pages.some((page, index) => page.pdfPage !== index + 1 || !['readable', 'blank'].includes(page.status))) throw new Error('representative-unread-pages-or-attachments')
  const sameSpans = (expected: { id: string; pdfPage: number; start: number; end: number }[], actual: typeof expected) => expected.length === actual.length && expected.every((item, index) => ['id', 'pdfPage', 'start', 'end'].every(key => item[key as keyof typeof item] === actual[index]?.[key as keyof typeof item]))
  const plan = createLocalPlan(basis)
  if (review.pages.length !== basis.pages.length || review.pages.some((page, index) => page.pdfPage !== index + 1)
    || !sameSpans(plan.manifest.blocks, review.blocks) || !sameSpans(plan.manifest.candidates, review.candidates)
    || review.economy.some((item, index) => item.id !== ListingKeySchema.options[index])) throw new Error('representative-incomplete-coverage-ledger')
  if (new Date(review.attestation.reviewedAt).getTime() < new Date(manifest.importedAt).getTime() || new Date(review.attestation.reviewedAt).getTime() > Date.now()) throw new Error('representative-review-time-invalid')
  const reportPages = review.pages.filter(page => page.role === 'report' || page.role === 'report-and-economy').map(page => page.pdfPage)
  if (JSON.stringify(reportPages) !== JSON.stringify(oracle.reportPages)) throw new Error('representative-report-area-mismatch')
  if (reportPages.some(page => basis.pages[page - 1]?.rasterUnprocessed)) throw new Error('representative-unprocessed-report-raster')
  const sources = [...oracle.findings.flatMap(finding => finding.sources), ...oracle.economy.ownershipSources, ...oracle.economy.fields.flatMap(field => [field.source, ...(field.relationSources ?? [])]), ...review.candidates.flatMap(candidate => candidate.evidence), ...review.reportBoundary.sources]
  if (sources.some(source => basis.pages[source.pdfPage - 1]?.status !== 'readable' || !basis.pages[source.pdfPage - 1]!.text.includes(source.quote))) throw new Error('representative-oracle-source-invalid')
  if (oracle.findings.some(finding => !finding.sources.some(source => reportPages.includes(source.pdfPage)))) throw new Error('representative-finding-without-report-source')
  if (![reportPages[0], reportPages.at(-1)].every(page => review.reportBoundary.sources.some(source => source.pdfPage === page))) throw new Error('representative-report-boundary-source-missing')
  const identities = oracle.findings.map(finding => `${finding.component.trim().toLocaleLowerCase('nb')}\0${finding.description.trim().toLocaleLowerCase('nb')}\0${JSON.stringify([...new Set(finding.sources.map(source => JSON.stringify([source.pdfPage, source.quote])))].sort())}`)
  if (new Set(identities).size !== identities.length) throw new Error('representative-duplicate-finding')
  for (const [index, candidate] of review.candidates.entries()) {
    const expected = plan.manifest.candidates[index]!
    if (candidate.grade !== expected.grade) throw new Error('representative-candidate-mismatch')
    const coversCandidate = (source: { pdfPage: number; quote: string }) => {
      if (source.pdfPage !== candidate.pdfPage) return false
      const page = basis.pages[candidate.pdfPage - 1]!.text
      for (let offset = page.indexOf(source.quote); offset >= 0; offset = page.indexOf(source.quote, offset + 1)) if (offset <= candidate.start && offset + source.quote.length >= candidate.end) return true
      return false
    }
    if (!candidate.evidence.some(coversCandidate)) throw new Error('representative-candidate-evidence-missing')
    if (candidate.disposition === 'not-finding') { if (candidate.findingIndex !== null) throw new Error('representative-candidate-mismatch'); continue }
    const finding = candidate.findingIndex === null ? undefined : oracle.findings[candidate.findingIndex]
    if (!finding || finding.grade !== candidate.grade || !finding.sources.some(coversCandidate)) throw new Error('representative-candidate-mismatch')
  }
  const ids = [...oracle.economy.fields, ...oracle.economy.unknownFields].map(field => field.id)
  if (ids.length !== ListingKeySchema.options.length || new Set(ids).size !== ids.length || ListingKeySchema.options.some(id => !ids.includes(id))) throw new Error('representative-economy-incomplete')
  if (oracle.economy.ownership !== 'unknown' && !oracle.economy.ownershipSources.length || oracle.economy.fields.some(field => (field.includedIn !== null || field.debtPart !== null) && !field.relationSources?.length)) throw new Error('representative-economy-source-missing')
  for (const field of oracle.economy.fields) {
    const parent = oracle.economy.fields.find(other => other.id === field.includedIn)
    const yearSources = [field.source, ...(field.relationSources ?? []), ...(parent ? [parent.source, ...(parent.relationSources ?? [])] : [])]
    if (!quoteContainsAmount(field.source.quote, field.amount)
      || field.debtPart !== null && !field.relationSources!.some(source => quoteContainsAmount(source.quote, field.debtPart!))
      || [field.year, ...(field.allowedYears ?? [])].some(value => value !== null && !yearSources.some(source => quoteContainsYear(source.quote, value)))) throw new Error('representative-economy-transcription-mismatch')
  }
  return oracle
}
