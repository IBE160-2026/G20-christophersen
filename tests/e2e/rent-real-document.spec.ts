import { test, expect } from '@playwright/test'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { writeFile } from 'node:fs/promises'
import { RentEstimateSchema } from '../../src/contracts/rent-estimate.ts'
import { DocumentImportSchema } from '../../src/contracts/document-import.ts'

const original = fileURLToPath(new URL('../../private/incoming/new-salgsoppgave.pdf', import.meta.url))
test('ekte PDF: dokumentopplysninger leses automatisk og enebolig får ærlig modellbegrensning', async ({ page }, info) => {
  test.skip(!existsSync(original), 'Valgfri ekte PDF distribueres ikke i Git. Syntetiske uttrekks- og leietester kjører alltid.')
  test.setTimeout(120_000)
  const paid: string[] = [], errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  for (const endpoint of ['document-economy/run', 'analysis']) await page.route(`**/api/${endpoint}`, route => { paid.push(endpoint); return route.abort() })
  await page.goto('/')
  const importResponse = page.waitForResponse(response => response.url().endsWith('/api/document-import') && response.request().method() === 'POST', { timeout: 90_000 })
  const rentResponse = page.waitForResponse(response => response.url().endsWith('/api/rent-estimate') && response.request().method() === 'POST', { timeout: 90_000 })
  await page.locator('#import-file-prospectus').setInputFiles(original)
  const [imported, rental] = await Promise.all([importResponse, rentResponse])
  expect(imported.ok()).toBe(true); expect(rental.ok()).toBe(true)
  const importedBody = await imported.json(), outcome = DocumentImportSchema.parse(importedBody.outcome)
  const result = RentEstimateSchema.parse(await rental.json())
  expect(outcome.reportHash).toBe('3d0db0a7e84fb863bdeff1bd3390e833bd8fa151be8cbc3709835062d51ab49c')
  expect(result.property).toMatchObject({ municipality: { value: 'Bergen' }, area: { value: 196, basis: 'BRA-i' }, rooms: { value: 3 }, propertyType: { value: 'unsupported' } })
  expect(result.property.address?.value).toBeTruthy(); expect(result.property.address?.value).not.toMatch(/Postnr|Oppdragsnummer/)
  expect(result.property.issues.join(' ')).not.toMatch(/mangler|Motstridende|Ugyldig/)
  for (const field of [result.property.address, result.property.municipality, result.property.area, result.property.rooms, result.property.propertyType]) {
    expect(field?.sources.length).toBeGreaterThan(0)
    for (const source of field!.sources) {
      expect(source.documentHash).toBe(outcome.reportHash)
      expect(outcome.pages[source.pdfPage - 1]!.text.slice(source.start, source.end)).toBe(source.quote)
    }
  }
  expect(result).toMatchObject({ status: 'unavailable', monthly: null, annual: null, observations: [] })
  const panel = page.getByRole('region', { name: 'Forventet leie.' })
  await expect(panel.getByRole('heading', { name: 'Boligopplysninger fra dokumentet' })).toBeVisible()
  await expect(panel).toContainText('196 m² BRA-i'); await expect(panel).toContainText('Enebolig')
  await expect(panel.getByRole('heading', { name: 'Hvorfor markedsestimatet mangler' })).toBeVisible()
  await expect(panel).toContainText('ingen SSB-celle brukes som leie for hele objektet')
  await expect(page.getByTestId('rent-monthly')).toHaveCount(0)
  await expect(page.getByTestId('scenario-gross')).toContainText('—')
  const area = panel.locator('.source-summary > div').filter({ has: page.locator('dt', { hasText: /^Areal$/ }) })
  await area.getByRole('button', { name: /PDF-side/ }).first().click()
  await expect(page.locator('.pdf-viewer')).toBeVisible()
  const sourcePage = result.property.area!.sources[0]!.pdfPage
  await expect(page.locator(`[data-pdf-page="${sourcePage}"]`)).toBeVisible()
  await page.keyboard.press('Escape')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(panel.getByRole('heading', { name: 'Hvorfor markedsestimatet mangler' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: info.outputPath('ekte-leiegrunnlag-mobile.png'), fullPage: true })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.screenshot({ path: info.outputPath('ekte-leiegrunnlag-desktop.png'), fullPage: true })
  await writeFile(info.outputPath('ekte-leiegrunnlag.json'), JSON.stringify({ import: importedBody, rent: result }, null, 2))
  expect(paid).toEqual([]); expect(errors).toEqual([])
})

test('gratis SSB-nettprøve: støttet kompakt leilighet gir synlig estimat gjennom faktisk HTTP-rute', async ({ page }, info) => {
  test.skip(process.env.PAA_TEST_SSB_NETWORK !== '1', 'Sett PAA_TEST_SSB_NETWORK=1 for eksplisitt gratis nettprøve. Deterministiske tester krever ikke SSB-nett.')
  test.setTimeout(90_000)
  const { newProspectusPdf } = await import('../helpers/new-prospectus-pdf.ts')
  const paid: string[] = []
  for (const endpoint of ['document-economy/run', 'analysis']) await page.route(`**/api/${endpoint}`, route => { paid.push(endpoint); return route.abort() })
  await page.goto('/')
  const response = page.waitForResponse(item => item.url().endsWith('/api/rent-estimate') && item.request().method() === 'POST', { timeout: 60_000 })
  await page.locator('#import-file-prospectus').setInputFiles({ name: 'syntetisk-kompakt-leilighet.pdf', mimeType: 'application/pdf', buffer: newProspectusPdf([
    'Fasitveien 4', '5001 BERGEN', 'SALGSOBJEKT Leilighet', 'BRA-I/ BRA TOTAL 50/ 55 kvm', 'ANTALL ROM 2', 'Gnr. 1, bnr. 2 i Bergen kommune.', 'Prisantydning: 3 000 000 kr', 'Fellesgjeld: 0 kr',
  ]) })
  const http = await response; expect(http.ok()).toBe(true)
  const rent = RentEstimateSchema.parse(await http.json())
  expect(rent.status).toBe('estimated'); expect(rent.property.area?.value).toBe(50); expect(rent.property.rooms?.value).toBe(2)
  expect(rent.observations.map(item => item.zoneCode).sort()).toEqual(['03.01', '03.02'])
  expect(rent.observations.every(item => item.sizeCode === '2.050')).toBe(true)
  const panel = page.getByRole('region', { name: 'Forventet leie.' })
  await expect(panel.getByTestId('rent-monthly')).toBeVisible()
  await expect(page.getByTestId('scenario-gross')).not.toContainText('—')
  await expect(panel).toContainText('fra dokumentet'); await expect(panel).toContainText('ikke dokumentert leie')
  await panel.locator('summary').click(); await expect(panel).toContainText(rent.statisticsYear!)
  await page.screenshot({ path: info.outputPath('ekte-ssb-syntetisk-leilighet.png'), fullPage: true })
  await writeFile(info.outputPath('ekte-ssb-syntetisk-leilighet.json'), JSON.stringify(rent, null, 2))
  expect(paid).toEqual([])
})
