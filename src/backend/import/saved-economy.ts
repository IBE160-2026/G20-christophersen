import { createHash } from 'node:crypto'
import { open } from 'node:fs/promises'
import { DocumentImportSchema, IMPORT_MAX_RESPONSE_BYTES } from '../../contracts/document-import.ts'
import type { DocumentImport, PdfSource } from '../../contracts/document-import.ts'
import type { ImportBasis } from './local-plan.ts'
import { sourceFor } from './local-plan.ts'
import { prepareEconomyTrial, verifyEconomyTrial } from './economy-trial.ts'
import type { EconomyTrial } from './economy-trial.ts'
import { validateReferencedEconomyOutput } from './economy-compact.ts'
import { canonicalJson } from './semantic-request.ts'

// Integrity pins identify the approved historical artefacts, never an API permission.
const archive = new URL('../../../private/representative-cases/real-01/economy-trial/approved-test-04/', import.meta.url)
const pins = {
  'packet.json': '44f59dbd51ab0794bb00a1f07309146303c3afd19b7f63468d6312ad16e8c769',
  'actual-api-response.json': '0865a2292bda808d20cc69dca312182e25269c7df07cefbb949574e5a5d081c6',
  'model-output.json': 'f8dad1c58a8307b3270b9664705b03cae25a76206dd3e4e0bb40bbda8bcf3887',
} as const
const digest = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')
export async function readPinnedEconomyJson(url: URL, expectedDigest: string) {
  const file = await open(url, 'r')
  try {
    const size = (await file.stat()).size
    if (!Number.isSafeInteger(size) || size > IMPORT_MAX_RESPONSE_BYTES) throw new Error('saved-analysis-integrity')
    const buffer = Buffer.alloc(size + 1)
    const { bytesRead } = await file.read(buffer, 0, buffer.length, 0)
    const bytes = buffer.subarray(0, bytesRead)
    if (bytesRead !== size || digest(bytes) !== expectedDigest) throw new Error('saved-analysis-integrity')
    return JSON.parse(bytes.toString()) as unknown
  } finally { await file.close() }
}
const readPinned = (name: keyof typeof pins) => readPinnedEconomyJson(new URL(name, archive), pins[name])
export type SavedEconomyArchive = { packet: EconomyTrial; response: unknown; output: unknown }

/** Pure replay gate, also used with synthetic archives in tests. All original pages,
 * attachments and the exact request are regenerated; upload name/ID are session metadata. */
export function validateSavedEconomy(archive: SavedEconomyArchive, bytes: Uint8Array, basis: ImportBasis) {
  const packet = archive.packet
  if (basis.role !== 'prospectus' || digest(bytes) !== basis.hash || packet.originalSha256 !== basis.hash) throw new Error('saved-analysis-document-mismatch')
  // Preserve extraction metadata used in the historical packet digest; every
  // semantic input (including pages, attachments, role and hash) comes from this upload.
  const identityBasis = { ...packet.basis, ...basis, name: packet.basis.name, requestId: packet.basis.requestId }
  if (!verifyEconomyTrial(packet, bytes, identityBasis)) throw new Error('saved-analysis-package-mismatch')
  const response = archive.response as { status?: unknown; model?: unknown; output?: { type: string; content?: { type: string; text?: string }[] }[] }
  if (response?.status !== 'completed' || response.model !== packet.request.model || !Array.isArray(response.output)
    || response.output.some(item => !['reasoning', 'message'].includes(item.type))) throw new Error('saved-analysis-response-invalid')
  const texts = response.output.flatMap(item => item.type === 'message' ? item.content ?? [] : []).filter(item => item.type === 'output_text')
  if (texts.length !== 1 || typeof texts[0]!.text !== 'string' || canonicalJson(JSON.parse(texts[0]!.text)) !== canonicalJson(archive.output)) throw new Error('saved-analysis-response-mismatch')
  // Validate historical interpretation against the complete original request first.
  validateReferencedEconomyOutput(archive.output, packet)
  // Rebuild sources for this upload without trusting cached names or offsets.
  const current = prepareEconomyTrial(bytes, basis, packet.selectedPages)
  return { packet: current, result: validateReferencedEconomyOutput(archive.output, current) }
}
export async function attachSavedEconomy(outcome: DocumentImport, bytes: Uint8Array, basis: ImportBasis, load: () => Promise<SavedEconomyArchive> = async () => ({
  packet: await readPinned('packet.json') as EconomyTrial, response: await readPinned('actual-api-response.json'), output: await readPinned('model-output.json'),
})): Promise<DocumentImport> {
  const local = (reason: string) => DocumentImportSchema.parse({ ...outcome, economy: { ...outcome.economy, analysis: {
    provenance: 'local-only', reason: reason + ' Videre KI-analyse har ikke startet. Ingen nye API-kall er utført.', requestDigest: null, selectedPages: [], observations: [], limitations: [],
  } } })
  try {
    const { packet, result } = validateSavedEconomy(await load(), bytes, basis)
    const rebind = (source: PdfSource) => sourceFor(basis, source.pdfPage, source.start, source.end)
    const observations = [...result.observations, ...result.deterministicEvidence.excerpts.map(item => ({ kind: item.kind, raw: item.raw, sources: [rebind(item.source)] }))]
    return DocumentImportSchema.parse({ ...outcome, economy: { ...outcome.economy,
      status: result.fields.some(field => field.amount !== null) ? 'partial' : 'unavailable', fields: result.fields,
      analysis: { provenance: 'saved-same-document', reason: 'Lagret analyse av samme dokument. Original PDF, tekst, forespørsel, beløp og kilder er kontrollert. Menneskelig kildekontroll og semantisk dekning gjenstår. Ingen ny KI-analyse er kjørt.',
        requestDigest: packet.requestDigest, selectedPages: packet.selectedPages, observations, limitations: result.limitations },
    }, coverage: { ...outcome.coverage, economy: { ...outcome.coverage.economy, omittedPages: basis.pages.filter(page => !packet.selectedPages.includes(page.pdfPage)).map(page => page.pdfPage),
      reasons: ['Lagret økonomianalyse dekker bare de oppgitte sidene. Full drift, leie, gjeld, semantisk dekning og menneskelig kildekontroll er uavklart.'] } } })
  } catch (error) {
    const code = error instanceof Error ? error.message : ''
    return local(code === 'saved-analysis-document-mismatch' ? 'Ingen lagret analyse for dette dokumentet; kun lokalt uttrekk vises.'
      : (error as NodeJS.ErrnoException)?.code === 'ENOENT' ? 'Lagret analyse finnes ikke; kun lokalt uttrekk vises.'
        : 'Lagret analyse ble avvist ved identitets-, integritets- eller kildekontroll; kun lokalt uttrekk vises.')
  }
}
