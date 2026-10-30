import { describe, expect, it } from 'vitest'
import { selectProperty } from '../../src/frontend/investment/property.ts'
import { createInitialSession } from '../../src/frontend/state/session.ts'
import { importFixture } from '../helpers/import-fixture.ts'

describe('Eiendomsidentitet i konsept A', () => {
  it('starter uten eksempeladresse, bilde eller pris', () => {
    const property = selectProperty(createInitialSession())
    expect(property.address).toBeNull(); expect(property.price).toBeNull(); expect(property.selected).toBeNull()
    expect(property.title).toBe('Se eiendommens potensial.')
  })
  it('bruker bare én unik adresse, gjeldende hash og tilgjengelig dokumentpris', async () => {
    const { selected, outcome } = await importFixture()
    const state = createInitialSession()
    const source = outcome.economy.fields.find(field => field.sources.length)!.sources[0]!
    state.prospectus.prospectus = { status: 'imported', selected, outcome: { ...outcome, propertyIdentity: [{ kind: 'address', value: 'Syntetisk adresse 1', source }] }, active: null, error: null }
    expect(selectProperty(state)).toMatchObject({ address: 'Syntetisk adresse 1', price: '3000000', selected })
    state.prospectus.prospectus.outcome!.economy.fields.find(field => field.id === 'price')!.nature = 'stated-estimate'
    expect(selectProperty(state).priceOrigin).toBe('Dokumentets estimat')
    state.prospectus.prospectus.outcome!.propertyIdentity.push({ kind: 'address', value: 'Syntetisk adresse 2', source })
    expect(selectProperty(state).address).toBeNull()
    expect(selectProperty(state).title).toContain('må avklares')
    state.prospectus.prospectus.outcome!.reportHash = '0'.repeat(64)
    expect(selectProperty(state)).toMatchObject({ outcome: null, selected: null, address: null, price: null })
  })
  it('nytt filvalg viser ingen gammel identitet eller bilde mens kontrollen pågår', async () => {
    const { selected, outcome } = await importFixture()
    const state = createInitialSession()
    state.prospectus.prospectus = { status: 'selecting', selected, outcome, active: null, error: null }
    expect(selectProperty(state)).toMatchObject({ outcome: null, selected: null, price: null })
  })
})
