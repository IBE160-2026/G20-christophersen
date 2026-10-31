import { test, expect } from '@playwright/test'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { newProspectusPdf } from '../helpers/new-prospectus-pdf.ts'
import { ImportHttpResponseSchema } from '../../src/contracts/document-import.ts'

const privateExample = fileURLToPath(new URL('../../private/incoming/new-salgsoppgave.pdf', import.meta.url))

test('juridisk risiko fra ny lokal PDF vises med ordrett originalside uten KI-kall', async ({ page }) => {
  const requests: string[] = []
  await page.route('**/*', route => {
    const url = new URL(route.request().url())
    if (url.protocol.startsWith('http') && !['localhost', '127.0.0.1'].includes(url.hostname)) return route.abort()
    if (url.pathname.startsWith('/api/')) requests.push(url.pathname)
    return route.continue()
  })
  await page.goto('/')
  const bytes = newProspectusPdf(['SYNTETISK RISIKOTEST', `Identitet: ${randomUUID()}`, 'Adresse: Risikoveien 12', 'Utleieenheten er ikke godkjent som egen bruksenhet.'])
  await page.locator('#import-file-prospectus').setInputFiles({ name: 'risiko.pdf', mimeType: 'application/pdf', buffer: bytes })
  const risks = page.locator('.property-risk')
  await expect(risks).toContainText('Utleieenhet er ikke godkjent')
  await expect(risks).toContainText('fysisk PDF-side 1')
  await risks.screenshot({ path: '/private/tmp/paa-risk-desktop.png' })
  await risks.getByRole('button', { name: 'Se alle funn og kilder ↗' }).click()
  const finding = page.getByRole('dialog').locator('ol > li').filter({ hasText: 'Utleieenhet er ikke godkjent' })
  await expect(finding).toContainText('ikke et generelt utleieforbud')
  await finding.getByRole('button', { name: 'Se originalkilde ↗', exact: true }).click()
  await expect(page.locator('[data-pdf-page="1"]')).toBeVisible()
  await expect(page.locator('.textLayer')).toContainText('Utleieenheten er ikke godkjent')
  await page.keyboard.press('Escape')
  await page.setViewportSize({ width: 390, height: 844 })
  await risks.screenshot({ path: '/private/tmp/paa-risk-mobile.png' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(requests.filter(path => path === '/api/document-import')).toHaveLength(1)
  expect(requests.some(path => path.includes('economy-analysis') || path === '/api/analysis')).toBe(false)
})

test('privat Øvre Blekeveien: side 58 og ufullstendig integrert rapport åpnes i originalen', async ({ page }) => {
  test.skip(!existsSync(privateExample), 'Valgfri privat kontrollcase er ikke distribuert i Git.')
  test.setTimeout(120_000)
  await page.goto('/')
  const response = page.waitForResponse(value => new URL(value.url()).pathname === '/api/document-import' && value.request().method() === 'POST')
  await page.locator('#import-file-prospectus').setInputFiles(privateExample)
  const imported = await response
  expect(imported.ok()).toBe(true)
  const result = ImportHttpResponseSchema.parse(await imported.json())
  if (result.kind !== 'document-import') throw new Error('private-import-failed')
  const outcome = result.outcome
  expect(outcome.pageCount).toBe(135)
  expect(outcome.propertyRisk?.legal.findings.some(item => item.category === 'rental-approval' && item.status === 'documented' && item.sources.some(source => source.pdfPage === 58))).toBe(true)
  expect(outcome.coverage.technical.status).not.toBe('complete')
  expect(outcome.cost?.reservedUsd).toBe('0.00000000')
  const partial = outcome.propertyRisk?.technical.findings.find(item => item.sourceQuality === 'partial-text' && item.sources.some(source => source.pdfPage >= 71 && source.pdfPage <= 82))
  expect(partial).toMatchObject({ status: 'possible', grade: null })
  const risks = page.locator('.property-risk')
  await risks.getByRole('button', { name: 'Se alle funn og kilder ↗' }).click()
  const finding = page.getByRole('dialog').locator('ol > li').filter({ hasText: 'Utleieenhet er ikke godkjent' }).filter({ hasText: 'fysisk PDF-side 58' })
  await expect(finding).toHaveCount(1)
  await finding.getByRole('button', { name: 'Se originalkilde ↗', exact: true }).click()
  await expect(page.locator('[data-pdf-page="58"]')).toBeVisible({ timeout: 30_000 })
  await page.keyboard.press('Escape')
  await risks.getByRole('button', { name: 'Se alle funn og kilder ↗' }).click()
  const technical = page.getByRole('dialog').locator('ol > li').filter({ hasText: partial!.title }).filter({ hasText: `fysisk PDF-side ${partial!.sources[0]!.pdfPage}` }).first()
  await expect(technical).toContainText('Ufullstendig tekstgrunnlag')
  await technical.getByRole('button', { name: 'Se originalkilde ↗', exact: true }).click()
  await expect(page.locator(`[data-pdf-page="${partial!.sources[0]!.pdfPage}"]`)).toBeVisible({ timeout: 30_000 })
  await page.keyboard.press('Escape')
  await risks.screenshot({ path: '/private/tmp/paa-risk-private-desktop.png' })
})

test('samme PDF-bytehash med to filnavn åpner den separate rapportens original', async ({ page }) => {
  await page.goto('/')
  const bytes = newProspectusPdf([`SYNTETISK TEST ${randomUUID()}`, 'Adresse: Risikoveien 12', 'TILSTANDSRAPPORT - START', 'Bygningsdel: Tak', 'Tilstandsgrad: TG3', 'Vurdering av avvik:', 'Det er påvist lekkasje.', 'Konsekvens/tiltak', 'Innhent faglig vurdering.', 'TILSTANDSRAPPORT - SLUTT'])
  await page.locator('#import-file-prospectus').setInputFiles({ name: 'salgsoppgave-navn.pdf', mimeType: 'application/pdf', buffer: bytes })
  await expect(page.locator('.document-economy')).toBeVisible()
  await page.locator('#overview-report-file').setInputFiles({ name: 'rapport-navn.pdf', mimeType: 'application/pdf', buffer: bytes })
  await expect(page.locator('.risk-report-upload')).toContainText('Dokumentuttrekk klart.')
  await page.locator('.property-risk').getByRole('button', { name: 'Se alle funn og kilder ↗' }).click()
  const report = page.getByRole('dialog').locator('ol > li').filter({ hasText: 'TG3' }).first()
  await report.getByRole('button', { name: /Se originalkilde/ }).first().click()
  await expect(page.locator('.pdf-viewer')).toContainText('rapport-navn.pdf')
  await expect(page.locator('[data-pdf-page="1"]')).toBeVisible()
})
