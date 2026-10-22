# Story 5.2 — Faktisk manuell UX-kontroll

Dato 2026-10-22. Baseline: `69c3695822b222f6c19cc94a52230b42e0c4759d`. Kontrollert kode er denne baseline pluss tomlisterettingen vist nedenfor. Endelig implementeringscommit oppgis i arbeidsøkten etter lokal commit; review/done avgjøres separat.

## Grunnlag og miljø

Story 5.2 AC1–6 i [epics](../planning-artifacts/epics.md), final [EXPERIENCE](../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md) Key Flows 1–4/State Patterns/Interaction Primitives/Responsive & Platform og [DESIGN](../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/DESIGN.md) er forventningsgrunnlag, med Epic 5-kontekst, SPEC, arkitektur, sprintplan/status og deres bevarte kurs-/faglærerspor. Ingen nye krav eller R1-valg.

macOS 26.6.2 (25G83), faktisk Google Chrome 155.0.8059.85, Node 24.21.0/npm 11.19.0. Bygget frontend (`npm run build`) og `npm run demo` på `http://127.0.0.1:3000`; ingen nøkkel/live-tjeneste. Faktisk native Chrome er betjent via `cua_repl` med tilgjengelighetstre, skjermbilder, musehandlinger, filvelger og tastatur. Browserprovidere iab/chrome var utilgjengelige; native app fungerte. Første filvelgerovergang ga kortvarig CUA-timeout; Escape gjenopprettet uten produktendring. Ingen appfeil ble utledet fra verktøyfeilen.

F1/F2/F4 ble valgt som faktiske PDF-filer i `tests/fixtures/property-cases/`, med uavhengige finansforventninger fra `expected.json`. Første F1 hadde en samlet fiktiv driftspost 400000, rentedel 0; ingen påstand om faktisk markeds-/eiendomsinformasjon. P16000000, D400000, J800000, Ymin7, år2026; L1900000 for F1/F4 og1400000 for F2. Alle kilder var eksplisitte fiktive brukerforutsetninger. Tastatur ble brukt til felt, valg, bekreftelse, navigasjon, utkast, panel og detaljer; ikke hele den første dataregistreringen utelukkende med tastatur.

Eksakte CSS-flater 1440×900, 1280×800 og1000×800 ble satt gjennom Chromes DevTools Responsive-toolbar. «Fit to window» skalerer fremvisningen av emulert flate og er ikke nettleserzoom. I tillegg ble ekte nettleserzoom110/125% valgt fra View→Zoom In;125% ga behovspanel på den vanlige desktopflaten. Zoom ble satt tilbake til100% etterpå. Åtte faktiske skjermbilder og fem AX-uttrekk er lenket under; disse er observasjonsbevis, ikke mocks.

## Registrerte manuelle prøver

«Som forventet» nedenfor betyr faktisk sett/utført, med unntakene uttrykkelig oppgitt i siste seksjon. Gjennomgangens produktfunn U1 har egen før/etter-kontroll. Øvrige rader krevde ingen fiks eller repetisjon.

| ID / flyt | Miljø/case og faktisk handling | Forventet → faktisk | Kravspor / status |
|---|---|---|---|
| M01 /1 | Standarddemo, tomt Tallgrunnlag: aktiver Bekreft tallgrunnlaget | Lokale felt-/kildemangler og Innhent mer informasjon, input beholdes, første felt P fokuseres → sett. Ingen omvei til Resultat. | AC1/2/5; UX-DR32/34; bestått |
| M02 /1 | F1 registrert med perioder, år, kilde/forutsetning og kostnadsinnhold; bekreft, Tab/Enter til rapport | Registrert≠bekreftet, riktig år/enhet, alle fem bekreftet; trinnnavn Tallgrunnlag→Tilstandsrapport og fokus på overskrift → sett. Sperrede trinn forklarer manglende grunnlag. | AC1/2; UX-DR2/5–9/32/34; bestått |
| M03 /1 | F1 valgt i native filvelger, eksplisitt Start analyse, gå til kontroll | SHA/dokumentidentitet, valgt/analyserer/mottatt/klar-listestatus skilles; Start sperret under analyse. Liste ubekreftet til separat kontroll → sett. Fokus ble på Start under analyseovergang og overskrift ved navigasjon. | AC1/2; UX-DR10/11/33/36; bestått |
| M04 /1 | F1: velg TG2, les PDF2, Neste→3, Forrige→2 | Funnvalg beholder fokus; fysisk riktig side og helside-/nabokontroller; dokument/side navngitt i kort PDF-status → sett og originaltekst lest. | AC2/3; UX-DR17/30/33/34; bestått |
| M05 /2 | F1: Korriger; skriv ubrukt beskrivelsesutkast; bytt1440→1280→1000; åpne PDF, Tab/ShiftTab, Esc; Avbryt med tastatur | Original/Gjeldende/Ubrukt er skilt; tekst bevares ved størrelse/panel. Bredt side-ved-side, smalt behovspanel; paneloverskrift fokuseres, ShiftTab fra første går til siste, Esc→åpner. Avbryt beholder original, gir status og fokus Korriger → sett. | AC1–3; UX-DR15–17/30/31; bestått, [1440](story-5-2-1440-f1.png), [1280](story-5-2-1280-utkast.png), [1000](story-5-2-1000-panel.png) |
| M06 /1 | F1: Bekreft enkeltfunn, separat Bekreft liste, Tab/Enter Beregn | Enkeltfunn fullfører ikke listen. Resultat: Gå videre,11,875%,1500000,9,375%,700000; alle tre avgjørende forhold og neste «grundigere vurdering/befaring» uten detaljåpning → sett. | AC1/2/5; UX-DR19/20/21/39; bestått |
| M07 /1 | Resultat: Tab/Enter åpne/lukk Bruttoyield-detalj, neste Tab | Formel L/P×100%, anvendt årsverdi/kilde vises. Lukket innhold forsvinner fra AX, neste Tab fokuserer NOI-disclosure; forventet åpen/lukket semantikk → sett. | AC2/5; UX-DR22/23/34/39; bestått |
| M08 /3 | F1 Resultat→Tallgrunnlag uten endring, endre L1400000/kildetekst, åpne Resultat før ny bekreftelse | Retur alene bevarer bekreftelser; faktisk endring gir Endret/Utdatert. Historisk anbefaling/tall beholder gammel basis, endret L/kilde og nødvendig ny kontroll navngis → sett. | AC1/4/5; UX-DR26/38/39; bestått, [historisk](story-5-2-historisk.png) |
| M09 /1,3 | Bekreft endret L; velg faktisk F2-PDF, ny analyse, kontroller PDF2/funn/liste og resultat | Ny rapport starter uten gammel listekontroll. F2 Forkast med nettoyield6,250%<7%, brutto8,750%,NOI1000000,kontant200000; tydelig «Forkast objektet på gjeldende screeninggrunnlag» → sett. | AC1/5; UX-DR10/20/26/39; bestått, [F2](story-5-2-f2-resultat.png) |
| M10 /2 | F4-finans/PDF; TG2-utkast side31, forsøk Bruk; korriger side2/beskrivelse med punktum, Bruk | Side31 gir lokal «fra1 til4» og fokus sidefelt; ingen gjettet side. Bruk side2 gir Brukerkorrigert/Ikke kontrollert, opprinnelig tekst og gjeldende punktumversjon samtidig; ny enkeltkontroll/liste kreves → sett. Punktum er disponibel kontrollvariant, ingen påstand om faktisk KI-feil i F4. | AC1/2/3; UX-DR14–16/32; bestått |
| M11 /2 | F4: TG3 velges/bekreftes mot faktisk PDF4 med trykt2; Avklart uten tekster; velg Uavklart, listebekreft | Uttrekksbekreftelse avklarer ikke TG3. Avklart uten tekst er utilstrekkelig med begge tekstmangler; Uavklart kan fullføre menneskelig kontroll. PDF-posisjon4 er tydelig atskilt fra trykt2 → sett. | AC1/3/5; UX-DR18/19/33/39; bestått |
| M12 /1,2 | F4 Uavklart, vis resultat uten detaljer | Innhent mer informasjon prioritet1, navngitt TG3/PDF4, konkret neste handling. Fire F1-tall merket Delgrunnlag, alvorlig TG3 fortsatt synlig → sett. | AC1/4/5; UX-DR18/20/21/39; bestått, [F4](story-5-2-f4-delgrunnlag.png) |
| M13 /3 | Fra F4-resultat: endre TG3-begrunnelse og konkret fiktiv takkontrollreferanse, velg Avklart, Vis resultat | Tekstendring gjør straks gammelt resultat Utdatert; gyldig Avklart gir Gå videre med TG3 beholdt, brukeropphav/«ikke nødvendigvis utbedret» synlig. Uendrede tall/liste forblir bekreftet → sett. | AC1/5; UX-DR18/26/38; bestått |
| M14 /2,3 | Disponibel F4-variant: velg TG2, Tab/Tab/Enter Avvis | Ikke aktivt rapportfunn; original bevart, tidligere korrigering historisk, ingen teknisk godkjenning. Liste ubekreftet og resultat Utdatert → sett. | AC1/5; UX-DR14/16/26; bestått, [AX](story-5-2-avvisning-ax.txt) |
| M15 /4 | Standarddemo: velg faktisk invalid-format.pdf, Start | Dokumentfeil invalid-format, kjent årsak/handling og lokal Innhent mer informasjon; ingen fullført/tomliste/kontrollreise. Fokus beholdes på Start → sett. | AC1/2/5; UX-DR10/11/20/33; bestått, [AX](story-5-2-dokumentfeil-ax.txt) |
| M16 /4 | Kontrollert HTTP-inngang empty.pdf; faktisk manuell bygget UI | Fullført tomliste og separat bekreftelse er tydelig. Original utilgjengelig før kontroll: faktisk feil U1, rettet og omkontrollert M19. | AC1/5/6; UX-DR17/19/41; [før-AX](story-5-2-tomliste-for-ax.txt) |
| M17 /2,4 | Kontrollert uncertain.pdf: velg Usikker vegg uten kilde | Usikker TG, missing-source, ukjent PDF-side/tekstusikkerhet og Begrensninger; Bekreft sperret, PDF sier «Ingen side er valgt», ingen gjetting → sett. | AC1/2/3/5; UX-DR12/17/20/34; bestått, [AX](story-5-2-usikker-ax.txt) |
| M18 /4 | Kontrollert partial.pdf: Start | timeout/Analysen ble ikke fullført, «Delresultat — ufullstendig analyse», lokale blokkere og neste handling; ingen listebekreftelse/normal kontrollretur → sett. | AC1/2/5; UX-DR11/20/33/41; bestått, [AX](story-5-2-delanalyse-ax.txt) |
| M19 /U1 | Ny build, faktisk manuelt registrerte F1-tall, empty.pdf via kontrolladapter; velg original før bekreftelse. Deretter ekte125% zoom, Tab/Enter panel, Esc | Knappen gir originalside1 og originaltekst uten bekreftelse. Under1200 viser Åpne originalrapport et panel med overskriftsfokus; Esc→åpner, liste fortsatt ubekreftet → sett. | AC2/3/5/6; UX-DR17/30/31; rettet/bestått, [bredt](story-5-2-tomliste-etter.png), [125%](story-5-2-125zoom-original.png) |

## Konkret avvik og retting

U1 tilhører eksisterende rapport-/originalkontroll (Story2.7) og felles kontrollflyt: tomt fullført uttrekk har ingen funn å velge, så «Velg et funn» ga ingen vei til original før listebekreftelse. `ReportAnalysis.tsx` viser nå «Velg originalrapport for kontroll» bare ved faktisk completed uten funn/usikre kandidater. Handlingen gjenbruker `onView`/PDF-posisjon1 og eksisterende bred/smal viewer. Ingen regel, navigasjonsport, ekstraksjon eller produktkontrakt endret. E2E-prøven ved samme adaptergrense sjekker faktisk PDF1 før bekreftelse, smalt panel og Esc-fokus. Relevant prøve1/1 bestått; faktisk manuell omkontroll M19 bestått. Ingen øvrige uløste konkrete UX-avvik ble observert i utførte prøver.

## Visuell kontroll og kontrast

Faktiske skjermbilder viser rolig grafitt/petrol, hvitt/subtilt underlag, tekstlige trinnnummer/navn/status, 24px-gap og omtrent44/56 funn/PDF; ingen farge er eneste meningsbærer. Systemtypografi24px/16px/14px og nøkkeltall22px, kontrollhøyde36px, fokus2px med3px avstand samsvarer ved kilde-/visningssammenligning. Dekorative trinnsirkler er aria-hidden mens nummer inngår i kontrollnavnets Trinn-tekst; PDF har tilgjengelig tekstlag og navngitte kontroller. Ingen meningsbærende ikon uten tekstalternativ ble observert. Skjermbilder ved1280 og1000 viser ombryting av navn, hash, kilder og utkast; fokusert felt/overskrift var synlig under stepperen i prøvene.

[Kontrastmåling](story-5-2-kontrast.txt) bruker faktisk implementerte CSS-hekspar og standard sRGB-relativ luminans, `(Llys+0,05)/(Lmørk+0,05)`, ikke skjermbildets antialias-piksler. Parene er valgt fra faktisk vist hoved-/status-/historisk-/felt-/fokusflate, ikke dekorative skillelinjer. Tekst primær/hvit12,809; sekundær/hvit5,954; sekundær/subtil (historisk/status)5,206; sekundær/suksess5,358 og/varsel5,393; hvit/petrol6,701. Statusfargene på egne underlag6,505/6,150/6,149. Kontrollgrense/hvit3,810 og/subtil3,331; fokus/hvit6,701,/side6,097,/subtil5,859. Alle målte nødvendige par oppfyller praktiske4,5:1/3:1-mål. Ingen sertifiseringspåstand.

## Kontrollert inngang og begrensninger

Standard lagret demo inneholder bare F1–F4. Tom/usikker/timeout kan derfor ikke påstås som faktisk modellutfall eller naturlig standarddemoresultat. M16–19 brukte den eksisterende `tests/helpers/report-ui-adapter.ts` ved `createAnalysisRouter({adapterModule: …})`, akkurat samme HTTP-/validerings-/frontendgrense som eksisterende E2E. En midlertidig lokal Express-server erstattet standardserveren på3000, serverte uendret `dist` og samme router. Ingen browser-route-mock eller DOM-/øktinjeksjon ble brukt. Midlertidige kopier av faktiske F1/F2/F4-bytes het henholdsvis empty.pdf/uncertain.pdf/partial.pdf i `/private/tmp/ibe160-story-5-2-ui`; filnavnet velger eksisterende kontrollretur. PDF-innholdets F1-navn inne i empty.pdf er derfor forventet testproveniens, ikke produksjonsnavnefeil. Dette tester faktisk manuell UI-reaksjon på kontrollerte utfall, ikke uttrekkskvalitet. Kontrollserveren er stoppet før regresjon.

Statusoverganger ble manuelt observert i AX og sammenholdt med faktisk fokus: analyserer→mottatt→klar liste, PDF dokument/side→tilgjengelig, resultat gjeldende→utdatert→ny anbefaling. De korte statusregionene skiftet uten fokusstjeling; samme tekst ble ikke observert som nye, gjentatte AX-endringer under uendret tilstand. Auditiv VoiceOver/NVDA-opplesning og antall reelle talekunngjøringer er **ikke kjørt**, så ingen garanti for alle hjelpemidler. Eksisterende automatiske status-/fokustester er støttebevis, ikke erstatning for M01–19. Hver mulig RT-/AT-kantvariant er ikke manuelt gjentatt;31-sider/OCR/nett-/live-leverandørfeil er ikke prøvd manuelt her. Ingen ny mobilreise, faktisk annen person/S6, live-S2/S5 eller Epic4/R1-konklusjon.

## Automatisk regresjon

Se rålogger for bygge-/typekontroll, lint, relevant E2E og full suite. Disse kjøres sekvensielt med Node24, eksisterende Chromium-cache og godkjent lokal loopback. Manuelle rader ovenfor står på egne faktiske observasjoner.

- [Build/typecheck](story-5-2-build.txt): bestått; eksisterende Vite-varsel om stor chunk er bevart.
- [Relevant bygget-app-E2E](story-5-2-relevant-e2e.txt):1/1 bestått,4,3s.
- [Lint](story-5-2-lint.txt): exit0.
- [Full Vitest](story-5-2-vitest.txt):962/962 i31 filer,83,55s.
- [Full bygget-app/dev-E2E](story-5-2-e2e.txt):114/114 (1,0min) og3/3 (1,9s), med ny typecheck/build.
- [Komponenter](story-5-2-komponenter.txt):37/37,4,2s.
- `git diff --check`: bestått. Ingen feil i de avsluttende sekvensielle kontrollene.

Story er in-review/review; uavhengig review er neste checkpoint. Ingen done fra implementeringsagenten.


Implementeringscommit (faktisk kode og de kjørte testene): `51a4754b4485caa43eab2fd937473f7c3c490f7a`. Dette etterfølgende bevischeckpointet endrer bare dokumentasjon av commit-ID; ingen kildekode/testforventning er endret etter regresjonen.
