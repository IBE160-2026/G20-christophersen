import { createHash } from 'node:crypto'
import { expect, it } from 'vitest'
import { prepareEconomyTrial, verifyEconomyTrial } from '../../src/backend/import/economy-trial.ts'
import { createEconomySourceCatalogue, economyTextConfiguration } from '../../src/backend/import/economy-request.ts'
import { validateCompactEconomyOutput } from '../../src/backend/import/economy-compact.ts'
import { quoteContainsAmount } from '../../src/backend/import/representative-oracle.ts'
import type { ImportBasis } from '../../src/backend/import/local-plan.ts'

const bytes = Buffer.from('compact synthetic bytes')
function fixture(text = 'Prisantydning: 3 000 000 kr\nKommunale avgifter 3 000 kr per kvartal inkl. mva.') {
  const basis: ImportBasis = { hash: createHash('sha256').update(bytes).digest('hex'), name: 'synthetic.pdf', role: 'prospectus', requestId: 'compact', parentHash: null, attachmentId: null, attachments: [],
    pages: [{ pdfPage: 1, status: 'readable', text, reason: null, rasterUnprocessed: false }, { pdfPage: 2, status: 'readable', text: 'UNSELECTED', reason: null, rasterUnprocessed: false }] }
  return prepareEconomyTrial(bytes, basis, [1])
}
function response(packet: ReturnType<typeof fixture>) {
  const catalogue = createEconomySourceCatalogue(packet.basis, packet.selectedPages)
  const idsFor = (source: { pdfPage: number; start: number; end: number }) => catalogue.filter(segment => segment.pdfPage === source.pdfPage && segment.start >= source.start && segment.end <= source.end).map(segment => segment.id)
  return { fields: packet.proposedOracle.fields.map(field => ({ id: field.id, status: field.status, amount: field.amount, period: field.period, year: field.year, nature: field.nature,
    sourceIds: [...new Set(field.sources.flatMap(idsFor))], alternatives: field.alternatives.map(item => ({ amount: item.amount, sourceId: idsFor(item.source).find(id => quoteContainsAmount(catalogue.find(segment => segment.id === id)!.text, item.amount!))! })), reason: null })),
    observations: catalogue.map(segment => ({ kind: 'period' as 'period' | 'vat', amount: null as string | null, sourceIds: [segment.id], reason: null })), limitations: [], processedSourceIds: catalogue.map(segment => segment.id) }
}
it('sends selected text once, preserves UTF16 whitespace and deterministically hydrates code-owned sources', () => {
  const packet = fixture(), catalogue = createEconomySourceCatalogue(packet.basis, packet.selectedPages)
  const payload = JSON.parse(packet.request.input[0].content[0].text)
  expect(catalogue.map(segment => segment.id)).toEqual(catalogue.map((_, index) => index.toString(36)))
  expect(createEconomySourceCatalogue(packet.basis, [2, 1])).toEqual(createEconomySourceCatalogue(packet.basis, [1, 2]))
  expect(payload.sourceSegments.map((segment: [string, string]) => segment[1]).join('')).toBe(packet.basis.pages[0]!.text)
  expect(packet.request.input[0].content[0].text).not.toContain('UNSELECTED')
  expect(payload).not.toHaveProperty('pages')
  expect(payload.localFields[0]).not.toHaveProperty('originalText')
  expect(verifyEconomyTrial(packet, bytes, packet.basis)).toBe(true)
  const compact = response(packet); compact.observations[0]!.amount = '3000000'
  const withReasons = { ...compact, fields: compact.fields.map(field => ({ ...field, reason: 'Kort begrunnelse' })), observations: compact.observations.map(item => ({ ...item, reason: 'Eksplisitt kildebeløp' })) }
  const hydrated = validateCompactEconomyOutput(withReasons, packet)
  expect(hydrated.compactInterpretation).toEqual(withReasons)
  expect(hydrated.fields[0]).toMatchObject({ amount: '3000000', currency: 'NOK', label: 'Prisantydning', includedIn: null, debtPart: null })
  expect(hydrated.fields[0]!.sources[0]!.printedPage).toBeNull()
  expect(hydrated.fields[0]!.originalText).toBe(hydrated.fields[0]!.sources.map(source => source.quote).join('\n'))
  expect(hydrated.candidate).toMatchObject({ confirmed: false, semanticCompleteness: 'unresolved', humanReferenceComparison: 'required' })
  expect(hydrated.completeness).toMatchObject({ sourceCount: catalogue.length, sourceCoverageComplete: true, semanticCompleteness: 'unresolved' })
  const long = fixture('😀  \n' + '😀'.repeat(4100) + '\n\t ')
  const segments = createEconomySourceCatalogue(long.basis, [1])
  expect(segments.map(segment => segment.text).join('')).toBe(long.basis.pages[0]!.text)
  expect(segments.every(segment => !/[\uD800-\uDBFF]$/u.test(segment.text) && !/^[\uDC00-\uDFFF]/u.test(segment.text))).toBe(true)
  expect(segments.every((segment, i) => segment.start === (segments[i - 1]?.end ?? 0) && segment.text === long.basis.pages[0]!.text.slice(segment.start, segment.end))).toBe(true)
})
it('rejects missing, duplicated, unknown coverage IDs and forged evidence properties', () => {
  const packet = fixture()
  for (const mutate of [
    (out: ReturnType<typeof response>) => { out.processedSourceIds.pop() },
    (out: ReturnType<typeof response>) => { out.processedSourceIds.push(out.processedSourceIds[0]!) },
    (out: ReturnType<typeof response>) => { out.processedSourceIds[0] = 'p1:0:forged' },
  ]) { const out = response(packet); mutate(out); expect(() => validateCompactEconomyOutput(out, packet)).toThrow('economy-processed-source-coverage-mismatch') }
  const unknown = response(packet); unknown.fields[0]!.sourceIds = ['p2:0:10']
  expect(() => validateCompactEconomyOutput(unknown, packet)).toThrow('economy-unknown-source-id')
  const duplicate = response(packet); duplicate.fields[0]!.sourceIds.push(duplicate.fields[0]!.sourceIds[0]!)
  expect(() => validateCompactEconomyOutput(duplicate, packet)).toThrow('economy-duplicate-source-id')
  for (const key of ['quote', 'start', 'printedPage', 'documentHash', 'currency', 'category', 'label', 'originalText']) {
    const out = response(packet); Object.assign(out.fields[0]!, { [key]: 'forged' })
    expect(() => validateCompactEconomyOutput(out, packet)).toThrow()
  }
  expect(JSON.stringify(economyTextConfiguration())).not.toMatch(/\(\?[<!=]/)
})
it('retains value, year, period, fixed-field, qualification and observation-amount guards', () => {
  const packet = fixture()
  for (const change of [{ amount: '9000000' }, { year: '2099' }, { period: 'month' }, { status: 'missing', amount: null, sourceIds: [] }]) {
    const out = response(packet); Object.assign(out.fields[0]!, change)
    expect(() => validateCompactEconomyOutput(out, packet)).toThrow()
  }
  const omitted = response(packet); omitted.observations = []
  expect(() => validateCompactEconomyOutput(omitted, packet)).toThrow('economy-qualification-observation-required')
  const amount = response(packet); amount.observations[0]!.amount = '987654321'
  expect(() => validateCompactEconomyOutput(amount, packet)).toThrow('economy-unsupported-observation-amount')
  const missing = response(packet); missing.fields.pop()
  expect(() => validateCompactEconomyOutput(missing, packet)).toThrow()
  const duplicate = response(packet); duplicate.fields[1]!.id = duplicate.fields[0]!.id
  expect(() => validateCompactEconomyOutput(duplicate, packet)).toThrow('economy-duplicate-field')
})
it('preserves repeated local conflict anchors and rejects dropped or incompatible qualifiers', () => {
  const packet = fixture('Felleskostnader: 3 000 kr per måned i 2025\nFelleskostnader: 3 000 kr per år i 2026')
  const out = response(packet), field = out.fields.find(item => item.id === 'commonCosts')!
  field.period = 'unknown'; field.year = null
  const result = validateCompactEconomyOutput(out, packet)
  expect(result.fields.find(item => item.id === 'commonCosts')!.status).toBe('conflict')
  const incompatible = structuredClone(out); incompatible.fields.find(item => item.id === 'commonCosts')!.period = 'month'
  expect(() => validateCompactEconomyOutput(incompatible, packet)).toThrow('economy-local-conflicting-qualifiers')
  field.sourceIds = field.sourceIds.slice(0, 1); field.alternatives = []
  expect(() => validateCompactEconomyOutput(out, packet)).toThrow()
})

it('cites a semantic price separately from quarterly costs on the same page', () => {
  const packet = fixture('Prisantydning er 3 000 000 kr\nKommunale avgifter er 3 000 kr per kvartal inkl. mva.')
  expect(packet.proposedOracle.fields.find(field => field.id === 'price')!.amount).toBeNull()
  const out = response(packet), catalogue = createEconomySourceCatalogue(packet.basis, [1])
  const price = out.fields.find(field => field.id === 'price')!
  Object.assign(price, { status: 'available', amount: '3000000', nature: 'fact', period: 'once', sourceIds: [catalogue.find(segment => segment.text.includes('Prisantydning'))!.id] })
  const result = validateCompactEconomyOutput(out, packet)
  expect(result.fields.find(field => field.id === 'price')).toMatchObject({ amount: '3000000', period: 'once' })
  expect(result.candidate.qualifications.map(item => item.raw)).toEqual(['kvartal', 'mva'])
  const broad = structuredClone(out)
  broad.fields.find(field => field.id === 'price')!.sourceIds = catalogue.map(segment => segment.id)
  expect(() => validateCompactEconomyOutput(broad, packet)).toThrow('economy-unsupported-period')
})

it('transcribes explicit Norwegian whole-kroner suffixes without accepting ambiguous or signed amounts', () => {
  for (const [raw, amount] of [['12.345,‑ eks.mva', '12345'], ['67.890,‑', '67890'], ['12.345,- eks.mva', '12345']]) {
    expect(quoteContainsAmount(raw!, amount!)).toBe(true)
  }
  for (const raw of ['12.345', '12.345,', '12.345,‑5', '12.345,-5', '12.345,‑.50', '12.345,‑,50', '-12.345,‑', '− 12.345,‑', '112.345,‑', '1.12.345,‑']) {
    expect(quoteContainsAmount(raw, '12345')).toBe(false)
  }
  expect(quoteContainsAmount('3.000', '3000')).toBe(false)
  expect(quoteContainsAmount('12.345,‑', '12')).toBe(false)
  expect(quoteContainsAmount('12.345,‑', '345')).toBe(false)
})
it('requires complete multiline local evidence and retains known nonconflicting period and year', () => {
  const packet = fixture('Felleskostnader:\n3 000 kr\nper måned\ni 2025')
  const out = response(packet), field = out.fields.find(item => item.id === 'commonCosts')!
  expect(field).toMatchObject({ amount: '3000', period: 'month', year: '2025' })
  expect(validateCompactEconomyOutput(out, packet).fields.find(item => item.id === 'commonCosts')).toMatchObject({ period: 'month', year: '2025' })
  const incomplete = structuredClone(out), catalogue = createEconomySourceCatalogue(packet.basis, [1])
  incomplete.fields.find(item => item.id === 'commonCosts')!.sourceIds = [catalogue.find(segment => segment.text.includes('3 000'))!.id]
  expect(() => validateCompactEconomyOutput(incomplete, packet)).toThrow('economy-local-evidence-incomplete')
  const lostPeriod = structuredClone(out); lostPeriod.fields.find(item => item.id === 'commonCosts')!.period = 'unknown'
  expect(() => validateCompactEconomyOutput(lostPeriod, packet)).toThrow('economy-local-period-loss')
  const lostYear = structuredClone(out); lostYear.fields.find(item => item.id === 'commonCosts')!.year = null
  expect(() => validateCompactEconomyOutput(lostYear, packet)).toThrow('economy-local-year-loss')
  const falseConflict = structuredClone(out), conflict = falseConflict.fields.find(item => item.id === 'commonCosts')!
  conflict.status = 'conflict'; conflict.period = 'unknown'
  conflict.alternatives = [{ amount: '3000', sourceId: catalogue.find(segment => segment.text.includes('3 000'))!.id }]
  expect(() => validateCompactEconomyOutput(falseConflict, packet)).toThrow('economy-local-period-loss')
  const changed = fixture('Felleskostnader:\n3 000 kr\nper måned\ni 2025\nAlternativt anslag: 4 000 kr per år i 2026')
  const sourced = response(changed), sourcedField = sourced.fields.find(item => item.id === 'commonCosts')!
  sourcedField.status = 'conflict'; sourcedField.period = 'unknown'; sourcedField.year = null
  sourcedField.alternatives = [{ amount: '4000', sourceId: createEconomySourceCatalogue(changed.basis, [1]).find(segment => segment.text.includes('Alternativt'))!.id }]
  expect(validateCompactEconomyOutput(sourced, changed).fields.find(item => item.id === 'commonCosts')).toMatchObject({ status: 'conflict', period: 'unknown', year: null })
  const genuinelyUnknown = fixture('Felleskostnader: 3 000 kr')
  expect(validateCompactEconomyOutput(response(genuinelyUnknown), genuinelyUnknown).fields.find(item => item.id === 'commonCosts')).toMatchObject({ period: 'unknown', year: null })
})
it('coalesces adjacent observation and limitation citations without bridging uncited gaps', () => {
  const packet = fixture('kvartal mva\n'.repeat(201)), out = response(packet)
  out.observations = [{ kind: 'period', amount: null, sourceIds: out.processedSourceIds, reason: null }]
  const compact = { ...out, limitations: [{ text: 'Kildebegrensning', sourceIds: out.processedSourceIds.slice(0, 13) }] }
  const result = validateCompactEconomyOutput(compact, packet)
  expect(result.observations.length).toBeLessThan(200)
  expect(result.candidate.qualifications).toHaveLength(402)
  expect(result.limitations[0]!.sources).toHaveLength(1)
  expect(result.observations.every(item => item.raw.length <= 2000)).toBe(true)
  const gaps = { ...out, limitations: [{ text: 'Separate belegg', sourceIds: [out.processedSourceIds[0]!, out.processedSourceIds[2]!] }] }
  const gapResult = validateCompactEconomyOutput(gaps, packet)
  expect(gapResult.limitations[0]!.sources).toHaveLength(2)
  expect(gapResult.limitations[0]!.sources[0]!.end).toBeLessThan(gapResult.limitations[0]!.sources[1]!.start)
})

it('chunks scattered limitation evidence without citing intervening text', () => {
  const packet = fixture('mva\n'.repeat(26)), out = response(packet)
  const ids = out.processedSourceIds.filter((_, index) => index % 2 === 0)
  const result = validateCompactEconomyOutput({ ...out, limitations: [{ text: 'Spredte belegg', sourceIds: ids }] }, packet)
  expect(result.limitations.map(item => item.sources.length)).toEqual([12, 1])
  expect(result.limitations.every(item => item.text === 'Spredte belegg')).toBe(true)
  expect(result.limitations.flatMap(item => item.sources).map(source => source.start)).toEqual(ids.map(id => createEconomySourceCatalogue(packet.basis, [1]).find(segment => segment.id === id)!.start))
})
it('canonicalizes aggregate observation evidence while retaining each interpretation and validating every amount', () => {
  const packet = fixture('kvartal mva\n'.repeat(256)), out = response(packet)
  out.observations = [
    { kind: 'period', amount: null, sourceIds: out.processedSourceIds.filter((_, index) => index % 2 === 0), reason: null },
    { kind: 'period', amount: null, sourceIds: out.processedSourceIds.filter((_, index) => index % 2 === 1), reason: null },
    { kind: 'period', amount: null, sourceIds: out.processedSourceIds, reason: null },
  ]
  const result = validateCompactEconomyOutput(out, packet)
  expect(result.observations).toHaveLength(2)
  expect(result.observations.map(item => item.raw).join('')).toBe(packet.basis.pages[0]!.text)
  expect(result.compactInterpretation.observations).toEqual(out.observations)
  expect(result.candidate.qualifications).toHaveLength(512)
  const distinctKinds = structuredClone(out); distinctKinds.observations[2]!.kind = 'vat'
  expect(new Set(validateCompactEconomyOutput(distinctKinds, packet).observations.map(item => item.kind))).toEqual(new Set(['period', 'vat']))
  const unsupported = structuredClone(out); unsupported.observations[2]!.amount = '12345'
  expect(() => validateCompactEconomyOutput(unsupported, packet)).toThrow('economy-unsupported-observation-amount')
})
