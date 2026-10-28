---
title: 'FINN-2: Responses-kobling bak tilgangsgate'
type: 'feature'
created: '2026-10-28'
status: 'done'
baseline_commit: 'f3b1f3053c8704e01191e5f585836ca0d1d8614c'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="Brukereid videreføring av FINN-import">

## Intent

Koble eksisterende import til backendens OpenAI Responses API. Brukeren velger
ett oppslag; nøyaktig validert innlimt FINN-lenke skal brukes i open_page.
Kildestøttede verdier fyller eksisterende skjema som ubekreftet grunnlag.
Brukeren beholder kontroll og korrigering; ukjent forblir ukjent.

## Boundaries & Constraints

Bevar finans/screening, manuell PDF, tidligere FINN-bevis, S5-W1 og S6. Ingen
reelle eller betalte API-kall i utviklingsøkten; bruk opptak og testtransport.
Ingen scraping, andre søkehandlinger, automatiske retries, estimater eller push.

Produksjonskoblingen er stengt som standard, uavhengig av ANALYSIS_MODE.
Backend krever FINN_IMPORT_ENABLED=true samt ikke-tomme
FINN_IMPORT_ACCESS_REFERENCE og FINN_IMPORT_COST_REFERENCE før nøkkel/klient
kan brukes. Referansene dokumenterer operatørens godkjenninger. OPENAI_API_KEY forblir
på backend. Ingen gate åpnes eller ekte nøkkel kontrolleres nå.

Én ekstern forespørsel om gangen. Hver FINN-kode forsøkes høyst én gang per
serverstart, også ved feil/avbrudd; gateavvisning/busy bruker ikke forsøket.
Nytt forsøk krever serveromstart. Ingen henting ved navigasjon. Transport som
ignorerer abort holder sperren til den faktisk avsluttes.

## I/O & Edge-Case Matrix

| Input/tilstand | Forventet atferd |
| --- | --- |
| Stengt/ufullstendig gate | Ingen klient, nøkkellesing eller ekstern transport; manuell reserveflyt |
| Åpen gate og konfigurasjon | Én offisiell SDK-forespørsel til fast OpenAI-endepunkt; samme modell/SDK, maxRetries=0, ett verktøykall og absolutt frist |
| Legacy-/trackinglenke | Eksakt originalstreng i request og faktisk completed open_page; annen åpnings-URL avvises |
| Samtidighet/gjentakelse | Ingen ekstra SDK-kall; tydelig busy/allerede-forsøkt-status |
| Gyldig uttrekk | Automatisk ubekreftet utfylling av entydige støttede felt; originale import-/kildeopplysninger beholdes |
| Mangler/sprik/manuell endring | Ingen falske nuller, kostnadsdobling eller overskriving av manuelle verdier; ingen komplett D/J uten tilstrekkelig grunnlag |
| Opptak i gammelt schema/SDK-feil | Trygg feil uten retry, oppdiktet tilpasning eller nøkkel-/råfeillekkasje |

</frozen-after-approval>

## Code Map

Gjenbruk `src/backend/analysis/backend-config.ts` / `abortable-fetch.ts` for
sikker SDK/abort; PDF-oppsettet bevares. `src/domain/listing.ts` eier kilder/
kostnader, og `src/frontend/state/session.ts` eier invalidasjon og manuelle
felt. Adapteren bruker nå kanonisk URL; transporten må bruke originalen.

## Tasks & Acceptance

- [x] `src/backend/listing/backend.ts` — gate, backendklient og virkelig SDK-transport med injiserbar fetch; begrens responslesing og skjul interne feil.
- [x] `src/backend/listing/{adapter,request,response}.ts` — eksakt URL, én aktiv transport og varig forsøksvern i prosessen; ingen retry.
- [x] `src/backend/http/listing-route.ts`, `src/backend/server.ts`, `src/contracts/listing.ts` — koble produksjonsruten og trygge sperre-/konfigurasjonsutfall.
- [x] `src/domain/listing.ts`, `src/frontend/state/{session,listing,result}.ts` — automatisk ubekreftet utfylling uten manuell overskriving. Ufullstendig D/J forblir ukjent.
- [x] `src/frontend/{screens/ListingImport.tsx,analysis/listing-client.ts}` — riktige gatetekster og synkron dobbeltstartsperre; behold kontroll-/PDF-flyt.
- [x] `tests/unit/listing-backend.test.ts`, eksisterende listing-tester og `tests/integration/listing-http.test.ts` — SDK med stubbet fetch, opptak, gater, URL, feil, abort, samtidighet og duplikater.
- [x] `tests/e2e/listing-import.spec.ts` — automatisk skjema, retting, beskyttede manuelle felt og sperreutfall.
- [x] `README.md`, ny økt-/sluttlogg, sentral deferred-work og SPEC-tillegg — dokumenter kobling/gater, bevis og før-live-prøven.

**AC:**
- FK-1: Gitt stengt gate, når import bestilles, så brukes ingen nøkkel/klient/transport.
- FK-2: Gitt kontrollert SDK-transport, når oppslag startes, så brukes eksakt URL én gang; annen handling/URL, SDK-feil og for stort svar avvises uten retry/lekkasje.
- FK-3: Gitt aktiv eller tidligere forsøkt annonse, når ny forespørsel kommer, så skjer ingen ny innhenting; avbrudd omgår ikke sperren.
- FK-4: Gitt gyldig import, når svaret mottas, så fylles entydig P automatisk som ubekreftet; kjente poster vises i importfeltene, og ufullstendig D/J forblir ukjent. Manuelle verdier/perioder/kilder bevares.
- FK-5: Gitt eksisterende opptak og syntetisk fasit, når regressjonen kjøres, så beholdes mangler, kildekontroll, kostnadsvern og PDF-/screeningflyt uten nett/betaling.

## Implementation Notes

- Sluttført: 45 filer / 1224 Vitest, 37 komponenter og 205 bygde E2E + 3 dev bestod. Bygg/typekontroll og lint bestod. Alle FK-1–FK-5 og matriserader har kjørte prøver. [Sluttbevis og første kontrollerte UI-prøve](finn-responses-2026-10-28/sluttverifikasjon.md). Gaten er ikke åpnet; ingen faktisk/betalt transport eller push. Aktiv promptlogg følger lokal commit.

- Kode og matrise kontrollert mot diff: bygg/typekontroll, lint, 92 målrettede unit-/HTTP-prøver og 12 ordinære FINN-/fokusprøver bestod. Gamle opptak avvises uendret. Endelig bred regresjon følger review. Brukeren godkjente stopp av ukjent eksisterende PID 56418; SIGTERM ble sendt etter ny portkontroll, og testporten ble frigjort.

- Brukeren godkjente specen og fortsatt implementering i aktiv promptlogg 2026-10-28. Godkjent tekst er lest på nytt; ingen eksterne endringer.
- Hovedøkten kjører BMAD og eier sluttdokumentasjon, full regresjon og review. Implementeringsagenten utfører denne handoffen direkte fra specen; ikke start en rekursiv build-dispatch. Returner etter kode og berørte tester; hovedøkten eier commit.
- Lokal Node 24.21.0: `/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin` først i PATH. Eksisterende Chromium: `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-3-5-browsers`. HTTP/browser kan kreve eskalert loopback; ingen faktisk transport er tillatt. Bevis lagres i `.docs/implementation-artifacts/finn-responses-2026-10-28/`.
- Baseline: 3 unit-filer / 83 tester bestod. Gammelt råopptak ble lokalt bekreftet som completed open_page og avvist av ny kontrakt. OpenAI Docs web_search-veiledningen ble søkt/åpnet 2026-10-28; faktisk action, ikke prompt alene, dokumenterer åpningen: https://developers.openai.com/api/docs/guides/tools-web-search . Modell/SDK beholdes.

Fasit gjenbrukes: pris 3000000, gjeld 200000 og omkostninger 75000 gir P 3200000,
FINN-total 3275000. Dokumentavgift inkludert i omkostningene legges ikke til igjen.
Råopptakets eldre schema skal avvises ærlig. Ingen uavklarte produktvalg eller
irreversible handlinger; bare lokale kode-/dokumentendringer.

## Spec Change Log

## Review Triage Log

| ID | Dom | Bevis og rute |
| --- | --- | --- |
| B1 | medium | Ready-utkast kan hentes igjen i UI; already-attempted gjør det failed og sperrer bruk. Patch: forhindre redundant start uten å gjøre tidligere mislykket oppfrisking gjeldende. |
| B2 | high | Reprodusert: manuell P=4000000 beholdes mens J=111999.96 bygger på annonse-P=3200000. Patch: avstem prisgrunnlag før importert J brukes, med tydelig forklaring. |
| B3 | medium | Samme-kode URL-endring under loading øker generation og aborterer/forkaster pågående svar, men backendforsøket er brukt. Patch: lås URL-redigering under aktivt oppslag og prøv reell brukerflyt. |
| B4 | high | Reprodusert: available-price med alternatives godtas av validateListingImport; automatisk P stoler på status. Patch: motstridende representasjon avvises før automatisk bruk. |
| B5 | high | boundedFetch kaster cancellation-promise; outer abortableFetch gjør SDK-promise ferdig før treg underliggende kansellering. Patch: backend må holde transportens eierskap til underliggende body/cancel faktisk avsluttes; test må vise busy under pending cancel. |
| B6 | medium | Fristprøve dekker bare success-body; SDK-eid 429/500-body som stanser mangler prøve. Patch: berørt test av frist/trygg feil/ett forsøk. |
| B7 | medium | Størrelsesprøver er ett ASCII-chunk; byteakkumulering over flere UTF-8-chunks mangler. Patch: test at bytegrensen stopper strømmen før resten leses. |
| B8 | medium | Ready-tekst påstår utfylling også når P er ukjent eller manuelt beskyttet. Patch: tekst uten falsk påstand om hva som ble anvendt. |
| B9 | false | UI sier allerede at manuelle P/D/J bevares, og de eksisterende skjemafeltene lar brukeren korrigere hvert tall. Ny reset-/overstyringshandling kreves ikke av bestillingen; bevart manuell eierskap er godkjent atferd. Ingen ny produktfunksjon innføres for dette forslaget. |
| E1 | high | Samme pris/J-blanding som B2; vakten mangler i useJ og ble konkret reprodusert. Patch, grupperes med B2. |
| R1 | medium | Bred browserregresjon ga 204 pass og ett 30 s-avbrudd i eksisterende Promise.all-venting på scrollend/PageDown. Lytting registreres nå før tastetrykk; faktisk rulling relativt til start og alle geometri-/fokuskrav beholdes. Åtte berørte prøver bestod; ingen tidsgrense økes. |
| V1 | medium | Forhåndsverifisert gap: ugyldig oversized JSON feiler også uten strømmegrense. Patch: observer tidlig kansellering/ulest rest før frist, for både success og SDK-eid error-body. |

Etterkontroll av B2/E1: import-eid J avstemmes mot anvendt snapshot, ikke
ubrukte nye rettinger. To nye regresjonsvarianter dekker dette. 118 berørte
prøver og 45 filer / 1224 tester bestod etter produktrettingene.

Alle reelle funn gjelder påviste tilstander i eksisterende flater og rettes
uten nye produktvalg eller eksterne grensesnitt. Ingen relevante funn utsettes.

## Verification

Målrettede opptaks-/SDK-/økt-/HTTP-prøver først; så uavhengig BMAD-review og
regresjon: bygg/typekontroll, lint, Vitest, komponenter og E2E. Node 24.21.0;
full Vitest kjøres uten samtidig browserregresjon etter observerte tidsavbrudd.
