import Big from 'big.js'
import type { ScenarioBasis } from '../../domain/financial-scenario.ts'
import { parseFinancialDecimal } from '../../domain/validation.ts'

const Decimal = Big(); Decimal.strict = true

/** A display scenario only: document facts and confirmed financial inputs stay separate. */
export function withScenarioRent(basis: ScenarioBasis, monthly: string | null, reference?: { value: string; publisher: string; period: string } | null): ScenarioBasis {
  if (monthly === null) return basis
  const parsed = parseFinancialDecimal(monthly)
  const valid = parsed !== null && new Decimal(parsed).gte('0')
  const referenceNote = valid && reference && new Decimal(parsed).eq(reference.value) ? ` Beløpet er lik ${reference.publisher}, ${reference.period}; referansen brukes uendret uten prisjustering.` : ''
  return { ...basis, L: valid ? new Decimal(parsed).times('12').toFixed() : null,
    provenance: { ...basis.provenance, L: `Egen leieforutsetning i scenarioet · ikke dokumentert leie eller individuell markedsleie. Scenarioår ${basis.year ?? 'ikke oppgitt'}.${referenceNote}` },
    issues: [...basis.issues.filter(issue => !issue.startsWith('Automatisk leieforutsetning')).map(issue => issue.replace(/Leieår\/-nivå: [^;]+;/, `Leieforutsetning: brukerens scenario for ${basis.year ?? 'ikke oppgitt år'};`)),
      valid ? 'Scenarioleien er valgt av brukeren. Dokumenterte leieopplysninger og kontrollert vurdering er uendret.' : 'Oppgi en gyldig, ikke-negativ månedsleie. Leieavhengige scenariotall er utilgjengelige.'] }
}

export function monthlyScenarioRent(basis: ScenarioBasis, override: string | null): string {
  return override ?? (basis.L === null ? '' : new Decimal(basis.L).div('12').toFixed())
}
