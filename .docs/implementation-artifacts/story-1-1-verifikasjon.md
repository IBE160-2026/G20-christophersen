# Verifikasjon — Story 1.1

Utført 2026-10-16 mot [Story 1.1, AC1–AC4](../planning-artifacts/epics.md#story-11-etablere-reproduserbar-startstruktur-og-importgrenser).
Utgangspunkt: `cfc58a68a73a538064bc6c2045f29b0a51e72458`.
[Storyfilen](spec-1-1-etablere-reproduserbar-startstruktur-og-importgrenser.md)
og [kommandoutskriften](story-1-1-kontroller.txt) dokumenterer utførelsen.

## Miljø og kilde

- macOS 26.6.2, arm64. Vertens Node 26.8.1 ble beholdt uendret.
- Node **24.21.0** med medfølgende npm **11.19.0** ble brukt via
  `PATH=/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:$PATH`.
  Offisiell distribusjon: [node-v24.21.0-darwin-arm64.tar.gz](https://nodejs.org/dist/v24.21.0/node-v24.21.0-darwin-arm64.tar.gz).
  SHA-256 kontrollert mot [SHASUMS256.txt](https://nodejs.org/dist/v24.21.0/SHASUMS256.txt):
  `bed7eea5325e1108f32ce5228ddd6a5f0f08a499ee42aa7442aea583702f6057`.
  Dette er registrert fra implementeringsøkten; den opprinnelige
  sjekksumutskriften ble ikke bevart. Den etterfølgende reviewen verifiserer
  faktisk Node-/npm-versjon og installasjon, uten ny kontroll av arkivfilen.
- Offisiell [Vite react-ts-starter](https://github.com/vitejs/vite/tree/df7503cc499e0b49e45701e3be7546918ee9d322/packages/create-vite/template-react-ts),
  revisjon `df7503cc499e0b49e45701e3be7546918ee9d322`.
  React-inngangen er flyttet til frontend-grensen, demonstrasjonsinnhold og
  standardstil fjernet, HTML-språk satt til `nb`, strict gjort eksplisitt og
  bare type-/lintkommandoer eksponert i denne storyen.

## Utførte kontroller

| Kontroll | Faktisk resultat | AC / kravspor |
|---|---|---|
| Opprett låsfil med `npm install --package-lock-only --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=30000 --cache /tmp/ibe160-story-1-1-npm-cache` | Exit 0. Alle ni direkte avhengigheter/støttetyper har nøyaktig samme versjon i package.json og låsfilen. Ingen pin endret. | AC1; AD-9; CAP-8 |
| `npm ci --no-audit --no-fund --fetch-retries=0 --fetch-timeout=30000 --cache /tmp/ibe160-story-1-1-npm-cache` i repoet uten tidligere installasjon | Første forsøk feilet under Vite-nedlasting med `ERR_SSL_CIPHER_OPERATION_FAILED`. Samme kommando bestod ved nytt forsøk, 28 pakker. Ingen TLS-innstilling eller versjon ble endret. | AC1 |
| Ren installasjon i `/tmp/ibe160-story-1-1-clean-zm6g6rpd` | Ny mappe med bare package-/konfigurasjonsfiler, index.html og src; ingen node_modules, .env, brukerdata eller globale moduler kopiert. `npm ci --offline --no-audit --no-fund --cache /tmp/ibe160-story-1-1-npm-cache` installerte 28 pakker, exit 0. Låsfilen var byteidentisk etterpå. Cache inneholder de faktisk nedlastede pakkene; offline endrer ikke avhengighetstreet. | AC1; lokal forutsetning for NFR-3/S6 |
| `npm run typecheck` | Exit 0 både i repo og ren mappe. Faktiske React-filer og vite.config.ts kontrolleres. | AC2 |
| `npm run lint` | Exit 0, ingen advarsler, både i repo og ren mappe. | AC2 |
| `npm ls --depth=0` i ren mappe | Exit 0; React/react-dom 19.3.0, TypeScript 6.0.2, Vite 8.3.4, plugin-react 6.1.2 og Oxlint 1.87.0 med starterens støttetyper. | AC1/AC2 |
| Importgjennomgang: `rg -n '^import' src vite.config.ts` | Tre frontend-importer: react, react-dom/client og egen App. To byggekonfigurasjonsimporter: vite og plugin-react. Domain/contracts/backend inneholder bare ansvarsbeskrivelser. Ingen I/O i ren kjerne, kopierte typer eller framtidig funksjonslogikk. | AC3; AD-1/AD-10 |
| `git check-ignore --no-index --stdin` | Alle sju prøver ignoreres: node_modules/react/package.json, dist/index.html, build/server.js, .env, .env.local, private/original.pdf og kontroll.tsbuildinfo. | AC4; NFR-4 |
| `git diff --check` | Exit 0. Konfigurasjon, låsfil, kilde og dokumentasjon kan versjoneres; avhengigheter og private ressurser holdes utenfor. | AC4 |

Npm varslet om det valgfrie macOS-installasjonsscriptet til `fsevents@2.3.3`.
Dette er bevart i råutskriften og omtalt i README; installasjon og kontroller
bestod uten endring av installasjonspolicy. Ingen automatisk godkjenning av
avhengighetsscript ble lagt til.

Kontrollene ble også kjørt med bevisst feil datatype og betinget React-hook i
en midlertidig fil i den rene kopien. Typekontrollen feilet som forventet med
TS2322/exit 2, og lint feilet med betinget hook/exit 1. Filen ble slettet, og
begge kontrollene bestod deretter med exit 0. Faktiske utfall står i kommandoutskriften. Ingen
dummy-enhetstester eller tom testsuksess opprettes.

Den konkrete Git-kontrollen bekreftet også at package.json, package-lock.json,
.nvmrc/.npmrc, Oxlint-/TypeScript-/Vite-konfigurasjon, index.html og begge
React-filer ikke er ignorert. `rg --files --hidden -g package.json` med
node_modules/render/.git ekskludert fant én app-package.json.

En negativ miljøkontroll med vertens Node 26.8.1 og `npm ci --dry-run --offline`
ble avvist med `EBADENGINE`, forventet Node 24.21.0/npm 11.19.0. Kjørt uten
endring av installasjonen eller låsfilen; full kommando/utdata står i råutskriften.

Importgjennomgangen omfattet også hele kildeinnholdet, reeksporter, dynamisk
import, require og direkte miljø-/I/O-bruk. De eneste kildefilene er de to
React-filene; DOM-tilgangen i main.tsx ligger i frontend, som tillatt.
Contracts/domain/backend har ingen kjørbar kode. Vite/plugin-importene tilhører
byggekonfigurasjon. Det finnes ingen annen modulavhengighet i denne leveransen.

## Gjenta kontrollen i en ny mappe

Velg først Node 24.21.0 med medfølgende npm 11.19.0 etter README. I denne økten
ble den isolerte distribusjonen valgt med PATH-oppsettet ovenfor. Kjør så fra
reporoten; dette gjenskaper filutvalget som ble brukt i den dokumenterte kopien:

```sh
(
  set -eu
  kontrollmappe=$(mktemp -d /tmp/ibe160-story-1-1-clean-XXXXXX)
  cp package.json package-lock.json .npmrc .nvmrc .oxlintrc.json \
    tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts \
    index.html "$kontrollmappe/"
  cp -R src "$kontrollmappe/src"
  cd "$kontrollmappe"
  node --version
  npm --version
  npm ci
  npm run typecheck
  npm run lint
  npm ls --depth=0
)
```

Den faktiske førstegangskopieringen brukte Python tempfile/shutil til det samme
filutvalget. Ren installasjon ble kjørt med npm-cacheflagget i tabellen slik at
de allerede nedlastede, låsfilkontrollerte pakkene kunne gjenbrukes uten nett.
«Ren» gjelder prosjektmappen, ikke et nytt operativsystem eller en erstattet
bruker-/global npm-konfigurasjon. Reviewutskriften nedenfor angir relevante
effektive innstillinger og om slike konfigurasjonsfiler finnes, uten hemmeligheter.

## Endrede og opprettede filer

| Område | Filer |
|---|---|
| Installasjon | `package.json`, `package-lock.json`, `.nvmrc`, `.npmrc` |
| Type/lint/bygggrunnlag | `.oxlintrc.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts` |
| Minimal React-inngang | `index.html`, `src/frontend/main.tsx`, `src/frontend/App.tsx` |
| Modulgrenser | `src/contracts/README.md`, `src/domain/README.md`, `src/backend/README.md` |
| Kjørbarhetsoppskrift/Git | `README.md`, `.gitignore` |
| BMAD og kontrollbevis | `.docs/implementation-artifacts/epic-1-context.md`, `spec-1-1-etablere-reproduserbar-startstruktur-og-importgrenser.md`, `sprint-status.yaml`, `story-1-1-verifikasjon.md`, `story-1-1-kontroller.txt` (alle i samme mappe) |
| Prosess | `.docs/process/arbeidsokter/2026-10-16-story-1-1.md` og den automatisk opprettede `.docs/process/prompts/session-01a1458d-79d7-72b2-8679-8bee3ae108b8.jsonl` |

## Omfang og begrensning

**AC1–AC4 er oppfylt ved startstrukturens egen grense.** Uavhengig Blind
Hunter-gjennomgang ga ni mindre funn om bevis/oppskrift; alle er rettet og
triagert i storyfilen. Det gjenstår ingen åpne spørsmål eller utsatte funn.
Faktisk sporet/klargjort innhold er kontrollert: ingen ignorerte filer spores,
og `git diff --cached --check` bestod med alle nye filer i indeksen.

Ved implementeringens avslutning satte BMADs oneshot-rute storyfilen til `done`
og sprintnøkkelen til `review`.
Epic 1 er `in-progress`; alle andre stories, inklusive 1.2, er `backlog`.

Dette er ikke S6-bevis fra
en annen person og ikke produkt-/UX-/live-verifikasjon. Appserver, oppstart,
build-/dev-/demokontrakt og godkjent appskall tilhører Story 1.2. Ingen senere
story er startet. Ingen uavklart produkt-/arkitekturbeslutning er identifisert.

## Etterfølgende code review 2026-10-16

Review av commit `2a9abfa4b6941797f6cfd2087e42dd28da3e90cd` og tilhørende
dokumentasjonsrettinger er dokumentert i [storyfilens Review Findings](spec-1-1-etablere-reproduserbar-startstruktur-og-importgrenser.md#review-findings).
[Nye faktiske kontroller](story-1-1-review-kontroller.txt) viser nettinstallasjon
fra tom npm-cache, type/lint, oppretting og sletting av negative prober samt
kontroll av miljø, låsfil, import-/Git-grenser og den rettede oppskriften.
Gjeldende status etter review finnes i [sprintstatus](sprint-status.yaml).
