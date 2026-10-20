"""Reproducible fictional PDFs; Python/reportlab/pillow/pypdf only, no product imports.

Oracle expected.json is handwritten before generation and is never rewritten here.
"""
from pathlib import Path
from hashlib import sha256
import base64
import json
import zlib
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.utils import ImageReader
from PIL import Image, ImageDraw
from pypdf import PdfWriter
from pypdf.generic import ArrayObject, ByteStringObject

ROOT = Path(__file__).resolve().parent


def stream(data, extra=b''):
    return b'<< /Length ' + str(len(data)).encode() + b' ' + extra + b' >>\nstream\n' + data + b'\nendstream'


def write(name, pages, extras=None, catalog_extra=''):
    # Actual leaf objects come first. A complete classic xref makes all defects local
    # to the intended Contents/annotation objects, never an accidentally damaged file.
    objects = [b'<< /Type /Catalog /Pages 2 0 R ' + catalog_extra.encode() + b' >>', b'']
    for attrs in pages:
        objects.append(b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] ' + attrs + b' >>')
    objects[1] = b'<< /Type /Pages /Count ' + str(len(pages)).encode() + b' /Kids [' + b' '.join(f'{n+3} 0 R'.encode() for n in range(len(pages))) + b'] >>'
    objects.extend(extras or [])
    data = b'%PDF-1.7\n%\xe2\xe3\xcf\xd3\n'
    offsets = [0]
    for index, obj in enumerate(objects, 1):
        offsets.append(len(data))
        data += f'{index} 0 obj\n'.encode() + obj + b'\nendobj\n'
    start = len(data)
    data += f'xref\n0 {len(objects)+1}\n0000000000 65535 f \n'.encode()
    data += b''.join(f'{offset:010} 00000 n \n'.encode() for offset in offsets[1:])
    data += f'trailer\n<< /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{start}\n%%EOF\n'.encode()
    (ROOT / name).write_bytes(data)


whitespace = b'\x00\x09\x0a\x0c\x0d\x20'
write('blank-variants.pdf', [b'', b'/Contents []', b'/Contents 9 0 R', b'/Contents 10 0 R', b'/Contents 11 0 R', b'/Contents 12 0 R'], [
    stream(b''), stream(whitespace), stream(zlib.compress(whitespace), b'/Filter /FlateDecode'),
    stream(base64.a85encode(zlib.compress(whitespace)) + b'~>', b'/Filter [/ASCII85Decode /FlateDecode]'),
])
# Six textless originals: vector, photo-like pixels, scanned TG3 pixels, annotation,
# widget/appearance, and a floor-plan vector. No raster text is present as PDF text.
image = Image.new('RGB', (400, 160), '#d3e5e2')
draw = ImageDraw.Draw(image)
draw.rectangle((20, 20, 180, 140), fill='#517f83')
draw.rectangle((210, 30, 380, 130), fill='#bb9977')
scan = Image.new('RGB', (400, 160), 'white')
ImageDraw.Draw(scan).text((20, 50), 'TG3: Skannet lekkasje i tak', fill='black')
image_obj = lambda img: stream(zlib.compress(img.tobytes()), f'/Type /XObject /Subtype /Image /Width {img.width} /Height {img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode'.encode())
write('textless-content.pdf', [
    b'/Contents 9 0 R',
    b'/Contents 10 0 R /Resources << /XObject << /I 11 0 R >> >>',
    b'/Contents 10 0 R /Resources << /XObject << /I 12 0 R >> >>',
    b'/Annots [13 0 R]',
    b'/Annots [14 0 R]',
    b'/Contents 16 0 R',
], [stream(b'100 100 200 200 re f'), stream(b'q 400 0 0 160 50 400 cm /I Do Q'), image_obj(image), image_obj(scan),
    b'<< /Type /Annot /Subtype /Text /Rect [40 40 100 100] /Contents (Fiktiv kommentar) >>',
    b'<< /Type /Annot /Subtype /Widget /FT /Tx /T (felt) /Rect [40 40 180 80] /AP << /N 15 0 R >> >>',
    stream(b'0 0 140 40 re S', b'/Type /XObject /Subtype /Form /BBox [0 0 140 40]'),
    stream(b'50 50 400 600 re S 250 50 m 250 650 l S 50 350 m 450 350 l S'),
])
font = b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
text = b'BT /F1 12 Tf 50 700 Td (Tilstandsgrad: TG2 - Slitt gulv) Tj ET'
write('mixed-status.pdf', [b'/Contents 8 0 R /Resources << /Font << /F1 9 0 R >> >>', b'', b'/Contents 10 0 R',
    b'/Contents 11 0 R', b'/Contents 12 0 R'], [stream(text), font, stream(b'10 10 20 20 re S'),
    stream(b' ', b'/Filter /UnrecognisedFilter'), stream(zlib.compress(whitespace)[:-3], b'/Filter /FlateDecode')])
write('uncertain-content.pdf', [b'/Contents 8 0 R', b'/Annots 999 0 R', b'/Contents 999 0 R', b'/Contents [9 0 R 999 0 R]',
    b'/Contents [10 0 R 11 0 R] /Resources << /Font << /F1 12 0 R >> >>'], [
    stream(b' ', b'/Filter /UnrecognisedFilter'), stream(whitespace), stream(text),
    stream(zlib.compress(whitespace)[:-3], b'/Filter /FlateDecode'), font])
write('readable-blank.pdf', [b'/Contents 5 0 R /Resources << /Font << /F1 6 0 R >> >>', b'/Annots []'], [stream(text), font])
write('structural-content.pdf', [b'/Contents 42', b'/PieceInfo << /Custom << >> >>', b'/AF []', b'/AP << /N 8 0 R >>', b'/Annots 42'],
    [stream(b'10 10 20 20 re S', b'/Type /XObject /Subtype /Form /BBox [0 0 30 30]')])
write('catalog-form.pdf', [b''], [b'<< /Fields [5 0 R] >>', b'<< /FT /Tx /T (Fiktivt felt) /V (TG3) >>'], '/AcroForm 4 0 R')
write('catalog-xfa.pdf', [b''], [b'<< /XFA 5 0 R >>', stream(b'<xfa>Fiktivt skjema</xfa>')], '/AcroForm 4 0 R')
write('catalog-empty-form.pdf', [b''], [b'<< /Fields [] >>'], '/AcroForm 4 0 R')
write('catalog-empty-dict.pdf', [b''], [b'<< >>'], '/AcroForm 4 0 R')
# Graph fixtures exercise page-tree order independently of declared Counts.
write('nested-count.pdf', [b'/Contents 7 0 R /Resources << /Font << /F1 8 0 R >> >>',
    b'/Contents 9 0 R /Resources << /Font << /F1 8 0 R >> >>', b'/Contents 10 0 R /Resources << /Font << /F1 8 0 R >> >>'], [
    b'<< /Type /Pages /Count 1 /Kids [4 0 R 5 0 R] /Parent 2 0 R >>',
    stream(b'BT /F1 12 Tf 50 700 Td (Fysisk side 1) Tj ET'), font,
    stream(b'BT /F1 12 Tf 50 700 Td (Fysisk side 2) Tj ET'),
    stream(b'BT /F1 12 Tf 50 700 Td (Fysisk side 3) Tj ET'),
])
# Replace using known generated object tokens, and regenerate xref through write.
# Reuse the same graph as above, with a nested branch in the root and correct Parents.
# write accepts the root from pages only, so a precise equal-length mutation suffices here.
data = (ROOT / 'nested-count.pdf').read_bytes().replace(b'/Count 3 /Kids [3 0 R 4 0 R 5 0 R]', b'/Count 1 /Kids [3 0 R 6 0 R]      ')
data = data.replace(b'/Type /Page /Parent 2 0 R', b'/Type /Page /Parent 6 0 R', 3)
# First leaf belongs directly to the root; fixed width preserves all xref offsets.
data = data.replace(b'/Type /Page /Parent 6 0 R', b'/Type /Page /Parent 2 0 R', 1)
(ROOT / 'nested-count.pdf').write_bytes(data)

pdf = Canvas(str(ROOT / 'layout.pdf'), pagesize=(600, 800), invariant=1, pageCompression=1)
pdf.setTitle('Fiktiv layoutfasit - Story 2.3')
pdf.setAuthor('IBE160 - fiktive testdata')
pdf.setFont('Helvetica', 12)
pdf.drawString(40, 750, 'Tabell: grad og beskrivelse')
for y, grade, description in [(680, 'TG2', 'Slitt overflate på baderomsgulv'), (620, 'TG3', 'Alvorlig lekkasje i tak')]:
    pdf.rect(35, y-15, 525, 40)
    pdf.line(110, y-15, 110, y+25)
    pdf.drawString(45, y, grade)
    pdf.drawString(125, y, description)
pdf.drawString(40, 540, 'Norske tegn: æ ø å Æ Ø Å')
pdf.showPage()
pdf.setFont('Helvetica', 12)
for x, lines in [(40, ['Venstre kolonne', 'Tilstandsgrad: TG2', 'Råte i vinduskarm']), (320, ['Høyre kolonne', 'Tilstandsgrad: TG3', 'Lekkasje ved pipe'])]:
    for i, line in enumerate(lines): pdf.drawString(x, 720-i*35, line)
pdf.showPage()
pdf.setFont('Helvetica', 12)
for y, line in [(740, 'Tilstandsgrad: TG2'), (710, 'Slitt kledning mot sør'), (680, 'Digital tekst over fiktivt rasterbilde')]: pdf.drawString(40, y, line)
pdf.drawImage(ImageReader(image), 40, 400, width=400, height=160)
pdf.showPage()
pdf.setFont('Helvetica', 12)
pdf.drawString(40, 740, 'A')
pdf.showPage()
pdf.save()
# Deterministic RC4 fixture with an empty user password: PDF.js can open it,
# but raw original stream bytes require decryption before independent validation.
writer = PdfWriter(clone_from=ROOT / 'readable-blank.pdf')
writer._ID = ArrayObject([ByteStringObject(b'IBE160-story23-A'), ByteStringObject(b'IBE160-story23-B')])
writer.encrypt('', owner_password='fictional-fixture-owner', algorithm='RC4-128')
writer.write(ROOT / 'encrypted-content.pdf')
manifest = {path.name: sha256(path.read_bytes()).hexdigest() for path in sorted(ROOT.glob('*.pdf'))}
(ROOT / 'sha256.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(f'Generated {len(manifest)} PDFs without reading the oracle')
