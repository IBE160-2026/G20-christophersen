# Tredje godkjente API-forsøk: fullført kompakt svar, avvist beløp

2026-10-30. Brukeren godkjente uttrykkelig ett nytt kall til OpenAI Responses
API (`api.openai.com`), `gpt-6.1-sol`, nødvendige utdrag fra fysisk side 6–8 og
12–13, kompakt respons, maksimalt 6000 output inklusive reasoning og USD 0,20.
Ingen automatiske forsøk, ekstrakall eller push.

## Utførelse og budsjett

Ny request/pakke ble sammenlignet med den offline klargjorte kompakte pakken
og godkjent fasit. Hele strict-schemaet, alle regexer, modell, sideutvalg,
input_text-only og 6000-outputtak ble kontrollert før nettverk. Samme faktiske
SDK-body på 15 930 UTF-8-byte, lokal inputgrense 35 956 og beregnet maksimum
USD 0,14989. USD 0,15 ble reservert varig i denne nye uttrykkelig godkjente
testens egen journal før nettverk. Tidligere testjournaler er bevart.

Nøyaktig **ett faktisk HTTP-kall**. Ingen count, verktøy, PDF-upload eller retry.
API returnerte HTTP 200, modell `gpt-6.1-sol`, service_tier `default`,
`status: completed` og gyldig komplett kompakt JSON. Responsen traff ikke
outputgrensen, men lokal kontroll stoppet med
**`economy-unsupported-observation-amount`**. Kandidaten ble ikke akseptert.

## Faktisk usage og beregnet kostnad

| Usage | Tokens |
| --- | ---: |
| Input totalt | 4523 |
| Herav cache-write | 4520 |
| Herav cached read | 0 |
| Ordinær input | 3 |
| Output inklusive reasoning | 2009 |
| Herav reasoning | 88 |
| Input + output | 6532 |

[Global Standard-pris](https://developers.openai.com/api/docs/models/gpt-6.1-sol):
input USD 2/M, cache-write USD 2,50/M, cache-read USD 0,10/M, output USD 10/M.
Faktisk usage gir `(3*2 + 4520*2,50 + 2009*10)/1 000 000 = USD 0,031396`.
Reasoning telles ikke dobbelt. Faktura er ikke separat kontrollert; ingen
ekstra kostnads-API-kall ble gjort. Journalen er oppgjort mot faktisk usage/
priskategorier, men USD 0,15-reservasjonen beholdes. Kostnadsoppgjør er ikke
godkjenning av analysen.

## Hele responsen sammenlignet med godkjent fasit

Telleren bruker **de 11 godkjente fasitradene**, ikke de ni tekniske faste
ListingKey-feltene eller antall dupliserte modellalternativer:

| Fasitklassifisering | Antall |
| --- | ---: |
| Korrekte punkter | 3 |
| Punkter med feil beløp | 7 |
| Manglende punkt | 1 |

Riktig: prisantydning, øvrige løpende kostnader beholdt ukjent, og gruppen av
ikke fastslåtte totalpris-/kjøpskostnads-/dokumentavgifts-/fellesgjeld-/felles-
kostnads-/gjeldsbetalingsopplysninger beholdt ukjent i utvalget. Leieforhold/
ingen aktive avtaler ble ikke trukket ut som påkrevd kvalitativt fasitpunkt.

Alle de øvrige syv beløpspunktene har tusen-/desimalfeil: modellen kopierte
punktumgruppering som desimalpunktum i maskinverdien og fjernet den egentlige
kommafraksjonen fra fakturatall. Enkelte feilverdier gjentas flere ganger;
**10 numeriske forekomster** mangler korrekt leksikalsk støtte, men dette er
ikke 10 forskjellige fasitpunkter. Ingen feilverdier ble omtolket eller
rettet for å få testen til å bestå. Eksakte økonomiverdier står kun privat.
Observasjonen om null MVA på eiendomsskatt er også riktig, men telles ikke
som et ekstra fullstendig fasitpunkt når selve skattebeløpet er feil.

Modellen utelot dessuten de godkjente dokumenterte begrensningene om areal,
egne tekniske fagfolk og datarom/kjøpers undersøkelser. Den gjentok i stedet
pipelinekravet om menneskelig kontroll som om det var en dokumentert
begrensning, med henvisning til hele utvalget. Dette har ikke presist
dokumentbelegg, selv om kravet i seg selv er en riktig systemregel.

## Kildekvalitet og fullstendighet

Alle 176 behandlings-ID-er dekker katalogen nøyaktig uten duplikater/ukjente
ID-er. Modellen brukte også alle 176 som kildebelegg gjennom den generelle
begrensningen. Deterministisk oppslag har eksakte originale UTF-16-posisjoner,
sitater og kodeeid metadata; printedPage holdes null som i originalkontrakten.
Den tidligere én-tegnsfeilen og modellskrevne metadata er dermed unngått.

Gyldige kilde-ID-er betyr ikke riktig beløpstolkning eller at enhver parafrase
har semantisk belegg. Den generelle henvisningen til alle kilder er for bred,
og den dokumenterer ikke modellens egen kontrolltekst som et dokumentfunn.
Selvrapportert komplett segmentdekning er ikke godkjent semantisk dekning.
Teknisk/TG-dekning er fortsatt uavklart.

**PAA bestod ikke økonomitesten.** Kompakt output og deterministiske kilder
løste avbrudd/posisjonsfeil, og feilbeløp stoppes trygt, men norsk talltolkning
og dokumenterte begrensninger er fortsatt utilstrekkelige. Neste forbedring
må rette denne tolkningen før ny særskilt godkjent test; ingen ny
implementerings- eller API-runde er utført som del av resultatrapporteringen.

Hele faktiske svar, request, transportkvittering, fasitsammenligning og
usage-/journalbevis ligger kun i ignorert privat område. Ingen respons ble
reparert, ingen menneskelig attestasjon fabrikkert og ingen finans- eller
screeningregel endret. Ingen private dokumenter/nøkler i Git. Ingen push.
