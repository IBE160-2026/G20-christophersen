import { describe, expect, it } from 'vitest'
import { sourceTarget } from '../../src/frontend/pdf/source-page.ts'
import { createReportState, reportReducer } from '../../src/frontend/state/report.ts'

describe('Story 2.7 originalkilde og bevart visningskontekst', () => {
  const report = { hash: 'original', documentName: 'rapport.pdf' }
  it('beholder fysisk heltallsside uten å gjette fra trykt sidetall', () => {
    expect(sourceTarget({ reportHash: 'original', documentName: 'rapport.pdf', pdfPage: 4, printedPage: 2 }, report)).toEqual({ page: 4, issue: null })
    expect(sourceTarget({ reportHash: 'original', documentName: 'rapport.pdf', pdfPage: 999 }, report)).toEqual({ page: 999, issue: null })
  })
  it('bruker kjent side fra kontraktbundet usikkert funn uten valgfri originalhash', () => {
    expect(sourceTarget({ documentName: 'rapport.pdf', pdfPage: 2 }, report)).toEqual({ page: 2, issue: null })
  })
  it('avviser feil originalidentitet og oppgir kjent dokument', () => {
    expect(sourceTarget({ reportHash: 'annen', documentName: 'feil.pdf', pdfPage: 2 }, report)).toMatchObject({ page: null, issue: expect.stringContaining('feil.pdf') })
  })
  it('gjetter ikke side fra ukjent kilde, tekst, NaN eller desimal', () => {
    expect(sourceTarget(null, report).page).toBeNull()
    for (const pdfPage of ['4', null, undefined, NaN, 1.5]) expect(sourceTarget({ reportHash: 'original', documentName: 'rapport.pdf', pdfPage }, report).page).toBeNull()
  })
  it('retur bevarer valgt funn/side/zoom og original; nytt rapportvalg nullstiller', () => {
    const bytes = new Uint8Array([1, 2, 3])
    const selected = { file: new File([bytes], 'rapport.pdf'), bytes, hash: 'original' }
    let state = reportReducer(reportReducer(createReportState(), { type: 'report-selecting', generation: 1 }), { type: 'report-selected', generation: 1, selected })
    state = reportReducer(state, { type: 'report-view', generation: 1, view: { findingId: 'funn', pdfPage: 4, zoom: 2 } })
    expect(reportReducer(state, { type: 'report-abandon' })).toBe(state)
    expect(state.selected?.bytes).toBe(bytes)
    expect(state.outcome).toBeNull()
    expect(reportReducer(state, { type: 'report-view', generation: 0, view: { findingId: 'gammelt', pdfPage: 1, zoom: 1 } })).toBe(state)
    expect(reportReducer(state, { type: 'report-selecting', generation: 2 }).view).toEqual({ findingId: null, pdfPage: null, zoom: 1 })
  })
})
