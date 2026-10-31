import type { PropertyRiskItem, PropertyRiskOverview, RiskSource } from './property-risk.ts'

const labels = { documented: 'Dokumenterte problemer', possible: 'Mulige problemer som krever kontroll', unexamined: 'Opplysninger som ikke er undersøkt' }
export function RiskOverview({ risks, onDetails, children }: { risks: PropertyRiskOverview; onDetails: () => void; children?: React.ReactNode }) {
  return <section className="property-risk" aria-labelledby="property-risk-title">
    <div className="investment-section-heading"><div><p className="eyebrow">EIENDOMSRISIKO</p><h2 id="property-risk-title">Forhold som påvirker valget.</h2></div><button type="button" className="quiet-button" onClick={onDetails}>Se alle funn og kilder ↗</button></div>
    <p className="property-risk-intro">{risks.technicalCoverage} Opplysninger i dokumentene er ikke en juridisk eller teknisk godkjenning.</p>
    <div className="property-risk-groups">{(['documented', 'possible', 'unexamined'] as const).map(group => <div key={group} className={`property-risk-group property-risk-group--${group}`}>
      <h3>{labels[group]} <span>{risks[group].length + (group === 'unexamined' ? risks.gaps.length : 0)}</span></h3>
      {risks[group].length === 0 && group !== 'unexamined' && <p>Ingen slike treff i gjeldende uttrekk. Dette bekrefter ikke fravær av problemer.</p>}
      <ul>{risks[group].slice(0, 3).map(item => <li key={item.id}><button type="button" onClick={onDetails}><strong>{item.title}</strong><span>{item.description}</span><small>{item.domain === 'legal' ? 'Juridisk / praktisk' : 'Teknisk'}{item.sources[0] ? ` · fysisk PDF-side ${item.sources[0].pdfPage}` : ' · kilde må avklares'}</small></button></li>)}
        {group === 'unexamined' && risks.gaps.slice(0, Math.max(1, 3 - risks.unexamined.length)).map(gap => <li key={gap}><p>{gap}</p></li>)}
      </ul>
    </div>)}</div>
    {children}
  </section>
}

export function RiskDetails({ risks, onSource }: { risks: PropertyRiskOverview; onSource: (source: RiskSource) => void }) {
  return <div className="property-risk-details"><p>{risks.technicalCoverage} Lokal analyse har delvis dekning. Kontroller originalene før du legger forholdene til grunn.</p>
    {(['documented', 'possible', 'unexamined'] as const).map(group => <section key={group} aria-labelledby={`risk-detail-${group}`}><h3 id={`risk-detail-${group}`}>{labels[group]}</h3>
      {!risks[group].length && group !== 'unexamined' && <p>Ingen slike treff i gjeldende uttrekk. Fravær av treff er ikke dokumentasjon på fravær av problemer.</p>}
      <ol className="source-summary">{risks[group].map(item => <RiskDetail key={item.id} item={item} onSource={onSource} />)}</ol>
      {group === 'unexamined' && <ul className="risk-gaps">{risks.gaps.map(gap => <li key={gap}>{gap}</li>)}</ul>}
    </section>)}
    {risks.limitations.length > 0 && <details className="risk-limitations"><summary>Begrensninger og mangler ({risks.limitations.length})</summary><ul>{risks.limitations.map(reason => <li key={reason}>{reason}</li>)}</ul></details>}
  </div>
}
function RiskDetail({ item, onSource }: { item: PropertyRiskItem; onSource: (source: RiskSource) => void }) {
  return <li><strong>{item.title}</strong><p>{item.description}</p><p><b>Betydning:</b> {item.consequence}</p><p><b>Neste steg:</b> {item.action}</p>
    {item.sourceQuality === 'partial-text' && <p className="field-issue">Ufullstendig tekstgrunnlag. Dette er et mulig forhold; kontroller original PDF-side.</p>}
    {item.domain === 'technical' && item.grade === null && <p>Tilstandsgrad er ikke fastslått i tekstgrunnlaget.</p>}{item.controlNote && <p>{item.controlNote}</p>}
    {item.sources.map((source, index) => <div className="risk-source" key={`${source.documentHash}:${source.pdfPage}:${index}`}>{source.quote && <blockquote>{source.quote}</blockquote>}<p>{source.documentName} · fysisk PDF-side {source.pdfPage}</p><button type="button" className="quiet-button" onClick={() => onSource(source)}>Se originalkilde ↗{item.sources.length > 1 ? ` (${index + 1})` : ''}</button></div>)}
    {item.sources.length === 0 && <p>Kildens fysiske side er ikke avklart. Kontroller originalrapporten.</p>}
  </li>
}
