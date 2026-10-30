import { CompactEconomyOutputSchema, createEconomySourceCatalogue } from './economy-request.ts'
import { sourceFor } from './local-plan.ts'
import type { PdfSource } from '../../contracts/document-import.ts'
import { quoteContainsAmount } from './representative-oracle.ts'
import { validateEconomyTrialOutput } from './economy-trial.ts'
import type { EconomyTrial } from './economy-trial.ts'

/** Source identity and all quoted text are rebuilt from the original packet basis.
 * A coverage acknowledgement proves set equality only, never semantic correctness. */
export function validateCompactEconomyOutput(raw: unknown, packet: EconomyTrial) {
  const compact = CompactEconomyOutputSchema.parse(raw)
  if (new Set(compact.fields.map(field => field.id)).size !== compact.fields.length) throw new Error('economy-duplicate-field')
  const catalogue = createEconomySourceCatalogue(packet.basis, packet.selectedPages)
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
      const pieces = selected.filter(source => source.pdfPage === original.pdfPage && source.start >= original.start && source.end <= original.end)
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
    const sources = fieldSources(field.sourceIds, originals)
    const alternatives = field.alternatives.map(item => ({ amount: item.amount, source: resolve([item.sourceId])[0]! }))
    if (local.amount !== null) {
      const selected = resolve([...new Set([...field.sourceIds, ...field.alternatives.map(item => item.sourceId)])])
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
  for (const item of compact.observations) {
    const sources = fieldSources(item.sourceIds, [])
    if (item.amount !== null && !sources.some(source => quoteContainsAmount(source.quote, item.amount!))) throw new Error('economy-unsupported-observation-amount')
    // Validate each interpretation before canonicalizing repeated evidence. The
    // complete original amounts/reasons remain in compactInterpretation below.
    const ids = observationIds.get(item.kind) ?? new Set<string>()
    for (const id of item.sourceIds) ids.add(id)
    observationIds.set(item.kind, ids)
  }
  const observations = [...observationIds].flatMap(([kind, ids]) => fieldSources([...ids], []).map(source => ({ kind, raw: source.quote, sources: [source] })))
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
