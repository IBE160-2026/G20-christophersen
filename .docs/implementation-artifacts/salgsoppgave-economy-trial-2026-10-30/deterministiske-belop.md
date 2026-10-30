# Årsakskontroll etter tredje live-test

Dato: 2026-10-30. Kun eksisterende respons og tidligere godkjent, avgrenset
fasit er brukt. Ingen nye API-kall eller menneskelige verifikasjoner.

## Hva feilet

Rå HTTP-respons er identisk med lagret modelloutput. Alle syv gale beløp var
allerede gale strenger fra modellen: norske punktumgrupper ble brukt som
kanoniske desimaltegn, og fakturaenes desimalkomma/øre ble utelatt.
Schema/parsing/hydrering endret ikke sifrene. Hele svaret ble avvist før en
ferdig kandidat ble produsert; det finnes dermed ingen aksepterte, ferdig
parsede feilverdier å sammenligne med.

Tre årsaker:

1. Prompten krevde «ordrette» beløp mens schemaet krevde kanoniske desimaler.
   AI hadde ansvaret for å oversette mellom to tallformater.
2. Lokalt etikettuttrekk støttet for få skrivemåter og oppsett. Overskrifter,
   linjeskift, punktumgrupper og fakturakolonner ga ikke sikre lokale verdier.
3. Et regnskap over alle 176 segment-ID-er beviste ikke at modellsvaret bevarte
   alle økonomifakta eller dokumentbegrensninger.

## Alle 11 fasitpunkter

Beløp, dokumentidentitet, sitater, offseter og de fullstendige sammenligningene
ligger bare i den ignorerte private testmappen. Tabellen viser sporingen uten
å publisere dokumentdata. «Gjenfunnet» er kode-/kildekontroll, ikke AI-bestått.

| Fasitpunkt | Fysisk side | Opprinnelig modellrespons | Ny lokal kontroll |
| --- | --- | --- | --- |
| 1 Prisantydning | 6 | Riktig | Eksakt beløp/øre og originalkilde |
| 2 Vann/avløp i salgsoppgaven | 6 | Feil beløp | Eksakt beløp; kvartal og eks. mva beholdes |
| 3 Eiendomsskatt i salgsoppgaven | 6 | Feil beløp | Eksakt beløp; forskjell fra faktura beholdes |
| 4 Vann/avløp på faktura | 12–13 | Feil beløp | Eksakt beløp/øre; termin og datoperiode beholdes |
| 5 Mva på vann/avløp | 12 | Feil beløp | Eksakt oppgitt mva-beløp; ingen beregnet sats |
| 6 Vann/avløp inklusive mva | 12 | Feil beløp | Eksakt oppgitt beløp/øre; ikke beregnet |
| 7 Eiendomsskatt på faktura | 12–13 | Feil beløp | Eksakt beløp/øre; oppgitt null mva bevares |
| 8 Samlet fakturabeløp | 12 | Feil beløp | Eksakt beløp/øre; ikke eiendommens totalpris |
| 9 Leieopplysning | 7 | Utelatt | Originalt leieutdrag; inntektsbeløp ukjent |
| 10 Andre driftskostnader | 7 | Riktig ukjent | Originalt kostnadsutdrag; beløp ukjent |
| 11 Samlede ukjente kjøps-/gjeldsfelt | Utvalget | Riktig ukjent | Seks faste felt fortsatt null, aldri null kroner |

Alle åtte numeriske punkter finnes med korrekt kanonisk beløp og eksakte
heltallsøre innen de tidligere godkjente kildespennene. Alle elleve punkter
har eksplisitt regnskap; ingen ukjent verdi er fylt med en antakelse.

## Hva er endret

`compact-3` lar modellen velge `valueId`, ikke skrive økonomiske sifre.
Kode transkriberer norske tusengrupper, desimalkomma og eksplisitt
helkronesuffiks med BigInt, uten flyttall eller avrunding. Originalt token,
kroneverdi, øreverdi, fysisk side og UTF-16-spenn bevares. Tvetydige og
ugyldige tokens er synlige i lokalt regnskap, men kan ikke velges som sikre
beløp. En numerisk kandidat er ikke automatisk et økonomisk faktum.

Hydrering krever eksakt kjent ID og fullt kildebelegg. Eksisterende lokale
verdi-, kilde-, konflikt-, periode- og årskontroller gjelder fortsatt. AI kan
ikke overskrive sikkert lokalt feltbelegg. AI må fortsatt tolke hva et beløp
gjelder, hvilke alternativer som står i konflikt og hvilke relasjoner som er
uavklarte; dette krever en ny reell prøve og menneskelig sammenligning.

Mva, kvartal, måned/år, termin og datoperioder bevares som kodeeide kildespenn;
ingen automatisk mva-beregning, periodisering eller annualisering er innført.
Originale begrensningsutdrag om umålt areal, egne fagfolk og datarom/kjøpers
undersøkelser følger med i `deterministicEvidence` også ved AI-utelatelse.
Leie og variable driftskostnader behandles tilsvarende. Modellens frie
begrensningspåstander lagres som tolkning; dokumenterte begrensninger vises
med tekst hentet fra originalkilden. Regexmarkører beviser ikke universell
semantisk fullstendighet. TG og øvrig teknisk dekning er fortsatt uavklart.

Historisk rårespons og dens 3/11-resultat er bevart. Det er ikke laget en
«rettet modellrespons» som kan telle som en bestått AI-test.

## Klargjøring

Ny faktisk SDK-body inklusive schema er kontrollert offline, uten count-kall,
API-nøkkel, ny budsjettjournal eller transport. Kun de samme fem fysiske sidene
inngår. Betalt godkjenning er tom og tidligere forbrukte godkjenninger arves
ikke. Samme tak, reservasjon, margin og sperre før nettverk gjelder.

89 målrettede tester i åtte filer, typecheck og lint består. Tre uavhengige
BMAD-reviewlag fant feil i blant annet fragmenterte beløp, sluttpunktum,
valutaplassering, bøyninger, segmentgrenser, alternative kilder og
kvalifikasjonsaggregering. Alle funn er rettet og nykontrollert; ingen restfunn.
Serialisert request-katalog er testet ved å rekonstruere alle brukbare
tallkandidater fra faktiske wire-referanser, også på tvers av segmenter.

Endelig request er 15 899 UTF-8-byte. Lokal konservativ inputramme er 35 894
tokens; dette er ikke en presis tokenmåling. Med 6000 output inklusive reasoning
er beregnet maksimum **USD 0,149735**, reservasjon USD 0,15 og minst USD 0,05
ubenyttet margin. Ingen endring av kostnadstak eller kontrollregler.

Alle elleve punkter er kontrollert mot eksisterende fasit, og et uttrykkelig
kodekonstruert fasiteksempel passerer ny hydrering lokalt. Eksemplet er ikke
modelloutput og teller ikke som en reell AI-test. 28 domene-/kontraktfiler,
privat PDF/fasit, rå API-respons og tidligere promptloggprefiks er uendret.
Ingen private filer spores av Git.

[Maskinlesbar sluttverifikasjon](deterministiske-belop-verifikasjon.json).
Neste avgrensede live-test er klar til **ny uttrykkelig godkjenning**.
PAA-SO2 forblir åpen for faktisk live-kvalitet.
