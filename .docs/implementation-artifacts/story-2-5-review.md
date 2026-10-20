# Story 2.5 — full BMAD code review 2026-10-20

**Resultat: bestått. Story 2.5 er done.** Ingen påvist produksjonsdefekt,
beslutningsblocker eller utsatt reviewoppgave. Fire konkrete hull i
verifikasjonen er lukket med fem nye tester; produktkoden er uendret.

## Reviewmål og metode

Commit: `2c69adda8ae6b5a4a70b795ec33e6f0edfcc667e`, én samlet diff
mot forelder: 29 filer, +1698/−19, 127 811 bytes. BMAD customization ble
resolvet før stegene gather-context → review → triage → present/status.
Brukerens eksplisitte bestilling dekker full review, retting, done og lokal
commit uten menystopp. Én dedikert reviewsubagent utførte alle fire linser
**sekvensielt**, som pålagt av brukerens forbud mot parallelle subagenter.
Blind Hunter, Edge Case Hunter (inklusive deletion/claims), Verification Gap
og Acceptance Auditor ble alle gjennomført. Ingen linse feilet.

Blind Hunters beregnede funngulv er min(floor(sqrt(127,811)+1),10)=10.
Kvoten brukes til å utvide undersøkelsen, ikke til å konstruere feil:
konkret prøvd er også chunkfragmentering, metadata-/PDF-likhet, falsk
boundary, korrelasjonsgrenser, markørlevetid, cleanup-rekkefølge,
dokumentfeil før adapter, sen IPC, stopperace og statisk eksponering.
Bare de fire verifiserbare testhullene nedenfor beholdes som funn.

Autoritativt grunnlag: [Story AC1–AC5](../planning-artifacts/epics.md#story-25-gjennomføre-ett-http-analyseforløp-med-duplikatsperre),
[implementeringsspec](spec-2-5-gjennomfore-ett-http-analyseforlop-med-duplikatsperre.md),
[R3 med alle matriserader](../planning-artifacts/r3-http-ressurser-semester-v1.md),
[SPEC](../specs/spec-IBE160/SPEC.md),
[grensekontrakter](../specs/spec-IBE160/grensekontrakter.md),
[AD-1–AD-10](../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md),
[epickontekst](epic-2-context.md), [sprintplan](sprint-plan.md) og full
[sprintstatus](sprint-status.yaml). Kursveiledningens s. 1–7 og faglærerens
[tilbakemelding](../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md)
med gjeldende oppfølging er kontrollert for test-/prosess-/scopeføring.
Ingen nye produktkrav utledes. Eksisterende promptlogg er bevart.

## AC mot faktisk kode og testbevis

| AC | Kode og uavhengig bevis |
|---|---|
| AC1 | `analysis-route.ts` mottar komplett multipart før `runPipeline`; `pipeline-child.ts` kjører signatur → faktisk `validatePdf` → `extractPdf` → delt dokumentport → `analyzeDocument`/adapter → resultatbinding. Hash fra komplette originalbytes, lokal demo og korrelasjon settes i kode. F1–F4 stemmer med uavhengig fasit. Faktisk produksjonsserver har POST-E2E. Ingen finans-/screeningretur. |
| AC2 | Aktiv sessionlås settes før første await. Separat JSON-nøkkel `[sessionId, mode, reportHash]` kontrolleres/settes synkront før adaptertillatelse. F1–F4-HTTP gjentas med ny requestId/generasjon og gir duplicate-analysis. Ny reviewprøve kjører to faktiske prosesser mot samme markør: én completed, én 409 og én tillatelse totalt. |
| AC3 | Markøren fjernes aldri ved requestcleanup. Feil/ugyldig retur, faktisk timeout og klientabort etter adaptertillatelse etterfølges av duplikatavvisning uten ny tillatelse. Ingen retry, kø, polling eller gjenopptaks-API. Ny isolert abortrace beviser at gyldig kølagt completed ignoreres og markør består. |
| AC4 | Tidlig ufullstendig upload får smal stabil rejected-kode uten oppdiktet hash. Etter etablert kontekst valideres alle utfall mot delt kontrakt, og dokument-/analysefeil forblir failed. Reelle signatur-/container-/31-siders-/tekstlagsfeil, adapterfeil og ugyldig retur etterprøves. Ny IPC-prøve leverer kontraktgyldig completed akkurat ved 60 000 ms før timer-callback og får timeout. |
| AC5 | Ingen filnavn brukes som sti. Ingen diskspooling/rapportlogging. Chunks/framing/inputreferanser fjernes; requesteid prosess og parsertråder SIGKILL-es og faktisk close avventes før lås/terminalretur. Tester måler døde PID-er, tomme bytefelt, fjernede timere/lyttere og cleanup også ved parser-destroyfeil/abort/timeout. Ny HTTP-prøve stopper en delvis upload uten parserstart og får trygg 503 etter stop. Statisk/dev-E2E sperrer private dokumenter/backend/miljøfiler. |

## Funn, triage og lukking

Testreferanser ble søkt i hele `tests/` på `onLifecycle`, `adapter-ready`,
`60_000`, `processing-failure` og `router.stop`; eksisterende testfiler ble
lest før hullene ble registrert. Full kode-/kallgrense ble kontrollert.

| ID / linse | Verdict og manglende verifikasjon | Rettet bevis |
|---|---|---|
| V1 / verification-gap | medium: faktisk 60 s-test beviser fristen, men ville ikke fange sletting av onMessage-fristsjekken dersom IPC leveres etter frist før timercallback. | `http-pipeline-races.test.ts`: gyldig completed ved nøyaktig frist; krever timeout, kill og close før settlement, tomme bytes/lyttere og beholdt markør. |
| V2 / verification-gap | medium: HTTP-aborttest observerer prosess-close/markør, men injiserer ikke en terminalmelding etter at abort har vunnet. | Samme fil: abort → kølagt gyldig completed; krever 499 og cleanup, aldri completed. |
| V3 / verification-gap | low: IPC-kontekstmismatch og kastende livsløpsdiagnostikk var ikke feilinjektert i eksisterende initialiseringstester. | Samme fil: feil requestId + kast i diagnostikk gir bare trygg processing-failure; ingen adaptertillatelse/markør, og alle lyttere/bytes ryddes. |
| V4 / verification-gap | medium: serverstopp var prøvd med adapterheng, men delvis initialisert upload hadde ingen egen stop/drain-prøve. | `http-analysis-review.test.ts`: tolv samtidige nye requestId/generasjoner gir 409, stop lukker delvis upload uten prosess og etterfølgende request gir 503. |

Alle fire er `patch`, utført og lukket. Ekstra integrasjonsprøve av atomisk
markør med to reelle prosesser er femte nye test. Blind/edge/acceptance fant
ingen øvrige underbygde feil. Ingen decision-needed, defer eller avviste
formelle funn. Ingen feil rettes ved å omskrive låste AC/R3 eller gjøre
senere klient-/PDF-visningsfunksjoner. Godkjente kontrakter, originaler,
fixtures, demo og produktkode beholdes uendret.

## Kjørte kontroller

Node 24.21.0 / npm 11.19.0, eksisterende Playwright-browsere.

| Kontroll | Resultat |
|---|---|
| Baseline `npm test` | 467/467 tester, 15/15 filer |
| Ny målrettet review-suite | 5/5 tester, to filer; etter styrking til kontraktgyldig completed ble IPC-suite kjørt igjen: 3/3 |
| Full `npm test` med nye tester | 472/472 tester, 17/17 filer |
| `npm run typecheck`, `npm run lint`, `npm run build` | Bestått; ingen lintadvarsler |
| `npm run test:e2e` | 42/42 bygget app + 2/2 dev bestått |
| BMAD sprintstatusvalidering | valid: true, problems: [] |
| `git diff --check` | Bestått |

Fullsuite kjører den faktiske 60 000 ms-fristen for synkront parserheng,
adapterheng og sen retur etter flere steg. Ny fristrace bruker kontrollert
klokke/IPC for en annen hendelsesrekkefølge og erstatter ikke realtidsprøven.
Mocks beviser foreldrens kontrollflyt/listenercleanup; faktiske prosesser og
HTTP beviser fysisk avslutning og aktiv lås. Markørtillatelse alene er ikke
bevis på faktisk adapterinvokasjon i et abortrace; normalt completed krever
at adapteren faktisk returnerte. Ingen påstand om S2, live-S5 eller faktisk
annen-person-S6 gis fra disse testene.

Første sandboxkjøring hadde 21 HTTP-feil pga. `listen EPERM` på loopback,
ikke funksjonsfeil (446 øvrige tester bestod). Autorisert eskalert kjøring
bestod. Python/ruamel fra eksisterende lokal sprint-cache ble brukt for
sprintvalidatoren. Ingen nye avhengigheter eller nettverksinstallasjon.

## Checkpoint

Story 2.5 = done, 2.1–2.4 = done, 2.6–2.11 = backlog. Epic 2/SP2 pågår;
R2/R3 closed, R1/R4 åpne ved sine senere porter. Neste naturlige enhet er
Story 2.6 med en ny sekvensiell implementeringssubagent. Reviewen innfører
ikke 2.6, 2.7, live eller nye produkt-/arkitekturbeslutninger. Lokal commit,
ingen push. [Arbeidsøkt](../process/arbeidsokter/2026-10-20-story-2-5-review.md).
