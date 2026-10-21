import { KnownDeficiencyInputSchema } from '../contracts/screening.ts'
import type {
  CriticalDeficiency, KnownDeficiencyAssessment, KnownDeficiencyInput, KnownReportDeficiency,
  EconomicScreeningTrigger, ScreeningAssessment, ScreeningInput,
} from '../contracts/screening.ts'
import { validateTg3Resolution } from './tg3-resolution.ts'
import { validateFinancialBasis } from './financial-basis.ts'
import { assessFindingList } from './finding-control.ts'
import { calculateFinancialMetrics } from './finance.ts'
import { evaluateCashFlowThreshold, evaluateNetYieldThreshold } from './thresholds.ts'

const reportText = {
  'unresolved-tg3': {
    message: 'Alvorlig TG3 er uavklart',
    action: 'Innhent konkret avklaringsgrunnlag for det navngitte TG3-forholdet og registrer status og begrunnelse for førstevurdering.',
  },
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
  if (a.code !== b.code) return ['missing-report', 'incomplete-report', 'unresolved-tg3'].indexOf(a.code) - ['missing-report', 'incomplete-report', 'unresolved-tg3'].indexOf(b.code)
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

  const reportDeficiencies = [...basis.reportDeficiencies]
  for (const finding of basis.tg3Findings) {
    if (finding.current.grade !== 'TG3') continue
    const validation = validateTg3Resolution(finding.current, finding.resolution)
    if (!validation.applicable) reportDeficiencies.push({ code: 'unresolved-tg3',
      reason: `${finding.findingId}: ${finding.current.description} (${finding.current.source.documentName}, PDF-side ${finding.current.source.pdfPage}). ${Object.values(validation.errors).join(' ')}` })
  }
  for (const entry of reportDeficiencies.sort(compareReportDeficiencies)) {
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
    nextAction: `Før ny vurdering: ${[...new Set(triggers.map((entry) => entry.action))].join(' ')}`,
  }
}

/** Én ren fullscreening. Alle gyldighets- og økonomiregler eies av eksisterende
 * felles funksjoner; denne funksjonen velger bare avgjørende prioritet og fast tekst.
 */
export function evaluateScreening(input: ScreeningInput): ScreeningAssessment {
  const basis = structuredClone(input)
  const report = assessFindingList(basis.reportBasis)
  const deficiencies = evaluateKnownDeficiencies({ financialBasis: basis.financialBasis,
    reportDeficiencies: report.reportDeficiencies, tg3Findings: basis.reportBasis.tg3Findings })
  const support = {
    scope: 'screening' as const, basis,
    metrics: calculateFinancialMetrics(basis.financialBasis),
    thresholds: { netYield: evaluateNetYieldThreshold(basis.financialBasis),
      cashFlow: evaluateCashFlowThreshold(basis.financialBasis) },
  }
  if (deficiencies.status === 'information-required') {
    return { ...deficiencies, ...support, partialBasis: true }
  }

  const { netYield, cashFlow } = support.thresholds
  // Felles mangelautoritet må ha fanget alt som hindrer terskelavgjørelse.
  if (netYield.decision.status === 'unavailable' || cashFlow.decision.status === 'unavailable') {
    throw new Error('Tilstrekkelig kritisk grunnlag må ha vurderbare økonomiske terskler.')
  }
  const economic: EconomicScreeningTrigger[] = [
    { kind: 'economic', target: 'netYield', threshold: netYield,
      code: netYield.decision.status === 'breached' ? 'net-yield-below-minimum' : 'net-yield-requirement-met',
      message: netYield.decision.status === 'breached'
        ? 'Nettoyield er lavere enn ditt avkastningskrav.' : 'Nettoyield oppfyller ditt avkastningskrav.' },
    { kind: 'economic', target: 'cashFlowBeforeTax', threshold: cashFlow,
      code: cashFlow.decision.status === 'breached' ? 'negative-cash-flow' : 'cash-flow-nonnegative',
      message: cashFlow.decision.status === 'breached'
        ? 'Kontantstrøm før skatt er negativ.' : 'Kontantstrøm før skatt er null eller positiv.' },
  ]
  const breached = economic.filter(trigger => trigger.threshold.decision.status === 'breached')
  if (breached.length > 0) return {
    ...support, status: 'rejected', recommendation: 'Forkast', priority: 2, partialBasis: false,
    triggers: breached,
    explanation: `Økonomiske minimumskrav er ikke oppfylt. ${breached.map(trigger => trigger.message).join(' ')}`,
    nextAction: 'Forkast objektet på det gjeldende screeninggrunnlaget.',
  }
  const technical = { kind: 'technical' as const, code: 'technical-basis-sufficient' as const,
    target: 'report' as const, message: 'Teknisk grunnlag er tilstrekkelig for førstevurdering.' }
  return {
    ...support, status: 'proceed', recommendation: 'Gå videre', priority: 3, partialBasis: false,
    triggers: [...economic, technical],
    explanation: [...economic, technical].map(trigger => trigger.message).join(' '),
    nextAction: 'Gå videre til grundigere vurdering/befaring.',
  }
}
