---
title: 'Story 3.3 — Formatere nøkkeltall uten å skjule økonomiske brudd'
type: 'feature'
created: '2026-10-21'
status: 'in-review'
route: 'oneshot'
story_key: '3-3-formatere-nøkkeltall-uten-å-skjule-økonomiske-brudd'
baseline_commit: 'c3c2214db47fe6b76459c8d6a2413b976131cc49'
---

<frozen-after-approval reason="Brukerens uttrykkelige bestilling av Story 3.3, separat review og deretter Story 3.4 med sekvensielle subagenter">

## Intent

Lever bare [Story 3.3 AC1–AC4](../planning-artifacts/epics.md#story-33-formatere-nøkkeltall-uten-å-skjule-økonomiske-brudd): rene presentasjonsfunksjoner for de fire eksisterende nøkkeltallene, enheter, år og nødvendig terskeldetalj. Autoritet er eksisterende epics/AC, Epic 3-kontekst, SPEC CAP-5/CAP-6 og grensekontrakt, final UX DESIGNs tallformat og EXPERIENCE metric-grid/recommendation, AD-7/9/10, PRD-addendums BT-fasit og sprintplan/status. Ingen krav endres.

Gitt tilgjengelig eksakt metrikkgrunnlag, når normalvisning bygges, skal norske tusenskiller/desimalkomma, hele NOK per år og yield i prosent med tre desimaler brukes. Negative verdier beholder sin betydning. Navn, enhet og relevant år følger tallet. Gitt F1/F2, når presentasjonen bygges, skal den stemme med uavhengig fasit (blant annet 11,875 %, 1 500 000 kr/år, 9,375 %, 700 000 kr/år for F1). Gitt blandet kjent måned/år i BT-15, skal normalisert årsgrunnlag og registrering/faktor fortsatt følge presentasjonen.

Gitt nettoyield 6,99999375 % mot 7 %, eller negativ kontantstrøm som avrundes til null, når det eksisterende terskelutfallet er brutt og vanlig visning skjuler forskjellen, skal nødvendig ekstra presisjon og en konkret forklaring gjøre bruddet synlig. Uavrundet regelgrunnlag gjelder; synlig 7,000 % eller 0 kr beviser ikke bestått. Gitt enda mindre desimalbrudd, skal detaljpresisjonen utvides til forskjellen kan leses, uten en ny regelmargin. Negativt NOI som avrundes til null skal også beholde negativ betydning i detalj/forklaring. Divisjon og avrunding bruker låst big.js; ingen hjemmelaget brøkaritmetikk eller flyttallskonvertering av finansverdier.

Gitt ikke-beregnbart tall, når presentasjonen bygges, skal det ha Ikke beregnbart, egne eksisterende årsaker og ingen tallverdi, estimat eller gammelt tall. Gitt kjent delgrunnlag fra kalleren, skal Delgrunnlag bevares uten at formatteren velger inputgyldighet eller anbefaling. Gitt gjentatt formatering eller automatisk utvidet detaljpresisjon, skal eksakte finansverdier og ekte terskelavgjørelser forbli identiske, uten inputmutasjon eller retur av lokaliserte tall til reglene.

Test faktisk norsk format, F1/F2, negative BT-11, BT-8/9, BT-15, BT-3/5/6 og svært små desimaler med uavhengige forventninger. Integrasjon skal bruke de ekte finans-/terskelfunksjonene før og etter formatering. Ingen UI, komplett screening (3.4), snapshot (3.5), resultatkomponent (3.6/3.7), live eller nye formler. Stopp ved ny produkt-/arkitekturbeslutning. Kjør relevante tester/typecheck/lint og regresjon, lag lokal implementeringscommit og stopp ved in-review/review til en ny uavhengig BMAD-reviewagent overtar. Ingen push.

</frozen-after-approval>

## Implementation Notes

- Readiness: 3.1/3.2 og Epic 2 er done; deres relevante moduler og tidligere reviewbevis er lest. Ingen intensjonsgap, irreversible handlinger eller nye produkt-/arkitekturvalg. Liten reversibel modulstory følger oneshot. Brukerens fasebestilling overstyrer integrert review/done; separat ny reviewer overtar.
- Code Map/oppgaver: `src/presentation/finance.ts` formaterer eksisterende FinancialMetric og terskelobjekter med isolert big.js-konstruktør. `src/contracts/presentation.ts` eier delt presentasjonskontrakt og gjenbruker finans-/terskelskjemaer. `tests/unit/financial-presentation.test.ts` kontrollerer AC/fasit/isolasjonsgrenser. `tsconfig.app.json` inkluderer den allerede arkitekturbestemte presentation-mappen. Egen modul-README forklarer enveisgrensen. Verifikasjon/arbeidsøkt og sprintstatus oppdateres; app/state/backend/låste planer endres ikke.
- Implementeringsvalg: formatterinput tar bruttoyield/NOI fra 3.1 og nettoyield/kontantstrøm med sitt eget metrikkgrunnlag fra 3.2, slik at terskel og presentert verdi ikke kan blandes fra to separate metrikker. Kalleren oppgir kjent delgrunnlag; formatteren utleder ingen mangel-/screeningregel. Eksakt grunnlag klones til utdata. Normalavrunding er big.js roundHalfUp, negativ null vises som null med konkret negativ detalj når relevant. Yielddetalj starter på åtte desimaler og utvides automatisk ved skjult brudd; beløpsdetalj bevarer alle eksakte desimaler. Gjentakende yielddesimal merkes tilnærmet og beholder eksakt teller/nevner.
- Kurs-/feedback-kontroll: faglærertilbakemeldingen og eksisterende sidehenviste kursuttrekk er lest. Orkestratoren har dessuten kontrollert alle sju sensor-PDF-sider direkte med macOS PDFKit i denne økten. Sporbar plan–kode, avgrensede commits, meningsfulle fasittester og separat dokumentert review videreføres uten nye kurskrav.
- Implementert og egenverifisert: 36 nye presentasjonstester; 186/186 målrettede og 768/768 full Vitest. Typecheck/lint er grønt på endelig kode. Build, 89/89 bygget-app og 3/3 dev-E2E består før siste additive metadataendring uten UI-konsument. Den presiseringen bevarer også opprinnelig Ymin/kilde; full Vitest/typecheck/lint ble kjørt igjen etterpå. Første kjørings tre testoppsett-/forventningsfeil er rettet mot eksisterende autoritet, uten endring av finansregler. Se [AC-/testbevis](story-3-3-verifikasjon.md), [Vitest-rålogg](story-3-3-kontroller.txt) og [E2E-rålogg](story-3-3-e2e-kontroller.txt).
- Implementeringscheckpoint: **in-review/review** med lokal implementeringscommit. Integrert review/done er uttrykkelig utsatt til en ny uavhengig BMAD-reviewagent etter brukerens sekvensielle bestilling. 3.4–3.9 er fortsatt backlog. Ingen ny beslutning, blocker, endret port eller push.
