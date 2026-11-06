// Etterprøver README med fiktiv PDF. Kjør fra reporoten etter npm ci/build/browserinstallasjon.
// Dette er KI-assistert testbevis, ingen annen-person-S6 eller OS-brannmurprøve.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { chromium, expect } from '@playwright/test'

const port = Number(process.env.PAA_PROOF_PORT ?? '43162')
assert(Number.isInteger(port) && port > 0 && port <= 65535)
const base = `http://127.0.0.1:${port}`
const output = await mkdtemp(resolve(tmpdir(), 'paa-readme-proof-'))
const environment = { PATH: process.env.PATH, HOME: process.env.HOME, ANALYSIS_MODE: 'demo', OPENAI_API_KEY: '', PAA_PORT: String(port) }
const server = spawn(process.execPath, ['src/backend/server.ts'], { cwd: process.cwd(), env: environment, stdio: ['ignore', 'pipe', 'pipe'] })
const closed = once(server, 'close')
let serverText = '', browser, failure
server.stdout.on('data', bytes => { serverText += bytes })
server.stderr.on('data', bytes => { serverText += bytes })
const external = [], errors = [], checks = []
try {
  const deadline = Date.now() + 15_000
  while (!serverText.includes(` · Demo · ${base}`)) {
    assert(server.exitCode === null, 'Testserver avsluttet før oppstart')
    assert(Date.now() < deadline, 'Testserver nådde ikke oppstartsfrist')
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', route => {
    const url = new URL(route.request().url())
    if (url.origin === base || ['blob:', 'data:'].includes(url.protocol)) return route.continue()
    external.push(url.origin)
    return route.abort()
  })
  await page.goto(base)
  await expect(page.locator('#import-file-prospectus')).toBeAttached()
  const configuration = await (await page.request.get(`${base}/api/document-import-config`)).json()
  assert.equal(configuration.liveEnabled, false)
  await page.locator('#import-file-prospectus').setInputFiles('tests/fixtures/sales-prospectus/mixed-12.pdf')
  await expect(page.locator('.hero')).toContainText('Dokumentuttrekk klart.')
  await expect(page.locator('.purchase-basis')).toContainText('3 200 000')
  checks.push('Nøkkelfri oppstart og faktisk syntetisk PDF-import')
  await page.getByRole('button', { name: 'Juster leie og drift ↗' }).click()
  await page.getByLabel('Forventet leie per år (kr)', { exact: true }).fill('252000')
  await page.getByLabel('Samlet eierbetalt drift per år (kr)', { exact: true }).fill('48000')
  await page.getByLabel('År for forutsetningene').fill('2026')
  await page.getByRole('button', { name: 'Bruk som ubekreftede forutsetninger' }).click()
  await page.locator('#scenario-rent-monthly').fill('21000')
  await page.locator('#scenario-operating-monthly').fill('4000')
  await page.locator('#scenario-equity').fill('1000000')
  await page.locator('#scenario-rate').fill('5,5')
  await page.locator('#scenario-years').fill('25')
  await expect(page.getByTestId('scenario-gross')).toContainText('7,88')
  await expect(page.getByTestId('scenario-net')).toContainText('6,38')
  await expect(page.getByTestId('scenario-cash')).toContainText('3 258', { timeout: 15_000 })
  checks.push('README-fasit: brutto 7,88 %, netto 6,38 %, kontantstrøm ca. 3258 kr/mnd')
  await page.getByRole('button', { name: 'Dokumentasjon', exact: true }).click()
  await page.getByRole('button', { name: 'Åpne salgsoppgavens første side ↗' }).click()
  await expect(page.locator('[data-pdf-page="1"]')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Dokumentasjon', exact: true })).toBeFocused()
  checks.push('Originalside og Esc/fokusretur')
  await page.screenshot({ path: resolve(output, 'oversikt-desktop.png'), fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'Horisontal sidescroll')
  await page.locator('h1').focus()
  await page.locator('#investment').evaluate(node => node.scrollIntoView({ block: 'start' }))
  await page.screenshot({ path: resolve(output, 'okonomi-mobil.png') })
  checks.push('390 px: ingen horisontal sidescroll; økonomi visuelt dokumentert')
  await page.getByTestId('open-financial-basis').click()
  await expect(page.locator('#value-P')).toBeVisible()
  checks.push('Bak tallene åpner Tallgrunnlag fra dagens oversikt')
  await page.getByRole('button', { name: '← Tilbake til investeringsoversikten' }).click()
  const rejected = page.waitForResponse(response => response.url().endsWith('/api/document-import') && response.request().method() === 'POST')
  await page.locator('#import-file-prospectus').setInputFiles('tests/fixtures/property-cases/invalid-format.pdf')
  assert.deepEqual(await (await rejected).json(), { kind: 'rejected', code: 'invalid-format' })
  await expect(page.locator('#scenario-equity')).toHaveValue('')
  await page.locator('#import-file-prospectus').setInputFiles('tests/fixtures/sales-prospectus/missing-report-6.pdf')
  await expect(page.locator('.hero')).toContainText('Dokumentuttrekk klart.')
  checks.push('Feil fil og ny import nullstiller gammelt grunnlag')
  assert.deepEqual(external, [])
  assert.deepEqual(errors, [])
} catch (error) { failure = error }
finally {
  await browser?.close()
  const killer = setTimeout(() => server.kill('SIGKILL'), 3000)
  server.kill('SIGTERM')
  await closed
  clearTimeout(killer)
}
const summary = { date: '2026-11-06', passed: !failure, runtime: process.version, checks, externalBrowserRequests: external, browserErrors: errors, limitation: 'Programmatisk browsernett-sperre, ikke OS-brannmur. Privat mappe og API-nøkkel inngår ikke i klonen. Ingen annen-person-S6.', output }
await writeFile(resolve(output, 'demo-resultat.json'), JSON.stringify(summary, null, 2) + '\n')
console.log(JSON.stringify(summary, null, 2))
if (failure) throw failure
