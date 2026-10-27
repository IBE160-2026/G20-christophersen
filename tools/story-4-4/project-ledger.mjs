// Shared paid-project accounting. No provider/client/server imports.
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { ledgerTotal, usageCost, validCost } from './run-safety.mjs'
const read=file=>JSON.parse(readFileSync(file,'utf8'))
export function projectLedger(root,{allowOwnedLock=false}={}) {
  const beforeCosts={}
  const historical=join(root,'.docs/implementation-artifacts/story-4-4')
  if(!allowOwnedLock && existsSync(join(historical,'active-paid-request.lock'))) throw new Error('Global paid lock unresolved')
  let cost=ledgerTotal(read(join(historical,'preflight-result.json')),['F1','F2','F3','F4'].map(id=>read(join(historical,`${id}-receipt.json`))))
  const attempts=['story-4-4-b2','story-4-5'].flatMap(group=>{
    const parent=join(root,'.docs/implementation-artifacts',group)
    if(!existsSync(parent))return []
    return readdirSync(parent,{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>{
    const directory=join(parent,e.name),planFile=join(directory,'plan.json')
    const active=['started.json','dispatch.json','usage.json','receipt.json'].some(file=>existsSync(join(directory,file)))
    if(!existsSync(planFile)) {if(active)throw new Error('Unidentified paid attempt');return null}
    const plan=read(planFile)
    if(plan.attemptId!==e.name || !Number.isFinite(Date.parse(plan.preparedAt))) throw new Error('Invalid paid plan identity')
    if(!active) return null
    if(!existsSync(join(directory,'receipt.json'))) throw new Error('Unresolved paid attempt')
    const receipt=read(join(directory,'receipt.json')),usage=read(join(directory,'usage.json'))
    if(receipt.unknownCost!==false || usage.unknownCost!==false || usageCost(receipt.usage)!==receipt.costUsd || usageCost(usage.usage)!==receipt.costUsd || Math.abs(validCost(receipt.cumulativeProjectUsd)-(validCost(plan.costBeforeUsd)+receipt.costUsd))>1e-12) throw new Error('Invalid paid receipt or unknown cost')
    if(group==='story-4-5') {
      const dispatch=read(join(directory,'dispatch.json'))
      if(receipt.costOnly!==true || receipt.s5Measured!==false || receipt.humanControlStatus!=='not-recorded' || receipt.uiControlCompleted!==undefined) throw new Error('S5 cost receipt must not attest human completion')
      if(dispatch.owner?.fixtureId!==plan.caseId || typeof dispatch.owner?.attemptId!=='string' || !dispatch.owner.attemptId || JSON.stringify(dispatch.owner)!==JSON.stringify(receipt.owner) || dispatch.normalizedRequestSha256!==plan.requestSha256) throw new Error('S5 receipt owner/request mismatch')
    }
    return {plan,receipt}
    }).filter(Boolean)
  }).sort((a,b)=>Date.parse(a.plan.preparedAt)-Date.parse(b.plan.preparedAt))
  for(const {plan,receipt} of attempts) {
    if(Math.abs(plan.costBeforeUsd-cost)>1e-12) throw new Error('Paid ledger chain mismatch')
    beforeCosts[plan.attemptId]=cost
    cost=validCost(cost+receipt.costUsd)
  }
  return {totalUsd:cost,beforeCosts}
}
export function projectCost(root,options) {return projectLedger(root,options).totalUsd}
