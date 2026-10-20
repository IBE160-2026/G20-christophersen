---
title: 'Story 2.3 — Trekke ut sidemerket tekst med kontrollert lesbarhet'
type: 'feature'
created: '2026-10-20'
status: 'done'
route: 'dispatch'
story_key: '2-3-trekke-ut-sidemerket-tekst-med-kontrollert-lesbarhet'
baseline_commit: '68bb8f25dd359738254bf370094ecfaf7db7d287'
context:
  - '.docs/planning-artifacts/r2-pdf-lesbarhet-semester-v1.md'
  - '.docs/implementation-artifacts/epic-2-context.md'
---

<frozen-after-approval reason="Eksplisitt bestilling av Story 2.3 innen godkjent BMAD-grunnlag og lukket R2">

## Intent

Implementer bare Story 2.3 AC1–AC4: lokal, deterministisk, sidevis PDF.js-ekstraksjon til eksisterende DocumentBasis. Bevar originalbytes og én ordnet post per fysisk PDF-posisjon, også ved blank/feil. Lever minste komplette løsning innen R2, med testbevis.

## Boundaries & Constraints

Bruk låst pdfjs-dist 6.4.299 legacy-build i Node 24.21.0/npm 11.19.0 og `stopAtErrors: true`. Original-PDF/hash/navn fra 2.2 bevares separat; parseren får kopi. Alle sider 1..pageCount beholdes uten avkorting, filtrering eller renummerering. Trykt sidetall overstyrer aldri filposisjon. Bruk eksisterende kontraktversjon 2/uttrekksversjon 1.

R2 eier statusrekkefølgen: kjent delvis uttrekk/teksttap → incomplete; ukjent pålitelighet/ufullstendig inspeksjon → unknown; vellykket ikke-whitespace tekst uten kjent feil → readable for tekstlaget. Avvist lesing med kjent side/feil → unreadable. Uten tekst krever blank fullført strukturell inspeksjon: ingen/tom Contents-liste eller fullstendig dekodede strømmer med bare byte 0/9/10/12/13/32, og ingen annotasjoner/form/appearance/XFA/annet innhold som må tolkes. Påvist innhold uten tekst → unreadable. Uklarhet/feil gir aldri blank.

Unreadable/unknown/incomplete og bare blanke sider skal gi kontraktens dokumentfeil før senere adapterbruk; alle berørte fysiske sider og kjente trygge årsaker beholdes. Blank alene sperrer ikke når lesbar rapporttekst finnes. Hele sidegrunnlaget skal være direkte konsumerbart av senere analyse uten ny PDF-tolkning. Rydd sider, dokument, parser og workers også ved feil.

Ingen OCR, vision, AI-fallback, manuell semantisk klassifisering, tegn-/prosentterskler, HTTP, adapter, demo-oppslag, frontend eller Story 2.4+. Ingen nye ressurs-/timeoutgrenser eller endringer i låste produkt-/arkitekturkontrakter. Stopp og rapporter ved reelt nytt produkt-/arkitekturvalg. Ingen push. Lever in-review/review og lokal commit; separat code review/done inngår ikke.

## I/O & Edge-Case Matrix

| Input | Forventet |
|---|---|
| Kort tekst, flersidig rapport, F1–F4 | Readable, bevart tekst/grad/beskrivelse og fysisk side; F4 TG3 på filside 4, trykt 2 |
| Tabell, kolonner, æ/ø/å, tekst med bilde | Kontrollerbar side/tekst/kontekst mot uavhengig originalfasit; readable gjelder tekstlaget |
| Manglende Contents, tom liste, tom/dekodet whitespace-strøm | Blank bare ved fullført inspeksjon uten annet sideinnhold |
| Tekstløst bilde/skann/foto/vektor/plantegning/annotasjon/form | Unreadable eller unknown ved uavklart inspeksjon, aldri blank/fullført |
| Readable + blank + flere feil | Alle fysiske poster beholdes; dokumentfeil oppgir samtlige blokkerende sider |
| Bare blank | Dokumentfeil, aldri vellykket tomliste |
| Parser-/ekstraksjonsfeil og kjent delvis tekst | Blokkerende status, eventuell bevart tekst, trygg årsak og opprydding |
| Avvikende deklarert Count | Faktisk sideidentitet fra 2.2 bevares; ingen feil sidekobling godkjennes |

</frozen-after-approval>

## Code Map

- `src/backend/documents/validate-pdf.ts`: gjenbruk formatutfall med originalbytes/hash/faktisk count; ingen regression i 2.2.
- `count-pdf-pages.ts`, `pdf-page-tree-worker.ts`: eksisterende isolert hashbundet intern PDF.js-bro. Offentlig API beviser ikke rå strukturell tomhet; gjenbruk samme parserkobling ved behov, uten regex-parsing av PDF.
- `src/contracts/document-analysis.ts`, `analysis-validation.ts`: eneautoritet for DocumentBasis/sidestatus og dokumentfeil/fullføringssperre. Gjenbruk fremfor parallelle DTO-er.
- `tests/fixtures/property-cases/`: eksisterende PDF-er og håndskrevet expected.json, ingen adapterretur.
- `tests/integration/`, `tests/unit/`: faktiske bytes for parseratferd; kontrollert feilinjeksjon for delvis uttrekk og ressursfeil.

## Tasks & Acceptance

- [x] `src/backend/documents/`: implementer sideuttrekk, konservativ strukturell inspeksjon, trygg feilstatus og opprydding.
- [x] `tests/fixtures/pdf-readability/`: dokumenter fasit før kjøring; lag reproducerbare fiktive PDF-er for matrisen, uten produktavhengigheter.
- [x] `tests/integration/pdf-extraction.test.ts`, eventuelt enhetstester: test hele matrisen med ekte parser der relevant, original/hash/sidegrenser og fullføringssperre.
- [x] `README.md`, `src/backend/README.md`: dokumenter faktisk modulbruk og begrensninger.
- [x] `.docs/implementation-artifacts/`, `.docs/process/arbeidsokter/`: lagre AC-/testbevis, oppdater spec/sprint til review og lokal commit uten senere story.

Given formatvalidert PDF, when uttrekk kjøres, then én post per fysisk side beholdes (AC1).
Given layout-/tegnfixtures, when originalfasit sammenlignes, then tekst og grad/beskrivelseskontekst bevares på riktig side (AC2).
Given ulest/usikker/delvis side, when grunnlaget kontrolleres, then dokumentfeil sperrer fullføring og oppgir alle berørte sider (AC3).
Given blank/blandet/feil innhold, when R2-metoden kjøres, then bare bevist tomhet gir blank og ingen terskel/semantisk gjetting brukes (AC4).

## Implementation Notes

BMAD build rendret én gang. Eksplisitt bestilling dekker implementering/spec/lokal commit uten ny godkjenning. Eksisterende hooklogg tilhører denne bestillingen. Ingen intensjonsgap eller irreversible eksterne sideeffekter funnet. Én skriver om gangen. Node finnes under `/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin`; Python-fixtureverktøy i `/private/tmp/ibe160-story-2-2-pdf-venv/bin/python`. Build dispatch instruerer egen implementeringsagent; root verifiserer og avslutter på review.

## Verification

`npm test -- tests/integration/pdf-extraction.test.ts` og relevante enhetstester; `npm test`; `npm run typecheck`; `npm run lint`; `npm run build`; `npm run test:e2e` med eksisterende Playwright-browsersti `/private/tmp/ibe160-story-1-2-browsers`. Kontroller originalfasit uavhengig og inspiser layout-fixtures visuelt. Bevar låste plan-/spec-kilder og eksisterende fixturebytes.

### Teknisk undersøkelse før implementering

Eksisterende pinbundet internbro er allerede arkitektur i 2.2. Undersøkelsen fant at `Page.getContentStream`, annotasjonsnormalisering og enkelte dekodere kan svelge feil. Blankbevis må derfor validere rå typer/referanser, filter og full dekoding; ukjent/ustøttet inspeksjon gir unknown etter R2. Node zlib kan verifisere full Flate-dekoding. Ingen ny generell begrensning på tekstsider/bilder innføres.

Fysisk bladrekkefølge fra `Catalog.getAllPageDicts(false)` kan brukes med intern `Page.extractTextContent`; constructor-parametre finnes i buntens `PDFDocument.getPage` (ca. linje 66132). Sink bruker enqueue/ready/desiredSize; kopier items siden PDF.js muterer chunkobjekter. `evaluatorOptions.ignoreErrors:false` svarer til stopAtErrors:true; offentlig loader skal bruke stopAtErrors:true hvis benyttet. Ukjent avbildning mellom fysisk blad og offentlig getPage må ikke bli falskt readable. Bruk diagnostikk konservativt ved kjent teksttap/usikkerhet, uten å lagre rå PDF-/parserdetaljer i årsaker. Eksporter nødvendige internsymboler kun fra hashkontrollert lokal kilde i isolert worker. Hold løsningen smal og testbar.

### Implementert til review 2026-10-20

AC1–AC4 er egenverifisert med ekte PDF.js og uavhengig originalfasit.
[Verifikasjonen](story-2-3-verifikasjon.md) og
[arbeidsøkten](../process/arbeidsokter/2026-10-20-story-2-3.md)
beskriver modulbruk, konservativ strukturell inspeksjon, feil-/oppryddingsbevis
og grenser. Root rapporterte 378/378 fullsuite, type/lint/build grønt og
41+2 E2E grønt. Lokal commit utføres av root etter overlevering.
Separat code review/done, senere story og push er ikke utført.

### Review Findings — 2026-10-20

Fire BMAD-lag er fullført. Root etterprøver og retter innen Story 2.3 etter
eksplisitt bestilling. Full triage og AC-spor: [reviewrapport](story-2-3-review.md).

- [x] [Review][Patch] B1/E1/A2 (high): Annotasjon avslutter inspeksjonen før øvrige nøkler/foreldre/katalog; XFA/usikker AP kan bli readable.
- [x] [Review][Patch] E2/A1 og oppfølging E3/A3 (high): Annotasjonstekst utelates mens siden godkjennes; kjent teksttap gir incomplete, ukontrollert AP/Widget gir unknown, tilgjengelig sidetekst beholdes.
- [x] [Review][Patch] B2 (high): Ubetingede mellomrom endrer tilstøtende tekstfragmenter og TG3.
- [x] [Review][Patch] B3 (high): Mutert format-snapshot kan analyseres med gammel hash; kontroller konsumert bytekopi.
- [x] [Review][Patch] B5 (medium): Lokale PDF.js-CMaps lastes ikke selv om pakken inneholder dem.
- [x] [Review][Patch] B6 (medium): Bevar trygge, kjente kategorier for uavklart innholdsinspeksjon i sideårsaken.
- [x] [Review][Patch] V1 (medium): Ekte parserdiagnostikk mangler direkte regresjonsbevis; legg til faktisk PDF med ukjent operator.
- [x] [Review][Patch] B7 (medium): Utvid uavhengig fasit med radvis kolonneinnhold.
- [x] [Review][Patch] B8 (medium): Test digital topptekst over rasterisert TG3 uten påstand om semantisk bildelesing.

#### Rejected

- B4 (false): Påstått transient font-cache-cleanupfeil som etterfølges av suksess er ikke vist mulig. PDF.js beholder avviste fontpromiser til cleanup lykkes; endelig cleanup avviser igjen og returnerer unavailable. Worker avsluttes uansett.
- B9 (low, avvist): Intern task-/cleanup-injeksjon er ikke separat dekket. Ingen faktisk brutt opprydding er vist; testkroker/refaktorering bare for dette står ikke i forhold til gevinsten. Faktisk workeravslutning og ytre feilgrener er testet.
- B10 (low, avvist): Delt parserloader er en mulig fremtidig vedlikeholdsforbedring, men begge pinnene er identiske og hashverifisert. Ingen nåværende divergens; unngår refaktorering av done Story 2.2 i dette reviewet.

### Review fullført 2026-10-20

AC1–AC4 godkjent etter retting og uavhengig etterkontroll. 387/387 Vitest,
58/58 målrettede PDF-tester, typecheck/build/lint og 41+2 E2E består.
[Reviewrapporten](story-2-3-review.md) bevarer alle funn, avvisninger og bevis.
Story/sprintstatus er done; Epic 2 og SP2 pågår. Story 2.4 er backlog,
R2 closed og øvrige porter uendret. Lokal reviewcommit; ingen push.
