import type { DocumentImport, EconomyField, PdfSource } from '../../contracts/document-import.ts'
import Big from 'big.js'
import { commonCostContent } from '../../domain/common-cost-content.ts'
import { formatFinancialDecimal } from '../../presentation/finance.ts'
const Decimal = Big(); Decimal.strict = true
const amount = (value: string) => `${formatFinancialDecimal(new Decimal(value).toFixed(2, Decimal.roundHalfUp))} kr`
const period = { once: 'engangsbeløp', month: 'per måned', year: 'per år', unknown: 'periode ukjent' }
const kinds: Record<string, string> = { amount: 'Beløp', period: 'Periode', vat: 'Mva', conflict: 'Motstrid', limitation: 'Begrensning', missing: 'Manglende opplysninger', lease: 'Leieforhold', 'other-operating-cost': 'Øvrig drift', investigation: 'Undersøkelser', 'own-experts': 'Egne fagfolk', 'unmeasured-area': 'Uavklart areal' }
export function DocumentEconomy({ outcome, onSource }: { outcome: DocumentImport; onSource: (page: number) => void }) {
  const analysis = outcome.economy.analysis
  const known = outcome.economy.fields.filter(field => field.amount !== null || field.status === 'conflict')
  const missing = outcome.economy.fields.filter(field => field.amount === null && field.status !== 'conflict')
  const sources = (items: PdfSource[]) => items.map((source, index) => <div className="document-economy-source" key={`${source.pdfPage}:${source.start}:${index}`}><q>{source.quote}</q><p>{source.documentName} · fysisk PDF-side {source.pdfPage} <button type="button" className="quiet-button" onClick={() => onSource(source.pdfPage)}>Åpne originalside ↗</button></p></div>)
  const renderField = (field: EconomyField) => {
    const content = commonCostContent(field.sources.map(source => source.quote))
    return <div key={field.id}><dt>{field.label}</dt><dd><strong>{field.amount === null ? 'Ukjent' : amount(field.amount)}</strong><span className="document-field-meta">{field.status === 'conflict' ? 'Motstrid · krever avklaring' : field.amount === null ? 'Mangler i uttrekket' : `${period[field.period]}${field.nature === 'stated-estimate' ? ' · dokumentets estimat' : ''}`}</span>
      {field.includedIn === 'commonCosts' && <p className="metric-caption">Inkludert i felleskostnader</p>}
      <details><summary>Kilder for {field.label.toLocaleLowerCase('nb')}</summary>
        <p>{field.nature === 'stated-estimate' ? 'Dokumentets estimat' : 'Fra dokumentet'} · ubekreftet · {field.year ?? 'år ukjent'}</p>
        {field.id === 'commonCosts' && <p>{[...content.included].filter(label => !content.excluded.has(label)).map(label => `${label} inngår. `).join('')}{content.excluded.size > 0 && 'Ekskluderte kostnader kommer i tillegg; beløp og eierandel må avklares.'}</p>}
        {field.status === 'conflict' && <p>Beløp, periode og år må avklares før bruk.</p>}
        {field.amount === null && field.status !== 'conflict' && <p>Verifiserbart beløp mangler. Kontroller originalen eller oppgi egen forutsetning.</p>}
        {sources(field.sources)}
        {field.alternatives.map((item, index) => <div key={index}><p>Alternativt belegg: {item.amount === null ? 'ukjent beløp' : amount(item.amount)} · kontroller periode og år</p>{sources([item.source])}</div>)}
      </details>
    </dd></div>
  }
  return <section className="document-economy" aria-labelledby="document-economy-title"><h3 id="document-economy-title">Beløp og kildegrunnlag.</h3><p className="metric-caption">{analysis?.provenance === 'saved-same-document' ? 'Lagret analyse av samme dokument' : analysis?.provenance === 'live-document' ? 'KI-analyse av dette dokumentet' : 'Lokalt dokumentuttrekk'} · ubekreftet</p>
    <dl className="document-economy-fields">{known.map(renderField)}</dl>
    <details><summary>Manglende beløp og dokumentdekning ({missing.length})</summary><dl className="document-economy-fields">{missing.map(renderField)}</dl><p>{analysis?.reason ?? 'Videre KI-analyse har ikke startet.'}</p><ul>{outcome.coverage.economy.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul></details>
    {(analysis?.observations.length || analysis?.limitations.length) ? <details><summary>Økonomiske observasjoner og originaltekst</summary>{analysis?.observations.map((item, index) => <article key={index}><h4>{kinds[item.kind] ?? 'Kildeobservasjon'}</h4>{sources(item.sources)}</article>)}{analysis?.limitations.map((item, index) => <article key={`limitation:${index}`}><h4>Originalutdrag til kontroll</h4>{sources(item.sources)}</article>)}</details> : null}
  </section>
}
