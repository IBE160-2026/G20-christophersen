import { expect, it } from 'vitest'
import { createLocalPlan } from '../../src/backend/import/local-plan.ts'
import { mergeUploadedEconomy } from '../../src/backend/import/merge-uploaded-economy.ts'
function fields(text: string, pdfPage = 1) {
  return createLocalPlan({ hash: 'a'.repeat(64), name: 'ny.pdf', role: 'prospectus', requestId: 'merge', parentHash: null, attachmentId: null, attachments: [], pages: Array.from({ length: pdfPage }, (_, i) => ({ pdfPage: i + 1, text: i + 1 === pdfPage ? text : '', status: 'readable' as const, reason: null, rasterUnprocessed: false })) }).fields
}
it('beholder lokale tall og originale kilder utenfor KI-utvalget', () => {
  const local = fields('Prisantydning: 4 242 000 kr\nKommunale avgifter: 11 000 kr per år i 2026', 7)
  const result = mergeUploadedEconomy(local, fields('Omkostninger: 81 000 kr'))
  expect(result.find(field => field.id === 'price')).toEqual(local.find(field => field.id === 'price'))
  expect(result.find(field => field.id === 'municipalFees')).toEqual(local.find(field => field.id === 'municipalFees'))
  expect(result.find(field => field.id === 'purchaseCosts')?.amount).toBe('81000')
})
it('bevarer motstrid og begge kilder når KI foreslår annet beløp', () => {
  const local = fields('Prisantydning: 4 242 000 kr', 7), interpreted = fields('Prisantydning: 4 250 000 kr')
  const result = mergeUploadedEconomy(local, interpreted).find(field => field.id === 'price')!
  expect(result.status).toBe('conflict'); expect(result.amount).toBe('4242000')
  expect(result.alternatives[0]?.amount).toBe('4250000'); expect(result.sources.map(source => source.pdfPage)).toEqual([7, 1])
})
it.each([
  ['Kommunale avgifter: 11 000 kr per måned i 2026', 'month', '2026'],
  ['Kommunale avgifter: 11 000 kr per år i 2027', 'year', '2027'],
])('samme beløp med annen periode/år forblir konflikt og lokale kvalifikatorer bevares: %s', text => {
  const local = fields('Kommunale avgifter: 11 000 kr per år i 2026', 7), interpreted = fields(text)
  const result = mergeUploadedEconomy(local, interpreted).find(field => field.id === 'municipalFees')!
  expect(result).toMatchObject({ amount: '11000', status: 'conflict', period: 'year', year: '2026' })
  expect(result.alternatives).toEqual([{ amount: '11000', source: interpreted.find(field => field.id === 'municipalFees')!.sources[0] }])
  expect(result.sources.map(source => source.pdfPage)).toEqual([7, 1])
})
it('bevarer kjent lokal periode og år når KI bare oppgir ukjente kvalifikatorer', () => {
  const result = mergeUploadedEconomy(fields('Kommunale avgifter: 11 000 kr per år i 2026', 7), fields('Kommunale avgifter: 11 000 kr'))
  expect(result.find(field => field.id === 'municipalFees')).toMatchObject({ amount: '11000', status: 'available', period: 'year', year: '2026' })
})
it('stopper ved kilde- eller alternativgrensen fremfor å kaste konfliktbelegg', () => {
  const local = fields('Prisantydning: 4 242 000 kr', 7), interpreted = fields('Prisantydning: 4 250 000 kr')
  const price = local.find(field => field.id === 'price')!
  price.sources = Array.from({ length: 12 }, (_, index) => ({ ...price.sources[0]!, start: index, end: index + 1 }))
  expect(() => mergeUploadedEconomy(local, interpreted)).toThrow('local-economy-evidence-limit')
  price.sources = [price.sources[0]!]
  price.status = 'conflict'
  price.alternatives = Array.from({ length: 10 }, (_, index) => ({ amount: String(index), source: price.sources[0]! }))
  expect(() => mergeUploadedEconomy(local, interpreted)).toThrow('local-economy-evidence-limit')
})
it('null primærbeløp i KI-konflikt mister ikke kildebelagte alternativer', () => {
  const local = fields('Prisantydning: 4 242 000 kr', 7), interpreted = fields('Prisantydning: 4 250 000 kr')
  const proposal = interpreted.find(field => field.id === 'price')!
  proposal.status = 'conflict'; proposal.alternatives = [{ amount: proposal.amount, source: proposal.sources[0]! }]; proposal.amount = null
  const result = mergeUploadedEconomy(local, interpreted).find(field => field.id === 'price')!
  expect(result).toMatchObject({ status: 'conflict', amount: '4242000' })
  expect(result.alternatives).toEqual(proposal.alternatives)
  expect(result.sources.map(source => source.pdfPage)).toEqual([7, 1])
})
