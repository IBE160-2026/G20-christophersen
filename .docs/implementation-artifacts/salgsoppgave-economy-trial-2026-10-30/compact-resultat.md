# Kompakt økonomirespons – klar for ny live-godkjenning

2026-10-30. [Godkjent oppgave og reviewtriage](../spec-salgsoppgave-compact-economy.md).
Baseline `9c5e6efc5b3cad4a9ebf5fcdb7aa58c3001e8198`.

## Resultat

AI-schemaet returnerer ni økonomifelt med beløp/status/periode/år/natur,
kilde-ID-er, konfliktalternativer og korte begrunnelser. Observasjoner beholder
eventuelt kildebelagt beløp og korte begrunnelser, og begrensninger har korte
tekster. Modellen kan ikke returnere sitat, originalText, offset, dokumenthash,
printedPage, kategori, valuta eller etikett. Koden eier disse verdiene.

Originaltekst fra valgte sider deles uten teksttap i eksakte UTF-16-segmenter,
med lokale belegg-/linjegrenser og korte deterministiske ID-er. Originalteksten
sendes én gang som `[kilde-ID, tekst]`. Det er ikke et tekstfilter: hver valgt
UTF-16-enhet, inkludert whitespace og ikke-numeriske opplysninger, beholdes.
Modellens processedSourceIds må dekke hele katalogen nøyaktig én gang.

Koden slår opp ID-er i den requestbundne katalogen, gjenoppbygger sitater og
posisjoner med opprinnelig sourceFor, og bevarer printedPage som null når
kildegrunnlaget ikke har dette. Ukjente/dupliserte ID-er, injiserte metadata,
endrede original-/pakke-/fasit-/requestbindinger og ufullstendig tekstregnskap
avvises. Sammenhengende valgte spenn kan slås sammen uten å ta med uvalgt tekst.

Hydrert kandidat går gjennom eksisterende kontroll av faste felt, numeriske
verdier, periode/år, lokale beløp/motstrid og hver kvartal-/MVA-forekomst.
Lokale kjente perioder/år og hele lokale kildebelegget må nå også bevares;
endring krever faktisk kildebelagt konflikt. Ukjent forblir ukjent. Den eneste
delte tallsyntaksutvidelsen er uttrykkelig norsk komma-bindestrek for hele
kroner etter tusengruppering, testet med syntetiske verdier; tvetydige nakne
punktumstall, negative verdier og tallfragmenter er fortsatt avvist.
Dette er teksttranskripsjon, ingen finansberegning eller regelendring.

Modellens korte begrunnelser og observasjonsverdier bevares separat som
compactInterpretation for kontroll. Segmentregnskap er ikke bevis for semantisk
korrekthet. Kandidaten forblir ubekreftet, med påkrevd menneskelig sammenligning
mot godkjent fasit. Teknisk/TG-dekning er fortsatt uavklart.

## Ny request og kostnadsport

- Samme godkjente private fasit og fysiske sider 6–8 og 12–13.
- 176 tekstsegmenter, all valgt originaltekst bevart. Hele ny SDK-body,
  inkludert schema/instruksjoner, er **15 930 UTF-8-byte**.
- Lokal konservativ inputgrense for pakken er `2 * 15930 + 4096 = 35956`
  budsjetttokens. Dette er ikke en presis tokenizer eller en servermåling.
- **6000 output-tokens inklusive reasoning**. Policy har maksimalt 36000
  inputbudsjetttokens; høyere input stopper før nettverk.
- Global Standard Sol/cache-write-maksimum USD 2,50/M og output USD 10/M gir
  `35956 * 2,50/M + 6000 * 10/M = USD 0,14989` for ny pakke.
  Høyeste tillatte policykostnad er USD 0,15.
- Varig reservasjon **USD 0,15**, samlet ramme **USD 0,20**, minst **USD 0,05**
  margin. Samme ettkalls-/ingen-retry-/ingen-verktøy-/ingen-count-port og
  fullstendighetsstopp. Ingen automatisk rapport, ekstra kvote eller frigivelse.

Ny privat klargjøringspakke har nye digester og **betalt godkjenning null**.
Historiske pakker/journaler fra de to faktiske forsøkene er beholdt. Ingen ny
budsjettjournal initialiseres ved klargjøring, og gammel betalt godkjenning arves
ikke. At forrige forsøk var under budsjett gir ikke rett til nytt API-kall.

## Verifikasjon og review

[Sluttbevis](compact-verification.json): **69/69 målrettede tester i seks filer**,
typecheck og avgrenset lint består på pinned Node24.21.0, tom API-nøkkel/demo.
Testene dekker eksakt metadata/UTF-16/reassembly, ukjente/injiserte/dupliserte
kilder og coverage, kjente perioder/år, kvartal/MVA, lokale konflikter, kompakt
schema, 201+ små kilder/spredte kilder/deduplisering uten bevisstap, 6000/6001
fullført usage, inputgrense + én byte, delvis output, omstart-/reservasjons-
og ingen-retry-regresjon. Eksisterende oracle-/code-first-budsjettprøver inngår.

Første samlede verifikasjon hadde én TypeScript-feil i en testfixtures for
observasjonstype; dette er rettet. [Opprinnelig bevis](compact-verification-initial.json)
bevares, og siste sluttbevis ovenfor har alle exitkoder null. Ingen full suite.

Uavhengig BMAD blind-/edge-/verifikasjonsreview fant fire individuelle funn
fordelt på tre årsaker: tap av lokalt kildebelegg/kvalifikasjoner, hydrerte
kildeantall og manglende fullført usage-grensetest. Alle er rettet. Blind
nykontroll fant samme kildeantallsårsak for spredte kilder/aggregert antall;
også rettet og nykontrollert uten restfunn. Hver opprinnelig rad står i spec.

Privat komplett **kodekonstruert offline-eksempel fra godkjent fasit**, tydelig
merket som ikke-modellrespons, passerer hydrerings-/økonomi-/kildekontrollene.
Den kompakte eksempelresponsen er 3755 UTF-8-byte. Dette er verken ny menneskelig
verifikasjon eller en påstand om modellkvalitet eller faktisk fremtidig tokenbruk.

[Bevaring](compact-preservation.json): 159 låste finans-/screening-/historiske
filer uendret, aktivt promptprefiks bevart, original uendret og ingen privat fil
sporet i Git. Eksakte kilder, fasit, dokumenthash, nye digester og eksempeldata
ligger bare i ignorert private/. Ingen nye betalte kall eller push.

**Neste live-test er klar til ny uttrykkelig godkjenning. Den er ikke kjørt.**
