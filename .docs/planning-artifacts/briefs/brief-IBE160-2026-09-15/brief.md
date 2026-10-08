---
title: "Product Brief: Property Acquisition Agent"
status: complete
created: 2026-09-15
updated: 2026-10-08
---

# Product Brief: Property Acquisition Agent

## Sammendrag og visjon

Property Acquisition Agent skal hjelpe en eiendomsinvestor i Norge å prioritere hvilke utleieobjekter som fortjener videre undersøkelse. Den langsiktige visjonen er å sammenstille dokumenter, økonomi, marked og risiko til et sporbart beslutningsgrunnlag for investeringer med løpende avkastning og forbedringspotensial.

**v1 er en desktop-webapp for førstevurdering av ett brukerregistrert boligutleieobjekt om gangen:** investoren bekrefter nøkkeltall, KI trekker ut TG2/TG3-avvik fra én tilstandsrapport, og vanlig kode beregner bruttoyield, NOI, nettoyield og kontantstrøm. Faste regler gir **Forkast**, **Innhent mer informasjon** eller **Gå videre**. Investoren avgjør neste handling; appen gir ingen kjøpsbeslutning og sender ikke bud.

## Problemet og primærbrukeren

Primærbrukeren er produkteieren som privat eiendomsinvestor, med kjennskap til leieinntekter, driftskostnader, lån og avkastningskrav, men uten å være bygningssakkyndig. Brukeren vurderer særlig utleieboliger og mindre bygårder og trenger å kontrollere inntekt, yield, kontantstrøm og alvorlige tekniske funn før mer tid brukes på befaring eller rådgivere.

I dag må investoren lese annonser, salgsoppgaver og tilstandsrapporter og sammenstille tall manuelt. En rapport kan være rundt 30 sider. Brukerens anslag er 30–60 minutter til en førstevurdering, mer for kompliserte objekter. v1 skal redusere sammenstillingsarbeidet og gjøre kontroll enklere; den erstatter ikke faglig tilstandsvurdering eller full due diligence.

## What Makes This Different

Alternativene er manuell dokumentlesing med regneark, generelle chatboter og bistand fra rådgivere. Regneark gir kontrollerbare beregninger, men knytter ikke automatisk tekniske funn til dokumentenes sider. Generelle chatboter krever at brukeren selv sikrer faste formler, kildehenvisninger og håndtering av mangler. Rådgivere er fortsatt aktuelle for grundigere vurdering.

v1 samler kildebelagte TG2/TG3-funn, bekreftede inndata, etterprøvbare beregninger og faste anbefalingsregler i samme flyt. Verdiforslaget er sporbarhet og konsekvent behandling av usikkerhet. Bedre tidsbruk og kvalitet er hypoteser som skal evalueres, ikke dokumenterte konkurransefortrinn.

## Med i v1

1. **Registrer og bekreft:** ett objekt, manuelle nøkkeltall og én tekstbasert PDF-tilstandsrapport på inntil 30 sider. Investoren oppgir kilder eller merker tall som egne antakelser. Ingen uthenting fra annonselenker.
2. **Analyser rapport:** én KI-analyse identifiserer relevante, eksplisitte TG2/TG3-funn i tilstandsrapporten og lister dem med beskrivelse, dokumentnavn og PDF-sidetall. KI estimerer ikke reparasjonskostnader og utfører ikke markedsanalyse, juridisk analyse eller automatisert analyse av hele salgsoppgaven. Investoren kan kontrollere og korrigere funn. Uleselige sider, avbrutt analyse og usikre funn vises som mangler; delvis analyse presenteres aldri som fullført.
3. **Beregn og anbefal:** vanlig kode validerer bekreftede tall, beregner nøkkeltall og anvender reglene nedenfor. Et kort beslutningsgrunnlag viser anbefaling, regelbegrunnelse, funn, kilder, forutsetninger, mangler og neste handling.

Dette er en enkel sekvensiell analysepipeline, uten samarbeidende KI-agenter eller agentrammeverk. KI brukes til rapportuttrekk; beregninger og anbefaling bestemmes av kode. Brukeren kan godkjenne neste undersøkelse, velge manuell vurdering eller forkaste objektet. Endringer i inndata krever ny beregning.

## Finansdefinisjoner for v1

Alle beløp er NOK og gjelder samme objekt og samme år. Inndata er kjøpesum **P** (totalpris inklusive eventuell fellesgjeld, uten kjøpsomkostninger), årlig brutto leieinntekt **L**, årlige eierbetalte driftskostnader **D**, årlig gjeldsbetjening **J** og brukerens minimumskrav til nettoyield **Ymin**. Gjeldsbetjening er renter og avdrag, inklusive eventuell fellesgjeld.

| Nøkkeltall | Definisjon og formel |
|---|---|
| Bruttoyield | Årlig brutto leieinntekt / kjøpesum: **L / P**. |
| NOI (net operating income / netto driftsinntekt) | Årlig brutto leieinntekt − årlige eierbetalte driftskostnader: **L − D**. |
| Nettoyield | NOI / kjøpesum: **NOI / P**. |
| Kontantstrøm før skatt | NOI − årlig gjeldsbetjening: **NOI − J**. |

Yieldformlene gir forholdstall; prosentvisningen multipliserer med 100. Ymin angis i prosent og omregnes til samme enhet før sammenligning. Alle beregninger utføres deterministisk i vanlig kode, ikke av KI.

**D** omfatter eierens felleskostnader, kommunale avgifter, eventuell eiendomsskatt, forsikring, forvaltning og løpende vedlikehold. Inkluderte poster skilles ut slik at samme kostnad bare telles én gang. Renter og avdrag som inngår i felleskostnader føres i **J**, ikke også i **D**. v1 trekker ikke fra et separat ledighetsbeløp eller særskilte reparasjonstiltak i disse formlene, og kjøpsomkostninger inngår ikke i yieldgrunnlaget. Skatt, verdiendring, automatisk låneplan og kostnadsestimering fra KI er utenfor v1. Beregningsfasit og avgrensninger står i [addendum](addendum.md#utregnet-fasit).

## Kritisk informasjon og anbefalingsregler

Kritisk informasjon er **P, L, D, J, Ymin**, en ferdig analysert tilstandsrapport med kontrollerbare sider og investorens bekreftelse av TG2/TG3-listen og eventuelle uavklarte alvorlige TG3-funn. Teknisk grunnlag er tilstrekkelig for screening når rapportanalysen er fullført og bekreftet, og ingen alvorlige TG3-funn fortsatt krever avklaring for forsvarlig førstevurdering. Avklaringsstatus og begrunnelse registreres per slikt funn; ukjent status regnes som uavklart. Dette er ingen teknisk godkjenning.

Ingen verdi fylles med et skjult standardtall. Null må bekreftes eksplisitt, eksempelvis gjeldsbetjening ved kontantkjøp. **P > 0**, øvrige beløp **≥ 0** og **Ymin ≥ 0**. Ugyldige tall, ubekreftede verdier, uløste kildekonflikter eller usikre kritiske funn regnes som utilstrekkelig informasjon. Lav pålitelighet betyr her manglende kontrollerbar kilde, uleselig tekst, uavklart tolkning eller manglende brukerbekreftelse; et KI-generert konfidensprosenttall er ikke nok.

Reglene kjøres i denne rekkefølgen på uavrundede verdier:

| Prioritet | Vilkår | Anbefaling og neste handling |
|---|---|---|
| 1 | Kritisk informasjon mangler, er motstridende eller utilstrekkelig, eller et alvorlig TG3-funn krever videre avklaring før forsvarlig vurdering. | **Innhent mer informasjon.** List konkret hva som må innhentes eller avklares. Vis bare delberegninger som har gyldig grunnlag. |
| 2 | Nødvendig informasjon finnes og teknisk grunnlag er tilstrekkelig, men nettoyield **< Ymin** eller kontantstrøm før skatt **< 0**. | **Forkast.** Vis hvilke av brukerens økonomiske krav som ikke oppfylles. |
| 3 | Nødvendig informasjon finnes, teknisk grunnlag er tilstrekkelig, nettoyield **≥ Ymin** og kontantstrøm før skatt **≥ 0**. | **Gå videre** til grundigere analyse/befaring. Vis fortsatt TG2/TG3 og forutsetninger som må kontrolleres. |

Dette er screeningregler, ikke en investeringsbeslutning. TG2/TG3 betyr ikke automatisk forkastelse. v1 avgjør ikke juridisk lovlighet, markedsverdi eller samlet investeringskvalitet. Ingen investeringsscore beregnes eller vises.

## Troverdighet og målbar suksess

Fakta fra rapporten skal ha dokumentnavn og sidetall. Brukerforutsetninger, mangler og KI-tolkninger merkes separat. Appen skal aldri dikte opp tall, skjule konflikter eller presentere en KI-tolkning som dokumentert fakta.

Evalueringen planlegger **minst fire kontrollerte, fiktive eller anonymiserte testcaser** med forhåndsdefinert fasit for beregninger, dokumentfunn og anbefaling: ett komplett case med Gå videre, ett økonomisk svakt case med Forkast, ett med manglende kritisk informasjon og Innhent mer informasjon, og ett med kjent TG3-funn og korrekt sidetall for kontroll av KI-analysen. Casene er konkretisert i addendum og suppleres med regel- og grensevarianter. Kriteriene er mål for ferdig v1, ikke resultater fra denne revisjonen:

| ID | Bestått når |
|---|---|
| S1 Beregninger | Alle fire nøkkeltall stemmer med uavhengig regneark/manuell fasit i alle caser: avvik høyst 1 kr for beløp og 0,01 prosentpoeng for yield. |
| S2 Dokumentfunn | Alle manuelt fasitmerkede TG3 og minst 90 % av TG2 finnes, med riktig PDF-side; ingen oppdiktede TG2/TG3-funn i testutvalget. |
| S3 Mangler og regler | Alle regelvarianter i addendum gir forventet utfall, også manglende leie, kildekonflikt, uleselig rapport, uavklart TG3 og likhet med tersklene. |
| S4 Sporbarhet | Alle viste TG2/TG3-funn har korrekt dokument og side; alle beregningsverdier har synlig kilde/brukerforutsetning, uten dobbelttelling. |
| S5 Tidsbruk | Median hovedanalyse ≤ 5 minutter og median tid til investorens kontroll ≤ 10 minutter på de komplette casene, målt separat og sammenlignet med manuell førstevurdering. |
| S6 Kjørbarhet | En annen person gjennomfører hele demoflyten og kjører testene lokalt etter README uten gruppens nøkkel, betalt konto eller egen infrastruktur. |

KI-uttrekk evalueres mot fasit separat fra enhetstester av finans- og regellogikk. Resultatene dokumenteres per case; utvalget dokumenterer ikke generell treffsikkerhet.

## Utenfor v1 og senere produktutvikling

Market Agent, automatisk sourcing og annonseuthenting, live markedsdata, rangering, investeringsscore, stresstesting, DSCR, egenkapital-/kapitalbehovsmodell, automatiske vedlikeholdsestimater, salgsoppgaveanalyse, OCR og full juridisk/markedsmessig risikovurdering er utenfor v1. Mer avansert agentarkitektur, flere brukere og integrasjoner i større eiendomssystemer er langsiktige muligheter. Disse er bevart i addendum som produktambisjoner, uten leveranseløfte eller tidsplan.

## Emnekontekst og videre avklaringer

Prosjektet gjennomføres i **IBE160 Programmering med KI**. Revisjonen bygger primært på [faglærerens tilbakemelding](tilbakemelding-product-brief.md), med [sensorveiledningen](../../../reference/course/Sensorveiledning-IBE160-Del-1.pdf) som vurderingsramme. Den smalere kjernen skal gi rom for implementering, testing, retting og dokumentasjon. BMAD brukes til planlegging; ingen krav om et bestemt antall agenter er etablert.

v1 skal ha demomodus med lagret KI-uttrekk og aktive beregninger/regler. Live KI er valgfritt og krever egen nøkkel. Plan for kostnadstak, gjenbruk av uttrekk, testdata og kjørbarhet står i addendum. Prompts, beslutninger og revisjonskontroll lagres i repoet for senere sporbarhet til krav, kode og tester.

Beregninger, screeningregler, grensen for KI-analysen og evalueringsopplegget er låst av produkteieren 2026-10-08. Konkrete avkastningskrav settes av brukeren per analyse. Ingen reelle åpne produktbeslutninger blokkerer PRD. Utarbeiding av testdokumenter og fasitfiler, egne skisser og valg av modell/kostnadsramme er videre planleggings- og gjennomføringsarbeid. Den eksisterende inputavgrensningen til tekstbasert PDF inntil 30 sider videreføres. PRD, UX og arkitektur er ikke startet i denne oppdateringen.
