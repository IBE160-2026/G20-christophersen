import { FindingCorrectionSchema } from '../contracts/finding-control.ts'
import type { FindingDraft, FindingErrors } from '../contracts/finding-control.ts'
import type { AnalysisContext } from '../contracts/document-analysis.ts'

/** Kontrollerer struktur og fysisk kildeområde, aldri rapportens semantikk. */
export function validateFindingCorrection(draft: FindingDraft, context: AnalysisContext) {
  const errors: FindingErrors = {}
  if (draft.grade !== 'TG2' && draft.grade !== 'TG3') errors.grade = 'Velg eksplisitt TG2 eller TG3 fra originalrapporten.'
  if (!draft.description.trim()) errors.description = 'Skriv beskrivelsen fra originalrapporten.'
  const page = /^[1-9]\d*$/.test(draft.pdfPage) ? Number(draft.pdfPage) : NaN
  if (!Number.isSafeInteger(page) || context.pageCount === null || page > context.pageCount) {
    errors.pdfPage = `Oppgi fysisk PDF-side fra 1 til ${context.pageCount ?? 'kjent sideantall'}. Ingen side gjettes.`
  }
  const parsed = FindingCorrectionSchema.safeParse({ grade: draft.grade, description: draft.description.trim(),
    source: { documentName: context.documentName, reportHash: context.reportHash, pdfPage: page } })
  if (!parsed.success && Object.keys(errors).length === 0) errors.source = 'Kontrollerbar kilde i valgt originalrapport mangler.'
  return { correction: Object.keys(errors).length === 0 && parsed.success ? parsed.data : null, errors }
}
