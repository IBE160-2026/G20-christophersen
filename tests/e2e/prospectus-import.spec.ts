import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import oracle from '../fixtures/sales-prospectus/extended-expected.json' with { type: 'json' }
const fixture=(name:string)=>fileURLToPath(new URL(`../fixtures/sales-prospectus/${name}`,import.meta.url))
async function importProspectus(page:Page,name='mixed-12.pdf'){
  await page.goto('/')
  await expect(page.locator('#value-L')).toHaveValue('')
  await page.locator('#import-file-prospectus').setInputFiles(fixture(name))
  await expect(page.locator('#value-P')).toHaveValue('3200000')
  await expect(page.locator('#status-P')).toContainText('Ubekreftet')
}
async function values(page:Page,key:'go'|'reject'|'missing'){
  const data=oracle.screening[key]
  for(const field of ['P','L','D','J','Ymin'] as const){
    if(field!=='P')await page.locator(`#value-${field}`).fill(data[field as 'L'|'D'|'J'|'Ymin'])
    await page.locator(`#source-kind-${field}`).selectOption('assumption');await page.locator(`#source-${field}`).fill(`Kontrollert syntetisk ${field}`)
  }
  for(const field of ['L','D','J']){await page.locator(`#period-${field}`).selectOption('year');await page.locator(`#year-${field}`).fill('2026')}
  await page.locator('#rent-nature-L').selectOption('expected')
  await page.locator('#confirm-financial').click();await page.locator('#next-step').click()
}
async function control(page:Page,key:'go'|'reject'|'missing'){
  await page.locator('#import-identity-check').check();await page.locator('#import-area-check').check()
  await page.getByRole('button',{name:'Gå til Kontroller funn',exact:true}).click()
  for(const row of await page.locator('.finding-list > li').all()){
    await row.locator('.finding-select').click();await row.getByRole('button',{name:'Bekreft',exact:true}).click()
    if((await row.locator('.finding-select').innerText()).startsWith('TG3')){
      await page.getByLabel('TG3-status for gjeldende forhold').selectOption(key==='missing'?'unresolved':'resolved')
      if(key!=='missing'){
        await page.getByLabel('Kort begrunnelse for TG3-avklaring').fill('Fiktiv lekkasje er kontrollert; tilstrekkelig avklart for førstevurdering.')
        await page.getByLabel('Konkret eksternt avklaringsgrunnlag').fill('Fiktiv fagkyndig testreferanse 2026-10-28 for dette takforholdet.')
      }
    }
  }
  await page.getByRole('button',{name:'Bekreft gjeldende liste',exact:true}).click()
  await page.getByRole('button',{name:'Beregn og vis resultat',exact:true}).click()
}
for(const key of ['go','reject','missing'] as const)test(`SO-AC1/11/14/15: faktisk offline import og kontroll til ${oracle.screening[key].recommendation}`,async({page},info)=>{
  const calls:string[]=[]
  page.on('request',request=>{if(request.url().includes('/api/document-import')&&!request.url().includes('config'))calls.push(request.url())})
  await page.route('https://**',route=>route.abort())
  await importProspectus(page);await values(page,key);await control(page,key)
  await expect(page.locator('#recommendation-title')).toHaveText(oracle.screening[key].recommendation)
  expect(calls).toHaveLength(1)
  await info.attach(`salgsoppgave-${key}`,{body:await page.screenshot({fullPage:true}),contentType:'image/png'})
})
test('SO-AC5/6: økonomikilde og fysisk10/trykt6 åpnes i riktig original; to bad og ett tak består',async({page})=>{
  await importProspectus(page)
  const first=page.locator('details.listing-field').first();await first.locator('summary').click()
  await page.getByRole('button',{name:'Vis originalkilde for Prisantydning (dokumentets prisgrunnlag)',exact:true}).click()
  await expect(page.locator('[data-pdf-page="1"]')).toBeVisible()
  await page.getByRole('button',{name:'Lukk originalvisning'}).click()
  await values(page,'go')
  await page.locator('#import-identity-check').check();await page.locator('#import-area-check').check()
  await page.getByRole('button',{name:'Gå til Kontroller funn',exact:true}).click()
  await expect(page.locator('.finding-list > li')).toHaveCount(3)
  await page.getByRole('button',{name:'TG3 · Alvorlig lekkasje i tak',exact:true}).click()
  await expect(page.locator('[data-pdf-page="10"]')).toBeVisible()
  await expect(page.locator('.finding-list')).toContainText('trykt side 6')
  await page.getByRole('button',{name:'Vis kildebelegg 2',exact:true}).click()
  await expect(page.locator('[data-pdf-page="2"]')).toBeVisible()
})
test('SO-AC4/12: faktisk PDF-vedlegg ber om separat fil; rapportbytte bevarer økonomi og åpner separat fysisk3',async({page})=>{
  await importProspectus(page,'attached-report-6.pdf');await expect(page.getByText(/Ubehandlet vedlegg: tilstandsrapport.pdf/)).toBeVisible()
  await values(page,'go')
  await expect(page.locator('#import-area-check')).toBeDisabled()
  await page.locator('#import-file-report').setInputFiles(fixture('separate-report-4.pdf'))
  await expect(page.getByText(/Foreslått rapportområde: separate-report-4.pdf, fysiske PDF-sider 1–4/)).toBeVisible()
  await page.locator('#import-identity-check').check();await page.locator('#import-area-check').check()
  await page.getByRole('button',{name:'Gå til Kontroller funn',exact:true}).click()
  await page.getByRole('button',{name:'TG3 · Alvorlig lekkasje i tak',exact:true}).click()
  await expect(page.locator('[data-pdf-page="3"]')).toBeVisible();await expect(page.locator('.pdf-identity')).toContainText('separate-report-4.pdf')
  await page.getByRole('button',{name:'Tilbake til Tallgrunnlag',exact:true}).click()
  await expect(page.locator('#value-L')).toHaveValue('400000');await expect(page.locator('#value-P')).toHaveValue('3200000')
})
test('SO-AC3/4: raster med digital bunntekst og uklare rapporter kan ikke få komplett kontroll',async({page})=>{
  await importProspectus(page,'raster-footer-12.pdf');await values(page,'go')
  await expect(page.locator('#import-area-check')).toBeDisabled()
  await expect(page.getByText(/Rapportområdet har uleste sider/).first()).toBeVisible()
})
test('SO-AC12: sammehash gjenbruk og nyhash tømmer manuell økonomi/finansiering',async({page})=>{
  let calls=0;page.on('request',request=>{if(request.url().endsWith('/api/document-import'))calls++})
  await importProspectus(page);await page.locator('#value-L').fill('123456')
  await page.locator('#import-file-prospectus').setInputFiles(fixture('mixed-12.pdf'))
  await expect(page.locator('#value-L')).toHaveValue('123456');expect(calls).toBe(1)
  await page.locator('#import-file-prospectus').setInputFiles(fixture('missing-report-6.pdf'))
  await expect(page.locator('#value-L')).toHaveValue('');await expect(page.locator('#value-Ymin')).toHaveValue('')
  await expect(page.locator('#import-equity')).toHaveValue('');expect(calls).toBe(2)
})

test('SO-AC9/11: kontrollert dokumentøkonomi og delt slider/finansiering fyller P/D/J uten manuell overføring',async({page},info)=>{
  await importProspectus(page)
  for(const field of await page.locator('details.listing-field').all()){
    await field.locator('summary').click()
    await field.getByRole('checkbox').check()
  }
  await page.getByLabel('Jeg har kontrollert at alle eierbetalte driftskostnader er med og avklart inkludering og gjeldsdeler.').check()
  await page.locator('#import-equity').fill('1000000')
  await page.locator('#import-equity-range').focus();await page.locator('#import-equity-range').press('Home')
  await expect(page.locator('#import-equity')).toHaveValue(oracle.financingPath.equity)
  await page.locator('#import-finance-annualInterest').fill(oracle.financingPath.annualInterest)
  await page.locator('#import-finance-months').fill(oracle.financingPath.months)
  await page.locator('#import-finance-year').fill(oracle.financingPath.year)
  await page.getByRole('button',{name:'Bruk kontrollert dokumentgrunnlag og finansiering',exact:true}).click()
  await expect(page.locator('#value-P')).toHaveValue(oracle.financingPath.P)
  await expect(page.locator('#value-D')).toHaveValue(oracle.financingPath.D)
  await expect(page.locator('#value-J')).toHaveValue(oracle.financingPath.J)
  await expect(page.locator('#source-kind-J')).toHaveValue('assumption')
  await expect(page.locator('#status-P')).toContainText('Ubekreftet')
  for(const field of ['L','Ymin'] as const){
    await page.locator(`#value-${field}`).fill(field==='L'?'400000':'7')
    await page.locator(`#source-kind-${field}`).selectOption('assumption');await page.locator(`#source-${field}`).fill(`Nødvendig brukerforutsetning ${field}`)
  }
  await page.locator('#period-L').selectOption('year');await page.locator('#year-L').fill('2026');await page.locator('#rent-nature-L').selectOption('expected')
  await page.locator('#confirm-financial').click();await page.locator('#next-step').click();await control(page,'go')
  await expect(page.locator('#recommendation-title')).toHaveText('Gå videre')
  await page.screenshot({path:info.outputPath('dokument-finansiering-resultat.png'),fullPage:true})
})

test('salgsoppgavens hovedinngang og selektivt 200-sidersgrunnlag er synlig uten intern kildeinformasjon i hovedtekst',async({page},info)=>{
  await page.goto('/')
  await page.screenshot({path:info.outputPath('salgsoppgave-hovedinngang.png'),fullPage:true})
  await page.locator('#import-file-prospectus').setInputFiles(fixture('bounded-200.pdf'))
  await expect(page.locator('#value-P')).toHaveValue('3200000')
  await expect(page.getByText('Ikke valgt i kombinert uttrekksgrunnlag:',{exact:false})).toBeVisible()
  await page.screenshot({path:info.outputPath('salgsoppgave-bounded200.png'),fullPage:true})
})
test('review: kontrollbelegg åpner riktig original og separat rapport kan gjenopprettes lokalt uten ny POST',async({page})=>{
  let posts=0;page.on('request',request=>{if(request.method()==='POST'&&request.url().endsWith('/api/document-import'))posts++})
  await importProspectus(page,'bounded-200.pdf');await values(page,'go')
  await page.getByRole('button',{name:'Vis kilde for rapportgrense 1 (2)',exact:true}).click()
  await expect(page.locator('[data-pdf-page="12"]')).toBeVisible()
  await expect(page.locator('.pdf-identity')).toContainText('bounded-200.pdf')
  await page.getByRole('button',{name:'Vis kilde for eiendomsidentitet 1 (1)',exact:true}).click()
  await expect(page.locator('[data-pdf-page="1"]')).toBeVisible()
  await page.locator('#import-file-report').setInputFiles(fixture('wrong-property-report-4.pdf'))
  const separate=page.getByText('Bevart identitetsgrunnlag: wrong-property-report-4.pdf',{exact:true}).locator('..')
  await separate.getByRole('button',{name:'Vis kilde for eiendomsidentitet 1 (1)',exact:true}).click()
  await expect(page.locator('[data-pdf-page="1"]')).toBeVisible()
  await expect(page.locator('.pdf-identity')).toContainText('wrong-property-report-4.pdf')
  await page.getByRole('button',{name:'Bruk integrert rapport igjen',exact:true}).click()
  await expect(page.getByText('Foreslått rapportområde: bounded-200.pdf, fysiske PDF-sider 5–12 (entydig forslag).',{exact:true})).toBeVisible()
  await expect(page.locator('#import-identity-check')).not.toBeChecked()
  await expect(page.locator('#import-area-check')).not.toBeChecked()
  await expect(page.getByRole('button',{name:'Bruk integrert rapport igjen',exact:true})).toHaveCount(0)
  expect(posts).toBe(2)
})
