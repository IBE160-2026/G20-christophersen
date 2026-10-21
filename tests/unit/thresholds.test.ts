import { describe, expect, it } from 'vitest'
import Big from 'big.js'
import type { FinancialBasis } from '../../src/contracts/financial-basis.ts'
import type { FinancialField } from '../../src/contracts/financial-input.ts'
import { CashFlowThresholdSchema, NetYieldThresholdSchema } from '../../src/contracts/thresholds.ts'
import { evaluateCashFlowThreshold, evaluateNetYieldThreshold } from '../../src/domain/thresholds.ts'
import { calculateFinancialMetrics } from '../../src/domain/finance.ts'
import { validateFinancialBasis } from '../../src/domain/financial-basis.ts'

// Uavhengig PRD-addendum-fasit: ingen produksjonsberegning/formatter lager forventningene.
function basis(): FinancialBasis {
  return {
    values: {
      P: { rawValue: '16000000', confirmed: true },
      L: { rawValue: '1900000', confirmed: true, period: 'year', year: '2026' },
      D: { rawValue: '400000', confirmed: true, period: 'year', year: '2026' },
      J: { rawValue: '800000', confirmed: true, period: 'year', year: '2026' },
      Ymin: { rawValue: '7', confirmed: true },
    },
    sources: {
      P: { kind: 'source', description: 'Totalpris med fellesgjeld', conflict: null },
      L: { kind: 'assumption', description: 'Egen forventet årsleie', rentNature: 'expected', conflict: null },
      D: { kind: 'source', description: 'Eierbetalt drift', conflict: null },
      J: { kind: 'source', description: 'Renter og avdrag med fellesgjeld', conflict: null },
      Ymin: { kind: 'assumption', description: 'Eget avkastningskrav i prosent', conflict: null },
    },
    costItems: [],
  }
}

function evaluate(input: FinancialBasis) {
  const result = { yield: evaluateNetYieldThreshold(input), cash: evaluateCashFlowThreshold(input) }
  expect(NetYieldThresholdSchema.parse(result.yield)).toEqual(result.yield)
  expect(CashFlowThresholdSchema.parse(result.cash)).toEqual(result.cash)
  return result
}
function expectStatuses(input: FinancialBasis, yieldStatus: string, cashStatus: string) {
  const result = evaluate(input)
  expect(result.yield.decision.status).toBe(yieldStatus)
  expect(result.cash.decision.status).toBe(cashStatus)
  return result
}
const affected: Record<FinancialField, readonly ('yield' | 'cash')[]> = {
  P: ['yield'], L: ['yield', 'cash'], D: ['yield', 'cash'], J: ['cash'], Ymin: ['yield'],
}
function expectInsufficient(input: FinancialBasis, field: FinancialField, code: string) {
  const result = evaluate(input)
  const original = evaluate(basis())
  for (const name of ['yield', 'cash'] as const) {
    if (affected[field].includes(name)) {
      expect(result[name].decision.status, name).toBe('unavailable')
      expect(result[name].decision.comparison, name).toBeNull()
      expect(result[name].decision.issues, name).toContainEqual(expect.objectContaining({
        field, code, message: expect.any(String), action: expect.any(String),
      }))
    } else {
      expect(result[name], name).toEqual(original[name])
    }
  }
  return result
}
function freezeDeep<T>(value: T): T {
  if (value && typeof value === 'object') { Object.values(value).forEach(freezeDeep); Object.freeze(value) }
  return value
}

describe('Story 3.2 AC1/2 — eksakt kryssmultiplikasjon uten visnings- eller S1-margin', () => {
  it('F1 består med 150000000 >= 112000000 og 700000 >= 0', () => {
    const result = expectStatuses(basis(), 'passed', 'passed')
    expect(result.yield.decision.comparison).toEqual({ left: '150000000', operator: '>=', right: '112000000' })
    expect(result.cash.decision.comparison).toEqual({ left: '700000', operator: '>=', right: '0' })
    expect(result.yield.decision.issues).toEqual([])
    expect(result.cash.decision.issues).toEqual([])
  })
  it('BT-8/AT-10: nøyaktig 7 prosent består; én krone under bryter', () => {
    const input = basis(); input.values.L.rawValue = '1520000'
    const equal = expectStatuses(input, 'passed', 'passed')
    expect(equal.yield.decision.comparison).toEqual({ left: '112000000', operator: '>=', right: '112000000' })
    input.values.L.rawValue = '1519999'
    const below = expectStatuses(input, 'breached', 'passed')
    expect(below.yield.decision.comparison).toEqual({ left: '111999900', operator: '>=', right: '112000000' })
  })
  it.each([
    ['1519999.999999999999999999999999999', 'breached', '111999999.9999999999999999999999999'],
    ['1520000.000000000000000000000000001', 'passed', '112000000.0000000000000000000000001'],
  ])('lite faktisk yieldbrudd/overskudd for L=%s beholdes', (rent, status, left) => {
    const input = basis(); input.values.L.rawValue = rent
    expect(expectStatuses(input, status, 'passed').yield.decision.comparison)
      .toEqual({ left, operator: '>=', right: '112000000' })
  })
  it('desimal-P og desimal-Ymin har eksakt likhet og brudd uten desimaldivisjon', () => {
    const input = basis()
    input.values.P.rawValue = '3.3'; input.values.D.rawValue = '0'
    input.values.L.rawValue = '0.0033'; input.values.J.rawValue = '0'
    input.values.Ymin.rawValue = '0.1'
    expect(expectStatuses(input, 'passed', 'passed').yield.decision.comparison)
      .toEqual({ left: '0.33', operator: '>=', right: '0.33' })
    input.values.Ymin.rawValue = '0.100000000000000000000000001'
    expect(expectStatuses(input, 'breached', 'passed').yield.decision.comparison)
      .toEqual({ left: '0.33', operator: '>=', right: '0.3300000000000000000000000033' })
  })
  it('store heltall som ikke kan representeres eksakt som Number avgjør énkronebrudd', () => {
    const input = basis()
    input.values.P.rawValue = '9007199254740993'; input.values.Ymin.rawValue = '100'
    input.values.D.rawValue = '0'; input.values.J.rawValue = '0'
    input.values.L.rawValue = '9007199254740993'
    expect(expectStatuses(input, 'passed', 'passed').yield.decision.comparison)
      .toEqual({ left: '900719925474099300', operator: '>=', right: '900719925474099300' })
    input.values.L.rawValue = '9007199254740992'
    expect(expectStatuses(input, 'breached', 'passed').yield.decision.comparison)
      .toEqual({ left: '900719925474099200', operator: '>=', right: '900719925474099300' })
  })
  it('AT-2: F2-yield bryter selv om kontantstrøm er positiv', () => {
    const input = basis(); input.values.L.rawValue = '1400000'
    const result = expectStatuses(input, 'breached', 'passed')
    expect(result.yield.decision.comparison).toEqual({ left: '100000000', operator: '>=', right: '112000000' })
    expect(result.cash.decision.comparison).toEqual({ left: '200000', operator: '>=', right: '0' })
  })
  it('AT-14: brukerkrav 10 prosent brukes uten skjult standard', () => {
    const input = basis(); input.values.Ymin.rawValue = '10'
    expect(expectStatuses(input, 'breached', 'passed').yield.decision.comparison)
      .toEqual({ left: '150000000', operator: '>=', right: '160000000' })
  })
  it('bare Ymin-endring påvirker yieldavgjørelsen, aldri de fire nøkkeltallene', () => {
    const input = basis(); const original = calculateFinancialMetrics(input)
    input.values.Ymin.rawValue = '10'
    expectStatuses(input, 'breached', 'passed')
    expect(calculateFinancialMetrics(input)).toEqual(original)
  })
  it('bekreftet Ymin=0 består for null/positiv NOI og bryter for negativ NOI', () => {
    const input = basis(); input.values.Ymin.rawValue = '0'; input.values.J.rawValue = '0'
    expectStatuses(input, 'passed', 'passed')
    input.values.L.rawValue = '400000'
    expect(expectStatuses(input, 'passed', 'passed').yield.decision.comparison)
      .toEqual({ left: '0', operator: '>=', right: '0' })
    input.values.L.rawValue = '399999.999999999999999999999999999'
    expectStatuses(input, 'breached', 'breached')
  })
})

describe('Story 3.2 AC3 — nullgrense og samtidige uavhengige brudd', () => {
  it.each([
    ['1500000', 'passed', '0'], ['1500001', 'breached', '-1'],
    ['1500000.000000000000000000000000001', 'breached', '-0.000000000000000000000000001'],
    ['1499999.999999999999999999999999999', 'passed', '0.000000000000000000000000001'],
  ])('BT-9/AT-3/AT-11: J=%s gir cash %s uten avrunding', (debt, status, cash) => {
    const input = basis(); input.values.J.rawValue = debt
    expect(expectStatuses(input, 'passed', status).cash.decision.comparison)
      .toEqual({ left: cash, operator: '>=', right: '0' })
  })
  it('AT-4: både yieldbrudd og negativ kontantstrøm bevares', () => {
    const input = basis(); input.values.L.rawValue = '1400000'; input.values.J.rawValue = '1000001'
    const result = expectStatuses(input, 'breached', 'breached')
    expect(result.yield.decision.comparison).toEqual({ left: '100000000', operator: '>=', right: '112000000' })
    expect(result.cash.decision.comparison).toEqual({ left: '-1', operator: '>=', right: '0' })
  })
  it('AT-15: eksplisitt bekreftet J=0 er gyldig, ikke manglende gjeld', () => {
    const input = basis(); input.values.J.rawValue = '0'
    expect(expectStatuses(input, 'passed', 'passed').cash.decision.comparison)
      .toEqual({ left: '1500000', operator: '>=', right: '0' })
  })
  it('månedsinput normaliseres én gang; års-/månedblanding med samme år er gyldig', () => {
    const input = basis()
    input.values.L = { rawValue: '100000', confirmed: true, period: 'month', year: '2026' }
    input.values.D = { rawValue: '20000', confirmed: true, period: 'month', year: '2026' }
    input.values.J.rawValue = '960000'; input.values.Ymin.rawValue = '6'
    const result = expectStatuses(input, 'passed', 'passed')
    expect(result.yield.decision.comparison).toEqual({ left: '96000000', operator: '>=', right: '96000000' })
    expect(result.cash.decision.comparison).toEqual({ left: '0', operator: '>=', right: '0' })
    expect(result.yield.basis.metric.basis.inputs[1]?.normalization)
      .toEqual({ annualValue: '1200000', factor: '12', year: '2026' })
  })
  it('presis månedsnormalisering bevarer et cashbrudd utover 20 desimaler', () => {
    const input = basis(); input.values.L = { rawValue: '0.333333333333333333333333333', confirmed: true, period: 'month', year: '2026' }
    input.values.D.rawValue = '4'; input.values.J.rawValue = '0'; input.values.Ymin.rawValue = '0'
    const result = expectStatuses(input, 'breached', 'breached')
    expect(result.cash.decision.comparison).toEqual({ left: '-0.000000000000000000000000004', operator: '>=', right: '0' })
    expect(result.yield.decision.comparison).toEqual({ left: '-0.0000000000000000000000004', operator: '>=', right: '0' })
  })
})

describe('Story 3.2 AC4 — relevante feltårsaker og isolasjon uten gjetting', () => {
  for (const field of ['P', 'L', 'D', 'J', 'Ymin'] as const) {
    it.each([
      ['', 'missing-value'], ['ikke tall', 'not-numeric'], ['-1', field === 'P' ? 'must-be-positive' : 'must-be-nonnegative'],
    ])(`${field}=%s gir konkret %s bare ved berørt terskel`, (rawValue, code) => {
      const input = basis(); input.values[field].rawValue = rawValue
      expectInsufficient(input, field, code)
    })
    it(`${field} ubekreftet brukes ikke`, () => {
      const input = basis(); input.values[field].confirmed = false
      expectInsufficient(input, field, 'unconfirmed-value')
    })
    it(`${field} med kildekonflikt brukes ikke`, () => {
      const input = basis(); input.sources[field].conflict = { rawValue: '123', description: 'Annen kildeverdi' }
      expectInsufficient(input, field, 'source-conflict')
    })
    it(`${field} uten kilde brukes ikke`, () => {
      const input = basis(); input.sources[field].description = '  '
      expectInsufficient(input, field, 'missing-source')
    })
  }
  it('BT-5: blank J blir ikke null, yield består uendret', () => {
    const input = basis(); input.values.J.rawValue = ''
    expectInsufficient(input, 'J', 'missing-value')
  })
  it('BT-6: P=0 gir ikke-vurderbar yield og fortsatt gyldig cash', () => {
    const input = basis(); input.values.P.rawValue = '0'
    expectInsufficient(input, 'P', 'must-be-positive')
  })
  it('BT-18: blank Ymin gir ikke-vurderbar yield, ikke et standardkrav', () => {
    const input = basis(); input.values.Ymin.rawValue = ''
    const result = expectInsufficient(input, 'Ymin', 'missing-value')
    expect(result.yield.basis.minimumYield.decimal).toBeNull()
    expect(result.yield.basis.metric.status).toBe('available')
  })
  it.each(['L', 'D', 'J', 'Ymin'] as const)('ubekreftet %s=0 er utilstrekkelig', (field) => {
    const input = basis(); input.values[field].rawValue = '0'; input.values[field].confirmed = false
    expectInsufficient(input, field, 'unconfirmed-zero')
  })
  it.each(['L', 'D', 'J'] as const)('%s med ukjent periode/blankt år gir alle relevante årsaker', (field) => {
    const input = basis(); input.values[field].period = 'unknown'; input.values[field].year = ''
    const result = expectInsufficient(input, field, 'unknown-period')
    for (const name of affected[field]) {
      expect(result[name].decision.issues).toContainEqual(expect.objectContaining({ field, code: 'missing-year' }))
    }
  })
  it('J i annet år rammer cash, mens yield beholder hele uendrede grunnlaget', () => {
    const input = basis(); input.values.J.year = '2027'
    const result = expectInsufficient(input, 'J', 'different-years')
    expect(result.cash.decision.issues.filter(({ code }) => code === 'different-years').map(({ field }) => field))
      .toEqual(['L', 'D', 'J'])
  })
  it('ulike L/D-år rammer begge terskler med konkrete felles årsaker', () => {
    const input = basis(); input.values.D.year = '2025'
    expectInsufficient(input, 'D', 'different-years')
  })
  it('manglende leieart gjør begge terskler ikke-vurderbare', () => {
    const input = basis(); input.sources.L.rentNature = ''
    expectInsufficient(input, 'L', 'missing-rent-nature')
  })
  it('ukontrollerbart kostnadsinnhold rammer D/J, uten automatisk ekstra fratrekk', () => {
    const input = basis()
    input.costItems = [{ id: 'ukjent', label: 'Felleskostnad', rawAmount: '100', rawDebt: '', includedIn: null }]
    const result = evaluate(input)
    for (const name of ['yield', 'cash'] as const) {
      expect(result[name].decision.status).toBe('unavailable')
      expect(result[name].decision.issues).toContainEqual(expect.objectContaining({ field: 'D', code: 'invalid-cost' }))
    }
    input.costItems[0]!.rawDebt = '0'
    expectStatuses(input, 'passed', 'passed')
  })
  it('gyldig oppdelt/inkludert kostnad trekkes ikke fra en ekstra gang', () => {
    const input = basis()
    input.costItems = [
      { id: 'felles', label: 'Felleskostnad', rawAmount: '120000', rawDebt: '20000', includedIn: null },
      { id: 'avgift', label: 'Avgift', rawAmount: '30000', rawDebt: '0', includedIn: 'felles' },
    ]
    const result = expectStatuses(input, 'passed', 'passed')
    expect(result.yield.decision.comparison).toEqual({ left: '150000000', operator: '>=', right: '112000000' })
    expect(result.cash.decision.comparison).toEqual({ left: '700000', operator: '>=', right: '0' })
    expect(result.yield.basis.metric.basis.costBreakdown).toMatchObject({ annualD: '100000', annualJ: '20000' })
  })
  it('samler P/Ymin-feil uten å skjule gyldig cash, og J-feil uten å skjule yieldbrudd', () => {
    const input = basis(); input.values.P.rawValue = '0'; input.values.Ymin.rawValue = ''
    input.sources.P.conflict = { rawValue: '1', description: 'Uavklart pris' }
    let result = expectStatuses(input, 'unavailable', 'passed')
    expect(result.yield.decision.issues.map(({ field, code }) => [field, code]))
      .toEqual([['P', 'must-be-positive'], ['P', 'source-conflict'], ['Ymin', 'missing-value']])
    input.values.P.rawValue = '16000000'; input.sources.P.conflict = null; input.values.Ymin.rawValue = '7'
    input.values.L.rawValue = '1400000'; input.values.J.rawValue = ''; input.values.J.period = 'unknown'
    result = expectStatuses(input, 'breached', 'unavailable')
    expect(result.cash.decision.issues.map(({ field, code }) => [field, code]))
      .toEqual([['J', 'missing-value'], ['J', 'unknown-period']])
    // Tilgjengelig økonomi erstatter aldri felles mangelvurdering eller prioritet 1.
    expect(validateFinancialBasis(input).issues).toContainEqual(expect.objectContaining({ field: 'J', code: 'missing-value' }))
    expect(Object.keys(result)).toEqual(['yield', 'cash'])
  })
})

describe('kontrollgrunnlag, renhet og kontraktgrense', () => {
  it('bevarer registrert Ymin/kilde, eksakt prosent og metrikkens årsgrunnlag', () => {
    const input = basis(); input.values.Ymin.rawValue = '7,0000'
    const result = evaluate(input)
    expect(result.yield.basis.minimumYield).toEqual({
      registered: { rawValue: '7,0000', confirmed: true }, source: input.sources.Ymin, decimal: '7', unit: 'percent',
    })
    expect(result.yield.basis.formula).toBe('100 * NOI >= P * Ymin')
    expect(result.cash.basis.formula).toBe('L−D−J >= 0')
    expect(result.yield.basis.metric.basis.inputs.map(({ field }) => field)).toEqual(['P', 'L', 'D'])
    expect(result.cash.basis.metric.basis.inputs.map(({ field }) => field)).toEqual(['L', 'D', 'J'])
    expect(result.yield.basis.metric.basis.year).toBe('2026')
  })
  it('frosset input muteres ikke og gjentatt kjøring er identisk uten rapport/format/KI', () => {
    const input = freezeDeep(basis()); const snapshot = structuredClone(input)
    const first = evaluate(input); const second = evaluate(input)
    expect(second).toEqual(first); expect(input).toEqual(snapshot)
    first.yield.basis.minimumYield.source.description = 'Endret resultatkopi'
    expect(input.sources.Ymin.description).toBe('Eget avkastningskrav i prosent')
    expect(second.yield.basis.minimumYield.source.description).toBe('Eget avkastningskrav i prosent')
    expect(Object.keys(first.yield)).toEqual(['decision', 'basis'])
    expect(Object.keys(first.cash)).toEqual(['decision', 'basis'])
  })
  it('runtime-null er en kontraktfeil og blir aldri skjult null', () => {
    const input = basis(); Object.assign(input.values.Ymin, { rawValue: null })
    expect(() => evaluateNetYieldThreshold(input)).toThrow()
    expect(() => evaluateCashFlowThreshold(input)).toThrow()
  })
})

describe('uavhengig review — årsaker, isolasjon og bibliotekskonfigurasjon', () => {
  it.each([
    ['D', '400001', '0', ['D']],
    ['J', '800001', '800001', ['J']],
  ] as const)('%s-kostnad over totalen gir bare relevante årsaker', (field, amount, debt, issueFields) => {
    const input = basis()
    input.costItems = [{ id: 'over', label: 'Oppgitt kostnadsdel', rawAmount: amount, rawDebt: debt, includedIn: null }]
    const result = evaluate(input)
    expect(result.cash.decision.status).toBe('unavailable')
    expect(result.cash.decision.comparison).toBeNull()
    expect(result.cash.decision.issues.map(({ field, code }) => [field, code]))
      .toEqual(issueFields.map((field) => [field, 'cost-exceeds-total']))
    expect(result.cash.decision.issues[0]).toMatchObject({ target: 'cost', action: expect.stringContaining(field) })
    if (field === 'D') {
      expect(result.yield.decision.status).toBe('unavailable')
      expect(result.yield.decision.comparison).toBeNull()
      expect(result.yield.decision.issues.map(({ field, code }) => [field, code]))
        .toEqual([['D', 'cost-exceeds-total']])
    } else {
      expect(result.yield.decision).toEqual({
        status: 'passed', comparison: { left: '150000000', operator: '>=', right: '112000000' }, issues: [],
      })
    }
  })
  it.each(['cycle', 'missing-parent', 'duplicate-id'] as const)('ugyldig inkludering %s gjør begge terskler ikke-vurderbare', (problem) => {
    const input = basis()
    input.costItems = [
      { id: 'a', label: 'Felleskostnad', rawAmount: '100', rawDebt: '0', includedIn: null },
      { id: 'b', label: 'Avgift', rawAmount: '100', rawDebt: '0', includedIn: 'a' },
    ]
    if (problem === 'cycle') input.costItems[0]!.includedIn = 'b'
    if (problem === 'missing-parent') input.costItems[1]!.includedIn = 'mangler'
    if (problem === 'duplicate-id') input.costItems[1]!.id = 'a'
    const result = evaluate(input)
    for (const name of ['yield', 'cash'] as const) {
      expect(result[name].decision.status).toBe('unavailable')
      expect(result[name].decision.comparison).toBeNull()
      expect(result[name].decision.issues).toContainEqual(expect.objectContaining({
        field: 'D', target: 'cost', code: 'invalid-cost-inclusion', action: expect.any(String),
      }))
    }
    expect(result.cash.decision.issues).toContainEqual(expect.objectContaining({
      field: 'J', target: 'cost', code: 'invalid-cost-inclusion', action: expect.any(String),
    }))
  })
  for (const field of ['L', 'D', 'J'] as const) {
    it.each([
      ['period', '', 'missing-period'], ['period', 'week', 'unsupported-period'],
      ['year', '2026.5', 'invalid-year'],
    ] as const)(`${field} %s=%s forplanter %s uten å skjule annen gyldig terskel`, (key, value, code) => {
      const input = basis(); input.values[field][key] = value
      expectInsufficient(input, field, code)
    })
  }
  it('faktisk leie uten kildegrunnlag gjør begge terskler ikke-vurderbare', () => {
    const input = basis(); input.sources.L.rentNature = 'actual'
    // Beskrivelsen finnes, men er uttrykkelig en egen forutsetning, ikke en kilde.
    expectInsufficient(input, 'L', 'unsupported-actual-rent')
  })
  it('global big.js-konfigurasjon påvirker verken presist yieldbrudd eller cashfortegn', () => {
    const saved = { DP: Big.DP, RM: Big.RM, NE: Big.NE, PE: Big.PE, strict: Big.strict }
    const input = basis()
    input.values.L.rawValue = '1519999.999999999999999999999999999'
    input.values.J.rawValue = '1119999.9999999999999999999999999991'
    try {
      Big.DP = 0; Big.RM = 0; Big.NE = -1; Big.PE = 1; Big.strict = false
      const result = expectStatuses(input, 'breached', 'breached')
      expect(result.yield.decision.comparison).toEqual({
        left: '111999999.9999999999999999999999999', operator: '>=', right: '112000000',
      })
      expect(result.cash.decision.comparison).toEqual({
        left: '-0.0000000000000000000000000001', operator: '>=', right: '0',
      })
    } finally {
      Object.assign(Big, saved)
    }
  })
})
