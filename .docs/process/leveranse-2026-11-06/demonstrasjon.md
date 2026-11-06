# Offentlig demonstrasjon og kontrollfasit

Dato: 2026-11-06. Følg først [README](../../../README.md) for installasjon og lokal demo. Prøven trenger ingen privat PDF eller konto. Alle originaler nedenfor er fiktive testfiler laget for prosjektet, med generator og fasit i Git; ingen reelle salgsoppgaver skal legges til eller skaffes til prøven.

Dette er en repeterbar oppskrift med forhåndsdefinerte forventninger. Fersk AI-assistert gjennomkjøring og begrensninger dokumenteres i [ren-klon-beviset](ren-klon.md). Oppskriften er ikke i seg selv bevis for at et menneske har fullført S6.

## Investeringsoversikt og originalkilder

1. Åpne `http://127.0.0.1:3000` (eller valgt port). Last opp [mixed-12.pdf](../../../tests/fixtures/sales-prospectus/mixed-12.pdf).
2. Vent på «Dokumentuttrekk klart.» Prisgrunnlaget er **3 200 000 kr** inklusive 200 000 kr fellesgjeld. Kontantbehovet inklusive omkostninger er **3 075 000 kr**; totalt kapitalbehov er **3 275 000 kr**. Ukjent leie skal ikke få et oppdiktet tall.
3. Åpne **Juster leie og drift ↗**, oppgi årsleie **252 000**, årsdrift **48 000** og år **2026**, og velg **Bruk som ubekreftede forutsetninger**. Månedsfeltene viser da **21 000** og **4 000**. År 2026 er nødvendig for å bruke testdokumentets fellesgjeldsbetaling i samme årsgrunnlag; direkte månedsjustering alene kan ellers vise ukjent kontantstrøm. Sett egenkapital **1 000 000**, rente **5,5 %**, løpetid **25 år**. Tallene er fiktive brukerforutsetninger. Bruttoyield = 252 000 / 3 200 000 = **7,875 %**; NOI = 252 000 − 48 000 = **204 000 kr/år**; nettoyield = **6,375 %**. Kontantstrøm blir ca. **3 258 kr/mnd**, etter privat annuitet og årlig fellesgjeldsbetaling 12 000. Yield vises avrundet til **7,88 / 6,38 %**.
4. Endre rente. Kontantstrøm endres; yield er uendret. Blank drift eller ugyldig finansiering skal gi en konkret mangel og ukjent avhengig nøkkeltall. Nullrente er gyldig når øvrig grunnlag finnes.
5. Fold ut **Beløp og kildegrunnlag** og åpne originalkilde. Åpne juridiske/tekniske funn og **Se alle funn og kilder**. Takets TG3 står på **fysisk PDF-side 10 / trykt side 6**; sammendrag på fysisk side 2 er et ekstra belegg. To like beskrivelser i ulike bad må ikke bli ett forhold. Lukk PDF med Esc og kontroller fokusretur.
6. Prøv fanene i **Utforsk kontantstrøm, lån og rente** med piltaster, Home/End og grafens slider. Datatabeller gjør tallene tilgjengelige uten grafen.

Økonomiscenarioet er ubekreftet. Det gjør ingen teknisk rapport komplett, og det endrer ikke en kontrollert anbefaling. Statistisk leiereferanse og foreløpig driftsdelsum har synlige begrensninger. Den fiktive Testby-adressen skal ikke få en gjettet byreferanse.

## Alle tre anbefalingene med salgsoppgaven

Start et nytt, uavhengig case med sideoppdatering mellom variantene, og last opp `mixed-12.pdf` igjen. Fra dagens oversikt åpner **Bak tallene** den separate flaten **Tallgrunnlag**. Denne navigasjonen er nødvendig før den historiske kontrollreisen.

| Variant | P | L kr/år | D kr/år | J kr/år | Ymin | TG3 etter kontroll | Fasit |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Økonomisk sterk, fiktivt avklart | 3 200 000 | 400 000 | 60 000 | 12 000 | 7 % | Avklart med eksplisitt fiktiv begrunnelse og grunnlag | **Gå videre** |
| Økonomisk svak, fiktivt avklart | 3 200 000 | 100 000 | 60 000 | 12 000 | 7 % | Som over | **Forkast** |
| Uavklart alvorlig forhold | 3 200 000 | 400 000 | 60 000 | 12 000 | 7 % | Uavklart | **Innhent mer informasjon** |

Tall og utfall finnes i [extended-expected.json](../../../tests/fixtures/sales-prospectus/extended-expected.json), opprettet før implementeringen. J er her en uttrykkelig fiktiv brukerforutsetning, ikke låneberegningen i oversikten.

1. I **Tallgrunnlag** skriv tabellverdiene. Velg **Egen forutsetning** som opphav for P/L/D/J/Ymin og oppgi eksempelvis «Fiktiv demonstrasjon fra extended-expected.json, felt L» som forklaring. Velg **År** og **2026** for L/D/J; L er **Forventet leie**. Kontroller importens kostnadsinnhold: det skal forklare D = 60 000 og J = 12 000, ikke legges til på nytt.
2. Velg **Bekreft tallgrunnlaget**, deretter **Fortsett til Tilstandsrapport**. Kontroller riktig eiendom og foreslått rapportområde i originalen før de to avkryssingene bekreftes. Velg **Gå til Kontroller funn**. Hvis en faktisk lokal analyse har usikker dekning, skal denne ikke krysses bort; den fiktive, kontrollerte fixtureflyten har sitt eget bundne grunnlag.
3. Velg hvert aktivt funn, åpne originalside og velg **Bekreft** bare etter sammenligning. For takets TG3: velg **Uavklart** i mangelvarianten. De to andre variantene kan bruke **Avklart** med tydelig fiktiv tekst, f.eks. «Fiktivt takforhold er tilstrekkelig avklart for denne regelprøven» og «Fiktiv testreferanse, ikke en reell fagrapport». Dette demonstrerer kodekravet; det er ingen ekte faglig avklaring.
4. Velg **Bekreft gjeldende liste**, deretter **Beregn og vis resultat**. Sterk variant: bruttoyield **12,5 %**, NOI **340 000**, nettoyield **10,625 %**, kontantstrøm **328 000 kr/år**. Svak variant: bruttoyield **3,125 %**, NOI **40 000**, nettoyield **1,25 %**, kontantstrøm **28 000 kr/år**. Uavklart TG3 gir **Innhent mer informasjon** selv med sterk økonomi.
5. Gå tilbake og endre L: tidligere kontroll/resultat må bli utdatert eller kreve ny bekreftelse. Gå tilbake til oversikten og endre bare scenario: kontrollert snapshot må bestå. Ingen av handlingene skal sende et modellkall.

De automatiserte [prospectus-import](../../../tests/e2e/prospectus-import.spec.ts)- og [investment-overview](../../../tests/e2e/investment-overview.spec.ts)-prøvene etterprøver disse viktige skillene med faktisk lokal import. Enkelte andre feil-/kontrollprøver bruker stubber, som beskrevet i testdokumentasjonen.

## Feil input, gjentakelse og begrensninger

| Prøve | Forventning |
| --- | --- |
| Last opp [invalid-format.pdf](../../../tests/fixtures/property-cases/invalid-format.pdf) | Tydelig formatfeil og ingen vellykket tomliste. |
| Last opp [missing-report-6.pdf](../../../tests/fixtures/sales-prospectus/missing-report-6.pdf) | Økonomi som kan leses beholdes; manglende rapport sperrer komplett teknisk grunnlag. |
| Last opp [attached-report-6.pdf](../../../tests/fixtures/sales-prospectus/attached-report-6.pdf), så [separate-report-4.pdf](../../../tests/fixtures/sales-prospectus/separate-report-4.pdf) som rapport | Vedlegg er ikke automatisk lest; separat original/kilde skal beholdes. TG3 er på fysisk side 3 i separat rapport. |
| Blank L eller blank D i kontrollflyten | Feltmangel; blank blir ikke 0 eller en konklusiv screening. |
| TG3 Avklart uten begrunnelse/grunnlag | Ugyldig avklaring, fortsatt Innhent mer informasjon. |
| Importer samme fil igjen, så en annen | Ingen gamle scenariojusteringer/bekreftelser/funn skal bli gjeldende for et nytt objekt. |
| Smal visning og bare tastatur | Lesbar oversikt, tilgjengelige etiketter, Esc/fokusretur og grafer som også kan leses i tabell. |

[Den opprinnelige F1–F4-fasiten](../../../tests/fixtures/property-cases/expected.json) og [fixtureopphavet](../../../tests/fixtures/property-cases/README.md) er fortsatt historisk og maskinelt kontrollgrunnlag. De fire lagrede demosvarene er fiktive, ikke ekte KI-uttrekk. Salgsoppgaveprøven over er sensors korteste vei fra dagens hovedskjerm til økonomi, originalkilder og alle anbefalingene.
