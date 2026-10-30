# Fjerde faktiske prøve: deterministiske beløpsreferanser

Dato: 2026-10-30. Kodegrunnlag `41d2bf84de5deb5534c0bb082aa2ae58b5fe152b`.
Brukeren godkjente ett nytt genereringskall til OpenAI Responses API med
gpt-6.1-sol, nødvendige tekstutdrag fra fysisk side 6–8 og 12–13,
USD 0,20 totalt og maksimalt 6000 outputtokens inklusive reasoning.

Nøyaktig ett HTTP-kall ble gjennomført. HTTP 200, status `completed`;
compact-3-responsen passerte eksisterende kilde-/beløps-/periode-/konflikt-
validering. Ingen count, verktøy, ekstra generering, automatisk retry eller
hel PDF ble sendt. Ingen kodeendring eller omfattende testrunde ble utført.

## Alle elleve godkjente fasitpunkter

Hele faktiske responsen er kontrollert, ikke bare den lokale tallkatalogen.
De åtte numeriske radene krever faktisk valgt verdi-ID med riktig beløp/øre,
rolle og kilde innen fasitens originale kildespenn. Beløp og dokumentdata
forblir private.

| Fasitpunkt | PAA samlet | Faktisk grunnlag |
| --- | --- | --- |
| 1 Prisantydning | Riktig | Modellens valgte pris-ID, kodeeid beløp/øre |
| 2 Vann/avløp i salgsoppgaven | Riktig | Riktig konfliktalternativ og kilde; kvartal/eks. mva beholdt |
| 3 Eiendomsskatt i salgsoppgaven | Riktig | Riktig konfliktalternativ; avvik fra faktura beholdt |
| 4 Vann/avløp på faktura | Riktig | Riktig terminbeløp med øre og kilde |
| 5 Mva på vann/avløp | Riktig | Riktig valgt fakturaverdi; ingen beregnet mva |
| 6 Vann/avløp inklusive mva | Riktig | Riktig valgt bruttobeløp med øre |
| 7 Eiendomsskatt på faktura | Riktig | Riktige fakturaverdier og oppgitt null mva |
| 8 Samlet fakturabeløp | Riktig | Riktig fakturatotal; ikke eiendommens totalpris |
| 9 Leieopplysning | Riktig via kode | Ingen aktive leieavtaler bevares som originalutdrag; inntekt ikke antatt null |
| 10 Andre driftskostnader | Riktig | Modellen bevarer variabel/ukjent kostnad; kode bevarer originalutdrag |
| 11 Ukjente kjøps-/gjeldsfelt | Riktig | Seks faste felt er missing/null, ingen antatte nullkroner |

**PAA samlet: 11/11. Modellen alene: 10/11. Åtte av åtte numeriske
fasitpunkter er korrekte, ingen feilbeløp eller manglende fasitpunkt i samlet
resultat.** Historiske feilresponser og tidligere 3/11 er uendret.

## Begrensninger og kildekvalitet

Alle tre tidligere godkjente dokumentbegrensninger har eksakte originale
kildeutdrag i det returnerte `deterministicEvidence`: umålt areal, egne
fagfolk og datarom/kjøpers undersøkelser. Modellen tok ikke disse tre
eksplisitt med som dokumentbegrensninger. Det samme gjelder leiepunktet;
code-first-bevaringen var nødvendig for samlet fullstendighet.

To generelle modellforbehold om pipeline/menneskelig kontroll viser fortsatt
til lite treffende dokumentkilder, blant annet trykte sidetall. De er lagret
som ubekreftet modellfortolkning i `compactInterpretation`; de er ikke brukt
som dokumenterte fakta eller som erstatning for originale begrensningsutdrag.
Dette er en semantisk svakhet i modellsvaret, ingen korrumpert pengeverdi.

Alle 176 sendte segmenter er avstemt nøyaktig én gang. Modellens 50 brukte
unike kilde-ID-er er gyldige. Alle 252 kildeforekomster i hydrert resultat og
deterministisk evidens har korrekt originaltekst, fysisk side, UTF-16-posisjon
og kodeeid metadata. Teknisk korrekt kildeidentitet beviser ikke at enhver
fri modellpåstand har godt semantisk belegg.

## Tokenbruk og kostnad

| Bruk | Tokens |
| --- | ---: |
| Input totalt | 5074 |
| Herav cache-write | 5071 |
| Ordinær input | 3 |
| Cache-read | 0 |
| Output inklusive reasoning | 2282 |
| Herav reasoning, allerede inkludert | 64 |
| Totalt | 7356 |

Prisgrunnlag er eksisterende, datert Standard/global-pristabell: ordinær input
USD 2/million, cache-write USD 2,50/million, cache-read USD 0,10/million og
output USD 10/million. Beregnet kostnad fra faktisk API-usage:

`(3 × 2 + 5071 × 2,50 + 2282 × 10) / 1 000 000 = USD 0,03550350`.

Ingen separat fakturakontroll eller ekstra API-kall er gjort. Før sending
passerte hele 15899-byte SDK-bodyen USD 0,149735-maksimum med 35894 konservative
inputtokens og 6000 output. Den nye, uttrykkelig godkjente testrundens journal
beholder USD 0,15-reservasjonen og registrerer usage-avledet kostnad. Tidligere
journaler er bevart; dette er ikke en nullstilling eller en påstand om samlet
historisk forbruk under USD 0,20.

## Resultat og praktisk grense

**PAA bestod denne avgrensede økonomi-/begrensningsprøven som samlet pipeline.**
Modellens semantiske utelatelser og svake generiske kilder er eksplisitt
rapportert. Resultatet er fortsatt ubekreftet kandidat og menneskelig
kontroll gjelder. Ingen ny uavhengig menneskelig fasitattest er fabrikkert.
Teknisk/TG-dekning er fortsatt uavklart; prøven godkjenner ikke full analyse
eller produksjonsaktivering. PAA-SO2 forblir åpen for dette øvrige omfanget.

Rå request/respons, eksklusiv ettkallsmarkør, transportkvittering, hydrert
resultat, radvis fasitsammenligning og journal ligger bare under ignorert
`private/`. Ingen private dokumenter eller verdier committes. Ingen push.
