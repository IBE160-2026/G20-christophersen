import { DocumentImportSchema, CODE_FIRST_MODEL, CODE_FIRST_PROMPT_VERSION, IMPORT_VERSION, IMPORT_EXTRACTION_VERSION, IMPORT_MAX_RESPONSE_BYTES, collectTgCandidates } from '../../contracts/document-import.ts'
import type { DocumentImport, ImportCost, PdfSource } from '../../contracts/document-import.ts'
import { checkCombinedResponse, CombinedBudgetFailure } from './combined-request.ts'
import { createLocalPlan, sourceFor, componentKey } from './local-plan.ts'
import type { ImportBasis, LocalPlan } from './local-plan.ts'
import { AnalysisBudget, costOf, preflightSemantic } from './budget.ts'
import type { SemanticPrice, SemanticTokenizer } from './budget.ts'
import { createSemanticRequest, semanticDigest, SemanticOutputSchema, SEMANTIC_LIMITS, semanticContextBlocks } from './semantic-request.ts'
import { z } from 'zod'
import type { SemanticRequest } from './semantic-request.ts'
import type { SemanticTokenCount } from './token-count.ts'

/** Only an explicitly labelled offline SDK stub can be injected. No production SDK/client is created here. */
export type OfflineSemanticTransport = { purpose: 'offline-stub'; responses: { create(request: SemanticRequest, options: { signal: AbortSignal; timeout: number; maxRetries: 0 }): Promise<unknown> } }
export type SemanticDependencies = { ledger?: AnalysisBudget; tokenizer?: SemanticTokenizer; tokenCount?: SemanticTokenCount; price?: SemanticPrice; transport?: OfflineSemanticTransport; signal?: AbortSignal; deadlineMs?: number }
class SemanticFailure extends Error {
  readonly code: string
  constructor(code: string) { super(code); this.code = code }
}
const sourceKey = (source: PdfSource) => `${source.pdfPage}:${source.start}:${source.end}`
function uniqueSources(sources: PdfSource[]) { return [...new Map(sources.map(source => [sourceKey(source), source])).values()] }
/** Conservative lexical support only. Paraphrases that cannot be checked remain uncertain; this does not prove semantic recall. */
function supportedWords(claim: string, sources: PdfSource[]) {
  const words = (text: string) => text.toLocaleLowerCase('nb').match(/[\p{L}\p{N}]+/gu) ?? []
  const stop = new Set(['og', 'i', 'på', 'ved', 'for', 'av', 'til', 'fra', 'med', 'er', 'det', 'den', 'som', 'et', 'en', 'om', 'dette', 'gjelder'])
  const available = new Set(words(sources.map(source => source.quote).join(' ')))
  const significant = words(claim).filter(word => !stop.has(word))
  return significant.length > 0 && significant.every(word => available.has(word))
}
function validateSemantic(plan: LocalPlan, raw: unknown) {
  const result = SemanticOutputSchema.parse(raw)
  const warnings: string[] = []
  const warn = (code: string) => { if (!warnings.includes(code)) warnings.push(code) }
  const selected = new Map([...plan.selected, ...semanticContextBlocks(plan)].map(block => [block.id, block]))
  const processed = new Set(result.processedBlockIds)
  if (processed.size !== result.processedBlockIds.length || processed.size !== plan.selected.length || [...processed].some(id => !plan.selected.some(block => block.id === id))) throw new SemanticFailure('missing-or-unknown-block')
  const materialize = (ref: { blockId: string; start: number; end: number }): PdfSource => {
    const block = selected.get(ref.blockId)
    if (!block || ref.start < block.start || ref.end > block.end || ref.end <= ref.start) throw new SemanticFailure('invalid-source-offset')
    try { return sourceFor(plan.basis, block.pdfPage, ref.start, ref.end) } catch { throw new SemanticFailure('invalid-source') }
  }
  const findings = structuredClone(plan.findings)
  if (new Set(result.findings.map(item => item.findingId)).size !== result.findings.length) throw new SemanticFailure('duplicate-finding')
  for (const item of result.findings) {
    const existing = findings.find(finding => finding.findingId === item.findingId)
    const sources = uniqueSources([...(existing?.sources ?? []), ...item.sources.map(materialize)])
    if (sources.length > 12) throw new SemanticFailure('finding-source-limit')
    if (!sources.some(source => collectTgCandidates(source.quote).some(candidate => candidate.grade === item.grade))) throw new SemanticFailure('unsupported-grade-source')
    if (existing && (componentKey(existing.component) !== componentKey(item.component) || existing.grade !== item.grade || existing.conditionId !== item.conditionId)) throw new SemanticFailure('unsupported-finding-merge')
    if (!supportedWords(item.component, sources) || !supportedWords(item.description, sources)) throw new SemanticFailure('unsupported-finding-claims')
    const first = sources[0]!, origin = { documentName: plan.basis.name, reportHash: plan.basis.hash, pdfPage: first.pdfPage }
    const finding = { ...item, kind: 'checkable' as const, sources, source: origin, original: { findingId: item.findingId, description: item.description, grade: item.grade, source: origin, uncertainties: [] } }
    if (existing) findings[findings.indexOf(existing)] = finding
    else findings.push(finding)
  }
  const sentCandidates = plan.manifest.candidates.filter(candidate => candidate.disposition === 'unresolved' && plan.selected.some(block => block.pdfPage === candidate.pdfPage && candidate.start < block.end && candidate.end > block.start))
  if (new Set(result.candidates.map(item => item.candidateId)).size !== result.candidates.length || result.candidates.length !== sentCandidates.length || result.candidates.some(item => !sentCandidates.some(candidate => candidate.id === item.candidateId))) throw new SemanticFailure('missing-or-unknown-candidate')
  const mergedIds = new Set<string>()
  const candidates = plan.manifest.candidates.map(candidate => {
    const resolved = result.candidates.find(item => item.candidateId === candidate.id)
    if (!resolved) return candidate
    const evidence = uniqueSources(resolved.sources.map(materialize))
    const coversCandidate = evidence.some(source => source.pdfPage === candidate.pdfPage && source.start <= candidate.start && source.end >= candidate.end)
    const finding = findings.find(item => item.findingId === resolved.findingId)
    if (['finding', 'duplicate'].includes(resolved.disposition)) {
      if (!coversCandidate || !finding || finding.grade !== candidate.grade) throw new SemanticFailure('candidate-finding-mismatch')
      const original = plan.findings.find(item => item.sources.some(source => source.pdfPage === candidate.pdfPage && source.start <= candidate.start && source.end >= candidate.end))
      if (original && original.findingId !== finding.findingId) {
        if (resolved.disposition !== 'duplicate' || !resolved.reason || componentKey(original.component) !== componentKey(finding.component)) throw new SemanticFailure('unsupported-finding-merge')
        mergedIds.add(original.findingId)
      }
      const combined = uniqueSources([...finding.sources, ...evidence, ...(original?.sources ?? [])])
      if (combined.length > 12) throw new SemanticFailure('finding-source-limit')
      finding.sources = combined
    }
    return { ...candidate, disposition: resolved.disposition === 'not-finding' ? 'unresolved' as const : resolved.disposition, findingId: resolved.findingId, evidence, reason: resolved.reason }
  })
  const reconciled = findings.filter(finding => !mergedIds.has(finding.findingId))
  if (candidates.some(candidate => candidate.findingId !== null && mergedIds.has(candidate.findingId))) throw new SemanticFailure('unsupported-finding-merge')
  if (reconciled.length > 200) throw new SemanticFailure('finding-limit')
  if (new Set(reconciled.map(item => item.conditionId)).size !== reconciled.length) throw new SemanticFailure('duplicate-finding')
  if ([...plan.reconciliationIds].some(id => !mergedIds.has(id) && reconciled.some(finding => finding.findingId === id && reconciled.some(other => other.findingId !== id && componentKey(other.component) === componentKey(finding.component) && other.grade === finding.grade && other.description === finding.description)))) warn('Gjentatte lokale funn er ikke avstemt som samme eller kildebelagt ulike forhold.')
  const fields = structuredClone(plan.fields)
  if (new Set(result.economy.map(item => item.fieldId)).size !== result.economy.length) throw new SemanticFailure('duplicate-economy-field')
  for (const proposal of result.economy) {
    const field = fields.find(item => item.id === proposal.fieldId), sources = uniqueSources(proposal.sources.map(materialize))
    if (!field) throw new SemanticFailure('unknown-economy-field')
    const amounts = sources.flatMap(source => [...source.quote.matchAll(/\d{1,3}(?:[ \u00a0]\d{3})+(?:,\d+)?|\d+(?:[,.]\d+)?/g)].map(match => match[0].replace(/[ \u00a0]/g, '').replace(',', '.')))
    if (proposal.amount !== null && !amounts.includes(proposal.amount) || proposal.debtPart !== null && !amounts.includes(proposal.debtPart) || proposal.year !== null && !sources.some(source => source.quote.includes(proposal.year!)) || proposal.period === 'month' && !sources.some(source => /måned|mnd/i.test(source.quote)) || proposal.period === 'year' && !sources.some(source => /år|årlig/i.test(source.quote))) throw new SemanticFailure('unsupported-economy-value')
    const known = field.amount !== null
    if (known && proposal.amount !== null && proposal.amount !== field.amount) {
      const source = sources.find(item => [...item.quote.matchAll(/\d{1,3}(?:[ \u00a0]\d{3})+(?:,\d+)?|\d+(?:[,.]\d+)?/g)].some(match => match[0].replace(/[ \u00a0]/g, '').replace(',', '.') === proposal.amount))!
      if (field.alternatives.length < 10) { field.alternatives.push({ amount: proposal.amount, source }); field.status = 'conflict' }
      warn(`Motstridende semantisk beløp for ${field.id}; lokale verdier og belegg er beholdt.`)
    } else if (proposal.amount !== null) {
      if (!known) Object.assign(field, { amount: proposal.amount, status: 'available', nature: proposal.nature, originalText: sources.map(source => source.quote).join('\n').slice(0, 4000) })
      if (field.period !== 'unknown' && proposal.period !== 'unknown' && field.period !== proposal.period || field.year !== null && proposal.year !== null && field.year !== proposal.year) warn(`Motstridende periode eller år for ${field.id}; lokale verdier er beholdt.`)
      else { if (field.period === 'unknown') field.period = proposal.period; if (field.year === null) field.year = proposal.year }
      if (proposal.includedIn !== null) {
        const parent = fields.find(item => item.id === proposal.includedIn)
        const quotes = sources.map(source => source.quote.toLocaleLowerCase('nb'))
        const mentionsField = (quote: string) => quote.includes(field.label.toLocaleLowerCase('nb')) || field.id === 'sharedDebtPayment' && /renter og avdrag fellesgjeld/i.test(quote)
        const separate = proposal.includedIn === '' && quotes.some(quote => mentionsField(quote) && /\bseparat(?:e)?\b|ikke inkludert/i.test(quote))
        const included = parent && parent.id !== field.id && parent.category === field.category && quotes.some(quote => mentionsField(quote) && /inkludert i|inngår i|herav/i.test(quote) && quote.includes(parent.label.toLocaleLowerCase('nb')))
        if (separate || included) field.includedIn = proposal.includedIn
        else warn(`Inkludering for ${field.id} mangler entydig relasjonsbelegg; verdien er ukjent.`)
      }
      if (proposal.debtPart !== null) field.debtPart = proposal.debtPart
    }
    const combined = uniqueSources([...field.sources, ...sources])
    if (combined.length > 12) warn(`Kildegrensen for ${field.id} er nådd; ytterligere semantiske belegg er uavklart.`)
    field.sources = combined.slice(0, 12)
  }
  return { result, findings: reconciled, candidates, fields, warnings }
}
export async function createCodeFirstImport(basis: ImportBasis, dependencies: SemanticDependencies = {}): Promise<DocumentImport> {
  const plan = createLocalPlan(basis), request = createSemanticRequest(plan), digest = semanticDigest(request)
  const ledger = dependencies.ledger ?? new AnalysisBudget(basis.parentHash ?? basis.hash)
  let findings: DocumentImport['technical']['findings'] = plan.findings, uncertainties: string[] = [], limitations: string[] = []
  let cost: ImportCost = { analysisId: ledger.analysisId, requestDigest: digest, model: CODE_FIRST_MODEL, tokenizer: 'unavailable', priceVersion: null, inputTokens: 0, outputTokens: request.max_output_tokens, estimatedUsd: '0.00000000', reservedUsd: '0.00000000', remainingUsd: ledger.remaining(), actualUsd: '0.00000000', status: 'completed', reason: null }
  if (plan.selected.length) {
    // Missing transport does not reserve money; it remains a visible, closed production gate.
    if (!dependencies.transport || dependencies.transport.purpose !== 'offline-stub') cost = { ...cost, inputTokens: null, estimatedUsd: null, actualUsd: null, status: 'blocked', reason: 'live-disabled; local-tokenizer-unavailable' }
    else if (dependencies.signal?.aborted) cost = { ...cost, status: 'blocked', reason: 'interrupted' }
    else {
      cost = preflightSemantic(request, basis.hash, ledger, { tokenizer: dependencies.tokenizer, tokenCount: dependencies.tokenCount, price: dependencies.price, offlineTest: true })
      if (cost.status === 'reserved') {
        const controller = new AbortController(), abort = () => controller.abort()
        dependencies.signal?.addEventListener('abort', abort, { once: true })
        let timer: ReturnType<typeof setTimeout> | undefined
        let settlementAttempted = false
        try {
          const timeout = Math.min(dependencies.deadlineMs ?? SEMANTIC_LIMITS.deadlineMs, SEMANTIC_LIMITS.deadlineMs)
          const timedOut = new Promise<never>((_, reject) => {
            timer = setTimeout(() => { controller.abort(); reject(new SemanticFailure('semantic-timeout')) }, timeout)
            controller.signal.addEventListener('abort', () => reject(new SemanticFailure('semantic-interrupted')), { once: true })
          })
          const raw = await Promise.race([dependencies.transport.responses.create(request, { signal: controller.signal, timeout, maxRetries: 0 }), timedOut])
          if (semanticDigest(request) !== cost.requestDigest) throw new SemanticFailure('request-digest-changed')
          if (Buffer.byteLength(JSON.stringify(raw)) > IMPORT_MAX_RESPONSE_BYTES) throw new SemanticFailure('response-limit')
          if (!raw || typeof raw !== 'object' || !('status' in raw) || typeof raw.status !== 'string' || !('output_text' in raw) || typeof raw.output_text !== 'string') throw new SemanticFailure('invalid-response')
          // Tools are absent from the approved request and have no budget. Unexpected
          // tool output/usage must retain the reservation with unknown charge.
          if ('tool_usage' in raw && raw.tool_usage != null || 'output' in raw && (!Array.isArray(raw.output) || raw.output.some(item => !item || typeof item !== 'object' || !['message', 'reasoning'].includes(String(item.type))))) throw new SemanticFailure('unexpected-tool-usage')
          // Record valid provider usage even when its semantic output later fails validation.
          const usage = 'usage' in raw ? raw.usage as { input_tokens?: unknown; output_tokens?: unknown } | null : null
          const input = usage?.input_tokens, output = usage?.output_tokens
          if (!Number.isSafeInteger(input) || !Number.isSafeInteger(output) || (input as number) < 0 || (output as number) < 0) throw new SemanticFailure('unknown-usage')
          // Usage in the pinned SDK need not describe cache writes. Charge the verified
          // maximum input/output rates, visibly an upper bound, rather than claiming
          // ordinary uncached input is the actual bill. Reasoning is already in output.
          const actual = costOf(input as number, output as number, dependencies.price!, true)
          settlementAttempted = true
          ledger.settle(digest, actual, 'provider-usage-upper-bound'); cost = { ...cost, actualUsd: actual, usageCostBasis: 'provider-usage-upper-bound', status: 'completed' }
          if ((input as number) > cost.inputTokens! || (output as number) > cost.outputTokens) throw new SemanticFailure('usage-exceeds-reservation')
          checkCombinedResponse(raw.status, Buffer.byteLength(raw.output_text))
          const validated = validateSemantic(plan, JSON.parse(raw.output_text))
          findings = validated.findings; uncertainties = [...validated.result.uncertainties, ...validated.warnings].slice(0, 100); limitations = validated.result.limitations
          plan.manifest.candidates = validated.candidates; plan.fields = validated.fields
          plan.manifest.residual = plan.manifest.residual.filter(item => !item.reason.startsWith('TG-kandidat utenfor') || plan.manifest.candidates.some(candidate => candidate.pdfPage === item.pdfPage && candidate.disposition !== 'duplicate'))
          for (const block of plan.selected) { block.sent = true; block.result = 'semantic' }
        } catch (error) {
          let reason = error instanceof SemanticFailure || error instanceof CombinedBudgetFailure ? error.code : error instanceof z.ZodError ? 'invalid-semantic-schema' : error instanceof SyntaxError ? 'invalid-semantic-json' : error instanceof Error && error.message === 'budget-history-write-failed' ? error.message : 'semantic-failure'
          if (cost.actualUsd === null && !settlementAttempted) {
            settlementAttempted = true
            try { ledger.settle(digest, null) } catch { reason = 'budget-history-write-failed' }
          }
          cost = { ...cost, status: cost.actualUsd === null ? 'uncertain' : 'blocked', reason }
          uncertainties.push('Semantisk svar kunne ikke valideres. Ingen automatisk ny forespørsel.')
        } finally { if (timer) clearTimeout(timer); dependencies.signal?.removeEventListener('abort', abort) }
      }
    }
  }
  cost.remainingUsd = ledger.remaining()
  for (const block of plan.selected) if (block.result === 'unresolved') plan.manifest.residual.push({ pdfPage: block.pdfPage, reason: 'Uløst tekstblokk: ' + block.id })
  for (const candidate of plan.manifest.candidates) if (candidate.disposition === 'unresolved') plan.manifest.residual.push({ pdfPage: candidate.pdfPage, reason: 'Uavklart TG-kandidat: ' + candidate.id })
  if (limitations.length) plan.manifest.residual.push({ pdfPage: plan.sections[0]?.startPage ?? 1, reason: 'Semantiske begrensninger er uavklart; rapportbekreftelse er sperret.' })
  if (uncertainties.length) plan.manifest.residual.push({ pdfPage: plan.sections[0]?.startPage ?? 1, reason: 'Semantisk usikkerhet krever avklaring.' })
  // Identical diagnostics on the same physical page carry no extra information.
  // Keep every distinct block/candidate ID; those entries are never truncated.
  plan.manifest.residual = [...new Map(plan.manifest.residual.map(item => [JSON.stringify([item.pdfPage, item.reason]), item])).values()]
  const section = plan.sections[0], unreadPages = basis.pages.filter(page => !['readable', 'blank'].includes(page.status) || page.rasterUnprocessed).map(page => page.pdfPage)
  const complete = Boolean(section?.certainty === 'certain') && !plan.manifest.residual.length && !uncertainties.length && !limitations.length && cost.status === 'completed'
  const unprocessedAttachments = basis.attachments.map(item => item.id)
  const technicalCoverage: DocumentImport['coverage']['technical'] = { status: complete ? 'complete' : 'incomplete', reasons: [...new Set(plan.manifest.residual.map(item => item.reason))].slice(0, 99), omittedPages: basis.pages.filter(page => !section || page.pdfPage < section.startPage || page.pdfPage > section.endPage).map(page => page.pdfPage), unreadPages, unprocessedAttachments }
  if (cost.reason) technicalCoverage.reasons.push('Semantisk behandling sperret: ' + cost.reason)
  return DocumentImportSchema.parse({ contractVersion: IMPORT_VERSION, extractionVersion: IMPORT_EXTRACTION_VERSION, promptVersion: CODE_FIRST_PROMPT_VERSION, model: CODE_FIRST_MODEL, mode: 'demo', requestId: basis.requestId, reportHash: basis.hash, documentName: basis.name, role: basis.role, pageCount: basis.pages.length, inputDigest: digest, status: 'imported',
    documents: [{ hash: basis.hash, name: basis.name, role: basis.role, pageCount: basis.pages.length, parentHash: basis.parentHash, attachmentId: basis.attachmentId }], pages: basis.pages, attachments: basis.attachments, manifest: plan.manifest, cost,
    propertyIdentity: plan.propertyIdentity, sections: plan.sections,
    economy: { status: plan.fields.some(field => field.status === 'available') ? 'partial' : 'unavailable', ownership: plan.ownership, ownershipSources: plan.ownershipSources, fields: plan.fields },
    coverage: { economy: { status: 'incomplete', reasons: ['Kun entydige eksplisitte beløp er tolket lokalt. Uklar periode, inkludering, gjeldsandel og fullstendig drift krever egen kontroll.'], omittedPages: [], unreadPages, unprocessedAttachments }, technical: technicalCoverage },
    technical: { status: complete ? 'complete' : 'blocked', findings, uncertainties, limitations } })
}
