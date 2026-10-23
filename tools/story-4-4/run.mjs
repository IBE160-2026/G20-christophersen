// Explicit one-off evaluation. Never imported by the test suite. No retries.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import express from 'express'
import { createServer } from 'node:http'
import { chromium, expect } from '@playwright/test'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'
import { extractPdf } from '../../src/backend/documents/extract-pdf.ts'
import { createLiveRequest } from '../../src/backend/analysis/live-request.ts'
import { createAnalysisBackend } from '../../src/backend/analysis/backend-config.ts'
import { createLiveAdapter } from '../../src/backend/analysis/live-adapter.ts'
import { analyzeDocument } from '../../src/backend/analysis/analyze-document.ts'
import { validateCommand, ledgerTotal, usageCost, validCost, createOwnedLock, requireLockOwner, releaseOwnedLock, listenLoopback } from './run-safety.mjs'
import { createAnalysisRouter } from '../../src/backend/http/analysis-route.ts'
const [action, id] = process.argv.slice(2)
validateCommand(action, id)
const dir = resolve('.docs/implementation-artifacts/story-4-4')
const stem = `${dir}/${id}`
const shotId = action === 'replay-control' ? `${id}-replay-${Date.now()}` : id
const oraclePath = 'tests/fixtures/property-cases/expected.json'
const sha = data => createHash('sha256').update(data).digest('hex')
const oracleBytes = readFileSync(oraclePath)
const oracle = JSON.parse(oracleBytes).cases.find(c => c.caseId === id)
const write = (suffix, value) => writeFileSync(`${stem}-${suffix}.json`, JSON.stringify(value, null, 2)+'\n', { flag: 'wx' })
const ledger = () => ledgerTotal(
  JSON.parse(readFileSync(`${dir}/preflight-result.json`)),
  ['F1','F2','F3','F4'].slice(0, Number(id[1])-1).map(earlier => JSON.parse(readFileSync(`${dir}/${earlier}-receipt.json`))),
)
const helperHashes = () => Object.fromEntries(readdirSync(new URL('./', import.meta.url)).sort()
  .filter(name => /\.(mjs|ts)$/.test(name))
  .map(name => [name, sha(readFileSync(new URL(name, import.meta.url)))]))
const lock = `${dir}/active-paid-request.lock`

const format = await validatePdf(readFileSync(`tests/fixtures/property-cases/${oracle.documentName}`), oracle.documentName)
if (format.status !== 'format-validated') throw new Error('PDF failed')
const { document } = await extractPdf(format, { requestId: `story44-${id}`, mode: 'live' })
const request = createLiveRequest(document)
const costBeforeUsd = ledger()
if (action === 'reconcile') {
  const owner = JSON.parse(readFileSync(`${stem}-started.json`)).lockOwner
  if (owner?.fixtureId !== id) throw new Error('Attempt fixture does not match reconciliation')
  requireLockOwner(lock, owner)
  const provider=JSON.parse(readFileSync(`${stem}-provider.json`))
  const http=JSON.parse(readFileSync(`${stem}-http.json`))
  const usage=provider.usage
  if(http.status!==200 || !usage || provider.status!=='completed' || provider.service_tier!=='default') throw new Error('Unresolved provider usage')
  const costUsd=usageCost(usage)
  const cumulativeProjectUsd=validCost(costBeforeUsd+costUsd)
  write('receipt',{finishedAt:new Date().toISOString(),usage,serviceTier:provider.service_tier,returnedModel:provider.model,costUsd,cumulativeProjectUsd,unknownCost:false,oracleSha256After:sha(readFileSync(oraclePath)),attempts:1,retries:0,uiControlCompleted:false})
  releaseOwnedLock(lock, owner)
  console.log(`${id} reconciled ${costUsd}; project ${costBeforeUsd+costUsd}`)
  process.exit(0)
}
if (action === 'prepare') {
  if (costBeforeUsd + 1.48 > 2) throw new Error('Insufficient budget')
  const serialized = JSON.stringify(request)
  // Byte length is a deliberately conservative sanity check, not tokenization.
  if (Buffer.byteLength(serialized) > 100000) throw new Error('Input reservation needs reassessment')
  write('basis', document)
  write('plan', { helperSha256:helperHashes(), preparedAt: new Date().toISOString(), id, documentName: oracle.documentName, reportHash: document.reportHash,
    oracleSha256: sha(oracleBytes), codeCommit: execFileSync('git',['rev-parse','HEAD'], {encoding:'utf8'}).trim(),
    model:'gpt-6.1-sol', sdk:'6.9.1', reasoning:'low', serviceTier:'default', promptVersion:'1', schemaVersion:'1', contractVersion:'2', extractionVersion:'1',
    maxOutputTokens:128000, deadlineMs:120000, attempts:1, retries:0, requestSha256:sha(serialized), serializedRequestBytes:Buffer.byteLength(serialized),
    inputReservationTokens:100000, inputCheck:'Small UTF-8 serialized request is well within 100000 input reservation; no exact local token count claimed.',
    priceCheckedAt:'2026-10-23', priceSource:'https://developers.openai.com/api/docs/models/gpt-6.1-sol', pricesUsdPerMillion:{ input:2,cached:0.1,cacheWrite:2.5,output:10 },
    priceVerification:'Root independently opened OpenAI Docs in this session; long context >272000 input uses doubled input/cache and 1.5x output.',
    projectSpendBeforePreflightUsd:0, preflightIncluded:true, costBeforeUsd, reservationUsd:1.48, maximumAfterReservationUsd:costBeforeUsd+1.48,
    operationalLimitUsd:2, r1LimitUsd:20, prepaidUsd:5, accountVerification:'User manual verification 2026-10-23: spend 0, hard limit 2, prepaid 5; preflight 200, 5000 RPM/1000000 TPM.',
    financialInputs:oracle.financialInputs, boundary:id==='F3'?'PDF.js and production adapter; L remains null':'built app, real HTTP router, PDF.js and production adapter' })
  console.log(`${id} prepared; ${Buffer.byteLength(serialized)} bytes; cost ${costBeforeUsd}; reservation 1.48`)
  process.exit(0)
}
const plan = JSON.parse(readFileSync(`${stem}-plan.json`))
if (plan.oracleSha256 !== sha(oracleBytes) || plan.costBeforeUsd !== costBeforeUsd || costBeforeUsd+1.48>2) throw new Error('Plan no longer valid')
if (action !== 'replay-control' && !process.env.OPENAI_API_KEY) throw new Error('Missing backend key')
// Global cross-process lock intentionally survives failure. Root must reconcile before removal.
const lockOwner = action !== 'replay-control' ? createOwnedLock(lock, id) : undefined
if(action !== 'replay-control') write('started', { lockOwner, at:new Date().toISOString(), reservationUsd:1.48, costBeforeUsd })
const transportUrl = pathToFileURL(resolve('tools/story-4-4/observe-transport.mjs'))
transportUrl.searchParams.set('evidence', stem)
let server, router, browser
try {
  if (id === 'F3') {
    const transport = await import(transportUrl.href)
    const outcome = await analyzeDocument(document, createLiveAdapter(createAnalysisBackend('live', {fetch:transport.fetch})))
    write('outcome', outcome)
    write('control', { boundary:'production adapter', financialInputs:oracle.financialInputs, L:null, mainFlowStarted:false, s5Measured:false })
  } else {
    const app = express()
    router = createAnalysisRouter({ mode:'live', transportModule:transportUrl.href })
    app.use('/api', router); app.use(express.static(resolve('dist')))
    server = createServer(app)
    await listenLoopback(server)
    const url = `http://127.0.0.1:${server.address().port}`
    browser = await chromium.launch({headless:true})
    const page = await browser.newPage({viewport:{width:1440,height:900}})
    await page.route('**/*', route => route.request().url().startsWith(url) ? route.continue() : route.abort())
    if(action === 'replay-control') await page.route('**/api/analysis', async route => {
      const headers=route.request().headers()
      const original=JSON.parse(readFileSync(`${stem}-outcome.json`))
      const outcome={...original,requestId:headers['x-request-id']}
      await route.fulfill({json:{kind:'analysis',correlation:{sessionId:headers['x-session-id'],requestId:headers['x-request-id'],generation:Number(headers['x-analysis-generation'])},outcome}})
    })
    let apiCalls=0
    page.on('request', req => {if(req.url().endsWith('/api/analysis')) apiCalls++})
    await page.goto(url)
    for (const [field,value] of Object.entries(oracle.financialInputs)) {
      await page.locator(`#value-${field}`).fill(value)
      await page.locator(`#source-kind-${field}`).selectOption('assumption')
      await page.locator(`#source-${field}`).fill(`Kontrollert brukerforutsetning ${field}`)
    }
    for (const field of ['L','D','J']) { await page.locator(`#period-${field}`).selectOption('year'); await page.locator(`#year-${field}`).fill('2026') }
    await page.locator('#rent-nature-L').selectOption('expected')
    await page.locator('#confirm-financial').click(); await page.locator('#next-step').click()
    await page.locator('#report-file').setInputFiles(resolve(`tests/fixtures/property-cases/${oracle.documentName}`))
    const responsePromise = page.waitForResponse(res => res.url().endsWith('/api/analysis'), {timeout:150000})
    await page.getByRole('button',{name:'Start analyse',exact:true}).click()
    const response = await responsePromise
    const result = await response.json()
    if(action !== 'replay-control') write('outcome',result.outcome ?? result)
    if (result.outcome?.status !== 'completed') throw new Error('Non-completed original outcome')
    await page.getByRole('button',{name:'Gå til Kontroller funn',exact:true}).click()
    await page.locator('#findings-title').scrollIntoViewIfNeeded()
    await expect(page.locator('.report-findings')).toHaveAttribute('data-list-visible-generation',/\d+/)
    await page.screenshot({path:`${dir}/screenshots/${shotId}-original.png`,fullPage:true})
    const sourceChecks=[]
    for(const row of await page.locator('.finding-list > li').all()) {
      await row.locator('.finding-select').click()
      await expect(page.locator('.textLayer')).toBeVisible()
      const selected = await row.locator('.finding-select').innerText()
      const originalText = await page.locator('.textLayer').innerText()
      const source = await page.locator('.source-original').innerText()
      sourceChecks.push({selected,source,originalText,at:new Date().toISOString()})
      // Source sanity check performed against original rendered PDF before confirmation.
      const isRoof=selected.startsWith('TG3')
      if (!originalText.includes(isRoof?'Alvorlig lekkasje i tak':'Slitt overflate')) throw new Error('Source mismatch; no confirmation')
      if (!source.includes(`PDF-side ${isRoof?4:2}`)) throw new Error('Wrong physical PDF page')
      await page.screenshot({path:`${dir}/screenshots/${shotId}-source-${sourceChecks.length}.png`,fullPage:true})
      await row.getByRole('button',{name:'Bekreft',exact:true}).click()
      if(isRoof) await page.getByLabel('TG3-status for gjeldende forhold').selectOption('unresolved')
    }
    await page.getByRole('button',{name:'Bekreft gjeldende liste',exact:true}).click()
    await page.getByRole('button',{name:'Beregn og vis resultat',exact:true}).click()
    await expect(page.locator('#recommendation-title')).toBeVisible()
    const actualRecommendation=await page.locator('#recommendation-title').innerText()
    const metrics=(await page.locator('.metric-value').allTextContents()).map(text=>text.replace(/\u00a0/g,' '))
    expect(metrics).toEqual(id==='F2'?['8,750 %','1 000 000 kr/år','6,250 %','200 000 kr/år']:['11,875 %','1 500 000 kr/år','9,375 %','700 000 kr/år'])
    expect(apiCalls).toBe(1)
    await page.screenshot({path:`${dir}/screenshots/${shotId}-result.png`,fullPage:true})
    write(action === 'replay-control'?'replay-control':'control',{ replay:action === 'replay-control', expectedRecommendation:oracle.expectedRecommendation, expectedRecommendationMatched:actualRecommendation===oracle.expectedRecommendation, sourceChecks, method:'Automated UI actions and rendered PDF text/page checks; agent separately evaluates original extraction. No human timing measurement.', recommendation:await page.locator('#recommendation-title').innerText(),metrics,apiCalls,providerCalls:action === 'replay-control'?0:1,corrections:0,s5Measured:false })
  }
  if(action !== 'replay-control') {
  const provider=JSON.parse(readFileSync(`${stem}-provider.json`))
  const http=JSON.parse(readFileSync(`${stem}-http.json`))
  const usage=provider.usage
  if(http.status!==200 || !usage || provider.status!=='completed' || provider.service_tier!=='default') throw new Error('Provider/cost not reconciled')
  const costUsd=usageCost(usage)
  const cumulativeProjectUsd=validCost(costBeforeUsd+costUsd)
  requireLockOwner(lock, lockOwner)
  write('receipt',{finishedAt:new Date().toISOString(),usage,serviceTier:provider.service_tier,returnedModel:provider.model,costUsd,cumulativeProjectUsd,unknownCost:false,oracleSha256After:sha(readFileSync(oraclePath)),attempts:1,retries:0})
  releaseOwnedLock(lock,lockOwner)
  console.log(`${id} completed; cost ${costUsd}; project ${costBeforeUsd+costUsd}`)
  } else console.log(`${id} replay control complete; zero API calls`)
} catch (error) {
  write(action === 'replay-control'?'replay-ui-failure':'ui-failure',{at:new Date().toISOString(),reason:String(error.message).slice(0,1800)})
  console.log(`${id} STOP: inspect preserved evidence; lock and reservation retained; no retry.`)
  process.exitCode=1
} finally {
  await browser?.close()
  server?.closeAllConnections()
  await router?.stop()
  if(server?.listening) await new Promise(resolve=>server.close(resolve))
}
