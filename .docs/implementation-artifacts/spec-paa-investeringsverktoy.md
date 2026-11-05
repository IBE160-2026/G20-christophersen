---
title: 'PAA: praktisk investeringsvurdering'
type: feature
created: '2026-11-05'
updated: '2026-11-06'
status: done
route: dispatch
baseline_commit: 34ebba452e96636d93a8a1e13f9f8c2aca9d766c
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="Brukerens eksplisitte oppdrag autoriserer selvstendig gjennomføring">

## Intent

**Problem:** Økonomien mangler en enkel samlet vei til kapitalbehov, belåning og månedlig kontantstrøm. Risikoanalysen overser konkrete undersøkelsesbegrensninger og må skille faktiske TG-avvik fra generelle graderingsforklaringer.

**Approach:** Utvid eksisterende finansdomene og Konsept A med direkte scenariojusteringer. Forbedre konservativ lokal kildeanalyse og prøv hele flyten uavhengig med begge ekte dokumenter.

## Boundaries & Constraints

**Always:** PDF-inngang, leieslider, SSB som bakgrunn, eksisterende visuell retning. Dokumentfakta, antakelser og mangler skilles. P = kjøpesum + fellesgjeld uten omkostninger; bruttoyield = L/P; nettoyield = (L−D)/P. Kapitalbehov = kontantbehov + fellesgjeld; privat lån = kontantbehov−egenkapital; belåning = (privat lån+fellesgjeld)/P. Kontantstrøm = (L−D−samlet årlig gjeldsbetaling)/12. Samlet drift inkluderer kjente kostnader og erstatter D i scenarioet. Ingen automatisk null ved manglende data.

**Never:** Betalte AI-kall, push, private PDF-er i Git, ny integrasjon, oppdiktet TG eller investeringsgodkjenning. Finansieringsscenario bekrefter ingen dokumentfakta.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Komplett scenario | Kjent kjøpsgrunnlag, valgt drift/leie/lån | Matematisk korrekt kapital, yield og månedlig kontantstrøm | Vis proveniens og formler |
| Endring | Leie, drift, egenkapital/belåning, rente eller løpetid justeres | Nye inputbundne tall uten lagringsknapp | Gamle verdier kan ikke gjelde nye input |
| Grenser | Negativ kontantstrøm, høy belåning, nullrente eller kontantkjøp | Korrekt beløp og forståelig status | Ingen bankgodkjenning hevdes |
| Mangler | Blank/ugyldig drift, lånefelt eller ukjent gjeld | Avhengige tall blir ukjente, uavhengige tall beholdes | Synlig konkret veiledning |
| Risiko | Faktisk TG2/TG3, forklaringsside eller utilgjengelig komponent | Bare konkret kildebundet grad; begrensning uten oppdiktet grad | Originalside og uavklart dekning vises |
| Ny opplasting | Samme eller annet dokument i samme økt | Ny import uten gamle scenarioforutsetninger | Ingen blanding av eiendommer |

</frozen-after-approval>

## Code Map

- `src/domain/financial-scenario.ts`, `financing.ts`: Big.js, eksisterende annuitet/yield; behold finansdefinisjonene.
- `src/frontend/state/scenario.ts`: lesende dokumentadapter; bevar mangler og kildekonflikter.
- `src/frontend/investment/InvestmentOverview.tsx`, `ScenarioFinancing.tsx`, `rent-scenario.ts`: samlet økonomi og direkte antakelser. `App.tsx` eier objektnøklet scenario.
- `src/backend/import/technical-risk.ts`, `visual-technical.ts`, `legal-risk.ts`: lokal analyse med fysisk sidebelegg; bruk eksisterende kontrakter.
- `src/backend/import/semantic-adapter.ts`: bare offline-stub tillates. `import-route.ts` sperrer live. Ingen oppheving av sperren.
- `tests/e2e/`, `tests/unit/`: meningsfulle tester. Private originaler i ignorert `private/incoming/`.

## Tasks & Acceptance

**Execution:**
- [x] Finansagent: utvid eksisterende domene/adapter/finanspanel og test kapital, gjeld, belåning og kontantstrøm.
- [x] Risikoagent: forbedre konkrete undersøkelsesbegrensninger og TG-kobling; dokumenter semantic-status uten modellkall.
- [x] Hovedagent: integrer direkte driftforutsetning, månedlig hovedtall, korte forklaringer og utvidbare kilder i eksisterende oversikt.
- [x] QA-agent: uavhengig Playwright og visuell sluttkontroll på localhost:3000 med begge private PDF-er, ekte backend og alle matrisetilfeller.
- [x] Hovedagent: rett funn, kjør relevante regresjoner og oppdater README/prosess/deferred-work; lokal commit med aktiv promptlogg.

**Acceptance Criteria:**
- Gitt begge salgsoppgavene, når de importeres og scenarioet fylles ut, så er tall og kilder etterprøvbare uten teknisk bistand.
- Gitt desktop og mobil, når økonomi og risiko brukes, så er rekkefølgen forståelig og innholdet lesbart uten horisontal sidescroll.
- Gitt ufullstendig analyse, når resultatet vises, så er ukjente forhold synlige uten falsk kompletthets- eller kjøpspåstand.

## Implementation Notes

- Oppdraget er én samlet forbedring av investeringsvurderingen. Brukeren har uttrykkelig bestilt tre parallelle agenter og selvstendig fullføring; dette går foran skillens sekvensielle implementering og ekstra godkjenningsstopp. Ingen eksterne irreversible handlinger inngår. Finansiering/kapital utvider briefens opprinnelige scope etter dagens eksplisitte bestilling.
- Grunnlag: AGENTS.md; Product Brief og faglærertilbakemelding; sensorveiledningen lest med PDF.js; Konsept A DESIGN/EXPERIENCE; analyseoversikt og QA fra 2026-11-05.

## Spec Change Log

## Review Triage Log

| Funn | Vurdering og håndtering |
|---|---|
| Kapital ukjent på begge ekte PDF-er | high: kildeavstemmingen manglet; eierform og omkostningsledger er rettet uten å svekke konfliktporter. |
| Ugyldig rå-LTV overlevde samme PDF på nytt | medium: finanspanelet nøkkelkobles til importidentiteten; ekte reimportprøve kreves. |
| LTV-endepunkt og visningsavrunding | medium: eksakt sliderverdi, eksplisitt invers endepunktshåndtering og synlig avrundingsforklaring. |
| Rost-slider forsvant selv med eksakt verdi | medium: Big.js-presisjon 20/50 skilte grensene; nå 50 begge steder, rendertest på begge originalverdier. |
| Gamle L:/D:-mangler etter scenarioendring | low: gyldig scenario viser egne inputmangler, kontrollgrunnlaget beholdes separat. |
| Mulig romarv over annen komponent | medium: bare direkte tilstøtende rom-/komponentblokk brukes; begge tekstordener støttes med kildebelegg, ingen arv over prosa. |
| Eksisterende tilstøtende komponent→rom mistet kobling | medium: uendret grupperingsfasit avdekket regresjon; trygg tilstøtende etterlinje er gjenopprettet. |
| Native range-End ble like over eksakt maks | medium: IEEE-double fra nettleseren valideres ikke som fritekst; faktiske sliderendepunkter bindes direkte til eksakt egenkapital. |
| Ubalansert første radonsetning i preview | medium: preview viser måle-/avklaringsbehov; originalens nyanser bevares i detaljene. |
| Årsbeløp ved løpetid under ett år | low: årsvisning og låneforutsetninger presiserer annualisering. |
| Flere omtaler av fellesanlegg | low: ulike kildeblokker og usikker identitet kan ikke trygt slås sammen; bevares i utvidbar liste, generell dekning fortsatt åpen. |

## Verification

- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- Playwright: eksisterende relevante scenariotester og ny uavhengig ekte akseptanseprøve. Ingen API-stubbing i ekte prøven. Desktop/mobilbilder inspiseres.

Sluttverifisert 2026-11-06: 2 234 unit-/integrasjonsprøver (7 eksisterende
valgfrie skip), 238 nettleserregresjoner (5 valgfrie skip), 50 komponentprøver,
3 utviklingskontroller og 2/2 obligatoriske ekte PDF-caser uten skip.
[Prosess, fasit og faktiske resultater](../process/arbeidsokter/2026-11-05-investeringsverktoy.md),
[uavhengig QA](../process/arbeidsokter/2026-11-05-investeringsverktoy-uavhengig-qa.md).
