# G20 — Mads Semb

Gruppeprosjekt i **IBE160 Programmering med KI** ved Høgskolen i Molde, høsten 2026 (15 studiepoeng).

Repoet inneholder gruppens applikasjon og dokumentasjon av utvikling, testing og kvalitetssikring med KI.

## Property Acquisition Agent — Epic 1 reviewet og ferdig

Planlagt produkt er en lokal førstevurdering av ett boligutleieobjekt med
kontrollert tallgrunnlag, tilstandsrapport og kodebasert screening.
Appen har lokal server, godkjent appskall og registrering av P/L/D/J/Ymin.
L/D/J har eksplisitt periode og år. Feltene starter blanke og ubekreftede;
egne råverdier beholdes i den aktive økten, også 0 og sletting. Oppdatering
eller lukking av siden avslutter økten. Tallgrunnlag viser lokal validering og eksakt årsnormalisering med big.js.
Eksplisitt bekreftelse av gyldige tall, perioder/år, kilder og kostnadsinnhold
åpner Tilstandsrapport uten analyse. Nullverdier må også kontrolleres
eksplisitt. Faktiske endringer opphever berørt bekreftelse; uendret retur
bevarer kontrollstatus. Senere trinn viser status og hvorfor de er utilgjengelige.
Kilder, kostnadsinnhold og uløste kildekonflikter kan kontrolleres i appen.
Story 1.6 gir en separat ren vurdering av kjente kritiske mangler med faste
begrunnelser og handlinger; uavhengig review er bestått. Tom mangelliste er ingen
økonomisk godkjenning. Story 1.7 kobler dette til Tallgrunnlag og er
uavhengig reviewet med alle seks AC bestått. Rapportanalyse er tilgjengelig som lokal demo fra Story 2.6. Story 2.7
er done etter uavhengig review av originalkilden; kontrollhandlinger og full screening følger senere stories. Ingen API-nøkkel, miljøvariabler eller betalt
konto kreves for registreringen.

Story 2.1 er implementert og uavhengig reviewet med alle fire AC bestått: felles dokument-/
analyseschemas og rene validatorer skiller fullføring, feil og usikre
kilder med kodekontrollert metadata. Kontrakttestene krever ingen PDF-parser
eller betalt API. Rapportflyten bruker denne kontrakten fra Story 2.6.

Story 2.2 er ferdig etter [uavhengig review](.docs/implementation-artifacts/story-2-2-review.md): backend kontrollerer
faktiske PDF-bytes, faktisk sidemengde mot grensen 30 og SHA-256 med låst PDF.js legacy-build.
Originalbytes bevares, og dokumentfeil bruker kontrakten fra 2.1.
Sidetrær traverseres uavhengig av deklarert `/Count`; også skjulte ødelagte
sidereferanser og sideegenskaper avvises. Formatgodkjenning
er et eget delutfall uten påstand om tekstlesbarhet eller fullført analyse.
[Fiktive F1–F4-PDF-er og uavhengig fasit](tests/fixtures/property-cases/README.md)
er kontrollert visuelt, inklusive TG3 på PDF-side 4 / trykt side 2.
Modulen brukes nå av appens rapportflyt gjennom HTTP-pipelinen.
[R2 er lukket med godkjent sidestatusregel](.docs/planning-artifacts/r2-pdf-lesbarhet-semester-v1.md):
bevist blank side tillates, mens ulest innhold blokkerer fullført analyse.
Story 2.3 er done etter [code review](.docs/implementation-artifacts/story-2-3-review.md): `extractPdf` leverer hele kontraktversjon 2 /
uttrekksversjon 1-grunnlaget med én tekst-/statuspost per fysisk side. Den
[godkjente blankregelen](.docs/planning-artifacts/r2-pdf-lesbarhet-semester-v1.md)
krever full strukturell inspeksjon; unreadable/unknown/incomplete og bare
blanke sider gir dokumentfeil før adapterbruk. Readable gjelder tekstlaget,
ikke semantisk lesing av bilder. Se [modulbruk](src/backend/README.md) og
[AC-/testbevis](.docs/implementation-artifacts/story-2-3-verifikasjon.md).

Story 2.4 er implementert til review: en smal analyseadapter tar hele
`DocumentBasis`, og standard demo leser lokale, fiktive F1–F4-svar bundet til
originalenes SHA-256 og kontrakt-/uttrekksversjon. Manglende eller feilbundet
svar gir eksplisitt feil uten live-fallback. Dokumentsperren fra 2.3 gjelder
før oppslag. Demo-modulen trenger verken API-nøkkel eller ekstern tjeneste.
Se [modulbruk og opphav](src/backend/README.md) og
[testbevis](.docs/implementation-artifacts/story-2-4-verifikasjon.md).
Story 2.5 kobler nå format, alle fysiske sider og demo til ett
`POST /api/analysis` med binær multipart-fil, aktiv sessionlås, varig
prosesslokal duplikatsperre og én hard lokal 60 s-frist. PDF-grensen er
50 MiB inklusive likhet; JSON/metadata har egen 1 MiB-grense. Ingen innhold
skrives til disk. Se [HTTP-form, feil og ressurslivsløp](src/backend/README.md#http-analyse--story-25).
Story 2.6 er done etter [uavhengig review](.docs/implementation-artifacts/story-2-6-review.md): bekreft tallgrunnlaget, velg én PDF i
Tilstandsrapport og velg **Start analyse**. Bruk for eksempel
`tests/fixtures/property-cases/F4-tilstandsrapport.pdf`; bare de uendrede
F1–F4-originalene har tilhørende lagret demouttrekk. Ingen analyse starter ved
filvalg. Åpne **Kontroller funn** etter mottatt uttrekk for å se alle funn,
usikkerheter og lokale mangler. Listen er fortsatt ubekreftet. Velg et funn for å vise original-PDF;
kontrollhandlingene følger senere stories. Uendret uttrekk beholdes ved
retur/finansendring. Rapportbytte eller forlatt pågående analyse ugyldiggjør
gamle svar og forsøker abort. Dette dokumenterer ingen faktisk live-analyse.
Se [verifikasjon](.docs/implementation-artifacts/story-2-6-verifikasjon.md).

Story 2.7 er done etter [uavhengig full review](.docs/implementation-artifacts/story-2-7-review.md): velg funnets overskrift for å se riktig
fysisk PDF-side med dokumentnavn. Fra 1200 CSS px ligger funn og original
side om side. Under grensen brukes **Åpne PDF for valgt funn**; panelet har
**Tilbake til funnkontroll**, tastaturfokus og Esc. Valgt funn, side og zoom
bevares ved retur. **Forrige/Neste PDF-side** og **PDF-zoom** leser originalen
lokalt uten ny analyse. Ukjent/ugyldig kilde og visningsfeil forklares ved
PDF-visningen. Worker, tegnkart, fonter og nødvendige visningsressurser
leveres fra samme lokale installasjon. Se [AC-/testbevis](.docs/implementation-artifacts/story-2-7-verifikasjon.md).
Listen er fortsatt ubekreftet, og 2.8 er ikke startet.

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
Express-prosess på loopback. `POST /api/analysis` tilbyr lokal demoanalyse;
andre API-ruter svarer 404. Reporot og private dokumenter serveres ikke.
Stopp med **Ctrl+C**. Port 3000 må være ledig; serveren velger ikke en annen
port i stillhet. Manglende build gir beskjed om å kjøre `npm run build`.

Installasjon krever nett til npm-registeret. Etter installasjon kan både
build og demo kjøres med eksternt nett sperret. Modusmerket
«Demo · lagret KI-uttrekk» følger godkjent UX gjennom rapportflyten.
Lagret uttrekk bruker den samme lokale dokumentpipelinen; ingen nøkkel kreves.

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
port 3000, som må være ledig. Vitest-modul-/PDF-integrasjonstester, 57 tester av bygget app
og 2 dev-tester kjøres gjennom kommandoene over.
Testene kontrollerer startstatus/sperrer, lokal ressurslasting med eksterne
forespørsler blokkert, HTTP-grensen, faktiske designtokens/kontrast og
tastatur/fokus/ombryting ved desktop og viewport tilsvarende sterk zoom,
inkludert 320×200 og korte 320×160/360×160-flater. Dev-kontrollene krever
synlig skall, tilkoblet HMR på samme origin og avvisning av faktiske private filer.
Registreringstestene bruker kontrollerte F1-/F3-verdier og kontrollerer
råstrenger, blank/0/sletting, ubekreftet status, periode/år, retur uten
datatap og tom registrering etter sideoppdatering. De kontrollerer ingen
finansberegning eller full screening.
Domenetestene kontrollerer alle fem felt, blank/0/negative/ikke-numeriske
verdier, bekreftelsesgrunnlag, perioder/år, årsnormaliseringsdelen av
BT-7/BT-15/BT-16, presise desimaler og gjentakelse uten mutasjon. De dekker også
kilder, D/J-kostnadsdeling og alle kjente samtidige mangler med identisk
kodebegrunnelse/neste handling, inkludert kjent rapportmangel ved F2-verdier.
95 kontrakttester for Story 2.1 dekker versjoner, obligatoriske felt,
fullført tomliste kontra feil, ufullstendige delresultater, RT-7s umulige/
usikre kilder og forsøk på å erstatte kodekontrollert metadata.
PDF-integrasjonene bruker faktiske 30-/31-sidersfiler, feilformat/skadet
container, hash-/navnevarianter og tekstløs PDF. De kontrollerer også
ressursopprydding, bytebevaring og F1–F4 mot en fasit fastlagt før adapterbruk.
Kjør formatkontrollen med `npm test -- tests/integration/pdf-format.test.ts`.
Story 2.3 bruker egne faktiske blank-/layout-/raster-/form-/feilfixtures med
håndskrevet fasit og tester sidestatus, fullføringssperre, delvis tekst og
opprydding: `npm test -- tests/integration/pdf-extraction.test.ts tests/unit/pdf-extraction.test.ts`.
[Fixturebeskrivelsen](tests/fixtures/pdf-readability/README.md) forklarer
hvordan originaler og forventede utfall kan etterprøves uavhengig.
Story 2.5s HTTP-tester kjøres med
`npm test -- tests/integration/http-analysis.test.ts tests/unit/http-receive-pdf.test.ts`.
De krever lokal loopback og omfatter ekte 50 MiB-/1 MiB-grenser samt en
reell 60-sekunders timeoutprøve med parser-/adapterheng og sen retur.
Chromium-binæren må være installert før offline kjøring. Feilspor/skjermbilder
legges under Git-ignorerte `test-results/`.

Manuell kontroll: Tab viser fokus på hoppelenke og trinn; Enter på hoppelenken
flytter fokus til Tallgrunnlag. Utilgjengelige trinn forklarer sperren og åpnes
ikke med klikk/Enter/mellomrom. Prøv 200 % og 400 % nettleserzoom og rull
arbeidsinnhold med tastatur; navn/nummer/status beholdes, og navigasjonen
dekker ikke innholdet. Tab videre gjennom verdier, perioder og år; fokus og
feltetiketter skal forbli synlige. Prøv for eksempel P=16000000, L=1900000,
D=400000, J=800000 og Ymin=7, velg År og skriv 2026 for L/D/J. Retur til
Tallgrunnlag bevarer registreringen. Oppgi også opphav og kildebeskrivelse
for hvert felt, og velg forventet/faktisk leie. Bruk Bekreft tallgrunnlaget:
slettet L gir konkret feil/fokus, mens J=0 krever egen nullkontroll. Rett
grunnen, bekreft og gå frem/tilbake; bekreftelser skal være bevart. Endre L
og bekreft på nytt etter kontroll. Faktisk gjennomføring og avgrensning står i
[verifikasjonen for Story 1.2](.docs/implementation-artifacts/story-1-2-verifikasjon.md).
[Verifikasjonen for Story 1.3](.docs/implementation-artifacts/story-1-3-verifikasjon.md)
dekker registrering og aktiv økt.
[Verifikasjonen for Story 1.4](.docs/implementation-artifacts/story-1-4-verifikasjon.md)
dekker den rene validerings-/normaliseringsmodulen.
[Verifikasjonen for Story 1.5](.docs/implementation-artifacts/story-1-5-verifikasjon.md)
og [reviewet](.docs/implementation-artifacts/story-1-5-review.md) dekker kilde-/kostnadskontroll.
[Egenverifikasjonen for Story 1.6](.docs/implementation-artifacts/story-1-6-verifikasjon.md)
dekker den rene mangelvurderingen. [Review av Story 1.6](.docs/implementation-artifacts/story-1-6-review.md)
kontrollerer alle fem AC og dokumenterer retting og egne sluttkontroller.
[Verifikasjonen for Story 1.7](.docs/implementation-artifacts/story-1-7-verifikasjon.md)
dekker bekreftelse, feil, endring/retur, null, semantikk og faktisk zoomkontroll.
[Review av Story 1.7](.docs/implementation-artifacts/story-1-7-review.md)
kontrollerer alle seks AC, reviewrettinger og egne sluttkontroller.
[Verifikasjonen for Story 2.1](.docs/implementation-artifacts/story-2-1-verifikasjon.md)
dekker kontraktleveransens fire AC; [uavhengig review er bestått](.docs/implementation-artifacts/story-2-1-review.md).
[Verifikasjonen for Story 2.2](.docs/implementation-artifacts/story-2-2-verifikasjon.md)
viser egenverifikasjon av fire AC, reelle PDF-tester og visuell kryssjekk.
[Reviewet av 2.2](.docs/implementation-artifacts/story-2-2-review.md) er bestått
etter retting av manipulert sidetelling og ny full regresjon.
Den [avgrensede koblingen til PDF.js](.docs/implementation-artifacts/story-2-2-page-tree-design.md)
er bundet til eksakt installert parserbunt. Format-/fixturetestene beviser
ikke tekstlesbarhet alene. [Story 2.3-verifikasjonen](.docs/implementation-artifacts/story-2-3-verifikasjon.md)
dekker lokal deterministisk ekstraksjon og R2; dette beviser ingen S2 eller live-S5.
Full demo, senere funksjonstester og annen-person-bevis for S6 følger sine stories.

Grunnlaget er tilpasset den [offisielle Vite react-ts-starteren](https://github.com/vitejs/vite/tree/df7503cc499e0b49e45701e3be7546918ee9d322/packages/create-vite/template-react-ts).
Demonstrasjonsinnhold er fjernet, React-inngangen er flyttet til `src/frontend/`,
og nødvendige avhengigheter er eksakt låst etter arkitekturen.

## Struktur og importgrenser

| Mappe | Ansvar og importretning etter AD-1 |
|---|---|
| `src/frontend/` | React-appskall, finansregistrering, én reducer for aktiv økt og lokale DESIGN-tokens. Bruker contracts og domain; senere egen presentasjon/PDF-visning. |
| `src/domain/` | Rene regler og beregninger. Bruker contracts. Ingen UI, server eller I/O. |
| `src/contracts/` | Felles runtime-skjema og avledede typer. Ingen UI, server eller I/O. |
| `src/backend/` | Lokal HTTP-server og bytesbasert PDF-format-/side-/hashvalidering og sidemerket tekstuttrekk samt lokal demo-adapter. Bruker contracts; finans/anbefaling forblir i domain. |
| `tests/e2e/` | Playwright-kontroll mot bygget demo og lokalt dev-skall. |
| `tests/unit/` | Rene Vitest-kontroller av registrering, navigasjon, tall-/årsvalidering, kilde-/kostnadsgrunnlag, kjente kritiske mangler og dokument-/analysekontrakten. |
| `tests/integration/` | PDF.js-format-/side-/hash-/lesbarhetskontroll og faktisk HTTP med ekte fixturebytes, grenser, duplikater og prosessavslutning. |
| `tests/fixtures/property-cases/` | Fiktive rapporter, uavhengig JSON-fasit, bytehashinventar og reproducerbar generator. |
| `tests/fixtures/pdf-readability/` | Fiktive blank-/layout-/innholds-/feiloriginaler, håndskrevet sidestatus-/tekstfasit og reproducerbar generator. |
| `.docs/` | Autoritative planer, implementeringsbevis og prosesspor. |

Importgrensene gjennomgås ved endringer, inklusive reeksporter, dynamiske
importer og direkte I/O-bruk. Type- og lintkontroll erstatter ikke denne
gjennomgangen mot AD-1. Contracts eier rå/registrert finansschema og
valideringsresultat med avledede typer; `domain/validation.ts` eier numerisk
gyldighet, bekreftelsesbehov og eksakt årsnormalisering. Ingen framtidig
rapportretting, finansberegning eller økonomisk screeningregel er lagt inn.
Dokument-/analyseschemas og ren kilde-/metadatavalidering eies nå også av
contracts; backend bruker PDF.js ved format- og tekstgrensen. Demo-adapter og HTTP-kobling er levert; frontendkobling er levert i Story 2.6 og originalvisning i Story 2.7.
`domain/financial-basis.ts` vurderer kilde-/kostnadsgrunnlaget, og
`domain/screening.ts` samler kjente mangler til fast prioritet-1-utfall.
Private originaldokumenter og lokalt rapportmateriale lagres under `private/`,
som er Git-ignorert. `.env` og `.env.*` holdes utenfor Git, med unntak for
`.env.example` og `.env.*.example` uten hemmeligheter. `node_modules/`, bygge-
og kontrollartefakter holdes også utenfor Git. Fiktive fixtures er versjonert
under `tests/fixtures/property-cases/`; de har ingen private originaler.

## Plan og prosess

- [Story 1.1 og akseptansekriterier](.docs/planning-artifacts/epics.md#story-11-etablere-reproduserbar-startstruktur-og-importgrenser)
- [Story 1.2 og akseptansekriterier](.docs/planning-artifacts/epics.md#story-12-starte-den-bygde-lokale-appen-med-godkjent-appskall)
- [Story 1.3 og akseptansekriterier](.docs/planning-artifacts/epics.md#story-13-registrere-og-bevare-finansverdier-for-ett-objekt)
- [Story 1.4 og akseptansekriterier](.docs/planning-artifacts/epics.md#story-14-validere-tall-og-normalisere-kjent-månedsgrunnlag-eksakt)
- [Story 1.5 og akseptansekriterier](.docs/planning-artifacts/epics.md#story-15-gjøre-kilder-kostnadsinnhold-og-uløste-konflikter-kontrollerbare)
- [Story 1.6 og akseptansekriterier](.docs/planning-artifacts/epics.md#story-16-vurdere-kritiske-mangler-med-fast-kodebegrunnelse)
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
