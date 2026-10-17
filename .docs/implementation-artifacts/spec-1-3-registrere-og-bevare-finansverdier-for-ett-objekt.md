---
title: 'Story 1.3 — Registrere og bevare finansverdier for ett objekt'
type: 'feature'
created: '2026-10-17'
status: 'in-review'
route: 'oneshot'
story_key: '1-3-registrere-og-bevare-finansverdier-for-ett-objekt'
baseline_commit: '0a8e21dfb10bd8a41609728446d5b86156bde154'
---

<frozen-after-approval reason="Eksplisitt implementeringsbestilling av godkjent Story 1.3 i kontrollert mini-sprint 2026-10-17">

## Intent

Implementer kun [Story 1.3, AC1–AC4](../planning-artifacts/epics.md#story-13-registrere-og-bevare-finansverdier-for-ett-objekt). Investoren skal registrere fem rå finansverdier for ett objekt i en aktiv frontendøkt. Nytt Tallgrunnlag har blanke, ubekreftede P/L/D/J/Ymin med synlige etiketter og NOK/prosent. P er totalpris inklusive eventuell fellesgjeld, uten kjøpsomkostninger; L er brutto leieinntekt; D er eierbetalt drift; J er renter og avdrag inklusive eventuell fellesgjeld; Ymin er minimumskrav til nettoyield.

L/D/J skal ha eksplisitt periode og tilhørende år. Verdier, år og valgte perioder bevares akkurat som registrert, også når opplysninger mangler eller innhold slettes. Ingen periode, år, beløp eller bekreftelse gjettes. Blank og registrert 0 skilles; registrering er alltid ubekreftet. P og Ymin normaliseres ikke. Tilgjengelig navigasjon endrer ingen data og starter ingen analyse/kontroll. Sideoppdatering og lukking avslutter økten; ingen varig lagring eller gjenopptak.

Én React-reducer eier aktiv registrering; contracts eier nødvendige delte schemas/typer før første bruk. Behold importgrensene AD-1 og eksakte råstrenger uten Number/parseFloat. Bruk final DESIGNs felt-/periodekontroller, systemfont og grafitt/petrol samt EXPERIENCEs etiketter, tekststatus, tastatur og synlige fokus. Bred desktop viser lesbare rader; smal visning ombryter uten innholdstap. Stepper og arbeidsinnhold må fortsatt kunne rulles uten fokusoverlapp. Senere trinn forblir sperret med eksisterende forklaringer.

Autoritet er [epics](../planning-artifacts/epics.md), [DESIGN](../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/DESIGN.md), [EXPERIENCE](../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md), [final arkitektur](../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md), [SPEC og kompanjonger](../specs/spec-IBE160/SPEC.md), [sprintplan](sprint-plan.md) og [sprintstatus](sprint-status.yaml). Kravspor: registreringsdelen av FR-1/FR-3, NFR-1/NFR-2, AD-1/AD-2/AD-7/AD-9, CAP-1/CAP-7 og UX-DR5/6/25/32/34/35/37/40. Kursveiledningen og faglæreroppfølgingen styrer sporbar verifikasjon uten å utvide scope.

Normalisering og numerisk validering tilhører 1.4; kilder/kostnader/konfliktkontroll 1.5; komplett bekreftelses-/feilflyt 1.7. Ingen av disse, finansberegning, rapportanalyse eller resultater bygges nå. Stopp ved reelt nytt produkt-/arkitekturgap. Implementering leveres som in-review/review til separat BMAD code review; først dette reviewet kan sette done.

</frozen-after-approval>

## Implementation Notes

- Ren `main` på full baseline over. Story 1.2 er `done`; R1–R4 gjelder senere porter og blokkerer ikke 1.3. Bestillingens autoritative dokumenter, forrige story, PRDs FR-1–FR-4, F1/F3, faglærerens tilbakemelding/oppfølging og sensorveiledningen s. 1–7 er lest direkte. Epic-kontekstens historiske «bare 1.1» erstatter ikke dagens bestilling.
- Intent gap: ingen. Irreversible handlinger: ingen. Footprint: et lite lokalt skjema, rå kontrakt og reducer, tilhørende tester/konfigurasjon samt README/status/bevis. Ingen ny produkt-/arkitekturbeslutning. Enkel oneshot-rute brukes til implementering, men review/finalisering skilles uttrykkelig ut etter brukerens rekkefølge.
- Kodekart/plan: `src/frontend/App.tsx` gjenbruker appskallet og monterer `screens/FinancialInput.tsx`; `state/session.ts` eier rene registrerings-/navigasjonsoverganger. `src/contracts/financial-input.ts` eier kun rå felt/år/periode og ubekreftet tilstand. `styles.css` gjenbruker alle tokens og bevarer eksisterende zoomregler. Ingen backend-/domainendring.
- Rå felt er tekstinput med decimal inputmode; år er rå tekst. Periode starter uoppgitt, med eksplisitte valg År/Måned/Ukjent. L/D/J har hvert sitt år slik at manglende og ulike år kan bevares før senere validering. P/Ymin har ingen periodeomregning. Fokus ved tilgjengelig navigasjon går til Tallgrunnlag-overskriften uten dataendring.
- Verifikasjonsplan: nødvendige låste Zod 4.6.7/Vitest 5.0.4 innføres ved første faktiske bruk. Rene Vitest-kontroller av blank/0/sletting, F1/F3, eksakte råstrenger og navigasjon uten mutasjon; Playwright mot bygget skjema for alle fire AC, etiketter, feltfokus og smal ombryting. Eksisterende 1.2-demotester/HTTP-/dev-/HMR-/zoomregresjon bevares med nye forventninger til registreringsflaten. Kjør typecheck, lint, build og E2E; se faktisk UI ved desktop/zoom og dokumenter bevis i egne filer.

- Implementert og egenverifisert 2026-10-17: fem rå felt, eksplisitt periode/år, én reducer og delt råschema. Zod/Vitest følger eksakte pins. 8 Vitest, 17 bygget demo-E2E og 2 dev-tester består; typecheck/lint/build består. Native 100/200/400 % og faktiske Chromium-bilder er kontrollert. Miljøavvisninger og native avgrensninger er dokumentert i [verifikasjonen](story-1-3-verifikasjon.md). Ingen ny beslutning eller 1.4-logikk. Status er in-review/review i påvente av separat BMAD code review; denne fasen har ingen commit.
