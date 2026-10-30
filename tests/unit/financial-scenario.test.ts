import { describe, expect, it } from 'vitest'
import { calculateFinancialScenario } from '../../src/domain/financial-scenario.ts'
import type { ScenarioBasis } from '../../src/domain/financial-scenario.ts'

const basis: ScenarioBasis = { P: '3200000', L: '252000', D: '48000', cashRequired: '3075000', sharedAnnualPayment: '12000', year: '2026', issues: [],
  provenance: { P: 'Fiktivt dokument', L: 'Egen forutsetning', D: 'Egen forutsetning', cashRequired: 'Fiktivt dokument', sharedAnnualPayment: 'Fiktivt dokument' } }
const controls = { equity: '1000000', annualInterest: '5.5', months: '300' }
describe('Isolert finansscenario med ordinære finansregler', () => {
  it('treffer uavhengig fasit, bruker eget kontantbehov og bevarer eksakt yield', () => {
    const result = calculateFinancialScenario(basis, controls)
    expect(result).toMatchObject({ loan: '2075000', monthly: '12742.32', annual: '152907.84', J: '164907.84', noi: '204000',
      grossYield: '7.875', netYield: '6.375', cashFlow: '39092.16', issues: [] })
    // Independent Python Decimal recurrence: B12 = B0*(1+r)^12 - payment*((1+r)^12-1)/r.
    expect(result.series.find(point => point.month === 12)?.balance).toBe('2035224.42')
    expect(result.series[0]).toMatchObject({ month: 0, balance: '2075000', cumulativeCashFlow: '0' })
    expect(result.series.at(-1)).toMatchObject({ month: 300, year: '25', balance: '0.00', cumulativeCashFlow: '977304.00' })
    expect(result.sensitivity).toEqual([]) // Expensive alternatives are opt-in and run in the UI's worker.
  })
  it.each([{ annualInterest: '9' }, { equity: '2000000' }, { months: '120' }])('endret finansiering %j endrer ikke yield', changed => {
    const result = calculateFinancialScenario(basis, { ...controls, ...changed })
    expect(result.grossYield).toBe('7.875'); expect(result.netYield).toBe('6.375')
    expect(result.cashFlow).not.toBe('39092.16')
  })
  it('bruker øreavrundet måned før år, også ved nullrente og delår', () => {
    const result = calculateFinancialScenario(basis, { equity: '1075000', annualInterest: '0', months: '241' })
    expect(result).toMatchObject({ loan: '2000000', monthly: '8298.76', annual: '99585.12', J: '111585.12', cashFlow: '92414.88' })
    expect(result.series.at(-1)).toMatchObject({ month: 241, balance: '0.00', cumulativeCashFlow: '1855998.84' })
  })
  it('ukjent leie er ikke null, men lånegrafen er fortsatt tilgjengelig', () => {
    const result = calculateFinancialScenario({ ...basis, L: null }, controls)
    expect(result).toMatchObject({ grossYield: null, netYield: null, noi: null, cashFlow: null, loan: '2075000' })
    expect(result.series).toHaveLength(26)
    expect(result.series.every(point => point.cumulativeCashFlow === null)).toBe(true)
    expect(result.sensitivity.every(point => point.cashFlow === null)).toBe(true)
  })
  it('inkluderer eksakt valgt rente mellom standardpunktene i sensitivitetsdata', () => {
    const result = calculateFinancialScenario(basis, { ...controls, annualInterest: '5,7', months: '12' }, { includeSensitivity: true })
    expect(result.sensitivity).toHaveLength(22)
    expect(result.sensitivity.find(point => point.annualInterest === '5.7')?.cashFlow).toBe(result.cashFlow)
    const outside = calculateFinancialScenario(basis, { ...controls, annualInterest: '15', months: '12' }, { includeSensitivity: true })
    expect(outside.sensitivity).toHaveLength(21)
    expect(outside.monthly).not.toBeNull()
  })
  it('ukjent fellesgjeldbetaling bevarer privat lån og yield, men ikke samlet J', () => {
    expect(calculateFinancialScenario({ ...basis, sharedAnnualPayment: null }, controls)).toMatchObject({
      loan: '2075000', monthly: '12742.32', J: null, cashFlow: null, netYield: '6.375' })
  })
  it.each([{ annualInterest: '' }, { months: '1201' }, { equity: '3075001' }, { annualInterest: '-1' }])('ugyldig finans %j gir ingen foreldet graf og beholder yield', changed => {
    const result = calculateFinancialScenario(basis, { ...controls, ...changed })
    expect(result.monthly).toBeNull(); expect(result.cashFlow).toBeNull(); expect(result.series).toEqual([]); expect(result.sensitivity).toEqual([])
    expect(result.grossYield).toBe('7.875'); expect(result.issues.length).toBeGreaterThan(0)
  })
  it('full egenkapital fjerner ikke fellesgjeldbetaling, og negative kontantstrømmer beholdes', () => {
    expect(calculateFinancialScenario(basis, { ...controls, equity: '3075000' })).toMatchObject({ loan: '0', monthly: '0.00', J: '12000.00', cashFlow: '192000' })
    const negative = calculateFinancialScenario({ ...basis, L: '10000' }, controls)
    expect(negative.cashFlow).toBe('-202907.84')
    expect(negative.series.at(-1)?.cumulativeCashFlow).toBe('-5072696.00')
  })
  it('muterer ikke grunnlag og returnerer ingen autoritativ bekreftelse eller anbefaling', () => {
    const before = structuredClone(basis), result = calculateFinancialScenario(basis, controls)
    expect(basis).toEqual(before); expect(result).not.toHaveProperty('recommendation'); expect(result).not.toHaveProperty('confirmed')
    result.basis.issues.push('lokal endring'); expect(basis.issues).toEqual([])
  })
})
