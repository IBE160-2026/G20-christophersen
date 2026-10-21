import Big from 'big.js'
import {
  FinancialFieldSchema, RecurringFieldSchema, RegisteredFinancialInputSchema,
} from '../contracts/financial-input.ts'
import type { FinancialField, RecurringField, RegisteredFinancialInput } from '../contracts/financial-input.ts'
import type { FinancialIssue, FinancialValidation } from '../contracts/financial-validation.ts'

// Egen konstruktør unngår global konfigurasjon som andre moduler kan endre.
const Decimal = Big()
Decimal.strict = true

// Vanlig desimaltekst, norsk desimalkomma og korrekt gruppert heltallsdel.
// Ingen tvetydig fjerning av alle skilletegn, valutatekst eller tallkoersjon.
const decimalInput = /^[+-]?(?:(?:\d+|\d{1,3}(?:[ \u00a0\u202f]\d{3})+)(?:[.,]\d*)?|[.,]\d+)$/

/** Samme desimalparser for registrerte verdier og oppgitt kostnadsinnhold. */
export function parseFinancialDecimal(rawValue: string): string | null {
  const raw = rawValue.trim()
  if (!decimalInput.test(raw)) return null
  return new Decimal(raw.replace(/[ \u00a0\u202f]/g, '').replace(',', '.').replace(/^\+/, '')).toFixed()
}

/** Periode/år kan være kjent selv om selve totalbeløpet mangler. */
export function financialPeriodContext(registered: { period: string; year: string }) {
  const rawYear = registered.year.trim()
  const year = rawYear.replace(/^0+/, '')
  return {
    year: /^\d+$/.test(rawYear) && year !== '' ? year : null,
    factor: registered.period === 'month' ? '12' as const : registered.period === 'year' ? '1' as const : null,
  }
}

function issue(
  field: FinancialField, target: FinancialIssue['target'], code: FinancialIssue['code'],
  message: string, action: string,
  relatedFields: FinancialIssue['relatedFields'] = [],
): FinancialIssue {
  return { field, target, code, message, action, relatedFields }
}

function validateValue(
  field: FinancialField, registered: RegisteredFinancialInput[FinancialField],
): FinancialValidation['fields']['P'] {
  const raw = registered.rawValue.trim()
  const result: FinancialValidation['fields']['P'] = {
    registered: { rawValue: registered.rawValue, confirmed: registered.confirmed },
    valueStatus: 'missing', decimal: null, status: 'insufficient', issues: [],
  }
  if (raw === '') {
    result.issues.push(issue(field, 'value', 'missing-value', `${field}: Verdien mangler.`, `Oppgi verdien for ${field}.`))
    return result
  }
  const canonical = parseFinancialDecimal(raw)
  if (canonical === null) {
    result.valueStatus = 'invalid'
    result.issues.push(issue(field, 'value', 'not-numeric', `${field}: Verdien er ikke et gyldig tall.`, `Oppgi et desimaltall for ${field}.`))
    return result
  }

  const decimal = new Decimal(canonical)
  result.decimal = decimal.toFixed()
  const invalidRange = field === 'P' ? decimal.lte('0') : decimal.lt('0')
  result.valueStatus = invalidRange ? 'invalid' : 'valid'
  if (invalidRange) {
    result.issues.push(field === 'P'
      ? issue(field, 'value', 'must-be-positive', 'P: Totalpris må være større enn 0.', 'Oppgi P større enn 0.')
      : issue(field, 'value', 'must-be-nonnegative', `${field}: Verdien kan ikke være negativ.`, `Oppgi ${field} større enn eller lik 0.`))
  } else if (!registered.confirmed) {
    result.issues.push(decimal.eq('0')
      ? issue(field, 'confirmation', 'unconfirmed-zero', `${field}: 0 må bekreftes.`, `Kontroller og bekreft eksplisitt 0 for ${field}.`)
      : issue(field, 'confirmation', 'unconfirmed-value', `${field}: Verdien er ubekreftet.`, `Kontroller og bekreft grunnlaget for ${field}.`))
  }
  result.status = result.issues.length === 0 ? 'sufficient' : 'insufficient'
  return result
}

/** Ren validering av numerisk grunnlag, bekreftelse og sammenlignbart år.
 * Bruk validateFinancialBasis når kilde/kostnadsinnhold også skal vurderes.
 * Funksjonen bekrefter aldri.
 */
export function validateFinancialInput(
  input: RegisteredFinancialInput, yearFields: readonly RecurringField[] = RecurringFieldSchema.options,
): FinancialValidation {
  const registered = RegisteredFinancialInputSchema.parse(input)
  const result: FinancialValidation = {
    fields: {
      P: validateValue('P', registered.P),
      L: { ...validateValue('L', registered.L), registered: registered.L, normalization: null },
      D: { ...validateValue('D', registered.D), registered: registered.D, normalization: null },
      J: { ...validateValue('J', registered.J), registered: registered.J, normalization: null },
      Ymin: validateValue('Ymin', registered.Ymin),
    },
    commonYear: null,
    issues: [],
  }
  const years = new Map<RecurringField, string>()
  for (const field of RecurringFieldSchema.options) {
    const value = result.fields[field]
    const { period } = value.registered
    const rawYear = value.registered.year.trim()
    const { year, factor } = financialPeriodContext(value.registered)
    if (period !== 'year' && period !== 'month') {
      const code = period === '' ? 'missing-period' : period === 'unknown' ? 'unknown-period' : 'unsupported-period'
      const reason = period === '' ? 'Perioden mangler' : period === 'unknown' ? 'Perioden er ukjent' : 'Perioden støttes ikke'
      value.issues.push(issue(field, 'period', code, `${field}: ${reason}.`, `Oppgi kjent måned eller år for ${field}.`))
    }
    if (year === null) {
      value.issues.push(rawYear === ''
        ? issue(field, 'year', 'missing-year', `${field}: Årsgrunnlaget mangler.`, `Oppgi hvilket år ${field} gjelder.`)
        : issue(field, 'year', 'invalid-year', `${field}: Årsgrunnlaget er ikke et gyldig år.`, `Oppgi ett positivt helt årstall for ${field}.`))
    } else {
      years.set(field, year)
      if (value.valueStatus === 'valid' && value.decimal !== null && factor !== null) {
        value.normalization = { year, factor, annualValue: new Decimal(value.decimal).times(factor).toFixed() }
      }
    }
  }

  // Beregninger sammenligner bare sine egne årsavhengigheter. Standardkallet
  // vurderer fortsatt hele tallgrunnlaget for kontroll og mangelvurdering.
  const relatedFields = RecurringFieldSchema.options.filter((field) => yearFields.includes(field) && years.has(field))
  const distinctYears = new Set(relatedFields.map((field) => years.get(field)))
  if (distinctYears.size > 1) {
    const context = relatedFields.map((field) => `${field}=${years.get(field)}`).join(', ')
    for (const field of relatedFields) {
      result.fields[field].issues.push(issue(field, 'year', 'different-years',
        `${field}: Verdiene gjelder ulike år (${context}).`,
        'Kontroller og oppgi sammenlignbart årsgrunnlag; ingen verdi flyttes automatisk til et annet år.', [...relatedFields]))
    }
  } else if (yearFields.length > 0 && yearFields.every((field) => years.has(field))) {
    result.commonYear = years.get(yearFields[0]!) ?? null
  }
  for (const field of FinancialFieldSchema.options) {
    const value = result.fields[field]
    value.status = value.issues.length === 0 ? 'sufficient' : 'insufficient'
    result.issues.push(...value.issues)
  }
  return result
}
