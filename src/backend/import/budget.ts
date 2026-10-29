import Big from 'big.js'
import { CODE_FIRST_MODEL } from '../../contracts/document-import.ts'
import type { ImportCost } from '../../contracts/document-import.ts'
import { SEMANTIC_LIMITS, semanticDigest } from './semantic-request.ts'
import type { SemanticRequest } from './semantic-request.ts'

export type SemanticTokenizer = { model: typeof CODE_FIRST_MODEL; verification: ImportCost['tokenizer']; countRequest(request: SemanticRequest): number }
export type SemanticPrice = { version: string; model: typeof CODE_FIRST_MODEL; verified: boolean; inputPerMillion: string; outputPerMillion: string; maximumInputPerMillion: string; maximumOutputPerMillion: string; surchargeMultiplier: string }
/** Dated reference, not approved account/region maximum rates; production must remain blocked. */
export const REFERENCE_PRICE: SemanticPrice = Object.freeze({ version: 'sol-standard-reference-2026-10-29', model: CODE_FIRST_MODEL, verified: false, inputPerMillion: '2', outputPerMillion: '10', maximumInputPerMillion: '2.50', maximumOutputPerMillion: '10', surchargeMultiplier: '1.10' })
export type BudgetEntry = { documentHash: string; requestDigest: string; reservedUsd: string; actualUsd: string | null; state: 'reserved' | 'completed' | 'uncertain' }
/** Owned by the logical analysis, shared with a separate report. A missing restored history never authorizes live transport. */
export class AnalysisBudget {
  readonly analysisId: string
  readonly historyRestored: boolean
  private readonly reservations: BudgetEntry[]
  constructor(analysisId: string, options: { historyRestored?: boolean; entries?: BudgetEntry[] } = {}) {
    this.analysisId = analysisId; this.historyRestored = options.historyRestored ?? false
    this.reservations = structuredClone(options.entries ?? [])
    if (!analysisId || this.reservations.some(entry => !/^[a-f0-9]{64}$/.test(entry.documentHash) || !/^[a-f0-9]{64}$/.test(entry.requestDigest) || !validMoney(entry.reservedUsd) || entry.actualUsd !== null && !validMoney(entry.actualUsd) || !['reserved', 'completed', 'uncertain'].includes(entry.state)) || new Set(this.reservations.map(entry => entry.documentHash)).size !== this.reservations.length) throw new Error('invalid-budget-history')
  }
  snapshot() { return structuredClone(this.reservations) }
  remaining() { return Big(SEMANTIC_LIMITS.usd).minus(this.reservations.reduce((sum, item) => sum.plus(item.reservedUsd), Big(0))).toFixed(8) }
  reserve(documentHash: string, requestDigest: string, amount: string) {
    if (this.reservations.some(entry => entry.documentHash === documentHash || entry.requestDigest === requestDigest)) throw new Error('document-already-attempted')
    if (!validMoney(amount) || Big(amount).gt(this.remaining())) throw new Error('analysis-budget-exceeded')
    this.reservations.push({ documentHash, requestDigest, reservedUsd: amount, actualUsd: null, state: 'reserved' })
  }
  settle(requestDigest: string, actualUsd: string | null) {
    const entry = this.reservations.find(item => item.requestDigest === requestDigest)
    if (!entry) throw new Error('missing-reservation')
    // Keep the conservative reservation even after usage is known; no automatic new quota.
    entry.actualUsd = actualUsd; if (actualUsd !== null && Big(actualUsd).gt(entry.reservedUsd)) entry.reservedUsd = actualUsd
    entry.state = actualUsd === null ? 'uncertain' : 'completed'
  }
}
function validMoney(value: string) { return /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value) }
export function costOf(input: number, output: number, price: SemanticPrice, maximum = false) {
  return Big(input).times(maximum ? price.maximumInputPerMillion : price.inputPerMillion).plus(Big(output).times(maximum ? price.maximumOutputPerMillion : price.outputPerMillion)).div(1_000_000).times(maximum ? price.surchargeMultiplier : '1').toFixed(8)
}
export function preflightSemantic(request: SemanticRequest, documentHash: string, ledger: AnalysisBudget, options: { tokenizer?: SemanticTokenizer; price?: SemanticPrice; offlineTest?: boolean } = {}): ImportCost {
  const digest = semanticDigest(request), tokenizer = options.tokenizer, price = options.price
  const cost: ImportCost = { analysisId: ledger.analysisId, requestDigest: digest, model: CODE_FIRST_MODEL, tokenizer: tokenizer?.verification ?? 'unavailable', priceVersion: price?.version ?? null,
    inputTokens: null, outputTokens: request.max_output_tokens, estimatedUsd: null, reservedUsd: '0.00000000', remainingUsd: ledger.remaining(), actualUsd: null, status: 'blocked', reason: null }
  const fail = (reason: string) => ({ ...cost, reason })
  if (request.model !== CODE_FIRST_MODEL) return fail('unknown-model')
  if (!tokenizer || tokenizer.model !== request.model || !(tokenizer.verification === 'verified-local-model-and-request-framing' || options.offlineTest && tokenizer.verification === 'test-only')) return fail('local-tokenizer-unavailable')
  let tokens: number
  try { tokens = tokenizer.countRequest(request) } catch { return fail('local-tokenizer-unavailable') }
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
