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
Filnavnet åpnes aldri som sti. Parseren får en egen bytekopi; input og
returnerte originalbytes påvirkes ikke av PDF.js-bufferhåndteringen.

`format-validated` inneholder `reportHash`, `documentName`, `pageCount` og
`originalBytes`. Det er et internt formatdelutfall, ingen `DocumentBasis`,
`completed` analyse, tekstlesbarhet eller tilstrekkelighetsgodkjenning.
`failed` inneholder kjent sidetall eller `null` og kontraktens dokumentfeil
(`invalid-format`, `invalid-container`, `page-limit`) med trygg fast årsak.
`loadingTask.destroy()` rydder dokumenttransport, sidecacher og worker i
`finally`, også når lasting avvises. Ingen filskriving, HTTP-timeout eller
vilkårlig bytegrense er lagt inn.

17 integrasjonstester bruker faktiske PDF-fixtures og kontrollerer også ekte
worker-opprydding, originalbevaring og F1–F4-fasit. Kjør
`npm test -- tests/integration/pdf-format.test.ts`, eller `npm test` for hele
suiten. [Fixturebeskrivelsen](../../tests/fixtures/property-cases/README.md)
og [verifikasjonen](../../.docs/implementation-artifacts/story-2-2-verifikasjon.md)
viser opphav og kontroll. Modulen er foreløpig ikke koblet til serverruter.
Tekst-/lesbarhetsmetode følger 2.3 etter avklaring av R2.
