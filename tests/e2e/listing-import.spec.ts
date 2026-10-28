import { expect, test } from '@playwright/test'
import { completeDraft, listingFixture, listingUrl } from '../fixtures/listing/finn.ts'

test('FI-1: deaktivert FINN viser manuell reserveflyt og beholder fire trinn', async ({ page, baseURL }) => {
  const external: string[] = []
  page.on('request', request => { if (new URL(request.url()).origin !== new URL(baseURL!).origin) external.push(request.url()) })
  await page.goto('/')
  await page.getByLabel('FINN-boliglenke', { exact: true }).fill(listingUrl)
  await page.getByRole('button', { name: 'Hent FINN-grunnlag' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'FINN-import er deaktivert' })).toBeVisible()
  await expect(page.locator('#value-P')).toBeEditable()
  await expect(page.getByRole('navigation', { name: 'Vurderingens fire trinn' }).locator('li')).toHaveCount(4)
  expect(external).toEqual([])
})

test('FI-2–FI-6: kildeutkast, retting, kontroll, finansiering og nytt objekt', async ({ page }) => {
  await page.route('**/api/listing', async route => {
    const request = route.request().postDataJSON() as { correlation: unknown }
    await route.fulfill({ json: { kind: 'listing', correlation: request.correlation, listing: listingFixture() } })
  })
  await page.goto('/')
  await page.getByLabel('FINN-boliglenke', { exact: true }).fill(listingUrl)
  await page.getByRole('button', { name: 'Hent FINN-grunnlag' }).click()
  await expect(page.getByText('Original: 3000000 NOK', { exact: false })).toBeVisible()
  await expect(page.locator('#value-P')).toHaveValue('3200000')
  await expect(page.locator('#status-P')).toHaveText('Registrert · Ubekreftet')
  await expect(page.locator('#value-D')).toHaveValue('')
  await expect(page.locator('#value-J')).toHaveValue('')
  await expect(page.getByRole('link', { name: 'Åpne FINN-annonsen 476576649' })).toHaveAttribute('href', listingUrl)
  await expect(page.getByRole('button', { name: 'Bruk kontrollert grunnlag' })).toBeDisabled()
  for (const id of ['price', 'totalPrice', 'purchaseCosts', 'documentTax', 'sharedDebt', 'commonCosts']) {
    await page.getByRole('checkbox', { name: `Jeg har kontrollert ${id}, inkludert eventuell 0 og motstrid.`, exact: true }).check()
  }
  await expect(page.getByText('Kontantbehov: 3075000 NOK.', { exact: false })).toBeVisible()
  await page.getByLabel('Egenkapital (NOK)', { exact: true }).fill('1 075 000,00')
  await expect(page.getByLabel('Egenkapital med slider (NOK)')).toHaveValue('1075000')
  await page.getByLabel('Egenkapital (NOK)', { exact: true }).fill('1075000,50')
  await expect(page.getByLabel('Egenkapital med slider (NOK)')).toHaveValue('1075000.5')
  await page.getByLabel('Egenkapital (NOK)', { exact: true }).fill('1075000.555')
  await expect(page.getByLabel('Egenkapital med slider (NOK)')).toHaveCount(0)
  await expect(page.getByLabel('Egenkapital (NOK)', { exact: true })).toHaveValue('1075000.555')
  await expect(page.getByText('Tallfeltet beholder din nøyaktige verdi.', { exact: false })).toBeVisible()
  await page.getByLabel('Egenkapital (NOK)', { exact: true }).fill('abc')
  await expect(page.getByLabel('Egenkapital med slider (NOK)')).toHaveCount(0)
  await page.getByLabel('Egenkapital (NOK)', { exact: true }).fill('99999999')
  await expect(page.getByLabel('Egenkapital med slider (NOK)')).toHaveCount(0)
  await page.getByLabel('Egenkapital (NOK)', { exact: true }).fill('')
  await expect(page.getByLabel('Egenkapital med slider (NOK)')).toHaveCount(0)
  await page.getByLabel('Egenkapital (NOK)', { exact: true }).fill('1075000')
  await page.getByLabel('Årsrente (%)', { exact: true }).fill('0')
  await page.getByLabel('Løpetid (måneder)', { exact: true }).fill('240')
  await expect(page.getByText('Månedlig betaling: 8333.33 NOK', { exact: false })).toBeVisible()
  await page.getByLabel('Egenkapital med slider (NOK)').focus()
  await page.getByLabel('Egenkapital med slider (NOK)').press('End')
  await expect(page.getByLabel('Egenkapital (NOK)', { exact: true })).toHaveValue('3075000')
  await expect(page.getByText('Eget lån: 0 NOK', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Bruk kontrollert grunnlag' }).click()
  await expect(page.locator('#value-P')).toHaveValue('3200000')
  await expect(page.locator('#status-P')).toHaveText('Registrert · Ubekreftet')
  await expect(page.locator('#value-D')).toHaveValue('')
  await expect(page.locator('#value-J')).toHaveValue('')
  await page.getByLabel('Kontrollert beløp for price (NOK)', { exact: true }).fill('2900000')
  await expect(page.getByText('Original: 3000000 NOK', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Bruk kontrollert grunnlag' })).toBeDisabled()
  // Ubrukt retting rører ikke allerede brukt verdi.
  await expect(page.locator('#value-P')).toHaveValue('3200000')
  await page.getByLabel('FINN-boliglenke', { exact: true }).fill(`${listingUrl}?utm_source=test`)
  await expect(page.locator('#value-P')).toHaveValue('3200000')
  await page.getByLabel('FINN-boliglenke', { exact: true }).fill(listingUrl.replace('476576649', '123'))
  await expect(page.locator('#value-P')).toHaveValue('')
  await expect(page.getByText('Original: 3000000 NOK', { exact: false })).toHaveCount(0)
})


test('review: årsvilkår, entydige felt-ID-er og sperret oppfrisking', async ({ page }) => {
  const listing = completeDraft().original
  listing.fields.push({ ...listing.fields[0]!, id: 'note-price', label: 'Ekstra notepris', category: 'informational' })
  let calls = 0
  await page.route('**/api/listing', async route => {
    calls++
    const { correlation } = route.request().postDataJSON() as { correlation: unknown }
    await route.fulfill({ json: { kind: 'listing', correlation, listing } })
  })
  await page.goto('/')
  await expect(page.getByText('FINN-import krever operatørens tilgangs- og kostnadsgodkjenning', { exact: false })).toBeVisible()
  await page.getByLabel('FINN-boliglenke', { exact: true }).fill(listingUrl)
  await page.getByRole('button', { name: 'Hent FINN-grunnlag' }).click()
  await expect(page.getByText('Original: 5000 NOK', { exact: false })).toBeVisible()
  await expect(page.getByLabel('Kontrollert beløp for Ekstra notepris (NOK)', { exact: true })).toHaveValue('3000000')
  await expect(page.getByLabel('Begrunnelse/kilde for retting av price', { exact: true })).toHaveValue('')
  expect(await page.locator('.listing-import [id]').evaluateAll(elements => new Set(elements.map(element => element.id)).size === elements.length)).toBe(true)
  for (const control of await page.locator('.listing-field input[type="checkbox"]').all()) await control.check()
  await page.getByRole('checkbox', { name: 'Jeg har kontrollert at alle eierbetalte driftskostnader er med', exact: false }).check()
  await page.getByLabel('Egenkapital (NOK)', { exact: true }).fill('1075000')
  await page.getByLabel('Årsrente (%)', { exact: true }).fill('0')
  await page.getByLabel('Løpetid (måneder)', { exact: true }).fill('240')
  const preview = page.getByText('Forslag P:', { exact: false })
  await expect(preview).toContainText('J: Ukjent')
  await expect(page.getByText('Oppgi et år for gjeldsbetjening', { exact: false })).toBeVisible()
  await page.getByLabel('År for gjeldsbetjening', { exact: true }).fill('2025')
  await expect(preview).toContainText('J: Ukjent')
  await page.getByLabel('År for gjeldsbetjening', { exact: true }).fill('2026')
  await expect(preview).toContainText('J: 111999.96')
  await page.getByRole('button', { name: 'Bruk kontrollert grunnlag' }).click()
  await expect(page.locator('#value-J')).toHaveValue('111999.96')
  await page.locator('#value-D').fill('123')
  await expect(page.getByRole('button', { name: 'Hent FINN-grunnlag' })).toBeDisabled()
  await page.getByLabel('FINN-boliglenke', { exact: true }).fill(`${listingUrl}?utm_source=same-object`)
  await expect(page.getByRole('button', { name: 'Hent FINN-grunnlag' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Bruk kontrollert grunnlag' })).toBeEnabled()
  expect(calls).toBe(1)
  await page.locator('#value-P').fill('4 000 000,00')
  await expect(preview).toContainText('J: Ukjent')
  await expect(page.getByText('Importert J kan ikke brukes før manuell P', { exact: false })).toBeVisible()
  await expect(page.locator('#value-J')).toHaveValue('')
  await page.getByRole('button', { name: 'Bruk kontrollert grunnlag' }).click()
  await expect(page.locator('#value-P')).toHaveValue('4 000 000,00')
  await expect(page.locator('#value-J')).toHaveValue('')
  await expect(page.locator('#value-D')).toHaveValue('123')
  await page.locator('#value-P').fill('3 200 000,00')
  await expect(preview).toContainText('J: 111999.96')
  await page.getByRole('button', { name: 'Bruk kontrollert grunnlag' }).click()
  await expect(page.locator('#value-J')).toHaveValue('111999.96')
})


test('FINN-2: asynchronous import and controlled apply preserve manual P/D/J', async ({ page }) => {
  let release!: () => void
  await page.route('**/api/listing', async route => {
    await new Promise<void>(resolve => { release = resolve })
    const { correlation } = route.request().postDataJSON() as { correlation: unknown }
    await route.fulfill({ json: { kind: 'listing', correlation, listing: listingFixture() } })
  })
  await page.goto('/')
  await page.getByLabel('FINN-boliglenke', { exact: true }).fill(listingUrl)
  await page.getByRole('button', { name: 'Hent FINN-grunnlag' }).click()
  await expect(page.getByLabel('FINN-boliglenke', { exact: true })).toBeDisabled()
  await expect(page.getByLabel('FINN-boliglenke', { exact: true })).toHaveValue(listingUrl)
  await page.locator('#value-P').fill('1234567')
  await page.locator('#value-D').fill('12345')
  await page.locator('#value-J').fill('67890')
  release()
  await expect(page.getByText('Original: 3000000 NOK', { exact: false })).toBeVisible()
  await expect(page.locator('#value-P')).toHaveValue('1234567')
  await expect(page.getByLabel('FINN-boliglenke', { exact: true })).toBeEnabled()
  await expect(page.getByRole('status').filter({ hasText: 'Importutkast klart.' })).not.toContainText('er fylt inn')
  for (const id of ['price', 'totalPrice', 'purchaseCosts', 'documentTax', 'sharedDebt', 'commonCosts']) {
    await page.getByRole('checkbox', { name: `Jeg har kontrollert ${id}, inkludert eventuell 0 og motstrid.`, exact: true }).check()
  }
  await page.getByRole('button', { name: 'Bruk kontrollert grunnlag' }).click()
  await expect(page.locator('#value-P')).toHaveValue('1234567')
  await expect(page.locator('#value-D')).toHaveValue('12345')
  await expect(page.locator('#value-J')).toHaveValue('67890')
})

for (const [code, text] of [['configuration', 'mangler godkjent backendoppsett'], ['busy', 'Et FINN-oppslag pågår'], ['already-attempted', 'Nytt forsøk krever serveromstart']] as const) {
  test(`FINN-2: ${code} has a safe gate message and manual fallback`, async ({ page }) => {
    await page.route('**/api/listing', route => route.fulfill({ status: code === 'configuration' ? 503 : 409, json: { kind: 'rejected', code } }))
    await page.goto('/')
    await page.getByLabel('FINN-boliglenke', { exact: true }).fill(listingUrl)
    await page.getByRole('button', { name: 'Hent FINN-grunnlag' }).click()
    await expect(page.getByRole('status').filter({ hasText: text })).toBeVisible()
    await expect(page.locator('#value-P')).toBeEditable()
  })
}


test('FINN-2: an unknown-price draft uses neutral ready wording', async ({ page }) => {
  const listing = listingFixture()
  listing.fields[0]!.status = 'missing'; listing.fields[0]!.amount = null; listing.fields[0]!.source = null
  await page.route('**/api/listing', route => {
    const { correlation } = route.request().postDataJSON() as { correlation: unknown }
    return route.fulfill({ json: { kind: 'listing', correlation, listing } })
  })
  await page.goto('/')
  await page.getByLabel('FINN-boliglenke', { exact: true }).fill(listingUrl)
  await page.getByRole('button', { name: 'Hent FINN-grunnlag' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Importutkast klart.' })).toHaveText('Importutkast klart. Kontroller kilden og hvert felt før bruk. Manuelle registreringer er bevart.')
  await expect(page.locator('#value-P')).toHaveValue('')
})
