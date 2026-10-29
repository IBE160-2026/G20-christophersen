# Property Acquisition Agent — IBE160, G20

> **Code-first salgsoppgave, 29. oktober 2026:** Generell lokal PDF-analyse supplerer
> den tidligere syntetiske demoen. Eksplisitte felt og funn trekkes ut lokalt;
> uløst rapporttekst sperrer bekreftelse mens live-porten er stengt.
> [Design og kostnadsramme](.docs/planning-artifacts/salgsoppgave-code-first-design-2026-10-29.md).
>
> **Salgsoppgave først, 28. oktober 2026:** Den godkjente offline-flyten er implementert.
> Last opp en syntetisk salgsoppgave før tallbekreftelse, kontroller dokumentøkonomi
> og finansiering, og kontroller integrert eller separat rapport før screening.
> [Krav, nye bevis og begrensninger](.docs/implementation-artifacts/salgsoppgave-implementation-2026-10-28/verifikasjon.md).
> Ny dokumentimport er alltid offline; `ANALYSIS_MODE=live` åpner den ikke.
> FINN beholdes som utsatt alternativ. Historisk S5/S6 gjelder sine opprinnelige versjoner.

Lokal førstevurdering av **ett boligutleieobjekt**, laget for investorens tidlige sortering. Brukeren registrerer og kontrollerer økonomiske forutsetninger, leser tilstandsrapportens original, kontrollerer TG2/TG3-funn og får en kodebestemt anbefaling: **Gå videre**, **Forkast** eller **Innhent mer informasjon**. Beregningene er bruttoyield, NOI, nettoyield og kontantstrøm før skatt. Investoren tar beslutningen; dette er ingen teknisk godkjenning eller komplett investeringsanalyse.

Levert nå: lokal demo med rapportbundne, lagrede uttrekk for fire fiktive rapporter, menneskelig kontroll/korrigering, separat TG3-avklaring og revisjonsbundet resultat. Uttrekkene er kontrollerte fiktive demodata, skrevet for demoen; de stammer ikke fra en faktisk KI-/live-kjøring. Demo er standard og krever **ingen API-nøkkel, miljøfil, konto eller betalt tjeneste**. Live-integrasjonen bruker samme kontroll- og resultatflyt.

**Bevisstatus 27. oktober 2026:** Story 4.4 har [godkjente originale live-/S2-bevis](.docs/implementation-artifacts/story-4-4-b2-uavhengig-sluttreview-2026-10-27.md). Story 4.5/S5 er avsluttet med [aksepterte avvik S5-W1](.docs/implementation-artifacts/story-4-5-s5-waiver-2026-10-27.md), med ufullstendig formell AC-akseptanse og uten validert tidsbesparelse. Ingen nye S5-målinger er planlagt. Annen-person-S6/5.4 er **ikke gjennomført**; 5.5 er delvis klargjort. [Leveringskontrollen](.docs/implementation-artifacts/story-5-5-leveringskontroll-2026-10-27.md) skiller faktiske bevis fra åpne porter. Demo beviser ingen live-kvalitet eller live-tid. Automatisk søk, markedsdata, rangering og lagring mellom økter er utenfor denne smale v1.

**FINN-utvidelse 28. oktober 2026:** Importmotor, kontroll-UI, finansieringsforslag og backendens Responses-kobling er implementert og [offline-verifisert med uavhengig review](.docs/implementation-artifacts/finn-responses-2026-10-28/sluttverifikasjon.md). **Tilgangsgaten er stengt som standard.** [Første implementeringsbevis](.docs/implementation-artifacts/finn-import-2026-10-28/sluttverifikasjon.md) og [tidligere gjennomførbarhet](.docs/implementation-artifacts/finn-import-checkpoint-2026-10-28.md) bevares som historikk. Eksisterende manuell registrering, rapport-PDF og screening beholdes. Ingen estimater, automatisk PDF eller overvåking inngår.

I **Tallgrunnlag**, under **FINN som alternativ**, kan du lime inn en FINN-boliglenke og prøve import. Med standardoppsettet returnerer serveren en gatemelding uten nøkkellesing eller eksternt kall. `ANALYSIS_MODE=live` gjelder bare rapportanalyse og åpner ikke FINN-gaten. SDK-koblingen bruker den eksakte validerte lenken og godtar bare ett fullført `open_page` på denne URL-en. Entydig P fylles automatisk som ubekreftet; kostnader/kilder vises for kontroll, mens ufullstendig D/J forblir ukjent. Manuelle verdier bevares. Rapport-PDF lastes fortsatt opp manuelt.

Den [videre godkjente FINN-2-koblingen](.docs/implementation-artifacts/spec-finn-responses-kobling.md) bruker offisielt SDK og backendens `OPENAI_API_KEY`. Før en kontrollert faktisk UI-prøve må operatøren ha dokumentert tilgang og kostnadsautorisasjon, og konfigurere **alle tre** backendverdiene: `FINN_IMPORT_ENABLED=true`, `FINN_IMPORT_ACCESS_REFERENCE` og `FINN_IMPORT_COST_REFERENCE` med ikke-tomme godkjenningsreferanser. Nøkkelen skal bare ligge i backendmiljøet, aldri i frontend-/Vite-variabler. Referansene er operatørens dokumentasjon, ikke automatisk vurdering av tillatelsen. Ingen gate er åpnet eller reelt oppslag utført i utviklingsøkten.

Serveren tillater én pågående ekstern forespørsel, og høyst ett forsøk per FINN-kode per serverstart, også ved feil/avbrudd. Gjentakelse gir ingen nytt API-kall; nytt forsøk krever bevisst serveromstart og ny sidelasting. Et vellykket utkast hentes ikke på nytt i samme økt. Ingen automatisk retry eller oppfrisking er lagt til. Første live-prøve må kontrollere nytt schema, faktiske handlinger og verdier mot originalannonsen; offline testdata beviser ikke kildekvaliteten. Nye leverings-/S6-bevis må gjelde den utvidede versjonen; historiske bevis beholdes.

## Installer og start demo

Bruk et lokalt utsjekket repo og en terminal i **reporoten** (mappen som inneholder `package.json`). Forutsetninger er **Node.js 24.21.0 og npm 11.19.0**, låst i `package.json`, `package-lock.json` og `.nvmrc`. Installer denne Node-versjonen med tilhørende npm; bruker du allerede nvm, kan du kjøre `nvm install` og `nvm use`. nvm er ikke påkrevd. Ingen global Vite, Python, database, Docker eller egen frontendserver trengs for demo/test.

```sh
node --version
npm --version
npm ci
npm run build
ANALYSIS_MODE=demo npm run demo
```

De to første kommandoene skal vise `v24.21.0` og `11.19.0`. `npm ci` installerer nøyaktig fra låsfilen og erstatter eksisterende `node_modules`. Installasjon kan kreve nett til npm-registeret. Åpne **http://127.0.0.1:3000** i en moderne nettleser. Du skal se Tallgrunnlag og **Demo · lagret KI-uttrekk**. Én Express-prosess serverer bygget `dist/`, API og PDF-/worker-/fontressurser lokalt. Etter installasjon kan build og hele demoen kjøres med eksternt nett sperret; behold tilgang til lokal loopback.

Stopp med **Ctrl+C** i serverterminalen. Port 3000 må være ledig; serveren velger ikke en annen port. Ved «Bygget app mangler» kjører du `npm run build`. Ved opptatt port stopper du din tidligere demo/dev/testserver før ny oppstart. Ikke kjør dem samtidig. Oppdatering/lukking av siden avslutter den midlertidige økten, inklusive tall, rapport, kontroll og resultat; ingen brukerdata lagres.

Oppskriften er egenprøvd på macOS 26.6.2 arm64; andre plattformer er ikke egenprøvd. npm kan varsle om det valgfrie installasjonsscriptet til `fsevents@2.3.3` på macOS. Vite kan varsle om stor chunk; faktisk exitstatus og testresultat må fortsatt kontrolleres.

## Prøv salgsoppgave fra opplasting til resultat

Bruk [syntetiske salgsoppgaver](tests/fixtures/sales-prospectus/README.md).
Ukjente PDF-er går gjennom generell lokal analyse; de har ingen lagret
AI-analyse. Kundedokumenter skal ikke legges i repoet.
Importen bruker en egen versjonert grense på **200 fysiske sider**, **50 MiB per fil
og samlet beholdt salgsoppgave + separat rapport**. Den gamle manuelle rapportruten
beholder **30 sider**. Dokumentnavn og trykt sidetall erstatter aldri fysisk PDF-side.

1. Velg `mixed-12.pdf` i **Last opp salgsoppgave** øverst i Tallgrunnlag.
   Lesingen starter uten P/L/D/J/Ymin. P=3200000 fylles automatisk **ubekreftet**.
   Kontantbehovet er 3075000; dokumentavgiften inngår allerede i omkostningene.
   Kjent driftssubtotal er 60000/år og fellesgjeldsbetaling 12000/år, men full D
   forblir ukjent til innholdet er kontrollert. Foto på fysisk side 3 forblir ulest.
2. Åpne økonomifeltene og sammenlign hvert belegg med **Vis originalkilde**.
   Kontroller beløp, periode/år, inkludering og gjeldsdel. Marker hvert relevant felt
   og bekreft at hele driftsinnholdet er med **bare i denne tydelig fiktive varianten**.
   Ingen fraværende avgift eller leie beregnes automatisk.
3. Prøv finansieringen: egenkapital 1000000 viser slideren; flytt den til 0.
   Sett rente 0 %, løpetid 300 måneder og år 2026. Velg **Bruk kontrollert
   dokumentgrunnlag og finansiering**. Fasit: P=3200000, D=60000, J=135000.00
   (3075000/300×12 + 12000). J merkes som egen forutsetning. Ingen tall bekreftes
   automatisk. Manuelle P/D/J-rettinger beholdes ved senere bruk av importen.
4. Oppgi L=400000/år i 2026 med forventet leie og egen begrunnet forutsetning,
   samt Ymin=7 med eget kildegrunnlag. Kontroller og bekreft tallene.
5. I Tilstandsrapport kontrollerer du rapportens tilhørighet mot originalen og
   hele området, fysisk side 5–12. **Gå til Kontroller funn** viser to ulike bad
   og ett takforhold med flere belegg. Taket ligger på fysisk 10 / trykt 6;
   sammendragets fysiske side 2 er et ekstra belegg for samme forhold.
6. Kontroller og bekreft enkeltfunn. Velg **Avklart** med en uttrykkelig fiktiv
   begrunnelse og konkret eksternt avklaringsgrunnlag for taket, bekreft listen
   og beregn resultatet: **Gå videre**. Med L=100000 og ny relevant bekreftelse
   blir utfallet **Forkast**. Med TG3 **Uavklart** blir det **Innhent mer informasjon**.

`attached-report-6.pdf` viser navn på ubehandlet PDF-vedlegg; last deretter opp
`separate-report-4.pdf` i **Last opp separat tilstandsrapport**. Økonomien beholdes,
mens rapportkontroll/TG3 må gjøres på nytt. Identiteten er ukjent i disse fiktive
filene og krever eksplisitt kontroll mot begge originaler. Takets kilde åpner
**separat fysisk side 3 / trykt 1**. `scanned-report-12.pdf` og
`raster-footer-12.pdf` blokkerer komplett rapportgrunnlag; digital bunntekst gjør
ikke rasterrapporten lest. `ambiguous-12.pdf` krever en entydig separat rapport.
`bounded-200.pdf` beholder 200 sidestatuser, men velger bare økonomi/sammendrag
og hele rapporten 5–12 til det kombinerte grunnlaget.

Ny salgsoppgavehash tømmer hele det tidligere objektet. Samme hash i samme
aktive versjons-/moduskontekst gjenbruker vurderingen, også ved nytt filnavn.
Sidelasting avslutter økten. Backend beholder ingen originaler eller tekst mellom
requests. Ingen OCR, automatisk vedleggsutpakking, betalt kall, token-count-tjeneste
eller live-fallback inngår. Lokal frist er 60 s; tekstgrensene er 128 KiB/side og
1 MiB samlet UTF-8, svargrensen 8 MiB. PDF-barnet har 256 MiB V8-heap, og
forelderen stopper ved målt RSS over 512 MiB. RSS er best effort, ingen hard
OS-garanti mot korte native topper. Hele prosessen stenges før behandlingslåsen
frigis. Ingen tokenbasert live-kapasitet eller reell kildekvalitet er validert.

### Code-first analyse av ukjente PDF-er

Samme opplasting leser alle sider lokalt med PDF.js og bygger et manifest over
originale tekstintervaller. Kode finner rapportgrenser, identitetskandidater,
eksplisitte økonomifelter og TG2/TG3 i støttede tekstmønstre. Tall og funn er
ubekreftet og beholder hash, fysisk side og ordrett kilde. Uklar rapportgrense,
identitet, raster eller ubehandlede vedlegg gir synlige mangler.

All uløst tekst i det sikre rapportområdet beholdes til semantisk behandling,
også avsnitt uten TG-nøkkelord. AI-grensen bruker én kompakt strict request per
dokument og returnerer referanser til originaltekst. Kode avstemmer hver
blokk og TG-kandidat; manglende eller ufullstendig svar sperrer bekreftelse.
Manifestet hindrer tap ved filtrering, men beviser ikke modellens semantiske
treffrate. Eksisterende originalkontroll, finans og screening gjelder fortsatt.

Godkjent modell er **GPT-6.1 Sol**, reasoning low og Standard. Samlet ramme er
**USD 0,20 per analyse**, inklusive separat rapport, med opptil 40 000
inputtokens og 8 000 outputtokens inklusive reasoning per request. Hele
requesten skal telles før reservasjon. USD 0,04–0,08 er regneeksempler for
10–20k input og 2–4k output, ikke målt gjennomsnitt. Budsjettbrudd gir stopp,
aldri avkorting eller automatisk nytt kall.

**Ny live-import er fortsatt stengt.** Det finnes ingen verifisert lokal
modelltilpasset teller for hele requestens framing. Ukjent teller/pris eller
manglende forbrukshistorikk sperrer transport. SDK-grensen testes bare med
injisert offline-transport og tydelig merket testteller; den oppretter ingen
produksjonsklient i opplastingsruten. Lokale uttrekk koster ingen modellbruk.
Når semantikk er nødvendig, viser appen restgrunnlaget og manglende estimat,
og tillater ikke rapportbekreftelse. `ANALYSIS_MODE=live` åpner ikke denne
porten. Første live-test krever ny godkjenning og underbygget preflight.

Offline klargjøring kjøres fra reporoten med `npm run prepare:live-test`.
Den lagrer eksakt SDK-request og kontrollpakke i ignorert
`private/salgsoppgave-live-preflight/`, uten nøkkellesing eller eksterne kall.
Eksisterende budsjettjournal under `private/analysis-budgets/` må være
initialisert én gang for den nye analysen; kommandoen initialiserer eller
nullstiller aldri historikk. Manglende/korrupt historikk og ukjent lokal
tokenteller gir `ready: false`. Reservasjoner beholdes ved omstart og deles
med separat rapport. Krasjlåser krever manuell avstemming, aldri automatisk
ny kvote. Det finnes ingen live-bryter i klargjøringskommandoen.

Den frosne femsiders originalen har separat økonomi-/TG-fasit og negative
sammenligningstester. Den er en syntetisk teknisk prøve, ingen representativ
produksjonsbenchmark. [Klargjøring og gjenværende porter](.docs/implementation-artifacts/salgsoppgave-live-preflight-2026-10-29/verifikasjon.md).

## Prøv F1–F4 fra start til resultat

For en enkel offline-prøve etter installasjon: installer også Chromium først hvis testene skal kjøres, slå deretter av Wi-Fi/koble fra Ethernet og behold localhost tilgjengelig. Registrer hvordan nett ble sperret i et faktisk S6-forsøk. Installasjonens nettbehov er ikke en del av offline-demoen.

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
ANALYSIS_MODE=demo npm run dev
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

Kjør sekvensielt fra reporoten med port 3000 ledig. `npm run test:e2e` bygger automatisk, starter/stopper først bygget demo og deretter dev. Vitest bruker lokale moduler, ekte fiktive PDF-er og HTTP-integrasjon. Komponenttester viser faktiske React-resultatkomponenter i Chromium. E2E dekker hovedflyt, kontrollporter, feil/retur, originalvisning, nøkkeltall, anbefalinger og fokus/responsivitet. Enkelte spesialutfall bruker en **kontrolladapter ved produktets adaptergrense** eller kontrollerte HTTP-svar; dette er testinnganger, ikke live-KI. Playwright-serverne tvinger `ANALYSIS_MODE=demo` og tom `OPENAI_API_KEY`, også når terminalen har arvet live-miljø. Bygg-/oppstartskontrollen bruker eksplisitt demo og en fiktiv nøkkelsentinel for lekkasjekontroll. Hele testoppskriften krever ingen betalt KI-tjeneste eller nøkkel. Browserforberedelsen krever vanligvis nedlasting; på Linux må nødvendige systembiblioteker også være installert før nettfri testkjøring.

Testene kontrollerer også sentral finans-/terskellogikk og blank/null/feiltilstander mot uavhengig fasit. De beviser ikke manuell lesbarhet, alle hjelpemidler eller live-uttrekkskvalitet. Se [samlet automatisk verifikasjon 5.1](.docs/implementation-artifacts/story-5-1-verifikasjon.md), [manuell UX-kontroll 5.2](.docs/implementation-artifacts/story-5-2-manuell-kontroll.md) og [egen README-gjennomkjøring 5.3](.docs/implementation-artifacts/story-5-3-verifikasjon.md). Egen gjennomkjøring er forberedelse; **annen person i rent miljø/S6 (5.4) er ennå ikke gjennomført**.

Ved Playwright-feil ligger beholdte spor og skjermbilder i `test-results/`. Åpne en faktisk generert `trace.zip` med `npx playwright show-trace <sti-til-trace.zip>`; erstatt plassholderen med filens sti. Disse genererte feilartefaktene er Git-ignorert.

## Valgfri live-kjøring

Demooppskriften ovenfor er komplett alene. Live krever egen OpenAI API-tilgang og kan koste penger. Valgt modell er **gpt-6.1-sol**, Responses API og reasoning `low`. Ett leverandørkall sendes per godkjent analyseforsøk, uten automatisk retry; et nytt forsøk i en ny økt kan koste på nytt selv for samme rapport. Kontroller modelltilgang og godkjent restbudsjett før du starter analyse; [R1](.docs/planning-artifacts/r1-live-ki-semester-v1.md) og [de faktiske forsøkene](.docs/implementation-artifacts/story-4-4-b2-sluttkontroll-2026-10-27.md) dokumenterer datert kostnadsgrunnlag, ikke et løfte om dagens pris eller kontosaldo.

Stopp demo/dev/testserveren. Kopier den hemmelighetsfrie eksempelfilen:

```sh
cp .env.example .env
```

Rediger `.env` lokalt: behold `ANALYSIS_MODE=live` og sett din egen `OPENAI_API_KEY`. Filen er Git-ignorert. Nøkkelen skal bare ligge i backendmiljøet, aldri i frontend/Vite-variabler, skjermbilder eller delte logger. Start deretter:

```sh
npm run build
env -u OPENAI_API_KEY -u ANALYSIS_MODE node --env-file=.env src/backend/server.ts
```

Åpne samme lokale adresse og kontroller **Live analyse** før du velger en rapport og eksplisitt **Start analyse**. Dokumentfasen har egen 60 s-frist; etter godkjent dokumentgrunnlag har live-fasen 120 s. Avbrudd beviser ikke at leverandørens behandling/belastning stoppet. Feil vises lokalt; ingen demo-fallback eller automatisk nytt kall brukes. Manglende nøkkel gir trygg analysefeil. Det finnes ingen nett-/nøkkelkonfigurasjon i appen.

Serveren leser ikke `.env` automatisk: `--env-file` gjør det i kommandoen over. Allerede eksporterte variabler har forrang over miljøfilen; `env -u` fjerner derfor arvet nøkkel/modus fra denne oppstarten, slik at valgt `.env` gjelder. Kommandoen er for den dokumenterte macOS-/POSIX-terminalen. For å gå tilbake til demo, stopp live-serveren og kjør:

```sh
ANALYSIS_MODE=demo npm run demo
```

Bare eksplisitt Start analyse kan utløse det betalte uttrekket; tallberegning og ny screening fra uendret rapport er lokale. Se [backendgrensen](src/backend/README.md) for kontrakter og feil-/timeoutdetaljer.

## Struktur og sporbarhet

Se også [pre-submission quality gate](.docs/implementation-artifacts/pre-submission-quality-gate-2026-10-27.md), [UI før/etter og review](.docs/implementation-artifacts/sluttforing-2026-10-27-review.md), [S6-forberedelse](.docs/implementation-artifacts/story-5-4-forberedelse-2026-10-27.md), [kort ekstern instruks](.docs/implementation-artifacts/story-5-4-ekstern-instruks.md), [leveringskontroll](.docs/implementation-artifacts/story-5-5-leveringskontroll-2026-10-27.md) og [arbeidsøkt](.docs/process/arbeidsokter/2026-10-27-kontrollert-sluttforing.md).

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
