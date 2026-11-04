import Big from 'big.js'
import { rentalTypeLabel } from './rental-type-label.ts'
import type { RentState } from './useRentEstimate.ts'
import type { SessionState } from '../state/session.ts'
import type { ScenarioBasis, ScenarioControls } from '../../domain/financial-scenario.ts'
import type { PdfSource } from '../../contracts/pdf-source.ts'
import { validateFinancialBasis } from '../../domain/financial-basis.ts'
import { calculateFinancialScenario } from '../../domain/financial-scenario.ts'
import { formatFinancialDecimal } from '../../presentation/finance.ts'
const Decimal = Big(); Decimal.strict = true
const number = (value: string | null, decimals = 0) => value === null ? '—' : formatFinancialDecimal(new Decimal(value).toFixed(decimals, Decimal.roundHalfUp))

export function RentEstimatePanel({ rent, session, basis, controls, onSource }: {
  rent: RentState & { retry: () => void }; session: SessionState; basis: ScenarioBasis; controls: ScenarioControls; onSource: (source: PdfSource) => void
}) {
  if (rent.status === 'idle') return null
  const result = rent.result
  const automatic = basis.provenance.L.startsWith('SSB-estimat')
  const alternative = (monthly: string | null) => monthly === null ? null : calculateFinancialScenario({ ...basis, L: new Decimal(monthly).times('12').toFixed() }, controls)
  const lower = automatic ? alternative(result?.low ?? null) : null, upper = automatic ? alternative(result?.high ?? null) : null
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
    <div className="investment-section-heading"><div><p className="eyebrow">LEIEINNTEKT · AUTOMATISK FØRSTEVURDERING</p><h2 id="rent-estimate-title">Forventet leie.</h2></div><p>Åpen statistikk fra SSB<br />Estimat · krever markedskontroll</p></div>
    <p role="status">{rent.status === 'loading' ? 'Henter leiegrunnlag automatisk fra salgsoppgaven og SSB …'
      : rent.status === 'failed' ? 'Leieoppslaget er utilgjengelig. Dokumentanalysen er beholdt.'
        : result?.status === 'estimated' ? 'Leieestimat klart. Dette er forventet leie, ikke dokumentert leie.' : 'Et forsvarlig automatisk estimat kunne ikke beregnes fra dette grunnlaget.'}</p>
    {result && partialDocument && <p>Dokumentgrunnlaget er ufullstendig lest. Leiegrunnlaget bruker bare lesbare boligopplysninger; uleste deler kan inneholde motstrid. Kontroller originalen.</p>}
    {result?.status === 'estimated' && <>
      <div className="rent-estimate-values"><p><span>Estimert leie per måned</span><strong data-testid="rent-monthly">{number(result.monthly)} kr</strong></p><p><span>Konservativt scenariointervall</span><strong data-testid="rent-interval">{number(result.low)}–{number(result.high)} kr/mnd</strong></p><p><span>Årlig bruttoleie · 12 måneder</span><strong>{number(result.annual)} kr</strong></p></div>
      <p>{automatic ? `Brukes automatisk i ubekreftet økonomiscenario for ${basis.year}.` : 'Estimatet erstatter ikke registrert leie eller et manuelt redigert leiegrunnlag.'} Beløpet er i {result.statisticsYear}-nivå uten prisjustering.</p>
      {lower && upper && <p className="rent-scenario-range">Med leieintervallet: bruttoyield {number(lower.grossYield, 2)}–{number(upper.grossYield, 2)} %. {lower.cashFlow !== null && upper.cashFlow !== null ? `Årlig kontantstrøm ${number(lower.cashFlow)}–${number(upper.cashFlow)} kr.` : 'Kontantstrømintervall krever full drift og finansiering.'}</p>}
    </>}
    <p className="rent-documented">{actualRegistered ? `${session.financial.L.confirmed ? 'Brukerbekreftet' : 'Ubekreftet'} faktisk leie er registrert med grunnlag: ${session.sources.L.description || 'Kilde mangler.'}` : actualSelected ? 'Faktisk leie er valgt, men registreringen har mangler eller motstrid. Kontroller beløp, periode, år og kilde i økonomigrunnlaget.' : 'Ingen dokumentert faktisk leie er registrert. Oppgitt faktisk leie og forventet leie kontrolleres separat i økonomigrunnlaget.'}</p>
    {result && <div className="rent-document-facts"><h3>Boligopplysninger fra dokumentet</h3><p>Automatisk dokumentuttrekk · kildekontroll kan gjenstå. Disse verdiene er ikke et leieestimat.</p>
      <dl className="source-summary">{fields.map(([label, field]) => <div key={label}><dt>{label}</dt><dd>{field?.value ?? 'Ukjent · ikke entydig gjenkjent'}{field && <small> · fra dokumentet</small>}{field?.sources.map((source, index) => <button type="button" className="quiet-button" key={`${source.pdfPage}-${source.start}-${index}`} onClick={() => onSource(source)}>Se {source.documentName} · PDF-side {source.pdfPage} ↗</button>)}</dd></div>)}</dl>
    </div>}
    {result?.status === 'unavailable' && <div className="rent-blockers"><h3>Hvorfor markedsestimatet mangler</h3><ul>{[...new Set([...result.property.issues, ...result.limitations])].map(issue => <li key={issue}>{issue}</li>)}</ul><p>Ingen markedsleie er beregnet. Ukjent leie brukes ikke som null i økonomien.</p></div>}
    {result && <details className="rent-estimate-evidence"><summary>Se grunnlag, metode og usikkerhet</summary>
      <p>{result.method}</p>{result.formula && <p className="rent-formula">{result.formula}</p>}
      {result.sourceUrl && <p><a href={result.sourceUrl} target="_blank" rel="noreferrer">Hent det samme datagrunnlaget fra SSB ↗</a> · tabell 09897 · statistikkår {result.statisticsYear} · hentet {result.fetchedAt.slice(0, 10)} · SSB oppdatert {result.sourceUpdated?.slice(0, 10) ?? 'ukjent'}</p>}
      {result.observations.length > 0 && <div className="rent-table-scroll"><table><caption>Publiserte SSB-celler brukt i beregningen</caption><thead><tr><th>Sone</th><th>Rom/arealkode</th><th>Areal</th><th>Kr/mnd</th></tr></thead><tbody>{result.observations.map(item => <tr key={`${item.zoneCode}-${item.sizeCode}`}><td>{item.zoneLabel} ({item.zoneCode})</td><td>{item.sizeCode}</td><td>{item.area} m²</td><td>{number(item.monthly)}</td></tr>)}</tbody></table></div>}
      {result.status === 'estimated' && <ul>{[...new Set([...result.property.issues, ...result.limitations])].map(issue => <li key={issue}>{issue}</li>)}</ul>}
    </details>}
    {(rent.status === 'failed' || result?.status === 'unavailable') && <button type="button" className="quiet-button" onClick={rent.retry}>Prøv leieoppslaget på nytt ↗</button>}
  </section>
}
