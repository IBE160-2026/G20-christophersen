---
title: 'Story 4.2 — Analysere hele rapportgrunnlaget'
type: 'feature'
created: '2026-10-23'
status: 'done'
baseline_commit: '254182bdb72015258b2e34bd3cfa6457770c1f64'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.docs/implementation-artifacts/epic-4-context.md'
  - '{project-root}/.docs/planning-artifacts/r1-live-ki-semester-v1.md'
  - '{project-root}/.docs/specs/spec-IBE160/grensekontrakter.md'
---

<frozen-after-approval reason="Eksisterende Story-AC og godkjent mini-sprint er autorisert grunnlag">

## Intent

Lever reell live-adapter med versjonert uttrekksoppgave. Originale Story 4.2 AC1–AC6/testkrav gjelder uendret; R1 og AD-1/AD-3–AD-6/AD-9/AD-10 styrer.

## Boundaries & Constraints

**Always:** Hele `DocumentBasis` med alle fysiske PDF-posisjoner/tekster/statuser i ett Responses-kall gjennom `openai@6.9.1`. Bruk `gpt-6.1-sol`, reasoning low, Standard, strict `text.format`, kontrakt/uttrekk 2/1 og kodebestemt identitet. Alle eksplisitte TG2/TG3 med trofast beskrivelse/kilde/usikkerhet. Rapportinstrukser er data. Én absolutt 120000 ms-frist dekker transport, body, parsing og kontraktvalidering; ekstern abort og reell ressursstans gjelder. Bevar offline-demo, finans og kontrollregler.

**Never:** Ingen avkorting/filter/tegnbegrensning, chunking, OCR/vision, ekstra kall/retry/reparasjon/fallback. Ingen nye grader, estimering, finans/marked/juss/anbefaling eller brukerbekreftelse fra KI. Ingen 4.3, betalt API, evaluering eller schema-/planendring. Ingen eksponering/lagring av hemmeligheter/private rapporter/råfeil. Ny produkt-/arkitekturbeslutning krever stopp.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Komplett grunnlag | Faktisk PDF.js-uttrekk, også 30 sider/blankside | Hele ordnede grunnlaget i ett transportforsøk | Dokumentvern før kall |
| RT-5/6/7 | Trykt side 2 på PDF-side 4; uklar grad/kilde/side | Fysisk side 4; original bevares, uklarhet blir kandidat | Ingen gjetting eller oppgradering |
| RT-10 | Terminal completed med gyldig `findings: []` | Completed, fortsatt ukontrollert | Ingen automatisk listebekreftelse |
| RT-9/19 | Avslag, manglende status/felt, feil JSON/schema, incomplete/avkorting | Failed, aldri tomlistesuksess | `invalid-response`; ingen reparasjon |
| Identitetsangrep | Endret metadata eller rapportinstruks om finans | Kodeidentitet og P/L/D/J/Ymin bevares | Kildemotstrid beholdes som usikkerhet |
| Transport/kapasitet | 400 kontekstfeil, 408/409/429/5xx eller nettfeil | Trygg kjent analysefeil, høyst ett forsøk | Kodeeid årsak uten råfeil |
| Frist/abort | Heng før/etter headere, treg body/parsing/validering, sent svar | Transport/lesing/arbeid stoppes og ryddes | `timeout` ved ≥120000 ms; ellers `interrupted` |

</frozen-after-approval>

## Code Map

- `src/backend/analysis/backend-config.ts` — gjenbruk settings/bundet create fra 4.1 (`254182bdb72015258b2e34bd3cfa6457770c1f64`); behold retry/timeout.
- `src/backend/analysis/adapter.ts`, `analyze-document.ts` — adapter, trygg feil, dokumentvern/kodebinding; signal bindes i factory.
- `src/contracts/document-analysis.ts`, `analysis-validation.ts` — gjenbruk schemas, `bindAnalysisOutcome` og kildeklassifisering; bevar ukjent grad/tallstrengside/feil dokument/hash.
- `src/backend/documents/extract-pdf.ts` — ekte fixturegrunnlag og eksisterende worker-mønster.
- `tests/unit/document-analysis.test.ts`, `tests/integration/pdf-extraction.test.ts`, `demo-screening.test.ts` — kilde-/RT-/finansfasit; backend-config-test viser ekte SDK/fetch.
- `src/backend/http/` og `server.ts` — bevares; fasekobling og duplikatsperre tilhører 4.3.

## Tasks & Acceptance

**Execution:**
- [x] `src/backend/analysis/live-request.ts` — komplett request og versjonert strict schema: objektrot, obligatoriske felt/null, `additionalProperties: false`, ingen funnantallsgrense.
- [x] `src/backend/analysis/live-adapter.ts` med eventuell eid parser-worker — ett kall, terminalkontroll/mapping/validering/deadline. Ingen uvalidert delretur. Rydd timer/lyttere/reader/worker alltid.
- [x] `tests/unit/live-adapter.test.ts`, `tests/integration/live-analysis.test.ts` — test matrisen med ekte SDK/kontrollert transport. Sammenlign serialisert body med hele faktiske fixtureuttrekket, også statuser/sidemerker/siste tekst på side 30. Tell fetchforsøk per feilvariant; test abort før start, body-abort, frist under parsing/validering, sent svar, RT-5/6/7/9/10/19, duplikat-ID, blanksidekilde og uendret finans/kontroll/screening mot demo.
- [x] `src/backend/README.md`, `.docs/implementation-artifacts/story-4-2-verifikasjon.md` — dokumenter versjoner/kapasitet/abort/testbevis og prosesspor etter kursføringen.

**Acceptance Criteria:** AC1–AC6 samlet; validering beviser verken semantikk, brukerkontroll eller S2.

## Implementation Notes

Implementert versjonert request, adapter, abortbundet fetch og eid valideringsworker. 171/171 relevante tester består også med OS-sperret eksternt nett; typecheck/lint/build består. [Egenverifikasjon](story-4-2-verifikasjon.md). Uavhengig BMAD-review bestått; F1–F5 lukket med 48/48 uavhengige målrettede tester.

## Spec Change Log

## Review Triage Log

Pass1: to runtimefeil og tre avgrensede testgap rutes som rutinepatch mot eksisterende AC/R1. Ingen frozenendring eller ny beslutning. Alle kandidater er individuelt triagert i [rapporten](story-4-2-review.md).

| ID/lens | Kandidat, sted og foreslått vern | Individuell vurdering og bevis |
|---|---|---|
| A1 adversarial | live-adapter:82–106; analyzeDocument binder synkront igjen etter adapterfristen; foreslår å føre bundet resultat videre | Avvist som separat 4.2-brudd. Worker:28–30 parser både AdapterOutcome og faktisk bindAnalysisOutcome innen fristen; returnert adapterutfall er allerede validert. R1 definerer endepunkt som terminalt validert adapterutfall. Den generelle binderen i analyze-document:27 er uendret defensiv binding; live HTTP-supervisor/fasekobling eies av 4.3. Ingen ny kontrakt innføres her. |
| A2 adversarial | live-adapter:24–28; dokumentparse/JSON før timer; foreslår frist ved entry | Avvist. R1 starter fristen når leverandørforespørselen startes, etter lokal dokumentfase. Request bygges før dette; ingen transport er startet før linje 57. Ingen ny strengere entry-frist kan avledes. |
| A3 adversarial | live-adapter:90–104; timer/abort fjernes før await terminate; foreslår beholdt observasjon | Delvis F1. På suksessbanen finnes faktisk etterkontroll og native terminate avventes. En vilkårlig aldri-resolverende erstatning for Node terminate er ikke påvist runtimeoppførsel. Feilbanens oversprungne etterkontroll er derimot reprodusert og skal rettes. |
| A4 adversarial | live-adapter:85–105; throw hopper over etterkontroller; foreslår felles terminalisering | Bekreftet F1 med faktisk worker + kontrollklokke; invalid-response mottatt der timeout forventes. |
| A5 adversarial | live-adapter:65–72; ubundet body; foreslår ny bytegrense | Avvist. Ingen godkjent provider-envelope-bytegrense finnes. R1 forbyr skjulte tegn-/inputgrenser og pålegger full rapport/alle funn. Ordinær respons avgrenses av providerens outputbudsjett og absolutt frist; ny produktgrense er ikke autorisert av denne reviewen. |
| A6 adversarial | live-adapter:72; structured clone gir pause/minnetopp; foreslår transfer | Avvist som konkret feil. Kopiering er synkron og har kostnad, men det er ikke målt fristoverskridelse eller feil ved støttet fixture/providerbudsjett. Check etter await avviser utløpt frist. Overføringsoptimalisering alene er ikke en nødvendig kravretting. |
| A7 adversarial | live-adapter:72–88; worker-startfeil blir transport-failure; foreslår adapter-failure | Avvist som AC-brudd. Eksisterende grense gir kjent trygg analysefeil, uten hemmeligheter/nytt forsøk/falsk fullføring. AC5 krever ikke egen worker-startkode. Lokal klassifisering kan forbedres, men er ikke nødvendig for denne leveransen. |
| A8 adversarial | live-adapter-test:128–141; fake tid ved listener beviser ikke aktiv parsing; foreslår handshake/workload | Avvist. Testen oppretter ekte eid Worker, stopper via adapterfristen og observerer faktisk threadId=-1. Det viktige ressursvernet er workerstans; en parserfase-handshake tester en intern fase og er ikke nødvendig for å bevise at samme worker kan stoppes. Ingen parser blir igjen i en annen prosess. |
| A9 adversarial | live-adapter-test; ekstern abort under worker mangler; foreslår separat worker-aborttest | Avvist som selvstendig åpent gap. Ekstern abort observeres i body-testen, workerstans i deadline-testen; begge bruker samme stop/stopped/finally-kjede. Ingen separat udekket worker-spesifikk ekstern-abortgren er vist. Cleanup-abort på feilbane inngår likevel i konkrete F1. |
| A10 adversarial | live-adapter-test; cleanup-failure/forlenget cleanup utestet; foreslår delay/reject på begge baner | Bekreftet i avgrenset form F1. Konkret feilbane er reprodusert; ingen generell test av umulig evig native terminate kreves. |
| E1 edge-case-hunter | live-adapter:102–106; samme etterfølgende sync-binding som A1; foreslår bindWithDeadline | Avvist av samme eksplisitte R1-grense som A1. Claims sjekket av laget etter tracing. Beholdes som overlappsignal, ikke nytt krav om endret delt adapterkontrakt. |
| V1 verification-gap | live-request:39; store:false kan endres uten testfeil; foreslår transportassertion | Bekreftet F4. Alle live-/backend-config-tester lest; symbolsøk og store-søk viste ingen assertion. |
| V2 verification-gap | live-request:42; strict:true alene beskytter ikke schema; foreslår uavhengige schemaforventninger | Bekreftet F3. Fake provider ser ikke schemaet før den returnerer håndskrevet data; response-testene beskytter ikke requestskjemaet. |
| B1 blind | live-request:39–44; ingen lokal kapasitet/headroom-vurdering; foreslår reservasjon | Avvist. Hele requesten inklusive prompt/schema sendes med truncation disabled, max_output_tokens 128000 inkl. reasoning; provider autoritativt avviser kontekstoverskridelse i samme forsøk. Ingen garanti om 128000 ledig output påstås. R1 krever trygg feil ved kapasitetsavslag, som HTTP400-testen observerer; nytt tokenkall/tegnheuristikk er ikke tillatt. |
| B2 blind | live-adapter:72; clone blokkerer før parser; foreslår transfer | Avvist som A6: kostnad er reell, konkret frist-/produktfeil under godkjente rammer ikke vist. |
| B3 blind | live-response-worker:31; returnerer ubundet resultat og bindes igjen | Avvist som A1/E1: full kontrakt-/kildevalidering gjøres allerede i worker før adapterretur. Ingen 4.3-innkoblingsendring kreves. |
| B4 blind | live-adapter:89–104; timer avsluttes før terminate er ferdig | Delvis F1 som A3. Faktisk workerstans avventes og sjekkes ved normalretur; feilbanen hopper over kontrollene. Bare det konkrete bruddet tas videre. |
| B5 blind | live-adapter-test; ekstern abort under worker/cleanup utestet | Delvis F1, ellers samme avvisning som A9. Den faktisk forskjellige cleanup-feilbanen trenger test og retting. |
| B6 blind | live-adapter-test; parserdeadline-test mangler fasebevis | Avvist som A8. Ekte workerstans er testens relevante observerbare ressursutfall, ikke en bestemt parserinstruksjon. |
| B7 blind | live-adapter-test; flere tekster/ukjent item/top-error/reasoning-only utestet | Bekreftet F5 etter gjenlesing av invalid-response-matrisen og repository-søk. De fire guards kan forsvinne uten eksisterende testfeil. |
| B8 blind | live-analysis-test; prompt/schema/modell/low/tier/budsjett/truncation/store ikke assertet | Delvis F3/F4. Påstanden er feil for modell/low/tier/budsjett/truncation: de assertes faktisk i F1–F4-integrasjonens linje 39. Promptsemantikk inspiseres som versjonert instruksjon; ingen phrase-existence-test kreves. Schema og store er konkrete udekkede requestfelt. |
| T1 triageprobe | live-response-worker:19; kjent incomplete/in_progress reasoning ignoreres | Bekreftet F2 i to uavhengige kontrollerte responser gjennom ekte SDK og worker. |


## Design Notes

Ingen intensjonsgap/irreversibel handling. Modulnavn, factory-signal og stoppbar parsing er rutinevalg innen R1.

Sett eksplisitt `max_output_tokens: 128000` inklusive reasoning og `truncation: 'disabled'`. Hele faktiske requesten inklusive prompt/schema/sidemerker kontrolleres autoritativt av leverandøren mot 1050000 tokens i samme forsøk; kontekstoverskridelse gir trygg feil. Ingen byte-/tegnheuristikk/ekstra tokenkall eller påstand om lokal eksakt telling/garantert ledig 128000. Kontekst-/outputtak gir `incomplete`, som avvises også med tekst. Begrunnelse: [modell](https://developers.openai.com/api/docs/models/gpt-6.1-sol), [Responses](https://developers.openai.com/api/reference/resources/responses/methods/create), [reasoning](https://developers.openai.com/api/docs/guides/reasoning), kontrollert 2026-10-23.

SDK6.9.1 rydder fetch-timer ved headere og parser body senere. Adaptereid abort/frist må derfor omfatte lesing og validering; `asResponse()` omgår SDK-parsing. Synkront arbeid må kunne stoppes, eksempelvis i eid worker. Kontroller deadline før retur; Promise.race alene er utilstrekkelig. Abort garanterer ikke kostnadsstopp.

## Verification

Agentmiljø: Node24.21.0 i `/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin` først i PATH (npm fra `/opt/homebrew/bin`). Bevar rå-sessionloggen utenfor fasecommitene; parent eier commit/review/sluttregresjon. Nettprofil: `.docs/implementation-artifacts/story-5-3-nettprofil.sb`; Playwright-cache `/private/tmp/ibe160-story-3-5-browsers`.

- `npm test -- tests/unit/live-adapter.test.ts tests/integration/live-analysis.test.ts tests/unit/backend-config.test.ts tests/unit/document-analysis.test.ts tests/integration/demo-screening.test.ts` — alle relevante tester består uten eksternt nett/betalt API.
- `npm run typecheck`, `npm run lint`, `npm run build` — består. Full regresjon samordnes av mini-sprintens orkestrator.

Reviewretting F1–F5 er lukket etter uavhengig patchkontroll og 48/48 live-tester. Feil/suksess terminaliseres etter cleanup, ikke-terminal reasoning avvises, og sendt schema/store:false samt terminalfeilvarianter har regresjonsvern. Ingen åpne funn eller nye beslutninger.
