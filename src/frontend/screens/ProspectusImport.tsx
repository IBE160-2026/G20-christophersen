import { useState } from 'react'
import type { Dispatch } from 'react'
import type { ListingCorrection } from '../../contracts/listing.ts'
import type { DocumentImport, PdfSource, ImportRole } from '../../contracts/document-import.ts'
import { importEconomyDraft, propertyIdentityStatus, documentTaxRelevance } from '../../domain/document-import.ts'
import { economyFinancingSuggestion, economySuggestions } from '../../domain/source-economy.ts'
import { FinancingControls } from '../components/FinancingControls.tsx'
import type { ImportClient } from '../analysis/import-client.ts'
import { PdfViewer } from '../pdf/PdfViewer.tsx'
import { technicalImport } from '../state/prospectus.ts'
import type { SessionAction, SessionState } from '../state/session.ts'

export function ProspectusImport({ session, dispatch, client, role }: { session: SessionState; dispatch: Dispatch<SessionAction>; client: ImportClient; role: ImportRole }) {
  const p = session.prospectus, slot = p[role], outcome = slot.outcome, selected = slot.selected
  const [view, setView] = useState<{ page: number; zoom: number } | null>(null)
  const draft = p.prospectus.outcome ? importEconomyDraft(p.prospectus.outcome, p.corrections, p.completeOperatingCosts) : null
  const suggested = draft ? economySuggestions(draft, { requireReview: false, sourceLabel: 'Dokument' }) : null
  const checked = draft ? economySuggestions(draft, { sourceLabel: 'Dokument' }) : null
  const taxRelevance = outcome ? documentTaxRelevance(outcome, p.corrections) : null
  const financing = draft ? economyFinancingSuggestion(draft, p.financing, session.listing.manualFields.includes('P') ? session.financial.P.rawValue : undefined, 'Dokument') : null
  const errorMessages: Record<string, string> = {
    'missing-file': 'Velg en PDF for å starte importen.', 'payload-too-large': 'Filbudsjettet er overskredet. Velg mindre filer; salgsoppgave og separat rapport kan samlet være høyst 50 MiB.',
    'page-limit': 'PDF-en har mer enn 200 fysiske sider. Velg en fil innen støtteprofilen.', 'unsupported-synthetic': 'Denne originalen har ikke et lagret demosvar. Bruk en av de oppgitte syntetiske PDF-ene.',
    'analysis-active': 'En dokumentbehandling pågår. Vent til den er avsluttet før du velger filen på nytt.', 'duplicate-analysis': 'Dokumentet er allerede forsøkt i denne økten. Ingen ny analyse er startet. Behold kontrollgrunnlaget eller start en ny vurdering.',
    'invalid-format': 'PDF-en kunne ikke kontrolleres. Velg en intakt tekstbasert PDF.', 'text-limit': 'Dokumentets tekstgrunnlag er for stort for denne støtteprofilen. Velg en mindre tekstbasert PDF.',
    'response-limit': 'Uttrekkssvaret overskred ressursgrensen. Analysen er stoppet; velg et annet støttet dokument.', 'memory-limit': 'Dokumentbehandlingen overskred minnegrensen og er stoppet. Velg en enklere tekstbasert PDF.',
    'processing-timeout': 'Dokumentbehandlingen overskred tidsfristen og er stoppet. Velg et annet støttet dokument.', 'live-disabled': 'Live-import er stengt. Lokale eksplisitte uttrekk kan kontrolleres, men uløst tekst sperrer rapportbekreftelse.',
    'interrupted': 'Importen er avbrutt. Ingen fullføring er bekreftet.', 'transport-failure': 'Forbindelsen til den lokale serveren ble avbrutt. Kontroller at serveren kjører; grunnlaget er ufullført.',
    'incompatible-context': 'Det bevarte uttrekket har en annen analysekontekst. Start en ny vurdering med gjeldende versjon.',
  }
  const coverageLabels = { complete: 'Fullstendig', incomplete: 'Ufullstendig', missing: 'Mangler', ambiguous: 'Uklart', unreadable: 'Uleselig' }
  const statusLabels = { available: 'Oppgitt', missing: 'Mangler', unavailable: 'Utilgjengelig', conflict: 'Motstrid' }
  const natureLabels = { fact: 'Oppgitt fakta', 'stated-estimate': 'Oppgitt estimat', unknown: 'Ukjent opphav' }
  const periodLabels = { once: 'Engang', month: 'Måned', year: 'År', unknown: 'Ukjent periode' }
  const pageLabels = { readable: 'Lesbar tekst', blank: 'Bekreftet blank', unreadable: 'Uleselig', incomplete: 'Ufullstendig', unknown: 'Uavklart lesbarhet' }
  return <section className="listing-import" aria-labelledby={`import-title-${role}`}>
    <h2 id={`import-title-${role}`}>{role === 'prospectus' ? 'Last opp salgsoppgave' : 'Last opp separat tilstandsrapport'}</h2>
    <p>Lokal dokumentanalyse og syntetisk demo · PDF med tekstlag, høyst 200 fysiske sider. 50 MiB per fil og samlet for salgsoppgave og separat rapport. Ingen OCR. Live-import er stengt.</p>
    <label htmlFor={`import-file-${role}`}>{role === 'prospectus' ? 'Velg salgsoppgave (PDF)' : 'Velg separat rapport (PDF)'}</label>
    <input id={`import-file-${role}`} type="file" accept="application/pdf,.pdf" onChange={event => { setView(null); void client.select(event.currentTarget.files?.[0] ?? null, p, role) }} />
    <p role="status">{slot.status === 'loading' ? 'Leser dokument og forbereder økonomi og rapport …' : slot.status === 'selecting' ? 'Kontrollerer dokumentets hash …' : slot.status === 'imported' ? 'Dokumentuttrekk klart. Import er ubekreftet; kontroller mot originalen.' : slot.error ? errorMessages[slot.error] ?? 'Dokumentimporten kunne ikke fullføres. Velg en tekstbasert PDF og kontroller det nye grunnlaget.' : 'Import starter når du velger fil. Ingen finansverdier kreves først.'}</p>
    {slot.error && <details><summary>Teknisk feilkode</summary><p>{slot.error}</p></details>}
    {['loading', 'selecting'].includes(slot.status) && <button type="button" className="secondary-action" onClick={() => { client.abort(); dispatch({ type: 'import-abandon' }) }}>Avbryt dokumentimport</button>}
    {role === 'report' && selected && p.prospectus.outcome && <button type="button" className="secondary-action" onClick={() => { client.abort(); setView(null); dispatch({ type: 'import-restore-integrated' }) }}>Bruk integrert rapport igjen</button>}
    {selected && <details><summary>Dokumentidentitet: {selected.file.name}</summary><p>SHA-256 {selected.hash}</p></details>}
    {outcome && <>
      {outcome.cost && <section aria-label="Kostnad og semantisk rest">
        <h3>Kostnad og uløst grunnlag</h3>
        <p>Samlet analyseramme: USD 0,20. Salgsoppgave og separat rapport deler rammen.</p>
        <p>Forhåndsestimat: {outcome.cost.estimatedUsd === null ? 'Utilgjengelig' : `USD ${outcome.cost.estimatedUsd}`} · Reservert: USD {outcome.cost.reservedUsd} · Gjenstående: USD {outcome.cost.remainingUsd}.</p>
        <p>Inputtokens: {outcome.cost.inputTokens ?? 'Kan ikke verifiseres'} · Outputtak: {outcome.cost.outputTokens} tokens inklusive reasoning.</p>
        <p>{outcome.cost.status === 'completed' ? 'Lokal eller offline stubbet behandling fullført. Ingen betalt modellbruk.' : 'Semantisk behandling er sperret eller ufullført. Rapportbekreftelse krever komplett grunnlag.'}</p>
        {outcome.cost.reason && <p>{semanticStopReason(outcome.cost.reason)}</p>}
        {['test-only', 'offline-sdk-stub'].includes(outcome.cost.tokenizer) && <p>Token- og kostnadstallene bruker en testteller eller SDK-stub og er ikke verifisert for live.</p>}
        {outcome.cost.tokenizer === 'verified-server-input-tokens' ? <p>Inputtelling fra Responses API. Live-porten krever også verifisert pris, budsjett og godkjenning.</p>
          : <p>Ingen verifisert tokentelling for hele modellforespørselen. Live-porten er stengt.</p>}
        {outcome.manifest && <details><summary>Uløst grunnlag: {outcome.manifest.residual.length} poster</summary><ul>{outcome.manifest.residual.map((item, index) => <li key={index}>Fysisk PDF-side {item.pdfPage}: {coverageReason(item.reason)}</li>)}</ul></details>}
      </section>}
      <p>Økonomidekning: {coverageLabels[outcome.coverage.economy.status]} · Rapportdekning: {coverageLabels[outcome.coverage.technical.status]}</p>
      {uniqueCoverageReasons([...outcome.coverage.economy.reasons, ...outcome.coverage.technical.reasons]).map(reason => <p key={reason}>{reason}</p>)}
      <p>Ikke valgt i kombinert uttrekksgrunnlag: {pageRanges(outcome.coverage.economy.omittedPages) || 'Ingen'}.</p>
      <p>Uleste fysiske sider: {pageRanges(outcome.pages.filter(page => !['readable', 'blank'].includes(page.status) || page.rasterUnprocessed).map(page => page.pdfPage)) || 'Ingen'}.</p>
      <details><summary>Lesbarhet for alle {outcome.pageCount} fysiske sider</summary><ol>{outcome.pages.map(page => <li key={page.pdfPage}>PDF-side {page.pdfPage}: {pageLabels[page.status]}{page.rasterUnprocessed ? "; rasterinnhold er ikke lest" : ''}{page.reason ? ` — ${page.reason}` : ''}</li>)}</ol></details>
      {outcome.attachments.map(item => <p key={item.id}>Ubehandlet vedlegg: {item.name}. Last opp den faktiske {item.isPdf ? 'PDF-rapporten' : 'tekstbaserte PDF-versjonen'} separat. Vedlegget er ikke lest.</p>)}
      {role === 'prospectus' && <>
        <h3>Dokumentets økonomigrunnlag — ubekreftet</h3>
        <p>Eierform: {outcome.economy.ownership === 'unknown' ? 'Ukjent' : outcome.economy.ownership === 'eierseksjon' ? 'Eierseksjon' : 'Borettslag'}. Ingen avgift beregnes automatisk. Prisantydningen er dokumentets prisgrunnlag.</p>
        <EvidenceList label="eierform" sources={outcome.economy.ownershipSources} onView={source => { if (source.documentHash === selected?.hash) setView({ page: source.pdfPage, zoom: 1 }) }} />
        {taxRelevance?.required && <p>Dokumentavgift er oppgitt ved ukjent eierform eller borettslag. Kontroller relevans og oppgi kilde/begrunnelse i dokumentavgiftsfeltet før kontantbehov og finansiering brukes. Oppgitt beløp beholdes; ingen avgift beregnes eller settes til null.</p>}
        {outcome.economy.fields.map(field => {
          const correction: ListingCorrection = p.corrections[field.id] ?? { rawAmount: field.amount ?? '', period: field.period, year: field.year ?? '', includedIn: field.includedIn, rawDebtPart: field.debtPart ?? '', note: '', reviewed: false }
          const update = (changes: Partial<ListingCorrection>) => dispatch({ type: 'import-correction', id: field.id, correction: { ...correction, ...changes, reviewed: false } })
          return <details key={field.id} className="listing-field"><summary>{field.label}: {field.amount ?? 'Ukjent'} NOK · {statusLabels[field.status]} · {natureLabels[field.nature]} · {periodLabels[field.period]} · {field.year ?? 'år ukjent'}</summary>
            {field.sources.map((source, index) => <p key={index}><q>{source.quote}</q> · {source.documentName}, fysisk PDF-side {source.pdfPage}{source.printedPage ? `, trykt side ${source.printedPage}` : ''} <button className="secondary-action" type="button" onClick={() => setView({ page: source.pdfPage, zoom: 1 })}>Vis originalkilde for {field.label}{index ? ` (${index + 1})` : ''}</button></p>)}
            {field.alternatives.map((alternative, index) => <p key={index}>Motstrid {alternative.amount} NOK: <q>{alternative.source.quote}</q> · fysisk PDF-side {alternative.source.pdfPage}<button type="button" onClick={() => setView({ page: alternative.source.pdfPage, zoom: 1 })}>Vis motstrid</button></p>)}
            <label htmlFor={`import-amount-${field.id}`}>Kontrollert beløp: {field.label}</label><input id={`import-amount-${field.id}`} inputMode="decimal" value={correction.rawAmount} onChange={event => update({ rawAmount: event.target.value })} />
            <label htmlFor={`import-note-${field.id}`}>{field.id === 'documentTax' && taxRelevance?.required ? 'Relevans og kilde for dokumentavgift' : 'Begrunnelse og kilde ved retting'}</label><input id={`import-note-${field.id}`} value={correction.note} onChange={event => update({ note: event.target.value })} />
            {['one-off', 'recurring'].includes(field.category) && <><label htmlFor={`import-included-${field.id}`}>Inkludering for {field.label}</label><select id={`import-included-${field.id}`} value={correction.includedIn ?? '__unknown'} onChange={event => update({ includedIn: event.target.value === '__unknown' ? null : event.target.value })}><option value="__unknown">Ukjent</option><option value="">Separat post</option>{outcome.economy.fields.filter(parent => parent.category === field.category && parent.id !== field.id).map(parent => <option key={parent.id} value={parent.id}>Inkludert i {parent.label}</option>)}</select></>}
            {field.category === 'recurring' && <>
              <label htmlFor={`import-debt-${field.id}`}>Gjeldsdel i {field.label} (NOK, også 0)</label><input id={`import-debt-${field.id}`} inputMode="decimal" value={correction.rawDebtPart} onChange={event => update({ rawDebtPart: event.target.value })} />
              <label htmlFor={`import-period-${field.id}`}>Periode for {field.label}</label><select id={`import-period-${field.id}`} value={correction.period} onChange={event => update({ period: event.target.value as ListingCorrection['period'] })}><option value="unknown">Ukjent</option><option value="month">Måned</option><option value="year">År</option><option value="once">Engang</option></select>
              <label htmlFor={`import-year-${field.id}`}>År for {field.label}</label><input id={`import-year-${field.id}`} value={correction.year} onChange={event => update({ year: event.target.value })} />
            </>}
            <label><input type="checkbox" checked={correction.reviewed} onChange={event => dispatch({ type: 'import-correction', id: field.id, correction: { ...correction, reviewed: event.target.checked } })} />Jeg har kontrollert {field.label}, kilde, periode/år, inkludering og gjeldsdel.</label>
          </details>
        })}
        <p>Forslag til totalpris: {suggested?.P ?? 'Ukjent'} NOK · Kontantbehov: {suggested?.cashRequired ?? 'Ukjent'} NOK.</p>
        <p>Kjent driftssubtotal: {suggested?.knownOperatingSubtotal ?? 'Ukjent'} NOK/år. Dette er dokumenterte delposter. Fullstendig årlig drift: {checked?.D ?? 'Ukjent'}. Fellesgjeldsbetaling: {suggested?.sharedAnnualPayment ?? 'Ukjent'} NOK/år.</p>
        <label><input type="checkbox" checked={p.completeOperatingCosts} onChange={event => dispatch({ type: 'import-complete-costs', complete: event.target.checked })} />Jeg har kontrollert at alle eierbetalte driftskostnader er med og avklart inkludering og gjeldsdeler.</label>
        <h3>Finansieringsforutsetninger</h3>
        <FinancingControls prefix="import" financing={p.financing} cashRequired={checked?.cashRequired ?? null} loan={financing?.loan ?? null} onChange={(field, value) => dispatch({ type: 'import-financing', field, value })} />
        <p>Eget lån: {financing?.loan ?? 'Ukjent'} NOK · Månedlig: {financing?.monthly ?? 'Ukjent'} NOK · Årlig: {financing?.annual ?? 'Ukjent'} NOK · Samlet årlig gjeldsbetaling: {financing?.J ?? 'Ukjent'} NOK/år.</p>
        {checked?.issues.map(issue => <p key={issue}>{issue}</p>)}
        {[financing?.error, financing?.priceIssue, financing?.yearIssue].filter(Boolean).map(issue => <p key={issue}>{issue}</p>)}
        <p>Leieinntekt og avkastningskrav oppgis av deg. Årlig drift krever komplett kontrollert innhold. Import og finansiering bekrefter ingen tall. Manuelle rettinger i tallfeltene beholdes.</p>
        <button type="button" className="primary-action" disabled={slot.status !== 'imported'} onClick={() => dispatch({ type: 'import-apply' })}>Bruk kontrollert dokumentgrunnlag og finansiering</button>
      </>}
      {selected && <button type="button" className="secondary-action" onClick={() => setView({ page: 1, zoom: 1 })}>Åpne originaldokument</button>}
    </>}
    {view && selected && <><button type="button" className="secondary-action" onClick={() => setView(null)}>Lukk originalvisning</button><PdfViewer selected={selected} pageNumber={view.page} zoom={view.zoom} sourceIssue={null} onPage={page => setView({ ...view, page })} onZoom={zoom => setView({ ...view, zoom })} /></>}
  </section>
}
export function ImportCoverageControl({ session, dispatch }: { session: SessionState; dispatch: Dispatch<SessionAction> }) {
  const p = session.prospectus, outcome = technicalImport(p)
  const [view, setView] = useState<{ hash: string; page: number; zoom: number } | null>(null)
  const originals = [p.prospectus.selected, p.report.selected].filter(item => item !== null)
  const selected = originals.find(item => item.hash === view?.hash) ?? null
  const showSource = (source: PdfSource) => { if (originals.some(item => item.hash === source.documentHash)) setView({ hash: source.documentHash, page: source.pdfPage, zoom: 1 }) }
  if (!outcome) return <p>Rapportgrunnlaget er ikke importert. Last opp en komplett tekstbasert rapport.</p>
  const coverageLabels = { complete: 'Fullstendig', incomplete: 'Ufullstendig', missing: 'Mangler', ambiguous: 'Uklart', unreadable: 'Uleselig' }
  const identity = p.prospectus.outcome ? propertyIdentityStatus(p.prospectus.outcome, p.report.outcome) : 'unknown'
  return <section aria-labelledby="coverage-title"><h3 id="coverage-title">Kontroller rapportens tilhørighet og område</h3>
    <p>Rapportdekning: {coverageLabels[outcome.coverage.technical.status]}. Eiendomsidentitet: {identity === 'unknown' ? 'Ukjent — krever kontroll' : identity === 'conflict' ? 'Motstrid' : 'Samsvar foreslått'}. Ingen identitet gjettes fra filnavn eller dato.</p>
    {outcome.sections.map((section, index) => <p key={index}>Foreslått rapportområde: {outcome.documentName}, fysiske PDF-sider {section.startPage}–{section.endPage} ({section.certainty === 'certain' ? 'entydig forslag' : 'uklart'}).</p>)}
    {p.prospectus.outcome && <IdentityEvidence outcome={p.prospectus.outcome} onView={showSource} />}
    {p.report.outcome && <IdentityEvidence outcome={p.report.outcome} onView={showSource} />}
    {outcome.sections.map((section, index) => <EvidenceList key={index} label={`rapportgrense ${index + 1}`} sources={section.basis} onView={showSource} />)}
    {view && selected && <><button type="button" onClick={() => setView(null)}>Lukk kontrollkilde</button><PdfViewer selected={selected} pageNumber={view.page} zoom={view.zoom} sourceIssue={null} onPage={page => setView({ ...view, page })} onZoom={zoom => setView({ ...view, zoom })} /></>}
    {uniqueCoverageReasons(outcome.coverage.technical.reasons).map(reason => <p key={reason}>{reason}</p>)}
    {identity === 'conflict' && <p className="field-issue">Kjent eiendomsmotstrid. Denne rapporten kan ikke brukes. Last opp rapporten som tilhører salgsoppgaven.</p>}
    <p>Kontroller tilhørighet mot salgsoppgaven og rapportoriginalen. Uklar grense, flere rapporter, manglende sider eller ulest rapportinnhold krever en komplett separat rapport.</p>
    <label><input id="import-identity-check" type="checkbox" disabled={identity === 'conflict'} checked={p.identityChecked} onChange={event => dispatch({ type: 'import-identity', checked: event.target.checked })} />Jeg har kontrollert at rapporten tilhører objektet mot begge originalene (eller rapport og salgsoppgave i samme fil).</label>
    <label><input id="import-area-check" type="checkbox" checked={p.areaChecked} disabled={outcome.coverage.technical.status !== 'complete'} onChange={event => dispatch({ type: 'import-area', checked: event.target.checked })} />Jeg har kontrollert hele det fysiske rapportområdet, inkludert start/slutt, fullstendighet og mulige TG-opplysninger utenfor området.</label>
  </section>
}

function pageRanges(pages: number[]) {
  const sorted = [...new Set(pages)].sort((a, b) => a - b), groups: string[] = []
  for (let index = 0; index < sorted.length; index++) {
    const start = sorted[index]!
    let end = start
    while (sorted[index + 1] === end + 1) end = sorted[++index]!
    groups.push(start === end ? String(start) : `${start}–${end}`)
  }
  return groups.join(', ')
}

function semanticStopReason(code: string) {
  if (code.includes('local-tokenizer-unavailable') || code.includes('server-token-count-required')) return 'Verifisert tokentelling mangler for den endelige modellforespørselen. Ingen generering er startet.'
  const messages: Record<string, string> = {
    'analysis-budget-exceeded': 'Hele det nødvendige grunnlaget får ikke plass innen gjenværende analyseramme på USD 0,20. Analysen er stoppet; ingen tekst eller funn er utelatt for å redusere prisen.',
    'input-token-limit': 'Det nødvendige tekstgrunnlaget overskrider grensen på 40 000 inputtokens. Analysen er stoppet uten avkorting.',
    'output-token-limit': 'Svarbudsjettet er utenfor den tillatte grensen. Ingen modellforespørsel er startet.',
    'unknown-price': 'Et verifisert prisgrunnlag mangler. Ingen modellforespørsel er startet.',
    'token-count-price-unverified': 'Prisen for ekstern tokentelling er ikke verifisert. Ingen telleforespørsel eller generering er startet.',
    'budget-history-unavailable': 'Tidligere forbruk og reservasjoner kan ikke verifiseres. Ingen ny modellforespørsel er startet.',
    'document-already-attempted': 'Dokumentet er allerede forsøkt i denne analysen. Ingen ny modellforespørsel er startet.',
  }
  return messages[code] ?? 'Semantisk behandling kunne ikke fullføres og valideres. Grunnlaget er ufullstendig; ingen automatisk ny forespørsel er startet.'
}
function coverageReason(reason: string) {
  if (reason.startsWith('Uløst tekstblokk:')) return 'Tekst krever semantisk tolkning før rapporten kan bekreftes.'
  if (reason.startsWith('Uavklart TG-kandidat:')) return 'En TG2/TG3-kandidat må avklares mot originalen.'
  if (reason.startsWith('Semantisk behandling sperret: ')) return semanticStopReason(reason.slice('Semantisk behandling sperret: '.length))
  return reason
}
function uniqueCoverageReasons(reasons: string[]) { return [...new Set(reasons.map(coverageReason))] }

function EvidenceList({ label, sources, onView }: { label: string; sources: PdfSource[]; onView: (source: PdfSource) => void }) {
  return <div>{sources.map((source, index) => <p key={index}><q>{source.quote}</q> · {source.documentName}, fysisk PDF-side {source.pdfPage} <button type="button" className="secondary-action" onClick={() => onView(source)}>Vis kilde for {label} ({index + 1})</button></p>)}</div>
}
function IdentityEvidence({ outcome, onView }: { outcome: DocumentImport; onView: (source: PdfSource) => void }) {
  return <div><p>Bevart identitetsgrunnlag: {outcome.documentName}</p>
    {outcome.propertyIdentity.length === 0 && <p>Ingen eksplisitte identitetskandidater er oppgitt.</p>}
    {outcome.propertyIdentity.map((candidate, index) => <div key={index}><p>{candidate.value}</p><EvidenceList label={`eiendomsidentitet ${index + 1}`} sources={[candidate.source]} onView={onView} /></div>)}
    <EvidenceList label="eierform" sources={outcome.economy.ownershipSources} onView={onView} />
  </div>
}
