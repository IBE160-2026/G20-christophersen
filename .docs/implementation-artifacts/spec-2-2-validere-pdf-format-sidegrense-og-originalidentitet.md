---
title: 'Story 2.2 — Validere PDF-format, sidegrense og originalidentitet'
type: 'feature'
created: '2026-10-19'
status: 'in-review'
route: 'dispatch'
story_key: '2-2-validere-pdf-format-sidegrense-og-originalidentitet'
baseline_commit: 'f8167fd1f81f377ef97ce5f6a0d46a53d10312dd'
context:
  - '.docs/implementation-artifacts/epic-2-context.md'
  - '.docs/planning-artifacts/epics.md'
  - '.docs/implementation-artifacts/sprint-plan.md'
  - '.docs/planning-artifacts/implementation-readiness.md'
---

<frozen-after-approval reason="Eksplisitt brukerbestilling innen godkjent Story 2.2">

## Intent

Backend skal validere faktisk PDF-format/sideantall og SHA-256-identitet før
senere tekst-/analysesteg. Lever bare uendrede Story 2.2 AC1–AC4 og testkrav.
Fiktive F1–F4-PDF-er og adapteruavhengig maskinlesbar fasit etableres nå.

## Boundaries & Constraints

Bruk låst pdfjs-dist **6.4.299**, legacy-build i Node **24.21.0**, npm 11.19.0.
Gjenbruk feilkontrakten fra 2.1. Filnavn er visningsmetadata, aldri serversti
eller rapportidentitet. Originalbytes og korrekt sideantall beholdes for neste
steg. Rydd PDF.js-ressurser ved suksess og feil. Ingen vilkårlig bytegrense,
HTTP-timeout eller ny støtteinnskrenkning. Bevar originaldata ved parserbruk.

Ikke endre låste krav/UX/arkitektur/SPEC/epics/story-AC. Ingen tekstuttrekk,
lesbarhetsmetode, OCR, adapter-/HTTP-/frontendintegrasjon, KI eller senere
story. Formatgodkjenning er et eget delutfall, aldri completed analyse eller
påstand om lesbart/tilstrekkelig grunnlag. R2 beholdes åpen. Stopp ved ny
produkt-/arkitekturavgjørelse eller reell blocker; ikke bytt pins i stillhet.
Kun én skriver om gangen. Avslutt implementeringen på **in-review/review**,
ingen integrert code review/done. Lag lokal commit uten push etter overlevering.

## I/O & Edge-Case Matrix

| Input | Forventet |
|---|---|
| Faktisk tekst-PDF, 30 sider | Format/side godtas, bytes og 30 beholdes |
| Faktisk tekst-PDF, 31 sider | Dokumentfeil page-limit med trygg årsak |
| Ikke-PDF eller skadet container | Dokumentfeil, ingen vellykket tomliste |
| Identiske bytes, ulike navn | Samme SHA-256; navn bare metadata |
| Endrede PDF-bytes, samme navn | Ny SHA-256 |
| Gyldig PDF uten tekstlag | Formatdelutfall; ingen lesbarhetsgodkjenning |
| F1–F3 | TG2 på PDF-side 2, ingen TG3; F3 mangler L |
| F4 / RT-5 | I tillegg TG3 «Alvorlig lekkasje i tak», PDF-side 4, trykt side 2 |

</frozen-after-approval>

## Code Map

- `src/contracts/document-analysis.ts`: delte feil/schemas fra done 2.1.
- `src/backend/documents/`: ny bytesbasert format-/sidekomponent.
- `package.json`, `package-lock.json`: legg til eksakt låst PDF.js-pin.
- `tests/integration/`: faktiske fixturebytes, ikke mockparser.
- `vitest.config.ts`, `tsconfig.node.json`: inkluder nye integrasjonstester.
- `tests/fixtures/property-cases/`: PDF-er, uavhengig JSON-fasit, reproducerbar
  generator og dokumentert fiktivt opphav; ingen lagret adapterretur ennå.
- `README.md`, `src/backend/README.md`: faktisk modul-/teststatus.

## Tasks & Acceptance

- [x] Installer låst PDF.js og implementer format/side/hash med ressursopprydding.
- [x] Lag F1–F4-fasit før PDF/adapterbruk; bevar låste finansdata fra Brief-addendum.
- [x] Lag faktiske grense-/feil-/tekstløse PDF-fixtures og integrasjonstester.
- [x] Kryssjekk PDF/fasit visuelt; dokumenter alle fire AC og testresultater.
- [x] Oppdater bare implementeringsfremdrift/sprint til review; ingen 2.3.

Given 30/31-siders tekst-PDF, when formatsteget kjøres, then 30 godtas og
31/feilformat/skadet container gir trygg dokumentfeil (AC1).
Given bytes/navnevarianter, when hash beregnes, then kun bytes bestemmer
identitet og navn brukes aldri som sti (AC2).
Given gyldig container uten tekstlag, when formatsteget returnerer, then
originalbytes/sideantall beholdes uten analyse-/lesbarhetspåstand (AC3).
Given F1–F4, when PDF/fasit kryssjekkes, then funntekst/grad/navn/filside,
RT-5 og låst økonomigrunnlag samsvarer uavhengig av adapter (AC4).

## Implementation Notes

Ingen intensjonsgap eller irreversible sideeffekter funnet. Separate tekniske
schema-/API-detaljer og fiktiv TG2-beskrivelse innen låst fasit er rutinevalg.
BMAD build rendret én gang; dispatch valgt pga ny modul/avhengighet/fixtures.
Eksplisitt brukerbestilling dekker implementeringsspec og lokal commit;
ny produkt-/arkitekturbeslutning krever stopp. Eneste eksisterende endring er
hookens promptlogg. Poppler mangler lokalt; bruk tilgjengelig renderer eller
installer nødvendig verktøy uten å endre produktstakk. PDF-skillen er lest;
før første PDF-generering kjør dens mark_artifact_operation_started.mjs
fra skillroten med riktig antall. Bevar viktige prosess-/testbevis i repoet.

## Verification

Kjør målrettede faktiske PDF-integrasjoner, full Vitest, typecheck, lint og
build med låst runtime. Ved avhengighetsendring kontroller reproduserbar
installasjon. PDF/fasit krever manuell visuell kryssjekk; dette beviser ikke
2.3-lesbarhet eller S2/live-treff. Kjør relevant appregresjon ved behov.
Bevar råkontroller, AC-spor og arbeidsøkt i .docs; sjekk låste kilder mot
baseline og git diff --check. Root verifiserer overlevert diff og committer.

## Implementation Progress — 2026-10-19

Story 2.2 er implementert og egenverifisert på Node 24.21.0/npm 11.19.0
med pdfjs-dist 6.4.299. 17 faktiske PDF-integrasjoner og full Vitest
(292 tester), typecheck, lint, build, ren npm ci og byte-identisk
fixtureregenerering er bestått. Eksisterende appregresjon: 41/41 demo og
2/2 dev bestått. F1–F4 er kryssjekket med uavhengig pypdf og
rendret/visuelt inspisert med PyMuPDF. Se
[verifikasjon og AC-spor](story-2-2-verifikasjon.md) og
[arbeidsøkt](../process/arbeidsokter/2026-10-19-story-2-2.md).
Status er in-review/review; ingen integrert code review eller done.
R2 beholdes åpen, og 2.3 er ikke startet. Root overtar for diffkontroll og
lokal commit uten push.
