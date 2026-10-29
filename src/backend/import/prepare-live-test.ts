import { readFile, mkdir, mkdtemp, realpath, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { validatePdf } from '../documents/validate-pdf.ts'
import { extractImport } from '../documents/extract-import.ts'
import { createLocalPlan } from './local-plan.ts'
import type { ImportBasis } from './local-plan.ts'
import { createSemanticRequest, semanticDigest } from './semantic-request.ts'
import { captureSemanticWire, assessLivePreflight } from './live-preflight.ts'
import { AnalysisBudgetStore } from './analysis-budget-store.ts'
import { GLOBAL_STANDARD_PRICE, GLOBAL_STANDARD_PRICE_EVIDENCE } from './budget.ts'
import type { FrozenOracle } from './oracle-comparison.ts'
import { createTokenCountRequest, captureTokenCountWire, COUNT_PRICE_EVIDENCE } from './token-count.ts'
import { loadFrozenRepresentativeCase } from './representative-intake.ts'

const fixtureRoot = resolve(import.meta.dirname, '../../../tests/fixtures/sales-prospectus')
/** Offline-only preparation: no environment key access, token endpoint, live adapter or quota init.
 * The only SDK invocation uses the mandatory local serialization capture stub.
 */
export async function prepareLiveTest(options: { outputDirectory?: string; budgetDirectory?: string; representativeCaseId?: string } = {}) {
  // Real source text, oracle and request may only be written inside their private case.
  if (options.representativeCaseId && (options.outputDirectory || options.budgetDirectory)) throw new Error('representative-private-output-required')
  const representative = options.representativeCaseId ? await loadFrozenRepresentativeCase(options.representativeCaseId) : null
  let oracle: FrozenOracle, basis: ImportBasis
  if (representative) {
    oracle = representative.oracle; basis = representative.basis
  } else {
    oracle = JSON.parse(await readFile(resolve(fixtureRoot, 'code-first-live-oracle.json'), 'utf8')) as FrozenOracle
    const bytes = await readFile(resolve(fixtureRoot, oracle.original.file))
    if (createHash('sha256').update(bytes).digest('hex') !== oracle.original.sha256) throw new Error('frozen-original-hash-mismatch')
    const format = await validatePdf(bytes, oracle.original.file, { maxPages: 200 })
    if (format.status !== 'format-validated') throw new Error('frozen-original-format-failure')
    const extracted = await extractImport(format)
    if (format.pageCount !== oracle.original.pageCount || createHash('sha256').update(JSON.stringify(extracted.pages)).digest('hex') !== oracle.original.pagesSha256) throw new Error('frozen-physical-pages-mismatch')
    basis = { hash: format.reportHash, name: format.documentName, role: 'prospectus', requestId: 'first-code-first-synthetic-trial-v1', parentHash: null, attachmentId: null, pages: extracted.pages, attachments: extracted.attachments }
  }
  const plan = createLocalPlan(basis)
  if (representative) {
    const reportPages = [...new Set(plan.sections.flatMap(section => Array.from({ length: section.endPage - section.startPage + 1 }, (_, index) => section.startPage + index)))].sort((a, b) => a - b)
    if (plan.sections.length !== 1 || plan.sections[0]?.certainty !== 'certain' || JSON.stringify(reportPages) !== JSON.stringify(oracle.reportPages)) throw new Error('representative-plan-report-mismatch')
  }
  const request = createSemanticRequest(plan), wire = await captureSemanticWire(request)
  const countRequest = createTokenCountRequest(request), countWire = await captureTokenCountWire(request)
  let ledger: AnalysisBudgetStore | undefined, historyError: string | undefined
  try { ledger = AnalysisBudgetStore.open(options.budgetDirectory ?? resolve('private/analysis-budgets'), basis.hash) }
  catch (error) { historyError = error instanceof Error ? error.message : 'budget-history-unavailable' }
  try {
    const assessment = assessLivePreflight(request, basis.hash, wire, { ledger, price: GLOBAL_STANDARD_PRICE, historyError })
    const packet = { version: 2, purpose: representative ? 'private-representative-preflight' : 'offline-synthetic-technical-trial', productionBenchmark: false, ...assessment,
      original: oracle.original, oracle, basis, request, wire,
      budget: { analysisId: basis.hash, capUsd: '0.20', history: ledger?.snapshot() ?? null, remainingUsd: ledger?.remaining() ?? null, initializedByPreparation: false },
      tokenizer: { verified: false, inputTokens: null, source: 'responses-input-tokens', status: 'not-called', reason: 'SDK support is verified offline; no actual server count was performed.' },
      tokenCount: { request: countRequest, wire: countWire, priceEvidence: COUNT_PRICE_EVIDENCE, externalCalls: 0, serializationOnly: true },
      price: GLOBAL_STANDARD_PRICE, priceEvidence: GLOBAL_STANDARD_PRICE_EVIDENCE,
      externalCalls: 0, reservationsCreated: 0,
    }
    if (representative && await realpath(representative.directory) !== representative.directory) throw new Error('representative-private-path-unsafe')
    const directory = representative ? await mkdtemp(resolve(representative.directory, 'preflight-')) : resolve(options.outputDirectory ?? 'private/salgsoppgave-live-preflight')
    if (representative) {
      if (await realpath(directory) !== directory) throw new Error('representative-private-path-unsafe')
    } else await mkdir(directory, { recursive: true, mode: 0o700 })
    const fileOptions = { mode: 0o600, flag: representative ? 'wx' : 'w' }
    await writeFile(resolve(directory, 'packet.json'), JSON.stringify(packet, null, 2) + '\n', fileOptions)
    await writeFile(resolve(directory, 'request.json'), wire.body, fileOptions)
    await writeFile(resolve(directory, 'count-request.json'), countWire.body, fileOptions)
    return { ready: packet.ready, blockers: packet.blockers, requestDigest: semanticDigest(request), packet: resolve(directory, 'packet.json'), externalCalls: 0 }
  } finally { ledger?.close() }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2)
  if (args[0] === '--representative-case' && args.length === 2) console.log(JSON.stringify(await prepareLiveTest({ representativeCaseId: args[1] }), null, 2))
  else if (args.length <= 1 && !args[0]?.startsWith('--')) console.log(JSON.stringify(await prepareLiveTest({ outputDirectory: args[0] }), null, 2))
  else throw new Error('Usage: npm run prepare:live-test -- [output-directory] | --representative-case <case-id>')
}
