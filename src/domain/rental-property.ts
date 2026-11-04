import type { DocumentImport } from '../contracts/document-import.ts'
import type { PdfSource } from '../contracts/pdf-source.ts'
import { RentalPropertySchema } from '../contracts/rent-estimate.ts'
import type { RentalProperty } from '../contracts/rent-estimate.ts'

type Candidate<T> = { value: T; sources: PdfSource[] }
const normalize = (value: string) => value.replace(/\s+/g, ' ').trim()
const key = (value: unknown) => typeof value === 'string' ? normalize(value).toLocaleLowerCase('nb') : JSON.stringify(value)

/** Leser bare eksisterende tekstlag. Alle verdier beholder ordrett kilde i originalen. */
export function extractRentalProperty(outcome: DocumentImport): RentalProperty {
  const issues: string[] = []
  const address: Candidate<string>[] = [], municipality: Candidate<string>[] = [], district: Candidate<string>[] = []
  const rooms: Candidate<number>[] = [], types: Candidate<'apartment' | 'unsupported'>[] = []
  const areas: Record<'BRA-i' | 'BRA' | 'P-ROM', Candidate<number>[]> = { 'BRA-i': [], BRA: [], 'P-ROM': [] }
  const sourceValid = (source: PdfSource) => source.documentHash === outcome.reportHash && source.documentName === outcome.documentName
    && outcome.pages[source.pdfPage - 1]?.status === 'readable'
    && outcome.pages[source.pdfPage - 1]?.text.slice(source.start, source.end) === source.quote
  const add = <T>(list: Candidate<T>[], value: T, source: PdfSource) => {
    if (!sourceValid(source)) return
    const existing = list.find(item => key(item.value) === key(value))
    if (existing) {
      if (!existing.sources.some(item => item.pdfPage === source.pdfPage && item.start === source.start && item.end === source.end)) {
        if (existing.sources.length < 200) existing.sources.push(source)
        else if (!issues.includes('Kildegrensen for boligopplysninger er nådd. Grunnlaget må kontrolleres.')) issues.push('Kildegrensen for boligopplysninger er nådd. Grunnlaget må kontrolleres.')
      }
    } else list.push({ value, sources: [source] })
  }
  const choose = <T>(list: Candidate<T>[], label: string): Candidate<T> | null => {
    if (list.length > 1) issues.push(`Motstridende ${label} i dokumentet. Ingen kandidat er valgt.`)
    return list.length === 1 ? list[0]! : null
  }
  // Kontaktkort har egne adresser og må ikke bli eiendommens identitet.
  const brokerContext = (text: string, start: number) => /(?:meglerkontor|kontoradresse|besøksadresse|kontaktinformasjon|foretaksinformasjon)[^\n]*(?:\r?\n[^\n]*){0,3}$/i.test(text.slice(Math.max(0, start - 250), start))
  for (const identity of outcome.propertyIdentity) {
    if (!sourceValid(identity.source) || brokerContext(outcome.pages[identity.source.pdfPage - 1]!.text, identity.source.start)) continue
    if (identity.kind === 'address') add(address, normalize(identity.value), identity.source)
    if (identity.kind === 'municipality') add(municipality, normalize(identity.value), identity.source)
  }
  for (const page of outcome.pages) {
    if (page.status !== 'readable') continue
    const multiUnit = /\b(?:antall (?:boenheter|leiligheter))[ \t]*:?[ \t]*(?:\r?\n[ \t]*)?(?:[2-9]|[1-9]\d+)\b|\b(?:to|tre|fire|fem|seks|sju|syv|åtte|ni|ti|elleve|tolv|[2-9]|[1-9]\d+)[ \t]+(?:selvstendige[ \t]+)?(?:boenheter|leiligheter)\b|^[ \t]*(?:(?:Boligtype|Eiendomstype|Type eiendom)[ \t]*:?[ \t]*(?:\r?\n[ \t]*)?)?(?:bygård|utleiegård|flermannsbolig)[ \t]*$|\b(?:eiendommen|salgsobjektet)[^\n.]{0,60}\b(?:bygård|utleiegård|flermannsbolig)\b/gim
    const multiMatch = [...page.text.matchAll(multiUnit)].find(match => {
      const lineStart = page.text.lastIndexOf('\n', match.index!) + 1
      const prefix = page.text.slice(lineStart, match.index!)
      // Enhetstelling for fellesskapet/bygget sier ikke at alle enhetene selges.
      if (/^[ \t]*(?:sameiet|borettslaget|bygningen|bygget|boligblokken)\b/i.test(prefix)) return false
      const previousLine = page.text.slice(0, Math.max(0, lineStart - 1)).split('\n').at(-1) ?? ''
      return !(!prefix.trim() && /^[ \t]*(?:sameiet|borettslaget|bygningen|bygget|boligblokken)(?:[ \t]*:|[ \t]+består[ \t]+av)?[ \t]*$/i.test(previousLine))
    })?.[0]
    if (multiMatch && !issues.some(issue => issue.startsWith('Flerboligsignal'))) issues.push(`Flerboligsignal på fysisk PDF-side ${page.pdfPage}: «${normalize(multiMatch)}». Modellen gjelder én enkeltleilighet og estimerer ikke samlet leie for flere boenheter.`)
    const source = (match: RegExpMatchArray): PdfSource => ({ documentHash: outcome.reportHash, documentName: outcome.documentName,
      pdfPage: page.pdfPage, start: match.index!, end: match.index! + match[0].length, quote: match[0], method: 'pdf-text', printedPage: null })
    // Etikett/verdi kan stå på hver sin linje, men en tom etikett får ikke sluke en ny etikett.
    const gap = '(?:[ \\t]*:[ \\t]*(?:\\r?\\n[ \\t]*)?|[ \\t]+|[ \\t]*\\r?\\n[ \\t]*)'
    for (const [label, list] of [['(?:Eiendommens adresse|Adresse)', address], ['Kommune', municipality], ['Bydel', district]] as const) {
      const pattern = new RegExp(`^[ \\t]*${label}${gap}([^\\r\\n:]{2,250})[ \\t]*$`, 'gim')
      for (const match of page.text.matchAll(pattern)) {
        const value = normalize(match[1]!)
        if (brokerContext(page.text, match.index!)) continue
        if (list === address && !/^(?:\d{1,2}\.?[ \t]+)?[\p{L}][\p{L} .’'/-]*\s+\d+\s*[\p{L}]?(?:\s*,?\s*\d{4}\s+[\p{L} .’'-]+)?$/u.test(value)) continue
        if (list !== address && !/^(?:\d{4}\s+)?[\p{L}][\p{L} .’'/-]*(?:\s+kommune)?$/iu.test(value)) continue
        add(list, value, source(match))
      }
    }
    for (const match of page.text.matchAll(new RegExp(`^[ \\t]*(?:Antall rom|Rom)${gap}(-?\\d+(?:[,.]\\d+)?)[ \\t]*$`, 'gim'))) {
      const value = Number(match[1]!.replace(',', '.'))
      if (Number.isInteger(value) && value >= 1 && value <= 20) add(rooms, value, source(match))
      else issues.push(`Ugyldig romantall på fysisk PDF-side ${page.pdfPage}: «${normalize(match[0]).slice(0, 300)}». Motstrid må avklares.`)
    }
    for (const match of page.text.matchAll(/\b(\d{1,2})[ \t]*[-–]?[ \t]*roms(?:leilighet|[ \t]+leilighet)?\b/gi)) {
      const lineStart = page.text.lastIndexOf('\n', match.index!) + 1
      const lineEnd = page.text.indexOf('\n', match.index! + match[0].length)
      const line = page.text.slice(lineStart, lineEnd < 0 ? page.text.length : lineEnd)
      const prefix = line.slice(0, match.index! - lineStart).split(/[,;.!?]|\b(?:men|nå|i dag)\b/i).at(-1) ?? ''
      const suffix = line.slice(match.index! - lineStart + match[0].length)
      if (/\b(?:mulighet|mulig|potensiell|planlagt|tidligere|opprinnelig|historisk|ombygging|ombygning|ombygges|alternativ|kan\s+bli|kan\s+gjøres)\b/i.test(prefix)
        || /^[ \t]*(?:etter|ved|før)[ \t]+(?:(?:en|mulig|planlagt)[ \t]+)*(?:ombygging|ombygning)\b/i.test(suffix)) continue
      const value = Number(match[1]); if (value >= 1 && value <= 20) add(rooms, value, source(match))
      if (/leilighet/i.test(match[0])) add(types, 'apartment', source(match))
    }
    for (const match of page.text.matchAll(new RegExp(`^[ \\t]*(?:Boligtype|Type bolig)${gap}([^\\r\\n:]{1,250})[ \\t]*$`, 'gim'))) {
      const value = normalize(match[1]!)
      if (/^(?:leilighet|selveierleilighet|andelsleilighet|aksjeleilighet|eierleilighet)(?:[ \t]*[,.].*)?$/i.test(value)) add(types, 'apartment', source(match))
      else if (/^(?:enebolig|tomannsbolig|rekkehus|fritidsbolig|hybel)(?:[ \t]*[,.].*)?$/i.test(value)) add(types, 'unsupported', source(match))
      else issues.push(`Uavklart boligtype på fysisk PDF-side ${page.pdfPage}: «${normalize(match[0])}». Klassifikasjonen må kontrolleres.`)
    }
    const areaLabels: Record<keyof typeof areas, string> = {
      'BRA-i': '(?:Internt bruksareal(?:[ \\t]*\\(BRA-i\\))?|BRA-i)',
      BRA: '(?:Bruksareal(?:[ \\t]*\\(BRA\\))?|BRA)',
      'P-ROM': '(?:Primærrom(?:[ \\t]*\\(P-ROM\\))?|P-ROM)',
    }
    for (const basis of ['BRA-i', 'BRA', 'P-ROM'] as const) {
      const pattern = new RegExp(`^[ \\t]*${areaLabels[basis]}${gap}(-?\\d+(?:[,.]\\d+)?)[ \\t]*(m²|m2|kvm)?(?:[ \\t]*\\([^\\r\\n]*\\))?[ \\t]*$`, 'gim')
      for (const match of page.text.matchAll(pattern)) {
        const value = Number(match[1]!.replace(',', '.'))
        if (Number.isFinite(value) && value > 0 && value <= 1000) {
          if (match[2]) add(areas[basis], value, source(match))
        } else issues.push(`Ugyldig areal (${basis}) på fysisk PDF-side ${page.pdfPage}: «${normalize(match[0]).slice(0, 300)}». Motstrid må avklares.`)
      }
    }
  }
  const areaBasis = (['BRA-i', 'BRA', 'P-ROM'] as const).find(basis => areas[basis].length > 0)
  const selectedArea = areaBasis ? choose(areas[areaBasis], `areal (${areaBasis})`) : null
  const area = selectedArea && areaBasis ? { ...selectedArea, basis: areaBasis } : null
  const result = { documentHash: outcome.reportHash, documentName: outcome.documentName,
    address: choose(address, 'adresser'), municipality: choose(municipality, 'kommuner'), district: choose(district, 'bydeler'),
    area, rooms: choose(rooms, 'romantall'), propertyType: choose(types, 'boligtyper'), issues }
  for (const [field, label] of [['address', 'Eiendommens adresse'], ['area', 'Areal'], ['rooms', 'Antall rom'], ['propertyType', 'Boligtype']] as const) {
    if (!result[field]) issues.push(`${label} mangler eller er ikke entydig i det lesbare tekstlaget.`)
  }
  if (result.propertyType?.value === 'unsupported') issues.push('Første leiemodell støtter bare enkeltleiligheter.')
  return RentalPropertySchema.parse(result)
}
