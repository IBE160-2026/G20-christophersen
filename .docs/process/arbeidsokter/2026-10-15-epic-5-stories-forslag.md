---
title: "Epic 5: storyforslag til gjennomgang"
created: 2026-10-15
status: approved-and-incorporated
updated: 2026-10-16
workflow: bmad-create-epics-and-stories
step: step-03-create-stories
epic: 5
stories: ["5.1", "5.2", "5.3", "5.4", "5.5"]
approvedStories: ["5.1", "5.2", "5.3", "5.4", "5.5"]
---

# Storyforslag — Epic 5

Mads godkjente story 5.1–5.5 og videreføring til avsluttende validering/readiness med C 2026-10-16. Alle fem er innarbeidet uendret i [epics.md](../../planning-artifacts/epics.md), som nå har 37 godkjente stories. Denne filen bevarer gjennomgangsforslaget og dets dekningskontroll som prosesshistorikk. Ingen implementering er startet.

## Kildeindeks og leseregel

- [PRD](../../planning-artifacts/prds/prd-IBE160-2026-10-10/prd.md): UJ-1, FR-1–FR-18, NFR-1–NFR-5, S1–S6 og K1–K3. [PRD-addendum](../../planning-artifacts/prds/prd-IBE160-2026-10-10/addendum.md): sju FR-5-eksempler, RT-1–RT-19, BT-1–BT-18, AT-1–AT-20 og S5-protokoll/TT-1–TT-9.
- [Brief-addendum](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/addendum.md): F1–F4 med uavhengig tall-/dokument-/regelfasit samt Kjørbarhet, kostnader og repo. [Faglærertilbakemeldingen](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md) lest med [gjeldende oppfølging](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/revisjonskontroll-2026-10-08.md): smal kjerne og rom til test, retting og README.
- [DESIGN](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/DESIGN.md) og [EXPERIENCE](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md): alle komponentpar, visuelle tokens, tilstander, Interaction Primitives, Accessibility Floor, Responsive Behavior og Key Flows 1–4. UX-DR1–UX-DR41 er eksisterende indeks i epics.md; egne skisser/mocks er referanser til final UX, ingen produktbevis.
- [ARCHITECTURE-SPINE](../../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md): AD-1–AD-10, startstakk, Structural Seed, kommandokontrakter og Verifikasjonsgrenser.
- [SPEC](../../specs/spec-IBE160/SPEC.md), [grensekontrakter](../../specs/spec-IBE160/grensekontrakter.md), [sporbarhet](../../specs/spec-IBE160/sporbarhet.md) og [verifikasjon/avklaringer](../../specs/spec-IBE160/verifikasjon-og-avklaringer.md): CAP-1–CAP-8, uendrede akseptansemål og kurs-/leveranseføringer.
- [Sensorveiledning](../../reference/course/Sensorveiledning-IBE160-Del-1.pdf), særlig s. 1–3 om prosess/spor, s. 3–5 om test/UX/arkitektur og s. 5–7 om README/kjørbarhet/repo, samt [AGENTS.md](../../../AGENTS.md). Veiledningen brukes med faglig skjønn og gir ingen nye appfunksjoner eller testdekningsprosent.

Fulltekstkrav og adopterte kompanjonger gjelder. Testene i tidligere stories skal allerede leveres sammen med funksjonen. Denne epicen samler og etterprøver dem; den utsetter ikke finans-/regel-/PDF-/adapter-/overgangstester eller tilgjengelighet til slutten. Faktiske resultater og funn lagres ved senere gjennomføring under .docs/implementation-artifacts/. Viktige prompts og arbeidssesjoner bevares i eksisterende prosessstruktur. Det opprettes ingen testportal, CI-plattform, telemetri, ny datamodell eller utvidet v1-funksjon gjennom disse storyene.

## Epic 5: Gjennomføre og etterprøve v1 som sensor fra README

En annen person kan forstå prosjektet, installere, bygge, starte og teste den lokale demoen fra README uten gruppens nøkkel/betalt konto. Gruppen har etterprøvbare bevis for krav, kvalitet, faktisk KI-funksjonalitet og åpne avvik på den dokumenterte leveranseversjonen.

| Story | Avgrenset leveranse | Direkte forutsetninger |
|---|---|---|
| 5.1 | Samlet automatisk demoregresjon og relevant logikkdekning | 2.11, 3.7, 3.8, 3.9 |
| 5.2 | Dokumentert manuell kontroll av felles UX og tilgjengelighet | 2.7, 3.7, 3.8, 3.9 |
| 5.3 | Faktisk README-oppskrift for lokal demo og tester | 3.9, 5.1 |
| 5.4 | S6: en annen person følger README i rent dokumentert miljø | 5.1, 5.2, 5.3 |
| 5.5 | Samlet krav-/evalueringsbevis, live-anvisning og ryddig leveranserepo | 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4 |

5.1–5.4 kan gjennomføres etter Epic 3 for den leverte demoen, uten leverandør-/nøkkelavhengighet. 5.3 leverer en fullstendig demooppskrift; endelige live-anvisninger og samlet v1-status er uttrykkelig arbeid i 5.5 etter Epic 4. 5.2 dekker den felles brukerflyten; live-spesifikke tilstander kontrolleres i 4.3 og tas med i 5.5. Tidlige bevis gjelder den faktisk prøvde versjonen; berørte endringer krever relevant ny verifikasjon før de brukes som bevis for endelig leveranse.

Ingen story krever en senere story for sin avgrensede verifikasjon. Ingen generell omskriving eller ny testtype bestilles; konkrete avdekkede hull/rettinger spores til funksjonsstory og låst krav. Fullført offline-kjøring er verdifullt S6-bevis, men erstatter ikke produktets påkrevde live-funksjonalitet eller S2/S5-bevis.

### Story 5.1: Etterprøve den samlede demoen med meningsfulle automatiserte tester

Som utvikler,
vil jeg kjøre den leverte logikken og den bygde demoens kjerneflyter samlet mot uavhengig fasit,
slik at integrasjonsfeil og manglende testdekning oppdages før sensor følger oppskriften.

**Kravspor:** FR-1–FR-18 ved relevante demo-/modulgrenser; NFR-1/NFR-3; S1/S3/S4 og testgrunnlag for S6; AD-1–AD-10 ved leverte grenser, særlig AD-7/AD-8/AD-10; SPEC CAP-1–CAP-8 som demoverifikasjon. UX-DR2/UX-DR15/UX-DR18/UX-DR19/UX-DR26/UX-DR36–UX-DR41 knyttes til faktiske flyt-/tilstandstester; manuell UX er 5.2. Sensor s. 3–4 og faglærerens finans-/fasitføring.

**Avhengigheter:** 2.11, 3.7, 3.8 og 3.9. **Arbeidsgrense:** Kjør og sammenstill eksisterende unit-/integrasjons-/bygget-app-tester og fyll bare konkrete hull i den låste kjerneflyten. Fasit er uavhengig; kontrolladapteren bruker samme grense som produktet. Live-SDK-/HTTP-integrasjonen har egne tester i Epic 4 og tas med i samlet leveransebevis i 5.5.

**Acceptance Criteria:**

**Given** den leverte demoen med faktiske PDF-fixtures og forhåndsdefinert fasit
**When** de dokumenterte lokale testene og bygget-app-E2E kjøres
**Then** testene bruker faktiske moduler/grenser og verifiserer forventet funksjon fra kravfasiten, med versjon/kommando/resultat dokumentert
**And** automatisert E2E bruker kontrolladapter og ingen betalt KI-tjeneste; forventede verdier produseres ikke med funksjonen som testes. **(AC1)**

**Given** F1/F2/F3/F4 og relevante BT-/AT-/FR-5-varianter
**When** økonomi og screening kontrolleres
**Then** F1 gir korrekte tall/Gå videre, F2 korrekte tall/Forkast, F3 manglende L/ingen leieavhengige tall/Innhent mer informasjon og F4 uavklart TG3/delgrunnlag/Innhent mer informasjon
**And** null/blank, år/måned, kildekonflikt, negative resultater, likhet/én krone under, begge økonomiske brudd og alle samtidige prioritet-1-utløsere er dekket ved riktig testgrense. **(AC2)**

**Given** dokument-/analyse-/kontrollfeil og endringsforløp
**When** regresjonssuiten kjører
**Then** støttet/ustøttet PDF, kilde/side/usikkerhet, completed-tomliste kontra failed, utkast/Bruk/Avbryt/Avvis, separat TG3/listebekreftelse og historisk/gjeldende resultat etterprøves
**And** duplikat/sent svar/ny rapport og gjenbruk ved finans-/funn-/TG3-endring kontrolleres med faktisk kallantall og revisjon, uten falsk fullføring eller ekstra adapterkall. **(AC3)**

**Given** normal videregang er sperret ved utilstrekkelig grunnlag
**When** feilvarianter testes
**Then** brukerforløpet får korrekt lokal Innhent mer informasjon og nødvendig handling uten en ny snarvei til Resultat
**And** tilstander som ikke kan nås i hovedreisen testes ved ren modul-/reducer-/komponentgrense; testen endrer ikke produktets navigasjon eller bekreftelseskrav. **(AC4)**

**Given** en testfeil eller påvist hull
**When** funnet håndteres
**Then** det kobles til konkret krav/story/forventning, rettes innen låst funksjonsansvar og får relevant ny verifikasjon
**And** resultatet rapporterer faktisk bestått/feilet/ikke kjørt med begrensning; mange tester eller bestått demo brukes ikke som S2-/live-S5-bevis. **(AC5)**

**Testkrav:** Kjør npm test og npm run test:e2e etter faktisk build/browserforberedelse. Spor eksisterende RT-1–RT-19/BT-1–BT-18/AT-1–AT-20 og sju FR-5-eksempler til den testgrensen som faktisk dekkes; RT-16–RT-18s reelle modelltreff er fortsatt 4.4, og TT/S5 er fortsatt egen evaluering. Gjennomgå at sentrale tester kan feile på feil verdi, feil prioritet, feil status/side/revisjon eller ekstra kall, fremfor bare å observere at en handler ble kalt. Ikke innfør ny dekningsprosent, parallell testfasit eller alle tenkelige testtyper.

### Story 5.2: Etterprøve hele den felles brukerflyten og grunnleggende tilgjengelighet

Som investor,
vil jeg kunne forstå og gjennomføre de fire trinnene med lesbare tilstander, originalkontroll og tastatur,
slik at feil, korrigeringer og de tre anbefalingene kan tolkes riktig.

**Kravspor:** NFR-2; FR-1–FR-5/FR-8–FR-11/FR-14–FR-18 og lokale feil etter FR-6/FR-9; S3/S4; AD-2/AD-9/AD-10; SPEC CAP-1/CAP-3/CAP-4/CAP-6/CAP-7/CAP-8 som UX-verifikasjon. UX-DR1–UX-DR41 ved realiserte felles-/demoflater, særlig UX-DR30–UX-DR35/UX-DR39/UX-DR41. Sensor s. 4–5 og final DESIGN/EXPERIENCE.

**Avhengigheter:** 2.7, 3.7, 3.8 og 3.9. **Arbeidsgrense:** Dokumentert manuell kontroll av den leverte felles demo-/kontroll-/resultatflyten mot final UX og eksisterende mocks. Konkrete avvik rettes innen opprinnelig UX-kontrakt. Live-spesifikke konfigurasjons-/leverandørtilstander leveres/kontrolleres i 4.3 og samles i 5.5, uten å blokkere denne offline-kontrollen.

**Acceptance Criteria:**

**Given** bygget demo og de fire Key Flows i final EXPERIENCE
**When** hovedreise, korrigering/TG3-skille, endring etter Resultat og feil/demo gjennomgås manuelt
**Then** eksakte trinnnavn/status, navigasjon, lokale feil, kontroll-/bekreftelsesbegreper, resultat og neste handling stemmer med final UX
**And** utkast, opprinnelig uttrekk, brukt korrigering, avvisning og separat brukerbekreftet TG3-avklaring kan skilles, også etter retur/endring. **(AC1)**

**Given** tastaturbruk i alle fire trinn
**When** felt, funn, handlinger, PDF og detaljseksjoner brukes
**Then** forståelig fokusrekkefølge, synlig fokus, etiketter/enheter/kilder/feil og åpen/lukket-tilstander fungerer, mens skjult innhold er utenfor fokusrekkefølgen
**And** trinnnavigasjon/ugyldig bekreftelse/panelåpning-lukking følger riktig fokusforløp, og viktige statusendringer kunngjøres kort én gang uten fokusstjeling. **(AC2)**

**Given** 1440×900, 1280×800 og relevant zoom/smalere CSS-flate
**When** funn og originalrapport kontrolleres
**Then** korrekt PDF-posisjon, hel side/nabosider, side-ved-side fra 1200 CSS px og behovsåpnet panel under grensen fungerer med valgt funn/kontekst/utkast bevart
**And** Esc/synlig retur gjenoppretter fokus, sticky stepper skjuler ikke fokusert innhold og alle navn/nummer/status/tall/kilder forblir tilgjengelige. **(AC3)**

**Given** tekst, kontrollgrenser, fokus, status og historisk/delvis resultat
**When** faktisk visning sammenlignes med DESIGN
**Then** grafitt-/petroltokens, typografi/geometri og praktiske kontrastmål 4,5:1 for informasjonstekst og 3:1 for nødvendige kontrollgrenser/fokus er ivaretatt
**And** mening gis også med tekst, meningsbærende grafikk har relevant alternativtekst og dekorasjon gir ingen redundant informasjon; ingen sertifisering eller ny mobilreise påstås. **(AC4)**

**Given** de tre anbefalingene og tomt/usikkert/feilet/ubekreftet/utdatert grunnlag
**When** forståelse av resultat og nødvendig handling vurderes
**Then** anbefaling, kort grunn, alle avgjørende regler, fire tall, alvorlige forhold, mangler og neste handling kan forstås uten detaljåpning
**And** original-/formel-/kildedetaljer er tilgjengelige ved behov; Gå videre forstås som videre vurdering, og feil/tomliste/kontroll/TG3/Delgrunnlag/Utdatert blandes ikke. **(AC5)**

**Given** observerte UX-avvik
**When** kontrollen avsluttes
**Then** miljø/størrelse/zoom, case, handling, forventet/faktisk utfall, krav-/UX-spor og eventuell retting/ny kontroll dokumenteres
**And** uavklarte avvik beholder synlig status; mocks, automatisk testresultat eller egen forventning erstatter ikke den faktiske manuelle kontrollen. **(AC6)**

**Testkrav:** Utfør Key Flows 1–4 med F1/F2/F4 og relevante RT-/AT-feil/returvarianter i bygget demo. Dekk ugyldig tallbekreftelse, kildefeil/usikker kandidat, gyldig tomliste kontra analysefeil, originalside/panel/Esc, ubrukt utkast/Bruk/Avbryt, TG3-tekst/status og ny relevant bekreftelse. Registrer faktiske kontrastpar og tastatur-/fokus-/zoom-/statusobservasjoner mot DESIGN/EXPERIENCE. Uendrede kontroller gjentas bare når nye endringer eller funn gjør det nødvendig; dette er ingen ny generell brukerstudie eller testsertifisering.

### Story 5.3: Dokumentere en komplett oppskrift for lokal demo og tester

Som sensor,
vil jeg finne prosjektets formål, forutsetninger og eksakte demo-/testkommandoer i README,
slik at jeg kan kjøre den leverte demoen uten gruppens hjelp eller API-nøkkel.

**Kravspor:** NFR-3/NFR-4; S6; FR-6/FR-15–FR-18 i dokumentert demo; AD-1/AD-6/AD-9/AD-10; SPEC CAP-8 og README-/kjørbarhetsføringene. UX-DR1/UX-DR2/UX-DR36/UX-DR40/UX-DR41 spores gjennom den beskrevne demoflyten; README innfører ingen egen produktflate. Sensor s. 2 og 5–6, faglærerens kjørbarhets-/demoføring og AGENTS.md.

**Avhengigheter:** 3.9 og 5.1. **Arbeidsgrense:** Oppdater prosjektets README med faktisk fungerende installasjon/build/start/test og demooppskrift. Oppskriften skal fungere for demo uavhengig av Epic 4. Endelige detaljer for den leverte live-integrasjonen og full v1-bevisstatus innarbeides i 5.5; det er ingen forutsetning for å levere denne komplette demooppskriften.

**Acceptance Criteria:**

**Given** faktisk levert kode, pakke-/låsfil og lokale kommandokontrakter
**When** README oppdateres
**Then** formål/målgruppe, smal v1, versjonerte forutsetninger og eksakte kopierbare kommandoer for npm ci → npm run build → npm run demo, lokal loopback-adresse og npm run dev beskrives korrekt
**And** README samsvarer med faktisk oppstart og forklarer nødvendige lokale forberedelser uten særskilt infrastruktur eller skjulte globale avhengigheter. **(AC1)**

**Given** lokale tester og bygget-app-E2E
**When** testoppskriften følges
**Then** faktisk browserinstallasjon/forberedelse, npm test og npm run test:e2e med nødvendig build og kontrolladapter er dokumentert
**And** det fremgår hva testene dekker og at automatisert E2E ikke krever en betalt KI-tjeneste. **(AC2)**

**Given** fiktive casefiler og merket demo
**When** en leser følger demoveiledningen
**Then** de kan finne støttet rapport og registreringsgrunnlag, kontrollere original/funn, håndtere TG3 og bruke nødvendige bekreftelser for de tre anbefalingene
**And** blank/null, F3s tallmangel, F4s Uavklart TG3, lokal feilforklaring og retur/ny beregning beskrives uten å omgå kontrolltrinn eller kreve nøkkel/nett under flyten. **(AC3)**

**Given** demooppskriften og live som påkrevd v1-funksjonalitet med separat konfigurasjon
**When** kjøreformene omtales
**Then** demo er standard og krever ingen live-nøkkel; installasjonsnett skilles fra nett-/nøkkelfri demokjøring
**And** live-funksjonens faktiske status beskrives nøkternt, uten å kalle leveransekravet valgfritt eller påstå ferdig integrasjon/evaluering før den foreligger. **(AC4)**

**Given** prosjektets faktiske struktur og eksisterende planer/prosess-/testbevis
**When** dokumentasjonen ferdigstilles
**Then** README forklarer kode-/test-/dokumentasjonsplassering og har gyldige lenker til relevant låst grunnlag, viktige arbeidsøkter/prompts og tilgjengelige bevis
**And** eksempler/kommandoer inneholder ingen ekte hemmeligheter/private originaler, og en egen gjennomkjøring fra oppskriften avdekker manglende steg før annen-person-kontrollen. **(AC5)**

**Testkrav:** Følg de faktiske kommandoene fra README og noter miljø/resultat; kontroller demo med nøkkel fjernet og eksternt nett sperret etter installasjon/browserforberedelse. Åpne de lenkede case-/plan-/prosessfilene og gjennomfør beskrevet feil-/retur-/bekreftelsesflyt mot F1–F4. Verifiser oppskriften ved faktisk kjøring, uten nye enhetstester som bare kontrollerer README-tekst. Egen gjennomkjøring er forberedelse og teller ikke som S6; 5.4 krever en annen person.

### Story 5.4: La en annen person gjennomføre README-basert ren kjøring

Som sensor,
vil jeg at en annen person har prøvd hele oppskriften i et rent dokumentert lokalt miljø,
slik at manglende forutsetninger og feil i leveransen blir synlige før jeg overtar.

**Kravspor:** NFR-3 med NFR-1/NFR-2/NFR-4 ved faktisk kjøring; S6 og relevante S1/S3/S4; FR-6/FR-15–FR-18 og demoens kontroller; AD-6/AD-9/AD-10; SPEC CAP-8 og verifikasjonsgrensene for S6 og live/tid/ren kjøring. UX-DR1/UX-DR2/UX-DR36/UX-DR40/UX-DR41 er den faktiske demoflyten; manuell UX-dybdekontroll er 5.2. Sensor s. 2 og 5–6.

**Avhengigheter:** 5.1, 5.2 og 5.3. **Avklaringspunkt:** Mads organiserer en annen person og et rent lokalt miljø før S6-kjøringen. Personen er ikke utviklingsagenten som bare gjentar sin egen oppskrift. **Arbeidsgrense:** Faktisk annen-person-kjøring fra den dokumenterte repo-/leveranseversjonen med README som eneste oppskrift, og relevante rettinger/ny kontroll ved avvik. Ingen melding eller invitasjon sendes gjennom denne planleggingen.

**Acceptance Criteria:**

**Given** dokumentert repo-/leveranseversjon og en annen person i rent lokalt miljø
**When** installasjon og oppstart forsøkes kun etter README
**Then** miljø, forutsetninger, kommandoer og utfall registreres uten gruppens nøkkel, betalt konto eller særskilt egen infrastruktur
**And** manglende/uklare steg registreres som avvik fremfor å løses med udokumentert muntlig hjelp. **(AC1)**

**Given** dokumenterte avhengigheter og browser er installert
**When** selve demoen gjennomføres med eksternt nett sperret
**Then** lokale frontend-/API-/PDF-/worker-/font-/fixture-ressurser er tilstrekkelige for hele vurderingsflyten
**And** demoen er tydelig merket og ingen KI-klient, nøkkel eller betalt kall kreves; installasjonens eventuelle nettbehov fremstilles ikke som offline-installasjon. **(AC2)**

**Given** README-oppskriften og de kontrollerte casene
**When** personen registrerer/kontrollerer tall og rapportfunn, håndterer TG3, bekrefter grunnlaget og endrer finansverdier
**Then** alle tre anbefalinger kan demonstreres med korrekte kodeberegninger og nødvendige kontrollsteg
**And** tallmangler forstås lokalt, Uavklart TG3 kan bestå etter listekontroll og uendret rapport gjenbrukes ved ny lokal beregning uten nøkkel/nett. **(AC3)**

**Given** README-dokumenterte lokale tester
**When** personen kjører dem etter oppskriften
**Then** kommandoer og faktiske resultater registreres sammen med eventuelle feil
**And** testene bruker de lokale fasit-/kontrollgrensene og regnes ikke som live-S2-/S5-bevis. **(AC4)**

**Given** avvik i oppskrift, installasjon, demo eller tester
**When** de håndteres
**Then** funn kobles til berørt krav/story, nødvendig kode-/oppskriftsretting og faktisk ny verifikasjon av det som feilet
**And** S6 markeres bestått først når den andre personen kan gjennomføre hele demoen og de dokumenterte testene fra korrigert README; ufullført/ikke gjennomført beholdes med reell status. **(AC5)**

**Testkrav:** Utfør faktisk S6 med annen person, dokumentert rent miljø og konkret repo-/buildversjon. Bevar gjennomføringslogg med kommandoer, tre anbefalinger, kontroll-/feil-/returhandlinger og testresultater, uten hemmeligheter. En agentlaget sjekkliste, egen kjøring, tidligere utviklermiljø eller en README-gjennomlesing erstatter ikke forsøket. Demoens S6 kan verifiseres før Epic 4; det gjør ikke samlet v1/live-funksjonalitet ferdig.

### Story 5.5: Samle etterprøvbare leveransebevis og kontrollere repoet

Som sensor,
vil jeg finne sammenheng mellom låste krav, faktisk kode/tester og dokumenterte resultater i et ryddig repo,
slik at leveransen og eventuelle gjenstående mangler kan vurderes uten udokumenterte påstander.

**Kravspor:** FR-1–FR-18, NFR-1–NFR-5, S1–S6 og K1–K3 som samlet leveransekontroll; AD-1–AD-10; SPEC CAP-1–CAP-8 og kurs-/leveranse-/verifikasjonsføringer. UX-DR1–UX-DR41 spores til levert funksjon og relevante faktiske kontroller. Sensor s. 1–7, gjeldende faglæreroppfølging og AGENTS.md; ingen karakter-/sertifiseringspåstand.

**Avhengigheter:** 4.3, 4.4, 4.5, 5.1, 5.2, 5.3 og 5.4. **Arbeidsgrense:** Sammenstill faktisk krav-/test-/evalueringsstatus, oppdater README med leverte live-detaljer, kontroller sentrale arkitekturgrenser og repo-/prosessbevis. Tidlige demo-/S6-bevis må fortsatt være relevante for den faktiske leveranseversjonen. Ingen ny produktfunksjon eller omskriving av låst grunnlag.

**Acceptance Criteria:**

**Given** faktisk kode, tester og manuelle/evalueringsbevis for leveranseversjonen
**When** kravsporingen sammenstilles
**Then** FR/NFR, CAP, relevante AD/UX-DR, story, konkrete kode-/teststeder, testeksempler/kommandoer og bevis kan følges fra plan til faktisk resultat
**And** hull eller avvik har konkret berørt krav og neste arbeid/eier; en planreferanse eller testtittel alene regnes ikke som verifisert funksjon. **(AC1)**

**Given** S1–S6 og kontrollmål K1–K3
**When** akseptansestatus rapporteres
**Then** faktisk bestått/ikke bestått/ikke verifisert er dokumentert med grunnlag og begrensninger: uavhengig tallfasit, opprinnelig live-S2, regelutfall, kilder/opphav, separate S5-målinger/manuell referanse og faktisk annen-person-S6
**And** demo, brukerrettinger, lave feiltider eller andelen Gå videre brukes ikke som erstatning for de påkrevde bevisene; manglende live-leveranse eller ikke nådde mål skjules ikke. **(AC2)**

**Given** den faktisk leverte live-integrasjonen fra Epic 4 og demooppskriften fra 5.3
**When** endelig README synkroniseres med leveransen
**Then** valgt leverandør/modell, nødvendige lokale miljøvariabler/eksempelfil uten nøkkel, faktisk live-oppstart og avklart kostnads-/timeoutgrunnlag er forklart der det trengs for kjøring
**And** demo forblir en komplett selvstendig kjøreform uten nøkkel; README oppgir reell funksjons-/bevisstatus og har fungerende lenker til plan/prosess/leveransebevis. **(AC3)**

**Given** sentrale kodeområder og final arkitektur
**When** faktisk struktur/ansvar og relevant kvalitetssikring kontrolleres
**Then** kontraktautoritet, rene finans-/terskel-/screeningfunksjoner, frontendøkt/snapshot og dokument-/demo-/live-grenser stemmer med AD-ene uten dupliserte regler
**And** konkrete observasjoner fra kodegjennomgang, feil og rettinger har spor til krav/story/endring og relevant ny test; gamle/døde KI-forsøk brukes ikke som levert løsning. **(AC4)**

**Given** versjonerte filer/historikk, test-/evalueringsdata og faktisk repo-/buildinnhold
**When** leveransens repo-/datakontroll utføres
**Then** hemmeligheter/private originaler, avhengighetskataloger, lokale miljøfiler, bygge-/testråartefakter og tilfeldige rester holdes utenfor leveransen i samsvar med NFR-4/.gitignore
**And** nødvendige fiktive fixtures, låsfil og kuraterte bevis/prosessdokumenter er tilgjengelige; ekte publiserte dokumenter har vurdert rettighet/personvern/anonymisering, og eventuelle sensitive funn rapporteres uten å gjengi verdiene. **(AC5)**

**Given** plan-/prompt-/arbeidsøktshistorikk og bevis fra ulike implementeringsversjoner
**When** leveransegrunnlaget ferdigstilles
**Then** faktiske beslutninger, KI-styring, avvik og rettinger er bevart og knyttet til relevante endringer; historiske forslag og erstattet scope skilles fra gjeldende kontrakt uten oppdiktede økter/commits
**And** bevisenes versjon/relevans er kontrollert, berørte endringer har nødvendig ny verifikasjon og åpne mangler hindrer falsk påstand om fullført v1; ingen kilde eller testfasit er endret for å få leveransen til å se bestått ut. **(AC6)**

**Testkrav:** Følg konkrete spor fra hvert FR/NFR/CAP og relevante AD/UX-DR til faktisk kode, fasit/test og bevis. Kontroller S1–S6 og K1–K3 mot 4.4/4.5/5.1/5.2/5.4, og kontroller at RT-/BT-/AT-/TT- og FR-5-henvisninger angir reell testgrense. Prøv endelige README-kommandoer/live-eksempler i kontrollert konfigurasjon uten å utføre nye uavklarte betalte kall. Inspiser faktisk filinventar/historikk/.gitignore og lenker/eksempelfiler uten å skrive hemmeligheter til testutdata; bevar nyttige prosessbevis. Kjør relevante automatiserte kontroller på leveranseversjonen når nye endringer eller utdaterte bevis gjør det nødvendig, og gjenta berørt manuell/S6-kontroll ved materiell endring av den prøvde oppskriften/flyten. Dette er leveransekontroll ved senere implementering, ikke den planleggingsbaserte implementation readiness-kontrollen som skal utføres før kodearbeid.

## Epic 5: dekningskontroll til gjennomgangen

| Krav / beslutning | Planlagt storydekning |
|---|---|
| FR-1–FR-18 / CAP-1–CAP-8 | 5.1 samlet demoregresjon ved riktige modul-/UI-grenser; 5.2 faktisk felles UX; 5.3/5.4 kjørbar oppskrift; 5.5 samlet plan–kode–test–bevis. Ingen nye funksjoner. |
| NFR-1 / S1/S3 | 5.1 fasit, regler, feil/gjentakelser/overganger/kalltall; 5.4 faktiske dokumenterte tester; 5.5 versjonsrelevans og samlet status. |
| NFR-2 / UX-DR1–UX-DR41 | 5.2 manuell kontroll av felles flyt, fokus/tastatur, panel/zoom, kontrast, lokale feil, detaljåpning og forståelse; 5.5 inkluderer live-tilstander fra 4.3 og sporbarhet. |
| NFR-3 / S6 | 5.3 komplett demo-/testoppskrift; 5.4 faktisk annen person/rent miljø/uten nøkkel/betalt konto/nett under demo; 5.5 endelig live-anvisning og relevant versjonsbevis. |
| NFR-4 | 5.3 trygge kommandoer/eksempler, 5.4 nøkkelfri mottakerkjøring, 5.5 faktiske filer/historikk/data/.gitignore/bevis uten hemmeligheter/private originaler. |
| NFR-5 / S5 / K1 | 5.5 sammenstiller faktiske målinger og manuell referanse fra 4.5 med riktig feil-/demo-/kontrollskille. Ingen ny timer eller omdefinert protokoll. |
| S2 / K2 | 5.5 bruker reelt originaluttrekk før retting og per-rapport fasitvurdering fra 4.4; demosuksess gir ikke live-bevis eller generell kvalitetsgaranti. |
| S4 | 5.1 kilde-/kontrollregresjon; 5.2 forståelig original/utkast/retting/avvisning/TG3 og beregningsspor; 5.5 kontrollerbar dokument-/kode-/beviskjede. |
| K3 | 5.1/5.2/5.4 alle tre anbefalinger med riktig grunnlag; 5.5 måler ikke suksess som andel Gå videre. |
| AD-1–AD-10 | 5.1 relevante faktiske testgrenser; 5.2 låst UX; 5.3/5.4 lokal levering; 5.5 arkitektursamsvar, konfigurasjon, bevis og faktisk repoinnhold. |
| Faglærer/sensor/AGENTS.md | 5.1 logikknær kvalitet, 5.2 egne UX-referanser/tilgjengelighet, 5.3/5.4 sensor-kjørbarhet, 5.5 reell prosess/plan–kode-spor og reporyddighet. Ingen karakter-/dekningsprosentkrav innføres. |

Annen person/rent miljø er en eksplisitt ekstern avhengighet i 5.4, ikke noe agenten kan simulere som bestått. Live-bevis og gjennomføringsavklaringer fra Epic 4 er forutsetninger for 5.5, men ikke for 5.1–5.4s avgrensede demoutfall. Denne oppdelingen følger den godkjente rekkefølgen og muligheten for tidligere offline-verifikasjon.

## Gjennomgang og avsluttende kontrollpunkt

Gjennomgangen er avsluttet med Mads’ C-godkjenning av 5.1–5.5 og videreføring til avsluttende validering/readiness 2026-10-16. Storytekstene er kopiert uendret til epics.md og godkjenningsstatusen er registrert. Godkjenningen starter ingen implementering og innebærer ingen påstand om beståtte produkttester eller oppnådde akseptansemål. Videre kontroll dokumenteres i arbeidsøkten for 2026-10-16.
