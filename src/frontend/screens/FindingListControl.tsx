import type { Dispatch } from 'react'
import type { ReportAction, ReportState } from '../state/report.ts'
import { findingListAssessment } from '../state/report.ts'

export function FindingListControl({ report, dispatch }: { report: ReportState; dispatch: Dispatch<ReportAction> }) {
  const assessment = findingListAssessment(report)
  return <fieldset className="finding-list-control" data-control-completed={assessment.controlCompleted ? `${report.generation}:${report.listRevision}:${report.tg3Revision}` : undefined}>
    <legend>Bekreft gjeldende funnliste</legend>
    <p>Kontroller hele listen mot originalrapporten, inkludert brukte rettinger og avvisninger. Bekreft på hvert aktivt funn gjelder enkeltfunnet; knappen nedenfor bekrefter hele gjeldende liste.</p>
    <p>Listebekreftelsen avklarer ikke TG3. Du kan registrere Uavklart og fullføre kontrollen selv om Innhent mer informasjon fortsatt gjelder.</p>
    <p id="list-confirmation-status" role="status" aria-live="polite" aria-atomic="true">{assessment.controlCompleted
      ? 'Kontroll fullført — gjeldende funnliste er bekreftet og separat TG3-status er håndtert.'
      : assessment.confirmed ? 'Gjeldende funnliste er bekreftet. Registrer separat TG3-status for å fullføre kontrollen.'
        : 'Gjeldende funnliste er ikke bekreftet.'}</p>
    <p id="list-confirmation-reason">{assessment.confirmed ? 'Bekreftelsen gjelder denne rapporten og gjeldende listerevisjon.'
      : assessment.canConfirm ? 'Listen er klar for din separate bekreftelse.'
        : `Kontroller og bekreft hvert aktivt funn, eller avvis feilaktige uttrekk. Gjenstår: ${assessment.pendingFindingIds.length} funn.`}</p>
    <button type="button" className="primary-action" aria-disabled={!assessment.canConfirm || assessment.confirmed}
      aria-describedby="list-confirmation-reason" onClick={() => {
        if (report.selected) dispatch({ type: 'report-list-confirm', generation: report.generation, reportHash: report.selected.hash,
          documentName: report.selected.file.name.trim(), listRevision: report.listRevision })
      }}>Bekreft gjeldende liste</button>
    {report.findingControls.some(control => !control.rejection && control.draft) && <p>Ubrukt utkast inngår ikke i gjeldende liste. Bruk korrigering krever ny kontroll og listebekreftelse.</p>}
  </fieldset>
}
