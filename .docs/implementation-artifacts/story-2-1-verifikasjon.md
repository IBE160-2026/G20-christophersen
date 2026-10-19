# Story 2.1 — Egenverifikasjon før separat review

Dato: 2026-10-19. Implementeringsbaseline:
`856c72bd47e8477c2e21acb3ec4fa40fc6209125`.
Fase 4-agenten hadde eksklusivt skriveansvar. Autoritet er uendrede
[Story 2.1 AC/testkrav](../planning-artifacts/epics.md#story-21-dele-og-validere-dokument-analysekontrakten),
sprintplan/status/readiness, final PRD/UX/arkitektur/SPEC og kurs-/faglærergrunnlag.
Dette er implementeringens egenverifikasjon; uavhengig review gjøres i Fase 5.

## Leveranse og AC-bevis

| AC | Faktisk kode og etterprøving | Egenkontroll |
|---|---|---|
| AC1 — felles versjoner, identitet, sider, terminalstatus | `document-analysis.ts` eier alle runtime-schemas og avledede typer. `DocumentBasisSchema` krever metadata og nøyaktig én ordnet pages-post per PDF-posisjon, tekst og status. `AnalysisOutcomeSchema` skiller completed/failed uten suksessdefaults. Første testgruppe prøver begge moduser, manglende felt, ugyldig versjon/hash/sideantall, manglende/dupliserte/omordnede sider og manglende tekst/status. | Bestått |
| AC2 — tomliste, feil og delresultater | Bare eksplisitt completed med findings/uncertainCandidates/limitations er fullført. Manglende svar/findings blir invalid-response. document-/analysis-feil har enumkode, eksplisitt kjent mål eller null og trygg kodegenerert årsak/eksplisitt ukjent årsak. Delresultater finnes bare under failed med completeness: incomplete. Kjente dokument-/side-/funnmål og feil uten delresultat prøves. | Bestått |
| AC3 — kontrollerbare TG2/TG3 kontra RT-7 | `getCandidateIssues` er samme kildekontroll ved binding og ferdig svarvalidering. Side 99 av 10, 0, desimal, ukjent/manglende/string-side, kilde uten dokument, annet dokument/hash og uklar/manglende grad blir uncertainCandidates med original og alle konkrete kjente mangler. Confidence 100 oppgraderer ingen kandidat. Originalen beholdes uten trimming/omskriving og fryses sammen med kilden/usikkerhetsarrayet. Manipulering av ferdig kilde/grad/tekst og bortforklarte mangler avvises. | Bestått |
| AC4 — kodekontrollert dokument-/korrelasjonsidentitet | `bindAnalysisOutcome` henter metadata bare fra validert dokumentkontekst og ignorerer ekstra modellvalgt toppmetadata. Tester forsøker å erstatte requestId/hash/dokument/modus/sideantall og sette brukerbekreftelse/semantikkpåstand. `validateAnalysisOutcome` kontrollerer ferdig svar mot forventet kontekst igjen. Kontraktversjon/uttrekksversjon kan aldri overstyres. Struktur/kildeområde merkes bare structure-and-source. | Bestått |

Strukturelt ugyldig intern kodekontekst/dokumentgrunnlag kaster eksplisitt
Zod-feil. Ukjent/ugyldig adapterretur blir et trygt failed-resultat uten
rå leverandørfeil, stack, privat sti eller hemmelighet. API-/transportlaget
er ikke implementert her; det må senere håndtere de interne valideringsfeilene.

## Faktiske kontroller

[Råutdata](story-2-1-kontroller.txt) bevarer alle sluttkommandoer med exit 0:

- Node **24.21.0**, npm **11.19.0**, fra eksisterende lokal runtime
  `/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin` først i PATH.
- `npm test -- tests/unit/document-analysis.test.ts`: **90/90 bestått**.
- `npm test`: **270/270 bestått**, seks testfiler.
- `npm run typecheck`, `npm run lint`, `npm run build`: **bestått**.
- Mini-sprintens SHA-256-register
  `/tmp/ibe160-mini-sprint-1-6-2-2-locked.json`: **101/101 uendret**.
- Importkontroll: begge nye moduler bruker bare Zod/andre lokale contracts.
  Ingen React, Express, PDF, fil, nettverk eller miljøbruk. Ingen nye avhengigheter.
- `git diff --check`, staged-diff og selve commit-diffen kontrolleres ved overlevering.

E2E og manuell UI-kontroll gjentas ikke i denne fasen: ingen frontend-,
server- eller eksisterende appkobling er endret. Full modulregresjon og
type/lint/build er kjørt. 41 demo-/2 dev-E2E fra forrige review omtales ikke
som nykjørt i denne fasen.

## Avgrensning og status

Det finnes ingen PDF-parser, faktisk bytehash, tekstuttrekk, fixtureadapter,
leverandørintegrasjon, HTTP-analyse eller ny frontendflyt i leveransen.
Testkontekstens hash er eksplisitt fiktiv; faktiske bytes/hash kobles i 2.2.
Dokumentstatus er bare kontraktens mottatte status. Tom tekst godtas
strukturelt uten tekstlengdeheuristikk og beviser ingen lesbarhet. En
rapportert unreadable/incomplete/unknown-side blir dokumentfeil ved binding;
selve metoden for å avgjøre status er ikke valgt eller implementert.

Ingen testcase beviser live KI-treff, semantisk fullstendighet, kontroll av
originaltekst, brukerbekreftelse, S2, S5 eller S6. R2 forblir **open**;
Story 2.3 startes ikke. Alle låste krav/UX/arkitektur/SPEC/epics/story-AC er
beholdt. Ingen blocker eller nytt produkt-/arkitekturvalg oppsto.

Storyspec er **in-review**, sprintnøkkel **review**, Epic 2 **in-progress**.
Lokal implementeringscommit opprettes ved overlevering, uten push. Neste
steg er ny separat Fase 5-agent med BMAD code review av denne leveransen.
