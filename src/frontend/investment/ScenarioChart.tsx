import Big from 'big.js'
import { useId, useMemo, useState } from 'react'
import type { FinancialScenario } from '../../domain/financial-scenario.ts'
import { formatFinancialDecimal } from '../../presentation/finance.ts'
import { parseFinancialDecimal } from '../../domain/validation.ts'
import { useScenarioSensitivity } from './useScenarioSensitivity.ts'

const Decimal = Big()
Decimal.strict = true
type Mode = 'cash' | 'debt' | 'rate'
const modes: { id: Mode; label: string; title: string; scope: string }[] = [
  { id: 'cash', label: 'Kontantstrøm', title: 'Akkumulert kontantstrøm', scope: 'Konstant årlig kontantstrøm over valgt nedbetalingstid.' },
  { id: 'debt', label: 'Låneutvikling', title: 'Restgjeld på eget lån', scope: 'Privat annuitetslån. Fellesgjelden er ikke en del av restgjeldskurven.' },
  { id: 'rate', label: 'Rentefølsomhet', title: 'Årlig kontantstrøm ved ulike renter', scope: 'Alternative renter fra 2 til 12 %, med øvrige forutsetninger uendret.' },
]
const amount = (value: string, decimals = 0) => `${formatFinancialDecimal(new Decimal(value).toFixed(decimals, Decimal.roundHalfUp))} kr`
const percent = (value: string) => `${formatFinancialDecimal(value)} %`
function axisLabel(value: number) {
  const decimal = new Decimal(String(value))
  if (decimal.abs().gte('1000000')) return `${formatFinancialDecimal(decimal.div('1000000').toFixed(1))} mill.`
  if (decimal.abs().gte('1000')) return `${formatFinancialDecimal(decimal.div('1000').toFixed(0))}k`
  return formatFinancialDecimal(decimal.toFixed(0))
}

/** Presentation only. No reducer, request, confirmation or recommendation access. */
export function ScenarioChart({ scenario, pending = false }: { scenario: FinancialScenario; pending?: boolean }) {
  const id = useId()
  const [mode, setMode] = useState<Mode>('cash')
  const [pointIndex, setPointIndex] = useState<number | null>(null)
  const sensitivity = useScenarioSensitivity(scenario, !pending && mode === 'rate' && scenario.monthly !== null && scenario.cashFlow !== null)
  const definition = modes.find(item => item.id === mode)!
  const points = useMemo(() => {
    const raw = mode === 'rate'
      ? sensitivity.points.map(point => ({ x: point.annualInterest, y: point.cashFlow }))
      : scenario.series.map(point => ({ x: point.year, y: mode === 'debt' ? point.balance : point.cumulativeCashFlow }))
    // Unknown values never become zero through Number(null). A missing series is unavailable.
    if (raw.length < 2 || raw.some(point => point.y === null)) return []
    const coordinates = raw.map(point => ({ x: point.x, y: point.y!, coordinateX: Number(point.x), coordinateY: Number(point.y) }))
    return coordinates.every(point => Number.isFinite(point.coordinateX) && Number.isFinite(point.coordinateY)) ? coordinates : []
  }, [mode, scenario, sensitivity.points])
  const selectedRate = parseFinancialDecimal(scenario.controls.annualInterest)
  const initialIndex = mode === 'rate' && points.length ? points.reduce((nearest, point, index) =>
    Math.abs(point.coordinateX - Number(selectedRate ?? '0')) < Math.abs(points[nearest]!.coordinateX - Number(selectedRate ?? '0')) ? index : nearest, 0) : points.length - 1
  const selectedIndex = points.length ? Math.min(pointIndex ?? initialIndex, points.length - 1) : 0
  const selected = points[selectedIndex]
  const min = points.length ? Math.min(0, ...points.map(point => point.coordinateY)) : 0
  const rawMax = points.length ? Math.max(0, ...points.map(point => point.coordinateY)) : 1
  const max = rawMax === min ? min + 1 : rawMax
  const pad = (max - min) * 0.08
  const yMin = min < 0 ? min - pad : min, yMax = max + pad
  const chartWithinRange = [yMin, yMax, yMax - yMin].every(Number.isFinite)
  const xFirst = points[0]?.coordinateX ?? 0, xLast = points.at(-1)?.coordinateX ?? 1
  const x = (value: number) => 82 + (value - xFirst) / (xLast - xFirst || 1) * 684
  const y = (value: number) => 224 - (value - yMin) / (yMax - yMin) * 202
  const path = points.map((point, index) => `${index ? 'L' : 'M'}${x(point.coordinateX)},${y(point.coordinateY)}`).join(' ')
  const xTicks = [...new Set([0, Math.round((points.length - 1) / 4), Math.round((points.length - 1) / 2), Math.round((points.length - 1) * 0.75), points.length - 1])].filter(index => index >= 0)
  const xLabel = (value: string) => {
    if (mode === 'rate') return percent(value)
    const months = Number(new Decimal(value).times('12').toFixed(0, Decimal.roundHalfUp))
    return `${Math.floor(months / 12)} år${months % 12 ? ` ${months % 12} md.` : ''}`
  }
  const rateOutside = mode === 'rate' && scenario.monthly !== null
    && selectedRate !== null && (new Decimal(selectedRate).lt('2') || new Decimal(selectedRate).gt('12'))
  const unavailable = mode === 'debt' ? 'Lånegrafen krever kjent kontantbehov og gyldig egenkapital, rente og nedbetalingstid.'
    : 'Grafen krever kjent leie, fullstendig drift og samlet gjeldsbetaling for samme år, samt gyldig finansiering.'
  function choose(next: Mode) { setMode(next); setPointIndex(null) }
  return <section className="scenario-chart" aria-labelledby={`${id}-heading`}>
    <div className="chart-header"><div><p className="chart-eyebrow">Scenario · ikke bekreftet</p><h3 id={`${id}-heading`}>{definition.title}</h3></div>
      <div className="chart-tabs" role="tablist" aria-label="Velg scenariograf">{modes.map((item, index) => <button key={item.id}
        id={`${id}-tab-${item.id}`} type="button" role="tab" aria-selected={mode === item.id} aria-controls={`${id}-panel`}
        tabIndex={mode === item.id ? 0 : -1} onClick={() => choose(item.id)} onKeyDown={event => {
          const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : null
          const next = offset !== null ? modes[(index + offset + modes.length) % modes.length]
            : event.key === 'Home' ? modes[0] : event.key === 'End' ? modes.at(-1) : undefined
          if (next) { event.preventDefault(); choose(next.id); document.getElementById(`${id}-tab-${next.id}`)?.focus() }
        }}>{item.label}</button>)}</div></div>
    <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${mode}`}>
      <p className="chart-description">{definition.scope}</p>
      {pending || !chartWithinRange || points.length < 2 ? <p className="chart-unavailable" role="status">{pending ? 'Beregner scenario …' : !chartWithinRange ? 'Grafverdiene overstiger visningsområdet.' : mode === 'rate' && sensitivity.status === 'loading' ? 'Beregner rentefølsomhet lokalt …' : sensitivity.error ?? unavailable}</p> : <>
        <svg className="chart-svg" viewBox="0 0 800 270" role="img" aria-labelledby={`${id}-svg-title ${id}-svg-desc`}
          onPointerMove={event => {
            const rect = event.currentTarget.getBoundingClientRect()
            // Account for the SVG's default meet scaling and centered letterboxing.
            const scale = Math.min(rect.width / 800, rect.height / 270)
            const local = (event.clientX - rect.left - (rect.width - 800 * scale) / 2) / scale
            const target = xFirst + Math.max(0, Math.min(1, (local - 82) / 684)) * (xLast - xFirst)
            const nearest = points.reduce((best, point, index) => Math.abs(point.coordinateX - target) < Math.abs(points[best]!.coordinateX - target) ? index : best, 0)
            setPointIndex(nearest)
          }}>
          <title id={`${id}-svg-title`}>{definition.title}</title><desc id={`${id}-svg-desc`}>Ubekreftet økonomiscenario. Alle verdiene finnes også i datatabellen under grafen.</desc>
          {Array.from({ length: 5 }, (_, index) => {
            const value = yMin + (yMax - yMin) * index / 4
            return <g key={index}><line x1="82" x2="766" y1={y(value)} y2={y(value)} stroke="var(--chart-grid, #dce3db)" strokeDasharray="2 5" />
              <text x="0" y={y(value) + 4} fill="var(--chart-text, #607164)" fontSize="11">{axisLabel(value)}</text></g>
          })}
          <path d={`${path} L766,${y(0)} L82,${y(0)} Z`} fill="var(--chart-area, #e5eee4)" />
          <line x1="82" x2="766" y1={y(0)} y2={y(0)} stroke="var(--chart-zero, #718575)" strokeDasharray="4 4" />
          <path d={path} fill="none" stroke="var(--chart-line, #286653)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {xTicks.map(index => { const point = points[index]!; return <text key={index} x={x(point.coordinateX)} y="257" textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'} fontSize="11" fill="var(--chart-text, #607164)">{xLabel(point.x)}</text> })}
          {selected && <g><line x1={x(selected.coordinateX)} x2={x(selected.coordinateX)} y1="16" y2="224" stroke="var(--chart-line, #286653)" strokeDasharray="3 5" opacity="0.4" />
            <circle cx={x(selected.coordinateX)} cy={y(selected.coordinateY)} r="4" fill="var(--chart-line, #286653)" /></g>}
        </svg>
        <p className="chart-readout" id={`${id}-readout`}>{selected ? `${xLabel(selected.x)} · ${amount(selected.y, 2)}` : ''}</p>
        <div className="chart-inspector"><label htmlFor={`${id}-point`}>Utforsk grafen</label><input id={`${id}-point`} type="range" min="0" max={points.length - 1} step="1" value={selectedIndex}
          aria-describedby={`${id}-readout`} aria-valuetext={selected ? `${xLabel(selected.x)}, ${amount(selected.y, 2)}` : ''} onChange={event => setPointIndex(Number(event.currentTarget.value))} /><span>Bruk piltaster eller pek på grafen</span></div>
        {rateOutside && <p className="chart-description">Valgt rente ligger utenfor grafens 2–12 %. Hovedtallene bruker fortsatt din valgte rente.</p>}
        <details className="chart-data"><summary>Vis grafdata som tabell</summary><table><caption>{definition.title} · scenario</caption><thead><tr><th scope="col">{mode === 'rate' ? 'Årsrente' : 'Tid'}</th><th scope="col">{mode === 'debt' ? 'Restgjeld' : 'Kontantstrøm'}</th></tr></thead><tbody>{points.map(point => <tr key={point.x}><th scope="row">{xLabel(point.x)}</th><td>{amount(point.y, 2)}</td></tr>)}</tbody></table></details>
      </>}
      <p className="chart-scope-note">Uendret leie, drift, rente og årlig betaling. Uten skatt, verdiendring, salg og initial egenkapital. Akkumulert kontantstrøm er ikke totalavkastning. Siste lånebetaling kan avvike på grunn av øreavrunding.</p>
    </div>
  </section>
}
