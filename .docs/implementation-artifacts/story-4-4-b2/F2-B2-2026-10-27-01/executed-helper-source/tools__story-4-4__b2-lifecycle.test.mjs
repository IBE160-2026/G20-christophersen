// Isolated filesystem and fake cleanup only. No HTTP/SDK/server/real key.
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, cpSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { createOwnedLock, releaseOwnedLock, usageCost } from './run-safety.mjs'
import { rejectConsumedAttempt, cleanupAndReceipt, reconcileAttempt, safeError } from './b2-lifecycle.mjs'
import { projectCost } from './project-ledger.mjs'
const repository=fileURLToPath(new URL('../../',import.meta.url))
const read=file=>JSON.parse(readFileSync(file,'utf8'))
const write=(directory,file,value)=>writeFileSync(join(directory,file),JSON.stringify(value)+'\n')
const usage=()=>({input_tokens:100,output_tokens:10,total_tokens:110,input_tokens_details:{cached_tokens:0,cache_write_tokens:0},output_tokens_details:{reasoning_tokens:0}})
function setup(t) {
  const root=mkdtempSync(join(tmpdir(),'b2-life-'));t.after(()=>rmSync(root,{recursive:true,force:true}))
  const historical=join(root,'.docs/implementation-artifacts/story-4-4');mkdirSync(historical,{recursive:true})
  for(const file of ['preflight-result.json',...['F1','F2','F3','F4'].map(id=>`${id}-receipt.json`)]) cpSync(join(repository,'.docs/implementation-artifacts/story-4-4',file),join(historical,file))
  const directory=join(root,'.docs/implementation-artifacts/story-4-4-b2/F2-B2-2026-10-27-01');mkdirSync(directory,{recursive:true})
  const globalLock=join(historical,'active-paid-request.lock'),owner=createOwnedLock(globalLock,'F2')
  const plan={attemptId:'F2-B2-2026-10-27-01',caseId:'F2',preparedAt:new Date().toISOString(),globalLock,costBeforeUsd:0.016072}
  write(directory,'plan.json',plan);write(directory,'started.json',{owner});write(directory,'usage.json',{usage:usage(),costUsd:usageCost(usage()),unknownCost:false})
  return {root,directory,plan,owner}
}
async function receipt(data,extra={}) {return cleanupAndReceipt({...data,oracleSha256After:'test-oracle',uiControlCompleted:false,...extra})}
test('known-cost receipt exists before cleanup; every cleanup runs despite rejection',async t=>{
  const data=setup(t),{directory,plan}=data;let calls=0
  const errors=await receipt(data,{cleanups:[()=>{assert.ok(existsSync(join(directory,'receipt.json')));calls++;throw Error('browser cleanup failed')},()=>{calls++;throw Error('router cleanup failed')},()=>{calls++}]})
  assert.equal(calls,3);assert.equal(errors.length,2);assert.equal(read(join(directory,'receipt.json')).uiControlCompleted,false);assert.equal(read(join(directory,'receipt.json')).costUsd,usageCost(usage()));assert.ok(existsSync(plan.globalLock));assert.ok(existsSync(join(directory,'cleanup-failure.json')))
})
test('successful UI receipt survives cleanup failure without falsifying completion',async t=>{
  const data=setup(t);await receipt(data,{uiControlCompleted:true,cleanups:[()=>{throw Error('server cleanup failed')}]});assert.equal(read(join(data.directory,'receipt.json')).uiControlCompleted,true)
})
test('unknown usage never produces a known-cost receipt or releases lock',async t=>{
  const data=setup(t);write(data.directory,'usage.json',{usage:null,costUsd:null,unknownCost:true});await receipt(data);assert.equal(existsSync(join(data.directory,'receipt.json')),false);assert.ok(existsSync(data.plan.globalLock))
})
test('consumed attempt rejects before any caller lock/transport effect',t=>{
  const data=setup(t);releaseOwnedLock(data.plan.globalLock,data.owner)
  for(const marker of ['started.json','dispatch.json','receipt.json','reconciled.json']) {
    const isolated=join(data.root,marker);mkdirSync(isolated);write(isolated,marker,{})
    let lockCalls=0,transportCalls=0
    assert.throws(()=>{rejectConsumedAttempt(isolated);lockCalls++;createOwnedLock(data.plan.globalLock,'F2');transportCalls++})
    assert.equal(lockCalls,0);assert.equal(transportCalls,0);assert.equal(existsSync(data.plan.globalLock),false)
  }
})
test('interrupted reconcile resumes same validated owner and receipt, then repeats harmlessly',async t=>{
  const data=setup(t);await receipt(data)
  assert.throws(()=>reconcileAttempt(data.directory,{costBeforeUsd:data.plan.costBeforeUsd,release:()=>{throw Error('simulated interruption before release')}}))
  assert.ok(existsSync(join(data.directory,'reconciled.json')));assert.ok(existsSync(data.plan.globalLock))
  reconcileAttempt(data.directory,{costBeforeUsd:data.plan.costBeforeUsd});assert.equal(existsSync(data.plan.globalLock),false)
  reconcileAttempt(data.directory,{costBeforeUsd:data.plan.costBeforeUsd});assert.equal(existsSync(data.plan.globalLock),false)
})
test('resume after interruption refuses wrong lock owner or changed receipt',async t=>{
  const data=setup(t);await receipt(data);assert.throws(()=>reconcileAttempt(data.directory,{costBeforeUsd:data.plan.costBeforeUsd,release:()=>{throw Error('interrupt')}}))
  const lockOwner=join(data.plan.globalLock,'owner.json');writeFileSync(lockOwner,JSON.stringify({fixtureId:'F1',attemptId:'different'}));assert.throws(()=>reconcileAttempt(data.directory,{costBeforeUsd:data.plan.costBeforeUsd}));assert.ok(existsSync(data.plan.globalLock));writeFileSync(lockOwner,JSON.stringify(data.owner))
  const current=read(join(data.directory,'receipt.json'));write(data.directory,'receipt.json',{...current,costUsd:99});assert.throws(()=>reconcileAttempt(data.directory,{costBeforeUsd:data.plan.costBeforeUsd}));assert.ok(existsSync(data.plan.globalLock))
})
test('missing lock and record cannot be reconciled as if completed',async t=>{
  const data=setup(t);await receipt(data);releaseOwnedLock(data.plan.globalLock,data.owner);assert.throws(()=>reconcileAttempt(data.directory,{costBeforeUsd:data.plan.costBeforeUsd}))
})
test('shared ledger includes known B2, blocks active/unknown attempts and inconsistent receipts',async t=>{
  const data=setup(t);assert.throws(()=>projectCost(data.root));assert.throws(()=>projectCost(data.root,{allowOwnedLock:true}));await receipt(data);reconcileAttempt(data.directory,{costBeforeUsd:data.plan.costBeforeUsd});assert.equal(projectCost(data.root),data.plan.costBeforeUsd+usageCost(usage()))
  write(data.directory,'usage.json',{usage:usage(),costUsd:null,unknownCost:true});assert.throws(()=>projectCost(data.root));write(data.directory,'usage.json',{usage:usage(),costUsd:usageCost(usage()),unknownCost:false});const current=read(join(data.directory,'receipt.json'));write(data.directory,'receipt.json',{...current,cumulativeProjectUsd:99});assert.throws(()=>projectCost(data.root))
})
test('validated original F1-B2 cost is included independently of future attempts',t=>{
  const data=setup(t);releaseOwnedLock(data.plan.globalLock,data.owner);rmSync(data.directory,{recursive:true})
  const id='F1-B2-2026-10-27-01',folder=join(data.directory,'..',id);mkdirSync(folder)
  for(const file of ['plan.json','started.json','usage.json','receipt.json'])cpSync(join(repository,'.docs/implementation-artifacts/story-4-4-b2',id,file),join(folder,file))
  assert.ok(Math.abs(projectCost(data.root)-0.019558)<1e-12)
})
test('safe assertion diagnostics strip full key and truncated fragments',()=>{
  const key='sk-proj-SYNTHETIC-FRAGMENT-123456789';const result=safeError(new Error(`Expected result differs: 8.750; key ${key}; truncated FRAGMENT`),'result',key);assert.equal(result.stage,'result');assert.ok(result.assertion.includes('8.750'));assert.equal(result.assertion.includes(key),false);assert.equal(result.assertion.includes('FRAGMENT'),false)
})
