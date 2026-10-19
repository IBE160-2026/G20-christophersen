import { KnownDeficiencyInputSchema } from '../contracts/screening.ts'
import type {
  CriticalDeficiency, KnownDeficiencyAssessment, KnownDeficiencyInput, KnownReportDeficiency,
} from '../contracts/screening.ts'
import { validateFinancialBasis } from './financial-basis.ts'

const reportText = {
  'missing-report': {
    message: 'Rapportgrunnlaget mangler',
    action: 'Innhent en støttet tilstandsrapport og fullfør analyse og kontroll av rapportgrunnlaget.',
  },
  'incomplete-report': {
    message: 'Rapportgrunnlaget er ufullført',
    action: 'Avklar den oppgitte rapportmangelen og fullfør analyse og kontroll av gjeldende rapportgrunnlag.',
  },
} as const

function compareReportDeficiencies(a: KnownReportDeficiency, b: KnownReportDeficiency) {
  // Fast kodeorden, deretter tegnorden; ingen miljøavhengig locale eller inputsortering.
  if (a.code !== b.code) return a.code === 'missing-report' ? -1 : 1
  return a.reason < b.reason ? -1 : a.reason > b.reason ? 1 : 0
}

/** Felles prioritet-1-grunnlag for senere screening og lokal mangelvisning.
 * Tomt resultat betyr bare ingen kjente mangler i mottatt delgrunnlag.
 * Funksjonen bekrefter ikke fullstendighet og vurderer ingen økonomiske terskler.
 */
export function evaluateKnownDeficiencies(input: KnownDeficiencyInput): KnownDeficiencyAssessment {
  const basis = KnownDeficiencyInputSchema.parse(input)
  const triggers: CriticalDeficiency[] = basis.financialBasis === undefined ? []
    : validateFinancialBasis(basis.financialBasis).issues.map((entry) => ({ kind: 'financial', ...entry }))

  for (const entry of basis.reportDeficiencies.sort(compareReportDeficiencies)) {
    const text = reportText[entry.code]
    triggers.push({ ...entry, kind: 'report', target: 'report',
      message: `${text.message}: ${entry.reason}`, action: text.action })
  }

  if (triggers.length === 0) return {
    scope: 'known-deficiencies', status: 'no-known-deficiencies',
    recommendation: null, priority: null, triggers: [], explanation: null, nextAction: null,
  }
  return {
    scope: 'known-deficiencies', status: 'information-required',
    recommendation: 'Innhent mer informasjon', priority: 1, triggers,
    explanation: `Kritisk grunnlag er utilstrekkelig. ${triggers.map((entry) => entry.message).join(' ')}`,
    nextAction: `Før ny vurdering: ${triggers.map((entry) => entry.action).join(' ')}`,
  }
}
