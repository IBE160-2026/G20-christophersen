# Story 1.4 — uavhengig BMAD code review

Dato: 2026-10-19. **Bestått etter to små rettinger. Storyspec og sprintnøkkel: done.** Epic 1 er fortsatt in-progress. Ingen produkt-/arkitekturbeslutning eller blocker.

Mål: `13d111237f3b7609786e054455fd5516ef9218d2..4bfed39bdd8f4181375cd92a112b7241a5a8c007`; 15 filer, +800/−19 linjer. Arbeidet startet på ren `9d7489c61d8183dc2729a104cd811fb685a23ac3`; den nyere commiten endret bare prosessbestillingen. Diffen var 1045 linjer / 65709 bytes. [Storyspec](spec-1-4-validere-tall-og-normalisere-kjent-manedsgrunnlag-eksakt.md), [egen råverifikasjon](story-1-4-review-kontroller.txt) og [prosess/prompt](../process/arbeidsokter/2026-10-19-story-1-4-review.md) dokumenterer kontrollen.

## Autoritet og gjennomføring

Direkte lest: alle AC/testkrav i epics Story 1.4, grensene 1.3/1.5/1.6/1.7, final DESIGN/EXPERIENCE, ARCHITECTURE-SPINE AD-1/AD-7/AD-10, SPEC og kompanjongenes relevante finans-/verifikasjonskontrakter, PRD FR-1–FR-4 og addendum BT-7/15/16, brief/addendum, sprintplan/-status og AGENTS.md. Kursgrunnlaget er sensorveiledningens eksisterende direkte PDFKit-uttrekk under SPECs `.working/`, faglærerens tilbakemelding og gjeldende oppfølging 2026-10-08. Krav, UX, arkitektur, SPEC, sprintplan og epics er uendret.

Fire konfigurerte uavhengige reviewlag ble kjørt lesende, maksimalt to samtidig grunnet agentslottene. Ingen underreviewer fikk skrive eller starte egne agenter. Jeg alene triagerte/rettet etter at alle lag var ferdige og kjørte testene selv.

| Lag | Faktisk resultat |
|---|---|
| Blind Hunter | Ni forslag. N=min(floor(sqrt(65,709 kB)+1),10)=9. Alle ni er triagert separat nedenfor. |
| Edge Case Hunter | `[]`; eksplisitt bekreftet fullført instruksjons-, diff-, slettings- og claims-kontroll, uten funn eller feil. |
| Verification Gap | «No verification gaps found.» |
| Acceptance Auditor | Alle fem AC kontrollert direkte; ingen funn, 84 ekstra lesende Node-asserts bestått. Dette er lagets kontroll, separat fra mine egne testkommandoer. |

Ingen lag feilet. Bare Blind Hunters funn førte til triageposter.

## Alle AC mot faktisk kode

| AC / spor | Konkrete bevis og egen kontroll |
|---|---|
| AC1; FR-3; AD-7 | `validateValue` i `src/domain/validation.ts` skiller blank (`missing`, null) fra ikke-numerisk (`invalid`) og eksplisitt 0. P≤0 er alltid ugyldig; L/D/J/Ymin<0 ugyldig. Ubekreftet gyldig tall/0 får egen bekreftelsesårsak uten at numerisk verdi endres. 51 domenetester inkluderer alle fem felt med blank/whitespace, feilformet input, negative verdier og bekreftet/ubekreftet 0. Ni eksisterende tilstandstester består også. |
| AC2; FR-1/12/14; AD-7 | Separat strict big.js 7.0.1-konstruktør tar desimaltekst; ingen Number/parseFloat før aritmetikk. Kun kjent måned bruker `.times('12').toFixed()`. `registered` bevarer råtekst/bekreftelse/periode/år, og normalisering holder år/faktor/årsverdi. Store presise og bittesmå desimalstrenger verifiseres eksakt uten toleranse. Contracts eier typene; domain har ingen UI/server/I/O. |
| AC3; BT-7/15 | Måned 120000/20000/50000 gir eksakt 1440000/240000/600000. Årsregistrering har faktor 1. Blandet år/måned med samme eksplisitte år gir faktor 1/12/1. P=16000000 og Ymin=7 beholder verdiene uten normaliseringsfelt. Uavhengige konstante fasitstrenger, ingen produktberegnet forventningsverdi. |
| AC4; BT-16 | Uoppgitt/ukjent/ustøttet periode gir berørt felt og konkret årsak/handling, ingen årsverdi. Manglende/ugyldig år normaliseres ikke. Ulike år merker alle involverte felt utilstrekkelige med faktisk årskontekst og null commonYear; ingen referanse-/standardår velges. Eksakt årsverdi kan beholdes som kontrollgrunnlag, men er fortsatt utilstrekkelig. |
| AC5; NFR-1; AD-1/10 | Fryst input kjøres fem ganger med eksakt identiske resultater/årsaker, kopierte registreringer og én faktor 12. Mutasjon av resultatkopi endrer ikke input eller neste kjøring. Ingen klokke, nett, fil eller miljøavhengighet. |

`sufficient` beskriver bare denne storyens numerikk/bekreftelse/periode/år. Kilde-/kostnadskontroll, felles mangelvurdering og faktisk UI-bekreftelse kommer i 1.5/1.6/1.7. Ingen finansnøkkeltall, terskler eller screening er implementert.

## Individuell triage

Alle B1–B9 kommer fra `blind-hunter`. Ingen funn er slått sammen eller utelatt. For B1–B5 bekrefter en egen Node-probe at schemastrukturen godtar de fabrikerte objektene. De fem funnene har derfor **low**, ikke false; det er deres praktiske relevans og ekstra guardkompleksitet som avvises. Søk i hele src/tests viser ingen inngang som tar imot eksternt konstruert valideringsresultat: domain er eneste produsent, og runtime-resultatschema brukes foreløpig bare i testene.

| ID / sted | Påstand | Verdict, bevis og behandling |
|---|---|---|
| B1 · financial-validation.ts:23–29 | Schema godtar missing/null kombinert med sufficient/ingen issues. | **low, rejected.** Probe bekrefter strukturell aksept; `validateValue` returnerer alltid missing+insufficient+missing-value for blank. Ingen aktuell produsent lager den motsigelsen. Kryssfeltguards for en fabrikkert tilstand uten mottaker er ikke nødvendig i daglig bruk. |
| B2 · samme fil:34–38 | Faktor 12 godtas for årsregistrert verdi. | **low, rejected.** Strukturell probe bekrefter dette; domain velger alltid faktor direkte fra validert period og tester krever 1/12. Ingen feil skjer fra registrert input. Ny semantisk schema-logikk ville gjenta domeneregelen. |
| B3 · samme fil:35/49 | Resultatår kan være vilkårlig tekst eller tom streng. | **low, rejected.** Fabrikkert resultat godtas; domain fjerner innledende nuller fra eksplisitt positivt heltall og gir ellers issue/null. Ingen ekstern resultatmottaker trenger nye outputguards nå. Ingen ny kalendergrense innføres. |
| B4 · samme fil:28/50 | Feltissues og samleissues kan motsi hverandre. | **low, rejected.** Probe bekrefter formelt mulig objekt; domain bygger samlelisten direkte fra feltene i fast rekkefølge. Fabrikkert resultat brukes ingen steder. Ytterligere konsistensguards gir kompleksitet uten aktuell feilbane. |
| B5 · samme fil:10–20 | Tom tekst, duplikatrelasjoner og uforenlig mål/kode godtas. | **low, rejected.** Probe bekrefter strukturell aksept; faktiske issue-kall har ikke-tomme faste tekster, korrekte felt/mål/koder og unike relasjoner fra feltlisten. Flere semantiske guards ville kopiere reglene uten å rette nåværende inputbehandling. |
| B6 · samme fil:33 | Kommentaren kan overtolke sufficient som full bruksgyldighet. | **low, patch rettet.** Kommentaren sier nå eksplisitt numerikk/bekreftelse/periode/år og at kilde/kostnadsinnhold også må vurderes. Bare kommentar, ingen runtime-/kontraktutvidelse. |
| B7 · validation.ts:60–64 | Manglende dokumentasjon/test av malformed input som ZodError. | **false, rejected som funksjonsfeil.** Direkte eget kall med tall som rawValue gir forventet ZodError. Feil struktur skal gi kontraktfeil; ikke-numerisk råtekst skal gi feltårsak og testes slik. Funksjonen tar en typet kontrakt, ikke vilkårlig input. JSDoc-utvidelse er et dokumentønske uten påvist feil. |
| B8 · financial-validation.test.ts | AC-feltutvalg utledes av samme produksjonsenum som validator bruker. | **low, patch rettet.** De faste fem finansfeltene og tre periodiske feltene står nå eksplisitt som uavhengig testinput. Parametriserte tester/immutabilitetskontroll bruker disse, slik at testutvalget ikke krymper med en feil i produksjonsenum. Antall tester og domeneregler er uendret. |
| B9 · domain/README.md | Modul-README mangler inputformater og eksempel på utilstrekkelig normalisering. | **false, rejected som manglende forbrukskontrakt.** README forklarer numerisk tilstrekkelighet, funksjonens kontraktkommentar navngir scopet, og storyspec/verifikasjon dokumenterer inputformater og kontrollgrunnlag før bekreftelse eksplisitt. Ingen eksisterende forbruker gjenskaper eller gjetter reglene. Full duplisering i modul-README er ikke påkrevd AC. |

Resultat: **0 decision-needed, 2 patch rettet, 0 defer, 7 rejected.** Ingen uløst high/medium eller åpent handlingspunkt. Ingen deferred-ledger-endring er nødvendig.

## Egen testkjøring og sluttstatus

- Før rettinger: `npm test` 60/60; `npm run lint`; `npm run build` inklusive typecheck; `npx playwright test` 19/19; `npx playwright test --config playwright.dev.config.ts` 2/2. Alle fullførte sluttkommandoer exit 0.
- Etter kommentar-/testrettinger: `npm test` 60/60, `npm run lint` og `npm run typecheck`, alle exit 0. Ingen runtimekode ble endret; den beståtte build-/E2E-kjøringen gjelder samme funksjonelle kilde.
- Egne Node-prober verifiserte de fem schemaobservasjonene, alle faste felt-ID-er, korrekt faktisk domeneoutput og offentlig funksjons ZodError ved feil inputstruktur.
- Port 3000 var ledig ved start; ingen fremmed prosess ble stoppet. Første sandkasse-E2E nektet lokal server før teststart. Autorisert eskalert kjøring av loopback-server/Chromium besto. NO_COLOR/FORCE_COLOR-varsel og Vites forventede avvisninger av private filer er ikke testfeil. Serverne stoppes av Playwright; ingen eksisterende demo måtte gjenopprettes.
- Ren installasjon er allerede dokumentert etter den gjeldende låsfilen i implementeringsbeviset. Ingen konkret installasjonsfeil gjorde gjentakelse nødvendig. B8 fra Story 1.3 forblir lukket.
- Sluttkontroll: `git diff --check` og SHA-256-sammenlikning av alle 104 låste kildefiler mot orkestratorens baseline. Ingen låst fil er endret.

Story 1.4 er **done** i både storyspec og sprintstatus; Epic 1 **in-progress**, Story 1.5/1.6/1.7 fortsatt **backlog** ved denne faseoverleveringen. Readiness CONCERNS og R1–R4 er uendret; ingen port berører 1.5. Ingen staging/commit/push fra reviewagenten. Hovedagenten overtar skriveansvaret og lager fasecommit før neste sekvensielle implementeringsfase.
