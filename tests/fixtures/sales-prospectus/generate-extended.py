"""Kun nye syntetiske originaler. Bevarer opprinnelig generator/fasit/13 PDF-er."""
from pathlib import Path
from io import BytesIO
import json
from hashlib import sha256
from reportlab.pdfgen.canvas import Canvas
from pypdf import PdfReader, PdfWriter
ROOT = Path(__file__).resolve().parent

def overlay(page, lines):
    content = BytesIO()
    pdf = Canvas(content, pagesize=(600, 800), invariant=1)
    pdf.setFont('Helvetica', 11)
    for index, line in enumerate(lines):
        pdf.drawString(35, 50 + index * 18, line)
    pdf.save()
    page.merge_page(PdfReader(BytesIO(content.getvalue())).pages[0])

def write(source, target, changes):
    writer = PdfWriter(clone_from=ROOT / source)
    for page, lines in changes.items():
        overlay(writer.pages[page - 1], lines)
    with (ROOT / target).open('wb') as handle:
        writer.write(handle)

write('text-200.pdf', 'bounded-200.pdf', {1: ['Adresse: Eksempelveien 1, 0001 Testby'],5: ['Adresse: Eksempelveien 1, 0001 Testby'],12: ['TILSTANDSRAPPORT - SLUTT'],13: ['RESTEN ER SALGSOPPGAVE: boligfoto og markedsinformasjon, ingen rapport.']})
write('scanned-report-12.pdf', 'raster-footer-12.pdf', {10: ['Digital bunntekst: trykt side 6. Rasterrapporten er ikke lest.']})
write('text-30.pdf', 'ambiguous-12.pdf', {11: ['TILSTANDSRAPPORT - START: rapport nummer to.']})
# Begrens originalen til 12 sider; begge rapportstarter er fortsatt til stede.
reader = PdfReader(ROOT / 'ambiguous-12.pdf')
writer = PdfWriter()
for page in reader.pages[:12]: writer.add_page(page)
with (ROOT / 'ambiguous-12.pdf').open('wb') as handle: writer.write(handle)
write('separate-report-4.pdf', 'wrong-property-report-4.pdf', {1: ['Adresse: Annenveien 9, 0002 Testby']})
# A small raster logo beside readable economy text must not discard that text.
from PIL import Image
from reportlab.lib.utils import ImageReader
writer = PdfWriter(clone_from=ROOT / 'mixed-12.pdf')
content = BytesIO()
pdf = Canvas(content, pagesize=(600, 800), invariant=1)
pdf.drawImage(ImageReader(Image.new('RGB', (20, 20), '#547c76')), 545, 730, width=20, height=20)
pdf.save()
writer.pages[0].merge_page(PdfReader(BytesIO(content.getvalue())).pages[0])
with (ROOT / 'logo-economy-12.pdf').open('wb') as handle: writer.write(handle)
# Real inline images use BI/ID/EI, with no image XObjects in either tested page.
from pypdf.generic import DecodedStreamObject, NameObject
from PIL import ImageDraw
writer = PdfWriter(clone_from=ROOT / 'mixed-12.pdf')
image = Image.new('RGB', (200, 60), 'white')
ImageDraw.Draw(image).text((5, 15), 'TG3: lekkasje i tak', fill='black')
inline = b'q 500 0 0 150 40 350 cm BI /W 200 /H 60 /CS /RGB /BPC 8 /F /AHx ID\n' + image.tobytes().hex().encode('ascii') + b'>\nEI Q\n'
# Preserve the economic text layer; add a small inline raster above it.
first = writer.pages[0].get_contents().get_data()
stream = DecodedStreamObject(); stream.set_data(b'q 0.05 0 0 0.05 520 500 cm\n' + inline + b'Q\n' + first)
writer.pages[0][NameObject('/Contents')] = writer._add_object(stream)
footer = BytesIO(); canvas = Canvas(footer, pagesize=(600, 800), invariant=1)
canvas.setFont('Helvetica', 11); canvas.drawString(35, 50, 'Digital bunntekst: trykt side 6. Rasterrapporten er ikke lest.'); canvas.save()
footer_page = PdfReader(BytesIO(footer.getvalue())).pages[0]
writer.pages[9][NameObject('/Resources')] = footer_page['/Resources'].clone(writer)
stream = DecodedStreamObject(); stream.set_data(inline + footer_page.get_contents().get_data())
writer.pages[9][NameObject('/Contents')] = writer._add_object(stream)
with (ROOT / 'inline-raster-footer-12.pdf').open('wb') as handle: writer.write(handle)
write('mixed-12.pdf', 'integrated-identity-conflict-12.pdf', {1: ['Adresse: Eksempelveien 1, 0001 Testby'],5: ['Adresse: Annenveien 9, 0002 Testby'],12: ['TILSTANDSRAPPORT - SLUTT']})
names = ['inline-raster-footer-12.pdf','integrated-identity-conflict-12.pdf','logo-economy-12.pdf','bounded-200.pdf','raster-footer-12.pdf','ambiguous-12.pdf','wrong-property-report-4.pdf']
(ROOT / 'extended-sha256.json').write_text(json.dumps({name:sha256((ROOT/name).read_bytes()).hexdigest() for name in names},indent=2)+'\n')
