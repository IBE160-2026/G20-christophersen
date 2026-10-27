---
title: 'Kontrollert sluttføring — UX og leveringsberedskap'
type: 'chore'
created: '2026-10-27'
status: 'in-progress'
route: 'dispatch'
baseline_commit: '2dadc800daafa8b1640ccd08bf91a302fbc9cfb0'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="Brukerens uttrykkelige femfasebestilling; ingen ny produktbeslutning">

## Intent

**Problem:** Eksisterende app trenger en kontrollert visuell sluttføring og oppdatert leveringsgrunnlag. Ekstern S6 mangler; formell 4.5 er ufullstendig med akseptert avvik.

**Approach:** Arbeid sekvensielt: visuell forbedring, uavhengig review, S6-forberedelse, leveringskontroll og sluttregresjon. Bruk eksisterende DESIGN/EXPERIENCE, epics, sensorveiledning og faglærertilbakemelding som autoritet.

## Boundaries & Constraints

**Always:** Bevar fire trinn, grafitt/petrol-palett, synlig modus, nøkkeltall og kilder, eksplisitte bekreftelser, separate TG3-/listehandlinger og historisk resultat. Dokumenter faktiske før/etterbilder og verifikasjon. Bevar tidligere bevis og promptlogger. Bruk eneste sentrale deferred-work-oversikt. Commit lokalt ved naturlige checkpoints med aktiv promptlogg.

**Never:** Ingen nye features, push/pull, betalte API-kall, endringer av låste AC eller fasiter. Ingen nye S5-forsøk eller endrede S5-observasjoner. Bevar S5-W1 og formell in-progress for 4.5/Epic4. Ikke simuler ekstern testperson eller merk 5.4/5.5 done uten nødvendig bevis. Vesentlige produktvalg krever Mads.

</frozen-after-approval>

## Code Map

- `src/frontend/styles.css`: eksisterende tokens, stepper, felt, PDF, resultater. Paletten og fokuskontrakten skal gjenbrukes.
- `src/frontend/App.tsx`: fire trinn og fokus. Ingen endring av navigasjonsporter; eventuelle tekst-/klasseendringer må bevare semantikk.
- `src/frontend/screens/FinancialInput.tsx`: etikett, beskrivelse og input er unødvendig adskilt på desktop. Eventuell omgruppering må bevare ID-er, etiketter og tastaturrekkefølge.
- `src/frontend/screens/ReportAnalysis.tsx`, `FindingListControl.tsx`, `Tg3Resolution.tsx`: ujevne standardfeltsett, tette avsnitt, rapportidentitet og kontrollgrupper. Ingen endring av gyldighetslogikk.
- `src/frontend/screens/ScreeningResult.tsx`: anbefaling først og fire tall; rapport-/sporbarhetsgrupper trenger tydeligere visuell struktur.
- `tools/finalization/visual-audit.mjs`: faktisk Chromium-egenkontroll med lokal demo-router på tilfeldig loopback-port, ekstern request-sperre og bilder ved 1440×900/390×844. Erstatter ikke S6.
- `tests/e2e`, `tests/components`, `tests/unit`, `tests/integration`: eksisterende meningsfull regresjon; svært korte flater og fokus er allerede dekket.
- `.docs/planning-artifacts/epics.md`: låste AC for 5.4/5.5. `sprint-status.yaml`: R4-S6 fortsatt åpen.
- `README.md`, `src/backend/README.md`: gjeldende demo-/liveoppskrift; root README har utdatert 4.4-status.

## Tasks & Acceptance

**Execution:**
- [x] `src/frontend/styles.css` og berørte frontend-komponenter — forbedre gruppering/spacing, felthierarki, smal stepper, kontrollfeltsett og resultatets lesbarhet uten ny oppførsel.
- [x] `tools/finalization/visual-audit.mjs` og `sluttforing-2026-10-27/` — bevar faktiske før/etterbilder av tom/feil, TG3, PDF-panel, resultat og utdatert resultat; kontroller overløp og eksterne forespørsler.
- [x] `sluttforing-2026-10-27-review.md` — uavhengig BMAD-review, triage, verifiserte rettinger og relevante UI-/E2E-/komponenttester.
- [ ] `story-5-4-forberedelse-2026-10-27.md` — kort ekstern instruks og tydelig AC1–AC5-bevismal uten utfylte observasjoner; bevar R4-S6.
- [ ] `story-5-5-leveringskontroll-2026-10-27.md` — konkret krav/kode/test/bevisspor, arkitektur-/repo-/dependency-/hemmelighetskontroll med grenser og gjenstående eier.
- [ ] `README.md` — synkroniser levert live-status, oppstart/konfigurasjon og bevisstatus; bevar selvstendig offline-demo.
- [ ] `sprint-status.yaml` og `.docs/process/arbeidsokter/2026-10-27-kontrollert-sluttforing.md` — ærlig status, testbevis og lokale checkpoints. Oppdater sentral deferred-work kun ved faktiske åpne funn.

**Acceptance Criteria:**
- Gitt eksisterende flyt, når desktop og smal visning prøves, så er felter, status, kontroll og resultat lesbare uten innholdstap; tastatur og PDF-panel virker fortsatt.
- Gitt berørt UI, når uavhengig review og regresjon gjennomføres, så dokumenteres faktiske resultater og rettinger med før/etterbevis.
- Gitt fravær av ekstern person, når 5.4 klargjøres, så forblir S6 ikke gjennomført og instruksen bruker README som eneste oppskrift.
- Gitt leveringsforberedelse, når 5.5 sammenstilles, så skilles verifisert funksjon fra S5-W1 og manglende S6, med konkret kode/test/bevis og eier for åpne porter.

## Implementation Notes

Planlagt fra brukerens uttrykkelige bestilling av alle fem sekvensielle faser. Brukerens regel om å spørre ved vesentlige produktbeslutninger styrer gjennomføringen; ingen uavklart produktbeslutning er funnet. Ingen irreversibel handling planlagt. Førbilder ble tatt i egen demo-router, ikke den eksisterende live-serveren på port 3000; ingen analyse ble sendt til live-serveren.

## Spec Change Log

## Review Triage Log

Full triage og konkrete bevis: [reviewrapport](sluttforing-2026-10-27-review.md).

| Funn | Verdict | Bevis og rute |
| --- | --- | --- |
| B1 | medium | Eksisterende mappe ble overskrevet; patch til eksklusiv mkdir/run-ID, guard består. |
| B2 | medium | Overløp påvirket ikke exitstatus; patch til feil etter lagret observasjon. |
| B3 | medium | Eksterne requests påvirket ikke exitstatus; patch til krav om 0. |
| B4 | low | Bildenes svært-korte-grense dekkes av eksisterende faktiske geometritester; ingen ny test nødvendig. Root-R1 ble rettet. |
| B5 | low | TG3-legend manglet i bildeutsnitt; nytt startutsnitt. |
| B6 | low | Smale tall manglet i bildeutsnitt; nye individuelle metrikkbilder. |
| B7 | low | Desktop-input fluktet ikke med periode; patch til delte rader. |
| B8 | medium | Browser-launch før cleanup; patch til ytre ressursgrense, negativ launchprøve består. |
| E1 | medium | Uavhengig samme overskrivingsfeil som B1; rettet og rekontrollert. |
| V | false | Ingen verifikasjonshull meldt; ikke et feilfunn. |
| R1 | medium | Fire eksisterende fokusprøver røde; avgrenset kortflate-CSS gir 24/24 grønt uten endrede forventninger. |

## Verification

- Node 24.21.0/npm 11.19.0; tomt miljø uten API-nøkkel, OS-nettsperre med loopback.
- `npm run typecheck`, `npm run lint`, `npm run build`, `npm test`, komponent- og E2E-/dev-tester.
- Visuell gjennomgang av faktiske Chromium-bilder, fokus-/ombrytingstester og byggets nøkkel-/importgrense.
- Isolert installasjon fra uendret lockfil der cache/nett tillater det; egen installasjon er ikke ekstern S6.
- Lokale lenker, faktisk filinventar, ignorering og hemmelighetsmønstre kontrolleres uten sensitive verdier i utdata.
