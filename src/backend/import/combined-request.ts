import { z } from 'zod'
import { createHash } from 'node:crypto'
import { LIVE_ANALYSIS_SETTINGS } from '../analysis/backend-config.ts'
import { LIVE_EXTRACTION_SCHEMA, TG_EXTRACTION_RULES } from '../analysis/live-request.ts'
import { EconomyFieldSchema, ImportSectionSchema, PropertyCandidateSchema, PdfSourceSchema, IMPORT_PROMPT_VERSION, IMPORT_MAX_RESPONSE_BYTES } from '../../contracts/document-import.ts'
import type { DocumentImport, ImportRole } from '../../contracts/document-import.ts'
import type { DocumentBasis } from '../../contracts/document-analysis.ts'

export const COMBINED_LIMITS = Object.freeze({ inputTokens: 100_000, outputTokens: 16_000, responseBytes: IMPORT_MAX_RESPONSE_BYTES })
const economySchema = z.toJSONSchema(z.strictObject({ ownership: z.enum(['eierseksjon', 'borettslag', 'unknown']), ownershipSources: z.array(PdfSourceSchema), fields: z.array(EconomyFieldSchema) }))
const sourceSchema = z.toJSONSchema(PdfSourceSchema)
export const COMBINED_EXTRACTION_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['economy', 'propertyIdentity', 'sections', 'technical'],
  properties: {
    economy: economySchema,
    propertyIdentity: { type: 'array', items: z.toJSONSchema(PropertyCandidateSchema) },
    sections: { type: 'array', items: z.toJSONSchema(ImportSectionSchema) },
    technical: { ...LIVE_EXTRACTION_SCHEMA, properties: {
      ...LIVE_EXTRACTION_SCHEMA.properties,
      findings: { type: 'array', items: { ...LIVE_EXTRACTION_SCHEMA.properties.findings.items,
        required: [...LIVE_EXTRACTION_SCHEMA.properties.findings.items.required, 'component', 'conditionId', 'sources'],
        properties: { ...LIVE_EXTRACTION_SCHEMA.properties.findings.items.properties, component: { type: ['string','null'] }, conditionId: { type: ['string','null'] }, sources: { type: 'array', items: sourceSchema } },
      } },
    } },
  },
} as const
export const COMBINED_PROMPT = `Kombinert dokumentuttrekk ${IMPORT_PROMPT_VERSION}. Les hele det valgte sidegrunnlaget, inkludert hele rapportområdet; ikke påstå å ha lest utelatte sider eller vedlegg. Økonomi og teknisk dekning er separate utfall. Bevar originaltekst og eksakte kilder også for beløp, periode/år, inkludering, gjeldsdel og oppgitt estimat. Ukjent er null/unknown, aldri 0. Ingen leie-, drifts-, avgifts- eller oppussingsestimat, OCR, eksterne kilder eller verktøy. Hver kilde har originalhash, dokumentnavn, fysisk pdfPage, ordrett quote og start/end i bevart sidetekst. Trykt side er separat. Bevar eiendomsidentitet og uklare/motstridende områder; innholdsfortegnelse er bare kandidat. Samme identifiserte forhold samles i ett funn med alle belegg. Ulike bygningsdeler/forhold beholdes selv ved lik beskrivelse. Uavklart identitet eller sammenslåing skal bevares som usikkerhet. ${TG_EXTRACTION_RULES}`
function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']'
  if (value !== null && typeof value === 'object') return '{' + Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, item]) => JSON.stringify(key) + ':' + canonicalJson(item)).join(',') + '}'
  return JSON.stringify(value)
}
export function createCombinedRequest(input: { hash: string; name: string; role: ImportRole; sections: DocumentImport['sections']; pages: DocumentBasis['pages']; attachments: DocumentImport['attachments'] }) {
  return {
    model: LIVE_ANALYSIS_SETTINGS.model, reasoning: LIVE_ANALYSIS_SETTINGS.reasoning, service_tier: LIVE_ANALYSIS_SETTINGS.service_tier,
    stream: false, store: false, truncation: 'disabled', max_output_tokens: COMBINED_LIMITS.outputTokens,
    instructions: COMBINED_PROMPT,
    input: [{ role: 'user', content: [{ type: 'input_text', text: canonicalJson(input) }] }],
    text: { format: { type: 'json_schema', name: `document_import_${IMPORT_PROMPT_VERSION.replaceAll('-','_')}`, strict: true, schema: COMBINED_EXTRACTION_SCHEMA } },
  } as const
}
export type CombinedRequest = ReturnType<typeof createCombinedRequest>
export interface LocalModelTokenizer {
  model: typeof LIVE_ANALYSIS_SETTINGS.model
  verification: 'verified-local-model-and-request-framing'
  /** Må omfatte hele endelige requesten: prompt, schema, tekst, metadata og modellens framing. */
  countRequest(request: CombinedRequest): number
}
export class CombinedBudgetFailure extends Error {
  readonly code: 'local-tokenizer-unavailable' | 'unknown-model' | 'invalid-token-count' | 'input-token-limit' | 'output-token-limit' | 'response-limit' | 'incomplete-response'
  constructor(code: CombinedBudgetFailure['code']) { super(code); this.code = code }
}
/** Ingen lokal modelltilpasset tokenizer er installert/godkjent i produksjon. Ingen ekstern telling eller bytes/4-fallback. */
export function checkCombinedBudget(request: CombinedRequest, tokenizer: LocalModelTokenizer | null = null) {
  if (request.model !== LIVE_ANALYSIS_SETTINGS.model) throw new CombinedBudgetFailure('unknown-model')
  if (!Number.isSafeInteger(request.max_output_tokens) || request.max_output_tokens < 1 || request.max_output_tokens > COMBINED_LIMITS.outputTokens) throw new CombinedBudgetFailure('output-token-limit')
  if (!tokenizer || tokenizer.model !== request.model || tokenizer.verification !== 'verified-local-model-and-request-framing') throw new CombinedBudgetFailure('local-tokenizer-unavailable')
  let inputTokens: number
  try { inputTokens = tokenizer.countRequest(request) } catch { throw new CombinedBudgetFailure('local-tokenizer-unavailable') }
  if (!Number.isSafeInteger(inputTokens) || inputTokens < 0) throw new CombinedBudgetFailure('invalid-token-count')
  if (inputTokens > COMBINED_LIMITS.inputTokens) throw new CombinedBudgetFailure('input-token-limit')
  // max_output_tokens omfatter synlig output og reasoning; ingen separat ekstra outputkvote.
  return { inputTokens, outputTokens: request.max_output_tokens }
}
export function checkCombinedResponse(status: string, utf8Bytes: number) {
  if (!Number.isSafeInteger(utf8Bytes) || utf8Bytes < 0 || utf8Bytes > COMBINED_LIMITS.responseBytes) throw new CombinedBudgetFailure('response-limit')
  if (status !== 'completed') throw new CombinedBudgetFailure('incomplete-response')
}
export function combinedInputDigest(request: CombinedRequest) { return createHash('sha256').update(canonicalJson(request)).digest('hex') }
