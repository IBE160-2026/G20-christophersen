---
title: 'Reell dokumentanalyse fra opplasting'
type: 'feature'
created: '2026-10-30'
status: 'done'
route: 'dispatch'
baseline_commit: 'c06067ce58e9bb1d1945abecfe2889a6468dd7b2'
context: []
---

<frozen-after-approval reason="Brukerens implementeringsoppdrag uten ny omfattende planrunde">

## Intent

Nye ukjente salgsoppgaver skal analyseres fra brukergrensesnittet. Lokal kode henter entydige dokumentverdier; eksisterende AI-økonomipipeline tolker fritekst som fortsatt er uavklart. Den nye private PDF-en på 135 sider er kontrollgrunnlaget, aldri resultatene fra første eiendom.

## Boundaries & Constraints

Bevar eksakt dokumenthash, originaltekst, fysisk side og offset, desimalpresisjon og finansregler. Manglende opplysninger blir ukjent. Kostnad og overføring av konkrete dokumentutdrag krever hver sin uttrykkelige godkjenning før transport. Ingen betalte kall i utviklingsøkten, ingen push. Teknisk dekning blir aldri komplett som følge av økonomianalyse. Overskridelser og uavklarte deler vises. Historiske analyser må bare brukes for identisk dokument.

## I/O & Edge-Case Matrix

| Tilfelle | Inndata | Forventning | Feil |
| --- | --- | --- | --- |
| Ny ekte PDF | 135 sider i tom økt | Sikre økonomiverdier med egne kilder | Mangler forblir ukjent |
| Samme filnavn | Ny PDF etter første eiendom | Ingen tall, forutsetninger eller kilder lekker | Gamle svar ignoreres |
| AI nødvendig | Uløst økonomitekst | Gratis forhåndsvisning av utdrag og kostnad | Ingen transport før begge samtykker |
| Tom adresseetikett | Budskjema på side 134 | Ingen kandidat fra neste skjemafelt | Identitet forblir uavklart ved manglende sikkert belegg |
| Ugyldig AI/samtykke | Feil digest eller manglende samtykke | Avvis uten nye tall | Ingen automatisk retry |

</frozen-after-approval>

## Code Map

- `src/backend/import/local-plan.ts`: smal linjegrammatikk og adresse-regex er årsaken til tom økonomi og falske kandidater.
- `src/backend/import/economy-request.ts`, `economy-compact.ts`, `economy-local-budget.ts`: eksisterende referansebasert AI, kodeeide beløp og varig kostnadsreservasjon. Historisk prøvesamtykke bevares; generell UI får egen uttrykkelig port.
- `src/backend/http/import-child.ts`: leser ny PDF lokalt, mangler generell AI-kobling.
- `src/frontend/state/import-session.ts`: gjenbruk isolasjon, hash og generasjonskontroll.
- `src/contracts/document-import.ts`: egen liveproveniens med bundet request og sider.

## Tasks & Acceptance

- [x] `src/backend/import/local-plan.ts` og tester: sikre nye formatvarianter, ingen falske adressekandidater.
- [x] `src/backend/http/` og importmoduler: gratis forberedelse, eksplisitt godkjenning, eksisterende AI og kildevalidering.
- [x] `src/frontend/` og kontrakter: synlig analysebehov, utdrag, kostnad og sikre nye resultater.
- [x] `tests/e2e/new-document-import.spec.ts`: ekte PDF, originalkilder, isolasjon, samtykkeflyt.
- [x] `.docs/process/arbeidsokter/`: dokumenter årsak, tester og gjenværende faktiske begrensninger.

Given et nytt dokument, when det lastes opp, then sikre dokumenttall vises med egne originale kilder.
Given uløst relevant tekst, when brukeren åpner AI-forberedelsen, then faktiske utdrag og maksimal kostnad vises før overføring.
Given et nytt dokument etter et gammelt, when gamle svar ankommer, then tidligere eiendomsdata kan ikke brukes.

## Implementation Notes

Brukerens oppdrag autoriserer implementering og testing uten ny omfattende planrunde. Ingen ekstern effekt utføres ved forberedelse. Faglærerens tilbakemelding og eksisterende code-first-design støtter enkel pipeline, finans i kode, usikkerhet, kilder og kjørbar offline-modus. Undersøkelsen viser økonomitall på fysisk side 4 og 49; gammel parser støtter ikke layouten. PDF-er og dokumentutdrag beholdes privat.

## Verification

Målrettede enhets-/integrasjonstester, typecheck, lint, build og Playwright med den ekte private PDF-en. Betalt AI-transport testes med eksplisitt lokal stub; reell modellkvalitet kan ikke dokumenteres uten senere uttrykkelig godkjent API-kall.


## Review Triage Log

Se [konkrete funn, vurderinger og rettinger](nye-salgsoppgaver-2026-10-31/review.md). Funnene er rettet og verifisert. Blind-review har bare delrapport etter agentens kapasitetsgrense; hovedagenten har kontrollert siste diff og testbevis. Ingen påstand om reell modellkvalitet eller komplett teknisk analyse.

## Leveringsgrense

Økonomiflyten er implementert og verifisert med lokal/stubbet transport. Brukerens videre mål om full analyse av vilkårlige integrerte rapporter er ikke ferdig. PAA-SO2 forblir eksplisitt åpen i den sentrale oversikten. Ingen betalte kall eller push. Sluttbevis: [1626 tester](nye-salgsoppgaver-2026-10-31/tests.txt), [23 nettlesertester](nye-salgsoppgaver-2026-10-31/playwright.txt), [bygg](nye-salgsoppgaver-2026-10-31/build.txt) og [lint](nye-salgsoppgaver-2026-10-31/lint.txt).
