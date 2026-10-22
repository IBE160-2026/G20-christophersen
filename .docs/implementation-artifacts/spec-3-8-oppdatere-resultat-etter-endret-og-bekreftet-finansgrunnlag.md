---
title: 'Story 3.8 — Oppdatere resultat etter endret og bekreftet finansgrunnlag'
type: 'feature'
created: '2026-10-22'
status: 'done'
route: 'oneshot'
story_key: '3-8-oppdatere-resultat-etter-endret-og-bekreftet-finansgrunnlag'
baseline_commit: '49d21e185215c00c39282c132933b64038778cd1'
---

<frozen-after-approval reason="Brukerens eksplisitte bestilling om Story 3.8 etter eksisterende AC, sekvensiell implementering og uavhengig review">

## Intent

Implementer bare Story 3.8 AC1–5 i epics.md. Investoren skal kunne returnere fra resultat, endre finansgrunnlag, kontrollere/bekrefte og få oppdatert lokalt resultat gjennom eksisterende fremovernavigasjon. Gjenbruk finansvalidering, eksakte beregninger, screening, revisjonsbindinger og eksisterende firetrinnsreise. Eksisterende UX, SPEC CAP-7/CAP-8 med CAP-1/CAP-5/CAP-6, kontrakter, arkitektur AD-2/6–10, sprintstatus og autoritativ Epic3-kontekst gjelder. Ingen ny regelautoritet.

Gitt gjeldende F1, når en finansverdi eller relevant periode/år/kilde/kostnadsinnhold faktisk endres, skal bare berørt bekreftelse oppheves. Forrige snapshot blir straks Utdatert med navngitt kontrollbehov og forblir lesbart med sine egne tall og sin egen anbefaling. Ubekreftet endring er ikke gyldig beregningsgrunnlag. Gitt ugyldig bekreftelsesforsøk, når feltet rettes og gyldig bekreftes, skal historisk vern vare frem til ny resultatnavigasjon; lokale feltfeil og eksisterende fokus/status skal fungere.

Gitt gyldig, bekreftet endring av P/L/D/J og uendret rapportbinding, når eksisterende resultatflyt fullføres, skal nytt snapshot beregnes fra gjeldende årsgrunnlag. L fra 1 900 000 til 1 400 000 med F1s øvrige tall gir F2-fasit: bruttoyield 8,750 %, NOI 1 000 000 kr/år, nettoyield 6,250 %, kontantstrøm 200 000 kr/år og Forkast. Det gamle F1-snapshotet er ikke gjeldende og endres aldri i ettertid.

Gitt bare endret Ymin, eller manglende Ymin som fylles med og bekreftes som 10 %, når nytt resultat dannes, skal alle fire nøkkeltall bevares mens screening bruker gjeldende krav. Manglende/ubekreftet Ymin gir Innhent mer informasjon ved beregningsgrensen; komplett F1 med 10 % gir Forkast. Eksisterende kontrollport skal fortsatt sperre fremovernavigasjon med ubekreftede tall; ingen produktsnarvei til ufullstendig resultat innføres.

Gitt uendret rapport, når finansgrunnlaget fornyes, skal uttrekk, kontroller, bekreftelser, mangler og eventuelle gyldige TG3-avklaringer gjenbrukes uten nytt adapter-/KI-kall. Rapportfeil og uavklart alvorlig TG3 beholder prioritet 1 uansett sterke eller svake tall. Gitt retur uten faktisk endring, når Resultat besøkes, skal samme snapshot fortsatt være gjeldende. Offline ugyldig→rettet→bekreftet skal fungere uten eksternt nett, API-nøkkel eller generell nullstilling.

Fornyelse etter rapport-, funnliste- eller TG3-endring tilhører Story 3.9 og skal ikke kobles inn. Ingen backendendring, ny skjerm, bekreftelsestype, finansregel, migrering eller ekstern handling. Stopp ved ny produkt-/arkitekturbeslutning. Kjør meningsfulle overgangs- og bygget-app-tester med uavhengig fasit, før/etter-bindinger, uendret kallantall og fokus/status. Dokumenter AC-/testbevis og arbeidsøkt, lag lokal commit uten push, og stopp ved in-review/review for separat uavhengig BMAD-review.

</frozen-after-approval>

## Implementation Notes

- Step01/02: Epic3-kontekst er gyldig mot alle planfilenes mtimes. Done-spec 3.7, eksisterende AC, sprintstatus, faglærerfeedback og kursuttrekk er lest. Ingen intentgap eller irreversible operasjoner. Lite frontendfotavtrykk; oneshot brukes med brukerbestilt separat reviewfase. Automatisk aktiv promptlogg holdes utenfor fasecommit.
- Code Map: `src/frontend/state/session.ts` eier eksisterende kontrollport, finansbekreftelse og resultatnavigasjon; utvid bare denne navigasjonen med finansfornyelse. `state/result.ts` eier revisjonsbinding/snapshot/gyldighet og gjenbrukes uendret. Sammenlign hele ikke-finansielle bindingen, slik at 3.9 ikke aktiveres. `FinancialInput.tsx`, `ReportAnalysis.tsx`, `ScreeningResult.tsx` og `App.tsx` har allerede retur, kontroll, feilfokus og historisk status; gjenbruk. Domain, kontrakter og backend endres ikke.
- Tester: `tests/unit/financial-result-renewal.test.ts` verifiserer relevante overgangskontrakter; `tests/e2e/screening-result.spec.ts` gjenbruker ekte PDF/demooppsett til nye finansforløp. Eksisterende 3.5-prøver dekker periode/år/kilde/kostnadsinvalidering. Dokumenter konkrete AC-spor i `story-3-8-verifikasjon.md` og økten under `.docs/process/arbeidsokter/`.

- Implementert finansfornyelse ved eksisterende resultatnavigasjon. Bare finansbinding kan avvike; finans og rapportkontroll må være gyldig/fullført. Ellers beholdes historisk snapshot. Uendret retur beholder samme snapshotobjekt. Ingen UI-/backend-/domain-/kontraktsendring eller ny beslutning.
- Egenverifisert med 241 berørte Vitest (18 nye), 46 berørte bygget-app-E2E (7 nye), build/typecheck/lint/diffkontroll. Rødt/grønt bevis og agentinspiserte bilder er bevart i `story-3-8-verifikasjon.md`. Eksakte AT-10/11-grenser prøves via faktisk UI-fornyelse; offline ugyldig→rettet→bekreftet og uendret adapterkalltall er etterprøvd.
- Checkpoint: in-review/review. Implementeringsagenten har ikke utført review eller satt done. Ny separat BMAD-reviewagent og full sluttregresjon utføres av forelder. Story 3.9 forblir backlog; ingen push.

## Review Findings

Uavhengig BMAD-review 2026-10-22 av `49d21e185215c00c39282c132933b64038778cd1` → `f62a3c9d422b7e447784dfd406d269e0470f37c0`. Fire sekvensielle lag er fullført. [Individuell triage, bevis og refutasjoner](story-3-8-review.md). Patchcommit `1bc47e9d6913abbd5c3810c0fe4d7be7fc1605b7` er uavhengig etterkontrollert: R1–R6 er lukket, 148/148 målrettede tester samt typecheck/lint består. Formelt storyreview er bestått; spec/sprint er done. Full sluttregresjon gjenstår fordi brukeren ba avslutte ved dette checkpointet; done gjelder bestått storyreview med målrettet kontroll.

- [x] [Review][Patch] R1 medium: forny etter tilbaketrukket/gjenbekreftet nullkontroll selv med identisk binding, uten Story 3.9-fornyelse [`src/frontend/state/session.ts:107`]. Tidligere rød reviewerregresjon er grønn etter patch, også med samtidig rapportendringsvern.
- [x] [Review][Patch] R2 low: presiser P/D/J-testenes anbefaling, prioritet og utløsere [`tests/unit/financial-result-renewal.test.ts:37`].
- [x] [Review][Patch] R3 low: presiser årsnormalisert fasit i periodeprøven [`tests/unit/financial-result-renewal.test.ts:68`].
- [x] [Review][Patch] R4 low: prøv numerisk kostnadsinnhold og fornyet snapshotgrunnlag med bevarte D/J-totaler [`tests/unit/financial-result-renewal.test.ts:71`].
- [x] [Review][Patch] R5 low: behold manglende-Ymin-snapshot gjennom bekreftet 10 % og navigasjonsfornyelse [`tests/unit/financial-result-renewal.test.ts:49`].
- [x] [Review][Patch] R6 low: oppgi eksakte E2E-kommandoer/filtre/miljø i egenverifikasjonen [`story-3-8-verifikasjon.md:26`].

### Rejected

- B6 low: separat allerede-korrigert/avvist-baseline-scenario gir liten nytte utover eksisterende proveniensprøver, uendret rapportobjekt og uavhengig avvisningsprøve; ekstra scenariooppbygging avvises.
- B7 low: full ny rapportbyttevariant er redundant med eksisterende generasjons-/gamlesvarprøver, full binding og uavhengig generasjonsvernprøve; ekstra scenariooppbygging avvises.

- Sluttcheckpoint etter uavhengig review: alle R1–R6 lukket; to low-ekstrascenarier begrunnet avvist. Ingen åpne storyfunn. Story 3.9 forblir backlog. Ingen push. Brukeren ba avslutte nå; full sluttregresjon er derfor ikke startet i denne sluttfasen.
