# S5-B1-v1 - separat, fiktivt benchmarkgrunnlag

Caset er AI-assistert forfattet 27. oktober 2026 for en senere kontrollert
førstevurdering av et hus med sekundær utleiedel. Rapporten er fullstendig
syntetisk: ingen faktisk befaring, ekte sakkyndig, sertifisering eller
etterlevelse av en bestemt rapportstandard påstås. Beskrevne datoer,
eieropplysninger og observasjoner er fiktive caseopplysninger.

Materialet gir en rikere oppgave for dokumentlesing, kildekontroll,
usikkerhetsvurdering og menneskelig bekreftelse enn korte democaser. Det er
ikke statistisk representativt, og materialets eksistens beviser ingen
modellkvalitet, faktisk tidsbruk eller generell tidsgevinst. Caset endrer
ikke F1-F4, deres fasit, historiske S2 eller låste akseptansekriterier.

## Filer og skille mellom kilder

- `report-source.json`: rapportens forfattede tekst, fordelt på 14 faste sider.
- `generate.py`: leser bare rapportkilden og lager den tekstbaserte PDF-en.
  Ingen lesing av fasit, finans, adapter, modell eller nettverk.
- `S5-B1-v1-tilstandsrapport.pdf`: originalrapporten for senere analyse.
  Fysisk PDF-side og fotlinjen er samme nummer. Rapporten inneholder ingen
  oracle-ID-er, fasitmarkører eller finansverdier.
- `expected.json`: separat, AI-assistert forfattet forhåndsfasit med alle eksplisitt
  graderte forhold, kildepassasjer og fysiske sider. Omfatter også generell
  inspeksjonsbegrensning, konkrete usikkerheter og øvrige metodegrenser.
  Ikke produsert fra adapterretur eller brukt av PDF-generatoren.
- `financial-inputs.json`: separate, fiktive brukerforutsetninger. `basis`
  følger produktets `FinancialBasisSchema` med values/sources/costItems.
  Verdiene skal ikke KI-ekstraheres fra rapporten.

Fasiten har åtte TG2-forhold og ett TG3-forhold: den alvorlige taklekkasjen. Hvert forhold har ett eksplisitt
gradmerke i rapporten; sammenfatningen tilfører ingen nye gradmerker.
Taklekkasjen står Uavklart, med reell kritisk usikkerhet om skjult utbredelse.
Den generelle grensen for ikke å åpne alle vegger og etasjeskillere løser
ikke dette forholdet. Ingen vurdering om «ikke kritisk» er forhåndsattestert.
Et menneske må eventuelt vurdere generell begrensning med eget reelt grunnlag.

## Finansforutsetninger og bekreftelsesbetydning

P=6000000 NOK, forventet L=480000 NOK/år, D=120000 NOK/år,
J=240000 NOK/år og Ymin=5.5 prosent, med felles årsgrunnlag 2026.
D består av kommunale avgifter 30000, forsikring 18000, administrasjon
12000 og løpende vedlikehold 60000. J består av renter 180000 og avdrag
60000, utenfor D og uten overlapp. Dette er kontrollerte fiktive
brukerforutsetninger, ingen markedsverdier eller faktisk leiekontrakt.
Løpende vedlikehold er ordinær årsdrift. Engangsutbedring av de kjente
avvikene er ikke kostnadsberegnet eller inkludert; yield er ikke en
renoveringsjustert avkastning. Uavklart alvorlig lekkasje består.

`confirmed:true` betyr bare kontrollstatus i det forhåndsdefinerte
fixturegrunnlaget for kontrakts-/fasitkontroll. Det er **ikke** en påstand om
at Mads har registrert eller bekreftet felter i appen. Han må gjøre dette
selv ved en senere faktisk kjøring.

Uavhengig tallfasit er bruttoyield 8 prosent, NOI 360000 NOK/år,
nettoyield 6 prosent og kontantstrøm før skatt 120000 NOK/år.
Uavklart alvorlig lekkasje gir fortsatt Innhent mer informasjon;
økonomisk tilstrekkelighet avklarer ikke bygningsforholdet.

## Deterministisk bygg og utført avgrenset kontroll

```sh
/private/tmp/ibe160-s5-benchmark-venv/bin/python tests/fixtures/s5-benchmark/S5-B1-v1/generate.py
```

Brukt Python 3.12.14, ReportLab 4.4.4 og pypdf 6.1.3. Generatoren bruker
A4, standard Helvetica, 11.4 pt brødtekst med 16.3 pt linjeavstand og
`invariant=1`. Den avviser tekst som ikke passer på sin forfattede side;
ingen automatisk overløpsside eller tekstklipping. Sidene har 263-305 ord
før løpende topp-/fottekst, med faglig innhold på alle sider.

To bygg ga identiske PDF-bytes. Programmatisk kontroll med pypdf bekreftet
14 ukrypterte tekstsider, alle fotlinjer, nøyaktig ett gradmerke per
forhåndsdefinerte forhold og 54 fasitpassasjer på oppgitt fysisk side.
Direkte kontroll mot eksisterende produksjonskontrakt og
`validateFinancialBasis` ga null problemer, årsgrunnlag 2026 og de riktige
D/J-summene. `calculateFinancialMetrics` ga de fire uavhengig oppgitte
fasitverdiene. Dette er kontrakts-/forfatterkontroll, ingen appreise,
menneskelig kildekontroll eller faktisk måling.

Blind uavhengig rapportreview og produksjons-PDF.js-kontroll er utført.
Alle sider er rendret og visuelt inspisert; sluttmanifestet binder filene med
SHA-256 før første uttrekksanalyse. Lokal commit fryser materialet. Ingen live-analyse eller menneskelig
måling skal foretas gjennom denne forberedelsen. Ingen slike resultater
eller tidspunkter finnes i caset.

## Senere faktisk måling og tilgang til fasit

1. Mads gjør sin manuelle førstevurdering av samme PDF før han ser det nye
   KI-uttrekket. Bare rapport og separat finansgrunnlag brukes som arbeidsinput.
2. Deretter gjennomføres ett eksplisitt faktisk analyseforsøk og Mads sin
   kildekontroll av KI-resultatet. t_start er Start analyse, t_liste er
   faktisk synlig ferdig validert liste og t_bekreftet er ferdig menneskelig
   kontroll/bekreftet gjeldende liste med håndtert TG3. Uavklart er tillatt.
3. Fasiten brukes til etterkontroll. Den skal ikke brukes som svarark under
   den manuelle referansen eller sendes til leverandøren sammen med rapporten.
   Repoet gir ingen tilgangssperre: faktisk tidligere kjennskap/eksponering
   for rapport, fasit og funn må dokumenteres som metodebegrensning. Ingen
   påstand om blind eller ukjent case følger av dette oppsettet.

Ingen slik menneskelig gjennomføring eller KI-analyse er gjort ved frysing.
Casekilden og fasiten er begge AI-assistert forfattet. Separat forfatting og
agentbasert QA betyr ikke at en uavhengig bygningssakkyndig eller Mads har
validert dataene. Det syntetiske caset tester en definert arbeidsoppgave,
ikke generell modellkvalitet eller statistisk representativ tidsgevinst.

## Repeterbar offlineverifikasjon

Kjør fra reporoten, med prosjektets Node 24.21.0:

```sh
env -u OPENAI_API_KEY -u ANALYSIS_MODE node .docs/implementation-artifacts/s5-b1-v1-verify.mjs
```

Dette bruker faktisk PDF.js-/dokumentkontrakt og eksisterende finans-/regel-
moduler, og kontrollerer alle fasitpassasjer/fysiske sider, alle gradmarkeringer
og filhashene i sluttmanifestet. Det kaller ingen adapter eller leverandør.
Supplerende kontroll kjøres med Python 3.12, pypdf 6.1.3 og ReportLab 4.4.4:

```sh
python .docs/implementation-artifacts/s5-b1-v1-pdf-check.py
```

Uavhengig pypdf-kontroll og visuell QA dokumenteres i
`.docs/implementation-artifacts/story-4-5-s5-b1-v1-frys.md`.

Frosset v1 skal ikke regenereres eller endres for å passe et senere svar.
Ved legitimt behov for endret innhold opprettes ny caseversjon og nye hasher;
manifestet binder den eksakte PDF-en, fasiten, finansgrunnlaget og kildene.
ReportLabs invariant-metadata er deterministiske byggeverdier, ikke en faktisk
befaringsdato eller klokkeslett for menneskelig test.
