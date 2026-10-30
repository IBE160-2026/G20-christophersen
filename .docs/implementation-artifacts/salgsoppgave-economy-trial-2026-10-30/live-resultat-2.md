# Andre godkjente API-forsøk: faktisk respons, men output avbrutt

2026-10-30. Brukeren godkjente uttrykkelig ett nytt betalt kall til OpenAI
Responses API, `gpt-6.1-sol`, bare nødvendig tekst fra side 6–8 og 12–13,
USD 0,20 og ingen automatiske ekstrakall/push.

## Kontroll før sending og utført kall

Original/fasit/gammel godkjent pakke ble kontrollert mot eksisterende bindinger.
Ny pakke har samme sider, tekst, instruksjoner, kildegrunnlag og lokale felt;
bare rettet schema og tilhørende digest er endret. Hele SDK-requesten og alle
objekters strict/required/additionalProperties ble kontrollert lokalt, sammen
med alle regexer og de ni faste ID-ene. Requesten har bare input_text, ingen
PDF, verktøy, filer, bilder, history, count eller ekstra genereringskall.

Hele bodyen er 17 771 UTF-8-byte; lokal konservativ grense er 39 638
inputbudsjetttokens og 4000 output inklusive reasoning, beregnet maksimum
USD 0,139095. USD 0,15 ble varig reservert før nettverk.

Dette er en **ny uttrykkelig godkjent test med egen USD 0,20-journal**. Forrige
avviste forsøk og dets USD 0,15-reservasjon/ukjente fakturering er ikke slettet
eller nullstilt. Budsjett for separate testrunder må ikke omtales som verifisert
samlet kostnad for alle historiske forsøk. Ingen produksjonsbudsjettregel er
endret eller automatisk ny kvote gitt.

Nøyaktig ett faktisk HTTP-kall ble utført. API-et svarte **HTTP 200**,
modell `gpt-6.1-sol`, service_tier `default`, men `status: incomplete`,
`incomplete_details.reason: max_output_tokens`. Ettkallsporten avviste dermed
responsen før kandidataksept. Ingen retry eller økning av outputtak.

## Faktisk tokenbruk og kostnad

| Rapportert usage | Antall |
| --- | ---: |
| Input totalt | 4493 |
| Herav cache-write | 4490 |
| Herav cache-read | 0 |
| Ordinær input, differanse | 3 |
| Output totalt inklusive reasoning | 4000 |
| Herav reasoning | 1034 |
| Input + output | 8493 |

[Verifisert Standard-pris for Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol):
ordinær input USD 2/M, cache-write USD 2,50/M, cache-read USD 0,10/M og output
USD 10/M. Kostnad fra **faktisk rapportert tokenbruk**:
`(3 * 2 + 4490 * 2,50 + 4000 * 10) / 1 000 000 = USD 0,051231`.
Reasoning er allerede inkludert i output og telles ikke dobbelt.
Dette er usage-/prisbasert kostnad; faktura er ikke separat verifisert og
ingen kostnads-API-forespørsel ble gjort. Tidligere HTTP-400-forsøk har fortsatt
ingen usage og ingen attestert fakturering.

Den nye testens journal er etterkontrollert og oppgjort med rapportert usage
og eksakte priskategorier; USD 0,15-reservasjonen beholdes. Journalens oppgjør
betyr at kostnadsgrunnlaget foreligger, ikke at analysen er godkjent.

## Sammenligning med godkjent fasit

Delresponsen er ikke gyldig komplett JSON. Kun faktisk fullt avsluttede JSON-
objekter er lest diagnostisk; ingen respons er reparert, ferdigskrevet eller
godkjent. Seks faste felt ble helt returnert; det sjuende ble avbrutt.

- Prisantydningens beløp stemmer med fasit og fysisk side 6.
- Fem helt returnerte felt beholdt totalpris, omkostninger, dokumentavgift,
  fellesgjeld og felleskostnader ukjent; dette samsvarer med fasit for utvalget.
- Det uavsluttede eiendomsskatt-feltet viser begge riktige kildebeløp og
  konfliktstatus. Det teller ikke som et fullført/akseptert konfliktfelt.
- Vann/avløp, MVA, fakturasum, leie/andre driftskostnader og begrensninger ble
  ikke ferdig semantisk behandlet. Beløp i kopierte fakturasitater teller
  ikke som strukturerte økonomiuttrekk. Ingen feilaktig normalisert beløpsverdi
  er påvist i de returnerte feltene, men dette dokumenterer ikke kompletthet.

Tre unike, fullt avsluttede kildeobjekter kunne kontrolleres. Fysisk side og
dokumenthash stemmer. **To av tre** har eksakt samsvar mellom sitat og UTF-16-
område. Det tredje har start én posisjon for langt frem. Alle tre avviker
dessuten fra eksakt kildekontrakt ved å fylle printedPage der originaluttrekkets
kildegrunnlag har null. Dette gjør dem ikke automatisk godkjente kilder.
Sitatene er unødvendig lange og gjentas i originalText og sources; denne
dupliseringen bidro til å bruke opp outputrammen før resultatet ble komplett.

## Utfall

**PAA bestod ikke økonomitesten.** Rettet schema og ekte generering fungerer,
og kostnads-/ufullstendighetsstopp fungerer, men resultatet er avbrutt og har
kildekontraktfeil. Det er ingen komplett økonomianalyse eller akseptert
kandidat. Teknisk/TG-dekning er fortsatt uavklart.

Neste nødvendige forbedring er mindre og mer presis output med kodeeide
kildeobjekter og korte kildeankere, slik at AI ikke gjentar hele sider og
kildemetadata. Dette er et funn, ikke en godkjent ny implementerings-/API-runde.

Eksakte request-/response-/fasit-/kostnadsfiler og engangsmarkør ligger kun
privat. Ingen private dokumenter, utdrag, dokumenthash eller request-ID i Git.
Ingen ekstra genereringskall eller push. Ingen omfattende testrunde eller
finans-/screeningendring utført.
