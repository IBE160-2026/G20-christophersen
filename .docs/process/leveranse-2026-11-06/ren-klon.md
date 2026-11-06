# Ren lokal klon og offentlig README-prøve

Dato: 2026-11-06. Utført av hovedagenten. Dette er en **KI-assistert teknisk prøve på utviklerens macOS**, ikke en ny fysisk maskin, en annen persons brukertest eller bestått S6.

## Isolasjon og gjenskaping

En lokal `git clone --no-local` ble laget fra repoets **versjonerte** referanse `639291814886a6058a24adf95c69e8633b645944` til en ny mappe under `/private/tmp`. Dette kopierer Git-innhold og historikk, ikke utviklerens `node_modules`, `.env`, `private/`, OCR-hjelper eller ukommitterte filer. Ingen GitHub-konto eller remote-nedlasting ble brukt for klonen. Nettinstallasjon brukte npm-registeret og den uendrede låsfilen.

Kommandoenes prinsipielle form (erstatt de midlertidige stiene med egne):

```sh
git clone --no-local <lokalt-repo> /tmp/paa-clean
cd /tmp/paa-clean
# Sørg for Node 24.21.0/npm 11.19.0 i PATH.
env -i HOME=/tmp/paa-clean-home PATH="$PATH" npm ci --cache /tmp/paa-clean-cache
env -i HOME=/tmp/paa-clean-home PATH="$PATH" npm run build
```

Faktisk støttet Node-runtime ble valgt eksplisitt fra en lokal installasjon av Node 24.21.0; standardterminalens Node 26.8.1 ble ikke brukt til sluttestene. Ny HOME og separat npm-cache hindret arvet brukerkonfigurasjon og pakkeavhengigheter. `.env` ble ikke kopiert eller lest. `OPENAI_API_KEY` var fraværende i installasjon/build/E2E og eksplisitt tom i demoens barn. macOS og de installerte systemverktøyene deles fortsatt med vertsmaskinen; andre OS er ikke verifisert.

Chromium/headless shell **1248**, forventet av Playwright **1.64.0**, ble installert fra prosjektets verktøy i en egen midlertidig browsermappe. Denne installasjonen er en eksplisitt README-forutsetning, ingen avhengighet til utviklerens gamle browsercache. `PLAYWRIGHT_BROWSERS_PATH` pekte til den nye mappen.

Etter første baselinekjøring ble bare den begrunnede E2E-testrettingen og den nye bevishelperen kopiert til klonen; **ingen produktkode** ble endret. Derfor skiller bevisene nedenfor baselinefeil fra den forbedrede testoppskriften. Sluttcommit får også en ny lokal klon for oppstartskontroll.

## Observerte resultater

| Kontroll | Faktisk resultat | Bevis |
| --- | --- | --- |
| `npm ci` med låst Node/npm | 132 pakker installert, exit 0; ingen endring av package-/lockfil | [Installasjonslogg](ren-klon-installasjon.txt). Valgfritt `fsevents`-script gir npm-varsel. |
| `npm run build` | TypeScript og Vite består i klonen. Vite varsler om stor chunk; ingen buildfeil | Full E2E-logg nedenfor inneholder buildkjøringen. |
| Baseline, full bygget E2E | **231 bestått / 12 skip / 2 feil**, 6,4 minutter | [Uendret baseline](ren-klon-e2e-for-retting.txt). Dev-delen startet ikke fordi kommandoen stopper ved feil. |
| Målrettet ny-dokument-prøve etter retting | **11 bestått / 6 skip**, 21,5 s, exit 0 | [Målrettet logg](ren-klon-malrettet.txt). Private caser er fortsatt skippet. |
| Endelig `npm run test:e2e` etter retting | **233 bestått / 12 private skip**, 6,5 minutter; deretter **3/3 dev-prøver**, exit 0 | [Full endelig logg](ren-klon-e2e-godkjent.txt). Ingen eksisterende backend eller private originaler brukt. |
| Unit/integrasjon uten private filer | **2 237 bestått / 8 skip**, 110 filer bestått / 2 skip, 82,62 s, exit 0 | [Full ren-klon-logg](ren-klon-unit-integrasjon.txt). Sju native OCR-prøver og én privat originalprøve er skip; native 7/7 er separat bestått på klargjort macOS. |
| Lint i klonen | **0 feil / 0 advarsler**, exit 0 | [Lintlogg](ren-klon-lint.txt). |
| README-scenario med faktisk backend | **6 kontrollpunkter bestått**, ingen eksterne nettleserforespørsler eller pageerrors | [Strukturert resultat](demo-resultat.json), [kjørbar helper](prove-demo.mjs), [desktop](oversikt-desktop.png), [mobiløkonomi](okonomi-mobil.png). |
| Fersk `npm audit --json` | **0 kjente sårbarheter** i rapportert låst graf, exit 0 | [Npm-rapport](dependency-audit.json). Dette er registerets datagrunnlag ved kjøringen, ingen garanti mot ukjente svakheter. |

### Feilen den rene klonen faktisk fant

`new-document-import.spec.ts:54` forventet «Ingen lagret analyse for dette dokumentet». Den teksten er riktig når et eksisterende privat arkiv gjelder et annet dokument. I en ren klon **mangler** arkivet, og appen gir med hensikt «Lagret analyse finnes ikke; kun lokalt uttrekk vises». Begge lokale fallbackgrener har vært i `saved-economy.ts` siden `d9fd4701025ddcd54a7aa14fe72abd419e4888e0`.

Den tekniske subagenten kontrollerte årsak og eksisterende enhetstester uavhengig. Bare testhjelperens årsakstekst ble rettet: den krever nå alle tre garantier om **kun lokalt uttrekk**, **KI ikke startet** og **ingen nye KI-API-kall**. Hash, proveniens, kildespenn, tomme modellobservasjoner, teknisk sperre og null kostnadsreservasjon er fortsatt like strenge. Ingen produksjonsatferd eller produktfasit ble endret for å få grønt. Se [teknisk rapport](teknisk-og-test.md).

### Miljø-/gjennomføringsfeil som ikke er beståtte prøver

Første npm-forsøk i sandbox hang. Hovedagenten startet et nettåpent forsøk før det første var helt avsluttet; de overlappende installasjonene gjorde `node_modules` ubrukelig. [Forsøket med manglende tsc](ren-klon-installasjonsfeil.txt) er bevart. Begge installasjoner ble avsluttet, og installasjon ble gjentatt sekvensielt i den samme isolerte cachen før videre prøver. Feilen skyldtes testgjennomføringen, ikke krav om en privat TypeScript-installasjon.

[Et senere E2E-forsøk](ren-klon-opptatt-port.txt) stoppet på opptatt port 3000. Brukerens eksisterende server ble ikke stoppet. Som README beskriver, brukte videre tester egen port **43161**. Dette er ingen skjult gjenbruk av brukerens gamle backend.

## Hva README-prøven viser

[prove-demo.mjs](prove-demo.mjs) starter egen bygget server på port 43162, med eksplisitt demo og tom nøkkel. Den laster den fiktive `mixed-12.pdf` gjennom ekte lokal backend, oppgir årsforutsetninger og **2026** før finansiering, sammenligner brutto-/nettoyield og kontantstrøm med README-fasiten, åpner originalside, prøver Esc/fokusretur, 390 px visning, inngangen til Tallgrunnlag, ugyldig PDF og ny import. Skjermbildene inneholder bare syntetiske data.

Prøven avdekket også et hull i første README-utkast: bare direkte månedsjusteringer oppga ikke scenarioår, så fellesgjeldsbetaling kunne ikke brukes og kontantstrøm var korrekt ukjent. README ble presisert med år 2026 via «Juster leie og drift». Ingen gjetting av år eller produktendring ble innført. Helperens egen første oppstartssjekk ble også rettet: rentefeltet finnes først etter import; startflaten kontrolleres gjennom filinngangen.

Browserens eksterne HTTP-forespørsler avvises og telles av helperen; resultatet var **0**. Dette er en programmatisk browsernett-sperre, ikke en OS-brannmur eller en ny leverandørbenchmark. Backendens lokale kjøring støttes av kodegjennomgang og eksisterende nettfrie tester. Installasjon/browsernedlasting skjer med nett og inngår ikke i påstanden om lokal demonstrasjon.

For å gjenta etter README-build/browserinstallasjon:

```sh
ANALYSIS_MODE=demo OPENAI_API_KEY= node .docs/process/leveranse-2026-11-06/prove-demo.mjs
```

Helperen skriver nye bilder/resultat i en unik midlertidig mappe og stopper sin egen server. Den overskriver ikke historiske bevis. `PAA_PROOF_PORT` kan velge en annen ledig port.

Alle tre anbefalingene, fysisk side 10 mot trykt 6, kontrollporter, feil input og gjentakelse har eget [offentlig E2E-spor](../../../tests/e2e/prospectus-import.spec.ts). S6 med en faktisk annen person er fortsatt åpen i [sentral oversikt](../../implementation-artifacts/deferred-work.md).
