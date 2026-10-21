import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { ScreeningResult } from '../../src/frontend/screens/ScreeningResult.tsx'
import { createInitialSession, sessionReducer } from '../../src/frontend/state/session.ts'
import type { SessionState } from '../../src/frontend/state/session.ts'
import { screeningState } from '../helpers/screening-state.ts'
const css = readFileSync(new URL('../../src/frontend/styles.css', import.meta.url), 'utf8')
async function render(page: Page, session: SessionState) {
  await page.setContent(`<!doctype html><html lang="nb"><style>${css}</style><body>${renderToStaticMarkup(createElement(ScreeningResult, { session, dispatch: () => {} }))}</body></html>`)
}
test('AC4: Ikke beregnet viser kontrollbehov uten anbefaling eller tidligere tall', async ({ page }) => {
  await render(page, createInitialSession())
  await expect(page.getByRole('heading', { name: 'Ikke beregnet' })).toBeVisible()
  await expect(page.locator('.recommendation')).toHaveCount(0)
  await expect(page.locator('.metric-value')).toHaveCount(0)
  await expect(page.getByText(/Kontroller og bekreft tallgrunnlaget/)).toBeVisible()
})
test('AC3: manglende J og ubekreftet liste samles med konkrete handlinger og gyldig delgrunnlag', async ({ page }, testInfo) => {
  await render(page, screeningState({ report: 'unconfirmed', values: { J: '' } }))
  await expect(page.locator('#recommendation-title')).toHaveText('Innhent mer informasjon')
  await expect(page.locator('.result-triggers')).toContainText('J: Verdien mangler.')
  await expect(page.locator('.result-triggers')).toContainText('Oppgi verdien for J.')
  await expect(page.locator('.result-triggers')).toContainText('Funnlisten er ennå ikke kontrollert')
  await expect(page.getByText('Delgrunnlag', { exact: true })).toHaveCount(4)
  await expect(page.locator('.metric-value').last()).toHaveText('Ikke beregnbart')
  await page.screenshot({ path: testInfo.outputPath('delgrunnlag.png') })
})
test('AC3: analysefeil er kompakt og ikke tom suksess eller kopi av lokal langfeil', async ({ page }) => {
  const local = 'Lang lokal årsak som bare skal vises i problemtrinnet.'
  let state = screeningState()
  const original = state.report.outcome!
  state = { ...state, report: { ...state.report, status: 'failed', error: 'timeout', outcome: {
    contractVersion: original.contractVersion, extractionVersion: original.extractionVersion, mode: original.mode,
    requestId: original.requestId, reportHash: original.reportHash, documentName: original.documentName, pageCount: original.pageCount,
    status: 'failed', error: { kind: 'analysis', code: 'timeout', reason: local, target: { kind: 'page', pdfPage: 3 } }, partialResult: null,
  } } }
  state = sessionReducer(state, { type: 'calculate-result' })
  await render(page, state)
  await expect(page.locator('#recommendation-title')).toHaveText('Innhent mer informasjon')
  await expect(page.locator('.result-triggers')).toContainText('Rapportgrunnlaget er ufullført')
  await expect(page.locator('.result-triggers')).toContainText('timeout')
  await expect(page.locator('.result-triggers')).toContainText('Berørt PDF-side: 3')
  await expect(page.getByText(local, { exact: false })).toHaveCount(0)
  await expect(page.getByText('Ingen fullført funnliste. Rapportmanglene ovenfor må avklares.')).toBeVisible()
  await expect(page.getByText('Delgrunnlag', { exact: true })).toHaveCount(4)
})
test('AC4: historiske tall, anbefaling og funn blandes ikke med ny aktiv leie eller korrigering; utkast opplyses', async ({ page }) => {
  let state = screeningState()
  state = sessionReducer(state, { type: 'register-value', field: 'L', rawValue: '500000' })
  state = sessionReducer(state, { type: 'report-finding-edit', generation: 1, findingId: 'F1-TG2-1' })
  state = sessionReducer(state, { type: 'report-finding-draft', generation: 1, findingId: 'F1-TG2-1', field: 'description', value: 'Nytt ubrukt funnutkast' })
  await render(page, state)
  await expect(page.getByRole('heading', { name: 'Utdatert / Må bekreftes på nytt' })).toBeVisible()
  await expect(page.locator('.result-stale')).toContainText('L: verdi er endret.')
  await expect(page.locator('#recommendation-title')).toHaveText('Gå videre')
  await expect(page.locator('.metric-value').nth(1)).toHaveText('1 500 000 kr/år')
  await expect(page.locator('.result-findings')).toContainText('Slitt overflate på baderomsgulv')
  await expect(page.locator('.result-draft')).toContainText('F1-TG2-1')
  await expect(page.getByText('Nytt ubrukt funnutkast')).toHaveCount(0)
})
test('AC2/6: TG3-status synlig fra start og begrunnelse/opphav bak native tastaturdisclosure', async ({ page }) => {
  await render(page, screeningState({ report: 'tg3' }))
  await expect(page.locator('.result-severe')).toHaveText('TG3 · Alvorlig lekkasje i tak')
  await expect(page.locator('.result-tg3')).toHaveText('Alvorlig TG3 · Separat brukerstatus: Uavklart')
  const detail = page.locator('.result-findings details').last()
  await expect(detail.getByRole('heading', { name: 'Opprinnelig KI-uttrekk' })).not.toBeVisible()
  await detail.locator('summary').focus(); await detail.locator('summary').press('Enter')
  await expect(detail).toHaveJSProperty('open', true)
  await expect(detail.getByRole('heading', { name: 'Separat brukeropplysning om TG3' })).toBeVisible()
  await expect(detail.getByText('Begrunnelse: Ikke oppgitt')).toBeVisible()
  await detail.locator('summary').press('Space')
  await expect(detail).toHaveJSProperty('open', false)
})

test('AC2: Avklart beholder TG3, begrunnelse og konkret brukergrunnlag uten teknisk godkjenning', async ({ page }) => {
  const state = screeningState({ report: 'tg3', beforeCalculation: state => {
    for (const [field, value] of [['status', 'resolved'], ['reason', 'Rapportforholdet er kontrollert mot ekstern dokumentasjon.'],
      ['basis', 'Takstkyndig kontroll 2026-10-20, referanse TAK-17.']] as const) {
      state = sessionReducer(state, { type: 'report-tg3-register', generation: 1, findingId: 'F4-TG3-1', field, value })
    }
    return state
  } })
  await render(page, state)
  await expect(page.locator('.result-tg3')).toHaveText('Alvorlig TG3 · Separat brukerstatus: Avklart for førstevurdering')
  const details = page.locator('.result-findings details').last()
  await details.locator('summary').click()
  await expect(details).toContainText('Takstkyndig kontroll 2026-10-20, referanse TAK-17.')
  await expect(details).toContainText('Rapportforholdet er kontrollert mot ekstern dokumentasjon.')
  await expect(details).toContainText('ikke eksternt verifisert og ingen teknisk godkjenning')
  await expect(page.locator('.result-severe')).toHaveText('TG3 · Alvorlig lekkasje i tak')
})
test('AC4: brukt retting etter snapshot endrer ikke historiske funn; ny rapport får ingen historisk kildehandling', async ({ page }) => {
  let state = screeningState()
  state = sessionReducer(state, { type: 'report-finding-edit', generation: 1, findingId: 'F1-TG2-1' })
  state = sessionReducer(state, { type: 'report-finding-draft', generation: 1, findingId: 'F1-TG2-1', field: 'description', value: 'Nytt brukt grunnlag' })
  state = sessionReducer(state, { type: 'report-finding-apply', generation: 1, findingId: 'F1-TG2-1' })
  await render(page, state)
  await expect(page.locator('.result-findings')).toContainText('Slitt overflate på baderomsgulv')
  await expect(page.getByText('TG2 · Nytt brukt grunnlag')).toHaveCount(0)
  state = sessionReducer(state, { type: 'report-selecting', generation: 2 })
  await render(page, state)
  await expect(page.locator('.result-findings')).toContainText('F1-tilstandsrapport.pdf')
  await expect(page.getByRole('button', { name: /Se originalside/ })).toHaveCount(0)
  await expect(page.getByText('Den historiske originalrapporten er erstattet i aktiv økt.', { exact: false })).toBeVisible()
})
