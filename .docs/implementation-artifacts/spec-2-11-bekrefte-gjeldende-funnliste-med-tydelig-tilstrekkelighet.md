---
title: 'Story 2.11 — Bekrefte gjeldende funnliste med tydelig tilstrekkelighet'
type: 'feature'
created: '2026-10-21'
status: 'in-review'
route: 'dispatch'
story_key: '2-11-bekrefte-gjeldende-funnliste-med-tydelig-tilstrekkelighet'
baseline_commit: 'b2600f954dc2a4f2aa37f3903a0754e738d3b1e3'
context:
  - '.docs/implementation-artifacts/epic-2-context.md'
  - '.docs/specs/spec-IBE160/grensekontrakter.md'
---

<frozen-after-approval reason="Brukerens eksplisitte sekvensielle bestilling fase 4, godkjente Story 2.11 AC1–AC5">

## Intent

Investoren bekrefter eksplisitt hele den gjeldende kontrollerte listen med rettinger og avvisninger. Analysefullføring, enkeltfunnkontroll, listebekreftelse og separat TG3-status er forståelige uten å forveksles. Felles kontroll-/mangelgrunnlag eier gyldighet; samme grunnlag brukes av UI og senere screening. Story 2.1–2.10 er done etter separat review.

## Boundaries & Constraints

Alltid: bekreftelsen bindes til gjeldende rapport og listerevisjon; ingen automatikk fra completed eller enkeltfunnets Bekreft. Originalbytes, originaluttrekk og fysisk kilde bevares uendret. Completed findings: [] kan bekreftes etter kontroll; manglende/feilet/ufullstendig analyse og uløst kritisk usikkerhet blir aldri tilstrekkelig gjennom brukerhandling. En listebekreftelse avklarer aldri TG3. Uavklart kan registreres og menneskelig kontroll fullføres mens lokal Innhent mer informasjon består. Kontrollslutthendelsen krever gjennomført kontroll med håndtert TG3-status og bekreftet gjeldende liste. Bruk korrigering/Avvis/ny rapport krever ny listebekreftelse. Uendret retur, utkast/Avbryt og separat TG3-endring bevarer uendrede liste-/finansbekreftelser. Ingen ny analyse av uendret rapport.

Aldri: ny timer, telemetri, målt live-tid, Epic 3-finans/terskler/full screening/resultat/snapshot eller ny navigasjonsvei som omgår kontroll. Ikke endre låste produkt-, UX-, arkitektur- eller SPEC-krav. Ulåst beslutningsbehov stopper arbeidet. Ingen push. Aktiv promptlogg holdes utenfor commit.

## I/O & Edge-Case Matrix

| Gitt / handling | Forventet |
|---|---|
| Completed med gyldig liste / separat eksplisitt bekreftelse | Gjeldende revisjon brukerbekreftet; rettinger/avvisninger/opphav beholdt |
| Completed tomliste / før og etter bekreftelse | Før: ubekreftet mangel. Etter: ingen kjent rapportmangel, ingen påstått screeninganbefaling |
| Manglende/feilet/delvis analyse eller uløst usikkerhet | Aldri tilstrekkelig; alle konkrete kjente mangler bevares |
| Bekreftet liste med TG3 Uavklart / kontrollslutt | Listekontroll fullført etter håndtert status; lokal TG3-mangel består |
| Bruk korrigering/Avvis/rapportbytte etter bekreftelse | Listebekreftelse ugyldig; ny rapport krever analyse og gammel handling ignoreres |
| Ubrukt utkast, Avbryt, uendret retur, separat TG3-endring | Gjeldende uendret liste-/finanskontroll bevares; ingen ny analyse |
| Tastatur og lokalt nett / komplett kontrollflyt | Synlig fokus og korte lokale statuser; ingen ekstern forespørsel eller tilgjengelig resultatflate |

</frozen-after-approval>

## Code Map

- `src/contracts/finding-control.ts`, `src/domain/finding-control.ts`: eksisterende separate kontroller; utvid med felles kontrollvurdering ved behov, ingen duplisert UI-gyldighet.
- `src/frontend/state/report.ts`: eksisterende `listRevision`/`listConfirmationRevision`, originalimmutabilitet og ugyldiggjøring ved Bruk/Avvis/rapportvalg. Legg til eksplisitt listehandling med generasjons-/identitets-/revisjonsvern og felles selektor. Fjern hardkodet alltid-ubekreftet mangel. TG3 har separat revisjon.
- `src/domain/screening.ts`, `src/contracts/screening.ts`: eneste lokale prioritet-1-autoritet; bevar alle mangler og stabil rekkefølge. `src/frontend/state/session.ts`: bevar finansbekreftelser og eksisterende navigasjonsporter, koble samlet lokalt mangelgrunnlag der nødvendig.
- `src/frontend/screens/ReportAnalysis.tsx`, ny separat listegruppe ved behov, `src/frontend/App.tsx`: tilgjengelig eksplisitt listebekreftelse og korrekt trinn-/kontrolltekst; resultat forblir utilgjengelig. Eksisterende FindingControl/Tg3Resolution/SourceReview bevares.
- `tests/unit/` og `tests/e2e/report-analysis.spec.ts`: gjenbruk faktiske RT11/RT12/TG3-PDF og kontrolladapter. Adapter har empty/uncertain/partial-varianter; utvid kun ved behov. Eksternt nett blokkeres som i tidligere tester.
- `.docs/implementation-artifacts/sprint-status.yaml`, denne spec, verifikasjon og arbeidsøkt: bare 2.11 review/in-review, Epic 2 fortsatt in-progress før uavhengig review.

## Tasks & Acceptance

- [x] Implementer felles kontroll-/bekreftelsesvurdering og eksplisitt statehandling med revisjonsbinding.
- [x] Legg til separat tilgjengelig listegruppe, status og lokal mangelvisning med eksisterende portvern.
- [x] Test hver matriserad med unit og faktisk bygget app/PDF; negative tester, tastatur/fokus, RT10–14/19 og relevante AT13/18.
- [x] Kjør full regresjon, typecheck/lint/build; dokumenter AC-bevis, oppdater review-status og lokal commit.

Given fullført kontrollert liste, when separat bekreftelse, then binding/opphav og enkeltfunnskillet består (AC1). Given tomliste eller feil/usikkerhet, when kontroll, then bare fullført bekreftet grunnlag kan være tilstrekkelig (AC2). Given bekreftet liste og Uavklart TG3, when kontrollslutt, then lokal Innhent mer informasjon består uten press til Avklart (AC3). Given listebekreftelse, when endring eller retur, then korrekt ugyldiggjøring/bevaring og ingen unødvendig analyse (AC4). Given lokal tastaturflyt, when kontroll gjennomført, then fokus/status og eksisterende S5-hendelsesgrunnlag er forståelig, uten måling (AC5).

## Implementation Notes

Ingen intensjonsgap eller irreversible handlinger funnet. Konkret kode-/feltdesign følger delegert kontrakteierskap i AD-2/AD-8. Brukerens fasebestilling autoriserer gjennomføring uten ny rutinegodkjenning. Denne agenten leverer implementering til separat uavhengig review; done er ikke tillatt ved dette checkpointet.

## Verification

`npm test`, `npm run typecheck`, `npm run lint`, `npm run build` og begge Playwright-suiter. Chromium `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-1-2-browsers`. Ingen betalt API. Testforventninger skal komme fra låste AC/RT/AT, aldri tilpasses feil produktkode. Faktisk S5-evaluering og Epic 3-resultater er senere leveranser.

Implementeringscheckpoint 2026-10-21: full regresjon 579/579 Vitest, 89/89 bygget-app-E2E og 3/3 dev-E2E; typecheck/lint/build bestått. Samtlige spec-matriserader har kjørte prøver. Se [AC-/testbevis](story-2-11-verifikasjon.md). Ingen ny beslutning eller blokkering. Separat uavhengig BMAD-review er neste port; Epic 2 er fortsatt in-progress og Epic 3 backlog.
