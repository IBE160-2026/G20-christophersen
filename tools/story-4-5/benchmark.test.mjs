// Temporary synthetic approval/usage only; real key absent and external network blocked.
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, mkdirSync, cpSync, symlinkSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { repository, read, write, hash } from './manual.mjs'
import { caseId, attemptId, prepare, arm, validateBenchmark, validateBenchmarkApproval, createServer, reconcile, prefillFinancialFields } from './benchmark.mjs'
import { createObservedFetch } from './benchmark-transport.mjs'
import { projectCost } from '../story-4-4/project-ledger.mjs'
import { createOwnedLock, releaseOwnedLock, usageCost } from '../story-4-4/run-safety.mjs'

const benchmarkPath = 'tests/fixtures/s5-benchmark/S5-B1-v1'
const usage = { input_tokens: 100, output_tokens: 10, total_tokens: 110,
  input_tokens_details: { cached_tokens: 0, cache_write_tokens: 0 }, output_tokens_details: { reasoning_tokens: 0 } }
const currentCost = 0.023092
const git = (root, ...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: 'pipe' }).trim()
function temporary(t) {
  const root = mkdtempSync(join(tmpdir(), 's5-benchmark-offline-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  for (const name of ['src', 'tools/story-4-5', 'tools/story-4-4']) mkdirSync(join(root, name), { recursive: true })
  symlinkSync(join(repository, 'dist'), join(root, 'dist'))
  for (const name of ['package.json', 'package-lock.json']) cpSync(join(repository, name), join(root, name))
  cpSync(join(repository, benchmarkPath), join(root, benchmarkPath), { recursive: true })
  const historical = '.docs/implementation-artifacts/story-4-4'
  mkdirSync(join(root, historical), { recursive: true })
  for (const name of ['preflight-result.json', ...['F1', 'F2', 'F3', 'F4'].map(id => `${id}-receipt.json`)]) cpSync(join(repository, historical, name), join(root, historical, name))
  const b2 = '.docs/implementation-artifacts/story-4-4-b2'
  mkdirSync(join(root, b2), { recursive: true })
  for (const id of ['F1-B2-2026-10-27-01', 'F2-B2-2026-10-27-01']) {
    mkdirSync(join(root, b2, id))
    for (const file of ['plan.json', 'receipt.json', 'usage.json']) cpSync(join(repository, b2, id, file), join(root, b2, id, file))
  }
  git(root, 'init')
  git(root, 'add', '.')
  git(root, '-c', 'user.name=Offline Test', '-c', 'user.email=offline@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-m', 'Synthetic temporary test repository')
  return root
}
function approvalFor(root, directory, plan) {
  const proof = join(root, 'synthetic-offline-evidence.txt')
  writeFileSync(proof, 'SYNTHETIC OFFLINE TEST ONLY. No real approval, account or human measurement.')
  const reference = { path: proof, sha256: hash(readFileSync(proof)) }
  return { caseId, attemptId, requestSha256: plan.requestSha256, sourceFingerprint: plan.sourceFingerprint,
    reportHash: plan.reportHash, benchmarkManifestSha256: plan.benchmarkManifestSha256,
    oracleSha256: plan.oracleSha256, financialSha256: plan.financialSha256,
    owner: 'Mads', codeCommit: git(root, 'rev-parse', 'HEAD'), checkedAt: new Date().toISOString(),
    gateClosed: true, humanInitiationOnly: true, measurementMethodDefined: true, rootExplicitApproval: true,
    regressionPassed: true, accountVerified: true, unknownChargesResolved: true,
    gateEvidence: reference, methodEvidence: reference, accountEvidence: reference,
    priceSource: 'https://developers.openai.com/api/docs/models/gpt-6.1-sol',
    inputUsdPerMillion: 2, outputUsdPerMillion: 10, cachedUsdPerMillion: 0.1, cacheWriteUsdPerMillion: 2.5,
    costBeforeUsd: plan.costBeforeUsd, reservationUsd: 1.53, accountLimitUsd: 2, availableUsd: 2 - plan.costBeforeUsd }
}
async function setup(t, armed = false) {
  const root = temporary(t)
  const directory = join(root, '.docs/implementation-artifacts/story-4-5', attemptId)
  const plan = await prepare(root, directory)
  const approval = approvalFor(root, directory, plan)
  const approvalFile = join(root, 'synthetic-approval.json')
  writeFileSync(approvalFile, JSON.stringify(approval))
  if (armed) arm(approvalFile, root, directory)
  return { root, directory, plan, approval, approvalFile }
}
async function listen(instance) {
  await new Promise((resolve, reject) => { instance.server.once('error', reject); instance.server.listen(0, '127.0.0.1', resolve) })
  return `http://127.0.0.1:${instance.server.address().port}`
}
const initFor = request => ({ method: 'POST', body: JSON.stringify(request), headers: { authorization: 'Bearer NOT-FOR-EVIDENCE' } })
function response(body = { status: 'completed', model: 'gpt-6.1-sol', service_tier: 'default', usage, output: [] }) {
  return new Response(JSON.stringify(body), { headers: { 'set-cookie': 'NOT-FOR-EVIDENCE' } })
}

test('prepare binds all frozen assets and only PDF.js text enters provider request; no overwrite', async t => {
  const { root, directory, plan } = await setup(t)
  assert.equal(plan.armed, false)
  assert.equal(plan.caseId, caseId)
  assert.ok(Math.abs(plan.costBeforeUsd - currentCost) < 1e-12)
  assert.equal(Object.keys(plan.benchmarkFiles).length, 6)
  const basis = read(join(directory, 'basis.json'))
  const request = read(join(directory, 'expected-request.json'))
  assert.equal(basis.pageCount, 14)
  assert.equal(basis.pages.length, 14)
  assert.deepEqual(JSON.parse(request.input[0].content[0].text), basis)
  assert.equal(hash(JSON.stringify(request)), plan.requestSha256)
  assert.doesNotMatch(JSON.stringify(request), /expectedCoverage|costItems|rawValue|S5-B1-v1-TG[23]-|rentNature|financialAssumptions/)
  assert.equal(JSON.stringify(request).includes('confirmed'), false)
  await assert.rejects(prepare(root, directory))
  assert.throws(() => write(directory, 'plan.json', {}))
  assert.equal(validateBenchmark(root).manifestSha256, plan.benchmarkManifestSha256)
})
test('frozen PDF/oracle/financial change and stale/cross-case/source approvals reject before arming', async t => {
  const { root, directory, plan, approval, approvalFile } = await setup(t)
  for (const delta of [{ reportHash: 'wrong' }, { caseId: 'F1' }, { financialSha256: 'wrong' },
    { checkedAt: '2020-01-01T00:00:00Z' }, { sourceFingerprint: 'wrong' }, { costBeforeUsd: 0.016072 }]) {
    writeFileSync(approvalFile, JSON.stringify({ ...approval, ...delta }))
    assert.throws(() => arm(approvalFile, root, directory))
    assert.equal(existsSync(join(directory, 'armed.json')), false)
  }
  for (const name of ['S5-B1-v1-tilstandsrapport.pdf', 'expected.json', 'financial-inputs.json']) {
    const file = join(root, benchmarkPath, name), bytes = readFileSync(file)
    writeFileSync(file, Buffer.concat([bytes, Buffer.from('changed')]))
    assert.throws(() => validateBenchmark(root))
    writeFileSync(file, bytes)
  }
  assert.equal(validateBenchmark(root).manifestSha256, plan.benchmarkManifestSha256)
})
test('unarmed GET is free and unarmed POST never enters pipeline or creates attempt evidence', async t => {
  const { root, directory } = await setup(t)
  const events = []
  const instance = createServer({ root, directory, onLifecycle: event => events.push(event) })
  t.after(() => instance.stop())
  const url = await listen(instance)
  assert.equal((await fetch(url)).status, 200)
  assert.deepEqual(await (await fetch(`${url}/api/analysis-config`)).json(), { mode: 'live' })
  assert.equal((await fetch(`${url}/api/analysis`, { method: 'POST', body: 'blocked' })).status, 409)
  assert.equal((await fetch(`${url}/api/arm`, { method: 'POST' })).status, 404)
  assert.deepEqual(events, [])
  assert.equal(existsSync(join(directory, 'analysis-attempt.json')), false)
  assert.equal(existsSync(join(directory, 'dispatch.json')), false)
})
test('armed POST and restart are one-shot without attesting human controls', async t => {
  const { root, directory } = await setup(t, true)
  const instance = createServer({ root, directory, armed: true })
  t.after(() => instance.stop())
  const url = await listen(instance)
  assert.equal((await fetch(`${url}/api/analysis`, { method: 'POST', body: 'no correlation' })).status, 400)
  assert.equal((await fetch(`${url}/api/analysis`, { method: 'POST', body: 'duplicate' })).status, 409)
  await instance.stop()
  const restart = createServer({ root, directory, armed: true })
  t.after(() => restart.stop())
  const restartedUrl = await listen(restart)
  assert.equal((await fetch(`${restartedUrl}/api/analysis`, { method: 'POST', body: 'restart' })).status, 409)
  assert.equal(existsSync(join(directory, 'receipt.json')), false)
})
test('wrong report/request and stale approval reject before fetch/lock', async t => {
  const { root, directory, plan, approval } = await setup(t, true)
  let calls = 0
  const observe = createObservedFetch(directory, async () => { calls++; return response() })
  const request = read(join(directory, 'expected-request.json'))
  const wrong = structuredClone(request)
  const basis = JSON.parse(wrong.input[0].content[0].text); basis.reportHash = 'F1'
  wrong.input[0].content[0].text = JSON.stringify(basis)
  await assert.rejects(observe('https://api.openai.com/v1/responses', initFor(wrong)))
  await assert.rejects(observe('https://api.openai.com/v1/responses', initFor({ ...request, model: 'changed' })))
  writeFileSync(join(directory, 'armed.json'), JSON.stringify({ ...approval, armed: true, checkedAt: '2020-01-01T00:00:00Z' }))
  await assert.rejects(observe('https://api.openai.com/v1/responses', initFor(request)))
  assert.equal(calls, 0)
  assert.equal(existsSync(plan.globalLock), false)
  assert.equal(validateBenchmark(root).files[plan.documentName], plan.reportHash)
})
test('unchanged original request/response, cost-only receipt and ledger survive absent UI; owner reconcile is idempotent', async t => {
  const { root, directory, plan } = await setup(t, true)
  const request = read(join(directory, 'expected-request.json'))
  const basis = JSON.parse(request.input[0].content[0].text); basis.requestId = 'actual-user-request'
  request.input[0].content[0].text = JSON.stringify(basis)
  const init = initFor(request)
  const original = JSON.stringify({ status: 'completed', model: plan.model, service_tier: 'default', usage, output: [] })
  let calls = 0
  const observe = createObservedFetch(directory, async (_url, actual) => { calls++; assert.strictEqual(actual, init); return new Response(original) })
  assert.equal(await (await observe('https://api.openai.com/v1/responses', init)).text(), original)
  await assert.rejects(observe('https://api.openai.com/v1/responses', init))
  assert.equal(calls, 1)
  assert.deepEqual(read(join(directory, 'request.json')), request)
  assert.deepEqual(read(join(directory, 'provider-body.json')), JSON.parse(original))
  const receipt = read(join(directory, 'receipt.json'))
  assert.equal(receipt.costOnly, true); assert.equal(receipt.s5Measured, false)
  assert.equal(receipt.humanControlStatus, 'not-recorded'); assert.equal(receipt.uiControlCompleted, undefined)
  assert.equal(existsSync(join(directory, 'outcome.json')), false)
  assert.throws(() => projectCost(root)) // active owner lock still retained
  assert.ok(Math.abs(projectCost(root, { allowOwnedLock: true }) - (currentCost + usageCost(usage))) < 1e-12)
  const ownerFile = join(plan.globalLock, 'owner.json'), ownerBytes = readFileSync(ownerFile)
  writeFileSync(ownerFile, JSON.stringify({ fixtureId: caseId, attemptId: 'other-owner' }))
  assert.throws(() => reconcile(root, directory)); assert.ok(existsSync(plan.globalLock))
  writeFileSync(ownerFile, ownerBytes)
  reconcile(root, directory); reconcile(root, directory)
  assert.equal(existsSync(plan.globalLock), false)
  assert.ok(Math.abs(projectCost(root) - (currentCost + usageCost(usage))) < 1e-12)
  for (const changed of [{ ...receipt, uiControlCompleted: true }, { ...receipt, owner: { fixtureId: caseId, attemptId: 'wrong-receipt-owner' } }]) {
    writeFileSync(join(directory, 'receipt.json'), JSON.stringify(changed))
    assert.throws(() => projectCost(root))
  }
  writeFileSync(join(directory, 'receipt.json'), JSON.stringify(receipt))
  await assert.rejects(createObservedFetch(directory, async () => { calls++; return response() })('https://api.openai.com/v1/responses', init))
  assert.equal(calls, 1)
  for (const name of ['request.json', 'http.json', 'provider-body.json', 'usage.json', 'receipt.json']) assert.doesNotMatch(readFileSync(join(directory, name), 'utf8'), /NOT-FOR-EVIDENCE/)
})
test('unknown or failed provider retains reservation and blocks shared ledger; no credential body persisted', async t => {
  const { root, directory, plan } = await setup(t, true)
  const observe = createObservedFetch(directory, async () => new Response('{"error":{"message":"sk-secret-fragment"}}', { status: 401 }))
  await observe('https://api.openai.com/v1/responses', initFor(read(join(directory, 'expected-request.json'))))
  assert.equal(read(join(directory, 'usage.json')).unknownCost, true)
  assert.equal(read(join(directory, 'usage.json')).reservationRetainedUsd, 1.53)
  assert.equal(existsSync(join(directory, 'receipt.json')), false)
  assert.ok(existsSync(plan.globalLock))
  assert.throws(() => projectCost(root)); assert.throws(() => projectCost(root, { allowOwnedLock: true }))
  assert.doesNotMatch(readFileSync(join(directory, 'provider-body.json'), 'utf8'), /sk-secret/)
})
test('global owner lock and ledger changes stop arming/fetch; suspended unspent F1 plan adds no charge', async t => {
  const { root, directory, plan, approvalFile } = await setup(t)
  const suspended = join(root, '.docs/implementation-artifacts/story-4-5/S5-2026-10-24-F1-01')
  mkdirSync(suspended)
  write(suspended, 'plan.json', { attemptId: 'S5-2026-10-24-F1-01', preparedAt: new Date().toISOString(), armed: false })
  assert.ok(Math.abs(projectCost(root) - currentCost) < 1e-12)
  const owner = createOwnedLock(plan.globalLock, 'F2')
  assert.throws(() => arm(approvalFile, root, directory))
  assert.equal(existsSync(join(directory, 'armed.json')), false)
  releaseOwnedLock(plan.globalLock, owner)
  arm(approvalFile, root, directory)
  const other = join(root, '.docs/implementation-artifacts/story-4-5/unresolved-other')
  mkdirSync(other); write(other, 'plan.json', { attemptId: 'unresolved-other', preparedAt: new Date().toISOString() }); write(other, 'dispatch.json', {})
  assert.throws(() => validateBenchmarkApproval(root, directory))
})
test('optional prefill only fills unchecked registration fields: no click/check/upload/analysis', async t => {
  const calls = []
  await prefillFinancialFields({ locator: selector => ({
    fill: async value => calls.push(['fill', selector, value]),
    selectOption: async value => calls.push(['select', selector, value]),
  }) })
  assert.equal(calls.filter(([kind, selector]) => kind === 'fill' && selector.startsWith('#value-')).length, 5)
  assert.equal(calls.length, 22)
  assert.deepEqual(calls.find(([, selector]) => selector === '#rent-nature-L'), ['select', '#rent-nature-L', 'expected'])
  assert.equal(calls.some(([, selector]) => /confirm|next|file|analys|tg3|finding|list/i.test(selector)), false)
})
