import { expect, test } from '@playwright/test'

const fields = ['P', 'L', 'D', 'J', 'Ymin'] as const

test('1.3 AC1: blanke ubekreftede felt, synlige definisjoner, enheter og eksplisitt periode/år', async ({ page }) => {
  await page.goto('/'); await page.getByTestId('open-financial-basis').click()
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
  page.on('request', (request) => { if (new URL(request.url()).pathname.startsWith('/api') && new URL(request.url()).pathname !== '/api/analysis-config') analysisRequests.push(request.url()) })
  await page.goto('/'); await page.getByTestId('open-financial-basis').click()
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
  await page.reload(); await page.getByTestId('open-financial-basis').click()
  for (const field of fields) await expect(page.locator(`#value-${field}`)).toHaveValue('')
  for (const field of ['L', 'D', 'J']) {
    await expect(page.getByLabel(`Periode for ${field}`, { exact: true })).toHaveValue('')
    await expect(page.getByLabel(`År for ${field}`, { exact: true })).toHaveValue('')
  }
})

for (const viewport of [{ width: 1440, height: 900 }, { width: 720, height: 450 }, { width: 360, height: 225 }, { width: 360, height: 160 }, { width: 320, height: 160 }]) {
  test(`1.3 UX: feltrekkefølge, fokus og ombryting ved ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/'); await page.getByTestId('open-financial-basis').click()
    const navigation = page.getByRole('navigation')
    const navBox = await navigation.boundingBox()
    const legacyOrder = [
      'value-P', 'source-kind-P', 'source-P', 'conflict-add-P',
      'value-L', 'period-L', 'year-L', 'source-kind-L', 'source-L', 'rent-nature-L', 'conflict-add-L',
      'value-D', 'period-D', 'year-D', 'source-kind-D', 'source-D', 'conflict-add-D',
      'value-J', 'period-J', 'year-J', 'source-kind-J', 'source-J', 'conflict-add-J',
      'value-Ymin', 'source-kind-Ymin', 'source-Ymin', 'conflict-add-Ymin', 'cost-add', 'confirm-financial',
    ]
    const controls = page.locator('.financial-input :is(input, select, button):not(.listing-import *)')
    expect(await controls.count()).toBe(legacyOrder.length)
    await expect(page.locator('#import-file-prospectus')).toBeVisible()
    await page.locator('#listing-alternative-toggle').click()
    await expect(page.locator('.financial-input .listing-import :is(input, button)')).toHaveCount(2)
    await expect(page.getByText('FINN-import krever operatørens tilgangs- og kostnadsgodkjenning', { exact: false })).toBeVisible()
    await page.locator('#listing-url').fill('https://www.finn.no/realestate/homes/ad/476576649')
    const expectedOrder = ['listing-url', 'listing-fetch', ...legacyOrder]
    const ids: string[] = []
    await page.locator('#value-P').focus()
    await page.locator('#listing-url').focus()
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

test('1.5 AC1/AC4/AC5: fem synlige opphav, forventet leie og uløst kildekonflikt uten automatisk valg', async ({ page, baseURL }) => {
  const apiRequests: string[] = []
  await page.route('**/*', async (route) => {
    if (new URL(route.request().url()).origin !== new URL(baseURL!).origin) await route.abort()
    else await route.continue()
  })
  page.on('request', (request) => { if (new URL(request.url()).pathname.startsWith('/api') && new URL(request.url()).pathname !== '/api/analysis-config') apiRequests.push(request.url()) })
  await page.goto('/'); await page.getByTestId('open-financial-basis').click()
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
  await expect(page.locator('#source-issue-L-source-conflict')).toContainText('Verdien er utilstrekkelig.')
  for (const id of ['value-L', 'source-L', 'conflict-value-L', 'conflict-source-L']) {
    await expect(page.locator(`#${id}`)).toHaveAccessibleDescription(/Uløst kildekonflikt.*Verdien er utilstrekkelig/)
    await expect(page.locator(`#${id}`)).toHaveAttribute('aria-invalid', 'true')
  }
  await expect(page.locator('#value-L')).toHaveValue('1900000')
  await page.getByRole('link', { name: /Tallgrunnlag/ }).click()
  await expect(page.locator('#conflict-value-L')).toHaveValue('1400000')
  await page.locator('#value-L').fill('1400000')
  await expect(page.locator('#source-issue-L-source-conflict')).toContainText('Uløst kildekonflikt')
  await page.getByRole('button', { name: 'Fjern avklart motstrid for L' }).click()
  await expect(page.locator('#conflict-add-L')).toBeFocused()
  await expect(page.getByRole('heading', { name: 'Uløst kildekonflikt for L' })).toHaveCount(0)
  await expect(page.locator('#value-L')).toHaveValue('1400000')
  await expect(page.getByText('Ubekreftet tallgrunnlag', { exact: true })).toBeVisible()
  expect(apiRequests).toEqual([])
  await page.reload(); await page.getByTestId('open-financial-basis').click()
  for (const field of fields) await expect(page.locator(`#source-${field}`)).toHaveValue('')
})

test('1.5 AC1/NFR-2: faktisk leie krever kilde, viser tilknyttet feil og beholder brukeropphav etter retting', async ({ page }) => {
  await page.goto('/'); await page.getByTestId('open-financial-basis').click()
  await page.locator('#value-L').fill('1900000')
  await page.locator('#source-kind-L').selectOption('assumption')
  await page.locator('#source-L').fill('Eget leieanslag')
  await page.locator('#rent-nature-L').selectOption('actual')
  const warning = page.locator('#source-issue-L-unsupported-actual-rent')
  await expect(warning).toContainText('Faktisk leie mangler oppgitt kildegrunnlag')
  for (const id of ['value-L', 'source-kind-L', 'source-L', 'rent-nature-L']) {
    await expect(page.locator(`#${id}`)).toHaveAccessibleDescription(/Faktisk leie mangler oppgitt kildegrunnlag/)
    await expect(page.locator(`#${id}`)).toHaveAttribute('aria-invalid', 'true')
  }
  await page.locator('#source-kind-L').selectOption('source')
  await page.locator('#source-L').fill('')
  await expect(warning).toBeVisible()
  await page.locator('#source-L').fill('Oppgitt gjeldende leiekontrakt')
  await expect(warning).toHaveCount(0)
  await expect(page.locator('#source-L')).not.toHaveAttribute('aria-invalid')
  await expect(page.locator('#rent-nature-L')).toHaveValue('actual')
  await expect(page.locator('#value-L')).toHaveValue('1900000')
  await expect(page.locator('#source-summary-L')).toContainText('Faktisk leie er brukeroppgitt; kildegrunnlaget må kontrolleres.')
})

test('1.5 AC2/AC3/AC5 FR-2: synlig 120000=100000+20000, inkludert overlapp og bevarte D/J-totaler', async ({ page }) => {
  await page.goto('/'); await page.getByTestId('open-financial-basis').click()
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
    await page.goto('/'); await page.getByTestId('open-financial-basis').click()
    await page.locator('#conflict-add-L').click()
    await page.locator('#conflict-value-L').fill('1400000')
    await page.locator('#conflict-source-L').fill('Leiekontrakt')
    await page.locator('#cost-add').click()
    const order = [
      'value-P', 'source-kind-P', 'source-P', 'conflict-add-P',
      'value-L', 'period-L', 'year-L', 'source-kind-L', 'source-L', 'rent-nature-L', 'conflict-value-L', 'conflict-source-L', 'conflict-remove-L',
      'value-D', 'period-D', 'year-D', 'source-kind-D', 'source-D', 'conflict-add-D',
      'value-J', 'period-J', 'year-J', 'source-kind-J', 'source-J', 'conflict-add-J',
      'value-Ymin', 'source-kind-Ymin', 'source-Ymin', 'conflict-add-Ymin',
      'cost-1-label', 'cost-1-amount', 'cost-1-debt', 'cost-1-included', 'cost-1-remove', 'cost-add',
    ]
    await page.locator('#value-P').focus()
    for (const id of order) {
      const control = page.locator(`#${id}`)
      await expect(control).toBeFocused()
      const box = (await control.boundingBox())!
      const nav = (await page.getByRole('navigation').boundingBox())!
      expect(box.x - 5).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width + 5).toBeLessThanOrEqual(viewport.width)
      expect(box.y - 5).toBeGreaterThanOrEqual(nav.y + nav.height - 0.5)
      expect(box.y + box.height + 5).toBeLessThanOrEqual(viewport.height + 0.5)
      await expect(control).toHaveAccessibleName(/.+/)
      await page.keyboard.press('Tab')
    }
    await page.locator('#cost-1-remove').focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#cost-add')).toBeFocused()
    await page.locator('#conflict-remove-L').focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#conflict-add-L')).toBeFocused()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 320, height: 160 }]) {
  test(`1.5 NFR-2: feil for like og lange kostnadsnavn er tilknyttet uten vannrett rulling ved ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/'); await page.getByTestId('open-financial-basis').click()
    for (const index of [1, 2]) {
      await page.locator('#cost-add').click()
      await page.locator(`#cost-${index}-label`).fill('Forsikring'.repeat(60))
    }
    await expect(page.locator('#cost-issues .field-issue')).toHaveCount(2)
    for (const index of [1, 2]) {
      await expect(page.locator(`#cost-${index}-amount`)).toHaveAccessibleDescription(new RegExp(`Kostnadspost ${index}.*Navn, beløp eller rentedel/avdrag`))
      await expect(page.locator(`#cost-${index}-amount`)).toHaveAttribute('aria-invalid', 'true')
    }
    await expect(page.locator('#value-D')).toHaveAccessibleDescription(/Kostnadspost 1.*Kostnadspost 2/)
    expect(await page.locator('.workspace').evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
  })
}

async function registerF1(page: import('@playwright/test').Page) {
  for (const [field, value] of Object.entries({ P: '16000000', L: '1900000', D: '400000', J: '800000', Ymin: '7' })) {
    await page.locator(`#value-${field}`).fill(value)
    await page.locator(`#source-kind-${field}`).selectOption('assumption')
    await page.locator(`#source-${field}`).fill(`F1 kontrollert ${field}`)
  }
  for (const field of ['L', 'D', 'J']) {
    await page.locator(`#period-${field}`).selectOption('year')
    await page.locator(`#year-${field}`).fill('2026')
  }
  await page.locator('#rent-nature-L').selectOption('expected')
}

test('1.7 AC1/AC3/AC4/AC5: F1, årsgrunnlag, eksplisitt bekreftelse, uendret retur, retting og øktslutt', async ({ page }) => {
  const api: string[] = []
  page.on('request', (request) => { if (new URL(request.url()).pathname.startsWith('/api') && new URL(request.url()).pathname !== '/api/analysis-config') api.push(request.url()) })
  await page.goto('/'); await page.getByTestId('open-financial-basis').click()
  await registerF1(page)
  await expect(page.getByText('Ubekreftet tallgrunnlag', { exact: true })).toBeVisible()
  await expect(page.locator('#normalization-L')).toHaveText('Registrert 1900000 NOK × 1 = 1900000 NOK/år · 2026.')
  await page.locator('#confirm-financial').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#confirm-financial')).toBeFocused()
  await expect(page.locator('#confirmation-status')).toHaveText('Tallgrunnlaget er bekreftet. Tilstandsrapport er tilgjengelig.')
  for (const field of fields) await expect(page.locator(`#status-${field}`)).toContainText('Bekreftet')
  await page.locator('#next-step').focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'Tilstandsrapport', exact: true })).toBeFocused()
  await expect(page.getByText('Ingen rapportanalyse er startet.', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Tilbake til Tallgrunnlag', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Tallgrunnlag', exact: true })).toBeFocused()
  await expect(page.locator('#source-L')).toHaveValue('F1 kontrollert L')
  for (const field of fields) await expect(page.locator(`#status-${field}`)).toContainText('Bekreftet')
  await page.locator('#value-L').fill('1800000')
  await expect(page.locator('#status-L')).toContainText('Endret — må kontrolleres på nytt')
  await expect(page.locator('#status-P')).toContainText('Bekreftet')
  await expect(page.getByRole('button', { name: /Trinn 2/ })).toHaveAttribute('aria-disabled', 'true')
  await page.locator('#confirm-financial').click()
  await expect(page.getByText('Bekreftet tallgrunnlag', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /Trinn 2/ }).click()
  await expect(page.getByRole('heading', { name: 'Tilstandsrapport', exact: true })).toBeFocused()
  expect(api).toEqual([])
  await page.reload(); await page.getByTestId('open-financial-basis').click()
  await expect(page.locator('#value-P')).toHaveValue('')
  await expect(page.getByText('Ubekreftet tallgrunnlag', { exact: true })).toBeVisible()
})

for (const scenario of [
  { name: 'F3 manglende L', control: 'value-L', value: '', focus: 'value-L', error: /L: Verdien mangler.*Oppgi verdien for L/ },
  { name: 'ugyldig P', control: 'value-P', value: '0', focus: 'value-P', error: /P: Totalpris må være større enn 0/ },
  { name: 'ulike år', control: 'year-J', value: '2025', focus: 'year-L', error: /Verdiene gjelder ulike år/ },
]) {
  test(`1.7 AC2/AC6: ${scenario.name} viser lokale feil, første berørte felt og krever retting`, async ({ page }) => {
    await page.goto('/'); await page.getByTestId('open-financial-basis').click()
    await registerF1(page)
    await page.locator(`#${scenario.control}`).fill(scenario.value)
    await page.locator('#confirm-financial').click()
    await expect(page.locator(`#${scenario.focus}`)).toBeFocused()
    await expect(page.locator(`#${scenario.focus}`)).toHaveAccessibleDescription(scenario.error)
    await expect(page.locator(`#${scenario.focus}`)).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByRole('heading', { name: 'Innhent mer informasjon', exact: true })).toBeVisible()
    await expect(page.locator(`#${scenario.control}`)).toHaveValue(scenario.value)
    await expect(page.locator('#status-P')).toContainText('Ubekreftet')
    await page.locator(`#${scenario.control}`).fill(scenario.control === 'value-L' ? '1900000' : scenario.control === 'value-P' ? '16000000' : '2026')
    await expect(page.locator(`#${scenario.control}`)).toBeFocused()
    await page.locator('#confirm-financial').click()
    await expect(page.getByText('Bekreftet tallgrunnlag', { exact: true })).toBeVisible()
  })
}

test('1.7 AC2/AC3: J=0 krever egen nullkontroll; blank behandles annerledes', async ({ page }) => {
  await page.goto('/'); await page.getByTestId('open-financial-basis').click()
  await registerF1(page)
  await page.locator('#value-J').fill('0')
  await page.locator('#confirm-financial').click()
  await expect(page.locator('#zero-J')).toBeFocused()
  await expect(page.locator('#zero-J')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.locator('#value-J')).toHaveAccessibleDescription(/J: 0 må bekreftes/)
  await expect(page.getByRole('heading', { name: 'Innhent mer informasjon', exact: true })).toBeVisible()
  await page.keyboard.press('Space')
  await expect(page.locator('#zero-J')).toBeChecked()
  await expect(page.locator('#status-J')).toHaveText('0 registrert · Ubekreftet')
  await page.locator('#confirm-financial').click()
  await expect(page.locator('#status-J')).toHaveText('0 registrert · Bekreftet')
  await expect(page.getByText('Bekreftet tallgrunnlag', { exact: true })).toBeVisible()
  await page.locator('#zero-J').uncheck()
  await expect(page.locator('#status-J')).toHaveText('0 registrert · Ubekreftet')
  await expect(page.getByRole('button', { name: /Trinn 2/ })).toHaveAttribute('aria-disabled', 'true')
  await page.locator('#confirm-financial').click()
  await expect(page.locator('#zero-J')).toBeFocused()
  await expect(page.locator('#zero-J')).not.toBeChecked()
  await expect(page.locator('#next-step')).toHaveCount(0)
  await page.locator('#zero-J').check()
  await page.locator('#confirm-financial').click()
  await expect(page.locator('#status-J')).toHaveText('0 registrert · Bekreftet')
  await expect(page.locator('#zero-J')).not.toHaveAttribute('aria-invalid')
  await page.locator('#value-J').fill('')
  await page.locator('#confirm-financial').click()
  await expect(page.locator('#value-J')).toBeFocused()
  await expect(page.locator('#value-J')).toHaveAccessibleDescription(/J: Verdien mangler/)
  await expect(page.locator('#zero-J')).toHaveCount(0)
})

test('1.7 AC2: L-konflikt består gjennom forsøk; opphav og ny kontroll må rettes eksplisitt', async ({ page }) => {
  await page.goto('/'); await page.getByTestId('open-financial-basis').click()
  await registerF1(page)
  await page.locator('#conflict-add-L').click()
  await page.locator('#conflict-value-L').fill('1400000')
  await page.locator('#conflict-source-L').fill('Annen kilde')
  await page.locator('#confirm-financial').click()
  await expect(page.locator('#conflict-value-L')).toBeFocused()
  await expect(page.locator('#value-L')).toHaveAccessibleDescription(/Uløst kildekonflikt/)
  await expect(page.locator('.local-deficiencies')).toContainText('Kontroller begge kildeverdiene for L')
  await expect(page.locator('#conflict-value-L')).toHaveValue('1400000')
  await page.locator('#value-L').fill('1400000')
  await page.locator('#source-L').fill('Kontrollert annen kilde')
  await page.locator('#conflict-remove-L').click()
  await page.locator('#confirm-financial').click()
  await expect(page.getByText('Bekreftet tallgrunnlag', { exact: true })).toBeVisible()
})

for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 800 }, { width: 720, height: 450 }, { width: 320, height: 200 }]) {
  test(`1.7 AC6: lokal feil/nullkontroll, bekreftelse og trinnfokus ved ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/'); await page.getByTestId('open-financial-basis').click()
    await registerF1(page)
    await page.locator('#value-J').fill('0')
    await page.locator('#confirm-financial').focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#zero-J')).toBeFocused()
    for (const id of ['zero-J', 'confirm-financial']) {
      await page.locator(`#${id}`).focus()
      const box = (await page.locator(`#${id}`).boundingBox())!
      const nav = (await page.getByRole('navigation').boundingBox())!
      expect(box.y - 5).toBeGreaterThanOrEqual(nav.y + nav.height - 0.5)
      expect(box.y + box.height + 5).toBeLessThanOrEqual(viewport.height + 0.5)
      await expect(page.locator(`#${id}`)).toHaveAccessibleName(/.+/)
    }
    await page.locator('#zero-J').focus()
    await page.keyboard.press('Space')
    await page.locator('#confirm-financial').focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#confirmation-status')).toHaveText(/Tallgrunnlaget er bekreftet/)
    await page.keyboard.press('Tab')
    await expect(page.locator('#next-step')).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { name: 'Tilstandsrapport', exact: true })).toBeFocused()
    await page.getByRole('link', { name: /Tallgrunnlag/ }).focus()
    await page.keyboard.press('Enter')
    const heading = page.getByRole('heading', { name: 'Tallgrunnlag', exact: true })
    await expect(heading).toBeFocused()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const nav = (await page.getByRole('navigation').boundingBox())!
    expect((await heading.boundingBox())!.y).toBeGreaterThanOrEqual(nav.y + nav.height)
  })
}

test('1.7 AC1/AC2/AC6: måned, synlig årsgrunnlag, nøyaktig kildefokus og målt kontroll-/feilkontrast', async ({ page }, testInfo) => {
  await page.goto('/'); await page.getByTestId('open-financial-basis').click()
  await registerF1(page)
  await page.locator('#value-L').fill('150000')
  await page.locator('#period-L').selectOption('month')
  await expect(page.locator('#normalization-L')).toHaveText('Registrert 150000 NOK × 12 = 1800000 NOK/år · 2026.')
  await page.locator('#source-L').fill('')
  await page.locator('#confirm-financial').click()
  await expect(page.locator('#source-L')).toBeFocused()
  await expect(page.locator('#source-L')).toHaveAccessibleDescription(/Kilde eller egen forutsetning mangler/)
  await expect(page.locator('#source-L')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.locator('#source-kind-L')).not.toHaveAttribute('aria-invalid')
  await expect(page.locator('#rent-nature-L')).not.toHaveAttribute('aria-invalid')
  await page.screenshot({ path: testInfo.outputPath('tallgrunnlag-kilde-feil.png') })
  const ratios = await page.evaluate(() => {
    const css = (selector: string) => getComputedStyle(document.querySelector(selector)!)
    const ratio = (a: string, b: string) => {
      const luminance = (color: string) => {
        const c = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map((v) => v / 255).map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
        return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722
      }
      const l = [luminance(a), luminance(b)].sort((x, y) => y - x)
      return (l[0] + 0.05) / (l[1] + 0.05)
    }
    const white = css('.financial-input').backgroundColor
    return {
      action: ratio(css('.primary-action').color, css('.primary-action').backgroundColor),
      error: ratio(css('#field-issues-L .field-issue').color, white),
      issueText: ratio(css('.local-deficiencies p').color, css('.local-deficiencies').backgroundColor),
      control: ratio(css('#value-L').borderColor, white),
      focus: ratio(css('#source-L').outlineColor, white),
    }
  })
  for (const role of ['action', 'error', 'issueText'] as const) expect(ratios[role]).toBeGreaterThanOrEqual(4.5)
  for (const role of ['control', 'focus'] as const) expect(ratios[role]).toBeGreaterThanOrEqual(3)
  console.log('Story 1.7 målt kontrast:', JSON.stringify(ratios))
  await page.locator('#source-L').fill('Kontrollert forventet månedsleie')
  await page.locator('#confirm-financial').click()
  await page.locator('#confirmation-status').scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath('tallgrunnlag-bekreftet.png') })
})

for (const scenario of [
  { name: 'beløp', amount: 'abc', debt: '0', focus: 'cost-1-amount' },
  { name: 'rentedel', amount: '120000', debt: '130000', focus: 'cost-1-debt' },
  { name: 'inkludering', amount: '120000', debt: '20000', focus: 'cost-2-included' },
]) {
  test(`1.7 AC2: kostnadsfeil i ${scenario.name} fokuserer kontrollen som må rettes`, async ({ page }) => {
    await page.goto('/'); await page.getByTestId('open-financial-basis').click()
    await registerF1(page)
    await page.locator('#cost-add').click()
    await page.locator('#cost-1-label').fill('Felleskostnader')
    await page.locator('#cost-1-amount').fill(scenario.amount)
    await page.locator('#cost-1-debt').fill(scenario.debt)
    if (scenario.name === 'inkludering') {
      await page.locator('#cost-add').click()
      await page.locator('#cost-2-label').fill('Kommunale avgifter')
      await page.locator('#cost-2-amount').fill('30000')
      await page.locator('#cost-2-debt').fill('0')
      await page.locator('#cost-2-included').selectOption('cost-1')
      await page.locator('#cost-1-remove').click()
    }
    await page.locator('#confirm-financial').click()
    await expect(page.locator(`#${scenario.focus}`)).toBeFocused()
    await expect(page.locator(`#${scenario.focus}`)).toHaveAccessibleDescription(/Kostnadspost/)
    await expect(page.locator('#next-step')).toHaveCount(0)
    await expect(page.locator('.local-deficiencies')).toContainText('Innhent mer informasjon')
  })
}
