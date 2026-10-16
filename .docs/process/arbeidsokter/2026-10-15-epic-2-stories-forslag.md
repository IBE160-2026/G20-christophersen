---
title: "Epic 2: storyforslag til gjennomgang"
created: 2026-10-15
status: approved-and-incorporated
workflow: bmad-create-epics-and-stories
step: step-03-create-stories
epic: 2
stories: ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "2.9", "2.10", "2.11"]
approvedStories: ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "2.9", "2.10", "2.11"]
---

# Storyforslag — Epic 2

Mads godkjente story 2.1–2.11 med C. Alle elleve er innarbeidet uendret i [epics.md](../../planning-artifacts/epics.md), som nå har 18 godkjente stories fra Epic 1 og 2. Denne filen bevarer gjennomgangsforslaget og dets dekningskontroll som prosesshistorikk. Epic 3 behandles videre i workflowens steg 3. Ingen implementering er startet; implementation readiness følger etter ferdige stories for alle fem epics.

## Kildeindeks og leseregel

- [PRD](../../planning-artifacts/prds/prd-IBE160-2026-10-10/prd.md): FR-5–FR-11, lokale mangler etter FR-16/FR-17 og NFR-1–NFR-5. [PRD-addendum](../../planning-artifacts/prds/prd-IBE160-2026-10-10/addendum.md): RT-1–RT-19, sju FR-5-eksempler og relevante AT-/TT-eksempler.
- [Brief-addendum](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/addendum.md): F1–F4, dokumentfasit, feil, demo og kostnad/gjenbruk.
- [DESIGN](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/DESIGN.md) og [EXPERIENCE](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md): Tilstandsrapport/Kontroller funn, komponenter, utkast, PDF-panel, fokus/status og Key Flows 1–4. UX-DR er eksisterende indeks i epics.md.
- [ARCHITECTURE-SPINE](../../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md): AD-1–AD-6/AD-8–AD-10 og Deferred, særlig én kontrakt, PDF.js-buildene, duplikatsperre, rapport-/versjonsbinding og økteierskap.
- [SPEC](../../specs/spec-IBE160/SPEC.md), [grensekontrakter](../../specs/spec-IBE160/grensekontrakter.md) og [verifikasjon/avklaringer](../../specs/spec-IBE160/verifikasjon-og-avklaringer.md): CAP-2/CAP-3/CAP-4 og relevante deler av CAP-6/CAP-7/CAP-8.

Alle fulltekstkrav gjelder. Storylokale AC-numre erstatter ingen kilde-ID. RT-/AT-/TT-henvisninger angir de delene som verifiseres ved storyens grense; faktisk live-uttrekk/S2/live-S5 ligger i Epic 4, finans/full screening/resultatsnapshot i Epic 3. Demo er alternativ kjøreform, ikke erstatning for v1s faktiske KI-analyse.

## Epic 2: Kontrollere én tilstandsrapport med originalkilde i lokal demo

Investoren kan hente et merket lagret uttrekk gjennom den ekte dokumentpipelinen, kontrollere kilder i original-PDF, korrigere/avvise KI-feil, håndtere alvorlig TG3 separat og bekrefte gjeldende liste. Ingen feil eller usikker kandidat blir automatisk dokumentert fakta eller fullført teknisk grunnlag.

| Milepæl | Story | Avgrenset leveranse | Direkte forutsetninger |
|---|---|---|---|
| 1 | 2.1 | Felles dokument-/analysekontrakt og usikkerhets-/feilvalidering | 1.1 |
| 1 | 2.2 | PDF-format, sidegrense og originalidentitet med faktiske fixtures | 2.1 |
| 1 | 2.3 | Sidemerket tekstuttrekk og avklart lesbarhetskontroll | 2.1, 2.2 |
| 1 | 2.4 | Rapport-/versjonsbundet demo-adapter | 2.1, 2.2, 2.3 |
| 1 | 2.5 | Ett HTTP-analyseforløp med duplikatsperre og trygge feil | 1.2, 2.1, 2.2, 2.3, 2.4 |
| 1 | 2.6 | Velge rapport, starte analyse og ta imot bare gjeldende svar | 1.6, 1.7, 2.1, 2.5 |
| 1 | 2.7 | Kontrollere funn på korrekt originalside og i PDF-panel | 2.2, 2.6 |
| 2 | 2.8 | Kontrollere og korrigere funn med original/utkast/Bruk/Avbryt | 2.1, 2.6, 2.7 |
| 2 | 2.9 | Avvise feilaktig KI-funn med bevart opphav | 2.8 |
| 2 | 2.10 | Registrere og validere forholdsbundet TG3-avklaring | 1.6, 2.8, 2.9 |
| 2 | 2.11 | Bekrefte gjeldende funnliste og vise ufullstendig grunnlag riktig | 1.6, 2.6, 2.8, 2.9, 2.10 |

Milepæl 1 er demonstrerbar etter 2.7 og milepæl 2 etter 2.11. Moduler og HTTP testes direkte før senere UI finnes; ingen story krever en senere story for sin avgrensede verifikasjon. Ingen jobbkø, database, OCR, ny brukerhandling eller ekstra dokumenttype opprettes. Antallet viser reelt avgrensede arbeidsområder i en kompleks epic, ikke elleve nye produktfunksjoner eller et tidsestimat.

### Story 2.1: Dele og validere dokument-/analysekontrakten

Som utvikler,
vil jeg ha én felles versjonert kontrakt for dokumentgrunnlag, funn, usikkerhet og feil,
slik at alle moduler skiller fullføring fra feil og bruker samme kildeidentitet.

**Kravspor:** FR-6–FR-9 og kontraktgrunnlag for FR-10/FR-11; NFR-1; S3/S4; AD-1/AD-4/AD-6/AD-10; SPEC CAP-2/CAP-3/CAP-8 og grensekontraktens sidemerkede grunnlag/analyseutfall/opprinnelig uttrekk. UX-DR11–UX-DR13/UX-DR24/UX-DR25 er senere konsumenter, ikke UI levert her.

**Avhengigheter:** 1.1. **Arbeidsgrense:** Runtime-schemas med avledede typer i contracts og felles validering av retur/kilde. Detaljeres før første forbruker innen låst betydning; ingen konkurrerende frontend-/backend-DTO eller leverandørskjema som appautoritet.

**Acceptance Criteria:**

**Given** et dokumentgrunnlag og terminalt analyseutfall
**When** felles runtime-validering kjøres
**Then** kontrakt-/uttrekksversjon, requestId, reportHash, modus, sideantall og eksplisitt completed/failed behandles etter samme schemas på begge sider
**And** pages har én post per PDF-posisjon med tekst/status; nødvendige felter eller svar kan ikke mangle og likevel bety suksess. **(AC1)**

**Given** completed med findings: [], manglende findings eller failed uten funn
**When** svarene valideres som separate varianter
**Then** bare den første er gyldig fullført tomliste
**And** document-/analysis-feil har stabil kode, berørt mål når kjent og trygg kjent årsak; eventuelle delresultater er fortsatt ufullstendige. **(AC2)**

**Given** grad/kilde/side som er uklar, mangler eller er utenfor rapportens sideantall
**When** uttrekket valideres
**Then** kontrollerbare TG2/TG3 skilles fra usikre kandidater med bevart originalt opphav og konkret kjent mangel
**And** ingen side/grad gjettes, og konfidensprosent gjør ikke kandidaten til bekreftet fakta. **(AC3)**

**Given** adapterinnhold og metadata fra backend-konteksten
**When** analysens dokument-/korrelasjonsidentitet settes og kontrolleres
**Then** reportHash og dokument/request-/modusmetadata kommer fra kode og faktisk mottatt rapportkontekst, ikke fra modellvalgte verdier
**And** gyldig struktur/kildeområde påstås ikke å bevise semantisk fullstendighet eller brukerbekreftelse. **(AC4)**

**Testkrav:** Vitest mot gyldig funnliste/tomliste, manglende/ugyldige felter/versjoner/terminalstatus, feil med/uten delresultat og RT-7s usikre/umulige kilder. Test metadata som forsøkes erstattet av adapteren. Ingen betalt API, PDF-parser eller senere UI kreves; faktisk bytehash og klientkorrelasjon kobles i sine stories.

### Story 2.2: Validere PDF-format, sidegrense og originalidentitet

Som investor,
vil jeg at appen kjenner igjen støttet dokumentformat og riktig originalrapport,
slik at en feil fil eller en for lang rapport ikke brukes som analysegrunnlag.

**Kravspor:** FR-6/FR-8/FR-9; NFR-1/NFR-4; S3/S4 og fixturegrunnlag for S2; AD-3/AD-4/AD-9/AD-10; SPEC CAP-2 og rapportoriginal. UX-DR10/UX-DR24/UX-DR25 konsumerer modulutfallet i 2.6.

**Avhengigheter:** 2.1. **Arbeidsgrense:** Backend dokumentkomponent leser faktiske bytes med låst PDF.js legacy-build, teller sider og beregner SHA-256. Format/sidevalidering er ikke tekstlesbarhet eller fullført analyse. Fiktive casefiler og uavhengig dokumentfasit etableres her før de brukes; mer spesifikke feilfixtures legges til når deres logikk bygges.

**Acceptance Criteria:**

**Given** faktiske tekstbaserte PDF-er på 30 og 31 sider
**When** format-/sidesteget kjøres
**Then** 30 er innenfor grensen og 31 gir dokumentfeil med årsak
**And** ikke-PDF eller uleselig PDF-container blir ikke støttet dokumentgrunnlag eller fullført tomliste. **(AC1)**

**Given** én PDF med identiske bytes under ulike filnavn og en endret PDF med samme filnavn
**When** backend beregner rapportidentitet
**Then** identiske bytes gir samme SHA-256 og endrede bytes en ny identitet
**And** filnavn er visningsmetadata, aldri autoritativ identitet eller serversti. **(AC2)**

**Given** en PDF som består format-/sidesteget, men kan mangle tekstlag
**When** dette delutfallet returneres til dokumentpipelinen
**Then** originalbytes og korrekt sideantall er tilgjengelige for neste dokumentsteg
**And** formatgodkjenning alene blir ikke completed analyse eller påstand om lesbart/tilstrekkelig grunnlag. **(AC3)**

**Given** de låste casene F1–F4
**When** fiktive PDF-er og maskinlesbar fasit lages under tests/fixtures/property-cases/
**Then** F1–F3 har fasitmerket TG2 på PDF-side 2 uten TG3, og F4 har i tillegg «Alvorlig lekkasje i tak» som TG3 på PDF-side 4; dokumentnavn/filside/funntekst/grad og økonomisk casegrunnlag er fastsatt uavhengig av adapteren
**And** trykt sidetall som avviker fra filside kan kontrolleres i RT-5-varianten, og ingen private originaler eller faktisk KI-kjøring påstås fra fiktive data. **(AC4)**

**Testkrav:** Integrasjonstester med faktiske fixturebytes for 30/31 sider, annet format, skadet fil og hash/filnavn-varianter. RT-1s formatdel og RT-2; manuelt kryssjekket PDF-fasit før uttrekk/evaluering. Bevar F3s manglende L; dette gir ikke gyldig S5-hovedstart før tallmangelen er rettet. Finansutfallene kontrolleres i Epic 3, faktisk KI-treff i Epic 4.

### Story 2.3: Trekke ut sidemerket tekst med kontrollert lesbarhet

Som investor,
vil jeg at hele rapportens lesbare tekst beholder riktig PDF-side og kjente begrensninger,
slik at ufullstendig eller feilplassert tekst ikke brukes som et pålitelig grunnlag.

**Kravspor:** FR-6–FR-9; NFR-1; S3/S4 og dokumentgrunnlag for S2; AD-3/AD-4/AD-10; SPEC CAP-2 og sidemerket grunnlag. UX-DR11/UX-DR24/UX-DR25 konsumerer feil/usikkerhet senere.

**Avhengigheter:** 2.1 og 2.2. **Avklaringspunkt:** Dokumentansvar velger/dokumenterer konkret lesbarhets-/layoutkontroll før uttrekk godtas som gyldig, innen eksisterende Deferred. Ingen ny støttebegrensning eller OCR bestemmes gjennom storyen.

**Acceptance Criteria:**

**Given** en formatvalidert støttet PDF
**When** backend trekker ut tekst
**Then** det finnes nøyaktig én pages-post for hver filposisjon 1..pageCount med tekst og uttrekksstatus
**And** trykte sidetall erstatter ikke filposisjon, og ingen sider filtreres eller avkortes i stillhet. **(AC1)**

**Given** kontrollerte sider med TG-tekst, tabeller, kolonner og relevante norske tegn
**When** uttrekket sammenlignes med original og uavhengig fasit
**Then** side/tekst/grad-/beskrivelseskontekst kan kontrolleres etter den dokumenterte lesbarhetsmetoden
**And** sideantall eller gyldig kontrakt alene regnes ikke som dokumentasjon på korrekt lesing. **(AC2)**

**Given** manglende tekstlag, kjent uleselig/ufullstendig tekst eller ukjent/upålitelig lesing
**When** dokumentpipelinen vurderer grunnlaget
**Then** dette gir dokumentfeil med kjent berørt side/årsak når tilgjengelig
**And** tomtekst, eventuelle delresultater eller en bildebasert side presenteres ikke som fullstendig vellykket lesing; ingen OCR startes. **(AC3)**

**Given** blanke sider, blandet tekst/bilde eller tegnkodings-/layoutproblemer
**When** lesbarhetskontrollen prøves mot forhåndsdefinert originalfasit
**Then** valgte kriterier og faktisk forventet utfall per fixture er dokumentert
**And** en vilkårlig tekstlengde eller antatt «ufarlig» blankside brukes ikke som skjult godkjenning av ukjent grunnlag. **(AC4)**

**Testkrav:** Faktiske PDF-bytes med kjent side→tekst, tabeller/kolonner, blanke sider, manglende tekstlag, blandet tekst/bilde og tegnkoding. RT-2/RT-5/RT-9s dokumentdel; ingen adapter kalles for kjent utilstrekkelig grunnlag. Test bare dokumentkomponenten og fasiten her, uten å hevde at S2s semantiske modelltreff er målt.

### Story 2.4: Hente lagret demo-uttrekk bundet til riktig rapport og versjon

Som investor,
vil jeg kunne bruke et tydelig merket lagret uttrekk for demorapporten,
slik at kontrollflyten kan gjennomføres uten nett, nøkkel eller nytt KI-kall.

**Kravspor:** FR-6/FR-7/FR-9; NFR-1/NFR-3/NFR-4; S3/S6; AD-1/AD-4/AD-6/AD-10; SPEC CAP-2/CAP-8. UX-DR1/UX-DR11/UX-DR25/UX-DR40 viser opphavet i senere UI.

**Avhengigheter:** 2.1, 2.2 og 2.3. **Arbeidsgrense:** Den låste smale adaptergrensen og demoimplementasjonen med lagrede kontrollsvar. Samme sidemerkede dokumentgrunnlag som senere live; ingen omgåelse av dokumentpipelinen eller separate anbefalingsregler.

**Acceptance Criteria:**

**Given** et gyldig sidemerket dokumentgrunnlag for en demorapport
**When** backend bruker demo-adapteren
**Then** lagret strukturert uttrekk hentes bare ved samsvarende PDF-bytehash og kontrakt-/uttrekksversjon og valideres etter 2.1
**And** hele det støttede dokumentgrunnlaget brukes ved samme adaptergrense som live, uten ekstern forespørsel. **(AC1)**

**Given** manglende fixture, endrede PDF-bytes eller feil versjon
**When** oppslag forsøkes
**Then** utfallet er eksplisitt analysefeil med trygg kjent årsak
**And** det gjøres ingen live-fallback, nøkkelinnlesing for modellbruk eller nytt betalt kall. **(AC2)**

**Given** lokal standardkonfigurasjon og ingen live-nøkkel
**When** demo-adapteren initialiseres og brukes
**Then** demo er standard, ingen KI-klient opprettes og trygt modusopphav følger utfallet
**And** lagrede svar med kontrollert/fiktivt opphav påstås ikke å være en ny eller gjennomført live-kjøring. **(AC3)**

**Given** kontrollerte lagrede svar med alle fasitfunn, gyldig tomliste og analysefeil
**When** de ulike svarvariantene kjøres ved adaptergrensen
**Then** opprinnelige funn/usikkerheter eller feil beholdes i korrekt kontrakttilstand
**And** demo leverer ingen finansverdi, anbefaling, reparasjonsestimat eller ny tilstandsgrad. **(AC4)**

**Testkrav:** Integrasjon med ekte rapportbytes/dokumentpipeline og lagret svar, hash-/versjonsmismatch, manglende fixture og nett sperret; kontraktens tomliste/feilvarianter. RT-15 og AD-6; kontroller fravær av modellklient/fallback/leverandørkall. Fasit forblir uavhengig av demo-output, og tester rapporteres ikke som S2/live-S5-bevis.

### Story 2.5: Gjennomføre ett HTTP-analyseforløp med duplikatsperre

Som investor,
vil jeg at en eksplisitt analysestart behandles én gang med tydelig sluttstatus,
slik at dobbeltstart, avbrudd og feil ikke lager ekstra analyser eller falsk fullføring.

**Kravspor:** FR-6/FR-9 og grunnlag for FR-18; NFR-1/NFR-4/NFR-5; S3/S6; AD-1/AD-3–AD-6/AD-9/AD-10; SPEC CAP-2/CAP-7/CAP-8 og Dokument- og analysegrense. Dette er backend-grensen, ikke klienten i 2.6.

**Avhengigheter:** 1.2, 2.1, 2.2, 2.3 og 2.4. **Avklaringspunkt:** Backendansvar dokumenterer konkrete upload-/HTTP-timeoutressurser og opprydding før HTTP-integrasjonen tas i bruk. Grenser testes mot støttet input; 30-sidersomfang og S5s medianmål endres ikke i stillhet.

**Acceptance Criteria:**

**Given** én eksplisitt POST /api/analysis med rapportbytes og aktiv korrelasjonskontekst
**When** backend behandler forespørselen
**Then** dokumentvalidering/tekstuttrekk, lokalt adaptervalg og resultatvalidering kjøres sekvensielt før ett terminalt svar
**And** backend setter rapport-/korrelasjonsmetadata i kode og returnerer ingen finansresultat eller screeninganbefaling. **(AC1)**

**Given** samme aktive økt, lokale modus og backendberegnede rapporthash
**When** to forespørsler når adaptergrensen, også med ulik requestId/analysegenerasjon
**Then** en prosesslokal markør satt før første adapterkall hindrer et andre kall og gir tydelig duplikatfeil
**And** sperren kan ikke omgås ved ny requestId eller generasjon. **(AC2)**

**Given** satt duplikatmarkør og et klientavbrudd, adapterfeil eller timeout
**When** samme nøkkel forsøkes igjen før serverstopp
**Then** markøren er fortsatt beholdt og ingen ny adapterkjøring starter
**And** det innføres ingen automatisk retry, jobb-ID, polling eller gjenopptakbart jobb-API. **(AC3)**

**Given** dokumentfeil, analysefeil, transport-/timeoutproblem eller ugyldig adapterretur
**When** HTTP-forløpet avsluttes
**Then** trygg document-/analysis-feil med stabil kode/mål/kjent årsak beholdes etter kontrakten
**And** HTTP 200, ingen funn eller eventuelle delresultater kan ikke alene regnes som fullført analyse. **(AC4)**

**Given** mottatte bytes, filnavn og midlertidige PDF-/tekstressurser
**When** normalforløp og feil/avbrudd håndteres
**Then** filnavn brukes ikke som serversti og den dokumenterte oppryddingen gjennomføres
**And** private rapporter/tekst/nøkler eksponeres ikke gjennom statisk server, feil eller logger. **(AC5)**

**Testkrav:** HTTP-integrasjon med kontrolladapter ved samme grense: normalretur, dokumentfeil før adapter, ugyldig retur, samtidige duplikater, ny requestId/generasjon, timeout og brutt klientforbindelse. Verifiser eksakt adapterkalltall, sperre til serverstopp, ressurs-/oppryddingsatferd og trygge feil med fiktive data. RT-1s forløpsdel/RT-2/RT-9/RT-19 og AD-5. Ekte leverandør/SDK testes i Epic 4, ikke her.

### Story 2.6: Velge rapport og ta imot bare gjeldende analyseutfall

Som investor,
vil jeg velge rapport, starte analysen eksplisitt og se riktig status og funnliste,
slik at ufullstendige eller gamle svar ikke blir grunnlag for kontrollen.

**Kravspor:** FR-4/FR-6–FR-9/FR-11 og gyldighetsgrunnlag for FR-18; NFR-1/NFR-2/NFR-3/NFR-5; S3/S4 og S5-målepunktenes hendelser; AD-2/AD-4–AD-6/AD-9/AD-10; SPEC CAP-2/CAP-7/CAP-8. UX-DR1–UX-DR4/UX-DR10–UX-DR13/UX-DR24/UX-DR25/UX-DR32–UX-DR38/UX-DR40.

**Avhengigheter:** 1.6, 1.7, 2.1 og 2.5. **Arbeidsgrense:** Frontendens rapport-/analyseforløp, svarvalidering og visning av alle funn/usikkerheter. Original-PDF-visning og kontrollhandlinger følger senere stories uten å være forutsetning for å verifisere mottak/status.

**Acceptance Criteria:**

**Given** gjeldende bekreftet gyldig tallgrunnlag og én valgt rapport
**When** brukeren velger Start analyse
**Then** ett POST-forløp starter med gjeldende økt/rapport/request-/generasjonskontekst, Analyserer vises og dobbeltstart sperres
**And** manglende grunnlag eller fil forklares lokalt uten skjult standard, automatisk analyse eller nødvendig omvei til Resultat. **(AC1)**

**Given** et svar fra backend
**When** frontend vurderer svaret
**Then** både runtime-struktur og samsvar med aktiv økt, rapporthash, requestId og analysegenerasjon kontrolleres før bruk
**And** manglende/ugyldig/mismatchet svar for den aktive forespørselen gir tydelig analysefeil fremfor gjeldende fullføring, selv ved HTTP 200; et svar fra en allerede forlatt generasjon håndteres etter AC3. **(AC2)**

**Given** pågående analyse som forlates eller en rapport som erstattes
**When** et sent svar kommer, også etter best effort-abort
**Then** den gamle generasjonen er ugyldig og svaret kan ikke bli gjeldende rapportgrunnlag
**And** ny rapport krever ny analyse/kontroll; tidligere uttrekk, bekreftelse og TG3-grunnlag er ikke gjeldende for den nye rapporten. **(AC3)**

**Given** validert completed, gyldig tomliste eller document-/analysis-feil
**When** utfallet vises
**Then** alle funn har grad/kort beskrivelse/dokument/PDF-side eller tydelig usikkerhet; gyldig tomliste og feil er ulike tekstlige tilstander
**And** fullføring setter ingen brukerbekreftelse; feil/delresultater forblir ufullstendige og gir lokale kodebaserte mangelutfall gjennom domain fra 1.6. **(AC4)**

**Given** eksisterende uttrekk for uendret rapport i aktiv økt
**When** brukeren går tilbake eller endrer/bekrefter finansgrunnlaget
**Then** uttrekk og fortsatt gyldig rapportkontroll gjenbrukes uten HTTP-/adapter-/KI-kall
**And** rapportens egne mangler oppheves ikke av finansendringen. **(AC5)**

**Given** analysefullføring/feil og synlig funnliste
**When** status endres og brukeren navigerer med tastatur
**Then** relevant kort status kunngjøres én gang uten unødvendig fokusflytting, og modus/ufullstendighet/trinn er tekstlig tydelig
**And** S5s ferdiglistehendelse er når den validerte listen faktisk er synlig, ikke bare når et kall er slutt; ingen timer-/telemetrifunksjon innføres. **(AC6)**

**Testkrav:** Rene reducer-/forløpstester og bygget app med kontrolladapter: manglende tall/rapport, dobbeltstart, gyldig/ugyldig/tomt/feilet svar, feil identitet, sent svar etter rapportbytte/forlatt analyse og gjenbruk. RT-3/RT-4/RT-7/RT-9/RT-10/RT-15/RT-19, relevante AT-13/AT-18 og TT-2/TT-3/TT-9-hendelser. Tell kall og kontroller faktisk synlig status; ikke mål live-tid fra demo. Original/PDF-panelet kreves ikke for denne storyens mottaks-/statusverifikasjon.

### Story 2.7: Kontrollere funnets kilde i original-PDF og smalt panel

Som investor,
vil jeg se korrekt originalside ved valgt funn og kunne lese hel side og nabosider,
slik at kildekontrollen kan gjennomføres i samme arbeidsflate.

**Kravspor:** FR-8/FR-9; NFR-2/NFR-3; S4; AD-2/AD-3/AD-4/AD-9/AD-10; SPEC CAP-3 og rapportoriginal. UX-DR7/UX-DR12/UX-DR13/UX-DR17/UX-DR27/UX-DR28/UX-DR30/UX-DR31/UX-DR33–UX-DR35/UX-DR38/UX-DR40; pdf-viewer og Responsive & Platform.

**Avhengigheter:** 2.2 og 2.6. **Arbeidsgrense:** Frontend PDF.js browser-build med lokalt bundlet matchende worker og originale bytes. Ingen ny analyse, standard separat fane eller påkrevd tekstfremhevingsfunksjon.

**Acceptance Criteria:**

**Given** et valgt kontrollerbart funn på PDF-side 4 med avvikende trykt sidetall
**When** funnet velges
**Then** riktig side i originalrapporten vises automatisk med dokumentnavn og filside telt fra 1
**And** brukeren kan lese hel side/nabosider uten å forlate kontrollflaten; trykt side erstatter ikke PDF-siden. **(AC1)**

**Given** en bred visning fra 1200 CSS px
**When** funnkontrollen vises
**Then** funn og original-PDF ligger side om side etter DESIGNs om lag 44/56-fordeling og avstander
**And** lokale worker-/PDF-/nødvendige visningsressurser fungerer uten eksternt nett. **(AC2)**

**Given** smalere visning eller tilsvarende zoom
**When** brukeren åpner PDF fra valgt funn
**Then** et behovsåpnet panel viser riktig kilde-side, kort funnkontekst og tydelig Tilbake til funnkontroll
**And** paneloverskriften får fokus, fokus holdes i panelet, og lukking/Esc returnerer til åpneren med valgt funn/posisjon/kontekst bevart; ingen standard stablet PDF. **(AC3)**

**Given** ukjent/ugyldig side, faktisk lasting eller visningsfeil
**When** kilden forsøkes vist
**Then** kjent tilstand/årsak og berørt dokument/side er synlig, uten gjettet navigasjon
**And** visningsfeil skjules ikke eller utløser ny KI-analyse; dokument-/analyseutfallet omskrives ikke til en annen påstått fullføring. **(AC4)**

**Given** tastaturstyrt funnvalg og sidekontroller
**When** PDF-siden skifter eller blir tilgjengelig/feiler
**Then** fokus beholdes på funnet ved automatisk sideskift, kontroller har semantiske navn/synlig fokus og kort kunngjøring navngir dokument/forespurt eller aktuell PDF-side
**And** zoom/stepper/fargebruk skjuler ikke kilde, tekststatus eller kontrollhandlinger. **(AC5)**

**Testkrav:** Bygget app med kontrolladapter og ekte PDF-bytes, RT-5/RT-7/RT-8, hel side/nabosider, feilside/visningsfeil, raskt funn-/sidebytte uten gammel side presentert som ny, lokal worker og nett sperret. Manuell tastatur/fokus/Esc/retur, 1440×900/1280×800/smalere panel/zoom og praktiske kontrastmål fra DESIGN. Bevaring av senere redigeringsutkast i samme panel kontrolleres i 2.8 når utkast finnes. **Milepæl 1 kan demonstreres etter denne storyen.**

### Story 2.8: Kontrollere og korrigere funn med bevart original og utkast

Som investor,
vil jeg kunne bekrefte et kontrollert funn eller rette et feilaktig uttrekk mot originalen,
slik at gjeldende funn og opprinnelig KI-feil kan skilles.

**Kravspor:** FR-8/FR-10/FR-11 og endringsgrunnlag for FR-18; NFR-1/NFR-2; S3/S4; AD-2/AD-4/AD-10; SPEC CAP-3/CAP-7. UX-DR12–UX-DR17/UX-DR24/UX-DR25/UX-DR31–UX-DR35/UX-DR38/UX-DR40; finding-actions/edit/origin-detail.

**Avhengigheter:** 2.1, 2.6 og 2.7. **Arbeidsgrense:** Enkeltfunnkontroll, gjeldende liste, immutabelt uttrekk og korrigeringsutkast. Avvisning, separat TG3-avklaring og eksplisitt listebekreftelse leveres i egne neste stories. Ingen av dem kreves for direkte verifikasjon av utkast-/bruksovergangene.

**Acceptance Criteria:**

**Given** et funn kontrollert mot originalrapporten
**When** brukeren velger Bekreft for enkeltfunnet
**Then** funnets kontrollstatus og kilde er synlig uten å endre opprinnelig grad/tekst/kilde
**And** handlingen er verken listebekreftelse eller TG3-avklaring. **(AC1)**

**Given** originalt KI-uttrekk og eventuell gjeldende brukt korrigering
**When** brukeren redigerer grad, beskrivelse eller PDF-side
**Then** endringen er et tydelig merket utkast uten virkning på gjeldende liste/grunnlag
**And** original, utkast og gjeldende versjon kan skilles; uferdig utkast bevares ved funn-/trinnretur og PDF-panellukking. **(AC2)**

**Given** et utkast med kontrollerbar rapportkilde
**When** brukeren velger Bruk korrigering
**Then** korrigeringen blir gjeldende, merkes brukerkorrigert og enkeltfunn-/listebekreftelsen oppheves
**And** opprinnelig KI-informasjon beholdes, grunnlagsrevisjonen endres og intet nytt adapter-/KI-kall skjer. **(AC3)**

**Given** et utkast eller en retting uten kontrollerbar side/kilde
**When** brukeren velger Avbryt eller forsøker å bruke ugyldig grunnlag som separate varianter
**Then** Avbryt fjerner utkastet og bevarer gjeldende versjon/status, mens ugyldig korrigering gir konkret felt-/kildemangel og ikke dokumentert rapportfakta
**And** ingen ny grad eller side gjettes. **(AC4)**

**Testkrav:** Rene reducer-tester for uendret Bekreft, utkast uten mutasjon av gjeldende grunnlag, Bruk/Avbryt, bevart original og liste-/enkeltfunnstatus. RT-11-variant med uavhengig originalfasit TG2 på side 5 og kontrollsvar TG3 på side 4; side utenfor dokumentet; tastatur/fokus og bevart utkast ved panel/funn/trinnretur. Resultatets opplysning om ubrukt utkast og historisk snapshot testes i Epic 3; tilstanden forberedes her uten å kreve den flaten.

### Story 2.9: Avvise feilaktig KI-funn med bevart opphav

Som investor,
vil jeg eksplisitt avvise et KI-funn som ikke finnes i originalrapporten,
slik at det ikke brukes som aktivt rapportfunn og KI-feilen fortsatt er etterprøvbar.

**Kravspor:** FR-10/FR-11; NFR-1/NFR-2; S3/S4; AD-2/AD-4/AD-10; SPEC CAP-3/CAP-7. UX-DR12/UX-DR14/UX-DR16/UX-DR24/UX-DR25/UX-DR34/UX-DR38/UX-DR40.

**Avhengigheter:** 2.8. **Arbeidsgrense:** Eksplisitt avvisning og gjeldende aktiv liste med tilgjengelig avvist original. Ingen ny teknisk tilstandsgrad, utbedring eller avklaringshandling.

**Acceptance Criteria:**

**Given** et KI-funn brukeren har kontrollert og mener er feilaktig
**When** brukeren velger Avvis
**Then** funnet merkes brukeravvist og holdes utenfor aktive rapportfunn
**And** original grad/tekst/kilde og brukeravvisningen forblir tilgjengelige. **(AC1)**

**Given** gjeldende liste før avvisning
**When** et aktivt funn avvises
**Then** listegrunnlaget/revisjonen endres og eventuell listebekreftelse er ikke gyldig for den endrede listen
**And** andre funns originaler/kontrollstatus endres ikke som følge av avvisningen alene. **(AC2)**

**Given** et avvist KI-uttrekk med påstått TG3
**When** avvisningen presenteres
**Then** den beskrives som brukeravvist uttrekk, ikke gyldig TG3-avklaring, utbedring eller teknisk godkjenning
**And** en dokument-/analysefeil blir ikke fullført ved at funn avvises. **(AC3)**

**Given** samme brukeravvisning eller retur til funnkontroll
**When** handling/visning gjentas
**Then** aktiv/avvist status er konsistent uten tap av original eller doble brukerendringer
**And** ingen HTTP-/adapter-/KI-analyse starter. **(AC4)**

**Testkrav:** RT-12 med faktisk dokumentfasit og kontrolladapterens oppdiktede funn; rene tilstandsoverganger for aktiv liste/original/listegyldighet og gjentakelse. UI-/manuell kontroll av tekstlig avvist opphav og tastaturhandling. Den eksplisitte listebekreftelsen kommer i 2.11; tester her kan kontrollere opphevet bekreftelsesmetadata uten den senere handlingen.

### Story 2.10: Registrere og validere separat TG3-avklaring

Som investor,
vil jeg registrere status, begrunnelse og konkret grunnlag for relevante alvorlige TG3-funn,
slik at avklaringsbehovet vurderes uten å fjerne rapportfunnet eller blande avklaring med uttrekkskontroll.

**Kravspor:** FR-5/FR-9 og lokal FR-16/FR-17; NFR-1/NFR-2; S3/S4; AD-2/AD-8/AD-10; SPEC CAP-4/CAP-7 og forholdsbundet TG3-avklaring. UX-DR14/UX-DR18/UX-DR24/UX-DR25/UX-DR32–UX-DR36/UX-DR38/UX-DR40.

**Avhengigheter:** 1.6, 2.8 og 2.9. **Arbeidsgrense:** Registrert brukeravklaring og dens anvendbarhet i felles validering/domain, med lokal mangelvisning. Ingen vedlegg, ekstern verifisering, automatisk semantisk klassifisering eller ny brukerhandling for å overføre avklaring.

**Acceptance Criteria:**

**Given** et relevant alvorlig TG3-funn
**When** brukeren registrerer Avklart
**Then** gyldig avklaring krever eksplisitt status og både ikke-tom begrunnelse og konkret avklaringsgrunnlag etter trimming
**And** ukjent/Uavklart/manglende/ugyldig status eller tekst behandles som uavklart med konkrete lokale mangler. **(AC1)**

**Given** gyldig brukerregistrert avklaring
**When** funnet vises
**Then** original TG3-grad, beskrivelse, dokument/PDF-side og separat status/begrunnelse/grunnlag er tilgjengelige
**And** avklaringen merkes brukerbekreftet for førstevurdering, ikke KI-fakta, nødvendigvis utbedret eller teknisk godkjent. **(AC2)**

**Given** to alvorlige TG3-funn, bare ett gyldig avklart
**When** gjeldende mangler vurderes gjennom domain
**Then** det andre funnet og dets avklaringsbehov gir Innhent mer informasjon
**And** gyldig avklaring av ett eller alle funn gir ikke automatisk Gå videre eller endrer finansverdier/formler. **(AC3)**

**Given** registrert TG3-avklaring og en brukt retting av funnet
**When** felles validering vurderer avklaringens binding til gjeldende rapportforhold/grunnlag
**Then** representasjonsretting av samme forhold kan bevare anvendbarhet, mens kjent motstrid/ukjent tilhørighet er utilstrekkelig
**And** samme findingId alene overfører ikke avklaring til et annet teknisk forhold; state/UI/screening har ingen konkurrerende tolkning. **(AC4)**

**Given** registrert status/begrunnelse/grunnlag
**When** en av disse faktisk endres eller nødvendig tekst blir tom
**Then** gjeldende mangler og TG3-revisjon følger det nye grunnlaget, uten ny analyse eller ugyldiggjøring av uendrede finans-/listebekreftelser alene av denne grunnen
**And** Uavklart kan beholdes som brukerens status; full økonomisk screening og historisk resultatsnapshot følger Epic 3. **(AC5)**

**Testkrav:** Sju FR-5-eksemplers avklarings-/mangeldel, blank/mellomrom/ukjent, ett av to funn uavklart og statusendring. Kontroller samme-forhold-korrigering kontra endret/ukjent forhold med stabil findingId og ny rapport. Rene validator-/reducer-tester og lokal UI med tekst/fokus. Økonomiske utfall i FR-5/AT-7–AT-9/AT-20 fullføres med Epic 3; uendrede listebekreftelser ved TG3-endring kontrolleres også med faktisk listehandling i 2.11.

### Story 2.11: Bekrefte gjeldende funnliste med tydelig tilstrekkelighet

Som investor,
vil jeg eksplisitt bekrefte den listen jeg har kontrollert og se det som fortsatt er uavklart,
slik at listekontroll, analysefullføring og TG3-avklaring ikke forveksles før screening.

**Kravspor:** FR-5/FR-9/FR-10/FR-11 og lokale FR-16/FR-17; NFR-1/NFR-2/NFR-3/NFR-5; S3/S4 og kontrollhendelsen til S5; AD-2/AD-4/AD-6/AD-8/AD-10; SPEC CAP-3/CAP-4/CAP-6/CAP-7/CAP-8. UX-DR2/UX-DR11–UX-DR19/UX-DR24/UX-DR25/UX-DR32–UX-DR38/UX-DR40/UX-DR41.

**Avhengigheter:** 1.6, 2.6, 2.8, 2.9 og 2.10. **Arbeidsgrense:** Separat bekreftelse av gjeldende liste og korrekt felles kontroll-/mangelgrunnlag. Resultatflaten, økonomiske terskler og historisk resultatsnapshot er fortsatt Epic 3; ingen ny navigasjonsvei omgår nødvendige kontrollsteg.

**Acceptance Criteria:**

**Given** fullført validert analyse med kontrollert gjeldende funnliste
**When** brukeren eksplisitt bekrefter listen
**Then** bekreftelsen er bundet til gjeldende rapport/listerevisjon med brukerens rettinger/avvisninger og synlig opphav
**And** enkeltfunnets Bekreft eller avsluttet analyse har ikke allerede satt denne listebekreftelsen. **(AC1)**

**Given** completed med findings: [] eller en manglende/feilet analyse som separate varianter
**When** brukeren kontrollerer og eventuelt bekrefter gjeldende liste
**Then** bare faktisk fullført analyse kan gi et tilstrekkelig tomt rapportgrunnlag etter nødvendig brukerbekreftelse
**And** korrigering/avvisning/bekreftelse kan aldri gjøre document-/analysis-feil, ufullstendig lesing eller uløst kritisk usikkerhet til fullført/tilstrekkelig analyse. **(AC2)**

**Given** bekreftet liste med uavklart/ugyldig alvorlig TG3
**When** kontrollen fullføres og felles mangler vurderes
**Then** listekontrollen kan være fullført samtidig som TG3 fortsatt er uavklart og gir Innhent mer informasjon med alle kjente avgjørende mangler
**And** brukeren presses ikke til Avklart for å fullføre kontrollen eller nå S5s tidsmål. **(AC3)**

**Given** bekreftet liste
**When** en korrigering brukes, et funn avvises eller rapporten erstattes
**Then** nødvendig ny listekontroll/bekreftelse og ved ny rapport ny analyse kreves; gammel status gjelder ikke nytt grunnlag
**And** uendret retur, rent utkast og separat TG3-endring følger hver sin bevaringsregel; ingen unødvendig ny analyse eller generell nullstilling av uendrede bekreftelser. **(AC4)**

**Given** demoens kontrollflyt med funn/original/brukerendringer/TG3
**When** den gjennomføres med tastatur og eksternt nett sperret
**Then** gjeldende steg/status, opphav og mangler kan forstås med lesbar tekst/fokus og lokale meldinger
**And** S5s kontrollslutthendelse er gjennomført kontroll med håndtert TG3-status og bekreftet gjeldende liste, uten ny timer-/telemetrifunksjon eller påstand om målt live-tid. **(AC5)**

**Testkrav:** RT-10–RT-14/RT-19 og relevante AT-13/AT-18, med gyldig tomliste kontra feil, kritisk usikkerhet, korrigering/avvisning etter bekreftelse, rapportbytte, ubrukt utkast og uendret retur. Ekte listehandling etter separat TG3-endring skal bevare uendrede bekreftelser korrekt. Bygget app med kontrolladapter og ekte PDF, uten betalt API; manuell tastatur/status/oppfattelse av de tre kontrollbegrepene. TT-4/TT-5/TT-6s hendelser kan kontrolleres; faktisk S5-evaluering følger senere. **Milepæl 2 kan demonstreres etter denne storyen.**

## Epic 2: dekningskontroll til gjennomgangen

| Krav / beslutning | Planlagt storydekning |
|---|---|
| FR-5 | 2.10 separat status/tekst/binding/validering; 2.11 skille fra listekontroll. Full økonomisk effekt/resultat i Epic 3. |
| FR-6 | 2.2 format/side/hash, 2.3 faktisk tekst, 2.4 demo, 2.5 HTTP/vern, 2.6 eksplisitt start/gjenbruk/ny rapport. Ekte KI-kall i Epic 4. |
| FR-7 | 2.1 kilde-/funnkontrakt, 2.2 uavhengig fasit, 2.4 lagret uttrekk, 2.6 alle funn synlige. Faktisk uttrekk/ingen relevansfilter og S2 i Epic 4. |
| FR-8 | 2.1 kildestatus, 2.2 originalidentitet, 2.6 kildevisning, 2.7 riktig originalside/hel side/nabosider/panel; bevares gjennom 2.8–2.11. |
| FR-9 | 2.1 tomliste/feil/usikre kandidater, 2.2/2.3 dokumentfeil, 2.4/2.5 analysefeil, 2.6 lokale kodeutfall, 2.11 kontroll gjør ikke feil fullført. |
| FR-10 | 2.8 kontroll/utkast/Bruk/Avbryt/oppbevart original; 2.9 avvisning; integrasjon i 2.10/2.11. |
| FR-11 | 2.6/2.8/2.9 bevarer ubekreftet/relevant ugyldiggjøring; 2.11 eksplisitt gjeldende listebekreftelse. |
| Lokale FR-16/FR-17 / CAP-6 | 2.6/2.10/2.11 kobler kjente dokument-/analyse-/kontroll-/TG3-mangler til felles domain-autoritet fra 1.6, med alle avgjørende mangler. Komplett screening i Epic 3. |
| AD-3/AD-4/AD-5/AD-6 | 2.1–2.6 dokument/kontrakt/identitet/demo/HTTP/duplikat/sent svar og gjenbruk; kontrollert ved modul-/integrasjonsgrenser. |
| AD-2/AD-8 | 2.6 rapport/generasjon, 2.8/2.9 original/utkast/gjeldende liste og 2.10 forholdsbundet avklaring; 2.11 separat listekontroll. Snapshot vises i Epic 3. |
| NFR-1/NFR-3/NFR-4 | Rene og integrerte grense-/feiltester, nett-/nøkkelfri demo, trygg byte-/ressurshåndtering og ingen skjult live-fallback. Full S6 i Epic 5, faktisk nøkkel-/leverandørintegrasjon i Epic 4. |
| NFR-2 / UX-DR10–UX-DR19/UX-DR30–UX-DR35 | 2.6 analyse/funn/status, 2.7 original/PDF/panel/fokus, 2.8–2.11 kontroll/utkast/TG3/liste og lokale feil/tastatur. Faktiske visuelle tokens videreføres fra Epic 1. |
| NFR-5 / S5 | 2.6 ferdig liste faktisk synlig; 2.11 fullført kontroll med håndtert TG3/listebekreftelse. Måling er senere evalueringsarbeid, ikke ny appfunksjon. |
| CAP-2/CAP-3/CAP-4/CAP-7/CAP-8 | Rapport-/kontroll-/avklarings-/øktdelen realiseres i merket demo. Live og samlet økonomisk resultat leveres i sine godkjente epics. |

Story 2.2 leverer faktisk case-/dokumentfasit som arbeidsomfang. Ekstra feilfixtures følger logikken som trenger dem; ingen fasit tilpasses et modell- eller demosvar. Ingen ny test-ID-serie, dekningsprosent, tidsfrist eller modell-/ressursverdi fastsettes her.

## Gjennomgang og videreføring

Gjennomgangen er avsluttet med Mads’ C-godkjenning av 2.1–2.11 og videreføring til Epic 3. Storytekstene er kopiert uendret til epics.md og godkjenningsstatusen er registrert. Den fullstendige storygrafen og gjennomførbarheten vurderes ved ferdig oppdeling/readiness før kodearbeid; godkjenningen er ikke implementeringsstart eller en påstand om beståtte produkttester.
