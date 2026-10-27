"""Lesende pypdf-kontroll og deterministisk gjenbygg i midlertidig mappe."""
import hashlib
import json
import platform
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata
from collections import Counter
from pathlib import Path

import pypdf
import reportlab
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
CASE = ROOT / "tests/fixtures/s5-benchmark/S5-B1-v1"
expected = json.loads((CASE / "expected.json").read_text())
pdf = CASE / expected["documentName"]
original = pdf.read_bytes()
reader = PdfReader(pdf)
assert not reader.is_encrypted
assert not reader.get_fields()
assert len(reader.pages) == expected["pageCount"] == 14
assert len(original) <= 50 * 1024 * 1024
texts = [page.extract_text() for page in reader.pages]


def normalize(value):
    return re.sub(r"\s+", " ", unicodedata.normalize("NFC", value)).strip()


actual = []
for number, (page, text) in enumerate(zip(reader.pages, texts), 1):
    assert text.strip()
    assert f"PDF-side {number} av 14" in text
    assert "FIKTIV TILSTANDSRAPPORT" in text
    assert abs(float(page.mediabox.width) - 595.2756) < 0.01
    assert abs(float(page.mediabox.height) - 841.8898) < 0.01
    actual.extend((number, grade) for grade in re.findall(r"\bTG[23]\b", text))
assert Counter(actual) == Counter((f["pdfPage"], f["grade"]) for f in expected["findings"])
assert Counter(grade for _, grade in actual) == {"TG2": 8, "TG3": 1}
passages = 0
for group in ["findings", "generalInspectionLimitations", "specificUncertainties", "additionalMethodLimits"]:
    for entry in expected[group]:
        for key in ["sourcePassage", "supportingPassage", "resolutionPassage"]:
            if entry.get(key):
                assert normalize(entry[key]) in normalize(texts[entry["pdfPage"] - 1]), (group, entry.get("id"), key)
                passages += 1
for finding in expected["findings"]:
    assert not any(finding["id"] in text for text in texts)

# Gjenbygg aldri en frosset original direkte for å kontrollere determinisme.
with tempfile.TemporaryDirectory(prefix="s5-b1-rebuild-") as temporary:
    target = Path(temporary)
    for name in ["generate.py", "report-source.json"]:
        shutil.copyfile(CASE / name, target / name)
    subprocess.run([sys.executable, str(target / "generate.py")], check=True, capture_output=True)
    assert (target / expected["documentName"]).read_bytes() == original

print(json.dumps({
    "caseId": expected["caseId"], "pageCount": 14, "encrypted": False,
    "formFields": 0, "a4Pages": 14, "correctPhysicalFooters": 14,
    "fictiveRunningHeaders": 14, "nonEmptyTextPages": 14,
    "wordsPerPageIncludingRunningText": [len(text.split()) for text in texts],
    "gradeCounts": {"TG2": 8, "TG3": 1}, "passagesChecked": passages,
    "extraGradeMarks": 0, "oracleIdsPrintedInPdf": 0,
    "deterministicRebuildInTemporaryDirectory": True,
    "pdfSha256": hashlib.sha256(original).hexdigest(),
    "tooling": {"python": platform.python_version(), "pypdf": pypdf.__version__, "reportlab": reportlab.Version},
    "providerCalls": 0, "humanMeasurements": 0,
}, ensure_ascii=False, indent=2))
