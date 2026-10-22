---
title: 'Story 5.1 — Samlet automatisk demoverifikasjon'
type: 'chore'
created: '2026-10-22'
status: 'done'
route: 'dispatch'
story_key: '5-1-etterprøve-den-samlede-demoen-med-meningsfulle-automatiserte'
baseline_commit: '8b28fa296a2f37072b8f583290e2a9ec8791be00'
review_loop_iteration: 0
context:
  - '{project-root}/.docs/implementation-artifacts/epic-5-context.md'
---

<frozen-after-approval reason="Brukeren har bestilt avgrenset Story 5.1 etter eksisterende AC og sekvensiell implementering før uavhengig review">

## Intent

**Problem:** Demoen har omfattende funksjonsnære tester, men mangler samlet dokumentert RT-/BT-/AT-/FR-5-spor og én integrasjonsprøve som kobler faktisk PDF, lagret adapter, kontrollert økt og finans/screening mot F1–F4-fasit. Sensor trenger etterprøvbare lokale testresultater på en identifisert versjon.

**Approach:** Gjennomfør Story 5.1 AC1–5 i epics.md. Kjør eksisterende meningsfulle tester samlet og lukk bare konkret påviste hull i den låste kjerneflyten. Sammenstill faktiske resultat/kommando/versjon og spor hvert eksisterende testeksempel til riktig grense. Bruk håndskrevet kravfasit og faktiske moduler; ingen betalt tjeneste.

## Boundaries & Constraints

**Always:** Eksisterende epics-AC, SPEC CAP-1–8, UX DESIGN/EXPERIENCE, arkitektur AD-1–10, sprintplan og sprintstatus gjelder. Rene moduler eier beregninger og anbefaling. Kontrolladapter bruker samme analysegrense som produktet. Fasit skal være uavhengig av beregnings-/format-/regelmodulen som testes. Testene må kunne oppdage feil verdi, prioritet, status, side, revisjon og ekstra kall. Dokumenter faktisk bestått/feilet/ikke kjørt med begrensning og spor eventuelle feil til funksjonsstory.

**Never:** Ingen Epic 4 eller R1-beslutning, live-S2-/S5-påstand, S6-personverifikasjon, senere storyleveranser, ny navigasjon/snarvei, ny testtype, dekningsprosent, konkurrerende fasit eller generell omskriving. Uoppnåelige feiltilstander prøves ved modul/reducer/komponent. Ikke endre autoritative krav. Ikke endre eller inkludere de to eksisterende rå-jsonl-loggene. Ingen push; story blir bare in-review/review før separat godkjent review.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| F1/F2 | Faktisk PDF, kontrollert rapport og komplett F1/F2-finans | F1: 11,875 %, 1500000, 9,375 %, 700000/Gå videre. F2: 8,75 %, 1000000, 6,25 %, 200000/Forkast | Én analyse per rapport |
| F3 | Faktisk F3-PDF og manglende L | Ingen leieavhengige tall; Innhent mer informasjon ved ren vurderingsgrense | Eksisterende hovedreiseport sperrer normal videregang |
| F4 | Faktisk F4-PDF og separat Uavklart TG3 | F1-tall som delgrunnlag/Innhent mer informasjon; TG3 PDF-side 4 | Listebekreftelse avklarer ikke TG3 |
| Øvrige fasitvarianter | RT-1–19, BT-1–18, AT-1–20 og sju FR-5-eksempler | Spor til kjørte tester med meningsfulle forventninger ved riktig grense | Reelle modelltreff RT-16–18 forblir uprøvd i Epic 4 |

</frozen-after-approval>

## Code Map

- `tests/integration/demo-analysis.test.ts`: faktisk validatePdf/extractPdf/analyzeDocument og lagret adapter, separat håndskrevet PDF-fasit; gjenbruk modulgrensen.
- `tests/unit/result-snapshot.test.ts`, `tests/helpers/screening-state.ts`: reelle reducerhandlinger/bekreftelser og snapshotbinding; eksisterende hjelpere konstruerer adapterutfall og erstatter derfor ikke den nye sammenhengende integrasjonsprøven.
- `src/frontend/state/session.ts`, `report.ts`, `result.ts`: eksisterende økt, kontrollport, findingListBasis/calculateResultSnapshot; gjenbruk uten produktendring.
- `tests/unit/finance.test.ts`, `thresholds.test.ts`, `complete-screening.test.ts`: presise BT-/AT-/FR-5-forventninger, samtidige prioritet-1-utløsere og faste tekster.
- `tests/e2e/report-analysis.spec.ts`, `screening-result.spec.ts`: bygget app, reelle kontrollhandlinger, PDF-side, historisk/gjeldende, adapterkall og sene svar. Eksisterende Playwright-konfigurasjon registrerer dem; ikke innfør skjult testfil uten registrering.
- `tests/fixtures/property-cases/expected.json`: forhåndsdefinert fiktiv F1–F4-fasit fra Story 2.2, uavhengig av adapterretur.

## Tasks & Acceptance

**Execution:**
- [x] `tests/integration/demo-screening.test.ts` — føy til sammenhengende faktisk PDF-/demo-/kontroll-/screeningprøve for F1–F4 med eksakte forventninger og kallantall; kontroller F3 ved ren grense og behold sperret normal navigasjon.
- [x] `.docs/implementation-artifacts/story-5-1-verifikasjon.md` — spor alle RT-/BT-/AT-/FR-5-eksempler til faktisk testgrense; dokumenter hull/retting, sensitivitetsvurdering, miljø, versjon, kommando, resultat og begrensninger.
- [x] `.docs/process/arbeidsokter/2026-10-22-story-5-1.md` og `.docs/process/prompts/2026-10-22-story-5-1.md` — bevar viktig prompt, kildebruk, valg og verifikasjonsspor; eksplisitt lokal commit før overlevering til review.

**Acceptance Criteria:**
- Given leverte tester, when npm test og npm run test:e2e kjøres etter browser-/buildforberedelse, then faktiske moduler og bygget app består mot uavhengig fasit og kommando/versjon/resultat lagres (AC1).
- Given BT/AT/FR-5 og feil/endringsforløp, when samlet verifikasjon gjennomgås, then AC2–4 er dokumentert ved riktig testgrense med eksakte tall/prioritet/status/side/revisjon/kall og uten ny navigasjon.
- Given funn eller udekket kontroll, when det håndteres, then krav/funksjonsstory, relevant retting og ny test er sporbare; uprøvd live/manuell evaluering rapporteres åpent (AC5).

## Implementation Notes

- Planlegging: Ingen uløste intentgap eller irreversible handlinger. Fotavtrykket er én ny integrasjonstest og test-/prosessbevis, ingen offentlig produktkontrakt. Brukerens eksplisitte mini-sprintbestilling er godkjenning av dette avgrensede eksisterende storyarbeidet. Implementeringsagenten er allerede sekvensielt delegert fra orkestrator; ingen ny implementeringsagent kreves.

- Implementert kun `tests/integration/demo-screening.test.ts` med 4 F1–F4-prøver. F3-oppsettet ble rettet etter at første prøve korrekt støtte på normal report-start-port; gyldig rapportkontroll etableres før L fjernes. Ingen produktkode/krav/timeout er endret.
- Ny integrasjon 4/4, full isolert Vitest 962/962, bygget-app 114/114, dev 3/3 og komponenter 37/37 består, samt typecheck/lint/build. To første fulle Vitest-forsøk er bevart: sandbox-EPERM og én eksisterende 5 s F1 HTTP-timeout under samtidig Chromium. Isolert omkjøring er grønn uten kodeendring; konkurranse er sannsynlig, ikke bevist årsak.
- RT/BT/AT/FR-5-matrisen og konkrete assertions er gjennomgått; alle relevante avsluttende tester kjørte. Live-S2/S5, faktisk annen person/S6 og manuell UX er ikke påstått. Se [verifikasjon](story-5-1-verifikasjon.md) og [arbeidsøkt](../process/arbeidsokter/2026-10-22-story-5-1.md). Checkpoint in-review/review, ingen done eller review utført av implementeringsagenten.

## Spec Change Log

## Review Triage Log

Full uavhengig review: [rapport](story-5-1-review.md). Alle kandidater nedenfor er fra blind-hunter; øvrige tre lag fullførte uten funn. Fire direkte patcher er utført, seks kandidater avvist; ingen produkt-/kravendring.

| ID | Kandidat | Dom / bevis / håndtering |
|---|---|---|
| 1 | Full implementeringscommit mangler i bevart arbeidsøkt. | low → patch. Baseline var dokumentert, men den lovede endelige ID-en manglet. Full `28028b955823517607f8402151be84f04443e0f2` er lagt til arbeidsøkt og verifikasjon. |
| 2 | Lokale tall/anbefalinger utgjør en konkurrerende finansfasit. | false. Tallene er identiske håndskrevne PRD-/Story 2.2-forventninger (F1 1500000/700000, F2 1000000/200000), ikke generert fra adapter/beregning. `expected.json` leverer input og PDF-funn; lokale forventninger til eksakte ratioer/koder gir uavhengig kontroll. Ingen motstrid eller konkurrerende kravfasit er påvist. |
| 3 | Kalltelleren kan tolkes som HTTP-bevis etter navigasjon. | low → patch. Direkte `analyzeDocument` kjøres før økten; reduceren utfører ikke HTTP. Rapporten presiserer direkte pipelinekall og peker til eksisterende HTTP/E2E for fravær av ekstra forespørsler ved kontroll/endring. |
| 4 | Individuell bekreftelse kan implisitt bekrefte listen uten at integrasjonen merker det. | false som samlet verifikasjonshull. `finding-list-control.test.ts` AC1 sjekker etter enkeltfunn at `listConfirmationRevision` er null og informasjon fortsatt kreves, før separat listehandling. Dette inngår i kjørt suite og den nye relevante omkjøringen. Den nye testen trenger ikke gjenta hver allerede prøvd mellomtilstand. |
| 5 | F4 bør ikke eksplisitt registrere Uavklart før listekontroll. | false. Produktkontrakten krever separat eksplisitt TG3-håndtering. `finding-list-control.test.ts` AC3 viser at listebekreftelse alene gir `tg3Handled:false`, tom TG3-registrering og ufullført kontroll; eksplisitt Uavklart fullfører kontroll uten å avklare TG3. Å utelate handlingen ville teste feil hovedreiseforventning. |
| 6 | F3-løkken kan passere vakuøst dersom metrikker mangler. | low → patch. `Object.values` alene sikrer ikke kardinalitet. Alle fire metrikknavn sjekkes nå eksplisitt før unavailable/null-assertions. |
| 7 | Revisjoner sammenlignes bare med reducerens egne verdier. | false som samlet hull. Dette uendrede forløpet har listRevision 0, siden ingen brukt korrigering/avvisning skjer; respons/enkeltfunn er ikke revisjonsøkninger. `result-snapshot.test.ts` AC1 forventer eksplisitt listRevision/listConfirmationRevision 0, finding revision 0 og tg3Revision 0; endringsmatrisen sjekker eksakt +1. `finding-list-control.test.ts` sjekker konkret 1 etter brukt endring. |
| 8 | Finansbinding mangler i ny integrasjon. | false som samlet verifikasjonshull. `result-snapshot.test.ts` AC1 sjekker alle fem finansbekreftelser, finansgrunnlag og binding; AC2-matrisen sjekker hver endrings +1 og opphevet berørt bekreftelse. Disse prøvene kjøres i regresjonen og omkjøringen. Ingen endret finansbinding i denne storyen. |
| 9 | Integrasjonen mangler full begrunnelse/neste handling. | false som samlet verifikasjonshull. `complete-screening.test.ts` F1/F2, AT-18/19 og FR-5 prøver fulle faste tekster/handlinger ved ren funksjonsgrense. Verifikasjonen sier uttrykkelig at disse ligger i U/complete-screening; ny integrasjon beskrives med eksakte tall/koder/kontrollport. Ingen påstand om at denne ene testen alene erstatter hele suiten. |
| 10 | Backendfunn kan falle ut av snapshotbasis uten at tall/anbefaling endres. | low → patch. Den nye integrasjonen sjekket backendfunn, men hele outcome ved snapshotgrensen manglet. Snapshotets `reportBasis.outcome` sammenlignes nå med faktisk analysert, allerede uavhengig verifisert PDF-utfall for alle fire case. |

## Review Findings

- [x] [Review][Patch] ID 1: Fast implementeringscommit i arbeidsøkt/verifikasjon.
- [x] [Review][Patch] ID 3: Avgrenset direkte adapterkallteller fra HTTP/E2E-bevis.
- [x] [Review][Patch] ID 6: Eksakt sett av fire metrikker før F3-løkken.
- [x] [Review][Patch] ID 10: Hele faktiske rapportutfallet er bevart i snapshotbasis.

Rejected: ID 2/4/5/7/8/9 er false med individuelle tilbakevisninger i triageloggen. Ingen uløste tiltak eller defer. Full sluttregresjon: 962 Vitest, 114 bygget-app, 3 dev, 37 komponenter; type/lint/build/diffkontroll bestått. Se [reviewrapport og råbevis](story-5-1-review.md).

## Verification

- `npm test` — alle unit-/integrasjonstester består.
- `npm run test:e2e` — faktisk build, bygget-app og dev-E2E består.
- `npm run test:components`, `npm run lint`, `npm run typecheck` — supplerende eksisterende kontroller består.
- `git diff --check` — ingen whitespacefeil; diff gjennomleses før overlevering.
