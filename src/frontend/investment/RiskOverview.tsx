import type { PropertyRiskItem, PropertyRiskOverview, RiskSource } from './property-risk.ts'

const labels = { documented: 'Dokumenterte problemer', possible: 'Mulige problemer som krever kontroll', unexamined: 'Opplysninger som ikke er undersøkt' }
const groups = ['documented', 'possible', 'unexamined'] as const
const riskKey = (item: PropertyRiskItem) => JSON.stringify([item.id, ...item.sources.map(source => [source.documentHash, source.documentName])])

export function RiskOverview({ risks, onDetails, onSource, children }: { risks: PropertyRiskOverview; onDetails: () => void; onSource: (source: RiskSource) => void; children?: React.ReactNode }) {
  return <section className="property-risk" aria-labelledby="property-risk-title">
    <div className="investment-section-heading"><div><p className="eyebrow">EIENDOMSRISIKO</p><h2 id="property-risk-title">Forhold som påvirker valget.</h2></div><button type="button" className="quiet-button" onClick={onDetails}>Se alle funn og kilder ↗</button></div>
    <p className="property-risk-intro">{risks.technicalCoverage} Opplysninger i dokumentene er ikke en juridisk eller teknisk godkjenning.</p>
    <div className="property-risk-groups">{groups.map(group => <div key={group} className={`property-risk-group property-risk-group--${group}`}>
      <h3>{labels[group]} <span>{risks[group].length}</span></h3>
      {risks[group].length === 0 && group !== 'unexamined' && <p>Ingen slike treff i gjeldende uttrekk. Dette bekrefter ikke fravær av problemer.</p>}
      <ul>{risks[group].slice(0, 3).map(item => <RiskDetail key={riskKey(item)} item={item} onSource={onSource} />)}</ul>
      {risks[group].length > 3 && <p>{risks[group].length - 3} flere forhold i full liste.</p>}
    </div>)}</div>
    <RiskCoverage risks={risks} /><RiskBackground risks={risks} onSource={onSource} />
    {children}
  </section>
}

export function RiskDetails({ risks, onSource }: { risks: PropertyRiskOverview; onSource: (source: RiskSource) => void }) {
  return <div className="property-risk-details"><p>{risks.technicalCoverage} Lokal analyse har delvis dekning. Kontroller originalene før du legger forholdene til grunn.</p>
    {groups.map(group => <section key={group} aria-labelledby={`risk-detail-${group}`}><h3 id={`risk-detail-${group}`}>{labels[group]} ({risks[group].length})</h3>
      {!risks[group].length && group !== 'unexamined' && <p>Ingen slike treff i gjeldende uttrekk. Fravær av treff er ikke dokumentasjon på fravær av problemer.</p>}
      <ol className="source-summary">{risks[group].map(item => <RiskDetail key={riskKey(item)} item={item} onSource={onSource} />)}</ol>
    </section>)}
    <RiskCoverage risks={risks} /><RiskBackground risks={risks} onSource={onSource} />
    {risks.limitations.length > 0 && <details className="risk-limitations"><summary>Begrensninger og mangler ({risks.limitations.length})</summary><ul>{risks.limitations.map(reason => <li key={reason}>{reason}</li>)}</ul></details>}
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
  return <li><details className="risk-finding"><summary><strong>{background ? 'Generell lovforklaring' : item.title}{!background && item.displaySubject ? ` · ${item.displaySubject}` : ''}</strong><small>{background ? 'Bakgrunn' : item.domain === 'legal' ? 'Juridisk / praktisk' : 'Teknisk'}{pages.length ? ` · fysisk PDF-side ${pages.join(', ')}` : ' · kilde må avklares'}{item.sources.length > 1 ? ` · ${item.sources.length} kildebelegg` : ''}{item.sourceQuality === 'partial-text' ? ' · Usikkert tekstgrunnlag · grad ukjent' : item.domain === 'technical' && item.grade === null ? ' · grad ukjent' : ''}</small></summary><div className="risk-finding-body">
    {descriptions.map(description => <p key={description}>{description}</p>)}
    {!background && [...new Set(members.map(member => member.consequence))].map(consequence => <p key={consequence}><b>Betydning:</b> {consequence}</p>)}
    {!background && [...new Set(members.map(member => member.action))].map(action => <p key={action}><b>Neste steg:</b> {action}</p>)}
    {item.sourceQuality === 'partial-text' && <p className="field-issue">Ufullstendig tekstgrunnlag. Dette er et mulig forhold; kontroller original PDF-side.</p>}
    {item.domain === 'technical' && item.grade === null && <p>Tilstandsgrad er ikke fastslått i tekstgrunnlaget.</p>}{item.controlNote && <p>{item.controlNote}</p>}
    {item.sources.map((source, index) => <div className="risk-source" key={`${source.documentHash}:${source.documentName}:${source.pdfPage}:${index}`}>{source.quote && <blockquote>{source.quote}</blockquote>}<p>{source.documentName} · fysisk PDF-side {source.pdfPage}</p><button type="button" className="quiet-button" onClick={() => onSource(source)}>Se originalkilde ↗{item.sources.length > 1 ? ` (${index + 1})` : ''}</button></div>)}
    {item.sources.length === 0 && <p>Kildens fysiske side er ikke avklart. Kontroller originalrapporten.</p>}
  </div></details></li>
}
