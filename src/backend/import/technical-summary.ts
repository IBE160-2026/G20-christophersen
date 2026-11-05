import { createHash } from 'node:crypto'
import type { ImportBasis } from './local-plan.ts'
import type { PdfSource } from '../../contracts/document-import.ts'
import type { RiskFinding } from '../../contracts/property-risk.ts'

type Line = { text: string; start: number; end: number; page: number }
export function technicalLines(text: string, page: number): Line[] {
  return [...text.matchAll(/[^\r\n]+/gu)].map(match => ({ text: match[0], start: match.index, end: match.index + match[0].length, page }))
}
/** A bounded vocabulary identifies component headings, never assigns a condition grade. */
export function isTechnicalComponent(text: string) {
  const value = text.trim()
  if (!value || value.length > 200 || /[.!?:]$/u.test(value) || /\b(?:er|har|kan|bør|må|skal|anbefales|påvist|registrert|tilfredsstiller|grunnet|basert|mangler|lekker|finnes|foreligger|viser|medfører|fører|svikter|fungerer)\b/iu.test(value)) return false
  const part = value.split(/\s+[>\-−–—‑]\s+/u).at(-1)!.trim()
  const heading = /^(?:tak(?:et|tekking|konstruksjon(?:er)?|vindu(?:er)?|renner)?|loft|nedløp|beslag|skorstein(?:er)?|yttervegger?|veggkonstruksjon|kledning|vinduer?|ytterdører?|dører?|balkongdør|balkong|altan|terrasse|rekkverk|etasjeskiller|bærende konstruksjoner|innvendige dører|overflater|vanntett sjikt|membran|sluk|ventilasjon|avtrekk|sanitærutstyr|innredning|fuktsikring|drenering|grunnmur|fundamenter|utvendige vann|innvendige vann|vannledninger|avløp|elektrisk anlegg|varmtvannsbereder|varmesentral|vannbåren varme|radon|branntekniske forhold|helse, miljø og sikkerhet|tilliggende konstruksjoner|bad(?:et)?)(?:\b|[ /,])/iu
  return heading.test(value) || heading.test(part)
}
function isOtherHeading(text: string) {
  const original = text
  text = text.replace(/^\s*\d+(?:\.\d+)*(?:[.)])?\s+/u, '').replace(/[:.;]\s*$/u, '')
  return (!isTechnicalComponent(text) || text !== original) && /^[A-ZÆØÅ][\p{L} /–—-]{2,100}$/u.test(text)
    && !/^(?:Ingen|Ikke|Det|Dette|Den|De|Et|En|For|Ved|Til|Normal)\b/u.test(text)
    && !/\b(?:er|har|kan|bør|må|skal|anbefales|påvist|registrert|tilfredsstiller|grunnet|basert|mangler|lekker|finnes|foreligger|viser|medfører|fører|svikter|fungerer)\b/iu.test(text)
}
function exactSource(basis: ImportBasis, line: Line, end: number): PdfSource {
  return { documentHash: basis.hash, documentName: basis.name, pdfPage: line.page, start: line.start, end,
    quote: basis.pages[line.page - 1]!.text.slice(line.start, end), printedPage: null, method: 'pdf-text' }
}

/** A summary is a source in its own right; it never enters the report-control findings. */
export function extractTechnicalSummary(basis: ImportBasis): RiskFinding[] {
  const findings: RiskFinding[] = []
  let heading: PdfSource | null = null, grade: 'TG2' | 'TG3' | null = null
  // Only exact repeated footer wording adjacent to the physical page number is
  // ignored. Other unknown text still interrupts an incomplete row.
  const footers = new Map<string, number>()
  for (const page of basis.pages) {
    const lines = technicalLines(page.text, page.pdfPage)
    if (lines.at(-1)?.text.trim() === String(page.pdfPage) && lines.at(-2)) {
      const footer = lines.at(-2)!.text
      footers.set(footer, (footers.get(footer) ?? 0) + 1)
    }
  }
  const lines: Line[] = []
  for (const page of basis.pages) {
    if (page.status !== 'readable') { lines.push({ text: '\u0000', start: 0, end: 0, page: page.pdfPage }); continue }
    const pageLines = technicalLines(page.text, page.pdfPage)
    const footer = pageLines.at(-2)
    const footerKnown = pageLines.at(-1)?.text.trim() === String(page.pdfPage) && footer && (footers.get(footer.text) ?? 0) > 1
    lines.push(...(footerKnown ? pageLines.slice(0, -2) : pageLines))
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!, value = line.text.trim()
    const match = /^Forhold som har fått T\s*G\s*([23])\s*:\s*$/iu.exec(value)
    if (match) { grade = `TG${match[1]}` as 'TG2' | 'TG3'; heading = exactSource(basis, line, line.end); continue }
    if (!grade || !heading) continue
    if (value === '\u0000' || isOtherHeading(value) || /^Forhold som har fått|^(?:SAMMENDRAG|BYGNINGSSAKKYNDIG|TYPE RAPPORT|EGENERKLÆRING|TILSTANDSRAPPORT)\b/iu.test(value)) { grade = null; heading = null; continue }
    if (!isTechnicalComponent(value)) continue
    const body: Line[] = []
    let boundary = false, pureNameBoundary = true
    for (let j = i + 1; j < lines.length; j++) {
      const next = lines[j]!, text = next.text.trim()
      if (/^Konsekvens\s*\/\s*tiltak\s*:/iu.test(text)) { boundary = true; pureNameBoundary = false; break }
      if (isTechnicalComponent(text) || /^Forhold som har fått/iu.test(text)) break
      if (text === '\u0000' || isOtherHeading(text) || /^[A-ZÆØÅ][A-ZÆØÅ /-]{5,}$/u.test(text)) { pureNameBoundary = false; break }
      body.push(next)
      if (body.length > 50 || body.reduce((size, item) => size + item.text.length + 1, 0) > 1900) break
    }
    if (!boundary && body.length || !body.length && !pureNameBoundary) continue
    const nameOnly = body.length === 0
    const description = nameOnly ? value : body.map(item => item.text.trim()).join('\n')
    if (!/[\p{L}]/u.test(description) || description.length > 1900) continue
    const row = [line, ...body], rowSources: PdfSource[] = []
    for (const rowLine of row) {
      const previous = rowSources.at(-1)
      if (previous?.pdfPage === rowLine.page) {
        previous.end = rowLine.end; previous.quote = basis.pages[rowLine.page - 1]!.text.slice(previous.start, previous.end)
      } else rowSources.push(exactSource(basis, rowLine, rowLine.end))
    }
    if (rowSources.some(item => item.quote.length > 2000) || rowSources.length > 11) continue
    const id = createHash('sha256').update(`${basis.hash}:${line.page}:${line.start}:summary`).digest('hex').slice(0, 24)
    findings.push({ id: `technical-summary-${id}`, domain: 'technical', category: 'technical', status: 'documented', grade,
      title: value, component: value, description, evidenceKind: 'summary', sourceQuality: 'readable-text',
      consequence: nameOnly ? 'Sammendraget oppgir bare komponentnavn og tilstandsgrad. Avviksbeskrivelse, omfang og tiltak er ikke kjent.' : 'Opplysningen er gjengitt i salgsoppgavens sammendrag. Rapportens fullstendige avvik, omfang og tiltak er ikke verifisert.',
      action: 'Kontroller den komplette tilstandsrapporten; opplysninger og grader kan avvike mellom sammendrag og rapport. Sammendraget er ikke et bekreftet rapportgrunnlag eller dokumentasjon på full TG-dekning.',
      sources: [...rowSources, heading] })
    if (findings.length >= 200) break
  }
  return findings
}
