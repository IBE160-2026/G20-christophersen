import { test, expect } from '@playwright/test'
import type { APIRequestContext, TestInfo } from '@playwright/test'
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

const nordvik = fileURLToPath(new URL('../../private/incoming/nordvik-rostockgata-96.pdf', import.meta.url))
type LiveSsb = { updated: string; id: string[]; size: number[]; value: (number | null)[];
  dimension: Record<string, { category: { index: Record<string, number>; label: Record<string, string> } }> }
const displayedAmount = (value: number) => new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(value).replaceAll('\u00a0', ' ')

/** Independent live oracle: selected public cell + documented integer-percent arithmetic, no production estimator. */
async function nordvikLiveExpected(request: APIRequestContext, info: TestInfo) {
  const observedAt = new Date(), currentYear = observedAt.getUTCFullYear()
  const metadataUrl = 'https://data.ssb.no/api/pxwebapi/v2/tables/09897/metadata?lang=no'
  const metadataResponse = await request.get(metadataUrl, { timeout: 15_000, headers: { 'Cache-Control': 'no-cache' } })
  expect(metadataResponse.ok()).toBe(true)
  const metadataRaw = await metadataResponse.text()
  await writeFile(info.outputPath('nordvik-expected-ssb-metadata.json'), metadataRaw)
  const metadata = JSON.parse(metadataRaw) as LiveSsb
  const year = Object.keys(metadata.dimension.Tid!.category.index).filter(year => /^\d{4}$/.test(year) && Number(year) <= currentYear).sort().at(-1)!
  expect(year).toBeTruthy()
  const age = currentYear - Number(year)
  expect(age).toBeGreaterThanOrEqual(0); expect(age).toBeLessThanOrEqual(3)
  expect(metadata.dimension.AntRomBRA!.category.index['3.060']).toBeDefined()
  const coordinates = { Soner2: '01.02', AntRomBRA: '3.060', ContentsCode: 'Husleie', Tid: year }
  const dataUrl = new URL('https://data.ssb.no/api/pxwebapi/v2/tables/09897/data')
  dataUrl.searchParams.set('lang', 'no')
  for (const [dimension, code] of Object.entries(coordinates)) dataUrl.searchParams.set(`valueCodes[${dimension}]`, code)
  const dataResponse = await request.get(dataUrl.href, { timeout: 15_000, headers: { 'Cache-Control': 'no-cache' } })
  expect(dataResponse.ok()).toBe(true)
  const dataRaw = await dataResponse.text()
  await writeFile(info.outputPath('nordvik-expected-ssb-data.json'), dataRaw)
  const data = JSON.parse(dataRaw) as LiveSsb
  expect(data.updated).toBe(metadata.updated)
  expect([...data.id].sort()).toEqual(Object.keys(coordinates).sort())
  expect(data.size).toEqual([1, 1, 1, 1])
  for (const [dimension, code] of Object.entries(coordinates)) expect(data.dimension[dimension]!.category.index).toEqual({ [code]: 0 })
  const raw = data.value[0]!
  expect(data.value).toHaveLength(1); expect(raw).not.toBeNull(); expect(Number.isInteger(raw)).toBe(true); expect(raw).toBeGreaterThan(0)
  const marginPercent = Math.min(75, 25 + age * 5 + 5)
  const monthly = Math.round(raw / 100) * 100, annual = monthly * 12
  // Integer percentages avoid floating point rounding at exact hundred-kr boundaries.
  const low = Math.floor(raw * (100 - marginPercent) / 10_000) * 100, high = Math.ceil(raw * (100 + marginPercent) / 10_000) * 100
  const expected = { observedAt: observedAt.toISOString(), currentYear, metadataUrl, dataUrl: dataUrl.href, sourceUpdated: data.updated,
    coordinates, year, age, raw, marginPercent, margin: String(marginPercent / 100), monthly, annual, low, high,
    grossYield: new Intl.NumberFormat('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(annual / 8_600_000 * 100) }
  await writeFile(info.outputPath('nordvik-expected-ssb-audit.json'), JSON.stringify(expected, null, 2))
  return expected
}

test('ekte Nordvik: alle 170 sider, kildebelagt 59→60-leieestimat og ubekreftet økonomi gjennom HTTP', async ({ page, request }, info) => {
  const required = process.env.PAA_TEST_NORDVIK_REQUIRED === '1'
  test.skip(!existsSync(nordvik) && !required, 'Privat original distribueres ikke i Git. PAA_TEST_NORDVIK_REQUIRED=1 krever denne prøven uten skip.')
  expect(existsSync(nordvik), 'Obligatorisk Nordvik-original må være tilgjengelig lokalt').toBe(true)
  test.setTimeout(120_000)
  const expected = await nordvikLiveExpected(request, info)
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
  expect(rent.limitations.join(' ')).toContain(`±${expected.marginPercent} %`)
  const panel = page.getByRole('region', { name: 'Forventet leie.' })
  await expect(panel).toContainText('Selveierleilighet')
  await expect(panel).toContainText('59 m² BRA-i')
  await expect(panel.getByTestId('rent-area-approximation')).toContainText('59 → 60 m²')
  await expect(panel.getByTestId('rent-area-approximation')).toContainText('ikke en direkte SSB-prediksjon for 59 m²')
  await expect(panel.getByTestId('rent-area-approximation')).toContainText('ikke empirisk kalibrert')
  await expect(panel.getByTestId('rent-monthly')).toHaveText(`${displayedAmount(expected.monthly)} kr`)
  await expect(panel.getByTestId('rent-interval')).toHaveText(`${displayedAmount(expected.low)}–${displayedAmount(expected.high)} kr/mnd`)
  await expect(panel).toContainText('01.02'); await expect(panel).toContainText(`Brukes automatisk i ubekreftet økonomiscenario for ${expected.year}`)
  await expect(page.getByTestId('scenario-gross')).toContainText(expected.grossYield)
  await expect(page.getByTestId('scenario-preliminary-net')).toContainText(new Intl.NumberFormat('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((expected.annual - 43920) / 8600000 * 100))
  await expect(page.getByTestId('scenario-preliminary-formula')).toContainText(displayedAmount(expected.annual - 43920))
  await expect(page.getByTestId('scenario-preliminary-formula')).toContainText('43 920')
  await expect(page.getByRole('region', { name: 'Foreløpig netto før finansiering' })).toContainText('Kostnadsår: ukjent')
  await panel.locator('summary').click()
  await expect(panel).toContainText('3.060'); await expect(panel).toContainText(`${expected.raw} × (1 − ${expected.margin})`)
  await expect(panel.getByRole('link', { name: /Hent det samme datagrunnlaget/ })).toHaveAttribute('href', new RegExp(`valueCodes%5BTid%5D=${expected.year}`))
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
  await expect(panel).toContainText('Ubekreftet faktisk leie er registrert med grunnlag: Brukerregistrert leiekontrakt for prioritetstest')
  await expect(page.getByTestId('scenario-net')).toContainText('—')
  await expect(page.getByTestId('scenario-cash')).toContainText('—')
  await writeFile(info.outputPath('nordvik-import-rent.json'), JSON.stringify({ import: body, rent, expected, errors, paid }, null, 2))
  expect(errors).toEqual([]); expect(paid).toEqual([])
})
