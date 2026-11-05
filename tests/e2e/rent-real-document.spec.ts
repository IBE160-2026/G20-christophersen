import { createHash } from 'node:crypto'
import { test, expect } from '@playwright/test'
import type { TestInfo, Page } from '@playwright/test'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { writeFile } from 'node:fs/promises'
import { RentEstimateSchema } from '../../src/contracts/rent-estimate.ts'
import ssbSnapshot from '../fixtures/ssb/09897-2025.json' with { type: 'json' }
import { DocumentImportSchema } from '../../src/contracts/document-import.ts'

async function assertAnalysisLayout(page: Page, coverPhoto: boolean) {
  await expect(page.locator('#listing-url, #listing-alternative-toggle')).toHaveCount(0)
  await expect(page.locator('#investment .document-economy')).toBeVisible()
  await expect(page.locator('#investment .finance-panel')).toBeVisible()
  expect(await page.locator('main').innerText()).not.toContain('SSB')
  expect(await page.evaluate(() => {
    const nodes = ['.hero', '#investment', '#legal-risk', '#technical-risk', '.analysis-documentation'].map(selector => document.querySelector(selector)!)
    return nodes.every((node, index) => index === 0 || Boolean(nodes[index - 1]!.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING))
  })).toBe(true)
  if (coverPhoto) await expect(page.locator('.hero canvas[data-preview-kind="image"]')).toBeVisible({ timeout: 15_000 })
  else {
    await expect(page.getByText('Boligfoto kunne ikke identifiseres sikkert.')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('.hero canvas')).toHaveCount(0)
  }
  await expect(page.locator('#legal-risk')).toContainText('Korttidsutleie: inntil 60 døgn')
}

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
  const panel = page.getByRole('region', { name: 'Leieinntekt' })
  await expect(panel.getByTestId('rent-monthly')).not.toBeVisible()
  await panel.locator('.rent-estimate-evidence > summary').click()
  await expect(panel.getByRole('heading', { name: 'Boligopplysninger fra dokumentet' })).toBeVisible()
  await expect(panel).toContainText('196 m² BRA-i'); await expect(panel).toContainText('Enebolig')
  await expect(panel.getByRole('heading', { name: 'Intern kontrollkilde · SSB' })).toBeVisible()
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
  await expect(panel.getByRole('heading', { name: 'Intern kontrollkilde · SSB' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: info.outputPath('ekte-leiegrunnlag-mobile.png'), fullPage: true })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.screenshot({ path: info.outputPath('ekte-leiegrunnlag-desktop.png'), fullPage: true })
  await writeFile(info.outputPath('ekte-leiegrunnlag.json'), JSON.stringify({ import: importedBody, rent: result }, null, 2))
  expect(paid).toEqual([]); expect(errors).toEqual([])
})

test('lokalt leiegrunnlag: støttet kompakt leilighet gir synlig referanse gjennom faktisk HTTP-rute', async ({ page }, info) => {
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
  const panel = page.getByRole('region', { name: 'Leieinntekt' })
  await expect(panel.getByTestId('rent-monthly')).not.toBeVisible()
  await panel.locator('.rent-estimate-evidence > summary').click()
  await expect(panel.getByTestId('rent-monthly')).toBeVisible()
  await expect(page.getByTestId('scenario-gross')).not.toContainText('—')
  await expect(panel).toContainText('fra dokumentet'); await expect(panel).toContainText('Ingen dokumentert faktisk leie')
  await expect(panel.locator('.rent-estimate-evidence')).toContainText('Publiserte referanser')
  await expect(panel.locator('.rent-estimate-evidence td').first()).toContainText('Aktive kontrakter')
  await expect(panel).toContainText(rent.statisticsYear!)
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await panel.screenshot({ path: info.outputPath('lokale-referanser-mobil.png') })
  await page.screenshot({ path: info.outputPath('ekte-ssb-syntetisk-leilighet.png'), fullPage: true })
  await writeFile(info.outputPath('ekte-ssb-syntetisk-leilighet.json'), JSON.stringify(rent, null, 2))
  expect(paid).toEqual([])
})

const nordvik = fileURLToPath(new URL('../../private/incoming/nordvik-rostockgata-96.pdf', import.meta.url))
const displayedAmount = (value: number) => new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(value).replaceAll('\u00a0', ' ')

/** Uavhengig fasit: arkivert originalcelle, ingen produksjonsberegning eller nett. */
async function nordvikLocalExpected(info: TestInfo) {
  const raw = ssbSnapshot.value[ssbSnapshot.dimension.Soner2.category.index['01.02'] * 25 + ssbSnapshot.dimension.AntRomBRA.category.index['3.060']]!
  expect(raw).toBe(18900)
  const monthly = Math.round(raw / 100) * 100, annual = monthly * 12
  const expected = { year: '2025', sourceUpdated: ssbSnapshot.updated, raw, monthly, annual, low: monthly, high: monthly,
    grossYield: new Intl.NumberFormat('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(annual / 8_600_000 * 100) }
  await writeFile(info.outputPath('nordvik-expected-local-audit.json'), JSON.stringify(expected, null, 2))
  return expected
}

test('ekte Nordvik: alle 170 sider, kildebelagt 59→60-leieestimat og ubekreftet økonomi gjennom HTTP', async ({ page }, info) => {
  const required = process.env.PAA_TEST_NORDVIK_REQUIRED === '1'
  test.skip(!existsSync(nordvik) && !required, 'Privat original distribueres ikke i Git. PAA_TEST_NORDVIK_REQUIRED=1 krever denne prøven uten skip.')
  expect(existsSync(nordvik), 'Obligatorisk Nordvik-original må være tilgjengelig lokalt').toBe(true)
  test.setTimeout(120_000)
  const expected = await nordvikLocalExpected(info)
  const errors: string[] = [], paid: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  for (const endpoint of ['document-economy/run', 'analysis']) await page.route(`**/api/${endpoint}`, route => { paid.push(endpoint); return route.abort() })
  await page.goto('/')
  const imported = page.waitForResponse(response => response.url().endsWith('/api/document-import') && response.request().method() === 'POST', { timeout: 90_000 })
  const rented = page.waitForResponse(response => response.url().endsWith('/api/rent-estimate') && response.request().method() === 'POST', { timeout: 100_000 })
  await page.locator('#import-file-prospectus').setInputFiles(nordvik)
  const [http, rentHttp] = await Promise.all([imported, rented])
  expect(http.ok()).toBe(true); expect(rentHttp.ok()).toBe(true)
  const body = await http.json(), outcome = DocumentImportSchema.parse(body.outcome)
  const rent = RentEstimateSchema.parse(await rentHttp.json())
  expect(outcome.reportHash).toBe('3e2dd467c11785c1de7c8c79b8e5f58f786e87416f7dc9b14f7a2d713ec6cb70')
  expect(outcome.pageCount).toBe(170)
  expect(outcome.pages.map(item => item.pdfPage)).toEqual(Array.from({ length: 170 }, (_, index) => index + 1))
  expect(outcome.sections.map(section => [section.startPage, section.endPage])).toEqual([[36, 54]])
  expect(outcome.visualAnalysis?.pages.map(item => item.pdfPage)).toEqual(Array.from({ length: 19 }, (_, index) => index + 36))
  expect(outcome.visualAnalysis?.pages.every(item => item.rasterDigest !== null && item.error === null && item.lines.length > 0)).toBe(true)
  const graphicalDetail = outcome.visualAnalysis!.pages.find(item => item.pdfPage === 43)!
  expect(graphicalDetail.lines.some(line => /Vinduer|Ytterdører/i.test(line.text))).toBe(true)
  expect(graphicalDetail.symbols.length).toBeGreaterThan(0)
  expect(outcome.coverage.technical.status).toBe('incomplete')
  expect(rent.property).toMatchObject({ municipality: { value: 'Oslo' }, district: { value: 'Gamle Oslo' }, area: { value: 59, basis: 'BRA-i' }, rooms: { value: 3 }, bedrooms: { value: 2 }, propertyType: { value: 'apartment' }, issues: [] })
  expect(rent.property.district!.sources).toEqual(expect.arrayContaining([expect.objectContaining({ pdfPage: 117, quote: expect.stringContaining('Bydel: 1 Gamle Oslo') })]))
  expect(outcome.economy.fields.find(field => field.id === 'price')).toMatchObject({ status: 'available', amount: '8600000' })
  expect(outcome.economy.fields.find(field => field.id === 'commonCosts')).toMatchObject({ status: 'available', amount: '3660', period: 'month' })
  expect(outcome.economy.fields.find(field => field.id === 'commonCosts')!.sources).toEqual(expect.arrayContaining([expect.objectContaining({ pdfPage: 27, quote: 'Det er målere i hver leilighet for varme/varmtvann som\navregnes en gang i året, pr. 31.12.' })]))
  for (const field of [rent.property.address, rent.property.municipality, rent.property.district, rent.property.area, rent.property.rooms, rent.property.bedrooms, rent.property.propertyType]) {
    expect(field?.sources.length).toBeGreaterThan(0)
    for (const source of field!.sources) {
      expect(source.documentHash).toBe(outcome.reportHash)
      expect(outcome.pages[source.pdfPage - 1]!.text.slice(source.start, source.end)).toBe(source.quote)
    }
  }
  for (const field of outcome.economy.fields) for (const source of field.sources) expect(outcome.pages[source.pdfPage - 1]!.text.slice(source.start, source.end)).toBe(source.quote)
  expect(rent).toMatchObject({ status: 'estimated', monthly: String(expected.monthly), annual: String(expected.annual), low: String(expected.low), high: String(expected.high), statisticsYear: expected.year, sourceUpdated: expected.sourceUpdated,
    areaMethod: { kind: 'nearest-boundary', documentArea: 59, lowerArea: 60, upperArea: 60, weight: '0' } })
  expect(rent.observations).toEqual([expect.objectContaining({ zoneCode: '01.02', sizeCode: '3.060', area: 60, monthly: String(expected.raw) })])
  expect(rent.formula).toContain('59 → 60 m²; referanseverdi uendret')
  expect(rent.limitations.join(' ')).toContain('Ingen prosentmargin')
  expect(rent.marketEstimate).toMatchObject({ status: 'unavailable', monthly: null })
  expect(rent.published.selectedReferenceId).toBe('hybel-q3-2026-gamle-oslo-3')
  await assertAnalysisLayout(page, true)
  const panel = page.getByRole('region', { name: 'Leieinntekt' })
  await expect(panel.getByTestId('rent-monthly')).not.toBeVisible()
  await panel.locator('.rent-estimate-evidence > summary').click()
  await expect(panel).toContainText('Selveierleilighet')
  await expect(panel).toContainText('59 m² BRA-i')
  await expect(panel.getByTestId('rent-area-approximation')).toContainText('59 → 60 m²')
  await expect(panel.getByTestId('rent-published-monthly')).toHaveText('20 426 kr/mnd')
  await expect(panel.locator('.rent-published-references')).toContainText('individuell markedsleie er ikke beregnet')
  await expect(panel.getByTestId('rent-monthly')).toHaveText(`${displayedAmount(expected.monthly)} kr`)
  await expect(panel.getByTestId('rent-interval')).toHaveText(`${displayedAmount(expected.low)}–${displayedAmount(expected.high)} kr/mnd`)
  await expect(panel).toContainText('01.02'); await expect(panel).toContainText(`Brukes automatisk i ubekreftet økonomiscenario for ${expected.year}`)
  await expect(page.getByTestId('scenario-gross')).toContainText(expected.grossYield)
  await expect(page.getByTestId('scenario-preliminary-net')).toContainText(new Intl.NumberFormat('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((expected.annual - 43920) / 8600000 * 100))
  await page.locator('.scenario-basis > summary').evaluate(element => { (element.parentElement as HTMLDetailsElement).open = true })
  await expect(page.getByTestId('scenario-preliminary-formula')).toContainText(displayedAmount(expected.annual - 43920))
  await page.locator('.scenario-basis > summary').evaluate(element => { (element.parentElement as HTMLDetailsElement).open = true })
  await expect(page.getByTestId('scenario-preliminary-formula')).toContainText('43 920')
  await expect(page.locator('.scenario-basis')).toContainText('Kostnadsår: ukjent')
  await expect(panel.locator('.rent-estimate-evidence')).toContainText('Publiserte referanser')
  await expect(panel.locator('.rent-estimate-evidence')).toContainText('15 510')
  await expect(panel.locator('.rent-estimate-evidence')).toContainText('kontekst')
  await expect(panel).toContainText('3.060'); await expect(panel).toContainText('Ingen prosentmargin')
  await expect(panel.getByRole('link', { name: /Se SSBs opprinnelige datagrunnlag/ })).toHaveAttribute('href', new RegExp(`valueCodes%5BTid%5D=${expected.year}`))
  // Urørt dokumentøkonomi gir automatisk P og bare en avgrenset foreløpig netto.
  expect(outcome.economy.fields.find(field => field.id === 'sharedDebt')).toMatchObject({ status: 'available', amount: '0' })
  await expect(page.locator('.document-economy')).toContainText('Seksjonen har ingen gjeld per. 26.10.2026')
  await expect(page.getByTestId('scenario-net')).toContainText('—')
  await expect(page.getByTestId('scenario-cash')).toContainText('—')
  for (const [id, label, displayed] of [['price', 'Prisantydning', '8 600 000,00 kr'], ['commonCosts', 'Felleskostnader', '3 660,00 kr'], ['sharedDebt', 'Fellesgjeld', '0,00 kr']] as const) {
    const row = page.locator('.document-economy-fields > div').filter({ has: page.locator('dt', { hasText: new RegExp(`^${label}$`) }) })
    await expect(row.locator('dd > strong')).toHaveText(displayed)
    if (id === 'commonCosts') await expect(row).toContainText('måned')
    await row.locator('summary').click()
    const sources = outcome.economy.fields.find(field => field.id === id)!.sources
    expect(sources.length).toBeGreaterThan(0)
    for (const [index, source] of sources.entries()) {
      const evidence = row.locator('.document-economy-source').nth(index)
      await expect(evidence.locator('q')).toHaveText(source.quote)
      await evidence.getByRole('button', { name: 'Åpne originalside ↗', exact: true }).click()
      await expect(page.locator(`[data-pdf-page="${source.pdfPage}"]`)).toBeVisible()
      await page.keyboard.press('Escape')
      await expect.poll(() => page.workers().length).toBe(0)
    }
  }
  const bedrooms = panel.locator('.source-summary > div').filter({ has: page.locator('dt', { hasText: /^Soverom$/ }) })
  await expect(bedrooms.locator('dd')).toContainText('2')
  const district = panel.locator('.source-summary > div').filter({ has: page.locator('dt', { hasText: /^Bydel$/ }) })
  await district.getByRole('button', { name: /PDF-side 117/ }).click()
  await expect(page.locator('[data-pdf-page="117"]')).toBeVisible()
  await page.keyboard.press('Escape')
  const area = panel.locator('.source-summary > div').filter({ has: page.locator('dt', { hasText: /^Areal$/ }) })
  await area.getByRole('button', { name: /PDF-side/ }).first().click()
  const sourcePage = rent.property.area!.sources[0]!.pdfPage
  await expect(page.locator(`[data-pdf-page="${sourcePage}"]`)).toBeVisible()
  // Retain old DOM references only in this test to prove backing stores are
  // explicitly released, independently of browser GC timing.
  await page.evaluate(() => { (window as unknown as { discardedPdfCanvas: HTMLCanvasElement }).discardedPdfCanvas = document.querySelector('.pdf-page canvas')! })
  for (let offset = 1; offset <= 3; offset++) {
    await page.getByRole('button', { name: 'Neste PDF-side', exact: true }).evaluate(element => (element as HTMLButtonElement).click())
    await expect(page.locator('#pdf-status')).toContainText(`PDF-side ${sourcePage + offset}:`)
  }
  await page.getByLabel('PDF-zoom').selectOption('2')
  await page.getByLabel('PDF-zoom').selectOption('1')
  await expect(page.locator(`[data-pdf-page="${sourcePage + 3}"]`)).toBeVisible()
  await expect(page.locator('.pdf-page canvas')).toHaveCount(1)
  await expect.poll(() => page.evaluate(() => {
    const canvas = (window as unknown as { discardedPdfCanvas: HTMLCanvasElement }).discardedPdfCanvas
    return [canvas.width, canvas.height]
  })).toEqual([0, 0])
  await page.keyboard.press('Escape')
  await expect.poll(() => page.workers().length).toBe(0)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(panel.getByRole('heading', { name: 'Boligopplysninger fra dokumentet' })).toBeVisible()
  await expect(panel.getByTestId('rent-monthly')).toHaveText(`${displayedAmount(expected.monthly)} kr`)
  await expect(panel.getByTestId('rent-area-approximation')).toContainText('59 → 60 m²')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await panel.screenshot({ path: info.outputPath('nordvik-references-mobile.png') })
  await page.screenshot({ path: info.outputPath('nordvik-mobile.png'), fullPage: true })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.screenshot({ path: info.outputPath('nordvik-desktop.png'), fullPage: true })
  // Begge registreringsmåter skal ha forrang foran den automatiske, fortsatt synlige leien.
  await page.getByTestId('open-financial-basis').click()
  await page.locator('#value-L').fill('240000')
  await page.locator('#period-L').selectOption('year')
  await page.locator('#year-L').fill(expected.year)
  await page.locator('#source-kind-L').selectOption('assumption')
  await page.locator('#source-L').fill('Egen forventning til leie')
  await page.locator('#rent-nature-L').selectOption('expected')
  await page.getByRole('button', { name: '← Tilbake til investeringsoversikten' }).click()
  await expect(page.getByTestId('scenario-gross')).toContainText('2,79')
  await panel.locator('.rent-estimate-evidence > summary').click()
  await expect(panel).toContainText('erstatter ikke registrert leie')
  await expect(panel.getByTestId('rent-monthly')).toHaveText(`${displayedAmount(expected.monthly)} kr`)
  await page.getByTestId('open-financial-basis').click()
  await page.locator('#value-L').fill('21000')
  await page.locator('#period-L').selectOption('month')
  await page.locator('#source-kind-L').selectOption('source')
  await page.locator('#source-L').fill('Brukerregistrert leiekontrakt for prioritetstest')
  await page.locator('#rent-nature-L').selectOption('actual')
  await expect(page.locator('#status-L')).toContainText('Ubekreftet')
  await page.getByRole('button', { name: '← Tilbake til investeringsoversikten' }).click()
  await expect(page.getByTestId('scenario-gross')).toContainText('2,93')
  await panel.locator('.rent-estimate-evidence > summary').click()
  await expect(panel).toContainText('Ubekreftet faktisk leie: Brukerregistrert leiekontrakt for prioritetstest')
  await expect(page.getByTestId('scenario-net')).toContainText('—')
  await expect(page.getByTestId('scenario-cash')).toContainText('—')
  await writeFile(info.outputPath('nordvik-import-rent.json'), JSON.stringify({ import: body, rent, expected, errors, paid }, null, 2))
  expect(errors).toEqual([]); expect(paid).toEqual([])
})

/** Uavhengige tosoners originalceller for dokumentert 40 m² / 2 rom. */
async function nostegatenLocalExpected(info: TestInfo) {
  const values = ['03.01', '03.02'].map(zone => ssbSnapshot.value[ssbSnapshot.dimension.Soner2.category.index[zone as '03.01' | '03.02'] * 25 + ssbSnapshot.dimension.AntRomBRA.category.index['2.040']]!)
  expect(values).toEqual([12600, 11300])
  const monthly = Math.round((values[0]! + values[1]!) / 2 / 100) * 100
  const expected = { year: '2025', sourceUpdated: ssbSnapshot.updated, values, monthly, annual: monthly * 12, low: Math.min(...values), high: Math.max(...values) }
  await writeFile(info.outputPath('nostegaten-independent-local.json'), JSON.stringify(expected, null, 2))
  return expected
}

const nostegaten = fileURLToPath(new URL('../../private/incoming/nostegaten-65-a.pdf', import.meta.url))
test('ekte Nøstegaten: 152 sider, dokumentøkonomi og automatisk SSB-leie med foreløpig avkastning', async ({ page }, info) => {
  const required = process.env.PAA_TEST_NOSTEGATEN_REQUIRED === '1'
  test.skip(!existsSync(nostegaten) && !required, 'Privat original distribueres ikke i Git. PAA_TEST_NOSTEGATEN_REQUIRED=1 krever prøven uten skip.')
  expect(existsSync(nostegaten)).toBe(true)
  test.setTimeout(120_000)
  const expected = await nostegatenLocalExpected(info)
  const paid: string[] = [], errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  for (const endpoint of ['document-economy/run', 'analysis']) await page.route(`**/api/${endpoint}`, route => { paid.push(endpoint); return route.abort() })
  await page.goto('/')
  const imported = page.waitForResponse(response => response.url().endsWith('/api/document-import') && response.request().method() === 'POST', { timeout: 90_000 })
  const rented = page.waitForResponse(response => response.url().endsWith('/api/rent-estimate') && response.request().method() === 'POST', { timeout: 100_000 })
  await page.locator('#import-file-prospectus').setInputFiles(nostegaten)
  const [http, rentHttp] = await Promise.all([imported, rented])
  expect(http.ok()).toBe(true); expect(rentHttp.ok()).toBe(true)
  const outcome = DocumentImportSchema.parse((await http.json()).outcome), rent = RentEstimateSchema.parse(await rentHttp.json())
  expect(outcome.reportHash).toBe('f33337aa0f5f2de0b64454541b0bb20bcf7732498755c4078ed1509b3a3f14e8')
  expect(outcome.pageCount).toBe(152)
  expect(outcome.pages.map(item => item.pdfPage)).toEqual(Array.from({ length: 152 }, (_, index) => index + 1))
  // Uavhengig tekstfasit fra baseline-parsing av hele originalen; ingen private sitater versjoneres.
  expect(createHash('sha256').update(JSON.stringify(outcome.pages.map(({ pdfPage, text }) => ({ pdfPage, text })))).digest('hex')).toBe('6392291608dc91b47cbc91126f74821a7d9a363992b81eb8b2042519ce4b4935')
  expect(outcome.sections.map(section => [section.startPage, section.endPage])).toEqual([[86, 101]])
  for (const source of outcome.sections.flatMap(section => section.basis)) {
    expect(source.documentHash).toBe(outcome.reportHash)
    expect(outcome.pages[source.pdfPage - 1]!.text.slice(source.start, source.end)).toBe(source.quote)
  }
  expect(outcome.technical.status).toBe('blocked')
  expect(outcome.coverage.technical.status).toBe('incomplete')
  expect(outcome.visualAnalysis?.pages.map(item => item.pdfPage)).toEqual(Array.from({ length: 16 }, (_, index) => index + 86))
  expect(outcome.visualAnalysis?.pages.every(item => item.error === null && item.rasterDigest !== null && item.lines.length > 0)).toBe(true)
  for (const pdfPage of [1, 124, 125, 126, 127, 128, 129, 130, 131, 133, 141, 152]) expect(outcome.pages[pdfPage - 1]!.status).not.toBe('readable')
  for (const pdfPage of [8, 9, 10, 11]) expect(outcome.pages[pdfPage - 1]!.status).toBe('readable')
  for (const [id, amount, period] of [['price', '4050000', 'once'], ['sharedDebt', '0', 'once'], ['commonCosts', '1020', 'month'], ['municipalFees', '12957', 'year'], ['propertyTax', '3942', 'year']] as const) {
    const field = outcome.economy.fields.find(field => field.id === id)!
    expect(field).toMatchObject({ amount, period, status: 'available' })
    expect(field.sources.length).toBeGreaterThan(0)
  }
  for (const field of outcome.economy.fields) for (const source of field.sources) {
    expect(outcome.pages[source.pdfPage - 1]!.status).toBe('readable')
    expect(outcome.pages[source.pdfPage - 1]!.text.slice(source.start, source.end)).toBe(source.quote)
  }
  expect(rent).toMatchObject({ status: 'estimated', monthly: String(expected.monthly), annual: String(expected.annual), low: String(expected.low), high: String(expected.high), statisticsYear: expected.year, sourceUpdated: expected.sourceUpdated,
    property: { area: { value: 40, basis: 'BRA-i' }, rooms: { value: 2 }, bedrooms: { value: 1 }, propertyType: { value: 'apartment' }, issues: [] } })
  expect(rent.property.municipality?.value.toLowerCase()).toBe('bergen')
  expect(rent.property.district).toBeNull()
  expect(rent.published.selectedReferenceId).toBe('hybel-q3-2026-bergen-2')
  expect(rent.marketEstimate).toMatchObject({ status: 'unavailable', monthly: null })
  for (const field of [rent.property.address, rent.property.municipality, rent.property.area, rent.property.rooms, rent.property.bedrooms, rent.property.propertyType]) {
    expect(field?.sources.length).toBeGreaterThan(0)
    for (const source of field!.sources) {
      expect(source.documentHash).toBe(outcome.reportHash)
      expect(source.documentName).toBe(outcome.documentName)
      expect(outcome.pages[source.pdfPage - 1]!.status).toBe('readable')
      expect(outcome.pages[source.pdfPage - 1]!.text.slice(source.start, source.end)).toBe(source.quote)
    }
  }
  expect(rent.observations.map(item => [item.zoneCode, item.sizeCode, item.monthly])).toEqual([['03.01', '2.040', String(expected.values[0])], ['03.02', '2.040', String(expected.values[1])]])
  await assertAnalysisLayout(page, false)
  const rental = page.getByRole('region', { name: 'Leieinntekt' })
  await expect(rental.getByTestId('rent-monthly')).not.toBeVisible()
  await rental.locator('.rent-estimate-evidence > summary').click()
  await expect(rental.getByTestId('rent-monthly')).toHaveText(`${displayedAmount(expected.monthly)} kr`)
  await expect(rental.getByTestId('rent-published-monthly')).toHaveText('13 891 kr/mnd')
  await expect(rental.locator('.rent-published-references')).toContainText('individuell markedsleie er ikke beregnet')
  await expect(rental.locator('.rent-estimate-evidence')).toContainText('Publiserte referanser')
  await expect(rental.locator('.rent-estimate-evidence')).toContainText('Annonser og portefølje')
  await expect(rental.locator('.rent-estimate-evidence')).toContainText('13 900')
  const percent = (value: number) => new Intl.NumberFormat('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  await expect(page.getByTestId('scenario-gross')).toContainText(percent(expected.annual / 4050000 * 100))
  await expect(page.getByTestId('scenario-preliminary-net')).toContainText(percent((expected.annual - 25197) / 4050000 * 100))
  await page.locator('.scenario-basis > summary').evaluate(element => { (element.parentElement as HTMLDetailsElement).open = true })
  await expect(page.getByTestId('scenario-preliminary-formula')).toContainText(displayedAmount(expected.annual - 25197))
  await page.locator('.scenario-basis > summary').evaluate(element => { (element.parentElement as HTMLDetailsElement).open = true })
  await expect(page.getByTestId('scenario-preliminary-formula')).toContainText('25 197')
  await expect(page.getByTestId('scenario-cost-assumption')).toContainText('eventuell overlapping er ikke avklart')
  expect(outcome.economy.fields.find(field => field.id === 'municipalFees')!.includedIn).toBeNull()
  await expect(page.locator('.scenario-basis')).toContainText('Kostnadsår: ukjent')
  const commonRow = page.locator('.document-economy-fields > div').filter({ has: page.locator('dt', { hasText: /^Felleskostnader$/ }) })
  await commonRow.locator('summary').click()
  await expect(commonRow).toContainText('Omfanget av kostnadene er uvisst')
  await commonRow.getByRole('button', { name: 'Åpne originalside ↗', exact: true }).first().click()
  await expect(page.locator('[data-pdf-page="8"]')).toBeVisible()
  await page.keyboard.press('Escape')
  const areaRow = rental.locator('.source-summary > div').filter({ has: page.locator('dt', { hasText: /^Areal$/ }) })
  await areaRow.getByRole('button', { name: /PDF-side/ }).first().click()
  await expect(page.locator(`[data-pdf-page="${rent.property.area!.sources[0]!.pdfPage}"]`)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('scenario-net')).toContainText('—')
  await expect(page.getByTestId('scenario-cash')).toContainText('—')
  await page.getByRole('button', { name: 'Eiendommen', exact: true }).click()
  const reportStart = page.getByRole('dialog').getByRole('button', { name: 'Åpne rapportstart ↗', exact: true })
  await expect(reportStart).toBeVisible()
  await reportStart.click()
  await expect(page.locator('[data-pdf-page="86"]')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect.poll(() => page.workers().length).toBe(0)
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await rental.screenshot({ path: info.outputPath('nostegaten-references-mobile.png') })
  await page.screenshot({ path: info.outputPath('nostegaten-mobile.png'), fullPage: true })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.screenshot({ path: info.outputPath('nostegaten-desktop.png'), fullPage: true })
  await writeFile(info.outputPath('nostegaten-import-rent.json'), JSON.stringify({ outcome, rent, expected, errors, paid }, null, 2))
  expect(paid).toEqual([]); expect(errors).toEqual([])
})
