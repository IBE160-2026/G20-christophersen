// Egen automatisk støtteprøve av faktiske README-handlinger, ikke tekstkontroll.
// Kjør fra reporoten mot separat startet standarddemo: node .docs/implementation-artifacts/story-5-3-oppskrift-kontroll.mjs
import { chromium, expect } from '@playwright/test'
import { resolve } from 'node:path'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const external = []
await page.route('**/*', async route => {
  const url = new URL(route.request().url())
  if (url.origin === 'http://127.0.0.1:3000') await route.continue()
  else { external.push(url.origin); await route.abort() }
})
const fixture = name => resolve('tests/fixtures/property-cases', name)
const costs = [
  ['Felleskostnader uten gjeldsbetjening', '120000', '0'],
  ['Kommunale avgifter/eiendomsskatt', '80000', '0'],
  ['Forsikring', '40000', '0'], ['Forvaltning', '60000', '0'],
  ['Løpende vedlikehold', '100000', '0'],
  ['Gjeldsbetjening: renter 600000 + avdrag 200000', '800000', '800000'],
]
async function financial(id) {
  await page.goto('http://127.0.0.1:3000')
  for (const [field, value] of Object.entries({ P:'16000000', L:id === 'F3' ? '' : id === 'F2' ? '1400000' : '1900000', D:'400000', J:'800000', Ymin:'7' })) {
    await page.locator(`#value-${field}`).fill(value)
    await page.locator(`#source-kind-${field}`).selectOption('assumption')
    await page.locator(`#source-${field}`).fill(`${id} — kontrollert fiktiv ${field} fra expected.json`)
  }
  for (const field of ['L','D','J']) {
    await page.locator(`#period-${field}`).selectOption('year')
    await page.locator(`#year-${field}`).fill('2026')
  }
  await page.locator('#rent-nature-L').selectOption('expected')
  for (const [index, [label, amount, debt]] of costs.entries()) {
    await page.getByRole('button',{name:'Legg til kostnadsinnhold',exact:true}).click()
    const post = page.locator('.cost-item').nth(index)
    await post.getByLabel(`Navn på post ${index+1}`,{exact:true}).fill(label)
    await post.getByLabel(`Samlet beløp, post ${index+1} (NOK)`,{exact:true}).fill(amount)
    await post.getByLabel(`Herav renter/avdrag, post ${index+1} (NOK)`,{exact:true}).fill(debt)
  }
  await expect(page.locator('#cost-summary')).toContainText('D 400000 NOK · J 800000 NOK')
  await page.locator('#confirm-financial').click()
}
async function analyze(name) {
  await page.locator('#report-file').setInputFiles(fixture(name))
  await expect(page.locator('#analysis-status')).toContainText('Rapport valgt')
  await page.getByRole('button',{name:'Start analyse',exact:true}).click()
}
async function control(id) {
  await page.getByRole('button',{name:'Gå til Kontroller funn',exact:true}).click()
  for (const row of await page.locator('.finding-list > li').all()) {
    await row.locator('.finding-select').click()
    await expect(page.locator('.textLayer')).toContainText(id === 'F4' && (await row.locator('.finding-select').innerText()).startsWith('TG3') ? 'Alvorlig lekkasje i tak' : 'Slitt overflate')
    await row.getByRole('button',{name:'Bekreft',exact:true}).click()
    if ((await row.locator('.finding-select').innerText()).startsWith('TG3')) await page.getByLabel('TG3-status for gjeldende forhold').selectOption('unresolved')
  }
  await page.getByRole('button',{name:'Bekreft gjeldende liste',exact:true}).click()
  await page.getByRole('button',{name:/^(Beregn og vis resultat|Vis resultat)$/}).click()
}
try {
  for (const [id, recommendation] of [['F1','Gå videre'],['F2','Forkast'],['F4','Innhent mer informasjon']]) {
    await financial(id)
    await page.locator('#next-step').click()
    await analyze(`${id}-tilstandsrapport.pdf`)
    await control(id)
    await expect(page.locator('#recommendation-title')).toHaveText(recommendation)
    await expect(page.locator('.metric-value')).toHaveText(id === 'F2' ? ['8,750 %','1 000 000 kr/år','6,250 %','200 000 kr/år'] : ['11,875 %','1 500 000 kr/år','9,375 %','700 000 kr/år'])
    if (id === 'F4') await expect(page.getByText('Delgrunnlag',{exact:true})).toHaveCount(4)
    console.log(`${id}: seks kostnadsposter, ekte PDF, original/funn/liste/TG3 → ${recommendation}, fire fasittall bestått`)
    if (id === 'F1') {
      await page.getByRole('button',{name:'Endre tallgrunnlag',exact:true}).click()
      await expect(page.locator('#confirmation-status')).toContainText('Tallgrunnlaget er bekreftet')
      await page.locator('#value-L').fill('1400000')
      await page.getByRole('button',{name:/Resultat Trinn 4/}).click()
      await expect(page.locator('.result-stale')).toBeVisible()
      await expect(page.locator('#recommendation-title')).toHaveText('Gå videre')
      await page.getByRole('button',{name:'Endre tallgrunnlag',exact:true}).click()
      await page.locator('#source-L').fill('Endret F1-finansvariant — L1400000 fra F2-fasit')
      await page.locator('#confirm-financial').click()
      await page.getByRole('button',{name:/Kontroller funn Trinn 3/}).click()
      await page.getByRole('button',{name:'Vis resultat',exact:true}).click()
      await expect(page.locator('#recommendation-title')).toHaveText('Forkast')
      console.log('Retur: bekreftelser bevart; faktisk L-endring → historisk resultat; ny kontroll/beregning → Forkast')
    }
  }
  await financial('F3')
  await expect(page.locator('.local-deficiencies')).toContainText('L: Verdien mangler')
  await expect(page.locator('#next-step')).toHaveCount(0)
  console.log('F3: blank L → lokal Innhent mer informasjon, ingen hovedstart')
  await page.locator('#value-L').fill('1900000')
  await page.locator('#source-L').fill('Uttrykkelig endret F3-variant: leie som F1')
  await page.locator('#value-J').fill('0')
  await page.locator('.cost-item').last().getByRole('button',{name:'Fjern post 6',exact:true}).click()
  await page.locator('#confirm-financial').click()
  await expect(page.locator('.local-deficiencies')).toContainText('0 må bekreftes')
  await page.locator('#zero-J').check()
  await page.locator('#confirm-financial').click()
  await page.locator('#next-step').click()
  console.log('Null: J0 med fem driftsposter krever særskilt nullkontroll før samlet bekreftelse')
  await analyze('invalid-format.pdf')
  await expect(page.locator('#analysis-status')).toContainText('invalid-format')
  await expect(page.getByText('Dokumentfeil: invalid-format.', {exact:true})).toBeVisible()
  await analyze('F3-tilstandsrapport.pdf')
  await control('F3')
  await expect(page.locator('#recommendation-title')).toHaveText('Gå videre')
  console.log('Feil/retur: invalid-format → Dokumentfeil; ekte F3-PDF i uttrykkelig rettet variant → kontroll/resultat (ikke opprinnelig F3-fasit)')
  expect(external).toEqual([])
  console.log('Ekstern browsertrafikk: 0; eksplisitt route-sperre aktiv. Ingen live/KI-nøkkel.')
} finally { await browser.close() }
