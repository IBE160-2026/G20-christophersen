import { describe, expect, it, vi } from 'vitest'
import { createHash } from 'node:crypto'
import { bindAnalysisOutcome } from '../../src/contracts/analysis-validation.ts'
import { CONTRACT_VERSION, EXTRACTION_VERSION } from '../../src/contracts/document-analysis.ts'
import { createReportState, reportReducer, reportDeficiencies } from '../../src/frontend/state/report.ts'
import type { ReportAction, ReportState } from '../../src/frontend/state/report.ts'
import { createInitialSession, sessionReducer } from '../../src/frontend/state/session.ts'
import { ReportClient } from '../../src/frontend/analysis/report-client.ts'

const bytes = new Uint8Array([37, 80, 68, 70])
const hash = createHash('sha256').update(bytes).digest('hex')
const file = new File([bytes], 'rapport.pdf', { type: 'application/pdf' })
const correlation = { sessionId: 'session', requestId: 'request', generation: 1 }
function ready() {
  return reportReducer(reportReducer(createReportState(), { type: 'report-selecting', generation: 1 }),
    { type: 'report-selected', generation: 1, selected: { file, bytes, hash } })
}
function active() { return reportReducer(ready(), { type: 'report-start', correlation }) }
function response(candidates: unknown[] = []) {
  return { kind: 'analysis', correlation: { ...correlation }, outcome: bindAnalysisOutcome({
    contractVersion: CONTRACT_VERSION, extractionVersion: EXTRACTION_VERSION, mode: 'demo',
    requestId: correlation.requestId, reportHash: hash, documentName: file.name, pageCount: 1,
    pages: [{ pdfPage: 1, text: 'Rapport', status: 'readable', reason: null }],
  }, { contractVersion: CONTRACT_VERSION, extractionVersion: EXTRACTION_VERSION, status: 'completed', findings: candidates, limitations: [] }) }
}
const candidate = { findingId: 'funn', grade: 'TG3', description: 'Våtrom', source: { documentName: file.name, pdfPage: 1 }, uncertainties: [] }
function receive(body: unknown, state = active(), ok = true) {
  return reportReducer(state, { type: 'report-response', correlation, body, ok })
}
function harness(fetcher: typeof fetch = vi.fn()) {
  let state: ReportState = createReportState()
  const actions: ReportAction[] = []
  const dispatch = (action: ReportAction) => { actions.push(action); state = reportReducer(state, action) }
  let id = 0
  const client = new ReportClient(dispatch, { fetch: fetcher, hash: async () => hash, id: () => `id-${++id}` })
  return { client, dispatch, getState: () => state, actions }
}

describe('Story 2.6 — ren rapporttilstand og klientforløp', () => {
  it('manglende rapport er kjent domain-mangel; start uten rapport/tall sender ikke HTTP', async () => {
    const fetcher = vi.fn()
    const h = harness(fetcher)
    expect(reportDeficiencies(h.getState())).toMatchObject({ status: 'information-required', triggers: [{ code: 'missing-report' }] })
    await h.client.start(true, h.getState())
    await h.client.select(file, h.getState())
    await h.client.start(false, h.getState())
    expect(fetcher).not.toHaveBeenCalled()
    expect(sessionReducer({ ...createInitialSession(), report: ready() }, { type: 'report-start', correlation }).report.status).toBe('ready')
  })
  it('bevarer originale bytes/hash og starter ikke automatisk ved filvalg', async () => {
    const fetcher = vi.fn()
    const h = harness(fetcher)
    await h.client.select(file, h.getState())
    expect(h.getState()).toMatchObject({ status: 'ready', selected: { file, bytes, hash } })
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('synkront dobbeltvern gir ett multipart POST med korrelasjon og abortsignal', async () => {
    let settle!: (response: Response) => void
    const fetcher = vi.fn(() => new Promise<Response>(resolve => { settle = resolve }))
    const h = harness(fetcher)
    await h.client.select(file, h.getState())
    const first = h.client.start(true, h.getState())
    await h.client.start(true, h.getState())
    expect(fetcher).toHaveBeenCalledTimes(1)
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/analysis')
    expect(init).toMatchObject({ method: 'POST', headers: { 'X-Session-Id': 'id-1', 'X-Request-Id': 'id-2', 'X-Analysis-Generation': '1' } })
    expect((init.body as FormData).getAll('file')).toHaveLength(1)
    expect(init.signal?.aborted).toBe(false)
    settle(new Response(JSON.stringify({ ...response(), correlation: { sessionId: 'id-1', requestId: 'id-2', generation: 1 }, outcome: { ...response().outcome, requestId: 'id-2' } })))
    await first
    expect(h.getState().status).toBe('completed')
  })
  it('completed bevarer alle funn og usikkerheter uten brukerbekreftelse', () => {
    const result = receive(response([candidate, { ...candidate, findingId: 'usikker', grade: 'uklar', source: null, uncertainties: ['Usikker tekst'] }]))
    expect(result.outcome).toMatchObject({ status: 'completed', findings: [{ grade: 'TG3' }], uncertainCandidates: [{ findingId: 'usikker' }] })
    expect(result.listVisibleGeneration).toBeNull()
    expect(reportDeficiencies(result).triggers.length).toBeGreaterThan(1)
    expect(reportReducer(result, { type: 'report-list-visible', generation: 1 }).listVisibleGeneration).toBe(1)
  })
  it('gyldig tomliste er completed; manglende findings er feil', () => {
    expect(receive(response()).status).toBe('completed')
    const body = response(); delete (body.outcome as unknown as Record<string, unknown>).findings
    expect(receive(body)).toMatchObject({ status: 'failed', error: 'invalid-response', outcome: null })
  })
  it.each([null, {}, { kind: 'analysis' }, 'completed', { kind: 'rejected', code: 'hemmelig' }])('ugyldig 200-retur %j blir analysefeil', body => {
    expect(receive(body)).toMatchObject({ status: 'failed', error: 'invalid-response' })
  })
  it.each(['sessionId', 'requestId', 'generation'] as const)('feil %s i aktiv korrelasjon feiler fremfor fullføring', field => {
    const body = response()
    ;(body.correlation as Record<string, unknown>)[field] = field === 'generation' ? 2 : 'wrong'
    expect(receive(body).status).toBe('failed')
  })
  it.each(['reportHash', 'requestId', 'mode', 'documentName'] as const)('feil %s i utfall feiler', field => {
    const body = response()
    ;(body.outcome as unknown as Record<string, unknown>)[field] = field === 'reportHash' ? '0'.repeat(64) : field === 'mode' ? 'live' : 'wrong'
    expect(receive(body).status).toBe('failed')
  })
  it('completed på HTTP-feil er transportfeil, trygg avvisning er lokal feil', () => {
    expect(receive(response(), active(), false)).toMatchObject({ status: 'failed', error: 'transport-failure' })
    expect(receive({ kind: 'rejected', code: 'duplicate-analysis' })).toMatchObject({ status: 'failed', error: 'duplicate-analysis' })
  })
  it.each(['document', 'analysis'] as const)('validert %s-feil med delresultat forblir ufullført og domain-mangel', kind => {
    const body = response([candidate])
    const extraction = body.outcome.status === 'completed' ? body.outcome : null
    const failed = { ...body, outcome: { ...body.outcome, status: 'failed', error: { kind, code: kind === 'document' ? 'unreadable-text' : 'timeout', target: null, reason: null },
      partialResult: { completeness: 'incomplete', findings: extraction!.findings, uncertainCandidates: [], limitations: ['Kun delresultat'] } } }
    for (const field of ['findings', 'uncertainCandidates', 'limitations', 'validationScope']) delete (failed.outcome as Record<string, unknown>)[field]
    const result = receive(failed)
    expect(result.status).toBe('failed')
    expect(result.outcome?.status === 'failed' && result.outcome.partialResult?.findings).toHaveLength(1)
    // AT18/2.11: Behold samtlige kjente mangler, også TG3 fra delresultatet.
    expect(reportDeficiencies(result).triggers).toMatchObject([
      { code: 'incomplete-report', reason: `Dokument-/analysefeil (${kind === 'document' ? 'unreadable-text' : 'timeout'}).` },
      { code: 'incomplete-report', reason: 'Kun delresultat' },
      { code: 'unresolved-tg3' },
    ])
    expect(reportReducer(result, { type: 'report-list-visible', generation: 1 }).listVisibleGeneration).toBeNull()
  })
  it('forlatt analyse og rapportbytte gjør sent completed og feil ubrukelige', () => {
    for (const state of [reportReducer(active(), { type: 'report-abandon' }), reportReducer(active(), { type: 'report-selecting', generation: 2 })]) {
      expect(receive(response(), state)).toBe(state)
      expect(reportReducer(state, { type: 'report-error', generation: 1, code: 'transport-failure' })).toBe(state)
    }
  })
  it('best effort-abort forsøkes selv når fetch ignorerer abort; sen retur bytter ikke rapport', async () => {
    let settle!: (response: Response) => void
    let signal: AbortSignal | null | undefined
    const fetcher = vi.fn((_url: string | URL | Request, init?: RequestInit) => {
      signal = init?.signal; return new Promise<Response>(resolve => { settle = resolve })
    })
    const h = harness(fetcher)
    await h.client.select(file, h.getState())
    const pending = h.client.start(true, h.getState())
    await h.client.select(new File([bytes], 'ny.pdf'), h.getState())
    expect(signal?.aborted).toBe(true)
    settle(new Response(JSON.stringify(response())))
    await pending
    expect(h.getState()).toMatchObject({ status: 'ready', generation: 2, selected: { file: { name: 'ny.pdf' } }, outcome: null })
  })
  it('avbrutt/feilet fetch og ugyldig JSON gir synlig feil uten retry', async () => {
    for (const fetcher of [vi.fn().mockRejectedValue(new Error('privat råfeil')), vi.fn().mockResolvedValue(new Response('ikke JSON'))]) {
      const h = harness(fetcher)
      await h.client.select(file, h.getState()); await h.client.start(true, h.getState())
      expect(h.getState()).toMatchObject({ status: 'failed', outcome: null })
      expect(['transport-failure', 'invalid-response']).toContain(h.getState().error)
      expect(fetcher).toHaveBeenCalledTimes(1)
    }
  })
  it('gammelt svar og finally kan ikke endre eller låse opp en nyere pågående request', async () => {
    const pending: { init: RequestInit; settle: (response: Response) => void }[] = []
    const fetcher = vi.fn((_url: string | URL | Request, init?: RequestInit) => new Promise<Response>(settle => { pending.push({ init: init!, settle }) }))
    const h = harness(fetcher)
    await h.client.select(file, h.getState())
    const first = h.client.start(true, h.getState())
    await h.client.select(new File([bytes], 'ny.pdf'), h.getState())
    const second = h.client.start(true, h.getState())
    const complete = (index: number, documentName: string) => {
      const headers = pending[index]!.init.headers as Record<string, string>
      pending[index]!.settle(new Response(JSON.stringify({ ...response(), correlation: { sessionId: headers['X-Session-Id'], requestId: headers['X-Request-Id'], generation: Number(headers['X-Analysis-Generation']) },
        outcome: { ...response().outcome, requestId: headers['X-Request-Id'], documentName } })))
    }
    complete(0, file.name); await first
    expect(h.getState()).toMatchObject({ status: 'analysing', generation: 2, outcome: null })
    expect(pending[1]!.init.signal?.aborted).toBe(false)
    await h.client.start(true, h.getState())
    expect(fetcher).toHaveBeenCalledTimes(2)
    complete(1, 'ny.pdf'); await second
    expect(h.getState()).toMatchObject({ status: 'completed', outcome: { documentName: 'ny.pdf' } })
  })
  it('konkurrerende filhash, tomt filvalg og lesefeil beholder bare gjeldende generasjon', async () => {
    let state = createReportState()
    const hashes: ((value: string) => void)[] = []
    const client = new ReportClient(action => { state = reportReducer(state, action) }, {
      fetch: vi.fn(), id: () => 'id', hash: () => new Promise(resolve => { hashes.push(resolve) }),
    })
    const first = client.select(file, state)
    await vi.waitFor(() => expect(hashes).toHaveLength(1))
    const second = client.select(new File([bytes], 'ny.pdf'), state)
    await vi.waitFor(() => expect(hashes).toHaveLength(2))
    hashes[1]!(hash); await second
    hashes[0]!(hash); await first
    expect(state).toMatchObject({ status: 'ready', generation: 2, selected: { file: { name: 'ny.pdf' } } })
    await client.select(null, state)
    expect(state).toMatchObject({ status: 'failed', selected: null, error: 'missing-report' })
    await client.select({ arrayBuffer: () => Promise.reject(new Error('privat')) } as unknown as File, state)
    expect(state).toMatchObject({ status: 'failed', error: 'file-read-failure' })
  })
  it('retur og finansendring bevarer completed/usikkerheter og gir ingen ny request', () => {
    const report = receive(response([{ ...candidate, grade: '?' }]))
    let session = { ...createInitialSession(), report }
    session = sessionReducer(session, { type: 'navigate', step: 'tallgrunnlag' })
    session = sessionReducer(session, { type: 'register-value', field: 'P', rawValue: '1000' })
    session = sessionReducer(session, { type: 'confirm-financial' })
    expect(session.report).toBe(report)
    expect(reportDeficiencies(session.report)).toEqual(reportDeficiencies(report))
    expect(reportReducer(report, { type: 'report-start', correlation })).toBe(report)
  })
})

describe('Story 2.6 — uavhengige fase-3-raceprøver', () => {
  it('gammel transportfeil etter best effort-abort påvirker verken nyere request eller dens startlås', async () => {
    const requests: { init: RequestInit; resolve: (r: Response) => void; reject: (e: Error) => void }[] = []
    const fetcher = vi.fn((_url: string | URL | Request, init?: RequestInit) => new Promise<Response>((resolve, reject) => { requests.push({ init: init!, resolve, reject }) }))
    const h = harness(fetcher)
    await h.client.select(file, h.getState())
    const old = h.client.start(true, h.getState())
    await h.client.select(new File([bytes], 'nyere.pdf'), h.getState())
    const current = h.client.start(true, h.getState())
    expect(requests[0]!.init.signal?.aborted).toBe(true)
    requests[0]!.reject(new Error('sent transportavslag'))
    await old
    expect(h.getState()).toMatchObject({ generation: 2, status: 'analysing', error: null })
    await h.client.start(true, h.getState())
    expect(fetcher).toHaveBeenCalledTimes(2)
    const headers = requests[1]!.init.headers as Record<string, string>
    const requestId = headers['X-Request-Id']!
    requests[1]!.resolve(new Response(JSON.stringify({ ...response(), correlation: { sessionId: headers['X-Session-Id'], requestId, generation: 2 }, outcome: { ...response().outcome, requestId, documentName: 'nyere.pdf' } })))
    await current
    expect(h.getState()).toMatchObject({ status: 'completed', selected: { file: { name: 'nyere.pdf' } } })
  })
  it('avbrudd under JSON-lesing forkaster gammel feil/fullføring og frigjør bare eget finally', async () => {
    let finishJson!: (value: unknown) => void
    const oldResponse = new Response()
    vi.spyOn(oldResponse, 'json').mockImplementation(() => new Promise(resolve => { finishJson = resolve }))
    const fetcher = vi.fn().mockResolvedValueOnce(oldResponse).mockRejectedValueOnce(new Error('ny transportfeil'))
    const h = harness(fetcher)
    await h.client.select(file, h.getState())
    const old = h.client.start(true, h.getState())
    await vi.waitFor(() => expect(finishJson).toBeDefined())
    h.dispatch({ type: 'report-abandon' }); h.client.abort()
    await h.client.start(true, h.getState())
    expect(h.getState()).toMatchObject({ generation: 2, status: 'failed', error: 'transport-failure' })
    const newer = h.getState()
    finishJson(response()); await old
    expect(h.getState()).toBe(newer)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
})
