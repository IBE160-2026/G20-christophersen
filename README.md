# Property Acquisition Agent — IBE160, G20

PAA hjelper en privat eiendomsinvestor med førstevurdering av **ett boligutleieobjekt**. Last opp en salgsoppgave som PDF, kontroller dokumentets økonomi og risikofunn mot originalsidene, og prøv leie, drift og finansiering. Beregningene og screeningreglene utføres i vanlig kode. Investoren tar beslutningen.

**Leveransestatus 6. november 2026:** Lokal PDF-analyse og investeringsoversikt er ferdig innenfor det dokumenterte omfanget. Generell semantisk KI-analyse av importerte dokumenter er deaktivert. Demoen nedenfor trenger **ingen API-nøkkel, miljøfil, privat PDF, konto eller betalt tjeneste**. Tekstregler, lokale leiereferanser og valgfri lokal OCR er ikke en språkmodellanalyse. Historiske live-prøver og eldre demo med lagrede, fiktive uttrekk er egne bevis.

[Desktopbilde](.docs/process/leveranse-2026-11-06/oversikt-desktop.png) og [mobiløkonomi](.docs/process/leveranse-2026-11-06/okonomi-mobil.png) viser bare fiktive demonstrasjonsdata.

Start med [leveranserapport og vurderingsgrunnlag](.docs/process/leveranse-2026-11-06/rapport.md), [prosess og KI-styring](.docs/process/leveranse-2026-11-06/prosess-og-ki.md) og [gjeldende scope, arkitektur og krav–kode–test](.docs/process/leveranse-2026-11-06/produkt-og-sporbarhet.md).

## Installer og start

Forutsetninger: **Node.js 24.21.0 og npm 11.19.0**, låst i `.nvmrc`, `package.json` og `package-lock.json`. Bruk eksempelvis `nvm install` og `nvm use` hvis nvm allerede er installert. nvm er valgfritt. Python, database, Docker og global Vite trengs ikke.

```sh
git clone https://github.com/IBE160-2026/G20-christophersen.git
cd G20-christophersen
node --version
npm --version
npm ci
npm run build
ANALYSIS_MODE=demo npm run demo
```

Versjonskommandoene skal vise `v24.21.0` og `11.19.0`. Åpne **http://127.0.0.1:3000**. Du skal se investeringsoversikten med **Last opp salgsoppgave** og ukjente verdier. Stopp serveren med **Ctrl+C**. Installasjon trenger nett til npm-registeret; den lokale demonstrasjonen trenger ikke eksternt nett. Kommandoene over bruker en macOS-/Linux-terminal. Windows er ikke verifisert; bruk eventuelt et tilsvarende POSIX-miljø.

Port 3000 må være ledig. `PAA_PORT=3001 ANALYSIS_MODE=demo npm run demo` bruker en annen port. Ved «Bygget app mangler»: kjør `npm run build`. Etter kodeoppdatering: stopp serveren, bygg på nytt og start igjen; en gammel backend oppdateres ikke ved sidelasting. npm kan varsle om det valgfrie macOS-scriptet til `fsevents`; dette hindret ikke verifisert installasjon/build. Vites chunkvarsel er dokumentert i testbeviset.

## Demonstrer med prosjektets fiktive data

Ingen ekte meglerdokumenter skal hentes eller deles for denne prøven. Velg den versjonerte filen **[mixed-12.pdf](tests/fixtures/sales-prospectus/mixed-12.pdf)** fra `tests/fixtures/sales-prospectus/` med **Last opp salgsoppgave**. PDF-en er laget for prosjektets tester og beskriver en fiktiv eiendom. Generator, forhåndsdefinert fasit og opphav står i [fixturebeskrivelsen](tests/fixtures/sales-prospectus/README.md).

1. Vent på **Dokumentuttrekk klart.** Åpne **Beløp og kildegrunnlag**. Prisantydningen er 3 000 000 kr; prisgrunnlaget inklusive 200 000 kr fellesgjeld er 3 200 000 kr. Åpne en originalkilde og kontroller fysisk PDF-side. Lukk med Esc.
2. Velg **Juster leie og drift ↗**. Oppgi årsleie **252 000**, årsdrift **48 000** og år **2026**, og velg **Bruk som ubekreftede forutsetninger**. Året må stemme med testdokumentets fellesgjeldsbetaling. Hovedflaten viser da **21 000 kr** i månedsleie og **4 000 kr** i månedsdrift; begge kan justeres direkte. Dette er egne, fiktive totalforutsetninger. Bruttoyield blir **7,88 %**, nettoyield **6,38 %**. Yieldgrunnlaget inkluderer fellesgjeld, men ikke kjøpsomkostninger. Renter/avdrag hører til finansiering.
3. Sett egenkapital **1 000 000 kr**, nominell årsrente **5,5 %** og nedbetalingstid **25 år**. Kontantstrøm før skatt blir omtrent **3 258 kr/mnd**, inklusive fixturefilens betaling på fellesgjeld. **Utforsk kontantstrøm, lån og rente** viser grafer med datatabeller. Endret rente påvirker kontantstrømmen, ikke yield.
4. Les **Juridiske forhold** og **Teknisk tilstand**. Åpne **Se alle funn og kilder** og originalsidene. Det syntetiske takfunnet har fysisk PDF-side **10**, trykt side **6**; sammendraget på fysisk side 2 er et tilleggsbelegg. Fravær av funn er ingen friskmelding.
5. **Bak tallene** åpner den separate kontrollflyten. Scenariojusteringer er ubekreftede og godkjenner ingen tall, rapport, TG3 eller anbefaling. [Detaljert offentlig prøve](.docs/process/leveranse-2026-11-06/demonstrasjon.md) viser alle tre anbefalingene, feil input og gjentatt import med fasit.

Sideoppdatering eller lukking avslutter den midlertidige vurderingsøkten. Last opp filen igjen for å begynne på nytt. Prøv også `invalid-format.pdf` under `tests/fixtures/property-cases/` og `missing-report-6.pdf` under salgsoppgavene: feil eller manglende rapport skal vises uttrykkelig, uten oppdiktede resultater.

## Hva tallene og analysen betyr

**Økonomi:** Bruttoyield = årsleie/prisgrunnlag. NOI = årsleie − årsdrift. Nettoyield = NOI/prisgrunnlag. Kontantstrøm = (NOI − årlige renter/avdrag)/12. Samlet kapitalbehov inkluderer kjøpsomkostninger og fellesgjeld; yieldgrunnlaget utelater omkostningene. Standardscenarioet er 80 % samlet belåning, 6 % rente og 360 måneder. Det er et redigerbart eksempel, ingen lånegodkjenning. Dokumentets driftsdelsum er foreløpig; egen totaldrift erstatter delsummen og legges ikke oppå den. Blank drift gir ukjent netto og kontantstrøm. Skatt, ledighet, særskilte reparasjonstiltak, salg og verdiendring inngår ikke.

**Leie:** Lokale publiserte gruppereferanser fra Hybel/Menon, Utleiemegleren/NTB og et SSB-snapshot er datert og kildebelagt. De er ingen individuell markedsvurdering eller faktisk leieavtale. Manglende kommune/rom/type eller konflikt gir synlige begrensninger. [Kilder og metode](.docs/implementation-artifacts/leieagent-lokale-referanser.md).

**Dokumenter og risiko:** Importgrensen er 200 sider / 50 MiB, med ressursvern og eksplisitte uleste/usikre sider. Lokal juridisk/teknisk tekstanalyse har delvis dekning og kontrollerer ikke grunnbok, byggesaksarkiv eller lovlig utleie. Grafiske grader, ukjente oppsett og fortsettelser kan gi mangler. Ingen generell garanti om å finne alle TG2/TG3 i vilkårlige PDF-er gis. Komplett teknisk screening krever fortsatt egne kontrollporter. Den eldre separate rapportflyten har en annen 30-siderskontrakt.

**KI og data:** Vanlig PDF-import behandles lokalt. Frontend holder original og aktiv vurdering midlertidig; importens midlertidige serverfiler ryddes etter request. Ingen språkmodell kontaktes i standarddemoen. Bevarte økonomihjelpere gir forberedte pakker 15 minutters gyldighet; pakker kan bli liggende i serverminnet til neste forberedelsesrequest, utskifting eller serverstopp. Særskilt godkjent live-bruk kan skrive private resultat-/budsjettfiler. Eldre live-ruter er ikke globalt fjernet av `ANALYSIS_MODE=demo`. Kjør uten API-nøkkel som beskrevet; ikke aktiver betalte hjelpere under sensorprøven. [Presis status og arkitektur](.docs/process/leveranse-2026-11-06/produkt-og-sporbarhet.md).

## Tester og utvikling

Stopp demoen før testene. Installer korrekt Chromium mens nett er tilgjengelig:

```sh
npx playwright install chromium
npm run typecheck
npm run lint
npm test
npm run test:components
npm run test:e2e
```

Kjør sekvensielt fra reporoten med port 3000 ledig. `test:e2e` bygger og starter/stopper først bygget demo, deretter dev. `PAA_E2E_PORT=3001 npm run test:e2e` velger annen testport. Testserverne setter eksplisitt demo og tom API-nøkkel. Vanlige tester bruker fiktive PDF-er, lokale data og kontrolladaptere; ingen betalt KI trengs. Playwright laster Chromium lokalt. På Linux kan systembiblioteker kreve `npx playwright install --with-deps chromium`; Linux er ikke egenprøvd.

Private originalprøver og native macOS-OCR er valgfrie og hoppes over uten sine forutsetninger. **Skip er ikke beståtte prøver.** [Testresultater og bevisgrenser](.docs/process/leveranse-2026-11-06/teknisk-og-test.md) skiller offentlig regresjon, syntetisk fasit, historisk live og private originaler. Feilspor ligger ignorert i `test-results/`; åpne en faktisk `trace.zip` med `npx playwright show-trace <sti>`.

Utvikling: `ANALYSIS_MODE=demo npm run dev` på samme lokale adresse; backendendringer krever omstart. Valgfri grafisk PDF-analyse på macOS: `npm run prepare:visual` bygger en ignorert PDFKit/Vision-hjelper med Apples `swiftc`. Det sender ingen dokumenter ut og er **ikke nødvendig** for den offentlige demoen. [.env.example](.env.example) viser hemmelighetsfri standardkonfigurasjon; serveren leser ikke `.env` automatisk.

## Struktur og dokumentasjon

| Mappe | Ansvar |
| --- | --- |
| `src/domain/`, `src/contracts/` | Rene beregnings-/screeningregler og delte validerte kontrakter. |
| `src/frontend/`, `src/presentation/` | React, midlertidig økt, kontroll, original-PDF og tallpresentasjon. |
| `src/backend/` | Lokal Express-server, PDF-workers, import og bevarte adaptergrenser. |
| `tests/` | Unit/integrasjon, komponent/E2E, fiktive PDF-er og forhåndsdefinert fasit. |
| `.docs/planning-artifacts/`, `.docs/specs/` | Brief, PRD, UX, arkitektur og kravhistorikk. |
| `.docs/implementation-artifacts/` | Spesifikasjoner, verifikasjon/review og [eneste sentrale oversikt over utsatt arbeid](.docs/implementation-artifacts/deferred-work.md). |
| `.docs/process/` | Brukerpromptlogger, arbeidsøkter og [leveransekontroll](.docs/process/leveranse-2026-11-06/rapport.md). |
| `private/` (ignorert) | Eventuelle egne originaler, OCR-hjelper og private test-/budsjettfiler; distribueres ikke. |

Plan: [Product Brief](.docs/planning-artifacts/briefs/brief-IBE160-2026-09-15/brief.md), [PRD](.docs/planning-artifacts/prds/prd-IBE160-2026-10-10/prd.md), [arkitektur](.docs/planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md), [godkjent Konsept A](.docs/planning-artifacts/ux-designs/ux-IBE160-2026-10-30/DESIGN.md). [Gjeldende avstemming](.docs/process/leveranse-2026-11-06/produkt-og-sporbarhet.md) forklarer endringene fra opprinnelig v1; gamle dokumenter er historiske bevis, ikke løfter om at alle planer er oppfylt. [Promptmekanismen](.docs/process/prompts/README.md) logger brukerens instrukser, ikke fullstendige samtaler.

Historiske avgrensninger: S2/live gjelder bare sitt kontrollerte utvalg. S5 er avsluttet med akseptert avvik og beviser ingen tidsbesparelse. **S6 med en annen person er ikke gjennomført.** Den nye rene klonen er en AI-assistert teknisk prøve. Ingen slik menneskelig test eller godkjenning er konstruert i ettertid.

Grunnlag: [Sensorveiledning IBE160 del 1](.docs/reference/course/Sensorveiledning-IBE160-Del-1.pdf), [faglærerfeedback](.docs/planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md) og [AGENTS.md](AGENTS.md). Prosjekt i **IBE160 Programmering med KI**, Høgskolen i Molde, høsten 2026. Medlem: Mads Semb Christophersen. Startstrukturen bygger på Vites React/TypeScript-starter; tredjepartsavhengigheter beholder sine egne lisenser.
