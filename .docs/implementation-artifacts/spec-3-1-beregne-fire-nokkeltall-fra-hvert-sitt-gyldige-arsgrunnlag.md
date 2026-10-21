---
title: 'Story 3.1 — Beregne fire nøkkeltall fra hvert sitt gyldige årsgrunnlag'
type: 'feature'
created: '2026-10-21'
status: 'done'
route: 'oneshot'
story_key: '3-1-beregne-fire-nøkkeltall-fra-hvert-sitt-gyldige-årsgrunnlag'
baseline_commit: 'b143d4ba5e4efe48d040852065f64eda87cdc1cc'
---

<frozen-after-approval reason="Brukerens eksplisitte sekvensielle bestilling av eksisterende Story 3.1 etter ferdig Epic 2">

## Intent

Implementer kun [Story 3.1 AC1–AC6](../planning-artifacts/epics.md#story-31-beregne-fire-nøkkeltall-fra-hvert-sitt-gyldige-årsgrunnlag): fire rene deterministiske finansberegninger, med egen gyldighet, eksakt verdi og etterprøvbart formel-/inputgrunnlag. Autoritet er eksisterende epics, ferdig UX, arkitektur AD-1/AD-7/AD-10, SPEC og grensekontrakt, sprintplan/status og PRD FR-12–FR-14/BT-fasit; krav endres ikke.

Gitt gyldig bekreftet grunnlag, når finansmodulen beregner, skal bruttoyield beholde L/P som teller/nevner, NOI være L−D, nettoyield beholde (L−D)/P og kontantstrøm før skatt være L−D−J. Beløp er NOK/år; yield er forholdstall før senere prosentvisning. Bruk kanoniske desimalstrenger og låst big.js uten Number/parseFloat, divisjon eller mellomavrunding. Negative resultater beholdes. Ingen skatt, ledighet, reparasjon, kjøpsomkostninger eller verdiendring trekkes fra. D og J følger eksisterende kostnadsinnhold uten dobbelttelling.

Gitt månedlige eller blandede kjente års-/månedsinput, når relevante verdier brukes, skal månedsverdiene normaliseres med 12 én gang av eksisterende felles validering. Registrert verdi, bekreftelse, periode/år, faktor, årsverdi, kilde/forutsetning og kostnadsinnhold beholdes. Ukjent/ustøttet periode, uforenlige relevante år, ugyldig/ubekreftet verdi eller uløst kildekonflikt skal gi konkrete årsaker ved berørte nøkkeltall.

Gitt mangler, når hvert tall vurderes, skal avhengighetene være P/L, L/D, P/L/D og L/D/J. Manglende L hindrer alle; J bare kontantstrøm; Ymin ingen. P=0 hindrer yield uten divisjon og beholder gyldig NOI/kontantstrøm. Blank er aldri 0; eksplisitt bekreftet J=0 er gyldig, ubekreftet 0 er utilstrekkelig. Alle kjente relevante årsaker følger ikke-beregnbare resultater uten gammelt tall eller estimat.

Gitt samme finansgrunnlag, når beregning gjentas, skal resultat og inputgrunnlag være identiske og input umodifisert uavhengig av rapportutfall, live/demo eller TG3-status. Finans har ingen slik input, teknisk tilstrekkelighetsvurdering eller anbefaling.

Lever bare ren domain/finance og nødvendige delte kontrakter/tester. Ingen React, Express, PDF, I/O, nettverk, KI, terskler, presentasjonsformat, snapshot, screening eller resultatflate. Test uavhengig F1/F2/F3/F4, beregningsdelene av BT-1–BT-11/BT-14–BT-18, alle avhengigheter, blank/null/konflikt/bekreftelse, perioder/år og presise desimaler. Sett in-review/review etter relevante tester og lokal commit; hovedagenten starter deretter separat uavhengig BMAD-review før done. Ingen push og ingen 3.2/3.3 i denne agenten.

</frozen-after-approval>

## Implementation Notes

- Readiness: Epic 2 og 2.1–2.11 er done med separat review, og hovedagenten har verifisert full regresjon etter Epic 2-done: 582 unit, 89 bygget-app, 3 dev-E2E, type/lint/build. 1.4/1.5/1.7 done; ingen port blokkerer 3.1. Baseline over er lest direkte fra Git. Pågående promptlogg er brukerautorisert og holdes utenfor commit. Ingen intensjonsgap, irreversible handlinger eller nye produkt-/arkitekturvalg; liten reversibel modulstory bruker oneshot. Brukerens bestilling overstyrer workflowens integrerte review/done: stopp ved review-checkpoint for separat reviewer.
- Code Map/oppgaver: `src/domain/validation.ts` og `financial-basis.ts` gjenbrukes med valgfrie relevante årsfelt (standard L/D/J uendret), slik at årssammenlikning fortsatt har én autoritet og ikke smitter uavhengige nøkkeltall. `src/contracts/finance.ts` definerer tilgjengelig/ikke-beregnbart, eksakte beløp/yieldgrunnlag og kontrollmetadata. `src/domain/finance.ts` beregner de fire tallene kun fra egen delmengde av felles validering. `tests/unit/finance.test.ts` gir uavhengig fasit. Domain-README og egne prosess-/bevisfiler dokumenterer grensen. App/state/backend/låste planer endres ikke.
- Design: hvert nøkkeltall har formel, enhet, relevante registrerte/validerte input og normalisering, år, kilde og nødvendig kostnadsinnhold. Yield lagrer bare teller/nevner; senere presentasjon eier divisjon. Ymin utelates fra de fire inputgrunnlagene. Valideringsfeil for relevante felt samles i stabil avhengighetsrekkefølge. Feil runtime-struktur (f.eks. null råverdi) er fortsatt en kontraktfeil, ikke automatisk null eller feltverdi.
- Undersøkelsen omfattet epics, SPEC/grensekontrakt, final arkitektur, kompilert epickontekst, PRD FR-12–FR-14 og addendumets BT-fasit, eksisterende felles schemas/validering og tidligere valideringsspec/review, sprintplan/status, sensorveiledningens lagrede direkte PDFKit-kildeuttrekk og faglærerens tilbakemelding. Krav–kode–testspor og vanlig deterministisk finans med kjente fasitsvar følges. Ingen ny kurskravtolkning.
- Implementert og egenverifisert: 64 nye finansprøver, 147/147 målrettede validerings-/finanstester og full 646/646 Vitest. Typecheck/lint/build, 89/89 bygget-app og 3/3 dev-E2E består. Første ueskalerte fulltest fikk bare miljøets loopback-EPERM; identisk eskalert kjøring var grønn uten kodeendring. Testløp ble kjørt sekvensielt. Se [AC-/sluttbevis](story-3-1-verifikasjon.md), [Vitest-rålogg](story-3-1-kontroller.txt) og [build/E2E-rålogg](story-3-1-e2e-kontroller.txt).
- Sluttstatus er in-review/review; Epic 2 done og Epic 3 in-progress. Integrerte reviewlag/done hoppes over etter brukerens eksplisitte fasekrav om separat uavhengig reviewer. Ingen blocker, ny beslutning eller senere story er startet; lokal implementeringscommit overleveres hovedagenten, uten push.

## Independent Review — done

Full separat [BMAD-review](story-3-1-review.md) av implementeringscommit
`99d47837d8597f67317bee1c7c7581caaddf60d7` er bestått 2026-10-21. Alle fire lag
ble kjørt sekvensielt; AC1–AC6 er kontrollert mot faktisk kode. Ingen
produksjonsfeil eller ny produkt-/arkitekturbeslutning. Ett direkte testhull
er rettet: hele upåvirkede metrikkobjekter sammenliknes. Tre egne negative/
presisjonsprøver kontrollerer samtidige J-feil, P/J/Ymin-isolasjon og eksakt
negativ årsverdi utover 20 desimaler. Åtte hypotetiske kandidater er avvist med
separat begrunnelse i rapporten; ingen åpne/defererte funn.

Sluttregresjon etter testretting: 150/150 målrettet, 649/649 full Vitest,
89/89 bygget-app, 3/3 dev-E2E samt typecheck/lint/build og diff-whitespace grønt.
Story 3.1 er **done**, Epic 2 fortsatt done, Epic 3 in-progress.
3.2–3.9 er backlog. Neste tillatte steg i brukerens kjede er en ny
implementeringsagent for bare 3.2 og deretter en separat reviewer; stopp før
3.3. Ingen UI/terskler/format/screening er implementert av 3.1-review.
