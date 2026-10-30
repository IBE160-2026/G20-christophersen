import { createHash } from 'node:crypto'
import OpenAI from 'openai'
import { VERSION } from 'openai/version'
import type { ResponseCreateParamsNonStreaming } from 'openai/resources/responses/responses'
import { compatibleStandardRequest, costOf, GLOBAL_STANDARD_PRICE } from './budget.ts'
import { AnalysisBudgetStore } from './analysis-budget-store.ts'
import { captureSemanticWire, verifySemanticWire } from './live-preflight.ts'
import { canonicalJson, semanticDigest } from './semantic-request.ts'
import type { SemanticRequest } from './semantic-request.ts'
import { verifyEconomyTrial } from './economy-trial.ts'
import { validateReferencedEconomyOutput } from './economy-compact.ts'
import type { EconomyTrial } from './economy-trial.ts'
import { boundedFetch } from '../listing/backend.ts'
import { abortableFetch } from '../analysis/abortable-fetch.ts'

/** Kun første tekstbaserte økonomiprøve. Ingen presis modelltokenisering påstås.
 * Hele SDK-bodyen (også schema) telles i UTF-8-byte. To token per byte pluss
 * 4096 til skjult framing er et bevisst romslig lokalt budsjettestimat.
 * Ingen count-endepunkt, verktøy, cache-/tier-overstyring eller automatisk rapport.
 */
export const LOCAL_ECONOMY_LIMITS = Object.freeze({ maximumInputBudgetTokens: 36_000,
  maximumOutputTokensIncludingReasoning: 6_000, maximumSelectedTextBytes: 12_000,
  maximumSelectedPages: 5, framingAllowance: 4096, tokensPerByte: 2,
  reservationUsd: '0.15', analysisCapUsd: '0.20', deadlineMs: 120_000 })
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
export function assessLocalEconomyBudget(request: SemanticRequest, wireBody: string) {
  if (!compatibleStandardRequest(request) || request.max_output_tokens !== LOCAL_ECONOMY_LIMITS.maximumOutputTokensIncludingReasoning) throw new Error('local-economy-request-incompatible')
  if (semanticDigest(JSON.parse(wireBody) as SemanticRequest) !== semanticDigest(request)) throw new Error('local-economy-wire-mismatch')
  const requestUtf8Bytes = Buffer.byteLength(wireBody, 'utf8')
  const inputBudgetTokens = requestUtf8Bytes * LOCAL_ECONOMY_LIMITS.tokensPerByte + LOCAL_ECONOMY_LIMITS.framingAllowance
  if (inputBudgetTokens > LOCAL_ECONOMY_LIMITS.maximumInputBudgetTokens) throw new Error('local-economy-input-budget-exceeded')
  return { provenance: 'conservative-local-byte-budget' as const, exactTokenCount: false,
    requestUtf8Bytes, inputBudgetTokens, outputBudgetTokensIncludingReasoning: request.max_output_tokens,
    calculatedMaximumUsd: costOf(inputBudgetTokens, request.max_output_tokens, GLOBAL_STANDARD_PRICE, true),
    policyMaximumUsd: costOf(LOCAL_ECONOMY_LIMITS.maximumInputBudgetTokens, LOCAL_ECONOMY_LIMITS.maximumOutputTokensIncludingReasoning, GLOBAL_STANDARD_PRICE, true), reservedUsd: LOCAL_ECONOMY_LIMITS.reservationUsd,
    minimumUnallocatedMarginUsd: '0.05', analysisCapUsd: LOCAL_ECONOMY_LIMITS.analysisCapUsd }
}
type ReferenceApproval = { approvedReferenceProposalDigest: string; doesNotApprovePaidCalls: true; originalSha256: string; approvedPacketDigest: string }
type PaidApproval = { requestDigest: string; referenceDigest: string; maximumAnalysisUsd: '0.20' }
const prepared = new WeakMap<object, { packet: EconomyTrial; request: SemanticRequest; referenceDigest: string }>()
export async function prepareLocalEconomyCall(packet: EconomyTrial, bytes: Uint8Array, referenceBytes: Uint8Array, referenceApproval: ReferenceApproval) {
  if (!verifyEconomyTrial(packet, bytes, packet.basis) || packet.basis.role !== 'prospectus' || packet.basis.parentHash !== null) throw new Error('local-economy-package-mismatch')
  if (packet.selectedPages.length > LOCAL_ECONOMY_LIMITS.maximumSelectedPages || Buffer.byteLength(packet.selectedPages.map(n => packet.basis.pages[n - 1]!.text).join(''), 'utf8') > LOCAL_ECONOMY_LIMITS.maximumSelectedTextBytes) throw new Error('local-economy-text-limit')
  const referenceDigest = sha(referenceBytes)
  if (referenceApproval.approvedReferenceProposalDigest !== referenceDigest || referenceApproval.doesNotApprovePaidCalls !== true
    || referenceApproval.originalSha256 !== packet.originalSha256 || referenceApproval.approvedPacketDigest !== sha(canonicalJson(packet))) throw new Error('local-economy-reference-approval-required')
  const request = structuredClone(packet.request)
  request.max_output_tokens = LOCAL_ECONOMY_LIMITS.maximumOutputTokensIncludingReasoning
  const wire = await captureSemanticWire(request)
  if (!verifySemanticWire(request, wire)) throw new Error('local-economy-wire-mismatch')
  const result = { readyForApproval: true as const, requestDigest: semanticDigest(request), referenceDigest,
    selectedPhysicalPages: [...packet.selectedPages], technicalCoverage: 'unresolved' as const,
    budget: assessLocalEconomyBudget(request, wire.body), wire,
    externalCalls: 0, paidApprovalRequired: true as const }
  prepared.set(result, { packet: structuredClone(packet), request, referenceDigest })
  return result
}
export type LocalEconomyCall = Awaited<ReturnType<typeof prepareLocalEconomyCall>>
/** Enkeltkall, eksplisitte credentials, ny godkjenning for request med lavere outputtak.
 * Første nettverkshandling skjer etter varig fellesreservasjon. Ukjent utfall
 * beholder reservasjonen; ingen automatisk ny kvote eller retry.
 */
export async function runLocalEconomyCall(plan: LocalEconomyCall, approval: PaidApproval, ledger: AnalysisBudgetStore, credentials: { apiKey: string; fetch: typeof globalThis.fetch }) {
  const stored = prepared.get(plan)
  if (!stored || approval.requestDigest !== semanticDigest(stored.request) || approval.referenceDigest !== stored.referenceDigest || approval.maximumAnalysisUsd !== '0.20') throw new Error('local-economy-paid-approval-required')
  if (VERSION !== '6.9.1' || !(ledger instanceof AnalysisBudgetStore) || !ledger.historyRestored || ledger.analysisId !== stored.packet.basis.hash) throw new Error('local-economy-history-unavailable')
  const wire = await captureSemanticWire(stored.request)
  if (!verifySemanticWire(stored.request, wire)) throw new Error('local-economy-wire-mismatch')
  const budget = assessLocalEconomyBudget(stored.request, wire.body)
  // Denne første prøven tillater ett kall og skal beholde minst USD 0,05.
  // Tidligere reservasjoner må aldri spise av denne sikkerhetsmarginen.
  if (ledger.remaining() !== '0.20000000') throw new Error('local-economy-budget-margin')
  // Hele reservasjonen, også ekstra sikkerhetsmargin, blir stående etter svaret.
  ledger.reserve(stored.packet.basis.hash, semanticDigest(stored.request), LOCAL_ECONOMY_LIMITS.reservationUsd)
  prepared.delete(plan)
  let calls = 0
  const bounded = boundedFetch(abortableFetch(credentials.fetch), 1024 * 1024)
  const client = new OpenAI({ apiKey: credentials.apiKey, baseURL: 'https://api.openai.com/v1', organization: null, project: null, webhookSecret: null,
    maxRetries: 0, timeout: LOCAL_ECONOMY_LIMITS.deadlineMs, logLevel: 'off',
    fetch: async (url, init) => {
      if (calls++ !== 0 || String(url) !== wire.url || init?.method !== 'POST' || String(init.body) !== wire.body) throw new Error('local-economy-unexpected-call')
      return bounded.fetch(url, { ...init, redirect: 'error' })
    } })
  try {
    const response = await client.responses.create(stored.request as unknown as ResponseCreateParamsNonStreaming,
      { signal: AbortSignal.timeout(LOCAL_ECONOMY_LIMITS.deadlineMs), maxRetries: 0 })
    if (response.status !== 'completed') throw new Error('local-economy-incomplete-response')
    const usage = response.usage
    if (!usage || !Number.isSafeInteger(usage.input_tokens) || usage.input_tokens < 0 || usage.input_tokens > budget.inputBudgetTokens
      || !Number.isSafeInteger(usage.output_tokens) || usage.output_tokens < 0 || usage.output_tokens > LOCAL_ECONOMY_LIMITS.maximumOutputTokensIncludingReasoning) throw new Error('local-economy-usage-outside-budget')
    const result = validateReferencedEconomyOutput(JSON.parse(response.output_text), stored.packet)
    ledger.settle(semanticDigest(stored.request), costOf(usage.input_tokens, usage.output_tokens, GLOBAL_STANDARD_PRICE, true), 'provider-usage-upper-bound')
    return { result, usage, requiresApprovedReferenceComparison: true as const, technicalCoverage: 'unresolved' as const }
  } catch (error) {
    ledger.settle(semanticDigest(stored.request), null)
    throw error
  } finally { await bounded.settled() }
}
