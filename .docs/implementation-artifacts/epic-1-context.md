# Epic 1 Context: Etablere et kontrollert økonomigrunnlag i en kjørbar lokal app

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Investoren skal kunne starte en lokal desktop-webapp, registrere finansverdier for ett boligutleieobjekt med periode/år, kilder og kostnadsinnhold, forstå mangler, rette og eksplisitt bekrefte gjeldende grunnlag. Epicen etablerer også felles kodevurdering av kritiske mangler. Finansberegninger, økonomiske terskler og komplett screening hører til Epic 3; rapportbehandling til Epic 2 og faktisk live KI til Epic 4. [Godkjente epics](../planning-artifacts/epics.md) og [Product Brief](../planning-artifacts/briefs/brief-IBE160-2026-09-15/brief.md) avgrenser leveransen.

## Stories

- Story 1.1: Etablere reproduserbar startstruktur og importgrenser
- Story 1.2: Starte den bygde lokale appen med godkjent appskall
- Story 1.3: Registrere og bevare finansverdier for ett objekt
- Story 1.4: Validere tall og normalisere kjent månedsgrunnlag eksakt
- Story 1.5: Gjøre kilder, kostnadsinnhold og uløste konflikter kontrollerbare
- Story 1.6: Vurdere kritiske mangler med fast kodebegrunnelse
- Story 1.7: Kontrollere, bekrefte og rette gjeldende tallgrunnlag

## Requirements & Constraints

- P er totalpris inklusive eventuell fellesgjeld, uten kjøpsomkostninger. L er leie, D eierbetalt drift, J renter/avdrag inklusive fellesgjeld, Ymin minimum nettoyield i prosent. Alle beløp gjelder NOK, samme objekt og samme år. Bare kjent månedlig L/D/J ganges med 12; registrert verdi, periode, faktor og årsgrunnlag beholdes.
- P må være større enn null; L/D/J/Ymin minst null. Blank er manglende, aldri null. Null krever eksplisitt bekreftelse. Ugyldig, konfliktfylt eller ubekreftet verdi brukes ikke som gyldig grunnlag. Kritiske mangler gir kodebestemt «Innhent mer informasjon» med alle aktuelle mangler og konkrete neste handlinger.
- Hvert felt har synlig kilde eller brukerforutsetning. Inkluderte kostnader dobbelttelles ikke; gjeldsbetjening i felleskostnader skilles ut til J. Uløste kildekonflikter vises uten automatisk prioritering. Bekreftelse gjelder faktisk kontrollert verdi inklusive periode/år/kilde/kostnadsinnhold; faktisk endring opphever berørt bekreftelse, navigasjon alene gjør det ikke.
- Lokal installasjon/kontroll skal kunne etterprøves uten live-nøkkel eller betalt tjeneste. Hemmeligheter, avhengigheter, byggeartefakter og private originaler holdes utenfor Git. Faktiske kommandoer, miljø, funn og kravspor lagres i implementeringsbevis; viktige prompts/arbeidsøkter bevares. Ingen dummytester eller påstått bestått S6 fra egen utviklingskjøring.

Detaljkrav eies av [PRD](../planning-artifacts/prds/prd-IBE160-2026-10-10/prd.md) og [SPEC med adopterte kompanjonger](../specs/spec-IBE160/SPEC.md). [Faglærerens gjeldende oppfølging](../planning-artifacts/briefs/brief-IBE160-2026-09-15/revisjonskontroll-2026-10-08.md) og [sensorveiledningen](../reference/course/Sensorveiledning-IBE160-Del-1.pdf) krever relevante prosess-/kvalitetsbevis uten å utvide produktet.

## Technical Decisions

- Functional core / imperative shell: `domain` eier rene validerings-/normaliserings-/finans-/screeningfunksjoner; React eier aktiv økt; backend eier dokument-/analyse-I/O og gir aldri finansresultat eller anbefaling. `contracts` er felles autoritet for runtime-skjema og avledede typer. `domain`/`contracts` har ingen React-, Express-, PDF-, fil-, nettverks- eller miljøavhengighet. Frontend bruker domain/presentasjon/contracts; backend dokument-/analysekomponenter/contracts. Ingen kopierte DTO-er eller parallelle regler.
- Offisiell Vite `react-ts`, én package.json/package-lock.json og npm fra Node-installasjonen. Låste pins relevante for epicen: Node 24.21.0, React/react-dom 19.3.0, TypeScript 6.0.2, Vite 8.3.4, plugin-react 6.1.2, Oxlint 1.87.0, Express 5.3.0, big.js 7.0.1, Zod 4.6.7, Vitest 5.0.4, Playwright 1.64.0. Avhengigheter tilføyes ved første behov. Versjons-/kompatibilitetsavvik krever avklaring; pins byttes ikke i stillhet.
- Opprett bare nødvendig struktur/kode før første bruk. Ingen komplett framtidig datamodell, analysekontrakt, database eller agentrammeverk. Rene desimalstrenger og big.js brukes før eksakt aritmetikk, uten Number/parseFloat som mellomledd. Presentasjonsavrunding påvirker aldri regler.
- Lokal ferdigbuild serveres senere av én Express-prosess på loopback med samme origin for frontend og `/api`; dev samles bak én kommando. Ressurser er lokale. Aktiv økt er React reducer/context og avsluttes ved sidelukking/oppdatering; ingen varig lagring.

[Arkitekturen](../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md) og [grensekontraktene](../specs/spec-IBE160/grensekontrakter.md) styrer grensene.

## UX & Interaction Patterns

Fire eksakte trinn: Tallgrunnlag → Tilstandsrapport → Kontroller funn → Resultat. Stepper viser nummer/navn/tekststatus, bevarer retur og forklarer sperrede trinn. Norsk, nøkternt språk; lokale feil ved berørt felt; synlige etiketter/enheter/perioder/kilder, tastatur og synlig fokus. Tomme felt har ingen finansstandarder. Bruk [DESIGNs](../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/DESIGN.md) eksakte grafitt-/petrol-/systemfont-/geometritokens og [EXPERIENCEs](../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md) kontrollatferd når UI-storyene gjennomføres. Startstruktur alene leverer ingen ferdig produktflate.

## Cross-Story Dependencies

SP1 følger 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7; de direkte avhengighetene og BMAD-statusene følges i [sprintplan](sprint-plan.md) og [sprintstatus](sprint-status.yaml). Startstruktur og faktisk appstart er egne arbeidsenheter. Nåværende bestilling omfatter bare 1.1; 1.2 startes ikke automatisk.

[Readiness](../planning-artifacts/implementation-readiness.md) er CONCERNS, men ingen registrert port blokkerer Epic 1: PDF-lesbarhet må avklares før 2.3, HTTP-/ressursgrenser før 2.5, live-oppsett før Epic 4 og faktiske personer/miljø før S5/S6. Felles mangellogikk utvides av Epic 2 og gjenbrukes i Epic 3; ingen senere modul bygges på forskudd. Reell uklarhet eller nødvendig ny beslutning legges frem for Mads før løsning velges.
