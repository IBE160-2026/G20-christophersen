import { createCombinedRequest, combinedInputDigest, checkCombinedResponse } from './combined-request.ts'
import { readFile } from 'node:fs/promises'
import { DocumentImportSchema, IMPORT_VERSION, IMPORT_EXTRACTION_VERSION, IMPORT_PROMPT_VERSION, IMPORT_MODEL } from '../../contracts/document-import.ts'
import type { DocumentImport, EconomyField, ImportRole, PdfSource } from '../../contracts/document-import.ts'
import { ImportFailure } from '../documents/extract-import.ts'

type Basis = { hash: string; name: string; role: ImportRole; requestId: string; pages: DocumentImport['pages']; attachments: DocumentImport['attachments']; parentHash: string | null; attachmentId: string | null }
const versions = { contractVersion: IMPORT_VERSION, extractionVersion: IMPORT_EXTRACTION_VERSION, promptVersion: IMPORT_PROMPT_VERSION, model: IMPORT_MODEL, mode: 'demo' as const }

/** Eksplisitt syntetisk registry. Ingen kundedokumenttolkning, modellklient, nett eller fallback. */
export async function createOfflineImport(basis: Basis): Promise<DocumentImport> {
  const hashes: Record<string, string> = {}
  for (const file of ['sha256.json', 'extended-sha256.json']) Object.assign(hashes, JSON.parse(await readFile(new URL(`../../../tests/fixtures/sales-prospectus/${file}`, import.meta.url), 'utf8')))
  const fixture = Object.entries(hashes).find(([, hash]) => hash === basis.hash)?.[0]
  if (!fixture) throw new ImportFailure('unsupported-synthetic')
  const source = (pdfPage: number, quote: string, printedPage: string | null = null): PdfSource => {
    const text = basis.pages[pdfPage - 1]?.text ?? ''
    const start = text.indexOf(quote)
    if (start < 0 || basis.pages[pdfPage - 1]?.status !== 'readable') throw new ImportFailure('invalid-format')
    return { documentHash: basis.hash, documentName: basis.name, pdfPage, quote, start, end: start + quote.length, method: 'pdf-text', printedPage }
  }
  const separate = fixture === 'separate-report-4.pdf' || fixture === 'wrong-property-report-4.pdf'
  const missing = fixture === 'missing-report-6.pdf' || fixture === 'attached-report-6.pdf'
  const reportStart = separate ? 1 : missing ? null : 5
  const sections: DocumentImport['sections'] = reportStart === null ? [] : [{ documentHash: basis.hash, startPage: reportStart, endPage: fixture === 'bounded-200.pdf' ? 12 : basis.pages.length,
    certainty: 'certain', basis: [source(reportStart, separate ? 'FIKTIV SEPARAT TILSTANDSRAPPORT' : 'TILSTANDSRAPPORT - START')] }]
  if (['bounded-200.pdf', 'integrated-identity-conflict-12.pdf'].includes(fixture)) sections[0]!.basis.push(source(12, 'TILSTANDSRAPPORT - SLUTT'))
  if (fixture === 'ambiguous-12.pdf') { sections[0]!.certainty = 'ambiguous'; sections.push({ documentHash: basis.hash, startPage: 11, endPage: 12, certainty: 'ambiguous', basis: [source(11, 'TILSTANDSRAPPORT - START: rapport nummer to.')] }) }
  const economyPages = basis.role === 'prospectus' && !separate ? [1, ...(!missing ? [2] : [])] : []
  const selected = basis.pages.filter(page => economyPages.includes(page.pdfPage) || sections.some(section => page.pdfPage >= section.startPage && page.pdfPage <= section.endPage))
  // Include the complete proposed report area, including blank/unreadable positions; omit unrelated photo/filler pages.
  const requestBasis = createCombinedRequest({ role: basis.role, hash: basis.hash, name: basis.name, sections, pages: selected, attachments: basis.attachments })
  const inputDigest = combinedInputDigest(requestBasis)
  const omittedPages = basis.pages.filter(page => !selected.includes(page)).map(page => page.pdfPage)
  const unreadPages = basis.pages.filter(page => !['readable', 'blank'].includes(page.status) || page.rasterUnprocessed).map(page => page.pdfPage)
  const technicalUnread = unreadPages.filter(page => sections.some(section => page >= section.startPage && page <= section.endPage))
  const unprocessedAttachments = basis.attachments.map(item => item.id)
  const fields: EconomyField[] = []
  const add = (id: string, label: string, category: EconomyField['category'], quote: string | null, amount: string | null, extras: Partial<EconomyField> = {}) => {
    fields.push({ id, label, category, status: quote ? 'available' : 'missing', amount, currency: 'NOK', period: category === 'recurring' ? 'unknown' : 'once', year: null,
      sources: quote ? [source(1, quote)] : [], alternatives: [], originalText: quote ?? '', nature: quote ? 'fact' : 'unknown', includedIn: null, debtPart: null, ...extras })
  }
  const hasEconomy = economyPages.length > 0
  add('price', 'Prisantydning (dokumentets prisgrunnlag)', 'price', hasEconomy ? 'Prisantydning: 3 000 000 kr' : null, hasEconomy ? '3000000' : null)
  add('sharedDebt', 'Fellesgjeld', 'price', hasEconomy ? 'Fellesgjeld: 200 000 kr' : null, hasEconomy ? '200000' : null)
  add('purchaseCosts', 'Omkostninger', 'one-off', hasEconomy ? 'Omkostninger: 75 000 kr' : null, hasEconomy ? '75000' : null, { includedIn: hasEconomy ? '' : null })
  add('totalPrice', 'Oppgitt totalpris', 'price', hasEconomy ? 'Totalpris inkl. fellesgjeld og omkostninger: 3 275 000 kr' : null, hasEconomy ? '3275000' : null)
  const tax = hasEconomy && fixture !== 'conflict-12.pdf'
  add('documentTax', 'Dokumentavgift', 'one-off', tax ? 'Dokumentavgift: 75 000 kr, inkludert i omkostninger.' : null, tax ? '75000' : null, { includedIn: tax ? 'purchaseCosts' : null })
  add('commonCosts', 'Felleskostnader', 'recurring', hasEconomy ? 'Felleskostnader: 5 000 kr per måned i 2026.' : null, hasEconomy ? '5000' : null,
    { period: hasEconomy ? 'month' : 'unknown', year: hasEconomy ? '2026' : null, debtPart: hasEconomy ? '1000' : null, includedIn: hasEconomy ? '' : null })
  add('propertyTax', 'Eiendomsskatt', 'recurring', hasEconomy ? 'Eiendomsskatt: 6 000 kr per år i 2026, separat.' : null, hasEconomy ? '6000' : null,
    { period: hasEconomy ? 'year' : 'unknown', year: hasEconomy ? '2026' : null, debtPart: hasEconomy ? '0' : null, includedIn: hasEconomy ? '' : null })
  add('municipalFees', 'Kommunale avgifter', 'recurring', hasEconomy ? 'Kommunale avgifter: 6 000 kr per år i 2026, separat.' : null, hasEconomy ? '6000' : null,
    { period: hasEconomy ? 'year' : 'unknown', year: hasEconomy ? '2026' : null, debtPart: hasEconomy ? '0' : null, includedIn: hasEconomy ? '' : null })
  add('sharedDebtPayment', 'Betaling av fellesgjeld', 'recurring', hasEconomy ? 'Herav renter og avdrag fellesgjeld: 1 000 kr per måned.' : null, hasEconomy ? '1000' : null,
    { period: hasEconomy ? 'month' : 'unknown', year: hasEconomy ? '2026' : null, debtPart: hasEconomy ? '1000' : null, includedIn: hasEconomy ? 'commonCosts' : null })
  if (hasEconomy) fields.find(field => field.id === 'sharedDebtPayment')!.sources.push(source(1, 'Felleskostnader: 5 000 kr per måned i 2026.'))
  if (hasEconomy) fields.find(field => field.id === 'commonCosts')!.sources.push(source(1, 'Herav renter og avdrag fellesgjeld: 1 000 kr per måned.'))
  if (fixture === 'conflict-12.pdf' && hasEconomy) {
    fields[0] = { ...fields[0]!, status: 'conflict', alternatives: [{ amount: '3100000', source: source(2, 'Prisantydning: 3 100 000 kr.') }] }
  }
  const findings: DocumentImport['technical']['findings'] = []
  const finding = (id: string, grade: 'TG2' | 'TG3', component: string, description: string, sources: PdfSource[]) => {
    const first = sources[0]!
    const origin = { documentName: basis.name, reportHash: basis.hash, pdfPage: first.pdfPage }
    findings.push({ kind: 'checkable', findingId: id, grade, component, conditionId: id, description, source: origin,
      original: { findingId: id, grade, description, source: origin, uncertainties: [] }, sources })
  }
  if (separate) finding('roof-leak', 'TG3', 'tak', 'Alvorlig lekkasje i tak', [source(3, 'TG3: Alvorlig lekkasje i tak', '1')])
  else if (!missing) {
    finding('bathroom-1-floor', 'TG2', 'bad 1', 'Slitt gulv i bad', [source(6, 'Tilstandsgrad: TG2\nBygningsdel: bad 1\nSlitt gulv i bad', '2')])
    finding('bathroom-2-floor', 'TG2', 'bad 2', 'Slitt gulv i bad', [source(7, 'Tilstandsgrad: TG2\nBygningsdel: bad 2\nSlitt gulv i bad', '3')])
    if (basis.pages[9]?.status === 'readable' && !basis.pages[9]?.rasterUnprocessed) finding('roof-leak', 'TG3', 'tak', 'Alvorlig lekkasje i tak', [source(10, 'Tilstandsgrad: TG3\nBygningsdel: tak\nAlvorlig lekkasje i tak', '6'), source(2, 'TG3: Alvorlig lekkasje i tak.')])
  }
  const technicalStatus = fixture === 'ambiguous-12.pdf' ? 'ambiguous' : reportStart === null ? 'missing' : technicalUnread.length ? 'unreadable' : unprocessedAttachments.length ? 'incomplete' : 'complete'
  const reasons = reportStart === null ? ['Integrert tilstandsrapport mangler. Last opp separat tekstbasert rapport.'] : technicalUnread.length ? ['Rapportområdet har uleste sider. Last opp komplett tekstbasert rapport.'] : []
  if (fixture === 'ambiguous-12.pdf') reasons.push('Flere rapportområder er identifisert. Last opp én fullstendig separat tilstandsrapport.')
  if (unprocessedAttachments.length) reasons.push('Innebygde vedlegg er ikke analysert. Last opp den faktiske PDF-filen separat.')
  const outcome = DocumentImportSchema.parse({ ...versions, requestId: basis.requestId, reportHash: basis.hash, documentName: basis.name, role: basis.role,
    pageCount: basis.pages.length, inputDigest, status: 'imported',
    documents: [{ hash: basis.hash, name: basis.name, role: basis.role, pageCount: basis.pages.length, parentHash: basis.parentHash, attachmentId: basis.attachmentId }],
    pages: basis.pages, attachments: basis.attachments, propertyIdentity: fixture === 'integrated-identity-conflict-12.pdf' ? [{ kind: 'address', value: 'Eksempelveien 1, 0001 Testby', source: source(1, 'Adresse: Eksempelveien 1, 0001 Testby') }, { kind: 'address', value: 'Annenveien 9, 0002 Testby', source: source(5, 'Adresse: Annenveien 9, 0002 Testby') }] : fixture === 'bounded-200.pdf' ? [{ kind: 'address', value: 'Eksempelveien 1, 0001 Testby', source: source(1, 'Adresse: Eksempelveien 1, 0001 Testby') }] : fixture === 'wrong-property-report-4.pdf' ? [{ kind: 'address', value: 'Annenveien 9, 0002 Testby', source: source(1, 'Adresse: Annenveien 9, 0002 Testby') }] : [], sections,
    coverage: { economy: { status: hasEconomy ? 'incomplete' : 'missing', reasons: [hasEconomy ? 'Fullstendig eierbetalt drift, L og Ymin er ikke oppgitt.' : 'Økonomi er ikke del av dette rapportuttrekket.'], omittedPages, unreadPages, unprocessedAttachments },
      technical: { status: technicalStatus, reasons, omittedPages: basis.pages.filter(page => !sections.some(section => page.pdfPage >= section.startPage && page.pdfPage <= section.endPage)).map(page => page.pdfPage), unreadPages: technicalUnread, unprocessedAttachments } },
    economy: { status: hasEconomy ? 'partial' : 'unavailable', ownership: hasEconomy ? fixture === 'conflict-12.pdf' ? 'borettslag' : 'eierseksjon' : 'unknown',
      ownershipSources: hasEconomy ? [source(1, fixture === 'conflict-12.pdf' ? 'Eierform: borettslag' : 'Eierform: eierseksjon')] : [], fields },
    technical: { status: technicalStatus === 'complete' ? 'complete' : 'blocked', findings, uncertainties: [], limitations: [] },
  })
  checkCombinedResponse('completed', Buffer.byteLength(JSON.stringify(outcome)))
  return outcome
}
