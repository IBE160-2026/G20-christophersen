# Story 2.3 — BMAD code review 2026-10-20

**Bestått etter retting; done.** Reviewmål: `920343b5209a9308ba071a7a8b79cb08265e1950`.
Ingen åpne funn. Seks kodefeil og tre verifikasjonshull er håndtert innen
Story 2.3. Story 2.4 er ikke startet; ingen push.

## Autoritet og metode

[Story 2.3 AC1–AC4](../planning-artifacts/epics.md#story-23-trekke-ut-sidemerket-tekst-med-kontrollert-lesbarhet),
[storyspec](spec-2-3-trekke-ut-sidemerket-tekst-med-kontrollert-lesbarhet.md),
[R2](../planning-artifacts/r2-pdf-lesbarhet-semester-v1.md),
[arkitektur AD-3/AD-4/AD-10](../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md),
[SPEC](../specs/spec-IBE160/SPEC.md), [grensekontrakter](../specs/spec-IBE160/grensekontrakter.md),
PRD FR-6–FR-9/RT-2/RT-5/RT-9, [sprintplan](sprint-plan.md) og
[sprintstatus](sprint-status.yaml) er kontrollert mot faktisk kode.
Original sensorveiledning, alle sju sider, og lagret faglærertilbakemelding
er lest for prosess, sporbarhet, meningsfulle tester og scope; ingen nye
produktkrav er utledet.

BMAD-resolveren aktiverte fire reviewlag: Blind Hunter (B), Edge Case Hunter
(E), Verification Gap (V) og Acceptance Auditor (A). Tre startet parallelt,
det fjerde i neste ledige slot. Alle fullførte. Root var eneste skriver,
etterprøvde funn og kjørte egne prober/tester. Brukerens uttrykkelige bestilling
dekket retting, status og lokal commit; generiske bekreftelsesvalg ble ikke
gjentatt. Kravene er beholdt; bare implementering, tester og status/bevis er endret.

## Full triage

Hvert reviewerforslag beholdes nedenfor, også overlappende og avviste.
Blind Hunters kvantitative funnkrav ble ikke brukt som feilbevis.

| ID / lag | Vurdering | Bevis og behandling |
|---|---|---|
| B1 | high, patch | Gyldig lokal Annots endret samme tekst+XFA fra unknown til readable ved tidlig retur. Akkumulerer innhold og fortsetter gjennom øvrige nøkler, foreldre og katalog. |
| B2 | high, patch | Faktisk PDF med tilstøtende T/G/3-fontfragmenter ble «T G 3». Bruker PDF.js sine egne mellomrom og hasEOL uten å sette inn ekstra mellomrom. |
| B3 | high, patch | Mutert `format.originalBytes` ble brukt med gammel rapporthash. Konsumert snapshot kopieres og SHA-256-verifiseres før worker opprettes; mismatch avvises trygt. |
| B4 | false, avvist | Påstått transient per-side-cleanupfeil med etterfølgende vellykket final cleanup er ikke vist nåbar. PDF.js beholder avviste fontpromiser før cache-clear; endelig cleanup avviser igjen og gir unavailable. Faktisk worker avsluttes i ytre finally. Reviewer trakk bekymringen etter etterkontroll. |
| B5 | medium, patch | Ekte sammensatt font ga unreadable fordi lokale CMap-forespørsler ble avvist. Laster pakkens CMaps via samme lokale, filnavnbegrensede ressursbro som standardfonter. |
| B6 | medium, patch | Kjente forskjeller i dekoding/kryptering/struktur forsvant i samme generiske unknown-årsak. Bevarer trygge kodegenererte kategorier, uten rå referanse-ID, parsertekst eller PDF-innhold. |
| B7 | medium, patch | Kolonnefasiten manglet radvis fletting. Ny original og separat fasit bevarer graderaden og beskrivelsesraden i fysisk side; test utvider bevis, ikke generell semantisk garanti. |
| B8 | medium, patch | R2s digitale topptekst over rasterisert TG3 manglet egen kombinasjonsfixture. Ny test godtar kun det digitale tekstlaget og viser at TG3-rasteret ikke er lest. |
| B9 | low, avvist | Ingen separat intern task-/cleanup-feilinjeksjon. Ingen konkret brutt opprydding påvist; unngår testkroker eller bred refaktorering bare for dette. Intern flyt kildeinspisert, faktiske workers og ytre feilgrener testet. Ingen påstand om injisert intern cleanup-test. |
| B10 | low, avvist | Felles parserloader kunne redusert fremtidig vedlikehold. Begge nåværende broer har samme pin/hash og fail-closed kontroll; ingen faktisk divergens. Refaktorerer ikke done 2.2 for en hypotetisk fremtidig pinendring. |
| E1 | high, patch | Samme rotårsak som B1, også reprodusert med uavklart lokal AP etter Annots. Begge bevis beholdt i nye fysiske sider. |
| E2 | high, patch | FreeText/AP med TG3 falt ut mens digital sidetekst ga readable. Kjent utelatt annotasjons-/felttekst gir incomplete med bevart tilgjengelig sidetekst. Ingen ny annotasjonsekstraktor. |
| V1 | medium, patch | Injiserte diagnostikkverdier testet ikke workerens faktiske fangst. Ny ekte PDF med ukjent operator gir unknown; neste rene side er readable. Fjerning av diagnostikkfangsten ville nå gi rødt. |
| A1 | high, patch | Uavhengig PyMuPDF-fasit bekreftet E2: både body og FreeText TG3 finnes i originalen. Samme retting; fullføring blokkeres. |
| A2 | high, patch | Uavhengig akseptansekontroll bekreftet B1/E1. Samme retting; XFA kan ikke skjules av annotasjon. |
| E3, oppfølging | high, patch | Widget med arvet Tx eller Ch slapp fortsatt gjennom første rettelse. Alle ukontrollerte Widgets gjør ellers-readable til unknown; kjent direkte teksttap beholder incomplete-prioritet. |
| A3, oppfølging | high, patch | Stamp/AP kunne ha PDF-tekst uten FreeText-subtype. Alle ukontrollerte annotation-AP gjør ellers-readable til unknown. Nye Stamp/arvet-Widget/Ch-sider har synlig TG3 i uavhengig originalkontroll. |

Overlapp grupperes i ni rotårsaker: B1/E1/A2; E2/A1/E3/A3; B2; B3;
B5; B6; B7; B8; V1. Alle er rettet/verifisert. Ingen decision-needed,
defer eller uløste high/medium gjenstår. B4/B9/B10 er avvist med begrunnelse.

## AC-kontroll mot sluttkode

| AC | Konkret kode og kjørbart bevis | Resultat |
|---|---|---|
| AC1 | `extract-pdf`, fysisk bladtraversering i worker og `DocumentBasisSchema`: F1–F4, alle 30 sider, objekt-/xref-strømmer, linearisering, feil nestet Count, blank/feil og ukjent mapping. Én ordnet post 1..pageCount; F4 fysisk 4/trykt 2. | Bestått |
| AC2 | PDF.js legacy 6.4.299, pin/hashbundet lokal kode, ignoreErrors:false (=stopAtErrors:true). Uavhengig tabell-/kolonne-/æøå-/bilde-/korttekstfasit, fontfragmenter og CMap. Faktiske annotasjonsteksttap blir incomplete/unknown med tilgjengelig body bevart. | Bestått innen dokumentert metode |
| AC3 | `extractPage`, `getDocumentBasisError`, `bindAnalysisOutcome`: unreadable/unknown/incomplete gir failed/document før adapterbruk; alle fysiske feilsider og kjente trygge årsaker beholdes. Delvis tekst består; ingen delresultater blir completed. | Bestått |
| AC4 | Eksakte PDF-whitespacebytes, full Flate/ASCII85-dekoding, rå struktur/referanser og innholdskontroll. Blank blokkerer ikke med readable; helt blank rapport avvises. Skann/foto/vektor/plantegning/form/appearance gir aldri falsk blank eller analysert bilde. Raster på tekstside leses ikke semantisk. | Bestått |

Originalbytes beholdes uendret separat; parseren får bytekopi som må passe
rapporthashen. Alle 13 tidligere lesbarhets-PDF-er og eldre fixturebytes er
uendret. Hele `document.pages` kan konsumeres direkte av senere analyse etter
dokumentgrensen, uten ny PDF-tolkning. Ingen adapter, demo-oppslag, HTTP-rute,
frontend, OCR, vision, terskler eller ressursgrenser er lagt til.

## Tester og uavhengig kontroll

Node 24.21.0, npm 11.19.0, uendret package-/lockfil. Ni nye integrasjonstester
og sju nye faktiske PDF-er har separat forhåndsskrevet oracle. Før retting
feilet sju regresjoner på originalkoden. pypdf/PyMuPDF verifiserte tekst og
fysiske sider; rendret layout, TG3-fontfragmenter, CMap, skann og annotasjon/AP
ble åpnet og kontrollert. Alle 20 PDF-er og manifest ble regenerert byteidentisk
i isolert tmp-mappe. Andre PDF-motorer brukes bare som testverktøy.

| Kontroll | Resultat |
|---|---|
| Målrettet PDF-integrasjon + enhet | **58/58**, også kjørt separat av reviewerene etter siste patch |
| Full `npm test` på sluttkode | **387/387**, 9 filer |
| `npm run lint` | Bestått |
| `npm run build` med `npm run typecheck` | Bestått på sluttkode |
| `npm run test:e2e` | **41 demo + 2 dev**, bestått; lokal server krevde sandbox-eskalering. Kjørt på endelig kode. |
| `git diff --check`, scope og tidligere fixturehashes | Bestått |

[Råkontroller](story-2-3-review-kontroller.txt) bevarer rødt før retting og grønne
sluttkjøringer. Edge Case Hunter og Acceptance Auditor etterprøvde siste
appearance-/Widget-retting med egne prober og 58/58 tester; begge godkjenner.
Blind Hunter bekreftet de øvrige rettingene med 58/58 tester. Ingen reviewlag feilet.

## Endelig status og grenser

Story 2.3: **done** i storyspec og sprintstatus. Epic 2/SP2 fortsetter;
Story 2.4: **backlog**. R2: **closed**. Samlet readiness: **CONCERNS** fordi
R1/R3/R4 fortsatt gjelder ved sine kontrollpunkter. Ingen ny port er lukket.
Lokal reviewcommit samler retting, bevis, promptlogg og statussynk; ingen push.

Readable gjelder støttet tekstlag, ikke semantisk fullstendighetsgaranti.
Ustøttet dekoding, ukontrollert annotation-appearance og annen uklar struktur
blokkeres konservativt. Den private parserkoblingen må kontrolleres ved senere
pinendring. Faktisk KI-treff/S2 og live-S5 er fortsatt senere arbeid.
