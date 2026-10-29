/** Small deterministic text PDF for the independent code-first oracle; contains no customer data. */
export function codeFirstPdf(pages: string[]): Buffer {
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>']
  const kids: string[] = []
  const escape = (text: string) => [...text].map(character => /[\\()]/.test(character) ? '\\' + character : character.charCodeAt(0) > 126 ? '\\' + character.charCodeAt(0).toString(8).padStart(3, '0') : character).join('')
  for (const text of pages) {
    const page = objects.length + 1, content = page + 1
    kids.push(`${page} 0 R`)
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 3 0 R >> >> /Contents ${content} 0 R >>`)
    const stream = `BT /F1 8 Tf 20 780 Td 12 TL\n${text.split('\n').filter(Boolean).map(line => `(${escape(line)}) Tj T*`).join('\n')}\nET`
    objects.push(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`)
  }
  objects[1] = `<< /Type /Pages /Count ${pages.length} /Kids [${kids.join(' ')}] >>`
  let pdf = '%PDF-1.7\n'; const offsets = [0]
  for (const [index, object] of objects.entries()) { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n` }
  const xref = Buffer.byteLength(pdf)
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(pdf)
}
