# Uavhengig QA av PAA som investeringsverktøy

Arbeidsøkt startet 2026-11-05; siste avgrensede kontroll fortsatte 2026-11-06.
Utført av egen QA-agent, som ikke endrer produktkoden.
Grunnlag: [oppdrag og akseptansekriterier](../../implementation-artifacts/spec-paa-investeringsverktoy.md),
AGENTS.md, Product Brief, faglærertilbakemelding, sensorveiledningens eksisterende kildeuttrekk og godkjent Konsept A.

## Metode

[Den kjørbare akseptanseprøven](../../../tests/e2e/investment-tool-real.spec.ts)
bruker ekte Chromium, backend på `http://localhost:3000` og begge private originaler.
Ingen API-ruter stubbes. `PAA_TEST_INVESTMENT_REQUIRED=1` gjør originalene obligatoriske uten skip.
Nettleserfeil og alle forespørsler registreres; bare lokale dokumentimporter og leieoppslag tillates som POST.
Backend er startet med Node 24.21.0, demo og tom AI-nøkkel av hovedagenten.

Fasiten beregnes separat i testen med vanlig annuitetsformel og øreavrundet månedsbetaling.
Ingen produksjonsfunksjon brukes som økonomisk fasit. Testen kontrollerer kapital, brutto-/nettoyield,
månedlig og årlig kontantstrøm, alle direkte justeringer, finansiering av omkostninger, 95 % belåning,
negativ kontantstrøm, nullrente, kontantkjøp, ugyldige/manglende felt, kilder, gjentatt samme PDF,
bytte av eiendom og mobilvisning på 390 × 844. Graffaner prøves med tastatur.

Private originaler, råresponser, skjermbilder og spor ligger bare under ignorert
`private/incoming/qa-investment-2026-11-05/`.

## Uavhengig fysisk kildekontroll

Originalsidene ble gjengitt lokalt med PDFKit og sett visuelt:

- Nøstegaten fysisk side 89 forklarer TG-skalaen generelt; den dokumenterer ikke et TG2-/TG3-avvik.
- Nøstegaten side 94 viser TG1 for vann-/avløpsledninger og ventilasjon, og TGIU for utilgjengelig innebygget varmtvannstank.
- Rostockgata side 39 er generell TG-forklaring. Side 43 viser TG1 for skjulte bærekonstruksjoner og omtaler manglende radonmålingsdokumentasjon. Omtalen sier også at øvre etasje gir lavere risiko enn boliger med direkte grunnkontakt.
- Rostockgata side 44 viser TG1 for membran/sluk som ikke kunne kontrolleres visuelt i sin helhet.
- Rostockgata side 46 viser TG0 for skjulte avløp og felles varme-/varmtvannssystem. Den sier uttrykkelig at skjulte installasjoner og fellessystemene ikke er nærmere kontrollert.

Disse sidene begrunner konkrete undersøkelsesbehov, og gir ikke grunnlag for å produsere TG2 eller TG3.
Det hevdes ikke at hele rapportene er teknisk godkjent eller generelt ferdig tolket.

## Funn og iterasjoner

Før første nettleserprøve ble en tilstandsfeil funnet ved kodegjennomgang: ugyldig belåningsinput
kunne overleve gjenopplasting av samme PDF når kapitalgrunnlag og tom egenkapital var like.
Hovedagenten nøkkelkoblet finanspanelet til gjeldende import. Ekte prøven inkluderer reproduksjonen.

Første start i sandkassen ble stoppet av Chromiums macOS MachPort-rettigheter før noen produkthandling.
Neste kjøring ble avbrutt fordi backendkode var endret etter oppstart; den regnes ikke som akseptansebevis.

Første komplette kjøring etter omstart fikk **to reelle feil**: opplasting og leieoppslag fungerte for begge dokumenter,
men totalt kapitalbehov forble ukjent og sperret videre finansiering. Kjøpskostnadene hadde uavklart inkludering;
Nøstegaten hadde i tillegg uavklart eierform/dokumentavgiftsrelevans. Feilen er sendt til hoved-/finansagent.
Ukjente kostnader skal fortsatt behandles eksplisitt; testen svekkes ikke til å akseptere manglende kapitalfunksjon.

Kapitalfeilen ble rettet med eksakt kildebelagt eierform og et avgrenset omkostningsregnskap:
obligatoriske kostnadsposter må summeres til oppgitt total, og pris + fellesgjeld + omkostninger
må avstemmes. Kontrollsperrene er ikke generelt fjernet. En ny faktisk prøve bekreftet kapital,
finansfasit og hele Nøstegaten-flyten. Rostockgata avdekket deretter en presisjonsfeil ved maksimal belåning:
panelet brukte 20 desimaler mens finansdomenet brukte 50, slik at slideren forsvant på det ene eksakte endepunktet.
Hovedagenten rettet panelets presisjon og la til regresjonstester. Begge endepunktene prøves nå i nettleseren.

Visuell kontroll avdekket også at Rostockgatas radonpreview fremhevet områdeaktsomhet før manglende målinger.
Det er erstattet av en nøytral kortforklaring; hele kildeutdraget, inklusive rapportens nyanse om øvre etasje,
beholdes under utfolding. Scenarioets årsbeløp er presisert som annualisert nivå.

En mellomliggende kjøring ble stoppet for å rette testens forventning om den kosmetiske strengen `0.00`:
korrekt `0` og `0.00` godtas nå begge, mens blank verdi ikke godtas som null. Ingen produktverdi eller fasit
ble endret for å skjule testfeilen.

## Faktiske sluttresultater

Den komplette prøven i `playwright-final.txt` bestod **2/2 tester uten skip på 2,2 minutter**,
med 14 grupperte kontrollsteg og seks nye faktiske PDF-importer. Begge dokumenter ble importert,
importert igjen og deretter byttet til den andre eiendommen i samme nettleserøkt.

| Kontroll | Nøstegaten | Rostockgata |
| --- | --- | --- |
| Kapitalbehov fra avstemt dokumentgrunnlag | 4 152 340 kr | 8 816 090 kr |
| Egenkapital ved 80 % belåning | 912 340 kr | 1 936 090 kr |
| Privat lån ved 80 % belåning | 3 240 000 kr | 6 880 000 kr |
| Betaling ved 5,5 % / 25 år | 19 896,43 kr/mnd | 42 249,22 kr/mnd |
| Cash ved egen leie 16 000/24 000 og drift 3 000 kr/mnd | −6 896,43 kr/mnd | −21 249,22 kr/mnd |
| Cash ved 95 % / 8 % / 10 år, samme leie og drift | −33 680,79 kr/mnd | −78 124,64 kr/mnd |
| Eksakt maksimum og innskriving av avrundet maksimum | Bestått, synlig 102,53 % | Bestått, synlig 102,51 % |
| Native Home/End og faktisk musedrag helt til maks | Bestått etter separat hendelsesretting | Bestått etter separat hendelsesretting |
| Blank/ugyldig drift, blank rente og blank leie | Bestått | Bestått |
| Nullrente og kontantkjøp uten lånerente/løpetid | Bestått | Bestått |
| Mobil 390 × 844, tastatur og faktisk touch på leieslider | Bestått | Bestått |
| Kildebelegg og fysisk originalside med zoom | Bestått, side 12 | Bestått, side 26 |
| Gjentatt PDF etter ugyldig LTV og deretter annen eiendom | Bestått | Bestått |

Leie og drift i finansfasiten er eksplisitte testforutsetninger, ikke dokumentfakta.
Rostockgata viser korrekt varsel når egen totaldrift er lavere enn dokumentets kjente delsum.
Ingen dokumentkostnad legges automatisk til den valgte totale D en gang til.
Begge prøver registrerte **null sidefeil, null eksterne nettleserforespørsler og bare lokale import-/leie-POST-er**.

Endelige desktop- og mobilbilder er sett visuelt, også full mobilside, negativ kontantstrøm,
begge maksimalbelåninger, juridisk og teknisk risiko og begge originale PDF-kildevisninger.
Det observerte skip-lenkeinnslaget i lange sammensatte elementbilder er et skjermbildeartefakt:
egen faktisk mobilviewport og DOM-måling bekrefter at lenken er utenfor synlig viewport når den ikke har fokus.
Ingen horisontal sidescroll eller kritisk avklipping er funnet i de prøvde flatene.

Siste avgrensede kontroll er utført etter hovedagentens kosmetiske presisering.
Et nytt ekte Rostockgata-opplastingsforløp bekrefter alle 13 bevarte tekniske opplysninger,
uendret ufullstendig dekning, nøytral radonpreview og at bare identisk gjentatt preview er fjernet.
Kildedetaljene kan fortsatt foldes ut, og fysisk originalside 41 åpner fra mobil.
Desktop, mobil og den faktiske mobile PDF-dialogen er sett visuelt.
Prøven bestod uten sidefeil eller eksterne forespørsler. Bevis ligger i `preview-final/` og `preview-final.txt`.

## Uavhengig sluttvurdering

Den første sluttvurderingen ga grønt lys for de fullførte kontrollgrenene.
Etterpå fant hovedagenten et ytterligere grenseproblem: nettleserens native representasjon av
Rostockgatas maksimale sliderverdi kunne ligge marginalt over den eksakte desimalgrensen.
Fritekstmaks og egenkapital 0 var allerede kontrollert, men faktisk Home/End og musedrag
er egne hendelser. Akseptansetesten er derfor utvidet med begge native endepunkter og musedrag
for begge originaler. Dette utløste en supplerende faktisk kjøring og ny feilretting.

Den første supplerende komplette prøven fikk to feil etter Home → End, før musedrag:
begge originaler fikk blank egenkapital. En kort ny ekte Rostockgata-prøve registrerte
native input-/change-hendelser før React behandlet dem. Chromium ga verdien
`102.512674418605`, mens `Number(slider.max)` var `102.51267441860465`;
forskjellen var `3.552713678800501e-13`. Eksakt likhet mellom native-tallet og grensen
var derfor utilstrekkelig. Home virket, men End fjernet betaling, kontantstrøm og slider.
Bevis: `slider-end-probe/summary.json`, `after-end.png` og `playwright-native-final.txt`.
Ingen fasit er svekket for å godta denne feilen.

Hovedagenten rettet bare native sliderhendelser: verdier ved eller utenfor nettleserens native
endestopp bindes til det eksakte finansielle endepunktet. Fritekstvalideringen er fortsatt streng.
Den **siste komplette kjøringen**, `playwright-native-verified.txt`, bestod igjen **2/2 uten skip
på 2,2 minutter** med alle tidligere kontroller, Home, End og faktisk musedrag for begge dokumenter.
Råresultater og nye bilder ligger i `results-native-verified/`. Rostockgatas DOM-verdi ved maks
var fortsatt `102.512674418605`, men appen beholdt nå riktig egenkapital 0, samlet gjeld,
betaling, kontantstrøm og slider. Begge siste native-endepunktbilder og ferdige mobilflater er sett visuelt.
Ingen feil i nettleseren eller eksterne forespørsler ble registrert; bare seks lokale importer og seks leieoppslag.

**GRØNT LYS innenfor den dokumenterte bachelorprototypens avgrensning.**
De kritiske kapital- og maksimalbelåningsfeilene ble faktisk rettet og prøvd på nytt.
Ingen utestående kritisk feil i den prøvde investeringsflyten eller de undersøkte mobil-/desktopflatene er funnet.
Denne vurderingen gjelder UX og de faktiske prøvene ovenfor; hovedagenten dokumenterer full bred regresjon separat.

Gjenværende avgrensninger:

- Teknisk og juridisk dokumentdekning er fortsatt ufullstendig. De to originalene gir ikke grunnlag for oppdiktede TG2-/TG3-avvik; generelle graderingsforklaringer blir ikke gjort til eiendomsfunn.
- Lokale tekstregler og OCR gir konkrete kontrollbehov og kilder, men dokumenterer ikke generell TG-treffsikkerhet, lovlig bruk eller godkjenning.
- Separate kildeomtaler av et mulig samme fellessystem kan stå flere steder når sikker identitet ikke er avklart. Antallet er opplysninger, ikke en risikoscore.
- Leiereferansene er statistikk på gruppenivå. Full drift, leieforventning og finansiering er brukerens egne scenarioforutsetninger; fremtidig vedlikehold og individuell markedsleie er ikke automatisk kostnads-/prisberegnet.
- Beregningen bruker annuitetslån uten lånegebyrer, uendret rente og før skatt. Årscash er et annualisert månedsnivå, og høy vist belåning dokumenterer ingen lånetilsagn.
- Semantisk betalt AI er ikke kjørt eller aktivert i disse prøvene.

Godkjenningen er dermed av et praktisk verktøy for sporbart økonomisk scenario og videre dokumentkontroll,
og er ingen teknisk/juridisk attestasjon av eiendommene eller kjøpsanbefaling.
