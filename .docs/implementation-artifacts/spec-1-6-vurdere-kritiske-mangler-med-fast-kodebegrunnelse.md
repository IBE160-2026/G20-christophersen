---
title: 'Story 1.6 — Vurdere kritiske mangler med fast kodebegrunnelse'
type: 'feature'
created: '2026-10-19'
status: 'done'
route: 'oneshot'
story_key: '1-6-vurdere-kritiske-mangler-med-fast-kodebegrunnelse'
baseline_commit: '88eb9b95a4d93616612ceb643b45164cb36d5b5f'
---

<frozen-after-approval reason="Brukerens eksplisitte implementeringsbestilling av godkjent Story 1.6">

## Intent

Implementer bare [Story 1.6 AC1–AC5](../planning-artifacts/epics.md#story-16-vurdere-kritiske-mangler-med-fast-kodebegrunnelse): én ren felles vurdering av alle kjente kritiske mangler i mottatt delgrunnlag. Spor: CAP-1/lokal CAP-6; FR-3/FR-4 og prioritet 1 i FR-16/FR-17; NFR-1/S3; AD-1/AD-7/AD-8/AD-10; AT-5/AT-12 og tilgjengelig del av AT-18/AT-19. Final UXs recommendation/issue-message er senere konsumenter, ikke UI-arbeid her.

Gitt manglende, ugyldige, konfliktfylte eller ubekreftede kritiske verdier, når domain vurderer dem, skal alle kjente utløsere følge med felt, stabil kode, kjent årsak og konkret handling. Gitt L blank, Ymin blank og J ubekreftet 0 samtidig, når vurderingen kjøres, skal alle tre fremgå i stabil feltrekkefølge uten utfylling av verdier eller stopp etter første mangel. Blank og 0 forblir forskjellige tilstander. Samme valideringsautoritet fra 1.4/1.5 brukes; ingen nye kopier av tall-, kilde-, periode- eller kostnadsregler.

Gitt kontrollerte finansverdier og kjent manglende/ufullført rapportgrunnlag, når vurderingen kjøres, skal kjent årsak gi «Innhent mer informasjon», også ved F2-verdier. En minimal kontrakt kan formidle disse allerede kjente rapportmanglene; den avgjør ingen dokument-/TG3-gyldighet. Faktiske dokumentfeil/TG3 kobles inn i Epic 2. Finansnøkkeltall, økonomiske terskler og full screening med tre endelige utfall eies av Epic 3.

Gitt identisk mottatt grunnlag, når funksjonen gjentas, skal utfall, ordnede utløsere, full fast begrunnelse og anbefalingsbundet neste handling være eksakt identiske uten nett, KI, klokke, fil, miljø eller inputmutasjon. Frontend/backend/adapter kan dele kontraktdata uten egne regeltolkninger; backend skal fortsatt ikke gi screeninganbefaling.

Gitt tom mangelliste, når det mottatte delgrunnlaget er vurdert, skal utfallet uttrykkelig bety bare «ingen kjente mangler i mottatt delgrunnlag», uten anbefaling eller økonomisk godkjenning. Den tidlige felles mangelfunksjonen skal kunne gjenbrukes og utvides ved Epic 2/3 fremfor å erstattes av en parallell motor. Ingen UI-integrasjon, bekreftelsesflyt, ny analyse-DTO/providerklient eller Story 1.7-funksjon.

Lever egenverifisert in-review/review og stopp før 1.7. Ingen integrerte reviewlag/done/commit fra implementeringsagenten; hovedagenten lager brukerbestilt lokal fasecommit etter retur av skriveansvar. Låste produktkilder endres ikke.

</frozen-after-approval>

## Implementation Notes

- Undersøkt før spec: ren baseline ovenfor på main, Story 1.4/1.5 done og 1.6/1.7 backlog. Direkte lest 1.6 AC/testkrav og nabostorygrenser/Epic 3, sprintplan/-status, forrige done-spec/review, final UX/arkitektur/SPEC og kompanjonger, PRD-/brief-fasit, faglærertilbakemelding/oppfølging og eksisterende direkte PDFKit-uttrekk. Epic-cache brukes bare som supplement; dens historiske 1.1-bestilling gjelder ikke nå. Ingen Epic 1-port blokkerer arbeidet.
- Ingen intent-gap eller irreversibel handling. Én liten reversibel modul med delte runtime-skjemaer og tester gir oneshot-rute. Teknisk konkretisering er allerede autorisert innen den låste storyen. Ingen nye avhengigheter trengs.
- Kodemap/oppgaver: ny `src/contracts/screening.ts` gir minimal input-/utløser-/resultatkontrakt, avledet fra `FinancialBasisSchema`/`FinancialIssueSchema`. Ny `src/domain/screening.ts` eksponerer `evaluateKnownDeficiencies`, gjenbruker `validateFinancialBasis` og samler kode-/tekstdata. Ny `tests/unit/screening.test.ts` prøver alle fem AC mot uavhengige forventninger. Ingen eksisterende UI-/backend-/statefil endres.
- Mottatt finansgrunnlag er valgfritt fordi dette er en eksplisitt delgrunnlagsvurdering. Hvis det mottas, valideres hele grunnlaget av 1.4/1.5. Rapportmangler er bare eksplisitte `missing-report`/`incomplete-report` med ikke-tom kjent årsak, aldri fullføringsbevis. Finansutløsere følger P/L/D/J/Ymin og eksisterende autoritetsrekkefølge; rapportutløsere følger kode og årsak med deterministisk tekstsammenligning, uten miljøavhengig locale.
- Resultatet er diskriminert: kjente mangler gir bare prioritet 1/«Innhent mer informasjon» med utløsere og faste tekster; tomt delgrunnlag gir `no-known-deficiencies`, null anbefaling/prioritet/begrunnelse/neste handling. Ingen boolsk «godkjent» eller automatisk rapporttilstrekkelighet.
- Verifikasjon planlagt: alle samtidige mangler, hver blank/ubekreftet null, ugyldighet, konflikt, periode/år/kilde/kostnad, F2 med kjent rapportmangel, tomt delgrunnlag, eksakte fulltekster, stabil ordning og frosset input/gjentakelse/uavhengige resultatkopier. Deretter full Vitest, typecheck/lint/build og eksisterende 27 demo-/to dev-E2E. Ingen manuell UI-runde trengs uten UI-endring. Faktiske kommandoer/råutdata og AC-bevis lagres separat.
- Implementert og egenverifisert: 35 nye AC-tester, totalt 127 Vitest, typecheck/lint/build og 27 demo-/to dev-E2E består. Første typecheck fant en testfixture-typefeil, som er rettet; første E2E ble stoppet av sandboxens serversperre, og autorisert eskalert lokal kjøring bestod. Ingen UI-/produktfeil eller nytt åpent valg. [AC-bevis](story-1-6-verifikasjon.md), [råutdata](story-1-6-kontroller.txt) og [prosess/promptreferat](../process/arbeidsokter/2026-10-19-story-1-6.md) er lagret. 104/104 låste kilder er uendret. Integrert review/done/commit er avgrenset av brukerens siste implementeringsfase; sluttstatus in-review/review og 1.7 backlog. Ingen staging, commit eller push fra implementeringsagenten.
- Hovedagentens siste presisering autoriserte retting av åpenbart foreldet README-status fra 1.4/60/19 til egenverifisert 1.6/127/27+2. Bare faktisk leveranse-/teststatus, tilhørende spor og nåværende importansvar er oppdatert, uten omstrukturering eller ny funksjonalitet.

### Review Findings — 2026-10-19

Full BMAD-review av `88eb9b9..1c0534c`; fire kun-lesende lag kjørt
sekvensielt. Alle fem låste AC kontrollert mot faktisk kode. Brukerens
mini-sprintbestilling autoriserer rutinepatcher og lokal commit.

- [x] [Review][Patch] B4: Fjernet gjentatt identisk instruksjon i samlet neste handling, med alle D/J-utløsere bevart (`src/domain/screening.ts`). Ny uavhengig fullteksttest består.
- [x] [Review][Patch] B7: Kildekontrollen er reproducerbar mot Git-baseline i [reviewbeviset](story-1-6-review.md); 104/104 filer uendret.
- [x] [Review][Patch] B8: Presisert at målrettet implementeringskjøring mangler bevart råutdata; ny reviewkjøring gir selvstendig bevis: 36/36.

Rejected:

- B1 — low, avvist: Resultatskjemaet godtar blanke tekstfelt strukturelt, men ingen funksjonsgren produserer dem. Ingen mottaker av eksterne vurderingsresultater finnes. Nye semantiske vakter for en hypotetisk transport innføres ikke.
- B2 — low, avvist: Skjemaet validerer struktur og godtar vilkårlig tekst, mens `evaluateKnownDeficiencies` er eneste autoritet for faste tekster. Ingen eksisterende mottaker bruker vilkårlig parset tekst som domain-utfall. Nye semantiske vakter ville bygge en ekstra tekstautoritet for en hypotetisk transport.
- B3 — low, avvist: To identiske innkommende rapportobservasjoner beholdes som to utløsere. Ingen nåværende konsument eller AC krever sammenslåing, og ingen mangel skjules. Ny identitets-/duplikatpolicy ville utvide kontrakten; B4 fjerner bare gjentatt instruksjon.
- B5 — false: Ulik vurderingsdekning er bevisst utenfor dette resultatet. AC5 krever at tom mangelliste bare gjelder mottatt delgrunnlag, og `scope`/null anbefaling uttrykker dette. Resultatet påstår ingen finanskontroll ved utelatt grunnlag.
- B6 — low, avvist: Trimming er allerede en eksplisitt inputkontrakt, og ikke-tom årsak samt ordning er testet. En ny test som bare gjentar denne transformasjonen gir ikke selvstendig AC-bevis; ingen påvist feil eller verifikasjonsgap.

Review fullført uten åpne AC-avvik, decision-needed eller defer. Egen
sluttkjøring: 128/128 Vitest, typecheck/lint/build, 27/27 demo-E2E og 2/2
dev-E2E. Storyspec/sprintnøkkel done; Epic 1 in-progress og 1.7 backlog.
Se [full triage og AC-spor](story-1-6-review.md) og
[råkontroller](story-1-6-review-kontroller.txt). Frozen intent er bevart.
