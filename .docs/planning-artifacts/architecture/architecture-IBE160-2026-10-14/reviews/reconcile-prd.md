---
title: "Uavhengig avstemming av arkitektur mot final PRD"
date: 2026-10-14
reviewer: reconcile_prd
verdict: PASS
scope: "FR-1–FR-18, NFR-1–NFR-5, S1–S6 og PRD-addendum"
---

# Avstemming mot final PRD og testfasit

**Verdikt: PASS.** Arkitekturen gir et konsistent og tilstrekkelig modul- og verifikasjonsgrunnlag for den låste v1-en. Ingen kritiske, høye eller middels arkitekturgap er funnet i den kontrollerte kravflaten. Gjeldende finansformler, regelprioritet, brukerbekreftelser, rapportkontroll og skille mellom demo og live er bevart. Ingen produktkriterier, nye brukerfunksjoner eller nye tallgrenser må innføres for å rette et funn i denne avstemmingen.

Dette er dokumentavstemming, ikke produktverifikasjon. Rapporten påstår ikke at finanslogikk, PDF-uttrekk, KI-kvalitet, målinger eller lokal kjørbarhet allerede er implementert eller testet.

## Grunnlag og metode

Følgende dokumenter er lest i sin helhet:

- [ARCHITECTURE-SPINE.md](../ARCHITECTURE-SPINE.md), særlig AD-1–AD-10, konsistenskonvensjoner, kravkart, verifikasjonsgrenser og Deferred.
- [Arkitekturens beslutningslogg](../.memlog.md), inkludert de eksplisitte brukerbeslutningene Q-1–Q-7.
- [Final PRD](../../../prds/prd-IBE160-2026-10-10/prd.md), inkludert UJ-1, FR-1–FR-18, NFR-1–NFR-5, S1–S6 og videre gjennomføringsarbeid.
- [Final PRD-addendum](../../../prds/prd-IBE160-2026-10-10/addendum.md), inkludert FR-5-varianter, RT-1–RT-19, BT-1–BT-18, AT-1–AT-20 og TT-1–TT-9.

Avstemmingen undersøker om en modul har et tydelig ansvar for hvert krav, om grenser mellom moduler bevarer kravets mening, om feil og delgrunnlag kan representeres uten å gi feil anbefaling, og om planlagt verifikasjon kan gi relevant bevis. Den kontrollerer ikke om foreslåtte pakkeversjoner lar seg installere; det er teknisk fit-/installasjonsverifikasjon utenfor denne PRD-avstemmingen.

De siste brukerbeslutningene Q-1–Q-7 er bindende. Rapporten foreslår derfor ingen Python-backend, servereid vurdering, direkte PDF-til-KI, egen demoflyt, Number-basert regning, sensorløp med to utviklingsservere eller jobb-ID/polling.

## Funksjonelle krav

| Krav | Arkitekturansvar og støtte | Avstemmingsresultat |
| --- | --- | --- |
| FR-1 · registrere P/L/D/J/Ymin | Frontend state og `domain/validation`; AD-1, AD-2 og AD-7. Registrerte verdier, periode/år og årsgrunnlag holdes sammen; bare månedsverdier for L/D/J annualiseres med 12. | Dekket. Ingen automatisk låneplan, ekstra fratrekk eller skjulte verdier innføres. Finansdefinisjonene arves fra final PRD. |
| FR-2 · kilde, forutsetning og kostnadsinnhold | AD-2 knytter bekreftelsen til verdi, periode/år, kilde og kostnadsgrunnlag. AD-7 bevarer kostnadsinnhold og konflikter; presentation/screens eier synlig kontroll. | Dekket. Kostnadsinnhold kan følge bekreftet beregningsgrunnlag. PRDs D/J-avgrensning og forbud mot dobbelttelling er fortsatt bindende; arkitekturen gir ingen KI eller backend rett til å beregne eller velge finansverdier. |
| FR-3 · validering/null/mangler | `domain/validation` og `contracts`; AD-7 har P>0, L/D/J/Ymin>=0, egen manglende tilstand og eksplisitt nullbekreftelse. AD-8 fører utilstrekkelig grunnlag til prioritet 1. | Dekket. Ikke-numeriske, negative, motstridende eller ubekreftede input må avvises som gyldig grunnlag. De blir ikke null eller et standardtall. |
| FR-4 · bekrefte kontrollerte verdier | Frontend reducer og AD-2; bekreftelse gjelder faktisk kontrollert grunnlag, og automatisk bekreftelse er uttrykkelig utelukket i konsistenskonvensjonene. | Dekket. UJ-1 og FR-4 er fortsatt bindende for komplett hovedreise; ufullstendig grunnlag kan representeres og gi et mangelutfall. |
| FR-5 · TG3-avklaring | Separat frontend-tilstand og `domain/screening`; AD-2/AD-8. Avklart krever eksplisitt status og begge ikke-tomme tekster; ukjent/ugyldig blir uavklart. | Dekket. Rapportfunnet beholdes, avklaringen er brukerbekreftet og ingen ekstern verifisering eller teknisk godkjenning påstås. Endring av avklaringen ugyldiggjør tidligere resultat. |
| FR-6 · én støttet rapport/ett KI-kall | `backend/documents`, `backend/analysis` og frontend analyseforløp; AD-3–AD-6. Én tekstbasert PDF, 30-sidegrense, ett eksplisitt live-kall og ingen automatiske retries. | Dekket. Uendret uttrekk gjenbrukes. Ny rapport krever ny analyse og kontroll. Demo krever ingen KI-klient, nøkkel eller nett. |
| FR-7 · alle eksplisitte TG2/TG3 | AD-3 forbyr skjult bortfiltrering av sider/funn. AD-4 skiller sikre funn fra usikre kandidater; AD-10 henviser til full S2-fasit før brukerretting. Beslutningsloggen låser alle eksplisitte TG2/TG3 uten relevansfilter eller ny klassifisering. | Dekket. Promptens konkrete ordlyd eies senere av analysemodulen innen denne bindingen; en ny prompt kan ikke redusere uttrekksoppgaven til investeringsrelevante funn. |
| FR-8 · kilde/originalkontroll | Originalbytes i frontend, innebygd PDF-visning og kildekontrakt; AD-3/AD-4/AD-9. Filposisjon fra 1 er autoritativ, og usikker/manglende støtte markeres. | Dekket. UXs videre konkretisering med automatisk sidenavigering er bevart. Tekstuttrekket erstatter aldri originalrapporten som kontrollkilde. |
| FR-9 · usikkerhet/ufullstendig analyse | `contracts`, dokumentkomponent, adaptervalidering, frontend state og screening; AD-3–AD-5/AD-8. `completed` og `failed` skilles, og dokument-/analysefeil kan ikke oppheves med manuell bekreftelse. | Dekket. Gyldig tomliste, manglende svar, usikre kandidater og kjent ufullstendig analyse er forskjellige tilstander. Kilde-/sideusikkerhet skjules ikke bak gyldig JSON. |
| FR-10 · korrigere/avvise med opphav | Frontend reducer og felles kontrakter; AD-2/AD-4. Originalt uttrekk er immutabelt, og utkast, brukt korrigering og avvisning skilles. | Dekket. Avvisning er ingen TG3-avklaring; brukerkorrigert kilde må fortsatt være kontrollerbar. Ingen ny KI-analyse utløses. |
| FR-11 · bekrefte gjeldende liste | Frontend state og screening; AD-2/AD-4/AD-8. Brukt listeendring krever ny bekreftelse; rapportfeil/usikkerhet og TG3-avklaring er separate fra denne. | Dekket. Fullført analyse bekrefter ikke listen. Tomliste krever også fullføring og brukerens kontroll før tilstrekkelig rapportgrunnlag. |
| FR-12 · fire deterministiske nøkkeltall | `domain/validation`, `domain/finance` og presentation; AD-7. NOI=L−D, kontantstrøm=L−D−J og yieldgrunnlag L/P og NOI/P er bevart. | Dekket. Årsnormalisering skjer før regning. Negative resultater beholdes. KI, rapportfunn og TG3-status endrer ikke formlene. |
| FR-13 · gyldighet per nøkkeltall/delgrunnlag | AD-7 gir hvert nøkkeltall eget gyldighetsgrunnlag; felles kontrakter skiller beregnbart fra ikke-beregnbart med årsaker. AD-8 hindrer at delberegninger blir konklusiv screening. | Dekket. Manglende/ugyldig P kan fortsatt gi gyldig NOI/kontantstrøm; manglende J hindrer bare kontantstrøm; manglende Ymin hindrer screening, ikke de fire beregningene. |
| FR-14 · etterprøvbarhet/presisjon | `domain/finance`, `domain/thresholds` og presentation; AD-7 og konsistenskonvensjoner. Desimalstrenger og eksakt aritmetikk bevarer grunnlaget; bare presentation dividerer/avrunder til visning. | Dekket. Formler, input, kilde, periode/faktor/år må vises etter PRD. Eksakt yieldlikhet og kontantstrøm=0 er godkjent; S1-toleransen brukes aldri i screening. |
| FR-15 · endre og beregne uten ny KI | Frontend state og lokale rene moduler; AD-2/AD-6/AD-7. Faktisk finansendring krever berørt bekreftelse på nytt og gjør tidligere resultat historisk. | Dekket. Ymin-endring trenger ny regelvurdering, men ingen endring av de fire nøkkeltallene. Rapportkontroll gjenbrukes når rapporten er uendret. |
| FR-16 · én anbefaling/fast prioritet | `domain/screening`; AD-8 sammen med AD-7s terskler og AD-4s feil/rapportstatus. | Dekket. Prioritet 1 overstyrer økonomi; prioritet 2 er yieldbrudd eller negativ kontantstrøm; ellers prioritet 3. Alle utløsere på avgjørende nivå samles. |
| FR-17 · kodebegrunnelse/neste handling | `domain/screening` og presentation; AD-8 og faste, stabilt ordnede tekster i konsistenskonvensjonene. | Dekket. KI får ingen anbefalings-, begrunnelses- eller omskrivingsrolle. Samme grunnlag gir samme regler, tekst og neste handling. |
| FR-18 · sammenhengende gjeldende resultat | Frontend resultatsnapshot, revisjoner, screens/presentation/pdf; AD-2/AD-7–AD-9. Finans-, liste-, TG3- og rapportrevisjon bindes til siste resultat. | Dekket. Et gammelt resultat kan vises historisk som Utdatert, men aldri som gjeldende for endret grunnlag. Rapportfunn, feil, opphav og økonomiske delresultater beholdes tilgjengelige. |

## Kvalitetskrav og suksesskriterier

| Krav/mål | Arkitektur- og verifikasjonsstøtte | Avstemmingsresultat |
| --- | --- | --- |
| NFR-1 · stabilitet | AD-1/AD-2/AD-4/AD-5/AD-8; rene finans-, regel- og reducer-tester, duplikatsperre og avvisning av gamle svar. | Dekket. Gjenskaping av gitt grunnlag krever ingen ny KI-kjøring. Avbrudd eller feil kan ikke gjøres om til falsk suksess. |
| NFR-2 · desktop/tastatur/forståelse | AD-9 binder godkjent UX, fokus/status/tekst, fire trinn og originalkontroll. E2E og manuell kontroll er fordelt i verifikasjonsplanen. | Dekket på arkitekturnivå. Faktisk kontrast, fokusrekkefølge, etiketter og forståelse gjenstår som UX-verifikasjon. |
| NFR-3 · lokal kostnadsfri demo | AD-6/AD-9; bygget frontend og API på én loopback-server, lokale ressurser og demo som standard uten KI-klient. | Dekket. Ren kjøring av annen person er planlagt, inkludert nettverksfri demoflyt og README. Installasjon uten nett er ikke lovet. |
| NFR-4 · hemmeligheter/testdata | AD-9 holder nøkler i lokal backend-konfigurasjon og utenfor frontend/Git/logg; private PDF-er eksponeres ikke av filserver og midlertidige ressurser ryddes. | Dekket. PRDs leveransekontroll av versjonerte filer/historikk og dokumentrettigheter gjelder fortsatt ved implementering/leveranse; en egen sikkerhetsadministrasjonsfunksjon innføres ikke. |
| NFR-5 · riktig tidsmåling | AD-5/AD-10 og verifikasjonsgrensen Live/tid/ren kjøring bruker PRDs t_start/t_liste/t_bekreftet og skiller feil og demo fra live. | Dekket. Fem minutter er medianmål, ikke teknisk timeout. Ingen ny apptelemetri kreves. |
| S1 · finansfasit | AD-7/AD-10; F1–F4 og BT-1–BT-18 mot uavhengig forhåndsdefinert fasit, separate tester av formatering og terskler. | Dekket. PRDs høyst 1 kr og 0,01 prosentpoeng er kontrollmål for viste beregninger, ikke godkjent avvik i regelen. |
| S2 · dokumentfunn | AD-3/AD-4/AD-10; alle TG3 og alle TG2 inngår i fasiten, originalt live-uttrekk vurderes før retting. | Dekket. Alle TG3, minst 90 % TG2 med riktig side og ingen oppdiktede funn arves fra PRD. Demo og dokumentparsertester kan ikke dokumentere live KI-kvalitet. |
| S3 · mangler/regler | AD-7/AD-8/AD-10; BT-, AT- og FR-5-varianter samt dokument-/analysefeil og alle avgjørende utløsere. | Dekket. Økonomiske delresultater overstyrer aldri prioritet 1, og avklart TG3 gir ingen automatisk Gå videre. |
| S4 · sporbarhet | AD-2/AD-3/AD-7/AD-9/AD-10; original/funn/korrigering/TG3 skilles, og anvendt finansgrunnlag følger resultatet. | Dekket. Originalkilde og synlig brukerforutsetning må vurderes manuelt; hash eller JSON alene er utilstrekkelig bevis. |
| S5 · medianer og manuell sammenligning | AD-5/AD-10; TT-1–TT-9 og separat live/demo/manuell sammenligning i verifikasjonsplanen. | Dekket. Feil og ufullført kontroll kan ikke føres som raske vellykkede forsøk. Måltypene og målepunktene er beholdt. |
| S6 · annen persons kjøring | AD-6/AD-9/AD-10; ren lokal README-kjøring av bygget app og lokale tester uten nøkkel/betalt konto. | Dekket. Browserinstallasjon er eksplisitt forberedelse for E2E, og selve demoflyten har alle nødvendige ressurser lokalt. |

## Særlig kontrollerte grenseforløp

**Delvis gyldig finansgrunnlag:** AD-7s gyldighet per nøkkeltall og AD-8s helhetlige screening er forenlige med BT-3–BT-6 og BT-13–BT-18. Gyldig NOI/kontantstrøm kan vises selv om P mangler eller er 0. Med manglende J kan de tre øvrige nøkkeltallene fortsatt vises. Med manglende Ymin kan alle fire tall vises, men anbefalingen blir Innhent mer informasjon. Et beregnbart svakt yieldresultat med manglende J kan aldri gi Forkast; AT-6 og BT-17 må derfor ligge i screeningtestene og ikke bare finansfasiten.

**Årsnormalisering:** AD-7 bevarer registrert verdi, periode/år, faktor og anvendt årsverdi. BT-7 og BT-15 kan gjennomføres med en blanding av års- og månedsregistrering før deterministisk omregning. BT-16 krever avvisning av berørte verdier når periode er ukjent/ustøttet eller år er uforenlige. Dette må gjøres uten at en global gyldighetsboolsk verdi unødvendig fjerner alle ellers beregnbare nøkkeltall; modulansvaret er allerede plassert hos validation/finance.

**Eksakt terskel og negative resultater:** `100 * NOI >= P * Ymin` er algebraisk identisk med PRDs nettoyieldkrav når P>0 og Ymin er prosent. BT-8/AT-10 kan skille 1 520 000 fra 1 519 999 i L ved Ymin=7 selv når skjermen viser et avrundet tall. BT-9/AT-11 skiller kontantstrøm 0 fra −1 uten toleranse. BT-11s negative resultater skal beholdes. Ingen egen heltalls-/brøkimplementasjon eller skjult Number-konvertering er nødvendig.

**Usikkerhet, feil og tomliste:** AD-4s completed/failed og usikre kandidater kan representere RT-7, RT-9, RT-10 og RT-19 uten at manglende eller delvis output regnes som fullført analyse. Usikre kilde-/side-/gradopplysninger kan håndteres etter FR-10/FR-11. En virkelig dokument-/analysefeil forblir derimot feil selv om listen bekreftes; AD-4/AD-8 hindrer den feilaktige overgangen. Den minste kontrakten er ikke en uttømmende feltliste: hvis delresultater faktisk finnes i et failed-svar, må kontrakt- og visningsimplementeringen bevare dem som eksplisitt merkede delresultater etter FR-9/RT-9, aldri som en fullført aktiv funnliste.

**TG3:** En bekreftet funnliste er ikke en TG3-avklaring, og en avvist feilaktig KI-post er ikke en avklaring av et virkelig teknisk forhold. AD-2/AD-8 opprettholder dette. FR-5s mellomromskrav for tekst og flere TG3-funn kan implementeres lokalt i screening/validation uten nye arkitekturvalg. AT-8–AT-9 og AT-20 kan kjøres uten at økonomi eller listebekreftelse forandrer avklaringsstatusen.

**Prioritet og alle kjente utløsere:** AD-8 samler alle utløsere på avgjørende nivå og bruker stabilt ordnet kodebegrunnelse. AT-18 kan derfor vise manglende L, manglende Ymin, analysefeil og kjent uavklart TG3 samtidig. AT-4 viser begge økonomiske brudd når prioritet 2 faktisk gjelder. AT-19s nøyaktige gjenskaping krever ingen ny KI-tekst og er forenlig med de foreslåtte modulgrensene.

**Analyseforløp og endret grunnlag:** AD-5 bevarer Q-7s ene ventende HTTP-kall, og AD-2 gjør brukerens gjeldende vurdering til eneste eier av resultatets relevans. Rapporthash/requestId/analysegenerasjon og revisjoner har forskjellige formål; et validert gammelt svar kan derfor avvises selv om transporten ikke lot seg avbryte. RT-4/AT-16 gjelder fortsatt ved rapportbytte. Verifikasjonsplanen dekker duplikater, klientavbrudd og sene svar uten jobbtilstand eller polling.

**S5:** Målingen starter ved brukerens Start analyse og stopper først ved synlig ferdig funnliste; den kan ikke forskyves til tidspunktet da serveren mottar filen eller modellen avslutter. Lokal filvalg/klargjøring før Start analyse inngår ikke, mens HTTP-/backend-/visningsarbeid etter t_start ligger mellom de låste målepunktene i Q-7-forløpet. Det er ikke grunnlag for å trekke fra deler av forespørselen etterpå eller legge inn et nytt opplastingsendepunkt. Ved kontrollmålingen kan håndtert Uavklart TG3 fortsatt gi fullført kontroll og Innhent mer informasjon, som TT-5 krever. AD-10 henviser til hele PRD-protokollen for utvalg, feil, median og manuell sammenligning.

## Testgrenser og bevis

Arkitekturen skiller hensiktsmessig mellom fem typer bevis:

1. Rene input-/finans-/terskel-/screening-/format-tester beviser deterministisk oppførsel for et gitt grunnlag og fasit. De trenger ikke React, backend eller KI.
2. Rene frontend-overgangstester beviser bekreftelser, utkast, revisjoner og ugyldiggjøring. De kan kontrollere AT-16 og UX-retur uten å gjemme regellogikk inne i komponenter.
3. Integrasjonstester bruker ekte PDF-bytes og dokumentkomponent, kontrollerte adapterreturer og runtime-kontrakter. De kan bevise side-/tekst-kobling, tydelige feil, fixturebinding, duplikatvern og ingen live-fallback. De beviser ikke live uttrekkskvalitet.
4. E2E kjører bygget lokal app med samme kontrollerte adaptergrense. UJ-1, alle tre anbefalinger, originalkilde og kontrollflyt kan dermed testes uten betaling. Manuell kontroll vurderer faktisk brukbarhet, tastatur, visuell tilgjengelighet og kildekontroll.
5. S2/S5-liveevaluering og S6-kjørbarhetskontroll gir separate bevis. Fasit må eksistere før liveevaluering, og annen persons rene miljø må dokumenteres. Demo er ingen erstatning for S2 eller live S5.

RT-1–RT-19 er et tverrgående testsett; henvisningen fra PDF-komponenten betyr ikke at PDF-parseren alene skal teste KI-kvalitet, listebekreftelse eller brukerendringer. De relevante delene må fordeles mellom integration, reducer/E2E og separat liveevaluering etter AD-10. Krav-ID, AD-ID og testeksempel-ID binder senere implementering til samme fasit.

## Detaljer som legitimt eies av senere moduler

Disse punktene er ikke arkitekturgap eller nye produktspørsmål:

- Nøyaktige schemas og unionsfelter for finansgyldighet, usikre kandidater og eventuelle delresultater eies av én felles `contracts`-modul innen AD-4/AD-7. Minstekontrakten trenger ikke være en full DTO-spesifikasjon nå.
- Validation/finance eier den konkrete avhengighetsmatrisen for de fire nøkkeltallene og kontrollen av periode/år, kostnadsgrunnlag, konflikt og bekreftelse. Matrisens krav er allerede låst i FR-13 og testfasiten.
- Dokumentkomponenten eier praktisk lesbarhetskontroll og layoutbevaring mot ekte fixtures, før uttrekket kan brukes som gyldig grunnlag. Det er riktig å dokumentere dette som uverifisert gjennomføringsarbeid fremfor å anta at sidenummer eller tekstlengde beviser kvalitet.
- Backend HTTP eier timeout, uploadressursgrenser og levetid/opprydding av duplikatmarkører. AD-5/Deferred forbyr endring av 30-sidegrensen, automatisk retry eller gjenopptakbar jobb som løsning på disse detaljene.
- Live-integrasjonen eier leverandør/modell/SDK/prompt innen ett kall, hele sidemerkede grunnlaget og de låste uttrekkskravene. Mads må avklare pris/budsjett før betalte tester etter PRD. Demo og kontrakten trenger ikke dette valget for å være konsistente.
- Implementering/evaluering eier faktisk README, scripts, fixtures, nettverkskontroll, hemmelighets-/historikkontroll, manuelle målinger og produkttestbevis. Arkitekturen lover ikke at disse allerede finnes.

Det er derfor ingen påvist grunn til å gjenåpne Q-1–Q-7 eller endre final PRD/addendum. Den kontrollerte arkitekturen kan ferdigstilles på dette nivået uten epics, stories eller implementering.
