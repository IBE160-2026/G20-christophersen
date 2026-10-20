# Story 2.5 — HTTP, ressursgrenser og livsløp

Implementert mot Story 2.5 AC1–AC5, R3 i
`03011d5f914a45b3f3f5f8f9488e9c714c9c72c6`, FR-6/FR-9,
NFR-1/NFR-4/NFR-5 og AD-3–AD-6/AD-9/AD-10. Dette er backendbevis;
Story 2.6, PDF-visning og Epic 4 er ikke implementert.

## Leveranse og grenser

- `POST /api/analysis`: én binær multipart-del `file`, med korrelasjon i
  `X-Session-Id`, `X-Request-Id`, `X-Analysis-Generation`. Felles skjema
  pakker inn eksisterende `AnalysisOutcome`; kontraktversjon 2 og
  uttrekksversjon 1 er uendret. Tidlig avvisning gir stabil HTTP-kode uten
  oppdiktet hash.
- PDF ≤52 428 800 bytes; JSON/multipart-metadata ≤1 048 576 bytes.
  Likhet tillates i størrelsessteget. Faktiske bytes telles under mottak,
  kjent beviselig overgrense avvises før buffering. Overgrense gir 413,
  også mens en chunked-klient fortsetter å sende. Ingen full buffering
  eller hashing av avvist opplasting. JSON er ikke støttet PDF-transport;
  også base64-forsøk avvises før dokumentarbeid.
- Signatur, faktisk PDF-container, høyst 30 fysiske sider og R2-lesbarhet
  kontrolleres. Aksepterte bytes går uendret til eksisterende `validatePdf`
  og `extractPdf`; begge bruker SHA-256 av originalen. F1–F4 følger den
  samme versjonsbundne demoen og uavhengige fasiten fra tidligere stories.
- Sessionlåsen settes før første await og beholdes gjennom cleanup.
  Prosessmarkør for session + lokal modus + backendhash settes før
  adaptertillatelsen og beholdes til serverstopp. Ny requestId/generasjon
  eller klientvalgt modusheader omgår ikke sperrene. Ingen automatisk
  retry, kø, polling, jobb-ID eller resultatcache.

## Timeout, abort og cleanup

Forelderen håndhever én absolutt 60 000 ms-frist for hele den lokale
PDF-/demo-kjeden, fra før signatur-/formatbehandling til terminal binding.
Fristen nullstilles ikke mellom steg. Synkront parser-/adapterheng kjører
i en request-eid underprosess og kan derfor ikke blokkere forelderens timer.
Et sent resultat kontrolleres også mot absolutt frist ved IPC-mottak.

Success, dokument-/adapterfeil, ugyldig retur, klientabort og timeout går
gjennom samme avslutning: SIGKILL ved behov, faktisk prosess-`close`
avventes, eide byte-/kontekstreferanser tømmes og timer/lyttere fjernes.
Prosessavslutningen frigjør alle dens parsertråder, cacher, tekst og
adapterkopier, også når intern parser-cleanup feiler eller henger.
En avvist opplastingsforbindelse får sende det trygge feilsvaret og lukkes
før flytlåsen frigjøres. Klientabort gir ikke sent fullført svar.
Normal serverstopp avventer alle aktive handlers og deres cleanup.

Tester observerer `process-closed`, at PID ikke lenger finnes, og at et
beholdt inputobjekts `bytes.byteLength` er 0 ved terminalveiene. Dette er
observerbart ressursbevis; fysisk nullstilling eller tidspunkt for GC
påstås ikke. Duplikatmarkøren slettes ikke av cleanup.

Backend har ingen skrivesti for opplastet PDF eller ekstrahert tekst,
database, midlertidig fil eller innholdscache. Filnavn er kun metadata.
De eksisterende statiske fiktive demoressursene er uendret.
Barnets stdio ignoreres, miljøet arves ikke, og driftsfeil er faste,
trygge kodeformuleringer uten rå parser-/PDF-innhold.

## Målrettet testdekning

| Scenario | Konkret bevis |
|---|---|
| Gyldig PDF under grensen | F1–F4 gjennom faktisk HTTP, originalhash, fysiske sider, alle fasitfunn, én adaptertillatelse sammen med terminalt demosvar |
| PDF akkurat 50 MiB | F1 paddet kun in-memory før siste startxref: format/tekst med fire sider og korrekt ny SHA-256; eksplisitt manglende demo-fixture for ny hash |
| PDF over grensen | Chunked 50 MiB +1 avvises før prosess; kjent total-overgrense avvises uten body, og kjent fil-overgrense etter bare delheadere; skrivende klient mottar 413 |
| Ugyldig filtype/signatur/container | Faktiske invalid-format/damaged-container-fixtures gir trygge dokumentfeil; falskt navn/MIME godkjenner ikke innhold |
| Ingen/flere filer/base64/skjulte felt | Kontrollerte 400/415; ingen prosess-/adaptertillatelse |
| JSON akkurat/over 1 MiB | Gyldig JSON på grensen går gjennom størrelsessteget til 415; +1 gir 413 |
| Multipart-metadata akkurat/over 1 MiB | Egen strømtest tillater likhet og avviser +1 |
| Chunkgrenser/originalbytes | Én byte per chunk gjennom parser, også multipart-lignende sekvens i filbytes |
| Dobbel start/samtidighet | Pågående opplasting avviser annen PDF/requestId/generasjon/moduspåstand i samme session; etter avslutning består hashmarkøren |
| Backendfeil/ugyldig retur | Trygg adapter-failure/invalid-response; én adaptertillatelse og terminal analysefeil, markøren består |
| Klientabort | Avbrutt upload frigjør flyten; avbrutt parser/adapter stopper prosessen; adaptermarkør består |
| Hard timeout | Reell 60 s-prøve av synkront parserheng med eid worker, synkront adapterheng og 30+35 s-steg; ingen sen completed |
| Cleanup | Faktisk prosessavslutning/PID borte og frigitte inputreferanser; parser-cleanup-feil etter opprettet worker stopper hele prosessen |
| Normal serverstopp | Stop/drain avventer fastlåst adapter og bekrefter at barnet er borte |
| Dokumentgrenser gjennom HTTP | Faktiske tekstløse/31-siders PDF-er gir dokumentfeil før adapter, prosesslukking og ingen varig markør |
| Aktiv prosessering/annen session | F2 i samme session avvises under F1-adapterarbeid uten nytt barn; annen session kommer uavhengig til dokumentvalidering |
| Delvis initialisering | Pre-abort, synkron fork-feil og asynkron spawn error/close frigjør bytes og lyttere med trygg feil |
| Faktisk appserver | Playwright sender multipart-F1 til server.ts og validerer completed, hash, korrelasjon og funn |

## Kjøring og resultater

Runtime: Node 24.21.0/npm 11.19.0. Før kommandoene settes:

```sh
export PATH=/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:$PATH
export PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-1-2-browsers
npm test -- tests/integration/http-analysis.test.ts tests/unit/http-receive-pdf.test.ts \
  tests/unit/http-pipeline-initialization.test.ts tests/unit/analysis-http.test.ts
npm test
npm run lint
npm run build
npm run test:e2e
```

HTTP/Playwright krever lokal loopback. Standard verktøysandkasse ga EPERM
ved listen; testene er kjørt med utvidet lokal tilgang. Ingen betalt API,
nøkkel, leverandør eller ekstern tjeneste er brukt. `npm run build`
inkluderer `npm run typecheck`.

Første root-regresjon: 459/459 tester i 13 filer (87,84 s), lint/type/build
og 41+2 E2E består. Endelig resultat etter intern build-kontroll registreres
nedenfor. S2, live-S5 og annen-person-S6 vurderes ikke av disse prøvene.


Reviewpresisering: livsløpshendelsen heter `adapter-permitted` og teller
forelderens tillatelser. Én tillatelse sammen med terminalt demoresultat
beviser ett normalt adapterkall. Ved abortløp mellom markør og mottatt
tillatelse kan det faktiske kallantallet være null; markøren består bevisst.
Multipartens 1 MiB-metadataregnskap inkluderer all ikke-fil-innramming,
inkludert siste delimiter og valgfri slutt-CRLF. Reviewrettingen bruker
inkrementell headerskanning og faste filblokker uten å endre produktgrenser.


## Endelig root-verifikasjon 2026-10-20

| Kontroll | Faktisk resultat |
|---|---|
| Målrettet HTTP etter reviewrettinger | 22/22 bestått (79,48 s) |
| Målrettede enhetstester | 9/9 bestått: mottak5, initialisering3, HTTP-identitet1 |
| Produksjonsserverens F1-POST | 1/1 bestått; inngår også i full Playwright |
| Siste tidligavvisning med kjent filstørrelse | Direkte grenseprøve bestått: 413 etter kun delheadere, ingen filbytes/prosess |
| Full `npm test` etter alle kodeendringer | **467/467**, 15 filer, 89,09 s |
| `npm run lint` | Bestått, ingen advarsler |
| Typekontroll og build | Bestått separat og som del av siste `test:e2e` |
| Full Playwright mot bygget app | **42/42**, 13,3 s, inklusive faktisk analyse-POST |
| Full Playwright mot dev | **2/2**, 1,7 s |
| Diff-/omfangskontroll | Ingen whitespacefeil; låste plan-/SPEC-kilder, tidligere dokument-/demomoduler, frontend, domene, PDF-fixtures/fasit og avhengigheter er uendret fra baseline |

[Rå kommandoutdata](story-2-5-kontroller.txt) bevarer siste fullsuite,
lint og full build/Playwright-kjøring. Alle matriserader over er dekket av
kjørte, beståtte tester; ingen påkrevde tester er deaktivert eller hoppet over
i fullsuite. Den filtrerte tidligavvisningsprøven ble i tillegg kjørt separat.
[Intern triage](story-2-5-build-check.md) er lukket uten utsatte produktfeil.

Bare Story 2.5 settes til review (lokal spec in-review). Epic2/SP2 pågår,
Story2.6 er backlog og ikke startet. R2/R3 er closed, R1/R4 fortsatt open.
Ingen nye åpne spørsmål for Story2.5. Lokal commit lages uten push.
