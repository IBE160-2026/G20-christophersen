import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { AnalysisOutcomeSchema } from '../../src/contracts/document-analysis.ts'
import type { AnalysisOutcome } from '../../src/contracts/document-analysis.ts'
import { LimitationReviewSchema } from '../../src/contracts/finding-control.ts'
import type { LimitationReview } from '../../src/contracts/finding-control.ts'
import { applicableLimitationReview } from '../../src/domain/finding-control.ts'
import { findingListAssessment, findingListBasis, reportDeficiencies, reportReducer } from '../../src/frontend/state/report.ts'
import type { ReportState } from '../../src/frontend/state/report.ts'
import { calculateResultSnapshot, selectResult } from '../../src/frontend/state/result.ts'
import type { SessionState } from '../../src/frontend/state/session.ts'
import { sessionReducer } from '../../src/frontend/state/session.ts'
import { screeningState } from '../helpers/screening-state.ts'

// Bevarte originaler leses offline; dette er aldri et nytt live- eller S5-bevis.
function original(caseId: 'F1' | 'F2' | 'F4' = 'F1'): SessionState {
  const outcome = AnalysisOutcomeSchema.parse(JSON.parse(readFileSync(new URL(`../../.docs/implementation-artifacts/story-4-4/${caseId}-outcome.json`, import.meta.url), 'utf8')))
  const base = screeningState({ report: caseId === 'F4' ? 'tg3' : undefined, values: caseId === 'F2' ? { L: '1400000' } : {} })
  const bytes = new Uint8Array(readFileSync(new URL(`../fixtures/property-cases/${caseId}-tilstandsrapport.pdf`, import.meta.url)))
  let report: ReportState = { ...base.report, mode: 'live', selected: { bytes, hash: outcome.reportHash, file: new File([bytes], outcome.documentName) }, outcome, findingControls: [], listConfirmationRevision: null }
  if (outcome.status !== 'completed') throw new Error('Fullført original forventet')
  for (const finding of outcome.findings) report = reportReducer(report, { type: 'report-finding-confirm', generation: report.generation, findingId: finding.findingId })
  if (caseId === 'F4') for (const finding of outcome.findings.filter(item => item.grade === 'TG3')) report = reportReducer(report,
    { type: 'report-tg3-register', generation: report.generation, findingId: finding.findingId, field: 'status', value: 'unresolved' })
  report = reportReducer(report, { type: 'report-list-confirm', generation: report.generation, reportHash: outcome.reportHash, documentName: outcome.documentName, listRevision: report.listRevision })
  return { ...base, report, resultSnapshot: null }
}
function review(report: ReportState, index = 0): LimitationReview {
  if (report.outcome?.status !== 'completed') throw new Error('Fullført original forventet')
  return { index, original: report.outcome.limitations[index]!, declaration: 'general-noncritical', reason: 'Kontrollert mot alle originalsider; fiktivt opphav er generell informasjon, ikke manglende kritisk rapportgrunnlag.',
    reportHash: report.outcome.reportHash, documentName: report.outcome.documentName, requestId: report.outcome.requestId,
    listRevision: report.listRevision, tg3Revision: report.tg3Revision }
}
function save(report: ReportState, value = review(report)) {
  return reportReducer(report, { type: 'report-limitation-review', generation: report.generation, review: value })
}

describe('Story 4.4 — eksplisitt brukervurdering av generell begrensning', () => {
  it.each([['F1', 'Gå videre'], ['F2', 'Forkast']] as const)('offline originalreplay %s: originaler/S2 urørt, korrekt kodeutfall først etter eksplisitt vurdering', (id, recommendation) => {
    const before = original(id)
    const bytesBefore = JSON.stringify(before.report.outcome)
    expect(calculateResultSnapshot(before).assessment.recommendation).toBe('Innhent mer informasjon')
    const report = save(before.report)
    expect(report.outcome).toBe(before.report.outcome)
    expect(JSON.stringify(report.outcome)).toBe(bytesBefore)
    expect(report.limitationReviews[0]).toMatchObject({ declaration: 'general-noncritical' })
    expect(calculateResultSnapshot({ ...before, report }).assessment.recommendation).toBe(recommendation)
  })
  it.each(['reason', 'declaration', 'index', 'original', 'reportHash', 'documentName', 'requestId', 'listRevision', 'tg3Revision'] as const)('avviser ugyldig/tom/stale %s uten å endre state', field => {
    const { report } = original()
    const value = { ...review(report), [field]: field === 'index' || field === 'listRevision' || field === 'tg3Revision' ? 99 : field === 'reason' ? '  ' : 'feil' } as unknown as LimitationReview
    expect(save(report, value)).toBe(report)
  })
  it('runtimekontrakt krever erklæring og eksplisitt begrunnelse; ingen automatisk vurdering fra tom/ukjent input', () => {
    expect(LimitationReviewSchema.safeParse({}).success).toBe(false)
    const { report } = original()
    expect(applicableLimitationReview(findingListBasis(report), 0)).toBeNull()
    expect(save(report, { ...review(report), reason: '  Kontrollert mot original  ' }).limitationReviews[0]?.reason).toBe('Kontrollert mot original')
    expect(reportReducer(report, { type: 'report-limitation-review', generation: report.generation - 1, review: review(report) })).toBe(report)
  })
  it('anvendbarhet kontrolleres også i domain, ikke bare gjennom UI/reducer', () => {
    const report = save(original().report)
    const basis = findingListBasis(report)
    for (const changed of [
      { ...basis, reportIdentity: { reportHash: 'b'.repeat(64), documentName: 'annen.pdf' } },
      { ...basis, listRevision: basis.listRevision + 1 },
      { ...basis, tg3Revision: basis.tg3Revision + 1 },
      { ...basis, error: 'unknown-readability' },
      { ...basis, limitationReviews: [{ ...report.limitationReviews[0]!, reason: ' ' }] },
    ]) expect(applicableLimitationReview(changed, 0)).toBeNull()
  })
  it('funn-/TG3-revisjon ugyldiggjør; navigasjon og kildevisning bevarer uendret vurdering', () => {
    let report = save(original().report)
    const findingId = report.outcome!.status === 'completed' ? report.outcome!.findings[0]!.findingId : ''
    const viewed = reportReducer(report, { type: 'report-view', generation: report.generation, view: { findingId, pdfPage: 2, zoom: 1 } })
    expect(applicableLimitationReview(findingListBasis(viewed), 0)).not.toBeNull()
    report = reportReducer(report, { type: 'report-finding-reject', generation: report.generation, findingId })
    expect(report.limitationReviews).toHaveLength(1)
    expect(applicableLimitationReview(findingListBasis(report), 0)).toBeNull()
    expect(reportDeficiencies(report).status).toBe('information-required')
    const tg3Report = save(original('F4').report)
    const tg3Id = tg3Report.outcome?.status === 'completed' ? tg3Report.outcome.findings.find(item => item.grade === 'TG3')!.findingId : ''
    const changed = reportReducer(tg3Report, { type: 'report-tg3-register', generation: tg3Report.generation, findingId: tg3Id, field: 'reason', value: 'Ny opplysning' })
    expect(applicableLimitationReview(findingListBasis(changed), 0)).toBeNull()
  })
  it('ny rapport eller endret original/request gjør vurderingen uanvendbar', () => {
    const report = save(original().report)
    const selected = reportReducer(report, { type: 'report-selecting', generation: report.generation + 1 })
    expect(selected.limitationReviews).toEqual([])
    if (report.outcome?.status !== 'completed') throw new Error('fixture')
    for (const outcome of [{ ...report.outcome, requestId: 'new-request' }, { ...report.outcome, limitations: ['Annen begrensning'] }]) {
      expect(applicableLimitationReview(findingListBasis({ ...report, outcome }), 0)).toBeNull()
    }
  })
  it('Uavklart TG3 forblir prioritet 1 selv om alle generelle begrensninger vurderes; kontroll kan fullføres', () => {
    const state = original('F4')
    let report = state.report
    if (report.outcome?.status !== 'completed') throw new Error('fixture')
    const count = report.outcome.limitations.length
    for (let index = 0; index < count; index++) report = save(report, review(report, index))
    expect(findingListAssessment(report).controlCompleted).toBe(true)
    const result = calculateResultSnapshot({ ...state, report }).assessment
    expect(result.recommendation).toBe('Innhent mer informasjon')
    expect(result.triggers.some(item => 'code' in item && item.code === 'unresolved-tg3')).toBe(true)
  })
  it.each(['unreadable-text', 'unknown-readability', 'incomplete-text', 'timeout'] as const)('ekte %s-feil kan aldri gjøres til fullført/tilstrekkelig analyse', code => {
    const state = original()
    const report = save(state.report)
    const outcome: AnalysisOutcome = { ...report.outcome!, status: 'failed', error: code === 'timeout' ? { kind: 'analysis', code, reason: 'Kritisk feil', target: null }
      : { kind: 'document', code, reason: 'Kritisk feil', target: { kind: 'page', pdfPage: 2 } }, partialResult: null }
    const failed: ReportState = { ...report, status: 'failed', error: code, outcome }
    expect(save(failed, report.limitationReviews[0]!)).toBe(failed)
    expect(applicableLimitationReview(findingListBasis(failed), 0)).toBeNull()
    expect(calculateResultSnapshot({ ...state, report: failed }).assessment.recommendation).toBe('Innhent mer informasjon')
  })
  it('uløst kritisk kandidat, ubekreftet liste og finansmangel/konflikt består uavhengig', () => {
    const state = original()
    const report = save(state.report)
    if (report.outcome?.status !== 'completed') throw new Error('fixture')
    const uncertain = { ...report.outcome.findings[0]!.original, uncertainties: ['Kritisk kildekonflikt'] }
    const withUncertainty: ReportState = { ...report, outcome: { ...report.outcome, uncertainCandidates: [{ kind: 'uncertain', findingId: 'usikker', original: uncertain, issues: [{ code: 'reported-uncertainty', reason: 'Kritisk kildekonflikt' }] }] } }
    expect(reportDeficiencies(withUncertainty).triggers.some(item => item.message.includes('Kritisk kildekonflikt'))).toBe(true)
    expect(reportDeficiencies({ ...report, listConfirmationRevision: null }).status).toBe('information-required')
    for (const changed of [sessionReducer({ ...state, report }, { type: 'register-value', field: 'L', rawValue: '' }),
      sessionReducer({ ...state, report }, { type: 'register-source', field: 'L', source: { kind: 'source', description: 'Kontroll', conflict: { rawValue: '1800000', description: 'Motstridende kritisk leie' } } })]) {
      expect(calculateResultSnapshot(changed).assessment.recommendation).toBe('Innhent mer informasjon')
    }
  })
  it('vurdering gjelder bare én begrensning; øvrige rapportbegrensninger består', () => {
    const state = original()
    if (state.report.outcome?.status !== 'completed') throw new Error('fixture')
    const report = save({ ...state.report, outcome: { ...state.report.outcome, limitations: [...state.report.outcome.limitations, 'Kritisk informasjon om takkonstruksjon mangler'] } })
    expect(reportDeficiencies(report).triggers.some(item => item.message.includes('Kritisk informasjon om takkonstruksjon mangler'))).toBe(true)
  })
  it('brukervurdering følger snapshot; tilbaketrekking gjør tidligere resultat historisk og gjeninnfører bare begrensningen', () => {
    let state = original()
    state = sessionReducer(state, { type: 'report-limitation-review', generation: state.report.generation, review: review(state.report) })
    state = sessionReducer(state, { type: 'calculate-result' })
    const snapshot = state.resultSnapshot!
    expect(snapshot.assessment.basis.reportBasis.limitationReviews).toHaveLength(1)
    const next = sessionReducer(state, { type: 'report-limitation-revoke', generation: state.report.generation, index: 0 })
    expect(selectResult(next).status).toBe('historical')
    expect(next.resultSnapshot).toBe(snapshot)
    expect(next.report.outcome).toBe(state.report.outcome)
    expect(calculateResultSnapshot(next).assessment.recommendation).toBe('Innhent mer informasjon')
  })
})
