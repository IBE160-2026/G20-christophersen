---
title: 'Story 2.2 — Validere PDF-format, sidegrense og originalidentitet'
type: 'feature'
created: '2026-10-19'
status: 'done'
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

### Review Findings — 2026-10-19

- [x] [Review][Patch][High] B1: For lav `/Count` kunne skjule side 31. Etter eksplisitt videreføringsbestilling bruker komponenten nå eksisterende PDF.js-traversering av faktiske Kids/xref uavhengig av Count. Alle faktiske sidedictionaries valideres; faktisk 31 gir page-limit. Regresjonsproben og 42 PDF-integrasjoner består. Ingen ny parser, byteomskriving, støtteprofil eller R2-metode er innført. Den private koblingen er eksakt hashbundet og [dokumentert](story-2-2-page-tree-design.md).
- [x] [Review][Patch][High] B2: Skadet sidereferanse ble formatgodkjent — alle rapporterte sidedictionaries åpnes nå uten tekstuttrekk; regresjonstest avviser skadet tre.
- [x] [Review][Patch][Medium] B3 / E1: Oppryddingsfeil kunne eksponere rå unntak og hoppe over workerdestroy — komponenten eier worker og destruerer den separat i finally; feilteksten er fast og trygg.
- [x] [Review][Patch][Medium] B4: Worker-/driftsfeil ble feilaktig presentert som ødelagt rapport — slike feil avvises nå med trygg driftsmelding, uten påstand om dokumentårsak.
- [x] [Review][Patch][Low] B6: Ufullstendig manifestkontroll — alle ti filers SHA-256 og navneinventar kontrolleres nå.
- [x] [Review][Patch][Low] B7: Generatorens glob adopterte uvedkommende PDF-er — manifestet bygges nå bare fra de ti navngitte utdataene.
- [x] [Review][Patch][Low] B9: Manglet identitetsasserts ved dokumentfeil — navn/hash kontrolleres nå også ved 31 sider, skadet/ugyldig/tom fil.

Rejected:

- B5 (`false`): Ingen feil i gjeldende oracle påvist. Fullstendig runtime-schema for alle fremtidige finans-/evalueringsfelter er ikke et manglende 2.2-AC; gjeldende finansdata og metadata er kontrollert mot kildene.
- B8 (`false`): Dokumentert regenerering skal overskrive bytes og hashinventar. Git/baseline-sammenligning er kontrollgrensen; ingen automatisk påstand om at regenerering alene beviser uendrede bytes.
- B10 (`false`): Alle gjeldende eksplisitte TG2/TG3 er visuelt og med uavhengig parser kryssjekket; ingen oversett alternativ skrivemåte finnes i de aktuelle fixturene. Ingen produksjonsmetode for generelt TG-uttrekk innføres her.

Første reviewomgang endte på **in-progress** med B1 åpen og uten ny commit/push.
Historikken beholdes; videreføringen og endelig resultat står nedenfor.

### Full review ved videreføring — 2026-10-19

Brukeren autoriserte videre retting av B1 med faktisk traversering i eksisterende
PDF-lag, med bevaring av alle tidligere rettinger. Fire nye reviewlag er fullført.
Funnene nedenfor er ferdig behandlet innen 2.2 før done:

- [x] [Review][Patch][High] E2.1/E2.2/A2.1: Lav Count skjuler ødelagte sideegenskaper — valider alle traverserte sider med PDF.js sine egne metadata-gettere, uten tekstuttrekk. De tre reviewerbidragene har samme rotårsak.
- [x] [Review][Patch][Medium] V2.1/C6: Mangler regresjon for driftsfeil/avbrudd i den nye sidetre-workeren — kontroller trygg avvisning og faktisk avsluttet worker.
- [x] [Review][Patch][Low] C4/C5: Sikre faste driftsmeldinger også ved feil i siste worker-destruksjon/terminering.
- [x] [Review][Patch][Medium] C7: Deterministisk offset-regresjon — eksplisitt paddet Buffer-slice kontrollerer eksisterende normaliseringsretting.
- [x] [Review][Patch][Low] C1/C2/C3: Oppdater status, testantall og beskrivelse av privat/parserbundet kobling etter sluttverifikasjon. Tidligere reviewresultat beholdes som historikk.
- [x] [Review][Patch][Low] C8: Verifiser alternativ gyldig PDF-struktur ved den nye parsergrensen; ikke innfør en begrensning til generatorens opprinnelige xref-tabeller.
- [x] [Review][Patch][Medium] C9: Kontroller sykliske/gjentatte sidereferanser mot parserens faktiske feilutfall og workeropprydding.

## Endelig reviewresultat etter videreføring — 2026-10-19

Alle fire Story 2.2-AC består nå full BMAD review. Alle tidligere rettinger
er beholdt og alle nye funn er lukket. Root kjørte 317/317 Vitest (42 PDF-
integrasjoner + 275 modultester), typecheck/build, lint og full README-E2E
(41 demo + 2 dev), samt positiv Count-probe og uavhengige fixturekontroller.
Acceptance Auditor kontrollerte AC1–AC4 på nytt og kjørte 42/42 PDF-tester;
Edge Case og Verification Gap bekreftet rettelsene separat; Blind Hunter
fant ingen ytterligere konkrete feil etter oppfølgingen. Se
[sluttrapport](story-2-2-review.md) og [sluttkontroller](story-2-2-review-sluttkontroller.txt).

Status er **done**, synkronisert bare for Story 2.2 i sprintstatus. Epic 2
er fortsatt in-progress; R2 er open med decision_record null, og Story 2.3
er backlog. Ingen senere story, R2-lesbarhetsmetode eller push er utført.
Reviewrettinger og prosessbevis samles i en lokal commit etter sluttkontroll.
