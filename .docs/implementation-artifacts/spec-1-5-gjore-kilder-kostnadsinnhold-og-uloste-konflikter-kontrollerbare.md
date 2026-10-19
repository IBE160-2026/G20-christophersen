---
title: 'Story 1.5 — Gjøre kilder, kostnadsinnhold og uløste konflikter kontrollerbare'
type: 'feature'
created: '2026-10-19'
status: 'done'
route: 'oneshot'
story_key: '1-5-gjøre-kilder-kostnadsinnhold-og-uløste-konflikter-kontroller'
baseline_commit: '04efbe3ecd1c82d0e55d2a4f0b590144dd42dd69'
---

<frozen-after-approval reason="Brukerens eksplisitte implementeringsbestilling av godkjent Story 1.5">

## Intent

Implementer kun [Story 1.5 AC1–AC5](../planning-artifacts/epics.md#story-15-gjøre-kilder-kostnadsinnhold-og-uløste-konflikter-kontrollerbare): kontrollerbart opphav for P/L/D/J/Ymin, D-/J-innhold og uløste kildeverdier på Tallgrunnlag. Spor: CAP-1, FR-2/relevant FR-3/FR-4, NFR-1/NFR-2, S3/S4, AD-1/AD-2/AD-7/AD-10, UX source-note/cost-breakdown og BT-14/AT-12.

Gitt de fem registrerte verdiene, når brukeren oppgir kilde eller egen forutsetning, skal opphavet være synlig og knyttet til det aktuelle grunnlaget. Leie angis eksplisitt som forventet eller faktisk oppgitt; faktisk oppgitt leie krever kilde og fremstilles fortsatt som brukeroppgitt uten ekstern verifisering. Gitt ulike kildeverdier for ett felt, når disse registreres, skal begge opphav/verdier være synlige og verdien utilstrekkelig uten automatisk prioritering. Avklaring krever at brukeren selv retter gjeldende verdi/kilde og fjerner den uløste motstriden.

Gitt kostnadsinnhold, når brukeren registrerer navngitte poster og eventuell renter-/avdragsdel, skal samlet beløp deles eksakt i D og J. 120000 med 20000 gjeldsbetjening bidrar D=100000/J=20000. En post som eksplisitt inngår i en annen, vises som inkludert og summeres ikke på nytt. Andre registrerte D-/J-beløp endres ikke. Oppdelingen beskriver innhold i totalene, aldri et tillegg/fratrekk utover manuelt registrerte totaler. Delvis innhold kan bevares og merkes som kontrollgrunnlag; det innføres ikke krav om full detaljering eller likhet med totalene. Kjent motsigelse (oppgitt bidrag større enn den registrerte totalen, umulig gjeldsdel eller inkludering) skal kunne rettes før gyldig bruk.

Gitt korrigert kilde/kostnadsinnhold, når reduceren oppdaterer, skal metadata følge det faktiske finansgrunnlaget og samme felles domain-validering. Råinput, periode, år og øvrige poster bevares; registrering bekrefter ikke. Rene kontrakter/domain eier vurdering og eksakt big.js-aritmetikk, React viser resultatdata uten egen regelmotor. Eksisterende 1.4-validering gjenbrukes. Ingen automatisk uthenting/estimering, låneplan, ny kostnadsmodell, ny produkt-/arkitekturbeslutning, 1.6-anbefaling, 1.7-bekreftelsesflyt eller Epic 3-beregning.

Autoritet er storyens fem AC/testkrav, final DESIGN/EXPERIENCE, ARCHITECTURE-SPINE, SPEC med adopterte kompanjonger, epics, sprintplan/-status og AGENTS.mds kurs-/faglærerkilder. Låste dokumenter endres ikke. Lever in-review/review etter egne tester; separat review er brukerens fase 3.

</frozen-after-approval>

## Implementation Notes

- Undersøkelse: ren baseline ovenfor; 1.3/1.4 done, Epic 1 in-progress, ingen Epic 1-port. Direkte lest story/1.6/1.7, final UX/arkitektur/SPEC, PRD FR-2 og BT-14/AT-12, brief-addendum, sprintplan/status, forrige done spec/review, sensorveiledningens direkte PDFKit-uttrekk og faglærerens tilbakemelding/oppfølging. Epic-cache er supplement, dens gamle 1.1-bestilling gjelder ikke nå.
- Ingen intent-gaps eller irreversible handlinger. Teknisk felt-/radmekanisme konkretiseres av implementering: EXPERIENCE cost-breakdown sier uttrykkelig at mekanismen ikke er ytterligere produktkrav; AD-Deferred og grensekontrakten legger schemas til implementering. FR-2 krever at inkluderte poster skilles uten dobbelttelling, men ingen fullstendighets-/likhetsregel. Derfor er oppgitt kostnadsinnhold et mulig delgrunnlag, med kontroll av kjent motstrid. Ingen ny økonomisk godkjenning fra tom oppdeling.
- Kodemap/footprint: ny `src/contracts/financial-basis.ts` beskriver eksisterende finansinput med kilder/konflikter/kostnadsinnhold og avledet kontrollresultat; ny `src/domain/financial-basis.ts` gjenbruker `validation.ts`, som eksponerer samme desimalparser for kostnadsverdier. `frontend/state/session.ts` holder metadata i aktiv økt. `FinancialInput.tsx` og avgrenset ny kontrollkomponent viser opphav og oppdeling etter eksisterende UX/tokens. Vitest og bygget-app-E2E dekker FR-2-fasit, overlapp, renter utenfor D, konflikt, retting og bevart state. Ingen nye avhengigheter.
- Ruten er oneshot for én reversibel, sammenhengende kontrollflate med kjente regler. Brukerens godkjente story/bestilling dekker teknisk konkretisering. Brukerens separate implementerings-/reviewfaser overstyrer integrert review/done/commit: alle reviewlag utsettes til fase 3, og hovedagenten committer etter eksplisitt retur av skriveansvaret.

- Implementert og egenverifisert: 83 Vitest, typecheck/lint/build og 24 demo-/to dev-E2E består. Fem opphav/leiegrunnlag og FR-2-oppdeling/overlapp er inspisert i bygget app. En reell zoom/fokusfeil fra lang ny knapp er rettet; tester er oppdatert for nye kildefelt. [AC-/testbevis](story-1-5-verifikasjon.md), [råutdata](story-1-5-kontroller.txt) og [prosess/prompt](../process/arbeidsokter/2026-10-19-story-1-5.md) er lagret. Sluttstatus in-review/review; ingen kjent blocker, staging, commit eller push fra implementeringsagenten.

### Review Findings

Uavhengig fase 3, 2026-10-19: fire konfigurerte reviewlag er fullført. Individuell triage av alle 14 forslag og egne AC-/testbevis lagres i `story-1-5-review.md`. Ingen decision-needed eller defer. Brukerens mini-sprint autoriserer samtlige rutinepatcher innen 1.5 uten ny godkjenning.

- [x] [Review][Patch] B1/E1: Kontroller samlet kjent innhold i samme overordnede kostnadspost uten fullstendighetskrav. [src/domain/financial-basis.ts:63]
- [x] [Review][Patch] B2: Vurder inkluderingskjeder uavhengig av radrekkefølge. [src/domain/financial-basis.ts:69]
- [x] [Review][Patch] B3/A1: Kontroller kjent J-bidrag selv om D-beløpet er ugyldig. [src/domain/financial-basis.ts:91]
- [x] [Review][Patch] B4: Behold kjent overskridelse når en annen rad er uferdig. [src/domain/financial-basis.ts:81]
- [x] [Review][Patch] B5/A2: Knytt leverte kilde-/kostnadsfeil semantisk til berørte kontroller. [src/frontend/screens/FinancialBasisInput.tsx:58]
- [x] [Review][Patch] B7: Behold entydig radkontekst når kostnadsposter har samme navn. [src/frontend/screens/FinancialBasisInput.tsx:84]
- [x] [Review][Patch] B8/V1: Test faktisk leie, manglende kilde og retting i bygget app. [tests/e2e/financial-input.spec.ts:114]
- [x] [Review][Patch] B9: Test faktisk Tab-rekkefølge gjennom dynamiske fjernhandlinger og fokusretur. [tests/e2e/financial-input.spec.ts:201]
- [x] [Review][Patch] E2: Ombryt lange navn også i kostnadsfeil. [src/frontend/styles.css:243]

#### Rejected

- B6 — **false som manglende 1.5-krav**: Bekreftelsesforsøk og komplett feilvisningsflyt leveres uttrykkelig i Story 1.7. Story 1.5 vurderer og viser registrert kilde-/kostnadsinnhold, men har ingen bekreftelseshandling. Å kreve denne flyten nå overskrider brukerens avgrensning; ingen ny timing-/bekreftelsesmekanisme bygges.

### Review fullført

Story 1.5 er **done** etter gjenopptatt fase 3. Alle fem AC er kontrollert mot faktisk kode. Alle 14 individuelle forslag er triagert: 13 lukket i ni patchgrupper, B6 avvist, ingen defer/decision-needed. [Reviewrapport](story-1-5-review.md), [egne råkontroller](story-1-5-review-kontroller.txt) og [prosesspor](../process/arbeidsokter/2026-10-19-story-1-5-review.md). Egen sluttkjøring: 92 Vitest, lint, typecheck/build, 27 demo-E2E og to dev-E2E består. 104/104 låste kilder er uendret. Ingen nye beslutninger, staging, commit eller push fra reviewer; hovedagenten får skriveansvaret tilbake før fasecommit.
