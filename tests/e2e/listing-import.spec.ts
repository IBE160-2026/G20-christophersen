import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createListingAdapter } from '../../src/backend/listing/adapter.ts'
import { convertedRecording, recordedBytes, recordedResponse, recordedUrl } from '../fixtures/listing/open-page-replay.ts'
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


test('opptak 476576649: gammel råkontrakt avvises uten oppdiktet utfylling', async ({ page }) => {
  let transports = 0
  const adapter = createListingAdapter(async () => { transports++; return recordedResponse() })
  await page.route('**/api/listing', async route => {
    await expect(adapter.import(recordedUrl)).rejects.toMatchObject({ code: 'unavailable' })
    await route.fulfill({ status: 502, json: { kind: 'rejected', code: 'unavailable' } })
  })
  await page.goto('/')
  await page.getByLabel('FINN-boliglenke', { exact: true }).fill(recordedUrl)
  await page.getByRole('button', { name: 'Hent FINN-grunnlag', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'FINN-import er utilgjengelig' })).toBeVisible()
  for (const id of ['P', 'D', 'J']) await expect(page.locator(`#value-${id}`)).toHaveValue('')
  expect(transports).toBe(1)
})

test('opptak 476576649: merket konvertering, kontroll, finansiering, separat PDF og resultat', async ({ page, request, baseURL }, testInfo) => {
  const external: string[] = []
  let imports = 0, analyses = 0
  const originalHash = createHash('sha256').update(recordedBytes).digest('hex')
  // Testserveren er fortsatt lukket. Bare denne nettleserens importrespons erstattes.
  const gate = await request.post('/api/listing', { data: { url: recordedUrl, correlation: { requestId: 'closed-gate-replay', generation: 0 } } })
  expect(gate.status()).toBe(503)
  expect(await gate.json()).toEqual({ kind: 'rejected', code: 'disabled' })
  await page.route('**/*', async route => {
    if (new URL(route.request().url()).origin !== new URL(baseURL!).origin) {
      external.push(route.request().url()); await route.abort(); return
    }
    await route.continue()
  })
  page.on('request', req => { if (req.url().endsWith('/api/analysis')) analyses++ })
  const adapter = createListingAdapter(async input => {
    imports++
    expect(input.input).toContain(recordedUrl)
    return convertedRecording()
  }, { now: () => new Date('2026-10-28T12:00:00.000Z') })
  await page.route('**/api/listing', async route => {
    const { url, correlation } = route.request().postDataJSON()
    expect(url).toBe(recordedUrl)
    await route.fulfill({ json: { kind: 'listing', correlation, listing: await adapter.import(url) } })
  })
  await page.goto('/')
  await expect(page.locator('.app-header')).toContainText('Demo · lagret KI-uttrekk')
  await page.getByLabel('FINN-boliglenke', { exact: true }).fill(recordedUrl)
  await page.getByRole('button', { name: 'Hent FINN-grunnlag', exact: true }).click()
  const row = (id: string) => page.locator('.listing-field').filter({ has: page.locator('legend', { hasText: new RegExp(`^${id}$`) }) })
  for (const [id, amount] of Object.entries({ price: '22900000', totalPrice: '23478641', documentTax: '572600', sharedDebt: '4951', commonCosts: '7226', propertyTax: '5125' })) {
    await expect(row(id)).toContainText(`Original: ${amount} NOK`)
    await expect(row(id).getByLabel(`Kontrollert beløp for ${id} (NOK)`, { exact: true })).toHaveValue(amount)
    await expect(row(id).getByRole('link', { name: 'Kilde', exact: true })).toHaveAttribute('href', recordedUrl)
    await expect(row(id)).toContainText('ikke ordrett FINN-sitat')
  }
  for (const id of ['purchaseCosts', 'municipalFees', 'sharedDebtPayment']) {
    await expect(row(id)).toContainText('Original: Ukjent')
    await expect(row(id).getByLabel(`Kontrollert beløp for ${id} (NOK)`, { exact: true })).toHaveValue('')
    await expect(row(id).getByRole('link')).toHaveCount(0)
  }
  await expect(row('commonCosts')).toContainText('Måned · år ukjent')
  await expect(row('propertyTax')).toContainText('År · år ukjent')
  // Oppgitt total kan ikke avstemmes uten samlet omkostning; P/D/J skal da ikke fylles.
  for (const id of ['P', 'D', 'J']) await expect(page.locator(`#value-${id}`)).toHaveValue('')
  await expect(page.getByText('Kontantbehov: Ukjent NOK.', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Bruk kontrollert grunnlag', exact: true })).toBeDisabled()
  const check = async (id: string) => { await row(id).getByRole('checkbox').check() }
  for (const id of ['price', 'totalPrice', 'documentTax', 'sharedDebt', 'commonCosts', 'propertyTax']) await check(id)
  await row('purchaseCosts').screenshot({ path: testInfo.outputPath('01-opptak-med-mangler.png') })
  // Testantakelse fra testeren, aldri fremstilt som en oppgitt annonseverdi.
  await row('purchaseCosts').getByLabel('Kontrollert beløp for purchaseCosts (NOK)', { exact: true }).fill('573690')
  await row('purchaseCosts').getByLabel('Begrunnelse/kilde for retting av purchaseCosts', { exact: true }).fill('Testantakelse: total minus pris og fellesgjeld; ikke oppgitt omkostning i opptaket.')
  await row('purchaseCosts').getByLabel('Inkludering for purchaseCosts', { exact: true }).selectOption('')
  await check('purchaseCosts')
  await row('documentTax').getByLabel('Inkludering for documentTax', { exact: true }).selectOption('purchaseCosts')
  await row('documentTax').getByLabel('Begrunnelse/kilde for retting av documentTax', { exact: true }).fill('Testantakelse: avgiften inngår i testens samlede omkostning.')
  await check('documentTax')
  await expect(page.getByText('Kontantbehov: 23473690 NOK.', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Bruk kontrollert grunnlag', exact: true }).click()
  await expect(page.locator('#value-P')).toHaveValue('22904951')
  await expect(page.locator('#status-P')).toHaveText('Registrert · Ubekreftet')
  // Korriger pris og tilsvarende total; det gamle originalbeløpet skal bevares.
  for (const [id, amount] of [['price', '22800000'], ['totalPrice', '23378641']]) {
    await row(id).getByLabel(`Kontrollert beløp for ${id} (NOK)`, { exact: true }).fill(amount!)
    await row(id).getByLabel(`Begrunnelse/kilde for retting av ${id}`, { exact: true }).fill('Eksplisitt brukerretting for offline UI-test, ingen ny kilde.')
    await check(id!)
  }
  await expect(row('price')).toContainText('Original: 22900000 NOK')
  await expect(page.locator('#value-P')).toHaveValue('22904951')
  await page.getByLabel('Egenkapital (NOK)', { exact: true }).fill('10000000')
  await page.getByLabel('Årsrente (%)', { exact: true }).fill('0')
  await page.getByLabel('Løpetid (måneder)', { exact: true }).fill('240')
  await page.getByLabel('År for gjeldsbetjening', { exact: true }).fill('2026')
  await expect(page.getByText('Kontantbehov: 23373690 NOK.', { exact: false })).toBeVisible()
  await expect(page.getByText('Eget lån: 13373690 NOK', { exact: false })).toContainText('Månedlig betaling: 55723.71 NOK')
  // Uavhengig fasit: Python Decimal, 50 siffer, r=0.06/12, n=240.
  await page.getByLabel('Årsrente (%)', { exact: true }).fill('6')
  await expect(page.getByText('Eget lån: 13373690 NOK', { exact: false })).toContainText('Månedlig betaling: 95813.27 NOK · Årlig egen betaling: 1149759.24 NOK')
  const slider = page.getByLabel('Egenkapital med slider (NOK)', { exact: true })
  await slider.focus(); await slider.press('End')
  await expect(page.getByLabel('Egenkapital (NOK)', { exact: true })).toHaveValue('23373690')
  await expect(page.getByText('Eget lån: 0 NOK', { exact: false })).toBeVisible()
  await page.getByLabel('Egenkapital (NOK)', { exact: true }).fill('10000000')
  await page.getByRole('button', { name: 'Bruk kontrollert grunnlag', exact: true }).click()
  await expect(page.locator('#value-P')).toHaveValue('22804951')
  await expect(page.locator('#source-P')).toHaveValue(/Brukerrettinger:.*price: Eksplisitt brukerretting for offline UI-test, ingen ny kilde/ )
  await expect(page.locator('#source-P')).toHaveValue(/Original og rettinger er bevart i brukt importgrunnlag/ )
  await expect(row('price')).toContainText('Original: 22900000 NOK')
  await expect(row('price').getByLabel('Kontrollert beløp for price (NOK)', { exact: true })).toHaveValue('22800000')
  for (const id of ['D', 'J']) await expect(page.locator(`#value-${id}`)).toHaveValue('')
  // Kompletter manglende screeninggrunnlag med tydelig manuelle testantakelser.
  for (const [id, value] of Object.entries({ L: '1500000', D: '100000', J: '700000', Ymin: '5' })) {
    await page.locator(`#value-${id}`).fill(value)
    await page.locator(`#source-kind-${id}`).selectOption('assumption')
    await page.locator(`#source-${id}`).fill(`Manuell offline testantakelse ${id}, ikke FINN-data`)
  }
  for (const id of ['L', 'D', 'J']) {
    await page.locator(`#period-${id}`).selectOption('year')
    await page.locator(`#year-${id}`).fill('2026')
  }
  await page.locator('#rent-nature-L').selectOption('expected')
  await page.locator('#confirm-financial').click()
  await expect(page.locator('#confirmation-status')).toContainText('Tallgrunnlaget er bekreftet')
  await page.locator('#next-step').click()
  expect(analyses).toBe(0)
  await expect(page.locator('#report-file')).toHaveValue('')
  const pdf = new URL('../fixtures/property-cases/F1-tilstandsrapport.pdf', import.meta.url)
  await page.locator('#report-file').setInputFiles(fileURLToPath(pdf))
  await expect(page.locator('#analysis-status')).toHaveText('Rapport valgt — ingen analyse startet.')
  expect(analyses).toBe(0)
  await page.getByRole('button', { name: 'Start analyse', exact: true }).click()
  await page.getByRole('button', { name: 'Gå til Kontroller funn', exact: true }).click()
  await expect(page.locator('.finding-list > li')).toHaveCount(1)
  await expect(page.locator('.finding-list')).toContainText('TG2 · Slitt overflate på baderomsgulv')
  await expect(page.locator('.finding-list')).toContainText('F1-tilstandsrapport.pdf · PDF-side 2')
  for (const finding of await page.locator('.finding-list > li').all()) {
    await finding.locator('.finding-select').click()
    await expect(page.locator('#pdf-status')).toContainText('PDF-side 2: Originalside tilgjengelig')
    await expect(page.locator('.textLayer')).toContainText('Slitt overflate')
    await finding.getByRole('button', { name: 'Bekreft', exact: true }).click()
  }
  await page.getByRole('button', { name: 'Bekreft gjeldende liste', exact: true }).click()
  await expect(page.locator('.finding-list-control')).toHaveAttribute('data-control-completed', /\d+/)
  await page.getByRole('button', { name: 'Beregn og vis resultat', exact: true }).click()
  await expect(page.locator('#recommendation-title')).toHaveText('Gå videre')
  await expect(page.locator('.metric-value')).toHaveText(['6,578 %', '1 400 000 kr/år', '6,139 %', '700 000 kr/år'])
  await expect(page.locator('.result-report')).toContainText('F1-tilstandsrapport.pdf')
  await page.screenshot({ path: testInfo.outputPath('02-resultat.png'), fullPage: true })
  expect(imports).toBe(1); expect(analyses).toBe(1); expect(external).toEqual([])
  expect(createHash('sha256').update(readFileSync(new URL('../../.docs/process/arbeidsokter/finn-open-page-2026-10-28/response.json', import.meta.url))).digest('hex')).toBe(originalHash)
})
