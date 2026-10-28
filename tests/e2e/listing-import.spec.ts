import { expect, test } from '@playwright/test'
import { listingFixture, listingUrl } from '../fixtures/listing/finn.ts'

test('FI-1: deaktivert FINN viser manuell reserveflyt og beholder fire trinn', async ({ page }) => {
  const external: string[] = []
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:3000')) external.push(request.url()) })
  await page.goto('/')
  await page.getByLabel('FINN-boliglenke', { exact: true }).fill(listingUrl)
  await page.getByRole('button', { name: 'Hent FINN-grunnlag' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'FINN-import er utilgjengelig' })).toBeVisible()
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
  await expect(page.getByRole('link', { name: 'Åpne FINN-annonsen 476576649' })).toHaveAttribute('href', listingUrl)
  await expect(page.getByRole('button', { name: 'Bruk kontrollert grunnlag' })).toBeDisabled()
  for (const id of ['price', 'totalPrice', 'purchaseCosts', 'documentTax', 'sharedDebt', 'commonCosts']) {
    await page.getByRole('checkbox', { name: `Jeg har kontrollert ${id}, inkludert eventuell 0 og motstrid.`, exact: true }).check()
  }
  await expect(page.getByText('Kontantbehov: 3075000 NOK.', { exact: false })).toBeVisible()
  await page.getByLabel('Egenkapital (NOK)', { exact: true }).fill('1075000')
  await expect(page.getByLabel('Egenkapital med slider (NOK)')).toHaveValue('1075000')
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
  await page.locator('#listing-price').fill('2900000')
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
