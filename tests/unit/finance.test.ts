import { describe, expect, it } from 'vitest'
import type { FinancialBasis } from '../../src/contracts/financial-basis.ts'
import type { FinancialField } from '../../src/contracts/financial-input.ts'
import { FinancialMetricsSchema } from '../../src/contracts/finance.ts'
import type { FinancialMetric, FinancialMetrics } from '../../src/contracts/finance.ts'
import { calculateFinancialMetrics } from '../../src/domain/finance.ts'
import { validateFinancialBasis } from '../../src/domain/financial-basis.ts'
import { validateFinancialInput } from '../../src/domain/validation.ts'

// Uavhengig PRD-addendum BT-fasit. Ingen Big/Number/divisjon eller produksjons-
// beregning lager forventningene; prosentfasit representeres med eksakt L/P.
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
      P: { kind: 'source', description: 'Totalpris inklusive fellesgjeld', conflict: null },
      L: { kind: 'assumption', description: 'Eget forventet leieanslag', conflict: null, rentNature: 'expected' },
      D: { kind: 'source', description: 'Eierbetalt drift uten gjeld', conflict: null },
      J: { kind: 'source', description: 'Årlig rente og avdrag inklusive fellesgjeld', conflict: null },
      Ymin: { kind: 'assumption', description: 'Eget prosentkrav', conflict: null },
    },
    costItems: [],
  }
}
const metricNames = ['grossYield', 'noi', 'netYield', 'cashFlowBeforeTax'] as const
const fields = ['P', 'L', 'D', 'J', 'Ymin'] as const
// Testens avhengighetsmatrise er eksplisitt fra AC; ikke avledet fra koden.
const affectedBy: Record<FinancialField, readonly (keyof FinancialMetrics)[]> = {
  P: ['grossYield', 'netYield'], L: metricNames,
  D: ['noi', 'netYield', 'cashFlowBeforeTax'], J: ['cashFlowBeforeTax'], Ymin: [],
}
function assertValues(input: FinancialBasis, rent: string, noi: string, cash: string) {
  const result = calculateFinancialMetrics(input)
  expect(result.grossYield).toMatchObject({ status: 'available', value: { kind: 'ratio', numerator: rent, denominator: '16000000', unit: 'ratio' } })
  expect(result.noi).toMatchObject({ status: 'available', value: { kind: 'amount', amount: noi, unit: 'NOK/year' } })
  expect(result.netYield).toMatchObject({ status: 'available', value: { kind: 'ratio', numerator: noi, denominator: '16000000', unit: 'ratio' } })
  expect(result.cashFlowBeforeTax).toMatchObject({ status: 'available', value: { kind: 'amount', amount: cash, unit: 'NOK/year' } })
  expect(FinancialMetricsSchema.parse(result)).toEqual(result)
  return result
}
function assertAffected(input: FinancialBasis, field: FinancialField, code: string) {
  const result = calculateFinancialMetrics(input)
  const original = calculateFinancialMetrics(basis())
  for (const name of metricNames) {
    const metric = result[name]
    if (affectedBy[field].includes(name)) {
      expect(metric.status, name).toBe('unavailable')
      expect(metric.value, name).toBeNull()
      expect(metric.issues, name).toContainEqual(expect.objectContaining({ field, code }))
    } else {
      expect(metric, name).toEqual(original[name])
    }
  }
  expect(FinancialMetricsSchema.parse(result)).toEqual(result)
  return result
}
function freezeDeep<T>(value: T): T {
  if (value && typeof value === 'object') { Object.values(value).forEach(freezeDeep); Object.freeze(value) }
  return value
}

describe('Story 3.1 AC1/5 — uavhengig F1–F4/BT-fasit, negative tall og låste formler', () => {
  it('F1/BT-1: 11,875 %, 1500000, 9,375 % og 700000 med eksakt grunnlag', () => {
    const result = assertValues(basis(), '1900000', '1500000', '700000')
    expect(metricNames.map((name) => result[name].basis.formula)).toEqual(['L/P', 'L−D', '(L−D)/P', 'L−D−J'])
    expect(metricNames.map((name) => result[name].basis.inputs.map(({ field }) => field)))
      .toEqual([['P', 'L'], ['L', 'D'], ['P', 'L', 'D'], ['L', 'D', 'J']])
  })
  it('F2/BT-2: 8,75 %, 1000000, 6,25 % og 200000', () => {
    const input = basis(); input.values.L.rawValue = '1400000'
    assertValues(input, '1400000', '1000000', '200000')
  })
  it('F3/BT-3: manglende L gir ingen tall eller skjult null', () => {
    const input = basis(); input.values.L.rawValue = ''
    assertAffected(input, 'L', 'missing-value')
  })
  it('F4/BT-4/AC6: samme finansgrunnlag gir samme tall uavhengig av teknisk rapportstatus', () => {
    const contexts = [
      { mode: 'demo', report: 'completed', tg3: 'unknown' },
      { mode: 'live', report: 'failed', tg3: 'resolved' },
      { mode: 'live', report: 'missing', tg3: 'unresolved' },
    ]
    for (const context of contexts) {
      const session = { ...context, financialBasis: basis() }
      // Finansgrensen tar bare finansgrunnlaget; teknisk status inngår ikke.
      expect(calculateFinancialMetrics(session.financialBasis)).toEqual(calculateFinancialMetrics(basis()))
      assertValues(session.financialBasis, '1900000', '1500000', '700000')
    }
    expect(Object.keys(calculateFinancialMetrics(basis()))).toEqual([...metricNames])
  })
  it('BT-8: ingen mellomavrunding ved likhet og én krone under (uten terskelavgjørelse)', () => {
    const input = basis(); input.values.L.rawValue = '1520000'
    assertValues(input, '1520000', '1120000', '320000')
    input.values.L.rawValue = '1519999'
    assertValues(input, '1519999', '1119999', '319999')
  })
  it('BT-9/10: cash 0 og −1 beholdes; bekreftet J=0 gir NOI som cash', () => {
    const input = basis(); input.values.J.rawValue = '1500000'
    assertValues(input, '1900000', '1500000', '0')
    input.values.J.rawValue = '1500001'
    assertValues(input, '1900000', '1500000', '-1')
    input.values.J.rawValue = '0'
    assertValues(input, '1900000', '1500000', '1500000')
  })
  it('BT-11: −100000 NOI, −0,625 % nettoyield og −900000 cash settes ikke til null', () => {
    const input = basis(); input.values.L.rawValue = '300000'
    assertValues(input, '300000', '-100000', '-900000')
  })
  it('D/J splitter og inkluderte kostnader gir ingen ekstra fratrekk eller gjeld i NOI', () => {
    const input = basis()
    input.costItems = [
      { id: 'felles', label: 'Felleskostnader med gjeld', rawAmount: '120000', rawDebt: '20000', includedIn: null },
      { id: 'avgift', label: 'Avgifter inkludert i felleskostnader', rawAmount: '30000', rawDebt: '0', includedIn: 'felles' },
    ]
    const result = assertValues(input, '1900000', '1500000', '700000')
    expect(result.grossYield.basis.costBreakdown).toBeNull()
    for (const name of ['noi', 'netYield', 'cashFlowBeforeTax'] as const) {
      expect(result[name].basis.costBreakdown).toMatchObject({ D: '100000', J: '20000', annualD: '100000', annualJ: '20000' })
      expect(result[name].basis.costBreakdown?.items[1]).toMatchObject({ status: 'included', D: '30000', J: '0' })
    }
  })
})

describe('Story 3.1 AC2 — BT-7/15/16, år/periode og kontrollmetadata', () => {
  it('BT-7/15: måned, år og blanding normaliseres én gang til samme årsresultater', () => {
    const monthly = basis()
    monthly.values.L = { rawValue: '120000', confirmed: true, period: 'month', year: '2026' }
    monthly.values.D = { rawValue: '20000', confirmed: true, period: 'month', year: '2026' }
    monthly.values.J = { rawValue: '50000', confirmed: true, period: 'month', year: '2026' }
    const mixed = structuredClone(monthly)
    mixed.values.L = { ...mixed.values.L, rawValue: '1440000', period: 'year' }
    mixed.values.J = { ...mixed.values.J, rawValue: '600000', period: 'year' }
    for (const input of [monthly, mixed]) {
      const result = assertValues(freezeDeep(input), '1440000', '1200000', '600000')
      expect(calculateFinancialMetrics(input)).toEqual(result)
      for (const name of metricNames) {
        expect(result[name].basis.year).toBe('2026')
        for (const item of result[name].basis.inputs) {
          expect(item.registered).toEqual(input.values[item.field])
          expect(item.source).toEqual(input.sources[item.field])
          expect(item.unit).toBe('NOK')
          if (item.field === 'P') expect(item.normalization).toBeNull()
          else expect(item.normalization).toEqual({
            factor: input.values[item.field].period === 'month' ? '12' : '1', year: '2026',
            annualValue: { L: '1440000', D: '240000', J: '600000' }[item.field],
          })
        }
      }
    }
  })
  it.each(['L', 'D', 'J'] as const)('%s: ukjent/ustøttet/manglende periode stopper bare egne avhengigheter', (field) => {
    for (const [period, code] of [['', 'missing-period'], ['unknown', 'unknown-period'], ['week', 'unsupported-period']]) {
      const input = basis(); input.values[field].period = period!
      assertAffected(input, field, code!)
    }
  })
  it.each(['L', 'D', 'J'] as const)('%s: blankt eller ugyldig år gjettes ikke', (field) => {
    for (const year of ['', '2026/2027', '0']) {
      const input = basis(); input.values[field].year = year
      assertAffected(input, field, year === '' ? 'missing-year' : 'invalid-year')
    }
  })
  it('ulikt J-år påvirker ikke P/L eller L/D; felles kontroll beholder alle årsmangler', () => {
    const input = basis(); input.values.J.year = '2025'
    const result = calculateFinancialMetrics(input)
    for (const name of ['grossYield', 'noi', 'netYield'] as const) expect(result[name].status).toBe('available')
    expect(result.cashFlowBeforeTax).toMatchObject({ status: 'unavailable', value: null, basis: { year: null } })
    expect(result.cashFlowBeforeTax.issues.map(({ field, code, relatedFields }) => ({ field, code, relatedFields })))
      .toEqual(['L', 'D', 'J'].map((field) => ({ field, code: 'different-years', relatedFields: ['L', 'D', 'J'] })))
    expect(validateFinancialBasis(input).issues.map(({ field }) => field)).toEqual(['L', 'D', 'J'])
    expect(validateFinancialInput(input.values).issues.map(({ field }) => field)).toEqual(['L', 'D', 'J'])
  })
  it('review: samtidige J-feil endrer verken verdi eller kontrollgrunnlag i de tre uavhengige tallene', () => {
    const input = basis()
    const original = calculateFinancialMetrics(input)
    input.values.J = { rawValue: '', confirmed: false, period: 'week', year: '2025' }
    input.sources.J.conflict = { rawValue: '123', description: 'Motstridende gjeldskilde' }
    const result = calculateFinancialMetrics(input)
    for (const name of ['grossYield', 'noi', 'netYield'] as const) expect(result[name]).toEqual(original[name])
    expect(result.cashFlowBeforeTax.value).toBeNull()
    expect(result.cashFlowBeforeTax.issues.map(({ field, code }) => [field, code])).toEqual([
      ['L', 'different-years'], ['D', 'different-years'],
      ['J', 'missing-value'], ['J', 'unsupported-period'], ['J', 'different-years'], ['J', 'source-conflict'],
    ])
    // Eksisterende UI/mangelvurdering bruker fortsatt defaultkontrollen av L/D/J.
    expect(validateFinancialBasis(input).fields.L.status).toBe('insufficient')
    expect(validateFinancialInput(input.values).fields.D.status).toBe('insufficient')
  })
  it.each(['L', 'D'] as const)('ulikt %s-år hindrer L/D-beregningene, men ikke L/P alene', (field) => {
    const input = basis(); input.values[field].year = '2025'
    const result = calculateFinancialMetrics(input)
    expect(result.grossYield.status).toBe('available')
    for (const name of ['noi', 'netYield', 'cashFlowBeforeTax'] as const) expect(result[name].status).toBe('unavailable')
    expect(result.noi.issues.map(({ field, relatedFields }) => ({ field, relatedFields })))
      .toEqual([{ field: 'L', relatedFields: ['L', 'D'] }, { field: 'D', relatedFields: ['L', 'D'] }])
  })
  it('samme år med ledende nuller normaliseres uten å miste registreringen', () => {
    const input = basis(); input.values.L.year = ' 002026 '
    const result = assertValues(input, '1900000', '1500000', '700000')
    expect(result.noi.basis.inputs[0]).toMatchObject({ registered: { year: ' 002026 ' }, normalization: { year: '2026' } })
  })
})

describe('Story 3.1 AC3/4 — hver inputavhengighet og alle kjente årsaker', () => {
  it.each(fields)('%s: blank/whitespace blir ikke nullverdi eller gammelt tall', (field) => {
    for (const raw of ['', '  ', '\t\n']) {
      const input = basis(); input.values[field].rawValue = raw
      assertAffected(input, field, 'missing-value')
    }
  })
  it.each(fields)('%s: ubekreftet tall brukes ikke', (field) => {
    const input = basis(); input.values[field].confirmed = false
    assertAffected(input, field, 'unconfirmed-value')
  })
  it.each(fields)('%s: ikke-numerisk input brukes ikke', (field) => {
    for (const raw of ['NaN', 'Infinity', '1e3', 'tekst']) {
      const input = basis(); input.values[field].rawValue = raw
      assertAffected(input, field, 'not-numeric')
    }
  })
  it.each(fields)('%s: negative input avvises uten å ramme uavhengige tall', (field) => {
    const input = basis(); input.values[field].rawValue = '-1'
    assertAffected(input, field, field === 'P' ? 'must-be-positive' : 'must-be-nonnegative')
  })
  it.each(fields)('%s: uløst kildekonflikt velger ingen kilde', (field) => {
    const input = basis(); input.sources[field].conflict = { rawValue: '1', description: 'Annen kilde' }
    const result = assertAffected(input, field, 'source-conflict')
    for (const name of affectedBy[field]) expect(result[name].basis.inputs.find((item) => item.field === field)?.source.conflict)
      .toEqual(input.sources[field].conflict)
  })
  it.each(fields)('%s: manglende kilde er utilstrekkelig', (field) => {
    const input = basis(); input.sources[field].description = ' '
    assertAffected(input, field, 'missing-source')
  })
  it('P=0: begge yield utilgjengelige; NOI og cash beholdes (BT-6)', () => {
    const input = basis(); input.values.P.rawValue = '0'
    assertAffected(input, 'P', 'must-be-positive')
  })
  it.each(['L', 'D', 'J', 'Ymin'] as const)('%s: bekreftet null gyldig og ubekreftet null utilstrekkelig', (field) => {
    const input = basis(); input.values[field].rawValue = '0'
    for (const name of metricNames) expect(calculateFinancialMetrics(input)[name].status).toBe('available')
    input.values[field].confirmed = false
    assertAffected(input, field, 'unconfirmed-zero')
  })
  it('Ymin-mangel eller annen Ymin-verdi endrer ingen nøkkeltall eller deres inputgrunnlag (BT-18)', () => {
    const original = calculateFinancialMetrics(basis())
    for (const rawValue of ['', '0', '100', 'ugyldig']) {
      const input = basis(); input.values.Ymin = { rawValue, confirmed: false }
      input.sources.Ymin = { kind: '', description: '', conflict: { rawValue: '7', description: 'Alternativ' } }
      expect(calculateFinancialMetrics(input)).toEqual(original)
    }
  })
  it('BT-17: F2 uten J beholder F2s tre delberegninger uten anbefaling', () => {
    const input = basis(); input.values.L.rawValue = '1400000'; input.values.J.rawValue = ''
    const result = calculateFinancialMetrics(input)
    expect(result.grossYield.value).toEqual({ kind: 'ratio', numerator: '1400000', denominator: '16000000', unit: 'ratio' })
    expect(result.noi.value).toEqual({ kind: 'amount', amount: '1000000', unit: 'NOK/year' })
    expect(result.netYield.value).toEqual({ kind: 'ratio', numerator: '1000000', denominator: '16000000', unit: 'ratio' })
    expect(result.cashFlowBeforeTax.status).toBe('unavailable')
  })
  it('review: samtidig ugyldig P/J/Ymin lar hele gyldig NOI-grunnlag stå uendret', () => {
    const input = basis()
    const originalNoi = calculateFinancialMetrics(input).noi
    input.values.P.rawValue = '0'
    input.values.J = { rawValue: '0', confirmed: false, period: 'unknown', year: '' }
    input.values.Ymin.rawValue = 'ikke et tall'
    input.sources.P.description = ''
    const result = calculateFinancialMetrics(input)
    expect(result.noi).toEqual(originalNoi)
    for (const name of ['grossYield', 'netYield', 'cashFlowBeforeTax'] as const) {
      expect(result[name].status).toBe('unavailable')
      expect(result[name].value).toBeNull()
    }
    expect(result.grossYield.issues.map(({ code }) => code)).toEqual(['must-be-positive', 'missing-source'])
    expect(result.cashFlowBeforeTax.issues.map(({ code }) => code)).toEqual(['unconfirmed-zero', 'unknown-period', 'missing-year'])
  })
  it('bevarer alle samtidige relevante feltårsaker i stabil rekkefølge', () => {
    const input = basis()
    input.values.L = { rawValue: '0', confirmed: false, period: 'unknown', year: '' }
    input.sources.L.conflict = { rawValue: '1900000', description: 'Annen leie' }
    input.values.D.rawValue = '-1'
    input.sources.D.description = ''
    input.values.J.rawValue = ''
    const result = calculateFinancialMetrics(input)
    expect(result.cashFlowBeforeTax.issues.map(({ field, code }) => [field, code])).toEqual([
      ['L', 'unconfirmed-zero'], ['L', 'unknown-period'], ['L', 'missing-year'], ['L', 'source-conflict'],
      ['D', 'must-be-nonnegative'], ['D', 'missing-source'], ['J', 'missing-value'],
    ])
    for (const name of metricNames) {
      expect(result[name].value).toBeNull()
      for (const issue of result[name].issues) { expect(issue.message).not.toBe(''); expect(issue.action).not.toBe('') }
    }
  })
  it('ugyldig kostnadsinnhold rammer D/J-avhengigheter med konkrete feil', () => {
    const input = basis()
    input.costItems = [{ id: 'a', label: 'Gjeld', rawAmount: '100', rawDebt: '101', includedIn: null }]
    const result = calculateFinancialMetrics(input)
    expect(result.grossYield.status).toBe('available')
    for (const name of ['noi', 'netYield', 'cashFlowBeforeTax'] as const) {
      expect(result[name].status).toBe('unavailable')
      expect(result[name].issues.map(({ code }) => code)).toContain('invalid-cost')
    }
  })
  it('feil runtime-struktur/null er kontraktfeil, aldri automatisk 0 eller gyldig tall', () => {
    for (const field of fields) {
      const input = basis()
      const malformed = { ...input, values: { ...input.values, [field]: { ...input.values[field], rawValue: null } } }
      expect(() => calculateFinancialMetrics(malformed as unknown as FinancialBasis)).toThrow()
    }
    expect(() => calculateFinancialMetrics(null as unknown as FinancialBasis)).toThrow()
  })
})

describe('Story 3.1 AC1/2/6 — presisjon, gjentakelse og ingen mutasjon', () => {
  it('bevarer store og små presise desimaler uten flyttall eller mellomavrunding', () => {
    const input = basis()
    input.values.P.rawValue = '9007199254740993.000000000000000001'
    input.values.L.rawValue = '9007199254740993.000000000000000003'
    input.values.D.rawValue = '0.000000000000000001'
    input.values.J.rawValue = '0.000000000000000001'
    const result = calculateFinancialMetrics(input)
    expect(result.grossYield.value).toEqual({ kind: 'ratio', numerator: input.values.L.rawValue, denominator: input.values.P.rawValue, unit: 'ratio' })
    expect(result.noi.value).toEqual({ kind: 'amount', amount: '9007199254740993.000000000000000002', unit: 'NOK/year' })
    expect(result.netYield.value).toEqual({ kind: 'ratio', numerator: '9007199254740993.000000000000000002', denominator: input.values.P.rawValue, unit: 'ratio' })
    expect(result.cashFlowBeforeTax.value).toEqual({ kind: 'amount', amount: '9007199254740993.000000000000000001', unit: 'NOK/year' })
    expect(FinancialMetricsSchema.parse(result)).toEqual(result)
  })
  it('månedlige desimaler og norsk råtekst gir eksakt liten negativ kontantstrøm', () => {
    const input = basis()
    input.values.P.rawValue = '3'
    input.values.L = { ...input.values.L, rawValue: ' 0,100000000000000001 ', period: 'month' }
    input.values.D.rawValue = '1.200000000000000011'
    input.values.J.rawValue = '0.000000000000000002'
    const result = calculateFinancialMetrics(input)
    expect(result.grossYield.value).toEqual({ kind: 'ratio', numerator: '1.200000000000000012', denominator: '3', unit: 'ratio' })
    expect(result.noi.value).toEqual({ kind: 'amount', amount: '0.000000000000000001', unit: 'NOK/year' })
    expect(result.cashFlowBeforeTax.value).toEqual({ kind: 'amount', amount: '-0.000000000000000001', unit: 'NOK/year' })
    expect(result.noi.basis.inputs[0]?.registered.rawValue).toBe(' 0,100000000000000001 ')
  })
  it('uendelig yielddesimal bevarer 1/3 fremfor avkortet eller formattert streng', () => {
    const input = basis(); input.values.P.rawValue = '3'; input.values.L.rawValue = '1'; input.values.D.rawValue = '0'; input.values.J.rawValue = '0'
    expect(calculateFinancialMetrics(input).netYield.value).toEqual({ kind: 'ratio', numerator: '1', denominator: '3', unit: 'ratio' })
  })
  it('review: månedlig desimal gir eksakt negativ årsverdi også utover 20 desimaler', () => {
    const input = basis()
    input.values.P.rawValue = '1000.000000000000000000001'
    input.values.L = { rawValue: '0.333333333333333333333333333', confirmed: true, period: 'month', year: '2026' }
    input.values.D.rawValue = '4'
    input.values.J.rawValue = '0'
    const result = calculateFinancialMetrics(input)
    expect(result.grossYield.value).toEqual({ kind: 'ratio', numerator: '3.999999999999999999999999996', denominator: '1000.000000000000000000001', unit: 'ratio' })
    expect(result.netYield.value).toEqual({ kind: 'ratio', numerator: '-0.000000000000000000000000004', denominator: '1000.000000000000000000001', unit: 'ratio' })
    expect(result.noi.value).toEqual({ kind: 'amount', amount: '-0.000000000000000000000000004', unit: 'NOK/year' })
    expect(result.cashFlowBeforeTax.value).toEqual(result.noi.value)
    expect(FinancialMetricsSchema.parse(result)).toEqual(result)
  })
  it('fryst input gjentas identisk; hver retur har eget registrert kontrollgrunnlag', () => {
    const input = basis(); input.values.L.period = 'month'
    const before = structuredClone(input); freezeDeep(input)
    const first = calculateFinancialMetrics(input)
    for (let index = 0; index < 4; index++) expect(calculateFinancialMetrics(input)).toEqual(first)
    expect(input).toEqual(before)
    first.noi.basis.inputs[0]!.registered.rawValue = 'endret returobjekt'
    expect(input).toEqual(before)
    expect(calculateFinancialMetrics(input).noi.basis.inputs[0]!.registered.rawValue).toBe('1900000')
    expect(first.netYield.basis.inputs.find(({ field }) => field === 'L')?.registered.rawValue).toBe('1900000')
  })
  it('hver ny beregning tar gjeldende feil uten å videreføre tidligere beregnet verdi', () => {
    const input = basis()
    const previous: FinancialMetric = calculateFinancialMetrics(input).cashFlowBeforeTax
    expect(previous.status).toBe('available')
    input.values.J.confirmed = false
    expect(calculateFinancialMetrics(input).cashFlowBeforeTax).toMatchObject({ status: 'unavailable', value: null })
    expect(previous).toMatchObject({ status: 'available', value: { amount: '700000' } })
  })
})
