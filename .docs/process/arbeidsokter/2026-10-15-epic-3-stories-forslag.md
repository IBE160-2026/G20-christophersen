---
title: "Epic 3: storyforslag til gjennomgang"
created: 2026-10-15
status: approved-and-incorporated
workflow: bmad-create-epics-and-stories
step: step-03-create-stories
epic: 3
stories: ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9"]
approvedStories: ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9"]
---

# Storyforslag — Epic 3

Mads godkjente story 3.1–3.9 med C. Alle ni er innarbeidet uendret i [epics.md](../../planning-artifacts/epics.md), som nå har 27 godkjente stories fra Epic 1–3. Denne filen bevarer gjennomgangsforslaget og dets dekningskontroll som prosesshistorikk. Epic 4 behandles videre i workflowens steg 3. Ingen implementering er startet; implementation readiness følger etter ferdige stories for alle fem epics.

## Kildeindeks og leseregel

- [PRD](../../planning-artifacts/prds/prd-IBE160-2026-10-10/prd.md): hele FR-12–FR-18, endrings-/kontrollkrav i FR-1–FR-6/FR-8–FR-11 og relevante NFR-1–NFR-3. [PRD-addendum](../../planning-artifacts/prds/prd-IBE160-2026-10-10/addendum.md): BT-1–BT-18, AT-1–AT-20, relevante RT-eksempler og sju FR-5-eksempler.
- [Brief-addendum](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/addendum.md): F1–F4, uavhengig utregnet fasit, regelvarianter og finansdefinisjoner. [Faglærertilbakemelding](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md) lest med [gjeldende oppfølging](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/revisjonskontroll-2026-10-08.md): smal kjerne og finans i vanlig kode med fasit.
- [DESIGN](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/DESIGN.md) og [EXPERIENCE](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md): Resultat, metric-grid/recommendation/basis-detail/detail-disclosure/stale-result, Information Architecture, State Patterns og Key Flows 1–4. UX-DR er eksisterende indeks i epics.md.
- [ARCHITECTURE-SPINE](../../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md): AD-1/AD-2/AD-6–AD-10, særlig separate rene finans-/terskel-/screening-/formatfunksjoner, eksakt big.js-aritmetikk, frontendøkt og revisjonsbundet snapshot.
- [SPEC](../../specs/spec-IBE160/SPEC.md), [grensekontrakter](../../specs/spec-IBE160/grensekontrakter.md), [sporbarhet](../../specs/spec-IBE160/sporbarhet.md) og [verifikasjon/avklaringer](../../specs/spec-IBE160/verifikasjon-og-avklaringer.md): CAP-5/CAP-6/CAP-7/CAP-8, Finans og screening og hele Endring og gyldighet.

Fulltekstkrav og adopterte kompanjonger gjelder. Storylokale AC-numre erstatter ingen kilde-ID. Testkravene bruker uavhengige forventninger fra eksisterende fasit; de er planlagte kontroller, ikke testresultater. Faktiske rapportfixtures/fasit leveres i 2.2. S2/live-S5 og faktisk KI-analyse er fortsatt Epic 4; S6/annen-person-kjøring er Epic 5. Demo etter Epic 3 erstatter ikke live-leveransen i v1.

## Epic 3: Beregne, forstå og oppdatere ett samlet screeningresultat

Investoren kan fullføre den lokale demovurderingen med etterprøvbare nøkkeltall, én kodebasert anbefaling og tilgjengelig rapport-/kontrollgrunnlag. Endringer gjør tidligere resultat historisk; ny kodevurdering bruker bare gjeldende relevant kontroll uten ny analyse av uendret rapport.

| Story | Avgrenset leveranse | Direkte forutsetninger |
|---|---|---|
| 3.1 | Fire rene finansberegninger med gyldighet per nøkkeltall | 1.4, 1.5, 1.7 |
| 3.2 | Eksakte økonomiske terskler med likhet og uten toleransemargin | 1.4, 3.1 |
| 3.3 | Separat norsk tallformat og forklaring ved skjult terskelbrudd | 3.1, 3.2 |
| 3.4 | Komplett ren screening med prioritet, alle utløsere og fast tekst | 1.6, 2.10, 2.11, 3.1, 3.2 |
| 3.5 | Revisjonsbundet resultatsnapshot og ren ugyldiggjøring | 1.7, 2.6, 2.8, 2.9, 2.10, 2.11, 3.4 |
| 3.6 | Nøkkeltallskomponenter med formler, input, kilder og ikke-beregnbarhet | 3.1, 3.3, 3.5 |
| 3.7 | Første samlede Resultat med anbefaling, rapportgrunnlag og tilgjengelighet | 2.7, 2.11, 3.4, 3.5, 3.6 |
| 3.8 | Endre og bekrefte finansgrunnlag og få nytt gjeldende resultat | 1.7, 3.5, 3.7 |
| 3.9 | Oppdatere resultat etter funn-/TG3-/rapportendring og bevare ubrukt utkast | 2.6, 2.8, 2.9, 2.10, 2.11, 3.5, 3.7 |

3.1–3.5 er avgrensede moduler/tilstandsoverganger med egne direkte tester; de trenger ingen senere skjerm. 3.6 er en separat verifiserbar komponentleveranse, uten ekstra produktskjerm eller offentlig testrute. 3.7 kobler komponentene til første samlede resultat. 3.8 og 3.9 fullfører de to oppdateringsforløpene i faktisk app; snapshotvernet fra 3.5 brukes allerede i 3.7. Ingen story kan vise gammel anbefaling som gjeldende mens den venter på senere integrasjon. Antallet er en konkret arbeidsoppdeling, ikke et tidsestimat eller en påstand om endelig gjennomførbarhet.

### Story 3.1: Beregne fire nøkkeltall fra hvert sitt gyldige årsgrunnlag

Som investor,
vil jeg få de fire låste nøkkeltallene beregnet bare når hvert enkelt har gyldige bekreftede input,
slik at mangler og negative resultater behandles korrekt uten skjulte estimater.

**Kravspor:** FR-12/FR-13 og beregningsgrunnlaget til FR-14; FR-1–FR-4; NFR-1; S1/S3/S4; AD-1/AD-7/AD-10; SPEC CAP-5 og grensekontraktens Finans og screening. UX-DR21/UX-DR29/UX-DR40 er senere konsumenter; denne storyen leverer ingen resultatflate.

**Avhengigheter:** 1.4, 1.5 og 1.7. **Arbeidsgrense:** Ren domain/finance med gyldighet per nøkkeltall og kontrollerbart formel-/inputgrunnlag, basert på den eksisterende felles valideringen/årsnormaliseringen. Terskler, regelprioritet, formattering og visning er egne leveranser. Ingen React, Express, PDF, nettverk eller KI i finansmodulen.

**Acceptance Criteria:**

**Given** gyldige bekreftede verdier for relevant årsgrunnlag
**When** finansmodulen beregner
**Then** bruttoyield har grunnlaget L/P, NOI er L−D, nettoyield har grunnlaget (L−D)/P og kontantstrøm før skatt er L−D−J
**And** yield beholder eksakt teller/nevner til presentasjon, beløp er NOK/år og input-/formelgrunnlaget er tilgjengelig uten mellomavrunding. **(AC1)**

**Given** månedlige eller blandede kjente års-/månedsinput for L/D/J som gjelder samme år
**When** de validerte normaliserte verdiene brukes
**Then** bare de månedlige beløpene er ganget med 12, én gang, før beregningen
**And** registrert verdi/år/periode, faktor, årsverdi, kilde og kostnadsinnhold beholdes; ukjent/ustøttet periode eller ulike år brukes ikke som gyldig felles årsgrunnlag. **(AC2)**

**Given** manglende L, manglende J, manglende Ymin eller P=0 som separate varianter
**When** hvert nøkkeltalls grunnlag vurderes
**Then** L-mangel hindrer alle fire, J-mangel bare kontantstrøm og Ymin-mangel ingen av de fire
**And** P=0 hindrer begge yieldberegningene uten divisjon med null, mens gyldig NOI/kontantstrøm beholdes; hvert utilgjengelig tall har konkrete årsaker fremfor null eller tidligere verdi. **(AC3)**

**Given** uløst kildekonflikt, ugyldig/ubekreftet verdi eller blank kontra bekreftet/ubekreftet null
**When** et nøkkeltall bruker berørte felt
**Then** bare gyldig bekreftet input inngår, med egne krav P/L, L/D, P/L/D og L/D/J for de fire tallene
**And** bekreftet J=0 er gyldig, mens blank eller ubekreftet 0 er utilstrekkelig; alle kjente relevante årsaker følger berørte ikke-beregnbare tall. **(AC4)**

**Given** gyldige input som gir negative NOI-, yield- eller kontantstrømresultater
**When** nøkkeltallene beregnes
**Then** de negative resultatene beholdes som beregnede verdier
**And** P/D/J følger låste definisjoner uten doble gjeldsposter eller nye fratrekk for ledighet, reparasjon, skatt, kjøpsomkostninger eller verdiendring. **(AC5)**

**Given** samme finansgrunnlag, men ulikt rapportutfall, live/demo eller TG3-status
**When** finansmodulen kjøres gjentatte ganger
**Then** beregnbare nøkkeltall og deres inputgrunnlag er identiske
**And** finansmodulen avgjør ikke om teknisk grunnlag er tilstrekkelig eller om tallene kan gi en konklusiv anbefaling; den bruker kanoniske desimalstrenger og låst big.js uten Number/parseFloat før eksakt aritmetikk. **(AC6)**

**Testkrav:** Vitest mot uavhengig F1/F2/F3/F4-fasit og beregningsdelene av BT-1–BT-11/BT-14–BT-18. F1 skal gi grunnlag for 11,875 %, 1 500 000 kr/år, 9,375 % og 700 000 kr/år; F2 gir 8,75 %, 1 000 000, 6,25 % og 200 000. BT-7/BT-15 skal gi like årsresultater; BT-11 beholder −100 000, −0,625 % og −900 000. Dekk hver inputavhengighet, blank/null/konflikt/bekreftelse, år/periode og presise desimalinput. Forventningene beregnes ikke med funksjonen som testes. Visningsdivisjon/format testes i 3.3; komplette regelutfall i 3.4.

### Story 3.2: Avgjøre økonomiske terskler med eksakte verdier

Som investor,
vil jeg at yieldkrav og nullgrense vurderes uten avrundingsmargin,
slik at likhet består og selv et lite faktisk brudd behandles korrekt.

**Kravspor:** FR-14 og terskeldelen av FR-16/FR-17; NFR-1; S1/S3; AD-1/AD-7/AD-10; SPEC CAP-5/CAP-6 og Finans og screening. UX-DR29s terskelforklaring er senere visning, ikke levert UI her.

**Avhengigheter:** 1.4 og 3.1. **Arbeidsgrense:** Separate rene terskelfunksjoner, med konkrete bestått/brutt/ikke-vurderbart-grunnlag for yield og kontantstrøm. De velger ingen anbefaling og tar ikke over kritisk-mangelvurderingen. Ingen sammenligning av formatterte strenger eller avrundet yield.

**Acceptance Criteria:**

**Given** gyldig P, NOI og Ymin i prosent
**When** nettoyieldkravet vurderes
**Then** kravet avgjøres eksakt som `100 * NOI >= P * Ymin` med big.js
**And** ingen yielddivisjon, Number/parseFloat, mellomavrunding eller S1-toleranse inngår i regelavgjørelsen. **(AC1)**

**Given** P=16 000 000, D=400 000, Ymin=7 og L først 1 520 000 og deretter 1 519 999 kr/år
**When** yieldkravet vurderes
**Then** den første består ved nøyaktig likhet og den andre bryter
**And** utfallet endres ikke av at begge senere kan vises som 7,000 %. **(AC2)**

**Given** gyldig kontantstrøm først 0 og deretter −1 kr/år
**When** nullgrensen vurderes
**Then** 0 består og −1 bryter, også med presise desimalbeløp rundt null
**And** begge økonomiske vilkår kan være brutt samtidig uten at det ene overskriver det andre. **(AC3)**

**Given** manglende/ugyldig/ubekreftet terskelgrunnlag, herunder P=0 eller manglende Ymin/J
**When** terskelfunksjonene kjøres
**Then** berørt terskel er ikke vurderbar med konkret utilstrekkelig grunnlag, uten gjetting eller divisjon med null
**And** et tilgjengelig økonomisk terskelutfall kan ikke i seg selv oppheve prioritet 1 i den senere samlede screeningen. **(AC4)**

**Testkrav:** Vitest for BT-8/BT-9, terskeldelene av AT-2–AT-4/AT-10/AT-11/AT-14/AT-15 og manglende grunnlag fra BT-5/BT-6/BT-18. Test eksakt likhet, én krone under, små desimalbrudd, gyldig bekreftet Ymin=0, cash=0/negativ og begge brudd. Bruk konkrete uavhengige forventninger; terskeltester skal passere uten presentasjonsfunksjon eller KI.

### Story 3.3: Formatere nøkkeltall uten å skjule økonomiske brudd

Som investor,
vil jeg lese norske beløp og prosenter og kunne se detaljene bak et avrundet terskelbrudd,
slik at visningen er lett å lese og fortsatt kan etterprøves.

**Kravspor:** FR-12/FR-14/FR-17; NFR-1/NFR-2; S1/S4; AD-7/AD-9/AD-10; SPEC CAP-5/CAP-6 og presentasjonsdelen av Finans og screening. UX-DR21/UX-DR29/UX-DR40; DESIGNs tallformat og EXPERIENCE metric-grid/recommendation.

**Avhengigheter:** 3.1 og 3.2. **Arbeidsgrense:** Rene presentasjonsfunksjoner for tall, enheter og nødvendig terskeldetalj. Visningsdivisjon/avrunding gjøres her med låst bibliotek; funksjonene endrer aldri finansgrunnlaget eller terskelutfallet. Ingen ny full resultatflate.

**Acceptance Criteria:**

**Given** et beregnbart nøkkeltall med eksakt verdi/formelgrunnlag
**When** vanlig visning formateres
**Then** beløp vises i hele NOK per år og yield i prosent med tre desimaler og norske skilletegn
**And** negative verdier beholder sin betydning, og navn/enhet/år kan presenteres sammen med tallet. **(AC1)**

**Given** nettoyield 6,99999375 % mot Ymin=7 %, eller en negativ kontantstrøm som avrundes til synlig null
**When** et faktisk terskelbrudd ellers ville blitt skjult
**Then** presentasjonsdata inkluderer nødvendig ekstra detaljpresisjon og forklaring om uavrundet regelgrunnlag
**And** hovedvisning 7,000 % eller 0 kr fremstilles ikke som bevis på bestått terskel. **(AC2)**

**Given** ikke-beregnbart tall eller kjent delgrunnlag
**When** presentasjonsdata bygges
**Then** ikke-beregnbart får egne årsaker og ikke et tall, estimat eller gammel verdi
**And** presentasjonen bevarer informasjonen som trengs for synlig Ikke beregnbart/Delgrunnlag; den velger ingen egen anbefaling eller inputgyldighet. **(AC3)**

**Given** samme eksakte grunnlag og terskelutfall
**When** visningen formateres gjentatte ganger eller detaljpresisjonen utvides
**Then** finansverdier og terskelutfall er uendret
**And** presentasjonens avrundede eller lokaliserte verdier sendes aldri tilbake til domain-reglene. **(AC4)**

**Testkrav:** Vitest for F1/F2, negative tall fra BT-11, BT-8/BT-9 og BT-15s enhet/årsgrunnlag, samt ikke-beregnbarhet fra BT-3/BT-5/BT-6. Kontroller faktisk norsk format, tre yielddesimaler, hele NOK, skjult yield-/nullbrudd og nødvendig detaljpresisjon mot uavhengig fasit. En integrasjonskontroll med de ekte terskelfunksjonene skal vise samme avgjørelse før/etter formatering; ikke bare at formatteren returnerer en streng.

### Story 3.4: Gi én komplett regelbasert anbefaling med fast begrunnelse

Som investor,
vil jeg få én anbefaling med alle avgjørende forhold og konkret neste handling,
slik at informasjonsmangler alltid veier tyngre enn økonomiske delresultater.

**Kravspor:** FR-13/FR-16/FR-17 og screeningdelen av FR-5/FR-9/FR-11/FR-18; NFR-1; S3/S4; AD-1/AD-7/AD-8/AD-10; SPEC CAP-6 med CAP-4/CAP-5 og Finans og screening. UX-DR20/UX-DR24/UX-DR36/UX-DR40 er resultat-/lokale konsumenter; UI kommer separat.

**Avhengigheter:** 1.6, 2.10, 2.11, 3.1 og 3.2. **Arbeidsgrense:** Fullfør den ene rene domain-screeningen med prioritet 1–3, stabile regelidentifikatorer/utløsere og faste begrunnelser/neste handling. Gjenbruk felles kritisk-mangel- og TG3-anvendbarhetsvalidering. Ingen ny parallell UI-/backendmotor eller KI-generert tekst.

**Acceptance Criteria:**

**Given** minst én kritisk mangel/ugyldighet/konflikt/ubekreftelse, rapport-/analysefeil, uløst kritisk usikkerhet eller uavklart alvorlig TG3
**When** samlet screening utføres
**Then** nøyaktig én anbefaling er Innhent mer informasjon etter prioritet 1
**And** alle kjente utløsere på nivået er med, stabilt ordnet, med berørt felt/funn/dokument og konkret retting/bekreftelse/innhenting/avklaring; evalueringen stopper ikke ved første mangel. **(AC1)**

**Given** tilstrekkelig kritisk grunnlag og brutt nettoyieldkrav eller negativ kontantstrøm
**When** samlet screening utføres
**Then** nøyaktig én anbefaling er Forkast etter prioritet 2 med aktuelle verdier og grenser
**And** begge brudd er med når begge gjelder; positivt resultat for ett vilkår opphever ikke brudd på det andre. **(AC2)**

**Given** tilstrekkelig kritisk grunnlag, nettoyield ≥ Ymin og kontantstrøm ≥ 0
**When** samlet screening utføres
**Then** nøyaktig én anbefaling er Gå videre etter prioritet 3 med oppfylte økonomiske krav og tilstrekkelig teknisk screeninggrunnlag
**And** neste handling er grundigere vurdering/befaring; teksten gir ingen kjøpsanbefaling eller teknisk godkjenning. **(AC3)**

**Given** svake økonomiske delresultater sammen med en kritisk mangel eller uavklart alvorlig TG3
**When** screeningen utføres
**Then** prioritet 1 avgjør uten Forkast/Gå videre, mens gyldige beregninger kan følge som delgrunnlag
**And** en gyldig avklart TG3 beholder grad/funn og gir ingen automatisk forkastelse eller godkjenning; først tilstrekkelig grunnlag lar økonomien avgjøre. **(AC4)**

**Given** samme gjeldende input, rapportgrunnlag, kontroll-/TG3-status og faste regler
**When** screeningen kjøres flere ganger
**Then** anbefaling, avgjørende prioritet, ordnede utløsere, regelbegrunnelse og anbefalingsbundet neste handling er identiske
**And** ingen KI, nettverk, presentasjonsavrunding eller S1-margin lager eller endrer disse. **(AC5)**

**Given** lokale mangelflater og samlet screening bruker samme grunnlag
**When** kritiske mangler konsumeres fra felles domain-autoritet
**Then** de samme kjente forholdene har samme betydning og nødvendige handling uansett flate
**And** ukjent årsak/faktum gjettes ikke, mens resultatvisningen senere kan oppsummere kort uten å kopiere alle lokale feilmeldinger. **(AC6)**

**Testkrav:** Rene Vitest-tester mot alle logiske utfall i AT-1–AT-15/AT-18–AT-20, relevante BT-3–BT-6/BT-17/BT-18, sju FR-5-eksempler og briefets regelvarianter. AT-18 skal gi alle fire kjente utløsere; AT-4 begge økonomiske brudd; AT-20 fortsatt prioritet 1. AT-19 skal kontrollere identiske ordnede utløsere, full fast begrunnelse og neste handling ved F1/F2/AT-18. Test completed/tomliste/bekreftet kontra failed/ubekreftet/usikker, gyldig/ugyldig forholdsbundet TG3, eksakte grenseverdier og bekreftet null. UI-delen av AT-17 og faktiske endringsforløp i AT-16 verifiseres i senere stories, ikke regnes levert her.

### Story 3.5: Binde resultat til revisjoner og gjøre tidligere resultat historisk

Som investor,
vil jeg at resultatet bare er gjeldende for det grunnlaget det faktisk ble vurdert fra,
slik at en tidligere anbefaling aldri følger nye verdier eller en annen rapport.

**Kravspor:** FR-4/FR-5/FR-6/FR-10/FR-11/FR-15/FR-18; NFR-1; S3/S4; AD-1/AD-2/AD-4/AD-8/AD-10; SPEC CAP-7 og Screening og snapshot/hele Endring og gyldighet. UX-DR2/UX-DR15/UX-DR18/UX-DR26/UX-DR38; stale-result og Key Flow 3 er senere UI-konsumenter.

**Avhengigheter:** 1.7, 2.6, 2.8, 2.9, 2.10, 2.11 og 3.4. **Arbeidsgrense:** Resultatdata og rene reducer-/selektoroverganger i eksisterende frontendøkt. Siste snapshot inneholder sammenhengende beregnings-/screening-/grunnlagsdata og bundne finans-, liste-, TG3- og rapportrevisjoner. Ingen lagringshistorikk, database, ny brukerbekreftelse eller I/O-flyt.

**Acceptance Criteria:**

**Given** et resultat beregnes fra en bestemt gjeldende vurdering
**When** siste snapshot opprettes og leses
**Then** tall, anbefaling, utløsere og tilgjengelig kontrollgrunnlag er bundet til samme objekt og finans-/liste-/TG3-/rapportrevisjoner
**And** gjeldende-status krever samsvar med aktivt grunnlag; senere mutasjon kan ikke endre det historiske snapshotets innhold. **(AC1)**

**Given** et eksisterende snapshot
**When** en finansverdi eller relevant periode/år/kilde/kostnadsinnhold faktisk endres, en korrigering brukes, et funn avvises eller rapporten erstattes
**Then** snapshotet blir umiddelbart historisk med navngitt endring og relevant kontroll-/bekreftelses-/analysebehov
**And** berørte bekreftelser følger de eksisterende handlingene fra Epic 1/2; gamle tall/anbefalinger er aldri gyldige for det endrede grunnlaget. **(AC2)**

**Given** et snapshot og registrert separat TG3-status/begrunnelse/grunnlag
**When** denne registreringen endres
**Then** forrige snapshot blir straks historisk og ny vurdering må bruke gjeldende FR-5-validering/binding
**And** uendret finans-/listebekreftelse og rapportuttrekk bevares; ingen generell nullstilling eller ny KI-analyse opprettes. **(AC3)**

**Given** et gyldig snapshot og uendret gjeldende grunnlag
**When** brukeren navigerer, velger et annet funn, redigerer bare et korrigeringsutkast eller velger Avbryt
**Then** disse handlingene alene endrer ikke gjeldende finans-/liste-/TG3-/rapportrevisjon eller gyldig bekreftelse
**And** utkastet er separat og kan opplyses som ubrukt; Avbryt fjerner det og beholder tidligere gjeldende versjon. **(AC4)**

**Given** historisk snapshot og en senere kodevurdering etter nødvendig relevant kontroll
**When** et nytt snapshot opprettes
**Then** det nye resultatet gjelder nettopp det nye grunnlaget, med bare beregnbare tall og korrekt regelprioritet også ved fortsatt mangel
**And** en gammel/sen analysegenerasjon eller ny rapport uten fullført kontroll kan ikke gjenopplive et tidligere komplett resultat. **(AC5)**

**Given** ingen tidligere beregning eller avsluttet frontendøkt
**When** resultattilstanden leses i en ny økt
**Then** den er Ikke beregnet uten oppdiktede eller gjenopprettede tall/anbefalinger
**And** kun siste snapshot i den aktive vurderingen håndteres; navigasjon er ingen varig vurderingshistorikk. **(AC6)**

**Testkrav:** Rene reducer-/selektortester av hver rad i SPEC Endring og gyldighet, AT-16, RT-3/RT-11–RT-15 og grunnlag for BT-12/BT-13. Start fra et faktisk produsert F1-snapshot; endre ett forhold om gangen og kontroller både historisk innhold, revisjonssamsvar, berørte/uendrede bekreftelser og konkret oppdateringsbehov. Test navigasjon uten mutasjon, utkast/Avbryt/Bruk, TG3-endring, ny rapport og sent svar separat, samt ny korrekt vurdering. Ingen senere resultatkomponent kreves for å teste tilstandsreglene.

### Story 3.6: Gjøre hvert nøkkeltall og beregningsgrunnlag lesbart

Som investor,
vil jeg se hvert nøkkeltalls verdi eller konkrete mangel og kunne åpne formel og inputkilder,
slik at jeg kan etterprøve økonomien uten å lese kode.

**Kravspor:** FR-12–FR-14 og nøkkeltallsdelen av FR-18; FR-1/FR-2; NFR-2; S1/S4; AD-2/AD-7/AD-9/AD-10; SPEC CAP-5 og resultatdelen av CAP-6. UX-DR7/UX-DR8/UX-DR21–UX-DR23/UX-DR25/UX-DR27–UX-DR29/UX-DR34/UX-DR35/UX-DR39/UX-DR40; metric-grid/basis-detail/detail-disclosure.

**Avhengigheter:** 3.1, 3.3 og 3.5. **Arbeidsgrense:** Faktiske gjenbrukbare resultatkomponenter for de fire tallene med tilhørende detaljseksjoner, matet fra ett konsistent snapshot og presentasjonsfunksjonene. Komponentene verifiseres direkte ved sin grense; samlet Resultat-rute/anbefaling/rapportgrunnlag kobles i 3.7. Ingen ekstra produktskjerm eller offentlig testrute opprettes for å komme videre.

**Acceptance Criteria:**

**Given** et konsistent snapshot med økonomiske resultater
**When** nøkkeltallskomponentene rendres
**Then** de fire faste navnene bruttoyield, NOI, nettoyield og kontantstrøm før skatt vises med korrekt verdi/enhet/år fra start
**And** negativt resultat beholdes, og hver utilgjengelig beregning viser Ikke beregnbart med konkrete berørte inputårsaker fremfor null/estimat/gammel verdi. **(AC1)**

**Given** beregnbare tall samtidig som kritisk grunnlag er utilstrekkelig
**When** komponentene viser resultatet
**Then** beregningene er tydelig merket Delgrunnlag
**And** rapportfeil, ubekreftet liste eller uavklart TG3 har ikke endret formlene eller gitt tallene konklusiv status. **(AC2)**

**Given** et beregnbart nøkkeltall
**When** brukeren åpner merket beregningsgrunnlag
**Then** formel, faktisk anvendte verdier/enheter/år, registrerte perioder, omregningsfaktor/årsverdier og kilder/forutsetninger er lesbare
**And** nødvendig kostnadsinnhold og D/J-fordeling er kontrollerbar uten kodeinnsyn eller doble fratrekk. **(AC3)**

**Given** tall nær yield-/nullgrensen
**When** standardformat ville skjult et brudd
**Then** nødvendig terskelforklaring og presis detalj fra 3.3 kan leses ved det berørte nøkkeltallet
**And** hovedanbefalingen vil senere kunne forklares uten å basere seg på den avrundede verdien. **(AC4)**

**Given** detaljseksjonene i åpen/lukket tilstand
**When** de betjenes og leses
**Then** merkede standardkontroller støtter tastatur, synlig fokus og tilgjengelig åpen/lukket-tilstand; skjult innhold er ikke i fokusrekkefølgen
**And** DESIGNs tokens/typografi/kontrast og tekstlige statusetiketter brukes også for delgrunnlag og historisk innhold. **(AC5)**

**Testkrav:** Direkte render-/komponentgrensekontroll med faktiske finans-/presentasjons-/snapshotdata for BT-1/BT-3–BT-6/BT-8/BT-11/BT-15/BT-17/BT-18: fire navn, verdier/enheter/år, Ikke beregnbart/årsaker, Delgrunnlag og komplette formel-/kildedetaljer. Kontroller detaljåpning/lukking og semantisk tilstand ved komponentgrensen uten å være avhengig av 3.7 eller et betalt API. Ikke speil formatterimplementasjonen i forventningsverdiene. Samlet plassering, zoom, fokusflyt og forståelse kontrolleres dessuten i den bygde appen i 3.7.

### Story 3.7: Vise ett samlet screeningresultat med kontrollgrunnlag

Som investor,
vil jeg se én anbefaling og de avgjørende tallene, funnene og manglene samlet,
slik at jeg forstår neste handling og kan kontrollere grunnlaget ved behov.

**Kravspor:** FR-16–FR-18, FR-8–FR-11 og resultatdelen av FR-5/FR-12–FR-14; NFR-1/NFR-2/NFR-3; S3/S4 og demoens grunnlag for S6; AD-2/AD-6–AD-10; SPEC CAP-6/CAP-7/CAP-8 med CAP-3/CAP-4/CAP-5. UX-DR1–UX-DR4/UX-DR7/UX-DR12/UX-DR13/UX-DR16–UX-DR26/UX-DR27–UX-DR29/UX-DR32–UX-DR36/UX-DR38–UX-DR41; Resultat og Key Flows 1/4.

**Avhengigheter:** 2.7, 2.11, 3.4, 3.5 og 3.6. **Arbeidsgrense:** Første samlede Resultat i den eksisterende firetrinnsflyten: anbefalingsvisning, gjenbruk av nøkkeltallskomponenter, rapport-/opphavsdetaljer, historisk vern og returhandlinger. Fornyelse etter faktiske endringer fullføres i 3.8/3.9; vernet fra 3.5 gjelder allerede her. Ingen ny omvei som hopper over kontrolltrinn.

**Acceptance Criteria:**

**Given** hovedreisen har nådd Resultat etter nødvendig kontroll
**When** gjeldende snapshot vises
**Then** én kodebestemt anbefaling og kort grunn ligger øverst, med avgjørende prioritet/utløsere og konkret neste handling
**And** fire nøkkeltall, alvorlige tekniske funn og alle faktiske mangler/uavklarte forhold er synlige fra start; hovedutfallet kan forstås uten detaljåpning. **(AC1)**

**Given** et resultat med rapportgrunnlag
**When** brukeren undersøker det tilgjengelige grunnlaget
**Then** alle aktive TG2/TG3 med grad/beskrivelse/dokument/PDF-side, originalrapporten, opprinnelig KI-uttrekk og brukerrettinger/avviste originaler er tilgjengelige
**And** alvorlig TG3 og separat brukerstatus vises tydelig; avklaringsbegrunnelse/grunnlag og øvrige opphavsdetaljer åpnes ved behov med bevart skille mellom rapportfunn, brukeropplysning, kontroll og kodeutfall. **(AC2)**

**Given** kritiske mangler, dokument-/analysefeil eller ufullført kontroll er representert i beslutningsgrunnlaget
**When** et delresultat vises innen eksisterende navigasjonsregler
**Then** Innhent mer informasjon samler alle faktiske avgjørende blokkere med berørt grunnlag og nødvendig handling, mens gyldige tall merkes Delgrunnlag
**And** feil forsvinner ikke bak tomliste/tall; lokale feilmeldinger kopieres ikke i fulltekst, og problemtrinnet gir fortsatt egen lokal forklaring uten påtvunget resultatbesøk. **(AC3)**

**Given** ingen resultatberegning eller avvik mellom siste snapshot og aktivt grunnlag
**When** Resultat eller historisk resultat leses
**Then** Ikke beregnet viser nødvendig kontroll uten oppdiktet anbefaling, mens tidligere snapshot er lesbart med Utdatert/Må bekreftes på nytt og konkret oppdateringsbehov
**And** historiske tall/funn/anbefaling blandes ikke med nye verdier som ett gjeldende resultat; eksisterende ubrukt utkast opplyses uten å brukes. **(AC4)**

**Given** gjeldende resultat i lokal demo
**When** brukeren leser anbefalingen og velger Endre tallgrunnlag eller Gå tilbake til rapportfunn
**Then** modus er fortsatt tydelig Demo · lagret KI-uttrekk, retur bevarer gyldige data/kontroller og starter ingen analyse
**And** anbefaling/regeltekst/neste handling kommer fra samme kode som senere live, uten score, markedsverdi, juridisk vurdering, kjøpsbeslutning eller ekstern handling. **(AC5)**

**Given** Resultat i normal, delvis, historisk eller detaljåpnet tilstand
**When** den brukes med tastatur og ved relevante desktop-størrelser/zoom
**Then** sticky trinn/status, leserekkefølge, returfokus på trinnoverskrift, detaljkontroller, tekstlige etiketter og kontrast følger final UX
**And** viktige gyldighetsskifter kunngjøres kort én gang uten fokusstjeling; alvorlige forhold og neste handling skjules ikke av layout, fargebruk eller detaljseksjoner. **(AC6)**

**Testkrav:** Playwright på bygget app med ekte kontrollerte PDF-/adapterdata for F1 Gå videre, F2 Forkast og F4 Innhent mer informasjon etter fullført kontroll med fortsatt Uavklart TG3. AT-17 og UI-delene av AT-1/AT-2/AT-7/AT-9/AT-13/AT-18: kontroller hovedhierarki, alle avgjørende forhold, tilgang til aktive/avviste/originale funn og korrekt originalside via eksisterende kontrollflate. Tilstander som ikke kan nås gjennom normal hovedreise testes ved komponent-/tilstandsgrensen, uten ny produktsnarvei. Manuell test av de tre anbefalingene, tastatur/fokus, detail-disclosure, etiketter, kontrast og zoom mot final UX. Eksternt nett/nøkkel skal ikke kreves etter installasjon; ingen betalt API i E2E.

### Story 3.8: Oppdatere resultat etter endret og bekreftet finansgrunnlag

Som investor,
vil jeg endre tall eller avkastningskrav, kontrollere endringen og få et nytt lokalt resultat,
slik at jeg kan revidere førstevurderingen uten å analysere samme rapport på nytt.

**Kravspor:** FR-1–FR-4/FR-13/FR-15–FR-18 og gjenbruksdelen av FR-6; NFR-1/NFR-2/NFR-3; S1/S3/S4; AD-2/AD-6–AD-10; SPEC CAP-7/CAP-8 med CAP-1/CAP-5/CAP-6 og finansraden i Endring og gyldighet. UX-DR2/UX-DR4–UX-DR9/UX-DR20–UX-DR26/UX-DR32–UX-DR36/UX-DR38/UX-DR40/UX-DR41; Key Flow 3.

**Avhengigheter:** 1.7, 3.5 og 3.7. **Arbeidsgrense:** Koble eksisterende finansretur, berørt bekreftelse og ny kodeberegning til resultatets faktiske fornyelse. Ingen ny bekreftelsestype, ekstra produktskjerm, finansregel eller analysehandling. Ny beregning følger eksisterende kontroll/fremovernavigasjon.

**Acceptance Criteria:**

**Given** et gjeldende F1-resultat
**When** brukeren faktisk endrer et finansfelt eller relevant periode/år/kilde/kostnadsinnhold
**Then** berørt bekreftelse oppheves og tidligere resultat blir straks lesbart historisk med navngitt kontrollbehov
**And** endringen brukes ikke som gyldig beregningsgrunnlag før relevant ny kontroll/bekreftelse. **(AC1)**

**Given** endret P/L/D/J med gyldig ny bekreftelse
**When** brukeren fullfører eksisterende resultatflyt
**Then** berørte nøkkeltall og anbefaling beregnes fra gjeldende årsgrunnlag og bindes til nytt snapshot
**And** eksempelvis L fra F1 til F2 gir F2-tall og Forkast; gammel F1-anbefaling står ikke som gjeldende. **(AC2)**

**Given** bare Ymin endres, eller manglende Ymin registreres og bekreftes som 10 %
**When** nytt resultat dannes
**Then** de fire nøkkeltallene forblir identiske med samme P/L/D/J, mens screening bruker det nye kravet
**And** manglende/ubekreftet Ymin gir Innhent mer informasjon, mens fullstendig F1-grunnlag med bekreftet 10 % gir Forkast. **(AC3)**

**Given** uendret rapport med tidligere kontrollstatus, mangler og eventuelle TG3-avklaringer
**When** finansgrunnlaget endres og resultatet oppdateres
**Then** rapportuttrekk og fortsatt gyldig rapportkontroll gjenbrukes uten ekstra adapter-/KI-kall
**And** rapportfeil eller uavklart alvorlig TG3 består som prioritet 1 selv ved nye sterke eller svake økonomiske tall. **(AC4)**

**Given** offline demo og et eksisterende resultat
**When** brukeren returnerer uten endring, gjør et ugyldig bekreftelsesforsøk eller senere retter/bekrefter gyldig endring
**Then** uendret retur bevarer resultatets gyldighet, mens ugyldig endring gir lokale feltfeil og historisk forrige resultat til nødvendig ny kontroll er fullført
**And** retting/fornyelse fungerer uten eksternt nett eller API-nøkkel, med synlig status/fokus og uten generell nullstilling av uendret grunnlag. **(AC5)**

**Testkrav:** Bygget-app-forløp BT-12/BT-13 og finansvariantene i AT-10/AT-11/AT-14/AT-16, samt F4→endret økonomi som fortsatt gir prioritet 1. Kontroller før/etter-revisjoner, korrekt relevant bekreftelse, alle avhengige tall, Ymin-endring uten tallendring og adapterkalltall uendret. Dekning av periode/kilde/kostnadsendring og uendret navigasjon bygger på rene overgangstester fra 3.5; UI-testene verifiserer faktisk handling/status/resultat. Test ugyldig→rettet→bekreftet også med eksternt nett sperret, og gjør relevant manuell fokus-/feil-/gyldighetskontroll.

### Story 3.9: Oppdatere resultat etter rapportkontroll og separat TG3-endring

Som investor,
vil jeg kunne rette rapportfunn, endre TG3-avklaring eller velge ny rapport med korrekt ny resultatstatus,
slik at kontrollarbeid og ubrukte utkast aldri gir et misvisende gjeldende resultat.

**Kravspor:** FR-5/FR-6/FR-8–FR-11/FR-13/FR-16–FR-18; NFR-1/NFR-2/NFR-3; S3/S4; AD-2/AD-4/AD-6/AD-8–AD-10; SPEC CAP-7 med CAP-2/CAP-3/CAP-4/CAP-6/CAP-8 og rapport-/utkast-/TG3-radene i Endring og gyldighet. UX-DR2/UX-DR4/UX-DR10–UX-DR19/UX-DR20/UX-DR22–UX-DR26/UX-DR32–UX-DR36/UX-DR38–UX-DR41; Key Flows 2/3/4.

**Avhengigheter:** 2.6, 2.8, 2.9, 2.10, 2.11, 3.5 og 3.7. **Arbeidsgrense:** Koble eksisterende rapport-/funn-/TG3-handlinger til resultatets fornyelse og nødvendige kontrollretur. Gjenbruk snapshotvern og felles anvendbarhetsvalidering; ingen ny semantisk KI-kontroll, avklaringshandling, automatisk retry eller overføring av avklaring til annet rapportforhold.

**Acceptance Criteria:**

**Given** gjeldende resultat og et korrigeringsutkast
**When** brukeren redigerer, bytter funn/trinn, ser Resultat eller velger Avbryt
**Then** utkastet bevares ved retur og opplyses som ubrukt på Resultat uten å påvirke tall, gjeldende liste, anbefaling eller fortsatt gyldige bekreftelser
**And** Avbryt fjerner utkastet og beholder forrige gjeldende versjon; ingen KI-/adapterkall gjøres. **(AC1)**

**Given** gjeldende resultat
**When** brukeren velger Bruk korrigering eller avviser et feilaktig KI-funn
**Then** tidligere resultat blir straks historisk; brukt korrigering krever nødvendig ny enkeltfunn-/listekontroll, og avvisning krever ny listebekreftelse med originalen tilgjengelig
**And** ny screening etter relevant kontroll bruker gjeldende aktive liste uten nytt KI-kall; en avvisning regnes ikke som teknisk TG3-avklaring. **(AC2)**

**Given** et resultat med alvorlig TG3 og ellers uendret bekreftet grunnlag
**When** registrert TG3-status, begrunnelse eller grunnlag endres
**Then** tidligere anbefaling er umiddelbart historisk, og kodevurderingen bruker gjeldende separate registrering etter FR-5
**And** uendrede tall og liste beholder bekreftelsen; Uavklart/ukjent/ugyldig Avklart gir Innhent mer informasjon, mens gyldig Avklart bare fjerner den aktuelle mangelen og lar øvrige regler avgjøre. **(AC3)**

**Given** tidligere TG3-avklaring og en brukt funnkorrigering
**When** ny kontroll og screening vurderer avklaringens anvendbarhet
**Then** felles validering fra 2.10 kan bevare den ved representasjons-/kilderetting av samme rapportforhold, mens kjent motstrid eller ukjent tilhørighet gir utilstrekkelig grunnlag
**And** stabil findingId alene overfører ikke avklaringen; original, brukerretting og avklaringsgrunnlag er fortsatt tilgjengelige uten ny UX-handling eller teknisk godkjenning. **(AC4)**

**Given** et eksisterende resultat og eventuelt ventende analyseforløp
**When** brukeren erstatter rapporten
**Then** gammelt resultat er historisk og gammel rapports uttrekk/kontroll/TG3-avklaringer gjelder ikke ny rapport; ny eksplisitt analyse og rapportkontroll kreves
**And** gammelt/sent svar kan ikke gjenopprette tidligere resultat eller fullføre den nye rapporten; feil i den nye analysen forblir synlig utilstrekkelig grunnlag. **(AC5)**

**Given** en endret rapport-/kontroll-/TG3-tilstand med nødvendig relevant håndtering fullført
**When** resultatflyten gir et nytt snapshot
**Then** alle tall, aktive funn, kilder, avklaringer, utløsere og anbefaling gjelder samme nåværende grunnlag, også ved fortsatt prioritet 1
**And** lokale feil, bevart kontekst og tekstlig gyldighetsstatus følger UX uten KI-kall for kontrollendringer; bare ny rapport gir det nye eksplisitte analysebehovet. **(AC6)**

**Testkrav:** Bygget-app-forløp for rapport-/funn-/TG3-variantene i AT-16, AT-7–AT-9/AT-13/AT-20, RT-3/RT-11–RT-15 og de sju FR-5-eksemplene ved relevante grenser. Verifiser utkast→Resultat→retur→Avbryt kontra Bruk, avvisning/ny listebekreftelse, hver TG3-tekst/statusendring uten ny finans-/listebekreftelse og gyldig/ukjent forholdsbinding. Kontroller at uavklart TG3 kan beholdes etter fullført kontroll. Test rapportbytte med kontrollert sent svar og ny feil/fullført analyse; assert antall adapterkall, aktive revisjoner og originalbevaring. Testkall går til kontrolladapter med ekte fixtures, aldri betalt API. Manuell kontroll av retur/fokus, lokale feltfeil og forståelig historisk/gjeldende skille; full S5/S6-evaluering gjenstår i sine epics.

## Epic 3: dekningskontroll til gjennomgangen

| Krav / beslutning | Planlagt storydekning |
|---|---|
| FR-12 | 3.1 alle fire formler, eksakt årsgrunnlag, negative resultater og ingen nye fratrekk; 3.3 prosent/NOK-format; 3.6 formel-/inputvisning. |
| FR-13 | 3.1 per-metrikk inputgyldighet/konkrete mangler; 3.4 prioritet over økonomiske delresultater; 3.6/3.7 Ikke beregnbart/Delgrunnlag og synlige rapportfeil. |
| FR-14 | 3.1 bevarer eksakt input/formelgrunnlag; 3.2 eksakte terskler; 3.3 separat visning/ekstra presisjon; 3.6/3.7 tilgjengelige formler/input/kilder/terskelforklaring. |
| FR-15 | 3.5 snapshot/berørt ugyldiggjøring; 3.8 faktisk ny kontroll/finansberegning/resultat uten rapportkall; Ymin endrer bare screening. |
| FR-16 | 3.4 full én-autoritetsscreening/prioritet 1–3/alle utløsere; 3.2 likhet uten margin; 3.7 synlig anbefaling; 3.8/3.9 nytt gjeldende resultat. |
| FR-17 | 3.4 faste begrunnelser/neste handling uten KI; 3.3 skjult terskelbrudd; 3.7 kort hovedgrunn/all avgjørende informasjon; 3.8/3.9 oppdatering. |
| FR-18 | 3.5 konsistent snapshot; 3.6 nøkkeltall og detaljåpning; 3.7 samlet hierarki/opphav/aktive funn/avviste originaler/feil; 3.8/3.9 gjeldende/historisk skille. |
| FR-1–FR-4 / FR-5/FR-6/FR-8–FR-11 | Gjenbruk av godkjent grunnlag/kontroller, ingen regelendring. 3.6/3.7 synlig spor, 3.8 finansretur, 3.9 rapport-/kontroll-/TG3-retur med korrekt bevaring/ugyldiggjøring. |
| NFR-1 | 3.1–3.5 rene deterministiske grenser og endringstester; 3.7–3.9 faktisk konsistent visning, ny kontroll, gjenbruk og vern mot gamle svar. |
| NFR-2 / UX-DR20–UX-DR29/UX-DR34–UX-DR36/UX-DR38–UX-DR41 | 3.3 format; 3.6/3.7 tilgjengelige resultatkomponenter/hierarki/detaljer/status/retur; 3.8/3.9 fokus/lokale feil/gyldighet ved endring. Tidligere tokens og PDF-panel gjenbrukes. |
| NFR-3 / CAP-8 | 3.7 hele merket demo-UJ-1 med tre anbefalinger; 3.8/3.9 lokal oppdatering uten eksternt nett/nøkkel. Full README-/annen-person-verifikasjon i Epic 5; ekte KI fortsatt Epic 4. |
| S1 / AD-7 / CAP-5 | 3.1/3.2/3.3 separate beregnings-/terskel-/formatkontroller mot uavhengig BT-fasit; 3.6/3.8 kontrollerbar visning og finansoppdatering. |
| S3 / AD-8 / CAP-6 | 3.4 komplett logikk med alle AT-regelvarianter og FR-5-eksempler; 3.7–3.9 resultat-/endringsintegrasjon og samme kodeautoritet. |
| S4 / AD-2 / CAP-7 | 3.1/3.5 bevarer eksakt opprinnelse/snapshot; 3.6/3.7 tilgjengelig formel-/kilde-/funngrunnlag; 3.8/3.9 korrekt ny kontroll, ubrukt utkast og forholdsbundet TG3. |
| AD-1/AD-6/AD-9/AD-10 | Rene moduler og separate presentasjonsfunksjoner, ingen backend-finans, samme demo/live-regler, logikknære tester og bygget-app-/manuell kontroll ved relevante leveranser. |

Normal videregang kan fortsatt være sperret ved utilstrekkelig grunnlag. Ingen test eller resultatflate innfører en snarvei rundt låst navigasjon. Ikke-nåbare tilstandsvarianter kan verifiseres ved rene modul-/reducer-/komponentgrenser. NFR-5s analyse-/kontrollmålepunkter endres ikke; det innføres ingen timer/telemetri. Faktiske S2/S5/S6-bevis, leverandør-/modell-/budsjettvalg og konkrete live-timeouter gjenstår i senere avtalt arbeid.

## Gjennomgang og videreføring

Gjennomgangen er avsluttet med Mads’ C-godkjenning av 3.1–3.9 og videreføring til Epic 4. Storytekstene er kopiert uendret til epics.md og godkjenningsstatusen er registrert. Den fullstendige storygrafen og gjennomførbarheten kontrolleres ved ferdig oppdeling/readiness før kodearbeid; godkjenningen er ikke implementeringsstart eller en påstand om beståtte produkttester.
