---
title: 'Story 1.5 — Gjøre kilder, kostnadsinnhold og uløste konflikter kontrollerbare'
type: 'feature'
created: '2026-10-19'
status: 'in-review'
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
