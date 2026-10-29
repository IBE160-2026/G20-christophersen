import { beforeAll, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ProspectusImport, ImportCoverageControl } from '../../src/frontend/screens/ProspectusImport.tsx'
import { createInitialSession } from '../../src/frontend/state/session.ts'
import { ImportClient } from '../../src/frontend/analysis/import-client.ts'
import { importEconomyDraft, documentTaxRelevance } from '../../src/domain/document-import.ts'
import { economySuggestions } from '../../src/domain/source-economy.ts'
import type { ListingCorrection } from '../../src/contracts/listing.ts'
import { importFixture } from '../helpers/import-fixture.ts'
let fixture:Awaited<ReturnType<typeof importFixture>>
beforeAll(async()=>{fixture=await importFixture()})
const client=new ImportClient(()=>{})
function sessionFor(data=fixture){const state=createInitialSession();return {...state,prospectus:{...state.prospectus,prospectus:{...state.prospectus.prospectus,status:'imported' as const,selected:data.selected,outcome:data.outcome}}}}
it.each(['unknown','borettslag','eierseksjon'] as const)('review: synlig avgiftsrelevans %s beholder faktum og P, men kontantbehov venter på begrunnet kontroll',ownership=>{
  const outcome=structuredClone(fixture.outcome);outcome.economy.ownership=ownership
  const before=economySuggestions(importEconomyDraft(outcome),{requireReview:false})
  expect(before.P).toBe('3200000');expect(before.cashRequired).toBe(ownership==='eierseksjon'?'3075000':null)
  const state=sessionFor({...fixture,outcome}),markup=renderToStaticMarkup(createElement(ProspectusImport,{session:state,client,dispatch:()=>{},role:'prospectus'}))
  expect(markup).toContain('Eierform: eierseksjon') // Originalbelegget beholdes ved testens avvikende klassifisering.
  expect(markup).toContain('Dokumentavgift: 75 000 kr, inkludert i omkostninger.')
  if(ownership!=='eierseksjon')expect(markup).toContain('Relevans og kilde for dokumentavgift')
  const tax=outcome.economy.fields.find(field=>field.id==='documentTax')!
  const correction:ListingCorrection={rawAmount:tax.amount!,rawDebtPart:'',period:tax.period,year:'',includedIn:tax.includedIn,note:'Kontrollert relevans mot oppgitt omkostningskilde; originalbeløpet beholdes.',reviewed:true}
  expect(economySuggestions(importEconomyDraft(outcome,{documentTax:correction}),{requireReview:false}).cashRequired).toBe('3075000')
  expect(documentTaxRelevance(outcome,{documentTax:{...correction,note:''}}).reviewed).toBe(false)
  expect(outcome.economy.fields.find(field=>field.id==='documentTax')?.amount).toBe('75000')
})
it('review: integrert eiendoms-/områdebelegg er synlig under kontroll og motstrid har samme sperrestatus',async()=>{
  const data=await importFixture('integrated-identity-conflict-12.pdf'),state=sessionFor(data)
  const markup=renderToStaticMarkup(createElement(ImportCoverageControl,{session:state,dispatch:()=>{}}))
  expect(markup).toContain('Eiendomsidentitet: Motstrid')
  for(const quote of ['Adresse: Eksempelveien 1, 0001 Testby','Adresse: Annenveien 9, 0002 Testby','TILSTANDSRAPPORT - START','TILSTANDSRAPPORT - SLUTT'])expect(markup).toContain(quote)
  expect(markup).toContain('fysisk PDF-side 1');expect(markup).toContain('fysisk PDF-side 5');expect(markup).toContain('fysisk PDF-side 12')
  expect(markup).toContain('Vis kilde for eiendomsidentitet');expect(markup).toContain('Vis kilde for rapportgrense')
})
it('review: separat kontroll viser begge originalers belegg og lokal gjenoppretting',async()=>{
  const main=await importFixture('bounded-200.pdf'),separate=await importFixture('wrong-property-report-4.pdf','report',main.outcome.reportHash)
  const state=sessionFor(main);state.prospectus.report={...state.prospectus.report,status:'imported',selected:separate.selected,outcome:separate.outcome}
  const markup=renderToStaticMarkup(createElement(ImportCoverageControl,{session:state,dispatch:()=>{}}))
  expect(markup).toContain('Adresse: Eksempelveien 1, 0001 Testby');expect(markup).toContain('Adresse: Annenveien 9, 0002 Testby')
  expect(markup).toContain('bounded-200.pdf');expect(markup).toContain('wrong-property-report-4.pdf')
  const upload=renderToStaticMarkup(createElement(ProspectusImport,{session:state,dispatch:()=>{},client,role:'report'}))
  expect(upload).toContain('Bruk integrert rapport igjen')
})

it('code-first kostnadsstopp forklarer samlet budsjett, tokenstatus og fysisk rest uten rå blokk-ID-er',async()=>{
  const {codeFirstBasis}=await import('../helpers/code-first.ts')
  const {createCodeFirstImport}=await import('../../src/backend/import/semantic-adapter.ts')
  const outcome=await createCodeFirstImport(codeFirstBasis())
  Object.assign(outcome.cost!,{reason:'analysis-budget-exceeded',inputTokens:40000,tokenizer:'test-only'})
  const markup=renderToStaticMarkup(createElement(ProspectusImport,{session:sessionFor({...fixture,outcome}),client,dispatch:()=>{},role:'prospectus'}))
  expect(markup).toContain('Hele det nødvendige grunnlaget får ikke plass innen gjenværende analyseramme på USD 0,20')
  expect(markup).toContain('Inputtokens: 40000');expect(markup).toContain('8000 tokens inklusive reasoning')
  expect(markup).toContain('testteller');expect(markup).toContain('Fysisk PDF-side')
  expect(markup).not.toContain('Uløst tekstblokk:');expect(markup).not.toContain('analysis-budget-exceeded')
})
