"""Reproduce alternate PDF structures without changing the original 30-page fixture.

Python 3.12.14, PyMuPDF 1.26.6, pikepdf 10.17.0. Authoring tools only.
"""
from hashlib import sha256
import json
from pathlib import Path

import pikepdf
import pymupdf
from pypdf import PdfReader

source = Path("tests/fixtures/property-cases/text-30-pages.pdf")
output = Path("tests/fixtures/pdf-structure")
output.mkdir(exist_ok=True)
with pymupdf.open(source) as document:
    document.save(output / "text-30-pages-object-stream.pdf", use_objstms=1, deflate=1, no_new_id=True)
with pikepdf.open(source) as document:
    document.save(output / "text-30-pages-linearized.pdf", linearize=True, static_id=True)

hashes = {}
with pymupdf.open(source) as original:
    for name in ("text-30-pages-object-stream.pdf", "text-30-pages-linearized.pdf"):
        path = output / name
        with pikepdf.open(path) as syntax:
            assert not syntax.check_pdf_syntax()
            if "linearized" in name:
                assert syntax.is_linearized and syntax.check_linearization()
        assert len(PdfReader(path).pages) == 30
        with pymupdf.open(path) as variant:
            assert len(variant) == 30
            for index in range(30):
                assert variant[index].get_text() == original[index].get_text()
                assert variant[index].get_pixmap().samples == original[index].get_pixmap().samples
        hashes[name] = sha256(path.read_bytes()).hexdigest()
        print(f"{name}: pypdf=30 pages; syntax valid; all 30 pages text/pixels identical to original")
assert b"/ObjStm" in (output / "text-30-pages-object-stream.pdf").read_bytes()
assert b"/XRef" in (output / "text-30-pages-object-stream.pdf").read_bytes()
(output / "sha256.json").write_text(json.dumps(hashes, indent=2) + "\n")
