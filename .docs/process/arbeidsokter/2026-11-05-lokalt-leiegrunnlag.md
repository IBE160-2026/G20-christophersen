# Lokalt leiegrunnlag: faktisk kildekontroll, implementasjon og prøving

5. november 2026. Utgangspunkt `eab51511fb961bac03874a5ecd4e15485434e9e3`.
Brukeren autoriserte undersøkelser, statisk referansedatasett, konkret modell,
begge boligprøver og lokal commit. «Fortsett» videreførte oppdraget. Ingen push
eller betalte AI-kall er utført. Aktiv automatisk promptlogg:
[session-01a1ab99-1569-7610-a6b0-2de58679944f.jsonl](../prompts/session-01a1ab99-1569-7610-a6b0-2de58679944f.jsonl).

[Spesifikasjon](../../implementation-artifacts/spec-lokalt-leiegrunnlag.md),
[kildekontroll, konkrete tabeller og metode](../../implementation-artifacts/leieagent-lokale-referanser.md),
[maskinlesbart resultat fra faktisk import](2026-11-05-lokalt-leiegrunnlag-resultater.json).

Kursforankring er sensorveiledningen Del 1 (original PDF lest med PDFKit) og
faglærers brief-tilbakemelding 06.10.2026: sporbar plan–kode, faktisk kjøring,
kildehenvisninger, finans i vanlig kode og eksplisitt usikkerhet. Ingen nye
kurskrav er lagt til.

## Faktisk kildearbeid

Utleiemeglerens kommunikasjonsside, NTB-pressemeldinger fra november 2026,
januar 2026 og mai 2025, Hybels offentlige leieprisside, Q3-rapport og
lanseringsmelding er lest. Novembermeldingen gir bare årsvekst. Mai-meldingen
har absolutte beløp, men kildefotnoten blander annonser og portefølje.
Januarmeldingens særlig dyre utleier brukes ikke som representative celler.
Ingen vekst er konvertert til kronebeløp.

Én offentlig Hybel-rapport ble hentet til `/private/tmp/` og sidene
10/13/14/16/24 rendret og visuelt kontrollert. Ingen masseinnhenting, scraping,
API-integrasjon eller periodisk jobb er laget. Rårapporten distribueres ikke.
20 faktaobservasjoner er manuelt registrert med egne korte beskrivelser og
kilder. Ingen fri gjenbrukslisens til rapportverkene er påstått.

SSB er bevart som egen kilde gjennom uendret kopi av tidligere kontrollerte
2025-råresponser. Produksjonsmodulen har ikke lenger fetch, nett-cache eller
netttransport. Kopien krysskontrolleres mot det arkiverte testgrunnlaget.
Beregningstid og kilde-/kontrolldato skilles i visningen.

## Faktisk resultat fra originale salgsoppgaver

| Bolig | Dokumentert grunnlag | Publisert romreferanse | Selvstendig SSB-scenario | Individuell markedsleie |
|---|---|---|---|---|
| Nøstegaten 65 A | 40 m² BRA-i, 2 rom / 1 soverom; Bergen, bydel ukjent; 152 sider | 13 891 kr/mnd, Hybel Q3 2026, aktive kontrakter, Bergen by/tettsted | 12 000 kr/mnd; 144 000 kr/år, 2025-nivå | Ikke beregnet |
| Rostockgata 96 | 59 m² BRA-i, 3 rom / 2 soverom; Gamle Oslo; 170 sider | 20 426 kr/mnd, Hybel Q3 2026, aktive kontrakter, postnummerkoblet Gamle Oslo | 18 900 kr/mnd; 226 800 kr/år, 2025-nivå, merket 59→60 m² | Ikke beregnet |

Nøstegaten velger ikke Bergenhus. SSBs publiserte 40 m²-celler er 12 600 og
11 300; midtpunkt 11 950 avrundes til 12 000. Sonespennet er 11 300–12 600,
uten tidligere 40 % produktmargin. Utleiemeglerens eldre, blandede Bergen-
referanse 13 900 vises separat. Boligens dokumenterte romfordeling er entré,
stue/kjøkken, ett soverom og bad, med ekstern bod; totalt romantall brukes
uten å telle bod/bad som oppholdsrom.

Rostockgata bruker dokumentert Gamle Oslo fra side 117. Hybels byreferanse
20 382 og bydelsreferanse 20 426 vises uten prisblanding. Nye kontrakters
15 510 og aktive kontrakters 14 430 er blandede boligtypesnitt og bare kontekst.
SSBs celle 01.02 / 3.060 er 18 900, uendret ved den tidligere dokumenterte
59→60-tilnærmingen. Sonespennet er 18 900–18 900; det innebærer ingen påstand
om null individuell usikkerhet. Tidligere 35 % produktmargin er fjernet.

De publiserte romreferansene mangler arealfordeling, individuelle objekter,
standard- og mikrolokasjonskontroll. Byreferansen er ikke adresseverifisert;
Hybels bydeler er koblet fra postnummer. Materialet gir derfor ikke et
forsvarlig individuelt markedsestimat eller kalibrert individuelt intervall.
Ingen forhåndsantatt pris er brukt som mål i formelen eller testene.

Det ubekreftede SSB-økonomiscenarioet beholder tidligere beløp og prioritetsregler:
Nøstegaten brutto 3,56 % og foreløpig 2,93 % etter 25 197 kr kjente kostnader
med eksplisitt overlappingsforutsetning; Rostockgata brutto 2,64 % og foreløpig
2,13 % etter 43 920 kr. Dette er ikke en validering av leieinntekt. Ukjent
kostnadsår, manglende drift/finansiering og ufullstendig teknisk dekning
forblir synlige. Full netto/kontantstrøm og kontrollert screening oppgraderes ikke.

## Verifikasjon som faktisk er kjørt

- `npm run typecheck`, `npm run lint`, `npm run build`: bestått. Eksisterende Vite-varsel om stor klientpakke står fortsatt; ingen ny byggefeil.
- `OPENAI_API_KEY= ANALYSIS_MODE=demo npm test`: 106 filer bestått, én fil hoppet over; 2 163 tester bestått, sju valgfrie tester hoppet over. Kjøringen skjedde før siste kildeadresse-/kontraktssjekk og visningspresisering; endrede deler er deretter verifisert målrettet.
- Fem målrettede modell-/kontrakt-/scenario-/paneltestfiler: 152 bestått før siste parserkanttest. Etter parserkanttesten og SSB-statuspresiseringen: fire berørte testfiler, 147 bestått. Etter siste kildekolonneendring: tre paneltester bestått.
- Faktisk HTTP-integrasjon inngår i fullpakken: global fetch er sperret mens loopback-klienten bruker sin lagrede transport. Gyldig/ugyldig dokument, ufullstendige sider og gjentakelser gir null eksterne kall.
- Playwright `investment-overview.spec.ts` og `rent-real-document.spec.ts`: 14/14 bestått, inkludert begge obligatoriske private originaler, reell dokumentimport, alle sider/kildeoffsets, originalviser, manuell/faktisk leieprioritet og økonomi.
- Etter mer presis SSB-status og åpen kildevisning på mobil: alle fire prøver i `rent-real-document.spec.ts` bestått igjen. Begge private originaler var obligatoriske, uten skip. Null sidefeil og null betalte analysekall er assertions i prøvene.
- Etter at utvalgstypen ble flyttet frem i første kildekolonne: én syntetisk HTTP-/mobilprøve bestått (1/1). Sluttbildet er visuelt kontrollert; utvalgstype er synlig i første kolonne, og tabellen ruller innenfor panelet uten sideoverflow.
- `git diff --check`: bestått.

Første integrasjonsforsøk traff sandboxens loopback-forbud og ble kjørt på
nytt med godkjent lokal porttilgang. Første Playwright-forsøk startet ingen
tester fordi Chromium 1248 manglet. Riktig nettleser ble lastet ned til
`/private/tmp/paa-playwright-browsers`, uten endring i prosjektets avhengigheter.
Sluttprøvene brukte denne stien. Ingen av miljøfeilene er telt som bestått prøve.

Reproduserbar endeprøve med prosjektets Playwright-nettleser installert:

```bash
npm run build
PAA_E2E_PORT=3011 PAA_TEST_NORDVIK_REQUIRED=1 PAA_TEST_NOSTEGATEN_REQUIRED=1 OPENAI_API_KEY= npx playwright test tests/e2e/rent-real-document.spec.ts tests/e2e/investment-overview.spec.ts
```

Private bevis ligger under `private/incoming/local-rent-2026-11-05-results/`;
sluttprøven av kildekolonnen under `private/incoming/local-rent-final-mobile-results/`.
Den versjonerte resultatfilen har SHA-256 for råbevisene og sammendrag uten
PDF-tekst eller personlige kontrakter.

## Egen kodegjennomgang og matrix-audit

Delegert undersøkelse feilet med agenttjenestens bruksgrense. Ingen uavhengig
agentreview hevdes. Hovedagenten undersøkte og implementerte selv, leste den
samlede diffen med nye filer, kontrollerte kildeceller og gjennomførte separat
egenkontroll av kanttilfeller og verifikasjonsdekning. Begrensningen i
review-uavhengighet er reell; test- og kildebevisene over er faktisk kjørte.

Egenkontrollen rettet følgende konkrete funn:

1. Blandet nykontraktsgjennomsnitt kunne feilmerkes som romreferanse i en konstruert respons. Kontrakten avviser nå blandet boligtype som romreferanse og krever samsvar med dokumentets rom/geografi. Negative kontraktstester er kjørt.
2. Ugyldig kilde-URL kunne kaste under schema-refinement. Adresser valideres uten parserunntak og begrenses til offisielle HTTPS-kilder; negative tester er kjørt.
3. Manglende SSB-dekning ble merket som manglende markedsestimat. Overskriften beskriver nå SSB-sammenligningen, mens individuell markedsstatus vises selvstendig.
4. Utvalgstype havnet utenfor første synlige del av tabellen på mobil. Aktive/nye kontrakter og annonser står nå i første kildekolonne; detaljer kan fortsatt rulles horisontalt innen tabellen.

Alle matrix-rader har kjørte tester: Bergen/Nøstegaten og Oslo/Rostockgata i
publiserte referansetester og ekte endeprøver; mangler/motstrid/feil boligtype,
areal uten SSB-dekning, gammel/fremtidig publisering og sperret fetch i
modelltestene; objektbytte og sen respons i nettleserprøvene; manuell/faktisk
leieprioritet i scenario- og endeprøvene. Publiserte referanser endres ikke ved
areal utenfor datastøtten, modifisert respons, kildevekst eller gjentatt analyse.

PAA-LEIE1 står fortsatt åpen i den sentrale avviksoversikten. Denne endringen
er ingen empirisk validering av individuell leie eller usikkerhetsdekning.
