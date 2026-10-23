# Story 4.3 — verifikasjon av HTTP/live/kontrollflyt

Dato: 2026-10-23. Grunnlag: [godkjent spec](spec-4-3-bruke-live-analysen-i-samme-kontroll-og-resultatflyt.md), original Story 4.3 AC1–AC6, R1/R3 og runtime-kontrakt 2/1. Baseline `c24f15e82680a27327eaf9e1981679fe719bf91c`; arbeidsdiff før uavhengig review/commit.

Miljø: Node 24.21.0 fra `/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin`, eksisterende Playwright-cache `/private/tmp/ibe160-story-3-5-browsers`. HTTP-/Playwright-kjøringer fikk lokal loopback-tilgang; første sandbox-forsøk uten tillatelse kunne ikke lytte (`EPERM`) og regnes ikke som produktfeil. Alle SDK-forsøk brukte kontrollert offline-fetch og fiktiv nøkkel. Ingen reell live-analyse eller betalt API.

## Kravspor og faktisk grense

| Spor | Kontroll | Faktisk bevis |
|---|---|---|
| AC1, AD-5/6, FR-6 | Ett POST, lokal live-modus, eksplisitt start, sperret dobbeltstart og durabel hashmarkør | `live-http.test.ts`: virkelig Express/barneprosess, produksjonsfactory/SDK og duplikat med ny requestId/generasjon; `report-analysis.spec.ts` i begge moduser |
| R1/R3, AC3/5 | Dokumentfrist 60 s, live >60/<120 s, live ≥120 s, forsinket transportstarthåndtrykk | `live-pipeline-phases.test.ts` med kontrollert monoton klokke og IPC; ekte HTTP-abort avventer faktisk process-close og beholder markøren; eksisterende prosesshengtester verifiserer reell SIGKILL |
| AC2/6, FR-8–11 | Alle funn/usikkerheter, originalside, utkast/Bruk/Avbryt/Avvis, separat TG3/liste, synlighetsgrense og tastatur | Hele eksisterende kontrollsuite parameterisert demo/live mot faktisk router/prosess/adapter; PDF/fokus/Esc/1199–1200 px og kort status først ved synlig liste |
| AC3, FR-9/16 | Manglende nøkkel, 429, ugyldig/ufullstendig svar gir kjent trygg feil, ingen retry/fallback | Produksjonsgren i `live-http.test.ts`; kontrolladapterens feil/tomliste/usikkerhet i bygget UI; alle feil beholder ufullstendighet og lokalt Innhent mer informasjon |
| AC4, FR-5/12–18 | Samme finans/regler/tekst, gjenbruk ved finans/funn/TG3, historisk/gjeldende | `screening-result.spec.ts` i begge moduser: samme uavhengige F1/F2/F4-verdier og konkrete anbefalinger, utløsere, begrunnelse og neste handling; kallantall etter endringer; `live-analysis.test.ts` bruker ekte live-reducer |
| AC5, AD-2/5 | Sent svar, forlatt analyse, ny rapport, ingen gamle bekreftelser/avklaringer | Eksisterende reducer-/bygget-app-overganger i begge moduser og faktisk live-prosessabort/duplikat |
| AC6, NFR-3/4 | Streng modusbinding og trygg oppstart, demo uten nøkkel/nett | `analysis-http.test.ts`, `report-session.test.ts`, ny shelltest for ugyldige/hemmelighetsbærende metadata, eksisterende nett-/nøkkelgrenser og OS-nettprofil |

## Kjøringer

Node-banen ble satt først i PATH i alle npm-/node-kommandoer. Nettleserkommandoene satte den nevnte cachebanen. Ingen automatisk Playwright-retry.

- `npm run typecheck`, `npm run lint`, `npm run build`: bestått. Vite har fortsatt størrelsesvarsel for eksisterende PDF-/appchunk; ingen buildfeil.
- Målrettet fase/HTTP/SDK/live/reducer/schema: 48/48 bestått i fem testfiler. Etter ekstra forsinket-IPC-grensetest: `npm test -- tests/unit/live-pipeline-phases.test.ts` 5/5 bestått.
- Første `npm test`: 1045/1046 bestått, én `write EPIPE` i eksisterende chunked-upload-test. Isolert ny prøve og samtidig kontroll med uendret HEAD-router: begge bestått, 2/2. Midlertidige baselinefiler slettet; ingen uploadendring.
- `playwright test tests/e2e/report-analysis.spec.ts tests/e2e/screening-result.spec.ts --workers=4`: 134/144 bestått før retting av live-fixtureserverens adresse. Alle 10 feil var eksplisitt feil testserver, avdekket av modusassert. Etter retting: `playwright test tests/e2e/report-analysis.spec.ts --grep 'Story 4.3 live.*(2.6: produksjonsdemo|2.7)' --workers=4`: 13/13 bestått, inklusive alle 10 tidligere feil. Alle øvrige 134 var bestått; ingen antatt omkjøring.
- `playwright test tests/e2e/app-shell.spec.ts tests/e2e/financial-input.spec.ts --workers=2`: 40/43 bestått før finansprøvenes API-observatør ble oppdatert for trygg metadataoppstart. Etter retting: relevant finansutvalg 5/5 bestått, inklusive de tre tidligere feilene. Ny shelltest for streng bootstrapvalidering bestod.

- Komplett ny regresjon `npm test -- --maxWorkers=2`: **36 filer, 1047/1047 bestått** (83,13 s). Omfatter også den ekstra forsinket-IPC-testen og tidligere EPIPE-variant.
- `env -u OPENAI_API_KEY ... sandbox-exec -f .docs/implementation-artifacts/story-5-3-nettprofil.sb node node_modules/@playwright/test/cli.js test --config playwright.dev.config.ts`: **3/3 bestått**, OS-sperre for eksternt nett, bare loopback tillatt.
- `env -u OPENAI_API_KEY ... sandbox-exec -f .docs/implementation-artifacts/story-5-3-nettprofil.sb node tests/helpers/verify-analysis-build.mjs`: **bestått**, faktisk build/demooppstart, **204 frontendfiler, 0 nøkkellekkasjer**. Helperen bruker selv fiktiv in-memory nøkkel for å prøve grensen; ingen ekte nøkkel leses eller skrives.
- `git diff --check`: bestått. Råloggen er ikke skrevet til av implementeringen og er utenfor commit-scope; historiske hashobservasjoner står i arbeidsøkten.

Ingen testprosess er igjen ved implementeringshåndoff. Full E2E er dokumentert som første kjøring pluss målrettet omkjøring av berørte feil, ikke som en oppdiktet samlet grønn kjøring. Parent gjør uavhengig review og eventuelle sluttkontroller.

## Begrensning

Dette beviser kontrollert lokal funksjon, kodeutfall og ressurslivsløp. Ingen nettlesertest eller offline SDK-transport beviser faktisk leverandørtilgang, KI-treffkvalitet S2, live-tidsmål S5 eller annen-person-kjøring S6. 4.4/4.5 er ikke startet. Review/status og lokal commit eies av parent etter egen uavhengig kontroll.


## Parent-verifikasjon og reviewrettinger

Tre uavhengige reviewlag er kjørt og individuelt triagert i specen. Alle konkrete avvik i endringen er rettet; ett baselineforhold om manuell restart etter feil er utsatt i deferred-work. Ingen krav-/arkitekturbeslutning er endret.

- Komplett bygget-app-suite med `env -u OPENAI_API_KEY PATH=... PLAYWRIGHT_BROWSERS_PATH=... sandbox-exec -f .docs/implementation-artifacts/story-5-3-nettprofil.sb node node_modules/@playwright/test/cli.js test --workers=2`: **187/187 bestått** (2,7 min). Dette er en samlet grønn omkjøring etter testserverrettingene ovenfor. Rålogg under `/private/tmp/ibe160-story-4-3-final-e2e.txt` i arbeidsmiljøet.
- Etter reviewretting: `npm test -- tests/unit/live-pipeline-phases.test.ts tests/integration/live-http.test.ts tests/integration/server-mode.test.ts` under samme OS-nettprofil og uten nøkkel: **22/22 bestått**. Omfatter faktiske serverprosesser med unset/live/unknown miljø, aktive transportaborter, funn/usikkerhet og stille timerutløp med cleanup.
- Ny bygget app etter bootstrapretting: `npm run build` **bestått**, inklusive typecheck. `npm run lint` **bestått**.
- `playwright test tests/e2e/app-shell.spec.ts tests/e2e/report-analysis.spec.ts --grep '(4.3 startup|production missing-key|AC1/AC3)' --workers=2` under samme OS-nettprofil, uten nøkkel: **4/4 bestått**. Den nye 10 s bootstrapfristen testes med kontrollert klokke; status og trygg feil vises uten fallback. Den faktiske live-produksjonsgrenen viser manglende nøkkel og Innhent mer informasjon uten funnliste.

1047/1047-tallet ovenfor gjelder full Vitest før de nye reviewtestene; det er ikke feilaktig omtalt som en ny samlet kjøring av et senere testantall. Ingen betalt API, faktisk KI-evaluering eller arbeid i 4.4 er utført.

Ny build-/demooppstartskontroll etter bootstraprettingen: `env -u OPENAI_API_KEY -u ANALYSIS_MODE PATH=... sandbox-exec -f .docs/implementation-artifacts/story-5-3-nettprofil.sb node tests/helpers/verify-analysis-build.mjs` — **bestått, 204 frontendfiler og 0 nøkkellekkasjer**. Siste lint og diff-whitespacekontroll består. Root-README-status er avstemt med levert 4.3; faktiske live-evalueringer er fortsatt uttrykkelig gjenstående.
