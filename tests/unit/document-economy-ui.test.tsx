import { expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { DocumentEconomy } from '../../src/frontend/investment/DocumentEconomy.tsx'
import { ImportProgress } from '../../src/frontend/investment/ImportProgress.tsx'
import { importProgressText } from '../../src/frontend/investment/import-progress.ts'
import { emptySlot } from '../../src/frontend/state/prospectus.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { codeFirstBasis } from '../helpers/code-first.ts'
it('viser ærlig hashfase, ventetid, konkret feil og terminalstatus', () => {
  const slot = emptySlot()
  expect(importProgressText({ ...slot, status: 'selecting' })).toContain('SHA-256')
  expect(importProgressText({ ...slot, status: 'loading' })).toContain('Ingen nye KI-kall')
  expect(importProgressText({ ...slot, status: 'failed', error: 'processing-timeout' })).toContain('tids')
  expect(importProgressText({ ...slot, status: 'imported' })).toContain('Videre KI-analyse har ikke startet')
})
it('viser alle økonomifelt, manglende grunnlag, kilder og proveniens direkte', async () => {
  const outcome = await createCodeFirstImport(codeFirstBasis(['Prisantydning: 3 000 000 kr\nKommunale avgifter: 4 000 kr per år']))
  outcome.economy.analysis = { provenance: 'local-only', reason: 'Lagret analyse ble avvist. Videre KI-analyse har ikke startet.', requestDigest: null, selectedPages: [], observations: [], limitations: [] }
  const markup = renderToStaticMarkup(createElement(DocumentEconomy, { outcome, onSource: () => {} }))
  expect(markup).toContain('Lokalt dokumentuttrekk')
  expect(markup.replaceAll('\u00a0', ' ')).toContain('3 000 000,00 kr')
  expect(markup).toContain('Lagret analyse ble avvist')
  expect(markup).toContain('full drift')
  expect(markup).toContain('fysisk PDF-side 1')
  expect(markup).toContain('Åpne originalside')
  for (const field of outcome.economy.fields) expect(markup).toContain(field.label)
})

it('motstrid med ukjent hovedbeløp bevarer dokumenterte alternativer og uavklarte perioder', async () => {
  const outcome = await createCodeFirstImport(codeFirstBasis(['Kommunale avgifter: 4 000 kr per år']))
  const field = outcome.economy.fields.find(item => item.id === 'municipalFees')!
  field.alternatives = [{ amount: field.amount, source: field.sources[0]! }]
  field.status = 'conflict'; field.amount = null; field.period = 'unknown'; field.year = null
  const original = structuredClone(field.alternatives)
  const markup = renderToStaticMarkup(createElement(DocumentEconomy, { outcome, onSource: () => {} }))
  expect(markup).toContain('Kildene inneholder motstridende opplysninger')
  expect(markup.replaceAll('\u00a0', ' ')).toContain('Alternativt belegg: 4 000,00 kr · periode ukjent · år ukjent')
  expect(markup).not.toContain('ikke et verifiserbart beløp for kommunale avgifter')
  expect(field.alternatives).toEqual(original)
})

it('skjuler ventetid for hjelpemidler og holder statusmeldingen fri for sekunder', () => {
  const markup = renderToStaticMarkup(createElement(ImportProgress, { slot: { ...emptySlot(), status: 'loading' } }))
  expect(markup).toContain('<p role="status" aria-live="polite">Venter på lokal dokumentbehandling. Ingen nye KI-kall er startet.</p>')
  expect(markup).toContain('<p aria-hidden="true">Ventetid: 0 s</p>')
})
