---
title: 'Story 2.7 — Kontrollere funnets kilde i original-PDF og smalt panel'
created: '2026-10-20'
status: 'in-review'
route: 'dispatch'
story_key: '2-7-kontrollere-funnets-kilde-i-original-pdf-og-smalt-panel'
baseline_commit: '5d05698e501703c6e12d08d3b63c2f058b0873ce'
context:
  - '.docs/implementation-artifacts/epic-2-context.md'
  - '.docs/specs/spec-IBE160/grensekontrakter.md'
---

<frozen-after-approval reason="Brukerens eksplisitte sekvensielle mini-sprintbestilling, fase 4">

## Intent

Lever bare Story 2.7 AC1–AC5: valgt funn gir korrekt fysisk originalside, hel side/nabosider og lokal zoom. Fra 1200 CSS px ligger funn/PDF om lag 44/56 med 24 px mellomrom. Smalere flate bruker behovsåpnet panel med funnkontekst, overskriftsfokus, fokusfelle, Esc/retur og bevart valgt funn/posisjon. FR-8/9, NFR-2/3, S4, AD-2/3/4/9/10, SPEC CAP-3, RT-5/7/8.

## Boundaries & Constraints

Bruk låst PDF.js browser-build og lokalt bundlet matchende worker/nødvendige ressurser. Parser mottar kopi av originale bytes slik at overføring til worker ikke detacher øktgrunnlaget. Ingen ny analyse ved visning, ingen standard separat fane, ingen ny fullføringspåstand. Ukjent/ugyldig kilde eller visningsfeil er synlig for faktisk dokument/forespurt side; ingen gjetting. Gammel side må aldri fremstå som ny ved raskt bytte. Automatisk sideskift stjeler ikke fokus; korte statusmeldinger. Behold 2.6s faktiske listestart/synlighetsvern og analysekunngjøring. Ingen 2.8+, bekreftelser, TG3, Resultat eller live. Ny produkt-/arkitekturbeslutning stopper kjeden.

## I/O & Edge-Case Matrix

| Gitt / handling | Forventet |
|---|---|
| Gyldig funn på filside 4, velg | Ekte originalside 4, dokumentnavn og fysisk side, uavhengig av trykt sidetall |
| Naboside/zoom/hel side | Lokal kontroll, gyldig filside, ingen HTTP-analyse |
| Smal flate, Åpne PDF | Panel først ved behov, overskriftsfokus/felle/Esc/retur til åpner, bevart valg/posisjon |
| Ukjent/ugyldig side eller feil dokument | Synlig konkret mangel, ingen side gjettes |
| Lasting eller parser/renderfeil | Synlig lokal status, ingen gammel canvas som ny, analyseutfall uendret |
| Raskt funn-/sidebytte eller unmount | Siste forespørsel alene presenteres; render avbrytes og worker frigjøres |
| Nett sperret | Lokale worker-/fonter/kartressurser fungerer |

</frozen-after-approval>

## Code Map

- `src/frontend/state/report.ts`: kun lokal kildevisningskontekst, nullstilt med rapporten; ingen analyse-/domainendring.
- `src/frontend/screens/ReportAnalysis.tsx`: behold listeheading/observer; koble valg og PDF-kontekst uten å endre uttrekk.
- `src/frontend/pdf/`: ny isolert renderer og panel, lokale ressurser, kopierte bytes og async cleanup.
- `src/frontend/styles.css`, `vite.config.ts`: godkjent delt flate/panel/tokens, bygg/dev av PDF-ressurser.
- `tests/unit/`, `tests/e2e/`, `playwright.config.ts`: reelle bytes, negative/race/fokus/offline og regresjon.

## Tasks & Acceptance

- [x] Implementer kildevalg, fysisk sidenavigasjon og PDF-rendering med originalvern.
- [x] Implementer responsive flater og tastaturpanel med bevart kontekst.
- [x] Verifiser matrise og AC1–AC5, full regresjon og visuell kontroll.
- [x] Synkroniser sporbarhet/status review og lokal commit.

Given valgt funn, when valgt, then korrekt fysisk side og nabosider vises (AC1). Given bred flate, when kontroll, then 44/56 og lokale ressurser (AC2). Given smal flate, when åpning/lukking, then panel/fokus/retur/bevaring (AC3). Given ukjent kilde/feil/lasting, when vist, then ærlig status uten ny analyse (AC4). Given tastatur/zoom, when sideskift, then fokus/kontroller/kort status og synlighet bevares (AC5).

## Implementation Notes

Ingen intensjonsgap, irreversible handlinger eller ny arkitekturbeslutning. Brukerens autoriserte fasebestilling overstyrer menystopp og nestet delegasjon: én aktiv implementeringsagent gjør undersøkelse og interne linser sekvensielt. Separat full BMAD-review er neste steg etter dette review-checkpointet. Kurs/faglærer krever sporbarhet og faktiske tester uten scopeutvidelse.

## Review Triage Log

Brukerens sekvenskrav overstyrte nested delegasjon. Interne buildlinser ble
utført av samme implementeringsagent, sekvensielt; dette erstatter ikke
uavhengig BMAD-review. Startdiff 45,619 kB:
`min(floor(sqrt(45,619) + 1), 10) = 7`.

| ID / linse | Verdict og konkret behandling |
|---|---|
| B1 / blind | medium/patch: skjult holder gir 0 px; måler synlig region og observerer resize. |
| B2 / blind | low/patch: komplett viewer-CSS legger til irrelevante globale stiler; lokalt nødvendig lisensmerket tekstlag brukes. |
| B3 / blind | medium/patch: tekstlag kunne opprettes etter sen getTextContent; aktivkontroll før oppretting og cancel. |
| B4 / blind | medium/patch: Hel side tilpasset bare bredde; bruker også høyde og viewportendring. |
| B5 / blind | medium/patch: mismatchet kilde må ha konkret årsak; sourceTarget og negative unitprøver. |
| B6 / blind | low/patch: PDF-region må kunne rulles med tastatur; navngitt fokusbar region. |
| B7 / blind | low/patch: punktum gjentatt i status; avsluttende tegn settes bare ved behov. |
| V1 / verification-gap | medium/patch: raske klikk alene beviser ikke render-race; hold rAF tilbake og krev ingen gammel canvas. |
| V2 / verification-gap | medium/patch: cleanup under workerlasting må observeres; null worker ved avbrudd og vellykket gjenåpning fra samme original. |
| E1 / edge-case | medium/patch: native modal alene slipper Tab fra siste kontroll til browser; eksplisitt Tab/Shift+Tab-felle, rød/grønn E2E. |
| E2 / edge-case | medium/patch: originalhash er valgfri i eksisterende originalkildekontrakt; tillat utelatt hash ved kjent dokument/side og validert utfall; unit/E2E. |

Alle branches for ukjent/ugyldig kilde, dokumentmismatch, parser-/renderfeil,
sidegrenser, sentsvar, cancel/destroy, responsive dialogretur og immutable
analyseutfall ble fulgt. Beholdt listeheading/IntersectionObserver og
report-announcement er dekket av uendrede 2.6-regresjonsprøver. Ingen
uløste findings, intent gaps eller ny produkt-/arkitekturavgjørelse.

## Design Notes

Canvas og tilgjengelig tekstlag kommer fra samme fysiske originalside.
Automatisk sideskift beholder funnfokus. Manuell naboside/zoom er lokal
visningskontekst i rapportøkt, ikke rapport-/funnmutasjon. Smalt panel
bruker samme viewer og original, uten gjenanalyse eller separat fane.

## Verification

Se [egenverifikasjon og AC-matrise](story-2-7-verifikasjon.md),
[første kjøring](story-2-7-kontroller.txt) og
[full sluttregresjon](story-2-7-sluttkontroller.txt).

Sluttregresjon bestått: 505/505 Vitest, typecheck, lint, build og 66/66
bygget-app + 2/2 dev-E2E. Story 2.7 er review, ikke done.
