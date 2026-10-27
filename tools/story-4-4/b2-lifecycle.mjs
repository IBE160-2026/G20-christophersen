// Offline-testable durability and cleanup guards for one-off B2 acceptance.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { requireLockOwner, releaseOwnedLock, usageCost, validCost } from './run-safety.mjs'
const read=file=>JSON.parse(readFileSync(file,'utf8'))
const hash=bytes=>createHash('sha256').update(bytes).digest('hex')
const write=(directory,file,value)=>writeFileSync(join(directory,file),JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600})
export function rejectConsumedAttempt(directory) {
  if(['started.json','dispatch.json','receipt.json','reconciled.json'].some(file=>existsSync(join(directory,file)))) throw new Error('Attempt already consumed; no new lock or transport allowed')
}
export function safeError(error,stage,key=process.env.OPENAI_API_KEY) {
  let message=typeof error?.message==='string'?error.message:'Operation failed'
  message=message.replace(/sk-[A-Za-z0-9_-]+/g,'[redacted]')
  if(typeof key==='string' && key.length) {
    message=message.split(key).join('[redacted]')
    // Also remove provider/SDK quotations of key fragments, including truncated keys.
    for(let i=0;i<=key.length-4;i++) message=message.split(key.slice(i,i+4)).join('[redacted]')
  }
  // Body payloads are never included; concrete assertion diagnostics are bounded.
  return {stage,errorType:/^[A-Za-z][A-Za-z0-9]*Error$/.test(error?.name??'')?error.name:'Error',assertion:message.slice(0,1200)}
}
export async function cleanupAndReceipt({directory,plan,owner,uiControlCompleted,oracleSha256After,cleanups=[],cleanupTimeoutMs=5000,writeReceipt=write}) {
  const errors=[]
  let receiptPersisted=false
  // Receipt is attempted first; read/validation/write errors must not bypass cleanup.
  try {
    const usageFile=join(directory,'usage.json')
    if(existsSync(usageFile)) {
      const usage=read(usageFile)
      if(usage.unknownCost===false) {
        requireLockOwner(plan.globalLock,owner)
        const costUsd=usageCost(usage.usage)
        if(costUsd!==usage.costUsd) throw new Error('Inconsistent known usage')
        writeReceipt(directory,'receipt.json',{at:new Date().toISOString(),usage:usage.usage,costUsd,cumulativeProjectUsd:validCost(plan.costBeforeUsd)+costUsd,unknownCost:false,uiControlCompleted,attempts:1,retries:0,oracleSha256After})
        receiptPersisted=true
      }
    }
  } catch(error) {errors.push(safeError(error,'receipt'))}
  // Every owned cleanup starts independently, even if a sibling never settles.
  const timeout=Number.isFinite(cleanupTimeoutMs)&&cleanupTimeoutMs>0?Math.min(cleanupTimeoutMs,5000):5000
  await Promise.all(cleanups.map(async(cleanup,index)=>{
    let timer
    try {
      await Promise.race([
        Promise.resolve().then(cleanup),
        new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Cleanup exceeded bounded wait')),timeout)}),
      ])
    } catch(error) {errors.push(safeError(error,`cleanup-${index}`))}
    finally {clearTimeout(timer)}
  }))
  if(errors.length) {
    try {write(directory,'cleanup-failure.json',{errors,lockRetained:true,receiptPersisted,unknownCost:!receiptPersisted})}
    catch(error) {errors.push(safeError(error,'cleanup-diagnostic-write'))}
  }
  return errors
}
export function reconcileAttempt(directory,{costBeforeUsd,release=releaseOwnedLock}={}) {
  validCost(costBeforeUsd)
  const plan=read(join(directory,'plan.json')),started=read(join(directory,'started.json')),receipt=read(join(directory,'receipt.json')),usage=read(join(directory,'usage.json'))
  validCost(plan.costBeforeUsd);validCost(receipt.cumulativeProjectUsd)
  if(started.owner?.fixtureId!==(plan.caseId??'F1') || receipt.unknownCost!==false || usage.unknownCost!==false || usageCost(receipt.usage)!==receipt.costUsd || usageCost(usage.usage)!==receipt.costUsd || receipt.cumulativeProjectUsd!==plan.costBeforeUsd+receipt.costUsd || Math.abs(costBeforeUsd-plan.costBeforeUsd)>1e-12) throw new Error('Unresolved reconciliation')
  const receiptSha256=hash(readFileSync(join(directory,'receipt.json'))),recordFile=join(directory,'reconciled.json')
  const record={owner:started.owner,costUsd:receipt.costUsd,cumulativeProjectUsd:receipt.cumulativeProjectUsd,uiControlCompleted:receipt.uiControlCompleted,receiptSha256}
  const hasRecord=existsSync(recordFile)
  if(hasRecord) {
    const previous=read(recordFile)
    // Legacy completed records have no receipt hash; owner/cost/outcome still match.
    if(JSON.stringify(previous.owner)!==JSON.stringify(record.owner) || previous.costUsd!==record.costUsd || previous.cumulativeProjectUsd!==record.cumulativeProjectUsd || previous.uiControlCompleted!==record.uiControlCompleted || (previous.receiptSha256!==undefined && previous.receiptSha256!==receiptSha256)) throw new Error('Reconciliation record mismatch')
  }
  if(existsSync(plan.globalLock)) {
    requireLockOwner(plan.globalLock,started.owner)
    if(!hasRecord) write(directory,'reconciled.json',{at:new Date().toISOString(),...record})
    release(plan.globalLock,started.owner)
  } else if(!hasRecord) throw new Error('Missing owned lock and reconciliation record')
  return record
}
