import { describe, expect, it } from 'vitest'
import { FinancialBasisValidationSchema } from '../../src/contracts/financial-basis.ts'
import type { CostItem, FinancialBasis } from '../../src/contracts/financial-basis.ts'
import { validateFinancialBasis } from '../../src/domain/financial-basis.ts'
import { createInitialSession, sessionReducer } from '../../src/frontend/state/session.ts'

function basis(): FinancialBasis {
  const initial = createInitialSession()
  return {
    values: {
      P: { rawValue: '16000000', confirmed: true },
      L: { rawValue: '1900000', confirmed: true, period: 'year', year: '2026' },
      D: { rawValue: '400000', confirmed: true, period: 'year', year: '2026' },
      J: { rawValue: '800000', confirmed: true, period: 'year', year: '2026' },
      Ymin: { rawValue: '7', confirmed: true },
    },
    sources: {
      P: { ...initial.sources.P, kind: 'source', description: 'Oppgitt totalpris' },
      L: { ...initial.sources.L, kind: 'assumption', description: 'Eget leieanslag', rentNature: 'expected' },
      D: { ...initial.sources.D, kind: 'source', description: 'Eierens kostnadsoversikt' },
      J: { ...initial.sources.J, kind: 'assumption', description: 'Egne renter og avdrag' },
      Ymin: { ...initial.sources.Ymin, kind: 'assumption', description: 'Eget avkastningskrav' },
    },
    costItems: [],
  }
}
function cost(id: string, label: string, rawAmount: string, rawDebt: string, includedIn: string | null = null): CostItem {
  return { id, label, rawAmount, rawDebt, includedIn }
}
function freezeDeep<T>(value: T): T {
  if (value && typeof value === 'object') { Object.values(value).forEach(freezeDeep); Object.freeze(value) }
  return value
}

describe('Story 1.5 — opphav og kontrollerbart kostnadsinnhold', () => {
  it('AC1/AC5: alle fem kilder er del av samme validerte finansgrunnlag', () => {
    const input = basis()
    const result = validateFinancialBasis(freezeDeep(input))
    expect(FinancialBasisValidationSchema.safeParse(result).success).toBe(true)
    expect(result.registeredBasis).toEqual(input)
    for (const field of ['P', 'L', 'D', 'J', 'Ymin'] as const) expect(result.fields[field].status).toBe('sufficient')
    expect(result.issues).toEqual([])
    expect(result.costBreakdown).toEqual({ items: [], D: null, J: null, annualD: null, annualJ: null })
  })
  it.each(['P', 'L', 'D', 'J', 'Ymin'] as const)('AC1: manglende opphav for %s er utilstrekkelig, uten nytt tall', (field) => {
    const input = basis()
    input.sources[field].description = '  '
    const result = validateFinancialBasis(input)
    expect(result.fields[field].status).toBe('insufficient')
    expect(result.fields[field].issues.map((entry) => entry.code)).toContain('missing-source')
    expect(result.fields[field].registered).toEqual(input.values[field])
  })
  it('AC1: forventet leie bevares som forutsetning; faktisk leie krever oppgitt kilde', () => {
    const input = basis()
    expect(validateFinancialBasis(input).registeredBasis.sources.L).toEqual(input.sources.L)
    input.sources.L.rentNature = 'actual'
    expect(validateFinancialBasis(input).fields.L.issues.map((entry) => entry.code)).toEqual(['unsupported-actual-rent'])
    input.sources.L.kind = 'source'
    input.sources.L.description = 'Gjeldende leiekontrakt'
    expect(validateFinancialBasis(input).fields.L.status).toBe('sufficient')
    input.sources.L.rentNature = ''
    expect(validateFinancialBasis(input).fields.L.issues.map((entry) => entry.code)).toEqual(['missing-rent-nature'])
  })
  it('AC2/AC3 FR-2: 120000 deles eksakt i D100000/J20000; gjeldsbetjening telles ikke i D', () => {
    const input = basis()
    input.values.D.rawValue = '100000'
    input.values.J.rawValue = '20000'
    input.costItems = [cost('felles', 'Felleskostnader', '120000', '20000')]
    const result = validateFinancialBasis(freezeDeep(input))
    expect(result.costBreakdown).toEqual({
      items: [{ ...input.costItems[0], amount: '120000', D: '100000', J: '20000', status: 'counted' }],
      D: '100000', J: '20000', annualD: '100000', annualJ: '20000',
    })
    expect(result.issues).toEqual([])
    expect(result.fields.D.normalization?.annualValue).toBe('100000')
    expect(result.fields.J.normalization?.annualValue).toBe('20000')
  })
  it('AC2: kommunale avgifter i felleskostnader summeres ikke en gang til', () => {
    const input = basis()
    input.costItems = [cost('felles', 'Felleskostnader', '120000', '20000'), cost('avgift', 'Kommunale avgifter', '30000', '0', 'felles')]
    const result = validateFinancialBasis(input)
    expect(result.costBreakdown.D).toBe('100000')
    expect(result.costBreakdown.J).toBe('20000')
    expect(result.costBreakdown.items[1]).toMatchObject({ D: '30000', J: '0', includedIn: 'felles', status: 'included' })
    expect(result.issues).toEqual([])
  })
  it('AC3/AC5: andre kostnader og gjeldsposter bevares; delvis innhold krever ikke full detaljering', () => {
    const input = basis()
    input.costItems = [cost('felles', 'Felleskostnader', '120000', '20000'), cost('forsikring', 'Forsikring', '40000', '0'), cost('lan', 'Andre renter og avdrag', '700000', '700000')]
    const before = structuredClone(input)
    const result = validateFinancialBasis(freezeDeep(input))
    expect(result.costBreakdown.D).toBe('140000')
    expect(result.costBreakdown.J).toBe('720000')
    expect(result.fields.D.decimal).toBe('400000')
    expect(result.fields.J.decimal).toBe('800000')
    expect(result.issues).toEqual([])
    expect(input).toEqual(before)
  })
  it('AC2/AC3: månedlig innhold kontrolleres eksakt mot D/J med ulike kjente perioder', () => {
    const input = basis()
    input.values.D = { rawValue: '100000', confirmed: true, period: 'month', year: '2026' }
    input.values.J = { rawValue: '240000', confirmed: true, period: 'year', year: '2026' }
    input.costItems = [cost('felles', 'Felleskostnader', '120000', '20000')]
    const result = validateFinancialBasis(input)
    expect(result.costBreakdown.annualD).toBe('1200000')
    expect(result.costBreakdown.annualJ).toBe('240000')
    expect(result.issues).toEqual([])
  })
  it('AC2: kjent oppgitt bidrag over totalen gjør bare berørte totaler utilstrekkelige', () => {
    const input = basis()
    input.values.D.rawValue = '99999'
    input.values.J.rawValue = '19999'
    input.costItems = [cost('felles', 'Felleskostnader', '120000', '20000')]
    const result = validateFinancialBasis(input)
    expect(result.issues.map((entry) => [entry.field, entry.code])).toEqual([['D', 'cost-exceeds-total'], ['J', 'cost-exceeds-total']])
    expect(result.fields.P.status).toBe('sufficient')
    expect(result.registeredBasis.values).toEqual(input.values)
  })
  it.each([
    ['blank rentedel', '120000', ''], ['negativt beløp', '-1', '0'], ['negativ gjeld', '120000', '-1'],
    ['gjeld over samlet', '120000', '120001'], ['ugyldig beløp', 'ikke tall', '0'],
  ])('AC2: %s gjettes ikke som 0 eller gyldig kostnadsinnhold', (_name, amount, debt) => {
    const input = basis()
    input.costItems = [cost('felles', 'Felleskostnader', amount!, debt!)]
    const result = validateFinancialBasis(input)
    expect(result.costBreakdown.D).toBeNull()
    expect(result.costBreakdown.J).toBeNull()
    expect(result.fields.D.issues.map((entry) => entry.code)).toContain('invalid-cost')
    expect(result.fields.J.status).toBe('insufficient')
  })
  it('AC2: ukjent inkludering, sirkler og inkludering utover dekning blir synlig utilstrekkelig', () => {
    for (const costItems of [
      [cost('a', 'Avgift', '10', '0', 'finnes-ikke')],
      [cost('a', 'A', '10', '0', 'b'), cost('b', 'B', '10', '0', 'a')],
      [cost('a', 'A', '10', '0'), cost('b', 'B', '11', '0', 'a')],
      [cost('a', 'A', '10', '0'), cost('b', 'B', '10', '1', 'a')],
    ]) {
      const input = { ...basis(), costItems }
      const result = validateFinancialBasis(input)
      expect(result.fields.D.issues.map((entry) => entry.code)).toContain('invalid-cost-inclusion')
      expect(result.costBreakdown.D).toBeNull()
    }
  })
  it.each(['D', 'J'] as const)('AC2: flere inkluderte poster kan ikke overstige kjent %s-innhold i forelderen', (field) => {
    const input = basis()
    const debt = field === 'J' ? '100' : '0'
    const childDebt = field === 'J' ? '80' : '0'
    input.costItems = [cost('a', 'Samlepost', '100', debt), cost('b', 'Forsikring', '80', childDebt, 'a'), cost('c', 'Avgifter', '80', childDebt, 'a')]
    const result = validateFinancialBasis(input)
    expect(result.fields[field].status).toBe('insufficient')
    expect(result.issues.map((entry) => entry.code)).toContain('invalid-cost-inclusion')
    expect(result.costBreakdown.D).toBeNull()
    expect(result.registeredBasis.costItems).toEqual(input.costItems)
  })
  it('AC2: inkludert delinnhold trenger ikke fylle forelderen, og uttrykkelig overlapp telles ikke igjen', () => {
    const input = basis()
    input.costItems = [cost('a', 'Samlepost', '100', '0'), cost('b', 'Delinnhold', '80', '0', 'a'), cost('c', 'Samme delinnhold', '80', '0', 'b')]
    expect(validateFinancialBasis(input).issues).toEqual([])
    input.costItems[2]!.rawAmount = '30'
    input.costItems[2]!.includedIn = 'a'
    input.costItems[1]!.rawAmount = '40'
    const result = validateFinancialBasis(input)
    expect(result.issues).toEqual([])
    expect(result.costBreakdown.D).toBe('100')
  })
  it('AC2/AC5: ugyldig inkluderingskjede gir samme radstatus uavhengig av registreringsrekkefølge', () => {
    const items = [cost('child', 'Barn', '10', '0', 'parent'), cost('parent', 'Forelder', '100', '0', 'grand'), cost('grand', 'Samlepost', '50', '0')]
    for (const costItems of [items, [...items].reverse()]) {
      const result = validateFinancialBasis({ ...basis(), costItems })
      expect(Object.fromEntries(result.costBreakdown.items.map((item) => [item.id, item.status])))
        .toEqual({ child: 'invalid', parent: 'invalid', grand: 'invalid' })
      expect(result.costBreakdown.D).toBeNull()
      expect(result.fields.D.status).toBe('insufficient')
    }
  })
  it.each(['', 'ugyldig', '-1'])('AC2/AC5: kjent J-overskridelse beholdes når D-beløpet er %j', (rawValue) => {
    const input = basis()
    input.values.D.rawValue = rawValue
    input.values.J.rawValue = '1000'
    input.costItems = [cost('debt', 'Gjeld', '1001', '1001')]
    const result = validateFinancialBasis(freezeDeep(input))
    expect(result.costBreakdown.annualJ).toBe('1001')
    expect(result.fields.J.issues.map((entry) => entry.code)).toEqual(['cost-exceeds-total'])
    expect(result.fields.J.status).toBe('insufficient')
    expect(result.registeredBasis.values).toEqual(input.values)
  })
  it('AC2/AC5: en uferdig rad skjuler ikke kjent overskridelse fra en annen selvstendig post', () => {
    const input = basis()
    input.values.D.rawValue = '1000'
    input.values.J.rawValue = '1000'
    input.costItems = [cost('known', 'Kjent innhold', '2002', '1001'), cost('unfinished', 'Uferdig', '', '')]
    const result = validateFinancialBasis(input)
    expect(result.costBreakdown.D).toBeNull()
    expect(result.costBreakdown.annualJ).toBeNull()
    for (const field of ['D', 'J'] as const) {
      expect(result.fields[field].issues.map((entry) => entry.code)).toEqual(['invalid-cost', 'cost-exceeds-total'])
    }
    expect(result.registeredBasis).toEqual(input)
  })
  it('AC5/NFR-2: kostnadsfeil beholder radkontekst når to poster har samme navn', () => {
    const input = basis()
    input.costItems = [cost('a', 'Forsikring', '', ''), cost('b', 'Forsikring', '', '')]
    const result = validateFinancialBasis(input)
    expect(result.fields.D.issues.map((entry) => entry.message)).toEqual([
      'Kostnadspost 1 (Forsikring): Navn, beløp eller rentedel/avdrag er ugyldig eller mangler.',
      'Kostnadspost 2 (Forsikring): Navn, beløp eller rentedel/avdrag er ugyldig eller mangler.',
    ])
  })
  it('AC2/AC3: store og presise desimalbeløp splittes uten flyttall', () => {
    const input = basis()
    input.values.D.rawValue = '9007199254740993.000000000000000001'
    input.values.J.rawValue = '0.000000000000000002'
    input.costItems = [cost('eksakt', 'Eksakt oppgitt beløp', '9007199254740993.000000000000000003', '0.000000000000000002')]
    const result = validateFinancialBasis(input)
    expect(result.costBreakdown.D).toBe('9007199254740993.000000000000000001')
    expect(result.costBreakdown.J).toBe('0.000000000000000002')
    expect(result.issues).toEqual([])
  })
  it('AC4 BT-14/AT-12: uløste L-kilder bevares uten laveste/nyeste/foretrukket valg', () => {
    const input = basis()
    input.sources.L.conflict = { rawValue: '1400000', description: 'Annen oppgitt kilde' }
    const before = structuredClone(input)
    const result = validateFinancialBasis(freezeDeep(input))
    expect(result.fields.L.status).toBe('insufficient')
    expect(result.fields.L.issues.map((entry) => entry.code)).toEqual(['source-conflict'])
    expect(result.fields.L.decimal).toBe('1900000')
    expect(result.registeredBasis.sources.L.conflict).toEqual({ rawValue: '1400000', description: 'Annen oppgitt kilde' })
    expect(input).toEqual(before)
    expect(result.fields.D.status).toBe('sufficient')
  })
  it('AC4/AC5: retting erstatter ikke konflikten automatisk; eksplisitt avklaring gir nytt kontrollgrunnlag', () => {
    const input = basis()
    input.sources.L.conflict = { rawValue: '1400000', description: 'Leiekontrakt' }
    input.values.L.rawValue = '1400000'
    input.sources.L.description = 'Kontrollert leiekontrakt'
    expect(validateFinancialBasis(input).fields.L.status).toBe('insufficient')
    input.sources.L.conflict = null
    expect(validateFinancialBasis(input).fields.L.status).toBe('sufficient')
  })
  it('AC5/NFR-1: gjentatte kjøringer er identiske og resultatkopier kan ikke mutere input', () => {
    const input = basis()
    input.costItems = [cost('a', 'Felleskostnader', '120000', '20000')]
    input.sources.L.conflict = { rawValue: '1400000', description: 'Annen kilde' }
    const expected = validateFinancialBasis(freezeDeep(input))
    for (let count = 0; count < 4; count++) expect(validateFinancialBasis(input)).toEqual(expected)
    expected.registeredBasis.sources.P.description = 'Endret resultatkopi'
    expected.costBreakdown.items[0]!.label = 'Endret resultatkopi'
    expect(input.sources.P.description).toBe('Oppgitt totalpris')
    expect(input.costItems[0]!.label).toBe('Felleskostnader')
  })
})

describe('Story 1.5 — aktivt finansgrunnlag i reducer', () => {
  it('AC5: kilde, konflikt, leiegrunnlag og kostnadsretting bevares uten å endre andre tall', () => {
    let state = createInitialSession()
    state = sessionReducer(state, { type: 'register-value', field: 'D', rawValue: '400000' })
    const before = freezeDeep(state)
    state = sessionReducer(before, { type: 'register-source', field: 'L', source: {
      kind: 'assumption', description: 'Forventet leie', conflict: { rawValue: '1400000', description: 'Kontrakt' },
    } })
    state = sessionReducer(freezeDeep(state), { type: 'register-rent-nature', rentNature: 'expected' })
    state = sessionReducer(freezeDeep(state), { type: 'add-cost' })
    state = sessionReducer(freezeDeep(state), { type: 'change-cost', id: 'cost-1', update: { label: 'Felleskostnader', rawAmount: '120000', rawDebt: '20000' } })
    expect(before.sources.L.description).toBe('')
    expect(state.sources.L.conflict?.rawValue).toBe('1400000')
    expect(state.sources.L.rentNature).toBe('expected')
    expect(state.costItems).toEqual([cost('cost-1', 'Felleskostnader', '120000', '20000')])
    expect(state.financial).toEqual(before.financial)
    expect(state.financial.P).toBe(before.financial.P)
    const registered = freezeDeep(state)
    expect(sessionReducer(registered, { type: 'navigate', step: 'tallgrunnlag' })).toBe(registered)
    state = sessionReducer(registered, { type: 'register-value', field: 'L', rawValue: '1400000' })
    expect(state.sources).toBe(registered.sources)
    expect(state.costItems).toBe(registered.costItems)
    state = sessionReducer(freezeDeep(state), { type: 'remove-cost', id: 'cost-1' })
    expect(state.costItems).toEqual([])
    expect(state.financial.D.rawValue).toBe('400000')
    expect(createInitialSession().sources.L.description).toBe('')
  })
})
