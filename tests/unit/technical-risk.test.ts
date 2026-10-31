import { describe, expect, it } from 'vitest'
import { codeFirstBasis } from '../helpers/code-first.ts'
import { analyzeTechnicalRisks, extractExplicitTechnicalFindings } from '../../src/backend/import/technical-risk.ts'
import { createLocalPlan } from '../../src/backend/import/local-plan.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { RiskAnalysisSchema } from '../../src/contracts/property-risk.ts'

describe('local technical risk evidence', () => {
  it.each(['prospectus', 'report'] as const)('retains explicit TG2/TG3, original text and physical pages for %s', async role => {
    const basis = codeFirstBasis([
      'Salgsoppgave. Trykt side 90.\n',
      'TILSTANDSRAPPORT - START\nAdresse: Testveien 8\nBygningsdel: Bad øst\nTilstandsgrad: TG2\nVurdering av avvik:\n• Fugene har sprekker.\nKonsekvens/tiltak\nKontroller fugene.\n',
      'Tak — TG3\nVurdering av avvik:\n• Det er påvist lekkasje.\nKonsekvens/tiltak\nUtbedre taket.\nTILSTANDSRAPPORT - SLUTT\n',
    ])
    basis.role = role
    const plan = createLocalPlan(basis), risk = analyzeTechnicalRisks(basis), outcome = await createCodeFirstImport(basis)
    expect(plan.findings.map(item => [item.component, item.grade, item.source.pdfPage])).toEqual([['Bad øst', 'TG2', 2], ['Tak', 'TG3', 3]])
    expect(risk.findings.map(item => [item.title, item.grade, item.status])).toEqual([['Bad øst', 'TG2', 'documented'], ['Tak', 'TG3', 'documented']])
    for (const finding of risk.findings) for (const source of finding.sources) {
      expect(source.documentHash).toBe(basis.hash)
      expect(source.documentName).toBe(basis.name)
      expect(basis.pages[source.pdfPage - 1]!.text.slice(source.start, source.end)).toBe(source.quote)
    }
    // Reading two explicit findings never declares the rest of the prose complete.
    expect(risk.coverage).toBe('partial')
    expect(outcome.coverage.technical.status).toBe('incomplete')
    expect(outcome.manifest!.residual.length).toBeGreaterThan(0)
    expect(RiskAnalysisSchema.safeParse(risk).success).toBe(true)
  })

  it('does not infer graphic grades from a legend or mix a summary with the original deviation', () => {
    const basis = codeFirstBasis([
      'Tilstandsrapport\nTG2: Vesentlige avvik\nTG3: Store eller alvorlige avvik\nOppsummering av avvik\nYttervegger > Kledning\n',
      'Tilstandsrapport\nKledning\nBeskrivelse\nVurdering av avvik:\n• Det er påvist spredte råteskader i kledningen.\nKonsekvens/tiltak\nRåteskadet kledning bør skiftes ut.\n',
    ])
    const risk = analyzeTechnicalRisks(basis)
    expect(extractExplicitTechnicalFindings(basis)).toEqual([])
    expect(risk.findings).toHaveLength(1)
    expect(risk.findings[0]).toMatchObject({ status: 'documented', grade: null, sources: [{ pdfPage: 2 }] })
    expect(risk.findings[0]!.description).toContain('råteskader')
    expect(risk.findings[0]!.description).not.toContain('bør skiftes')
    expect(createLocalPlan(basis).manifest.candidates.every(item => item.disposition === 'unresolved')).toBe(true)
  })

  it('separates explicit unexamined construction from possible and documented problems', () => {
    const basis = codeFirstBasis([
      'Taket er en lukket konstruksjon uten mulighet for inspeksjon.\nHulltaking er ikke foretatt på bad.\n',
      'Vurdering av avvik:\n• Det kan være fukt i konstruksjonen.\nKonsekvens/tiltak\nUndersøk nærmere.\n',
      'Vurdering av avvik:\n• Håndløper mangler.\nKonsekvens/tiltak\nMonter håndløper.\n',
    ])
    const risk = analyzeTechnicalRisks(basis)
    expect(risk.findings.map(item => item.status)).toEqual(['not-investigated', 'not-investigated', 'possible', 'documented'])
    expect(risk.findings.every(item => item.grade === null)).toBe(true)
  })

  it('keeps unknown/incomplete pages, raster and attachments visibly unexamined', () => {
    const basis = codeFirstBasis(['Vurdering av avvik:\n• Lekkasje.\n', 'TG3\nSkade.\n', 'Et bilde med tekstlag.\n'])
    basis.pages[0]!.status = 'incomplete'
    basis.pages[1]!.status = 'unknown'
    basis.pages[2]!.rasterUnprocessed = true
    basis.attachments = [{ id: 'vedlegg', name: 'rapport.pdf', isPdf: true }]
    const risk = analyzeTechnicalRisks(basis)
    expect(risk.examinedPages).toEqual([1, 2, 3])
    expect(risk.unreadPages).toEqual([1, 2, 3])
    expect(risk.findings).toHaveLength(1)
    expect(risk.findings[0]).toMatchObject({ status: 'possible', grade: null, sourceQuality: 'partial-text', sources: [{ pdfPage: 1 }] })
    expect(risk.coverage).toBe('partial')
    expect(risk.limitations.join(' ')).toContain('Vedlegg er ikke undersøkt')
    for (const page of basis.pages) page.status = 'unreadable'
    expect(analyzeTechnicalRisks(basis).coverage).toBe('unavailable')
  })

  it.each(['unknown', 'incomplete'] as const)('retains %s text only as uncertain original-check candidates, never TG findings', async status => {
    const basis = codeFirstBasis(['Bygningsdel: Tak\nTilstandsgrad: TG3\nVurdering av avvik:\n• Det er påvist lekkasje.\nKonsekvens/tiltak\nUndersøk taket.\nHulltaking er ikke foretatt på bad.\n'])
    basis.pages[0]!.status = status
    const risk = analyzeTechnicalRisks(basis)
    expect(risk.findings).toHaveLength(2)
    expect(risk.findings.every(finding => finding.status === 'possible' && finding.grade === null && finding.sourceQuality === 'partial-text')).toBe(true)
    expect(risk.findings.every(finding => finding.description.startsWith('Ufullstendig og ukontrollert tekstuttrekk:'))).toBe(true)
    expect(risk.unreadPages).toEqual([1])
    expect(risk.examinedPages).toEqual([1])
    for (const finding of risk.findings) for (const source of finding.sources) expect(basis.pages[0]!.text.slice(source.start, source.end)).toBe(source.quote)
    expect(extractExplicitTechnicalFindings(basis)).toEqual([])
    const outcome = await createCodeFirstImport(basis)
    expect(outcome.technical.findings).toEqual([])
    expect(outcome.coverage.technical.status).not.toBe('complete')
  })

  it('retains distinct same-description rooms and preserves the original manifest', () => {
    const entry = (room: string) => `Bygningsdel: ${room}\nTilstandsgrad: TG2\nVurdering av avvik:\n• Fuger er sprukket.\nKonsekvens/tiltak\nKontroller fuger.\n`
    const basis = codeFirstBasis(['TILSTANDSRAPPORT - START\nAdresse: Testveien 8\n' + entry('Bad øst') + entry('Bad vest') + 'TILSTANDSRAPPORT - SLUTT\n'])
    const plan = createLocalPlan(basis), risk = analyzeTechnicalRisks(basis)
    expect(plan.findings).toHaveLength(2)
    expect(new Set(risk.findings.map(item => item.id)).size).toBe(2)
    expect(plan.manifest.blocks.map(item => basis.pages[0]!.text.slice(item.start, item.end)).join('')).toBe(basis.pages[0]!.text)
    expect(plan.manifest.candidates.every(item => item.disposition === 'finding')).toBe(true)
  })

  it('does not present a multiline grade association or long text as fully processed', () => {
    const basis = codeFirstBasis(['TILSTANDSRAPPORT - START\nAdresse: Testveien 8\nBygningsdel: Tak\nTilstandsgrad: TG3\nVurdering av avvik:\n• Det er påvist skade.\n• Flere forhold må undersøkes.\n' + 'Lang beskrivelse uten sikker avslutning.\n'.repeat(100) + 'TILSTANDSRAPPORT - SLUTT\n'])
    expect(extractExplicitTechnicalFindings(basis)).toEqual([])
    const risk = analyzeTechnicalRisks(basis)
    expect(risk.findings[0]!.grade).toBeNull()
    expect(risk.findings[0]!.sources[0]!.quote.length).toBeLessThanOrEqual(2000)
    expect(risk.limitations.join(' ')).toContain('for lange')
    expect(createLocalPlan(basis).manifest.candidates[0]!.disposition).toBe('unresolved')
  })

  it('keeps existing explicit finding identity and ignores a negative deviation statement', () => {
    const basis = codeFirstBasis(['TILSTANDSRAPPORT - START\nAdresse: Testveien 8\nTilstandsgrad: TG3\nBygningsdel: tak\nLekkasje i tak.\nTILSTANDSRAPPORT - SLUTT\n'])
    const plan = createLocalPlan(basis)
    expect(plan.findings).toHaveLength(1)
    expect(plan.findings[0]!.findingId).toMatch(/^local-(?!technical)/)
    expect(analyzeTechnicalRisks(basis).findings[0]).toMatchObject({ title: 'tak', grade: 'TG3', status: 'documented' })
    expect(analyzeTechnicalRisks(codeFirstBasis(['Vurdering av avvik:\nDet er ikke påvist avvik.\n'])).findings).toEqual([])
  })
  it.each(['Det er ikke påvist lekkasje.', 'Det er ikke registrert skader.'])('filtrerer benektet konkret avvik og gjeninnfører det aldri som TG: %s', text => {
    const basis = codeFirstBasis([`Bygningsdel: Tak\nTilstandsgrad: TG3\nVurdering av avvik:\n${text}\n`])
    expect(analyzeTechnicalRisks(basis).findings).toEqual([])
    expect(extractExplicitTechnicalFindings(basis)).toEqual([])
    expect(createLocalPlan(basis).manifest.candidates[0]?.disposition).toBe('unresolved')
  })
  it.each(['Badet er ikke undersøkt.', 'Hulltaking er ikke foretatt på bad.'])('viser manglende undersøkelse én gang og uten dokumentert problem: %s', text => {
    const risks = analyzeTechnicalRisks(codeFirstBasis([`Vurdering av avvik:\n${text}\n`]))
    expect(risks.findings).toHaveLength(1)
    expect(risks.findings[0]).toMatchObject({ status: 'not-investigated', grade: null })
  })
  it.each(['Det er ikke registrert avvik, men det kan være fukt i veggen.', 'Det kan ikke utelukkes fukt i konstruksjonen.'])('beholder mulighet som mulighet: %s', text => {
    expect(analyzeTechnicalRisks(codeFirstBasis([`Vurdering av avvik:\n${text}\n`])).findings[0]).toMatchObject({ status: 'possible', grade: null })
  })
  it('regner ikke en bevist blank side som ulest', () => {
    expect(analyzeTechnicalRisks(codeFirstBasis([''])).unreadPages).toEqual([])
  })
})
