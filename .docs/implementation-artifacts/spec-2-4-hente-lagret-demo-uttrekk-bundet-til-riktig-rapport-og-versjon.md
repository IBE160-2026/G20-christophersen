---
title: 'Story 2.4 — Hente lagret demo-uttrekk bundet til riktig rapport og versjon'
type: 'feature'
created: '2026-10-20'
status: 'done'
route: 'dispatch'
story_key: '2-4-hente-lagret-demo-uttrekk-bundet-til-riktig-rapport-og-versj'
baseline_commit: 'fa91c3fbb027be992194f7deb022de60a50acba6'
context:
  - '.docs/planning-artifacts/epics.md'
  - '.docs/planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md'
  - '.docs/specs/spec-IBE160/grensekontrakter.md'
---

<frozen-after-approval reason="Eksplisitt implementeringsbestilling av bare Story 2.4 innen låst BMAD-grunnlag">

## Intent

Lever bare Story 2.4 AC1–AC4: en smal felles analyseadaptergrense med hele versjonerte DocumentBasis som input og eksisterende AdapterOutcome som retur. Implementer lokal demo med lagrede, kontrollerte fiktive svar for F1–F4. Backendens felles resultatbinding skal gi eksisterende AnalysisOutcome. Demo bruker samme dokumentpipeline og kontrakter som senere live og kan brukes uten nett, nøkkel eller modellklient.

## Boundaries & Constraints

Oppslag krever eksakt SHA-256 fra originalbytes og samsvarende kontrakt-/uttrekksversjon. Filnavn er visningsmetadata, aldri oppslagsnøkkel eller inputsti. Lagret svar inneholder ikke requestId eller annen gammel forespørselskontekst. Metadata settes fra dokumentet i kode. Bevar originale kandidater/usikkerheter, limitations og feilede delresultater etter eksisterende bindAnalysisOutcome; ikke reparer feilaktige kilder eller gjett side/grad. Et omdøpt dokument beholder hashidentitet; eventuelt avvik i lagret originalt kildenavn håndteres av eksisterende kildeklassifisering.

Gjenbruk getDocumentBasisError før adapterkall og bindAnalysisOutcome etterpå. Unreadable, unknown, incomplete og bare blanke sider skal aldri omgås av et demoresultat. Hele pages-grunnlaget beholdes og sendes samlet; ingen ny PDF-tolkning eller parallell kontraktautoritet. Lagret konvolutt kan eie rapporthash/versjoner og minimal lagringsmetadata, men selve uttrekket bruker AdapterOutcomeSchema. Manglende, uleselig, ugyldig eller feilbundet lagring/versjon gir eksplisitt analysefeil med trygg kjent årsak, uten rå fil-/parserdetaljer.

Demo er standard ved denne modulgrensen og oppretter ingen KI-klient. Ikke les modellnøkler, legg til SDK, bruk nett, live-fallback eller gi finansverdier, anbefaling, estimat eller nye grader. Ingen HTTP-rute, klientintegrasjon, duplikatsperre, timeout, uploadressursgrense eller Story 2.5+. Ingen endring av autoritative plan-/spec-kilder, PDF-bytes eller uavhengig fasit. Stopp ved nytt produkt-/arkitekturvalg. Avslutt på in-review/review med lokal commit; ingen separat full code review/done, push eller neste story.

## I/O & Edge-Case Matrix

| Input/tilstand | Forventet |
|---|---|
| Ekte F1–F4 gjennom validatePdf og extractPdf | Alle fasitfunn med korrekt rapporthash og fysisk side; F4 TG3 på filside 4, ikke trykt side 2 |
| Samme gyldige PDF gjentatt | Identisk uttrekk uten mutasjon/klokke/tilfeldighet; ny requestId bindes bare fra kodekontekst |
| Annen PDF under kjent filnavn, endrede bytes/hash eller ingen lagret fixture | Eksplisitt analysefeil, aldri et annet dokuments cached resultat |
| Feil lagret rapporthash eller kontrakt-/uttrekksversjon | Eksplisitt trygg mismatch-/versjonsfeil |
| Ugyldig JSON/adapterstruktur eller lokal lesefeil | Eksplisitt trygg analysefeil; ingen vellykket tomliste |
| Kontrollert tomliste, usikker kandidat, analysefeil/delresultat | Eksisterende kontrakttilstander og originale opplysninger bevares |
| Unreadable/unknown/incomplete eller bare blank | Dokumentfeil før lagrings-/adapterkall, alle berørte sider bevart |
| Nett sperret og ingen API-nøkkel | Standard demo virker lokalt, null eksterne forespørsler |

</frozen-after-approval>

## Code Map

- `src/contracts/document-analysis.ts`: DocumentBasisSchema, AdapterOutcomeSchema og AnalysisOutcomeSchema er eneautoritet; eksisterende versjoner 2/1.
- `src/contracts/analysis-validation.ts`: getDocumentBasisError, bindAnalysisOutcome, createFailedAnalysis og validateAnalysisOutcome gjenbrukes; opphav og usikkerhet skal ikke skrives om.
- `src/backend/documents/validate-pdf.ts`, `extract-pdf.ts`: eksisterende bytehash og komplett sidemerket grunnlag, inkludert sperrende status. Ingen HTTP-kobling.
- `src/backend/analysis/`: ny smal adaptertype, demooppslag og liten felles helper for dokumentsperre/resultatbinding. Lokal lagring skal være backendressurs og aldri avhenge av testfasiten ved kjøring.
- `tests/fixtures/property-cases/expected.json`: uavhengig fasit; les i tester, aldri importer i produktkode eller generer output fra fasiten. F1–F4 PDFs og sha256.json beholdes uendret.
- `tests/integration/`, `tests/unit/`: faktiske PDF-bytes for pipeline/sideintegritet; injiserbar lokal loader eller samme adaptergrense for kontrollerte feil/tomliste/usikkerhet.
- `src/backend/README.md`, `README.md`: kort korrekt dokumentasjon av levert modul, opphav og fortsatt fraværende HTTP/UI-integrasjon.

## Tasks & Acceptance

- [x] `src/backend/analysis/`: implementer felles adaptergrense, dokumentsperre, lokal demo og eksisterende resultatvalidering.
- [x] `src/backend/analysis/` med lokale data: lag eksplisitte stabiliserte F1–F4-svar med dokumentert fiktivt opphav/hash/versjon, uavhengig av testfasit ved kjøring.
- [x] `tests/integration/demo-analysis.test.ts` og eventuelle enhetstester: dekk hele matrisen; kontroller eksplisitt originaltekst/grad, hash, fysisk side og kontrakt.
- [x] `README.md`, `src/backend/README.md`: dokumenter faktisk modulbruk og kjøregrense uten påstand om ny live-kjøring eller S2/S5/S6-bevis.
- [x] `.docs/implementation-artifacts/story-2-4-verifikasjon.md`, `.docs/process/arbeidsokter/2026-10-20-story-2-4.md`: lagre spor og målrettede testbevis. Root kjører full regresjon, setter status review og lager commit.

Given gyldig dokumentgrunnlag, when demo kjøres, then bare samsvarende hash/versjoner gir validert lagret uttrekk (AC1).
Given manglende/feilbundet/feilversjonert svar, when oppslag kjøres, then trygg eksplisitt analysefeil uten fallback (AC2).
Given standard lokal demo uten nøkkel/nett, when grensen brukes, then mode demo følger utfallet uten modellklient (AC3).
Given lagrede funn/tomliste/usikkerhet/feil, when resultatet bindes, then riktige kontrakttilstander og opphav bevares uten finans-/anbefalingsoutput (AC4).

## Implementation Notes

BMAD-build rendret én gang. Eksplisitt bestilling dekker implementering, lokal spec og commit uten ekstra godkjenningsrunde. Kun eksisterende uregistrerte fil er hookens promptlogg for denne bestillingen; den bevares. Ingen intensjonsgap, irreversible eksterne handlinger eller nye produkt-/arkitekturvalg funnet. Undersøkelsesagent bekreftet gjenbruk uten kontraktendring. Én implementeringsskriver om gangen; root eier sluttverifikasjon og commit.

Node/npm: `/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin` settes først i PATH. Playwright: `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-1-2-browsers`. PDF-verktøy: `/private/tmp/ibe160-story-2-2-pdf-venv/bin/python`. Root har lest kursgrunnlag og faglærertilbakemelding. Stopp og rapporter hvis implementeringen likevel avdekker nødvendig ny beslutning.

## Verification

Kjør målrettede adapter-/PDF-tester, deretter `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:e2e`. Kontroller diff/AC og at autoritative kilder/PDF-er/fasit er uendret fra baseline. Dokumenter faktisk resultat og grenser. Story 2.3 er done, R2 closed, Epic 2/SP2 in-progress, R3 og øvrige porter uendret; bare Story 2.4 går til review.

### Egenverifikasjon 2026-10-20

Root fullførte implementering etter avbrutt implementeringsagent. Lagrede svar
og alle matrisetester er levert. En separat kopi beskytter bindekontekst mot
adaptermutasjon. 48/48 målrettede tester, også under OS-sperret nettverk;
435/435 fullsuite, type/lint/build og 41+2 E2E består. Se
[verifikasjon](story-2-4-verifikasjon.md) og
[arbeidsøkt](../process/arbeidsokter/2026-10-20-story-2-4.md).
Matrisens manglende-/feilbundet-svarrad er prøvd med ukjent PDF og endret F1;
F2-under-F1-navn prøver i tillegg at en støttet PDF finner sitt eget korrekte
hashsvar med eksisterende kildeusikkerhet. Ingen ny produktbeslutning.

## Review Triage Log

Intern build-kontroll: [full evidens og triage](story-2-4-build-check.md).
Storyen blir på in-review/review; separat godkjenning/done inngår ikke.

| Funn | Verdict | Evidens/behandling |
|---|---|---|
| B1 status in-progress | false | Tidlig diffsnapshot; gjeldende status review kontrolleres før commit. |
| B2 ugyldig input/Zod | false | Validert DocumentBasis er forutsetning fra dokumentpipelinen; HTTP-input er senere arbeid. Lagrede versjonsfeil er dekket. |
| B3 direkte adapter uten gate | false | Felles analyzeDocument er eneste produktkaller og sperrer før adapterbruk. |
| B4 vilkårlig årsak i adapterfeil | false | Alle produksjonsårsaker er faste kodeeide strenger; injisert kode er betrodd. Ukjent unntak blir trygg fast melding. |
| B5 tellerens worker-omfang | low | JS-teller dekker hovedprosessen; allerede kjørt OS-sperre dekker hele pipelinen. Presiser dokumentasjonen. |
| B6 subprocess uten timeout | low | Legg testtimeout på subprocess; ingen endring av produksjonsgrenser. |
| B7 eksakte offlinekommandoer | medium | Beviset mangler kopierbar reproduksjon; legg til faktisk profil/probe/kjøring. |
| B8 egen non-ENOENT FS-test | low | Avvist: enkel videreføring inn i testet loader-catch; ekstra FS-mock gir lite og ingen faktisk feil er vist. |
| B9 gjenbrukt adapterinstans | low | Legg til målrettet interleavet F1/F4-test ved samme grense. |

Edge-case-hunter: ingen funn. Verification-gap: ingen verifikasjonsgap.
Ingen intent-gap, bad-spec-omlegging eller ny produkt-/arkitekturbeslutning.

### Sluttverifikasjon etter intern build-kontroll

B5/B6/B7/B9 er håndtert med presist nettverksbevis, testlokal subprocess-
timeout og test av delt adapter. Implementeringsagenten ble gjenengasjert
for disse små rettingene; ingen produksjonskode ble endret. Root etterprøvde
rettingene: 49/49 målrettede tester under OS-sperret nettverk/tomt nøkkelmiljø,
436/436 fullsuite og type/lint/build grønt. E2E-regresjon: 41+2 bestått.
Ingen utsatt produktfeil eller nye åpne spørsmål. Spec beholdes in-review og
sprintstatus review etter brukerens bestilling; ingen automatisk done.

### Full code review 2026-10-20

Separat bestilt BMAD code review av `7b1897402b732e46c21de35bdffcc37dad79d6e9`
er fullført. Alle fire reviewlag består uten verifiserte funn. AC1–AC4 er
kontrollert mot kode, faktiske PDF-er og egne negative lagringsprøver.
49/49 målrettede tester med OS-nettverkssperre og tomt miljø, 13/13 egne
positive/negative scenarier, 436/436 regresjonstester, lint/type/build og
41+2 E2E består. Ingen produktretting var nødvendig.

Brukerens nye reviewbestilling autoriserer done etter bestått full review;
den tidligere implementeringsbestillingens review-stopp er historikk.
Story 2.4 settes til done. Epic 2/SP2 pågår; Story 2.5 forblir backlog og
R3 er fortsatt åpen. Se [full reviewrapport](story-2-4-review.md).
