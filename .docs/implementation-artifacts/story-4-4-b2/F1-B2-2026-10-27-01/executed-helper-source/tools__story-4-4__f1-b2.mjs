// Explicit F1 B2 acceptance only: no S5, no timing, no retries or replay.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { createInterface } from 'node:readline'
import { createServer } from 'node:http'
import express from 'express'
import { chromium, expect } from '@playwright/test'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'
import { extractPdf } from '../../src/backend/documents/extract-pdf.ts'
import { createLiveRequest } from '../../src/backend/analysis/live-request.ts'
import { createAnalysisRouter } from '../../src/backend/http/analysis-route.ts'
import { fingerprint } from '../story-4-5/manual.mjs'
import { ledgerTotal, createOwnedLock, requireLockOwner, releaseOwnedLock, listenLoopback, usageCost } from './run-safety.mjs'
export const attemptId='F1-B2-2026-10-27-01'
const root=fileURLToPath(new URL('../../',import.meta.url))
export const directory=join(root,'.docs/implementation-artifacts/story-4-4-b2',attemptId)
const historical=join(root,'.docs/implementation-artifacts/story-4-4')
const fixture=join(root,'tests/fixtures/property-cases/F1-tilstandsrapport.pdf')
const oracle=join(root,'tests/fixtures/property-cases/expected.json')
export const sha=value=>createHash('sha256').update(value).digest('hex')
const read=file=>JSON.parse(readFileSync(file,'utf8'))
const write=(name,value)=>writeFileSync(join(directory,name),JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600})
const commit=()=>execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim()
const total=()=>ledgerTotal(read(join(historical,'preflight-result.json')),['F1','F2','F3','F4'].map(id=>read(join(historical,`${id}-receipt.json`))))
export function validatePreflight(p) {
  if(p.attemptId!==attemptId || !Number.isFinite(Date.parse(p.checkedAt)) || Date.now()-Date.parse(p.checkedAt)>86400000 || Date.parse(p.checkedAt)>Date.now()+60000) throw new Error('Stale/wrong preflight')
  for(const flag of ['accountVerified','unknownChargesResolved','accessVerified','priceVerified']) if(p[flag]!==true) throw new Error('Unverified preflight')
  if(p.costBeforeUsd!==0.016072 || p.accountLimitUsd!==2 || p.availableUsd<1.53 || p.reservationUsd!==1.53 || p.costBeforeUsd+p.reservationUsd>p.accountLimitUsd || !Number.isFinite(p.availableUsd)) throw new Error('Unreconciled budget')
  if(JSON.stringify(p.prices)!==JSON.stringify({input:2,cached:0.1,cacheWrite:2.5,output:10}) || p.priceSource!=='https://developers.openai.com/api/docs/models/gpt-6.1-sol') throw new Error('Unverified prices')
  return p
}
export function validateOutcome(o) {
  if(o?.status!=='completed' || o.mode!=='live' || o.reportHash!=='c3a92dc24004601803928b5ad479165d042cf199f099e190d40b732a58a388cb' || o.documentName!=='F1-tilstandsrapport.pdf' || o.pageCount!==4 || o.findings?.length!==1 || o.uncertainCandidates?.length!==0) throw new Error('Unexpected original extraction; stop for review')
  const f=o.findings[0]
  if(f.kind!=='checkable' || f.grade!=='TG2' || f.source?.pdfPage!==2 || f.source?.reportHash!==o.reportHash || f.source?.documentName!==o.documentName || f.original?.uncertainties?.length!==0) throw new Error('Unverified F1 finding')
}
export function validateLimitationApproval(a,o,outcomeHash) {
  if(a.attemptId!==attemptId || a.outcomeSha256!==outcomeHash || a.reportHash!==o.reportHash || a.reviewedBy!=='root-agent' || a.originalPdfReviewed!==true || !Array.isArray(a.assessments) || a.assessments.length!==o.limitations.length) throw new Error('Explicit source review missing')
  const f=o.findings[0],assessment=a.findingAssessment
  if(!assessment || assessment.findingId!==f.findingId || assessment.description!==f.description || JSON.stringify(assessment.source)!==JSON.stringify(f.source) || assessment.sourceSupported!==true || assessment.originalUnchanged!==true) throw new Error('Explicit finding source assessment missing')
  for(const [i,row] of a.assessments.entries()) if(row.index!==i || row.original!==o.limitations[i] || row.controlledNonCritical!==true || typeof row.reason!=='string' || row.reason.trim().length<20) throw new Error('Limitation review missing/mismatched')
}
async function prepare(preflightFile) {
  const preflight=validatePreflight(read(preflightFile))
  if(Math.abs(total()-preflight.costBeforeUsd)>1e-12 || existsSync(join(historical,'active-paid-request.lock'))) throw new Error('Ledger/lock unresolved')
  const bytes=readFileSync(fixture)
  if(sha(bytes)!=='c3a92dc24004601803928b5ad479165d042cf199f099e190d40b732a58a388cb') throw new Error('Changed F1')
  const format=await validatePdf(bytes,'F1-tilstandsrapport.pdf')
  if(format.status!=='format-validated') throw new Error('Invalid PDF')
  const {document}=await extractPdf(format,{requestId:attemptId,mode:'live'})
  const request=createLiveRequest(document),serialized=JSON.stringify(request)
  if(Buffer.byteLength(serialized)>100000) throw new Error('Input reservation insufficient')
  mkdirSync(resolve(directory,'..'),{recursive:true});mkdirSync(directory)
  write('basis.json',document);write('expected-request.json',request)
  write('plan.json',{attemptId,preparedAt:new Date().toISOString(),codeCommit:commit(),sourceFingerprint:fingerprint(root),preflightPath:resolve(preflightFile),preflightSha256:sha(readFileSync(preflightFile)),reportHash:document.reportHash,oracleSha256:sha(readFileSync(oracle)),requestSha256:sha(serialized),serializedRequestBytes:Buffer.byteLength(serialized),globalLock:join(historical,'active-paid-request.lock'),model:request.model,promptVersion:'1',schemaVersion:'1',contractVersion:'2',extractionVersion:'1',sdk:'6.9.1',inputReservationTokens:100000,maxOutputTokens:128000,reservationUsd:1.53,costBeforeUsd:total(),attempts:1,retries:0})
  console.log('Prepared only; no server or provider call.')
}
async function run() {
  const plan=read(join(directory,'plan.json'))
  const p=validatePreflight(read(plan.preflightPath))
  if(plan.attemptId!==attemptId || plan.codeCommit!==commit() || plan.sourceFingerprint!==fingerprint(root) || plan.preflightSha256!==sha(readFileSync(plan.preflightPath)) || plan.oracleSha256!==sha(readFileSync(oracle)) || plan.reportHash!==sha(readFileSync(fixture)) || Math.abs(total()-p.costBeforeUsd)>1e-12 || !process.env.OPENAI_API_KEY) throw new Error('Changed binding/key/ledger')
  const owner=createOwnedLock(plan.globalLock,'F1')
  write('started.json',{at:new Date().toISOString(),owner,reservationUsd:plan.reservationUsd})
  let server,router,browser,uiControlCompleted=false,stage='startup'
  try {
    const transport=new URL('./f1-b2-transport.mjs',import.meta.url);transport.searchParams.set('directory',directory)
    const app=express();router=createAnalysisRouter({mode:'live',transportModule:transport.href});app.use('/api',router);app.use(express.static(join(root,'dist')))
    server=createServer(app);await listenLoopback(server)
    const url=`http://127.0.0.1:${server.address().port}`
    browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}})
    await page.route('**/*',route=>route.request().url().startsWith(url)?route.continue():route.abort())
    let posts=0;page.on('request',r=>{if(r.method()==='POST'&&r.url().endsWith('/api/analysis'))posts++})
    await page.goto(url)
    const f1=read(oracle).cases.find(c=>c.caseId==='F1')
    for(const [field,value] of Object.entries(f1.financialInputs)) {await page.locator(`#value-${field}`).fill(value);await page.locator(`#source-kind-${field}`).selectOption('assumption');await page.locator(`#source-${field}`).fill(`Kontrollert F1-testforutsetning ${field}`)}
    for(const field of ['L','D','J']) {await page.locator(`#period-${field}`).selectOption('year');await page.locator(`#year-${field}`).fill('2026')}
    await page.locator('#rent-nature-L').selectOption('expected');await page.locator('#confirm-financial').click();await page.locator('#next-step').click();await page.locator('#report-file').setInputFiles(fixture)
    stage='analysis'
    const responsePromise=page.waitForResponse(r=>r.url().endsWith('/api/analysis'),{timeout:150000})
    await page.getByRole('button',{name:'Start analyse',exact:true}).click()
    const response=await responsePromise,body=await response.json()
    write('outcome.json',{httpStatus:response.status(),body})
    stage='original-validation'
    const outcome=body.outcome;validateOutcome(outcome)
    await page.getByRole('button',{name:'Gå til Kontroller funn',exact:true}).click();await page.locator('#findings-title').scrollIntoViewIfNeeded()
    await expect(page.locator('.report-findings')).toHaveAttribute('data-list-visible-generation',/\d+/)
    await page.screenshot({path:join(directory,'original.png'),fullPage:true})
    stage='source-control'
    const row=page.locator('.finding-list > li');await expect(row).toHaveCount(1);await row.locator('.finding-select').click();await expect(page.locator('.textLayer')).toBeVisible()
    const originalText=await page.locator('.textLayer').innerText(),source=await page.locator('.source-original').innerText()
    if(!originalText.includes('Slitt overflate på baderomsgulv') || !source.includes('PDF-side 2')) throw new Error('Source mismatch')
    await page.screenshot({path:join(directory,'source.png'),fullPage:true})
    write('checkpoint.json',{outcomeSha256:sha(readFileSync(join(directory,'outcome.json'))),source,originalText,limitations:outcome.limitations,posts,s5Measured:false,message:'Root must inspect original outcome/source/screenshots, write limitation-approval.json, then send continue on stdin.'})
    stage='root-review-checkpoint'
    console.log('CHECKPOINT: original response and source preserved. Write limitation-approval.json then send continue on stdin. No second call.')
    const input=createInterface({input:process.stdin,terminal:false})
    const command=await new Promise(resolve=>{input.once('line',resolve);input.once('close',()=>resolve('closed'))});input.close()
    if(command!=='continue') throw new Error('Source review not continued')
    stage='explicit-review-validation'
    const approval=read(join(directory,'limitation-approval.json'));validateLimitationApproval(approval,outcome,sha(readFileSync(join(directory,'outcome.json'))))
    stage='confirm-findings'
    await row.getByRole('button',{name:'Bekreft',exact:true}).click();await page.getByRole('button',{name:'Bekreft gjeldende liste',exact:true}).click()
    for(const a of approval.assessments) {const limitation=page.locator('.limitation-reviews > li').nth(a.index);await expect(limitation).toContainText(a.original);await limitation.getByRole('textbox').fill(a.reason);await limitation.getByRole('checkbox').check();await limitation.getByRole('button',{name:`Kontrollert og ikke kritisk for screening — begrensning ${a.index+1}`,exact:true}).click();await expect(limitation).toContainText('Brukerbekreftet vurdering: kontrollert og ikke kritisk for screening i denne revisjonen.')}
    await page.screenshot({path:join(directory,'controlled.png'),fullPage:true})
    stage='result'
    await page.getByRole('button',{name:'Beregn og vis resultat',exact:true}).click();await expect(page.locator('#recommendation-title')).toHaveText('Gå videre')
    const metrics=(await page.locator('.metric-value').allTextContents()).map(s=>s.replace(/\u00a0/g,' '));expect(metrics).toEqual(['11,875 %','1 500 000 kr/år','9,375 %','700 000 kr/år']);expect(posts).toBe(1)
    const details=page.locator('.result-report details').filter({has:page.locator('summary',{hasText:'Analyseopphav og rapportidentitet'})});await details.locator('summary').click()
    for(const a of approval.assessments) {await expect(details).toContainText(a.original);await expect(details).toContainText(a.reason)}
    await page.screenshot({path:join(directory,'result.png'),fullPage:true})
    write('control.json',{recommendation:'Gå videre',expectedRecommendationMatched:true,metrics,source,originalText,apiCalls:posts,providerCalls:1,corrections:0,s5Measured:false,method:'Original new live response; automated UI with explicit root source/limitation review checkpoint. No timing.'})
    uiControlCompleted=true
  } catch {write('ui-failure.json',{at:new Date().toISOString(),message:'Acceptance flow stopped; inspect original evidence. No retry.',stage,uiControlCompleted:false});process.exitCode=1}
  finally {
    await browser?.close();server?.closeAllConnections();await router?.stop();if(server?.listening) await new Promise(resolve=>server.close(resolve))
    if(existsSync(join(directory,'usage.json'))) {
      const usage=read(join(directory,'usage.json'))
      if(usage.unknownCost===false) {requireLockOwner(plan.globalLock,owner);write('receipt.json',{at:new Date().toISOString(),usage:usage.usage,costUsd:usage.costUsd,cumulativeProjectUsd:plan.costBeforeUsd+usage.costUsd,unknownCost:false,uiControlCompleted,attempts:1,retries:0,oracleSha256After:sha(readFileSync(oracle))});console.log(`Known cost recorded; lock retained for explicit reconcile; UI completed: ${uiControlCompleted}; cost USD ${usage.costUsd}`)}
    }
  }
}
function reconcile() {
  const plan=read(join(directory,'plan.json')),started=read(join(directory,'started.json')),receipt=read(join(directory,'receipt.json')),usage=read(join(directory,'usage.json'))
  requireLockOwner(plan.globalLock,started.owner)
  if(receipt.unknownCost!==false || usage.unknownCost!==false || usageCost(receipt.usage)!==receipt.costUsd || usageCost(usage.usage)!==receipt.costUsd || receipt.cumulativeProjectUsd!==plan.costBeforeUsd+receipt.costUsd || Math.abs(total()-plan.costBeforeUsd)>1e-12) throw new Error('Unresolved reconciliation')
  write('reconciled.json',{at:new Date().toISOString(),owner:started.owner,costUsd:receipt.costUsd,cumulativeProjectUsd:receipt.cumulativeProjectUsd,uiControlCompleted:receipt.uiControlCompleted})
  releaseOwnedLock(plan.globalLock,started.owner)
  console.log('Explicit root reconciliation complete; owned lock released. No call.')
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {const [command,file]=process.argv.slice(2);if(command==='prepare'&&file)await prepare(resolve(file));else if(command==='run'&&!file)await run();else if(command==='reconcile'&&!file)reconcile();else throw new Error('Use prepare <dated-preflight.json> | run | reconcile')}
  catch {console.error('F1 B2 stopped safely; inspect evidence, never retry automatically.');process.exitCode=1}
}
