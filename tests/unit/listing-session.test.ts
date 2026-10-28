import { describe, expect, it } from 'vitest'
import { createInitialSession, sessionReducer } from '../../src/frontend/state/session.ts'
import type { SessionState } from '../../src/frontend/state/session.ts'
import { checkedDraft, completeDraft, listingFixture, listingUrl } from '../fixtures/listing/finn.ts'
const correlation = { requestId: 'listing-test', generation: 1 }
function imported() {
  let state = sessionReducer(createInitialSession(), { type: 'listing-url', url: listingUrl })
  state = sessionReducer(state, { type: 'listing-start', correlation })
  return sessionReducer(state, { type: 'listing-response', correlation, ok: true, body: { kind: 'listing', correlation, listing: listingFixture() } })
}
describe('FINN-1 økt og atomisk bruk', () => {
  it('fyller entydig P automatisk og bevarer original og kontrollkrav', () => {
    let state = imported()
    expect(state.listing.status).toBe('ready')
    expect(state.financial.P).toEqual({ rawValue: '3200000', confirmed: false })
    expect(state.financial.D.rawValue).toBe('')
    expect(state.financial.J.rawValue).toBe('')
    expect(sessionReducer(state, { type: 'listing-apply' })).toBe(state)
    state = { ...state, listing: { ...state.listing, draft: checkedDraft() } }
    state = sessionReducer(state, { type: 'listing-apply' })
    expect(state.financial.P).toEqual({ rawValue: '3200000', confirmed: false })
    expect(state.financial.D.rawValue).toBe('')
    expect(state.financial.J.rawValue).toBe('')
    expect(state.listing.draft!.original).toEqual(listingFixture())
    expect(state.listing.draft!.original.fields.find(f => f.id === 'propertyTax')!.status).toBe('missing')
  })
  it('bruk bevarer manuelle D/J, kostnadsposter og deres kilder', () => {
    let state = imported()
    state = { ...state, listing: { ...state.listing, draft: checkedDraft() } }
    state = sessionReducer(state, { type: 'register-value', field: 'D', rawValue: '12345' })
    state = sessionReducer(state, { type: 'register-value', field: 'J', rawValue: '67890' })
    state = sessionReducer(state, { type: 'add-cost' })
    const before = state
    state = sessionReducer(state, { type: 'listing-apply' })
    expect(state.financial.D).toEqual(before.financial.D)
    expect(state.financial.J).toEqual(before.financial.J)
    expect(state.costItems).toEqual(before.costItems)
    expect(state.sources.D).toEqual(before.sources.D)
    expect(state.sources.J).toEqual(before.sources.J)
  })
  it('brukt importbevis beholdes mens nye rettinger er ubrukte', () => {
    let state = imported()
    state = { ...state, listing: { ...state.listing, draft: checkedDraft() } }
    state = sessionReducer(state, { type: 'listing-apply' })
    const applied = state.listing.applied!
    state = sessionReducer(state, { type: 'listing-correction', id: 'price', correction: { ...state.listing.draft!.corrections.price!, rawAmount: '1', reviewed: false } })
    expect(state.listing.applied).toBe(applied)
    expect(applied.draft.corrections.price!.rawAmount).toBe('3000000')
    expect(state.financial.P.rawValue).toBe('3200000')
  })
  function completeSession() {
    const state = imported()
    return { ...state, listing: { ...state.listing, draft: completeDraft(), financing: { equity: '1075000', annualInterest: '0', months: '240', year: '2026' } } }
  }
  it('bruker komplett kontrollert D/J med år, periode og sporbar ubekreftet forutsetning', () => {
    const state = sessionReducer(completeSession(), { type: 'listing-apply' })
    expect(state.financial.D).toEqual({ rawValue: '48000', period: 'year', year: '2026', confirmed: false })
    expect(state.financial.J).toEqual({ rawValue: '111999.96', period: 'year', year: '2026', confirmed: false })
    expect(state.sources.D.description).toContain(listingUrl)
    expect(state.sources.J).toMatchObject({ kind: 'assumption', description: expect.stringContaining('øreavrundet') })
    const next = sessionReducer(sessionReducer(state, { type: 'listing-financing', field: 'equity', value: '3075000' }), { type: 'listing-apply' })
    expect(next.financial.J.rawValue).toBe('12000.00')
  })
  it.each(['', '2025'])('blokkerer J når finansieringsåret er %s', year => {
    const state = completeSession(); state.listing.financing.year = year
    expect(sessionReducer(state, { type: 'listing-apply' }).financial.J.rawValue).toBe('')
  })
  for (const field of ['D', 'J'] as const) for (const target of ['period', 'year'] as const) {
    it('bevarer manuell ' + field + '-' + target + ' ved ny bruk', () => {
      let state = sessionReducer(completeSession(), { type: 'listing-apply' })
      state = target === 'period' ? sessionReducer(state, { type: 'register-period', field, period: 'month' }) : sessionReducer(state, { type: 'register-year', field, year: '2025' })
      const before = state.financial[field]
      state = sessionReducer(sessionReducer(state, { type: 'listing-financing', field: 'equity', value: '3075000' }), { type: 'listing-apply' })
      expect(state.financial[field]).toEqual(before)
    })
  }
  it('ready-utkast tillater ikke redundant oppslag og beholder kontroll og brukt bevis', () => {
    let state = sessionReducer(completeSession(), { type: 'listing-apply' })
    const applied = state.listing.applied
    state = sessionReducer(state, { type: 'listing-correction', id: 'price', correction: { ...state.listing.draft!.corrections.price!, rawAmount: '2900000', note: 'Meglerretting', reviewed: true } })
    const refresh = { ...correlation, requestId: 'refresh' }
    expect(sessionReducer(state, { type: 'listing-start', correlation: refresh })).toBe(state)
    expect(sessionReducer(state, { type: 'listing-error', correlation: refresh })).toBe(state)
    expect(sessionReducer(state, { type: 'listing-response', correlation: refresh, ok: true, body: { kind: 'listing', correlation: refresh, listing: listingFixture() } })).toBe(state)
    const tracking = sessionReducer(state, { type: 'listing-url', url: listingUrl + '?utm_source=same-object' })
    expect(sessionReducer(tracking, { type: 'listing-start', correlation: { ...refresh, generation: tracking.listing.generation } })).toBe(tracking)
    expect(tracking.listing.draft!.corrections.price).toMatchObject({ rawAmount: '2900000', note: 'Meglerretting', reviewed: true })
    expect(tracking.listing.applied).toBe(applied)
  })
  it('et tidligere mislykket utkast blir ikke gjeldende ved duplikatavvisning', () => {
    const previous = completeSession()
    let state: SessionState = { ...previous, listing: { ...previous.listing, status: 'failed' } }
    state = sessionReducer(state, { type: 'listing-start', correlation })
    state = sessionReducer(state, { type: 'listing-response', correlation, ok: false, body: { kind: 'rejected', code: 'already-attempted' } })
    expect(state.listing.status).toBe('failed')
    expect(sessionReducer(state, { type: 'listing-apply' })).toBe(state)
    expect(state.listing.draft).toBe(previous.listing.draft)
  })
  it.each(['4000000', '4 000 000,00', '', 'ugyldig'])('manuell P %s blokkerer importert J før bruk', rawValue => {
    let state = sessionReducer(completeSession(), { type: 'register-value', field: 'P', rawValue })
    state = sessionReducer(state, { type: 'listing-apply' })
    expect(state.financial.P.rawValue).toBe(rawValue)
    expect(state.financial.D.rawValue).toBe('48000')
    expect(state.financial.J.rawValue).toBe('')
  })
  it('norsk formatert manuell P som samsvarer tillater importert J', () => {
    let state = sessionReducer(completeSession(), { type: 'register-value', field: 'P', rawValue: '3 200 000,00' })
    state = sessionReducer(state, { type: 'listing-apply' })
    expect(state.financial.P.rawValue).toBe('3 200 000,00')
    expect(state.financial.J.rawValue).toBe('111999.96')
  })
  it('prisbrudd etter bruk blanker import-eid J, men bevarer eksplisitt manuell J', () => {
    const applied = sessionReducer(completeSession(), { type: 'listing-apply' })
    const equal = sessionReducer(applied, { type: 'register-value', field: 'P', rawValue: '3 200 000,00' })
    expect(equal.financial.J.rawValue).toBe('111999.96')
    const divergent = sessionReducer(equal, { type: 'register-value', field: 'P', rawValue: '4 000 000,00' })
    expect(divergent.financial.J).toEqual({ rawValue: '', period: '', year: '', confirmed: false })
    expect(divergent.listing.applied).toBe(applied.listing.applied)
    let manual = sessionReducer(applied, { type: 'register-value', field: 'J', rawValue: '123456' })
    manual = sessionReducer(manual, { type: 'register-value', field: 'P', rawValue: '4000000' })
    expect(manual.financial.J.rawValue).toBe('123456')
  })
  it.each([
    ['3100000', ''],
    ['3 200 000,00', '111999.96'],
  ])('ubrukt annonseretting endrer ikke prisbindingen til anvendt J ved P=%s', (rawValue, expectedJ) => {
    let state = sessionReducer(completeSession(), { type: 'listing-apply' })
    for (const [id, amount] of [['price', '2900000'], ['totalPrice', '3175000']] as const) {
      state = sessionReducer(state, { type: 'listing-correction', id, correction: {
        ...state.listing.draft!.corrections[id]!, rawAmount: amount, note: 'Kontrollert nytt utkast', reviewed: true,
      } })
    }
    const used = state.listing.applied
    state = sessionReducer(state, { type: 'register-value', field: 'P', rawValue: rawValue! })
    expect(state.financial.J.rawValue).toBe(expectedJ)
    expect(state.listing.applied).toBe(used)
  })
  it.each([listingUrl + '?utm_source=changed', 'https://finn.no/realestate/homes/ad.html?finnkode=476576649', listingUrl.replace('476576649', '123')])('loading låser opprinnelig URL og aktivt svar ved %s', url => {
    let state = sessionReducer(createInitialSession(), { type: 'listing-url', url: listingUrl })
    state = sessionReducer(state, { type: 'listing-start', correlation })
    expect(sessionReducer(state, { type: 'listing-url', url })).toBe(state)
    const finished = sessionReducer(state, { type: 'listing-response', correlation, ok: true, body: { kind: 'listing', correlation, listing: listingFixture() } })
    expect(finished.listing.status).toBe('ready')
    expect(finished.listing.url).toBe(listingUrl)
    expect(finished.financial.P.rawValue).toBe('3200000')
  })
  it.each(['available', 'missing', 'unavailable', 'conflict'] as const)('konfliktalternativer med status %s fyller aldri automatisk P', status => {
    let state = sessionReducer(createInitialSession(), { type: 'listing-url', url: listingUrl })
    state = sessionReducer(state, { type: 'listing-start', correlation })
    const listing = listingFixture()
    listing.fields[0]!.status = status
    if (status === 'missing' || status === 'unavailable') listing.fields[0]!.amount = null
    listing.fields[0]!.alternatives = [{ amount: '4000000', url: listingUrl, quote: 'Motstridende pris' }]
    state = sessionReducer(state, { type: 'listing-response', correlation, ok: true, body: { kind: 'listing', correlation, listing } })
    expect(state.financial.P.rawValue).toBe('')
    expect(state.listing.status).toBe(status === 'conflict' ? 'ready' : 'failed')
  })
  it('ny annonse nullstiller gamle tall og rapport; gamle svar kan ikke tas i bruk', () => {
    let state = imported()
    state = sessionReducer(state, { type: 'register-value', field: 'P', rawValue: '99' })
    state = { ...state, report: { ...state.report, status: 'completed', generation: 2 } }
    state = sessionReducer(state, { type: 'listing-url', url: listingUrl.replace('476576649', '123') })
    expect(state.financial.P.rawValue).toBe('')
    expect(state.report).toMatchObject({ generation: 3, status: 'missing', selected: null })
    const before = state
    expect(sessionReducer(state, { type: 'listing-response', correlation, ok: true, body: { kind: 'listing', correlation, listing: listingFixture() } })).toBe(before)
  })
  it('samme objekt via tracking/legacy beholder utkast, tall og rapport; navigasjon bevarer utkast', () => {
    let state = imported()
    state = sessionReducer(state, { type: 'register-value', field: 'P', rawValue: '99' })
    const before = state
    state = sessionReducer(state, { type: 'listing-url', url: 'https://finn.no/realestate/homes/ad.html?finnkode=476576649&utm_source=test' })
    expect(state.financial).toBe(before.financial)
    expect(state.report).toBe(before.report)
    expect(state.listing.draft).toBe(before.listing.draft)
    expect(sessionReducer(state, { type: 'navigate', step: 'tallgrunnlag' }).listing.draft).toBe(state.listing.draft)
  })
  it('korrelasjon, feil identitet og transportfeil gir trygg manuell reserveflyt', () => {
    for (const bad of ['correlation', 'identity', 'transport']) {
      let state: SessionState = sessionReducer(createInitialSession(), { type: 'listing-url', url: listingUrl })
      state = sessionReducer(state, { type: 'listing-start', correlation })
      const listing = listingFixture()
      if (bad === 'identity') listing.listingCode = '123'
      state = sessionReducer(state, { type: 'listing-response', correlation, ok: bad !== 'transport', body: { kind: 'listing', correlation: bad === 'correlation' ? { ...correlation, requestId: 'other' } : correlation, listing } })
      expect(state.listing).toMatchObject({ status: 'failed', draft: null, error: expect.stringContaining('manuelt') })
    }
  })
})


it('FINN-2: import and controlled apply preserve manual P, blank values, periods and sources', () => {
  let state = sessionReducer(createInitialSession(), { type: 'listing-url', url: listingUrl })
  state = sessionReducer(state, { type: 'register-value', field: 'P', rawValue: '1234567' })
  state = sessionReducer(state, { type: 'register-source', field: 'P', source: { kind: 'source', description: 'Manual evidence', conflict: null } })
  state = sessionReducer(state, { type: 'register-period', field: 'D', period: 'month' })
  state = sessionReducer(state, { type: 'register-year', field: 'D', year: '2025' })
  state = sessionReducer(state, { type: 'register-source', field: 'J', source: { kind: 'assumption', description: 'Manual interest', conflict: null } })
  const before = state
  state = sessionReducer(state, { type: 'listing-start', correlation })
  state = sessionReducer(state, { type: 'listing-response', correlation, ok: true, body: { kind: 'listing', correlation, listing: listingFixture() } })
  expect(state.financial).toEqual(before.financial)
  expect(state.sources).toEqual(before.sources)
  state = { ...state, listing: { ...state.listing, draft: completeDraft(), financing: { equity: '1075000', annualInterest: '0', months: '240', year: '2026' } } }
  state = sessionReducer(state, { type: 'listing-apply' })
  expect(state.financial).toEqual(before.financial)
  expect(state.sources).toEqual(before.sources)
})

it.each(['disabled', 'configuration', 'busy', 'already-attempted'])('FINN-2: specific safe %s status retains manual fallback', code => {
  let state = sessionReducer(createInitialSession(), { type: 'listing-url', url: listingUrl })
  state = sessionReducer(state, { type: 'listing-start', correlation })
  state = sessionReducer(state, { type: 'listing-response', correlation, ok: false, body: { kind: 'rejected', code } })
  expect(state.listing.status).toBe('failed')
  expect(state.listing.error).not.toContain('utilgjengelig')
  expect(state.financial.P.rawValue).toBe('')
})
