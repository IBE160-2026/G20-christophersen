---
title: "Epic 4: storyforslag til gjennomgang"
created: 2026-10-15
status: approved-and-incorporated
workflow: bmad-create-epics-and-stories
step: step-03-create-stories
epic: 4
stories: ["4.1", "4.2", "4.3", "4.4", "4.5"]
approvedStories: ["4.1", "4.2", "4.3", "4.4", "4.5"]
---

# Storyforslag — Epic 4

Mads godkjente story 4.1–4.5 med C. Alle fem, med gjennomføringsporten, er innarbeidet uendret i [epics.md](../../planning-artifacts/epics.md), som nå har 32 godkjente stories fra Epic 1–4. Denne filen bevarer gjennomgangsforslaget og dets dekningskontroll som prosesshistorikk. Epic 5 behandles videre i workflowens steg 3. Ingen implementering er startet; implementation readiness følger etter ferdige stories for alle fem epics. Godkjenningen velger ingen leverandør/modell/budsjett/timeout og autoriserer ingen betalte kall.

## Kildeindeks og leseregel

- [PRD](../../planning-artifacts/prds/prd-IBE160-2026-10-10/prd.md): FR-6–FR-11, gjenbruk/samme regler i FR-15–FR-18, NFR-1–NFR-5 og S2/S5 med K1/K2. [PRD-addendum](../../planning-artifacts/prds/prd-IBE160-2026-10-10/addendum.md): RT-1–RT-19, relevante AT-varianter, hele S5-protokollen og TT-1–TT-9.
- [Brief-addendum](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/addendum.md): F1–F4 og uavhengig dokumentfasit, Kontroll mot dokumenter og KI-feil samt Kjørbarhet, kostnader og repo. [Faglærerens gjeldende oppfølging](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/revisjonskontroll-2026-10-08.md) viderefører smal v1 og tid til testing/retting.
- [DESIGN](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/DESIGN.md) og [EXPERIENCE](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md): eksisterende modus-/analyse-/feiltilstander, lokale mangler, originalkontroll og Key Flows 1–4. UX-DR er eksisterende indeks i epics.md.
- [ARCHITECTURE-SPINE](../../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md): AD-3–AD-6/AD-9/AD-10, med AD-2/AD-7/AD-8 for uendret kontroll-/resultatflyt; hele Deferred gjelder.
- [SPEC](../../specs/spec-IBE160/SPEC.md), [grensekontrakter](../../specs/spec-IBE160/grensekontrakter.md), [sporbarhet](../../specs/spec-IBE160/sporbarhet.md) og [verifikasjon/avklaringer](../../specs/spec-IBE160/verifikasjon-og-avklaringer.md): CAP-2/CAP-8, Dokument- og analysegrense, S2/S5 og videreførte avklaringer.

Faktisk KI-basert analyse inngår i v1. Demo er alternativ kjøreform for sensor/testing uten nøkkel og erstatter ikke live-leveransen. Fulltekstkrav og adopterte kompanjonger gjelder. Test-/evalueringskravene nedenfor er planlagt arbeid, ikke faktiske resultater. Ingen ny leverandørplattform, flermodellstyring, kostnadsmåler, timer/telemetri, konfigurasjonsskjerm eller produktfunksjon innføres.

## Epic 4: Live KI-analyse og evaluering

Investoren kan eksplisitt starte én faktisk KI-analyse av en ny støttet rapport og kontrollere resultatet i den allerede leverte flyten. Gruppen kan dokumentere opprinnelig live-kvalitet og faktisk behandlingstid mot låste mål, atskilt fra demo, rettinger og rene finans-/regeltester.

### Gjennomføringsport før implementering

Mads + live-integrasjon avklarer og dokumenterer leverandør, eksakt modell/SDK, kontekst-/outputkapasitet, datert prisgrunnlag, prosjektbudsjett/beregnet testkostnad og konkrete leverandør-/live-timeouter før berørt implementering og før betalte tester. Dette viderefører brukerens presisering og arkitekturens Deferred; ingen verdier velges gjennom denne storygodkjenningen. Valget skal håndtere hele det støttede sidemerkede grunnlaget i ett kall uten skjult avkorting/retry. Dersom dette krever endring av låst støtte, kontrakt eller arkitektur, må Mads spørres først.

PDF-lesbarhet i 2.3 og upload-/HTTP-ressurser/opprydding i 2.5 beholder sine tidligere avklaringspunkter. De utsettes ikke til denne epicen. Live-integrasjonen må passe disse grensene. S5s medianmål er ingen hard femminutters timeout. Budsjett/kostnad følges som gjennomføringsdokumentasjon; ingen ny appfunksjon for betaling eller budsjetthåndheving bestilles.

| Story | Avgrenset leveranse | Direkte forutsetninger |
|---|---|---|
| 4.1 | Lokal live-konfigurasjon og valgt leverandørklient med trygg nøkkelgrense | 1.2, 2.4, 2.5 |
| 4.2 | Produksjonsadapter som analyserer hele rapportgrunnlaget i ett KI-kall | 2.1, 2.3, 4.1 |
| 4.3 | Live gjennom samme HTTP-/kontroll-/resultatflyt med trygge feil | 2.5, 2.6, 3.7, 3.8, 3.9, 4.1, 4.2 |
| 4.4 | Faktiske live-kjøringer og S2-evaluering av originaluttrekket | 2.2, 4.2, 4.3 |
| 4.5 | S5-måling av live/kontroll og sammenligning med manuell referanse | 4.3, 4.4 |

4.1–4.3 er separate konfigurasjons-, adapter- og appintegrasjonsleveranser med kontrollerte tester uten betalt API. 4.4 leverer faktisk live-bevis og S2-vurdering; 4.5 leverer tidsbevis etter den låste protokollen. Gyldige måledata kan gjenbrukes dersom alle nødvendige hendelser faktisk er registrert, ellers kreves planlagte nye forsøk innen avklart budsjett. Ingen tidligere story avhenger av en senere evaluering for sin avgrensede modul-/integrasjonsverifikasjon. Hele v1 kan ikke erklæres verifisert fra disse offline-testene alene.

### Story 4.1: Konfigurere valgt live-leverandør uten å eksponere nøkkelen

Som utvikler,
vil jeg koble valgt leverandørklient til eksplisitt lokal backendkonfigurasjon,
slik at live kan brukes innen avklart ramme og demo fortsatt kan kjøres uten nøkkel.

**Kravspor:** FR-6 og konfigurasjons-/feilgrunnlag for FR-9; NFR-3/NFR-4 og kallstabilitet i NFR-1; AD-1/AD-5/AD-6/AD-9/AD-10 og Deferred; SPEC CAP-2/CAP-8 og Dokument- og analysegrense. UX-DR1/UX-DR11/UX-DR24/UX-DR25/UX-DR37/UX-DR40 konsumerer trygg modus-/feilmetadata; ingen ny brukerflate leveres her.

**Avhengigheter:** 1.2, 2.4 og 2.5. **Avklaringspunkt:** Gjennomføringsporten ovenfor må være løst av Mads + live-integrasjon før Epic 4 implementeres. **Arbeidsgrense:** Én valgt leverandørklient, backendens konfigurasjonsvalidering, eksplisitt modusvalg og trygg konstruksjon/feilgrense. Ingen analyseprompt, flerleverandørrammeverk, nøkkelfelt i UI eller automatisk modellvalg.

**Acceptance Criteria:**

**Given** dokumentert valgt leverandør/modell/SDK og avklart kapasitet, pris/budsjett og timeoutgrunnlag
**When** live-konfigurasjonen tas i bruk
**Then** de avklarte verdiene brukes eksplisitt i backend, og detaljene er sporbare uten hemmeligheter
**And** hele støttede rapportgrunnlag er omfattet av kapasitets-/testvurderingen; ingen ressursverdi innfører skjult avkorting eller endret 30-sidersscope. **(AC1)**

**Given** standard demo eller manglende live-nøkkel
**When** den lokale appen startes i demo
**Then** den eksisterende demo-adapteren brukes uten at en KI-klient opprettes eller en live-nøkkel kreves
**And** manglende/ugyldig live-konfigurasjon gir ved live-bruk en trygg kjent feil uten betalt kall eller skjult fallback. **(AC2)**

**Given** eksplisitt lokal live-konfigurasjon
**When** backend oppretter leverandørklienten
**Then** nøkkel og leverandørkall forblir i backend, og automatisk SDK-retry er slått av
**And** frontend mottar bare trygg modusmetadata; nøkkelen inngår ikke i build, API-svar, logger/feil, demo, fixtures eller dokumentasjon. **(AC3)**

**Given** avklarte leverandør-/live-timeouter og eksisterende upload-/HTTP-ressursgrenser
**When** klientens tids-/avbruddsinnstillinger integreres
**Then** de er eksplisitte, forenlige med det ene HTTP-forløpet og kan testes med kontrollert transport
**And** S5s medianmål tolkes ikke som hard timeout, og klientavbrudd lover ikke at leverandørkjøringen eller kostnaden har stoppet. **(AC4)**

**Given** fiktiv testnøkkel og ugyldige konfigurasjonsvarianter
**When** konfigurasjon, oppstart og feilgrenser kontrolleres
**Then** kjente mangler kan forstås uten å røpe nøkkel eller private dokumentdata
**And** ingen test eller oppstart foretar et uannonsert leverandørkall. **(AC5)**

**Testkrav:** Vitest/integrasjon for standard demo uten nøkkel, gyldig valgt live-konfigurasjon, manglende/ugyldige påkrevde verdier og trygg feilmetadata. Bruk fiktiv nøkkel og nett sperret; kontroller faktisk bygget frontend/oppstartsmetadata og testutdata for lekkasje, samt null klientopprettelser i demo. Klientens retry-/timeoutoppsett kontrolleres her; faktisk antall transportforsøk ved leverandørfeil verifiseres med den valgte klienten i 4.2. Dette er konfigurasjonsverifikasjon, ingen live-/S2-/S5-påstand.

### Story 4.2: Analysere hele det sidemerkede rapportgrunnlaget i ett KI-kall

Som investor,
vil jeg at live-adapteren trekker ut rapportens eksplisitte TG2/TG3 med kilder og synlig usikkerhet,
slik at jeg får et faktisk KI-uttrekk som kan kontrolleres mot originalen.

**Kravspor:** FR-6/FR-7/FR-8/FR-9; NFR-1/NFR-4; uttrekksgrunnlag for S2/S4; AD-1/AD-3–AD-6/AD-9/AD-10; SPEC CAP-2/CAP-8 og sidemerket grunnlag/analyseutfall/opprinnelig uttrekk. UX-DR7/UX-DR11–UX-DR13/UX-DR24/UX-DR25/UX-DR40 er konsumenter i eksisterende UI.

**Avhengigheter:** 2.1, 2.3 og 4.1. **Arbeidsgrense:** Den faktiske valgte leverandør-/modellimplementasjonen bak eksisterende smale adapter, med versjonert prompt og mapping til felles kontrakt. Kontrollerte tester bruker den valgte klientens transportgrense. Faktiske betalte kjøringer/evaluering utføres i 4.4; de erstattes ikke med testsvar.

**Acceptance Criteria:**

**Given** et støttet og validert sidemerket dokumentgrunnlag
**When** live-adapteren kalles én gang
**Then** den valgte reelle leverandørklienten får hele grunnlaget med alle PDF-posisjoner samlet i ett KI-analysekall
**And** ingen side, tekst eller funnoppgave avkortes eller filtreres etter relevans; ingen ekstra kall, skjult fallback eller automatisk retry gjøres. **(AC1)**

**Given** versjonert uttrekksoppgave
**When** prompt og leverandørforespørsel bygges
**Then** oppgaven omfatter alle eksplisitte TG2/TG3 med kort trofast beskrivelse og PDF-side, uten å sette nye grader eller gjette hull
**And** reparasjonsestimat, finansinput/-beregninger, anbefaling, markeds-/juridisk analyse og andre dokumenttyper er ikke analyseoppgaver; rapporten endrer ikke P/L/D/J/Ymin. **(AC2)**

**Given** et leverandørsvar med funn, uklar grad/kilde/side eller forsøkt endret korrelasjonsmetadata
**When** returen mappes og valideres
**Then** felles contracts er appautoritet, og backend beholder kodebestemt requestId/reportHash/modus/dokumentidentitet/sideantall
**And** ukjent/umulig kilde eller grad bevares som eksplisitt usikkerhet/kandidat med opphav etter kontrakten, aldri gjettet gyldig eller brukerbekreftet rapportfaktum. **(AC3)**

**Given** fullført svar med findings: [], manglende/ugyldig svar eller kjent avbrutt/ufullstendig output som separate varianter
**When** terminalt utfall bygges
**Then** bare faktisk fullført, kontraktgyldig analyse kan bli completed, også ved gyldig tomliste
**And** blant annet kjent avkorting, leverandøravslag og manglende terminalt grunnlag gir analysefeil med trygg kjent årsak og eventuelt merkede delresultater; de blir ikke vellykket tomliste. **(AC4)**

**Given** leverandør-/transportfeil, timeout eller klientavbrudd
**When** den valgte klienten og adapteren avslutter forsøket
**Then** antall påbegynte modellforespørsler økes ikke av SDK-retry eller en intern omkjøring
**And** feil mappes til felles trygg analysefeil uten hemmeligheter eller falsk fullføring; eksisterende duplikatsperre/opprydding kan anvendes av HTTP-laget. **(AC5)**

**Given** samme kontraktgyldige uttrekksdata fra demo eller live
**When** dataene leveres videre
**Then** det brukes samme kontroll-/kilde-/TG3-/finans-/screeninggrunnlag etter retur, med eksplisitt riktig modus
**And** strukturvalidering beskrives ikke som bevis for korrekt semantisk uttrekk, brukerens bekreftelse eller bestått S2. **(AC6)**

**Testkrav:** Adapter-/transportintegrasjon uten betalt API: faktisk sidemerket uttrekk fra PDF-fixtures, inklusive 30 sider, skal nå den valgte klienten komplett og i riktig sidebinding. Kontroller promptens avgrensning og mapping med kjente RT-5/RT-6/RT-7/RT-9/RT-10/RT-19-svar, ufullstendig output, manglende felter/terminalstatus og identitetsoverskriving. Bruk kontrollert transport for leverandørfeil som ratebegrensning, serverfeil og timeout og tell faktiske transportforsøk, ikke bare verdien på en retry-innstilling. Verifiser felles schemas, bevart usikkerhet og uendrede finansverdier. Faktisk modelltreff og behandlingstid verifiseres separat i 4.4/4.5.

### Story 4.3: Bruke live-analysen i samme kontroll- og resultatflyt

Som investor,
vil jeg kunne starte live-analyse og kontrollere funnene i den samme appflyten som demo,
slik at reelle svar og feil får riktig status uten ekstra analyse ved kontrollendringer.

**Kravspor:** FR-6–FR-11/FR-15–FR-18 og separat FR-5-kontroll; NFR-1–NFR-4 og hendelsesgrunnlag for NFR-5; S3/S4; AD-2–AD-10 ved relevante grenser; SPEC CAP-2/CAP-8 med gjenbrukt CAP-3/CAP-4/CAP-6/CAP-7 og Dokument- og analysegrense. UX-DR1/UX-DR10/UX-DR11/UX-DR24/UX-DR25/UX-DR33/UX-DR36–UX-DR38/UX-DR40/UX-DR41; eksisterende analyse-/feil-/kontrollflyt.

**Avhengigheter:** 2.5, 2.6, 3.7, 3.8, 3.9, 4.1 og 4.2. **Arbeidsgrense:** Koble valgt produksjonsadapter til eksisterende backendkomposisjon/HTTP-forløp og verifisere live-modus i ferdig frontendflyt. Ingen ny skjerm, analyseknapp, regelmotor, jobbtilstand eller gjenopptaksmekanisme. Automatisert E2E bruker kontrolladapter ved samme grense, aldri betalt API.

**Acceptance Criteria:**

**Given** gyldig lokal live-konfigurasjon, bekreftet tallgrunnlag og støttet rapport
**When** brukeren eksplisitt velger Start analyse
**Then** det eksisterende POST-forløpet bruker produksjonsadapteren og viser Live analyse/Analyserer frem til gyldig terminalt utfall
**And** dobbeltstart/duplikat med ny requestId eller generasjon gir ingen ny modellforespørsel; backendmarkøren settes før adapterkall og beholdes til serverstopp, også etter klientavbrudd. **(AC1)**

**Given** et fullført validert live-uttrekk som matcher aktiv økt/rapport/forespørsel/generasjon
**When** listen blir synlig
**Then** alle returnerte aktive funn og usikkerheter er tilgjengelige med originalside og samme kontroll-/utkast-/avvisnings-/liste-/TG3-handlinger som demo
**And** ferdig analyse eller enkeltfunnkontroll har ikke automatisk bekreftet listen eller avklart alvorlig TG3. **(AC2)**

**Given** manglende live-konfigurasjon, leverandørfeil, timeout, ugyldig/ufullstendig svar eller kildeusikkerhet
**When** feilen/mangelen når brukerflyten
**Then** kjent årsak og ufullstendighet vises trygt i aktuelt trinn med kodebasert Innhent mer informasjon og nødvendig handling
**And** ingen automatisk omkjøring, demo-fallback, vellykket tomliste eller konklusivt økonomisk resultat skjuler feilen; nødvendig ressursopprydding følger det faktiske forløpet. **(AC3)**

**Given** ferdig live-uttrekk og kontrollstatus
**When** brukeren endrer finansgrunnlag, korrigerer/avviser funn eller registrerer TG3-endring
**Then** uendret rapportuttrekk gjenbrukes uten nytt adapter-/KI-kall, med relevant ny kontroll og korrekt historisk/gjeldende resultat
**And** samme effektive grunnlag gir identiske finansresultater, regelutfall, begrunnelse og neste handling som i demo; Live analyse-merkingen beholdes. **(AC4)**

**Given** en ventende eller tidligere fullført live-analyse
**When** rapporten erstattes eller pågående analyse forlates
**Then** generasjons-/identitetsvernet avviser gammelt/sent svar, og ny rapport krever ny eksplisitt analyse/kontroll
**And** tidligere bekreftelser/TG3-avklaringer/resultat gjenopplives ikke; klientavbrudd omgår ikke backendens kall-/duplikatgaranti. **(AC5)**

**Given** demo uten nøkkel og live-flytens fullført-/feiltilstander
**When** kjørbarhet og tilgjengelighet kontrolleres
**Then** demo fungerer fortsatt med eksternt nett sperret, mens live viser egen faktisk status uten ny konfigurasjonsreise
**And** tekstlig modus/feil/gyldighet, tastatur/fokus og korte statuskunngjøringer følger final UX; t_liste er først når ferdig validert liste faktisk er synlig, ikke ved avsluttet modellkall. **(AC6)**

**Testkrav:** HTTP-integrasjon og bygget-app-E2E med kontrolladapter ved samme grense: RT-1–RT-4/RT-7/RT-9/RT-10/RT-13–RT-15/RT-19, AT-13/AT-16/AT-17/AT-19/AT-20 og relevante FR-5-overganger. Dekk feilsvar, samtidige duplikater, klientavbrudd, sent svar, ny rapport, gjenbruk og null ekstra kall ved finans/funn/TG3. Sammenlign faktiske kodeutfall fra identisk kontrollert uttrekk i begge moduser. Test standard demo uten klient/nøkkel/nett og kjente live-konfigurasjonsfeil. Den valgte SDKens transportforsøk kontrolleres i integrasjon med 4.2; E2E skal ikke bruke betalt tjeneste. Manuell modus-/feil-/tastatur-/statuskontroll ved relevante overganger. Faktiske live-kjøringer inngår i 4.4.

### Story 4.4: Gjennomføre ekte live-analyse og evaluere opprinnelig uttrekk mot S2

Som produkteier,
vil jeg se faktisk live-uttrekk vurdert mot den forhåndsdefinerte dokumentfasiten,
slik at v1s KI-funksjonalitet og treffkvalitet dokumenteres uten hjelp fra etterfølgende rettinger.

**Kravspor:** FR-6/FR-7/FR-8/FR-9; NFR-4 og etterprøvbarhet i NFR-1; S2/S4 og K2; AD-3–AD-6/AD-9/AD-10; SPEC CAP-2/CAP-8 og verifikasjonsgrensene for S2 og live/tid/ren kjøring. UX-DR7/UX-DR12/UX-DR13/UX-DR16/UX-DR25/UX-DR40 videreføres ved kontroll av kilde/opphav; ingen evalueringsflate i produktet opprettes.

**Avhengigheter:** 2.2, 4.2 og 4.3, samt løst gjennomføringsport og tilgjengelig lokal nøkkel/budsjett. **Arbeidsgrense:** Faktiske eksplisitte kjøringer med valgt leverandør/modell og dokumentert S2-evaluering mot F1–F4-rapportene/fasit. Kontrollerte ekstra eksempler tester vurderingsmåten; de erstatter ikke reelle modelluttrekk. Bevis lagres under .docs/implementation-artifacts/ uten nøkkel/private originaler.

**Acceptance Criteria:**

**Given** fiktive rapporter og uavhengig fasit for F1–F4, fastlagt før modellkjøring
**When** evalueringsutvalget og forsøkene forberedes
**Then** alle eksplisitte TG2/TG3 er i fasiten med grad/beskrivelse/dokument/PDF-side, og utvalget omfatter både TG2 og TG3
**And** valgt kode-/kontrakt-/prompt-/modellversjon, rapporthash, planlagte forsøk og kostnadsramme er dokumentert; fasiten tilpasses ikke modellsvaret. **(AC1)**

**Given** støttet rapport og avklart live-oppsett
**When** faktiske eksplisitte analyser gjennomføres
**Then** produksjonsadapteren utfører reelle KI-kall og originale uttrekk/terminalutfall bevares før brukerretting med trygg kjøringsidentitet og konfigurasjon
**And** forsøk, feil og eventuelle senere manuelle gjentakelser er sporbare innen budsjett og duplikatregler; et lagret demosvar eller kontrollsvar kan ikke registreres som live-bevis. **(AC2)**

**Given** fasit og opprinnelig live-uttrekk
**When** hvert dokument vurderes
**Then** rapporteres antall fasitfunn, riktige, oversette, feil side og oppdiktede funn, med hvert kjent TG3 kontrollert enkeltvis for grad, beskrivelse og korrekt PDF-side
**And** feil side, usikre kandidater uten dokumentert støtte og brukerens senere rettinger teller ikke som riktige opprinnelige funn; oversett TG2 dokumenteres også når minimumet nås. **(AC3)**

**Given** fullstendig dokumentert evalueringsutvalg
**When** S2-status fastsettes
**Then** S2 er bestått bare når alle fasitmerkede TG3 og minst 90 % av TG2 er funnet med riktig PDF-side og ingen oppdiktede TG2/TG3 finnes i utvalget
**And** 90 % er et evalueringsminimum, ingen relevansfiltreringstillatelse eller generell kvalitetsgaranti; manglende/feilet analyse er ingen vellykket tomliste. **(AC4)**

**Given** påvist uttrekksfeil, ikke nådd S2 eller ufullstendig live-bevis
**When** resultatet dokumenteres og eventuell retting planlegges
**Then** reell status og berørte funn/versjoner fremgår, og manglende akseptanse kan ikke skjules bak demo eller brukerretting
**And** nye budsjettavklarte forsøk dokumenteres som nye forsøk uten automatisk retry, senket terskel, endret fasit eller utvidet scope; v1 erklæres ikke fullt verifisert med manglende nødvendig live-bevis. **(AC5)**

**Given** F3 med manglende L og øvrige dokument-/finanscaser
**When** dokumenttreff og samlet funksjonsbevis sammenstilles
**Then** F3s rapport kan vurderes for S2 ved adaptergrensen uten å fjerne den låste tallmangelen, mens F1/F2/F4 kan demonstrere faktisk live gjennom hovedflyten med korrekt kontroll/resultat
**And** F3 telles ikke som vellykket S5-hovedanalyse uten gyldig bekreftet tallgrunnlag; S1–S4 og kodeprioritet gjelder også når modellen har svart. **(AC6)**

**Testkrav:** Faktisk live-evaluering med de kontrollerte rapportene, opprinnelig uttrekk og manuell kildekontroll før rettinger teller. Bruk RT-16–RT-18 som kontroll av evalueringsmåten: 9/10 TG2 og 2/2 TG3 med riktig side og ingen oppdiktede består; oversett TG3, feil side som reduserer treff under kravet, oppdiktet funn eller 8/10 TG2 består ikke. Kontroller at manuell retting ikke endrer målt kvalitet på originaluttrekket, og at alle oversette funn registreres. Regnskapet over faktiske forsøk/kostnadsgrunnlag må samsvare med bevisene uten hemmeligheter. Evalueringsdokumentasjon er leveransebevis, ingen varig vurderingshistorikk i appen. Gyldige tidsdata kan gjenbrukes i 4.5; S2-storyen krever ingen ny timer eller fremtidig måleimplementasjon.

### Story 4.5: Måle live-analyse og menneskelig kontroll etter S5-protokollen

Som produkteier,
vil jeg ha dokumenterte tider for faktisk live-analyse og menneskelig kontroll sammenlignet med manuell førstevurdering,
slik at tidsmålet vurderes med samme kontrollkrav og uten å skjule feil.

**Kravspor:** NFR-5; S5 og K1 med S1–S4 som samtidige kontrollmål; målehendingene i FR-4/FR-5/FR-6/FR-9/FR-11; AD-5/AD-6/AD-10; SPEC CAP-2/CAP-3/CAP-4/CAP-8 og hele S5-målingen. UX-DR11/UX-DR18/UX-DR19/UX-DR33/UX-DR36–UX-DR38/UX-DR40/UX-DR41 er eksisterende hendelser/flyter, ikke ny telemetri.

**Avhengigheter:** 4.3 og 4.4, samt faktisk person til menneskelig kontroll/manuell referanse og avklart budsjett for eventuelle nye live-forsøk. **Arbeidsgrense:** Utføre og dokumentere den låste måleprotokollen. Gjenbruk bare faktiske gyldige registreringer med komplett hendelsesgrunnlag; ellers planlegg eksplisitte nye forsøk. Ingen produktfunksjon for timer, evaluering eller rapportering bygges.

**Acceptance Criteria:**

**Given** forhåndsdefinert utvalg med planlagte forsøk, gyldige bekreftede tall og ferdig opplastet støttet rapport
**When** et måleforsøk gjennomføres
**Then** t_start registreres ved Start analyse, t_liste når ferdig validert liste med sider/usikkerhet faktisk er synlig og t_bekreftet etter menneskelig kontroll og bekreftet gjeldende liste med håndtert TG3-status
**And** samme tidsgrunnlag og tilstrekkelig presisjon brukes; F3 uten rettet/bekreftet tallmangel har ikke gyldig S5-start. **(AC1)**

**Given** fullførte målepunkter
**When** varighetene beregnes
**Then** hovedanalyse er t_liste−t_start og menneskelig kontroll er t_bekreftet−t_liste
**And** registrering/opplasting før start, senere kodeberegning/anbefaling og videre investeringsarbeid holdes utenfor; avsluttet modellkall alene stopper ikke hovedanalysen. **(AC2)**

**Given** reell menneskelig kontroll med eventuelle rettinger/avvisninger og alvorlig TG3
**When** kontrollen avsluttes
**Then** nødvendig originalkontroll og gjeldende listebekreftelse er gjennomført, og TG3 kan fortsatt være Uavklart med Innhent mer informasjon
**And** raskere tid oppnås ikke ved å droppe kontrollsteg, skjule usikkerhet/TG3 eller automatisk sette Avklart; S1–S4 gjelder samtidig. **(AC3)**

**Given** vellykkede/feilede analyser, fullførte/ufullførte kontroller og eventuelle manglende målepunkter
**When** målegrunnlaget sammenstilles
**Then** case, rapport/uttrekk, modus, versjoner, relevante hendelser/varigheter, utfall og antall planlagte/målte forsøk dokumenteres med feil separat
**And** feiltid er ikke vellykket analysetid, ufullført kontroll er ikke null/rask kontroll og demo/live rapporteres separat uten utvalg som skjuler feil. **(AC4)**

**Given** gyldige målinger i det dokumenterte utvalget
**When** de to medianene og akseptansestatus beregnes
**Then** hovedanalyse og kontroll vurderes separat mot ≤300 s og ≤600 s, med gjennomsnittet av de to midterste ved partall
**And** nøyaktig likhet består uten avrunding av minutter; uten gyldige observasjoner er målet ikke verifisert, og god median alene opphever ikke feil eller kvalitetsbrudd. **(AC5)**

**Given** live-/kontrollmålinger og manuell førstevurdering av de samme casene
**When** tidsgevinst og S5-status rapporteres
**Then** den manuelle referansen har dokumenterte faktiske aktiviteter/avgrensninger og resultater, atskilt fra brukerens tidligere tidsanslag og fra lagret demo
**And** bevis og eventuelle ikke nådde mål er lagret under .docs/implementation-artifacts/ med spor til protokoll/versjoner; ingen generell tidsgevinst eller bestått live-tid utledes av demosvar/feiltid. **(AC6)**

**Testkrav:** Gjennomfør faktiske målinger med menneskelig kontroll og manuell referanse; kontroller registrering/beregning mot TT-1–TT-9. Protokollkontrollen skal blant annet gi 150 s når modellkallet slutter ved 120 s og listen vises ved 150 s, skille 20 s feiltid fra suksess, godta fullført kontroll med Uavklart TG3 og gi medianene 270/540 s for TT-7. TT-8 skal skille 300/600 fra 301/601; TT-9 skal holde rask demo og feilet live atskilt. Ingen fast mengde observasjoner, apptelemetri eller hard timeout legges til; faktisk utvalg, fullstendighet og alle forsøk skal være synlige. Åpne S5-/kvalitetsavvik kan ikke omtales som bestått i Epic 5.

## Epic 4: dekningskontroll til gjennomgangen

| Krav / beslutning | Planlagt storydekning |
|---|---|
| FR-6 | 4.1 eksplisitt lokal live-konfigurasjon; 4.2 ett helt reelt adapterkall uten retry; 4.3 eksplisitt start/duplikat/gjenbruk/ny rapport; 4.4 faktisk live-bevis. PDF-validering/tekst fra Epic 2 gjenbrukes. |
| FR-7 | 4.2 alle eksplisitte TG2/TG3 som oppgave, trofast beskrivelse og ingen nye analyser; 4.4 faktisk originaluttrekk mot uavhengig fasit/S2. Ingen relevansfiltrering ved nådd 90 %. |
| FR-8/FR-9 | 4.2 kontrakt/kilde/usikkerhet/terminalfeil; 4.3 eksisterende original-/kontrollflate, lokale trygge feil og prioritet 1; 4.4 kilde-/treffevaluering før retting. |
| FR-5/FR-10/FR-11/FR-15–FR-18 | 4.3 gjenbruker eksisterende kontroll/korrigering/TG3/liste/finans/screening/snapshot uten egne live-regler; endringer av uendret rapport gir ingen KI-kall. |
| NFR-1 / AD-5 | 4.1 ingen SDK-retry; 4.2 faktiske transportforsøk og trygge feil; 4.3 duplikatsperre/klientavbrudd/sent svar og deterministisk gjenbruk. |
| NFR-2 / UX-DR1/UX-DR10/UX-DR11/UX-DR24/UX-DR25/UX-DR33/UX-DR36–UX-DR38/UX-DR40/UX-DR41 | 4.3 viderefører merket modus, analyse-/feil-/gyldighetstilstand og lokal tilgjengelighet i samme firetrinnsflyt. Ingen ny konfigurasjonsskjerm. |
| NFR-3 / CAP-8 | 4.1 demo er standard uten KI-klient/nøkkel; 4.3 offline-demo består etter live-integrasjonen. Faktisk README-/annen-person-verifikasjon følger i Epic 5. |
| NFR-4 / AD-9 | 4.1 trygg backendnøkkel/config; 4.2/4.3 trygge retur-/feil-/logggrenser; 4.4/4.5 fiktive data og bevis uten hemmeligheter/private originaler. Samlet repo-/historikkontroll følger i Epic 5. |
| NFR-5 / S5 / K1 | 4.3 ekte synlig-liste-hendelse; 4.5 full protokoll, faktiske live-/kontrolltider, feil/ufullført/demo separat og målt manuell referanse. |
| S2 / K2 / AD-10 | 4.4 opprinnelig live-uttrekk, alle TG3/≥90 % TG2/riktig side/ingen oppdiktede; per-rapport avvik og hvert TG3, ingen retting som treffbevis. |
| S3/S4 | 4.2 bevarer opphav/usikkerhet; 4.3 samme regler/kilder/kontroll som demo; 4.4 dokumentfasit og originalbevis; 4.5 kontrollkvalitet samtidig med tidsmålet. |
| AD-3/AD-4/AD-6 / CAP-2 | 4.2 samme hele sidemerkede input/felles kontrakt og kodebestemt identitet; 4.3 samme pipeline/flyt, 4.4 reell modellgjennomføring. |
| Deferred | Avklaringer før Epic 4-implementering er eksplisitte og eies av Mads + live-integrasjon; tidligere PDF-/HTTP-avklaringer flyttes ikke hit. Ingen leverandør/modell/budsjett/timeout velges i planen. |

Ingen story krever Epic 5 for sin avgrensede leveranse. Epic 5 sammenstiller faktiske S2/S5-bevis og ren sensor-kjørbarhet. Ikke nådde mål og ufullstendige bevis beholder reell status; bestått demo kan ikke brukes til å lukke manglende live-leveranse.

## Gjennomgang og videreføring

Gjennomgangen er avsluttet med Mads’ C-godkjenning av 4.1–4.5 og videreføring til Epic 5. Storytekstene og gjennomføringsporten er kopiert uendret til epics.md og godkjenningsstatusen er registrert. Modell-/leverandørvalg og budsjett for betalte kall godkjennes ikke ved storygjennomgangen. Den fullstendige storygrafen og gjennomførbarheten kontrolleres ved ferdig oppdeling/readiness før kodearbeid; godkjenningen er ikke implementeringsstart eller en påstand om beståtte produkttester.
