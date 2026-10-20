---
title: 'Story 2.5 — Gjennomføre ett HTTP-analyseforløp med duplikatsperre'
type: 'feature'
created: '2026-10-20'
status: 'done'
route: 'dispatch'
story_key: '2-5-gjennomføre-ett-http-analyseforløp-med-duplikatsperre'
baseline_commit: '03011d5f914a45b3f3f5f8f9488e9c714c9c72c6'
context:
  - '.docs/planning-artifacts/r3-http-ressurser-semester-v1.md'
  - '.docs/implementation-artifacts/epic-2-context.md'
  - '.docs/specs/spec-IBE160/grensekontrakter.md'
---

<frozen-after-approval reason="Eksplisitt bestilling av implementering, tester og lokal commit for bare Story 2.5">

## Intent

Lever Story 2.5 AC1–AC5: ett POST /api/analysis som sekvensielt mottar PDF, validerer original/format, trekker ut alle fysiske sider og bruker Story 2.4s adapter/resultatbinding. Bevar kontraktversjon 2/uttrekksversjon 1, SHA-256 og demodata. Kravspor FR-6/FR-9, NFR-1/4/5, AD-3–6/9/10, RT-1/2/9/19.

## Boundaries & Constraints

R3 er lukket i baseline. Én PDF ≤50*1024*1024 bytes; JSON/metadata ≤1024*1024 bytes, inklusive likhet. Ingen base64-PDF i JSON. Kontroller kjent overgrense tidlig og tell faktiske bytes under mottak; stans akkumulering, frigjør chunks, ingen hash av ufullstendig body. Valider signatur og faktisk container/sider/lesbarhet; navn/MIME er aldri bevis. Kun in-memory, ingen PDF-/tekstfil, database eller logger med innhold.

Sett aktiv flytlås synkront før asynkront arbeid; samme session kan ikke starte parallelt ved annen hash/modus/requestId/generasjon. Behold til arbeid OG cleanup er ferdig. Separat prosesslokal session+lokal modus+backendhash-markør settes før adapterkall og beholdes til serverstopp også etter feil, abort og timeout; bare teknisk identitet lagres. Ingen automatisk retry, kø, polling eller jobb-API.

Én hard frist 60 000 ms fra før første signatur-/formatbehandling til terminal demoresultatbinding. Ingen reset mellom steg. Foreldretråden må kunne stoppe synkront heng; Promise.race alene holder ikke. Hele lokale pipelinen kan isoleres i en request-eid underprosess, der terminering avslutter også alle parsertråder. Avvent faktisk avslutning før låsen frigjøres. S5 er evalueringsmål, ingen HTTP-frist. Ingen live-timeout eller Epic 4-implementering.

Success, feil, ugyldig retur, timeout og klientabort skal gjennom deterministisk cleanup av alle opprettede parser-/worker-/prosessressurser, chunks/bytes/tekst/adapterkopier, timere/lyttere. Forsøk alle ressurser selv om én cleanup feiler. Ingen sen completed, ingen svar på lukket forbindelse. Ingen falsk hash før komplett kontekst: tidlig HTTP-avvisning får trygg stabil kode uten å late som full AnalysisOutcome. Dokument-/analysefeil etter etablert kontekst bruker eksisterende kontrakt. Metadata settes i kode, aldri fra modell/klienthash.

Ingen frontend eller Story 2.6+, ingen PDF-visning/object URLs. Demo standard uten nøkkel/nett/fallback og samme adaptergrense for kontrollerte tester. Stopp ved udekket produkt-/arkitekturvalg. Root eier sluttregresjon, sprintstatus og commit; implementeringsagent skal ikke committe.

## I/O & Edge-Case Matrix

| Tilstand | Forventet |
|---|---|
| Faktiske F1–F4 under grensen | Samme hash, sider, funn og versjonsbundet demo; ett adapterkall |
| PDF akkurat 50 MiB / én byte over | Likhet gjennom størrelsessteget; oversize før parser/adapter, også uten lengdeheader |
| Ingen/flere filer, feil MIME/navn/signatur/container | Bare én faktisk PDF godtas; kontrollert feil |
| JSON/metadata akkurat 1 MiB / én byte over | Likhet gjennom størrelsessteget; oversize kontrollert 413 |
| Base64-PDF i JSON / skjulte ekstra felt | Avvis før dokument-/adapterarbeid |
| Samtidige requests / dobbel start / ny requestId/generasjon | Én aktiv; duplikatmarkør hindrer nytt adapterkall etter avslutning |
| Heng i parser eller demo, sen retur | Samlet 60 s-frist terminerer reelt arbeid; aldri completed |
| Klientabort under upload/parser/adapter | Stopp arbeid og rydd; satt duplikatmarkør består |
| Backendfeil/ugyldig retur/dokumentfeil | Trygg feil, ingen retry, alle ressurser frigjøres |
| Success/error/abort/timeout, cleanup-feil | Ingen beholdte innholdsreferanser eller prosesser; alle cleanup-forsøk kjøres |

</frozen-after-approval>

## Code Map

- `src/backend/server.ts`: eksisterende loopback/static/dev-server; monter HTTP-ruten før /api-404. Bevar øvrig appskall.
- `src/backend/documents/validate-pdf.ts`: kopierer original og beregner SHA-256. PDF.js kan kjøre synkront her; isoler hele kjeden ved HTTP-bruk.
- `src/backend/documents/count-pdf-pages.ts`, `extract-pdf.ts`: eksisterende worker_threads og finally/terminate; bevar originalhashkontroll.
- `src/backend/analysis/analyze-document.ts`, `demo-adapter.ts`: gjenbruk full DocumentBasis og samme adaptergrense/binding; ikke endre lagrede uttrekk.
- `src/contracts/document-analysis.ts`, `analysis-validation.ts`: eneste analyseautoritet og trygge eksisterende feil; ny smal HTTP-innpakning kan legges i contracts uten konkurrerende terminalskjema.
- `tests/integration/`, `tests/helpers/`: faktiske HTTP-/PDF-prøver; kontrollerte adaptermoduler i isolert lokal behandling, ingen betalt API.

## Tasks & Acceptance

- [x] `src/backend/http/`, `src/contracts/`: implementer dokumentert binær innpakning (multipart med kun én fil), avvisning, strømgrenser og korrelasjonsvalidering.
- [x] `src/backend/http/`, `src/backend/server.ts`: implementer aktiv lås, varig prosessmarkør, isolert pipeline, hard frist, abort og cleanup.
- [x] `tests/integration/`, `tests/unit/`, `tests/helpers/`: dekk alle matriserader med kallantall, fysisk ressursavslutning og ingen persistens; test reelle grenser, ikke bare nedjusterte konstanter.
- [x] `README.md`, `src/backend/README.md`: dokumenter faktisk HTTP-form, feil og ressurslivsløp, avgrenset fra senere klient/live.
- [x] `.docs/implementation-artifacts/story-2-5-verifikasjon.md`, `.docs/process/arbeidsokter/2026-10-20-story-2-5.md`: spor og faktisk full regresjon; review-status og lokal commit uten push.

Given en POST, when kjeden fullføres, then bare validert terminalutfall returneres (AC1/4). Given samme session/hash/modus, when nytt forsøk gjøres etter første adapterstart, then ingen andre kjøring (AC2/3). Given alle terminalveier, when requesten avsluttes, then alle midlertidige ressurser er avsluttet uten innholdslogging/persistens (AC5).

## Implementation Notes

BMAD-build rendret én gang. Autorisert implementeringsbestilling dekker lokal spec uten ekstra godkjenningsrunde, som i Story 2.4. Arbeidstreet inneholdt bare automatisk promptlogg for denne bestillingen; den bevares. Ingen intensjonsgap eller irreversible eksterne handlinger. Kurs-PDF og faglærertilbakemelding lest; opprinnelige private data og uavhengig fasit skal bevares.

Runtime: `/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin` først i PATH. Playwright: `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-1-2-browsers`.

## Verification

Målrettede HTTP-/livsløpstester, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:e2e`. Root etterprøver diff og matrisedekning. Ingen S2/S5/S6-påstand fra disse testene. Story 2.5 ender in-review/review, Epic 2/SP2 pågår; 2.6 backlog og R1/R4 uendret.

Root-regresjon før intern build-kontroll: 461/461 tester, type/lint/build
og 41+2 E2E består. Deretter identifiserte intern kontroll konkrete
ressurs-/regresjonsforbedringer som rettes og testes på nytt.

## Review Triage Log

Hvert funn har egen verdict, evidens og behandling i
[full intern triage](story-2-5-build-check.md). B1–B4/B6/V1/V2 er medium;
B5/B7–B10 er low. Konkrete rettinger er sendt tilbake til samme
implementeringsagent. Ingen ny beslutning, intensjonsgap eller utsatt
produktfeil. Edge-case-hunter hadde ingen funn. Storyen beholdes
in-review/review, uten separat done-godkjenning.

| ID | Verdict | Evidens/behandling |
|---|---|---|
| B1 | medium | Sluttframing manglet i metadataopptelling; tell alle ikke-filbytes. |
| B2 | medium | Gjentatt kopiering/skanning av headerprefiks er kvadratisk; inkrementell buffer. |
| B3 | medium | Én Buffer per filchunk gir stor bokføringskostnad; koalescer faste blokker. |
| B4 | medium | Listener tar nye forbindelser under drain; steng listener først. |
| B5 | low | HTTP-skjema tillater intern requestId-mismatch; liten refinement. |
| B6 | medium | Ny HTTP-dokumentsperre mangler fixturebevis; tekstløs/31 sider gjennom HTTP. |
| B7 | low | Async spawn error/close får målrettet cleanup-test; spekulativt IPC-rammeverk avvises. |
| B8 | low | Sessionnøkkel er separat i kode; samtidighetsprøve etterprøver uavhengigheten. |
| B9 | low | Hendelsen måler tillatelse før invokasjon; omdøp og presiser abort-race. |
| B10 | low | Feilende test kunne la barn leve til frist; avvent router.stop i teardown. |
| V1 | medium | Egen testapp beviser ikke produksjonsmontering; POST mot faktisk appserver. |
| V2 | medium | Upload-låstest beviser ikke prosesseringslåsen; konkurrerende F2 under F1-heng. |


### Sluttverifikasjon etter retting

Alle triagepunkter er håndtert og etterprøvd. Root leste endelig diff,
kontrollerte hver matriserad og bekreftet 467/467 fullsuite, type/lint/build
og 42+2 E2E. Målrettet: 22 HTTP +9 enhetstester og faktisk appserver-POST.
Kjent total Content-Length brukes også etter delheadere til å avvise
bevist overstor PDF før filbytes. Ingen senere story, persistens,
leverandør, retry eller ny produkt-/arkitekturregel er innført.
Se [full verifikasjon](story-2-5-verifikasjon.md). Storyen forblir
in-review/review etter bestillingen; ingen automatisk done eller push.


## Uavhengig BMAD-review 2026-10-20

Storyen er **done** etter [full AC-/R3-review](story-2-5-review.md) av
implementeringscommit `2c69adda8ae6b5a4a70b795ec33e6f0edfcc667e`.
Ingen produksjonsfeil eller beslutningsblocker ble bekreftet. Reviewen lukket
konkrete verifikasjonshull med fem nye tester av IPC-/frist-/abort-race,
delvis upload/serverstopp og atomisk adaptermarkør. Produktkode, kontrakter,
fixtures og låst arkitektur er uendret. Tidligere in-review-utsagn ovenfor er
historiske leveransespor; gjeldende status er done.

### Review Findings

- [x] [Review][Patch] V1: Absolutt frist før timercallback hadde ikke separat IPC-race-bevis — ny test leverer gyldig completed ved nøyaktig 60 000 ms og krever timeout, fysisk close før settlement samt ryddede lyttere/bytes.
- [x] [Review][Patch] V2: Kølagt terminalretur etter abort hadde ikke separat foreldreprøve — ny test krever 499, ingen sent completed, beholdt markør og full cleanup.
- [x] [Review][Patch] V3: Feilbundet IPC-kontekst sammen med kastende diagnostikk hadde ikke eget feilinjektert bevis — ny test krever trygg 500, ingen adaptertillatelse/markør og ryddede bytes/lyttere.
- [x] [Review][Patch] V4: Serverstopp under delvis upload var ikke direkte verifisert — ny HTTP-prøve krever at tolv konkurrerende requests avvises, upload stenges uten prosessstart og nye requests etter stop gir 503.

Alle fire funn gjelder verifikasjon, ikke påvist feil i produksjonsatferden.
To faktiske samtidige prosesser mot samme markør er dessuten prøvd uavhengig:
én completed, én duplicate-analysis og begge prosesser fysisk avsluttet.
Ingen decision-needed, defer, uløste funn eller senere stories er innført.
