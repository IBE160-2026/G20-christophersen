# Story 2.7 — uavhengig full BMAD code review

Dato: 2026-10-20. Reviewmål:
`5d05698e501703c6e12d08d3b63c2f058b0873ce..2a6600e281e726cecbc240516234cc486e119b93`.
25 filer, 1166 inn / 14 ut, 105 561 bytes diff. Full specmodus.
Ny dedikert reviewagent etter avsluttet implementering og grønn regresjon.

BMAD `bmad-code-review` ble aktivert med resolved customization, config og
steg 1–4 lest sekvensielt. Brukerens eksplisitte krav om én arbeidende
subagent av gangen overstyrer skillens parallelle/nestede delegasjon.
Alle fire linser ble derfor gjennomført sekvensielt av denne reviewagenten.
Den konkrete sprintbestillingen forhåndsautoriserer smale rettinger og
status/commit uten ekstra menystopp. Ingen andre agentarbeider samtidig,
ingen push og ingen Story 2.8 startet.

## Autoritativt grunnlag

AGENTS.md, sensorveiledningen (direkte lokal PDF.js-tekstekstraksjon), lagret
faglærertilbakemelding, epics.md Story 2.7 AC1–AC5, godkjent storyspec,
SPEC CAP-3 og grensekontrakter, final ARCHITECTURE-SPINE AD-2/3/4/9/10,
DESIGN/EXPERIENCE, Epic 2-kontekst og sprintplan/-status er fulgt.
2.6-reviewens faktiske synlighetsgrense og kunngjøring er videreført.
Kurs/faglærer støtter avgrensning og etterprøvbare feil-/test-/prosesspor;
ingen nye produktkrav utledes. R2/R3 er uendret, ingen ny beslutning.

## Fire linser, full triage

Blindlinsens gulv: `N = min(floor(sqrt(105,561) + 1), 10) = 10`.
Gulvet gir kandidater til etterprøving, ikke ti påståtte produktfeil.

| ID / linse | Dom, bevis og behandling |
|---|---|
| B1 / blind | medium, patch: renderfeil avsluttet canvasforsøket, men regionen stod fortsatt `aria-busy=true`. Egen bygget-app-prøve reproduserte dette rødt; busy avledes nå av faktisk lasting. Samme prøve krever false etter feil, ingen gammel canvas og vellykket ny naboside. |
| B2 / blind | medium, patch av verifikasjon: eksisterende Hel-side-prøve kontrollerte valg/status, ikke at siden faktisk passer. Ny geometriprøve krever høyde/bredde innen leseregionen ved 1440×900, 1280×800 og 1200×650; alle består. Ferske bilder dokumenterer sluttkode. |
| B3 / blind | medium, patch av verifikasjon: ny devressursrute manglet direkte ressurs-/traversalprøve. Ny E2E henter faktisk lokal font og krever 403/404 for private/backendmål. Ingen produksjonslekkasje funnet. |
| B4 / blind | medium, patch av verifikasjon: funnrace og worker-unmount var prøvd, men rapportbytte under ventende render var ikke direkte observert. Ny E2E holder rAF, bytter F4→F1, slipper gamle callbacks og krever null gamle workers, null valgt gammelt funn og ekte F1 uten F4-tekst. |
| B5 / blind | false: antatt originalbytes-detach. Parser får `.slice()`, ikke øktens buffer. Eksisterende unmount/gjenåpning og ny F4→F1-prøve bruker ekte originaler; ingen detach. |
| B6 / blind | false: mistenkt sen TextLayer-publisering. Hver await har aktivkontroll, hver effekt har cancel/DOM-cleanup og ny side publiseres først når canvas og tekst er klare. Eksisterende holdt-rAF-race og ny rapportbytterace består. |
| B7 / blind | false: mistenkt gjetting ved side 999 eller ukjent kilde. `sourceTarget`, `valid` og skjult holder gir konkret feil, deaktiverte sideknapper og ingen canvas. Unit og ekte bygget-app-negative prøver består. |
| B8 / blind | false: mistenkt Tab-escape eller feil Esc-retur. Egen lesing av fokusfelle og faktisk E2E dekker siste→første, heading Shift+Tab→siste og Esc/synlig retur til åpner uten valgtfunn-/posisjonstap. |
| B9 / blind | false: mistenkt bruk av mismatchende rapportkilde uten hash. Valgfri originalhash følger eksisterende uncertain-kontrakt; eksplisitt mismatch avvises, og hele analyseutfallet er allerede validert/bundet i 2.6. Ingen ny kildepolicy innføres. |
| B10 / blind | false: mistenkt 2.6-regresjon fra 44/56-wrapper. Observeren følger fortsatt hele `findings-title` innen workspace med threshold 1; full regresjon inneholder uavhengig padding-/klippet-heading-prøve og kunngjøringstellingen. |
| E1 / edge-case | medium, samme rot som B1: terminal render-catch endrer display, men gammel busy-betingelse utelukket bare dokumentfeil. Rettet og uavhengig rød/grønn. |
| V1 / verification-gap | medium, samme rot som B2: repo-søk etter Hel side/pdf-scroll og lesing av alle nye PDF-E2E viste bare select/status og overflow på ytre workspace, ikke sidens fit i leseregionen. Ny presis geometriprøve beskytter denne adferden. |
| V2 / verification-gap | medium, samme rot som B3: `dev-shell.spec.ts` beskyttet generelle private stier, men hentet aldri `/pdfjs/` eller prøvde traversal via ny rute. Ny faktisk ressurs-/negativ prøve lukker hullet. |
| V3 / verification-gap | medium, samme rot som B4: `pdf-source.test.ts` dekker reset i reducer og eksisterende E2E bare funnbytte/unmount. Ny brukerflateprøve binder ventende rendering til nytt dokument og cleanup. |
| A1 / acceptance | medium, samme rot som B1: AC4/5 krever sannferdig tilgjengelig status ved faktisk feil; permanent busy etter terminal feil var misvisende for hjelpemidler. Rettet. Alle øvrige AC er kontrollert nedenfor. |

Fire patchgrupper: én produktfeil og tre verifikasjonshull. Seks avviste
kandidater, null decision-needed, null defer, ingen uløst medium/high.
Edge-linsen fulgte dokumenttask promise/destroy, bytesidentitet, alle
page/null/integer/numPages-grener, viewport/zoom, getPage/render/text await,
feil/cleanup, media-/dialogoverganger, fokus og statisk devrute.
Slettingskontroll: funnoverskriften er nå semantisk valgknapp og beholder
tekst/kilde/2.6-listetittel; ingen opphav eller feilstatus er slettet.
Claims ble lest etter path tracing og kontrollert mot kode og prøver.

## AC mot faktisk kode og uavhengige bevis

| AC | Faktisk kode og kontroll |
|---|---|
| AC1 | Funnvalg setter fysisk `finding.source.pdfPage`; PDF.js `getPage` bruker samme heltallsposisjon fra 1. Ekte F4 på side 4 har tekst «Trykt side 2». Navn/«PDF-side 4 av 4», nabo/sidegrenser og lokal zoom er observert. Ny geometriprøve viser at Hel side passer hele leseregionen. |
| AC2 | Fra 1200 CSS px gir matchMedia/grid 44/56 og 24 px gap. Eksisterende E2E måler fordelingen; ny prøve tester eksakt 1200/1199-grense. Browser-build og importert worker kommer fra samme låste PDF.js. Bygg kopierer cmaps/standard_fonts/wasm/iccs; faktisk font er tilgjengelig i dev. Eksternt nett sperres i eksisterende F4-prøve; ingen ekstra analyse. |
| AC3 | Under grensen finnes ingen viewer før behovsåpning. Native modal viser kort valgtfunnskontekst, riktig kilde og synlig retur. Heading får fokus; eksplisitt første/siste Tab-felle og Esc-retur prøves i faktisk Chromium. Gjenåpning bevarer valgt funn, lokal naboside/zoom og workspaceposisjon. 2.8-utkast finnes ennå ikke og innføres ikke. |
| AC4 | Ukjent kilde og ugyldig side er eksplisitte uten gjetting/canvas. Worker- og renderfeil navngir original og faktisk forespurt side. Busy er nå false etter terminal renderfeil, og etterfølgende naboside virker. Analyseutfall og fullføringsstatus beholdes uten HTTP-analyse. |
| AC5 | Funnvalg med Enter beholder faktisk fokus gjennom automatisk side og resizing. Knapper/select/region har navn og synlig eksisterende fokusstil. Navngitt kort PDF-status gjengir dokument/forespurt side. 1440/1280/1200/1199 og eksisterende 850/320/sterk-zoom bevarer kontroller, kilder og tekststatus. 2.6s liste-/kunngjøringsregresjon består. |

## Tester, visuell kontroll og grenser

Før retting: én uavhengig terminal-busy-prøve rød og geometri/breakpoint grønn.
Etter retting: tre nye PDF-E2E og én ny devressursprøve grønne. En første
versjon av fontproben brukte et filnavn som ikke finnes i låst pakke;
testoppsettet ble rettet til eksisterende `FoxitFixed.pfb`, uten produktendring.
Råloggen bevarer også dette skillet mellom testfeil og produktfeil.
Første fulle Vitest-forsøk ble blokkert av sandboxens `listen EPERM`
(483 bestått, 22 HTTP-feil og én følgefeil), og var ikke fullbestått.
En for tidlig grønn statusmelding ble uttrykkelig korrigert til orkestrator.
Full autorisert loopback-kjøring er den tellende Vitest-verifikasjonen;
begge rålogger bevares.

[Reproduksjon og målrettet kontroll](story-2-7-review-reproduksjon.txt).
[Full uavhengig regresjon](story-2-7-review-kontroller.txt).

Ferske Hel-side-bilder: [1440](story-2-7-review-hel-side-1440.png),
[1280](story-2-7-review-hel-side-1280.png), [1200](story-2-7-review-hel-side-1200.png).
1440/1280 er visuelt lest av reviewagenten; orkestrator har også lest fersk
1440 og bekreftet hele originalside 4 med trykt side 2.
Tidligere bilder viste siden før regionen var rullet helt inn i ytre
workspace; det er ikke bevis for intern beskjæring. Ny geometri kontrollerer
begge dimensjoner direkte, og nye bilder viser hele siden i leseregionen.
Kontrollene over leseregionen kan nås ved vanlig arbeidsflaterulling.

Dette er agentutført faktisk browser-/semantikk-/fokus-/visuell QA,
ikke fysisk skjermlesertest, ekstern brukertest, live-S2/S5 eller full v1.
Ingen nye krav, utkast, bekreftelser, TG3-handlinger eller Resultat er laget.

## Endelig checkpoint

| Kontroll | Resultat |
|---|---|
| Uavhengig reproduksjon | 1 rød busy-prøve før retting, samme prøve grønn etterpå |
| Nye PDF-/devprober | 3/3 PDF og 1/1 devressursgrense bestått |
| `npm test`, autorisert loopback | exit 0, 19/19 filer og 505/505 tester; 80,40 s |
| `npm run typecheck` | bestått |
| `npm run lint` | bestått uten advarsler |
| `npm run build` | bestått; informativ PDF.js-bundlestørrelsesmelding |
| `npm run test:e2e` | exit 0, 69/69 bygget-app + 3/3 dev bestått |
| `git diff --check` | bestått |

Story 2.7 er **done**. Storyspec, sprint-status, sprintplan, epickontekst,
README og samlet mini-sprintlogg er synkronisert. Alle SP2-stories 2.1–2.7
er done, og milepæl 1 kan demonstreres. Epic 2 er fortsatt in-progress;
2.8–2.11 er backlog. Ingen story står i review, og ingen ny port er åpnet.
R1/R4 gjelder senere arbeid; R2/R3 er closed.

Nøyaktig neste steg i en senere bestilt arbeidsrunde: implementer bare Story
2.8 etter godkjente AC og låst arkitektur, med bevart original og utkast.
2.8 er ikke startet i denne runden. Ingen push. Lokal reviewcommit har
meldingen `fix: fullfør uavhengig PDF-review for story 2.7`;
SHA oppgis av orkestratorens samlede overlevering.
