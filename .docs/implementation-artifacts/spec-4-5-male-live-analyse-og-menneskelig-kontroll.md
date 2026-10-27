---
title: 'Story 4.5 — Måle live-analyse og menneskelig kontroll'
type: 'chore'
created: '2026-10-24'
status: 'in-progress'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/.docs/planning-artifacts/epics.md'
  - '{project-root}/.docs/planning-artifacts/prds/prd-IBE160-2026-10-10/addendum.md'
  - '{project-root}/.docs/planning-artifacts/r1-live-ki-semester-v1.md'
---

<frozen-after-approval reason="Eksisterende Story 4.5 AC gjelder; gjennomføringsavklaringer gjenstår">

## Intent

Gjennomfør og dokumenter eksisterende S5-protokoll med faktisk live-analyse, menneskelig kontroll og manuell førstevurdering av samme caser. Story 4.5 AC1–AC6 og TT-1–TT-9 gjelder uendret. Dette utkastet er et planleggingscheckpoint; faktisk måling er ikke startet.

## Boundaries & Constraints

**Always:** 4.3/4.4 må være fullført før selvstendig 4.5-gjennomføring. Første nye F1-forsøk kan være 4.4s AC6-livekontroll med samtidige S5-punkter etter lukket R4-S5; 4.5 fullføres ikke før avhengigheten 4.4. Bevar R1s modell, sekvensielle forsøk, frister, ingen retry og samlede USD 20-budsjett; avstem også strengere faktisk kontogrense. Bruk samme tidsgrunnlag og tilstrekkelig presisjon ved Start analyse, synlig validert liste og fullført menneskelig kontroll/bekreftelse. Beregn separate medianer mot ≤300/600 s. Dokumenter alle forsøk, feil, mangler og kvalitet; S1–S4 gjelder samtidig. Aktiv promptlogg følger root-commit.

**Never:** Ingen appfunksjon for timer/evaluering/rapportering; ingen konstruert menneskelig tid, avklaring, referanse eller live-bevis. Ingen endring av fasit/originaluttrekk/låste krav. F3 med L=null har ikke gyldig S5-start. Demo, adaptertid og agentkontroll erstatter ikke faktisk S5. Story 5.4/5.5 berøres ikke.

</frozen-after-approval>

## Gjennomføringsstatus

Mads er bekreftet deltaker; miljø er hentet lokalt, metode er fastlagt og konto
bekreftet uendret 2026-10-24. R4-S5 er closed på dette grunnlaget. Detaljskjema
fylles av Codex; Mads får kun `story-4-5-f1-instruks.md`. Faktisk F1-live-
sluttkontroll/B2 og menneskelig måling gjenstår; 4.4-review/4.5-backlog består.
Ingen tidligere S5-registreringer skal gjenbrukes.

## Code Map

- `.docs/planning-artifacts/epics.md:1688`: opprinnelige AC, avhengigheter og arbeidsgrense.
- `.docs/planning-artifacts/prds/prd-IBE160-2026-10-10/addendum.md:102`: full S5-protokoll og TT-fasit; krav, ikke målte resultater.
- `.docs/specs/spec-IBE160/SPEC.md`, `grensekontrakter.md` og final `ARCHITECTURE-SPINE.md`: CAP-2/3/4/8, kontroll-/resultatkontrakt og AD-5/6/10.
- `src/frontend/state/report.ts`, `src/frontend/screens/ReportAnalysis.tsx`: eksisterende liste-/bekreftelseshendelser gjenbrukes uten ny telemetri.
- `.docs/implementation-artifacts/story-4-4/`: originale live-/kontrollbevis bevares; tidsstempler er ikke en komplett S5-måling.
- `.docs/implementation-artifacts/story-4-4-gjenopptatt-review-2026-10-24.md`: historisk AC6-status; B1 er siden rettet og uavhengig reviewbestått, B2 gjenstår. Se `story-4-4-b1-uavhengig-review-2026-10-24.md`.
- `.docs/implementation-artifacts/story-4-5-protokollcheckpoint-2026-10-24.md`: konkret forsøks-/registreringsplan og avgrenset protokollkontroll.

## Tasks & Acceptance

**Execution:**
- [x] Protokollcheckpointet: undersøk gjenbruk, spor TT-fasit og dokumenter mangler uten å starte måling.
- [x] `.docs/planning-artifacts/r4-s5-mads-gjennomforing-2026-10-24.md`: avklart person/miljø/metode og konto etter forenklet overlevering, lenket fra lukket R4-S5.
- [x] `.docs/implementation-artifacts/story-4-5-f1-preflight-2026-10-24.md`: Codex fyller teknisk miljø/pris/budsjett og dokumenterer Mads sin kontobekreftelse.
- [x] `.docs/implementation-artifacts/story-4-5-f1-instruks.md`: kort menneskelig instruks; detaljskjemaet beholdes internt.
- [ ] Nye forsøksbevis under `.docs/implementation-artifacts/story-4-5/`: registrer hvert planlagt forsøk og faktisk hendelsesgrunnlag; bevar feil og originaluttrekk.
- [ ] `.docs/implementation-artifacts/story-4-5-verifikasjon.md`: sammenstill faktiske tider, separate medianer, manuell referanse, S1–S5-status og AC1–AC6 med versjonsspor.
- [ ] Uavhengig BMAD-review; rett verifiserte funn og sett done bare hvis samtlige AC består.

**Acceptance Criteria:**

Given forhåndsutvalg og gyldig start, when faktisk gjennomføring, then registreres t_start/t_liste/t_bekreftet etter AC1 og varighetene avgrenses som AC2. Given menneskelig originalkontroll, when liste bekreftes, then består TG3-/usikkerhetsvern etter AC3. Given alle forsøk, when sammenstilling, then bevares feil/mangler og live/demo-skille etter AC4. Given gyldige observasjoner, when separate medianer beregnes, then brukes eksakte grenser og partallsregel etter AC5. Given samme-case manuell referanse, when S5 rapporteres, then dokumenteres faktiske aktiviteter/resultater etter AC6; ingen observasjoner betyr ikke verifisert.

## Implementation Notes

2026-10-24, oppdatert etter brukeravklaring: Mads er deltaker; konkret utvalg F1/F2/F4, ett planlagt nytt forsøk per case. Ingen tidligere S5-bevis gjenbrukes. Første F1 planlegges som 4.4-live med samtidige S5-punkter, ingen automatisk start. B1 er rettet/reviewbestått; B2 gjenstår.

2026-10-24: Ingen produktkode eller betalt forsøk er endret/kjørt. Footprint er draft-spec, protokollcheckpoint, Mads sitt måleskjema, delvis R4-S5-logg og én portlenke i sprintstatus. Faktiske nye leverandørforsøk vil ha irreversible kostnader og må vente på portene. Eksisterende Epic 4-konteksts gamle mini-sprintgrense er historisk; dagens bestilling gjelder avslutning, men opphever ikke AC eller R4-S5.

## Spec Change Log

## Review Triage Log

2026-10-24: [Uavhengig sekvensiell BMAD-review av forberedelsen](story-4-5-uavhengig-review-2026-10-24.md).
Ett konkret dokumentfunn rettet: opptaksberedskap må være klar før Start
analyse, mens faktiske nye svar/kostnader først registreres under/etter
forsøket. To utilsiktede `+-`-prefikser i Open Questions er også rettet.
Forberedelsen består denne avgrensede reviewen; det er ingen godkjenning av
samtlige Story 4.5-AC. AC1–AC6 krever fortsatt faktiske bevis; 0 nye målinger,
R4-S5 fortsatt open og sprintstory fortsatt backlog. Neste checkpoint er Mads'
faktiske oppsett/metodebekreftelse, uten betalt start.

## Verification

Kontroller registrering mot TT-1–TT-9 og avstem komplett forsøksliste, originaler, kvalitet og kostnader. Protokollfasit kan kontrolleres offline, men faktisk S5 krever menneskelig gjennomføring. Dokumenter og separat manuell bevishelper er klargjort; sprintstory forblir backlog/draft fordi 4.4s faktiske F1-sluttbevis og menneskelige S5-målinger gjenstår.

## Forenkling 2026-10-24

Ny brukerbestilling erstatter den omfattende manuelle utfyllingen med kort operativ instruks. Separat lokal manuell helper oppfanger originale tekniske bevis; den klikker aldri analyse eller menneskekontroll. Teknisk preflight og helperreview dokumenteres separat. Faktiske S5-AC gjenstår.

Nyere preflightstatus: R4-S5 er closed på dokumentert person/miljø/metode og kontobekreftelse. Helperreview og 8 offlineprøver består. Den lokale siden er klargjort for Mads sitt senere klikk; kun GET er brukt av root, 0 analyse-POST/leverandørkall. Dette erstatter den eldre reviewloggens daværende open-status, uten å endre historisk review eller utlede faktisk S5.

## Eksplisitt stopp 2026-10-24

Mads har stoppet Story 4.5 før tidsmåling. Serveren er stoppet og gammel arming er ugyldiggjort. R4-S5 står igjen open/suspended. [Dokumentsporingen](story-4-5-f1-dokumentsporing-2026-10-24.md) bekrefter samme F1-PDF i historisk live-input og dagens fil: 1 TG2/0 TG3. S2 4/4 TG2 og 1/1 TG3 gjelder samlet F1–F4. Ingen fixture/fasit endres. S5-caseegnethet og begrenset konklusjon må avklares før noe gjenopptas; ingen ny test/måling autorisert av denne kontrollen.

## Gjeldende checkpoint 2026-10-27 — erstatter tidligere F1-plan

Mads har stoppet F1-målingen og godkjent separat primært S5-case S5-B1-v1.
Benchmarken er opprettet og fryst før første produksjonsuttrekk; se
[fryst grunnlag](story-4-5-s5-b1-v1-frys.md) og
[gjeldende åpen R4-S5](../planning-artifacts/r4-s5-benchmark-s5-b1-v1-2026-10-27.md).
Tidligere gjennomføringsstatus og avkryssede F1-forberedelser over er historikk,
ikke gyldig arming eller lukket port for benchmarken. F1–F4 og S2 er urørt.
4.4 står fortsatt review med AC6/B2-avhengighet åpen; 4.5 er backlog/draft.
Ingen faktiske S5-observasjoner, live-kall eller mennesketider er lagt til.
Benchmarkdeloppgavens done gjelder bare forfattet og verifisert materiale.
Eksisterende låste Story-AC og S5-definisjoner består. Før gjennomføring må
ny casebundet preflight, bevisoppsamling og kort instruks klargjøres.

## Gjeldende checkpoint 2026-10-27 — 4.4done og benchmarkmiljø

4.4 er nå done etter originale nye F1/F2-sluttbevis, uavhengig review og full
regresjon. 4.5 er in-progress bare for teknisk klargjøring; ikke done og
ingen faktisk S5-observasjon finnes. Ny casebundet helper har uavhengig
review og53/53 root-offlineprøver. Alle7frystebenchmarkfiler er uendret.
R4-S5 er closed på avklartperson/miljø/metode og fersk kontoavstemming,
ikke utførtmåling. Se [gjeldende R4](../planning-artifacts/r4-s5-benchmark-gjennomforing-2026-10-27.md),
[kortinstruks](story-4-5-s5-b1-v1-instruks.md) og
[internregistrering](story-4-5-s5-b1-v1-registrering.md).
Mads må selv gjøre manuell referanse før AI, så faktisk analyse/kildekontroll.
Faktiske tider, aktiviteter, feil/kvalitet, oppsummering og uavhengig
Story4.5-review gjenstår. Ingenbenchmark-KI/mennesketider er opprettet.
