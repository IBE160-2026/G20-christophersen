---
title: 'PAA – stabilisering og endelig funksjonskontroll'
type: 'bugfix'
created: '2026-11-05'
status: 'done'
route: 'dispatch'
baseline_commit: 'e0ad095c5a9410886ee94e3897cae3552284a7f0'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="Brukerens uttrykkelige bestilling om full gjennomføring uten mellomstopp">

## Intent

En vanlig bruker skal kunne åpne localhost:3000, importere ekte salgsoppgaver gjentatte ganger og se kildebelagt bolig-, økonomi-, leie- og risikoinformasjon. Importfeilen etter omtrent 20 sekunder skal ha dokumentert rotårsak før retting. Godkjenning gjelder synlig fungerende bachelorprototype innen testomfanget.

## Boundaries & Constraints

Bevar Konsept A, kontrollporter, kildehenvisninger, ukjente kostnader og ærlig ufullstendig teknisk dekning. Ingen betalte AI-kall, push, private PDF-er eller hemmeligheter i Git. Fire fagagenter: import, datakvalitet, frontend og uavhengig QA. Hovedagent integrerer og tar ansvar for faktisk sluttresultat. Brukerens spesifikke organisering og forhåndsautoriserte arbeid går foran generiske ekstra agent-/godkjenningssteg i byggferdigheten.

## I/O & Edge-Case Matrix

| Tilstand | Handling | Synlig forventning |
| --- | --- | --- |
| Ny oppstart | Nøstegaten, 152 sider | Automatisk bolig/økonomi, leiereferanser og ærlig risiko |
| Samme nettleserøkt | Nøstegaten igjen, så Rostockgata | Begge fullfører; ingen gamle eiendomsdata eller scenarier lekker |
| Ny oppstart | Rostockgata, 170 sider | Samme dokumenterte opplysninger og tilgjengelig analyse |
| Fortsatt bruk | Ytterligere én opplasting av hver | Fullfører uten omstart/manuelle inngrep |
| Leiescenario | Slider og reset på desktop/mobil | Umiddelbar korrekt yield/netto; brukerleie atskilt fra referanse/fakta |
| Ugyldig faktisk PDF | Opplasting, så nytt forsøk | Forståelig feil og vellykket gjenoppretting i samme app |

Kontrollverdier: Nøstegaten 4 050 000 kr, 40 m², 2 rom/1 soverom, fellesutgifter 1 020 kr/mnd, fellesgjeld 0, kommunale avgifter 12 957 kr/år, Hybel/Menon 13 891 og SSB 12 000 kr/mnd. Rostockgata 8 600 000 kr, 59 m², 3 rom/2 soverom, fellesutgifter 3 660 kr/mnd, dokumentert fellesgjeld 0, Hybel/Menon 20 426 og SSB 18 900 kr/mnd. Verifiser faktagrunnlag på fysiske originalsider.

</frozen-after-approval>

## Code Map

- `src/backend/http/import-route.ts`, `run-import.ts`: HTTP-frist, isolert import, duplikater og prosessopprydding.
- `src/backend/documents/`: PDF.js-/native OCR-faser og minnevern; nylig minnearbeid er dokumentert i [tidligere økt](../process/arbeidsokter/2026-11-05-robust-pdf-minne.md).
- `src/backend/import/`, `src/backend/rent/`, `src/domain/`: deterministiske felt, risiko, publiserte referanser og finans; endres bare ved konkrete påviste feil.
- `src/frontend/investment/`, `src/frontend/App.tsx`, `src/frontend/state/`: Konsept A, scenario, navigasjon og objektbytte.
- `tests/e2e/rent-real-document.spec.ts`: tidligere ekte HTTP-prøver med egen side per test og ny server per testkjøring. Dekker ikke seks sammenhengende opplastinger mot en eldre prosess.
- `tools/`: reproduserbar sluttkontroll med ekte server, ingen API-stubber, private skjermbilder og offentlig persondatafri resultatsammendrag.

## Tasks & Acceptance

- [x] Dokumenter eksisterende prosess, faktisk feil, rotårsak og nødvendig backendretting.
- [x] Kontroller originalsider og automatisk datakvalitet for begge dokumenter.
- [x] Lever slider/reset, scenariomerking og fungerende sentrale kontroller.
- [x] Kjør alle seks ekte opplastinger samt slider, navigasjon, mobil og reell feil/gjenoppretting.
- [x] Kjør build, lint og relevante regresjoner; uavhengig QA vurderer synlig resultat og kode.
- [x] Oppdater README, sentral utsattoversikt og øktbevis, commit lokalt med aktiv promptlogg.

Gitt begge private originaler, når brukeren følger matrisen i faktisk localhost:3000 med ekte backend, skal alle synlige kontrollverdier og beregninger stemme. Gitt ufullstendig risiko/kostnad, skal UI fortsatt vise begrensningene. Gitt ett manglende kriterium, skal sluttrapporten si IKKE GODKJENT. Bare fullført matrise og uavhengig bekreftelse gir GRØNT LYS.

## Implementation Notes

Starttilstand: ren arbeidskopi bortsett fra aktiv promptlogg. Eksisterende Node 24.21.0-server PID 17753 startet før dagens siste endringer; lokal API svarer utenfor sandbox. Standard shell velger feil Node 26.8.1, derfor brukes prosjektets tilgjengelige Node 24.21.0 ved verifikasjon. Ingen konklusjon om feilårsak før målt reproduksjon.

Sluttutfall: [GRØNT LYS med avgrenset testomfang](../process/arbeidsokter/2026-11-05-paa-stabilisering.md). Foreldet parent-kontrakt er dokumentert ved umodifisert A/B-test. Alle 11 obligatoriske hovedkontroller og seks uavhengige QA-delprøver består. Full regresjon: 2171 bestått, 7 eksisterende native-skip; berørt Playwright: 33/33. Ingen generelle historiske kvalitetssaker lukkes. Lokal commit med aktiv promptlogg; ingen push/betalt kall/private PDF-er i Git.

## Spec Change Log

## Review Triage Log

| Funn | Vurdering | Avgjørelse og verifikasjon |
| --- | --- | --- |
| QA: sluttkontroll bruker ikke-eksisterende PDF-sideinput og mangler synlige beløpsassertions | medium | Rettet til fysisk data-attributt og synlig status, synlige bolig-/økonomiverdier lagt til. Hele matrisen bestått. |
| QA: gammel SSB-årstekst ved brukerleie/reset | medium | Rettet til eget scenarioår, publisert kildeperiode og eksplisitt fravær av prisjustering; egen QA med desimalleie/reset bestått. |
| Hovedkontroll: statuslokator treffer både import og FINN | medium | Kontrollskriptet avgrenset til importens aria-live. Første mislykkede harnessforsøk bevart; hele ny matrise bestått. |
| QA: forventet automatisk kontantbehov før inkludering var avklart | false | UI viste ærlig ukjent. Etter faktisk kildekontroll i brukergrensesnittet beregnes 4 152 340 kr og korrekt annuitet. Feil testantakelse arkivert, produktkode uendret. |

## Verification

- Node 24.21.0: `npm run build`, `npm run lint`, `npm test` og målrettet Playwright.
- Ekte godkjenningsmatrise kjøres på localhost:3000 uten mockede API-svar. Resultattekster, originale kilder, fysisk rendering, beregningsfasit og mobile interaksjoner inspiseres.
- Private originaler og skjermbilder blir i ignorert `private/`. Kjørbar kontrollkode og persondatafritt resultat dokumenteres i repoet.
