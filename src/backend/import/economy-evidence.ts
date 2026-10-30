import { createEconomyMoneyCatalogue, createEconomyQualifierCatalogue } from './economy-money.ts'
import { sourceFor } from './local-plan.ts'
import type { ImportBasis } from './local-plan.ts'

/** Lexical evidence only: neighbouring text is retained without deciding legal,
 * financial or universal semantic coverage. All offsets are original UTF-16. */
export function createEconomyEvidence(basis: ImportBasis, selectedPages: number[]) {
  const patterns = [
    { kind: 'unmeasured-area', expression: /(?:ikke\s+(?:oppmålt|målt)|(?:areal\w*[^.\n]{0,100}(?:ikke\s+kontroll|ikke\s+oppmål|ikke\s+mål|umålt)))/giu },
    { kind: 'own-experts', expression: /(?:egne?\s+(?:fagfolk|rådgivere|sakkyndige)|(?:benytte|engasjere)[^.\n]{0,60}(?:fagfolk|sakkyndige))/giu },
    { kind: 'investigation', expression: /(?:datarom\w*|undersøk\w*|besiktig\w*)/giu },
    { kind: 'other-operating-cost', expression: /(?:forsikring\w*|strøm\w*|internett\w*|alarm\w*|øvrige\s+kostnader|kommer\s+i\s+tillegg)/giu },
    { kind: 'lease', expression: /(?:leie(?:avtal\w*|forhold\w*|kontrakt\w*)|utleid|utleie\w*)/giu },
  ]
  const excerpts: { kind: string; raw: string; source: ReturnType<typeof sourceFor>; semanticStatus: 'unresolved' }[] = []
  for (const pdfPage of [...new Set(selectedPages)].sort((a, b) => a - b)) {
    const page = basis.pages[pdfPage - 1]
    if (!page || page.status !== 'readable') throw new Error('economy-selected-page-unreadable')
    for (const { kind, expression } of patterns) for (const match of page.text.matchAll(expression)) {
      // Include neighbouring lines, capped below the shared source quote limit.
      const start = Math.max(0, match.index - 300), end = Math.min(page.text.length, match.index + match[0].length + 300)
      const source = sourceFor(basis, pdfPage, start, end)
      if (!excerpts.some(item => item.kind === kind && item.source.pdfPage === pdfPage && item.source.start === start && item.source.end === end)) excerpts.push({ kind, raw: source.quote, source, semanticStatus: 'unresolved' })
    }
  }
  return { numericCandidates: createEconomyMoneyCatalogue(basis, selectedPages), qualifications: createEconomyQualifierCatalogue(basis, selectedPages), excerpts,
    semanticCompleteness: 'unresolved' as const, humanReferenceComparison: 'required' as const }
}
