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
Tekst-/lesbarhetsmetode følger 2.3 etter avklaring av R2.

Story 2.2 er done etter [review](../../.docs/implementation-artifacts/story-2-2-review.md).
Den tidligere røde sidetellingsproben er grønn; også nestede sidetrær,
objekt-/xref-strømmer og linearisering er kontrollert. [Implementeringsvalget](../../.docs/implementation-artifacts/story-2-2-page-tree-design.md)
beskriver den private parserkoblingen og hva en senere pinendring må kontrollere.
R2 er fortsatt åpen, og ingen tekst-/lesbarhetsmetode er valgt.
