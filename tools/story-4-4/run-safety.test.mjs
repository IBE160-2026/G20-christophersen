// Entirely offline: subprocess fetch is trapped and HTTP bind failures are simulated.
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, cpSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { EventEmitter } from 'node:events'
import { validateCommand, usageCost, validCost, ledgerTotal, createOwnedLock, requireLockOwner, releaseOwnedLock, listenLoopback } from './run-safety.mjs'
const repo = fileURLToPath(new URL('../../', import.meta.url))
const runner = resolve(repo, 'tools/story-4-4/run.mjs')
const usage = () => ({input_tokens:100,output_tokens:10,total_tokens:110,input_tokens_details:{cached_tokens:0,cache_write_tokens:0},output_tokens_details:{reasoning_tokens:0}})
const temporary = t => { const path=mkdtempSync(join(tmpdir(),'story44-offline-')); t.after(()=>rmSync(path,{recursive:true,force:true})); return path }
const snapshot = path => readdirSync(path,{recursive:true}).sort().map(name=>{
  const file=join(path,name)
  try{return [name,readFileSync(file,'utf8')]}catch{return [name,'directory']}
})
function preload(path, bindError=false) {
  const preloadPath=join(path,'preload.mjs')
  writeFileSync(preloadPath,`
    import fs from 'node:fs'; import http from 'node:http';
    import { syncBuiltinESMExports } from 'node:module'; import { EventEmitter } from 'node:events';
    const originalWrite=fs.writeFileSync; const mark=${JSON.stringify(join(path,'fetch-called'))};
    globalThis.fetch=async()=>{ originalWrite(mark,'unexpected paid fetch'); throw new Error('OFFLINE FETCH TRAP'); };
    ${bindError ? `http.createServer=()=>Object.assign(new EventEmitter(),{listening:false,listen(){queueMicrotask(()=>this.emit('error',new Error('OFFLINE BIND FAILURE')))},closeAllConnections(){},close(){throw new Error('close on unbound server')}});` : ''}
    syncBuiltinESMExports();
  `)
  return preloadPath
}
function execute(path, args, preloadPath) {
  return spawnSync(process.execPath,['--import',preloadPath,runner,...args],{cwd:path,env:{PATH:process.env.PATH,OPENAI_API_KEY:'offline-test-placeholder'},encoding:'utf8',timeout:20000})
}
test('replay-control F3 rejects before any fetch, dispatch, or shared-lock mutation',t=>{
  assert.throws(()=>validateCommand('replay-control','F3'),/forbidden/)
  const path=temporary(t), evidence=join(path,'.docs/implementation-artifacts/story-4-4')
  mkdirSync(join(evidence,'active-paid-request.lock'),{recursive:true})
  writeFileSync(join(evidence,'active-paid-request.lock/owner.json'),'existing owner')
  const stub=preload(path), before=snapshot(path)
  const result=execute(path,['replay-control','F3'],stub)
  assert.notEqual(result.status,0); assert.match(result.stderr,/production adapter replay is forbidden/)
  assert.deepEqual(snapshot(path),before); assert.equal(existsSync(join(path,'fetch-called')),false)
})
test('shared lock release requires exact fixture and attempt; mismatches preserve evidence',t=>{
  const lock=join(temporary(t),'lock'), owner=createOwnedLock(lock,'F2')
  writeFileSync(join(lock,'evidence'),'preserve')
  for(const other of [{...owner,fixtureId:'F1'},{...owner,attemptId:'different'},undefined]) {
    assert.throws(()=>requireLockOwner(lock,other))
    assert.throws(()=>releaseOwnedLock(lock,other))
    assert.equal(readFileSync(join(lock,'evidence'),'utf8'),'preserve')
  }
  releaseOwnedLock(lock,owner); assert.equal(existsSync(lock),false)
})
test('legacy ownerless locks cannot be reconciled or removed',t=>{
  const lock=join(temporary(t),'lock'); mkdirSync(lock)
  assert.throws(()=>releaseOwnedLock(lock,{fixtureId:'F1',attemptId:'new'}))
  assert.ok(existsSync(lock))
})
test('reconcile F1 cannot release another case lock or write a known-cost receipt',t=>{
  const path=temporary(t), evidence=join(path,'.docs/implementation-artifacts/story-4-4')
  mkdirSync(evidence,{recursive:true})
  mkdirSync(join(path,'tests/fixtures/property-cases'),{recursive:true})
  for(const file of ['expected.json','F1-tilstandsrapport.pdf']) cpSync(join(repo,'tests/fixtures/property-cases',file),join(path,'tests/fixtures/property-cases',file))
  cpSync(join(repo,'.docs/implementation-artifacts/story-4-4/preflight-result.json'),join(evidence,'preflight-result.json'))
  const owner=createOwnedLock(join(evidence,'active-paid-request.lock'),'F2')
  writeFileSync(join(evidence,'F1-started.json'),JSON.stringify({lockOwner:{fixtureId:'F1',attemptId:owner.attemptId}}))
  const stub=preload(path), before=snapshot(path)
  const result=execute(path,['reconcile','F1'],stub)
  assert.notEqual(result.status,0); assert.match(result.stderr,/Lock belongs to another fixture or attempt/)
  assert.deepEqual(snapshot(path),before)
  assert.equal(existsSync(join(evidence,'F1-receipt.json')),false)
})
test('usage and cost reject invalid counters, missing totals, inconsistent cache and reasoning',()=>{
  assert.equal(usageCost(usage()),0.0003)
  const bad=[]
  for(const value of [undefined,null,-1,NaN,Infinity,1.5,Number.MAX_SAFE_INTEGER+1,'10']) {
    for(const key of ['input_tokens','output_tokens','total_tokens']) {const u=usage(); u[key]=value;bad.push(u)}
    for(const [details,key] of [['input_tokens_details','cached_tokens'],['input_tokens_details','cache_write_tokens'],['output_tokens_details','reasoning_tokens']]) {const u=usage(); u[details][key]=value;bad.push(u)}
  }
  const both=usage(); both.input_tokens_details={cached_tokens:70,cache_write_tokens:31};bad.push(both)
  const reasoning=usage(); reasoning.output_tokens_details.reasoning_tokens=11;bad.push(reasoning)
  const total=usage(); total.total_tokens=109;bad.push(total)
  const extra=usage();extra.input_tokens_details.other_tokens=-1;bad.push(extra)
  for(const u of bad) assert.throws(()=>usageCost(u))
  for(const value of [undefined,null,-1,NaN,Infinity,'0']) assert.throws(()=>validCost(value))
})
test('earlier ledger requires explicit known finite cost with validated matching usage',()=>{
  const preflight={cost_usd:0.0003,usage:usage()}
  const receipt={unknownCost:false,costUsd:0.0003,usage:usage()}
  assert.equal(ledgerTotal(preflight,[receipt]),0.0006)
  for(const value of [undefined,null,-1,NaN,Infinity,'0']) {
    assert.throws(()=>ledgerTotal({...preflight,cost_usd:value},[]))
    assert.throws(()=>ledgerTotal(preflight,[{...receipt,costUsd:value}]))
  }
  for(const patch of [{unknownCost:true},{unknownCost:undefined},{usage:null},{costUsd:0}]) assert.throws(()=>ledgerTotal(preflight,[{...receipt,...patch}]))
})
test('bind failure rejects listen promise instead of escaping as unhandled error',async()=>{
  const server=Object.assign(new EventEmitter(),{listen(){queueMicrotask(()=>this.emit('error',new Error('bind denied')))}})
  await assert.rejects(listenLoopback(server),/bind denied/)
  assert.equal(server.listenerCount('listening'),0)
})
test('runner bind error preserves failure evidence and owned reservation without fetch/dispatch',t=>{
  const path=temporary(t), evidence=join(path,'.docs/implementation-artifacts/story-4-4')
  mkdirSync(evidence,{recursive:true})
  mkdirSync(join(path,'tests/fixtures/property-cases'),{recursive:true})
  for(const file of ['expected.json','F1-tilstandsrapport.pdf']) cpSync(join(repo,'tests/fixtures/property-cases',file),join(path,'tests/fixtures/property-cases',file))
  for(const file of ['preflight-result.json','F1-plan.json']) cpSync(join(repo,'.docs/implementation-artifacts/story-4-4',file),join(evidence,file))
  const result=execute(path,['run','F1'],preload(path,true))
  assert.equal(result.status,1,result.stderr)
  const failure=JSON.parse(readFileSync(join(evidence,'F1-ui-failure.json')))
  assert.match(failure.reason,/OFFLINE BIND FAILURE/)
  const started=JSON.parse(readFileSync(join(evidence,'F1-started.json')))
  requireLockOwner(join(evidence,'active-paid-request.lock'),started.lockOwner)
  assert.equal(existsSync(join(path,'fetch-called')),false)
  assert.equal(existsSync(join(evidence,'F1-dispatch.json')),false)
  assert.equal(existsSync(join(evidence,'F1-receipt.json')),false)
})
