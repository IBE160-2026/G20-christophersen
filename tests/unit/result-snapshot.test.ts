import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { bindAnalysisOutcome } from '../../src/contracts/analysis-validation.ts'
import { FinancialFieldSchema } from '../../src/contracts/financial-input.ts'
import type { FinancialField } from '../../src/contracts/financial-input.ts'
import { createInitialSession, isFinancialConfirmed, sessionReducer } from '../../src/frontend/state/session.ts'
import type { SessionAction, SessionState } from '../../src/frontend/state/session.ts'
import { findingListAssessment } from '../../src/frontend/state/report.ts'
import { resultBinding, selectResult } from '../../src/frontend/state/result.ts'

// Uavhengig F1/F4-fasit, med originale PDF-bytes og reelle kontrollhandlinger.
const root = new URL('../fixtures/property-cases/', import.meta.url)
const oracle = JSON.parse(readFileSync(new URL('expected.json', root), 'utf8')) as {
  cases: { caseId: string; documentName: string; pageCount: number; financialInputs: Record<FinancialField, string>;
    findings: { id: string; grade: string; description: string; pdfPage: number }[] }[]
}
function reportFixture(caseId = 'F1', generation = 1) {
  const expected = oracle.cases.find(item => item.caseId === caseId)!
  const bytes = new Uint8Array(readFileSync(new URL(expected.documentName, root)))
  const hash = createHash('sha256').update(bytes).digest('hex')
  const selected = { bytes, hash, file: new File([bytes], expected.documentName) }
  const correlation = { sessionId: 'story-3-5', requestId: `request-${generation}`, generation }
  const outcome = bindAnalysisOutcome({ contractVersion: '2', extractionVersion: '1', mode: 'demo',
    requestId: correlation.requestId, reportHash: hash, documentName: expected.documentName, pageCount: expected.pageCount,
    pages: Array.from({ length: expected.pageCount }, (_, index) => ({ pdfPage: index + 1, text: 'Fiktiv rapport', status: 'readable', reason: null })),
  }, { contractVersion: '2', extractionVersion: '1', status: 'completed', limitations: [],
    findings: expected.findings.map(item => ({ findingId: item.id, grade: item.grade, description: item.description,
      source: { documentName: expected.documentName, reportHash: hash, pdfPage: item.pdfPage }, uncertainties: [] })) })
  return { expected, selected, correlation, outcome }
}
function financialSession(withCost = false) {
  let state = createInitialSession()
  for (const field of FinancialFieldSchema.options) {
    state = sessionReducer(state, { type: 'register-value', field, rawValue: oracle.cases[0]!.financialInputs[field] })
    state = sessionReducer(state, { type: 'register-source', field, source: { kind: 'assumption', description: `F1 ${field}`, conflict: null } })
  }
  for (const field of ['L', 'D', 'J'] as const) {
    state = sessionReducer(state, { type: 'register-period', field, period: 'year' })
    state = sessionReducer(state, { type: 'register-year', field, year: '2026' })
  }
  state = sessionReducer(state, { type: 'register-rent-nature', rentNature: 'expected' })
  if (withCost) {
    state = sessionReducer(state, { type: 'add-cost' })
    state = sessionReducer(state, { type: 'change-cost', id: 'cost-1', update: { label: 'Felleskostnader', rawAmount: '120000', rawDebt: '20000' } })
  }
  return sessionReducer(state, { type: 'confirm-financial' })
}
function receive(state: SessionState, fixture = reportFixture()) {
  state = sessionReducer(state, { type: 'report-selecting', generation: fixture.correlation.generation })
  state = sessionReducer(state, { type: 'report-selected', generation: fixture.correlation.generation, selected: fixture.selected })
  state = sessionReducer(state, { type: 'report-start', correlation: fixture.correlation })
  return sessionReducer(state, { type: 'report-response', correlation: fixture.correlation, ok: true,
    body: { kind: 'analysis', correlation: fixture.correlation, outcome: fixture.outcome } })
}
function confirmList(state: SessionState) {
  return sessionReducer(state, { type: 'report-list-confirm', generation: state.report.generation,
    reportHash: state.report.selected!.hash, documentName: state.report.selected!.file.name, listRevision: state.report.listRevision })
}
function finding(state: SessionState, type: 'report-finding-confirm' | 'report-finding-edit' | 'report-finding-apply' | 'report-finding-cancel' | 'report-finding-reject', findingId = 'F1-TG2-1') {
  return sessionReducer(state, { type, generation: state.report.generation, findingId })
}
function draft(state: SessionState, field: 'description' | 'grade' | 'pdfPage', value: string, findingId = 'F1-TG2-1') {
  return sessionReducer(state, { type: 'report-finding-draft', generation: state.report.generation, findingId, field, value })
}
function tg3(state: SessionState, field: 'status' | 'reason' | 'basis', value: string) {
  return sessionReducer(state, { type: 'report-tg3-register', generation: state.report.generation, findingId: 'F4-TG3-1', field, value })
}
function calculate(state: SessionState) { return sessionReducer(state, { type: 'calculate-result' }) }
function controlled(caseId = 'F1', withCost = false) {
  let state = sessionReducer(financialSession(withCost), { type: 'navigate', step: 'tilstandsrapport' })
  const fixture = reportFixture(caseId)
  state = receive(state, fixture)
  state = sessionReducer(state, { type: 'report-list-visible', generation: 1 })
  state = sessionReducer(state, { type: 'navigate', step: 'kontroller-funn' })
  for (const item of fixture.expected.findings) state = finding(state, 'report-finding-confirm', item.id)
  if (caseId === 'F4') state = tg3(state, 'status', 'unresolved')
  return confirmList(state)
}
function f1(withCost = false) { return calculate(controlled('F1', withCost)) }
function historical(before: SessionState, after: SessionState, target?: string) {
  const selected = selectResult(after)
  expect(selected.status).toBe('historical')
  expect(selected.snapshot).toBe(before.resultSnapshot)
  if (selected.status !== 'historical') throw new Error('Forventet historisk snapshot')
  expect(selected.label).toBe('Utdatert')
  expect(selected.changes.length).toBeGreaterThan(0)
  for (const change of selected.changes) {
    expect(change.message).not.toBe('')
    expect(change.nextAction).toContain('resultatet på nytt')
  }
  if (target) expect(selected.changes.some(change => change.target === target)).toBe(true)
}

describe('Story 3.5 — snapshot og revisjonsbundet gyldighet', () => {
  it('AC1: faktisk produsert F1 binder tall, anbefaling, kontroller og rapportidentitet i samme snapshot', () => {
    const state = f1()
    const snapshot = state.resultSnapshot!
    expect(selectResult(state)).toMatchObject({ status: 'current', label: 'Gjeldende', unusedDraftFindingIds: [] })
    expect(snapshot.assessment).toMatchObject({ recommendation: 'Gå videre', priority: 3,
      metrics: { noi: { value: { amount: '1500000' } }, cashFlowBeforeTax: { value: { amount: '700000' } },
        grossYield: { value: { numerator: '1900000', denominator: '16000000' } },
        netYield: { value: { numerator: '1500000', denominator: '16000000' } } } })
    expect(snapshot.binding).toEqual(resultBinding(state))
    expect(snapshot.binding).toMatchObject({ financialRevision: state.financialRevision, listRevision: 0,
      listConfirmationRevision: 0, tg3Revision: 0,
      financialConfirmations: { P: true, L: true, D: true, J: true, Ymin: true },
      findingConfirmations: [{ findingId: 'F1-TG2-1', revision: 0, confirmedRevision: 0 }],
      report: { generation: 1, requestId: 'request-1', status: 'completed', documentName: 'F1-tilstandsrapport.pdf', reportHash: state.report.selected!.hash } })
    expect(snapshot.assessment.basis.financialBasis.values).toEqual(state.financial)
    expect(snapshot.assessment.basis.reportBasis.outcome).toEqual(state.report.outcome)
    expect(snapshot.assessment.triggers.map(item => item.code)).toEqual(['net-yield-requirement-met', 'cash-flow-nonnegative', 'technical-basis-sufficient'])
  })

  const changes: [string, SessionAction, FinancialField[]][] = [
    ...FinancialFieldSchema.options.map((field): [string, SessionAction, FinancialField[]] => [`verdi ${field}`, { type: 'register-value', field, rawValue: '8' }, [field]]),
    ...(['L', 'D', 'J'] as const).flatMap((field): [string, SessionAction, FinancialField[]][] => [
      [`periode ${field}`, { type: 'register-period', field, period: 'month' }, [field]],
      [`år ${field}`, { type: 'register-year', field, year: '2025' }, [field]],
    ]),
    ...FinancialFieldSchema.options.flatMap((field): [string, SessionAction, FinancialField[]][] => [
      [`kildetype ${field}`, { type: 'register-source', field, source: { kind: 'source', description: `F1 ${field}`, conflict: null } }, [field]],
      [`kildebeskrivelse ${field}`, { type: 'register-source', field, source: { kind: 'assumption', description: 'Ny kilde', conflict: null } }, [field]],
      [`konflikt ${field}`, { type: 'register-source', field, source: { kind: 'assumption', description: `F1 ${field}`, conflict: { rawValue: '8', description: 'Annen kilde' } } }, [field]],
    ]),
    ['leietype', { type: 'register-rent-nature', rentNature: 'actual' }, ['L']],
    ['ny kostnad', { type: 'add-cost' }, ['D', 'J']],
  ]
  it.each(changes)('AC2: %s gjør F1 historisk og opphever bare berørt bekreftelse', (_name, action, affected) => {
    const before = f1()
    const original = JSON.stringify(before.resultSnapshot)
    const after = sessionReducer(before, action)
    historical(before, after, action.type === 'add-cost' ? 'D/J' : affected[0])
    expect(after.financialRevision).toBe(before.financialRevision + 1)
    for (const field of FinancialFieldSchema.options) expect(after.financial[field].confirmed).toBe(!affected.includes(field))
    expect(after.report).toBe(before.report)
    expect(JSON.stringify(after.resultSnapshot)).toBe(original)
  })
  it.each(['label', 'rawAmount', 'rawDebt', 'includedIn', 'remove'] as const)('AC2: kostnadsinnhold %s bevares historisk', key => {
    const before = f1(true)
    const after = sessionReducer(before, key === 'remove' ? { type: 'remove-cost', id: 'cost-1' }
      : { type: 'change-cost', id: 'cost-1', update: { [key]: key === 'label' ? 'Endret' : key === 'includedIn' ? 'ukjent' : '10000' } })
    historical(before, after, 'D/J')
    expect(after.financial.D.confirmed).toBe(false)
    expect(after.financial.J.confirmed).toBe(false)
    expect(after.resultSnapshot!.assessment.basis.financialBasis.costItems[0]!.rawAmount).toBe('120000')
  })
  it('AC2: D-perioden opphever også J-kontroll ved delt kostnadskontekst', () => {
    const before = f1(true)
    const after = sessionReducer(before, { type: 'register-period', field: 'D', period: 'month' })
    historical(before, after, 'D')
    expect(after.financial.J.confirmed).toBe(false)
    expect(after.financial.P.confirmed).toBe(true)
  })
  it('AC1/2: tilbaketrukket nullkontroll fanges ved lik finansrevisjon; ny bekreftelse gjenoppliver aldri gammelt resultat', () => {
    let state = controlled()
    state = sessionReducer(state, { type: 'register-value', field: 'J', rawValue: '0' })
    state = sessionReducer(state, { type: 'check-zero', field: 'J', checked: true })
    state = calculate(sessionReducer(state, { type: 'confirm-financial' }))
    const before = state
    state = sessionReducer(state, { type: 'check-zero', field: 'J', checked: false })
    historical(before, state, 'J')
    expect(state.financialRevision).toBe(before.financialRevision)
    expect(state.financial.J.confirmed).toBe(false)
    state = sessionReducer(state, { type: 'check-zero', field: 'J', checked: true })
    state = sessionReducer(state, { type: 'confirm-financial' })
    expect(resultBinding(state)).toEqual(before.resultSnapshot!.binding)
    historical(before, state)
    expect(selectResult(calculate(state)).status).toBe('current')
  })
  it('AC4: navigasjon, funnvalg, visning, utkast, ugyldig Bruk og Avbryt beholder gjeldende F1', () => {
    const before = f1()
    let state = before
    for (const step of ['tallgrunnlag', 'tilstandsrapport', 'kontroller-funn'] as const) state = sessionReducer(state, { type: 'navigate', step })
    state = sessionReducer(state, { type: 'report-view', generation: 1, view: { findingId: 'F1-TG2-1', pdfPage: 3, zoom: 2 } })
    state = finding(state, 'report-finding-edit')
    state = draft(state, 'description', 'Ubrukt endring')
    expect(selectResult(state)).toMatchObject({ status: 'current', unusedDraftFindingIds: ['F1-TG2-1'] })
    expect(state.resultSnapshot!.assessment.basis.reportBasis.controls[0]!.draft).toBeNull()
    state = draft(state, 'pdfPage', '999')
    state = finding(state, 'report-finding-apply')
    expect(state.report.findingControls[0]!.errors.pdfPage).toBeTruthy()
    expect(selectResult(state).status).toBe('current')
    state = finding(state, 'report-finding-cancel')
    expect(selectResult(state)).toMatchObject({ status: 'current', unusedDraftFindingIds: [] })
    expect(resultBinding(state)).toEqual(resultBinding(before))
    expect(state.resultSnapshot).toBe(before.resultSnapshot)
    expect(state.report.listConfirmationRevision).toBe(0)
    expect(isFinancialConfirmed(state)).toBe(true)
  })
  it('AC4: utkast til et tidligere ukontrollert funn og omordnet kontrolltabell påvirker ikke binding', () => {
    let state = calculate(receive(sessionReducer(financialSession(), { type: 'navigate', step: 'tilstandsrapport' })))
    const before = state
    state = finding(state, 'report-finding-edit')
    expect(selectResult(state).status).toBe('current')
    expect(resultBinding(state)).toEqual(resultBinding(before))
    expect(state.resultSnapshot!.assessment.priority).toBe(1)
    state = finding(state, 'report-finding-confirm')
    historical(before, state, 'F1-TG2-1')
  })
  it('AC4: identiske registreringer, avviste gamle handlinger og gjentatt bekreftelse er uten resultatendring', () => {
    const before = f1()
    const noops: SessionAction[] = FinancialFieldSchema.options.flatMap(field => [
      { type: 'register-value', field, rawValue: before.financial[field].rawValue },
      { type: 'register-source', field, source: { ...before.sources[field] } },
    ])
    for (const field of ['L', 'D', 'J'] as const) noops.push({ type: 'register-year', field, year: '2026' }, { type: 'register-period', field, period: 'year' })
    noops.push({ type: 'register-rent-nature', rentNature: 'expected' }, { type: 'remove-cost', id: 'missing' },
      { type: 'change-cost', id: 'missing', update: { label: 'x' } }, { type: 'confirm-financial' },
      { type: 'report-finding-reject', generation: 0, findingId: 'F1-TG2-1' },
      { type: 'report-selecting', generation: 0 }, { type: 'report-list-visible', generation: 1 })
    for (const action of noops) {
      const after = sessionReducer(before, action)
      expect(selectResult(after).status).toBe('current')
      expect(after.resultChanges).toEqual([])
      expect(after.resultSnapshot).toBe(before.resultSnapshot)
    }
    expect(selectResult(confirmList(before)).status).toBe('current')
  })
  it.each(['report-finding-apply', 'report-finding-reject'] as const)('AC2/5 RT11/12: %s bevarer original og historisk kontroll, og krever ny listebekreftelse', type => {
    const before = f1()
    const original = JSON.stringify(before.resultSnapshot)
    let state = draft(finding(before, 'report-finding-edit'), 'description', 'Kontrollert ny beskrivelse')
    state = finding(state, type)
    historical(before, state, 'F1-TG2-1')
    expect(state.report.listConfirmationRevision).toBeNull()
    expect(state.report.listRevision).toBe(1)
    expect(state.financial).toBe(before.financial)
    expect(state.report.outcome).toBe(before.report.outcome)
    expect(JSON.stringify(before.resultSnapshot)).toBe(original)
    const incomplete = calculate(state)
    expect(incomplete.resultSnapshot!.assessment).toMatchObject({ priority: 1, recommendation: 'Innhent mer informasjon' })
    if (type === 'report-finding-apply') {
      expect(findingListAssessment(confirmList(state).report).confirmed).toBe(false)
      state = finding(state, 'report-finding-confirm')
    }
    state = calculate(confirmList(state))
    expect(selectResult(state).status).toBe('current')
    expect(state.resultSnapshot!.assessment.priority).toBe(3)
    expect(state.resultSnapshot!.assessment.basis.reportBasis.outcome).toEqual(before.report.outcome)
    const control = state.resultSnapshot!.assessment.basis.reportBasis.controls[0]!
    expect(type === 'report-finding-apply' ? control.correction : control.rejection).not.toBeNull()
  })
  it('AC2/5 RT11/14: TG3 rettet til TG2 på annen side beholder KI-original; ny retting krever ny kontroll igjen', () => {
    const before = calculate(controlled('F4'))
    let state = finding(before, 'report-finding-edit', 'F4-TG3-1')
    state = draft(draft(state, 'grade', 'TG2', 'F4-TG3-1'), 'pdfPage', '3', 'F4-TG3-1')
    state = finding(state, 'report-finding-apply', 'F4-TG3-1')
    historical(before, state, 'F4-TG3-1')
    state = calculate(confirmList(finding(state, 'report-finding-confirm', 'F4-TG3-1')))
    expect(state.resultSnapshot!.assessment.priority).toBe(3)
    const original = state.resultSnapshot!.assessment.basis.reportBasis.outcome
    expect(original).toMatchObject({ findings: expect.arrayContaining([expect.objectContaining({
      findingId: 'F4-TG3-1', original: expect.objectContaining({ grade: 'TG3', source: expect.objectContaining({ pdfPage: 4 }) }),
    })]) })
    const corrected = state
    state = finding(draft(finding(state, 'report-finding-edit', 'F4-TG3-1'), 'description', 'Ytterligere kontrollert retting', 'F4-TG3-1'), 'report-finding-apply', 'F4-TG3-1')
    historical(corrected, state)
    expect(state.report.listRevision).toBe(2)
    expect(state.report.listConfirmationRevision).toBeNull()
    expect(calculate(state).resultSnapshot!.assessment.priority).toBe(1)
  })
  it('AC2/5 RT12/13: avvist TG3 er bevart som original, og avvisningen oppretter ingen teknisk avklaring', () => {
    const before = calculate(controlled('F4'))
    const rejected = finding(before, 'report-finding-reject', 'F4-TG3-1')
    historical(before, rejected)
    const state = calculate(confirmList(rejected))
    expect(state.resultSnapshot!.assessment.priority).toBe(3)
    expect(state.report.tg3Resolutions).toBe(before.report.tg3Resolutions)
    expect(state.report.tg3Resolutions[0]!.resolution.status).toBe('unresolved')
    expect(state.resultSnapshot!.assessment.basis.reportBasis.outcome).toEqual(before.report.outcome)
    expect(state.resultSnapshot!.assessment.basis.reportBasis.controls.find(item => item.findingId === 'F4-TG3-1')!.rejection).toEqual({ revision: 1 })
  })
  it.each([
    ['status', 'resolved', 1], ['reason', 'Ny begrunnelse', 1], ['basis', 'Nytt kontrollgrunnlag', 1],
  ] as const)('AC3: TG3-%s endrer bare TG3-revisjon og krever gjeldende FR-5-vurdering', (field, value, priority) => {
    const before = calculate(controlled('F4'))
    const state = tg3(before, field, value)
    historical(before, state, 'F4-TG3-1')
    expect(state.report.tg3Revision).toBe(before.report.tg3Revision + 1)
    expect(state.financial).toBe(before.financial)
    expect(state.report.findingControls).toBe(before.report.findingControls)
    expect(state.report.listConfirmationRevision).toBe(before.report.listConfirmationRevision)
    expect(state.report.outcome).toBe(before.report.outcome)
    expect(calculate(state).resultSnapshot!.assessment.priority).toBe(priority)
  })
  it('AC3/5: komplett separat TG3-avklaring gir ny vurdering; senere blankt grunnlag gir prioritet 1', () => {
    let state = calculate(controlled('F4'))
    const unresolved = state.resultSnapshot!
    state = tg3(tg3(tg3(state, 'status', 'resolved'), 'reason', 'Kontrollert tak'), 'basis', 'Fagrapport T-42')
    state = calculate(state)
    expect(state.resultSnapshot!.assessment.priority).toBe(3)
    expect(state.resultSnapshot!.binding.tg3Revision).toBe(4)
    expect(unresolved.assessment.priority).toBe(1)
    for (const [field, value] of [['status', 'unknown'], ['reason', '  '], ['basis', '']] as const) {
      const changed = tg3(state, field, value)
      historical(state, changed)
      expect(calculate(changed).resultSnapshot!.assessment.priority).toBe(1)
    }
    expect(selectResult(tg3(state, 'basis', 'Fagrapport T-42')).status).toBe('current')
  })
  it.each([['description', '  Alvorlig lekkasje i tak  ', 3], ['description', 'Et annet teknisk forhold', 1], ['pdfPage', '3', 1]] as const)(
    'AC3/5: brukt TG3-retting av %s validerer binding på nytt etter funn-/listekontroll', (field, value, priority) => {
      let state = controlled('F4')
      state = calculate(tg3(tg3(tg3(state, 'status', 'resolved'), 'reason', 'Faglig kontrollert'), 'basis', 'Rapport T-42'))
      const before = state
      state = draft(finding(state, 'report-finding-edit', 'F4-TG3-1'), field, value, 'F4-TG3-1')
      state = finding(state, 'report-finding-apply', 'F4-TG3-1')
      historical(before, state, 'F4-TG3-1')
      state = calculate(confirmList(finding(state, 'report-finding-confirm', 'F4-TG3-1')))
      expect(state.resultSnapshot!.assessment.priority).toBe(priority)
      expect(state.report.tg3Resolutions).toBe(before.report.tg3Resolutions)
      expect(before.resultSnapshot!.assessment.priority).toBe(3)
    })
  it('AC2/5 AT16 BT12: L-endring og ny bekreftelse gir nytt Forkast uten rapportendring', () => {
    const before = f1()
    let state = sessionReducer(before, { type: 'register-value', field: 'L', rawValue: '1400000' })
    historical(before, state, 'L')
    const unconfirmed = calculate(state).resultSnapshot!.assessment
    expect(unconfirmed.priority).toBe(1)
    expect(unconfirmed.metrics.grossYield.status).toBe('unavailable')
    expect(unconfirmed.metrics.noi.status).toBe('unavailable')
    state = sessionReducer(state, { type: 'confirm-financial' })
    historical(before, state)
    state = calculate(state)
    expect(state.report).toBe(before.report)
    expect(state.resultSnapshot!.assessment).toMatchObject({ recommendation: 'Forkast', priority: 2,
      metrics: { noi: { value: { amount: '1000000' } }, cashFlowBeforeTax: { value: { amount: '200000' } } } })
    expect(state.resultChanges).toEqual([])
    expect(before.resultSnapshot!.assessment.recommendation).toBe('Gå videre')
  })
  it('AC5 BT13: bare Ymin endrer screening; nøkkeltall og rapport bevares', () => {
    const before = f1()
    const missing = calculate(sessionReducer(before, { type: 'register-value', field: 'Ymin', rawValue: '' }))
    expect(missing.resultSnapshot!.assessment.priority).toBe(1)
    expect(missing.resultSnapshot!.assessment.metrics).toEqual(before.resultSnapshot!.assessment.metrics)
    let state = sessionReducer(missing, { type: 'register-value', field: 'Ymin', rawValue: '10' })
    state = calculate(sessionReducer(state, { type: 'confirm-financial' }))
    expect(state.resultSnapshot!.assessment.priority).toBe(2)
    expect(state.resultSnapshot!.assessment.metrics).toEqual(before.resultSnapshot!.assessment.metrics)
    expect(state.report).toBe(before.report)
  })
  it.each(['F1', 'F4'])('AC2/5: rapportbytte til %s er historisk også ved nullstilte revisjoner og sent svar', caseId => {
    const before = f1()
    const old = reportFixture()
    let state = sessionReducer(before, { type: 'report-selecting', generation: 2 })
    historical(before, state, 'report')
    expect(state.report.listConfirmationRevision).toBeNull()
    expect(state.report.tg3Resolutions).toEqual([])
    expect(state.report.listRevision).toBe(0)
    state = sessionReducer(state, { type: 'report-response', correlation: old.correlation, ok: true,
      body: { kind: 'analysis', correlation: old.correlation, outcome: old.outcome } })
    historical(before, state)
    expect(state.report.outcome).toBeNull()
    const next = reportFixture(caseId, 2)
    state = sessionReducer(state, { type: 'report-selected', generation: 2, selected: next.selected })
    expect(calculate(state).resultSnapshot!.assessment.priority).toBe(1)
    state = sessionReducer(state, { type: 'report-start', correlation: next.correlation })
    state = sessionReducer(state, { type: 'report-response', correlation: old.correlation, ok: true,
      body: { kind: 'analysis', correlation: old.correlation, outcome: old.outcome } })
    expect(state.report.status).toBe('analysing')
    state = sessionReducer(state, { type: 'report-response', correlation: next.correlation, ok: true,
      body: { kind: 'analysis', correlation: next.correlation, outcome: next.outcome } })
    historical(before, state)
    state = calculate(state)
    expect(state.resultSnapshot!.assessment.priority).toBe(1)
    expect(state.resultSnapshot!.binding.report.generation).toBe(2)
    expect(state.resultSnapshot!.binding.report.reportHash).toBe(next.selected.hash)
    expect(before.resultSnapshot!.binding.report.generation).toBe(1)
    expect(before.resultSnapshot!.assessment.recommendation).toBe('Gå videre')
  })
  it('AC5: avbrutt analyse, feil og sent svar gjenoppliver ikke komplett resultat', () => {
    const before = f1()
    const next = reportFixture('F4', 2)
    let state = sessionReducer(before, { type: 'report-selecting', generation: 2 })
    state = sessionReducer(state, { type: 'report-selected', generation: 2, selected: next.selected })
    state = sessionReducer(state, { type: 'report-start', correlation: next.correlation })
    state = sessionReducer(state, { type: 'navigate', step: 'tallgrunnlag' })
    const abandoned = state
    state = sessionReducer(state, { type: 'report-response', correlation: next.correlation, ok: true,
      body: { kind: 'analysis', correlation: next.correlation, outcome: next.outcome } })
    state = sessionReducer(state, { type: 'report-error', generation: 2, code: 'late-error' })
    expect(state.report).toBe(abandoned.report)
    historical(before, state)
    expect(calculate(state).resultSnapshot!.assessment.priority).toBe(1)
  })
  it('AC1: senere mutasjon av aktivt finans-/rapport-/kontroll-/TG3-grunnlag endrer aldri snapshotets provenance', () => {
    let state = controlled('F4', true)
    state = tg3(tg3(tg3(state, 'status', 'resolved'), 'reason', 'Tak kontrollert'), 'basis', 'Fagrapport')
    state = finding(draft(finding(state, 'report-finding-edit', 'F4-TG2-1'), 'description', 'Korrigert slitasje', 'F4-TG2-1'), 'report-finding-apply', 'F4-TG2-1')
    state = calculate(confirmList(finding(state, 'report-finding-confirm', 'F4-TG2-1')))
    const snapshot = state.resultSnapshot!
    const original = JSON.stringify(snapshot)
    state.financial.L.rawValue = '999'
    state.sources.L.description = 'Mutert kilde'
    state.costItems[0]!.label = 'Mutert kostnad'
    if (state.report.outcome?.status !== 'completed') throw new Error('fixture')
    // Analysekontrakten fryser allerede originalen; en erstattet aktiv kopi må også være isolert.
    const originalFinding = state.report.outcome.findings[0]!.original
    expect(() => { Object.assign(originalFinding, { description: 'Mutert original' }) }).toThrow(TypeError)
    state.report.outcome = structuredClone(state.report.outcome)
    Object.assign(state.report.outcome.findings[0]!.original, { description: 'Mutert original' })
    state.report.findingControls.find(control => control.correction)!.correction!.description = 'Mutert korrigering'
    state.report.tg3Resolutions[0]!.resolution.basis = 'Mutert avklaring'
    expect(JSON.stringify(snapshot)).toBe(original)
    expect(Object.isFrozen(snapshot.assessment.basis.reportBasis.outcome)).toBe(true)
    expect(() => { snapshot.assessment.metrics.noi.basis.inputs[0]!.source.description = 'Mutert retur' }).toThrow(TypeError)
  })
  it('AC6: ny økt er Ikke beregnet; bare siste snapshot eies av aktiv vurdering', () => {
    const first = f1()
    const second = calculate(first)
    expect(second.resultSnapshot).not.toBe(first.resultSnapshot)
    expect(second.resultSnapshot).toEqual(first.resultSnapshot)
    expect(createInitialSession().resultSnapshot).toBeNull()
    expect(selectResult(createInitialSession())).toEqual({ status: 'not-calculated', label: 'Ikke beregnet', snapshot: null, unusedDraftFindingIds: [] })
  })
})
