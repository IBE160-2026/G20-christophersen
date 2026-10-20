# Story 2.3 — egenverifikasjon 2026-10-20

Oppfølging: separat [BMAD review](story-2-3-review.md) er fullført etter retting,
og story/sprintstatus er **done**. Egenverifikasjonen nedenfor bevares som
historisk implementeringsbevis; reviewrapporten eier siste test-/funnstatus.

Status: **in-review / review**. Dette dokumentet viser implementeringsbevis;
separat code review og done gjenstår. Ingen senere story eller
push er utført. Autoritet er [den godkjente storyspecen](spec-2-3-trekke-ut-sidemerket-tekst-med-kontrollert-lesbarhet.md)
og de to context-filene i dens frontmatter, med lukket R2. Låste produkt-/
arkitekturkrav er bevart. Root leste original sensorveiledning og lagret
faglærertilbakemelding før sluttkontroll, uten å utlede nye krav.

## Levert grense

`extractPdf` tar 2.2s formatdelutfall og requestId/modus. Den returnerer hele
`DocumentBasis` og kontraktens dokumentfeil eller null før senere adapterbruk.
Original/hash/navn beholdes separat; parseren får kopi. Felles
`getDocumentBasisError` er faktorisert fra den eksisterende kontraktvalidatoren
og brukes også av `bindAnalysisOutcome`; ingen ny DTO eller statussemantikk.
Kontraktversjon 2/uttrekksversjon 1 og 30-sidersformatgrensen er uendret.

PDF.js 6.4.299 legacy-kilden lastes med eksisterende eksakt SHA-256-kobling i
en isolert worker. Faktiske blader fra `getAllPageDicts(false)` gis direkte til
intern `Page.extractTextContent`, med `ignoreErrors:false` (stopAtErrors:true).
Ingen offentlig getPage-mapping avledes fra deklarert Count. Rå Contents
valideres også med tekst. Full Flate-/ASCII85-dekoding, lengde/referanser,
side-/katalognøkler og annotasjons-/formstruktur hindrer falskt blankbevis.
Ustøttede filtre/DecodeParms, krypterte råstrømmer eller uavklart struktur gir unknown. Ukjente
innholdsbærende utvidelser godtas ikke som blanke. Globale felt/XFA uten kjent
sidemapping er unknown; tom typevalidert formstruktur er ikke i seg selv innhold.

Kjente delvise uttrekk bevarer leverte kopierte tekstchunks som incomplete.
Parser-info/advarsler brukes konservativt og holdes internt; årsaker er fast
kodegenerert norsk tekst. Sidetasker og cacher ryddes per side, dokumentet
termineres/ryddes i finally, og hovedprosessen avslutter alltid workeren.
Worker-/driftsfeil eksponerer ingen rå parsertekst. Ingen OCR, vision,
AI-fallback, terskelgjetting, HTTP, adapter eller frontend er innført.

## AC-/testspor

| AC | Konkret bevis |
|---|---|
| AC1 | F1–F4, 30 sider, objekt-/xref-strømmer, linearisering og nestet sidetre med Count 1 gir én ordnet post per fysisk posisjon. Blank/unknown/unreadable/incomplete beholdes uten renummerering. Ukjent mapping gir alle 2.2-posisjoner som unknown, aldri false readable. |
| AC2 | Eksisterende håndskrevet F1–F4-fasit, TG3 på F4 fysisk 4/trykt 2, ny tabell-/kolonnefasit, æ/ø/å begge kasus, blandet tekst/raster og én-bokstavside er testet mot faktiske bytes. Tabellrader og kolonneblokkers grad/beskrivelse kontrolleres samlet. |
| AC3 | Samme kontraktgrense returnerer dokumentfeil før adaptervalidering; alle blokkerende sider og kjente trygge årsaker oppgis. Readable+blank tillates. Bare blanke sider avvises. Delvis tekst beholdes uten completed. |
| AC4 | Manglende/tom Contents og fullt dekodet PDF-whitespace er blank bare uten annet innhold. Foto, rasterisert TG3, vektor, plantegning, annotasjon og widget blir aldri blank. Feil referanser, uventede nøkler/typer, unsupported filter, uavklart form/XFA og skadet Flate blokkeres. Enhetstester injiserer uttrekksavvisning/teksttap/ukjent inspeksjon; integrasjonstester injiserer worker-/meldings-/terminate-feil og kontrollerer avsluttet faktisk tråd. |

## Kontrollert originalfasit

[Lesbarhetsfixturene](../../tests/fixtures/pdf-readability/README.md) har
håndskrevet forventning fra før generering/produktkjøring og en generator uten
produktimport/adapter/fasitlesing. Byteinventar er separat. Alle eksisterende
property-cases og 2.2s strukturfiksturer beholdes uendret.

Root kontrollerte samtlige forventede layouttekster med uavhengig pypdf og
rendret/inspiserte fire layout-sider samt seks textless-content-sider med
PyMuPDF. Norske tegn, grader/beskrivelser, tabell/kolonner og rasterinnhold var
leselige uten klipping. Annen PDF-motor til kontroll er testverktøy, ikke ny
produktavhengighet. Kuraterte kontaktark: [layout](story-2-3-layout.png) og
[tekstløst innhold](story-2-3-textless-content.png).

## Kjørte kontroller

Node 24.21.0/npm 11.19.0 fra det etablerte lokale runtime-miljøet.

| Kontroll | Resultat |
|---|---|
| Målrettet uttrekk/enhet | Første komplette kjøring: 45/45; etter tom-form-avklaring: 47/47. Sluttkjøring med mapping-feilprøve: 48/48; med kryptert råstrøm-prøve: **49/49**. Alle 13 PDF-er og manifest ble deretter regenerert byte-identisk i en separat tmp-mappe. |
| `npm test` | Root: 378/378, 9 filer. |
| `npm run typecheck` | Bestått, også separat etter siste kodeendring. |
| `npm run lint` | Bestått. |
| `npm run build` | Root: bestått, inklusive typecheck. |
| `npm run test:e2e` | Root: bestått, 41 bygget demo + 2 dev. Playwright fra etablert browsersti. Første forsøk ble hindret av sandbox-loopback; godkjent eskalert kjøring avsluttet med 0. |
| `git diff --check` og omfang | Root: bestått. Låste planning/spec/reference, tidligere fixturebytes, pins/låsfil og alle 2.2-kodemoduler uendret mot baseline. |

Kuraterte kommandoutdata fra endelig kode (overflødig whitespace ved linjeslutt fjernet): [sluttkontroller](story-2-3-kontroller.txt).
Alle 13 fixture-PDF-er og manifest er kontrollert byte-identiske ved regenerering.

## Praktiske grenser

Readable gjelder tekstlaget og betyr ikke at bilder er semantisk lest eller at
alle mulige PDF-feil kan oppdages. Blankregelen er tilstrekkelig, konservativ
og ingen komplett visuell blankgjenkjenner. Uavklart/ustøttet inspeksjon sperrer
heller med unknown. Den private parserkoblingen må kontrolleres ved framtidig
pinendring. Faktisk KI-treff/S2 og live-S5 bevises senere. R3/R1/R4 og den
samlede readiness CONCERNS påvirkes ikke. Lokal commit utføres av root etter
sluttkontroll; code review/done og senere story inngår ikke.
