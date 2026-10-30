import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { createHash, randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { newProspectusPdf } from '../helpers/new-prospectus-pdf.ts'
import { ImportHttpResponseSchema } from '../../src/contracts/document-import.ts'
import type { DocumentImport } from '../../src/contracts/document-import.ts'
const original = new URL('../../private/incoming/salgsoppgave.pdf', import.meta.url)
const sha = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')
function fresh(explicit = true) {
  const token = randomUUID()
  return newProspectusPdf([
    'SYNTETISK SALGSOPPGAVE - kun isolasjonstest, ingen virkelig eiendom', `Testidentitet: ${token}`,
    `Adresse: Nytestveien ${token.slice(0, 8)}, Testby`, 'Eierform: eierseksjon',
    ...(explicit ? [
      'Prisantydning: 4 242 000 kr', 'Fellesgjeld: 123 000 kr', 'Omkostninger: 81 000 kr',
      'Kommunale avgifter: 11 000 kr per år i 2026', 'Eiendomsskatt: 7 000 kr per år i 2026',
      'Felleskostnader: 2 000 kr per måned i 2026',
    ] : [
      'Prisen er antydet til kr 5 678 901,- for denne eiendommen.',
      'Kommunens faktura gjelder 9.876,54 kr per kvartal, inklusive mva.',
    ]),
    'Leie og øvrig drift er ikke avklart. Ingen komplett tilstandsrapport.',
  ])
}
function audit(page: Page) {
  const errors: string[] = [], external: string[] = [], apis: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('request', request => { const url = new URL(request.url()); if (url.pathname.startsWith('/api/')) apis.push(url.pathname) })
  return { errors, external, apis, install: () => page.route('**/*', route => {
    const url = new URL(route.request().url())
    if (url.protocol.startsWith('http') && !['localhost', '127.0.0.1'].includes(url.hostname)) { external.push(url.origin); return route.abort() }
    return route.continue()
  }) }
}
async function upload(page: Page, bytes: Buffer, name = 'salgsoppgave.pdf'): Promise<DocumentImport> {
  const received = page.waitForResponse(response => new URL(response.url()).pathname === '/api/document-import' && response.request().method() === 'POST')
  await page.locator('#import-file-prospectus').setInputFiles({ name, mimeType: 'application/pdf', buffer: bytes })
  const response = await received
  expect(response.status()).toBe(200)
  const parsed = ImportHttpResponseSchema.parse(await response.json())
  if (parsed.kind !== 'document-import') throw new Error('import-rejected')
  await expect(page.locator('.document-economy')).toBeVisible()
  return parsed.outcome
}
function localOnly(outcome: DocumentImport, bytes: Buffer) {
  expect(outcome.reportHash).toBe(sha(bytes))
  expect(outcome.economy.analysis?.provenance).toBe('local-only')
  expect(outcome.economy.analysis?.reason).toContain('Ingen lagret analyse for dette dokumentet')
  expect(outcome.economy.analysis?.requestDigest).toBeNull()
  expect(outcome.economy.analysis?.observations).toEqual([])
  expect(outcome.economy.analysis?.selectedPages).toEqual([])
  expect(outcome.cost?.status).toBe('blocked')
  expect(outcome.cost?.reservedUsd).toBe('0.00000000')
  expect(outcome.technical.status).toBe('blocked')
  for (const field of outcome.economy.fields) for (const source of [...field.sources, ...field.alternatives.map(item => item.source)]) {
    expect(source.documentHash).toBe(sha(bytes))
    expect(source.documentName).toBe('salgsoppgave.pdf')
    expect(outcome.pages[source.pdfPage - 1]!.text.slice(source.start, source.end)).toBe(source.quote)
  }
}
test('ny ukjent PDF i tom økt henter bare eksplisitte kodefelt og åpner nye originalkilder', async ({ page }) => {
  const recorded = audit(page); await recorded.install(); await page.goto('/')
  const bytes = fresh(), outcome = await upload(page, bytes)
  localOnly(outcome, bytes)
  expect(outcome.economy.fields.find(field => field.id === 'price')?.amount).toBe('4242000')
  expect(outcome.economy.fields.find(field => field.id === 'municipalFees')).toMatchObject({ amount: '11000', period: 'year', year: '2026' })
  expect(outcome.economy.fields.find(field => field.id === 'commonCosts')).toMatchObject({ amount: '2000', period: 'month', year: '2026' })
  expect(outcome.economy.fields.find(field => field.id === 'documentTax')?.amount).toBeNull()
  await expect(page.locator('.hero')).toContainText('4 242 000')
  await expect(page.locator('.document-economy')).toContainText('11 000,00 kr')
  await expect(page.locator('.hero')).toContainText('Videre KI-analyse har ikke startet')
  for (const id of ['scenario-gross', 'scenario-net', 'scenario-cash']) await expect(page.getByTestId(id)).toContainText('—')
  await page.locator('.document-economy details').first().locator('summary').click()
  await page.locator('.document-economy').getByRole('button', { name: 'Åpne originalside ↗', exact: true }).first().click()
  await expect(page.locator('[data-pdf-page="1"]')).toBeVisible()
  await expect(page.locator('.textLayer')).toContainText('4 242 000')
  await page.keyboard.press('Escape')
  expect(recorded.errors).toEqual([]); expect(recorded.external).toEqual([])
  expect(recorded.apis.filter(path => path === '/api/document-import')).toHaveLength(1)
  expect(recorded.apis.filter(path => path === '/api/analysis')).toHaveLength(0)
})
test('ny ukjent fritekst-PDF får ukjente beløp og eksplisitt sperret KI, ingen oppdiktet erstatning', async ({ page }) => {
  const recorded = audit(page); await recorded.install(); await page.goto('/')
  const bytes = fresh(false), outcome = await upload(page, bytes)
  localOnly(outcome, bytes)
  expect(outcome.economy.fields.every(field => field.amount === null && field.sources.length === 0)).toBe(true)
  await expect(page.locator('.hero')).not.toContainText('5 678 901')
  await expect(page.locator('.document-economy')).toContainText('Opplysninger mangler')
  await expect(page.locator('.document-economy')).toContainText('Videre KI-analyse har ikke startet')
  expect(recorded.errors).toEqual([]); expect(recorded.external).toEqual([])
})
test('ny PDF med samme filnavn erstatter forrige ekte dokument uten tall-, kilde- eller forutsetningslekkasje', async ({ page }) => {
  test.skip(!existsSync(original), 'Privat tidligere original mangler; de to generiske ny-dokument-testene kjører alltid.')
  const recorded = audit(page); await recorded.install(); await page.goto('/')
  const old = await upload(page, await readFile(original))
  expect(old.economy.analysis?.provenance).toBe('saved-same-document')
  await page.getByRole('button', { name: 'Juster leie og drift ↗' }).click()
  await page.getByLabel('Forventet leie per år (kr)', { exact: true }).fill('999999')
  await page.getByLabel('Samlet eierbetalt drift per år (kr)', { exact: true }).fill('88888')
  await page.getByLabel('År for forutsetningene').fill('2026')
  await page.getByRole('button', { name: 'Bruk som ubekreftede forutsetninger' }).click()
  await page.locator('#scenario-equity').fill('123456')
  const bytes = fresh(), outcome = await upload(page, bytes)
  localOnly(outcome, bytes)
  expect(outcome.reportHash).not.toBe(old.reportHash)
  expect(JSON.stringify(outcome)).not.toContain(old.reportHash)
  const priorQuotes = new Set(old.economy.fields.flatMap(field => [...field.sources, ...field.alternatives.map(item => item.source)]).map(source => source.quote))
  expect(outcome.economy.fields.flatMap(field => field.sources).some(source => priorQuotes.has(source.quote))).toBe(false)
  await expect(page.locator('main')).not.toContainText('Lagret analyse av samme dokument')
  await expect(page.locator('#scenario-equity')).toHaveValue('')
  await expect(page.locator('.hero')).toContainText('4 242 000')
  const oldPrice = old.economy.fields.find(field => field.id === 'price')!.amount!
  await expect(page.locator('main')).not.toContainText(new Intl.NumberFormat('nb-NO').format(Number(oldPrice)).replaceAll('\u00a0', ' '))
  for (const id of ['scenario-gross', 'scenario-net', 'scenario-cash']) await expect(page.getByTestId(id)).toContainText('—')
  await page.getByRole('button', { name: 'Juster leie og drift ↗' }).click()
  await expect(page.getByLabel('Forventet leie per år (kr)', { exact: true })).toHaveValue('')
  await expect(page.getByLabel('Samlet eierbetalt drift per år (kr)', { exact: true })).toHaveValue('')
  await page.keyboard.press('Escape')
  await page.locator('.document-economy details').first().locator('summary').click()
  await page.locator('.document-economy').getByRole('button', { name: 'Åpne originalside ↗', exact: true }).first().click()
  await expect(page.locator('.textLayer')).toContainText('4 242 000')
  await expect(page.locator('.textLayer')).not.toContainText(oldPrice)
  expect(recorded.errors).toEqual([]); expect(recorded.external).toEqual([])
  expect(recorded.apis.filter(path => path === '/api/document-import')).toHaveLength(2)
  expect(recorded.apis.filter(path => path === '/api/analysis')).toHaveLength(0)
})

for (const replacePrevious of [false, true]) test(`ny ekte salgsoppgave: ${replacePrevious ? 'erstatter tidligere ekte dokument' : 'tom økt'}`, async ({ page }, info) => {
  const path = process.env.PAA_UNSEEN_PDF
  test.skip(!path, 'Sett PAA_UNSEEN_PDF til en annen ekte salgsoppgave for denne private kontrollen.')
  const bytes = await readFile(path!)
  const oldBytes = await readFile(original)
  expect(sha(bytes) === sha(oldBytes), 'Kontrollen krever en annen PDF enn tidligere analysert original').toBe(false)
  const recorded = audit(page); await recorded.install(); await page.goto('/')
  const old = replacePrevious ? await upload(page, oldBytes) : null
  if (old) {
    expect(old.economy.analysis?.provenance).toBe('saved-same-document')
    await page.getByRole('button', { name: 'Juster leie og drift ↗' }).click()
    await page.getByLabel('Forventet leie per år (kr)', { exact: true }).fill('999999')
    await page.getByLabel('Samlet eierbetalt drift per år (kr)', { exact: true }).fill('88888')
    await page.getByLabel('År for forutsetningene').fill('2026')
    await page.getByRole('button', { name: 'Bruk som ubekreftede forutsetninger' }).click()
    await page.locator('#scenario-equity').fill('123456')
  }
  const outcome = await upload(page, bytes)
  localOnly(outcome, bytes)
  const sources = [...outcome.propertyIdentity.map(item => item.source), ...outcome.economy.ownershipSources,
    ...outcome.economy.fields.flatMap(field => [...field.sources, ...field.alternatives.map(item => item.source)])]
  expect(sources.every(source => source.documentHash === sha(bytes))).toBe(true)
  if (old) {
    expect(JSON.stringify(outcome).includes(old.reportHash), 'Tidligere dokumenthash skal ikke finnes i nytt resultat').toBe(false)
    const oldQuotes = new Set(old.economy.fields.flatMap(field => field.sources).map(source => source.quote))
    expect(sources.some(source => oldQuotes.has(source.quote)), 'Ingen økonomikilder fra tidligere PDF').toBe(false)
  }
  await expect(page.locator('main')).not.toContainText('Lagret analyse av samme dokument')
  await expect(page.locator('.document-economy')).toContainText('Lokalt dokumentuttrekk')
  await expect(page.locator('.document-economy')).toContainText('Videre KI-analyse har ikke startet')
  await expect(page.locator('#scenario-equity')).toHaveValue('')
  for (const id of ['scenario-gross', 'scenario-net', 'scenario-cash']) await expect(page.getByTestId(id)).toContainText('—')
  await page.getByRole('button', { name: 'Juster leie og drift ↗' }).click()
  await expect(page.getByLabel('Forventet leie per år (kr)', { exact: true })).toHaveValue('')
  await expect(page.getByLabel('Samlet eierbetalt drift per år (kr)', { exact: true })).toHaveValue('')
  await page.keyboard.press('Escape')
  await info.attach('private-unseen-import-response', { body: JSON.stringify(outcome, null, 2), contentType: 'application/json' })
  await info.attach('private-unseen-overview', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' })
  await page.getByRole('button', { name: 'Dokumentasjon', exact: true }).click()
  await page.getByRole('button', { name: 'Åpne salgsoppgavens første side ↗' }).click()
  await expect(page.locator('[data-pdf-page="1"]')).toBeVisible({ timeout: 30_000 })
  await info.attach('private-unseen-original', { body: await page.screenshot(), contentType: 'image/png' })
  await page.keyboard.press('Escape')
  expect(recorded.errors).toEqual([]); expect(recorded.external).toEqual([])
  expect(recorded.apis.filter(path => path === '/api/document-import')).toHaveLength(replacePrevious ? 2 : 1)
  expect(recorded.apis.filter(path => path === '/api/analysis')).toHaveLength(0)
  console.log(`Privat ny PDF: ${outcome.pageCount} sider, ${outcome.economy.fields.filter(field => field.amount !== null).length} beløpsfelt, ${sources.length} kildebelegg, KI sperret, ingen ekstern trafikk`)
})
