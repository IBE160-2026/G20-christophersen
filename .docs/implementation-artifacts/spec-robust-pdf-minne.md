---
title: 'Robust PDF-behandling under 512 MiB'
type: 'bugfix'
created: '2026-11-05'
status: 'done'
route: 'dispatch'
baseline_commit: '9280d8bf8ed15782edb2e8e52a0b13cf81f57f3b'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="Brukerens konkrete gjennomføringsbestilling 2026-11-05">

## Intent

**Problem:** Ekte Nøstegaten 65 A (152 sider, 47 605 890 bytes) stopper med memory-limit til tross for 20-sidersgrupper. Samlet RSS vokser fra formatfasen inn i første tekstgruppe, og bruker mister hele importen.

**Approach:** Mål fase og side, fjern unødvendige PDF-/dekoderkopier og begrens parserressurser. Bevar original, tekst, kilder og alle sideposter; vis usikkerhet når valgfritt arbeid ikke kan fullføres. Verifiser begge ekte dokumenter gjennom brukerflyten.

## Boundaries & Constraints

**Always:** Behold 512 MiB RSS og 256 MiB heap, alle fysiske sider og originale kildeoffseter. Bevar økonomi, leieagent og teknisk analyse. Sekvensiell eller strengt begrenset parallellitet; await avslutning før neste parser. Minnebevis skal skille RSS/heap/eksterne buffere og lokal OCR-prosess. Oppretthold eksisterende tids-, tekst- og svargrenser. Bruk autorisert lokal commit med aktiv promptlogg.

**Never:** Ingen betalte AI-kall, push, private originaler eller private tekster i Git. Ingen utvidelse av analyser eller oppdiktet fullstendig teknisk dekning. Ikke hevde universell minnegaranti fra to dokumenter.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Ekte originaler | Nøstegaten / Rostockgata | Hele sidekartet og kildebelagte analyser under dagens grense | Eksplisitt usikker teknisk dekning beholdes |
| Kostbar sideoperasjon | Parser bruker ressursbudsjettet | Fullførte sider og tekst bevares, manglende sider har tydelig begrunnelse | Ingen grønn dekning for manglende kontroll |
| Feil svar / ugyldig format | Brutt workerprotokoll / container | Kontrollert avvisning | Ingen feiltolket grønt resultat |
| Tekstgrense | Over 128 KiB/side eller 1 MiB totalt | Eksisterende text-limit-avvisning | Ingen skjult tekstkutting |

</frozen-after-approval>

## Code Map

- `src/backend/http/run-import.ts`: importbarn, 256 MiB heap, RSS-vakt 512 MiB/100 ms, lukking og global lås i import-route. Utvid med valgfri persondatafri målecallback; ingen måletekst fra PDF.
- `src/backend/http/import-child.ts`: opplastet bytes holdes til validering er ferdig; sekvens format → uttrekk → lokal analyse → lagret økonomi → visuell analyse → serialisering.
- `src/backend/documents/validate-pdf.ts`, `count-pdf-pages.ts`: separate parserworkere, kopierer hele PDF-en per fase. Snapshotkontrakten må bevares. Importprofil kan bruke én privat SharedArrayBuffer-snapshot, som deles kun lesende med interne workere. Offentlig containerloader trenger egen overførbar kopi.
- `src/backend/documents/extract-import.ts`: 20 sider per worker, hver med komplett kopi. Shared original kan fjerne kopien per gruppe. Ressursfeil krever bevaring av ferdige sider; andre protokollfeil avvises.
- `src/backend/documents/pdf-extraction-worker.ts`: tekstinspeksjon, tekstuttrekk, rasterinspeksjon og cleanup per side. `getBytes(1 MiB + 1)` preallokerer minst 2 MiB selv for små DecodeStreams; les med små inkrementer og fjern kopier som ikke trengs. Mål hver operasjon og send ferdige sideposter fortløpende.
- `src/backend/documents/pdf-extraction-core.ts`: ASCII85 har ubegrenset number-array før Flategrensen; begrens hvert dekodertrinn og bruk kompakt buffer. Bevar tekstoffseter.
- `src/backend/documents/local-visual-ocr.ts` / `.swift`: separat lokal OCR-prosess, allerede sekvensiell/autoreleasepool og kontrollert delresultat. Mål denne separat; aldri rapporter Node-RSS som total for begge prosesser.
- `tests/unit/import-worker-lifecycle.test.ts`, PDF-integrasjon og `tests/e2e/rent-real-document.spec.ts`: gjenbruk relevant regresjon og ekte Rostockgata-flyt. Private Nøstegaten-original er `private/incoming/nostegaten-65-a.pdf`.

## Tasks & Acceptance

**Execution:**
- [x] `src/backend/documents/` og `src/backend/http/` — legg inn avgrenset fase-/sidemåling, reduser kopier og dekoderallokeringer etter målt årsak, og bevar delresultater ved ressursfeil.
- [x] `tests/unit/`, `tests/integration/` — målrettet livssyklus-/ressursregresjon og eksisterende relevante kontroller, uten å erstatte ekte gjennomføring med syntetiske tester.
- [x] `tests/e2e/rent-real-document.spec.ts` — gjennomfør Nøstegaten og Rostockgata med ekte originaler, kildeåpning, økonomi/leie/teknisk status og mobilvisning; behold private bevis ignorert.
- [x] `.docs/process/arbeidsokter/2026-11-05-robust-pdf-minne.md` — dokumenter målt før/etter, faktisk årsak, begrensninger og testutfall. Oppdater sentral deferred-work bare for gjenstående relevant arbeid.

**Acceptance Criteria:**
- Gitt ekte Nøstegaten fra opplastingen, når baseline kjøres, så reproduseres memory-limit med faselogger; dette er allerede bekreftet.
- Gitt begge ekte originaler, når rettet fullflyt kjøres, så fullføres import under 512 MiB med tydelig målt sikkerhetsmargin og komplett fysisk sidekart.
- Gitt ressursbegrenset parseroperasjon, når arbeidet avbrytes kontrollert, så beholdes fullførte sider og manglende kontroll får fysisk side og årsak.
- Gitt eksisterende regne-/kildekontrakter, når regresjon kjøres, så beholdes økonomi, leie og sperre for ufullstendig teknisk analyse.

## Implementation Notes

- Baseline målt med Node 24.21.0: ekte runImport stopper med memory-limit etter ca. 1,2 s. Persondatafri privat fasediagnose: container 360,08 MiB, sidetre 409,50 MiB, første tekstgruppe 515,88 MiB; importbarnets heap 20,63 MiB og arrayBuffers 136,40 MiB ved siste topp. Separat ugrenset diagnose fullførte 152 sider/153 005 tegn, men nådde 600,70 MiB. Disse er diagnosebevis, ikke fungerende produktflyt.
- Ingen uløste intensjonsvalg eller irreversible handlinger. Bruker ber uttrykkelig om gjennomføring og lokal commit; ekstra godkjenningsrunde for plan innføres ikke.
- Kursforankring: sensorveiledningens kildeuttrekk/reconcile-sensorveiledning og faglærertilbakemelding krever sporbarhet, realistiske tester og ærlige begrensninger; ingen nye produktkrav er utledet.

- Endelig implementasjon: strømmet stdin til ett eid delt originalgrunnlag; lazy offentlig loader og avgrenset containerfontmiljø; kompakte, avgrensede dekodere; 256/16 MiB parserheap med tidligere GC; dynamisk workerlevetid og 448 MiB mykt parservern. Hovedgrensen er uendret 512 MiB / 256 MiB heap.
- Sluttmåling: Nøstegaten 358,44 MiB / 19,34 s / 152 sider / 153 005 tegn; Rostockgata 336,55 MiB / 13,89 s / 170 sider / 293 168 tegn. Ingen ressursavbrutte tekstsider; OCR 16/16 og 19/19. Sidekartet for Rostockgata er identisk med baseline, også status/årsak/raster.
- Separat native OCR 314,97/322,67 MiB; samplet samtidig sum ca. 544/599 MiB. Dagens 512 MiB-vakt er per Node-importprosess, ikke samlet prosesskvote. Dette må ikke fremstilles som samlet minnegaranti.
- Nøstegatens eksisterende ukjente lesbarhet skyldes /OCProperties. Hele teksten bevares, men ingen oppgradering av lag-/økonomi-/leie-/teknisk status. Ny forklaring gjør manglende lagkontroll konkret. Åpent kvalitetsarbeid er ført i sentral deferred-work.
- Ekte nettleserprøver: tidligere enebolig, gratis positiv SSB-leilighet og Rostockgata bestod første runde. Nøstegaten bestod ny avgrenset prøve etter retting av tvetydig testlokator; tekstfasit, rapportkildeåpning og mobil kontrolleres. Build/lint består. Full regresjon: 2 120 bestått, 7 eksisterende native-skip, 103 testfiler, 82,28 s. Uavhengig review følger i prosessrapporten.

## Spec Change Log

- Reviewpresisering 2026-11-05: kontrollerte ressursutfall skal også bevare tekstchunks levert før en side er ferdig, senere gjenfunnet vedleggsmetadata og sideprefiks etter gjentatt oppstarts-OOM. Sluttsvaret kan ikke erstatte ventende tekst. Behold (KEEP) eid buffer, avgrenset ung heap, fontbegrensning, alle originaloffseter og virkelig dokumentfasit. Måleverktøyets faktiske filsti og sene native målinger må valideres. Dette presiserer eksisterende intensjon; ingen endring i den frosne brukerbestillingen.

## Review Triage Log

| ID | Vurdering | Bevis og håndtering |
| --- | --- | --- |
| B1 | medium, patch | `extractPage` mottar PDF.js-chunks før workeren publiserer hel sidetekst; et senere OOM kan derfor miste allerede levert tekst. Send avgrensede inkrementelle tekstchunks og bevar dem som ufullstendige ved ressursavbrudd. |
| B2 | medium, patch | Første worker kan OOM før vedleggsmetadata; `startPage === 0` forkaster metadata som senere worker faktisk leser. Skill ukjent metadata fra bekreftet tom liste og behold første verifiserte metadata. |
| B3 | medium, patch | OOM før første operasjon starter neste worker ved neste side uten å begrense gjentatt parserinitialisering. To påfølgende oppstartsavbrudd må gi eksplisitte usikre restposter med bevart kjent prefiks, ikke spise hele tidsbudsjettet. |
| B4 | medium, patch | Sluttsvar valideres mot fullførte sider, men ikke `pending`; tidligere levert tekst kan dermed erstattes/utelates av et brutt svar. Sluttsvar må bevare ventende fysisk side og eksakt tekst. |
| B5 | medium, patch | Lifecycle-testene utløser bare worker-OOM, ikke det faktiske tidlige RSS-intervallet. Legg til deterministisk RSS-vaktprøve med avslutning før videreføring. Samme testgap som V1. |
| B6 | medium, patch | Nøstegaten-E2E teller 16 poster, som også opprettes ved utilgjengelig OCR. Krev faktisk rasterDigest, feilfri lesing og tekstlinjer på alle 16 sider, som på Rostockgata. |
| B7 | medium, patch | `currentImportContext` / ImportClient gjenbruker samme hash med v1, mens ressurs-/dekodersemantikk endres. Versjoner uttrekket til v2 og avvis v1 som gjeldende kontekst uten å endre kildeoffseter eller historiske arkiver. |
| B8 | medium, patch | Måleverktøyets leksikalske private/-sjekk følger symlink uten faktisk stisjekk. Sjekk realpath og opprett nye, eksklusive resultater slik at private tekster ikke skrives utenfor grensen. |
| B9 | low, patch | `writeFile` har standard filmodus selv om eksisterende resultatmappe kan være åpen. Eksplisitt 0600 på nye målefiler er en direkte korrigering; eksisterende mapper trenger ikke omkonfigureres. |
| B10 | medium, patch | En allerede planlagt ps-callback kan kjøre etter OCR-end og gi feil samplet samtidighet. Én avsluttet-tilstand skal undertrykke sene målinger og dobbel finish. |
| E1 | medium, patch | Uavhengig edge-case-review bekrefter B4: endelig svar kan erstatte/utelate pending tekst. Samme konkrete kontrollretting, separat registrert funn. |
| R2 | medium, patch | Faktisk V8-probe viser at Node-CLI 256 overstyrer ønsket worker-old128 selv med tom execArgv. Behold sannferdig gammel256/ung16, mål effektiv heapLimit og test arvet CLI; ikke hevde en uvirksom 128 MiB-grense. |
| R1 | low, patch | Visuell kontroll viste at felles lagbegrunnelse bare var tilgjengelig i detaljkontroll, mens økonomipanelet hadde en generell melding. Vis felles faktisk sidebegrunnelse direkte og presiser at rapport-OCR er separat fra økonomiens tekstgrunnlag; ekte Nøstegaten-E2E krever dette. |
| V1 | medium, patch | Verifikasjonsreview påviser at ingen test starter `resourceLimitBytes`-timeren. Testen skal utløse RSS-grensen uten workerfeil og sjekke tekst, vedlegg, siderekkefølge og await terminering. Samme testarbeid som B5. |

## Verification

- `npm run build`, `npm run lint`, `npm test` med Node 24.21.0 og tom AI-nøkkel.
- Ekte private faseprober og Playwright-flyt med dagens minnevakt, gratis SSB og blokkerte betalte ruter.
- Sammenlign sidekartets tekst/status/raster mot baseline; dokumenter nødvendige statusendringer ærlig.


## Endelig verifikasjon

- Etter reviewrettinger: build og lint bestått; `npm test` 2 133 bestått, 7 eksisterende native-skip, 105 filer, 82,00 s.
- Samlet Playwright: 4/4 bestått uten skip, 1,1 min. Begge bestilte ekte dokumenter, tidligere enebolig og positiv faktisk gratis SSB-prøve. Nøstegaten 21,4 s, Rostockgata 20,3 s inkludert kilde-/UI-kontroll.
- Hele Rostockgata-sidekartet (tekst/status/årsak/raster) og økonomiverdiene er identiske med `9280d8b`; Nøstegaten har identisk tekst-digest og originale offseter.
- Alle reviewfunn er rettet. Separat ny edge-case-kontroll av sluttprotokollen er uten konkrete restfunn. Ingen nye åpne implementasjonsfunn; eksisterende lag-/TG-/modell-/prosesskvotegrenser er eksplisitte i sentral oversikt.
- Lokaldemo på port 3000 er kontrollert restartet i riktig repo, Node 24.21, demo og tom AI-nøkkel. Helse-/konfigurasjonssvar HTTP 200. Ingen push, betalte AI-kall eller private dokumenter i Git.
