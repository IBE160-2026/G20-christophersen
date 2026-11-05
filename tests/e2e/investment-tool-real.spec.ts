import { test, expect } from '@playwright/test'
import type { Page, TestInfo } from '@playwright/test'
import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { DocumentImportSchema } from '../../src/contracts/document-import.ts'

test.use({ hasTouch: true })

// Private originaler er valgfrie i offentlig regresjon, obligatoriske i sluttprøven.
// Ingen rutestubbing eller produksjonsberegning brukes til denne fasiten.
const cases = [
  { id: 'nostegaten', file: 'nostegaten-65-a.pdf', title: 'Nøstegaten 65 A', price: 4_050_000, capital: 4_152_340, initialRent: 12_000, reference: 13_891, knownCosts: 12_240, pages: 152, hash: 'f33337aa0f5f2de0b64454541b0bb20bcf7732498755c4078ed1509b3a3f14e8', monthlyRent: 16_000, sourcePage: 12 },
  { id: 'rostockgata', file: 'nordvik-rostockgata-96.pdf', title: 'Rostockgata 96', price: 8_600_000, capital: 8_816_090, initialRent: 18_900, reference: 20_426, knownCosts: 43_920, pages: 170, hash: '3e2dd467c11785c1de7c8c79b8e5f58f786e87416f7dc9b14f7a2d713ec6cb70', monthlyRent: 24_000, sourcePage: 26 },
] as const
const fixture = (name: string) => fileURLToPath(new URL(`../../private/incoming/${name}`, import.meta.url))
const amount = (value: number, decimals = 0) => new Intl.NumberFormat('nb-NO', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value).replaceAll('\u00a0', ' ')
const annuity = (loan: number, rate: number, months: number) => {
  const r = rate / 1_200
  return Math.round((rate === 0 ? loan / months : loan * r / (1 - (1 + r) ** -months)) * 100) / 100
}

async function upload(page: Page, file: string) {
  const imported = page.waitForResponse(response => response.url().endsWith('/api/document-import') && response.request().method() === 'POST', { timeout: 100_000 })
  const rented = page.waitForResponse(response => response.url().endsWith('/api/rent-estimate') && response.request().method() === 'POST', { timeout: 100_000 })
  await page.locator('#import-file-prospectus').setInputFiles(file)
  const [http, rentHttp] = await Promise.all([imported, rented])
  expect(http.ok()).toBe(true)
  expect(rentHttp.ok()).toBe(true)
  return { outcome: DocumentImportSchema.parse((await http.json()).outcome), rent: await rentHttp.json() as { monthly: string } }
}

async function photographs(page: Page, info: TestInfo, name: string) {
  await expect(page.locator('.investment-kpis')).toHaveAttribute('aria-busy', 'false')
  await expect(page.getByTestId('scenario-cash')).not.toContainText('—')
  await page.locator('h1').focus()
  await page.screenshot({ path: info.outputPath(`${name}-full.png`), fullPage: true })
  for (const [part, selector] of [['economy', '#investment'], ['legal', '#legal-risk'], ['technical', '#technical-risk']] as const) {
    await page.locator(selector).screenshot({ path: info.outputPath(`${name}-${part}.png`) })
  }
}

for (const item of cases) test(`ekte investeringsverktøy: ${item.title}, finansfasit, risiko, mobil og gjentatt opplasting`, async ({ page }, info) => {
  const original = fixture(item.file)
  const required = process.env.PAA_TEST_INVESTMENT_REQUIRED === '1'
  test.skip(cases.some(candidate => !existsSync(fixture(candidate.file))) && !required, 'Begge private originaler holdes utenfor Git. PAA_TEST_INVESTMENT_REQUIRED=1 krever faktisk prøve.')
  expect(existsSync(original), 'Den obligatoriske private originalen må finnes lokalt').toBe(true)
  test.setTimeout(240_000)
  const errors: string[] = [], external: string[] = [], posts: string[] = []
  const checks: { name: string; details?: unknown }[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('request', request => {
    const url = new URL(request.url())
    if (request.method() === 'POST') posts.push(url.pathname)
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) external.push(request.url())
  })
  await page.goto('/')
  const config = await (await page.request.get('/api/document-import-config')).json()
  expect(config).toMatchObject({ liveEnabled: false, codeFirst: true })
  const { outcome, rent } = await upload(page, original)

  await test.step('Originaldokument, samlet økonomi og ærlige mangler', async () => {
    expect(outcome.reportHash).toBe(item.hash)
    expect(outcome.pageCount).toBe(item.pages)
    expect(outcome.technical.status).toBe('blocked')
    expect(outcome.coverage.technical.status).toBe('incomplete')
    expect(rent.monthly).toBe(String(item.initialRent))
    await expect(page.locator('h1')).toContainText(item.title)
    await expect(page.locator('#listing-url, #listing-alternative-toggle')).toHaveCount(0)
    expect(await page.evaluate(() => {
      const nodes = ['.hero', '#investment', '#legal-risk', '#technical-risk', '.analysis-documentation'].map(selector => document.querySelector(selector)!)
      return nodes.every((node, index) => index === 0 || Boolean(nodes[index - 1]!.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING))
    })).toBe(true)
    await expect(page.getByTestId('scenario-capital')).toContainText(amount(item.capital))
    await expect(page.getByTestId('scenario-gross')).toContainText(amount(item.initialRent * 12 / item.price * 100, 2))
    await expect(page.getByTestId('scenario-preliminary-net')).toContainText(amount((item.initialRent * 12 - item.knownCosts) / item.price * 100, 2))
    await expect(page.locator('#scenario-equity')).toHaveValue((item.capital - item.price * 0.8).toFixed(2))
    await expect(page.locator('#scenario-leverage')).toHaveValue('80.00')
    await expect(page.locator('#scenario-rate')).toHaveValue('6')
    await expect(page.locator('#scenario-years')).toHaveValue('30')
    await expect(page.locator('#scenario-operating-monthly')).toHaveValue(String(item.knownCosts / 12))
    for (const name of ['Juster egenkapital', 'Juster belåningsgrad', 'Juster rente', 'Juster nedbetalingstid i år']) {
      await expect(page.getByRole('slider', { name, exact: true })).toBeVisible()
      await expect(page.getByRole('slider', { name, exact: true })).toBeEnabled()
    }
    await expect(page.getByTestId('scenario-loan')).toContainText(amount(item.price * 0.8))
    await expect(page.getByTestId('scenario-loan-monthly')).toContainText(amount(annuity(item.price * 0.8, 6, 360)))
    await expect(page.getByTestId('scenario-net')).toContainText(amount((item.initialRent * 12 - item.knownCosts) / item.price * 100, 2))
    await expect(page.getByTestId('scenario-cash')).toContainText(amount(item.initialRent - item.knownCosts / 12 - annuity(item.price * 0.8, 6, 360)))
    checks.push({ name: 'Original og mangler', details: { pages: outcome.pageCount, initialRent: rent.monthly, capital: item.capital, knownCosts: item.knownCosts } })
  })

  await test.step('Direkte leie/drift/finansiering stemmer med uavhengig annuitetsfasit', async () => {
    await page.locator('#scenario-rent-monthly').fill(String(item.monthlyRent))
    await page.locator('#scenario-operating-monthly').fill('3000')
    if (3000 * 12 < item.knownCosts) await expect(page.locator('#investment')).toContainText('Valgt totaldrift er lavere enn dokumentets kjente delsum')
    const loan = item.price * 0.8, equity = item.capital - loan, payment = annuity(loan, 5.5, 300)
    await page.locator('#scenario-equity').fill(String(equity))
    await page.locator('#scenario-rate').fill('5,5')
    await page.locator('#scenario-years').fill('25')
    await expect(page.getByTestId('scenario-loan')).toContainText(amount(loan))
    await expect(page.getByTestId('scenario-ltv')).toContainText('80')
    await expect(page.getByTestId('scenario-total-debt')).toContainText(amount(loan))
    await expect(page.getByTestId('scenario-loan-monthly')).toContainText(amount(payment))
    await expect(page.getByTestId('scenario-gross')).toContainText(amount(item.monthlyRent * 12 / item.price * 100, 2))
    await expect(page.getByTestId('scenario-net')).toContainText(amount((item.monthlyRent - 3000) * 12 / item.price * 100, 2))
    await expect(page.getByTestId('scenario-cash')).toContainText(amount(item.monthlyRent - 3000 - payment))
    await expect(page.getByTestId('scenario-cash-annual')).toContainText(amount((item.monthlyRent - 3000) * 12 - payment * 12))
    // Drift 36 000 er samlet D, ikke et tillegg til de kjente dokumentkostnadene.
    await page.locator('#scenario-operating-monthly').fill('4000')
    await expect(page.getByTestId('scenario-net')).toContainText(amount((item.monthlyRent - 4000) * 12 / item.price * 100, 2))
    await expect(page.getByTestId('scenario-cash')).toContainText(amount(item.monthlyRent - 4000 - payment))
    await page.locator('#scenario-operating-monthly').fill('3000')
    const slider = page.getByRole('slider', { name: 'Juster forventet månedsleie' })
    await slider.focus(); await slider.press('ArrowRight')
    const changedRent = Number(await page.locator('#scenario-rent-monthly').inputValue())
    await expect(page.getByTestId('scenario-cash')).toContainText(amount(changedRent - 3000 - payment))
    await page.locator('#scenario-rent-monthly').fill(String(item.monthlyRent))
    await page.locator('#scenario-rate').fill('6')
    await expect(page.getByTestId('scenario-cash')).toContainText(amount(item.monthlyRent - 3000 - annuity(loan, 6, 300)))
    await page.locator('#scenario-years').fill('20')
    await expect(page.getByTestId('scenario-cash')).toContainText(amount(item.monthlyRent - 3000 - annuity(loan, 6, 240)))
    await expect(page.getByTestId('scenario-net')).toContainText(amount((item.monthlyRent - 3000) * 12 / item.price * 100, 2))
    await page.getByText('Utforsk kontantstrøm, lån og rente', { exact: true }).click()
    await expect(page.locator('.chart-svg')).toBeVisible()
    await page.getByRole('tab', { name: 'Kontantstrøm', exact: true }).focus()
    await page.getByRole('tab', { name: 'Kontantstrøm', exact: true }).press('ArrowRight')
    await expect(page.getByRole('tab', { name: 'Låneutvikling', exact: true })).toBeFocused()
    await expect(page.locator('.chart-svg')).toBeVisible()
    await page.getByRole('tab', { name: 'Rentefølsomhet', exact: true }).click()
    await expect(page.locator('.chart-svg')).toBeVisible({ timeout: 30_000 })
    await page.getByText('Utforsk kontantstrøm, lån og rente', { exact: true }).click()
    checks.push({ name: 'Uavhengig finansfasit', details: { loan, equity, payment, cashMonthly: item.monthlyRent - 3000 - payment } })
  })

  await test.step('Høy belåning, negativ kontantstrøm, nullrente og kontantkjøp', async () => {
    await page.locator('#scenario-leverage').fill('95')
    await page.locator('#scenario-rate').fill('8')
    await page.locator('#scenario-years').fill('10')
    const loan = item.price * 0.95, payment = annuity(loan, 8, 120)
    const negative = item.monthlyRent - 3000 - payment
    expect(negative).toBeLessThan(0)
    await expect(page.getByTestId('scenario-ltv')).toContainText('95')
    await expect(page.getByTestId('scenario-cash')).toContainText(amount(negative))
    await expect(page.getByTestId('scenario-cash')).toHaveClass(/negative/)
    await expect(page.locator('#investment')).toContainText(/høy belåning/i)
    await photographs(page, info, `${item.id}-negative-desktop`)
    await page.locator('#scenario-equity').fill('0')
    await expect(page.getByTestId('scenario-total-debt')).toContainText(amount(item.capital))
    await expect(page.getByTestId('scenario-ltv')).toContainText(amount(item.capital / item.price * 100, 2))
    await expect(page.getByRole('slider', { name: 'Juster belåningsgrad', exact: true })).toBeVisible()
    const leverageSlider = page.getByRole('slider', { name: 'Juster belåningsgrad', exact: true })
    await leverageSlider.focus(); await leverageSlider.press('Home')
    await expect.poll(async () => Number(await page.locator('#scenario-equity').inputValue())).toBe(item.capital)
    await leverageSlider.press('End')
    await expect(page.locator('#scenario-equity')).toHaveValue(/^0(?:[.,]0+)?$/)
    await expect(page.getByTestId('scenario-total-debt')).toContainText(amount(item.capital))
    await expect(leverageSlider).toBeVisible()
    const nativeMaximum = await leverageSlider.evaluate(element => ({ value: (element as HTMLInputElement).value, max: (element as HTMLInputElement).max }))
    await leverageSlider.press('Home')
    await expect.poll(async () => Number(await page.locator('#scenario-equity').inputValue())).toBe(item.capital)
    await leverageSlider.scrollIntoViewIfNeeded()
    const leverageBounds = await leverageSlider.boundingBox()
    expect(leverageBounds).not.toBeNull()
    await page.mouse.move(leverageBounds!.x + 8, leverageBounds!.y + leverageBounds!.height / 2)
    await page.mouse.down()
    await page.mouse.move(leverageBounds!.x + leverageBounds!.width + 20, leverageBounds!.y + leverageBounds!.height / 2, { steps: 10 })
    await page.mouse.up()
    await expect(page.locator('#scenario-equity')).toHaveValue(/^0(?:[.,]0+)?$/)
    await expect(leverageSlider).toBeVisible()
    await page.locator('#scenario-leverage').fill((item.capital / item.price * 100).toFixed(2).replace('.', ','))
    await expect(page.locator('#scenario-equity')).toHaveValue(/^0(?:[.,]0+)?$/)
    await expect(page.locator('.finance-panel')).toContainText('Maksimal belåning er valgt; egenkapital 0 kr.')
    await page.locator('.finance-panel').screenshot({ path: info.outputPath(`${item.id}-maximum-leverage.png`) })
    await page.locator('#scenario-leverage').fill('95')
    await page.locator('#scenario-rate').fill('0')
    await page.locator('#scenario-years').fill('25')
    await expect(page.getByTestId('scenario-loan-monthly')).toContainText(amount(annuity(loan, 0, 300)))
    await expect(page.getByTestId('scenario-cash')).toContainText(amount(item.monthlyRent - 3000 - annuity(loan, 0, 300)))
    await page.locator('#scenario-equity').fill(String(item.capital))
    await page.locator('#scenario-rate').fill('')
    await page.locator('#scenario-years').fill('')
    await expect(page.getByTestId('scenario-loan')).toContainText('0 kr')
    await expect(page.getByTestId('scenario-cash')).toContainText(amount(item.monthlyRent - 3000))
    checks.push({ name: 'Finansgrenser', details: { leveragePercent: 95, negativeCashMonthly: negative, zeroInterest: true, cashPurchaseWithoutRate: true, nativeHomeAndEnd: true, nativeDragToMaximum: true, nativeMaximum } })
  })

  await test.step('Blank/ugyldig drift og rente viser ikke foreldet cash', async () => {
    await page.locator('#scenario-operating-monthly').fill('')
    await expect(page.getByTestId('scenario-net')).toContainText('—')
    await expect(page.getByTestId('scenario-cash')).toContainText('—')
    await expect(page.getByTestId('scenario-gross')).toContainText(amount(item.monthlyRent * 12 / item.price * 100, 2))
    await page.locator('#scenario-operating-monthly').fill('-1')
    await expect(page.locator('#scenario-operating-monthly')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByTestId('scenario-cash')).toContainText('—')
    await page.locator('#scenario-operating-monthly').fill('3000')
    await page.locator('#scenario-leverage').fill('80')
    await page.locator('#scenario-rate').fill('5,5')
    await page.locator('#scenario-years').fill('25')
    await expect(page.getByTestId('scenario-cash')).not.toContainText('—')
    await page.locator('#scenario-rate').fill('')
    await expect(page.getByTestId('scenario-cash')).toContainText('—')
    await expect(page.getByTestId('scenario-net')).not.toContainText('—')
    await page.locator('#scenario-rate').fill('5,5')
    await expect(page.getByTestId('scenario-cash')).not.toContainText('—')
    await page.locator('#scenario-rent-monthly').fill('')
    await expect(page.getByTestId('scenario-gross')).toContainText('—')
    await expect(page.getByTestId('scenario-net')).toContainText('—')
    await expect(page.getByTestId('scenario-cash')).toContainText('—')
    await page.locator('#scenario-rent-monthly').fill(String(item.monthlyRent))
    await expect(page.getByTestId('scenario-cash')).not.toContainText('—')
    checks.push({ name: 'Mangler og ugyldige inndata' })
  })

  await test.step('Konkrete risikoforhold, ingen TG fra forklaringssider, fysisk kilde og SSB-bakgrunn', async () => {
    await expect(page.locator('#legal-risk')).toContainText('Korttidsutleie: inntil 60 døgn')
    if (item.id === 'rostockgata') {
      await expect(page.locator('#legal-risk')).toContainText('Ferdigattest: gjenstående arbeider')
      await expect(page.locator('#technical-risk')).toContainText(/radon/i)
    } else await expect(page.locator('#technical-risk')).toContainText(/varmtvann/i)
    // Begge originalene har TG2/TG3 i tegnforklaringen, ikke dokumenterte slike grader.
    const detailedGrades = [...(outcome.propertyRisk?.technical.findings ?? [])].filter(finding => finding.grade !== null)
    expect(detailedGrades).toEqual([])
    for (const finding of [...(outcome.propertyRisk?.legal.findings ?? []), ...(outcome.propertyRisk?.technical.findings ?? [])]) {
      expect(finding.sources.length + (finding.visualSources?.length ?? 0)).toBeGreaterThan(0)
      for (const source of finding.sources) {
        expect(source.documentHash).toBe(item.hash)
        expect(outcome.pages[source.pdfPage - 1]!.text.slice(source.start, source.end)).toBe(source.quote)
      }
    }
    const restriction = page.locator('#legal-risk .risk-finding').filter({ has: page.locator('summary strong', { hasText: 'Korttidsutleie: inntil 60 døgn' }) })
    await restriction.locator(':scope > summary').click()
    await restriction.getByRole('button', { name: /Se originalkilde/ }).first().click()
    await expect(page.locator(`[data-pdf-page="${item.sourcePage}"]`)).toBeVisible()
    await page.getByLabel('PDF-zoom').selectOption('1.5')
    await expect(page.locator('.pdf-page canvas')).toBeVisible()
    await page.screenshot({ path: info.outputPath(`${item.id}-originalkilde.png`) })
    await page.keyboard.press('Escape')
    const rentDetails = page.locator('.rent-estimate-evidence')
    await rentDetails.locator(':scope > summary').click()
    await expect(rentDetails).toContainText('SSB')
    await rentDetails.locator(':scope > summary').click()
    checks.push({ name: 'Risiko og kildebelegg', details: { technicalFindings: outcome.propertyRisk?.technical.findings.length, sourcePage: item.sourcePage, authoritativeTg2Tg3: detailedGrades.length, technicalStatus: outcome.technical.status } })
  })

  await test.step('Mobil, tastatur og utvidbare kilder er lesbare uten sidescroll', async () => {
    await page.setViewportSize({ width: 390, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const slider = page.getByRole('slider', { name: 'Juster forventet månedsleie' })
    await slider.focus(); await slider.press('ArrowRight')
    const changed = Number(await page.locator('#scenario-rent-monthly').inputValue())
    await expect(page.getByTestId('scenario-gross')).toContainText(amount(changed * 12 / item.price * 100, 2))
    await slider.scrollIntoViewIfNeeded()
    const bounds = await slider.boundingBox()
    expect(bounds).not.toBeNull()
    await page.touchscreen.tap(bounds!.x + bounds!.width * 0.6, bounds!.y + bounds!.height / 2)
    const touchRent = Number(await page.locator('#scenario-rent-monthly').inputValue())
    await expect(page.getByTestId('scenario-gross')).toContainText(amount(touchRent * 12 / item.price * 100, 2))
    await photographs(page, info, `${item.id}-mobile`)
    await page.locator('#scenario-rent-monthly').scrollIntoViewIfNeeded()
    await page.screenshot({ path: info.outputPath(`${item.id}-mobile-rent-viewport.png`) })
    expect(await page.locator('.skip-link').evaluate(element => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0)
    await page.getByRole('button', { name: /Tilbakestill til publisert leiereferanse/ }).click()
    await expect(page.locator('#scenario-rent-monthly')).toHaveValue(String(item.reference))
    await page.setViewportSize({ width: 1440, height: 1000 })
    await photographs(page, info, `${item.id}-desktop`)
    checks.push({ name: 'Mobil og tastatur', details: { width: 390, height: 844, noOverflow: true } })
  })

  await test.step('Gjentatt original og bytte av eiendom fjerner gamle forutsetninger', async () => {
    await page.locator('#scenario-leverage').fill('-1')
    await expect(page.getByTestId('scenario-cash')).toContainText('—')
    const repeated = await upload(page, original)
    expect(repeated.outcome.reportHash).toBe(item.hash)
    await expect(page.locator('#scenario-equity')).toHaveValue((item.capital - item.price * 0.8).toFixed(2))
    await expect(page.locator('#scenario-leverage')).toHaveValue('80.00')
    await expect(page.locator('#scenario-operating-monthly')).toHaveValue(String(item.knownCosts / 12))
    await expect(page.getByTestId('scenario-cash')).not.toContainText('—')
    await expect(page.locator('#scenario-rent-monthly')).toHaveValue(String(item.initialRent))
    const other = cases.find(candidate => candidate.id !== item.id)!
    const changed = await upload(page, fixture(other.file))
    expect(changed.outcome.reportHash).toBe(other.hash)
    await expect(page.locator('h1')).toContainText(other.title)
    await expect(page.getByTestId('scenario-capital')).toContainText(amount(other.capital))
    await expect(page.locator('#scenario-operating-monthly')).toHaveValue(String(other.knownCosts / 12))
    await expect(page.locator('#scenario-equity')).toHaveValue((other.capital - other.price * 0.8).toFixed(2))
    await expect(page.getByTestId('scenario-cash')).not.toContainText('—')
    checks.push({ name: 'Gjentatt opplasting og eiendomsbytte', details: { imports: 3, finalProperty: other.title } })
  })

  expect(errors).toEqual([])
  expect(external).toEqual([])
  expect(posts.every(path => ['/api/document-import', '/api/rent-estimate'].includes(path))).toBe(true)
  await writeFile(info.outputPath(`${item.id}-qa-summary.json`), JSON.stringify({ property: item.title, checks, errors, external, posts }, null, 2))
})
