import { createEconomyMoneyCatalogue } from './economy-money.ts'
import { createEconomyEvidence } from './economy-evidence.ts'
import { ReferencedEconomyOutputSchema, CompactEconomyOutputSchema, createEconomySourceCatalogue } from './economy-request.ts'
import { sourceFor } from './local-plan.ts'
import type { PdfSource } from '../../contracts/document-import.ts'
import { quoteContainsAmount } from './representative-oracle.ts'
import { validateEconomyTrialOutput } from './economy-trial.ts'
import type { EconomyTrial } from './economy-trial.ts'

type ReferenceEvidence = {
  alternativeIds: Map<string, string[]>
  observationAnchors: Map<number, PdfSource>
  qualificationIds: Map<'period' | 'vat', Set<string>>
}

/** Source identity and all quoted text are rebuilt from the original packet basis.
 * A coverage acknowledgement proves set equality only, never semantic correctness. */
export function validateCompactEconomyOutput(raw: unknown, packet: EconomyTrial, alternativeSources = new Map<string, PdfSource>(), valueAnchors = new Map<string, PdfSource>(), referenceEvidence?: ReferenceEvidence) {
  const compact = CompactEconomyOutputSchema.parse(raw)
  if (new Set(compact.fields.map(field => field.id)).size !== compact.fields.length) throw new Error('economy-duplicate-field')
  const catalogue = createEconomySourceCatalogue(packet.basis, packet.selectedPages, !packet.localExtractionVersion || packet.localExtractionVersion === 'local-economy-1')
  const byId = new Map(catalogue.map(segment => [segment.id, segment]))
  const processed = new Set(compact.processedSourceIds)
  if (processed.size !== compact.processedSourceIds.length || processed.size !== catalogue.length || [...processed].some(id => !byId.has(id))) throw new Error('economy-processed-source-coverage-mismatch')
  const resolve = (ids: string[]) => {
    if (new Set(ids).size !== ids.length) throw new Error('economy-duplicate-source-id')
    return ids.map(id => {
      const segment = byId.get(id)
      if (!segment) throw new Error('economy-unknown-source-id')
      return sourceFor(packet.basis, segment.pdfPage, segment.start, segment.end)
    })
  }
  const fieldSources = (ids: string[], originals: PdfSource[]) => {
    const selected = resolve(ids).sort((a, b) => a.pdfPage - b.pdfPage || a.start - b.start)
    const merged: PdfSource[] = []
    for (const source of selected) {
      const last = merged.at(-1)
      if (last && last.pdfPage === source.pdfPage && last.end === source.start && source.end - last.start <= 2000) merged[merged.length - 1] = sourceFor(packet.basis, source.pdfPage, last.start, source.end)
      else merged.push(source)
    }
    // Greedy 2000-unit grouping must not cut a fully selected local conflict
    // anchor: retain that exact original span as additional, code-owned evidence.
    for (const original of originals) {
      const pieces = selected.filter(source => source.pdfPage === original.pdfPage && source.start < original.end && source.end > original.start)
        .map(source => ({ ...source, start: Math.max(source.start, original.start), end: Math.min(source.end, original.end) }))
      if (pieces.length && pieces[0]!.start === original.start && pieces.at(-1)!.end === original.end
        && pieces.every((piece, index) => !index || pieces[index - 1]!.end === piece.start)
        && !merged.some(source => source.pdfPage === original.pdfPage && source.start <= original.start && source.end >= original.end)) {
        merged.push(sourceFor(packet.basis, original.pdfPage, original.start, original.end))
      }
    }
    return merged
  }
  const fields = compact.fields.map(field => {
    const local = packet.proposedOracle.fields.find(item => item.id === field.id)!
    const originals = [...local.sources, ...local.alternatives.map(item => item.source)]
    const sources = fieldSources(field.sourceIds, [...originals, ...(valueAnchors.has(field.id) ? [valueAnchors.get(field.id)!] : [])])
    const alternatives = field.alternatives.map((item, index) => ({ amount: item.amount, source: alternativeSources.get(`${field.id}:${index}`) ?? resolve([item.sourceId])[0]! }))
    if (local.amount !== null) {
      const selected = resolve([...new Set([...field.sourceIds, ...field.alternatives.flatMap((item, index) => referenceEvidence?.alternativeIds.get(`${field.id}:${index}`) ?? [item.sourceId])])])
      if (originals.some(original => {
        const pieces = selected.filter(source => source.pdfPage === original.pdfPage && source.start >= original.start && source.end <= original.end).sort((a, b) => a.start - b.start)
        return !pieces.length || pieces[0]!.start !== original.start || pieces.at(-1)!.end !== original.end
          || pieces.some((piece, index) => index > 0 && pieces[index - 1]!.end !== piece.start)
      })) throw new Error('economy-local-evidence-incomplete')
      if (local.status !== 'conflict') {
        const evidence = [...sources.map(source => ({ amount: field.amount, source })), ...alternatives]
          .filter(item => item.amount !== null && quoteContainsAmount(item.source.quote, item.amount))
        const actualConflict = field.status === 'conflict' && alternatives.length > 0
        const explicitPeriods = (quote: string) => [
          ...(/(?:\bper|\bpr\.?|\/)\s*(?:måned|mnd)\b|\bmånedlig\b/iu.test(quote) ? ['month'] : []),
          ...(/(?:\bper|\bpr\.?|\/)\s*år\b|(?<!\p{L})årlig(?!\p{L})/iu.test(quote) ? ['year'] : []),
          ...(/\bkvartal/iu.test(quote) ? ['quarter'] : []),
        ]
        if (local.period !== 'unknown' && field.period !== local.period
          && !(actualConflict && evidence.some(({ source }) => explicitPeriods(source.quote).some(period => period !== local.period)))) throw new Error('economy-local-period-loss')
        if (local.year !== null && field.year !== local.year
          && !(actualConflict && evidence.some(({ source }) => [...source.quote.matchAll(/\bi\s+(\d{4})\b/giu)].some(match => match[1] !== local.year)))) throw new Error('economy-local-year-loss')
      }
    }
    return { id: field.id, label: local.label, category: local.category, currency: local.currency,
      status: field.status, amount: field.amount, period: field.period, year: field.year, nature: field.nature,
      sources, originalText: sources.map(source => source.quote).join('\n'), includedIn: null, debtPart: null,
      alternatives }
  })
  const observationIds = new Map<typeof compact.observations[number]['kind'], Set<string>>()
  const observationAnchorsByKind = new Map<typeof compact.observations[number]['kind'], PdfSource[]>()
  for (const [index, item] of compact.observations.entries()) {
    const anchor = referenceEvidence?.observationAnchors.get(index)
    const anchors = anchor ? [anchor] : []
    const sources = fieldSources(item.sourceIds, anchors)
    observationAnchorsByKind.set(item.kind, [...(observationAnchorsByKind.get(item.kind) ?? []), ...anchors])
    if (item.amount !== null && !sources.some(source => quoteContainsAmount(source.quote, item.amount!))) throw new Error('economy-unsupported-observation-amount')
    // Validate each interpretation before canonicalizing repeated evidence. The
    // complete original amounts/reasons remain in compactInterpretation below.
    const ids = observationIds.get(item.kind) ?? new Set<string>()
    for (const id of item.sourceIds) ids.add(id)
    observationIds.set(item.kind, ids)
  }
  for (const [kind, ids] of referenceEvidence?.qualificationIds ?? []) {
    const combined = observationIds.get(kind) ?? new Set<string>()
    for (const id of ids) combined.add(id)
    observationIds.set(kind, combined)
  }
  const observations = [...observationIds].flatMap(([kind, ids]) => fieldSources([...ids], observationAnchorsByKind.get(kind) ?? []).map(source => ({ kind, raw: source.quote, sources: [source] })))
  const limitations = compact.limitations.flatMap(item => {
    const sources = fieldSources(item.sourceIds, [])
    const chunks: { text: string; sources: PdfSource[] }[] = []
    for (let index = 0; index < sources.length; index += 12) chunks.push({ text: item.text, sources: sources.slice(index, index + 12) })
    return chunks
  })
  // Legacy aggregate caps still reject genuinely unrepresentable evidence.
  const result = validateEconomyTrialOutput({ fields, observations, limitations }, packet)
  return { ...result, compactInterpretation: compact, completeness: { processedSourceIds: [...compact.processedSourceIds], sourceCount: catalogue.length,
    sourceCoverageComplete: true as const, semanticCompleteness: 'unresolved' as const, humanReferenceComparison: 'required' as const } }
}

/** New transport path: the model selects references, code alone owns digits.
 * compact-2 is retained above exclusively for historical response replay. */
export function validateReferencedEconomyOutput(raw: unknown, packet: EconomyTrial) {
  const compact = ReferencedEconomyOutputSchema.parse(raw)
  const catalogue = createEconomySourceCatalogue(packet.basis, packet.selectedPages, !packet.localExtractionVersion || packet.localExtractionVersion === 'local-economy-1')
  const money = new Map(createEconomyMoneyCatalogue(packet.basis, packet.selectedPages).map(value => [value.id, value]))
  const selected = (ids: string[]) => {
    if (new Set(ids).size !== ids.length) throw new Error('economy-duplicate-source-id')
    return ids.map(id => {
    const segment = catalogue.find(item => item.id === id)
    if (!segment) throw new Error('economy-unknown-source-id')
    return segment
    }).sort((a, b) => a.pdfPage - b.pdfPage || a.start - b.start)
  }
  const valueFor = (id: string | null, ids: string[]) => {
    if (id === null) return null
    const value = money.get(id)
    if (!value) throw new Error('economy-unknown-value-id')
    if (value.amount === null || value.ambiguity !== null) throw new Error('economy-ambiguous-value-id')
    let covered = value.source.start
    for (const segment of selected(ids)) if (segment.pdfPage === value.source.pdfPage && segment.start <= covered && segment.end > covered) covered = segment.end
    if (covered < value.source.end) throw new Error('economy-value-source-incomplete')
    return value.amount
  }
  const valueAnchors = new Map(compact.fields.filter(field => field.valueId !== null).map(field => [field.id, money.get(field.valueId!)?.source]).filter((entry): entry is [typeof compact.fields[number]['id'], PdfSource] => entry[1] !== undefined))
  const referenceEvidence: ReferenceEvidence = { alternativeIds: new Map(), observationAnchors: new Map(), qualificationIds: new Map() }
  const alternativeSources = new Map<string, PdfSource>()
  const fields = compact.fields.map(field => ({ ...field, amount: valueFor(field.valueId, field.sourceIds),
    alternatives: field.alternatives.map((item, index) => {
      const amount = valueFor(item.valueId, item.sourceIds)!
      const value = money.get(item.valueId)!
      referenceEvidence.alternativeIds.set(`${field.id}:${index}`, item.sourceIds)
      const segments = selected(item.sourceIds)
      // A cited contiguous context may be broader than the token. Preserve it
      // to retain qualifications, while requiring the complete value token.
      const samePage = segments.filter(segment => segment.pdfPage === value.source.pdfPage)
      let start = value.source.start, end = value.source.end
      for (const segment of samePage) if (segment.start <= end && segment.end >= start && Math.max(end, segment.end) - Math.min(start, segment.start) <= 2000) { start = Math.min(start, segment.start); end = Math.max(end, segment.end) }
      alternativeSources.set(`${field.id}:${index}`, sourceFor(packet.basis, value.source.pdfPage, start, end))
      return { amount, sourceId: item.sourceIds[0]! }
    }) }))
  const evidence = createEconomyEvidence(packet.basis, packet.selectedPages)
  const observations = compact.observations.map((item, index) => {
    const amount = valueFor(item.valueId, item.sourceIds)
    if (item.valueId !== null) referenceEvidence.observationAnchors.set(index, money.get(item.valueId)!.source)
    return { kind: item.kind, amount, sourceIds: item.sourceIds, reason: item.reason }
  })
  // Code-owned qualification observations satisfy the unchanged final validator
  // even when the model omits them. No semantic relation is inferred here.
  for (const item of evidence.qualifications) {
    const kind = item.kind.startsWith('vat') ? 'vat' : 'period'
    const ids = referenceEvidence.qualificationIds.get(kind) ?? new Set<string>()
    for (const segment of catalogue) if (segment.pdfPage === item.source.pdfPage && segment.start < item.source.end && segment.end > item.source.start) ids.add(segment.id)
    referenceEvidence.qualificationIds.set(kind, ids)
  }
  const legacy = { fields: fields.map(({ valueId: _valueId, ...field }) => field), observations,
    limitations: compact.limitations.map(item => ({ text: 'Originalt kildeutdrag; semantisk tolkning uavklart.', sourceIds: item.sourceIds })), processedSourceIds: compact.processedSourceIds }
  const result = validateCompactEconomyOutput(legacy, packet, alternativeSources, valueAnchors, referenceEvidence)
  return { ...result, limitations: result.limitations.flatMap(item => item.sources.map(source => ({ text: source.quote, sources: [source] }))),
    compactInterpretation: compact, deterministicEvidence: evidence }
}
