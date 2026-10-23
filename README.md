# Property Acquisition Agent — IBE160, G20

Lokal førstevurdering av **ett boligutleieobjekt**, laget for investorens tidlige sortering. Brukeren registrerer og kontrollerer økonomiske forutsetninger, leser tilstandsrapportens original, kontrollerer TG2/TG3-funn og får en kodebestemt anbefaling: **Gå videre**, **Forkast** eller **Innhent mer informasjon**. Beregningene er bruttoyield, NOI, nettoyield og kontantstrøm før skatt. Investoren tar beslutningen; dette er ingen teknisk godkjenning eller komplett investeringsanalyse.

Levert nå: lokal demo med rapportbundne, lagrede uttrekk for fire fiktive rapporter, menneskelig kontroll/korrigering, separat TG3-avklaring og revisjonsbundet resultat. Uttrekkene er kontrollerte fiktive demodata, skrevet for demoen; de stammer ikke fra en faktisk KI-/live-kjøring. Demo er standard og krever **ingen API-nøkkel, miljøfil, konto eller betalt tjeneste**. Live-adapteren er koblet til samme kontroll- og resultatflyt i Story 4.3; [backenddokumentasjonen](src/backend/README.md) beskriver lokal moduskonfigurasjon. Faktiske live-kjøringer og separat kvalitets-/tidsevaluering gjenstår i Story 4.4/4.5. Demo beviser ingen live-kvalitet eller live-tid. Automatisk søk, markedsdata, rangering og lagring mellom økter er utenfor denne smale v1.

## Installer og start demo

Bruk et lokalt utsjekket repo og en terminal i **reporoten** (mappen som inneholder `package.json`). Forutsetninger er **Node.js 24.21.0 og npm 11.19.0**, låst i `package.json`, `package-lock.json` og `.nvmrc`. Installer denne Node-versjonen med tilhørende npm; bruker du allerede nvm, kan du kjøre `nvm install` og `nvm use`. nvm er ikke påkrevd. Ingen global Vite, Python, database, Docker eller egen frontendserver trengs for demo/test.

```sh
node --version
npm --version
npm ci
npm run build
npm run demo
```

De to første kommandoene skal vise `v24.21.0` og `11.19.0`. `npm ci` installerer nøyaktig fra låsfilen og erstatter eksisterende `node_modules`. Installasjon kan kreve nett til npm-registeret. Åpne **http://127.0.0.1:3000** i en moderne nettleser. Du skal se Tallgrunnlag og **Demo · lagret KI-uttrekk**. Én Express-prosess serverer bygget `dist/`, API og PDF-/worker-/fontressurser lokalt. Etter installasjon kan build og hele demoen kjøres med eksternt nett sperret; behold tilgang til lokal loopback.

Stopp med **Ctrl+C** i serverterminalen. Port 3000 må være ledig; serveren velger ikke en annen port. Ved «Bygget app mangler» kjører du `npm run build`. Ved opptatt port stopper du din tidligere demo/dev/testserver før ny oppstart. Ikke kjør dem samtidig. Oppdatering/lukking av siden avslutter den midlertidige økten, inklusive tall, rapport, kontroll og resultat; ingen brukerdata lagres.

Oppskriften er egenprøvd på macOS 26.6.2 arm64; andre plattformer er ikke egenprøvd. npm kan varsle om det valgfrie installasjonsscriptet til `fsevents@2.3.3` på macOS. Vite kan varsle om stor chunk; faktisk exitstatus og testresultat må fortsatt kontrolleres.

## Prøv F1–F4 fra start til resultat

Bruk de innsjekkede PDF-ene i [tests/fixtures/property-cases](tests/fixtures/property-cases/README.md) og den forhåndsdefinerte [expected.json](tests/fixtures/property-cases/expected.json). Finansdata ligger separat fra rapportene. Bruk bare disse fiktive dataene i oppskriften. Bare **uendrede F1–F4-originalbytes** har lagrede demosvar; ny filidentitet gir ingen live-fallback.

**P** er totalpris inklusive eventuell fellesgjeld, uten kjøpsomkostninger. **L** er brutto leieinntekt, **D** eierbetalte driftskostnader uten renter/avdrag, **J** gjeldsbetjening (renter og avdrag inklusive eventuell fellesgjeld), og **Ymin** ditt minimumskrav til nettoyield.

| Case / rapportfil | P (NOK) | L (NOK/år) | D (NOK/år) | J (NOK/år) | Ymin | Forventet utfall etter nødvendig kontroll |
|---|---:|---:|---:|---:|---:|---|
| `F1-tilstandsrapport.pdf` | 16000000 | 1900000 | 400000 | 800000 | 7 % | Gå videre |
| `F2-tilstandsrapport.pdf` | 16000000 | 1400000 | 400000 | 800000 | 7 % | Forkast: nettoyield under 7 % |
| `F3-tilstandsrapport.pdf` | 16000000 | **blank** | 400000 | 800000 | 7 % | Innhent mer informasjon lokalt i Tallgrunnlag; ingen gyldig hovedstart |
| `F4-tilstandsrapport.pdf` | 16000000 | 1900000 | 400000 | 800000 | 7 % | Innhent mer informasjon: alvorlig TG3 Uavklart |

1. I **Tallgrunnlag** skriver du tall fra valgt case; **la L være blank for F3**. For **L, D og J** velger du **År** og **2026**. Velg **Egen forutsetning** for hvert felts opphav og skriv eksempelvis «F1 — kontrollert fiktiv P fra expected.json» i kilde/forutsetning (tilpass felt og case). For L velger du **Forventet leie**. Tall fra rapporten fylles ikke inn automatisk.
2. Under **Kostnadsinnhold i D og J**, bruk **Legg til kostnadsinnhold** for postene nedenfor. Samlet beløp og rentedel/avdrag må oppgis, også 0. La **Inngår allerede i** være **Selvstendig post**. Perioden følger D (År 2026). Postene forklarer allerede registrerte D/J og legges ikke til totalene en gang til.

   | Navn på post | Samlet beløp | Herav renter/avdrag |
   |---|---:|---:|
   | Felleskostnader uten gjeldsbetjening | 120000 | 0 |
   | Kommunale avgifter/eiendomsskatt | 80000 | 0 |
   | Forsikring | 40000 | 0 |
   | Forvaltning | 60000 | 0 |
   | Løpende vedlikehold | 100000 | 0 |
   | Gjeldsbetjening: renter 600000 + avdrag 200000 | 800000 | 800000 |

3. Velg **Bekreft tallgrunnlaget**. Rett eventuelle konkrete lokale feil, kontroller kildene/kostnadsinnholdet og bekreft igjen. F1/F2/F4 åpner **Fortsett til Tilstandsrapport**. F3 skal beholde blank L og vise manglende leie og **Innhent mer informasjon** her; den kan ikke gå videre før faktisk leiegrunnlag er innhentet, registrert og bekreftet. F3-fasiten har fire utilgjengelige beregninger (`null`), ikke fire nullbeløp. For å prøve F3-rapporten videre kan du i en egen, uttrykkelig endret variant sette L=1900000 med samme år/kildekontroll som F1; den er da ikke lenger det opprinnelige F3-mangelcaset.
4. I **Tilstandsrapport** velger du den matchende PDF-filen og deretter **Start analyse**. Filvalg alene starter ingen analyse. Når fullført, velg **Gå til Kontroller funn**. Uttrekket er fortsatt ubekreftet.
5. Velg hvert aktivt funns overskrift, sammenlign beskrivelse/TG med originalen og velg **Bekreft** på enkeltfunnet. TG2 «Slitt overflate på baderomsgulv» ligger på **PDF-side 2**. For F4 ligger TG3 «Alvorlig lekkasje i tak» på **PDF-side 4**, selv om trykt sidetall er 2. Bruk Forrige/Neste PDF-side og PDF-zoom ved behov. Ved smal flate: **Åpne PDF for valgt funn**, deretter **Tilbake til funnkontroll** eller Esc.
6. F4 krever også et separat valg i **TG3-status for gjeldende forhold**: velg **Uavklart** for originalcaset. Enkeltfunnbekreftelse eller listebekreftelse avklarer ikke TG3. **Avklart** krever både kort begrunnelse og konkret eksternt avklaringsgrunnlag; velg det bare som en tydelig merket fiktiv kontrollvariant her. Avklart betyr ikke nødvendigvis utbedret.
7. Kontroller hele gjeldende listen og velg **Bekreft gjeldende liste**, deretter **Beregn og vis resultat**. Kontroller anbefaling, årsberegninger, utløsende regler, alvorlige forhold/mangler og neste handling. Åpne detaljer for formel, kilde og opprinnelig uttrekk ved behov.

| Case | Bruttoyield | NOI (kr/år) | Nettoyield | Kontantstrøm før skatt (kr/år) |
|---|---:|---:|---:|---:|
| F1 | 11,875 % | 1500000 | 9,375 % | 700000 |
| F2 | 8,750 % | 1000000 | 6,250 % | 200000 |
| F4 Uavklart | 11,875 % | 1500000 | 9,375 % | 700000 |

F4-tallene er **Delgrunnlag** og overstyrer ikke TG3-mangelen. Start et uavhengig case med sideoppdatering; da registreres og kontrolleres grunnlaget på nytt.

## Prøv blank/null, feil, korrigering og retur

- **Blank og 0:** Fra bekreftet F1, gå tilbake til Tallgrunnlag og slett L; forsøk bekreftelse. Manglende leie forklares lokalt og er aldri 0. Sett L tilbake til 1900000 med kontrollert kilde før du prøver separat J=0. Fjern gjeldsposten fra kostnadsinnholdet, og behold fem driftsposter. Velg den synlige særskilte nullkontrollen for J før du bekrefter tallgrunnlaget igjen. Registrert 0 alene er ubekreftet. P må være større enn 0. Ved nytt resultat med ellers uendret bekreftet F1-grunnlag er yieldene/NOI uendret, kontantstrømmen 1500000 kr/år og anbefalingen Gå videre. Sett J=800000 og legg tilbake gjeldsposten før du sammenligner med original F1-fasit.
- **Feil rapport:** Etter gyldige tall, velg `invalid-format.pdf` i samme fixturemappe og Start analyse. Forvent dokumentfeil, konkret lokal forklaring/handling og ingen vellykket tomliste. Velg deretter en uendret støttet rapport (for eksempel F1), start analyse og gjennomfør kontrollen igjen med ditt eksplisitt registrerte tallgrunnlag. En endret F1-PDF eller annen egen rapport kan være gyldig PDF uten å ha et lagret demosvar. Demo oppfinner ikke et svar.
- **Korrigering:** På et disponibelt F1-case: velg funnet → **Korriger**, skriv et utkast, og prøv **Avbryt**. Ubrukt utkast endrer ikke gjeldende grunnlag. Prøv deretter en liten fiktiv tekstretting og **Bruk korrigering**. Original og brukerkorrigert opphav beholdes; bekreft funnet og listen på nytt. PDF-side må være en faktisk posisjon 1–4. **Avvis** beholder originalen som historikk, tar funnet ut av aktiv liste og er ingen teknisk godkjenning. Avslutt dette disponible caset med sideoppdatering og registrer/kontroller F1 fra start før du igjen bruker originalfasiten.
- **Retur og nytt resultat:** Fra F1-resultat velger du **Endre tallgrunnlag**. Uendret retur bevarer bekreftelser. Endre L til 1400000 med oppdatert kildebeskrivelse; gammelt resultat blir **Utdatert** og kan bare leses som historisk. Bekreft endret tallgrunnlag, gå tilbake til kontroll og beregn på nytt. Uendret rapportuttrekk gjenbrukes; nettoyield blir 6,250 % og anbefalingen Forkast. Dette er en endret F1-finansvariant. Faktisk rapportbytte krever ny analyse og ny funn-/listekontroll. Brukt funnendring krever berørt ny kontroll/listebekreftelse; separat TG3-endring krever gyldig ny TG3-håndtering og nytt resultat.

## Utvikling og tester

Etter installasjon, med demo stoppet:

```sh
npm run dev
```

Åpne **http://127.0.0.1:3000**. Dev bruker Vite-middleware/HMR i samme Express-prosess. Backendendringer krever stopp/start. Avslutt med Ctrl+C før demo/test.

Installer prosjektets Chromium mens nett er tilgjengelig. Playwright kjører browseren lokalt; ingen global Playwright trengs. På Linux kan browserens systembiblioteker måtte forberedes med `npx playwright install --with-deps chromium` (kan kreve administratorrettigheter); Linux-oppskriften er ikke egenprøvd her. Vanlig installasjon:

```sh
npx playwright install chromium
npm run typecheck
npm run lint
npm test
npm run test:components
npm run test:e2e
```

Kjør sekvensielt fra reporoten med port 3000 ledig. `npm run test:e2e` bygger automatisk, starter/stopper først bygget demo og deretter dev. Vitest bruker lokale moduler, ekte fiktive PDF-er og HTTP-integrasjon. Komponenttester viser faktiske React-resultatkomponenter i Chromium. E2E dekker hovedflyt, kontrollporter, feil/retur, originalvisning, nøkkeltall, anbefalinger og fokus/responsivitet. Enkelte spesialutfall bruker en **kontrolladapter ved produktets adaptergrense** eller kontrollerte HTTP-svar; dette er testinnganger, ikke live-KI. Hele testoppskriften krever ingen betalt KI-tjeneste eller nøkkel. Browserforberedelsen krever vanligvis nedlasting; på Linux må nødvendige systembiblioteker også være installert før nettfri testkjøring.

Testene kontrollerer også sentral finans-/terskellogikk og blank/null/feiltilstander mot uavhengig fasit. De beviser ikke manuell lesbarhet, alle hjelpemidler eller live-uttrekkskvalitet. Se [samlet automatisk verifikasjon 5.1](.docs/implementation-artifacts/story-5-1-verifikasjon.md), [manuell UX-kontroll 5.2](.docs/implementation-artifacts/story-5-2-manuell-kontroll.md) og [egen README-gjennomkjøring 5.3](.docs/implementation-artifacts/story-5-3-verifikasjon.md). Egen gjennomkjøring er forberedelse; **annen person i rent miljø/S6 (5.4) er ennå ikke gjennomført**.

Ved Playwright-feil ligger beholdte spor og skjermbilder i `test-results/`. Åpne en faktisk generert `trace.zip` med `npx playwright show-trace <sti-til-trace.zip>`; erstatt plassholderen med filens sti. Disse genererte feilartefaktene er Git-ignorert.

## Struktur og sporbarhet

| Plassering | Ansvar |
|---|---|
| `src/frontend/` | React, midlertidig økt, kontroll, lokale PDF-ressurser og resultatvisning; bruker domain/contracts. |
| `src/domain/` | Rene finans-, validerings- og screeningregler; bruker contracts, ingen UI/server/I/O. |
| `src/contracts/` | Delte runtime-skjema og typer; ingen UI/server/I/O. |
| `src/backend/` | Lokal server, PDF-bytes/identitet/sider/tekst, analysepipeline og lagret demo; [modulbruk](src/backend/README.md). |
| `tests/unit/`, `tests/integration/` | Rene grenser, reell PDF-/HTTP-integrasjon og samlet demo. |
| `tests/e2e/`, `tests/components/` | Bygget app/dev og resultatkomponenter i Chromium. |
| `tests/fixtures/` | Versjonerte fiktive PDF-er og uavhengig fasit; ingen private originaler. |
| `src/backend/analysis/data/` | Rapportbundne lagrede [demosvar og opphav](src/backend/analysis/data/README.md). |
| `.docs/` | Planer, implementerings-/test-/reviewbevis og KI-prosess. |

Private originaler hører til Git-ignorert `private/`. `.env`/`.env.*`, avhengigheter og byggeutdata er ignorert; bare eventuelle hemmelighetsfrie `.example`-filer er tillatt. Demo leser ingen nødvendig miljøfil. Lokal statisk server tilbyr bygget app, ikke reporoten eller private filer.

- Låst grunnlag: [SPEC](.docs/specs/spec-IBE160/SPEC.md), [epics/Story 5.3 AC](.docs/planning-artifacts/epics.md#story-53-dokumentere-en-komplett-oppskrift-for-lokal-demo-og-tester), [arkitektur AD-1–AD-10](.docs/planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md), [DESIGN](.docs/planning-artifacts/ux-designs/ux-IBE160-2026-10-13/DESIGN.md) og [EXPERIENCE](.docs/planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md).
- Fremdrift: [sprintplan](.docs/implementation-artifacts/sprint-plan.md), [gjeldende sprintstatus](.docs/implementation-artifacts/sprint-status.yaml), [5.1-review](.docs/implementation-artifacts/story-5-1-review.md), [5.2-review](.docs/implementation-artifacts/story-5-2-review.md).
- Prosess: [promptlogg og mekanisme](.docs/process/prompts/README.md), [5.3-prompt](.docs/process/prompts/2026-10-22-story-5-3.md), [5.3-arbeidsøkt](.docs/process/arbeidsokter/2026-10-22-story-5-3.md), [forrige mini-sprint](.docs/process/arbeidsokter/2026-10-21-mini-sprint-3-3-3-4.md).
- Kursgrunnlag: [sensorveiledning](.docs/reference/course/Sensorveiledning-IBE160-Del-1.pdf) og [faglærerens brief-tilbakemelding](.docs/planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md).

Gruppeprosjekt i **IBE160 Programmering med KI**, Høgskolen i Molde, høsten 2026. Medlem: Mads Semb Christophersen. Startstrukturen er tilpasset [Vites offisielle react-ts-starter](https://github.com/vitejs/vite/tree/df7503cc499e0b49e45701e3be7546918ee9d322/packages/create-vite/template-react-ts).
