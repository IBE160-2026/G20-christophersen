# Story 4.2 — uavhengig review

Dato: 2026-10-23. Reviewet commit: `85b9fdbd7a8c31e8c87521abc1a2fa7f089af1e7`.
Innhold: `/private/tmp/ibe160-4-2-review.diff`, CODE, 58 612 bytes. Ingen produktkode er rettet og ingen done-status/commit er satt av reviewer.

Resultat etter avgrenset patchkontroll: **F1–F5 lukket**, ingen åpne reviewfunn eller beslutningsblockere. Før-review-funn og individuell triage er bevart nedenfor; etterkontrollens konkrete bevis står sist. Ingen betalt API var nødvendig.

## Metode og kravgrunnlag

BMAD `bmad-review` ble lastet og customization løst med `resolve_customization.py`: ingen ekstra activation steps, persistent facts eller review guidance. Eksplisitte lenses var adversarial, edge-case-hunter og verification-gap. Hvert lag fikk ny context-free subagent, samme arvede modell, findings-only, ingen egne skills/subagenter. De tre kjørte **sekvensielt**. Claims-filen `spec-4-2-analysere-hele-rapportgrunnlaget.md` ble gitt bare til edge-laget, med instruks om lesing først etter path tracing. Et fjerde nytt blind-hunter-lag kjørte deretter, uten claims eller tidligere funn. `N = min(floor(sqrt(58.612) + 1), 10) = 8`; laget leverte åtte kandidater. Alle fire lags resultater var samlet før endelig triage. Ingen ekstra reviewerlag ble startet.

Triage bruker originale Story 4.2 AC1–AC6/testkrav i `epics.md`, R1, SPEC/grensekontrakter og arkitektur AD-1/AD-3–AD-6/AD-9/AD-10. Kursgrunnlaget er det eksisterende kildeuttrekket fra Sensorveiledning og faglærerens brief-tilbakemelding: sporbarhet, meningsfulle tester og konkret dokumenterte reviewfunn; ingen ny dekningsprosent eller produktfunksjon. Story 4.3-innkobling, betalt semantisk evaluering og S2/S5 er utenfor denne reviewen.

## Opprinnelige funn og nødvendige rettinger

### F1 — feilbanen hopper over frist-/abort-/cleanupkontroll etter finally

`src/backend/analysis/live-adapter.ts:85–105`: catch kaster før finally; JavaScript fortsetter deretter med kastet og kjører aldri linje 103–105. Dette er ikke bare en mulig hengende terminate: en faktisk avsluttet worker med kontrollert tidsforløp reproduserer feil klassifisering. En ugyldig providerrespons, etterfulgt av ekte `Worker.terminate()` og kontrollklokke på 120001 ms i cleanup, returnerer `invalid-response`, selv om R1 krever `timeout` ved fristen. Cleanup-rejection og ekstern abort under cleanup på en allerede feilet bane blir tilsvarende oversett. Kilde: A4/A10; A3/B4 overlapper.

Rett ved å lagre resultat/feil, rydde eide ressurser og deretter anvende felles frist-/ekstern-abort-/cleanupkontroll før retur eller kast. Bevar faktisk workerstans og ikke gjør Promise.race alene til cleanup. Legg til test for feilbane som passerer fristen under faktisk worker-cleanup; også test ekstern abort/cleanup-feil på feilbanen. Oppdater egenverifikasjonens ubetingede påstand om kontroll etter cleanup. Kravspor: AC5, R1 absolutt frist og ressursstans.

### F2 — kjent ufullstendig reasoning-item kan bli vellykket tomliste

`src/backend/analysis/live-response-worker.ts:18–19`: alle `reasoning`-items hoppes over før status undersøkes. SDK 6.9.1s `ResponseReasoningItem` (`node_modules/openai/src/resources/responses/responses.ts:4685–4716`) har valgfri status `in_progress | completed | incomplete`. Kontrollert ekte SDK/fetch med toppstatus completed, reasoning-status incomplete eller in_progress og en gyldig output_text-tomliste returnerer completed. Begge negative prober feilet. Dette er motsigende terminalmetadata som adapteren kjenner, ikke en vurdering av modellsemantikk. Kilde: uavhengig triageprobe T1.

Avvis eksplisitt ikke-fullført reasoning-status; behold støtte for fraværende status der SDK-kontrakten tillater det. Test begge statusene sammen med en ellers gyldig melding, og gyldig reasoning + melding. Kravspor: AC4, R1s avvisning av kjent avkortet/ikke-terminalt/ufullstendig svar.

### F3 — requestens strict-schema er ikke verifisert ved transportgrensen

`src/backend/analysis/live-request.ts:9–34,42`: produksjonsskjemaet har riktige felt og restriksjoner ved inspeksjon. Testene i `tests/integration/live-analysis.test.ts:39–41` kontrollerer bare `strict: true` og fabrikkerer så et svar uavhengig av sendt skjema. Et feil skjema kan dermed passere alle testene. Repository-søk etter `createLiveRequest`, `LIVE_EXTRACTION`, `json_schema`, `additionalProperties` og importreferanser fant ingen test som verifiserer sendt required/null/source/additionalProperties-struktur. Kilde: V2; delvis B8.

Legg uavhengige forventninger til objektrot, format type/name, obligatoriske felt, eksplisitt null, nested source og additionalProperties false på faktisk serialisert SDK-body. Ikke krev modellkall eller tekstsøk i håndskrevne dokumenter. Kravspor: AC2–AC4, R1 Structured Outputs og specens konkrete task.

### F4 — eksplisitt store:false mangler regresjonsvern

`src/backend/analysis/live-request.ts:39`: koden sender store:false, men ingen test observerer feltet. Å bytte til true eller fjerne feltet endrer leverandørforespørselen uten testfeil. Hele rapporten er innholdet i denne forespørselen. Søk etter store og request-importer samt lesing av live/backend-config-testene bekrefter gapet. Kilde: V1; delvis B8.

Assert `body.store === false` på ekte SDK/fetch-grensen. Dette beskytter en eksisterende eksplisitt databehandlingsinnstilling; det innfører ingen ny lagringsfunksjon. Kravspor: AD-9 og implementasjonens uttrykkelige requestvalg.

### F5 — flere terminale avvisningsgrener mangler observerbart regresjonsvern

`src/backend/analysis/live-response-worker.ts:15–27` og `tests/unit/live-adapter.test.ts:30–41`: dagens ugyldig-matrise dekker ikke completed-envelope med top-level error, flere output_text, ukjent output-item eller bare reasoning. Dagens kode avviser disse ved inspeksjon, men å fjerne respektive guards ville ikke feile testene som er lest/søkt. Dette er sentrale deterministiske varianter av AC4, ikke et krav om generell dekningsprosent. Kilde: B7.

Utvid den kontrollerte matrisen med disse fire responsene og assert failed/invalid-response og ett faktisk fetchforsøk. F2 sine negative reasoning-varianter kan inngå i samme matrise. Ikke legg til modell-/semantikktester. Kravspor: AC4/AC5 og R1 terminalstatus/schemafeil.

## Alle lags kandidater og individuell triage

Overlapper beholdes nedenfor; de er ikke fjernet fra reviewsporet. «Avvist» betyr ikke påvist kravbrudd innen denne Story 4.2-grensen.

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

## Uavhengig verifikasjon og begrensninger

Node **24.21.0** fra `/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin`, npm fra `/opt/homebrew/bin`. Kun fiktiv nøkkel og kontrollerte fetch-responser. Ingen betalte kall, full regresjon eller produktkodeendring.

`npm test -- tests/unit/live-adapter.test.ts tests/integration/live-analysis.test.ts tests/unit/backend-config.test.ts tests/unit/document-analysis.test.ts`:
**167/167 bestått**, fire filer, 2.83 s. Dette inkluderer ett faktisk SDK-fetchforsøk ved 400/408/409/429/500/503 og nettfeil; body-/før-header-timeout, hengende cancel, sent svar; ekte workerstans; RT-5/6/7/9/10/19-varianter, duplikat-ID og blankside; faktisk PDF.js-uttrekk med 30 sider og siste tekst; kontroll-/finans-/screeningfasit F1–F4. Integrasjonstesten merker eksplisitt UI-kopien som demo før eksisterende state prøves: dette er ikke påstått 4.3-live-integrasjon.

En midlertidig `tests/unit/review-4-2-probe.test.ts` ble kjørt med samme kommando/runtime og fjernet etterpå. **Tre negative assertions feilet** på reviewet commit: de to reasoning-statusene fikk completed, og cleanup over fristen fikk invalid-response. Probe-kilde er bevart i `/private/tmp/ibe160-story-4-2-review-probe.test.ts`; de konkrete inputene og forventningene er dokumentert i F1/F2. Proben brukte ekte SDK/worker; bare transport og kontrollklokke/terminate-etterforløp var styrt. Disse feilene er ikke medregnet som eksisterende beståtte tester.

Reviewer setter ikke done eller commit. Parent avgjør fullføring etter sluttverifikasjon; den avgrensede etterkontrollen nedenfor lukker reviewfunnene.

## Etterkontroll av F1–F5-patchen

2026-10-23: kun arbeidsdiffen for `live-adapter.ts`, `live-response-worker.ts`, de to live-testfilene og `story-4-2-verifikasjon.md` er etterkontrollert. Ingen nye reviewers, produktendringer eller bred testsuite ble startet av reviewer. Den opprinnelige commit-ID-en ovenfor er reviewbasen; dette avsnittet gjelder parentens foreliggende arbeidsdiff etter implementers rettinger.

| Funn | Status | Konkret kode-/testbevis |
|---|---|---|
| F1 | Lukket | Catch lagrer trygg `failure` og kaster ikke før finally. Etter faktisk worker-cleanup går både suksess og feil gjennom timeout, ekstern abort og cleanupFailed før opprinnelig feil/resultat. Readerens synkrone cleanup-feil registreres uten å hoppe over workerstans. Tre tester i `terminalization after real worker cleanup` bruker ugyldig providerretur og ekte `Worker.terminate()`, observerer threadId=-1 og utløser deretter 120001 ms, abort eller cleanup-rejection. De krever timeout/interrupted/adapter-failure, ingen råtekst, ett fetchforsøk og null timere. |
| F2 | Lukket | Reasoning-grenen sjekker nå eksplisitt gitt status før continue. Incomplete/in_progress med ellers gyldig melding gir invalid-response og ett faktisk fetchforsøk. Separate positive tester bevarer completed reasoning og reasoning uten valgfri status. |
| F3 | Lukket | F1–F4-integrasjonens kontrollerte fetch sammenligner faktisk serialisert text.format mot en uavhengig eksplisitt forventning: type/navn/strict, objektrot, required, nested source, nullvarianter og additionalProperties false. Testen importerer ikke produksjonsskjemaet som fasit. |
| F4 | Lukket | Samme faktiske SDK-body har eksplisitt assertion på store:false sammen med modell/low/tier/outputbudsjett/truncation. |
| F5 | Lukket | Ugyldigmatrisen inkluderer toppfeil med completed, flere output_text, ukjent output-item og reasoning-only; hver krever failed/invalid-response og nøyaktig ett faktisk fetchforsøk. |

Reviewer kjørte selv, med Node24.21.0 fra angitt runtime og npm fra `/opt/homebrew/bin`:

`npm test -- tests/unit/live-adapter.test.ts tests/integration/live-analysis.test.ts`

**48/48 bestått, 42 unit + 6 integration**, to filer, 2.73 s (start 12:45:21). Testene bruker fiktive nøkler og kontrollert transport; ingen modellkall. Implementers oppdaterte verifikasjonsbevis skiller nå uttrykkelig historisk før-review-kjøring fra patchens relevante tester og beskriver F1-rettingen presist.

Ingen åpne F1–F5 gjenstår. Typecheck/lint/build/full regresjon ble ikke gjentatt i denne etterkontrollen og eies av parent. Denne konklusjonen er fortsatt ikke live-/S2-/S5-bevis eller en done-status.
