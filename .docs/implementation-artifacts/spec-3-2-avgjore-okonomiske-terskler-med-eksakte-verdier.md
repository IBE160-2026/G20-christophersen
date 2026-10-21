---
title: 'Story 3.2 — Avgjøre økonomiske terskler med eksakte verdier'
type: 'feature'
created: '2026-10-21'
status: 'done'
route: 'oneshot'
story_key: '3-2-avgjøre-økonomiske-terskler-med-eksakte-verdier'
baseline_commit: '9971a7d2cb2d623c89e73676d2094fc8a5987f23'
---

<frozen-after-approval reason="Brukerens eksplisitte sekvensielle bestilling av bare eksisterende Story 3.2 etter ferdig og reviewet 3.1">

## Intent

Lever kun [Story 3.2 AC1–AC4](../planning-artifacts/epics.md#story-32-avgjøre-økonomiske-terskler-med-eksakte-verdier): separate rene terskelfunksjoner for nettoyield og kontantstrøm, med bestått/brutt/ikke-vurderbart og konkret eksakt grunnlag. Autoritet er epics, kompilert Epic 3-kontekst, SPEC CAP-5/CAP-6/grensekontrakt, final UX, AD-1/7/10, låst PRD-addendum og sprintplan/status. Kravene endres ikke.

Gitt gyldige bekreftede P, L, D og Ymin i prosent, når yieldkravet vurderes, skal avgjørelsen bruke eksakt `100 * NOI >= P * Ymin` med big.js, uten yielddivisjon, Number/parseFloat, mellomavrunding, S1-toleranse eller formatterte tall. Gitt P=16000000, D=400000, Ymin=7 og L=1520000, når kravet vurderes, skal likhet bestå. Gitt L=1519999 eller et mindre presist desimalbrudd under grensen, skal kravet bryte selv om senere presentasjon kan skjule forskjellen.

Gitt gyldig bekreftet kontantstrømgrunnlag L/D/J, når nullgrensen vurderes, skal kontantstrøm 0 bestå, −1 bryte og små eksakte desimaler rundt null beholde riktig fortegn. Gitt begge økonomiske brudd, når begge separate funksjoner kjøres, skal begge brudd være tilgjengelige samtidig. Ingen funksjon velger anbefaling eller erstatter senere prioritet 1.

Gitt manglende, blanke, ugyldige, ubekreftede eller konfliktfylte relevante verdier, kilder eller kostnadsgrunnlag, eller uforenlige relevante år/ukjent periode, når funksjonen kjøres, skal berørt terskel være ikke-vurderbar med konkrete eksisterende årsaker og nødvendig handling, uten skjult null, standardkrav, gjetting eller gammelt tall. P=0 eller manglende Ymin skal ramme yield, manglende J bare kontantstrøm. Bekreftet Ymin=0 og J=0 er gyldige, ubekreftet null er utilstrekkelig. Årsnormalisering og bekreftelses-/kilde-/kostnadsregler gjenbruker eksisterende autoritet; ingen parallelle lokale regler.

Gitt samme finansgrunnlag, når funksjonene kjøres gjentatt, skal utfallet være identisk uten inputmutasjon. Rapport/TG3/live/demo er ikke terskelinput. Ingen KI, I/O, UI, formattering (3.3), komplett screening/anbefaling (3.4), snapshot eller nye finansformler inngår. Test bare terskeldelene av BT-8/9, AT-2–4/10/11/14/15 og utilstrekkelig grunnlag fra BT-5/6/18 med uavhengige forventninger, presisjon, årsnormalisering og isolasjon. Stopp ved in-review/review med lokal commit etter relevante tester og regresjon; en ny uavhengig agent reviewer før done. Ingen push og aldri start 3.3.

</frozen-after-approval>

## Implementation Notes

- Readiness: 1.4 og 3.1 er done; Epic 2 done og full regresjon grønn. Baseline lest fra Git. Aktiv promptlogg er uttrykkelig autorisert og holdes utenfor commit. Ingen intensjonsgap, irreversible handlinger eller nye produkt-/arkitekturvalg; liten reversibel modulstory bruker oneshot. Brukerens fasebestilling overstyrer integrert review/done: ny separat reviewer skal overta checkpointet.
- Code Map/oppgaver: `src/domain/thresholds.ts` gjenbruker `calculateFinancialMetrics` fra 3.1 og `validateFinancialBasis` for Ymin. Ingen endring i finans- eller valideringsregler. `src/contracts/thresholds.ts` eier delt schema/type for beslutning og kontrollgrunnlag, med eksisterende metrikk-/input-/kildeskjemaer. `tests/unit/thresholds.test.ts` dekker AC og låst fasit. Domain-README og egne verifikasjons-/arbeidsøktfiler beskriver grensen. App/state/backend/låste planer forblir uendret; bare sprintstatus synkroniseres.
- Design: hver funksjon tar hele FinancialBasis, returnerer beslutning og eget metrikkgrunnlag. Yield inkluderer registrert Ymin, kilde og eksakt prosentverdi, også ved mangler. Vurderbare beslutninger viser eksakt venstre/høyre side og operator; ikke-vurderbare har null sammenlikning og alle relevante valideringsårsaker. Egen big.js-konstruktør hindrer global presisjonskonfigurasjon. Senere screening må fortsatt bruke felles mangelvurdering uavhengig av terskelutfall.
- Undersøkelsen omfatter ferdig 3.1-spec/review, faktisk finans-/valideringskode og kontrakter, Story 3.2 AC, Epic 3-kontekst, PRD-addendum BT/AT, SPEC/grensekontrakt, sprintporter og arkitekturens kildeavstemming mot sensorveiledning og faglærertilbakemelding. Vanlig deterministisk kode, kjent fasit, sporbarhet og avgrenset v1 videreføres uten nye kurskrav.
- Implementert og egenverifisert: 67 nye terskelprøver, 217/217 målrettet og 716/716 full Vitest. Typecheck/lint og E2E-kommandoens typecheck/build, 89/89 bygget-app og 3/3 dev-E2E består sekvensielt. En TypeScript-feil i parametrisk testtilordning ble rettet før sluttregresjonen. Ingen produksjonsfeil eller scopeendring. Se [AC-/testbevis](story-3-2-verifikasjon.md), [Vitest-rålogg](story-3-2-kontroller.txt) og [build/E2E-rålogg](story-3-2-e2e-kontroller.txt).
- Implementeringscheckpointet var in-review/review, med separat uavhengig review før done i samsvar med brukerens bestilling. Den nye reviewagenten har nå fullført fire sekvensielle BMAD-lag, egne negative/grenseprøver og siste fullregresjon. 16 ekstra tester består; produksjonskode og låste regler er uendret. Sluttstatus er **done**, Epic 2 done og Epic 3 in-progress; 3.3–3.9 backlog. 732/732 Vitest, 89/89 bygget-app, 3/3 dev-E2E og typecheck/lint/build er grønt. Se [full review og sluttbevis](story-3-2-review.md). Ingen blocker, ulåst beslutning eller push. Brukerens arbeidsrunde stopper her før 3.3.

### Review Findings

Fire uavhengige BMAD-lag er kjørt sekvensielt over implementeringsdiffen.
Blind Hunters åtte kandidater er vurdert enkeltvis; øvrige lag fant ingen
konkrete feil. Brukeren har allerede autorisert nødvendige Story 3.2-rettinger.

- [x] [Review][Patch][low] #5 — to terskelprøver for `cost-exceeds-total` i D og J kontrollerer berørte årsaker og fortsatt tilgjengelig yield ved bare J-overløp.
- [x] [Review][Patch][low] #6 — tre terskelprøver for sirkulær, manglende og tvetydig kostnadsinkludering gir konkrete årsaker uten sammenlikning.
- [x] [Review][Patch][low] #7 — presist yieldbrudd og negativ cash er kontrollert under endret global big.js-konfigurasjon; innstillingene gjenopprettes i finally.
- [x] [Review][Patch][low] #8 — ti nye prøver etterprøver manglende/ustøttet periode, ugyldig år og manglende støtte for faktisk leie med relevant terskelisolasjon.

#### Rejected

- #1, low: Det strukturelle skjemaet tillater andre metrikktyper, men eneste produksjonsprodusent velger eksplisitt netYield/cashFlowBeforeTax og sjekker ratio/amount før avgjørelse. Ingen inngang eller nåværende konsument stoler på eksterne terskelobjekter. Semantiske guards ville utvide reglene uten demonstrert feilende programsti.
- #2, low: Skjemaet alene korrelerer ikke tilgjengelighet på tvers av objekter; produsentene returnerer unavailable før sammenlikning ved utilstrekkelig grunnlag. Det finnes ingen annen produsent eller inngående terskeldata. Ekstra kontraktforgrening avvises som unødvendig kompleksitet i denne leveransen.
- #3, low: Skjemaet validerer sammenlikningsstruktur, ikke aritmetikken på nytt. Den eneste produsenten setter status direkte fra eksakt gte, og konkret fasit tester utfallet. En ny regelkopi i contracts er ikke nødvendig for nåværende kallere.
- #4, low: Begge separate funksjoner gjentar full validering via 3.1; dette er reelt ekstraarbeid, men ingen målt ytelsesfeil eller feilaktig utfall er vist. Endret finans-API eller cache gir mer kompleksitet enn den ubetydelige lokale kostnaden forsvarer.
