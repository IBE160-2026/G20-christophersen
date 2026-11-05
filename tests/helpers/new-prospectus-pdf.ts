/** New synthetic text-layer PDF for isolation tests, outside the offline registry.
 * Test values are document content, never replacement application data. */
export function newProspectusPdf(lines: string[], options: { optionalContent?: boolean; paintingPath?: 'pattern' | 'type3' | 'soft-mask' | 'gstate-font'; invokePaintingPath?: boolean; layerUse?: 'text' | 'form' | 'orphan-form' | 'unresolved' | 'cycle' | 'image' } = {}): Buffer {
  const literal = (line: string) => [...line].map(char => {
    const code = char.charCodeAt(0)
    if (code > 255) throw new Error('Testfont requires WinAnsi text')
    return code > 126 || ['(', ')', '\\'].includes(char) ? `\\${code.toString(8).padStart(3, '0')}` : char
  }).join('')
  const text = `BT /F1 11 Tf 20 TL 35 755 Td ${lines.map((line, index) => `${index ? 'T* ' : ''}(${literal(line)}) Tj`).join('\n')} ET`
  const layer = options.layerUse
  const painting = options.invokePaintingPath ? options.paintingPath === 'pattern' ? ' /Pattern cs /P1 scn' : options.paintingPath === 'type3' ? ' BT /F2 11 Tf ET' : options.paintingPath === 'gstate-font' ? ' /GS1 gs BT 35 720 Td (A) Tj ET ' : ' /GS1 gs' : ''
  const stream = painting + (layer === 'text' ? `/OC /Layer BDC ${text} EMC` : layer ? `${text} /Nested Do` : text)
  const resource = options.paintingPath === 'pattern' ? '/Pattern << /P1 7 0 R >>' : options.paintingPath === 'type3' ? '/Font << /F2 7 0 R /F1 3 0 R >>' : (options.paintingPath === 'soft-mask' || options.paintingPath === 'gstate-font') ? '/ExtGState << /GS1 7 0 R >>' : layer === 'text' ? '/Properties << /Layer 6 0 R >>' : layer === 'unresolved' ? '/XObject << /Nested 99 0 R >>' : layer ? '/XObject << /Nested 7 0 R >>' : ''
  const objects = [
    options.optionalContent ? '<< /Type /Catalog /Pages 2 0 R /OCProperties << /OCGs [6 0 R] /D << /Order [6 0 R] /BaseState /ON >> >> >>' : '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Count 1 /Kids [4 0 R] >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 3 0 R >> ${resource} >> /Contents 5 0 R >>`,
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ]
  if (options.optionalContent || layer || options.paintingPath) objects.push('<< /Type /OCG /Name (Optional text layer) >>')
  if (layer === 'image') objects.push('<< /Type /XObject /Subtype /Image /OC 6 0 R /Width 1 /Height 1 /ColorSpace /DeviceGray /BitsPerComponent 8 /Length 1 >>\nstream\nX\nendstream')
  else if (layer && layer !== 'text' && layer !== 'unresolved') {
    const body = layer === 'cycle' ? '/Nested Do' : layer === 'orphan-form' ? '/OC /Unknown BDC EMC' : '/OC /Layer BDC EMC'
    const resources = layer === 'cycle' ? '/XObject << /Nested 7 0 R >>' : layer === 'orphan-form' ? '/Properties << /Unknown << /Type /OCG /Name (Undeclared) >> >>' : '/Properties << /Layer 6 0 R >>'
    objects.push(`<< /Type /XObject /Subtype /Form /BBox [0 0 1 1] /Resources << ${resources} >> /Length ${Buffer.byteLength(body)} >>\nstream\n${body}\nendstream`)
  }
  if (options.paintingPath === 'pattern') objects.push('<< /Type /Pattern /PatternType 1 /Length 17 >>\nstream\n/OC /Layer BDC EMC\nendstream')
  if (options.paintingPath === 'type3') objects.push('<< /Type /Font /Subtype /Type3 /CharProcs << /A 8 0 R >> >>', '<< /Length 17 >>\nstream\n/OC /Layer BDC EMC\nendstream')
  if (options.paintingPath === 'soft-mask') objects.push('<< /Type /ExtGState /SMask << /S /Alpha /G 8 0 R >> >>', '<< /Type /XObject /Subtype /Form /BBox [0 0 1 1] /OC 6 0 R /Length 0 >>\nstream\n\nendstream')
  if (options.paintingPath === 'gstate-font') {
    const glyph = '1000 0 d0 /OC /Layer BDC 0 0 1000 1000 re f EMC'
    objects.push('<< /Type /ExtGState /Font [8 0 R 11] >>',
      '<< /Type /Font /Subtype /Type3 /FontBBox [0 0 1000 1000] /FontMatrix [0.001 0 0 0.001 0 0] /FirstChar 65 /LastChar 65 /Widths [1000] /Encoding << /Type /Encoding /Differences [65 /A] >> /CharProcs << /A 9 0 R >> /Resources << /Properties << /Layer 6 0 R >> >> >>',
      `<< /Length ${Buffer.byteLength(glyph)} >>\nstream\n${glyph}\nendstream`)
  }
  let pdf = '%PDF-1.7\n'; const offsets = [0]
  for (const [index, object] of objects.entries()) { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n` }
  const xref = Buffer.byteLength(pdf)
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(pdf)
}
