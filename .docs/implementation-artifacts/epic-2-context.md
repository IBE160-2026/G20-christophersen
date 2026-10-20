# Epic 2 Context: Kontrollere én tilstandsrapport med originalkilde i lokal demo

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Investoren kan kontrollere ett merket lagret uttrekk gjennom samme dokumentpipeline som live, med original-PDF, bevart opphav, retting/avvisning, separat TG3-avklaring og eksplisitt listebekreftelse. Feil og usikkerhet blir aldri automatisk dokumentert fakta eller tilstrekkelig teknisk grunnlag. Konteksten er avledet fra godkjente epics, final PRD/addendum, final UX, arkitekturspine, SPEC/grensekontrakter og sprintplan/readiness; den endrer ingen av dem.

## Stories

- Story 2.1: Dele og validere dokument-/analysekontrakten
- Story 2.2: Validere PDF-format, sidegrense og originalidentitet
- Story 2.3: Trekke ut sidemerket tekst med kontrollert lesbarhet
- Story 2.4: Hente lagret demo-uttrekk bundet til riktig rapport og versjon
- Story 2.5: Gjennomføre ett HTTP-analyseforløp med duplikatsperre
- Story 2.6: Velge rapport og ta imot bare gjeldende analyseutfall
- Story 2.7: Kontrollere funnets kilde i original-PDF og smalt panel
- Story 2.8: Kontrollere og korrigere funn med bevart original og utkast
- Story 2.9: Avvise feilaktig KI-funn med bevart opphav
- Story 2.10: Registrere og validere separat TG3-avklaring
- Story 2.11: Bekrefte gjeldende funnliste med tydelig tilstrekkelighet

## Requirements & Constraints

Én tekstbasert PDF på høyst 30 sider støttes. Ingen OCR, andre filformater, stille sidefiltrering, avkorting eller relevansutvalg. Alle eksplisitte TG2/TG3 skal hentes; usikker grad eller kilde bevares med opprinnelig opphav og konkret kjent mangel. Ukjent årsak oppgis ikke som kjent. Bare completed med eksplisitt findings-array, også tomt, er fullført analyse. Dokument-/analysefeil og delresultater er fortsatt ufullstendige. Korrekt JSON og kildeområde beviser verken semantisk fullstendighet, at originalen faktisk støtter teksten eller brukerens bekreftelse. Uavklart alvorlig TG3 og uløst kritisk usikkerhet er utilstrekkelig grunnlag selv med gyldige økonomiske tall.

Opphav, originale funn, brukerrettinger og avvisninger holdes adskilt. Ingen KI-bestemt screeninganbefaling eller skjult automatisk kontroll. Samme findingId alene overfører ikke TG3-avklaring til et annet forhold. Endringer og returer følger gjeldende revisjons-/bekreftelsesregler; finansendring starter ingen ny rapportanalyse.

## Technical Decisions

Én felles runtime-skjemaautoritet med avledede typer eier dokument, kilde, analyse og feil. Begge sider bruker denne kontrakten. Contracts/domain har ingen React-, Express-, PDF-, fil-, nettverks- eller miljøavhengighet. Metadata settes og kontrolleres i kode fra mottatt rapportkontekst; modellvalgte verdier bestemmer aldri reportHash, requestId, dokumentidentitet eller modus. ReportHash er senere SHA-256 av originalbytes; filnavn er bare visningsmetadata. PDF-side er heltallsposisjon fra 1, aldri trykt sidetall.

Dokumentgrunnlaget har én pages-post per posisjon 1..pageCount med tekst/status. Kontrakt- og uttrekksversjon følger grunnlag, adapterretur og fixture. Backend bruker låst PDF.js legacy-build; frontend browser-build med lokal matchende worker. Demo og live bruker samme pipeline og kontrakt. Demo-fixture må passe bytehash og versjoner; feil gir ingen live-fallback. Demo er standard uten KI-klient, og frontend eier aktiv vurdering uten varig lagring. Ett eksplisitt HTTP-forløp med duplikatvern; ingen retry, polling, kø eller jobb-API. Gamle svar forkastes også etter abort.

Verifikasjon bruker faktiske PDF-fixtures og uavhengig fasit; kontrollerte adaptere og bygget app uten betalt API. RT-1–RT-19 gjelder ved sine respektive grenser. Reelt KI-treff og S5-tid bevises senere, ikke gjennom demo eller kontrakttester. Kurs og faglærer krever sporbarhet, avgrensede commits, meningsfulle testbevis og lagrede viktige arbeidsøkter uten å utvide valgt produkt.

## UX & Interaction Patterns

De fire vedtatte trinnene, synlig Demo/Live-merking, lokale feil/status og tydelige begreper for uttrekkskontroll, listebekreftelse og TG3-avklaring beholdes. Originalen åpner korrekt PDF-side; fra 1200 CSS px ved siden av funnet, ellers behovsåpnet panel med fokus/retur/kontekst bevart. Tastatur, zoom, kontrast og korte statuskunngjøringer følger final UX. Kontraktleveransen alene innfører ingen UI.

## Cross-Story Dependencies

Oppfølging 2026-10-20: [R2 er lukket](../planning-artifacts/r2-pdf-lesbarhet-semester-v1.md). Lokal deterministisk PDF.js-ekstraksjon, fysisk side og separate uendrede originalbytes beholdes. Readable krever brukbart tekstlag; blank krever strukturelt bevist fravær av innhold og blokkerer ikke alene. Unreadable/unknown/incomplete blokkerer fullføring og alle berørte fysiske sider oppgis. Konservativ avvisning av tekstløse fotosider er godkjent. Ingen OCR/vision/manuell semantisk klassifisering av slike sider eller vilkårlig tekst-/prosentterskel. Kontraktversjon 2 innfører blank; uttrekksformatversjon 1 beholdes. En helt blank PDF er ingen støttet tekstbasert rapport.

2.1 og 2.2 er done. Story 2.3 er done etter [full code review](story-2-3-review.md): lokal sidevis ekstraksjon og strukturelt blankbevis er testet med faktiske PDF-fixtures; se [egenverifikasjonen](story-2-3-verifikasjon.md). Ekstraksjonen ble levert i Story 2.3, etter portlukkingen. Story 2.4 er done etter [full code review](story-2-4-review.md) av felles adaptergrense og lokale F1–F4-svar bundet til originalhash og versjon; se også [verifikasjonen](story-2-4-verifikasjon.md). Story 2.5 er fortsatt backlog og er ikke startet. [R3 er lukket 2026-10-20](../planning-artifacts/r3-http-ressurser-semester-v1.md): upload-/bodygrenser, lokal 60 s-frist og in-memory cleanup er avklart; håndhevelse/tester gjenstår i 2.5. Ingen beslutningsblokkering gjenstår før en egen 2.5-bestilling. R1 gjelder Epic 4 og R4 faktisk S5/S6. Milepæl 1 demonstreres først etter 2.7 og milepæl 2 etter 2.11; ingen senere story implementeres gjennom R2.
