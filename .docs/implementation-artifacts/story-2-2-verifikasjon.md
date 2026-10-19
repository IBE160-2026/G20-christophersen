# Story 2.2 — egenverifikasjon 2026-10-19

Status: **in-review / review**, klar for separat uavhengig review. Dette er
implementeringens egenverifikasjon, ikke code review eller done.
[Implementeringsspec](spec-2-2-validere-pdf-format-sidegrense-og-originalidentitet.md)
er fulgt innen uendrede Story 2.2 AC1–AC4.

## Leveranse og kravspor

| AC / kravspor | Faktisk leveranse og bevis |
|---|---|
| AC1; FR-6/FR-9, RT-1 formatdel / RT-2 | `src/backend/documents/validate-pdf.ts` bruker `pdfjs-dist@6.4.299/legacy/build/pdf.mjs`. Ekte tekst-PDF med 30 sider godtas; 31 gir `page-limit` og kjent sidetall 31. Ikke-PDF, tom input og uleselig container gir dokumentfeil uten findings/tomliste eller rå parserfeil. |
| AC2; FR-8, AD-4/AD-9 | SHA-256 beregnes av originalbytes før første await. Identiske bytes med ulike/stilignende navn gir samme hash; gyldig PDF med endrede bytes og samme navn gir ny hash. Buffer-slice og caller-mutasjon kontrolleres; ingen filnavn åpnes som serversti. |
| AC3; FR-6/FR-9, AD-3 | `format-validated` bevarer originalbytes og korrekt pageCount. Parseren får egen kopi. Tekstløs, gyldig vektorside får bare formatdelutfallet; dette er verken `DocumentBasis`, `completed`, lesbarhetsstatus eller bekreftet grunnlag. Ekte PDF.js-workers destrueres ved suksess, page-limit og begge parserfeil; loadingTask.destroy rydder transport/cacher/worker i finally. |
| AC4; NFR-4, fixturegrunnlag S2, RT-5 | Håndskrevet `tests/fixtures/property-cases/expected.json` ble fastsatt før generering. Generatoren leser ingen fasit eller adapterretur. F1–F3 har bare TG2 på PDF-side 2; F4 har også TG3 «Alvorlig lekkasje i tak» på PDF-side 4 / trykt side 2. F3s L er null. Finansinput, D-/J-innhold, forventede nøkkeltall/anbefalinger og forutsetninger følger Brief-addendum; ingen finansmotor eller adapter er kjørt. |

17 integrasjonstester i `tests/integration/pdf-format.test.ts` inngår i
vanlig Vitest/typecheck. Eksisterende schemas og feilbetydning fra 2.1 er
uendret. Dokumentfeilene bruker `AnalysisError`-typen og testes mot felles
`AnalysisErrorSchema`. Det interne formatdelutfallet har ingen requestId/
modus/adapter-/HTTP-logikk; disse opprettes ved sine godkjente grenser senere.

## Faktiske kontroller

Runtime: Node **24.21.0**, npm **11.19.0**, macOS arm64. Den eksisterende
verifiserte Node-distribusjonen under `/private/tmp/ibe160-story-1-1-runtime/`
ble satt først i PATH. Installerte produktversjoner: PDF.js **6.4.299**,
låsfilens valgfrie `@napi-rs/canvas` **1.0.11**.

| Kontroll | Resultat |
|---|---|
| `npm install --save-exact pdfjs-dist@6.4.299`, deretter ren `npm ci` | Bestått, 0 sårbarheter; kjent fsevents-scriptvarsel. Pins er bevart. |
| `npm test -- tests/integration/pdf-format.test.ts` | 17/17 bestått med faktisk parser og fixturebytes. |
| `npm test` | 292/292 bestått, 7 filer (275 eksisterende modultester + 17 integrasjoner). |
| `npm run typecheck`, `npm run lint`, `npm run build` | Bestått på endelig kode. |
| `npx playwright test`, `npx playwright test --config playwright.dev.config.ts` | 41/41 bygget demo og 2/2 dev bestått med eksisterende dokumentert browsersti. |
| Regenerering med Python 3.12.14 / ReportLab 4.4.4 | Alle ti fixturefiler og sha256.json byte-identiske etter regenerering. |
| Uavhengig pypdf 6.1.3 | Alle F1–F4-sider/funn/navn/grader og RT-5 samsvarer; faktisk tekst på hver av 30/31 sider, én tekstløs vektorside. |
| `git diff --check` og baselinekontroll | Bestått; låste planning-artifacts, specs og reference uendret mot `f8167fd1f81f377ef97ce5f6a0d46a53d10312dd`. |

Råkontroller: [installasjon](story-2-2-install.txt),
[modul/type/lint/build/fasit/baseline](story-2-2-kontroller.txt).
Eksisterende appregresjon kjøres separat som kontroll av avhengighets-/buildendringen;
sluttresultater står i [demologgen](story-2-2-e2e-demo.txt) og
[devloggen](story-2-2-e2e-dev.txt). Ingen ny rapportflyt er innført i appen.

Første typecheck avdekket at en eldre PDF.js-option (`isEvalSupported`) ikke
finnes i den låste versjonen; optionen ble fjernet og kontrollene kjørt på
nytt. Første E2E-forsøk ble sperret av sandboxens loopbackbegrensning, og
neste fant ikke browser i standardcache. Eksisterende dokumentert browsersti
`PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-1-2-browsers` og nødvendig
godkjent loopback-eskalering ble brukt ved ny kjøring. Ingen produktkode eller
pin ble endret for disse miljøforholdene.

## Visuell kryssjekk

Poppler var ikke tilgjengelig. PDF-ene ble rendret med PyMuPDF **1.26.6**
og kontaktarkene åpnet og visuelt inspisert i denne arbeidsøkten. Dette er
agentens faktiske visuelle kontroll, ikke en påstand om menneskelig review.
Alle 16 sider i F1–F4 er kontrollert mot JSON-fasit: fire sider per dokument,
riktig navn på omslaget, TG2 med full norsk funntekst på filside 2, ingen
ytterligere avvik i F1–F3, og F4s TG3/fulltekst på filside 4 med trykt side 2.
Tekst, norske tegn, marger og fotnummer er leselige uten klipping/overlapp.

Kontaktark: [F1](story-2-2-fixtures-F1.png), [F2](story-2-2-fixtures-F2.png),
[F3](story-2-2-fixtures-F3.png), [F4](story-2-2-fixtures-F4.png).
[Grenseark](story-2-2-fixtures-boundaries.png) viser siste side i 30-sidersfilen,
side 30/31 i 31-sidersfilen og den rene vektorsiden. Alle 61 grensesider er
dessuten posisjons-/tekstkontrollert med både PDF.js og pypdf.
[Inspeksjonsscriptet](story-2-2-fixture-inspection.py) kan gjenskape kontrollen.
Begge ugyldige fixtures er bevisst ikke renderbare dokumenter.

## Gjenstående og bevisgrenser

Alle fire Story 2.2-AC er egenverifisert; uavhengig review gjenstår.
R2 er fortsatt åpen. Ingen lesbarhets-/layoutmetode, OCR, adapterretur,
analyse-/HTTP-/frontendintegrasjon eller senere story er implementert.
Formatvalideringen bruker PDF.js sin åpning/sidetelling og dens normale
containerhåndtering, ingen ny streng profil eller vilkårlig bytegrense.
Dette er ikke bevis for full tekstreliabilitet, S2/modelltreff, S5 eller S6.
Finansfasiten er bevart som fremtidig uavhengig testgrunnlag, ikke levert
finans-/screeningfunksjonalitet.

Produktavhengighetene installeres med npm; Pythonverktøyene er bare valgfrie
midlertidige fixture-/inspeksjonsverktøy, dokumentert i
[fixture-README](../../tests/fixtures/property-cases/README.md).
Lokal commit gjøres av root etter overlevering; ingen push eller integrert review.
