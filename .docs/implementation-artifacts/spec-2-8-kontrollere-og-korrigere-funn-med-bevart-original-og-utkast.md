---
title: 'Story 2.8 — Kontrollere og korrigere funn med bevart original og utkast'
type: 'feature'
created: '2026-10-21'
status: 'in-review'
route: 'dispatch'
story_key: '2-8-kontrollere-og-korrigere-funn-med-bevart-original-og-utkast'
baseline_commit: 'fee2f76e5e94745cc1df43a45ae103cf633981c0'
context:
  - '.docs/implementation-artifacts/epic-2-context.md'
  - '.docs/specs/spec-IBE160/grensekontrakter.md'
---

<frozen-after-approval reason="Brukerens eksplisitte sekvensielle bestilling, fase 1; eksisterende Story 2.8 AC1–AC4">

## Intent

Investoren må kunne kontrollere enkeltfunn og rette feilaktig KI-uttrekk mot originalrapporten. Lever bare Story 2.8: separat enkeltfunnbekreftelse og korrigeringsutkast med eksplisitt bruk eller avbryt. Opprinnelig uttrekk, gjeldende brukt versjon og uferdig utkast skal kunne skilles og spores via findingId og rapportidentitet.

## Boundaries & Constraints

Alltid: Uendret originalt analyseutfall og PDF-bytes. Kontrollstatus med synlig kilde, uten ny grad/tekst ved Bekreft. Grad, beskrivelse og fysisk PDF-side redigeres som utkast mot valgt rapport. Bruk korrigering validerer kontrollerbar grad/beskrivelse/kilde/side, gjør korrigeringen gjeldende, endrer listerevisjonen og opphever enkeltfunn-/listebekreftelse. Avbryt fjerner bare utkastet. Funnvalg, trinnretur og PDF-panellukking bevarer utkast og gjeldende grunnlag. Alle overganger er rene og starter ingen analyse. Usikker kandidat blir ikke dokumentert rapportfakta før gyldig eksplisitt retting og nødvendig kontroll. Struktur-/kildevalidering er ingen semantisk verifisering.

Aldri: Avvisning (2.9), TG3-avklaring (2.10), listebekreftelseshandling (2.11), resultat/screening (Epic 3), ny KI-analyse eller endring av låste produktkrav. Ingen navigasjon omgår readiness. Ny ulåst produkt-/arkitekturbeslutning stopper kjeden.

## I/O & Edge-Case Matrix

| Gitt / handling | Forventet |
|---|---|
| Kontrollerbart funn / Bekreft | Synlig kontrollert status og kilde, original uendret; ingen liste-/TG3-bekreftelse |
| Funn med eventuell brukt retting / Korriger, endre grad/tekst/side | Merket utkast, gjeldende versjon og revisjon uendret |
| Utkast / funnbytte, trinnretur, PDF-panel og Esc | Samme utkast og gjeldende grunnlag ved retur; riktig fokus |
| Gyldig utkast / Bruk korrigering | Ny gjeldende brukerkorrigert versjon, revisjon +1, enkelt-/listebekreftelse opphevet, original bevart |
| Utkast / Avbryt | Utkast borte, tidligere gjeldende korrigering/bekreftelser/revisjoner bevart |
| Ukjent grad, tom tekst, ukjent/ugyldig/utenfor dokumentet side eller kilde / Bruk | Konkrete felt-/kildemangler, ingen endring av gjeldende grunnlag og ingen gjetting |
| Ny rapport eller gammel generasjon / kontrollhandling | Rapportbytte fjerner tidligere kontrollgrunnlag; gammel handling ignoreres |
| RT-11: KI TG3 side 4, faktisk TG2 side 5 / rett og bruk | Fysisk kilde 5, opprinnelig TG3/4 tilgjengelig, ingen ny adapterforespørsel |

</frozen-after-approval>

## Code Map

- `src/contracts/document-analysis.ts`: eksisterende original-/analyseschema beholdes uendret; separat kontrakt for brukt korrigering gjenbruker kildeformen.
- `src/frontend/state/report.ts`: autoritativ rapportreducer, generation, outcome og view; legg kontrolltilstand ved siden av immutable outcome og tilby gjeldende-funnselektor.
- `src/frontend/screens/ReportAnalysis.tsx`: behold listen/IntersectionObserver/kunngjøring og PDF-visning; vis gjeldende versjon, original, kontrollstatus og utkast.
- `src/frontend/screens/FindingControl.tsx`, `src/frontend/styles.css`: lokal merket redigering og feltfeil, fokusretur etter Bruk/Avbryt; samme tokens.
- `tests/unit/finding-control.test.ts`, `tests/e2e/report-analysis.spec.ts`, `tests/helpers/report-ui-adapter.ts`: reducer, uavhengig RT-11-original, fysisk PDF og negative tastatur-/returprøver.

## Tasks & Acceptance

- [x] Implementer separat korrigeringskontrakt og ren kontroll-/utkast-/bruk-/avbryt-tilstand med revisjonsvern.
- [x] Koble gjeldende liste og original-/utkastkontroller til eksisterende kildeflate uten nye analyseforespørsler.
- [x] Verifiser alle matrisetilfeller og AC1–AC4 med reducer og bygget-app-prøver; type/lint/build/regresjon.
- [x] Dokumenter bevis, sett story/sprint til review og lag lokal commit uten promptloggen.

Given kontrollerbart funn, when Bekreft, then kontrollstatus/kilde er synlig og original uendret (AC1). Given redigering, when utkast endres eller navigeres fra, then utkast er separat og bevart (AC2). Given gyldig utkast, when Bruk korrigering, then gjeldende versjon/revisjon endres og bekreftelser oppheves uten KI-kall (AC3). Given utkast eller ugyldig kilde, when Avbryt eller ugyldig Bruk, then henholdsvis bevaring eller konkret mangel uten gjettet grad/side (AC4).

## Implementation Notes

Ingen intensjonsgap eller irreversible handlinger. Fotavtrykket omfatter felles kontrollkontrakt, rapportreducer, skjerm/komponent/CSS, målrettede tester og sporbar dokumentasjon. Brukerens eksplisitte sekvensielle implementering/review-kjede autoriserer implementeringen uten ny menybekreftelse. Denne arbeidsagenten utfører implementeringen; en ny agent utfører full uavhengig BMAD-review etter checkpoint. Ingen nestet parallell delegasjon brukes.

## Verification

`npm test`, `npm run typecheck`, `npm run lint`, `npm run build` og relevante bygget-app-/dev-E2E. Verifikasjonsrapport dokumenterer faktisk kjørt omfang og AC-spor.

Implementeringen og matrisen er verifisert; full uavhengig BMAD-review er neste steg. Se [verifikasjon](story-2-8-verifikasjon.md).
