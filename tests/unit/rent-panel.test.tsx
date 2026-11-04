import { beforeAll, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createInitialSession } from '../../src/frontend/state/session.ts'
import { selectScenarioBasis } from '../../src/frontend/state/scenario.ts'
import { RentEstimatePanel } from '../../src/frontend/investment/RentEstimatePanel.tsx'
import { rentalDocument, fixtureRent } from '../helpers/rental-fixture.ts'
let fixture: Awaited<ReturnType<typeof rentalDocument>>, result: Awaited<ReturnType<typeof fixtureRent>>
beforeAll(async () => { fixture = await rentalDocument(); result = await fixtureRent(fixture.outcome) })
it('en valgt actual-kategori uten gyldig kilde og beløp fremstilles ikke som registrert faktisk leie', () => {
  const session = createInitialSession()
  session.prospectus.prospectus = { ...session.prospectus.prospectus, status: 'imported', ...fixture }
  session.sources.L.rentNature = 'actual'
  const render = () => renderToStaticMarkup(<RentEstimatePanel session={session} rent={{ status: 'ready', result, retry() {} }} basis={selectScenarioBasis(session, result)} controls={{ equity: '', annualInterest: '', months: '' }} onSource={() => undefined} />)
  for (const value of ['', '-1', 'feil']) {
    session.financial.L.rawValue = value
    expect(render()).toContain('registreringen har mangler eller motstrid')
    expect(render()).not.toContain('faktisk leie er registrert med grunnlag')
  }
  session.financial.L = { rawValue: '12000', confirmed: false, period: 'month', year: '2025' }
  session.sources.L = { kind: 'source', description: 'Leiekontrakt side 1', conflict: null, rentNature: 'actual' }
  expect(render()).toContain('Ubekreftet faktisk leie er registrert med grunnlag: Leiekontrakt side 1')
  session.sources.L.conflict = { rawValue: '10000', description: 'Annen kontrakt' }
  expect(render()).toContain('registreringen har mangler eller motstrid')
})

it('viser dokumenterte husopplysninger og synlig modellgrense uten numerisk markedsleie', async () => {
  const house = await rentalDocument(['Adresse: Fasitveien 4, 4005 Stavanger', 'Kommune: Stavanger', 'Boligtype: Enebolig', 'BRA-i: 196 m2', 'Antall rom: 3'])
  const rent = await fixtureRent(house.outcome), session = createInitialSession()
  session.prospectus.prospectus = { ...session.prospectus.prospectus, status: 'imported', ...house }
  const markup = renderToStaticMarkup(<RentEstimatePanel session={session} rent={{ status: 'ready', result: rent, retry() {} }} basis={selectScenarioBasis(session, rent)} controls={{ equity: '', annualInterest: '', months: '' }} onSource={() => undefined} />)
  expect(markup).toContain('Boligopplysninger fra dokumentet')
  expect(markup).toContain('Enebolig'); expect(markup).toContain('196 m² BRA-i')
  expect(markup).toContain('Hvorfor markedsestimatet mangler')
  expect(markup).toContain('ingen SSB-celle brukes som leie for hele objektet')
  expect(markup).not.toContain('data-testid="rent-monthly"')
  expect(markup).toContain('Ukjent · ikke entydig gjenkjent')
})
