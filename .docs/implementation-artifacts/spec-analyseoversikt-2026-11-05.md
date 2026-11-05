---
title: Oversiktlig analyse i Konsept A
type: feature
created: 2026-11-05
status: done
route: dispatch
baseline_commit: 4917264353e24e77fb121f6a66ba2c81cb8b2cc6
review_loop_iteration: 0
context: [AGENTS.md]
---

<frozen-after-approval reason="Brukerens konkrete implementeringsoppdrag 5. november 2026">

## Intent

Gjør den eksisterende analysen lett å lese og demonstrere. Bevar Konsept A med samme farger, typografi og grunnuttrykk. Vis bolig, samlet økonomi, juridiske forhold, teknisk tilstand og dokumentasjon i den rekkefølgen. Tall og konklusjoner kommer før forklaringer.

## Boundaries & Constraints

PDF er eneste synlige inngang. FINN-backend beholdes. Leieslider, reset, finansiering, eksakt aritmetikk, originale kilder og kontrollporter bevares. Hybel/Menon omtales som publisert statistisk referanse; SSB beholdes i beregningsgrunnlaget og detaljer. Manglende drift, uavklart inkludering, ufullstendig dekning og faktisk risiko må fortsatt fremgå.

Hovedbilde må ha et konservativt grunnlag i originalens eiendomsforside. Største raster alene er utilstrekkelig. Ved svak identifikasjon brukes nøytral plassholder, uten nettbilde. Funn skal navngi dokumentert rom/bygningsdel og forhold når kildene tillater det; ingen gjetning. Spørsmål alene er ikke dokumenterte avvik.

Ingen betalte AI-kall, push, private PDF-er i Git, nye datakilder, agenter i produktet eller større analysemodeller. Bruk to utviklingssubagenter med avgrenset eierskap. Hovedagent integrerer, tester, dokumenterer og committer lokalt med aktiv promptlogg.

## I/O & Edge-Case Matrix

| Tilstand | Handling | Forventning |
| --- | --- | --- |
| Ekte salgsoppgave | Last opp Nøstegaten og Rostockgata | Gjeldende objekt, kildebelagte tall og eksplisitt ufullstendighet |
| Uegnet/ukjent foto | Vis hero | Nøytral plassholder, originalen tilgjengelig |
| Leiescenario | Endre slider og reset | Umiddelbar korrekt økonomi og opprinnelig referanse ved reset |
| Begrenset dokumentasjon | Vis risiko | Konkrete funn der belegg finnes, ellers nødvendig usikkerhet |
| Desktop/mobil | Naviger og åpne detaljer | Riktig rekkefølge, ingen overlapp/horisontal rulling, kilder tilgjengelige |

</frozen-after-approval>

## Code Map

- `src/frontend/investment/InvestmentOverview.tsx`: komposisjon, nåværende FINN-felt og dialoger.
- `DocumentEconomy.tsx`, `RentEstimatePanel.tsx`, `RentScenarioControls.tsx`, `ScenarioFinancing.tsx`, `RiskOverview.tsx`, `concept-a.css` i samme mappe: eksisterende økonomi, kontroll og visuell stil.
- `src/frontend/ControlWorkspace.tsx` og `screens/FinancialBasisInput.tsx`: eventuelle sekundære synlige FINN-innganger.
- `src/frontend/investment/PropertyImage.tsx`, `property-image-policy.ts`: størst raster blant første tre sider er feil utvelgelseskriterium; ressursgrenser og cleanup gjenbrukes.
- `src/backend/import/legal-risk.ts`, `technical-risk.ts`, `technical-summary.ts`, `technical-interpretation.ts`: eksisterende deterministiske funn, kildeobjekter og generiske titler.
- `src/backend/import/semantic-adapter.ts`, `src/backend/server.ts`: faktisk AI-ruting og porter undersøkes uten livekall.
- `tests/unit/`, `tests/components/property-image.spec.ts`, `tests/e2e/`: bevar finansfasit, oppdater berørte visningsforventninger.

## Tasks & Acceptance

**Execution:**
- [x] Frontendagent: omorganiser og komprimer frontendfilene over, fjern synlig FINN-inngang, bevar interaksjoner og kilder.
- [x] Analyseagent: forbedre juridiske/tekniske titler og relevante tester; dokumenter faktisk AI-status. Kan eie `src/frontend/investment/property-risk.ts` hvis nødvendig, avklar med frontendagent.
- [x] Hovedagent: rett bildepolicy/komponent og bildeprøver uten ny modell.
- [x] Hovedagent: integrer, kjør typecheck/lint/build, relevante og fulle tester samt ekte Playwright på localhost:3000; se faktiske skjermbilder og rett layout.
- [x] Hovedagent: oppdater README og prosessevidens, registrer eventuelle nye utsettelser bare i sentral deferred-work, lokal commit med promptlogg.

**Acceptance Criteria:**
- Gitt en tom økt, når hovedflaten eller kontroll åpnes, så finnes PDF-opplasting og intet synlig FINN-lenkefelt.
- Gitt importert PDF, når økonomien leses, så står leie, drift, yield, finansiering og scenario samlet før juridisk og teknisk del.
- Gitt publiserte referanser, når hovedflaten vises, så er SSB foldet og Hybel/Menon tydelig statistisk.
- Gitt dokumenterte funn, når titler vises, så støttes de av ordrett kilde og fysisk side; ubesvarte spørsmål skaper ikke påståtte mangler.
- Gitt begge ekte originaler, når endelig nettleserprøve kjøres, så bekreftes opplasting, bilde/plassholder, tall, slider/reset, detaljer og mobil/desktop med skjermbilder.

## Implementation Notes

Ingen uavklarte intensjonsvalg eller irreversible eksterne handlinger. Brukerens implementeringsordre og eksplisitte rollefordeling styrer gjennomføringen uten nytt godkjenningsstopp. To eksisterende subagenter implementerer sine ansvarsområder parallelt; hovedagent eier integrasjon og testing. Aktiv promptlogg er identifisert ved eksakt oppdrag og sesjons-ID.

Kursgrunnlag: Sensorveiledning Del 1, side 2–6, samt faglærers brief-tilbakemelding 6. oktober: kjørbar kjerneflyt, kildebelegg, kodeberegnet finans, avgrenset omfang, responsivt design og sporbar QA. Ingen nye kurskrav innføres.

Sluttverifikasjon: full unit/integrasjon 2188/2188, 7 eksisterende skip; alle 238 ikke-hoppede E2E-tilfeller bekreftet over bred kjøring og 4/4 korrigerte oppfølgingsprøver; 7/7 bildekomponentprøver; siste ekte localhost:3000-matrise 8/8 uten skip, sidefeil eller eksterne forespørsler. Se [fullt prosess- og testbevis](../process/arbeidsokter/2026-11-05-analyseoversikt.md).

## Spec Change Log

## Review Triage Log

Hovedagentens kode-, kanttilfelle- og verifikasjonsgjennomgang etter integrasjon. To implementeringssubagenter ble brukt; en separat trelagsreview var ikke tilgjengelig etter agentenes bruksgrense.

| Funn | Vurdering | Løsning og belegg |
| --- | --- | --- |
| Størst raster kunne være meglerportrett | medium | Kun kvalifisert forsidepanel; ukjente/tvetydige paneler får plassholder. Faktisk Rostockgata-foto og Nøstegaten-plassholder er sett visuelt; egne bildeprøver dekker større senere raster og ressursvern. |
| Hypotetisk juridisk klausul fikk kategorisk tittel | medium | «Uavklart» beholdes i tittelen. Tre konkrete negative unit-prøver i `tests/unit/legal-risk.test.ts`. |
| Ubesvart egenerklæringsspørsmål ble påstått mangel | medium | Spørsmål filtreres uten å utlede svar; positive kildeutsagn bevares. Tester dekker ja/nei/tomt svar og egne konkrete godkjenningsutsagn. |
| Gammel mobilregel ga fjerde KPI hel rad | low | Overstyring til 2 × 2, faktisk mobilskjermbilde og overflow-kontroll. |
| Samme døgnbegrensning ble gjentatt | low | Smal gruppering av uttrykkelig helboliggrense med samme døgnantall og dokument. Alle kilder beholdes; ulike grenser og kjellerregler samles ikke. |
| Null TG-treff kunne misforstås ved sperret rapport | medium | Ufullstendig uttrekk uten sikre treff viser «TG-status ikke avklart». Dokumentert dekning forblir ufullstendig. |
| Flyttede detaljer gjorde gamle UI-lokatorer ugyldige | low | Testene åpner de faktiske detaljene og bruker konkrete nye titler. Uavhengige tall-/kilde-/portasserts beholdes. Historisk FINN-UI erstattes av fraværs-/API-portprøve. |


## Verification

`npm run typecheck`, `npm run lint`, `npm run build`, `npm test`, relevante komponent-/E2E-prøver. Ekte originaler kun fra ignorert `private/incoming/`; skjermbilder og råresultater privat. Dokumenter faktiske utfall og gjenstående grenser i `.docs/process/arbeidsokter/`.
