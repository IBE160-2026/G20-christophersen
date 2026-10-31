import express, { Router } from 'express'
import { createHash, randomUUID } from 'node:crypto'
import { resolve } from 'node:path'
import { z } from 'zod'
import { receivePdf, HttpRejection } from './receive-pdf.ts'
import { runImport, ImportRejection } from './run-import.ts'
import { createProcessingLock } from './processing-lock.ts'
import type { ProcessingLock } from './processing-lock.ts'
import { AnalysisHttpCorrelationSchema } from '../../contracts/analysis-http.ts'
import { DocumentImportSchema } from '../../contracts/document-import.ts'
import type { DocumentImport } from '../../contracts/document-import.ts'
import { createCodeFirstImport } from '../import/semantic-adapter.ts'
import { prepareEconomyTrial } from '../import/economy-trial.ts'
import type { EconomyTrial } from '../import/economy-trial.ts'
import { prepareUploadedEconomyCall, runLocalEconomyCall, LOCAL_ECONOMY_LIMITS } from '../import/economy-local-budget.ts'
import type { LocalEconomyCall } from '../import/economy-local-budget.ts'
import { AnalysisBudgetStore } from '../import/analysis-budget-store.ts'
import { GLOBAL_STANDARD_PRICE } from '../import/budget.ts'
import { saveUploadedEconomy } from '../import/uploaded-economy-cache.ts'
import { mergeUploadedEconomy } from '../import/merge-uploaded-economy.ts'
import { existsSync } from 'node:fs'

const consentSchema = z.strictObject({ planId: z.string().uuid(), documentHash: z.string().regex(/^[a-f0-9]{64}$/), requestDigest: z.string().regex(/^[a-f0-9]{64}$/), approveCost: z.literal(true), approveTransfer: z.literal(true) })
const labels = /prisantydning|totalpris|omkostning|dokumentavgift|fellesgjeld|felleskostnad|eiendomsskatt|kommunale avgift/giu
/** Velger økonomisider etter eksplisitte feltord. Ingen rapportdekning eller
 * fravær av opplysninger utledes av at en side ikke er valgt. */
export function selectEconomyPages(pages: DocumentImport['pages']) {
  const relevant = pages.filter(page => page.status === 'readable' && [...page.text.matchAll(labels)].length > 0)
    .map(page => ({ page: page.pdfPage, score: new Set([...page.text.matchAll(labels)].map(match => match[0].toLowerCase())).size }))
    .sort((a, b) => b.score - a.score || a.page - b.page)
  return { rankedPages: relevant.map(item => item.page), selectedPages: relevant.slice(0, LOCAL_ECONOMY_LIMITS.maximumSelectedPages).map(item => item.page).sort((a, b) => a - b),
    omittedRelevantPages: relevant.slice(LOCAL_ECONOMY_LIMITS.maximumSelectedPages).map(item => item.page).sort((a, b) => a - b) }
}
function safeRunError(error: unknown) {
  const code = error instanceof Error ? error.message : ''
  return /^(?:local-economy|budget-history|analysis-budget|document-already|invalid-history|pending-history|economy)-[a-z-]+$/.test(code) ? code : 'economy-analysis-failed'
}
type Stored = { call: LocalEconomyCall; packet: EconomyTrial; outcome: DocumentImport; expires: number; sessionId: string }
type Options = { prepareDeadlineMs?: number; lock?: ProcessingLock; cacheDirectory?: string; budgetDirectory?: string; credentials?: () => { apiKey: string; fetch: typeof globalThis.fetch } | null }
export function createEconomyRouter(options: Options = {}) {
  const router = Router(), lock = options.lock ?? createProcessingLock(), plans = new Map<string, Stored>()
  let stopping = false
  const controllers = new Set<AbortController>(), pending = new Set<Promise<void>>()
  const track = () => {
    let finish!: () => void
    const completion = new Promise<void>(resolve => { finish = resolve }); pending.add(completion)
    return () => { pending.delete(completion); finish() }
  }
  const credentials = options.credentials ?? (() => process.env.OPENAI_API_KEY ? { apiKey: process.env.OPENAI_API_KEY, fetch: globalThis.fetch } : null)
  router.post('/document-economy/prepare', async (request, response) => {
    response.setHeader('Cache-Control', 'no-store')
    const rawGeneration = request.get('X-Analysis-Generation')
    const correlation = AnalysisHttpCorrelationSchema.safeParse({ sessionId: request.get('X-Session-Id'), requestId: request.get('X-Request-Id'), generation: rawGeneration && /^\d+$/.test(rawGeneration) ? Number(rawGeneration) : undefined })
    if (!correlation.success) { request.resume(); response.status(400).json({ error: 'invalid-request' }); return }
    if (stopping || !lock.acquire()) { request.resume(); response.status(409).json({ error: 'analysis-active' }); return }
    const finished = track()
    const controller = new AbortController(); controllers.add(controller)
    const abortUpload = () => { if (!request.complete && !request.destroyed) request.destroy() }
    controller.signal.addEventListener('abort', abortUpload, { once: true })
    const timer = setTimeout(() => {
      controller.abort()
      if (!response.destroyed && !response.writableEnded) response.status(504).json({ error: 'processing-timeout' })
      if (!request.complete && !request.destroyed) request.destroy()
    }, options.prepareDeadlineMs ?? 60_000)
    const abort = () => controller.abort()
    request.once('aborted', abort)
    let bytes: Buffer | undefined
    try {
      for (const [id, stored] of plans) if (stored.expires < Date.now()) plans.delete(id)
      const upload = await receivePdf(request); bytes = upload.bytes
      if (controller.signal.aborted) throw new Error('processing-timeout')
      const documentHash = createHash('sha256').update(bytes).digest('hex')
      // En ny gratis pakke erstatter bare samme dokument i samme økt.
      for (const [id, stored] of plans) if (stored.sessionId === correlation.data.sessionId && stored.packet.originalSha256 === documentHash) plans.delete(id)
      // Kun ubrukte gratis pakker kan kastes. Ingen kvote eller forbrukshistorikk endres.
      if (plans.size >= 3) plans.delete(plans.keys().next().value!)
      const imported = await runImport({ ...upload, bytes: Buffer.from(bytes), ...correlation.data, role: 'prospectus', parentHash: null, attachmentId: null }, controller.signal, new Set())
      const basis = { hash: imported.reportHash, name: imported.documentName, requestId: imported.requestId, role: 'prospectus' as const, parentHash: null, attachmentId: null, pages: imported.pages, attachments: imported.attachments }
      const outcome = await createCodeFirstImport(basis)
      const ranked = selectEconomyPages(outcome.pages)
      const selection = { selectedPages: [] as number[], omittedRelevantPages: [] as number[] }, blockers: string[] = []
      let call: LocalEconomyCall | undefined, packet: EconomyTrial | undefined
      const candidates = ranked.rankedPages
      let lastBlocker = 'economy-relevant-text-not-found'
      // Hele fysiske sider prøves lokalt. Utelatte sider vises i samtykket;
      // de merkes aldri behandlet og blir ikke sendt i skjulte tilleggskall.
      for (const pdfPage of candidates) {
        if (selection.selectedPages.length >= LOCAL_ECONOMY_LIMITS.maximumSelectedPages) { selection.omittedRelevantPages.push(pdfPage); continue }
        const proposed = [...selection.selectedPages, pdfPage].sort((a, b) => a - b)
        try {
          const nextPacket = prepareEconomyTrial(bytes, basis, proposed)
          const nextCall = await prepareUploadedEconomyCall(nextPacket, bytes)
          packet = nextPacket; call = nextCall; selection.selectedPages = proposed
        } catch (error) { lastBlocker = error instanceof Error ? error.message : 'economy-preparation-failed'; selection.omittedRelevantPages.push(pdfPage) }
      }
      if (!call) blockers.push(lastBlocker)
      selection.omittedRelevantPages.sort((a, b) => a - b)
      if (controller.signal.aborted) throw new Error('processing-timeout')
      const planId = randomUUID()
      if (call && packet) plans.set(planId, { call, packet, outcome, expires: Date.now() + 15 * 60_000, sessionId: correlation.data.sessionId })
      if (response.destroyed || response.writableEnded) return
      response.json({ planId, documentHash: outcome.reportHash, documentName: outcome.documentName, requestDigest: call?.requestDigest ?? null,
        ...selection, excerpts: selection.selectedPages.map(pdfPage => ({ pdfPage, text: outcome.pages[pdfPage - 1]!.text })),
        reservedUsd: LOCAL_ECONOMY_LIMITS.reservationUsd, analysisCapUsd: LOCAL_ECONOMY_LIMITS.analysisCapUsd,
        budget: call?.budget ?? null, blockers, readyForApproval: blockers.length === 0,
        technicalCoverage: 'unresolved', expiresInSeconds: 900 })
    } catch (error) {
      const known = error instanceof HttpRejection || error instanceof ImportRejection
      if (!response.destroyed && !response.writableEnded) response.status(known ? error.status : 422).json({ error: known ? error.code : error instanceof Error ? error.message : 'economy-preparation-failed' })
    } finally {
      bytes = undefined; clearTimeout(timer); request.off('aborted', abort)
      if (!request.complete && !request.closed) {
        const closed = new Promise<void>(resolve => request.once('close', resolve))
        if (!request.destroyed) request.destroy()
        await closed
      }
      controller.signal.removeEventListener('abort', abortUpload); controllers.delete(controller); lock.release(); finished()
    }
  })
  router.post('/document-economy/run', express.json({ limit: '4kb' }), async (request, response) => {
    response.setHeader('Cache-Control', 'no-store')
    const consent = consentSchema.safeParse(request.body)
    if (!consent.success) { response.status(400).json({ error: 'economy-explicit-consent-required' }); return }
    const stored = plans.get(consent.data.planId)
    if (!stored || stored.expires < Date.now() || consent.data.documentHash !== stored.packet.originalSha256 || consent.data.requestDigest !== stored.call.requestDigest) { response.status(409).json({ error: 'economy-plan-mismatch-or-expired' }); return }
    if (stopping || !lock.acquire()) { response.status(409).json({ error: 'analysis-active' }); return }
    const finished = track()
    let ledger: AnalysisBudgetStore | undefined
    try {
      const auth = credentials()
      if (!auth?.apiKey) { response.status(503).json({ error: 'economy-api-key-unavailable' }); return }
      // Pakken brukes bare én gang, også ved ukjent transportutfall.
      plans.delete(consent.data.planId)
      const directory = options.budgetDirectory ?? resolve('private/analysis-budgets')
      // Kun uttrykkelig godkjent ny analyse får opprette tom historikk.
      if (!existsSync(directory)) AnalysisBudgetStore.initialize(directory, stored.packet.originalSha256)
      else {
        try { ledger = AnalysisBudgetStore.open(directory, stored.packet.originalSha256) }
        catch {
          // initialize er eksklusiv og kan aldri overskrive historikk eller lås.
          AnalysisBudgetStore.initialize(directory, stored.packet.originalSha256)
        }
      }
      ledger ??= AnalysisBudgetStore.open(directory, stored.packet.originalSha256)
      const executed = await runLocalEconomyCall(stored.call, { requestDigest: stored.call.requestDigest, referenceDigest: stored.call.referenceDigest, maximumAnalysisUsd: '0.20' }, ledger, auth)
      const result = executed.result
      const fields = mergeUploadedEconomy(stored.outcome.economy.fields, result.fields)
      const observations = [...result.observations, ...result.deterministicEvidence.excerpts.map(item => ({ kind: item.kind, raw: item.raw, sources: [item.source] }))]
      const entry = ledger.snapshot().find(item => item.requestDigest === stored.call.requestDigest)!
      const outcome = DocumentImportSchema.parse({ ...stored.outcome, inputDigest: stored.call.requestDigest, economy: { ...stored.outcome.economy,
        status: fields.some(field => field.amount !== null) ? 'partial' : 'unavailable', fields,
        analysis: { provenance: 'live-document', reason: 'Ny KI-analyse av godkjente økonomiutdrag fra dette dokumentet. Verdier og kilder er kontrollert med kode; menneskelig kildekontroll og fullstendig dekning gjenstår.', requestDigest: stored.call.requestDigest, selectedPages: stored.packet.selectedPages, observations, limitations: result.limitations } },
        cost: { ...stored.outcome.cost, requestDigest: stored.call.requestDigest, tokenizer: 'conservative-local-byte-budget', priceVersion: GLOBAL_STANDARD_PRICE.version, inputTokens: null, outputTokens: LOCAL_ECONOMY_LIMITS.maximumOutputTokensIncludingReasoning, estimatedUsd: stored.call.budget.calculatedMaximumUsd,
          reservedUsd: entry.reservedUsd, actualUsd: entry.actualUsd, remainingUsd: ledger.remaining(), usageCostBasis: 'provider-usage-upper-bound', status: 'completed', reason: null },
        coverage: { ...stored.outcome.coverage, economy: { ...stored.outcome.coverage.economy, status: 'incomplete', omittedPages: stored.outcome.pages.filter(page => !stored.packet.selectedPages.includes(page.pdfPage)).map(page => page.pdfPage), reasons: ['KI har bare tolket de godkjente økonomisidene. Ingen teknisk analyse, full drift eller semantisk fullstendighet er bekreftet.'] } } })
      try { await saveUploadedEconomy(stored.packet, executed.referencedOutput, outcome, options.cacheDirectory ?? (options.budgetDirectory ? resolve(options.budgetDirectory, 'results') : undefined)) }
      catch { outcome.economy.analysis!.reason += ' Lokal lagring mislyktes. Behold denne økten; resultatet kan ikke gjenopprettes etter reload, og et nytt betalt kall er sperret.' }
      response.json({ outcome })
    } catch (error) { response.status(422).json({ error: safeRunError(error), retryAllowed: false }) }
    finally { ledger?.close(); lock.release(); finished() }
  })
  return Object.assign(router, { async stop() { stopping = true; plans.clear(); for (const controller of controllers) controller.abort(); await Promise.allSettled([...pending]) } })
}
