---
title: 'Story 2.9 — Avvise feilaktig KI-funn med bevart opphav'
type: 'feature'
created: '2026-10-21'
status: 'done'
route: 'dispatch'
story_key: '2-9-avvise-feilaktig-ki-funn-med-bevart-opphav'
baseline_commit: '63627cee85b771f6207c431338eca7a734a9ee24'
context:
  - '.docs/implementation-artifacts/epic-2-context.md'
  - '.docs/specs/spec-IBE160/grensekontrakter.md'
---

<frozen-after-approval reason="Brukerens eksplisitte sekvensielle bestilling fase 2; eksisterende Story 2.9 AC1–AC4">

## Intent

Investoren skal eksplisitt kunne avvise et feilaktig KI-uttrekk etter kontroll mot originalrapporten. Funnet holdes da utenfor aktive rapportfunn, mens original grad, tekst, fysisk kilde, rapportidentitet og brukeravvisningen fortsatt er tilgjengelige. Lever bare Story 2.9 etter epics.md AC1–AC4; 2.8 er done og uavhengig reviewet.

## Boundaries & Constraints

Alltid: Avvis er en eksplisitt brukerhandling i eksisterende funnkontroll, aldri resultat av grad, usikkerhet eller KI. Originalt analyseutfall og PDF-bytes forblir uendret. Brukeravvist opphav skilles tekstlig fra aktive/usikre funn og er fortsatt valgbart med originalkilde. Eksisterende brukt korrigering og ubrukte utkast bevares som separate representasjoner; de må ikke gjøre et avvist funn aktivt eller gjeldende. Avvisning endrer listerevisjon og opphever eventuell listebekreftelse. Andre funns originaler, utkast, brukte rettinger og bekreftelser bevares. Gjentatt avvisning er idempotent. Rapport-/generasjonsvern gjelder også Avvis. Avvisning gjør aldri analysefeil fullført og betyr ingen TG3-avklaring, utbedring eller teknisk godkjenning. Ingen ny HTTP-/adapter-/KI-analyse.

Aldri: TG3-avklaring (2.10), listebekreftelseshandling (2.11), resultat/screening (Epic 3), automatisk avvisning, låste kravendringer, generell refaktor eller push. Låst UX/kontrakt krever ingen egen reverseringshandling; innfør ingen ny handling. Ved ny ulåst produkt-/arkitekturbeslutning stopp og rapporter. Eksisterende readiness beholdes.

## I/O & Edge-Case Matrix

| Gitt / handling | Forventet |
|---|---|
| Aktivt funn / eksplisitt Avvis | Brukeravvist, utenfor aktivt grunnlag; uendret original/provenance og synlig avvisning |
| Bekreftet liste og flere kontrollerte funn / Avvis ett | Listerevisjon +1 og listebekreftelse null; andre kontroller identiske |
| Brukt korrigering eller ubrukt utkast / Avvis | Original og brukerrepresentasjoner bevart separat; ingen brukt eller ubrukt verdi gjør funnet aktivt |
| Avvist påstått TG3 / vis original og retur | Tydelig brukeravvist uttrekk; ingen TG3-avklaring/utbedring/godkjenning |
| Avvist funn / gjenta Avvis og andre kontrollhandlinger | Ingen doble endringer eller reaktivering; konsistent grunnlag og revisjon |
| Usikker kandidat / Avvis | Avvist original fortsatt tilgjengelig; kandidat er ikke aktiv uløst KI-kandidat alene etter avvisning; rapportbegrensninger beholdes |
| Feilet/delvis analyse, gammel generasjon eller ukjent funn / Avvis | Identisk tilstand; feil forblir feil, ingen overført kontroll |
| RT-12 med faktisk dokumentfasit og oppdiktet funn / tastatur-Avvis og retur | PDF beviser feil uttrekk, riktig fysisk originalside tilgjengelig, andre funn består, ett analyse-POST |

</frozen-after-approval>

## Code Map

- `src/contracts/finding-control.ts`: separat brukeravvisningsmarkør i eksisterende FindingControl, uten endring av analysekontrakten.
- `src/frontend/state/report.ts`: eksisterende ren reducer og currentFinding; skill aktiv gjeldende representasjon fra avvist original, gjenbruk generasjons-/rapportvern og listeugyldiggjøring. reportDeficiencies beholder rapport-/analysebegrensninger.
- `src/frontend/screens/FindingControl.tsx`: eksplisitt Avvis, kort lokal status, original tilgjengelig; bevar 2.8-feltfeil og fokusregler. Etter avvisning må fokus være på en synlig tilgjengelig kontroll, uten fokusstjeling ved retur.
- `src/frontend/screens/ReportAnalysis.tsx`: eksisterende liste/PDF-SourceReview; skill aktive, usikre og avviste tekstlig uten å skjule original. Vis brukerkorrigering som historisk når funnet er avvist, aldri gjeldende aktivt.
- `tests/unit/finding-control.test.ts`: rene negative/idempotens-/isolasjons-/metadataoverganger.
- `tests/helpers/report-ui-adapter.ts`, `tests/fixtures/finding-control/`, `tests/e2e/report-analysis.spec.ts`: separat RT-12-fasit/ekte PDF og kontrolladapter med oppdiktet KI-funn, tastatur/fokus/kilde/retur og ett POST.
- `.docs/implementation-artifacts/sprint-status.yaml`, storyens verifikasjon og `.docs/process/arbeidsokter/2026-10-21-story-2-9.md`: sporbar status og testbevis. Bevar aktiv promptlogg utenfor commit.

## Tasks & Acceptance

- [x] Implementer separat avvisningsmetadata og idempotent ren overgang/aktiv seleksjon med bevarings- og revisjonsregler.
- [x] Implementer eksplisitt Avvis og tekstlig tilgjengelig avvist original i eksisterende kontrollflate med tastatur/fokus/status.
- [x] Dekk alle matriserader med meningsfulle unit/RT-12/bygget-app-prøver og kjør nødvendige regresjoner/type/lint/build.
- [x] Dokumenter faktisk bevis, sett spec in-review og sprint 2.9 review og lag lokal checkpoint-commit; ingen uavhengig review i denne implementeringsoppgaven.

Given kontrollert feil KI-funn, when Avvis, then brukeravvist og ikke aktivt med original tilgjengelig (AC1). Given gjeldende liste, when ett avvises, then revisjon/bekreftelse endres og andre funn bevares (AC2). Given avvist påstått TG3 eller analysefeil, when presentert, then ingen TG3-avklaring eller falsk fullføring (AC3). Given gjentatt handling eller retur, when gjentatt, then konsistent/idempotent uten ny analyse (AC4).

## Implementation Notes

Ingen intensjonsgap eller irreversible handlinger. Fotavtrykket er eksisterende kontrollkontrakt/reducer, de to kontrollkomponentene, målrettede tester og dokumentasjon. Brukerens uttrykkelige sekvensielle bestilling autoriserer denne begrensede leveransen og lokale commits uten ny rutinebekreftelse. Ny uavhengig agent reviewer etter implementeringscheckpoint.

## Verification

`npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, bygget-app-E2E og dev-E2E. Bruk eksisterende Chromium med PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-1-2-browsers. Dokumenter faktisk kjørt omfang og AC-spor. Ingen betalt API eller ny avhengighet.

Implementeringscheckpoint 2026-10-21: 534/534 Vitest, 79/79 bygget-app-E2E, 3/3 dev-E2E og typecheck/lint/build bestått. Se [verifikasjon](story-2-9-verifikasjon.md) og [arbeidsøkt](../process/arbeidsokter/2026-10-21-story-2-9.md). Neste port er ny uavhengig review.

### Review Findings

- [x] [Review][Patch] B1/B2 (medium): Avvist ubrukt utkast vises som deaktivert redigeringsskjema; lang beskrivelse kan ikke tastaturrulles, og tidligere feil gir fortsatt aktive rettingsinstruksjoner. Vis samme bevarte verdier som lesbar historikk med tydelig historisk feilopphav. `src/frontend/screens/FindingControl.tsx`.
- [x] [Review][Patch] B4–B9 (medium verifikasjonsgap): Etterprøv faktisk Tab-rekkefølge, synlig kortskjermfokus, status uten gjenavspilling, historisk korrigeringsinnhold, isolasjon av andre usikre kandidater og avvisning etter korrigert ugyldig originalkilde. Ingen nye produktregler.

Rejected: B3 (low): Ingen egen null-aktive-oppsummering er påkrevd i 2.9; hver avvist rad er eksplisitt ikke aktiv, og faktisk tom analyse skilles allerede korrekt. En ny aggregert listetilstand krever ekstra kontrollflyt og er ingen nødvendig direkte feilretting her.

Edge Case Hunter returnerte `[]` og bekreftet deretter uttrykkelig fullført instrukslesing og tracing uten funn. Øvrige lag returnerte eksplisitt fullført uten funn. Alle fire lag ble kjørt sekvensielt; ingen egne filendringer mens de kjørte.

Uavhengig review bestått 2026-10-21: Fire sekvensielle BMAD-lag, én rettet
historikkfeilgruppe og utvidet negativ/tastatur-/fokusverifikasjon. Full sluttregresjon:
538/538 Vitest, 80/80 bygget-app-E2E, 3/3 dev-E2E, typecheck/lint/build bestått.
Se [full review med alle kandidater og AC-bevis](story-2-9-review.md).
Story og sprint 2.9 er done. Ingen ny beslutning eller senere story implementert.
