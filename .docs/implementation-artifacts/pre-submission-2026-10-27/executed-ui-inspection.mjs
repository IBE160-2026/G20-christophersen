// Intern visuell kontroll; ikke ekstern S6, S5 eller live-uttrekksmåling.
import express from 'express'
import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createAnalysisRouter } from '../../../src/backend/http/analysis-route.ts'
const root = new URL('../../../', import.meta.url)
const output = new URL('./visual/', import.meta.url)
await mkdir(output) // Eksklusiv oppretting: ingen historiske bilder overskrives.
const servers = []
let browser
const records = []
async function server(adapterModule) {
  const app = express()
  const router = createAnalysisRouter({ mode: 'demo', ...(adapterModule ? { adapterModule } : {}) })
  app.use('/api', router)
  app.use(express.static(fileURLToPath(new URL('dist/', root))))
  const http = createServer(app)
  servers.push({ http, router })
  await new Promise((resolve, reject) => { http.once('error', reject); http.listen(0, '127.0.0.1', resolve) })
  return `http://127.0.0.1:${http.address().port}`
}
async function enter(page, base, rent = '1900000') {
  await page.goto(base)
  for (const [field, value] of Object.entries({ P: '16000000', L: rent, D: '400000', J: '800000', Ymin: '7' })) {
    await page.locator(`#value-${field}`).fill(value)
    await page.locator(`#source-kind-${field}`).selectOption('assumption')
    await page.locator(`#source-${field}`).fill(`Fiktiv kontroll ${field}`)
  }
  for (const field of ['L', 'D', 'J']) {
    await page.locator(`#period-${field}`).selectOption('year')
    await page.locator(`#year-${field}`).fill('2026')
  }
  await page.locator('#rent-nature-L').selectOption('expected')
  await page.locator('#confirm-financial').click()
  await page.locator('#next-step').click()
}
async function capture(page, width, state) {
  const record = { width, state, pageOverflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), workspaceOverflow: await page.locator('.workspace').evaluate(e => e.scrollWidth > e.clientWidth) }
  await page.screenshot({ path: fileURLToPath(new URL(`${width}-${state}.png`, output)) })
  records.push(record)
  if (record.pageOverflow || record.workspaceOverflow) throw new Error(`Overløp: ${state}`)
}
try {
  const demo = await server()
  const controlled = await server(new URL('tests/helpers/report-ui-adapter.ts', root).href)
  browser = await chromium.launch()
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width === 1440 ? 900 : 844 } })
    const external = []
    await page.route('**/*', async route => {
      if ([demo, controlled].some(base => route.request().url().startsWith(base + '/'))) await route.continue()
      else { external.push(route.request().url()); await route.abort() }
    })
    for (const [name, rent, expected] of [['F1', '1900000', 'Gå videre'], ['F2', '1400000', 'Forkast'], ['F4', '1900000', 'Innhent mer informasjon']]) {
      await enter(page, demo, rent)
      await page.locator('#report-file').setInputFiles(fileURLToPath(new URL(`tests/fixtures/property-cases/${name}-tilstandsrapport.pdf`, root)))
      await page.getByRole('button', { name: 'Start analyse', exact: true }).click()
      await page.getByRole('button', { name: 'Gå til Kontroller funn', exact: true }).click()
      for (const row of await page.locator('.finding-list > li').all()) {
        await row.locator('.finding-select').click()
        await row.getByRole('button', { name: 'Bekreft', exact: true }).click()
        if ((await row.locator('.finding-select').innerText()).startsWith('TG3')) await page.getByLabel('TG3-status for gjeldende forhold').selectOption('unresolved')
      }
      await page.getByRole('button', { name: 'Bekreft gjeldende liste', exact: true }).click()
      await page.getByRole('button', { name: 'Beregn og vis resultat', exact: true }).click()
      await page.locator('#recommendation-title').filter({ hasText: expected }).waitFor()
      if (await page.locator('#recommendation-title').innerText() !== expected) throw new Error('Feil anbefaling')
      if (name === 'F4' && (await page.locator('.result-triggers').innerText()).includes('autorisert elektriker')) throw new Error('Misvisende TG3-eksempel')
      await capture(page, width, `${name}-resultat`)
      await page.locator('.financial-metrics').evaluate(e => e.scrollIntoView({ block: 'start' }))
      await capture(page, width, `${name}-nokkeltall`)
    }
    await enter(page, controlled)
    const bytes = await readFile(new URL('tests/fixtures/property-cases/F1-tilstandsrapport.pdf', root))
    await page.locator('#report-file').setInputFiles({ name: 'partial.pdf', mimeType: 'application/pdf', buffer: bytes })
    await page.getByRole('button', { name: 'Start analyse', exact: true }).click()
    await page.getByRole('heading', { name: 'Delresultat — ufullstendig analyse' }).waitFor()
    await capture(page, width, 'opprinnelig-feil')
    await page.getByRole('button', { name: 'Start analyse', exact: true }).click()
    await page.getByText(/Duplikatsperren avviste det nye forsøket/).waitFor()
    if (!(await page.locator('#analysis-status').innerText()).includes('timeout')) throw new Error('Original feil mistet')
    if (!(await page.locator('.finding-list').innerText()).includes('Kontrollert lekkasje')) throw new Error('Delresultat mistet')
    await capture(page, width, 'duplikat-bevarer-feil')
    records.push({ width, externalRequests: external.length })
    if (external.length) throw new Error('Ekstern forespørsel')
    await page.close()
  }
} finally {
  await writeFile(new URL('observations.json', output), JSON.stringify(records, null, 2) + '\n')
  try { await browser?.close() }
  finally {
    for (const { http, router } of servers) {
      http.closeAllConnections()
      try { await router.stop() }
      finally { if (http.listening) await new Promise(resolve => http.close(resolve)) }
    }
  }
}
console.log(JSON.stringify({ screenshots: records.filter(r => r.state).length, overflow: false, externalRequests: 0 }))
