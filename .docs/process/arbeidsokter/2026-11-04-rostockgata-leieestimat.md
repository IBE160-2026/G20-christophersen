# Rostockgata 96: begrunnet leieestimat med begrenset arealtilnærming

Utgangspunkt: `484c825ef28e9f1cd80c863106c95c6dbe48e4a1`, 4. november 2026. Brukerens bestilling gjelder generell SSB-arealregel, ekte Nordvik-flyt til leie og økonomi i Konsept A, bevart leieforrang, ingen betalte AI-kall eller push og lokal commit med promptlogg. [Implementasjonsspesifikasjon og review](../../implementation-artifacts/spec-rostockgata-leieestimat.md). Automatisk promptlogg er [aktiv sesjon](../prompts/session-01a1a651-52fd-7033-b614-e00beb804981.jsonl); tidligere linjer/loggfiler endres ikke.

## Autoritative rammer

[Sensorveiledning](../../reference/course/Sensorveiledning-IBE160-Del-1.pdf), eksisterende [kildeuttrekk](../../planning-artifacts/prds/prd-IBE160-2026-10-10/kildeuttrekk-sensorveiledning.md) og [faglærers tilbakemelding](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md) begrunner sporbarhet, ekte kjerneflyt, meningsfulle tester, formler i vanlig kode og skillet mellom fakta, estimater og antakelser. De fastsetter ingen marginprosent eller ny leiemetode. [Godkjent Konsept A](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-30/EXPERIENCE.md) beholder ubekreftet økonomiscenario og sperrer kontrollert vurdering ved manglende teknisk grunnlag.

## Faktisk SSB-kontroll før implementasjon

Bare gratis offentlige HTTP GET, uten API-nøkkel. Følgende svarte HTTP 200:

- `https://data.ssb.no/api/pxwebapi/v2/tables/09897/metadata?lang=no`
- `https://data.ssb.no/api/pxwebapi/v2/tables/09897/data?lang=no&valueCodes%5BSoner2%5D=*&valueCodes%5BAntRomBRA%5D=*&valueCodes%5BContentsCode%5D=Husleie&valueCodes%5BTid%5D=2025`

Metadata oppgir år 2012–2025 og oppdatering `2025-12-22T07:00:00Z`. Siste år er 2025. [SSBs statistikkbeskrivelse](https://www.ssb.no/priser-og-prisindekser/boligpriser-og-boligprisindekser/statistikk/leiemarkedsundersokelsen) ble kontrollert separat: oppdatert 22. desember 2025, neste publisering varslet 21. desember 2026. [Tabell 09897](https://www.ssb.no/statbank/table/09897/) beskriver modellberegnet månedlig leie; PAA beregner sitt eget anslag mellom referansepunktene. Det er ingen adressebasert prediksjon eller observert leiekontrakt for Rostockgata.

| Romgruppe | Faktiske arealpunkter, m² |
| --- | --- |
| 1 | 15, 20, 30, 40, 50 |
| 2 | 30, 40, 50, 60, 70 |
| 3 | 60, 70, 80, 90, 100 |
| 4 | 80, 90, 100, 120, 140 |
| 5–8 | 100, 120, 140, 160, 180 |

Råresponser beholdes privat i `private/incoming/rostockgata-rent-ssb-{metadata,data}.json`. Offentlige, versjonerte testfasiter finnes fra før under `tests/fixtures/ssb/`. Ny funksjon skal lese faktiske metadata, ikke en hardkodet arealmatrise.

## Dokumentets geografiske bevis og økonomigrense

Ekte original: `private/incoming/nordvik-rostockgata-96.pdf`, SHA256 `3e2dd467c11785c1de7c8c79b8e5f58f786e87416f7dc9b14f7a2d713ec6cb70`, 170 fysiske sider. Fysisk side 117 har eksplisitt «Bydel: 1 Gamle Oslo» i matrikkelblokken med Oslo og Rostockgata 96. Dagens uttrekk mister bydelsnummeret. Nummerert bydel støttes generelt med ordrett kilde og offset; bydeler nevnt i parkeringsomtale på side 23 er ikke boligadressebevis.

Gamle Oslo hører til SSB-sone `01.02`: Oslo: Grünerløkka, Gamle Oslo, Sagene, Nordre Aker, Vestre Aker. Dette er valgt prissone, ikke bare Gamle Oslo eller hele Oslo. 2025-cellen `3.060` har **18 900 kr per måned**. Brukeren har autorisert 59→60 m² som tydelig merket nærmeste-punkt-tilnærming ved avvik 1 m². Referanseverdien beholdes uendret; det trekkes ikke en rett linje utover publiserte punkter.

Nordvik har kjent prisantydning 8 600 000 kr og fellesutgifter 3 660 kr/måned. Eksisterende automatiske totalprisgrunnlag krever kjent fellesgjeld; uttrekket har fortsatt ukjent fellesgjeld. Ukjent blir ikke null. Leieestimatet kan dermed brukes i et ubekreftet scenario, mens bruttoyield trenger et eksplisitt prisgrunnlag. Nettoyield og kontantstrøm krever dessuten fullstendig, årskompatibel drift og finansiering.

## Metode og forventet fasit

Innenfor støttede punkter brukes to nærmeste nabopunkter i samme romgruppe med vekt `w=(A−A_lav)/(A_høy−A_lav)` og `R=R_lav+(R_høy−R_lav)×w`. Eksakte punkter bruker én celle. Utenfor gruppens ytterpunkter tillates bare avvik ≤ 2 m² og uendret nærmeste referanse. Manglende relevante celler skal ikke erstattes ved å gjette annen sone eller romgruppe.

For Rostockgata blir forventet PAA-leie 18 900 kr/måned og 226 800 kr/år i 2025-nivå, uten prisjustering. Scenariointervallet beholder tidligere produktantakelser og får 5 ekstra prosentpoeng ved ytterpunktstilnærming: 25 % grunnmargin + 5 prosentpoeng for ett år siden 2025 + 5 for tilnærmingen = 35 %. Nedre 18 900 × 0,65 = 12 285 avrundes ned til 12 200; øvre 18 900 × 1,35 = 25 515 avrundes opp til 25 600 kr/måned. Dette er et foreløpig produktvalg som **ikke er empirisk kalibrert**, og ingen dekningssannsynlighet eller SSB-konfidensintervall hevdes.

Med eksplisitt testforutsetning P=8 600 000 blir bruttoyield 226 800 / 8 600 000 × 100 = 2,637209… %, vist 2,64 %. Dette er scenarioforutsetning, ikke automatisk kildebekreftet totalpris eller ferdig investeringsanbefaling.

Livekontrollens SHA256: metadata `e523ae6f4c96cc0323f33cee38a91735081ed44dad99596204a300f00acb8599` (6 027 byte); årsdata `d7551efd6ed23857f67228f68f60db6f6c015e8118d934491a2ed3674f3a3911` (7 676 byte). Sone 01.02 sine 3-romspunkter 60/70/80/90/100 m² gir henholdsvis 18 900/19 600/20 300/20 900/21 500 kr/måned. Alle punkter brukes bare i riktig romgruppe.

## Faktisk verifikasjon før review

Node24.21 og prosjektets npm, uten endring av testgrenser:

- `npm run prepare:visual`: lokal bildeleser klar.
- `npm run build`: bestått inkludert TypeScript. Eksisterende Vite-varsel om stor bundle, ingen byggfeil.
- `npm run lint`: bestått.
- `npm test`: **2 059 bestått, 7 eksisterende native-skip**, 100 filer (99 bestått/1 skip), 82,15 s. HTTP-integrasjon kjørt uten sandboxens localhost-sperre. Implementeringsagentens fokuserte pakke hadde 128 beståtte unit-tester; dens første HTTP-prøve ble stanset av sandboxens `EPERM listen`, ikke av produktlogikk. Fullprøven bestod.
- Playwright med ekte backend på 3108, demo, eksplisitt tom `OPENAI_API_KEY`, FINN av og installert Chromium: **24 bestått/1 tidsavbrudd**, ingen skip, 92,7 s. Ekte Nordvik bestod 17,646 s, tidligere 135-siders original bestod 17,556 s, syntetisk positiv prøve mot faktisk gratis SSB bestod 1,721 s. Den ene feilen var eksisterende graf-/renteprøve i `investment-overview.spec.ts:49`: samlet 30 s-testgrense mens tabell etter 5,04 % ventet. Den etterprøves isolert med samme grense; ingen grønn totalstatus hevdes før utfallet foreligger.

Kommandoen for den brede nettleserprøven var:

```sh
PATH=/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:$PATH \
PAA_TEST_NORDVIK_REQUIRED=1 PAA_TEST_SSB_NETWORK=1 \
npx playwright test --config private/incoming/rostockgata-rent.config.ts
```

Privat config velger eksisterende Chromium 1243, port3108 og reell demoserver. Den har ingen leie-/importmock. JSONrapport: `private/incoming/rostockgata-rent-playwright.json`; rålogg `/private/tmp/paa-rostockgata-playwright.txt`. Nordvik-bevis ligger under `private/incoming/rostockgata-rent-results/rent-real-document-ekte-No-0c871-reftet-økonomi-gjennom-HTTP/`: `nordvik-import-rent.json`, `nordvik-desktop.png` og `nordvik-mobile.png`. Mobilbildet er inspisert visuelt: riktig beløp, arealtilnærming, sone, kildeår og ukalibrert margin synlig, ingen horisontal overflyt ved 390 px.

Prøven kontrollerer alle 170 fysiske sider, rapport 36–54 med 19 lokale bildebevis, originalhash, kildeoffseter, pris 8 600 000 og fellesutgifter 3 660/måned, bydelskilde 117, rask originalsidenavigering/zoom og frigjorte canvas. `errors: []`, `paid: []`. SSB-svaret har `ssb-rent-2`, `areaMethod={kind:nearest-boundary,documentArea:59,lowerArea:60,upperArea:60,weight:0}`, én observasjon 01.02/3.060/18900, statistikkår 2025 og metodeformel med 0,35-margin. Leie sendes bare til ubekreftet scenario, ikke registrert/bekreftet L.

Etter eksplisitt registrert ubekreftet prisgrunnlag 8 600 000 viste UI 2,64 % bruttoyield. Testregistrert egen leieforventning 240 000/år viste 2,79 %; testregistrert faktisk leiekategori 21 000/måned med kildetekst viste 2,93 %, mens SSB-alternativet fortsatt viste 18 900. Disse innskrivingene er konstruerte prioritetstester, ikke bevis på en ekte leiekontrakt for eiendommen. Ingen verdi bekreftes automatisk. Nettoyield/kontantstrøm forble ukjent; `Rapportgrunnlag ufullstendig` og `Grunnlaget må kontrolleres` består. Importens tekniske status er fortsatt `incomplete`, med uløst tekst/grafisk semantikk og blokkert betalt behandling. Heller ikke 19 rendrerte sider dokumenterer komplett teknisk risikodekning.

Isolert etterprøve av den eneste feilede graftesten bestod med uendret 30 s-grense: 18,5 s (20,8 s samlet). Ingen test- eller produksjonskode ble endret. Rålogg `/private/tmp/paa-rostockgata-playwright-rerun.txt`, privat spor under `private/incoming/rostockgata-rent-rerun/`. Første tidsavbrudd beholdes som historikk; alle 25 ulike nettleserprøver har nå faktisk bestått, inkludert Nordvik uten skip.

## Gjentakbar lokal testkonfigurasjon

Den private configen erstatter bare stier, rapportering, nettleserprogram og port i den versjonerte `playwright.config.ts`. Ingen API-rute mockes. Opprett ved behov `private/incoming/rostockgata-rent.config.ts` med følgende innhold; juster `executablePath` til lokalt installert Chromium, eller utelat `launchOptions` for Playwrights standardinstallasjon. Originalen må ligge på den dokumenterte private stien. Standardconfig og README-kommandoen kan brukes direkte på en maskin med riktig Playwright-nettleser installert.

```ts
import { defineConfig } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import config from '../../playwright.config.ts'
const baseURL = 'http://127.0.0.1:3108'
export default defineConfig({
  ...config,
  testDir: fileURLToPath(new URL('../../tests/e2e', import.meta.url)),
  testMatch: ['rent-real-document.spec.ts', 'investment-overview.spec.ts', 'app-shell.spec.ts'],
  reporter: [['list'], ['json', { outputFile: fileURLToPath(new URL('rostockgata-rent-playwright.json', import.meta.url)) }]],
  outputDir: fileURLToPath(new URL('rostockgata-rent-results', import.meta.url)),
  use: { ...config.use, baseURL, launchOptions: {
    executablePath: '/Users/madschristophersen/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  } },
  webServer: { ...config.webServer, cwd: fileURLToPath(new URL('../..', import.meta.url)),
    command: 'node src/backend/server.ts', env: { PAA_PORT: '3108', ANALYSIS_MODE: 'demo',
      OPENAI_API_KEY: '', FINN_IMPORT_ENABLED: 'false' }, url: baseURL, reuseExistingServer: false },
})
```

## Review og nummerert bydel

Tre kontekstfrie reviewlag er brukt. Alle 12 individuelle funn og avgjørelser er bevart i spesifikasjonens triage. Root-reproduksjon bekreftet ugyldig-vekt-krasj og at 99 ble ignorert foran Gamle Oslo. Rettinger etterprøves separat. Skjemaets strukturelle kontroll er ikke en ny, uavhengig beregning av hele leiemodellen eller et nytt autoritativt SSB-metadataregister; de to forbedringsforslagene om dette er vurdert som lav nytte/økt duplisering uten påvist feil i backendens aktuelle beregning. Backendens råcellevalg og matematikk testes direkte og med uavhengig livefasit.

Oslo kommune bekrefter dagens nummer/navn i [Kommunerevisjonens tabell](https://www.oslo.kommune.no/get-file/1134117/5092c0da27edb275d119c717b8985d96a9b0b2badcebd7ac393657322162ccb4). [Kommunens reformveiledning](https://www.oslo.kommune.no/statistikk/slik-regner-du-om-statistikk-til-de-nye-bydelene/) dokumenterer at nye nummer/grenser gjelder fra 2028, at navn kan gjenbrukes med andre grenser, og at dagens 01 Gamle Oslo da får et annet nummer/omfang. Den nummererte navnenormaliseringen må derfor uttrykkelig gjelde den eksisterende 2004-inndelingen i dokument/SSB-grunnlag; nye eller motstridende identifikatorer gir avklaring, ingen ny presis sone. Generell håndtering av kommende reform og framtidige SSB-geografier er fortsatt del av åpen geografidekning, ikke levert her.

Reviewrettingene er implementert og kontrollert med 137 målrettede tester i de to endrede unit-filene. Ugyldige vekter gir nå valideringsfeil uten kast. Egen før/etter-reproduksjon gir `false` fra safeParse for alle tre tidligere krasjverdier; «99 Gamle Oslo» beholdes ordrett med kilde og blokkerende avklaringsmelding. Verifiserte nummer/navn-par normaliseres først etter at kommunen er valgt, slik at kildeplassering ikke avgjør geografien. Registeret gjelder Oslos eksisterende inndeling; andre nummererte kommuner/navn gis ikke gjettet presisjon.

Nettleserprøven henter nå egen fersk SSB-metadata og én valgt råcelle via Playwrights HTTP-klient før selve opplastingen. Den kaller ikke produksjonens leieberegning for å lage fasit. Statistikkår, alder, 35 %-regelen ved dagens datadato, avrundede beløp og bruttoyield kontrolleres uavhengig. Rå metadata, enkeltcellesvar og utregningsaudit lagres sammen med bevisene. Faste 2025-beløp beholdes i deterministiske unit-tester. Manglende kolonne og manglende sone testes med konsistent reindeksert JSON-stat, og én nullcelle i en av flere relevante soner skal avvise hele anslaget. Ingen produksjonsregel eller metadatafallback er svekket for å få testene grønne.

## Sluttverifikasjon etter reviewrettinger

- `npm run build` og `npm run lint`: bestått etter siste kildeendring. Bare det eksisterende bundlevarselet består.
- `npm test`: **2 077 bestått, 7 eksisterende skip**, 100 filer (99 bestått/1 skip), 82,89 s. Rålogg `/private/tmp/paa-rostockgata-final-vitest.txt`.
- Ny Playwright-kjøring av alle tre testene i `rent-real-document.spec.ts`: **3/3 bestått, ingen skip**, 48,7 s. Tidligere ekte PDF 20,5 s, faktisk gratis SSB 2,6 s, ekte Nordvik med uavhengig livefasit 22,6 s. Kommandoen under endrer kun reporter/outputplassering fra configen over; full import og faktisk SSB beholdes.

```sh
PATH=/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:$PATH \
PAA_TEST_NORDVIK_REQUIRED=1 PAA_TEST_SSB_NETWORK=1 \
npx playwright test --config private/incoming/rostockgata-rent.config.ts \
  tests/e2e/rent-real-document.spec.ts --reporter=list \
  --output=private/incoming/rostockgata-rent-final
```

Sluttrålogg: `/private/tmp/paa-rostockgata-final-playwright.txt`. Beviskatalogen `private/incoming/rostockgata-rent-final/rent-real-document-ekte-No-0c871-reftet-økonomi-gjennom-HTTP/` har `nordvik-import-rent.json`, desktop/mobil-PNG og tre ekstra uavhengige bevis: `nordvik-expected-ssb-{metadata,data,audit}.json`. Audit kontrollerer eksplisitt celle 01.02/3.060/Husleie/2025=18900 mot kalenderår 2026, alder 1, margin 35 %, månedsleie 18900, årsleie 226800, lav 12200, høy 25600 og bruttoyield 2,64 % etter eksplisitt prisforutsetning. Endelig HTTP-svar samsvarer på alle disse punktene, dokumenthash og 170 sider; `errors=[]`, `paid=[]`, teknisk status fortsatt `incomplete`.

Alle konkret beholdte reviewfunn er rettet og kontrollert. Ingen ny konkret reviewfeil er utsatt. Generell kalibrering, geografidekning, ukjent økonomi og teknisk recall består som åpne begrensninger i den sentrale deferred-oversikten. Det første graftidsavbruddet og isolert grønn etterprøve er fortsatt dokumentert over; sluttprøven av faktiske dokumenter har ingen feil.

Den eksisterende prosjektserveren på port 3000 ble identifisert via PID/arbeidskatalog og startet på nytt med siste backend og bygde frontend i **demo med eksplisitt tom AI-nøkkel**. `.env` er ikke endret eller skrevet ut. `http://127.0.0.1:3000/` svarer HTTP 200. Ingen betalte AI-kall eller push er utført. Privat PDF, bilder og rårapporter stages ikke; lokal commit inkluderer implementasjon, tester, prosessbevis og automatisk append til aktiv promptlogg. Tidligere promptlogginnhold er kontrollert som uendret byteprefiks.

Begge siste PNG-er er byteidentiske (SHA256-sammenlignet) med desktop-/mobilbildene som hovedagenten allerede hadde inspisert visuelt. Reviewrettingene endrer dermed ingen observert layout eller synlige tall for denne originalen.
