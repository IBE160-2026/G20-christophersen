import { describe, expect, it, vi } from 'vitest'
import { createDemoAdapter } from '../../src/backend/analysis/demo-adapter.ts'
import { analyzeDocument } from '../../src/backend/analysis/analyze-document.ts'
import type { AnalysisAdapter } from '../../src/backend/analysis/adapter.ts'
import { AnalysisOutcomeSchema } from '../../src/contracts/document-analysis.ts'
import type { AdapterOutcome, DocumentBasis, OriginalCandidate } from '../../src/contracts/document-analysis.ts'

const hash = 'a'.repeat(64)
function document(): DocumentBasis {
  return { contractVersion: '2', extractionVersion: '1', reportHash: hash,
    documentName: 'kontrollert.pdf', requestId: 'gjeldende-request', mode: 'demo', pageCount: 3,
    pages: [
      { pdfPage: 1, status: 'readable', text: 'Rapporttekst', reason: null },
      { pdfPage: 2, status: 'readable', text: 'Tilstandsgrad: TG2 – Slitt gulv', reason: null },
      { pdfPage: 3, status: 'blank', text: '', reason: null },
    ] }
}
function candidate(): OriginalCandidate {
  return { findingId: 'kontroll-1', grade: 'TG2', description: 'Slitt gulv',
    source: { documentName: 'kontrollert.pdf', reportHash: hash, pdfPage: 2 }, uncertainties: [] }
}
function completed(findings: OriginalCandidate[] = [candidate()]): AdapterOutcome {
  return { contractVersion: '2', extractionVersion: '1', status: 'completed', findings, limitations: [] }
}
function stored(outcome: unknown = completed()) {
  return { reportHash: hash, contractVersion: '2', extractionVersion: '1', outcome }
}
function adapter(value: unknown = stored()) { return createDemoAdapter(async () => JSON.stringify(value)) }

async function expectFailure(value: unknown, code: string, reason: string) {
  const result = await analyzeDocument(document(), adapter(value))
  expect(AnalysisOutcomeSchema.safeParse(result).success).toBe(true)
  expect(result).toMatchObject({ status: 'failed', mode: 'demo', requestId: 'gjeldende-request',
    error: { kind: 'analysis', code, reason }, partialResult: null })
  expect(result).not.toHaveProperty('findings')
}

describe('Story 2.4 AC2 – eksplisitte lagrings-/versjonsfeil', () => {
  it('avviser en annen rapports lagrede konvolutt', async () => {
    await expectFailure({ ...stored(), reportHash: 'b'.repeat(64) }, 'metadata-mismatch',
      'Det lagrede demo-uttrekket tilhører en annen rapporthash.')
  })
  it.each(['contractVersion', 'extractionVersion'] as const)('avviser feil %s i konvolutten', async version => {
    await expectFailure({ ...stored(), [version]: 'gammel' }, 'incompatible-version',
      'Det lagrede demo-uttrekket har en uforenlig kontrakt- eller uttrekksversjon.')
  })
  it.each(['contractVersion', 'extractionVersion'] as const)('avviser feil %s inne i adapterutfallet', async version => {
    await expectFailure(stored({ ...completed(), [version]: 'gammel' }), 'incompatible-version',
      'Det lagrede demo-uttrekket har en uforenlig kontrakt- eller uttrekksversjon.')
  })
  it.each([null, {}, { ...stored(), reportHash: '../hemmelig' }])('avviser ugyldig konvolutt %j', async value => {
    await expectFailure(value, 'invalid-response', 'Det lagrede demo-uttrekket har ugyldig lagringsstruktur.')
  })
  it.each([null, {}, { contractVersion: '2', extractionVersion: '1', status: 'completed', limitations: [] },
    { ...completed(), findings: [{ ...candidate(), confidence: 101 }] }])('avviser ugyldig terminalutfall %j', async value => {
    await expectFailure(stored(value), 'invalid-response', 'Det lagrede demo-uttrekket er ikke et gyldig terminalt adapterutfall.')
  })
  it('ugyldig JSON gir trygg eksplisitt feil', async () => {
    const result = await analyzeDocument(document(), createDemoAdapter(async () => '{ privat råinnhold'))
    expect(result).toMatchObject({ status: 'failed', error: { code: 'invalid-response',
      reason: 'Det lagrede demo-uttrekket har ugyldig JSON-format.' } })
    expect(JSON.stringify(result)).not.toContain('privat råinnhold')
  })
  it('manglende lagring er feil, aldri fullført tomliste', async () => {
    expect(await analyzeDocument(document(), createDemoAdapter(async () => null))).toMatchObject({
      status: 'failed', error: { code: 'adapter-failure', reason: 'Det finnes ikke et lagret demo-uttrekk for denne rapporthashen.' }, partialResult: null,
    })
  })
  it('lesefeil lekker verken rå melding eller lokal filsti', async () => {
    const result = await analyzeDocument(document(), createDemoAdapter(async () => { throw new Error('/privat/DO-NOT-EXPOSE') }))
    expect(result).toMatchObject({ status: 'failed', error: { code: 'adapter-failure',
      reason: 'Det lagrede demo-uttrekket kunne ikke leses lokalt.' } })
    expect(JSON.stringify(result)).not.toContain('DO-NOT-EXPOSE')
  })
})

describe('Story 2.4 AC1/AC4 – felles kontrakt og kildeklassifisering', () => {
  it('bare hash sendes til lokal loader; gjeldende kodekontekst bindes etterpå', async () => {
    const load = vi.fn(async () => JSON.stringify(stored({ ...completed(), requestId: 'gammel', mode: 'live' })))
    const result = await analyzeDocument(document(), createDemoAdapter(load))
    expect(load).toHaveBeenCalledExactlyOnceWith(hash)
    expect(result).toMatchObject({ status: 'completed', requestId: 'gjeldende-request', mode: 'demo', reportHash: hash })
  })
  it('bevarer gyldig eksplisitt tomliste', async () => {
    expect(await analyzeDocument(document(), adapter(stored(completed([]))))).toMatchObject({
      status: 'completed', findings: [], uncertainCandidates: [], limitations: [],
    })
  })
  it('bevarer usikkerhet og original uten å gjette grad/kilde', async () => {
    const original: OriginalCandidate = { findingId: 'usikker', description: 'Mulig lekkasje', grade: 'TG?',
      uncertainties: ['Uklart i originalen'], source: { documentName: null, reportHash: null, pdfPage: '2' } }
    const result = await analyzeDocument(document(), adapter(stored(completed([original]))))
    expect(result.status).toBe('completed')
    if (result.status !== 'completed') throw new Error('Forventet kontraktgyldig usikkerhet.')
    expect(result.findings).toEqual([])
    expect(result.uncertainCandidates[0]?.original).toEqual(original)
    expect(result.uncertainCandidates[0]?.issues.map(issue => issue.code)).toEqual([
      'unclear-grade', 'missing-source', 'invalid-page', 'reported-uncertainty',
    ])
  })
  it.each([0, 4, 1.5, '2', null])('ugyldig fysisk sidereferanse %j beholdes som usikker original', async pdfPage => {
    const original: OriginalCandidate = { ...candidate(), source: { ...candidate().source!, pdfPage } }
    const result = await analyzeDocument(document(), adapter(stored(completed([original]))))
    expect(result.status).toBe('completed')
    if (result.status !== 'completed') throw new Error('Forventet usikker kandidat.')
    expect(result.findings).toEqual([])
    expect(result.uncertainCandidates[0]?.original).toEqual(original)
    expect(result.uncertainCandidates[0]?.issues.map(issue => issue.code)).toContain('invalid-page')
  })
  it('feil rapporthash i originalkilden blir aldri kontrollerbart funn', async () => {
    const original: OriginalCandidate = { ...candidate(), source: { ...candidate().source!, reportHash: 'b'.repeat(64) } }
    const result = await analyzeDocument(document(), adapter(stored(completed([original]))))
    expect(result).toMatchObject({ status: 'completed', findings: [], uncertainCandidates: [{
      original, issues: [{ code: 'hash-mismatch' }],
    }] })
  })
  it('funn på deterministisk blank side avvises eksplisitt', async () => {
    const original: OriginalCandidate = { ...candidate(), source: { ...candidate().source!, pdfPage: 3 } }
    expect(await analyzeDocument(document(), adapter(stored(completed([original]))))).toMatchObject({
      status: 'failed', error: { code: 'invalid-response', target: { kind: 'finding', findingId: 'kontroll-1' } }, partialResult: null,
    })
  })
  it.each([null, { findings: [candidate()], limitations: ['Bare et delresultat'] }])('lagret analysefeil bevarer delresultat %j', async partialResult => {
    const failure: AdapterOutcome = { contractVersion: '2', extractionVersion: '1', status: 'failed',
      code: 'adapter-failure', target: { kind: 'page', pdfPage: 2 }, partialResult }
    const result = await analyzeDocument(document(), adapter(stored(failure)))
    expect(AnalysisOutcomeSchema.safeParse(result).success).toBe(true)
    expect(result.status).toBe('failed')
    if (result.status !== 'failed') throw new Error('Forventet analysefeil.')
    expect(result.error).toMatchObject({ kind: 'analysis', code: 'adapter-failure', target: failure.target })
    if (partialResult === null) expect(result.partialResult).toBeNull()
    else {
      expect(result.partialResult).toMatchObject({ completeness: 'incomplete', limitations: partialResult.limitations })
      expect(result.partialResult?.findings[0]?.original).toEqual(candidate())
    }
  })
  it('dupliserte funnidentiteter kan ikke gi fullført resultat', async () => {
    expect(await analyzeDocument(document(), adapter(stored(completed([candidate(), candidate()]))))).toMatchObject({
      status: 'failed', error: { code: 'invalid-response' },
    })
  })
})

describe('Story 2.4 – dokumentsperre og adaptergrense', () => {
  it.each(['unreadable', 'unknown', 'incomplete'] as const)('%s blokkerer selv når lagret hash finnes', async status => {
    const basis = document()
    basis.pages[1] = { ...basis.pages[1]!, status, reason: 'Kjent trygg dokumentårsak' }
    const load = vi.fn(async () => JSON.stringify(stored()))
    const result = await analyzeDocument(basis, createDemoAdapter(load))
    expect(result).toMatchObject({ status: 'failed', error: { kind: 'document',
      target: { kind: 'page', pdfPage: 2 }, reason: 'Kjent trygg dokumentårsak' }, partialResult: null })
    expect(load).not.toHaveBeenCalled()
    expect(basis.pages[1]?.status).toBe(status)
  })
  it('bare blanke sider blokkerer før adapterbruk', async () => {
    const basis = document()
    basis.pages = basis.pages.map(page => ({ ...page, status: 'blank', text: '' }))
    const load = vi.fn(async () => JSON.stringify(stored(completed([]))))
    expect(await analyzeDocument(basis, createDemoAdapter(load))).toMatchObject({ status: 'failed', error: { kind: 'document', code: 'unreadable-text' } })
    expect(load).not.toHaveBeenCalled()
  })
  it('hele grunnlaget går samlet til samme smale adapter, uten å endre bindekontekst', async () => {
    const basis = document()
    const snapshot = structuredClone(basis)
    const analyze = vi.fn(async (input: DocumentBasis) => {
      expect(input).toEqual(snapshot)
      input.reportHash = 'b'.repeat(64)
      input.pages.length = 0
      return completed()
    })
    const result = await analyzeDocument(basis, { mode: 'demo', analyze })
    expect(result).toMatchObject({ status: 'completed', reportHash: hash, pageCount: 3 })
    expect(analyze).toHaveBeenCalledTimes(1)
    expect(basis).toEqual(snapshot)
  })
  it('standard demo kjøres ikke som live ved feil modusmetadata', async () => {
    const basis = { ...document(), mode: 'live' as const }
    const load = vi.fn(async () => JSON.stringify(stored()))
    expect(await analyzeDocument(basis, createDemoAdapter(load))).toMatchObject({ status: 'failed',
      error: { code: 'metadata-mismatch' }, mode: 'live' })
    expect(load).not.toHaveBeenCalled()
  })
  it('ukjent adapterfeil blir trygg feil uten retry', async () => {
    const analyze = vi.fn(async () => { throw new Error('DO-NOT-EXPOSE') })
    const result = await analyzeDocument(document(), { mode: 'demo', analyze } satisfies AnalysisAdapter)
    expect(result).toMatchObject({ status: 'failed', error: { code: 'adapter-failure',
      reason: 'Analyseadapteren kunne ikke fullføre behandlingen.' } })
    expect(analyze).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(result)).not.toContain('DO-NOT-EXPOSE')
  })
})
