import type { AnalysisAdapter } from '../../src/backend/analysis/adapter.ts'
import { CONTRACT_VERSION, EXTRACTION_VERSION } from '../../src/contracts/document-analysis.ts'

/** Kun kontrolladapter for bygget-app-prøver ved den ordinære adaptergrensen. */
export const createAdapter = (): AnalysisAdapter => ({
  mode: 'demo',
  async analyze(document) {
    const findings = [{ findingId: 'ui-TG3', description: 'Kontrollert lekkasje', grade: 'TG3',
      source: { documentName: document.documentName, reportHash: document.reportHash, pdfPage: 2 }, uncertainties: [] as string[] }]
    const version = { contractVersion: CONTRACT_VERSION, extractionVersion: EXTRACTION_VERSION }
    if (document.documentName === 'empty.pdf') return { ...version, status: 'completed', findings: [], limitations: [] }
    if (document.documentName === 'uncertain.pdf') return { ...version, status: 'completed',
      findings: [...findings, { findingId: 'ui-uncertain', description: 'Usikker vegg', grade: '?', source: null, uncertainties: ['Teksten er uklar'] }], limitations: ['Usikkert uttrekk'] }
    if (document.documentName === 'partial.pdf') return { ...version, status: 'failed', code: 'timeout', target: null, partialResult: { findings, limitations: ['Delresultat'] } }
    if (document.documentName === 'slow.pdf') await new Promise(resolve => setTimeout(resolve, 750))
    return { ...version, status: 'completed', findings, limitations: [] }
  },
})
