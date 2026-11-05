# Robust PDF-behandling – ekte Nøstegaten og Rostockgata

Dato: 2026-11-05. Utgangspunkt: `9280d8bf8ed15782edb2e8e52a0b13cf81f57f3b`.
Bestilling og automatisk promptlogg ligger i samme lokale leveranse. Ingen betalte
AI-kall, push eller private originaler er autorisert eller utført. Viktige
målinger er samlet i [persondatafri minneoppsummering](robust-pdf-minne-2026-11-05/minneoppsummering.json).
[Spec, implementasjon og reviewtriage](../../implementation-artifacts/spec-robust-pdf-minne.md).

## Faktisk reproduksjon og årsak

Nøstegaten-originalen er identifisert med SHA-256
`f33337aa0f5f2de0b64454541b0bb20bcf7732498755c4078ed1509b3a3f14e8`,
47 605 890 bytes og 152 fysiske sider. Den ble kopiert fra brukerens nedlasting
til ignorert `private/incoming/nostegaten-65-a.pdf`. Samme ekte `runImport`
som HTTP-ruten bruker, avviser med `memory-limit` etter omtrent 1,2 sekunder.

Fasesporing av baseline: container ca. 360,08 MiB RSS, sidetre 409,50 MiB,
første tekstgruppe 515,88 MiB. Importbarnets egen JS-heap var da bare 20,63 MiB;
buffer-/worker-/nativearbeid inngår også i prosessens RSS. Minne må derfor ikke
vurderes bare med hovedtrådens heap. En separat diagnose uten produktets RSS-vakt
fullførte 152 sider / 153 005 tegn, men nådde 600,70 MiB. Den kjøringen er
uttrekksfasit og undersøkelsesbevis, ikke en fungerende brukerflyt.

Per-operasjonsmåling i den gamle parseren lokaliserer de store hoppene til
`extractPage` / PDF.js-tekst- og fontarbeid: fysisk side 1 økte RSS med ca.
60,83 MiB, side 2 med 86,39 MiB og side 3 med 46,02 MiB. Workerheapen steg til
61,30 / 146,50 / 185,20 MiB etter disse sidene. Rasterinspeksjonen ga vanligvis
langt mindre tillegg, rundt 2 MiB. Dette er ikke en feil som primært skyldes
OCR av alle prospektsidene.

20 sider er et sidetall, ikke et minnebudsjett. De første sidene i dette formatet
kan alene fylle parserens tilgjengelige minne. `manager.cleanup()` rydder
logiske parser-/fontcacher, men returnerer ikke nødvendigvis V8-/allocatorens
høyvannsnivå til operativsystemet. Samtidig kostet hver PDF-kopi omtrent 45,4 MiB.
Den gamle store IPC-meldingen, valideringssnapshotet og nye kopier per worker
løftet grunnforbruket før tekstarbeidet startet.

Dessuten importerte hovedprosessen det offentlige PDF.js-/canvasbiblioteket
selv om 200-sidersprofilen bruker en separat containerworker. Den pinnede
`@napi-rs/canvas/index.js` registrerer automatisk system- og brukerfonter.
Containerkontrollen renderer ikke, og trenger ikke denne fontregistreringen.
En isolert prøve uten slik registrering reduserte grunnforbruket ytterligere;
fontregistrering alene var likevel ikke tilstrekkelig retting.

## Gjennomført retting

- Opplastingen strømmer over barnets stdin med eksakt kontroll av forventet
  byteantall og 50 MiB-grensen. Bare liten metadata går over IPC. Ett eid
  `SharedArrayBuffer`-grunnlag deles lesende med interne parserworkere.
- Den offentlige valideringsfunksjonen beholder snapshot før første await,
  også hvis innringer endrer sin buffer. Den interne, eide importveien slipper
  en ny kopi. Offentlig loader lastes bare i legacy-grenen som bruker den.
- Bare containerworker får `DISABLE_SYSTEM_FONTS_LOAD=1`; originalviseren og
  lokal Vision endres ikke. Container- og sidetreparser avsluttes sekvensielt.
- Parserworkere har høyst 20 sider, 256 MiB gammel og 16 MiB ung V8-generasjon.
  Tidligere garbage collection begrenser midlertidig tekst-/fontarbeid.
  Workeren avsluttes etter en hel side ved heap over 96 MiB eller RSS over
  360 MiB. Tidligere worker er alltid avsluttet før neste opprettes.
- Et ekstra parservern på 448 MiB i produktflyten bevarer leverte hele sider
  og tekst før avbrudd. Den berørte fysiske siden blir eksplisitt uavklart;
  urørte neste sider forsøkes videre. Vedleggsmetadata bevares. Ugyldig protokoll
  og eksisterende samlede tekstgrenser avvises fortsatt.
- ASCII85 bruker kompakt, begrenset bytebuffer. Hvert dekodertrinn har
  utgangsgrense. Streamkontroll leser i små steg i stedet for å forhåndsreservere
  minst 2 MiB for enhver liten strøm; unødvendige dekoderkopier er fjernet.
- Målecallbacken har en streng kontrakt med fase, fysisk side og tellere:
  RSS, heap, eksternt minne og arraybuffere. Den inneholder aldri PDF-tekst,
  filnavn eller adresse. Native OCR-RSS måles separat.

To mellomforsøk fullførte importen under grensen, men avbrøt tekst på flere
sider. Disse ble forkastet som løsning: bare 122 908 og 130 609 tegn ble beholdt.
Et tredje forsøk beholdt hele teksten, men lå rundt 448 MiB og tok 45 s.
Først kombinasjonen med tidligere garbage collection ga både komplett tekst,
bedre margin og normal behandlingstid. Private råbevis fra alle forsøk beholdes.

## Før og etter på ekte dokumenter

Node 24.21.0, uendret produktvakt på 512 MiB RSS og 256 MiB heap i importbarnet.
Ung V8-generasjon er begrenset til 16 MiB; gammel generasjon beholder 256 MiB. Ekstern RSS samples hvert 100 ms;
operasjonssnapshots supplerer samplingen. Tall er observerte topper, ikke en
matematisk garanti for enhver PDF eller et ubegrenset peak-monitorverktøy.

| Dokument | Før | Etter: importprosess RSS | Margin til 512 | Tid etter | Beholdt tekst |
| --- | --- | ---: | ---: | ---: | --- |
| Nøstegaten 65 A | `memory-limit`, 515,88 MiB observert før stopp | 358,44 MiB | 153,56 MiB | 19,34 s | 152/152 sider, 153 005 tegn |
| Rostockgata 96 | Fullførte, 448,36 MiB, 13,60 s | 336,55 MiB | 175,45 MiB | 13,89 s | 170/170 sider, 293 168 tegn |

Rostockgata-baseline er kjørt fra en isolert privat kopi av akkurat
`9280d8b`, med originale fixturer og samme private OCR-binær. Hovedarbeidstreet
ble ikke byttet eller rullet tilbake.

| Fase, Node RSS | Nøstegaten | Rostockgata |
| --- | ---: | ---: |
| Innlesing | 175,45 MiB | 159,95 MiB |
| Containerkontroll | 254,41 MiB | 228,47 MiB |
| Uavhengig sidetre | 302,97 MiB | 276,75 MiB |
| Tekstuttrekk | 358,44 MiB | 336,55 MiB |
| Rasterinspeksjon | 358,44 MiB | 331,64 MiB |
| Lokal analyse | 238,11 MiB | 268,89 MiB |
| Lagret økonomi / lagringskontroll | 257,72 MiB | 291,09 MiB |
| Node mens lokal OCR arbeider | 258,44 MiB | 292,14 MiB |
| Serialisering | 230,92 MiB | 165,17 MiB |
| Separat native OCR-prosess | 314,97 MiB | 322,67 MiB |

**Viktig målegrense:** Dagens 512 MiB-vakt gjelder importbarnets RSS. Swift/OCR
har egen prosess og eget eksisterende ressursvern. Samplet samtidig Node+OCR-RSS
var 544,05 og 598,84 MiB. Summen inkluderer delte OS-sider og er ingen PSS-måling,
men den viser at dette ikke er en samlet 512 MiB-garanti for hele prosesstreet.
Det er ikke skjult ved å rapportere OCR-minnet som null eller som Node-heap.
Ingen ressursavbrutte tekstsider forekom i sluttmålingen. Alle 16/16 og 19/19
rapportbilder ble faktisk lokalt lest. Parser- og OCR-arbeid overlapper ikke.

## Dokumentresultater og bevarte begrensninger

Nøstegaten har valgfrie innholdslag (`/OCProperties`). Baseline hadde allerede
uavklart status på samtlige 152 sider; katalogens lagtilstand er ikke verifisert
av dagens støttede kontroll. Nytt svar sier dette konkret, mens hele teksten
beholdes med originale offseter. Tekstdigesten er uendret:
`6392291608dc91b47cbc91126f74821a7d9a363992b81eb8b2042519ce4b4935`.
Rapportområdet 86–101 beholdes, med alle 16 lokale OCR-sideposter. Lagene får
ikke automatisk grønn status. Økonomifeltene mangler derfor verifiserte beløp,
leieestimatet er unavailable og teknisk fullstendighet er blocked/incomplete.
Dette er en eksplisitt eksisterende formatbegrensning, ikke et nytt minnetap.

Rostockgata beholder hele tidligere tekst-/status-/rasterkart, rapportområdet
36–54, 19 lokale OCR-sideposter, kildebelagte økonomifelter og uavklart teknisk
fullstendighet. Leieagenten og finansmodulens tidligere sperrer/verdiutregning
kontrolleres i den eksisterende ekte nettleserprøven.

Ingen av prøvene beviser universell støtte for alle PDF-formater eller generell
TG-recall. [Den sentrale oversikten](../../implementation-artifacts/deferred-work.md)
beholder PAA-SO2 og PAA-LEIE1 åpne; lagstøtte og generell kvalitetsdekning lukkes ikke.

## Faktisk verifikasjon

Build og lint består. Ekte nettleser-/regresjonsutfall og uavhengig review føres
nedenfor etter avsluttet kontroll; ingen planlagt prøve regnes som bestått.

Råmålinger, uttrukket dokumenttekst og nettleserbilder ligger bare i ignorert
`private/incoming/pdf-memory-*` og `private/incoming/robust-pdf-final-results`.
Den offentlige målekommandoen står i README og `tools/pdf-memory/probe.ts`.

Første nettleserrunde: tre tester bestod (tidligere ekte enebolig, positiv
SSB-leilighet og Rostockgata). Nøstegaten nådde full import, tekstfasit og OCR,
men den nye testens kildeknapp var tvetydig fordi både hovedside og dialog
hadde samme etikett. Testen ble avgrenset til dialogen; produktkode eller
forventet dokumentresultat ble ikke endret.

Automatisk godkjenningskontroll avviste først SSB-nettprøven på antatt deling av
private boligdata. Kodekontroll viste at produksjonen henter hele offentlige
09897-tabellen med wildcard for soner/areal, år og Husleie, uten request-body,
adresse eller dokument. Testorakelet bruker hardkodede offentlige cellekoder.
Ny kjøring med dette eksplisitte beviset ble godkjent. Ingen avvist operasjon
ble omgått eller kjørt indirekte.


Full unit-/integrasjonsregresjon før reviewrettinger: **2 120 bestått**, 7 eksisterende
native-skip, 103 filer, 82,28 s. Bygg/lint bestod. Etter lokatorrettingen bestod
Nøstegaten-E2E på 21,4 s, med eksakt tekstfasit og fysisk kildeåpning på side 86.
Skjermbildene for desktop/mobil er visuelt kontrollert; manglende økonomi/leie og
sperret teknisk fullstendighet fremstilles eksplisitt.

Tre uavhengige reviewlag fant konkrete kanttilfeller: tap av tekstchunks før hel
side, forkastet senere vedleggsmetadata, ubegrensede oppstartsavbrudd, manglende
kontroll av ventende tekst i sluttsvar, utestet RSS-timer, utilstrekkelig OCR-akseptanse
i Nøstegaten-prøven, gammel uttrekksversjon, verktøyets reelle filsti/rettigheter og
sene OCR-målinger. Alle funn er vurdert enkeltvis i specens reviewtriage og rettet;
sluttverifikasjon etter retting følger nedenfor. Uttrekksversjonen er nå
`bounded-pdf-text-2`; historiske arkiver/promptlogger omskrives ikke. Økonomipanelet
viser den felles konkrete sidebegrunnelsen direkte for Nøstegaten, og skiller
rapportens lokale bildekontroll fra økonomiens tekstgrunnlag.

Måleverktøyets symlinkvern er prøvd med offentlig fixturesti og en resultatmappe
under private/ som peker til en ekstern tom testmappe. Det avviste før kjøring og
skrev ingen filer der. Nye resultater opprettes eksklusivt med modus 0600;
verktøyet overskriver ikke tidligere bevis. Målingene over inneholdt ingen native
samples etter OCR-end; feilen i sene callbacks påvirket ikke de registrerte tallene.


Hovedagentens siste faktiske V8-kontroll avdekket at Node-flagget
`--max-old-space-size=256` overstyrer workerens ønskede gamle generasjon, også med
tomt execArgv. En deklarert 128 MiB-verdi var derfor ikke en reell 128 MiB-grense.
Dette er rettet til en sannferdig 256/16-konfigurasjon og verifisert med faktisk
`v8.getHeapStatistics().heap_size_limit`. De vellykkede målingene over ble allerede
oppnådd med denne effektive gamle generasjonen; forbedringen ved den siste
GC-endringen skyldtes den mindre unge generasjonen og workeravslutningen. Ingen
sikkerhetsmargin begrunnes med en minnegrense Node ikke håndhever.


Sluttmålingen etter alle protokoll-/reviewrettinger er nå gjentatt med v2:
Nøstegaten **358,44 MiB**, 19,34 s; Rostockgata **336,55 MiB**, 13,89 s.
Begge har alle teksttegn bevart, ingen ressursavbrutte tekstsider og alle
16/19 rapportbilder vellykket lest. Tidligere vellykket måling (363,44/340,34 MiB)
beholdes separat som `firstVerifiedRun` i måle-JSON. Nye private utdata har modus
0600. Faktisk målt V8 heapLimit for tekstworkeren er 280 MiB totalt
(256 gammel + begrenset ung generasjon), ikke en påstått 128 MiB-grense.
Uavhengig ny edge-case-kontroll av den inkrementelle protokollen fant ingen
konkrete restfeil i tekst/quota, oppstartsavbrudd, sluttsvar eller workeravslutning.


## Endelig sluttakseptanse etter review

- `npm run build`: bestått. Eksisterende Vite-varsel om stor nettleserbunt står fortsatt; det er ikke et parserminnebevis.
- `npm run lint`: bestått.
- `npm test`: **2 133 bestått**, 7 eksisterende native-skip, 105 filer, 82,00 s.
  Råutskrift: `/private/tmp/paa-robust-pdf-reviewed-vitest.txt`.
- Samlet Playwright: **4/4 bestått uten skip**, 1,1 min. Tidligere ekte enebolig,
  positiv gratis SSB-leilighet, Rostockgata (20,3 s) og Nøstegaten (21,4 s).
  Eksakt kommando med Node24 på PATH og tom AI-nøkkel:
  `PAA_TEST_NORDVIK_REQUIRED=1 PAA_TEST_NOSTEGATEN_REQUIRED=1 PAA_TEST_SSB_NETWORK=1 node node_modules/@playwright/test/cli.js test --config private/incoming/robust-pdf-reviewed.config.ts tests/e2e/rent-real-document.spec.ts`.
  Privat JSON og bilder: `private/incoming/robust-pdf-reviewed-report.json` og
  `private/incoming/robust-pdf-reviewed-results/`.
- Nøstegaten krever nå faktisk feilfri OCR med rasterdigest og tekstlinjer på
  samtlige 16 rapportsideposter. Rostockgata krever tilsvarende på alle 19.
  Begge gjennomfører fysisk kildeåpning, bevart sidekart og mobil uten horisontal
  scrolling. Betalte ruter er blokkert og har null kall; ingen pageerror.
- Siste uavhengige edge-case-kontroll etter patcher er uten konkrete restfunn.
  Hovedagenten har lest siste kode og kontrollert alle triagerte rettinger.
- Automatisk bekreftet mot baseline: Rostockgatas 170 sideposter er identiske,
  inkludert status/årsak/raster; økonomiverdier/status er identiske. Nøstegatens
  152-siders tekstdigest er uendret, også etter inkrementell tekstprotokoll.

Den eksisterende demoen på port 3000 ble kontrollert med PID/arbeidsmappe/kommando,
avsluttet med SIGTERM og startet med oppdatert testet kode, Node 24.21.0, demo,
tom AI-nøkkel og FINN av. Rot og `/api/document-import-config` svarer HTTP 200;
live-import er fortsatt deaktivert. Nettleseren må laste ny bundle etter
uttrekksversjon v2. Ingen .env-fil eller tidligere promptlogg ble endret.

Alle endringer, denne verifikasjonen og aktiv automatisk promptlogg samles i
én lokal commit. Private originaler/tekstuttrekk/bilder er kontrollert ignorert.
Ingen push eller betalte AI-kall er utført. Eksisterende PAA-SO2/PAA-LEIE1 og
lag-/TG-/modellkvalitet lukkes ikke av denne avgrensede minnefiksen.
