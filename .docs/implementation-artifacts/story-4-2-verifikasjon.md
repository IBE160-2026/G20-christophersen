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
  timere/lyttere fjernes. Etter reviewretting F1 lagres resultat/feil før
  cleanup; felles kontroll av frist, ekstern abort og cleanup-feil kjøres
  deretter på både suksess- og feilbanen før terminal retur/kast.
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

Før-review-kjøringen brukte Node **24.21.0** og npm **11.19.0**, med runtime fra
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


## Rettelser etter uavhengig review F1–F5

Bestilling: rett hvert konkret reviewfunn med minste nødvendige endring; kjør
bare tester som dekker endrede filer. Ingen commits, status- eller done-endring
utføres av implementer. Parent eier videre full verifikasjon.

**F1:** Den tidligere ubetingede påstanden om etterkontroll var feil på
feilbanen: catch kastet før finally og hoppet over etterkontrollene. Nå lagres
enten outcome eller trygg feil. Eide ressurser ryddes først, inkludert faktisk
avventet workerstans. Felles terminalisering prioriterer deretter timeout ved
utløpt frist, ekstern abort, cleanup-feil og til slutt opprinnelig utfall/feil.
Synkron reader-cleanup-feil registreres også uten å hoppe over workercleanup.
Tre nye negative tester bruker ugyldig uttrekk, ekte Worker.terminate() og
bekrefter threadId -1 før kontrollert cleanup passerer 120001ms, utløser ekstern
abort eller avviser med en rå cleanup-feil. Forventet kode er henholdsvis
timeout, interrupted og adapter-failure; råtekst krysser ikke grensen.

**F2:** Worker avviser eksplisitt ikke-fullført reasoning-status i stedet for
å ignorere den. incomplete og in_progress sammen med ellers gyldig tomliste
blir invalid-response. completed reasoning og reasoning uten valgfri status
sammen med gyldig melding fullfører fortsatt.

**F3/F4:** Integrasjonens faktiske serialiserte SDK-body kontrolleres nå mot
uavhengige eksplisitte forventninger til text.format type/navn/strict,
objektrot, alle required-felt, nullable grad/source/kildefelt og
additionalProperties false i begge objektnivåer. store er eksplisitt false.
Produksjonsskjemaet importeres ikke som testfasit; ingen ny avhengighet.

**F5:** Ugyldigmatrisen dekker også completed med toppfeil, flere output_text,
ukjent output-item og reasoning-only. Hver variant krever invalid-response og
nøyaktig ett faktisk fetchforsøk, som også de to negative reasoning-statusene.

Patchverifikasjon 2026-10-23, samme Node **24.21.0** / npm **11.19.0**:

`npm test -- tests/unit/live-adapter.test.ts tests/integration/live-analysis.test.ts`
— **48/48 bestått**, to filer (**42 unit + 6 integration**), 2.94s.
Bare disse to relevante filene ble kjørt etter patchen. Ingen betalt API,
bred regresjon, ny typecheck/lint/build eller OS-profilkjøring i patchrunden;
parent eier sluttverifikasjonen. Før-review-resultatene ovenfor er historiske.

## Endelig sluttregresjon

Orkestratorens fulle sluttkjøring på ferdig reviewrettet kode består: 1033/1033
Vitest, 114/114 bygget-app + 3/3 dev-E2E, 37/37 komponenter, 6/6 helpertester,
7/7 promptloggtester, typecheck/build/lint, ekstern nettnekt og offline-demo.
Faktisk build/oppstart og 204 frontendfiler gir 0 nøkkellekkasjer.
Se [mini-sprintens prosesspor med eksakte kommandoer og rålogger](../process/arbeidsokter/2026-10-23-mini-sprint-4-1-4-2.md).
Ingen produktkode/testforventning er endret etter denne kjøringen.
