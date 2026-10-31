import { createHash } from 'node:crypto'
import { attachUploadedEconomy } from '../../src/backend/import/uploaded-economy-cache.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { expect, it, vi } from 'vitest'
import express from 'express'
import { createServer, request as httpRequest } from 'node:http'
import { once } from 'node:events'
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createEconomyRouter } from '../../src/backend/http/economy-route.ts'
import { DocumentImportSchema } from '../../src/contracts/document-import.ts'
import { newProspectusPdf } from '../helpers/new-prospectus-pdf.ts'
import { ListingKeySchema } from '../../src/contracts/listing.ts'

async function harness(stub: typeof fetch, options: { prepareDeadlineMs?: number; budgetDirectory?: string } = {}) {
  const directory = options.budgetDirectory ?? mkdtempSync(join(tmpdir(), 'paa-ui-economy-'))
  const app = express(), router = createEconomyRouter({ ...options, budgetDirectory: directory, credentials: () => ({ apiKey: 'offline-test', fetch: stub }) })
  app.use('/api', router)
  const server = createServer(app); server.listen(0, '127.0.0.1'); await once(server, 'listening')
  const address = server.address(); if (!address || typeof address === 'string') throw Error('listener')
  const url = `http://127.0.0.1:${address.port}/api/document-economy`
  return { url, directory, stop: () => router.stop(), async close() { await router.stop(); server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); if (!options.budgetDirectory) rmSync(directory, { recursive: true }) } }
}
async function prepare(url: string) {
  const body = new FormData(); body.append('file', new Blob([newProspectusPdf(['Adresse: Ukjentveien 8', 'Prisantydning er 4 242 000 kr'])]), 'ny.pdf')
  const response = await fetch(url + '/prepare', { method: 'POST', body, headers: { 'X-Session-Id': 'economy-http', 'X-Request-Id': 'request-prepare', 'X-Analysis-Generation': '1' } })
  expect(response.status).toBe(200)
  return await response.json() as { planId: string; documentHash: string; requestDigest: string; readyForApproval: boolean; excerpts: { pdfPage: number; text: string }[] }
}
async function run(url: string, body: unknown) { return fetch(url + '/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) }
it('forbereder lokalt, krever begge samtykker og binder dokument/request før ett stubbet SDK-kall', async () => {
  let calls = 0
  const app = await harness(async (_url, init) => {
    calls++
    const request = JSON.parse(String(init?.body)), payload = JSON.parse(request.input[0].content[0].text)
    const sourceIds = payload.sourceSegments.map((segment: string[]) => segment[0])
    const priceSource = payload.sourceSegments.find((segment: string[]) => segment[1]!.includes('Prisantydning'))[0]
    const valueId = payload.money.find((entry: unknown[]) => entry[0] === priceSource)[1][0]
    const output = { fields: ListingKeySchema.options.map(id => ({ id, status: id === 'price' ? 'available' : 'missing', valueId: id === 'price' ? valueId : null, period: ['commonCosts', 'propertyTax', 'municipalFees', 'sharedDebtPayment'].includes(id) ? 'unknown' : 'once', year: null, nature: id === 'price' ? 'fact' : 'unknown', sourceIds: id === 'price' ? sourceIds : [], alternatives: [], reason: null })), observations: [], limitations: [], processedSourceIds: sourceIds }
    return new Response(JSON.stringify({ id: 'offline', object: 'response', status: 'completed', output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: JSON.stringify(output), annotations: [] }] }], usage: { input_tokens: 100, output_tokens: 100, total_tokens: 200 } }), { headers: { 'content-type': 'application/json' } })
  })
  try {
    const plan = await prepare(app.url)
    expect(plan.readyForApproval).toBe(true); expect(plan.excerpts[0]!.text).toContain('4 242 000'); expect(calls).toBe(0)
    expect(await (await fetch(app.url + '/status/' + plan.documentHash)).json()).toMatchObject({ state: 'idle', retryAllowed: true })
    const consent = { planId: plan.planId, documentHash: plan.documentHash, requestDigest: plan.requestDigest, approveCost: true, approveTransfer: true }
    expect((await run(app.url, { ...consent, approveTransfer: false })).status).toBe(400)
    expect((await run(app.url, { ...consent, requestDigest: '0'.repeat(64) })).status).toBe(409)
    expect(calls).toBe(0)
    const response = await run(app.url, consent), body = await response.json()
    expect(response.status, JSON.stringify(body)).toBe(200)
    const outcome = DocumentImportSchema.parse((body as { outcome: unknown }).outcome)
    expect(await (await fetch(app.url + '/status/' + plan.documentHash)).json()).toMatchObject({ state: 'completed', requestDigest: plan.requestDigest, reservedUsd: '0.15', actualUsd: expect.any(String), usageCostBasis: 'provider-usage-upper-bound', retryAllowed: false })
    expect(outcome.economy.analysis?.provenance).toBe('live-document')
    expect(outcome.economy.fields.find(field => field.id === 'price')?.amount).toBe('4242000')
    expect(outcome.economy.fields.find(field => field.id === 'price')?.sources[0]?.documentHash).toBe(plan.documentHash)
    expect(outcome.technical.status).toBe('blocked'); expect(outcome.cost?.reservedUsd).toBe('0.15')
    expect(outcome.cost?.requestDigest).toBe(outcome.inputDigest)
    const bytes = newProspectusPdf(['Adresse: Ukjentveien 8', 'Prisantydning er 4 242 000 kr'])
    const basis = { hash: outcome.reportHash, name: 'samme-dokument-nytt-navn.pdf', role: 'prospectus' as const, requestId: 'reopened', parentHash: null, attachmentId: null, pages: outcome.pages, attachments: outcome.attachments }
    const local = await createCodeFirstImport(basis)
    const restored = await attachUploadedEconomy(local, bytes, basis, join(app.directory, 'results'))
    expect(restored.economy.analysis?.provenance).toBe('saved-same-document')
    expect(restored.requestId).toBe('reopened')
    expect(restored.economy.fields.find(field => field.id === 'price')).toMatchObject({ amount: '4242000', sources: [{ documentName: basis.name, documentHash: basis.hash }] })
    const other = newProspectusPdf(['Annet dokument'])
    expect(await attachUploadedEconomy(local, other, { ...basis, hash: createHash('sha256').update(other).digest('hex') }, join(app.directory, 'results'))).toBe(local)
    const cachePath = join(app.directory, 'results', basis.hash + '.json')
    const archive = JSON.parse(readFileSync(cachePath, 'utf8'))
    archive.output.fields.find((field: { id: string }) => field.id === 'price').valueId = 'fabricated'
    writeFileSync(cachePath, JSON.stringify(archive))
    expect(await attachUploadedEconomy(local, bytes, basis, join(app.directory, 'results'))).toBe(local)
    expect((await run(app.url, consent)).status).toBe(409); expect(calls).toBe(1)
    // Ny gratis pakke gir aldri ny kvote for samme dokument etter reload.
    const next = await prepare(app.url)
    expect((await run(app.url, { ...consent, planId: next.planId, requestDigest: next.requestDigest })).status).toBe(422)
    expect(calls).toBe(1)
  } finally { await app.close() }
}, 30_000)
it('ukjent leverandørutfall beholder reservasjon og gjenforsøk er sperret uten lekkasje av feiltekst', async () => {
  let calls = 0
  const app = await harness(async () => { calls++; throw Error('secret-provider-debug') })
  try {
    const plan = await prepare(app.url), consent = { planId: plan.planId, documentHash: plan.documentHash, requestDigest: plan.requestDigest, approveCost: true, approveTransfer: true }
    const response = await run(app.url, consent)
    expect(response.status).toBe(422); expect(await response.json()).toEqual({ error: 'economy-provider-connection', retryAllowed: false })
    expect(await (await fetch(app.url + '/status/' + plan.documentHash)).json()).toMatchObject({ state: 'failed', error: 'economy-provider-connection', reservedUsd: '0.15', actualUsd: null, retryAllowed: false })
    const restarted = await harness(async () => { throw Error('forbudt') }, { budgetDirectory: app.directory })
    try {
      expect(await (await fetch(restarted.url + '/status/' + plan.documentHash)).json()).toMatchObject({ state: 'failed', error: 'economy-previous-uncertain', reservedUsd: '0.15', actualUsd: null, retryAllowed: false })
    } finally { await restarted.close() }
    expect((await run(app.url, consent)).status).toBe(409); expect(calls).toBe(1)
  } finally { await app.close() }
}, 30_000)
it('fire gjentatte gratis forberedelser av samme dokument/økt erstatter pakken uten å fylle minnet', async () => {
  let calls = 0
  const app = await harness(async () => { calls++; throw Error('forbudt') })
  try {
    const initial = await prepare(app.url)
    for (let i = 0; i < 4; i++) expect((await prepare(app.url)).readyForApproval).toBe(true)
    const response = await run(app.url, { planId: initial.planId, documentHash: initial.documentHash, requestDigest: initial.requestDigest, approveCost: true, approveTransfer: true })
    expect(response.status).toBe(409); expect(calls).toBe(0)
  } finally { await app.close() }
}, 30_000)
it('tidsavbrudd lukker en stanset multipart-opplasting og frigir låsen for neste forberedelse', async () => {
  let calls = 0
  const app = await harness(async () => { calls++; throw Error('forbudt') }, { prepareDeadlineMs: 1500 })
  try {
    const stopped = await new Promise<number | string>((resolve, reject) => {
      const request = httpRequest(app.url + '/prepare', { method: 'POST', headers: {
        'Content-Type': 'multipart/form-data; boundary=stalled', 'X-Session-Id': 'stalled', 'X-Request-Id': 'stalled-request', 'X-Analysis-Generation': '1',
      } }, response => { response.resume(); response.once('end', () => resolve(response.statusCode!)) })
      request.once('error', (error: NodeJS.ErrnoException) => error.code === 'ECONNRESET' ? resolve(error.code) : reject(error))
      request.write('--stalled\r\nContent-Disposition: form-data; name="file"; filename="stalled.pdf"\r\n\r\n%PDF-1.7\n')
      // Ingen sluttmarkør eller end(): serverens frist må avslutte lesingen.
    })
    expect([504, 'ECONNRESET']).toContain(stopped)
    expect((await prepare(app.url)).readyForApproval).toBe(true)
    expect(calls).toBe(0)
  } finally { await app.close() }
}, 30_000)
it('stenging venter på pågående transport og journalavslutning', async () => {
  let release!: () => void, entered!: () => void
  const held = new Promise<void>(resolve => { release = resolve }), started = new Promise<void>(resolve => { entered = resolve })
  const app = await harness(async () => { entered(); await held; throw Error('offline-stop-test') })
  try {
    const plan = await prepare(app.url)
    const running = run(app.url, { planId: plan.planId, documentHash: plan.documentHash, requestDigest: plan.requestDigest, approveCost: true, approveTransfer: true })
    await started
    expect(await (await fetch(app.url + '/status/' + plan.documentHash)).json()).toMatchObject({ state: 'running', requestDigest: plan.requestDigest, retryAllowed: false })
    expect((await run(app.url, { planId: plan.planId, documentHash: plan.documentHash, requestDigest: plan.requestDigest, approveCost: true, approveTransfer: true })).status).toBe(409)
    let stopped = false
    const stopping = app.stop().then(() => { stopped = true })
    await new Promise<void>(resolve => setImmediate(resolve))
    expect(stopped).toBe(false)
    release()
    expect((await running).status).toBe(422)
    await stopping
    expect(stopped).toBe(true)
  } finally { release(); await app.close() }
}, 30_000)

it('HTTP-feil fra leverandøren får trygg kategori og audit uten nøkkel, utdrag eller rå feiltekst', async () => {
  const messages: string[] = [], log = vi.spyOn(console, 'info').mockImplementation(message => { messages.push(String(message)) })
  let calls = 0
  const app = await harness(async () => {
    calls++
    return Response.json({ error: { message: 'secret-provider-debug', type: 'authentication_error', code: 'secret-provider-code' } },
      { status: 401, headers: { 'x-request-id': 'req_offline_test' } })
  })
  try {
    const plan = await prepare(app.url)
    const response = await run(app.url, { planId: plan.planId, documentHash: plan.documentHash, requestDigest: plan.requestDigest, approveCost: true, approveTransfer: true })
    expect(response.status).toBe(422)
    expect(await response.json()).toEqual({ error: 'economy-provider-authentication', retryAllowed: false })
    const output = messages.join('\n')
    expect(output).toContain('economy-provider-attempted')
    expect(output).toContain('"status":401')
    expect(output).toContain('req_offline_test')
    expect(output).not.toContain('offline-test')
    expect(output).not.toContain('secret-provider')
    expect(output).not.toContain('Prisantydning')
    expect(calls).toBe(1)
    expect(await (await fetch(app.url + '/status/' + plan.documentHash)).json()).toMatchObject({ state: 'failed', error: 'economy-provider-authentication', retryAllowed: false })
  } finally { await app.close(); log.mockRestore() }
}, 30_000)

it('statusruten avviser ugyldig hash og sperrer ødelagt historikk uten nye kall eller filendring', async () => {
  let calls = 0
  const app = await harness(async () => { calls++; throw Error('forbudt') })
  try {
    expect((await fetch(app.url + '/status/not-a-hash')).status).toBe(400)
    const hash = 'd'.repeat(64), path = join(app.directory, createHash('sha256').update(hash).digest('hex') + '.json')
    writeFileSync(path, '{invalid')
    const response = await fetch(app.url + '/status/' + hash)
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual({ state: 'unknown', requestDigest: null, reservedUsd: null, actualUsd: null, usageCostBasis: null, error: 'budget-history-unavailable', retryAllowed: false })
    expect(readFileSync(path, 'utf8')).toBe('{invalid')
    expect(calls).toBe(0)
  } finally { await app.close() }
}, 30_000)

it('statusruten bevarer ukjent historisk kostnadsgrunnlag og eksplisitt eksakt grunnlag', async () => {
  const app = await harness(async () => { throw Error('forbudt') })
  try {
    const hash = 'e'.repeat(64), path = join(app.directory, createHash('sha256').update(hash).digest('hex') + '.json')
    const entry = { documentHash: hash, requestDigest: 'f'.repeat(64), reservedUsd: '0.15', actualUsd: '0.01', state: 'completed' }
    for (const usageCostBasis of [undefined, 'provider-usage-exact'] as const) {
      writeFileSync(path, JSON.stringify({ version: 1, analysisId: hash, entries: [{ ...entry, ...(usageCostBasis ? { usageCostBasis } : {}) }] }))
      expect(await (await fetch(app.url + '/status/' + hash)).json()).toMatchObject({ state: 'completed', actualUsd: '0.01', usageCostBasis: usageCostBasis ?? null, retryAllowed: false })
    }
  } finally { await app.close() }
}, 30_000)
