---
title: 'Nordvik: stor digital salgsoppgave fra opplasting til analyse'
type: 'bugfix'
created: '2026-11-04'
status: 'done'
route: 'dispatch'
baseline_commit: 'b49e75636212025034d102f2b1fb91a949175e80'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="Brukerens konkrete bestilling autoriserer implementering, ekte test og lokal commit">

## Intent

En ekte Nordvik-salgsoppgave for Rostockgata 96 stopper ved backendens minnegrense. Målet er at denne vanlige salgsoppgaven kan lastes opp og gi kildebelagte boligopplysninger, økonomi, teknisk analyse og ærlig leiestatus. Finn årsaken både i backend og nettleser, begrens behandlingsminne og test hele flyten med originalen.

## Boundaries & Constraints

Bevar alle 170 fysiske sider og rapportens 19 sider, originalhash, tekstoffseter og kilder. Behandle sider sekvensielt eller i små grupper. Bruk digital tekst først; OCR trengs bare for faktisk manglende/grafisk informasjon. Frigjør parser-, bilde- og canvasressurser. Gjeldende minne-, tids-, tekst- og svargrenser består. Ingen betalte AI-kall, push, offentlig original eller oppdiktede leietall. Lokal commit skal inkludere aktiv promptlogg og testbevis i eksisterende prosessstruktur.

## I/O & Edge-Case Matrix

| Tilfelle | Input | Forventet resultat | Feilhåndtering |
| --- | --- | --- | --- |
| Ekte Nordvik | Privat original, 170 sider | Import innen 512 MiB-vakten; alle sider bevart; bolig/økonomi og kilder kontrolleres i UI | Ingen skjult sidekutting |
| Grafisk rapport | Lesbar tekst med raster/TG-symboler | Digital tekst beholdes, nødvendig bildebevis brukes separat | Ulest/usikker rapport beholdes eksplisitt |
| Rask sidebytting | Flere originalsider og zoom | Bare aktuell side vises; gammel render/canvas/parserdata frigjøres | Avbrutt render publiseres aldri |
| SSB-grense | 59 m² og 3 rom | Estimat bare dersom publiserte SSB-celler støtter det | Konkret forklaring dersom utenfor modellområdet |

</frozen-after-approval>

## Code Map

- `src/backend/http/run-import.ts`: isolert importbarn med 256 MiB heap, RSS-vakt 512 MiB hvert 100 ms og samlet 60 s-frist. Ikke øk grensene.
- `src/backend/documents/validate-pdf.ts`, `count-pdf-pages.ts`, `pdf-page-tree-worker.ts`: offentlig parser og uavhengig fysisk sidetelling; mange samtidige bytekopier. Bevar valideringens snapshot og Count-uavhengighet.
- `src/backend/documents/extract-import.ts`, `pdf-extraction-worker.ts`: sekvensiell tekstlesing allerede; worker og parser kopierer bytes, caches må undersøkes. `manager.cleanup()` mellom sider er ikke automatisk bevis for at all parserdata frigjøres.
- `src/backend/documents/visual-import.ts`, `local-visual-ocr.ts`, `local-visual-ocr.swift`: rapportavgrenset lokal Vision, eksplisitte usikre sider, autoreleasepool per side. Raster alene kan være logo; velg kun sider som trenger grafisk/tekstlig supplement uten å skjule dekning.
- `src/frontend/pdf/PdfViewer.tsx`: én synlig side, men mangler eksplisitt side-/canvascleanup. Bevar fysisk sidenavigasjon og markeringsregioner.
- `src/domain/rental-property.ts`, `src/backend/rent/ssb-rent.ts`: kildebelagte felt og gratis SSB. Ingen ekstrapolasjon fra minste 3-romspunkt hvis 59 m² ligger utenfor.
- `tests/e2e/rent-real-document.spec.ts`: mønster for ekte valgfri privat PDF. Ny Nordvik-test skal kunne kreves eksplisitt uten skip i denne økten.
- `.docs/planning-artifacts/r3-http-ressurser-semester-v1.md`, `salgsoppgave-code-first-design-2026-10-29.md`: requesteierskap, ingen backendpersistens, full sideoversikt. Faglærers tilbakemelding og sensoruttrekket krever sporbarhet og ekte endeflyt, ikke nye produktregler.

## Tasks & Acceptance

**Execution:**
- [x] Dokumenter førmåling av faktisk RSS, behandlingsfase og nettleserfeil/minne.
- [x] Rett dokumentbehandling og ressurslivsløp i filene over uten å øke grenser.
- [x] Rett bare nødvendige generelle feltfeil i bolig/økonomi; bevar falske-positive-vern.
- [x] Legg til relevante regresjoner og ekte Playwright-flyt, inkludert kildeåpning, mobil og SSB-grense.
- [x] Kjør build, lint, berørte tester og full unit/integrasjon; dokumenter resultater og commit lokalt med promptlogg.

**Acceptance Criteria:**
- Gitt original Nordvik-PDF, når den lastes opp i Playwright gjennom faktisk HTTP, så beholdes alle 170 sider med uendret hash og rapportområdet 36–54, uten minneavvisning.
- Gitt importen, når bolig og økonomi leses, så vises Oslo kommune, Selveierleilighet, 59 m² BRA-i, 3 rom, 2 soverom, prisantydning 8 600 000 og fellesutgifter 3 660 per måned med fysiske kilder.
- Gitt importen, når leieagenten kjører, så brukes faktisk gratis SSB eller vises den konkrete databegrensningen; ingen manuell erstatning eller betalt AI.
- Gitt dokumentkontroll og sidebytting, når gamle sider avsluttes, så ryddes tilhørende ressurser og ingen sen render overskriver siste side.

## Implementation Notes

Førprøve i Playwright reproduserte minneavvisningen på ca. 2 sekunder. Isolert Node24-måling fant formatfase rundt 428 MiB og senere tekstuttrekk rundt 634 MiB; videre isolering pågår. Original finnes i `private/incoming/nordvik-rostockgata-96.pdf`, kopiert uendret fra brukerens Nedlastinger. Ingen privat fil legges i Git. Aktiv promptlogg er `session-01a1a651-52fd-7033-b614-e00beb804981.jsonl` og inneholder denne bestillingen.

Sluttprøve: faktisk import lykkes under uendret 512 MiB/60 s-vakt (målt 467,14 MiB). Tre versjonerte Playwright-prøver består uten skip: Nordvik, tidligere ekte PDF og positiv gratis SSB. Nordvik gir alle bestilte felt, 19 rendret/lest rapportsider og konkret SSB-grense (59 < 60). Teknisk fullstendighet er fortsatt uavklart; dette oppgraderes ikke. Build/lint består. Første full-suite hadde to 5 s-tidsavbrudd under samtidig testlast; isolert nykjøring bestod med 2 011 tester og 7 eksisterende native skip. Eksakt baseline-sammenligning gir 170 sider, 293 168 tegn og null endringer i tekst/status/reason/raster.

## Spec Change Log

## Review Triage Log

Tre uavhengige lag har lest samlet diff: blind-hunter, edge-case-hunter og verification-gap. Hvert funn er vurdert før gruppering. Reproduksjoner i `private/incoming/nordvik-review-repros.ts` bekrefter felt-/filter-/footerfunn; kildene/testene bekrefter testgapene. Alle nedenfor går til små rettinger i samme endring, ingen nye produktvalg.

| ID | Vurdering, bevis og håndtering |
| --- | --- |
| B1 | medium / patch: uløst TG på lesbar vektorside gir tomt OCR-utvalg; flytt kandidatkontrollen før rasterretur, egen negativ/positiv regresjon. |
| B2 | high / patch: saksnummer + nybygg på eiendommen + 3 boenheter ga apartment uten issues i reproduksjon. Vern eksplisitt salgsobjekt og krev eksplisitt nabokontekst ved unntak. |
| B3 | medium / patch: «Boligtype og eierform: Leilighet / Eierseksjon» avvises av slashlabel-testen. Gjenbruk allerede utledet combinedOwner og kjente eierformer. |
| B4 | medium / patch: «Soverom:2 / Antall soverom:-1» beholdt2 uten issues. Ugyldig eksplisitt verdi skal gi synlig usikkerhet, også desimal/>20. |
| B5 | medium / patch: eksplisitte månedsbeløp med kr før tallet eller periode etter beløpet blir missing; reproduksjon bekrefter begge. Utvid de samme begrensede valuta-/periodereglene og test bare tall/valgfrie alternativer fortsatt avvist. |
| B6 | medium / patch: fire-sidersrapport med intakt4-anker og «3 av49 / 4 av410» ga feil rapportområde. Gjenopprett også korte sammenlimte tall med samme nabobevis; behold motstridsvern. |
| B7 | medium / patch: privat Nordvik-prøve kontrollerer ferdig canvas, men ikke garantert kansellert render. Utvid offentlig F4-race med deterministisk stans og sjekk av alle forlatte canvasbuffere. |
| B8 | medium / patch: Nordvik-felt og økonomikildespenn sjekkes i HTTP, men økonomisk kildeåpning er ikke prøvd i UI. Legg til synlig pris/månedsutgift og hver fysiske kildeside. |
| B9 | medium / patch: ny formatworker og gruppeovergang mangler styrte feil-/malformed-/terminate-prøver. Legg til livsløpsregresjoner som krever await-close før neste worker og stopp etter feil. |
| E1 | high / patch: samme demonstrerte flerboligunntak som B2, også eksplisitt «Eiendommen består av3leiligheter». Samlet retting og egen variant i test. |
| E2 | medium / patch: samme vektorside/kandidat-rekkefølge som B1, samme retting. |
| E3 | medium / patch: samme korte sammenlimte footer som B6; samme retting og regresjon. |
| E4 | medium / patch: «Soverom:2 / Soverom:30» mister ugyldig motbevis, samme rotårsak som B4. |
| V1 | medium / patch: verifisert testgap: offentlig F4-test sjekker DOM, bare privat valgfri test sjekker backingstore. Samlet med B7, offentlig cleanup-regresjon. |

Reviewrettingene er kontrollert med konkrete før/etter-reproduksjoner. B1–B6/E1–E4 er rettet; 139 berørte unittester bestod hos implementeringsagenten. Ny offentlig F4-raceprøve dekker faktisk avbrutt canvasrender, og Nordvik-prøven åpner også pris-/utgiftskildene. Ny worker-livsløpsprøve dekker sen gruppefeil, feil retur, termineringsfeil og 200-profilens formatworker. Hovedagenten rettet testens ES-lib-kompatibilitet uten å endre tsconfig og la til kontrollert avvisning av null-retur fra containerworker. Full sluttrunde etter disse rettingene: build/lint bestått, 2 035 unit/integrasjon bestått (7 eksisterende native skip), 5/5 Playwright uten skip. Offentlig canvasrace består i begge kontrolladaptermoduser; ekte Nordvik åpner alle pris-/utgiftskildene. Alle reviewfunn er rettet og kontrollert. Siste produktmåling var 441,31 MiB og 13,86 s, uendrede grenser. Lokal server er startet med siste kode og tom AI-nøkkel.

## Verification

- `npm run build`, `npm run lint`, `npm test`.
- Playwright med ekte privat Nordvik-PDF, faktisk import/SSB og tom AI-nøkkel; ikke stubbet backend.
- Mål RSS og nettleserheap før/etter; kontroller alle sidene, feltenes originalspenn og grafisk rapportdekning.
- `git diff --check`; kontroller privatmateriale og promptlogg før lokal commit.
