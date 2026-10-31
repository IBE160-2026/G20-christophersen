import type { EconomyField } from '../../contracts/document-import.ts'

/** Hele dokumentets sikre lokale felt beholdes også når KI bare leser et utvalg. */
export function mergeUploadedEconomy(local: EconomyField[], interpreted: EconomyField[]): EconomyField[] {
  return local.map(original => {
    const proposal = interpreted.find(field => field.id === original.id)
    if (!proposal || proposal.amount === null && proposal.status !== 'conflict') return structuredClone(original)
    if (original.amount === null) {
      if (original.status === 'conflict') throw new Error('local-economy-unmergeable-conflict')
      return structuredClone(proposal)
    }
    const merged = structuredClone(original)
    const key = (source: EconomyField['sources'][number]) => `${source.pdfPage}:${source.start}:${source.end}`
    const sources = [...new Map([...original.sources, ...proposal.sources].map(source => [key(source), source])).values()]
    // Begrensninger skal stoppe svaret, aldri slette kildebelagt motstrid.
    if (sources.length > 12) throw new Error('local-economy-evidence-limit')
    merged.sources = sources
    const periodConflict = original.period !== 'unknown' && proposal.period !== 'unknown' && original.period !== proposal.period
    const yearConflict = original.year !== null && proposal.year !== null && original.year !== proposal.year
    const alternatives = [...original.alternatives, ...proposal.alternatives,
      ...(proposal.amount !== null && (proposal.amount !== original.amount || periodConflict || yearConflict) ? [{ amount: proposal.amount, source: proposal.sources[0]! }] : [])]
    const uniqueAlternatives = [...new Map(alternatives.map(item => [`${item.amount}:${key(item.source)}`, item])).values()]
    if (uniqueAlternatives.length > 10) throw new Error('local-economy-evidence-limit')
    merged.alternatives = uniqueAlternatives
    if (merged.alternatives.length) merged.status = 'conflict'
    if (original.period === 'unknown') merged.period = proposal.period
    if (original.year === null) merged.year = proposal.year
    merged.originalText = merged.sources.map(source => source.quote).join('\n').slice(0, 4000)
    return merged
  })
}
