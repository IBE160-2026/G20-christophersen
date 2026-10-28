"""Synthetic PDFs only. The handwritten expected.json is never rewritten here.

Run with Python + reportlab + Pillow + pypdf. No app imports or network.
"""
from hashlib import sha256
from io import BytesIO
from pathlib import Path
import json

from PIL import Image, ImageDraw
from pypdf import PdfReader, PdfWriter
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen.canvas import Canvas

ROOT = Path(__file__).resolve().parent


def raster(scan=False):
    picture = Image.new('RGB', (1000, 240), 'white' if scan else '#cde0db')
    draw = ImageDraw.Draw(picture)
    if scan:
        draw.text((25, 60), 'TG3: Alvorlig lekkasje i tak', fill='black', font_size=32)
        draw.text((25, 130), 'Trykt side 6 - raster uten tekstlag', fill='black', font_size=25)
    else:
        draw.rectangle((60, 30, 440, 210), fill='#547c76')
        draw.polygon([(540, 210), (740, 30), (940, 210)], fill='#ac8f6f')
    return ImageReader(picture)


def document(count, variant='text'):
    buffer = BytesIO()
    pdf = Canvas(buffer, pagesize=(600, 800), invariant=1, pageCompression=1)
    pdf.setTitle('Syntetisk salgsoppgave - ingen virkelig eiendom')
    pdf.setAuthor('IBE160 - fiktive testdata')
    for page in range(1, count + 1):
        # Fully textless photo/scan, including no digital footer.
        if page == 3 and variant in ('mixed', 'scanned'):
            pdf.drawImage(raster(), 40, 350, width=520, height=125)
        elif page == 10 and variant == 'scanned':
            pdf.drawImage(raster(True), 40, 350, width=520, height=125)
        else:
            pdf.setFont('Helvetica-Bold', 13)
            pdf.drawString(35, 755, 'FIKTIV SALGSOPPGAVE - kun teknisk test')
            pdf.setFont('Helvetica', 11)
            if page == 1:
                lines = ['Eierform: eierseksjon' if variant != 'conflict' else 'Eierform: borettslag',
                         'Prisantydning: 3 000 000 kr', 'Fellesgjeld: 200 000 kr',
                         'Omkostninger: 75 000 kr', 'Totalpris inkl. fellesgjeld og omkostninger: 3 275 000 kr']
                if variant != 'conflict':
                    lines += ['Dokumentavgift: 75 000 kr, inkludert i omkostninger.']
                lines += ['Felleskostnader: 5 000 kr per måned i 2026.',
                          'Herav renter og avdrag fellesgjeld: 1 000 kr per måned.',
                          'Eiendomsskatt: 6 000 kr per år i 2026, separat.',
                          'Kommunale avgifter: 6 000 kr per år i 2026, separat.',
                          'Leieinntekt og fullstendig eierbetalt drift er ikke oppgitt.']
            elif page == 2 and variant not in ('missing', 'attached'):
                lines = ['Sammendrag fra tilstandsrapport:', 'TG3: Alvorlig lekkasje i tak.',
                         'Samme forhold beskrives i detalj i tilstandsrapporten.']
                if variant == 'conflict':
                    lines += ['Prisantydning: 3 100 000 kr.']
            elif page == 5 and variant not in ('missing', 'attached'):
                lines = ['TILSTANDSRAPPORT - START', 'Fiktiv bygningsrapport. Trykt side 1.']
            elif page == 6 and variant not in ('missing', 'attached'):
                lines = ['Tilstandsgrad: TG2', 'Bygningsdel: bad 1', 'Slitt gulv i bad', 'Trykt side 2']
            elif page == 7:
                lines = ['Tilstandsgrad: TG2', 'Bygningsdel: bad 2', 'Slitt gulv i bad', 'Trykt side 3']
            elif page == 10:
                lines = ['Tilstandsgrad: TG3', 'Bygningsdel: tak', 'Alvorlig lekkasje i tak', 'Trykt side 6']
            elif variant in ('missing', 'attached'):
                lines = ['Tilstandsrapport følger separat.' if variant == 'missing' else 'Se PDF-vedlegg: tilstandsrapport.pdf']
            else:
                lines = [f'Dokumenttekst {page}.{row}: Fiktive opplysninger, ingen nye tilstandsgrader.' for row in range(1, 39)]
            for row, line in enumerate(lines):
                pdf.drawString(35, 715 - row * 16, line)
            pdf.setFont('Helvetica', 9)
            pdf.drawString(35, 25, f'Fysisk testposisjon {page}; teksten er ikke en kildeautoritet.')
        pdf.showPage()
    pdf.save()
    return buffer.getvalue()


def separate():
    buffer = BytesIO()
    pdf = Canvas(buffer, pagesize=(600, 800), invariant=1)
    for page in range(1, 5):
        pdf.setFont('Helvetica', 12)
        pdf.drawString(35, 750, 'FIKTIV SEPARAT TILSTANDSRAPPORT')
        pdf.drawString(35, 700, 'TG3: Alvorlig lekkasje i tak' if page == 3 else 'Ingen nye tilstandsgrader på denne siden.')
        pdf.drawString(35, 650, f'Trykt side {page-2}')
        pdf.showPage()
    pdf.save()
    return buffer.getvalue()


for count in (30, 31, 50, 100, 150, 200, 201):
    (ROOT / f'text-{count}.pdf').write_bytes(document(count))
for name, count, variant in [('mixed-12', 12, 'mixed'), ('scanned-report-12', 12, 'scanned'),
                             ('missing-report-6', 6, 'missing'), ('conflict-12', 12, 'conflict')]:
    (ROOT / f'{name}.pdf').write_bytes(document(count, variant))
report = separate()
(ROOT / 'separate-report-4.pdf').write_bytes(report)
writer = PdfWriter(clone_from=PdfReader(BytesIO(document(6, 'attached'))))
writer.add_attachment('tilstandsrapport.pdf', report)
with (ROOT / 'attached-report-6.pdf').open('wb') as handle:
    writer.write(handle)
hashes = {file.name: sha256(file.read_bytes()).hexdigest() for file in sorted(ROOT.glob('*.pdf'))}
(ROOT / 'sha256.json').write_text(json.dumps(hashes, indent=2) + '\n')
