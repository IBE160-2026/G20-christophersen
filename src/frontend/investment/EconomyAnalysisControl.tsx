import { useEffect, useRef, useState } from 'react'
import type { Dispatch } from 'react'
import { z } from 'zod'
import { DocumentImportSchema } from '../../contracts/document-import.ts'
import type { DocumentImport } from '../../contracts/document-import.ts'
import type { SessionAction } from '../state/session.ts'
import type { SelectedReport } from '../state/report.ts'
import { readEconomyResponse } from './economy-api-response.ts'

const PlanSchema = z.object({
  planId: z.string().min(1), documentHash: z.string().regex(/^[a-f0-9]{64}$/), documentName: z.string(),
  requestDigest: z.string().regex(/^[a-f0-9]{64}$/).nullable(), selectedPages: z.array(z.number().int().positive()).max(200),
  excerpts: z.array(z.object({ pdfPage: z.number().int().positive(), text: z.string() })).max(200),
  reservedUsd: z.literal('0.15'), analysisCapUsd: z.literal('0.20'), blockers: z.array(z.string()), readyForApproval: z.boolean(),
  omittedRelevantPages: z.array(z.number().int().positive()).optional(),
})
type Plan = z.infer<typeof PlanSchema>
const reason = (code: string) => ({
  'economy-route-unavailable': 'Den lokale serveren mangler API-ruten for KI-analyse (HTTP 404). Stopp PAA-serveren, start den på nytt fra prosjektmappen og last siden på nytt.',
  'economy-response-not-json': 'Den lokale serveren ga ikke et gyldig JSON-svar. Kontroller at riktig PAA-server kjører, og last siden på nytt.',
  'invalid-request': 'Serveren avviste forespørselen. Last siden på nytt og forbered analysen igjen.',
  'api-request-failed': 'Den lokale serveren kunne ikke behandle forespørselen. Kontroller serveren. Ingen automatisk gjentakelse.',
  'request-too-large': 'Forespørselen er større enn serveren tillater. Last siden på nytt og forbered analysen igjen.',
  'economy-api-key-unavailable': 'API-nøkkel er ikke konfigurert på den lokale serveren. Ingen betalt analyse er startet.',
  'economy-plan-mismatch-or-expired': 'Godkjenningen er utløpt eller gjelder et annet dokument. Forbered analysen på nytt.',
  'economy-relevant-text-not-found': 'Ingen lesbar økonomitekst ble funnet. Kontroller originalen.',
  'api-key-unavailable': 'API-nøkkel er ikke konfigurert på den lokale serveren.',
  'missing-api-key': 'API-nøkkel er ikke konfigurert på den lokale serveren.',
  'economy-no-relevant-pages': 'Ingen lesbare økonomiutdrag ble funnet. Kontroller originalen.',
  'local-economy-text-limit': 'Økonomiteksten overskrider grensen for én analyse.',
  'local-economy-input-budget-exceeded': 'Forespørselen overskrider analysebudsjettet.',
  'local-economy-budget-margin': 'Dokumentets analyseramme er allerede brukt eller reservert.',
  'analysis-active': 'En annen analyse pågår. Vent til den er ferdig.',
  'transport-failure': 'Analysen kunne ikke fullføres. Kontroller serveren; ingen automatisk gjentakelse.',
  'invalid-response': 'Analysesvaret kunne ikke valideres. Lokale verdier er beholdt.',
}[code] ?? `Analysen er sperret: ${code}`)

export function EconomyAnalysisControl({ outcome, selected, generation, dispatch, onSource }: {
  outcome: DocumentImport; selected: SelectedReport; generation: number; dispatch: Dispatch<SessionAction>; onSource: (page: number) => void
}) {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [busy, setBusy] = useState<'prepare' | 'run' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [costApproved, setCostApproved] = useState(false), [transferApproved, setTransferApproved] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const active = useRef<AbortController | null>(null)
  const sessionId = useRef(crypto.randomUUID())
  useEffect(() => () => { active.current?.abort(); active.current = null }, [])
  async function prepare() {
    setBusy('prepare'); setError(null); setPlan(null); setCostApproved(false); setTransferApproved(false)
    const controller = new AbortController(); active.current = controller
    try {
      const body = new FormData(); body.append('file', selected.file)
      const response = await fetch('/api/document-economy/prepare', { method: 'POST', body, signal: controller.signal,
        headers: { 'X-Session-Id': sessionId.current, 'X-Request-Id': crypto.randomUUID(), 'X-Analysis-Generation': String(generation) } })
      const json = await readEconomyResponse(response)
      if (!response.ok) throw new Error(typeof json?.error === 'string' ? json.error : 'invalid-response')
      const parsed = PlanSchema.parse(json)
      if (parsed.readyForApproval && (!parsed.requestDigest || parsed.blockers.length > 0)) throw new Error('invalid-response')
      if (parsed.documentHash !== selected.hash || parsed.documentName !== selected.file.name.trim()
        || parsed.excerpts.length !== parsed.selectedPages.length || new Set(parsed.selectedPages).size !== parsed.selectedPages.length
        || new Set(parsed.excerpts.map(excerpt => excerpt.pdfPage)).size !== parsed.excerpts.length
        || parsed.excerpts.some(excerpt => !parsed.selectedPages.includes(excerpt.pdfPage) || outcome.pages[excerpt.pdfPage - 1]?.text !== excerpt.text)) throw new Error('invalid-response')
      if (!controller.signal.aborted) setPlan(parsed)
    } catch (caught) {
      if (!controller.signal.aborted) setError(reason(caught instanceof Error ? caught.message : 'transport-failure'))
    } finally { if (!controller.signal.aborted) setBusy(null) }
  }
  async function run() {
    if (!plan || !plan.requestDigest || !plan.readyForApproval || plan.blockers.length || !costApproved || !transferApproved || busy || attempted) return
    setBusy('run'); setAttempted(true); setError(null)
    const controller = new AbortController(); active.current = controller
    try {
      const response = await fetch('/api/document-economy/run', { method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId: plan.planId, documentHash: plan.documentHash,
          requestDigest: plan.requestDigest, approveCost: true, approveTransfer: true }) })
      const json = await readEconomyResponse(response)
      if (!response.ok) {
        const code = typeof json?.error === 'string' ? json.error : 'invalid-response'
        if (['economy-api-key-unavailable', 'analysis-active', 'economy-plan-mismatch-or-expired', 'economy-explicit-consent-required'].includes(code)) setAttempted(false)
        if (code === 'economy-plan-mismatch-or-expired') { setPlan(null); setCostApproved(false); setTransferApproved(false) }
        throw new Error(code)
      }
      const result = DocumentImportSchema.safeParse(json?.outcome)
      if (!result.success || result.data.reportHash !== selected.hash || result.data.economy.analysis?.requestDigest !== plan.requestDigest) throw new Error('invalid-response')
      if (!controller.signal.aborted) dispatch({ type: 'import-economy-result', generation, documentHash: selected.hash, requestDigest: plan.requestDigest, outcome: result.data })
    } catch (caught) {
      if (!controller.signal.aborted) {
        const code = caught instanceof Error ? caught.message : 'transport-failure'
        if (code === 'economy-route-unavailable') {
          setAttempted(false); setPlan(null); setCostApproved(false); setTransferApproved(false)
        }
        setError(reason(code))
      }
    } finally { if (!controller.signal.aborted) setBusy(null) }
  }
  if (outcome.economy.analysis && outcome.economy.analysis.provenance !== 'local-only') return <p role="status">KI-økonomianalyse er gjennomført eller gjenopprettet for dette dokumentet. Kontroller alle tolkninger mot originalen.</p>
  return <section className="economy-ai-control" aria-label="KI-analyse av dokumentets økonomi">
    <h3>Analyser opplysninger som krever tolkning</h3>
    <p>KI-analyse kreves for relevante opplysninger som det lokale uttrekket ikke forstår. Manglende beløp betyr foreløpig at beløpet ikke er hentet, og beviser ikke at dokumentet mangler opplysningen.</p>
    <p>Forberedelsen skjer lokalt. Deretter kan du godkjenne kostnad og overføring av de viste tekstutdragene til OpenAI. Hele PDF-en overføres ikke. Teknisk rapportanalyse og bilder inngår ikke.</p>
    {!attempted && <button type="button" className="secondary-action" disabled={busy !== null} onClick={() => void prepare()}>Forbered KI-analyse</button>}
    {busy && <p role="status">{busy === 'prepare' ? 'Forbereder økonomiutdrag lokalt …' : 'Analyserer godkjente økonomiutdrag …'}</p>}
    {error && <p role="alert">{error}</p>}
    {plan && <div className="economy-ai-plan">
      <p><strong>{plan.documentName}</strong> · fysisk PDF-side {plan.selectedPages.join(', ') || 'ingen'}</p>
      <p>Maksimal reservasjon for dette kallet: USD {plan.reservedUsd}. Samlet analyseramme for dokumentet: USD {plan.analysisCapUsd}. Kostnaden bygger på et konservativt lokalt budsjett, ikke presis tokentelling. Ingen automatisk gjentakelse.</p>
      {Boolean(plan.omittedRelevantPages?.length) && <p>Relevante sider som ikke sendes: {plan.omittedRelevantPages!.join(', ')}. Analysen er begrenset til de viste utdragene.</p>}
      <details><summary>Se tekstutdrag som overføres ({plan.excerpts.length} sider)</summary>{plan.excerpts.map(excerpt => <article key={excerpt.pdfPage}>
        <h4>Fysisk PDF-side {excerpt.pdfPage}</h4><button type="button" className="quiet-button" onClick={() => onSource(excerpt.pdfPage)}>Åpne originalside ↗</button><pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{excerpt.text}</pre>
      </article>)}</details>
      {plan.blockers.length > 0 && <div role="status"><p>KI-analyse kan ikke starte:</p><ul>{plan.blockers.map(code => <li key={code}>{reason(code)}</li>)}</ul></div>}
      <label><input type="checkbox" checked={transferApproved} disabled={busy !== null || attempted || !plan.readyForApproval} onChange={event => setTransferApproved(event.target.checked)} /> Jeg godkjenner overføring av de viste dokumentutdragene til OpenAI.</label>
      <label><input type="checkbox" checked={costApproved} disabled={busy !== null || attempted || !plan.readyForApproval} onChange={event => setCostApproved(event.target.checked)} /> Jeg godkjenner kostnaden, inntil USD {plan.reservedUsd} innen samlet ramme USD {plan.analysisCapUsd}.</label>
      <button type="button" className="primary-action" disabled={!plan.readyForApproval || plan.blockers.length > 0 || !costApproved || !transferApproved || busy !== null || attempted} onClick={() => void run()}>Start godkjent KI-analyse</button>
    </div>}
  </section>
}
