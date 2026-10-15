# Teknologivurdering — arkitekturens Reviewer Gate

Dato: 2026-10-14. Linse: web-/realitetskontroll av valgte teknologier, konkrete versjoner, starterens faktiske defaults og dokumentert teknisk fit.

**Verdikt: Godkjent med én lav merknad.** Ingen kritiske, høye eller middels funn. Startstakken har et tilstrekkelig primærkildegrunnlag for et arkitekturdokument. Den er tydelig merket som startgrunnlag som ennå ikke er installert eller verifisert i prosjektet. Ett dokumentasjonsforbehold om PDF.js bør presiseres før overlevering.

## Gjennomført kontroll

Lest `AGENTS.md`, `ARCHITECTURE-SPINE.md`, `.working/teknologigrunnlag.md` og `.memlog.md`, samt BMADs Reviewer Gate og den konfigurerte teknologilinsen. Valgene Q-1–Q-7 er behandlet som vedtatte grenser. Vurderingen endrer ingen produktkrav, finansregler, godkjent UX eller gjennomføringsfase.

Jeg åpnet primærkildene på nettet uavhengig av forfatterens notater. For starteren ble både nåværende `package.json` og `tsconfig.app.json` kontrollert. For plugin-react og Vitest ble også pakkedefinisjonene fra de konkrete release-taggene kontrollert. Ingen pakker, browserbinærer eller produktkode ble installert, og ingen produkt- eller kompatibilitetstest ble kjørt. Npm-registry ble ikke brukt som bevis.

## Versjoner og starter

| Teknologi | Kontrollresultat |
| --- | --- |
| Node.js 24.21.0 LTS | Utgivelsen finnes og er merket LTS på [Nodes egen utgivelsesside](https://nodejs.org/en/blog/release/v24.21.0). |
| React / react-dom 19.3.0 | [Offisiell release](https://github.com/react/react/releases/tag/v19.3.0) finnes. Begge pakkene står på 19.3.0 som startnivå i [Vites nåværende react-ts-starter](https://raw.githubusercontent.com/vitejs/vite/main/packages/create-vite/template-react-ts/package.json). |
| Vite 8.3.4 | [Offisiell release](https://github.com/vitejs/vite/releases/tag/v8.3.4) finnes, og starteren bruker dette startnivået. Node 24 tilfredsstiller [Vites dokumenterte Node-krav](https://vite.dev/guide/). |
| TypeScript 6.0.2 | [Stabil release](https://github.com/microsoft/TypeScript/releases/tag/v6.0.2) finnes og er starterens faktiske default. [7.0.2 finnes som nyere stabil release](https://github.com/microsoft/TypeScript/releases/tag/v7.0.2). Dokumentet forklarer det bevisste valget av 6.0.2 og kaller det ikke «latest»; dette er ikke et funn. |
| @vitejs/plugin-react 6.1.2 | [Release](https://github.com/vitejs/vite-plugin-react/releases/tag/plugin-react@6.1.2) og starterdefault finnes. [Taggens pakkedefinisjon](https://raw.githubusercontent.com/vitejs/vite-plugin-react/plugin-react@6.1.2/packages/plugin-react/package.json) krever Vite `^8.0.0` og Node `^20.19.0 \|\| >=22.12.0`; Vite 8.3.4 og Node 24.21.0 er innenfor. |
| Oxlint 1.87.0 | [Release](https://github.com/oxc-project/oxc/releases/tag/oxlint_v1.87.0) finnes. Starteren har dette startnivået og bruker `oxlint` i lint-scriptet. Valget av starterens enkle lintsteg er derfor faktisk kildebasert. |
| Express 5.3.0 | [Release](https://github.com/expressjs/express/releases/tag/v5.3.0) finnes. [Statisk filservering](https://expressjs.com/en/starter/static-files/) og [asynkron feilhåndtering](https://expressjs.com/en/guide/error-handling/) støtter den valgte lokale HTTP-formen. |
| PDF.js / pdfjs-dist 6.4.299 | [Getting Started](https://mozilla.github.io/pdf.js/getting_started/) viser versjonen som stabil, og [release](https://github.com/mozilla/pdf.js/releases/tag/v6.4.299) finnes. Node-/browser-forbeholdet er omtalt i T-1 nedenfor. |
| big.js 7.0.1 | [Vedlikeholderens pakkedefinisjon](https://raw.githubusercontent.com/MikeMcl/big.js/main/package.json) viser 7.0.1, og [release](https://github.com/MikeMcl/big.js/releases/tag/v7.0.1) finnes. Pakkens ESM- og CommonJS-eksporter passer den valgte TypeScript/Node/browser-stakken. |
| Zod 4.6.7 | [Release](https://github.com/colinhacks/zod/releases/tag/v4.6.7) finnes. [Zod-dokumentasjonen](https://zod.dev/) bekrefter Node, moderne browsere og TypeScript 5.5+ med strict. |
| Vitest 5.0.4 | [Release](https://github.com/vitest-dev/vitest/releases/tag/v5.0.4) finnes. [Taggens pakkedefinisjon](https://raw.githubusercontent.com/vitest-dev/vitest/v5.0.4/packages/vitest/package.json) godtar Node `^24.0.0` og Vite `^8.0.0`. Dette støtter startstakkens dokumenterte fit. |
| Playwright 1.64.0 | [Release](https://github.com/microsoft/playwright/releases/tag/v1.64.0) finnes. [Offisielle forutsetninger](https://playwright.dev/docs/intro) inkluderer Node 24. Browserbinærer og eventuelle systemavhengigheter må være installert før offline-kjøring, slik dokumentet allerede sier. |

Starterens versjonsuttrykk er ranges, mens spine-tabellen navngir konkrete startversjoner. Det er akseptabelt her: dokumentet beskriver pins for første implementering, ikke et eksisterende installert avhengighetstre. Nåværende `main`-kilder bekrefter defaults på kontrolldatoen; senere scaffolding må fremdeles følge den avtalte kontrollen av faktisk pakkefil og låsfil.

## Fit og korrekt avgrensning av bevis

**PDF-grensen, AD-3/AD-9:** PDF.js har et offisielt [Node-eksempel](https://github.com/mozilla/pdf.js/blob/master/examples/node/getinfo.mjs) som bruker `numPages`, `getPage` og `getTextContent`. Sidemerket lokalt tekstuttrekk er derfor en dokumentert mekanisme. Browser-visning og lokal levering av PDF-/workerressurser passer den lokale HTTP-serveren. [PDF.js FAQ](https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions) krever at API og worker har nøyaktig samme versjon; AD-9 bevarer dette. Bibliotekets eksistens og eksempler bekrefter ikke riktig kolonnelesing, komplett TG-uttrekk eller rapportenes faktiske lesbarhet. Spine og Deferred holder denne forskjellen tydelig.

**Eksakt tallbane, AD-7:** [big.js-dokumentasjonen](https://github.com/MikeMcl/big.js) sier at aritmetiske metoder gir eksakte resultater med unntak for divisjon, kvadratrot og potens med negativ eksponent. Beløpsbanen bruker addisjon, subtraksjon, multiplikasjon og sammenligning fra desimalstrenger. Terskelen `100 * NOI >= P * Ymin` med gyldig positiv P trenger ingen divisjon, og er egnet for biblioteket. [API-et](https://mikemcl.github.io/big.js/) gjør DP/RM relevante for divisjon og visningsavrunding. Arkitekturens divisjon i presentasjon og forbud mot retur av avrundet visningsverdi til screening er derfor presist. Ingen egen heltalls-/brøkmotor eller skjult Number-konvertering innføres.

**Delte runtime-skjemaer, AD-1/AD-4:** Zod kan brukes på begge sider av API-et og gi avledede TypeScript-typer fra én skjemakilde. Det passer en importbar, miljøuavhengig contracts-modul. Strict-forutsetningen er dekket av TypeScript 6: [den offisielle 6.0-kunngjøringen](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/) bekrefter at strict nå er true som default. At [starterens tsconfig](https://raw.githubusercontent.com/vitejs/vite/main/packages/create-vite/template-react-ts/tsconfig.app.json) ikke har et eksplisitt strict-felt er derfor ikke en inkompatibilitet. Runtime-validering er riktig avgrenset til struktur/identitet og påstås ikke å bekrefte semantisk fullstendighet.

**Testverktøy og lokal levering, AD-9/AD-10:** Vitest passer rene TypeScript-moduler og Node-/adapterintegrasjoner. Playwright passer E2E av den bygde lokale appen med kontrollert adapter. [Vite bygger statiske ressurser](https://vite.dev/guide/build), og Express kan tilby disse og API fra samme lokale server. Det er ingen påstand om at build-/demo-/test-scripts allerede finnes. Produktverifikasjon og S2/S5/S6 er korrekt lagt til implementering/evaluering og er ikke gjort til arkitekturens akseptkriterium.

**Øvrige beslutninger:** React reducer, aktive frontend-revisjoner, en prosesslokal duplikatsperre, én felles kontrakt og rene finans-/regelmoduler er kombinasjoner av dokumenterte mekanismer og eksplisitte brukerbeslutninger. Memlog registrerer alternativer og bindende brukeravgjørelser. Det finnes ikke et ubegrunnet modell-/SDK-/prisvalg; disse er utsatt med avklaringspunkt før live-integrasjon. Ingen webkilde er brukt til å utvide godkjent produktscope.

## Funn

### T-1 — Lav: Node-støtten for PDF.js må kvalifiseres med buildvariant

- **Lokasjon:** `.working/teknologigrunnlag.md:14`, støtter Stack og AD-3/AD-9.
- **Observasjon:** Notatet sier at Node 22+ støttes i hovedsak. I [den siterte FAQ-en](https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions) står Node-støtten under `legacy`-builden, med begrenset automatisert testing. [Node-eksemplet](https://github.com/mozilla/pdf.js/blob/master/examples/node/getinfo.mjs) importerer også `pdfjs-dist/legacy/build/pdf.mjs`. Denne kvalifikasjonen følger ikke med i notatets oppsummering.
- **Konsekvens:** En implementør kan oppfatte den generelle støttesetningen som dokumentert støtte for samme moderne build i Node og browser. Samme distribusjonsversjon innebærer ikke samme buildvalg eller workerinitialisering i begge miljøer. Dette er en liten dokumentasjonspresisering, ikke et påvist stakkbrudd.
- **Tiltak:** Presiser i teknologigrunnlaget at dokumentert Node-fit bygger på `legacy`-builden og offisielt Node-eksempel. Behold browser-workerens krav om matchende versjon og dagens Deferred for konkret initiering/ressurser og fixturekontroll. Det kreves ingen installasjon eller produkttest for å lukke dette funnet.

## Gjenstående implementeringskontroll

Eksakt avhengighetsoppløsning, deklarasjonspakker, typekontroll, PDF-import/worker/tilleggsressurser, browser-/OS-støtte i faktisk testmiljø og ren offline-demokjøring må dokumenteres når kode og låsfil finnes. Disse punktene er allerede avgrenset som senere arbeid; de er ikke nye arkitekturblokkeringer. Teknologivurderingen gir ingen påstand om grønn installasjon, live KI-kvalitet eller beståtte produktmål.

Kun denne review-filen er skrevet. Spine, kildenotater, memlog og oppstrøms planleggingskilder er ikke endret.
