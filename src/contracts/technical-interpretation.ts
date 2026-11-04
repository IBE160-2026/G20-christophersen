import { z } from 'zod'
import { ReportHashSchema } from './document-analysis.ts'
import { PdfSourceSchema } from './pdf-source.ts'
import { VisualRegionSchema, visualRegionUnion, type VisualAnalysis } from './local-visual.ts'

export const TechnicalTargetReasonSchema = z.enum(['unlinked-grade', 'unlinked-deviation', 'unresolved-text'])
export const TechnicalInterpretationSourceSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('visual-region'), documentHash: ReportHashSchema, documentName: z.string().min(1).max(255),
    pdfPage: z.number().int().min(1).max(200), rasterDigest: ReportHashSchema, region: VisualRegionSchema,
    lineIndices: z.array(z.number().int().nonnegative()).max(2000), symbolIndices: z.array(z.number().int().nonnegative()).max(500) }),
  z.strictObject({ kind: z.literal('pdf-text'), source: PdfSourceSchema }),
])
export const TechnicalInterpretationPlanSchema = z.strictObject({
  version: z.literal('technical-targets-1'), status: z.enum(['requires-approval', 'not-needed']),
  documentHash: ReportHashSchema, documentName: z.string().min(1).max(255),
  coverageStatus: z.literal('incomplete'), candidateCount: z.number().int().nonnegative(),
  budget: z.strictObject({ limitUsd: z.literal('0.20'), reservedUsd: z.literal('0.00000000'),
    reportedRemainingUsd: z.string().nullable(), history: z.literal('unverified'), blockers: z.array(z.string().min(1).max(300)).min(1).max(8) }),
  instructions: z.string().min(1).max(3000),
  targets: z.array(z.strictObject({ id: z.string().min(1).max(100), reason: TechnicalTargetReasonSchema,
    explanation: z.string().min(1).max(1000), missingContextPages: z.array(z.number().int().min(1).max(200)).max(2), sources: z.array(TechnicalInterpretationSourceSchema).min(1).max(2) })).max(12),
  deferred: z.array(z.strictObject({ pdfPage: z.number().int().min(1).max(200), reason: TechnicalTargetReasonSchema,
    count: z.number().int().positive(), cause: z.enum(['target-limit', 'page-limit', 'source-too-large', 'image-unavailable']) })).max(2400),
  unresolvedPages: z.array(z.number().int().min(1).max(200)).max(200),
})
export type TechnicalInterpretationPlan = z.infer<typeof TechnicalInterpretationPlanSchema>
export type TechnicalInterpretationSource = z.infer<typeof TechnicalInterpretationSourceSchema>

type SourceBasis = { reportHash: string; documentName: string; pageCount: number;
  pages: readonly { pdfPage: number; text: string }[]; visualAnalysis?: VisualAnalysis; cost?: { remainingUsd: string }; role: 'prospectus' | 'report'; sections: readonly { startPage: number; endPage: number }[] }
/** Planen kan ikke forandre originalkilde, OCR-indekser eller region etter uttrekk. */
export function technicalInterpretationSourceError(outcome: SourceBasis, plan: TechnicalInterpretationPlan): string | null {
  if (plan.documentHash !== outcome.reportHash || plan.documentName !== outcome.documentName) return 'Tolkningsplanen gjelder et annet originaldokument.'
  if (plan.budget.reportedRemainingUsd !== (outcome.cost?.remainingUsd ?? null)) return 'Tolkningsplanen har endret rapportert, uverifisert budsjettrest.'
  if (new Set(plan.targets.map(target => target.id)).size !== plan.targets.length
    || new Set(plan.unresolvedPages).size !== plan.unresolvedPages.length
    || plan.unresolvedPages.some(page => page > outcome.pageCount)
    || plan.deferred.some(item => item.pdfPage > outcome.pageCount)
    || plan.targets.some(target => target.missingContextPages.some(page => page > outcome.pageCount || !plan.unresolvedPages.includes(page)))
    || plan.targets.length + plan.deferred.reduce((sum, item) => sum + item.count, 0) !== plan.candidateCount
    || plan.status !== (plan.candidateCount ? 'requires-approval' : 'not-needed')) return 'Tolkningsplanens mål og utelatte områder stemmer ikke.'
  const selectedPages = new Set<number>()
  for (const target of plan.targets) for (const source of target.sources) {
    const original = source.kind === 'pdf-text' ? source.source : source
    selectedPages.add(original.pdfPage)
    if (original.documentHash !== outcome.reportHash || original.documentName !== outcome.documentName || original.pdfPage > outcome.pageCount
      || !(outcome.role === 'report' && !outcome.sections.length || outcome.sections.some(section => original.pdfPage >= section.startPage && original.pdfPage <= section.endPage))) return 'Tolkningsmålet mangler riktig originaldokument og fysisk side.'
    if (source.kind === 'pdf-text') {
      const page = outcome.pages[source.source.pdfPage - 1]
      if (!page || page.text.slice(source.source.start, source.source.end) !== source.source.quote || source.source.end - source.source.start !== source.source.quote.length
        || source.source.quote.length > 2000) return 'Tolkningsmålets tekst er ikke et ordrett originalområde.'
    } else {
      const page = outcome.visualAnalysis?.pages.find(page => page.pdfPage === source.pdfPage)
      const lines = source.lineIndices.map(index => page?.lines[index]), symbols = source.symbolIndices.map(index => page?.symbols[index])
      if (!page || page.error || page.rasterDigest !== source.rasterDigest || [...lines, ...symbols].some(item => !item)
        || !lines.length && !symbols.length || new Set(source.lineIndices).size !== source.lineIndices.length
        || new Set(source.symbolIndices).size !== source.symbolIndices.length
        || source.region.width * source.region.height > 0.65
        || JSON.stringify(visualRegionUnion([...lines, ...symbols].map(item => item!.box))) !== JSON.stringify(source.region)) return 'Tolkningsmålets bildeområde avviker fra bevart OCR og originalrender.'
    }
  }
  return selectedPages.size > 8 ? 'Tolkningsplanen overskrider åtte målrettede sider.' : null
}
