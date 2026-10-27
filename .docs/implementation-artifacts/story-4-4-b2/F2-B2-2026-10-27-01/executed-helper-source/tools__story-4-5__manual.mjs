// Local evidence preparation/server only. No browser automation or automatic analysis.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { resolve, join, relative } from 'node:path'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { createServer } from 'node:http'
import express from 'express'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'
import { extractPdf } from '../../src/backend/documents/extract-pdf.ts'
import { createLiveRequest } from '../../src/backend/analysis/live-request.ts'
import { createAnalysisRouter } from '../../src/backend/http/analysis-route.ts'
import { projectCost } from '../story-4-4/project-ledger.mjs'

export const attemptId = 'S5-2026-10-24-F1-01'
export const repository = fileURLToPath(new URL('../../', import.meta.url))
export const evidenceDirectory = join(repository, '.docs/implementation-artifacts/story-4-5', attemptId)
export const hash = value => createHash('sha256').update(value).digest('hex')
export const read = file => JSON.parse(readFileSync(file, 'utf8'))
export const write = (directory, name, value) => writeFileSync(join(directory, name), JSON.stringify(value, null, 2) + '\n', { flag: 'wx', mode: 0o600 })

// Bind both executable helper/application source and the actual built frontend.
export function fingerprint(root) {
  const files = ['package.json', 'package-lock.json']
  for (const directory of ['src', 'dist', 'tools/story-4-5', 'tools/story-4-4']) {
    for (const entry of readdirSync(join(root, directory), { recursive: true, withFileTypes: true })) {
      if (entry.isFile()) files.push(relative(root, join(entry.parentPath, entry.name)))
    }
  }
  return hash(JSON.stringify(files.sort().map(file => [file, hash(readFileSync(join(root, file)))])))
}

export async function prepare(root = repository, directory = evidenceDirectory) {
  const fixture = join(root, 'tests/fixtures/property-cases/F1-tilstandsrapport.pdf')
  const bytes = readFileSync(fixture)
  const reportHash = hash(bytes)
  if (reportHash !== 'c3a92dc24004601803928b5ad479165d042cf199f099e190d40b732a58a388cb') throw new Error('Unexpected F1 fixture')
  const format = await validatePdf(bytes, 'F1-tilstandsrapport.pdf')
  if (format.status !== 'format-validated') throw new Error('F1 format failed')
  const { document } = await extractPdf(format, { requestId: attemptId, mode: 'live' })
  const request = createLiveRequest(document)
  const serialized = JSON.stringify(request)
  if (Buffer.byteLength(serialized) > 100000) throw new Error('Reassess input reservation')
  const old = join(root, '.docs/implementation-artifacts/story-4-4')
  const costBeforeUsd = projectCost(root)
  const sourceFingerprint = fingerprint(root)
  const preparedCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
  mkdirSync(resolve(directory, '..'), { recursive: true })
  // Never reuse even an empty existing attempt directory.
  mkdirSync(directory)
  write(directory, 'expected-request.json', request)
  const plan = { attemptId, armed: false, accountStatus: 'pending', gateStatus: 'pending',
    preparedAt: new Date().toISOString(), preparedCommit, sourceFingerprint,
    reportHash, documentName: document.documentName, oracleSha256: hash(readFileSync(join(root, 'tests/fixtures/property-cases/expected.json'))),
    requestSha256: hash(serialized), inputReservationTokens: 100000, outputReservationTokens: 128000,
    historicalCostBeforeUsd: costBeforeUsd, reservationUsd: 1.53, r1LimitUsd: 20,
    globalLock: join(old, 'active-paid-request.lock'), model: request.model,
    sdk: '6.9.1', promptVersion: '1', schemaVersion: '1', contractVersion: '2', extractionVersion: '1',
    maxRetries: 0, timeoutMs: 120000 }
  write(directory, 'plan.json', plan)
  return plan
}

export function validateApproval(plan, approval) {
  if (plan.attemptId !== attemptId || plan.armed !== false || approval.attemptId !== attemptId
    || approval.requestSha256 !== plan.requestSha256 || approval.sourceFingerprint !== plan.sourceFingerprint
    || approval.owner !== 'Mads' || !/^[a-f0-9]{40}$/.test(approval.codeCommit ?? '')
    || !Number.isFinite(Date.parse(approval.checkedAt ?? ''))) throw new Error('Approval identity missing or changed')
  for (const field of ['gateClosed', 'humanInitiationOnly', 'measurementMethodDefined', 'regressionPassed', 'accountVerified', 'unknownChargesResolved', 'rootExplicitApproval']) {
    if (approval[field] !== true) throw new Error(`Approval pending: ${field}`)
  }
  for (const field of ['gateEvidence', 'methodEvidence', 'accountEvidence']) {
    const evidence = approval[field]
    if (!evidence || typeof evidence.path !== 'string' || !/^[a-f0-9]{64}$/.test(evidence.sha256 ?? '')
      || hash(readFileSync(evidence.path)) !== evidence.sha256) throw new Error(`Missing dated evidence: ${field}`)
  }
  if (typeof approval.priceSource !== 'string' || !approval.priceSource.startsWith('https://developers.openai.com/')
    || approval.inputUsdPerMillion !== 2 || approval.outputUsdPerMillion !== 10
    || approval.cachedUsdPerMillion !== 0.1 || approval.cacheWriteUsdPerMillion !== 2.5) throw new Error('Price must be verified against current cost routine')
  for (const field of ['costBeforeUsd', 'reservationUsd', 'accountLimitUsd', 'availableUsd']) {
    if (typeof approval[field] !== 'number' || !Number.isFinite(approval[field]) || approval[field] < 0) throw new Error('Unverified budget')
  }
  if (approval.costBeforeUsd < plan.historicalCostBeforeUsd || approval.reservationUsd < plan.reservationUsd
    || approval.costBeforeUsd + approval.reservationUsd > Math.min(approval.accountLimitUsd, plan.r1LimitUsd)
    || approval.reservationUsd > approval.availableUsd) throw new Error('Insufficient reconciled budget')
  return approval
}

export function validateSourceBinding(root, plan, approval) {
  if (fingerprint(root) !== plan.sourceFingerprint) throw new Error('Code/build changed')
  // Immutable code evidence may be followed by documentation/receipt commits.
  // The exact executable source/build fingerprint remains authoritative.
  execFileSync('git', ['merge-base', '--is-ancestor', approval.codeCommit, 'HEAD'], { cwd: root, stdio: 'pipe' })
}

export function arm(approvalFile, root = repository, directory = evidenceDirectory) {
  const plan = read(join(directory, 'plan.json'))
  const approval = validateApproval(plan, read(approvalFile))
  if (existsSync(plan.globalLock)) throw new Error('Global paid lock unresolved')
  validateSourceBinding(root, plan, approval)
  write(directory, 'armed.json', { ...approval, armed: true })
}

export function createManualServer({ directory = evidenceDirectory, root = repository, armed = false, onLifecycle } = {}) {
  const plan = read(join(directory, 'plan.json'))
  if (plan.attemptId !== attemptId || fingerprint(root) !== plan.sourceFingerprint) throw new Error('Prepared source/build changed')
  if (armed) {
    const approval = read(join(directory, 'armed.json'))
    validateApproval(plan, approval)
    if (approval.armed !== true) throw new Error('Arming invalid')
    validateSourceBinding(root, plan, approval)
  }
  const app = express()
  let attempted = false
  const transport = new URL('./transport.mjs', import.meta.url)
  transport.searchParams.set('directory', directory)
  const analysis = createAnalysisRouter({ mode: 'live', transportModule: transport.href, onLifecycle })
  app.disable('x-powered-by')
  // No arming route. Unarmed POST never enters upload parsing/pipeline/provider.
  app.post('/api/analysis', (request, response, next) => {
    if (!armed || attempted) {
      request.resume()
      response.setHeader('Connection', 'close')
      response.status(409).json({ kind: 'rejected', code: 'processing-failure' })
      return
    }
    try {
      if (fingerprint(root) !== plan.sourceFingerprint) throw new Error('Changed source')
      write(directory, 'analysis-attempt.json', { at: new Date().toISOString(), attemptId })
    } catch {
      request.resume(); response.status(409).json({ kind: 'rejected', code: 'processing-failure' }); return
    }
    attempted = true
    const send = response.json.bind(response)
    response.json = body => {
      try { write(directory, 'outcome.json', { at: new Date().toISOString(), httpStatus: response.statusCode, body }) }
      catch { response.destroy(); return response }
      return send(body)
    }
    next()
  })
  app.use('/api', analysis)
  app.use('/api', (_request, response) => { response.sendStatus(404) })
  app.use(express.static(join(root, 'dist'), { dotfiles: 'deny', redirect: false, fallthrough: false }))
  app.use((_error, _request, response, _next) => { response.status(404).send('Ressursen er ikke tilgjengelig.') })
  const server = createServer(app)
  return { server, async stop() {
    const closed = server.listening ? new Promise(resolve => server.close(resolve)) : Promise.resolve()
    server.closeAllConnections()
    await analysis.stop()
    await closed
  } }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, argument] = process.argv.slice(2)
  try {
    if (command === 'prepare' && !argument) { await prepare(); console.log('Prepared F1: armed:false, gate/account pending. No analysis started.') }
    else if (command === 'arm' && argument) { arm(resolve(argument)); console.log('Explicit local approval saved. Restart serve-armed only after human checkpoint.') }
    else if (['serve-unarmed', 'serve-armed'].includes(command) && !argument) {
      const instance = createManualServer({ armed: command === 'serve-armed' })
      instance.server.once('error', async () => { await instance.stop(); process.exitCode = 1; console.error('Local server could not bind.') })
      for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => { await instance.stop(); process.exit(0) })
      instance.server.listen(3000, '127.0.0.1', () => console.log(`F1 ${command} http://127.0.0.1:3000; no analysis started.`))
    } else throw new Error('Use prepare | serve-unarmed | arm <approval.json> | serve-armed')
  } catch { console.error('Manual F1 preparation/server failed safely. Inspect local evidence; no automatic retry.'); process.exitCode = 1 }
}
