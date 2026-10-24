# Mads — måleskjema og faktisk gjennomføring av S5

**STOPPET av Mads 2026-10-24. Ikke gjennomfør måling eller Start analyse. Serveren er stoppet, tidligere arming er ugyldiggjort. Se [dokumentsporing og caseegnethet](story-4-5-f1-dokumentsporing-2026-10-24.md).**

**Ikke startet. Alle mennesketider er blanke.** Plan-ID `S5-2026-10-24`.
Mads er deltaker. Utvalg: F1/F2/F4, ett planlagt nytt forsøk per case,
sekvensielt; F3 med L=null er utenfor. Ingen tidligere målinger gjenbrukes.
Ingen automatisk retry eller automatisk menneskekontroll.

## Internt prosessbevis — fylles av Codex

Mads skal ikke fylle dette detaljskjemaet. Den korte operative instruksen
ligger i [F1-instruksen](story-4-5-f1-instruks.md). Codex henter tekniske
metadata, hasher, versjoner, varigheter og kostnader fra repo og originalbevis.
Mads utfører bare vurderingen og leverer opptak/notater og observerte resultater.
Mennesketidene nedenfor fylles først fra faktisk gjennomføring.

## Oppsett og preflight — faktisk bekreftelse før første forsøk

| Felt | Faktisk verdi / bevis |
|---|---|
| Deltaker | Mads (bekreftet av bruker 2026-10-24) |
| Faktisk gjennomføringsdato og tidssone | |
| Maskin / OS-versjon | macOS 26.6.2 (25G83), arm64; lest med sw_vers/uname 2026-10-24 |
| Nettleser / versjon | Google Chrome 155.0.8059.85 installert; valgt for forsøket |
| Appadresse / tydelig Live analyse | http://127.0.0.1:3000; GET / og /api/analysis-config verifisert HTTP 200/live uten analyse-POST |
| Full kodecommit etter bestått regresjon | Produkt: 43c0a693d7517c59835078205bfe72611697dc05; 1082 Vitest / 195 E2E / 3 dev / 37 komponent / 13 sikkerhet bestått. Ny manuell hjelper identifiseres separat i forsøksplanen. |
| Arbeidstreet ved måling / eventuell avviksliste | Ved klargjøring kun ny intern dokumentasjon/helper; ingen endret produktkode. Codex registrerer faktisk status ved forsøket. |
| Video-/opptaksprogram og filformat | Valgt: macOS Skift–Cmd–5, kontinuerlig skjermopptak. Faktisk format/oppløsning leses fra levert fil. |
| Prøveopptak lesbart, klikk/liste synlig, fil/bildefrekvens | Kontrolleres fra levert originalopptak av Codex; Mads skal ikke registrere tekniske videofelt. |
| Felles tidsgrunnlag | Opptakets relative tidsposisjoner; Codex leser faktisk oppløsning og regner varigheter fra synlige hendelser. |
| Mads har forstått start/stopp og er klar | |
| Tidligere kjennskap til casene/fasit/app | |
| Root har bekreftet originaluttrekk-/HTTP-/kostnadsopptak i ny mappe | Ja: separat reviewet manuell helper, ny mappe S5-2026-10-24-F1-01, eksklusive writes; teknisk oppstartskontroll med kun GET bestått. |
| Dagens pris/kilde/dato (root, uten API-kall) | 2026-10-24: [OpenAI Docs](https://developers.openai.com/api/docs/models/gpt-6.1-sol), USD/MTok input 2, cached 0.10, cache write 2.50, output 10; default, kort kontekst. |
| Faktisk konto-/prosjektgrense og tilgjengelig dekning kontrollert | Mads bekreftet 2026-10-24 uendret USD 2-grense og intet annet forbruk; tidligere prepaid USD 5. Dette er brukerbekreftelse, ikke nytt admin-API-innsyn. |
| Tidligere prosjektforbruk avstemt (historisk USD 0.016072) | USD 0.016072 fra originale receipts, bruker bekrefter intet annet forbruk 2026-10-24. |
| Eventuelle andre/ukjente belastninger avstemt | Ingen, eksplisitt bekreftet av Mads 2026-10-24. |
| Konservativ reservasjon for første forsøk / gjenværende dekning | USD 1.53 inkl. konservativ cache-write-sats: 100000 × 2.50/1e6 + 128000 × 10/1e6. Maksimum samlet USD 1.546072 < USD 2 < R1 USD 20. Ny plan håndhever dette før transport. |
| Root: R4-S5 faktisk lukket og første F1-forsøk eksplisitt klart | R4-S5 closed på person/miljø/metode og konto. Root-preflight godkjenner lokal arming for Mads sitt senere klikk; faktisk menneskelig gjennomføring ikke startet. Se intern F1-preflight og separat armed.json. |

R1: GPT-6.1 Sol `gpt-6.1-sol`, SDK 6.9.1, Responses, low/default,
prompt/schema 1/1, kontrakt/uttrekk 2/1, max output 128000, deadline 120000 ms,
ingen retry. Root kontrollerer at disse fortsatt gjelder den fryste versjonen.
USD 20 er samlet R1-tak; tidligere operative USD 2-kontogrense kan være
strengere og skal kontrolleres. Gamle priser/reservasjoner er ikke ny preflight.

## Manuell referanse — du gjør arbeidet selv, uten KI/appens funnliste

Gjennomføres for samme case, helst før du ser det nye KI-uttrekket. Hvis du
allerede kjenner caset/fasiten, noter det; det gjør sammenligningen begrenset.
Finansverdiene og PDF-en er klargjort før start, som i S5-live. Bruk blanke
notater, original-PDF og vanlige hjelpemidler; ikke kopier forventede funn.

- Start kontinuerlig opptak. **t_man_start:** første handling som starter din
  lesing av den klargjorte originalrapporten for førstevurderingen.
- Les rapporten selv. Noter eksplisitte TG2/TG3, beskrivelse, fysisk PDF-side,
  usikkerhet og egne rettinger. Kontroller at notatlisten dekker rapporten;
  håndter alvorlig TG3 med eksplisitt status. Uavklart er tillatt.
- **t_man_slutt:** du erklærer listen ferdig kildekontrollert og bekreftet,
  med håndtert TG3-status. Si «manuell kontroll ferdig» og lagre listen, så
  stoppunktet kan kontrolleres i videoen. Avbrudd/manglende kontroll føres
  ufullført; ingen nulltid.
- Registrer de faktiske aktivitetene, notatene og eventuelle avvik. Deretter
  kan du beregne nøkkeltall og anbefaling med de låste reglene og registrere
  resultatet **utenfor den sammenlignbare dokument-/kontrolltiden**.

Avgrenset manuell referanse er dermed dokumentlesing, uttrekk og kontroll,
sammenlignbar med live hovedanalyse + kontroll. Den er ikke total manuell
investeringsarbeidstid. Eventuelle andre aktiviteter/tider oppgis separat;
brukerens tidligere anslag og syntetiske tider brukes ikke som referanse.

## Live — eksakte målepunkter og dine handlinger

Root har på forhånd opprettet en ny forsøksmappe og bekreftet trygg
oppfanging av faktisk originaluttrekk, terminalutfall og kostnad. Skjermvideo
alene erstatter ikke disse originalbevisene. Start et kontinuerlig opptak;
bruk samme fil/tidsgrunnlag for alle tre hendelser i forsøket.

1. Registrer og bekreft casets P/L/D/J/Ymin i appen. D/J er årsbeløp uten
   overlapp, L er forventet årsleie med eksplisitt kilde/forutsetning. Last
   opp riktig støttet PDF og vent på klargjøring. Dette er **før t_start**.
2. **t_start:** tidspunktet for ditt faktiske trykk på «Start analyse».
   Trykk én gang. Ikke gjør automatisk eller manuell retry ved feil.
3. Etter terminal analyse går du straks til «Gå til Kontroller funn».
   **t_liste:** første tidspunkt den ferdige validerte funnlisten med
   beskrivelser, fysiske PDF-sider og eventuell usikkerhet faktisk er synlig.
   HTTP-/modellslutt er ikke stopp. Tiden frem til du åpner listen inngår.
4. Nå starter menneskelig kontroll: les originalrapporten, åpne korrekt
   originalside for hvert funn, se etter oversette funn og usikkerhet, og
   kontroller, korriger eller avvis når nødvendig. Bekreft enkeltfunn.
   Håndter alvorlig TG3 separat; F4 kan og skal fortsatt være Uavklart når
   det ikke finnes reelt grunnlag for Avklart.
5. Les eventuelle opprinnelige KI-begrensninger. Bare dersom du selv har
   kontrollert originalen og vurderer en begrensning som generell og ikke
   kritisk, skriv din konkrete begrunnelse og gi den eksplisitte erklæringen
   før «Kontrollert og ikke kritisk for screening». Ikke bruk dette til å
   overstyre reelle mangler, ufullstendig lesing eller kritisk usikkerhet.
   Gjør dette etter eventuelle funn-/TG3-endringer; endring kan ugyldiggjøre
   vurderingen. Originaltekst og din vurdering skal være synlige.
6. Når hele kontrollen er ferdig, trykk «Bekreft gjeldende liste».
   **t_bekreftet:** tidspunktet for denne vellykkede bekreftelsen, med
   kontrollen og TG3-status faktisk håndtert. Bekreft gjeldende UI-status i
   opptaket. Et avvist/ugyldig klikk er ikke kontrollslutt.
7. Deretter «Beregn og vis resultat». Ta resultatbevis med tall, anbefaling,
   begrunnelser, originaler og eventuelle brukervurderinger. Dette etterarbeidet
   er utenfor de to S5-varighetene. Ikke endre grunnlaget for å oppnå en fasit.

Første F1 er nytt **4.4 AC6-forsøk med samtidige S5-punkter**, så B2 kan
vurderes uten et ekstra rent automatisk betalt F1-kall. Dette reparerer ikke
historisk receipt. Stopp etter F1: root kontrollerer bevis/review og 4.4-status
før F2/F4 får starte som 4.5.

## Bevis og beregning

Behold originalvideoene uavbrutt. Registrer filhash, tidsposisjoner og
hendelsesbeskrivelse per case nedenfor. Root kan hente filhash, tekniske
versjoner, regne varigheter/medianer og kontrollere tidsposisjonene; root kan
ikke utføre eller attestere din menneskelige kontroll i ditt sted.

Bruk opptakets faktiske relative tidsgrunnlag med sekundpresisjon til minst
bildenivå; ikke rund til minutter. Hovedanalyse = t_liste − t_start,
kontroll = t_bekreftet − t_liste, manuell referanse = t_man_slutt −
t_man_start. Ved måleusikkerhet ved 300/600-grensene dokumenteres intervallet;
ingen beståelse utledes ved å runde bort usikkerheten. Uten synlig/bevist
hendelse er tidspunktet manglende. Stillbilder støtter hendelsen/resultatet,
men kan ikke alene gi sammenhengende varighet.

Ved feil: noter faktisk feilhendelse, tid, synlig årsak og originalutfall;
feiltid er ikke vellykket analysetid. Ufullført kontroll er ikke null.
Registrer avbrudd og alle planlagte/målte forsøk. Ingen nye forsøk uten ny
uttrykkelig plan-ID og konto/preflight. Demo/replay er aldri menneskelig
live-bevis. Ikke start andre historier.

## Faste caseidentiteter

Dokumentmappe `tests/fixtures/property-cases/`. Fasit `expected.json`,
fixtureversjon 1, SHA-256 `d485669a4764a10b8a7ac8e451d1cc75836bc7f431a610bbdd1dc93288f20fce`.
Hashene nedenfor er beregnet fra filene ved forberedelse, ikke bare kopiert
fra historiske receipts. Ingen måledata er fylt ut.

### F1 — plan-ID `S5-2026-10-24-F1-01`

Rapport `F1-tilstandsrapport.pdf`, 4 sider, SHA-256 `c3a92dc24004601803928b5ad479165d042cf199f099e190d40b732a58a388cb`.
Bekreftede årsverdier som skal klargjøres: P=16000000, L=1900000,
D=400000, J=800000 NOK, Ymin=7 %.
Nye bevis skal lagres under `.docs/implementation-artifacts/story-4-5/S5-2026-10-24-F1-01/` etter at root har klargjort opptak; ingen originalmappe gjenbrukes.

| Faktisk registrering | Verdi / fil / hendelsesposisjon |
|---|---|
| Planstatus | Planlagt, ikke startet |
| Dato/person/miljø og full kodecommit | |
| Manuell video: fil/hash, tidsgrunnlag/oppløsning | |
| t_man_start | |
| t_man_slutt | |
| Manuell kontroll fullført/ufullført og faktisk varighet | |
| Faktiske manuelle aktiviteter, hjelpemidler og avgrensninger | |
| Manuell notatliste/kildesider/usikkerhet/TG3-status, fil/hash | |
| Manuelt resultat etter måleslutt / eventuelle avvik | |
| Live-video: fil/hash, tidsgrunnlag/oppløsning | |
| Gyldig finansbekreftelse og støttet PDF før t_start, bevis | |
| Konto/preflight/reservasjon før dette forsøket | |
| t_start — faktisk Start analyse | |
| t_liste — faktisk synlig ferdig liste | |
| t_bekreftet — faktisk ferdig kontroll/bekreftet gjeldende liste | |
| Hovedanalysetid / kontrolltid, beregnede sekunder | |
| Måleusikkerhet / manglende punkter / avbrudd | |
| Faktisk originaluttrekk/terminalutfall, requestId/rapporthash, fil/hash | |
| Faktisk modell/SDK/prompt/schema/kontrakt/uttrekk | |
| Mads: kontrollerte originaler/sider og eventuelle oversette funn | |
| Mads: rettinger/avvisninger/usikkerhet/TG3-status og begrunnelse | |
| Mads: original limitation + eventuell faktisk egen vurdering/grunnlag | |
| Gjeldende listerevisjon/bekreftelse og resultatbevis, fil/hash | |
| Analyse fullført/feilet, kontroll fullført/ufullført | |
| Eventuell feilhendelse/årsak/feiltid (separat) | |
| Faktisk tall/anbefaling; S1–S4-avvik eller kontrollgrunnlag | |
| Faktisk tokenforbruk/kostnad/kumulativ kostnad/ukjent belastning | |
| Mads bekrefter at kontroll og manuell referanse er utført av ham | |

### F2 — plan-ID `S5-2026-10-24-F2-01`

Rapport `F2-tilstandsrapport.pdf`, 4 sider, SHA-256 `458414c5c4556e999d7c6ca045bfc25e0de7d8f39185edb85d49e812de56ce86`.
Bekreftede årsverdier som skal klargjøres: P=16000000, L=1400000,
D=400000, J=800000 NOK, Ymin=7 %.
Nye bevis skal lagres under `.docs/implementation-artifacts/story-4-5/S5-2026-10-24-F2-01/` etter at root har klargjort opptak; ingen originalmappe gjenbrukes.

| Faktisk registrering | Verdi / fil / hendelsesposisjon |
|---|---|
| Planstatus | Planlagt, ikke startet |
| Dato/person/miljø og full kodecommit | |
| Manuell video: fil/hash, tidsgrunnlag/oppløsning | |
| t_man_start | |
| t_man_slutt | |
| Manuell kontroll fullført/ufullført og faktisk varighet | |
| Faktiske manuelle aktiviteter, hjelpemidler og avgrensninger | |
| Manuell notatliste/kildesider/usikkerhet/TG3-status, fil/hash | |
| Manuelt resultat etter måleslutt / eventuelle avvik | |
| Live-video: fil/hash, tidsgrunnlag/oppløsning | |
| Gyldig finansbekreftelse og støttet PDF før t_start, bevis | |
| Konto/preflight/reservasjon før dette forsøket | |
| t_start — faktisk Start analyse | |
| t_liste — faktisk synlig ferdig liste | |
| t_bekreftet — faktisk ferdig kontroll/bekreftet gjeldende liste | |
| Hovedanalysetid / kontrolltid, beregnede sekunder | |
| Måleusikkerhet / manglende punkter / avbrudd | |
| Faktisk originaluttrekk/terminalutfall, requestId/rapporthash, fil/hash | |
| Faktisk modell/SDK/prompt/schema/kontrakt/uttrekk | |
| Mads: kontrollerte originaler/sider og eventuelle oversette funn | |
| Mads: rettinger/avvisninger/usikkerhet/TG3-status og begrunnelse | |
| Mads: original limitation + eventuell faktisk egen vurdering/grunnlag | |
| Gjeldende listerevisjon/bekreftelse og resultatbevis, fil/hash | |
| Analyse fullført/feilet, kontroll fullført/ufullført | |
| Eventuell feilhendelse/årsak/feiltid (separat) | |
| Faktisk tall/anbefaling; S1–S4-avvik eller kontrollgrunnlag | |
| Faktisk tokenforbruk/kostnad/kumulativ kostnad/ukjent belastning | |
| Mads bekrefter at kontroll og manuell referanse er utført av ham | |

### F4 — plan-ID `S5-2026-10-24-F4-01`

Rapport `F4-tilstandsrapport.pdf`, 4 sider, SHA-256 `545f888a4ae0c9d4b9836c0f6c6317aaa89cf38478ca27f1ed32d3c775f93c9b`.
Bekreftede årsverdier som skal klargjøres: P=16000000, L=1900000,
D=400000, J=800000 NOK, Ymin=7 %.
Nye bevis skal lagres under `.docs/implementation-artifacts/story-4-5/S5-2026-10-24-F4-01/` etter at root har klargjort opptak; ingen originalmappe gjenbrukes.

| Faktisk registrering | Verdi / fil / hendelsesposisjon |
|---|---|
| Planstatus | Planlagt, ikke startet |
| Dato/person/miljø og full kodecommit | |
| Manuell video: fil/hash, tidsgrunnlag/oppløsning | |
| t_man_start | |
| t_man_slutt | |
| Manuell kontroll fullført/ufullført og faktisk varighet | |
| Faktiske manuelle aktiviteter, hjelpemidler og avgrensninger | |
| Manuell notatliste/kildesider/usikkerhet/TG3-status, fil/hash | |
| Manuelt resultat etter måleslutt / eventuelle avvik | |
| Live-video: fil/hash, tidsgrunnlag/oppløsning | |
| Gyldig finansbekreftelse og støttet PDF før t_start, bevis | |
| Konto/preflight/reservasjon før dette forsøket | |
| t_start — faktisk Start analyse | |
| t_liste — faktisk synlig ferdig liste | |
| t_bekreftet — faktisk ferdig kontroll/bekreftet gjeldende liste | |
| Hovedanalysetid / kontrolltid, beregnede sekunder | |
| Måleusikkerhet / manglende punkter / avbrudd | |
| Faktisk originaluttrekk/terminalutfall, requestId/rapporthash, fil/hash | |
| Faktisk modell/SDK/prompt/schema/kontrakt/uttrekk | |
| Mads: kontrollerte originaler/sider og eventuelle oversette funn | |
| Mads: rettinger/avvisninger/usikkerhet/TG3-status og begrunnelse | |
| Mads: original limitation + eventuell faktisk egen vurdering/grunnlag | |
| Gjeldende listerevisjon/bekreftelse og resultatbevis, fil/hash | |
| Analyse fullført/feilet, kontroll fullført/ufullført | |
| Eventuell feilhendelse/årsak/feiltid (separat) | |
| Faktisk tall/anbefaling; S1–S4-avvik eller kontrollgrunnlag | |
| Faktisk tokenforbruk/kostnad/kumulativ kostnad/ukjent belastning | |
| Mads bekrefter at kontroll og manuell referanse er utført av ham | |

## Sammenstilling etter faktiske forsøk

Planlagt: 3 nye forsøk. Målt nå: **0**. Vellykkede live-analyser med gyldig
analysetid: 0. Fullførte menneskelige kontroller med gyldig tid: 0.
Gjennomførte manuelle referanser: 0. Median hovedanalyse/kontroll og faktisk
tidsgevinst: **ikke verifisert**. Fyll ikke ut summer/medianer før originalbevis
foreligger; alle planlagte, gjennomførte, feilede og ufullførte forsøk skal vises.
