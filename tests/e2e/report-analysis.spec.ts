import { expect, test } from '@playwright/test'
import type { Page, Route } from '@playwright/test'
import express from 'express'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { createAnalysisRouter } from '../../src/backend/http/analysis-route.ts'

let url: string
let close: () => Promise<void>
test.beforeAll(async () => {
  const app = express()
  const analysis = createAnalysisRouter({ adapterModule: new URL('../helpers/report-ui-adapter.ts', import.meta.url).href })
  app.use('/api', analysis)
  app.use(express.static(fileURLToPath(new URL('../../dist', import.meta.url))))
  const server = createServer(app)
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Ingen lokal listener')
  url = `http://127.0.0.1:${address.port}`
  close = async () => {
    const closed = new Promise<void>(resolve => server.close(() => resolve()))
    server.closeAllConnections(); await analysis.stop(); await closed
  }
})
test.afterAll(async () => { await close?.() })
async function enter(page: Page, address = url) {
  await page.goto(address)
  for (const [field, value] of Object.entries({ P: '16000000', L: '1900000', D: '400000', J: '800000', Ymin: '7' })) {
    await page.locator(`#value-${field}`).fill(value)
    await page.locator(`#source-kind-${field}`).selectOption('assumption')
    await page.locator(`#source-${field}`).fill(`Kontrollert ${field}`)
  }
  for (const field of ['L', 'D', 'J']) {
    await page.locator(`#period-${field}`).selectOption('year')
    await page.locator(`#year-${field}`).fill('2026')
  }
  await page.locator('#rent-nature-L').selectOption('expected')
  await page.locator('#confirm-financial').click()
  await page.locator('#next-step').click()
}
async function choose(page: Page, name = 'rapport.pdf') {
  const buffer = await readFile(new URL('../fixtures/property-cases/F1-tilstandsrapport.pdf', import.meta.url))
  await page.locator('#report-file').setInputFiles({ name, mimeType: 'application/pdf', buffer })
  await expect(page.locator('#analysis-status')).toHaveText('Rapport valgt — ingen analyse startet.')
  return buffer
}
async function showList(page: Page) {
  await expect(page.getByRole('button', { name: 'Gå til Kontroller funn' })).toBeVisible()
  await page.getByRole('button', { name: 'Gå til Kontroller funn' }).click()
  await expect(page.getByRole('heading', { name: 'Kontroller funn', exact: true })).toBeFocused()
  await expect(page.locator('.report-findings')).toHaveAttribute('data-list-visible-generation', /\d+/)
  await expect(page.locator('#report-announcement')).toHaveText('Analyse fullført — funnlisten er klar.')
}

test('2.6 AC1/4/5/6: faktisk HTTP/adapter, ett kall, originalhash, synlighetsgrense og finansgjenbruk', async ({ page }) => {
  let calls = 0
  page.on('request', request => { if (request.url().endsWith('/api/analysis')) calls++ })
  await enter(page)
  await expect(page.getByRole('button', { name: 'Start analyse' })).toHaveAttribute('aria-disabled', 'true')
  await expect(page.getByText('Velg én rapport før du starter analysen.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Start analyse' }).click({ force: true })
  expect(calls).toBe(0)
  const bytes = await choose(page, 'slow.pdf')
  expect(calls).toBe(0)
  await expect(page.locator('.report-identity')).toContainText(createHash('sha256').update(bytes).digest('hex'))
  const start = page.getByRole('button', { name: 'Start analyse' })
  await start.focus(); await start.press('Enter')
  await expect(page.locator('#analysis-status')).toContainText('Analyserer')
  await start.press('Enter')
  await expect(page.locator('#analysis-status')).toHaveText('Uttrekk mottatt — åpne funnlisten i Kontroller funn.')
  await expect(start).toBeFocused()
  expect(calls).toBe(1)
  await expect(page.locator('.report-findings')).toHaveCount(0)
  await showList(page)
  await expect(page.locator('.finding-list')).toContainText('TG3 · Kontrollert lekkasje')
  await expect(page.locator('.finding-list')).toContainText('slow.pdf · PDF-side 2')
  await expect(page.locator('#report-deficiencies-title')).toHaveText('Innhent mer informasjon')
  await page.getByRole('button', { name: 'Tilbake til Tallgrunnlag', exact: true }).click()
  await page.locator('#value-L').fill('1800000')
  await page.locator('#confirm-financial').click()
  await page.locator('#next-step').click()
  await showList(page)
  await expect(page.locator('.finding-list')).toContainText('Kontrollert lekkasje')
  expect(calls).toBe(1)
})

test('2.6 AC4: gyldig tomliste og alle usikkerheter gjennom ordinær kontrolladapter', async ({ page }) => {
  await enter(page)
  await choose(page, 'empty.pdf'); await page.getByRole('button', { name: 'Start analyse' }).click()
  await showList(page)
  await expect(page.getByText(/Analyse fullført — ingen TG2\/TG3 funnet/)).toBeVisible()
  await page.getByRole('button', { name: 'Tilbake til Tilstandsrapport' }).click()
  // Ny originalhash kreves av den prosesslokale sperren; bruk en annen faktisk rapport.
  const buffer = await readFile(new URL('../fixtures/property-cases/F2-tilstandsrapport.pdf', import.meta.url))
  await page.locator('#report-file').setInputFiles({ name: 'uncertain.pdf', mimeType: 'application/pdf', buffer })
  await expect(page.locator('#analysis-status')).toContainText('Rapport valgt')
  await page.getByRole('button', { name: 'Start analyse' }).click(); await showList(page)
  await expect(page.locator('.finding-list > li')).toHaveCount(2)
  await expect(page.locator('.finding-list')).toContainText('Usikkert funn · Usikker vegg')
  await expect(page.locator('.finding-list')).toContainText('Teksten er uklar')
  await expect(page.locator('.finding-list')).toContainText('missing-source')
  await expect(page.locator('.report-findings')).toContainText('Usikkert uttrekk')
})

test('2.6 AC4: analysefeil/delresultat og dokumentfeil er ufullført', async ({ page }) => {
  await enter(page)
  await choose(page, 'partial.pdf'); await page.getByRole('button', { name: 'Start analyse' }).click()
  await expect(page.locator('#analysis-status')).toContainText('timeout')
  await expect(page.getByRole('button', { name: /Gå til Kontroller/ })).toHaveCount(0)
  await expect(page.locator('.local-deficiencies')).toContainText('ufullført')
  await expect(page.getByRole('heading', { name: 'Delresultat — ufullstendig analyse' })).toBeVisible()
  await expect(page.locator('.report-findings')).not.toHaveAttribute('data-list-visible-generation')
  await page.locator('#report-file').setInputFiles({ name: 'ødelagt.pdf', mimeType: 'application/pdf', buffer: Buffer.from('ikke PDF') })
  await expect(page.locator('#analysis-status')).toContainText('Rapport valgt')
  await page.getByRole('button', { name: 'Start analyse' }).click()
  await expect(page.locator('#analysis-status')).toContainText('invalid-format')
  await expect(page.getByText('Dokumentfeil: invalid-format.', { exact: true })).toBeVisible()
})

for (const field of ['invalid-json', 'sessionId', 'requestId', 'generation', 'reportHash']) {
  test(`2.6 AC2: kontrollert ugyldig 200-retur ${field} gir feil`, async ({ page }) => {
    await enter(page)
    await choose(page)
    await page.route('**/api/analysis', async route => {
      if (field === 'invalid-json') { await route.fulfill({ status: 200, body: 'ikke JSON' }); return }
      const actual = await route.fetch()
      const body = await actual.json()
      if (field === 'reportHash') body.outcome.reportHash = '0'.repeat(64)
      else body.correlation[field] = field === 'generation' ? 999 : 'wrong'
      await route.fulfill({ response: actual, json: body })
    })
    await page.getByRole('button', { name: 'Start analyse' }).click()
    await expect(page.locator('#analysis-status')).toContainText('Analysefeil')
    await expect(page.getByRole('button', { name: /Gå til Kontroller/ })).toHaveCount(0)
    await expect(page.locator('.local-deficiencies')).toContainText('Innhent mer informasjon')
  })
}

test('2.6 AC3: rapportbytte og forlatt pågående analyse forkaster gamle svar og forsøker abort', async ({ page }) => {
  let release!: () => void
  let entered!: () => void
  const held = new Promise<void>(resolve => { release = resolve })
  const requested = new Promise<void>(resolve => { entered = resolve })
  let oldRoute: Route | undefined
  await page.route('**/api/analysis', async route => { oldRoute = route; entered(); await held; await route.fulfill({ json: {} }).catch(() => undefined) })
  await enter(page); await choose(page)
  await page.getByRole('button', { name: 'Start analyse' }).click(); await requested
  await choose(page, 'erstattet.pdf')
  release()
  await expect(page.locator('#analysis-status')).toContainText('Rapport valgt')
  await expect(page.locator('.report-findings')).toHaveCount(0)
  expect(oldRoute).toBeDefined()
  await page.unroute('**/api/analysis')
  await choose(page, 'slow.pdf')
  await page.getByRole('button', { name: 'Start analyse' }).click()
  await expect(page.locator('#analysis-status')).toContainText('Analyserer')
  await page.getByRole('link', { name: /Tallgrunnlag/ }).click()
  await expect(page.locator('#report-announcement')).toContainText('interrupted')
  await page.locator('#next-step').click()
  await expect(page.locator('#analysis-status')).toContainText('interrupted')
  await expect(page.locator('.report-findings')).toHaveCount(0)
})

test('2.6: produksjonsdemo viser faktiske F4-funn uten ekstern trafikk', async ({ page, baseURL }, testInfo) => {
  const external: string[] = []
  page.on('request', request => { if (!request.url().startsWith(baseURL!)) external.push(request.url()) })
  await enter(page, baseURL)
  await page.locator('#report-file').setInputFiles(fileURLToPath(new URL('../fixtures/property-cases/F4-tilstandsrapport.pdf', import.meta.url)))
  await expect(page.locator('#analysis-status')).toContainText('Rapport valgt')
  await page.getByRole('button', { name: 'Start analyse' }).click(); await showList(page)
  await expect(page.locator('.finding-list > li')).toHaveCount(2)
  await expect(page.locator('.finding-list')).toContainText('Alvorlig lekkasje i tak')
  await expect(page.locator('.finding-list')).toContainText('F4-tilstandsrapport.pdf · PDF-side 4')
  expect(external).toEqual([])
  await page.screenshot({ path: testInfo.outputPath('report-f4.png') })
})

test('2.6 AC6: liste utenfor liten arbeidsflate er ikke synlig før den rulles inn', async ({ page }) => {
  await enter(page)
  await choose(page, 'empty.pdf')
  await page.getByRole('button', { name: 'Start analyse' }).click()
  await expect(page.getByRole('button', { name: 'Gå til Kontroller funn' })).toBeVisible()
  await page.setViewportSize({ width: 640, height: 400 })
  await page.getByRole('button', { name: 'Gå til Kontroller funn' }).click()
  await expect(page.getByRole('heading', { name: 'Kontroller funn', exact: true })).toBeFocused()
  await expect(page.locator('.report-findings')).not.toHaveAttribute('data-list-visible-generation')
  await expect(page.locator('#report-announcement')).toContainText('Uttrekk mottatt')
  await page.locator('.report-findings').scrollIntoViewIfNeeded()
  await expect(page.locator('.report-findings')).toHaveAttribute('data-list-visible-generation', /\d+/)
  await expect(page.locator('#report-announcement')).toContainText('funnlisten er klar')
  expect(await page.locator('.workspace').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
})

// Uavhengig fase-3-review: observer det brukeren faktisk ser, ikke bare state.
test('2.6 review AC6: fullført rapporttrinn og én kunngjøring ved tastaturretur', async ({ page }) => {
  await enter(page)
  await choose(page, 'empty.pdf')
  await page.evaluate(() => {
    const node = document.querySelector('#report-announcement')!
    const messages: string[] = []
    ;(window as unknown as { reviewMessages: string[] }).reviewMessages = messages
    new MutationObserver(() => { if (node.textContent) messages.push(node.textContent) }).observe(node, { childList: true, characterData: true, subtree: true })
  })
  const start = page.getByRole('button', { name: 'Start analyse' })
  await start.focus(); await start.press('Space')
  await expect(page.locator('#analysis-status')).toContainText('Uttrekk mottatt')
  await expect(start).toBeFocused()
  const open = page.getByRole('button', { name: 'Gå til Kontroller funn' })
  await open.focus(); await open.press('Enter')
  await expect(page.getByRole('heading', { name: 'Kontroller funn', exact: true })).toBeFocused()
  await expect(page.locator('#report-announcement')).toContainText('funnlisten er klar')
  await expect(page.getByRole('button', { name: /Tilstandsrapport Trinn 2/ })).toContainText('Fullført')
  const back = page.getByRole('button', { name: 'Tilbake til Tilstandsrapport', exact: true })
  await back.focus(); await back.press('Enter')
  await expect(page.getByRole('heading', { name: 'Tilstandsrapport', exact: true })).toBeFocused()
  await open.focus(); await open.press('Enter')
  await expect(page.locator('#report-announcement')).toContainText('funnlisten er klar')
  const messages = await page.evaluate(() => (window as unknown as { reviewMessages: string[] }).reviewMessages)
  expect(messages.filter(text => text === 'Analyse fullført — funnlisten er klar.')).toHaveLength(1)
})

test('2.6 review AC6: kun seksjonskant synlig teller ikke som synlig listestart', async ({ page }) => {
  await enter(page)
  await choose(page, 'empty.pdf')
  await page.getByRole('button', { name: 'Start analyse' }).click()
  await expect(page.getByRole('button', { name: 'Gå til Kontroller funn' })).toBeVisible()
  await page.setViewportSize({ width: 640, height: 400 })
  await page.getByRole('button', { name: 'Gå til Kontroller funn' }).click()
  await expect(page.locator('.report-findings')).not.toHaveAttribute('data-list-visible-generation')
  const geometry = await page.evaluate(async () => {
    const root = document.querySelector('.workspace')!
    const section = document.querySelector('.report-findings')!
    root.scrollTop += section.getBoundingClientRect().top - root.getBoundingClientRect().bottom + 1
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    return { bottom: root.getBoundingClientRect().bottom, titleTop: document.querySelector('#findings-title')!.getBoundingClientRect().top }
  })
  expect(geometry.titleTop).toBeGreaterThan(geometry.bottom)
  await expect(page.locator('.report-findings')).not.toHaveAttribute('data-list-visible-generation')
  await page.evaluate(async () => {
    const root = document.querySelector('.workspace')!
    root.scrollTop += document.querySelector('#findings-title')!.getBoundingClientRect().top - root.getBoundingClientRect().bottom + 1
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  })
  await expect(page.locator('.report-findings')).not.toHaveAttribute('data-list-visible-generation')
  await page.locator('#findings-title').scrollIntoViewIfNeeded()
  await expect(page.locator('.report-findings')).toHaveAttribute('data-list-visible-generation', /\d+/)
})

for (const failure of ['transport', 'invalid-json'] as const) {
  test(`2.6 review AC2/4/6: ${failure} kunngjøres én gang uten retry eller fokusflytting`, async ({ page }) => {
    await enter(page); await choose(page)
    let calls = 0
    await page.route('**/api/analysis', async route => {
      calls++
      if (failure === 'transport') await route.abort('failed')
      else await route.fulfill({ status: 200, body: '{ugyldig' })
    })
    await page.evaluate(() => {
      const node = document.querySelector('#report-announcement')!
      const messages: string[] = []
      ;(window as unknown as { reviewMessages: string[] }).reviewMessages = messages
      new MutationObserver(() => { if (node.textContent) messages.push(node.textContent) }).observe(node, { childList: true, characterData: true, subtree: true })
    })
    const start = page.getByRole('button', { name: 'Start analyse' })
    await start.focus(); await start.press('Enter')
    const code = failure === 'transport' ? 'transport-failure' : 'invalid-response'
    await expect(page.locator('#analysis-status')).toContainText(code)
    await expect(start).toBeFocused()
    await expect(page.locator('.local-deficiencies')).toContainText('Innhent mer informasjon')
    await expect(page.locator('.report-findings')).toHaveCount(0)
    await page.getByRole('link', { name: /Tallgrunnlag/ }).click()
    await page.locator('#next-step').click()
    await expect(page.locator('#analysis-status')).toContainText(code)
    const messages = await page.evaluate(() => (window as unknown as { reviewMessages: string[] }).reviewMessages)
    expect(messages.filter(text => text.includes(`(${code})`))).toHaveLength(1)
    expect(calls).toBe(1)
  })
}

async function originalF4(page: Page, baseURL: string | undefined) {
  await enter(page, baseURL)
  await page.locator('#report-file').setInputFiles(fileURLToPath(new URL('../fixtures/property-cases/F4-tilstandsrapport.pdf', import.meta.url)))
  await expect(page.locator('#analysis-status')).toContainText('Rapport valgt')
  await page.getByRole('button', { name: 'Start analyse' }).click(); await showList(page)
}

test('2.7 AC1/2/5 RT-5: original fysisk side 4, lokale ressurser, hel side/nabo/zoom og beholdt fokus', async ({ page, baseURL }) => {
  const external: string[] = []
  const workers: string[] = []
  let calls = 0
  page.on('request', request => {
    if (!request.url().startsWith(baseURL!)) external.push(request.url())
    if (request.url().includes('pdf.worker')) workers.push(request.url())
    if (request.url().endsWith('/api/analysis')) calls++
  })
  await page.route('**/*', route => route.request().url().startsWith(baseURL!) ? route.continue() : route.abort())
  await originalF4(page, baseURL)
  const finding = page.getByRole('button', { name: 'TG3 · Alvorlig lekkasje i tak', exact: true })
  await finding.focus(); await finding.press('Enter')
  await expect(page.locator('#pdf-status')).toContainText('PDF-side 4: Originalside tilgjengelig')
  await expect(finding).toBeFocused()
  await expect(page.locator('[data-pdf-page="4"]')).toBeVisible()
  await expect(page.locator('.textLayer')).toContainText('Alvorlig lekkasje i tak')
  await expect(page.locator('.textLayer')).toContainText('Trykt side 2')
  await expect(page.locator('.pdf-identity')).toHaveText('F4-tilstandsrapport.pdf · PDF-side 4 av 4')
  await expect(page.getByRole('button', { name: 'Neste PDF-side' })).toBeDisabled()
  await page.getByRole('button', { name: 'Forrige PDF-side' }).click()
  await expect(page.locator('[data-pdf-page="3"]')).toBeVisible()
  await page.getByLabel('PDF-zoom').selectOption('2')
  await expect(page.locator('#pdf-status')).toContainText('Originalside tilgjengelig')
  await expect(page.getByLabel('PDF-zoom')).toHaveValue('2')
  await page.getByLabel('PDF-zoom').selectOption('1')
  await expect(page.locator('#pdf-status')).toContainText('Originalside tilgjengelig')
  const ratio = await page.locator('.source-review').evaluate(element => {
    const [a, b] = [...element.children].map(node => node.getBoundingClientRect())
    return { ratio: a!.width / (a!.width + b!.width), gap: b!.left - a!.right }
  })
  expect(ratio.ratio).toBeCloseTo(0.44, 2); expect(ratio.gap).toBe(24)
  expect(calls).toBe(1); expect(external).toEqual([]); expect(workers.length).toBeGreaterThan(0)
})

test('2.7 AC3/5: smalt panel har headingfokus, fokusfelle, Esc/retur og bevart valg/posisjon', async ({ page, baseURL }) => {
  await page.setViewportSize({ width: 850, height: 700 })
  await originalF4(page, baseURL)
  const finding = page.getByRole('button', { name: 'TG3 · Alvorlig lekkasje i tak', exact: true })
  await finding.click()
  await expect(page.locator('.pdf-viewer')).toHaveCount(0)
  const open = page.getByRole('button', { name: 'Åpne PDF for valgt funn' })
  await open.focus(); await open.press('Enter')
  await expect(page.locator('#pdf-panel-title')).toBeFocused()
  await expect(page.locator('#pdf-status')).toContainText('PDF-side 4: Originalside tilgjengelig')
  await page.locator('#pdf-panel-title').press('Shift+Tab')
  await expect(page.getByRole('region', { name: 'Les originalside, rull ved behov' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Tilbake til funnkontroll', exact: true })).toBeFocused()
  await page.getByRole('button', { name: 'Forrige PDF-side' }).click()
  await expect(page.locator('[data-pdf-page="3"]')).toBeVisible()
  // Native modal-dialog holder tastaturfokus også ved wrap-around.
  await page.getByRole('region', { name: 'Les originalside, rull ved behov' }).focus(); await page.keyboard.press('Tab')
  expect(await page.evaluate(() => document.querySelector('dialog')?.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible(); await expect(open).toBeFocused()
  await expect(finding).toHaveAttribute('aria-pressed', 'true')
  const position = await page.locator('.workspace').evaluate(element => element.scrollTop)
  await open.press('Enter')
  // Panelet åpnes på bevart gjeldende side etter lokal nabosidelesing.
  await expect(page.locator('[data-pdf-page="3"]')).toBeVisible()
  await page.getByRole('button', { name: 'Tilbake til funnkontroll', exact: true }).click()
  await expect(open).toBeFocused()
  expect(await page.locator('.workspace').evaluate(element => element.scrollTop)).toBe(position)
  await expect(page.locator('#report-announcement')).toHaveText('Analyse fullført — funnlisten er klar.')
})

test('2.7 AC4 RT-7/8: usikker kilde gjettes ikke og workerfeil er synlig uten ny analyse', async ({ page }) => {
  await enter(page); await choose(page, 'uncertain.pdf')
  await page.getByRole('button', { name: 'Start analyse' }).click(); await showList(page)
  await page.getByRole('button', { name: 'Usikkert funn · Usikker vegg', exact: true }).click()
  await expect(page.locator('#pdf-status')).toContainText('PDF-side ukjent: Kildens PDF-side er ikke kjent')
  await expect(page.locator('[data-pdf-page]')).toHaveCount(0)
  await page.route('**/pdf.worker*', route => route.abort())
  // Ny worker etter unmount, beholdt økt/uttrekk og original.
  await page.getByRole('button', { name: 'Tilbake til Tilstandsrapport', exact: true }).click()
  await showList(page)
  await page.getByRole('button', { name: 'TG3 · Kontrollert lekkasje', exact: true }).click()
  await expect(page.locator('#pdf-status')).toContainText('Original-PDF kunne ikke åpnes')
  await expect(page.locator('[data-pdf-page]')).toHaveCount(0)
  await expect(page.locator('#analysis-status')).toContainText('Analyse fullført')
})

test('2.7 race: raske funn-/sidebytter presenterer bare gjeldende canvas og originalen kan gjenbrukes', async ({ page, baseURL }) => {
  await originalF4(page, baseURL)
  const a = page.getByRole('button', { name: 'TG2 · Slitt overflate på baderomsgulv', exact: true })
  const b = page.getByRole('button', { name: 'TG3 · Alvorlig lekkasje i tak', exact: true })
  await b.click(); await expect(page.locator('[data-pdf-page="4"]')).toBeVisible()
  await page.evaluate(() => {
    const original = window.requestAnimationFrame.bind(window)
    const pending: FrameRequestCallback[] = []
    window.requestAnimationFrame = callback => { pending.push(callback); return 0 }
    ;(window as unknown as { releasePdfFrames: () => void }).releasePdfFrames = () => {
      window.requestAnimationFrame = original
      for (const callback of pending) original(callback)
    }
  })
  await a.evaluate(element => (element as HTMLButtonElement).click())
  await expect(page.locator('#pdf-status')).toContainText('PDF-side 2: Laster originalside')
  await expect(page.locator('[data-pdf-page]')).toHaveCount(0)
  await b.evaluate(element => (element as HTMLButtonElement).click())
  await expect(page.locator('#pdf-status')).toContainText('PDF-side 4: Laster originalside')
  await expect(page.locator('[data-pdf-page]')).toHaveCount(0)
  await a.evaluate(element => (element as HTMLButtonElement).click())
  await page.evaluate(() => (window as unknown as { releasePdfFrames: () => void }).releasePdfFrames())
  await expect(page.locator('[data-pdf-page="2"]')).toBeVisible()
  await expect(page.locator('[data-pdf-page="4"]')).toHaveCount(0)
  await expect(page.locator('.textLayer')).toContainText('Slitt overflate')
  await page.getByRole('button', { name: 'Tilbake til Tilstandsrapport', exact: true }).click()
  await showList(page)
  await expect(a).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-pdf-page="2"]')).toBeVisible()
})

test('2.7 AC4: faktisk renderfeil skjuler gammel side, beholder dokument/side og starter ikke analyse', async ({ page, baseURL }) => {
  await originalF4(page, baseURL)
  await page.getByRole('button', { name: 'TG3 · Alvorlig lekkasje i tak', exact: true }).click()
  await expect(page.locator('[data-pdf-page="4"]')).toBeVisible()
  await page.evaluate(() => {
    HTMLCanvasElement.prototype.getContext = () => { throw new Error('Kontrollert canvasfeil') }
  })
  await page.getByRole('button', { name: 'Forrige PDF-side' }).click()
  await expect(page.locator('#pdf-status')).toContainText('F4-tilstandsrapport.pdf · PDF-side 3: Originalside kunne ikke vises')
  await expect(page.locator('[data-pdf-page]')).toHaveCount(0)
  await expect(page.locator('#analysis-status')).toHaveText('Analyse fullført — funnlisten er klar.')
})

test('2.7 AC4 RT-7: kjent men ugyldig kildeside viser faktisk mangel uten gjettet navigasjon', async ({ page }) => {
  await enter(page); await choose(page, 'invalid-page.pdf')
  await page.getByRole('button', { name: 'Start analyse' }).click(); await showList(page)
  await page.getByRole('button', { name: 'Usikkert funn · Kontrollert lekkasje', exact: true }).click()
  await expect(page.locator('#pdf-status')).toContainText('PDF-side 999: Oppgitt PDF-side er utenfor originaldokumentet')
  await expect(page.locator('[data-pdf-page]')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Forrige PDF-side' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Neste PDF-side' })).toBeDisabled()
})

test('2.7 cleanup/lasting: ventende worker gir ærlig status og frigjøres ved trinnretur', async ({ page, baseURL }) => {
  let release!: () => void
  const held = new Promise<void>(resolve => { release = resolve })
  await page.route('**/pdf.worker*', async route => { await held; await route.continue().catch(() => undefined) })
  await originalF4(page, baseURL)
  const finding = page.getByRole('button', { name: 'TG3 · Alvorlig lekkasje i tak', exact: true })
  await finding.click()
  await expect(page.locator('#pdf-status')).toContainText('PDF-side 4: Laster original-PDF')
  await expect(page.locator('[data-pdf-page]')).toHaveCount(0)
  await expect(finding).toBeFocused()
  await page.getByRole('button', { name: 'Tilbake til Tilstandsrapport', exact: true }).click()
  release()
  await expect(page.locator('.pdf-viewer')).toHaveCount(0)
  await expect.poll(() => page.workers().length).toBe(0)
  await showList(page)
  await expect(page.locator('[data-pdf-page="4"]')).toBeVisible()
  await page.getByRole('button', { name: 'Tilbake til Tilstandsrapport', exact: true }).click()
  await expect.poll(() => page.workers().length).toBe(0)
})

test('2.7 visuell QA: 1440, 1280, smalt panel og sterk zoom bevarer kilder/kontroller', async ({ page, baseURL }, testInfo) => {
  await originalF4(page, baseURL)
  await page.getByRole('button', { name: 'TG3 · Alvorlig lekkasje i tak', exact: true }).click()
  for (const [width, height] of [[1440, 900], [1280, 800]]) {
    await page.setViewportSize({ width: width!, height: height! })
    await expect(page.locator('[data-pdf-page="4"]')).toBeVisible()
    await page.locator('.source-review').scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath(`original-${width}.png`) })
    expect(await page.locator('.workspace').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
  }
  for (const [width, height] of [[850, 700], [320, 400]]) {
    await page.setViewportSize({ width: width!, height: height! })
    const open = page.getByRole('button', { name: 'Åpne PDF for valgt funn' })
    await open.click()
    await expect(page.locator('#pdf-panel-title')).toBeFocused()
    await expect(page.locator('[data-pdf-page="4"]')).toBeVisible()
    await page.getByLabel('PDF-zoom').selectOption('2')
    await expect(page.locator('#pdf-status')).toContainText('Originalside tilgjengelig')
    expect(await page.locator('dialog').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`panel-${width}.png`) })
    await page.keyboard.press('Escape'); await expect(open).toBeFocused()
    expect(await page.locator('.workspace').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
  }
})

test('2.7 kontrakt: usikker grad med kjent kilde og utelatt valgfri originalhash viser riktig originalside', async ({ page }) => {
  await enter(page); await choose(page, 'uncertain-source.pdf')
  await page.getByRole('button', { name: 'Start analyse' }).click(); await showList(page)
  await page.getByRole('button', { name: 'Usikkert funn · Kontrollert lekkasje', exact: true }).click()
  await expect(page.locator('#pdf-status')).toContainText('uncertain-source.pdf · PDF-side 2: Originalside tilgjengelig')
  await expect(page.locator('[data-pdf-page="2"]')).toBeVisible()
  await expect(page.locator('.textLayer')).toContainText('Slitt overflate')
})

test('2.7 uavhengig review: terminal renderfeil avslutter busy og ny naboside kan vises', async ({ page, baseURL }) => {
  await originalF4(page, baseURL)
  await page.getByRole('button', { name: 'TG3 · Alvorlig lekkasje i tak', exact: true }).click()
  await expect(page.locator('[data-pdf-page="4"]')).toBeVisible()
  await page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (...args: Parameters<typeof original>) {
      HTMLCanvasElement.prototype.getContext = original
      throw new Error(`Kontrollert engangsfeil ${args[0]}`)
    } as typeof original
  })
  await page.getByRole('button', { name: 'Forrige PDF-side' }).click()
  await expect(page.locator('#pdf-status')).toContainText('PDF-side 3: Originalside kunne ikke vises')
  await expect(page.locator('.pdf-scroll')).toHaveAttribute('aria-busy', 'false')
  await expect(page.locator('[data-pdf-page]')).toHaveCount(0)
  await page.getByRole('button', { name: 'Forrige PDF-side' }).click()
  await expect(page.locator('[data-pdf-page="2"]')).toBeVisible()
  await expect(page.locator('.textLayer')).toContainText('Slitt overflate')
})

test('2.7 uavhengig review: Hel side passer i leseregion og 1199/1200-grensen bevarer kilde', async ({ page, baseURL }, testInfo) => {
  await originalF4(page, baseURL)
  const finding = page.getByRole('button', { name: 'TG3 · Alvorlig lekkasje i tak', exact: true })
  await finding.focus(); await finding.press('Enter')
  for (const [width, height] of [[1440, 900], [1280, 800], [1200, 650]]) {
    await page.setViewportSize({ width: width!, height: height! })
    await expect(page.locator('[data-pdf-page="4"]')).toBeVisible()
    await expect(finding).toBeFocused()
    await expect.poll(() => page.locator('.pdf-scroll').evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(2)
    await expect.poll(() => page.locator('.pdf-scroll').evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(2)
    await page.locator('.pdf-scroll').scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath(`review-hel-side-${width}.png`) })
  }
  await page.setViewportSize({ width: 1199, height: 650 })
  await expect(page.locator('.pdf-viewer')).toHaveCount(0)
  await page.getByRole('button', { name: 'Åpne PDF for valgt funn' }).click()
  await expect(page.locator('[data-pdf-page="4"]')).toBeVisible()
  await expect(page.locator('#pdf-panel-title')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Åpne PDF for valgt funn' })).toBeFocused()
  await expect(finding).toHaveAttribute('aria-pressed', 'true')
})

test('2.7 uavhengig review: rapportbytte under ventende render frigjør gammel original og nullstiller visning', async ({ page, baseURL }) => {
  await originalF4(page, baseURL)
  await page.getByRole('button', { name: 'TG3 · Alvorlig lekkasje i tak', exact: true }).click()
  await expect(page.locator('[data-pdf-page="4"]')).toBeVisible()
  await page.evaluate(() => {
    const original = window.requestAnimationFrame.bind(window)
    const pending: FrameRequestCallback[] = []
    window.requestAnimationFrame = callback => { pending.push(callback); return 0 }
    ;(window as unknown as { releaseReviewFrames: () => void }).releaseReviewFrames = () => {
      window.requestAnimationFrame = original
      for (const callback of pending) original(callback)
    }
  })
  await page.getByRole('button', { name: 'TG2 · Slitt overflate på baderomsgulv', exact: true }).evaluate(element => (element as HTMLButtonElement).click())
  await expect(page.locator('#pdf-status')).toContainText('PDF-side 2: Laster originalside')
  await page.getByRole('button', { name: 'Tilbake til Tilstandsrapport', exact: true }).click()
  await choose(page, 'F1-tilstandsrapport.pdf')
  await page.evaluate(() => (window as unknown as { releaseReviewFrames: () => void }).releaseReviewFrames())
  await expect.poll(() => page.workers().length).toBe(0)
  await expect(page.locator('.pdf-viewer')).toHaveCount(0)
  await page.getByRole('button', { name: 'Start analyse' }).click(); await showList(page)
  await expect(page.locator('.finding-select[aria-pressed="true"]')).toHaveCount(0)
  await expect(page.locator('.source-original')).toHaveText('Velg et funn for å vise originalkilden.')
  await page.locator('.finding-select').first().click()
  await expect(page.locator('#pdf-status')).toContainText('F1-tilstandsrapport.pdf')
  await expect(page.locator('#pdf-status')).toContainText('Originalside tilgjengelig')
  await expect(page.locator('.textLayer')).not.toContainText('Alvorlig lekkasje i tak')
})
