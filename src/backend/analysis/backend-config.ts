import OpenAI from 'openai'
import type { ClientOptions } from 'openai'
import { AnalysisAdapterError } from './adapter.ts'
import type { AnalysisAdapter } from './adapter.ts'
import { createDemoAdapter } from './demo-adapter.ts'

/** R1: kodevalgte verdier, aldri miljøstyrt modell/prisklasse eller fallback. */
export const LIVE_ANALYSIS_SETTINGS = Object.freeze({
  provider: 'openai',
  api: 'responses',
  sdkVersion: '6.9.1',
  model: 'gpt-6.1-sol',
  reasoning: Object.freeze({ effort: 'low' as const }),
  service_tier: 'default',
  timeout: 120_000,
  maxRetries: 0,
} as const)

export type AnalysisBackend =
  | { readonly mode: 'demo'; readonly adapter: AnalysisAdapter }
  | {
    readonly mode: 'live'
    readonly settings: typeof LIVE_ANALYSIS_SETTINGS
    readonly responses: Pick<OpenAI['responses'], 'create'>
  }

type Dependencies = {
  /** Lokal backendgrense; andre miljøverdier leses ikke. */
  environment?: Readonly<{ OPENAI_API_KEY?: unknown }>
  fetch?: ClientOptions['fetch']
  createClient?: (options: ClientOptions) => Pick<OpenAI, 'responses'>
}

const silentLogger = Object.freeze({ error() {}, warn() {}, info() {}, debug() {} })

/** Konstruerer bare lokal demo eller én klient; starter aldri en modellforespørsel. */
export function createAnalysisBackend(mode: unknown = 'demo', dependencies: Dependencies = {}): AnalysisBackend {
  if (mode === 'demo') return { mode, adapter: createDemoAdapter() }
  if (mode !== 'live') {
    throw new AnalysisAdapterError('adapter-failure', 'Analysemodus må være demo eller live.')
  }
  try {
    const key = (dependencies.environment ?? process.env).OPENAI_API_KEY
    // Bare syntaks kontrolleres lokalt. Kontotilgang verifiseres før senere live-test.
    if (typeof key !== 'string' || !/^[\x21-\x7e]+$/.test(key)) {
      throw new Error('invalid configuration')
    }
    const client = (dependencies.createClient ?? (options => new OpenAI(options)))({
      apiKey: key,
      baseURL: 'https://api.openai.com/v1',
      organization: null,
      project: null,
      webhookSecret: null,
      maxRetries: LIVE_ANALYSIS_SETTINGS.maxRetries,
      timeout: LIVE_ANALYSIS_SETTINGS.timeout,
      logLevel: 'off',
      logger: silentLogger,
      dangerouslyAllowBrowser: false,
      ...(dependencies.fetch ? { fetch: dependencies.fetch } : {}),
    })
    // SDK-instance og nøkkel forblir i closure, uten serialiserbar oppstartsmetadata.
    // Requestens signal og absolutt adapterfrist eies av 4.2.
    return {
      mode,
      settings: LIVE_ANALYSIS_SETTINGS,
      responses: Object.freeze({ create: client.responses.create.bind(client.responses) }),
    }
  } catch {
    throw new AnalysisAdapterError('adapter-failure', 'Live-analyse kunne ikke konfigureres. Kontroller backendens OPENAI_API_KEY og lokale oppsett.')
  }
}
