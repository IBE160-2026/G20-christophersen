import type { DocumentImport, PdfSource } from '../../contracts/document-import.ts'
import Big from 'big.js'
import { formatFinancialDecimal } from '../../presentation/finance.ts'
const Decimal = Big(); Decimal.strict = true
const amount = (value: string) => `${formatFinancialDecimal(new Decimal(value).toFixed(2, Decimal.roundHalfUp))} kr`
const period = { once: 'engangsbeløp', month: 'per måned', year: 'per år', unknown: 'periode ukjent' }
const kinds: Record<string, string> = { amount: 'Beløp i dokumentet', period: 'Periode', vat: 'Mva', conflict: 'Motstrid', limitation: 'Begrensning', missing: 'Manglende opplysninger', lease: 'Leieforhold', 'other-operating-cost': 'Øvrig drift', investigation: 'Undersøkelser', 'own-experts': 'Egne fagfolk', 'unmeasured-area': 'Uavklart areal' }
export function DocumentEconomy({ outcome, onSource }: { outcome: DocumentImport; onSource: (page: number) => void }) {
  const analysis = outcome.economy.analysis
  const sources = (items: PdfSource[]) => items.map((source, index) => <div className="document-economy-source" key={`${source.pdfPage}:${source.start}:${index}`}><q>{source.quote}</q><p>{source.documentName} · fysisk PDF-side {source.pdfPage} <button type="button" className="quiet-button" onClick={() => onSource(source.pdfPage)}>Åpne originalside ↗</button></p></div>)
  return <section className="document-economy" aria-labelledby="document-economy-title"><p className="eyebrow">DOKUMENTETS ØKONOMI</p><h2 id="document-economy-title">Beløp og kildegrunnlag.</h2>
    <p><strong>{analysis?.provenance === 'saved-same-document' ? 'Lagret analyse av samme dokument' : analysis?.provenance === 'live-document' ? 'KI-analyse av dette dokumentet' : 'Lokalt dokumentuttrekk'}</strong> · ubekreftet</p>
    <p role="status">{analysis?.reason ?? 'Lokalt dokumentuttrekk er klart. Videre KI-analyse har ikke startet.'}</p>
    <p>{outcome.pageCount} fysiske sider kartlagt; tekstlaget er forsøkt lest på alle sider. Bilder/raster er ikke analysert.{analysis?.selectedPages.length ? ` Økonomianalysen omfatter fysisk PDF-side ${analysis.selectedPages.join(', ')}.` : ''} Teknisk dekning: {outcome.coverage.technical.status === 'complete' ? 'fullført uttrekk, kontroll gjenstår' : 'ufullstendig'}. Leie, full drift og finansiering må avklares før nøkkeltall kan beregnes.</p>
    <dl className="document-economy-fields">{outcome.economy.fields.map(field => <div key={field.id}><dt>{field.label}</dt><dd><strong>{field.amount === null ? 'Ukjent' : amount(field.amount)}</strong> · {field.status === 'conflict' ? 'Motstrid – krever avklaring' : field.amount === null ? 'Opplysninger mangler i uttrekket' : field.nature === 'stated-estimate' ? 'Dokumentets estimat' : 'Fra dokumentet'}{(field.amount !== null || field.status === 'conflict') && <> · {period[field.period]} · {field.year ?? 'år ukjent'}</>}
      {field.status === 'conflict' && <p>Kildene inneholder motstridende opplysninger. Alternative beløp er bevart nedenfor; beløp, periode og år må avklares før bruk.</p>}
      {field.amount === null && field.status !== 'conflict' && <p>Dokumentuttrekket gir ikke et verifiserbart beløp for {field.label.toLocaleLowerCase('nb')}. Kontroller originalen eller oppgi en begrunnet forutsetning.</p>}
      {field.sources.length > 0 && <details><summary>Kilder for {field.label.toLocaleLowerCase('nb')}</summary>{sources(field.sources)}</details>}
      {field.alternatives.map((item, index) => <div key={index}><p>Alternativt belegg: {item.amount === null ? 'ukjent beløp' : amount(item.amount)}{field.status === 'conflict' && <> · periode ukjent · år ukjent; kontroller alternativets periode og år i originalkilden</>}</p>{sources([item.source])}</div>)}
    </dd></div>)}</dl>
    <details><summary>Observasjoner og originaltekst ({analysis?.observations.length ?? 0})</summary>{analysis?.observations.map((item, index) => <article key={index}><h3>{kinds[item.kind] ?? 'Kildeobservasjon'} · tolkning uavklart</h3>{sources(item.sources)}</article>)}{analysis?.limitations.map((item, index) => <article key={`limitation:${index}`}><h3>Originalutdrag til kontroll</h3>{sources(item.sources)}</article>)}{!analysis?.observations.length && <p>Ingen videre kildebundet økonomianalyse er tilgjengelig.</p>}</details>
    <details><summary>Mangler og dekning</summary><ul>{outcome.economy.fields.filter(field => field.amount === null || field.status === 'conflict' || field.period === 'unknown').map(field => <li key={field.id}>{field.label}: {field.status === 'conflict' ? 'motstrid må avklares' : field.amount === null ? 'verifiserbart beløp mangler' : 'periode mangler'}</li>)}{outcome.coverage.economy.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul><p>Bekreftelse av økonomi og teknisk grunnlag gjenstår.</p></details>
  </section>
}
