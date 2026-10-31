import type { DocumentImport } from '../../contracts/document-import.ts'
import type { RiskFinding } from '../../contracts/property-risk.ts'
import type { SessionState } from '../state/session.ts'
import { currentFinding } from '../state/report.ts'
import { validateTg3Resolution } from '../../domain/tg3-resolution.ts'
import { propertyIdentityStatus } from '../../domain/document-import.ts'
import { selectProperty } from './property.ts'

export type RiskSource = { documentHash: string; documentName: string; pdfPage: number; quote?: string; start?: number; end?: number }
export type PropertyRiskItem = Omit<RiskFinding, 'sources'> & { sources: RiskSource[]; controlNote?: string }
export interface PropertyRiskOverview {
  documented: PropertyRiskItem[]; possible: PropertyRiskItem[]; unexamined: PropertyRiskItem[]
  gaps: string[]; limitations: string[]; technicalCoverage: string
}

/** Visningsmodell: ingen risikoscore, ingen endring av kontroll- eller finansgrunnlag. */
export function selectPropertyRisks(session: SessionState): PropertyRiskOverview {
  const property = selectProperty(session), p = session.prospectus
  const stale = p.prospectus.status !== 'idle' && !property.outcome
  const separatePending = p.report.status !== 'idle' && p.report.status !== 'imported'
  const report = session.report, outcome = stale || separatePending ? null : report.outcome
  const current = outcome && report.selected?.hash === outcome.reportHash && report.selected.file.name.trim() === outcome.documentName ? outcome : null
  const extraction = current?.status === 'completed' ? current : current?.partialResult
  const technical: DocumentImport | null = current ? report.documentImport ?? null : null
  const identityConflict = Boolean(property.outcome && propertyIdentityStatus(property.outcome, p.report.outcome) === 'conflict')
  const candidates = [...(extraction?.findings ?? []), ...(extraction?.uncertainCandidates ?? [])]
  const localTechnical = technical?.propertyRisk?.technical.findings ?? []
  const items: PropertyRiskItem[] = [...(property.outcome?.propertyRisk?.legal.findings ?? [])]
  if (technical && (technical.reportHash !== property.outcome?.reportHash || technical.documentName !== property.outcome.documentName)) {
    items.push(...(technical.propertyRisk?.legal.findings ?? []).map(item => identityConflict && item.status !== 'not-investigated' ? { ...item, status: 'possible' as const } : item))
  }
  const overlaps = (local: RiskFinding, id: string) => {
    const finding = technical?.technical.findings.find(item => item.findingId === id)
    return finding && local.grade === finding.grade && local.sources.some(source => finding.sources.some(other => source.pdfPage === other.pdfPage && source.start < other.end && source.end > other.start))
  }
  items.push(...localTechnical.filter(local => !candidates.some(candidate => overlaps(local, candidate.findingId))).map(item => identityConflict && item.status !== 'not-investigated' ? { ...item, status: 'possible' as const } : item))
  for (const candidate of candidates) {
    const control = report.findingControls.find(item => item.findingId === candidate.findingId)
    if (control?.rejection) continue
    const finding = currentFinding(report, candidate.findingId)
    const original = candidate.original
    const source = finding?.source ?? original.source
    const sources: RiskSource[] = source && typeof source.pdfPage === 'number' && source.documentName ? [{
      documentHash: source.reportHash ?? current!.reportHash, documentName: source.documentName, pdfPage: source.pdfPage,
    }] : []
    const associated = localTechnical.filter(local => overlaps(local, candidate.findingId))
    const originalSources = technical?.technical.findings.find(item => item.findingId === candidate.findingId)?.sources
    const exactSources = !control?.correction && (originalSources || associated.length) ? [...new Map([...(originalSources ?? []), ...associated.flatMap(item => item.sources)]
      .map(item => [`${item.documentHash}:${item.pdfPage}:${item.start}:${item.end}`, item])).values()] : null
    const fullDescription = !control?.correction ? associated.reduce((description, local) => local.description.length > description.length ? local.description : description, finding?.description ?? original.description) : null
    const grade = finding?.grade ?? null
    items.push({ id: `controlled-${candidate.findingId}`, domain: 'technical', category: 'technical',
      title: grade ? `${grade} · ${technical?.technical.findings.find(item => item.findingId === candidate.findingId)?.component ?? 'Teknisk forhold'}` : 'Teknisk forhold med usikker grad',
      description: fullDescription ?? finding?.description ?? original.description, grade,
      status: candidate.kind === 'uncertain' || control?.correction || identityConflict ? 'possible' : 'documented',
      consequence: grade === 'TG3' ? 'Forholdet kan ha vesentlig betydning for bruk og vedlikehold.' : 'Forholdet må inngå i eiendommens vedlikeholds- og kontrollgrunnlag.',
      action: 'Kontroller beskrivelsen og omfanget i originalrapporten.', sources: exactSources ?? sources,
      controlNote: grade === 'TG3' && finding ? `Separat TG3-status: ${validateTg3Resolution(finding, report.tg3Resolutions.find(entry => entry.findingId === candidate.findingId)?.resolution ?? null).applicable ? 'Avklart for førstevurdering med brukeroppgitt grunnlag' : 'Uavklart — avklaringsgrunnlag kreves'}.`
        : control?.correction ? 'Brukerrettet funn. Originalen må kontrolleres separat.' : control && control.confirmedRevision === control.revision ? 'Funn kontrollert av brukeren.' : 'Funn fra dokumentuttrekket; brukerkontroll gjenstår.',
    })
  }
  const coverage = technical?.coverage.technical.status
  const technicalCoverage = separatePending ? 'Separat rapport er ikke ferdig importert.' : stale ? 'Gjeldende dokumentgrunnlag mangler.'
    : !current ? 'Tilstandsrapport er ikke undersøkt.' : coverage === 'complete' || !coverage && report.status === 'completed' ? 'Rapportuttrekk fullført. Brukerkontroll er separat.' : 'Rapportdekningen er ufullstendig. Funnlisten kan mangle forhold.'
  const gaps = [
    ...(!property.outcome?.propertyRisk ? ['Juridiske og praktiske begrensninger er ikke undersøkt i gjeldende salgsoppgave.'] : []),
    ...(property.outcome?.propertyRisk ? ['Lokalt regelsøk dekker bare utvalgte formuleringer. Kommunale godkjenninger, grunnbok og faktisk lovlig bruk er ikke verifisert.'] : []),
    ...(!current || coverage !== 'complete' && Boolean(technical) ? [technicalCoverage] : []),
    ...(identityConflict ? ['Rapport og salgsoppgave har motstridende eiendomsidentitet. Rapporten kan ikke brukes som bekreftet eiendomsgrunnlag.'] : []),
    ...(technical?.coverage.technical.unreadPages.length ? [`Uleste rapportsider: ${technical.coverage.technical.unreadPages.join(', ')}.`] : []),
    ...(property.outcome?.propertyRisk?.legal.unreadPages.length ? [`Juridisk tekst er ikke undersøkt på fysiske PDF-sider ${property.outcome.propertyRisk.legal.unreadPages.join(', ')}.`] : []),
    ...(property.outcome?.attachments ?? []).map(attachment => `Vedlegget «${attachment.name}» er ikke undersøkt.`),
  ]
  const limitations = [...new Set([
    ...(property.outcome?.propertyRisk?.legal.limitations ?? []), ...(technical?.propertyRisk?.technical.limitations ?? []),
    ...(technical?.propertyRisk?.legal.limitations ?? []),
    ...(extraction?.limitations ?? []), ...(technical?.coverage.technical.reasons ?? []), ...(technical?.technical.uncertainties ?? []),
  ])]
  const order = (a: PropertyRiskItem, b: PropertyRiskItem) => {
    const priority = (item: PropertyRiskItem) => item.grade === 'TG3' ? 0 : item.category === 'rental-approval' || item.category === 'use-approval' ? 1 : item.grade === 'TG2' ? 2 : 3
    return priority(a) - priority(b)
  }
  return { documented: items.filter(item => item.status === 'documented').sort(order), possible: items.filter(item => item.status === 'possible').sort(order),
    unexamined: items.filter(item => item.status === 'not-investigated').sort(order), gaps: [...new Set(gaps)], limitations, technicalCoverage }
}
