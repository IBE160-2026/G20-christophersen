import { createHash } from 'node:crypto'
import { CODE_FIRST_PLAN_VERSION, normalizeImportText, collectTgCandidates } from '../../contracts/document-import.ts'
import { parseNorwegianMoney } from './norwegian-money.ts'
import { ListingKeySchema } from '../../contracts/listing.ts'
import type { DocumentImport, EconomyField, ImportManifest, ImportRole, PdfSource } from '../../contracts/document-import.ts'

export type ImportBasis = { hash: string; name: string; role: ImportRole; requestId: string; pages: DocumentImport['pages']; attachments: DocumentImport['attachments']; parentHash: string | null; attachmentId: string | null }
export type LocalPlan = ReturnType<typeof createLocalPlan>
const hash = (value: string) => createHash('sha256').update(value).digest('hex')
/** Search normalization retains a map to the exact PDF.js UTF-16 offsets. */
export const normalizeWithOffsets = normalizeImportText
export const componentKey = (component: string) => component.trim().toLocaleLowerCase('nb')
export function sourceFor(basis: ImportBasis, pdfPage: number, start: number, end: number): PdfSource {
  const page = basis.pages[pdfPage - 1]
  if (!page || page.status !== 'readable' || start < 0 || end <= start || end > page.text.length || end - start > 2000) throw new Error('invalid-source')
  return { documentHash: basis.hash, documentName: basis.name, pdfPage, start, end, quote: page.text.slice(start, end), method: 'pdf-text', printedPage: null }
}
const labels = {
  price: 'Prisantydning', totalPrice: 'Totalpris', purchaseCosts: 'Omkostninger', documentTax: 'Dokumentavgift', sharedDebt: 'Fellesgjeld',
  commonCosts: 'Felleskostnader', propertyTax: 'Eiendomsskatt', municipalFees: 'Kommunale avgifter', sharedDebtPayment: 'Betaling av fellesgjeld',
} as const
const economyPattern = /prisantydning|totalpris|omkostninger|dokumentavgift|fellesgjeld|felleskostnader|eiendomsskatt|kommunale avgifter/i
export function createLocalPlan(basis: ImportBasis, options: { legacyEconomy?: boolean } = {}) {
  const manifest: ImportManifest = { version: CODE_FIRST_PLAN_VERSION, blocks: [], candidates: [], residual: [] }
  const findings: DocumentImport['technical']['findings'] = []
  const sections: DocumentImport['sections'] = [], propertyIdentity: DocumentImport['propertyIdentity'] = []
  const headings: { page: number; start: number; end: number; closing: boolean }[] = []
  const economyPages = new Set<number>()
  const fields: EconomyField[] = ListingKeySchema.options.map(id => ({ id, label: labels[id], category: ['price', 'totalPrice', 'sharedDebt'].includes(id) ? 'price' : ['purchaseCosts', 'documentTax'].includes(id) ? 'one-off' : 'recurring', status: 'missing', amount: null, currency: 'NOK', period: ['commonCosts', 'propertyTax', 'municipalFees', 'sharedDebtPayment'].includes(id) ? 'unknown' : 'once', year: null, nature: 'unknown', originalText: '', sources: [], alternatives: [], includedIn: null, debtPart: null }))
  const residual = (pdfPage: number, reason: string) => { if (!manifest.residual.some(item => item.pdfPage === pdfPage && item.reason === reason)) manifest.residual.push({ pdfPage, reason }) }
  const repeatedEvidence = (left: PdfSource, right: PdfSource) => left.quote.trim() === right.quote.trim()
  const ownershipSources: PdfSource[] = [], ownershipValues = new Set<'eierseksjon' | 'borettslag'>()
  for (const page of basis.pages) {
    if (page.status !== 'readable' && page.status !== 'blank' || page.rasterUnprocessed) manifest.residual.push({ pdfPage: page.pdfPage, reason: 'Ulest tekst eller ubehandlet raster.' })
    for (const candidate of collectTgCandidates(page.text)) {
      const { start, end, grade } = candidate
      manifest.candidates.push({ id: hash(`${basis.hash}:${page.pdfPage}:${start}:${end}:tg`), pdfPage: page.pdfPage, start, end, grade, disposition: 'unresolved', findingId: null, evidence: [], reason: null })
    }
    if (page.status !== 'readable') continue
    for (const match of page.text.matchAll(/^\s*(?:FIKTIV SEPARAT )?TILSTANDSRAPPORT(?:\s*[-–:]\s*(START|SLUTT))?[^\n]*$/gim)) {
      if (/innholdsfortegnelse/i.test(page.text.slice(0, match.index))) continue
      if (match[0].length > 2000) { residual(page.pdfPage, 'Lang rapportoverskrift krever semantisk avklaring.'); continue }
      headings.push({ page: page.pdfPage, start: match.index, end: Math.min(match.index + match[0].length, match.index + 2000), closing: match[1]?.toUpperCase() === 'SLUTT' })
    }
    for (const match of page.text.matchAll(/Tilstandsgrad\s*:\s*T\s*G\s*([23])\s*\nBygningsdel\s*:\s*([^\n]+)\n([^\n]+)(?:\n|$)/gi)) {
      const quote = match[0]
      if (quote.length > 2000 || match[2]!.trim().length > 200 || match[3]!.trim().length > 2000 || findings.length >= 200) { if (findings.length >= 200) residual(page.pdfPage, 'Lokal funngrense nådd; resten må avklares.'); continue }
      const source = sourceFor(basis, page.pdfPage, match.index, match.index + quote.length)
      const findingId = 'local-' + hash(`${basis.hash}:${page.pdfPage}:${match.index}`).slice(0, 24)
      const grade = `TG${match[1]}` as 'TG2' | 'TG3', description = match[3]!.trim(), component = match[2]!.trim()
      const origin = { documentName: basis.name, reportHash: basis.hash, pdfPage: page.pdfPage }
      findings.push({ kind: 'checkable', findingId, conditionId: findingId, grade, description, component, source: origin, sources: [source], original: { findingId, grade, description, source: origin, uncertainties: [] } })
    }
    for (const match of page.text.matchAll(/^[ \t]*Adresse[ \t]*:[ \t]*([^\r\n]+)$/gim)) {
      const value = match[1]!.trim()
      // A blank form label must never consume the next line. Only an explicit
      // street/name plus house number is a local address; other identity stays unresolved.
      if (!/^[\p{L}][\p{L} .’'-]*[ \t]+\d+[ \t]*[\p{L}]?(?:[ \t]*,[ \t]*\d{4}[ \t]+[\p{L} .’'-]+)?$/u.test(value)) continue
      if (match[0].length > 2000 || value.length > 300) { residual(page.pdfPage, 'Lang identitetskilde er uavklart.'); continue }
      const source = sourceFor(basis, page.pdfPage, match.index, match.index + match[0].length)
      if (propertyIdentity.some(item => item.value === value && repeatedEvidence(item.source, source))) continue
      if (propertyIdentity.length >= 20) { residual(page.pdfPage, 'Identitetsgrensen er nådd; ytterligere belegg er uavklart.'); continue }
      propertyIdentity.push({ kind: 'address', value, source })
    }
    for (const match of page.text.matchAll(/Eierform\s*:\s*(eierseksjon|borettslag)/gi)) {
      ownershipValues.add(match[1]!.toLowerCase() as 'eierseksjon' | 'borettslag')
      const source = sourceFor(basis, page.pdfPage, match.index, match.index + match[0].length)
      if (ownershipSources.some(item => repeatedEvidence(item, source))) continue
      if (ownershipSources.length >= 10) { residual(page.pdfPage, 'Eierformens kildegrense er nådd; ytterligere belegg er uavklart.'); continue }
      ownershipSources.push(source)
    }
    if (economyPattern.test(page.text)) economyPages.add(page.pdfPage)
    // Only complete labelled entries are local facts. A currency prefix, a
    // heading/value line pair, or an exact parenthesized ledger label is safe;
    // optional insurance alternatives and prose remain semantic.
    for (const field of fields) {
      const aliases: Partial<Record<EconomyField['id'], string>> = {
        price: '(?:Prisantydning|Total prisantydning eksklusiv omkostninger)',
        totalPrice: '(?:Totalpris|Total ink\\. omk\\.)',
      }
      const label = aliases[field.id] ?? labels[field.id as keyof typeof labels]
      const number = '(\\d[\\d. \\u00a0\\u202f]*(?:,\\d{1,2}|,[-\\u2011\\u2013])?)'
      const gap = '[ \\t\\u00a0\\u202f]*'
      const separator = `${gap}:?${gap}(?:\\r?\\n${gap})?`
      const lineGap = `${gap}(?:\\r?\\n${gap})?`
      const qualifier = `(?:${lineGap}(?:per|pr\\.?)${gap}(måned|år)|${lineGap}for${gap}år${gap}(\\d{4}))?(?:${lineGap}i${gap}(\\d{4}))?`
      const expressions = [
        new RegExp(`^${gap}${label}${separator}(?:kr|NOK)${gap}${number}${qualifier}\\.?${gap}$`, 'gim'),
        new RegExp(`^${gap}${label}${separator}${number}${gap}(?:kr|NOK)${qualifier}\\.?${gap}$`, 'gim'),
      ]
      const ledgerLabels: Partial<Record<EconomyField['id'], string>> = {
        documentTax: 'Dokumentavgift(?: \\(\\d+(?:,\\d+)? %\\))?',
        purchaseCosts: 'Omkostninger totalt',
        totalPrice: 'Totalpris\\. inkl\\. omkostninger',
      }
      if (ledgerLabels[field.id]) expressions.push(new RegExp(`^${gap}(?:kr|NOK)${gap}${number}${gap}\\(${ledgerLabels[field.id]}\\)${gap}$`, 'gim'))
      if (options.legacyEconomy) {
        // Historical request regeneration only: preserve the original grammar,
        // whitespace spans and integral-only behaviour for integrity-pinned replay.
        expressions.splice(0, expressions.length, new RegExp(`^\\s*${labels[field.id as keyof typeof labels]}\\s*:\\s*(\\d{1,3}(?:[ \\u00a0]\\d{3})+|\\d+)(?:,00)?\\s*(?:kr|NOK)(?:\\s+per\\s+(måned|år))?(?:\\s+i\\s+(\\d{4}))?\\.?\\s*$`, 'gim'))
      }
      for (const expression of expressions) for (const match of page.text.matchAll(expression)) {
        const amount = parseNorwegianMoney(match[1]!.trim()).amount
        if (amount === null) continue
        if (match[0].length > 2000 || amount.length > 80) { residual(page.pdfPage, 'Langt økonomibelegg er uavklart.'); continue }
        const source = sourceFor(basis, page.pdfPage, match.index, match.index + match[0].length)
        if (field.sources.some(item => repeatedEvidence(item, source))) continue
        const period = match[2] === 'måned' ? 'month' : match[2] === 'år' || !options.legacyEconomy && match[3] ? 'year' : field.category === 'recurring' ? 'unknown' : 'once'
        const year = match[3] ?? match[4] ?? null
        if (field.amount === null) Object.assign(field, { amount, period, year, status: 'available', nature: 'fact', originalText: source.quote })
        else if (field.amount !== amount || field.period !== period || field.year !== year) {
          if (!field.alternatives.some(item => item.amount === amount && repeatedEvidence(item.source, source))) {
            if (field.alternatives.length < 10) { field.status = 'conflict'; field.alternatives.push({ amount, source }) }
            else residual(page.pdfPage, `Alternativgrensen for ${field.id} er nådd; ytterligere belegg er uavklart.`)
          }
        }
        if (field.sources.length < 12) field.sources.push(source)
        else residual(page.pdfPage, `Kildegrensen for ${field.id} er nådd; ytterligere belegg er uavklart.`)
      }
    }
  }
  const starts = headings.filter(item => !item.closing), ends = headings.filter(item => item.closing)
  if (starts.length === 1 && ends.length <= 1 && (ends[0]?.page ?? basis.pages.length) >= starts[0]!.page) {
    const start = starts[0]!, end = ends[0]
    const certain = Boolean(end) || basis.role === 'report' && start.page === 1
    sections.push({ documentHash: basis.hash, startPage: start.page, endPage: end?.page ?? basis.pages.length, certainty: certain ? 'certain' : 'ambiguous', basis: [sourceFor(basis, start.page, start.start, start.end), ...(end ? [sourceFor(basis, end.page, end.start, end.end)] : [])] })
  }
  const reconciliationIds = new Set(findings.filter(finding => findings.some(other => other.findingId !== finding.findingId && componentKey(other.component) === componentKey(finding.component) && other.grade === finding.grade && other.description === finding.description)).map(finding => finding.findingId))
  for (const page of basis.pages) {
    const explicitSources = [...propertyIdentity.map(item => item.source), ...sections.flatMap(item => item.basis), ...ownershipSources, ...fields.flatMap(field => field.sources), ...findings.filter(finding => !reconciliationIds.has(finding.findingId)).flatMap(finding => finding.sources)].filter(source => source.pdfPage === page.pdfPage)
    const boundaries = new Set([0, page.text.length, ...explicitSources.flatMap(source => [source.start, source.end])])
    const pageCandidates = manifest.candidates.filter(candidate => candidate.pdfPage === page.pdfPage)
    // No original TG marker may straddle a chunk or an explicit-source boundary.
    for (const boundary of boundaries) if (pageCandidates.some(candidate => candidate.start < boundary && candidate.end > boundary)) boundaries.delete(boundary)
    const ordered = [...boundaries].sort((a, b) => a - b)
    if (!page.text.length) ordered.push(0)
    for (let index = 0; index < ordered.length - 1; index++) {
      for (let start = ordered[index]!; start < ordered[index + 1]! || page.text.length === 0;) {
        let end = Math.min(start + 1600, ordered[index + 1]!)
        const crossing = pageCandidates.find(candidate => candidate.start < end && candidate.end > end)
        if (crossing) end = crossing.start > start ? crossing.start : crossing.end
        const local = explicitSources.some(source => source.start <= start && source.end >= end)
        manifest.blocks.push({ id: hash(`${basis.hash}:${page.pdfPage}:${start}:${end}:${CODE_FIRST_PLAN_VERSION}`), pdfPage: page.pdfPage, start, end, result: !page.text.slice(start, end).trim() ? 'local-blank' : local ? 'local-explicit' : 'unresolved', sent: false })
        if (!page.text.length) break
        start = end
      }
    }
  }
  for (const candidate of manifest.candidates) {
    const finding = findings.find(item => item.grade === candidate.grade && item.sources.some(source => source.pdfPage === candidate.pdfPage && source.start <= candidate.start && source.end >= candidate.end))
    if (finding && !reconciliationIds.has(finding.findingId)) Object.assign(candidate, { disposition: 'finding', findingId: finding.findingId, evidence: finding.sources })
  }
  const section = sections[0]
  if (section?.certainty === 'certain') manifest.residual = manifest.residual.filter(item => item.reason !== 'Ulest tekst eller ubehandlet raster.' || item.pdfPage >= section.startPage && item.pdfPage <= section.endPage)
  if (!section || section.certainty !== 'certain') manifest.residual.push({ pdfPage: section?.startPage ?? 1, reason: 'Rapportens start/slutt kan ikke fastslås entydig. Komplett separat tekstbasert rapport kreves.' })
  if (new Set(propertyIdentity.map(item => item.value)).size !== 1) manifest.residual.push({ pdfPage: 1, reason: 'Eiendomsidentiteten mangler eller er motstridende.' })
  for (const candidate of manifest.candidates) if (!section || candidate.pdfPage < section.startPage || candidate.pdfPage > section.endPage) manifest.residual.push({ pdfPage: candidate.pdfPage, reason: 'TG-kandidat utenfor sikkert rapportområde krever avstemming.' })
  for (const attachment of basis.attachments) manifest.residual.push({ pdfPage: 1, reason: `Ubehandlet vedlegg: ${attachment.name}` })
  const selected = manifest.blocks.filter(block => block.result === 'unresolved' && (sections.some(area => area.certainty === 'certain' && block.pdfPage >= area.startPage && block.pdfPage <= area.endPage) || economyPages.has(block.pdfPage) || propertyIdentity.some(identity => identity.source.pdfPage === block.pdfPage)))
  return { basis, manifest, sections, propertyIdentity, fields, findings, reconciliationIds, ownership: ownershipValues.size === 1 ? [...ownershipValues][0]! : 'unknown' as const, ownershipSources, selected }
}
