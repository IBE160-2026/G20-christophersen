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
    await expect(page.locator(`#status-${field}`)).toHaveText('Registrert · Ubekreftet')
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
  for (const field of ['L', 'D', 'J']) {
    await expect(page.getByLabel(`Periode for ${field}`, { exact: true })).toHaveValue('')
    await expect(page.getByLabel(`År for ${field}`, { exact: true })).toHaveValue('')
  }
})

for (const viewport of [{ width: 1440, height: 900 }, { width: 720, height: 450 }, { width: 360, height: 225 }, { width: 360, height: 160 }, { width: 320, height: 160 }]) {
  test(`1.3 UX: feltrekkefølge, fokus og ombryting ved ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    const navigation = page.getByRole('navigation')
    const navBox = await navigation.boundingBox()
    const expectedOrder = [
      'value-P', 'source-kind-P', 'source-P', 'conflict-add-P',
      'value-L', 'period-L', 'year-L', 'source-kind-L', 'source-L', 'rent-nature-L', 'conflict-add-L',
      'value-D', 'period-D', 'year-D', 'source-kind-D', 'source-D', 'conflict-add-D',
      'value-J', 'period-J', 'year-J', 'source-kind-J', 'source-J', 'conflict-add-J',
      'value-Ymin', 'source-kind-Ymin', 'source-Ymin', 'conflict-add-Ymin', 'cost-add',
    ]
    const controls = page.locator('.financial-input input, .financial-input select, .financial-input button')
    expect(await controls.count()).toBe(expectedOrder.length)
    const ids: string[] = []
    await page.locator('#value-P').focus()
    for (let index = 0; index < expectedOrder.length; index++) {
      const control = page.locator(':focus')
      ids.push(await control.getAttribute('id') ?? '')
      const box = await control.boundingBox()
      expect(box!.x - 5).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width + 5).toBeLessThanOrEqual(viewport.width)
      // Chromium avrunder rulleposisjoner til delpiksler ved svært korte flater.
      expect(box!.y - 5).toBeGreaterThanOrEqual(navBox!.y + navBox!.height - 0.5)
      expect(box!.y + box!.height + 5).toBeLessThanOrEqual(viewport.height + 0.5)
      const focus = await control.evaluate((element) => {
        const style = getComputedStyle(element)
        return { visible: element.matches(':focus-visible'), color: style.outlineColor,
          style: style.outlineStyle, width: style.outlineWidth, offset: style.outlineOffset }
      })
      expect(focus).toEqual({ visible: true, color: 'rgb(34, 102, 95)', style: 'solid', width: '2px', offset: '3px' })
      if (viewport.height >= 225 && await control.evaluate((element) => element.tagName !== 'BUTTON')) {
        const label = await page.locator(`label[for="${ids.at(-1)}"]`).boundingBox()
        expect(label!.y).toBeGreaterThanOrEqual(navBox!.y + navBox!.height)
        expect(label!.y + label!.height).toBeLessThanOrEqual(viewport.height)
      }
      await page.keyboard.press('Tab')
    }
    expect(ids).toEqual(expectedOrder)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect(await navigation.boundingBox()).toEqual(navBox)
  })
}

test('1.5 AC1/AC4/AC5: fem synlige opphav, forventet leie og uløst kildekonflikt uten automatisk valg', async ({ page }) => {
  const apiRequests: string[] = []
  await page.route('**/*', async (route) => {
    if (!route.request().url().startsWith('http://127.0.0.1:3000/')) await route.abort()
    else await route.continue()
  })
  page.on('request', (request) => { if (new URL(request.url()).pathname.startsWith('/api')) apiRequests.push(request.url()) })
  await page.goto('/')
  for (const field of fields) {
    await page.locator(`#source-kind-${field}`).selectOption('assumption')
    await page.locator(`#source-${field}`).fill(`Egen forutsetning ${field}`)
    await expect(page.locator(`#source-summary-${field}`)).toHaveText(new RegExp(`Egen forutsetning: Egen forutsetning ${field}`))
    await expect(page.locator(`#value-${field}`)).toHaveAccessibleDescription(new RegExp(`Egen forutsetning ${field}`))
  }
  await page.getByLabel('Leiegrunnlag for L', { exact: true }).selectOption('expected')
  await expect(page.locator('#source-summary-L')).toContainText('Forventet leie, ikke dokumentert faktisk leie.')
  await page.locator('#value-L').fill('1900000')
  await page.locator('#conflict-add-L').click()
  await expect(page.locator('#conflict-value-L')).toBeFocused()
  await page.getByLabel('Annen kildeverdi for L', { exact: true }).fill('1400000')
  await page.getByLabel('Annen kilde for L', { exact: true }).fill('Leiekontrakt')
  await expect(page.getByRole('heading', { name: 'Uløst kildekonflikt for L' })).toBeVisible()
  await expect(page.locator('.source-conflict')).toContainText('Gjeldende registrering: 1900000 NOK · Egen forutsetning L.')
  await expect(page.locator('#conflict-issue-L')).toContainText('Verdien er utilstrekkelig.')
  await expect(page.locator('#value-L')).toHaveValue('1900000')
  await page.getByRole('link', { name: /Tallgrunnlag/ }).click()
  await expect(page.locator('#conflict-value-L')).toHaveValue('1400000')
  await page.locator('#value-L').fill('1400000')
  await expect(page.locator('#conflict-issue-L')).toContainText('Uløst kildekonflikt')
  await page.getByRole('button', { name: 'Fjern avklart motstrid for L' }).click()
  await expect(page.locator('#conflict-add-L')).toBeFocused()
  await expect(page.getByRole('heading', { name: 'Uløst kildekonflikt for L' })).toHaveCount(0)
  await expect(page.locator('#value-L')).toHaveValue('1400000')
  await expect(page.getByText('Ubekreftet tallgrunnlag', { exact: true })).toBeVisible()
  expect(apiRequests).toEqual([])
  await page.reload()
  for (const field of fields) await expect(page.locator(`#source-${field}`)).toHaveValue('')
})

test('1.5 AC2/AC3/AC5 FR-2: synlig 120000=100000+20000, inkludert overlapp og bevarte D/J-totaler', async ({ page }) => {
  await page.goto('/')
  for (const [field, value] of [['D', '400000'], ['J', '800000']]) {
    await page.locator(`#value-${field}`).fill(value!)
    await page.locator(`#period-${field}`).selectOption('year')
    await page.locator(`#year-${field}`).fill('2026')
  }
  await page.getByRole('button', { name: 'Legg til kostnadsinnhold' }).click()
  await expect(page.locator('#cost-1-label')).toBeFocused()
  await page.locator('#cost-1-label').fill('Felleskostnader')
  await page.locator('#cost-1-amount').fill('120000')
  await page.locator('#cost-1-debt').fill('20000')
  await expect(page.locator('.cost-contribution').first()).toHaveText('120000 NOK = D 100000 + J 20000 NOK')
  await page.getByRole('button', { name: 'Legg til kostnadsinnhold' }).click()
  await page.locator('#cost-2-label').fill('Kommunale avgifter')
  await page.locator('#cost-2-amount').fill('30000')
  await page.locator('#cost-2-debt').fill('0')
  await page.locator('#cost-2-included').selectOption('cost-1')
  await expect(page.locator('.cost-item').nth(1)).toContainText('Inngår i Felleskostnader; telles ikke på nytt.')
  await expect(page.locator('#cost-summary')).toHaveText('Oppgitt bidrag uten dobbelttelling: D 100000 NOK · J 20000 NOK (perioden for D).')
  await expect(page.locator('#value-D')).toHaveValue('400000')
  await expect(page.locator('#value-J')).toHaveValue('800000')
  await page.getByRole('link', { name: /Tallgrunnlag/ }).click()
  await expect(page.locator('#cost-1-debt')).toHaveValue('20000')
  await expect(page.locator('#cost-2-included')).toHaveValue('cost-1')
  await page.locator('#cost-1-debt').fill('20001')
  await expect(page.locator('#cost-summary')).toContainText('D 99999 NOK · J 20001 NOK')
  await page.getByRole('button', { name: 'Fjern post 1', exact: true }).click()
  await expect(page.locator('#cost-add')).toBeFocused()
  await expect(page.locator('#cost-2-included')).toHaveValue('cost-1')
  await expect(page.getByText(/Inkluderingen kan ikke kontrolleres/)).toBeVisible()
  await page.locator('#cost-2-included').selectOption('')
  await expect(page.locator('#cost-summary')).toContainText('D 30000 NOK · J 0 NOK')
  await expect(page.locator('#value-D')).toHaveValue('400000')
  await expect(page.locator('#value-J')).toHaveValue('800000')
})

for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 225 }, { width: 320, height: 160 }]) {
  test(`1.5 UX: åpen kildekonflikt og kostnadspost kan nås uten fokusklipping ved ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await page.locator('#conflict-add-L').click()
    await page.locator('#conflict-value-L').fill('1400000')
    await page.locator('#conflict-source-L').fill('Leiekontrakt')
    await page.locator('#cost-add').click()
    for (const id of ['conflict-value-L', 'conflict-source-L', 'cost-1-label', 'cost-1-amount', 'cost-1-debt', 'cost-1-included']) {
      const control = page.locator(`#${id}`)
      await control.focus()
      const box = (await control.boundingBox())!
      const nav = (await page.getByRole('navigation').boundingBox())!
      expect(box.x - 5).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width + 5).toBeLessThanOrEqual(viewport.width)
      expect(box.y - 5).toBeGreaterThanOrEqual(nav.y + nav.height - 0.5)
      expect(box.y + box.height + 5).toBeLessThanOrEqual(viewport.height + 0.5)
      await expect(control).toHaveAccessibleName(/.+/)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
