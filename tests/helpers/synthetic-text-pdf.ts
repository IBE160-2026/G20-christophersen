/** Minimal synthetic PDFs held only in memory; no customer data or PDF library. */
export function syntheticTextPdf(lengths: number[]): Buffer {
  const objects: string[] = ['<< /Type /Catalog /Pages 2 0 R >>', '', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']
  const kids: string[] = []
  for (const length of lengths) {
    const page = objects.length + 1, content = page + 1
    kids.push(`${page} 0 R`)
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 3 0 R >> >> /Contents ${content} 0 R >>`)
    const text = `BT /F1 0.001 Tf 10 700 Td (${'x'.repeat(length)}) Tj ET`
    objects.push(`<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}\nendstream`)
  }
  objects[1] = `<< /Type /Pages /Count ${lengths.length} /Kids [${kids.join(' ')}] >>`
  let pdf = '%PDF-1.7\n', offsets = [0]
  for (let index = 0; index < objects.length; index++) { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n` }
  const xref = Buffer.byteLength(pdf)
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(pdf)
}
