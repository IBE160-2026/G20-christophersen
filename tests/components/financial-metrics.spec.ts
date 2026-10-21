import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { bindAnalysisOutcome } from '../../src/contracts/analysis-validation.ts'
import { FinancialFieldSchema } from '../../src/contracts/financial-input.ts'
import type { FinancialField, RecurringField, RegisteredPeriod } from '../../src/contracts/financial-input.ts'
import { FinancialMetrics } from '../../src/frontend/components/FinancialMetrics.tsx'
import { createInitialSession, sessionReducer } from '../../src/frontend/state/session.ts'
import { selectResult } from '../../src/frontend/state/result.ts'
import type { ResultSelection } from '../../src/contracts/result.ts'

// PRD-addendum BT-fasit er håndskrevet i forventningene, aldri beregnet av formatfunksjonen.
const fixtures = new URL('../fixtures/property-cases/', import.meta.url)
const oracle = JSON.parse(readFileSync(new URL('expected.json', fixtures), 'utf8')) as {
  cases: { caseId: string; documentName: string; pageCount: number;
    financialInputs: Record<FinancialField, string>;
    findings: { id: string; grade: string; description: string; pdfPage: number }[] }[]
}
const css = readFileSync(new URL('../../src/frontend/styles.css', import.meta.url), 'utf8')

function snapshot(options: {
  values?: Partial<Record<FinancialField, string>>
  periods?: Partial<Record<RecurringField, RegisteredPeriod>>
  report?: 'error' | 'unconfirmed' | 'tg3'
  costs?: boolean
  beforeCalculation?: (state: ReturnType<typeof createInitialSession>) => ReturnType<typeof createInitialSession>
} = {}) {
  let state = createInitialSession()
  for (const field of FinancialFieldSchema.options) {
    state = sessionReducer(state, { type: 'register-value', field, rawValue: oracle.cases[0]!.financialInputs[field] })
    state = sessionReducer(state, { type: 'register-source', field,
      source: { kind: field === 'L' ? 'assumption' : 'source', description: `Kontrollert grunnlag ${field}`, conflict: null } })
  }
  for (const field of ['L', 'D', 'J'] as const) {
    state = sessionReducer(state, { type: 'register-period', field, period: 'year' })
    state = sessionReducer(state, { type: 'register-year', field, year: '2026' })
  }
  state = sessionReducer(state, { type: 'register-rent-nature', rentNature: 'expected' })
  state = sessionReducer(state, { type: 'confirm-financial' })
  for (const field of FinancialFieldSchema.options) {
    if (options.values?.[field] !== undefined && options.values[field] !== '' && !(field === 'P' && options.values.P === '0')) {
      state = sessionReducer(state, { type: 'register-value', field, rawValue: options.values[field] })
    }
  }
  for (const field of ['L', 'D', 'J'] as const) {
    if (options.periods?.[field] !== undefined) state = sessionReducer(state, { type: 'register-period', field, period: options.periods[field] })
  }
  if (options.costs) {
    state = sessionReducer(state, { type: 'add-cost' })
    state = sessionReducer(state, { type: 'change-cost', id: 'cost-1', update: { label: 'Felleskostnader', rawAmount: '120000', rawDebt: '20000' } })
    state = sessionReducer(state, { type: 'add-cost' })
    state = sessionReducer(state, { type: 'change-cost', id: 'cost-2', update: { label: 'Forsikring', rawAmount: '10000', rawDebt: '0', includedIn: 'cost-1' } })
  }
  state = sessionReducer(state, { type: 'confirm-financial' })
  state = sessionReducer(state, { type: 'navigate', step: 'tilstandsrapport' })
  const fixture = oracle.cases.find(item => item.caseId === (options.report === 'tg3' ? 'F4' : 'F1'))!
  const bytes = new Uint8Array(readFileSync(new URL(fixture.documentName, fixtures)))
  const hash = createHash('sha256').update(bytes).digest('hex')
  const selected = { bytes, hash, file: new File([bytes], fixture.documentName) }
  const correlation = { sessionId: 'story-3-6', requestId: 'component-result', generation: 1 }
  const outcome = bindAnalysisOutcome({ contractVersion: '2', extractionVersion: '1', mode: 'demo',
    requestId: correlation.requestId, reportHash: hash, documentName: fixture.documentName, pageCount: fixture.pageCount,
    pages: Array.from({ length: fixture.pageCount }, (_, index) => ({ pdfPage: index + 1, text: 'Fiktiv rapport', status: 'readable', reason: null })),
  }, { contractVersion: '2', extractionVersion: '1', status: 'completed', limitations: [],
    findings: fixture.findings.map(item => ({ findingId: item.id, grade: item.grade, description: item.description,
      source: { documentName: fixture.documentName, reportHash: hash, pdfPage: item.pdfPage }, uncertainties: [] })) })
  state = sessionReducer(state, { type: 'report-selecting', generation: 1 })
  state = sessionReducer(state, { type: 'report-selected', generation: 1, selected })
  state = sessionReducer(state, { type: 'report-start', correlation })
  state = sessionReducer(state, { type: 'report-response', correlation, ok: true, body: { kind: 'analysis', correlation, outcome } })
  state = sessionReducer(state, { type: 'report-list-visible', generation: 1 })
  for (const finding of fixture.findings) state = sessionReducer(state, { type: 'report-finding-confirm', generation: 1, findingId: finding.id })
  if (options.report !== 'unconfirmed') state = sessionReducer(state, { type: 'report-list-confirm', generation: 1, reportHash: hash,
    documentName: fixture.documentName, listRevision: state.report.listRevision })
  if (options.report === 'error') state = sessionReducer(state, { type: 'report-error', generation: 1, code: 'analysis-failed' })
  // Mangelfasit: rapporten er allerede kontrollert og andre felt bekreftet
  // før ett finansfelt fjernes/ugyldiggjøres ved den testede tilstandsgrensen.
  for (const field of FinancialFieldSchema.options) {
    if (options.values?.[field] === '' || (field === 'P' && options.values?.P === '0')) {
      state = sessionReducer(state, { type: 'register-value', field, rawValue: options.values![field]! })
    }
  }
  if (options.beforeCalculation) state = options.beforeCalculation(state)
  state = sessionReducer(state, { type: 'calculate-result' })
  return state
}
async function render(page: Page, result: ResultSelection) {
  // Serverrender av produksjonskomponenten. Ingen test-/produktskjerm opprettes.
  await page.setContent(`<!doctype html><html lang="nb"><head><style>${css}</style></head><body>${renderToStaticMarkup(createElement(FinancialMetrics, { result }))}</body></html>`)
}
const names = ['Bruttoyield', 'NOI', 'Nettoyield', 'Kontantstrøm før skatt']
const formulas = ['Formel: L/P × 100 %. Yield vises i prosent.', 'Formel: L−D. Resultatet er i kr/år.',
  'Formel: (L−D)/P × 100 %. Yield vises i prosent.', 'Formel: L−D−J. Resultatet er i kr/år.']
async function values(page: Page, expected: string[]) {
  for (let index = 0; index < names.length; index++) {
    const card = page.getByRole('article', { name: names[index], exact: true })
    await expect(card.getByRole('heading', { name: names[index], exact: true })).toBeVisible()
    await expect(card.locator('.metric-value')).toHaveText(expected[index]!)
    await expect(card.locator('.metric-value')).toBeVisible()
  }
}

test('AC1/3 BT-1: fire navn, norsk fasit/enhet/år fra start og faktisk formel/input/kilder', async ({ page }) => {
  const state = snapshot({ costs: true })
  expect(state.resultSnapshot!.assessment.status).toBe('proceed')
  await render(page, selectResult(state))
  await values(page, ['11,875 %', '1 500 000 kr/år', '9,375 %', '700 000 kr/år'])
  await expect(page.getByText('Årsgrunnlag 2026', { exact: true })).toHaveCount(4)
  await expect(page.getByText('Delgrunnlag', { exact: true })).toHaveCount(0)
  for (const name of names) {
    const card = page.getByRole('article', { name, exact: true })
    await expect(card.getByText('Formel:', { exact: false })).not.toBeVisible()
    await card.locator('summary').click()
    await expect(card.locator('details')).toHaveJSProperty('open', true)
    await expect(card.getByText(formulas[names.indexOf(name)]!, { exact: true })).toBeVisible()
    await expect(card.getByText('Egen forutsetning: Kontrollert grunnlag L.')).toBeVisible()
    await expect(card.getByText('Forventet leie, ikke dokumentert faktisk leie.')).toBeVisible()
    await expect(card.getByText('Omregningsfaktor: 1. Anvendt årsverdi: 1 900 000 kr/år · 2026.')).toBeVisible()
    if (name.includes('yield')) {
      await expect(card.getByText('Anvendt totalpris: 16 000 000 kr. Ingen årsomregning.')).toBeVisible()
      await expect(card.getByText('P — Totalpris inklusive eventuell fellesgjeld, uten kjøpsomkostninger')).toBeVisible()
    }
  }
  const cash = page.getByRole('article', { name: 'Kontantstrøm før skatt', exact: true })
  await expect(cash.getByText('Formel: L−D−J. Resultatet er i kr/år.')).toBeVisible()
  await expect(cash.getByText('J — Gjeldsbetjening: renter og avdrag inklusive eventuell fellesgjeld')).toBeVisible()
  await expect(cash.getByText('Felleskostnader: 120 000 kr = D 100 000 kr + J 20 000 kr.')).toBeVisible()
  await expect(cash.getByText('Inngår i Felleskostnader; telles ikke på nytt.')).toBeVisible()
  await expect(cash.getByText('Oppgitt kostnadsinnhold uten dobbelttelling: D 100 000 kr/år · J 20 000 kr/år. Dette kan være en del av totalene.')).toBeVisible()
})

for (const [id, input, expected, missing, action] of [
  ['BT-3', { L: '' }, ['Ikke beregnbart', 'Ikke beregnbart', 'Ikke beregnbart', 'Ikke beregnbart'], 'L: Verdien mangler.', 'Oppgi verdien for L.'],
  ['BT-5', { J: '' }, ['11,875 %', '1 500 000 kr/år', '9,375 %', 'Ikke beregnbart'], 'J: Verdien mangler.', 'Oppgi verdien for J.'],
  ['BT-6', { P: '0' }, ['Ikke beregnbart', '1 500 000 kr/år', 'Ikke beregnbart', '700 000 kr/år'], 'P: Totalpris må være større enn 0.', 'Oppgi P større enn 0.'],
  ['BT-17', { J: '', L: '1400000' }, ['8,750 %', '1 000 000 kr/år', '6,250 %', 'Ikke beregnbart'], 'J: Verdien mangler.', 'Oppgi verdien for J.'],
  ['BT-18', { Ymin: '' }, ['11,875 %', '1 500 000 kr/år', '9,375 %', '700 000 kr/år'], null, null],
] as const) {
  test(`AC1/2 ${id}: konkrete inputmangler, gyldige delberegninger og ingen skjult null`, async ({ page }) => {
    await render(page, selectResult(snapshot({ values: input })))
    await values(page, [...expected])
    await expect(page.getByText('Delgrunnlag', { exact: true })).toHaveCount(4)
    if (missing) {
      for (let index = 0; index < expected.length; index++) {
        if (expected[index] === 'Ikke beregnbart') {
          const card = page.getByRole('article', { name: names[index], exact: true })
          await expect(card.locator('.metric-issues')).toContainText(missing)
          await expect(card.locator('.metric-issues')).toContainText(action!)
          await expect(card.locator('.metric-issues')).toBeVisible()
          await card.locator('summary').click()
          await expect(card.getByText('Anvendt årsverdi:', { exact: false })).toHaveCount(0)
        }
      }
    }
    await expect(page.getByText('Gå videre', { exact: true })).toHaveCount(0)
    await expect(page.getByText('Forkast', { exact: true })).toHaveCount(0)
  })
}

for (const report of ['error', 'unconfirmed', 'tg3'] as const) {
  test(`AC2 BT-4 og tilstandsgrense: ${report} beholder F1-tall som Delgrunnlag`, async ({ page }) => {
    const state = snapshot({ report })
    expect(state.resultSnapshot!.assessment.partialBasis).toBe(true)
    expect(state.resultSnapshot!.assessment.basis.reportBasis.status).toBe(report === 'error' ? 'failed' : 'completed')
    await render(page, selectResult(state))
    await values(page, ['11,875 %', '1 500 000 kr/år', '9,375 %', '700 000 kr/år'])
    await expect(page.getByText('Delgrunnlag', { exact: true })).toHaveCount(4)
  })
}

test('AC1 BT-11: negative resultater beholdes i alle berørte kort', async ({ page }) => {
  await render(page, selectResult(snapshot({ values: { L: '300000' } })))
  await values(page, ['1,875 %', '−100 000 kr/år', '−0,625 %', '−900 000 kr/år'])
})

test('AC3 BT-15: registrert måned, faktor 12 og faktisk anvendt årsverdi er lesbare', async ({ page }) => {
  await render(page, selectResult(snapshot({ values: { L: '1440000', D: '20000', J: '600000' }, periods: { D: 'month' } })))
  await values(page, ['9,000 %', '1 200 000 kr/år', '7,500 %', '600 000 kr/år'])
  const cash = page.getByRole('article', { name: 'Kontantstrøm før skatt', exact: true })
  await cash.locator('summary').click()
  await expect(cash.getByText('Registrert: 20000 kr/måned · 2026.')).toBeVisible()
  await expect(cash.getByText('Omregningsfaktor: 12. Anvendt årsverdi: 240 000 kr/år · 2026.')).toBeVisible()
  await expect(cash.getByText('Oppgitt kilde: Kontrollert grunnlag D.')).toBeVisible()
})

test('AC4 BT-8: likhet og én krone under har lik standardvisning, men bruddet forklares presist', async ({ page }) => {
  await render(page, selectResult(snapshot({ values: { L: '1520000' } })))
  const net = page.getByRole('article', { name: 'Nettoyield', exact: true })
  await expect(net.locator('.metric-value')).toHaveText('7,000 %')
  await expect(net.locator('.metric-rounding')).toHaveCount(0)
  await render(page, selectResult(snapshot({ values: { L: '1519999' } })))
  await expect(net.locator('.metric-value')).toHaveText('7,000 %')
  await expect(net.locator('.metric-rounding')).toContainText('Nettoyield er under avkastningskravet før avrunding.')
  await net.locator('summary').click()
  await expect(net.getByText('Detaljverdi (uavrundet): 6,99999375 %.')).toBeVisible()
  await expect(net.getByText('Eksakt minimumskrav til nettoyield: 7 %. Regelen bruker uavrundet grunnlag uten toleransemargin.')).toBeVisible()
})

test('AC4: negativ kontantstrøm som rundes til null forklares med uavrundet beløp', async ({ page }) => {
  await render(page, selectResult(snapshot({ values: { J: '1500000,01' } })))
  const cash = page.getByRole('article', { name: 'Kontantstrøm før skatt', exact: true })
  await expect(cash.locator('.metric-value')).toHaveText('0 kr/år')
  await expect(cash.locator('.metric-rounding')).toContainText('Kontantstrømmen er negativ før avrunding.')
  await cash.locator('summary').click()
  await expect(cash.getByText('Detaljverdi (uavrundet): −0,01 kr/år.')).toBeVisible()
})

test('AC5: native semantikk, Enter/Space, synlig fokus og lukket detalj uten ekstra fokusmål', async ({ page }) => {
  await render(page, selectResult(snapshot()))
  const summaries = page.locator('summary')
  const cdp = await page.context().newCDPSession(page)
  // Native summary er DisclosureTriangle i Chromium; Playwrights tekstsnapshot
  // utelater denne rollen. Les den faktiske expanded-egenskapen i AX-treet.
  async function expanded(name: string) {
    const tree = await cdp.send('Accessibility.getFullAXTree')
    const control = tree.nodes.find(node => node.role?.value === 'DisclosureTriangle' && node.name?.value === name)
    expect(control?.ignored).toBe(false)
    return control?.properties?.find(property => property.name === 'expanded')?.value.value
  }
  await expect(summaries).toHaveCount(4)
  for (let index = 0; index < 4; index++) {
    const summary = summaries.nth(index)
    const detail = page.locator('details').nth(index)
    await page.keyboard.press('Tab')
    await expect(summary).toBeFocused()
    await expect(summary).toHaveCSS('outline-style', 'solid')
    await expect(summary).toHaveCSS('outline-width', '2px')
    await expect(summary).toHaveCSS('outline-color', 'rgb(34, 102, 95)')
    await expect(detail).toHaveJSProperty('open', false)
    await expect(page.getByRole('article', { name: names[index], exact: true }).getByText('Formel:', { exact: false })).not.toBeVisible()
    expect(await expanded(`Beregningsgrunnlag — ${names[index]}`)).toBe(false)
    await page.keyboard.press('Enter')
    await expect(detail).toHaveJSProperty('open', true)
    await expect(page.getByRole('article', { name: names[index], exact: true }).getByText('Formel:', { exact: false })).toBeVisible()
    expect(await expanded(`Beregningsgrunnlag — ${names[index]}`)).toBe(true)
    await page.keyboard.press('Space')
    await expect(detail).toHaveJSProperty('open', false)
    expect(await expanded(`Beregningsgrunnlag — ${names[index]}`)).toBe(false)
    await expect(summary).toBeFocused()
  }
})

test('AC5 og snapshotgrense: historiske tall/kilder blandes ikke med ny finansverdi', async ({ page }) => {
  const before = snapshot()
  const after = sessionReducer(before, { type: 'register-value', field: 'L', rawValue: '1400000' })
  await render(page, selectResult(after))
  await expect(page.getByText('Utdatert / Må bekreftes på nytt', { exact: true })).toBeVisible()
  await expect(page.getByText('L: verdi er endret.', { exact: false })).toContainText('Kontroller og bekreft berørt tallgrunnlag for L')
  await values(page, ['11,875 %', '1 500 000 kr/år', '9,375 %', '700 000 kr/år'])
  await page.getByRole('article', { name: 'NOI', exact: true }).locator('summary').click()
  await expect(page.getByRole('article', { name: 'NOI', exact: true }).getByText('Registrert: 1900000 kr/år · 2026.')).toBeVisible()
  await expect(page.getByText('Registrert: 1400000 kr/år · 2026.')).toHaveCount(0)
  await expect(page.locator('.financial-metric').first()).toHaveCSS('background-color', 'rgb(235, 241, 239)')
  await expect(page.locator('.financial-metric').first()).toHaveCSS('color', 'rgb(36, 53, 55)')
})

test('ny økt viser bare Ikke beregnet uten gamle verdier eller detaljer', async ({ page }) => {
  await render(page, selectResult(snapshot()))
  await render(page, selectResult(createInitialSession()))
  await expect(page.getByText('Ikke beregnet', { exact: true })).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(0)
  await expect(page.locator('details')).toHaveCount(0)
  await expect(page.getByText('11,875 %', { exact: true })).toHaveCount(0)
})

test('review B1: bred rad og smal ombrytning følger DESIGN uten innholdstap', async ({ page }) => {
  await render(page, selectResult(snapshot()))
  const cards = page.locator('.financial-metric')
  const wide = await cards.evaluateAll(elements => elements.map(element => element.getBoundingClientRect().top))
  expect(new Set(wide).size).toBe(1)
  await page.setViewportSize({ width: 600, height: 900 })
  const narrow = await cards.evaluateAll(elements => elements.map(element => element.getBoundingClientRect().top))
  expect(new Set(narrow).size).toBe(4)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

for (const kind of ['unconfirmed', 'conflict'] as const) {
  test(`review B2/3: ${kind} Ymin beholder registrering/kilde og er ikke et gyldig anvendt krav`, async ({ page }) => {
    const state = snapshot({ beforeCalculation: state => kind === 'unconfirmed'
      ? sessionReducer(state, { type: 'register-value', field: 'Ymin', rawValue: '8' })
      : sessionReducer(state, { type: 'register-source', field: 'Ymin', source: { kind: 'source',
        description: 'Kontrollert grunnlag Ymin', conflict: { rawValue: '9', description: 'Alternativt avkastningskrav' } } }) })
    expect(state.resultSnapshot!.assessment.thresholds.netYield.decision.status).toBe('unavailable')
    await render(page, selectResult(state))
    await values(page, ['11,875 %', '1 500 000 kr/år', '9,375 %', '700 000 kr/år'])
    const net = page.getByRole('article', { name: 'Nettoyield', exact: true })
    await net.locator('summary').click()
    await expect(net.getByText('Eksakt minimumskrav til nettoyield:', { exact: false })).toHaveCount(0)
    await expect(net.getByText(`Registrert Ymin: ${kind === 'unconfirmed' ? '8' : '7'} %.`, { exact: true })).toBeVisible()
    await expect(net.getByText('Oppgitt kilde: Kontrollert grunnlag Ymin.', { exact: true })).toBeVisible()
    await expect(net.getByText('Terskelkontroll ikke tilgjengelig.', { exact: true })).toBeVisible()
    if (kind === 'conflict') await expect(net.getByText('Uløst kildekonflikt: 9 % · Alternativt avkastningskrav.', { exact: true })).toBeVisible()
    await expect(net.locator('.metric-threshold-issues')).toContainText(kind === 'conflict' ? 'Ymin: Uløst kildekonflikt.' : 'Ymin: Verdien er ubekreftet.')
  })
}

test('review B3: gyldig krav har registrert verdi, kilde og bekreftelse ved eksakt verdi', async ({ page }) => {
  await render(page, selectResult(snapshot()))
  const net = page.getByRole('article', { name: 'Nettoyield', exact: true })
  await net.locator('summary').click()
  await expect(net.getByText('Registrert Ymin: 7 %.', { exact: true })).toBeVisible()
  await expect(net.getByText('Oppgitt kilde: Kontrollert grunnlag Ymin.', { exact: true })).toBeVisible()
  await expect(net.getByText('Ymin er bekreftet i dette resultatet.', { exact: true })).toBeVisible()
})

for (const kind of ['unconfirmed', 'conflict'] as const) {
  test(`review B8 BT-14: ${kind} numerisk L viser årsak og ikke-anvendt grunnlag`, async ({ page }) => {
    const state = snapshot({ beforeCalculation: state => kind === 'unconfirmed'
      ? sessionReducer(state, { type: 'register-value', field: 'L', rawValue: '1800000' })
      : sessionReducer(state, { type: 'register-source', field: 'L', source: { kind: 'source',
        description: 'Oppgitt leiekontrakt', conflict: { rawValue: '1800000', description: 'Annen leiekilde' } } }) })
    await render(page, selectResult(state))
    await values(page, ['Ikke beregnbart', 'Ikke beregnbart', 'Ikke beregnbart', 'Ikke beregnbart'])
    for (const name of names) {
      const card = page.getByRole('article', { name, exact: true })
      await expect(card.locator('.metric-issues')).toContainText(kind === 'conflict' ? 'L: Uløst kildekonflikt.' : 'L: Verdien er ubekreftet.')
      await card.locator('summary').click()
      await expect(card.getByText('Anvendt årsverdi:', { exact: false })).toHaveCount(0)
      await expect(card.getByText('Normalisert årsverdi, ikke anvendt i beregning:', { exact: false }).first()).toBeVisible()
      if (kind === 'conflict') await expect(card.getByText('Uløst kildekonflikt: 1800000 kr · Annen leiekilde.', { exact: true })).toBeVisible()
    }
  })
}

test('review B4/5/6/8: ugyldig kostnadsoppdeling bevarer råbeløp og valgt relasjon uten inkludert-påstand', async ({ page }) => {
  const state = snapshot({ costs: true, beforeCalculation: state => sessionReducer(state, { type: 'change-cost',
    id: 'cost-2', update: { rawAmount: 'ukjent', rawDebt: '200', includedIn: 'cost-1' } }) })
  await render(page, selectResult(state))
  const cash = page.getByRole('article', { name: 'Kontantstrøm før skatt', exact: true })
  await cash.locator('summary').click()
  await expect(cash.getByText('Registrert beløp: ukjent kr. Registrerte renter og avdrag: 200 kr.', { exact: true })).toBeVisible()
  await expect(cash.getByText('Registrert inkludering: Felleskostnader. Inkluderingen må kontrolleres.', { exact: true })).toBeVisible()
  await expect(cash.getByText('De inngår allerede i D/J-totalene', { exact: false })).toHaveCount(0)
  await expect(cash.getByText('Oppgitt kostnadsinnhold uten dobbelttelling:', { exact: false })).toHaveCount(0)
})

test('review B4: kostnad som overstiger total beholder årsak uten gyldig inkluderingspåstand', async ({ page }) => {
  await render(page, selectResult(snapshot({ costs: true, beforeCalculation: state => sessionReducer(state,
    { type: 'change-cost', id: 'cost-1', update: { rawAmount: '900000', rawDebt: '20000' } }) })))
  const cash = page.getByRole('article', { name: 'Kontantstrøm før skatt', exact: true })
  await expect(cash.locator('.metric-issues')).toContainText('D: Oppgitt kostnadsinnhold overstiger den registrerte totalen.')
  await cash.locator('summary').click()
  await expect(cash.getByText('De inngår allerede i D/J-totalene', { exact: false })).toHaveCount(0)
})
