import { analysisModeLabel } from '../contracts/analysis-http.ts'
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { ListingClient } from './analysis/listing-client.ts'
import { ImportClient } from './analysis/import-client.ts'
import { ReportClient } from './analysis/report-client.ts'
import { createInitialSession, isFinancialConfirmed, sessionReducer } from './state/session.ts'
import type { SessionAction } from './state/session.ts'
import { ControlWorkspace } from './ControlWorkspace.tsx'
import { InvestmentOverview } from './investment/InvestmentOverview.tsx'
import type { ScenarioControls } from '../domain/financial-scenario.ts'
import './investment/concept-a.css'

export default function App({ mode = 'demo' }: { mode?: 'demo' | 'live' }) {
  const [session, dispatch] = useReducer(sessionReducer, mode, createInitialSession)
  const [controlsOpen, setControlsOpen] = useState(false)
  const [importClient] = useState(() => new ImportClient(dispatch))
  const [listingClient] = useState(() => new ListingClient(dispatch))
  useEffect(() => { listingClient.abort() }, [session.listing.generation, listingClient])
  useEffect(() => () => listingClient.abort(), [listingClient])
  const [client] = useState(() => new ReportClient(dispatch))
  const slot = session.prospectus.prospectus
  const objectKey = slot.status === 'imported' ? slot.selected?.hash ?? `listing:${session.listing.generation}` : slot.status !== 'idle' ? `pending:${session.prospectus.generation}` : `listing:${session.listing.generation}`
  const [scenarioDraft, setScenarioDraft] = useState<{ key: string; controls: ScenarioControls } | null>(null)
  const controls = scenarioDraft?.key === objectKey ? scenarioDraft.controls : slot.status !== 'idle' ? slot.status === 'imported' ? session.prospectus.financing : { equity: '', annualInterest: '', months: '' } : session.listing.financing
  const overview = useRef<HTMLButtonElement>(null)
  useEffect(() => () => { importClient.abort(); client.abort() }, [importClient, client])
  useEffect(() => {
    if (session.prospectus.prospectus.status === 'idle' && session.prospectus.report.status === 'idle') importClient.abort()
  }, [session.prospectus.generation, session.prospectus.prospectus.status, session.prospectus.report.status, importClient])
  useEffect(() => {
    if (session.report.status !== 'analysing') client.abort()
  }, [session.report.generation, session.report.status, client])
  const controlDispatch = useCallback((action: SessionAction) => {
    if (action.type === 'navigate') setControlsOpen(true)
    dispatch(action)
  }, [])
  const open = (section: 'basis' | 'report' | 'result' = 'basis') => {
    const step = section === 'result' && session.resultSnapshot ? 'resultat'
      : section === 'report' && isFinancialConfirmed(session) ? 'tilstandsrapport' : 'tallgrunnlag'
    dispatch({ type: 'navigate', step })
    setControlsOpen(true)
    window.scrollTo(0, 0)
  }
  return <div className="investment-shell">
    {controlsOpen ? <>
      <div className="control-heading app-header"><button type="button" className="quiet-button" onClick={() => { setControlsOpen(false); window.scrollTo(0, 0); requestAnimationFrame(() => overview.current?.focus()) }}>← Tilbake til investeringsoversikten</button><span className="meta">{session.prospectus.prospectus.outcome?.manifest || session.prospectus.report.outcome?.manifest ? 'Offline · lokalt dokumentuttrekk' : analysisModeLabel(session.report.mode)}</span></div>
      <ControlWorkspace session={session} dispatch={controlDispatch} importClient={importClient} client={client} listingClient={listingClient} />
    </> : <InvestmentOverview session={session} dispatch={dispatch} importClient={importClient} listingClient={listingClient} onOpen={open} overviewRef={overview} controls={controls} onControls={controls => setScenarioDraft({ key: objectKey, controls })} />}
  </div>
}
