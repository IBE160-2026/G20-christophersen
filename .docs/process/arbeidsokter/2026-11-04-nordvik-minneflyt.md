# Nordvik Rostockgata 96: minnefeil og ekte brukerflyt

Dato: 4. november 2026. Utgangspunkt:
`b49e75636212025034d102f2b1fb91a949175e80`.
Bruker bestilte årsaksundersøkelse i nettleser/backend, begrenset
PDF-behandling, tekst før OCR, opprydding, kildebevaring, ekte Playwright-test,
kontroll av syv bolig-/økonomiopplysninger, konkret leiestatus og lokal commit.
Ingen betalte AI-kall eller push er tillatt.

[Spesifikasjon og reviewtriage](../../implementation-artifacts/spec-nordvik-minneflyt.md).
[Aktiv automatisk promptlogg](../prompts/session-01a1a651-52fd-7033-b614-e00beb804981.jsonl).
Eksisterende promptlogging er uendret; tidligere logger er urørt.
Sporbarhet, kildebevis, skillet fakta/estimat og faktisk endeflyt følger
[sensoruttrekket](../../planning-artifacts/prds/prd-IBE160-2026-10-10/kildeuttrekk-sensorveiledning.md)
og [faglærers tilbakemelding](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md).
Dette er videreføring av godkjent Konsept A og lokal dokumentpipeline.

## Original og reproduksjon før endring

Brukerens fil ble funnet som
`~/Downloads/rostockgata-96_salgsoppgave-18803366878013-1793731857000-2.pdf`
og kopiert uendret til ignorert `private/incoming/nordvik-rostockgata-96.pdf`.
Den har 170 fysiske sider, ca. 35 MiB, digitalt tekstlag og integrert rapport
på fysiske sider 36–54 (19 sider). Trykte prospekt-/rapportsidetall er noe
annet enn fysisk PDF-side og skal aldri brukes som indeks.
Ingen original, råtekst, rårespons eller privat skjermbilde legges i Git.

Frisk Playwright-opplasting mot egen server på port 3108 med Node 24.21.0,
`ANALYSIS_MODE=demo` og tom `OPENAI_API_KEY` returnerte HTTP 500:
`{"kind":"rejected","code":"memory-limit"}`. UI viste brukerens feilmelding.
Førprøven bestod som reproduksjon, ikke som fungerende produktflyt.
Privat bevis: `nordvik-before-results/.../before.{json,png}`.

Nettleseren hadde ingen `pageerror`, ingen PDF-worker og ingen renderet canvas
på feiltidspunktet. CDP viste JS-heap ca. 5,16 MB før og 6,45 MB etter.
Opplastingsoriginalen ligger dessuten som binær buffer utenfor denne heapmålingen;
heap alene er ikke måling av hele nettleserens RSS. HTTP-avvisningen og
backendmålingene identifiserer backend som årsaken til den viste minnefeilen.

## Faktisk backendårsak

`run-import.ts` sampler importbarnets RSS hvert 100 ms og stopper ved
512 MiB; barn/tekstworker har 256 MiB heapgrense. Grensene skal bestå.

Node24-måling før endring viste ca. 428 MiB i formatfasen og 634 MiB under
påfølgende tekstuttrekk. Originalbytes kopieres flere ganger mellom
request, valideringssnapshot, offentlig parser, sidetellingsworker,
tekstworker og parserkonstruktør. Hver PDF-kopi koster ca. 35 MiB.

Tekstsidene ble allerede behandlet sekvensielt. En langlivet parserworker
akkumulerte likevel høyt RSS fra midlertidig font-/streamarbeid.
Per-operasjon-måling viste stor økning under digital `extractPage` ved fysisk
side 116, før rasterkontroll; senere arbeid ved side 129/130 løftet toppen
videre. `manager.cleanup()` mellom sider fjernet ikke V8-/allocatorens
høyvannsnivå. En privat prøve som beholdt fontcache hjalp heller ikke.
Dette var ikke forårsaket av å OCR-rendre alle 170 sider.

| Privat isolasjonsprøve, uendret 256 MiB heap | Målt topp-RSS |
| --- | ---: |
| Gammelt tekstuttrekk alene | 542,5 MiB |
| 20-siders tekstworkere med transfer og direkte bufferbruk | 373,0 MiB |
| Gammel formatfase etterfulgt av grupperte tekstworkere | 494,0 MiB |

Alle 170 sider ble beholdt i gruppeprøven. 494 MiB er for nær grensen;
formatfasens samtidige kopier må også reduseres. Dette er undersøkelsesbevis,
ikke sluttmåling av den ferdige produktkoden. Måleskript og full per-side-
statistikk ligger ignorert i `private/incoming/memory-*` og `group-probe*.ts`.

## SSB-kontroll før sluttprøven

Faktisk gratis GET av metadata for [SSB 09897](https://www.ssb.no/statbank/table/09897/)
returnerte HTTP 200, siste år 2025, oppdatert 2025-12-22.
Publiserte 3-romsarealkoder er `3.060`, `3.070`, `3.080`, `3.090`, `3.100`.
Boligens dokumenterte 59 m² ligger under minste punkt 60 m².
Eksisterende modell tillater interpolasjon, ikke ekstrapolasjon.
Å endre areal/rom eller bruke 60 som om det var dokumentert 59 ville skjule
modellgrensen. Full brukerflyt skal vise konkret årsak hvis dette hindrer
leieestimatet. Råmetadata er privat lagret som `nordvik-ssb-metadata.json`.

## Endelig endring og verifikasjon

Minnegrensene er uendret: 256 MiB heap og 512 MiB RSS. Formatparseren for
200-sidersimport kjører i en egen worker og termineres før sidetelling.
Tekstparseren behandles i grupper på 20 fysiske sider med én samlet 1 MiB-
tekstgrense og 128 KiB per side; hver worker termineres før neste gruppe.
Dedikerte bytebuffere overføres uten ekstra kloning, og importbarnet beholder
valideringssnapshotet som eneste aktive originalgrunnlag etter validering.
Alle tekstsider forsøkes; tekst, kildeoffseter og fysisk sidekart beholdes.
Bare avledede tekstposter beholdes samlet, ingen ferdigrendrede dokumentsider.

PDF-viseren rydder sideobjekt etter avsluttet render/tekstlag og setter
avsluttede canvasdimensjoner til null. Dokumentworker destrueres ved lukking.
Lokal Vision var allerede sekvensiell med autoreleasepool per side og egen
minnevakt; ingen stor bilderender beholdes som resultat. Nytt OCR-utvalg bruker
lesbar digital prosa først og tar grafiske detaljer, manglende/usikker tekst og
TG-kandidater videre. Sider uten OCR beholder eksplisitt usikker billeddekning.
I Nordvik har rapporten usikker strukturell tekststatus, og alle 19 sider
blir derfor rendret/lest lokalt. Resten av prospektet sendes ikke til OCR.

Ekte flyt avdekket og rettet generiske uttrekksfeil: sammenslått total/trykt
prospektfooter skapte falske nye rapportstarter; linjeskiftet «kommune/Selger»
ga en falsk kommune; et nabotiltak med 120 boliger ble lest som salgsobjektet.
De nye mønstrene bevarer separate rapporter, reelle motstrid og flerboligvern.
Økonomi gjenkjenner monetært «,-» og «Fellesutgifter pr. mnd»; soverom skilles
fra samlet romantall og har egne originale kilder.

| Bestilt opplysning | Verifisert verdi | Fysisk kilde i sluttprøven |
| --- | --- | --- |
| Kommune | Oslo | 22, 117, 168 |
| Boligtype | Selveierleilighet | 4, 22 |
| Internt areal | 59 m² BRA-i | 4, 5, 22 |
| Rom / soverom | 3 rom / 2 soverom | 4 / 4, 22 |
| Prisantydning | 8 600 000 kr | 4 |
| Fellesutgifter | 3 660 kr/måned | 4, 26 |

Alle kildebelegg ble kontrollert mot originalens tekstspenn og dokumenthash.
Originalens SHA-256 er
`3e2dd467c11785c1de7c8c79b8e5f58f786e87416f7dc9b14f7a2d713ec6cb70`.
Uavhengig sammenligning mellom baseline-worker og grupperingen viser **0 avvik**
i `pdfPage/text/status/reason/rasterUnprocessed`: 170 sider, 293 168 tegn,
felles SHA-256 av normalisert sidekart
`c5c24a7d612461606c7835af9e3faf5247fa4f81f5746485c7d929c5badae254`.
Privat reproduksjon: `nordvik-page-preservation.ts/json`, begge uttrekks-JSON.

Leieagenten henter faktisk SSB-metadata gjennom HTTP-ruten, får statistikkår
2025 og returnerer unavailable: **59 m² og 3 rom er utenfor 60–100 m²**.
Ingen numerisk leie, bruttoyield eller kontantstrøm påstås for denne boligen.
Dette er nå en modellgrense, ikke manglende gjenkjenning eller nettverksfeil.
Teknisk rapportdekning er også fortsatt **incomplete/blocked**, selv om alle
19 sider har vellykket lokal bilderender/OCR. Å lese alle sider er ikke bevis
for komplett semantisk TG-recall. Bruker må fortsatt kontrollere den usikre
rapportdekningen; en ferdig kontrollert investeringsanbefaling er ikke levert.

Den versjonerte Nordvik-prøven i `tests/e2e/rent-real-document.spec.ts` kreves
uten skip med `PAA_TEST_NORDVIK_REQUIRED=1`. Den kontrollerer alle sidene,
rapportområdet 36–54, alle 19 faktiske billedbevis, feltene, originalspenn,
åpning av fysisk kilde, rask sidebytting/zoom, gamle canvasstørrelser [0,0],
workeravslutning og mobil uten horisontal scrolling. Ekte original distribueres
ikke i Git. `npm run prepare:visual` klargjør lokal macOS Vision ved behov.

Sluttkommandoen brukte Node 24.21.0 og privat config med eksisterende installert
Chromium 1243, port 3108 og tom modellnøkkel:
`PAA_TEST_NORDVIK_REQUIRED=1 PAA_TEST_SSB_NETWORK=1 npx playwright test --config private/incoming/nordvik-final.config.ts tests/e2e/rent-real-document.spec.ts`.
**3/3 bestått uten skip**: Nordvik, tidligere ekte enebolig og positiv syntetisk
leilighet mot faktisk gratis SSB. Betalte ruter ble blokkert og ble ikke kalt.
Private skjermbilder/rårespons ligger i `private/incoming/nordvik-final-results/`;
JSON-rapport i `private/incoming/private/incoming/nordvik-final-report.json`.
Desktop og mobil er visuelt kontrollert.

Build og lint består. Full unit/integrasjon består med **2 011 tester**, 7
eksisterende native Vision-tester eksplisitt hoppet over uten eget flagg.
Første kjøring hadde to 5 s-tidsavbrudd i 200-siders tester under samtidig
nettleser-/målrettet testlast. Ny sekvensiell kjøring bestod uten endringer i
tidsgrenser eller forventninger. Den ekte Nordvik-prøven kjørte faktisk Vision.


Siste separate produktmåling etter rapport-/feltretting fullfører importbarnet
på **13,86 s**, med **441,31 MiB RSS**. En tidligere vellykket fullmåling under
samtidig nettleserlast nådde 467,14 MiB. Første ufullstendige retting traff
fortsatt 513,84 MiB og ble forkastet; løsningen ble først akseptert etter at
formatparseren også ble isolert. Alle målinger brukte gjeldende standardvakt.
Privat sluttbevis: `nordvik-final-pipeline-summary.json` og
`nordvik-pipeline-memory.json`, med faktisk started/adapter-permitted/closed.

Investerings-/appregresjon i Playwright: **22 bestått**, 41,3 s.
Tre uavhengige reviewlag fant konkrete feil i vektor-TG-utvalg, nabokontekst,
kombinert eierform, ugyldige soverom, månedsbeløpsvarianter og korte
sammenlimte footere. Disse er rettet og har egne regresjoner. Testgap for
avbrutt canvasrender, finansiell kildeåpning og feil mellom workergrupper er
også rettet. Hvert funn og vurdering står i spesifikasjonens triage, ikke i en
ny parallell issueoversikt. PAA-SO2 og PAA-LEIE1 står fortsatt åpne i den
sentrale oversikten; denne økten hevder ikke generell TG-/leiemodellkvalitet.

## Endelig godkjenning av denne rettingen

Etter alle reviewrettinger består `npm run build` og `npm run lint`.
`npm test`: **2 035 bestått**, 7 eksisterende native skip, 100 testfiler,
82,43 s. Ingen testgrenser eller produktressursgrenser er økt.
Slutt-Playwright etter review:
`PAA_TEST_NORDVIK_REQUIRED=1 PAA_TEST_SSB_NETWORK=1 npx playwright test --config private/incoming/nordvik-final.config.ts tests/e2e/rent-real-document.spec.ts tests/e2e/report-analysis.spec.ts --grep 'ekte Nordvik|2\.7 race|gratis SSB-nettprøve|ekte PDF:'`.
**5/5 bestått uten skip**, 42,9 s: begge ekte PDF-er, positiv gratis SSB,
og offentlig deterministisk canvasrace i demo- og live-kontrolladaptermodus.
Live-testnavnet innebærer ikke et betalt leverandørkall. Modellnøkkelen var tom,
og testtransporten kontrollerte svarene. Ekte Nordvik tok 16,9 s i denne prøven.

Den offentlige racetesten holder faktisk et renderframe tilbake, avbryter
siden og kontrollerer både ferdig og avbrutt canvas til [0,0] før gjenbruk.
Nordvik-prøven krever både synlige økonomibeløp og åpner hver pris-/utgiftskilde
(fysiske sider 4 og 26) i originalviseren. Ny unitprøve krever avsluttet worker
før neste gruppe og dekker sen feil, ugyldig/null-retur og termineringsfeil.
Hovedagenten leste sluttendringene og kjørte alle relevante sluttkontroller;
ingen verifiserte reviewfunn står uløst i denne rettingen.

Serveren på port 3000 ble identifisert i riktig repo, avsluttet kontrollert og
startet med siste kode/bygg, Node 24.21.0, demo og eksplisitt tom AI-nøkkel.
Den beholdes kjørende på http://127.0.0.1:3000. Ingen push eller betalte
AI-kall er utført. Lokal commit inkluderer spec, reviewtriage, denne økten,
README/testoppskrift og aktiv automatisk promptlogg. Private originaler og
råbevis er fortsatt ignorert. Åpne TG-/modellpunkter er ikke lukket.
