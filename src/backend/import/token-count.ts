import OpenAI from 'openai'
import { VERSION as SDK_VERSION } from 'openai/version'
import { createHash } from 'node:crypto'
import { canonicalJson, semanticDigest, SEMANTIC_LIMITS } from './semantic-request.ts'
import type { SemanticRequest } from './semantic-request.ts'
import { compatibleStandardRequest } from './budget.ts'
import { boundedFetch } from '../listing/backend.ts'
import { abortableFetch } from '../analysis/abortable-fetch.ts'

export const TOKEN_COUNT_ENDPOINT = 'https://api.openai.com/v1/responses/input_tokens'
/** No official endpoint price was established. Absence of a price is not proof of zero cost. */
export const COUNT_PRICE_EVIDENCE = Object.freeze({ verified: false, maximumUsd: null, verifiedOn: '2026-10-29',
  reason: 'token-count-price-unverified', sources: ['https://developers.openai.com/api/docs/guides/token-counting', 'https://developers.openai.com/api/reference/resources/responses/subresources/input_tokens/methods/count'] })
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex')
export function createTokenCountRequest(request: SemanticRequest) {
  if (!compatibleStandardRequest(request)) throw new Error('incompatible-standard-request')
  // These are all supported input-affecting fields in the pinned count API. Generation
  // controls remain bound through requestDigest rather than being sent as unknown fields.
  return structuredClone({ model: request.model, input: request.input.map(message => ({ ...message, content: message.content.map(content => ({ ...content })) })), instructions: request.instructions,
    reasoning: request.reasoning, text: request.text, truncation: request.truncation })
}
export type TokenCountRequest = ReturnType<typeof createTokenCountRequest>
export type TokenCountWire = { sdkVersion: string; method: string; url: string; body: string; bodySha256: string; countRequestDigest: string }
export type SemanticTokenCount = Readonly<{ provenance: 'responses-input-tokens' | 'offline-sdk-stub'; model: 'gpt-6.1-sol';
  requestDigest: string; inputTokens: number; wire: Readonly<TokenCountWire> }>
type CountOptions = { signal?: AbortSignal; deadlineMs?: number }
export type TokenCountTransport = Readonly<{ purpose: 'server' | 'offline-stub'; count(request: TokenCountRequest, options?: CountOptions): Promise<{ response: unknown; wire: TokenCountWire }> }>
const transports = new WeakSet<TokenCountTransport>()
const receipts = new WeakMap<SemanticTokenCount, string>()
const silentLogger = { error() {}, warn() {}, info() {}, debug() {} }

function sdkTransport(apiKey: string, fetch: typeof globalThis.fetch, purpose: TokenCountTransport['purpose']): TokenCountTransport {
  if (SDK_VERSION !== '6.9.1') throw new Error('token-count-sdk-mismatch')
  const transport: TokenCountTransport = Object.freeze({ purpose, async count(request: TokenCountRequest, options: CountOptions = {}) {
    // A future verified price must also be reserved under the same analysis allowance
    // before this guard can be relaxed. No server call is authorized by today's code.
    if (purpose === 'server' && !COUNT_PRICE_EVIDENCE.verified) throw new Error('token-count-price-unverified')
    const controller = new AbortController(), abort = () => controller.abort()
    if (options.signal?.aborted) throw new Error('token-count-interrupted')
    const deadline = Math.min(options.deadlineMs ?? SEMANTIC_LIMITS.deadlineMs, SEMANTIC_LIMITS.deadlineMs)
    if (!Number.isFinite(deadline) || deadline <= 0) throw new Error('token-count-invalid-deadline')
    options.signal?.addEventListener('abort', abort, { once: true })
    let wire: TokenCountWire | undefined, timer: ReturnType<typeof setTimeout> | undefined
    const digest = sha256(canonicalJson(request))
    const bounded = boundedFetch(abortableFetch(fetch), 16_384)
    const client = new OpenAI({ apiKey, baseURL: 'https://api.openai.com/v1', organization: null, project: null, webhookSecret: null,
      maxRetries: 0, timeout: deadline, logLevel: 'off', logger: silentLogger,
      fetch: async (url, init) => {
        const body = String(init?.body)
        if (wire || String(url) !== TOKEN_COUNT_ENDPOINT || init?.method !== 'POST' || sha256(canonicalJson(JSON.parse(body))) !== digest) throw new Error('token-count-wire-mismatch')
        wire = { sdkVersion: SDK_VERSION, method: 'POST', url: TOKEN_COUNT_ENDPOINT, body, bodySha256: sha256(body), countRequestDigest: digest }
        return bounded.fetch(url, init)
      } })
    try {
      const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => { reject(new Error('token-count-timeout')); controller.abort() }, deadline)
        controller.signal.addEventListener('abort', () => reject(new Error('token-count-interrupted')), { once: true })
      })
      const response = await Promise.race([client.responses.inputTokens.count(request, { signal: controller.signal, timeout: deadline, maxRetries: 0 }), timeout])
      if (!wire) throw new Error('token-count-missing-wire')
      return { response, wire }
    } finally { if (timer) clearTimeout(timer); options.signal?.removeEventListener('abort', abort); await bounded.settled() }
  } })
  transports.add(transport)
  return transport
}
/** Explicit credentials and fetch are supplied by a future authorized caller; never read from environment. Count only; no create capability. */
export function createSdkTokenCountTransport(options: { apiKey: string; fetch: typeof globalThis.fetch }) {
  return sdkTransport(options.apiKey, options.fetch, 'server')
}
/** Real pinned SDK serialization and parsing, mandatory local stub, honest test provenance. */
export function createOfflineTokenCountTransport(stubFetch: typeof globalThis.fetch) {
  return sdkTransport('offline-count-no-real-key', stubFetch, 'offline-stub')
}
export async function countSemanticInput(request: SemanticRequest, options: CountOptions & { transport: TokenCountTransport }): Promise<SemanticTokenCount> {
  if (!transports.has(options.transport)) throw new Error('untrusted-token-count-transport')
  const requestDigest = semanticDigest(request), body = createTokenCountRequest(request)
  const { response, wire } = await options.transport.count(body, options)
  if (semanticDigest(request) !== requestDigest) throw new Error('request-digest-changed')
  if (!response || typeof response !== 'object' || !('object' in response) || response.object !== 'response.input_tokens'
    || !('input_tokens' in response) || !Number.isSafeInteger(response.input_tokens) || (response.input_tokens as number) < 0) throw new Error('invalid-token-count')
  if (wire.countRequestDigest !== sha256(canonicalJson(createTokenCountRequest(request)))) throw new Error('token-count-wire-mismatch')
  const receipt: SemanticTokenCount = Object.freeze({ provenance: options.transport.purpose === 'server' ? 'responses-input-tokens' : 'offline-sdk-stub', model: request.model,
    requestDigest, inputTokens: response.input_tokens as number, wire: Object.freeze(wire) })
  receipts.set(receipt, canonicalJson(receipt))
  return receipt
}
/** Plain imported JSON, clones, mutations and evidence for another full request are rejected. */
export function verifySemanticTokenCount(request: SemanticRequest, receipt?: SemanticTokenCount, options: { allowOfflineStub?: boolean } = {}) {
  try {
    return Boolean(receipt && receipts.get(receipt) === canonicalJson(receipt) && receipt.model === request.model
      && (receipt.provenance === 'responses-input-tokens' || options.allowOfflineStub && receipt.provenance === 'offline-sdk-stub')
      && receipt.requestDigest === semanticDigest(request) && receipt.wire.sdkVersion === SDK_VERSION && SDK_VERSION === '6.9.1'
      && receipt.wire.url === TOKEN_COUNT_ENDPOINT && receipt.wire.method === 'POST' && receipt.wire.bodySha256 === sha256(receipt.wire.body)
      && canonicalJson(JSON.parse(receipt.wire.body)) === canonicalJson(createTokenCountRequest(request))
      && receipt.wire.countRequestDigest === sha256(canonicalJson(createTokenCountRequest(request))))
  } catch { return false }
}
export async function captureTokenCountWire(request: SemanticRequest) {
  const receipt = await countSemanticInput(request, { transport: createOfflineTokenCountTransport(async () => new Response(JSON.stringify({ object: 'response.input_tokens', input_tokens: 0 }), { headers: { 'content-type': 'application/json' } })) })
  return receipt.wire
}
