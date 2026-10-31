import { createHash } from 'node:crypto'
import { prepareEconomyTrial, verifyEconomyTrial } from '../../src/backend/import/economy-trial.ts'
import { expect, it } from 'vitest'
import { createLocalPlan } from '../../src/backend/import/local-plan.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { codeFirstBasis } from '../helpers/code-first.ts'

it('leser etiketter med valutaprefiks, egen verdilinje og eksakte oppstillingsposter', async () => {
  const basis = codeFirstBasis([
    'PRISANTYDNING Kr 9 876 543,‑\nOMKOSTNINGER Kr 248 140,‑\nTOTAL INK. OMK. Kr 10 124 683,‑',
    'TOTAL PRISANTYDNING EKSKLUSIV OMKOSTNINGER\nKr 9 876 543\nKr 246 750 (Dokumentavgift (2,5 %))\nKr 248 140 (Omkostninger totalt)\nKr 265 040 (med Boligkjøperforsikring ‑ fem års varighet)\nKr 10 124 683 (Totalpris. inkl. omkostninger)\nKr 10 141 583 (Totalpris. inkl. omkostninger (med Boligkjøperforsikring))\nKOMMUNALE AVGIFTER\nKr 26 072 for år 2026\nEIENDOMSSKATT\nKr 9 699 for år 2026',
  ])
  const plan = createLocalPlan(basis)
  const value = (id: string) => plan.fields.find(field => field.id === id)!
  expect(value('price')).toMatchObject({ amount: '9876543', status: 'available' })
  expect(value('totalPrice')).toMatchObject({ amount: '10124683', status: 'available', alternatives: [] })
  expect(value('purchaseCosts')).toMatchObject({ amount: '248140', status: 'available', alternatives: [] })
  expect(value('documentTax').amount).toBe('246750')
  expect(value('municipalFees')).toMatchObject({ amount: '26072', period: 'year', year: '2026' })
  expect(value('propertyTax')).toMatchObject({ amount: '9699', period: 'year', year: '2026' })
  for (const id of ['sharedDebt', 'commonCosts', 'sharedDebtPayment']) expect(value(id)).toMatchObject({ amount: null, sources: [] })
  for (const field of plan.fields) for (const source of field.sources) {
    expect(source.documentHash).toBe(basis.hash)
    expect(basis.pages[source.pdfPage - 1]!.text.slice(source.start, source.end)).toBe(source.quote)
  }
  // The complete resulting import, including manifest partitions, must validate.
  expect((await createCodeFirstImport(basis)).economy.fields).toEqual(plan.fields)
})

it('bevarer desimaler og konflikter uten avrunding eller beregning', () => {
  const basis = codeFirstBasis(['KOMMUNALE AVGIFTER\nKr 12 345,67 for år 2026\nKommunale avgifter: 12345,68 kr per år i 2026\nEIENDOMSSKATT\nKr 3.000 for år 2026'])
  const plan = createLocalPlan(basis)
  expect(plan.fields.find(field => field.id === 'municipalFees')).toMatchObject({ amount: '12345.67', status: 'conflict', alternatives: [{ amount: '12345.68' }] })
  expect(plan.fields.find(field => field.id === 'propertyTax')!.amount).toBeNull()
})

it.each([
  'Prisantydning: kr -100', 'Prisantydning kr 1 23 000', 'Prisantydning: 1.000 kr',
  'Prisantydning kr 100 - 200', 'Prisantydning: 100 kr med forsikring',
  'Kommunale avgifter 9 876 kr per kvartal inklusive mva',
  'Kommunale avgifter\nAnnen post\nKr 100',
])('lar tvetydig beløp/relasjon stå ukjent: %s', text => {
  expect(createLocalPlan(codeFirstBasis([text])).fields.every(field => field.amount === null)).toBe(true)
})

it('lager aldri adresser av neste skjemafelt eller tomme felt', () => {
  const basis = codeFirstBasis(['Adresse:\nOppdragsnummer:\nMeglerforetak:\nAdresse:\nPostnr.: Sted:\nAdresse: besøk vår nettside\nAdresse: https://example.no/123\nAdresse: Fasitveien 4, 0001 Testby\nAdresse: Vei 2'])
  const plan = createLocalPlan(basis)
  expect(plan.propertyIdentity.map(item => item.value)).toEqual(['Fasitveien 4, 0001 Testby', 'Vei 2'])
  expect(plan.propertyIdentity.every(item => item.source.quote.includes(item.value))).toBe(true)
})

it('versjonerer nye lokale mønstre og regenererer historiske request nøyaktig', () => {
  const bytes = Buffer.from('syntetisk historisk dokument')
  const basis = { ...codeFirstBasis(['Prisantydning: 3 000 000 kr\nPRISANTYDNING Kr 4 000 000,‑']), hash: createHash('sha256').update(bytes).digest('hex') }
  const legacy = prepareEconomyTrial(bytes, basis, [1], 'local-economy-1')
  const current = prepareEconomyTrial(bytes, basis, [1])
  expect(legacy.localExtractionVersion).toBeUndefined()
  expect(current.localExtractionVersion).toBe('local-economy-2')
  expect(legacy.proposedOracle.fields.find(item => item.id === 'price')!.status).toBe('available')
  expect(current.proposedOracle.fields.find(item => item.id === 'price')!.status).toBe('conflict')
  expect(verifyEconomyTrial(legacy, bytes, basis)).toBe(true)
  expect(verifyEconomyTrial(current, bytes, basis)).toBe(true)
  const changed = structuredClone(current); delete changed.localExtractionVersion
  expect(verifyEconomyTrial(changed, bytes, basis)).toBe(false)
  const forged = structuredClone(current); Object.assign(forged, { localExtractionVersion: 'unknown' })
  expect(verifyEconomyTrial(forged, bytes, basis)).toBe(false)
})
