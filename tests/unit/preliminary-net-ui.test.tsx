import { expect, it, vi } from 'vitest'
import { createElement } from 'react'
import type { ComponentProps } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { InvestmentOverview } from '../../src/frontend/investment/InvestmentOverview.tsx'
import { ImportClient } from '../../src/frontend/analysis/import-client.ts'
import { ListingClient } from '../../src/frontend/analysis/listing-client.ts'
import { createInitialSession, sessionReducer } from '../../src/frontend/state/session.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { codeFirstBasis } from '../helpers/code-first.ts'
vi.mock('../../src/frontend/investment/PropertyImage.tsx', () => ({ PropertyImage: () => null }))
vi.mock('../../src/frontend/pdf/PdfViewer.tsx', () => ({ PdfViewer: () => null }))
async function state() {
  const outcome = await createCodeFirstImport(codeFirstBasis(['Prisantydning: 8 600 000 kr', 'Ingen lån registrert for sameiet.\nSeksjonen har ingen gjeld per. 26.10.2026', 'Felleskostnader\nKr 3 660,- pr. mnd.\nInkluderer: Felleskostnader: 2 704,-\nInternett: 159,-\nA-konto fyring: 797,-']))
  const session = createInitialSession()
  session.prospectus.prospectus = { ...session.prospectus.prospectus, status: 'imported', outcome, selected: { hash: outcome.reportHash, bytes: new Uint8Array(), file: new File([], outcome.documentName) } }
  session.financial.L = { rawValue: '226800', period: 'year', year: '2025', confirmed: false }
  session.sources.L = { kind: 'assumption', description: 'Leiescenario', conflict: null, rentNature: 'expected' }
  return session
}
function overview(session: ReturnType<typeof createInitialSession>, overrides: Partial<ComponentProps<typeof InvestmentOverview>> = {}) {
  const markup = renderToStaticMarkup(createElement(InvestmentOverview, { session, rent: { status: 'idle', result: null, retry: () => {} }, dispatch: () => {}, importClient: new ImportClient(() => {}), listingClient: new ListingClient(() => {}), onOpen: () => {}, overviewRef: { current: null }, controls: { equity: '', annualInterest: '', months: '' }, onControls: () => {}, ...overrides }))
  return markup.replaceAll('\u00a0', ' ')
}
function render(session: ReturnType<typeof createInitialSession>) {
  return overview(session).match(/<details class="scenario-basis">[\s\S]*?<\/details>/)![0].replaceAll('\u00a0', ' ')
}
it.each(['', 'ugyldig', '0'])('viser kjent årsoverskudd uten prosent eller divisjon når P er %s', async rawValue => {
  const session = sessionReducer(sessionReducer(await state(), { type: 'register-value', field: 'P', rawValue: '1' }), { type: 'register-value', field: 'P', rawValue })
  const markup = render(session)
  expect(markup).toContain('182 880 kr/år')
  expect(markup).not.toContain('%')
  expect(markup).not.toContain('kr P × 100')
  expect(markup).not.toMatch(/\/ .* kr × 100/)
})
it('viser registrert prisproveniens og gyldig prosent uten å kalle manuell P en dokumentert prisantydning', async () => {
  let session = sessionReducer(await state(), { type: 'register-value', field: 'P', rawValue: '8000000' })
  session = sessionReducer(session, { type: 'register-source', field: 'P', source: { kind: 'assumption', description: 'Mitt planlagte bud', conflict: null } })
  const markup = render(session)
  expect(markup).toContain('2,29 %')
  expect(markup).toContain('/ 8 000 000 kr × 100')
  expect(markup).toContain('Egen forutsetning: Mitt planlagte bud')
  expect(markup).not.toContain('P er prisantydning')
  expect(markup).not.toContain('Dokumentets prisgrunnlag er prisantydning')
})

it('utelater bare generert dokumenthash i prisforklaringen og bevarer kildeidentitet og prisbetydning', async () => {
  const session = await state()
  const outcome = session.prospectus.prospectus.outcome!
  const description = `Salgsoppgave ${outcome.documentName}, SHA-256 ${outcome.reportHash}. Dokumentets prisantydning med eksplisitt fellesgjeld; ikke avtalt kjøpesum. Kildeutdrag er bevart i importen.`
  session.financial.P.rawValue = '8600000'
  session.sources.P = { kind: 'source', description, conflict: null }
  const priceExplanation = (value: ReturnType<typeof createInitialSession>) => render(value).match(/<p>Prisgrunnlag:[\s\S]*?<\/p>/)![0]
  const markup = priceExplanation(session)
  expect(markup).not.toContain(outcome.reportHash)
  expect(markup).not.toContain('SHA-256')
  expect(markup).toContain(`Salgsoppgave ${outcome.documentName}`)
  expect(markup).toContain('Dokumentets prisantydning med eksplisitt fellesgjeld; ikke avtalt kjøpesum')
  expect(session.sources.P.description).toBe(description)
  const manual = sessionReducer(session, { type: 'register-source', field: 'P', source: { kind: 'source', description: description + ' Manuell kilde.', conflict: null } })
  expect(priceExplanation(manual)).toContain(outcome.reportHash)
  expect(priceExplanation(manual)).toContain('Manuell kilde.')
})


it('viser tre hovedtall og merker automatisk delsum uten full nettoavkastning', async () => {
  const markup = overview(await state())
  const kpis = markup.match(/<div class="investment-kpis"[\s\S]*?<\/div>/)![0]
  expect(kpis.match(/<article>/g)).toHaveLength(3)
  expect(kpis).toContain('Avkastning etter drift')
  expect(kpis).toContain('2,13')
  expect(kpis).toContain('Foreløpig · kun dokumentert delsum · før finansiering og skatt')
  expect(kpis).not.toContain('Nettoavkastning')
  expect(kpis).not.toContain('scenario-preliminary-net')
})
it('bruker egen totaldrift i én prosent og i aktiv formel, med dokumentdelsum som referanse', async () => {
  const markup = overview(await state(), { operatingOverride: '4000' })
  expect(markup).toContain('2,08') // (226800 − 48000) / 8600000 × 100
  expect(markup).toContain('Egen totalforutsetning · før finansiering og skatt')
  expect(markup).toContain('valgt årsdrift 48 000 kr = 178 800 kr/år')
  expect(markup).toContain('Dokumentets delsum som referanse')
  expect(markup).toContain('43 920 kr')
})
it.each(['', '-1', 'ugyldig'])('ugyldig egen drift %s får ikke fallback til dokumentdelsummen', async operatingOverride => {
  const markup = overview(await state(), { operatingOverride })
  expect(markup).toMatch(/data-testid="scenario-net">—/)
  expect(markup).toMatch(/data-testid="scenario-cash">—/)
  expect(markup).not.toContain('scenario-operating-formula')
  expect(markup).toContain('2,64') // Brutto er uavhengig av drift.
})

it('eksplisitt null drift er en egen forutsetning og erstattes ikke av dokumentdelsum', async () => {
  const markup = overview(await state(), { operatingOverride: '0' })
  expect(markup).toMatch(/data-testid="scenario-net">2,64/)
  expect(markup).toContain('valgt årsdrift 0 kr = 226 800 kr/år')
  expect(markup).toContain('Egen totalforutsetning · før finansiering og skatt')
})
it('registrert totaldrift har forrang over dokumentdelsum uten lokal overstyring', async () => {
  let session = await state()
  session = sessionReducer(session, { type: 'register-value', field: 'D', rawValue: '48000' })
  session.financial.D.period = 'year'; session.financial.D.year = '2025'
  session.sources.D = { kind: 'assumption', description: 'Samlet årsdrift', conflict: null }
  const markup = overview(session)
  expect(markup).toMatch(/data-testid="scenario-net">2,08/)
  expect(markup).toContain('Registrert drift · før finansiering og skatt')
  expect(markup).toContain('valgt årsdrift 48 000 kr = 178 800 kr/år')
})
