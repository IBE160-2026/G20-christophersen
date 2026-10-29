import { readFile, mkdir, writeFile } from 'node:fs/promises'
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

const fixtureRoot = resolve(import.meta.dirname, '../../../tests/fixtures/sales-prospectus')
/** Offline-only preparation: no environment key access, token endpoint, live adapter or quota init.
 * The only SDK invocation uses the mandatory local serialization capture stub.
 */
export async function prepareLiveTest(options: { outputDirectory?: string; budgetDirectory?: string } = {}) {
  const oracle = JSON.parse(await readFile(resolve(fixtureRoot, 'code-first-live-oracle.json'), 'utf8')) as FrozenOracle
  const bytes = await readFile(resolve(fixtureRoot, oracle.original.file))
  if (createHash('sha256').update(bytes).digest('hex') !== oracle.original.sha256) throw new Error('frozen-original-hash-mismatch')
  const format = await validatePdf(bytes, oracle.original.file, { maxPages: 200 })
  if (format.status !== 'format-validated') throw new Error('frozen-original-format-failure')
  const extracted = await extractImport(format)
  if (format.pageCount !== oracle.original.pageCount || createHash('sha256').update(JSON.stringify(extracted.pages)).digest('hex') !== oracle.original.pagesSha256) throw new Error('frozen-physical-pages-mismatch')
  const basis: ImportBasis = { hash: format.reportHash, name: format.documentName, role: 'prospectus', requestId: 'first-code-first-synthetic-trial-v1', parentHash: null, attachmentId: null, pages: extracted.pages, attachments: extracted.attachments }
  const plan = createLocalPlan(basis), request = createSemanticRequest(plan), wire = await captureSemanticWire(request)
  let ledger: AnalysisBudgetStore | undefined, historyError: string | undefined
  try { ledger = AnalysisBudgetStore.open(options.budgetDirectory ?? resolve('private/analysis-budgets'), basis.hash) }
  catch (error) { historyError = error instanceof Error ? error.message : 'budget-history-unavailable' }
  try {
    const assessment = assessLivePreflight(request, basis.hash, wire, { ledger, price: GLOBAL_STANDARD_PRICE, historyError })
    const packet = { version: 1, purpose: 'offline-synthetic-technical-trial', productionBenchmark: false, ...assessment,
      original: oracle.original, oracle, basis, request, wire,
      budget: { analysisId: basis.hash, capUsd: '0.20', history: ledger?.snapshot() ?? null, remainingUsd: ledger?.remaining() ?? null, initializedByPreparation: false },
      tokenizer: { verified: false, inputTokens: null, package: 'tiktoken 0.14.0', modelMapping: null, requestFraming: null, evidence: '.docs/implementation-artifacts/salgsoppgave-live-preflight-2026-10-29/local-tokenizer-probe.txt', reason: 'No Sol model mapping or documented full local framing; no encoding assumed.' },
      price: GLOBAL_STANDARD_PRICE, priceEvidence: GLOBAL_STANDARD_PRICE_EVIDENCE,
      externalCalls: 0, reservationsCreated: 0,
    }
    const directory = resolve(options.outputDirectory ?? 'private/salgsoppgave-live-preflight')
    await mkdir(directory, { recursive: true, mode: 0o700 })
    await writeFile(resolve(directory, 'packet.json'), JSON.stringify(packet, null, 2) + '\n', { mode: 0o600 })
    await writeFile(resolve(directory, 'request.json'), wire.body, { mode: 0o600 })
    return { ready: packet.ready, blockers: packet.blockers, requestDigest: semanticDigest(request), packet: resolve(directory, 'packet.json'), externalCalls: 0 }
  } finally { ledger?.close() }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv.length > 3) throw new Error('Usage: npm run prepare:live-test -- [output-directory]')
  console.log(JSON.stringify(await prepareLiveTest({ outputDirectory: process.argv[2] }), null, 2))
}
