"""Independent fixture inspection and contact sheets; not production text extraction.

Python 3.12; pypdf==6.1.3, PyMuPDF==1.26.6, Pillow==13.0.0.
Run from the repository root. Outputs are curated Story 2.2 evidence.
"""
import json
from pathlib import Path
import re

import pymupdf
from PIL import Image
from pypdf import PdfReader

FIXTURES = Path("tests/fixtures/property-cases")
OUTPUT = Path(".docs/implementation-artifacts")
oracle = json.loads((FIXTURES / "expected.json").read_text())


def contact_sheet(selections, filename):
    tiles = []
    for name, number in selections:
        with pymupdf.open(FIXTURES / name) as pdf:
            pix = pdf[number - 1].get_pixmap(matrix=pymupdf.Matrix(1, 1), alpha=False)
            tiles.append(Image.frombytes("RGB", (pix.width, pix.height), pix.samples))
    width, height = tiles[0].size
    sheet = Image.new("RGB", (width * 2 + 30, height * 2 + 30), "#BCC7CA")
    for index, tile in enumerate(tiles):
        sheet.paste(tile, (10 + index % 2 * (width + 10), 10 + index // 2 * (height + 10)))
    sheet.save(OUTPUT / filename)


for case in oracle["cases"]:
    reader = PdfReader(FIXTURES / case["documentName"])
    assert len(reader.pages) == case["pageCount"] == 4
    texts = [page.extract_text() for page in reader.pages]
    actual = [(grade, number) for number, text in enumerate(texts, 1)
              for grade in re.findall(r"Tilstandsgrad: (TG[23])", text)]
    expected = [(finding["grade"], finding["pdfPage"]) for finding in case["findings"]]
    assert actual == expected, (case["caseId"], actual, expected)
    assert case["documentName"] in texts[0]
    for finding in case["findings"]:
        text = texts[finding["pdfPage"] - 1]
        assert finding["description"] in text
        assert finding["documentName"] == case["documentName"]
        if finding["printedPage"] is not None:
            assert f"Trykt side {finding['printedPage']}" in text
    print(f"{case['caseId']}: pypdf pages=4, all grades/text/names/pages match oracle; {actual}")
    contact_sheet([(case["documentName"], number) for number in range(1, 5)],
                  f"story-2-2-fixtures-{case['caseId']}.png")

for count in (30, 31):
    reader = PdfReader(FIXTURES / f"text-{count}-pages.pdf")
    assert len(reader.pages) == count
    for number, page in enumerate(reader.pages, 1):
        assert f"Dette er faktisk tekst på PDF-posisjon {number}." in page.extract_text()
    print(f"Boundary {count}: pypdf pages={count}, positional text on every page")

reader = PdfReader(FIXTURES / "without-text-layer.pdf")
assert len(reader.pages) == 1 and reader.pages[0].extract_text() == ""
print("Textless fixture: one vector page, no extractable text (no readability approval)")
contact_sheet([("text-30-pages.pdf", 30), ("text-31-pages.pdf", 30),
               ("text-31-pages.pdf", 31), ("without-text-layer.pdf", 1)],
              "story-2-2-fixtures-boundaries.png")

assert oracle["cases"][2]["financialInputs"]["L"] is None
print("F3: missing L remains null. Financial outcomes/S2/S5 are not executed by this inspection.")
