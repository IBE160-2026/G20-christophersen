import { parentPort, workerData } from 'node:worker_threads'
import { z } from 'zod'
import { AdapterOutcomeSchema, DocumentBasisSchema } from '../../contracts/document-analysis.ts'
import { bindAnalysisOutcome } from '../../contracts/analysis-validation.ts'

// This stricter provider format requires explicit nulls; it never coerces source data.
const Source = z.strictObject({ documentName: z.string().nullable(), reportHash: z.string().nullable(),
  pdfPage: z.union([z.number(), z.string(), z.null()]) }).nullable()
const Extraction = z.strictObject({ findings: z.array(z.strictObject({ findingId: z.string(), description: z.string(),
  grade: z.string().nullable(), source: Source, uncertainties: z.array(z.string()) })), limitations: z.array(z.string()) })

try {
  const document = DocumentBasisSchema.parse(workerData.document)
  const response = JSON.parse(Buffer.concat(workerData.chunks).toString('utf8'))
  if (response.status !== 'completed' || response.error != null || response.incomplete_details != null
    || !Array.isArray(response.output) || response.output.length === 0) throw new Error()
  const texts: string[] = []
  for (const item of response.output) {
    if (item.type === 'reasoning') {
      if (item.status != null && item.status !== 'completed') throw new Error()
      continue
    }
    if (item.type !== 'message' || item.status !== 'completed' || item.role !== 'assistant'
      || !Array.isArray(item.content) || item.content.length === 0) throw new Error()
    for (const content of item.content) {
      if (content.type !== 'output_text' || typeof content.text !== 'string') throw new Error()
      texts.push(content.text)
    }
  }
  if (texts.length !== 1) throw new Error()
  const extraction = Extraction.parse(JSON.parse(texts[0]!))
  const outcome = AdapterOutcomeSchema.parse({ contractVersion: '2', extractionVersion: '1', status: 'completed', ...extraction })
  if (bindAnalysisOutcome(document, outcome).status !== 'completed') throw new Error()
  parentPort?.postMessage({ kind: 'validated', outcome })
} catch {
  parentPort?.postMessage({ kind: 'invalid' })
}
