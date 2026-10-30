import Big from 'big.js'
import type { RecurringField } from '../../contracts/financial-input.ts'
import type { FinancialIssue } from '../../contracts/financial-validation.ts'
import type { ScenarioBasis, ScenarioValue } from '../../domain/financial-scenario.ts'
import { validateFinancialBasis } from '../../domain/financial-basis.ts'
import { importEconomyDraft } from '../../domain/document-import.ts'
import { economySuggestions, effectiveEconomyFields } from '../../domain/source-economy.ts'
import { validateListingUrl } from '../../domain/listing.ts'
import type { SessionState } from './session.ts'

const Decimal = Big()
Decimal.strict = true
const onlyControlPending = (issue: FinancialIssue) => issue.code === 'unconfirmed-value' || issue.code === 'unconfirmed-zero'

/** Read-only adapter. Unconfirmed candidates stay unconfirmed; conflicts never become assumptions. */
export function selectScenarioBasis(session: SessionState): ScenarioBasis {
  const slot = session.prospectus.prospectus
  const listingDraft = session.listing.draft
  const staleDocument = (slot.selected !== null || slot.status === 'selecting')
    && (slot.status !== 'imported' || !slot.outcome || slot.selected?.hash !== slot.outcome.reportHash)
  const staleListing = listingDraft !== null && (session.listing.status !== 'ready'
    || validateListingUrl(session.listing.url)?.listingCode !== listingDraft.original.listingCode)
  if (staleDocument || staleListing) return { P: null, L: null, D: null, cashRequired: null, sharedAnnualPayment: null, year: null,
    issues: ['Dokument-/importgrunnlaget er ikke gjeldende. Fullfør importen før et nytt scenario vises.'],
    provenance: { P: 'Ukjent', L: 'Ukjent', D: 'Ukjent', cashRequired: 'Ukjent', sharedAnnualPayment: 'Ukjent' } }
  const input = { values: session.financial, sources: session.sources, costItems: session.costItems }
  // Each value keeps its own year dependencies; an invalid J never removes yield.
  const independent = validateFinancialBasis(input, [])
  const issues: string[] = []
  const fieldIssues: Partial<Record<'P' | 'L' | 'D', string[]>> = {}
  const provenance: Record<ScenarioValue, string> = { P: 'Ukjent', L: 'Ukjent', D: 'Ukjent', cashRequired: 'Ukjent', sharedAnnualPayment: 'Ukjent' }
  const value = (field: 'P' | 'L' | 'D'): string | null => {
    const validated = independent.fields[field]
    const blocking = validated.issues.filter(issue => !onlyControlPending(issue))
    const source = session.sources[field]
    if (source.kind && source.description.trim()) provenance[field] = `${source.kind === 'source' ? 'Oppgitt kilde' : 'Egen forutsetning'}: ${source.description}`
    if (blocking.length) { fieldIssues[field] = blocking.map(issue => `${issue.message} ${issue.action}`); return null }
    return 'normalization' in validated ? validated.normalization?.annualValue ?? null : validated.decimal
  }
  let P = value('P'), D = value('D')
  const L = value('L')
  const yearFor = (field: RecurringField) => independent.fields[field].normalization?.year ?? null
  let year = yearFor('L') ?? yearFor('D')
  if (L !== null && D !== null && yearFor('L') !== yearFor('D')) {
    D = null
    issues.push('Leie og driftskostnader gjelder ulike år. Nettoyield og kontantstrøm kan ikke beregnes.')
  }
  let cashRequired: string | null = null, sharedAnnualPayment: string | null = null
  const outcome = slot.status === 'imported' && slot.selected?.hash === slot.outcome?.reportHash ? slot.outcome : null
  const listing = session.listing.status === 'ready' ? listingDraft : null
  const draft = outcome ? importEconomyDraft(outcome, session.prospectus.corrections, session.prospectus.completeOperatingCosts) : listing
  if (draft) {
    const suggested = economySuggestions(draft, { requireReview: false, sourceLabel: outcome ? 'Dokument' : 'FINN' })
    const label = outcome ? `Fra salgsoppgave ${outcome.documentName} · kildekontroll kan gjenstå` : `Fra FINN ${listing!.original.url} · kildekontroll kan gjenstå`
    // An entered invalid/conflicting/manual value is never silently replaced by an import candidate.
    if (session.financial.P.rawValue.trim() === '' && !session.sources.P.conflict && !session.listing.manualFields.includes('P') && suggested.P !== null) { P = suggested.P; provenance.P = label }
    if (session.financial.D.rawValue.trim() === '' && !session.sources.D.conflict && !independent.fields.D.issues.some(issue => issue.target === 'cost') && !session.listing.manualFields.includes('D') && suggested.D !== null
      && (yearFor('L') === null || yearFor('L') === suggested.year)) { D = suggested.D; provenance.D = label; year ??= suggested.year }
    // A different manual price cannot borrow purchase funding from the original listing.
    const priceMatches = P !== null && suggested.P !== null && new Decimal(P).eq(suggested.P)
    if (priceMatches) {
      cashRequired = suggested.cashRequired
      sharedAnnualPayment = suggested.sharedAnnualPayment
      provenance.cashRequired = label
      provenance.sharedAnnualPayment = label
      const debt = effectiveEconomyFields(draft).find(field => field.id === 'sharedDebtPayment')
      if (sharedAnnualPayment !== null && sharedAnnualPayment !== '0' && (year === null || debt?.year !== year)) {
        sharedAnnualPayment = null
        issues.push('Fellesgjeldsbetaling må gjelde samme år som scenarioets leie og drift.')
      }
    } else issues.push('Registrert pris og dokumentets prisgrunnlag er ikke avstemt. Dokumentets kontantbehov brukes ikke.')
    issues.push(...suggested.issues.filter(issue => !(D !== null && issue.startsWith('Full D '))
      && !(sharedAnnualPayment !== null && issue.startsWith('Full J '))))
  }
  // Missing values remain null. This selector never dispatches, changes a revision or confirms a field.
  for (const [field, amount] of Object.entries({ P, L, D })) if (amount === null) issues.push(...(fieldIssues[field as 'P' | 'L' | 'D'] ?? []))
  return { P, L, D, cashRequired, sharedAnnualPayment, year, issues: [...new Set(issues)], provenance }
}
