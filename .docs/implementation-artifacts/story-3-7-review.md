# Story 3.7 — uavhengig BMAD-review

Startet 2026-10-21, gjenopptatt 2026-10-22 etter faktisk usagegrense. Modus **full**, diff `fcc87c6e4b13fdaf03271dd0b7825804ec2e6412..40cdfed3b5cd9793a6bc907b87acf1dd5d4d50ca`:38 filer,+1149/−28,1502 linjer. Reviewagenten er separat fra implementeringsagenten.

## Autoritet og arbeidsmåte

Story3.7 AC1–6/testkrav, frozen storyspec, Epic3-context, SPEC CAP-3–8/grensekontrakter, PRD FR-5/8–18/NFR-1–3 og F1/F2/F4-fasit, final DESIGN/EXPERIENCE, AD-2/6–10 og sprintplan/status styrer gjennomgangen. Kursens sidehenviste sensoruttrekk og faglærerfeedback begrunner avgrensning, sporbarhet og meningsfull verifikasjon, uten nye produktkrav.

BMAD code-review er aktivert med resolver; ingen prepend/append eller persistent facts. Fire selvstendige lag med samme modellkapabilitet kjørte **sekvensielt** som eksplisitt bestilt: Blind Hunter → Edge Case Hunter → Verification Gap → Acceptance Auditor. Tre første fikk kontekstfrie instruksjoner/diffstier; Edge fikk separat claims-fil, Acceptance fikk story/autoritet. Ingen prosjektfiler ble endret mens lagene kjørte. Blind-gulv:130980 byte/1000=130,98 kB; min(floor(sqrt(130,98)+1),10)=10;11 kandidater levert. Edge ble avbrutt av faktisk usagegrense21.oktober og fullført i samme agent etter brukerens «fortsett der du slapp»22.oktober. Ingen lag mangler ved triage.

Brukeren har allerede autorisert retting, tester og lokal commit; ingen ny bekreftelse kreves. Fornyelsesflytene3.8/3.9 og senere stories bygges ikke. Demo-fixturenes rene opphavsdisclaimer lå feil i kritiske limitations; rettingen samsvarer med F1/F2-fasit, NFR-3/AD-6, mens faktisk mangelregel og synlig demoopphav består.

## Individuell triage før gruppering

| ID/lag | Kandidat og kontrollert bevis | Dom/ruting |
|---|---|---|
| B1/blind | Eksisterende snapshot gir tidlig navigate-resultat-retur før report-abandon. Ny analyse/filinnlesing kan derfor fullføres etter forlatt trinn; eksisterende reducer avviser bare etter generasjonsendring. | **medium**, patch:bruk eksisterende abandon/generasjonsvern. |
| B2/blind | sameOriginal krever completed; identisk valgt PDF med ready/failed status påstås å være en annen original. | **medium**, patch:skill identitet fra tilgjengelighet. |
| B3/blind | triggerText fjerner domain-valideringsårsaken for TG3, og detaljer viser bare applicable-boolsk/gammel tekst. Ved endret rapportforhold skjules bindingsmangelen. | **medium**, patch:bevar kodeutløser og vis felles anvendbarhetsfeil i detaljer. |
| B4/blind | Kode-, årsaks- og målutløser fra samme analysefeil gjengis som gjentatte kompakttekster. | **low**, patch:én presentasjon per identisk feil/handling, snapshotets utløsere beholdes. |
| B5/blind | Renderer bruker gamle controls ved failed partialResult, mens assessFindingList eksplisitt ignorerer slik kontroll. TG3/original kan skjules av gammel avvisning/retting. | **medium**, patch:les bare brukerkontroll ved fullført grunnlag. |
| B6/blind | Funnliste bekreftet avgjøres bare ved revisjonslikhet; report-error bevarer revisjoner selv om felles kontrollautoritet sier confirmed=false. | **medium**, patch:konsumer assessFindingList. |
| B7/blind | Historisk side og findingId sendes til aktiv kontrollflate; en brukt korrigering kan gi ny aktiv beskrivelse/status sammen med historisk side. | **medium**, patch:åpne historisk originalside uten å velge ny aktiv funnversjon. |
| B8/blind | Komplett endrings-/handlingsliste gjentas både i toppbanner og FinancialMetrics ved hvert historisk Resultat. | **low**, patch:behold én oppsummering i samlet Resultat, standalone-komponenten beholder sin. |
| B9/blind | Bygget-app-prøvene krever ikke prioritet eller full økonomisk utløsersamling. | **medium**, patch:håndskrevne ordnede forventninger. |
| B10/blind | Analysefeilprøven har partialResult:null; reelt deluttrekk med TG3/usikker kandidat og gamle controls mangler. | **medium**, patch:faktisk kontraktbundet deluttrekk ved komponentgrensen. |
| B11/blind | Hele originalrapportens nye inngang bruker på smal flate etiketter om valgt funn selv når findingId=null. | **low**, patch:direkte konteksttilpassede etiketter og smal appprøve. |
| E1/edge | Avvist original med fremmed dokument/hash får identiteten erstattet før sourceTarget. PdfViewer.ready vernes ikke av sourceIssue, så aktiv side kan vises til tross for advarselen. | **medium**, patch:valider bevart full kilde. |
| E2/edge | Historisk navigasjon under analyse/filvalg omgår abandon. | **medium**, patch:samme konkrete feil som B1. |
| E3/edge | ID-er TG3-A og TG3-A:B er tillatt; startsWith finner første kortere ID og omskriver begge utløsere til samme forhold. | **medium**, patch:bevar domain-teksten, ingen ID-tolkning i UI. |
| E4/edge | Samme hash/navn gjenvalgt med ready-status beskrives som annen original. | **medium**, patch:samme konkrete feil som B2. |
| V1/verification | Forhåndsverifisert gap:fjern økonomiske triggers/prioritet/kort grunn, og eksisterende renderasserts består. Domainprøver observerer ikke UI. | **medium**, patch:full synlig anbefalingskontrakt og begge økonomiske brudd. |
| V2/verification | Forhåndsverifisert gap:erstatningsprøven stopper i selecting. Å redusere sameOriginal til completed passer alle prøver, men åpner feil PDF etter fullført erstatningsanalyse. | **medium**, patch:test completed erstatning med bevart gammelt snapshot. |
| A1/acceptance | Read-only reducerprobe beviser at avvist usikker fremmed kilde kan fullføre kontrollport. Korrekt sourceTarget gir null, Resultat velger side2. AC2/FR-8/9/AD-4. | **medium**, patch:samme konkrete kildefeil som E1. |
| A2/acceptance | Faktisk getDocumentBasisError med dårlige sider2/3 bevarer begge i kodegenerert reason, men kompakt Resultat gjengir bare første error.target. AC3. | **medium**, patch:bevar kodegenerert kort sideliste uten lokal langforklaring. |
| R1/egen kontroll | FR-17.3/AT-2 krever nettoyield og Ymin/nullgrense i økonomisk grunn. Ymin er bare inne i lukket detalj selv om snapshotet har formatert terskelgrunnlag. | **medium**, patch:vis tallfestet økonomisk regelgrunnlag ved utløseren, fra eksisterende presentasjonsdata. |

Alle20 individuelle kandidater er beholdt. Ingen rejected, maybe-false, defer eller decision-needed. Felles årsaker grupperes: B1/E2; B2/E4; B3/E3; E1/A1; B9/V1. Øvrige punkter beholder selvstendig dom og tiltak. Ingen spec-/produkt-/arkitekturbeslutning endres.

## Lukkede patchgrupper

| Gruppe/punkter | Retting og konkret verifikasjon |
|---|---|
| G1 B1/E2 | Historisk navigate bruker eksisterende report-abandon. To nye reducerprøver krever selecting/analysing → failed/interrupted, generasjon+1 og avvisning av sent filvalg/svar/feil, med bevart snapshot. |
| G2 B2/E4 | Originalidentitet sammenligner bare bevart hash/navn; kontrolltilgjengelighet krever fortsatt completed/gyldige tall. Ny komponentprøve med samme PDF/failed krever at erstatningspåstanden mangler. |
| G3 B3/E3 | Domain-TG3-tekst gjengis uten startsWith-tolkning. Detaljer viser registrert status, bevart tekst og felles anvendbarhetsfeil. To nye komponentprøver dekker gammel Avklart-binding og prefiks-ID-er. |
| G4 B4 | Identiske kompakttekster/handlinger vises én gang; snapshotets domain-utløsere endres ikke. Analysefeilprøven krever én feilrad. |
| G5 B5 | Deluttrekk ignorerer controls som krever fullført grunnlag. Ny kontraktbundet partialResult-prøve med gammel retting/avvisning krever opprinnelige TG2/TG3. |
| G6 B6 | Etiketten bruker assessFindingList(basis). Samme prøve beholder revisjonslikhet, men krever Funnliste ikke bekreftet. |
| G7 B7 | Historisk kilde åpnes uten valg av nyere aktiv funnversjon. Ny appprøve endrer beskrivelse/side og krever originalrapportkontekst og historisk side2. |
| G8 B8 | Samlet Resultat viser én historisk oppsummering. FinancialMetrics beholder standardoppførselen selvstendig. Skjerpet Resultatprøve krever én konkret L-endringsopplysning;24 tidligere nøkkeltallsprøver består. |
| G9 B9/V1 | F1/F2/F4 krever eksakt prioritet, kort grunn og full ordnet utløsersamling. Ny komponentprøve krever begge økonomiske brudd. Håndskrevne forventninger bruker ikke produksjonsformatter som fasit. |
| G10 B10 | bindAnalysisOutcome produserer failed partialResult med TG3, usikker kandidat og limitation. Ny komponentprøve krever alle disse samtidig, uten gamle brukerrettinger/avvisninger. |
| G11 B11 | Originalrapportinngangen har presise smalflateetiketter. Ny900×700-appprøve betjener Enter, korrekt side1, fokus på Originalrapport og Esc-retur. Eksisterende valgte-funn-panelprøver består. |
| G12 E1/A1 | sourceTarget får full bevart kilde. Ny appprøve avviser fremmed original, fullfører kontrollporten og krever PDF-side ukjent, ingen publisert canvas-side og sperrede sidekontroller. |
| G13 V2 | Historisk komponentprøve er utvidet med annen completed rapport. Retur til nye funn er tilgjengelig, historiske individuelle/hovedkildehandlinger mangler og erstatningen forklares. |
| G14 A2 | Komprimeringen bevarer dokumentgrensens kodegenererte Berørte PDF-sider-prefiks uten lange lokale sideårsaker. Ny prøve produserer faktisk dokumentfeil for sider2/3 gjennom felles binder og krever begge i én feilrad. Ingen kontraktendring. |
| G15 R1 | Utløserne viser nettoyield/Ymin og kontantstrøm/nullgrense fra eksisterende snapshot/presentasjon, med forklaring om uavrundet regelgrunnlag. F1/F2 og begge-brudd-prøven krever dette uten detaljåpning. Eksakte terskelavgjørelser er uendret. |

**Alle15 grupper/20 individuelle punkter er lukket.** Ingen nye regler, fornyelseshandlinger, analyseporter eller offentlig testrute. Demo-metadatarettingen er vurdert og beholdt; reelle limitations er fortsatt kritiske.

## Faseverifikasjon

Node24.21.0/npm11.19.0, eksisterende lokal Chromium-cache `/private/tmp/ibe160-story-3-5-browsers`. Browser-/loopbackprøver kjørte med autorisert lokal kjøring utenfor sandkassen uten eksterne tjenester/nøkkel/betalt API.

| Kjøring | Resultat/bevis |
|---|---|
| Reducer før patch | **2 feilet/3 bestått**:fortsatt selecting/analysing etter historisk navigasjon. [Rød logg](story-3-7-review-state-rod.txt). |
| Komponent før patch | **8 feilet/5 bestått** ved konkrete duplikat-, identitets-, TG3-, deluttrekks-, flerside- og økonomiasserts. [Rød logg](story-3-7-review-komponenter-rod.txt). |
| App før patch | **6 feilet/4 bestått**:fem reelle forventningsbrudd og én testinterceptfeil før kildescenarioet. Sistnevnte brukes ikke som rødbevis for E1/A1; Acceptance/reducerproben viste feilen uavhengig. [Førlogg](story-3-7-review-e2e-rod.txt). |
| Målrettet Vitest | **278/278 i seks filer**:navigasjon/snapshot/funnliste/screening/dokumentkontrakt/demo. [Logg](story-3-7-review-malrettet.txt). |
| Alle komponentprøver | **37/37**:24 nøkkeltall+13 Resultat. Seks nye Resultatprøver og skjerpede eksisterende asserts. [Logg](story-3-7-review-komponenter.txt). |
| Berørte bygget-app-prøver | **70/70**:shell,rapport/PDF-kontroll,10 Resultatprøver. Tre nye appprøver og skjerpede F1/F2/F4-forventninger. [Logg](story-3-7-review-e2e.txt). |
| Typecheck/lint/build | Alle exit0. [Typecheck](story-3-7-review-typecheck.txt), [lint](story-3-7-review-lint.txt), [bygg](story-3-7-review-build.txt). Bare eksisterende buntstørrelsesvarsel. |
| Diffkontroll | git diff --check bestått. |

Kildeprøvens første route.fetch-oppsett fikk invalid-request før scenariet; dette var testoppsett, ikke produksjonsfunn. [Diagnoseloggen](story-3-7-review-e2e-kilde-feil.txt) er beholdt. Endelig prøve bruker et skjema-/rapporthashbundet, kontrollert svar ved HTTP-grensen og faktisk original-PDF i nettleseren. [Isolert grønn kjøring](story-3-7-review-e2e-kilde.txt) og hele70-prøvers kjøringen består. F1/F2/F4 prøver fortsatt ordinær dokument-/demo-/HTTP-pipeline. Ingen produksjonskode eller port ble svekket for testoppsettet.

Reviewagenten har inspisert nye faktiske [F1](story-3-7-review-ui/F1-oversikt.png), [F4](story-3-7-review-ui/F4-oversikt.png) og [historisk720×450](story-3-7-review-ui/historisk-200-prosent.png). [F2-bildet](story-3-7-review-ui/F2-oversikt.png) er bevart fra endelig grønn kjøring. Anbefaling/grunn/neste handling og fire tall beholder hierarki og lesbarhet. Native detaljer, kontroll-/returfokus, én-gang-status, korrekt fysisk kilde og smal originalrapport/Esc er prøvd med faktiske nettleserinput. Kontrasttokens er uendret og eksisterende app-shell-kontrastprøver består. Agentgjennomført QA, ingen menneskelig S6 eller sertifisering.

## AC og endelig checkpoint

AC1:én kodeanbefaling med prioritet/kort grunn/alle ordnede utløsere, økonomisk sammenligningsgrunnlag og fire tall. AC2:aktive/avviste/originale funn og brukeropphav/TG3/anvendbarhet er kontrollerbare med bevart kildeidentitet. AC3:deluttrekk/usikkerheter/alle feilsider består uten full lokal langfeil eller falsk listebekreftelse. AC4:historisk snapshot blander ikke inn nye tall/funn/PDF; identisk original feilmerkes ikke, utkast brukes ikke og siste generasjon vernes. AC5:merket demo/retur/bevart kontroll og ett analysekall i hovedcasene, samme domainregler uten ekstern handling. AC6:sticky/zoom/kontrollnavn/native detaljer/fokus/status følger UX; gjentatt historikkliste er fjernet.

**Bestått uavhengig review etter retting. Story3.7 settes done i spec og sprintstatus.** Ingen åpne/utsatte funn eller ny produkt-/arkitekturbeslutning.3.8/3.9 og senere stories er urørt/backlog; mini-sprintens storyarbeid stopper her. Forelderen kjører full siste regresjon etter lokal fasecommit. Ingen fullregresjons-, live-/S2-/S5-/S6-påstand eller push fra reviewagenten. Canonical commit-hash rapporteres fra Git i handover; aktiv automatisk promptlogg holdes utenfor commit.
