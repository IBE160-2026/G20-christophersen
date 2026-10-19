# Story 1.6 — egenverifikasjon

Dato: 2026-10-19. Implementeringsbaseline:
`88eb9b95a4d93616612ceb643b45164cb36d5b5f`.
[Godkjent story](../planning-artifacts/epics.md#story-16-vurdere-kritiske-mangler-med-fast-kodebegrunnelse),
[implementeringsspec](spec-1-6-vurdere-kritiske-mangler-med-fast-kodebegrunnelse.md),
[råutdata](story-1-6-kontroller.txt) og
[prompt-/prosessreferat](../process/arbeidsokter/2026-10-19-story-1-6.md).

## AC mot faktisk modul og uavhengig fasit

| AC | Bevis og utfall |
|---|---|
| AC1 | `evaluateKnownDeficiencies` kaller `validateFinancialBasis` og bevarer alle `FinancialIssue`-data uten nye tall-/kilde-/kostnadsregler. Vitest prøver samtidige P0, blank L, L-konflikt, negativ D, ubekreftet J og ikke-numerisk Ymin, dessuten hver blank/ubekreftet verdi, negative/nullverdier, periode/år/kilde/kostnad. Alle felt/koder/handlinger beholdes; bare «Innhent mer informasjon», prioritet 1. Relevant AT-5/AT-12: består. |
| AC2 | Uavhengig full objektfasit: blank L, ubekreftet J0, blank Ymin gir nøyaktig disse tre utløserne i L/J/Ymin-rekkefølge, med eksakte meldinger, full begrunnelse og neste handling. Hver L/D/J/Ymin0 skiller ubekreftet fra bekreftet; P0 forblir ugyldig. Ingen utfylling eller inputmutasjon: består. |
| AC3 | Kontrollerte F1-/F2-finansverdier med både `missing-report` og `incomplete-report` gir bare prioritert mangelutfall. Kjent årsak og kodebundet innhentings-/fullføringshandling prøves med eksakt objekt-/tekstfasit. L/Ymin og kjent avbrutt rapportanalyse samles. Dette dekker bare tilgjengelig del av AT-18; faktiske dokumentfeil/TG3 eies fortsatt av Epic 2: består. |
| AC4 | Frosset input, fem gjentakelser, byteidentisk JSON, omvendt innkommende rapportrekkefølge og mutasjon av returnerte meldinger/relasjoner prøves. Fast P/L/D/J/Ymin-orden og rapportkode-/tegnorden krever ingen locale, klokke eller miljø. Samme rene modul deler kontraktdata; ingen React/backend/adapter får regelkopi. AT-19s tilgjengelige determinismekrav: består. |
| AC5 | Tomt mottatt delgrunnlag og kontrollerte F1/F2 uten mottatte mangler gir nøyaktig `no-known-deficiencies`, null anbefaling/prioritet/begrunnelse/handling og tom utløserliste. Runtime-skjemaet avviser Gå videre/Forkast i denne tilstanden. Rapportlisten er ikke fullføringsbevis. Ingen nøkkeltall, terskler eller full screening er implementert: består. |

Fasiten i `tests/unit/screening.test.ts` oppgir forventede felt/koder/tekster
direkte, uavhengig av produksjonsenums og funksjoner. F1/F2-inndata kommer fra
brief-addendum; testene beregner ingen økonomisk fasit med funksjonen under test.

## Faktiske kommandoer

CWD er prosjektroten. Runtime er
`PATH=/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:$PATH`.
E2E bruker i tillegg
`PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-1-2-browsers`.

| Kommando | Resultat |
|---|---|
| `npm test -- tests/unit/screening.test.ts` | Første målrettede kjøring: 35/35 bestått. |
| `npm test` | Sluttkjøring: fire filer, 127/127 bestått (92 eksisterende + 35 nye). |
| `npm run typecheck` | Bestått etter retting av testfixture: unionstilordning erstattet av oppdatering av eksisterende råverdi/bekreftelse. Førfeil og rettet kjøring er bevart i råloggen. |
| `npm run lint` | Bestått uten varsler. |
| `npm run test:e2e` | Inkluderer `npm run build`/typecheck: bestått; 27/27 demo-E2E og 2/2 dev-E2E bestått. |
| `git diff --check` | Bestått. |
| SHA-256 mot mini-sprintens kildebaseline | 104/104 låste filer uendret. |

Første E2E-forsøk bygde vellykket, men sandboxen sperret loopback-serveren.
Den autoriserte eskalerte lokale server-/Chromium-kjøringen bestod. Dette var
ingen produktfeil eller automatisk godkjenningsavvisning. Ingen fremmed prosess
ble stoppet; Playwright ryddet sine egne servere, og port 3000 er ledig.

## Grense og overleveringsstatus

Nye contracts/domain/testfiler og implementerings-/prosessbevis er lagt til,
pluss Story 1.6s sprintstatus. README-ens foreldede 1.4-/teststatus er presisert
til dagens egenverifiserte leveranse etter hovedagentens særskilte bestilling.
Ingen UI-endring, avhengighet, lockfil,
versjonspin, TLS-policy eller låst kilde er endret. Eksisterende E2E er regresjon;
ingen ny manuell UI-runde trengs for denne rene modulstoryen. Ingen installasjon,
live-KI, dokument-/TG3-motor, økonomiske terskler, full screening eller S5/S6-bevis
påstås.

Storyspec er **in-review**, sprintnøkkel **review**, Epic 1 **in-progress** og
Story 1.7 **backlog**. Ingen kjent implementeringsfeil eller åpent produktvalg.
Dette er egenverifikasjon; brukerens siste fase bestilte ingen review av 1.6,
så workflowens integrerte reviewer/done/commit er avgrenset. Agenten har ikke
staged, committet eller pushet. Hovedagenten får skriveansvaret tilbake før
lokal fasecommit og avslutning av mini-sprinten.
