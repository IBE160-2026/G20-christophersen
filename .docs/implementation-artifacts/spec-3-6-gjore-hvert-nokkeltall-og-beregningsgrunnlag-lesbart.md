---
title: 'Story 3.6 — Gjøre hvert nøkkeltall og beregningsgrunnlag lesbart'
type: 'feature'
created: '2026-10-21'
status: 'done'
route: 'oneshot'
story_key: '3-6-gjøre-hvert-nøkkeltall-og-beregningsgrunnlag-lesbart'
baseline_commit: 'db45d35cf8eae885b9fb4426b15ab281e227c689'
---

<frozen-after-approval reason="Brukerens eksplisitte mini-sprintbestilling med eksisterende AC og separat uavhengig review">

## Intent

Implementer bare [Story 3.6 AC1–AC5](../planning-artifacts/epics.md#story-36-gjøre-hvert-nøkkeltall-og-beregningsgrunnlag-lesbart): faktiske gjenbrukbare React-komponenter for fire nøkkeltall og deres behovsåpnete beregningsgrunnlag. Autoritet er SPEC CAP-5/resultatdelen av CAP-6, grensekontraktens Finans og screening/Endring og gyldighet, FR-12–FR-14 og nøkkeltallsdelen av FR-18, AD-2/7/9/10 og final DESIGN/EXPERIENCE. Eksisterende 3.1, 3.3 og 3.5 er done og gjenbrukes. Samlet Resultat og anbefalings-/rapportflate tilhører 3.7.

Gitt et konsistent snapshot, når komponentene rendres, skal Bruttoyield, NOI, Nettoyield og Kontantstrøm før skatt vise faktisk verdi/enhet/år fra start i norsk format fra 3.3. Negative resultater bevares. Utilgjengelige tall viser Ikke beregnbart og konkrete berørte inputårsaker/handlinger, aldri null, estimat eller en tidligere verdi. Gitt kritisk utilstrekkelig samlet grunnlag, når gyldige delberegninger vises, skal Delgrunnlag være tydelig uten at rapportfeil, ubekreftet liste eller uavklart TG3 endrer tall/formler. Gitt historisk valgt snapshot, når tallene vises, skal historisk status være lesbar med Utdatert / Må bekreftes på nytt, navngitt endring og kontrollbehov; nytt og gammelt grunnlag blandes ikke. Gitt ingen beregning, når komponenten rendres, skal den ikke vise tidligere tall.

Gitt et beregnbart tall, når merket beregningsgrunnlag åpnes, skal formel, anvendte verdier/enheter/år, registrert verdi/periode, omregningsfaktor/årsverdi, kilde/forutsetning og kostnadsinnhold/D-J-fordeling være lesbare. Kostnadsinnhold er allerede inkludert i totalene og trekkes ikke fra igjen. P inkluderer eventuell fellesgjeld uten kjøpsomkostninger; renter/avdrag hører til J. Bevar opphav og inkluderte kostnadsposter. Gitt avrunding som skjuler yieldbrudd eller negativt beløp, når det berørte tallet leses, skal 3.3s forklaring og presise detaljverdi være tilgjengelig sammen med eksakt krav. Avrundede tall blir aldri ny regelinput.

Gitt lukkede/åpne detaljseksjoner, når de betjenes med tastatur, skal merkede standardkontroller gi lesbar semantisk tilstand, synlig fokus og innhold uten skjulte fokusmål. DESIGNs eksisterende tokens og typografi brukes også for Delgrunnlag og historikk. Ingen ny skjerm, offentlig testrute, navigasjon, finansterskel, backend, analyse, varig lagring eller Story 3.7+ implementeres. Stopp ved ny produkt-/arkitekturbeslutning.

Verifiser direkte komponentgrense med faktiske finans-/presentasjons-/snapshotdata og uavhengige BT-1/3/4/5/6/8/11/15/17/18-forventninger; både innhold og faktisk detaljåpning/lukking, tastatur og tilgjengelig tilstand. Bygg ingen betalt API-avhengighet. Kjør relevante tester og typecheck/lint/build, dokumenter bevis og lag lokal commit uten push. Sett spec in-review og sprintstatus review; separat reviewagent avgjør done. Samlet plassering, zoom og fokusflyt i bygget app kontrolleres i 3.7.

</frozen-after-approval>

## Implementation Notes

- Step01/02: epic-3-context er gyldig; høyeste tidligere done-spec 3.5 er lest med reviewlærdom om konkret oppdatert kontrollbehov. main og kanonisk baseline er kontrollert. Eneste eksisterende usporede fil er aktiv automatisk promptlogg, som holdes utenfor commit. Bruker har autorisert eksisterende main, avgrenset story, sekvensielle subagenter, lokal commit og separat review.
- Ingen intensjonsgap eller irreversible operasjoner. Lite reversibelt fotavtrykk, derfor oneshot: én ny komponentfil med intern detaljkomponent, eksisterende CSS/presentasjonsformatering, én komponenttestfil med hjelpegrunnlag og egen testkonfigurasjon/kommando. Ingen nye produkt-/arkitekturvalg.
- Code Map: `src/frontend/components/FinancialMetrics.tsx` konsumerer `ResultSelection` fra 3.5, og henter alle tall/terskler/detaljer fra samme assessment. `src/presentation/finance.ts` eier eksisterende norske formattering og får en enkel eksport for eksakt desimaltekst i inputdetaljer. `src/frontend/styles.css` har alle DESIGN-tokens og global :focus-visible; utvides med avgrensede metric-/detail-stiler. `tests/components/financial-metrics.spec.ts` bruker React-serverrender og Playwright setContent for faktisk native disclosure uten appserver/testrute. `playwright.components.config.ts`, `package.json` og `tsconfig.e2e.json` registrerer denne testgrensen uten nye avhengigheter. Produksjons-App/state/domain/kontrakter endres ikke.
- Kursgrunnlag: sidehenvist sensoruttrekk og faglærerfeedback om låst smal kjerne, deterministiske formler, uavhengig fasit, etterprøvbar kilde og prosesspor er lest. De begrunner verifikasjon og sporbarhet, ingen nye funksjonskrav.

- Implementert: `FinancialMetrics` mottar én `ResultSelection`; de fire presenterte tallene, terskler og inputdetaljer utledes kun fra dens snapshot. React-komponenten har native details/summary uten egne event-/toggle-regler. Mangler kommer fra domain; normaliserte verdier i en ikke-beregnbar metrikk merkes uttrykkelig ikke anvendt. Historisk status bruker navngitte endringer og kontrollbehov fra 3.5, og historisk innhold holdes lesbart på sekundærflate.
- Egenverifikasjon: **16/16 direkte Chromium-komponentprøver**, **333/333 målrettede Vitest-prøver i fem filer**, typecheck, lint og produksjonsbygg består på pinnet Node 24.21.0/npm 11.19.0. Bygg har bare kjent størrelsesvarsel for eksisterende PDF/app-bunt. Native åpen/lukket, merkede kontrollnavn, Tab/Enter/Space, fokus og historiske tokens er kontrollert. Komponenttesten serverrendrer faktisk React-kode og betjener native kontroller i nettleser; den er ikke et hydrerings-/appflytbevis.
- Førstekontroll: sandkassen blokkerte Chromiums lokale Mach-port, deretter gikk autorisert lokal kjøring utenfor sandkassen. Test-fixtures ble rettet til eksisterende finans-/analysesperre og listekontroll; ingen produksjonsregel ble endret for å gjøre testene grønne. Playwrights tekstsnapshot utelater native DisclosureTriangle; testen leser faktisk AX-expanded via CDP. Se [AC-/testbevis](story-3-6-verifikasjon.md) og [arbeidsøkt](../process/arbeidsokter/2026-10-21-story-3-6.md).
- Checkpoint: **in-review / review**, ikke done. Separat uavhengig BMAD-review er neste fase. Full Vitest og bygget-app/dev-E2E kjøres av orkestrator ved mini-sprintens slutt, sammen med `npm run test:components`; de er ikke påstått nykjørt her. Ingen ny beslutning, blocker, push, ny rute eller implementasjon av 3.7+.

## Review Findings

Uavhengig BMAD-review 2026-10-21: fire sekvensielle lag er fullført uten filendring under lagene. Blind Hunter ga åtte kandidater; Verification Gap ett forhåndsverifisert gap; Acceptance fant ingen sikre AC-avvik ved den direkte komponentgrensen. Edge returnerte `[]`, registrert som tomt lag etter workflowets feilregel. Individuell triage og kildebevis skrives i story-3-6-review.md. Brukerens mini-sprintbestilling autoriserer retting uten ny bekreftelse. Ingen ny produkt-/arkitekturbeslutning.

- [x] [Review][Patch] B1: Fire nøkkeltall i én rad på bred flate, i tråd med eksisterende DESIGN.
- [x] [Review][Patch] B2: Kvalifiser numerisk Ymin når terskelavgjørelsen er utilgjengelig; vis terskelårsaker.
- [x] [Review][Patch] B3: Bevar Ymin-registrering, kilde/forutsetning og bekreftelse i detaljene.
- [x] [Review][Patch] B4: Kostnadsinnhold skal ikke ubetinget påstås gyldig inkludert ved ugyldighet/overskredet total.
- [x] [Review][Patch] B5: Bevar registrert kostnadsbeløp/renter-avdrag også når oppdelingen er ugyldig.
- [x] [Review][Patch] B6: Vis valgt inkludering også når relasjonen er ugyldig.
- [x] [Review][Patch] B7: Håndskrevne konkrete formelforventninger for alle fire kort.
- [x] [Review][Patch] B8: Komponentprøver for kildekonflikt, ubekreftet numerisk input og ugyldig kostnadsinkludering.
- [x] [Review][Patch] V1: Kontroller synlige feltspesifikke rettingshandlinger for utilgjengelige tall.

Rejected: ingen. Ingen decision-needed eller defer.

- Reviewcheckpoint: **done / done**, 2026-10-21. Separat BMAD-review og individuell triage lukket ni patchpunkter; 24/24 komponentprøver, 333/333 målrettede Vitest, typecheck/lint og diffkontroll består. Se [reviewrapport](story-3-6-review.md) med rød/grønn-bevis og avgrensning. Ingen nye beslutninger, åpne/defer-funn, push eller senere story. Full siste regresjon gjenstår hos orkestrator.
