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


## Godkjent offline-implementering 2026-10-28

De opprinnelige 13 PDF-ene, `expected.json` og `sha256.json` er bevart.
`extended-expected.json` er håndskrevet uavhengig fasit for sju nye originaler;
`generate-extended.py` lager bare disse og `extended-sha256.json`.

- `bounded-200.pdf`: økonomi/sammendrag 1–2, eksplisitt rapport 5–12 og
  188 etterfølgende irrelevante sider. Kombinert utvalg [1,2,5,6,7,8,9,10,11,12].
- `raster-footer-12.pdf`: skannet TG3 på fysisk 10 med digital bunntekst.
  Bunnteksten er lesbar; selve rasterrapporten forblir ulest.
- `ambiguous-12.pdf`: to rapportstarter; ingen entydig fullstendig rapport.
- `wrong-property-report-4.pdf`: kjent adresseforskjell mot `bounded-200.pdf`.
- `logo-economy-12.pdf`: lesbar økonomitekst med liten rasterlogo; tekstgrunnlaget
  bevares, og rasteret hevdes ikke lest.
- `inline-raster-footer-12.pdf`: inline-bilder uten image XObjects, lesbart
  økonomitekstlag og digital rapportbunntekst; rasterrapporten sperres.
- `integrated-identity-conflict-12.pdf`: ulike kildebundne eiendomsadresser
  på fysisk 1 og 5 sperrer teknisk bruk, men bevarer økonomi.

Ny import bruker disse originalhashene og versjonene, aldri filnavnet som
oppslagsnøkkel. Dette beskriver den opprinnelige offline-leveransen;
ukjente originaler får nå generell lokal code-first analyse uten live-fallback.
Fasiten for finansieringsflyten bygger på eksplisitt 0 % rente:
3075000/300 = 10250/mnd, ×12 = 123000/år, pluss fellesgjeld 12000 = J135000.
Visuell kontroll av de nye relevante sidene er dokumentert i
[leveringsbeviset](../../../.docs/implementation-artifacts/salgsoppgave-implementation-2026-10-28/verifikasjon.md).

## Frossen teknisk code-first prøve 2026-10-29

`code-first-live-original.pdf` er en femsiders syntetisk original med to TG2
og ett TG3, tabell, linjedelt grad og fortsettelse over fysisk sidegrense.
`code-first-live-pages.json` binder PDF.js-tekst til originalhashen.
`code-first-live-oracle.json` er separat håndskrevet fasit for økonomi,
ukjente felt, inkludering/gjeldsdel og funnenes fysiske kildeutdrag. Fasiten
ble avstemt uavhengig mot alle originalsidene før sammenligningsprøvene;
den opprinnelige `code-first-oracle.json` er uendret. Ingen modellretur er brukt.

`npm run prepare:live-test` lager en offline SDK-/requestpakke. Kommandoen
gjennomfører ingen live-test og returnerer fortsatt `ready: false` uten
verifisert lokal Sol-telling. Sammenligneren godtar ikke modell-ID som fasit;
den kontrollerer forhold, grad, kildeintervaller og økonomirelasjoner før
menneskelig retting. Ulik ordlyd mot fasit gir konservativt avvik og krever
manuell kontroll; dette er ingen automatisk semantisk evaluator.
Prøven dokumenterer tekniske grenser, ikke representativ produksjonskvalitet.
