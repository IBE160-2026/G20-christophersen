import { z } from 'zod'

export const CONTRACT_VERSION = '1' as const
export const EXTRACTION_VERSION = '1' as const
const TextSchema = z.string().trim().min(1)
const OriginalTextSchema = z.string().refine(value => value.trim().length > 0, 'Ikke-tom originaltekst kreves.')
const PositionSchema = z.number().int().positive()
export const ReportHashSchema = z.string().regex(/^[a-f0-9]{64}$/)
export const AnalysisModeSchema = z.enum(['demo', 'live'])

// Kodekontekst fra mottatt rapport. Hashberegning og HTTP-korrelasjon kobles senere.
export const AnalysisContextSchema = z.strictObject({
  contractVersion: z.literal(CONTRACT_VERSION),
  extractionVersion: z.literal(EXTRACTION_VERSION),
  requestId: TextSchema,
  reportHash: ReportHashSchema,
  documentName: TextSchema,
  mode: AnalysisModeSchema,
  pageCount: PositionSchema.nullable(),
})

export const DocumentPageSchema = z.strictObject({
  pdfPage: PositionSchema,
  text: z.string(),
  status: z.enum(['readable', 'unreadable', 'incomplete', 'unknown']),
  // Null betyr at årsaken er ukjent, aldri en gjettet forklaring.
  reason: TextSchema.nullable(),
})

export const DocumentBasisSchema = AnalysisContextSchema.extend({
  pageCount: PositionSchema.max(30),
  pages: z.array(DocumentPageSchema),
}).superRefine((basis, ctx) => {
  if (basis.pages.length !== basis.pageCount
    || basis.pages.some((page, index) => page.pdfPage !== index + 1)) {
    ctx.addIssue({ code: 'custom', path: ['pages'], message: 'Én ordnet post per PDF-posisjon kreves.' })
  }
})

// Adapterens originale opplysninger beholdes, også ugyldig side/grad/kilde.
// Tallstrenger godtas som opphav, men konverteres aldri til gjettet PDF-side.
export const OriginalCandidateSchema = z.strictObject({
  findingId: OriginalTextSchema,
  description: OriginalTextSchema,
  grade: z.string().nullable().optional(),
  source: z.strictObject({
    documentName: z.string().nullable().optional(),
    reportHash: z.string().nullable().optional(),
    pdfPage: z.union([z.number(), z.string(), z.null()]).optional(),
  }).readonly().nullable().optional(),
  uncertainties: z.array(OriginalTextSchema).readonly(),
  confidence: z.number().min(0).max(100).optional(),
}).readonly()

export const CandidateIssueCodeSchema = z.enum([
  'unclear-grade', 'missing-source', 'document-mismatch', 'hash-mismatch',
  'invalid-page', 'reported-uncertainty',
])
export const CandidateIssueSchema = z.strictObject({
  code: CandidateIssueCodeSchema,
  reason: TextSchema,
})

export const CheckableFindingSchema = z.strictObject({
  kind: z.literal('checkable'),
  findingId: OriginalTextSchema,
  grade: z.enum(['TG2', 'TG3']),
  description: OriginalTextSchema,
  source: z.strictObject({
    documentName: TextSchema,
    reportHash: ReportHashSchema,
    pdfPage: PositionSchema,
  }),
  original: OriginalCandidateSchema,
})
export const UncertainCandidateSchema = z.strictObject({
  kind: z.literal('uncertain'),
  findingId: OriginalTextSchema,
  original: OriginalCandidateSchema,
  issues: z.array(CandidateIssueSchema).min(1),
})
const ExtractionShape = {
  findings: z.array(CheckableFindingSchema),
  uncertainCandidates: z.array(UncertainCandidateSchema),
  limitations: z.array(TextSchema),
}
export const PartialExtractionSchema = z.strictObject({
  completeness: z.literal('incomplete'),
  ...ExtractionShape,
})

export const ErrorTargetSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('document') }),
  z.strictObject({ kind: z.literal('page'), pdfPage: PositionSchema }),
  z.strictObject({ kind: z.literal('finding'), findingId: TextSchema }),
])
export const DocumentErrorCodeSchema = z.enum([
  'invalid-format', 'invalid-container', 'page-limit', 'unreadable-text',
  'incomplete-text', 'unknown-readability',
])
export const AnalysisErrorCodeSchema = z.enum([
  'invalid-response', 'incompatible-version', 'interrupted', 'timeout',
  'transport-failure', 'adapter-failure', 'metadata-mismatch',
])
export const AnalysisErrorSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('document'), code: DocumentErrorCodeSchema,
    target: ErrorTargetSchema.nullable(), reason: TextSchema.nullable() }),
  z.strictObject({ kind: z.literal('analysis'), code: AnalysisErrorCodeSchema,
    target: ErrorTargetSchema.nullable(), reason: TextSchema.nullable() }),
])

const CompletedSchema = AnalysisContextSchema.extend({
  status: z.literal('completed'),
  pageCount: PositionSchema.max(30),
  validationScope: z.literal('structure-and-source'),
  ...ExtractionShape,
})
const FailedSchema = AnalysisContextSchema.extend({
  status: z.literal('failed'),
  error: AnalysisErrorSchema,
  partialResult: PartialExtractionSchema.nullable(),
})

export type AnalysisContext = z.infer<typeof AnalysisContextSchema>
export type DocumentBasis = z.infer<typeof DocumentBasisSchema>
export type OriginalCandidate = z.infer<typeof OriginalCandidateSchema>
export type CandidateIssue = z.infer<typeof CandidateIssueSchema>
export type CheckableFinding = z.infer<typeof CheckableFindingSchema>
export type UncertainCandidate = z.infer<typeof UncertainCandidateSchema>
export type PartialExtraction = z.infer<typeof PartialExtractionSchema>
export type AnalysisError = z.infer<typeof AnalysisErrorSchema>

// Én kildekontroll brukes både når resultat bindes og når ferdig svar leses.
export function getCandidateIssues(original: OriginalCandidate, context: AnalysisContext): CandidateIssue[] {
  const issues: CandidateIssue[] = []
  if (original.grade !== 'TG2' && original.grade !== 'TG3') {
    issues.push({ code: 'unclear-grade', reason: 'Eksplisitt TG2 eller TG3 mangler eller er uklar.' })
  }
  if (!original.source?.documentName?.trim()) {
    issues.push({ code: 'missing-source', reason: 'Dokumentkilde mangler.' })
  } else if (original.source.documentName !== context.documentName) {
    issues.push({ code: 'document-mismatch', reason: 'Oppgitt dokument samsvarer ikke med mottatt rapport.' })
  }
  if (original.source?.reportHash != null && original.source.reportHash !== context.reportHash) {
    issues.push({ code: 'hash-mismatch', reason: 'Oppgitt rapporthash samsvarer ikke med mottatt rapport.' })
  }
  const page = original.source?.pdfPage
  if (typeof page !== 'number' || !Number.isInteger(page) || page < 1
    || context.pageCount === null || page > context.pageCount) {
    issues.push({ code: 'invalid-page', reason: 'Kontrollerbar PDF-posisjon innen rapportens sideantall mangler.' })
  }
  if (original.uncertainties.length > 0) {
    issues.push({ code: 'reported-uncertainty', reason: 'Adapteren oppga usikkerhet; se det originale uttrekket.' })
  }
  return issues
}

export const AnalysisOutcomeSchema = z.discriminatedUnion('status', [CompletedSchema, FailedSchema])
  .superRefine((outcome, ctx) => {
    if (outcome.status === 'failed' && outcome.error.target?.kind === 'page'
      && outcome.pageCount !== null && outcome.error.target.pdfPage > outcome.pageCount) {
      ctx.addIssue({ code: 'custom', message: 'Feilmålet ligger utenfor kjent rapport.' })
    }
    const extraction = outcome.status === 'completed' ? outcome : outcome.partialResult
    if (extraction === null) return
    const ids = new Set<string>()
    for (const finding of extraction.findings) {
      const original = finding.original
      if (getCandidateIssues(original, outcome).length > 0
        || finding.findingId !== original.findingId || finding.grade !== original.grade
        || finding.description !== original.description
        || finding.source.pdfPage !== original.source?.pdfPage
        || finding.source.documentName !== outcome.documentName
        || finding.source.reportHash !== outcome.reportHash) {
        ctx.addIssue({ code: 'custom', message: 'Funnet har ikke samsvarende kontrollerbar originalkilde.' })
      }
    }
    for (const candidate of extraction.uncertainCandidates) {
      const expected = getCandidateIssues(candidate.original, outcome)
      if (candidate.findingId !== candidate.original.findingId || expected.length === 0
        || JSON.stringify(candidate.issues) !== JSON.stringify(expected)) {
        ctx.addIssue({ code: 'custom', message: 'Usikker kandidat må bevare original og konkrete kjente mangler.' })
      }
    }
    for (const item of [...extraction.findings, ...extraction.uncertainCandidates]) {
      if (ids.has(item.findingId)) ctx.addIssue({ code: 'custom', message: 'Duplisert findingId.' })
      ids.add(item.findingId)
    }
  })
export type AnalysisOutcome = z.infer<typeof AnalysisOutcomeSchema>

// Samme versjons-/terminalbetydning, ingen konkurrerende leverandør-DTO.
// Ekstra toppmetadata ignoreres; identitet settes utelukkende fra kodekontekst.
const AdapterExtractionShape = {
  findings: z.array(OriginalCandidateSchema),
  limitations: z.array(TextSchema),
}
export const AdapterOutcomeSchema = z.discriminatedUnion('status', [
  z.object({ contractVersion: z.literal(CONTRACT_VERSION), extractionVersion: z.literal(EXTRACTION_VERSION),
    status: z.literal('completed'), ...AdapterExtractionShape }),
  z.object({ contractVersion: z.literal(CONTRACT_VERSION), extractionVersion: z.literal(EXTRACTION_VERSION),
    status: z.literal('failed'), code: AnalysisErrorCodeSchema,
    target: ErrorTargetSchema.nullable(),
    partialResult: z.strictObject({ ...AdapterExtractionShape }).nullable() }),
])
export type AdapterOutcome = z.infer<typeof AdapterOutcomeSchema>
