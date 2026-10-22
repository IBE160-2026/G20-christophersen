# Viktig prompt — Story 3.8 uavhengig BMAD-review

Dato: 2026-10-22. Baseline `49d21e185215c00c39282c132933b64038778cd1`; implementeringscommit `f62a3c9d422b7e447784dfd406d269e0470f37c0`.

## Delegert arbeidsinstruksjon

Utfør ny uavhengig full `bmad-code-review` mot `.docs/implementation-artifacts/spec-3-8-oppdatere-resultat-etter-endret-og-bekreftet-finansgrunnlag.md` og den eksplisitte commitdiffen. Følg skillen, men kjør kontekstfrie reviewlag i samme modellkapabilitet sekvensielt etter brukerens krav. Ikke endre prosjektfiler mens lagene arbeider. Ikke del implementeringsfortelling med blindreviewere. Samle alle lag og vurder hvert funn individuelt med bevis før gruppering. Retting må være innen Story 3.8; ingen 3.9+ eller ny produkt-/arkitekturbeslutning. Send triage og minste retting til forelder før patch; original implementeringsagent tar rettingen sekvensielt. Bevar prompts, arbeidsøkt, råbevis og kanoniske commits. Ingen push.

Forelder presiserte etter triage: Bevar en rød R1-regresjonsprøve uten produksjonsendring, ferdigstill reviewrapport, og returner avventende-retting-checkpoint uten done/commit. Original implementer reaktiveres først etter at reviewturen er avsluttet; reviewer reengasjeres for etterkontroll.

## Lagprompter og isolasjon

Resolver: `uv run _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-code-review --project-root . --key workflow`. De fire resolverdefinerte promptene ble sendt uten endret faglig instruksjon; kun absolutte stier ble substituert. Kildene er `.agents/skills/bmad-code-review/customize.toml` og eventuelle team-/useroverrides løst av resolveren.

1. **Blind Hunter:** «Conduct a review of CONTENT. Look for what's missing, not only what's wrong.» Beregn `N = min(floor(sqrt(kB) + 1), 10)` fra difffilstørrelsen og lever minst N uklassifiserte kandidater. Innhold er bare diffstien `/private/tmp/story-3-8-review-20261022.diff`. Ingen skill eller egne subagenter. Ingen claims/spec/reviewerfunn ble gitt.
2. **Edge Case Hunter:** Les hele `.agents/skills/bmad-code-review/review-prompts/edge-case-hunter.md` og følg den. Diffstien som over. Claimsfil `/private/tmp/story-3-8-review-20261022-claims.txt` skal forbli ulest til laginstruksjonen tillater det. Ingen skill eller egne subagenter. Ingen andre lags kandidater ble gitt.
3. **Verification Gap Reviewer:** Les hele `.agents/skills/bmad-code-review/review-prompts/verification-gap.md` og følg den. Diffstien som over. Ingen skill eller egne subagenter. Ingen claims, spec eller andre lags kandidater ble gitt.
4. **Acceptance Auditor:** Kontroller diff mot eksplisitt Story 3.8-spec og relevante originaldokumenter: Story 3.8/3.9 i epics, SPEC, grensekontrakter, Epic3-kontekst, AD-2/6–10, EXPERIENCE Key Flow 3 og sprintstatus. Se etter brudd på AC, intent, manglende spesifisert atferd og motstrid mellom constraints og kode. Hvert funn skal ha tittel, AC/constraint og diffbevis. Ingen skill eller egne subagenter. Ingen andre lags kandidater ble gitt.

Alle fire fikk instrukser om å returnere tekst i final og ikke bruke egne findings-verktøy. Lagene fullførte i oppgitt rekkefølge uten overlapp. [Reviewrapporten](../../implementation-artifacts/story-3-8-review.md) bevarer resultatene og individuell triage.


## Etterkontroll og siste styring

Forelder reengasjerte reviewer etter avsluttet patchfase: Etterkontroller hver R1–R6 mot patchcommit `1bc47e9d6913abbd5c3810c0fe4d7be7fc1605b7`, kjør tidligere rød nullkontrollprøve/scopevern og målrettet verifikasjon; ingen bred ny reviewrunde eller subagenter. Ved lukket storyreview: spec/sprint done og lokal review/done-commit uten automatisk promptlogg.

Siste brukerbeskjed via forelder: «finn et passende tidspunkt i avslutt nå». Forelder instruerte deretter å ferdigstille reviewrapport/status og lokal commit straks uten nye tester/faser. Full sluttregresjon skal ikke startes nå; dokumenter at den gjenstår fordi brukeren ba avslutte, og at done gjelder bestått storyreview med målrettet kontroll. Ingen push.
