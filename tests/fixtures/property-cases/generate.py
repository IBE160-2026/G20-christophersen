"""Deterministic fictional PDFs. Does not read the oracle or call an adapter.

Run with Python 3.12 + reportlab==4.4.4; see README.md in this directory.
"""
from hashlib import sha256
import json
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen.canvas import Canvas

ROOT = Path(__file__).resolve().parent
WIDTH, HEIGHT = A4


def canvas_for(filename, title):
    canvas = Canvas(str(ROOT / filename), pagesize=A4, invariant=1, pageCompression=1)
    canvas.setTitle(title)
    canvas.setAuthor("IBE160 - fiktive testdata")
    canvas.setSubject("Fiktiv fixture. Ingen reell eiendom eller privat original.")
    return canvas


def page(canvas, case, number, title, lines, printed=None):
    canvas.setFillColor(HexColor("#173F46"))
    canvas.rect(0, HEIGHT - 105, WIDTH, 105, fill=1, stroke=0)
    canvas.setFillColor(HexColor("#FFFFFF"))
    canvas.setFont("Helvetica-Bold", 12)
    canvas.drawString(48, HEIGHT - 42, f"{case} | FIKTIV TILSTANDSRAPPORT")
    canvas.setFont("Helvetica", 18)
    canvas.drawString(48, HEIGHT - 76, title)
    canvas.setFillColor(HexColor("#222222"))
    text = canvas.beginText(48, HEIGHT - 150)
    text.setFont("Helvetica", 12)
    text.setLeading(23)
    for line in lines:
        text.textLine(line)
    canvas.drawText(text)
    canvas.setStrokeColor(HexColor("#A0ACAF"))
    canvas.line(48, 74, WIDTH - 48, 74)
    canvas.setFont("Helvetica", 10)
    canvas.drawString(48, 52, "Kun testdata - ingen teknisk godkjenning eller markedsverdi")
    footer = f"PDF-posisjon {number}"
    if printed is not None:
        footer += f" | Trykt side {printed}"
    canvas.drawString(48, 34, footer)
    canvas.showPage()


for case in ("F1", "F2", "F3", "F4"):
    document = f"{case}-tilstandsrapport.pdf"
    pdf = canvas_for(document, f"{case} - fiktiv tilstandsrapport")
    page(pdf, case, 1, "Rapport og opphav", [
        document,
        "Fiktivt øvingsobjekt. Ingen virkelig adresse eller person.",
        "Rapporten er skrevet for kontrollerte IBE160-tester.",
        "Funn kontrolleres mot originalsidene i denne filen.",
        "Økonomiske testforutsetninger finnes separat i expected.json.",
    ])
    page(pdf, case, 2, "Bad - registrert avvik", [
        "Tilstandsgrad: TG2",
        "Slitt overflate på baderomsgulv",
        "Dette er den forhåndsdefinerte funnteksten for testcaset.",
        "Ingen reparasjonskostnad er anslått.",
    ])
    page(pdf, case, 3, "Avgrensning og kontroll", [
        "Dette er en kort, fiktiv rapportfixture med fire PDF-sider.",
        "Rapporten beskriver ingen reell eiendom.",
        "Filposisjon telles fra 1, uavhengig av trykte sidetall.",
        "Innholdet er forhåndsbestemt før analyse eller modellbruk.",
    ])
    if case == "F4":
        page(pdf, case, 4, "Tak - registrert alvorlig avvik", [
            "Tilstandsgrad: TG3",
            "Alvorlig lekkasje i tak",
            "Funnet krever videre avklaring før forsvarlig screening.",
            "Ingen reparasjonskostnad er anslått.",
            "RT-5: Denne filsiden har trykt sidetall 2.",
        ], printed=2)
    else:
        page(pdf, case, 4, "Avslutning", [
            "Ingen ytterligere registrerte avvik i denne testcasen.",
            "Dette er ikke en bekreftelse av analyse eller lesbarhet.",
            "Brukerens kontroll og bekreftelser håndteres separat.",
        ])
    pdf.save()

for count in (30, 31):
    pdf = canvas_for(f"text-{count}-pages.pdf", f"Fiktiv grensefixture - {count} sider")
    for number in range(1, count + 1):
        page(pdf, "GRENSETEST", number, f"Tekstside {number} av {count}", [
            f"Dette er faktisk tekst på PDF-posisjon {number}.",
            "Fixture for format og sidetelling. Ingen analysefasit.",
        ])
    pdf.save()

# Vector-only page: a valid container with no text operators or text layer.
pdf = canvas_for("without-text-layer.pdf", "Tekstløs formatfixture")
pdf.setFillColor(HexColor("#173F46"))
pdf.rect(100, 180, 380, 330, fill=1, stroke=0)
pdf.setFillColor(HexColor("#FFFFFF"))
pdf.rect(165, 230, 80, 120, fill=1, stroke=0)
pdf.rect(335, 350, 80, 80, fill=1, stroke=0)
pdf.showPage()
pdf.save()

(ROOT / "invalid-format.pdf").write_bytes(b"This is plain text, not a PDF container.\n")
(ROOT / "damaged-container.pdf").write_bytes(
    b"%PDF-1.7\n1 0 obj\n<< /PrivateTest (DO-NOT-EXPOSE-PARSER-DETAIL) >>\nendobj\n%%EOF\n"
)
(ROOT / "F1-tilstandsrapport-endret.pdf").write_bytes(
    (ROOT / "F1-tilstandsrapport.pdf").read_bytes() + b"\n% Fictional byte identity variant\n"
)

# Byte manifest is generated evidence, distinct from the hand-authored semantic oracle.
manifest = {path.name: sha256(path.read_bytes()).hexdigest() for path in sorted(ROOT.glob("*.pdf"))}
(ROOT / "sha256.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
print(f"Generated {len(manifest)} deterministic PDF-named fixtures and sha256.json")
