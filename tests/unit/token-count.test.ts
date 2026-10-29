import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { countSemanticInput, createTokenCountRequest, captureTokenCountWire, createOfflineTokenCountTransport, createSdkTokenCountTransport, verifySemanticTokenCount, COUNT_PRICE_EVIDENCE, TOKEN_COUNT_ENDPOINT } from '../../src/backend/import/token-count.ts'
import { createSemanticRequest, semanticDigest, canonicalJson } from '../../src/backend/import/semantic-request.ts'
import type { SemanticRequest } from '../../src/backend/import/semantic-request.ts'
import { createLocalPlan } from '../../src/backend/import/local-plan.ts'
import { AnalysisBudgetStore } from '../../src/backend/import/analysis-budget-store.ts'
import { AnalysisBudget, GLOBAL_STANDARD_PRICE, preflightSemantic } from '../../src/backend/import/budget.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { codeFirstBasis, sdkStub } from '../helpers/code-first.ts'
const request = () => createSemanticRequest(createLocalPlan(codeFirstBasis()))
const response = (input_tokens: unknown) => new Response(JSON.stringify({ object: 'response.input_tokens', input_tokens }), { headers: { 'content-type': 'application/json' } })
const receipt = (value: SemanticRequest, tokens = 3000) => countSemanticInput(value, { transport: createOfflineTokenCountTransport(async () => response(tokens)) })
const directories: string[] = []
afterEach(() => { directories.splice(0).forEach(path => rmSync(path, { recursive: true, force: true })) })
describe('pinned SDK full-input counting without live API', () => {
  it('serializes model, complete input, instructions, reasoning, strict schema and framing controls to the count route', async () => {
    const value = request(), seen: { url: string; init?: RequestInit }[] = []
    const transport = createOfflineTokenCountTransport(async (url, init) => { seen.push({ url: String(url), init }); return response(3000) })
    const result = await countSemanticInput(value, { transport })
    expect(seen).toHaveLength(1); expect(seen[0]!.url).toBe(TOKEN_COUNT_ENDPOINT)
    expect(seen[0]!.init?.method).toBe('POST')
    const body = JSON.parse(String(seen[0]!.init?.body))
    expect(body).toEqual({ model: value.model, input: value.input, instructions: value.instructions, reasoning: value.reasoning, text: value.text, truncation: value.truncation })
    expect(body.text.format.schema.additionalProperties).toBe(false)
    for (const key of ['store', 'stream', 'max_output_tokens', 'service_tier']) expect(body).not.toHaveProperty(key)
    expect(result).toMatchObject({ provenance: 'offline-sdk-stub', model: 'gpt-6.1-sol', inputTokens: 3000, requestDigest: semanticDigest(value) })
    expect(result.wire.bodySha256).toBe(createHash('sha256').update(result.wire.body).digest('hex'))
    expect(result.wire.countRequestDigest).toBe(createHash('sha256').update(canonicalJson(body)).digest('hex'))
    expect(verifySemanticTokenCount(value, result)).toBe(false)
    expect(verifySemanticTokenCount(value, result, { allowOfflineStub: true })).toBe(true)
    expect(verifySemanticTokenCount(value, structuredClone(result), { allowOfflineStub: true })).toBe(false)
    expect(verifySemanticTokenCount(value, { ...result, inputTokens: 1 }, { allowOfflineStub: true })).toBe(false)
    expect(Object.isFrozen(result)).toBe(true); expect(Object.isFrozen(result.wire)).toBe(true)
    expect(await captureTokenCountWire(value)).toMatchObject({ sdkVersion: '6.9.1', method: 'POST', url: TOKEN_COUNT_ENDPOINT })
  })
  it('binds the receipt to input/schema/instructions/reasoning and generation-only controls', async () => {
    const value = request(), result = await receipt(value)
    const variants = [
      { ...value, instructions: value.instructions + 'changed' },
      { ...value, max_output_tokens: 7999 },
      { ...value, reasoning: { effort: 'high' } },
      { ...value, service_tier: 'priority' },
      { ...value, text: { format: { ...value.text.format, strict: false } } },
      { ...value, input: [{ role: 'user', content: [{ type: 'input_text', text: 'changed' }] }] },
    ]
    for (const changed of variants) expect(verifySemanticTokenCount(changed as SemanticRequest, result, { allowOfflineStub: true })).toBe(false)
  })
  it.each([null, -1, 1.5, '12', 9_007_199_254_740_992])('rejects malformed count %j without a reservation', async tokens => {
    await expect(countSemanticInput(request(), { transport: createOfflineTokenCountTransport(async () => response(tokens)) })).rejects.toThrow('invalid-token-count')
  })
  it('rejects wrong response object, HTTP errors without retry, and oversized success/error bodies', async () => {
    for (const [body, status] of [[JSON.stringify({ object: 'response', input_tokens: 1 }), 200], ['{}', 500], [' '.repeat(16385), 200], [' '.repeat(16385), 429]] as const) {
      const fetch = vi.fn(async () => new Response(body, { status, headers: { 'content-type': 'application/json' } }))
      await expect(countSemanticInput(request(), { transport: createOfflineTokenCountTransport(fetch) })).rejects.toThrow()
      expect(fetch).toHaveBeenCalledTimes(1)
    }
  })
  it('has an absolute abortable deadline for delayed headers and stalled response body', async () => {
    await expect(countSemanticInput(request(), { deadlineMs: 5, transport: createOfflineTokenCountTransport(async () => new Promise(() => {})) })).rejects.toThrow('token-count-timeout')
    let cancelled = false
    const fetch = async () => new Response(new ReadableStream<Uint8Array>({ pull() { return new Promise(() => {}) }, cancel() { cancelled = true } }))
    await expect(countSemanticInput(request(), { deadlineMs: 5, transport: createOfflineTokenCountTransport(fetch) })).rejects.toThrow('token-count-timeout')
    expect(cancelled).toBe(true)
    const controller = new AbortController(); controller.abort()
    const unused = vi.fn(async () => response(1))
    await expect(countSemanticInput(request(), { signal: controller.signal, transport: createOfflineTokenCountTransport(unused) })).rejects.toThrow('token-count-interrupted')
    await expect(countSemanticInput(request(), { deadlineMs: 0, transport: createOfflineTokenCountTransport(unused) })).rejects.toThrow('token-count-invalid-deadline')
    expect(unused).not.toHaveBeenCalled()
  })
  it('rejects tools and unsupported request controls before any endpoint call', async () => {
    const fetch = vi.fn(async () => response(1))
    for (const mutation of [{ tools: [{ type: 'web_search' }] }, { tool_choice: 'none' }, { conversation: 'c' }, { prompt_cache_retention: '12h' }]) {
      const value = Object.assign(request(), mutation)
      expect(() => createTokenCountRequest(value)).toThrow('incompatible-standard-request')
      await expect(countSemanticInput(value, { transport: createOfflineTokenCountTransport(fetch) })).rejects.toThrow('incompatible-standard-request')
    }
    expect(fetch).not.toHaveBeenCalled()
  })
  it('exposes a real SDK transport but unknown endpoint price stops before network or key/environment access', async () => {
    const environment = process.env, fetch = vi.fn(async () => response(1)); let keyReads = 0
    process.env = new Proxy(environment, { get(target, key) { if (key === 'OPENAI_API_KEY') { keyReads++; throw new Error('forbidden-key-read') } return Reflect.get(target, key) } })
    try {
      expect(COUNT_PRICE_EVIDENCE.verified).toBe(false); expect(COUNT_PRICE_EVIDENCE.maximumUsd).toBeNull()
      const transport = createSdkTokenCountTransport({ apiKey: 'explicit-placeholder-no-network', fetch })
      expect(transport.purpose).toBe('server')
      await expect(countSemanticInput(request(), { transport })).rejects.toThrow('token-count-price-unverified')
      const offline = await receipt(request()); expect(offline.provenance).toBe('offline-sdk-stub')
      expect(fetch).not.toHaveBeenCalled(); expect(keyReads).toBe(0)
    } finally { process.env = environment }
  })
  it('cannot accept an arbitrary counting object or mutated generation request', async () => {
    await expect(countSemanticInput(request(), { transport: { purpose: 'server', count: async () => { throw new Error('should-not-call') } } })).rejects.toThrow('untrusted-token-count-transport')
    const value = request()
    const transport = createOfflineTokenCountTransport(async () => { (value as { instructions: string }).instructions += 'changed'; return response(1) })
    await expect(countSemanticInput(value, { transport })).rejects.toThrow('request-digest-changed')
  })
})
describe('server count evidence, maximum output and shared durable budget', () => {
  it('preserves conservative settlement provenance after restart and leaves legacy provenance unknown', async () => {
    const basis = codeFirstBasis(), directory = mkdtempSync(join(tmpdir(), 'count-cost-provenance-')); directories.push(directory)
    AnalysisBudgetStore.initialize(directory, basis.hash)
    const ledger = AnalysisBudgetStore.open(directory, basis.hash)
    const outcome = await createCodeFirstImport(basis, { ...sdkStub(), ledger })
    expect(outcome.cost).toMatchObject({ usageCostBasis: 'provider-usage-upper-bound', actualUsd: '0.01650000' })
    const settled = ledger.snapshot()[0]!
    expect(settled).toMatchObject({ state: 'completed', usageCostBasis: 'provider-usage-upper-bound', actualUsd: '0.01650000' })
    expect(ledger.remaining()).toBe('0.10375000')
    // An old completed entry with no provenance must remain compatible and unknown.
    ledger.reserve('e'.repeat(64), 'f'.repeat(64), '0.01')
    ledger.settle('f'.repeat(64), '0.005')
    ledger.close()
    const restored = AnalysisBudgetStore.open(directory, basis.hash)
    try {
      expect(restored.snapshot()[0]).toEqual(settled)
      expect(restored.snapshot()[1]).not.toHaveProperty('usageCostBasis')
      expect(restored.remaining()).toBe('0.09375000')
      expect(restored.snapshot()[0]!.reservedUsd).toBe(outcome.cost!.reservedUsd)
    } finally { restored.close() }
  })
  it('reserves maximum input price, 8000 output INCLUDING reasoning, and preserves the shared root allowance over restart', async () => {
    const basis = codeFirstBasis(), value = createSemanticRequest(createLocalPlan(basis))
    const directory = mkdtempSync(join(tmpdir(), 'count-budget-')); directories.push(directory)
    AnalysisBudgetStore.initialize(directory, basis.hash)
    const ledger = AnalysisBudgetStore.open(directory, basis.hash)
    const count = await receipt(value, 40000)
    const cost = preflightSemantic(value, basis.hash, ledger, { tokenCount: count, price: GLOBAL_STANDARD_PRICE, offlineTest: true })
    expect(cost).toMatchObject({ status: 'reserved', tokenizer: 'offline-sdk-stub', inputTokens: 40000, outputTokens: 8000, reservedUsd: '0.18000000' })
    ledger.close()
    const restored = AnalysisBudgetStore.open(directory, basis.hash)
    try {
      expect(restored.remaining()).toBe('0.02000000')
      const report = { ...basis, hash: 'f'.repeat(64), parentHash: basis.hash, role: 'report' as const }, reportRequest = createSemanticRequest(createLocalPlan(report))
      const second = preflightSemantic(reportRequest, report.hash, restored, { tokenCount: await receipt(reportRequest, 40000), price: GLOBAL_STANDARD_PRICE, offlineTest: true })
      expect(second.reason).toBe('analysis-budget-exceeded'); expect(restored.snapshot()).toHaveLength(1)
    } finally { restored.close() }
  })
  it.each([40001, 50000])('rejects server-stub input count %i above the limit', async tokens => {
    const value = request(), ledger = new AnalysisBudget('analysis')
    expect(preflightSemantic(value, 'a'.repeat(64), ledger, { tokenCount: await receipt(value, tokens), price: GLOBAL_STANDARD_PRICE, offlineTest: true }).reason).toBe('input-token-limit')
    expect(ledger.snapshot()).toEqual([])
  })
  it('retains unknown charge on unexpected tool activity and marks conservative usage settlement as an upper bound', async () => {
    const dependencies = sdkStub(), outcome = await createCodeFirstImport(codeFirstBasis(), dependencies)
    expect(outcome.cost).toMatchObject({ usageCostBasis: 'provider-usage-upper-bound', actualUsd: '0.01650000' })
    for (const mutation of [{ tool_usage: { web_search: { num_requests: 1 } } }, { output: [{ type: 'web_search_call' }] }]) {
      const deps = sdkStub(), transport = deps.transport
      const result = await createCodeFirstImport(codeFirstBasis(), { ...deps, transport: { purpose: 'offline-stub', responses: { async create(value, options) { return { ...await transport.responses.create(value, options) as object, ...mutation } } } } })
      expect(result.cost).toMatchObject({ status: 'uncertain', reason: 'unexpected-tool-usage', actualUsd: null })
      expect(deps.calls).toHaveLength(1); expect(deps.ledger.snapshot()[0]).toMatchObject({ state: 'uncertain', actualUsd: null })
    }
  })
})
