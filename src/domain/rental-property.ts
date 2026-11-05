import type { DocumentImport } from '../contracts/document-import.ts'
import type { PdfSource } from '../contracts/pdf-source.ts'
import { RentalPropertySchema } from '../contracts/rent-estimate.ts'
import type { RentalProperty } from '../contracts/rent-estimate.ts'

type Candidate<T> = { value: T; sources: PdfSource[] }
const normalize = (value: string) => value.replace(/\s+/g, ' ').trim()
const key = (value: unknown) => typeof value === 'string' ? normalize(value).toLocaleLowerCase('nb') : JSON.stringify(value)
const addressParts = (value: string) => /^(?<street>(?:\d{1,2}\.?[ \t]+)?[\p{L}][\p{L} .’'/-]*?[ \t]+\d+[ \t]*[\p{L}]?)(?:[ \t]*,?[ \t]*(?<postal>\d{4})[ \t]+(?<place>[\p{L}][\p{L} .’'-]*))?$/u.exec(normalize(value))?.groups
const municipalityName = (value: string) => {
  const name = normalize(value).replace(/^\d{4}\s+/, '').replace(/\s+kommune\.?$/i, '')
  return /^[\p{L}][\p{L} .’'-]{1,80}$/u.test(name) && !/\b(?:vedrørende|oppdragsnummer|postnr|datert|kommunen|kommune|boligtype|salgsobjekt|adresse|byggeår|eierform|soverom|bruksareal|selger|kjøper|hjemmelshaver|oppdragsgiver|arealer)\b/i.test(name) ? name : null
}
// Legacy Oslo-bydeler 2004–2027, ikke et tidløst register: reform fra 2028.
// Verifiserer bare eksplisitte nummer/navn-par; utvider ingen SSB-prissoner.
// Kilde: https://www.oslo.kommune.no/get-file/1134117/5092c0da27edb275d119c717b8985d96a9b0b2badcebd7ac393657322162ccb4
const OSLO_LEGACY_DISTRICTS_2004_2027 = ['Gamle Oslo', 'Grünerløkka', 'Sagene', 'St. Hanshaugen', 'Frogner', 'Ullern', 'Vestre Aker', 'Nordre Aker', 'Bjerke', 'Grorud', 'Stovner', 'Alna', 'Østensjø', 'Nordstrand', 'Søndre Nordstrand']
const districtNameKey = (value: string) => normalize(value).toLocaleLowerCase('nb').replace(/[ .]/g, '')

/** Leser bare eksisterende tekstlag. Alle verdier beholder ordrett kilde i originalen. */
export function extractRentalProperty(outcome: DocumentImport): RentalProperty {
  const issues: string[] = []
  const address: Candidate<string>[] = [], municipality: Candidate<string>[] = [], district: Candidate<string>[] = []
  const rooms: Candidate<number>[] = [], bedrooms: Candidate<number>[] = [], types: Candidate<'apartment' | 'unsupported'>[] = []
  let floorSection = false
  const areas: Record<'BRA-i' | 'BRA' | 'P-ROM', Candidate<number>[]> = { 'BRA-i': [], BRA: [], 'P-ROM': [] }
  const sourceValid = (source: PdfSource) => source.documentHash === outcome.reportHash && source.documentName === outcome.documentName
    && outcome.pages[source.pdfPage - 1]?.status === 'readable'
    && outcome.pages[source.pdfPage - 1]?.text.slice(source.start, source.end) === source.quote
  const add = <T>(list: Candidate<T>[], value: T, source: PdfSource) => {
    if (!sourceValid(source)) return
    const existing = list.find(item => {
      if (list !== address) return key(item.value) === key(value)
      const left = addressParts(String(item.value)), right = addressParts(String(value))
      return left && right && key(left.street!.replace(/(\d)[ \t]+(?=[\p{L}]$)/u, '$1')) === key(right.street!.replace(/(\d)[ \t]+(?=[\p{L}]$)/u, '$1'))
        && (!left.postal || !right.postal || (left.postal === right.postal && key(left.place) === key(right.place)))
    })
    if (existing) {
      if (list === address && !addressParts(String(existing.value))?.postal && addressParts(String(value))?.postal) existing.value = value
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
  const brokerContext = (text: string, start: number) => /(?:meglerkontor|kontoradresse|besøksadresse|kontaktinformasjon|foretaksinformasjon|(?:^|\n)[ \t]*(?:ansvarlig )?megler\b)[^\n]*(?:\r?\n[^\n]*){0,3}$/i.test(text.slice(Math.max(0, start - 250), start))
  for (const identity of outcome.propertyIdentity) {
    if (!sourceValid(identity.source) || brokerContext(outcome.pages[identity.source.pdfPage - 1]!.text, identity.source.start)) continue
    if (identity.kind === 'address' && addressParts(identity.value) && key(identity.source.quote).includes(key(identity.value))) add(address, normalize(identity.value), identity.source)
    const name = identity.kind === 'municipality' ? municipalityName(identity.value) : null
    if (name && key(identity.source.quote).includes(key(identity.value))) add(municipality, name, identity.source)
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
      const context = page.text.slice(Math.max(0, match.index! - 1000), match.index!)
      // Public planning cases describe neighbouring projects. A nearby sale-
      // object statement restores the multi-unit guard; a case number alone
      // never describes how many units are included in this sale.
      if (/(?:nabo(?:eiendom|tiltak|prosjekt)|nærliggende (?:områder|eiendommer)|andre (?:eiendommer|byggeprosjekter))/i.test(context)
        && /\b(?:tiltaket|nybygg|byggeprosjektet)\b/i.test(context)
        && !/\b(?:salgsobjektet|(?:denne )?eiendommen|eiendommen som selges)\b/i.test(prefix + '\n' + previousLine)) return false
      return !(!prefix.trim() && /^[ \t]*(?:sameiet|borettslaget|bygningen|bygget|boligblokken)(?:[ \t]*:|[ \t]+består[ \t]+av)?[ \t]*$/i.test(previousLine))
    })?.[0]
    if (multiMatch && !issues.some(issue => issue.startsWith('Flerboligsignal'))) issues.push(`Flerboligsignal på fysisk PDF-side ${page.pdfPage}: «${normalize(multiMatch)}». Modellen gjelder én enkeltleilighet og estimerer ikke samlet leie for flere boenheter.`)
    const source = (match: RegExpMatchArray): PdfSource => ({ documentHash: outcome.reportHash, documentName: outcome.documentName,
      pdfPage: page.pdfPage, start: match.index!, end: match.index! + match[0].length, quote: match[0], method: 'pdf-text', printedPage: null })
    // Etikett/verdi kan stå på hver sin linje, men en tom etikett får ikke sluke en ny etikett.
    const gap = '(?:[ \\t]*:[ \\t]*(?:\\r?\\n[ \\t]*)?|[ \\t]+|[ \\t]*\\r?\\n[ \\t]*)'
    for (const [label, list] of [['(?:Eiendommens adresse|Adresse og betegnelse|Adresse|Eiendom)', address], ['Bydel', district]] as const) {
      const pattern = new RegExp(`^[ \\t]*${label}${gap}([^\\r\\n:]{2,250})[ \\t]*$`, 'gim')
      for (const match of page.text.matchAll(pattern)) {
        const value = normalize(match[1]!)
        if (brokerContext(page.text, match.index!)) continue
        if (list === address && !addressParts(value)) continue
        if (list !== address && !/^(?:\d+[ \t]+)?[\p{L}][\p{L} .’'/-]*$/iu.test(value)) continue
        add(list, value, source(match))
      }
    }
    // Forsidens tolinjede gateadresse/poststed er objektbevis; kontaktkort filtreres separat.
    if (page.pdfPage === 1) {
      for (const match of page.text.matchAll(/^[ \t]*([^\r\n:]{3,200})\r?\n[ \t]*(\d{4})[ \t]+([\p{L}][\p{L} .’'-]+)[ \t]*$/gmu)) {
        const value = normalize(match[0])
        if (addressParts(value) && !brokerContext(page.text, match.index!)) add(address, value, source(match))
      }
    }
    // Kommune krever en faktisk etikett eller eksplisitt eiendoms-/matrikkelbetegnelse.
    // Løpende tekst som «kommune vedrørende ...» er ingen etikett/verdi.
    for (const match of page.text.matchAll(/^[ \t]*Kommune(?:[ \t]*:[ \t]*(?:\r?\n[ \t]*)?|[ \t]*\r?\n[ \t]*)([^\r\n:]{2,100})[ \t]*$/gim)) {
      if (brokerContext(page.text, match.index!)) continue
      const name = municipalityName(match[1]!)
      if (name) add(municipality, name, source(match))
    }
    for (const match of page.text.matchAll(/^[ \t]*(?:Kommune|KOMMUNE)[ \t]+(\p{Lu}[\p{L} .’'-]{1,80})[ \t]*$/gmu)) {
      if (brokerContext(page.text, match.index!)) continue
      const name = municipalityName(match[1]!)
      if (name) add(municipality, name, source(match))
    }
    for (const match of page.text.matchAll(/\b(?:Gårdsnummer|gnr\.?)[^\r\n]{0,150}\bi[ \t]+([\p{L}][\p{L} .’'-]{1,80}?)[ \t]*(?:\r?\n[ \t]*)?kommune\b/giu)) {
      if (brokerContext(page.text, match.index!)) continue
      const name = municipalityName(match[1]!)
      if (name) add(municipality, name, source(match))
    }
    for (const match of page.text.matchAll(new RegExp(`^[ \\t]*(?:Antall rom|Rom)${gap}(-?\\d+(?:[,.]\\d+)?)[ \\t]*$`, 'gim'))) {
      const value = Number(match[1]!.replace(',', '.'))
      if (Number.isInteger(value) && value >= 1 && value <= 20) add(rooms, value, source(match))
      else issues.push(`Ugyldig romantall på fysisk PDF-side ${page.pdfPage}: «${normalize(match[0]).slice(0, 300)}». Motstrid må avklares.`)
    }
    for (const match of page.text.matchAll(new RegExp(`^[ \\t]*(?:Antall soverom|Soverom)${gap}(-?\\d+(?:[,.]\\d+)?)[ \\t]*$`, 'gim'))) {
      const value = Number(match[1]!.replace(',', '.'))
      if (Number.isInteger(value) && value >= 0 && value <= 20) add(bedrooms, value, source(match))
      else issues.push(`Ugyldig antall soverom på fysisk PDF-side ${page.pdfPage}: «${normalize(match[0]).slice(0, 300)}». Motstrid må avklares.`)
    }
    for (const match of page.text.matchAll(/\b(\d{1,2})[ \t]*[-–]?[ \t]*roms(?:(?:selveier|andels|aksje|eier)?leilighet|[ \t]+(?:selveier|andels|aksje|eier)?leilighet)?\b/gi)) {
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
    for (const match of page.text.matchAll(new RegExp(`^[ \\t]*(Boligtype(?:[ \\t]*(?:/|og)[ \\t]*eierform)?|Type bolig|Salgsobjekt)${gap}([^\\r\\n:]{1,250})[ \\t]*$`, 'gim'))) {
      const combinedOwner = /(?:\/|og)[ \t]*eierform$/i.test(match[1]!)
      const valueWithOwner = normalize(match[2]!)
      const parts = (combinedOwner ? valueWithOwner.replace(/[ \t]+\((?:eiet|selveier|eierseksjon|borettslag|andel|aksje)\)$/i, '') : valueWithOwner).split(/\s*\/\s*/)
      const validOwner = combinedOwner && parts.length === 2 && /^(?:eiet|selveier|eierseksjon|borettslag|andel|aksje)$/i.test(parts[1]!)
      if (parts.length > 1 && !validOwner) {
        issues.push(`Uavklart boligtype på fysisk PDF-side ${page.pdfPage}: «${normalize(match[0])}». Flere klassifikasjoner kan ikke behandles som én leilighet.`)
        continue
      }
      const value = parts[0]!
      if (/^(?:leilighet|selveierleilighet|andelsleilighet|aksjeleilighet|eierleilighet)(?:[ \t]*[,.].*)?$/i.test(value)) add(types, 'apartment', source(match))
      else if (/^(?:enebolig|tomannsbolig|rekkehus|fritidsbolig|hybel|bygård|utleiegård|flermannsbolig)(?:[ \t]*[,.].*)?$/i.test(value)) add(types, 'unsupported', source(match))
      else issues.push(`Uavklart boligtype på fysisk PDF-side ${page.pdfPage}: «${normalize(match[0])}». Klassifikasjonen må kontrolleres.`)
    }
    const internalLabel = 'BRA[ \\t]*[-\\u2010-\\u2015\\u2212][ \\t]*i'
    const markers = [
      ...[...page.text.matchAll(/BRUKSAREAL[ \t]+FORDELT[ \t]+PÅ[ \t]+ETASJE/gi)].map(match => ({ start: match.index!, floor: true })),
      ...[...page.text.matchAll(/(?:AREAL[ \t]+TOTALT|TOTALT[ \t]+(?:BRUKSAREAL|BRA)|SAMLET[ \t]+BRUKSAREAL)/gi)].map(match => ({ start: match.index!, floor: false })),
      ...[...page.text.matchAll(new RegExp(`^[ \\t]*${internalLabel}[ \\t]*/[ \\t]*BRA[ \\t]+TOTALT?`, 'gim'))].map(match => ({ start: match.index!, floor: false })),
    ].sort((a, b) => a.start - b.start)
    const floorArea = (position: number) => markers.findLast(marker => marker.start <= position)?.floor ?? floorSection
    const areaLabels: Record<keyof typeof areas, string> = {
      'BRA-i': `(?:Internt bruksareal(?:[ \\t]*\\(${internalLabel}\\))?|${internalLabel})`,
      BRA: '(?:Bruksareal(?:[ \\t]*\\(BRA\\))?|BRA)',
      'P-ROM': '(?:Primærrom(?:[ \\t]*\\(P-ROM\\))?|P-ROM)',
    }
    const compactArea = new RegExp(`^[ \\t]*${internalLabel}[ \\t]*/[ \\t]*BRA[ \\t]+TOTALT?${gap}(-?\\d+(?:[,.]\\d+)?)[ \\t]*/[ \\t]*(-?\\d+(?:[,.]\\d+)?)[ \\t]*(?:m²|m2|kvm)[ \\t]*$`, 'gim')
    for (const match of page.text.matchAll(compactArea)) {
      if (floorArea(match.index!)) continue
      const value = Number(match[1]!.replace(',', '.')), total = Number(match[2]!.replace(',', '.'))
      if (!Number.isFinite(value) || value <= 0 || value > 1000 || !Number.isFinite(total) || total <= 0 || total > 1000) {
        issues.push(`Ugyldig areal (BRA-i/total) på fysisk PDF-side ${page.pdfPage}: «${normalize(match[0]).slice(0, 300)}». Motstrid må avklares.`)
      } else if (value > total) {
        issues.push(`Motstridende areal på fysisk PDF-side ${page.pdfPage}: internt areal overstiger totalen i «${normalize(match[0]).slice(0, 300)}».`)
      } else add(areas['BRA-i'], value, source(match))
    }
    for (const basis of ['BRA-i', 'BRA', 'P-ROM'] as const) {
      const pattern = new RegExp(`^[ \\t]*${areaLabels[basis]}${gap}(-?\\d+(?:[,.]\\d+)?)[ \\t]*(m²|m2|kvm)?(?:[ \\t]*\\([^\\r\\n]*\\))?[ \\t]*$`, 'gim')
      for (const match of page.text.matchAll(pattern)) {
        if (floorArea(match.index!)) continue
        const value = Number(match[1]!.replace(',', '.'))
        if (Number.isFinite(value) && value > 0 && value <= 1000) {
          if (match[2]) add(areas[basis], value, source(match))
        } else issues.push(`Ugyldig areal (${basis}) på fysisk PDF-side ${page.pdfPage}: «${normalize(match[0]).slice(0, 300)}». Motstrid må avklares.`)
      }
    }
    floorSection = markers.at(-1)?.floor ?? floorSection
  }
  const areaBasis = (['BRA-i', 'BRA', 'P-ROM'] as const).find(basis => areas[basis].length > 0)
  const selectedArea = areaBasis ? choose(areas[areaBasis], `areal (${areaBasis})`) : null
  const area = selectedArea && areaBasis ? { ...selectedArea, basis: areaBasis } : null
  const selectedMunicipality = choose(municipality, 'kommuner')
  const verifiedDistricts: Candidate<string>[] = []
  for (const candidate of district) {
    const numbered = /^(\d+)[ \t]+(.+)$/.exec(candidate.value)
    let value = candidate.value
    if (numbered) {
      const registered = /^0?[1-9]$|^1[0-5]$/.test(numbered[1]!) ? OSLO_LEGACY_DISTRICTS_2004_2027[Number(numbered[1]) - 1] : null
      if (key(selectedMunicipality?.value) === 'oslo' && registered && districtNameKey(numbered[2]!) === districtNameKey(registered)) value = numbered[2]!
      else issues.push(`Uavklart nummerert bydel på fysisk PDF-side ${candidate.sources[0]!.pdfPage}: «${candidate.value}». Nummer/navn kan ikke verifiseres mot Oslo-registeret 2004–2027 for dokumentets kommune; originalverdien er beholdt.`)
    }
    for (const source of candidate.sources) add(verifiedDistricts, value, source)
  }
  const result = { documentHash: outcome.reportHash, documentName: outcome.documentName,
    address: choose(address, 'adresser'), municipality: selectedMunicipality, district: choose(verifiedDistricts, 'bydeler'),
    area, rooms: choose(rooms, 'romantall'), bedrooms: choose(bedrooms, 'soverom'), propertyType: choose(types, 'boligtyper'), issues }
  for (const [field, label] of [['address', 'Eiendommens adresse'], ['area', 'Areal'], ['rooms', 'Antall rom'], ['propertyType', 'Boligtype']] as const) {
    if (!result[field]) issues.push(`${label} mangler eller er ikke entydig i det lesbare tekstlaget.`)
  }
  if (result.propertyType?.value === 'unsupported') issues.push('Første leiemodell støtter bare enkeltleiligheter.')
  return RentalPropertySchema.parse(result)
}
