---
title: 'Story 3.5 — Binde resultat til revisjoner og gjøre tidligere resultat historisk'
type: 'feature'
created: '2026-10-21'
status: 'done'
route: 'oneshot'
story_key: '3-5-binde-resultat-til-revisjoner-og-gjøre-tidligere-resultat-hi'
baseline_commit: 'c2faf8f597299210b98b5f8b7d445684dbf232c3'
---

<frozen-after-approval reason="Brukerens eksplisitte bestilling av bare Story 3.5 med eksisterende AC og stopp før review">

## Intent

Implementer kun [Story 3.5 AC1–AC6](../planning-artifacts/epics.md#story-35-binde-resultat-til-revisjoner-og-gjøre-tidligere-resultat-historisk). Autoritet: SPEC CAP-7, Screening og snapshot og hele Endring og gyldighet i grensekontrakten, AD-1/2/4/8/10, UX stale-result og Key Flow 3, eksisterende kontrakter og sprintstatus. Ingen produktregler endres.

Gitt beregning fra aktiv vurdering, når siste snapshot opprettes/leses, skal tall, anbefaling, ordnede utløsere og tilgjengelig kontrollgrunnlag gjelde samme objekt i frontendøkten og samme finans-, liste-, TG3- og rapportrevisjoner. Gjeldende-status krever samsvar med aktivt grunnlag og bekreftelser. Senere mutasjon skal ikke endre historisk innhold eller provenance.

Gitt et snapshot, når finansverdi, relevant periode/år/kilde/kostnadsinnhold faktisk endres, korrigering brukes, funn avvises eller rapport erstattes, skal resultatet straks være historisk med navngitt endring og konkret kontroll-/bekreftelses-/analysebehov. Eksisterende Epic 1/2-handlinger eier berørte bekreftelser. Når separat TG3-status/begrunnelse/grunnlag endres, skal resultatet straks være historisk; uendrede finans-/listebekreftelser og uttrekk bevares, og ny vurdering bruker eksisterende FR-5-validering/binding.

Gitt uendret grunnlag, når brukeren navigerer, bytter funn, redigerer bare korrigeringsutkast eller avbryter, skal gjeldende revisjoner/bekreftelser og snapshotgyldighet bevares. Utkast skal være separat, ubrukt og mulig å opplyse om; Avbryt beholder tidligere gjeldende versjon.

Gitt historisk resultat, når ny kodevurdering produserer snapshot etter relevant kontroll, skal det være bundet til nytt grunnlag og bare ha beregnbare tall og korrekt prioritet også ved fortsatt mangel. Gammel/sen analyse og ukontrollert ny rapport kan ikke gjenopplive gammel komplett anbefaling. Gitt ny frontendøkt, når resultat leses, skal det være Ikke beregnet uten tall/anbefaling. Bare siste snapshot i aktiv vurdering håndteres; ingen varig historikk.

Test hele endringsmatrisen med faktisk produsert F1-snapshot, AT-16, RT-3/11–15 og grunnlag for BT-12/13. Kontroller historisk innhold, revisjoner, relevante/uendrede bekreftelser, navngitte oppdateringsbehov, ny korrekt vurdering og mangler. Ingen Story 3.6+, UI-komponenter, ny navigasjon, I/O, database, ny bekreftelsesflyt eller live. Stopp ved ny produkt-/arkitekturbeslutning. Kjør relevante tester, sett spec in-review og sprintstatus review, lag lokal commit, ikke push og ikke start review.

</frozen-after-approval>

## Implementation Notes

- Readiness: alle avhengigheter er done, seneste 3.4-spec er lest. main og baseline er i samsvar med tidligere storyarbeid. Eneste eksisterende uversjonerte fil er denne øktens automatisk opprettede promptlogg; den holdes utenfor staging. Arbeidet er lite og reversibelt, uten nye intensjonsgap eller produkt-/arkitekturvalg.
- Code Map: `src/frontend/state/session.ts` eier siste snapshot og rene resultat-/endringsoverganger; eksisterende finans- og rapportreducere gjenbrukes. `src/frontend/state/result.ts` samler binding, snapshotproduksjon fra `evaluateScreening`, historisk selektor og navngitte endringsbehov. `src/contracts/result.ts` eier delte resultattyper. `src/frontend/state/report.ts` eksponerer eksisterende grunnlagsprojeksjon for gjenbruk. `tests/unit/result-snapshot.test.ts` tester reelle reducerhandlinger og uavhengig F1-fasit. Autoritative planer og eksisterende UI/backend/domain/presentasjon endres ikke.
- Design: rapportbinding inkluderer generasjon og hash/navn/request/status, ikke bare tellere som nullstilles ved rapportbytte. Bekreftelser inngår også: eksisterende tilbaketrekking av nullkontroll øker ikke financialRevision. Historiske endringsårsaker beholdes fram til ny eksplisitt kodevurdering; reversering av verdier eller bekreftelser gjenoppliver ikke automatisk gammelt resultat. Ingen ekstra objektmodell innføres; én aktiv økt representerer eksisterende ene objekt.
- Prosess: bmad-build step01/02 fulgt; delegert lesende testundersøkelse er fullført. Kursveiledningens sidehenviste uttrekk og faktisk faglærerfeedback er brukt for avgrensning, testfasit og plan–kode–prosess-spor. Brukerens stopp før review overstyrer workflowens integrerte review/done-del.

- Implementert: delte resultattyper, gjenbrukt rapportgrunnlagsprojeksjon, ren synkron snapshotproduksjon og reducer-/selektorvern. Utkast og feilvisning tas ikke med som anvendt screeninggrunnlag; ubrukt utkast opplyses separat. Snapshotet er isolert og dypt fryst. Finans-, funn-/listebekreftelser og rapportidentitet/status inngår sammen med eksisterende revisjoner. Navngitte endringsbehov er separate og opphever ikke uendrede bekreftelser. D-periode/-år med kostnadsposter navngir behov for både D- og J-kontroll.
- Egenverifikasjon: 57 nye snapshotprøver, typecheck/lint og 89 bygget-app + 3 dev-E2E bestått på Node 24.21.0/npm 11.19.0. Første mutasjonsprøve ble rettet mot eksisterende immutabel original. Sandkassens lokale serversperre og manglende Playwright-versjon ble håndtert med lokal testtillatelse og midlertidig nettleser. Første brede Vitest ga 909/910; eksisterende cleanup-prøve traff tidsfristen ved samtidig E2E. Isolert etterkontroll består, sluttregresjon kjøres uten samtidig E2E. Se verifikasjonsnotatet for endelig resultat. Ingen produksjonsendring utenfor Story 3.5.

- Sluttkontroll: **910/910 Vitest i 27 filer**, **57/57 nye snapshotprøver**, **89/89 bygget-app + 3/3 dev-E2E**, build/typecheck/lint og diffkontroll bestått. Sluttregresjonen uten samtidig E2E bekrefter at cleanup-prøven består uten endring av gammel test/produksjonskode. [AC-/testbevis](story-3-5-verifikasjon.md), [sluttregresjon](story-3-5-regresjon-slutt.txt), [arbeidsøkt](../process/arbeidsokter/2026-10-21-story-3-5.md). Status er in-review/review; ingen review, push eller videre story. Ingen blockers.


## Review Findings

Uavhengig BMAD-review med fire sekvensielle reviewlag er fullført.
Alle elleve kandidater er triagert individuelt i [reviewrapporten](story-3-5-review.md).
Ingen produkt-/arkitekturbeslutning eller endring av autoritativt kravgrunnlag.

- [x] [Review][Patch] G1: Historisk finansendring skal etter vellykket ny bekreftelse be om ny beregning, mens navngitt endringsårsak beholdes.
- [x] [Review][Patch] G2: Lukk verifikasjonshull for D-periode/-år med kostnad og navngitt D/J-behov, omberegning med aktivt utkast, faktisk omordning av kontroller og full ny rapportkontroll.

### Rejected

- B1 — false: Avvist funns utkast bevares eksplisitt som historikk etter Story 2.9-review; det er fortsatt ubrukt og skal ikke slettes eller kunne reaktivere funnet.
- B2 — low: Mutasjon av selektorens endringsmetadata har ingen nåværende appkaller; beskyttelse av all mutable session-state ville legge til defensive grener for håndmutert state.
- B3 — low: Snapshot fryses dypt i runtime og negative mutasjonsprøver består. Ingen konsument skriver til snapshot; rekursive readonly-typer vil kreve bredere kontrakt-/konsumertilpasning uten demonstrert brukerfeil.
- B4 — low: Direkte mutasjon av aktiv state omgår den autoritative reduceren. Den beviste produksjonsflyten oppdaterer binding ved hver relevant handling; mutasjonsprøvens mål er isolasjon av historisk kopi.
- B7 — low: Samme-generasjon completed→error→vellykket ny analyse krever håndlagde handlinger; ReportClient sender ikke feil etter fullført svar og backend sperrer nytt adapterkall for samme økt/rapport. Ingen nåbar gjenoppliving er vist.


Checkpoint etter review: **done**. G1 og G2 er lukket. Fem nye reviewerprøver
og forsterket AT16 gir **62 snapshotprøver**, **300/300 målrettede tester i åtte filer**,
typecheck/lint og diffkontroll bestått på pinnet Node24/npm. Én konkret rød
produksjonsreproduksjon ble grønn etter retting. Full Vitest/build/bygget-app/dev-E2E
kjøres av orkestratoren sekvensielt ved mini-sprintens slutt; tidligere implementerings-
regresjon er ikke påstått nykjørt her. [Bevis og individuell triage](story-3-5-review.md).
Ingen åpne funn, ny beslutning, push eller implementasjon av Story 3.6+ i denne fasen.
