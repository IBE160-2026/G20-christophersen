"""Dokumentkontroll for denne spec-kjøringen; ingen produkttester eller memlog-lesing."""
from pathlib import Path
import hashlib
import json
import re
import unicodedata
from urllib.parse import unquote

WORK = Path(__file__).resolve().parent
SPEC_DIR = WORK.parent
ROOT = SPEC_DIR.parents[2]
spec = (SPEC_DIR / "SPEC.md").read_text()
trace = (SPEC_DIR / "sporbarhet.md").read_text()
errors = []


def require(condition, message):
    if not condition:
        errors.append(message)


def list_field(text, key):
    front = text.split("---", 2)[1]
    match = re.search(rf"^{key}:\n((?:  - .+\n)+)", front, re.M)
    return re.findall(r"^  - (.+)$", match[1], re.M) if match else []


def anchor(heading):
    value = heading.strip().lower()
    value = re.sub(r"[^\w\- ]", "", value, flags=re.UNICODE)
    return value.replace(" ", "-")


def headings(path):
    return re.findall(r"^#{1,6} (.+)$", path.read_text(), re.M)


companions = list_field(spec, "companions")
sources = list_field(spec, "sources")
require(len(companions) == 10, "Forventet tre egne og sju adopterte kompanjonger")
require(len(sources) == 2, "Forventet faglærer og sensorveiledning som absorberte kilder")
targets = [(SPEC_DIR / item).resolve() for item in companions + sources]
for item, path in zip(companions + sources, targets):
    require(path.is_file(), f"Mangler referanse: {item}")
    require(path.name not in {".memlog.md", "README.md", "stories.yaml"}, f"Prosessfil i kontraktlister: {item}")
require(len(set(targets)) == len(targets), "Duplikat i frontmatterlister")

caps = re.findall(r"^- \*\*(CAP-\d+)\*\*\n(.*?)(?=\n- \*\*CAP-|\n## |\Z)", spec, re.M | re.S)
require([key for key, _ in caps] == [f"CAP-{i}" for i in range(1, 9)], "CAP-ID-er avviker fra tildelingen")
for key, block in caps:
    require(bool(re.search(r"^  - \*\*intent:\*\* .+", block, re.M)), f"{key} mangler intent")
    require(bool(re.search(r"^  - \*\*success:\*\* .+", block, re.M)), f"{key} mangler success")
for title in ("Why", "Capabilities", "Constraints", "Non-goals", "Success signal"):
    require(f"## {title}\n" in spec, f"Mangler kjernefelt: {title}")
require("```" not in spec and "![" not in spec, "Diagram/bilde i kernel")
require("## Assumptions" not in spec and "## Open Questions" not in spec, "Uventet ny antakelse/spørsmål")

spine_path = next(path for path in targets if path.name == "ARCHITECTURE-SPINE.md")
spine = spine_path.read_text()
bindings = re.search(r"^binds: \[(.+)\]$", spine, re.M)[1].split(", ")
for key in bindings:
    require(bool(re.search(rf"^\| {re.escape(key)} \|", trace, re.M)), f"Ingen egen sporbarhetsrad: {key}")
ad_ids = re.findall(r"^### (AD-\d+) —", spine, re.M)
require(ad_ids == [f"AD-{i}" for i in range(1, 11)], "Kilden har uventede AD-ID-er")
for key in ad_ids:
    require(bool(re.search(rf"^\| {key} \|", trace, re.M)), f"Ingen AD-rad: {key}")
for path in targets:
    if path.name in {"ARCHITECTURE-SPINE.md", "prd.md", "DESIGN.md", "EXPERIENCE.md"}:
        require("status: final" in path.read_text().split("---", 2)[1], f"Kilde er ikke final: {path.name}")

integrity = json.loads((WORK / "kildeintegritet.json").read_text())
unchanged = []
for item in integrity["files"]:
    actual = hashlib.sha256((ROOT / item["path"]).read_bytes()).hexdigest()
    require(actual == item["sha256"], f"Oppstrømsfil endret: {item['path']}")
    unchanged.append({"path": item["path"], "unchanged": actual == item["sha256"]})

link_count = 0
for path in sorted(p for p in SPEC_DIR.glob("*.md") if not p.name.startswith(".")):
    body = path.read_text()
    for dest in re.findall(r"\[[^\]]*\]\(([^)]+)\)", body):
        if dest.startswith(("https://", "http://", "mailto:")):
            continue
        filepath, _, fragment = unquote(dest).partition("#")
        target = (path.parent / filepath).resolve() if filepath else path
        require(target.is_file(), f"Brutt lenke i {path.name}: {dest}")
        if fragment and target.is_file() and target.suffix == ".md":
            require(fragment in [anchor(h) for h in headings(target)], f"Brutt anker i {path.name}: {dest}")
        link_count += 1
    require(body.endswith("\n"), f"Mangler siste linjeskift: {path.name}")
    for number, line in enumerate(body.splitlines(), 1):
        require(line == line.rstrip(), f"Whitespace i {path.name}:{number}")
        require(unicodedata.is_normalized("NFC", line), f"Ikke NFC: {path.name}:{number}")

prd_addendum = next(path for path in targets if path.name == "addendum.md" and "/prds/" in str(path))
test_text = prd_addendum.read_text()
test_families = {}
for prefix, count in (("RT", 19), ("BT", 18), ("AT", 20), ("TT", 9)):
    found = sorted(set(map(int, re.findall(rf"^\| {prefix}-(\d+)\b", test_text, re.M))))
    require(found == list(range(1, count + 1)), f"Ufullstendig adoptert fasit: {prefix}")
    test_families[prefix] = len(found)

require(not (SPEC_DIR / "stories.yaml").exists(), "Stories opprettet i spec-kjøringen")
require(not any(p.suffix in {".ts", ".tsx"} for p in SPEC_DIR.rglob("*")), "Produktkode i spec-mappen")
require((WORK / "sensorveiledning.txt").read_text().count("--- PDF-side ") == 7, "Ufullstendig sensoruttrekk")

audit = []
for item, path in zip(companions, targets[:len(companions)]):
    if item.startswith("../"):
        lines = path.read_text().splitlines()
        body_start = lines.index("---", 1) + 1 if lines and lines[0] == "---" else 0
        positions = [(i + 1, line) for i, line in enumerate(lines)
                     if i >= body_start and re.match(r"^#{1,6} ", line)]
        for index, (start, heading) in enumerate(positions):
            end = positions[index + 1][0] - 1 if index + 1 < len(positions) else len(lines)
            audit.append({"source": str(path.relative_to(ROOT)), "start": start, "end": end,
                          "heading": heading, "landing": item, "route": "adopted_full_text"})
(WORK / "bevaringskontroll-data.json").write_text(json.dumps({
    "date": "2026-10-15", "adopted_sections": audit,
    "absorbed_sources": {
        "faglaerer": "verifikasjon-og-avklaringer.md#kurs--og-faglærerføringer",
        "sensorveiledning": "verifikasjon-og-avklaringer.md#kurs--og-faglærerføringer"},
    "note": "Fulltekst-adopsjon bevarer krav også når de ikke gjentas i kernel. Semantisk kildeavstemming og wrapper-avgrensning er dokumentert i sluttkontroll.md; denne datafilen erstatter ikke den vurderingen."
}, ensure_ascii=False, indent=2) + "\n")
report = {"date": "2026-10-15", "verdict": "pass" if not errors else "fail", "capabilities": len(caps),
          "authored_companions": 3, "adopted_companions": 7, "requirement_rows": len(bindings),
          "architecture_ids": ad_ids, "test_examples_in_adopted_prd": test_families,
          "source_sections_adopted": len(audit), "local_links_checked": link_count,
          "integrity": unchanged, "errors": errors,
          "limits": "Kun dokumentstruktur/referanser/identiteter/kildeintegritet; ingen produktverifikasjon, ingen lesing av memlog."}
(WORK / "sluttkontroll-data.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({key: value for key, value in report.items() if key != "integrity"}, ensure_ascii=False, indent=2))
raise SystemExit(bool(errors))
