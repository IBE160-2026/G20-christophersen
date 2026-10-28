# Syntetiske salgsoppgaver

13 fiktive PDF-er, laget for PAA-SO1 Correct Course 2026-10-28. Ingen reell
eiendom, person eller kundedokument. `expected.json` er håndskrevet fasit fra
før parserprøven; `generate.py` endrer ikke fasiten. `sha256.json` binder bytes.

Tekstvariantene har 30/31/50/100/150/200/201 sider. Fysisk side 6 har TG2 i
bad 1, side 7 har lik beskrivelse i bad 2, og side 10 har TG3 i taket (trykt
side 6); side 2 gjentar takfunnet i sammendrag. Dette gir både ekte gjentakelse
og lik ordlyd for forskjellige forhold. Alle er syntetiske tekstdokumenter,
ikke realistiske 50 MiB foto-PDF-er eller dokumentasjon på modelltreff.

`mixed-12.pdf` har tekstløs bildeside 3; `scanned-report-12.pdf` har i tillegg
TG3 bare som raster på side 10. `missing-report-6.pdf` mangler rapport.
`attached-report-6.pdf` har rapport som faktisk PDF-vedlegg, ikke innlimte
sider. Vedlegget er byteidentisk med `separate-report-4.pdf`, der TG3 står
på fysisk side 3 / trykt side 1. `conflict-12.pdf` har to prisverdier,
borettslag og ukjent dokumentavgift. Eierformen gir ingen automatisk nullavgift.

Generering krever Python med `reportlab`, `Pillow` og `pypdf`:

```sh
python -m venv /tmp/paa-fixture-venv
/tmp/paa-fixture-venv/bin/python -m pip install -r requirements.txt
/tmp/paa-fixture-venv/bin/python generate.py
```

Faktisk brukt: Python 3.12.14, ReportLab 4.4.4, Pillow 13.0.0 og pypdf 6.1.3.
Kommandoene kjøres fra denne mappen. I et miljø med disse pakkene allerede
installert er følgende tilstrekkelig:

```sh
python generate.py
```

Hashmanifestet beskriver de versjonerte originalbytene. Lik semantikk fra
andre bibliotekversjoner er ikke automatisk byteidentisk regenerering.
Ny generering må sammenlignes med manifestet før endring godtas; fasiten
endres ikke for å passe ny parser-/modellretur.

Kjør karakteriseringen fra reporoten med prosjektets Node 24.21.0:

```sh
node tests/fixtures/sales-prospectus/probe.mjs
```

Prøven kjører eksisterende formatvalidering og deretter rå uttrekksworker
isolert per dokument. **Den omgår bevisst 30-siderskontrakten bare i en
lokal undersøkelse**; den endrer ikke produksjon eller støtteprofil. Lange
PDF-er skal fremdeles avvises av formatvalidering og runtime-skjema. Ingen
adapter, AI, OCR, økonomimapping eller ny brukerflyt kjøres av denne prøven.

Visuell kontroll: side 1 og 6 i text-100, side 3 i mixed-12 og side 10 i
scanned-report-12 er rendret og inspisert. Poppler var ikke tilgjengelig;
lokal PDF.js og `@napi-rs/canvas` ble brukt. Pypdf har separat bekreftet
sideantall/vedleggsbytes. Raster-TG3 er lesbar visuelt, men mangler i tekstlaget.
Genererte forhåndsvisninger beholdes i systemets tempområde.

[Faktisk prøve og begrensninger](../../../.docs/implementation-artifacts/salgsoppgave-correct-course-2026-10-28/pdf-probe.json).
[Spec og fremtidige AC](../../../.docs/implementation-artifacts/spec-salgsoppgave-input.md).
