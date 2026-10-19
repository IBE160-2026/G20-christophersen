import { describe, expect, it } from 'vitest'
import { RegisteredFinancialInputSchema } from '../../src/contracts/financial-input.ts'
import type { RegisteredFinancialInput } from '../../src/contracts/financial-input.ts'
import { DecimalStringSchema, FinancialValidationSchema } from '../../src/contracts/financial-validation.ts'
import { validateFinancialInput } from '../../src/domain/validation.ts'

// Faste felt fra Story 1.4 AC1/AC2; testutvalget følger ikke produksjonsenumene.
const financialFields = ['P', 'L', 'D', 'J', 'Ymin'] as const
const recurringFields = ['L', 'D', 'J'] as const

// Uavhengig forhåndsdefinert fasit: F1 og årsnormaliseringsdelen av BT-7/15/16.
// Ingen forventningsverdi beregnes med modulen eller big.js i testene.
function annualBasis(): RegisteredFinancialInput {
  return {
    P: { rawValue: '16000000', confirmed: true },
    L: { rawValue: '1900000', confirmed: true, period: 'year', year: '2026' },
    D: { rawValue: '400000', confirmed: true, period: 'year', year: '2026' },
    J: { rawValue: '800000', confirmed: true, period: 'year', year: '2026' },
    Ymin: { rawValue: '7', confirmed: true },
  }
}

function freezeBasis(basis: RegisteredFinancialInput) {
  for (const value of Object.values(basis)) Object.freeze(value)
  return Object.freeze(basis)
}

describe('Story 1.4 AC1 — FR-3, AD-7: tall, blank, grenser og eksplisitt bekreftelse', () => {
  it.each(financialFields)('%s: blank og whitespace forblir manglende, aldri 0', (field) => {
    for (const rawValue of ['', '  ', '\t\n', '\u00a0']) {
      const basis = annualBasis()
      basis[field].rawValue = rawValue
      const result = validateFinancialInput(basis)
      expect(result.fields[field]).toMatchObject({ valueStatus: 'missing', decimal: null, status: 'insufficient' })
      expect(result.fields[field].issues).toEqual([
        { field, target: 'value', code: 'missing-value', message: `${field}: Verdien mangler.`, action: `Oppgi verdien for ${field}.`, relatedFields: [] },
      ])
    }
  })

  it.each(financialFields)('%s: ikke-numerisk og feilformet input avvises helt', (field) => {
    for (const rawValue of ['tekst', 'NaN', 'Infinity', '-Infinity', '12kr', '0x10', '1e3', '1,2,3', '1.234,56', '12 34', '1 90 000', '--1', '1_000']) {
      const basis = annualBasis()
      basis[field].rawValue = rawValue
      const result = validateFinancialInput(basis).fields[field]
      expect(result).toMatchObject({ valueStatus: 'invalid', decimal: null, status: 'insufficient' })
      expect(result.issues.map(({ code }) => code)).toEqual(['not-numeric'])
      expect(result.registered.rawValue).toBe(rawValue)
    }
  })

  it.each(financialFields)('%s: negative tall er ugyldige uten avrunding', (field) => {
    const basis = annualBasis()
    basis[field].rawValue = '-0.000000000000000000001'
    const result = validateFinancialInput(basis).fields[field]
    expect(result).toMatchObject({ valueStatus: 'invalid', decimal: '-0.000000000000000000001', status: 'insufficient' })
    expect(result.issues.map(({ code }) => code)).toEqual([field === 'P' ? 'must-be-positive' : 'must-be-nonnegative'])
  })

  it.each(financialFields)('%s: 0 krever bekreftelse og gjør aldri P gyldig (BT-6/10)', (field) => {
    for (const rawValue of ['0', '0,00', '-0', '+000.000']) {
      const basis = annualBasis()
      basis[field].rawValue = rawValue
      basis[field].confirmed = false
      const unconfirmed = validateFinancialInput(basis).fields[field]
      expect(unconfirmed.decimal).toBe('0')
      expect(unconfirmed.status).toBe('insufficient')
      expect(unconfirmed.issues.map(({ code }) => code)).toEqual([field === 'P' ? 'must-be-positive' : 'unconfirmed-zero'])
      basis[field].confirmed = true
      const confirmed = validateFinancialInput(basis).fields[field]
      expect(confirmed.decimal).toBe('0')
      expect(confirmed.valueStatus).toBe(field === 'P' ? 'invalid' : 'valid')
      expect(confirmed.status).toBe(field === 'P' ? 'insufficient' : 'sufficient')
      expect(confirmed.issues.map(({ code }) => code)).toEqual(field === 'P' ? ['must-be-positive'] : [])
    }
  })

  it.each(financialFields)('%s: vanlig registrering er heller ingen bekreftelse', (field) => {
    const basis = annualBasis()
    basis[field].confirmed = false
    const result = validateFinancialInput(basis).fields[field]
    expect(result.valueStatus).toBe('valid')
    expect(result.status).toBe('insufficient')
    expect(result.issues.map(({ code }) => code)).toEqual(['unconfirmed-value'])
    expect(result.registered.confirmed).toBe(false)
  })

  it('P kan være positiv under flyttallsgrensen; Ymin får ingen øvre standardgrense', () => {
    const basis = annualBasis()
    basis.P.rawValue = '0.' + '0'.repeat(324) + '1'
    basis.Ymin.rawValue = '101.000000000000000001'
    const result = validateFinancialInput(basis)
    expect(result.fields.P.valueStatus).toBe('valid')
    expect(result.fields.P.decimal).toBe(basis.P.rawValue)
    expect(result.fields.Ymin.decimal).toBe('101.000000000000000001')
    expect(result.issues).toEqual([])
  })
})

describe('Story 1.4 AC2/3 — FR-1/12/14, AD-7: eksakt årsnormalisering', () => {
  it('BT-7: 120000/20000/50000 per måned gir 1440000/240000/600000', () => {
    const basis = annualBasis()
    basis.L = { rawValue: '120000', confirmed: true, period: 'month', year: '2026' }
    basis.D = { rawValue: '20000', confirmed: true, period: 'month', year: '2026' }
    basis.J = { rawValue: '50000', confirmed: true, period: 'month', year: '2026' }
    const result = validateFinancialInput(basis)
    for (const [field, annualValue] of [['L', '1440000'], ['D', '240000'], ['J', '600000']] as const) {
      expect(result.fields[field].normalization).toEqual({ year: '2026', factor: '12', annualValue })
      expect(result.fields[field].registered).toEqual(basis[field])
    }
    expect(result.commonYear).toBe('2026')
    expect(result.issues).toEqual([])
  })

  it('BT-15: måned/år blandes først etter eksakt omregning; P/Ymin annualiseres ikke', () => {
    const basis = annualBasis()
    basis.L.rawValue = '1440000'
    basis.D = { ...basis.D, rawValue: '20000', period: 'month' }
    basis.J.rawValue = '600000'
    const result = validateFinancialInput(basis)
    expect(result.fields.L.normalization).toEqual({ year: '2026', factor: '1', annualValue: '1440000' })
    expect(result.fields.D.normalization).toEqual({ year: '2026', factor: '12', annualValue: '240000' })
    expect(result.fields.J.normalization).toEqual({ year: '2026', factor: '1', annualValue: '600000' })
    expect(result.fields.P).toMatchObject({ decimal: '16000000', registered: basis.P })
    expect(result.fields.Ymin).toMatchObject({ decimal: '7', registered: basis.Ymin })
    expect(result.fields.P).not.toHaveProperty('normalization')
    expect(result.fields.Ymin).not.toHaveProperty('normalization')
    expect(result.issues).toEqual([])
  })

  it.each([
    [' 01 234,56700 ', '1234.567', '14814.804'],
    ['1\u00a0234\u00a0567,89', '1234567.89', '14814814.68'],
    ['1\u202f234,50', '1234.5', '14814'],
    ['+0000.100000000000000001', '0.100000000000000001', '1.200000000000000012'],
    [',5', '0.5', '6'],
    ['1.', '1', '12'],
    ['9007199254740993.000000000000000001', '9007199254740993.000000000000000001', '108086391056891916.000000000000000012'],
    ['0.000000000000000000001', '0.000000000000000000001', '0.000000000000000000012'],
  ])('bevarer presisjon og råtekst: %s', (rawValue, decimal, annualValue) => {
    const basis = annualBasis()
    basis.L = { ...basis.L, rawValue, period: 'month' }
    const result = validateFinancialInput(basis)
    expect(result.fields.L).toMatchObject({ decimal, registered: basis.L, normalization: { year: '2026', factor: '12', annualValue } })
    expect(result.issues).toEqual([])
    expect(FinancialValidationSchema.parse(result)).toEqual(result)
  })

  it('gir eksakt kontrollgrunnlag før bekreftelse, uten å gjøre ubekreftet verdi tilstrekkelig', () => {
    const basis = annualBasis()
    basis.J = { rawValue: '0', confirmed: false, period: 'month', year: '2026' }
    const result = validateFinancialInput(basis).fields.J
    expect(result.normalization).toEqual({ year: '2026', factor: '12', annualValue: '0' })
    expect(result.status).toBe('insufficient')
    expect(result.issues.map(({ code }) => code)).toEqual(['unconfirmed-zero'])
  })
})

describe('Story 1.4 AC4 — BT-16: konkrete periode- og årsproblemer', () => {
  it.each(recurringFields)('%s: uoppgitt, ukjent og ustøttet periode gir aldri årsverdi', (field) => {
    for (const [period, expectedCode] of [['', 'missing-period'], ['unknown', 'unknown-period'], ['week', 'unsupported-period'], ['Month', 'unsupported-period']]) {
      const basis = annualBasis()
      basis[field].period = period
      const result = validateFinancialInput(basis)
      expect(result.fields[field].status).toBe('insufficient')
      expect(result.fields[field].normalization).toBeNull()
      expect(result.issues).toHaveLength(1)
      expect(result.issues[0]).toMatchObject({ field, target: 'period', code: expectedCode })
      expect(result.issues[0].message).toContain(field)
      expect(result.issues[0].action).toContain(field)
      expect(result.fields[field].registered.period).toBe(period)
    }
  })

  it.each(recurringFields)('%s: manglende/ugyldig år gjettes ikke og smitter ikke uendrede felt', (field) => {
    for (const year of ['', '  ', 'ukjent', '2026/2027', '2026.0', '-2026', '0000']) {
      const basis = annualBasis()
      basis[field].year = year
      const result = validateFinancialInput(basis)
      expect(result.commonYear).toBeNull()
      expect(result.fields[field]).toMatchObject({ status: 'insufficient', normalization: null, registered: { year } })
      expect(result.issues).toHaveLength(1)
      expect(result.issues[0]).toMatchObject({ field, target: 'year', code: year.trim() === '' ? 'missing-year' : 'invalid-year' })
      for (const other of recurringFields.filter((candidate) => candidate !== field)) {
        expect(result.fields[other].status).toBe('sufficient')
      }
    }
  })

  it.each(recurringFields)('%s: ulikt år identifiserer alle involverte felt uten foretrukket år', (field) => {
    const basis = annualBasis()
    basis[field].year = '2025'
    const result = validateFinancialInput(basis)
    expect(result.commonYear).toBeNull()
    for (const affected of recurringFields) {
      expect(result.fields[affected].status).toBe('insufficient')
      expect(result.fields[affected].issues).toEqual([expect.objectContaining({
        field: affected, target: 'year', code: 'different-years', relatedFields: ['L', 'D', 'J'],
      })])
      expect(result.fields[affected].registered).toEqual(basis[affected])
      expect(result.fields[affected].normalization?.year).toBe(basis[affected].year)
    }
    expect(result.fields.P.status).toBe('sufficient')
    expect(result.fields.Ymin.status).toBe('sufficient')
  })

  it('sammenlikner eksplisitt år uten Number og bevarer registrert representasjon', () => {
    const basis = annualBasis()
    basis.L.year = ' 002026 '
    const result = validateFinancialInput(basis)
    expect(result.commonYear).toBe('2026')
    expect(result.fields.L.normalization?.year).toBe('2026')
    expect(result.fields.L.registered.year).toBe(' 002026 ')
    expect(result.issues).toEqual([])
  })

  it('samler samtidige kjente årsaker med mål og handling i stabil feltrekkefølge', () => {
    const basis = annualBasis()
    basis.L = { rawValue: '', confirmed: false, period: 'unknown', year: '' }
    basis.D = { rawValue: '-1', confirmed: false, period: 'week', year: '2025' }
    basis.J = { rawValue: '0', confirmed: false, period: 'month', year: '2026' }
    const result = validateFinancialInput(basis)
    expect(result.issues.map(({ field, code }) => [field, code])).toEqual([
      ['L', 'missing-value'], ['L', 'unknown-period'], ['L', 'missing-year'],
      ['D', 'must-be-nonnegative'], ['D', 'unsupported-period'], ['D', 'different-years'],
      ['J', 'unconfirmed-zero'], ['J', 'different-years'],
    ])
    for (const { field, message, action } of result.issues) {
      expect(message).toContain(field)
      expect(action.length).toBeGreaterThan(0)
    }
  })
})

describe('Story 1.4 AC5 — NFR-1, AD-1/7/10: gjentakelse, immutabilitet og delte kontrakter', () => {
  it('normaliserer fryst input identisk uten kumulativ faktor eller delte registreringsobjekter', () => {
    const basis = annualBasis()
    basis.L = { rawValue: '0.100000000000000001', confirmed: false, period: 'month', year: '2026' }
    basis.D.year = '2025'
    const before = structuredClone(basis)
    freezeBasis(basis)
    const first = validateFinancialInput(basis)
    for (let count = 0; count < 5; count++) {
      const repeated = validateFinancialInput(basis)
      expect(repeated).toEqual(first)
      expect(repeated.fields.L.normalization?.annualValue).toBe('1.200000000000000012')
      expect(basis).toEqual(before)
      for (const field of financialFields) expect(repeated.fields[field].registered).not.toBe(basis[field])
      expect(FinancialValidationSchema.parse(repeated)).toEqual(repeated)
    }
    first.fields.L.registered.rawValue = 'endre bare resultatkopien'
    expect(basis).toEqual(before)
    expect(validateFinancialInput(basis).fields.L.registered.rawValue).toBe(before.L.rawValue)
  })

  it('felles kontrakt mottar bekreftet/ubekreftet grunnlag; feil struktur er en kontraktfeil', () => {
    const basis = annualBasis()
    expect(RegisteredFinancialInputSchema.parse(basis)).toEqual(basis)
    expect(RegisteredFinancialInputSchema.safeParse({ ...basis, P: { rawValue: 0, confirmed: true } }).success).toBe(false)
    expect(RegisteredFinancialInputSchema.safeParse({ ...basis, D: { rawValue: '1', confirmed: false } }).success).toBe(false)
    expect(FinancialValidationSchema.safeParse(validateFinancialInput(basis)).success).toBe(true)
  })

  it('kanoniske kontraktdesimaler utelater eksponent, overflødige nuller og negativ null', () => {
    for (const value of ['0', '1', '-1', '0.001', '-0.001', '9007199254740993.000000000000000001']) {
      expect(DecimalStringSchema.safeParse(value).success).toBe(true)
    }
    for (const value of ['', '-0', '01', '+1', '1,1', '1.0', '1e-7']) {
      expect(DecimalStringSchema.safeParse(value).success).toBe(false)
    }
  })
})
