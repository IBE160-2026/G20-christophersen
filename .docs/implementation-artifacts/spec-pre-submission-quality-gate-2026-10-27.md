---
title: 'Semester-v1: pre-submission quality gate'
type: bugfix
created: 2026-10-27
status: in-review
route: dispatch
baseline_commit: be895e0009ae133b3899e53236e2dfdcab853d5d
review_loop_iteration: 0
context:
  - '{project-root}/AGENTS.md'
---

<frozen-after-approval reason="Mads har bestilt selvstendig retting frem til reell menneskelig gate">

## Intent

**Problem:** Uavhengige sensor-/kodegjennomganger fant arvet live-modus i
E2E og buildkontroll, misvisende TG3-eksempel og tap av første analysefeil
ved duplikatavvisning. Semester-v1 skal være trygg og forståelig før ekte S6.

**Approach:** Rett disse avgrensede feilene, dokumenter sensorens sju
kriterier med usikkerhet og klargjør en commitbundet ren lokal S6-kopi.
Ingen karakter-/S6-godkjenning utledes av intern kontroll.

## Boundaries & Constraints

**Always:** Finans-/screening-/HTTP-kontrakter, eksplisitt Start, varig
backend-duplikatvern og eksisterende retry-regler bevares. Bevar 5375e7f og
be895e0, historiske logger, låste krav, originalobservasjoner og S5-W1.
Ny intern feilbevaring må være rapport-/generasjonsbundet og aldri fullføre
feilet analyse. Review nye endringer uavhengig. Commit lokalt med aktiv
promptlogg. 5.4 backlog og 5.5 in-progress til reelle porter er oppfylt.

**Never:** Push/pull, betalte API-kall, nye features, S5-kjøring,
fasitendring eller simulert ekstern S6. Ingen større omskriving.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Arvet live | Fiktiv live-modus/nøkkel i foreldreprosess | Begge Playwright-servere tvinger demo og tom nøkkel | Ingen leverandørkall |
| Byggkontroll | Arvet live i helper | Bygg-/nøkkelsentinel beholdes, demooppstart består | Nøkkel logges ikke |
| TG3 tak | Uavklart taklekkasje | Forholdsnøytral veiledning om relevant fagkyndig | Samme validering og screening |
| Første feil | Validerte feilårsaker, side og delresultat; så duplicate | Første feil og delresultat bevares; sperre forklares | Aldri fullført/nytt adapterkall |
| Gjentatt duplicate | Andre/tredje manuelle Start | Samme opprinnelige feil beholdes | Duplicate blir ikke ny original |
| Transport før markør | Første transportfeil uten outcome, så gyldig svar | Nytt legitimt manuelt forsøk fungerer | Gammelt feilminne ryddes |
| Ny rapport/sent svar | Filbytte eller forlatt analyse | Tidligere feilminne gjelder ikke ny rapport | Eksisterende korrelasjonsvern gjelder |

</frozen-after-approval>

## Code Map

- `playwright.config.ts`, `playwright.dev.config.ts`: felles webServer-miljø;
  dev sprer baseconfig. Komponenten har ingen slik server.
- `tests/helpers/verify-analysis-build.mjs`: behold fiktiv byggsentinel,
  sett ANALYSIS_MODE=demo eksplisitt.
- `src/domain/tg3-resolution.ts`: bare errors.basis-tekst endres til
  relevant fagkyndig med dato/referanse. Låste elektriske eksempler beholdes.
- `src/frontend/state/report.ts`: report-start nuller outcome; rejected
  bruker fail og mister første feil. Isolert internt previousFailure-felt
  kan bevare outcome/error under forsøk og gjenopprette ved duplicate.
  Nulles ved nytt filvalg/gyldig nytt svar/andre terminalutfall.
- `src/frontend/screens/ReportAnalysis.tsx`: forklar gjentatt forsøk og
  duplikatsperre; vis original kode også når outcome var null. Ingen ny
  knapp, automatisk retry eller backendendring.
- `tests/unit/report-session.test.ts`, relevante E2E-filer og
  `tests/unit/complete-screening.test.ts`: eksisterende fasit/korrelasjon og
  skjermkontroll. Legg til meningsfulle regresjoner, oppdater kun generisk
  forventet hjelpetekst; ikke finans-/screeningfasit.
- `README.md`: eksplisitt demo ved utviklingsstart og testmiljøforklaring.
- Eksisterende 5.4-instruks/bevismal og 5.5-kontroll: gjenbruk som autoritet.

## Tasks & Acceptance

**Execution:**
- [x] Kode-/testfiler ovenfor: implementer tre verifiserte rettingsområder.
- [x] Målrettede regresjoner for alle matriserader, typecheck/lint/build;
  full regresjon dersom state-/miljøendringen tilsier det.
- [x] Sensorrapport, uavhengig endringsreview, sentral issue-sporing og
  oppdatert 5.5-sporbarhet, uten parallelle buglister.
- [ ] Ren S6-eksport av faktisk lokal commit, inventar/hash og kort
  overlevering, uten falske eksterne observasjoner.

**Acceptance Criteria:**
- Given arvet live-miljø, when README-testene starter server, then demo
  brukes uten nøkkel eller betalte kall.
- Given opprinnelig feil og manuell duplikat, when feilvisningen leses,
  then opprinnelig årsak/mål/delresultat og sperren kan forstås.
- Given ren eksport, when den kontrolleres, then full commit og hash
  identifiserer akkurat eksportert versjon uten lokale artefakter.

## Implementation Notes

Tre uavhengige lesegjennomganger er gjennomført før endring. Brukerens
uttrykkelige selvstendighetsmandat dekker ordinære interne checkpoints;
vesentlige produktvalg og ekte ekstern S6 krever mennesket. Implementerings-
agenten utfører kode/test/README-delen, mens hovedagenten etterpå samler
sensorrapport, issue-/leveringsdokumentasjon og ren eksport sekvensielt.
Node 24.21.0 finnes under /private/tmp/ibe160-story-1-1-runtime/.
Ingen ekte nøkler skal leses eller brukes. Kjør kun relevante rene
unit-tester direkte; server-/browserkontroller organiseres av hovedagenten
med OS-sperret eksternt nett og fiktivt/sanert miljø.

## Spec Change Log

## Review Triage Log


| Funn | Verdict | Bevis / behandling |
| --- | --- | --- |
| B1 | medium | Eksakt blobhash/pattern erstatter sti-unntak; initial kilde/JSON bevart; negativ guard grønn. |
| B2 | medium | Eksport avviser usporede filer før arkivoppretting; negativ kildefilprøve grønn. |
| B3 | medium | Alle tracked filer må matche valgt commit; endret tsconfig avvises. |
| B4 | low | Supplerende unionkontroll bekrefter ingen slettinger og de fire faktiske endringene; historisk script bevares. |
| B5 | low | Faktisk eksport/kvittering er planlagt etter kodecommit og fullføres før sluttcheckpoint. |
| B6 | low | Sentrale lukkeposter føres først etter faktisk rettingscommit og godkjent review/test. |
| B7 | low | In-review er korrekt under review; intern spec ferdigstilles etter eksport, uten story-done. |
| B8 | low | Egen slutt-reviewrapport og rå funn registrert, commitbinding tilføyes etter faktisk commit. |
| B9 | low | Ny regression med ulike requestId og sent originalt svar; 35/35 report-session grønn. |
| B10 | low | Allerede fullførte historiske kjøringer; nye generelle timeoutverktøy avvist som unødvendig kompleksitet. |
| E1 | medium | Samme rotårsak som B1; rettet guard og full repo-audit bestått. |
| E2 | medium | Samme rotårsak som B2/B3; begge faktiske negative eksportprøver består. |

Kanttilfelle-revieweren rekontrollerte guardrettingene, negative prøver og
requestId-regresjonen: `[]`, ingen konkrete gjenstående funn.
Full [triage](pre-submission-review-2026-10-27.md) bevarer alle vurderinger.

## Verification

Kjør målrettede report-session/TG3/screening- og config-regresjoner; deretter
relevant UI/E2E med OS-nettsperre. State-/testserverendringer begrunner en
ny samlet regresjon etter retting. Gamle bevis beholdes uten omskriving.


Faktisk utført: full Vitest 1088, full E2E 195/197 (to gamle generiske
tekstforventninger), deretter 134 unit/6 E2E grønn rekontroll; 3 dev,
37 komponent, 7 helper og 204 frontendfiler uten nøkkellekkasje. Etter
review består ekstra requestId-regresjon, 35 report-session. Ingen ny
produktkode etter grønn rekontroll. Se [samlet gate](pre-submission-quality-gate-2026-10-27.md).
