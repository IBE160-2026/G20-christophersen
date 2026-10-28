import { describe, expect, it, vi } from 'vitest'
import { createListingDraft, listingSuggestions, validateListingImport, validateListingUrl } from '../../src/domain/listing.ts'
import { createListingAdapter } from '../../src/backend/listing/adapter.ts'
import { listingRequest } from '../../src/backend/listing/request.ts'
import { parseListingResponse } from '../../src/backend/listing/response.ts'
import { checkedDraft, listingFixture, listingUrl, responseFixture } from '../fixtures/listing/finn.ts'

describe('FINN-1 URL og kontrollert mapping', () => {
  it.each([listingUrl, 'https://finn.no/realestate/homes/ad.html?finnkode=476576649'])('godtar én eksakt annonseidentitet %s', url => expect(validateListingUrl(url)?.listingCode).toBe('476576649'))
  it.each(['http://www.finn.no/realestate/homes/ad/1', 'https://finn.no.evil.test/realestate/homes/ad/1', 'https://user@finn.no/realestate/homes/ad/1', 'https://finn.no:443/realestate/homes/ad/1', 'https://finn.no:8080/realestate/homes/ad/1', 'https://finn.no/car/used/ad/1', 'https://finn.no/realestate/homes/ad/1?finnkode=2', 'https://finn.no/realestate/homes/ad.html?finnkode=1&finnkode=2', 'https://finn.no/realestate/homes/ad/1#2'])('avviser URL før adapter %s', url => expect(validateListingUrl(url)).toBeNull())
  it('fasit P og kontantbehov; dokumentavgift telles én gang; ukjent fordeling blokkerer D/J', () => {
    const draft = checkedDraft()
    expect(listingSuggestions(draft)).toMatchObject({ P: '3200000', cashRequired: '3075000', D: null, sharedAnnualPayment: null })
    expect(listingSuggestions(createListingDraft(listingFixture())).P).toBeNull()
  })
  it('bevarer original/kilde og konflikt ved retting; ingen automatisk bekreftelse', () => {
    const draft = checkedDraft()
    draft.corrections.price = { ...draft.corrections.price!, rawAmount: '2900000', reviewed: false }
    expect(listingSuggestions(draft).P).toBeNull()
    expect(draft.original.fields[0]!.amount).toBe('3000000')
    expect(draft.original.fields[0]!.source?.quote).toContain('3000000')
    draft.corrections.price.reviewed = true
    expect(listingSuggestions(draft).P).toBeNull()
    draft.corrections.price.note = 'Rettet mot meglerbekreftelse'
    expect(listingSuggestions(draft).P).toBeNull() // totalpris må også avstemmes
  })
  it('blokkerer ukjent gjeld, sprik, ukjent inkludering og dobbelt inkludert innhold', () => {
    const draft = checkedDraft()
    delete draft.corrections.sharedDebt
    expect(listingSuggestions(draft).P).toBeNull()
    const unknown = checkedDraft()
    unknown.corrections.documentTax!.includedIn = null
    expect(listingSuggestions(unknown).cashRequired).toBeNull()
    const over = checkedDraft()
    over.original.fields.push({ ...over.original.fields.find(f => f.id === 'documentTax')!, id: 'extraTax' })
    over.corrections.extraTax = { ...over.corrections.documentTax! }
    expect(listingSuggestions(over).cashRequired).toBeNull()
  })
  it('kjente fordelinger/inkluderinger telles én gang i D og J; år må samsvare', () => {
    const draft = checkedDraft()
    draft.completeOperatingCosts = true
    for (const id of ['commonCosts', 'propertyTax', 'municipalFees', 'sharedDebtPayment']) {
      const field = draft.original.fields.find(f => f.id === id)!
      field.status = 'available'; field.amount = id === 'commonCosts' ? '5000' : id === 'sharedDebtPayment' ? '1000' : '200'
      field.source = { url: listingUrl, quote: 'Syntetisk kilde' }; field.debtPart = id === 'commonCosts' || id === 'sharedDebtPayment' ? '1000' : '0'
      field.includedIn = id === 'commonCosts' ? '' : 'commonCosts'
      draft.corrections[id] = { rawAmount: field.amount, period: 'month', year: '2026', rawDebtPart: field.debtPart, includedIn: field.includedIn, note: '', reviewed: true }
    }
    expect(listingSuggestions(draft)).toMatchObject({ D: '48000', sharedAnnualPayment: '12000', year: '2026' })
    draft.corrections.propertyTax!.year = '2025'; draft.corrections.propertyTax!.note = 'Endret år'
    expect(listingSuggestions(draft).D).toBeNull()
  })
})
describe('FINN-1 Responses-kildekontroll', () => {
  it('avgrenser faktisk verktøybudsjett til ett open_page-forsøk uten alternativ kanal', () => {
    const request = listingRequest(listingUrl, '476576649')
    expect(request).toMatchObject({ max_tool_calls: 1, tools: [{ type: 'web_search', external_web_access: true, search_context_size: 'low' }], tool_choice: 'required', store: false })
    expect(request.input).toContain('Første og eneste verktøyhandling skal være open_page')
    expect(request.input).toContain('Ved blokkert eller utilgjengelig side: stopp')
  })
  it('én forespørsel med strict schema, ingen retry; tidsstempler lokal mottakstid', async () => {
    const transport = vi.fn(async () => responseFixture())
    const adapter = createListingAdapter(transport, { now: () => new Date('2026-10-28T12:00:00Z') })
    expect(await adapter.import(listingUrl)).toEqual(listingFixture())
    expect(transport).toHaveBeenCalledTimes(1)
    expect(transport.mock.calls[0]).toMatchObject([{ text: { format: { strict: true } } }, { maxRetries: 0 }])
    await expect(adapter.import('https://finn.no:443/realestate/homes/ad/1')).rejects.toThrow()
    expect(transport).toHaveBeenCalledTimes(1)
  })
  it('frist avbryter uten retry selv om transport ignorerer signal', async () => {
    const transport = vi.fn(() => new Promise<unknown>(() => {}))
    await expect(createListingAdapter(transport, { timeoutMs: 5 }).import(listingUrl)).rejects.toThrow()
    expect(transport).toHaveBeenCalledTimes(1)
  })
  it.each(['search', 'find_in_page', 'other', 'missing-url', 'wrong-url', 'incomplete', 'double-open', 'search-then-open', 'open-then-find', 'other-tool'])('avviser feil handling/kilde: %s', mode => {
    const raw = responseFixture()
    const call = raw.output[0]!
    if (mode === 'missing-url') call.action!.url = ''
    else if (mode === 'wrong-url') call.action!.url = listingUrl.replace('476576649', '123')
    else if (mode === 'incomplete') call.status = 'in_progress'
    else if (mode === 'double-open') raw.output.unshift({ ...call })
    else if (mode === 'search-then-open') raw.output.unshift({ ...call, action: { type: 'search', url: listingUrl } })
    else if (mode === 'open-then-find') raw.output.push({ ...call, action: { type: 'find_in_page', url: listingUrl } })
    else if (mode === 'other-tool') raw.output.push({ ...call, type: 'function_call' })
    else call.action!.type = mode
    expect(() => parseListingResponse(raw, listingUrl, listingFixture().fetchedAt)).toThrow()
  })
  it('avviser feil identitet, feil feltkilde, ukjent struktur og overstor respons', () => {
    for (const mutate of [
      (listing: ReturnType<typeof listingFixture>) => { listing.listingCode = '123' },
      (listing: ReturnType<typeof listingFixture>) => { listing.fields[0]!.source!.url = listingUrl.replace('476576649', '123') },
      (listing: ReturnType<typeof listingFixture>) => { listing.fields[0]!.amount = '1e6' },
      (listing: ReturnType<typeof listingFixture>) => { listing.fields.pop() },
    ]) { const listing = listingFixture(); mutate(listing); expect(() => parseListingResponse(responseFixture(listing), listingUrl, listing.fetchedAt)).toThrow() }
    expect(() => parseListingResponse({ ...responseFixture(), huge: 'x'.repeat(120001) }, listingUrl, listingFixture().fetchedAt)).toThrow()
    expect(() => validateListingImport({ ...listingFixture(), extra: true })).toThrow()
  })
})
