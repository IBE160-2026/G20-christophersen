// Offline only: transport uses a fake local function, never an SDK or server.
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { attemptId,sha,validatePreflight,validateOutcome,validateLimitationApproval } from './f1-b2.mjs'
import { createObservedFetch } from './f1-b2-transport.mjs'
import { createOwnedLock } from './run-safety.mjs'
const p=()=>({attemptId,checkedAt:new Date().toISOString(),accountVerified:true,unknownChargesResolved:true,accessVerified:true,priceVerified:true,costBeforeUsd:0.016072,accountLimitUsd:2,availableUsd:1.983928,reservationUsd:1.53,prices:{input:2,cached:0.1,cacheWrite:2.5,output:10},priceSource:'https://developers.openai.com/api/docs/models/gpt-6.1-sol'})
const outcome=()=>JSON.parse(readFileSync(new URL('../../.docs/implementation-artifacts/story-4-4/F1-outcome.json',import.meta.url),'utf8'))
test('preflight rejects stale, unknown account, budget and price mismatch',()=>{
  validatePreflight(p())
  for(const patch of [{checkedAt:'2020-01-01'},{unknownChargesResolved:false},{costBeforeUsd:0},{availableUsd:NaN},{reservationUsd:1.48},{accountLimitUsd:20},{prices:{input:1}}])assert.throws(()=>validatePreflight({...p(),...patch}))
})
test('F1 guard rejects extra findings, uncertainty, wrong physical page and grade',()=>{
  validateOutcome(outcome())
  const semantic=outcome();semantic.findings[0].description='Slitasje på gulvflate på bad';validateOutcome(semantic)
  for(const mutate of [o=>o.findings.push(o.findings[0]),o=>o.uncertainCandidates.push({}),o=>o.findings[0].source.pdfPage=1,o=>o.findings[0].grade='TG3',o=>o.findings[0].original.uncertainties.push('unknown')]) {const o=outcome();mutate(o);assert.throws(()=>validateOutcome(o))}
})
test('limitation approval binds exact fresh original and outcome hash',()=>{
  const o=outcome(),a={attemptId,outcomeSha256:'bound',reportHash:o.reportHash,reviewedBy:'root-agent',originalPdfReviewed:true,findingAssessment:{findingId:o.findings[0].findingId,description:o.findings[0].description,source:o.findings[0].source,sourceSupported:true,originalUnchanged:true},assessments:o.limitations.map((original,index)=>({original,index,reason:'Kontrollert faktisk originalrapport og generell begrensning.',controlledNonCritical:true}))}
  validateLimitationApproval(a,o,'bound')
  for(const patch of [{outcomeSha256:'old'},{originalPdfReviewed:false},{findingAssessment:undefined},{findingAssessment:{...a.findingAssessment,sourceSupported:false}},{findingAssessment:{...a.findingAssessment,description:'other'}},{assessments:[]},{assessments:[{...a.assessments[0],original:'different'}]},{assessments:[{...a.assessments[0],reason:''}]}])assert.throws(()=>validateLimitationApproval({...a,...patch},o,'bound'))
})
function setup(t){const d=mkdtempSync(join(tmpdir(),'f1-b2-offline-'));t.after(()=>rmSync(d,{recursive:true,force:true}));const lock=join(d,'lock');const owner=createOwnedLock(lock,'F1');const request=JSON.parse(readFileSync(new URL('../../.docs/implementation-artifacts/story-4-4/F1-request.json',import.meta.url),'utf8'));const basis=JSON.parse(request.input[0].content[0].text);basis.requestId=attemptId;request.input[0].content[0].text=JSON.stringify(basis);const plan={attemptId,globalLock:lock,requestSha256:sha(JSON.stringify(request)),reportHash:basis.reportHash,model:request.model,reservationUsd:1.53};writeFileSync(join(d,'plan.json'),JSON.stringify(plan));writeFileSync(join(d,'started.json'),JSON.stringify({owner}));return {d,request,lock}}
const provider=()=>({status:'completed',model:'gpt-6.1-sol',service_tier:'default',usage:{input_tokens:100,output_tokens:10,total_tokens:110,input_tokens_details:{cached_tokens:0,cache_write_tokens:0},output_tokens_details:{reasoning_tokens:0}}})
const endpoint='https://api.openai.com/v1/responses'
test('single original response captured; only requestId may change; lock retained',async t=>{
  const {d,request,lock}=setup(t);const basis=JSON.parse(request.input[0].content[0].text);basis.requestId='actual-ui-id';request.input[0].content[0].text=JSON.stringify(basis);let calls=0;const fetch=createObservedFetch(d,async()=>{calls++;return Response.json(provider(),{headers:{'x-request-id':'safe','authorization':'unsafe'}})})
  const response=await fetch(endpoint,{method:'POST',body:JSON.stringify(request)});assert.equal((await response.json()).status,'completed');assert.equal(calls,1);assert.equal(JSON.parse(readFileSync(join(d,'usage.json'))).unknownCost,false);assert.ok(existsSync(lock));assert.equal(readFileSync(join(d,'http.json'),'utf8').includes('unsafe'),false);await assert.rejects(fetch(endpoint,{method:'POST',body:JSON.stringify(request)}));assert.equal(calls,1)
})
test('modified request, endpoint, and wrong lock owner never forward',async t=>{
  for(const kind of ['request','endpoint','owner']) {const {d,request,lock}=setup(t);let calls=0;const fetch=createObservedFetch(d,async()=>{calls++;throw Error('must not call')});if(kind==='request')request.instructions+='modified';if(kind==='owner')writeFileSync(join(lock,'owner.json'),JSON.stringify({fixtureId:'F2',attemptId:'other'}));await assert.rejects(fetch(kind==='endpoint'?'https://example.com':endpoint,{method:'POST',body:JSON.stringify(request)}));assert.equal(calls,0);assert.equal(existsSync(join(d,'dispatch.json')),false)}
})
test('error body never persisted, unknown usage and lock remain',async t=>{
  const {d,request,lock}=setup(t);const fetch=createObservedFetch(d,async()=>new Response('key-fragment-danger',{status:401}));await fetch(endpoint,{method:'POST',body:JSON.stringify(request)});assert.equal(readFileSync(join(d,'provider.json'),'utf8').includes('key-fragment-danger'),false);assert.equal(JSON.parse(readFileSync(join(d,'usage.json'))).unknownCost,true);assert.ok(existsSync(lock))
})
test('interruption keeps dispatch and reservation, prevents retry',async t=>{
  const {d,request,lock}=setup(t);let calls=0;const fetch=createObservedFetch(d,async()=>{calls++;throw Error('interrupted')});await assert.rejects(fetch(endpoint,{method:'POST',body:JSON.stringify(request)}));assert.ok(existsSync(join(d,'dispatch.json')));assert.ok(existsSync(join(d,'transport-failure.json')));assert.ok(existsSync(lock));await assert.rejects(fetch(endpoint,{method:'POST',body:JSON.stringify(request)}));assert.equal(calls,1)
})
