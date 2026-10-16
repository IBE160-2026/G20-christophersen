---
title: "Epic 1: storyforslag til gjennomgang"
created: 2026-10-15
status: approved-and-incorporated
workflow: bmad-create-epics-and-stories
step: step-03-create-stories
epic: 1
stories: ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7"]
approvedStories: ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7"]
---

# Storyforslag — Epic 1

Mads har godkjent alle sju storyene i Epic 1 med C. De er innarbeidet i [epics.md](../../planning-artifacts/epics.md), som er hovedplanen for videre arbeid. Denne filen bevarer gjennomgangsgrunnlaget og godkjenningen. Brukerhistorier, akseptansekriterier og testkrav er uendret ved innarbeidingen. Epic 2 behandles nå; implementation readiness og implementering er ikke startet.

## Kildeindeks og leseregel

- [PRD](../../planning-artifacts/prds/prd-IBE160-2026-10-10/prd.md): FR-1–FR-4, den lokale mangeldelen av FR-16/FR-17 og NFR-1–NFR-4. Alle fulltekstkrav gjelder.
- [PRD-addendum](../../planning-artifacts/prds/prd-IBE160-2026-10-10/addendum.md) og [Brief-addendum](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/addendum.md): relevant inputdel av BT-/AT-eksempler, F1–F4 og kilde-/null-/periodevarianter. Hele økonomifasiten ferdigstilles med Epic 3.
- [DESIGN](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/DESIGN.md) og [EXPERIENCE](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md): Tallgrunnlag, stepper, felt/kilde/kostnader/bekreftelse, lokale feil, tastatur/fokus og visuelle tokens. UX-DR refererer den eksisterende indeksen i epics.md.
- [ARCHITECTURE-SPINE](../../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md): AD-1/AD-2/AD-7–AD-10, startstakk, Structural Seed og kommandokontrakter.
- [SPEC](../../specs/spec-IBE160/SPEC.md), [grensekontrakter](../../specs/spec-IBE160/grensekontrakter.md) og [verifikasjon/avklaringer](../../specs/spec-IBE160/verifikasjon-og-avklaringer.md): særlig CAP-1/CAP-6/CAP-7/CAP-8; finansverdiens opphav/bekreftelse, prioritet 1 og endring→gyldighet.

Referanser til S1/S6 eller test-ID-er betyr hvilken del av et senere samlet bevis en story bidrar med. De innebærer ikke at hele målet eller hele BT-/AT-testen er bestått gjennom Epic 1. Storyspesifikke AC-numre er lokale til storyen og erstatter ingen godkjent krav-/test-ID. Ingen testprosent eller ny produktfunksjon innføres.

## Epic 1: Etablere et kontrollert økonomigrunnlag i en kjørbar lokal app

Investoren kan starte appen, registrere finansverdier med periode/år, kilde og kostnadsinnhold, forstå lokale mangler, rette og bekrefte gjeldende grunnlag. Epicen leverer nødvendig felles prioritet-1-vurdering. De fire finansberegningene, økonomiske terskler og komplett screening ligger i Epic 3. Faktisk KI-analyse ligger i Epic 4.

| Story | Avgrenset leveranse | Direkte forutsetninger |
|---|---|---|
| 1.1 | Reproduserbar startstruktur og importgrenser | Ingen |
| 1.2 | Faktisk lokal build/start og godkjent appskall | 1.1 |
| 1.3 | Manuell registrering og bevart rågrunnlag | 1.2 |
| 1.4 | Ren tallvalidering og eksakt årsnormalisering | 1.3 |
| 1.5 | Synlige kilder, kostnadsinnhold og konflikter | 1.3, 1.4 |
| 1.6 | Felles kodebasert vurdering av kritiske mangler | 1.4, 1.5 |
| 1.7 | Kontroll/bekreftelse, lokale feil og berørt ny kontroll | 1.2, 1.3, 1.5, 1.6 |

Avhengighetene går bare til tidligere stories. Hver story kan verifiseres ved sin leveransegrense uten en framtidig story. De rene modulstoryene må ikke kreve at senere UI er ferdig for å testes. Appens komplette Tallgrunnlag-flyt er epicens samlede brukerutfall, ferdig etter 1.7. Dette er foreløpig størrelses-/avhengighetsvurdering av Epic 1, ikke full implementation readiness eller et timeestimat.

### Story 1.1: Etablere reproduserbar startstruktur og importgrenser

Som utvikler,
vil jeg ha den godkjente starteren, versjonert installasjonsgrunnlag og tydelige modulgrenser,
slik at videre arbeid kan bygges på samme lokale grunnlag uten konkurrerende regel- eller kontraktkode.

**Kravspor:** NFR-3/NFR-4; lokal forutsetning for S6; AD-1/AD-9/AD-10; SPEC CAP-8 og grensekontraktens modul-/kontrakteierskap. Ingen direkte bruker-FR eller ferdig UI dekkes alene. UX-tokens tas i bruk i 1.2.

**Avhengigheter:** Ingen. **Arbeidsgrense:** Offisiell Vite react-ts, én package.json/package-lock.json, TypeScript/Oxlint og nødvendig struktur/konfigurasjon innen låst startstakk. Legg til avhengigheter ved første behov med spine-versjonen. Ingen komplett framtidig datamodell, analysekontrakt, finansmodul, database eller appserver leveres her.

**Acceptance Criteria:**

**Given** et rent dokumentert lokalt miljø med Node.js 24.21.0 og repoet
**When** utvikleren oppretter startgrunnlaget fra offisiell Vite react-ts med de nødvendige låste versjonene
**Then** én package.json og package-lock.json beskriver samme avhengighetstre, og npm ci kan gjenskape installasjonen
**And** versjonsavvik/inkompatibilitet rapporteres for avklaring; ingen låst pin byttes i stillhet. **(AC1)**

**Given** startgrunnlaget og den nødvendige TypeScript-/lintkonfigurasjonen
**When** dokumenterte type- og lintkontroller kjøres
**Then** faktisk kildekode/config kan kontrolleres uten feil i det dokumenterte miljøet
**And** kontrollen avhenger ikke av live-nøkkel, betalt tjeneste eller framtidige moduler. **(AC2)**

**Given** den etablerte strukturen
**When** importene gjennomgås
**Then** frontend, backend, domain og contracts har ansvar/importretning etter AD-1, og domain/contracts har ingen UI-, server- eller I/O-avhengighet
**And** bare nødvendig kode opprettes; framtidig finans-/PDF-/KI-logikk eller kopierte kontrakttyper bygges ikke på forskudd. **(AC3)**

**Given** installasjon og lokalt utviklingsarbeid
**When** filene klargjøres for versjonering
**Then** avhengigheter, byggeartefakter, lokale hemmeligheter og private originaler holdes utenfor Git
**And** nødvendig prosjektkonfigurasjon/låsfil og en kort faktisk installasjons-/kontrolloppskrift kan versjoneres uten hemmeligheter. **(AC4)**

**Testkrav:** Reell npm ci i dokumentert rent miljø, type/lint og konkret kontroll av import-/Git-grenser. Lagre faktiske kommandoer/funn under .docs/implementation-artifacts/ ved implementering. Ingen dummy-enhetstester eller tomme testsuksesser for mapper/konfigurasjon. Appens startbarhet er separat i 1.2; hele S6 er fortsatt senere leveransekontroll.

### Story 1.2: Starte den bygde lokale appen med godkjent appskall

Som investor,
vil jeg kunne starte appen lokalt og se hvor jeg er i vurderingsflyten,
slik at jeg kan begynne arbeidet uten nøkkel, betalt konto eller ekstern driftstjeneste.

**Kravspor:** NFR-2/NFR-3/NFR-4; lokal del av S6; AD-1/AD-2/AD-9/AD-10; SPEC CAP-8. UX-DR1–UX-DR4/UX-DR25/UX-DR27/UX-DR28/UX-DR34/UX-DR35/UX-DR40; DESIGN-tokens og EXPERIENCE Information Architecture/app-header/stepper.

**Avhengigheter:** 1.1. **Arbeidsgrense:** Faktisk lokal frontend/server, build/start/dev, systemfont og appskall. Registreringsfelt, rapportanalyse og resultater kommer i sine stories; de presenteres ikke som ferdige gjennom denne leveransen.

**Acceptance Criteria:**

**Given** installert prosjekt fra 1.1
**When** brukeren kjører npm run build og deretter npm run demo
**Then** én Express-prosess på dokumentert loopback-adresse serverer bygget frontend og gir samme origin for senere /api
**And** oppstart og appskall fungerer med eksternt nett sperret og uten API-nøkkel/KI-klient. **(AC1)**

**Given** utviklingsmiljøet
**When** npm run dev kjøres
**Then** den dokumenterte utviklingskommandoen starter nødvendig Vite/Express-forløp uten at brukeren må gjette ekstra kommandoer
**And** README/oppskriften angir faktisk adresse og forutsetninger. **(AC2)**

**Given** appskallet ved start
**When** arbeidsflaten vises
**Then** produktnavn, «Demo · lagret KI-uttrekk» og de fire eksakte trinnnavnene Tallgrunnlag → Tilstandsrapport → Kontroller funn → Resultat er synlige med nummer/tekststatus
**And** Tallgrunnlag er gjeldende, framtidige trinn er sperret med relevant forklaring, og ingen kontroll/analyse/resultat er feilaktig markert fullført. **(AC3)**

**Given** appskallet på vanlig desktop og ved zoom
**When** brukeren navigerer med tastatur eller ruller arbeidsinnhold
**Then** gjeldende status kan forstås uten farge, fokus er synlig og stepperen dekker ikke fokusert innhold
**And** DESIGNs eksakte grafitt/petrol-/font-/geometritokens brukes; ved ombryting beholdes navn/nummer/status. **(AC4)**

**Given** den statiske serveren
**When** appressurser og URL-er til reporot/private filer etterspørres
**Then** nødvendige lokale appressurser leveres, mens reporot og private dokumenter ikke eksponeres
**And** bare trygg modusmetadata kan nå frontend; ingen nøkkel vises i app eller feilutdata. **(AC5)**

**Testkrav:** Reell bygget-app-start på loopback, dev-oppstart, ekstern nettblokkering og HTTP-kontroll av ressursgrensen. Manuell tastatur/zoom/stepper-/tokenkontroll for skallet med faktisk kontrast på tekst/fokus. Kontrollen bruker ingen ennå ikke implementert rapportpipeline og krever ingen kunstig grønn npm test. Full demo og S6 bekreftes senere.

### Story 1.3: Registrere og bevare finansverdier for ett objekt

Som investor,
vil jeg registrere P, L, D, J og Ymin med tydelige enheter og perioder,
slik at mine egne tall bevares som grunnlag for kontroll.

**Kravspor:** Registreringsdelen av FR-1/FR-3; NFR-1/NFR-2; AD-1/AD-2/AD-7/AD-9; SPEC CAP-1/CAP-7 og finansverdiens registrerte grunnlag. UX-DR5/UX-DR6/UX-DR25/UX-DR32/UX-DR34/UX-DR35/UX-DR37/UX-DR40; value-field/period-control.

**Avhengigheter:** 1.2. **Arbeidsgrense:** Råregistrering og aktiv frontendøkt for ett objekt. Ren normalisering leveres i 1.4, kilde-/kostnadskontroll i 1.5 og komplett bekreftelses-/feilflyt i 1.7. Denne storyen kan verifiseres som registrering uten å hevde at grunnlaget er gyldig eller bekreftet.

**Acceptance Criteria:**

**Given** et nytt Tallgrunnlag
**When** feltene vises
**Then** P/L/D/J/Ymin er blanke og ubekreftede, med synlige etiketter og NOK/prosent
**And** P forklares som totalpris inklusive eventuell fellesgjeld uten kjøpsomkostninger, D som eierbetalt drift og J som renter/avdrag inklusive eventuell fellesgjeld. **(AC1)**

**Given** L/D/J for det aktuelle objektet
**When** brukeren registrerer tall og tilhørende år/periode
**Then** registrert verdi og eksplisitt år/måned/årstilknytning bevares uten automatisk gjetting av manglende opplysninger
**And** P og Ymin får ingen automatisk årsnormalisering. **(AC2)**

**Given** inntastet tall, eksplisitt 0 eller slettet innhold
**When** registreringen oppdateres
**Then** råverdien bevares, og blank, 0 og ubekreftet registrering er forskjellige tilstander
**And** ingen skjult standardverdi eller bekreftelse innføres for å gjøre grunnlaget komplett. **(AC3)**

**Given** registrert grunnlag i den aktive frontendøkten
**When** brukeren besøker et tilgjengelig trinn og går tilbake uten å endre data
**Then** registrert innhold og kontekst er bevart
**And** navigasjonen er ingen analyse, kontroll eller datamutasjon; lukking/sideoppdatering gir ingen lovnad om varig gjenopptak. **(AC4)**

**Testkrav:** Kontroller feltenes definisjoner/enheter/perioder og at registrering/sletting/0 skilles, med kontrollerte F1-/F3-inputverdier. Verifiser bevart innhold ved aktuell trinnretur og tydelig ubekreftet status. Ingen beregningsfasit kreves før finansmodulen; visuelle/manuelle feltkontroller og relevante rene tilstandstester brukes uten betalt API.

### Story 1.4: Validere tall og normalisere kjent månedsgrunnlag eksakt

Som investor,
vil jeg at tall og perioder vurderes konsekvent før de brukes,
slik at mangler, ugyldige verdier og blandede årsgrunnlag ikke blir beregningsgrunnlag.

**Kravspor:** FR-1/FR-3 og normaliseringsgrunnlaget til FR-12/FR-14; NFR-1; S3 og grunnlag for S1/S4; AD-1/AD-7/AD-10; SPEC CAP-1 og grensekontrakten Finans og screening. UX-DR6s anvendte årsgrunnlag og UX-DR5s feilgrunnlag; UI-integrasjon av lokale feil følger i 1.7.

**Avhengigheter:** 1.3. **Arbeidsgrense:** Én ren inputvaliderings-/årsnormaliseringsautoritet med nødvendige delte typer. Beregner ikke yield/NOI/kontantstrøm og vurderer ingen økonomisk terskel. Modulen kan testes direkte uten senere UI.

**Acceptance Criteria:**

**Given** registrerte finansverdier
**When** ren validering kjøres
**Then** P må være >0 og L/D/J/Ymin ≥0; ikke-numerisk input er ugyldig
**And** blank er manglende, mens numerisk 0 beholdes med behov for eksplisitt bekreftelse, uten at P=0 blir gyldig. **(AC1)**

**Given** kjent månedlig L/D/J for samme år
**When** grunnlaget normaliseres
**Then** hver månedsverdi multipliseres eksakt med 12, med registrert verdi/periode/år/faktor/anvendt årsverdi bevart
**And** kanoniske desimalstrenger og låst desimalbibliotek brukes uten Number/parseFloat før eksakt aritmetikk. **(AC2)**

**Given** L=120000, D=20000 og J=50000 per måned
**When** normalisering kjøres
**Then** årsverdiene er henholdsvis 1440000, 240000 og 600000
**And** årsregistrerte beløp bevares uten faktor 12; P og Ymin endres ikke. **(AC3)**

**Given** ukjent/ustøttet periode eller verdier som gjelder ulike år
**When** grunnlaget valideres
**Then** berørt grunnlag er utilstrekkelig med konkret årsak/berørt felt
**And** ingen periode, vekst, ekstra fratrekk eller sammenlignbart år gjettes. **(AC4)**

**Given** samme registrerte grunnlag flere ganger
**When** validering/normalisering gjentas
**Then** resultat og årsaker er identiske uten mutasjon av input eller kumulativ multiplikasjon
**And** de registrerte verdiene er fortsatt tilgjengelige for senere brukerkontroll. **(AC5)**

**Testkrav:** Vitest mot uavhengig inputfasit: P=0/negativ, negativ L/D/J/Ymin, ikke-numerisk, hver blankverdi og bekreftet/ubekreftet 0. Normaliseringsdelen av BT-7/BT-15/BT-16, måned/år-blanding med felles gyldig årsgrunnlag, presise desimalbeløp og gjentatt normalisering. Hele BT-eksemplets nøkkeltall/terskler testes i Epic 3. Feil og mangel må kunne konsumeres uten lokal ny valideringslogikk i UI.

### Story 1.5: Gjøre kilder, kostnadsinnhold og uløste konflikter kontrollerbare

Som investor,
vil jeg se hvor tallene kommer fra og hvilke kostnader som er inkludert,
slik at jeg kan rette kildekonflikter og unngå dobbelttelling før bekreftelse.

**Kravspor:** FR-2 og relevant FR-3/FR-4; NFR-1/NFR-2; S3/S4; AD-1/AD-2/AD-7/AD-10; SPEC CAP-1 og finansverdiens kilde/kostnadsinnhold/konflikt. UX-DR5/UX-DR7/UX-DR8/UX-DR24/UX-DR34/UX-DR35/UX-DR40; source-note/cost-breakdown.

**Avhengigheter:** 1.3 og 1.4. **Arbeidsgrense:** Kilde-/brukerforutsetning og kontrollerbart D-/J-innhold på Tallgrunnlag, med tilhørende felles validering. Ingen automatisk uthenting, kostnadsestimering, låneplan eller ekstra kostnadsmodell. Storyen bestemmer ingen ny felt-/radmekanisme utover final UX.

**Acceptance Criteria:**

**Given** P/L/D/J/Ymin i det registrerte grunnlaget
**When** brukeren oppgir kilde eller egen forutsetning
**Then** opphavet er synlig og knyttet til verdien som skal brukes
**And** forventet leie merkes ikke som dokumentert faktisk leie uten slikt grunnlag. **(AC1)**

**Given** inkluderte og overlappende driftskostnadsposter
**When** kostnadsinnholdet kontrolleres
**Then** brukeren kan se hvilke poster som allerede inngår i andre, og samme post legges ikke til to ganger
**And** gjeldsbetjening behandles i J, uten å telle den samtidig i D. **(AC2)**

**Given** felleskostnader på 120000 hvor 20000 er renter/avdrag
**When** dette innholdet registreres og vurderes
**Then** bidraget er D=100000 og J=20000 med synlig oppdeling
**And** andre registrerte kostnader/gjeldsposter endres ikke gjennom skjult standard eller nytt fratrekk. **(AC3)**

**Given** to uløste kildeverdier for samme kritiske felt
**When** det gjeldende grunnlaget vurderes
**Then** konflikten og de aktuelle kildeverdiene er synlige og berørt verdi er utilstrekkelig
**And** appen velger ikke automatisk den laveste, nyeste eller en foretrukket kilde. **(AC4)**

**Given** et kilde-/kostnadsgrunnlag som brukeren korrigerer
**When** registreringen oppdateres
**Then** gjeldende opphav, innhold og eventuell gjenværende konflikt kan etterprøves
**And** endringen er del av det finansgrunnlaget som senere må kontrolleres/bekreftes, ikke bare en kosmetisk merknad. **(AC5)**

**Testkrav:** Uavhengig FR-2-fasit 120000=100000+20000, opplyst kostnadsoverlapp uten dobbeltføring og renter/avdrag utenfor D. Test uavklart L-konflikt fra Brief-addendum/BT-14/AT-12 som utilstrekkelig input, uten å kreve finansberegning. Kontroller manuelt at fem verdier har synlig opphav og at forventet leie/kostnadsinnhold forstås. Mangler/konflikter går til samme domain-vurdering i 1.6; ingen ny UI-regelmotor.

### Story 1.6: Vurdere kritiske mangler med fast kodebegrunnelse

Som investor,
vil jeg få samme konkrete mangelgrunnlag og nødvendige handling fra samme registrerte opplysninger,
slik at mangler ikke skjules eller overstyres av antatt god eller svak økonomi.

**Kravspor:** FR-3/FR-4 og prioritet-1-delen av FR-16/FR-17; NFR-1; S3; AD-1/AD-7/AD-8/AD-10; SPEC lokal del av CAP-6 og grensekontraktens prioritet 1. UX-DR20/UX-DR24/UX-DR36/UX-DR40 er den senere UI-konsumenten i 1.7, ikke ferdig UI i denne modulstoryen.

**Avhengigheter:** 1.4 og 1.5. **Arbeidsgrense:** Ren felles domain-vurdering og faste begrunnelser/neste handling for kjente kritiske mangler, med nødvendige kontraktdata før bruk. Finans, økonomiske terskler og full screening bygges i Epic 3; dokument-/TG3-tilstandene kobles til samme autoritet i Epic 2. Ingen komplett framtidig analyse-DTO eller providerklient opprettes nå. Modulen er separat testbar.

**Acceptance Criteria:**

**Given** kjente manglende, ugyldige, konfliktfylte eller ubekreftede kritiske verdier
**When** domain-vurderingen kjøres
**Then** alle kjente kritiske utløsere samles med berørt felt og nødvendig retting/bekreftelse
**And** disse gir det kodebaserte utfallet Innhent mer informasjon uten KI-generering. **(AC1)**

**Given** L mangler, Ymin mangler og J er ubekreftet 0 samtidig
**When** grunnlaget vurderes
**Then** alle tre forholdene og deres nødvendige handling fremgår, i stabil rekkefølge
**And** vurderingen stopper ikke etter første feil eller fyller inn tall. **(AC2)**

**Given** kontrollerte finansverdier og kjent manglende/ufullført rapportgrunnlag
**When** de kjente manglene vurderes, også med F2-tall
**Then** rapportmangelen behandles som kritisk utilstrekkelig grunnlag med konkret kjent årsak
**And** fravær av feltfeil eller svake tall gir verken Gå videre eller Forkast. **(AC3)**

**Given** samme gjeldende mangelgrunnlag
**When** vurderingen kjøres gjentatte ganger uten nett eller KI
**Then** utfall, utløsere, fast begrunnelse og anbefalingsbundet neste handling er identiske
**And** frontend/backend/adapter skal kunne bruke dataene uten egne regelkopier. **(AC4)**

**Given** at et delgrunnlag ikke har noen av de kjente manglene vurderingen mottar
**When** mangellisten er tom
**Then** tom liste er ikke i seg selv en økonomisk godkjenning eller fullstendig screening
**And** komplett grunnlags-/terskelvurdering og de tre endelige regelutfallene ferdigstilles i Epic 3 uten at tidlig mangellogikk erstattes med en parallell motor. **(AC5)**

**Testkrav:** Rene Vitest-tester av alle samtidige inputmangler, blank kontra ubekreftet 0, konflikt, stabil ordning og nøyaktig samme begrunnelse/neste handling ved gjentakelse. Bruk relevant prioritet-1-grunnlag fra AT-5/AT-12/AT-18/AT-19; bare tilgjengelig del av fasiten dekkes nå. Faktiske dokumentfeil/TG3 fra AT-18 kobles inn og verifiseres i Epic 2, og økonomiske brudd/full AT-fasit i Epic 3. Ingen UI- eller betalt API-avhengighet.

### Story 1.7: Kontrollere, bekrefte og rette gjeldende tallgrunnlag

Som investor,
vil jeg se hele tallgrunnlaget, rette lokale feil og eksplisitt bekrefte det jeg har kontrollert,
slik at rapportanalysen senere kan bruke et gyldig grunnlag med korrekt bekreftelsesstatus.

**Kravspor:** FR-1–FR-4, lokal mangelvisning etter FR-16/FR-17 og finansbekreftelsesgrunnlaget til FR-15/FR-18; NFR-1/NFR-2; S3/S4 og del av S6; AD-1/AD-2/AD-7/AD-8/AD-9/AD-10; SPEC CAP-1, lokal CAP-6 og kontroll-/endringsdel av CAP-7/CAP-8. UX-DR2–UX-DR9/UX-DR20/UX-DR24/UX-DR25/UX-DR32–UX-DR37/UX-DR40; Tallgrunnlag/financial-confirmation/Interaction Primitives.

**Avhengigheter:** 1.2, 1.3, 1.5 og 1.6, med ren normalisering fra 1.4. **Arbeidsgrense:** Faktisk Tallgrunnlag-flyt med lokale kodeutfall, feltfeil, kontroll/bekreftelse og berørt ugyldiggjøring. Ingen økonomiske nøkkeltall/anbefalingsterskler, rapportkall eller historisk resultatsnapshot; disse kommer i sine godkjente epics.

**Acceptance Criteria:**

**Given** registrert grunnlag
**When** brukeren kontrollerer før bekreftelse
**Then** registrerte verdier, enheter, perioder/år, omregningsfaktorer/anvendte årsverdier, kilder/forutsetninger og kostnadsinnhold er tilgjengelige
**And** registrering alene har ikke satt noen bekreftelse. **(AC1)**

**Given** manglende/ugyldige verdier, kildekonflikt, periodeproblem eller ubekreftet null
**When** brukeren gjør et eksplisitt bekreftelsesforsøk
**Then** feltene får konkrete tilknyttede feil, input bevares, fokus går til første berørte felt og gyldig bekreftelse settes ikke
**And** kodebasert Innhent mer informasjon, berørte lokale blokkere og nødvendig handling vises i Tallgrunnlag uten omvei til Resultat, med data fra 1.6. **(AC2)**

**Given** gyldige kontrollerte verdier inklusive J=0 ved kontantkjøp
**When** brukeren eksplisitt bekrefter det aktuelle grunnlaget og nullverdien
**Then** bekreftelsen gjelder nettopp disse verdiene med periode/år/kilde/kostnadsgrunnlag, og J=0 er gyldig
**And** blank verdi og ubekreftet null får ikke samme status; bekreftet Tallgrunnlag åpner neste trinn uten å starte analyse automatisk. **(AC3)**

**Given** bekreftet tallgrunnlag
**When** en verdi eller relevant periode/år/kilde/kostnadsinnhold faktisk endres
**Then** berørt bekreftelse oppheves, endringen synliggjøres og ny relevant kontroll kreves før gyldig bruk
**And** uendrede verdier mister ikke kontrollstatus bare på grunn av navigasjon. **(AC4)**

**Given** gjeldende registrering/bekreftelser
**When** brukeren går frem til tilgjengelig trinn og tilbake uten dataendring
**Then** registrering, kontekst og gyldige bekreftelser er bevart i samme frontendøkt
**And** navigasjon endrer ingen grunnlagsrevisjon eller utløser KI-kall; sideoppdatering/lukking gir ingen varig vurderingslagring. **(AC5)**

**Given** Tallgrunnlag og lokale statusendringer
**When** kjernehandlingene gjennomføres med tastatur eller ved zoom
**Then** etiketter/enheter/kilder/feil har semantisk tilknytning, fokus er synlig, trinnnavigasjon fokuserer overskriften og sticky stepper skjuler ikke fokusert innhold
**And** status/feil formidles med tekst og relevante korte kunngjøringer uten unødvendig fokusflytting; tekst-/kontroll-/fokuskontrast følger DESIGN. **(AC6)**

**Testkrav:** Rene reducer-tester for gyldig bekreftelse, hver relevant grunnlagsendring kontra uendret retur og eksplisitt null. Bygget-app-forløp med F1-registrering, F3-manglende L, ubekreftet/bekreftet J=0, ugyldig P, L-konflikt, ulike år, retting og ny bekreftelse; ingen rapportanalyse kreves. Manuell tastatur/zoom-/etikett-/feil-/kontrastkontroll for denne flaten. Testene skal verifisere faktisk brukerflyt og status, ikke bare at en klikkhandler kalles. Senere resultatets Utdatert-snapshot og finans-/KI-gjenbruk testes i Epic 3/2.

## Epic 1: dekningskontroll til gjennomgangen

| Krav | Stories og praktisk dekning |
|---|---|
| FR-1 | 1.3 registrering; 1.4 eksakt periode/år; 1.7 synlig årsgrunnlag/kontroll. |
| FR-2 | 1.5 kilde/kostnad/konflikt; 1.7 gjeldende synlig grunnlag. |
| FR-3 | 1.3 blank/0; 1.4 ren gyldighet; 1.6 felles mangler; 1.7 konkrete lokale feil/eksplisitt null. |
| FR-4 | 1.7 eksplisitt kontroll/bekreftelse, berørt endring og uendret retur. |
| FR-16/FR-17, lokal del | 1.6 ren prioritet-1-vurdering/faste tekster; 1.7 faktisk lokal visning. Komplett økonomisk screening i Epic 3. |
| NFR-1 | 1.3–1.7: bevaring, eksakt gjentakbar normalisering/mangelvurdering, konflikt og korrekt bekreftelsesgyldighet. |
| NFR-2 | 1.2 appskall; 1.3/1.5 felt/kilder; 1.7 hel Tallgrunnlag-flyt/fokus/feil. |
| NFR-3/NFR-4 | 1.1 installasjon/Git-grenser; 1.2 lokal kjøring og ressurs-/modusgrense; 1.7 lokal tallkontroll. Full offline-demo/S6/live-nøkkelhåndtering følger senere epics. |
| CAP-1/CAP-6/CAP-7/CAP-8 | CAP-1 realiseres for Tallgrunnlag; lokal CAP-6 og aktiv kontroll/retur/startdel av CAP-7/8. Ingen påstand om ferdig rapport-/resultat-/livekapabilitet. |
| UX | Appskall/tokens/stepper i 1.2; registrering/perioder i 1.3/1.4; kilde/kostnad i 1.5; faktisk bekreftelse/lokale utfall/fokus/tastatur i 1.7. Nøkkeltall/PDF/funn/resultat er ikke lagt inn i Epic 1. |

Ingen story krever en senere story for kontroll ved sin avgrensede leveransegrense. Viktige seam-kontroller er 1.4→1.6→1.7 og 1.5→1.7: UI konsumerer samme gyldighet/mangelgrunnlag, og kilde/kostnadsendringer inngår i bekreftelsesbindingen. Dette skal også kontrolleres på tvers av alle epics når hele storygrafen finnes.

## Godkjenning og videreføring

Mads svarte C og godkjente story 1.1–1.7 samlet. Alle er innarbeidet i epics.md med uendret storytekst og status godkjent. Hovedworkflowen fortsetter med Epic 2; godkjenningen starter ingen implementering. Den mekaniske og semantiske kontrollen av hele storygrafen følger ved ferdig oppdeling/readiness.
