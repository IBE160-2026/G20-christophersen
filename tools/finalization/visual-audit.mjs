// Lokal visuell egenkontroll. Dette er ikke ekstern S6 eller S5-måling.
import express from 'express'
import { createServer } from 'node:http'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createAnalysisRouter } from '../../src/backend/http/analysis-route.ts'

const phase = process.argv[2]
if (!['before', 'after'].includes(phase)) throw new Error('Bruk before eller after')
const runId = process.argv[3]
if (runId !== undefined && !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(runId)) throw new Error('Ugyldig run-id')
const root = fileURLToPath(new URL('../../', import.meta.url))
const evidenceRoot = `${root}.docs/implementation-artifacts/sluttforing-2026-10-27`
const output = `${evidenceRoot}/${phase}${runId ? `-${runId}` : ''}`
await mkdir(evidenceRoot, { recursive: true })
// Eksklusiv oppretting: et tidligere bevissett skal aldri overskrives.
await mkdir(output)
const app = express()
const analysis = createAnalysisRouter({ mode: 'demo' })
app.use('/api', analysis)
app.use(express.static(`${root}dist`))
const server = createServer(app)
let browser
const observations = []
try {
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve) })
  const base = `http://127.0.0.1:${server.address().port}`
  browser = await chromium.launch()
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport })
    const external = []
    await page.route('**/*', async route => {
      if (!route.request().url().startsWith(`${base}/`)) { external.push(route.request().url()); await route.abort() }
      else await route.continue()
    })
    const capture = async name => {
      await page.screenshot({ path: `${output}/${viewport.width}-${name}.png` })
      observations.push({ viewport, state: name, pageOverflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        workspaceOverflow: await page.locator('.workspace').evaluate(el => el.scrollWidth > el.clientWidth) })
    }
    await page.goto(base)
    await page.getByText('Demo · lagret KI-uttrekk', { exact: true }).waitFor()
    await capture('tall-tom')
    await page.locator('#confirm-financial').click()
    await capture('tall-feil')
    for (const [field, value] of Object.entries({ P: '16000000', L: '1900000', D: '400000', J: '800000', Ymin: '7' })) {
      await page.locator(`#value-${field}`).fill(value)
      await page.locator(`#source-kind-${field}`).selectOption('assumption')
      await page.locator(`#source-${field}`).fill(`Fiktiv F4-forutsetning ${field}`)
    }
    for (const field of ['L', 'D', 'J']) {
      await page.locator(`#period-${field}`).selectOption('year')
      await page.locator(`#year-${field}`).fill('2026')
    }
    await page.locator('#rent-nature-L').selectOption('expected')
    await page.locator('#confirm-financial').click()
    await page.locator('#next-step').click()
    await capture('rapport-tom')
    await page.locator('#report-file').setInputFiles(`${root}tests/fixtures/property-cases/invalid-format.pdf`)
    await page.getByRole('button', { name: 'Start analyse', exact: true }).click()
    await page.locator('.field-issue').first().waitFor()
    await capture('rapport-feil')
    await page.locator('#report-file').setInputFiles(`${root}tests/fixtures/property-cases/F4-tilstandsrapport.pdf`)
    await page.getByRole('button', { name: 'Start analyse', exact: true }).click()
    await page.getByRole('button', { name: 'Gå til Kontroller funn', exact: true }).click()
    await page.locator('#findings-title').scrollIntoViewIfNeeded()
    for (const row of await page.locator('.finding-list > li').all()) {
      await row.locator('.finding-select').click()
      await row.getByRole('button', { name: 'Bekreft', exact: true }).click()
      if ((await row.locator('.finding-select').innerText()).startsWith('TG3')) {
        await page.getByLabel('TG3-status for gjeldende forhold').selectOption('unresolved')
      }
    }
    await page.locator('.tg3-resolution').scrollIntoViewIfNeeded()
    await capture('tg3-kontroll')
    if (phase === 'after') {
      await page.locator('.tg3-resolution').evaluate(element => element.scrollIntoView({ block: 'start' }))
      await capture('tg3-start')
    }
    if (viewport.width < 1200) {
      await page.getByRole('button', { name: 'Åpne PDF for valgt funn', exact: true }).click()
      await page.locator('dialog canvas').waitFor()
      await capture('pdf-panel')
      await page.keyboard.press('Escape')
    }
    await page.getByRole('button', { name: 'Bekreft gjeldende liste', exact: true }).click()
    if (phase === 'after') {
      await page.locator('.finding-list-control').scrollIntoViewIfNeeded()
      await capture('listebekreftelse')
    }
    await page.getByRole('button', { name: 'Beregn og vis resultat', exact: true }).click()
    await capture('resultat')
    if (phase === 'after') {
      await page.locator('.financial-metrics').evaluate(element => element.scrollIntoView({ block: 'start' }))
      await capture('resultat-nokkeltall')
      if (viewport.width < 700) {
        for (const [index, metric] of (await page.locator('.financial-metric').all()).entries()) {
          await metric.evaluate(element => element.scrollIntoView({ block: 'start' }))
          await capture(`resultat-nokkeltall-${index + 1}`)
        }
      }
      await page.locator('#result-report-title').evaluate(element => element.scrollIntoView({ block: 'start' }))
      await capture('resultat-rapport')
      await page.getByText('Analyseopphav og rapportidentitet', { exact: true }).click()
      await page.getByText('Analyseopphav og rapportidentitet', { exact: true }).scrollIntoViewIfNeeded()
      await capture('resultat-sporbarhet')
    }
    await page.getByRole('button', { name: 'Endre tallgrunnlag', exact: true }).click()
    await page.locator('#value-L').fill('1400000')
    await page.getByRole('button', { name: /Resultat/ }).click()
    await capture('resultat-utdatert')
    observations.push({ viewport, blockedExternalRequests: external.length })
    await page.close()
  }
  await writeFile(`${output}/observations.json`, `${JSON.stringify(observations, null, 2)}\n`)
  console.log(JSON.stringify(observations))
  if (observations.some(item => item.pageOverflow || item.workspaceOverflow || item.blockedExternalRequests > 0)) {
    throw new Error('Visuell kontroll feilet: overløp eller ekstern forespørsel. Se observations.json.')
  }
} finally {
  try { await browser?.close() }
  finally {
    server.closeAllConnections()
    try { await analysis.stop() }
    finally { if (server.listening) await new Promise(resolve => server.close(resolve)) }
  }
}
