import { describe, expect, it, vi } from 'vitest'
import type { FinancialBasis } from '../../src/contracts/financial-basis.ts'
import type { FinancialField } from '../../src/contracts/financial-input.ts'
import type { FindingListBasis } from '../../src/contracts/finding-control.ts'
import type { ScreeningInput } from '../../src/contracts/screening.ts'
import type { Tg3Finding } from '../../src/contracts/tg3-resolution.ts'
import { evaluateKnownDeficiencies, evaluateScreening } from '../../src/domain/screening.ts'
import { assessFindingList } from '../../src/domain/finding-control.ts'
import { calculateFinancialMetrics } from '../../src/domain/finance.ts'
import { evaluateCashFlowThreshold, evaluateNetYieldThreshold } from '../../src/domain/thresholds.ts'
import { createReportState, currentTg3Findings, reportDeficiencies, reportReducer } from '../../src/frontend/state/report.ts'
import type { ReportState } from '../../src/frontend/state/report.ts'

// Uavhengige inndata/forventninger fra låst PRD-addendum AT/BT/FR-5 og briefets varianter.
const hash = 'a'.repeat(64)
function input(): ScreeningInput {
  const financialBasis: FinancialBasis = {
    values: {
      P: { rawValue: '16000000', confirmed: true },
      L: { rawValue: '1900000', confirmed: true, period: 'year', year: '2026' },
      D: { rawValue: '400000', confirmed: true, period: 'year', year: '2026' },
      J: { rawValue: '800000', confirmed: true, period: 'year', year: '2026' },
      Ymin: { rawValue: '7', confirmed: true },
    },
    sources: {
      P: { kind: 'source', description: 'Totalpris med fellesgjeld', conflict: null },
      L: { kind: 'assumption', description: 'Forventet årsleie', rentNature: 'expected', conflict: null },
      D: { kind: 'source', description: 'Eierbetalt drift', conflict: null },
      J: { kind: 'source', description: 'Renter og avdrag', conflict: null },
      Ymin: { kind: 'assumption', description: 'Eget avkastningskrav', conflict: null },
    }, costItems: [],
  }
  const reportBasis: FindingListBasis = {
    status: 'completed', error: null,
    reportIdentity: { reportHash: hash, documentName: 'f4.pdf' },
    outcome: { contractVersion: '2', extractionVersion: '1', requestId: 'request',
      reportHash: hash, documentName: 'f4.pdf', mode: 'demo', pageCount: 5,
      status: 'completed', validationScope: 'structure-and-source',
      findings: [], uncertainCandidates: [], limitations: [] },
    controls: [], listRevision: 0, listConfirmationRevision: 0, tg3Findings: [],
  }
  return { financialBasis, reportBasis }
}
function tg3(id = 'tak', resolved = false): Tg3Finding {
  const current = { grade: 'TG3' as const, description: 'Alvorlig lekkasje i tak',
    source: { documentName: 'f4.pdf', reportHash: hash, pdfPage: 4 } }
  return { findingId: id, current, resolution: resolved ? { status: 'resolved',
    reason: 'Tilstrekkelig avklart for førstevurdering.', basis: 'Fagkontroll med dato og referanse.', binding: structuredClone(current) } : null }
}
function addTg3(basis: ScreeningInput, finding = tg3()) {
  basis.reportBasis.tg3Findings.push(finding)
  const outcome = basis.reportBasis.outcome!
  if (outcome.status !== 'completed') throw new Error('Fixture krever completed')
  outcome.findings.push({ kind: 'checkable', findingId: finding.findingId, ...finding.current,
    original: { findingId: finding.findingId, ...finding.current, uncertainties: [] } })
  basis.reportBasis.controls.push({ findingId: finding.findingId, revision: 0,
    confirmedRevision: 0, correction: null, rejection: null, draft: null, errors: {} })
  return basis
}
function at18() {
  const basis = addTg3(input())
  basis.financialBasis.values.L.rawValue = ''
  basis.financialBasis.values.Ymin.rawValue = ''
  basis.reportBasis.status = 'failed'
  basis.reportBasis.error = 'interrupted'
  basis.reportBasis.outcome = null
  return basis
}
function codes(basis: ScreeningInput) { return evaluateScreening(basis).triggers.map(item => item.code) }
function freezeDeep<T>(value: T): T {
  if (value && typeof value === 'object') { Object.values(value).forEach(freezeDeep); Object.freeze(value) }
  return value
}

const proceedCodes = ['net-yield-requirement-met', 'cash-flow-nonnegative', 'technical-basis-sufficient']
const yieldExplanation = 'Økonomiske minimumskrav er ikke oppfylt. Nettoyield er lavere enn ditt avkastningskrav.'
const proceedExplanation = 'Nettoyield oppfyller ditt avkastningskrav. Kontantstrøm før skatt er null eller positiv. Teknisk grunnlag er tilstrekkelig for førstevurdering.'

describe('Story 3.4 AC2/3 — komplett anbefaling og eksakte terskler', () => {
  it('AT-1/F1: én Gå videre med full fast begrunnelse, grunnlag og neste handling', () => {
    const result = evaluateScreening(input())
    expect(result).toMatchObject({ scope: 'screening', recommendation: 'Gå videre', status: 'proceed',
      priority: 3, partialBasis: false, explanation: proceedExplanation,
      nextAction: 'Gå videre til grundigere vurdering/befaring.' })
    expect(result.triggers.map(item => item.code)).toEqual(proceedCodes)
    expect(result.metrics.netYield.value).toEqual({ kind: 'ratio', numerator: '1500000', denominator: '16000000', unit: 'ratio' })
    expect(result.metrics.cashFlowBeforeTax.value).toEqual({ kind: 'amount', amount: '700000', unit: 'NOK/year' })
    expect(result.thresholds.netYield.basis.minimumYield.decimal).toBe('7')
    expect(result.thresholds.netYield.decision.comparison).toEqual({ left: '150000000', operator: '>=', right: '112000000' })
  })
  it.each([
    ['AT-2/F2', '1400000', '800000', ['net-yield-below-minimum'], '1000000', '200000'],
    ['AT-3', '1900000', '1500001', ['negative-cash-flow'], '1500000', '-1'],
    ['AT-4', '1400000', '1000001', ['net-yield-below-minimum', 'negative-cash-flow'], '1000000', '-1'],
  ])('%s: alle og bare økonomiske brudd i fast orden', (_id, rent, debt, expected, noi, cash) => {
    const basis = input(); basis.financialBasis.values.L.rawValue = rent; basis.financialBasis.values.J.rawValue = debt
    const result = evaluateScreening(basis)
    expect(result).toMatchObject({ recommendation: 'Forkast', priority: 2, partialBasis: false,
      nextAction: 'Forkast objektet på det gjeldende screeninggrunnlaget.' })
    expect(result.triggers.map(item => item.code)).toEqual(expected)
    expect(result.metrics.netYield.value).toMatchObject({ numerator: noi, denominator: '16000000' })
    expect(result.metrics.cashFlowBeforeTax.value).toMatchObject({ amount: cash })
    for (const trigger of result.triggers) {
      expect(trigger.kind).toBe('economic')
      if (trigger.kind === 'economic') {
        expect(trigger.threshold.decision.status).toBe('breached')
        expect(trigger.threshold.decision.comparison?.right).toBe(trigger.target === 'netYield' ? '112000000' : '0')
      }
    }
    if (rent === '1400000' && debt === '800000') expect(result.explanation).toBe(yieldExplanation)
    if (expected.length === 2) expect(result.explanation).toBe(`${yieldExplanation} Kontantstrøm før skatt er negativ.`)
  })
  it.each([
    ['AT-10/BT-8 likhet', '1520000', '800000', 3],
    ['AT-10/BT-8 én krone under', '1519999', '800000', 2],
    ['AT-11/BT-9 likhet', '1900000', '1500000', 3],
    ['AT-11/BT-9 én krone under', '1900000', '1500001', 2],
    ['Eksakt desimalyield under', '1519999.999999999999999999999999999', '800000', 2],
    ['Eksakt desimalyield over', '1520000.000000000000000000000000001', '800000', 3],
    ['Eksakt negativ cash som vises som null', '1900000', '1500000.00000000000000000001', 2],
  ])('%s: ingen S1-/visningsmargin', (_id, rent, debt, priority) => {
    const basis = input(); basis.financialBasis.values.L.rawValue = rent; basis.financialBasis.values.J.rawValue = debt
    expect(evaluateScreening(basis).priority).toBe(priority)
  })
  it('AT-14: Ymin=10 gjelder som brukerens krav med eksakt terskelgrunnlag', () => {
    const basis = input(); basis.financialBasis.values.Ymin.rawValue = '10'
    const result = evaluateScreening(basis)
    expect(result.recommendation).toBe('Forkast')
    expect(result.thresholds.netYield.decision.comparison).toEqual({ left: '150000000', operator: '>=', right: '160000000' })
    expect(result.thresholds.netYield.basis.minimumYield.decimal).toBe('10')
  })
  it('AT-15/BT-10: bekreftet J=0 er gyldig; ubekreftet null blir prioritet 1', () => {
    const basis = input(); basis.financialBasis.values.J.rawValue = '0'
    expect(evaluateScreening(basis)).toMatchObject({ recommendation: 'Gå videre', priority: 3,
      metrics: { cashFlowBeforeTax: { value: { amount: '1500000' } } } })
    basis.financialBasis.values.J.confirmed = false
    expect(codes(basis)).toEqual(['unconfirmed-zero'])
    expect(evaluateScreening(basis).priority).toBe(1)
  })
  it('bekreftet L=D=J=Ymin=0 oppfyller begge økonomiske krav uten skjult standard', () => {
    const basis = input()
    for (const field of ['L', 'D', 'J', 'Ymin'] as const) basis.financialBasis.values[field].rawValue = '0'
    const result = evaluateScreening(basis)
    expect(result.priority).toBe(3)
    expect(result.thresholds.netYield.decision.comparison).toEqual({ left: '0', operator: '>=', right: '0' })
    expect(result.thresholds.cashFlow.decision.comparison).toEqual({ left: '0', operator: '>=', right: '0' })
  })
})

describe('Story 3.4 AC1/4/6 — kritisk grunnlag overstyrer økonomien', () => {
  it('AT-5/F3/BT-3: manglende L og høy J gir fire unavailable, ingen økonomisk konklusjon', () => {
    const basis = input(); basis.financialBasis.values.L.rawValue = ''; basis.financialBasis.values.J.rawValue = '1500001'
    const result = evaluateScreening(basis)
    expect(result).toMatchObject({ recommendation: 'Innhent mer informasjon', priority: 1, partialBasis: true })
    expect(result.triggers.map(item => item.code)).toEqual(['missing-value'])
    for (const metric of Object.values(result.metrics)) expect(metric).toMatchObject({ status: 'unavailable', value: null })
  })
  it('AT-6/BT-5/17: blank J med F2-yield gir informasjon, men beholder gyldige delberegninger', () => {
    const basis = input(); basis.financialBasis.values.L.rawValue = '1400000'; basis.financialBasis.values.J.rawValue = ''
    const result = evaluateScreening(basis)
    expect(result).toMatchObject({ priority: 1, partialBasis: true, recommendation: 'Innhent mer informasjon' })
    expect(result.triggers).toEqual([{ kind: 'financial', field: 'J', target: 'value', code: 'missing-value',
      message: 'J: Verdien mangler.', action: 'Oppgi verdien for J.', relatedFields: [] }])
    expect(result.metrics.netYield.value).toMatchObject({ numerator: '1000000', denominator: '16000000' })
    expect(result.metrics.cashFlowBeforeTax.value).toBeNull()
    expect(result.thresholds.netYield.decision.status).toBe('breached')
  })
  it('BT-6/P=0 beholder NOI/cash; BT-18/blank Ymin beholder alle fire tall', () => {
    const basis = input(); basis.financialBasis.values.P.rawValue = '0'
    const zeroPrice = evaluateScreening(basis)
    expect(zeroPrice.priority).toBe(1)
    expect(zeroPrice.metrics.grossYield.value).toBeNull()
    expect(zeroPrice.metrics.netYield.value).toBeNull()
    expect(zeroPrice.metrics.noi.value).toMatchObject({ amount: '1500000' })
    expect(zeroPrice.metrics.cashFlowBeforeTax.value).toMatchObject({ amount: '700000' })
    const missingRequirement = input(); missingRequirement.financialBasis.values.Ymin.rawValue = ''
    const result = evaluateScreening(missingRequirement)
    expect(result.priority).toBe(1)
    for (const metric of Object.values(result.metrics)) expect(metric.status).toBe('available')
    expect(codes(missingRequirement)).toEqual(['missing-value'])
  })
  it.each(['D', 'J', 'Ymin'] as const)('AT-12/brief: blank %s gir konkret mangel og handling', field => {
    const basis = input(); basis.financialBasis.values[field].rawValue = ''
    expect(evaluateScreening(basis)).toMatchObject({ priority: 1, triggers: [expect.objectContaining({ field, code: 'missing-value', action: `Oppgi verdien for ${field}.` })] })
  })
  it.each(['D', 'J'] as const)('AT-12/brief: negativ %s gir valideringsfeil', field => {
    const basis = input(); basis.financialBasis.values[field].rawValue = '-1'
    expect(evaluateScreening(basis).priority).toBe(1)
    expect(evaluateScreening(basis).triggers).toContainEqual(expect.objectContaining({ field, code: 'must-be-nonnegative' }))
  })
  it.each(['P', 'L', 'D', 'J', 'Ymin'] as FinancialField[])('AT-12: ubekreftet %s er kritisk', field => {
    const basis = input(); basis.financialBasis.values[field].confirmed = false
    expect(evaluateScreening(basis).priority).toBe(1)
    expect(codes(basis)).toEqual(['unconfirmed-value'])
  })
  it('AT-12/brief: kildekonflikt gjettes ikke bort; hele grunnlaget bevares', () => {
    const basis = input(); basis.financialBasis.sources.L.conflict = { rawValue: '1400000', description: 'Annen kilde' }
    const result = evaluateScreening(basis)
    expect(result.priority).toBe(1)
    expect(result.triggers).toContainEqual(expect.objectContaining({ kind: 'financial', field: 'L', code: 'source-conflict' }))
    expect(result.basis.financialBasis.sources.L.conflict).toEqual(basis.financialBasis.sources.L.conflict)
  })
  it.each(['missing', 'ready', 'analysing', 'failed'] as const)('AT-13/brief: %s med tomliste/bekreftelse er ikke fullført analyse', status => {
    const basis = input(); basis.reportBasis.status = status; basis.reportBasis.outcome = null
    if (status === 'failed') basis.reportBasis.error = 'transport-failure'
    const result = evaluateScreening(basis)
    expect(result.priority).toBe(1)
    expect(result.triggers.map(item => item.code)).toEqual([status === 'missing' ? 'missing-report' : 'incomplete-report'])
    if (status === 'failed') expect(result.explanation).toContain('transport-failure')
    else expect(result.explanation).not.toContain('timeout')
  })
  it('AT-13: tom completed-liste krever fortsatt eksplisitt listebekreftelse', () => {
    const basis = input(); basis.reportBasis.listConfirmationRevision = null
    expect(evaluateScreening(basis)).toMatchObject({ priority: 1, triggers: [expect.objectContaining({
      reason: 'Funnlisten er ennå ikke kontrollert og bekreftet av deg.' })] })
    basis.reportBasis.listConfirmationRevision = 0
    expect(evaluateScreening(basis).priority).toBe(3)
  })
  it.each(['document', 'analysis'] as const)('AT-13: %s-feil beholder kjent årsak og berørt side', kind => {
    const basis = input(); const previous = basis.reportBasis.outcome!
    basis.reportBasis.status = 'failed'
    basis.reportBasis.outcome = { ...previous, status: 'failed', partialResult: null,
      error: kind === 'document' ? { kind, code: 'unreadable-text', target: { kind: 'page', pdfPage: 4 }, reason: 'PDF-side 4 er uleselig.' }
        : { kind, code: 'interrupted', target: { kind: 'page', pdfPage: 4 }, reason: 'Analysen ble avbrutt.' } }
    const result = evaluateScreening(basis)
    expect(result.priority).toBe(1)
    expect(result.explanation).toContain(kind === 'document' ? 'PDF-side 4 er uleselig.' : 'Analysen ble avbrutt.')
    expect(result.explanation).toContain('Berørt PDF-side: 4.')
    expect(result.basis.reportBasis.outcome?.status).toBe('failed')
  })
  it('AT-13: uløst kritisk KI-usikkerhet og eksplisitt begrensning kan ikke bekreftes bort', () => {
    const basis = input(); const outcome = basis.reportBasis.outcome!
    if (outcome.status !== 'completed') throw new Error('Fixture')
    outcome.uncertainCandidates = [{ kind: 'uncertain', findingId: 'ukjent',
      original: { findingId: 'ukjent', description: 'Uklart forhold', grade: '?', source: null, uncertainties: ['Kilden er usikker.'] },
      issues: [{ code: 'unclear-grade', reason: 'Grad er ukjent.' }] }]
    outcome.limitations = ['Rapportgrunnlaget er ufullstendig.']
    expect(evaluateScreening(basis).priority).toBe(1)
    expect(evaluateScreening(basis).explanation).toContain('ukjent: Grad er ukjent.')
    expect(evaluateScreening(basis).explanation).toContain('ukjent: Kilden er usikker.')
    expect(evaluateScreening(basis).explanation).toContain('Rapportgrunnlaget er ufullstendig.')
  })
  it('AC6: full screening konsumerer nøyaktig samme mangler/handling/tekst som lokal autoritet', () => {
    const basis = at18()
    const local = evaluateKnownDeficiencies({ financialBasis: basis.financialBasis,
      reportDeficiencies: assessFindingList(basis.reportBasis).reportDeficiencies, tg3Findings: basis.reportBasis.tg3Findings })
    const full = evaluateScreening(basis)
    expect(full.triggers).toEqual(local.triggers)
    expect(full.explanation).toBe(local.explanation)
    expect(full.nextAction).toBe(local.nextAction)
  })
  it('completed fra feil rapport kan ikke bli gyldig med bekreftet liste', () => {
    const basis = input(); basis.reportBasis.reportIdentity!.reportHash = 'b'.repeat(64)
    expect(evaluateScreening(basis).priority).toBe(1)
    expect(codes(basis)).toEqual(['incomplete-report'])
  })
  it('enkeltfunnkontroll gjenstår selv ved manuelt samsvarende listebekreftelse', () => {
    const basis = addTg3(input(), tg3('A', true))
    basis.reportBasis.controls[0]!.confirmedRevision = null
    expect(evaluateScreening(basis).priority).toBe(1)
    expect(evaluateScreening(basis).explanation).toContain('Funnlisten er ennå ikke kontrollert og bekreftet')
  })
  it.each(['period', 'year', 'source', 'cost'] as const)('felles autoritet dekker også kritisk %s-grunnlag', variant => {
    const basis = input()
    if (variant === 'period') basis.financialBasis.values.D.period = 'unknown'
    if (variant === 'year') basis.financialBasis.values.J.year = '2027'
    if (variant === 'source') basis.financialBasis.sources.P.description = ''
    if (variant === 'cost') basis.financialBasis.costItems = [{ id: 'bad', label: '', rawAmount: '', rawDebt: '', includedIn: null }]
    const local = evaluateKnownDeficiencies({ financialBasis: basis.financialBasis })
    const full = evaluateScreening(basis)
    expect(full.priority).toBe(1)
    expect(full.triggers).toEqual(local.triggers)
    expect(full.nextAction).toBe(local.nextAction)
  })
  it('BT-15: blandet kjent måned/år normaliseres før den samlede avgjørelsen', () => {
    const basis = input()
    basis.financialBasis.values.L.rawValue = '1440000'
    basis.financialBasis.values.D.rawValue = '20000'
    basis.financialBasis.values.D.period = 'month'
    basis.financialBasis.values.J.rawValue = '600000'
    const result = evaluateScreening(basis)
    expect(result.priority).toBe(3)
    expect(result.metrics.noi.value).toMatchObject({ amount: '1200000' })
    expect(result.metrics.cashFlowBeforeTax.value).toMatchObject({ amount: '600000' })
    expect(result.metrics.noi.basis.inputs.find(item => item.field === 'D')?.normalization).toMatchObject({ factor: '12', annualValue: '240000' })
  })
})

describe('Story 3.4 AC1/4 — AT-7/8/9/20 og alle sju FR-5-eksempler', () => {
  it('AT-7/F4/BT-4 og AT-20: uavklart TG3 overstyrer både F1 og F2, finansverdiene er uendret', () => {
    for (const rent of ['1900000', '1400000']) {
      const basis = input(); basis.financialBasis.values.L.rawValue = rent
      const metrics = calculateFinancialMetrics(basis.financialBasis)
      const result = evaluateScreening(addTg3(basis))
      expect(result).toMatchObject({ recommendation: 'Innhent mer informasjon', priority: 1, partialBasis: true })
      expect(result.triggers.map(item => item.code)).toEqual(['unresolved-tg3'])
      expect(result.explanation).toContain('tak: Alvorlig lekkasje i tak (f4.pdf, PDF-side 4)')
      expect(result.nextAction).toContain('Innhent konkret avklaringsgrunnlag')
      expect(result.metrics).toEqual(metrics)
    }
  })
  it('FR-5 eksempel 1/AT-9: elektrikeravklaring gir Gå videre med bevart TG3 og brukergrunnlag', () => {
    const finding = tg3('el', true)
    finding.current.description = 'Deler av elektrisk anlegg kunne ikke dokumenteres.'
    finding.resolution!.binding = structuredClone(finding.current)
    finding.resolution!.reason = 'Etterfølgende kontroll avdekket ingen forhold som krever umiddelbar utbedring.'
    finding.resolution!.basis = 'Kontroll fra autorisert elektriker 2026-10-21, referanse EL-12.'
    const result = evaluateScreening(addTg3(input(), finding))
    expect(result.priority).toBe(3)
    expect(result.basis.reportBasis.tg3Findings[0]).toEqual(finding)
    expect(result.basis.reportBasis.outcome).toMatchObject({ findings: [{ grade: 'TG3' }] })
    expect(result.explanation).not.toMatch(/teknisk godkjent|kjøp|utbedret/)
  })
  it.each([
    ['FR-5 eksempel 2', 'unresolved', 'Kjenner forholdet.', 'Ikke nok konsekvensinformasjon.'],
    ['FR-5 eksempel 3 blank begrunnelse', 'resolved', ' ', 'Elektrikerkontroll.'],
    ['FR-5 eksempel 3 blankt grunnlag', 'resolved', 'Tilstrekkelig kontrollert.', '\t'],
    ['FR-5 eksempel 4 ukjent status', 'unknown', 'Tilstrekkelig kontrollert.', 'Elektrikerkontroll.'],
    ['FR-5 eksempel 4 ikke valgt', '', 'Tilstrekkelig kontrollert.', 'Elektrikerkontroll.'],
  ])('%s: AT-8 beholder avklaringsbehov', (_id, status, reason, resolutionBasis) => {
    const finding = tg3('el', true)
    Object.assign(finding.resolution!, { status, reason, basis: resolutionBasis })
    const result = evaluateScreening(addTg3(input(), finding))
    expect(result.priority).toBe(1)
    expect(result.triggers.map(item => item.code)).toEqual(['unresolved-tg3'])
  })
  it('FR-5 eksempel 5: to TG3, bare ett avklart; bare det andre er avgjørende', () => {
    const basis = addTg3(addTg3(input(), tg3('A', true)), tg3('B'))
    expect(evaluateScreening(basis)).toMatchObject({ priority: 1, triggers: [expect.objectContaining({ reason: expect.stringContaining('B: Alvorlig lekkasje') })] })
    expect(evaluateScreening(basis).triggers).toHaveLength(1)
  })
  it('FR-5 eksempel 6: alle TG3 avklart med F2 gir Forkast etter økonomireglene', () => {
    const basis = addTg3(addTg3(input(), tg3('A', true)), tg3('B', true))
    basis.financialBasis.values.L.rawValue = '1400000'
    expect(evaluateScreening(basis)).toMatchObject({ priority: 2, recommendation: 'Forkast', explanation: yieldExplanation })
    expect(codes(basis)).toEqual(['net-yield-below-minimum'])
    expect(evaluateScreening(basis).basis.reportBasis.tg3Findings).toEqual(basis.reportBasis.tg3Findings)
  })
  it('FR-5 eksempel 7: samme rene input med ny Uavklart gir informasjon; ingen snapshot leveres her', () => {
    const basis = addTg3(input(), tg3('A', true))
    expect(evaluateScreening(basis).priority).toBe(3)
    basis.reportBasis.tg3Findings[0]!.resolution!.status = 'unresolved'
    expect(evaluateScreening(basis).priority).toBe(1)
  })
  it.each(['description', 'reportHash', 'documentName', 'pdfPage'] as const)('ugyldig TG3-binding: endret %s gir prioritet 1', field => {
    const finding = tg3('A', true)
    if (field === 'description') finding.resolution!.binding.description = 'Et annet forhold'
    else if (field === 'pdfPage') finding.resolution!.binding.source.pdfPage = 5
    else finding.resolution!.binding.source[field] = field === 'reportHash' ? 'b'.repeat(64) : 'annen.pdf'
    const result = evaluateScreening(addTg3(input(), finding))
    expect(result.priority).toBe(1)
    expect(result.explanation).toContain('et annet eller ukjent rapportgrunnlag')
  })
  it('representasjonsretting tillatt av felles TG3-autoritet bevarer avklaringen', () => {
    const finding = tg3('A', true)
    finding.resolution!.binding.description = '  Alvorlig   lekkasje i tak\n'
    expect(evaluateScreening(addTg3(input(), finding)).priority).toBe(3)
  })
})

describe('Story 3.4 AC5 — determinisme, alle utløsere og isolert input', () => {
  it('AT-18: alle fire kjente forhold i full fast orden med mål og handling', () => {
    const result = evaluateScreening(at18())
    expect(result.priority).toBe(1)
    expect(result.triggers.map(item => item.code)).toEqual(['missing-value', 'missing-value', 'incomplete-report', 'unresolved-tg3'])
    expect(result.triggers[0]).toMatchObject({ field: 'L', action: 'Oppgi verdien for L.' })
    expect(result.triggers[1]).toMatchObject({ field: 'Ymin', action: 'Oppgi verdien for Ymin.' })
    expect(result.triggers[2]).toMatchObject({ target: 'report', reason: 'Dokument-/analysefeil (interrupted).' })
    expect(result.triggers[3]).toMatchObject({ target: 'report', reason: expect.stringContaining('tak: Alvorlig lekkasje i tak (f4.pdf, PDF-side 4)') })
    expect(result.explanation).toBe('Kritisk grunnlag er utilstrekkelig. L: Verdien mangler. Ymin: Verdien mangler. Rapportgrunnlaget er ufullført: Dokument-/analysefeil (interrupted). Alvorlig TG3 er uavklart: tak: Alvorlig lekkasje i tak (f4.pdf, PDF-side 4). Velg eksplisitt Avklart med nødvendig grunnlag, eller behold Uavklart. Oppgi en kort begrunnelse for at forholdet er tilstrekkelig avklart for førstevurdering. Oppgi konkret eksternt avklaringsgrunnlag, for eksempel vurdering fra relevant fagkyndig med dato eller referanse.')
    expect(result.nextAction).toBe('Før ny vurdering: Oppgi verdien for L. Oppgi verdien for Ymin. Avklar den oppgitte rapportmangelen og fullfør analyse og kontroll av gjeldende rapportgrunnlag. Innhent konkret avklaringsgrunnlag for det navngitte TG3-forholdet og registrer status og begrunnelse for førstevurdering.')
  })
  it.each(['F1', 'F2', 'AT-18'])('AT-19 %s: identiske ordnede utløsere, full begrunnelse/handling og input uten I/O', variant => {
    const basis = variant === 'AT-18' ? at18() : input()
    if (variant === 'F2') basis.financialBasis.values.L.rawValue = '1400000'
    const before = structuredClone(basis)
    const network = vi.fn(() => { throw new Error('Nettverk skal aldri brukes av ren screening') })
    vi.stubGlobal('fetch', network)
    try {
      const first = evaluateScreening(freezeDeep(basis))
      for (let count = 0; count < 5; count++) expect(JSON.stringify(evaluateScreening(basis))).toBe(JSON.stringify(first))
      expect(basis).toEqual(before)
      expect(network).not.toHaveBeenCalled()
      if (variant === 'F1') expect(first).toMatchObject({ explanation: proceedExplanation, nextAction: 'Gå videre til grundigere vurdering/befaring.' })
      if (variant === 'F2') expect(first).toMatchObject({ explanation: yieldExplanation, nextAction: 'Forkast objektet på det gjeldende screeninggrunnlaget.' })
    } finally { vi.unstubAllGlobals() }
  })
  it('stabil TG3-/rapportorden og lokal autoritet ved permuterte funn/feil', () => {
    const basis = addTg3(addTg3(input(), tg3('B')), tg3('A'))
    const outcome = basis.reportBasis.outcome!
    if (outcome.status !== 'completed') throw new Error('Fixture')
    outcome.limitations = ['Z: Mangler kjent vedlegg.', 'A: Kjent usikkerhet.']
    const first = evaluateScreening(basis)
    basis.reportBasis.tg3Findings.reverse(); outcome.findings.reverse(); outcome.limitations.reverse()
    const second = evaluateScreening(basis)
    expect(second.triggers).toEqual(first.triggers)
    expect(second.explanation).toBe(first.explanation)
    expect(second.nextAction).toBe(first.nextAction)
  })
  it('utdatamutering endrer ikke input eller senere beregninger/terskler', () => {
    const basis = addTg3(input(), tg3('A', true))
    const before = structuredClone(basis)
    const expected = evaluateScreening(basis)
    const first = evaluateScreening(basis)
    first.basis.financialBasis.values.L.rawValue = '1'
    first.basis.reportBasis.tg3Findings[0]!.current.description = 'Endret resultatkopi'
    first.metrics.netYield.basis.inputs[0]!.source.description = 'Endret kildekopi'
    first.thresholds.netYield.basis.minimumYield.registered.rawValue = '999'
    expect(basis).toEqual(before)
    expect(evaluateScreening(basis)).toEqual(expected)
  })
  it('ekte finans/terskler er identiske før og etter fullscreening; ingen formatering er regelinput', () => {
    const basis = at18()
    const metrics = calculateFinancialMetrics(basis.financialBasis)
    const yieldThreshold = evaluateNetYieldThreshold(basis.financialBasis)
    const cashThreshold = evaluateCashFlowThreshold(basis.financialBasis)
    const result = evaluateScreening(freezeDeep(basis))
    expect(result.metrics).toEqual(metrics)
    expect(result.thresholds).toEqual({ netYield: yieldThreshold, cashFlow: cashThreshold })
    expect(calculateFinancialMetrics(basis.financialBasis)).toEqual(metrics)
    expect(evaluateNetYieldThreshold(basis.financialBasis)).toEqual(yieldThreshold)
    expect(evaluateCashFlowThreshold(basis.financialBasis)).toEqual(cashThreshold)
  })
})


describe('uavhengig review — rapport og separat TG3-grunnlag må samsvare', () => {
  it.each(['missing', 'different-current'] as const)('aktivt TG3 med %s projeksjon kan aldri gi tilstrekkelig teknisk grunnlag', variant => {
    const basis = addTg3(input(), tg3('tak', true))
    if (variant === 'missing') basis.reportBasis.tg3Findings = []
    else {
      const finding = basis.reportBasis.tg3Findings[0]!
      finding.current.description = 'Et annet forhold'
      finding.resolution!.binding = structuredClone(finding.current)
    }
    const local = evaluateKnownDeficiencies({ financialBasis: basis.financialBasis,
      reportDeficiencies: assessFindingList(basis.reportBasis).reportDeficiencies,
      tg3Findings: basis.reportBasis.tg3Findings })
    const result = evaluateScreening(basis)
    expect(result).toMatchObject({ priority: 1, recommendation: 'Innhent mer informasjon' })
    expect(result.triggers).toContainEqual(expect.objectContaining({ code: 'unresolved-tg3',
      reason: expect.stringContaining('tak: Alvorlig lekkasje i tak (f4.pdf, PDF-side 4)') }))
    expect(assessFindingList(basis.reportBasis).controlCompleted).toBe(false)
    expect(result.triggers).toEqual(local.triggers)
    expect(result.nextAction).toBe(local.nextAction)
  })

  it('kjent TG3 i failed delresultat bevares som egen utløser også uten separat projeksjon', () => {
    const basis = addTg3(input())
    const completed = basis.reportBasis.outcome!
    if (completed.status !== 'completed') throw new Error('Fixture')
    basis.reportBasis.status = 'failed'
    basis.reportBasis.error = 'interrupted'
    basis.reportBasis.outcome = { ...completed, status: 'failed',
      error: { kind: 'analysis', code: 'interrupted', target: null, reason: null },
      partialResult: { completeness: 'incomplete', findings: completed.findings, uncertainCandidates: [], limitations: [] } }
    basis.reportBasis.tg3Findings = []
    const result = evaluateScreening(basis)
    expect(result.priority).toBe(1)
    expect(result.triggers.map(item => item.code)).toEqual(['incomplete-report', 'unresolved-tg3'])
  })

  it.each(['resolved', 'corrected-tg2', 'rejected'] as const)('ekte reportReducer og TG3-selektor: %s gir korrekt full screening', variant => {
    const basis = addTg3(input())
    let state: ReportState = { ...createReportState(), generation: 1, status: 'completed',
      selected: { file: new File(['%PDF'], 'f4.pdf'), bytes: new Uint8Array(), hash },
      outcome: basis.reportBasis.outcome }
    const act = (type: 'report-finding-edit' | 'report-finding-apply' | 'report-finding-confirm' | 'report-finding-reject') => {
      state = reportReducer(state, { type, generation: 1, findingId: 'tak' })
    }
    if (variant === 'rejected') act('report-finding-reject')
    else if (variant === 'corrected-tg2') {
      act('report-finding-edit')
      state = reportReducer(state, { type: 'report-finding-draft', generation: 1, findingId: 'tak', field: 'grade', value: 'TG2' })
      act('report-finding-apply')
    }
    if (variant !== 'rejected') act('report-finding-confirm')
    state = reportReducer(state, { type: 'report-list-confirm', generation: 1, reportHash: hash,
      documentName: 'f4.pdf', listRevision: state.listRevision })
    if (variant === 'resolved') {
      const unhandled = { ...basis, reportBasis: { ...basis.reportBasis, controls: state.findingControls,
        listRevision: state.listRevision, listConfirmationRevision: state.listConfirmationRevision, tg3Findings: currentTg3Findings(state) } }
      expect(evaluateScreening(unhandled).priority).toBe(1)
      for (const [field, value] of [['status', 'resolved'], ['reason', 'Kontrollert for førstevurdering.'], ['basis', 'Fagkontroll ref T-42.']] as const) {
        state = reportReducer(state, { type: 'report-tg3-register', generation: 1, findingId: 'tak', field, value })
      }
    }
    basis.reportBasis = { status: state.status, outcome: state.outcome, error: state.error,
      reportIdentity: { reportHash: state.selected!.hash, documentName: state.selected!.file.name },
      controls: state.findingControls, listRevision: state.listRevision,
      listConfirmationRevision: state.listConfirmationRevision, tg3Findings: currentTg3Findings(state) }
    expect(reportDeficiencies(state).status).toBe('no-known-deficiencies')
    expect(evaluateScreening(basis)).toMatchObject({ priority: 3, recommendation: 'Gå videre' })
    expect(basis.reportBasis.outcome?.status).toBe('completed')
    if (basis.reportBasis.outcome?.status === 'completed') expect(basis.reportBasis.outcome.findings[0]!.grade).toBe('TG3')
    expect(basis.reportBasis.tg3Findings).toHaveLength(variant === 'resolved' ? 1 : 0)
  })
})
