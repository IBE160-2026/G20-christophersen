# Backend og I/O

Denne grensen eier HTTP, dokumentbehandling og senere analyseadaptere etter
AD-1/AD-9. HTTP bruker dokument-/analysekomponenter og felles contracts.
Backend leverer dokument-/analyseutfall; finans og anbefaling eies av domain.

`server.ts` serverer bygget app fra `dist/` på `127.0.0.1:3000`. Utvikling
bruker Vite-middleware i samme Express-prosess. `/api` er reservert og svarer
404 inntil aktuelle ruter implementeres i sine stories. Dokument- og
KI-funksjonalitet kommer i sine godkjente stories.

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
viser opphav og kontroll. Modulen er foreløpig ikke koblet til serverruter.
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
er lagt til. HTTP, adaptere, demo-oppslag og frontend er fortsatt senere arbeid.

Kjør `npm test -- tests/integration/pdf-extraction.test.ts tests/unit/pdf-extraction.test.ts`.
[Lesbarhetsfixturene](../../tests/fixtures/pdf-readability/README.md) har
reproduserbare fiktive originaler, uavhengig fasit og byteinventar.
