# Story 1.2 — BMAD code review

Dato: 2026-10-17. Målcommit: `6296dfef0f93b69fd29180475732469a7acfd12d`.
Reviewgrunnlag: commitens endringer mot `4db56a119fc72f9d881b9a3e16a8cd406d9c5f35`;
27 filer, 3547 tillegg og 24 slettinger. Rettingene fra denne reviewen ligger
i arbeidskopien. Ingen commit eller push er utført.

## Grunnlag og metode

[Story 1.2, AC1–AC5](../planning-artifacts/epics.md#story-12-starte-den-bygde-lokale-appen-med-godkjent-appskall)
og [implementeringsstoryen](spec-1-2-starte-den-bygde-lokale-appen-med-godkjent-appskall.md)
er kontrollert mot final
[DESIGN](../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/DESIGN.md),
[EXPERIENCE](../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md),
[arkitektur](../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md),
[SPEC og kompanjonger](../specs/spec-IBE160/SPEC.md),
[epics/stories](../planning-artifacts/epics.md),
[sprintplan](sprint-plan.md) og [sprintstatus](sprint-status.yaml).
Sensorveiledningens sju sider er lest fra original-PDF med PDFKit;
faglærerens tilbakemelding og gjeldende oppfølging er brukt som kvalitetsramme.
Ingen nye produktkrav er utledet.

`bmad-code-review` ble aktivert og prosjektets workflow-overstyringer løst.
Fire uavhengige lag på samme modellnivå ble gjennomført: Blind Hunter,
Edge Case Hunter, Verification Gap og Acceptance Auditor. De tre første fikk
ingen samtalekontekst. Auditoren fikk story og autoritative dokumenter.
Fire samtidige agentslotter innebar at auditoren startet da første slot ble
ledig; ingen resultater ble triagert før alle lag var ferdige. Ingen lag feilet.
Acceptance Auditor hadde ingen egne bekreftede kontraktsfunn; konkrete
nettleserprober fra hovedreviewen og de andre lagene avdekket AC4-feilen.

Brukerens bestilling autoriserte alle rettinger innen Story 1.2 og status
`done` ved bestått review. Derfor var ingen ekstra godkjenning nødvendig ved
workflowens generelle bekreftelses-/patchvalg. Ingen produktbeslutning eller
låst dokumentkontrakt er endret.

## Funn, dom og retting

Alle 14 innmeldte funn er beholdt nedenfor med individuell dom før gruppering.
B = Blind Hunter, E = Edge Case Hunter, V = Verification Gap.
Linjehenvisninger i funnene gjelder målcommiten.

| ID | Funn og dom | Evidens og håndtering |
|---|---|---|
| B1 | **medium — patch:** For lite fokus-/arbeidsareal i korte zoomvinduer. | Ved 320×160/360×160 kunne et 30 px h1 og 10 px fokusring ikke rommes i arbeidsområdet. CSS har nå én stepperkolonne ved ≤400 px og mindre vertikal headerplass ved ≤240 px. Regresjonstester prøver begge korte flater. |
| B2 | **low — patch:** Fokuskontrasten målte trinnbakgrunn. | `contrast.focus` brukte `current.backgroundColor`; outline kunne endres uten feil. Tastaturtesten leser nå faktisk `outlineColor`, krever korrekt petrol og ≥3:1 mot aktuell tilstøtende flate. |
| B3 | **low — patch:** Traverserings-URL-er ble normalisert av HTTP-klienten. | WHATWG-URL/APIRequestContext fjerner de kodede dot-segmentene før transport. Nye `node:http`-forespørsler bruker rå `path`; både ordinær og kodet traversering avvises med 404 og trygg tekst. |
| B4 | **low — patch:** Produktnavn og navn/nummer/rekkefølge manglet presise assertions. | Dokumenttittel og enkeltnavn var sjekket, men feil synlig produktnavn eller ombyttede trinn kunne passere. Testen sjekker nå banner og alle fire ordnede navn/nummer/tekststatuser. |
| B5 | **low — rejected:** Nettleserens HTTP-sperre dekker ikke WebSocket. | Faktumet er riktig, men bygget demo har ingen WebSocket-kodebane. OS-kontrollen sperrer eksternt nett for build/demo, og testteksten omtaler ressursforespørsler. Et nytt WebSocket-vern for en framtidig kodebane avvises som unødvendig kompleksitet. |
| B6 | **low — patch:** HMR-proben sjekket bare at en socket ble opprettet. | `waitForEvent('websocket')` beviser ikke vellykket tilkobling. Proben krever nå Vites `connected`-melding samt faktisk synlig kildeoppdatering og retur i en isolert prosjektkopi. Normal dev-test krever også tilkoblet HMR. |
| B7 | **low — patch:** Dev-nettleserfeil ble bare skrevet ut. | Den gamle proben kunne returnere 0 etter `pageerror`. Feil samles nå og feiler proben; den normale dev-testen krever også tom feilliste. |
| B8 | **medium — patch:** Readiness kunne godta en annen server på port 3000. | `serve()` godtok enhver HTTP 200 mens den nye prosessen startet. Den sjekker nå ledig loopback-port før prosessopprettelse. `SO_REUSEADDR` skiller en aktiv lytter fra TIME_WAIT. |
| B9 | **low — rejected:** Ingen SIGKILL-reserve etter SIGTERM-timeout. | Hjelperen kan i prinsippet feile ved en hengende kontrollprosess eller en prosess som allerede er avsluttet. De aktuelle Node-/npm-prosessene terminerer normalt; ekstra eskaleringsgrener for et uvanlig, hypotetisk kontrollforløp avvises. Faktisk oppstartstimeout/opprydding er prøvd. |
| B10 | **low — patch:** Lokalproben brukte gjeldende arbeidsmappe. | `Path.cwd()` valgte feil kildegrunnlag utenfor reporoten. Roten utledes nå fra `__file__`, som i logghelperen. |
| E1 | **medium — patch, samme rotårsak som B1:** Trinnkontroller klippes ved 1280×800 / 400 %. | Ved 320×200 målte hovedreviewen nav til y=65,390625–145,390625. Fokusert Tilstandsrapport var y=73,390625–152,578125 før ytterligere 5 px outline på hver side. Både kontroll og fokus var klippet. Ny kolonne-/høydefordeling og 320×200-test retter dette. |
| E2 | **medium — patch, samme rotårsak som B8:** En eksisterende HTTP 200 kan gi falskt offlinebevis. | Samme `serve()`-readiness som B8; portkontrollen gjelder alle faktiske serverstarter i proben. |
| V1 | **medium — patch:** Dev-skall/HMR var utenfor vanlig testkommando. | `playwright.config.ts` startet bare demo. Fjerning av `vite.middlewares` ville ikke feile demotestene. `npm run test:e2e` kjører nå en separat dev-konfigurasjon etter demo. |
| V2 | **medium — patch, gruppert med V1:** Dev-privatgrensen var utenfor vanlig testkommando. | Demo serverer bare `dist` og bruker ikke Vites deny-regler. Den nye dev-konfigurasjonen prøver en faktisk privat markørfil og avviser private dokumenter, backend, dokumentasjon og miljø-/Git-URL-er. |

Etter gruppering: **9 patchpunkter rettet, 2 avvist, 0 utsatt og 0
beslutningspunkter**. Ingen åpne high/medium-funn. V1/V2 deler mangelen på
en normalt kjørt dev-test. Alle individuelle funn beholder dom og evidens.

## Verifikasjon

Kontrollene bruker macOS/arm64, Node 24.21.0 og npm 11.19.0 etter README.
Standard Node 26 i agentskallet ble ikke brukt til prosjektkontrollene.
Playwright 1.64.0 og forhåndsinstallert Chromium brukes. Full råutskrift for
de lagrede kjøringene, inklusive mislykkede forsøk, finnes i
[reviewkontrollene](story-1-2-review-kontroller.txt).

| Kontroll | Utfall / avgrensning |
|---|---|
| Baseline før retting | Type/lint/build og alle 8 eksisterende E2E-tester bestod; separat probe bekreftet zoomfeilen ved 320×200. |
| `npm run typecheck` og `npm run lint` | Bestått, inklusive dev-test og begge Playwright-konfigurasjoner. |
| `npm run test:e2e` | 12 demotester og 2 dev-tester bestod. Demo bygger fra gjeldende kilde. Testene starter/stopper egne servere sekvensielt på port 3000. |
| Zoom/fokus i E2E | 1440×900, 1280×800, 720×450, 640×400, 360×225, 320×200, 360×160 og 320×160. Navn/nummer/status, tabrekkefølge, hoppelenke, hele fokusringen, rulling og fravær av stepperoverlapp kontrolleres. Viewportbevis er ikke native nettleserzoom. |
| Kontrast | Faktisk outline i tastaturrunden ≥3:1; tekst 12,8094:1, sekundærtekst/hvit 5,9544:1, status/sekundærflate 5,2061:1, hvit/petrol 6,7011:1 og kontrollkant/hvit 3,8102:1. |
| Ren prosjektkopi | Ny mappe med parenteser, `npm ci`, eksakt avhengighetstre, type/lint, manglende build og opptatt port; package-/lockfil SHA-256-identiske etter installasjon. |
| Offline build/demo | `sandbox-exec` sperret eksternt nett og tillot loopback. Faktisk TCP-probe mot 1.1.1.1:443 ga EPERM. Build/demo bestod uten nøkkel/KI-klient; én Node-lytter på 127.0.0.1:3000. |
| Ressursgrense | Bygde HTML/JS/CSS leveres lokalt; faktisk privatfil, repo-/backend-/miljø-/Git-ressurser og rå traversering avvises. 412/416 beholdes. Fiktiv miljømarkør mangler i både dist og dev-miljømodul. |
| Faktisk dev/HMR | Skall og moduler lastes, `connected` mottas på ws://127.0.0.1:3000, endret overskrift vises og opprinnelig innhold gjenopprettes i den isolerte kopien. Ingen `pageerror`. |

Manuell Chrome-kontroll via computer-use bekreftet 200 % og 400 % i
nettleserens zoomdialog. Ved 200 % ble trinnene ombrutt, med hel synlig
fokusring på Kontroller funn. Ved 400 % kunne Resultat få fokus uten å åpnes
med Enter/mellomrom. Etter omlasting av gjeldende CSS var den smaleste
stepperen i én kolonne, og alle navn/statuser/sperreforklaringer var fortsatt
tilgjengelige i AX-treet. Hoppelenken flyttet fokus til h1 Tallgrunnlag.
Zoom ble eksplisitt tilbakestilt til 100 %, DevTools og egen reviewfane ble
lukket, brukerens opprinnelige faner beholdt og lokal demo gjenopprettet.

En tidlig UI-observasjon under omlasting viste tom root. Senere observasjon
viste skallet, og DevTools-konsollen hadde 0 meldinger; ingen vedvarende
omlastingsfeil ble påvist. Native tastatur-/skjermbilder var ikke like
reproduserbare som E2E; de nøyaktige klippegrensene og korte visningene
avgjøres derfor av de målte E2E-kontrollene. Ingen separat skjermleser eller
andre plattformer er prøvd i denne reviewen.

Inspiserte bevis etter retting:
[320×200](story-1-2-review-zoom-320x200.png) og
[320×160](story-1-2-review-zoom-320x160.png). Dette er automatiserte
viewportbilder, ikke skjermbilder fra native zoomdialogen.

Nye regresjonskontroller fant også én klippet piksel etter første
høydejustering; headerens radavstand ble deretter fjernet i korte vinduer.
Den nye dev-konfigurasjonen brukte først Playwrights sammenslåing som
la sammen demo- og dev-serverne; ett samlet konfigurasjonsobjekt rettet
dette. Portproben måtte bruke SO_REUSEADDR for å godta TIME_WAIT uten aktiv
lytter. Mislykkede og rettede forsøk er bevart i råutskriften. Separate
outputmapper bevarer nå demobildene når dev-testene kjøres etterpå.

**Endelig vurdering: AC1–AC5 bestått etter retting. Story 1.2 er done i
storyfil og sprintstatus.** Epic 1 forblir in-progress, Story 1.1 done og
alle senere stories backlog. Ingen handlinger eller avklaringer står åpne
innenfor denne storyen.

## Bevarte grenser

Frontend er et statisk React-skall. `domain`/`contracts` har bare sine
tidligere ansvarsbeskrivelser; Express gjør ingen finans eller screening.
Ingen registreringsfelt, finansmodell, rapport-/analysekontrakt, API-klient,
resultater eller vedvarende lagring er lagt til. **Story 1.3 er ikke startet.**
Grafitt/petrol, systemfont, radier, fokus og øvrige DESIGN-tokens er bevart.
Smal ombryting og redusert headerluft følger den eksisterende responsive
UX-kontrakten uten innholdstap. Tallgrunnlag er eneste gjeldende trinn;
øvrige trinn er sperret med konkret forklaring og ingen falsk fullføring.

README beskriver nå begge testkjøreformer og de nye zoomkontrollene.
Historiske implementeringsbevis fra 2026-10-16 beholdes, med datert tillegg
for denne reviewen. Full UJ-1, live KI, S1–S6 og annen-person-bevis er fortsatt
ikke levert gjennom Story 1.2. Ingen låst plan eller avklaringsport endres.
