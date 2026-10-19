---
title: 'Story 1.4 — Validere tall og normalisere kjent månedsgrunnlag eksakt'
type: 'feature'
created: '2026-10-19'
status: 'in-review'
route: 'oneshot'
story_key: '1-4-validere-tall-og-normalisere-kjent-månedsgrunnlag-eksakt'
baseline_commit: '13d111237f3b7609786e054455fd5516ef9218d2'
---

<frozen-after-approval reason="Brukerens eksplisitte bestilling av kun godkjent Story 1.4; gjenopptatt 2026-10-19">

## Intent

Implementer kun [Story 1.4 AC1–AC5](../planning-artifacts/epics.md#story-14-validere-tall-og-normalisere-kjent-månedsgrunnlag-eksakt): én ren, delt autoritet for numerisk gyldighet og eksakt årsnormalisering. Registrert verdi, bekreftelse, periode og år skal bevares sammen med kanonisk verdi, omregningsfaktor og anvendt årsverdi, slik at senere kontroll og beregning bruker etterprøvbart grunnlag.

Gitt registrert P/L/D/J/Ymin, når valideringen kjøres, skal P være >0, de øvrige ≥0, ikke-numerisk input ugyldig og blank en egen mangel. Numerisk 0 bevares; ubekreftet 0 krever eksplisitt bekreftelse, og P=0 blir aldri gyldig. Numerisk gyldighet og bekreftelse skilles slik at normalisering kan kontrolleres før senere bekreftelse; ubekreftede verdier er utilstrekkelige for bruk.

Gitt kjente månedsbeløp for samme år, når L/D/J normaliseres, skal hver verdi ganges eksakt med 12. L=120000, D=20000, J=50000 gir 1440000, 240000, 600000. Årsregistrering har faktor 1; P/Ymin annualiseres ikke. Gitt ukjent/ustøttet periode, manglende/ugyldig år eller ulike år, skal berørt grunnlag være utilstrekkelig med konkret årsak og felt, uten valgt standardår eller gjettet periode. Gitt samme input gjentatte ganger, skal resultat/årsaker være identiske, med råregistreringen bevart uten mutasjon eller kumulativ multiplikasjon.

Bruk [final arkitektur](../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md) AD-1/AD-7/AD-10: contracts eier delte schemas/typer, domain eier reglene, big.js er eksakt 7.0.1 og ingen Number/parseFloat går foran desimalaritmetikken. [SPEC](../specs/spec-IBE160/SPEC.md) med alle adopterte kompanjonger, [epics](../planning-artifacts/epics.md), [final DESIGN/EXPERIENCE](../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md), [sprintplan](sprint-plan.md) og [sprintstatus](sprint-status.yaml) er autoritative. Spor: CAP-1; FR-1/FR-3 og normaliseringsgrunnlaget til FR-12/FR-14; NFR-1; S3 og grunnlag for S1/S4; UX-DR5/6; BT-7/BT-15/BT-16.

Ingen UI-endring, nye bekreftelseshandlinger, kilde-/kostnadskontroll, mangelbasert anbefaling, finansnøkkeltall eller terskel bygges. Disse tilhører 1.5–1.7 og Epic 3. Ingen låst plan endres. Lever som in-review/review, uten code review eller done i denne mini-sprinten, etter brukerens fasebestilling.

</frozen-after-approval>

## Implementation Notes

- Readiness kontrollert: 1.3 er done, arbeidsområdet var rent på full baseline ovenfor, Epic 1 er in-progress, og R1–R4 har ingen port før 1.4. Direkte relevante kilder er lest, inkludert PRD FR-1–FR-4, BT-fasit, final UX/arkitektur/SPEC, foregående spec/review, faglærerens tilbakemelding/oppfølging og sensorveiledningens eksisterende direkte PDFKit-tekstuttrekk. Epic-cache er supplement; dens historiske 1.1-bestilling er ikke dagens scope.
- Intent gaps: ingen. Irreversible handlinger: ingen. Footprint: `src/contracts/financial-input.ts` gjenbrukes med et separat schema som tillater mottatt bekreftelse/ustøttet periodestreng, mens rå UI-schema fortsatt krever false og støttede registreringsvalg. `src/contracts/financial-validation.ts` eier bare nødvendige resultattyper. `src/domain/validation.ts` blir ren autoritet. `tests/unit/financial-validation.test.ts`, README/status og egne bevis dokumenterer leveransen. App/reducer/server endres ikke.
- Liten, reversibel modulstory velger oneshot-rute etter undersøkelse. Den eksplisitte implementeringsbestillingen dekker denne tekniske detaljeringen; ingen nye beslutninger eller spørsmål. Spesifikasjonen består ready-for-development-standarden; oneshot-ruten oppretter in-progress direkte etter denne kontrollen. Brukerens avgrensning overstyrer workflowens integrerte review/done/commit; hovedagenten committer etter overlevering.
- Teknisk inputdetalj: desimalpunktum og norsk desimalkomma aksepteres, eventuelt korrekt grupperte mellomrom/NBSP/smale NBSP i heltallsdelen. Tegn og ytre whitespace normaliseres uten Number; valutatekst, feil gruppering og flertydige skilletegn er ugyldig. Råstreng bevares. År er et eksplisitt positivt heltall som tekst, uten antatt nåtid eller ny årstallsgrense; ytre whitespace og innledende nuller normaliseres kun for sammenlikning. Ulike oppgitte år knyttes til alle involverte felt uten å velge referanseår.
- Resultatet skiller numerisk manglende/ugyldig/gyldig fra tilstrekkelighet. Eksakt normalisering beholdes også som kontrollgrunnlag når bekreftelse eller felles år mangler; status og konkrete årsaker gjør den utilstrekkelig som regelinput. Ingen kilde-/kostnadsgyldighet påstås. Registrert grunnlag kopieres slik at også senere endring av resultatet ikke muterer input.
- big.js offisielle [API v7.0.x](https://mikemcl.github.io/big.js/) er kontrollert: separat strict-konstruktør, immutable times og toFixed uten angitt desimalantall gir eksakt normal notasjon. Tilleggstypene @types/big.js 7.0.0 er pinnet som utviklingsavhengighet; installasjonskontroll ga 0 sårbarheter. Samme fsevents-scriptvarsel som tidligere miljø, ingen policyendring.
- Verifikasjon: uavhengig Vitest-fasit for alle fem AC, alle felt/blank/negative/ikke-numeriske/bekreftet og ubekreftet null, måned/år/blanding/ulike år/ukjent periode, store og små presise desimaler, gjentakelse og frysing. Kjør typecheck, lint, build og eksisterende 19 demo-/2 dev-E2E; isolert npm ci etter ny lockfil. UI er uendret og krever ingen ny manuell UI-flyt. Faktiske utdata/AC-bevis lagres separat.
- Implementert og egenverifisert 2026-10-19: 51 nye domenetester og ni eksisterende tilstandstester består. Typecheck/lint/build og 19 demo-/to dev-E2E består både i arbeidsområdet og fra isolert ren npm ci av den nye lockfilen. Første typecheck fant ubrukt testimport og unionindeksert testtilordning; begge testtypefeil er rettet uten produksjonsendring. [AC-bevis og avgrensning](story-1-4-verifikasjon.md), [faktiske råutdata](story-1-4-kontroller.txt) og [prosess/prompt](../process/arbeidsokter/2026-10-19-story-1-4.md) er lagret.
- Sluttstatus er in-review/review. Ingen uavhengig code review er kjørt og ingen done-påstand gis. Kilde-/kostnadskontroll, samlet mangelbegrunnelse og UI-bekreftelse er fortsatt senere stories. Ingen åpent produkt-/arkitekturspørsmål er funnet. Repoets bygde demo er gjenopprettet på http://127.0.0.1:3000 (exec-session 6174). Ingen commit/staging/push fra implementeringsagenten.
