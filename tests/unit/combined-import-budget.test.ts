import { describe, expect, it } from 'vitest'
import { createCombinedRequest, checkCombinedBudget, checkCombinedResponse, COMBINED_LIMITS, COMBINED_EXTRACTION_SCHEMA, combinedInputDigest } from '../../src/backend/import/combined-request.ts'
import type { CombinedRequest, LocalModelTokenizer } from '../../src/backend/import/combined-request.ts'
import { TG_EXTRACTION_RULES } from '../../src/backend/analysis/live-request.ts'
import { importFixture } from '../helpers/import-fixture.ts'
const request=createCombinedRequest({hash:'a'.repeat(64),name:'synthetic.pdf',role:'prospectus',sections:[],pages:[{pdfPage:1,text:'Eksplisitt syntetisk økonomitekst',status:'readable',reason:null}],attachments:[]})
// Troverdighetsmerkingen nedenfor er testavhengighet, aldri en faktisk modelltilpasset tokenizer.
const counter=(tokens:number):LocalModelTokenizer=>({model:request.model,verification:'verified-local-model-and-request-framing',countRequest:()=>tokens})
describe('SO-AC13/14: kombinert request og stengt lokal token-preflight',()=>{
  it('strict kombinert økonomi-/TG-schema gjenbruker TG-regler og har ingen verktøy/transport',()=>{
    expect(request.instructions).toContain(TG_EXTRACTION_RULES)
    expect(request.text.format.strict).toBe(true)
    expect(COMBINED_EXTRACTION_SCHEMA.additionalProperties).toBe(false)
    expect(COMBINED_EXTRACTION_SCHEMA.required).toEqual(['economy','propertyIdentity','sections','technical'])
    expect(request.max_output_tokens).toBe(16000)
    expect(request).not.toHaveProperty('tools');expect(request).toMatchObject({store:false,stream:false,truncation:'disabled'})
    expect(()=>checkCombinedBudget(request)).toThrowError('local-tokenizer-unavailable')
  })
  it('100000 inkluderer prompt/schema/metadata/framing i hele requesten; +1 avvises',()=>{
    let seen:CombinedRequest|undefined
    expect(checkCombinedBudget(request,{...counter(100000),countRequest:value=>{seen=value;return 100000}})).toEqual({inputTokens:100000,outputTokens:16000})
    expect(seen).toBe(request);expect(seen?.instructions).toBeTruthy();expect(seen?.text.format.schema).toBe(COMBINED_EXTRACTION_SCHEMA)
    expect(()=>checkCombinedBudget(request,counter(100001))).toThrowError('input-token-limit')
  })
  it.each([NaN,Infinity,-1,1.5])('upålitelig tokenantall %s avvises uten estimat/fallback',tokens=>{
    expect(()=>checkCombinedBudget(request,counter(tokens))).toThrowError('invalid-token-count')
  })
  it('manglende/feil modelltilpasning eller tellersvikt blokkerer; ukjent modell kan ikke velges',()=>{
    expect(()=>checkCombinedBudget(request,{...counter(1),model:'ukjent'} as unknown as LocalModelTokenizer)).toThrowError('local-tokenizer-unavailable')
    expect(()=>checkCombinedBudget(request,{...counter(1),verification:'unverified'} as unknown as LocalModelTokenizer)).toThrowError('local-tokenizer-unavailable')
    expect(()=>checkCombinedBudget(request,{...counter(1),countRequest(){throw new Error('synthetic')}})).toThrowError('local-tokenizer-unavailable')
    expect(()=>checkCombinedBudget({...request,model:'ukjent'} as unknown as CombinedRequest,counter(1))).toThrowError('unknown-model')
  })
  it('output har ett samlet maksimum 16000 inkludert reasoning, ingen ekstra outputkvote',()=>{
    for(const max_output_tokens of [0,16001,128000,NaN])expect(()=>checkCombinedBudget({...request,max_output_tokens} as CombinedRequest,counter(1))).toThrowError('output-token-limit')
    expect(checkCombinedBudget(request,counter(1)).outputTokens).toBe(COMBINED_LIMITS.outputTokens)
  })
  it('8 MiB er inklusivt; større/ukomplette leverandørsvar avvises',()=>{
    expect(()=>checkCombinedResponse('completed',8*1024*1024)).not.toThrow()
    expect(()=>checkCombinedResponse('completed',8*1024*1024+1)).toThrowError('response-limit')
    for(const status of ['incomplete','failed','cancelled','refused'])expect(()=>checkCombinedResponse(status,100)).toThrowError('incomplete-response')
  })
  it('faktisk kombinert 200-sidersrequest velger bare relevant økonomi og hele rapporten, med modell-/schemabundet digest',async()=>{
    const {outcome}=await importFixture('bounded-200.pdf')
    const omitted=new Set(outcome.coverage.economy.omittedPages)
    const selected=outcome.pages.filter(page=>!omitted.has(page.pdfPage))
    const prepared=createCombinedRequest({hash:outcome.reportHash,name:outcome.documentName,role:outcome.role,sections:outcome.sections,pages:selected,attachments:outcome.attachments})
    const input=JSON.parse(prepared.input[0].content[0].text)
    expect(input.pages.map((page:{pdfPage:number})=>page.pdfPage)).toEqual([1,2,5,6,7,8,9,10,11,12])
    expect(input.pages).toHaveLength(10);expect(outcome.pages).toHaveLength(200)
    expect(combinedInputDigest(prepared)).toBe(outcome.inputDigest)
    expect(combinedInputDigest({...prepared,instructions:prepared.instructions+'x'})).not.toBe(outcome.inputDigest)
  })
})
