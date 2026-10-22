---
title: 'Story 5.3 — Komplett README-oppskrift'
type: 'chore'
created: '2026-10-22'
status: 'in-review'
route: 'dispatch'
story_key: '5-3-dokumentere-en-komplett-oppskrift-for-lokal-demo-og-tester'
baseline_commit: '0ddbeb7132d7790fdb5bf63bd2bca9bc0d6d82a4'
review_loop_iteration: 0
context:
  - '{project-root}/.docs/implementation-artifacts/epic-5-context.md'
---

<frozen-after-approval reason="Eksplisitt autorisert sekvensiell mini-sprint etter eksisterende AC; ingen ny rutinebekreftelse">

## Intent

**Problem:** README beskriver gamle mellomstadier og mangler én samlet oppskrift som lar sensor etterprøve den faktisk leverte demoen.

**Approach:** Erstatt den historiske statusrekken med faktisk formål, versjonerte installasjons-/bygg-/start-/dev-/testkommandoer og en reproduserbar F1–F4-demoveiledning. Gjennomfør oppskriften selv, dokumenter miljø, forventet/faktisk utfall og begrensninger før separat review.

## Boundaries & Constraints

**Always:** Story 5.3 AC1–5 i epics.md er autoritet, sammen med Epic 5-kontekst, SPEC, final UX, arkitektur, sprintplan/status og kurs-/faglærerspor. Installasjon/browserforberedelse kan kreve nett; senere demo og tester skal kunne kjøres uten live-nøkkel og med eksternt nett sperret. Skill faktisk manuell UI fra automatisk støtte. Bevar ærlig status og lenker. Bruk låst Node24.21.0/npm11.19.0, faktisk npm ci/build/demo/dev/browserinstallasjon/test. Verifiser F1/F2/F4, F3 uten leie, blank/null, kilde/kostnad, originalside, TG3, separate bekreftelser, feil og retur/endring. Egen gjennomkjøring er forberedelse til 5.4, ikke annen person/S6.

**Never:** Ingen Epic4, R1-beslutning, liveintegrasjon eller senere stories. Live er påkrevd v1-arbeid med uferdig integrasjon/evaluering. Ingen README-teksttester eller nye produktfunksjoner. Ikke endre de to opprinnelige rå-sessionloggene eller orkestratorens mini-sprintlogg. Ingen push. Stopp ved in-review/review; separat agent avgjør done.

</frozen-after-approval>

## Code Map

- `README.md`: erstatt foreldet historikk med sammenhengende oppskrift; behold relevante lenker og importgrenser.
- `package.json`, `package-lock.json`, `.nvmrc`: faktiske scripts og eksakte verktøyversjoner; ikke endre avhengigheter.
- `src/backend/server.ts`: bygget dist, loopback127.0.0.1:3000, dev-middleware, portfeil og Ctrl+C; ingen skjult modusbryter.
- `tests/fixtures/property-cases/{README.md,expected.json}`: forhåndsdefinert finans-/PDF-/anbefalingsfasit. Bare uendrede F1–F4 har lagret demosvar.
- `src/frontend/screens/{FinancialInput,FinancialBasisInput,ReportAnalysis,FindingControl,FindingListControl,Tg3Resolution,ScreeningResult}.tsx`: faktiske feltnavn og kontrollhandlinger, blank/null, kostnadsinnhold og historisk resultat.
- `playwright*.config.ts`, `tests/e2e/`, `tests/components/`, `tests/helpers/report-ui-adapter.ts`: eksisterende Chromium, serverlivsløp og kontrollerte adapterutfall; automatisk støtte er ikke faktisk live-uttrekk.
- `.docs/implementation-artifacts/story-5-{1,2}-*.md`: viderefør test-/UX-bevis og miljøoverlevering; omskriv ikke tidligere observasjoner.

## Tasks & Acceptance

**Execution:**
- [x] `README.md` — skriv komplett og korrekt oppskrift med formål, avgrensning, versjoner, kommandoer, case, kontrollporter, feil/retur og struktur/lenker.
- [x] `.docs/implementation-artifacts/story-5-3-verifikasjon.md` og tilhørende rålogger — følg oppskriften faktisk og dokumenter miljø, alle AC-spor, nøkkel-/nettsperre og utfall uten S6-påstand.
- [x] `.docs/process/prompts/2026-10-22-story-5-3.md`, `.docs/process/arbeidsokter/2026-10-22-story-5-3.md` — bevar oppdrag, kildebruk, begrensninger, tester og implementeringscheckpoint; synkroniser sprintstatus til review.

**Acceptance Criteria:**
- Given levert kode/låsfil, when oppskriften følges, then npm ci→build→demo, loopback, dev og lokale forutsetninger virker etter AC1.
- Given testoppskriften, when browserforberedelse og tester kjøres, then dekning, build og kontrolladapter er korrekt beskrevet etter AC2.
- Given F1–F4 og bekreftelsesporter, when demoveiledningen følges, then tre anbefalinger, F3-mangel, blank/null, TG3, original, feil og retur er etterprøvbare etter AC3.
- Given demo/live, when status leses, then installasjonsnett og nøkkelfri offline-demo skilles fra påkrevd uferdig live etter AC4.
- Given struktur/kilder, when lenker åpnes og egen oppskrift prøves, then gyldige hemmelighetsfrie spor og ærlig egenverifikasjon finnes etter AC5.

## Implementation Notes

Ingen uløst intentgap eller irreversibel handling. Dokumentasjonsendring med faktisk kjøring; ingen produktkodeendring planlagt. Autoriserte fremmede untrackedfiler er utelatt. Eksisterende implementeringsdispatch fra orkestrator videreføres direkte uten rekursiv ny dispatch. Kapasiteten tillater oppskrift og reviewoverlevering; egen review utføres ikke.

## Spec Change Log

## Review Triage Log

## Verification

Faktisk npm ci, build, demo, dev, Chromium-forberedelse, typecheck/lint, npm test, komponenter og bygget-app/dev-E2E kjøres sekvensielt. Manuell UI og automatisk nettblokkert støtte rapporteres separat. Lokale lenker og git diff --check kontrolleres. Endelig AC-checkpoint settes først etter kjøring.


Implementert til review: README er fullstendig omskrevet til faktisk nåstatus og én reproduserbar oppskrift. Kjørbar automatisk støtteprøve `story-5-3-oppskrift-kontroll.mjs` er bevart som etterprøvbart bevis på faktiske UI-handlinger/ekte standarddemo, ikke README-teksttest eller produktinngang. To harnessfeil og installasjons-/nettprofilavvik er dokumentert med faktisk endelig negativ probe og grønne kjøringer. Ingen produktkode/pakke-/låsfilendring. Se [egenverifikasjon](story-5-3-verifikasjon.md).

Avsluttende verifikasjon: npm ci og Chromium-forberedelse med nett exit0; faktisk egen manuell UI og automatisk standarddemo-støtte bestått. Korrekt eksternnettsperre/env-i: typecheck/lint/build, Vitest962/962, komponenter37/37, bygget-app114/114/dev3/3.22 lokale README-lenker åpnet/validert. Ingen uløst produktfeil, annen person/S6/live/Linux ikke verifisert. Checkpoint in-review/review; separat reviewer avgjør done.
