import type { DocumentImport, ImportControlGate, ImportControlOutcome } from '../contracts/document-import.ts'
import type { ListingCorrection } from '../contracts/listing.ts'
import type { SourceEconomyDraft } from './source-economy.ts'

export function importEconomyDraft(outcome: DocumentImport, corrections: Record<string, ListingCorrection> = {}, completeOperatingCosts = false): SourceEconomyDraft {
  const relevance = documentTaxRelevance(outcome, corrections)
  return { ...(relevance.required && !relevance.reviewed ? { oneOffReviewIssue: 'Kontroller dokumentavgiftens relevans og kilde ved ukjent eierform eller borettslag før kontantbehov og finansiering brukes.' } : {}), original: { fields: outcome.economy.fields.map(field => ({ ...field, source: field.sources[0] ?? null,
    status: field.nature === 'fact' ? field.status : 'unavailable' })) }, corrections, completeOperatingCosts }
}

export function documentTaxRelevance(outcome: DocumentImport, corrections: Record<string, ListingCorrection> = {}) {
  const tax = outcome.economy.fields.find(field => field.id === 'documentTax')
  const required = outcome.economy.ownership !== 'eierseksjon' && tax?.amount != null
  const control = corrections.documentTax
  return { required, reviewed: Boolean(control?.reviewed && control.note.trim()) }
}
export function hasInternalIdentityConflict(document: DocumentImport) {
  return ['address', 'municipality', 'farm', 'holding', 'section', 'share'].some(kind =>
    new Set(document.propertyIdentity.filter(item => item.kind === kind).map(item => item.value)).size > 1)
}
export function propertyIdentityStatus(prospectus: DocumentImport, report?: DocumentImport | null): 'match' | 'unknown' | 'conflict' {
  if (hasInternalIdentityConflict(prospectus) || (report && hasInternalIdentityConflict(report))) return 'conflict'
  return report ? comparePropertyIdentity(prospectus, report) : 'unknown'
}

/** Bare eksakt kjent identitet kan være samsvar. Fravær eller delvis identitet er ukjent. */
export function comparePropertyIdentity(prospectus: DocumentImport, report: DocumentImport): 'match' | 'unknown' | 'conflict' {
  let compared = 0
  for (const kind of ['address', 'municipality', 'farm', 'holding', 'section', 'share'] as const) {
    const a = [...new Set(prospectus.propertyIdentity.filter(item => item.kind === kind).map(item => item.value))]
    const b = [...new Set(report.propertyIdentity.filter(item => item.kind === kind).map(item => item.value))]
    if (a.length > 1 || b.length > 1) return 'conflict'
    if (!a.length || !b.length) continue
    if (a[0] !== b[0]) return 'conflict'
    compared++
  }
  const fullAddress = prospectus.propertyIdentity.some(item => item.kind === 'address') && report.propertyIdentity.some(item => item.kind === 'address')
  return compared && fullAddress ? 'match' : 'unknown'
}
export function importControlOutcome(outcome: DocumentImport): ImportControlOutcome {
  return { contractVersion: outcome.contractVersion, extractionVersion: outcome.extractionVersion, requestId: outcome.requestId,
    reportHash: outcome.reportHash, documentName: outcome.documentName, mode: outcome.mode, pageCount: outcome.pageCount,
    status: 'completed', validationScope: 'structure-and-source', findings: outcome.technical.findings, uncertainCandidates: [], limitations: outcome.technical.limitations }
}
export function importGate(outcome: DocumentImport, revision: number, identityChecked: boolean, areaChecked: boolean, identityConflict: boolean): ImportControlGate {
  return { hash: outcome.reportHash, requestId: outcome.requestId, revision,
    coverageComplete: outcome.coverage.technical.status === 'complete' && outcome.technical.status === 'complete', identityChecked, areaChecked, identityConflict }
}
