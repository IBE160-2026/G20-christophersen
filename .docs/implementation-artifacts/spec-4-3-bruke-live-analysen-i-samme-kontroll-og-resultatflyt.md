---
title: 'Story 4.3 — Bruke live-analysen i samme kontroll- og resultatflyt'
type: 'feature'
created: '2026-10-23'
status: 'done'
baseline_commit: 'c24f15e82680a27327eaf9e1981679fe719bf91c'
route: 'dispatch'
review_loop_iteration: 1
context:
  - '{project-root}/.docs/planning-artifacts/r1-live-ki-semester-v1.md'
  - '{project-root}/.docs/specs/spec-IBE160/SPEC.md'
  - '{project-root}/.docs/specs/spec-IBE160/grensekontrakter.md'
  - '{project-root}/.docs/planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md'
  - '{project-root}/.docs/planning-artifacts/epics.md'
---

<frozen-after-approval reason="Eksisterende Story 4.3 AC og R1 er autoritativt grunnlag">

## Intent

Koble produksjonsadapteren fra Story 4.2 til eksisterende HTTP-, kontroll- og resultatflyt. Originale Story 4.3 AC1–AC6 og testkrav gjelder uendret. Live skal være tydelig merket og bruke samme brukerhandlinger, gyldighetsvern og kodebestemte resultater som demo.

## Boundaries & Constraints

**Always:** R1s lokale dokumentfrist 60000 ms og separate live-adapterfrist 120000 ms, med reell ressursstans og cleanup før aktiv request-lås frigjøres. Backend velger modus lokalt; demo er standard. Duplikatmarkør for økt/modus/rapporthash settes før adapterkall og beholdes til serverstopp, også etter abort. Hele eksisterende dokumentgrunnlag, adapter og runtime-kontrakt 2/1 gjenbrukes. Frontend validerer modus i tillegg til eksisterende korrelasjon, hash og generasjon. Bare trygg modusmetadata sendes ved oppstart. Kontroll, synlighetsregistrering, finans, screening og TG3 beholder eksisterende autoriteter. Viktige arbeidsvalg og testbevis lagres i repoet.

**Never:** Ingen Story 4.4/4.5, betalt API, reelle live-forsøk eller S2/S5-påstander. Ingen nye skjermer, analyseknapper, jobbtilstander, polling, retry eller demo-fallback. Ingen nøkkel i frontend/build/svar/logger eller nye låste produktkrav. Ny produkt-/arkitekturbeslutning krever stopp. Den usporede `session-01a16887-941e-7e11-af8e-c2fc6ab0d86a.jsonl` skal ligge urørt og utenfor committen.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| AC1 | Live, gyldig rapport, eksplisitt Start | Samme POST, Live analyse og Analyserer, ett adapterkall | Dobbeltstart og ny requestId/generasjon omgår ikke sperren |
| AC2 | Validert live-uttrekk | Alle funn/usikkerheter med originalside, utkast, retting, avvisning og separat TG3 | Ingen automatisk listebekreftelse eller avklaring |
| AC3 | Manglende nøkkel, leverandørfeil, ugyldig/ufullstendig svar, timeout | Trygg kjent årsak og Innhent mer informasjon | Ingen ny forespørsel, fallback eller tomlistesuksess |
| R1 | Lokal fase <60 s; live >60 s og <120 s | Gyldig live-fullføring tillates | Ved live ≥120 s: timeout, prosess/transport stoppes, sent svar forkastes |
| R3 | Dokumentfasen ≥60 s | Lokal timeout før adapter | Ingen adaptertillatelse; bytes/arbeid ryddes |
| AC4 | Finans-, funn- eller TG3-endring etter live-uttrekk | Gjenbruk; relevant bekreftelse og historisk/gjeldende resultat | Samme effektive grunnlag gir samme kodeutfall som demo |
| AC5 | Rapportbytte, forlatt analyse eller klientabort | Gamle svar avvises; ny rapport krever eksplisitt analyse/kontroll | Ingen gjenoppliving av tidligere kontroll/resultat; markør består |
| AC6 | Demo uten nøkkel/nett og live-fullføring/feil | Riktig modus, fokus, tastatur og korte statusmeldinger | Ferdiglistehendelse først når validert liste faktisk er synlig |

</frozen-after-approval>

## Code Map

- `src/backend/analysis/backend-config.ts`, `live-adapter.ts`, `analyze-document.ts`: gjenbruk produksjonsklient, adapter, dokumentvern og binding. Bevar absolutt leverandørfrist/retryoppsett.
- `src/backend/http/run-pipeline.ts`: eier stoppbar requestprosess, aktiv lokal frist, IPC-kontekst og duplikatmarkør. Nå hardkodet demo og 60 s gjennom adapteren.
- `src/backend/http/pipeline-child.ts`: samme PDF-/tekststeg; nå hardkodet demo. Velg live-adapter fra lokal serverkonfigurasjon og bevar dokumentvern før adaptertillatelse.
- `src/backend/server.ts`, `http/analysis-route.ts`: lokal komposisjon, ingen klientstyrt modus eller kjørbar modulseleksjon. Eksisterende kontrollmoduler er bare betrodd testinjeksjon.
- `src/frontend/main.tsx`, `App.tsx`, `state/session.ts`, `state/report.ts`: bind trygg oppstartsmodus til aktiv økt og bevar modus ved rapportbytte. Reducer avviser nå alle live-utfall.
- `src/frontend/screens/ReportAnalysis.tsx`, `ScreeningResult.tsx`: erstatt hardkodet demoetikett med øktens modus; bevar eksisterende kontroll-/resultatregler og listeobservatør.
- `tests/e2e/report-analysis.spec.ts`, `screening-result.spec.ts`, `tests/helpers/report-ui-adapter.ts`: gjenbruk bygget frontend og virkelig Express-/prosessgrense med kontrolladapter.
- `tests/integration/live-analysis.test.ts`: fjern dagens testomskriving av live til demo; bruk ekte live-modus i reduceren.

## Tasks & Acceptance

**Execution:**
- [x] Backendfilene over: lokal moduskomposisjon, produksjonsadapter og separate fasefrister; uendret demofrist og cleanup/markører.
- [x] Felles trygg oppstartsmetadata og frontendfilene over: validert modusbinding og merking gjennom de fire eksisterende trinnene. Ingen konfigurasjonsreise.
- [x] HTTP-/supervisortester: kontrollert klokke for fasefrister, ekte prosesscleanup, duplikater, abort, feil og produksjonsadapter med ekte SDK over injisert offline-transport.
- [x] Bygget-app-E2E: faktisk live-kontrolladapter ved samme grense, feil/tomliste/usikkerhet, originalside, tastatur/fokus/status, gjenbruk og sent svar/ny rapport. Sammenlign faktiske finans-/regelutfall i begge moduser.
- [x] `src/backend/README.md`, egen verifikasjonsrapport og arbeidsøkt: dokumenter levert kobling, testbevis og avgrensning uten å påstå live-evaluering.
- [x] Kjør relevante tester, typecheck/lint/build og demo uten eksternt nett. Sett Story 4.3 til review, oppdater sprintstatus og lag lokal commit uten push eller rå promptlogg.

**Acceptance Criteria:** Given scenarioene i matrisen og original Story 4.3 AC1–AC6, when kontrollert integrasjon og bygget app prøves, then oppfylles de eksisterende utfallene uten ny KI-kjøring ved kontrollendringer og uten endret demoflyt.

## Implementation Notes

Undersøkelsen fant ingen produktgap eller irreversible handlinger. Lokal miljøvariabel for modus og schema for trygg oppstartsmetadata er implementeringsdetaljer innen arkitekturens eksisterende konfigurasjonsgrense. Faseveksling skjer først etter komplett validert dokumentgrunnlag ved eksisterende adaptertillatelse; supervisoren beholder ansvar for prosessens levetid. R1/R3, kontraktvalidering og frontendens synlighetsgrense skal bestå. Eksisterende Epic 4-konteksts tidligere mini-sprintavgrensning til 4.1/4.2 er overstyrt av brukerens uttrykkelige bestilling av 4.3; historiske dokumenter omskrives ikke.

## Verification

Bruk prosjektets Node24.21.0 og eksisterende Playwright-cache. Alle leverandørforsøk er kontrollerte offline-forsøk. Kjør målrettede HTTP-/fase-/live-/reducertester, berørte bygget-app-E2E, `npm run typecheck`, `npm run lint`, `npm run build` og eksisterende offline-demo-/nøkkelgrensekontroller. Dokumenter faktiske resultater, ingen antatte beståelser.

Implementeringen er kontrollert mot diffen og matrisen: modusbinding, produksjonskomposisjon, egne fasefrister, live-reducer og parameterisert kontroll-/resultatflyt er levert. Testdekningen er sporet per AC i story-4-3-verifikasjon.md. Uavhengig review følger før lokal commit.

## Review Triage Log

Tre uavhengige reviewere (blind, kanttilfeller og verifikasjonsgap) leste arbeidsdiffen. Alle funn er vurdert individuelt nedenfor. Ingen nye låste krav eller produkt-/arkitekturbeslutninger følger av rettingene.

| ID | Vurdering | Bevis og håndtering |
|---|---|---|
| B1 | medium, patch | Bootstrap ventet ubegrenset på metadata/body før første render. Nå vises kort status og request/body avbrytes etter 10 s med eksisterende trygg oppstartsfeil. Bygget-app-test med holdt request og kontrollert klokke består. |
| B2 | low, avvist | Reviewer foreslo ny klient-/serverbinding ved bytte fra demo til live gjennom serverrestart med gammel nettleserøkt. Modus er etter AD-6 lokal konfigurasjon og eksplisitt valgt ved oppstart; støttet konfigurasjonsbytte beskrives med ny lasting av appen. Ingen varm modusendring er implementert. Ny protokoll for kontinuitet over slik omkonfigurering av serveren ville utvide denne sjeldne driftsbanen; returvernet avviser allerede modusavvik. |
| B3 | medium, defer | Manuell Start etter en terminal feil kan ende i duplicate-analysis og erstatte første feiltekst. Bekreftet som eksisterende oppførsel i baseline: ReportAnalysis tillater failed, og 2.5-routeren beholder markøren. Ingen automatisk retry innføres her. Forbedringspunktet er ført i deferred-work uten endring av demoens eksisterende feilflyt. |
| B4 | medium, patch | Abortprøven ventet bare på adaptertillatelse før SDK-import/start. Den kontrollerte fetch-modulen skriver nå et innholdsløst testmerke etter at transportens abortlytter er registrert. HTTP-testen venter på dette før klientabort og kontrollerer faktisk prosess-close/varig markør. |
| B5 | medium, patch | Faseprøvene håndhevet bare deadline ved ny IPC. Nye fake-timer-prøver lar stille dokument-/adapter-/transportfase utløpe fra timeren selv, og krever SIGKILL, uavgjort promise før close, frigjorte bytes og riktige markører. |
| B6 | medium, patch | Produksjons-HTTP/SDK-suksess hadde bare tomliste. Ny transportcase returnerer kjent TG3 og uklar kandidat; HTTP-prøven krever bundet hash/navn, fysisk side 2 og bevart original usikkerhet. |
| B7 | low, patch | Nye protokollguards manglet egne negative regresjonsprøver. Før tillatelse, dobbelt håndtrykk, fremtidig og ugyldig timestamp testes nå; alle gir trygg feil og kan ikke gjøre sent completed gjeldende. |
| B8 | medium, patch | Manglende nøkkel var bare prøvd via HTTP. Ny bygget live-app-prøve bruker produksjonsgrenen uten nøkkel og krever kjent årsak, Live analyse, Innhent mer informasjon, ingen funnliste og én tillatelse. |
| B9 | medium, patch | Live-prøvene konstruerte router direkte og kunne skjule feil i server.ts. Ny server-entry-test starter faktisk server med unset/live/unknown miljø, uten nøkkel; krever riktig metadata og demo-completed/live-failed samt avsluttet ugyldig oppstart. |
| B10 | low, patch | Eldre backend-README sa fortsatt at 4.3-koblingen gjenstod. Tidligere avsnitt er avstemt med levert modus-/fasekobling. |
| E1 | medium, patch, samme rot som B1 | Kanttilfelle-review viste samme uavgrensede bootstrap-request/body. Rettet og verifisert som B1; ingen separat feil utelatt. |
| V1 | medium, patch, samme rot som B9 | Verifikasjonsreview viste at createAnalysisRouter() uten mode i server.ts ville passere routerbaserte tester. Faktisk entry-point kontrolleres nå; ingen nett-/nøkkelavhengighet. |
| V2 | medium, patch, samme rot som B5 | Verifikasjonsreview viste at fjernede live-timere ikke ville rammes av IPC-baserte tester. Stille timerutløp etter tillatelse og etter transporthåndtrykk har nå egne beståtte regresjonsprøver. |

Alle konkrete funn i endringen er lukket; ett eksisterende forbedringspunkt er utsatt. Se [verifikasjon](story-4-3-verifikasjon.md) og [arbeidsøkt](../process/arbeidsokter/2026-10-23-story-4-3.md). Story-status beholdes in-review etter brukerens bestilling; sprintstatus settes review før commit.

Sluttkontroll: også ny build/demooppstart med 204 frontendfiler og 0 nøkkellekkasjer består under OS-nettsperre. README-status er avstemt med levert integrasjon uten påstand om 4.4/4.5-evaluering. Sprintstatus er review.

## Nytt code review av fdd86dc — 2026-10-23

Fire uavhengige lag: blind hunter, edge-case hunter, verification-gap og acceptance auditor. Alle leverte; edge-case-laget rapporterte ingen funn. Ingen konkret runtime-overtredelse av AC1–AC6, R1 eller kontraktene ble påvist. Den nye bestillingen autoriserer retting og done etter bestått kontroll; tidligere tekst om å beholde review gjelder implementeringshåndoffen.

### Review Findings

- [x] [Review][Patch] C4/V1, medium: produksjonens transportstart-IPC manglet regresjonsvern. Ny `live-pipeline-wiring.test.ts` kjører faktisk barneprosess, produksjonsadapter og SDK med offline-transport og kontrollert supervisorklokke. Fullføring ved 124 s fra tillatelse /119 s fra transport tillates. Isolerte mutasjoner uten IPC og uten fristutvidelse feiler. Ingen runtimeendring.
- [x] [Review][Patch] A1, medium: manuell live-UX-kontroll var ikke dokumentert. Utført via native Chrome/UI med offline-kontrolladapter; modus, analyse-/feilstatus, fokus, tastatur og faktisk synlig liste kontrollert. Se ny reviewarbeidsøkt.
- [x] [Review][Defer] C2, medium: Start etter terminal feil kan erstatte opprinnelig feil med duplicate-analysis. Baselineforhold allerede registrert i deferred-work; ikke rettet eller duplisert i ledgeren.

### Rejected

| ID | Dom | Individuelt bevis / avgrensning |
|---|---|---|
| C1 | low, avvist | Overlevende demofane etter omkonfigurering til live er en reell driftskant, allerede triagert B2. Dokumentert oppsett krever ny lasting. Ny modusprotokoll for en slik omkonfigurering er ikke en direkte retting innen støttet oppstart. |
| C3 | false | Den lokale konfigurasjonsruten returnerer bare strengvalidert `{mode}`. Ingen støttet vei gir den vilkårlig store JSON-bodyen kandidaten forutsetter. |
| C5 | false | Kontrolltransporten teller faktiske fetch-kall og kaster ved kall nr. 2; SDK-/adaptertester dekker ingen retry. Påstanden om manglende bevis for ett transportforsøk holder ikke samlet. |
| C6 | false | R1 krever faktisk ressursstans, ikke separat graceful abortsignal før SIGKILL. HTTP-testen avventer reell prosess-close før låsfrigjøring; eide transportressurser avsluttes med prosessen. |
| C7 | false som nytt 4.3-funn | Muligheten for endret pageCount i betrodd context-IPC finnes i baseline. Produksjonsbarnet følger fast protokoll og sender ingen slik mutasjon etter tillatelse. Ingen nåbar ny feil er vist. |
| C8 | false | Produksjonsbarnet bruker aktuell monoton tid. Eldre fabrikkerte tidsstempler gir trygg timeout uten fullføring eller fristforlengelse; ingen brudd på R1 er demonstrert. |
| C9 | low, avvist | Entry-test krever ledig dokumentert port 3000. Portkonflikt med en allerede kjørende app er et lokalt testvilkår; ny portkonfigurasjon/preload tilfører mer enn en direkte retting. Sluttregresjon kjøres med ledig port. |

C4 og V1 er vurdert hver for seg som medium, samme verifikasjonshull og felles patch. A1 er et separat verifikasjonsfunn. Ingen beslutning eller nye produktkrav er nødvendig. Endelig testresultat og status føres i verifikasjonsrapporten.
