import type { DocumentImport } from '../../contracts/document-import.ts'
import type { PropertyRiskItem, RiskSource } from './property-risk.ts'

type DocumentContext = Pick<DocumentImport, 'reportHash' | 'documentName'> & { pages: readonly Pick<DocumentImport['pages'][number], 'pdfPage' | 'text'>[] }
const documentKey = (source: RiskSource) => JSON.stringify([source.documentHash, source.documentName])
const normalize = (text: string) => text.toLocaleLowerCase('nb-NO').replace(/\s+/gu, ' ').trim()
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0

type Subject = { kind: 'known'; key: string; label: string } | { kind: 'none' | 'unknown' }
const unknownSubject: Subject = { kind: 'unknown' }
const noSubject: Subject = { kind: 'none' }
const compassAliases: Record<string, string> = { østre: 'øst', vestre: 'vest', nordre: 'nord', søndre: 'sør' }

function locations(text: string) {
  const normalized = normalize(text)
  const bases = [...normalized.matchAll(/\b(kjeller\p{L}*|loft\p{L}*|takterrass\p{L}*|garasj\p{L}*|tilbygg\p{L}*|anneks\p{L}*|uthus\p{L}*|(?:første|andre|tredje|1\.|2\.|3\.)\s+etasje)\b/gu)].map(match => {
    const value = match[0]
    return ['kjeller', 'loft', 'takterrass', 'garasj', 'tilbygg', 'anneks', 'uthus'].find(base => value.startsWith(base))?.replace('takterrass', 'takterrasse').replace('garasj', 'garasje') ?? value
  })
  const units = [...text.matchAll(/\b(?:leilighet|boenhet|utleieenhet|utleiedel|seksjon)\s+(?:(nr\.?)\s*)?([a-zæøå]?\d+[a-zæøå]?|[a-zæøå])(?=\s|[,.:]|$)/giu)]
    // Lowercase «i» without an ID label is the Norwegian preposition. Preserve
    // other IDs regardless of the following prose, including «a på loftet».
    .filter(match => match[2] !== 'i' || Boolean(match[1]))
    .map(match => `enhet ${match[2]!.toLocaleLowerCase('nb-NO')}`)
  const directions = [...normalized.matchAll(/(?<!\p{L})(?:(?:nord|sør)[ -]?(?:øst|vest)|øst|vest|nord|sør|østre|vestre|nordre|søndre)(?!\p{L})/gu)].map(match => compassAliases[match[0]] ?? match[0].replace(/[ -]/gu, ''))
  const distinctBases = [...new Set(bases)], distinctUnits = [...new Set(units)], distinctDirections = [...new Set(directions)]
  if (distinctBases.length > 1 || distinctUnits.length > 1 || distinctDirections.length > 1) return { ambiguous: true, values: [...distinctBases, ...distinctUnits, ...distinctDirections] }
  return { ambiguous: false, values: [...distinctBases, ...distinctUnits, ...distinctDirections] }
}
function identified(text: string): Subject {
  const found = locations(text)
  if (found.ambiguous) return unknownSubject
  if (!found.values.length) return noSubject
  // A compass direction without a named physical subject is insufficient.
  if (found.values.every(value => /^(?:(?:nord|sør)?(?:øst|vest)|nord|sør)$/u.test(value))) return unknownSubject
  const key = found.values.join(' · ')
  return { kind: 'known', key, label: key[0]!.toUpperCase() + key.slice(1) }
}

function subject(item: PropertyRiskItem, documents: readonly DocumentContext[]): Subject {
  const text = [item.description, ...item.sources.map(source => source.quote ?? '')].join('\n')
  // A collective reference can concern several preceding units. The nearest
  // heading alone cannot bind «avvikene nevnt over» to the last one.
  if (/(?:avvikene|forholdene|tiltakene|endringene)\s+(?:nevnt (?:over|ovenfor)|ovenfor)|ovennevnte (?:avvik|forhold)/u.test(normalize(text))) return unknownSubject
  if (/\b(?:utleieenheter|leiligheter|boenheter|bruksenheter)\b/u.test(normalize(text))) return unknownSubject
  const direct = identified(text)
  if (direct.kind !== 'none') return direct
  const preceding: Subject[] = []
  for (const source of item.sources) {
    const document = documents.find(entry => entry.reportHash === source.documentHash && entry.documentName === source.documentName)
    const page = document?.pages.find(entry => entry.pdfPage === source.pdfPage)
    if (!document) continue
    // Invalid provenance must not supply either context or the context-free singular alias.
    if (!page || source.start === undefined || source.end === undefined || !Number.isInteger(source.start) || !Number.isInteger(source.end) || !source.quote || source.start < 0 || source.end <= source.start || source.end > page.text.length
      || page.text.slice(source.start, source.end) !== source.quote) return unknownSubject
    const prefix = page.text.slice(Math.max(0, source.start - 450), source.start)
    const fragments = [...prefix.matchAll(/[^\n.!?]+/gu)].reverse()
    for (const fragment of fragments) {
      const result = identified(fragment[0])
      if (result.kind !== 'none') { preceding.push(result); break }
      // An unrecognized heading starts a new subject. Never inherit an older floor through it.
      if (/^\s*(?:[•−–-]\s*)?[^:]{1,100}:/u.test(fragment[0]) || /^\s*[A-ZÆØÅ][A-ZÆØÅ /-]{2,99}\s*$/u.test(fragment[0])) { preceding.push(unknownSubject); break }
    }
  }
  if (preceding.some(entry => entry.kind === 'unknown')) return unknownSubject
  const known = preceding.filter((entry): entry is Extract<Subject, { kind: 'known' }> => entry.kind === 'known')
  if (new Set(known.map(entry => entry.key)).size > 1) return unknownSubject
  return known[0] ?? noSubject
}

function problem(item: PropertyRiskItem) {
  const text = normalize(item.description)
  if (item.category === 'rental-approval' && /ikke\s+(?:er\s+)?godkjent/u.test(text)) return 'unapproved-rental-unit'
  if (item.category === 'use-approval') {
    if (/lovlighetsmang|ulovlig/u.test(text)) return 'unlawful-use'
    if (!/mangler ikke/u.test(text) && /(?:mangler|ikke mottatt|foreligger (?:ikke|hverken|verken)|ingen).{0,50}(?:ferdigattest.{0,60}brukstillatelse|brukstillatelse.{0,60}ferdigattest)/u.test(text)) return 'missing-completion-and-use-permit'
    if (/ferdigattest/u.test(text) && !/brukstillatelse/u.test(text)) return 'missing-completion-certificate'
    if (/brukstillatelse/u.test(text) && !/ferdigattest/u.test(text)) return 'missing-use-permit'
    if (/bruksendring/u.test(text) && /ikke dokumentert|mangler godkjenning|(?:mangler|ikke) dokumentasjon.{0,60}godkjent|mangler dokumentasjon.{0,60}godkjenning|uten (?:dokumentert )?godkjenning/u.test(text)) return 'unapproved-change-of-use'
  }
  if (item.category === 'rental-restriction') {
    if (/samtykke|styrets godkjenning/u.test(text)) return 'rental-consent'
    if (/korttidsutleie/u.test(text) && /maksimalt|begrenset til/u.test(text)) return 'short-term-rental-limit'
    if (/ikke tillatt|forbudt|ikke leies ut|ikke adgang/u.test(text)) return 'rental-prohibition'
  }
  return null
}

/** Only positively identified general explanations leave the risk count. Ambiguous wording stays a finding. */
export function isRiskBackground(item: PropertyRiskItem) {
  if (item.domain !== 'legal') return false
  const text = normalize(item.description)
  // This describes the legal effect of a general rule, rather than claiming that a particular measure is illegal.
  if (/(?:betyr|innebærer).{0,50}ikke at (?:ulovlig oppførte )?bygg\s*\/\s*ulovlige tiltak blir lovlige/u.test(text)
    && !/på (?:denne )?eiendommen|(?:dette|det aktuelle) tiltaket/u.test(text) && locations(text).values.length === 0) return true
  const law = /\bloven\b|\blovens\b|bygningsloven|eierseksjonsloven|burettslagslova|avhendingslov|husleielov|lov om|lovbestemt/u.test(text)
  const general = /\bgenerelt\b|\bsom hovedregel\b|\bsom et utgangspunkt\b|\bgjelder at\b|\bfor alle (?:bygg|tiltak|boliger)\b/u.test(text)
  const concrete = /\b(?:denne|dette|disse|eiendommen|leiligheten|rommet|seksjonen|utleieenheten|utleid|vår|vårt)\b|\b(?:foreligger ikke|er ikke godkjent|mangler godkjenning|påvist|avdekket|registrert)\b/u.test(text) || locations(text).values.length > 0
  return law && general && !concrete
}

function sourceKey(source: RiskSource) {
  return JSON.stringify([source.documentHash, source.documentName, source.pdfPage, source.start, source.end, source.quote,
    'method' in source ? source.method : null, 'printedPage' in source ? source.printedPage : null])
}
function exactOverlap(a: PropertyRiskItem, b: PropertyRiskItem) {
  return a.sources.some(source => source.start !== undefined && source.end !== undefined && b.sources.some(other =>
    documentKey(source) === documentKey(other) && source.pdfPage === other.pdfPage && source.start === other.start && source.end === other.end && source.quote === other.quote))
}
function boundary(item: PropertyRiskItem) {
  return JSON.stringify([item.domain, item.category, item.status, item.grade, item.sourceQuality ?? 'unspecified', item.controlNote ?? null,
    item.id.startsWith('controlled-') ? item.id : null])
}

/** Conservative display-only grouping. Original members and sources are never rewritten or truncated. */
export function groupPropertyRisks(items: readonly PropertyRiskItem[], documents: readonly DocumentContext[] = []): PropertyRiskItem[] {
  const sorted = [...items].sort((a, b) => compare(a.id, b.id))
  const metadata = sorted.map(item => ({ item, subject: subject(item, documents), problem: problem(item),
    document: item.sources.length && new Set(item.sources.map(documentKey)).size === 1 ? documentKey(item.sources[0]!) : null }))
  const units = new Map<string, Set<string>>()
  for (const entry of metadata) {
    if (!entry.document || entry.item.domain !== 'legal') continue
    const text = normalize([entry.item.description, ...entry.item.sources.map(source => source.quote ?? '')].join(' '))
    if (!/utlei|utleid|leilighet|boenhet|bruksenhet/u.test(text)) continue
    const known = units.get(entry.document) ?? new Set<string>()
    if (entry.subject.kind === 'known') known.add(entry.subject.key)
    if (entry.subject.kind === 'unknown') known.add('ambiguous-units')
    units.set(entry.document, known)
    // Explicit plural units cannot establish one unique referent, even within one named floor.
    if (/\b(?:utleieenheter|leiligheter|boenheter|bruksenheter)\b/u.test(text)) known.add('multiple-units')
  }
  for (const entry of metadata) {
    if (entry.subject.kind !== 'none' || !entry.document || entry.problem !== 'unapproved-rental-unit') continue
    const known = units.get(entry.document)
    const text = normalize(entry.item.description)
    if (known?.size === 1 && known.has('kjeller') && /\b(?:utleid\w* leilighet\w*|utleieenheten|utleiedelen|leiligheten|boenheten)\s+(?:er\s+)?ikke\s+(?:er\s+)?godkjent/u.test(text)
      && !/\b(?:to|tre|flere|2|3)\b/u.test(text)) entry.subject = { kind: 'known', key: 'kjeller', label: 'Kjeller' }
  }
  const groups: typeof metadata[] = []
  for (const entry of metadata) {
    const group = groups.find(existing => {
      const first = existing[0]!
      if (!entry.document || entry.document !== first.document || boundary(entry.item) !== boundary(first.item)) return false
      if (entry.item.id.startsWith('controlled-') || first.item.id.startsWith('controlled-')) return entry.item.id === first.item.id
      if (entry.subject.kind === 'known' && first.subject.kind === 'known' && entry.subject.key !== first.subject.key) return false
      if (exactOverlap(entry.item, first.item)) return normalize(entry.item.description) === normalize(first.item.description) || Boolean(entry.problem && entry.problem === first.problem)
      return entry.item.domain === 'legal' && entry.subject.kind === 'known' && first.subject.kind === 'known' && entry.subject.key === first.subject.key && entry.problem !== null && entry.problem === first.problem
    })
    if (group) group.push(entry)
    else groups.push([entry])
  }
  return groups.map(group => {
    const identifiedSubject = group[0]!.subject
    const displaySubject = identifiedSubject.kind === 'known' && group[0]!.item.domain === 'legal' ? identifiedSubject.label : undefined
    if (group.length === 1) return displaySubject ? { ...group[0]!.item, displaySubject } : group[0]!.item
    const members = group.map(entry => entry.item)
    const representative = [...members].sort((a, b) => b.description.length - a.description.length || compare(a.id, b.id))[0]!
    const sources = [...new Map(members.flatMap(item => item.sources).map(source => [sourceKey(source), source])).values()]
      .sort((a, b) => compare(documentKey(a), documentKey(b)) || a.pdfPage - b.pdfPage || (a.start ?? -1) - (b.start ?? -1) || compare(sourceKey(a), sourceKey(b)))
    return { ...representative, id: members[0]!.id, sources, members, ...(displaySubject ? { displaySubject } : {}) }
  })
}
