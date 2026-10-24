# F1 — sporing av PDF, faktisk live-input og S2-telling 2026-10-24

**Story 4.5 er stoppet etter Mads sin uttrykkelige beskjed.** Lokal server
er stoppet. R4-S5 er open/suspended. Endring av gatebeviset ugyldiggjør tidligere
arming; dette er kontrollert lokalt uten pipeline eller leverandørkall.
Ingen ny analyse, retry eller menneskelig måling er startet.

## Dokumentet som faktisk ble brukt

Eksakt fil: `tests/fixtures/property-cases/F1-tilstandsrapport.pdf`.

SHA-256: `c3a92dc24004601803928b5ad479165d042cf199f099e190d40b732a58a388cb`.

Denne hashen stemmer med dagens bytes, det opprinnelige Git-innholdet fra
`ab3690bb1dce19f6d383a71c7cd06e90c34698ee`, F1-plan, basis, den faktisk
sendte requestens DocumentBasis, leverandørfunnenes kilder, adapterutfall og
den nå suspenderte S5-planen. Git-historikken for denne filstien viser én
commit med PDF-innholdet; dagens bytes samsvarer med den.

Modellen fikk **sidemerket PDF.js-tekst fra alle fire fysiske PDF-sider**,
med dokumentnavn/hash og metadata, gjennom Responses. Den fikk ikke et annet
dokument eller en sammenslått F1–F4-tekst. Det var ikke en direkte multimodal
opplasting av PDF-bytes til modellen.

Sporbare originalfiler under `story-4-4/`:

| Bevis | Kontroll |
|---|---|
| F1-plan.json / F1-basis.json | F1-identitet/hash, fire fysiske sider |
| F1-request.json | Faktisk request-ID `6597753c-a3cf-4b9a-a07c-410bfeaf120e`; hele DocumentBasis er kontrollert |
| F1-dispatch.json | Faktisk request-SHA-256 `da0f8f74d09d3de0df7a7b3242bac58311ff52c0970f45a6db7a528dc6a916f4` stemmer med bevart request |
| Request etter normalisering av bare requestId | SHA-256 `a1d42854f8ba63f575dc613c9d2ff4d441791f0b36357eedf1a9a0a8d58d51b0`, identisk med original plan |
| Ny PDF.js-ekstraksjon fra dagens PDF | Hele DocumentBasis er identisk med historisk F1-basis; sideteksten er identisk med faktisk leverandørinput |
| F1-provider.json / F1-outcome.json | Ett opprinnelig TG2, «Slitt overflate på baderomsgulv», fysisk side 2, korrekt F1-hash; ingen TG3 |

Ny oppbygging med dagens `createLiveRequest` gjenskaper original request
etter bare requestId-normalisering. Maskinresultatet er bevart i
[F1-sporingskontrollen](story-4-5-f1-sporingskontroll-2026-10-24.json).

## Hva PDF-en inneholder

Alle fire nåværende sider er rendret med PDF.js og visuelt inspisert:

1. «Rapport og opphav»: fiktivt øvingsobjekt, ingen virkelig eiendom/person.
2. «Bad – registrert avvik»: ett eksplisitt TG2, slitt overflate på baderomsgulv.
3. «Avgrensning og kontroll»: opplyser at dette er en kort, fiktiv fire-siders fixture.
4. «Avslutning»: ingen ytterligere registrerte avvik.

F1 har derfor **1 TG2 og 0 TG3**. Dette stemmer med `expected.json`, original
leverandørrespons og Mads sin inspeksjon.

## Hvor 4/4 TG2 og 1/1 TG3 kommer fra

Tallene gjelder samlet S2-utvalg **F1–F4**, ikke F1 alene:

| Rapport | TG2: riktige/forventede | TG3: riktige/forventede |
|---|---|---|
| F1 | 1/1 | 0/0 (ingen TG3) |
| F2 | 1/1 | 0/0 (ingen TG3) |
| F3 | 1/1 | 0/0 (ingen TG3) |
| F4 | 1/1 | 1/1 |
| **Samlet** | **4/4** | **1/1** |

TG3 er «Alvorlig lekkasje i tak» i **F4**, fysisk PDF-side 4 / trykt side 2.
Den tidligere uavhengige evalueringen har allerede disse per-rapport-radene,
og s2-assessment.json oppgir de fem ID-ene F1-TG2-1, F2-TG2-1, F3-TG2-1,
F4-TG2-1 og F4-TG3-1. Ingen fire-TG2/ett-TG3-fasit for F1 er funnet.

Avviket skyldes at den korte kommunikasjonen gjentok **samlede S2-tall uten
tilstrekkelig tydelig kobling til utvalget**, mens brukerinstruksen gjaldt
bare F1. Dette skal presiseres; fixture/fasit skal ikke endres.

## Kontroll av fixturetyper og revisjoner

- F1 er selv en syntetisk/fiktiv **faktisk PDF**. Testgeneratoren lager den
  uavhengig av fasiten. Dette er ikke bevis for kvalitet på virkelige rapporter.
- Historisk live-input er ekte PDF.js-ekstraksjon som nå er gjenskapt fra
  nøyaktig samme bytes. Ingen tagget tekstfixture eller alternativ kontroll-
  adapter er brukt som erstatning i den kontrollerte requesten.
- Demo-JSON for samme PDF-hash er håndskrevet og separat fra live. Demoens
  funn-ID er `F1-TG2-1`; faktisk provider ga `F1-001` og en egen limitation.
  Offline kontrolladaptere kan bruke demodata også med modusetikett live;
  disse prøvene er ikke grunnlaget for det opprinnelige live-/S2-resultatet.
- `F1-tilstandsrapport-endret.pdf` har hash
  `1a3754a89dbe139c926a80b54216f7a6434f1b6b0d02eb87f36bd7c03180d8d3`.
  Det er en egen bytevariant med kommentar, ikke dokumentet fra original F1-live.
  Den inneholder ikke et skjult større funnsett og kan ikke arve F1-live-bevis.
- Andre RT-/TG3-kontrollfixtures har egne PDF-er/fasiter. Ingen av dem matcher
  hash eller sidetekst i den faktiske F1-requesten.

Ingen annen «korrekt F1-PDF» med 4 TG2 + 1 TG3 er funnet eller nødvendig for
å forklare de eksisterende S2-tallene. Tidligere F1-bevis gjelder utelukkende
den eksakte F1-hashen ovenfor.

## Egnethet og minste korrekte retting

F1 er egnet som **minimal kontroll av hendelser, kildebinding og enkel flyt**.
En menneskelig måling kan beskrive akkurat denne trivielle oppgaven. Fire
nesten tomme sider med ett tydelig merket funn gir derimot svært svakt
grunnlag for representativ kontrolltid eller generell tidsgevinst i reell
førstevurdering. Den dekker heller ikke menneskelig TG3-håndtering. F2 er
tilsvarende enkel; F4 tilfører ett TG3. S5 har ikke et låst krav om et bestemt
antall sider/funn eller en ny minimumsstudie; et slikt krav innføres ikke her.

Den minste rettingen nå er å presisere **per-case kontra samlet S2** og holde
S5 stoppet til caseutvalg og hva målingen skal dokumentere er avklart.
Eksisterende F1/fasit/live-originaler beholdes uendret. Hvis en mer
representativ S5-case velges, må den få egen identitet/hash og uavhengig fasit
før live-kjøring; tidligere F1-bevis kan ikke flyttes dit. Ingen slik ny case,
fasit, live-test eller Story 4.5-måling er startet i denne kontrollen.

## Kontroll og prosess

Dette er lesende dokument-/inputkontroll og dokumentasjon av eksplisitt stopp.
Ny genereringskostnad USD 0. Ingen produktkode, fixture, fasit, historiske
request/provider/outcome/receipt-filer eller S2-score er endret. 4.4 står
review, 4.5 backlog, Epic 4 in-progress. 5.4/S6 og 5.5 er urørt.
Aktiv promptlogg følger lokal commit. Ingen push.
