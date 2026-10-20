---
title: 'Story 2.6 — Velge rapport og ta imot bare gjeldende analyseutfall'
type: 'feature'
created: '2026-10-20'
status: 'in-review'
route: 'dispatch'
story_key: '2-6-velge-rapport-og-ta-imot-bare-gjeldende-analyseutfall'
baseline_commit: 'f0f394d50a451d3359553685d3be6f3af2fab3a3'
context:
  - '.docs/implementation-artifacts/epic-2-context.md'
  - '.docs/specs/spec-IBE160/grensekontrakter.md'
---

<frozen-after-approval reason="Brukerens eksplisitte bestilling av bare Story 2.6 med tester og lokal commit">

## Intent

Lever Story 2.6 AC1–AC6 fra godkjent epics.md: én valgt originalrapport, eksplisitt analyse og bare gjeldende validerte utfall. Vis alle funn og usikkerheter, feil og gyldig tomliste separat. Spor FR-4/6–9/11/18, AD-2/4–6/9/10, RT-3/4/7/9/10/15/19.

## Boundaries & Constraints

Frontendøkt fra 1.7 eier originalbytes/fil, original SHA-256, analysegenerasjon og uendret uttrekk. Bruk eksisterende HTTP- og analyse-runtimekontrakter, demo og samme backendpipeline. Ett eksplisitt POST med økt/request/generasjon; sperr dobbeltstart synkront. Valider svarstruktur og økt/hash/request/generasjon, også HTTP 200. Avvist transport er lokal feil uten oppdiktet fullføring. Navigasjon fra pågående analyse eller rapportbytte ugyldiggjør generasjon, forsøker abort og forkaster gamle svar. Ingen automatisk retry. Uendret completed gjenbrukes ved retur og finansendring. Fullføring bekrefter aldri listen eller tekniske forhold. Domain fra 1.6 eier lokale kodebaserte mangler.

Behold Demo · lagret KI-uttrekk gjennom flyten. Kort status kunngjøres én gang uten fokusflytting. Ferdiglistehendelsen registreres først etter at validert liste er montert synlig i trinn 3; ingen timer/telemetri. Ingen PDF-visning, retting/avvisning/bekreftelse/TG3-handlinger, live, 2.7+ eller ny arkitekturbeslutning. Originalen beholdes bare i aktiv økt; ingen persistens eller innholdslogger.

## I/O & Edge-Case Matrix

| Gitt / handling | Forventet |
|---|---|
| Manglende tall eller fil, Start | Lokal forklaring, null HTTP |
| Valgt rapport, dobbel Start | Analyserer og ett POST |
| Gyldig completed / eksplisitt tom liste | Alle funn/usikkerheter eller særskilt tomlistetekst; ubekreftet |
| Manglende/ugyldig JSON, feil korrelasjon/hash/modus | Analysefeil, ikke fullføring |
| Document-/analysis-feil med delresultat | Ufullført, merket delresultat og domain-mangel |
| Rapportbytte/forlatt analyse, sen retur også uten reell abort | Ingen gammel fullføring; ny analyse nødvendig |
| Retur og finansendring etter completed | Uttrekk beholdes, ingen ny HTTP; rapportmangler består |
| Validert liste mottatt men ikke synlig | Ingen ferdiglistehendelse før faktisk montering |

</frozen-after-approval>

## Code Map

- `src/frontend/state/session.ts`: utvid eksisterende økt og navigasjonsvern uten finansendringer.
- `src/frontend/state/report.ts`: ny ren rapportreducer, runtime-/identitetsvern og mangelprojeksjon til eksisterende domain.
- `src/frontend/analysis/report-client.ts`: ny imperativ fil/hash/HTTP/abort-grense; ingen backendimport.
- `src/frontend/App.tsx`, `screens/ReportAnalysis.tsx`, `styles.css`: rapportvalg/status og trinn 3-liste med synlighetskvittering, eksisterende tokens/fokus.
- `src/contracts/analysis-http.ts`, `document-analysis.ts`, `src/domain/screening.ts`: gjenbruk uendret.
- `tests/unit/`, `tests/e2e/`, `playwright.config.ts`: forløp/race/feil/gjenbruk og faktisk bygget app.

## Tasks & Acceptance

- [x] Implementer ren rapportstate og sessionintegrasjon i oppgitte statefiler.
- [x] Implementer originalhash, POST, synkront dobbeltvern og abort i klientgrensen.
- [x] Implementer rapportvalg og alle terminalvisninger i App/skjerm/CSS.
- [x] Dekk alle matriserader med kjørte tester og full regresjon.
- [x] Lag verifikasjon/prosesspor, konsistent sprintstatus review og lokal commit.

Given bekreftet finans og rapport, when Start, then ett korrelert POST (AC1). Given aktiv retur, when struktur/identitet vurderes, then bare korrekt svar brukes (AC2). Given forlatt/erstattet generasjon, when sent svar kommer, then det forkastes (AC3). Given terminalutfall, when vist, then fullføring/tomliste/feil er forskjellige og mangler er domainbaserte (AC4). Given uendret uttrekk, when finans/retur endres, then ingen HTTP (AC5). Given status/liste, when montert, then kort kunngjøring og hendelse først ved synlighet (AC6).

## Implementation Notes

Ingen intensjonsgap eller irreversible handlinger. BMAD rendret nøyaktig én gang. Brukerens godkjente sekvensielle fasebestilling autoriserer spec/implementering uten menystopp. Ingen nestede subagenter; undersøkelse og interne reviewlinser kjøres sekvensielt av samme implementeringsagent, separat uavhengig review følger i fase 3. Kurs-/faglærerføring om sporbarhet, avgrenset scope og faktiske testbevis videreføres fra Epic 2-konteksten og låst arkitektur.

## Verification

Kjør målrettet state-/klient- og bygget-app-E2E, deretter npm test, typecheck, lint, build og test:e2e. Ingen live-tid eller semantisk KI-kvalitet bevises. Storyen leveres in-review/review, 2.7 backlog.


## Review Triage Log

Intern build-kontroll ble utført sekvensielt av implementeringsagenten etter
brukerens forbud mot samtidige/nestede subagenter. Dette er ikke den separate,
uavhengige BMAD code reviewen som følger i fase 3. Diffen ble lest mot alle AC
og matriserader. Blindlinse: 55,278 kB gir min(floor(sqrt(55,278)+1),10)=8.
Alle åtte konkrete forbedringspunkter ble håndtert; ingen utsatt produktfeil.

| ID / linse | Verdict / evidens / retting |
|---|---|
| B1 / blind | medium: montert liste under fold kunne gi ferdighendelse. IntersectionObserver krever skjæringsflate innen rullbar arbeidsflate; egen E2E beviser før/etter rulling. |
| B2 / blind | low: initial status ble gjentatt i live region og synlig tekst. Kunngjøringsregionen er tom uten aktiv/terminal analyse; eksisterende 1.7-E2E består uendret. |
| B3 / blind | low: sperret Start hadde aktiv farge. Egen aria-disabled-stil følger eksisterende tokens og beholder tastaturfokus. |
| B4 / blind | low: JSON-parsefeil fikk transportkode. Aktiv ugyldig JSON går nå gjennom felles runtime-avvisning til invalid-response. |
| B5 / blind | low: tomt filvalg fikk incomplete i stedet for kjent missing-report. Smal mangelprojeksjon bruker riktig eksisterende domain-kode. |
| V1 / verification-gap | medium: første sentsvarprøve hadde ingen nyere aktiv request. Ny prøve bruker to gyldig korrelerte returer og viser at gammelt svar/finally ikke endrer nyere request eller låser opp dobbeltstart. |
| V2 / verification-gap | medium: konkurrerende filhash manglet direkte bevis. Ny test fullfører hash i motsatt rekkefølge og prøver tomt filvalg/lesefeil. |
| V3 / verification-gap | medium: liten arbeidsflate hadde ikke synlighetstest. Ny bygget-app-test krever ingen markør/kunngjort fullføring før listen rulles inn. |

Edge-case-linsen fulgte alle reducergrener, fil/hash/POST/JSON/abort/finally,
sessionnavigasjon, domainprojeksjon og UI-monteringen. Intet ytterligere
uløst funn. Slettet rapportplassholder er erstattet; 1.7s navigasjon/fokus
og råverdier er bevart. Ingen intent-gap eller ny produkt-/arkitekturbeslutning.

## Design Notes

Asynkront mottak endrer ikke trinn eller fokus. Brukeren åpner Kontroller funn
selv; først når listestart faktisk krysser den synlige arbeidsflaten, registreres
ferdiglistehendelsen én gang per generasjon. Det betyr at den ferdige validerte
listen er tilgjengelig og synlig for kontroll, ikke at alle linjer i en lang
liste må være synlige samtidig. Ingen timer, tidsmåling eller telemetri finnes.
