import { describe, expect, it } from 'vitest'
import { prepareTechnicalInterpretation } from '../../src/backend/import/technical-interpretation.ts'
import { technicalInterpretationSourceError } from '../../src/contracts/technical-interpretation.ts'
import { addVisualTechnical } from '../../src/backend/import/visual-technical.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { DocumentImportSchema } from '../../src/contracts/document-import.ts'
import { AnalysisBudget } from '../../src/backend/import/budget.ts'
import { codeFirstBasis } from '../helpers/code-first.ts'
import type { LocalVisualEvidence } from '../../src/contracts/local-visual.ts'

const box = (x: number, y: number, width = 0.25, height = 0.015) => ({ x, y, width, height })
const line = (text: string, x: number, y: number) => ({ text, confidence: 1, box: box(x, y) })
async function visualOutcome(count = 1, linked = false) {
  const basis = codeFirstBasis(Array.from({ length: count }, () => 'Uleselig rapportbilde'))
  basis.role = 'report'
  for (const page of basis.pages) page.status = 'unreadable'
  const outcome = await createCodeFirstImport(basis)
  const evidence: LocalVisualEvidence = { version: 'local-visual-1', documentHash: basis.hash, documentName: basis.name,
    pages: basis.pages.map(page => ({ pdfPage: page.pdfPage, width: 1000, height: 1400, rasterDigest: 'b'.repeat(64), error: null,
      symbols: [{ grade: 'TG3', confidence: 1, text: 'TG3', box: box(0.08, 0.2, 0.03, 0.02) }],
      lines: [line('Bad øst', 0.13, 0.203), line('Beskrivelse', 0.08, 0.25), line('Vurdering av avvik:', 0.08, 0.3), line('Det er påvist lekkasje.', 0.08, 0.34),
        ...(linked ? [line('Konsekvens/tiltak', 0.08, 0.4)] : [])] })) }
  return addVisualTechnical(outcome, evidence)
}

describe('målrettet lokal forberedelse til TG-tolkning', () => {
  it('avgrenser uløst TG til originalregion uten å reservere eller tolke', async () => {
    const outcome = await visualOutcome(), before = structuredClone(outcome), ledger = new AnalysisBudget('test', { historyRestored: true })
    const plan = prepareTechnicalInterpretation(outcome)
    expect(plan).toMatchObject({ status: 'requires-approval', candidateCount: 1, coverageStatus: 'incomplete',
      budget: { limitUsd: '0.20', reservedUsd: '0.00000000', history: 'unverified' } })
    expect(plan.targets).toHaveLength(1)
    expect(plan.targets[0]).toMatchObject({ reason: 'unlinked-grade', sources: [{ kind: 'visual-region', documentHash: outcome.reportHash, pdfPage: 1, rasterDigest: 'b'.repeat(64) }] })
    expect(plan.targets[0]!.sources[0]!.kind === 'visual-region' && plan.targets[0]!.sources[0]!.region.height).toBeLessThan(0.4)
    expect(plan.unresolvedPages).toEqual([1])
    expect(technicalInterpretationSourceError(outcome, plan)).toBeNull()
    expect(ledger.snapshot()).toEqual([])
    expect(outcome).toEqual(before)
  })
  it('sender ikke sikkert koblede TG-funn eller alle usikre rapportsider automatisk til AI', async () => {
    const outcome = await visualOutcome(1, true), plan = prepareTechnicalInterpretation(outcome)
    expect(outcome.visualAnalysis!.pages[0]!.findings).toHaveLength(1)
    expect(plan.targets).toEqual([])
    expect(plan.status).toBe('not-needed')
    expect(plan.coverageStatus).toBe('incomplete')
    expect(plan.unresolvedPages).toEqual([1])
  })
  it('bevarer alle mål utelatt ved sidegrensen', async () => {
    const outcome = await visualOutcome(10), plan = prepareTechnicalInterpretation(outcome)
    expect(plan.targets).toHaveLength(8)
    expect(plan.deferred).toEqual([{ pdfPage: 9, reason: 'unlinked-grade', cause: 'page-limit', count: 1 }, { pdfPage: 10, reason: 'unlinked-grade', cause: 'page-limit', count: 1 }])
    expect(plan.candidateCount).toBe(10)
    expect(technicalInterpretationSourceError(outcome, plan)).toBeNull()
  })
  it('identifiserer avviksavsnitt uten TG-symbol som mulig fortsettelse', async () => {
    const outcome = await visualOutcome()
    outcome.visualAnalysis!.pages[0]!.symbols = []
    const plan = prepareTechnicalInterpretation(outcome)
    expect(plan.targets).toHaveLength(1)
    expect(plan.targets[0]!.reason).toBe('unlinked-deviation')
  })
  it('avviser manipulert hash, fysisk side, region og utelatte områder', async () => {
    const outcome = await visualOutcome(), original = prepareTechnicalInterpretation(outcome)
    for (const mutate of [
      (plan: typeof original) => { plan.documentHash = 'c'.repeat(64) },
      (plan: typeof original) => { const source = plan.targets[0]!.sources[0]!; if (source.kind === 'visual-region') source.pdfPage = 2 },
      (plan: typeof original) => { const source = plan.targets[0]!.sources[0]!; if (source.kind === 'visual-region') source.region.x += 0.01 },
      (plan: typeof original) => { plan.candidateCount++ },
    ]) {
      const plan = structuredClone(original); mutate(plan)
      expect(technicalInterpretationSourceError(outcome, plan)).not.toBeNull()
    }
  })
  it('bevarer ordrett avgrenset tekstkilde når OCR ikke finnes', async () => {
    const basis = codeFirstBasis(['Tilstandsrapport\nTG2\nAvvik uten sikker komponent.'])
    basis.role = 'report'
    const outcome = await createCodeFirstImport(basis), plan = prepareTechnicalInterpretation(outcome)
    expect(plan.targets[0]!.sources[0]!.kind).toBe('pdf-text')
    expect(technicalInterpretationSourceError(outcome, plan)).toBeNull()
    const source = plan.targets[0]!.sources[0]!
    if (source.kind === 'pdf-text') source.source.quote = 'Oppdiktet avvik.'
    expect(technicalInterpretationSourceError(outcome, plan)).not.toBeNull()
  })
  it('prioriterer TG med komponent foran fargefragmenter og bevarer utelatte mål', async () => {
    const outcome = await visualOutcome(), page = outcome.visualAnalysis!.pages[0]!
    page.symbols.unshift(...Array.from({ length: 20 }, (_, index) => ({ grade: null, confidence: 0, text: '', box: box(0.7, 0.1 + index * 0.02, 0.02, 0.01) })))
    const plan = prepareTechnicalInterpretation(outcome), source = plan.targets[0]!.sources[0]!
    expect(source.kind === 'visual-region' && source.symbolIndices).toContain(20)
    expect(plan.candidateCount).toBeGreaterThan(12)
    expect(plan.targets).toHaveLength(12)
    expect(plan.deferred.reduce((sum, item) => sum + item.count, 0)).toBe(plan.candidateCount - 12)
    expect(technicalInterpretationSourceError(outcome, plan)).toBeNull()
  })
  it('inkluderer neste kolonnestart som kildebundet kontekst når avvik mangler avslutning', async () => {
    const outcome = await visualOutcome(), page = outcome.visualAnalysis!.pages[0]!
    page.symbols[0]!.box.y = 0.8
    page.lines = [line('Bad øst', 0.13, 0.803), line('Beskrivelse', 0.08, 0.83), line('Vurdering av avvik:', 0.08, 0.85), line('Det er påvist', 0.08, 0.88),
      line('lekkasje ved sluket.', 0.53, 0.15), line('Konsekvens/tiltak', 0.53, 0.2)]
    page.symbols.push({ grade: 'TG1', confidence: 1, text: 'TG1', box: box(0.53, 0.4, 0.03, 0.02) })
    page.lines[4] = { ...page.lines[4]!, conflictingReading: { text: 'lekkasje ved veggen.', confidence: .5 } }
    const plan = prepareTechnicalInterpretation(outcome)
    expect(plan.targets[0]!.sources).toHaveLength(2)
    expect(plan.targets[0]!.sources[1]).toMatchObject({ kind: 'visual-region', pdfPage: 1, lineIndices: [4, 5] })
    expect(plan.targets[0]!.missingContextPages).toEqual([])
    expect(plan.targets[0]!.explanation).toContain('motstridende i 1 tekstlinjer')
    expect(technicalInterpretationSourceError(outcome, plan)).toBeNull()
  })

  it('bevarer manglende kontekst når neste sides fullbredde-OCR overskrider regiongrensen', async () => {
    const outcome = await visualOutcome(2), first = outcome.visualAnalysis!.pages[0]!, next = outcome.visualAnalysis!.pages[1]!
    first.symbols[0]!.box = box(0.53, 0.8, 0.03, 0.02)
    first.lines = [line('Bad øst', 0.58, 0.803), line('Beskrivelse', 0.53, 0.83), line('Vurdering av avvik:', 0.53, 0.85), line('Det er påvist', 0.53, 0.88)]
    next.symbols = []
    next.lines = [line('Uavklart fullbredde øverst.', 0.02, 0.13), line('Uavklart fullbredde nederst.', 0.02, 0.91)]
    for (const entry of next.lines) entry.box.width = 0.96
    const plan = prepareTechnicalInterpretation(outcome)
    expect(plan.targets[0]!.sources).toHaveLength(1)
    expect(plan.targets[0]!.missingContextPages).toEqual([2])
    expect(plan.targets[0]!.explanation).toContain('kontekstsider er fortsatt uavklart')
    expect(plan.unresolvedPages).toContain(2)
    expect(technicalInterpretationSourceError(outcome, plan)).toBeNull()
    expect(DocumentImportSchema.safeParse({ ...outcome, technicalInterpretation: plan }).success).toBe(true)
  })

})
