# G20 — Mads Semb

Gruppeprosjekt i **IBE160 Programmering med KI** ved Høgskolen i Molde, høsten 2026 (15 studiepoeng).

Repoet inneholder gruppens applikasjon og dokumentasjon av utvikling, testing og kvalitetssikring med KI.

## Property Acquisition Agent — Story 1.1

Planlagt produkt er en lokal førstevurdering av ett boligutleieobjekt med
kontrollert tallgrunnlag, tilstandsrapport og kodebasert screening.
Nå er startstrukturen etablert. Lokal appserver, oppstartskommandoer og godkjent
appskall leveres i Story 1.2.

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
npm run typecheck
npm run lint
```

Forventet: `v24.21.0`, `11.19.0`, vellykket installasjon fra låsfilen og begge
kontroller uten feil eller advarsler. npm 11.19.0 kan på macOS varsle om
installasjonsscriptet til den valgfrie avhengigheten `fsevents@2.3.3`;
installasjonen og kontrollene er prøvd med dette varselet og avsluttes med 0.
Installasjon krever nett til npm-registeret.
Oppskriften er prøvd på macOS 26.6.2 (arm64). Andre plattformer er ikke
etterprøvd i Story 1.1.
Kontrollene krever ingen API-nøkkel eller betalt tjeneste. De sjekker faktisk
TypeScript-/React-kilde og Vite-konfigurasjon; funksjonstester tilføyes sammen
med funksjonene de skal verifisere.

Grunnlaget er tilpasset den [offisielle Vite react-ts-starteren](https://github.com/vitejs/vite/tree/df7503cc499e0b49e45701e3be7546918ee9d322/packages/create-vite/template-react-ts).
Demonstrasjonsinnhold er fjernet, React-inngangen er flyttet til `src/frontend/`,
og nødvendige avhengigheter er eksakt låst etter arkitekturen.

## Struktur og importgrenser

| Mappe | Ansvar og importretning etter AD-1 |
|---|---|
| `src/frontend/` | React og senere aktiv økt/UX. Bruker domain, contracts og egen presentasjon/PDF-visning. |
| `src/domain/` | Rene regler og beregninger. Bruker contracts. Ingen UI, server eller I/O. |
| `src/contracts/` | Felles runtime-skjema og avledede typer. Ingen UI, server eller I/O. |
| `src/backend/` | Senere HTTP, dokumenter og analyseadaptere. Bruker contracts; finans/anbefaling forblir i domain. |
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
- [Arkitektur og AD-1–AD-10](.docs/planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md)
- [SPEC og adoptert planverk](.docs/specs/spec-IBE160/SPEC.md)
- [Sprintplan](.docs/implementation-artifacts/sprint-plan.md) og [sprintstatus](.docs/implementation-artifacts/sprint-status.yaml)
- [Faktisk verifikasjon av Story 1.1](.docs/implementation-artifacts/story-1-1-verifikasjon.md)
- [Lagrede brukerprompter](.docs/process/prompts/README.md)

## Medlemmer

- Mads Semb Christophersen
