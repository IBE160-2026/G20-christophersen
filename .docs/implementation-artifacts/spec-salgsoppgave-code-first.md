---
title: 'PAA-SO2: code-first import med kontrollert AI-kostnad'
type: 'feature'
created: '2026-10-29'
status: 'draft'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '15402fc307726e0528c1ae0a068b36ab3dee5845'
context:
  - '{project-root}/.docs/planning-artifacts/salgsoppgave-code-first-design-2026-10-29.md'
---

<frozen-after-approval reason="Avventer Mads' designgodkjenning; ingen implementering er startet">

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

Foreslått: Sol/low/Standard, maksimalt ett semantisk kall per dokument, 40 000 input /
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

## Open Questions

1. Godkjenn anbefalt design med bevart Sol og USD 0,20-tak, eller endre
   modell/budsjett før bygging. Billigere Luna krever egen kvalitetsprøve;
   modellbytte er ikke underbygget av offline-stubber.

## Code Map

- `src/backend/documents/{extract-import,pdf-extraction-core,pdf-extraction-worker}.ts`: gjenbruk fysisk tekst/status, raster, grenser og cleanup.
- `src/backend/import/{local-plan,semantic-request,semantic-adapter,budget}.ts`: nye rene plan-/budsjettmoduler og injiserbar transport; gjenbruk `combined-request.ts` og eksisterende TG-regler.
- `src/contracts/document-import.ts`: versjoner manifest/adapterkontekst; gjenbruk felt/kilder/funn, bevar demo og legacy.
- `src/backend/http/{import-child,run-import,import-route}.ts`: koble plan/preflight; bevar lås, isolasjon, binding og stengt live.
- `src/domain/document-import.ts`, `src/frontend/{state/session.ts,screens/ProspectusImport.tsx}`: vis kostnad/rest og bind sperrer til gjeldende analyse.
- `src/domain/{source-economy,financing,finance,screening}.ts`: gjenbruk eksisterende regler; ingen regelendring.

## Tasks & Acceptance

- [ ] Kontrakt/plan: komplette intervaller, kandidater og originaloffseter.
- [ ] Request/adapter: én kompakt semantisk request og kildevalidering.
- [ ] Budsjett/HTTP/UI: reservasjon, restvisning og uoverstyrbare sperrer.
- [ ] `tests/{unit,integration,e2e}`, `tests/fixtures/sales-prospectus/`: uavhengig fasit før adapterdata; dekk designets negative prøver.
- [ ] `README.md`, prosessbevis og sentral deferred-work: faktisk støtte og lokal commit med aktiv promptlogg.

**Akseptansekriterier:**

1. Gitt TG2/TG3 uten nøkkelordtreff, når tekst velges, da følger hele uløste rapportgrunnlaget med eller bekreftelse sperres.
2. Gitt manglende blokk/kandidat, raster eller uklar identitet, når svaret valideres, da kan AI eller bruker ikke erklære komplett dekning.
3. Gitt ukjent teller/pris eller reservasjon over taket, når transport vurderes, da skjer null modellkall og ingen tekst kuttes.
4. Gitt stubbet SDK, når import fullføres, da brukes faktiske parser-/kilde-/finans-/screeninggrenser og menneskelig bekreftelse.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Verification

Etter godkjenning: pinned Node/npm, tom nøkkel og offline transport; målrettede
tester, `npm test`, `npm run build`, `npm run lint`, berørte Playwright-flyter
og uavhengig BMAD-review. Finans-/screeningdiff skal være uten regelendringer.
Stopp igjen før første live-test; stubber beviser ikke modellens TG-recall.
