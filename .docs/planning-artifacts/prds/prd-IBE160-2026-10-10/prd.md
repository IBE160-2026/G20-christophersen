---
title: "PRD: Property Acquisition Agent"
status: final
created: 2026-10-10
updated: 2026-10-10
---

# PRD: Property Acquisition Agent

## Formål og arbeidsstatus

PRD-en er kravgrunnlaget for videre UX, arkitektur, epics, stories, kode og tester i IBE160. Den konkretiserer godkjent v1 fra Product Brief og Mads' bekreftede brukerreise. Funksjoner er gruppert med stabile FR-ID-er; kvalitetskrav har NFR-ID-er og evalueringsmålene beholder S1–S6. Akseptansekriterier står her; detaljerte testeksempler og S5-måleprotokoll står i [addendum](addendum.md). Kode, testfixtures og produktresultater er ikke levert gjennom denne PRD-en.

PRD-en skal konkretisere det låste v1-omfanget i revidert Product Brief med testbare krav og stabile krav-ID-er. Endringer i låste produktbeslutninger krever avklaring med Mads.

**Kravstatus:** UJ-1, FR-5–FR-18, NFR-1–NFR-5 og S1–S6 er godkjent av Mads med presiseringer innarbeidet. FR-1–FR-4 avledes fra låst brief og bekreftet brukerreise. Produktimplementering, fixtures, faktiske tester, tidsmålinger og kjørbarhetsverifikasjon gjenstår; ferdig PRD er ikke bevis for bestått produkt.

## Kildegrunnlag

- [Revidert Product Brief](../../briefs/brief-IBE160-2026-09-15/brief.md)
- [Product Brief-addendum](../../briefs/brief-IBE160-2026-09-15/addendum.md)
- [Revisjonskontroll 2026-10-08](../../briefs/brief-IBE160-2026-09-15/revisjonskontroll-2026-10-08.md)
- [Faglærerens tilbakemelding](../../briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md)
- [Sensorveiledning IBE160 del 1](../../../reference/course/Sensorveiledning-IBE160-Del-1.pdf)

Gjeldende brief og oppfølgingen 2026-10-08 i revisjonskontrollen er grunnlaget, foran historiske forslag og erstattet tallfasit. Mads' senere godkjente presiseringer i PRD-samtalen konkretiserer dette grunnlaget: alle eksplisitte TG2/TG3 trekkes ut, brukerbekreftet TG3-avklaring har begrunnelse og grunnlag, og anbefaling/begrunnelse er kodebasert. S5 har fastsatte målepunkter. Beslutninger og godkjenninger er bevart i [.memlog.md](.memlog.md); kildeuttrekk og sluttavstemming er prosessbevis, ikke nye kravkilder.

## Visjon og målgruppe

Property Acquisition Agent hjelper en privat eiendomsinvestor i Norge å avgjøre om ett boligutleieobjekt bør forkastes, trenger mer informasjon eller fortjener en grundigere vurdering. Appen samler kontrollerbare rapportfunn, bekreftede tall og faste screeningregler, slik at investoren kan forstå og etterprøve neste handling.

Primærbrukeren er Mads som privat eiendomsinvestor med kjennskap til leie, driftskostnader, lån og avkastningskrav, uten å være bygningssakkyndig. Han har allerede funnet objektet før appen brukes. De sentrale oppgavene er å kontrollere økonomisk minimumskrav, oppdage manglende eller motstridende grunnlag og beholde alvorlige tekniske funn synlige før mer tid brukes på befaring eller rådgivere. Dette følger briefens «Sammendrag og visjon» og «Problemet og primærbrukeren», konkretisert i UJ-1.

Verdien i v1 er sporbarhet, etterprøvbar økonomi og konsekvent håndtering av usikkerhet. Bedre tidsbruk og kvalitet er mål som skal evalueres, ikke dokumenterte konkurransefortrinn. Den langsiktige visjonen i brief-addendum bevares som muligheter uten leveranseløfte i v1.

## Låst v1-scope og ikke-mål

**Med i v1:** desktop-webapp for ett manuelt registrert boligutleieobjekt om gangen; manuelle og bekreftede P/L/D/J/Ymin; én tekstbasert PDF-tilstandsrapport på høyst 30 sider; uttrekk av alle eksplisitte TG2/TG3 med kilde; kontroll, korrigering, avvisning og bekreftelse; brukerbekreftet avklaringsstatus for alvorlig TG3; fire deterministiske nøkkeltall; én kodebasert anbefaling med begrunnelse; lokal demo med lagret uttrekk og valgfri live KI.

**Utenfor v1:** sourcing/annonseuthenting, live markedsdata, markedsanalyse, rangering/investeringsscore, DSCR, stresstesting, kapitalbehovsmodell, automatisk låneplan, reparasjons-/vedlikeholdsestimering, ekstra finansielle fratrekk, OCR, analyse av salgsoppgave eller andre dokumenttyper, juridisk analyse og teknisk godkjenning. Kjøpsbeslutning, budsending, flere brukerroller, integrasjoner i eiendomssystemer og samarbeidende KI-agenter inngår ikke. Senere muligheter står i brief-addendum; PRD-en lover ingen leveranse eller tidspunkt for dem.

Kjerneflyten er sekvensiell. KI brukes til rapportuttrekk; beregninger og anbefalinger bestemmes av vanlig kode. Innlogging, varig lagring av vurderinger og lagring av investeringsbeslutning er ikke v1-leveransekrav. Nødvendig teknisk håndtering av gjeldende rapport og uttrekk utformes i arkitektur uten å introdusere nye brukerfunksjoner.

## Begreper

| Begrep | Betydning i denne PRD-en |
|---|---|
| Objekt | Ett manuelt registrert boligutleieobjekt som vurderes om gangen. |
| Førstevurdering / screening | Regelbasert prioritering av neste handling; ingen kjøpsbeslutning eller full investeringsanalyse. |
| P | Totalpris i NOK inklusive eventuell fellesgjeld, uten kjøpsomkostninger. |
| L | Årlig brutto leieinntekt i NOK for samme objekt og år som øvrig finansgrunnlag. |
| D | Årlige eierbetalte driftskostnader i NOK, uten dobbelttelling og uten renter/avdrag. |
| J | Årlig gjeldsbetjening i NOK: renter og avdrag inklusive eventuell fellesgjeld. |
| Ymin | Brukerens minimumskrav til nettoyield, angitt i prosent. |
| Bruttoyield | L/P; prosentvisning multipliserer forholdstallet med 100. |
| NOI | Netto driftsinntekt per år: L−D. |
| Nettoyield | NOI/P; prosentvisning multipliserer forholdstallet med 100. |
| Kontantstrøm før skatt | NOI−J, i NOK per år. |
| Tilstandsrapport | Den ene støttede tekstbaserte PDF-en på høyst 30 sider. |
| PDF-side | Sidens posisjon i filen, telt fra 1; ikke nødvendigvis trykt sidetall. |
| Rapportfunn | Et eksplisitt TG2/TG3-forhold med grad, beskrivelse og kontrollerbar rapportkilde. Gradene gjengis fra rapporten; appen foretar ingen ny teknisk klassifisering. |
| Opprinnelig KI-funn / KI-uttrekk | Opplysninger KI returnerte fra analysen, før brukerens korrigering eller avvisning. Kan være usikre eller feil og er ikke automatisk bekreftet. |
| Funnliste | Gjeldende liste over uttrekk og brukerhåndtering; aktive funn er ikke avvist. Opprinnelig uttrekk og endringer holdes atskilt. |
| Brukerkorrigert / brukeravvist | Brukerens retting mot originalrapport eller eksplisitte avvisning av feilaktig KI-funn. Ingen ny faglig vurdering eller teknisk utbedring. |
| Brukerbekreftet | Brukeren har kontrollert og bekreftet gjeldende verdier eller funnliste. Registrering og fullført KI-kall er ikke alene bekreftelse. |
| Alvorlig TG3 som krever avklaring | Et TG3-funn som fortsatt skaper vesentlig usikkerhet for forsvarlig førstevurdering etter briefens regler. Avklaringsstatus behandles etter FR-5; KI setter ingen ny tilstandsgrad. |
| Avklart / Uavklart | Brukerens status per alvorlig TG3-funn. Avklart krever begrunnelse og konkret grunnlag; ukjent/ugyldig status behandles som Uavklart. Avklart er ikke nødvendigvis utbedret. |
| Kritisk grunnlag | Gyldige og bekreftede P/L/D/J/Ymin med konsistente perioder, gyldig fullført rapportanalyse, kontrollerbare kilder, bekreftet funnliste og tilstrekkelig TG3-avklaringsstatus. |
| Delberegning | Et nøkkeltall med eget gyldig inputgrunnlag mens samlet kritisk grunnlag er utilstrekkelig. Gir ikke konklusiv screening. |
| Dokumentfeil / analysefeil | Henholdsvis ustøttet, manglende eller uleselig dokumentgrunnlag, og avbrutt eller feilet KI-analyse. Gir ikke vellykket tom liste. |
| Anbefaling | Nøyaktig ett av Innhent mer informasjon, Forkast eller Gå videre, bestemt av faste prioriterte regler i vanlig kode. |
| Demo / live KI | Henholdsvis lokal flyt med lagret og tydelig merket KI-uttrekk, og valgfri ny rapportanalyse med egen lokal nøkkel. |

## Brukerreise

### UJ-1: Mads førstevurderer ett boligutleieobjekt

**Status:** Bekreftet av Mads i PRD-samtalen. Brukes som grunnlag for funksjonelle krav.

**Person og kontekst:** Mads er en privat eiendomsinvestor som allerede har funnet ett konkret boligutleieobjekt i Norge. Han vil avgjøre om han skal forkaste objektet, innhente mer informasjon eller bruke mer tid på en grundigere vurdering.

**Start:** Mads åpner desktop-webappen med kjøpesum, forventet årlig leieinntekt, eierbetalte driftskostnader, finansieringsforutsetninger, minimumskrav til nettoyield og tilstandsrapporten tilgjengelig. Autentisering eller varig lagring er ikke besluttet gjennom denne brukerreisen.

**Forløp:**

1. Mads registrerer nøkkeltall manuelt og laster opp tilstandsrapporten. Han kontrollerer og bekrefter tallene før rapportanalysen fortsetter. De låste finansdefinisjonene gjelder: P er totalpris inklusive eventuell fellesgjeld, L er årlig bruttoleie, D er årlige eierbetalte driftskostnader, J er årlige renter og avdrag og Ymin er minimumskrav til nettoyield. Finansieringsforutsetninger er grunnlag for J; reisen innfører ingen automatisk låneberegning.
2. Appen analyserer rapporten og viser eksplisitte TG2/TG3-funn med kort beskrivelse, dokumentnavn og PDF-side telt fra 1. Mads kontrollerer viktige eller usikre funn mot originalrapporten. I tråd med briefen kan han korrigere og bekrefte funnlisten; avklaringsstatus og begrunnelse for relevante alvorlige TG3-funn inngår i grunnlaget. Ukjent status regnes som uavklart.
3. Appen beregner bruttoyield, NOI, nettoyield og kontantstrøm før skatt fra det gyldige tallgrunnlaget med vanlig kode. Mads ser inputverdiene bak beregningene. Manglende verdier erstattes ikke med oppdiktede tall eller skjulte standardverdier; beregninger som avhenger av dem vises ikke som komplette.
4. Appen viser én anbefaling: **Forkast**, **Innhent mer informasjon** eller **Gå videre**. Mads kan se økonomiske nøkkeltall og inputgrunnlag, alle aktive TG2/TG3-funn med kilde, manglende eller motstridende informasjon og reglene som utløste anbefalingen. Den låste regelprioriteten gjelder også når flere forhold forekommer samtidig.

**Verdi levert:** Mads forstår både anbefalingen og grunnlaget for den, og kan kontrollere resultatet mot egne tall og originalrapporten.

**Avslutning:** Ved **Gå videre** bruker Mads mer tid på en grundigere vurdering. Ved **Innhent mer informasjon** vet han hvilke mangler, konflikter eller uavklarte forhold som må undersøkes. Ved **Forkast** ser han hvilket økonomisk krav som ikke ble oppfylt. Mads tar selv investeringsbeslutningen.

**Feil og ufullstendig grunnlag:** Manglende eller motstridende kritisk informasjon, uleselig eller ufullført rapportanalyse, ubekreftet funnliste eller uavklart alvorlig TG3 gir **Innhent mer informasjon**, også dersom økonomiske krav samtidig ikke er oppfylt. En avbrutt analyse fremstilles ikke som fullført.

**Sporbarhet:** Brukerbeskrivelse i den veiledede PRD-samtalen; briefens «Med i v1», «Finansdefinisjoner for v1» og «Kritisk informasjon og anbefalingsregler»; addendumets kontroll- og bruksflateføringer. Steg 1 realiseres av FR-1–FR-4 og FR-15; steg 2 av FR-5–FR-11; steg 3 av FR-12–FR-15; steg 4 av FR-16–FR-18. NFR-1–NFR-5 støtter kontroll, forståelse, kjørbarhet og evaluering av samme flyt.

## Funksjoner og funksjonelle krav

Krav-ID-er beholdes ved senere omorganisering. FR-5–FR-18 er eksplisitt godkjent av Mads. FR-1–FR-4 konkretiserer låste finansdefinisjoner og bekreftet UJ-1; de innfører ikke nye produktbeslutninger.

### Registrering og kontroll av tallgrunnlag

Mads registrerer og kontrollerer tallgrunnlaget for ett objekt før rapportanalysen. Kilde: UJ-1 steg 1; briefens «Finansdefinisjoner for v1», «Kritisk informasjon og anbefalingsregler» og S4; addendumets «Utregnet fasit» og «Regelvarianter med fasit».

#### FR-1: Registrere finansverdier for ett objekt

Brukeren kan registrere P, L, D, J og Ymin manuelt for samme objekt og samme år. Realiserer UJ-1 steg 1.

**Akseptansekriterier:**

- P beskrives som totalpris inklusive eventuell fellesgjeld, uten kjøpsomkostninger. L beskrives som brutto leieinntekt, D som eierbetalte driftskostnader og J som renter og avdrag inklusive eventuell fellesgjeld.
- Beløp oppgis i NOK; Ymin oppgis i prosent. Perioden for L, D og J er tydelig. Registrerte månedlige beløp omregnes til år med faktor 12; P og Ymin annualiseres ikke.
- Brukeren kan se de registrerte verdiene og det årlige grunnlaget som brukes videre. Ingen leievekst, automatisk låneplan eller ekstra fratrekk innføres gjennom omregningen.
- Manglende felt forblir manglende; appen fyller dem ikke med skjulte standardverdier.

#### FR-2: Synliggjøre kilder, forutsetninger og kostnadsinnhold

Brukeren kan kontrollere kilde eller brukerforutsetning for hver beregningsverdi og hvilke kostnader som er inkludert. Realiserer UJ-1 steg 1 og 3; støtter S4.

**Akseptansekriterier:**

- P, L, D, J og Ymin har synlig kilde eller brukerforutsetning. En forventet leieinntekt fremstilles ikke som dokumentert faktisk leie med mindre grunnlaget støtter dette.
- Inkluderte driftskostnadsposter kan skilles fra hverandre slik at en post som allerede inngår i en annen, ikke legges til på nytt.
- Renter og avdrag som inngår i felleskostnader, inngår i J og ikke samtidig i D. Eksempel: 120 000 kr i felleskostnader hvor 20 000 kr er gjeldsbetjening gir et bidrag på 100 000 kr til D og 20 000 kr til J.
- Hvis to kilder gir ulike verdier for samme kritiske felt og konflikten ikke er avklart, vises konflikten. Appen velger ikke automatisk en kilde eller presenterer grunnlaget som tilstrekkelig.

#### FR-3: Validere tall og skille null fra manglende verdi

Appen validerer tallgrunnlaget og viser hvilke felt som er ugyldige eller mangler. Realiserer UJ-1 steg 1 og feilforløpet; støtter S3.

**Akseptansekriterier:**

- P må være større enn 0. L, D, J og Ymin må være større enn eller lik 0. Ikke-numerisk input er ugyldig.
- Blank D, J eller Ymin tolkes ikke som 0. Blank L eller P tolkes heller ikke som en verdi.
- Null krever eksplisitt brukerbekreftelse. J = 0 ved bekreftet kontantkjøp er gyldig; ubekreftet null er utilstrekkelig grunnlag.
- Feil og mangler identifiserer feltet og hva som må korrigeres eller bekreftes. Beregninger som avhenger av ugyldige eller manglende verdier, vises ikke som gyldige resultater.
- Utilstrekkelig tallgrunnlag videreføres som grunnlag for **Innhent mer informasjon** i anbefalingsreglene; det gir ikke **Forkast** eller **Gå videre**.

#### FR-4: Kontrollere og bekrefte tallgrunnlaget

Brukeren kan kontrollere og bekrefte registrerte verdier før rapportanalysen fortsetter. Realiserer UJ-1 steg 1.

**Akseptansekriterier:**

- Brukeren får tilgang til verdier, enheter, perioder, omregnet årsgrunnlag og kilde eller brukerforutsetning før bekreftelse.
- Registrering alene regnes ikke som bekreftelse. Ubekreftede verdier markeres som utilstrekkelig informasjon.
- Brukeren kan korrigere feil før bekreftelse; bekreftelsen gjelder de verdiene brukeren faktisk har kontrollert.
- Rapportanalysen fortsetter først etter brukerens kontroll og bekreftelse i den komplette hovedreisen. Ufullstendig tallgrunnlag kan fortsatt gi **Innhent mer informasjon**; dette kravet skal ikke gjøre det umulig å vise mangler.

**Videre konkretisering:** Endring av tall og gjenbruk av rapportuttrekk spesifiseres sammen med beregnings- og resultatkravene. Kravene her bestemmer ikke skjermoppsett, lagringsmekanisme eller teknologistakk.

### Brukerbekreftet avklaring av alvorlige TG3-funn

Avklaring gjelder om et alvorlig TG3-funn fortsatt skaper vesentlig usikkerhet for førstevurderingen. Det opprinnelige rapportfunnet og brukerens avklaring er separate opplysninger. Kilde: UJ-1 steg 2 og 4; briefens «Kritisk informasjon og anbefalingsregler»; addendumets «Kontroll mot dokumenter og KI-feil»; Mads' presisering i PRD-samtalen. Støtter S3 og S4.

#### FR-5: Registrere og anvende brukerbekreftet TG3-avklaring

**Status:** Godkjent av Mads i PRD-samtalen.

Brukeren kan markere et alvorlig TG3-funn som **Avklart** for førstevurderingen ved å velge status, oppgi en kort begrunnelse og beskrive det konkrete avklaringsgrunnlaget. Systemet bruker en gyldig avklaring i screeningreglene uten å verifisere den eksterne informasjonen. Realiserer UJ-1 steg 2 og 4.

**Akseptansekriterier:**

1. Avklaringen registreres per alvorlig TG3-funn. Gyldig **Avklart** krever alle tre: eksplisitt statusvalg **Avklart**, en ikke-tom begrunnelse og en ikke-tom beskrivelse av hva avklaringen bygger på. Tekst med bare mellomrom regnes som tom.
2. Begrunnelsen beskriver hvorfor brukeren vurderer usikkerheten som tilstrekkelig avklart for førstevurderingen. Grunnlaget kan være en fagpersons vurdering, en opplysning fra selger eller annen konkret dokumentasjon. Det registreres som brukeroppgitt tekst; ingen ny dokumentopplasting eller automatisk analyse inngår i kravet.
3. Hvis brukeren velger **Avklart** uten begrunnelse eller avklaringsgrunnlag, viser appen hvilke opplysninger som mangler. Funnet regnes ikke som gyldig avklart i screeningreglene.
4. Status **Uavklart**, ukjent eller manglende status og ugyldig **Avklart** behandles som uavklart. Ett slikt alvorlig TG3-funn gir **Innhent mer informasjon**, også når økonomien ellers oppfyller kravene eller samtidig tilsier forkastelse. Resultatet identifiserer funnet og det gjenstående avklaringsbehovet.
5. Resultatet viser status, begrunnelse og avklaringsgrunnlag sammen med det opprinnelige TG3-funnets beskrivelse, dokumentnavn og PDF-side. **Avklart** merkes som **brukerbekreftet avklaring for førstevurdering**; opplysningene fremstilles ikke som KI-fakta eller som verifisert av systemet.
6. Avklaringen fjerner ikke TG3-graden eller rapportfunnet. Appen forklarer at **Avklart** betyr tilstrekkelig avklart for førstevurderingen og ikke nødvendigvis utbedret eller teknisk godkjent.
7. Når alle relevante alvorlige TG3-funn har gyldig avklaring, hindrer de ikke lenger screening på grunn av uavklart TG3. Øvrig kritisk grunnlag må fortsatt være tilstrekkelig. Den økonomiske regelen avgjør deretter **Forkast** eller **Gå videre**; **Avklart** gir ikke automatisk **Gå videre**.
8. Endres status tilbake til **Uavklart**, eller gjøres nødvendig begrunnelse eller avklaringsgrunnlag tomt, skal anbefalingen bygge på det nye grunnlaget. En tidligere anbefaling vises ikke som gjeldende anbefaling for den endrede avklaringen.

**Verifikasjon:** Testeksempler for FR-5 er bevart i [PRD-addendum](addendum.md).

Elektrikerkontrollen er Mads' illustrasjon av konkret avklaringsgrunnlag, ikke et obligatorisk krav om fagkontroll for alle TG3-funn. V1 krever ikke vedlegg, ekstern verifisering, reparasjonsestimat, teknisk godkjenning eller analyse av andre dokumenttyper for å registrere avklaringen.

### Analyse av tilstandsrapport og presentasjon av rapportfunn

**Status:** FR-6–FR-11 godkjent av Mads med presiseringene nedenfor innarbeidet: alle eksplisitte TG2/TG3 skal trekkes ut uten relevansfiltrering, og dokument-/analysefeil skal aldri gi falskt komplett teknisk grunnlag.

Brukeren analyserer én tilstandsrapport og kontrollerer KI-uttrekket før rapportfunn brukes i screeningen. KI trekker ut rapportens eksplisitte vurderinger; vanlig kode håndterer beregninger og anbefalingsregler. Kilde: UJ-1 steg 2; briefens «Med i v1», «Kritisk informasjon og anbefalingsregler» og «Troverdighet og målbar suksess»; addendumets «Kontroll mot dokumenter og KI-feil» og «Kjørbarhet, kostnader og repo»; Mads' bestilling av denne kravgruppen. Støtter S2, S3 og S4.

#### FR-6: Analysere én støttet tilstandsrapport

Brukeren kan laste opp én tekstbasert PDF-tilstandsrapport på høyst 30 sider for det aktuelle objektet og eksplisitt starte KI-analysen. Realiserer UJ-1 steg 2.

**Akseptansekriterier:**

1. En analyse gjelder én rapport. Flere rapporter sammenstilles ikke; appen viser hvilken rapport som er det gjeldende grunnlaget.
2. En tekstbasert tilstandsrapport på 30 sider er innenfor grensen; en på 31 sider avvises med tydelig dokumentfeil. Andre filformater og rapporter uten lesbart tekstlag eller som krever OCR, gir dokumentfeil og analyseres ikke som støttet input. Feilen forklarer hvilken v1-avgrensning dokumentet ikke oppfyller. Manglende eller uleselig tekst håndteres også etter FR-9.
3. Ny rapport krever ny analyse. Funn, brukerbekreftelser og TG3-avklaringer fra en tidligere rapport fremstilles ikke som gjeldende grunnlag for den nye rapporten.
4. I live-modus gjøres ett KI-analysekall per ny rapport ved eksplisitt analysestart, uten automatiske omkjøringssløyfer. Uendret rapport gjenbruker det eksisterende uttrekket; endringer i finansverdier utløser ikke et nytt KI-kall.
5. Demomodus bruker rapportens lagrede KI-uttrekk og merkes tydelig som lagret analyse. Brukeren kan gjennomføre kontrollen uten nettverk eller API-nøkkel. Demoresultater fremstilles ikke som en ny live-analyse.

#### FR-7: Trekke ut alle eksplisitte TG2- og TG3-funn

KI skal trekke ut alle funn som den støttede tilstandsrapporten uttrykkelig har vurdert til TG2 eller TG3. KI foretar ikke en egen relevansutvelgelse. Realiserer UJ-1 steg 2; støtter S2.

**Akseptansekriterier:**

1. Hvert rapportfunn viser rapportens tilstandsgrad, en kort beskrivelse, dokumentnavn og PDF-side. Beskrivelsen gjengir forholdet uten å tilføye udokumenterte konsekvenser eller vurderinger.
2. Alle eksplisitt angitte TG2- og TG3-funn omfattes av uttrekksoppgaven, også funn som KI måtte vurdere som lite relevante for investoren. KI velger ikke bort slike funn, setter ikke nye tilstandsgrader og foretar ikke ny teknisk klassifisering. Et forhold uten eksplisitt TG2/TG3 i rapporten presenteres ikke som et dokumentert TG2/TG3-funn.
3. Reparasjonskostnader, juridisk analyse, markedsanalyse og analyse av andre dokumenttyper inngår ikke i uttrekket. Rapportanalysen fyller ikke automatisk inn eller endrer finansverdier.
4. Fasit lages fra alle eksplisitte TG2/TG3 i evalueringsdokumentene, uten relevansfiltrering. Alle kjente TG3 i hvert dokument kontrolleres enkeltvis mot uttrekket med grad, beskrivelse og korrekt PDF-side. I det kontrollerte evalueringsutvalget skal alle fasitmerkede TG3 og minst 90 % av TG2 identifiseres med riktig PDF-side, uten oppdiktede TG2/TG3-funn, i samsvar med låst S2. S2s minimum på 90 % er en evalueringsterskel; det gir ikke KI tillatelse til å velge bort TG2 fra uttrekksoppgaven. Usikre kandidater uten dokumentert støtte teller ikke som riktige funn; manuelle rettinger teller ikke som riktige opprinnelige KI-funn.
5. Evalueringen dokumenterer per rapport antall fasitfunn, riktige funn, oversette funn, feil sidetall og oppdiktede funn. Et oversett eksplisitt funn dokumenteres som uttrekksfeil, ikke som et relevansvalg. Live KI-uttrekk evalueres separat fra lagrede demosvar og fra finans-/regeltester. Målet gjelder testutvalget, ikke generell treffsikkerhet.

#### FR-8: Vise kilde og gjøre originalrapporten tilgjengelig for kontroll

Brukeren kan forstå hvor et funn kommer fra og kontrollere det mot den opplastede originalrapporten. Realiserer UJ-1 steg 2 og 4; støtter S4.

**Akseptansekriterier:**

1. Et funn med kontrollerbar rapportkilde merkes som **KI-uttrekk fra rapport**, med dokumentnavn og PDF-side. Denne merkingen betyr ikke at brukeren har bekreftet funnet.
2. PDF-side er sidens posisjon i filen, med første side som 1. Hvis rapporten har avvikende trykte sidetall, erstatter disse ikke PDF-siden; de kan vises i tillegg med tydelig forskjell.
3. Appen gir tilgang til originalrapporten, for eksempel ved åpning eller nedlasting, mens brukeren kontrollerer funnene. Dokumentnavn og PDF-side er synlige slik at brukeren kan finne angitt side. Innebygd PDF-leser eller automatisk navigering til siden er ikke påkrevd.
4. Opplysninger uten kontrollerbar støtte i rapporten presenteres ikke som dokumentert rapportfaktum. Manglende kilde, side utenfor dokumentets sideantall eller kjent motstrid mellom funn og kilde vises som en mangel eller et usikkert KI-uttrekk etter FR-9.
5. Kildeopplysningene beholdes når funnet senere vises i beslutningsgrunnlaget. En brukerforutsetning eller TG3-avklaring etter FR-5 merkes separat fra rapportfunnet.

#### FR-9: Synliggjøre usikkerhet og ufullstendig analyse

Appen viser usikre KI-uttrekk og mangler i rapportanalysen uten å gjette eller fremstille delvis analyse som fullført. Realiserer UJ-1 steg 2 og feilforløpet; støtter S3.

**Akseptansekriterier:**

1. Usikkerhet knyttes til det aktuelle funnet eller den aktuelle siden, med synlig årsak når denne er kjent, eksempelvis uleselig tekst, uklar tilstandsgrad, manglende kilde eller motstrid med originalen. Ukjent årsak fremstilles ikke som en kjent forklaring.
2. KI gjetter ikke grad, beskrivelse eller sidetall for å fylle hull. Et usikkert uttrekk holdes tydelig atskilt fra kontrollerbare rapportfunn og regnes ikke som bekreftet før brukeren har håndtert det etter FR-10 og FR-11.
3. Manglende rapport, ustøttet filformat, overskredet sidegrense eller manglende/uleselig tekstlag gir tydelig **dokumentfeil**. Avbrutt eller feilet KI-analyse gir tydelig **analysefeil**. Begge typer feil angir kjent årsak og at teknisk grunnlag er ufullstendig. Eventuelle delresultater merkes som delresultater.
4. Dokumentfeil, analysefeil og annen ufullstendig rapportanalyse gir **Innhent mer informasjon**. Feilen eller mangelen vises separat fra anbefalingen. Systemet fortsetter ikke økonomisk screening som om teknisk grunnlag var komplett; bare økonomiske delberegninger med gyldig grunnlag kan vises. Korrigering, avvisning eller listebekreftelse gjør ikke en dokument-/analysefeil til fullført analyse.
5. Tomt eller manglende KI-uttrekk fremstilles ikke automatisk som «ingen TG2/TG3». Fravær av slike funn kan først brukes som tilstrekkelig rapportgrunnlag etter fullført analyse og brukerens kontroll og bekreftelse av funnlisten.
6. Et KI-generert konfidensprosenttall kan ikke alene oppheve usikkerhet, kildekonflikt eller behov for brukerbekreftelse. Usikre kritiske funn hindrer tilstrekkelig screeninggrunnlag så lenge de er uløst.
7. En dokument- eller analysefeil presenteres aldri som en vellykket analyse med tom funnliste. Brukeren skal kunne skille mellom «analyse feilet / dokument kan ikke analyseres» og «analyse fullført, ingen TG2/TG3 funnet». Det siste krever fullført analyse uten slike feil og brukerbekreftelse før grunnlaget regnes som tilstrekkelig.

#### FR-10: Korrigere eller avvise KI-funn med bevart opprinnelse

Brukeren kan korrigere eller avvise et KI-funn før rapportgrunnlaget brukes som bekreftet grunnlag i screeningen. Realiserer UJ-1 steg 2; støtter S3 og S4.

**Akseptansekriterier:**

1. Brukeren kan korrigere tilstandsgrad, beskrivelse og PDF-side slik at de samsvarer med originalrapporten. Korrigeringen har dokumentnavn og PDF-side som kilde og merkes som **brukerkorrigert**. Brukeren setter ikke en ny faglig tilstandsgrad gjennom denne funksjonen.
2. Opprinnelig KI-grad, beskrivelse og kildehenvisning beholdes tilgjengelig sammen med brukerens gjeldende korrigering. Brukerendringen overskriver ikke den synlige opprinnelsen eller fremstilles som KI-uttrekkets opprinnelige innhold.
3. Brukeren kan eksplisitt avvise et feilaktig KI-funn. Funnet merkes som **brukeravvist**, opprinnelig uttrekk beholdes tilgjengelig, og funnet inngår ikke som et aktivt bekreftet rapportfunn i screeningen.
4. Brukeravvisning er ikke det samme som å avklare en faktisk teknisk mangel. Avklaringsstatus for et reelt alvorlig TG3-funn behandles etter FR-5; avvisning av et KI-uttrekk merkes ikke automatisk som en slik avklaring.
5. Motstrid mellom KI-uttrekk og originalrapport er uløst frem til brukeren har korrigert eller avvist det feilaktige uttrekket og bekreftet den gjeldende funnlisten. En korrigering uten kontrollerbar rapportkilde kan ikke behandles som dokumentert rapportfaktum.
6. Brukerens korrigeringer og avvisninger utløser ikke ny KI-analyse. Screeningen skal bruke den gjeldende brukerbekreftede listen, med opprinnelige KI-funn og brukerendringer tydelig atskilt.

#### FR-11: Bekrefte gjeldende rapportgrunnlag før screening

Brukeren bekrefter den kontrollerte funnlisten før den kan inngå som tilstrekkelig rapportgrunnlag for screeningen. Realiserer UJ-1 steg 2 og 4; støtter S3.

**Akseptansekriterier:**

1. Fullført KI-analyse er ikke automatisk brukerbekreftelse. Appen viser om listen er ubekreftet eller brukerbekreftet og gjør korrigering og avvisning tilgjengelig før bekreftelse.
2. Bekreftelsen gjelder den gjeldende listen med brukerens korrigeringer og avvisninger. Brukeren kan fortsatt se opprinnelige KI-funn og hvilke aktive funn som er bekreftet uendret eller korrigert.
3. Endringer i funnlisten etter bekreftelse krever ny bekreftelse av den endrede listen. En tidligere anbefaling fremstilles ikke som gjeldende for et endret, ubekreftet rapportgrunnlag.
4. Ubekreftet funnliste, uløste kritiske usikkerheter eller ufullført analyse gir **Innhent mer informasjon**. Gyldige økonomiske delberegninger kan vises; rapportfunnene presenteres ikke som et komplett bekreftet screeninggrunnlag.
5. Bekreftelse av funnlisten avklarer ikke automatisk alvorlige TG3-funn. FR-5 gjelder fortsatt, og både bekreftet funnliste og tilstrekkelig TG3-avklaringsstatus kreves før økonomiske regler kan gi **Forkast** eller **Gå videre**.

**Verifikasjon:** Rapporttestene RT-1–RT-19 er bevart i [PRD-addendum](addendum.md).

**Avgrensning:** Kravgruppen innfører ingen ekstra dokumenttyper, OCR, reparasjonsestimater, markedsanalyse, juridisk analyse, automatisk teknisk godkjenning eller samarbeidende KI-agenter. Brukerkorrigering av uttrekk og brukerbekreftet TG3-avklaring er to ulike handlinger. Skjermoppsett, modellvalg og mekanisme for tilgang til originalrapporten avklares i senere UX-/arkitekturarbeid innenfor disse kravene.

### Deterministiske beregninger og synlig beregningsgrunnlag

**Status:** FR-12–FR-15 godkjent av Mads med presiseringer om konsistente årsperioder, entydige uavrundede terskler og informasjonsmanglers prioritet over delberegninger.

Appen beregner fire økonomiske nøkkeltall i vanlig kode fra det kontrollerte tallgrunnlaget. Rapportfunn påvirker grunnlagets tilstrekkelighet og anbefalingen, men endrer ikke finansformlene. Kilde: UJ-1 steg 3; briefens «Finansdefinisjoner for v1», «Kritisk informasjon og anbefalingsregler» og S1/S3/S4; addendumets «Utregnet fasit», «Regelvarianter med fasit» og «Kjørbarhet, kostnader og repo». Anbefalingsreglene og det samlede beslutningsgrunnlaget beskrives i FR-16–FR-18.

#### FR-12: Beregne de fire låste økonomiske nøkkeltallene

Appen beregner bruttoyield, NOI, nettoyield og kontantstrøm før skatt deterministisk fra gyldige, bekreftede finansverdier. Realiserer UJ-1 steg 3; støtter S1.

**Akseptansekriterier:**

1. Formlene er bruttoyield = L/P, NOI = L−D, nettoyield = (L−D)/P og kontantstrøm før skatt = L−D−J. P, L, D og J følger definisjonene i FR-1. L, D og J skal alle gjelde samme år før formlene anvendes; månedlige verdier omregnes deterministisk til år med faktor 12. Års- og månedsbeløp blandes aldri direkte i formlene.
2. Yield vises i prosent ved å multiplisere forholdstallet med 100. NOI og kontantstrøm før skatt vises i NOK per år. Ymin er brukerens prosentkrav og sammenlignes i samme enhet som nettoyield.
3. Vanlig kode utfører beregningene; KI beregner ikke nøkkeltall og endrer ikke P, L, D, J eller Ymin. Samme finansgrunnlag gir samme økonomiske nøkkeltall uavhengig av live KI, lagret demouttrekk eller brukerens TG3-avklaringsstatus.
4. Formlene inkluderer ingen kjøpsomkostninger i P, separat ledighetsfratrekk, særskilt reparasjonskostnad, skatt eller verdiendring. Renter og avdrag inngår i J, ikke samtidig i D. Ingen automatisk låneplan eller kostnadsestimering innføres.
5. Negative NOI-, yield- eller kontantstrømresultater som følger av gyldige inndata beholdes; de settes ikke til null eller skjules som inputfeil.
6. Alle beregnbare nøkkeltall i de kontrollerte casene skal stemme med uavhengig regneark/manuell fasit innen høyst 1 kr for beløp og 0,01 prosentpoeng for yield, i samsvar med S1. Denne toleransen endrer ikke økonomiske terskler eller regelprioritet.
7. Registrert periode, omregningsfaktor og anvendt årsverdi er synlige. v1 viderefører års- og månedsinput; en annen eller ukjent periode omregnes ikke ved gjetting og brukes ikke som gyldig årsgrunnlag. Kravet innfører ikke støtte for nye periodetyper.

#### FR-13: Vise bare beregninger med gyldig grunnlag

Appen vurderer grunnlaget for hvert nøkkeltall separat og viser hvilke beregninger som ikke kan utføres. Realiserer UJ-1 steg 3 og feilforløpet; støtter S3.

**Akseptansekriterier:**

1. Bruttoyield krever gyldig bekreftet P og L; NOI krever L og D; nettoyield krever P, L og D; kontantstrøm før skatt krever L, D og J. Uløste kildekonflikter eller manglende bekreftelse gjør berørte finansverdier utilstrekkelige etter FR-2–FR-4.
2. Et nøkkeltall med utilstrekkelig grunnlag vises som ikke beregnbart med konkret angivelse av manglende, ugyldig, motstridende eller ubekreftet input. Det vises ikke som null, et estimat eller et gammelt resultat.
3. Manglende L hindrer alle fire nøkkeltall. Manglende J hindrer kontantstrøm, men ikke de tre øvrige dersom deres grunnlag er gyldig og bekreftet. Manglende Ymin hindrer økonomisk screening mot yieldkravet, men ikke beregning av de fire nøkkeltallene.
4. P = 0 gir valideringsfeil og hindrer begge yieldberegningene; ingen divisjon med null utføres. NOI og kontantstrøm kan fortsatt vises som delberegninger hvis deres eget grunnlag er gyldig og bekreftet.
5. Dokument-/analysefeil, ubekreftet funnliste eller uavklart alvorlig TG3 endrer ikke formlene. Beregnbare økonomiske tall kan vises, men presenteres som delgrunnlag; **Innhent mer informasjon** gjelder så lenge kritisk informasjon eller teknisk grunnlag er utilstrekkelig.
6. At noen eller alle nøkkeltall kan beregnes, er ikke bevis for komplett kritisk grunnlag. Hvis nødvendig kritisk informasjon mangler, er ugyldig, motstridende eller ubekreftet, er endelig anbefaling **Innhent mer informasjon**. Delberegninger kan verken gi **Forkast** eller **Gå videre** så lenge denne mangelen består, selv om tilgjengelige økonomiske tall passerer eller bryter en terskel.

#### FR-14: Gjøre beregninger etterprøvbare og bevare presisjon

Brukeren kan kontrollere hvert nøkkeltall mot formelen og de aktuelle inputverdiene. Realiserer UJ-1 steg 3 og 4; støtter S1 og S4.

**Akseptansekriterier:**

1. For hvert beregnbart nøkkeltall er formelen og de anvendte inputverdiene tilgjengelige, inklusive enheter, årsgrunnlag og synlig kilde eller brukerforutsetning etter FR-2. Brukeren kan forstå hvilke verdier resultatet bygger på uten å måtte lese kode.
2. Registrert periode, eventuell omregningsfaktor og omregnet årsverdi er tilgjengelige for kontroll. Alle anvendte L/D/J er årsverdier for samme år. Omregningen skjuler ikke kostnadsinnhold eller dobbelttelling.
3. Avrunding brukes kun i visningen, ikke i mellomregninger, beregningsgrunnlag eller regelavgjørelser. Økonomiske regler bruker uavrundede verdier; Ymin omregnes til samme enhet før sammenligning. S1s toleranser brukes ikke som margin ved avgjørelse av om en terskel er oppfylt.
4. Nettoyield ≥ Ymin oppfyller yieldkravet, inklusive eksakt likhet; nettoyield < Ymin oppfyller ikke kravet. Kontantstrøm før skatt < 0 er negativ; kontantstrøm = 0 er ikke negativ og oppfyller kontantstrømkravet. Dette avgjør bare økonomiske terskler og kan gi konklusiv screening først når øvrig kritisk grunnlag er tilstrekkelig. Nettoyield litt under 7 % er fortsatt under Ymin = 7 % selv om visningen avrunder til 7,00 %.
5. Valgt presisjon i resultatvisningen skal gjøre det mulig å kontrollere S1. Detaljert skjermoppsett og formatering av tall avklares i UX; dette endrer ikke formler eller regelpresisjon.

#### FR-15: Beregne på nytt etter endret finansgrunnlag

Brukeren kan korrigere finansverdier og få nye beregninger fra det gjeldende, bekreftede grunnlaget uten ny analyse av uendret rapport. Realiserer UJ-1 steg 1 og 3; støtter S3 og S4.

**Akseptansekriterier:**

1. Endrede finansverdier må kontrolleres og bekreftes før de brukes som gyldig grunnlag. Tidligere bekreftelse gjelder ikke automatisk endrede verdier. Appen viser hvilke verdier som krever ny kontroll.
2. Ved ny beregning brukes de gjeldende bekreftede verdiene. Tidligere nøkkeltall eller anbefaling fremstilles ikke som gjeldende for det endrede grunnlaget.
3. Endringer i P, L, D eller J oppdaterer de nøkkeltallene som avhenger av verdien. Endring av bare Ymin endrer ikke de fire nøkkeltallene, men krever ny vurdering av anbefalingen mot brukerens krav.
4. Ny beregning eller nytt Ymin utløser ikke KI-kall når rapporten er uendret. Eksisterende rapportuttrekk og kontrollstatus gjenbrukes; rapportens egne mangler og uavklarte TG3-funn oppheves ikke av finansendringer.
5. Brukeren kan også endre finansverdier og beregne på nytt i lokal demomodus uten nettverk eller API-nøkkel. Ingen KI-modell er nødvendig for finans-/regelberegningene.

**Verifikasjon:** Beregningstestene BT-1–BT-18 er bevart i [PRD-addendum](addendum.md).

**Avgrensning:** Kravgruppen viderefører låste finansdefinisjoner og evalueringsgrenser. Ingen DSCR, stresstesting, kapitalbehovsmodell, investeringsscore, låneplan, markedsleie, reparasjonsestimat eller nye finansielle fratrekk innføres.

### Anbefalingsregler og samlet beslutningsgrunnlag

**Status:** FR-16–FR-18 godkjent av Mads med eksplisitt deterministisk regelprioritet, kodebasert anbefaling og regelbegrunnelse, alle utløsende forhold på avgjørende prioriteringsnivå og anbefalingsbundet neste handling.

Appen gir én regelstyrt anbefaling med etterprøvbar begrunnelse og tydelig neste handling. Beregninger og kontrollert rapportgrunnlag samles uten at KI eller appen tar investeringsbeslutningen. Kilde: UJ-1 steg 4 og avslutning; briefens «Kritisk informasjon og anbefalingsregler», S3 og S4; addendumets «Regelvarianter med fasit» og «Bruksflate på briefnivå»; godkjente FR-5–FR-15 og Mads' presisering av delberegninger.

#### FR-16: Bestemme én anbefaling med låst regelprioritet

Vanlig kode bestemmer én av **Innhent mer informasjon**, **Forkast** eller **Gå videre** fra gjeldende kontrollert grunnlag. Realiserer UJ-1 steg 4; støtter S3.

**Akseptansekriterier:**

1. Når screeningen gir et resultat, viser appen nøyaktig én gjeldende anbefaling. Vanlig kode bestemmer både anbefalingen og hvilke regler som er utløst. KI genererer eller endrer ikke anbefalingen, tersklene, regelprioriteten eller begrunnelsen for hvilke regler som ble utløst.
2. Prioritet 1 gir **Innhent mer informasjon** hvis nødvendig kritisk informasjon mangler, er ugyldig, motstridende eller ubekreftet, eller et alvorlig TG3-funn er uavklart. Kritisk grunnlag omfatter P/L/D/J/Ymin med gyldige verdier og konsistente perioder, fullført rapportanalyse med kontrollerbare kilder, brukerbekreftet funnliste og tilstrekkelig TG3-avklaringsstatus etter FR-5. Dokument-/analysefeil og uløste kritiske usikkerheter er utilstrekkelig grunnlag.
3. Først når prioritet 1 ikke gjelder, gir prioritet 2 **Forkast** hvis nettoyield < Ymin eller kontantstrøm før skatt < 0. Ett av vilkårene er nok; begge kan være brutt samtidig.
4. Først når grunnlaget er tilstrekkelig, ingen blokkerende teknisk usikkerhet finnes og prioritet 2 ikke gjelder, gir prioritet 3 **Gå videre**: nettoyield ≥ Ymin og kontantstrøm før skatt ≥ 0. Eksakt likhet med Ymin og kontantstrøm lik 0 oppfyller de økonomiske kravene.
5. Regelvurderingen bruker uavrundede verdier og sammenlignbare enheter etter FR-12–FR-14. Avrundet visning eller S1s beregningstoleranse endrer ikke anbefalingen.
6. Informasjonsmangel har prioritet selv ved svake økonomiske delresultater. TG2 eller TG3 betyr ikke automatisk **Forkast**; uavklart alvorlig TG3 gir prioritet 1, mens gyldig avklart TG3 fortsatt vises og økonomien vurderes etter prioritet 2 og 3.
7. Alle gjeldende utløsende forhold på det avgjørende prioriteringsnivået tas med. Ved prioritet 1 skjules ikke ytterligere kritiske mangler fordi én mangel allerede er funnet. Ved prioritet 2 vises både yieldbrudd og negativ kontantstrøm når begge gjelder. Lavere prioritet overstyrer aldri høyere prioritet.
8. Med samme gjeldende bekreftede input, rapportfunn, kontroll-/avklaringsstatus og samme faste regler gjenskapes nøyaktig samme anbefaling, utløsende regelgrunnlag, regelbegrunnelse og anbefalingsbundne neste handling. Ny generering eller tolkning fra KI inngår ikke i dette. Kravet gjelder gjenskaping fra et gitt rapportuttrekk, ikke deterministisk KI-uttrekk ved en ny analyse.

#### FR-17: Forklare anbefaling, utløste regler og neste handling

Brukeren kan se hvorfor anbefalingen er gitt og hva som må gjøres videre. Realiserer UJ-1 steg 4 og avslutning; støtter S3 og S4.

**Akseptansekriterier:**

1. Vanlig kode bestemmer og presenterer begrunnelsen for hvilke regler som ble utløst, inklusive avgjørende prioritet og alle konkrete utløsende forhold på dette nivået. Både regelbegrunnelse og anbefalingsbundet neste handling gjenskapes fra det gjeldende grunnlaget og faste regler; KI genererer, omskriver eller endrer dem ikke. Tekst fra rapportuttrekk og brukerregistrerte avklaringer beholder tydelig opprinnelse.
2. Ved **Innhent mer informasjon** listes alle kjente utløsende kritiske mangler, konflikter, feil og uavklarte forhold, med berørt felt eller funn og hva brukeren må korrigere, bekrefte, innhente eller avklare. Ukjent informasjon erstattes ikke med gjetninger. Dette er neste handling for anbefalingen, ikke en KI-generert undersøkelsesplan.
3. Ved **Forkast** vises hvilke økonomiske krav som er brutt, med nettoyield og Ymin og/eller kontantstrøm og nullgrensen. Hvis begge krav er brutt, vises begge. En synlig avrunding som skjuler et terskelbrudd forklares med at regelvurderingen bruker uavrundede verdier.
4. Ved **Gå videre** vises at nettoyield og kontantstrøm oppfyller brukerens økonomiske krav, og at teknisk grunnlag er tilstrekkelig for screening. Neste handling er en grundigere vurdering eller befaring; funn og brukerforutsetninger beholdes tilgjengelige for kontroll.
5. Anbefalingen beskrives som førstevurdering. **Gå videre** betyr ikke kjøpsanbefaling eller teknisk godkjenning. Brukeren avgjør selv om objektet undersøkes videre eller forkastes; ingen budgivning, ekstern kommunikasjon eller investeringsbeslutning utføres av appen.

#### FR-18: Presentere et sammenhengende og gjeldende beslutningsgrunnlag

Appen samler anbefaling, begrunnelse, nøkkeltall og rapportgrunnlag slik at brukeren kan etterprøve resultatet. Realiserer UJ-1 steg 4; støtter S4.

**Akseptansekriterier:**

1. Anbefaling og kort regelbegrunnelse vises øverst i resultatet. Brukeren har tilgang til alle beregnbare nøkkeltall med formel og inputgrunnlag etter FR-12–FR-14, og kan se hvilke tall som ikke er beregnbare og hvorfor.
2. Gjeldende rapportgrunnlag viser alle aktive TG2/TG3-funn med tilstandsgrad, beskrivelse, dokumentnavn og PDF-side. Originalrapporten, opprinnelige KI-funn, brukerens korrigeringer og avvisninger er tilgjengelige etter FR-8–FR-11. Brukerbekreftet TG3-avklaring vises separat etter FR-5.
3. Rapportuttrekk, brukerforutsetninger, brukerbekreftelser/korrigeringer, KI-usikkerhet og mangler er tydelig skilt. Dokument-/analysefeil vises som feil også i beslutningsgrunnlaget og forsvinner ikke bak en tom funnliste eller økonomiske tall.
4. Anbefaling, tall og funn gjelder samme aktuelle objekt og gjeldende grunnlag. Endring av finansverdier, funnliste, rapport eller TG3-avklaringsstatus kan ikke gi en visning der gammel anbefaling fremstilles som gyldig for nye verdier. Ny anbefaling bruker nødvendig ny kontroll/bekreftelse etter FR-5, FR-6, FR-11 og FR-15.
5. Appen viser gjeldende steg og om kontroll, bekreftelse eller analyse er ufullført. Økonomiske delberegninger merkes som delgrunnlag når kritisk grunnlag er utilstrekkelig; de fremstilles ikke som en konklusiv screening.
6. Beslutningsgrunnlaget viser ingen investeringsscore eller påstander om markedsverdi, juridisk lovlighet eller samlet investeringskvalitet. Live- og demoflyt følger samme beregnings-/anbefalingsregler; demoens lagrede rapportanalyse merkes fortsatt tydelig.

**Verifikasjon:** Anbefalingstestene AT-1–AT-20 er bevart i [PRD-addendum](addendum.md).

**Avgrensning:** Denne gruppen konkretiserer låst screeninglogikk og resultatpresentasjon. Den innfører ikke lagring av brukerens investeringsbeslutning, saksbehandling, automatisk oppfølging, ekstern kommunikasjon eller nye analyser. Navigasjon og visuelt oppsett utover disse informasjonskravene hører til UX.

## Tverrgående kvalitetskrav

**Status:** NFR-1–NFR-5 og evalueringsopplegget S1–S6 godkjent av Mads som helhet. Målepunktene for S5 er fastsatt; Q-1 er løst.

Kravene konkretiserer produktets kvalitet og leveransens kjørbarhet. Kursveiledningens eksempler brukes ikke som grunnlag for nye funksjoner, brukerroller eller integrasjoner.

### NFR-1: Stabilitet og etterprøvbar regelkjøring

Kilde: briefens kritiske grunnlag og S3/S4, godkjente FR-5–FR-18 og UJ-1s feilforløp; sensorveiledning s. 3–4 om stabilitet, gjentatte handlinger og feilhåndtering.

- Samme gjeldende grunnlag og faste regler gir identiske kodeberegnede nøkkeltall, anbefaling, utløsende regler og regelbegrunnelse. Ingen betalt eller nettverksbasert KI-tjeneste kreves for å gjenskape dette fra et allerede tilgjengelig rapportuttrekk.
- Gjentatte handlinger og retting av feil input gir ikke skjulte standardverdier, doble kostnadsposter eller gamle resultater presentert som gjeldende.
- Dokument-, analyse- og valideringsfeil er synlige, og kjent ufullstendig grunnlag behandles etter prioritet 1. Feiltester kan ikke bestås ved å skjule feil bak tomme funnlister.
- Verifiseres med finans-/regeltester, AT-16/AT-18–AT-20 og manuelle feilforløp. Kravet innfører ikke garantert varig lagring, gjenoppretting etter omstart eller en driftstjeneste med oppetidsavtale.

### NFR-2: Forståelig desktop-flyt og grunnleggende tilgjengelighet

Kilde: briefens desktop-webapp og kontrollflyt, UJ-1s registrering/kontroll/resultat og addendumets «Bruksflate på briefnivå»; sensorveiledning s. 4–5. Dette er konkretisering av kursens grunnleggende UX-forventninger, ikke et krav om en bestemt sertifisering eller tilgjengelighetsstandard.

- Skjemafelt har synlige etiketter og tydelige enheter/perioder; feil peker på berørt felt og forklarer hva brukeren må gjøre.
- Kjerneflytens handlinger kan gjennomføres med tastatur, med synlig fokus. Anbefaling, feil, usikkerhet og bekreftelsesstatus formidles med tekst og ikke bare farge.
- Informasjon har lesbar kontrast. Eventuelle meningsbærende bilder har tekstalternativ. På desktop-flaten er tall, kildehenvisninger og kontroller tilgjengelige uten at innhold skjules av oppsettet.
- Manuell testplan dekker tastaturflyt, feltetiketter, kontrast, feil-/tomtilstander, usikkert funn og forståelse av de tre anbefalingene. Skjermoppsett og relevante desktop-størrelser konkretiseres i UX uten å innføre mobilapp som v1-leveranse.

### NFR-3: Lokal kjørbarhet og kostnadsfri demo

Kilde: briefens S6, UJ-1 gjennomført som lokal demo, addendumets «Kjørbarhet, kostnader og repo» og sensorveiledning s. 5–6.

- Etter installasjon av dokumenterte lokale avhengigheter kan en annen person kjøre hele demoflyten og de dokumenterte lokale finans-/regeltestene fra README, uten gruppens nøkkel, betalt konto eller særskilt egen infrastruktur.
- Selve demoflyten kjører uten nettverk, med fiktivt objekt, støttet rapport, lagret KI-uttrekk og aktive beregninger/anbefalingsregler. Endring av grunnlaget kan demonstrere alle tre anbefalingene, med nødvendige kontroll- og bekreftelsessteg.
- Live KI er valgfritt og skilles tydelig fra demo. Manglende live-nøkkel hindrer ikke lokal demo eller finans-/regeltester.
- README oppgir versjonerte forutsetninger, eksakte installasjons-/oppstartskommandoer, demodata, testkommandoer og valgfri live-konfigurasjon med eksempel uten hemmeligheter. Kjørbarhet verifiseres av en annen person i et rent dokumentert lokalt miljø; det er ikke et løfte om installasjon uten nettverk.

### NFR-4: Hemmeligheter og testdata

Kilde: briefens lokale demo/valgfrie live KI, addendumets personvern- og repoavgrensninger og UJ-1s rapport-/tallgrunnlag; sensorveiledning s. 6–7.

- API-nøkkel for valgfri live KI kommer fra lokal konfigurasjon og ligger ikke i versjonerte filer, demo, testfixtures eller README-eksempler. Appens brukerflater og dokumenterte testutdata viser ikke nøkkelen.
- Fiktive testdata foretrekkes. Private originaldokumenter holdes utenfor Git. Reelle dokumenter publiseres ikke før personopplysninger, publiseringsrett og eventuell anonymisering er vurdert.
- Leveransekontroll omfatter versjonerte filer og historikk for utilsiktede hemmeligheter samt kontroll av hvilke rapporter som inngår i testutvalget. Kravet innfører ikke innlogging, flere brukerroller eller en egen funksjon for personvernadministrasjon.

### NFR-5: Tidsbruk i førstevurderingen

Kilde: briefens S5, UJ-1 steg 2 og Mads' fastsatte målepunkter i PRD-samtalen. Målene er median hovedanalyse ≤ 5 minutter og median menneskelig kontroll ≤ 10 minutter for de kontrollerte evalueringscasene, målt separat og sammenlignet med manuell førstevurdering.

- **Hovedanalyse starter** når brukeren trykker «Start analyse», etter at gyldige nøkkeltall er kontrollert og bekreftet og en støttet tilstandsrapport er lastet opp.
- **Hovedanalyse stopper** når rapportanalysen er ferdig og funnlisten med TG2/TG3, beskrivelser, PDF-sider og eventuell usikkerhet er klar og synlig for brukeren. Tid frem til tilgjengelig visning inngår; kun avsluttet KI-kall er ikke nok hvis listen ennå ikke er synlig.
- Opplasting, registrering av tall og menneskelig kontroll inngår ikke i hovedanalysetiden. Feilet eller avbrutt analyse registreres som feilet analyse, ikke som vellykket analyse med kort behandlingstid.
- **Kontroll starter** når den ferdige funnlisten fra hovedanalysen blir tilgjengelig for brukeren, altså ved samme hendelse som avslutter en vellykket hovedanalyse.
- **Kontroll stopper** når brukeren har kontrollert funnene, gjort eventuelle korrigeringer/avvisninger, håndtert status for alvorlige TG3-funn og bekreftet den gjeldende listen slik at systemet kan gå videre til screening. Håndtert TG3-status betyr ikke nødvendigvis Avklart: et funn kan fortsatt være Uavklart og gi Innhent mer informasjon etter FR-5 og FR-16.
- Registrering før analyse, videre investeringsarbeid etter screening og maskinelle finansberegninger/kodebasert anbefaling etter listebekreftelsen inngår ikke i menneskelig kontrolltid. En ufullført kontroll registreres ikke som vellykket kontroll med kort varighet.
- Målebevis følger protokollen i S5 og viser faktiske start-/stopphendelser. Live-analyse og lagret demo holdes atskilt; lagret uttrekk dokumenterer ikke live-analysetid. Målingen er evalueringsarbeid og innfører ingen egen telemetri- eller rapporteringsfunksjon i appen.
- S5 forbedres ikke ved å hoppe over brukerbekreftelser, kildekontroll eller behandling av usikre funn. Kvalitetskriteriene S1–S4 gjelder samtidig.

## Suksesskriterier og evalueringsbevis

**Status:** S1–S6 og måleopplegget er godkjent av Mads. Dette er akseptansemål og planlagt verifikasjon, ikke oppnådde resultater.

### S1: Beregninger

Alle beregnbare nøkkeltall i casene stemmer med uavhengig regneark/manuell fasit: avvik høyst 1 kr for beløp og 0,01 prosentpoeng for yield. Verifiserer FR-12–FR-15. Manglende grunnlag kontrolleres som manglende beregning, ikke med oppdiktet tallfasit. Uavrundede terskler kontrolleres separat fra beregningstoleransen.

### S2: Dokumentfunn

Alle manuelt fasitmerkede TG3 og minst 90 % av TG2 i testutvalget finnes med riktig PDF-side; ingen oppdiktede TG2/TG3-funn. Verifiserer FR-6–FR-10. Fasit omfatter alle eksplisitte TG2/TG3; hvert kjent TG3 kontrolleres enkeltvis. Rapporter fasitfunn, riktige funn, oversette funn, feil side og oppdiktede funn per rapport. Mål opprinnelig KI-uttrekk før manuelle korrigeringer, og skill live-evaluering fra lagrede demosvar. Testutvalget dokumenterer ikke generell treffsikkerhet.

### S3: Mangler og regler

Alle regelvarianter i brief-addendum gir forventet utfall, inklusive manglende leie, konflikt, uleselig rapport, uavklart TG3 og terskellikhet. Verifiserer FR-3–FR-5, FR-9–FR-17. Finans-/regeltester og dokumenterte feilforløp dekker også brukerens godkjente presiseringer: alle utløsende forhold på avgjørende prioritet og nøyaktig gjenskaping av kodebasert anbefaling/begrunnelse.

### S4: Sporbarhet i resultatet

Viste rapportfunn har kontrollerbart dokument og korrekt PDF-side; beregningsverdier har synlig kilde/brukerforutsetning, uten dobbelttelling. Verifiserer FR-2, FR-5, FR-8–FR-11, FR-14 og FR-18. Manuell kontroll mot fasit omfatter tydelig skille mellom rapportgrunnlag, usikkert KI-uttrekk, opprinnelig KI-feil, brukerendring og TG3-avklaring. Et usikkert eller avvist uttrekk presenteres ikke som dokumentert rapportfaktum.

### S5: Tidsbruk

Median hovedanalyse ≤ 5 minutter (300 sekunder) og median menneskelig kontroll ≤ 10 minutter (600 sekunder) for de kontrollerte evalueringscasene. Verifiserer UJ-1, FR-6–FR-18 og NFR-5. Målepunktene er fastsatt av Mads og Q-1 er løst.

**Verifikasjon:** Måleprotokoll og tidstestene TT-1–TT-9 er bevart i [PRD-addendum](addendum.md).

### S6: Kjørbarhet

En annen person gjennomfører hele demoflyten og kjører de dokumenterte lokale testene etter README uten gruppens nøkkel, betalt konto eller særskilt egen infrastruktur. Verifiserer FR-6, FR-15–FR-18 og NFR-3. Dokumenter miljø, kommandoer, resultat og eventuelle feil/utbedringer. At mock-/demotester består, brukes ikke som bevis for S2s live KI-kvalitet.

### Kontrollmål som motvirker misvisende optimalisering

- **K1 mot S5:** Raskere tidsbruk godtas ikke som gevinst oppnådd ved å skjule kritiske mangler, droppe kontrollsteg eller overse TG3. Kontroller S2, S3 og bekreftelsessteg samtidig.
- **K2 mot S2:** Flere uttrekk er ikke i seg selv bedre. Oppdiktede funn og feil sidetall registreres sammen med treff; ingen oppdiktede funn tillates i S2-utvalget.
- **K3 mot antall Gå videre:** Andelen Gå videre er ikke et suksessmål. Alle tre anbefalinger skal være riktige etter fasit; informasjonsmanglers prioritet beholdes.

Disse kontrollmålene viderefører kvaliteten i de låste kriteriene og innfører ingen nye numeriske terskler.

### Testgrunnlag og prosessbevis

- Minst F1–F4 med forhåndsdefinert finans-, dokument- og anbefalingsfasit samt grense-/feilvariantene i brief-addendum. Rapportinnhold og fasit fastsettes før KI-evaluering; fasit tilpasses ikke modellens svar i etterkant.
- Finans-/regeltester kjøres med kontrollerte strukturerte input og uttrekk. Live KI evalueres separat mot rapportfasit. Manuelle tester brukes for kildekontroll, UX og kjørbarhet der automatisering ikke er hensiktsmessig.
- Planlagt plassering for fixtures er `tests/fixtures/property-cases/`; evalueringsresultater og manuell testdokumentasjon legges under `.docs/implementation-artifacts/` ved implementering. Disse leveransene opprettes ikke som del av denne kravavklaringen.
- Viktige prompts, produktpresiseringer, KI-forslag som korrigeres og gjennomførte kontroller lagres som faktiske prosesspor. UX, arkitektur og stories refererer stabile FR-/NFR-ID-er og S1–S6; kode og tester knyttes videre til relevante krav. Kursens forventning om sporbarhet begrunner ikke en egen revisjonsfunksjon i appen.
- Før betalte live-tester må modell, prisgrunnlag, estimert kostnad for en rapport på 30 sider og prosjektbudsjett avklares etter brief-addendum. Beløp og modellvalg er gjennomføringsavklaringer; ingen leverandør eller nytt kostnadstak fastsettes i denne PRD-delen.

## Avklaringsstatus og videre gjennomføringsarbeid

Ingen åpne produktspørsmål er dokumentert som blokkerende for neste BMAD-fase. Q-1 nedenfor er løst. Gjenstående gjennomføringsvalg behandles av Mads sammen med ansvarlig for den neste fasen:

- UX: skjermoppsett, navigasjon, desktop-størrelser, lesbar kontrast og mekanisme for kontroll mot originalrapporten, innenfor NFR-2 og FR-8.
- Arkitektur: teknologistakk og lokal håndtering av rapport/uttrekk, innenfor gjeldende v1 og kjørbarhetskrav. Dette er ikke tillatelse til nye brukerfunksjoner eller dokumenttyper.
- Før betalte live-tester: modell, oppdatert prisgrunnlag, estimert kostnad per støttet rapport og prosjektbudsjett avklares av Mads.
- Implementering/evaluering: utarbeide PDF-fixtures og uavhengig fasit, implementere og kjøre produkttester, gjennomføre manuelle tester og S5-målinger og dokumentere faktisk S6-kjørbarhet. Ingen av disse resultatene er påstått oppnådd.

### Antakelsesstatus

Ingen uavklarte produktantakelser er brukt til å endre scope, formler, terskler eller kjerneflyt. Målgruppebeskrivelsen kommer fra briefen; kontrollreisen og senere presiseringer kommer fra Mads. Gjenstående gjennomføringsvalg ovenfor er ikke låst som skjulte tekniske krav.

### Q-1: Operasjonelle målepunkter for S5 — løst

**Eier:** Mads. **Status:** Løst gjennom Mads' definisjoner i PRD-samtalen; innarbeidet i NFR-5 og S5.

Hovedanalyse måles fra Start analyse med gyldig bekreftet tallgrunnlag og opplastet støttet rapport til ferdig funnliste er synlig. Menneskelig kontroll måles fra synlig ferdig liste til gjennomført kontroll, håndtert TG3-status og bekreftet gjeldende liste. Feil og ufullført kontroll registreres separat. Opplasting/registrering før start, etterfølgende maskinberegninger og videre investeringsarbeid er utenfor målingene. Medianmålene på 5 og 10 minutter videreføres.
