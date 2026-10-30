---
title: Konsept A i fungerende PAA
created: 2026-10-30
type: feature
status: done
route: dispatch
baseline_commit: 06d8962a5fc5812b4b76c35e8a4798cd1d5f473e
review_loop_iteration: 0
context: [AGENTS.md]
---

<frozen-after-approval reason="Mads godkjente konsept A og implementering 2026-10-30">

## Intent

Erstatt administrasjonspreget hovedflate med den godkjente lyse eiendoms- og investeringsopplevelsen i [konsept A](../planning-artifacts/ux-designs/ux-IBE160-2026-10-30/mockups/konsept-a.html). Lever fungerende opplasting, analyse, økonomi og kontroll i eksisterende app.

## Boundaries & Constraints

Bevar PDF som hovedinngang, FINN-feltets eksisterende backendport, rapport-/TG3-/kildekontroll, eksakt finans, uavhengig gyldighet per nøkkeltall og historiske resultater. Vis faktiske dokument-/brukerdata og eksplisitte mangler. Ingen eksempeladresse, illustrasjonsfoto eller hardkodet eksempeløkonomi i produktet. Ingen betalte kall, push eller nye agentmoduler. Brukerens implementerings- og commitgodkjenning gjelder denne fasen.

## I/O & Edge-Case Matrix

| Tilstand | Handling | Resultat |
| --- | --- | --- |
| Tom økt | Åpne app | PDF-inngang og ukjent økonomi, ingen eksempelverdier |
| Gyldig PDF | Last opp | Eksisterende import, kildebundet adresse/pris og tydelig dekning |
| Manglende/motstridende verdi | Vis økonomi | Avhengige tall/grafer utilgjengelige; ukjent blir aldri null |
| Gyldig scenario | Endre egenkapital/rente/løpetid | Oppdatert kontantstrøm/graf; yield uendret; ingen bekreftelse eller endret screening |
| Ugyldig scenario | Tøm felt eller overskrid grenser | Forklaring, ingen foreldede grafdata |
| Endret objekt | Ny PDF/FINN-identitet | Gammel identitet/bilde/scenario brukes ikke på nytt objekt |
| Rapportkontroll | Åpne fordypning | Samme kilder, kontrollbindinger og separate TG3-avklaringer |

</frozen-after-approval>

## Code Map

- `src/frontend/App.tsx`: reducer, klientlivsløp og gjeldende kontrollflyt beholdes; hovedflate komponeres på nytt.
- `src/frontend/screens/ProspectusImport.tsx`, `FinancialInput.tsx`, `ReportAnalysis.tsx`, `ScreeningResult.tsx`: eksisterende handlinger gjenbrukes i fordypning.
- `src/frontend/state/session.ts`, `import-session.ts`, `result.ts`: autoritativ state/bekreftelse/historikk bevares.
- `src/domain/financing.ts`, `source-economy.ts`, `document-import.ts`: autoritet for annuitet, kildeøkonomi og import.
- `src/frontend/pdf/PdfViewer.tsx`: lokal PDF.js, originalbytes og cleanup som referanse.
- `tests/e2e/`, `tests/unit/`: funksjonelle regresjoner og nye scenariotilfeller.

## Tasks & Acceptance

**Execution:**
- [x] `src/frontend/investment/` og `App.tsx`: ny hovedflate/fordypning med ekte data. Hovedagent integrerer.
- [x] `src/frontend/investment/concept-a.css`: agent design_direction eier visuell stil; bruker konseptets komposisjon, serif, papirhvit/grønn, bildehero, åpen KPI-rad og finansiering venstre/graf høyre.
- [x] `src/domain/financial-scenario.ts`, `src/frontend/state/scenario.ts`, `src/frontend/investment/ScenarioChart.tsx`, tilhørende nye tester: agent ui_audit eier isolert scenario og tilgjengelige grafer. Big.js før visningskoordinater; ingen reducerdispatch/bekreftelse. Vis gjeld, akkumulert konstant kontantstrøm og rentesensitivitet med forklaring, nullinje og tabell.
- [x] `src/frontend/investment/PropertyImage.tsx` og tilhørende nye tester: agent technical_preservation eier lokal, avgrenset originalbasert bildevisning. Finn stort raster fra første sider når sikkert tilgjengelig; ellers originalside/ukjent. Merk dokument/side og mulig uidentifisert motiv, aldri eksternt illustrasjonsfoto. Avbryt og rydd ved bytte/unmount; ingen nettverksbilder.
- [x] `tests/e2e/`, prosess-/reviewdokumenter og README: oppdater navigasjonstester til ny brukerflyt, dokumenter validering og lokal commit med promptlogg.

**Acceptance Criteria:**
- Gitt desktop og mobil, når hovedflaten åpnes, så følger komposisjon og typografi konsept A uten horisontal scrolling.
- Gitt importert dokument, når bruker åpner økonomi/risiko/kilder, så er verdier og mangler sporbare til gjeldende økt.
- Gitt scenarioredigering, når en kontrollert vurdering finnes, så forblir den uendret og tydelig atskilt fra simuleringen.
- Gitt eksisterende offline kontrollflyt, når alle krav oppfylles eller mangler finnes, så gjelder samme finans-/screeningregler og sperrer som før.

## Implementation Notes

Ferdig implementert og visuelt kontrollert i Chromium. Se [sluttverifikasjon](konsept-a-verifikasjon.md) for testresultater, I/O-matrise, bevis og bevarte porter. Ingen produktstandarder bruker designskissens eksempeldata.

Brukerens uttrykkelige godkjenning erstatter ekstra spekgodkjenning. Kjente ubekreftede designfiler og aktiv promptlogg videreføres som autorisert prosessevidens. Bruker ber om uavhengig parallelt arbeid; avgrensede fileiere over erstatter workflowens generiske sekvensielle dispatch. Ingen irreversible handlinger utover autorisert lokal commit. Underliggende import er code-first offline og beholdes med synlige semantiske begrensninger.

## Spec Change Log

2026-10-30: Reviewrettinger bevarer hovedkomposisjon og finansmotor. FINN-klient eies av App, kildesnarveier følger sourceTarget, og ny bildeport håndhever kumulativt rasterbudsjett. Ingen endring i godkjent intensjon.

## Review Triage Log

Alle 16 funn er verifisert før gruppering. B4/E3 deler årsguard, men beholdes separat. Ingen uavklarte intensjonsvalg eller nye funksjonsmål.

| ID | Funn | Vurdering og håndtering |
| --- | --- | --- |
| B1 | Risikosnarvei validerte ikke originalhash/dokument | high / patch. Eksisterende sourceTarget brukes; ukjent/feil kilde gir eksplisitt melding og ingen gjettet side. |
| B2 | FINN-request kunne avbrytes ved fordypningsnavigasjon | medium / patch. ListingClient eies nå av App, med objektgenerasjon og unmount som avbruddsgrenser. |
| B3 | Ingen headingfokus ved ny kontrollflate | medium / patch. Fokuserer heading ved mount; eksisterende trinnfokus bevares. Rettet ved integrasjonskontroll før reviewtriage. |
| B4 | Forutsetningsdialog aksepterte år 0000 | medium / patch. Positivt firesifret år kreves før noen dispatch. Samme rotårsak som E3. |
| B5 | Valgt rente5.04 ble vist som5.0 | medium / patch. Etiketter/tabell bevarer kanonisk presisjon; ingen sammenfall med5.0-raden. |
| B6 | Risiko viste ikke konkrete analysebegrensninger | medium / patch. Uttrekksbegrensninger, tekniske usikkerheter og dekningsårsaker vises i fordypningen. |
| B7 | Avklart TG3 ble omtalt som alltid uavklart | medium / patch. Status leses med eksisterende validateTg3Resolution og brukeroppgitt grunnlag navngis. |
| B8 | Bildepreview hadde bare grense per raster | medium / patch. Dedikert lokal preview-worker håndhever kumulativ mottaksgrense; sidecache ryddes. Native dekoding har ikke hard OS-RAM-garanti. |
| B9 | FINN-finansiering ble ikke valgt som scenariostart | medium / patch. Fallback følger faktisk importkilde; separate scenarioutkast beholdes fortsatt uten bekreftelse. |
| B10 | Tastatursperre og tilgjengelig grunn for låste trinn var fjernet fra testen | medium / patch. Enter/Space og tilgjengelig beskrivelse gjeninnført; samme funksjonelle forventning. |
| E1 | Gammelt resultat/TG-count kunne vises under mislykket nytt filvalg | high / patch. Property-, scenario- og vurderingsgrunnlag deler gjeldende importgrense; gammel vurdering vises ikke som gjeldende. |
| E2 | Endelige Number-verdier kunne bli Infinity etter aksepadding | medium / patch. Endelig aksedomene/range valideres før SVG/etiketter; eksplisitt visningsgrense. Økonomiske strenger bevares. |
| E3 | År0000 overskrev gyldig grunnlag | medium / patch. Verifisert mot periodedomenet, samme løsning som B4; beholdt som selvstendig funn. |
| E4 | Offlineetikett/.meta forsvant fra kontrollheader | medium / patch. Faktisk lokal manifeststatus og kompatibel semantisk header-hook gjeninnført. |
| V1 | Ingen uavhengig mellomliggende lånesaldo i test | medium / patch. År 1 fasit2035224.42 ved5.5%,300m,2075000lån og12742.32termin testes; Python Decimal recurrence brukt uavhengig. |
| V2 | Grafens tastaturhandlinger var bare markup-testet | medium / patch. Nettlesertest trykker ArrowRight/End og inspektørens ArrowLeft og kontrollerer valgt fane, fokus og endret verdi. |


## Design Notes

Scenario er lokal uautoritativ aritmetikk med opphav/år og mangler, aldri en falskt bekreftet FinancialInput. Akkumulert kontantstrøm er ikke totalavkastning; restgjeld gjelder privat lån. Faktisk PDF-innhold erstatter konseptets illustrasjon; motiv og metadata gjettes ikke.

## Verification

`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, komponent-/E2E-tester og BMAD-review. Visuell nettleserkontroll ved desktop/mobil med ekte lokal import; ingen eksterne kall. Reviewfunn rettes før lokal commit.
