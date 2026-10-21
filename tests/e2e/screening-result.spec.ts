import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { fileURLToPath } from 'node:url'

async function controlled(page: Page, caseId: 'F1' | 'F2' | 'F4') {
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
    await row.getByRole('button', { name: 'Bekreft', exact: true }).click()
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
