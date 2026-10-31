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
const StatusSchema = z.object({ state: z.enum(['idle', 'running', 'completed', 'failed', 'unknown']),
  requestDigest: z.string().regex(/^[a-f0-9]{64}$/).nullable(), reservedUsd: z.string().nullable(),
  actualUsd: z.string().nullable(), usageCostBasis: z.enum(['provider-usage-upper-bound', 'provider-usage-exact']).nullable().optional(),
  error: z.string().nullable(), retryAllowed: z.boolean() })
type AnalysisStatus = z.infer<typeof StatusSchema>
const reason = (code: string) => ({
  'economy-previous-uncertain': 'Forrige AI-forsøk feilet eller ble avbrutt. OpenAI-belastningen er ukjent. Reservasjonen er beholdt, og nytt betalt kall er sperret.',
  'economy-status-unavailable': 'Status for tidligere AI-forsøk kunne ikke kontrolleres. Nytt betalt kall er sperret. Kontroller lokal server og kostnadsjournal.',
  'budget-history-unavailable': 'Kostnadsjournalen er utilgjengelig eller uavklart. Nytt betalt kall er sperret.',
  'economy-provider-timeout': 'AI-forsøket feilet: tidsfristen hos OpenAI ble overskredet. Belastningen er ukjent; reservasjonen er beholdt. Ingen nytt kall startes.',
  'economy-provider-connection': 'AI-forsøket feilet: forbindelsen til OpenAI ble brutt. Belastningen er ukjent; reservasjonen er beholdt. Ingen nytt kall startes.',
  'economy-provider-authentication': 'AI-forsøket feilet: OpenAI avviste autentiseringen. Kontroller nøkkel og tilgang lokalt. Reservasjonen beholdes; ingen automatisk gjentakelse.',
  'economy-provider-rejected': 'AI-forsøket feilet: OpenAI avviste forespørselen. Kontroller serverens sikre feilkategori. Ingen automatisk gjentakelse.',
  'economy-provider-rate-limit': 'AI-forsøket feilet: OpenAI avviste kallet på grunn av kvote eller kapasitet. Reservasjonen beholdes; ingen automatisk gjentakelse.',
  'economy-invalid-output': 'AI-forsøket feilet: svaret bestod ikke kilde- eller formatkontrollen. Lokale tall er beholdt. Nytt betalt kall er sperret.',
  'economy-analysis-failed': 'AI-forsøket feilet. Leverandørutfall og belastning er ukjent. Reservasjonen er beholdt, og nytt betalt kall er sperret.',
  'economy-client-timeout': 'AI-forsøket kunne ikke bekreftes innen tidsfristen. Backend eller OpenAI kan ha behandlet kallet. Reservasjonen beholdes; ikke start på nytt.',
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
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [remoteStatus, setRemoteStatus] = useState<AnalysisStatus | null>(null)
  const [statusRevision, setStatusRevision] = useState(0)
  const active = useRef<AbortController | null>(null)
  const inFlight = useRef(false)
  const submittedInBrowser = useRef(false)
  const historicalAttempt = useRef(false)
  const statusNeedsRecovery = useRef(false)
  const statusElement = useRef<HTMLDivElement | null>(null)
  const sessionId = useRef(crypto.randomUUID())
  const provenance = outcome.economy.analysis?.provenance
  useEffect(() => () => { active.current?.abort(); active.current = null }, [])
  useEffect(() => {
    if (provenance && provenance !== 'local-only') return
    const controller = new AbortController()
    const statusDeadline = Date.now() + 150_000
    let timer: ReturnType<typeof setTimeout> | undefined
    async function check() {
      try {
        if (Date.now() >= statusDeadline) throw new Error('economy-status-unavailable')
        const response = await fetch(`/api/document-economy/status/${selected.hash}`, {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]), cache: 'no-store' })
        const json = await readEconomyResponse(response)
        if (!response.ok) throw new Error('economy-status-unavailable')
        const status = StatusSchema.parse(json)
        if (controller.signal.aborted) return
        setRemoteStatus(status); setCheckingStatus(false)
        if (status.requestDigest || status.reservedUsd !== null) historicalAttempt.current = true
        if (status.state === 'idle' && status.retryAllowed && !submittedInBrowser.current && !historicalAttempt.current) {
          setAttempted(false)
          if (statusNeedsRecovery.current) { setError(null); statusNeedsRecovery.current = false }
        }
        if (status.state !== 'idle' || !status.retryAllowed) setAttempted(true)
        if (status.state === 'running' || status.state === 'completed') setError(null)
        if (status.state === 'failed' || status.state === 'unknown') {
          statusNeedsRecovery.current = status.state === 'unknown'
          setError(reason(status.error ?? 'economy-status-unavailable'))
        }
        if (status.state === 'running') timer = setTimeout(() => void check(), 1000)
      } catch (caught) {
        if (!controller.signal.aborted) {
          const code = caught instanceof Error && ['economy-route-unavailable', 'economy-response-not-json'].includes(caught.message)
            ? caught.message : 'economy-status-unavailable'
          statusNeedsRecovery.current = true
          setCheckingStatus(false); setAttempted(true); setError(reason(code))
          setRemoteStatus(previous => ({ state: 'unknown', requestDigest: previous?.requestDigest ?? null,
            reservedUsd: previous?.reservedUsd ?? null, actualUsd: previous?.actualUsd ?? null,
            usageCostBasis: previous?.usageCostBasis ?? null, error: code, retryAllowed: false }))
        }
      }
    }
    void check()
    return () => { controller.abort(); clearTimeout(timer) }
  }, [selected.hash, provenance, statusRevision])
  useEffect(() => {
    if (busy === 'run' || error || attempted || outcome.economy.analysis?.provenance === 'live-document') {
      statusElement.current?.focus({ preventScroll: true })
      statusElement.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [busy, error, attempted, remoteStatus?.state, outcome.economy.analysis?.provenance])
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
    if (!plan || !plan.requestDigest || !plan.readyForApproval || plan.blockers.length || !costApproved || !transferApproved || busy || attempted || checkingStatus || inFlight.current) return
    inFlight.current = true
    submittedInBrowser.current = true
    setBusy('run'); setAttempted(true); setError(null)
    const controller = new AbortController(); active.current = controller
    let timedOut = false
    const deadline = setTimeout(() => { timedOut = true; controller.abort() }, 135_000)
    try {
      const response = await fetch('/api/document-economy/run', { method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId: plan.planId, documentHash: plan.documentHash,
          requestDigest: plan.requestDigest, approveCost: true, approveTransfer: true }) })
      const json = await readEconomyResponse(response)
      if (!response.ok) {
        const code = typeof json?.error === 'string' ? json.error : 'invalid-response'
        if (['economy-api-key-unavailable', 'analysis-active', 'economy-plan-mismatch-or-expired', 'economy-explicit-consent-required'].includes(code)) {
          submittedInBrowser.current = false; setAttempted(false)
        }
        if (code === 'economy-plan-mismatch-or-expired') { setPlan(null); setCostApproved(false); setTransferApproved(false) }
        throw new Error(code)
      }
      const result = DocumentImportSchema.safeParse(json?.outcome)
      if (!result.success || result.data.reportHash !== selected.hash || result.data.economy.analysis?.requestDigest !== plan.requestDigest) throw new Error('invalid-response')
      if (!controller.signal.aborted) dispatch({ type: 'import-economy-result', generation, documentHash: selected.hash, requestDigest: plan.requestDigest, outcome: result.data })
    } catch (caught) {
      if (!controller.signal.aborted || timedOut) {
        const code = timedOut ? 'economy-client-timeout' : caught instanceof Error ? caught.message : 'transport-failure'
        if (code === 'economy-route-unavailable') {
          submittedInBrowser.current = false
          setAttempted(false); setPlan(null); setCostApproved(false); setTransferApproved(false)
        }
        setError(reason(code))
      }
    } finally {
      clearTimeout(deadline); inFlight.current = false
      if (!controller.signal.aborted || timedOut) { setBusy(null); setStatusRevision(revision => revision + 1) }
    }
  }
  if (outcome.economy.analysis && outcome.economy.analysis.provenance !== 'local-only') return <div ref={statusElement} tabIndex={-1}><p role="status">AI-analyse fullført. KI-økonomianalyse er gjennomført eller gjenopprettet for dette dokumentet. Kontroller alle tolkninger mot originalen.</p></div>
  return <section className="economy-ai-control" aria-label="KI-analyse av dokumentets økonomi">
    <h3>Analyser opplysninger som krever tolkning</h3>
    <p>KI-analyse kreves for relevante opplysninger som det lokale uttrekket ikke forstår. Manglende beløp betyr foreløpig at beløpet ikke er hentet, og beviser ikke at dokumentet mangler opplysningen.</p>
    <p>Forberedelsen skjer lokalt. Deretter kan du godkjenne kostnad og overføring av de viste tekstutdragene til OpenAI. Hele PDF-en overføres ikke. Teknisk rapportanalyse og bilder inngår ikke.</p>
    {!attempted && <button type="button" className="secondary-action" disabled={busy !== null || checkingStatus} onClick={() => void prepare()}>Forbered KI-analyse</button>}
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
    <div ref={statusElement} tabIndex={-1} className="economy-ai-status" aria-busy={busy === 'run' || remoteStatus?.state === 'running'}>
      {checkingStatus && <p role="status">Kontrollerer status for tidligere AI-forsøk lokalt …</p>}
      {busy === 'prepare' && <p role="status">Forbereder økonomiutdrag lokalt …</p>}
      {(busy === 'run' || remoteStatus?.state === 'running') && <p role="status" aria-live="polite">Analyserer godkjente økonomiutdrag … Venter på svar fra backend/OpenAI. Serverens tidsfrist er 120 sekunder. Ikke start på nytt; et nytt klikk sender ikke et nytt kall.</p>}
      {remoteStatus?.state === 'completed' && <p role="status">AI-kall fullført. Last dokumentet inn på nytt for å hente eventuelt lagret resultat. Nytt betalt kall er sperret.</p>}
      {error && <p role="alert">{error}</p>}
      {remoteStatus?.reservedUsd && <p>Beholdt reservasjon: USD {remoteStatus.reservedUsd}. {remoteStatus.actualUsd === null ? 'Faktisk kostnad er ukjent.'
        : remoteStatus.usageCostBasis === 'provider-usage-upper-bound' ? `Øvre kostnadsestimat fra leverandørens brukstall: USD ${remoteStatus.actualUsd}.`
        : remoteStatus.usageCostBasis === 'provider-usage-exact' ? `Beregnet kostnad fra leverandørens brukstall: USD ${remoteStatus.actualUsd}.`
        : `Registrert beløp: USD ${remoteStatus.actualUsd}. Kostnadsgrunnlaget er ukjent.`}</p>}
      {attempted && busy === null && remoteStatus?.state !== 'running' && <button type="button" className="secondary-action" disabled={checkingStatus}
        onClick={() => { setCheckingStatus(true); setStatusRevision(revision => revision + 1) }}>Kontroller status lokalt (gratis)</button>}
    </div>
  </section>
}
