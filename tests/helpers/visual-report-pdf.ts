/** Fiktivt to-kolonne-rapportark. Farger/posisjoner er generiske, ingen kundedata. */
export function visualReportPdf(options: { monochrome?: boolean; closeHeading?: boolean; inlineHeading?: boolean; darkRed?: boolean } = {}): Buffer {
  const streams: string[] = []
  const text = (x: number, y: number, content: string, size = 10, white = false) => `${white ? '1 1 1' : '0 0 0'} rg BT /F1 ${size} Tf ${x} ${y} Td (${content}) Tj ET`
  const block = (x: number, y: number, grade: string, name: string, color: string, description: string) => [
    ...(options.inlineHeading ? [text(x, y + 3, `${grade} ${name}`, 11)] : [`${color} rg ${x} ${y} 40 14 re f`, text(x + 12, y + 3, grade, 9, true), text(x + (options.closeHeading ? 44 : 67), y + 3, name, 11)]),
    text(x, y - 27, 'Beskrivelse'), text(x, y - 45, 'Fiktiv bygningsdel i test.'),
    text(x, y - 70, 'Vurdering av avvik:'), text(x, y - 88, description),
    text(x, y - 112, 'Konsekvens/tiltak'), text(x, y - 130, 'Kontroller forholdet.'),
  ].join('\n')
  streams.push(block(45, 700, 'TG3', 'Grunnmur', options.monochrome ? '0.2 0.2 0.2' : options.darkRed ? '0.7 0 0' : '0.9 0.15 0.1', 'Det er registrert brudd i muren.'))
  streams.push(block(330, 700, 'TG2', 'Tak', options.monochrome ? '0.2 0.2 0.2' : '1 0.45 0.05', 'Det er registrert skader i taket.'))
  streams.push(block(45, 400, 'TG1', 'Ventilasjon', options.monochrome ? '0.2 0.2 0.2' : '0.45 0.75 0.18', 'Ingen avvik er registrert.'))
  // Fargede skilt og avvik er utilstrekkelig uten eksplisitt gradtekst.
  streams.push(block(330, 400, '', 'Vinduer', options.monochrome ? '0.2 0.2 0.2' : '1 0.45 0.05', 'Det er registrert sprekker.'))
  const stream = streams.join('\n')
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [4 0 R] /Count 1 >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 3 0 R >> >> /Contents 5 0 R >>', `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`]
  let pdf = '%PDF-1.7\n'; const offsets = [0]
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n` })
  const xref = Buffer.byteLength(pdf)
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(pdf)
}
