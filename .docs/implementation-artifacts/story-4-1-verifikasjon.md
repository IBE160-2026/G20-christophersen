# Story 4.1 — egenverifikasjon 2026-10-23

Grunnlag: [godkjent spec](spec-4-1-konfigurere-valgt-live-leverandor.md),
dens tre context-filer og uendrede Story 4.1 AC1–AC5. Dette er egenverifikasjon
før uavhengig review, ikke live-/S2-/S5-bevis.

## Implementert grense og SDK

`src/backend/analysis/backend-config.ts` har eksplisitt standarddemo/live.
Demo returnerer eksisterende adapter før miljø eller klient berøres. Live krever
backendens `OPENAI_API_KEY`, konstruerer én klient uten forespørsel og returnerer
en intern, bundet Responses-metode samt nøkkelfri R1-metadata. SDK-instance og
nøkkel forblir i closure. Ugyldig modus/konfigurasjon og rå konstruksjonsfeil blir
kodeeid `AnalysisAdapterError`/`adapter-failure`, uten fallback eller logg.
Kontrakt-/uttrekksversjon 2/1 og dokument-/analysekontraktene er uendret.

Offisiell `openai@6.9.1` er eksakt pinnet i package.json/package-lock.json.
Kompatibilitet er kontrollert i installert SDK-kode:

- `src/client.ts`: eksplisitt nøkkel/baseURL, null organisasjon/prosjekt/webhook,
  retry/timeout og logginnstillinger. Øvrige miljødefaults overstyres eksplisitt;
  SDK-logging er av og loggeren er stille.
- `src/resources/responses/responses.ts`: Responses `create`, requestoptions,
  reasoning, service_tier, text.format og strengt JSON Schema-format.
- `src/resources/shared.ts`: strengmodell-ID og reasoning low.
- Konstruksjon og kontrollert transportprobe bestod på prosjektets Node24/TS6.

[Offisiell OpenAI TypeScript-dokumentasjon](https://developers.openai.com/api/reference/typescript)
ble søkt og åpnet 2026-10-23. Den dokumenterer klientinnstillinger, egen fetch og
AbortSignal. Prosjektverdiene er eksplisitt `gpt-6.1-sol`, Responses, low,
default, `maxRetries: 0`, `timeout: 120000`. Faktisk konto-/modelltilgang er ikke
testet. Lokal nøkkelsyntaks avviser tom verdi og whitespace/kontrolltegn uten
å påstå at nøkkelen er autentisert.

## Kommandoer og resultater

Alle npm-/Node-kommandoer brukte:

```sh
export PATH=/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:$PATH
```

1. `npm test -- tests/unit/backend-config.test.ts tests/unit/demo-analysis.test.ts tests/integration/demo-analysis.test.ts`
   — **72/72 bestått**, tre filer. De 23 nye testene dekker demo uten
   miljølesing/klient/nett, én ekte SDK-konstruksjon uten forespørsel, faste verdier,
   uvedkommende miljødefaults, ugyldig modus/nøkkel, sikker konstruksjonsfeil,
   serialisering/inspeksjon uten nøkkel og stille logger.
2. Etter presisering av transportproben:
   `npm test -- tests/unit/backend-config.test.ts` — **23/23 bestått**.
   Kontrollert fetch, uten rapport/analyseprompt/schema, verifiserer Responses-
   endepunkt og modell/low/default i requesten. Eksternt signal avbryter ventende
   transport; **ett transportforsøk**. Ingen betalte kall.
3. `npm run typecheck` — **bestått**.
4. `npm run lint` — **bestått**, ingen advarsler.
5. `sandbox-exec -f .docs/implementation-artifacts/story-5-3-nettprofil.sb node tests/helpers/verify-analysis-build.mjs`
   — **bestått**. Helperen kjører faktisk `npm run build` (inkl. typecheck), med
   unik fiktiv nøkkel generert bare i minnet. **204 frontendfiler**, bygglogg,
   faktisk demooppstartslogg og HTTP-svar fra `/` ble kontrollert: **0 lekkasjer**.
   Frontendfilene inneholder heller ikke OPENAI_API_KEY, API-endepunkt eller
   modell-ID. SIGTERM og faktisk prosesslukking ble avventet. OS-profilen
   tillater bare loopback-nett.
6. `sandbox-exec -f .docs/implementation-artifacts/story-5-3-nettprofil.sb env -i /private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin/node tests/helpers/demo-without-network.mjs`
   — **bestått**: `demo: completed; nettforespørsler: 0; miljøvariabler: 0`.
   F4-PDF-pipeline og standardanalyse samt konfigurert demoadapter fullfører.
   Helperen blokkerer fetch/Socket.connect og kontrollerer **0 klienter**;
   OS-profilen sperrer eksternt nett i tillegg.

Første SDK-installasjonsforsøk med maskinens Node26 ble avvist av eksisterende
engine-check; endelig installasjon brukte Node24 og rapporterte 0 sårbarheter.
Pakke-/låsfil og metadata bruker samme versjon. Ingen nøkkel eller private
dokumentdata ble skrevet til bevis. Rå-sessionloggen forblir urørt.

## Avgrensning

Ingen HTTP-/UI-kobling, analyseprompt eller leverandørschema leveres her.
SDK-timeout og requestsignal forbereder 4.2; absolutt frist gjennom lesing og
terminal validering håndheves der. HTTP-faser på 60 s lokalt / 120 s live og
cleanup tilhører 4.3. Abort lover ingen stans av leverandørbehandling/kostnad.
R1s 30-sidersscope, 1 050 000 tokens kontekst, 128 000 maksimal output og
budsjett-/kostnadsrutine innen USD 20 videreføres uendret. Ingen faktisk live-,
budsjett-, S2- eller S5-kjøring er utført. Full regresjon og uavhengig review
eies av mini-sprintens orkestrator.
