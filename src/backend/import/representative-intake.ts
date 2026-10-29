import { execFileSync } from 'node:child_process'
import { constants } from 'node:fs'
import { chmod, lstat, mkdir, open, readFile, realpath, stat } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { z } from 'zod'
import { IMPORT_MAX_PDF_BYTES } from '../../contracts/document-import.ts'
import { validatePdf } from '../documents/validate-pdf.ts'
import { extractImport } from '../documents/extract-import.ts'
import type { ImportBasis } from './local-plan.ts'
import { RepresentativeManifestSchema, representativeHash, representativeTemplates, validateRepresentativeOracle } from './representative-oracle.ts'

const repository = resolve(import.meta.dirname, '../../..')
const caseIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/)
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n'
const fileNames = ['original.pdf', 'manifest.json', 'pages.json', 'coverage.json', 'oracle.json', 'human-review.json'] as const
const sha = z.string().regex(/^[a-f0-9]{64}$/)
const ReceiptSchema = z.strictObject({ version: z.literal(1), caseId: caseIdSchema, frozenAt: z.iso.datetime(), humanAttestation: z.literal('self-reported-before-model-output'), productionBenchmark: z.literal(false), files: z.strictObject({ 'original.pdf': sha, 'manifest.json': sha, 'pages.json': sha, 'coverage.json': sha, 'oracle.json': sha, 'human-review.json': sha }) })

/** Ignore rules are a guard against accidental staging, never a git add -f security boundary. */
function checkGitBoundary(caseId: string) {
  if (!caseIdSchema.safeParse(caseId).success) throw new Error('representative-case-id-invalid')
  // Do not forward or enumerate the environment containing potential API credentials.
  const gitOptions = { cwd: repository, encoding: 'utf8' as const, stdio: ['ignore', 'pipe', 'pipe'] as ['ignore', 'pipe', 'pipe'], env: { PATH: process.env.PATH ?? '', TMPDIR: '/private/tmp', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' } }
  const tracked = execFileSync('git', ['ls-files', '-z', '--', 'private'], gitOptions)
  if (tracked.length) throw new Error('representative-private-path-tracked')
  try { execFileSync('git', ['check-ignore', '-q', '--no-index', '--', `private/representative-cases/${caseId}/original.pdf`], gitOptions) }
  catch { throw new Error('representative-private-path-not-ignored') }
}
async function checkedDirectory(path: string, create: boolean) {
  if (create) await mkdir(path, { mode: 0o700 }).catch(error => { if (error.code !== 'EEXIST') throw error })
  const metadata = await lstat(path)
  if (metadata.isSymbolicLink() || !metadata.isDirectory() || await realpath(path) !== path) throw new Error('representative-private-path-unsafe')
}
async function caseDirectory(caseId: string, createParents = false) {
  checkGitBoundary(caseId)
  // Each component is inspected; a symlink below the repository cannot redirect private bytes.
  await checkedDirectory(join(repository, 'private'), createParents)
  await checkedDirectory(join(repository, 'private', 'representative-cases'), createParents)
  return join(repository, 'private', 'representative-cases', caseId)
}
async function readPrivate(directory: string, name: string) {
  const path = join(directory, name), metadata = await lstat(path)
  if (metadata.isSymbolicLink() || !metadata.isFile() || metadata.nlink !== 1 || await realpath(path) !== path) throw new Error('representative-private-file-unsafe')
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW)
  try { return await handle.readFile() } finally { await handle.close() }
}
async function writePrivate(directory: string, name: string, value: string | Uint8Array, immutable = false) {
  const handle = await open(join(directory, name), constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW, 0o600)
  try { await handle.writeFile(value); await handle.sync() } finally { await handle.close() }
  if (immutable) await chmod(join(directory, name), 0o400)
}
async function extractOriginal(bytes: Uint8Array, caseId: string): Promise<ImportBasis> {
  if (bytes.length > IMPORT_MAX_PDF_BYTES) throw new Error('representative-original-byte-limit')
  const format = await validatePdf(bytes, 'original.pdf', { maxPages: 200 })
  if (format.status !== 'format-validated') throw new Error('representative-original-format-invalid')
  const extracted = await extractImport(format)
  return { hash: format.reportHash, name: format.documentName, role: 'prospectus', requestId: `representative-${caseId}`.slice(0, 100), parentHash: null, attachmentId: null, pages: extracted.pages, attachments: extracted.attachments }
}

/** Local PDF.js preparation only. No model, API key, token request, quota initialization or transport. */
export async function prepareRepresentativeDocument(options: { sourcePath: string; caseId: string }) {
  const directory = await caseDirectory(options.caseId, true)
  if (!(await stat(options.sourcePath)).isFile()) throw new Error('representative-original-not-file')
  if ((await stat(options.sourcePath)).size > IMPORT_MAX_PDF_BYTES) throw new Error('representative-original-byte-limit')
  const bytes = await readFile(options.sourcePath), basis = await extractOriginal(bytes, options.caseId)
  const manifest = RepresentativeManifestSchema.parse({ version: 1, caseId: options.caseId, importedAt: new Date().toISOString(), original: { file: 'original.pdf', sha256: basis.hash, pageCount: basis.pages.length, pagesSha256: representativeHash(JSON.stringify(basis.pages)) } })
  const templates = representativeTemplates(manifest, basis)
  checkGitBoundary(options.caseId)
  // Exclusive mkdir also prevents accidentally overwriting a previous case/freeze.
  await mkdir(directory, { mode: 0o700 })
  await checkedDirectory(directory, false)
  await writePrivate(directory, 'original.pdf', bytes, true)
  await writePrivate(directory, 'manifest.json', json(manifest), true)
  await writePrivate(directory, 'pages.json', json({ pages: basis.pages, attachments: basis.attachments }), true)
  await writePrivate(directory, 'coverage.json', json(templates.coverage), true)
  await writePrivate(directory, 'oracle.json', json(templates.oracle))
  await writePrivate(directory, 'human-review.json', json(templates.review))
  return { directory, manifest, ready: false as const, blockers: ['representative-human-review-pending'], externalCalls: 0 as const, humanVerificationPerformed: false as const }
}

async function readCase(caseId: string) {
  const directory = await caseDirectory(caseId)
  await checkedDirectory(directory, false)
  const contents = Object.fromEntries(await Promise.all(fileNames.map(async name => [name, await readPrivate(directory, name)]))) as Record<typeof fileNames[number], Buffer>
  const manifest = RepresentativeManifestSchema.parse(JSON.parse(contents['manifest.json'].toString('utf8')))
  const basis = await extractOriginal(contents['original.pdf'], caseId)
  if (manifest.caseId !== caseId || manifest.original.sha256 !== basis.hash || manifest.original.pageCount !== basis.pages.length || manifest.original.pagesSha256 !== representativeHash(JSON.stringify(basis.pages))) throw new Error('representative-original-mismatch')
  const snapshot = JSON.parse(contents['pages.json'].toString('utf8'))
  if (JSON.stringify(snapshot) !== JSON.stringify({ pages: basis.pages, attachments: basis.attachments })) throw new Error('representative-physical-pages-mismatch')
  if (JSON.stringify(JSON.parse(contents['coverage.json'].toString('utf8'))) !== JSON.stringify(representativeTemplates(manifest, basis).coverage)) throw new Error('representative-coverage-snapshot-mismatch')
  const rawOracle: unknown = JSON.parse(contents['oracle.json'].toString('utf8')), rawReview: unknown = JSON.parse(contents['human-review.json'].toString('utf8'))
  const oracle = validateRepresentativeOracle(rawOracle, rawReview, manifest, basis)
  return { directory, contents, manifest, basis, oracle }
}

export async function freezeRepresentativeOracle(caseId: string) {
  const state = await readCase(caseId)
  const receipt = ReceiptSchema.parse({ version: 1, caseId, frozenAt: new Date().toISOString(), humanAttestation: 'self-reported-before-model-output', productionBenchmark: false, files: Object.fromEntries(fileNames.map(name => [name, representativeHash(state.contents[name])])) })
  checkGitBoundary(caseId)
  await writePrivate(state.directory, 'freeze.json', json(receipt), true)
  return { directory: state.directory, receipt, externalCalls: 0 as const }
}

/** Re-extracts the unchanged original and checks every frozen byte before future preparation. */
export async function loadFrozenRepresentativeCase(caseId: string) {
  const directory = await caseDirectory(caseId)
  await checkedDirectory(directory, false)
  let rawReceipt: Buffer
  try { rawReceipt = await readPrivate(directory, 'freeze.json') }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new Error('representative-oracle-not-frozen'); throw error }
  const receipt = ReceiptSchema.parse(JSON.parse(rawReceipt.toString('utf8')))
  if (receipt.caseId !== caseId) throw new Error('representative-freeze-case-mismatch')
  const state = await readCase(caseId)
  if (fileNames.some(name => representativeHash(state.contents[name]) !== receipt.files[name])) throw new Error('representative-frozen-file-changed')
  return { directory, basis: state.basis, oracle: state.oracle, manifest: state.manifest, receipt }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [command, first, second, ...extra] = process.argv.slice(2)
  try {
    if (extra.length || !first || command === 'intake' && !second || command !== 'intake' && second || !['intake', 'freeze', 'check'].includes(command ?? '')) throw new Error('representative-usage: intake <source.pdf> <case-id> | freeze <case-id> | check <case-id>')
    const result = command === 'intake' ? await prepareRepresentativeDocument({ sourcePath: first, caseId: second! })
      : command === 'freeze' ? await freezeRepresentativeOracle(first)
      : await loadFrozenRepresentativeCase(first).then(value => ({ directory: value.directory, original: value.manifest.original, frozen: true, humanAttestation: value.receipt.humanAttestation, productionBenchmark: false, externalCalls: 0 }))
    // Never print pages, oracle, quotes, or source path into public session evidence.
    console.log(json(result))
  } catch (error) {
    console.error(error instanceof Error && error.message.startsWith('representative-') ? error.message : 'representative-operation-failed')
    process.exitCode = 1
  }
}
