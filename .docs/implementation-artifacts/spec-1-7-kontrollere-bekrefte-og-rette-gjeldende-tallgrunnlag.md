---
title: 'Story 1.7 — Kontrollere, bekrefte og rette gjeldende tallgrunnlag'
type: 'feature'
created: '2026-10-19'
status: 'done'
route: 'oneshot'
story_key: '1-7-kontrollere-bekrefte-og-rette-gjeldende-tallgrunnlag'
baseline_commit: '6a3d8d361f5a738e35e1a00ccccaf185a72ad6f8'
---

<frozen-after-approval reason="Brukerbestilt Fase 2 innen godkjent Story 1.7, uten endring av låst kravgrunnlag">

## Intent

Implementer bare Story 1.7 AC1–AC6 og testkrav i godkjente epics. Gitt registrert grunnlag, når brukeren kontrollerer det, skal råverdier, enheter, perioder/år, faktor/årsverdier, kilder/forutsetninger og kostnadsinnhold være tilgjengelige uten automatisk bekreftelse. Gitt ugyldig eller manglende grunnlag, konflikt, periodeproblem eller ubekreftet null, når brukeren forsøker å bekrefte, skal konkrete feltfeil og lokale kodebaserte blokkere med nødvendig handling vises, input bevares og første berørte felt få fokus. Gjenbruk 1.4/1.5-valideringen og 1.6s mangelfunksjon.

Gitt gyldig kontrollert grunnlag, når brukeren eksplisitt bekrefter gjeldende tall og eventuelle nullverdier, skal bekreftelsen gjelde de faktiske verdiene med relevant periode/år/kilde/kostnadsgrunnlag. J=0 ved kontantkjøp er gyldig etter eksplisitt nullkontroll. Åpne neste trinn uten analyse. Gitt bekreftet grunnlag, når relevant innhold faktisk endres, skal berørte bekreftelser oppheves og endringsbehov vises. Uendret verdi og navigasjon opphever ingen kontrollstatus eller grunnlagsrevisjon. Gitt tilgjengelig neste trinn, når brukeren går frem/tilbake, skal samme frontendøkt bevare input/kontekst/bekreftelser. Oppdatering/lukking avslutter økten uten varig lagring eller KI-kall.

Gitt kjernehandlingene, når de brukes med tastatur eller zoom, skal semantiske etiketter/enheter/kilder/feil, synlig fokus, fokus på trinnoverskrift ved navigasjon og korte statuskunngjøringer følge final UX. Sticky stepper skal ikke dekke fokusert innhold; kontrast følger DESIGN. Test F1, F3 med manglende L, ugyldig P, L-konflikt, ulike år, ubekreftet/bekreftet J=0, retting og ny bekreftelse i bygget app. Ingen økonomiske nøkkeltall/terskler, rapportanalyse/HTTP/PDF eller resultatsnapshot. Ingen nye produkt-/arkitekturavgjørelser. Lever in-review/review og lokal commit til ny reviewer i Fase 3; integrert review/done utføres ikke her.

</frozen-after-approval>

## Implementation Notes

- Build-skill rendret én gang; workflow/step-01/step-02/template/oneshot/sprint-sync lest. Brukerens sekvensielle faser overstyrer integrert review og generisk godkjenning av allerede bestilt arbeid. Ingen underagenter eller parallell filskriving.
- Undersøkt: låst Story 1.7/tilstøtende grenser, sprintplan/status/readiness, Epic 1-kontekst og forrige done-spec; relevante final UX financial-confirmation/Interaction Primitives, AD-1/2/7/8/9/10, SPEC/grensekontrakter og kurs-/faglærergrunnlag. Ingen kjent intent-gap eller irreversibel handling; R2/R3/R1/R4 berører senere stories.
- Kodemap: `src/frontend/state/session.ts` utvider eksisterende reducer med eksplisitt nullkontroll, atomisk gyldig tallbekreftelse, berørt ugyldiggjøring, revisjon og to tilgjengelige trinn. `src/frontend/App.tsx` åpner neste trinn og fokuserer overskrift uten analyse. `src/frontend/screens/FinancialInput.tsx` viser normalisering/kontroll/feil og bruker eksisterende `validateFinancialBasis` og `evaluateKnownDeficiencies`. `FinancialBasisInput.tsx` gjenbrukes for kilder/kostnader og får tilknyttede bekreftelsesfeil. Eksisterende CSS-tokens/øktarkitektur/kontrakter beholdes; råkontrakten fra 1.3 er fortsatt rå og ubekreftet, mens aktiv økt bruker eksisterende registrert kontrakt. Ingen avhengigheter tilføyes.
- Verifikasjon: selvstendige reducer-tester for hver relevant endring og identisk retur; bygget-app-test av alle obligatoriske scenarioer og nettverksfravær; full Vitest, typecheck/lint/build og demo/dev-E2E. Faktisk tastatur/zoom/visuell/kontrastkontroll dokumenteres separat. Låste 101 filhasher kontrolleres mot mini-sprintbaseline.

- Implementert innen de seks AC. Egne sluttkontroller: 177/177 Vitest (49 nye reducer-tester), typecheck/lint/build, 38/38 demo-E2E (11 nye) og 2/2 dev-E2E. Faktisk CUA/Chrome-kontroll ved 100/200/400 % zoom og inspeksjon av bygget-app-bilder gjennomført. Kontrast målt: handling 6,70, feil 7,10, lokal mangeltekst 11,60, kontrollgrense 3,81, fokus 6,70.
- Egenverifikasjonen rettet en konkret fokusklipping for ny bekreftelsesknapp på 320/360×160; knappen bruker nå 36 px eksisterende geometri. Full dependency-liste/forsøksvakt hindrer fokusflytting ved løpende retting og tilfredsstiller lint. Kildekonflikt fokuserer faktisk konfliktverdi; manglende kildebeskrivelse fokuserer beskrivelsesfelt. 101/101 låste filer uendret. README gjenspeiler gjeldende leveranse.
- [AC-/test-/manuelt bevis](story-1-7-verifikasjon.md) og [råutdata](story-1-7-kontroller.txt). Ingen integrert review eller done; brukerens separate Fase 3 gjenstår. Ingen senere story startet, ingen blocker eller produkt-/arkitekturavgjørelse.

### Review Findings — Fase 3, 2026-10-19

Uavhengig full BMAD-review med fire sekvensielle lesende underreviewere er bestått etter fem patchgrupper. [Individuell triage, AC og egne tester](story-1-7-review.md), [råkontroller](story-1-7-review-kontroller.txt). Ingen decision-needed/defer eller uløste high/medium-funn. Alle seks AC består; story og Epic 1 er done. Fase 2-notatene over bevarer historisk egenverifikasjon før denne reviewen.

- [x] [Review][Patch] D-periode/år opphever også J-bekreftelsen når kostnadsposter deler D-kontekst (`session.ts`). B1/E1/A1, medium; to nye reducer-regresjoner.
- [x] [Review][Patch] Kostnadsfeil fokuserer faktisk berørt navn/beløp/rentedel/inkludering (`FinancialInput.tsx`). B2/A2, medium; tre nye bygget-app-forløp.
- [x] [Review][Patch] Manglende kildemetadata feilmarkerer bare berørte kildekontroller (`FinancialBasisInput.tsx`). B3, low; bygget-app-regresjon.
- [x] [Review][Patch] Ubekreftet nullcheckbox har tilknyttet ugyldigstatus (`FinancialInput.tsx`). B4, low; bygget-app-regresjon.
- [x] [Review][Patch] Tilbaketrukket bekreftet J=0 prøves i reducer og bygget app, med sperre/ny kontroll/ny bekreftelse. V1, medium verifikasjonsgap; ingen funksjonsfeil i eksisterende tilbaketrekkingsgren.

#### Rejected

- B5, false: Nullkontroll er kontrollstatus, ikke endret rågrunnlag. Tilbaketrekking viser Ubekreftet og kort ny bekreftelseshandling, opphever bekreftelse og sperrer trinn 2. Ny reducer-/E2E-regresjon verifiserer dette. Ingen AC krever at uendret rågrunnlag merkes Endret.
- B6, false: Etter retting av siste feil viser eksisterende status fortsatt Tallgrunnlaget er ubekreftet / Kontroller feltene og bekreft på nytt, og neste trinn er sperret. Kandidatens feilfrihet setter ingen faktisk bekreftelse. Påstanden om skjult nødvendig kontroll motsies av status og eksisterende eksplisitt handling.
