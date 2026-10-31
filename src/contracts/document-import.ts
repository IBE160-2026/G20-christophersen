import { z } from 'zod'
import { CheckableFindingSchema, DocumentPageSchema, ReportHashSchema } from './document-analysis.ts'
import { ListingFieldSchema, ListingKeySchema } from './listing.ts'
import type { AnalysisOutcome } from './document-analysis.ts'
import { AnalysisHttpCorrelationSchema } from './analysis-http.ts'
import { PdfSourceSchema } from './pdf-source.ts'
import type { PdfSource } from './pdf-source.ts'
import { PropertyRiskSchema } from './property-risk.ts'
export { PdfSourceSchema } from './pdf-source.ts'
export type { PdfSource } from './pdf-source.ts'

export const IMPORT_VERSION = 'document-import-1' as const
export const IMPORT_EXTRACTION_VERSION = 'bounded-pdf-text-1' as const
export const IMPORT_PROMPT_VERSION = 'economy-tg-1' as const
export const IMPORT_MODEL = 'offline-synthetic-1' as const
export const CODE_FIRST_PROMPT_VERSION = 'semantic-spans-1' as const
export const CODE_FIRST_PLAN_VERSION = 'local-plan-1' as const
export const CODE_FIRST_MODEL = 'gpt-6.1-sol' as const
export const IMPORT_MAX_PDF_BYTES = 50 * 1024 * 1024
export const IMPORT_MAX_RESPONSE_BYTES = 8 * 1024 * 1024
export const ImportRoleSchema = z.enum(['prospectus', 'report'])
export const ImportContextSchema = z.strictObject({
  contractVersion: z.literal(IMPORT_VERSION), extractionVersion: z.literal(IMPORT_EXTRACTION_VERSION),
  promptVersion: z.enum([IMPORT_PROMPT_VERSION, CODE_FIRST_PROMPT_VERSION]), model: z.enum([IMPORT_MODEL, CODE_FIRST_MODEL]), mode: z.literal('demo'),
  requestId: z.string().min(1).max(100), reportHash: ReportHashSchema, documentName: z.string().min(1).max(255),
  role: ImportRoleSchema, pageCount: z.number().int().min(1).max(200), inputDigest: ReportHashSchema,
})
export const ImportDocumentSchema = z.strictObject({
  hash: ReportHashSchema, name: z.string().min(1).max(255), pageCount: z.number().int().min(1).max(200), role: ImportRoleSchema,
  parentHash: ReportHashSchema.nullable(), attachmentId: z.string().max(1024).nullable(),
})
export const EconomyFieldSchema = ListingFieldSchema.omit({ source: true, alternatives: true }).extend({
  nature: z.enum(['fact', 'stated-estimate', 'unknown']), originalText: z.string().max(4000),
  sources: z.array(PdfSourceSchema).max(12),
  alternatives: z.array(z.strictObject({ amount: ListingFieldSchema.shape.amount, source: PdfSourceSchema })).max(10),
})
export const PropertyCandidateSchema = z.strictObject({
  kind: z.enum(['address', 'municipality', 'farm', 'holding', 'section', 'share']), value: z.string().min(1).max(300), source: PdfSourceSchema,
})
export const ImportSectionSchema = z.strictObject({
  documentHash: ReportHashSchema, startPage: z.number().int().positive(), endPage: z.number().int().positive(),
  certainty: z.enum(['certain', 'ambiguous']), basis: z.array(PdfSourceSchema).min(1).max(12),
}).refine(section => section.endPage >= section.startPage, 'Ugyldig rapportområde.')
export const CoverageStatusSchema = z.enum(['missing', 'ambiguous', 'unreadable', 'incomplete', 'complete'])
export const CoverageSchema = z.strictObject({
  status: CoverageStatusSchema, reasons: z.array(z.string().min(1).max(1000)).max(100),
  omittedPages: z.array(z.number().int().positive()).max(200), unreadPages: z.array(z.number().int().positive()).max(200),
  unprocessedAttachments: z.array(z.string().max(1024)).max(40),
})
export const ImportFindingSchema = CheckableFindingSchema.extend({
  component: z.string().min(1).max(200), conditionId: z.string().min(1).max(200), sources: z.array(PdfSourceSchema).min(1).max(12),
})
export const ImportPageSchema = DocumentPageSchema.safeExtend({ rasterUnprocessed: z.boolean().default(false) })
/** Whitespace-only search normalization; every normalized UTF-16 unit maps back to the original. */
export function normalizeImportText(text: string) {
  const offsets: number[] = [], characters: string[] = []
  for (let index = 0; index < text.length; index++) {
    if (/\s/u.test(text[index]!)) continue
    const character = text[index]!.toUpperCase()
    characters.push(character)
    for (let unit = 0; unit < character.length; unit++) offsets.push(index)
  }
  return { text: characters.join(''), offsets }
}
export function collectTgCandidates(text: string) {
  const normalized = normalizeImportText(text)
  return [...normalized.text.matchAll(/(?:TILSTANDSGRAD:?|TG)([23])/g)].map(match => ({ start: normalized.offsets[match.index]!, end: normalized.offsets[match.index + match[0].length - 1]! + 1, grade: `TG${match[1]}` as 'TG2' | 'TG3' }))
}
export const ImportSpanSchema = z.strictObject({ id: z.string().min(1), pdfPage: z.number().int().positive(), start: z.number().int().nonnegative(), end: z.number().int().nonnegative() })
export const IMPORT_MAX_MANIFEST_ITEMS = 4000
// One residual per block/candidate, two overflow diagnostics per fixed economy field
// and ten other diagnostic categories per physical page, plus attachments/terminal diagnostics.
// Adapter deduplicates identical page/reason entries; no original interval is removed.
export const IMPORT_MAX_RESIDUAL_ENTRIES = 2 * IMPORT_MAX_MANIFEST_ITEMS + 200 * (2 * ListingKeySchema.options.length + 10) + 44
export const ImportManifestSchema = z.strictObject({
  version: z.literal(CODE_FIRST_PLAN_VERSION),
  blocks: z.array(ImportSpanSchema.extend({ result: z.enum(['local-blank', 'local-explicit', 'semantic', 'unresolved']), sent: z.boolean() })).max(IMPORT_MAX_MANIFEST_ITEMS),
  candidates: z.array(ImportSpanSchema.extend({ grade: z.enum(['TG2', 'TG3']), disposition: z.enum(['finding', 'duplicate', 'not-finding', 'unresolved']), findingId: z.string().nullable(), evidence: z.array(PdfSourceSchema).max(12), reason: z.string().nullable() })).max(IMPORT_MAX_MANIFEST_ITEMS),
  residual: z.array(z.strictObject({ pdfPage: z.number().int().positive(), reason: z.string().min(1) })).max(IMPORT_MAX_RESIDUAL_ENTRIES),
})
export const ImportCostSchema = z.strictObject({
  analysisId: z.string().min(1), requestDigest: ReportHashSchema, model: z.literal(CODE_FIRST_MODEL),
  tokenizer: z.enum(['unavailable', 'test-only', 'verified-local-model-and-request-framing', 'verified-server-input-tokens', 'offline-sdk-stub', 'conservative-local-byte-budget']), priceVersion: z.string().nullable(),
  usageCostBasis: z.enum(['provider-usage-upper-bound', 'provider-usage-exact']).optional(),
  inputTokens: z.number().int().nonnegative().nullable(), outputTokens: z.number().int().positive(),
  estimatedUsd: z.string().nullable(), reservedUsd: z.string(), remainingUsd: z.string(), actualUsd: z.string().nullable(),
  status: z.enum(['blocked', 'reserved', 'completed', 'uncertain']), reason: z.string().nullable(),
})
export const EconomyAnalysisSchema = z.strictObject({
  provenance: z.enum(['saved-same-document', 'live-document', 'local-only']),
  reason: z.string().min(1).max(1000), requestDigest: ReportHashSchema.nullable(),
  selectedPages: z.array(z.number().int().positive()).max(200),
  observations: z.array(z.strictObject({ kind: z.string().min(1).max(80), raw: z.string().min(1).max(2000), sources: z.array(PdfSourceSchema).min(1).max(12) })).max(1000),
  limitations: z.array(z.strictObject({ text: z.string().min(1).max(2000), sources: z.array(PdfSourceSchema).min(1).max(12) })).max(100),
})
export const DocumentImportSchema = ImportContextSchema.extend({
  manifest: ImportManifestSchema.optional(), cost: ImportCostSchema.optional(),
  propertyRisk: PropertyRiskSchema.optional(),
  status: z.literal('imported'), documents: z.array(ImportDocumentSchema).length(1), pages: z.array(ImportPageSchema).min(1).max(200),
  attachments: z.array(z.strictObject({ id: z.string().max(1024), name: z.string().max(1024), isPdf: z.boolean() })).max(40),
  propertyIdentity: z.array(PropertyCandidateSchema).max(20), sections: z.array(ImportSectionSchema).max(10),
  coverage: z.strictObject({ economy: CoverageSchema, technical: CoverageSchema }),
  economy: z.strictObject({ status: z.enum(['complete', 'partial', 'unavailable']), ownership: z.enum(['eierseksjon', 'borettslag', 'unknown']), ownershipSources: z.array(PdfSourceSchema).max(10), fields: z.array(EconomyFieldSchema).max(40), analysis: EconomyAnalysisSchema.optional() }),
  technical: z.strictObject({ status: z.enum(['complete', 'blocked']), findings: z.array(ImportFindingSchema).max(200), uncertainties: z.array(z.string().min(1)).max(100), limitations: z.array(z.string().min(1)).max(100) }),
}).superRefine((value, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: 'custom', message })
  const document = value.documents[0]!
  if (document.hash !== value.reportHash || document.name !== value.documentName || document.role !== value.role || document.pageCount !== value.pageCount) fail('Dokumentidentitet stemmer ikke.')
  if (value.pages.length !== value.pageCount || value.pages.some((page, index) => page.pdfPage !== index + 1)) fail('Alle fysiske sider kreves i rekkefølge.')
  const sourceValid = (source: PdfSource, partialText = false) => {
    const page = value.pages[source.pdfPage - 1]
    return source.documentHash === value.reportHash && source.documentName === value.documentName && (page?.status === 'readable'
      || partialText && (page?.status === 'unknown' || page?.status === 'incomplete'))
      && source.start < page.text.length && source.end <= page.text.length && source.end - source.start === source.quote.length
      && page.text.slice(source.start, source.end) === source.quote
  }
  const sources = [...value.propertyIdentity.map(item => item.source), ...value.sections.flatMap(item => item.basis), ...value.economy.ownershipSources,
    ...value.economy.fields.flatMap(field => [...field.sources, ...field.alternatives.map(item => item.source)]),
    ...(value.economy.analysis?.observations.flatMap(item => item.sources) ?? []), ...(value.economy.analysis?.limitations.flatMap(item => item.sources) ?? []), ...value.technical.findings.flatMap(item => item.sources)]
  if (sources.some(source => !sourceValid(source))) fail('Kildefeil: hash, fysisk side, lesbarhet eller ordrett tekstområde avviker.')
  if (value.propertyRisk) {
    for (const domain of ['legal', 'technical'] as const) {
      const risk = value.propertyRisk[domain]
      for (const pages of [risk.examinedPages, risk.unreadPages]) {
        if (new Set(pages).size !== pages.length || pages.some(page => page > value.pageCount)) fail('Risikoanalysen har ugyldig sideoversikt.')
      }
      if (risk.examinedPages.some(page => {
        const basis = value.pages[page - 1]
        return basis?.status !== 'readable' && !(domain === 'technical' && basis?.text.trim() && ['unknown', 'incomplete'].includes(basis.status))
      })) fail('Undersøkte risikosider må ha tilgjengelig tekstgrunnlag.')
      if (new Set(risk.findings.map(item => item.id)).size !== risk.findings.length) fail('Risikoanalysen har dupliserte funn.')
      if (risk.findings.some(item => item.domain !== domain || (item.category === 'technical') !== (domain === 'technical')
        || domain === 'legal' && item.grade !== null || item.sources.some(source => !risk.examinedPages.includes(source.pdfPage)))) fail('Risikofunn må ha riktig fagområde og undersøkt originalkilde.')
      for (const item of risk.findings) {
        const partialText = item.sourceQuality === 'partial-text'
        if (partialText && (domain !== 'technical' || item.status !== 'possible' || item.grade !== null)) fail('Ufullstendig tekst kan bare gi mulige tekniske forhold uten fastslått grad.')
        if (item.sources.some(source => !sourceValid(source, partialText))) fail('Risikoens tekstbelegg må samsvare ordrett med originalens dokument, side og offset.')
        if (item.sources.some(source => value.pages[source.pdfPage - 1]?.status !== 'readable'
          && !risk.unreadPages.includes(source.pdfPage))) fail('Ufullstendig risikokilde må bevares i oversikten over uleste sider.')
      }
      if (risk.coverage === 'unavailable' && risk.findings.length > 0) fail('Utilgjengelig risikoanalyse kan ikke inneholde funn.')
    }
  }
  const analysis = value.economy.analysis
  if (analysis) {
    if (new Set(analysis.selectedPages).size !== analysis.selectedPages.length || analysis.selectedPages.some(page => page > value.pageCount)) fail('Økonomianalysen har ugyldige fysiske sider.')
    if (analysis.observations.some(item => !item.sources.some(source => source.quote.includes(item.raw)))) fail('Observasjonen må bevare originaltekst.')
    if (analysis.provenance !== 'local-only' && (!analysis.requestDigest || !analysis.selectedPages.length)) fail('Lagret analyse krever forespørsel og sider.')
    if (analysis.provenance === 'local-only' && (analysis.requestDigest !== null || analysis.selectedPages.length || analysis.observations.length || analysis.limitations.length)) fail('Lokalt uttrekk kan ikke utgi seg for lagret analyse.')
    if (analysis.provenance !== 'local-only' && [...analysis.observations.flatMap(item => item.sources), ...analysis.limitations.flatMap(item => item.sources)].some(source => !analysis.selectedPages.includes(source.pdfPage))) fail('Økonomikilde er utenfor analyserte sider.')
  }
  if (value.sections.some(section => section.documentHash !== value.reportHash || section.endPage > value.pageCount)) fail('Rapportområde ligger utenfor dokumentet.')
  if (new Set(value.economy.fields.map(field => field.id)).size !== value.economy.fields.length || ListingKeySchema.options.some(id => !value.economy.fields.some(field => field.id === id))) fail('Faste økonomifelt og unike identiteter kreves.')
  for (const field of value.economy.fields) {
    const expectedCategory = ['price', 'totalPrice', 'sharedDebt'].includes(field.id) ? 'price' : ['purchaseCosts', 'documentTax'].includes(field.id) ? 'one-off' : ListingKeySchema.options.includes(field.id as typeof ListingKeySchema.options[number]) ? 'recurring' : field.category
    if (field.category !== expectedCategory) fail('Fast økonomifelt har feil kategori.')
    if (field.status === 'available' && (field.amount === null || field.sources.length === 0)) fail('Tilgjengelig beløp krever kilde.')
    if (['missing', 'unavailable'].includes(field.status) && field.amount !== null) fail('Ukjent felt kan ikke ha beløp.')
    if ((field.status === 'conflict') !== (field.alternatives.length > 0)) fail('Konflikt må bevare alle alternative belegg.')
  }
  const attachmentIds = new Set(value.attachments.map(item => item.id))
  if (attachmentIds.size !== value.attachments.length) fail('Duplisert vedleggsidentitet.')
  for (const coverage of [value.coverage.economy, value.coverage.technical]) {
    const pending = coverage.unprocessedAttachments
    if (new Set(pending).size !== pending.length || pending.length !== attachmentIds.size || pending.some(id => !attachmentIds.has(id))) fail('Alle oppdagede vedlegg må bevares som ubehandlet, uten ukjente eller dupliserte identiteter.')
    if (coverage.status === 'complete' && attachmentIds.size > 0) fail('Ubehandlede vedlegg kan ikke skjules med komplett dekning.')
    for (const positions of [coverage.omittedPages, coverage.unreadPages]) if (new Set(positions).size !== positions.length || positions.some(page => page > value.pageCount)) fail('Dekningslisten har ugyldige fysiske sider.')
  }
  if (new Set(value.technical.findings.map(finding => finding.conditionId)).size !== value.technical.findings.length) fail('Samme identifiserte forhold må samles i ett funn med flere belegg.')
  const ids = new Set<string>()
  for (const finding of value.technical.findings) {
    const source = finding.sources[0]!
    if (ids.has(finding.findingId)) fail('Duplisert funnidentitet.')
    ids.add(finding.findingId)
    if (finding.source.reportHash !== value.reportHash || finding.source.documentName !== value.documentName || finding.source.pdfPage !== source.pdfPage
      || finding.original.findingId !== finding.findingId || finding.original.description !== finding.description || finding.original.grade !== finding.grade
      || finding.original.source?.reportHash !== value.reportHash || finding.original.source?.documentName !== value.documentName || finding.original.source?.pdfPage !== source.pdfPage
      || finding.original.uncertainties.length > 0) fail('TG-original og kilde må samsvare.')
  }
  if (value.model === CODE_FIRST_MODEL) {
    if (value.promptVersion !== CODE_FIRST_PROMPT_VERSION || !value.manifest || !value.cost || value.cost.requestDigest !== value.inputDigest) fail('Code-first kontekst krever bundet manifest og kostnad.')
  } else if (value.promptVersion !== IMPORT_PROMPT_VERSION || value.manifest || value.cost) fail('Uforenlig adapterkontekst.')
  if (value.manifest) {
    const manifest = value.manifest
    const spanIds = new Set<string>()
    const expectedCandidates = value.pages.flatMap(page => collectTgCandidates(page.text).map(candidate => ({ ...candidate, pdfPage: page.pdfPage })))
    if (expectedCandidates.length !== manifest.candidates.length || expectedCandidates.some(expected => !manifest.candidates.some(candidate => candidate.pdfPage === expected.pdfPage && candidate.start === expected.start && candidate.end === expected.end && candidate.grade === expected.grade))) fail('Alle originale TG-kandidater må bevares i manifestet.')
    for (const page of value.pages) {
      const blocks = manifest.blocks.filter(block => block.pdfPage === page.pdfPage).sort((a, b) => a.start - b.start)
      let end = 0
      for (const block of blocks) {
        if (spanIds.has(block.id) || block.start !== end || block.end < block.start || block.end > page.text.length) fail('Manifestet har hull, overlapp eller feil originaloffset.')
        spanIds.add(block.id); end = block.end
        if (block.result === 'local-blank' && page.text.slice(block.start, block.end).trim()) fail('Bare blanktekst kan avsluttes lokalt i rapportmanifestet.')
        if (block.result === 'local-explicit' && ![...value.propertyIdentity.map(item => item.source), ...value.sections.flatMap(item => item.basis), ...value.economy.ownershipSources, ...value.economy.fields.flatMap(field => field.sources), ...value.technical.findings.flatMap(finding => finding.sources)].some(source => source.pdfPage === block.pdfPage && source.start <= block.start && source.end >= block.end)) fail('Lokalt behandlet blokk krever eksplisitt felt- eller funnkilde.')
        if (block.result === 'semantic' && !block.sent) fail('Semantisk blokk må være sendt og validert.')
      }
      if (!blocks.length || end !== page.text.length) fail('Manifestet må bevare hele originalteksten.')
    }
    if (manifest.blocks.some(block => block.pdfPage > value.pageCount) || manifest.candidates.some(candidate => candidate.pdfPage > value.pageCount || candidate.end <= candidate.start || candidate.end > value.pages[candidate.pdfPage - 1]!.text.length)) fail('Manifestkilde ligger utenfor dokumentet.')
    if (new Set(manifest.candidates.map(candidate => candidate.id)).size !== manifest.candidates.length) fail('Duplisert TG-kandidat.')
    for (const candidate of manifest.candidates) {
      if (candidate.evidence.some(source => !sourceValid(source))) fail('Kandidatbelegg må være ordrett originalkilde.')
      const finding = value.technical.findings.find(item => item.findingId === candidate.findingId)
      if (['finding', 'duplicate'].includes(candidate.disposition) && (!finding || finding.grade !== candidate.grade || !candidate.evidence.some(source => source.pdfPage === candidate.pdfPage && source.start <= candidate.start && source.end >= candidate.end))) fail('TG-disposisjon mangler samsvarende funn og belegg.')
      if (candidate.disposition === 'not-finding' && (!candidate.reason || !candidate.evidence.length)) fail('Avvist TG-kandidat krever kildebelegg.')
    }
    if (value.coverage.technical.status === 'complete' && (manifest.residual.length || manifest.candidates.some(candidate => ['unresolved', 'not-finding'].includes(candidate.disposition))
      || manifest.blocks.some(block => value.sections.some(section => block.pdfPage >= section.startPage && block.pdfPage <= section.endPage) && block.result === 'unresolved'))) fail('Ubehandlet tekst eller TG-kandidat sperrer bekreftelse.')
  }
  const section = value.sections[0]
  const complete = value.coverage.technical.status === 'complete'
  if (complete && (value.sections.length !== 1 || section?.certainty !== 'certain' || value.technical.uncertainties.length > 0
    || value.pages.some(page => page.pdfPage >= section.startPage && page.pdfPage <= section.endPage && (!['readable', 'blank'].includes(page.status) || page.rasterUnprocessed))
    || value.technical.findings.some(finding => finding.source.pdfPage < section.startPage || finding.source.pdfPage > section.endPage || !finding.sources.some(source => source.pdfPage >= section.startPage && source.pdfPage <= section.endPage))
    || value.coverage.technical.unprocessedAttachments.length > 0)) fail('Ufullstendig eller uklart rapportgrunnlag kan ikke være komplett.')
  if ((value.technical.status === 'complete') !== complete) fail('Teknisk terminalstatus og dekning må samsvare.')
})
export const ImportHttpResponseSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('document-import'), correlation: AnalysisHttpCorrelationSchema, outcome: DocumentImportSchema }),
  z.strictObject({ kind: z.literal('rejected'), code: z.enum(['invalid-request', 'payload-too-large', 'unsupported-media-type', 'analysis-active', 'duplicate-analysis', 'processing-failure', 'processing-timeout', 'page-limit', 'invalid-format', 'text-limit', 'response-limit', 'memory-limit', 'live-disabled', 'unsupported-synthetic']) }),
])
export type DocumentImport = z.infer<typeof DocumentImportSchema>
export type EconomyField = z.infer<typeof EconomyFieldSchema>
export type ImportSection = z.infer<typeof ImportSectionSchema>
export type ImportRole = z.infer<typeof ImportRoleSchema>

/** Versjonsuavhengig kontrollform, aldri sendt gjennom legacy 2/1-parseren. */
export type ImportControlOutcome = (Omit<Extract<AnalysisOutcome, { status: 'completed' }>, 'contractVersion' | 'extractionVersion'> | Omit<Extract<AnalysisOutcome, { status: 'failed' }>, 'contractVersion' | 'extractionVersion'>) & { contractVersion: typeof IMPORT_VERSION; extractionVersion: typeof IMPORT_EXTRACTION_VERSION }
export type ControlAnalysisOutcome = AnalysisOutcome | ImportControlOutcome
export type ImportControlGate = { hash: string; requestId: string; revision: number; coverageComplete: boolean; identityChecked: boolean; areaChecked: boolean; identityConflict: boolean }

export type ImportManifest = z.infer<typeof ImportManifestSchema>
export type ImportCost = z.infer<typeof ImportCostSchema>

/** Same-hash reuse requires the exact current adapter context, not just the file hash. */
export function currentImportContext(context: DocumentImport | null | undefined, role: ImportRole): boolean {
  return Boolean(context && context.contractVersion === IMPORT_VERSION && context.extractionVersion === IMPORT_EXTRACTION_VERSION && context.mode === 'demo' && context.role === role
    && (context.promptVersion === IMPORT_PROMPT_VERSION && context.model === IMPORT_MODEL || context.promptVersion === CODE_FIRST_PROMPT_VERSION && context.model === CODE_FIRST_MODEL && context.manifest?.version === CODE_FIRST_PLAN_VERSION && context.cost?.requestDigest === context.inputDigest))
}
