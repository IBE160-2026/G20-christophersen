import { FindingCorrectionSchema, LimitationReviewSchema } from '../contracts/finding-control.ts'
import type { FindingDraft, FindingErrors, FindingListBasis, FindingListAssessment } from '../contracts/finding-control.ts'
import type { DocumentImport } from '../contracts/document-import.ts'
import type { AnalysisContext } from '../contracts/document-analysis.ts'
import { sameTg3Basis, validateTg3Resolution } from './tg3-resolution.ts'

/** Kontrollerer struktur og fysisk kildeområde, aldri rapportens semantikk. */
export function validateFindingCorrection(draft: FindingDraft, context: Pick<AnalysisContext, 'documentName' | 'reportHash' | 'pageCount'>, documentImport?: DocumentImport | null) {
  const errors: FindingErrors = {}
  if (draft.grade !== 'TG2' && draft.grade !== 'TG3') errors.grade = 'Velg eksplisitt TG2 eller TG3 fra originalrapporten.'
  if (!draft.description.trim()) errors.description = 'Skriv beskrivelsen fra originalrapporten.'
  const page = /^[1-9]\d*$/.test(draft.pdfPage) ? Number(draft.pdfPage) : NaN
  if (!Number.isSafeInteger(page) || context.pageCount === null || page > context.pageCount) {
    errors.pdfPage = `Oppgi fysisk PDF-side fra 1 til ${context.pageCount ?? 'kjent sideantall'}. Ingen side gjettes.`
  }
  if (documentImport && (!documentImport.sections.some(section => page >= section.startPage && page <= section.endPage)
    || documentImport.pages[page - 1]?.status !== 'readable' || documentImport.pages[page - 1]?.rasterUnprocessed)) errors.source = 'Kilden må være en lesbar fysisk side inne i det komplette rapportområdet.'
  const parsed = FindingCorrectionSchema.safeParse({ grade: draft.grade, description: draft.description.trim(),
    source: { documentName: context.documentName, reportHash: context.reportHash, pdfPage: page } })
  if (!parsed.success && Object.keys(errors).length === 0) errors.source = 'Kontrollerbar kilde i valgt originalrapport mangler.'
  return { correction: Object.keys(errors).length === 0 && parsed.success ? parsed.data : null, errors }
}

/** Fullført analyse, enkeltkontroll, listebekreftelse og TG3 er separate forhold. */
export function assessFindingList(basis: FindingListBasis): FindingListAssessment {
  const { outcome } = basis
  const extraction = outcome?.status === 'completed' ? outcome : outcome?.partialResult
  const reportDeficiencies: FindingListAssessment['reportDeficiencies'] = []
  const gate = basis.documentImportGate
  const importReady = outcome?.contractVersion !== 'document-import-1' || Boolean(gate && gate.hash === outcome.reportHash && gate.requestId === outcome.requestId
    && gate.coverageComplete && gate.identityChecked && gate.areaChecked && !gate.identityConflict)
  if (!importReady) reportDeficiencies.push({ code: 'incomplete-report', reason: 'Rapportdekning, eiendomsidentitet og fullstendig fysisk område må være avklart. Ulest eller motstridende grunnlag kan ikke overstyres.' })
  const completed = importReady && basis.status === 'completed' && outcome?.status === 'completed'
    && basis.reportIdentity?.reportHash === outcome.reportHash && basis.reportIdentity.documentName === outcome.documentName
  if (basis.status === 'missing' || basis.error === 'missing-report') {
    reportDeficiencies.push({ code: 'missing-report', reason: 'Velg én tekstbasert PDF på høyst 30 sider.' })
  } else if (!completed) {
    reportDeficiencies.push({ code: 'incomplete-report', reason: basis.error ? `Dokument-/analysefeil (${basis.error}).` : 'Rapportanalysen er ikke fullført for gjeldende rapport.' })
  }
  if (outcome?.status === 'failed') {
    const target = outcome.error.target
    if (outcome.error.reason) reportDeficiencies.push({ code: 'incomplete-report', reason: outcome.error.reason })
    if (target?.kind === 'page') reportDeficiencies.push({ code: 'incomplete-report', reason: `Berørt PDF-side: ${target.pdfPage}.` })
    if (target?.kind === 'finding') reportDeficiencies.push({ code: 'incomplete-report', reason: `Berørt funn: ${target.findingId}.` })
  }
  const pendingFindingIds: string[] = []
  let missingTg3Basis = false
  if (extraction) {
    for (const candidate of [...extraction.findings, ...extraction.uncertainCandidates]) {
      const control = completed ? basis.controls.find(item => item.findingId === candidate.findingId) : undefined
      if (control?.rejection) continue
      // Den separate TG3-projeksjonen kan ikke skjule et kjent aktivt forhold.
      // Ved delresultat gjelder originalfunnet; brukerkontroll krever completed.
      const current = control?.correction ?? (candidate.kind === 'checkable' ? candidate : null)
      if (current?.grade === 'TG3' && !basis.tg3Findings.some(item => item.findingId === candidate.findingId && sameTg3Basis(item.current, current))) {
        missingTg3Basis = true
        reportDeficiencies.push({ code: 'unresolved-tg3',
          reason: `${candidate.findingId}: ${current.description} (${current.source.documentName}, PDF-side ${current.source.pdfPage}). Separat TG3-grunnlag mangler eller gjelder et annet rapportforhold. Registrer gjeldende status og avklaringsgrunnlag for dette forholdet.` })
      }
      if ((!control?.correction && candidate.kind === 'uncertain') || control?.confirmedRevision !== (control?.revision ?? 0)) pendingFindingIds.push(candidate.findingId)
      if (candidate.kind === 'uncertain' && !control?.correction) {
        for (const issue of candidate.issues) reportDeficiencies.push({ code: 'incomplete-report', reason: `${candidate.findingId}: ${issue.reason}` })
        for (const text of candidate.original.uncertainties) reportDeficiencies.push({ code: 'incomplete-report', reason: `${candidate.findingId}: ${text}` })
      }
    }
    for (const [index, limitation] of extraction.limitations.entries()) {
      if (!applicableLimitationReview(basis, index)) reportDeficiencies.push({ code: 'incomplete-report', reason: limitation })
    }
  }
  const canConfirm = Boolean(completed && pendingFindingIds.length === 0)
  const confirmed = canConfirm && basis.listConfirmationRevision === basis.listRevision
  if (completed && !confirmed) reportDeficiencies.push({ code: 'incomplete-report', reason: 'Funnlisten er ennå ikke kontrollert og bekreftet av deg.' })
  const tg3Handled = !missingTg3Basis && basis.tg3Findings.every(({ current, resolution }) => validateTg3Resolution(current, resolution).applicable
    || (resolution?.status === 'unresolved' && sameTg3Basis(resolution.binding, current)))
  return { canConfirm, confirmed, pendingFindingIds, tg3Handled, controlCompleted: confirmed && tg3Handled, reportDeficiencies }
}

/** Beviser binding og eksplisitt brukerhandling, aldri fritekstens semantikk.
 * Påvirker bare én generell limitation; øvrige mangler vurderes uavhengig. */
export function applicableLimitationReview(basis: FindingListBasis, index: number) {
  const outcome = basis.outcome
  if (basis.status !== 'completed' || basis.error || outcome?.status !== 'completed'
    || basis.reportIdentity?.reportHash !== outcome.reportHash || basis.reportIdentity.documentName !== outcome.documentName) return null
  for (const value of basis.limitationReviews ?? []) {
    const parsed = LimitationReviewSchema.safeParse(value)
    if (!parsed.success) continue
    const review = parsed.data
    if (review.index === index && review.original === outcome.limitations[index]
      && review.reportHash === outcome.reportHash && review.documentName === outcome.documentName
      && review.requestId === outcome.requestId && review.listRevision === basis.listRevision
      && review.tg3Revision === (basis.tg3Revision ?? 0)) return review
  }
  return null
}
