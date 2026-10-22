import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { ScreeningResult } from '../../src/frontend/screens/ScreeningResult.tsx'
import { createInitialSession, sessionReducer } from '../../src/frontend/state/session.ts'
import type { SessionState } from '../../src/frontend/state/session.ts'
import { screeningState } from '../helpers/screening-state.ts'
import { bindAnalysisOutcome } from '../../src/contracts/analysis-validation.ts'
import type { AnalysisOutcome } from '../../src/contracts/document-analysis.ts'
const css = readFileSync(new URL('../../src/frontend/styles.css', import.meta.url), 'utf8')
function documentFor(outcome: Extract<AnalysisOutcome, { status: 'completed' }>) {
  return { contractVersion: outcome.contractVersion, extractionVersion: outcome.extractionVersion, mode: outcome.mode,
    requestId: outcome.requestId, reportHash: outcome.reportHash, documentName: outcome.documentName, pageCount: outcome.pageCount,
    pages: Array.from({ length: outcome.pageCount }, (_, index) => ({ pdfPage: index + 1, text: 'Fiktiv rapport', status: 'readable', reason: null })) }
}
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
  await expect(page.locator('.result-triggers > li')).toHaveCount(1)
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
  await expect(page.getByText('L: verdi er endret.', { exact: false })).toHaveCount(1)
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
  state = { ...state, report: screeningState({ report: 'tg3' }).report }
  await render(page, state)
  await expect(page.getByRole('button', { name: /Se originalside|Åpne originalrapport/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Gå tilbake til rapportfunn', exact: true })).toHaveAttribute('aria-disabled', 'false')
  await expect(page.getByText('Den historiske originalrapporten er erstattet i aktiv økt.', { exact: false })).toBeVisible()
})

test('review B2/E4: identisk bevart PDF er ikke erstattet bare fordi analysestatus feiler', async ({ page }) => {
  const state = sessionReducer(screeningState(), { type: 'report-error', generation: 1, code: 'transport-failure' })
  await render(page, state)
  await expect(page.getByRole('heading', { name: 'Utdatert / Må bekreftes på nytt' })).toBeVisible()
  await expect(page.getByText(/originalrapporten er erstattet/)).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Se originalside/ })).toHaveCount(0)
})

test('review B3: ugyldig TG3-binding forklares sammen med bevart brukeropplysning', async ({ page }) => {
  const state = screeningState({ report: 'tg3', beforeCalculation: state => {
    for (const [field, value] of [['status', 'resolved'], ['reason', 'Tidligere kontrollert takforhold'], ['basis', 'Takrapport TAK-17']] as const) {
      state = sessionReducer(state, { type: 'report-tg3-register', generation: 1, findingId: 'F4-TG3-1', field, value })
    }
    state = sessionReducer(state, { type: 'report-finding-edit', generation: 1, findingId: 'F4-TG3-1' })
    state = sessionReducer(state, { type: 'report-finding-draft', generation: 1, findingId: 'F4-TG3-1', field: 'description', value: 'Et annet alvorlig takforhold' })
    return sessionReducer(state, { type: 'report-finding-apply', generation: 1, findingId: 'F4-TG3-1' })
  } })
  await render(page, state)
  await expect(page.locator('.result-triggers')).toContainText('annet eller ukjent rapportgrunnlag')
  const detail = page.locator('.result-findings details').last()
  await detail.locator('summary').click()
  await expect(detail).toContainText('Registrert brukerstatus: Avklart')
  await expect(detail).toContainText('annet eller ukjent rapportgrunnlag')
  await expect(detail).toContainText('Tidligere kontrollert takforhold')
  await expect(detail).toContainText('Takrapport TAK-17')
  await expect(page.locator('.result-tg3')).toContainText('Uavklart')
})

test('review E3: TG3-ID-prefikser beholder hvert sitt faktiske avgjørende forhold', async ({ page }) => {
  let state = screeningState({ report: 'tg3' })
  const original = state.report.outcome!
  if (original.status !== 'completed') throw new Error('Fixture må være completed')
  const candidate = original.findings.find(item => item.grade === 'TG3')!.original
  const outcome = bindAnalysisOutcome(documentFor(original), {
    contractVersion: '2', extractionVersion: '1', status: 'completed', limitations: [],
    findings: [{ ...candidate, findingId: 'TG3-A', description: 'Første takforhold' }, { ...candidate, findingId: 'TG3-A:B', description: 'Andre takforhold' }],
  })
  state = sessionReducer({ ...state, report: { ...state.report, outcome, findingControls: [], tg3Resolutions: [] } }, { type: 'calculate-result' })
  await render(page, state)
  await expect(page.locator('.result-triggers')).toContainText('TG3-A: Første takforhold')
  await expect(page.locator('.result-triggers')).toContainText('TG3-A:B: Andre takforhold')
})

test('review B5/B6/B10: reelt deluttrekk ignorerer gamle rettinger/avvisninger og beholder TG3, usikkerhet og mangler', async ({ page }) => {
  let state = screeningState({ report: 'tg3' })
  const original = state.report.outcome!
  if (original.status !== 'completed') throw new Error('Fixture må være completed')
  const tg2 = original.findings.find(item => item.grade === 'TG2')!
  state = sessionReducer(state, { type: 'report-finding-edit', generation: 1, findingId: tg2.findingId })
  state = sessionReducer(state, { type: 'report-finding-draft', generation: 1, findingId: tg2.findingId, field: 'description', value: 'Gammel brukerretting som ikke gjelder deluttrekket' })
  state = sessionReducer(state, { type: 'report-finding-apply', generation: 1, findingId: tg2.findingId })
  state = sessionReducer(state, { type: 'report-finding-confirm', generation: 1, findingId: tg2.findingId })
  state = sessionReducer(state, { type: 'report-finding-reject', generation: 1, findingId: 'F4-TG3-1' })
  state = sessionReducer(state, { type: 'report-list-confirm', generation: 1, reportHash: original.reportHash, documentName: original.documentName, listRevision: state.report.listRevision })
  const outcome = bindAnalysisOutcome(documentFor(original), {
    contractVersion: '2', extractionVersion: '1', status: 'failed', code: 'timeout', target: { kind: 'page', pdfPage: 3 },
    partialResult: { findings: [...original.findings.map(item => item.original), { ...tg2.original, findingId: 'uncertain-wall', description: 'Usikker vegg', uncertainties: ['Veggens kildegrunnlag er uavklart'] }], limitations: ['Siste rapportdel mangler'] },
  })
  state = sessionReducer({ ...state, report: { ...state.report, status: 'failed', error: 'timeout', outcome } }, { type: 'calculate-result' })
  await render(page, state)
  await expect(page.locator('.result-severe')).toHaveText('TG3 · Alvorlig lekkasje i tak')
  await expect(page.locator('.result-findings')).toContainText(tg2.description)
  await expect(page.getByText(/Gammel brukerretting som ikke gjelder/)).toHaveCount(0)
  await expect(page.getByText(/Brukeravvist KI-uttrekk/)).toHaveCount(0)
  await expect(page.locator('.result-report > p').first()).toContainText('Funnliste ikke bekreftet')
  await expect(page.locator('.result-triggers')).toContainText('Siste rapportdel mangler')
  await expect(page.locator('.result-triggers')).toContainText('Veggens kildegrunnlag er uavklart')
  await expect(page.locator('.result-tg3')).toContainText('Uavklart')
})

test('review A2: kompakt dokumentfeil bevarer alle berørte sider uten lokal langforklaring', async ({ page }) => {
  let state = screeningState({ report: 'tg3' })
  const original = state.report.outcome!
  if (original.status !== 'completed') throw new Error('Fixture må være completed')
  const outcome = bindAnalysisOutcome({ ...documentFor(original), pages: Array.from({ length: original.pageCount }, (_, index) => ({ pdfPage: index + 1, text: index === 1 || index === 2 ? '' : 'Fiktiv rapport', status: index === 1 || index === 2 ? 'unreadable' : 'readable', reason: index === 1 || index === 2 ? 'Lang lokal sideforklaring som blir i problemtrinnet.' : null })) }, null)
  state = sessionReducer({ ...state, report: { ...state.report, status: 'failed', error: 'unreadable-text', outcome } }, { type: 'calculate-result' })
  await render(page, state)
  await expect(page.locator('.result-triggers')).toContainText('Dokumentfeil: unreadable-text')
  await expect(page.locator('.result-triggers')).toContainText('Berørte PDF-sider: 2, 3.')
  await expect(page.getByText(/Lang lokal sideforklaring/)).toHaveCount(0)
  await expect(page.locator('.result-triggers > li')).toHaveCount(1)
})

test('review V1/R1: begge økonomiske brudd, prioritet og tallfestet regelgrunnlag er åpne fra start', async ({ page }) => {
  await render(page, screeningState({ values: { L: '100000' } }))
  await expect(page.locator('.recommendation > .meta')).toHaveText('Kodebestemt screeninganbefaling · Prioritet 2')
  await expect(page.locator('.recommendation > p').nth(1)).toHaveText('Økonomiske minimumskrav er ikke oppfylt. Nettoyield er lavere enn ditt avkastningskrav. Kontantstrøm før skatt er negativ.')
  await expect(page.locator('.result-triggers > li > p:first-child')).toHaveText(['Nettoyield er lavere enn ditt avkastningskrav.', 'Kontantstrøm før skatt er negativ.'])
  await expect(page.locator('.result-triggers')).toContainText('Ditt avkastningskrav (Ymin): 7 %')
  await expect(page.locator('.result-triggers')).toContainText('Nullgrense: 0 kr/år')
})
