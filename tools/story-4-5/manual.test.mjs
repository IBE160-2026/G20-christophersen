// Offline only: no browser, no real key, injected transport never reaches a provider.
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { attemptId, repository, prepare, arm, createManualServer, hash, read, write, validateApproval, fingerprint, validateSourceBinding } from './manual.mjs'
import { createObservedFetch } from './transport.mjs'
import { projectCost } from '../story-4-4/project-ledger.mjs'

const temporary = t => {
  const directory = mkdtempSync(join(tmpdir(), 'story45-offline-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  return directory
}
function approvalFor(plan, directory) {
  const proof = join(directory, 'offline-test-proof.txt')
  writeFileSync(proof, 'OFFLINE SYNTHETIC TEST ONLY: no actual participant/account approval')
  const evidence = { path: proof, sha256: hash(readFileSync(proof)) }
  return { attemptId, requestSha256: plan.requestSha256, sourceFingerprint: plan.sourceFingerprint,
    owner: 'Mads', codeCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repository, encoding: 'utf8' }).trim(),
    checkedAt: new Date().toISOString(), gateClosed: true, humanInitiationOnly: true, measurementMethodDefined: true,
    rootExplicitApproval: true, regressionPassed: true, accountVerified: true, unknownChargesResolved: true,
    gateEvidence: evidence, methodEvidence: evidence, accountEvidence: evidence,
    priceSource: 'https://developers.openai.com/api/docs/models/gpt-6.1-sol',
    inputUsdPerMillion: 2, outputUsdPerMillion: 10, cachedUsdPerMillion: 0.1, cacheWriteUsdPerMillion: 2.5,
    costBeforeUsd: plan.historicalCostBeforeUsd, reservationUsd: 1.53, accountLimitUsd: 2, availableUsd: 1.98 }
}
async function setup(t, armed = false) {
  const directory = join(temporary(t), 'evidence')
  const plan = await prepare(repository, directory)
  const approval = approvalFor(plan, directory)
  if (armed) {
    const file = join(directory, 'offline-test-approval.json')
    writeFileSync(file, JSON.stringify(approval))
    arm(file, repository, directory)
  }
  return { directory, plan, approval }
}
async function listen(instance) {
  await new Promise((resolve, reject) => { instance.server.once('error', reject); instance.server.listen(0, '127.0.0.1', resolve) })
  return `http://127.0.0.1:${instance.server.address().port}`
}
test('prepare is unarmed, exact F1 request, exclusive writes and no overwrite', async t => {
  const { directory, plan } = await setup(t)
  assert.equal(plan.armed, false)
  assert.equal(plan.accountStatus, 'pending')
  assert.equal(plan.gateStatus, 'pending')
  assert.equal(plan.reservationUsd, 1.53)
  assert.equal(plan.historicalCostBeforeUsd, projectCost(repository))
  assert.ok(plan.historicalCostBeforeUsd >= 0.019558)
  const original = readFileSync(join(directory, 'plan.json'))
  assert.equal(hash(JSON.stringify(read(join(directory, 'expected-request.json')))), plan.requestSha256)
  assert.throws(() => write(directory, 'plan.json', { overwritten: true }))
  await assert.rejects(prepare(repository, directory))
  assert.deepEqual(readFileSync(join(directory, 'plan.json')), original)
})
test('unarmed local GET/config works; POST cannot start pipeline/provider or write attempt', async t => {
  const { directory } = await setup(t)
  const events = []
  const instance = createManualServer({ directory, onLifecycle: event => events.push(event) })
  t.after(() => instance.stop())
  const url = await listen(instance)
  assert.equal((await fetch(url)).status, 200)
  assert.deepEqual(await (await fetch(`${url}/api/analysis-config`)).json(), { mode: 'live' })
  assert.equal((await fetch(`${url}/api/analysis`, { method: 'POST', body: 'not-an-upload' })).status, 409)
  assert.equal((await fetch(`${url}/api/arm`, { method: 'POST' })).status, 404)
  assert.deepEqual(events, [])
  assert.equal(existsSync(join(directory, 'analysis-attempt.json')), false)
  assert.equal(existsSync(join(directory, 'dispatch.json')), false)
})
test('arming requires identity, evidence hashes, gate, reservation and unchanged source', async t => {
  const { directory, plan, approval } = await setup(t)
  for (const change of [{ humanInitiationOnly: false }, { requestSha256: 'wrong' }, { reservationUsd: 1.48 },
    { costBeforeUsd: 2 }, { gateEvidence: { path: 'not-a-file', sha256: 'a'.repeat(64) } }]) {
    assert.throws(() => validateApproval(plan, { ...approval, ...change }))
  }
  const file = join(directory, 'approval.json')
  writeFileSync(file, JSON.stringify({ ...approval, sourceFingerprint: 'wrong' }))
  assert.throws(() => arm(file, repository, directory))
  assert.equal(existsSync(join(directory, 'armed.json')), false)
  // Isolated synthetic Git history; never commits into the project repository.
  const root = temporary(t)
  for (const path of ['src', 'dist', 'tools/story-4-5', 'tools/story-4-4']) mkdirSync(join(root, path), { recursive: true })
  for (const path of ['package.json', 'package-lock.json', 'src/main.ts', 'dist/index.html']) writeFileSync(join(root, path), 'original')
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  const commit = message => { git('add', '.'); git('-c', 'user.name=Offline Test', '-c', 'user.email=offline@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '-m', message) }
  git('init'); commit('synthetic source')
  const binding = { sourceFingerprint: fingerprint(root) }
  const approved = { codeCommit: git('rev-parse', 'HEAD') }
  writeFileSync(join(root, 'evidence.json'), 'synthetic receipt'); commit('synthetic evidence only')
  assert.doesNotThrow(() => validateSourceBinding(root, binding, approved))
  assert.throws(() => validateSourceBinding(root, binding, { codeCommit: 'f'.repeat(40) }))
  writeFileSync(join(root, 'src/main.ts'), 'changed')
  assert.throws(() => validateSourceBinding(root, binding, approved))
  writeFileSync(join(root, 'src/main.ts'), 'original')
  writeFileSync(join(root, 'dist/index.html'), 'changed')
  assert.throws(() => validateSourceBinding(root, binding, approved))
})
test('one armed POST consumes durable attempt even on malformed upload; restart cannot retry', async t => {
  const { directory } = await setup(t, true)
  const instance = createManualServer({ directory, armed: true })
  t.after(() => instance.stop())
  let url = await listen(instance)
  assert.equal((await fetch(`${url}/api/analysis`, { method: 'POST', body: '{}' })).status, 400)
  const outcome = readFileSync(join(directory, 'outcome.json'))
  assert.equal((await fetch(`${url}/api/analysis`, { method: 'POST', body: '{}' })).status, 409)
  await instance.stop()
  const restart = createManualServer({ directory, armed: true })
  t.after(() => restart.stop())
  url = await listen(restart)
  assert.equal((await fetch(`${url}/api/analysis`, { method: 'POST', body: '{}' })).status, 409)
  assert.deepEqual(readFileSync(join(directory, 'outcome.json')), outcome)
  assert.equal(existsSync(join(directory, 'dispatch.json')), false)
})
test('server stop aborts a real pipeline child and waits for close without provider dispatch', async t => {
  assert.equal(process.env.OPENAI_API_KEY, undefined, 'run offline tests with key unset')
  const { directory } = await setup(t, true)
  const events = []
  let started
  const childStarted = new Promise(resolve => { started = resolve })
  const instance = createManualServer({ directory, armed: true, onLifecycle: event => {
    events.push(event.kind)
    if (event.kind === 'process-started') started()
  } })
  const url = await listen(instance)
  const form = new FormData()
  form.append('file', new Blob([readFileSync(join(repository, 'tests/fixtures/property-cases/F1-tilstandsrapport.pdf'))], { type: 'application/pdf' }), 'F1-tilstandsrapport.pdf')
  const request = fetch(`${url}/api/analysis`, { method: 'POST', body: form,
    headers: { 'X-Session-Id': 'offline-manual-session', 'X-Request-Id': 'offline-manual-request', 'X-Analysis-Generation': '1' } }).catch(() => null)
  await childStarted
  await instance.stop()
  await request
  assert.ok(events.includes('process-closed'))
  assert.equal(existsSync(join(directory, 'dispatch.json')), false)
})

function transportSetup(t) {
  const directory = temporary(t)
  const request = { input: [{ content: [{ text: JSON.stringify({ documentName: 'F1-tilstandsrapport.pdf', reportHash: 'synthetic-f1', requestId: attemptId }) }] }], model: 'gpt-6.1-sol' }
  const plan = { attemptId, armed: false, requestSha256: hash(JSON.stringify(request)), sourceFingerprint: 'synthetic',
    documentName: 'F1-tilstandsrapport.pdf', reportHash: 'synthetic-f1', historicalCostBeforeUsd: 0.016072,
    reservationUsd: 1.53, r1LimitUsd: 20, globalLock: join(directory, 'shared-paid.lock'), model: 'gpt-6.1-sol' }
  const approval = { ...approvalFor(plan, directory), armed: true }
  write(directory, 'plan.json', plan); write(directory, 'armed.json', approval)
  return { directory, plan, request }
}
const initFor = request => ({ method: 'POST', body: JSON.stringify(request), headers: { Authorization: 'Bearer NEVER-PERSIST-HEADER' } })
test('observer rejects changed report/request/endpoint before any provider call or shared lock', async t => {
  const { directory, plan, request } = transportSetup(t)
  let calls = 0
  const observe = createObservedFetch(directory, async () => { calls++; throw new Error('must never call') })
  for (const changed of [{ ...request, model: 'changed' }, { ...request, input: [{ content: [{ text: JSON.stringify({ documentName: 'F2', reportHash: 'other', requestId: 'new' }) }] }] }]) {
    await assert.rejects(observe('https://api.openai.com/v1/responses', initFor(changed)))
  }
  await assert.rejects(observe('https://other.invalid', initFor(request)))
  assert.equal(calls, 0)
  assert.equal(existsSync(plan.globalLock), false)
})
test('observer forwards exact original once, records usage without headers; retains shared lock', async t => {
  const { directory, plan, request } = transportSetup(t)
  const actual = structuredClone(request)
  const basis = JSON.parse(actual.input[0].content[0].text); basis.requestId = 'actual-browser-request'
  actual.input[0].content[0].text = JSON.stringify(basis)
  const init = initFor(actual)
  let calls = 0
  const observe = createObservedFetch(directory, async (_input, forwarded) => {
    calls++; assert.strictEqual(forwarded, init)
    return new Response(JSON.stringify({ status: 'completed', model: plan.model, service_tier: 'default',
      usage: { input_tokens: 100, output_tokens: 10, total_tokens: 110,
        input_tokens_details: { cached_tokens: 0, cache_write_tokens: 0 }, output_tokens_details: { reasoning_tokens: 0 } }, output: [] }),
    { headers: { 'set-cookie': 'NEVER-PERSIST-RESPONSE-HEADER' } })
  })
  await observe('https://api.openai.com/v1/responses', init)
  await assert.rejects(observe('https://api.openai.com/v1/responses', init))
  assert.equal(calls, 1)
  assert.equal(read(join(directory, 'usage.json')).unknownCost, false)
  assert.ok(existsSync(plan.globalLock))
  for (const name of ['request.json', 'http.json', 'provider-body.json', 'usage.json']) assert.doesNotMatch(readFileSync(join(directory, name), 'utf8'), /NEVER-PERSIST/)
  assert.deepEqual(read(join(directory, 'request.json')), actual)
})
test('existing global lock prevents transport; ambiguous errors retain owner/reservation and no key body', async t => {
  const first = transportSetup(t)
  mkdirSync(first.plan.globalLock)
  let calls = 0
  const blocked = createObservedFetch(first.directory, async () => { calls++ })
  await assert.rejects(blocked('https://api.openai.com/v1/responses', initFor(first.request)))
  assert.equal(calls, 0)
  const second = transportSetup(t)
  const observe = createObservedFetch(second.directory, async () => new Response(JSON.stringify({ error: { message: 'secret key fragment' }, usage: { secret: 'secret key fragment' } }), { status: 401 }))
  await observe('https://api.openai.com/v1/responses', initFor(second.request))
  assert.equal(read(join(second.directory, 'usage.json')).unknownCost, true)
  assert.equal(read(join(second.directory, 'usage.json')).usage, null)
  assert.equal(read(join(second.directory, 'provider-body.json')).omitted, true)
  assert.ok(existsSync(second.plan.globalLock))
  assert.doesNotMatch(readFileSync(join(second.directory, 'provider-body.json'), 'utf8'), /secret/)
})
