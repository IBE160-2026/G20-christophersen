import { afterEach, expect, it, vi } from 'vitest'
import { randomUUID } from 'node:crypto'
import { chmod, lstat, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import frozenOracle from '../fixtures/sales-prospectus/code-first-live-oracle.json' with { type: 'json' }
import { prepareRepresentativeDocument, freezeRepresentativeOracle, loadFrozenRepresentativeCase } from '../../src/backend/import/representative-intake.ts'
import { prepareLiveTest } from '../../src/backend/import/prepare-live-test.ts'
import { compareWithOracle } from '../../src/backend/import/oracle-comparison.ts'
import type { FrozenOracle } from '../../src/backend/import/oracle-comparison.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { DocumentImportSchema } from '../../src/contracts/document-import.ts'
import { sdkStub } from '../helpers/code-first.ts'

const gitState = vi.hoisted(() => ({ tracked: false, ignored: true }))
vi.mock('node:child_process', async importOriginal => {
  const actual = await importOriginal<typeof import('node:child_process')>()
  return { ...actual, execFileSync: (...args: Parameters<typeof actual.execFileSync>) => {
    if (gitState.tracked && Array.isArray(args[1]) && args[1][0] === 'ls-files') return 'private/forced-file.pdf\0'
    if (!gitState.ignored && Array.isArray(args[1]) && args[1][0] === 'check-ignore') throw new Error('simulated missing ignore rule')
    return actual.execFileSync(...args)
  } }
})
const repository = resolve(import.meta.dirname, '../..')
const fixture = join(repository, 'tests/fixtures/sales-prospectus/code-first-live-original.pdf')
const directories: string[] = []
function newCase() { const caseId = `offline-gate-${randomUUID()}`; directories.push(join(repository, 'private/representative-cases', caseId)); return caseId }
afterEach(async () => { gitState.tracked = false; gitState.ignored = true; await Promise.all(directories.splice(0).map(path => rm(path, { recursive: true, force: true }))) })

async function simulatedReview(caseId: string) {
  const result = await prepareRepresentativeDocument({ sourcePath: fixture, caseId })
  const review = JSON.parse(await readFile(join(result.directory, 'human-review.json'), 'utf8'))
  const snapshot = JSON.parse(await readFile(join(result.directory, 'pages.json'), 'utf8'))
  const oracle: FrozenOracle = { version: 1, kind: 'representative-single-document-trial', authoredBeforeComparison: 'Synthetic fixture and simulated human inputs; no actual human verification', original: result.manifest.original, reportPages: frozenOracle.reportPages, findings: frozenOracle.findings, economy: structuredClone(frozenOracle.economy) }
  // The existing debt-payment quote itself states the relation. Freeze requires it as an explicit anchor.
  for (const field of oracle.economy.fields) if ((field.includedIn !== null || field.debtPart !== null) && !field.relationSources?.length) field.relationSources = [field.source]
  review.attestation = { reviewer: 'Offline simulated operator', reviewedAt: new Date().toISOString(), originalReadIndependently: true, beforeAnyModelOutput: true, realSalesProspectus: true, selectionRationale: 'Gate regression only: the PDF is synthetic and this assertion is simulated', scope: 'single-document-trial' }
  for (const page of review.pages) Object.assign(page, { visualOriginalChecked: true, textLayerMatchesOriginal: true, rasterChecked: true, role: oracle.reportPages.includes(page.pdfPage) ? 'report' : 'economy', note: 'Simulated physical original check.' })
  for (const block of review.blocks) Object.assign(block, { reviewed: true, note: 'Simulated all-text review.' })
  for (const candidate of review.candidates) {
    const marker = snapshot.pages[candidate.pdfPage - 1].text.slice(candidate.start, candidate.end)
    const findingIndex = oracle.findings.findIndex(finding => finding.grade === candidate.grade && finding.sources.some(source => source.pdfPage === candidate.pdfPage && source.quote.includes(marker)))
    expect(findingIndex).toBeGreaterThanOrEqual(0)
    Object.assign(candidate, { disposition: 'finding', findingIndex, reason: 'Simulated original matching.', evidence: [{ pdfPage: candidate.pdfPage, quote: marker }] })
  }
  for (const field of review.economy) Object.assign(field, { reviewed: true, note: 'Simulated all-pages economics check.' })
  review.reportBoundary = { reviewed: true, note: 'Simulated report boundaries, physical pages 2–5.', sources: [{ pdfPage: 2, quote: 'TILSTANDSRAPPORT - START' }, { pdfPage: 5, quote: 'TILSTANDSRAPPORT - SLUTT' }] }
  await writeFile(join(result.directory, 'human-review.json'), JSON.stringify(review))
  await writeFile(join(result.directory, 'oracle.json'), JSON.stringify(oracle))
  return result
}

it('private intake preserves bytes and physical pages while every human expectation remains pending', async () => {
  const caseId = newCase()
  const result = await prepareRepresentativeDocument({ sourcePath: fixture, caseId })
  expect(result.ready).toBe(false); expect(result.externalCalls).toBe(0); expect(result.humanVerificationPerformed).toBe(false)
  expect(await readFile(join(result.directory, 'original.pdf'))).toEqual(await readFile(fixture))
  const pages = JSON.parse(await readFile(join(result.directory, 'pages.json'), 'utf8'))
  expect(pages.pages.map((page: { pdfPage: number }) => page.pdfPage)).toEqual([1, 2, 3, 4, 5])
  const oracle = JSON.parse(await readFile(join(result.directory, 'oracle.json'), 'utf8'))
  expect(oracle.findings).toEqual([]); expect(oracle.economy.fields).toEqual([])
  const review = JSON.parse(await readFile(join(result.directory, 'human-review.json'), 'utf8'))
  expect(review.attestation).toBeNull(); expect(review.pages).toHaveLength(5); expect(review.economy).toHaveLength(9)
  expect((await lstat(result.directory)).mode & 0o777).toBe(0o700)
  expect((await lstat(join(result.directory, 'oracle.json'))).mode & 0o777).toBe(0o600)
  await expect(freezeRepresentativeOracle(caseId)).rejects.toThrow('representative-human-review-pending-or-invalid')
  await expect(loadFrozenRepresentativeCase(caseId)).rejects.toThrow('representative-oracle-not-frozen')
  await expect(prepareRepresentativeDocument({ sourcePath: fixture, caseId })).rejects.toThrow()
})
it('simulated complete review freezes immutable hashes and prepares private offline requests without keys or calls', async () => {
  const caseId = newCase(), environment = process.env, fetch = globalThis.fetch
  let keyReads = 0, networkCalls = 0
  process.env = new Proxy(environment, { get(target, key) { if (key === 'OPENAI_API_KEY') { keyReads++; throw new Error('key-forbidden') } return Reflect.get(target, key) } })
  globalThis.fetch = async () => { networkCalls++; throw new Error('network-forbidden') }
  try {
    const prepared = await simulatedReview(caseId), frozen = await freezeRepresentativeOracle(caseId)
    expect(frozen.receipt.humanAttestation).toBe('self-reported-before-model-output')
    expect(frozen.receipt.productionBenchmark).toBe(false)
    expect((await lstat(join(prepared.directory, 'freeze.json'))).mode & 0o777).toBe(0o400)
    const loaded = await loadFrozenRepresentativeCase(caseId)
    expect(loaded.basis.hash).toBe(frozenOracle.original.sha256); expect(loaded.oracle.findings).toEqual(frozenOracle.findings)
    await expect(freezeRepresentativeOracle(caseId)).rejects.toThrow()
    const result = await prepareLiveTest({ representativeCaseId: caseId })
    expect(result.ready).toBe(false); expect(result.externalCalls).toBe(0); expect(result.packet.startsWith(prepared.directory + '/preflight-')).toBe(true)
    const packet = JSON.parse(await readFile(result.packet, 'utf8'))
    expect(packet.purpose).toBe('private-representative-preflight'); expect(packet.productionBenchmark).toBe(false)
    expect(packet.reservationsCreated).toBe(0); expect(packet.budget.initializedByPreparation).toBe(false)
    expect(packet.tokenCount.externalCalls).toBe(0); expect(packet.tokenCount.serializationOnly).toBe(true)
    expect(await readFile(join(resolve(result.packet, '..'), 'count-request.json'), 'utf8')).toBe(packet.tokenCount.wire.body)
    await expect(prepareLiveTest({ representativeCaseId: caseId, outputDirectory: '/private/tmp/public-output' })).rejects.toThrow('representative-private-output-required')
    expect(keyReads).toBe(0); expect(networkCalls).toBe(0)
  } finally { process.env = environment; globalThis.fetch = fetch }
})
it('changed frozen review bytes cannot be consumed and altered source snapshots cannot be frozen', async () => {
  const caseId = newCase(), prepared = await simulatedReview(caseId)
  await freezeRepresentativeOracle(caseId)
  await writeFile(join(prepared.directory, 'human-review.json'), (await readFile(join(prepared.directory, 'human-review.json'), 'utf8')) + ' ')
  await expect(loadFrozenRepresentativeCase(caseId)).rejects.toThrow('representative-frozen-file-changed')
  const otherId = newCase(), other = await simulatedReview(otherId)
  const pagesPath = join(other.directory, 'pages.json')
  await chmod(pagesPath, 0o600)
  const pages = JSON.parse(await readFile(pagesPath, 'utf8')); pages.pages[0].text += ' changed'
  await writeFile(pagesPath, JSON.stringify(pages))
  await expect(freezeRepresentativeOracle(otherId)).rejects.toThrow('representative-physical-pages-mismatch')
})
it('rejects path escapes, forced tracked private paths and symlink files before private output can escape', async () => {
  await expect(prepareRepresentativeDocument({ sourcePath: fixture, caseId: '../public' })).rejects.toThrow('representative-case-id-invalid')
  const trackedId = newCase(); gitState.tracked = true
  await expect(prepareRepresentativeDocument({ sourcePath: fixture, caseId: trackedId })).rejects.toThrow('representative-private-path-tracked')
  gitState.tracked = false
  const caseId = newCase(), prepared = await simulatedReview(caseId)
  await rm(join(prepared.directory, 'oracle.json'))
  await symlink(fixture, join(prepared.directory, 'oracle.json'))
  await expect(freezeRepresentativeOracle(caseId)).rejects.toThrow('representative-private-file-unsafe')
  const linkId = newCase(), link = join(repository, 'private/representative-cases', linkId)
  await symlink(prepared.directory, link)
  await expect(loadFrozenRepresentativeCase(linkId)).rejects.toThrow(/representative-private-path-/)
  await expect(prepareRepresentativeDocument({ sourcePath: fixture, caseId: linkId })).rejects.toThrow()
})
it('rejects a missing ignore guard before creating any case or document files', async () => {
  const caseId = newCase(), directory = join(repository, 'private/representative-cases', caseId)
  gitState.ignored = false
  await expect(prepareRepresentativeDocument({ sourcePath: fixture, caseId })).rejects.toThrow('representative-private-path-not-ignored')
  await expect(lstat(directory)).rejects.toMatchObject({ code: 'ENOENT' })
  await expect(lstat(join(directory, 'original.pdf'))).rejects.toMatchObject({ code: 'ENOENT' })
})
it('compares controlled SDK output against actually frozen and loaded simulated expectations before corrections', async () => {
  const caseId = newCase(); await simulatedReview(caseId); await freezeRepresentativeOracle(caseId)
  const loaded = await loadFrozenRepresentativeCase(caseId)
  expect(loaded.receipt.humanAttestation).toBe('self-reported-before-model-output')
  expect(loaded.oracle.authoredBeforeComparison).toContain('Synthetic fixture and simulated human inputs')
  const result = await createCodeFirstImport(loaded.basis, sdkStub({ mutate: output => ({ ...output, economy: [...output.economy, { fieldId: 'sharedDebtPayment', amount: '1000', period: 'month', year: null, includedIn: 'commonCosts', debtPart: '1000', nature: 'fact', sources: output.economy[0]!.sources }] }) }))
  expect(DocumentImportSchema.safeParse(result).success).toBe(true)
  expect(compareWithOracle(result, loaded.oracle)).toEqual({ accepted: true, deviations: [] })
  const amount = structuredClone(result); amount.economy.fields.find(field => field.id === 'commonCosts')!.amount = '5001'
  expect(DocumentImportSchema.safeParse(amount).success).toBe(true)
  expect(compareWithOracle(amount, loaded.oracle).deviations.some(item => item.code === 'economy-value-or-relation')).toBe(true)
  const grade = structuredClone(result), roof = grade.technical.findings.find(finding => finding.component === 'tak')!
  roof.grade = 'TG2'; roof.original = { ...roof.original, grade: 'TG2' }
  for (const candidate of grade.manifest!.candidates) if (candidate.findingId === roof.findingId) { candidate.disposition = 'unresolved'; candidate.findingId = null }
  grade.technical.status = 'blocked'; grade.coverage.technical.status = 'incomplete'
  expect(DocumentImportSchema.safeParse(grade).success).toBe(true)
  expect(compareWithOracle(grade, loaded.oracle).deviations.some(item => item.code === 'wrong-grade')).toBe(true)
  const source = structuredClone(result), east = source.technical.findings.find(finding => finding.component === 'bad øst')!
  east.sources = east.sources.filter(item => item.pdfPage !== 4)
  expect(DocumentImportSchema.safeParse(source).success).toBe(true)
  expect(compareWithOracle(source, loaded.oracle).deviations.some(item => item.code === 'wrong-finding-source')).toBe(true)

  // Controlled equal labels/prose are frozen with distinct physical anchors, then result order is reversed.
  const equalCase = newCase(), equalPrepared = await simulatedReview(equalCase)
  const equalOracle: FrozenOracle = JSON.parse(await readFile(join(equalPrepared.directory, 'oracle.json'), 'utf8'))
  equalOracle.findings[1]!.component = equalOracle.findings[0]!.component
  equalOracle.findings[1]!.description = equalOracle.findings[0]!.description
  await writeFile(join(equalPrepared.directory, 'oracle.json'), JSON.stringify(equalOracle))
  await freezeRepresentativeOracle(equalCase)
  const equalLoaded = await loadFrozenRepresentativeCase(equalCase), equalResult = structuredClone(result)
  const west = equalResult.technical.findings.find(finding => finding.component === 'bad vest')!
  west.component = equalOracle.findings[1]!.component; west.description = equalOracle.findings[1]!.description
  west.original = { ...west.original, description: west.description }; equalResult.technical.findings.reverse()
  expect(DocumentImportSchema.safeParse(equalResult).success).toBe(true)
  expect(compareWithOracle(equalResult, equalLoaded.oracle)).toEqual({ accepted: true, deviations: [] })
})
