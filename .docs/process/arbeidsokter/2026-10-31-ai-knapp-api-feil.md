# AI-knapp: gammel backend og tekstlig 404

Brukerens oppdrag: finn årsaken til JSON-feil ved AI-knappen, rett backend og feilhåndtering, og test med den nye ekte PDF-en. Ingen betalte kall eller push. Utgangspunkt: `210dfc8671da05b23bc6901e244c2ee3b6b08b12`. Kort arbeidsbeskrivelse: [spec](../../implementation-artifacts/spec-ai-api-versjonsavvik.md).

## Diagnose og retting

Faktisk feilende kall var `POST http://127.0.0.1:3000/api/document-economy/prepare`. Før retting: `HTTP/1.1 404 Not Found`, `Content-Type: text/plain; charset=utf-8`, respons `API-ruten er ikke tilgjengelig.` Frontend forsøkte ubetinget `response.json()`, og første bokstav A utløste brukerens feilmelding.

Port 3000 tilhørte PID 9623, `node src/backend/server.ts`, startet 2026-10-30 kl. 23:04:38. Arbeidskatalogen ble bekreftet som dette repoet med `lsof`. Prosessen var startet før implementeringen av økonomiruten; nåværende kildekode registrerte ruten korrekt. Nytt frontendbygg hadde blitt servert fra disk av gammel backend. Sidelasting eller bygg laster ikke backendmodulene på nytt.

Den utdaterte prosessen ble stoppet med SIGTERM. Etter nytt bygg ble nåværende backend startet på samme port. Serveren står igjen kjørende i demomodus uten API-nøkkel; `.env` finnes ikke. Ingen AI-transport er utført. Betalt kjøring krever senere lokal nøkkelkonfigurasjon og brukerens uttrykkelige samtykker.

API-fallback og serverens feilbehandler returnerer nå JSON. Feilformat, HTML og ugyldig JSON behandles trygt i begge AI-kall. HTTP 404 gir konkret omstartshjelp. En manglende kjørerute nullstiller plan og samtykker slik at brukeren kan forberede på nytt etter omstart; ingen automatisk transport eller endring av varig kostnadsjournal. HTTP 413 bevares ved for stor JSON-forespørsel. README beskriver stopp, bygg, start og sidelasting etter kodeoppdatering.

## Kontroller

Etter omstart gir et tomt kall uten påkrevde korrelasjonshoder til `/api/document-economy/prepare` JSON400 `{ "error": "invalid-request" }`; dette bekrefter at ruten kjører. Ukjent `/api/unknown` gir JSON404 `{ "error": "api-route-unavailable" }`. Den ekte PDF-en gir 200 og `application/json` ved korrekt forberedelse fra nettleseren.

Målrettede Vitest-tester: 11/11 består, inkludert faktisk serveroppstart, montert rute, ugyldig JSON, 413, eldre tekst404, andre feilformat, samtykker og stubbet SDK-transport. Bygg/typecheck, lint og diffkontroll består. Første forsøk på HTTP-tester ble hindret av sandboxens loopback-restriksjon; samme tester bestod med lokal nettverkstilgang. Et første Playwright-forsøk ble startet før bakgrunnsserveren var tilgjengelig; dette ble rettet ved å kjøre serveren som en vedvarende prosess og teste samme faktiske port.

Playwright bruker privat konfigurasjon `private/incoming/api-fix-ui.config.ts` og den eksisterende Chromium-installasjonen, med baseURL `http://127.0.0.1:3000`. Kommando: `PAA_UNSEEN_PDF=private/incoming/new-salgsoppgave.pdf npx playwright test --config private/incoming/api-fix-ui.config.ts`. Konfigurasjonen bruker samme testfil som den versjonerte standardkonfigurasjonen, men ingen egen webServer: kontrollen gjelder den faktiske brukerporten. Private PDF-er, utdrag og skjermbilder blir ikke versjonert.

Den ekte 135-siders PDF-en testes i tom økt, etter forrige eiendom og med faktisk lokal AI-forberedelse. Kontrollen verifiserer seks sikre økonomifelt, originalkilder, eksakt utdrag, 200/JSON, kostnadsramme og at begge samtykker kreves. Bare `/run`-responsen i godkjenningsflyten stubbes; forespørselens dokumenthash, plan, digest og begge samtykkeflagg kontrolleres. Andre nettlesertester gjenskaper tekst404 og JSON500, samt manglende kjørerute etter godkjenning og ny gratis forberedelse med nullstilte samtykker. Reell modellkvalitet er ikke testet.

## Gjennomgang

Bmad-build sin oneshot-gjennomgang ble brukt. Uavhengig reviewer fant tre konkrete forbedringer: 404 i kjøresteg lot engangssperren bli stående, nye API-feilkoder manglet lesbar forklaring, og gammel statusmapping gjorde 413 til 500. Alle tre ble vurdert som reelle og rettet med regresjonskontroller. Ingen funn ble utsatt. Oppdraget endrer ikke finansregler, kildekontroll eller kostnadssamtykke.

Endelig Playwright-kjøring etter alle reviewrettinger: **9/9 består (37,7 s)**. [Playwright](../../implementation-artifacts/ai-api-fix-2026-10-31/playwright.txt), [Vitest](../../implementation-artifacts/ai-api-fix-2026-10-31/tests.txt), [bygg](../../implementation-artifacts/ai-api-fix-2026-10-31/build.txt), [lint](../../implementation-artifacts/ai-api-fix-2026-10-31/lint.txt).
