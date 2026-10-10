---
title: "PRD-addendum: Property Acquisition Agent"
status: final
created: 2026-10-10
updated: 2026-10-10
---

# PRD-addendum: Property Acquisition Agent

Dette vedlegget bevarer de avklarte testeksemplene og S5-måleprotokollen fra [PRD-en](prd.md). Flytting er redaksjonell; krav, forventede utfall og brukerbeslutninger er uendret. Test-ID-ene brukes videre i stories og testbevis. Ingen produkttester eller tidsmålinger er gjennomført gjennom utarbeidingen av dette dokumentet.

## TG3-avklaring: testeksempler for FR-5

| Gitt | Når | Forventet resultat |
|---|---|---|
| TG3 på elektrisk anlegg fordi deler av anlegget ikke kunne dokumenteres; ellers komplett bekreftet grunnlag med F1-økonomi | Brukeren velger Avklart, begrunner at en etterfølgende kontroll ikke avdekket forhold som krever umiddelbar utbedring, og oppgir kontroll fra autorisert elektriker som grunnlag | Gyldig brukerbekreftet avklaring; Gå videre etter de økonomiske reglene. Opprinnelig TG3, kilde og avklaring vises fortsatt. Systemet verifiserer ikke kontrollen. |
| Samme funn, men brukeren kjenner bare til at forholdet finnes og har ikke tilstrekkelig informasjon om konsekvensen | Status er Uavklart | Innhent mer informasjon med funnet og avklaringsbehovet synlig. |
| Brukeren velger Avklart | Begrunnelse eller avklaringsgrunnlag er blankt eller bare mellomrom | Feltfeil; avklaringen er ugyldig; Innhent mer informasjon. |
| Status er ukjent eller ikke valgt | Screeningreglene kjøres | Funnet behandles som uavklart; Innhent mer informasjon. |
| To alvorlige TG3-funn; bare ett har gyldig avklaring | Screeningreglene kjøres | Innhent mer informasjon på grunn av det andre funnet. |
| Alle alvorlige TG3-funn har gyldig avklaring; øvrig kritisk grunnlag er tilstrekkelig | Økonomien er som F2 | Forkast fordi nettoyield er lavere enn Ymin. |
| Gyldig avklaring og tidligere Gå videre | Status endres til Uavklart | Gjeldende anbefaling er Innhent mer informasjon. |

## Rapportanalyse: RT-1–RT-19

Testdata utarbeides med forhåndsdefinert fasit i tråd med brief/addendum. Tabellen angir forventet atferd; testene er ikke implementert eller kjørt i denne PRD-økten.

| ID og krav | Gitt / handling | Forventet resultat |
|---|---|---|
| RT-1 · FR-6 | En tekstbasert tilstandsrapport på 30 sider lastes opp; brukeren starter live-analyse | Rapporten godtas innenfor sidegrensen; ett KI-kall; gjeldende dokumentnavn vises. |
| RT-2 · FR-6, FR-9 | En rapport på 31 sider, en PDF uten lesbart tekstlag eller en fil som ikke er PDF forsøkes analysert | Tydelig dokumentfeil med årsak; ingen OCR eller analyse av annet format. Ingen vellykket tom funnliste eller komplett teknisk grunnlag; Innhent mer informasjon, også ved F1-økonomi. |
| RT-3 · FR-6 | Samme rapport gjenbrukes, og brukeren endrer bare L | Eksisterende uttrekk gjenbrukes; ingen ny KI-analyse. |
| RT-4 · FR-6, FR-11 | En ny rapport erstatter den forrige | Ny analyse kreves; gammel funnliste, bekreftelse og TG3-avklaring brukes ikke som gjeldende grunnlag. |
| RT-5 · FR-7, FR-8 | F4-rapporten har TG3 «Alvorlig lekkasje i tak» på PDF-side 4, som har trykt sidetall 2 | Funnet viser TG3, korrekt kort beskrivelse, dokumentnavn og PDF-side 4. Trykt sidetall 2 erstatter ikke PDF-side 4. |
| RT-6 · FR-7 | Rapporten beskriver et forhold uten eksplisitt TG2/TG3 | KI setter ikke en egen grad og presenterer ikke forholdet som et dokumentert TG2/TG3-funn. |
| RT-7 · FR-8, FR-9 | KI oppgir side 99 i en rapport på 10 sider, mangler kilde eller er usikker på graden | Feilen/usikkerheten er synlig; ingen gjettet side eller grad; uttrekket presenteres ikke som dokumentert rapportfaktum. |
| RT-8 · FR-8 | Brukeren vil kontrollere et funn på PDF-side 4 | Originalrapporten kan åpnes eller lastes ned; dokumentnavn og korrekt PDF-side er tilgjengelige for kontroll. |
| RT-9 · FR-9 | Én side er uleselig, eller KI-kallet avbrytes etter delvise funn | Tydelig dokumentfeil for uleselig tekst eller analysefeil for avbrutt kall; ufullstendig grunnlag og merkede delresultater; Innhent mer informasjon også ved F1-økonomi. Ingen påstand om vellykket analyse eller fravær av TG3 på uleselige sider. |
| RT-10 · FR-9, FR-11 | KI returnerer ingen funn | Manglende eller ufullført uttrekk er ikke bevis på fravær. Bare fullført analyse og brukerbekreftet kontroll kan gi tilstrekkelig rapportgrunnlag med tom funnliste. |
| RT-11 · FR-10, FR-11 | KI sier TG3 på side 4; originalen viser TG2 på side 5. Brukeren korrigerer og bekrefter | Aktivt funn er brukerbekreftet TG2 på side 5 med rapportkilde. Opprinnelig KI-uttrekk og korrigeringen kan skilles; ingen ny KI-grad eller nytt KI-kall. |
| RT-12 · FR-10, FR-11 | Et KI-funn finnes ikke i originalrapporten. Brukeren avviser funnet og bekrefter listen | Funnet merkes brukeravvist, beholdes tilgjengelig som opprinnelig uttrekk og brukes ikke som aktivt rapportfunn. Avvisningen fremstilles ikke som TG3-avklaring. |
| RT-13 · FR-11, FR-5 | Funnlisten er bekreftet, men F4 har uavklart alvorlig TG3 | Innhent mer informasjon; listebekreftelsen avklarer ikke TG3-funnet. |
| RT-14 · FR-11 | En bekreftet liste korrigeres igjen | Listen krever ny bekreftelse; gammelt resultat fremstilles ikke som gjeldende for den endrede listen. |
| RT-15 · FR-6, FR-7 | Demo kjøres med lagret uttrekk uten nettverk; finans-/regeltester består | Demo merkes som lagret analyse og krever ingen nøkkel. Dette rapporteres ikke som bestått live KI-evaluering. |
| RT-16 · FR-7 | Kontrollert utvalg med ti fasitmerkede TG2 og to TG3; KI finner ni TG2 og begge TG3 med riktig side, uten oppdiktede funn | S2 er oppfylt i utvalget. Ett oversett TG3, et oppdiktet funn eller færre enn ni riktige TG2 med riktig side gir ikke bestått S2. Brukerens etterfølgende retting forbedrer ikke målt kvalitet på opprinnelig KI-uttrekk. |
| RT-17 · FR-7 | Evalueringsrapporten inneholder flere eksplisitte TG2/TG3, inklusive ett KI beskriver som lite relevant | Alle funn omfattes av uttrekk og fasit. Ingen utelates på grunn av KI-relevansvurdering. Hvert kjent TG3 kontrolleres enkeltvis med grad, beskrivelse og PDF-side. |
| RT-18 · FR-7 | Ett eksplisitt TG2 mangler i uttrekket, men samlet TG2-resultat når S2s 90 %-terskel | Utelatelsen dokumenteres som uttrekksfeil selv om S2s minimum er nådd; relevansfiltrering er fortsatt ikke tillatt. |
| RT-19 · FR-9, FR-11 | KI-kallet feiler uten å returnere funn; økonomien er som F1 | Tydelig analysefeil og Innhent mer informasjon. Ingen vellykket tom funnliste, brukerbekreftet komplett teknisk grunnlag eller Gå videre. |

## Beregninger: BT-1–BT-18

Alle uendrede verdier i tabellen er som F1: P = 16 000 000 kr, L = 1 900 000 kr/år, D = 400 000 kr/år, J = 800 000 kr/år og Ymin = 7 %. Oppgitte verdier er bekreftet med mindre testen sier noe annet. Anbefalingseksemplene forutsetter tilstrekkelig teknisk grunnlag med mindre annet er angitt. Dette er kravfasit; produkttestene er ikke implementert eller kjørt her.

| ID og krav | Gitt / handling | Forventet resultat |
|---|---|---|
| BT-1 · FR-12, FR-14 | Komplett F1 | Bruttoyield 11,875 %, NOI 1 500 000 kr/år, nettoyield 9,375 %, kontantstrøm 700 000 kr/år. Formler og inputgrunnlag er tilgjengelige. |
| BT-2 · FR-12 | F2: L = 1 400 000 kr/år | Bruttoyield 8,75 %, NOI 1 000 000 kr/år, nettoyield 6,25 %, kontantstrøm 200 000 kr/år. |
| BT-3 · FR-13 | F3: L mangler | Ingen av de fire nøkkeltallene vises som beregnet; manglende L identifiseres. Innhent mer informasjon. |
| BT-4 · FR-12, FR-13 | F4: samme finansverdier som F1, men uavklart alvorlig TG3 | Samme fire nøkkeltall som F1; delgrunnlag, ikke komplett screening. Innhent mer informasjon. |
| BT-5 · FR-13 | J mangler, mens P/L/D er gyldige og bekreftet | Bruttoyield, NOI og nettoyield som F1; kontantstrøm ikke beregnbar. Blank J blir ikke null. Innhent mer informasjon. |
| BT-6 · FR-13 | P = 0, øvrige finansverdier gyldige og bekreftet | Valideringsfeil; ingen yieldberegning/divisjon med null. NOI 1 500 000 og kontantstrøm 700 000 kan vises som delberegninger. Innhent mer informasjon. |
| BT-7 · FR-12 | L = 120 000, D = 20 000 og J = 50 000 kr per måned | Årsverdier 1 440 000, 240 000 og 600 000 kr; bruttoyield 9 %, NOI 1 200 000 kr/år, nettoyield 7,5 %, kontantstrøm 600 000 kr/år. |
| BT-8 · FR-12, FR-14 | L = 1 520 000 og deretter 1 519 999 kr/år, Ymin = 7 % | Først nettoyield nøyaktig 7 % og kontantstrøm 320 000 kr/år. Deretter NOI 1 119 999 og kontantstrøm 319 999 kr/år; nettoyield er under 7 % selv ved visning 7,00 %. Ingen toleransemargin i regelvurderingen. |
| BT-9 · FR-12, FR-14 | J = 1 500 000 og deretter 1 500 001 kr/år | Kontantstrøm først 0 og deretter −1 kr/år. Null oppfyller kontantstrømkravet; −1 gjør ikke det. |
| BT-10 · FR-12, FR-13 | J = 0 ved eksplisitt bekreftet kontantkjøp | Kontantstrøm 1 500 000 kr/år. Ubekreftet null er derimot utilstrekkelig grunnlag og brukes ikke som gyldig input. |
| BT-11 · FR-12 | L = 300 000 og D = 400 000 kr/år | Bruttoyield 1,875 %, NOI −100 000 kr/år, nettoyield −0,625 %, kontantstrøm −900 000 kr/år. Negative resultater beholdes. |
| BT-12 · FR-15 | Brukeren endrer L fra F1 til F2 og bekrefter endringen | Ny beregning gir F2-tall. Ingen ny KI-analyse av uendret rapport; F1-resultatet fremstilles ikke som gjeldende. |
| BT-13 · FR-13, FR-15 | Ymin mangler og registreres deretter som bekreftet 10 % | De fire nøkkeltallene er hele tiden som F1. Før bekreftelse Innhent mer informasjon; etterpå Forkast etter låst yieldregel. Ingen KI-kall. |
| BT-14 · FR-13 | L har uløste kildeverdier eller D er negativ/ubekreftet | Ingen beregning bruker den utilstrekkelige verdien. Berørte nøkkeltall viser årsaken; konflikt eller ugyldig input erstattes ikke med et standardtall. |
| BT-15 · FR-12, FR-14 | L = 1 440 000 kr/år, D = 20 000 kr/måned og J = 600 000 kr/år | D omregnes med synlig faktor 12 til 240 000 kr/år før beregning. Bruttoyield 9 %, NOI 1 200 000 kr/år, nettoyield 7,5 %, kontantstrøm 600 000 kr/år. Perioder blandes ikke. |
| BT-16 · FR-12, FR-13 | L/D/J har ukjent eller ustøttet periode, eller gjelder ulike år | Berørte verdier brukes ikke som gyldig felles årsgrunnlag. Appen viser hva som må presiseres; Innhent mer informasjon, ikke en konklusjon basert på blandede perioder. |
| BT-17 · FR-13 | J mangler og L = 1 400 000 kr/år | Bruttoyield 8,75 %, NOI 1 000 000 kr/år og nettoyield 6,25 % kan vises som delberegninger. Endelig anbefaling er Innhent mer informasjon; ikke Forkast selv om nettoyield er under Ymin. |
| BT-18 · FR-13 | Ymin mangler, øvrige verdier som F1 | Alle fire nøkkeltall kan vises; endelig anbefaling er Innhent mer informasjon, ikke Gå videre. |

## Anbefaling: AT-1–AT-20

Uendrede verdier og grunnlagsforutsetninger er som komplett F1. Fasit følger de låste regelvariantene i Product Brief-addendum og godkjente presiseringer. Dette er spesifiserte testeksempler, ikke kjørte produkttester.

| ID og krav | Gitt / handling | Forventet resultat |
|---|---|---|
| AT-1 · FR-16–FR-18 | Komplett F1 med bekreftet rapportgrunnlag | Én anbefaling: Gå videre etter prioritet 3. Nettoyield 9,375 % ≥ 7 % og kontantstrøm 700 000 kr/år ≥ 0 vises som begrunnelse; neste handling er grundigere vurdering. |
| AT-2 · FR-16, FR-17 | F2: L = 1 400 000 kr/år | Forkast etter prioritet 2, med nettoyield 6,25 % < 7 %. Positiv kontantstrøm opphever ikke yieldbruddet. |
| AT-3 · FR-16, FR-17 | J = 1 500 001 kr/år | Forkast etter prioritet 2 fordi kontantstrøm = −1 kr/år, selv om nettoyield oppfyller kravet. |
| AT-4 · FR-16, FR-17 | L = 1 400 000 og J = 1 000 001 kr/år | Forkast; begge brudd vises: nettoyield 6,25 % < 7 % og kontantstrøm −1 kr/år < 0. |
| AT-5 · FR-16–FR-18 | F3: L mangler, samtidig som J = 1 500 001 kr/år | Innhent mer informasjon etter prioritet 1; manglende L vises. Ingen leieavhengig kontantstrøm beregnes eller brukes til å konkludere Forkast. |
| AT-6 · FR-16, FR-17 | J mangler og nettoyield er 6,25 % | Innhent mer informasjon; tilgjengelig svakt yieldresultat overstyrer ikke informasjonsmangelen. Manglende J identifiseres. |
| AT-7 · FR-16–FR-18 | F4: uavklart alvorlig TG3 på PDF-side 4; økonomi som F1 | Innhent mer informasjon etter prioritet 1. Rapportfunn, korrekt kilde og avklaringsbehov vises; gode økonomiske tall gir ikke Gå videre. |
| AT-8 · FR-16–FR-18 | F4 med ukjent TG3-status, eller Avklart uten nødvendig begrunnelse/grunnlag | Innhent mer informasjon; manglende gyldig avklaring vises. |
| AT-9 · FR-16–FR-18 | F4 med gyldig brukerbekreftet avklaring etter FR-5 og ellers komplett grunnlag | Gå videre etter prioritet 3. TG3-funnet, status, begrunnelse og avklaringsgrunnlag beholdes; ingen teknisk godkjenning påstås. |
| AT-10 · FR-16, FR-17 | L = 1 520 000 og Ymin = 7 %, deretter L = 1 519 999 kr/år | Først Gå videre ved nettoyield nøyaktig 7 %. Etter bekreftet endring Forkast ved nettoyield under 7 %, selv om visningen avrunder til 7,00 %; terskelbruddet forklares. |
| AT-11 · FR-16, FR-17 | J = 1 500 000 og deretter 1 500 001 kr/år | Først Gå videre ved kontantstrøm 0; etter bekreftet endring Forkast ved −1 kr/år. |
| AT-12 · FR-16–FR-18 | Blank D/J/Ymin, uløste L-kilder, P = 0, negativ D/J eller ubekreftet finansverdi; kjøres som separate varianter | Innhent mer informasjon med konkret mangel/konflikt/valideringsfeil. Bare nøkkeltall med eget gyldig grunnlag vises; ingen konklusiv økonomisk screening. |
| AT-13 · FR-16–FR-18 | Dokumentfeil, analysefeil, ubekreftet funnliste eller uløst kritisk KI-usikkerhet; kjøres som separate varianter | Innhent mer informasjon med konkret årsak. Feil og ufullført status vises tydelig; ingen vellykket tom liste eller falskt komplett grunnlag. |
| AT-14 · FR-16–FR-18 | Komplett F1, men Ymin = 10 % | Forkast; nettoyield 9,375 % < 10 % vises. Brukerens eget avkastningskrav brukes, ikke en skjult standardterskel. |
| AT-15 · FR-16–FR-18 | Bekreftet J = 0 ved kontantkjøp, øvrig grunnlag som F1 | Gå videre; kontantstrøm 1 500 000 kr/år. Null behandles ikke som manglende eller negativt når det er bekreftet. |
| AT-16 · FR-18 | Et Gå videre-resultat finnes; brukeren endrer finansverdier, funnliste, rapport eller TG3-status; kjøres som separate varianter | Gammelt resultat vises ikke som gjeldende for endret grunnlag. Nødvendig kontroll/bekreftelse/ny rapportanalyse kreves; ny screening følger gjeldende regelprioritet. |
| AT-17 · FR-18 | Brukeren åpner resultatet fra live- eller demoflyt | Én anbefaling og begrunnelse øverst; input, beregninger, alle aktive funn, kildeopplysninger, endringer og mangler er tilgjengelige. Demo merkes; ingen score, kjøpsbeslutning eller budsending. |
| AT-18 · FR-16, FR-17 | L mangler, Ymin mangler, dokumentanalysen har feilet og et kjent alvorlig TG3-funn er uavklart samtidig | Én anbefaling: Innhent mer informasjon etter prioritet 1. Alle fire kjente utløsende forhold vises med berørt felt/funn og nødvendig neste handling; begrunnelsen stopper ikke ved første mangel. |
| AT-19 · FR-16, FR-17 | Samme ferdig registrerte grunnlag og faste regler evalueres gjentatte ganger; omfatter F1, F2 og kombinasjonen i AT-18 | Nøyaktig samme anbefaling, utløsende regelgrunnlag, regelbegrunnelse og anbefalingsbundne neste handling hver gang. Ingen KI-kall for å produsere anbefaling eller begrunnelse. |
| AT-20 · FR-16, FR-17 | F2-økonomi og uavklart alvorlig TG3 samtidig | Innhent mer informasjon etter prioritet 1. TG3-avklaringsbehov vises; yieldbrudd kan ikke overstyre til Forkast. Gyldige økonomiske delresultater er fortsatt tilgjengelige. |

## S5: Måleprotokoll og TT-1–TT-9

1. Bruk en forhåndsdefinert case og dokumentfasit. Hovedanalysen må ha gyldige, bekreftede finansverdier og en ferdig opplastet støttet rapport ved start. Case F3 med manglende L er fortsatt en regeltest, men har ikke gyldig startgrunnlag for en vellykket S5-hovedanalyse før tallmangelen er rettet.
2. Registrer **t_start** ved brukerens trykk på «Start analyse», **t_liste** når ferdig funnliste med beskrivelser, PDF-sider og eventuell usikkerhet er synlig, og **t_bekreftet** når kontrollen er gjennomført og gjeldende liste er bekreftet med håndtert TG3-status. Beregn hovedanalysetid = t_liste − t_start og kontrolltid = t_bekreftet − t_liste. Registrer tidsverdier med samme tidsgrunnlag og tilstrekkelig presisjon til å kontrollere sekundgrensene.
3. En ferdig funnliste er ikke automatisk bekreftet eller et komplett teknisk screeninggrunnlag. Synlig usikkerhet skal kontrolleres, og alvorlig TG3 skal ha håndtert status. Uavklart TG3 kan fortsatt gi Innhent mer informasjon etter fullført kontroll; tidsmålingen må ikke tvinge frem Avklart eller skjule funnet.
4. Registrer per forsøk case-ID, rapport/uttrekk som ble brukt, live eller lagret demo, relevante målepunkter, varighet, analyseutfall og om kontrollen ble fullført. Ved feil registreres feilhendelse, kjent årsak og tid frem til feilen separat; den tiden brukes ikke som en vellykket hovedanalysetid. Ufullført kontroll og manglende målepunkter rapporteres separat, ikke som null sekunder eller rask kontroll.
5. Beregn medianene separat for vellykkede hovedanalyser og fullførte kontroller i det dokumenterte utvalget. For et partall observasjoner er medianen gjennomsnittet av de to midterste sorterte verdiene. Vis antall planlagte/målte forsøk, vellykkede og feilede analyser samt fullførte/ufullførte kontroller, slik at feil ikke skjules gjennom utvalget. Uten gyldige observasjoner er målet ikke verifisert. En lav median dokumenterer ikke alene en bestått flyt hvis casene har feilet eller S1–S4 ikke er oppfylt.
6. Live og lagret demo rapporteres separat. Demo kan verifisere målepunkter, kontrollflyt og lokale beregninger, men en rask innlasting av lagret uttrekk er ikke bevis på live KI-behandlingstid. Opplasting/registrering før t_start og maskinell beregning/anbefaling etter t_bekreftet inngår ikke i de to varighetene.
7. Sammenlign målingene med en dokumentert manuell førstevurdering av de samme kontrollerte casene. Oppgi avgrensningene for den manuelle referansemålingen, slik at ulike aktiviteter ikke fremstilles som samme måling. Brukerens opprinnelige anslag på manuell tidsbruk er bakgrunn, ikke en allerede målt referanseverdi. Evalueringsbevis lagres under `.docs/implementation-artifacts/` ved gjennomføring; ingen appfunksjon for tidsrapportering kreves.

**Testeksempler for måleprotokollen:**

Dette er protokollfasit med konstruerte tidsverdier, ikke målte produktresultater.

| ID | Gitt / handling | Forventet registrering |
|---|---|---|
| TT-1 | Før Start analyse brukes 10 minutter til registrering og 2 minutter til opplasting. Ferdig liste blir synlig 240 sekunder etter trykket. | Hovedanalysetid 240 sekunder. De 12 minuttene før start inngår ikke. Kontroll starter når listen blir synlig. |
| TT-2 | KI-kallet er avsluttet etter 120 sekunder, men ferdig funnliste blir synlig etter 150 sekunder. | Hovedanalysetid 150 sekunder, ikke 120. |
| TT-3 | Analysen feiler etter 20 sekunder og returnerer ingen ferdig funnliste. | Feilet analyse med feiltid 20 sekunder; ingen vellykket hovedanalysetid eller startpunkt for vellykket kontroll. Feilen telles og vises separat, ikke som tom vellykket analyse. |
| TT-4 | Fra listen blir synlig bruker investoren 540 sekunder på kontroll, retting/avvisning og TG3-status, og bekrefter deretter listen. Beregning/anbefaling tar ytterligere 3 sekunder. | Kontrolltid 540 sekunder; de 3 maskinelle sekundene inngår ikke. Videre investeringsarbeid inngår heller ikke. |
| TT-5 | Et alvorlig TG3 er fortsatt Uavklart. Brukeren har kontrollert funnene, håndtert status og bekrefter listen etter 420 sekunder. | Fullført kontroll måles til 420 sekunder. Anbefalingen er fortsatt Innhent mer informasjon; ingen automatisk TG3-avklaring for å nå tidsmålet. |
| TT-6 | Brukeren avslutter før kontrollen og listebekreftelsen er fullført. | Kontroll registreres som ufullført, ikke som en kort vellykket kontroll eller null sekunder. |
| TT-7 | Fire vellykkede hovedanalyser tar 120, 240, 300 og 360 sekunder; fire fullførte kontroller tar 300, 480, 600 og 720 sekunder. | Medianene er henholdsvis 270 og 540 sekunder, innenfor begge mål. Individuelle målinger over målet skjules ikke; måltypen er median, ikke maksimum. |
| TT-8 | Medianene er først nøyaktig 300/600 sekunder, deretter 301/601 sekunder. | 300/600 oppfyller tidsmålene; 301/601 gjør det ikke. Vurdering bruker målte varigheter, ikke avrundede minuttvisninger. |
| TT-9 | En demo viser lagret uttrekk etter 1 sekund; en live-analyse feiler etter 20 sekunder. | Demo- og live-resultater holdes atskilt. Ingen påstand om bestått live-analysetid basert på demo eller feiltiden. |
