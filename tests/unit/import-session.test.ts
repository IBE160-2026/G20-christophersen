import { beforeAll, describe, expect, it } from 'vitest'
import { createInitialSession, sessionReducer } from '../../src/frontend/state/session.ts'
import type { SessionState } from '../../src/frontend/state/session.ts'
import { findingListAssessment } from '../../src/frontend/state/report.ts'
import { calculateResultSnapshot, selectResult } from '../../src/frontend/state/result.ts'
import { ImportClient } from '../../src/frontend/analysis/import-client.ts'
import { importFixture } from '../helpers/import-fixture.ts'
import { DocumentImportSchema } from '../../src/contracts/document-import.ts'
import type { ImportRole } from '../../src/contracts/document-import.ts'
import oracle from '../fixtures/sales-prospectus/extended-expected.json' with { type: 'json' }
let fixture: Awaited<ReturnType<typeof importFixture>>
beforeAll(async()=>{fixture=await importFixture()})
function load(state:SessionState, data=fixture, role:ImportRole='prospectus'){
  const generation=state.prospectus.generation+1, correlation={requestId:data.outcome.requestId,sessionId:'import-state',generation}
  state=sessionReducer(state,{type:'import-selecting',generation,role})
  state=sessionReducer(state,{type:'import-selected',generation,role,selected:data.selected})
  state=sessionReducer(state,{type:'import-start',role,correlation})
  return sessionReducer(state,{type:'import-response',role,correlation,ok:true,body:{kind:'document-import',correlation,outcome:data.outcome}})
}
function financial(state:SessionState, values:{L:string;D:string;J:string;Ymin:string}){
  for(const field of ['P','L','D','J','Ymin'] as const){
    if(field!=='P')state=sessionReducer(state,{type:'register-value',field,rawValue:values[field as 'L'|'D'|'J'|'Ymin']!})
    state=sessionReducer(state,{type:'register-source',field,source:{kind:'assumption',description:`Kontrollert ${field}`,conflict:null}})
  }
  for(const field of ['L','D','J'] as const){state=sessionReducer(state,{type:'register-period',field,period:'year'});state=sessionReducer(state,{type:'register-year',field,year:'2026'})}
  state=sessionReducer(state,{type:'register-rent-nature',rentNature:'expected'})
  return sessionReducer(state,{type:'confirm-financial'})
}
function reportControl(state:SessionState, unresolved=false){
  state=sessionReducer(state,{type:'import-identity',checked:true});state=sessionReducer(state,{type:'import-area',checked:true})
  if(state.report.outcome?.status!=='completed')throw new Error('fixture')
  const generation=state.report.generation
  for(const finding of state.report.outcome.findings){
    state=sessionReducer(state,{type:'report-finding-confirm',generation,findingId:finding.findingId})
    if(finding.grade==='TG3'){
      state=sessionReducer(state,{type:'report-tg3-register',generation,findingId:finding.findingId,field:'status',value:unresolved?'unresolved':'resolved'})
      if(!unresolved){
        state=sessionReducer(state,{type:'report-tg3-register',generation,findingId:finding.findingId,field:'reason',value:'Fiktiv lekkasje er kontrollert og utbedret.'})
        state=sessionReducer(state,{type:'report-tg3-register',generation,findingId:finding.findingId,field:'basis',value:'Syntetisk dokumentert kontroll av samme takforhold.'})
      }
    }
  }
  return sessionReducer(state,{type:'report-list-confirm',generation,reportHash:state.report.selected!.hash,documentName:state.report.selected!.file.name,listRevision:state.report.listRevision})
}
describe('SO-AC1/11/12: importøkt og manuelt eierskap',()=>{
  it('import før tall gir P automatisk og ingen bekreftelser eller L-estimat',()=>{
    const state=load(createInitialSession())
    expect(state.financial.P.rawValue).toBe('3200000');expect(state.financial.L.rawValue).toBe('');expect(state.financial.D.rawValue).toBe('')
    expect(Object.values(state.financial).every(field=>!field.confirmed)).toBe(true)
    expect(state.report.outcome?.contractVersion).toBe('document-import-1');expect(findingListAssessment(state.report).canConfirm).toBe(false)
  })
  it('ny salgsoppgavehash nullstiller hele objektet, finansiering, retting, rapportkontroll og resultat',async()=>{
    let state=reportControl(financial(load(createInitialSession()),oracle.screening.go))
    state=sessionReducer(state,{type:'import-financing',field:'equity',value:'1000000'})
    state=sessionReducer(state,{type:'calculate-result'})
    const replacement=await importFixture('missing-report-6.pdf')
    state=load(state,replacement)
    expect(state.financial.P.rawValue).toBe('3200000');expect(state.financial.L.rawValue).toBe('');expect(state.financial.Ymin.rawValue).toBe('')
    expect(state.prospectus.financing.equity).toBe('');expect(state.listing.manualFields).toEqual([])
    expect(state.report.tg3Resolutions).toEqual([]);expect(state.resultSnapshot).toBeNull()
  })
  it('samme hash i gyldig kontekst bevarer manuelle felt, kildefilnavn, kontroll og resultat',()=>{
    let state=reportControl(financial(load(createInitialSession()),oracle.screening.go))
    state=sessionReducer(state,{type:'calculate-result'})
    const changedName={...fixture,selected:{...fixture.selected,file:new File([fixture.selected.bytes],'renamed.pdf')}}
    const next=load(state,changedName)
    expect(next.financial).toBe(state.financial);expect(next.report).toBe(state.report);expect(next.resultSnapshot).toBe(state.resultSnapshot)
    expect(next.prospectus.prospectus.selected?.file.name).toBe('mixed-12.pdf')
  })
  it('manuelle rettinger under aktiv import overskrives ikke av svar eller finansiering',()=>{
    let state=createInitialSession(),generation=1
    const correlation={requestId:fixture.outcome.requestId,sessionId:'state',generation}
    state=sessionReducer(state,{type:'import-selecting',role:'prospectus',generation});state=sessionReducer(state,{type:'import-selected',role:'prospectus',generation,selected:fixture.selected})
    state=sessionReducer(state,{type:'import-start',role:'prospectus',correlation})
    state=sessionReducer(state,{type:'register-value',field:'P',rawValue:'3500000'})
    state=sessionReducer(state,{type:'import-response',role:'prospectus',correlation,ok:true,body:{kind:'document-import',correlation,outcome:fixture.outcome}})
    state=sessionReducer(state,{type:'import-apply'});expect(state.financial.P.rawValue).toBe('3500000')
    expect(state.financial.J.rawValue).toBe('')
  })
  it('sen respons fra tidligere generasjon avvises',()=>{
    let state=load(createInitialSession()),generation=state.prospectus.generation+1
    state=sessionReducer(state,{type:'import-selecting',role:'prospectus',generation})
    const next=sessionReducer(state,{type:'import-response',role:'prospectus',correlation:{requestId:fixture.outcome.requestId,sessionId:'import-state',generation:generation-1},body:{},ok:true})
    expect(next).toBe(state)
  })
  it('separat rapport bevarer økonomi; ukjent tilhørighet krever begge originaler, TG3 overføres aldri',async()=>{
    let state=reportControl(financial(load(createInitialSession()),oracle.screening.go))
    const before=state.financial
    const separate=await importFixture('separate-report-4.pdf','report',fixture.outcome.reportHash)
    state=load(state,separate,'report')
    expect(state.financial).toBe(before);expect(state.report.tg3Resolutions).toEqual([])
    expect(state.prospectus.identityChecked).toBe(false);expect(findingListAssessment(state.report).canConfirm).toBe(false)
    expect(state.report.documentImport?.technical.findings[0]?.sources[0]?.pdfPage).toBe(3)
  })
  it('feil/uleselig/manglende område kan ikke overstyres med avkrysning eller tom liste',async()=>{
    for(const name of ['missing-report-6.pdf','scanned-report-12.pdf','ambiguous-12.pdf']){
      let state=load(createInitialSession(),await importFixture(name))
      state=sessionReducer(state,{type:'import-identity',checked:true});state=sessionReducer(state,{type:'import-area',checked:true})
      state={...state,report:{...state.report,outcome:state.report.outcome?.status==='completed'?{...state.report.outcome,findings:[]}:null}}
      expect(findingListAssessment(state.report).canConfirm).toBe(false)
      expect(calculateResultSnapshot(state).assessment.recommendation).toBe('Innhent mer informasjon')
    }
  })
  it('kjent identitetsmotstrid lar seg ikke bekrefte bort',async()=>{
    const prospectus=await importFixture('bounded-200.pdf'),report=await importFixture('wrong-property-report-4.pdf','report',prospectus.outcome.reportHash)
    let state=load(load(createInitialSession(),prospectus),report,'report')
    state=sessionReducer(state,{type:'import-identity',checked:true});state=sessionReducer(state,{type:'import-area',checked:true})
    expect(findingListAssessment(state.report).canConfirm).toBe(false)
  })
})
it.each(['go','reject','missing'] as const)('SO-AC14/15: full kontroll gir uavhengig fasit %s med uendret screening', key=>{
  const expected=oracle.screening[key]
  const state=reportControl(financial(load(createInitialSession()),expected),key==='missing')
  expect(findingListAssessment(state.report).controlCompleted).toBe(true)
  expect(calculateResultSnapshot(state).assessment.recommendation).toBe(expected.recommendation)
})
it('endret dekning ugyldiggjør resultat og TG3, aldri stille gjenbruk',()=>{
  let state=reportControl(financial(load(createInitialSession()),oracle.screening.go))
  state=sessionReducer(state,{type:'calculate-result'});state=sessionReducer(state,{type:'import-area',checked:false})
  expect(selectResult(state).status).toBe('historical');expect(state.report.tg3Resolutions).toEqual([])
})
it('SO-AC1/12: faktisk klient starter import uten finansinput, gjenbruker samme hash og leser ikke overstor fil',async()=>{
  let state=createInitialSession(),calls=0
  const client=new ImportClient(action=>{state=sessionReducer(state,action)},{id:()=>calls?'request':'session',hash:async()=>fixture.selected.hash,fetch:async(_url,init)=>{
    calls++;const headers=init?.headers as Record<string,string>,correlation={sessionId:headers['X-Session-Id'],requestId:headers['X-Request-Id'],generation:Number(headers['X-Analysis-Generation'])}
    return Response.json({kind:'document-import',correlation,outcome:{...fixture.outcome,requestId:correlation.requestId}})
  }})
  await client.select(fixture.selected.file,state.prospectus,'prospectus');expect(calls).toBe(1);expect(state.financial.P.rawValue).toBe('3200000')
  await client.select(fixture.selected.file,state.prospectus,'prospectus');expect(calls).toBe(1)
  let read=false
  const oversized={name:'large.pdf',size:50*1024*1024+1,arrayBuffer:async()=>{read=true;return new ArrayBuffer(0)}} as File
  await client.select(oversized,state.prospectus,'prospectus');expect(read).toBe(false);expect(calls).toBe(1);expect(state.prospectus.prospectus.error).toBe('payload-too-large')
})

it('SO-AC5: brukerrettet TG-kilde kan ikke flyttes utenfor rapportområdet eller til ulest side',async()=>{
  for(const name of ['mixed-12.pdf','raster-footer-12.pdf']){
    let state=load(createInitialSession(),await importFixture(name))
    const generation=state.report.generation,findingId='bathroom-1-floor'
    state=sessionReducer(state,{type:'report-finding-edit',generation,findingId})
    state=sessionReducer(state,{type:'report-finding-draft',generation,findingId,field:'pdfPage',value:name==='mixed-12.pdf'?'2':'10'})
    state=sessionReducer(state,{type:'report-finding-apply',generation,findingId})
    expect(state.report.findingControls[0]?.correction).toBeNull()
    expect(state.report.findingControls[0]?.errors.source).toContain('lesbar fysisk side')
  }
})

it('SO-AC12: FINN-objektbytte nullstiller importen og avviser sen respons/reapply fra gammel salgsoppgave',async()=>{
  let state=load(createInitialSession())
  const old=state.prospectus,generation=old.generation+1,correlation={requestId:fixture.outcome.requestId,sessionId:'old',generation}
  const separate=await importFixture('separate-report-4.pdf','report',fixture.outcome.reportHash)
  state=sessionReducer(state,{type:'import-selecting',role:'report',generation})
  state=sessionReducer(state,{type:'import-selected',role:'report',generation,selected:separate.selected})
  state=sessionReducer(state,{type:'import-start',role:'report',correlation})
  expect(state.prospectus.report.active).not.toBeNull()
  state=sessionReducer(state,{type:'listing-url',url:'https://www.finn.no/realestate/homes/ad/123456'})
  expect(state.prospectus.prospectus.selected).toBeNull();expect(state.prospectus.prospectus.outcome).toBeNull()
  expect(state.prospectus.generation).toBeGreaterThan(generation);expect(state.report.documentImportGate).toBeUndefined()
  const changed=state
  state=sessionReducer(state,{type:'import-response',role:'report',correlation,ok:true,body:{kind:'document-import',correlation,outcome:separate.outcome}})
  expect(state).toBe(changed)
  state=sessionReducer(state,{type:'import-apply'});expect(state.financial.P.rawValue).toBe('');expect(state.report.outcome).toBeNull()
})
it('SO-AC12: aktive salgsoppgaver bruker ny rapportgrense; sene legacy-fil/svar kan ikke bytte ut kilde eller gate',()=>{
  const state=load(createInitialSession()),generation=state.report.generation+1
  expect(sessionReducer(state,{type:'report-selecting',generation})).toBe(state)
  expect(sessionReducer(state,{type:'report-selected',generation,selected:fixture.selected})).toBe(state)
  expect(sessionReducer(state,{type:'report-response',correlation:{requestId:'legacy',sessionId:'legacy',generation},ok:true,body:{}})).toBe(state)
})
function controlledEconomy(){
  let state=load(createInitialSession())
  state={...state,prospectus:{...state.prospectus,completeOperatingCosts:true,financing:{equity:'0',annualInterest:'0',months:'300',year:'2026'},
    corrections:Object.fromEntries(fixture.outcome.economy.fields.map(field=>[field.id,{rawAmount:field.amount??'',rawDebtPart:field.debtPart??'',period:field.period,year:field.year??'',includedIn:field.includedIn,note:'',reviewed:true}]))}}
  return state
}
it.each(['','2027'])('review: driftsår 2026 bevares ved manglende/avvikende finansieringsår %s',year=>{
  let state=controlledEconomy();state={...state,prospectus:{...state.prospectus,financing:{...state.prospectus.financing,year}}}
  state=sessionReducer(state,{type:'import-apply'})
  expect(state.financial.D).toMatchObject({rawValue:'60000',period:'year',year:'2026',confirmed:false})
  expect(state.financial.J.rawValue).toBe('')
})
it.each(['cost','source'] as const)('review: manuelt adoptert %s og kildebelegg overlever finansiering/retting',kind=>{
  let state=sessionReducer(controlledEconomy(),{type:'import-apply'})
  if(kind==='cost')state=sessionReducer(state,{type:'change-cost',id:state.costItems[0]!.id,update:{label:'Min kontrollerte kostnad'}})
  else state=sessionReducer(state,{type:'register-source',field:'D',source:{kind:'source',description:'Min kontrollerte driftskilde',conflict:null}})
  const costs=state.costItems,drift=state.financial.D,source=state.sources.D
  state=sessionReducer(state,{type:'import-financing',field:'equity',value:'100000'})
  expect(state.costItems).toBe(costs);expect(state.financial.D).toBe(drift);expect(state.sources.D).toBe(source)
  const correction={...state.prospectus.corrections.propertyTax!,note:'Ny importretting'}
  state=sessionReducer(state,{type:'import-correction',id:'propertyTax',correction})
  expect(state.costItems).toBe(costs);expect(state.financial.D).toBe(drift)
})
it('review: ubeslektede manuelle nullbekreftelser og bekreftede felt beholdes',()=>{
  let state=controlledEconomy()
  for(const field of ['L','Ymin','D','J'] as const){
    state=sessionReducer(state,{type:'register-value',field,rawValue:'0'})
    state=sessionReducer(state,{type:'check-zero',field,checked:true})
    state={...state,financial:{...state.financial,[field]:{...state.financial[field],confirmed:true}}}
  }
  state=sessionReducer(state,{type:'import-apply'})
  expect(state.explicitZeros).toEqual(['L','Ymin','D','J'])
  for(const field of ['L','Ymin','D','J'] as const)expect(state.financial[field].confirmed).toBe(true)
  state=sessionReducer(state,{type:'import-financing',field:'equity',value:'123'})
  expect(state.explicitZeros).toEqual(['L','Ymin','D','J'])
})
it('review: integrert intern identitetskonflikt bevarer økonomi og sperrer kontroll',async()=>{
  let state=load(createInitialSession(),await importFixture('integrated-identity-conflict-12.pdf'))
  state=sessionReducer(state,{type:'import-identity',checked:true});state=sessionReducer(state,{type:'import-area',checked:true})
  expect(state.financial.P.rawValue).toBe('3200000')
  expect(state.report.documentImportGate?.identityConflict).toBe(true)
  expect(findingListAssessment(state.report).canConfirm).toBe(false)
})
it('review: separat rapport kan fjernes lokalt, med økonomi bevart og sen retur avvist',async()=>{
  const original=reportControl(financial(load(createInitialSession()),oracle.screening.go))
  const separate=await importFixture('separate-report-4.pdf','report',fixture.outcome.reportHash)
  const generation=original.prospectus.generation+1,correlation={requestId:separate.outcome.requestId,sessionId:'restore',generation}
  let state=sessionReducer(original,{type:'import-selecting',role:'report',generation})
  state=sessionReducer(state,{type:'import-selected',role:'report',generation,selected:separate.selected})
  state=sessionReducer(state,{type:'import-start',role:'report',correlation})
  state=sessionReducer(state,{type:'import-restore-integrated'})
  expect(state.financial).toBe(original.financial);expect(state.prospectus.prospectus.outcome).toBe(original.prospectus.prospectus.outcome)
  expect(state.report.selected?.hash).toBe(fixture.selected.hash)
  expect(state.prospectus.generation).toBeGreaterThan(generation);expect(state.prospectus.report.selected).toBeNull()
  expect(state.report.tg3Resolutions).toEqual([]);expect(state.prospectus.identityChecked).toBe(false);expect(state.prospectus.areaChecked).toBe(false)
  const restored=state
  state=sessionReducer(state,{type:'import-response',role:'report',correlation,ok:true,body:{kind:'document-import',correlation,outcome:separate.outcome}})
  expect(state).toBe(restored)
})
it.each(['correlation-session','correlation-request','correlation-generation','hash','name','role','requestId','parentHash'] as const)('review: aktiv respons med fremmed %s installeres ikke',async change=>{
  const separate=await importFixture('separate-report-4.pdf','report',fixture.outcome.reportHash)
  let state=load(createInitialSession()),generation=state.prospectus.generation+1
  const correlation={requestId:separate.outcome.requestId,sessionId:'binding',generation}
  state=sessionReducer(state,{type:'import-selecting',role:'report',generation});state=sessionReducer(state,{type:'import-selected',role:'report',generation,selected:separate.selected})
  state=sessionReducer(state,{type:'import-start',role:'report',correlation})
  const financial=state.financial,body={kind:'document-import',correlation:{...correlation},outcome:structuredClone(separate.outcome)}
  if(change==='correlation-session')body.correlation.sessionId='foreign'
  if(change==='correlation-request')body.correlation.requestId='foreign'
  if(change==='correlation-generation')body.correlation.generation++
  if(change==='requestId')body.outcome.requestId='foreign'
  if(change==='parentHash')body.outcome.documents[0]!.parentHash='f'.repeat(64)
  if(change==='role'){body.outcome.role='prospectus';body.outcome.documents[0]!.role='prospectus'}
  if(change==='hash'||change==='name'){
    const oldHash=body.outcome.reportHash,oldName=body.outcome.documentName
    const serialized=JSON.stringify(body.outcome).replaceAll(change==='hash'?oldHash:oldName,change==='hash'?'f'.repeat(64):'foreign.pdf')
    body.outcome=JSON.parse(serialized)
  }
  expect(DocumentImportSchema.safeParse(body.outcome).success).toBe(true)
  state=sessionReducer(state,{type:'import-response',role:'report',correlation,ok:true,body})
  expect(state.prospectus.report.error).toBe('metadata-mismatch');expect(state.prospectus.report.outcome).toBeNull()
  expect(state.financial).toBe(financial);expect(state.report.outcome).toBeNull();expect(state.report.findingControls).toEqual([])
})
