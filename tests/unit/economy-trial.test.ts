import { createHash } from 'node:crypto'
import { expect, it } from 'vitest'
import { prepareEconomyTrial, prepareEconomyPreflight, verifyEconomyTrial, validateEconomyTrialOutput } from '../../src/backend/import/economy-trial.ts'
import { sourceFor } from '../../src/backend/import/local-plan.ts'
import type { ImportBasis } from '../../src/backend/import/local-plan.ts'
import { compatibleStandardRequest, AnalysisBudget, GLOBAL_STANDARD_PRICE, preflightSemantic } from '../../src/backend/import/budget.ts'
import { countSemanticInput, createOfflineTokenCountTransport, createSdkTokenCountTransport } from '../../src/backend/import/token-count.ts'
import { codeFirstPdf } from '../helpers/code-first-pdf.ts'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'
import { extractImport } from '../../src/backend/documents/extract-import.ts'
const original = Buffer.from('syntetiske originale bytes')
function fixture(): ImportBasis {
  return { hash: createHash('sha256').update(original).digest('hex'), name: 'syntetisk.pdf', role: 'prospectus', parentHash: null, attachmentId: null, requestId: 'trial', attachments: [], pages: [
    { pdfPage: 1, status: 'readable', text: 'Prisantydning: 3 000 000 kr\nKommunale avgifter 3 000 kr per kvartal inkl. mva. Avvik: 2 900 kr.', reason: null, rasterUnprocessed: true },
    { pdfPage: 2, status: 'unknown', text: 'USENDT KART TG3', reason: 'Ukjent kart', rasterUnprocessed: true },
    { pdfPage: 3, status: 'blank', text: '', reason: null, rasterUnprocessed: false },
  ] }
}
function response(packet: ReturnType<typeof prepareEconomyTrial>) {
  return { fields: structuredClone(packet.proposedOracle.fields).map(field => ({ ...field, originalText: field.sources.map(source => source.quote).join('\n') })),
    observations: packet.proposedOracle.sourceAnchors.map(source => ({ kind: 'period' as const, raw: source.quote, sources: [source] })), limitations: [] }
}
it('bevarer alle sider og rå kvartal/mva/avvik, sender bare valgt tekst og beholder TG uavklart', () => {
  const basis = fixture(), packet = prepareEconomyTrial(original, basis, [1])
  expect(packet.basis).toEqual(basis)
  expect(packet.ledger.map(page => page.sent)).toEqual([true, false, false])
  expect(packet.ledger[0]!.rasterUnprocessed).toBe(true)
  expect(packet.request.input[0].content[0].text).not.toContain('USENDT KART')
  expect(packet.request.input[0].content[0].text).toContain('kvartal inkl. mva. Avvik: 2 900 kr.')
  expect(packet.technical).toEqual({ status: 'unresolved', coverageComplete: false })
  expect(packet.proposedOracle).toMatchObject({ provenance: 'machine-proposed', humanApproved: false })
  expect(packet.proposedOracle.fields.find(field => field.id === 'municipalFees')!.amount).toBeNull()
  expect(compatibleStandardRequest(packet.request)).toBe(true)
})
it('stopper ulest side, endrede bytes, offset og request før klargjøring/kjøring', async () => {
  const basis = fixture(), packet = prepareEconomyTrial(original, basis, [1])
  expect(() => prepareEconomyTrial(original, basis, [2])).toThrow('economy-selected-page-unreadable')
  expect(() => prepareEconomyTrial(Buffer.from('endret'), basis, [1])).toThrow('economy-original-mismatch')
  const changed = structuredClone(packet); changed.request.max_output_tokens = 2
  expect(verifyEconomyTrial(changed, original, basis)).toBe(false)
  const oracleOnly = structuredClone(packet); oracleOnly.proposedOracle.sourceAnchors[0]!.start++
  const ledgerOnly = structuredClone(packet); ledgerOnly.ledger[1]!.sent = true
  const technicalOnly = structuredClone(packet); technicalOnly.technical.coverageComplete = true
  for (const modified of [oracleOnly, ledgerOnly, technicalOnly]) {
    expect(verifyEconomyTrial(modified, original, basis)).toBe(false)
    await expect(prepareEconomyPreflight(modified, original, basis)).rejects.toThrow('economy-package-mismatch')
  }
  const source = packet.proposedOracle.sourceAnchors[0]!
  expect(() => validateEconomyTrialOutput({ fields: [], observations: [{ kind: 'period', raw: 'kvartal', sources: [{ ...source, start: 1 }] }], limitations: [] }, packet)).toThrow('economy-output-source-mismatch')
  expect(() => validateEconomyTrialOutput({ fields: [], observations: [], limitations: [], technicalComplete: true }, packet)).toThrow()
  const unsupported = response(packet); unsupported.fields.find(item => item.id === 'price')!.amount = '12000000'
  expect(() => validateEconomyTrialOutput(unsupported, packet)).toThrow('economy-unsupported-value')
  const badRaw = response(packet); badRaw.observations = [{ kind: 'period', raw: 'per år', sources: [source] }]
  expect(() => validateEconomyTrialOutput(badRaw, packet)).toThrow('economy-raw-observation-mismatch')

})
it('ekte offline PDF-preflight krever separat fasit- og betalt godkjenning, pris/telling/historikk', async () => {
  const bytes = codeFirstPdf(['Prisantydning: 3 000 000 kr']), format = await validatePdf(bytes, 'syntetisk.pdf', { maxPages: 200 })
  if (format.status !== 'format-validated') throw new Error('format')
  const extracted = await extractImport(format)
  const basis = { ...fixture(), hash: format.reportHash, ...extracted }
  const packet = prepareEconomyTrial(bytes, basis, [1])
  const result = await prepareEconomyPreflight(packet, bytes, basis)
  expect(result).toMatchObject({ ready: false, externalCalls: 0, reservationsCreated: 0 })
  expect(result.blockers).toEqual(expect.arrayContaining(['economy-human-oracle-approval-required', 'economy-paid-live-approval-required', 'server-token-count-required', 'token-count-price-unverified', 'budget-history-unavailable']))
  const approved = await prepareEconomyPreflight(packet, bytes, basis, { oracleDigest: result.oracleDigest, liveRequestDigest: result.requestDigest })
  expect(approved.ready).toBe(false)
  expect(approved.blockers).toContain('token-count-price-unverified')
  const forgedBasis = structuredClone(basis); forgedBasis.pages[0]!.text = 'falsk tekst'
  const forged = prepareEconomyTrial(bytes, forgedBasis, [1])
  await expect(prepareEconomyPreflight(forged, bytes, forgedBasis)).rejects.toThrow('economy-original-extraction-mismatch')
})
it('økonomirequest gjenbruker konservativ felleskvote og ukjent countpris stopper før fetch', async () => {
  const packet = prepareEconomyTrial(original, fixture(), [1]); let calls = 0
  await expect(countSemanticInput(packet.request, { transport: createSdkTokenCountTransport({ apiKey: 'not-a-real-key', fetch: async () => { calls++; throw new Error('network forbidden') } }) })).rejects.toThrow('token-count-price-unverified')
  expect(calls).toBe(0)
  const receipt = await countSemanticInput(packet.request, { transport: createOfflineTokenCountTransport(async () => new Response(JSON.stringify({ object: 'response.input_tokens', input_tokens: 40_000 }), { headers: { 'content-type': 'application/json' } })) })
  const ledger = new AnalysisBudget(packet.basis.hash, { historyRestored: true })
  ledger.reserve('b'.repeat(64), 'c'.repeat(64), '0.03')
  const cost = preflightSemantic(packet.request, packet.basis.hash, ledger, { price: GLOBAL_STANDARD_PRICE, tokenCount: receipt, offlineTest: true })
  expect(cost).toMatchObject({ status: 'blocked', reason: 'analysis-budget-exceeded' })
  expect(ledger.snapshot()).toHaveLength(1)
  packet.request.max_output_tokens--
  expect(preflightSemantic(packet.request, packet.basis.hash, ledger, { price: GLOBAL_STANDARD_PRICE, tokenCount: receipt, offlineTest: true }).reason).toBe('token-count-evidence-mismatch')
})

it('krever hvert fast felt én gang og beholder uavklart menneskelig kontroll', () => {
  const packet = prepareEconomyTrial(original, fixture(), [1]), valid = response(packet)
  expect(validateEconomyTrialOutput(valid, packet).candidate).toMatchObject({ confirmed: false, humanReferenceComparison: 'required', semanticCompleteness: 'unresolved', rawSelectedText: packet.proposedOracle.rawSelectedText })
  const missing = response(packet); missing.fields.pop()
  expect(() => validateEconomyTrialOutput(missing, packet)).toThrow('economy-fixed-fields-required')
  const duplicate = response(packet); duplicate.fields.push(duplicate.fields[0]!)
  expect(() => validateEconomyTrialOutput(duplicate, packet)).toThrow('economy-duplicate-field')
  const noQualifications = response(packet); noQualifications.observations = []
  expect(() => validateEconomyTrialOutput(noQualifications, packet)).toThrow('economy-qualification-observation-required')
  for (const raw of ['kvartal', 'mva']) {
    const partial = response(packet); partial.observations = [{ kind: 'period', raw, sources: [packet.proposedOracle.sourceAnchors[0]!] }]
    expect(() => validateEconomyTrialOutput(partial, packet)).toThrow('economy-qualification-observation-required')
  }
})
it('avviser feil kategori, oppdiktet inkludering/gjeld, originaltekst og annen lokal tallpost', () => {
  const basis = fixture(); basis.pages[0]!.text = 'Prisantydning: 3 000 000 kr\nFellesgjeld: 200 000 kr'
  const packet = prepareEconomyTrial(original, basis, [1])
  for (const change of [
    { category: 'recurring' }, { includedIn: 'totalPrice' }, { debtPart: '200000' }, { originalText: 'oppdiktet' },
  ]) {
    const out = response(packet); Object.assign(out.fields.find(item => item.id === 'price')!, change)
    expect(() => validateEconomyTrialOutput(out, packet)).toThrow()
  }
  const unrelated = response(packet), price = unrelated.fields.find(item => item.id === 'price')!
  price.amount = '200000'; price.sources = [packet.proposedOracle.sourceAnchors[0]!]; price.originalText = price.sources[0]!.quote
  expect(() => validateEconomyTrialOutput(unrelated, packet)).toThrow('economy-local-explicit-mismatch')
  const sameValueBasis = fixture(); sameValueBasis.pages[0]!.text = 'Prisantydning: 3 000 000 kr\nFellesgjeld: 3 000 000 kr'
  const sameValuePacket = prepareEconomyTrial(original, sameValueBasis, [1]), wrongSource = response(sameValuePacket)
  const debtSource = wrongSource.fields.find(item => item.id === 'sharedDebt')!.sources[0]!
  Object.assign(wrongSource.fields.find(item => item.id === 'price')!, { sources: [debtSource], originalText: debtSource.quote })
  expect(() => validateEconomyTrialOutput(wrongSource, sameValuePacket)).toThrow('economy-local-source-mismatch')
  const conflictBasis = fixture(); conflictBasis.pages[0]!.text = 'Prisantydning: 3 000 000 kr\nPrisantydning: 3 200 000 kr'
  const conflictPacket = prepareEconomyTrial(original, conflictBasis, [1])
  expect(validateEconomyTrialOutput(response(conflictPacket), conflictPacket).fields.find(item => item.id === 'price')!.status).toBe('conflict')
})
it.each([
  ['Kommunale avgifter -100 kr', '100', false], ['Kommunale avgifter −100 kr', '100', false], ['Kommunale avgifter 3.000.000 kr', '3000000', true],
  ['Kommunale avgifter 3.000.000 kr', '3000', false], ['Kommunale avgifter 12.345,67 kr', '12345.67', true],
  ['Kommunale avgifter 12\u00a0345,67 kr', '12345.67', true], ['Kommunale avgifter 3.000 kr', '3000', false],
])('bruker delt leksikalsk beløpskontroll for %s', (text, amount, accepted) => {
  const basis = fixture(); basis.pages[0]!.text = text
  const packet = prepareEconomyTrial(original, basis, [1]), out = response(packet), field = out.fields.find(item => item.id === 'municipalFees')!
  Object.assign(field, { amount, status: 'available', period: 'unknown', sources: [packet.proposedOracle.sourceAnchors[0]!], originalText: text })
  if (accepted) expect(validateEconomyTrialOutput(out, packet).fields).toBeTruthy()
  else expect(() => validateEconomyTrialOutput(out, packet)).toThrow('economy-unsupported-value')
})
it.each([
  ['Kommunale avgifter 100 kr. Dette går bra.', 'year', false],
  ['Kommunale avgifter 100 kr. Termin År 2026.', 'year', false],
  ['Kommunale avgifter 100 kr per år', 'year', true],
  ['Kommunale avgifter 100 kr årlig', 'year', true],
  ['Kommunale avgifter 100 kr per måned', 'month', true],
  ['Kommunale avgifter 100 kr per kvartal', 'once', false],
  ['Kommunale avgifter 100 kr per kvartal', 'year', false],
  ['Kommunale avgifter 100 kr per kvartal', 'unknown', true],
  ['Kommunale avgifter 100 kr', 'once', false],
] as const)('krever eksplisitt periode i %s', (text, period, accepted) => {
  const basis = fixture(); basis.pages[0]!.text = text
  const packet = prepareEconomyTrial(original, basis, [1]), out = response(packet), field = out.fields.find(item => item.id === 'municipalFees')!
  Object.assign(field, { amount: '100', status: 'available', period, sources: [sourceFor(basis, 1, 0, text.length)], originalText: text })
  if (accepted) expect(validateEconomyTrialOutput(out, packet).candidate.confirmed).toBe(false)
  else expect(() => validateEconomyTrialOutput(out, packet)).toThrow('economy-unsupported-period')
})

it('bevarer like beløp med motstridende periode/år og krever hvert komplette originalbelegg', () => {
  const basis = fixture(); basis.pages[0]!.text = 'Kommunale avgifter: 100 kr per måned i 2025\nKommunale avgifter: 100 kr per år i 2026'
  const packet = prepareEconomyTrial(original, basis, [1]), out = response(packet)
  const field = out.fields.find(item => item.id === 'municipalFees')!
  expect(field.status).toBe('conflict')
  Object.assign(field, { period: 'unknown', year: null })
  expect(validateEconomyTrialOutput(out, packet).fields.find(item => item.id === 'municipalFees')).toMatchObject({ period: 'unknown', year: null, status: 'conflict' })
  const dropped = structuredClone(out), droppedField = dropped.fields.find(item => item.id === 'municipalFees')!
  droppedField.sources = [field.sources[0]!]
  droppedField.alternatives = [{ amount: '100', source: field.sources[0]! }]
  droppedField.originalText = field.sources[0]!.quote
  expect(() => validateEconomyTrialOutput(dropped, packet)).toThrow('economy-local-conflict-source-loss')
  const trimmed = structuredClone(out), trimmedField = trimmed.fields.find(item => item.id === 'municipalFees')!
  trimmedField.sources = trimmedField.sources.map(source => sourceFor(basis, 1, source.start, source.start + source.quote.indexOf(' per ')))
  trimmedField.alternatives = [{ amount: '100', source: trimmedField.sources[1]! }]
  trimmedField.originalText = trimmedField.sources.map(source => source.quote).join('\n')
  expect(() => validateEconomyTrialOutput(trimmed, packet)).toThrow('economy-local-conflict-source-loss')
  for (const changes of [{ period: 'month' }, { year: '2025' }]) {
    const unsupported = structuredClone(out); Object.assign(unsupported.fields.find(item => item.id === 'municipalFees')!, changes)
    expect(() => validateEconomyTrialOutput(unsupported, packet)).toThrow('economy-local-conflicting-qualifiers')
  }
})
