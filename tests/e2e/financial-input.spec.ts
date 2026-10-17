import { expect, test } from '@playwright/test'

const fields = ['P', 'L', 'D', 'J', 'Ymin'] as const

test('1.3 AC1: blanke ubekreftede felt, synlige definisjoner, enheter og eksplisitt periode/år', async ({ page }) => {
  await page.goto('/')
  for (const field of fields) {
    const input = page.locator(`#value-${field}`)
    await expect(input).toHaveValue('')
    await expect(input).toHaveAccessibleName(new RegExp(`\\(${field}\\)`))
    await expect(input).toHaveAccessibleDescription(new RegExp(`${field === 'Ymin' ? '%' : 'NOK'}.*Ikke oppgitt · Ubekreftet`))
    await expect(page.locator(`#label-${field}`)).toBeVisible()
    await expect(page.locator(`#unit-${field}`)).toHaveText(field === 'Ymin' ? '%' : 'NOK')
  }
  await expect(page.locator('#value-P')).toHaveAccessibleDescription(/Inklusive eventuell fellesgjeld, uten kjøpsomkostninger/)
  await expect(page.locator('#value-D')).toHaveAccessibleDescription(/Eierbetalt drift uten renter og avdrag/)
  await expect(page.locator('#value-J')).toHaveAccessibleDescription(/Renter og avdrag inklusive eventuell fellesgjeld/)
  for (const field of ['L', 'D', 'J']) {
    await expect(page.getByLabel(`Periode for ${field}`, { exact: true })).toHaveValue('')
    await expect(page.getByLabel(`År for ${field}`, { exact: true })).toHaveValue('')
  }
})

test('1.3 AC2/AC3/AC4: F1/F3, råstrenger, 0, sletting, periode/år og tilgjengelig retur', async ({ page }) => {
  const analysisRequests: string[] = []
  page.on('request', (request) => { if (new URL(request.url()).pathname.startsWith('/api')) analysisRequests.push(request.url()) })
  await page.goto('/')
  for (const [field, value] of Object.entries({ P: '16000000', L: '1900000', D: '400000', J: '800000', Ymin: '7' })) {
    await page.locator(`#value-${field}`).fill(value)
  }
  for (const field of ['L', 'D', 'J']) {
    await page.getByLabel(`Periode for ${field}`, { exact: true }).selectOption('year')
    await page.getByLabel(`År for ${field}`, { exact: true }).fill('2026')
  }
  const step = page.getByRole('link', { name: /Tallgrunnlag/ })
  await step.click()
  await expect(page.getByRole('heading', { name: 'Tallgrunnlag', exact: true })).toBeFocused()
  for (const [field, value] of Object.entries({ P: '16000000', L: '1900000', D: '400000', J: '800000', Ymin: '7' })) {
    await expect(page.locator(`#value-${field}`)).toHaveValue(value)
  }
  await page.getByLabel('Periode for L', { exact: true }).selectOption('month')
  await page.getByLabel('År for L', { exact: true }).fill(' 2025 ')
  await page.locator('#value-L').fill(' 0012 345,6700 ')
  await step.focus()
  await step.press('Enter')
  await expect(page.locator('#value-L')).toHaveValue(' 0012 345,6700 ')
  await expect(page.getByLabel('Periode for L', { exact: true })).toHaveValue('month')
  await expect(page.getByLabel('År for L', { exact: true })).toHaveValue(' 2025 ')
  await page.getByLabel('Periode for J', { exact: true }).selectOption('unknown')
  await page.getByLabel('År for J', { exact: true }).fill('')
  for (const field of fields) {
    await page.locator(`#value-${field}`).fill('0')
    await expect(page.locator(`#status-${field}`)).toHaveText('0 registrert · Ubekreftet')
    await page.locator(`#value-${field}`).fill('')
    await expect(page.locator(`#status-${field}`)).toHaveText('Ikke oppgitt · Ubekreftet')
  }
  await expect(page.getByLabel('Periode for L', { exact: true })).toHaveValue('month')
  await expect(page.getByLabel('År for L', { exact: true })).toHaveValue(' 2025 ')
  await expect(page.getByRole('button', { name: /Tilstandsrapport/ })).toHaveAttribute('aria-disabled', 'true')
  await expect(page.getByText('Ubekreftet tallgrunnlag', { exact: true })).toBeVisible()
  expect(analysisRequests).toEqual([])
  await page.locator('#value-P').fill('16000000')
  await page.reload()
  for (const field of fields) await expect(page.locator(`#value-${field}`)).toHaveValue('')
})

for (const viewport of [{ width: 1440, height: 900 }, { width: 720, height: 450 }, { width: 360, height: 225 }]) {
  test(`1.3 UX: feltrekkefølge, fokus og ombryting ved ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    const navigation = page.getByRole('navigation')
    const navBox = await navigation.boundingBox()
    const controls = page.locator('.financial-input input, .financial-input select')
    expect(await controls.count()).toBe(11)
    const ids: string[] = []
    await page.locator('#value-P').focus()
    for (let index = 0; index < 11; index++) {
      const control = page.locator(':focus')
      ids.push(await control.getAttribute('id') ?? '')
      const box = await control.boundingBox()
      expect(box!.x - 5).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width + 5).toBeLessThanOrEqual(viewport.width)
      expect(box!.y - 5).toBeGreaterThanOrEqual(navBox!.y + navBox!.height)
      expect(box!.y + box!.height + 5).toBeLessThanOrEqual(viewport.height)
      expect(await control.evaluate((element) => getComputedStyle(element).outlineColor)).toBe('rgb(34, 102, 95)')
      await page.keyboard.press('Tab')
    }
    expect(ids).toEqual(['value-P', 'value-L', 'period-L', 'year-L', 'value-D', 'period-D', 'year-D', 'value-J', 'period-J', 'year-J', 'value-Ymin'])
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect(await navigation.boundingBox()).toEqual(navBox)
  })
}
