import { AnalysisContextSchema, DocumentBasisSchema } from '../../contracts/document-analysis.ts'
import type { AnalysisOutcome, DocumentBasis } from '../../contracts/document-analysis.ts'
import { bindAnalysisOutcome, createFailedAnalysis, getDocumentBasisError } from '../../contracts/analysis-validation.ts'
import { AnalysisAdapterError } from './adapter.ts'
import type { AnalysisAdapter } from './adapter.ts'
import { createDemoAdapter } from './demo-adapter.ts'

/** Sperr før I/O, send alle sider samlet og bind identitet fra kode. */
export async function analyzeDocument(documentInput: DocumentBasis, adapter: AnalysisAdapter = createDemoAdapter()): Promise<AnalysisOutcome> {
  const document = DocumentBasisSchema.parse(documentInput)
  const context = AnalysisContextSchema.parse({
    contractVersion: document.contractVersion, extractionVersion: document.extractionVersion,
    requestId: document.requestId, reportHash: document.reportHash,
    documentName: document.documentName, mode: document.mode, pageCount: document.pageCount,
  })
  const documentError = getDocumentBasisError(document)
  if (documentError) return createFailedAnalysis(context, documentError)
  if (adapter.mode !== document.mode) {
    return createFailedAnalysis(context, {
      kind: 'analysis', code: 'metadata-mismatch', target: { kind: 'document' },
      reason: 'Analyseadapterens modus samsvarer ikke med dokumentgrunnlaget.',
    })
  }
  try {
    // Adapteren får en separat kopi; den kan ikke endre bindekonteksten.
    return bindAnalysisOutcome(document, await adapter.analyze(DocumentBasisSchema.parse(document)))
  } catch (error) {
    return createFailedAnalysis(context, error instanceof AnalysisAdapterError ? error.analysisError : {
      kind: 'analysis', code: 'adapter-failure', target: { kind: 'document' },
      reason: 'Analyseadapteren kunne ikke fullføre behandlingen.',
    })
  }
}
