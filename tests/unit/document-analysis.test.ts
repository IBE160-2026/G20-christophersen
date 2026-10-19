import { describe, expect, it } from 'vitest'
import {
  AnalysisContextSchema, AnalysisOutcomeSchema, DocumentBasisSchema,
} from '../../src/contracts/document-analysis.ts'
import type { OriginalCandidate } from '../../src/contracts/document-analysis.ts'
import {
  bindAnalysisOutcome, createFailedAnalysis, validateAnalysisOutcome,
} from '../../src/contracts/analysis-validation.ts'

const context = {
  contractVersion: '1', extractionVersion: '1', requestId: 'request-1',
  reportHash: 'a'.repeat(64), documentName: 'Fiktiv rapport.pdf', mode: 'demo', pageCount: 10,
}
function document() {
  return { ...context, pages: Array.from({ length: 10 }, (_, index) => ({
    pdfPage: index + 1, text: `Side ${index + 1}: æøå`, status: 'readable', reason: null as string | null,
  })) }
}
function candidate(overrides: Partial<OriginalCandidate> = {}): OriginalCandidate {
  return { findingId: 'roof', description: 'Alvorlig lekkasje i tak', grade: 'TG3',
    source: { documentName: context.documentName, pdfPage: 4 }, uncertainties: [], ...overrides }
}
function completed(findings: OriginalCandidate[] = []) {
  return { contractVersion: '1', extractionVersion: '1', status: 'completed', findings, limitations: [] }
}
function bound(findings: OriginalCandidate[] = []) {
  return bindAnalysisOutcome(document(), completed(findings))
}

describe('Story 2.1 AC1 – felles versjonert dokument-/terminalkontrakt', () => {
  it('validerer hele sidemerket dokumentgrunnlag og begge moduser', () => {
    for (const mode of ['demo', 'live']) {
      expect(DocumentBasisSchema.safeParse({ ...document(), mode }).success).toBe(true)
      expect(AnalysisOutcomeSchema.safeParse(bindAnalysisOutcome({ ...document(), mode }, completed())).success).toBe(true)
    }
  })
  it('bevarer tekst på alle filposisjoner uten lengdeheuristikk', () => {
    const input = document()
    input.pages[0]!.text = ''
    expect(DocumentBasisSchema.parse(input).pages).toEqual(input.pages)
  })
  it.each(['contractVersion', 'extractionVersion', 'requestId', 'reportHash', 'documentName', 'mode', 'pageCount', 'pages'])(
    'avviser manglende dokumentfelt %s', field => {
      const input: Record<string, unknown> = document()
      delete input[field]
      expect(DocumentBasisSchema.safeParse(input).success).toBe(false)
    },
  )
  it.each([
    { contractVersion: '2' }, { extractionVersion: 'gammel' }, { requestId: '' },
    { reportHash: 'rapport.pdf' }, { mode: 'mock' }, { pageCount: 0 }, { pageCount: 31 },
    { pageCount: null }, { pageCount: 2.5 },
  ])('avviser ugyldig dokumentmetadata %j', change => {
    expect(DocumentBasisSchema.safeParse({ ...document(), ...change }).success).toBe(false)
  })
  it.each(['missing', 'duplicate', 'reordered', 'outside', 'missing-text', 'missing-status'])(
    'avviser tapte/ukorrekte sider: %s', variant => {
      const input = document()
      if (variant === 'missing') input.pages.pop()
      if (variant === 'duplicate') input.pages[1]!.pdfPage = 1
      if (variant === 'reordered') input.pages.reverse()
      if (variant === 'outside') input.pages[9]!.pdfPage = 11
      if (variant === 'missing-text') delete (input.pages[0] as Record<string, unknown>).text
      if (variant === 'missing-status') delete (input.pages[0] as Record<string, unknown>).status
      expect(DocumentBasisSchema.safeParse(input).success).toBe(false)
    },
  )
  it.each(['contractVersion', 'extractionVersion', 'requestId', 'reportHash', 'documentName', 'mode', 'pageCount',
    'status', 'findings', 'uncertainCandidates', 'limitations', 'validationScope'])(
    'avviser manglende fullføringsfelt %s', field => {
      const input: Record<string, unknown> = { ...bound() }
      delete input[field]
      expect(AnalysisOutcomeSchema.safeParse(input).success).toBe(false)
    },
  )
  it.each([undefined, null, {}, { status: 'pending' }, { status: 'success' },
    { ...completed(), contractVersion: '2' }, { ...completed(), extractionVersion: '2' },
    { ...completed(), findings: null }, { ...completed(), findings: undefined },
    { ...completed(), limitations: undefined }])('manglende/ugyldig adapterutfall %j blir feil', input => {
    const result = bindAnalysisOutcome(document(), input)
    expect(result.status).toBe('failed')
    if (result.status === 'failed') expect(result.error.code).toBe('invalid-response')
  })
})

describe('Story 2.1 AC2 – fullført tomliste og feil/delresultater', () => {
  it('bare eksplisitt completed gir fullført tomliste', () => {
    expect(bound()).toMatchObject({ status: 'completed', findings: [], uncertainCandidates: [], limitations: [] })
    const missing = completed() as Record<string, unknown>
    delete missing.findings
    expect(bindAnalysisOutcome(document(), missing).status).toBe('failed')
    const failed = bindAnalysisOutcome(document(), {
      contractVersion: '1', extractionVersion: '1', status: 'failed', code: 'interrupted', target: null, partialResult: null,
    })
    expect(failed).toMatchObject({ status: 'failed', partialResult: null, error: { kind: 'analysis', code: 'interrupted' } })
    expect(failed).not.toHaveProperty('findings')
  })
  it('bevarer kjente begrensninger også i et fullført resultat', () => {
    const limitations = ['Tabellen har uavklart kolonnerekkefølge.', 'Et funn må kontrolleres mot originalen.']
    const result = bindAnalysisOutcome(document(), { ...completed([candidate()]), limitations })
    expect(result).toMatchObject({ status: 'completed', limitations })
  })
  it('gyldig funnliste bevarer TG2/TG3 og originalen uten bekreftelse', () => {
    const originals = [candidate(), candidate({ findingId: 'wall', grade: 'TG2' })]
    const result = bound(originals)
    expect(result.status).toBe('completed')
    if (result.status !== 'completed') return
    expect(result.findings.map(item => item.grade)).toEqual(['TG3', 'TG2'])
    expect(result.findings.map(item => item.original)).toEqual(originals)
    expect(result.validationScope).toBe('structure-and-source')
    expect(result).not.toHaveProperty('userConfirmed')
    expect(result).not.toHaveProperty('semanticallyComplete')
  })
  it('avbrutt analyse beholder merkede ufullstendige delresultater', () => {
    const result = bindAnalysisOutcome(document(), {
      contractVersion: '1', extractionVersion: '1', status: 'failed', code: 'interrupted', target: { kind: 'finding', findingId: 'unknown' },
      partialResult: { findings: [candidate(), candidate({ findingId: 'unknown', grade: null })], limitations: ['Avbrutt'] },
    })
    expect(result.status).toBe('failed')
    if (result.status !== 'failed') return
    expect(result.partialResult).toMatchObject({ completeness: 'incomplete', findings: [{ findingId: 'roof' }],
      uncertainCandidates: [{ findingId: 'unknown' }], limitations: ['Avbrutt'] })
    expect(result.error.target).toEqual({ kind: 'finding', findingId: 'unknown' })
    expect(AnalysisOutcomeSchema.safeParse({ ...result, findings: [] }).success).toBe(false)
    expect(AnalysisOutcomeSchema.safeParse({ ...result, partialResult: { ...result.partialResult, completeness: 'complete' } }).success).toBe(false)
  })
  it('bevarer feilmålets originale funn-ID uten å slå sammen ulike ID-er', () => {
    const result = bindAnalysisOutcome(document(), {
      contractVersion: '1', extractionVersion: '1', status: 'failed', code: 'interrupted',
      target: { kind: 'finding', findingId: ' roof ' },
      partialResult: { findings: [candidate(), candidate({ findingId: ' roof ' })], limitations: [] },
    })
    expect(result.status).toBe('failed')
    if (result.status !== 'failed') throw new Error('Forventet analysefeil med delresultat')
    expect(result.error.target).toEqual({ kind: 'finding', findingId: ' roof ' })
    expect(result.partialResult?.findings.map(finding => finding.findingId)).toEqual(['roof', ' roof '])
    expect(AnalysisOutcomeSchema.parse(result)).toEqual(result)
    expect(validateAnalysisOutcome(result, context).success).toBe(true)
  })
  it.each([
    ['unreadable', 'unreadable-text'], ['incomplete', 'incomplete-text'], ['unknown', 'unknown-readability'],
  ])('fullføring er sperret ved sidestatus %s med koden %s', (status, code) => {
    const input = document()
    input.pages[2]!.status = status
    const result = bindAnalysisOutcome(input, completed())
    expect(result).toMatchObject({ status: 'failed', error: { kind: 'document', code, target: { kind: 'page', pdfPage: 3 } } })
    if (result.status === 'failed' && status === 'unknown') expect(result.error.reason).toBeNull()
  })
  it.each(['unreadable', 'incomplete', 'unknown'])('bevarer kjent trygg kodeårsak for sidestatus %s', status => {
    const input = document()
    input.pages[2]!.status = status
    input.pages[2]!.reason = 'Kjent tegnkodingsfeil gjør tekstuttrekket upålitelig.'
    const result = bindAnalysisOutcome(input, completed())
    expect(result).toMatchObject({ status: 'failed', partialResult: null, error: {
      kind: 'document', target: { kind: 'page', pdfPage: 3 }, reason: input.pages[2]!.reason,
    } })
  })
  it('dokumentfeil før kjent sideantall og ukjent årsak er egne eksplisitte tilstander', () => {
    const result = createFailedAnalysis({ ...context, pageCount: null }, {
      kind: 'document', code: 'invalid-container', target: { kind: 'document' }, reason: null,
    })
    expect(result).toMatchObject({ status: 'failed', pageCount: null, error: { reason: null }, partialResult: null })
  })
  it.each(['error', 'partialResult'])('avviser manglende feilfelt %s', field => {
    const result: Record<string, unknown> = { ...createFailedAnalysis(context, {
      kind: 'analysis', code: 'timeout', target: null, reason: 'Analysen ble avbrutt av tidsgrensen.',
    }) }
    delete result[field]
    expect(AnalysisOutcomeSchema.safeParse(result).success).toBe(false)
  })
  it('avviser ustabil kode, manglende mål/årsak og feil feilkategori', () => {
    for (const error of [
      { kind: 'analysis', code: 'vilkårlig', target: null, reason: null },
      { kind: 'document', code: 'timeout', target: null, reason: null },
      { kind: 'analysis', code: 'timeout', reason: null },
      { kind: 'analysis', code: 'timeout', target: null },
      { kind: 'analysis', code: 'timeout', target: { kind: 'page', pdfPage: 0 }, reason: null },
    ]) {
      expect(AnalysisOutcomeSchema.safeParse({ ...context, status: 'failed', error, partialResult: null }).success).toBe(false)
    }
  })
})

describe('Story 2.1 AC3 / RT-7 – ingen gjettet grad eller kilde', () => {
  it.each([
    ['side 99', { source: { documentName: context.documentName, pdfPage: 99 } }, 'invalid-page'],
    ['side 0', { source: { documentName: context.documentName, pdfPage: 0 } }, 'invalid-page'],
    ['desimalside', { source: { documentName: context.documentName, pdfPage: 4.5 } }, 'invalid-page'],
    ['ukjent side', { source: { documentName: context.documentName, pdfPage: null } }, 'invalid-page'],
    ['sidestreng', { source: { documentName: context.documentName, pdfPage: '4' } }, 'invalid-page'],
    ['manglende side', { source: { documentName: context.documentName } }, 'invalid-page'],
    ['manglende kilde', { source: null }, 'missing-source'],
    ['utelatt kilde', { source: undefined }, 'missing-source'],
    ['manglende dokument', { source: { pdfPage: 4 } }, 'missing-source'],
    ['annet dokument', { source: { documentName: 'Annen.pdf', pdfPage: 4 } }, 'document-mismatch'],
    ['annen hash', { source: { documentName: context.documentName, reportHash: 'b'.repeat(64), pdfPage: 4 } }, 'hash-mismatch'],
    ['uklar grad', { grade: 'TG2/TG3' }, 'unclear-grade'],
    ['ukjent grad', { grade: null }, 'unclear-grade'],
    ['utelatt grad', { grade: undefined }, 'unclear-grade'],
    ['annen grad', { grade: 'TG1' }, 'unclear-grade'],
    ['oppgitt usikkerhet', { uncertainties: ['Graden er vanskelig å lese'] }, 'reported-uncertainty'],
  ] as const)('%s beholdes som usikker kandidat', (_label, change, code) => {
    const original = candidate({ ...change, uncertainties: 'uncertainties' in change ? [...change.uncertainties] : [], confidence: 100 })
    const result = bound([original])
    expect(result.status).toBe('completed')
    if (result.status !== 'completed') return
    expect(result.findings).toEqual([])
    expect(result.uncertainCandidates).toHaveLength(1)
    expect(result.uncertainCandidates[0]!.original).toEqual(original)
    expect(result.uncertainCandidates[0]!.issues).toContainEqual({ code, reason: expect.any(String) })
  })
  it('rapporterer alle kjente mangler samtidig og beholder originalen isolert fra inputmutasjon', () => {
    const original = { ...candidate({ grade: null, source: null }) }
    const result = bound([original])
    original.description = 'Endret etter binding'
    if (result.status !== 'completed') throw new Error('Forventet fullført med usikker kandidat')
    expect(result.uncertainCandidates[0]!.issues.map(issue => issue.code)).toEqual(['unclear-grade', 'missing-source', 'invalid-page'])
    expect(result.uncertainCandidates[0]!.original.description).toBe('Alvorlig lekkasje i tak')
  })
  it('den validerte originalen, kilden og usikkerhetslisten er immutable', () => {
    const result = bound([candidate()])
    if (result.status !== 'completed') throw new Error('Forventet fullført')
    const original = result.findings[0]!.original
    expect(Object.isFrozen(original)).toBe(true)
    expect(Object.isFrozen(original.source)).toBe(true)
    expect(Object.isFrozen(original.uncertainties)).toBe(true)
    expect(() => Object.assign(original, { grade: 'TG2' })).toThrow()
  })
  it('bevarer original beskrivelse og usikkerhetstekst uten trimming eller omskriving', () => {
    const original = candidate({ description: '  Original tekst\n', uncertainties: ['  Uklar grad\n'] })
    const result = bound([original])
    if (result.status !== 'completed') throw new Error('Forventet fullført med usikker kandidat')
    expect(result.uncertainCandidates[0]!.original).toEqual(original)
  })
  it('avviser forsøk på å oppgradere usikker original i ferdig API-svar', () => {
    const result = bound([candidate()])
    if (result.status !== 'completed') throw new Error('Forventet fullført')
    const finding = result.findings[0]!
    for (const change of [
      { original: candidate({ grade: null }) },
      { original: candidate({ source: { documentName: context.documentName, pdfPage: 99 } }) },
      { grade: 'TG2' }, { description: 'Ny tekst' },
      { source: { ...finding.source, pdfPage: 5 } },
      { source: { ...finding.source, reportHash: 'b'.repeat(64) } },
    ]) expect(AnalysisOutcomeSchema.safeParse({ ...result, findings: [{ ...finding, ...change }] }).success).toBe(false)
  })
  it('avviser bortforklarte usikkerheter og duplikate findingId-er', () => {
    const result = bound([candidate({ grade: null })])
    if (result.status !== 'completed') throw new Error('Forventet fullført')
    const item = result.uncertainCandidates[0]!
    expect(AnalysisOutcomeSchema.safeParse({ ...result, uncertainCandidates: [{ ...item, issues: [] }] }).success).toBe(false)
    expect(AnalysisOutcomeSchema.safeParse({ ...result, uncertainCandidates: [{ ...item, issues: [{ code: 'missing-source', reason: 'Feil årsak' }] }] }).success).toBe(false)
    expect(bound([candidate(), candidate()]).status).toBe('failed')
  })
})

describe('Story 2.1 AC4 – kodekontrollert metadata og trygg retur', () => {
  it('overstyrer alle modellvalgte dokument-/korrelasjonsmetadata fra kodekonteksten', () => {
    const result = bindAnalysisOutcome(document(), { ...completed([candidate()]), requestId: 'modell-id',
      reportHash: 'b'.repeat(64), documentName: 'Angrep.pdf', mode: 'live', pageCount: 999,
      validationScope: 'semantic-proof', userConfirmed: true })
    expect(result).toMatchObject({ ...context, status: 'completed', validationScope: 'structure-and-source' })
    expect(result).not.toHaveProperty('userConfirmed')
    if (result.status === 'completed') expect(result.findings[0]!.source.reportHash).toBe(context.reportHash)
  })
  it.each([
    { requestId: 'annen' }, { reportHash: 'b'.repeat(64) }, { documentName: 'Annen.pdf' },
    { mode: 'live' }, { pageCount: 9 }, { contractVersion: '2' }, { extractionVersion: '2' },
  ])('samme felles returvalidering avviser feil forventet metadata %j', change => {
    expect(validateAnalysisOutcome(bound(), context).success).toBe(true)
    expect(validateAnalysisOutcome({ ...bound(), ...change }, context).success).toBe(false)
  })
  it('sender aldri rå adapterfeil eller hemmeligheter som trygg feilårsak', () => {
    const secret = 'sk-privat-testhemmelighet /private/rapport.pdf intern stack'
    const result = bindAnalysisOutcome(document(), { contractVersion: '1', extractionVersion: '1',
      status: 'failed', code: 'adapter-failure', target: null, reason: secret, partialResult: null })
    expect(result.status).toBe('failed')
    expect(JSON.stringify(result)).not.toContain(secret)
    expect(JSON.stringify(bindAnalysisOutcome(document(), { message: secret }))).not.toContain(secret)
  })
  it('avviser bekreftelses- og semantikkpåstander i det delte API-svaret', () => {
    expect(AnalysisOutcomeSchema.safeParse({ ...bound(), userConfirmed: true }).success).toBe(false)
    expect(AnalysisOutcomeSchema.safeParse({ ...bound(), semanticallyComplete: true }).success).toBe(false)
  })
  it('avviser et kjent feilmål utenfor rapportens sideantall', () => {
    const result = bindAnalysisOutcome(document(), { contractVersion: '1', extractionVersion: '1',
      status: 'failed', code: 'interrupted', target: { kind: 'page', pdfPage: 99 }, partialResult: null })
    expect(result).toMatchObject({ status: 'failed', error: { code: 'invalid-response', target: null } })
  })
  it('validerer kodekonteksten og nekter å bygge identitet fra adapteren', () => {
    expect(AnalysisContextSchema.safeParse({ ...context, reportHash: null }).success).toBe(false)
    expect(() => bindAnalysisOutcome({ ...document(), requestId: '' }, completed())).toThrow()
  })
})
