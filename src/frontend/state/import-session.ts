import { FinancialFieldSchema } from '../../contracts/financial-input.ts'
import { DocumentImportSchema, ImportHttpResponseSchema, currentImportContext } from '../../contracts/document-import.ts'
import type { DocumentImport } from '../../contracts/document-import.ts'
import { propertyIdentityStatus, importControlOutcome, importEconomyDraft, importGate } from '../../domain/document-import.ts'
import { economyFinancingSuggestion, economySuggestions, effectiveEconomyFields } from '../../domain/source-economy.ts'
import { createInitialSession } from './session.ts'
import type { SessionState } from './session.ts'
import { createReportState } from './report.ts'
import { createProspectusState, emptySlot, technicalImport } from './prospectus.ts'
import type { ProspectusAction } from './prospectus.ts'

function bindReport(state: SessionState): SessionState {
  const p = state.prospectus, outcome = technicalImport(p)
  if (!outcome) return state
  const selected = p.report.selected ?? p.prospectus.selected
  if (!selected || selected.hash !== outcome.reportHash) return state
  const conflict = Boolean(p.prospectus.outcome && propertyIdentityStatus(p.prospectus.outcome, p.report.outcome) === 'conflict')
  return { ...state, report: { ...state.report, mode: 'demo', status: 'completed', selected, active: null, error: null,
    outcome: importControlOutcome(outcome), documentImport: outcome,
    documentImportGate: importGate(outcome, p.coverageRevision, p.identityChecked, p.areaChecked, conflict) } }
}
function autofill(state: SessionState, controlled = false): SessionState {
  const p = state.prospectus, outcome = p.prospectus.outcome
  if (!outcome) return state
  const draft = importEconomyDraft(outcome, p.corrections, p.completeOperatingCosts)
  const suggested = economySuggestions(draft, { requireReview: controlled, sourceLabel: 'Dokument' })
  const financial = { ...state.financial }, sources = { ...state.sources }
  const replaced = new Set<string>()
  const correctionNotes = Object.entries(p.corrections).filter(([, correction]) => correction.note.trim()).map(([id, correction]) => `${id}: ${correction.note.trim()}`).join('; ')
  const correctionDescription = correctionNotes ? ` Brukerrettinger: ${correctionNotes}.` : ''
  if (!state.listing.manualFields.includes('P')) {
    replaced.add('P')
    financial.P = { rawValue: suggested.P ?? '', confirmed: false }
    sources.P = { kind: 'source', description: `Salgsoppgave ${outcome.documentName}, SHA-256 ${outcome.reportHash}. Dokumentets prisantydning med eksplisitt fellesgjeld; ikke avtalt kjøpesum. Kildeutdrag er bevart i importen.${correctionDescription}`, conflict: null }
  }
  if (controlled) {
    const financing = economyFinancingSuggestion(draft, p.financing, state.listing.manualFields.includes('P') ? state.financial.P.rawValue : undefined, 'Dokument')
    for (const field of ['D', 'J'] as const) {
      if (state.listing.manualFields.includes(field)) continue
      const value = field === 'D' ? suggested.D : financing.J
      replaced.add(field)
      financial[field] = { rawValue: value ?? '', confirmed: false, period: value === null ? '' : 'year', year: value === null ? '' : field === 'D' ? suggested.year ?? '' : p.financing.year }
      sources[field] = { kind: field === 'J' ? 'assumption' : 'source', description: `Salgsoppgave ${outcome.documentName}, SHA-256 ${outcome.reportHash}. Kontrollerte kostnader${field === 'J' ? ` og finansiering: egenkapital ${p.financing.equity}, rente ${p.financing.annualInterest} %, ${p.financing.months} måneder` : ''}; original og rettinger er bevart.${correctionDescription}`, conflict: null }
    }
  }
  return { ...state, financial, sources, financialRevision: state.financialRevision + 1,
    explicitZeros: state.explicitZeros.filter(field => !replaced.has(field)), changedFields: [...new Set([...state.changedFields, ...FinancialFieldSchema.options.filter(field => state.financial[field].confirmed && !financial[field].confirmed)])] }
}
function invalidateImported(state: SessionState, financingOnly = false): SessionState {
  if (financingOnly) {
    if (state.listing.manualFields.includes('J')) return { ...state, financialRevision: state.financialRevision + 1 }
    return { ...state, financial: { ...state.financial, J: { rawValue: '', period: '', year: '', confirmed: false } },
      explicitZeros: state.explicitZeros.filter(field => field !== 'J'), financialRevision: state.financialRevision + 1,
      changedFields: state.financial.J.confirmed ? [...new Set([...state.changedFields, 'J' as const])] : state.changedFields }
  }
  let next = autofill(state)
  const financial = { ...next.financial }, invalidated = new Set<string>()
  const manuallyOwnedCosts = state.listing.manualFields.includes('D') || state.listing.manualFields.includes('J')
  for (const field of ['D', 'J'] as const) if (!state.listing.manualFields.includes(field)) {
    financial[field] = { rawValue: '', confirmed: false, period: '', year: '' }; invalidated.add(field)
  }
  next = { ...next, financial, explicitZeros: next.explicitZeros.filter(field => !invalidated.has(field)),
    costItems: manuallyOwnedCosts ? state.costItems : next.costItems.filter(item => !item.id.startsWith('import-')), financialRevision: next.financialRevision + 1 }
  return next
}
export function reduceImportSession(state: SessionState, action: ProspectusAction): SessionState {
  const p = state.prospectus
  if (action.type === 'import-economy-result') {
    const slot = p.prospectus
    if (action.generation !== p.generation || slot.status !== 'imported' || slot.selected?.hash !== action.documentHash || slot.outcome?.reportHash !== action.documentHash) return state
    const parsed = DocumentImportSchema.safeParse(action.outcome)
    if (!parsed.success) return state
    const outcome = parsed.data
    if (outcome.role !== 'prospectus' || outcome.reportHash !== action.documentHash || outcome.documentName !== slot.selected.file.name.trim()
      || outcome.economy.analysis?.provenance !== 'live-document' || outcome.economy.analysis.requestDigest !== action.requestDigest) return state
    const next = { ...state, resultSnapshot: null, resultChanges: [], prospectus: { ...p,
      prospectus: { ...slot, outcome }, corrections: Object.fromEntries(Object.entries(p.corrections).map(([id, correction]) => [id, { ...correction, reviewed: false }])), completeOperatingCosts: false,
      coverageRevision: p.coverageRevision + 1, identityChecked: false, areaChecked: false } }
    return invalidateImported(bindReport(next))
  }
  if (action.type === 'import-selecting') {
    if (action.generation <= p.generation) return state
    // Selection invalidates in-flight requests immediately; same-hash completion restores existing assessment.
    return { ...state, prospectus: { ...p, generation: action.generation, [action.role]: { ...p[action.role], status: 'selecting', active: null, error: null } } }
  }
  if (action.type === 'import-selected') {
    if (action.generation !== p.generation || p[action.role].status !== 'selecting') return state
    const slot = p[action.role]
    const context = slot.outcome
    const compatible = currentImportContext(context, action.role)
    if (slot.selected?.hash === action.selected.hash && compatible) return { ...state, prospectus: { ...p, [action.role]: { ...slot, status: 'imported', active: null, error: null } } }
    if (slot.selected?.hash === action.selected.hash && context && !compatible) return { ...state, prospectus: { ...p, [action.role]: { ...slot, status: 'failed', active: null, error: 'incompatible-context' } } }
    if (action.role === 'prospectus') {
      const clean = createInitialSession(state.report.mode)
      return { ...clean, prospectus: { ...createProspectusState(), generation: p.generation,
        prospectus: { ...emptySlot(), status: 'ready', selected: action.selected } }, report: { ...clean.report, generation: state.report.generation + 1 } }
    }
    if (!p.prospectus.selected) return state
    return { ...state, resultSnapshot: null, resultChanges: [], report: { ...createReportState('demo'), generation: state.report.generation + 1 },
      prospectus: { ...p, report: { ...emptySlot(), status: 'ready', selected: action.selected }, identityChecked: false, areaChecked: false, coverageRevision: p.coverageRevision + 1 } }
  }
  if (action.type === 'import-restore-integrated') {
    if (!p.report.selected || !p.prospectus.outcome) return state
    return bindReport({ ...state, resultSnapshot: null, resultChanges: [],
      report: { ...createReportState('demo'), generation: state.report.generation + 1 },
      prospectus: { ...p, generation: p.generation + 1, report: emptySlot(), identityChecked: false, areaChecked: false, coverageRevision: p.coverageRevision + 1 } })
  }
  if (action.type === 'import-start') {
    if (action.correlation.generation !== p.generation || p[action.role].status !== 'ready' || !p[action.role].selected) return state
    return { ...state, prospectus: { ...p, [action.role]: { ...p[action.role], status: 'loading', active: action.correlation, error: null } } }
  }
  if (action.type === 'import-response') {
    const slot = p[action.role], active = slot.active
    if (!active || slot.status !== 'loading' || active.requestId !== action.correlation.requestId || active.sessionId !== action.correlation.sessionId || active.generation !== action.correlation.generation || active.generation !== p.generation) return state
    const parsed = ImportHttpResponseSchema.safeParse(action.body)
    if (!parsed.success || !action.ok || parsed.data.kind === 'rejected') {
      const code = parsed.success && parsed.data.kind === 'rejected' ? parsed.data.code : 'invalid-response'
      return { ...state, prospectus: { ...p, [action.role]: { ...slot, active: null, status: 'failed', error: code } } }
    }
    const { outcome, correlation } = parsed.data
    if (correlation.requestId !== active.requestId || correlation.sessionId !== active.sessionId || correlation.generation !== active.generation
      || outcome.requestId !== active.requestId || outcome.reportHash !== slot.selected?.hash || outcome.documentName !== slot.selected.file.name.trim() || outcome.role !== action.role
      || (action.role === 'report' && outcome.documents[0]?.parentHash !== p.prospectus.selected?.hash)) return { ...state, prospectus: { ...p, [action.role]: { ...slot, active: null, status: 'failed', error: 'metadata-mismatch' } } }
    const imported = { ...state, prospectus: { ...p, [action.role]: { ...slot, active: null, status: 'imported' as const, outcome, error: null } } }
    const bound = bindReport(imported)
    return action.role === 'prospectus' ? autofill(bound) : bound
  }
  if (action.type === 'import-error') {
    if (action.generation !== p.generation) return state
    return { ...state, prospectus: { ...p, [action.role]: { ...p[action.role], status: 'failed', active: null, error: action.code } } }
  }
  if (action.type === 'import-abandon') return { ...state, prospectus: { ...p, generation: p.generation + 1,
    prospectus: p.prospectus.status === 'loading' || p.prospectus.status === 'selecting' ? { ...p.prospectus, status: 'failed', active: null, error: 'interrupted' } : p.prospectus,
    report: p.report.status === 'loading' || p.report.status === 'selecting' ? { ...p.report, status: 'failed', active: null, error: 'interrupted' } : p.report } }
  if (action.type === 'import-identity' || action.type === 'import-area') {
    const current = technicalImport(p)
    if (!current || action.checked && action.type === 'import-area' && current.coverage.technical.status !== 'complete' || action.checked && action.type === 'import-identity' && p.prospectus.outcome && propertyIdentityStatus(p.prospectus.outcome, p.report.outcome) === 'conflict') return state
    const key = action.type === 'import-identity' ? 'identityChecked' : 'areaChecked'
    if (p[key] === action.checked) return state
    return bindReport({ ...state, prospectus: { ...p, [key]: action.checked, coverageRevision: p.coverageRevision + 1 },
      report: { ...state.report, listRevision: state.report.listRevision + 1, listConfirmationRevision: null, tg3Revision: state.report.tg3Revision + 1, tg3Resolutions: [] } })
  }
  if (action.type === 'import-correction') {
    if (!p.prospectus.outcome?.economy.fields.some(field => field.id === action.id)) return state
    return invalidateImported({ ...state, prospectus: { ...p, corrections: { ...p.corrections, [action.id]: action.correction } } })
  }
  if (action.type === 'import-complete-costs') return invalidateImported({ ...state, prospectus: { ...p, completeOperatingCosts: action.complete } })
  if (action.type === 'import-financing') return invalidateImported({ ...state, prospectus: { ...p, financing: { ...p.financing, [action.field]: action.value } } }, true)
  if (action.type === 'import-apply') {
    const outcome: DocumentImport | null = p.prospectus.outcome
    if (!outcome || p.prospectus.status !== 'imported') return state
    const draft = importEconomyDraft(outcome, p.corrections, p.completeOperatingCosts)
    const suggested = economySuggestions(draft, { sourceLabel: 'Dokument' })
    const next = autofill(state, true)
    // Annual normalized explicit posts, sharing the existing D/J validation. Do not install partial cost lists as complete.
    if (suggested.D !== null && !state.listing.manualFields.includes('D') && !state.listing.manualFields.includes('J')) return { ...next,
      costItems: effectiveEconomyFields(draft).filter(field => field.category === 'recurring' && field.amount !== null && field.debtPart !== null).map(field => ({ id: `import-${field.id}`, label: field.label,
        rawAmount: multiplyYear(field.amount!, field.period), rawDebt: multiplyYear(field.debtPart!, field.period), includedIn: field.includedIn ? `import-${field.includedIn}` : null })) }
    return next
  }
  return state
}
import Big from 'big.js'
function multiplyYear(value: string, period: string) { return new Big(value).times(period === 'month' ? '12' : '1').toFixed() }
