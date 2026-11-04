import type { PropertyRiskItem, PropertyRiskOverview, RiskSource } from './property-risk.ts'

const labels = { documented: 'Dokumenterte problemer', possible: 'Mulige problemer som krever kontroll', unexamined: 'Opplysninger som ikke er undersøkt' }
const groups = ['documented', 'possible', 'unexamined'] as const
const summaryCount = (items: readonly PropertyRiskItem[]) => items.filter(item => item.domain === 'technical' && item.evidenceKind === 'summary').length
const findingCount = (items: readonly PropertyRiskItem[]) => items.length - summaryCount(items)
const riskKey = (item: PropertyRiskItem) => JSON.stringify([item.id, ...item.sources.map(source => [source.documentHash, source.documentName])])

export function RiskOverview({ risks, onDetails, onSource, children }: { risks: PropertyRiskOverview; onDetails: () => void; onSource: (source: RiskSource) => void; children?: React.ReactNode }) {
  return <section className="property-risk" aria-labelledby="property-risk-title">
    <div className="investment-section-heading"><div><p className="eyebrow">EIENDOMSRISIKO</p><h2 id="property-risk-title">Forhold som påvirker valget.</h2></div><button type="button" className="quiet-button" onClick={onDetails}>Se alle funn og kilder ↗</button></div>
    <p className="property-risk-intro">{risks.technicalCoverage} Opplysninger i dokumentene er ikke en juridisk eller teknisk godkjenning.</p>
    <ReportEvidence risks={risks} onSource={onSource} />
    <div className="property-risk-groups">{groups.map(group => <div key={group} className={`property-risk-group property-risk-group--${group}`}>
      <h3>{labels[group]} <span>{findingCount(risks[group])}</span></h3>
      {summaryCount(risks[group]) > 0 && <p>{summaryCount(risks[group])} sammendragsopplysninger vises i tillegg og inngår ikke i antallet over.</p>}
      {risks[group].length === 0 && group !== 'unexamined' && <p>Ingen slike treff i gjeldende uttrekk. Dette bekrefter ikke fravær av problemer.</p>}
      <ul>{risks[group].slice(0, 3).map(item => <RiskDetail key={riskKey(item)} item={item} onSource={onSource} />)}</ul>
      {risks[group].length > 3 && <p>{risks[group].length - 3} flere opplysninger i full liste.</p>}
    </div>)}</div>
    <RiskCoverage risks={risks} /><RiskBackground risks={risks} onSource={onSource} />
    {children}
  </section>
}

export function RiskDetails({ risks, onSource }: { risks: PropertyRiskOverview; onSource: (source: RiskSource) => void }) {
  return <div className="property-risk-details"><p>{risks.technicalCoverage} Kontroller originalene før du legger forholdene til grunn.</p>
    <ReportEvidence risks={risks} onSource={onSource} />
    {groups.map(group => <section key={group} aria-labelledby={`risk-detail-${group}`}><h3 id={`risk-detail-${group}`}>{labels[group]} ({findingCount(risks[group])})</h3>
      {summaryCount(risks[group]) > 0 && <p>{summaryCount(risks[group])} sammendragsopplysninger vises i tillegg og inngår ikke i antallet over.</p>}
      {!risks[group].length && group !== 'unexamined' && <p>Ingen slike treff i gjeldende uttrekk. Fravær av treff er ikke dokumentasjon på fravær av problemer.</p>}
      <ol className="source-summary">{risks[group].map(item => <RiskDetail key={riskKey(item)} item={item} onSource={onSource} />)}</ol>
    </section>)}
    <RiskCoverage risks={risks} /><RiskBackground risks={risks} onSource={onSource} />
    {risks.limitations.length > 0 && <details className="risk-limitations"><summary>Begrensninger og mangler ({risks.limitations.length})</summary><ul>{risks.limitations.map(reason => <li key={reason}>{reason}</li>)}</ul></details>}
  </div>
}
function ReportEvidence({ risks, onSource }: { risks: PropertyRiskOverview; onSource: (source: RiskSource) => void }) {
  const evidence = risks.reportEvidence
  if (!evidence) return null
  const summaries = [...risks.documented, ...risks.possible, ...risks.unexamined].filter(item => item.domain === 'technical' && item.evidenceKind === 'summary').length
  return <div className="technical-report-evidence" aria-label="Teknisk dokumentgrunnlag"><p><b>Rapportgrunnlag:</b> {evidence.documentName}</p>
    {evidence.ranges.length ? evidence.ranges.map((range, index) => <p key={index}>Identifisert rapportområde: fysisk PDF-side {range.startPage}–{range.endPage} · {range.certainty === 'certain' ? 'avgrenset med kildebelegg' : 'usikker avgrensning'}. <button type="button" className="quiet-button" onClick={() => onSource(range.source)}>Åpne rapportstart ↗{evidence.ranges.length > 1 ? ` (${index + 1})` : ''}</button></p>) : <p>Rapportens start og slutt er ikke sikkert identifisert.</p>}
    {evidence.visualPages && <VisualPageEvidence evidence={evidence} onSource={onSource} />}
    {evidence.interpretation && evidence.interpretation.status === 'requires-approval' && <details className="technical-visual-pages"><summary>Områder som trenger videre tolkning ({evidence.interpretation.candidateCount})</summary>
      <p>{evidence.interpretation.targets.length} avgrensede tolkningsområder er forberedt lokalt. Ingen AI-tolkning er utført. Betalte kall krever godkjenning og kontrollert kostnadsestimat innen USD 0,20 for hele analysen.</p>
      <ul>{evidence.interpretation.targets.map(target => <li key={target.id}><p>{target.explanation}</p>{target.sources.map((source, index) => {
        const original = source.kind === 'pdf-text' ? source.source : source
        return <button key={index} type="button" className="quiet-button" onClick={() => onSource({ documentHash: original.documentHash, documentName: original.documentName, pdfPage: original.pdfPage,
          ...(source.kind === 'visual-region' ? { method: 'local-vision' as const, region: source.region, rasterDigest: source.rasterDigest, extractorVersion: 'local-visual-1' }
            : { method: 'pdf-text' as const, start: source.source.start, end: source.source.end, quote: source.source.quote }) })}>Åpne usikkert område · PDF-side {original.pdfPage} ↗</button>
      })}</li>)}</ul>
      {evidence.interpretation.deferred.length > 0 && <p>{evidence.interpretation.deferred.reduce((sum, item) => sum + item.count, 0)} ytterligere områder er utenfor dette avgrensede utvalget eller mangler lesbart bildegrunnlag. Fysisk PDF-side {[...new Set(evidence.interpretation.deferred.map(item => item.pdfPage))].sort((a, b) => a - b).join(', ')}. Disse er fortsatt uavklart.</p>}
      <p>Utvalget beviser ikke komplett TG-dekning. Resterende usikre sider: {evidence.interpretation.unresolvedPages.join(', ') || 'se rapportens dekningsbegrunnelser'}.</p>
    </details>}
    {evidence.unreadPages.length > 0 && <p>Uleste eller ufullstendige sider i dokumentet: fysisk PDF-side {evidence.unreadPages.join(', ')}.</p>}
    {summaries > 0 && <p>{summaries} tekniske opplysninger fra sammendrag. De beviser ikke rapportdetaljer eller komplett TG-dekning og inngår ikke i teknisk kontrollgrunnlag. Opplysninger som ikke er entydig koblet, kan omtale samme forhold som detaljlisten; sammendrags- og detaljtall skal ikke legges sammen.</p>}
  </div>
}
function VisualPageEvidence({ evidence, onSource }: { evidence: NonNullable<PropertyRiskOverview['reportEvidence']>; onSource: (source: RiskSource) => void }) {
  const pages = evidence.visualPages ?? []
  const linked = pages.filter(page => page.findings > 0)
  const rendered = pages.filter(page => page.rendered).length
  const uncertain = pages.filter(page => page.status !== 'processed')
  const attempted = new Set(pages.map(page => page.pdfPage))
  const unattempted = [...new Set(evidence.ranges.flatMap(range => Array.from({ length: range.endPage - range.startPage + 1 }, (_, index) => range.startPage + index)))].filter(page => !attempted.has(page))
  return <div className="technical-visual-evidence">
    <p><b>Lokal bildeanalyse:</b> {pages.length} fysiske sider i analyseutvalget; {rendered} {rendered === 1 ? 'side' : 'sider'} rendret og lokalt lest. Automatisk kobling med kildebelegg av grafisk grad, bygningsdel og avvik på {linked.length} sider ({pages.reduce((total, page) => total + page.findings, 0)} detaljfunn). Dette er ikke fullstendig sidekontroll eller brukergodkjenning.</p>
    {uncertain.length > 0 && <p>Fortsatt usikker bildeanalyse: fysisk PDF-side {uncertain.map(page => page.pdfPage).join(', ')}.</p>}
    {unattempted.length > 0 && <p>Ikke bildebehandlet i identifisert rapportområde: fysisk PDF-side {unattempted.join(', ')}.</p>}
    <details className="technical-visual-pages"><summary>Se bildeanalyse per fysisk PDF-side ({pages.length})</summary><ul>{pages.map(page => <li key={page.pdfPage}>
      <b>PDF-side {page.pdfPage}:</b> {page.findings} automatisk koblede TG2/TG3-detaljer · {page.status === 'processed' ? 'lokal behandling utført' : page.status === 'unavailable' ? 'bildeanalyse utilgjengelig' : 'usikkert grunnlag'}.
      {page.reason && <p>{page.reason}</p>}
      <button type="button" className="quiet-button" disabled={!evidence.documentHash && !evidence.ranges[0]?.source.documentHash} onClick={() => onSource({ documentHash: evidence.documentHash ?? evidence.ranges[0]?.source.documentHash ?? '', documentName: evidence.documentName, pdfPage: page.pdfPage })}>Åpne originalside {page.pdfPage} ↗</button>
    </li>)}</ul></details>
  </div>
}
function RiskCoverage({ risks }: { risks: PropertyRiskOverview }) {
  return risks.gaps.length > 0 && <details className="risk-coverage"><summary>Dekning og manglende undersøkelser ({risks.gaps.length})</summary><ul className="risk-gaps">{risks.gaps.map(gap => <li key={gap}>{gap}</li>)}</ul></details>
}
function RiskBackground({ risks, onSource }: { risks: PropertyRiskOverview; onSource: (source: RiskSource) => void }) {
  return risks.background.length > 0 && <details className="risk-background"><summary>Generelle bestemmelser og bakgrunn ({risks.background.length})</summary><p>Generelle forklaringer teller ikke som konkrete risikoforhold.</p><ul>{risks.background.map(item => <RiskDetail key={riskKey(item)} item={item} onSource={onSource} background />)}</ul></details>
}
function RiskDetail({ item, onSource, background = false }: { item: PropertyRiskItem; onSource: (source: RiskSource) => void; background?: boolean }) {
  const pages = [...new Set(item.sources.map(source => source.pdfPage))].sort((a, b) => a - b)
  const members = item.members ?? [item]
  const descriptions = [...new Set(members.map(member => member.description))].filter(description => !item.sources.some(source => source.quote === description))
  return <li><details className="risk-finding"><summary><strong>{background ? 'Generell lovforklaring' : item.title}{!background && item.displaySubject ? ` · ${item.displaySubject}` : ''}</strong><small>{background ? 'Bakgrunn' : item.domain === 'legal' ? 'Juridisk / praktisk' : <>Teknisk{item.grade && item.sourceQuality !== 'partial-text' && <> · <span className={`technical-grade technical-grade--${item.grade.toLowerCase()}`}>{item.grade}</span></>}{item.evidenceKind === 'summary' ? ' · Oppgitt i sammendrag' : item.evidenceKind === 'detail' ? item.sourceQuality === 'local-visual' ? ' · Lokal bildeanalyse / OCR' : ' · Detaljtekst' : ''}</>}{pages.length ? ` · fysisk PDF-side ${pages.join(', ')}` : ' · kilde må avklares'}{item.sources.length > 1 ? ` · ${item.sources.length} kildebelegg` : ''}{item.sourceQuality === 'partial-text' ? ' · Usikkert tekstgrunnlag · grad ukjent' : item.domain === 'technical' && item.grade === null ? ' · grad ukjent' : ''}</small></summary><div className="risk-finding-body">
    {item.reconciliationNote && <p className="technical-summary-note">{item.reconciliationNote}</p>}
    {item.sourceQuality === 'local-visual' && <p>Lokal bildeanalyse kobler grafisk grad til bygningsdel og avviksbeskrivelse. Teksten er OCR-avledet og må etterprøves i originalen; brukerkontroll gjenstår.</p>}
    {item.evidenceKind === 'summary' && <p className="technical-summary-note">Opplysning fra sammendrag. Sammendraget kan avvike fra rapportdetaljene; kontroller rapportens egen grad, avviksbeskrivelse og tiltak. Opplysningen er ikke teknisk kontrollgrunnlag.</p>}
    {descriptions.map(description => <p key={description}>{description}</p>)}
    {!background && [...new Set(members.map(member => member.consequence))].map(consequence => <p key={consequence}><b>Betydning:</b> {consequence}</p>)}
    {!background && [...new Set(members.map(member => member.action))].map(action => <p key={action}><b>Neste steg:</b> {action}</p>)}
    {item.sourceQuality === 'partial-text' && <p className="field-issue">Ufullstendig tekstgrunnlag. Dette er et mulig forhold; kontroller original PDF-side.</p>}
    {item.domain === 'technical' && item.grade === null && <p>Tilstandsgrad er ikke fastslått i tekstgrunnlaget.</p>}{item.controlNote && <p>{item.controlNote}</p>}
    {item.sources.map((source, index) => <div className="risk-source" key={`${source.documentHash}:${source.documentName}:${source.pdfPage}:${index}`}>{source.method === 'local-vision' && <p><b>OCR-lesning fra sidebildet:</b> avledet tekst, ikke ordrett PDF-tekstlag.</p>}{source.quote && <blockquote>{source.quote}</blockquote>}<p>{source.documentName} · fysisk PDF-side {source.pdfPage}</p><button type="button" className="quiet-button" onClick={() => onSource(source)}>Se originalkilde ↗{item.sources.length > 1 ? ` (${index + 1})` : ''}</button></div>)}
    {item.sources.length === 0 && <p>Kildens fysiske side er ikke avklart. Kontroller originalrapporten.</p>}
  </div></details></li>
}
