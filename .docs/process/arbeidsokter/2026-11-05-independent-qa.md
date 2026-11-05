# Uavhengig kvalitetssikring – PAA-stabilisering

Dato: 2026-11-05. Ansvar: subagent 4, uten eierskap til produktendringene.
Utgangspunkt: `e0ad095c5a9410886ee94e3897cae3552284a7f0`.

AGENTS.md, stabiliseringsspesifikasjonen og fagkontrollen av originalsider er
lest. Kursforankringen er vanlig bruk, feil input, gjentatte handlinger,
kildesporing og kjørbarhet; ingen nye moduler eller universell PDF-dekning
utledes av sensorveiledningen.

## Uavhengig kode- og testaudit

- Tidligere ekte PDF-tester kjørte hver for seg. De kunne ikke vise seks
  opplastinger i samme klient-/serverlivsløp eller utdatert hovedprosess.
- Frontendens tidligere samme-hash-retur kunne vise et gammelt resultat uten
  en ny HTTP-import. Ny Konsept A-opplasting starter nå ny analyse og faktisk
  forespørsel; native filkontroll tømmes slik samme fil kan velges igjen.
- Lokal import har ingen ny betalt transport. Endret markøropprydding må
  fortsatt vente på faktisk barnelukking. Betalte budsjetter forblir separate.
- Runtimefingeravtrykket bruker repoets kildefiler, ikke private dokumenter,
  miljøvariabler eller Git-status. Det oppdager en endret server før nytt
  parserarbeid; det gjør ingen påstand om å kunne oppgradere en kjørende app.

To konkrete funn ble sendt til de ansvarlige før sluttprøven:

1. Sluttharness lette etter en PDF-sideinput som ikke finnes. Det ville gi
   falsk testfeil. Hovedagenten erstattet kontrollen med fysisk sideattributt
   og synlig PDF-status og la til kontroller av synlig pris og økonomi.
2. Slider/reset beholdt foreldet SSB-tekst om leienivå 2025 etter valg av en
   publisert 2026-referanse. Frontendagenten presiserte eget scenarioår,
   referansens periode og fravær av prisjustering, og fjernet den foreldede
   SSB-beskrivelsen. Selve dokument- og referanseverdiene endres ikke.

## Faktisk uavhengig sluttprøve

Kjørbar uavhengig kontroll ligger privat i
`private/stabilization-2026-11-05/independent-qa/run.mjs`. Den bruker Playwright
mot localhost:3000 og ekte backend/originalfiler, uten rutestubbing eller
mockede API-svar. Den kontrollerer også presis desimalleie, null/ugyldig leie,
egne kostnader, uavhengig annuitets-/kontantstrømfasit, finansreset, ny analyse,
mobil touch, korrupt PDF, eksplisitt retry og gyldig gjenoppretting.

Faktisk kjøring: 2026-11-05 kl. 13:59–14:00 norsk tid, Node 24.21.0,
lokal Chromium og ekte server på localhost:3000. Hovedagentens server ble
ikke startet om eller endret under kontrollen.

| Egen faktisk prøve | Resultat |
| --- | --- |
| Nøstegaten, 152 sider, synlig pris/leie/yield/risiko og originalside med zoom/neste | Bestått, 21,43 s |
| Presis månedsleie 15 000,5 gir 180 006 kr/år og matematisk riktig yield; negativ verdi, null og reset 13 891 | Bestått |
| Kildekontroll av engangskostnader, egen drift og uavhengig annuitet | Bestått |
| Bak tallene, ny analyse, ekte Rostockgata og tømt leie/drift/finansiering | Bestått, ny import 14,60 s |
| Mobil 390 × 844, reell touchslider, reset 20 426 og dialognavigasjon | Bestått, ingen horisontal rulling |
| Korrupt PDF, eksplisitt retryknapp og gyldig Nøstegaten etterpå | Bestått, gjenoppretting uten omstart |

Det var ingen JavaScript-sidefeil. Faktiske POST-er var bare lokal
`document-import` og `rent-estimate`; ingen betalt analyse ble startet.
Råsammendraget står i den private `result.json`, med utsnitt av hero,
leieslider, nøkkeltall og risiko på desktop/mobil. Disse bildene er sett av
QA-agenten: tekst og kontroller er lesbare, kilde-/scenariomerking er tydelig,
og de undersøkte mobile utsnittene har ingen avklipping eller overlapp.

Hovedagentens separat gjennomførte obligatoriske matrise er også lest i
`private/stabilization-2026-11-05/acceptance/summary.json`: alle seks faktiske
opplastinger, to kontrollerte serveroppstarter, desktop-/mobilslider,
navigasjon og HTTP 422 med vellykket gyldig nytt forsøk er bestått. Den
inneholder ingen mockede API-svar eller eksterne forespørsler. Min egen prøve
brukte en ny nettleserkontekst og egne kontrollhandlinger/beregningsfasiter.

## Finansiering og presis leveransegrense

Første egen test antok uriktig at kontantbehov allerede var automatisk
tilgjengelig. Den feilet på den antakelsen; produktet viste uttrykkelig
«Ukjent». Dette opprinnelige skriptet og feilet resultat er bevart i den
private `attempt1/`, uten at produktkode ble endret for å få testen grønn.

Fysisk Nøstegaten-side 8 er også sett av QA. Den oppgir eierseksjon og
102 340 kr i omkostninger, inklusive 101 250 kr dokumentavgift. I den faktiske
kontrollflaten ble omkostningstotalen kontrollert som separat post og
dokumentavgiften som inkludert, med kildebegrunnelse. Da ble kontantbehov
4 152 340 kr synlig. Egenkapital 1 000 000 kr, rente 5 % og 25 år gir lån
3 152 340 kr og uavhengig beregnet månedsbetaling 18 428,27 kr; appen viser
riktig avrundet 18 428 kr. Finansreset virker. Egen antatt årsdrift 50 000 kr
gir riktig 2,88 % nettoyield ved scenarioleie 13 891 kr/mnd.

Samlet gjeldsbetaling og kontantstrøm forblir ukjent når de øvrige
fordelings-/årsopplysningene ikke er kontrollert. Det skal ikke tolkes som
null. Automatisk eierform og inkludering av alle engangskostnader er derfor
en fortsatt begrensning, og finansiering kan kreve brukerens kildekontroll.
De påkrevde bolig-/pris-/fellesutgift-/fellesgjeld-/leieverdiene hentes
automatisk uten denne kontrollen. Full TG-/juridisk dekning og individuell
markedsleie er fortsatt ikke levert eller godkjent.

## Uavhengig vurdering

**GRØNT LYS** for den bestilte bachelorprototypen innen det dokumenterte
testomfanget med disse to originalene. Den faktiske lokale brukerflyten,
gjentatte importer, synlige beregninger, leieslider/reset, ny analyse og
feilgjenoppretting er bekreftet uavhengig. De to konkrete QA-funnene over er
rettet; ingen ny kritisk feil står uavklart i denne kontrollen.

PAA kan demonstreres for sensor uten Codex eller terminalinngrep i den
pågående brukerflyten når serveren er startet etter README. Demonstrasjonen
må forklare foreløpig økonomi, nødvendig kildekontroll for finansiering og
ufullstendig risikodekning. Dette er ingen produksjonsgodkjenning, garanti
for alle PDF-formater eller lukking av historiske åpne kvalitetsporter.
