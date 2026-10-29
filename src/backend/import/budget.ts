import Big from 'big.js'
import { isEconomyConfiguration } from './economy-request.ts'
import { CODE_FIRST_MODEL } from '../../contracts/document-import.ts'
import type { ImportCost } from '../../contracts/document-import.ts'
import { SEMANTIC_LIMITS, semanticDigest, SEMANTIC_PROMPT, semanticTextConfiguration, canonicalJson } from './semantic-request.ts'
import type { SemanticRequest } from './semantic-request.ts'
import { verifySemanticTokenCount } from './token-count.ts'
import type { SemanticTokenCount } from './token-count.ts'

export type SemanticTokenizer = { model: typeof CODE_FIRST_MODEL; verification: ImportCost['tokenizer']; countRequest(request: SemanticRequest): number }
export type SemanticPrice = { version: string; model: typeof CODE_FIRST_MODEL; verified: boolean; inputPerMillion: string; outputPerMillion: string; maximumInputPerMillion: string; maximumOutputPerMillion: string; surchargeMultiplier: string }
/** Dated reference, not approved account/region maximum rates; production must remain blocked. */
export const REFERENCE_PRICE: SemanticPrice = Object.freeze({ version: 'sol-standard-reference-2026-10-29', model: CODE_FIRST_MODEL, verified: false, inputPerMillion: '2', outputPerMillion: '10', maximumInputPerMillion: '2.50', maximumOutputPerMillion: '10', surchargeMultiplier: '1.10' })
/** Independently checked 2026-10-29 for the fixed GLOBAL Responses endpoint, default
 * Standard tier and default 30m caching only. Cache writes replace ordinary input;
 * no discount or invented regional/safety multiplier is assumed.
 */
export const GLOBAL_STANDARD_PRICE: SemanticPrice = Object.freeze({ version: 'sol-global-standard-default-30m-2026-10-29', model: CODE_FIRST_MODEL, verified: true, inputPerMillion: '2', outputPerMillion: '10', maximumInputPerMillion: '2.50', maximumOutputPerMillion: '10', surchargeMultiplier: '1' })
export const GLOBAL_STANDARD_PRICE_EVIDENCE = Object.freeze({ verifiedOn: '2026-10-29', endpoint: 'https://api.openai.com/v1/responses', serviceTier: 'default', promptCacheRetention: 'default-30m',
  sources: ['https://developers.openai.com/api/docs/models/gpt-6.1-sol', 'https://developers.openai.com/api/docs/guides/prompt-caching', 'https://developers.openai.com/api/docs/guides/reasoning'],
  maximumInputTokens: 40_000, maximumOutputTokensIncludingReasoning: 8_000,
  exclusions: ['tools', 'files', 'images', 'history', 'conversation', 'previous_response_id', 'cache overrides', 'regional/FedRAMP endpoint', 'tier overrides'],
})
export function isGlobalStandardPrice(price?: SemanticPrice) {
  return Boolean(price && (Object.keys(GLOBAL_STANDARD_PRICE) as (keyof SemanticPrice)[]).every(key => price[key] === GLOBAL_STANDARD_PRICE[key]))
}
/** Runtime guard: typed request objects can still be mutated or arrive from untyped callers. */
export function compatibleStandardRequest(request: SemanticRequest) {
  const allowed = ['model', 'reasoning', 'service_tier', 'stream', 'store', 'truncation', 'max_output_tokens', 'instructions', 'input', 'text']
  return Object.keys(request).length === allowed.length && Object.keys(request).every(key => allowed.includes(key))
    && request.model === CODE_FIRST_MODEL && request.reasoning?.effort === 'low' && Object.keys(request.reasoning).length === 1
    && request.service_tier === 'default' && request.stream === false && request.store === false && request.truncation === 'disabled'
    && (request.instructions === SEMANTIC_PROMPT && canonicalJson(request.text) === canonicalJson(semanticTextConfiguration()) || isEconomyConfiguration(request))
    && request.input?.length === 1 && request.input[0]?.role === 'user' && Object.keys(request.input[0]).length === 2
    && request.input[0].content?.length === 1 && request.input[0].content[0]?.type === 'input_text' && typeof request.input[0].content[0].text === 'string'
    && Object.keys(request.input[0].content[0]).length === 2
}
export type BudgetEntry = { documentHash: string; requestDigest: string; reservedUsd: string; actualUsd: string | null; state: 'reserved' | 'completed' | 'uncertain'; usageCostBasis?: ImportCost['usageCostBasis'] }
/** Owned by the logical analysis, shared with a separate report. A missing restored history never authorizes live transport. */
export class AnalysisBudget {
  readonly analysisId: string
  readonly historyRestored: boolean
  private readonly reservations: BudgetEntry[]
  constructor(analysisId: string, options: { historyRestored?: boolean; entries?: BudgetEntry[] } = {}) {
    this.analysisId = analysisId; this.historyRestored = options.historyRestored ?? false
    this.reservations = structuredClone(options.entries ?? [])
    if (!analysisId || this.reservations.some(entry => !/^[a-f0-9]{64}$/.test(entry.documentHash) || !/^[a-f0-9]{64}$/.test(entry.requestDigest) || !validMoney(entry.reservedUsd) || entry.actualUsd !== null && !validMoney(entry.actualUsd) || !['reserved', 'completed', 'uncertain'].includes(entry.state) || !validCostBasis(entry.usageCostBasis)) || new Set(this.reservations.map(entry => entry.documentHash)).size !== this.reservations.length) throw new Error('invalid-budget-history')
  }
  snapshot() { return structuredClone(this.reservations) }
  remaining() { return Big(SEMANTIC_LIMITS.usd).minus(this.reservations.reduce((sum, item) => sum.plus(item.reservedUsd), Big(0))).toFixed(8) }
  reserve(documentHash: string, requestDigest: string, amount: string) {
    if (!/^[a-f0-9]{64}$/.test(documentHash) || !/^[a-f0-9]{64}$/.test(requestDigest)) throw new Error('invalid-reservation')
    if (this.reservations.some(entry => entry.documentHash === documentHash || entry.requestDigest === requestDigest)) throw new Error('document-already-attempted')
    if (!validMoney(amount) || Big(amount).gt(this.remaining())) throw new Error('analysis-budget-exceeded')
    this.reservations.push({ documentHash, requestDigest, reservedUsd: amount, actualUsd: null, state: 'reserved' })
  }
  settle(requestDigest: string, actualUsd: string | null, usageCostBasis?: BudgetEntry['usageCostBasis']) {
    if (actualUsd !== null && !validMoney(actualUsd)) throw new Error('invalid-actual-cost')
    if (!validCostBasis(usageCostBasis)) throw new Error('invalid-cost-provenance')
    const entry = this.reservations.find(item => item.requestDigest === requestDigest)
    if (!entry) throw new Error('missing-reservation')
    // Keep the conservative reservation even after usage is known; no automatic new quota.
    entry.actualUsd = actualUsd; if (actualUsd !== null && Big(actualUsd).gt(entry.reservedUsd)) entry.reservedUsd = actualUsd
    entry.state = actualUsd === null ? 'uncertain' : 'completed'
    // Missing provenance in older histories remains unknown; never infer exact billing.
    if (usageCostBasis === undefined) delete entry.usageCostBasis
    else entry.usageCostBasis = usageCostBasis
  }
}
function validMoney(value: string) { return /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value) }
function validCostBasis(value: unknown) { return value === undefined || value === 'provider-usage-upper-bound' || value === 'provider-usage-exact' }
export function costOf(input: number, output: number, price: SemanticPrice, maximum = false) {
  return Big(input).times(maximum ? price.maximumInputPerMillion : price.inputPerMillion).plus(Big(output).times(maximum ? price.maximumOutputPerMillion : price.outputPerMillion)).div(1_000_000).times(maximum ? price.surchargeMultiplier : '1').toFixed(8)
}
export function preflightSemantic(request: SemanticRequest, documentHash: string, ledger: AnalysisBudget, options: { tokenizer?: SemanticTokenizer; tokenCount?: SemanticTokenCount; price?: SemanticPrice; offlineTest?: boolean } = {}): ImportCost {
  const digest = semanticDigest(request), tokenizer = options.tokenizer, price = options.price
  const cost: ImportCost = { analysisId: ledger.analysisId, requestDigest: digest, model: CODE_FIRST_MODEL, tokenizer: options.offlineTest && tokenizer ? 'test-only' : 'unavailable', priceVersion: price?.version ?? null,
    inputTokens: null, outputTokens: request.max_output_tokens, estimatedUsd: null, reservedUsd: '0.00000000', remainingUsd: ledger.remaining(), actualUsd: null, status: 'blocked', reason: null }
  const fail = (reason: string) => ({ ...cost, reason })
  if (request.model !== CODE_FIRST_MODEL) return fail('unknown-model')
  if (!compatibleStandardRequest(request)) return fail('incompatible-standard-request')
  let tokens: number
  if (options.tokenCount) {
    if (!verifySemanticTokenCount(request, options.tokenCount, { allowOfflineStub: options.offlineTest })) return fail('token-count-evidence-mismatch')
    tokens = options.tokenCount.inputTokens
    cost.tokenizer = options.tokenCount.provenance === 'responses-input-tokens' ? 'verified-server-input-tokens' : 'offline-sdk-stub'
  } else {
    // Legacy counters remain confined to the explicit offline harness. No local model
    // mapping/full framing has been established for Sol.
    if (!options.offlineTest || !tokenizer || tokenizer.model !== request.model || !['test-only', 'verified-local-model-and-request-framing'].includes(tokenizer.verification)) return fail('local-tokenizer-unavailable')
    try { tokens = tokenizer.countRequest(request) } catch { return fail('local-tokenizer-unavailable') }
  }
  if (!Number.isSafeInteger(tokens) || tokens < 0) return fail('invalid-token-count')
  cost.inputTokens = tokens
  if (tokens > SEMANTIC_LIMITS.inputTokens) return fail('input-token-limit')
  if (!Number.isSafeInteger(request.max_output_tokens) || request.max_output_tokens < 1 || request.max_output_tokens > SEMANTIC_LIMITS.outputTokens) return fail('output-token-limit')
  if (!price || price.model !== request.model || !price.version || !(price.verified || options.offlineTest) || [price.inputPerMillion, price.outputPerMillion, price.maximumInputPerMillion, price.maximumOutputPerMillion, price.surchargeMultiplier].some(value => !validMoney(value)) || Big(price.maximumInputPerMillion).lt(price.inputPerMillion) || Big(price.maximumOutputPerMillion).lt(price.outputPerMillion) || Big(price.surchargeMultiplier).lt(1)) return fail('unknown-price')
  if (!options.offlineTest && !ledger.historyRestored) return fail('budget-history-unavailable')
  if (semanticDigest(request) !== digest) return fail('request-digest-changed')
  cost.estimatedUsd = costOf(tokens, request.max_output_tokens, price)
  const reservation = costOf(tokens, request.max_output_tokens, price, true)
  try { ledger.reserve(documentHash, digest, reservation) } catch (error) { return fail(error instanceof Error ? error.message : 'budget-failure') }
  return { ...cost, status: 'reserved', reservedUsd: reservation, remainingUsd: ledger.remaining() }
}
