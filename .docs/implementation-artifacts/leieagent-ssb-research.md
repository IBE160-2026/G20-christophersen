# Leieagent: verifisert datagrunnlag fra SSB

Undersøkt 4. november 2026. Gratis, offentlige HTTP GET-kall uten API-nøkkel eller modellkall. Dette notatet beskriver datatilgang og metodebegrensninger; det er ikke dokumentasjon på leieinntekt for en konkret eiendom.

## Kilder og faktisk tilgang

- [SSBs API-oversikt](https://www.ssb.no/api/pxwebapi) anbefaler PxWebApi v2 fremfor v1.
- [SSBs brukerveiledning](https://www.ssb.no/api/pxwebapiv2): JSON-stat2 er standardformat; GET og POST støttes. Oppgitt grense er 800 000 celler per uttrekk og 30 kall per minutt per IP. CC BY 4.0 gjelder. Tabellene kan være midlertidig utilgjengelige ved oppdatering; 0/prikk kan forekomme under revisjon. Agenten bør mellomlagre svar og håndtere 429/feil uten automatisk kallstorm.
- [Leiemarkedsundersøkelsen](https://www.ssb.no/lmu): seneste publisering 22. desember 2025; neste varslede publisering 21. desember 2026. Tallene gjelder et årlig nivå, ikke dagens annonserte nyutleiepris.

Disse endepunktene ble hentet direkte og svarte HTTP 200:

```text
GET https://data.ssb.no/api/pxwebapi/v2/tables/09897/metadata?lang=no
GET https://data.ssb.no/api/pxwebapi/v2/tables/09895/metadata?lang=no
```

Begge metadataresponser oppgir `updated: "2025-12-22T07:00:00Z"` og årskoder `2012`–`2025`. Siste tilgjengelige år skal bestemmes fra metadata, ikke hardkodes til inneværende år.

## Tabell 09897: førstevalg for enkeltleilighet

[Predikert månedlig leie](https://www.ssb.no/statbank/table/09897) inneholder SSBs modellberegnede leier etter område, rom og areal. Den har **ingen adressebasert oppslagstjeneste**, individuelle leiekontrakter, tilstandsvariabel eller publisert individuelt prediksjonsintervall.

| Variabelkode | Tilgjengelige verdier |
| --- | --- |
| `Soner2` | 16 prissoner, se nedenfor |
| `AntRomBRA` | 25 kombinasjoner av rom og bruksareal |
| `ContentsCode` | `Husleie` (kr per måned) |
| `Tid` | `2012`–`2025` ved kontrollen |

| Soner2-kode | Område |
| --- | --- |
| `01.01` | Oslo: Sentrum, Frogner, Ullern, St. Hanshaugen |
| `01.02` | Oslo: Grünerløkka, Gamle Oslo, Sagene, Nordre Aker, Vestre Aker |
| `01.03` | Oslo: Østensjø, Nordstrand, Bjerke |
| `01.04` | Oslo: Søndre Nordstrand, Grorud, Stovner, Alna |
| `03.01` | Bergenhus |
| `03.02` | Øvrige bydeler i Bergen |
| `04.01` | Trondheim: Midtbyen, Østbyen, Nedre Elvehavn |
| `04.02` | Trondheim: Lerkendal, Heimdal |
| `05.00` | Stavanger |
| `06.00` | Kristiansand |
| `07.00` | Tromsø |
| `02.01` | Akershus: kommuner nær Oslo |
| `02.02` | Utkant Akershus |
| `20.00` | Tettsteder med minst 20 000 innbyggere |
| `21.00` | Tettsteder med 2 000–19 999 innbyggere |
| `22.00` | Tettsteder med 200–1 999 innbyggere |

Geografien er en egen SSB-inndeling. Metadata for `02.01` viser eldre kommunenavn (Ski, Nesodden, Oppegård, Bærum, Asker, Lørenskog, Skedsmo); kommunereform gjør direkte sammenkobling med dagens kommunenummer usikker. Poststed er heller ikke tilstrekkelig for bydel eller tettstedsklasse. Ikke tilordne en ukjent adresse til en presis bysone ved antakelse.

`AntRomBRA`-kodene:

| Romgruppe | Koder og areal i m² |
| --- | --- |
| 1 rom | `1.015`, `1.020`, `1.030`, `1.040`, `1.050` |
| 2 rom | `2.030`, `2.040`, `2.050`, `2.060`, `2.070` |
| 3 rom | `3.060`, `3.070`, `3.080`, `3.090`, `3.100` |
| 4 rom | `4.080`, `4.090`, `4.100`, `4.120`, `4.140` |
| 5–8 rom | `5.100`, `5.120`, `5.140`, `5.160`, `5.180` |

Rom betyr sove- og oppholdsrom; kjøkken, bad og boder inngår ikke. Soverom er dermed ikke samme felt som antall rom. BRA-i er et forsvarlig eksplisitt merket grunnlag for en moderne leilighet; BRA-total inkludert eksterne boder/terrasse må ikke brukes ukritisk.

### Reproduserbart eksempel

En 2-roms på 50 m² i Stavanger, statistikkår 2025:

```text
GET https://data.ssb.no/api/pxwebapi/v2/tables/09897/data?lang=no&valueCodes%5BSoner2%5D=05.00&valueCodes%5BAntRomBRA%5D=2.050&valueCodes%5BContentsCode%5D=Husleie&valueCodes%5BTid%5D=2025
```

Kontrollert responsutdrag:

```json
{
  "id": ["Soner2", "AntRomBRA", "ContentsCode", "Tid"],
  "size": [1, 1, 1, 1],
  "value": [12200],
  "updated": "2025-12-22T07:00:00Z"
}
```

Alle 400 kombinasjoner for 2025 ble også hentet:

```text
GET https://data.ssb.no/api/pxwebapi/v2/tables/09897/data?lang=no&valueCodes%5BSoner2%5D=%2A&valueCodes%5BAntRomBRA%5D=%2A&valueCodes%5BContentsCode%5D=Husleie&valueCodes%5BTid%5D=2025
```

Responsen hadde `size: [16,25,1,1]`, 400 positive numeriske verdier og ingen nullceller. Rårespons: 7 676 byte, SHA-256 `d7551efd6ed23857f67228f68f60db6f6c015e8118d934491a2ed3674f3a3911`. Fravær av nuller i denne årgangen er ikke en garanti for senere kall.

## Tabell 09895: grovere sammenligningsgrunnlag

[Gjennomsnittlige leier](https://www.ssb.no/statbank/table/09895) har `Soner2`, `AntRom`, `ContentsCode` og `Tid`. `AntRom` er `1`, `2`, `3`, `4`, `5+`; innholdskodene er `Husleie` (månedlig kr) og `Husleiear` (årlig kr/m²). Det siste er **ikke månedlig kvadratmeterleie**.

Sonene er `00` hele landet, `01` Oslo og Bærum, `02` Akershus uten Bærum, `03` Bergen, `04` Trondheim, `05` Stavanger og `20`/`21`/`22` tettstedsklasser. Disse har andre avgrensninger enn 09897. For 09895 ekskluderer `20` Oslo, Bergen, Trondheim, Stavanger og Akershus; `21` og `22` ekskluderer Akershus. `22` omfatter også spredtbygde strøk.

```text
GET https://data.ssb.no/api/pxwebapi/v2/tables/09895/data?lang=no&valueCodes%5BSoner2%5D=%2A&valueCodes%5BAntRom%5D=%2A&valueCodes%5BContentsCode%5D=%2A&valueCodes%5BTid%5D=2025
```

Kontrollert HTTP 200: `size: [9,5,2,1]`, 90 celler, hvorav 18 `null` med status `..`. Eksempel: hele landet, 2 rom gir månedlig leie **11 790 kr** og årlig leie per m² **3 040 kr**. Stavanger 1 rom mangler begge verdier. Null/prikk må behandles som utilgjengelig, aldri 0.

Rårespons: 4 420 byte, SHA-256 `672dc89d7a66dcece1a17cce716cf6af9a7d089f27b01957004cc6d5ebe3cfc5`.

Offentlige, uendrede råresponser for 09897 er lagret i `tests/fixtures/ssb/09897-metadata.json` og `tests/fixtures/ssb/09897-2025.json`. De inneholder ingen eiendomsopplysninger og brukes som deterministisk fasit i `tests/unit/ssb-rent.test.ts`. SHA-256 over datafilen samsvarer med verdien over. 09895 ble undersøkt som alternativ, men brukes ikke i klientens beregningsformel.

## Metodevalg og grenser for første implementasjon

SSBs [metodebeskrivelse](https://www.ssb.no/lmu#om-statistikken) beskriver en utvalgsundersøkelse med variasjon mellom boliger og år. 09897 gjelder umøblert bolig uten tillegg for balkong, garasje, strøm eller oppvarming. Modellens forklaringsgrad oppgis til omtrent 63 prosent. API-et gir ingen informasjon som støtter presise individuelle standard-, utsikts- eller etasjepåslag.

Anbefalte regler for agenten (prosjektets metodevalg, ikke SSBs modell):

1. Bruk dokumentert adresse/kommune, internt bruksareal, rom og boligtype med sidereferanse. Motstridende eller flerboligopplysninger må gi eksplisitt avgrensning. Bevar opprinnelig kilde og felttype.
2. Hent metadata og siste år automatisk. Les JSON-stat-dimensjonene; ikke anta at `value[0]` alltid er riktig celle eller at dimensjonsrekkefølgen er fast.
3. Foretrekk 09897. Mellom to arealpunkter i samme romgruppe kan lineær interpolasjon brukes med begge celler og formel synlig. Inntil og med 2 m² utenfor romgruppens ytterpunkt brukes nærmeste publiserte celle uendret før vanlig avrunding, med eksplisitt tilnærmingsmerking. Større avvik avvises. Det er ingen lineær ekstrapolasjon.
4. Uavklart bydel kan representeres ved flere aktuelle bysoner og et spenn som inkluderer dem, merket grov geografisk tilpasning. Nasjonale tall fra 09895 er et grovt sammenligningsgrunnlag, ikke lokal adressepris. Ikke lag landsgjennomsnitt ved å ta uvektet gjennomsnitt av 09897-sonene.
5. Vis punktestimat avrundet til hundrekroner og et romslig **scenariointervall**. Prosentsatser valgt i prosjektet må være synlige, begrunnede og merkes som foreløpige, ukalibrerte metodeantakelser. Øk bredden når geografi, arealgrunnlag eller datadato er usikre. Ikke kall intervallet 95 prosent konfidens- eller prediksjonsintervall uten empirisk kalibrering.
6. SSBs oppgitte 95 prosent/10 prosent publiseringskriterium gjelder usikkerhet om **gjennomsnittsleien** i 09895; det beskriver ikke hvor 95 prosent av enkeltleilighetenes leie ligger.
7. Oppgi statistikkår, hentetid, tabell-ID, koder, råceller, interpolasjonsvekter, avrunding, metodeversjon og begrensninger. Ingen automatisk prisvekstfremskriving uten eget datagrunnlag.
8. Hold dokumentert/faktisk leie adskilt fra salgsoppgavens forventede leie og agentens statistiske estimat. Et SSB-estimat skal bare tilføre scenarioforutsetning og må ikke bli en bekreftet leiekontrakt eller overstyre dokumentert leie/styrte brukerantakelser.

Liveundersøkelsen benyttet kun SSBs offentlige tjenester. Ingen betalte API-kall ble utført. Eventuelle videre forbedringer må føres i prosjektets sentrale `deferred-work.md`, ikke som egen saksliste i dette notatet.

## Implementert første metode

`src/backend/rent/ssb-rent.ts` bruker 09897 for Oslo, Bergen, Trondheim, Stavanger, Kristiansand, Tromsø og de historisk entydige kommunene Bærum, Nesodden og Lørenskog. Asker, Nordre Follo og Lillestrøm tas ikke automatisk med, fordi sammenslåingene ikke passer entydig til metadataenes eldre geografiske avgrensning. Ukjent kommune blir ikke gjettet fra et poststed.

Punktet er midten mellom laveste og høyeste aktuelle soneverdi etter arealinterpolasjon. Foreløpig intervallmargin er 25 prosent pluss 10 prosentpoeng ved ukjent bydel, 5 ved BRA/P-ROM i stedet for BRA-i og 5 per år etter statistikkåret og 5 ved ytterpunktstilnærming. Nedre grense beregnes fra laveste sone og øvre fra høyeste. Marginen begrenses til 75 prosent, og data eldre enn tre år avvises. Dette er et transparent produktvalg uten empirisk kalibrering; intervallet innebærer ingen bestemt dekningssannsynlighet. Punkt avrundes til nærmeste hundre, grenser utover til hundre. Årsleie er avrundet månedsleie ganger tolv.

Metadata og siste-årsdata mellomlagres i minnet i 15 minutter, maksimalt åtte offentlige responser. Injiserte testtransporter deler ikke hurtigbuffer. Hvert kall har åtte sekunders frist og grense på 256 KiB; JSON-stat-ID, størrelse og kategoriindeks valideres før bruk. Bare offentlige tabellkoder sendes til SSB.

Verifisert 4. november 2026: ti målrettede unit-tester (råcelle, interpolasjon, soneusikkerhet, arealgrunnlag, 5–8 rom, dimensjonsrekkefølge, siste år/alder, avgrensninger, ugyldige/null svar, nett-/format-/størrelsesfeil, avbrudd og cacheisolasjon), TypeScript-kontroll og målrettet lint bestått. Gratis live HTTP-oppslag er dokumentert over og er en separat kontroll fra unit-testene.

Etter review beholder automatisk økonomiscenario statistikkåret som leieår.
Hentetidspunktet omdaterer ikke grunnlaget. Drift fra et annet år får derfor
ikke automatisk nettoyield/kontantstrøm med historisk leie; en eksplisitt egen
forventning for ønsket år kan registreres i eksisterende skjema. Ved uleselige
sider vises en egen begrensning om at disse kan inneholde motstridende
boligopplysninger; dette endrer ikke eksisterende dokument-/TG-kontrollporter.


## Arealregel ssb-rent-2 — 4. november 2026

Metadataenes faktiske arealpunkter brukes generelt innen samme romgruppe, også
med ulike avstander mellom punktene. Eksakt punkt bruker én celle. Mellom
nabopunkter brukes `lav + (høy − lav) × (areal − lavt areal) / arealavstand`.
Inntil og med 2 m² utenfor ytterpunktet brukes bare ytterpunktets celle uendret
før vanlig avrunding. Avstand over 2 m², manglende romgruppe, manglende relevante
punkter eller nullcelle gir ingen leie; ingen alternativ sone eller romgruppe
velges som reserve. Strukturert `areaMethod` oppgir metode, dokumentareal,
referansepunkter og lineær vekt. Kontrakt og metodeidentitet er `ssb-rent-2`.

Dette er en strengt avgrenset produktantakelse for en liten arealforskjell, ikke
en publisert SSB-prediksjon for det avvikende arealet. Fem ekstra prosentpoeng
i scenariointervallet gjør den ekstra usikkerheten synlig. Tillegget og resten
av intervallet er foreløpige konservative antakelser uten empirisk kalibrering.
Ingen adresse-, standard- eller årsjustering av beløpet utføres.

Rostockgata: dokumentet har 59 m² BRA-i, 3 rom og eksplisitt nummerert bydel
«Bydel: 1 Gamle Oslo» på fysisk PDF-side 117. Navnet brukes semantisk mens
kildesitat og offset beholdes ordrett. Dette velger SSB-sone 01.02, ikke bydeler
nevnt i parkeringsomtalen. SSBs 2025-celle `01.02 / 3.060 / Husleie / 2025` er
18 900 kr/mnd. Tilnærmingen 59→60 bruker denne uendret; årsleie blir
`18 900 × 12 = 226 800`. Grunnmargin 25 % + ett års datalder 5 prosentpoeng +
tilnærming 5 prosentpoeng gir 35 %. Nedre verdi `18 900 × 0,65 = 12 285`
avrundes ned til 12 200; øvre `18 900 × 1,35 = 25 515` opp til 25 600 kr/mnd.
Automatisk leie er fortsatt ubekreftet i statistikkåret, og registrert manuell
eller faktisk leie har forrang. Ukjent fellesgjeld, full drift og teknisk
rapportdekning oppgraderes ikke av estimatet.

Etter review normaliseres nummerert bydel bare ved verifisert kommune/nummer/navn-par i et uttrykkelig merket Oslo-register for 2004–2027-inndelingen. Uavklarte par beholdes med ordrett kilde og blokkerende issue. Dette er ikke en konvertering til kommende bydeler. Den ekte Nordvik-nettprøven henter uavhengige ferske metadata/celleverdier og kalenderår; historiske 2025-beløp er fortsatt deterministiske unit-fasiter. [Individuell reviewtriage og verifikasjon](spec-rostockgata-leieestimat.md).
