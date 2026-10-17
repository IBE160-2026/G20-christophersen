# Story 1.2 — verifikasjon

**Oppfølging 2026-10-17:** Uavhengig BMAD code review fant og rettet
fokusklipping ved smal/kort zoom samt hull i ordinær dev-/fokus-/HTTP-kontroll.
Gjeldende resultat er **12 beståtte demotester og 2 beståtte dev-tester**,
bestått ren offline build/demo, faktisk HMR-oppdatering og manuell Chrome-zoom.
AC1–AC5 er oppfylt etter retting, og sprintstatus er nå `done`.
[Reviewrapport](story-1-2-review.md) og
[reviewkontroller](story-1-2-review-kontroller.txt) eier disse nye bevisene.
Teksten nedenfor bevarer implementeringens historiske resultat fra 2026-10-16;
åtte tester og sprintstatus `review` beskriver det tidligere tidspunktet.

Dato: 2026-10-16. Utgangspunkt: `4db56a119fc72f9d881b9a3e16a8cd406d9c5f35`.
Autoritet: [Story 1.2, AC1–AC5](../planning-artifacts/epics.md#story-12-starte-den-bygde-lokale-appen-med-godkjent-appskall),
[DESIGN](../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/DESIGN.md),
[EXPERIENCE](../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md),
AD-1/AD-2/AD-9/AD-10, SPEC CAP-8 og sprintplan/status.
Sensorveiledningens s. 1–7 er lest direkte med macOS PDFKit, sammen med
faglærerens tilbakemelding og gjeldende oppfølging. Ingen ekstra produktkrav
er utledet fra kursreferansene.

## Miljø og gjentakelse

macOS 26.6.2, arm64 (Darwin 25.6.0). Node 24.21.0/npm 11.19.0 er brukt fra
den allerede kontrollerte, isolerte installasjonen fra Story 1.1:

```sh
export PATH=/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:$PATH
export npm_config_cache=/tmp/ibe160-story-1-2-npm-cache
export PLAYWRIGHT_BROWSERS_PATH=/tmp/ibe160-story-1-2-browsers
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Playwright 1.64.0 bruker Chromium 156.0.8078.4/revisjon 1248, hentet med
`npx playwright install chromium` før offline kontroll. Lokale tempstier er
denne agentens miljø; den vanlige oppskriften står i [README](../../README.md).
Ingen pin, TLS-verifikasjon eller installasjonspolicy er endret.

[Rå kontrollutskrift](story-1-2-kontroller.txt) bevarer både feil, forventede
avvisninger og vellykkede kjøringer. Installasjonsnett er tillatt; selve
offline build/demo er kontrollert med macOS `sandbox-exec`. Profilen avviser
utgående nett og tillater loopback. Et faktisk TCP-forsøk til 1.1.1.1:443
ble avvist med EPERM før samme profil ble brukt til build/server.
Nettlesertesten sperrer i tillegg alle andre origins enn den lokale appen;
en ekstern kontrollforespørsel beviser at sperren virker.

## Akseptansekriterier og faktiske kontroller

| AC | Etterprøvd leveranse og bevis |
|---|---|
| AC1 | Ren `npm ci`, type/lint og build i ny prosjektmappe uten node_modules/dist/miljøfiler. Build og demo bestod med utgående nett sperret. `lsof` viste én Node-lytter på 127.0.0.1:3000. E2E lastet HTML/JS/CSS lokalt uten eksterne appforespørsler eller KI-klient. |
| AC2 | `npm run dev` viste faktisk skall i Chromium og åpnet HMR på ws://127.0.0.1:3000/. Frontend, CSS og Vite-klient ga HTTP 200. Én kommando/adresse er dokumentert; backendendringer krever manuell omstart. |
| AC3 | E2E bekreftet produktnavn, eksakt demomerke, fire navn/nummer/tekststatus, gjeldende Tallgrunnlag og tre utilgjengelige trinn med tilgjengelige sperreforklaringer. Klikk, Enter og mellomrom gir ingen videregang. Ingen registreringsfelt eller falsk ferdigmarkering finnes. |
| AC4 | E2E kontrollerte faktisk font, farger, størrelser, avstander, radier, fokus og kontrast. Tastatur, hoppelenke, ombryting og fravær av fokusoverlapp bestod ved 1440×900, 1280×800, 720×450 og 360×225 CSS px. Manuell nettleserzoom kontrolleres nedenfor. |
| AC5 | Bygde JS/CSS-ressurser ga 200. Repo-/kilde-/miljø-/Git-/private URL-er, kodet traversering, ukjente assets og /api ble avvist. En faktisk privat kontrollfil i den rene mappen ble ikke eksponert. Manglende build og opptatt port ga trygg, konkret feilmelding/exit 1. Ingen miljømarkør finnes i byggeutdata. |

Åtte Playwright-tester bestod. Ingen kunstig `npm test`, analysefixture,
rapportpipeline eller senere funksjon er opprettet for å få grønne kontroller.
De fire viewportene er automatisert zoomtilpasning, ikke en påstand om at
Playwright har endret nettleserens native zoominnstilling.

Målte kontrastpar i bygget app:

| Par | Forhold |
|---|---:|
| Primærtekst / hvit | 12,8094:1 |
| Sekundærtekst / hvit | 5,9544:1 |
| Sekundærtekst / sekundærflate | 5,2061:1 |
| Hvit / petrol | 6,7011:1 |
| Petrol fokus / sideflate | 6,0972:1 |
| Kontrollkant / hvit | 3,8102:1 |

Alle anvendte informasjonstekstpar møter DESIGNs 4,5:1 og fokus/kontroll
3:1. Den lyse avstanden rundt petrolfylt hoppelenke skiller fokusringen fra
fyllet. Dette er grunnleggende kontroll av skallet, ingen WCAG-sertifisering.

## Feil funnet og rettet under implementeringen

- Oxlint fant en overflødig escape i testens ressursregex; rettet og kontrollert på nytt.
- Første designtest målte transparent body i stedet for den faktisk malte html-bakgrunnen, og sammenlignet hex med versalfølsomhet. Testmålingen ble rettet; paletten ble beholdt.
- Sandkassen nektet lokal lytting. Oppstartsfeilen skiller nå EPERM/EACCES fra opptatt port uten å vise rå feilobjekt. Etter godkjent lokal prosesskjøring bestod server/tester.
- Ren nettinstallasjon fikk én forbigående TLS-feil. Samme pins og TLS-policy bestod ved nytt forsøk; råutskriften beholder feilen. Den dedikerte npm-cachen ble gjenbrukt ved gjentakelser; prosjektmappene var nye.
- Node `--watch` reagerte på Vites genererte konfigurasjonsfiler og startet serveren i løkke. Dev bruker nå én vanlig Node-prosess med Vite-HMR; README forklarer backendomstart.
- Vite 8.3.4 bruker `server.ws.server`; byttet fra den foreldede hmr-innstillingen uten å endre versjon eller arkitektur.
- Et for bredt dev-mønster `**/private/**` sperret Vite-klienten når den rene mappen lå under macOS `/private/tmp`. Sperren er nå knyttet til prosjektets private mappe. Faktisk dev-klient og HMR ble kontrollert etter rettingen. Vite-klientproben bruker nettleserens Sec-Fetch-Dest-header.

## Manuell UX og sluttkontroll

Manuell kontroll er utført mot `npm run demo` i en egen Chrome-fane via
computer-use, etter siste beståtte E2E-kjøring. Eksisterende brukerfaner ble
beholdt. Chrome viste eksplisitt 200 % og 400 % i zoomdialogen; innstillingen
ble til slutt tilbakestilt til 100 %.

| Kontroll | Observert resultat |
|---|---|
| Vanlig desktop | Rolig lys flate, grafitt/petrol, produktnavn og demomerke. Tallgrunnlag gjeldende, øvrige trinn har nummer/navn/tekststatus og forklaring. Tomtilstanden lover ingen ferdige felt eller analyser. |
| Tastatur | Tab viste tydelig ring og lys avstand på hoppelenken. Enter flyttet fokus til h1 «Tallgrunnlag», bekreftet i Chromes tilgjengelighetstre. |
| 200 % | Stepper ombrøt til to kolonner. Arbeidsoverskriften beholdt synlig fokus under navigasjonen; arbeidsinnholdet kunne leses ved rulling. |
| 400 % | Produktnavn/modus og trinntekst ombrøt. Nedpil rullet bare arbeidsinnholdet mens stepperen beholdt sin plass. Shift+Tab tilbake til Resultat rullet navigasjonens egen flate og viste hele knappens nummer/navn/status med fokus. |
| Sperret trinn | Enter/mellomrom på fokusert Resultat åpnet ingen resultatflate. Tilgjengelighetstreet beholdt gjeldende Tallgrunnlag og alle tre utilgjengelige trinn. |

Ved sterk zoom brukes også stepperens eget rulleområde; ingen trinntekst er
fjernet. Skallet er prøvd med faktisk tastatur og visuell inspeksjon av
nettleseren, men ikke med en separat skjermleser. E2E kontrollerer de
tilgjengelige navnene, beskrivelsene og `aria-current`/`aria-disabled`.

Kontrollskriptene [lokal kontroll](story-1-2-lokal-kontroll.py),
[loggføring](story-1-2-logg-kontroll.py) og
[oppryddingskontroll](story-1-2-oppryddingskontroll.py) bevarer verifikasjonsoppsettet som ble
brukt. De er miljøspesifikke prosessbevis, ikke nødvendige appavhengigheter.
Kjøringene tok nye prosjektmapper under `/tmp`; etter første TLS-feil ble
samme dedikerte npm-cache gjenbrukt. En ekstra dev-probe brukte først
modulforespørsel for et privat dokument og krevde feil responskode; den
avsluttende ordinære dokumentforespørselen ga 403 og eksponerte ingen bytes.
`envPrefix: []` hindrer tilpassede miljøvariabler i Vite-klienten; den fiktive
miljømarkøren var fraværende også fra den faktiske dev-miljøressursen.

Blind Hunter fant ti konkrete forbedringer; alle er kontrollert og rettet,
ingen er utsatt. [Storyens triage](spec-1-2-starte-den-bygde-lokale-appen-med-godkjent-appskall.md#review-triage-log)
har én dom/behandling per funn, og arbeidsøkten bevarer råsvaret.
Siste E2E bygger selv gjeldende kilde og bestod alle åtte tester, nå også med
eksisterende privat kontrollfil, If-Match/Range (412/416), faktisk rulling og
fokusringens utstrekning. Privatfilen opprettes i en unik Git-ignorert mappe
og bare denne mappen ryddes etter testen.

Dev-filsperren escaper også glob-spesialtegn i prosjektstien. Siste rene
kontroll brukte `/tmp/ibe160-story-1-2-(2026)-cnhyh_wk` og bekreftet 403 på
faktisk privatfil samt synlig dev-skall/HMR. Package-/lockfil var SHA-256-identiske
med repoets filer etter installasjonen. Statisk feilbehandling avslutter et
allerede påbegynt svar trygt; en midtstrøms diskfeil er ikke særskilt injisert.

Kontrollskriptene er også rettet etter review: logghelper finner egen
checkout, og lokal kontroll rydder prosessgruppen også ved mislykket oppstart.
Det første isolerte oppryddingsforsøket manglet urllib i testharnessets
navnerom; harness ble rettet og begge forsøk beholdes i råutskriften.
Det rettede forsøket startet en faktisk ventende prosess, utløste fristen,
bekreftet forventet oppstartsfeil og kontrollerte at prosessen var stoppet
med exit -15. Råutskriften bruker den opprinnelige tempstien; den samme
kontrollkilden er nå bevart som oppryddingskontroll.py i denne mappen.

**AC1–AC5 er oppfylt.** Storyfilens sluttstatus og sprintstatus oppdateres
etter bmad-builds oneshot-regel: `done` i storyfilen og `review` i sprinten.
Full UJ-1, live-analyse og S1–S6 er ikke verifisert gjennom denne storyen.

## Endrede filer

- `src/frontend/App.tsx`, `main.tsx`, `styles.css`: godkjent skall, tomtilstand, stepper og lokale tokens.
- `src/backend/server.ts`, `README.md`: lokal Express/Vite-server og ansvarsbeskrivelse.
- Rotens `package.json`, `package-lock.json`, `vite.config.ts`, `index.html`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `tsconfig.e2e.json`: nødvendige avhengigheter, scripts, typegrenser og ressurskonfigurasjon.
- `playwright.config.ts`, `tests/e2e/app-shell.spec.ts`: avgrenset kontroll av bygget skall.
- Rotens `README.md`: faktisk installasjon/start/dev/test og avgrensning.
- Storyfil, sprintstatus, denne verifikasjonen, kontrollutskrift, de tre kontrollskriptene og arbeidsøkt/promptlogg: kravspor og faktisk prosessbevis. Låste produktdokumenter og Story 1.1 beholdes uendret.
- `story-1-2-appskall-desktop.png` og `story-1-2-appskall-zoom.png`: faktiske E2E-skjermbilder ved 1440×900 og 720×450 CSS px med tastaturfokus. Disse er viewportbevis, atskilt fra den manuelt prøvde native nettleserzoomen.
