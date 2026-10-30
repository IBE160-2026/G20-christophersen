import { createHash } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { prepareEconomyTrial } from '../../src/backend/import/economy-trial.ts'
import { assessLocalEconomyBudget, prepareLocalEconomyCall, runLocalEconomyCall } from '../../src/backend/import/economy-local-budget.ts'
import { AnalysisBudgetStore } from '../../src/backend/import/analysis-budget-store.ts'
import { createEconomySourceCatalogue } from '../../src/backend/import/economy-request.ts'
import { canonicalJson } from '../../src/backend/import/semantic-request.ts'

const original = Buffer.from('syntetisk original')
const reference = Buffer.from('syntetisk godkjent fasit')
function packet() {
  return prepareEconomyTrial(original, { hash: createHash('sha256').update(original).digest('hex'), name: 'syntetisk.pdf', role: 'prospectus', parentHash: null,
    attachmentId: null, requestId: 'local-budget', attachments: [], pages: [{ pdfPage: 1, status: 'readable', text: 'Ingen økonomiske beløp oppgitt.', reason: null, rasterUnprocessed: false }] }, [1])
}
const referenceApproval = { approvedReferenceProposalDigest: createHash('sha256').update(reference).digest('hex'), doesNotApprovePaidCalls: true as const,
  originalSha256: packet().originalSha256, approvedPacketDigest: createHash('sha256').update(canonicalJson(packet())).digest('hex') }
async function plan() { return prepareLocalEconomyCall(packet(), original, reference, referenceApproval) }
const approval = (p: Awaited<ReturnType<typeof plan>>) => ({ requestDigest: p.requestDigest, referenceDigest: p.referenceDigest, maximumAnalysisUsd: '0.20' as const })
function history() {
  const directory = mkdtempSync(join(tmpdir(), 'paa-local-economy-'))
  AnalysisBudgetStore.initialize(directory, packet().basis.hash)
  const ledger = AnalysisBudgetStore.open(directory, packet().basis.hash)
  return { ledger, close() { ledger.close(); rmSync(directory, { recursive: true }) } }
}
it('teller hele SDK-bodyen inklusive schema, med dobbel bytegrense og framingmargin uten count-kall', async () => {
  const p = await plan()
  expect(p).toMatchObject({ readyForApproval: true, externalCalls: 0, paidApprovalRequired: true, technicalCoverage: 'unresolved' })
  expect(p.budget.requestUtf8Bytes).toBe(Buffer.byteLength(p.wire.body))
  expect(p.budget.inputBudgetTokens).toBe(Buffer.byteLength(p.wire.body) * 2 + 4096)
  expect(p.budget.exactTokenCount).toBe(false)
  expect(p.wire.body).toContain('json_schema')
  expect(JSON.parse(p.wire.body).text.format.name).toBe('economy_compact_3')
  expect(p.wire.body).toContain('valueId')
  expect(p.budget.policyMaximumUsd).toBe('0.15000000')
  expect(p.budget.reservedUsd).toBe('0.15')
  expect(JSON.parse(p.wire.body).max_output_tokens).toBe(6000)
})
it('stopper oversize tekst, hele requesten, verktøy og feil outputtak', async () => {
  const p = await plan(), request = JSON.parse(p.wire.body)
  request.input[0].content[0].text += 'ø'.repeat(20_000)
  expect(() => assessLocalEconomyBudget(request, JSON.stringify(request))).toThrow('local-economy-input-budget-exceeded')
  const tools = { ...JSON.parse(p.wire.body), tools: [{ type: 'web_search' }] }
  expect(() => assessLocalEconomyBudget(tools, JSON.stringify(tools))).toThrow('incompatible')
  const output = { ...JSON.parse(p.wire.body), max_output_tokens: 8000 }
  expect(() => assessLocalEconomyBudget(output, JSON.stringify(output))).toThrow('incompatible')
  const changed = packet(); changed.basis.pages[0]!.text = 'x'.repeat(12_001)
  const large = prepareEconomyTrial(original, changed.basis, [1])
  await expect(prepareLocalEconomyCall(large, original, reference, referenceApproval)).rejects.toThrow('text-limit')
})
it('holder 6000 output innen USD 0,15 ved inputgrensen og stopper én byte over', async () => {
  const p = await plan(), request = JSON.parse(p.wire.body)
  const maximumWireBytes = (36_000 - 4096) / 2
  request.input[0].content[0].text += ' '.repeat(maximumWireBytes - Buffer.byteLength(JSON.stringify(request)))
  expect(assessLocalEconomyBudget(request, JSON.stringify(request))).toMatchObject({ inputBudgetTokens: 36_000,
    outputBudgetTokensIncludingReasoning: 6000, calculatedMaximumUsd: '0.15000000', minimumUnallocatedMarginUsd: '0.05' })
  request.input[0].content[0].text += ' '
  expect(() => assessLocalEconomyBudget(request, JSON.stringify(request))).toThrow('local-economy-input-budget-exceeded')
})
it('krever godkjent eksakt fasit og ny betalt requestgodkjenning før nettverk', async () => {
  await expect(prepareLocalEconomyCall(packet(), original, Buffer.from('endret'), referenceApproval)).rejects.toThrow('reference-approval-required')
  await expect(prepareLocalEconomyCall(packet(), original, reference, { ...referenceApproval, approvedPacketDigest: '0'.repeat(64) })).rejects.toThrow('reference-approval-required')
  const p = await plan(), h = history(); let calls = 0
  try {
    await expect(runLocalEconomyCall(p, { ...approval(p), requestDigest: '0'.repeat(64) }, h.ledger, { apiKey: 'stub', fetch: async () => { calls++; throw Error('forbudt') } })).rejects.toThrow('paid-approval-required')
    expect(calls).toBe(0); expect(h.ledger.snapshot()).toEqual([])
  } finally { h.close() }
})
it('reserverer før kun ett Responses-kall, beholder kvote ved avbrutt output og tillater ikke retry', async () => {
  const p = await plan(), h = history(); let calls = 0
  const credentials = { apiKey: 'offline-only', fetch: async (url: Parameters<typeof fetch>[0]) => {
    calls++; expect(String(url)).toBe('https://api.openai.com/v1/responses')
    expect(h.ledger.snapshot()[0]!.reservedUsd).toBe('0.15')
    return new Response(JSON.stringify({ id: 'stub', object: 'response', status: 'incomplete', output: [], usage: { input_tokens: 20, output_tokens: 6000, total_tokens: 6020 } }), { headers: { 'content-type': 'application/json' } })
  } }
  try {
    await expect(runLocalEconomyCall(p, approval(p), h.ledger, credentials)).rejects.toThrow('incomplete-response')
    expect(calls).toBe(1); expect(h.ledger.remaining()).toBe('0.05000000')
    expect(h.ledger.snapshot()[0]!.state).toBe('uncertain')
    await expect(runLocalEconomyCall(p, approval(p), h.ledger, credentials)).rejects.toThrow('paid-approval-required')
    expect(calls).toBe(1)
  } finally { h.close() }
})
it('stopper før fetch hvis tidligere analyse/rapport bruker sikkerhetsmarginen', async () => {
  const p = await plan(), h = history(); let calls = 0
  try {
    h.ledger.reserve('b'.repeat(64), 'c'.repeat(64), '0.06')
    await expect(runLocalEconomyCall(p, approval(p), h.ledger, { apiKey: 'stub', fetch: async () => { calls++; throw Error('forbudt') } })).rejects.toThrow('budget-margin')
    expect(calls).toBe(0)
  } finally { h.close() }
})
it('aksepterer 6000 output og bevarer kildevalidering og uavklart kandidat', async () => {
  const p = await plan(), h = history(); let calls = 0
  const basis = packet()
  const output = { fields: basis.proposedOracle.fields.map(({ id, status, period, year, nature }) => ({ id, status, valueId: null, period, year, nature, sourceIds: [], alternatives: [], reason: null })), observations: [], limitations: [], processedSourceIds: createEconomySourceCatalogue(basis.basis, basis.selectedPages).map(source => source.id) }
  try {
    const result = await runLocalEconomyCall(p, approval(p), h.ledger, { apiKey: 'offline-only', fetch: async () => {
      calls++
      return new Response(JSON.stringify({ id: 'stub', object: 'response', status: 'completed', output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: JSON.stringify(output), annotations: [] }] }], usage: { input_tokens: 100, output_tokens: 6000, total_tokens: 6100 } }), { headers: { 'content-type': 'application/json' } })
    } })
    expect(calls).toBe(1)
    expect(result.result.candidate).toMatchObject({ confirmed: false, requiresHumanReview: true })
    expect(result.requiresApprovedReferenceComparison).toBe(true)
    expect(h.ledger.snapshot()[0]!.state).toBe('completed')
    expect(h.ledger.remaining()).toBe('0.05000000')
  } finally { h.close() }
})
it('SDK-feil utløser ikke ekstra API-kall eller frigivelse av reservasjon', async () => {
  const p = await plan(), h = history(); let calls = 0
  try {
    await expect(runLocalEconomyCall(p, approval(p), h.ledger, { apiKey: 'offline-only', fetch: async () => {
      calls++; return new Response('{}', { status: 500, headers: { 'content-type': 'application/json' } })
    } })).rejects.toThrow()
    expect(calls).toBe(1)
    expect(h.ledger.snapshot()[0]!.state).toBe('uncertain')
    expect(h.ledger.remaining()).toBe('0.05000000')
  } finally { h.close() }
})
it('avviser fullført respons med 6001 output og beholder reservasjonen uten retry', async () => {
  const p = await plan(), h = history(); let calls = 0
  try {
    await expect(runLocalEconomyCall(p, approval(p), h.ledger, { apiKey: 'offline-only', fetch: async () => {
      calls++
      return new Response(JSON.stringify({ id: 'stub', object: 'response', status: 'completed', output: [],
        usage: { input_tokens: 100, output_tokens: 6001, total_tokens: 6101 } }), { headers: { 'content-type': 'application/json' } })
    } })).rejects.toThrow('local-economy-usage-outside-budget')
    expect(calls).toBe(1)
    expect(h.ledger.snapshot()[0]!.state).toBe('uncertain')
    expect(h.ledger.remaining()).toBe('0.05000000')
  } finally { h.close() }
})
