---
title: 'Story 4.1 — Konfigurere valgt live-leverandør uten å eksponere nøkkelen'
type: 'feature'
created: '2026-10-23'
status: 'done'
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

Pass 1: alle kandidater individuelt triagert; helperfunn F1–F3 rutes som rutinepatch. Ingen bad_spec/intent_gap. Full begrunnelse i [reviewrapporten](story-4-1-review.md).

| ID / lag | Kandidat, utløser, foreslått vern og mulig konsekvens | Triage og faktisk bevis |
|---|---|---|
| A1 adversarial | README:38: R1-lenke hevdes brutt; bytt `../../` til `../../../` for å gjøre beslutningen tilgjengelig. | **Avvist, konkret motbevist.** Fra `src/backend/` går `../../` til reporoten. Python `Path`-oppslag av `src/backend/../../.docs/planning-artifacts/r1-live-ki-semester-v1.md` gir `exists=True`. Forslaget med tre foreldre ville ødelegge lenken. |
| A2 adversarial | README:43: verifikasjonslenke hevdes brutt; samme foreslåtte ekstra `../`; bevis skal bli tilgjengelig. | **Avvist, konkret motbevist.** `src/backend/../../.docs/implementation-artifacts/story-4-1-verifikasjon.md` gir `exists=True`. Ingen lenkeretting. |
| A3 adversarial | Helper:9: synkront bygg uten tidsgrense kan låse kjøringen; sett timeout. | **Akseptert som F1.** Faktiske `spawnSync`-options mangler timeout, og helperen kjøres selvstendig. |
| A4 adversarial | Helper:38–40: fetch/body mangler abortfrist; server som ikke svarer kan låse testen. | **Akseptert som F2.** Oppstarts-racet omfatter ikke de etterfølgende awaitene. |
| A5 adversarial | Helper:43–44: SIGTERM etterfulgt av ubegrenset close-await; lås/portlekkasje ved heng. | **Akseptert som F3.** Ingen fallback eller close-frist. |
| A6 adversarial | Helper:38–40: bare `/` kontrolleres; utvid til API-feil/ukjent rute for å oppdage nøkkel i slike svar. | **Avvist som 4.1-feil.** Egenverifikasjonen punkt 5 sier uttrykkelig «HTTP-svar fra `/`», ikke alle API-ruter. Server/HTTP er uendret demo og importerer ikke ny live-konfigurasjon; ingen ny nøkkel-/råfeilbane til API er innført. Konstruksjonsfeilen som faktisk innføres, kontrolleres i backend-config-testen og erstattes av fast `AnalysisAdapterError`. Live HTTP-feil testes når 4.3 kobler denne grensen inn. |
| A7 adversarial | Helper mangler npm-script/regresjonskobling; legg til kommando og ordinær oppskrift ellers kan senere lekkasje slippe gjennom. | **Avvist som nødvendig 4.1-retting.** Fraværet fra package scripts/Vitest er korrekt, men 4.1 krever faktisk bygg-/oppstartskontroll, ikke at alle kontroller inngår i `npm test`. Eksakt helperkommando, OS-nettsperring og resultat er dokumentert i egenverifikasjonen punkt 5. Ingen påstand om at vanlig unit-suite utfører denne kontrollen. Automatisk senere regresjonskobling kan være nyttig, men er ikke et udekket AC. |
| A8 adversarial | Test:66–83 aktiverer bare injisert logger; ekte SDK-transportfeil med debug kan lekke; legg til ekte SDK/konsolltest. | **Avvist som påvist feil.** Ekte SDK konstrueres i testen med uvedkommende `OPENAI_LOG=debug`, og `client.logLevel === 'off'` kontrolleres. Produktet setter både `logLevel:'off'` og en logger der alle metodene er tomme. Installert `node_modules/openai/client.mjs:106–113` velger eksplisitt logLevel foran miljødefault. Rå konstruksjonsfeil samt null konsollkall er allerede testet. Kandidaten viser ingen bypass; requestfeilhåndtering tilhører 4.2. |
| A9 adversarial | Test:85–108 kontrollerer ikke Authorization-header; feil nøkkel kan nå transport; assert fiktiv backendnøkkel i header. | **Avvist som nødvendig 4.1-retting.** Ekte SDK-konstruksjon kontrollerer eksplisitt `options.apiKey` mot den injiserte fiktive nøkkelen, og miljøtesten kontrollerer prosessmiljøgrensen separat. Installert SDK `client.mjs:117,149–150` lagrer denne strengen og bygger `Authorization: Bearer ${this.apiKey}`. Ingen alternativ nøkkelkilde finnes etter eksplisitt klientkonstruksjon. Headerassert kan styrke 4.2-transporttester, men ingen aktuell feil er vist. |
| A10 adversarial | Test:85–108 venter på `ready` uten egen frist/finally; transport som ikke starter kan gi dårlig timeout/opprydding. | **Avvist som ubegrenset verifikasjonsfeil.** Dette er `it(... async ...)` i Vitest med runnerens testtimeout, og SDK-klienten har eksplisitt 120000 ms timeout. Den kontrollerte fetchen kaller `started()` før den begynner å vente. Testen beviser ekstern abort på denne banen og består uavhengig. En bedre lokal diagnostikk/finally er mulig, men kandidaten viser ingen ubegrenset testkjøring eller produktfeil i den leverte banen. |
| E edge-case-hunter | Ingen funn (`[]`). | Ingen kandidater å avvise eller rette. |
| V1 verification-gap | Helper:9 ikke kjørt av npm-test/build/E2E; `broken-verification-gap`; knytt til vanlig regresjon for å unngå framtidig lekkasje. | **Avvist som nødvendig 4.1-retting**, selvstendig vurdert: `vitest.config.ts` inkluderer bare `*.test.ts`, og `package.json` starter ikke helperen. Men kontrollen er kjørbar og dokumentert med faktisk resultat i egenverifikasjonen; verken AC/testkrav eller kursgrunnlaget krever at akkurat denne byggekostbare kontrollen inngår i alle regresjonskommandoer. Ingen manglende forbruker eller falskt testbevis er påvist. Overlapper A7. |
| B1 blind-hunter | Begge README-lenker hevdes brutt; legg til tredje `../` så R1/testbevis kan leses. | **Avvist, konkret motbevist for begge stier** med filoppslag (`exists=True` for begge). Overlapper A1/A2. |
| B2 blind-hunter | Helper ikke i regresjonskommandoer; automatiser/dokumenter ellers kan framtidig lekkasje passere. | **Avvist som nødvendig 4.1-retting**, selvstendig vurdert: kommandoen er allerede dokumentert i egenverifikasjonen punkt 5 med nettsperret faktisk kjøring; ingen AC krever package-script eller kjøring via Vitest. Overlapper A7/V1. |
| B3 blind-hunter | HTTP/body har ingen timeout etter oppstart; sett abortfrist så proben ikke kan henge. | **Akseptert som F2.** Konkret await-bane verifisert i helper:37–40. Overlapper A4. |
| B4 blind-hunter | Cleanup kan vente ubegrenset på barnet; frist/eskalering skal rydde egne prosesser. | **Akseptert som F3.** Konkret SIGTERM/close-bane verifisert i helper:41–44. Overlapper A5. |
| B5 blind-hunter | HTTP-bevis dekker bare HTML og burde avgrenses eller utvides til API-feil. | **Avvist, dokumentpåstanden er konkret motbevist.** Egenverifikasjonen punkt 5 er allerede avgrenset til «HTTP-svar fra `/`». Ny konfigurasjonsgrense er ennå ikke koblet til API; nåværende serverfeil er faste kodeeide strenger. Ingen lekkasjefeil eller feilaktig API-dekningspåstand er funnet. Overlapper A6. |
| B6 blind-hunter | Test setter selv modell/low/default; grensen injiserer dem ikke; framtidig forbruker kan utelate dem. Gjør ansvaret tydelig og test adapterrequest i 4.2. | **Avvist som 4.1-feil.** Dette er dokumentert konfigurasjon og intern SDK-metode for 4.2, ingen produksjonsrequest. Transportproben sjekker at eksplisitte verdier er SDK-kompatible; den påstår ikke en ferdig analyseadapter. R1s testgrunnlag legger faktiske Requests med disse feltene til 4.2 AC1–AC3/AC6. Konkrete felt er frosset i `LIVE_ANALYSIS_SETTINGS` og testet; README/spec/egenverifikasjon beskriver den senere adaptergrensen. |
| B7 blind-hunter | Bundet SDK-metode lar requestoptions overstyre maxRetries/timeout; smalere metode eller test av framtidig forbruker må hindre brudd. | **Avvist som aktuell 4.1-feil.** Metoden er en intern backendgrense, ikke ekstern konfigurasjon. Ingen produksjonsforbruker finnes her; klienten har eksplisitt `maxRetries:0`/`timeout:120000`, testet på ekte SDK. R1 og originale testkrav legger faktisk antall transportforsøk ved leverandørfeil samt absolutt frist til 4.2, fasekobling til 4.3. En intern API som kan brukes galt er ikke bevis for et faktisk brudd. Kontroller kommende adapterrequest uten overstyring; ikke innfør et nytt flerleverandør-/policy-rammeverk i 4.1. |


## Verification

Egenverifikasjon: [story-4-1-verifikasjon.md](story-4-1-verifikasjon.md). 72 relevante tester bestod; senere presisert transportprobe 23/23. Typecheck/lint/build, faktisk demooppstart og 204 frontendfiler bestod nøkkelgrensekontroll under OS-sperret eksternt nett. Demo med tomt miljø og blokkerte nettfunksjoner fullførte med null klienter/kall. Uavhengig BMAD-review bestått; tre helperfunn lukket med 6/6 uavhengige målrettede tester.

Kjør relevante nye konfigurasjons-/klienttester, `npm run typecheck`, `npm run lint`, `npm run build` og meningsfull offline-/lekkasjekontroll av faktisk frontendbuild. Lagre eksakte kommandoer/resultater. Ikke skriv nøkler eller miljøverdier i logger. Full regresjon kjøres av orkestrator ved mini-sprintens slutt.

Reviewretting: F1–F3 er lukket etter uavhengig patchkontroll. 120 s byggfrist med eid prosessgruppestopp, 10 s HTTP/body-abort og 2 s SIGTERM/SIGKILL-cleanup er bare helperfrister. Produktfrister er uendret. Normal helper bestod igjen med 204 filer / 0 lekkasjer. Ingen åpne funn.
