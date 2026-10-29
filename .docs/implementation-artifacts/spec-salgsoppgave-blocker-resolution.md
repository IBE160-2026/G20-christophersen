---
title: 'PAA-SO2: token-count og privat representativt prøvegrunnlag'
type: 'feature'
created: '2026-10-29'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '2b1afd2f875373fcff933a021684a0793c83ceb4'
context: []
---

<frozen-after-approval reason="Mads bestilte eksplisitt to parallelle subagenter, implementering, review og lokal commit">

## Intent

Løs kode-/prosedyreblokkeringene før første ekte salgsoppgaveprøve: presis
inputtelling via dokumentert Responses input_tokens.count, konservativ USD
0,20-kontroll, og privat mottak med uavhengig menneskelig fasit. Stopp når
brukerens faktiske dokument kreves; ingen betalt generering eller push.

## Boundaries & Constraints

Behold GPT-6.1 Sol, low/Standard, 40k input og 8k output inklusive reasoning.
Samlet budsjett deles med separat rapport. Tell endelig input, prompt,
schema og relevante requestinnstillinger; bind kvittering til hele requesten.
Serverbasert telling skal merkes som serverbasert, aldri som lokal tokenizer.
Ingen antatt encoding, heuristikk eller testteller som produksjonsbevis.
Ukjent count-/verktøypris eller kapasitet stopper trygt; verktøy er av og
koster derfor null i godkjent request. Ingen automatisk retry eller avkorting.

Ingen faktisk API-/count-kjøring eller nøkkellesing i utviklingsøkten.
Implementer og prøv SDK-/HTTP-grensene med injisert transport. Full PDF
lastes ikke til AI. Bevar all PDF.js-/TG-dekning, kildekontroll,
menneskelig beslutning og finans-/screeningregler. Ekte original, tekst,
fasit og output holdes i ignorert private/, aldri i offentlige artefakter.
Ikke fabriker menneskelig verifikasjon eller representativitet.

## I/O & Edge-Case Matrix

| Tilstand | Forventning |
| --- | --- |
| Låst SDK + komplett request | Count-støtte og nøyaktig payload/proveniens kan testes offline |
| Endret request/count, ukjent pris, timeout, feil format | Null generering, synlig stopp, ingen ny kvote |
| Salgsoppgave + rapport, reasoning/output | Én varig USD 0,20-kvote; maksreserve før transport |
| Ekte dokument mangler | Tydelig mottaksinstruks; ingen fabrikkert fasit |
| Privat PDF finnes | Hash + alle fysiske sider + tom menneskelig fasit/dekningsregnskap |
| Ulest side, ikke attestert fasit eller endrede bytes | Sperret kvalitetstest; ingen falsk godkjenning |
| Privat sti kan escapes/er versjonert | Avvis før dokumentinnhold skrives |
| Kontrollert fasit/resultat | Eksisterende schema-/kildesammenligning kan gjenbrukes |

</frozen-after-approval>

## Code Map

- Agent 1 eier `src/backend/import/{budget,live-preflight,semantic-request,offline-sdk-transport,semantic-adapter}.ts`, nye token-count-moduler, nødvendig `src/contracts/document-import.ts`-proveniens og tilhørende preflight-/token-tester. Gjenbruk AnalysisBudgetStore; ingen finansendring.
- Agent 2 eier nye `src/backend/import/representative-*.ts`, tilsvarende nye tester, eventuell `.gitignore`-presisering og `salgsoppgave-blockers-2026-10-29/representative-document-procedure.md`. Gjenbruk validatePdf/extractImport og FrozenOracle; PDF-inntak er aldri menneskelig kontroll.
- Root eier `prepare-live-test.ts`, `oracle-comparison.ts` ved nødvendig integrasjon, `package.json`, README, spec, prosess, sentral deferred og samlede test-/reviewbevis. Ingen parallell endring av samme fil.
- Root justerer bare teller-/pristekst i `src/frontend/screens/ProspectusImport.tsx` til ærlig server-/stubproveniens; ingen ny brukerflyt.
- `salgsoppgave-live-preflight-2026-10-29/` er tidligere frosset bevis, ikke overskriv det. Syntetiske fixturer/historisk S5/S6 er bevart.
- Autoritative kurskrav: sensorveiledningen side 2–6 og faglærerfeedback i brief støtter fasit, sporbarhet, vanlig kode for finans og privat dokumenthåndtering; ingen nye domeneregler utledes.

## Tasks & Acceptance

- [x] Agent 1: undersøk åpnet offisiell count-guide/API/pris og faktisk låst SDK; implementer presis count-proveniens, kostnadsvakter og offline-regresjoner; dokumenter utestet kontotilgang.
- [x] Agent 2: implementer privat inntak, tom fasit-/sideledger, streng lasting/frysing med selvrapportert menneskelig attestasjon og originalkilder; dokumenter operatørprosedyre.
- [x] Root: integrer kommandoer og preflight, bevar offline syntetisk støtte og stengt genereringsport; dokumenter neste faktiske brukerhandling.
- [x] Root: full unit/integrasjon, build/lint, bevaringskontroll, uavhengig BMAD-review og rettinger; lokal commit med aktiv promptlogg.

AC1: Gitt endelig request, når count utføres med injisert SDK-stub, da omfatter
inputgrunnlaget prompt, schema og reasoning-konfigurasjon; endring av request
eller kvittering kan ikke autorisere generering.
AC2: Gitt count/pris/forbrukshistorikk, når maksimal input/output inkl reasoning
og eventuelle gebyrer reserveres, da overskrides aldri samlet USD 0,20 ved
ny rapport/omstart; ukjent pris og aktiverte verktøy sperres.
AC3: Gitt ekte dokument, når inntak gjøres, da beholdes original/hash/alle
fysiske sider privat, med uutfylt fasit og null menneskelige verifikasjonskrav
erklært oppfylt automatisk.
AC4: Gitt utfylt fasit, når den skal fryses/brukes, da kreves kildegyldighet,
komplett sideregnskap og eksplisitt menneskelig før-modell-attestasjon;
endret original, uleste sider eller mangler sperrer.
AC5: Gitt ingen faktisk PDF fra bruker, når arbeidet avsluttes, da finnes
reproduserbare mottaksinstruksjoner og offline-bevis; ingen ekte test eller
betalt generering fremstilles som gjennomført.

## Implementation Notes

Brukerens eksplisitte todelte parallelle oppdrag erstatter workflowens
generelle sekvensielle dispatch. Begge agenter undersøker samtidig og får
denne felles specen som implementeringsgrunnlag innen eget fileierskap.
Dagens bestilling autoriserer de reversible kode-/prosedyreendringene;
ingen nytt produktvalg, API-sideeffekt eller ekstra godkjenningsrunde er
nødvendig. Faktisk dokument og senere live-godkjenning er sluttporten.
Ingen ekstern fri/pris-antakelse tas for count-endepunktet.

Gjennomført scope er offline kode/prosedyre til mottaksporten; `done` betyr
ikke faktisk live-klar analyse. Countpris er uverifisert og stopper før nett.
Faktisk PDF og menneskelig fasit gjenstår. Under review fikk agent 1 også
eksklusivt eierskap til analysis-budget-store.ts for varig usageCostBasis;
agent 2 beholdt representative-filer, root kontrollerte planparitet/matching.

## Spec Change Log

## Review Triage Log

| ID | Dom | Verifikasjon og rute |
| --- | --- | --- |
| B1 | medium | Rapportside med rasterUnprocessed passerer frysing selv om nedstrøms kontrakt sperrer komplett analyse. Patch: samme rapport-/rastergrense. |
| B2 | medium | Fasit tillater 4000 tegn i component/description mot resultatets 200/2000. Umulig sammenligning. Patch: gjenbruk samme grenser. |
| B3 | medium | Global komponent+beskrivelse-identitet avviser ulike kildebundne forhold. Patch: fysisk belegg skiller forhold; sammenligner prioriterer slike kilder ved lik tekst. |
| B4 | medium | Kildefinnes-kontroll verifiserer ikke at beløpet finnes i sitatet; pris 1 mot sitert 3000000 godtas. Patch: deterministisk transkripsjonskontroll. |
| B5 | medium | Øvre kostnadsgrunnlag finnes i retur, men mangler i varig journal og tapes ved restart. Patch: bevar usageCostBasis, la historisk ukjent være ukjent. |
| B6 | low | Skrivefeil kan etterlate delvis eksklusiv case. Trygt sperret, men gjenoppretting mangler. Direkte prosedyrepatch: bevar materialet, bruk ny case, ingen falsk frysing. |
| B7 | medium | Generisk valideringsfeil skjuler hvilken av hundrevis av private felt som er feil. Patch: begrensede feltstier/koder, ingen private verdier. |
| B8 | false | verifikasjon.md finnes i arbeidsområdet etter reviewers snapshot og før triage; README-lenken peker korrekt. Ingen manglende leveranse ved sluttkontroll. |
| B9 | medium | Ny sentral checkpoint var ennå ikke ført. Patch: append PAA-SO2 med serverpris-/dokumentport og bevis, bevar historikk. |
| B10 | medium | Ny flyt prøver ikke compareWithOracle med faktisk lastet frosset representativ fasit. Patch: kontrollert aksept og verdi-/grad-/kildeavvik. |
| E1 | high | Menneskets rapportområde kan fryses, men maskinelt tvetydig plan sender ingen rapportblokker/kandidater uten egen sperre. Patch: kontroller sikkert planområde mot fasit før requestskriving. |
| E2 | medium | Selvstendig reproduksjon av rapport-raster som passerer frysing; samme påviste grense som B1. Patch etter individuell dom. |
| V1 | medium | Preverifisert regresjonsgap: check-ignore-feil prøves ikke. Patch: mock manglende ignore og verifiser at intet dokument/case skrives. |
| B11 | medium | Nykontroll reproduserer at ny transkripsjonsvakt avviser korrekt 3.000.000 og 3000000.50. Patch: støtt entydige tusengrupper/desimaler med samme kildebevaring og negative transkripsjonsprøver. |

## Verification

Pinned Node24.21.0/npm11.19.0, tom nøkkel/demomodus. Test den faktiske SDK-count-
metoden/payloaden, kvitteringsbinding, manglende/feil count, endret schema,
totalbudsjett/rapport/reasoning/verktøy og privatsti/human-ledger/kildekontroll.
Kjør full npm test, build/typecheck og lint uten generering. Tre uavhengige
BMAD-reviewlag etter integrasjon. Sammenlign låste finans-/historikkfiler og
bevar tidligere prompt-/deferred-prefiks. Ikke push.

Endelig 1455/1455 tester, 59 filer, bygg/typecheck og lint består.
Tre uavhengige BMAD-lag og nykontroller er uten restfunn; 13 reelle funn er
rettet, ett dokumentfunn var allerede oppfylt. Ingen reviewfunn er utsatt.
[Fullt bevis og gjenstående porter](salgsoppgave-blockers-2026-10-29/verifikasjon.md).
