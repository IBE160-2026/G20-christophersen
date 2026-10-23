# Story 4.2 — egenverifikasjon 2026-10-23

Grunnlag: [godkjent spec](spec-4-2-analysere-hele-rapportgrunnlaget.md), med
alle tre context-filer lest før arbeid: epic-4-context, R1 og grensekontrakter.
Specens avgrensning er beholdt; HTTP/UI/live-evaluering tilhører senere stories.
Dette er offline modulbevis før uavhengig review, ikke faktisk live-/S2-/S5-bevis.

## Endring og spor

- `live-request.ts`: prompt/schema 1/1, kontrakt/uttrekk 2/1; objektrot, strict
  schema med obligatoriske felt/null, additionalProperties false og ingen
  funnantallsgrense. Hele DocumentBasis går i ett Responses-kall med R1s faste
  modell/low/Standard. max_output_tokens 128000 inklusive reasoning,
  truncation disabled, store false. Leverandøren håndhever kontekstvinduet for
  hele requesten i samme forsøk; ingen lokal byte-/tegn-/tokenheuristikk.
- `live-adapter.ts`: bruker 4.1s bundne SDK-metode og asResponse. Én monoton
  absolutt 120000ms-frist og eksternt signal dekker body, worker-validering og
  cleanup. Reader kanselleres, worker termineres og avventes, sene svar avvises,
  timere/lyttere fjernes. Grensen sjekkes igjen etter cleanup.
- `abortable-fetch.ts`/backend-config: SDK 6.9.1 leser ikke-2xx error-body før
  asResponse returnerer og rydder sin headerfrist tidlig. Derfor bindes alle
  response-bodyer til requestsignalet i fetchgrensen. Abort feiler den eide
  wrapperstrømmen og kansellerer den underliggende readeren. Underliggende
  cancel-promise avventes ikke: en hengende cancel kan ikke forlenge fristen.
  Native fetch mottar samme abortsignal. Dette endrer ingen modell-/retryvalg.
- `live-response-worker.ts`: stoppbar JSON-/providerformat-/kontraktvalidering
  med eksisterende bindAnalysisOutcome. Avslag/ufullstendig/manglende status,
  ugyldig JSON/schema, duplikat-ID og blanksidekilde blir invalid-response.
  Ingen uvalidert delretur eller reparasjonskall. Backend eier identitet;
  kildeuklarheter bevares uten konvertering eller gjetting.

Ingen domenekode, felles schemas, HTTP-rute eller produktflyt er endret.
SDK er fortsatt openai@6.9.1 med maxRetries 0 og timeout 120000. Ingen ekstern
forespørsel, nøkkel eller privat rapport inngår i testene eller bevisene.

## Testbevis

`tests/unit/live-adapter.test.ts` bruker ekte SDK/kontrollert fetch og dekker:
gyldig tomliste (RT-10), fysiske kilder/uklare grader/tallstrengsider/motstrid
(RT-5/6/7), avslag/manglende felt/JSON/schema/status/ufullstendig output
(RT-9/19), duplikat-ID, blanksidekilde og dokumentvern. 400/408/409/429/500/503
og nettfeil gir ett faktisk fetchforsøk og trygg feil uten råtekst.
Abort før start gir null forsøk. Eksternt body-abort, deadline før headere,
open 200/429-body, hengende underliggende cancel, deadline under eid
parser-/valideringsarbeid og sent transportresultat gir aldri completed.
Faktisk worker threadId -1 og ryddede timere kontrolleres. En kontrollert
61000ms-live-respons fullfører før livefristen uten å rammes av demofristen.

`tests/integration/live-analysis.test.ts` leser faktiske F1–F4-, 30-siders- og
readable-blank-PDF-er gjennom validatePdf/extractPdf. Serialisert SDK-body
sammenlignes med hele faktiske DocumentBasis, inklusive alle statuser/årsaker,
blankside og siste tekst på fysisk side 30. Ett transportforsøk per rapport.
F1–F4-fasiten og samme kontroll-/finans-/screeningutfall som demo kontrolleres.
Live-outcome testes ved adaptergrensen; kun testens kopi i dagens demo-only
UI-state får demo-modus for å prøve de eksisterende kontrollfunksjonene før
Story 4.3. Ingen live-HTTP-/UI-støtte påstås. Finansverdier, formler, TG3-port,
ufullført listekontroll og manglende L beholder sine tidligere regler.

Endelig kjøring brukte Node **24.21.0** og npm **11.19.0**, med runtime fra
`/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin` først i PATH.

1. `npm test -- tests/unit/live-adapter.test.ts tests/integration/live-analysis.test.ts tests/unit/backend-config.test.ts tests/unit/document-analysis.test.ts tests/integration/demo-screening.test.ts`
   — **171/171 bestått**, fem filer. Nye 4.2-tester: **31 unit + 6 integration**.
2. Samme målrettede suite via `sandbox-exec -f .docs/implementation-artifacts/story-5-3-nettprofil.sb npm test -- ...`
   — **171/171 bestått**, uten eksternt nett/betalt API. Første forsøk inne i
   eksisterende agentsandbox kunne ikke anvende nestet sandboxprofil
   (`sandbox_apply: Operation not permitted`). Autorisert eskalert kjøring
   kunne anvende profilen og bestod. Ingen autoreviewavvisning.
3. `npm run typecheck` — **bestått**.
4. `npm run lint` — **bestått**, ingen advarsler etter at cleanup-feil ble
   registrert og håndtert etter finally i stedet for å kaste i finally.
5. `npm run build` — **bestått**, inklusive typecheck. Vite varsler fortsatt om
   eksisterende frontendchunk over 500kB; frontend/bundling er uendret.

## Prosess og avgrensning

Arbeidsbestillingen var: «Read spec-4-2-analysere-hele-rapportgrunnlaget.md fully
and implement it — the spec is the sole source of truth. Load every file listed
in its frontmatter context before you start.» Dette beviset lagrer oppgave,
rutinevalg, testfunn og retting som prosesspor sammen med versjonert prompt i
koden. Første testiterasjon fant for tidlig aborttest (før SDK leverte body) og
feil klokke i fake-timer-test; testen ble flyttet til faktisk readerstart og
adapteren bruker monoton global performance som testklokken også styrer.
Parent presiserte SDK-eid error-body og hengende cancel; fetchbindingen og
egen 429/hengende-cancel-test ble lagt til før ferdigstillelse.

Kursføringen om sporbar plan/kode, relevante kjørbare tester, lagrede prompts og
avgrenset scope er brukt gjennom eksisterende kildeuttrekk fra
Sensorveiledning-IBE160-Del-1.pdf og faglærerens brief-tilbakemelding (2026-10-06).
Ingen ny dekningsprosent eller produktfunksjon er utledet av disse.

Abort lover ingen stans i leverandørbehandling/kostnad. Betalt API, konto/pris/
budsjett og faktisk semantisk kvalitet/tid er ikke evaluert. Full regresjon og
uavhengig review samordnes av mini-sprintens parent.
