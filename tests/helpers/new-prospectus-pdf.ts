/** New synthetic text-layer PDF for isolation tests, outside the offline registry.
 * Test values are document content, never replacement application data. */
export function newProspectusPdf(lines: string[]): Buffer {
  const literal = (line: string) => [...line].map(char => {
    const code = char.charCodeAt(0)
    if (code > 255) throw new Error('Testfont requires WinAnsi text')
    return code > 126 || ['(', ')', '\\'].includes(char) ? `\\${code.toString(8).padStart(3, '0')}` : char
  }).join('')
  const stream = `BT /F1 11 Tf 20 TL 35 755 Td ${lines.map((line, index) => `${index ? 'T* ' : ''}(${literal(line)}) Tj`).join('\n')} ET`
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Count 1 /Kids [4 0 R] >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 3 0 R >> >> /Contents 5 0 R >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ]
  let pdf = '%PDF-1.7\n'; const offsets = [0]
  for (const [index, object] of objects.entries()) { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n` }
  const xref = Buffer.byteLength(pdf)
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(pdf)
}
