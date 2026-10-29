import { createHash } from 'node:crypto'
import { createOfflineSdkTransport } from './offline-sdk-transport.ts'
import { canonicalJson, semanticDigest, semanticDocumentBinding } from './semantic-request.ts'
import { VERSION as INSTALLED_SDK_VERSION } from 'openai/version'
import type { SemanticRequest } from './semantic-request.ts'
import { preflightSemantic, compatibleStandardRequest, isGlobalStandardPrice } from './budget.ts'
import type { SemanticPrice, SemanticTokenizer } from './budget.ts'
import { AnalysisBudgetStore } from './analysis-budget-store.ts'

export type SdkWire = { sdkVersion: string; method: string; url: string; body: string; bodySha256: string; requestDigest: string }
const sha256 = (text: string) => createHash('sha256').update(text).digest('hex')
/** Official installed SDK serialization, captured entirely by a mandatory local fetch stub.
 * Only the body/method/URL are retained; no headers, environment or credentials are read.
 */
export async function captureSemanticWire(request: SemanticRequest): Promise<SdkWire> {
  let wire: SdkWire | undefined
  const transport = createOfflineSdkTransport(async (url, init) => {
    if (wire) throw new Error('unexpected-sdk-retry')
    const body = String(init?.body)
    wire = { sdkVersion: INSTALLED_SDK_VERSION, method: init?.method ?? '', url: String(url), body, bodySha256: sha256(body), requestDigest: semanticDigest(JSON.parse(body) as SemanticRequest) }
    return new Response(JSON.stringify({ status: 'completed', output: [] }), { headers: { 'content-type': 'application/json' } })
  })
  await transport.responses.create(request, { signal: new AbortController().signal, timeout: 120_000, maxRetries: 0 })
  if (!wire) throw new Error('missing-sdk-wire')
  return wire
}
export function verifySemanticWire(request: SemanticRequest, wire: SdkWire) {
  try {
    return INSTALLED_SDK_VERSION === '6.9.1' && wire.sdkVersion === INSTALLED_SDK_VERSION && wire.method === 'POST' && wire.url === 'https://api.openai.com/v1/responses'
      && wire.bodySha256 === sha256(wire.body) && wire.requestDigest === semanticDigest(request)
      && canonicalJson(JSON.parse(wire.body)) === canonicalJson(request)
  } catch { return false }
}
/** Evaluates/reserves only with durable caller-owned history and verified dependencies.
 * Offline preparation omits these dependencies and therefore cannot become ready.
 */
export function assessLivePreflight(request: SemanticRequest, documentHash: string, wire: SdkWire, options: { ledger?: AnalysisBudgetStore; tokenizer?: SemanticTokenizer; price?: SemanticPrice; historyError?: string } = {}) {
  const blockers: string[] = []
  if (!verifySemanticWire(request, wire)) blockers.push('sdk-wire-mismatch')
  if (!compatibleStandardRequest(request)) blockers.push('incompatible-standard-request')
  if (!options.tokenizer || options.tokenizer.verification !== 'verified-local-model-and-request-framing') blockers.push('local-tokenizer-unavailable')
  if (!isGlobalStandardPrice(options.price)) blockers.push('unknown-price')
  if (!(options.ledger instanceof AnalysisBudgetStore) || !options.ledger.historyRestored) blockers.push(options.historyError ?? 'budget-history-unavailable')
  const root = semanticDocumentBinding(request, documentHash)
  if (!root) blockers.push('request-document-mismatch')
  else if (options.ledger && options.ledger.analysisId !== root) blockers.push('analysis-root-mismatch')
  if (blockers.length) return { ready: false as const, blockers, cost: null, requestDigest: semanticDigest(request) }
  const cost = preflightSemantic(request, documentHash, options.ledger!, { tokenizer: options.tokenizer, price: options.price })
  return { ready: cost.status === 'reserved', blockers: cost.reason ? [cost.reason] : [], cost, requestDigest: semanticDigest(request) }
}
