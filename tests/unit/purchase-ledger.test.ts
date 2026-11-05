import { expect, it } from 'vitest'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { codeFirstBasis } from '../helpers/code-first.ts'
import { economySuggestions } from '../../src/domain/source-economy.ts'
import { importEconomyDraft } from '../../src/domain/document-import.ts'
import { DocumentImportSchema } from '../../src/contracts/document-import.ts'

const ledger = 'EIERFORM\nEierseksjon\nPrisantydning: 3 000 000 kr\nFellesgjeld: 0 kr\nOmkostninger:\nkr 545,- (Tingl.gebyr pantedokument)\nkr 545,- (Tingl.gebyr skjøte)\nkr 75 000,- (Dokumentavgift)\n--------------------------------\nkr 76 090,- (Omkostninger totalt ved prisantydning)\nkr 3 076 090,- (Totalpris inkl omkostninger)\nValgfrie omkostninger:\nkr 13 000,- (Boligkjøperpakke)'
const packageLedger = 'Eierform Eierseksjon\nPrisantydning 3 000 000,-\nFellesgjeld: 0 kr\nOmkostninger 76 090,-\nTotalpris 3 076 090,-\nOmkostninger:\n75 000,- (Dokumentavgift)\n545,- (Tinglyst pantedokument)\n545,- (Tinglyst skjøte)\n13 000,- (Boligkjøperpakke* (valgfritt))\n--------------------\n76 090,- (Omkostninger totalt (uten Boligkjøperpakke))\n89 090,- (Omkostninger totalt (med Boligkjøperpakke))'

it.each([ledger, packageLedger])('avstemmer kildedokumentert kostnadsledger og eierform uten dobbelttelling eller valgfrie pakker', async text => {
  const outcome = await createCodeFirstImport(codeFirstBasis([text]))
  expect(DocumentImportSchema.safeParse(outcome).success).toBe(true)
  expect(outcome.economy.ownership).toBe('eierseksjon')
  expect(outcome.economy.fields.find(field => field.id === 'purchaseCosts')).toMatchObject({ amount: '76090', includedIn: '' })
  expect(outcome.economy.fields.find(field => field.id === 'documentTax')).toMatchObject({ amount: '75000', includedIn: 'purchaseCosts' })
  expect(economySuggestions(importEconomyDraft(outcome), { requireReview: false })).toMatchObject({ P: '3000000', cashRequired: '3076090', sharedAnnualPayment: '0', D: null })
  for (const field of outcome.economy.fields) for (const source of field.sources) expect(text.slice(source.start, source.end)).toBe(source.quote)
})

it.each([
  ledger.replace('kr 545,- (Tingl.gebyr skjøte)', 'kr 546,- (Tingl.gebyr skjøte)'),
  ledger.replace('kr 545,- (Tingl.gebyr skjøte)\n', ''),
  ledger.replace('kr 545,- (Tingl.gebyr skjøte)', 'Ekstra kostnader er uavklart.'),
  ledger.replace('kr 3 076 090,-', 'kr 3 076 091,-'),
  ledger.replace('Eierseksjon', 'Ukjent eierform'),
  ledger.replace('Fellesgjeld: 0 kr', 'Fellesgjeld er ukjent'),
  packageLedger.replace(' (uten Boligkjøperpakke)', ''),
])('bevarer ukjent kontantbehov ved avvik, ufullstendig kostnadsliste eller manglende grunnlag', async text => {
  const outcome = await createCodeFirstImport(codeFirstBasis([text]))
  expect(economySuggestions(importEconomyDraft(outcome), { requireReview: false }).cashRequired).toBeNull()
})

it('borettslag med eksplisitt dokumentavgift trenger fortsatt kontroll av relevans', async () => {
  const outcome = await createCodeFirstImport(codeFirstBasis([ledger.replace('Eierseksjon', 'Borettslag')]))
  expect(outcome.economy.ownership).toBe('borettslag')
  expect(economySuggestions(importEconomyDraft(outcome), { requireReview: false }).cashRequired).toBeNull()
})

it('motstridende eierform på en annen side forblir ukjent', async () => {
  const outcome = await createCodeFirstImport(codeFirstBasis([ledger, 'Eierform: borettslag']))
  expect(outcome.economy.ownership).toBe('unknown')
  expect(economySuggestions(importEconomyDraft(outcome), { requireReview: false }).cashRequired).toBeNull()
})
