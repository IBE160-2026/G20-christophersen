import { useEffect, useRef, useState } from 'react'
import type { Dispatch, RefObject } from 'react'
import Big from 'big.js'
import type { SessionAction, SessionState } from '../state/session.ts'
import type { ListingClient } from '../analysis/listing-client.ts'
import type { ImportClient } from '../analysis/import-client.ts'
import type { ScenarioControls } from '../../domain/financial-scenario.ts'
import { useFinancialScenario } from './useFinancialScenario.ts'
import { selectScenarioBasis } from '../state/scenario.ts'
import { selectResult } from '../state/result.ts'
import { sourceTarget } from '../pdf/source-page.ts'
import { currentFinding } from '../state/report.ts'
import { isFinancialConfirmed } from '../state/session.ts'
import { AssumptionsForm } from './AssumptionsForm.tsx'
import { selectProperty } from './property.ts'
import { PropertyImage } from './PropertyImage.tsx'
import { ScenarioFinancing } from './ScenarioFinancing.tsx'
import { ScenarioChart } from './ScenarioChart.tsx'
import { EconomyAnalysisControl } from './EconomyAnalysisControl.tsx'
import { DocumentEconomy } from './DocumentEconomy.tsx'
import { ImportProgress } from './ImportProgress.tsx'
import { RiskOverview, RiskDetails } from './RiskOverview.tsx'
import { selectPropertyRisks } from './property-risk.ts'
import type { RiskSource } from './property-risk.ts'
import { ListingImport } from '../screens/ListingImport.tsx'
import { PdfViewer } from '../pdf/PdfViewer.tsx'
import { formatFinancialDecimal } from '../../presentation/finance.ts'
const Decimal = Big(); Decimal.strict = true
const number = (value: string | null, decimals = 0) => value === null ? '—' : formatFinancialDecimal(new Decimal(value).toFixed(decimals, Decimal.roundHalfUp))

export function InvestmentOverview({ session, dispatch, importClient, listingClient, onOpen, overviewRef, controls, onControls }: {
  session: SessionState; dispatch: Dispatch<SessionAction>; importClient: ImportClient; listingClient: ListingClient
  onOpen: (section?: 'basis' | 'report' | 'result') => void; overviewRef: RefObject<HTMLButtonElement | null>
  controls: ScenarioControls; onControls: (controls: ScenarioControls) => void
}) {
  const property = selectProperty(session), slot = session.prospectus.prospectus
  const risks = selectPropertyRisks(session)
  const basis = selectScenarioBasis(session)
  const { scenario, pending } = useFinancialScenario(basis, controls)
  const staleProperty = slot.status !== 'idle' && !property.outcome
  const selectedResult = selectResult(session)
  const pendingReport = session.prospectus.report.status !== 'idle' && session.prospectus.report.status !== 'imported'
  const result = staleProperty || pendingReport ? { status: 'not-calculated' as const } : selectedResult
  const outcome = staleProperty || pendingReport ? null : session.report.outcome
  const extraction = outcome?.status === 'completed' ? outcome : outcome?.partialResult
  const candidates = [...(extraction?.findings ?? []), ...(extraction?.uncertainCandidates ?? [])]
  const findings = candidates.filter(item => !session.report.findingControls.find(c => c.findingId === item.findingId)?.rejection)
  const tg3 = findings.filter(item => currentFinding(session.report, item.findingId)?.grade === 'TG3').length
  const uncertain = findings.filter(item => item.kind === 'uncertain' || !currentFinding(session.report, item.findingId)).length
  const tg2 = findings.filter(item => currentFinding(session.report, item.findingId)?.grade === 'TG2').length
  const coverage = session.report.documentImport?.coverage.technical.status
  const reportComplete = !staleProperty && !pendingReport && session.report.status === 'completed' && (!coverage || coverage === 'complete')
  const fileInput = useRef<HTMLInputElement>(null), dialog = useRef<HTMLDialogElement>(null)
  const [detail, setDetail] = useState<'risk' | 'sources' | 'assumptions' | null>(null)
  const [sourceIssue, setSourceIssue] = useState<string | null>(null)
  const [sourcePage, setSourcePage] = useState<number | null>(null)
  const [sourceRole, setSourceRole] = useState<'prospectus' | 'report'>('prospectus')
  const [zoom, setZoom] = useState(1)
  const original = detail === null ? null : sourceRole === 'prospectus' ? property.selected : session.report.selected
  useEffect(() => {
    if (detail) dialog.current?.showModal()
    else dialog.current?.close()
  }, [detail])
  const show = (kind: 'risk' | 'sources' | 'assumptions') => { setSourcePage(null); setSourceIssue(null); setZoom(1); setDetail(kind) }
  const showOriginal = (page: number, role: 'prospectus' | 'report' = 'prospectus') => { setSourceIssue(null); setSourceRole(role); setSourcePage(page); setZoom(1); setDetail('sources') }
  const upload = () => fileInput.current?.click()
  const busy = slot.status === 'loading' || slot.status === 'selecting'
  const reportSlot = session.prospectus.report
  const showRiskSource = (source: RiskSource) => {
    const role = property.selected?.hash === source.documentHash && property.selected.file.name.trim() === source.documentName ? 'prospectus' : 'report'
    const selected = role === 'prospectus' ? property.selected : session.report.selected
    const target = sourceTarget({ ...source, reportHash: source.documentHash }, { hash: selected?.hash ?? '', documentName: selected?.file.name.trim() ?? '' })
    setSourceRole(role); setSourcePage(target.page); setSourceIssue(target.issue); setZoom(1); setDetail('sources')
  }
  return <>
    <a className="skip-link" href="#investment-title">Hopp til arbeidsinnhold</a>
    <header className="investment-header"><button className="brand quiet-button" ref={overviewRef} type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}><span className="brand-mark">PAA<span>↗</span></span><span>Property Acquisition Agent</span></button>
      <nav className="investment-nav" aria-label="Investeringsoversikt"><a href="#investment">Investering</a><button type="button" onClick={() => show('risk')}>Eiendommen</button><button type="button" onClick={() => show('sources')}>Dokumentasjon</button></nav>
      <div><span className="mode-label">{property.outcome ? property.outcome.economy.analysis?.provenance === 'saved-same-document' ? 'Lagret analyse · samme dokument' : property.outcome.economy.analysis?.provenance === 'live-document' ? 'KI-analyse · dette dokumentet' : 'Offline · lokalt dokumentuttrekk' : session.report.mode === 'demo' ? 'Demo · lagret KI-uttrekk' : 'Live · operatørstyrt analyse'}</span><button type="button" className="primary-action" onClick={upload}>{property.outcome ? 'Bytt salgsoppgave ↗' : 'Last opp salgsoppgave ↗'}</button></div>
    </header>
    <main className="investment-main">
      <section className="hero" aria-labelledby="investment-title"><div className="hero-copy"><p className="eyebrow">EIENDOM / INVESTERING</p><h1 id="investment-title" className="hero-title" tabIndex={-1}>{property.title}</h1>
        <p className="hero-intro">{property.outcome ? `${property.outcome.documentName} · Dokumentuttrekk, ikke bekreftet eiendomsinformasjon.` : 'Fra salgsoppgave til et tydelig investeringsgrunnlag.'}</p>
        <div className="property-facts"><span>{property.ownership}</span><span>Areal ikke oppgitt</span><span>Byggeår ukjent</span></div>
        <div className="property-prices"><div><span>Prisantydning</span><strong>{number(property.price)}{property.price !== null && <small> kr</small>}</strong><p>{property.price !== null ? `${property.priceOrigin} · ubekreftet` : property.priceStatus}</p></div><div><span>Pris inkl. fellesgjeld</span><strong>{number(basis.P)}{basis.P !== null && <small> kr</small>}</strong><p>Uten kjøpsomkostninger</p></div><div><span>Kontantbehov</span><strong>{number(basis.cashRequired)}{basis.cashRequired !== null && <small> kr</small>}</strong><p>Kjøpesum og omkostninger</p></div></div>
        <div className="hero-upload"><label htmlFor="import-file-prospectus">{property.outcome ? 'Velg ny salgsoppgave (PDF)' : 'Velg salgsoppgave (PDF)'}</label><input id="import-file-prospectus" ref={fileInput} type="file" accept="application/pdf,.pdf" onChange={e => { setDetail(null); void importClient.select(e.currentTarget.files?.[0] ?? null, session.prospectus, 'prospectus') }} />
          <p className="metric-caption">PDF med tekstlag · inntil 200 sider / samlet 50 MiB · ingen OCR</p>
          <ImportProgress slot={slot} />
          {property.outcome && <a href="#document-economy-title">Se dokumentets økonomifelt og kilder ↓</a>}
          {busy && <button className="quiet-button" type="button" onClick={() => { importClient.abort(); dispatch({ type: 'import-abandon' }) }}>Avbryt dokumentimport</button>}
          <details className="finn-alternative"><summary>FINN-lenke · alternativ inngang</summary><ListingImport session={session} dispatch={dispatch} client={listingClient} /></details>
        </div></div><div className="hero-visual"><PropertyImage selected={property.selected} onOpen={page => showOriginal(page)} /></div></section>
      <section id="investment" aria-labelledby="investment-heading"><div className="investment-section-heading"><div><p className="eyebrow">ØKONOMISK POTENSIAL</p><h2 id="investment-heading">Tallene som betyr noe.</h2></div><p>Scenario · {basis.year ? `årsgrunnlag ${basis.year}` : 'årsgrunnlag mangler'}<br />Før skatt<br /><button type="button" className="quiet-button" onClick={() => show('assumptions')}>Juster leie og drift ↗</button></p></div>
        <div className="investment-kpis" aria-busy={pending} aria-label="Scenarioets økonomiske nøkkeltall"><article><h3>Bruttoyield</h3><p className="metric-number" data-testid="scenario-gross">{number(scenario.grossYield, 2)} <small className="metric-unit">{scenario.grossYield !== null ? '%' : ''}</small></p><p className="metric-caption">{scenario.grossYield === null ? 'Pris eller leiegrunnlag mangler' : 'Årlig leie / pris inkl. fellesgjeld'}</p></article><article><h3>Nettoyield</h3><p className="metric-number" data-testid="scenario-net">{number(scenario.netYield, 2)} <small className="metric-unit">{scenario.netYield !== null ? '%' : ''}</small></p><p className="metric-caption">{scenario.netYield === null ? 'Pris, leie eller full drift mangler' : 'Etter eierbetalt drift · før finansiering'}</p></article><article><h3>Kontantstrøm</h3><p className={`metric-number${scenario.cashFlow?.startsWith('-') ? ' negative' : ''}`} data-testid="scenario-cash">{number(scenario.cashFlow)} <small className="metric-unit">{scenario.cashFlow !== null ? 'kr' : ''}</small></p><p className="metric-caption">{scenario.cashFlow === null ? 'Fullstendig økonomi og finansiering kreves' : `Per år · ${number(new Decimal(scenario.cashFlow).div('12').toFixed(2))} kr per måned`}</p></article></div>
        <div className="assessment-strip"><div className="assessment-copy"><span className="eyebrow">INVESTERINGSVURDERING</span><h3>{result.status === 'current' ? result.snapshot.assessment.recommendation : result.status === 'historical' ? 'Vurderingen må oppdateres' : 'Grunnlaget må kontrolleres'}</h3><p>{result.status === 'current' ? result.snapshot.assessment.nextAction : result.status === 'historical' ? 'Tidligere vurdering gjelder et eldre grunnlag.' : 'Scenarioet er ingen kontrollert screeninganbefaling.'}</p></div><div className="risk-summary"><span>{staleProperty ? 'Gjeldende dokumentgrunnlag mangler' : session.report.status === 'missing' ? 'Rapport mangler' : reportComplete ? 'Rapportuttrekk fullført' : 'Rapportgrunnlag ufullstendig'}</span><span>{extraction ? `${tg3} TG3 · ${tg2} TG2${uncertain ? ` · ${uncertain} usikre kandidater` : ''} i gjeldende uttrekk` : 'TG-status ikke avklart'}</span><button type="button" className="quiet-button" onClick={() => result.status !== 'not-calculated' ? onOpen('result') : show('risk')}>{result.status === 'not-calculated' ? 'Se risiko og mangler ↗' : 'Se kontrollert vurdering ↗'}</button></div></div>
        <div className="investment-workspace"><ScenarioFinancing basis={basis} scenario={scenario} controls={controls} onChange={onControls} /><div className="graph-panel"><ScenarioChart scenario={scenario} pending={pending} />{pending && <p role="status" className="metric-caption">Beregner finansieringsscenario …</p>}
          <details className="scenario-basis"><summary>Forutsetninger og mangler</summary><dl className="source-summary">{(['P', 'L', 'D', 'cashRequired', 'sharedAnnualPayment'] as const).map(field => <div key={field}><dt>{{ P: 'Pris inkl. fellesgjeld', L: 'Årlig leie', D: 'Årlig eierbetalt drift', cashRequired: 'Kontantbehov', sharedAnnualPayment: 'Årlig fellesgjeldbetaling' }[field]}</dt><dd>{number(basis[field])} kr · {basis.provenance[field]}</dd></div>)}</dl><ul>{[...new Set([...basis.issues, ...scenario.issues])].map(issue => <li key={issue}>{issue}</li>)}</ul><button type="button" className="quiet-button" onClick={() => onOpen('basis')}>Rediger økonomigrunnlag ↗</button></details>
        </div></div>
      </section>
      <RiskOverview risks={risks} onDetails={() => show('risk')} onSource={showRiskSource}>{property.outcome && <div className="risk-report-upload"><label htmlFor="overview-report-file">{reportSlot.selected ? 'Bytt separat tilstandsrapport (PDF)' : 'Legg til separat tilstandsrapport (PDF)'}</label><input id="overview-report-file" type="file" accept="application/pdf,.pdf" disabled={busy || reportSlot.status === 'loading' || reportSlot.status === 'selecting'} onChange={event => { setDetail(null); void importClient.select(event.currentTarget.files?.[0] ?? null, session.prospectus, 'report') }} /><p>Integrert rapport leses fra salgsoppgaven. En separat rapport knyttes til samme eiendom og må kontrolleres mot originalen.</p>{reportSlot.status !== 'idle' && <ImportProgress slot={reportSlot} />}{(reportSlot.status === 'loading' || reportSlot.status === 'selecting') && <button type="button" className="quiet-button" onClick={() => { importClient.abort(); dispatch({ type: 'import-abandon' }) }}>Avbryt rapportimport</button>}{reportSlot.selected && <button type="button" className="quiet-button" onClick={() => { importClient.abort(); dispatch({ type: 'import-restore-integrated' }) }}>Bruk integrert rapport igjen</button>}</div>}</RiskOverview>
      {property.outcome && <><DocumentEconomy outcome={property.outcome} onSource={page => showOriginal(page)} />{property.selected && <EconomyAnalysisControl key={`${property.selected.hash}:${session.prospectus.generation}`} outcome={property.outcome} selected={property.selected} generation={session.prospectus.generation} dispatch={dispatch} onSource={page => showOriginal(page)} />}</>}
      <section className="investment-details" aria-label="Fordypning"><button type="button" className="detail-link" onClick={() => show('risk')}><span className="eyebrow">01 / EIENDOMMEN</span><strong>Forhold å ta stilling til ↗</strong><span>Juridiske forhold, teknisk tilstand og mangler</span></button><button type="button" className="detail-link" data-testid="open-financial-basis" onClick={() => onOpen('basis')}><span className="eyebrow">02 / ØKONOMIEN</span><strong>Bak tallene ↗</strong><span>Leie, drift og egne forutsetninger</span></button><button type="button" className="detail-link" onClick={() => show('sources')}><span className="eyebrow">03 / DOKUMENTASJON</span><strong>Etterprøv grunnlaget ↗</strong><span>Originalkilder og kontrollstatus</span></button></section>
    </main><footer className="investment-footer"><span>Property Acquisition Agent</span><span>Lokal økt · dokumenterte kilder og egne forutsetninger</span></footer>
    <dialog ref={dialog} className="investment-dialog" aria-labelledby="detail-title" onClose={() => setDetail(null)}><div className="dialog-heading"><h2 id="detail-title">{detail === 'risk' ? 'Et nærmere blikk.' : detail === 'assumptions' ? 'Dine økonomiske forutsetninger.' : 'Kildene bak eiendommen.'}</h2><button type="button" className="quiet-button" aria-label="Lukk fordypning" onClick={() => setDetail(null)}>Lukk ×</button></div>
      {detail === 'assumptions' ? <AssumptionsForm key={session.prospectus.prospectus.selected?.hash ?? session.listing.url} session={session} dispatch={dispatch} onDone={() => setDetail(null)} /> : detail === 'risk' ? <><RiskDetails risks={risks} onSource={showRiskSource} /><button type="button" className="primary-action" onClick={() => { setDetail(null); onOpen('report') }}>{isFinancialConfirmed(session) ? 'Åpne rapportkontroll' : 'Kontroller økonomigrunnlag først'}</button></> : <><p>Fra dokumentet, dokumentets estimater og egne forutsetninger har forskjellig opphav. Brukerens kontrollstatus vises separat.</p>{property.outcome ? <><p>{property.outcome.documentName} · {property.outcome.pageCount} fysiske sider</p>{property.outcome.propertyIdentity.filter(item => item.kind === 'address').map((item, index) => <div className="source-summary" key={index}><strong>{item.value} · Fra dokumentet, ubekreftet</strong><p><q>{item.source.quote}</q> · fysisk PDF-side {item.source.pdfPage}</p><button type="button" className="quiet-button" onClick={() => showOriginal(item.source.pdfPage)}>Åpne originalside</button></div>)}<button type="button" className="quiet-button" onClick={() => showOriginal(1)}>Åpne salgsoppgavens første side ↗</button></> : <p>Ingen gjeldende importert salgsoppgave.</p>}<button type="button" className="primary-action" onClick={() => { setDetail(null); onOpen('basis') }}>Åpne full dokument- og økonomikontroll</button>
        {sourceIssue && <p className="field-issue" role="status">{sourceIssue}</p>}{(sourcePage !== null || sourceIssue !== null) && original && <PdfViewer selected={original} pageNumber={sourcePage} sourceIssue={sourceIssue} zoom={zoom} onPage={setSourcePage} onZoom={setZoom} />}</>}
    </dialog>
  </>
}
