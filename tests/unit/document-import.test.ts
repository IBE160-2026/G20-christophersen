import { beforeAll, describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'
import { DocumentImportSchema } from '../../src/contracts/document-import.ts'
import type { DocumentImport } from '../../src/contracts/document-import.ts'
import { AnalysisOutcomeSchema, DocumentBasisSchema } from '../../src/contracts/document-analysis.ts'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'
import { extractPage, TextBudgetExceeded } from '../../src/backend/documents/pdf-extraction-core.ts'
import type { TextChunk } from '../../src/backend/documents/pdf-extraction-core.ts'
import { importEconomyDraft, comparePropertyIdentity } from '../../src/domain/document-import.ts'
import { economyFinancingSuggestion, economySuggestions } from '../../src/domain/source-economy.ts'
import { importFixture } from '../helpers/import-fixture.ts'
import oracle from '../fixtures/sales-prospectus/expected.json' with { type: 'json' }
import extended from '../fixtures/sales-prospectus/extended-expected.json' with { type: 'json' }

let mixed: DocumentImport
beforeAll(async () => { mixed = (await importFixture()).outcome })
const suggestions = (value: DocumentImport) => economySuggestions(importEconomyDraft(value), { requireReview: false, sourceLabel: 'Dokument' })
describe('SO-AC2: separat støtteprofil; fysiske sider og legacy 30 består', () => {
  it.each([30,31,50,100,150,200,201])('%i fysiske sider', async count => {
    const bytes = await readFile(new URL(`../fixtures/sales-prospectus/text-${count}.pdf`, import.meta.url))
    const format = await validatePdf(bytes, 'metadata.pdf', { maxPages: 200 })
    expect(format.pageCount).toBe(count); expect(format.status).toBe(count <= 200 ? 'format-validated' : 'failed')
    if ([30,31].includes(count)) expect((await validatePdf(bytes, 'legacy.pdf')).status).toBe(count === 30 ? 'format-validated' : 'failed')
  })
  it('ny envelope kan aldri leses som legacy analyse eller sidegrunnlag', () => {
    expect(AnalysisOutcomeSchema.safeParse(mixed).success).toBe(false)
    expect(DocumentBasisSchema.safeParse({ ...mixed, contractVersion: '2', extractionVersion: '1' }).success).toBe(false)
  })
})
it('SO-AC3/4: ulest foto utenfor rapport tillater bare eksplisitt rapportdekning; raster/bunntekst inni sperrer', async () => {
  expect(mixed.pages[2]?.status).toBe('unreadable')
  expect(mixed.coverage.technical.status).toBe('complete')
  for (const name of ['scanned-report-12.pdf', 'raster-footer-12.pdf']) {
    const { outcome } = await importFixture(name)
    expect(outcome.coverage.technical.status).toBe('unreadable')
    expect(outcome.pages[9]?.rasterUnprocessed).toBe(true)
    expect(outcome.pages[9]?.status).toBe(name.startsWith('raster-footer') ? 'readable' : 'unreadable')
    expect(outcome.technical.status).toBe('blocked')
    expect(outcome.technical.findings.some(item => item.grade === 'TG3')).toBe(false)
  }
})
it('SO-AC4: manglende og vedlagt rapport har økonomi, men aldri komplett teknisk grunnlag', async () => {
  for (const name of ['missing-report-6.pdf','attached-report-6.pdf']) {
    const { outcome } = await importFixture(name)
    expect(suggestions(outcome).P).toBe(oracle.economy.P)
    expect(outcome.coverage.technical.status).toBe('missing')
    expect(outcome.technical.status).toBe('blocked')
    expect(outcome.technical.findings).toEqual([])
    if (name.startsWith('attached')) expect(outcome.attachments).toEqual([{ id:'tilstandsrapport.pdf',name:'tilstandsrapport.pdf',isPdf:true }])
  }
})
it('SO-AC4: flere rapporter er eksplisitt uklart og kan ikke bli completed', async () => {
  const {outcome} = await importFixture('ambiguous-12.pdf')
  expect(outcome.sections).toHaveLength(2); expect(outcome.coverage.technical.status).toBe('ambiguous')
  const changed = structuredClone(outcome); changed.coverage.technical.status = 'complete'; changed.technical.status = 'complete'
  expect(DocumentImportSchema.safeParse(changed).success).toBe(false)
})
it('SO-AC5/6: fysisk10/trykt6, separat3/trykt1; samme tak har to belegg, to ulike bad består', async () => {
  expect(mixed.technical.findings).toHaveLength(3)
  const roof = mixed.technical.findings.find(item => item.component === 'tak')!
  expect(roof.sources.map(source => source.pdfPage)).toEqual([10,2]); expect(roof.sources[0]?.printedPage).toBe('6')
  expect(mixed.technical.findings.filter(item => item.description === oracle.report.TG2.text).map(item => item.component)).toEqual(['bad 1','bad 2'])
  const { outcome } = await importFixture('separate-report-4.pdf','report',mixed.reportHash)
  expect(outcome.technical.findings[0]?.sources[0]?.pdfPage).toBe(3); expect(outcome.technical.findings[0]?.sources[0]?.printedPage).toBe('1')
  expect(comparePropertyIdentity(mixed,outcome)).toBe('unknown')
})
it.each(['hash','page','quote','offset','name'] as const)('SO-AC5: feil %s avvises uten fuzzy reparasjon', change => {
  const invalid = structuredClone(mixed), source = invalid.economy.fields[0]!.sources[0]!
  if(change === 'hash') source.documentHash = 'a'.repeat(64)
  if(change === 'page') source.pdfPage = 2
  if(change === 'quote') source.quote += '!'
  if(change === 'offset') source.start++
  if(change === 'name') source.documentName = 'wrong.pdf'
  expect(DocumentImportSchema.safeParse(invalid).success).toBe(false)
})
it('SO-AC7–9: uavhengig pris-, avgifts- og kostnadsfasit uten dobbeltelling', () => {
  const value = suggestions(mixed)
  expect(value.P).toBe(oracle.economy.P); expect(value.cashRequired).toBe(oracle.economy.cashRequired)
  expect(value.knownOperatingSubtotal).toBe(oracle.economy.knownAnnualOperatingSubtotal)
  expect(value.sharedAnnualPayment).toBe('12000'); expect(value.D).toBeNull()
  const draft=importEconomyDraft(mixed,{},true)
  expect(economySuggestions(draft,{requireReview:false}).D).toBe('60000')
  expect(economySuggestions(draft).D).toBeNull() // Kompletthetsavkrysning alene er ikke feltkontroll.
})
it('SO-AC7/8/10: konflikt, ukjent gjeld/eierform/avgift/estimat og ukjent metadata forblir ukjent', async () => {
  const {outcome}=await importFixture('conflict-12.pdf')
  expect(outcome.economy.ownership).toBe('borettslag'); expect(outcome.economy.fields.find(f=>f.id==='documentTax')?.amount).toBeNull()
  expect(suggestions(outcome).P).toBeNull()
  for(const id of ['price','sharedDebt','purchaseCosts']){
    const changed=structuredClone(mixed),field=changed.economy.fields.find(f=>f.id===id)!
    field.nature='stated-estimate';expect(suggestions(changed).P === null || suggestions(changed).cashRequired === null).toBe(true)
  }
  for(const key of ['includedIn','debtPart','year'] as const){
    const changed=structuredClone(mixed);changed.economy.fields.find(f=>f.id==='commonCosts')![key]=null
    expect(suggestions(changed).sharedAnnualPayment).toBeNull();expect(suggestions(changed).knownOperatingSubtotal).toBeNull()
  }
  const changed=structuredClone(mixed);changed.economy.fields.find(f=>f.id==='commonCosts')!.period='unknown'
  expect(suggestions(changed).sharedAnnualPayment).toBeNull()
  changed.economy.ownership='unknown';expect(changed.economy.ownership).toBe('unknown')
})
it('selektivt kombinert 200-sidersgrunnlag beholder hele kort rapport og alle sidestatuser', async () => {
  const {outcome}=await importFixture('bounded-200.pdf')
  const expected=extended['bounded-200.pdf']
  expect(outcome.pages).toHaveLength(expected.pageCount)
  expect(outcome.sections[0]?.startPage).toBe(expected.reportStart);expect(outcome.sections[0]?.endPage).toBe(expected.reportEnd)
  const omitted=new Set(outcome.coverage.economy.omittedPages)
  expect(outcome.pages.filter(p=>!omitted.has(p.pdfPage)).map(p=>p.pdfPage)).toEqual(expected.selectedPages)
  expect(omitted.size).toBe(expected.omittedCount)
  expect(outcome.sections[0]?.basis.at(-1)?.quote).toBe('TILSTANDSRAPPORT - SLUTT')
  expect(suggestions(outcome).P).toBe(expected.P)
})
it('SO-AC12: kjent eiendomsmotstrid blokkeres selv med ellers komplett rapport', async () => {
  const prospectus=(await importFixture('bounded-200.pdf')).outcome, report=(await importFixture('wrong-property-report-4.pdf','report',prospectus.reportHash)).outcome
  expect(comparePropertyIdentity(prospectus,report)).toBe('conflict')
})
it('SO-AC13: tekstgrense skjer i enqueue, også om parseren svelger sink-feil', async () => {
  const page={async extractTextContent(options:object){const sink=(options as {sink:{enqueue:(chunk:TextChunk)=>void}}).sink;try{sink.enqueue({items:[{str:'æ'.repeat(65537)}]})}catch{/* Parseren fortsetter. */}}}
  await expect(extractPage(1,page,'content',false,{}, {},()=>null,{pageBytes:128*1024,totalBytes:1024*1024,used:0})).rejects.toBeInstanceOf(TextBudgetExceeded)
})
it('SO-AC9/11: finansiering gjenbruker eksisterende formler; ukjent år hindrer komplett J', () => {
  const draft=importEconomyDraft(mixed,Object.fromEntries(mixed.economy.fields.map(f=>[f.id,{rawAmount:f.amount??'',period:f.period,year:f.year??'',includedIn:f.includedIn,rawDebtPart:f.debtPart??'',note:'',reviewed:true}])),true)
  const financing={equity:'3075000',annualInterest:'5',months:'300',year:'2026'}
  expect(economyFinancingSuggestion(draft,financing,undefined,'Dokument').J).toBe('12000.00')
  expect(economyFinancingSuggestion(draft,{...financing,year:''},undefined,'Dokument').J).toBeNull()
})

it('SO-AC13: samlet UTF-8-tekstgrense er inklusiv og deles mellom fysiske sider',async()=>{
  const budget={pageBytes:128*1024,totalBytes:1024*1024,used:0}
  const page={async extractTextContent(options:object){(options as {sink:{enqueue:(chunk:TextChunk)=>void}}).sink.enqueue({items:[{str:'a'.repeat(128*1024)}]})}}
  for(let number=1;number<=8;number++)expect((await extractPage(number,page,'content',false,{}, {},()=>null,budget)).status).toBe('readable')
  expect(budget.used).toBe(1024*1024)
  await expect(extractPage(9,page,'content',false,{}, {},()=>null,budget)).rejects.toBeInstanceOf(TextBudgetExceeded)
})
it('SO-AC3: rasterlogo på økonomisiden skjuler ikke eksakt lesbart tekstlag eller kjent pris',async()=>{
  const {outcome}=await importFixture('logo-economy-12.pdf')
  expect(outcome.pages[0]?.status).toBe('readable');expect(outcome.pages[0]?.rasterUnprocessed).toBe(true)
  expect(outcome.pages[0]?.text).toContain('Prisantydning: 3 000 000 kr')
  expect(suggestions(outcome).P).toBe('3200000');expect(suggestions(outcome).cashRequired).toBe('3075000')
  expect(outcome.coverage.technical.status).toBe('complete')
  expect(DocumentImportSchema.safeParse(outcome).success).toBe(true)
})
it('review: inline BI/ID/EI raster beholder økonomitekst, men sperrer teknisk rapport',async()=>{
  const {outcome}=await importFixture('inline-raster-footer-12.pdf')
  expect(outcome.pages[0]).toMatchObject({status:'readable',rasterUnprocessed:true})
  expect(outcome.pages[9]).toMatchObject({status:'readable',rasterUnprocessed:true})
  expect(outcome.pages[9]?.text).toContain('Digital bunntekst')
  expect(outcome.pages[9]?.text).not.toContain('TG3')
  expect(suggestions(outcome)).toMatchObject({P:'3200000',cashRequired:'3075000'})
  expect(outcome.coverage.technical.status).toBe('unreadable')
})
it('review: intern identitetsmotstrid har ekte belegg i integrert original',async()=>{
  const {outcome}=await importFixture('integrated-identity-conflict-12.pdf')
  expect(outcome.propertyIdentity.map(item=>item.source.pdfPage)).toEqual([1,5])
  expect(outcome.propertyIdentity.map(item=>item.value)).toEqual(['Eksempelveien 1, 0001 Testby','Annenveien 9, 0002 Testby'])
  expect(DocumentImportSchema.safeParse(outcome).success).toBe(true)
  expect(suggestions(outcome).P).toBe('3200000')
})
it.each(['economy','technical'] as const)('review: %s kan ikke utelate, duplisere eller finne på oppdagede vedlegg',async kind=>{
  const {outcome}=await importFixture('attached-report-6.pdf')
  for(const ids of [[],['tilstandsrapport.pdf','tilstandsrapport.pdf'],['unknown.pdf']]){
    const changed=structuredClone(outcome);changed.coverage[kind].unprocessedAttachments=ids
    expect(DocumentImportSchema.safeParse(changed).success).toBe(false)
  }
  const changed=structuredClone(outcome);changed.coverage[kind].status='complete'
  expect(DocumentImportSchema.safeParse(changed).success).toBe(false)
  const duplicate=structuredClone(outcome);duplicate.attachments.push({...duplicate.attachments[0]!})
  expect(DocumentImportSchema.safeParse(duplicate).success).toBe(false)
})
it('review: tekstutdrag ved sidens suffiks kan ikke ha end forbi tekstlengden',()=>{
  const changed=structuredClone(mixed),field=changed.economy.fields[0]!,page=changed.pages[0]!
  const quote=page.text.slice(-20)
  field.sources=[{...field.sources[0]!,quote,start:page.text.length-20,end:page.text.length+1}]
  expect(DocumentImportSchema.safeParse(changed).success).toBe(false)
  field.sources[0]!.end=page.text.length
  expect(DocumentImportSchema.safeParse(changed).success).toBe(true)
})
