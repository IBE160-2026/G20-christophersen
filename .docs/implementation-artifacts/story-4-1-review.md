# Story 4.1 — uavhengig review

Dato: 2026-10-23. Resultat etter målrettet etterkontroll: **F1–F3 lukket; ingen åpne funn**. Ingen påvist feil i produktets konfigurasjonsgrense og ingen ny produkt-/arkitekturbeslutning som blocker. Story settes ikke done av denne reviewen. Første triage og rettingsbestilling er bevart nedenfor som prosessbevis.

## Grunnlag og metode

Reviewet kode-diff: `/private/tmp/ibe160-4-1-review.diff`, 39 892 bytes, SHA-256 `7ae439df96dc4fcceb7b07fc5d5798c75c51a8853f9ad788f107c5ed20d2ec78`.

Brukte `bmad-review` med eksplisitte linser `adversarial`, `edge-case-hunter`, `verification-gap`, deretter separat blind-hunter. Hvert lag kjørte sekvensielt i ny kontekst med samme modell, uten egne underagenter eller skills, og med bare funn som retur. Ingen triage ble gjort før alle fire var ferdige. Bare edge-laget fikk claims-filen. Blind-hunter fikk ingen claims; med kB=1000 er N=min(floor(sqrt(39,892)+1),10)=7, og returnerte sju kandidater.

Individuell kontroll bruker original [Story 4.1 AC1–AC5](../planning-artifacts/epics.md), [R1](../planning-artifacts/r1-live-ki-semester-v1.md), [godkjent implementeringsspec](spec-4-1-konfigurere-valgt-live-leverandor.md), [SPEC](../specs/spec-IBE160/SPEC.md), [grensekontrakter](../specs/spec-IBE160/grensekontrakter.md) og [arkitektur AD-5/AD-6/AD-9/AD-10](../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md). Sensorveiledningen s. 1–7 og faglærerens [brief-tilbakemelding](../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md) ble lest for test-/dokumentasjonsvurderingen: relevante tester og etterprøvbare bevis, uten å finne på krav til ny plattform eller full testautomatisering.

Ingen produktkode er rettet. Ingen betalte kall, faktisk nøkkel eller private dokumentdata er brukt. Ingen analyseprompt/schema, 4.3-innkobling eller endret demo-supervisor bestilles.

## Nødvendige rettinger

### F1 — Byggsteget kan blokkere verifikasjonen uten frist

- **Kilde:** adversarial A3.
- **Sted:** `tests/helpers/verify-analysis-build.mjs:9`.
- **Utløser og konsekvens:** `spawnSync('npm', ['run', 'build'], ...)` mangler timeout. Dersom typecheck eller Vite henger, kommer helperen aldri videre til nøkkelkontroll eller serveroppstart. Oppstartsfristen på linje 37 gjelder ikke dette steget.
- **Bevis:** alternativobjektet inneholder bare `env` og `encoding`; helperen har heller ingen ytre watchdog. De relevante Vitest-testene starter ikke helperen og gir den derfor ingen testfrist.
- **Rett:** bruk en eksplisitt, romslig byggfrist og trygg feil ved overskridelse; terminer eide byggeprosesser slik at kontrollen faktisk avsluttes uten rålogg/nøkkel. Dette gjelder testverktøyet, ikke R1s produktfrister.
- **Kontroller:** vanlig helperkjøring skal bestå; et kontrollert heng i byggsteget skal gi avgrenset feil og avslutte egne prosesser. Ingen betalte kall.

### F2 — Oppstartsfristen avgrenser ikke HTTP eller bodylesing

- **Kilder:** adversarial A4 og blind-hunter B3 (samme feil, begge beholdt).
- **Sted:** `tests/helpers/verify-analysis-build.mjs:37–40`.
- **Utløser og konsekvens:** serveren melder klar, men svarer aldri, eller sender headere og lar body være åpen. Både `fetch()` og `response.text()` mangler abortsignal. Når `started` har vunnet `Promise.race`, kan den andre timerens senere avvisning ikke avslutte HTTP-awaiten. Verifikasjonen henger.
- **Bevis:** ingen `signal` på linje 38 og ingen frist rundt linje 40; oppstarts-racet er allerede avsluttet.
- **Rett:** gi HTTP-proben et tidsbegrenset signal som beholdes gjennom bodylesingen, og rydd timer/signal og server ved feil. Fristen er for helperen og endrer ikke appens timeoutkontrakt.
- **Kontroller:** kontrollert svar uten headere og kontrollert uavsluttet body skal begge feile innen helperfristen og rydde den eide serveren.

### F3 — Cleanup kan gjøre også feilbanen ubegrenset

- **Kilder:** adversarial A5 og blind-hunter B4 (samme feil, begge beholdt).
- **Sted:** `tests/helpers/verify-analysis-build.mjs:41–44`.
- **Utløser og konsekvens:** barnet håndterer SIGTERM, men henger i opprydding. Helperens `finally` venter ubegrenset på `close`, også etter oppstartsfeil. Dette kan låse verifikasjonen og holde demoporten opptatt.
- **Bevis:** én `server.kill('SIGTERM')` etterfulgt av ubetinget `await closed`; ingen avslutningsfrist eller eskalering. `server.ts` har asynkron SIGTERM-handler som avventer `analysis.stop()` og serverlukking, så signalet alene beviser ikke faktisk prosesslukking.
- **Rett:** avgrens normal SIGTERM-opprydding, terminer kun helperens eget barn dersom fristen overskrides, og avvent faktisk `close`. Bevar trygg feilmelding uten rålogg/nøkkel.
- **Kontroller:** et kontrollert barn som ignorerer SIGTERM skal termineres og avsluttes innen kjent frist; normal serverlukking skal fortsatt bestå. Ingen endring av produktets supervisor kreves.

F1–F3 er verifikasjonsverktøyets avslutningsfeil. De viser ingen nøkkellekkasje eller brudd i produktets 4.1-konfigurasjon, men helperen bør rettes før reviewen lukkes. Ingen ny produkt- eller arkitekturbeslutning trengs.

## Alle kandidater og individuell triage

Overlapp mellom lag er bevart. «Avvist» betyr at kandidaten ikke påviser en nødvendig 4.1-retting; konkret grunn står ved hvert funn.

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

## Uavhengig verifikasjon

Kjørte med prosjektets Node24:

```sh
PATH=/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:$PATH npm test -- tests/unit/backend-config.test.ts tests/unit/demo-analysis.test.ts tests/integration/demo-analysis.test.ts
```

Resultat: **3 testfiler, 72/72 bestått**, ca. 5,1 s. En første kjøring av samme kommando ble også startet; den endelige dokumenterte kjøringen ble avventet til exit 0. Ingen full regresjon eller betalte tester. Kontrollerte også faktiske README-mål med `Path.exists()` (begge sanne), pakkeskript/Vitest-inventar, serverens sikre responser/lukking og installert SDKs autentiserings-/loggvalg.

AC1: R1 og frosne eksplisitte modell-/API-/low-/Standard-verdier, eksakt pin og uendret kapasitet/scope er bevart. AC2: null miljølesing/klient/nett i demo og trygg avvisning ved live-konfigurasjonsfeil er testet. AC3: backendgrense, ingen SDK-retry, nøkkelfri metadata og sikker feil er testet; faktisk build-/oppstartskontroll er ført som egenverifikasjon, og F1–F3 gjelder robustheten til dette verktøyet. AC4: SDK timeout og transportabort er eksplisitte/testet; absolutt adapterfrist og 60/120-fasekobling leveres fortsatt av 4.2/4.3. AC5: fiktive konfigurasjonsvarianter, ingen konstruksjonskall til nett og trygge meldinger er testet.

Opprinnelig neste handling var implementeringsretting og uavhengig recheck av F1–F3. Etterkontrollen nedenfor avslutter denne bestillingen. Ingen done-status eller commit er gjort av reviewer.

## Etterkontroll av F1–F3

2026-10-23: Leste bare rettingsdiffen for `tests/helpers/verify-analysis-build.mjs` og de seks nye testene i `tests/helpers/verify-analysis-build.test.mjs`. Ingen nye reviewers, produktendringer eller bred testsuite.

- **F1 lukket:** `runBuild` erstatter synkront, uavgrenset bygg med asynkron `spawn`, eksplisitt 120000 ms-frist og egen prosessgruppe. Ved frist stoppes hele den eide gruppen med SIGKILL; faktisk `close` avventes, og feilmeldingen er kodeeid uten rålogg. Testen lar både forelder og byggebarn henge, utløser en 500 ms-frist og beviser etter retur at begge PID-er er borte (`ESRCH`). Separat feiltest kontrollerer trygg melding ved exit 1.
- **F2 lukket:** `probeHttp` bruker ett `AbortController`-signal og en 10000 ms-frist gjennom både fetch og `response.text()`. Timer ryddes og signal avbrytes i `finally`. To kontrollerte loopback-servere beviser avbrudd når henholdsvis headere aldri kommer og body aldri avsluttes.
- **F3 lukket:** `stopChild` sender SIGTERM til eget barn, eskalerer til SIGKILL etter 2000 ms og avventer faktisk `close`; timer ryddes. Testene beviser både normal SIGTERM-lukking og eskalering når barnet ignorerer SIGTERM, samt at PID ikke lenger finnes. `main` bruker denne cleanupen i `finally`, også etter oppstarts-/HTTP-feil.

Uavhengig kommando, med prosjektets Node24 og tillatt lokal loopback:

```sh
/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin/node --test tests/helpers/verify-analysis-build.test.mjs
```

Resultat: **6/6 bestått, exit 0**, ca. 0,99 s. Første forsøk i sandkassen ga 4/6 fordi begge HTTP-testenes `listen` ble avvist med `EPERM` før testatferden startet; samme kommando med godkjent loopback-tilgang bestod alle seks. Dette var miljøbegrensning, ikke produktfeil.

Implementeringsagentens melding om normal helperkjøring med **204 frontendfiler / 0 lekkasjer** er mottatt som implementeringsbevis; reviewer gjentok ikke bygget eller full regresjon. De uavhengige **72/72** fra første review er bevart over. Build-eier utfører samlet regresjon. Ingen gjenstående rettinger eller beslutningsblockers er funnet innen denne etterkontrollen.
