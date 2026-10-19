# Story 1.4 — implementeringsverifikasjon

Dato: 2026-10-19. Implementert fra full baseline `13d111237f3b7609786e054455fd5516ef9218d2`. **Implementering egenverifisert, venter uavhengig review.** Storyspec: `in-review`; sprintnøkkel: `review`; Epic 1: `in-progress`; 1.5 og senere: `backlog`.

Denne fasen leverer bare ren numerisk validering/årsnormalisering etter [Story 1.4](../planning-artifacts/epics.md#story-14-validere-tall-og-normalisere-kjent-månedsgrunnlag-eksakt), ikke code review, UI-integrasjon, finansnøkkeltall eller anbefaling. [Teknisk storyspec](spec-1-4-validere-tall-og-normalisere-kjent-manedsgrunnlag-eksakt.md) og [rå kontroller](story-1-4-kontroller.txt) viser scope og faktisk resultat.

## AC mot faktisk funksjon og uavhengig fasit

| AC / kravspor | Implementering og testbevis |
|---|---|
| AC1; FR-3; BT-6/BT-10; AD-7 | `validateFinancialInput` gir alle felt eget `valueStatus`, kanonisk `decimal` eller null, numerisk `status` og konkrete `issues` med felt/mål/kode/tekst/handling. Alle fem felt prøves blanke/whitespace, ikke-numeriske/feilformede og negativt bittesmå. P må være >0; andre ≥0. Alle felt prøves med 0, 0,00, -0 og +000.000 både bekreftet/ubekreftet. P forblir ugyldig; andre nuller blir tilstrekkelige bare ved bekreftelse. Vanlig ubekreftet positiv verdi er også utilstrekkelig. Ingen skjult 0 eller bekreftelse innføres. |
| AC2; FR-1/FR-12/FR-14; AD-7 | Separat strict big.js-konstruktør tar bare tekst. Råregistrering bevares i `registered`; `.times('12').toFixed()` produserer eksakt normal notasjon uten Number/parseFloat, divisjon eller visningsavrunding. Resultatet holder registrert verdi/periode/år/bekreftelse og normaliseringens år/faktor/årsverdi sammen. Kanoniske schemas valideres i tester. Norsk desimalkomma, desimalpunktum, korrekt tusengruppering, store verdier over Number-presisjonen og bittesmå verdier inngår. |
| AC3; BT-7/BT-15 | Uavhengige eksplisitte fasitstrenger: månedlige L=120000/D=20000/J=50000 → 1440000/240000/600000. Blandet L=1440000/år, D=20000/måned, J=600000/år → faktor 1/12/1 og samme årsverdier. P=16000000 og Ymin=7 beholdes uten `normalization`. Ingen nøkkeltall/terskler beregnes i test eller produktmodul. |
| AC4; BT-16 | Alle tre periodiske felt prøves med uoppgitt/unknown/week/feil case: konkret periodeårsak, utilstrekkelig og ingen gjettet årsverdi. Manglende/ugyldig år prøves separat i alle tre felt; uendrede felt beholder egen gyldighet. Hvert av L/D/J prøves med avvikende år; alle involverte felt får `different-years` med eksplisitt L/D/J-år, ingen valgt majoritet/referanseår. Normaliserte kontrollverdier kan fortsatt leses, men status er utilstrekkelig. Samtidige verdi-, null-, periode- og årsproblemer samles stabilt. |
| AC5; NFR-1; AD-1/AD-10 | Fem gjentatte kjøringer av fryst input med presist månedstall, ubekreftelse og ulike år gir eksakt identiske resultater/årsaker; råverdi forblir uendret og faktoren anvendes én gang. Registreringsobjektene er kopier; mutasjon av en resultatkopi påvirker ikke input eller neste kjøring. Ingen klokke, nett, fil, miljø, React eller Express finnes i domain/contracts. |

Resultatets `sufficient` gjelder kun denne storyens numerikk/bekreftelse/periode/år. Kilde-/kostnadskontroll i 1.5 og samlet mangelvurdering i 1.6 kommer senere. Numerisk normalisering er også tilgjengelig som kontrollgrunnlag før bekreftelse; en normalisert kontrollverdi alene er aldri en gyldighetspåstand.

## Faktisk testresultat

- **60/60 Vitest**, fordelt på 51 nye domene-/kontrakttester og ni eksisterende råregistrerings-/tilstandstester.
- **Typecheck, lint og build består.** Første typecheck av testene fant én ubrukt typeimport og en unionindeksert tilordning som TypeScript korrekt avviste. Testene er rettet; sluttkontroll består.
- **19/19 demo-E2E og 2/2 dev-E2E består**, med eksisterende offline ressurslasting, registrering, HTTP-grense, fokus/zoom og HMR. Ingen frontend-/CSS-/backendkode eller E2E-tester er endret.
- **Ny ren npm ci består** i `/private/tmp/ibe160-story14-clean-tww6z20b` uten eksisterende node_modules/dist, med uendret TLS-policy. Deretter består de samme 60 Vitest, typecheck, lint og bygget E2E/dev. Node 24.21.0/npm 11.19.0; nye pins big.js 7.0.1 og @types/big.js 7.0.0. npm audit rapporterer 0 sårbarheter. Dette er ikke S6s annen-person-kjøring.
- npm gir det kjente ikke-blokkerende fsevents-install-scriptvarselet; ingen script-/TLS-policy er endret. Playwrights NO_COLOR/FORCE_COLOR-varsel og forventede Vite-avvisninger av private filer er ikke testfeil. Alle sluttkommandoer returnerte 0.
- Ingen betalt API, nye eksterne appforespørsler, live-bevis, nye UI-krav eller ny manuell UI-kontroll påstås. Repoets bygde demo er gjenopprettet på http://127.0.0.1:3000, exec-session 6174.

## Åpent og videre arbeid

Ingen kjent uløst implementeringsfeil eller nytt produkt-/arkitekturvalg. Story 1.4 er **ikke reviewet eller done**. Neste utviklingsfase er uavhengig BMAD code review av hele Story 1.4 fra baseline ovenfor; reviewer skal selv kontrollere AC og kjøre relevante tester. Story 1.5 startes først etter godkjent review og korrekt done-status. De registrerte senere readiness-portene beholdes åpne.
