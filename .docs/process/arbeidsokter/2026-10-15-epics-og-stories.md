# Arbeidsøkt: epics og stories — 2026-10-15

## Oppdrag og avgrensning

Mads ba om BMAD epics og stories for Property Acquisition Agent med ferdig Product Brief, PRD, UX, arkitektur, SPEC, faglærertilbakemelding og sensorveiledning som låst grunnlag. Målet er få gjennomførbare epics, små implementerbare/testbare stories, konkrete akseptansekriterier, logikknære tester og gradvis rekkefølge. Hver story skal spores til relevant FR/NFR/UX/SPEC. Ingen implementering, og ingen endring av produkt/scope/finans/anbefaling/UX/arkitektur/grensekontrakt uten avklaring. Etter ferdig oppdeling skal implementation readiness kontrolleres og hull/avhengigheter rapporteres.

Bestillingen er også bevart i den hook-genererte [promptloggen](../prompts/session-01a13ef2-fed1-7f10-b2fb-594dddd788e1.jsonl). Dette referatet beskriver faktisk arbeid; det erstatter ikke originalprompten.

## Workflow og kilder

- Anvendt [bmad-create-epics-and-stories](../../../.agents/skills/bmad-create-epics-and-stories/SKILL.md), med customization-resolver og _bmad/bmm/config.yaml. Resolveren returnerte ingen prepend/append/persistent-facts/on-complete-overstyringer. Norsk kommunikasjon/dokumenter; bruker Mads; prosjekt IBE160.
- [bmad-sprint-planning](../../../.agents/skills/bmad-sprint-planning/SKILL.md) er lest for den bestilte senere readiness-only-kontrollen. Readiness-gaten er ikke startet før epics/stories er ferdige.
- PDF-ferdigheten er lest for sensor-PDF. pdftotext/pypdf/pdfplumber var ikke tilgjengelige; originalen leses med macOS PDFKit via Swift. Ingen pakker installeres eller PDF-er endres.
- Brukerens uttrykkelige liste over ferdige og låste kilder er grunnlaget for kildevalget; det finnes én aktuell final PRD, ett final UX-par, én final spine og én SPEC. Brief-/PRD-addenda, SPEC-kompanjonger og gjeldende faglæreroppfølging inngår fordi hoveddokumentene gjør dem bindende. inputDocuments i [epics.md](../../planning-artifacts/epics.md) registrerer 14 filer.
- Lest hele PRD/addendum, DESIGN/EXPERIENCE, spine, SPEC/kontrakter/sporbarhet/verifikasjon, brief/addendum, faglærer/oppfølging og sensorveiledningen. Tidligere kontroller og promptlogg brukes som prosesskontekst, ikke nye produktkrav.

## Steg 1: kravuttak

Opprettet [epics.md](../../planning-artifacts/epics.md) fra workflowens dokumentstruktur med 18 eksisterende FR, fem NFR, seks suksessmål, åtte CAP-er, ti AR-spor til AD-1–AD-10 og 41 konkrete UX-DR, inklusive alle 26 navngitte komponentpar. Fulltekstkravene er adoptert gjennom direkte kildelenker; uttaket er en indeks og endrer ingen autoritet. Fasit-ID-ene RT/BT/AT/TT og de sju FR-5-eksemplene er bevart som eksisterende kravfasit, ikke kjørte produkttester.

Spesielt kontrollert: mangler før økonomi; alle avgjørende utløsere; eksakt likhet og avrundingsgrense; delberegninger; tom fullført liste kontra feil; original/utkast/Bruk/Avbryt; separat TG3-avklaring bundet til samme rapportforhold; sent svar/duplikatsperre; identisk demo/live-kontrakt uten live-fallback; fire UX-trinn og lokal feilvisning. Starter/stack/kommandokontrakter er videreført uten installasjon.

Eksisterende Deferred om modell/budsjett, ressursgrenser, PDF-lesbarhet, kodeschemas og faktiske bevis beholdes med kildenes eiere og avklaringspunkter. De avgjøres ikke i oppdelingen. Ingen reell ny produktkonflikt er identifisert i kravuttaket; dette er ikke en readiness-PASS.

## Workflow-kontrollpunkt

Workflowens [steg 1](../../../.agents/skills/bmad-create-epics-and-stories/steps/step-01-validate-prerequisites.md) sier: «ONLY proceed to next step when user selects 'C' and requirements are extracted» og «ALWAYS halt and wait for user input after presenting menu». Kravuttaket er derfor klart for brukerens C. stepsCompleted er fortsatt tom fordi bekreftelsen gjenstår; ingen fremtidige steg er lest eller gjennomført. Dette er en workflow-bekreftelse av uttakets samsvar med låst grunnlag, ingen gjenåpning av krav.

Ingen epics/stories er foregrepet, ingen implementation readiness-kontroll er feilaktig erklært fullført, og ingen kode/fixtures/app-tester/installasjon/live-kall/commit er startet. De autoritative filene skal forbli uendret.

## Dokumentkontroll og kildeintegritet

Kontrollert 2026-10-15: 14 kilder finnes og er byteidentiske med HEAD; alle kontrollerte lokale lenker finnes. Kravuttaket har 18 FR, fem NFR, 41 UX-DR, ti AR og åtte CAP-rader. Bare de to planlagte templatefeltene for senere kravdekning/epic-liste står åpne. Ingen epic/story eller readiness-konklusjon er generert. Originalbestillingen finnes i promptloggen. Dette er dokumentkontroll, ingen produkttest.

Original sensor-PDF er lest med PDFKit, alle sju sider. Ingen layoutavhengig tolkning er brukt; tekstinnholdet er grunnlag for kurs-/prosessføringene.

| Låst kilde (repo-relativt) | SHA-256 ved kravuttak |
|---|---|
| .docs/planning-artifacts/briefs/brief-IBE160-2026-09-15/brief.md | 01d875a58691d8c137eaa160180207e4b7a139ca072559f295801aa4a5065043 |
| .docs/planning-artifacts/briefs/brief-IBE160-2026-09-15/addendum.md | 0b2cbe583a289fe33a6d99ca2249bdba05a4f6feba0471abb48723be73bbc11f |
| .docs/planning-artifacts/briefs/brief-IBE160-2026-09-15/revisjonskontroll-2026-10-08.md | e299483c448b4699a36a87b47d8ec1f99df3eb576878f9c5b2138c86f4a92605 |
| .docs/planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md | 6d02fe52f238ef3c8a563cf150949c2e1c2845f0f6fc7e04bcccfde4001e5fd0 |
| .docs/planning-artifacts/prds/prd-IBE160-2026-10-10/prd.md | 17e86a0298c844a384aa9053e8d9f7bae72dd12634a9a69693d0c2a7daabfaf0 |
| .docs/planning-artifacts/prds/prd-IBE160-2026-10-10/addendum.md | ad1b5e0e040fd6261cd2caf2e209f061f8cbb55b7131079c35ebf0797b7ae15d |
| .docs/planning-artifacts/ux-designs/ux-IBE160-2026-10-13/DESIGN.md | e9dd28cf0b961c8844b751178e2102c07e65694219201a7040b4c336ada49565 |
| .docs/planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md | 49bd5b3d956dbf7add2dfca236dec1a25bbbfe1f1873c9696983c83a135709b0 |
| .docs/planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md | 3055bccfe0438c2526c2daa23032d20f837f8238e8942cb5f81f79c23ba27604 |
| .docs/specs/spec-IBE160/SPEC.md | 95913782063848aed06c81715d7cd93745ec26dfda85edda7d85148e489a9e6e |
| .docs/specs/spec-IBE160/grensekontrakter.md | 2ed88bea3600c4c7b535ba05f1bd8d3603d70c627d11e7b2cfd4fc570af12d45 |
| .docs/specs/spec-IBE160/sporbarhet.md | 67e3fb3b66e9dab524ac041887a75553fb3b8cb0b214e80195b7543448a07e83 |
| .docs/specs/spec-IBE160/verifikasjon-og-avklaringer.md | 85a2aa626d46188b683e3d8fa4cf7c3c1d5fa584c1bd9371e1514aa4300e862c |
| .docs/reference/course/Sensorveiledning-IBE160-Del-1.pdf | a0069856666a32e2e5c886fe1c46ade1d666a99bf800bc42b9e20113adc2e509 |

## Oppfølging: C og epic-design

Mads svarte «c» og bekreftet kravuttaket. Steg 1 er registrert i stepsCompleted; steg 2 er lest i sin helhet. Ingen fremtidige steg er lest. Kildene og det bekreftede kravuttaket beholdes; bare arbeidsstatus og planens dekning/epic-liste oppdateres.

Foreslått fem brukerorienterte epics: (1) kontrollert økonomigrunnlag i kjørbar lokal app, (2) rapport-/original-/funnkontroll i demo, (3) samlet screeningresultat og oppdatering, (4) valgfri live-analyse med separat evaluering, (5) annen-person- og sensor-kjørbarhet fra README. FR-matrisen skiller primært funksjonsansvar fra integrasjon/verifikasjon, med egen NFR/CAP/AD/S/UX-dekning. Ingen story-ID, storytekst eller storyakseptansekriterium er opprettet.

Grupperingsbegrunnelse: Det låste designet tilsier få sammenhengende epics. Dokument/HTTP/funn er samme ende-til-ende-komponent og samles fremfor egne epics per teknisk lag. Grunnstruktur og faktisk appstart, input/validering, PDF-validering/tekstuttrekk, demo/live, funnkontroll/TG3, finans/thresholds, screening og resultat forblir eksplisitt ulike arbeidsenheter til neste steg. Rene finans-/screeningfunksjoner legges i Epic 1, uten å legge til en ny finansresultatflate i Tallgrunnlag; dette gir den samme kodebaserte lokale mangelbegrunnelsen fra starten og unngår midlertidig regellogikk. Epic 3 gjenbruker dem i Resultat.

Avhengigheter går fremover 1 → 2 → 3 → 4 → 5. Ingen tidligere epic avhenger av en senere for sitt beskrevne brukerutfall. Demo etter Epic 3 avhenger ikke av leverandør/budsjett; Epic 5s offline-/README-/UX-arbeid kan kontrolleres etter Epic 3, mens samlet live-bevis trenger Epic 4. Faktisk S6 krever annen person/rent miljø. Eksisterende Deferred for PDF/ressurser/live beholdes med eier og seneste avklaringspunkt, uten skjulte valg.

Steg 2 krever eksplisitt godkjenning før stories: «FORBIDDEN to load next step until user approves epics_list» og C-meny. Epic-listen er lagret som konkret forslag for gjennomgang, ikke feilaktig markert godkjent. currentStep er step-02-design-epics; steg 2 legges ikke i stepsCompleted før C. Ingen implementering eller readiness-konklusjon.

### Kontroll av epic-forslaget

Mekanisk kontroll: fem fortløpende epic-overskrifter; alle 18 FR har egen dekningsrad; alle 41 UX-DR er fordelt som realisering i Epic 1–4, med samlet verifikasjon i Epic 5. Ingen storyoverskrifter eller uutfylte templatefelt. Lokale lenker og dokumentformatering kontrollert. Alle 14 autoritative kildehashene stemmer fortsatt med kravuttakets baseline. Ingen produkt-/kildeendringer, installasjon eller produkttest.

## Oppfølging: A — Advanced Elicitation

Mads valgte A ved epic-kontrollpunktet. [bmad-advanced-elicitation](../../../.agents/skills/bmad-advanced-elicitation/SKILL.md) er aktivert mot det siste forslaget til fem epics med kravdekning/avhengigheter. Customization-resolveren ga standard methods.csv, ingen preferanser og ingen ekstra metoder. Kategoriene risk/core/technical/framing ble hentet via katalogscriptet; ingen full katalogdump.

Første metodevalg tilbys fra fem ulike angrepsvinkler: Problem Decomposition (32), Pre-mortem Analysis (59), Assumption Audit (64), Cascading Failure Simulation (65) og Boundary & Edge Case Sweep (71). Valgene retter seg mot liten oppdeling, gjennomførbarhet, planantakelser, avhengigheter og testgrenser. Det låste produkt-/UX-/arkitekturgrunnlaget er ikke et forhandlingsobjekt.

Ferdigheten krever metodevalg før anvendelse og Apply/Reject før forslag innarbeides. Ingen metode er kjørt ennå, og epic-forslaget er uendret. Etter avsluttet elicitation returneres kontrollen til steg 2s godkjenningsmeny; A er ikke en godkjenning til stories/implementering.

Katalogscriptets første uv-kjøring traff en utilgjengelig global cache. Samme kommando lyktes med UV_CACHE_DIR i /tmp; ingen eskalering eller prosjekt-/systemendring var nødvendig.

## Oppfølging: metode 1 og 3 gjennomført

Mads valgte «1, 3». Problem Decomposition (32) er anvendt først mot gjeldende epic-plan; Assumption Audit (64) er deretter anvendt mot både den opprinnelige planen og det hypotetisk forbedrede forslaget. Beskrivelser/output_pattern er hentet via katalogens show-kommando. Ingen subagenter, eksterne undersøkelser eller implementering er brukt.

[Fordypningen](2026-10-15-epics-fordypning.md) dokumenterer funn, kildespor, kvalitativ holdbarhet/konsekvens for ti planantakelser, en konkret revidert fem-epic-fordeling og fem presise innarbeidingspunkter. Den er merket proposal-awaiting-apply-or-reject og er ikke en ny autoritativ produkt-/arkitekturversjon.

Hovedfunn: lokal Innhent mer informasjon begrunner en tidlig felles prioritet-1-vurdering i domain, men ikke automatisk tidlig ferdigstillelse av finans/økonomiske terskler og hele screeningen. Foreslått avlastning flytter økonomidelen til Epic 3 med felles mangelregler fra starten. Epic 2 beholder sammenhengende brukerutfall med to demonstrerbare milepæler og små senere stories. Story-størrelse/fravær av fremtidige avhengigheter kan først endelig kontrolleres etter faktisk oppdeling; fem epics alene gir ingen gjennomførbarhetsgaranti. Eksisterende Deferred og faktiske data-/test-/evalueringsbehov er videreført.

Ingen forslag er innarbeidet i epics.md. Målfilens SHA-256 før/etter skal være feb6d71e67c33e6bd7057d54ae63107028b3b4e3880b637ee7ba51adb5fed9dd. Brukerens Apply/Reject/annen retning gjenstår etter ferdighetens eksplisitte regel «Never change the work unless the user accepts the proposal». Hovedworkflowen er fortsatt på steg 2, ikke godkjent for stories.

Dokumentkontroll etter fordypningen: epic-forslagets hash er uendret, alle 14 låste kildehashene stemmer, og kontrollerte lokale lenker/formatering i de to prosessfilene er gyldige. Ingen produktresultater er påstått.

## Oppfølging: Apply med presisering av live-leveransen

Mads godkjente forslagene fra fordypningen, med én uttrykkelig presisering: faktisk KI-analyse inngår i låst v1; demomodus er en alternativ kjøreform for sensor/testing uten API-nøkkel og kan ikke erstatte produktets evne til å analysere en støttet rapport med KI. Epic 4 skal hete «Live KI-analyse og evaluering», integrere valgt leverandør/modell gjennom allerede låst adapter, utføre faktisk analyse og evalueres mot de kontrollerte casene. Leverandør/modell/kostnadsramme/konkrete timeouter kan fortsatt avklares før berørt implementering. Brukeren ba om fem epics og stopp ved kontrollpunktet før stories.

Innarbeidet i epics.md: Epic 1 er begrenset til kjørbar app, kontrollert tallgrunnlag og nødvendig felles lokal mangellogikk. Finansberegninger, beregnbarhet per nøkkeltall, økonomiske terskler, nøkkeltallsformat og komplett screening ligger i Epic 3. Inputdesimaler/årsnormalisering bevares i Epic 1. Epic 2 har to demonstrerbare milepæler: rapport/uttrekk/korrekt originalside, deretter korrigering/TG3/funnlistebekreftelse. Ingen nye brukerhandlinger eller skjermer er lagt til. Små stories/logikknære tester skal fortsatt utformes innen disse milepælene.

FR-matrise, NFR/CAP/AD-/UX-dekning og fellesfil-/rekkefølgetekst er oppdatert i samsvar med flyttingen. Påstanden om at storyavhengigheter er avklart er erstattet med mål og senere kontroll mot faktiske stories/gjennomførbarhet. Demo kan ferdigstilles og offline-verifiseres før live, mens samlet v1-leveranse fortsatt krever Epic 4 og reelle KI-/evalueringsbevis. Ufullført live-/S2-/S5-bevis kan ikke skjules bak bestått demo.

Arkitekturens eksisterende avklaringspunkter beholdes: lesbarhet før gyldig dokumentgrunnlag og upload-/HTTP-ressurser/opprydding før HTTP-integrasjon i Epic 2; leverandør-/modell-/budsjett-/live-timeoutavklaringer før KI-integrasjon i Epic 4. Ingen konkrete verdier eller ny hard S5-timeout er valgt. De 14 autoritative kildefilene endres ikke.

Elicitation-forslaget er merket applied-with-user-clarification og bevares som prosesshistorikk med den nye avgjørelsen. Brukerens uttrykkelige returstyring avslutter elicitation uten et ekstra metodevalg. Hovedworkflowen forblir i steg 2 med bare steg 1 i stepsCompleted, godkjente forbedringer innarbeidet og C-videreføring før stories gjenstående. Ingen framtidige workflow-steg er lest, ingen readiness-konklusjon og ingen implementering er startet.

### Kontroll etter innarbeiding

Alle 14 autoritative kildehashene stemmer fortsatt. Fem epic-overskrifter og 18 FR-dekningsrader er komplette; FR-12–FR-18 har primæransvar i Epic 3, og to milepæler er registrert i Epic 2. Alle 41 UX-DR, fem NFR og eksisterende CAP/AD/S-spor er beholdt. Epic 4 heter Live KI-analyse og evaluering; gjeldende epic-plan omtaler ikke lenger live-funksjonen som valgfri leveranse. Dokumentlenker/formatering og workflow-status er kontrollert; ingen storyoverskrifter eller templatefelt står feilaktig som ferdig arbeid. Den nye Apply-presiseringen finnes i hook-loggen.

SHA-256 for epics.md etter Apply: a5e723278a25fbb858e9bd1a671911a2d14be26bb9ddb356893ea984e98d8d2c. Dette er dokumentkontroll, ikke implementation readiness eller produkttest. Stoppunkt: steg 2, C før stories.

## Oppfølging: C — epic-strukturen låst, steg 3 startet

Mads svarte C etter innarbeiding av de godkjente forbedringene og presiseringen om live-leveransen. Steg 2 er registrert som fullført, epicDesignStatus er approved-and-locked, og steg 3 er lest i sin helhet. Ingen framtidige workflow-steg er lest; ingen implementering eller readiness-konklusjon.

[Storyforslaget for Epic 1](2026-10-15-epic-1-stories-forslag.md) har sju fortløpende stories: startstruktur, faktisk appstart, manuell registrering, ren validering/år, kilde/kostnad/konflikt, felles mangellogikk og komplett bekreftelses-/feilflyt. Hver har brukerhistorie, Given/When/Then, konkrete krav-/UX-/SPEC-/AD-spor, logikknære testkrav og bare tidligere storyavhengigheter. Finans/økonomiske terskler/full screening forblir Epic 3 og faktisk KI-analyse Epic 4.

Steg 3 krever storygjennomgang og at en story er godkjent før den appendes til hoveddokumentet, samt bekreftelse før neste epic. De sju forslagene er derfor lagret som prosessforslag til samlet gjennomgang av én epic, med individuell vurdering/tilbakemelding per ID og mulighet for samlet C-godkjenning. Ingen forslag er feilaktig registrert som godkjent eller innarbeidet som endelig story. Epic 2 er ikke påbegynt. epics.md viser lenke/status/oversikt, men ingen endelige storyseksjoner ennå.

Kurs-/AGENTS-sporet videreføres i denne arbeidsloggen og den eksisterende hook-loggen. Det opprettes ingen appfiler, fixtures, tester, pakkeinstallasjon eller betalte kall gjennom storyforslaget.

### Kontroll av Epic 1-forslaget

Sju unike fortløpende story-ID-er og 34 Given/When/Then/And-kriterier er kontrollert. Alle har brukerhistorie, kravspor, avhengighetsfelt og egne testkrav. Direkte avhengigheter peker bare til tidligere stories i Epic 1; ingen fremtidig story kreves for modul-/grenseverifikasjon. Lokale lenker/formatering og alle 14 låste kildehashene er kontrollert. Storytekstene er fortsatt forslag; approvedStoryCount er 0, og Epic 2/produkttester/readiness er ikke startet.

## Oppfølging: C — Epic 1 godkjent og innarbeidet

Mads svarte C ved gjennomgangen av story 1.1–1.7. Alle sju er registrert godkjent og appendet i epics.md under egen Epic 1-seksjon, med uendret brukerhistorie, akseptansekriterier og testkrav. Det tidligere forslaget er merket approved-and-incorporated og beholdt som gjennomgangshistorikk. Hoveddokumentet har approvedStoryCount 7 og currentEpic 2; steg 3 er fortsatt pågående.

Epic 2 behandles videre rundt de to godkjente milepælene. Ingen senere epic eller framtidig workflow-steg er startet, og det er ikke startet implementering/fixtures/produkttester/installasjon. Kildenes eksisterende avklaringer er fortsatt ikke avgjort i stillhet.

SHA-256 for innarbeidet Epic 1-seksjon: 9a10d5c84126ec90114610168094e18bc77c748c162064a348a8f48933fdd5fb.

## Epic 2: storyforslag til gjennomgang

[Elleve forslag](2026-10-15-epic-2-stories-forslag.md) er utformet etter den låste strukturen og de to godkjente milepælene. Milepæl 1 har 2.1–2.7: felles kontrakt; PDF-format/side/hash med faktiske casefiler/fasit; sidemerket tekst/lesbarhet; demo-adapter; HTTP/duplikatsperre; frontendens gjeldende analyseforløp; original-PDF/panel. Milepæl 2 har 2.8–2.11: kontroll/utkast/Bruk/Avbryt; avvisning; separat forholdsbundet TG3-avklaring; eksplisitt listebekreftelse.

Faktiske F1–F4-dokumenter/fasit er arbeid i 2.2, mens spesifikke feilfixtures tilføyes ved logikken som trenger dem. Lesbarhet avklares før gyldig uttrekk i 2.3 og konkrete upload-/HTTP-ressurser/opprydding før integrasjonen i 2.5. Leverandør/modell/budsjett og faktisk KI-analyse er fortsatt Epic 4. Ingen konkrete ressursverdier eller nye produktvalg er tatt her.

Skillet mellom completed/tomliste/failed/usikker kandidat, mellom analyse/enkeltfunn/liste/TG3, og mellom opprinnelig/utkast/gjeldende/avvist er konkretisert med tester ved hver grense. HTTP-/duplikat-/sent-svarvern og gjenbruk har eksplisitte tester på antall adapterkall; skjult retry/live-fallback er ikke tillatt. Rapport-/kontrollendringer bygger grunnlagsrevisjoner nå, mens historisk resultat vises i Epic 3. Hver story har lokal krav-/SPEC-/UX-/AD-sporing og selvstendig modul-/UI-grense.

Forslagene er ikke registrert som godkjent eller innarbeidet i hovedplanens endelige storyseksjon. epics.md viser ventende gjennomgang av Epic 2 og sju godkjente stories fra Epic 1. Steg 3 krever bekreftelse før videreføring til Epic 3. Ingen implementering, produkttester eller readiness-konklusjon.

### Kontroll før Epic 2-gjennomgang

Godkjent Epic 1-seksjon er sammenlignet byte for byte mot de godkjente storytekstene i gjennomgangsfilen; alle sju er innarbeidet uendret. Epic 2 har elleve fortløpende unike story-ID-er, 50 Given/When/Then/And-kriterier, egne krav-/test-/avhengighetsfelt og dekningsrader for FR-5–FR-11. Direkte avhengigheter peker bare til tidligere stories eller godkjent Epic 1. Alle 14 låste kildehashene, kontrollerte lokale lenker og dokumentformatering stemmer. Dette er dokument-/planleggingskontroll, ikke implementert funksjonalitet eller full readiness. Epic 2 avventer godkjenning; Epic 3 er ikke startet.

Første kontrollforsøk sammenlignet feil seksjon fordi et uankret heading-søk også traff Epic List-overskriftens tredje #-tegn. Kontrollsøket ble forankret til hele linjen med riktig headingnivå; godkjent storytekst trengte ingen endring. Dette er retting av kontrollverktøyet, ikke av produktkrav.

## Oppfølging: C — Epic 2 godkjent og innarbeidet

Mads svarte C ved gjennomgangen av story 2.1–2.11. Alle elleve er registrert godkjent og appendet uendret i epics.md, med de to godkjente milepælene. Gjennomgangsfilen er merket approved-and-incorporated og beholdt som prosesshistorikk. Hovedplanen har nå 18 godkjente stories fra Epic 1 og 2, approvedStoryEpics [1, 2] og currentEpic 3.

Steg 3 fortsetter med Epic 3: separate finansberegninger/beregnbarhet, eksakte terskler, presentasjonsformat, komplett screening, revisjonsbundet resultat og kontrollert oppdatering. Ingen senere epic, framtidig workflow-steg, readiness-konklusjon eller produktimplementering er startet.

SHA-256 for innarbeidet Epic 2-seksjon: 9c428a2179ad478459564dd4972640ee35367429080a27c383769f30288585b5.

## Epic 3: storyforslag til gjennomgang

[Ni forslag](2026-10-15-epic-3-stories-forslag.md) fordeler Epic 3 på finans/beregnbarhet (3.1), eksakte terskler (3.2), separat format (3.3), komplett screening (3.4), revisjonsbundet snapshot/reducer (3.5), nøkkeltalls-/formelkomponenter (3.6), første samlede Resultat (3.7), faktisk finansoppdatering (3.8) og rapport-/funn-/TG3-oppdatering (3.9). Arbeidsgrensene i den låste epic-strukturen er beholdt.

Snapshotvern kommer før UI; ingen gammel anbefaling kan være gjeldende mens senere fornyelsesintegrasjon gjenstår. Komponentstory 3.6 har direkte verifikasjon ved egen grense uten ny produktskjerm/testrute eller fremtidig story som forutsetning. 3.8 og 3.9 kobler de eksisterende kontrollhandlingene til nye gjeldende resultater og kontrollerer dem i bygget app. Ingen finansregel, navigasjonsvei, ny bekreftelse eller UX-handling er lagt til.

Tersklene bruker eksakt 100 * NOI >= P * Ymin og cash >= 0; likhet består uten S1-margin. Presentasjonens hele NOK/tre yielddesimaler holdes separat, med nødvendig detalj ved skjult brudd. Full screening gjenbruker den felles kritisk-mangel- og TG3-anvendbarhetsvalideringen, gir alle utløsere på avgjørende nivå og identisk fast begrunnelse/neste handling. Draft/Bruk/Avbryt, relevant ny finans-/listekontroll, særskilt TG3-endring og ny rapport har separate observerbare regler/testkrav.

Hver story viser FR/NFR/S, CAP, AD og relevante UX-DR og eksisterende BT-/AT-/RT-/FR-5-fasit. Ingen nye funksjoner, testdekningsprosenter eller implementeringsvalg utenfor låst grunnlag er vedtatt. Faktisk KI-analyse og live-evaluering følger i Epic 4; demoen erstatter ikke live-leveransen. Alle 18 allerede godkjente stories forblir uendret, og de ni nye er bare forslag til gjennomgang. Epic 4/5, framtidige workflow-steg og implementation readiness er ikke startet; ingen appfiler, fixtures, tester, installasjon eller betalte kall er opprettet/kjørt gjennom planleggingsarbeidet.

### Kontroll før Epic 3-gjennomgang

Hovedplanen inneholder nøyaktig 18 godkjente stories, 1.1–1.7 og 2.1–2.11. Begge innarbeidede epic-seksjoner er sammenlignet byte for byte med de godkjente gjennomgangstekstene og er uendret. Epic 3-forslaget har ni fortløpende unike story-ID-er og 48 nummererte Given/When/Then/And-kriterier. Alle ni har brukerhistorie, FR-/NFR-/AD-/CAP-/UX-spor, arbeidsgrense, egne testkrav og eksplisitte avhengigheter som bare peker til tidligere stories; storynumrene er sammenlignet som heltallspar.

FR-12–FR-18 har hver dekningsrad. Hele BT-fasiten fordeles mellom finans/terskler/format/oppdatering, og AT-fasiten mellom ren screening, snapshot og faktisk resultat-/endringsflyt. Ikke-nåbare UI-varianter kontrolleres ved modul-/tilstands-/komponentgrensen; ingen ny navigasjon eller testrute er forutsatt. Dette er en foreløpig kontroll av den aktuelle oppdelingen, ikke den senere fullstendige readiness-vurderingen av alle epics.

Alle 14 låste kildehashene stemmer fortsatt. Dokumentformatering og 66 lokale lenkeforekomster i plan-/prosessfilene er kontrollert. Forslaget har approvedStories [] og hovedplanen har currentEpic 3/approvedStoryCount 18; ingen forslag er feilaktig godkjent. Ingen produkttester er kjørt eller produktfunksjon påstått implementert. Neste kontrollpunkt er Mads’ storygjennomgang og bekreftelse før Epic 4, etter steg 3s «Get user confirmation to proceed to next epic».

## Oppfølging: C — Epic 3 godkjent og innarbeidet

Mads svarte C ved gjennomgangen av story 3.1–3.9. Alle ni er registrert godkjent og appendet uendret i epics.md. Gjennomgangsfilen er merket approved-and-incorporated og beholdt som prosesshistorikk. Hovedplanen har nå 27 godkjente stories fra Epic 1–3, approvedStoryEpics [1, 2, 3] og currentEpic 4.

Steg 3 fortsetter med Epic 4: faktisk live KI-analyse gjennom den låste adapteren og separat evaluering av originaluttrekk/tid. Leverandør/modell/budsjett/timeouter beholdes som synlige gjennomføringsavklaringer før berørt implementering; demo erstatter ikke live-kravet. Ingen senere epic, framtidig workflow-steg, readiness-konklusjon eller produktimplementering er startet.

SHA-256 for innarbeidet Epic 3-seksjon: 6ed317d8bc622e3bf8efc00944536998877e554c700c35413a19a78a11de8491.

## Epic 4: storyforslag til gjennomgang

[Fem forslag](2026-10-15-epic-4-stories-forslag.md) fordeler live-leveransen på lokal konfigurasjon/valgt klient/nøkkelgrense (4.1), reell leverandøradapter/prompt/kontrakt (4.2), HTTP-/appintegrasjon med feil/gjenbruk (4.3), faktiske live-kjøringer/originaluttrekk/S2 (4.4) og målt live-/menneskelig kontrolltid/manuell referanse/S5 (4.5). Det kreves både faktisk KI-funksjonalitet og separate evalueringsbevis; demo eller kontrollerte tester lukker ikke dette kravet.

Gjennomføringsporten før Epic 4-implementering er eksplisitt: Mads + live-integrasjon avklarer valgt leverandør/modell/SDK, kapasitet, prisgrunnlag/prosjektbudsjett/beregnet testkostnad og konkrete leverandør-/live-timeouter. Ingen valg eller betalte forsøk gjøres gjennom storyplanen. Avklaringene for PDF-lesbarhet i 2.3 og upload-/HTTP-ressurser/opprydding i 2.5 utsettes ikke til Epic 4. S5s medianmål gjøres ikke til hard timeout.

4.1–4.3 har direkte kontrollerte tester uten betalt API. Valgt SDKs faktiske transportforsøk kontrolleres, ikke bare en konfigurasjonsverdi for retry. Appintegrasjonen beholder duplikatsperre til serverstopp, identitets-/generasjonsvern, riktig completed/failed/tomliste/usikkerhet og ingen analyse ved finans-/kontroll-/TG3-endring. Fullført eller feil live får eksisterende lokale status-/tilgjengelighetsmønstre; ingen ny konfigurasjonsskjerm eller regelmotor innføres.

4.4 bevarer originalt reelt modelluttrekk før retting og måler alle TG3/≥90 % TG2 med riktig PDF-side, ingen oppdiktede, avvik per rapport og ingen fasit-/terskeltilpasning. F3s rapport kan evalueres ved adaptergrensen uten å fjerne casets tallmangel; det gir ingen gyldig S5-start. 4.5 følger hele PRD-protokollen med faktiske mennesker/målepunkter, separate medianer og feil/demo/ufullførte forsøk, og målt manuell referanse av samme caser. Gyldige komplette tidsdata kan gjenbrukes; manglende data krever nye eksplisitte forsøk innen budsjett, ingen automatisk retry eller apptelemetri.

Alle fem har egne FR-/NFR-/AD-/CAP-/UX-spor og relevante RT-/AT-/TT-/FR-5-testkrav. De er bare forslag til gjennomgang; de 27 godkjente storytekstene fra Epic 1–3 beholdes uendret. Epic 5, framtidige workflow-steg og implementation readiness er ikke startet. Ingen implementering, fixtures, produkttester, installasjon, nøkkellesing eller leverandørkall er utført gjennom planleggingsarbeidet.

### Kontroll før Epic 4-gjennomgang

Hovedplanen har nøyaktig 27 godkjente stories, 1.1–1.7/2.1–2.11/3.1–3.9. Alle tre innarbeidede epic-seksjoner er sammenlignet byte for byte mot sine godkjente gjennomgangstekster og er uendret. Epic 4 har fem fortløpende unike story-ID-er og 29 nummererte Given/When/Then/And-kriterier. Alle har brukerhistorie, FR-/NFR-/AD-/CAP-/UX-spor, arbeidsgrense og egne test-/evalueringskrav. Direkte storyavhengigheter er kontrollert som heltallspar og peker bare til tidligere stories. Gjennomføringsporten er plassert i selve Epic 4-seksjonen, slik at den følger med ved senere godkjent innarbeiding.

Dekningsrader for live FR-6/FR-7/FR-8/FR-9, gjenbrukte kontroll-/resultatkrav, NFR-1–NFR-5, S2/S5, K1/K2 og Deferred er kontrollert. Eksterne avhengigheter er synlige: faktiske leverandør-/modell-/budsjett-/timeoutavklaringer, lokal nøkkel, reelle forsøk og person til kontroll/manuell referanse. Dette er foreløpig dokument-/oppdelingskontroll, ikke implementation readiness eller et bevis for faktisk KI-kvalitet/tid.

Alle 14 låste kildehashene stemmer fortsatt. Formatering og 79 lokale lenkeforekomster er kontrollert. Hovedplanen har currentEpic 4/approvedStoryCount 27 og forslaget approvedStories []; ingen av de fem er feilaktig registrert godkjent. Ingen produktkode, produkttest, nøkkellesing eller live-kall. Neste kontrollpunkt er Mads’ storygjennomgang og bekreftelse før Epic 5, etter steg 3s «Get user confirmation to proceed to next epic».

## Oppfølging: C — Epic 4 godkjent og innarbeidet

Mads svarte C ved gjennomgangen av story 4.1–4.5. Alle fem, med den eksplisitte gjennomføringsporten før implementering, er registrert godkjent og appendet uendret i epics.md. Gjennomgangsfilen er merket approved-and-incorporated og beholdt som prosesshistorikk. Hovedplanen har nå 32 godkjente stories fra Epic 1–4, approvedStoryEpics [1, 2, 3, 4] og currentEpic 5.

Steg 3 fortsetter med Epic 5: samlet regresjon, manuell UX, README-/ren-miljø-kjøring og dokumenterte leveransebevis. Storygodkjenningen velger ingen leverandør/modell/budsjett/timeouter, autoriserer ingen betalte kall og starter ingen implementering. Framtidige workflow-steg og implementation readiness er ikke startet.

SHA-256 for innarbeidet Epic 4-seksjon: 8b4dcbcb2cfe74908bca963f81f5c6e3f575a30e1792a5ee513a0d17e6ec0179.

## Epic 5: storyforslag og siste storygjennomgang

[Fem forslag](2026-10-15-epic-5-stories-forslag.md) fordeler sensor-/leveransearbeidet på samlet automatisk demoregresjon (5.1), manuell felles UX/tilgjengelighet (5.2), faktisk demo-/testoppskrift i README (5.3), annen-person-kjøring/S6 (5.4) og samlet krav-/evalueringsbevis, live-anvisning og repokontroll (5.5). Testene og tilgjengeligheten fra tidligere funksjonsstories utsettes ikke til denne epicen.

5.1–5.4 har direkte forutsetninger i leverte demo-/funksjonsstories og tidligere Epic 5-stories, uten live-avhengighet. 5.3 gir komplett demooppskrift; endelig live-konfigurasjonsanvisning er konkret arbeid i 5.5 etter 4.3. Felles UX kontrolleres i 5.2, live-spesifikke tilstander er 4.3 og samles i 5.5. 5.4 krever faktisk annen person/rent miljø organisert av Mads, ikke en agent som simulerer S6. 5.5 trenger 4.4/4.5s faktiske bevis og kontrollerer at tidlige bevis fortsatt gjelder den endelige versjonen. Dette bevarer den godkjente muligheten for tidligere offline-verifikasjon uten å kalle demo fullført v1.

Kursgrunnlaget er kontrollert mot sensorveiledningens eksisterende tekstuttrekk fra PDF og gjeldende faglæreroppfølging: meningsfull logikk-/feiltesting, manuelle UX-observasjoner, faktisk kodegjennomgang/rettinger, README-basert ren kjøring og konkrete prosess-/repo-/dataspor. Ingen nye testtyper/dekningsprosent, karakterkrav, database, driftsplattform, telemetri eller produktfunksjon innføres. De låste kildene holdes uendret.

Alle fem epics er nå storyoppdelt til gjennomgang: 32 godkjente og fem foreslåtte stories, totalt 37. De nye fem er ikke appendet som godkjente i hovedplanen. Dette siste epic-kontrollpunktet presenteres sammen med steg 3s avsluttende A/P/C-meny: C godkjenner/innarbeider 5.1–5.5 og fortsetter til steg 4, først etter at alle stories er lagret. A/P returnerer til kontrollpunktet. Steg 4 og readiness-gaten er ikke lest/startet; steg 3 forblir pågående til C. Implementation readiness er allerede bestilt og følger ferdig epics/stories-workflow, uten implementeringsstart.

Bare plan-/prosessdokumenter er skrevet. Ingen appfiler, fixtures, produkttester, installasjon, nøkkellesing, leverandørkall, annen-person-henvendelse eller Git-commit er utført gjennom planleggingsarbeidet.

### Kontroll før siste storygjennomgang / steg 3-meny

Epic 5-forslaget har fem fortløpende unike ID-er og 27 nummererte Given/When/Then/And-kriterier, med egne brukerhistorier, krav-/UX-/CAP-/AD-spor, avhengigheter, arbeidsgrenser og verifikasjonskrav. Hovedplanen har nøyaktig 32 godkjente stories. Alle fire godkjente epic-seksjoner er sammenlignet byte for byte med de godkjente gjennomgangstekstene og er uendret, inklusive Epic 4s gjennomføringsport.

Den samlede foreløpige oppdelingen har 37 stories og 188 kriterier, med 117 direkte storyavhengigheter. Alle ID-er er kjente, alle direkte avhengigheter peker til tidligere stories målt som heltallspar, og grafen har ingen sykluser. 5.1–5.4 har ingen live-avhengighet; 5.5 har eksplisitte forutsetninger til 4.3/4.4/4.5. Gjennomføringsporter/person/rent miljø og versjonsrelevans er videreført i teksten; dette erstatter ikke den senere semantiske readiness-/gjennomførbarhetskontrollen.

ID-sporene i Kravspor dekker FR-1–FR-18, NFR-1–NFR-5, CAP-1–CAP-8, AD-1–AD-10 og UX-DR1–UX-DR41 både i de allerede godkjente funksjonsepicene og samlet med Epic 5. Dette er mekanisk ID-dekning, ikke full akseptanse eller implementeringsbevis. Alle 14 låste kildehashene stemmer. 95 lokale lenkeforekomster og dokumentformatering er kontrollert.

Første generelle kontroll krevde ekstraetiketten Arbeidsgrense i alle eldre stories. Godkjent 2.3/2.5 bruker avklaringspunkt og konkrete kontrakt-/akseptansekriterier som avgrensning; etiketten er ikke et workflowkrav. Kontrollverktøyet ble tilpasset denne eksisterende formen uten å endre godkjent tekst. Alle fem nye stories har eksplisitt Arbeidsgrense, og den korrigerte samlede dokumentkontrollen bestod.

Hovedstatus er currentEpic 5/approvedStoryCount 32 og epic-5-proposed-awaiting-final-approval. Forslaget har approvedStories []; steg 3 er fortsatt pågående. Avsluttende meny avventer Mads’ valg. C godkjenner de konkrete fem, lagrer alle stories og går videre til steg 4 og deretter bestilt implementation readiness. Ingen framtidige workflow-steg er lest, ingen readiness-konklusjon og ingen implementering/produkttest/live-kjøring.
