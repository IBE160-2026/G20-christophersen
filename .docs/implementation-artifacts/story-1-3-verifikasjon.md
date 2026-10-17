# Story 1.3 — implementeringsverifikasjon

Dato: 2026-10-17. Baseline: `0a8e21dfb10bd8a41609728446d5b86156bde154`.
Story: [1.3 AC1–AC4](../planning-artifacts/epics.md#story-13-registrere-og-bevare-finansverdier-for-ett-objekt).
Leveransen er implementert og klar for separat BMAD code review. Denne
implementeringskontrollen setter ikke `done` og er ikke en uavhengig review.

## Grunnlag og leveranse

Story 1.2 var `done` ved start. Story 1.3, final DESIGN/EXPERIENCE,
ARCHITECTURE-SPINE, SPEC med kompanjonger, epics, sprintplan/status og forrige
story er lest direkte. PRDs registrerings-/valideringskrav, faglærerens
tilbakemelding og gjeldende oppfølging samt sensorveiledningen s. 1–7
(PDFKit-uttrekk) er brukt. Ingen låst plan er endret; ingen readiness-port er lukket.

Appen har fem rå verdiinput, tre periodekontroller og tre årsfelt.
Contracts eier ett råschema med avledede typer. Én React-reducer eier
registreringen, som opphører ved ny sideøkt. P og Ymin har ingen
periodeomregning; L/D/J starter uten periode og år. Ingen numerisk
validering, normalisering, kilde-/kostnadskontroll, bekreftelseshandling,
analyse eller beregning er lagt til. Disse beholder sine senere stories.

Endrede produkt-/testfiler: `src/contracts/financial-input.ts`,
`src/frontend/state/session.ts`, `src/frontend/screens/FinancialInput.tsx`,
`src/frontend/App.tsx`, `src/frontend/styles.css`, `tests/unit/session.test.ts`,
`tests/e2e/financial-input.spec.ts`, begge eksisterende E2E-filer,
`playwright.config.ts`, `vitest.config.ts`, `tsconfig.node.json`,
`package.json` og `package-lock.json`. README, story-/sprintstatus og
denne fasens prosess-/bevisfiler følger endringen. Backend og domain er urørt.

## Faktiske resultater

Miljø: macOS arm64; Node **24.21.0**, npm **11.19.0**, React **19.3.0**,
Playwright **1.64.0** og Chromium fra forrige storys installasjon.
Zod **4.6.7** og Vitest **5.0.4** er lagt til eksakt ved første behov.
Eksisterende pins er beholdt. Installasjon av begge pakker avsluttet med 0
og npm rapporterte 0 sårbarheter. Det kjente valgfrie fsevents-scriptvarselet
ble fortsatt vist; ingen installasjonspolicy er endret.

| Kontroll | Resultat |
|---|---|
| `npm test` | 8/8 Vitest-tester bestått. |
| `npm run typecheck` | Bestått. Omfatter også rene tester og Vitest-konfigurasjon. |
| `npm run lint` | Bestått uten advarsler. |
| `npm run build` | Bestått, bygget fra aktuell kilde. |
| `npm run test:e2e` | 17/17 bygget demo + 2/2 dev-tester bestått. |
| AD-1/importer | Contracts bruker kun Zod; frontend bruker contracts. Ingen I/O/React/serverimport i contracts, ingen ny domene-/serverregel. |
| Visuell kontroll | Faktisk native Chrome ved 100/200/400 %; dessuten lagrede Chromium-bilder fra faktisk bygget skjema ved 1440×900 og 360×225. |

[Rå kontrollutskrift](story-1-3-kontroller.txt) bevarer kommandoer, faktiske
utdata, miljøfeil og sluttresultat. Reproduser med README eller dette øktmiljøet:

```sh
export PATH=/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:$PATH
export PLAYWRIGHT_BROWSERS_PATH=/tmp/ibe160-story-1-2-browsers
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Testene trenger en ledig port 3000 og tillatelse til lokal nettleser/server.
Ingen betalt API brukes. Full ren installasjon/OS-nettsperre fra 1.2 er ikke
gjentatt; denne storyen endrer ingen server-/nettverksbane. E2E beholder
lokal ressurslasting med eksterne appforespørsler blokkert, reelle private
kontrollfiler/HTTP-grenser, fokus/kontrast, sterke zoomstørrelser og dev/HMR.
Ingen bestått S1–S6, full demo eller live-analyse påstås.

## AC-bevis

| AC | Implementering og etterprøvd atferd |
|---|---|
| AC1 | Ny reducerøkt og bygget UI har blanke P/L/D/J/Ymin, `confirmed: false`, synlige etiketter, NOK/% og feltbeskrivelser. Playwright kontrollerer navn og tilgjengelige beskrivelser for P/D/J. |
| AC2 | L/D/J beholder hver rå verdi, eksplisitt År/Måned/Ukjent/Ikke oppgitt og eget rå år. Rene tester bevarer også forskjellige år og mellomrom; UI bevarer måned og rå år ved retur. Ingen årsnormalisering eller skjult år/periode finnes. |
| AC3 | Rene parameteriserte tester for alle fem felt bevarer rå mellomrom/desimaler/fortegn/tekst, 0 og sletting uten bekreftelse. UI viser «0 registrert · Ubekreftet», «Ikke oppgitt · Ubekreftet» og ellers registrert/ubekreftet. F1 og F3s slettede L inngår. |
| AC4 | Ren navigasjon returnerer identisk fryst tilstand, uten mutasjon. Faktisk retur til det tilgjengelige Tallgrunnlag med klikk/Enter bevarer verdier/år/periode og fokuserer overskriften; ingen API-/analyseforespørsel sendes. Ingen senere trinn åpnes på forskudd. Ny sideøkt er blank etter reload. |

## Visuelt og manuelt

[Desktopbilde](story-1-3-desktop.png) viser et faktisk bygget skjema med
F1-delinput P/L, År/2026 og synlig fokus på P.
[Smal fokusvisning](story-1-3-zoom.png) viser samme input ved 360×225.
Bildene er sett direkte. Feltfokus ligger under stepperen og innen
arbeidsområdet. De automatiske UI-kontrollene følger alle elleve kontroller
i arbeidsrekkefølge ved 1440×900, 720×450 og 360×225, inklusive hele
2 px-fokusrammen med 3 px-avstand. Eksisterende skallregresjon dekker også
1280×800, 640×400, 320×200 og korte 320×160/360×160.

Native Chrome viste tom registrering i en fersk fane, tok imot P/L/år og
beholdt ubekreftet status. Faktisk 200/400 % ble satt gjennom Chromes
zoomknapper; stepper og feltgrupper ombryter og har separate rulleområder.
100 % zoom er gjenopprettet, kontrollfanen er lukket, DevTools lukket og
opprinnelig appadresse gjenopprettet. Native tastaturoppsett gjorde
zoom-snarveier upålitelige og Tab hoppet over den native periodekontrollen;
full kontrollrekkefølge og periodevalg er derfor dokumentert med den
automatiske Chromium-kontrollen, ikke påstått manuelt bestått i native Chrome.

Gammel native fane var først blank ved reload; en fersk fane og senere den
opprinnelige fanen viste normalt skjema. Konsollen viste bare en manglende
favicon (404), ingen observert JavaScript-feil. Dette samsvarer med tidligere
native transient i 1.2; ingen vedvarende appfeil ble reprodusert.

## Avvisninger og åpen status

Første npm-fetch fikk sandbox-DNS-feil; autorisert eskalert installasjon av
samme pins bestod. Første E2E fikk miljøets loopback-sperre, neste kjøring
avviste en allerede kjørende demo. Den gamle prosessen ble identifisert som
`node src/backend/server.ts` fra dette repoet på 127.0.0.1:3000 (PID 4890),
midlertidig stoppet og erstattet med lokal demo for kontroller. Ingen
uidentifisert prosess ble stoppet. Ingen produkttest feilet etter at miljøet
var riktig satt opp.

Storyfil: **in-review**. Sprintnøkkel 1.3: **review**. Epic 1:
**in-progress**. Story 1.4 og alle senere: **backlog**. Det gjenstår separat
BMAD code review av 1.3 før 1.4 kan startes. Ingen nye produkt-/arkitekturvalg
eller åpne spørsmål er identifisert i denne implementeringen.
