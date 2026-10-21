import { writeFileSync } from 'node:fs'

// Selvstendig, deterministisk PDF-original; leser verken fasit eller adapter.
const pageLines = [
  ['TG3 - fiktiv originalrapport', 'Tre fysiske PDF-sider. Ingen reell eiendom.'],
  ['Elektrisk anlegg - registrert avvik', 'TG3 - Elektrisk anlegg ikke dokumentert'],
  ['Tak - registrert avvik', 'TG3 - Alvorlig lekkasje i tak'],
]
const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Count 3 /Kids [4 0 R 6 0 R 8 0 R] >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']
for (const [index, lines] of pageLines.entries()) {
  const contentId = 5 + index * 2
  const stream = `BT /F1 18 Tf 50 770 Td (${lines[0]}) Tj 0 -45 Td /F1 12 Tf (${lines[1]}) Tj 0 -650 Td (PDF-side ${index + 1} av 3 - Kun fiktive testdata) Tj ET\n`
  objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`)
  objects.push(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`)
}
let pdf = '%PDF-1.7\n'
const offsets = [0]
for (const [index, object] of objects.entries()) {
  offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
}
const xref = Buffer.byteLength(pdf)
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
writeFileSync(new URL('tg3.pdf', import.meta.url), pdf)
