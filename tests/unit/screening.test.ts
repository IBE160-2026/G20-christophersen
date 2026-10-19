import { describe, expect, it } from 'vitest'
import type { FinancialBasis } from '../../src/contracts/financial-basis.ts'
import type { FinancialField } from '../../src/contracts/financial-input.ts'
import {
  KnownDeficiencyAssessmentSchema, KnownDeficiencyInputSchema,
} from '../../src/contracts/screening.ts'
import type { KnownDeficiencyInput } from '../../src/contracts/screening.ts'
import { evaluateKnownDeficiencies } from '../../src/domain/screening.ts'

// Uavhengig F1-/F2-inndata fra brief-addendum. Ingen regel-/tekstfasit fra produksjonskode.
function financialBasis(rent = '1900000'): FinancialBasis {
  return {
    values: {
      P: { rawValue: '16000000', confirmed: true },
      L: { rawValue: rent, period: 'year', year: '2026', confirmed: true },
      D: { rawValue: '400000', period: 'year', year: '2026', confirmed: true },
      J: { rawValue: '800000', period: 'year', year: '2026', confirmed: true },
      Ymin: { rawValue: '7', confirmed: true },
    },
    sources: {
      P: { kind: 'source', description: 'Oppgitt totalpris', conflict: null },
      L: { kind: 'assumption', description: 'Forventet leie', rentNature: 'expected', conflict: null },
      D: { kind: 'source', description: 'Kostnadsoversikt', conflict: null },
      J: { kind: 'assumption', description: 'Renter og avdrag', conflict: null },
      Ymin: { kind: 'assumption', description: 'Eget avkastningskrav', conflict: null },
    },
    costItems: [],
  }
}

function freezeDeep<T>(value: T): T {
  if (value && typeof value === 'object') { Object.values(value).forEach(freezeDeep); Object.freeze(value) }
  return value
}

function fieldsAndCodes(input: KnownDeficiencyInput) {
  return evaluateKnownDeficiencies(input).triggers.map((entry) => [
    entry.kind === 'financial' ? entry.field : 'report', entry.code,
  ])
}

describe('Story 1.6 — kjente kritiske mangler, FR-16/FR-17 prioritet 1', () => {
  it('AC1/AC2: L/Ymin mangler og J er ubekreftet 0; alle tre har eksakt tekst og handling', () => {
    const basis = financialBasis()
    basis.values.L.rawValue = '  '
    basis.values.Ymin.rawValue = ''
    basis.values.J = { ...basis.values.J, rawValue: '0', confirmed: false }
    const result = evaluateKnownDeficiencies(freezeDeep({ financialBasis: basis }))
    expect(result).toEqual({
      scope: 'known-deficiencies', status: 'information-required',
      recommendation: 'Innhent mer informasjon', priority: 1,
      triggers: [
        { kind: 'financial', field: 'L', target: 'value', code: 'missing-value',
          message: 'L: Verdien mangler.', action: 'Oppgi verdien for L.', relatedFields: [] },
        { kind: 'financial', field: 'J', target: 'confirmation', code: 'unconfirmed-zero',
          message: 'J: 0 må bekreftes.', action: 'Kontroller og bekreft eksplisitt 0 for J.', relatedFields: [] },
        { kind: 'financial', field: 'Ymin', target: 'value', code: 'missing-value',
          message: 'Ymin: Verdien mangler.', action: 'Oppgi verdien for Ymin.', relatedFields: [] },
      ],
      explanation: 'Kritisk grunnlag er utilstrekkelig. L: Verdien mangler. J: 0 må bekreftes. Ymin: Verdien mangler.',
      nextAction: 'Før ny vurdering: Oppgi verdien for L. Kontroller og bekreft eksplisitt 0 for J. Oppgi verdien for Ymin.',
    })
    expect(KnownDeficiencyAssessmentSchema.safeParse(result).success).toBe(true)
    expect(basis.values.L.rawValue).toBe('  ')
    expect(basis.values.Ymin.rawValue).toBe('')
    expect(basis.values.J.rawValue).toBe('0')
  })

  it('AC1: samtidige blanke, ugyldige, konfliktfylte og ubekreftede felt skjuler ikke hverandre', () => {
    const basis = financialBasis()
    basis.values.P.rawValue = '0'
    basis.values.L.rawValue = ''
    basis.sources.L.conflict = { rawValue: '1400000', description: 'Annen kilde' }
    basis.values.D.rawValue = '-1'
    basis.values.J.confirmed = false
    basis.values.Ymin.rawValue = 'ukjent'
    const result = evaluateKnownDeficiencies({ financialBasis: basis })
    expect(fieldsAndCodes({ financialBasis: basis })).toEqual([
      ['P', 'must-be-positive'], ['L', 'missing-value'], ['L', 'source-conflict'],
      ['D', 'must-be-nonnegative'], ['J', 'unconfirmed-value'], ['Ymin', 'not-numeric'],
    ])
    expect(result.recommendation).toBe('Innhent mer informasjon')
    expect(result.priority).toBe(1)
    for (const trigger of result.triggers) {
      expect(result.explanation).toContain(trigger.message)
      expect(result.nextAction).toContain(trigger.action)
    }
    expect(result.triggers[2]).toMatchObject({
      field: 'L', action: 'Kontroller begge kildeverdiene for L, rett gjeldende verdi/opphav og fjern motstriden først når den er avklart.',
    })
    expect(basis.sources.L.conflict.rawValue).toBe('1400000')
  })

  it.each(['P', 'L', 'D', 'J', 'Ymin'] as const)('AC1 AT-12: blank %s er én navngitt mangel, aldri 0', (field) => {
    const basis = financialBasis()
    basis.values[field].rawValue = ' \t '
    basis.values[field].confirmed = false
    const result = evaluateKnownDeficiencies({ financialBasis: basis })
    expect(result.triggers).toEqual([{
      kind: 'financial', field, target: 'value', code: 'missing-value',
      message: `${field}: Verdien mangler.`, action: `Oppgi verdien for ${field}.`, relatedFields: [],
    }])
    expect(result.recommendation).toBe('Innhent mer informasjon')
  })

  it.each(['L', 'D', 'J', 'Ymin'] as const)('AC1/AC2: ubekreftet 0 i %s krever bekreftelse; bekreftet 0 gir ingen slik mangel', (field) => {
    const basis = financialBasis()
    basis.values[field].rawValue = '0'
    basis.values[field].confirmed = false
    expect(fieldsAndCodes({ financialBasis: basis })).toEqual([[field, 'unconfirmed-zero']])
    basis.values[field].confirmed = true
    expect(evaluateKnownDeficiencies({ financialBasis: basis }).recommendation).toBeNull()
    expect(fieldsAndCodes({ financialBasis: basis })).toEqual([])
  })

  it.each([
    ['P', '0', 'must-be-positive'], ['P', '-1', 'must-be-positive'],
    ['L', '-1', 'must-be-nonnegative'], ['D', '-1', 'must-be-nonnegative'],
    ['J', '-1', 'must-be-nonnegative'], ['Ymin', '-1', 'must-be-nonnegative'],
    ['P', 'ikke tall', 'not-numeric'],
  ] as const)('AC1 AT-12: %s=%s forblir ugyldig selv med bekreftelse', (field, rawValue, code) => {
    const basis = financialBasis()
    basis.values[field].rawValue = rawValue
    expect(fieldsAndCodes({ financialBasis: basis })).toEqual([[field, code]])
    expect(evaluateKnownDeficiencies({ financialBasis: basis }).recommendation).toBe('Innhent mer informasjon')
  })

  it.each(['P', 'L', 'D', 'J', 'Ymin'] as const)('AC1 AT-12: gyldig, men ubekreftet %s brukes ikke som godkjenning', (field) => {
    const basis = financialBasis()
    basis.values[field].confirmed = false
    expect(fieldsAndCodes({ financialBasis: basis })).toEqual([[field, 'unconfirmed-value']])
  })

  it('AC1: samme autoritet løfter alle kjente periode-, års-, kilde- og kostnadsproblemer', () => {
    const basis = financialBasis()
    basis.values.L.period = 'unknown'
    basis.values.L.year = '2025'
    basis.sources.L.description = ''
    basis.costItems = [{ id: 'unfinished', label: 'Forsikring', rawAmount: '', rawDebt: '', includedIn: null }]
    const result = evaluateKnownDeficiencies({ financialBasis: basis })
    expect(fieldsAndCodes({ financialBasis: basis })).toEqual([
      ['L', 'unknown-period'], ['L', 'different-years'], ['L', 'missing-source'],
      ['D', 'different-years'], ['D', 'invalid-cost'], ['J', 'different-years'], ['J', 'invalid-cost'],
    ])
    expect(result.triggers[1]).toMatchObject({ relatedFields: ['L', 'D', 'J'] })
    expect(result.triggers[4]).toMatchObject({ target: 'cost', field: 'D',
      message: 'Kostnadspost 1 (Forsikring): Navn, beløp eller rentedel/avdrag er ugyldig eller mangler.' })
    for (const entry of result.triggers) expect(entry.action.length).toBeGreaterThan(0)
  })

  it('AC1 AT-5: manglende L ved J1500001 gir bare mangelutfall og ingen finansberegning', () => {
    const basis = financialBasis('')
    basis.values.J.rawValue = '1500001'
    expect(fieldsAndCodes({ financialBasis: basis })).toEqual([['L', 'missing-value']])
    expect(evaluateKnownDeficiencies({ financialBasis: basis }).recommendation).toBe('Innhent mer informasjon')
  })

  it('AC1/AC4: begge kostnadsutløsere bevares, men samme nødvendige retting oppgis én gang', () => {
    const basis = financialBasis()
    basis.costItems = [{ id: 'unfinished', label: 'Forsikring', rawAmount: '', rawDebt: '', includedIn: null }]
    const result = evaluateKnownDeficiencies({ financialBasis: basis })
    expect(fieldsAndCodes({ financialBasis: basis })).toEqual([['D', 'invalid-cost'], ['J', 'invalid-cost']])
    expect(result.nextAction).toBe('Før ny vurdering: Oppgi navn og ikke-negative beløp; renter/avdrag må være oppgitt (også 0) og kan ikke overstige samlet beløp.')
    expect(evaluateKnownDeficiencies(freezeDeep({ financialBasis: basis }))).toEqual(result)
  })

  it.each(['1900000', '1400000'])('AC3: kontrollerte F1/F2-tall (L%s) opphever verken manglende eller ufullført rapportgrunnlag', (rent) => {
    for (const code of ['missing-report', 'incomplete-report'] as const) {
      const input = { financialBasis: financialBasis(rent), reportDeficiencies: [{ code, reason: 'Rapportgrunnlaget er ikke ferdig.' }] }
      const result = evaluateKnownDeficiencies(input)
      expect(result.recommendation).toBe('Innhent mer informasjon')
      expect(result.priority).toBe(1)
      expect(result.triggers).toHaveLength(1)
      expect(result.triggers[0]).toMatchObject({ kind: 'report', target: 'report', code, reason: 'Rapportgrunnlaget er ikke ferdig.' })
      expect(KnownDeficiencyAssessmentSchema.safeParse(result).success).toBe(true)
    }
  })

  it('AC3/AC4 AT-18 delgrunnlag: kjent rapportårsak bevares sammen med L/Ymin; faste tekster er eksakte', () => {
    const basis = financialBasis('')
    basis.values.Ymin.rawValue = ''
    const result = evaluateKnownDeficiencies({ financialBasis: basis,
      reportDeficiencies: [{ code: 'incomplete-report', reason: 'Analysen ble avbrutt.' }] })
    expect(fieldsAndCodes({ financialBasis: basis, reportDeficiencies: [{ code: 'incomplete-report', reason: 'Analysen ble avbrutt.' }] }))
      .toEqual([['L', 'missing-value'], ['Ymin', 'missing-value'], ['report', 'incomplete-report']])
    expect(result.triggers[2]).toEqual({ kind: 'report', target: 'report', code: 'incomplete-report',
      reason: 'Analysen ble avbrutt.', message: 'Rapportgrunnlaget er ufullført: Analysen ble avbrutt.',
      action: 'Avklar den oppgitte rapportmangelen og fullfør analyse og kontroll av gjeldende rapportgrunnlag.' })
    expect(result.explanation).toBe('Kritisk grunnlag er utilstrekkelig. L: Verdien mangler. Ymin: Verdien mangler. Rapportgrunnlaget er ufullført: Analysen ble avbrutt.')
    expect(result.nextAction).toBe('Før ny vurdering: Oppgi verdien for L. Oppgi verdien for Ymin. Avklar den oppgitte rapportmangelen og fullfør analyse og kontroll av gjeldende rapportgrunnlag.')
  })

  it('AC3: manglende rapport har kjent årsak og konkret innhentingshandling uten finansinput', () => {
    expect(evaluateKnownDeficiencies({ reportDeficiencies: [{ code: 'missing-report', reason: 'Tilstandsrapport er ikke valgt.' }] }))
      .toEqual({
        scope: 'known-deficiencies', status: 'information-required', recommendation: 'Innhent mer informasjon', priority: 1,
        triggers: [{ kind: 'report', target: 'report', code: 'missing-report', reason: 'Tilstandsrapport er ikke valgt.',
          message: 'Rapportgrunnlaget mangler: Tilstandsrapport er ikke valgt.',
          action: 'Innhent en støttet tilstandsrapport og fullfør analyse og kontroll av rapportgrunnlaget.' }],
        explanation: 'Kritisk grunnlag er utilstrekkelig. Rapportgrunnlaget mangler: Tilstandsrapport er ikke valgt.',
        nextAction: 'Før ny vurdering: Innhent en støttet tilstandsrapport og fullfør analyse og kontroll av rapportgrunnlaget.',
      })
  })

  it('AC4 AT-19: stabil felt-/rapportordning, fryst input og gjentakelse gir byteidentisk utfall og tekst', () => {
    const basis = financialBasis()
    for (const field of ['Ymin', 'D', 'P', 'J', 'L'] as FinancialField[]) basis.values[field].confirmed = false
    const input = { financialBasis: basis, reportDeficiencies: [
      { code: 'incomplete-report' as const, reason: 'B: kontroll gjenstår.' },
      { code: 'missing-report' as const, reason: 'Rapport ikke tilgjengelig.' },
      { code: 'incomplete-report' as const, reason: 'A: analyse gjenstår.' },
    ] }
    const before = structuredClone(input)
    const first = evaluateKnownDeficiencies(freezeDeep(input))
    expect(first.triggers.map((entry) => entry.kind === 'financial' ? entry.field : entry.reason)).toEqual([
      'P', 'L', 'D', 'J', 'Ymin', 'Rapport ikke tilgjengelig.', 'A: analyse gjenstår.', 'B: kontroll gjenstår.',
    ])
    for (let count = 0; count < 5; count++) expect(JSON.stringify(evaluateKnownDeficiencies(input))).toBe(JSON.stringify(first))
    expect(evaluateKnownDeficiencies({ ...input, reportDeficiencies: [...input.reportDeficiencies].reverse() })).toEqual(first)
    expect(input).toEqual(before)
    first.triggers[0]!.message = 'Endret resultatkopi'
    const later = evaluateKnownDeficiencies(input)
    expect(later.triggers[0]!.message).toBe('P: Verdien er ubekreftet.')
    expect(later.explanation).toContain('P: Verdien er ubekreftet.')
  })

  it('AC4: endring av returnerte relasjoner endrer verken input eller senere vurdering', () => {
    const basis = financialBasis()
    basis.values.L.year = '2025'
    const input = freezeDeep({ financialBasis: basis })
    const first = evaluateKnownDeficiencies(input)
    const entry = first.triggers[0]!
    expect(entry.kind).toBe('financial')
    if (entry.kind === 'financial') entry.relatedFields.pop()
    expect(evaluateKnownDeficiencies(input).triggers[0]).toMatchObject({ relatedFields: ['L', 'D', 'J'] })
    expect(basis.values.L.year).toBe('2025')
  })

  it.each([undefined, '1900000', '1400000'])('AC5: ingen kjente mangler i mottatt delgrunnlag (L%s) er ingen anbefaling/full screening', (rent) => {
    const result = evaluateKnownDeficiencies(rent === undefined ? {} : { financialBasis: financialBasis(rent) })
    expect(result).toEqual({ scope: 'known-deficiencies', status: 'no-known-deficiencies',
      recommendation: null, priority: null, triggers: [], explanation: null, nextAction: null })
    expect(KnownDeficiencyAssessmentSchema.safeParse(result).success).toBe(true)
    expect(KnownDeficiencyAssessmentSchema.safeParse({ ...result, recommendation: 'Gå videre' }).success).toBe(false)
    expect(KnownDeficiencyAssessmentSchema.safeParse({ ...result, recommendation: 'Forkast' }).success).toBe(false)
  })

  it('AC3/AC5: runtime-kontrakten krever kjent årsak, og tar ikke fullføring/TG3 eller økonomi som skjulte input', () => {
    for (const reason of ['', '  ']) expect(KnownDeficiencyInputSchema.safeParse({ reportDeficiencies: [{ code: 'incomplete-report', reason }] }).success).toBe(false)
    expect(KnownDeficiencyInputSchema.safeParse({ reportDeficiencies: [{ code: 'completed', reason: 'Ingen funn.' }] }).success).toBe(false)
    expect(KnownDeficiencyInputSchema.safeParse({ tg3: 'resolved' }).success).toBe(false)
    expect(KnownDeficiencyInputSchema.safeParse({ netYield: '6.25' }).success).toBe(false)
  })
})
