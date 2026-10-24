---
title: 'Story 4.5 — Måle live-analyse og menneskelig kontroll'
type: 'chore'
created: '2026-10-24'
status: 'draft'
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

## Open Questions

- Mads er bekreftet primærbruker og deltaker. Hvilket faktisk miljø/nettleser brukes, er video-/tidsmetoden prøvd, og er Mads klar? Alternativer: bekreft oppsettet i skjemaet / utsett betalt start. Tider står blanke frem til faktisk gjennomføring.
- Er dagens konto, pris, tidligere forbruk, ukjente belastninger og reservasjon avstemt før betalt start? Alternativer: dokumenter preflight og start ett eksplisitt forsøk / stopp. Ingen tidligere S5-registreringer skal gjenbrukes, uansett mulig teknisk gjenbruk.

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
- [x] `.docs/planning-artifacts/r4-s5-mads-gjennomforing-2026-10-24.md`: delvis avklart person/utvalg, lenket fra fortsatt åpen port.
- [ ] `.docs/implementation-artifacts/story-4-5-mads-maaleskjema.md`: Mads bekrefter faktisk miljø/tidsmetode/startberedskap; root dokumenterer kontopreflight før første betalte start.
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

Kontroller registrering mot TT-1–TT-9 og avstem komplett forsøksliste, originaler, kvalitet og kostnader. Protokollfasit kan kontrolleres offline, men faktisk S5 krever menneskelig gjennomføring. Kun dokumentforberedelse foreligger; sprintstory forblir backlog, utkastet kan ikke settes ready-for-dev med åpne spørsmål.
