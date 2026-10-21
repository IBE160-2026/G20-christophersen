# Epic 3 Context: Beregne, forstå og oppdatere ett samlet screeningresultat

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Investoren skal fullføre den lokale demovurderingen av ett boligutleieobjekt med fire etterprøvbare nøkkeltall og én begrunnet screeninganbefaling. Tall, rapportfunn, opphav og mangler skal kunne kontrolleres samlet. Endret grunnlag krever relevant ny kontroll og et nytt gjeldende resultat, mens uendret rapportuttrekk gjenbrukes uten ny KI-analyse.

## Stories

- Story 3.1: Beregne fire nøkkeltall fra hvert sitt gyldige årsgrunnlag
- Story 3.2: Avgjøre økonomiske terskler med eksakte verdier
- Story 3.3: Formatere nøkkeltall uten å skjule økonomiske brudd
- Story 3.4: Gi én komplett regelbasert anbefaling med fast begrunnelse
- Story 3.5: Binde resultat til revisjoner og gjøre tidligere resultat historisk
- Story 3.6: Gjøre hvert nøkkeltall og beregningsgrunnlag lesbart
- Story 3.7: Vise ett samlet screeningresultat med kontrollgrunnlag
- Story 3.8: Oppdatere resultat etter endret og bekreftet finansgrunnlag
- Story 3.9: Oppdatere resultat etter rapportkontroll og separat TG3-endring

## Requirements & Constraints

- Bruttoyield = L/P, NOI = L−D, nettoyield = NOI/P og kontantstrøm før skatt = NOI−J. P er totalpris inklusive eventuell fellesgjeld, uten kjøpsomkostninger. D er eierbetalt drift; J er renter og avdrag inklusive fellesgjeld. Ingen dobbelttelling eller nye fratrekk for skatt, reparasjon, ledighet eller verdiendring.
- L/D/J normaliseres fra kjent måned til år med faktor 12, én gang. Relevant årsgrunnlag må være gyldig og sammenlignbart. Registrert verdi, periode/år, faktor, årsverdi, kilde og kostnadsinnhold bevares. Manglende verdi er aldri skjult null eller estimat.
- Hvert nøkkeltall krever egne gyldige, bekreftede input uten uløst konflikt: P/L, L/D, P/L/D og L/D/J. P må være positiv; L/D/J/Ymin kan være eksplisitt bekreftet null. Manglende J rammer bare kontantstrøm; manglende Ymin rammer ingen nøkkeltall. Negative beregnede resultater beholdes. Ikke-beregnbare tall har konkrete årsaker.
- Finans påvirkes ikke av rapportutfall, analysemodus eller TG3-status. Gyldige delberegninger kan vises selv om samlet screeninggrunnlag er utilstrekkelig.
- Screening gir nøyaktig én anbefaling: kritiske mangler, feil, konflikter, ubekreftelse, kritisk usikkerhet eller uavklart alvorlig TG3 gir først Innhent mer informasjon. Ellers gir nettoyield under Ymin eller negativ kontantstrøm Forkast. Ellers gis Gå videre til grundigere vurdering/befaring. Alle utløsere på avgjørende nivå har stabil rekkefølge, fast kodebegrunnelse og nødvendig neste handling.
- TG3-avklaring er brukerbekreftet grunnlag for screening, ikke reparasjon eller teknisk godkjenning. Funn, KI-opphav, korrigering, avvisning og separat avklaring holdes etterprøvbare; avvisning er ikke teknisk avklaring.
- Verifikasjon bruker uavhengig F1–F4- og relevant BT-/AT-/FR-5-fasit. S1 tillater høyst 1 kr og 0,01 prosentpoeng avvik ved fasitkontroll, men gir ingen terskelmargin. Test beregnbarhet, presise desimaler, perioder, negative resultater, likhet, én krone under og endret kontra uendret grunnlag. Demo/E2E er ikke bevis for live KI-kvalitet eller tidsmål.

## Technical Decisions

- Rene TypeScript-funksjoner eier validering/årsnormalisering, finans, terskler og screening. Presentasjon er separat. Ingen React, Express, PDF, fil-/nettverks-I/O eller KI i finans-/regelkjernen; backend returnerer ingen finansresultater eller anbefaling.
- Bruk én delt kontraktautoritet og eksisterende felles input-/kritisk-mangel-/TG3-anvendbarhetsvalidering. Ingen parallelle regler i UI, state eller backend.
- Modulgrenser bruker kanoniske desimalstrenger og big.js; ingen Number/parseFloat før eksakt aritmetikk og ingen hjemmelaget brøkaritmetikk. Yield beholder teller/nevner til presentasjon. Nettoyieldkravet avgjøres uten divisjon som `100 * NOI >= P * Ymin`; kontantstrøm består ved `>= 0`. Visningsavrunding blir aldri regelinput.
- Frontend eier aktiv økt og siste snapshot, bundet til finans-, liste-, TG3- og rapportrevisjoner. Faktisk relevant endring gjør tidligere resultat historisk. Navigasjon alene endrer ingen revisjon. Ubrukt korrigeringsutkast påvirker ikke gjeldende grunnlag, men skal opplyses.
- TG3-endring ugyldiggjør resultatet uten ny bekreftelse av uendrede tall eller liste. Brukt retting/avvisning krever relevant ny kontroll. Ny rapport krever ny analyse/kontroll; gamle eller sene svar kan ikke bli gjeldende. Bare endret Ymin påvirker screening uten å endre de fire nøkkeltallene.
- Ingen database, varig historikk, ny offentlig testrute eller ny navigasjon som omgår kontrollsteg. Demo skal fortsatt kjøre lokalt uten nøkkel eller betalte kall.

## UX & Interaction Patterns

Resultat følger de fire eksisterende trinnene og viser anbefaling, kort grunn, utløste regler, fire nøkkeltall, alvorlige funn, faktiske blokkere og neste handling fra start. Formler, input/kilder, originaler og brukerendringer åpnes ved behov med merkede tastaturbetjente kontroller og tydelig åpen/lukket tilstand. Alle aktive TG2/TG3 er tilgjengelige med korrekt fysisk PDF-side og originalkilde.

Tall vises med norske skilletegn, hele NOK/år og tre yielddesimaler; ekstra presisjon/forklaring synliggjør skjulte terskelbrudd. Ikke-beregnbart og delgrunnlag formidles med tekst. Historisk snapshot merkes Utdatert / Må bekreftes på nytt med konkret endring og nødvendig kontroll. Fokus, etiketter, lesbar kontrast og statusformidling følger eksisterende UX; anbefalingen skal forstås uten å åpne detaljer.

## Cross-Story Dependencies

Epic 1 leverer kontrollert årsgrunnlag og felles mangelvurdering; Epic 2 leverer rapport, kildekontroll, korrigering/avvisning, separat TG3 og listebekreftelse. Finans, terskler, format, screening og snapshot er separate leveranser før resultatkomponenter og oppdateringsflyter kobles sammen. Ingen tidlig story skal implementere senere UI eller komplett screening på forskudd. Hele demoutfallet er uavhengig av Epic 4s live-integrasjon; senere leveransekontroll erstatter ikke logikknære tester underveis.
