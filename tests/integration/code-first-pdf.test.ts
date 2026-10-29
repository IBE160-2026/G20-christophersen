import { expect, it } from 'vitest'
import oracle from '../fixtures/sales-prospectus/code-first-oracle.json' with { type: 'json' }
import { createHash } from 'node:crypto'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'
import { extractImport } from '../../src/backend/documents/extract-import.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { importEconomyDraft } from '../../src/domain/document-import.ts'
import { economySuggestions } from '../../src/domain/source-economy.ts'
import { sdkStub } from '../helpers/code-first.ts'
import { codeFirstPdf } from '../helpers/code-first-pdf.ts'
it('real PDF.js original offsets reach official stubbed SDK and existing economy boundary', async()=>{
  const bytes=codeFirstPdf(oracle.pages),format=await validatePdf(bytes,'independent-code-first.pdf',{maxPages:200})
  if(format.status!=='format-validated')throw new Error('format')
  const extracted=await extractImport(format),dependencies=sdkStub()
  const outcome=await createCodeFirstImport({hash:createHash('sha256').update(bytes).digest('hex'),name:'independent-code-first.pdf',role:'prospectus',requestId:'real-pdf-sdk',parentHash:null,attachmentId:null,...extracted},dependencies)
  expect(outcome.coverage.technical.status).toBe('complete');expect(dependencies.calls).toHaveLength(1)
  expect(outcome.technical.findings).toHaveLength(oracle.findings.length)
  for(const source of [...outcome.technical.findings.flatMap(item=>item.sources),...outcome.economy.fields.flatMap(item=>item.sources)])expect(outcome.pages[source.pdfPage-1]!.text.slice(source.start,source.end)).toBe(source.quote)
  expect(economySuggestions(importEconomyDraft(outcome),{requireReview:false}).P).toBe('3200000')
  expect(economySuggestions(importEconomyDraft(outcome),{requireReview:false}).D).toBeNull()
})
it('real parser and SDK result require human source/financial/list control before unchanged screening can go forward',async()=>{
  const {createInitialSession,sessionReducer}=await import('../../src/frontend/state/session.ts')
  const {calculateResultSnapshot}=await import('../../src/frontend/state/result.ts')
  const {findingListAssessment}=await import('../../src/frontend/state/report.ts')
  const bytes=codeFirstPdf(oracle.pages),name='independent-code-first.pdf',format=await validatePdf(bytes,name,{maxPages:200})
  if(format.status!=='format-validated')throw new Error('format')
  const extracted=await extractImport(format),outcome=await createCodeFirstImport({hash:format.reportHash,name,role:'prospectus',requestId:'confirmed-import',parentHash:null,attachmentId:null,...extracted},sdkStub())
  const selected={bytes:Uint8Array.from(bytes),hash:format.reportHash,file:new File([bytes],name)},generation=1,correlation={sessionId:'real-pdf-screening',requestId:outcome.requestId,generation}
  let state=createInitialSession()
  state=sessionReducer(state,{type:'import-selecting',generation,role:'prospectus'})
  state=sessionReducer(state,{type:'import-selected',generation,role:'prospectus',selected})
  state=sessionReducer(state,{type:'import-start',role:'prospectus',correlation})
  state=sessionReducer(state,{type:'import-response',role:'prospectus',correlation,ok:true,body:{kind:'document-import',correlation,outcome}})
  expect(state.financial.P).toMatchObject({rawValue:'3200000',confirmed:false});expect(findingListAssessment(state.report).canConfirm).toBe(false)
  expect(calculateResultSnapshot(state).assessment.recommendation).toBe('Innhent mer informasjon')
  const values={P:'3200000',L:'400000',D:'60000',J:'120000',Ymin:'7'}
  for(const field of ['P','L','D','J','Ymin'] as const){
    if(field!=='P')state=sessionReducer(state,{type:'register-value',field,rawValue:values[field]})
    state=sessionReducer(state,{type:'register-source',field,source:{kind:'assumption',description:`Kontrollert uavhengig ${field}`,conflict:null}})
  }
  for(const field of ['L','D','J'] as const){state=sessionReducer(state,{type:'register-period',field,period:'year'});state=sessionReducer(state,{type:'register-year',field,year:'2026'})}
  state=sessionReducer(state,{type:'register-rent-nature',rentNature:'expected'});state=sessionReducer(state,{type:'confirm-financial'})
  state=sessionReducer(state,{type:'import-identity',checked:true});state=sessionReducer(state,{type:'import-area',checked:true})
  const reportGeneration=state.report.generation
  for(const finding of outcome.technical.findings){
    state=sessionReducer(state,{type:'report-finding-confirm',generation:reportGeneration,findingId:finding.findingId})
    if(finding.grade==='TG3')for(const [field,value]of Object.entries({status:'resolved',reason:'Taklekkasjen er kontrollert og utbedret.',basis:'Uavhengig syntetisk fagkyndig kilde om samme takforhold.'}) as ['status'|'reason'|'basis',string][])state=sessionReducer(state,{type:'report-tg3-register',generation:reportGeneration,findingId:finding.findingId,field,value})
  }
  state=sessionReducer(state,{type:'report-list-confirm',generation:reportGeneration,reportHash:format.reportHash,documentName:name,listRevision:state.report.listRevision})
  expect(findingListAssessment(state.report).controlCompleted).toBe(true)
  expect(calculateResultSnapshot(state).assessment.recommendation).toBe('Gå videre')
})
it('real 200-page near-1MiB profile retains >1000 residual entries, every candidate and partial local economy',async()=>{
  const {DocumentImportSchema,IMPORT_MAX_RESPONSE_BYTES}=await import('../../src/contracts/document-import.ts')
  const {createLocalPlan}=await import('../../src/backend/import/local-plan.ts')
  // 200 readable pages, 401 independently specified TG markers, and enough unresolved
  // non-keyword report text to exceed the old 1000-row residual cap together.
  const pages=Array.from({length:200},(_,index)=>{
    const header=index===0?'TILSTANDSRAPPORT - START\nAdresse: Fasitveien 4\nPrisantydning: 3 000 000 kr\nFellesgjeld: 200 000 kr\n':''
    const markers='TG2: Merknad om bad. TG3: Merknad om tak.'+(index===0?' TG2: Ekstra rapportmerknad.':'')+'\n'
    const filler=Array.from({length:60},()=> 'Hele rapportgrunnlaget beholdes selv om denne teksten ikke inneholder gradmarkor.').join('\n')+'\n'
    return header+markers+filler+(index===199?'TILSTANDSRAPPORT - SLUTT\n':'')
  })
  const bytes=codeFirstPdf(pages),format=await validatePdf(bytes,'near-limit-200.pdf',{maxPages:200})
  if(format.status!=='format-validated')throw new Error('format')
  const extracted=await extractImport(format)
  const textBytes=extracted.pages.reduce((total,page)=>total+Buffer.byteLength(page.text),0)
  expect(extracted.pages).toHaveLength(200);expect(extracted.pages.every(page=>page.status==='readable')).toBe(true)
  expect(textBytes).toBeGreaterThan(950000);expect(textBytes).toBeLessThanOrEqual(1024*1024)
  expect(extracted.pages.every(page=>Buffer.byteLength(page.text)<=128*1024)).toBe(true)
  const basis={hash:format.reportHash,name:'near-limit-200.pdf',role:'prospectus' as const,requestId:'residual-profile',parentHash:null,attachmentId:null,...extracted}
  const plan=createLocalPlan(basis),outcome=await createCodeFirstImport(basis)
  const unresolved=plan.selected.filter(block=>block.result==='unresolved')
  expect(unresolved.length).toBeGreaterThanOrEqual(600);expect(outcome.manifest!.candidates).toHaveLength(401)
  expect(outcome.manifest!.residual.length).toBeGreaterThan(1000)
  for(const block of unresolved)expect(outcome.manifest!.residual.some(item=>item.pdfPage===block.pdfPage&&item.reason==='Uløst tekstblokk: '+block.id)).toBe(true)
  for(const candidate of outcome.manifest!.candidates)expect(outcome.manifest!.residual.some(item=>item.pdfPage===candidate.pdfPage&&item.reason==='Uavklart TG-kandidat: '+candidate.id)).toBe(true)
  for(const page of outcome.pages)expect(outcome.manifest!.blocks.filter(block=>block.pdfPage===page.pdfPage).map(block=>page.text.slice(block.start,block.end)).join('')).toBe(page.text)
  expect(outcome.economy.fields.find(field=>field.id==='price')).toMatchObject({amount:'3000000',status:'available'})
  expect(economySuggestions(importEconomyDraft(outcome),{requireReview:false}).P).toBe('3200000')
  expect(outcome.coverage.technical.status).toBe('incomplete');expect(DocumentImportSchema.safeParse(outcome).success).toBe(true)
  expect(Buffer.byteLength(JSON.stringify(outcome))).toBeLessThanOrEqual(IMPORT_MAX_RESPONSE_BYTES)
},15000)
