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
  const automatic = basis.provenance.L.startsWith('SSB-referanse')
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
    <div className="investment-section-heading"><div><p className="eyebrow">LEIEINNTEKT · AUTOMATISK FØRSTEVURDERING</p><h2 id="rent-estimate-title">Forventet leie.</h2></div><p>Lokale, publiserte referanser<br />Individuell markedsleie krever mer grunnlag</p></div>
    <p role="status">{rent.status === 'loading' ? 'Henter leiegrunnlag fra salgsoppgaven og lokale referanser …'
      : rent.status === 'failed' ? 'Leieoppslaget er utilgjengelig. Dokumentanalysen er beholdt.'
        : result?.status === 'estimated' ? 'Statistiske referanser klare. Dette er ikke dokumentert leie eller individuell markedsleie.' : 'Et forsvarlig automatisk estimat kunne ikke beregnes fra dette grunnlaget.'}</p>
    {result && partialDocument && <p>Dokumentgrunnlaget er ufullstendig lest. Leiegrunnlaget bruker bare lesbare boligopplysninger; uleste deler kan inneholde motstrid. Kontroller originalen.</p>}
    {result && <div className="rent-published-references">
      <h3>Individuell markedsleie: Ikke beregnet</h3>
      <p data-testid="rent-market-status">{result.marketEstimate.reason}</p>
      {published && <><h3>Publisert romreferanse · {published.rooms} rom</h3>
        <p><strong data-testid="rent-published-monthly">{number(published.value)} kr/mnd</strong> · {published.geography} · {populationLabel[published.population]} · {published.period}.</p>
        <p>{published.publisher} · publisert {published.publishedAt ?? 'ukjent dato'}. Dette er et gruppenivå, uten individuell arealtilpasning. <a href={published.sourceUrl} target="_blank" rel="noreferrer">Se publisert kilde ↗</a></p></>}
      <details><summary>Se publiserte referanser og kildeavgrensninger</summary>
        <p>Lokalt datasett {result.published.datasetVersion} · kontrollert {result.published.snapshotDate}.</p>
        {result.published.references.length > 0 && <div className="rent-table-scroll"><table><caption>Separate publiserte verdier · ingen prisblanding</caption><thead><tr><th>Kilde, periode og utvalg</th><th>Område / boligtype</th><th>Verdi</th><th>Utvalg og avgrensning</th></tr></thead><tbody>
          {result.published.references.map(({ reference: item, relevance }) => <tr key={item.id}><td><a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.publisher} ↗</a><br />{item.period}<br />{populationLabel[item.population]}<br />Publisert {item.publishedAt ?? 'ukjent'} · {item.locator}</td><td>{item.geography}<br />{item.rooms ? `${item.rooms} rom` : 'Blandede boligtyper'}</td><td>{number(item.value, item.metric === 'monthly-rent' ? 0 : 1)} {item.metric === 'monthly-rent' ? 'kr/mnd' : '% årsvekst'}{relevance === 'context' && <small> · bare kontekst</small>}</td><td>{item.notes}</td></tr>)}
        </tbody></table></div>}
        <ul>{result.published.limitations.map(item => <li key={item}>{item}</li>)}</ul>
      </details>
    </div>}
    {result?.status === 'estimated' && <>
      <h3>SSB · selvstendig statistisk sammenligning</h3>
      <div className="rent-estimate-values"><p><span>SSB-referanse per måned</span><strong data-testid="rent-monthly">{number(result.monthly)} kr</strong></p><p><span>Spenn mellom valgte SSB-soner</span><strong data-testid="rent-interval">{number(result.low)}–{number(result.high)} kr/mnd</strong></p><p><span>SSB-scenario · 12 måneder</span><strong>{number(result.annual)} kr</strong></p></div>
      {result.areaMethod?.kind === 'nearest-boundary' && <p data-testid="rent-area-approximation"><strong>Ytterpunktstilnærming: {result.areaMethod.documentArea} → {result.areaMethod.lowerArea} m².</strong> Dokumentarealet ligger høyst 2 m² utenfor SSB-punktene. Referanseverdien brukes uendret før avrunding; dette er ikke en direkte SSB-prediksjon for {result.areaMethod.documentArea} m². Ingen arealpåslag er beregnet. Individuell usikkerhet er ikke tallfestet.</p>}
      <p>Geografisk prisgrunnlag: {[...new Map(result.observations.map(item => [item.zoneCode, `${item.zoneLabel} (${item.zoneCode})`])).values()].join('; ')}.</p>
      <p>{automatic ? `Brukes automatisk i ubekreftet økonomiscenario for ${basis.year}.` : 'Referansen erstatter ikke registrert leie eller et manuelt redigert leiegrunnlag.'} Beløpet er i {result.statisticsYear}-nivå uten prisjustering.</p>

    </>}
    {result && onScenarioRent && (basis.L !== null || scenarioEdited) && <RentScenarioControls monthly={scenarioMonthly} edited={scenarioEdited} reference={published?.metric === 'monthly-rent' ? published : null} year={basis.year} onChange={onScenarioRent} />}
    <p className="rent-documented">{actualRegistered ? `${session.financial.L.confirmed ? 'Brukerbekreftet' : 'Ubekreftet'} faktisk leie er registrert med grunnlag: ${session.sources.L.description || 'Kilde mangler.'}` : actualSelected ? 'Faktisk leie er valgt, men registreringen har mangler eller motstrid. Kontroller beløp, periode, år og kilde i økonomigrunnlaget.' : 'Ingen dokumentert faktisk leie er registrert. Oppgitt faktisk leie og forventet leie kontrolleres separat i økonomigrunnlaget.'}</p>
    {result && <div className="rent-document-facts"><h3>Boligopplysninger fra dokumentet</h3><p>Automatisk dokumentuttrekk · kildekontroll kan gjenstå. Disse verdiene er ikke et leieestimat.</p>
      <dl className="source-summary">{fields.map(([label, field]) => <div key={label}><dt>{label}</dt><dd>{field?.value ?? 'Ukjent · ikke entydig gjenkjent'}{field && <small> · fra dokumentet</small>}{field?.sources.map((source, index) => <button type="button" className="quiet-button" key={`${source.pdfPage}-${source.start}-${index}`} onClick={() => onSource(source)}>Se {source.documentName} · PDF-side {source.pdfPage} ↗</button>)}</dd></div>)}</dl>
    </div>}
    {result?.status === 'unavailable' && <div className="rent-blockers"><h3>Hvorfor SSB-sammenligningen mangler</h3><ul>{[...new Set([...result.property.issues, ...result.limitations])].map(issue => <li key={issue}>{issue}</li>)}</ul><p>Ingen markedsleie er beregnet. Ukjent leie brukes ikke som null i økonomien.</p></div>}
    {result && <details className="rent-estimate-evidence"><summary>Se SSB-grunnlag, metode og usikkerhet</summary>
      <p>{result.method}</p>{result.formula && <p className="rent-formula">{result.formula}</p>}
      {result.sourceUrl && <p><a href={result.sourceUrl} target="_blank" rel="noreferrer">Se SSBs opprinnelige datagrunnlag ↗</a> · tabell 09897 · statistikkår {result.statisticsYear} · lokalt snapshot {result.snapshotDate} · beregnet {result.fetchedAt.slice(0, 10)} · SSB oppdatert {result.sourceUpdated?.slice(0, 10) ?? 'ukjent'}</p>}
      {result.observations.length > 0 && <div className="rent-table-scroll"><table><caption>Publiserte SSB-celler brukt i beregningen</caption><thead><tr><th>Sone</th><th>Rom/arealkode</th><th>Areal</th><th>Kr/mnd</th></tr></thead><tbody>{result.observations.map(item => <tr key={`${item.zoneCode}-${item.sizeCode}`}><td>{item.zoneLabel} ({item.zoneCode})</td><td>{item.sizeCode}</td><td>{item.area} m²</td><td>{number(item.monthly)}</td></tr>)}</tbody></table></div>}
      {result.status === 'estimated' && <ul>{[...new Set([...result.property.issues, ...result.limitations])].map(issue => <li key={issue}>{issue}</li>)}</ul>}
    </details>}
    {(rent.status === 'failed' || result?.status === 'unavailable') && <button type="button" className="quiet-button" onClick={rent.retry}>Prøv leieoppslaget på nytt ↗</button>}
  </section>
}
