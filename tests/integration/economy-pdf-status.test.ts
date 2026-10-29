import { deflateSync } from 'node:zlib'
import { expect, it } from 'vitest'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'
import { extractImport } from '../../src/backend/documents/extract-import.ts'

function pdf(metadata: string, text = true, compressed?: Buffer, profile?: Buffer, raster = false) {
  const content = compressed ?? Buffer.from(text ? 'BT /F1 12 Tf 20 700 Td (Economy 3000 kr) Tj ET' : ' ')
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Count 1 /Kids [4 0 R] >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 3 0 R >> ${raster ? '/XObject << /I 7 0 R >>' : ''} >> /Contents 5 0 R ${metadata} >>`,
    `<< /Length ${content.length} ${compressed ? '/Filter /FlateDecode' : ''} >>\nstream\n${content.toString('latin1')}\nendstream`,
    profile ? `<< /N 3 /Length ${profile.length} >>\nstream\n${profile.toString('latin1')}\nendstream` : 'null',
    '<< /Type /XObject /Subtype /Image /Width 1 /Height 1 /ColorSpace /DeviceGray /BitsPerComponent 8 /Length 1 >>\nstream\nx\nendstream']
  let output = '%PDF-1.7\n'; const offsets = [0]
  for (const [i, object] of objects.entries()) { offsets.push(Buffer.byteLength(output, 'latin1')); output += `${i + 1} 0 obj\n${object}\nendobj\n` }
  const xref = Buffer.byteLength(output, 'latin1')
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(output, 'latin1')
}
async function page(bytes: Buffer) {
  const format = await validatePdf(bytes, 'syntetisk-metadata.pdf', { maxPages: 200 })
  if (format.status !== 'format-validated') throw new Error('format')
  return (await extractImport(format)).pages[0]!
}
const bomDate = Buffer.concat([Buffer.from([0xfe, 0xff]), Buffer.from('D:20261030120000Z', 'utf16le').swap16()]).toString('hex')

it.each([
  `/PieceInfo << /Producer << /LastModified <${bomDate}> >> >>`,
  '/PieceInfo << /Producer << /LastModified (D:20261030120000Z) /Private << /Version (1) >> >> >>',
  '/PieceInfo << /InDesign << /LastModified (D:20261030120000Z) /DocumentID (synthetic) /OriginalDocumentID (synthetic-original) /NumberofPages 1 /PageTransformationMatrixList << /0 [1 0 0 1 0 0] >> /PageUIDList << /0 42 >> /PageWidthList << /0 600 >> >> >>',
  '/Group << /Type /Group /S /Transparency /CS /DeviceRGB /I false /K false >>',
])('gyldig kjent metadata skjuler ikke vanlig tekst: %s', async metadata => {
  expect(await page(pdf(metadata))).toMatchObject({ status: 'readable', text: 'Economy 3000 kr' })
})
it.each([
  `/PieceInfo << /Producer << /LastModified <${bomDate}00> >> >>`,
  '/PieceInfo << /Producer << /LastModified <feff0044003ad800> >> >>',
  '/PieceInfo << /Producer << /LastModified (not-a-date) >> >>',
  '/PieceInfo << /Producer << /LastModified (D:20261030120000Z) /Extra true >> >>',
  '/PieceInfo << /Producer << /LastModified (D:20261030120000Z) /Private << /AP true >> >> >>',
  '/PieceInfo << /InDesign << /LastModified (D:20261030120000Z) /DocumentID 42 >> >>',
  '/PieceInfo << /InDesign << /LastModified (D:20261030120000Z) /PageTransformationMatrixList << /0 [1 0 0 1 0] >> >> >>',
  '/PieceInfo << /InDesign << /LastModified (D:20261030120000Z) /PageUIDList << /0 999 0 R >> >> >>',
  '/PieceInfo 999 0 R', '/Group << /S /Wrong >>', '/Group << /S /Transparency /Extra true >>',
  '/Group << /S /Transparency /CS [/ICCBased 6 0 R] >>', '/AP << >>', '/XFA (unknown)', '/UnknownKey true',
])('feil metadata/ukjent struktur forblir sperret med tekst: %s', async metadata => {
  expect((await page(pdf(metadata))).status).toBe('unknown')
})
it('gyldig faktisk ICC stream/N støttes, feil profil forblir ukjent', async () => {
  const profile = Buffer.alloc(128); profile.writeUInt32BE(128, 0); profile.write('RGB ', 16); profile.write('acsp', 36)
  const metadata = '/Group << /S /Transparency /CS [/ICCBased 6 0 R] >>'
  expect((await page(pdf(metadata, true, undefined, profile))).status).toBe('readable')
  profile.write('CMYK', 16)
  expect((await page(pdf(metadata, true, undefined, profile))).status).toBe('unknown')
})
it('side-AP uten tekst beholder unreadable, med tekst forblir unknown', async () => {
  expect((await page(pdf('/AP << /N 6 0 R >>', false))).status).toBe('unreadable')
  expect((await page(pdf('/AP << /N 6 0 R >>'))).status).toBe('unknown')
})
it('ukjent metadata blir aldri blankbevis og rasteradvarsel bevares', async () => {
  expect((await page(pdf('/Group << /S /Wrong >>', false))).status).toBe('unknown')
  expect(await page(pdf('/PieceInfo 999 0 R', false, undefined, undefined, true))).toMatchObject({ status: 'unknown', rasterUnprocessed: true })
})
it('flate over 1 MiB bevarer fysisk side med konkret grenseårsak, korrupt strøm er fortsatt skadet', async () => {
  const inflated = Buffer.concat([Buffer.from('BT /F1 12 Tf 20 700 Td (Bevart tekst) Tj ET\n'), Buffer.alloc(1024 * 1024, 32)])
  expect(await page(pdf('', true, deflateSync(inflated)))).toMatchObject({ pdfPage: 1, status: 'unknown', text: 'Bevart tekst', reason: expect.stringContaining('1 MiB') })
  const compressed = deflateSync(Buffer.from('BT /F1 12 Tf (A) Tj ET')); compressed[compressed.length - 1] ^= 255
  expect(['incomplete', 'unreadable']).toContain((await page(pdf('', true, compressed))).status)
})
