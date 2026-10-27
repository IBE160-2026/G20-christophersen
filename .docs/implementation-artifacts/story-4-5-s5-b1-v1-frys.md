# S5-B1-v1 — forhåndsfasit, validering og frysing

Dato: 2026-10-27. Leveranse: separat benchmarkgrunnlag, **ikke** utført S5.
[Manifest](../../tests/fixtures/s5-benchmark/S5-B1-v1/manifest.json) binder
case-ID S5-B1-v1 / versjon 1 til original PDF, separat fasit, finans,
forfatterkilde, generator og README. Den lokale committen som først legger
inn disse filene, dette dokumentet og aktiv promptlogg er frysepunktet.
Fasiten og alle filhashene er fastsatt **før første KI-uttrekksanalyse eller
leverandørkall**. AI-assistert forfatting/agentreview er ikke uttrekksanalyse.
Antall slike analyse-/leverandørkall: 0. Nye kostnader: USD 0. Faktiske
menneskelige målinger: 0; ingen tidsdata eller medianer er opprettet.

## Original, fasit og økonomi

Original: `tests/fixtures/s5-benchmark/S5-B1-v1/S5-B1-v1-tilstandsrapport.pdf`.
14 innholdsrike tekstbaserte A4-sider, 33008 bytes, ukryptert, uten skjema.
Fysisk PDF-side 1–14 samsvarer med fotlinjen; ingen forsideforskyvning.
Eiendommen Granlia og befaringen er uttrykkelig fiktive, med merking på alle
sider. Begge forfatterkildene er AI-assistert laget; ingen faktisk befaring,
rapportstandardsertifisering eller menneskelig fagvalidering påstås.
Generatoren leser bare rapportkilden, aldri fasit, finans eller modellretur.

| Grad | Fysisk side | Forhold |
| --- | --- | --- |
| TG2 | 3 | Terrengfall mot nordøstre grunnmur og vannansamling |
| TG2 | 4 | Saltutslag/avskalling og fuktindikasjon i nordre bodvegg |
| TG2 | 5 | Nedbrutt nedre trekledning på østfasade |
| TG2 | 6 | Nedbrutt bunnkarm og subbing i hovedsoverommets sørvindu |
| TG3 | 7 | Aktiv lekkasje ved østre takopplett, våt isolasjon/materialspor |
| TG2 | 8 | Blokkert luftespalte og kondensstriper ved vestre raft |
| TG2 | 9 | Sprukket/løs fugemasse i hovedbadets dusjhjørne |
| TG2 | 10 | Motfall og vann mot terskel i utleiebad |
| TG2 | 11 | Drypp fra avløpsskjøt og fuktskadet skapbunn i utleiekjøkken |

Separat [expected.json](../../tests/fixtures/s5-benchmark/S5-B1-v1/expected.json)
inneholder full kildepassasje for alle **8 TG2 og 1 TG3**, fysiske sider og
relevante støtte-/avklaringspassasjer. Ingen andre gradmerker finnes.

Generell inspeksjonsbegrensning på fysisk side 2: lukkede vegger og
etasjeskillere er ikke åpnet; skjult tilstand kan ikke fastslås. Fasiten
bevarer også 7 konkrete usikkerheter og 33 øvrige metodegrenser. Semantisk
korrekt gruppering er tillatt; dette innfører ikke krav om nøyaktig 33
uttrekksrader eller ny kvalitetsterskel. Ukjent årsak/skjult skadeomfang ved
aktiv taklekkasje er en konkret **kritisk usikkerhet** på side 7 og forblir
Uavklart. Ingen generell avklaring er forhåndsbekreftet eller kan overstyre
dette. Tilleggspassasjer på side 14 oppsummerer, uten nye gradefunn.

[Finansgrunnlaget](../../tests/fixtures/s5-benchmark/S5-B1-v1/financial-inputs.json)
er separate fiktive årsforutsetninger for 2026: P=6000000, forventet
L=480000, D=120000, J=240000 NOK og Ymin=5.5 %. D og J er spesifisert uten
overlapping. Ordinært vedlikehold omfatter ikke ukjente engangsutbedringer
av rapportens avvik; disse er ikke priset. Tallfasit er bruttoyield 8 %,
NOI 360000, nettoyield 6 % og kontantstrøm før skatt 120000 NOK/år.
Uavklart TG3 gir fortsatt «Innhent mer informasjon». Fixtureflagget
confirmed er kontraktskontroll, **ikke** Mads sin faktiske bekreftelse.

SHA-256 PDF:
`5548434c32b3cdb3bd9ac5d91f25a1fa055eb3b0928279134124c46403bc3ca1`

SHA-256 fasit:
`8c7000bc06041f03e1090d7d9cfadf8dd679cdf6072931aad28c6af7cfc879a5`

SHA-256 finans:
`7950e6632696c40594f9afb659d38165aa4ede40d5b43ceaac416be45737688a`

## Utførte kontroller

- [Produksjonskontroll](s5-b1-v1-production-validation.json): faktisk
  validatePdf/extractPdf og eksisterende DocumentBasisSchema godtar PDF-en;
  alle 14 sider er readable og innen eksisterende side-/størrelsesgrenser.
  Nøyaktig 9 gradefunn, alle 54 kilde-/støtte-/avklaringspassasjer på oppgitt
  fysisk side og alle 6 manifestbundne filhashene består. Finansskjema,
  domenevalidering, D/J-summer, årsgrunnlag og fire tallfasiter består med
  null problemer. Eksisterende regelvern beholder TG3-blokkeringen.
  Ingen adapter er kalt. demo i DocumentBasis er bare lokal skjemametadata.
- [Uavhengig parserkontroll](s5-b1-v1-pypdf-validation.json): pypdf bekrefter
  14 A4-sider, alle fysiske fotlinjer/fiktivmerkinger, 54 passasjer, null
  ekstra TG2/TG3, ingen oracle-ID-er og ingen skjemafelter/kryptering.
  Midlertidig gjenbygg gir byteidentisk PDF uten å overskrive originalen.
- Alle 14 sider er rendret med PDF.js og separat macOS PDFKit og visuelt
  inspisert. Enkelte samlede bildepreviewer viste bortfall i venstrekant;
  enkeltbilder og utsnitt av samme faktiske PNG (bl.a. side 9-header/TG2 og
  side 11) bekrefter at tegn, topptekst og gradmerking finnes og er lesbare.
  Ingen endring av PDF for å tilpasse previewet. Ingen faktisk tekstklipping,
  overlapp, tom fyllside eller uleselig typografi ble funnet i kontrollen.
- [80 beskyttede filer](s5-b1-v1-preservation-validation.json) i opprinnelige property-cases, story-4-4-bevis og
  analyseadapterdata er SHA-256-kontrollert mot snapshot før oppretting:
  alle byteidentiske. Ingen produktkode eller låst kontrakt er endret.
- Kontroller er repeterbare via [JS](s5-b1-v1-verify.mjs) og
  [Python](s5-b1-v1-pdf-check.py); miljø/kommandoer står i casets README.
  Ingen full appregresjon er kjørt for denne rene fixture-/dokleveransen;
  relevante eksisterende produksjonsfunksjoner er kjørt direkte offline.

Egnethet: ca. 4 000 ord fordelt på ulike bygningsdeler, normale observasjoner,
flere lokale fuktforhold, klare avgrensninger og kritisk takusikkerhet gir
meningsfull lesing og kildekontroll for en kontrollert førstevurdering.
Ingen kunstige sider eller utfyllingsgjentakelser er brukt for sidetallet.
Dette beviser ikke statistisk representativitet, generell modellkvalitet
eller tidsgevinst. Gradene er konsekvent presentert; oppgaven er kildebasert
screening, ikke skjult graddiagnose. Mads sin tidligere eksponering for
funn/fasit må oppgis ved måling; ingen blind mennesketest påstås.

## Sekvensielt uavhengig review og triage

Ny agent fikk materialet uten implementeringshistorikk og utførte blindt
review. Ti punkter ble vurdert; oppfølgingskontroll fant ingen nye konkrete
feil etter retting og gjentok vellykket pypdf-/determinismekontroll.

| # | Funn | Avgjørelse og sluttresultat |
| --- | --- | --- |
| 1 | Uklar «håndskrevet» fasitproveniens | Rettet: begge kilder tydelig AI-assistert, ingen menneskelig fagvalidering |
| 2 | Benchmark-/appcoaching i rapporten | Rettet på side 1, 7 og 14; naturlig rapporttekst, fiktivmerking beholdt |
| 3 | Regelmessig gradplassering side 3–11 | Avvist som feil: konsistent komponentformat er legitimt; ikke krav om randomisering, metodebegrensning dokumentert |
| 4 | Ufullstendig rekkefølge for senere evaluering | Rettet: manuell først, faktisk AI, menneskelig kontroll, fasitetterkontroll |
| 5 | Fasit tilgjengelig før mennesketest | Rettet dokumentasjon: ikke svarark/providerinput, tidligere eksponering må registreres, ingen blindsperre påstås |
| 6 | Manglende repeterbar verifikasjon | Rettet: to lesende offlinekontroller, lagrede resultater og kommandoer |
| 7 | Uklart om metodegrenser krever eksakt antall uttrekksrader | Rettet: semantisk gruppering tillatt, kritisk usikkerhet bevares, ingen ny terskel |
| 8 | Sidebygg uten innledende kontekst | Rettet: introdusert på side 1 |
| 9 | Generator mangler generell horisontal/tegn-guard | Avvist som nåværende feil: ingen påvist feil i fast PDF; faktisk rendering kontrollert, framtidige innholdsendringer krever ny versjon |
| 10 | Uklar inkludering av kjente utbedringer i vedlikehold | Rettet: ordinær drift skilt fra ukjente/prisede engangstiltak, ingen renoveringsjustert yield |

## Gjenstående før faktisk S5

Se [gjeldende åpen R4-S5](../planning-artifacts/r4-s5-benchmark-s5-b1-v1-2026-10-27.md).
Story 4.4s AC6/B2 og slutt-review må fullføres; dette caset lukker ikke den
avhengigheten. Deretter må casebundet bevisoppsamling og fersk preflight
med budsjett, miljø, hash og nøyaktig manuell instruks klargjøres. Gammel
F1-arming/instruks er ugyldig for benchmarken. Mads må senere selv gjøre
manuell førstevurdering av samme fryste PDF, så faktisk analyse og egen
kontroll; faktisk materiale, tider, kvalitet og uavhengig 4.5-review kreves.
4.5 er ikke done. Epic 4 er in-progress. 5.4/S6 og 5.5 er urørt.
