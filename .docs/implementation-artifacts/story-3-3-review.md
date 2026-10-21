# Story 3.3 — uavhengig BMAD-review

Dato: 2026-10-21. Reviewmodus: **full**. Implementeringsdiff:
`c3c2214db47fe6b76459c8d6a2413b976131cc49..3f905bda610743ea7b8fecfdbe606e3e1e36d6e9`.
11 filer, 816 tilføyelser og 2 slettinger. Revieweren er en ny agent etter
implementeringsagenten og har selv lest kode, tester og autoritetskilder.

## Autoritet og gjennomføring

[Story 3.3 AC1–AC4](../planning-artifacts/epics.md#story-33-formatere-nøkkeltall-uten-å-skjule-økonomiske-brudd),
[storyspec](spec-3-3-formatere-nokkeltall-uten-a-skjule-okonomiske-brudd.md),
Epic 3-kontekst, SPEC CAP-5/CAP-6 og Finans og screening i grensekontrakten,
final UX DESIGNs tallformat og EXPERIENCE metric-grid/recommendation,
arkitektur AD-7/9/10 og PRD-addendums BT-fasit er kontrollert mot implementeringen.
Sprintplan/status bekrefter modulrekkefølgen og arbeidsgrensen. Ingen senere
resultat-UI, screening, snapshot eller live inngår i vurderingen.

Kurs-/feedback-kontroll følger AGENTS.md. Faktisk faglærertilbakemelding er lest,
sammen med det sidehenviste sensoruttrekket som orkestratoren i denne økten
har sammenholdt direkte med alle sju sider i sensor-PDFen. Her brukes støtten
for avgrenset scope, uavhengig fasit, sporbar plan–kode–test og konkrete
KI-reviewfunn/rettinger. Ingen nye produktkrav er utledet fra kursveiledningen.

`bmad-code-review` ble aktivert med `uv run --no-cache` og den rendrerte
workflowen. Alle fire context-free lag kjørte med samme modellkapabilitet,
**ett om gangen** etter brukerens sekvenskrav: Blind Hunter → Edge Case Hunter
→ Verification Gap Reviewer → Acceptance Auditor. Ingen fil ble endret mens
et lag var aktivt. De tre første fikk bare diff-/instruksjonsstier; Edge Case
Hunter fikk separat claims-fil etter sin instruks. Acceptance Auditor fikk
storyspec og autoritetskilder. Ingen lag feilet eller ble hoppet over.
Blind Hunters funngulv var `min(floor(sqrt(64,126 kB) + 1), 10) = 9`.

## Individuell triage før gruppering

Hver av de 12 kandidatene beholdes nedenfor, også overlappende og avviste.
Alvorlighetsgrad settes av denne revieweren ut fra faktisk virkning.

| ID / lag | Kandidat og konkret bevis | Dom / håndtering |
|---|---|---|
| B1 / Blind Hunter | `finance.ts:75–93`: L=399999.999999999999, D=400000, P=16000000 gir eksakt −0.00000000000000000625 %. Mot Ymin=7 ble både hovedverdi og detalj unsigned null uten forklaring. Ekspansjonen stanset fordi 0 < 7. | **medium**, patch G1. Ekte AC1/CAP-5-feil, vist med rød prøve. |
| B2 / Blind Hunter | Dobling fra 524288 til 1048576 desimalplasser overskrider big.js MAX_DP=1000000 (`node_modules/big.js/big.mjs:31,351`). Valideringen har ingen lengdegrense, så et input med over en halv million relevante desimaler kan nå dette. | **low**, avvist. Utenfor alminnelig bruk; en ny grense/fallback-policy og ekstra presisjonsgrener er mer enn en direkte korreksjon. Bibliotekgrensen dokumenteres her; ingen ny inputbegrensning eller toleranse innføres. |
| B3 / Blind Hunter | `contracts/presentation.ts:13–36` tillater manuelt konstruert unavailable-metrikk med Beregnet/numerisk tekst. Den faktiske produsenten setter status fra samme metrikk og returnerer før tall ved unavailable (`finance.ts:39–52`); BT-3/5/6 verifiserer denne banen. | **low**, avvist. Ingen innlesings-/persistensgrense eller nåværende konsument konstruerer slike objekt. Kryssfeltgrener ville kontrollere tilstander produsenten ikke lager. |
| B4 / Blind Hunter | Det generiske skjemaet tillater manuelt ombyttede slots/enheter/terskler. Fire faste kall i `formatFinancialMetrics` binder korrekt navn, metrikk og terskel; ekte F1/F2 og unavailable-prøvene kontrollerer enheter. | **low**, avvist. Ingen demonstrert feil fra den faktiske produsenten eller konsument. Fire spesialskjemaer ville øke kontraktkompleksiteten uten en nåværende brukerretting. |
| B5 / Blind Hunter | `metric` og `threshold.basis.metric` er separate kloner som kan muteres ulikt etter retur. De er like ved retur, og ingen nåværende presentasjonskonsument muterer dem. Mutering av utdata kan ikke endre kildegrunnlag/regelutfall, som AC4-testen viser. | **low**, avvist. Ny alias-/readonly-/likhetsmekanisme for manuelt muterte DTO-er går ut over den demonstrerte inputisolasjonsfeilen. |
| B6 / Blind Hunter | Før/etter-integrasjonsmatrisen dekket bare yield med detaljbehov innen åtte plasser. Den separate 32-plassprøven kontrollerte detalj, men ikke hele ekte finans-/terskelobjektet etter ekspansjon. | **medium**, patch G2. Legg ekspansjonsgrunnlaget og svært liten negativ yield inn i samme frosne før/etter-integrasjon. |
| B7 / Blind Hunter | Beløpets roundHalfUp hadde halvveisfasit, men yieldens separate `Division.RM`-bane manglet en prosenttie. | **medium**, patch G3, samme rotårsak som V1. |
| B8 / Blind Hunter | Ingen hel presentasjonsfixture med bekreftet L=D=J=Ymin=0 kontrollerte alle fire synlige nuller og fravær av falsk avrundingsforklaring samtidig. Domene-/terskeltester alene verifiserer ikke formatteren. | **low**, patch G4. Direkte og meningsfull nulltest uten ny produksjonslogikk. |
| B9 / Blind Hunter | Presentasjonstestene brukte 2026 i alle perioder. År kopieres fra hver metrikks eget grunnlag (`finance.ts:40`), men testen skilte ikke dette fra ett felles hardkodet år. | **low**, patch G5. J=2027 skal bare gjøre cash unavailable/null-år med bevarte mismatchårsaker; øvrige metrikker beholder 2026. |
| E1 / Edge Case Hunter | Svært liten negativ nettoyield mister begge synlige fortegn ved positivt eller unavailable Ymin. Detaljekspansjonen er betinget av brudd mot minimum, mens negativ betydning gjelder uavhengig av denne betingelsen. | **medium**, patch G1, samme rotårsak som B1. |
| V1 / Verification Gap Reviewer | Forhåndsverifisert regresjonsgap: reelle P=1000000 og L=118745 gir 11.8745 %, som skal vises 11,875. En endring fra roundHalfUp til roundHalfEven i prosentdivisjonen gir 11,874 uten å påvirke de tidligere beløpstestene. Søket fant ingen annen prosenttie-test. | **medium**, patch G3. Uavhengige positive/negative fasiter under/på/over halvveis skiller reglene. |
| A1 / Acceptance Auditor | Ekte finans-/terskelfunksjoner reproduserte samme fortegnstap som B1 ved Ymin=7 og manglende Ymin. AC1 og SPEC CAP-5 krever at negative resultater beholder sin betydning. | **medium**, patch G1, samme rotårsak som B1/E1. |

Resultat etter gruppering: **0 decision_needed, 5 patch, 0 defer, 4 avvist**.
Det er én produksjonsfeil og fire avgrensede grupper med verifikasjonshull.
Ingen funn krever ny produkt-/arkitekturbeslutning eller endring av låst plan.

## Retting og ny verifikasjon

G1 er rettet lokalt: negativ ratio får utvidet detalj til fortegnet er lesbart,
uavhengig av Ymin. Når vanlig visning blir null, følger en konkret forklaring
med eksisterende `negative-rounded-to-zero`-kode. Den mer spesifikke skjulte
terskelbruddforklaringen beholdes når den gjelder, blant annet ved Ymin=0.
Dette er valg av visningspresisjon; mottatt avgjørelse endres aldri.

Tre nye prøver ble kjørt **før** produksjonsrettingen: to mistet negativ detalj
(positivt/manglende Ymin), og én mistet forklaringen når detaljen allerede var
negativ. Alle tre feilet av riktig årsak; de 36 eksisterende prøvene besto.
[Rå rødlogg](story-3-3-review-rod.txt).

G2–G5 er lukket med reelle finans-/terskelfunksjoner og uavhengige strenger:
32-plassdetalj og svært liten negativ yield i frosset før/etter-integrasjon,
seks prosentavrundingsgrenser, fire bekreftede nullresultater og eget år
kontra kontantstrømmens ulike-år-årsaker. Totalt er 13 nye prøver lagt til.
Modul-README beskriver den korrigerte negative yieldbanen.

- Målrettet `npm test -- tests/unit/financial-presentation.test.ts tests/unit/finance.test.ts tests/unit/thresholds.test.ts`: **199/199**, hvorav **49** presentasjonsprøver. [Rålogg](story-3-3-review-malrettet.txt).
- `npm run typecheck`: bestått. [Rålogg](story-3-3-review-typecheck.txt).
- `npm run lint`: bestått. [Rålogg](story-3-3-review-lint.txt).
- Full `npm test` med nødvendig lokal loopbacktilgang: **781/781**, 25 testfiler. [Rålogg](story-3-3-review-regresjon.txt).

Dette er reviewerens egne nye kontroller; implementeringsagentens tidligere
768-tester/E2E er historiske bevis. E2E gjentas ikke i denne modulreviewen:
endringen er ren visningspresisjon uten UI-konsument, og ingen funn gjelder
appkobling. Orkestratoren kjører planlagt full sluttregresjon etter 3.4.

## AC-vurdering og checkpoint

AC1: Norsk format, navn/enhet/eget år og negativ betydning er dekket av F1/F2,
BT-11/15 og nye fortegns-/avrundings-/årsgrenseprøver. AC2: BT-8/9, likhet,
små brudd og eksakt Ymin-detalj er bevart. AC3: BT-3/5/6, konkrete årsaker,
Delgrunnlag og fravær av gammel verdi/anbefalingsvalg er bevart. AC4: ekte
terskler og eksakte verdier er identiske etter gjentatt formatering, også når
detaljen utvides; frosset input/utdatamutering/global Big-konfigurasjon prøves.

**Bestått etter retting og ny regresjon.** Storyspec og sprintnøkkel settes
til **done**. Fem patchgrupper er lukket, fire lavrisikokandidater avvist med
individuell begrunnelse; ingen åpne high/medium-funn eller defer. 3.4 og senere
stories forblir backlog, Epic 3 in-progress. Ingen push eller autoritativ
planendring. Lokal review/done-commit rapporteres med full SHA til orkestratoren.
