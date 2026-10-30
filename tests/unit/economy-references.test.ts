import { createHash } from 'node:crypto'
import { expect, it } from 'vitest'
import { createEconomyMoneyCatalogue } from '../../src/backend/import/economy-money.ts'
import { createEconomyEvidence } from '../../src/backend/import/economy-evidence.ts'
import { createEconomySourceCatalogue, ReferencedEconomyOutputSchema } from '../../src/backend/import/economy-request.ts'
import { validateReferencedEconomyOutput } from '../../src/backend/import/economy-compact.ts'
import { prepareEconomyTrial } from '../../src/backend/import/economy-trial.ts'

const bytes = Buffer.from('reference-only synthetic')
function fixture(text = 'Prisantydning er 1.234,56 kr\nAvgift er 4 500 kr per kvartal eks. mva, termin 2/2026.\nArealet er ikke oppmålt. Kjøper må benytte egne fagfolk og undersøke datarommet. Ingen aktive leieavtaler. Forsikring og strøm kommer i tillegg.') {
  return prepareEconomyTrial(bytes, { hash: createHash('sha256').update(bytes).digest('hex'), name: 'synthetic.pdf', role: 'prospectus', parentHash: null, attachmentId: null, requestId: 'refs', attachments: [], pages: [{ pdfPage: 1, text, status: 'readable', reason: null, rasterUnprocessed: false }] }, [1])
}
function response(packet: ReturnType<typeof fixture>) {
  return { fields: packet.proposedOracle.fields.map(field => ({ id: field.id, status: field.status, valueId: null as string | null, period: field.period, year: field.year, nature: field.nature, sourceIds: [] as string[], alternatives: [] as { valueId: string; sourceIds: string[] }[], reason: null })), observations: [] as { kind: 'amount' | 'period' | 'vat'; valueId: string | null; sourceIds: string[]; reason: string | null }[], limitations: [] as { text: string; sourceIds: string[] }[], processedSourceIds: createEconomySourceCatalogue(packet.basis, [1]).map(item => item.id) }
}
it('hydrates exact cents from code and retains code-owned qualifications and limitations on AI omission', () => {
  const packet = fixture(), out = response(packet)
  const value = createEconomyMoneyCatalogue(packet.basis, [1]).find(item => item.raw === '1.234,56')!
  const segment = createEconomySourceCatalogue(packet.basis, [1]).find(item => item.text.includes('Prisantydning'))!
  Object.assign(out.fields.find(item => item.id === 'price')!, { status: 'available', valueId: value.id, period: 'once', nature: 'fact', sourceIds: [segment.id] })
  const result = validateReferencedEconomyOutput(out, packet)
  expect(result.fields.find(item => item.id === 'price')!.amount).toBe('1234.56')
  expect(value.minorUnits).toBe('123456')
  expect(result.compactInterpretation).toEqual(out)
  expect(result.deterministicEvidence.qualifications.map(item => item.kind)).toEqual(expect.arrayContaining(['quarter', 'vat-excluded', 'term']))
  expect(result.deterministicEvidence.excerpts.map(item => item.kind)).toEqual(expect.arrayContaining(['unmeasured-area', 'own-experts', 'investigation', 'lease', 'other-operating-cost']))
  expect(result.deterministicEvidence.semanticCompleteness).toBe('unresolved')
  expect(result.candidate.confirmed).toBe(false)
})
it('rejects arbitrary amounts, unknown/ambiguous references, duplicate or incomplete sources', () => {
  const packet = fixture('Prisantydning er 3.000 kr\nEt annet beløp er 4 000 kr'), out = response(packet)
  const field = out.fields.find(item => item.id === 'price')!
  Object.assign(field, { status: 'available', valueId: 'unknown', sourceIds: [out.processedSourceIds[0]!] })
  expect(() => validateReferencedEconomyOutput(out, packet)).toThrow('economy-unknown-value-id')
  field.valueId = createEconomyMoneyCatalogue(packet.basis, [1]).find(item => item.raw === '3.000')!.id
  expect(() => validateReferencedEconomyOutput(out, packet)).toThrow('economy-ambiguous-value-id')
  field.valueId = createEconomyMoneyCatalogue(packet.basis, [1]).find(item => item.raw === '4 000')!.id
  expect(() => validateReferencedEconomyOutput(out, packet)).toThrow('economy-value-source-incomplete')
  field.sourceIds = [out.processedSourceIds[1]!, out.processedSourceIds[1]!]
  expect(() => validateReferencedEconomyOutput(out, packet)).toThrow('economy-duplicate-source-id')
  expect(ReferencedEconomyOutputSchema.safeParse({ ...out, fields: out.fields.map(item => ({ ...item, amount: '0' })) }).success).toBe(false)
})
it('retains original excerpts instead of presenting model limitation claims as facts', () => {
  const packet = fixture('Ingen aktive leieavtaler.\nArealet er ikke oppmålt.'), out = response(packet)
  out.limitations = [{ text: 'Alle 176 dokumenter er undersøkt og godkjent.', sourceIds: [out.processedSourceIds[0]!] }]
  const result = validateReferencedEconomyOutput(out, packet)
  expect(result.limitations[0]!.text).toBe('Ingen aktive leieavtaler.\n')
  expect(result.compactInterpretation.limitations[0]!.text).toContain('176')
  for (const item of result.deterministicEvidence.excerpts) {
    expect(item.raw).toBe(packet.basis.pages[0]!.text.slice(item.source.start, item.source.end))
    expect(item.source.pdfPage).toBe(1)
    expect(item.semanticStatus).toBe('unresolved')
  }
})
it('never promotes quarterly evidence to monthly/annual amounts or zero', () => {
  const packet = fixture('Kommunale avgifter er 4 500 kr per kvartal inkl. mva.'), out = response(packet)
  const value = createEconomyMoneyCatalogue(packet.basis, [1]).find(item => item.raw === '4 500')!
  const field = out.fields.find(item => item.id === 'municipalFees')!
  Object.assign(field, { status: 'available', valueId: value.id, nature: 'fact', period: 'unknown', sourceIds: [...out.processedSourceIds] })
  expect(validateReferencedEconomyOutput(out, packet).fields.find(item => item.id === field.id)!.amount).toBe('4500')
  field.period = 'month'
  expect(() => validateReferencedEconomyOutput(out, packet)).toThrow('economy-unsupported-period')
  expect(createEconomyEvidence(packet.basis, [1]).qualifications.some(item => item.kind === 'quarter')).toBe(true)
})
it('cannot override a safe local value', () => {
  const packet = fixture('Prisantydning: 3 000 000 kr\nAlternativt tall 4 000 000 kr'), out = response(packet)
  const value = createEconomyMoneyCatalogue(packet.basis, [1]).find(item => item.raw === '4 000 000')!
  const field = out.fields.find(item => item.id === 'price')!
  Object.assign(field, { valueId: value.id, sourceIds: out.processedSourceIds })
  expect(() => validateReferencedEconomyOutput(out, packet)).toThrow('economy-local-explicit-mismatch')
})
it('reassembles a completely cited numeric token across source partition boundaries', () => {
  const packet = fixture('x '.repeat(990) + 'Prisantydning er 1 234 567 890 123 456 789 kr'), out = response(packet)
  const value = createEconomyMoneyCatalogue(packet.basis, [1]).find(item => item.amount === '1234567890123456789')!
  expect(value).toBeDefined()
  Object.assign(out.fields.find(item => item.id === 'price')!, { status: 'available', valueId: value.id, period: 'once', nature: 'fact', sourceIds: out.processedSourceIds })
  expect(validateReferencedEconomyOutput(out, packet).fields.find(item => item.id === 'price')!.amount).toBe('1234567890123456789')
})
it('retains every multiline alternative citation and rejects an uncited gap', () => {
  const packet = fixture('Felleskostnader:\n3 000 kr\nper måned\ni 2025\nFelleskostnader:\n4 000 kr\nper år\ni 2026'), out = response(packet)
  const catalogue = createEconomySourceCatalogue(packet.basis, [1]), money = createEconomyMoneyCatalogue(packet.basis, [1])
  const local = packet.proposedOracle.fields.find(item => item.id === 'commonCosts')!, field = out.fields.find(item => item.id === 'commonCosts')!
  const idsFor = (source: { start: number; end: number }) => catalogue.filter(item => item.start >= source.start && item.end <= source.end).map(item => item.id)
  field.valueId = money.find(item => item.amount === local.amount)!.id
  field.sourceIds = idsFor(local.sources[0]!)
  field.alternatives = local.alternatives.map(item => ({ valueId: money.find(value => value.amount === item.amount && value.source.start >= item.source.start && value.source.end <= item.source.end)!.id, sourceIds: idsFor(item.source) }))
  field.period = 'unknown'; field.year = null
  expect(field.alternatives[0]!.sourceIds.length).toBeGreaterThan(1)
  expect(validateReferencedEconomyOutput(out, packet).fields.find(item => item.id === 'commonCosts')!.status).toBe('conflict')
  field.alternatives[0]!.sourceIds = field.alternatives[0]!.sourceIds.filter(id => !catalogue.find(item => item.id === id)!.text.includes('per år'))
  expect(() => validateReferencedEconomyOutput(out, packet)).toThrow('economy-local-evidence-incomplete')
})
it('preserves a referenced observation token across source partitions', () => {
  const packet = fixture('x '.repeat(990) + 'Et annet tall er 1 234 567 890 123 456 789 kr'), out = response(packet)
  const value = createEconomyMoneyCatalogue(packet.basis, [1]).find(item => item.amount === '1234567890123456789')!
  out.observations = [{ kind: 'amount', valueId: value.id, sourceIds: out.processedSourceIds, reason: 'Kildetall' }]
  const result = validateReferencedEconomyOutput(out, packet)
  expect(result.observations.some(item => item.raw === value.raw && item.sources[0]!.start === value.source.start && item.sources[0]!.end === value.source.end)).toBe(true)
  expect(result.compactInterpretation.observations).toEqual(out.observations)
  out.observations[0]!.sourceIds = [out.processedSourceIds[0]!]
  expect(() => validateReferencedEconomyOutput(out, packet)).toThrow('economy-value-source-incomplete')
})
it('canonicalizes 200 interpretations with code-owned VAT and period evidence before legacy caps', () => {
  const packet = fixture('Kvartal og mva.\nEt annet kildeutsagn.'), out = response(packet)
  out.observations = Array.from({ length: 200 }, (_, index) => ({ kind: 'period', valueId: null, sourceIds: [out.processedSourceIds[index % 2]!], reason: `Tolkning ${index}` }))
  const result = validateReferencedEconomyOutput(out, packet)
  expect(result.compactInterpretation.observations).toEqual(out.observations)
  expect(result.observations.length).toBeLessThanOrEqual(200)
  expect(result.observations.some(item => item.kind === 'vat' && item.raw.includes('mva'))).toBe(true)
  expect(result.observations.some(item => item.kind === 'period' && item.raw.includes('Kvartal'))).toBe(true)
})
it('serializes usable value IDs with lossless UTF16 source triples and locally grounded references', () => {
  const packet = fixture('Felleskostnader:\n3 000 kr\nper måned\ni 2025\nFelleskostnader:\n4 000 kr\nper år\ni 2026\n' + '😀 '.repeat(660) + 'Et annet tall er 1 234 567 890 123 456 789 kr\nTvetydig: 3.000 kr, prosent 25%.')
  const payload = JSON.parse(packet.request.input[0].content[0].text) as {
    sourceSegments: [string, string][]; money: [string, (string | number)[]][];
    localFields: { id: string; valueId: string | null; sourceIds: string[]; alternatives: { valueId: string | null; sourceIds: string[] }[] }[]
  }
  const catalogue = createEconomySourceCatalogue(packet.basis, [1]), money = createEconomyMoneyCatalogue(packet.basis, [1])
  const sourceSegments = new Map(payload.sourceSegments), pieces = new Map<string, { start: number; raw: string; sourceId: string }[]>()
  for (const [sourceId, triples] of payload.money) {
    expect(triples.length % 3).toBe(0)
    for (let index = 0; index < triples.length; index += 3) {
      const [valueId, relativeStart, length] = triples.slice(index, index + 3) as [string, number, number]
      expect(Number.isInteger(relativeStart) && relativeStart >= 0).toBe(true)
      expect(Number.isInteger(length) && length > 0).toBe(true)
      const text = sourceSegments.get(sourceId)!
      expect(relativeStart + length).toBeLessThanOrEqual(text.length)
      const segment = catalogue.find(item => item.id === sourceId)!
      pieces.set(valueId, [...(pieces.get(valueId) ?? []), { start: segment.start + relativeStart, raw: text.slice(relativeStart, relativeStart + length), sourceId }])
    }
  }
  const usable = money.filter(item => item.ambiguity === null)
  expect([...pieces.keys()].sort()).toEqual(usable.map(item => item.id).sort())
  for (const value of usable) {
    const parts = pieces.get(value.id)!.sort((a, b) => a.start - b.start)
    expect(parts.map(item => item.raw).join('')).toBe(value.raw)
    expect(parts[0]!.start).toBe(value.source.start)
  }
  expect([...pieces.values()].some(parts => parts.length > 1)).toBe(true)
  for (const field of payload.localFields) {
    const local = packet.proposedOracle.fields.find(item => item.id === field.id)!
    expect(money.find(item => item.id === field.valueId)!.amount).toBe(local.amount)
    expect(pieces.get(field.valueId!)!.every(part => field.sourceIds.includes(part.sourceId))).toBe(true)
    for (const [index, alternative] of field.alternatives.entries()) {
      expect(money.find(item => item.id === alternative.valueId)!.amount).toBe(local.alternatives[index]!.amount)
      expect(pieces.get(alternative.valueId!)!.every(part => alternative.sourceIds.includes(part.sourceId))).toBe(true)
    }
  }
  expect(payload.localFields.some(field => field.alternatives.length > 0)).toBe(true)
})
