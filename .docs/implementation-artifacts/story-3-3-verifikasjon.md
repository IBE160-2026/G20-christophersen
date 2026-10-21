# Story 3.3 — egenverifikasjon før uavhengig review

Dato: 2026-10-21. Baseline: `c3c2214db47fe6b76459c8d6a2413b976131cc49`.
Dette er implementeringsagentens kontroll. Separat ny BMAD-reviewagent må
godkjenne leveransen før done og før 3.4 kan starte.

## Autoritet og faktisk grense

[Story 3.3 AC1–AC4](../planning-artifacts/epics.md#story-33-formatere-nøkkeltall-uten-å-skjule-økonomiske-brudd),
[spec](spec-3-3-formatere-nokkeltall-uten-a-skjule-okonomiske-brudd.md),
[Epic 3-kontekst](epic-3-context.md), SPEC CAP-5/CAP-6/
[grensekontrakt](../specs/spec-IBE160/grensekontrakter.md#finans-og-screening),
UX DESIGNs tallformat og EXPERIENCE metric-grid, AD-7/9/10 samt PRD-addendums
BT-fasit styrer leveransen. Implementeringsrekkefølgen følger sprintplan/status.
3.1/3.2 og Epic 2 er done før start; ingen relevant åpen port hindrer 3.3.

`src/presentation/finance.ts` formaterer bare eksisterende finans- og terskeldata.
`src/contracts/presentation.ts` er delt kontrakt. Presentation-mappen var allerede
fastsatt i arkitekturen og er tatt med i appens TypeScript-kontroll. Ingen ny
produkt-/arkitekturbeslutning, avhengighet, UI, anbefaling, snapshot eller live
inngår. 3.4 og alle senere stories er urørt.

## AC og uavhengig fasit

| Krav | Direkte kontroll i `tests/unit/financial-presentation.test.ts` | Resultat |
|---|---|---|
| AC1, F1/BT-1 | 11,875 %, 1 500 000 kr/år, 9,375 %, 700 000 kr/år; navn, enhet, 2026 og faktisk U+00A0-tusenskille | Bestått |
| AC1, F2/BT-2 | 8,750 %, 1 000 000 kr/år, 6,250 %, 200 000 kr/år | Bestått |
| AC1, BT-11 | 1,875 %, −100 000 kr/år, −0,625 %, −900 000 kr/år | Bestått |
| AC1, BT-15 | Blandet år/måned gir 9,000 %, 1 200 000 kr/år, 7,500 %, 600 000 kr/år; D=20 000/måned, faktor 12 og 240 000/år, kilde og oppgitt kostnadsinnhold bevares | Bestått |
| AC1, avrunding/presisjon | Positiv/negativ halvkrone avrundes med roundHalfUp, uten falsk negativ null; 9 007 199 254 740 993,5 kr beholdes eksakt i detalj og vises 9 007 199 254 740 994 | Bestått |
| AC2, BT-8 | Ekte brudd ved L=1 519 999: 7,000 % hovedvisning, 6,99999375 % detalj, brutt terskel og fast uavrundet-forklaring | Bestått |
| AC2, svært små brudd | 32 desimalers yielddetalj skiller brudd fra 7 %; svært lite avvik i Ymin bevares som eksakt kravdetalj | Bestått |
| AC2, BT-9 | Cash=0 består, −1 bryter; −0,01 og −0,000000000000000000000001 vises som 0 med eksakt negativ detalj og eksplisitt bruddforklaring | Bestått |
| AC2, negative detaljer | Negativt NOI som blir synlig null får negativ detalj/forklaring; nettoyield nær null mot Ymin=0 bevarer brudd og negativt fortegn | Bestått |
| AC2, gjentakende desimal | 1/3 gir 33,333 % og tilnærmet 33,33333333 % detalj med eksakt teller/nevner intakt | Bestått |
| AC3, BT-3/5/6 | Manglende L, manglende J og P=0 har riktige egne årsaker og ingen gammel/estimert/null tallverdi. Gyldige delberegninger bevares | Bestått |
| AC3, delgrunnlag/Ymin | Kjent Delgrunnlag bevares også med fire gyldige tall; manglende Ymin gjør bare terskelen ikke-vurderbar; formatteren velger ingen anbefaling | Bestått |
| AC4, ekte integrasjon | F1, F2, likhet, én krone under, cash=0, skjult negativ cash og begge brudd kjøres med ekte 3.1/3.2 før/etter gjentatt formatering. Hele finans-/terskelobjektene er identiske | Bestått |
| AC4, isolasjon | Dypt fryst input, mutering av utdata og endret global Big.DP/RM/strict endrer ingen kilde, regelavgjørelse eller lokalisering | Bestått |

Forventningene er konkrete forhåndsdefinerte strenger/utfall fra AC og
PRD-addendum, uten produksjonsformatter eller beregning av forventet finansfasit.
Testen bekrefter identiske ekte terskelobjekter før/etter, ikke bare tekstretur.

## Gjennomførte kontroller

- Målrettet: `npm test -- tests/unit/financial-presentation.test.ts tests/unit/finance.test.ts tests/unit/thresholds.test.ts` — **186/186**, inkludert **36 nye** presentasjonsprøver.
- `npm run typecheck` og `npm run lint` — bestått.
- `npm test` med lokal loopbacktilgang — **768/768**, 25 testfiler. [Rålogg](story-3-3-kontroller.txt).
- `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-1-2-browsers npm run test:e2e` — build/typecheck, **89/89 bygget-app** og **3/3 dev-E2E** bestått. [Rålogg](story-3-3-e2e-kontroller.txt). Den nye rene modulen har ingen UI-konsument ennå; E2E er regresjonsbevis for eksisterende flyt, ikke bevis for senere resultat-UI.

Etter første grønne fullregresjon ble presentasjonskontrakten presisert til
også å bevare hele terskelgrunnlaget, inkludert registrert Ymin og kilde,
i tillegg til metrikken og avgjørelsen. To eksisterende prøver ble strammet
inn for innhold/utdatamutering. E2E-kjøringen ovenfor var før denne siste
additive kontrakt-/metadataendringen. Full Vitest, typecheck og lint ble
derfor kjørt igjen på den endelige koden. Ingen app-/UI-kode eller bygget
frontend ble endret av denne presiseringen; modulen har ingen UI-konsument.

Første målrettede kjøring avdekket tre testoppsett-/fasitfeil: oppgitt
kostnadsdel i månedstesten måtte følge registrert månedsperiode og to
beløpsdetaljforventninger manglet tusenskille. Testene ble korrigert mot
eksisterende autoritet; produksjonsregler og scope ble ikke endret.

Kurs-/feedback-kontrollen følger AGENTS.md: faglærerfeedback, sidehenvist
sensoruttrekk og orkestratorens direkte lesing av alle sju PDF-sidene i denne
økten. Beviset dokumenterer plan–kode–test-spor og senere separat review;
det påstår ingen live-kvalitet, tidsmåling eller ferdig resultatflate.

## Overlevering

Ny reviewer skal kontrollere hele diffen mot baseline, alle fire AC og
verifikasjonens faktiske bevis. Ingen integrert review er utført av
implementeringsagenten. Checkpointet er lokal implementeringscommit og
**in-review/review** etter fullført regresjon. 3.4–3.9 er fortsatt backlog.
Ingen push.
