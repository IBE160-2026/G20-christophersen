# AI-forsøk uten synlig avslutning

Brukerens oppdrag var å undersøke det opprinnelige kallet først, rette usynlig status og teste uten nye betalte kall eller push. Baseline: `7b08ab27f4eec32650d03fa03eb3f4a04ccc2627`. [Avgrenset spec](../../implementation-artifacts/spec-ai-analyse-status.md).

## Hva skjedde med det opprinnelige forsøket?

Backendprosessen var PID 42681, startet 2026-10-31 kl. 03:47:39 fra dette repoet med `.env`. Prosessen ble ikke stoppet under undersøkelsen. Ingen nye `POST /document-economy/run` ble sendt til denne serveren i arbeidet.

Kostnadsjournalen for den nye ekte 135-siders PDF-en, hash `3d0db0a7e84fb863bdeff1bd3390e833bd8fa151be8cbc3709835062d51ab49c`, hadde én oppføring: requestdigest `6ea0dc0433a4b83ec3c7c7c06389e2aae25a3befa241f0f43be3dc662ebc1076`, reservasjon USD 0,15, actualUsd null og state uncertain. Journalen ble sist endret kl. 03:50:13. Ingen tilhørende lås eller resultatcache fantes. `lsof` viste bare lytteport 3000, ingen åpne klientsockets hos backend. Serverutdata fra den opprinnelige prosessen inneholdt ingen bevart leverandørfeil.

Dette beviser at forsøket nådde backendens betalte utførelsesløp, fikk varig reservasjon og ble avsluttet lokalt med ukjent utfall. Det beviser ikke at OpenAI mottok dokumentutdragene eller fakturerte kontoen. Koden reserverte før transport og satte uncertain ved både transport- og valideringsfeil. Detaljert historisk årsak og faktisk betaling kan ikke fastslås fra de bevarte dataene. Journalen er beholdt urørt; ingen kvote eller engangssperre er nullstilt.

## Rettet årsak til usynlig status

Status og feil stod over åpne tekstutdrag, mens startknappen stod langt nede. Ved åpen forhåndsvisning kunne brukeren bli stående ved deaktivert knapp med meldingen utenfor synsfeltet. Nettleseren hadde heller ingen egen HTTP-frist eller lokal statusgjenoppretting etter reload. Serveren kastet bort SDK-feilkategorien og logget ikke sikker transportmetadata.

Status vises nå ved handlingen og bringes i synsfeltet ved start, feil og fullføring. Klienten har 135 sekunders frist i tillegg til serverens 120 sekunder. En frist gir uavklart utfall, aldri påstand om null belastning. Lokal, tidsbegrenset statusavstemming kan vise at backend fortsatt kjører eller senere fullfører; mislykket polling gir ukjent status og en egen gratis kontrollknapp. Gammel backend gir konkret omstartshjelp.

Ny GET-status leser eksisterende kostnadsjournal uten å opprette journal/lås eller endre historikk. Låst, skadet, lenket eller ventende journal sperrer nye betalte kall. Statuslesing avviser også FIFO uten å blokkere serveren. Manglende historisk kostnadsproveniens forblir ukjent. Eksisterende persistente reservasjoner, serverlås, engangsplan og SDK maxRetries=0 bevares; klienten har også synkron sperre mot samtidige klikk.

Serverens nye audit inneholder bare tidspunkt, dokumenthash, requestdigest, transportforsøk, HTTP-status, godkjent request-ID og sikker feilkategori. API-nøkkel, rå SDK-feil og dokumenttekst logges ikke. Den gamle feilen blir ikke rekonstruert eller tillagt en oppdiktet kategori.

## Gjennomgang og verifikasjon

Bmad-build oneshot ble brukt med avgrenset backenddelegasjon og én uavhengig blind gjennomgang. Review fant sju konkrete forbedringer: avstemming etter klientfrist, motsigende running etter pollfeil, FIFO-blokkering, tapt historisk kostnadsproveniens, mistet omstartshjelp ved status404, privat testavhengighet uten eksplisitt fixture og hardkodet testport. Alle sju er rettet og verifiseres med relevante tester. Ingen av disse funnene utsettes.

Playwright kjører på isolert port 3001 med tom API-nøkkel mens originalserveren på 3000 bevares. Vanlig konfigurasjon støtter `PAA_E2E_PORT`, brukt av både nettleser, server og readiness-kontroll. Privat konfigurasjon velger installert Chromium, og den historiske kontrollen krever eksplisitt dokumenthash i tillegg til PDF-banen. Betalte responser er bare lokale stubber; vanlig journal- og statustesting oppretter isolerte testjournaler. Den ekte usikre historikken leses uten endring.

Den private kontrollen bruker `PAA_E2E_PORT=3001 PAA_UNSEEN_PDF=private/incoming/new-salgsoppgave.pdf PAA_UNCERTAIN_DOCUMENT_SHA256=3d0db0a7e84fb863bdeff1bd3390e833bd8fa151be8cbc3709835062d51ab49c npx playwright test --config private/incoming/ai-status-ui.config.ts`. Utdrag, private PDF-er og skjermbilder versjoneres ikke.

Oppfølgende review bekreftet de sju rettingene og fant én ekstra gjenopprettingsfeil før noe betalt forsøk var sendt. Denne er rettet med separat sporing av innsendt forsøk og tidligere betalingsbevis. Gratis kontroll kan gjenåpne forberedelse når journalen bekrefter idle og ingen betalingsrisiko er kjent; den opphever aldri engangssperren for et mulig betalt forsøk. Kontrollens feil må holdes adskilt fra eksempelvis manglende API-nøkkel eller server-busy.

Tilgang til den opprinnelige nettleserens nettverksinspektør var utilgjengelig: browser-host svarte ikke, og native Chrome-lesing gav timeout. Nettverks- og avslutningskonklusjonen bygger derfor på backendjournal, frigitt lås, serverutdata og sockets. Den detaljerte historiske OpenAI-feilen er fortsatt ukjent.

Endelig bevis: [1635/1635 tester](../../implementation-artifacts/ai-status-2026-10-31/tests.txt), [17/17 Playwright](../../implementation-artifacts/ai-status-2026-10-31/playwright.txt), [bygg/typecheck](../../implementation-artifacts/ai-status-2026-10-31/build.txt) og [lint](../../implementation-artifacts/ai-status-2026-10-31/lint.txt). Siste UI-retting er verifisert av nettlesertestene, inklusive at gratis idle-status ikke fjerner ekte kjørefeil eller sperren etter et mulig betalt kall. To mellomliggende nettlesertester avdekket at slike feil ble fjernet for tidlig; rettingen skiller nå statusfeil fra kjørefeil.

Etter grønn sluttkontroll ble serveren på port 3000 startet på nytt med eksisterende .env. Nøkkeltilstedeværelse ble bekreftet i serverprosessen uten å vise innhold. Ingen journallåser fantes ved stopp. En lokal GET på produksjonsprosessen returnerer failed / economy-previous-uncertain / USD0,15 reservert / faktisk kostnad ukjent / retryAllowedfalse. Opprinnelig journal har identisk SHA256 før og etter omstart/tester: c0801a518a8b64980defcaaad0211865b204f4def68fefa0aef7f9f09303e730. Ingen nye betalte kall eller push.
