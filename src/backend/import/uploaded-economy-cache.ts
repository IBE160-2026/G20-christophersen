import { createHash, randomUUID } from 'node:crypto'
import { lstat, mkdir, open, readFile, rename } from 'node:fs/promises'
import { resolve } from 'node:path'
import { DocumentImportSchema, ImportCostSchema, IMPORT_MAX_RESPONSE_BYTES } from '../../contracts/document-import.ts'
import type { DocumentImport } from '../../contracts/document-import.ts'
import { prepareEconomyTrial, verifyEconomyTrial } from './economy-trial.ts'
import type { EconomyTrial } from './economy-trial.ts'
import type { ImportBasis } from './local-plan.ts'
import { validateReferencedEconomyOutput } from './economy-compact.ts'
import { prepareUploadedEconomyCall } from './economy-local-budget.ts'
import { mergeUploadedEconomy } from './merge-uploaded-economy.ts'

const defaultDirectory = resolve('private/uploaded-analysis')
const pathFor = (directory: string, hash: string) => {
  if (!/^[a-f0-9]{64}$/.test(hash)) throw new Error('economy-cache-document-mismatch')
  return resolve(directory, hash + '.json')
}
/** Bare vellykkede, kildevaliderte svar lagres privat. Ingen ny API-fullmakt. */
export async function saveUploadedEconomy(packet: EconomyTrial, output: unknown, outcome: DocumentImport, directory = defaultDirectory) {
  DocumentImportSchema.parse(outcome)
  validateReferencedEconomyOutput(output, packet)
  await mkdir(directory, { recursive: true, mode: 0o700 })
  const stat = await lstat(directory)
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('economy-cache-unavailable')
  const destination = pathFor(directory, packet.originalSha256), temporary = destination + '.' + randomUUID() + '.pending'
  const contents = JSON.stringify({ version: 1, packet, output, requestDigest: outcome.economy.analysis?.requestDigest, cost: outcome.cost })
  if (Buffer.byteLength(contents) > IMPORT_MAX_RESPONSE_BYTES) throw new Error('economy-cache-size-limit')
  const file = await open(temporary, 'wx', 0o600)
  try { await file.writeFile(contents); await file.sync() } finally { await file.close() }
  await rename(temporary, destination)
  const parent = await open(directory, 'r')
  try { await parent.sync() } finally { await parent.close() }
}
/** Regenererer pakken fra akkurat denne opplastingen og validerer modellens
 * verdi-/kildereferanser på nytt. Lagrede felt og filnavn brukes aldri som fasit. */
export async function attachUploadedEconomy(outcome: DocumentImport, bytes: Uint8Array, basis: ImportBasis, directory = defaultDirectory): Promise<DocumentImport> {
  try {
    if (basis.role !== 'prospectus' || createHash('sha256').update(bytes).digest('hex') !== basis.hash) return outcome
    const file = pathFor(directory, basis.hash), stat = await lstat(file)
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > IMPORT_MAX_RESPONSE_BYTES) return outcome
    const archive = JSON.parse(await readFile(file, 'utf8')) as { version: number; packet: EconomyTrial; output: unknown; requestDigest: string; cost: unknown }
    if (archive.version !== 1 || archive.packet.originalSha256 !== basis.hash) return outcome
    const historicalBasis = { ...basis, name: archive.packet.basis.name, requestId: archive.packet.basis.requestId }
    if (!verifyEconomyTrial(archive.packet, bytes, historicalBasis)) return outcome
    const packet = prepareEconomyTrial(bytes, basis, archive.packet.selectedPages, archive.packet.localExtractionVersion ?? 'local-economy-1')
    const call = await prepareUploadedEconomyCall(packet, bytes)
    if (call.requestDigest !== archive.requestDigest) return outcome
    const cost = ImportCostSchema.parse(archive.cost)
    if (cost.requestDigest !== call.requestDigest || cost.analysisId !== basis.hash || cost.status !== 'completed') return outcome
    const result = validateReferencedEconomyOutput(archive.output, packet)
    const fields = mergeUploadedEconomy(outcome.economy.fields, result.fields)
    const observations = [...result.observations, ...result.deterministicEvidence.excerpts.map(item => ({ kind: item.kind, raw: item.raw, sources: [item.source] }))]
    return DocumentImportSchema.parse({ ...outcome, inputDigest: call.requestDigest, cost,
      economy: { ...outcome.economy, status: fields.some(field => field.amount !== null) ? 'partial' : 'unavailable', fields,
        analysis: { provenance: 'saved-same-document', requestDigest: call.requestDigest, selectedPages: packet.selectedPages, observations, limitations: result.limitations,
          reason: 'Lagret analyse av samme dokument. Beløp og kilder er validert på nytt mot denne opplastingen. Ingen nye API-kall. Menneskelig kildekontroll gjenstår.' } },
      coverage: { ...outcome.coverage, economy: { ...outcome.coverage.economy, status: 'incomplete', omittedPages: basis.pages.filter(page => !packet.selectedPages.includes(page.pdfPage)).map(page => page.pdfPage), reasons: ['Lagret KI-analyse dekker bare de godkjente økonomisidene; øvrig og teknisk dekning er uavklart.'] } } })
  } catch { return outcome }
}
