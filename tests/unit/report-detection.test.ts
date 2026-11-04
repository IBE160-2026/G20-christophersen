import { describe, expect, it } from 'vitest'
import { detectReportSections } from '../../src/backend/import/report-detection.ts'
import { createLocalPlan } from '../../src/backend/import/local-plan.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { DocumentImportSchema } from '../../src/contracts/document-import.ts'
import { importGate } from '../../src/domain/document-import.ts'
import { codeFirstBasis } from '../helpers/code-first.ts'

const report = [
  'BOLIG 2026Tilstandsrapport\nRapportdato: 01.10.2026\nOppdragsnr.: 901-12\nAdresse: Eksempelveien 1\n',
  'Bygningsdeler og avvik\nTilstandsrapport\n901-12Oppdragsnr.: Side: 2 av 3Befaringsdato: 01.10.2026\n',
  'Forutsetninger\nTilstandsrapport\nOppdragsnr.: 901-12 Side: 3 av 3\n',
]

describe('kildebelagt rapportidentifisering', () => {
  it('finner innebygd rapport fra omslag og ubrutt paginering, uten å telle footere som nye rapporter', () => {
    const basis = codeFirstBasis(['Salgsoppgave\n', ...report, 'Selgers egenerklæring\n'])
    const sections = detectReportSections(basis)
    expect(sections).toHaveLength(1)
    expect(sections[0]).toMatchObject({ startPage: 2, endPage: 4, certainty: 'certain' })
    for (const item of sections[0]!.basis) {
      expect(item.documentHash).toBe(basis.hash)
      expect(item.documentName).toBe(basis.name)
      expect(item.quote).toBe(basis.pages[item.pdfPage - 1]!.text.slice(item.start, item.end))
    }
  })
  it('bruker fysiske sider i separat opplastet rapport', () => {
    const basis = codeFirstBasis(report); basis.role = 'report'
    expect(detectReportSections(basis)[0]).toMatchObject({ startPage: 1, endPage: 3, certainty: 'certain' })
  })
  it.each(['missing', 'number', 'total', 'assignment', 'duplicate'] as const)('avviser sikker paginering ved %s', kind => {
    const texts = [...report]
    if (kind === 'missing') texts[1] = 'En side uten rapportpaginering\n'
    if (kind === 'number') texts[1] = texts[1]!.replace('2 av 3', '1 av 3')
    if (kind === 'total') texts[1] = texts[1]!.replace('2 av 3', '2 av 4')
    if (kind === 'assignment') texts[1] = texts[1]!.replace('901-12', '902-13')
    if (kind === 'duplicate') texts[1] += 'Side: 2 av 3\n'
    const sections = detectReportSections(codeFirstBasis(texts))
    expect(sections.length).toBeGreaterThan(0)
    expect(sections.every(item => item.certainty === 'ambiguous')).toBe(true)
  })
  it('en for lang rapportsekvens blir uavklart fremfor å overskride faktisk dokument', () => {
    const basis = codeFirstBasis(report.slice(0, 2))
    expect(detectReportSections(basis)[0]).toMatchObject({ startPage: 1, endPage: 2, certainty: 'ambiguous' })
  })
  it('flere identifiserte rapporter krever avstemming', () => {
    const basis = codeFirstBasis([...report, ...report.map(text => text.replaceAll('901-12', '905-99'))])
    expect(detectReportSections(basis).map(item => [item.startPage, item.endPage, item.certainty])).toEqual([[1, 3, 'ambiguous'], [4, 6, 'ambiguous']])
  })
  it.each(['prospectus', 'report'] as const)('henvisning med metadata og paginering er ikke omslag (%s)', role => {
    const basis = codeFirstBasis([
      'Se vedlagt tilstandsrapport\nRapportdato: 01.10.2026\nOppdragsnr.: 901-12 Side: 1 av 2\n',
      'Oppdragsnr.: 901-12 Side: 2 av 2\n',
    ]); basis.role = role
    expect(detectReportSections(basis)).toEqual([])
  })
  it('eksplisitte grenser skjuler ikke en annen paginert rapport', async () => {
    const basis = codeFirstBasis(['TILSTANDSRAPPORT - START\nTILSTANDSRAPPORT - SLUTT\n', ...report])
    expect(detectReportSections(basis).map(item => [item.startPage, item.endPage, item.certainty])).toEqual([[1, 1, 'ambiguous'], [2, 4, 'ambiguous']])
    const outcome = await createCodeFirstImport(basis)
    expect(outcome.sections).toHaveLength(2)
    expect(outcome.coverage.technical.status).not.toBe('complete')
    expect(importGate(outcome, 1, true, true, false).coverageComplete).toBe(false)
  })
  it.each([
    ['Innholdsfortegnelse\nTilstandsrapport\nRapportdato: 01.10.2026\nOppdragsnr.: 901-12\n'],
    ['Tilstandsrapport er vedlagt salgsoppgaven.\n'],
    ['Tilstandsrapport\nOppdragsnr.: 901-12 Side: 2 av 3\n'],
  ])('omtale, innholdsfortegnelse og enkeltfooter er ikke rapportforside', (...texts) => {
    expect(detectReportSections(codeFirstBasis(texts))).toEqual([])
  })
  it('tittel på separat rapport uten dokumentert slutt gir bare uklart område', () => {
    const basis = codeFirstBasis(['Tilstandsrapport\n', 'Avvik uten paginering.\n']); basis.role = 'report'
    expect(detectReportSections(basis)[0]).toMatchObject({ startPage: 1, endPage: 2, certainty: 'ambiguous' })
  })
  it.each(['unknown', 'incomplete', 'raster'] as const)('bevarer %s som ufullstendig dekning med kontrollerbar områdeskilde', async kind => {
    const basis = codeFirstBasis(['Salgsoppgave\n', ...report])
    for (const page of basis.pages.slice(1)) {
      if (kind === 'raster') page.rasterUnprocessed = true
      else { page.status = kind; page.reason = 'Ufullstendig lesbarhet.' }
    }
    const plan = createLocalPlan(basis)
    expect(plan.sections[0]).toMatchObject({ startPage: 2, endPage: 4, certainty: 'ambiguous' })
    expect(plan.manifest.blocks.filter(block => block.pdfPage >= 2).every(block => block.result !== 'local-explicit')).toBe(kind !== 'raster')
    const outcome = await createCodeFirstImport(basis)
    expect(DocumentImportSchema.safeParse(outcome).success).toBe(true)
    expect(outcome.coverage.technical.status).not.toBe('complete')
    expect(importGate(outcome, 1, true, true, false).coverageComplete).toBe(false)
    const wrong = structuredClone(outcome); wrong.sections[0]!.basis[0]!.quote = 'Oppdiktet'
    expect(DocumentImportSchema.safeParse(wrong).success).toBe(false)
    if (kind !== 'raster') {
      const promoted = structuredClone(outcome); promoted.sections[0]!.certainty = 'certain'
      expect(DocumentImportSchema.safeParse(promoted).success).toBe(false)
    }
  })
  it('bevarer historisk legacy-plan og eksplisitte start/slutt-kilder', () => {
    const basis = codeFirstBasis(['TILSTANDSRAPPORT - START\nAdresse: Eksempelveien 1\n', 'TILSTANDSRAPPORT - SLUTT\n'])
    expect(createLocalPlan(basis).sections).toEqual(createLocalPlan(basis, { legacyEconomy: true }).sections)
  })
  it('bevarer gammel enlinjegrammatikks funn-ID og nøyaktige kildespenn', () => {
    const basis = codeFirstBasis(['TILSTANDSRAPPORT - START\nTilstandsgrad: TG3\nBygningsdel: tak\nLekkasje i tak.\nTILSTANDSRAPPORT - SLUTT\n'])
    const plan = createLocalPlan(basis), historical = createLocalPlan(basis, { legacyEconomy: true })
    expect(plan.findings).toHaveLength(1)
    expect(plan.findings).toEqual(historical.findings)
    expect(plan.findings[0]!.sources[0]!.quote).toBe('Tilstandsgrad: TG3\nBygningsdel: tak\nLekkasje i tak.\n')
  })
  it('eksplisitte grenser på usikre tekstsider kan ikke sertifisere rapporten', async () => {
    const basis = codeFirstBasis(['TILSTANDSRAPPORT - START\n', 'TILSTANDSRAPPORT - SLUTT\n'])
    basis.pages[0]!.status = 'unknown'
    const outcome = await createCodeFirstImport(basis)
    expect(outcome.sections[0]).toMatchObject({ startPage: 1, endPage: 2, certainty: 'ambiguous' })
    expect(outcome.coverage.technical.status).not.toBe('complete')
    expect(outcome.manifest!.blocks[0]!.result).toBe('unresolved')
  })
  it('tittellinjen kan inneholde rapportdato direkte foran Oppdragsnr', () => {
    const basis = codeFirstBasis([report[0]!.replace('Oppdragsnr.: 901-12', '01.10.2026 Oppdragsnr.: 901-12'), ...report.slice(1)])
    expect(detectReportSections(basis)[0]).toMatchObject({ startPage: 1, endPage: 3, certainty: 'certain' })
  })
})

it('binder sammenlimt rapporttotal/prospektfooter bare til ubrutt kjent oppdrag og stigende nabofot', () => {
  const texts = [
    'Tilstandsrapport\nRapportdato: 01.10.2026 Oppdragsnr.: 901-12',
    '901-12Oppdragsnr.: Side: 2 av 4Befaringsdato: 01.10.2026',
    'Tilstandsrapport\nOppdragsnr.: 901-12 Befaringsdato: 01.10.2026 Side: 3 av 449',
    'Tilstandsrapport\nOppdragsnr.: 901-12 Befaringsdato: 01.10.2026 Side: 4 av 450',
    'Vedlegg utenfor rapporten',
  ]
  const basis = codeFirstBasis(texts)
  expect(detectReportSections(basis)).toMatchObject([{ startPage: 1, endPage: 4, certainty: 'certain' }])
  for (const evidence of detectReportSections(basis)[0]!.basis) expect(basis.pages[evidence.pdfPage - 1]!.text.slice(evidence.start, evidence.end)).toBe(evidence.quote)
  const bad = codeFirstBasis(texts.map(text => text.replace('4 av 450', '4 av 460')))
  expect(detectReportSections(bad).every(section => section.certainty === 'ambiguous')).toBe(true)
})

it('gjenoppretter liten sammenlimt total uten å beholde den som motstridende nummerering', () => {
  const basis = codeFirstBasis([
    'Tilstandsrapport\nRapportdato: 01.10.2026 Oppdragsnr.: 901-12',
    '901-12Oppdragsnr.: Side: 2 av 4Befaringsdato: 01.10.2026',
    'Tilstandsrapport\nOppdragsnr.: 901-12 Befaringsdato: 01.10.2026 Side: 3 av 49',
    'Tilstandsrapport\nOppdragsnr.: 901-12 Befaringsdato: 01.10.2026 Side: 4 av 410',
  ])
  expect(detectReportSections(basis)).toMatchObject([{ startPage: 1, endPage: 4, certainty: 'certain' }])
})
