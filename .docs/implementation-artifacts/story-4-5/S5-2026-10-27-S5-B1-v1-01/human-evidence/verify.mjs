// Read-only evidence integrity checks; run from repository root. No network/API/UI.
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { strict as assert } from 'node:assert'
import { join } from 'node:path'
const root=process.cwd(), directory=new URL('../',import.meta.url)
const file=name=>new URL(name,directory)
const read=name=>JSON.parse(readFileSync(file(name),'utf8'))
const hash=bytes=>createHash('sha256').update(bytes).digest('hex')
const plan=read('plan.json'), receipt=read('receipt.json'), dispatch=read('dispatch.json')
const provider=read('provider-body.json'), usage=read('usage.json'), reconciled=read('reconciled.json')
const observations=read('human-evidence/observations.json')
for(const [name,sha] of Object.entries({...plan.benchmarkFiles,'manifest.json':plan.benchmarkManifestSha256}))
 assert.equal(hash(readFileSync(join(root,plan.benchmarkPath,name))),sha)
const outcome=read('outcome.json').body.outcome
assert.equal(outcome.reportHash,plan.reportHash);assert.equal(outcome.pageCount,14)
assert.equal(outcome.mode,'live');assert.equal(outcome.status,'completed');assert.equal(read('http.json').status,200)
const request=read('request.json'), basis=JSON.parse(request.input[0].content[0].text)
assert.equal(hash(JSON.stringify(request)),dispatch.requestSha256)
assert.equal(basis.requestId,outcome.requestId);assert.equal(basis.reportHash,plan.reportHash)
basis.requestId=plan.attemptId;request.input[0].content[0].text=JSON.stringify(basis)
assert.equal(hash(JSON.stringify(request)),plan.requestSha256)
assert.equal(dispatch.normalizedRequestSha256,plan.requestSha256)
const texts=provider.output.flatMap(o=>(o.content??[]).filter(c=>c.type==='output_text').map(c=>c.text))
const original=JSON.parse(texts.join(''))
const oracle=JSON.parse(readFileSync(join(root,plan.benchmarkPath,'expected.json'),'utf8'))
const pairs=items=>items.map(f=>[f.grade,f.source?.pdfPage??f.pdfPage]).sort((a,b)=>a[1]-b[1])
assert.deepEqual(pairs(original.findings),pairs(oracle.findings))
assert.equal(new Set(original.findings.map(f=>f.findingId)).size,9)
assert.equal(outcome.findings.length,0);assert.equal(outcome.uncertainCandidates.length,9)
for(const c of outcome.uncertainCandidates){assert.deepEqual(c.original,original.findings.find(f=>f.findingId===c.findingId));assert(c.issues.some(i=>i.code==='reported-uncertainty'));assert.equal(c.original.source.reportHash,plan.reportHash)}
assert.deepEqual(provider.usage,receipt.usage);assert.deepEqual(usage.usage,receipt.usage)
const u=receipt.usage, cache=u.input_tokens_details
const cost=((u.input_tokens-cache.cache_write_tokens-cache.cached_tokens)*2+cache.cache_write_tokens*2.5+cache.cached_tokens*0.1+u.output_tokens*10)/1e6
assert.equal(cost,0.047151);assert.equal(cost,receipt.costUsd)
assert.equal(plan.costBeforeUsd+cost,receipt.cumulativeProjectUsd)
assert.equal(receipt.costOnly,true);assert.equal(receipt.s5Measured,false);assert.equal(receipt.humanControlStatus,'not-recorded')
assert.deepEqual(dispatch.owner,receipt.owner);assert.deepEqual(reconciled.owner,receipt.owner)
assert.equal(reconciled.receiptSha256,hash(readFileSync(file('receipt.json'))))
assert.equal(reconciled.costOnly,true);assert(!existsSync(plan.globalLock))
for(const frame of observations.frames)assert.equal(hash(readFileSync(file('human-evidence/'+frame.file))),frame.sha256)
assert.equal(hash(readFileSync(file('human-evidence/'+observations.note.file))),observations.note.sha256)
assert.equal(hash(readFileSync(file('human-evidence/'+observations.note.previewFile))),observations.note.previewSha256)
const e=observations.eventBoundsSeconds,d=observations.observedDurationBoundsSeconds
for(const [name,start,end] of [['manualTgIdentification','manualStart','manualStop'],['analysisToVisibleList','analysisStart','listVisible'],['visibleListToAppConfirmation','listVisible','listConfirmed']])assert.deepEqual(d[name],[e[end][0]-e[start][1],e[end][1]-e[start][0]])
assert.equal(observations.qualification.manualReferenceComplete,false);assert.equal(observations.qualification.s5Passed,false)
assert.equal(observations.qualification.eligibleCompletedComparisonCount,0)
console.log('PASS: seven frozen files; original live request/output/usage/owner; 8TG2+1TG3 physical pages; cost USD0.047151/total0.070243; cost-only reconciliation/no paid lock; 12 cropped frame hashes/note; interval arithmetic; no complete S5 claim.')
console.log('Limits: grades/pages integrity checks do not independently certify source semantics, human completeness or final financial values. Visual/protocol assessment remains in the observation report.')
