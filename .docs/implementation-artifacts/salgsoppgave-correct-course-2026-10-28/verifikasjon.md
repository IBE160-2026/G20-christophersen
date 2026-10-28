# Correct Course — verifikasjon og leveransestatus

Dato: 2026-10-28. Baseline: `b259207`. Omfang: kartlegging og
[endringsforslag](../../planning-artifacts/sprint-change-proposal-2026-10-28.md)
med [implementeringsspec](../spec-salgsoppgave-input.md). **Produktfunksjonen
er ikke implementert.** D1–D3 er vesentlige PDF-/OCR-/AI-valg og avventer Mads.

## Faktisk kontroll

13 nye syntetiske PDF-er og håndskrevet fasit ligger i
[fixturemappen](../../../tests/fixtures/sales-prospectus/README.md).
[Probe](../../../tests/fixtures/sales-prospectus/probe.mjs) kjørte med
Node 24.21.0 / PDF.js 6.4.299 uten nøkkel/API/adapter. Den tester dagens
avvisning over 30 sider og rå worker-ekstraksjon som lokal undersøkelse;
den endrer ikke appens akseptanse. Alle innebygde assertions bestod:
[rå resultat](pdf-probe.json).

Pypdf kryssjekket 13 sideantall/hash, fysisk TG-side, raster uten tekst og
byteidentisk innebygd rapport. Visuell inspeksjon av fire representative
renderinger bekreftet lesbar økonomi, originalens fysiske side 6 / trykte
side 2, tekstløst bilde og visuelt lesbar TG3 uten tekstlag. Poppler var
ikke installert; renderingen brukte lokal PDF.js + `@napi-rs/canvas`.

Prøven bekrefter at dagens dokumentlesing ikke oppdager manglende
tilstandsrapport bare fra lesbarhet, og at PDF-vedlegg ikke inngår i
hovedfilens sider. Den bekrefter **ikke** at AI finner økonomi/TG, at like
funn slås sammen riktig, eller at den nye brukerflyten virker.

Første testforsøk traff sandbox-EPERM på loopback: bevares i
[opprinnelig utskrift](regression-sandbox.txt). Testene ble kjørt på nytt med
lokal loopback tillatt og tom API-nøkkel; ingen forventning/timeout ble endret.

## Sluttresultater

| Kontroll | Faktisk resultat / bevis |
| --- | --- |
| Ny PDF-karakterisering etter review | 13/13 dokumenter bestod; fullstendig inventar, hash, fysisk side, blokkering og målt vedleggssidetall: [pdf-probe.json](pdf-probe.json). |
| Uavhengig fixturekontroll | Pypdf sideantall/hash/vedleggsbytes bestod. Regenerering med låste pakker ga samme 13 SHA-256; intet originaldokument ble endret. |
| Eksisterende full regresjon | 45 filer / **1 224 tester bestod**, Node 24.21.0, ca. 88 s: [regression.txt](regression.txt). |
| Bygg og typekontroll | Bestod; eksisterende Vite-advarsel om chunk over 500 kB: [build.txt](build.txt). |
| Lint | Bestod etter siste probeendring: [lint.txt](lint.txt). |
| Målrettet nettleserregresjon | **13 bestod**: FINN-felt/kilde/finansiering/opptaksflyt og eksisterende rapportanalyse/originalside/gjenbruk i begge kontrollerte moduser: [e2e-regression.txt](e2e-regression.txt). Live-etiketter i testene bruker kontrollert transport, ingen betalt API. |
| Uavhengig BMAD Review | Tre kontekstfrie reviewere; 10 adversarial-funn, ett overlappende edge-funn og ingen verification-gap-funn. Alle reelle funn rettet/triagert i [review.md](review.md), felles funnform i [review.json](review.json). Fokusert adversarial- og edge-etterkontroll returnerte begge `[]`. |
| Bevaring | 85 kontrollerte produkt-/pakke-/sprint-/S5-/S6-filer byteidentiske med b259207, deferred-work opprinnelig prefix bevart: [preservation.json](preservation.json). |
| Dokumentintegritet | Sju gamle YAML-frontmatter byteidentiske mot baseline: [document-checks.json](document-checks.json). Lokale lenker i endrede Markdown-filer er kontrollert; ingen manglende mål. Diffkontroll av dokument-/testkode bestod. Rå kommandoutskrifters opprinnelige whitespace bevares. PDF-er følger eksisterende binary-konvensjon i .gitattributes. |

Regresjon og browserprøver ble kjørt før de siste avgrensede spec-/probe-
rettingene; produktkode og eksisterende tester er uendret. Den nye proben
og lint ble kjørt på nytt etter prøveendringene. Full ny produkt-E2E og
ressursgrensetest kan først kjøres etter produktimplementering.

## Avgrensning av bevis

De nye dokumentene er små, syntetiske og komprimerte. Råworkerens tider og
RSS er ingen kapasitetstest for 50 MiB, dekomprimeringsbomber, native
allokeringsspisser eller nett-/modelllatens. De foreslåtte nye ressurs- og
tokengrensene er ikke implementert/testet. SO-AC1–15 og ny samlet UI-flyt
står derfor som planlagt, ikke bestått.

Eksisterende regresjon er bevis for gjeldende kode, ikke for ny salgsoppgave-
import. Ingen ny live-/S2-/S5-/S6-akseptanse påstås. Historiske S5/S6-bevis,
finans-/screeningregler, produktkode og FINN-aktivering skal være byteuendret
mot baseline. Sentral deferred-work oppdateres bare med append.

## Neste steg

Mads avgjør D1–D3 i endringsforslaget. Etter vedtak følger bmad-build med
6.1–6.5: kontrakt/ressurser, økonomi, rapport/TG, minimal UX/demo og samlet
review/regresjon. Ingen ny betalt API-bruk er autorisert av dette forslaget.
Aktiv promptlogg følger lokal commit. Ingen push.
