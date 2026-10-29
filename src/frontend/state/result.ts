import { FinancialFieldSchema } from '../../contracts/financial-input.ts'
import type { ResultBinding, ResultChange, ResultSelection, ResultSnapshot } from '../../contracts/result.ts'
import { evaluateScreening } from '../../domain/screening.ts'
import { findingListBasis } from './report.ts'
import type { SessionAction, SessionState } from './session.ts'

/** Utkast, visningskontekst og rekkefølgen på kontrollposter er ikke brukt grunnlag. */
export function resultBinding(state: SessionState): ResultBinding {
  const report = state.report
  return {
    documentImport: { prospectusHash: state.prospectus.prospectus.selected?.hash ?? null, reportHash: state.prospectus.report.selected?.hash ?? null,
      inputDigest: (state.prospectus.report.outcome ?? state.prospectus.prospectus.outcome)?.inputDigest ?? null, coverageRevision: state.prospectus.coverageRevision, identityChecked: state.prospectus.identityChecked, areaChecked: state.prospectus.areaChecked },
    financialRevision: state.financialRevision,
    financialConfirmations: Object.fromEntries(FinancialFieldSchema.options.map(field => [field, state.financial[field].confirmed])) as ResultBinding['financialConfirmations'],
    listRevision: report.listRevision, listConfirmationRevision: report.listConfirmationRevision,
    findingConfirmations: report.findingControls.filter(control => control.revision !== 0 || control.confirmedRevision !== null)
      .map(({ findingId, revision, confirmedRevision }) => ({ findingId, revision, confirmedRevision }))
      .sort((a, b) => a.findingId < b.findingId ? -1 : a.findingId > b.findingId ? 1 : 0),
    limitationReviewRevision: report.limitationReviewRevision, tg3Revision: report.tg3Revision,
    report: { generation: report.generation, reportHash: report.selected?.hash ?? null,
      documentName: report.selected?.file.name.trim() ?? null, requestId: report.outcome?.requestId ?? null,
      status: report.status, error: report.error },
  }
}

export function sameResultBinding(a: ResultBinding, b: ResultBinding): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function freezeDeep<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freezeDeep)
    Object.freeze(value)
  }
  return value
}

/** Beregnes synkront fra aktiv økt; kan ikke motta et gammelt eksternt resultat. */
export function calculateResultSnapshot(state: SessionState): ResultSnapshot {
  const reportBasis = findingListBasis(state.report)
  const assessment = evaluateScreening({
    financialBasis: { values: state.financial, sources: state.sources, costItems: state.costItems },
    reportBasis: { ...reportBasis, controls: reportBasis.controls.map(control => ({ ...control, draft: null, errors: {} })) },
  })
  return freezeDeep({ binding: resultBinding(state), assessment })
}

export function selectResult(state: SessionState): ResultSelection {
  const unusedDraftFindingIds = state.report.findingControls.filter(control => control.draft !== null).map(control => control.findingId)
  if (!state.resultSnapshot) return { status: 'not-calculated', label: 'Ikke beregnet', snapshot: null, unusedDraftFindingIds }
  if (state.resultChanges.length === 0 && sameResultBinding(state.resultSnapshot.binding, resultBinding(state))) {
    return { status: 'current', label: 'Gjeldende', snapshot: state.resultSnapshot, unusedDraftFindingIds }
  }
  const financialConfirmed = FinancialFieldSchema.options.every(field => state.financial[field].confirmed)
  const changes = state.resultChanges.map(change => change.kind === 'financial' && financialConfirmed
    ? { ...change, nextAction: 'Tallgrunnlaget er bekreftet. Beregn resultatet på nytt fra gjeldende grunnlag.' } : change)
  return { status: 'historical', label: 'Utdatert', snapshot: state.resultSnapshot, changes, unusedDraftFindingIds }
}

/** Kalles bare etter en faktisk endring av bindingen. Bekreftelsesregler eies fortsatt av Epic 1/2. */
export function describeResultChange(action: SessionAction, before: SessionState): ResultChange {
  if (action.type.startsWith('import-')) return { kind: 'report', target: 'document-import', message: 'Dokument-, økonomi- eller dekningsgrunnlaget er endret.', nextAction: 'Kontroller tall, rapportområde, tilhørighet og funn før ny vurdering.' }
  if (action.type === 'listing-url' || action.type === 'listing-apply' || action.type === 'listing-response') return { kind: 'financial', target: 'listing',
    message: action.type === 'listing-url' ? 'Objektlenken er endret; tidligere tall og rapport tilhører ikke det nye objektet.' : action.type === 'listing-response' ? 'Kildestøttet FINN-grunnlag er fylt inn som ubekreftet.' : 'Kontrollert FINN-grunnlag og finansieringsforutsetninger er brukt.',
    nextAction: 'Kontroller og bekreft gjeldende tall og rapportgrunnlag før ny vurdering.' }
  if ('field' in action && !action.type.startsWith('report-')) {
    const detail = { 'register-value': 'verdi', 'register-period': 'periode', 'register-year': 'år',
      'register-source': 'kilde eller kildekonflikt', 'check-zero': 'nullbekreftelse' }[action.type as string] ?? 'grunnlag'
    const affected = action.field === 'D' && (action.type === 'register-period' || action.type === 'register-year') && before.costItems.length > 0
      ? 'D og J' : action.field
    return { kind: 'financial', target: action.field, message: `${action.field}: ${detail} er endret.`,
      nextAction: `Kontroller og bekreft berørt tallgrunnlag for ${affected}, og beregn resultatet på nytt.` }
  }
  if (action.type === 'register-rent-nature') return { kind: 'financial', target: 'L', message: 'L: leiegrunnlaget er endret.',
    nextAction: 'Kontroller og bekreft leiegrunnlaget, og beregn resultatet på nytt.' }
  if (action.type === 'add-cost' || action.type === 'change-cost' || action.type === 'remove-cost') return {
    kind: 'financial', target: 'D/J', message: `Kostnadsinnhold for D/J er endret${'id' in action ? ` (${action.id})` : ''}.`,
    nextAction: 'Kontroller kostnadsinnhold og D/J-fordeling, bekreft berørte tall og beregn resultatet på nytt.',
  }
  if (action.type === 'report-tg3-register') return { kind: 'tg3', target: action.findingId,
    message: `${action.findingId}: TG3-${{ status: 'status', reason: 'begrunnelse', basis: 'grunnlag' }[action.field]} er endret.`,
    nextAction: 'Kontroller registrert TG3-avklaring mot gjeldende rapportforhold etter FR-5, og beregn resultatet på nytt.' }
  if (action.type === 'report-limitation-review' || action.type === 'report-limitation-revoke') return { kind: 'report', target: 'limitation',
    message: 'Brukerens vurdering av en generell rapportbegrensning er endret.',
    nextAction: 'Kontroller begrensningen og gjeldende begrunnelse, og beregn resultatet på nytt.' }
  if ('findingId' in action) return { kind: action.type === 'report-finding-confirm' ? 'confirmation' : 'finding', target: action.findingId,
    message: `${action.findingId}: ${action.type === 'report-finding-reject' ? 'funnet er avvist' : action.type === 'report-finding-confirm' ? 'enkeltfunnkontrollen er bekreftet' : 'korrigering er brukt'}.`,
    nextAction: action.type === 'report-finding-reject'
      ? 'Kontroller og bekreft gjeldende funnliste, og beregn resultatet på nytt.'
      : 'Kontroller gjeldende funn og bekreft funnlisten, og beregn resultatet på nytt.' }
  if (action.type === 'confirm-financial' || action.type === 'report-list-confirm') return { kind: 'confirmation',
    target: action.type === 'confirm-financial' ? 'financial' : 'list',
    message: action.type === 'confirm-financial' ? 'Tallgrunnlaget er bekreftet på nytt.' : 'Gjeldende funnliste er bekreftet.',
    nextAction: 'Beregn resultatet på nytt fra gjeldende bekreftelser og grunnlag.' }
  return { kind: 'report', target: 'report', message: action.type === 'report-selecting' || action.type === 'report-selected'
    ? 'Rapporten er erstattet; tidligere rapportkontroll gjelder ikke den nye rapporten.' : 'Rapportens analysegrunnlag eller analysestatus er endret.',
  nextAction: 'Fullfør analyse og kontroll av gjeldende rapport, bekreft funnlisten og beregn resultatet på nytt.' }
}
