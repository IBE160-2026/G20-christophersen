import { ListingResponseSchema } from '../../contracts/listing.ts'
import type { ListingCorrelation, ListingCorrection } from '../../contracts/listing.ts'
import { createListingDraft, listingFinancingSuggestion, listingSuggestions, validateListingImport, validateListingUrl } from '../../domain/listing.ts'
import { createListingState } from './listing.ts'
import type { ListingState } from './listing.ts'
import { createReportState, findingListAssessment, reportReducer } from './report.ts'
import type { ReportAction, ReportState } from './report.ts'
import type {
  FinancialField, RegisteredFinancialInput, RecurringField, RegisteredPeriod,
} from '../../contracts/financial-input.ts'
import { FinancialFieldSchema } from '../../contracts/financial-input.ts'
import { validateFinancialBasis } from '../../domain/financial-basis.ts'
import { parseFinancialDecimal } from '../../domain/validation.ts'
import type { CostItem, FinancialSource, FinancialSources, RentNature } from '../../contracts/financial-basis.ts'
import type { ResultChange, ResultSnapshot } from '../../contracts/result.ts'
import { calculateResultSnapshot, describeResultChange, resultBinding, sameResultBinding } from './result.ts'

export interface SessionState {
  listing: ListingState
  financial: RegisteredFinancialInput
  sources: FinancialSources
  costItems: CostItem[]
  nextCostId: number
  currentStep: 'tallgrunnlag' | 'tilstandsrapport' | 'kontroller-funn' | 'resultat'
  report: ReportState
  financialRevision: number
  changedFields: FinancialField[]
  explicitZeros: FinancialField[]
  confirmationAttempts: number
  resultSnapshot: ResultSnapshot | null
  resultChanges: ResultChange[]
}

export type SessionAction = ReportAction
  | { type: 'listing-url'; url: string }
  | { type: 'listing-start'; correlation: ListingCorrelation }
  | { type: 'listing-response'; correlation: ListingCorrelation; body: unknown; ok: boolean }
  | { type: 'listing-error'; correlation: ListingCorrelation }
  | { type: 'listing-correction'; id: string; correction: ListingCorrection }
  | { type: 'listing-complete-costs'; complete: boolean }
  | { type: 'listing-financing'; field: keyof ListingState['financing']; value: string }
  | { type: 'listing-apply' }
  | { type: 'calculate-result' }
  | { type: 'register-value'; field: FinancialField; rawValue: string }
  | { type: 'register-period'; field: RecurringField; period: RegisteredPeriod }
  | { type: 'register-year'; field: RecurringField; year: string }
  | { type: 'navigate'; step: SessionState['currentStep'] }
  | { type: 'confirm-financial' }
  | { type: 'check-zero'; field: FinancialField; checked: boolean }
  | { type: 'register-source'; field: FinancialField; source: FinancialSource }
  | { type: 'register-rent-nature'; rentNature: RentNature }
  | { type: 'add-cost' }
  | { type: 'change-cost'; id: string; update: Partial<Omit<CostItem, 'id'>> }
  | { type: 'remove-cost'; id: string }

export function createInitialSession(mode: 'demo' | 'live' = 'demo'): SessionState {
  const source = (): FinancialSource => ({ kind: '', description: '', conflict: null })
  return {
    listing: createListingState(),
    financial: {
      P: { rawValue: '', confirmed: false },
      L: { rawValue: '', confirmed: false, period: '', year: '' },
      D: { rawValue: '', confirmed: false, period: '', year: '' },
      J: { rawValue: '', confirmed: false, period: '', year: '' },
      Ymin: { rawValue: '', confirmed: false },
    },
    sources: { P: source(), L: { ...source(), rentNature: '' }, D: source(), J: source(), Ymin: source() },
    costItems: [],
    nextCostId: 1,
    currentStep: 'tallgrunnlag', report: createReportState(mode),
    financialRevision: 0, changedFields: [], explicitZeros: [], confirmationAttempts: 0,
    resultSnapshot: null, resultChanges: [],
  }
}

/** Kandidaten valideres av samme domain-autoritet før bekreftelse kan settes.
 * Den eksplisitte nullkontrollen gjelder bare gjeldende, uendret feltgrunnlag.
 */
export function confirmationCandidate(state: SessionState) {
  let values = { ...state.financial }
  for (const field of FinancialFieldSchema.options) values = { ...values, [field]: {
    ...values[field], confirmed: parseFinancialDecimal(values[field].rawValue) !== '0' || state.explicitZeros.includes(field),
  } }
  return { values, sources: state.sources, costItems: state.costItems }
}

export function isFinancialConfirmed(state: SessionState): boolean {
  return validateFinancialBasis({ values: state.financial, sources: state.sources, costItems: state.costItems }).issues.length === 0
}

function invalidate(state: SessionState, update: Partial<SessionState>, fields: FinancialField[]): SessionState {
  let financial = { ...state.financial, ...(update.financial ?? {}) }
  const changedFields = [...state.changedFields]
  for (const field of fields) {
    if (state.financial[field].confirmed && !changedFields.includes(field)) changedFields.push(field)
    financial = { ...financial, [field]: { ...financial[field], confirmed: false } }
  }
  return { ...state, ...update, financial, changedFields,
    financialRevision: state.financialRevision + 1,
    explicitZeros: state.explicitZeros.filter((field) => !fields.includes(field)),
  }
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  if (action.type === 'calculate-result') return { ...state, resultSnapshot: calculateResultSnapshot(state), resultChanges: [] }
  const next = reduceSession(state, action)
  if (!state.resultSnapshot || sameResultBinding(resultBinding(state), resultBinding(next))) return next
  const change = describeResultChange(action, state)
  return { ...next, resultChanges: [...state.resultChanges.filter(item => item.kind !== change.kind || item.target !== change.target || item.message !== change.message), change] }
}

function reduceSession(state: SessionState, action: SessionAction): SessionState {
  if (action.type === 'listing-url') {
    if (state.listing.url === action.url) return state
    const identity = validateListingUrl(action.url)
    const listing = { ...state.listing, url: action.url, active: null, status: state.listing.status === 'ready' ? 'ready' as const : state.listing.status === 'failed' ? 'failed' as const : 'idle' as const, generation: state.listing.generation + 1, error: null }
    if (!identity || identity.listingCode === state.listing.objectCode) return { ...state, listing }
    const clean = createInitialSession(state.report.mode)
    return invalidate(state, { financial: clean.financial, sources: clean.sources, costItems: [],
      report: { ...clean.report, generation: state.report.generation + 1 },
      listing: { ...createListingState(), url: action.url, objectCode: identity.listingCode, generation: state.listing.generation + 1 }, currentStep: 'tallgrunnlag',
    }, [...FinancialFieldSchema.options])
  }
  if (action.type === 'listing-start') {
    if (action.correlation.generation !== state.listing.generation || !validateListingUrl(state.listing.url) || state.listing.status === 'loading') return state
    return { ...state, listing: { ...state.listing, status: 'loading', active: action.correlation, error: null } }
  }
  if (action.type === 'listing-response' || action.type === 'listing-error') {
    const active = state.listing.active
    if (!active || state.listing.status !== 'loading' || active.generation !== action.correlation.generation || active.requestId !== action.correlation.requestId) return state
    const fail = () => ({ ...state, listing: { ...state.listing, status: 'failed' as const, active: null, error: 'FINN-import er utilgjengelig. Registrer tall og velg PDF manuelt.' } })
    if (action.type === 'listing-error' || !action.ok) return fail()
    const parsed = ListingResponseSchema.safeParse(action.body)
    if (!parsed.success || parsed.data.kind !== 'listing' || parsed.data.correlation.generation !== active.generation || parsed.data.correlation.requestId !== active.requestId) return fail()
    try {
      const original = validateListingImport(parsed.data.listing)
      if (original.listingCode !== validateListingUrl(state.listing.url)?.listingCode) return fail()
      return { ...state, listing: { ...state.listing, status: 'ready', active: null, error: null, draft: state.listing.draft ? { ...createListingDraft(original), corrections: Object.fromEntries(Object.entries(state.listing.draft.corrections).map(([id, correction]) => [id, { ...correction, reviewed: false }])) } : createListingDraft(original) } }
    } catch { return fail() }
  }
  if (action.type === 'listing-correction') {
    if (!state.listing.draft?.original.fields.some(field => field.id === action.id)) return state
    return { ...state, listing: { ...state.listing, draft: { ...state.listing.draft,
      corrections: { ...state.listing.draft.corrections, [action.id]: action.correction } } } }
  }
  if (action.type === 'listing-complete-costs') return state.listing.draft ? { ...state, listing: { ...state.listing,
    draft: { ...state.listing.draft, completeOperatingCosts: action.complete } } } : state
  if (action.type === 'listing-financing') return { ...state, listing: { ...state.listing,
    financing: { ...state.listing.financing, [action.field]: action.value } } }
  if (action.type === 'listing-apply') {
    if (!state.listing.draft || state.listing.status !== 'ready') return state
    const suggested = listingSuggestions(state.listing.draft)
    if (suggested.P === null) return state
    const financing = listingFinancingSuggestion(state.listing.draft, state.listing.financing)
    const year = state.listing.financing.year
    const J = financing.J
    const correctionNotes = Object.entries(state.listing.draft.corrections).filter(([, correction]) => correction.note.trim()).map(([id, correction]) => `${id}: ${correction.note.trim()}`).join('; ')
    const source = { kind: 'source' as const, description: `Kontrollert FINN ${state.listing.draft.original.url}, hentet ${state.listing.draft.original.fetchedAt}. ${correctionNotes ? `Brukerrettinger: ${correctionNotes}. ` : ''}Original og rettinger er bevart i brukt importgrunnlag.`, conflict: null }
    const applied = state.listing.applied
    const ownsD = applied?.D != null && applied.D === state.financial.D.rawValue && applied.sourceD === JSON.stringify(state.sources.D) && applied.periodD === state.financial.D.period && applied.yearD === state.financial.D.year
    const ownsJ = applied?.J != null && applied.J === state.financial.J.rawValue && applied.sourceJ === JSON.stringify(state.sources.J) && applied.periodJ === state.financial.J.period && applied.yearJ === state.financial.J.year
    const useD = suggested.D !== null && (state.financial.D.rawValue.trim() === '' || ownsD)
    const useJ = J !== null && (state.financial.J.rawValue.trim() === '' || ownsJ)
    const clearD = ownsD && suggested.D === null
    const clearJ = ownsJ && J === null
    const fields: FinancialField[] = ['P', ...(useD || clearD ? ['D' as const] : []), ...(useJ || clearJ ? ['J' as const] : [])]
    const next = invalidate(state, { financial: { ...state.financial,
      P: { rawValue: suggested.P, confirmed: false },
      ...(clearD ? { D: { rawValue: '', period: '', year: '', confirmed: false } } : {}),
      ...(clearJ ? { J: { rawValue: '', period: '', year: '', confirmed: false } } : {}),
      ...(useD ? { D: { rawValue: suggested.D!, period: 'year', year: suggested.year!, confirmed: false } } : {}),
      ...(useJ ? { J: { rawValue: J!, period: 'year', year, confirmed: false } } : {}),
    }, sources: { ...state.sources, P: source,
      ...(useD ? { D: source } : {}),
      ...(useJ ? { J: { kind: 'assumption' as const, description: `${source.description} Egenkapital ${state.listing.financing.equity}, rente ${state.listing.financing.annualInterest} %, ${state.listing.financing.months} måneder; øreavrundet månedsbetaling.`, conflict: null } } : {}),
    } }, fields)
    return { ...next, listing: { ...next.listing, applied: { draft: state.listing.draft, financing: { ...state.listing.financing },
      periodD: useD ? next.financial.D.period : applied?.periodD ?? '', yearD: useD ? next.financial.D.year : applied?.yearD ?? '', periodJ: useJ ? next.financial.J.period : applied?.periodJ ?? '', yearJ: useJ ? next.financial.J.year : applied?.yearJ ?? '',
      D: useD ? suggested.D : clearD ? null : applied?.D ?? null, J: useJ ? J : clearJ ? null : applied?.J ?? null, sourceD: useD ? JSON.stringify(next.sources.D) : applied?.sourceD ?? '', sourceJ: useJ ? JSON.stringify(next.sources.J) : applied?.sourceJ ?? '' } } }
  }
  if (action.type === 'report-start' && (!isFinancialConfirmed(state) || state.currentStep === 'tallgrunnlag')) return state
  if (action.type.startsWith('report-')) return { ...state, report: reportReducer(state.report, action as ReportAction) }
  if (action.type === 'navigate') {
    if (action.step === 'resultat') {
      if (state.resultSnapshot) {
        // Alle brukte endringer fornyes først etter relevant kontroll. Utkast
        // er utenfor bindingen; uendret retur beholder det samme snapshotet.
        const changed = state.resultChanges.length > 0 || !sameResultBinding(state.resultSnapshot.binding, resultBinding(state))
        if (changed && isFinancialConfirmed(state) && findingListAssessment(state.report).controlCompleted) {
          return { ...state, currentStep: 'resultat', resultSnapshot: calculateResultSnapshot(state), resultChanges: [] }
        }
        return { ...state, currentStep: 'resultat', report: reportReducer(state.report, { type: 'report-abandon' }) }
      }
      if (!isFinancialConfirmed(state) || !findingListAssessment(state.report).controlCompleted) return state
      return { ...state, currentStep: 'resultat', resultSnapshot: calculateResultSnapshot(state), resultChanges: [] }
    }
    if (action.step === state.currentStep || (action.step !== 'tallgrunnlag' && !isFinancialConfirmed(state))
      || (action.step === 'kontroller-funn' && state.report.status !== 'completed')) return state
    return { ...state, currentStep: action.step, report: reportReducer(state.report, { type: 'report-abandon' }) }
  }
  if (action.type === 'confirm-financial') {
    const candidate = confirmationCandidate(state)
    if (validateFinancialBasis(candidate).issues.length !== 0) return { ...state, confirmationAttempts: state.confirmationAttempts + 1 }
    return { ...state, financial: candidate.values, changedFields: [], confirmationAttempts: state.confirmationAttempts + 1 }
  }
  if (action.type === 'check-zero') {
    if (parseFinancialDecimal(state.financial[action.field].rawValue) !== '0' || state.explicitZeros.includes(action.field) === action.checked) return state
    return { ...state, explicitZeros: action.checked ? [...state.explicitZeros, action.field] : state.explicitZeros.filter((field) => field !== action.field),
      financial: { ...state.financial, [action.field]: { ...state.financial[action.field], confirmed: false } } }
  }
  if (action.type === 'register-source') {
    const source = { ...state.sources[action.field], ...action.source }
    if (JSON.stringify(source) === JSON.stringify(state.sources[action.field])) return state
    return invalidate(state, { sources: { ...state.sources, [action.field]: source } }, [action.field])
  }
  if (action.type === 'register-rent-nature') {
    if (action.rentNature === state.sources.L.rentNature) return state
    return invalidate(state, { sources: { ...state.sources, L: { ...state.sources.L, rentNature: action.rentNature } } }, ['L'])
  }
  if (action.type === 'add-cost' || action.type === 'change-cost' || action.type === 'remove-cost') {
    const costItems = action.type === 'add-cost'
      ? [...state.costItems, { id: `cost-${state.nextCostId}`, label: '', rawAmount: '', rawDebt: '', includedIn: null }]
      : action.type === 'change-cost'
        ? state.costItems.map((item) => item.id === action.id ? { ...item, ...action.update } : item)
        : state.costItems.filter((item) => item.id !== action.id)
    if (JSON.stringify(costItems) === JSON.stringify(state.costItems)) return state
    return invalidate(state, { costItems, nextCostId: state.nextCostId + (action.type === 'add-cost' ? 1 : 0) }, ['D', 'J'])
  }

  if (action.type !== 'register-value' && action.type !== 'register-period' && action.type !== 'register-year') return state
  const value = state.financial[action.field]
  const update = action.type === 'register-value'
    ? { rawValue: action.rawValue }
    : action.type === 'register-period' ? { period: action.period } : { year: action.year }
  if (Object.entries(update).every(([key, content]) => value[key as keyof typeof value] === content)) return state
  // Kostnadspostenes D- og J-bidrag deler perioden/året fra D.
  const affected: FinancialField[] = action.field === 'D' && action.type !== 'register-value' && state.costItems.length > 0
    ? ['D', 'J'] : [action.field]
  return invalidate(state, { financial: { ...state.financial, [action.field]: { ...value, ...update } } }, affected)
}
