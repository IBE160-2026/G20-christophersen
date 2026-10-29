import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { VERSION as INSTALLED_SDK_VERSION } from 'openai/version'
import { spawnSync } from 'node:child_process'
import { AnalysisBudgetStore } from '../../src/backend/import/analysis-budget-store.ts'
import { assessLivePreflight, captureSemanticWire, verifySemanticWire } from '../../src/backend/import/live-preflight.ts'
import { createLocalPlan } from '../../src/backend/import/local-plan.ts'
import { createSemanticRequest } from '../../src/backend/import/semantic-request.ts'
import { REFERENCE_PRICE, GLOBAL_STANDARD_PRICE } from '../../src/backend/import/budget.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { codeFirstBasis, sdkStub } from '../helpers/code-first.ts'
import { countSemanticInput, createOfflineTokenCountTransport } from '../../src/backend/import/token-count.ts'

const hash = 'a'.repeat(64), digest = 'b'.repeat(64), reportHash = 'c'.repeat(64)
const directories: string[] = [], stores: AnalysisBudgetStore[] = []
const rootBasis = () => ({ ...codeFirstBasis(), hash })
const directory = () => { const path=mkdtempSync(join(tmpdir(),'live-preflight-')); directories.push(path); return path }
function opened(path: string) { const store=AnalysisBudgetStore.open(path,hash);stores.push(store);return store }
afterEach(()=> { stores.splice(0).forEach(store=>store.close());directories.splice(0).forEach(path=>rmSync(path,{recursive:true,force:true})) })
describe('exclusive durable analysis allowance before transport',()=>{
  it('missing, malformed, mismatched and locked histories block rather than start a new USD .20 quota',()=>{
    const path=directory()
    expect(()=>opened(path)).toThrow('budget-history-unavailable')
    AnalysisBudgetStore.initialize(path,hash)
    const history=join(path,readdirSync(path).find(name=>name.endsWith('.json'))!)
    const good=readFileSync(history,'utf8')
    for(const corrupt of ['{',JSON.stringify({...JSON.parse(good),analysisId:reportHash}),JSON.stringify({...JSON.parse(good),entries:[{documentHash:hash,requestDigest:digest,reservedUsd:'0.10',actualUsd:null,state:'completed'}]})]){
      writeFileSync(history,corrupt);expect(()=>opened(path)).toThrow('budget-history-unavailable')
    }
    writeFileSync(history,good)
    const store=opened(path)
    expect(()=>opened(path)).toThrow('budget-history-locked')
    expect(()=>AnalysisBudgetStore.initialize(path,hash)).toThrow()
    store.close();expect(()=>AnalysisBudgetStore.initialize(path,hash)).toThrow()
    expect(opened(path).remaining()).toBe('0.20000000')
  })
  it.each(['reserved','uncertain','completed'] as const)('restart preserves %s reservation, no duplicate or separate-report reset',state=>{
    const path=directory();AnalysisBudgetStore.initialize(path,hash)
    const store=opened(path);store.reserve(hash,digest,'0.198')
    if(state!=='reserved')store.settle(digest,state==='completed'?'0.01':null)
    store.close()
    const restored=opened(path)
    expect(restored.snapshot()[0]).toMatchObject({state,reservedUsd:'0.198'})
    expect(restored.remaining()).toBe('0.00200000')
    expect(()=>restored.reserve(hash,'d'.repeat(64),'0')).toThrow('document-already-attempted')
    expect(()=>restored.reserve(reportHash,'d'.repeat(64),'0.00200001')).toThrow('analysis-budget-exceeded')
    restored.reserve(reportHash,'d'.repeat(64),'0.002')
    expect(restored.remaining()).toBe('0.00000000')
    expect(()=>restored.reserve('e'.repeat(64),'f'.repeat(64),'0.00000001')).toThrow('analysis-budget-exceeded')
    restored.close();expect(opened(path).remaining()).toBe('0.00000000')
  })
  it('a process crash leaves durable pre-transport reservation and a blocking ownership lock',()=>{
    const path=directory();AnalysisBudgetStore.initialize(path,hash)
    const moduleUrl=new URL('../../src/backend/import/analysis-budget-store.ts',import.meta.url).href
    const child=spawnSync(process.execPath,['--input-type=module','-e',`import { AnalysisBudgetStore } from ${JSON.stringify(moduleUrl)}; const ledger=AnalysisBudgetStore.open(${JSON.stringify(path)},${JSON.stringify(hash)});ledger.reserve(${JSON.stringify(hash)},${JSON.stringify(digest)},'0.198');process.exit(23);`],{encoding:'utf8'})
    expect(child.status,child.stderr).toBe(23)
    const history=JSON.parse(readFileSync(join(path,readdirSync(path).find(name=>name.endsWith('.json'))!),'utf8'))
    expect(history.entries).toEqual([{documentHash:hash,requestDigest:digest,reservedUsd:'0.198',actualUsd:null,state:'reserved'}])
    expect(()=>opened(path)).toThrow('budget-history-locked')
    // A restarted process never clears this lock automatically.
    expect(()=>opened(path)).toThrow('budget-history-locked')
  })
  it('SDK stub sees the already-persisted reservation; timeout persists uncertain usage without retry',async()=>{
    const path=directory();AnalysisBudgetStore.initialize(path,hash)
    const ledger=opened(path),basis=codeFirstBasis();basis.hash=hash
    const deps=sdkStub();let calls=0
    const outcome=await createCodeFirstImport(basis,{...deps,ledger,deadlineMs:5,transport:{purpose:'offline-stub',responses:{create:async()=>{
      calls++
      const history=JSON.parse(readFileSync(join(path,readdirSync(path).find(name=>name.endsWith('.json'))!),'utf8'))
      expect(history.entries[0].state).toBe('reserved')
      return await new Promise(()=>{})
    }}}})
    expect(calls).toBe(1);expect(outcome.cost!.status).toBe('uncertain')
    ledger.close();expect(opened(path).snapshot()[0]!.state).toBe('uncertain')
  })
  it('the adapter reopens the same root allowance for a separate report and refuses its second call',async()=>{
    const path=directory();AnalysisBudgetStore.initialize(path,hash)
    const ledger=opened(path),basis=codeFirstBasis();basis.hash=hash
    const deps=sdkStub();deps.tokenizer.countRequest=()=>40000
    const first=await createCodeFirstImport(basis,{...deps,ledger})
    expect(first.cost!.status).toBe('completed');expect(first.cost!.reservedUsd).toBe('0.19800000')
    ledger.close()
    const restored=opened(path),report={...codeFirstBasis(),hash:reportHash,parentHash:hash,role:'report' as const}
    const second=await createCodeFirstImport(report,{...deps,ledger:restored})
    expect(second.cost!.analysisId).toBe(hash);expect(second.cost!.reason).toBe('analysis-budget-exceeded')
    expect(deps.calls).toHaveLength(1);expect(restored.snapshot()).toHaveLength(1)
  })
  it('a failed durable write fails preflight and retains a blocking lock without invoking transport',async()=>{
    const path=directory();AnalysisBudgetStore.initialize(path,hash)
    const ledger=opened(path),pending=join(path,readdirSync(path).find(name=>name.endsWith('.json'))!.replace(/\.json$/,'.pending'))
    writeFileSync(pending,'simulated interrupted write')
    const deps=sdkStub(),basis=codeFirstBasis();basis.hash=hash
    const outcome=await createCodeFirstImport(basis,{...deps,ledger})
    expect(outcome.cost!.reason).toBe('budget-history-write-failed');expect(deps.calls).toHaveLength(0)
    ledger.close();expect(()=>opened(path)).toThrow('budget-history-locked')
  })
  it('pending evidence prevents initialization from inventing an empty history',()=>{
    const path=directory(),pending=join(path,createHash('sha256').update(hash).digest('hex')+'.pending')
    writeFileSync(pending,'unresolved prior reservation')
    expect(()=>AnalysisBudgetStore.initialize(path,hash)).toThrow('budget-history-unavailable')
    expect(readFileSync(pending,'utf8')).toBe('unresolved prior reservation')
    expect(readdirSync(path)).toEqual([pending.slice(path.length+1)])
    expect(()=>opened(path)).toThrow('budget-history-unavailable')
  })
  it('settlement write failure after transport returns uncertainty without a second settlement or retry',async()=>{
    const path=directory();AnalysisBudgetStore.initialize(path,hash)
    const ledger=opened(path),settle=vi.spyOn(ledger,'settle'),deps=sdkStub()
    const history=join(path,readdirSync(path).find(name=>name.endsWith('.json'))!)
    const outcome=await createCodeFirstImport(rootBasis(),{...deps,ledger,transport:{purpose:'offline-stub',responses:{async create(request,options){
      const response=await deps.transport.responses.create(request,options)
      writeFileSync(history.replace(/\.json$/,'.pending'),'simulated settlement-write failure')
      return response
    }}}})
    expect(outcome.cost).toMatchObject({status:'uncertain',reason:'budget-history-write-failed'})
    expect(outcome.coverage.technical.status).toBe('incomplete')
    expect(settle).toHaveBeenCalledTimes(1);expect(deps.calls).toHaveLength(1)
    expect(JSON.parse(readFileSync(history,'utf8')).entries[0]).toMatchObject({state:'reserved',actualUsd:null})
    ledger.close();expect(()=>opened(path)).toThrow('budget-history-locked')
  })
})
describe('real SDK whole-request binding and closed readiness',()=>{
  it('captures exact JSON including full strict schema and prevents wire/request mutation',async()=>{
    const request=createSemanticRequest(createLocalPlan(rootBasis())),wire=await captureSemanticWire(request)
    expect(verifySemanticWire(request,wire)).toBe(true)
    expect(wire.sdkVersion).toBe(INSTALLED_SDK_VERSION)
    expect(verifySemanticWire(request,{...wire,sdkVersion:'6.9.2'})).toBe(false)
    expect(assessLivePreflight(request,hash,{...wire,sdkVersion:'6.9.2'}).blockers).toContain('sdk-wire-mismatch')
    expect(JSON.parse(wire.body)).toEqual(request)
    expect(JSON.parse(wire.body).text.format.schema.additionalProperties).toBe(false)
    expect(verifySemanticWire({...request,instructions:request.instructions+' changed'},wire)).toBe(false)
    expect(verifySemanticWire(request,{...wire,body:wire.body.replace('semantic_spans_1','semantic_spans_X')})).toBe(false)
    expect(verifySemanticWire(request,{...wire,url:'https://other.example/responses'})).toBe(false)
    const result=assessLivePreflight(request,hash,wire)
    expect(result.ready).toBe(false);expect(result.blockers).toEqual(['server-token-count-required','token-count-price-unverified','unknown-price','budget-history-unavailable'])
  })
  it('test-only/local labels and genuine SDK stub receipts never authorize production reservation',async()=>{
    const path=directory();AnalysisBudgetStore.initialize(path,hash)
    const ledger=opened(path),request=createSemanticRequest(createLocalPlan(rootBasis())),wire=await captureSemanticWire(request)
    const tokenizer={model:'gpt-6.1-sol' as const,verification:'verified-local-model-and-request-framing' as const,countRequest:()=>40000}
    expect(assessLivePreflight(request,hash,wire,{ledger,tokenizer,price:REFERENCE_PRICE}).ready).toBe(false)
    const tokenCount=await countSemanticInput(request,{transport:createOfflineTokenCountTransport(async()=>new Response(JSON.stringify({object:'response.input_tokens',input_tokens:40000}),{headers:{'content-type':'application/json'}}))})
    const result=assessLivePreflight(request,hash,wire,{ledger,tokenCount,price:GLOBAL_STANDARD_PRICE})
    expect(result.blockers).toEqual(['token-count-stub-only','token-count-price-unverified'])
    expect(result.cost).toBeNull();expect(ledger.snapshot()).toEqual([])
    const forged={...tokenCount,provenance:'responses-input-tokens' as const}
    expect(assessLivePreflight(request,hash,wire,{ledger,tokenCount:forged,price:GLOBAL_STANDARD_PRICE}).blockers).toContain('token-count-evidence-mismatch')
    expect(ledger.snapshot()).toEqual([])
  })
  it.each([
    {service_tier:'priority'}, {reasoning:{effort:'high'}}, {prompt_cache_retention:'12h'}, {tools:[{type:'web_search'}]},
    {previous_response_id:'resp_previous'}, {conversation:'conversation_1'}, {store:true},
    {text:null}, {instructions:'arbitrary replacement prompt'}, {text:{format:{type:'json_object'}}},
    {text:{format:{type:'json_schema',name:'semantic_spans_1',strict:false,schema:{type:'object'}}}},
    {input:[{role:'user',content:[{type:'input_image',image_url:'https://example.test/image.png'}]}]},
  ])('incompatible request cannot use verified Standard/default-30m prices: %j',async mutation=>{
    const path=directory();AnalysisBudgetStore.initialize(path,hash)
    const ledger=opened(path),request=Object.assign(createSemanticRequest(createLocalPlan(rootBasis())),mutation),wire=await captureSemanticWire(request)
    const result=assessLivePreflight(request,hash,wire,{ledger,price:GLOBAL_STANDARD_PRICE,tokenizer:{model:'gpt-6.1-sol',verification:'verified-local-model-and-request-framing',countRequest:()=>100}})
    expect(result.ready).toBe(false);expect(result.blockers).toContain('incompatible-standard-request');expect(ledger.snapshot()).toEqual([])
  })
  it('initialization binds to root hash, including a separate report',()=>{
    const path=directory();AnalysisBudgetStore.initialize(path,hash)
    expect(()=>AnalysisBudgetStore.open(path,reportHash)).toThrow('budget-history-unavailable')
  })
  it('request document and report parent bind reservations to the matching logical root',async()=>{
    const path=directory();AnalysisBudgetStore.initialize(path,hash);AnalysisBudgetStore.initialize(path,reportHash)
    const ledger=opened(path),unrelated=AnalysisBudgetStore.open(path,reportHash);stores.push(unrelated)
    const options={price:GLOBAL_STANDARD_PRICE,tokenizer:{model:'gpt-6.1-sol' as const,verification:'verified-local-model-and-request-framing' as const,countRequest:()=>100}}
    const request=createSemanticRequest(createLocalPlan(rootBasis())),wire=await captureSemanticWire(request)
    expect(assessLivePreflight(request,hash,wire,{...options,ledger:unrelated}).blockers).toContain('analysis-root-mismatch')
    expect(assessLivePreflight(request,reportHash,wire,{...options,ledger}).blockers).toContain('request-document-mismatch')
    const reportRequest=createSemanticRequest(createLocalPlan({...rootBasis(),hash:reportHash,role:'report',parentHash:hash})),reportWire=await captureSemanticWire(reportRequest)
    expect(assessLivePreflight(reportRequest,reportHash,reportWire,{...options,ledger:unrelated}).blockers).toContain('analysis-root-mismatch')
    expect(unrelated.snapshot()).toEqual([]);expect(ledger.snapshot()).toEqual([])
    expect(assessLivePreflight(reportRequest,reportHash,reportWire,{...options,ledger}).blockers).toContain('server-token-count-required')
    const orphan=createSemanticRequest(createLocalPlan({...rootBasis(),hash:'d'.repeat(64),role:'report',parentHash:null}))
    expect(assessLivePreflight(orphan,'d'.repeat(64),await captureSemanticWire(orphan),{...options,ledger}).blockers).toContain('request-document-mismatch')
  })
})
