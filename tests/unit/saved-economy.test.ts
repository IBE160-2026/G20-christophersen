import { createHash } from 'node:crypto'
import { expect, it } from 'vitest'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { attachSavedEconomy, validateSavedEconomy, readPinnedEconomyJson } from '../../src/backend/import/saved-economy.ts'
import { prepareEconomyTrial } from '../../src/backend/import/economy-trial.ts'
import { createEconomySourceCatalogue } from '../../src/backend/import/economy-request.ts'
import { createEconomyMoneyCatalogue } from '../../src/backend/import/economy-money.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { DocumentImportSchema } from '../../src/contracts/document-import.ts'
const bytes = Buffer.from('synthetic saved economy only')
function fixture() {
  const basis = { hash: createHash('sha256').update(bytes).digest('hex'), name: 'synthetic.pdf', role: 'prospectus' as const, parentHash: null, attachmentId: null, requestId: 'old', attachments: [], pages: [{ pdfPage: 1, text: 'Prisantydning er 1.234,56 kr\nKommunale avgifter er 4 500 kr per kvartal eks. mva.\nIngen aktive leieavtaler. Forsikring kommer i tillegg.', status: 'readable' as const, reason: null, rasterUnprocessed: false }] }
  const packet = prepareEconomyTrial(bytes, basis, [1]), catalogue = createEconomySourceCatalogue(basis, [1])
  const value = createEconomyMoneyCatalogue(basis, [1]).find(item => item.amount === '1234.56')!
  const output = { fields: packet.proposedOracle.fields.map(field => ({ id: field.id, status: field.status, valueId: null as string | null, period: field.period, year: field.year, nature: field.nature, sourceIds: [] as string[], alternatives: [], reason: null })), observations: [], limitations: [], processedSourceIds: catalogue.map(item => item.id) }
  Object.assign(output.fields.find(item => item.id === 'price')!, { status: 'available', valueId: value.id, nature: 'stated-estimate', sourceIds: catalogue.filter(item => item.pdfPage === value.source.pdfPage && item.start < value.source.end && item.end > value.source.start).map(item => item.id) })
  const response = { status: 'completed', model: packet.request.model, output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(output) }] }] }
  return { basis, archive: { packet, output, response } }
}
it('gjenbruker bare samme original med ny opplastingsidentitet, beholder kilder og sperrer', async () => {
  const { basis, archive } = fixture(), current = { ...basis, name: 'renamed.pdf', requestId: 'new' }
  const local = await createCodeFirstImport(current), outcome = await attachSavedEconomy(local, bytes, current, async () => archive)
  expect(outcome.economy.analysis?.provenance).toBe('saved-same-document')
  expect(outcome.economy.fields.find(field => field.id === 'price')).toMatchObject({ amount: '1234.56', nature: 'stated-estimate', sources: [{ documentName: 'renamed.pdf' }] })
  expect(outcome.economy.analysis?.observations.some(item => item.kind === 'vat')).toBe(true)
  expect(outcome.economy.analysis?.observations.some(item => item.kind === 'lease')).toBe(true)
  expect(outcome.cost).toEqual(local.cost)
  expect(outcome.technical).toEqual(local.technical)
  expect(outcome.manifest).toEqual(local.manifest)
  expect(outcome.coverage.economy.status).toBe('incomplete')
})
it('avviser hashavvik, endret originaltekst, forespørsel, responstekst og ukjent verdi-ID', () => {
  const { basis, archive } = fixture()
  expect(() => validateSavedEconomy(archive, Buffer.from('other'), basis)).toThrow('saved-analysis-document-mismatch')
  expect(() => validateSavedEconomy(archive, bytes, { ...basis, pages: [{ ...basis.pages[0]!, text: 'other' }] })).toThrow('saved-analysis-package-mismatch')
  const changedRequest = structuredClone(archive); changedRequest.packet.request.max_output_tokens++
  expect(() => validateSavedEconomy(changedRequest, bytes, basis)).toThrow('saved-analysis-package-mismatch')
  const changedResponse = structuredClone(archive); changedResponse.response.output[0]!.content[0]!.text = '{}'
  expect(() => validateSavedEconomy(changedResponse, bytes, basis)).toThrow('saved-analysis-response-mismatch')
  const invalidValue = structuredClone(archive); invalidValue.output.fields[0]!.valueId = 'unknown'
  invalidValue.response.output[0]!.content[0]!.text = JSON.stringify(invalidValue.output)
  expect(() => validateSavedEconomy(invalidValue, bytes, basis)).toThrow('economy-unknown-value-id')
})
it('viser lokal fallback med konkret status uten økonomiverdier fra cache ved mangler/avvisning', async () => {
  const { basis, archive } = fixture(), local = await createCodeFirstImport(basis)
  for (const load of [async () => { throw Object.assign(new Error('missing'), { code: 'ENOENT' }) }, async () => ({ ...archive, packet: { ...archive.packet, originalSha256: '0'.repeat(64) } })]) {
    const outcome = await attachSavedEconomy(local, bytes, basis, load)
    expect(outcome.economy.fields).toEqual(local.economy.fields)
    expect(outcome.economy.analysis).toMatchObject({ provenance: 'local-only', requestDigest: null, observations: [] })
    expect(outcome.economy.analysis?.reason).toContain('Videre KI-analyse har ikke startet')
  }
})
it('felles kontrakt avviser endrede originalspenn og observasjonstekst', async () => {
  const { basis, archive } = fixture(), local = await createCodeFirstImport(basis)
  const outcome = await attachSavedEconomy(local, bytes, basis, async () => archive)
  expect(outcome.economy.analysis?.provenance).toBe('saved-same-document')
  const altered = structuredClone(outcome); altered.economy.analysis!.observations[0]!.sources[0]!.start++
  expect(DocumentImportSchema.safeParse(altered).success).toBe(false)
  const invented = structuredClone(outcome); invented.economy.analysis!.observations[0]!.raw = 'Invented observation'
  expect(DocumentImportSchema.safeParse(invented).success).toBe(false)
})

it('integritetsleseren avviser også gyldig JSON som er endret etter godkjenning og for store filer', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'saved-economy-')), file = join(directory, 'synthetic.json')
  try {
    const original = Buffer.from('{"source":"synthetic"}'), pin = createHash('sha256').update(original).digest('hex')
    await writeFile(file, original)
    expect(await readPinnedEconomyJson(pathToFileURL(file), pin)).toEqual({ source: 'synthetic' })
    await writeFile(file, '{"source":"changed"}')
    await expect(readPinnedEconomyJson(pathToFileURL(file), pin)).rejects.toThrow('saved-analysis-integrity')
    await writeFile(file, Buffer.alloc(8 * 1024 * 1024 + 1))
    await expect(readPinnedEconomyJson(pathToFileURL(file), pin)).rejects.toThrow('saved-analysis-integrity')
  } finally { await rm(directory, { recursive: true, force: true }) }
})

it('bevarer historisk ekstraksjonsmarkør mens ferske sider og hash fortsatt kontrolleres', () => {
  const { basis, archive } = fixture()
  const historicalBasis = { ...basis, kind: 'extracted' }
  archive.packet = prepareEconomyTrial(bytes, historicalBasis, [1])
  expect(validateSavedEconomy(archive, bytes, { ...basis, name: 'fresh.pdf', requestId: 'fresh' }).result.fields.find(field => field.id === 'price')?.amount).toBe('1234.56')
  expect(() => validateSavedEconomy(archive, bytes, { ...basis, pages: [{ ...basis.pages[0]!, text: 'Changed fresh text' }] })).toThrow('saved-analysis-package-mismatch')
})
