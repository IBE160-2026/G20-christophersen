---
title: 'Story 4.1 — Konfigurere valgt live-leverandør uten å eksponere nøkkelen'
type: 'feature'
created: '2026-10-23'
status: 'in-review'
baseline_commit: 'f80c88f85346ae9e7a1b166eafcc88380fc99fcc'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.docs/implementation-artifacts/epic-4-context.md'
  - '{project-root}/.docs/planning-artifacts/r1-live-ki-semester-v1.md'
  - '{project-root}/.docs/specs/spec-IBE160/grensekontrakter.md'
---

<frozen-after-approval reason="Eksisterende Story-AC og brukerens mini-sprintbestilling er autorisert grunnlag">

## Intent

Backend skal kunne konstruere den ene vedtatte live-klienten fra eksplisitt lokal konfigurasjon med trygg feilgrense. Standarddemo skal fortsatt fungere offline uten nøkkel eller KI-klient. Story 4.1 AC1–AC5 i [epics](../planning-artifacts/epics.md) gjelder uendret; R1 er bindende.

## Boundaries & Constraints

**Always:** OpenAI Responses, `gpt-6.1-sol`, reasoning low, `service_tier: default`, offisiell `openai` JS/TS-SDK med eksakt pinnet og dokumentert kompatibel versjon. Backend leser bare `OPENAI_API_KEY`; ingen hemmeligheter i frontend, build, Git, logger eller feil. SDK `maxRetries: 0`, `timeout: 120000`; kontrollert transport/abort må kunne brukes av 4.2. Bevar appens smale adapter og kontraktversjon 2/uttrekk 1. Ugyldig live-konfigurasjon gir kodeeid trygg analysefeil uten fallback eller kall. Hele 30-sidersscope og R1s kapasitets-/budsjettgrunnlag bevares. Følg eksisterende R2/R3 og kursføringer for sporbarhet, smalt scope og kjørbar demo.

**Never:** Ingen analyseprompt eller leverandørschema (4.2), ingen innkobling av live i HTTP-/UI-flyten eller endring av demoens supervisor (4.3), ingen betalte API-kall eller evalueringskjøringer, ingen automatisk modellbytting/retry/reparasjon, ingen nye produkt-/arkitekturbeslutninger. Ved reelt beslutningsbehov: stopp og rapporter. Ingen push. Rå-sessionlogg bevares urørt utenfor fasecommit.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Standarddemo | Ingen nøkkel, også nett sperret | Eksisterende demo; null KI-klienter/transportkall | Ingen nøkkelkrav |
| Gyldig live-oppsett | Eksplisitt live og fiktiv nøkkel | Én konstruksjon, faste R1-verdier og SDK-innstillinger | Ingen modellforespørsel ved konstruksjon |
| Manglende/ugyldig konfig | Live uten gyldige påkrevde verdier / ugyldig modus | Trygg kjent feil; null betalte kall | Kodeeid melding uten råverdier eller fallback |
| Hemmelighetsgrense | Unik fiktiv nøkkel og konstruert råfeil | Ingen nøkkel i bygget frontend, feil/svar/logg/oppstartsmetadata | Leverandør-/konfigfeil eksponeres ikke rått |
| Tids-/abortkontrakt | Kontrollert klientkonstruksjon | SDK 120000 ms, ingen retry, forberedt ekstern abort | Absolutt adapterfrist eies av 4.2; 60/120 s fasekobling av 4.3 |

</frozen-after-approval>

## Code Map

- `src/backend/analysis/adapter.ts` — eksisterende AnalysisAdapter/AnalysisAdapterError; gjenbruk trygg feiltype.
- `src/backend/analysis/analyze-document.ts` — eier dokumentvalidering, modusvern og kodebestemt identitetsbinding; bevares.
- `src/backend/analysis/demo-adapter.ts` — eksisterende offline-demo; gjenbrukes ved eksplisitt/standard demo.
- `src/backend/server.ts`, `src/backend/http/pipeline-child.ts`, `run-pipeline.ts`, `analysis-route.ts` — dagens demo-komposisjon og ressursstyring; live-innkobling tilhører 4.3.
- `src/contracts/document-analysis.ts`, `analysis-validation.ts` — felles autoritet; ingen nytt konfigurasjonsskjema i frontend.
- `package.json`, `package-lock.json` — SDK-versjon pinnes; behold øvrige vedtatte verktøyversjoner.
- `tests/helpers/demo-without-network.mjs` og `tests/integration/http-analysis.test.ts` — etablerte grenser for offline-/HTTP-verifikasjon.

## Tasks & Acceptance

- [x] `src/backend/analysis/` — legg til smal backendkonfigurasjon og klientkonstruksjon; eksplisitt standarddemo/live og trygg kjent konfigurasjonsfeil (AC1–AC5).
- [x] `package.json`, `package-lock.json` — velg, kontroller mot offisiell SDK-dokumentasjon/kode og pin kompatibel SDK; dokumenter versjon og innstillinger uten hemmeligheter (AC1/AC3).
- [x] `tests/unit/`, eventuelt `tests/integration/` — verifiser alle matriserader med fiktiv nøkkel og kontrollert/nettsperret transport; særlig null klient i demo, ingen uannonsert modellforespørsel og ingen lekkasje (AC2–AC5).
- [x] `src/backend/README.md` og `.docs/implementation-artifacts/story-4-1-verifikasjon.md` — dokumenter backendkonfigurasjon, R1-versjoner, fase-/abortgrense og faktisk testbevis uten å påstå 4.3/live/S2/S5 ferdig.

Alle originale AC gjelder. Ingen irreversibel handling eller udekket intensjonsbeslutning er funnet. SDK-versjon og interne modulnavn er rutinevalg innen R1. Status blir review etter verifikasjon og done først etter uavhengig bestått review.

## Implementation Notes

Implementert `backend-config.ts` med eksplisitt demo/live, nøkkelfri metadata og intern Responses-metode. SDK `openai@6.9.1` er pinnet og kompatibilitetskontrollert mot offisiell dokumentasjon/installert kode. Ingen HTTP-/UI-kobling.

## Spec Change Log

## Review Triage Log

## Verification

Egenverifikasjon: [story-4-1-verifikasjon.md](story-4-1-verifikasjon.md). 72 relevante tester bestod; senere presisert transportprobe 23/23. Typecheck/lint/build, faktisk demooppstart og 204 frontendfiler bestod nøkkelgrensekontroll under OS-sperret eksternt nett. Demo med tomt miljø og blokkerte nettfunksjoner fullførte med null klienter/kall. Uavhengig review gjenstår.

Kjør relevante nye konfigurasjons-/klienttester, `npm run typecheck`, `npm run lint`, `npm run build` og meningsfull offline-/lekkasjekontroll av faktisk frontendbuild. Lagre eksakte kommandoer/resultater. Ikke skriv nøkler eller miljøverdier i logger. Full regresjon kjøres av orkestrator ved mini-sprintens slutt.
