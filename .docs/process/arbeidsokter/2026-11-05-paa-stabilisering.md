# PAA – stabilisering og endelig funksjonskontroll

Dato: 2026-11-05. Utgangspunkt: `e0ad095c5a9410886ee94e3897cae3552284a7f0`.
Bestilling: fungerende bachelorprototype med ekte PDF-er på localhost:3000.
**GRØNT LYS innen dokumentert bachelorprototype-/testomfang.** Alle obligatoriske
nettleserprøver og egen uavhengig QA består. Ingen produksjonsklarhet eller
universell PDF-støtte hevdes.

## Forankring og organisering

AGENTS.md, sensorveiledningens fysiske sider 2–6 og faglærerens
[brief-tilbakemelding](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md)
er lest. Vanlig bruk, feilinput, gjentatte handlinger, kildebelegg og kjørbarhet
styrer denne kontrollen. Konsept A og eksisterende kontrollporter bevares.
[Arbeidsspesifikasjon](../../implementation-artifacts/spec-paa-stabilisering.md).

Fire subagenter har avgrenset ansvar; tre fagagenter startet parallelt og
uavhengig QA overtok en ledig kjøreplass. Hovedagenten integrerer og kjører egen
sluttmatrise. Brukerens bestilling om fire fagagenter og full gjennomføring
erstatter generiske ekstra godkjennings-/agentsteg i bmad-build.

- [Import og stabilitet](2026-11-05-import-stability.md): A/B-reproduksjon før retting,
  runtime-/prosessvern, gjentakelse og målrettede regresjoner.
- [Analyse og datakvalitet](2026-11-05-analysis-quality.md): fysisk originalkontroll,
  65 kildespenn, økonomi, leiereferanser og risikogrenser.
- [Frontend og brukeropplevelse](2026-11-05-frontend-ux.md): slider/reset, scenario,
  gjentatt filvalg, ny analyse og feilforklaringer.
- [Uavhengig QA](2026-11-05-independent-qa.md): egen kodekontroll og faktisk
  nettleserprøve, separat fra hovedagentens matrise.

## Faktiske feil og rettelser

Den rapporterte feilen er gjenskapt før kodeendring. Gammel server PID 17753
fra samme arbeidsmappe ga HTTP500 `processing-failure` etter 23,454 s med
nøyaktig brukerens feilmelding. Bare SIGTERM/restart med samme umodifiserte
commit ga HTTP200 og 152 sider på 22,971 s. Hovedprosessen beholdt eldre
Zod-/versjonskontrakt i modulcachen, mens hvert nytt importbarn leste nyere
kode fra disk. Det ferdige PDF-resultatet ble avvist ved valideringen.
Dette var ikke en dokumentert 20-sekunders timeout eller en ny OCR-/minnefeil.

Parent og child sammenlikner nå kildefingeravtrykk før behandling. Utdatert
runtime får konkret forklaring før kostbart parserarbeid. Inngangssiden får
`Cache-Control: no-store`. En eldre prosess uten den nye vakten ble avsluttet
kontrollert; ingen andre brukerprosesser ble stoppet.

Gratis lokal import hadde dessuten en permanent session/hash-markør. Den
frigjøres nå først etter bekreftet child-close. Betalte analyser har sine
separate uendrede budsjettsperrer. Frontend kunne tidligere gjenbruke samme
PDF uten HTTP, og native filinput ble ikke tømt. Hvert filvalg i Konsept A
starter nå reell import, mens ny analyse tømmer eiendom, scenario og kontroll.
Feil gir konkret melding og nytt lokalt forsøk.

Leieslider manglet. Den oppdaterer nå årsleie, bruttoyield og tilgjengelig
foreløpig netto. Presisfelt og reset til publisert Hybel/Menon-referanse
beholder SSB og dokumentfakta separat. Egen scenarioleie er tydelig merket.
QA fant foreldet SSB-årstekst etter justering; scenarioår og referanseperiode
er nå forklart uten påstått prisjustering.

## Hvorfor tidligere tester ikke var nok

Tidligere testkjøringer startet ny server og brukte en ny nettleserside per
test. De traff ikke blandingen av gammel forelder og nytt barn. Den gamle
integrasjonstesten forventet at gratis andreopplasting ble avvist; samme-hash
gjenbruk i frontend kunne i tillegg skjule manglende HTTP-behandling.
Tidligere vellykkede enkeltimporter beviste derfor ikke faktisk gjentatt bruk.

Målrettede regresjoner dekker kildeendring uten commit, child-mismatch,
gjentatt HTTP med ny requestId, nytt forsøk etter timeout/cleanup, ny analyse,
presis sliderberegning og ugyldig leie. Den ekte matrisen bruker ingen
API-stubber og krever begge private originaler uten skip.

## Verifikasjon

Node 24.21.0 og npm 11.19.0 er brukt. Standard shell velger ellers Node26;
det forklarer ikke den gamle serverhendelsen, som faktisk brukte Node24.

| Kontroll | Faktisk resultat |
| --- | --- |
| Build inkl. typecheck | Bestått; eksisterende PDF.js-bundleadvarsel |
| Lint | Bestått uten advarsler |
| Full unit/integrasjon | 108 filer bestått, 2171 tester bestått, 7 eksisterende valgfrie native-skip |
| Importagentens målrettede regresjoner | 44/44 bestått |
| Frontendagentens målrettede regresjoner | 52/52 bestått |
| Datakvalitetens målrettede regresjoner | 49/49 bestått |
| Eksisterende berørte Playwright-regresjoner | 33/33 bestått, 1,2 min; app-shell, investment-overview, prospectus-import |
| Obligatorisk ekte nettlesermatrise | Alle 11 kontroller bestått, seks opplastinger og ekstra gjenopprettingsimport |
| Uavhengig faktisk QA | 6/6 bestått; egen Playwright-kjøring og eksplisitt GRØNT LYS |

Første brede testkjøring inne i sandbox ble avvist på lokal listen/ps med
EPERM og er bevart som mislykket miljøprøve. Samme fullsuite med nødvendig
lokal tilgang bestod på 82,62 s. Den første matrisestarten traff en tvetydig
statuslokator i selve kontrollskriptet og ble avbrutt før første godkjente
import; lokatoren er avgrenset til importstatus og råbeviset er bevart.

Kjørbar kontroll: [real-prototype.mjs](../../../tools/finalization/real-prototype.mjs).
Persondatafrie faktiske [matriseresultater](2026-11-05-paa-sluttkontroll.json) og
[unit-/integrasjonslogg](2026-11-05-paa-regresjon.txt) følger leveransen.
Private originaler, avledet tekst, PDF-sidebilder, nettleserbilder og rålogger
finnes kun i ignorert `private/stabilization-2026-11-05/` og
`private/incoming/stabilization-quality/`. Ingen private PDF-er eller
hemmeligheter inngår i Git. Automatisk promptlogging er uendret.

### Obligatorisk faktisk brukerflyt

| Nr. | Kontroll på localhost:3000 med ekte backend | Resultat |
| --- | --- | --- |
| 1 | Nøstegaten etter ny oppstart | Bestått, 20,759 s, 152 sider, synlige kontrollverdier |
| 2 | Nøstegaten igjen i samme nettleserøkt | Bestått, 20,043 s, ny HTTP-import og ingen scenariorester |
| 3 | Rostockgata i samme nettleserøkt | Bestått, 14,549 s, 170 sider, ingen Nøstegaten-data |
| 4 | Rostockgata etter ny oppstart | Bestått, 14,697 s, samme kildebelagte kontrollverdier |
| 5a | Ytterligere Nøstegaten | Bestått, 20,574 s |
| 5b | Ytterligere Rostockgata | Bestått, 15,234 s |
| 6 | Slider, reset og matematikk desktop/mobil | Bestått med faktisk museklikk/touch; årsleie/brutto/foreløpig netto og reset 13 891 / 20 426 kr |
| 7 | Navigasjon og sentrale kontroller desktop/mobil | Bestått; dialoger, originalside/neste/zoom og kontrollflate/retur; ingen horisontal overflow |
| 8 | Korrupt PDF, forståelig feil, ny gyldig import | Bestått, faktisk HTTP422; Nøstegaten fullfører på nytt uten omstart, samlet 21,035 s |

Alle importprøver kontrollerte synlig adresse/pris/areal/rom/soverom,
økonomirader, publisert leie, SSB, bruttoyield, foreløpig netto og ufullstendig
teknisk dekning. Økonomikildene ble kontrollert mot samme hash og eksakte
originalspenn. Tidene omfatter synlige assertions og skjermbilde, ikke bare
backend. To serveroppstarter er utført av prøven. Det ble ikke brukt mockede
API-svar, og ingen sidefeil eller eksterne nettverkskall ble observert.

### Uavhengig bekreftelse og synlig vurdering

QA gjennomførte deretter egen Playwright-kjøring mot den ferdige serveren,
med nye ekte Nøstegaten-/Rostockgata-importer og ny gyldig Nøstegaten etter
korrupt PDF og eksplisitt retry. Alle seks delprøver bestod uten mocks,
betalte POST-kall eller JavaScript-feil. Presis 15 000,5 kr/mnd ga 180 006
kr/år; negativ leie fjernet berørte tall, null ga 0 %, reset beholdt
publiserte referanser. Ny analyse fjernet egen leie, drift og finansiering.

Kontantbehov er i utgangspunktet ukjent ved uavklart eierform og inkludering
av engangskostnader. QA sin første forventning om automatisk kontantbehov var
en feil testantakelse og er bevart i privat `independent-qa/attempt1/`.
Etter faktisk kildekontroll av Nøstegaten side 8 i **Bak tallene** viste UI
4 152 340 kr. Med 1 000 000 kr egenkapital, 5 % og 25 år ga uavhengig
annuitetsfasit 18 428,27 kr/mnd, korrekt avrundet til 18 428 kr i appen.
Full kontantstrøm forble ærlig ukjent ved uavklart samlet gjeldsbetaling.

QA og hovedagenten har visuelt sett gjengitte hero-, leie-, nøkkeltall- og
risikoutsnitt på desktop/mobil. Mobilkontroller bryter riktig om; risiko
kommuniserer ufullstendig dekning. Dokumentpreview er et faktisk raster fra
originalen med synlig fysisk side og forbehold om uidentifisert motiv;
det er ikke en verifisert bildeklassifisering av eiendommen.
[QA-vurdering](2026-11-05-independent-qa.md) og
[persondatafritt QA-resultat](2026-11-05-paa-qa-resultat.json).

README og sentral utsattoversikt er oppdatert. Aktuell promptlogg følger
samme lokale commit. `git log -- .docs/implementation-artifacts/spec-paa-stabilisering.md`
identifiserer leveranserevisjonen. Ingen push er gjort. Den ferdige lokale
serveren er startet med Node 24.21.0, demo, tom API-nøkkel og FINN av.

## Begrensninger

Individuell markedsleie er ikke beregnet; publiserte referanser gjelder sine
egne utvalg og perioder. Nøstegatens foreløpige kostnadsfradrag 25 197 kr/år
forutsetter at kommunale avgifter kommer i tillegg til fellesutgiftene.
Rostockgatas 43 920 kr/år er en kjent delsum. Full drift, kostnadsår og
finansiering må kontrolleres før full nettoyield/kontantstrøm og screening.
Eiendomsskatt inkludert i kommunale avgifter og underposter i fellesutgifter
telles ikke på nytt.

Teknisk dekning er fortsatt blocked/incomplete. OCR og lokale risikotreff
er ikke komplett tilstandsvurdering, grunnbokskontroll eller juridisk
undersøkelse. Ressursvakten 512 MiB gjelder Node-importbarnet; separat OCR
har eget vern, ikke én samlet 512 MiB-kvote. Ingen generell PDF-støtte eller
produksjonsberedskap hevdes. Åpne historiske saker videreføres i
[sentral oversikt](../../implementation-artifacts/deferred-work.md).

**Sensorvurdering:** PAA kan demonstreres uten teknisk bistand i brukerflyten
etter dokumentert oppstart, med de kontrollerte originalene. Brukeren kan
importere, lese analyse/kilder/risiko, justere leiescenario og starte ny analyse
uten terminalinngrep. Full screening krever fortsatt reell kontroll av det
ufullstendige kostnads- og rapportgrunnlaget.
