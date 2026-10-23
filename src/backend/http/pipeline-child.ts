import { createHash } from 'node:crypto'
import { AnalysisContextSchema, CONTRACT_VERSION, EXTRACTION_VERSION } from '../../contracts/document-analysis.ts'
import type { AnalysisContext } from '../../contracts/document-analysis.ts'
import { createFailedAnalysis, getDocumentBasisError } from '../../contracts/analysis-validation.ts'
import { validatePdf } from '../documents/validate-pdf.ts'
import { extractPdf } from '../documents/extract-pdf.ts'
import { analyzeDocument } from '../analysis/analyze-document.ts'
import { createDemoAdapter } from '../analysis/demo-adapter.ts'
import { createAnalysisBackend } from '../analysis/backend-config.ts'
import { createLiveAdapter } from '../analysis/live-adapter.ts'
import type { AnalysisAdapter } from '../analysis/adapter.ts'

type Start = { kind: 'start'; mode: 'demo' | 'live'; bytes: Uint8Array; documentName: string; requestId: string; adapterModule?: string; documentModule?: string; transportModule?: string }
function send(value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!process.send) { reject(new Error('IPC unavailable')); return }
    process.send(value, error => error ? reject(error) : resolve())
  })
}
function permit(): Promise<void> {
  return new Promise((resolve, reject) => {
    const disconnect = () => { process.off('message', message); reject(new Error('IPC unavailable')) }
    const message = (value: unknown) => {
      if (typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'permit-adapter') {
        process.off('disconnect', disconnect)
        process.off('message', message)
        resolve()
      }
    }
    process.once('disconnect', disconnect)
    process.on('message', message)
  })
}

process.once('message', async (input: Start) => {
  let bytes: Uint8Array | undefined = input.bytes
  // Parent terminates this entire process on all exits, including synchronous hangs.
  // All parser threads, PDF caches, text and adapter copies share this lifetime.
  let context: AnalysisContext | undefined
  try {
    context = AnalysisContextSchema.parse({
      contractVersion: CONTRACT_VERSION, extractionVersion: EXTRACTION_VERSION,
      requestId: input.requestId, reportHash: createHash('sha256').update(bytes).digest('hex'),
      documentName: input.documentName, mode: input.mode, pageCount: null,
    })
    await send({ kind: 'context', context })
    if (!Buffer.from(bytes.subarray(0, 1024)).includes('%PDF-')) {
      await send({ kind: 'outcome', outcome: createFailedAnalysis(context, {
        kind: 'document', code: 'invalid-format', target: { kind: 'document' },
        reason: 'Filen kunne ikke åpnes som PDF. Velg en PDF-tilstandsrapport.',
      }) })
      return
    }
    // Trusted server construction only: controlled local modules exercise the same boundaries.
    const documents = input.documentModule ? await import(input.documentModule) as { validatePdf: typeof validatePdf; extractPdf: typeof extractPdf } : { validatePdf, extractPdf }
    const format = await documents.validatePdf(bytes, input.documentName)
    bytes = undefined
    input.bytes = new Uint8Array()
    context = AnalysisContextSchema.parse({ ...context, pageCount: format.pageCount })
    await send({ kind: 'context', context })
    if (format.status === 'failed') {
      await send({ kind: 'outcome', outcome: createFailedAnalysis(context, format.error) })
      return
    }
    const { document } = await documents.extractPdf(format, { requestId: input.requestId, mode: input.mode })
    // analyzeDocument still owns document gating and final binding.
    const guarded: AnalysisAdapter = {
      mode: input.mode,
      async analyze(basis) {
        const approved = permit()
        await send({ kind: 'adapter-ready', context })
        await approved
        // Construct live configuration only inside analyzeDocument's safe error boundary,
        // after document validation and the durable parent marker.
        const adapter: AnalysisAdapter = input.adapterModule
          ? (await import(input.adapterModule) as { createAdapter: (mode: 'demo' | 'live') => AnalysisAdapter }).createAdapter(input.mode)
          : input.mode === 'demo' ? createDemoAdapter() : createLiveAdapter(await createLiveBackend(input.transportModule), { onRequestStart: startedAt => {
            void send({ kind: 'live-request-started', startedAt }).catch(() => process.exit(1))
          } })
        if (adapter.mode !== basis.mode) throw new Error('Adapter mode mismatch')
        return adapter.analyze(basis)
      },
    }
    // Do not announce an adapter start for a document that fails readability.
    const result = getDocumentBasisError(document)
      ? createFailedAnalysis(context, getDocumentBasisError(document)!)
      : await analyzeDocument(document, guarded)
    await send({ kind: 'outcome', outcome: result })
  } catch {
    if (context) await send({ kind: 'outcome', outcome: createFailedAnalysis(context, {
      kind: 'analysis', code: 'adapter-failure', target: { kind: 'document' },
      reason: 'Den lokale dokumentbehandlingen kunne ikke fullføres.',
    }) }).catch(() => undefined)
    else await send({ kind: 'failed' }).catch(() => undefined)
  } finally {
    bytes = undefined
    input.bytes = new Uint8Array()
  }
})

async function createLiveBackend(transportModule?: string) {
  const transport = transportModule ? await import(transportModule) as { fetch: typeof fetch } : undefined
  const backend = createAnalysisBackend('live', transport ? { fetch: transport.fetch } : {})
  if (backend.mode !== 'live') throw new Error('Live configuration unavailable')
  return backend
}
