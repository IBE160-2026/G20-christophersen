---
title: 'Lokal analyse av grafiske tilstandsgrader med kontrollerbar dekning'
type: 'feature'
created: '2026-11-03'
status: 'done'
route: 'dispatch'
baseline_commit: f4f50e9fe0210ec7ae2ba844db603b65adca0781
review_loop_iteration: 0
context: ['AGENTS.md']
---

<frozen-after-approval reason="Brukerens uttrykkelige bestilling av implementering, subagenter, ekte dokumenttest og lokal commit">

## Intent

PAA skal lese grafiske TG2/TG3-symboler lokalt når PDF.js-tekst ikke gir tilstrekkelig grunnlag, knytte graden til riktig bygningsdel og detaljert avvik, og vise dokumentert fremdrift og usikre rapport-sider. Sammendrag og detalj skal avstemmes uten dobbelttelling eller skjulte gradkonflikter.

## Boundaries & Constraints

Bruk eksisterende PDF-er og lokal OCR, uten betalte API-kall, push eller private PDF-er/utdrag i Git. Original hash, filnavn og fysisk side beholdes. Avledet OCR får eget kildeformat med område i originalen; det får aldri oppdiktede PDF.js-offseter. Farge alene dokumenterer ikke TG-grad. Uleselig symbol, tvetydig komponent eller avkuttet avviksblokk forblir usikkert. Visuell lesing opphever ikke teknisk kontroll eller komplettporten. Bevar finansregler, økonomi, juridisk risiko og Konsept A. Parserregler er generelle, uten adresser eller case-spesifikke sidetall.

## I/O & Edge-Case Matrix

| Scenario | Input | Forventet utfall |
| --- | --- | --- |
| Grafisk grad | Lesbar TG2/TG3-badge og entydig komponent/avviksblokk | Lokal visuell detalj med symbol-, komponent- og avviksområde |
| Blandet layout | To kolonner, flere komponenter, sider med foto | Kobling begrenses av kolonne og blokk; tvetydig kobling avvises |
| Ukjent symbol | Farge uten lesbar etikett, svak OCR, TG IU | Ingen gjettet TG2/TG3; usikkerhet bevares |
| Fortsettelse | Avvik slutter uten sikker blokkgrense | Ingen påstand om full detaljbeskrivelse |
| Sammendrag/detalj | Samme sikkert navngitte komponent og sted | Ett forhold i tellingen med begge kildeformer; ulike grader viser konflikt |
| Ulike forhold | Samme generiske navn i ulike rom/etasjer | Holdes atskilt; manglende identitet tillater ikke samling |
| Ressursgrense | Manglende macOS-verktøy, feil, side-/tidsgrense | Lokal tekst fungerer videre, alle ubehandlede sider forklares |
| Original | Visuell kilde åpnes | Riktig dokument og fysisk side; OCR-merke og område beholdes |

</frozen-after-approval>

## Code Map

- `src/backend/documents/extract-import.ts`, `src/backend/http/import-child.ts`: lokal PDF.js først; integrer visuell fallback i importprosessen uten ekstern transport.
- Nye `src/backend/documents/local-visual-*`: PDFKit-render, Vision OCR og deterministisk badgegeometri; isoler prosess og midlertidige filer, avgrens ressurser.
- `src/contracts/property-risk.ts`, ny visuell kildekontrakt, `src/contracts/document-import.ts`: separat avledet bevis, valider hash/navn/fysisk side/region, bevar eksisterende tekst- og økonomiporter.
- Ny `src/backend/import/visual-technical.ts`: komponent/grad/avvik fra sidegeometri; supplement til `technical-risk.ts`, aldri falsk komplettstatus.
- `src/frontend/investment/{RiskOverview,InvestmentOverview}.tsx`, `property-risk.ts`, `risk-grouping.ts`: synlig sidekart, ærlige kildemerker, originalåpning og konservativ avstemming.
- Ekte private PDF-er: 135 sider med rapportområde 63–87 og eldre 146-siders negativ kontroll. Ingen av disse verdiene er parserregler.

## Tasks & Acceptance

- [x] Grafisk agent: lokal renderer/OCR og symbolbevis med generiske positive/negative tester og ekte perf-måling.
- [x] Koblingsagent: separate kilde-/sidekontrakter, sikker blokkparser og sammenslåing uten svekket kontrollport, med tester.
- [x] Visningsagent: kildeåpning, visuell fremdrift/usikkerhet og avstemt telling med unit/Playwright.
- [x] Hovedagent: integrer automatisk import, kjør ekte dokumenter og regresjon/build/lint/Playwright, uavhengig review, rett feil, prosessbevis og lokal commit med aktiv promptlogg.

Gitt et ekte dokument, når importen fullføres, skal visuelt støttede grader og beskrivelser kunne kontrolleres i originalen, mens ubehandlede/usikre sider er eksplisitte. Gitt manglende lokalt OCR-verktøy, når import kjøres, skal eksisterende tekstuttrekk virke og dekningen forbli ærlig. Gitt sammendrag og detalj, når de vises, skal sikre samsvar telles én gang og konflikter/ukjent identitet bevares.

## Implementation Notes

Forankring: forrige aksepterte tekniske leveranse, FR-7–FR-11/FR-18, Code First-design og faglærers krav om kilder/usikkerhet/dobbelttelling. Bestillingen utvider tidligere tekstbegrensning med lokal bildeanalyse. Ingen irreversible handlinger eller uavklarte produktvalg. Brukerens uttrykkelige bestilling autoriserer implementering og subagenter uten ny godkjenningsrunde; hovedagent integrerer parallelle, avgrensede oppgaver. Aktiv automatisk promptlogg er eneste endring ved start.

## Spec Change Log

## Review Triage Log

## Verification

Kjør Node 24, `npm test`, `npm run build`, `npm run lint`, Playwright med tom API-nøkkel og eksisterende Chromium. Kontroller originale private sider visuelt og aggregerte kilde-/dekningsresultater uten private utdrag i versjonerte bevis. Tre uavhengige BMAD-reviewlag gjennomgår samlet diff og rettingene etterprøves.


## Reviewrunde 1 – triage

Alle tre lag ble først avbrutt av leverandørens bruksgrense, deretter gjenopptatt og fullført uavhengig. Rekkefølgen og de konkrete funnene bevares her. Ingen av de første avbruddene regnes som godkjent review.

| ID | Dom og etterprøvbart grunnlag | Ruting |
| --- | --- | --- |
| B1 | high: selectorens offsetnøkkel kollapser tre offsetløse OCR-regioner ved blandet tekst-/bildedetalj. | patch: full kildeidentitet og selectorregresjon |
| B2 | medium: samme controlled-rad mister local-visual-kvalitet, avledet merking og visuell teller. | patch: bevar faktisk kildeopphav |
| B3 | high: fast 35 s OCR etter treg PDF.js kan overstige samlet 60 s og miste hele brukbart tekstresultat. | patch: før gjenværende frist gjennom eksisterende interne kall |
| B4 | high: 12 MiB OCR-utdata kan overskride 8 MiB sluttrespons med øvrig importinnhold. | patch: avgrens samlet respons; eksplisitt sidebortfall |
| B5 | medium: fullside-TG-token har egen boks, men sammenslått TG/komponentlinje kan ikke kobles. | patch: bevar separat komponentgeometri ved slik OCR-linje |
| B6 | high: innrykket/overbred linje filtreres før fullstendighetskontroll og avkortet avvik blir dokumentert. | patch: avvis blokk med utelatte mulige avvikslinjer |
| B7 | high: usikker andre komponentlinje forsvinner og gir feil positiv identitet. | patch: usikker fortsettelse sperrer koblingen |
| B8 | high: Sluk/Overflater gulv uten sted får identitet gjennom ufullstendig generisk svarteliste. | patch: krev positiv identitet for gjentakbare komponenter |
| B9 | medium: konsistent manipulerte OCR-referanser/regioner kan omgå parserens geometri i kontraktkontroll. | patch: samme geometriske validering på kontraktgrensen |
| B10 | medium: bare varme/grønne pikselkandidater mister eksplisitte gråtone-/svart-hvitt-/mørkerøde TG-badger. | patch: kandidat fra eksplisitt TG-token og geometri, aldri farge alene |
| B11 | medium: native tester bruker samme vektorfixture; faktisk rastervei mangler. | patch: generisk rasterisert fixture gjennom ekte import |
| V1 | medium: regionmarkering testes bare for synlighet, feil plassering ville bestå. | patch: relativ posisjon/størrelse, mobil/zoom |
| V2 | high: uavhengig reproduksjon av B1/B2 gjennom faktisk selector. | patch: samme rot, bevar alle regioner og kildeopphav |
| E1 | high: uavhengig geometrisk reproduksjon av avkorting ved innrykk, samme rot som B6. | patch: full blokk eller usikkerhet |
| E2 | high: offsetløse regioner tapes, samme rot som B1. | patch: full kildeidentitet |
| E3 | high: uavhengig Sluk-reproduksjon, samme rot som B8. | patch: positiv komponent-/stedsidentitet |

Brukerens oppdrag om å rette konkrete feil og ferdigstille funksjonen autoriserer disse rettingene innen samme kilde- og usikkerhetskrav. Det innføres ingen ny komplettgaranti.


Reviewnykontroll av B3/B4: Blindlaget godkjente fristdelingen etter 13 tester.
Det fant to nye konkrete kapasitetsfeil ved B4-etterprøving: bildebevis ble
først tilpasset før lagret økonomi ble lagt til, og fallback kunne overskride
budsjettet med seks byte mens gamle begrunnelser ble erstattet. Begge er
rettet: bildeanalyse/telling av respons skjer etter økonomitilleggene; fallback
bevarer alle gamle begrunnelser og returnerer originalt tekstgrunnlag når ingen
nye metadata får plass. Ny eksakt-budsjettprøve og alle 14 relevante tester
består; blindlaget godkjenner B4. Ingen kilde eller økonomi kuttes for OCR.


Andre nykontroll: verifikasjonslaget godkjenner V1/V2 etter faktisk selector-test
(15/15) og målt relativ regionplassering i Playwright (1/1). Kanttilfellelaget
godkjenner E1–E3 etter 67 tester. Blindlaget godkjenner B5/B6/B9/B10/B11
etter 79 unit- og seks faktiske native-prøver. Det fant to restfeil som
beholdes individuelt: B7 manglet navnefortsettelsesvakt når Beskrivelse-
etiketten manglet; B8 tillot stedløs Altan til tross for mulig gjentakelse.
Altan er fjernet fra unntaket, med positiv originalside-regresjon og 75
berørte tester. B7 sendes tilbake til parseragenten.

Native rasterprøvene avdekket at Vision ofte gir faktisk score 0,5 for lesbar
tekst uten PDF-tekstlag. Det innføres derfor separat linjeutsnitts-OCR med
bevart faktisk score og eksakt normalisert samsvar; terskler oppjusteres ikke.
Kontrakten avviser manglende, benektende eller motstridende utsnittsbelegg.
En ren rasterrapport med TG2/TG3 støttes dermed uten å gi OCR falske
PDF-tekstoffseter. Full sidekontroll hevdes fortsatt aldri.


Alle konkrete reviewfunn er etterprøvd som rettet. Blindlaget godkjenner også
B7/B8 etter siste direkte reproduksjoner og 56 tester. Ingen konkrete funn er
utsatt. Den selvpålagte 5-sekunders testen for ukjent prospekthash fikk samme
60-sekunders øvre frist som faktisk lokal import etter at OCR ble integrert;
produktets importfrist er uendret. Sluttregresjon består: 1883/1883 tester i
93 filer, inklusive seks faktiske native-integrasjonstester. Build/typecheck
og lint består; Vite har kun eksisterende varsel om stor bundle.

Endelig ekte kjøring: 25/25 rapportbilder, 14,6 sekunder, ti kildebelagte TG2-
detaljer på fysisk 71,72,73x2,75x2,76,77,79,82. Tretti visuelle originalregioner
og 104 ordrette PDF-tekstbelegg er kontrollert. Ingen ekte TG3 er verifisert;
TG3-raster/vektor verifiseres med generiske faktiske OCR-prøver. Alle 25 sider
forblir usikre samlet; avvik over side-/kolonneskift og ukjente oppsett kan
mangle. Én entydig sammendrag/detalj samles; alle 23 sammendragsbelegg bevares
og ukoblede sammendrag inngår ikke i detalj-/problemtellingen.

Matrisen er testet: native vektor/farge/svarthvitt/mørkerød/inline-navn i
`local-visual-native.test.ts`, usikkert symbol/tekst/fortsettelse/geometri i
`visual-technical.test.ts`, ressursgrenser i `visual-import.test.ts` og
`local-visual-ocr.test.ts`, samling/ulike steder i `technical-reconciliation.test.ts`
og faktisk selector i `property-risk.test.ts`. Originalside/region/tastatur,
mobil og zoom dekkes i `property-risk.spec.ts`. Alle unit-/native-prøvene
inngår i godkjent fullsuite. Sluttresultat for nettleserprøvene registreres i
[økten](../process/arbeidsokter/2026-11-03-grafisk-tg-analyse.md).


Nettleseraksept: alle 39 scenarioer har gyldig bestått kjøring (38 i samlet
runde og én isolert nykjøring etter ENOENT ved delte Playwright-sporfiler).
Tre dev-prøver, målt regionplassering og ekte originalprøve mot oppdatert
port 3000 består. Ingen konkrete reviewfunn står åpne. Generell TG-recall og
fortsettelser forblir eksplisitt ufullstendige og PAA-SO2 forblir åpen.
