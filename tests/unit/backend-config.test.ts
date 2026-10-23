import OpenAI from 'openai'
import { inspect } from 'node:util'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AnalysisAdapterError } from '../../src/backend/analysis/adapter.ts'
import { createAnalysisBackend, LIVE_ANALYSIS_SETTINGS } from '../../src/backend/analysis/backend-config.ts'

afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks() })

describe('backendkonfigurasjon — R1 / Story 4.1', () => {
  it.each([undefined, 'demo'])('standard/eksplisitt demo krever verken miljølesing, klient eller nett (%s)', mode => {
    const createClient = vi.fn(() => { throw new Error('klient skal ikke konstrueres') })
    const fetch = vi.fn(() => { throw new Error('nett sperret') })
    const environment = { get OPENAI_API_KEY() { throw new Error('miljø skal ikke leses') } }
    const backend = createAnalysisBackend(mode, { createClient, fetch, environment })
    expect(backend.mode).toBe('demo')
    if (backend.mode === 'demo') expect(backend.adapter.mode).toBe('demo')
    expect(createClient).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('konstruerer én ekte SDK-klient uten modellforespørsel med eksplisitte faste verdier', () => {
    const key = `fictional-${crypto.randomUUID()}`
    vi.stubEnv('OPENAI_BASE_URL', 'https://untrusted.invalid')
    vi.stubEnv('OPENAI_ORG_ID', 'untrusted-org')
    vi.stubEnv('OPENAI_PROJECT_ID', 'untrusted-project')
    vi.stubEnv('OPENAI_WEBHOOK_SECRET', 'untrusted-webhook')
    vi.stubEnv('OPENAI_LOG', 'debug')
    const fetch = vi.fn(() => { throw new Error('nett sperret') })
    const createClient = vi.fn((options: ConstructorParameters<typeof OpenAI>[0]) => {
      const client = new OpenAI(options)
      expect(client.baseURL).toBe('https://api.openai.com/v1')
      expect(client.organization).toBeNull()
      expect(client.project).toBeNull()
      expect(client.webhookSecret).toBeNull()
      expect(client.logLevel).toBe('off')
      expect(client.maxRetries).toBe(0)
      expect(client.timeout).toBe(120_000)
      return client
    })
    const backend = createAnalysisBackend('live', { environment: { OPENAI_API_KEY: key }, fetch, createClient })
    expect(createClient).toHaveBeenCalledTimes(1)
    expect(createClient.mock.calls[0][0]).toMatchObject({ apiKey: key, dangerouslyAllowBrowser: false })
    expect(fetch).not.toHaveBeenCalled()
    expect(backend.mode).toBe('live')
    if (backend.mode !== 'live') throw new Error('forventet live')
    expect(backend.settings).toEqual({ provider: 'openai', api: 'responses', sdkVersion: '6.9.1', model: 'gpt-6.1-sol', reasoning: { effort: 'low' }, service_tier: 'default', timeout: 120_000, maxRetries: 0 })
    expect(Object.isFrozen(backend.settings)).toBe(true)
    expect(Object.isFrozen(backend.settings.reasoning)).toBe(true)
    expect(JSON.stringify(backend)).not.toContain(key)
    expect(inspect(backend)).not.toContain(key)
  })

  it.each([null, '', 'LIVE', 'other', 1, {}, []])('avviser ugyldig modus uten klient eller fallback (%s)', mode => {
    const createClient = vi.fn()
    expect(() => createAnalysisBackend(mode, { createClient })).toThrow(AnalysisAdapterError)
    expect(createClient).not.toHaveBeenCalled()
  })

  it.each([undefined, null, '', ' ', ' key', 'key\n', 'key\rvalue', 'key\tvalue', 123, {}, 'nøkkel'])('avviser manglende/ugyldig nøkkel før klient (%s)', key => {
    const createClient = vi.fn()
    expect(() => createAnalysisBackend('live', { environment: { OPENAI_API_KEY: key }, createClient })).toThrow(AnalysisAdapterError)
    expect(createClient).not.toHaveBeenCalled()
  })

  it('leser nøkkelen fra backendmiljø og skjuler rå konstruksjonsfeil uten logg', () => {
    const key = `fictional-${crypto.randomUUID()}`
    vi.stubEnv('OPENAI_API_KEY', key)
    const logs = ['error', 'warn', 'info', 'debug', 'log'].map(method => vi.spyOn(console, method as 'log').mockImplementation(() => {}))
    let caught: unknown
    try {
      createAnalysisBackend('live', { createClient(options) {
        expect(options.apiKey).toBe(key)
        options.logger?.error(key)
        throw new Error(`raw-provider-error-${key}`)
      } })
    } catch (error) { caught = error }
    expect(caught).toBeInstanceOf(AnalysisAdapterError)
    expect(inspect(caught)).not.toContain(key)
    expect(JSON.stringify(caught)).not.toContain('raw-provider-error')
    expect((caught as AnalysisAdapterError).analysisError.code).toBe('adapter-failure')
    for (const log of logs) expect(log).not.toHaveBeenCalled()
  })

  it('lar ekstern requestabort nå SDK-transporten uten ekstra forsøk', async () => {
    const abort = new AbortController()
    let transportSignal: AbortSignal | null | undefined
    let started!: () => void
    const ready = new Promise<void>(resolve => { started = resolve })
    const fetch = vi.fn<typeof globalThis.fetch>(async (_url, init) => {
      expect(String(_url)).toBe('https://api.openai.com/v1/responses')
      expect(JSON.parse(String(init?.body))).toMatchObject({ model: 'gpt-6.1-sol', reasoning: { effort: 'low' }, service_tier: 'default' })
      transportSignal = init?.signal
      started()
      return await new Promise<Response>((_resolve, reject) => {
        transportSignal?.addEventListener('abort', () => reject(new Error('controlled abort')), { once: true })
      })
    })
    const backend = createAnalysisBackend('live', { environment: { OPENAI_API_KEY: `fictional-${crypto.randomUUID()}` }, fetch })
    if (backend.mode !== 'live') throw new Error('forventet live')
    // Transportprobe uten rapport, analyseprompt eller leverandørschema.
    const pending = backend.responses.create({ model: LIVE_ANALYSIS_SETTINGS.model, reasoning: LIVE_ANALYSIS_SETTINGS.reasoning, service_tier: LIVE_ANALYSIS_SETTINGS.service_tier, input: 'configuration transport probe' }, { signal: abort.signal })
    const rejected = expect(pending).rejects.toThrow()
    await ready
    abort.abort()
    await rejected
    expect(transportSignal?.aborted).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
