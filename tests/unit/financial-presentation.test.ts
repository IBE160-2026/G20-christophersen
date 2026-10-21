import Big from 'big.js'
import { describe, expect, it } from 'vitest'
import type { FinancialBasis } from '../../src/contracts/financial-basis.ts'
import type { FinancialPresentationInput } from '../../src/contracts/presentation.ts'
import { PresentedFinancialMetricsSchema } from '../../src/contracts/presentation.ts'
import { calculateFinancialMetrics } from '../../src/domain/finance.ts'
import { evaluateCashFlowThreshold, evaluateNetYieldThreshold } from '../../src/domain/thresholds.ts'
import { formatFinancialMetrics } from '../../src/presentation/finance.ts'

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
      L: { kind: 'assumption', description: 'Eget leieanslag', rentNature: 'expected', conflict: null },
      D: { kind: 'source', description: 'Drift uten gjeld', conflict: null },
      J: { kind: 'source', description: 'Renter/avdrag inklusive fellesgjeld', conflict: null },
      Ymin: { kind: 'assumption', description: 'Eget krav', conflict: null },
    },
    costItems: [],
  }
}

function calculated(input: FinancialBasis): FinancialPresentationInput {
  const metrics = calculateFinancialMetrics(input)
  return {
    grossYield: metrics.grossYield, noi: metrics.noi,
    netYield: evaluateNetYieldThreshold(input), cashFlowBeforeTax: evaluateCashFlowThreshold(input),
  }
}

function presented(input = basis(), partialBasis = false) {
  const result = formatFinancialMetrics(calculated(input), { partialBasis })
  expect(PresentedFinancialMetricsSchema.parse(result)).toEqual(result)
  return result
}

function freezeDeep<T>(input: T): T {
  if (input && typeof input === 'object') { Object.values(input).forEach(freezeDeep); Object.freeze(input) }
  return input
}

const keys = ['grossYield', 'noi', 'netYield', 'cashFlowBeforeTax'] as const

describe('Story 3.3 AC1 — uavhengig F1/F2/BT-fasit og norsk normalformat', () => {
  it('F1/BT-1: tre desimaler, hele NOK, navn, enhet og år', () => {
    const result = presented()
    expect(keys.map((key) => result[key].displayValue))
      .toEqual(['11,875', '1\u00a0500\u00a0000', '9,375', '700\u00a0000'])
    expect(keys.map((key) => result[key].name))
      .toEqual(['Bruttoyield', 'NOI', 'Nettoyield', 'Kontantstrøm før skatt'])
    expect(keys.map((key) => result[key].unit)).toEqual(['%', 'kr/år', '%', 'kr/år'])
    for (const key of keys) {
      expect(result[key].statusLabel).toBe('Beregnet')
      expect(result[key].year).toBe('2026')
      expect(result[key].partialLabel).toBeNull()
      expect(result[key].rounding).toBeNull()
    }
    expect(result.netYield.threshold).toMatchObject({ minimumDisplayValue: '7,000', minimumDetailValue: '7', decision: { status: 'passed' } })
    expect(result.netYield.threshold?.basis).toEqual(evaluateNetYieldThreshold(basis()).basis)
  })
  it('F2/BT-2: 8,750 % og 6,250 % beholder tre desimaler; synlig brudd trenger ingen skjult-bruddmarkør', () => {
    const input = basis(); input.values.L.rawValue = '1400000'
    const result = presented(input)
    expect(keys.map((key) => result[key].displayValue))
      .toEqual(['8,750', '1\u00a0000\u00a0000', '6,250', '200\u00a0000'])
    expect(result.netYield.threshold?.decision.status).toBe('breached')
    expect(result.netYield.rounding).toBeNull()
  })
  it('BT-11: negative NOI, nettoyield og cash beholder synlig minus', () => {
    const input = basis(); input.values.L.rawValue = '300000'
    const result = presented(input)
    expect(keys.map((key) => result[key].displayValue))
      .toEqual(['1,875', '−100\u00a0000', '−0,625', '−900\u00a0000'])
    expect(result.noi.detail).toEqual({ displayValue: '−100\u00a0000', decimalPlaces: 0, approximate: false })
  })
  it('BT-15: blandet måned/år vises som NOK/år og bevarer råverdi, faktor, årsverdi og kilde', () => {
    const input = basis()
    input.values.L.rawValue = '1440000'
    input.values.D = { rawValue: '20000', confirmed: true, period: 'month', year: '2026' }
    input.values.J.rawValue = '600000'
    input.costItems = [{ id: 'avgift', label: 'Oppgitt delinnhold', rawAmount: '10000', rawDebt: '0', includedIn: null }]
    const result = presented(input)
    expect(keys.map((key) => result[key].displayValue))
      .toEqual(['9,000', '1\u00a0200\u00a0000', '7,500', '600\u00a0000'])
    expect(result.noi.metric.basis.inputs.find(({ field }) => field === 'D')).toMatchObject({
      registered: input.values.D, source: input.sources.D,
      normalization: { factor: '12', annualValue: '240000', year: '2026' },
    })
    expect(result.noi.metric.basis.costBreakdown?.items[0]?.label).toBe('Oppgitt delinnhold')
  })
  it.each([
    ['0.49', '0', '0,49'], ['0.5', '1', '0,5'], ['1234.5', '1\u00a0235', '1\u00a0234,5'],
    ['-0.49', '0', '−0,49'], ['-0.5', '−1', '−0,5'], ['-1234.5', '−1\u00a0235', '−1\u00a0234,5'],
  ])('hele NOK: %s blir %s med roundHalfUp; detaljen beholder desimaler', (amount, expected, detail) => {
    const input = calculated(basis())
    input.noi = { ...input.noi, status: 'available', issues: [], value: { kind: 'amount', amount: amount!, unit: 'NOK/year' } }
    const result = formatFinancialMetrics(input, { partialBasis: false })
    expect(result.noi.displayValue).toBe(expected)
    expect(result.noi.detail?.displayValue).toBe(detail)
  })
  it('store beløp utover Number-presisjon grupperes uten tap av heltall', () => {
    const input = basis()
    input.values.L.rawValue = '9007199254740993.5'; input.values.D.rawValue = '0'; input.values.J.rawValue = '0'
    const result = presented(input)
    expect(result.noi.displayValue).toBe('9\u00a0007\u00a0199\u00a0254\u00a0740\u00a0994')
    expect(result.noi.detail?.displayValue).toBe('9\u00a0007\u00a0199\u00a0254\u00a0740\u00a0993,5')
  })
  it.each([
    ['118744.9', '0', '11,874'], ['118745', '0', '11,875'], ['118745.1', '0', '11,875'],
    ['0', '118744.9', '−11,874'], ['0', '118745', '−11,875'], ['0', '118745.1', '−11,875'],
  ])('review: yield fra L=%s og D=%s avrundes selvstendig til %s', (rent, expenses, expected) => {
    const input = basis(); input.values.P.rawValue = '1000000'
    input.values.L.rawValue = rent; input.values.D.rawValue = expenses; input.values.J.rawValue = '0'
    const result = presented(input)
    expect(result.netYield.displayValue).toBe(expected)
    if (expenses === '0') expect(result.grossYield.displayValue).toBe(expected)
  })
  it('review: bekreftet L/D/J/Ymin=0 gir fire synlige nuller og to beståtte terskler', () => {
    const input = basis()
    for (const field of ['L', 'D', 'J', 'Ymin'] as const) input.values[field].rawValue = '0'
    const result = presented(input)
    expect(keys.map((key) => result[key].displayValue)).toEqual(['0,000', '0', '0,000', '0'])
    for (const key of keys) {
      expect(result[key].statusLabel).toBe('Beregnet')
      expect(result[key].rounding).toBeNull()
    }
    expect(result.netYield.threshold?.decision.status).toBe('passed')
    expect(result.cashFlowBeforeTax.threshold?.decision.status).toBe('passed')
  })
})

describe('Story 3.3 AC2 — eksakte brudd skjules ikke av avrunding', () => {
  it('BT-8: 6,99999375 % vises 7,000, men detalj og forklaring bevarer bruddet', () => {
    const input = basis(); input.values.L.rawValue = '1519999'
    const result = presented(input).netYield
    expect(result.displayValue).toBe('7,000')
    expect(result.detail).toEqual({ displayValue: '6,99999375', decimalPlaces: 8, approximate: false })
    expect(result.threshold).toMatchObject({ decision: { status: 'breached' }, minimumDisplayValue: '7,000', minimumDetailValue: '7' })
    expect(result.rounding).toEqual({
      code: 'hidden-net-yield-breach',
      explanation: 'Nettoyield er under avkastningskravet før avrunding. Hovedvisningen skjuler forskjellen; regelen bruker uavrundet grunnlag uten toleransemargin. Se detaljverdien og det eksakte kravet.',
    })
    expect(result.metric.value).toEqual({ kind: 'ratio', numerator: '1119999', denominator: '16000000', unit: 'ratio' })
  })
  it('eksakt likhet 7 % er bestått og trenger ingen bruddforklaring', () => {
    const input = basis(); input.values.L.rawValue = '1520000'
    const result = presented(input).netYield
    expect(result.displayValue).toBe('7,000')
    expect(result.detail?.displayValue).toBe('7,00000000')
    expect(result.threshold?.decision.status).toBe('passed')
    expect(result.rounding).toBeNull()
  })
  it('brudd utover åtte desimaler får nok detaljpresisjon til synlig forskjell', () => {
    const input = basis(); input.values.L.rawValue = '1519999.999999999999999999999999'
    const result = presented(input).netYield
    expect(result.displayValue).toBe('7,000')
    expect(result.detail).toEqual({ displayValue: '6,99999999999999999999999999999375', decimalPlaces: 32, approximate: false })
    expect(result.threshold?.decision.status).toBe('breached')
    expect(result.rounding?.code).toBe('hidden-net-yield-breach')
  })
  it('liten forskjell i Ymin blir synlig gjennom eksakt kravdetalj', () => {
    const input = basis(); input.values.L.rawValue = '1520000'; input.values.Ymin.rawValue = '7.000000000000000000000000001'
    const result = presented(input).netYield
    expect(result.displayValue).toBe('7,000')
    expect(result.threshold).toMatchObject({ minimumDisplayValue: '7,000', minimumDetailValue: '7,000000000000000000000000001', decision: { status: 'breached' } })
    expect(result.rounding?.code).toBe('hidden-net-yield-breach')
  })
  it.each(['0.01', '0.000000000000000000000001'])('negativ cash −%s får hovedvisning null, eksakt negativ detalj og bruddforklaring', (fraction) => {
    const input = basis(); input.values.J.rawValue = `1500000.${fraction.split('.')[1]}`
    const result = presented(input).cashFlowBeforeTax
    expect(result.displayValue).toBe('0')
    expect(result.detail?.displayValue).toBe(`−${fraction.replace('.', ',')}`)
    expect(result.detail?.approximate).toBe(false)
    expect(result.threshold?.decision.status).toBe('breached')
    expect(result.rounding).toEqual({
      code: 'negative-rounded-to-zero',
      explanation: 'Kontantstrømmen er negativ før avrunding. Visningen 0 kr/år betyr ikke at nullgrensen er bestått; regelen bruker det uavrundede beløpet.',
    })
  })
  it('BT-9: cash 0 består og −1 bryter med synlig fortegn', () => {
    const input = basis(); input.values.J.rawValue = '1500000'
    expect(presented(input).cashFlowBeforeTax).toMatchObject({ displayValue: '0', rounding: null, threshold: { decision: { status: 'passed' } } })
    input.values.J.rawValue = '1500001'
    expect(presented(input).cashFlowBeforeTax).toMatchObject({ displayValue: '−1', rounding: null, threshold: { decision: { status: 'breached' } } })
  })
  it('også negativt NOI som avrundes til null beholder negativ betydning', () => {
    const input = basis(); input.values.L.rawValue = '399999.99'
    const result = presented(input)
    expect(result.noi).toMatchObject({ displayValue: '0', detail: { displayValue: '−0,01' }, rounding: { code: 'negative-rounded-to-zero' } })
    expect(result.noi.rounding?.explanation).toContain('Beløpet er negativt før avrunding')
  })
  it('negativ nettoyield nær null og Ymin=0 bevarer begge fortegn og brudd', () => {
    const input = basis(); input.values.L.rawValue = '399999.999999999999'; input.values.Ymin.rawValue = '0'
    const result = presented(input).netYield
    expect(result.displayValue).toBe('0,000')
    expect(result.detail?.displayValue).toBe('−0,00000000000000000625000000000000')
    expect(result.threshold?.decision.status).toBe('breached')
    expect(result.rounding?.code).toBe('hidden-net-yield-breach')
  })
  it.each(['7', ''])('review AC1: svært liten negativ nettoyield beholder betydningen med Ymin=%s', (minimum) => {
    const input = basis(); input.values.L.rawValue = '399999.999999999999'; input.values.Ymin.rawValue = minimum
    const result = presented(input, minimum === '').netYield
    expect(result.displayValue).toBe('0,000')
    expect(result.detail).toEqual({ displayValue: '−0,00000000000000000625000000000000', decimalPlaces: 32, approximate: false })
    expect(result.rounding).toEqual({
      code: 'negative-rounded-to-zero',
      explanation: 'Nettoyield er negativ før avrunding. Visningen 0,000 % skjuler fortegnet; detaljen viser verdien med nødvendig presisjon. Reglene bruker det uavrundede grunnlaget.',
    })
    expect(result.threshold?.decision.status).toBe(minimum === '' ? 'unavailable' : 'breached')
  })
  it('review AC1: negativ yield som allerede har lesbar detalj får forklaring ved hovedvisning null', () => {
    const input = basis(); input.values.L.rawValue = '399984'
    expect(presented(input).netYield).toMatchObject({
      displayValue: '0,000', detail: { displayValue: '−0,00010000', decimalPlaces: 8 },
      rounding: { code: 'negative-rounded-to-zero' },
    })
  })
  it('uendelig yielddesimal er merket tilnærmet og beholder eksakt teller/nevner', () => {
    const input = basis(); input.values.P.rawValue = '3'; input.values.L.rawValue = '1'; input.values.D.rawValue = '0'; input.values.J.rawValue = '0'
    const result = presented(input).netYield
    expect(result.displayValue).toBe('33,333')
    expect(result.detail).toEqual({ displayValue: '33,33333333', decimalPlaces: 8, approximate: true })
    expect(result.metric.value).toEqual({ kind: 'ratio', numerator: '1', denominator: '3', unit: 'ratio' })
  })
})

describe('Story 3.3 AC3 — Ikke beregnbart og kjent Delgrunnlag', () => {
  it('BT-3: manglende L har fire konkrete årsaker uten tall eller detalj', () => {
    const input = basis(); input.values.L.rawValue = ''
    const result = presented(input, true)
    for (const key of keys) {
      expect(result[key]).toMatchObject({ statusLabel: 'Ikke beregnbart', displayValue: null, detail: null, partialLabel: 'Delgrunnlag', metric: { status: 'unavailable', value: null } })
      expect(result[key].metric.issues).toContainEqual(expect.objectContaining({ field: 'L', code: 'missing-value', action: 'Oppgi verdien for L.' }))
    }
    expect(keys.map((key) => result[key].unit)).toEqual(['%', 'kr/år', '%', 'kr/år'])
  })
  it('BT-5: manglende J rammer bare cash; andre tall er lesbart delgrunnlag', () => {
    const input = basis(); input.values.J.rawValue = ''
    const result = presented(input, true)
    expect(result.cashFlowBeforeTax).toMatchObject({ displayValue: null, statusLabel: 'Ikke beregnbart' })
    expect(result.cashFlowBeforeTax.metric.issues[0]?.field).toBe('J')
    expect(result.netYield).toMatchObject({ displayValue: '9,375', partialLabel: 'Delgrunnlag', threshold: { decision: { status: 'passed' } } })
  })
  it('BT-6: P=0 formaterer ingen yield og gjør ingen divisjon med null', () => {
    const input = basis(); input.values.P.rawValue = '0'
    const result = presented(input, true)
    for (const key of ['grossYield', 'netYield'] as const) {
      expect(result[key]).toMatchObject({ displayValue: null, detail: null, statusLabel: 'Ikke beregnbart' })
      expect(result[key].metric.issues).toContainEqual(expect.objectContaining({ field: 'P', code: 'must-be-positive' }))
    }
    expect(result.noi.displayValue).toBe('1\u00a0500\u00a0000')
    expect(result.cashFlowBeforeTax.displayValue).toBe('700\u00a0000')
  })
  it('manglende Ymin hindrer ingen tall og presenteres som eksisterende ikke-vurderbart terskelutfall', () => {
    const input = basis(); input.values.Ymin.rawValue = ''
    const result = presented(input, true)
    for (const key of keys) expect(result[key].statusLabel).toBe('Beregnet')
    expect(result.netYield.threshold).toMatchObject({ minimumDisplayValue: null, minimumDetailValue: null, decision: { status: 'unavailable' } })
    expect(result.netYield.threshold?.decision.issues).toContainEqual(expect.objectContaining({ field: 'Ymin', code: 'missing-value' }))
    expect(result.netYield.rounding).toBeNull()
  })
  it('Delgrunnlag bevares fra kalleren også ved fire gyldige tall; ingen anbefaling velges', () => {
    const result = presented(basis(), true)
    for (const key of keys) expect(result[key].partialLabel).toBe('Delgrunnlag')
    expect(Object.keys(result)).toEqual([...keys])
    expect(result).not.toHaveProperty('recommendation')
  })
  it('ny utilstrekkelig beregning bruker ikke forrige gyldige presentasjonsverdi', () => {
    const input = basis(); const old = presented(input)
    input.values.L.confirmed = false
    const next = presented(input, true)
    expect(old.netYield.displayValue).toBe('9,375')
    expect(next.netYield.displayValue).toBeNull()
    expect(next.netYield.metric.issues[0]?.code).toBe('unconfirmed-value')
  })
  it('review: avvikende J-år bevarer egne gyldige år og alle mismatchårsaker uten cashverdi', () => {
    const input = basis(); input.values.J.year = '2027'
    const result = presented(input, true)
    for (const key of ['grossYield', 'noi', 'netYield'] as const) {
      expect(result[key]).toMatchObject({ year: '2026', statusLabel: 'Beregnet', partialLabel: 'Delgrunnlag' })
    }
    expect(result.cashFlowBeforeTax).toMatchObject({ year: null, displayValue: null, detail: null, statusLabel: 'Ikke beregnbart' })
    expect(result.cashFlowBeforeTax.metric.issues.map(({ field, code }) => [field, code]))
      .toEqual([['L', 'different-years'], ['D', 'different-years'], ['J', 'different-years']])
    expect(result.cashFlowBeforeTax.metric.basis.inputs.find(({ field }) => field === 'J')?.normalization?.year).toBe('2027')
  })
})

describe('Story 3.3 AC4 — ekte terskelintegrasjon, determinisme og enveisgrense', () => {
  it.each([
    ['F1', '1900000', '800000', 'passed', 'passed'],
    ['F2', '1400000', '800000', 'breached', 'passed'],
    ['BT-8 likhet', '1520000', '800000', 'passed', 'passed'],
    ['BT-8 under', '1519999', '800000', 'breached', 'passed'],
    ['BT-9 null', '1900000', '1500000', 'passed', 'passed'],
    ['skjult cash', '1900000', '1500000.01', 'passed', 'breached'],
    ['begge brudd', '1519999', '1119999.000000000000000000000001', 'breached', 'breached'],
    ['utvidet 32-desimaldetalj', '1519999.999999999999999999999999', '800000', 'breached', 'passed'],
    ['svært liten negativ yield', '399999.999999999999', '800000', 'breached', 'breached'],
  ])('%s: terskelavgjørelser og eksakte finansverdier er identiske før/etter gjentatt formatering', (_name, rent, debt, yieldStatus, cashStatus) => {
    const input = basis(); input.values.L.rawValue = rent!; input.values.J.rawValue = debt!
    const original = structuredClone(input); freezeDeep(input)
    const source = calculated(input); const before = structuredClone(source); freezeDeep(source)
    const metricsBefore = calculateFinancialMetrics(input)
    const result = formatFinancialMetrics(source, { partialBasis: false })
    for (let index = 0; index < 3; index++) expect(formatFinancialMetrics(source, { partialBasis: false })).toEqual(result)
    expect(result.netYield.threshold?.decision.status).toBe(yieldStatus)
    expect(result.cashFlowBeforeTax.threshold?.decision.status).toBe(cashStatus)
    expect(evaluateNetYieldThreshold(input)).toEqual(before.netYield)
    expect(evaluateCashFlowThreshold(input)).toEqual(before.cashFlowBeforeTax)
    expect(calculateFinancialMetrics(input)).toEqual(metricsBefore)
    expect(source).toEqual(before); expect(input).toEqual(original)
  })
  it('utdatamutering kan ikke endre inputgrunnlag eller ekte terskelavgjørelse', () => {
    const source = calculated(basis()); const before = structuredClone(source)
    const result = formatFinancialMetrics(source, { partialBasis: false })
    result.netYield.metric.basis.inputs[0]!.registered.rawValue = 'endret'
    if (result.netYield.threshold && 'minimumYield' in result.netYield.threshold.basis) {
      result.netYield.threshold.basis.minimumYield.source.description = 'endret kilde'
    }
    result.netYield.threshold!.decision.status = 'unavailable'
    result.netYield.displayValue = '0,000'
    expect(source).toEqual(before)
    expect(formatFinancialMetrics(source, { partialBasis: false }).netYield.displayValue).toBe('9,375')
  })
  it('global big.js-DP/RM/strict endrer verken skjult brudd eller lokalisering', () => {
    const previous = { DP: Big.DP, RM: Big.RM, strict: Big.strict }
    const input = basis(); input.values.L.rawValue = '1519999'; input.values.J.rawValue = '1119999.01'
    const expected = presented(input)
    try {
      Big.DP = 0; Big.RM = Big.roundUp; Big.strict = false
      expect(presented(input)).toEqual(expected)
      expect(Big.DP).toBe(0); expect(Big.RM).toBe(Big.roundUp); expect(Big.strict).toBe(false)
    } finally { Big.DP = previous.DP; Big.RM = previous.RM; Big.strict = previous.strict }
  })
})
