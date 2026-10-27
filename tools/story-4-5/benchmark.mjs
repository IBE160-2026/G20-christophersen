// Local, explicit S5 benchmark preparation. Never starts analysis or human control.
import { readFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'
import { extractPdf } from '../../src/backend/documents/extract-pdf.ts'
import { createLiveRequest } from '../../src/backend/analysis/live-request.ts'
import { FinancialBasisSchema } from '../../src/contracts/financial-basis.ts'
import { validateFinancialBasis } from '../../src/domain/financial-basis.ts'
import { repository, fingerprint, hash, read, write, validateApproval, validateSourceBinding, createManualServer } from './manual.mjs'
import { projectCost, projectLedger } from '../story-4-4/project-ledger.mjs'
import { requireLockOwner, releaseOwnedLock } from '../story-4-4/run-safety.mjs'

export const caseId = 'S5-B1-v1'
export const attemptId = 'S5-2026-10-27-S5-B1-v1-01'
export const evidenceDirectory = join(repository, '.docs/implementation-artifacts/story-4-5', attemptId)
const manifestSha256 = '2ca29ecc2a2a9db5ec53de64a60c3f6bb97fc46f82bc441e8a39eb503a711c65'
const benchmarkPath = 'tests/fixtures/s5-benchmark/S5-B1-v1'
const reportName = 'S5-B1-v1-tilstandsrapport.pdf'
const commit = root => execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()

export function validateBenchmark(root = repository) {
  const directory = join(root, benchmarkPath)
  const manifestBytes = readFileSync(join(directory, 'manifest.json'))
  if (hash(manifestBytes) !== manifestSha256) throw new Error('Frozen benchmark manifest changed')
  const manifest = JSON.parse(manifestBytes)
  const files = {}
  for (const name of [reportName, 'expected.json', 'financial-inputs.json', 'report-source.json', 'generate.py', 'README.md']) {
    if (manifest.files[name]?.path !== name) throw new Error('Unexpected benchmark path')
    const sha256 = hash(readFileSync(join(directory, name)))
    if (sha256 !== manifest.files[name].sha256) throw new Error('Frozen benchmark asset changed')
    files[name] = sha256
  }
  const finance = FinancialBasisSchema.parse(read(join(directory, 'financial-inputs.json')).basis)
  if (validateFinancialBasis(finance).issues.length) throw new Error('Invalid frozen financial basis')
  return { directory, manifestSha256, files }
}

export async function prepare(root = repository, directory = evidenceDirectory) {
  const benchmark = validateBenchmark(root)
  const costBeforeUsd = projectCost(root)
  const format = await validatePdf(readFileSync(join(benchmark.directory, reportName)), reportName)
  if (format.status !== 'format-validated' || format.pageCount !== 14) throw new Error('Invalid benchmark PDF')
  const { document } = await extractPdf(format, { requestId: attemptId, mode: 'live' })
  // Only the real PDF.js DocumentBasis enters production createLiveRequest.
  // Oracle and finance are hashed for case binding, never added to model input.
  const request = createLiveRequest(document)
  const serialized = JSON.stringify(request)
  if (Buffer.byteLength(serialized) > 100000) throw new Error('Input reservation insufficient')
  const plan = { attemptId, caseId, armed: false, accountStatus: 'pending', gateStatus: 'pending',
    preparedAt: new Date().toISOString(), preparedCommit: commit(root), sourceFingerprint: fingerprint(root),
    projectRoot: root, benchmarkPath, benchmarkManifestSha256: benchmark.manifestSha256, benchmarkFiles: benchmark.files,
    documentName: reportName, reportHash: document.reportHash, oracleSha256: benchmark.files['expected.json'],
    financialSha256: benchmark.files['financial-inputs.json'], requestSha256: hash(serialized),
    serializedRequestBytes: Buffer.byteLength(serialized), inputReservationTokens: 100000, outputReservationTokens: 128000,
    costBeforeUsd, historicalCostBeforeUsd: costBeforeUsd, reservationUsd: 1.53, r1LimitUsd: 20,
    globalLock: join(root, '.docs/implementation-artifacts/story-4-4/active-paid-request.lock'),
    model: request.model, sdk: '6.9.1', promptVersion: '1', schemaVersion: '1', contractVersion: '2', extractionVersion: '1',
    maxRetries: 0, timeoutMs: 120000 }
  mkdirSync(resolve(directory, '..'), { recursive: true })
  mkdirSync(directory) // exclusive attempt identity, including after interruption
  write(directory, 'basis.json', document)
  write(directory, 'expected-request.json', request)
  write(directory, 'plan.json', plan)
  return plan
}

export function validatePlan(root, directory) {
  const plan = read(join(directory, 'plan.json'))
  const benchmark = validateBenchmark(root)
  if (plan.attemptId !== attemptId || plan.caseId !== caseId || plan.projectRoot !== root
    || plan.benchmarkManifestSha256 !== benchmark.manifestSha256
    || JSON.stringify(plan.benchmarkFiles) !== JSON.stringify(benchmark.files)
    || plan.reportHash !== benchmark.files[reportName] || plan.documentName !== reportName
    || plan.oracleSha256 !== benchmark.files['expected.json'] || plan.financialSha256 !== benchmark.files['financial-inputs.json']
    || plan.requestSha256 !== hash(JSON.stringify(read(join(directory, 'expected-request.json'))))) throw new Error('Prepared benchmark binding changed')
  return plan
}

export function validateBenchmarkApproval(root, directory, { checkLedger = true } = {}) {
  const plan = validatePlan(root, directory)
  const approval = validateApproval(plan, read(join(directory, 'armed.json')), attemptId)
  if (approval.armed !== true || approval.caseId !== caseId || approval.reportHash !== plan.reportHash
    || approval.benchmarkManifestSha256 !== plan.benchmarkManifestSha256
    || approval.oracleSha256 !== plan.oracleSha256 || approval.financialSha256 !== plan.financialSha256
    || Date.now() - Date.parse(approval.checkedAt) > 86400000 || Date.parse(approval.checkedAt) > Date.now() + 60000
    || approval.reservationUsd !== 1.53 || approval.accountLimitUsd !== 2 || approval.costBeforeUsd !== plan.costBeforeUsd) throw new Error('Benchmark approval changed, stale or unbound')
  validateSourceBinding(root, plan, approval)
  if (checkLedger && Math.abs(projectCost(root) - approval.costBeforeUsd) > 1e-12) throw new Error('Project ledger changed')
  return { plan, approval }
}

export function arm(approvalFile, root = repository, directory = evidenceDirectory) {
  // Validate without publishing an armed marker on any failure.
  const plan = validatePlan(root, directory)
  const approval = validateApproval(plan, read(approvalFile), attemptId)
  if (existsSync(plan.globalLock) || Math.abs(projectCost(root) - plan.costBeforeUsd) > 1e-12) throw new Error('Global lock or ledger unresolved')
  if (approval.caseId !== caseId || approval.reportHash !== plan.reportHash
    || approval.benchmarkManifestSha256 !== plan.benchmarkManifestSha256 || approval.oracleSha256 !== plan.oracleSha256
    || approval.financialSha256 !== plan.financialSha256 || approval.costBeforeUsd !== plan.costBeforeUsd
    || approval.reservationUsd !== 1.53 || approval.accountLimitUsd !== 2
    || Date.now() - Date.parse(approval.checkedAt) > 86400000 || Date.parse(approval.checkedAt) > Date.now() + 60000) throw new Error('Benchmark approval not current and case-bound')
  validateSourceBinding(root, plan, approval)
  write(directory, 'armed.json', { ...approval, armed: true })
}

export function createServer({ root = repository, directory = evidenceDirectory, armed = false, onLifecycle } = {}) {
  return createManualServer({ root, directory, armed, onLifecycle, expectedAttemptId: attemptId,
    transportFile: new URL('./benchmark-transport.mjs', import.meta.url),
    validateBinding: needsApproval => needsApproval ? validateBenchmarkApproval(root, directory) : validatePlan(root, directory) })
}

export function reconcile(root = repository, directory = evidenceDirectory) {
  const plan = validatePlan(root, directory)
  const dispatch = read(join(directory, 'dispatch.json'))
  if (dispatch.owner?.fixtureId !== caseId) throw new Error('Wrong cost owner')
  if (existsSync(plan.globalLock)) requireLockOwner(plan.globalLock, dispatch.owner)
  const ledger = projectLedger(root, { allowOwnedLock: true })
  const receipt = read(join(directory, 'receipt.json'))
  if (Math.abs(ledger.beforeCosts[attemptId] - plan.costBeforeUsd) > 1e-12 || ledger.beforeCosts[attemptId] === undefined) throw new Error('Unresolved cost chain')
  const record = { owner: dispatch.owner, receiptSha256: hash(readFileSync(join(directory, 'receipt.json'))),
    costUsd: receipt.costUsd, cumulativeProjectUsd: receipt.cumulativeProjectUsd, costOnly: true }
  if (existsSync(join(directory, 'reconciled.json'))) {
    if (JSON.stringify(read(join(directory, 'reconciled.json'))) !== JSON.stringify(record)) throw new Error('Reconciliation changed')
  } else {
    if (!existsSync(plan.globalLock)) throw new Error('Missing owned lock and reconciliation')
    write(directory, 'reconciled.json', record)
  }
  if (existsSync(plan.globalLock)) releaseOwnedLock(plan.globalLock, dispatch.owner)
  return record
}

// Optional technical prefill only. No confirmation, navigation, upload or analysis.
export async function prefillFinancialFields(page, root = repository) {
  validateBenchmark(root)
  const { basis } = read(join(root, benchmarkPath, 'financial-inputs.json'))
  for (const [field, value] of Object.entries(basis.values)) {
    await page.locator(`#value-${field}`).fill(value.rawValue)
    await page.locator(`#source-kind-${field}`).selectOption(basis.sources[field].kind)
    await page.locator(`#source-${field}`).fill(basis.sources[field].description)
    if (['L', 'D', 'J'].includes(field)) {
      await page.locator(`#period-${field}`).selectOption(value.period)
      await page.locator(`#year-${field}`).fill(value.year)
    }
  }
  await page.locator('#rent-nature-L').selectOption('expected')
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [command, argument] = process.argv.slice(2)
    if (command === 'prepare' && !argument) { await prepare(); console.log('Benchmark klargjort uarmet. Ingen analyse startet.') }
    else if (command === 'arm' && argument) { arm(resolve(argument)); console.log('Lokal godkjenning lagret. Ingen analyse startet.') }
    else if (command === 'reconcile' && !argument) { reconcile(); console.log('Bare kjent kost avstemt; ingen menneskelig kontroll attestert.') }
    else if (['serve-unarmed', 'serve-armed'].includes(command) && !argument) {
      const instance = createServer({ armed: command === 'serve-armed' })
      instance.server.once('error', async () => { await instance.stop(); process.exitCode = 1; console.error('Lokal oppstart feilet.') })
      for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => { await instance.stop(); process.exit(0) })
      instance.server.listen(3000, '127.0.0.1', () => console.log(`S5-B1-v1 ${command}: http://127.0.0.1:3000. Ingen analyse startet.`))
    } else if (command === 'open-setup' && !argument) {
      validatePlan(repository, evidenceDirectory)
      const { chromium } = await import('@playwright/test')
      const environment = { ...process.env }; delete environment.OPENAI_API_KEY; delete environment.ANALYSIS_MODE
      const browser = await chromium.launch({ channel: 'chrome', headless: false, env: environment })
      const page = await browser.newPage()
      await page.route('**/*', route => route.request().url().startsWith('http://127.0.0.1:3000/') && route.request().method() === 'GET' ? route.continue() : route.abort())
      await page.goto('http://127.0.0.1:3000/')
      await prefillFinancialFields(page)
      // Remove setup-only interception so Mads may later initiate the normal POST.
      await page.unroute('**/*')
      console.log('Bare registreringsfelter er fylt. Mads bekrefter selv; ingen rapport lastet opp eller analyse startet.')
      await new Promise(resolve => browser.once('disconnected', resolve))
    } else throw new Error('Ugyldig kommando')
  } catch { console.error('Benchmark-klargjøring stoppet trygt. Ingen automatisk gjentakelse.'); process.exitCode = 1 }
}
