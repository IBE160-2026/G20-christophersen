import { expect, it } from 'vitest'
import { reconcileTechnicalSummaries } from '../../src/frontend/investment/risk-grouping.ts'
import type { PropertyRiskItem } from '../../src/frontend/investment/property-risk.ts'

const make = (id: string, component: string, kind: 'summary' | 'detail', grade: 'TG2' | 'TG3' = 'TG2'): PropertyRiskItem => {
  const description = `${component}: ${kind === 'summary' ? 'Avvik oppgitt.' : 'Det er påvist lekkasje ved overgangen.'}`
  return { id, component, description, grade, evidenceKind: kind, title: component, status: 'documented', domain: 'technical', category: 'technical', consequence: 'Må avklares.', action: 'Se original.', sources: [{ documentHash: 'a', documentName: 'test.pdf', pdfPage: kind === 'summary' ? 1 : 2, quote: description, start: 0, end: description.length, method: 'pdf-text' }] }
}
const docs = (items: PropertyRiskItem[]) => [{ reportHash: 'a', documentName: 'test.pdf', pages: items.map(item => ({ pdfPage: item.sources[0]!.pdfPage, text: item.description })) }]

it('samler entydig navngitt komponent fra sammendrag og detalj med alle kilder og teller én gang', () => {
  const items = [make('summary', 'Taktekking', 'summary'), make('detail', 'Taktekking', 'detail')]
  const before = structuredClone(items)
  const output = reconcileTechnicalSummaries(items, docs(items))
  expect(output).toHaveLength(1)
  expect(output[0]).toMatchObject({ id: 'detail', evidenceKind: 'detail', grade: 'TG2', members: items.slice().reverse() })
  expect(output[0]!.sources).toHaveLength(2)
  expect(output[0]!.reconciliationNote).toContain('telles én gang')
  expect(items).toEqual(before)
})

it('bevarer ulike grader med synlig konflikt og uten å godkjenne én av originalene', () => {
  const items = [make('summary', 'Taktekking', 'summary', 'TG2'), make('detail', 'Taktekking', 'detail', 'TG3')]
  const output = reconcileTechnicalSummaries(items, docs(items))
  expect(output).toHaveLength(2)
  expect(output.map(item => item.grade)).toEqual(['TG2', 'TG3'])
  expect(output.every(item => item.reconciliationNote?.includes('Ulik tilstandsgrad'))).toBe(true)
})

it.each(['Bad', 'Vinduer', 'Tak', 'Sluk', 'Overflater gulv', 'Avtrekk', 'Ukjent komponentnavn'])('samler ikke et generisk %s uten entydig rom/bygningsdel', component => {
  const items = [make('summary', component, 'summary'), make('detail', component, 'detail')]
  expect(reconcileTechnicalSummaries(items, docs(items))).toEqual(items)
})

it('holder en ustedfestet altan i sammendrag og detalj på ulike originalsider atskilt', () => {
  const items = [make('summary', 'Altan', 'summary'), make('detail', 'Altan', 'detail')]
  expect(items.map(item => item.sources[0]!.pdfPage)).toEqual([1, 2])
  const output = reconcileTechnicalSummaries(items, docs(items))
  expect(output).toEqual(items)
  expect(output.every(item => !item.members && !item.reconciliationNote)).toBe(true)
})

it('samler gjentakbar komponent bare ved samme uttrykkelige sted i begge originale belegg', () => {
  const items = [make('summary', 'Loft · Sluk', 'summary'), make('detail', 'Loft · Sluk', 'detail')]
  expect(reconcileTechnicalSummaries(items, docs(items))).toHaveLength(1)
  const noRoom = make('summary', 'Sluk', 'summary')
  expect(reconcileTechnicalSummaries([noRoom, items[1]!], docs([noRoom, items[1]!]))).toHaveLength(2)
})

it('samler ikke flere avvik, ulike rom, andre dokumenter, delvis tekst eller ukontrollerbare kilder', () => {
  const base = [make('summary', 'Taktekking', 'summary'), make('detail', 'Taktekking', 'detail')]
  const second = { ...base[1]!, id: 'second' }
  expect(reconcileTechnicalSummaries([...base, second], docs(base))).toHaveLength(3)
  const floor = [make('summary', 'Bad i første etasje · Sluk', 'summary'), make('detail', 'Bad i andre etasje · Sluk', 'detail')]
  expect(reconcileTechnicalSummaries(floor, docs(floor))).toEqual(floor)
  for (const mutated of [
    { ...base[1]!, sources: base[1]!.sources.map(source => ({ ...source, documentName: 'annen.pdf' })) },
    { ...base[1]!, sourceQuality: 'partial-text' as const },
    { ...base[1]!, status: 'possible' as const },
    { ...base[1]!, sources: base[1]!.sources.map(source => ({ ...source, start: 1 })) },
  ]) expect(reconcileTechnicalSummaries([base[0]!, mutated], docs(base))).toHaveLength(2)
})
