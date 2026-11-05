import Big from 'big.js'
import { rentalTypeLabel } from './rental-type-label.ts'
import type { RentState } from './useRentEstimate.ts'
import type { SessionState } from '../state/session.ts'
import type { ScenarioBasis } from '../../domain/financial-scenario.ts'
import { RentScenarioControls } from './RentScenarioControls.tsx'
import type { PdfSource } from '../../contracts/pdf-source.ts'
import { validateFinancialBasis } from '../../domain/financial-basis.ts'
import { formatFinancialDecimal } from '../../presentation/finance.ts'
const Decimal = Big(); Decimal.strict = true
const number = (value: string | null, decimals = 0) => value === null ? '—' : formatFinancialDecimal(new Decimal(value).toFixed(decimals, Decimal.roundHalfUp))

export function RentEstimatePanel({ rent, session, basis, onSource, scenarioMonthly, scenarioEdited, onScenarioRent }: {
  rent: RentState & { retry: () => void }; session: SessionState; basis: ScenarioBasis; onSource: (source: PdfSource) => void
  scenarioMonthly: string; scenarioEdited: boolean; onScenarioRent?: (monthly: string) => void
}) {
  if (rent.status === 'idle') return null
  const result = rent.result
  const published = result?.published.references.find(item => item.reference.id === result.published.selectedReferenceId)?.reference
  const populationLabel = { 'active-contracts': 'Aktive kontrakter', 'new-contracts': 'Nye kontrakter', 'advertisements-and-portfolio': 'Annonser og portefølje', 'signed-contracts-unspecified': 'Inngåtte kontrakter; aktive/nye ikke skilt' }
  const fields = result ? [
    ['Adresse', result.property.address], ['Kommune', result.property.municipality], ['Bydel', result.property.district],
    ['Areal', result.property.area ? { ...result.property.area, value: `${result.property.area.value} m² ${result.property.area.basis}` } : null],
    ['Rom', result.property.rooms], ['Soverom', result.property.bedrooms], ['Boligtype', result.property.propertyType ? { ...result.property.propertyType, value: rentalTypeLabel(result.property.propertyType) } : null],
  ] as const : []
  const actualSelected = session.sources.L.rentNature === 'actual'
  const rentValidation = actualSelected ? validateFinancialBasis({ values: session.financial, sources: session.sources, costItems: session.costItems }, []).fields.L : null
  const actualRegistered = actualSelected && rentValidation?.normalization?.annualValue !== null && rentValidation?.normalization?.annualValue !== undefined
    && rentValidation.issues.every(issue => issue.code === 'unconfirmed-value' || issue.code === 'unconfirmed-zero')
  const partialDocument = session.prospectus.prospectus.outcome?.pages.some(page => !['readable', 'blank'].includes(page.status) || page.rasterUnprocessed)
  return <section className="rent-estimate" aria-labelledby="rent-estimate-title">
    <p className="eyebrow">LEIEFORUTSETNING</p><h3 id="rent-estimate-title">Leieinntekt</h3>
    {(rent.status === 'loading' || rent.status === 'failed') && <p role="status">{rent.status === 'loading' ? 'Henter leiegrunnlag …' : 'Leieoppslaget er utilgjengelig. Dokumentanalysen er beholdt.'}</p>}
    {published && <div className="rent-published-references"><p><span>Statistisk leiereferanse · {published.rooms} rom</span><strong data-testid="rent-published-monthly">{number(published.value)} kr/mnd</strong></p><p>{published.publisher} · {published.geography} · {published.period}</p><p className="metric-caption">Gruppenivå · individuell markedsleie er ikke beregnet.</p></div>}
    {result && onScenarioRent && (basis.L !== null || scenarioEdited) && <RentScenarioControls monthly={scenarioMonthly} edited={scenarioEdited} reference={published?.metric === 'monthly-rent' ? published : null} year={basis.year} onChange={onScenarioRent} />}
    {result && !published && <p className="metric-caption">Ingen relevant publisert romreferanse. Individuell markedsleie er ikke beregnet.</p>}
    {result && <details className="rent-estimate-evidence"><summary>Leiekilder og metode</summary>
      <p data-testid="rent-market-status">{result.marketEstimate.reason}</p>
      {partialDocument && <p>Dokumentet er ufullstendig lest. Leiegrunnlaget bruker bare lesbare boligopplysninger; uleste deler kan inneholde motstrid.</p>}
      <p className="rent-documented">{actualRegistered ? `${session.financial.L.confirmed ? 'Brukerbekreftet' : 'Ubekreftet'} faktisk leie: ${session.sources.L.description || 'Kilde mangler.'}` : actualSelected ? 'Registrert faktisk leie har mangler eller motstrid. Kontroller økonomigrunnlaget.' : 'Ingen dokumentert faktisk leie er registrert.'}</p>
      {published && <p>Publisert {published.publishedAt ?? 'ukjent dato'} · {populationLabel[published.population]}. Gruppenivå uten individuell arealtilpasning. <a href={published.sourceUrl} target="_blank" rel="noreferrer">Se publisert kilde ↗</a></p>}
      <p>Lokalt datasett {result.published.datasetVersion} · kontrollert {result.published.snapshotDate}.</p>
      {result.published.references.length > 0 && <div className="rent-table-scroll"><table><caption>Publiserte referanser · separate verdier</caption><thead><tr><th>Kilde og periode</th><th>Område / boligtype</th><th>Verdi</th><th>Avgrensning</th></tr></thead><tbody>
        {result.published.references.map(({ reference: item, relevance }) => <tr key={item.id}><td><a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.publisher} ↗</a><br />{item.period}<br />{populationLabel[item.population]}<br />Publisert {item.publishedAt ?? 'ukjent'} · {item.locator}</td><td>{item.geography}<br />{item.rooms ? `${item.rooms} rom` : 'Blandede boligtyper'}</td><td>{number(item.value, item.metric === 'monthly-rent' ? 0 : 1)} {item.metric === 'monthly-rent' ? 'kr/mnd' : '% årsvekst'}{relevance === 'context' && <small> · kontekst</small>}</td><td>{item.notes}</td></tr>)}
      </tbody></table></div>}
      <ul>{result.published.limitations.map(item => <li key={item}>{item}</li>)}</ul>
      <h4>Intern kontrollkilde · SSB</h4>
      {result.status === 'estimated' && <><div className="rent-estimate-values"><p><span>SSB-referanse per måned</span><strong data-testid="rent-monthly">{number(result.monthly)} kr</strong></p><p><span>Spenn mellom SSB-soner</span><strong data-testid="rent-interval">{number(result.low)}–{number(result.high)} kr/mnd</strong></p><p><span>Årsreferanse</span><strong>{number(result.annual)} kr</strong></p></div>
        {result.areaMethod?.kind === 'nearest-boundary' && <p data-testid="rent-area-approximation">Ytterpunktstilnærming: {result.areaMethod.documentArea} → {result.areaMethod.lowerArea} m². Referanseverdien brukes uendret; ingen arealpåslag.</p>}
        <p>{basis.provenance.L.startsWith('SSB-referanse') ? `Brukes automatisk i ubekreftet økonomiscenario for ${basis.year}.` : 'Referansen erstatter ikke registrert leie eller et manuelt redigert leiegrunnlag.'} Beløpet er i {result.statisticsYear}-nivå uten prisjustering.</p></>}
      <p>{result.method}</p>{result.formula && <p className="rent-formula">{result.formula}</p>}
      {result.sourceUrl && <p><a href={result.sourceUrl} target="_blank" rel="noreferrer">Se SSBs opprinnelige datagrunnlag ↗</a> · tabell 09897 · {result.statisticsYear} · snapshot {result.snapshotDate} · beregnet {result.fetchedAt.slice(0, 10)} · oppdatert {result.sourceUpdated?.slice(0, 10) ?? 'ukjent'}</p>}
      {result.observations.length > 0 && <div className="rent-table-scroll"><table><caption>Publiserte SSB-celler brukt i beregningen</caption><thead><tr><th>Sone</th><th>Rom/arealkode</th><th>Areal</th><th>Kr/mnd</th></tr></thead><tbody>{result.observations.map(item => <tr key={`${item.zoneCode}-${item.sizeCode}`}><td>{item.zoneLabel} ({item.zoneCode})</td><td>{item.sizeCode}</td><td>{item.area} m²</td><td>{number(item.monthly)}</td></tr>)}</tbody></table></div>}
      <ul>{[...new Set([...result.property.issues, ...result.limitations])].map(issue => <li key={issue}>{issue}</li>)}</ul>
      <div className="rent-document-facts"><h4>Boligopplysninger fra dokumentet</h4><dl className="source-summary">{fields.map(([label, field]) => <div key={label}><dt>{label}</dt><dd>{field?.value ?? 'Ukjent'}{field?.sources.map((source, index) => <button type="button" className="quiet-button" key={`${source.pdfPage}-${source.start}-${index}`} onClick={() => onSource(source)}>Se {source.documentName} · PDF-side {source.pdfPage} ↗</button>)}</dd></div>)}</dl></div>
    </details>}
    {(rent.status === 'failed' || result?.status === 'unavailable') && <button type="button" className="quiet-button" onClick={rent.retry}>Prøv leieoppslaget på nytt ↗</button>}
  </section>
}
