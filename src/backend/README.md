# Backend og I/O

Denne grensen eier HTTP, dokumentbehandling og analyseadaptere etter
AD-1/AD-9. HTTP bruker dokument-/analysekomponenter og felles contracts.
Backend leverer dokument-/analyseutfall; finans og anbefaling eies av domain.

## Lokal klientkonfigurasjon — Story 4.1

`analysis/backend-config.ts` tilbyr `createAnalysisBackend()` eller
`createAnalysisBackend('demo')`, som gir eksisterende lokal demo-adapter uten
miljølesing, KI-klient eller transportkall. Eksplisitt
`createAnalysisBackend('live')` leser bare backendens `OPENAI_API_KEY` og
konstruerer én klient, uten å starte en forespørsel. Sett nøkkelen i lokalt
backendmiljø; den skal aldri føres i frontend, Vite-variabler eller Git.
Manglende/tom nøkkel, whitespace/kontrolltegn eller ugyldig modus gir
kodeeid `AnalysisAdapterError` (`adapter-failure`), uten råverdier eller fallback.
Lokal syntakskontroll bekrefter ikke nøkkelens konto-/modelltilgang.

`openai@6.9.1` er eksakt pinnet i pakke- og låsfil. Kompatibilitet er kontrollert
mot installert offisiell SDK-kode og [offisiell OpenAI TypeScript-dokumentasjon](https://developers.openai.com/api/reference/typescript):
Responses `create`, `reasoning.effort: 'low'`, `service_tier: 'default'`,
`text.format` med JSON Schema og requestens `signal` finnes i denne versjonen.
SDK tillater eksplisitt modell-ID som streng. R1s valgte modell er
`gpt-6.1-sol`; API er Responses, SDK `maxRetries: 0` og `timeout: 120000`.
Offisielt API-endepunkt settes i kode; organisasjon, prosjekt og webhook er
eksplisitt null. SDK-logging er avslått og har en stille logger, også hvis
`OPENAI_LOG` er satt. SDK-instance/nøkkel skjules i en closure; live-resultatet
eksponerer bare trygg `settings`-metadata og backendens bundne `responses.create`.
Dette er en intern leverandørgrense for 4.2, ikke et HTTP-svar.

Kontrollert `fetch` kan injiseres ved konstruksjon; 4.2 bruker requestens
abortsignal og håndhever én absolutt 120 s-frist gjennom transport, lesing og
terminal validering. SDK-timeout alene er ikke den absolutte adapterfristen.
4.3 kobler senere lokal dokumentfase på 60 s og livefase på 120 s til HTTP.
Dagens HTTP-/UI-flyt og demoens supervisor bruker fortsatt eksisterende demo.
Abort beviser ikke at leverandørbehandling eller belastning stopper.

[R1](../../.docs/planning-artifacts/r1-live-ki-semester-v1.md) beholder hele
30-sidersgrunnlaget, 1 050 000 tokens kontekst og 128 000 maksimal output
inklusive reasoning. 4.2 vurderer komplett serialisert input mot dette uten
skjult avkorting. R1s daterte prisgrunnlag og kostnadsrutine innen USD 20 totalt
gjelder før senere, uttrykkelige live-forsøk; ingen betalte kall er gjort i 4.1.
Se [4.1-verifikasjonen](../../.docs/implementation-artifacts/story-4-1-verifikasjon.md)
for offline-, transport-, build- og nøkkelgrensebevis. S2/S5 er ikke evaluert.

`server.ts` serverer bygget app fra `dist/` på `127.0.0.1:3000`. Utvikling
bruker Vite-middleware i samme Express-prosess. `POST /api/analysis` tilbyr
lokal demoanalyse etter Story 2.5. Andre API-ruter svarer 404.

`documents/validate-pdf.ts` (Story 2.2) mottar bytes og et dokumentnavn som
visningsmetadata. `validatePdf` bruker låst `pdfjs-dist@6.4.299` legacy-build,
teller faktiske sider og beregner SHA-256 av et snapshot av originalbytes.
`count-pdf-pages.ts` / `pdf-page-tree-worker.ts` bruker den samme parserens
Kids/xref-traversering uavhengig av deklarert Count i en isolert Node-worker.
En kildefilhash låser den private koblingen til nøyaktig installert PDF.js-bunt.
Filnavnet åpnes aldri som sti. Parseren får en egen bytekopi; input og
returnerte originalbytes påvirkes ikke av PDF.js-bufferhåndteringen.

`format-validated` inneholder `reportHash`, `documentName`, `pageCount` og
`originalBytes`. Det er et internt formatdelutfall, ingen `DocumentBasis`,
`completed` analyse, tekstlesbarhet eller tilstrekkelighetsgodkjenning.
`failed` inneholder kjent sidetall eller `null` og kontraktens dokumentfeil
(`invalid-format`, `invalid-container`, `page-limit`) med trygg fast årsak.
Alle faktisk traverserte sidedictionaries får samme metadata-kontroll som
PDF.js GetPage, også etter deklarert siste side, uten tekstuttrekk.
`loadingTask.destroy()` rydder transport og sidecacher;
komponenten eier worker og destruerer den separat i `finally`, også når lasting
eller transportopprydding avvises. Drifts-/oppryddingsfeil gir avvist promise
med fast trygg driftsmelding, uten rå parserdetaljer eller påstått dokumentårsak.
Ingen filskriving, HTTP-timeout eller
vilkårlig bytegrense er lagt inn.

42 integrasjonstester bruker faktiske PDF-fixtures og kontrollerer også ekte
worker-opprydding, originalbevaring og F1–F4-fasit. Kjør
`npm test -- tests/integration/pdf-format.test.ts`, eller `npm test` for hele
suiten. [Fixturebeskrivelsen](../../tests/fixtures/property-cases/README.md)
og [verifikasjonen](../../.docs/implementation-artifacts/story-2-2-verifikasjon.md)
viser opphav og kontroll. HTTP-ruten bruker modulen i en request-eid prosess.
Tekstuttrekk/blankdeteksjon er implementert i Story 2.3 etter den
[godkjente R2-regelen](../../.docs/planning-artifacts/r2-pdf-lesbarhet-semester-v1.md).

Story 2.2 er done etter [review](../../.docs/implementation-artifacts/story-2-2-review.md).
Den tidligere røde sidetellingsproben er grønn; også nestede sidetrær,
objekt-/xref-strømmer og linearisering er kontrollert. [Implementeringsvalget](../../.docs/implementation-artifacts/story-2-2-page-tree-design.md)
beskriver den private parserkoblingen og hva en senere pinendring må kontrollere.
R2 er lukket som beslutningsport. Story 2.3 er done etter [code review](../../.docs/implementation-artifacts/story-2-3-review.md), med
[egenverifikasjon](../../.docs/implementation-artifacts/story-2-3-verifikasjon.md).

`documents/extract-pdf.ts` tar et `format-validated`-utfall fra `validatePdf`
og `{ requestId, mode }`. Kall `await extractPdf(format, { requestId, mode })`.
Resultatet har `document` (kontraktens komplette `DocumentBasis`) og `error`
(kontraktens dokumentfeil eller null). Kontroller `error` før senere adapterbruk;
alle sidene og eventuell delvis tekst beholdes også ved dokumentfeil. Den rene
`getDocumentBasisError` i contracts eier samme dokumentgrense som
`bindAnalysisOutcome`, uten adapterkall. Parser-/workerdriftsfeil gir fast trygg
driftsmelding; det gjettes ingen skadet PDF-årsak ved driftsfeil.

Den isolerte `pdf-extraction-worker.ts` verifiserer samme installerte bunt-hash
som 2.2, traverserer faktiske blader med `getAllPageDicts(false)` og bruker
`Page.extractTextContent` på disse bladene. Deklarert Count bestemmer aldri
sidekoblingen. `ignoreErrors:false` er internverdien for PDF.js
`stopAtErrors:true`. Parseren får en kopi av originalsnapshotet; den konsumerte
kopien må fortsatt passe rapporthashen. Leverte
tekstchunks kopieres før PDF.js gjenbruker dem; linjeskift fra `hasEOL` og
PDF.js sine egne mellomrom bevares. Tilstøtende fragmenter ved fontbytte
får ingen innskutte mellomrom. Standardfonter og CMaps lastes fra lokal pakke.
Senere analyse kan bruke `document.pages` direkte uten ny PDF-tolkning.

`pdf-extraction-core.ts` bruker eksakte PDF-whitespacebytes 0/9/10/12/13/32,
ikke tegn-/prosentgrenser. Blankbevis krever manglende Contents, tom liste eller
fullt dekodede whitespace-strømmer, kjente side-/katalognøkler og fravær av
annotasjoner, felt, appearance, XFA og annet innhold som må tolkes. Tomme,
typevaliderte AcroForm-dictionaries/Fields[] alene er ikke sideinnhold.
Uavklart global felt-/XFA-kobling gir unknown; lokale annotasjoner/widgets uten
tekst gir unreadable. Ukjente utvidelser eller ufullstendig inspeksjon gir
unknown. Null/ødelagte referanser blir aldri blanke. Inspeksjonen fortsetter etter
lokale annotasjoner. Kjent utelatt FreeText-/felttekst gir incomplete når
sidetekst er bevart. Ukontrollert annotasjonsappearance eller Widget gjør
en ellers lesbar side unknown; ingen annotasjonsrenderer er innført.

Rå innholdsstrømmer kontrolleres også på sider med tekst. Ufiltrerte strømmer,
ASCII85 og Flate har full verifikasjon; Flate kontrolleres med Node zlib,
inkludert checksum, avslutning og konsumert input. Andre filtre,
predictor-/DecodeParms-varianter, krypterte råstrømmer og uavklart struktur gir unknown når komplett
verifikasjon ikke kan etableres. Dette er en konservativ tilstrekkelig
blank-/pålitelighetsregel. PDF.js-info/advarsler holdes internt og oversettes
konservativt til kjent tap eller ukjent pålitelighet. Litt gjenværende tekst
opphever aldri kjent tap: incomplete prioriteres. Vellykket tekstuttrekk uten
kjente feil er readable for tekstlaget, også med bilde; rasterinnhold hevdes
ikke semantisk lest. OCR, rendering/vision og KI-fallback brukes ikke.

Hver side avslutter oppgaven og frigjør parsercacher. Dokumentet termineres og
ryddes ved både suksess og feil; den ytre `finally` avslutter alltid Node-workeren,
inkludert ved ugyldig melding eller avvist parser-/oppryddingsarbeid. Workerens
isolasjon frigjør også side-/modulreferanser. Ingen nye ressurs-/timeoutgrenser
er lagt til i selve dokumentmodulen. HTTP-eieren håndhever R3 nedenfor;
frontendkobling følger Story 2.6. Demo-adapteren er levert i Story 2.4 nedenfor.

Kjør `npm test -- tests/integration/pdf-extraction.test.ts tests/unit/pdf-extraction.test.ts`.
[Lesbarhetsfixturene](../../tests/fixtures/pdf-readability/README.md) har
reproduserbare fiktive originaler, uavhengig fasit og byteinventar.

## Analyseadapter og lokal demo — Story 2.4

`analysis/adapter.ts` definerer den smale felles grensen `AnalysisAdapter`:
hele `DocumentBasis` inn, `Promise<AdapterOutcome>` ut, med eksplisitt modus.
`analysis/analyze-document.ts` sperrer dokumentfeil før adapterkall, kontrollerer
modussamsvar og bruker eksisterende `bindAnalysisOutcome` til terminalt
`AnalysisOutcome`. Hele grunnlaget sendes samlet i en separat kopi; adapteren
kan ikke endre kodekonteksten som resultatet bindes til.

Etter eksisterende format-/tekststeg kan modulen brukes slik:

```ts
const { document } = await extractPdf(format, { requestId, mode: 'demo' })
const outcome = await analyzeDocument(document)
```

`analyzeDocument` bruker `createDemoAdapter()` som standard. Ingen miljønøkkel,
KI-klient eller ekstern tjeneste initialiseres. En kontrolladapter kan injiseres
som andre argument ved samme grense. Adapterens driftsfeil blir trygge,
kodeeide analysefeil uten rå fil-/parserdetaljer; analysefeil er aldri tomliste.

`analysis/demo-adapter.ts` leser kun `analysis/data/<reportHash>.json` relativt
til egen modul. Hashen valideres og kommer fra originalbytes i dokumentstegene;
filnavnet fra brukeren åpnes aldri. Lagringskonvolutten kontrollerer rapporthash
og kontrakt-/uttrekksversjon på nytt; selve svaret valideres med delt
`AdapterOutcomeSchema`. Manglende lagring gir `adapter-failure`, hashavvik
`metadata-mismatch`, versjonsavvik `incompatible-version` og ugyldig innhold
`invalid-response`, med trygg kjent årsak. Lesefeil gir trygg `adapter-failure`.
Ingen fallback, retry, automatisk generering eller nettverk brukes.

[De fire lokale svarene](analysis/data/README.md) er kontrollerte, fiktive
uttrekk, skrevet separat fra uavhengig testfasit. De inneholder alle TG2/TG3
fra F1–F4 med fysiske PDF-sider, og ingen finansverdi, anbefaling eller estimat.
De er ikke resultat av en gjennomført live-kjøring. Originalkildene bevares;
omdøpte identiske bytes finner samme hash, mens avvik i originalt kildenavn
forblir synlig usikkerhet etter felles kildevalidering. RequestId, dokumentets
aktuelle visningsnavn og modus settes fra kodekontekst, aldri fra lagret
forespørsel. Gjentakelse returnerer samme uttrekk uten delt muterbar retur.

Kjør `npm test -- tests/unit/demo-analysis.test.ts tests/integration/demo-analysis.test.ts`.
Testene bruker ekte PDF-pipeline og uavhengig fasit, kontrollerer feilbinding,
versjoner, tomliste/feil/usikkerhet og dokumentets fullføringssperre. En separat
prosess uten miljønøkler med sperrede nettfunksjoner verifiserer standard demo.
Se [verifikasjonen](../../.docs/implementation-artifacts/story-2-4-verifikasjon.md)
for også OS-sperret nettverkskontroll og full regresjon. Dette er modulbevis,
ikke full UI-demo, S2, live-S5 eller annen-person-S6. HTTP, timeout,
duplikatvern, frontendkobling og live-implementasjon inngår ikke i Story 2.4.


## HTTP-analyse — Story 2.5

`POST /api/analysis` tar `multipart/form-data` med nøyaktig én binær del
`file`, med `filename` som visningsnavn. Ingen andre deler, metadatafelt eller
base64-JSON godtas. Content-Disposition har formen
`form-data; name="file"; filename="F1-tilstandsrapport.pdf"`.
Delen kan ha Content-Type og Content-Length; ukjente/dupliserte delheadere
avvises. MIME og filendelse er bare påstander: originalbytes må ha
PDF-signatur og bestå faktisk container-, side- og tekstkontroll.
Standard FormData fra en nettleser passer direkte.

Tre obligatoriske headere bærer korrelasjon før opplastingen begynner:
`X-Session-Id`, `X-Request-Id` og `X-Analysis-Generation`. ID-er er 1–128
ASCII-tegn: først bokstav/tall, deretter bokstav/tall/punktum/understrek/bindestrek.
Generasjon er et kanonisk ikke-negativt heltall høyst `Number.MAX_SAFE_INTEGER`.
Session-ID er klientens aktive flytidentitet, ingen innlogging eller serverlagret vurdering.
Klienten kan ikke velge hash, modus, prosessmodul eller versjon. Lokal kode
velger demo, og originalen hashes med SHA-256 først etter komplett mottak.

Eksempel fra reporoten med serveren startet:

```sh
curl http://127.0.0.1:3000/api/analysis \
  -H 'X-Session-Id: lokal-okt-1' \
  -H 'X-Request-Id: analyse-1' \
  -H 'X-Analysis-Generation: 0' \
  -F 'file=@tests/fixtures/property-cases/F1-tilstandsrapport.pdf;type=application/pdf'
```

Et ferdig, kontraktvalidert HTTP-utfall har formen
`{ kind: "analysis", correlation: { sessionId, requestId, generation }, outcome }`.
`outcome` er eksisterende `AnalysisOutcome`, uten et nytt terminalskjema:
`completed` krever funnliste, mens dokument-/analysefeil er `failed`.
HTTP 200 alene betyr derfor ikke fullført analyse. Kilde-/versjonsbinding
bruker samme `analyzeDocument`/`bindAnalysisOutcome` som modulene ovenfor.

Avvisning før full kontekst har formen `{ kind: "rejected", code }`, uten
oppdiktet hash. `invalid-request` gir 400, `unsupported-media-type` 415,
`payload-too-large` 413, `analysis-active`/`duplicate-analysis` 409 og
`processing-failure` 500. En lokal timeout før kjent hash er
`processing-timeout`/504; med kjent kontekst brukes kontraktens `failed` med
`error.code: "timeout"`. Forbindelsesabort får ingen sen respons. Ingen
parserdetaljer eller innhold logges eller sendes i driftsfeil.

PDF-bytes har grense **52 428 800**, inklusive likhet. JSON og multipartens
metadata/headere og all multipart-innramming, også siste delimiter og eventuell
slutt-CRLF, har samlet grense **1 048 576**, inklusive likhet. JSON er
likevel ikke et støttet filformat. Kjent beviselig overgrense avvises tidlig;
faktiske bytes telles også chunkvis. Oversize stopper akkumulering,
frigjør chunks og lukker opplastingsforbindelsen etter trygt svar. Ingen
hash/parser/adapter kjøres på en avvist, ufullstendig body.

Sessionlåsen settes synkront før første body-await. Den sperrer også ulik
PDF, ny requestId og ny generasjon i samme aktive session, og beholdes til
arbeid **og cleanup** er slutt. Rett før adapterstart setter forelderen en
separat markør for `[sessionId, lokal modus, backendhash]`; først da får
underprosessen tillatelse til adapterkallet. Markøren beholdes til
serverstopp, også etter adapterfeil, timeout og klientabort. Bare denne
tekniske identiteten beholdes; ingen resultatcache, PDF eller tekst.
Livsløpshendelsen `adapter-permitted` betyr at forelderen har gitt tillatelse,
ikke at adapterkallet allerede har startet. Én tillatelse sammen med et
terminalt demosvar beviser ett normalt adapterkall. En abort mellom markør
og mottatt tillatelse kan gi null kall; den konservative markøren består. Andre
sessions er uavhengige. Ingen automatisk retry, kø, polling eller jobb-API.

Hele lokale kjeden kjører i en egen underprosess med tomt arvet miljø og
uten innholdsutskrift. Forelderen starter én **60 000 ms** hard frist før
signatur-/formatbehandling; den nullstilles aldri mellom steg. Ved suksess,
feil, ugyldig retur, timeout eller abort termineres prosessen med alle dens
parsertråder, selv ved synkront heng eller feil i intern destroy. Forelderen
venter på faktisk `close` før sessionlåsen frigjøres og terminalsvaret sendes.
Timere/lyttere og eide uploadreferanser fjernes i avslutningen.
Ved Ctrl+C/SIGTERM stenges først listeneren for nye forbindelser. Deretter
avbryter `analysis.stop()` alle aktive requests og avventer deres cleanup,
Vite-opprydding og faktisk serverlukking før serverprosessen avsluttes. Tilfeldig GC
eller en vunnet Promise.race brukes ikke som bevis på ressursavslutning.
Deterministisk frigjøring betyr ikke fysisk nullstilling av JavaScript-minne.

`createAnalysisRouter` tilbyr kun kodevalgte lokale adapter-/dokumentmoduler
for kontrollerte tester ved samme adaptergrense; HTTP-data og miljø velger
aldri disse. Livsløpsobservasjon inneholder bare prosess-ID og steg, aldri
rapportinnhold. Produksjonsserveren bruker standardmodulene uten injeksjon.
Ingen PDF-/tekstfil, database eller annen opplastingspersistens opprettes.

Kjør `npm test -- tests/integration/http-analysis.test.ts tests/unit/http-receive-pdf.test.ts`.
Testene krever loopback og ca. 75 sekunder grunnet den faktiske 60 s-fristen.
De dekker F1–F4 mot uavhengig fasit, nøyaktig 50 MiB gyldig PDF, 1 MiB,
chunked overgrense, feilformat, flere deler, samtidighet, duplikater,
backendfeil, abort, cleanup-feil med levende worker og synkrone heng/sen retur.
Prosessens faktiske avslutning kontrolleres før neste forsøk. PDF-fixtures og
lagrede demosvar endres ikke. Dette er HTTP-/ressursbevis, ingen frontend,
PDF-visning, live-timeout eller S2/S5/S6-godkjenning.
