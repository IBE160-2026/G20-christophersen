// Ekte godkjenningsflyt. Krever lokalt bygget app og de to private originalene.
// Ingen nettverksstubbing. Serveren startes uten API-nøkkel og stoppes etter prøven.
import { chromium, expect } from '@playwright/test'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { access, mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

if (process.versions.node !== '24.21.0') throw new Error('Bruk prosjektets Node 24.21.0 for godkjenningsprøven.')
const origin = 'http://localhost:3000'
const output = resolve(process.env.PAA_ACCEPTANCE_OUTPUT ?? 'private/stabilization-2026-11-05/acceptance')
await mkdir(output, { recursive: true })
const cases = {
  nost: { file: 'private/incoming/nostegaten-65-a.pdf', title: 'Nøstegaten 65 A', price: 4050000, area: 40, rooms: 2, bedrooms: 1, common: 1020, municipal: 12957, subtotal: 25197, ssb: 12000, published: 13891, pages: 152, hash: 'f33337aa0f5f2de0b64454541b0bb20bcf7732498755c4078ed1509b3a3f14e8' },
  rost: { file: 'private/incoming/nordvik-rostockgata-96.pdf', title: 'Rostockgata 96', price: 8600000, area: 59, rooms: 3, bedrooms: 2, common: 3660, subtotal: 43920, ssb: 18900, published: 20426, pages: 170, hash: '3e2dd467c11785c1de7c8c79b8e5f58f786e87416f7dc9b14f7a2d713ec6cb70' },
}
for (const item of Object.values(cases)) await access(item.file)
const money = value => new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(value).replaceAll('\u00a0', ' ')
const percent = value => new Intl.NumberFormat('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
const summary = { startedAt: new Date().toISOString(), node: process.version, origin, mockedResponses: 0, checks: [], pageErrors: [], externalRequests: [] }
let server, browser, serverLog = ''
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
async function stop() {
  if (!server) return
  const child = server; server = undefined
  if (child.exitCode !== null || child.signalCode !== null) return
  const closed = once(child, 'close')
  child.kill('SIGTERM')
  const timer = setTimeout(() => child.kill('SIGKILL'), 10000)
  try { await closed } finally { clearTimeout(timer) }
}
async function start() {
  await stop()
  const occupied = await fetch(`${origin}/api/document-import-config`).then(() => true, () => false)
  if (occupied) throw new Error('Port 3000 er opptatt. Stopp den identifiserte PAA-serveren før kontrollert oppstart.')
  server = spawn(process.execPath, ['src/backend/server.ts'], { cwd: process.cwd(), env: { ...process.env, ANALYSIS_MODE: 'demo', OPENAI_API_KEY: '', FINN_IMPORT_ENABLED: 'false', PAA_PORT: '3000' }, stdio: ['ignore', 'pipe', 'pipe'] })
  server.stdout.on('data', chunk => { serverLog += chunk.toString() })
  server.stderr.on('data', chunk => { serverLog += chunk.toString() })
  for (let attempt = 0; attempt < 100; attempt++) {
    const ready = await fetch(`${origin}/api/document-import-config`).then(response => response.ok, () => false)
    if (ready) return
    if (server.exitCode !== null) throw new Error(`Serveren stoppet: ${serverLog}`)
    await sleep(100)
  }
  throw new Error('Serveren startet ikke innen fristen.')
}
async function check(name, action) {
  console.log(`START ${name}`)
  const started = Date.now()
  try {
    const detail = await action()
    summary.checks.push({ name, status: 'passed', elapsedMs: Date.now() - started, ...detail })
    console.log(`PASS ${name} (${Date.now() - started} ms)`)
  } catch (error) {
    summary.checks.push({ name, status: 'failed', elapsedMs: Date.now() - started, error: error.message })
    throw error
  } finally { await writeFile(resolve(output, 'summary.json'), JSON.stringify(summary, null, 2)) }
}
async function upload(page, key, label) {
  const item = cases[key]
  const imported = page.waitForResponse(response => response.url().endsWith('/api/document-import') && response.request().method() === 'POST', { timeout: 95000 })
  void imported.catch(() => undefined)
  const rental = page.waitForResponse(response => response.url().endsWith('/api/rent-estimate') && response.request().method() === 'POST', { timeout: 100000 })
  void rental.catch(() => undefined)
  await page.locator('#import-file-prospectus').setInputFiles(resolve(item.file))
  await expect(page.locator('.hero-upload [role="status"][aria-live="polite"]')).toContainText(/behandles|Leser|velges|kontrolleres|lokal|importeres/i, { timeout: 10000 })
  const response = await imported
  const body = await response.json()
  expect(response.status(), JSON.stringify(body).slice(0, 300)).toBe(200)
  const outcome = body.outcome
  expect(outcome.reportHash).toBe(item.hash)
  expect(outcome.pageCount).toBe(item.pages)
  expect(outcome.pages).toHaveLength(item.pages)
  const rented = await rental
  expect(rented.status()).toBe(200)
  const rent = await rented.json()
  expect(rent.property.area.value).toBe(item.area)
  expect(rent.property.rooms.value).toBe(item.rooms)
  expect(rent.property.bedrooms.value).toBe(item.bedrooms)
  expect(Number(rent.monthly)).toBe(item.ssb)
  expect(Number(rent.published.references.find(entry => entry.reference.id === rent.published.selectedReferenceId).reference.value)).toBe(item.published)
  for (const [id, amount] of [['price', item.price], ['sharedDebt', 0], ['commonCosts', item.common], ...(item.municipal ? [['municipalFees', item.municipal]] : [])]) {
    const field = outcome.economy.fields.find(field => field.id === id)
    expect(field?.amount, id).toBe(String(amount))
    expect(field.sources.length).toBeGreaterThan(0)
    for (const source of field.sources) {
      expect(source.documentHash).toBe(item.hash)
      expect(outcome.pages[source.pdfPage - 1].text.slice(source.start, source.end)).toBe(source.quote)
    }
  }
  await expect(page.locator('h1')).toContainText(item.title)
  await expect(page.locator('.property-prices > div').first().locator('strong')).toContainText(money(item.price))
  const other = cases[key === 'nost' ? 'rost' : 'nost']
  await expect(page.locator('.investment-main')).not.toContainText(other.title)
  const panel = page.getByRole('region', { name: 'Forventet leie.' })
  await expect(panel).toBeVisible()
  await expect(panel).toContainText(`${item.area} m² BRA-i`)
  for (const [label, value] of [['Rom', item.rooms], ['Soverom', item.bedrooms]]) {
    await expect(panel.locator('.source-summary > div').filter({ has: page.locator('dt', { hasText: new RegExp(`^${label}$`) }) }).locator('dd')).toContainText(String(value))
  }
  await expect(panel.getByTestId('rent-monthly')).toContainText(money(item.ssb))
  await expect(panel.getByTestId('rent-published-monthly')).toContainText(money(item.published))
  await expect(panel).toContainText('Individuell markedsleie: Ikke beregnet')
  await expect(page.locator('.document-economy')).toContainText(`${item.pages} fysiske sider`)
  await expect(page.locator('.document-economy')).toContainText('Teknisk dekning: ufullstendig')
  for (const [label, value] of [['Prisantydning', item.price], ['Fellesgjeld', 0], ['Felleskostnader', item.common], ...(item.municipal ? [['Kommunale avgifter', item.municipal]] : [])]) {
    const row = page.locator('.document-economy-fields > div').filter({ has: page.locator('dt', { hasText: new RegExp(`^${label}$`) }) })
    await expect(row.locator('dd > strong')).toHaveText(`${money(value)},00 kr`)
  }
  await expect(page.getByTestId('scenario-gross')).toContainText(percent(item.ssb * 12 / item.price * 100), { timeout: 10000 })
  await expect(page.getByTestId('scenario-preliminary-net')).toContainText(percent((item.ssb * 12 - item.subtotal) / item.price * 100))
  await expect(page.getByTestId('scenario-net')).toContainText('—')
  await expect(page.getByTestId('scenario-cash')).toContainText('—')
  if (key === 'nost') await expect(page.getByTestId('scenario-cost-assumption')).toContainText(/kommunale|felleskost/i)
  await page.screenshot({ path: resolve(output, `${label}.png`), fullPage: true })
  await writeFile(resolve(output, `${label}-visible.txt`), await page.locator('body').innerText())
  return { document: key, pages: item.pages, http: response.status(), visibleResult: true, sourceSpansVerified: true }
}
async function slider(page, key, mobile) {
  const item = cases[key]
  await page.setViewportSize(mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 })
  const control = page.getByRole('slider', { name: /forventet månedsleie/i })
  await expect(control).toBeVisible()
  await control.scrollIntoViewIfNeeded()
  // Reell pekerkontroll på mobil/desktop; avles valgt verdi for uavhengig matematikk.
  const box = await control.boundingBox()
  if (mobile) await page.touchscreen.tap(box.x + box.width * .6, box.y + box.height / 2)
  else await page.mouse.click(box.x + box.width * .6, box.y + box.height / 2)
  const selected = Number(await control.inputValue())
  expect(selected).not.toBe(item.ssb)
  await expect(page.getByTestId('scenario-gross')).toContainText(percent(selected * 12 / item.price * 100))
  await expect(page.getByTestId('scenario-preliminary-net')).toContainText(percent((selected * 12 - item.subtotal) / item.price * 100))
  await expect(page.getByTestId('scenario-preliminary-formula')).toContainText(money(selected * 12 - item.subtotal))
  await expect(page.getByTestId('rent-monthly')).toContainText(money(item.ssb))
  await expect(page.getByTestId('rent-published-monthly')).toContainText(money(item.published))
  await page.getByRole('button', { name: /tilbakestill.*publisert/i }).click()
  await expect(control).toHaveValue(String(item.published))
  await expect(page.getByTestId('scenario-gross')).toContainText(percent(item.published * 12 / item.price * 100))
  await expect(page.getByTestId('scenario-preliminary-net')).toContainText(percent((item.published * 12 - item.subtotal) / item.price * 100))
  await page.screenshot({ path: resolve(output, `slider-${key}-${mobile ? 'mobile' : 'desktop'}.png`), fullPage: true })
  return { document: key, monthlySelected: selected, resetMonthly: item.published, grossPercent: percent(selected * 12 / item.price * 100), preliminaryNetPercent: percent((selected * 12 - item.subtotal) / item.price * 100) }
}
async function navigation(page, mobile) {
  await page.setViewportSize(mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  for (const label of ['Eiendommen', 'Dokumentasjon']) {
    await page.getByRole('button', { name: label, exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    expect(await page.getByRole('dialog').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
  }
  const area = page.getByRole('region', { name: 'Forventet leie.' }).locator('.source-summary > div').filter({ has: page.locator('dt', { hasText: /^Areal$/ }) })
  await area.getByRole('button').first().click()
  await expect(page.locator('.pdf-page canvas')).toBeVisible({ timeout: 20000 })
  const originalPage = Number(await page.locator('[data-pdf-page]').getAttribute('data-pdf-page'))
  await page.getByRole('button', { name: 'Neste PDF-side', exact: true }).click()
  await expect(page.locator('#pdf-status')).toContainText(`PDF-side ${originalPage + 1}:`)
  await expect(page.locator(`[data-pdf-page="${originalPage + 1}"]`)).toBeVisible()
  await page.getByLabel('PDF-zoom').selectOption('1.5')
  await page.keyboard.press('Escape')
  await page.getByTestId('open-financial-basis').click()
  await expect(page.getByRole('heading', { name: 'Tallgrunnlag', exact: true })).toBeVisible()
  await page.getByRole('button', { name: /Tilbake til investeringsoversikten/ }).click()
  await expect(page.getByRole('heading', { name: 'Forventet leie.', exact: true })).toBeVisible()
  return { viewport: mobile ? '390x844' : '1440x1000', dialogNavigation: true, pdfSource: true, controlWorkspace: true, overflow: false }
}
try {
  await start()
  browser = await chromium.launch(process.env.PAA_BROWSER_EXECUTABLE ? { executablePath: process.env.PAA_BROWSER_EXECUTABLE } : {})
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, hasTouch: true })
  const page = await context.newPage()
  page.on('pageerror', error => summary.pageErrors.push(error.message))
  page.on('request', request => { const url = new URL(request.url()); if (!['localhost', '127.0.0.1'].includes(url.hostname) && ['http:', 'https:'].includes(url.protocol)) summary.externalRequests.push(url.origin + url.pathname) })
  await page.goto(origin)
  await check('1 Nøstegaten etter ny oppstart', () => upload(page, 'nost', '01-nost-fresh'))
  await check('6a Leieslider og reset desktop', () => slider(page, 'nost', false))
  await check('7a Navigasjon desktop', () => navigation(page, false))
  await check('2 Nøstegaten igjen i samme nettleserøkt', () => upload(page, 'nost', '02-nost-repeat'))
  await check('3 Rostockgata i samme nettleserøkt', () => upload(page, 'rost', '03-rost-same-session'))
  await start()
  await page.reload()
  await check('4 Rostockgata etter ny oppstart', () => upload(page, 'rost', '04-rost-fresh'))
  await check('6b Leieslider og reset mobil', () => slider(page, 'rost', true))
  await check('7b Navigasjon mobil', () => navigation(page, true))
  await check('5a Ytterligere Nøstegaten', () => upload(page, 'nost', '05-nost-additional'))
  await check('5b Ytterligere Rostockgata', () => upload(page, 'rost', '06-rost-additional'))
  await check('8 Reell feil og fungerende nytt forsøk', async () => {
    const rejected = page.waitForResponse(response => response.url().endsWith('/api/document-import') && response.request().method() === 'POST')
    await page.locator('#import-file-prospectus').setInputFiles({ name: 'odelagt.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7\nDokumentet er avbrutt og mangler et gyldig sidetre.\n%%EOF') })
    const response = await rejected
    expect(response.ok()).toBe(false)
    await expect(page.locator('.hero-upload [role="status"][aria-live="polite"]')).toContainText(/kunne ikke|intakt|ugyldig/i)
    await expect(page.getByTestId('scenario-gross')).toContainText('—')
    await expect(page.locator('h1')).not.toContainText(cases.rost.title)
    await page.screenshot({ path: resolve(output, '07-real-error.png'), fullPage: true })
    const recovery = await upload(page, 'nost', '08-recovery')
    return { rejectedHttp: response.status(), recoveredWithoutRestart: true, ...recovery }
  })
  expect(summary.pageErrors).toEqual([])
  expect(summary.externalRequests).toEqual([])
  summary.status = 'passed'
} catch (error) {
  summary.status = 'failed'
  summary.error = error.message
  process.exitCode = 1
  console.error(error.message)
} finally {
  summary.finishedAt = new Date().toISOString()
  await browser?.close()
  await stop()
  await writeFile(resolve(output, 'summary.json'), JSON.stringify(summary, null, 2))
  await writeFile(resolve(output, 'server.txt'), serverLog)
  console.log(`Resultat: ${summary.status}. Bevis: ${output}`)
}
