import {
  AdapterOutcomeSchema, AnalysisContextSchema, AnalysisOutcomeSchema, DocumentBasisSchema,
  getCandidateIssues,
} from './document-analysis.ts'
import type {
  AnalysisContext, AnalysisError, AnalysisOutcome, CheckableFinding, OriginalCandidate,
  UncertainCandidate,
} from './document-analysis.ts'

function classify(candidates: OriginalCandidate[], context: AnalysisContext) {
  const findings: CheckableFinding[] = []
  const uncertainCandidates: UncertainCandidate[] = []
  for (const original of candidates) {
    const issues = getCandidateIssues(original, context)
    if (issues.length > 0) {
      uncertainCandidates.push({ kind: 'uncertain', findingId: original.findingId, original, issues })
    } else if ((original.grade === 'TG2' || original.grade === 'TG3')
      && typeof original.source?.pdfPage === 'number') {
      findings.push({
        kind: 'checkable', findingId: original.findingId,
        grade: original.grade, description: original.description,
        source: { documentName: context.documentName, reportHash: context.reportHash,
          pdfPage: original.source.pdfPage },
        original,
      })
    }
  }
  return { findings, uncertainCandidates }
}

export function createFailedAnalysis(contextInput: unknown, errorInput: AnalysisError): AnalysisOutcome {
  const context = AnalysisContextSchema.parse(contextInput)
  return AnalysisOutcomeSchema.parse({ ...context, status: 'failed', error: errorInput, partialResult: null })
}

// Ren grensefunksjon. Ingen adapterkall, bytehash, PDF-lesing eller klienttilstand.
export function bindAnalysisOutcome(documentInput: unknown, adapterInput: unknown): AnalysisOutcome {
  const document = DocumentBasisSchema.parse(documentInput)
  const context = AnalysisContextSchema.parse({
    contractVersion: document.contractVersion, extractionVersion: document.extractionVersion,
    requestId: document.requestId, reportHash: document.reportHash, documentName: document.documentName,
    mode: document.mode, pageCount: document.pageCount,
  })
  const badPage = document.pages.find(page => page.status !== 'readable')
  if (badPage) {
    const codes = { unreadable: 'unreadable-text', incomplete: 'incomplete-text', unknown: 'unknown-readability' } as const
    return createFailedAnalysis(context, {
      kind: 'document', code: codes[badPage.status as keyof typeof codes],
      target: { kind: 'page', pdfPage: badPage.pdfPage },
      reason: badPage.status === 'unknown' ? null : 'Dokumentgrunnlaget har en side uten pålitelig fullført tekstuttrekk.',
    })
  }
  const parsed = AdapterOutcomeSchema.safeParse(adapterInput)
  if (!parsed.success) {
    return createFailedAnalysis(context, { kind: 'analysis', code: 'invalid-response', target: null,
      reason: 'Adapteren returnerte ikke et gyldig versjonert terminalt analyseutfall.' })
  }
  const adapter = parsed.data
  const result = adapter.status === 'completed' ? adapter : adapter.partialResult
  const extraction = result === null ? null : { ...classify(result.findings, context), limitations: result.limitations }
  const outcome = adapter.status === 'completed'
    ? { ...context, status: 'completed', validationScope: 'structure-and-source', ...extraction }
    : { ...context, status: 'failed', error: { kind: 'analysis', code: adapter.code, target: adapter.target,
      reason: 'Analysen ble ikke fullført.' },
      partialResult: extraction === null ? null : { completeness: 'incomplete', ...extraction } }
  const validated = AnalysisOutcomeSchema.safeParse(outcome)
  return validated.success ? validated.data : createFailedAnalysis(context, {
    kind: 'analysis', code: 'invalid-response', target: null,
    reason: 'Adapteruttrekket har motstridende identitet eller kildeopplysninger.',
  })
}

// For begge sider: valider struktur/kildeområde og forventet kodekontekst igjen.
// Aktiv økt/analysegenerasjon og faktisk bytehash kobles i sine senere stories.
export function validateAnalysisOutcome(value: unknown, expectedContext: unknown) {
  const expected = AnalysisContextSchema.parse(expectedContext)
  return AnalysisOutcomeSchema.refine(outcome =>
    (Object.keys(expected) as (keyof AnalysisContext)[]).every(key => outcome[key] === expected[key]),
  { message: 'Analyseutfallet tilhører ikke forventet dokument-/request-/moduskontekst.' }).safeParse(value)
}
