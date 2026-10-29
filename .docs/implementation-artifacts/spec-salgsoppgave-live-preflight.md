---
title: 'PAA-SO2: klargjør første code-first live-test'
type: 'feature'
created: '2026-10-29'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '27b5ac2635300881832ec93ab8f22955e9c4b9e8'
context:
  - '{project-root}/.docs/planning-artifacts/salgsoppgave-code-first-design-2026-10-29.md'
---

<frozen-after-approval reason="Mads bestilte lokal klargjøring, tester/review og commit; ingen betalte kall eller push">

## Intent

Klargjør en reproduserbar første Sol-test med eksakt request, frossen original,
uavhengig økonomi-/TG-fasit og kontrollerbar samlet USD 0,20-reservasjon.
Testen skal kunne sammenlignes før menneskelig retting. Ikke kjør live.

## Boundaries & Constraints

Gjenbruk eksisterende PDF.js, schema, semantisk request, kildevalidering og
finans/screening. Bevar Sol/low/Standard, 40k input/8k samlet output inklusive
reasoning, ingen retry og én kvote delt med separat rapport.

Ikke anta en tokenizer/encoding eller fullt request-format som ikke kan
verifiseres. Ingen oppdiktet sikkerhetsmargin eller testteller blir produksjonsbevis.
Ingen API-/token-count-kall, nøkkellesing eller aktivering i klargjøringskommandoen.
Dokumenterte eksterne blokkeringer gir `ready: false`, ikke falsk klar-status.

## I/O & Edge-Case Matrix

| Grunnlag | Forventning |
| --- | --- |
| PDF og fasit | Fast hash, fysiske sider, felter, forhold og kildeutdrag |
| Request | Reell SDK-serialisering er lik planlagt payload inklusive schema |
| Budsjett | Varig reservasjon før mulig transport; samme kvote etter omstart/rapport |
| Ukjent teller/pris/historikk | Null kall, synlig blokkering, ingen avkorting |
| Manglende/ekstra/feil funn | Sammenligning rapporterer avvik, ikke godkjent prøve |

</frozen-after-approval>

## Code Map

- `src/backend/import/{semantic-request,semantic-adapter,budget,offline-sdk-transport}.ts`: gjenbruk hele requesten, digest, strict retur og Big.js-reservasjon.
- `src/contracts/document-import.ts`: behold kilde-/intervall-/kandidatkontroll og alle gjeldende grenser.
- `src/backend/import/analysis-budget-store.ts`: ny varig, eksklusiv lokal budsjettgrense under ignorert `private/`; manglende/korrupt/låst historie sperrer.
- `src/backend/import/{live-preflight,oracle-comparison,prepare-live-test}.ts`: ny offline klargjøring, wire-bevis og fasitsammenligning; ingen betalt klient i kommandoen.
- `tests/fixtures/sales-prospectus/code-first-oracle.json`: allerede frossen før dette arbeidet; generer fast femsiders syntetisk original, bevar gammel fasit.
- `tests/{unit,integration}/*preflight*.test.ts`, `package.json`: testklargjøring og dokumentert kommando.

## Tasks & Acceptance

- [x] Frys faktisk PDF/hash/uttrukne fysiske sider og separat håndskrevet økonomi-/TG-fasit før sammenligningskode/stubber. Første syntetiske tekniske prøve er ingen produksjonsbenchmark.
- [x] Lag eksakt request-/SDK-wire-pakke, gjennomfør lokal tokenizerundersøkelse og bevar reelle blokkeringer.
- [x] Håndhev delt varig reservasjon, lås og trygt stopp; test krasj/omstart, korrupt historikk og budsjettgrensene uten nett.
- [x] Sammenlign schema-/kildevalidert resultat med frossen fasit uavhengig av modellgenererte ID-er; rapporter mangler/ekstra/grad-/kilde-/økonomiavvik.
- [x] Kjør relevante tester/build/lint og uavhengig review; dokumenter resultat, sentral PAA-SO2 og lokal commit med aktiv promptlogg.

**AC:**
1. Gitt faktisk SDK-serialisering, når preflight lages, da er hele payloaden digestbundet; en endring eller manglende verifisert teller hindrer klar-status.
2. Gitt salgsoppgave og separat rapport, når prosess starter på nytt, da består samme reservasjoner og samlet forbruk kan ikke få ny USD 0,20-kvote.
3. Gitt budsjettbrudd/ukjent historie/teller/pris, når kjøring vurderes, da skjer null eksterne kall og tydelig stopp.
4. Gitt et kontrollert analysesvar, når fasiten sammenlignes, da avvises feil original, utelatt TG2/TG3, ekstra/feil grad/kilde og økonomisk avvik.

## Implementation Notes

Bestillingen viderefører godkjent code-first-design og ramme; ingen nye
produktvalg eller irreversible handlinger inngår. Brukeren har autorisert
klargjøring og nødvendige tester/review; ingen ny designgodkjenning kreves
for denne operative videreføringen. Før implementering er bare aktiv prompt
og ny tokenizerundersøkelse endret. Undersøkelsen viser tiktoken 0.14.0 uten
Sol-mapping; full lokal framing er ikke dokumentert. Token-count-pris er
ikke dokumentert som gratis; ingen endpointkall autoriseres eller utføres.
Implementeringsagenten gjør ingen commit; hovedagenten eier sluttkontroll.

Offline-klargjøringen er ferdig; `done` innebærer ikke live-klar status.
Token/framing og representativ produksjonsoriginal/fasit er åpne porter i
sentral PAA-SO2. Ingen betalt transport er koblet inn.

## Spec Change Log

## Review Triage Log

| Funn | Dom | Individuelt bevis og rute |
| --- | --- | --- |
| B1 | low | Normalisering fjerner ikke sluttpunktum; identisk forhold får missing+extra. Patch: ubetydelig slutt-tegnsetting. |
| B2 | medium | commonCosts sjekker bare beløpslinjen, ikke separat herav-kilde for debtPart. Patch: originalbundet relasjonsbelegg og negativ prøve. |
| B3 | medium | Sammenligner sjekker ikke cost.status, og schema tillater usikker kostnad med ellers korrekt funnliste. Patch: komplett kostnadsutfall. |
| B4 | medium | Teknisk limitations inngår ikke i sammenligningsvakten; schema sperrer uncertainties, men ikke limitations her. Patch: eksplisitt avvik. |
| B5 | medium | Runtime-vakten sjekker ikke instructions/text, selv om begge ligger i tillatt nøkkelliste. Patch: eksakt godkjent prompt/schema. |
| B6 | high | assess bruker ledger-instans/historikk uten rotbinding; feil analyses journal kan reserveres. Patch: bind intern dokument-/foreldremetadata til hash og journalrot. |
| B7 | medium | Ny varig persist kan kaste etter transport; adapterens catch forsøker settle igjen på forgiftet journal. Patch: strukturert usikkert stopp, behold lås/reservasjon. |
| B8 | high | initialize åpner ny history med wx, men ser ikke etter eksisterende pending før skriving. Patch: ingen initialisering over uløst skrivebevis. |
| B9 | low | README viser manuell avstemming uten prosedyre. Direkte dokumentasjonspatch i verifikasjon: eier, kopi, forbruk, bevaring og fortsatt sperre ved tvil. |
| B10 | medium | Versjon er literal både i capture og verify; fremtidig SDK-oppgradering vil feilmerkes. Patch: les installert versjon, sammenlign med låst godkjent versjon. |
| E1 | low | Samme konkrete sluttpunktum-reproduksjon som B1 er verifisert mot normaliseringen. Patch, gruppert først etter denne dommen. |
| E2 | medium | ownership-verdi sjekkes uten ownershipSources; schema validerer bare kilder som finnes. Patch: frosset originalbelegg og kildekrav. |
| V1 | medium | Preverifisert gap: isolert schema-gyldig inkomplett status er ikke testet; sletting av completeness-vakt lar testene bestå. Patch: egen negativ assertion. |
| V2 | medium | Preverifisert reproduksjon: pending opprettet etter reservasjon gir kastet feil i andre settle. Patch, samme rotårsak som B7. |

## Verification

Pinned Node24/npm11, tom nøkkel og all transport stubbet. Test lås, varig
reservasjon, restart, total USD 0,20, timeout, wire-mutasjon og negative
fasit-/kildeutfall. Kjør relevante nye/berørte tester, full unit/integrasjon,
build/lint og uavhengig BMAD-review. Bevar tidligere bevis og finansregler.
Resultatrapport skiller `ready:false` fra ferdig offline klargjøring. Stopp
før første live-test, med bare faktiske blokkeringer og neste handling i chat.

Endelig: 1418/1418 unit-/integrasjonstester, build/typecheck og lint består.
14 funn er rettet; tre uavhengige nykontroller har ingen restfunn.
[AC-matrise, råbevis og porter](salgsoppgave-live-preflight-2026-10-29/verifikasjon.md),
[review](salgsoppgave-live-preflight-2026-10-29/review.md) og
[nykontroller](salgsoppgave-live-preflight-2026-10-29/review-recheck.json).
