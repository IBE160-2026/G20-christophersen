---
title: 'Story 4.2 — Analysere hele rapportgrunnlaget'
type: 'feature'
created: '2026-10-23'
status: 'in-review'
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

Implementert versjonert request, adapter, abortbundet fetch og eid valideringsworker. 171/171 relevante tester består også med OS-sperret eksternt nett; typecheck/lint/build består. [Egenverifikasjon](story-4-2-verifikasjon.md). Uavhengig review gjenstår.

## Spec Change Log

## Review Triage Log

## Design Notes

Ingen intensjonsgap/irreversibel handling. Modulnavn, factory-signal og stoppbar parsing er rutinevalg innen R1.

Sett eksplisitt `max_output_tokens: 128000` inklusive reasoning og `truncation: 'disabled'`. Hele faktiske requesten inklusive prompt/schema/sidemerker kontrolleres autoritativt av leverandøren mot 1050000 tokens i samme forsøk; kontekstoverskridelse gir trygg feil. Ingen byte-/tegnheuristikk/ekstra tokenkall eller påstand om lokal eksakt telling/garantert ledig 128000. Kontekst-/outputtak gir `incomplete`, som avvises også med tekst. Begrunnelse: [modell](https://developers.openai.com/api/docs/models/gpt-6.1-sol), [Responses](https://developers.openai.com/api/reference/resources/responses/methods/create), [reasoning](https://developers.openai.com/api/docs/guides/reasoning), kontrollert 2026-10-23.

SDK6.9.1 rydder fetch-timer ved headere og parser body senere. Adaptereid abort/frist må derfor omfatte lesing og validering; `asResponse()` omgår SDK-parsing. Synkront arbeid må kunne stoppes, eksempelvis i eid worker. Kontroller deadline før retur; Promise.race alene er utilstrekkelig. Abort garanterer ikke kostnadsstopp.

## Verification

Agentmiljø: Node24.21.0 i `/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin` først i PATH (npm fra `/opt/homebrew/bin`). Bevar rå-sessionloggen utenfor fasecommitene; parent eier commit/review/sluttregresjon. Nettprofil: `.docs/implementation-artifacts/story-5-3-nettprofil.sb`; Playwright-cache `/private/tmp/ibe160-story-3-5-browsers`.

- `npm test -- tests/unit/live-adapter.test.ts tests/integration/live-analysis.test.ts tests/unit/backend-config.test.ts tests/unit/document-analysis.test.ts tests/integration/demo-screening.test.ts` — alle relevante tester består uten eksternt nett/betalt API.
- `npm run typecheck`, `npm run lint`, `npm run build` — består. Full regresjon samordnes av mini-sprintens orkestrator.
