# G20 — Mads Semb

Gruppeprosjekt i **IBE160 Programmering med KI** ved Høgskolen i Molde, høsten 2026 (15 studiepoeng).

Repoet inneholder gruppens applikasjon og dokumentasjon av utvikling, testing og kvalitetssikring med KI.

## Property Acquisition Agent — Story 1.2

Planlagt produkt er en lokal førstevurdering av ett boligutleieobjekt med
kontrollert tallgrunnlag, tilstandsrapport og kodebasert screening.
Appen har nå lokal server og et appskall med godkjent grafitt-/petrolpalett,
systemfont og firetrinns navigasjon. Tallgrunnlag er gjeldende; senere trinn
viser status og hvorfor de er utilgjengelige. Registrering av tall,
rapportanalyse og screening er ennå ikke implementert. Ingen testdata,
API-nøkkel, miljøvariabler eller betalt konto kreves for denne leveransen.

## Installasjon og kontroll

Bruk **Node.js 24.21.0 LTS og medfølgende npm 11.19.0**. `.nvmrc` angir
Node-versjonen; `.npmrc` avviser feil Node-/npm-versjon. Med nvm installert kan
versjonen velges med `nvm install` og `nvm use` fra reporoten. Ellers installer
[Node.js 24.21.0](https://nodejs.org/en/blog/release/v24.21.0) før kommandoene.

Kjør fra reporoten:

```sh
node --version
npm --version
npm ci
npm run build
npm run demo
```

Åpne **http://127.0.0.1:3000**. Forventet: `v24.21.0`, `11.19.0`, vellykket
installasjon/build og synlig appskall. Demo serveres fra `dist/` av én
Express-prosess på loopback. Samme adresse er reservert for senere `/api`;
API-ruter svarer foreløpig 404. Reporot og private dokumenter serveres ikke.
Stopp med **Ctrl+C**. Port 3000 må være ledig; serveren velger ikke en annen
port i stillhet. Manglende build gir beskjed om å kjøre `npm run build`.

Installasjon krever nett til npm-registeret. Etter installasjon kan både
build og demo kjøres med eksternt nett sperret. Modusmerket
«Demo · lagret KI-uttrekk» følger godkjent UX; rapport/lagret uttrekk kommer i
senere stories og er ikke tilgjengelig gjennom dette appskallet.

npm 11.19.0 kan på macOS varsle om
installasjonsscriptet til den valgfrie avhengigheten `fsevents@2.3.3`;
installasjonen og kontrollene er prøvd med dette varselet og avsluttes med 0.
Oppskriften er prøvd på macOS 26.6.2 (arm64). Andre plattformer er ikke
etterprøvd.

## Utvikling

Etter `npm ci`, med demo stoppet:

```sh
npm run dev
```

Åpne **http://127.0.0.1:3000**. Kommandoen starter Express med Vite-middleware
og lokal HMR i samme app-prosess. Ved endring av backend-koden stopper du og
starter `npm run dev` på nytt. Ingen ekstra serverkommando kreves.
Stopp med **Ctrl+C** før demo eller E2E kjøres.

## Kvalitetskontroll og tester

Kjør fra reporoten. Installer testnettleseren mens nett er tilgjengelig:

```sh
npx playwright install chromium
npm run typecheck
npm run lint
npm run test:e2e
```

E2E bygger gjeldende kilde og starter/stopper selv appen på port 3000, som må være ledig.
Testene kontrollerer startstatus/sperrer, lokal ressurslasting med eksterne
forespørsler blokkert, HTTP-grensen, faktiske designtokens/kontrast og
tastatur/fokus/ombryting ved desktop og viewport tilsvarende sterk zoom.
Chromium-binæren må være installert før offline kjøring. Feilspor/skjermbilder
legges under Git-ignorerte `test-results/`.

Manuell kontroll: Tab viser fokus på hoppelenke og trinn; Enter på hoppelenken
flytter fokus til Tallgrunnlag. Utilgjengelige trinn forklarer sperren og åpnes
ikke med klikk/Enter/mellomrom. Prøv 200 % og 400 % nettleserzoom og rull
arbeidsinnhold med tastatur; navn/nummer/status beholdes, og navigasjonen
dekker ikke innholdet. Faktisk gjennomføring og avgrensning står i
[verifikasjonen for Story 1.2](.docs/implementation-artifacts/story-1-2-verifikasjon.md).
Full demo, senere funksjonstester og annen-person-bevis for S6 følger sine stories.

Grunnlaget er tilpasset den [offisielle Vite react-ts-starteren](https://github.com/vitejs/vite/tree/df7503cc499e0b49e45701e3be7546918ee9d322/packages/create-vite/template-react-ts).
Demonstrasjonsinnhold er fjernet, React-inngangen er flyttet til `src/frontend/`,
og nødvendige avhengigheter er eksakt låst etter arkitekturen.

## Struktur og importgrenser

| Mappe | Ansvar og importretning etter AD-1 |
|---|---|
| `src/frontend/` | React-appskall og lokale DESIGN-tokens. Senere aktiv økt, domain, contracts og egen presentasjon/PDF-visning. |
| `src/domain/` | Rene regler og beregninger. Bruker contracts. Ingen UI, server eller I/O. |
| `src/contracts/` | Felles runtime-skjema og avledede typer. Ingen UI, server eller I/O. |
| `src/backend/` | Lokal HTTP-server; senere dokumenter, analyseadaptere og contracts. Finans/anbefaling forblir i domain. |
| `tests/e2e/` | Playwright-kontroll mot den bygde lokale appen. |
| `.docs/` | Autoritative planer, implementeringsbevis og prosesspor. |

Importgrensene gjennomgås ved endringer, inklusive reeksporter, dynamiske
importer og direkte I/O-bruk. Type- og lintkontroll erstatter ikke denne
gjennomgangen mot AD-1. Domene-/kontraktmapper inneholder
foreløpig bare ansvarsbeskrivelser, uten framtidig modell eller forretningslogikk.
Private originaldokumenter og lokalt rapportmateriale lagres under `private/`,
som er Git-ignorert. `.env` og `.env.*` holdes utenfor Git, med unntak for
`.env.example` og `.env.*.example` uten hemmeligheter. `node_modules/`, bygge-
og kontrollartefakter holdes også utenfor Git. Framtidige fiktive fixtures får egen versjonert plass
under `tests/fixtures/property-cases/`.

## Plan og prosess

- [Story 1.1 og akseptansekriterier](.docs/planning-artifacts/epics.md#story-11-etablere-reproduserbar-startstruktur-og-importgrenser)
- [Story 1.2 og akseptansekriterier](.docs/planning-artifacts/epics.md#story-12-starte-den-bygde-lokale-appen-med-godkjent-appskall)
- [Arkitektur og AD-1–AD-10](.docs/planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md)
- [SPEC og adoptert planverk](.docs/specs/spec-IBE160/SPEC.md)
- [Sprintplan](.docs/implementation-artifacts/sprint-plan.md) og [sprintstatus](.docs/implementation-artifacts/sprint-status.yaml)
- [Faktisk verifikasjon av Story 1.1](.docs/implementation-artifacts/story-1-1-verifikasjon.md)
- [Story 1.2 og implementeringsnotater](.docs/implementation-artifacts/spec-1-2-starte-den-bygde-lokale-appen-med-godkjent-appskall.md)
- [Arbeidsøkt for Story 1.2](.docs/process/arbeidsokter/2026-10-16-story-1-2.md)
- [Lagrede brukerprompter](.docs/process/prompts/README.md)

## Medlemmer

- Mads Semb Christophersen
