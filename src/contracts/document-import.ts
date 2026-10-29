import { z } from 'zod'
import { CheckableFindingSchema, DocumentPageSchema, ReportHashSchema } from './document-analysis.ts'
import { ListingFieldSchema, ListingKeySchema } from './listing.ts'
import type { AnalysisOutcome } from './document-analysis.ts'
import { AnalysisHttpCorrelationSchema } from './analysis-http.ts'

export const IMPORT_VERSION = 'document-import-1' as const
export const IMPORT_EXTRACTION_VERSION = 'bounded-pdf-text-1' as const
export const IMPORT_PROMPT_VERSION = 'economy-tg-1' as const
export const IMPORT_MODEL = 'offline-synthetic-1' as const
export const IMPORT_MAX_PDF_BYTES = 50 * 1024 * 1024
export const IMPORT_MAX_RESPONSE_BYTES = 8 * 1024 * 1024
export const ImportRoleSchema = z.enum(['prospectus', 'report'])
export const ImportContextSchema = z.strictObject({
  contractVersion: z.literal(IMPORT_VERSION), extractionVersion: z.literal(IMPORT_EXTRACTION_VERSION),
  promptVersion: z.literal(IMPORT_PROMPT_VERSION), model: z.literal(IMPORT_MODEL), mode: z.literal('demo'),
  requestId: z.string().min(1).max(100), reportHash: ReportHashSchema, documentName: z.string().min(1).max(255),
  role: ImportRoleSchema, pageCount: z.number().int().min(1).max(200), inputDigest: ReportHashSchema,
})
export const ImportDocumentSchema = z.strictObject({
  hash: ReportHashSchema, name: z.string().min(1).max(255), pageCount: z.number().int().min(1).max(200), role: ImportRoleSchema,
  parentHash: ReportHashSchema.nullable(), attachmentId: z.string().max(1024).nullable(),
})
export const PdfSourceSchema = z.strictObject({
  documentHash: ReportHashSchema, documentName: z.string().min(1).max(255), pdfPage: z.number().int().min(1).max(200),
  quote: z.string().min(1).max(2000), start: z.number().int().nonnegative(), end: z.number().int().positive(),
  method: z.literal('pdf-text'), printedPage: z.string().max(80).nullable(),
}).refine(source => source.end > source.start, 'Kildens tekstområde må være positivt.')
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
export const DocumentImportSchema = ImportContextSchema.extend({
  status: z.literal('imported'), documents: z.array(ImportDocumentSchema).length(1), pages: z.array(ImportPageSchema).min(1).max(200),
  attachments: z.array(z.strictObject({ id: z.string().max(1024), name: z.string().max(1024), isPdf: z.boolean() })).max(40),
  propertyIdentity: z.array(PropertyCandidateSchema).max(20), sections: z.array(ImportSectionSchema).max(10),
  coverage: z.strictObject({ economy: CoverageSchema, technical: CoverageSchema }),
  economy: z.strictObject({ status: z.enum(['complete', 'partial', 'unavailable']), ownership: z.enum(['eierseksjon', 'borettslag', 'unknown']), ownershipSources: z.array(PdfSourceSchema).max(10), fields: z.array(EconomyFieldSchema).max(40) }),
  technical: z.strictObject({ status: z.enum(['complete', 'blocked']), findings: z.array(ImportFindingSchema).max(200), uncertainties: z.array(z.string().min(1)).max(100), limitations: z.array(z.string().min(1)).max(100) }),
}).superRefine((value, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: 'custom', message })
  const document = value.documents[0]!
  if (document.hash !== value.reportHash || document.name !== value.documentName || document.role !== value.role || document.pageCount !== value.pageCount) fail('Dokumentidentitet stemmer ikke.')
  if (value.pages.length !== value.pageCount || value.pages.some((page, index) => page.pdfPage !== index + 1)) fail('Alle fysiske sider kreves i rekkefølge.')
  const sourceValid = (source: PdfSource) => {
    const page = value.pages[source.pdfPage - 1]
    return source.documentHash === value.reportHash && source.documentName === value.documentName && page?.status === 'readable'
      && source.start < page.text.length && source.end <= page.text.length && source.end - source.start === source.quote.length
      && page.text.slice(source.start, source.end) === source.quote
  }
  const sources = [...value.propertyIdentity.map(item => item.source), ...value.sections.flatMap(item => item.basis), ...value.economy.ownershipSources,
    ...value.economy.fields.flatMap(field => [...field.sources, ...field.alternatives.map(item => item.source)]), ...value.technical.findings.flatMap(item => item.sources)]
  if (sources.some(source => !sourceValid(source))) fail('Kildefeil: hash, fysisk side, lesbarhet eller ordrett tekstområde avviker.')
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
export type PdfSource = z.infer<typeof PdfSourceSchema>
export type EconomyField = z.infer<typeof EconomyFieldSchema>
export type ImportSection = z.infer<typeof ImportSectionSchema>
export type ImportRole = z.infer<typeof ImportRoleSchema>

/** Versjonsuavhengig kontrollform, aldri sendt gjennom legacy 2/1-parseren. */
export type ImportControlOutcome = (Omit<Extract<AnalysisOutcome, { status: 'completed' }>, 'contractVersion' | 'extractionVersion'> | Omit<Extract<AnalysisOutcome, { status: 'failed' }>, 'contractVersion' | 'extractionVersion'>) & { contractVersion: typeof IMPORT_VERSION; extractionVersion: typeof IMPORT_EXTRACTION_VERSION }
export type ControlAnalysisOutcome = AnalysisOutcome | ImportControlOutcome
export type ImportControlGate = { hash: string; requestId: string; revision: number; coverageComplete: boolean; identityChecked: boolean; areaChecked: boolean; identityConflict: boolean }
