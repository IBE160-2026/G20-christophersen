import { expect, test } from '@playwright/test'

test('PDF er eneste synlige importinngang i oversikt og økonomikontroll', async ({ page }) => {
  const requests: string[] = []
  page.on('request', request => { if (request.url().includes('/api/listing')) requests.push(request.url()) })
  await page.goto('/')
  await expect(page.locator('#import-file-prospectus')).toBeVisible()
  await expect(page.locator('#listing-url, #listing-alternative-toggle')).toHaveCount(0)
  await expect(page.getByLabel('FINN-boliglenke', { exact: true })).toHaveCount(0)
  await page.getByTestId('open-financial-basis').click()
  await expect(page.locator('#import-file-prospectus')).toBeVisible()
  await expect(page.locator('#value-P')).toBeEditable()
  await expect(page.locator('#listing-url, #listing-alternative-toggle')).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Vurderingens fire trinn' }).locator('li')).toHaveCount(4)
  expect(requests).toEqual([])
})

test('FINN-backendens deaktiverte tilgangsport beholdes', async ({ request }) => {
  const response = await request.post('/api/listing', { data: { url: 'https://www.finn.no/realestate/homes/ad/476576649', correlation: { generation: 1, requestId: 'pdf-only-ui' } } })
  expect(response.status()).toBe(503)
  expect(await response.json()).toMatchObject({ kind: 'rejected', code: 'disabled' })
})
