import type { FinancialMetricBasis } from '../../contracts/finance.ts'
import type { PresentedFinancialMetric } from '../../contracts/presentation.ts'
import type { ResultSelection } from '../../contracts/result.ts'
import { formatFinancialDecimal, formatFinancialMetrics } from '../../presentation/finance.ts'

const fieldLabels = {
  P: 'Totalpris inklusive eventuell fellesgjeld, uten kjøpsomkostninger',
  L: 'Brutto leieinntekt', D: 'Eierbetalte driftskostnader',
  J: 'Gjeldsbetjening: renter og avdrag inklusive eventuell fellesgjeld',
}

function InputBasis({ input, applied }: { input: FinancialMetricBasis['inputs'][number]; applied: boolean }) {
  const { field, registered, normalization, source } = input
  const recurring = 'period' in registered ? registered : null
  const period = recurring?.period === 'month' ? 'måned' : recurring?.period === 'year' ? 'år' : 'ukjent periode'
  return <div className="metric-input-basis">
    <dt>{field} — {fieldLabels[field]}</dt>
    <dd>
      <p>Registrert: {registered.rawValue || 'Ikke oppgitt'} kr{recurring && `/${period} · ${recurring.year || 'År ikke oppgitt'}`}.</p>
      {normalization ? <p>Omregningsfaktor: {normalization.factor}. {applied ? 'Anvendt årsverdi' : 'Normalisert årsverdi, ikke anvendt i beregning'}: {formatFinancialDecimal(normalization.annualValue)} kr/år · {normalization.year}.</p>
        : field === 'P' && input.decimal !== null && <p>{applied ? 'Anvendt totalpris' : 'Registrert numerisk totalpris, ikke anvendt i beregning'}: {formatFinancialDecimal(input.decimal)} kr. Ingen årsomregning.</p>}
      <p>{source.kind === 'source' ? 'Oppgitt kilde' : source.kind === 'assumption' ? 'Egen forutsetning' : 'Opphav ikke oppgitt'}: {source.description || 'Ikke oppgitt'}.</p>
      {'rentNature' in source && <p>{source.rentNature === 'expected' ? 'Forventet leie, ikke dokumentert faktisk leie.'
        : source.rentNature === 'actual' ? 'Faktisk leie med brukeroppgitt kilde.' : 'Leiegrunnlag ikke oppgitt.'}</p>}
      {source.conflict && <p>Uløst kildekonflikt: {source.conflict.rawValue} kr · {source.conflict.description}.</p>}
      <p className="meta">{registered.confirmed ? 'Bekreftet input i dette resultatet.' : 'Ubekreftet input — ikke anvendt i en beregning.'}</p>
    </dd>
  </div>
}

function CostBasis({ basis }: { basis: FinancialMetricBasis }) {
  const cost = basis.costBreakdown
  if (!cost) return null
  const registered = basis.inputs.find(input => input.field === 'D')?.registered
  const period = registered && 'period' in registered
    ? `${registered.period === 'month' ? 'måned' : registered.period === 'year' ? 'år' : 'ukjent periode'} · ${registered.year || 'År ikke oppgitt'}` : 'perioden for D'
  const money = (value: string | null) => value === null ? 'Ikke avklart' : `${formatFinancialDecimal(value)} kr`
  return <section className="metric-cost-basis" aria-label="Kostnadsinnhold og D/J-fordeling">
    <h4>Kostnadsinnhold og D/J-fordeling</h4>
    <p>Postene følger D: {period}. Kostnadsinnhold skal inngå i D/J-totalene og skal ikke trekkes fra på nytt. Renter og avdrag hører bare til J.</p>
    {cost.items.length === 0 ? <p>Ingen kostnadsposter oppgitt.</p> : <ul>
      {cost.items.map(item => <li key={item.id}>
        <p>Registrert beløp: {item.rawAmount || 'Ikke oppgitt'} kr. Registrerte renter og avdrag: {item.rawDebt || 'Ikke oppgitt'} kr.</p>
        <p><strong>{item.label || 'Post uten navn'}</strong>: {money(item.amount)} = D {money(item.D)} + J {money(item.J)}.</p>
        {item.status === 'included' && <p>Inngår i {cost.items.find(other => other.id === item.includedIn)?.label || 'oppgitt post'}; telles ikke på nytt.</p>}
        {item.includedIn !== null && item.status !== 'included' && <p>Registrert inkludering: {cost.items.find(other => other.id === item.includedIn)?.label || item.includedIn}. Inkluderingen må kontrolleres.</p>}
        {item.status === 'invalid' && <p>Oppdelingen må kontrolleres.</p>}
      </li>)}
    </ul>}
    {cost.items.length > 0 && (cost.annualD !== null && cost.annualJ !== null
      ? <p>Oppgitt kostnadsinnhold uten dobbelttelling: D {money(cost.annualD)}/år · J {money(cost.annualJ)}/år. Dette kan være en del av totalene.</p>
      : <p>Kostnadsinnholdet må kontrolleres før årsfordelingen kan brukes.</p>)}
  </section>
}

function NetYieldBasis({ threshold }: { threshold: PresentedFinancialMetric['threshold'] }) {
  if (!threshold || !('minimumYield' in threshold.basis)) return null
  const { registered, source } = threshold.basis.minimumYield
  return <section aria-label="Avkastningskravets grunnlag">
    <p>Registrert Ymin: {registered.rawValue || 'Ikke oppgitt'} %.</p>
    <p>{source.kind === 'source' ? 'Oppgitt kilde' : source.kind === 'assumption' ? 'Egen forutsetning' : 'Opphav ikke oppgitt'}: {source.description || 'Ikke oppgitt'}.</p>
    {source.conflict && <p>Uløst kildekonflikt: {source.conflict.rawValue} % · {source.conflict.description}.</p>}
    <p className="meta">{registered.confirmed ? 'Ymin er bekreftet i dette resultatet.' : 'Ymin er ubekreftet og brukes ikke som gyldig krav.'}</p>
    {threshold.decision.status === 'unavailable' ? <>
      <p>Terskelkontroll ikke tilgjengelig.</p>
      <ul className="metric-threshold-issues">{threshold.decision.issues.map((issue, index) => <li key={`${issue.field}-${issue.code}-${index}`}>{issue.message} {issue.action}</li>)}</ul>
    </> : <p>Eksakt minimumskrav til nettoyield: {threshold.minimumDetailValue} %. Regelen bruker uavrundet grunnlag uten toleransemargin.</p>}
  </section>
}

function MetricCard({ metric }: { metric: PresentedFinancialMetric }) {
  const { basis, issues } = metric.metric
  return <article className="financial-metric" aria-label={metric.name}>
    <h3>{metric.name}</h3>
    <p className="metric-value">{metric.displayValue === null ? 'Ikke beregnbart' : `${metric.displayValue} ${metric.unit}`}</p>
    <p className="meta">{metric.year ? `Årsgrunnlag ${metric.year}` : 'Årsgrunnlag ikke tilgjengelig'}</p>
    {metric.partialLabel && <p className="status-label metric-partial">{metric.partialLabel}</p>}
    {issues.length > 0 && <ul className="metric-issues">{issues.map((issue, index) => <li key={`${issue.field}-${issue.code}-${index}`}>
      {issue.message} {issue.action}
    </li>)}</ul>}
    {metric.rounding && <p className="metric-rounding">{metric.rounding.explanation}</p>}
    <details className="metric-detail">
      <summary>Beregningsgrunnlag — {metric.name}</summary>
      <div className="metric-detail-content">
        <p>Formel: {basis.formula}{metric.unit === '%' && ' × 100 %'}. {metric.unit === '%' ? 'Yield vises i prosent.' : 'Resultatet er i kr/år.'}</p>
        {metric.detail && <p>Detaljverdi{metric.detail.approximate ? ' (tilnærmet)' : ' (uavrundet)'}: {metric.detail.displayValue} {metric.unit}.</p>}
        <NetYieldBasis threshold={metric.threshold} />
        <dl>{basis.inputs.map(input => <InputBasis input={input} applied={metric.metric.status === 'available'} key={input.field} />)}</dl>
        <CostBasis basis={basis} />
        <p className="meta">Kodeberegning fra dette resultatets grunnlag. Ingen ekstra fratrekk for skatt, reparasjon, ledighet eller verdiendring.</p>
      </div>
    </details>
  </article>
}

/** Én seleksjon binder alle fire tall, terskler, kilder og historisk status sammen. */
export function FinancialMetrics({ result, showHistorySummary = true }: { result: ResultSelection; showHistorySummary?: boolean }) {
  if (result.status === 'not-calculated') return <section aria-label="Økonomiske nøkkeltall"><h2>Økonomiske nøkkeltall</h2><p>Ikke beregnet</p></section>
  const { assessment } = result.snapshot
  const metrics = formatFinancialMetrics({
    grossYield: assessment.metrics.grossYield, noi: assessment.metrics.noi,
    netYield: assessment.thresholds.netYield, cashFlowBeforeTax: assessment.thresholds.cashFlow,
  }, { partialBasis: assessment.partialBasis })
  return <section className={`financial-metrics${result.status === 'historical' ? ' financial-metrics-historical' : ''}`} aria-label="Økonomiske nøkkeltall">
    <h2>Økonomiske nøkkeltall</h2>
    {result.status === 'historical' && showHistorySummary && <div className="metric-stale">
      <p className="status-label">Utdatert / Må bekreftes på nytt</p>
      <p>Historiske tall og beregningsgrunnlag fra forrige vurdering.</p>
      <ul>{result.changes.map((change, index) => <li key={index}>{change.message} {change.nextAction}</li>)}</ul>
    </div>}
    <div className="metric-grid">{Object.entries(metrics).map(([key, metric]) => <MetricCard key={key} metric={metric} />)}</div>
  </section>
}
