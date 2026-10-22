---
title: 'Story 5.1 — Samlet automatisk demoverifikasjon'
type: 'chore'
created: '2026-10-22'
status: 'in-review'
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

## Verification

- `npm test` — alle unit-/integrasjonstester består.
- `npm run test:e2e` — faktisk build, bygget-app og dev-E2E består.
- `npm run test:components`, `npm run lint`, `npm run typecheck` — supplerende eksisterende kontroller består.
- `git diff --check` — ingen whitespacefeil; diff gjennomleses før overlevering.
