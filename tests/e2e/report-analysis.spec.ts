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
