import { describe, expect, it } from 'vitest'
import { createInitialSession, sessionReducer } from '../../src/frontend/state/session.ts'
import type { SessionState } from '../../src/frontend/state/session.ts'
import { checkedDraft, listingFixture, listingUrl } from '../fixtures/listing/finn.ts'
const correlation = { requestId: 'listing-test', generation: 1 }
function imported() {
  let state = sessionReducer(createInitialSession(), { type: 'listing-url', url: listingUrl })
  state = sessionReducer(state, { type: 'listing-start', correlation })
  return sessionReducer(state, { type: 'listing-response', correlation, ok: true, body: { kind: 'listing', correlation, listing: listingFixture() } })
}
describe('FINN-1 økt og atomisk bruk', () => {
  it('bevarer original, krever kontroll, og anvender bare ubekreftede forslag', () => {
    let state = imported()
    expect(state.listing.status).toBe('ready')
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
