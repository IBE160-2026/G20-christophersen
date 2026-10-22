import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { AnalysisHttpCorrelationSchema } from '../../src/contracts/analysis-http.ts'
import { bindAnalysisOutcome } from '../../src/contracts/analysis-validation.ts'
import oracle from '../fixtures/property-cases/expected.json' with { type: 'json' }

async function controlled(page: Page, caseId: 'F1' | 'F2' | 'F4', rejectUncertain = false) {
  await page.goto('/')
  for (const [field, value] of Object.entries({ P: '16000000', L: caseId === 'F2' ? '1400000' : '1900000', D: '400000', J: '800000', Ymin: '7' })) {
    await page.locator(`#value-${field}`).fill(value)
    await page.locator(`#source-kind-${field}`).selectOption('assumption')
    await page.locator(`#source-${field}`).fill(`Kontrollert ${field}`)
  }
  for (const field of ['L', 'D', 'J']) {
    await page.locator(`#period-${field}`).selectOption('year')
    await page.locator(`#year-${field}`).fill('2026')
  }
  await page.locator('#rent-nature-L').selectOption('expected')
  await page.locator('#confirm-financial').click(); await page.locator('#next-step').click()
  await page.locator('#report-file').setInputFiles(fileURLToPath(new URL(`../fixtures/property-cases/${caseId}-tilstandsrapport.pdf`, import.meta.url)))
  await expect(page.locator('#analysis-status')).toContainText('Rapport valgt')
  await page.getByRole('button', { name: 'Start analyse', exact: true }).click()
  await page.getByRole('button', { name: 'Gå til Kontroller funn', exact: true }).click()
  await page.locator('#findings-title').scrollIntoViewIfNeeded()
  await expect(page.locator('.report-findings')).toHaveAttribute('data-list-visible-generation', /\d+/)
  for (const row of await page.locator('.finding-list > li').all()) {
    await row.locator('.finding-select').click()
    await row.getByRole('button', { name: rejectUncertain ? 'Avvis' : 'Bekreft', exact: true }).click()
    if ((await row.locator('.finding-select').innerText()).startsWith('TG3')) await page.getByLabel('TG3-status for gjeldende forhold').selectOption('unresolved')
  }
  await page.getByRole('button', { name: 'Bekreft gjeldende liste', exact: true }).click()
  await expect(page.locator('.finding-list-control')).toHaveAttribute('data-control-completed', /\d+/)
}
for (const [id, recommendation, expected] of [
  ['F1', 'Gå videre', ['11,875 %', '1 500 000 kr/år', '9,375 %', '700 000 kr/år']],
  ['F2', 'Forkast', ['8,750 %', '1 000 000 kr/år', '6,250 %', '200 000 kr/år']],
  ['F4', 'Innhent mer informasjon', ['11,875 %', '1 500 000 kr/år', '9,375 %', '700 000 kr/år']],
] as const) {
  test(`3.7 AC1/2/5/6 ${id}: kontrollert bygget demo, anbefaling/fasit, originalside, retur og fokus`, async ({ page, baseURL }, testInfo) => {
    let calls = 0
    const external: string[] = []
    page.on('request', req => { if (req.url().endsWith('/api/analysis')) calls++; if (!req.url().startsWith(baseURL!)) external.push(req.url()) })
    await controlled(page, id)
    const go = page.getByRole('button', { name: 'Beregn og vis resultat', exact: true })
    await go.focus(); await go.press('Enter')
    await expect(page.getByRole('heading', { name: 'Resultat', exact: true })).toBeFocused()
    await expect(page.locator('#recommendation-title')).toHaveText(recommendation)
    await expect(page.locator('.recommendation > .meta')).toHaveText(`Kodebestemt screeninganbefaling · Prioritet ${id === 'F1' ? 3 : id === 'F2' ? 2 : 1}`)
    await expect(page.locator('.recommendation > p').nth(1)).toHaveText(id === 'F1'
      ? 'Nettoyield oppfyller ditt avkastningskrav. Kontantstrøm før skatt er null eller positiv. Teknisk grunnlag er tilstrekkelig for førstevurdering.'
      : id === 'F2' ? 'Økonomiske minimumskrav er ikke oppfylt. Nettoyield er lavere enn ditt avkastningskrav.' : 'Kritisk grunnlag er utilstrekkelig.')
    await expect(page.locator('.result-triggers > li > p:first-child')).toHaveText(id === 'F1'
      ? ['Nettoyield oppfyller ditt avkastningskrav.', 'Kontantstrøm før skatt er null eller positiv.', 'Teknisk grunnlag er tilstrekkelig for førstevurdering.']
      : id === 'F2' ? ['Nettoyield er lavere enn ditt avkastningskrav.']
        : ['Alvorlig TG3 er uavklart: F4-TG3-1: Alvorlig lekkasje i tak (F4-tilstandsrapport.pdf, PDF-side 4). Velg eksplisitt Avklart med nødvendig grunnlag, eller behold Uavklart. Oppgi en kort begrunnelse for at forholdet er tilstrekkelig avklart for førstevurdering. Oppgi konkret eksternt avklaringsgrunnlag, for eksempel kontroll fra autorisert elektriker med dato eller referanse.'])
    if (id !== 'F4') await expect(page.locator('.result-triggers')).toContainText(`Nettoyield: ${id === 'F1' ? '9,375' : '6,250'} % · Ditt avkastningskrav (Ymin): 7 %`)
    await expect(page.locator('#result-announcement')).toHaveText(`Resultat beregnet: ${recommendation}.`)
    await expect(page.locator('.metric-value')).toHaveText([...expected])
    await expect(page.locator('.recommendation details')).toHaveCount(0)
    await expect(page.locator('.result-next-action')).toContainText(id === 'F1' ? 'Gå videre til grundigere vurdering/befaring.' : id === 'F2' ? 'Forkast objektet' : 'avklaringsgrunnlag')
    await expect(page.locator('.app-header')).toContainText('Demo · lagret KI-uttrekk')
    if (id === 'F4') {
      await expect(page.locator('.result-severe')).toBeVisible()
      await expect(page.locator('.result-severe')).toHaveText('TG3 · Alvorlig lekkasje i tak')
      await expect(page.locator('.result-tg3')).toContainText('Uavklart')
      await expect(page.locator('.result-triggers')).toContainText('F4-TG3-1')
      await expect(page.getByText('Delgrunnlag', { exact: true })).toHaveCount(4)
    }
    await page.locator('#resultat').scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath(`${id}-oversikt.png`) })
    const detail = page.locator('.result-findings details').last()
    await detail.locator('summary').focus(); await detail.locator('summary').press('Enter')
    await expect(detail.getByRole('heading', { name: 'Opprinnelig KI-uttrekk', exact: true })).toBeVisible()
    await detail.locator('summary').press('Space'); await expect(detail).toHaveJSProperty('open', false)
    await page.screenshot({ path: testInfo.outputPath(`${id}-resultat.png`) })
    await page.getByRole('button', { name: `Se originalside — ${id}-${id === 'F4' ? 'TG3' : 'TG2'}-1`, exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Kontroller funn', exact: true })).toBeFocused()
    await expect(page.locator('.textLayer')).toContainText(id === 'F4' ? 'Alvorlig lekkasje i tak' : 'Slitt overflate')
    await expect(page.locator('.source-original')).toContainText(`PDF-side ${id === 'F4' ? 4 : 2}`)
    await page.getByRole('button', { name: 'Vis resultat', exact: true }).click()
    await page.getByRole('button', { name: 'Endre tallgrunnlag', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Tallgrunnlag', exact: true })).toBeFocused()
    await expect(page.locator('#value-L')).toHaveValue(id === 'F2' ? '1400000' : '1900000')
    await page.getByRole('button', { name: /Resultat Trinn 4/ }).click()
    await expect(page.locator('#recommendation-title')).toHaveText(recommendation)
    await page.getByRole('button', { name: 'Gå tilbake til rapportfunn', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Kontroller funn', exact: true })).toBeFocused()
    await expect(page.locator('#findings-title')).toHaveText('Funnliste — bekreftet')
    expect(calls).toBe(1); expect(external).toEqual([])
  })
}

test('3.7 AC4/6: historisk vern, én kunngjøring, sticky trinn og 200 prosent tilsvarende ombrytning', async ({ page }, testInfo) => {
  await controlled(page, 'F1')
  await page.getByRole('button', { name: 'Beregn og vis resultat', exact: true }).click()
  await page.getByRole('button', { name: 'Endre tallgrunnlag', exact: true }).click()
  await page.locator('#value-L').fill('1400000')
  await expect(page.locator('#result-announcement')).toHaveText('Resultatet er utdatert. Kontroller endret grunnlag før ny vurdering.')
  await page.getByRole('button', { name: /Resultat Trinn 4/ }).click()
  await expect(page.locator('.result-stale')).toContainText('L: verdi er endret.')
  await expect(page.locator('#recommendation-title')).toHaveText('Gå videre')
  await expect(page.locator('.metric-value').nth(1)).toHaveText('1 500 000 kr/år')
  // 1440×900 ved 200 % gir 720×450 CSS px; innholdet må ombrytes uten tap.
  await page.setViewportSize({ width: 720, height: 450 })
  await page.getByRole('button', { name: 'Endre tallgrunnlag', exact: true }).scrollIntoViewIfNeeded()
  await expect(page.locator('.step-navigation')).toBeInViewport()
  expect(await page.locator('.workspace').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  await page.locator('#resultat').scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath('historisk-200-prosent.png') })
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.getByRole('button', { name: 'Gå tilbake til rapportfunn', exact: true }).scrollIntoViewIfNeeded()
  expect(await page.locator('.workspace').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
})

for (const reject of [false, true]) {
  test(`3.7 AC2 AT13: ${reject ? 'avvist original' : 'brukt korrigering'} og originalrapport er tilgjengelig med bevart opphav`, async ({ page }) => {
    await controlled(page, 'F1')
    await page.getByRole('button', { name: 'TG2 · Slitt overflate på baderomsgulv', exact: true }).click()
    await page.getByRole('button', { name: 'Korriger', exact: true }).click()
    await page.getByLabel('Beskrivelse fra rapporten').fill('Slitt baderomsgulv — kontrollert i originalen')
    await page.getByRole('button', { name: 'Bruk korrigering', exact: true }).click()
    if (reject) await page.getByRole('button', { name: 'Avvis', exact: true }).click()
    else await page.getByRole('button', { name: 'Bekreft', exact: true }).click()
    await page.getByRole('button', { name: 'Bekreft gjeldende liste', exact: true }).click()
    await page.getByRole('button', { name: 'Beregn og vis resultat', exact: true }).click()
    const detail = page.locator('.result-findings details')
    await detail.locator('summary').click()
    await expect(detail.getByRole('heading', { name: 'Opprinnelig KI-uttrekk', exact: true })).toBeVisible()
    await expect(detail.getByRole('heading', { name: 'Brukerens korrigering', exact: true })).toBeVisible()
    await expect(detail).toContainText('Slitt overflate på baderomsgulv')
    await expect(detail).toContainText('Slitt baderomsgulv — kontrollert i originalen')
    if (reject) {
      await expect(detail).toContainText('Brukeravvist — ikke aktivt rapportfunn')
      await expect(page.getByRole('heading', { name: 'TG2 · Slitt baderomsgulv — kontrollert i originalen', exact: true })).toHaveCount(0)
      await detail.getByRole('button', { name: 'Se avvist original i rapportkontroll', exact: true }).click()
    } else await page.getByRole('button', { name: 'Se originalside — F1-TG2-1', exact: true }).click()
    await expect(page.locator('.textLayer')).toContainText('Slitt overflate på baderomsgulv')
    await page.getByRole('button', { name: 'Vis resultat', exact: true }).click()
    await page.getByRole('button', { name: 'Åpne originalrapport i rapportkontroll', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Kontroller funn', exact: true })).toBeFocused()
    await expect(page.locator('.source-original')).toContainText('Originalrapport · F1-tilstandsrapport.pdf')
    await expect(page.locator('.source-original')).toContainText('PDF-side 1')
    await expect(page.locator('.textLayer')).toContainText('FIKTIV TILSTANDSRAPPORT')
  })
}

test('3.7 AC6: gyldighetsstatus kunngjøres én gang og detaljbetjening/trinnretur stjeler ikke fokus', async ({ page }) => {
  await controlled(page, 'F1')
  await page.evaluate(() => {
    const state = { changes: 0 }
    Object.assign(window, { resultAnnouncementProof: state })
    new MutationObserver(() => { state.changes++ }).observe(document.querySelector('#result-announcement')!, { subtree: true, childList: true, characterData: true })
  })
  await page.getByRole('button', { name: 'Beregn og vis resultat', exact: true }).click()
  const count = () => page.evaluate(() => (window as unknown as { resultAnnouncementProof: { changes: number } }).resultAnnouncementProof.changes)
  expect(await count()).toBe(1)
  const summary = page.locator('.financial-metric summary').first()
  await summary.focus(); await summary.press('Enter')
  await expect(summary).toBeFocused()
  await expect(summary).toHaveCSS('outline-style', 'solid')
  expect(await count()).toBe(1)
  await page.getByRole('button', { name: 'Endre tallgrunnlag', exact: true }).click()
  expect(await count()).toBe(1)
  await page.getByRole('button', { name: /Resultat Trinn 4/ }).click()
  expect(await count()).toBe(1)
  await page.getByRole('button', { name: 'Endre tallgrunnlag', exact: true }).click()
  await page.locator('#value-L').fill('1400000')
  await expect(page.locator('#value-L')).toBeFocused()
  expect(await count()).toBe(2)
  await page.getByRole('button', { name: /Resultat Trinn 4/ }).click()
  expect(await count()).toBe(2)
})

test('review E1/A1: avvist fremmed originalkilde velger aldri en side i aktiv PDF', async ({ page }) => {
  await page.route('**/api/analysis', async route => {
    const headers = await route.request().allHeaders()
    const correlation = AnalysisHttpCorrelationSchema.parse({ sessionId: headers['x-session-id'], requestId: headers['x-request-id'], generation: Number(headers['x-analysis-generation']) })
    const fixture = oracle.cases.find(item => item.caseId === 'F1')!
    const bytes = readFileSync(new URL(`../fixtures/property-cases/${fixture.documentName}`, import.meta.url))
    // Kontrollert kontrakt ved HTTP-grensen; de tre hovedcasene prøver ordinær PDF-/demopipeline.
    const outcome = bindAnalysisOutcome({ contractVersion: '2', extractionVersion: '1', mode: 'demo',
      requestId: correlation.requestId, reportHash: createHash('sha256').update(bytes).digest('hex'), documentName: fixture.documentName,
      pageCount: fixture.pageCount, pages: Array.from({ length: fixture.pageCount }, (_, index) => ({ pdfPage: index + 1, text: 'Fiktiv rapport', status: 'readable', reason: null })) }, {
      contractVersion: '2', extractionVersion: '1', status: 'completed', limitations: [], findings: [{ findingId: 'wrong-source', grade: 'TG2', description: 'Feil KI-kilde',
        source: { documentName: 'Annen-rapport.pdf', reportHash: 'a'.repeat(64), pdfPage: 2 }, uncertainties: [] }],
    })
    await route.fulfill({ json: { kind: 'analysis', correlation, outcome } })
  })
  await controlled(page, 'F1', true)
  await page.getByRole('button', { name: 'Beregn og vis resultat', exact: true }).click()
  await expect(page.locator('#recommendation-title')).toHaveText('Gå videre')
  const detail = page.locator('.result-findings details')
  await detail.locator('summary').click()
  await detail.getByRole('button', { name: 'Se avvist original i rapportkontroll', exact: true }).click()
  await expect(page.locator('#pdf-status')).toContainText('samsvarer ikke med valgt originalrapport')
  await expect(page.locator('.pdf-identity')).toContainText('PDF-side ukjent')
  await expect(page.locator('.pdf-canvas-holder')).not.toHaveAttribute('data-pdf-page')
  await expect(page.locator('.pdf-controls button').first()).toBeDisabled()
  await expect(page.locator('.pdf-controls button').nth(1)).toBeDisabled()
})

test('review B7: historisk kilde åpner bevart side uten ny aktiv funnversjon som kildekontekst', async ({ page }) => {
  await controlled(page, 'F1')
  await page.getByRole('button', { name: 'Beregn og vis resultat', exact: true }).click()
  await page.getByRole('button', { name: 'Gå tilbake til rapportfunn', exact: true }).click()
  await page.getByRole('button', { name: 'TG2 · Slitt overflate på baderomsgulv', exact: true }).click()
  await page.getByRole('button', { name: 'Korriger', exact: true }).click()
  await page.getByLabel('Beskrivelse fra rapporten').fill('Ny aktiv beskrivelse for kontroll')
  await page.getByLabel('Fysisk PDF-side').fill('3')
  await page.getByRole('button', { name: 'Bruk korrigering', exact: true }).click()
  await page.getByRole('button', { name: /Resultat Trinn 4/ }).click()
  await page.getByRole('button', { name: 'Se originalside — F1-TG2-1', exact: true }).click()
  await expect(page.locator('.source-original > p').first()).toHaveText('Originalrapport · F1-tilstandsrapport.pdf')
  await expect(page.locator('.source-original')).not.toContainText('Ny aktiv beskrivelse for kontroll')
  await expect(page.locator('.pdf-identity')).toContainText('PDF-side 2')
  await expect(page.locator('.textLayer')).toContainText('Slitt overflate')
})

test('review B11: hele originalrapporten får presise etiketter og tastaturretur i smalt panel', async ({ page }) => {
  await controlled(page, 'F1')
  await page.getByRole('button', { name: 'Beregn og vis resultat', exact: true }).click()
  await page.setViewportSize({ width: 900, height: 700 })
  await page.getByRole('button', { name: 'Åpne originalrapport i rapportkontroll', exact: true }).click()
  const opener = page.getByRole('button', { name: 'Åpne originalrapport', exact: true })
  await opener.focus(); await opener.press('Enter')
  await expect(page.getByRole('heading', { name: 'Originalrapport', exact: true })).toBeFocused()
  await expect(page.locator('dialog')).toContainText('Originalrapport · F1-tilstandsrapport.pdf')
  await expect(page.locator('dialog .pdf-identity')).toContainText('PDF-side 1')
  await expect(page.locator('dialog .textLayer')).toContainText('FIKTIV TILSTANDSRAPPORT')
  await page.keyboard.press('Escape')
  await expect(opener).toBeFocused()
})

async function returnThroughControls(page: Page) {
  await page.locator('#confirm-financial').click()
  await expect(page.locator('#confirmation-status')).toContainText('Tallgrunnlaget er bekreftet')
  await page.locator('#next-step').click()
  await expect(page.getByRole('heading', { name: 'Tilstandsrapport', exact: true })).toBeFocused()
  await expect(page.locator('#analysis-start-reason')).toContainText('Uendret rapportuttrekk gjenbrukes')
  await page.getByRole('button', { name: 'Gå til Kontroller funn', exact: true }).click()
  await expect(page.locator('#findings-title')).toHaveText('Funnliste — bekreftet')
  await page.getByRole('button', { name: 'Vis resultat', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Resultat', exact: true })).toBeFocused()
  await expect(page.locator('.screen-heading > .status-label')).toHaveText('Gjeldende')
  await expect(page.locator('.result-stale')).toHaveCount(0)
}

test('3.8 BT-12 AC1/2/4/5: offline ugyldig→rettet→bekreftet L gir F2 uten ny analyse og med fokus/status', async ({ page, baseURL }, testInfo) => {
  let calls = 0
  const external: string[] = []
  await page.route('**/*', async route => {
    if (new URL(route.request().url()).origin !== new URL(baseURL!).origin) {
      external.push(route.request().url()); await route.abort(); return
    }
    if (route.request().url().endsWith('/api/analysis')) calls++
    await route.continue()
  })
  await controlled(page, 'F1')
  await page.getByRole('button', { name: 'Beregn og vis resultat', exact: true }).click()
  await page.getByRole('button', { name: 'Endre tallgrunnlag', exact: true }).click()
  // Uendret retur skal bevare gjeldende F1, uten ny bekreftelse.
  await page.getByRole('button', { name: /Resultat Trinn 4/ }).click()
  await expect(page.locator('.screen-heading > .status-label')).toHaveText('Gjeldende')
  await expect(page.locator('#recommendation-title')).toHaveText('Gå videre')
  await page.getByRole('button', { name: 'Endre tallgrunnlag', exact: true }).click()
  await page.locator('#value-L').fill('-1')
  await page.locator('#confirm-financial').click()
  await expect(page.locator('#value-L')).toBeFocused()
  await expect(page.locator('#value-L')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.locator('#field-issues-L')).toContainText('negativ')
  await expect(page.locator('#confirmation-status')).toContainText('Endret grunnlag: L')
  await expect(page.locator('#status-P')).toContainText('Bekreftet')
  await expect(page.locator('#status-D')).toContainText('Bekreftet')
  await expect(page.locator('#next-step')).toHaveCount(0)
  await page.screenshot({ path: testInfo.outputPath('ugyldig-finans-fokus.png') })
  await page.getByRole('button', { name: /Resultat Trinn 4/ }).click()
  await expect(page.locator('.result-stale')).toContainText('L: verdi er endret.')
  await expect(page.locator('.result-stale')).toContainText('Kontroller og bekreft berørt tallgrunnlag for L')
  await expect(page.locator('#recommendation-title')).toHaveText('Gå videre')
  await expect(page.locator('.metric-value')).toHaveText(['11,875 %', '1 500 000 kr/år', '9,375 %', '700 000 kr/år'])
  await page.getByRole('button', { name: 'Endre tallgrunnlag', exact: true }).click()
  await page.locator('#value-L').fill('1400000')
  await returnThroughControls(page)
  await expect(page.locator('#recommendation-title')).toHaveText('Forkast')
  await expect(page.locator('.metric-value')).toHaveText(['8,750 %', '1 000 000 kr/år', '6,250 %', '200 000 kr/år'])
  await expect(page.locator('#result-announcement')).toHaveText('Resultat beregnet: Forkast.')
  await expect(page.locator('.result-findings')).toContainText('F1-tilstandsrapport.pdf')
  await page.screenshot({ path: testInfo.outputPath('fornyet-f2.png') })
  await page.getByRole('button', { name: 'Gå tilbake til rapportfunn', exact: true }).click()
  await expect(page.locator('#list-confirmation-status')).toContainText('Kontroll fullført')
  expect(calls).toBe(1); expect(external).toEqual([])
})

for (const missing of [false, true]) {
  test(`3.8 BT-13 AC3: ${missing ? 'manglende Ymin rettes til' : 'bare Ymin endres til'} 10 %, samme fire nøkkeltall`, async ({ page }) => {
    let calls = 0
    page.on('request', request => { if (request.url().endsWith('/api/analysis')) calls++ })
    await controlled(page, 'F1')
    await page.getByRole('button', { name: 'Beregn og vis resultat', exact: true }).click()
    const metrics = await page.locator('.metric-value').allTextContents()
    await page.getByRole('button', { name: 'Endre tallgrunnlag', exact: true }).click()
    if (missing) {
      await page.locator('#value-Ymin').fill('')
      await page.locator('#confirm-financial').click()
      await expect(page.locator('#value-Ymin')).toBeFocused()
      await expect(page.locator('.local-deficiencies')).toContainText('Innhent mer informasjon')
      await expect(page.locator('#next-step')).toHaveCount(0)
    }
    await page.locator('#value-Ymin').fill('10')
    await expect(page.locator('#status-Ymin')).toContainText('Endret — må kontrolleres på nytt')
    await page.getByRole('button', { name: /Resultat Trinn 4/ }).click()
    await expect(page.locator('.result-stale')).toContainText('Ymin')
    await expect(page.locator('#recommendation-title')).toHaveText('Gå videre')
    await expect(page.locator('.metric-value')).toHaveText(metrics)
    await page.getByRole('button', { name: 'Endre tallgrunnlag', exact: true }).click()
    await returnThroughControls(page)
    await expect(page.locator('#recommendation-title')).toHaveText('Forkast')
    await expect(page.locator('.result-triggers')).toContainText('Ditt avkastningskrav (Ymin): 10 %')
    await expect(page.locator('.metric-value')).toHaveText(metrics)
    expect(calls).toBe(1)
  })
}

for (const [rent, metrics] of [
  ['1400000', ['8,750 %', '1 000 000 kr/år', '6,250 %', '200 000 kr/år']],
  ['3000000', ['18,750 %', '2 600 000 kr/år', '16,250 %', '1 800 000 kr/år']],
] as const) {
  test(`3.8 AC4 F4: L=${rent} fornyer økonomien og gjenbruker uavklart alvorlig TG3 med prioritet 1`, async ({ page }) => {
    let calls = 0
    page.on('request', request => { if (request.url().endsWith('/api/analysis')) calls++ })
    await controlled(page, 'F4')
    await page.getByRole('button', { name: 'Beregn og vis resultat', exact: true }).click()
    await page.getByRole('button', { name: 'Endre tallgrunnlag', exact: true }).click()
    await page.locator('#value-L').fill(rent)
    await returnThroughControls(page)
    await expect(page.locator('#recommendation-title')).toHaveText('Innhent mer informasjon')
    await expect(page.locator('.recommendation > .meta')).toContainText('Prioritet 1')
    await expect(page.locator('.metric-value')).toHaveText([...metrics])
    await expect(page.locator('.result-tg3')).toContainText('Uavklart')
    await expect(page.locator('.result-triggers')).toContainText('F4-TG3-1')
    await expect(page.getByText('Delgrunnlag', { exact: true })).toHaveCount(4)
    expect(calls).toBe(1)
  })
}

test('3.8 AT-10: fornyelse ved nøyaktig 7 % består; én krone under gir Forkast med avrundingsforklaring', async ({ page }) => {
  let calls = 0
  page.on('request', request => { if (request.url().endsWith('/api/analysis')) calls++ })
  await controlled(page, 'F1')
  await page.getByRole('button', { name: 'Beregn og vis resultat', exact: true }).click()
  for (const [rent, recommendation, noi, cashFlow] of [
    ['1520000', 'Gå videre', '1 120 000 kr/år', '320 000 kr/år'],
    ['1519999', 'Forkast', '1 119 999 kr/år', '319 999 kr/år'],
  ]) {
    await page.getByRole('button', { name: 'Endre tallgrunnlag', exact: true }).click()
    await page.locator('#value-L').fill(rent!)
    await returnThroughControls(page)
    await expect(page.locator('#recommendation-title')).toHaveText(recommendation!)
    await expect(page.locator('.metric-value').nth(1)).toHaveText(noi!)
    await expect(page.locator('.metric-value').nth(2)).toHaveText('7,000 %')
    await expect(page.locator('.metric-value').nth(3)).toHaveText(cashFlow!)
    if (recommendation === 'Forkast') await expect(page.locator('.financial-metric').nth(2)).toContainText('under')
  }
  expect(calls).toBe(1)
})

test('3.8 AT-11: fornyelse med kontantstrøm 0 består; −1 kr gir Forkast', async ({ page }) => {
  let calls = 0
  page.on('request', request => { if (request.url().endsWith('/api/analysis')) calls++ })
  await controlled(page, 'F1')
  await page.getByRole('button', { name: 'Beregn og vis resultat', exact: true }).click()
  for (const [debt, recommendation, cashFlow] of [
    ['1500000', 'Gå videre', '0 kr/år'], ['1500001', 'Forkast', '−1 kr/år'],
  ]) {
    await page.getByRole('button', { name: 'Endre tallgrunnlag', exact: true }).click()
    await page.locator('#value-J').fill(debt!)
    await returnThroughControls(page)
    await expect(page.locator('#recommendation-title')).toHaveText(recommendation!)
    await expect(page.locator('.metric-value')).toHaveText(['11,875 %', '1 500 000 kr/år', '9,375 %', cashFlow!])
  }
  expect(calls).toBe(1)
})
