# Story 2.5 — intern BMAD-build-kontroll

Tre uavhengige reviewlag leste en samlet diff mot
`03011d5f914a45b3f3f5f8f9488e9c714c9c72c6`. Blind hunter fant ti
forbedringspunkter; verification-gap fant to konkrete regresjonsgap;
edge-case-hunter returnerte ingen funn. Dette er intern build-kontroll,
ikke separat godkjenning/done av storyen.

## Triage før retting

| ID | Funn | Verdict | Evidens og behandling |
|---|---|---|---|
| B1 | Sluttframing utenfor metadataopptelling | medium | Headerbudsjettet var inklusivt, men sluttgrensen kom i tillegg. Tell alle ikke-filbytes innen 1 MiB og juster grenseprøven. Patch. |
| B2 | Kvadratisk akkumulering/skanning av delheadere | medium | Hver ny liten chunk kopierte og søkte hele prefikset før lokal prosessfrist startet. Bruk inkrementell, begrenset mottaksbuffer. Patch. |
| B3 | Ett beholdt Buffer-objekt per filchunk | medium | Bytegrensen avgrenser ikke objekt-/arraykostnaden når chunks er små; kopiering til faste blokker begrenser begge deler. Patch. |
| B4 | Listener åpen under shutdown-drain | medium | Nye forbindelser kan komme etter closeAllConnections og før server.close. Steng listener først og avvent drain før exit. Patch. |
| B5 | Ulike requestId i konvolutt/utfall passerer skjema | low | Produksjonsbindingen setter dem likt, men det delte HTTP-skjemaet bør håndheve samme identitet. Enkel refinement og negativ prøve. Patch. |
| B6 | HTTP-dokumentsperrer ikke dekket | medium | Tidligere PDF-modultester dekker feilene, men ikke ny child-/HTTP-binding. Faktiske tekstløse/31-siders fixtures må gi dokumentfeil uten adaptertillatelse. Patch. |
| B7 | Asynkron spawnfeil/ugyldig IPC ikke særskilt testet | low | Async error/close er en nåbar delvis initialisering og får en liten målrettet test. Vilkårlig feilformat fra betrodd, kodeeid IPC avvises allerede; ekstra rammeverk for dette avvises som unødvendig kompleksitet. Patch av konkret spawnvei. |
| B8 | Uavhengige sessions ikke prøvd samtidig | low | Set/markørnøkkel inkluderer session; enkel overlappstest kan etterprøve dette sammen med V2. Patch. |
| B9 | Livsløpshendelse før faktisk adapterinvokasjon | low | Hendelsen observerer tillatelse, ikke garantert invokasjon ved abort-race. Markør før tillatelse er påkrevd og riktig. Omdøp til adapter-permitted og presiser beviset; normal terminal demo bekrefter faktisk kall, abort kan gi null. Patch. |
| B10 | Testteardown mangler router-drain | low | Ved en feilende assertion kunne et hengt barn fortsette til sin frist. Behold router og avvent stop i afterEach. Patch. |
| V1 | Produksjonsserverens POST-montering ikke testet | medium | Integrasjonssuiten monterer egen Express-app; eksisterende E2E prøver bare GET 404. Legg F1-POST mot faktisk appserver. Patch. |
| V2 | Aktiv sessionlås ikke prøvd under prosessering | medium | Upload-sperre og sekvensiell hashduplikatprøve er utilstrekkelig hvis låsen feilaktig slettes etter upload. Hold adapter aktiv og prøv annen PDF/samme session uten ny prosess. Patch. |

Alle funn ble vurdert separat før gruppering. Endringene er rettinger og
målrettet verifikasjon innen eksisterende R3/Story 2.5. Ingen intensjonsgap,
ny produkt-/arkitekturbeslutning eller utsatt produktfeil ble funnet.
Implementeringsagenten er gjenengasjert for disse konkrete rettingene.

## Sluttkontroll

Alle tolv konkrete forbedringspunkter er håndtert. Målrettet kontroll:
22/22 HTTP-tester, 9/9 enhetstester og produksjonsserverens nye POST-prøve
består. Root leste den ferdige mottakeren, schema-refinement, prosesslivsløp,
shutdown-rekkefølge og de nye testene. Faste filblokker begrenser antall
beholdte Buffers; headerframing skannes én gang. Metadata inkluderer også
sluttframing, både med og uten valgfri CRLF.

Roots siste R3-kontroll la til en nedre filstørrelsesberegning fra kjent
total Content-Length etter mottatte delheadere. En kjent PDF på 50 MiB +1
kan nå avvises med 413 etter bare headerne, før filbytes sendes. Den
direkte grenseprøven består. Prøven bruker egen session fordi foregående
avvisning bevisst beholder låsen til socket-cleanup er slutt.

Ingen funn er utsatt. Faktisk siste fullregresjon dokumenteres i
[verifikasjonen](story-2-5-verifikasjon.md). Storyen beholdes på review.

Sluttregresjon etter alle rettinger: 467/467, type/lint/build og 42+2 E2E består. Ingen gjenstående funn.
