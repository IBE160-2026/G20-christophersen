---
title: 'Story 3.4 — Gi én komplett regelbasert anbefaling med fast begrunnelse'
type: 'feature'
created: '2026-10-21'
status: 'done'
route: 'oneshot'
story_key: '3-4-gi-én-komplett-regelbasert-anbefaling-med-fast-begrunnelse'
baseline_commit: '4cd8532ae00fec30093a5ade7390d13920edaeae'
---

<frozen-after-approval reason="Brukerens uttrykkelige sekvensielle mini-sprint: Story 3.4 implementeres etter ferdig review/done av 3.3 og overleveres deretter til ny uavhengig reviewer">

## Intent

Lever bare [Story 3.4 AC1–AC6](../planning-artifacts/epics.md#story-34-gi-én-komplett-regelbasert-anbefaling-med-fast-begrunnelse): én ren domain-screening som avgjør anbefaling, prioritet, alle utløsere på avgjørende nivå, fast begrunnelse og konkret neste handling. Autoritet er Epic 3-kontekst, SPEC CAP-4/5/6 og Finans og screening i grensekontrakten, FR-5/13/16/17/18, AD-1/7/8/10, final UX recommendation/basis-detail, sprintplan/status og låst PRD-/brief-addendum. Ingen krav endres.

Gitt minst én kritisk mangel, ugyldighet, uløst konflikt, ubekreftelse, rapport-/analysefeil, kritisk usikkerhet eller uavklart alvorlig TG3, når screeningen kjøres, skal nøyaktig én anbefaling være Innhent mer informasjon etter prioritet 1. Alle kjente utløsere skal med i stabil orden, med berørt felt/funn/dokument og nødvendig retting, innhenting, bekreftelse eller avklaring. Samme grunnlag skal ha samme mangelbetydning og handling som lokale flater fra felles domain-autoritet. Ukjent årsak skal ikke gjettes.

Gitt tilstrekkelig kritisk grunnlag og nettoyield under Ymin eller negativ kontantstrøm, når screeningen kjøres, skal anbefalingen være Forkast etter prioritet 2. Begge brudd skal med når begge gjelder, med aktuelle eksakte verdier og grenser. Et bestått vilkår opphever ikke det andre. Gitt tilstrekkelig kritisk grunnlag, nettoyield ≥ Ymin og kontantstrøm ≥ 0, når screeningen kjøres, skal anbefalingen være Gå videre etter prioritet 3 med oppfylte økonomiske krav, tilstrekkelig teknisk screeninggrunnlag og neste handling grundigere vurdering/befaring. Dette er ingen kjøpsanbefaling eller teknisk godkjenning.

Gitt svake økonomiske delresultater samtidig med kritisk mangel eller uavklart TG3, når screeningen kjøres, skal bare prioritet 1 avgjøre. Gyldige nøkkeltall kan fortsatt følge som delgrunnlag. Gitt gyldig forholdsbundet TG3-avklaring, skal funn, grad, kilde og brukerens status/begrunnelse/grunnlag bevares; økonomien avgjør først når øvrig grunnlag er tilstrekkelig. Avklart innebærer ingen automatisk forkastelse eller godkjenning.

Gitt identisk input, rapportgrunnlag, kontroll-/TG3-status og faste regler, når screeningen gjentas, skal anbefaling, prioritet, ordnede utløsere, full fast begrunnelse og anbefalingsbundet neste handling være identiske. Ingen KI, nettverk, formatering, avrunding eller S1-margin deltar i avgjørelsen. Eksisterende felles mangel-/TG3-validering og eksakte finans-/terskelfunksjoner gjenbrukes faktisk.

Test alle logiske utfall i AT-1–15 og AT-18–20, relevante BT-3–6/17/18, alle sju FR-5-eksempler og briefets regelvarianter med uavhengig fasit. AT-18 skal gi alle fire kjente forhold, AT-4 begge økonomiske brudd, AT-20 fortsatt prioritet 1. Prøv tom completed/bekreftet liste mot failed/ubekreftet/usikker, gyldig/ugyldig TG3-binding, eksakte grenser og bekreftet null. AT-16s endringsflyt og AT-17s UI tilhører senere stories. Ingen UI, snapshot/revisjonsbinding, live, nye formler eller 3.5+. Stopp ved ny produkt-/arkitekturbeslutning. Kjør relevante tester/typecheck/lint og lokal implementeringscommit. Stopp ved in-review/review før ny uavhengig BMAD-review; ingen integrert review/done eller push.

</frozen-after-approval>

## Implementation Notes

- Readiness: 3.3 er done etter uavhengig review; alle 3.4-avhengigheter er done. Step01/02 er gjennomført på ny. main/baseline er tilsiktet; eneste annen arbeidsfil er orkestratorens autoriserte auditlogg, som ikke stages. Ingen intensjonsgap, irreversible handlinger eller nye produkt-/arkitekturvalg; liten reversibel modulstory følger oneshot.
- Code Map/oppgaver: `src/domain/screening.ts` beholder `evaluateKnownDeficiencies` og legger til `evaluateScreening`, som komponerer `assessFindingList`, felles mangel-/TG3-validering, `calculateFinancialMetrics` og begge terskelfunksjoner. `src/contracts/screening.ts` eier delt fullscreeninginput/-utfall med eksisterende FindingListBasis, finans og eksakte terskeldata. `tests/unit/complete-screening.test.ts` tester AC/fasit, samme lokale autoritet, determinisme og inputisolasjon. Modul-README, verifikasjon/rålogg/arbeidsøkt og sprintstatus oppdateres. App/state/backend/presentasjon og låste planer endres ikke.
- Design: full screening krever både hele finansgrunnlaget og eksisterende rent rapport-/kontrollgrunnlag; et tomt resultat fra bare kjente delmangler brukes aldri som bevis for fullføring. Rene grunnlagsdata og beregninger følger utfallet for senere konsumenter. Økonomiske utløsere har faste koder, eksakt metrikk/krav og sammenlikning fra 3.2; begrunnelsestekst er fast og velger ingen visningspresisjon.
- Kurs-/feedback-kontroll: faktisk faglærerfeedback og sidehenvist sensoruttrekk er lest; orkestratoren har kontrollert alle sju PDF-sider direkte i denne økten. Avgrenset scope, plan–kode–test-spor, lagret arbeidsøkt og meningsfulle uavhengige fasittester følges uten å innføre nye kurskrav.
- Implementert: `evaluateScreening` bruker faktisk den eksisterende autoritetskjeden og returnerer bare utløsere fra avgjørende nivå. Eksakte metrikker/terskler og en isolert grunnlagskopi følger alle tre utfall; `partialBasis` er sann bare ved prioritet 1. Ingen revisjonsstatus, snapshotlivsløp, UI, backend- eller presentasjonskobling er innført.
- Egenverifikasjon: **66 nye fullscreeningtester**, **461/461 målrettede Vitest-prøver** over ti testfiler samt typecheck/lint/diffkontroll bestått. Første kjøring hadde 57/59 bestått; to testforventninger kalte den eksisterende negativkoden `negative-value` i stedet for `must-be-nonnegative`. Dette var en testfeil som er rettet mot den felles autoriteten uten produksjonsendring. [AC-/testbevis](story-3-4-verifikasjon.md), [rålogg](story-3-4-kontroller.txt) og [arbeidsøkt](../process/arbeidsokter/2026-10-21-story-3-4.md).
- Checkpoint: **in-review/review**. Ingen integrert review/done; en ny uavhengig BMAD-reviewagent overtar etter lokal implementeringscommit, som uttrykkelig bestilt. Sluttregresjon/E2E utføres av orkestratoren etter review. Ingen ny produkt-/arkitekturbeslutning, portendring eller push; 3.5–3.9 forblir backlog.


## Review Findings

Full uavhengig BMAD-review med fire sekvensielle context-free lag er fullført.
Alle ni kandidater er triagert individuelt i [reviewrapporten](story-3-4-review.md).
Ingen ny produkt-/arkitekturbeslutning eller autoritativ kravendring.

- [x] [Review][Patch] G1: Aktivt kjent TG3 kan ikke skjules av manglende/motstridende separat grunnlag. Felles `assessFindingList` bruker eksisterende bindingslikhet og gir samme navngitte avklaringsmangel til lokal og full screening. Failed delresultat bevarer kjent TG3 som egen utløser.
- [x] [Review][Patch] G2: Ekte reportReducer-/TG3-selektor prøves fram til full screening med avklart TG3, brukt TG2-korrigering og avvist funn. Originalen bevares; ingen UI-/endringsflyt eller revisjonsbinding regnes levert.

### Rejected

- B2 — low: completed/error-konflikt finnes ikke i faktisk reducerflyt; ingen ny gren for håndlaget tilstand.
- B3 — low: rejection/revision oppdateres atomisk og senere handlinger sperres; ingen nåbar gammel rejection.
- B4 — false: eksakte aktuelle verdier/grenser ligger i triggerens ekte terskelobjekt; synlig avrundingsforklaring tilhører senere presentasjon.
- B5 — low: faktisk produsent binder økonomikode til samme terskelstatus; ingen konsument konstruerer motstridende utdata.
- B6 — low: produsenten returnerer alltid minst ett brudd eller to beståtte vilkår og teknisk grunnlag; ingen feil tomliste er demonstrert.
- B7 — low: ingen målt ytelsesfeil; ombygging av finans-/terskel-API-er er unødvendig kompleksitet.

Gjeldende checkpoint: **done** etter reviewerens fullstendige sekvensielle
sluttregresjon på endelig kode: **853/853 Vitest**, **89/89 bygget-app**,
**3/3 dev-E2E**, typecheck/lint/build og diffkontroll bestått. Seks reviewerprøver
ble lagt til; tre negative prøver var røde før produksjonsretting. Ingen kode-
eller testendring etter grønn sluttregresjon. [Rålogger og AC-bevis](story-3-4-review.md).
3.3 forblir done, Epic 3 in-progress, 3.5+ backlog. Ingen push.
