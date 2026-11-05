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
    issues: [...basis.issues.filter(issue => !issue.startsWith('Automatisk leieforutsetning') && !(valid && issue.startsWith('L:'))).map(issue => issue.replace(/Leieår\/-nivå: [^;]+;/, `Leieforutsetning: brukerens scenario for ${basis.year ?? 'ikke oppgitt år'};`)),
      valid ? 'Scenarioleien er valgt av brukeren. Dokumenterte leieopplysninger og kontrollert vurdering er uendret.' : 'Oppgi en gyldig, ikke-negativ månedsleie. Leieavhengige scenariotall er utilgjengelige.'] }
}

export function monthlyScenarioRent(basis: ScenarioBasis, override: string | null): string {
  return override ?? (basis.L === null ? '' : new Decimal(basis.L).div('12').toFixed())
}

/** Explicit total assumption replaces operating costs; never adds to document subtotals. */
export function withScenarioOperatingCosts(basis: ScenarioBasis, monthly: string | null): ScenarioBasis {
  if (monthly === null) return basis
  const parsed = parseFinancialDecimal(monthly)
  const valid = parsed !== null && new Decimal(parsed).gte('0')
  return { ...basis, D: valid ? new Decimal(parsed).times('12').toFixed() : null,
    provenance: { ...basis.provenance, D: 'Egen forutsetning om samlet eierbetalt drift, inkludert kjente kostnader og vedlikehold, uten renter og avdrag. Erstatter dokumentets delsum i scenarioet.' },
    issues: [...basis.issues.filter(issue => !issue.startsWith('Full D ') && !issue.startsWith('Leie og driftskostnader gjelder ulike år.') && !(valid && issue.startsWith('D:'))),
      valid ? 'Samlet drift er en egen scenarioforutsetning. Kjente kostnader legges ikke til en gang til; kontroller inkludering og reserver.' : 'Oppgi gyldig samlet månedlig drift. Ukjent drift regnes ikke som null.'] }
}
