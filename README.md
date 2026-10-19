# G20 — Mads Semb

Gruppeprosjekt i **IBE160 Programmering med KI** ved Høgskolen i Molde, høsten 2026 (15 studiepoeng).

Repoet inneholder gruppens applikasjon og dokumentasjon av utvikling, testing og kvalitetssikring med KI.

## Property Acquisition Agent — Story 1.4

Planlagt produkt er en lokal førstevurdering av ett boligutleieobjekt med
kontrollert tallgrunnlag, tilstandsrapport og kodebasert screening.
Appen har lokal server, godkjent appskall og registrering av P/L/D/J/Ymin.
L/D/J har eksplisitt periode og år. Feltene starter blanke og ubekreftede;
egne råverdier beholdes i den aktive økten, også 0 og sletting. Oppdatering
eller lukking av siden avslutter økten. Tallgrunnlag er gjeldende; senere
trinn viser status og hvorfor de er utilgjengelige. En separat ren domenemodul
validerer tall og normaliserer kjente månedsbeløp eksakt med big.js; denne kan
testes direkte og er ennå ikke koblet til skjermens feil-/bekreftelsesflyt.
Kilde-/kostnadskontroll, bekreftelse, rapportanalyse og screening følger
senere stories. Ingen API-nøkkel, miljøvariabler eller betalt
konto kreves for registreringen.

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
installasjon/build og synlig registrering av finansverdier. Demo serveres fra `dist/` av én
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
npm test
npm run test:e2e
```

E2E bygger gjeldende kilde og starter/stopper først demo og deretter dev på
port 3000, som må være ledig. Seksti rene modultester, nitten demotester
og to dev-tester kjøres gjennom kommandoene over.
Testene kontrollerer startstatus/sperrer, lokal ressurslasting med eksterne
forespørsler blokkert, HTTP-grensen, faktiske designtokens/kontrast og
tastatur/fokus/ombryting ved desktop og viewport tilsvarende sterk zoom,
inkludert 320×200 og korte 320×160/360×160-flater. Dev-kontrollene krever
synlig skall, tilkoblet HMR på samme origin og avvisning av faktiske private filer.
Registreringstestene bruker kontrollerte F1-/F3-verdier og kontrollerer
råstrenger, blank/0/sletting, ubekreftet status, periode/år, retur uten
datatap og tom registrering etter sideoppdatering. De kontrollerer ingen
finansberegning eller anbefaling før disse er implementert.
De 51 domenetestene kontrollerer alle fem felt, blank/0/negative/ikke-numeriske
verdier, bekreftelsesgrunnlag, perioder/år, årsnormaliseringsdelen av
BT-7/BT-15/BT-16, presise desimaler og gjentakelse uten mutasjon.
Chromium-binæren må være installert før offline kjøring. Feilspor/skjermbilder
legges under Git-ignorerte `test-results/`.

Manuell kontroll: Tab viser fokus på hoppelenke og trinn; Enter på hoppelenken
flytter fokus til Tallgrunnlag. Utilgjengelige trinn forklarer sperren og åpnes
ikke med klikk/Enter/mellomrom. Prøv 200 % og 400 % nettleserzoom og rull
arbeidsinnhold med tastatur; navn/nummer/status beholdes, og navigasjonen
dekker ikke innholdet. Tab videre gjennom verdier, perioder og år; fokus og
feltetiketter skal forbli synlige. Prøv for eksempel P=16000000, L=1900000,
D=400000, J=800000 og Ymin=7, velg År og skriv 2026 for L/D/J. Retur til
Tallgrunnlag bevarer registreringen. Slett L eller skriv 0 for å se ulike
ubekreftede tilstander. Faktisk gjennomføring og avgrensning står i
[verifikasjonen for Story 1.2](.docs/implementation-artifacts/story-1-2-verifikasjon.md).
[Verifikasjonen for Story 1.3](.docs/implementation-artifacts/story-1-3-verifikasjon.md)
dekker registrering og aktiv økt.
[Verifikasjonen for Story 1.4](.docs/implementation-artifacts/story-1-4-verifikasjon.md)
dekker den rene validerings-/normaliseringsmodulen.
Full demo, senere funksjonstester og annen-person-bevis for S6 følger sine stories.

Grunnlaget er tilpasset den [offisielle Vite react-ts-starteren](https://github.com/vitejs/vite/tree/df7503cc499e0b49e45701e3be7546918ee9d322/packages/create-vite/template-react-ts).
Demonstrasjonsinnhold er fjernet, React-inngangen er flyttet til `src/frontend/`,
og nødvendige avhengigheter er eksakt låst etter arkitekturen.

## Struktur og importgrenser

| Mappe | Ansvar og importretning etter AD-1 |
|---|---|
| `src/frontend/` | React-appskall, finansregistrering, én reducer for aktiv økt og lokale DESIGN-tokens. Bruker contracts; senere domain og egen presentasjon/PDF-visning. |
| `src/domain/` | Rene regler og beregninger. Bruker contracts. Ingen UI, server eller I/O. |
| `src/contracts/` | Felles runtime-skjema og avledede typer. Ingen UI, server eller I/O. |
| `src/backend/` | Lokal HTTP-server; senere dokumenter, analyseadaptere og contracts. Finans/anbefaling forblir i domain. |
| `tests/e2e/` | Playwright-kontroll mot bygget demo og lokalt dev-skall. |
| `tests/unit/` | Rene Vitest-kontroller av registrering, navigasjon og tall-/årsvalidering. |
| `.docs/` | Autoritative planer, implementeringsbevis og prosesspor. |

Importgrensene gjennomgås ved endringer, inklusive reeksporter, dynamiske
importer og direkte I/O-bruk. Type- og lintkontroll erstatter ikke denne
gjennomgangen mot AD-1. Contracts eier rå/registrert finansschema og
valideringsresultat med avledede typer; `domain/validation.ts` eier numerisk
gyldighet, bekreftelsesbehov og eksakt årsnormalisering. Ingen framtidig
rapportmodell eller finans-/screeningregel er lagt inn.
Private originaldokumenter og lokalt rapportmateriale lagres under `private/`,
som er Git-ignorert. `.env` og `.env.*` holdes utenfor Git, med unntak for
`.env.example` og `.env.*.example` uten hemmeligheter. `node_modules/`, bygge-
og kontrollartefakter holdes også utenfor Git. Framtidige fiktive fixtures får egen versjonert plass
under `tests/fixtures/property-cases/`.

## Plan og prosess

- [Story 1.1 og akseptansekriterier](.docs/planning-artifacts/epics.md#story-11-etablere-reproduserbar-startstruktur-og-importgrenser)
- [Story 1.2 og akseptansekriterier](.docs/planning-artifacts/epics.md#story-12-starte-den-bygde-lokale-appen-med-godkjent-appskall)
- [Story 1.3 og akseptansekriterier](.docs/planning-artifacts/epics.md#story-13-registrere-og-bevare-finansverdier-for-ett-objekt)
- [Story 1.4 og akseptansekriterier](.docs/planning-artifacts/epics.md#story-14-validere-tall-og-normalisere-kjent-månedsgrunnlag-eksakt)
- [Arkitektur og AD-1–AD-10](.docs/planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md)
- [SPEC og adoptert planverk](.docs/specs/spec-IBE160/SPEC.md)
- [Sprintplan](.docs/implementation-artifacts/sprint-plan.md) og [sprintstatus](.docs/implementation-artifacts/sprint-status.yaml)
- [Faktisk verifikasjon av Story 1.1](.docs/implementation-artifacts/story-1-1-verifikasjon.md)
- [Story 1.2 og implementeringsnotater](.docs/implementation-artifacts/spec-1-2-starte-den-bygde-lokale-appen-med-godkjent-appskall.md)
- [Arbeidsøkt for Story 1.2](.docs/process/arbeidsokter/2026-10-16-story-1-2.md)
- [Uavhengig review av Story 1.2](.docs/implementation-artifacts/story-1-2-review.md)
- [Story 1.3 og implementeringsnotater](.docs/implementation-artifacts/spec-1-3-registrere-og-bevare-finansverdier-for-ett-objekt.md)
- [Arbeidsøkt for Story 1.3](.docs/process/arbeidsokter/2026-10-17-story-1-3.md)
- [Story 1.4 og implementeringsnotater](.docs/implementation-artifacts/spec-1-4-validere-tall-og-normalisere-kjent-manedsgrunnlag-eksakt.md)
- [Arbeidsøkt for Story 1.4](.docs/process/arbeidsokter/2026-10-19-story-1-4.md)
- [Lagrede brukerprompter](.docs/process/prompts/README.md)

## Medlemmer

- Mads Semb Christophersen
