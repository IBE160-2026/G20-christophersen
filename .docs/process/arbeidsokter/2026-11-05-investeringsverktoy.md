# PAA: praktisk investeringsverktøy

Utgangspunkt: `34ebba452e96636d93a8a1e13f9f8c2aca9d766c`.
Oppdrag: [aktiv automatisk promptlogg](../prompts/session-01a1acf7-346f-7af2-9c86-9b8f35865a9f.jsonl).
[Spesifikasjon](../../implementation-artifacts/spec-paa-investeringsverktoy.md).

## Grunnlag og arbeidsdeling

AGENTS.md, Product Brief, faglærertilbakemeldingen, sensorveiledningens PDF
(lest med lokal PDF.js), gjeldende Konsept A og siste ekte import-/QA-bevis
er brukt. Sensorveiledningen støtter sporbar prosess, relevante tester,
faktisk kjørbarhet og brukbarhet; den fastsetter ingen ekstra finansformler
eller obligatorisk AI-integrasjon. Dagens brukeroppdrag utvider opprinnelig
v1 med kapital og finansiering. Historiske akseptansebevis omskrives ikke.

Tre parallelle subagenter fikk økonomi/finansiering, teknisk/juridisk risiko
og uavhengig UX/QA. Hovedagenten eide integrasjon, direkte driftforutsetning,
månedlig økonomi, dokumentstruktur og regresjonsoppfølging. Finansagenten
gjennomgikk også den integrerte endringen på nytt; QA-agenten arbeidet fra
originaldokumenter og egen annuitetsfasit. Ingen ytterligere subagenter ble
opprettet. Brukerens selvstendige oppdrag og eksplisitte arbeidsdeling ble
fulgt foran skillens ekstra godkjenningsstopp/sekvensielle dispatch.

## Beregninger og brukerflyt

Eksisterende Big.js-motor beholdes. P inkluderer fellesgjeld, men ikke
kjøpsomkostninger. Kapitalbehov inkluderer omkostninger og fellesgjeld.
Privat lån finansierer kontantbehov minus egenkapital; samlet gjeld inkluderer
fellesgjeld én gang. Belåning beregnes mot P. Månedlig kontantstrøm trekker
fra renter og avdrag på privat lån og eventuell fellesgjeldbetaling én gang.
Samlet månedlig drift er en uttrykkelig brukerforutsetning som erstatter D;
dokumentets kjente delsum legges ikke til igjen. Yielddefinisjonene endres ikke.

Økonomi vises samlet før juridisk og teknisk risiko. Konsept A, PDF-inngang,
leieslider og SSB-bakgrunn beholdes. Kontantstrøm per måned er hovedtall;
årstallet vises under. Kilder og scenariograf er utvidbare. Ugyldig/blank
input fjerner avhengige tall. Et scenario endrer ingen kontrollert vurdering.

## Konkrete feil funnet under arbeidet

1. Kode-QA fant at ugyldig rå-LTV kunne overleve ny import av samme PDF.
   Finanspanelet har nå objektnøkkel, og ekte prøven omfatter dette tilfellet.
2. Finansreview fant at avrundet LTV ble validert mot eksakte endepunkter.
   Inversberegningen håndterer eksplisitt avrundede endepunkter. Ny ekte prøve
   fant også ulik Big.js-presisjon (20 i panel mot 50 i domene); panelet bruker
   nå 50, og render-prøver dekker begge ekte maksverdier og fellesgjeldminimum.
3. Scenario viste gamle L:/D:-kontrollmangler samtidig med gyldige egne
   forutsetninger. Disse følger nå eget faktisk scenariogrunnlag; rapportens
   begrensninger og den separate kontrollflyten beholdes.
4. Første ferdige ekte QA feilet på begge dokumentene: kapitalbehov ble ukjent,
   selv om kildebelagte pris-/omkostningstabeller kunne avstemmes. Dette ble
   behandlet som en produktfeil; fasiten og akseptansekravet ble beholdt.
   Eierformfelt på samme/neste linje og eksplisitte omkostningslister avstemmes
   nå mot underposter og totalpris. Valgfrie pakker inngår ikke, og ufullstendige
   eller motstridende summer beholder sperren.

5. Kodegjennomgang strammet inn romkoblingen: rom må tilhøre samme kildeblokk
   som komponenten, og arves ikke over andre bygningsdeler eller hovedavsnitt.
6. Visuell QA fant et ubalansert radonpreview som viste områdeaktsomhet uten
   rapportens forbehold. Previewet viser nå manglende målegrunnlag fremfor
   et påstått radonnivå; den komplette kildebeskrivelsen er beholdt.
7. Årsbeløp er tydelig merket som annualisert månedsnivå. Dette avklarer også
   den eksisterende avanserte muligheten for løpetid under 12 måneder.

## Semantisk AI

`GET /api/document-import-config` annonserer `mode: demo`, `liveEnabled: false`
og `codeFirst: true`. Importruten avviser live, og `createCodeFirstImport`
tillater bare semantisk transport med `purpose: offline-stub`. Dette er en
uttrykkelig kode-/kostnadssperre, ikke en API-nøkkel som mangler i UI.

Eksisterende teksttransport kan prinsipielt hjelpe med uklare tekstblokker
innen kilde- og budsjettkontrakten. Den gjenoppretter ikke grafisk TG som er
tapt i tekstuttrekket. `prepareTechnicalInterpretation` lager en avgrenset
tolkningsplan; den er ingen gjennomført multimodal analyse. Autorisert
bildetransport, bildetokenisering og verifisert kostnadsberegning mangler for
slik bruk. Sperren beholdes. Lokale regler, PDF.js, tilgjengelig lokal OCR
og deterministisk økonomi forbedres uten modellkall.

## Verifikasjon og sluttstatus

Ekte akseptanse 2026-11-06: **2/2 bestått uten skip**, 2,2 minutter.
QA-agentens prøve kjørte 14 grupperte kontrollsteg og seks faktiske importer på
localhost:3000. Ingen API-svar ble stubbet. Ingen nettleserfeil, eksterne
forespørsler eller betalte ruter ble registrert. Nøstegaten og Rostockgata ble
prøvd med uavhengig annuitetsfasit, direkte leie/drift/egenkapital/belåning/rente/
løpetid, negativ kontantstrøm, 95 % belåning, finansiering av omkostninger,
nullrente, kontantkjøp, blank/ugyldig input, kilder, samme PDF på nytt og bytte
av eiendom. Mobil 390 × 844, ekte touch, tastatur og graffaner ble kontrollert.

| Egen scenarioforutsetning | Nøstegaten | Rostockgata |
|---|---:|---:|
| Kapitalbehov fra dokument | 4 152 340 kr | 8 816 090 kr |
| Testleie per måned | 16 000 kr | 24 000 kr |
| Testdrift per måned | 3 000 kr | 3 000 kr |
| Privat lån ved 80 % belåning | 3 240 000 kr | 6 880 000 kr |
| Egenkapital | 912 340 kr | 1 936 090 kr |
| Månedlig annuitet, 5,5 % / 25 år | 19 896,43 kr | 42 249,22 kr |
| Nettoyield | 3,85185 % | 2,93023 % |
| Månedlig kontantstrøm | −6 896,43 kr | −21 249,22 kr |

Tallene for leie og drift er testforutsetninger, ikke dokumentfakta. Rostockgatas
testdrift er lavere enn dokumentets kjente delsum og gir derfor synlig varsel.
Nøstegatens foreløpige delsum 25 197 kr/år krever fortsatt forutsetningen om
at kommunale avgifter kommer utenfor felleskostnadene; eiendomsskatt inngår
i avgiftene og trekkes ikke fra på nytt.

Den brede unit-/integrasjonsprøven avdekket en reell kompatibilitetsregresjon:
2 231 bestod, én feilet og sju eksisterende tilfeller ble hoppet over. Det
eksisterende grupperingscaset hadde rom umiddelbart etter komponenten. Denne
kildebundne tekstordningen støttes nå igjen, med uendrede fasitkrav og uten
arv over andre avsnitt. Ny målrettet risiko-/grupperingsprøve: 130/130 bestått.

En ekstra grensekontroll fant at native range-maksimum kan serialiseres som
en IEEE-double like over eksakt Big.js-maksimum. Faktisk Chromium leverte eksempelvis 102.512674418605 mot eksakt maks
102.512674418604651… for Rostockgata. Likhetstesten var utilstrekkelig.
Sliderens End/Home og endestopp ved dragging bindes nå direkte til eksakt egenkapital null/fullt kontantbehov når native-verdien når eller
passerer endepunktet; fritekstvalideringen er fortsatt streng. Den ekte prøven er
utvidet for begge originaler med Home, End og faktisk musedrag.

Siste rene bygge-, TypeScript-, E2E-TypeScript- og lintkontroll består.
Ny full unit-/integrasjonskontroll etter alle produktrettinger: **2 234
beståtte og 7 eksisterende valgfrie skip**, 110 beståtte filer og én skipfil,
135,16 sekunder. Kommando: `npm test -- --maxWorkers=2 --reporter=verbose`.
Logg: `private/incoming/qa-investment-2026-11-05/vitest-verified.txt`.

Siste komplette ekte akseptanse etter native-sliderrettingen: igjen **2/2 uten
skip**, 2,2 minutter og seks importer. Home, End og faktisk musedrag til
maksimum er prøvd på begge originaler med kontrollert egenkapital, gjeld og
kontantstrøm. Sluttbevis er `playwright-native-verified.txt` og
`results-native-verified/`. Den uavhengige QA-rapporten gir GRØNT LYS innenfor
den dokumenterte bachelorprototypen. Hovedagenten har i tillegg sett desktop-/
mobiløkonomi og teknisk visning. Kildevisning og faktisk mobilviewport er
kontrollert uavhengig; ingen kritisk avklipping eller sidescroll er funnet.

Bred Playwright-regresjon mot egen ekte lokal demo-backend på port 3001:
**238 beståtte, 5 eksisterende valgfrie skip**, alle 243 registrerte tilfeller
kjørt, 8,2 minutter. Logg: `e2e-verified.txt`. Den nye obligatoriske ekte
investeringsprøven kjøres separat på localhost:3000 og er ikke telt dobbelt
i denne pakken. Private kjøreconfiger endrer bare lokal Chromium-sti/port,
utdatamappe og dette separate testutvalget; produksjons- og testkoden er den
samme som i repoet. Ingen API-svar stubbes i de to primære ekte PDF-casene.
Historiske adapter-/feiltester i regresjonen bruker sine kontrollerte lokale
testadaptere og utløser ingen betalte modellkall.

Komponentprøver i faktisk Chromium: **50/50 bestått**, 11,0 sekunder
(`components-final.txt`). Nye native-finansprøver omfatter også positiv
fellesgjeld og både minimums- og maksimumsendepunkt. Første komponentrunde
hadde én feilaktig teststreng som skilte mellom matematisk lik 0 og 0.00;
forventningen er rettet til eksplisitt numerisk null, som fortsatt avviser
blankt felt. Hele pakken er deretter kjørt på nytt og bestått.

Utviklingsoppstart og beskyttelse av private filer/backend/miljø i Vite:
**3/3 bestått**, 2,1 sekunder (`dev-verified.txt`). Ingen nye produktendringer
ble gjort under disse regresjonene. Bygg, typecheck, E2E-typecheck, lint og
`git diff --check` består. Det eksisterende Vite-varselet om stor chunk
består; det er ingen byggefeil.

**Sluttstatus: GRØNT LYS innenfor dokumentert bachelorprototypeomfang.**
Den uavhengige [QA-rapporten](2026-11-05-investeringsverktoy-uavhengig-qa.md)
gjelder siste produktkode og inkluderer de faktiske native-sliderprøvene.
Alle seks rader i specens akseptansematrise har kjørte, beståtte prøver: de
ekte casene dekker komplett scenario/endringer/grenser/mangler/reimport,
og full unit-/nettleserpakke dekker eksplisitt TG2/TG3 og avvisning av
forklaringssider, usikre romkoblinger og ufullstendig tekstgrunnlag.
Det hevdes ikke generell TG-recall eller juridisk godkjenning.

Aktiv promptlogg, kode, tester, spec og denne prosessevidensen inngår i samme
lokale commit. Ingen betalte AI-kall eller push er utført, og ingen privat
PDF, rårespons, trace eller privat skjermbilde stages.
En tidlig fullprøve ble avbrutt da standard Node 26 og sandboxens lokale
nettbegrensninger ble oppdaget; den brukes ikke som produktbevis. Den endelige
kjøringen bruker Node 24.21.0 og npm 11.19.0 med tillatelse til lokale testporter.
Private råresponser, originaler, skjermbilder og traces holdes under ignorert
`private/incoming/qa-investment-2026-11-05/`. De er ikke Git-leveranser.


## Gjenværende avgrensning

Dette er førstevurdering med egne scenarioforutsetninger. Fullstendig TG-recall
og juridisk godkjenning er ikke dokumentert; kommunale arkiver/grunnbok
kontrolleres ikke. Begge ekte rapportgrunnlag forblir maskinelt ufullstendige.
TG2/TG3 som faktisk er tekstlig identifisert, kildeavgrenset og koblet til
komponent, støttes og testes; generelle TG-forklaringer gir ingen avvik.

Leiereferansene er gruppestatistikk. Individuell markedsleie, ledighet,
framtidige vedlikeholds-/fasade-/heiskostnader, skatt, lånegebyrer og verdiendring
må vurderes særskilt. Kapitalbehov gjelder den viste kjøpsmodellen, og egne
endelige driftsbeløp er antakelser. Låneprognosen holder rente/leie/drift
konstant og er ingen avtale med en bank. Årsnivået annualiseres fra måneden.
Ingen av disse begrensningene lukkes i den sentrale
[deferred-work-oversikten](../../implementation-artifacts/deferred-work.md).
