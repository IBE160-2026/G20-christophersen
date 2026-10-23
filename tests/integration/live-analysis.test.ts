import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'
import { extractPdf } from '../../src/backend/documents/extract-pdf.ts'
import { analyzeDocument } from '../../src/backend/analysis/analyze-document.ts'
import { createAnalysisBackend } from '../../src/backend/analysis/backend-config.ts'
import { createLiveAdapter } from '../../src/backend/analysis/live-adapter.ts'
import { createInitialSession, sessionReducer } from '../../src/frontend/state/session.ts'
import { findingListAssessment } from '../../src/frontend/state/report.ts'
import { calculateResultSnapshot, selectResult } from '../../src/frontend/state/result.ts'
import oracle from '../fixtures/property-cases/expected.json' with { type: 'json' }

// Forventningene er håndskrevet fra PRD-addendum/Story 2.2-fasit, aldri
// generert med adapter, finans, formattering eller screening som testes.
const expectedCases = [
  { id: 'F1', rent: '1900000', noi: '1500000', cash: '700000', recommendation: 'Gå videre', priority: 3, partialBasis: false,
    codes: ['net-yield-requirement-met', 'cash-flow-nonnegative', 'technical-basis-sufficient'] },
  { id: 'F2', rent: '1400000', noi: '1000000', cash: '200000', recommendation: 'Forkast', priority: 2, partialBasis: false,
    codes: ['net-yield-below-minimum'] },
  { id: 'F3', rent: null, noi: null, cash: null, recommendation: 'Innhent mer informasjon', priority: 1, partialBasis: true,
    codes: ['missing-value'] },
  { id: 'F4', rent: '1900000', noi: '1500000', cash: '700000', recommendation: 'Innhent mer informasjon', priority: 1, partialBasis: true,
    codes: ['unresolved-tg3'] },
] as const

describe('Story 4.2 — faktisk PDF → live SDK (offline) → samme kontroll/finans/screening', () => {
  it.each(expectedCases)('$id: samlet uavhengig fasit, korrekt kilde, kontrollport og ett adapterkall', async expected => {
    const fixture = oracle.cases.find(item => item.caseId === expected.id)!
    const bytes = new Uint8Array(await readFile(new URL(`../fixtures/property-cases/${fixture.documentName}`, import.meta.url)))
    const format = await validatePdf(bytes, fixture.documentName)
    expect(format.status).toBe('format-validated')
    if (format.status !== 'format-validated') throw new Error('Fasit-PDF skal valideres')
    const correlation = { generation: 1, sessionId: 'story-5-1', requestId: `samlet-${expected.id}` }
    const extraction = await extractPdf(format, { mode: 'live', requestId: correlation.requestId })
    expect(extraction.error).toBeNull()
    const backend = createAnalysisBackend('live', { environment: { OPENAI_API_KEY: 'fictional-offline-only' }, fetch: async (_url, init) => {
      const body = JSON.parse(String(init?.body))
      expect(JSON.parse(body.input[0].content[0].text)).toEqual(extraction.document)
      expect(body).toMatchObject({ model: 'gpt-6.1-sol', reasoning: { effort: 'low' }, service_tier: 'default', max_output_tokens: 128000, truncation: 'disabled', text: { format: { strict: true } } })
      const result = { findings: fixture.findings.map(finding => ({ findingId: finding.id, grade: finding.grade, description: finding.description, source: { documentName: fixture.documentName, reportHash: format.reportHash, pdfPage: finding.pdfPage }, uncertainties: [] })), limitations: [] }
      return new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text: JSON.stringify(result) }] }] }))
    } })
    if (backend.mode !== 'live') throw new Error()
    const adapter = createLiveAdapter(backend)
    let calls = 0
    const outcome = await analyzeDocument(extraction.document, { mode: 'live', analyze(document) {
      calls++
      return adapter.analyze(document)
    } })
    expect(outcome.status).toBe('completed')
    if (outcome.status !== 'completed') throw new Error('Fasit-PDF skal ha fullført kontrollert live-uttrekk')
    expect(outcome.findings.map(finding => ({ id: finding.findingId, grade: finding.grade,
      description: finding.description, pdfPage: finding.source.pdfPage }))).toEqual(
      fixture.findings.map(finding => ({ id: finding.id, grade: finding.grade,
        description: finding.description, pdfPage: finding.pdfPage })))
    for (const finding of outcome.findings) {
      expect(finding.source.reportHash).toBe(format.reportHash)
      expect(finding.source.documentName).toBe(fixture.documentName)
      expect(extraction.document.pages[finding.source.pdfPage - 1]!.text).toContain(finding.description)
    }

    let state = createInitialSession()
    for (const field of ['P', 'L', 'D', 'J', 'Ymin'] as const) {
      state = sessionReducer(state, { type: 'register-value', field, rawValue: fixture.financialInputs[field] ?? '' })
      state = sessionReducer(state, { type: 'register-source', field,
        source: { kind: 'assumption', description: `Fasitgrunnlag ${field}`, conflict: null } })
    }
    for (const field of ['L', 'D', 'J'] as const) {
      state = sessionReducer(state, { type: 'register-period', field, period: 'year' })
      state = sessionReducer(state, { type: 'register-year', field, year: '2026' })
    }
    state = sessionReducer(state, { type: 'register-rent-nature', rentNature: 'expected' })
    state = sessionReducer(state, { type: 'confirm-financial' })
    if (expected.id === 'F3') {
      // F3 er bevisst ikke en ny UI-vei: den normale tallporten er fortsatt sperret.
      expect(sessionReducer(state, { type: 'navigate', step: 'tilstandsrapport' })).toBe(state)
      expect(sessionReducer(state, { type: 'navigate', step: 'resultat' })).toBe(state)
      // Rapportkontroll etableres med gyldig L; L fjernes igjen etter kontroll.
      // Dermed prøves F3 ved den rene grensen uten å omgå report-start-porten.
      state = sessionReducer(state, { type: 'register-value', field: 'L', rawValue: '1900000' })
      state = sessionReducer(state, { type: 'confirm-financial' })
    }
    state = sessionReducer(state, { type: 'navigate', step: 'tilstandsrapport' })
    const selected = { bytes, hash: format.reportHash, file: new File([bytes], fixture.documentName) }
    state = sessionReducer(state, { type: 'report-selecting', generation: 1 })
    state = sessionReducer(state, { type: 'report-selected', generation: 1, selected })
    state = sessionReducer(state, { type: 'report-start', correlation })
    state = sessionReducer(state, { type: 'report-response', correlation, ok: true,
      body: { kind: 'analysis', correlation, outcome: { ...outcome, mode: 'demo' } } })
    expect(findingListAssessment(state.report).controlCompleted).toBe(false)
    expect(state.resultSnapshot).toBeNull()
    expect(sessionReducer(state, { type: 'navigate', step: 'resultat' })).toBe(state)
    state = sessionReducer(state, { type: 'report-list-visible', generation: 1 })
    for (const finding of outcome.findings) {
      state = sessionReducer(state, { type: 'report-finding-confirm', generation: 1, findingId: finding.findingId })
      if (finding.grade === 'TG3') state = sessionReducer(state, { type: 'report-tg3-register', generation: 1,
        findingId: finding.findingId, field: 'status', value: 'unresolved' })
    }
    state = sessionReducer(state, { type: 'report-list-confirm', generation: 1,
      reportHash: selected.hash, documentName: fixture.documentName, listRevision: state.report.listRevision })
    expect(findingListAssessment(state.report).controlCompleted).toBe(true)

    if (expected.id === 'F3') {
      state = sessionReducer(state, { type: 'navigate', step: 'tallgrunnlag' })
      state = sessionReducer(state, { type: 'register-value', field: 'L', rawValue: '' })
    }

    // Den rene snapshotgrensen støtter mangelfasit selv når UI-porten er sperret.
    const snapshot = calculateResultSnapshot(state)
    expect(snapshot.assessment.basis.reportBasis.outcome).toEqual({ ...outcome, mode: 'demo' })
    expect(Object.keys(snapshot.assessment.metrics).sort()).toEqual([
      'cashFlowBeforeTax', 'grossYield', 'netYield', 'noi',
    ])
    expect(snapshot.assessment).toMatchObject({ recommendation: expected.recommendation,
      priority: expected.priority, partialBasis: expected.partialBasis })
    expect(snapshot.assessment.triggers.map(trigger => trigger.code)).toEqual(expected.codes)
    if (expected.id === 'F3') {
      for (const metric of Object.values(snapshot.assessment.metrics)) {
        expect(metric.status).toBe('unavailable')
        expect(metric.value).toBeNull()
        expect(metric.issues).toContainEqual(expect.objectContaining({ field: 'L', code: 'missing-value' }))
      }
      expect(snapshot.assessment.nextAction).toContain('L')
      expect(sessionReducer(state, { type: 'navigate', step: 'resultat' })).toBe(state)
      expect(state.resultSnapshot).toBeNull()
      expect(state.currentStep).toBe('tallgrunnlag')
    } else {
      expect(snapshot.assessment.metrics).toMatchObject({
        grossYield: { status: 'available', value: { kind: 'ratio', numerator: expected.rent, denominator: '16000000' } },
        noi: { status: 'available', value: { kind: 'amount', amount: expected.noi } },
        netYield: { status: 'available', value: { kind: 'ratio', numerator: expected.noi, denominator: '16000000' } },
        cashFlowBeforeTax: { status: 'available', value: { kind: 'amount', amount: expected.cash } },
      })
      state = sessionReducer(state, { type: 'navigate', step: 'resultat' })
      expect(state.currentStep).toBe('resultat')
      expect(selectResult(state).status).toBe('current')
      expect(state.resultSnapshot).toEqual(snapshot)
      expect(snapshot.binding).toMatchObject({ report: { generation: 1, requestId: correlation.requestId,
        status: 'completed', reportHash: selected.hash, documentName: fixture.documentName },
        listRevision: state.report.listRevision, listConfirmationRevision: state.report.listRevision })
      if (expected.id === 'F4') {
        expect(snapshot.assessment.triggers[0]?.message).toContain('PDF-side 4')
        expect(snapshot.assessment.basis.reportBasis.tg3Findings).toMatchObject([
          { findingId: 'F4-TG3-1', resolution: { status: 'unresolved' } },
        ])
      }
    }
    expect(calls).toBe(1)
  })
})

// Actual parser output, including status/reason and final physical page, reaches
// the serialized SDK request unchanged. No synthetic substitute for PDF.js.
it.each([
  ['property-cases', 'text-30-pages.pdf'],
  ['pdf-readability', 'readable-blank.pdf'],
])('serializes complete %s/%s in one attempt', async (directory, name) => {
  const format = await validatePdf(await readFile(new URL(`../fixtures/${directory}/${name}`, import.meta.url)), name)
  if (format.status !== 'format-validated') throw new Error()
  const { document } = await extractPdf(format, { mode: 'live', requestId: 'whole-fixture' })
  let calls = 0
  const backend = createAnalysisBackend('live', { environment: { OPENAI_API_KEY: 'fictional-offline-only' }, fetch: async (_url, init) => {
    calls++
    const request = JSON.parse(String(init?.body))
    expect(request.input[0].content[0].text).toBe(JSON.stringify(document))
    const input = JSON.parse(request.input[0].content[0].text)
    expect(input.pages).toEqual(document.pages)
    if (name === 'text-30-pages.pdf') {
      expect(input.pages).toHaveLength(30)
      expect(input.pages[29].text).toContain('Dette er faktisk tekst på PDF-posisjon 30.')
    } else expect(input.pages[1]).toMatchObject({ pdfPage: 2, text: '', status: 'blank', reason: null })
    return new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text: '{"findings":[],"limitations":[]}' }] }] }))
  } })
  if (backend.mode !== 'live') throw new Error()
  expect(await analyzeDocument(document, createLiveAdapter(backend))).toMatchObject({ status: 'completed', findings: [] })
  expect(calls).toBe(1)
})
