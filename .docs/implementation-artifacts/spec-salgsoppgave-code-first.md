---
title: 'PAA-SO2: code-first import med kontrollert AI-kostnad'
type: 'feature'
created: '2026-10-29'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '15402fc307726e0528c1ae0a068b36ab3dee5845'
context:
  - '{project-root}/.docs/planning-artifacts/salgsoppgave-code-first-design-2026-10-29.md'
---

<frozen-after-approval reason="Mads godkjente arbeidsplanen, Sol og USD 0,20 samlet ramme 2026-10-29">

## Intent

Erstatt syntetisk dokumentgjenkjenning med generell lokal analyse og en
testbar semantisk adapter. PDF.js leser alle opptil 200 sider; kode eier
strukturkandidater, sikre felt, kilder, dekningsregnskap og finans/screening.
AI behandler bare uløst tekst og nødvendig kontekst.

## Boundaries & Constraints

Bevar 50 MiB, lesbarhets-/ressursvern, originalkontroll og legacy-kontrakter.
Ingen ubehandlet rapporttekst eller TG-kandidat filtreres bort; mangler
sperrer bekreftelse. Ingen OCR, modellbytte, retry, betalt kall eller push.
Ny transport bygges og testes med stubber; produksjonsporten forblir stengt.

Godkjent: Sol/low/Standard, maksimalt ett semantisk kall per dokument, 40 000 input /
8 000 output inklusive reasoning, USD 0,20 samlet reservasjon per analyse.
Samme analyse med separat rapport deler budsjett. Ukjent pris/teller sperrer
live. Godkjenning autoriserer bare implementering og offline-verifikasjon.

## I/O & Edge-Case Matrix

| Tilfelle | Forventning |
| --- | --- |
| Sikkert eksplisitt felt | Kode gir ubekreftet verdi med eksakt kilde |
| Uklart felt/rapporttekst | AI får hele uløste blokker med kontekst |
| Ukjent rapportområde/raster | Synlig rest og sperret bekreftelse |
| Budsjett/teller/svarfeil | Ingen avkorting eller nytt automatisk kall |

</frozen-after-approval>

## Code Map

- `src/backend/documents/{extract-import,pdf-extraction-core,pdf-extraction-worker}.ts`: gjenbruk fysisk tekst/status, raster, grenser og cleanup.
- `src/backend/import/{local-plan,semantic-request,semantic-adapter,budget}.ts`: nye rene plan-/budsjettmoduler og injiserbar transport; gjenbruk `combined-request.ts` og eksisterende TG-regler.
- `src/contracts/document-import.ts`: versjoner manifest/adapterkontekst; gjenbruk felt/kilder/funn, bevar demo og legacy.
- `src/backend/http/{import-child,run-import,import-route}.ts`: koble plan/preflight; bevar lås, isolasjon, binding og stengt live.
- `src/domain/document-import.ts`, `src/frontend/{state/session.ts,screens/ProspectusImport.tsx}`: vis kostnad/rest og bind sperrer til gjeldende analyse.
- `src/domain/{source-economy,financing,finance,screening}.ts`: gjenbruk eksisterende regler; ingen regelendring.

## Tasks & Acceptance

- [x] Kontrakt/plan: komplette intervaller, kandidater og originaloffseter.
- [x] Request/adapter: én kompakt semantisk request og kildevalidering.
- [x] Budsjett/HTTP/UI: reservasjon, restvisning og uoverstyrbare sperrer.
- [x] `tests/{unit,integration,e2e}`, `tests/fixtures/sales-prospectus/`: uavhengig fasit før adapterdata; dekk designets negative prøver.
- [x] `README.md`, prosessbevis og sentral deferred-work: faktisk støtte og lokal commit med aktiv promptlogg.

**Akseptansekriterier:**

1. Gitt TG2/TG3 uten nøkkelordtreff, når tekst velges, da følger hele uløste rapportgrunnlaget med eller bekreftelse sperres.
2. Gitt manglende blokk/kandidat, raster eller uklar identitet, når svaret valideres, da kan AI eller bruker ikke erklære komplett dekning.
3. Gitt ukjent teller/pris eller reservasjon over taket, når transport vurderes, da skjer null modellkall og ingen tekst kuttes.
4. Gitt stubbet SDK, når import fullføres, da brukes faktiske parser-/kilde-/finans-/screeninggrenser og menneskelig bekreftelse.

## Implementation Notes

2026-10-29: Mads godkjente arbeidsplan og AC, GPT-6.1 Sol og USD 0,20 for
samlet analyse inklusive separat rapport. Bygg, full offline-verifikasjon og
uavhengig BMAD-review er autorisert; ingen betalte kall/push og eksplisitt
stopp før første live-test. Baseline beholdes som registrert ved planlegging.
Bare aktiv promptlogg var endret ved gjenopptak. Implementeringsagenten
leverer endringer og bevis uten commit; hovedagenten eier sluttkontroll og
lokal commit med aktiv promptlogg.

Hovedagenten har lest implementeringsdiffen mot baseline og avstemt AC1–4
og alle fire matriselinjer mot kjørte tester: lokale eksakte kilder,
markerfri resttekst, uavklart område/raster og transport-/budsjettfeil.
73 målrettede core/state/PDF, 14 HTTP og 11 berørte E2E består. Første
fulle unit/integrasjon består med 1356 tester. Dokumentasjon er oppdatert;
uavhengig review, endelig verifikasjon og commit gjenstår.

Sluttakseptanse: AC1–4 og alle fire matriselinjer består for godkjent offline-scope.
1384 full unit/integrasjon, 218 full bygget + 3 dev, 37 komponent og 11
berørte E2E etter siste presentasjonsretting; siste bygg/typekontroll og lint
består. 58 runtime-/UI-prøver bekrefter siste tekst og ren typeretting i
teststubben. 20 reviewfunn er individuelt triagert og rettet; alle tre siste
uavhengige nykontroller er uten restfunn. Se
[samlede bevis og avgrensninger](salgsoppgave-code-first-2026-10-29/verifikasjon.md).
78 låste finans-/screening-/historikkfiler og opprinnelige prompt-/oversiktsprefix
er bevart. Ingen reviewfunn er utsatt; PAA-SO2 forblir åpen for senere live/kvalitet.
Ingen produksjonsteller eller reell modellkvalitet påstås. Lokal commit følger
med aktiv promptlogg, uten betalte kall/push og med stopp før første live-test.

## Spec Change Log

## Review Triage Log

| ID | Linse | Dom | Bevis og rute |
| --- | --- | --- | --- |
| B1 | blind | medium | Planen hopper over kandidater i bevart tekst på incomplete-side; kontrakten krever dem. Bevar som uavklart. patch |
| B2 | blind | medium | Lokal TG-match over 2000 tegn kaster før partielt utfall. La lange matcher forbli semantisk rest. patch |
| B3 | blind | medium | Gjentatt adresse/pris overskrider eksisterende arrays. Dedupliser identisk belegg og håndter faktisk overflow med synlig rest. patch |
| B4 | blind | medium | TG kan deles over 1600-grensen mens kandidatbelegg krever ett spenn. Flytt grense utenfor kandidat. patch |
| B5 | blind | medium | Tilstandsgrad: 2 godtas av kandidatparser, men ikke gradbelegg. Gjenbruk samme grammatikk. patch |
| B6 | blind | high | Semantisk unknown/null kan slette lokalt eksplisitt periode/år. Bevar kjent verdi og vis reell motstrid. patch |
| B7 | blind | high | includedIn godtas uten kategori-/relasjonsbelegg. Kontroller støttet relasjon før økonomiforslag. patch |
| B8 | blind | high | Fortsettelser kan ikke oppdatere lokalt funn, og identiske lokale oppføringer kan få komplett dobbeltliste uten avstemming. Bruk eksisterende ID-er/kandidatdisposisjon for kildebundet avstemming. patch |
| B9 | blind | high | limitations ignoreres ved komplettstatus, selv ved uløst tabellkobling. Bevar som dekningsrest. patch |
| B10 | blind | high | Funn godtas med oppdiktet bygningsdel/beskrivelse selv om kilde bare støtter graden. Krev kontrollerbart tekstbelegg; uklar tolkning sperres. patch |
| B11 | blind | medium | Designcheckpointet er historisk korrekt, men sentral oversikt mangler aktuell godkjenning/levering. Append oppfølging; ikke omskriv historikk. patch |
| E1 | edge | medium | Samme gjentatte kildeoverflow som B3, reproduksjon med 21 adresser. patch, felles rotårsak B3 |
| E2 | edge | medium | Schema tillater amount:null; eksisterende beløp får conflict uten alternativ og terminalparse kaster. Bevar lokalt felt. patch |
| E3 | edge | medium | Samme kolon-grad som B5, selvstendig reproduksjon. patch, felles rotårsak B5 |
| E4 | edge | medium | Samme delt kandidat som B4. patch, felles rotårsak B4 |
| V1 | verification | medium | Pre-verifisert testgap: ny lokal priskonflikt er ikke prøvd frem til economySuggestions/P. Legg til negativ finansgrenseprøve. patch |
| V2 | verification | medium | Selvstendig amount:null-reproduksjon bekrefter E2; final parse ligger utenfor fallback. patch, felles rotårsak E2 |
| R1 | root | medium | Catch kopierer vilkårlig SDK/schema error.message til offentlig cost.reason. Begrens til interne kontrollerte feilkoder. patch |
| B12 | blind recheck | high | Planen gjenkjenner tak/Tak som mulig duplikat, men terminal avstemmingsgate sammenligner case-sensitivt og tillater to uavstemte funn. Bruk samme normalisering og prøv begge skrivemåter. patch |
| E5 | edge recheck | medium | Reproduksjon innen PDF-grensene: 200 sider / 968293 UTF-8-bytes gir 600 uløste blokker + 401 kandidater, mer enn 1000 residualer; terminalparse mister delresultat. Bevar full restoversikt innen forsvarlig ressursgrense og legg til faktisk 200-sidersprøve. patch |

## Verification

Etter godkjenning: pinned Node/npm, tom nøkkel og offline transport; målrettede
tester, `npm test`, `npm run build`, `npm run lint`, berørte Playwright-flyter
og uavhengig BMAD-review. Finans-/screeningdiff skal være uten regelendringer.
Stopp igjen før første live-test; stubber beviser ikke modellens TG-recall.
