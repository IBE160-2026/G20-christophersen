# Lokale publiserte leiereferanser

Kontrollert 5. november 2026. Oppdrag og avgrensninger: [spesifikasjon](spec-lokalt-leiegrunnlag.md). Maskinlesbare data: [20 manuelt registrerte observasjoner](../../src/backend/rent/data/published-rents.json). Publiserte beløp er referanser til grupper, ikke dokumentasjon på leie for en bestemt adresse.

## Kildeundersøkelse

[Utleiemeglerens kommunikasjonsside](https://www.utleiemegleren.no/om-utleiemegleren/kommunikasjon) beskriver statistikk fra inngåtte kommersielle kontrakter. [NTBs presserom](https://kommunikasjon.ntb.no/presserom/89986/utleiemegleren/r) er undersøkt sammen med de enkelte meldingene; presserommets søkeindekserte oversikt var eldre enn den nyeste enkeltmeldingen.

Nyeste relevante melding funnet var [3. november 2026, oktoberstatistikk](https://kommunikasjon.ntb.no/pressemelding/19126477/leieprisveksten-er-na-pa-sitt-laveste-niva-hittil-i-ar?lang=no&publisherId=89986): årsvekst Bergen 7,5 % og Oslo 5,5 %, alle boligtyper. Den skiller ikke aktive og nye kontrakter. Ingen absolutt månedspris er oppgitt; vekst beholdes som kontekst med `metric=annual-change-percent`. Veksten brukes aldri til prisfremskriving.

[7. mai 2025](https://kommunikasjon.ntb.no/pressemelding/18518365/bydel-st-hanshaugen-i-oslo-har-norges-hoyeste-leiepriser?lang=no&publisherId=89986) har toromsbeløp: Bergen 13 900, Bergenhus 16 300, Arna 10 950; Oslo 17 500, St. Hanshaugen 19 195, Frogner 19 000 og Stovner 12 600 kr/mnd. Fotnoten blander FINN-annonser fra mars/april 2025 med porteføljen. Populasjonen registreres derfor som `advertisements-and-portfolio`, ikke nye kontrakter. Gjennomsnittsareal 46 m² i Bergen og 42 m² i Oslo gjelder byreferansene; det gir ingen individuell arealmodell. Porteføljens observasjonsperiode, nøyaktig utvalgsstørrelse og kildenes vekter er ukjent.

[8. januar 2026](https://kommunikasjon.ntb.no/pressemelding/18767369/prisrekord-flere-toroms-leiligheter-i-oslo-har-bikket-25-000-kroner-i-maneden?lang=no&publisherId=89986) beskriver blant annet særskilt dyre toromsutleier. Dette er ytterpunkter uten representative utvalg eller sammenlignbart areal og brukes ikke som gjennomsnittsreferanser.

[Hybels offentlige side](https://boligutleie.hybel.no/leiepris) og [Husleiebarometeret Q3 2026](https://boligutleie.hybel.no/hubfs/Husleiebarometeret%20Q3%202026%20kl.%2012_00.pdf?hsLang=nb) gir følgende kr/mnd for aktive kontrakter:

| Geografi | 1 rom | 2 rom | 3 rom | Fysisk PDF-side |
|---|---:|---:|---:|---:|
| Bergen, by/tettsted | 10 514 | 13 891 | 16 759 | 16 |
| Oslo, by/tettsted | 11 727 | 16 267 | 20 382 | 10 |
| Gamle Oslo, postnummerkoblet bydel | 12 213 | 16 661 | 20 426 | 14 |

Bydelscellene publiseres først fra 30 aktive kontrakter; eksakt antall og arealfordeling mangler. Side 13 gir Gamle Oslo 14 430 for aktive og 15 510 for nye kontrakter, som likevektede snitt av fire boligtyper. Disse er bare kontekst, ikke treromspriser. Metoden på side 24 skiller aktive fra kontrakter inngått i kvartalet. Publiseringsdato er [lanseringsdato 6. oktober 2026](https://kommunikasjon.ntb.no/pressemelding/19093349/ingen-nedbremsing-i-leiemarkedet?lang=no&publisherId=17849481); PDF-variantens egen revisjonsdato er ikke oppgitt. Pressemeldingen avviker én krone fra PDF/nettside for Oslo toroms; datasettet følger den identifiserte PDF-en, uten å blande verdiene.

PDF-sidene 10, 13, 14, 16 og 24 er rendret med PDFKit. Alle fem sider er kontrollert visuelt sammen med tabelluttrekket. Kontrollert PDF har SHA-256 `452d0bfce761a7e913aa611e3ef9cc486a845642e5f4b8c253441161f4b61aef`. Hele rapporten og bildene lagres bare midlertidig utenfor repoet.

## Modell og beregning

`local-rent-1` gjør følgende i vanlig kode:

1. Bevar dokumentets kildebundne adresse, kommune, bydel, BRA-i/BRA/P-ROM, totale rom og soverom. Mangler, reell motstrid og annen boligtype sperrer automatisk valg.
2. Match kommune til grov byreferanse og totalt romantall til romgruppe. Kommune er ikke bevis på plassering innen kildens by/tettsted. Bydel brukes bare når eksplisitt dokumentert; det gjøres ikke adressegeokoding. Bergenhus antas ikke fra Nøstegaten-navnet.
3. Velg kontraktsreferanse med samme boligtype og rom, først geografisk spesifisitet, deretter publiseringsdato. Blandede boligtyper, vekst og blandet annonse/portefølje blir ikke hovedreferanse. Originalverdien beholdes. Tall eldre enn tre kalenderår velges ikke som hovedreferanse; dette er et produktvern, ingen dokumentert usikkerhetsmodell. Fremtidige publiseringer/perioder utelates.
4. Areal brukes separat i SSB-sammenligningen. Innenfor samme romgruppe brukes faktiske nabopunkter og lineær vekt `(dokumentareal − nedre areal)/(øvre areal − nedre areal)`. Ved høyst 2 m² utenfor ytterpunktet vises den dokumenterte, uendrede ytterpunktstilnærmingen. Større avstand og ukjent celle gir ingen SSB-verdi. Denne tidligere dokumenterte PAA-regelen er en tilnærming, ikke en adresseprediksjon fra SSB.
5. SSBs soneverdier vises separat fra de øvrige kildene. Ved ukjent bydel er sammenligningspunktet midt mellom laveste og høyeste sone, uten sannsynlighetsvekting. Punkt avrundes til nærmeste 100 kr; sonespennet avrundes utover. Tidligere prosentmarginer er fjernet. Et spenn med én sone kan ha lik nedre og øvre verdi; det sier ingenting om individuell usikkerhet.
6. Ingen beløpsblanding, inflasjonsjustering, forholdstall mellom aktive/nye kontrakter eller påslag for areal, standard, beliggenhet, utsikt eller etasje. Individuell markedsleie returneres eksplisitt som utilgjengelig med `monthly=null`. Manglende individuell usikkerhet kan ikke uttrykkes som et validert intervall.
7. Eksisterende ubekreftet økonomiscenario kan bruke SSB-sammenligningen i statistikkåret, tydelig merket. Publiserte romreferanser blir ikke automatisk kontraktsinntekt. Registrert manuell/faktisk leie og konflikt har fortsatt prioritet. Screeningbekreftelse, komplett drift og samme-år-regler endres ikke.

## Lokal drift og vedlikehold

Alle 20 nye observasjoner valideres ved modullasting. SSBs allerede kontrollerte råresponser fra 4. november er kopiert uendret fra testarkivet til produksjonsdata: `09897-metadata.json` og `09897-2025.json`, siste kildeoppdatering 22. desember 2025. Datafilens SHA-256 er `d7551efd6ed23857f67228f68f60db6f6c015e8118d934491a2ed3674f3a3911`. 400 offentlige SSB-celler utgjør bare 7,7 kB og bevarer eksisterende geografiske dekning. Dette er [SSB 09897](https://www.ssb.no/statbank/table/09897/), en selvstendig modellberegnet statistikk fra leiemarkedsundersøkelsen, ikke en gjennomsnittspris hentet fra Hybel/Utleiemegleren. [Tidligere kilde- og metodekontroll](leieagent-ssb-research.md).

Ved bruk gjør leiemodulen ingen HTTP-/API-/modellkall. Kildelenker åpnes bare ved brukerens klikk. Beregningstidspunkt er ikke kildeoppdatering. En oppdatering gjøres manuelt i en senere utviklingsøkt: kontroller et lite relevant kildeutvalg, behold datoperiode/populasjon og manglende verdier, før kilde-/revisjonsbevis, oppdater datasettversjon og tester, og commit lokalt etter verifikasjon. Ingen innhentingsskript eller automatisk oppdateringsjobb er bygget.

Kildene er offentlig tilgjengelige, men det er ikke påstått noen generell fri lisens til Hybels eller Utleiemeglerens rapportverk. Utdraget begrenses til enkelte numeriske fakta med egne beskrivelser og kildeangivelse; ingen artikler, bilder, kontrakter eller hele rapporter gjenpubliseres. SSB-data beholder kildeangivelse og CC BY 4.0 som dokumentert i den tidligere kildekontrollen. Endring av omfang må vurderes mot kildenes vilkår på nytt.

Faktiske boligresultater og kjørte tester: [arbeidsøkt](../process/arbeidsokter/2026-11-05-lokalt-leiegrunnlag.md). Åpen individuell kalibrering følges kun i [sentral avviksoversikt](deferred-work.md).
