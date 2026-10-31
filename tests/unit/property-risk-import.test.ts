import { describe, expect, it, vi } from 'vitest'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { createOfflineImport } from '../../src/backend/import/offline-adapter.ts'
import { DocumentImportSchema } from '../../src/contracts/document-import.ts'
import { codeFirstBasis } from '../helpers/code-first.ts'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'
import { extractImport } from '../../src/backend/documents/extract-import.ts'

const input = () => codeFirstBasis([
  'Adresse: Risikoveien 12\nEierform: eierseksjon\nPrisantydning: 3 000 000 kr\nUtleieenheten er ikke godkjent som egen bruksenhet.',
  'TILSTANDSRAPPORT - START\nAdresse: Risikoveien 12\nTilstandsgrad: TG3\nBygningsdel: tak\nAlvorlig lekkasje i tak\nTILSTANDSRAPPORT - SLUTT',
])

describe('integrert lokal eiendomsrisiko', () => {
  it('kjører uten nett, bevarer økonomi, fysisk kilde og ufullstendig rapport', async () => {
    const network = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network-forbidden'))
    try {
      const basis = input(), outcome = await createCodeFirstImport(basis)
      expect(network).not.toHaveBeenCalled()
      expect(outcome.propertyRisk?.legal.findings.some(finding => finding.category === 'rental-approval' && finding.status === 'documented')).toBe(true)
      expect(outcome.economy.fields.find(field => field.id === 'price')?.amount).toBe('3000000')
      expect(outcome.technical.findings[0]?.grade).toBe('TG3')
      expect(outcome.technical.findings[0]?.source.pdfPage).toBe(2)
      expect(outcome.coverage.technical.status).not.toBe('complete')
      expect(outcome.cost?.reservedUsd).toBe('0.00000000')
      for (const analysis of Object.values(outcome.propertyRisk!)) for (const finding of analysis.findings) for (const source of finding.sources) {
        expect(source.documentHash).toBe(basis.hash)
        expect(outcome.pages[source.pdfPage - 1]!.text.slice(source.start, source.end)).toBe(source.quote)
      }
    } finally { network.mockRestore() }
  })
  it.each(['hash', 'name', 'page', 'quote', 'offset', 'domain', 'duplicate', 'examined'] as const)('avviser manipulert risikobelegg: %s', async kind => {
    const outcome = await createCodeFirstImport(input())
    const analysis = outcome.propertyRisk!.legal, finding = analysis.findings[0]!, source = finding.sources[0]!
    if (kind === 'hash') source.documentHash = 'b'.repeat(64)
    if (kind === 'name') source.documentName = 'annen.pdf'
    if (kind === 'page') source.pdfPage = 2
    if (kind === 'quote') source.quote = 'Oppdiktet kilde'
    if (kind === 'offset') source.start++
    if (kind === 'domain') finding.domain = 'technical'
    if (kind === 'duplicate') analysis.findings.push(structuredClone(finding))
    if (kind === 'examined') analysis.examinedPages = []
    expect(DocumentImportSchema.safeParse(outcome).success).toBe(false)
  })
  it('bevarer syntetisk demofasit og legger til lokal risiko', async () => {
    const bytes = await readFile(new URL('../fixtures/sales-prospectus/mixed-12.pdf', import.meta.url))
    const format = await validatePdf(bytes, 'syntetisk.pdf', { maxPages: 200 })
    if (format.status !== 'format-validated') throw new Error('invalid-fixture')
    const extracted = await extractImport(format)
    const outcome = await createOfflineImport({ ...input(), ...extracted, hash: createHash('sha256').update(bytes).digest('hex'), name: 'syntetisk.pdf' })
    expect(outcome.coverage.technical.status).toBe('complete')
    expect(outcome.technical.findings.map(finding => finding.grade)).toEqual(['TG2', 'TG2', 'TG3'])
    expect(outcome.propertyRisk?.legal.coverage).toBe('partial')
    expect(outcome.economy.fields.find(field => field.id === 'price')?.amount).toBe('3000000')
  })
  it.each(['unknown', 'incomplete'] as const)('bevarer %s tekst som mulige forhold uten å gi TG eller komplett dekning', async status => {
    const basis = input()
    basis.pages[1]!.text += '\nVurdering av avvik:\nDet er registrert skader på taket.\nKonsekvens / tiltak\nVidere undersøkelse anbefales.'
    basis.pages[1]!.status = status
    basis.pages[1]!.rasterUnprocessed = true
    const outcome = await createCodeFirstImport(basis)
    const analysis = outcome.propertyRisk!.technical
    expect(analysis.findings).toContainEqual(expect.objectContaining({ status: 'possible', grade: null, sourceQuality: 'partial-text' }))
    expect(analysis.unreadPages).toContain(2)
    expect(outcome.technical.findings).toEqual([])
    expect(outcome.coverage.technical.status).not.toBe('complete')
    for (const change of ['documented', 'grade', 'quality', 'unread', 'quote'] as const) {
      const tampered = structuredClone(outcome), risk = tampered.propertyRisk!.technical.findings[0]!
      if (change === 'documented') risk.status = 'documented'
      if (change === 'grade') risk.grade = 'TG3'
      if (change === 'quality') delete risk.sourceQuality
      if (change === 'unread') tampered.propertyRisk!.technical.unreadPages = []
      if (change === 'quote') risk.sources[0]!.quote = 'Oppdiktet'
      expect(DocumentImportSchema.safeParse(tampered).success, change).toBe(false)
    }
  })
})
