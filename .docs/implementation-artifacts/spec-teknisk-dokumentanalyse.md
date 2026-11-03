---
title: 'Kildebelagt teknisk dokumentanalyse i Konsept A'
type: 'feature'
created: '2026-11-03'
status: 'done'
route: 'dispatch'
baseline_commit: fcb04e63ceb95a494c4c3d8db2c3769faa66ab21
review_loop_iteration: 0
context: ['AGENTS.md']
---

<frozen-after-approval reason="Brukerens uttrykkelige bestilling av implementering, tester, review og lokal commit">

## Intent

PAA skal identifisere innebygde og separate tilstandsrapporter og vise flere kildebelagte TG2/TG3 og tekniske avvik i eksisterende Konsept A. PDF.js og lokal kode brukes før eventuell AI; eksisterende OCR-diagnostikk er supplerende kontrollgrunnlag. Usikker rapporttekst eller grafiske grader blir aldri bekreftet TG-dekning.

## Boundaries & Constraints

Bevar finansregler, økonomianalyse, risikomodul, originale kilder og design. Fysisk PDF-side, hash og ordrette tekstoffseter er autoritative. Sammendrag merkes som sammendrag og beviser ikke rapportdetaljer. Ingen betalte API-kall, push eller private PDF-er/utdrag i Git. Ukjent grad er ikke TG0. Ingen komplettstatus uten eksisterende dekningsporter. Brukeren har bestilt tre parallelle implementeringsagenter og hovedagentintegrasjon; dette overstyrer generisk sekvensiell BMAD-dispatch og behov for en ny implementeringsgodkjenning.

## I/O & Edge-Case Matrix

| Scenario | Input | Forventet resultat |
| --- | --- | --- |
| Rapport | Innebygd eller separat, repeterte footere, sammenhengende rapportpaginering | Riktig fysisk område med kildebelagt sikkerhet |
| Uklart område | Innholdsfortegnelse, flere rapporter, manglende/motstridende paginering | Ingen falsk sikker avgrensning |
| Eksplisitt TG | Navngitt komponent, TG2/TG3, flerlinjet avvik | Bevar hele støttet avvik og originale kilder |
| Sammendrag | Eksplisitt TG-overskrift og komponentliste | Kildebelagte sammendragsfunn; ingen utledet diagnose |
| Usikkert grunnlag | Grafisk grad, unknown/incomplete/raster, fortsettelse | Synlig usikkerhet; grad gjettes ikke; dekning sperret |
| Gjentakelser | Samme sikkert identifiserte forhold med flere belegg | Samles med alle kilder; ulike rom/grader/kontroller holdes adskilt |
| Original | Kilde i hoveddokument eller separat rapport | Riktig dokument og fysisk side åpnes |

</frozen-after-approval>

## Code Map

- `src/backend/import/local-plan.ts`: behold manifest, økonomi, historisk legacyEconomy og eksplisitte START/SLUTT-fixtures.
- `src/contracts/document-import.ts`: kilde- og dekningsporter. Bare ambiguous rapportgrenser kan støttes av bevart usikker tekst; aldri sikre funn/økonomi.
- `src/backend/import/technical-risk.ts`: eksplisitte mønstre, avviksstatus og partielle risikofunn; utvid konservativt.
- `src/backend/import/semantic-adapter.ts`: eksisterende stengt AI-port og validering beholdes.
- `src/frontend/investment/{property-risk,risk-grouping}.ts`, `RiskOverview.tsx`, `InvestmentOverview.tsx`, `concept-a.css`: gjenbruk nåværende kontrollfiltrering, prioriteter og originaldialog.
- Privat 135-siders salgsoppgave: rapport 63–87 har usikker tekst/grafiske grader; lesbart sammendrag 40–43. Gammel 146-siders kontrollcase har ingen identifisert rapport. Private filer forblir ignorert.

## Tasks & Acceptance

**Execution:**
- [x] Agent 1: `src/backend/import/report-detection.ts`, `local-plan.ts`, `src/contracts/document-import.ts` og tilhørende tester — identifiser rapportgrenser med kildebelegg, bevar usikkerhet.
- [x] Agent 2: `src/backend/import/technical-risk.ts`, eventuell selvstendig parser og tilhørende tester — flerlinjede avvik, eksplisitte grader og tydelig merkede sammendrag. Avtal grensesnitt med agent 1.
- [x] Agent 3: ovennevnte frontendfiler og tilhørende unit/Playwright — synlig grad, forsiktig gruppering, prioritet, rapportområde/dekningsmangler og originale kilder. TG-teller beskriver gjeldende uttrekk.
- [x] Hovedagent: integrer, kontroller ekte PDF og negative/generiske eksempler; kjør regresjon, build/lint, Playwright, uavhengig BMAD-review og rett konkrete feil. Dokumenter i eksisterende prosessstruktur og commit med aktiv promptlogg.

**Acceptance Criteria:**
- Gitt ekte salgsoppgave, når import fullføres, så vises kildebelagte tekniske opplysninger og identifisert rapportområde med eksplisitt ufullstendig dekning og null betalte kall.
- Gitt generiske positive/negative rapporter, når de analyseres, så følger utfallet matrisen og kildene valideres mot originale fysiske sider.
- Gitt Konsept A, når funn åpnes med tastatur på desktop/mobil, så er alvorlighetsgrad, usikkerhet og originalkilde tilgjengelig uten endring av økonomiregler.

## Implementation Notes

Forankring: PRD FR-7–FR-11 og FR-18, godkjent Konsept A 2026-10-30, Code First-design 2026-10-29, faglærertilbakemelding og sensorveiledningens kildeuttrekk. Ny bestilling utvider lokale tekstmønstre; den innfører ingen garanti om universell recall eller ny finansregel. Tre undersøkelser er gjennomført før dispatch; hovedagent eier integrasjon og samlet verifikasjon.

## Spec Change Log

## Review Triage Log

Tre uavhengige BMAD-lag ble startet fra samme lagrede diff. Blind- og
verifikasjonslaget returnerte konkrete reproduksjoner. Kanttilfellelaget ble
avbrutt av leverandørens bruksgrense og regnes ikke som fullført review.
Alle nedenstående konkrete feil rettes innen eksisterende akseptansekriterier;
ingen endring i brukerens bestilling eller dekningsporter.

| ID | Dom og evidens | Ruting |
| --- | --- | --- |
| B1 | high: TG-først-format kutter første punkt ved linjeskift; tidligere fortsettelsesvakt mangler. | patch: hel avgrenset prosa eller usikker kandidat |
| B2 | high: eksplisitt parser tar umerket Ventilasjon inn i Tak/TG2; risikoparseren har annen grense. | patch: konsistente komponentgrenser |
| B3 | high: `Sluk mangler` behandles som komponentgrense og selve avviket forsvinner. | patch: sterkere overskriftsgrammatikk |
| B4 | high: hovedoverskrift med kolon nullstiller ikke gammel TG-kontekst. | patch: tegnsetting/nummerering og negativ prøve |
| B5 | high: teknisk samling skjer før kjent kjeller/loft-konflikt kontrolleres. | patch: bevar stedskontekst før samling |
| B6 | medium: backendens sammensatte rom/komponent finnes i separate kilder; krav om ett samlet sitat hindrer korrekt samling. | patch: valider alle navneledd og faktisk parser→gruppering |
| B7 | medium: separat rapport erstatter teknisk kilde i selector og skjuler salgsoppgavens sammendrag. | patch: bevar gjeldende sammendrag med originaldokument |
| B8 | medium: rom før komponent mister romkilde, mens omvendt rekkefølge støttes. | patch: begge rekkefølger innen samme blokk |
| B9 | medium: ren navngitt komponentliste under eksplisitt TG gir null, selv om matrisen omfatter komponentliste. | patch: bare oppgitt komponent/grad, ingen oppdiktet avviksprosa |
| B10 | high: henvisningsprosa med rapportnavn, dato og paginering blir sikkert omslag. | patch: reell tittel kreves |
| B11 | medium: 200 sammendragsrader fortrenger senere primære detaljfunn i delt kapasitet. | patch: detaljer før sammendrag og synlig kapasitetsmangel |
| V1 | medium: kort uavsluttet flerlinjeavvik mangler negativ prøve; eksisterende langtekstprøve tester annen vakt. | patch: kort negativ parser/import-test |
| V2 | high: gammel lokal parser lager funn med bare etiketten «Vurdering av avvik:» og ny parser lager hele avviket som ekstra funn. | patch: én sammenhengende ikke-legacy-parser, historisk replay bevares |
| E1 | high: eksplisitt START/SLUTT gir tidlig retur og skjuler en annen paginert rapport. | patch: begge områder bevares som ambiguous |
| E2 | high: samme Bad øst i første/andre etasje slås sammen via faktisk parseroutput. | patch: kjent etasjekontekst avstemmes før samling; overlapper B5 |
| E3 | high: flere punkter uten avviksmarkør blir bare første kontrollerbare punkt. | patch: samme rot som B1, hel avgrensning eller uavklart |
| B12 | high: ny navnelistefallback mister benektelsen «Ingen skader.» og lager TG3 med bare komponentnavnet. | patch: fallback bare ved sikker navneliste, benektet prosa beholdes til statusklassifisering |

Kanttilfellelaget ble senere gjenopptatt og fullførte uavhengig. Alle tre
reviewlag har etterprøvd de opprinnelige rettingene: blindlaget kjørte 126
relevante tester, verifikasjonslaget 69 samt fire direkte importreproduksjoner,
og kanttilfellelaget gjentok sine tre reproduksjoner. B12 ble funnet ved
blindlagets nykontroll og sendt tilbake til implementeringsagenten.

Hovedagentens egen kontroll: detaljmerket var «Rapportdetalj» også utenfor
identifisert rapport; endres til presis detaljtekstetikett. Den private
Playwright-prøven forventet én eksakt knappeetikett, men komponentbelegget gir
flere originalkilder. Kildevelgeren velger nå første belegg og kontrollerer
samme fysiske side; privat nykjøring består.

Endelig aksept: B1–B11 og E1–E3 er uavhengig reprodusert som rettet.
V1/V2 er uavhengig kontrollert med fire direkte importreproduksjoner. B12 er
uavhengig godkjent etter nye benektelses-/navnelisteprøver (36/36).
Full regresjon avdekket i tillegg bortfall av gammel, sikkert avgrenset
enlinjet TG uten sluttpunktum. Denne formatregresjonen er rettet uten å
oppheve flerpunktsvakten; stabil gammel ID og eksakt kildespenn testes.
Endelig fullsuite: 1804/1804. Ingen konkrete reviewfunn står urettet.

Matriseregnskap: rapport/uklart område dekkes av `report-detection.test.ts`;
eksplisitt TG, sammendrag og ufullstendig prosa av `technical-summary.test.ts`,
`technical-risk.test.ts`, `property-risk-import.test.ts` og Code First-prøvene;
gjentakelser av faktiske parser→grupperingsprøver i `risk-grouping.test.ts`;
originaler og separat rapport av `property-risk.spec.ts`. Alle disse kjørte
og bestod, inklusive ekte privat PDF, tastatur, fokusretur og mobil.
[Samlet bevis og avgrensning](../process/arbeidsokter/2026-11-03-teknisk-dokumentanalyse.md).

## Verification

- `npm test`, `npm run build`, `npm run lint` — relevante regresjoner skal bestå.
- Playwright på isolert lokal port med tom API-nøkkel — ekte PDF, originalside, separat rapport, tastatur og mobil.
- Uavhengig BMAD-review av samlet diff; dokumenter funn, rettinger og nykontroll.
