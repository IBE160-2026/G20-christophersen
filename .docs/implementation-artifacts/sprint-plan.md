---
title: "Sprintplan — Property Acquisition Agent"
date: 2026-10-16
status: complete
workflow: bmad-sprint-planning
readinessVerdict: CONCERNS
epics: 5
stories: 37
plannedSprints: 8
calendarCommitment: false
implementationStarted: false
---

# Sprintplan — Property Acquisition Agent

Planen fordeler de fem godkjente epicene og 37 storyene på åtte leveransesprinter og angir en avhengighetsgyldig implementeringsrekkefølge. **Readiness forblir CONCERNS.** R2 må lukkes før Story 2.3, R3 før Story 2.5, R1 før hele Epic 4 og R4s respektive person-/miljøavklaringer før faktisk S5/S6. Sprintplanlegging lukker ingen av portene.

Dette er en plan for senere implementering. Ingen story er startet eller klargjort gjennom en separat utviklingsfil. Første story ved en senere implementeringsbestilling er **1.1**. Låste krav, UX, arkitektur, epics og stories beholdes uendret; endringsbehov skal legges frem for Mads før endring.

## Grunnlag og autoritet

| Grunnlag | Gjeldende kontrakt |
|---|---|
| Product Brief | [Ferdig brief](../planning-artifacts/briefs/brief-IBE160-2026-09-15/brief.md) og [addendum](../planning-artifacts/briefs/brief-IBE160-2026-09-15/addendum.md). |
| PRD | [Final PRD](../planning-artifacts/prds/prd-IBE160-2026-10-10/prd.md) og [test-/måleaddendum](../planning-artifacts/prds/prd-IBE160-2026-10-10/addendum.md): FR-1–FR-18, NFR-1–NFR-5, S1–S6, K1–K3 og eksisterende fasit. |
| UX | [Final DESIGN](../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/DESIGN.md) og [EXPERIENCE](../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md), oppdatert 2026-10-14. |
| Arkitektur | [Final ARCHITECTURE-SPINE](../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md), oppdatert 2026-10-15: AD-1–AD-10, startstakk og Deferred. |
| SPEC | [SPEC](../specs/spec-IBE160/SPEC.md), [grensekontrakter](../specs/spec-IBE160/grensekontrakter.md), [sporbarhet](../specs/spec-IBE160/sporbarhet.md) og [verifikasjon/avklaringer](../specs/spec-IBE160/verifikasjon-og-avklaringer.md), inklusive adopterte kompanjonger. |
| Arbeidsenheter | [Godkjente epics og stories](../planning-artifacts/epics.md): 37 stories, 188 AC og 117 direkte storyavhengigheter. Storyenes fulltekst beholder eierskapet til kravspor, arbeidsgrenser og testkrav. |
| Readiness | [Ferdig implementation-readiness](../planning-artifacts/implementation-readiness.md): CONCERNS, R1–R4. Denne vurderingen omskrives ikke av sprintplanen. |
| Kurs og faglærer | [Sensorveiledning del 1, s. 1–7](../reference/course/Sensorveiledning-IBE160-Del-1.pdf), [tilbakemelding](../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md) med [gjeldende oppfølging](../planning-artifacts/briefs/brief-IBE160-2026-09-15/revisjonskontroll-2026-10-08.md), og [AGENTS.md](../../AGENTS.md). |

Nyere godkjente presiseringer gjelder fortsatt: alle eksplisitte TG2/TG3, innebygd original-PDF med korrekt automatisk PDF-side, fire UX-trinn og faktisk live KI-funksjonalitet i v1. Demo er en selvstendig kjøreform; live er valgfritt ved kjøring og påkrevd som levert funksjonalitet.

## Kapasitet og planbruk

SP1–SP8 er leveranseinndeling, uten fastsatt sprintlengde, kalenderdatoer, timeestimat, story points eller velocity. Kapasitet, bemanning og tilgjengelig arbeidstid er ikke oppgitt. Åtte sprinter er derfor ingen påstand om åtte uker eller garantert semesterleveranse. Tidfesting kan gjøres når faktisk kapasitet foreligger, uten å endre storyinnhold.

Utgangspunktet er én sekvensiell arbeidsstrøm. Tabellens rekkefølge brukes innen hver sprint, og hver story følger sine opprinnelige avhengigheter og porter. Sprintgrensene omnummererer eller deler ingen stories. Funksjonsnær testing, feilretting, tilgjengelighet og sporbarhet er del av hver story; de utsettes ikke samlet til SP6/SP8. Kildekravene avgjør når arbeid er ferdig, også hvis sprinten må fortsette.

## Sprintrekkefølge og leveranser

| Sprint | Mål / observerbart utfall | Stories i anbefalt rekkefølge | Inngang og avklaringsporter | Avslutningskontroll fra godkjente stories |
|---|---|---|---|---|
| SP1 | Kjørbar lokal app og kontrollert Tallgrunnlag. | 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7 (7) | Ferdig/kontrollert sprintplan og senere implementeringsbestilling. R1–R4 blokkerer ikke disse storyene. | Faktisk installasjon/type/lint og build/start/dev; import-/ressursgrense; blank/null/perioder/kilder/kostnader; lokale mangler; korrekt bekreftelse, endring og retur. Ingen full økonomisk screening ennå. |
| SP2 | Epic 2, milepæl 1: rapport, uttrekk og korrekt originalside. | 2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 → 2.7 (7) | SP1 er hovedrekkefølgens forutsetning. **R2 før 2.3; R3 før 2.5.** 2.1/2.2 kan utføres før R2 lukkes. | Faktiske PDF-fixtures/fasit; 30/31 sider; sidemerket tekst og lesbarhet; rapport-/versjonsbundet demo; HTTP-duplikat-/gamlesvarvern; alle funn/usikkerheter; originalside, nabosider og smalt PDF-panel. Milepæl 1 demonstreres etter 2.7, uten påstått listebekreftelse/Resultat. |
| SP3 | Epic 2, milepæl 2: kontrollert funnliste med separat TG3-status. | 2.8 → 2.9 → 2.10 → 2.11 (4) | SP2 og storyenes direkte forutsetninger. R2/R3 må være lukket for de allerede brukte dokument-/HTTP-grensene. | Original/utkast/Bruk/Avbryt/Avvis, forholdsbundet TG3, egen listebekreftelse og gjenbruk uten nye kall. Uavklart TG3 kan bestå etter kontroll. Milepæl 2 demonstreres etter 2.11; ingen komplett Resultat-flate ennå. |
| SP4 | Etterprøvbar finans-/screeningkjerne og gyldig resultatsnapshot. | 3.1 → 3.2 → 3.3 → 3.4 → 3.5 (5) | SP1 og SP3 dekker de direkte forutsetningene; 3.1–3.3 kan eventuelt trekkes frem etter SP1. | Uavhengig BT-/AT-/FR-5-fasit; eksakte terskler/likhet/én krone under; alle avgjørende utløsere og identisk kodebegrunnelse; ren snapshot-/revisjonskontroll. Modulene kan verifiseres uten senere resultatskjerm. |
| SP5 | Full demovurdering med forståelig Resultat og begge oppdateringsforløp. | 3.6 → 3.7 → 3.8 → 3.9 (4) | SP4 og tidligere rapportkontroll. | Faktiske nøkkeltallskomponenter; bygget app med F1/F2/F4 og tre anbefalinger; F3/delgrunnlag ved riktig testgrense; ubrukt utkast, historisk/gjeldende resultat, ny relevant kontroll og rapportgjenbruk. Full UJ-1 og fire Key Flows kan etterprøves uten live. |
| SP6 | Tidlig samlet demoverifikasjon og mottakerens kjørbarhetsbevis. | 5.1 → 5.2 → 5.3 → 5.4 (4) | SP5. **R4-S6 før 5.4.** Ingen avhengighet til Epic 4 eller R1. | Samlet demoregresjon, faktisk manuell UX, komplett prøvd demo-/test-README og faktisk annen-person-S6 i rent miljø. Test-/kjørebevis knyttes til prøvd versjon. Dette fullfører ikke Epic 5 eller samlet v1. |
| SP7 | Live-konfigurasjon og produksjonsadapter integrert i samme flyt. | 4.1 → 4.2 → 4.3 (3) | SP5s funksjonalitet og opprinnelige avhengigheter. **R1 før noen Epic 4-story starter; R2/R3 skal være lukket og avstemt mot live.** SP6 er anbefalt forutgående kontroll, ingen ny storyavhengighet. | Valgt SDKs faktiske transportforsøk/timeout/retry kontrolleres uten betalt API; komplett støttet rapportgrunnlag i ett kall; trygge feil, uendret demo, kontroll/gjenbruk og snapshotvern. Kontrollerte tester er ikke S2-/S5-bevis. |
| SP8 | Reelt live-/tidsbevis og endelig etterprøvbar leveransestatus. | 4.4 → 4.5 → 5.5 (3) | SP7; for 5.5 også 5.1–5.4. R1 og tilgjengelig lokal nøkkel/budsjett før reelle forsøk. **R4-S5 før S5-måling**, også hvis tidsdata fra 4.4 skal gjenbrukes. | Opprinnelig live-uttrekk mot S2 før retting; faktiske S5-tider/manuell referanse; samlet S1–S6/K1–K3-status, live-anvisning, kode-/test-/prosesspor og repokontroll. Tidlige bevis vurderes mot leveranseversjonen og relevant kontroll gjentas ved materiell endring. |

Hovedrekkefølgen er **Epic 1 → Epic 2, milepæl 1 → Epic 2, milepæl 2 → Epic 3 → Story 5.1–5.4 → Epic 4 → Story 5.5**. Flyttingen av 5.1–5.4 foran Epic 4 bruker den uttrykkelig godkjente muligheten i Epic 5 og readiness-rapporten; ingen avhengighet eller storytekst endres. Retrospektiver står som `optional` per epic i BMAD-statusen; de er ikke nye obligatoriske produktleveranser.

## Avklaringsporter og stoppregler

Alle porter er **åpne ved planlegging 2026-10-16**. R1–R4 beholder readiness-rapportens ID-er. R4-S5/R4-S6 er to kontrollpunkter under samme R4, ikke nye produktkrav eller stories. Rolleansvar nedenfor er kildeansvar, ikke navngitt eller bekreftet bemanning.

| Port / eier | Senest før | Nødvendig dokumentert avklaring | Arbeid som stoppes mens porten er åpen |
|---|---|---|---|
| R2 — Dokumentansvar | **Start av 2.3**; forbered i SP1/tidlig SP2. | Konkret PDF-lesbarhets-/layoutmetode, kjente/ukjente feiltyper og uavhengig forventet utfall for blanke sider, blandet tekst/bilde, tabeller/kolonner og tegnkoding. Ingen vilkårlig tekstlengde som skjult godkjenning, OCR eller ny støtteinnskrenkning. | 2.3 og alle etterfølgere som trenger dens uttrekk. Formatvalidering og fixtures i 2.2 er ikke tillatelse til å godta ukjent lesbarhet. |
| R3 — Backendansvar | **Start av 2.5**; forbered i SP1/tidlig SP2 og avstem på nytt ved R1. | Konkrete upload-/HTTP-ressursgrenser og timeouter; livsløp/opprydding av bytes/PDF/tekst ved normalforløp, feil, timeout og klientavbrudd; forventet testgrunnlag for støttet input. Duplikatmarkør beholdes til serverstopp. Ingen skjult endring av 30-sidersscope eller S5 som hard timeout. | 2.5 og forbrukere som trenger HTTP-forløpet. En åpen port kan ikke omgås med antatte standardverdier. |
| R1 — Mads + live-integrasjon | **Før hele Epic 4 / SP7**, og før betalte tester; forbered mens demo bygges. | Leverandør, eksakt modell/SDK, kontekst-/outputkapasitet for hele støttede sidemerkede grunnlaget i ett kall, datert prisgrunnlag, prosjektbudsjett/beregnet testkostnad og konkrete leverandør-/live-timeouter. Avstem R2/R3; ingen skjult avkorting/retry/flerleverandørplattform. | Alle 4.1–4.5. Demo og 5.1–5.4 kan fortsatt leveres. Et ferdig demoresultat kan ikke lukke v1s live-krav. |
| R4-S6 — Mads / evalueringsansvarlig | **Før 5.4 / faktisk S6**; organiser tidlig nok til SP6. | Faktisk annen person, avtalt gjennomføring og rent dokumenterbart lokalt miljø med README/repo-/buildversjon. Installasjon/browserforberedelse og nett sperret under demo må kunne gjennomføres. | 5.4 og senere fullføring av 5.5 som trenger S6. Agentens egen kjøring eller en utfylt plan lukker ikke S6. |
| R4-S5 — Mads / evalueringsansvarlig | **Før faktisk S5-måling i 4.5**, eller før målepunkter i 4.4 samles for gjenbruk i S5. | Faktisk person til menneskelig kontroll og manuell referanse, avtalt miljø/gjennomføring, samme-case-utvalg, tidsgrunnlag og registrering etter PRD-protokollen. Nye live-forsøk må passe R1-budsjettet. | S5-måling/4.5 og senere fullføring av 5.5 som trenger S5. 4.4s selvstendige S2-arbeid kan utføres etter sine egne forutsetninger uten å påstå S5. |

Porten lukkes gjennom en datert avklaringslogg med eier, beslutning, kilde, konkrete verdier/metode/person-/miljøoppsett, vurdering mot låst kontrakt og lenke fra sprintstatusens `clarification_gates`. Avklaring av valg før story-start er atskilt fra de faktiske test-/målebevisene som storyen deretter skal levere. Ingen test av ennå ikke implementert logikk kreves som bevis for å starte selve storyen. S5/S6 er først verifisert etter faktisk gjennomføring.

Hvis en avklaring krever endring av låst krav, UX, arkitektur, grensekontrakt, epic eller story, stoppes berørt arbeid og **Mads spørres før endring**. Ingen leverandør, modell, pris, budsjett, ressursverdi, lesbarhetsmetode, faktisk person eller maskin er valgt av denne sprintplanen. Planen sender ingen henvendelser eller invitasjoner.

## Arbeid ved venting og avhengigheter

Direkte avhengigheter nedenfor er hentet fra godkjente storytekster. Hovedrekkefølgen følger alle 117. Sprintskifte alene gjør ikke en story startbar: alle dens forutsetninger må være levert, og relevante porter må være lukket. Eventuell fremtrekking dokumenteres i planen/statusen uten å endre storyinnhold.

| Situasjon | Mulig arbeid uten å omgå porten |
|---|---|
| R2 åpen | Etter SP1 kan 2.1 → 2.2 leveres. 3.1 → 3.2 → 3.3 kan trekkes frem fra SP4 med egne direkte modul-/formattester; 3.4 trenger fortsatt 2.10/2.11. |
| R3 åpen, R2 lukket | 2.3 → 2.4 kan ferdigstilles, og 3.1–3.3 kan trekkes frem. 2.6/UI-integrasjon venter på levert 2.5. |
| R1 åpen | Fullfør demoens SP1–SP5 og 5.1–5.4 etter deres porter. Epic 4 forblir stoppet; ingen alternativ modell eller nedgradering til demo-only-v1 velges. |
| R4-S6 åpen | 5.1–5.3 kan fullføres. SP7 og selvstendig S2-arbeid i 4.4 kan trekkes frem dersom R1 og deres direkte forutsetninger er oppfylt. Dette innfører ingen avhengighet fra Epic 4 til 5.4. |
| R4-S5 åpen | 4.1–4.4 kan utføres etter R1 og sine forutsetninger, men ingen S5-status kan påstås og 5.5 kan ikke ferdigstilles. Manglende gyldige tidsdata gir senere behov for nye eksplisitte forsøk innen avtalt budsjett. |

Det planlegges ingen parallell utviklingskapasitet. 5.1 og 5.2 har ingen innbyrdes avhengighet, og 5.3 trenger 5.1 men ikke 5.2; den viste sekvensen er et praktisk enkeltspor. Avhengighetsgrafen gir ingen tidsberegnet kritisk sti uten varighets-/kapasitetsdata.

### Kontrollert storyoversikt

Storytitlene og de direkte forutsetningene er en indeks til [fulltekst og AC](../planning-artifacts/epics.md), ikke nye storydefinisjoner. `—` betyr ingen direkte storyavhengighet. Porter er vist ved sine seneste kontrollpunkter; tidligere porters effekt følger avhengighetene videre.

| Nr. | Sprint | Story og uendret tittel | Direkte storyavhengigheter | Port før start / berørt måling |
|---|---|---|---|---|
| 1 | SP1 | 1.1 — Etablere reproduserbar startstruktur og importgrenser | — | — |
| 2 | SP1 | 1.2 — Starte den bygde lokale appen med godkjent appskall | 1.1 | — |
| 3 | SP1 | 1.3 — Registrere og bevare finansverdier for ett objekt | 1.2 | — |
| 4 | SP1 | 1.4 — Validere tall og normalisere kjent månedsgrunnlag eksakt | 1.3 | — |
| 5 | SP1 | 1.5 — Gjøre kilder, kostnadsinnhold og uløste konflikter kontrollerbare | 1.3, 1.4 | — |
| 6 | SP1 | 1.6 — Vurdere kritiske mangler med fast kodebegrunnelse | 1.4, 1.5 | — |
| 7 | SP1 | 1.7 — Kontrollere, bekrefte og rette gjeldende tallgrunnlag | 1.2, 1.3, 1.5, 1.6, 1.4 | — |
| 8 | SP2 | 2.1 — Dele og validere dokument-/analysekontrakten | 1.1 | — |
| 9 | SP2 | 2.2 — Validere PDF-format, sidegrense og originalidentitet | 2.1 | — |
| 10 | SP2 | 2.3 — Trekke ut sidemerket tekst med kontrollert lesbarhet | 2.1, 2.2 | R2 |
| 11 | SP2 | 2.4 — Hente lagret demo-uttrekk bundet til riktig rapport og versjon | 2.1, 2.2, 2.3 | — |
| 12 | SP2 | 2.5 — Gjennomføre ett HTTP-analyseforløp med duplikatsperre | 1.2, 2.1, 2.2, 2.3, 2.4 | R3 |
| 13 | SP2 | 2.6 — Velge rapport og ta imot bare gjeldende analyseutfall | 1.6, 1.7, 2.1, 2.5 | — |
| 14 | SP2 | 2.7 — Kontrollere funnets kilde i original-PDF og smalt panel | 2.2, 2.6 | — |
| 15 | SP3 | 2.8 — Kontrollere og korrigere funn med bevart original og utkast | 2.1, 2.6, 2.7 | — |
| 16 | SP3 | 2.9 — Avvise feilaktig KI-funn med bevart opphav | 2.8 | — |
| 17 | SP3 | 2.10 — Registrere og validere separat TG3-avklaring | 1.6, 2.8, 2.9 | — |
| 18 | SP3 | 2.11 — Bekrefte gjeldende funnliste med tydelig tilstrekkelighet | 1.6, 2.6, 2.8, 2.9, 2.10 | — |
| 19 | SP4 | 3.1 — Beregne fire nøkkeltall fra hvert sitt gyldige årsgrunnlag | 1.4, 1.5, 1.7 | — |
| 20 | SP4 | 3.2 — Avgjøre økonomiske terskler med eksakte verdier | 1.4, 3.1 | — |
| 21 | SP4 | 3.3 — Formatere nøkkeltall uten å skjule økonomiske brudd | 3.1, 3.2 | — |
| 22 | SP4 | 3.4 — Gi én komplett regelbasert anbefaling med fast begrunnelse | 1.6, 2.10, 2.11, 3.1, 3.2 | — |
| 23 | SP4 | 3.5 — Binde resultat til revisjoner og gjøre tidligere resultat historisk | 1.7, 2.6, 2.8, 2.9, 2.10, 2.11, 3.4 | — |
| 24 | SP5 | 3.6 — Gjøre hvert nøkkeltall og beregningsgrunnlag lesbart | 3.1, 3.3, 3.5 | — |
| 25 | SP5 | 3.7 — Vise ett samlet screeningresultat med kontrollgrunnlag | 2.7, 2.11, 3.4, 3.5, 3.6 | — |
| 26 | SP5 | 3.8 — Oppdatere resultat etter endret og bekreftet finansgrunnlag | 1.7, 3.5, 3.7 | — |
| 27 | SP5 | 3.9 — Oppdatere resultat etter rapportkontroll og separat TG3-endring | 2.6, 2.8, 2.9, 2.10, 2.11, 3.5, 3.7 | — |
| 28 | SP6 | 5.1 — Etterprøve den samlede demoen med meningsfulle automatiserte tester | 2.11, 3.7, 3.8, 3.9 | — |
| 29 | SP6 | 5.2 — Etterprøve hele den felles brukerflyten og grunnleggende tilgjengelighet | 2.7, 3.7, 3.8, 3.9 | — |
| 30 | SP6 | 5.3 — Dokumentere en komplett oppskrift for lokal demo og tester | 3.9, 5.1 | — |
| 31 | SP6 | 5.4 — La en annen person gjennomføre README-basert ren kjøring | 5.1, 5.2, 5.3 | R4-S6 |
| 32 | SP7 | 4.1 — Konfigurere valgt live-leverandør uten å eksponere nøkkelen | 1.2, 2.4, 2.5 | R1 |
| 33 | SP7 | 4.2 — Analysere hele det sidemerkede rapportgrunnlaget i ett KI-kall | 2.1, 2.3, 4.1 | R1 |
| 34 | SP7 | 4.3 — Bruke live-analysen i samme kontroll- og resultatflyt | 2.5, 2.6, 3.7, 3.8, 3.9, 4.1, 4.2 | R1 |
| 35 | SP8 | 4.4 — Gjennomføre ekte live-analyse og evaluere opprinnelig uttrekk mot S2 | 2.2, 4.2, 4.3 | R1; R4-S5 hvis S5-data samles |
| 36 | SP8 | 4.5 — Måle live-analyse og menneskelig kontroll etter S5-protokollen | 4.3, 4.4 | R1, R4-S5 |
| 37 | SP8 | 5.5 — Samle etterprøvbare leveransebevis og kontrollere repoet | 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4 | Tidligere porter og faktiske bevis |

## Verifikasjon og leveransespor

Sprintenes avslutningskontroller oppsummerer eksisterende AC/testkrav. Hver story beholder sine CAP-/FR-/NFR-/S-/AD-/UX-DR-spor og relevante F1–F4, RT-1–RT-19, BT-1–BT-18, AT-1–AT-20, TT-1–TT-9 og sju FR-5-eksempler. Den fulle kravdekningen ligger i epics/readiness/SPEC; sprintplanen oppretter ingen ny fasit eller testdekningsprosent.

| Bevis | Planlagt arbeid / viktig grense |
|---|---|
| S1, S3 og S4 | Bygges funksjonsnært i SP1–SP5, sammenstilles i 5.1/5.2 og kontrolleres mot endelig versjon i 5.5. F3s sperrede hovedreise testes ved riktig modul-/tilstandsgrense. S1-toleranse brukes aldri i eksakte screeningterskler. |
| S2 | Faktiske rapporter/fasit fra 2.2 og lesbarhet fra 2.3 er forutsetninger. Bare 4.4s opprinnelige reelle live-uttrekk teller: alle TG3, minst 90 % TG2 med riktig PDF-side og ingen oppdiktede i utvalget; alle oversette funn rapporteres. |
| S5 | 2.6/2.11 etablerer hendelsesgrunnlaget, 4.3 bevarer det og 4.5 utfører måling med faktisk menneskelig kontroll/manuell referanse. Separate medianer ≤300/600 s. Feil, ufullført kontroll og demo rapporteres separat. Målepunkter er Start analyse → faktisk synlig liste → kontrollert/bekreftet gjeldende liste. |
| S6 | 5.3s egen prøving forbereder 5.4s faktiske annen-person-kjøring. Rent dokumentert miljø, README alene, hele demoen og dokumenterte tester uten gruppens nøkkel/betalt konto. Tidlige bevis etterprøves ved relevante senere endringer i 5.5. |
| Prosess og kvalitet | Spor krav → story → faktisk endring → test-/manuelt bevis, dokumenter kodegjennomgang/funn/retting og lagre viktige prompts/arbeidsøkter. Kuraterte bevis legges under .docs/implementation-artifacts/ ved gjennomføring. Ingen produktbevis oppstår fra denne planen. |

Funksjonsfeil rettes og kontrolleres innen den berørte storyens låste ansvar. Større omfang eller nødvendig endring av storyinndeling legges frem for Mads. V1 erklæres ikke fullt verifisert dersom nødvendig live-funksjonalitet eller S1–S6-bevis mangler; 5.5 skal vise reell status og eventuelle åpne avvik.

## Sprintstatus og videre bruk

[sprint-status.yaml](sprint-status.yaml) er generert av BMAD-verktøyet direkte fra epics.md. Den inneholder fem epics og 37 stories i `backlog`, samt fem `optional` retrospektiver. Ingen story er `ready-for-dev`, `in-progress`, `review` eller `done`. De separate storyfilene opprettes først ved senere utviklingsarbeid.

`development_status` er sortert per epic av generatoren, **ikke etter implementeringsrekkefølgen**. Bruk `planned_sprints` i samme fil og storyoversikten ovenfor for rekkefølgen, særlig 5.1–5.4 før Epic 4. `clarification_gates` registrerer de åpne portene. Generatorens formatvalidering og generiske statusanbefaling håndhever ikke avhengigheter eller porter; de må kontrolleres før hver start. `backlog` betyr planlagt arbeid, ikke at det kan startes uten avklaring.

Ved oppdatering bevares generatorens statusvokabular og oppnådde statuser; ingen uoffisiell `blocked`-status legges inn i `development_status`. Dokumenter portbeslutning og oppdater portregisteret før berørt arbeid. Sprint-/portmetadata bevares som custom keys ved regenerering; les alltid den gjeldende planen ved storyvalg.

Parseren varsler om fem generelle overskrifter i epics.md (linje 38, 263, 286, 296 og 392) som inneholder Epic/Story-ord uten å definere arbeidsenheter. Alle fem epics og 37 faktiske stories er gjenfunnet; ingenting er utelatt. De låste overskriftene endres ikke for å fjerne disse ufarlige varslene.

**Sprint Planning er ferdig og kontrollert 2026-10-16.** Alle 37 stories forekommer én gang, alle 117 direkte avhengigheter er oppfylt av planrekkefølgen, statusfilen er gyldig og synkron med epicene, og de 14 låste kildene samt epics/readiness er SHA-256-uendret. Midlertidig regenerering bevarer sprint-/portmetadata. Dette er dokument-/plankontroll; produktets S1–S6 er fortsatt ikke verifisert.

Planleggingens sluttkontroll og prosesspor dokumenteres i [arbeidsøkten](../process/arbeidsokter/2026-10-16-sprint-planning.md). Ingen installasjon av produktstakk, appkode, fixtures, produkttester, leverandørkall eller implementeringsstart inngår i sprintplanleggingen.
