---
title: 'Story 2.10 — Registrere og validere separat TG3-avklaring'
type: 'feature'
created: '2026-10-21'
status: 'done'
route: 'dispatch'
story_key: '2-10-registrere-og-validere-separat-tg3-avklaring'
baseline_commit: '70c799af3593ad10795cb1eebaa95771530e9478'
context:
  - '.docs/implementation-artifacts/epic-2-context.md'
  - '.docs/specs/spec-IBE160/grensekontrakter.md'
---

<frozen-after-approval reason="Brukerens eksplisitte sekvensielle bestilling fase 3; eksisterende Story 2.10 AC1–AC5">

## Intent

Investoren skal registrere separat brukerstatus, kort begrunnelse og konkret eksternt grunnlag per aktivt alvorlig TG3. Felles domain avgjør gyldighet og binding til gjeldende rapportforhold; lokale mangler er synlige uten en full anbefalingsmotor. Story 2.8/2.9 er done.

## Boundaries & Constraints

Alltid: eksplisitt Avklart og begge tekster ikke-tomme etter trimming. Ukjent, manglende, Uavklart eller ugyldig er uavklart. Original grad/tekst/kilde, brukerrettinger og avvisninger bevares separat. Brukerbekreftet for førstevurdering betyr ikke KI-fakta, ekstern verifisering, nødvendigvis utbedret eller teknisk godkjent. Ett av to uavklarte TG3 gir fortsatt lokal Innhent mer informasjon. Alle aktive TG3 behandles; ingen ny alvorlighetsklassifisering. Felles kontrakt/domain eier forholdsbinding, aldri bare findingId. Faktisk TG3-endring øker egen revisjon, bevarer uendrede tall/listekontroll og kaller ingen analyse. Ny rapport nullstiller gjeldende avklaring.

Aldri: listebekreftelseshandling (2.11), finans/resultat/snapshot/full screening (Epic 3), semantisk klassifisering, ny brukerhandling for overføring, vedlegg, ekstra opplasting, push eller endringer i låste krav. Ulåst produkt-/arkitekturvalg stopper kjeden.

## I/O & Edge-Case Matrix

| Gitt / handling | Forventet |
|---|---|
| Aktiv TG3 / eksplisitt Avklart og begge tekster | Gyldig brukerbekreftet registrering, uendret original/provenance |
| Ukjent/Uavklart/blank status eller tom/whitespace tekst | Uavklart med konkrete felt-/grunnlagsmangler |
| To TG3 / bare ett avklart | Andre funn navngitt i lokal mangel; aldri automatisk Gå videre |
| Registrert avklaring / ren representasjonsretting | Felles validator kan bevare samme forhold; ny listekontroll gjelder fortsatt |
| Samme findingId / annet eller ukjent forhold, kilde eller rapport | Historisk tekst og binding bevares, avklaringen er ikke anvendbar |
| Status/tekst faktisk endret eller tømt | TG3-revisjon endres; liste-/finanskontroll bevares |
| Uendret registrering, utkast, navigasjon | Ingen TG3-revisjonsendring eller ny analyse |
| Avvist/TG2/usikkert/feilet grunnlag, sen generasjon | Ingen ny anvendbar TG3-avklaring; original og øvrige mangler bevares |

</frozen-after-approval>

## Code Map

- `src/contracts/tg3-resolution.ts`, `src/domain/tg3-resolution.ts`: separat registrering, rapportsnapshot og eneste anvendbarhets-/feltvalidering; gjenbruk FindingCorrection.
- `src/contracts/screening.ts`, `src/domain/screening.ts`: koble TG3-mangler til eksisterende lokal prioritet-1-autoritet, stabil rekkefølge; ingen økonomi.
- `src/frontend/state/report.ts`: egen TG3-revisjon/registreringer, generasjons-/identitetsvern og felles domain-selektor. Bevar alle tidligere kontrollregler.
- `src/frontend/screens/Tg3Resolution.tsx`, `ReportAnalysis.tsx`: egen merket feltgruppe per aktiv TG3; konkrete tilknyttede feil og korte statuser uten fokusstjeling.
- `tests/unit/tg3-resolution.test.ts`, `tests/e2e/report-analysis.spec.ts`, `tests/helpers/report-ui-adapter.ts`: sju FR-5-varianter, negative bindinger/revisjon/rapportbytte, faktisk tastatur/fokus/provenance og ett POST.
- Story-/sprintstatus, verifikasjon og arbeidsøkt: sporbare lokale checkpoints. Aktiv promptlogg holdes utenfor commit.

## Tasks & Acceptance

- [x] Implementer kontrakt/domain med alle matriserader og sju FR-5-avklaringsvarianter.
- [x] Koble ren state og lokal mangelvisning med separat revisjon og bevarte bekreftelser.
- [x] Implementer tilgjengelig eksplisitt status og tekstregistrering i egen feltgruppe med bevart kilde.
- [x] Kjør unit/E2E/type/lint/build og sluttregresjon, dokumenter bevis, sett in-review/review og lokal commit.

Given TG3, when registrert, then felles validator krever eksplisitt Avklart og begge tekster (AC1). Given gyldig registrering, when vist, then original/provenance og separat brukerbekreftet grunnlag er tilgjengelig (AC2). Given to TG3, when ett avklart, then andre blokkerer lokalt uten økonomisk effekt (AC3). Given korrigering med stabil ID, when binding vurdert, then samme representasjon kan bevares, ukjent/motstrid er utilstrekkelig (AC4). Given registrert grunnlag, when faktisk endret, then egen revisjon/mangler endres og uendrede øvrige kontroller bevares (AC5).

## Implementation Notes

Ingen intensjonsgap eller irreversible handlinger. Contracts/domain utformer den konkrete bindingen innen eksplisitt delegert myndighet i arkitekturens AD-2/AD-8 og `reviews/recheck-seams.md` (avsnittet om konkrete felt/representasjon). Konservativt snapshot av rapportidentitet, fysisk side, grad og beskrivelse; bare identiske verdier etter trimming og sammentrekking av whitespace beviser ren representasjonslikhet. Endret innhold eller fysisk kilde gir ukjent binding, aldri automatisk semantisk forståelse. Dette er én tillatt bevart representasjonsretting, ikke en påstand om at kode forstår alle forbedrede beskrivelser eller sidebytter. Registrering av eksisterende status/tekster mot gjeldende funn er fortsatt den allerede låste registreringshandlingen; ingen overføringsknapp innføres. Ny uavhengig agent reviewer etter checkpoint, særlig AC4.

## Verification

`npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, bygget-app og dev-E2E. Chromium: `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-1-2-browsers`. Ingen betalt API eller ny avhengighet. Økonomidelen i FR-5 fullføres i Epic 3 og faktisk listebekreftelse i 2.11.

Implementeringscheckpoint 2026-10-21: Full regresjon 562/562 Vitest og 83/83 bygget-app-E2E, 3/3 dev-E2E, typecheck/lint/build bestått. Deretter ble én ekstra usikker-kilde-prøve lagt til: målrettet suite 25/25 (inkludert denne) bestått. Siste E2E-endring gjaldt kun bedre skjermbildeutsnitt og samme prøve bestod på nytt. Ingen produktkode endret etter full regresjon. Se [verifikasjon](story-2-10-verifikasjon.md). Ny uavhengig BMAD-review er neste port; denne agenten har ikke reviewet seg selv.

### Review Findings

Fire BMAD-lag kjørt sekvensielt. Blind Hunter ga åtte kandidater; Edge Case Hunter ga `[]` (tomt lag registrert), Verification Gap ga ingen gap, Acceptance Auditor ingen AC-/specbrudd. Ingen beslutningsbehov.

- [x] [Review][Patch][medium] Beholdt TG3-grunnlag skjult etter avvisning/TG2 — lesbar separat historisk registrering for valgt funn.
- [x] [Review][Patch][low] Avklaringsstatus mangler på uvalgt aktiv TG3-rad — vis separat tekststatus etter UX status-label.
- [x] [Review][Patch][medium] Tilsiktet Uavklart får ugyldig feltmerking — skill gyldig Uavklart-registrering fra utilstrekkelig avklaringsgrunnlag.
- [x] [Review][Patch][low] Tastaturtest bruker selectOption — etterprøvd faktisk native select med bokstavvalg, Tab/Shift+Tab og beholdt fokus.
- [x] [Review][Patch][low] Rapportbytte-E2E gjenbruker ikke findingId — legg til samme-ID-rapport med nye bytes.
- [x] [Review][Patch][low] Usikker grad-prøve dekker bare usikker kilde — prøv ukjent grad med gyldig kilde og eksplisitt retting.
- [x] [Review][Patch][low] Begge TG3 avklart mangler browserbevis — etterprøv begge registreringer, mangler, retur og kallantall.

Rejected: Blind Hunter #1 `false` som kravbrudd. Registrerte brukerstatus/tekster kan eksplisitt endres etter FR-5/AC5; ingen immutabel historikk for hver tekstredigering er låst. Bare tekstredigering bevarer gammel binding og kan aldri gjøre avklaringen anvendbar for endret forhold. Originalt KI-uttrekk/provenance overskrives ikke.


Uavhengig review sluttført 2026-10-21: tre smale visningsrettinger og fire verifikasjonsforbedringer, én forkastet kandidat, ingen åpne funn/beslutninger. Full regresjon på siste produktkode: 564/564 Vitest, 84/84 bygget-app-E2E, 3/3 dev-E2E og typecheck/lint/build bestått. Se [review og AC-bevis](story-2-10-review.md). Story 2.10 done; 2.11 backlog, Epic 2 in-progress og Epic 3 backlog.
