import { createHash } from 'node:crypto'
import type { ImportBasis } from './local-plan.ts'
import { RiskAnalysisSchema } from '../../contracts/property-risk.ts'
import type { RiskAnalysis, RiskFinding } from '../../contracts/property-risk.ts'

type Rule = Pick<RiskFinding, 'category' | 'title' | 'consequence' | 'action'> & {
  pattern: RegExp; status: RiskFinding['status']; exclude?: RegExp
}
const rules: Rule[] = [
  {
    category: 'rental-approval', title: 'Utleieenhet er ikke godkjent', status: 'documented',
    pattern: /(?:utleid\w*|utleie\w*|leilighet\w*|boenhet\w*|bruksenhet\w*).{0,160}ikke\s+(?:er\s+)?godkjent|ikke\s+(?:er\s+)?godkjent.{0,140}(?:utleie\w*|leilighet\w*|boenhet\w*|bruksenhet\w*)/i,
    exclude: /ikke\s+(?:dokumentert|dokumentasjon|kjent)|ingen\s+dokumentasjon|kan\s+ikke\s+bekrefte/i,
    consequence: 'Dokumentet beskriver manglende godkjenning. Dette kan påvirke planlagt bruk og leiegrunnlag; det fastslår ikke et generelt utleieforbud.',
    action: 'Kontroller godkjent bruk og enhetsinndeling mot kommunens byggesak og avklar konsekvensene før leieinntekten legges til grunn.',
  },
  {
    category: 'use-approval', title: 'Bruk eller tiltak er omtalt som ulovlig', status: 'documented',
    pattern: /(?:avvikene|forholdet|tiltaket|bruken|utleien|boenheten).{0,100}(?:anses som lovlighetsmang|er (?:en )?lovlighetsmang|er ulovlig)|(?:avdekket|påvist|registrert)\s+ulovlig\s+(?:bruk|utleie|tiltak)/i,
    consequence: 'Dokumentet beskriver et konkret lovlighetsavvik. Omfang, godkjenning og eventuelle tiltak må avklares.',
    action: 'Innhent byggesaksdokumenter og avklaring fra megler eller kommunen om det konkrete forholdet.',
  },
  {
    category: 'use-approval', title: 'Godkjenning eller brukstillatelse må kontrolleres', status: 'possible',
    pattern: /(?:ikke|ingen|hverken|verken|mangler).{0,100}(?:dokumentasjon.{0,60}godkjent|ferdigattest|midlertidig brukstillatelse)|(?:ferdigattest|midlertidig brukstillatelse).{0,60}(?:mangler|foreligger ikke)|(?:bruksendring\w*|endringene|tiltaket).{0,70}(?:ikke dokumentert|mangler godkjenning)|uten\s+(?:dokumentert\s+)?(?:godkjenning|brukstillatelse)/i,
    exclude: /(?:ikke\s+utstedes|utstedes\s+(?:derfor\s+)?ikke).{0,40}ferdigattest|(?:betyr|innebærer).{0,30}ikke|ikke en generell ferdigattest/i,
    consequence: 'Manglende dokumentasjon er et kontrollbehov. Det beviser ikke alene at dagens bruk er ulovlig.',
    action: 'Kontroller tiltakets alder, godkjente tegninger og tilgjengelige tillatelser i kommunens byggesaksarkiv.',
  },
  {
    category: 'use-approval', title: 'Ferdigattest: gjenstående arbeider', status: 'documented',
    pattern: /gjenstår\s+(?:[\p{L}-]+\s+){0,8}arbeider\s+før\s+ferdigattest/iu,
    consequence: 'Dokumentet oppgir gjenstående arbeider før ferdigattest. Omfang, ansvar og mulig kostnad må avklares.',
    action: 'Kontroller vilkårene i brukstillatelsen og hvilke arbeider som gjenstår. En midlertidig brukstillatelse er ikke i seg selv et forbud mot bruk.',
  },
  {
    category: 'rental-restriction', title: 'Dokumentert begrensning i utleie', status: 'documented',
    pattern: /(?:utleie|fremleie|korttidsutleie).{0,100}(?:ikke tillatt|forbudt|krever (?:styrets )?(?:samtykke|godkjenning)|begrenset til|maksimalt)|korttidsutleie.{0,80}tillatt\s+i\s+(?:inntil|opptil)\s+\d+\s+døgn|(?:forbud mot|begrensninger i|krav om samtykke.{0,20}ved).{0,60}(?:utleie|fremleie)|(?:boligen|boenheten|leiligheten|eiendommen|rommet).{0,80}(?:kan|må) ikke leies ut|ikke adgang til (?:utleie|fremleie)|ikke\s+tillatt\s+å\s+leie\s+ut/i,
    exclude: /ikke\s+(?:kjent|forbud|begrensninger)|ingen\s+(?:kjente\s+)?begrensninger|ikke.{0,50}til hinder/i,
    consequence: 'Den oppgitte begrensningen kan påvirke utleieformen eller antall utleiedøgn og dermed leieforutsetningene.',
    action: 'Les hele bestemmelsen og kontroller gyldige vedtekter, avtaler eller tillatelser før planlagt utleie.',
  },
  {
    category: 'easement', title: 'Dokumentert bruksbegrensning', status: 'documented',
    pattern: /(?:tinglyst|på eiendommen|på tomten).{0,80}(?:byggeforbud|forbud mot (?:bebyggelse|næringsvirksomhet))|(?:byggeforbud|forbud mot (?:bebyggelse|næringsvirksomhet)).{0,80}(?:tinglyst|på eiendommen|på tomten)/i,
    exclude: /(?:ikke|ingen).{0,25}(?:byggeforbud|forbud mot)/i,
    consequence: 'Dokumentet omtaler en konkret begrensning som kan påvirke planlagte tiltak eller bruk av eiendommen.',
    action: 'Les bestemmelsen i originaldokumentet og avklar omfanget for planlagt bruk før beslutning.',
  },
  {
    category: 'easement', title: 'Servitutt eller bruksrett krever kontroll', status: 'possible',
    pattern: /\bservitutt\w*\b|\b(?:tinglyst\w*\s+)?(?:bruksrett|veirett|adkomstrett)\b|\b(?:erklæring|avtale).{0,30}(?:adkomst|bebyggelse|byggeforbud)/i,
    exclude: /(?:ingen|ikke\s+(?:registrert|tinglyst|kjent))\s+(?:kjente\s+|registrerte\s+)?(?:servitutter|bruksretter|veiretter)|(?:utskrift|kopi|bestilling).{0,40}servitutt/i,
    consequence: 'En omtalt rettighet er ikke nødvendigvis et problem. Den kan gi rettigheter eller plikter som påvirker bruk, vedlikehold eller fremtidige tiltak.',
    action: 'Les det tinglyste originaldokumentet og avklar hvem rettigheten gjelder og hvilke plikter som følger.',
  },
]

const capitalized = (text: string) => text[0]!.toLocaleUpperCase('nb-NO') + text.slice(1)
/** Labels summarize the matched clause only. Nearby rooms never supply identity. */
function legalTitle(rule: Rule, clause: string, uncertain: boolean) {
  // «Som egen boenhet» describes the missing approval, not a second room.
  const namingText = clause.replace(/\bikke\s+(?:er\s+)?godkjent\b.*$/iu, '')
  const subject = [...namingText.matchAll(/\b(?:loftstue\w*|soverom\w*|kjeller(?:en)?|underetasj\w*|utleiedel\w*|utleieenhet\w*|boenhet\w*|bruksenhet\w*|tilbygg\w*)\b(?:\s+i\s+(?:kjeller\w*|underetasj\w*|loft\w*|\d+\.?\s+etasje))?/giu)]
  const names = [...new Set(subject.map(match => match[0].toLocaleLowerCase('nb-NO')))]
  const room = names.length === 1 ? capitalized(names[0]!) : null
  if (rule.category === 'rental-approval' && room) return `${room}: ${uncertain ? 'godkjenning er uavklart' : 'ikke godkjent'}`
  if (rule.category === 'use-approval') {
    if (/gjenstår\s+(?:[\p{L}-]+\s+){0,8}arbeider\s+før\s+ferdigattest/iu.test(clause)) return rule.title
    const qualifier = room ? `${room}: ` : ''
    if (/lovlighetsmang|ulovlig/iu.test(clause)) return `${qualifier}${uncertain ? 'mulig lovlighetsavvik' : 'dokumentert lovlighetsavvik'}`
    if (/ferdigattest/iu.test(clause) && /brukstillatelse/iu.test(clause)) return `${qualifier}ferdigattest og brukstillatelse er uavklart`
    if (/ferdigattest/iu.test(clause)) return `${qualifier}ferdigattest er ${uncertain ? 'uavklart' : 'ikke dokumentert'}`
    if (/brukstillatelse/iu.test(clause)) return `${qualifier}brukstillatelse er ${uncertain ? 'uavklart' : 'ikke dokumentert'}`
    return `${qualifier}godkjenning er ${uncertain ? 'uavklart' : 'ikke dokumentert'}`
  }
  if (rule.category === 'rental-restriction') {
    const days = /korttidsutleie.{0,100}(?:inntil|opptil|maksimalt|begrenset til)\s+(\d+)\s+døgn/iu.exec(clause)
    if (days) return `Korttidsutleie: ${uncertain ? 'mulig grense på' : 'inntil'} ${days[1]} døgn`
    if (/formidlingstjenester/iu.test(clause)) return 'Utleie via formidlingstjenester er ikke tillatt'
    if (/samtykke|godkjenning/iu.test(clause)) return `Utleie krever ${/styrets/iu.test(clause) ? 'styrets ' : ''}${/samtykke/iu.test(clause) ? 'samtykke' : 'godkjenning'}`
    if (/(?:kan|må) ikke leies ut|ikke adgang til/iu.test(clause)) return `${room ?? 'Boligen'} kan ikke leies ut`
  }
  if (rule.category === 'easement') {
    if (/adkomstrett.{0,60}drift og vedlikehold/iu.test(clause)) return 'Adkomstrett for drift og vedlikehold av anlegg'
    if (/adkomstrett/iu.test(clause)) return `${/tinglyst/iu.test(clause) ? 'Tinglyst adkomstrett' : 'Adkomstrett'}: omfang må kontrolleres`
    if (/veirett/iu.test(clause)) return 'Veirett: rettigheter og plikter må kontrolleres'
    if (/avgivereiendommen/iu.test(clause)) return 'Eldre servitutter: henvisning til avgivereiendommen'
    if (/byggeforbud/iu.test(clause)) return `${uncertain ? 'Mulig byggeforbud' : /tinglyst/iu.test(clause) ? 'Tinglyst byggeforbud' : 'Byggeforbud'} på eiendommen`
  }
  return uncertain && rule.status === 'documented' ? 'Mulig begrensning krever kontroll' : rule.title
}

/** Kun støttede tekstlige formuleringer. Ingen lovtolkning, modell eller nettverkskall. */
export function analyzeLegalRisks(basis: ImportBasis): RiskAnalysis {
  const findings: RiskFinding[] = [], examinedPages: number[] = [], unreadPages: number[] = []
  let overflow = false
  for (const page of basis.pages) {
    if (!['readable', 'blank'].includes(page.status) || page.rasterUnprocessed) unreadPages.push(page.pdfPage)
    if (page.status !== 'readable') continue
    examinedPages.push(page.pdfPage)
    // PDF-linjeskift er ikke setningsgrenser. Kildens originale tekst og offseter beholdes.
    for (const sentence of page.text.matchAll(/[^.!?]+(?:[.!?](?=\s|$)|$)/gu)) {
      const leading = sentence[0].length - sentence[0].trimStart().length
      const start = sentence.index + leading, text = sentence[0].trim()
      // A seller-form question is not a positive claim, even when an answer
      // elsewhere is affirmative. The answer needs its own linked evidence.
      if (!text || text.endsWith('?') || /^\d*\s*(?:Kjenner du til|Har du|Er det)\b/iu.test(text)) continue
      // A denial or hypothetical in one clause must not classify a different
      // explicit claim in another. Preserve the complete original sentence.
      const clauses = text.replace(/\s+/gu, ' ').split(/;\s*|,\s*men\s+|\s+men\s+/i)
      const approvedLater = /\b(?:var|tidligere)\b.{0,100}ikke\s+godkjent/i.test(text)
        && /\b(?:er|ble)\s+(?:nå|senere)\s+godkjent/i.test(text)
      for (const rule of rules) {
        const matched = clauses.find(clause => rule.pattern.test(clause) && !rule.exclude?.test(clause)
          && !/ikke\s+(?:slik|tilfellet)\s+at|ikke\s+(?:påvist|avdekket|registrert)\s+ulovlig/i.test(clause))
        if (!matched || approvedLater && rule.category === 'rental-approval') continue
        if (text.length > 2000 || findings.length >= 200) { overflow = true; continue }
        const uncertain = /\b(?:hvis|dersom|mulig|usikkert)\b|kan\s+(?:være|foreligge)|kan ikke garantere/i.test(matched)
        const id = 'legal-' + createHash('sha256').update(`${basis.hash}:${page.pdfPage}:${start}:${rule.category}`).digest('hex').slice(0, 24)
        if (findings.some(finding => finding.id === id)) continue
        const title = legalTitle(rule, matched, uncertain)
        findings.push({
          id, domain: 'legal', category: rule.category, title: capitalized(uncertain && !/mulig|uavklart/iu.test(title) ? `Uavklart: ${title}` : title),
          description: text, status: uncertain ? 'possible' : rule.status, consequence: rule.consequence, action: rule.action, grade: null,
          sources: [{ documentHash: basis.hash, documentName: basis.name, pdfPage: page.pdfPage,
            quote: text, start, end: start + text.length, method: 'pdf-text', printedPage: null }],
        })
      }
    }
  }
  const limitations = [
    'Delvis lokalt regelsøk i lesbar dokumenttekst. Ingen full juridisk kontroll; fravær av treff betyr ikke at forhold er avklart.',
    'Kommunens byggesaksarkiv, grunnbok og underliggende avtaler er ikke kontrollert eksternt. Utleierett og godkjent bruk må kontrolleres separat.',
    'Generelle bestemmelser og ukjente formuleringer kan falle utenfor de lokale søkereglene.',
  ]
  if (unreadPages.length) limitations.push('Uleste eller ufullstendige sider og ubehandlet grafisk innhold kan inneholde juridiske opplysninger.')
  if (basis.attachments.length) limitations.push('Innebygde vedlegg er ikke undersøkt i det juridiske regelsøket.')
  if (overflow) limitations.push('Kilde- eller funngrensen er nådd. Ytterligere treff må undersøkes manuelt.')
  return RiskAnalysisSchema.parse({ method: 'local-rules-1', coverage: examinedPages.length ? 'partial' : 'unavailable', examinedPages, unreadPages, findings, limitations })
}
