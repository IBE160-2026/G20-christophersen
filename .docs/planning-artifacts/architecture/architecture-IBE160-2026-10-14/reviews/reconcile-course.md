# Kildeavstemming: sensorveiledning IBE160 – Del 1

Dato: 2026-10-14. Uavhengig avstemming av [ARCHITECTURE-SPINE](../ARCHITECTURE-SPINE.md) mot [original sensorveiledning](../../../../reference/course/Sensorveiledning-IBE160-Del-1.pdf), alle sju PDF-sider lest med macOS PDFKit. Det tidligere [parafraserte kildeuttrekket](../../../prds/prd-IBE160-2026-10-10/kildeuttrekk-sensorveiledning.md) er brukt som krysskontroll, ikke som en ny kravkilde. [Beslutningsloggen](../.memlog.md) og [promptloggens dokumentasjon](../../../../process/prompts/README.md) er lest for å kontrollere prosessforankringen.

**Vurdering: Forenlig med sensorveiledningen. Ingen blokkerende, vesentlige eller konkrete lave kildekonflikter funnet.** Arkitekturen gir et egnet grunnlag for senere leveranse- og testbevis; den er ikke selv bevis på at appen, testene, README eller startstakken virker. Ingen kilder, produktkrav eller arkitekturbeslutninger er endret.

## Avstemte vurderingshensyn

| Sensorveiledning | Ivaretatt i spinen / prosessgrunnlaget |
| --- | --- |
| Plan–kode-spor og begrunnede teknologi-/arkitekturvalg, s. 2–3 | Kildeliste og bindende PRD/UX-arv; AD-1–AD-10 har kravbindinger; Capability → Architecture Map knytter krav til ansvar. AD-10 krever senere krav-, arkitektur- og testeksempelspor. Q-1–Q-7 i beslutningsloggen dokumenterer alternativer, begrunnelser og brukerens styring. |
| Lagrede prompts og KI-økter som kan knyttes til konkrete endringer, s. 1–3 og 7 | Beslutningsloggen identifiserer bestillingens hook-loggede sesjon og konkrete avklaringer. Prosjektet har egen promptlogg med dokumentert mekanisme. Dette er prosessartefakter i repoet; det innføres ingen revisjonsfunksjon i produktet. |
| Meningsfull, kjørbar testing av sentral logikk, feil input og gjentatte handlinger, s. 2–4 | AD-1/AD-7/AD-8 isolerer finans og regler. AD-3–AD-6 gir testbare dokument-/adaptergrenser og vern mot falsk fullføring, duplikater og gamle svar. AD-10 og Verifikasjonsgrenser inkluderer uavhengig fasit, relevante grensefall, frontend-overganger, bygget E2E-app og manuell UX-kontroll. Demo og live-kvalitet holdes uttrykkelig atskilt. |
| Struktur som samsvarer med arkitekturen, lesbar kode, lite duplisering og fornuftige avhengigheter, s. 5 | Enkel sekvensiell pipeline, rene moduler, én delt kontraktautoritet og klart frontend/backend-eierskap. Structural Seed gir en forståelig modulstruktur med ett språk og én verktøykjede. Database, jobbkø og ekstern drift innføres ikke. Versjoner er startvalg, med faktisk kompatibilitet og låsfil uttrykkelig lagt til implementeringen. |
| Eksakte README-kommandoer og kjøring i rent miljø kun etter README, s. 2 og 5–6 | AD-9 og Structural Seed låser bygget frontend + én lokal Express-server. Installasjon, bygg, demo, utvikling og tester har planlagte kommandokontrakter. Faktisk adresse og miljøvariabler skal dokumenteres senere; scripts påstås ikke å finnes nå. Verifikasjonsgrensene krever at en annen person følger README uten gruppens nøkkel/konto, med eksternt nett sperret i demo. |
| Ryddig repo og fravær av hemmeligheter, s. 4 og 6–7 | AD-9 holder nøkler i backend og utenfor frontend, Git, feil og logger. Private PDF-er/midlertidige data versjoneres ikke; statisk server tilbyr ikke reporoten. Structural Seed skiller kode, fiktive testressurser og dokumenterte bevis. |
| Godkjent retning og apptilpasset UX, s. 2–5 | Bindende produktkilder og AD-9 bevarer den godkjente firetrinnsflyten, originalkildevisningen, responsive panelvalg, tastatur/fokus/status og designvalg. Arkitekturen oppretter ingen nye produktfunksjoner. |

## Senere leveransebevis – ikke arkitekturfunn

Sensor vurderer den faktiske leveransen. Ved implementering må README derfor få de endelige kopierbare kommandoene, alle nødvendige forberedelser inklusive eventuell Playwright-browserinstallasjon, lokal adresse, demo-/testdata, hemmelighetsfri miljøeksempelfil og lenker til plan/prosess. Disse må prøves i rent miljø, ikke bare beskrives.

Meningsfulle tester må faktisk kjøres; manuelle kontroller, kodegjennomgang og konkrete funn/rettinger må dokumenteres. Prompts og beslutninger bør fortsatt kobles til de konkrete endringene de styrer. Byggeartefakter, avhengigheter, lokale filer og hemmeligheter må holdes ute av Git gjennom passende ignore-regler og kontroll av det som versjoneres, også historikken. Dette følger veiledningens leveranse-/prosessvurdering og er ikke grunn til å starte kode, stories eller epics nå.

Veiledningen er uttrykkelig en støtte for faglig skjønn, ikke en mekanisk sjekkliste (s. 1). Eksempler på roller, datalagring, integrasjoner, arbeidsflytverktøy og testtyper skaper derfor ingen universelle produktkrav. Ingen bestemt stakk, skyutrulling, minimum antall roller eller testdekningsprosent kreves her. Den valgte lokale v1-arkitekturen skal vurderes mot godkjent scope og faktisk kvalitet.
