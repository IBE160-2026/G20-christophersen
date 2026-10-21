# Story 3.6 — verifikasjon før uavhengig review

Dato: 2026-10-21. Status: **in-review**, sprintstatus **review**. Baseline: `db45d35cf8eae885b9fb4426b15ab281e227c689`. Dette er egenverifikasjon, ikke uavhengig review eller done-godkjenning.

Autoritet: [Story 3.6 AC1–AC5](../planning-artifacts/epics.md#story-36-gjøre-hvert-nøkkeltall-og-beregningsgrunnlag-lesbart), [implementeringsspec](spec-3-6-gjore-hvert-nokkeltall-og-beregningsgrunnlag-lesbart.md), SPEC CAP-5/resultatdelen av CAP-6, FR-12–FR-14/FR-18, AD-2/7/9/10 og final DESIGN/EXPERIENCE. Kursveiledningens sidehenviste uttrekk og faktisk faglærerfeedback er brukt for smal avgrensning, uavhengig fasit og prosesspor.

## Faktisk verifisert grense

[FinancialMetrics](../../src/frontend/components/FinancialMetrics.tsx) tar én `ResultSelection`. Alle fire kort, input/kilder, kostnadsdetaljer og presisjonsforklaring leses fra samme snapshot og eksisterende presentasjonsmodul. Ingen ny regel-/valideringsautoritet er innført. Historisk state gir eldre tall fra samme historiske snapshot, aldri nye input blandet med gamle tall. Ingen beregning gir bare Ikke beregnet.

[16 direkte komponentprøver](../../tests/components/financial-metrics.spec.ts) serverrendrer den faktiske React-komponenten med `react-dom/server` og setter rendret HTML/CSS direkte i Chromium. Native details/summary trenger ingen hydrering eller React-event-handler. Testene bruker ekte snapshot-/reducer-/finans-/terskel-/presentasjonskode og rapportbundne F1/F4-PDF-fixtures med håndskrevne forventninger fra PRD-addendum. Ingen offentlig testrute, appserver, betalt API eller ny produktskjerm.

| AC / testspor | Observerbar kontroll | Resultat |
|---|---|---|
| AC1, BT-1 | Fire navn fra start, norsk F1-fasit 11,875 %, 1 500 000 kr/år, 9,375 %, 700 000 kr/år og årsgrunnlag 2026. | Bestått |
| AC1, BT-3/5/6/17/18 | L mangler, J mangler, P=0, J-mangel med L=1 400 000 og Ymin-mangel. Hvert utilgjengelig kort har feltspesifikk årsak; tilgjengelige delberegninger beholder håndskrevet fasit. Ikke-anvendte normaliserte verdier merkes i detaljene. | Bestått |
| AC1, BT-11 | 1,875 %, −100 000 kr/år, −0,625 %, −900 000 kr/år. | Bestått |
| AC2, BT-4 og tilstandsgrenser | Faktisk failed rapport, completed med ubekreftet liste og completed F4 med uavklart TG3 beholder fire F1-tall og fire tekstlige Delgrunnlag. Fixture assert-er faktisk rapportstatus og partialBasis. | Bestått |
| AC3, BT-1/15 | Formler, totalprisdefinisjon, alle relevante input, registrering/periode/år, faktor 1/12, anvendt årsverdi og kilde/egen forutsetning. D=20 000/måned gir synlig 240 000/år og 600 000 i kontantstrøm. | Bestått |
| AC3, kostnadsinnhold | Felleskostnad 120 000 fordeles D100 000/J20 000; inkludert Forsikring telles ikke på nytt. Oppgitt kostnadsinnhold er del av totalene; F1-tall bevares uten ekstra fratrekk. | Bestått |
| AC4, BT-8 og nullgrense | Likhet og én krone under gir begge 7,000 % i standardvisning; brudd får synlig forklaring, detalj 6,99999375 % og eksakt krav 7 %. −0,01 i kontantstrøm vises med forklaring og uavrundet detalj selv om hovedverdi er 0. | Bestått |
| AC5 | Alle fire summary kan nås i Tab-rekkefølge, åpnes med Enter og lukkes med Space uten ekstra fokusmål. Faktisk Chromium-AX-node DisclosureTriangle har navn og expanded false→true→false; fokus er 2px petrol og innhold skjult/lest korrekt. | Bestått |
| AC5, historisk / ny økt | Endret L gir Utdatert / Må bekreftes på nytt med konkret kontrollbehov, historisk F1-verdi/kilde og lesbare DESIGN-farger. Ny økt har ingen gamle tall eller detaljer. | Bestått |

## Kjøringer

Miljø: Node **24.21.0**, npm **11.19.0**. `PATH=/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:$PATH`. Chromium-cache: `/private/tmp/ibe160-story-3-5-browsers`.

| Kommando | Bevis | Resultat |
|---|---|---|
| `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-3-5-browsers npm run test:components` | [Komponentlogg](story-3-6-komponenter.txt) | 16/16 bestått |
| `npm test -- tests/unit/finance.test.ts tests/unit/thresholds.test.ts tests/unit/financial-presentation.test.ts tests/unit/result-snapshot.test.ts tests/unit/complete-screening.test.ts` | [Målrettet Vitest](story-3-6-malrettet.txt) | 333/333 i fem filer bestått |
| `npm run typecheck` | [Typecheck](story-3-6-typecheck.txt) | Exit 0 |
| `npm run lint` | [Lint](story-3-6-lint.txt) | Exit 0, ny komponentkonfigurasjon inkludert |
| `npm run build` | [Bygg](story-3-6-build.txt) | Exit 0; bare eksisterende buntstørrelsesvarsel |
| `git diff --check` / staged diffkontroll | Utført før lokal commit | Bestått |

Sandkassen avviste først Chromium-start med lokal Mach-port-sperre. Den autoriserte lokale testen ble deretter kjørt utenfor sandkassen. Første testversjon avslørte feil i testoppsettet: manglende reell navigasjon før report-start, ubekreftet endret L når J ble fjernet og upresis selektor for historisk L. Fixturen følger nå eksisterende analyse-/kontrollregler, og fixturestatus verifiseres. Playwrights enkle tekstsnapshot utelater native DisclosureTriangle, så testen leser faktisk AX-expanded via CDP. Ingen finans-, screening-, snapshot- eller bekreftelsesregel ble endret.

## Gjenstående kontroll

Separat uavhengig BMAD-review bestemmer eventuelle funn/rettinger og done. Samlet plassering/zoom/fokusflyt i bygget app er Story 3.7s ansvar; denne storyen oppretter med vilje ingen samlet rute. Komponenttesten er ikke hydrerings- eller samlet appflytbevis. Orkestrator kjører full siste regresjon sekvensielt: `npm test`, `npm run test:components`, `npm run test:e2e`, `npm run typecheck` og `npm run lint` på endelig kode. `test:e2e` inkluderer bygg. Ingen full ny Vitest/E2E-regresjon eller live-/S5-/S6-bevis påstås i denne fasen.

Ingen blocker, ny produkt-/arkitekturbeslutning, push eller implementasjon av Story 3.7+.

## Etter uavhengig review

2026-10-21: Story 3.6 er **done** etter separat [BMAD-review med individuell triage og fasebevis](story-3-6-review.md). Ni patchpunkter er lukket, åtte nye komponentprøver er lagt til, og 24/24 komponentprøver samt 333/333 målrettede Vitest, typecheck/lint og diffkontroll består. Tallene over er opprinnelig egenverifikasjon; reviewrapporten skiller nye resultater fra tidligere bevis. Full sluttregresjon og samlet appflate tas av orkestratoren/senere 3.7-fase.
