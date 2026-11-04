# Rostockgata 96: automatisk dokumentøkonomi og foreløpig netto

Utgangspunkt: `fae71a3180cd63e20211188821cf306c1c451d1b`. Brukerbestilling fra samme aktive Codex-sesjon ligger automatisk appendert i `../prompts/session-01a1a651-52fd-7033-b614-e00beb804981.jsonl`. Ingen andre endringer i utgangspunktet. Nytt arbeid er autorisert frem til lokal commit, uten push eller betalte KI-kall.

[Spesifikasjon](../../implementation-artifacts/spec-rostockgata-automatisk-netto.md). Konsept A videreføres; generell OCR og TG-utvikling er utenfor denne oppgaven. Sensorveiledningens eksisterende kildeuttrekk og faglærerens brief-tilbakemelding er lest: særlig ekte endeprøve, kildehenvisninger, etterprøvbare kodeformler og skillet fakta/estimater/ukjent. Det er ikke lagt til nye kurskrav.

## Faktisk årsak og dokumentgrunnlag

Prisantydningen 8 600 000 var allerede `available` fra fysisk PDF-side 4. Den måtte registreres manuelt i forrige prøve fordi `economySuggestions` krevde kjent fellesgjeld for P; `local-plan` forsto bare numeriske valutaetiketter. Ingen eksplisitt negativ gjeldstekst ble tolket. Dette var et mangelfullt lokalt økonomiuttrekk, ikke manglende PDF-dekning eller OCR-feil.

Fysisk side 28 dokumenterer «Ingen lån registrert for sameiet.» og «Seksjonen har ingen gjeld per. 26.10.2026». Dato og ordrett kilde skal følge nullbeløpet; null er ikke utledet fra fravær. Registrerte pant og juridisk sikringsinformasjon er ikke fellesgjeldsbeløp.

Fysisk side 26 viser 3 660 kr/mnd med inkluderte delposter 2 704 kr felleskostnader, 159 kr internett og 797 kr a-konto fyring. Summen stemmer. Kommunale avgifter, felles bygningsforsikring, fellesstrøm, drift/vedlikehold og forretningsfører-/styrehonorar inngår allerede. Side 27 opplyser årlig avregning av varme/varmtvann per 31.12, uten endelig beløp. De udaterte fellesutgiftene får ikke året 2026 fra gjeldsdatoen eller andre sideavsnitt.

Original: privat `private/incoming/nordvik-rostockgata-96.pdf`, 170 sider, 36 900 539 byte, SHA256 `3e2dd467c11785c1de7c8c79b8e5f58f786e87416f7dc9b14f7a2d713ec6cb70`. Alle sider og den integrerte rapporten på 19 sider skal beholdes. Ingen privat PDF eller rådata skal stages.

## Beregningsfasit og grenser

Ved SSB 2025 / sone 01.02 / 3.060 er referansen 18 900 kr/mnd, 226 800 kr/år. 59 m² bruker 60 m² som tidligere avgrenset og merket tilnærming. 12 200–25 600 kr/mnd er ukalibrerte scenarioer, ikke en empirisk sannsynlighetsfordeling eller dokumentert markedsleie.

- Automatisk P: 8 600 000 + 0 = 8 600 000 kr, uten kjøpsomkostninger; prisantydning er ikke en gjennomført kjøpesum.
- Kjent årsdrift: 3 660 × 12 = 43 920 kr. 2 704 + 159 + 797 teller ikke igjen.
- Foreløpig netto før øvrige ukjente kostnader og finansiering: 226 800 − 43 920 = 182 880 kr/år.
- Foreløpig avkastning: 182 880 / 8 600 000 × 100 = 2,1265116279… %, vist 2,13 %.
- Brutto: 226 800 / 8 600 000 × 100 = 2,6372093023… %, vist 2,64 %.

Dette sammenstiller SSB 2025-nivå med dokumenterte løpende fellesutgifter uten kjent kostnadsår. Ingen skjult prisjustering eller felles år påstås. Eiendomsskatt, innvendig vedlikehold, ledighet, utleie/forvaltning, privat forsikring/strøm, endelig varmeavregning og kostnadsfordeling mellom eier/leietaker er uavklart. Manglende beløp er ikke null. Full D, full nettoyield, finansiering/kontantstrøm og screening har fortsatt egne kontrollporter. Teknisk risiko er fortsatt ufullstendig.

## Verifikasjon

Første build og lint bestod (Node 24.21). Full unit-/integrasjonskjøring og Playwright ble startet samtidig. Fullpakken ga 2 088 bestått og 7 eksisterende skip og 2 tidsavbrudd på 5 000 ms i 200-sidersprøvene `import-review-ui` og `combined-import-budget` (83,10 s). Ingen assertion- eller uttrekksfeil ble rapportert i disse; sluttkjøringen ble gjort separat etter reviewrettingene. Første feilbevis beholdes i `/private/tmp/paa-nordvik-netto-vitest.txt`.

Første brede Playwright: 25/25 bestått, ingen skip (1,6 min), med faktisk lokalserver, installert Chromium og ekte gratis SSB. Nordvik-prøven brukte 20,0 s. Hele automatisk økonomi-sjekken skjer før noen registrering eller redigering. Separate senere leieregistreringer tester fortsatt prioritet. Kildeviseren åpnet pris, felleskostnader og begge gjeldskilder; alle 170 sider og 19 rapportsider beholdt eksisterende ressurs-/TG-verifikasjon. `errors=[]`, `paid=[]` i råbeviset. Fersk uavhengig SSB-cellefasit kl. 22:32:32 UTC bekreftet 2025/01.02/3.060/18 900 og 35 % ukalibrerte scenarioer.

Kommando for den brede prøven, fra prosjektroten med Node 24.21 på PATH:

```bash
PAA_TEST_NORDVIK_REQUIRED=1 PAA_TEST_SSB_NETWORK=1 npx playwright test --config private/incoming/rostockgata-rent.config.ts --reporter=list --output=private/incoming/rostockgata-netto-results
```

Privat config er uendret fra [forrige økts fullstendige ikke-sensitive config](2026-11-04-rostockgata-leieestimat.md): port 3108, demo, tom OPENAI_API_KEY, FINN av, installert Chromium 1243 og testfilene app-shell/investment-overview/rent-real-document. Portabel versjonert alternativkommando står i README, med privat original og lokal bildeleser som forutsetning. Ingen nøkler, private dokumenter eller rådata føres inn i Git.

Første råbevis: `private/incoming/rostockgata-netto-results/rent-real-document-ekte-No-0c871-reftet-økonomi-gjennom-HTTP/` med import/SSB/fasit og desktop-/mobilbilder. Logg `/private/tmp/paa-nordvik-netto-playwright.txt`.

Eksakte UTF16-kilder bekreftet i råbeviset: nullgjeld28[661,702), ingen sameielån28[576,609), felleskostnader4[210,240) og26[4412,4447), inkludert innhold26[4524,4680), delpostblokk26[4448,4523). Alle kildesitater matcher uendret tekst ved sine originale posisjoner.

## Review

Tre uavhengige lag gjennomgikk diffen på 59 060 byte. 13 individuelle funn er vurdert i [spesifikasjonens reviewtriage](../../implementation-artifacts/spec-rostockgata-automatisk-netto.md#review-triage-log). Rettelser omfatter motstridende positiv gjeld med valutasuffiks, datogrense/kildelengde, legitime kostnadseksklusjoner og faktisk inkluderingsbelegg, underpostenes drifts-/gjeldsavstemming, og visning ved ukjent/manuell P. Verifikasjonslaget krevde en uavhengig ikke-nullgjeld-fasit for det nye rentefratrekket. Hovedagentens faktiske kildekontroll avdekket også at varmeavregningens «pr.» avbrøt den nye regexen; dette er rettet med eksakt side 27-kilde og regresjon.

## Sluttverifikasjon etter review

- `npm run prepare:visual`: lokal bildeleser klar; generell OCR er ikke endret.
- `npm test`, kjørt alene: **2 106 bestått, 7 eksisterende skip**, 101 beståtte filer og én eksisterende skipfil, 82,66 s. Ingen tidsavbrudd. Logg `/private/tmp/paa-nordvik-netto-final-vitest.txt`. De tidligere to avbruddene er bevart, ikke skjult eller fikset ved å øke testfristen.
- `npm run build`: TypeScript og produksjonsbygg bestått; eksisterende advarsel om stor klientbundle. Logg `/private/tmp/paa-nordvik-netto-final-build.txt`.
- `npm run lint`: bestått. Logg `/private/tmp/paa-nordvik-netto-final-lint.txt`.
- Etter review: alle tre dokument-/SSB-Playwright-prøver **bestått uten skip**, 42,8 s. Ekte Nordvik 19,7 s. Samme kommando som over, med `tests/e2e/rent-real-document.spec.ts` og `--output=private/incoming/rostockgata-netto-final`. Logg `/private/tmp/paa-nordvik-netto-final-playwright.txt`.

Ny uavhengig live-SSB-fasit kl. 22:37:44 UTC bekreftet 18 900 / 226 800 / 12 200–25 600, statistikkår 2025, sone 01.02, arealreferanse 3.060. Automatisk P, gjeld, komponenter, 43 920 kr i årsdrift og foreløpig netto ble kontrollert før noen manuell registrering. Full nettoyield og kontantstrøm stod ukjent, TG `incomplete`. Ingen pris-, leie- eller driftsbekreftelse ble gitt av automatikken. Senere registrert forventet og faktisk leie beholdt forrang i egne assertions; det er konstruerte prioritetstester, ikke bevis for en faktisk leiekontrakt.

Nytt råbevis ligger under `private/incoming/rostockgata-netto-final/rent-real-document-ekte-No-0c871-reftet-økonomi-gjennom-HTTP/`. `errors=[]`, `paid=[]`. Varmeavregningen finnes nå ordrett på fysisk side 27, UTF16[0,90), og kildeviseren åpner også denne siden. År for fellesutgiftene forblir null. Alle kildeposisjoner matcher den uendrede originalteksten. Desktop- og mobilbilder er lagret privat; 390 px-ombryting og fravær av horisontal overflow er testet.

Hovedagenten kontrollerte også bildene visuelt. Den nye prisforklaringen viste en lang generert dokumenthash på mobil; kun denne tekniske strengen fjernes fra den synlige forklaringen, mens lagret kildeidentitet og økonomisemantikk beholdes. Kun den automatisk genererte hashteksten skjules, identifisert mot gjeldende dokument og automatisk P-eierskap. Manuelt registrert kildetekst beholdes ordrett. De 5 målrettede UI-testene bestod, inkludert ny kontroll av uendret lagret kilde og bevart prisantydningsbetydning. Nytt build/lint er grønt (`/private/tmp/paa-nordvik-netto-ui-{build,lint}.txt`). Dette er eneste kodeendring etter den grønne fullpakken; fullpakken ble ikke gjentatt for en ren presentasjonsretting.

Ytterligere ekte Nordvik-sluttprøve etter denne visningsrettingen: **1 bestått, ingen skip**, 20,2 s for selve prøven / 22,4 s samlet. Kommandoen over med `--grep 'ekte Nordvik'` og `--output=private/incoming/rostockgata-netto-final-ui`. Logg `/private/tmp/paa-nordvik-netto-final-ui-playwright.txt`; samme private undertre med rådata og ferske desktop-/mobilbilder. `errors=[]`, `paid=[]` bekreftet også her. Desktopbildet er visuelt kontrollert etter rettingen; økonomiformel, forbehold, dato og kildeknapper er lesbare. Mobilombryting er fortsatt testet uten horisontal overflow.

Den tidligere lokale demoen på port 3000 ble identifisert med eksakt kommando og prosjektets cwd før restart. Ny server kjører oppdatert kode med Node24.21, demo, tom OPENAI_API_KEY og FINN av. HTTP200 er bekreftet. Ingen .env-fil er lest, endret eller lastet av denne oppstarten. Aktiv promptloggs tidligere byteinnhold er kontrollert uendret; bare én ny automatisk promptlinje er lagt til.

Ingen generelle TG-, modellkalibrerings- eller kostnadsdekningsporter er lukket. Det lokale økonomiuttrekket har bevisst smal grammatikk; ukjente formuleringer krever fortsatt kontroll, og prisantydning er ingen avtalt kjøpesum. Ingen betalte KI-kall eller push. Ingen private originaler/råresponser/bilder er lagt til Git.
