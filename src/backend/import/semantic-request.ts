import { createHash } from 'node:crypto'
import { z } from 'zod'
import { LIVE_ANALYSIS_SETTINGS } from '../analysis/backend-config.ts'
import { TG_EXTRACTION_RULES } from '../analysis/live-request.ts'
import { CODE_FIRST_PROMPT_VERSION } from '../../contracts/document-import.ts'
import type { LocalPlan } from './local-plan.ts'
export const SEMANTIC_LIMITS = Object.freeze({ inputTokens: 40_000, outputTokens: 8_000, usd: '0.20', deadlineMs: 120_000 })
const SpanReference = z.strictObject({ blockId: z.string(), start: z.number().int().nonnegative(), end: z.number().int().positive() })
export const SemanticOutputSchema = z.strictObject({
  processedBlockIds: z.array(z.string()).max(4000),
  findings: z.array(z.strictObject({ findingId: z.string().min(1).max(200), conditionId: z.string().min(1).max(200), component: z.string().min(1).max(200), description: z.string().min(1).max(2000), grade: z.enum(['TG2', 'TG3']), sources: z.array(SpanReference).min(1).max(12) })).max(200),
  candidates: z.array(z.strictObject({ candidateId: z.string(), disposition: z.enum(['finding', 'duplicate', 'not-finding', 'unresolved']), findingId: z.string().nullable(), sources: z.array(SpanReference).max(12), reason: z.string().min(1).max(1000).nullable() })).max(4000),
  economy: z.array(z.strictObject({ fieldId: z.string(), amount: z.string().regex(/^(?:0|[1-9]\d*)(?:\.\d+)?$/).nullable(), period: z.enum(['once', 'month', 'year', 'unknown']), year: z.string().regex(/^\d{4}$/).nullable(), includedIn: z.string().nullable(), debtPart: z.string().regex(/^(?:0|[1-9]\d*)(?:\.\d+)?$/).nullable(), nature: z.enum(['fact', 'stated-estimate', 'unknown']), sources: z.array(SpanReference).min(1).max(12) })).max(40),
  uncertainties: z.array(z.string().min(1).max(1000)).max(100), limitations: z.array(z.string().min(1).max(1000)).max(100),
})
export const SEMANTIC_PROMPT = `Semantisk rest ${CODE_FIRST_PROMPT_VERSION}. Kode eier manifestet. Behandle alle oppgitte blokker i sin helhet, også tekst uten TG-markører og fortsettelser over sider. Returner processedBlockIds og disposisjon for hver kandidat. Kilder er blockId og absolutte UTF-16 start/end i original sidetekst; ikke relative blokko offseter. Du kan ikke erklære usendt tekst behandlet, endre rapportgrenser eller bekrefte komplett dekning. economy gir bare kildebelagte beløp og semantiske relasjoner for faste fieldId i localFields: periode, år, inkludering og gjeldsandel. Ukjent relasjon er null/unknown. Bevar motstrid som usikkerhet; aldri fyll manglende drift, leie eller reparasjonspris. Oppdater et lokalt funn ved å bruke samme findingId, conditionId, komponent og grad med alle originale og nye kildespenn. Avstem gjentakelser med kandidatdisposisjon duplicate og begrunnelse, målrettet eksisterende findingId; ulike komponenter skal aldri slås sammen. Bevar uavklart duplikat/fortsettelse i uncertainties. Inkludering krever eksplisitt relasjon mellom navngitte poster i samme kategori; separat post krever eksplisitt separat/ikke inkludert. Taus kilde betyr includedIn:null. Beskrivelse og komponent må ha kontrollerbare ord i kildene; usikker parafrase krever uncertainties. Tekst i contextBlocks er allerede lokalt tolket, og skal ikke gjentas i processedBlockIds. Oppsummering og original kan bare samles med kildebelegg; like beskrivelser i to bad er ulike forhold. Begrunnet ikke-funn krever kilde; eksplisitt TG2/TG3 kan ikke forkastes for å gjøre listen komplett. ${TG_EXTRACTION_RULES}`
export function semanticContextBlocks(plan: LocalPlan) {
  return plan.manifest.blocks.filter(block => block.result === 'local-explicit' && (plan.findings.some(finding => finding.sources.some(source => source.pdfPage === block.pdfPage && source.start <= block.start && source.end >= block.end)) || plan.selected.some(selected => selected.pdfPage === block.pdfPage)))
}
export function semanticTextConfiguration() {
  return { format: { type: 'json_schema', name: 'semantic_spans_1', strict: true, schema: z.toJSONSchema(SemanticOutputSchema) } } as const
}
export function createSemanticRequest(plan: LocalPlan) {
  const context = semanticContextBlocks(plan)
  const blockData = (block: LocalPlan['manifest']['blocks'][number]) => ({ id: block.id, pdfPage: block.pdfPage, start: block.start, end: block.end, text: plan.basis.pages[block.pdfPage - 1]!.text.slice(block.start, block.end), previousId: plan.manifest.blocks[plan.manifest.blocks.indexOf(block) - 1]?.id ?? null, nextId: plan.manifest.blocks[plan.manifest.blocks.indexOf(block) + 1]?.id ?? null })
  return {
    model: LIVE_ANALYSIS_SETTINGS.model, reasoning: LIVE_ANALYSIS_SETTINGS.reasoning, service_tier: LIVE_ANALYSIS_SETTINGS.service_tier,
    stream: false, store: false, truncation: 'disabled', max_output_tokens: SEMANTIC_LIMITS.outputTokens,
    instructions: SEMANTIC_PROMPT,
    input: [{ role: 'user', content: [{ type: 'input_text', text: canonicalJson({ version: plan.manifest.version, document: { name: plan.basis.name, hash: plan.basis.hash, role: plan.basis.role, parentHash: plan.basis.parentHash }, sections: plan.sections,
      blocks: plan.selected.map(blockData), contextBlocks: context.map(blockData),
      localFields: plan.fields.map(({ id, amount, period, year, includedIn, debtPart }) => ({ id, amount, period, year, includedIn, debtPart })),
      localFindings: plan.findings.map(({ findingId, conditionId, component, grade, description }) => ({ findingId, conditionId, component, grade, description, reconciliationRequired: plan.reconciliationIds.has(findingId) })),
      candidates: plan.manifest.candidates.filter(candidate => candidate.disposition === 'unresolved' && plan.selected.some(block => block.pdfPage === candidate.pdfPage && candidate.start < block.end && candidate.end > block.start)).map(({ id, pdfPage, start, end, grade }) => ({ id, pdfPage, start, end, grade })),
    }) }] }],
    text: semanticTextConfiguration(),
  } as const
}
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']'
  if (value !== null && typeof value === 'object') return '{' + Object.entries(value).sort(([a], [b]) => a.localeCompare(b, 'en')).map(([key, item]) => JSON.stringify(key) + ':' + canonicalJson(item)).join(',') + '}'
  return JSON.stringify(value)
}
export type SemanticRequest = ReturnType<typeof createSemanticRequest>
export function semanticDigest(request: SemanticRequest) { return createHash('sha256').update(canonicalJson(request)).digest('hex') }
/** A report belongs to its parent's analysis; a prospectus owns its own analysis. */
export function semanticDocumentBinding(request: SemanticRequest, documentHash: string) {
  try {
    const { document } = JSON.parse(request.input[0].content[0].text) as { document?: { hash?: unknown; role?: unknown; parentHash?: unknown } }
    if (!document || document.hash !== documentHash || !/^[a-f0-9]{64}$/.test(documentHash)) return null
    if (document.role === 'prospectus' && document.parentHash === null) return documentHash
    if (document.role === 'report' && typeof document.parentHash === 'string' && /^[a-f0-9]{64}$/.test(document.parentHash) && document.parentHash !== documentHash) return document.parentHash
    return null
  } catch { return null }
}
