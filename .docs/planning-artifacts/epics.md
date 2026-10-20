---
title: "Epics og stories: Property Acquisition Agent"
status: complete
created: 2026-10-15
updated: 2026-10-16
workflow: bmad-create-epics-and-stories
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories, step-04-final-validation]
currentStep: complete
extractionStatus: confirmed
epicDesignStatus: approved-and-locked
elicitationStatus: applied-and-closed
storyCreationStatus: all-stories-approved
finalValidationStatus: coverage-and-structure-pass
implementationReadinessStatus: CONCERNS
readinessReport: .docs/planning-artifacts/implementation-readiness.md
workflowCompletionStatus: complete
workflowCompleted: 2026-10-16
currentEpic: 5
approvedStoryCount: 37
approvedStoryEpics: [1, 2, 3, 4, 5]
inputDocuments:
  - .docs/planning-artifacts/briefs/brief-IBE160-2026-09-15/brief.md
  - .docs/planning-artifacts/briefs/brief-IBE160-2026-09-15/addendum.md
  - .docs/planning-artifacts/briefs/brief-IBE160-2026-09-15/revisjonskontroll-2026-10-08.md
  - .docs/planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md
  - .docs/planning-artifacts/prds/prd-IBE160-2026-10-10/prd.md
  - .docs/planning-artifacts/prds/prd-IBE160-2026-10-10/addendum.md
  - .docs/planning-artifacts/ux-designs/ux-IBE160-2026-10-13/DESIGN.md
  - .docs/planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md
  - .docs/planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md
  - .docs/specs/spec-IBE160/SPEC.md
  - .docs/specs/spec-IBE160/grensekontrakter.md
  - .docs/specs/spec-IBE160/sporbarhet.md
  - .docs/specs/spec-IBE160/verifikasjon-og-avklaringer.md
  - .docs/reference/course/Sensorveiledning-IBE160-Del-1.pdf
---

# Property Acquisition Agent — Epic Breakdown

## Overview

Kravuttaket og den reviderte fem-epic-strukturen er bekreftet av Mads med C. Strukturen er låst med de godkjente forbedringene og presiseringen av faktisk live KI-analyse i v1. Mads har godkjent alle 37 stories: 1.1–1.7, 2.1–2.11, 3.1–3.9, 4.1–4.5 og 5.1–5.5. Alle er innarbeidet nedenfor med 188 akseptansekriterier. Avsluttende deknings-/strukturvalidering er bestått; implementation readiness er CONCERNS med dokumenterte gjennomføringsporter før berørte stories. [Kontrollrapporten](implementation-readiness.md) viser kravdekning, avhengigheter og åpne avklaringer. BMAD-workflowen er avsluttet etter Mads’ terminale C-godkjenning 2026-10-16; readiness-forbeholdene og gjennomføringsportene gjelder fortsatt. Ingen produktimplementering er startet.

Det oppgitte grunnlaget behandles som låst. Uttaket nedenfor er en indeks til hele kildenes akseptansekriterier og kontrakter; forkortelsene erstatter ikke fullteksten. UX-DR og AR er lokale planleggingsreferanser til eksisterende beslutninger, ikke nye produktkrav. Ingen krav, finansregler, anbefalingslogikk, UX-beslutninger, arkitekturvalg eller grensekontrakter endres uten avklaring med Mads.

### Kildeautoritet og henvisninger

| Kortnavn | Autoritativ kilde og bruk |
|---|---|
| Brief | [Product Brief](briefs/brief-IBE160-2026-09-15/brief.md) og [addendum](briefs/brief-IBE160-2026-09-15/addendum.md): smal v1, finans, F1–F4 og utelatelser. |
| PRD | [PRD](prds/prd-IBE160-2026-10-10/prd.md): UJ-1, FR-1–FR-18, NFR-1–NFR-5, S1–S6 og K1–K3, med samtlige akseptansekriterier. |
| Testfasit | [PRD-addendum](prds/prd-IBE160-2026-10-10/addendum.md): sju FR-5-eksempler, RT-1–RT-19, BT-1–BT-18, AT-1–AT-20, TT-1–TT-9 og full S5-protokoll. Dette er kravfasit, ikke kjørte tester. |
| UX | [DESIGN](ux-designs/ux-IBE160-2026-10-13/DESIGN.md) og [EXPERIENCE](ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md), begge final og oppdatert 2026-10-14: tokens, 26 komponentpar, fire flater, tilstander og fire Key Flows. |
| Arkitektur | [ARCHITECTURE-SPINE](architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md), final, oppdatert 2026-10-15: AD-1–AD-10, startstakk, struktur, grenser og Deferred. |
| SPEC | [SPEC](../specs/spec-IBE160/SPEC.md) med [grensekontrakter](../specs/spec-IBE160/grensekontrakter.md), [sporbarhet](../specs/spec-IBE160/sporbarhet.md) og [verifikasjon/avklaringer](../specs/spec-IBE160/verifikasjon-og-avklaringer.md). Alle adopterte kompanjonger gjelder. |
| Faglærer | [Tilbakemelding 2026-10-06](briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md), lest med [gjeldende oppfølging 2026-10-08](briefs/brief-IBE160-2026-09-15/revisjonskontroll-2026-10-08.md). Historisk kritikk av bredt MVP gjeninnfører ikke utelatte funksjoner. |
| Sensor | [Sensorveiledning, del 1](../reference/course/Sensorveiledning-IBE160-Del-1.pdf), side 1–7: prosess-/plan–kode-spor, kvalitetssikring, UX, arkitektur, README/kjørbarhet og reporyddighet. Eksemplene gir ingen nye produktfunksjoner. |

PRDs alle eksplisitte TG2/TG3 konkretiserer eldre brieftekst. Final UX krever innebygd original-PDF og automatisk sidenavigasjon selv om PRDs minimum er enklere originaltilgang. Fire skjermtrinn realiserer tre faglige pipelinesteg. Final arkitektur avgjør UX-tekstens historiske «stakk ikke valgt». Dette er allerede avstemt i SPEC, ikke nye valg her.

### Låst scope og arbeidsavgrensning

Én lokal desktop-webapp, ett manuelt registrert boligutleieobjekt om gangen, P/L/D/J/Ymin, én tekstbasert PDF-tilstandsrapport på høyst 30 sider, alle eksplisitte TG2/TG3, menneskelig kontroll og separat TG3-avklaring, fire kodeberegnede nøkkeltall og én regelstyrt screening. Produktet skal faktisk kunne utføre én KI-basert analyse av en støttet rapport gjennom den låste analyseadapteren. Demo bruker lagret rapportbundet uttrekk som alternativ kjøreform for sensor/testing uten API-nøkkel; den erstatter ikke live-funksjonaliteten. Live-konfigurasjon er ikke nødvendig for å kjøre demo.

Utenfor v1: sourcing/annonseuthenting, live markedsdata, markedsanalyse, rangering/score, DSCR, stresstesting, kapitalbehov, automatisk låneplan, kostnadsestimater, nye finansielle fratrekk, OCR, salgsoppgave/andre dokumenttyper, juridisk analyse, ny teknisk klassifisering/godkjenning, kjøpsbeslutning/bud/ekstern kommunikasjon, innlogging, flere roller/samarbeid, varig vurderingshistorikk, hosting og samarbeidende KI-agenter.

Den videre oppdelingen skal holde disse arbeidsområdene synlig atskilt, uten å gjøre dem til ti epics på forhånd: grunnstruktur/kjørbar app; tallgrunnlag/validering; PDF-validering/tekstuttrekk; demo/live-adapter; kontroll/korrigering av KI-funn; finans; screening; resultat; feil/tilgjengelighet; testing/sensor-kjørbarhet. Ingen epic- eller storydesign gjøres i steg 1.

## Requirements Inventory

### Functional Requirements

Alle 18 ID-er er beholdt fra PRD. Samtlige akseptansekriterier under den tilsvarende PRD-overskriften er bindende også når indeksen forkorter teksten.

FR-1: **Registrere finansverdier for ett objekt.** Registrer P/L/D/J/Ymin manuelt for samme objekt/år, NOK og prosent. P inkluderer eventuell fellesgjeld, uten kjøpsomkostninger; J er renter/avdrag inklusive eventuell fellesgjeld. Vis registrert periode og årsgrunnlag; bare månedlig L/D/J ganges med 12. P/Ymin annualiseres ikke. Manglende felt forblir manglende; ingen leievekst/låneplan/ekstra fratrekk. Spor: CAP-1; AD-1/AD-2/AD-7; UX Tallgrunnlag/value-field/period-control; BT-7/BT-15/BT-16.

FR-2: **Synliggjøre kilder, forutsetninger og kostnadsinnhold.** Hver beregningsverdi har synlig kilde/brukerforutsetning; forventet leie blir ikke dokumentert faktisk leie. Inkluderte D-poster skilles uten dobbelttelling. Gjeldsbetjening i felleskostnader føres i J: 120 000 med 20 000 gjeld gir D 100 000 og J 20 000. Uløste motstridende kritiske kilder vises uten automatisk kildeprioritering. Spor: CAP-1; AD-2/AD-7; source-note/cost-breakdown; S4 og briefets kildekonfliktvariant.

FR-3: **Validere tall og skille null fra manglende verdi.** P > 0; L/D/J/Ymin ≥ 0; ikke-numerisk er ugyldig. Blank er aldri null; null krever eksplisitt bekreftelse, også kontantkjøp. Lokale feil navngir felt og nødvendig handling. Ingen berørt beregning bruker utilstrekkelig verdi; kritisk tallmangel gir Innhent mer informasjon. Spor: CAP-1; AD-1/AD-7; value-field/issue-message; BT-3/BT-5/BT-6/BT-10/BT-14; AT-12.

FR-4: **Kontrollere og bekrefte tallgrunnlaget.** Verdier/enheter/perioder/årsgrunnlag/kilder kan kontrolleres og rettes før eksplisitt bekreftelse. Registrering alene er ikke bekreftelse; den gjelder kontrollert grunnlag. Den komplette hovedreisen starter rapportanalyse først etter gyldig tallkontroll, samtidig som mangler kan vises lokalt med Innhent mer informasjon. Spor: CAP-1/CAP-7; AD-2/AD-7; financial-confirmation; BT-12/BT-14; AT-12/AT-16.

FR-5: **Registrere og anvende brukerbekreftet TG3-avklaring.** Per relevant alvorlig TG3 kreves eksplisitt Avklart og både ikke-tom begrunnelse og konkret grunnlag etter trimming. Ukjent, Uavklart eller ugyldig Avklart er uavklart og gir prioritet 1 også ved økonomiske brudd. Original grad/funn/kilde beholdes; avklaringens status/tekster merkes brukerbekreftet for førstevurdering, uten ekstern verifisering, ekstra opplasting, teknisk godkjenning eller automatisk Gå videre. Alle relevante TG3 må ha gyldig avklaring før økonomien kan avgjøre. Endret status/tekst krever gjeldende resultat; AD-2/AD-8 binder avklaringen til riktig rapportforhold. Spor: CAP-4/CAP-7; tg3-resolution; alle sju FR-5-eksempler; AT-7–AT-9/AT-20; TT-5.

FR-6: **Analysere én støttet tilstandsrapport.** Én tekstbasert PDF ≤30 sider; 30 godtas, 31/annet format/OCR-behov gir dokumentfeil. Vis gjeldende rapport. Ny rapport krever ny analyse og ugyldiggjør gammelt uttrekk, bekreftelse og TG3-avklaring. Live starter eksplisitt med ett KI-kall per ny rapport, uten automatisk retry. Uendret rapport gjenbrukes også etter finansendring. Demo bruker merket lagret uttrekk uten nøkkel/eksternt nett. Spor: CAP-2/CAP-7/CAP-8; AD-3–AD-6; report-input/analysis-status; RT-1–RT-4/RT-15.

FR-7: **Trekke ut alle eksplisitte TG2- og TG3-funn.** Grad, kort beskrivelse uten udokumenterte tillegg, dokumentnavn og PDF-side. Ingen relevansfiltrering, ny grad eller faglig klassifisering; ingen reparasjons-/markeds-/juridisk analyse eller automatisk endring av finansverdier. Fasit omfatter alle eksplisitte TG2/TG3; opprinnelig live-uttrekk før retting skal nå alle TG3 og ≥90 % TG2 med korrekt side, uten oppdiktede funn. Rapporter riktige/oversette/feil side/oppdiktede per rapport og kontroller hvert TG3. 90 % er evalueringsminimum, ingen filtreringstillatelse eller generell kvalitetsgaranti. Spor: CAP-2; AD-3/AD-4; finding-list/finding-detail; RT-5/RT-6/RT-16–RT-18; S2.

FR-8: **Vise kilde og gjøre originalrapporten tilgjengelig for kontroll.** Merk kontrollerbar kilde som KI-uttrekk fra rapport, uten automatisk bekreftelse. PDF-side er filposisjon fra 1; trykt side er bare merket tillegg. Kilde beholdes i resultat, atskilt fra brukerforutsetning/TG3-avklaring. Manglende/umulig kilde er usikkerhet, ingen rapportfakta. Final UX konkretiserer originaltilgang til innebygd PDF med automatisk korrekt side, hel side og nabosider. Spor: CAP-2/CAP-3; AD-2/AD-3/AD-4/AD-9; source-note/pdf-viewer; RT-5/RT-7/RT-8; S4.

FR-9: **Synliggjøre usikkerhet og ufullstendig analyse.** Knyt kjent årsak til berørt funn/side; ikke gjett ukjent årsak, grad, tekst eller side. Skill usikre kandidater fra kontrollerbare fakta. Dokumentfeil og analysefeil har synlig årsak/ufullstendighet; delresultater merkes. Begge gir Innhent mer informasjon, aldri vellykket tomliste. Kontroll/avvisning/listebekreftelse kan ikke gjøre feilet analyse fullført. Gyldig tomliste krever faktisk fullføring og senere kontroll/bekreftelse. Konfidensprosent opphever ingen kritisk usikkerhet. Spor: CAP-2/CAP-6; AD-3–AD-5/AD-8/AD-9; issue-message/analysis-status; RT-2/RT-7/RT-9/RT-10/RT-19; AT-13/AT-18.

FR-10: **Korrigere eller avvise KI-funn med bevart opprinnelse.** Rett grad/beskrivelse/PDF-side mot original med kontrollerbar kilde, merket brukerkorrigert. Behold opprinnelig KI-grad/tekst/kilde. Brukeravvist funn er tilgjengelig som original og ikke aktivt; avvisning er ingen TG3-avklaring. Motstrid er uløst til korrekt brukerhåndtering og listebekreftelse. Ingen KI-kall. Final UX skiller utkast, Bruk korrigering og Avbryt. Spor: CAP-3; AD-2/AD-4; finding-actions/finding-edit/origin-detail; RT-11/RT-12; S3/S4.

FR-11: **Bekrefte gjeldende rapportgrunnlag før screening.** KI-fullføring og enkeltfunnkontroll er ikke listebekreftelse. Bekreft gjeldende kontrollerte liste inklusive rettinger/avvisninger med opprinnelse tilgjengelig. Endret liste krever ny bekreftelse. Ubekreftet liste, kritisk usikkerhet eller ufullført analyse gir prioritet 1; gyldige økonomiske delberegninger kan vises. Bekreftelse avklarer ikke TG3. Spor: CAP-3/CAP-7; AD-2/AD-4/AD-8; list-confirmation; RT-10–RT-14; AT-13/AT-16.

FR-12: **Beregne de fire låste økonomiske nøkkeltallene.** Vanlig kode beregner bruttoyield L/P, NOI L−D, nettoyield (L−D)/P og kontantstrøm før skatt L−D−J. L/D/J normaliseres fra kjent måned med 12 og gjelder samme år; ukjent/annen periode er utilstrekkelig. Yield vises ×100 i prosent; NOK/år for beløp. KI/TG3/modus endrer ingen tall eller formel. Ingen nye fratrekk eller dobbelttelling; negative resultater beholdes. Registrert periode/faktor/årsverdi er synlig. S1s toleranse er ikke en regelmargin. Spor: CAP-5; AD-7; metric-grid; F1/F2; BT-1/BT-2/BT-7–BT-11/BT-15.

FR-13: **Vise bare beregninger med gyldig grunnlag.** Bruttoyield krever P/L, NOI L/D, nettoyield P/L/D, kontantstrøm L/D/J; gyldige og bekreftede uten uløst konflikt. Ikke beregnbart viser konkret årsak, aldri null/estimat/gammelt tall. Manglende L hindrer alle fire, J bare kontantstrøm, Ymin ingen nøkkeltall, P/ugyldig P begge yieldmål. Ingen divisjon med null. Gyldige delberegninger tillates ved tekniske mangler, men utilstrekkelig kritisk grunnlag kan aldri gi Forkast/Gå videre. Spor: CAP-5/CAP-6; AD-7/AD-8; metric-grid/issue-message; BT-3–BT-6/BT-13/BT-14/BT-16–BT-18.

FR-14: **Gjøre beregninger etterprøvbare og bevare presisjon.** Formler/input/enheter/årsgrunnlag/kilder/perioder/faktor er tilgjengelige uten kodeinnsyn. Avrunding skjer bare ved visning; Ymin sammenlignes i riktig enhet uten S1-margin. Nettoyield = Ymin og kontantstrøm = 0 består økonomiske grenser, mens én krone under/negativ ikke gjør det. Skjult terskelbrudd ved avrunding forklares; visningspresisjon støtter S1. Spor: CAP-5; AD-7; basis-detail/detail-disclosure; BT-1/BT-8/BT-9/BT-15; S1/S4.

FR-15: **Beregne på nytt etter endret finansgrunnlag.** Endret feltgrunnlag krever ny relevant kontroll/bekreftelse og gjør forrige resultat historisk. P/L/D/J oppdaterer avhengige nøkkeltall; bare Ymin endrer regelvurdering og ingen av de fire tallene. Uendret rapportuttrekk/kontrollstatus gjenbrukes uten KI-kall, mens eksisterende rapportmangler/TG3 fortsatt gjelder. Dette virker også offline i demo. Spor: CAP-7/CAP-8; AD-2/AD-6/AD-7; financial-confirmation/stale-result; RT-3; BT-12/BT-13; AT-16.

FR-16: **Bestemme én anbefaling med låst regelprioritet.** Kode returnerer nøyaktig én anbefaling. Prioritet 1: kritisk mangel/ugyldighet/konflikt/ubekreftelse, ufullført/feilet rapportgrunnlag, uløst kritisk usikkerhet eller uavklart alvorlig TG3 → Innhent mer informasjon. Ellers prioritet 2: nettoyield < Ymin eller kontantstrøm < 0 → Forkast. Ellers prioritet 3: nettoyield ≥ Ymin og kontantstrøm ≥ 0 → Gå videre. Likhet godtas med eksakt grunnlag. Alle utløsere på avgjørende nivå vises; mangler overstyrer økonomi og TG-grad gir ingen automatisk forkastelse. Samme grunnlag gir identisk anbefaling/utløsere/begrunnelse/neste handling; ingen KI-generering. Spor: CAP-6; AD-7/AD-8; recommendation; AT-1–AT-16/AT-18–AT-20.

FR-17: **Forklare anbefaling, utløste regler og neste handling.** Fast kodebegrunnelse viser avgjørende prioritet og alle konkrete utløsere på nivået. Innhent mer informasjon navngir alle kjente mangler og nødvendig retting/bekreftelse/innhenting/avklaring. Forkast viser begge økonomiske brudd når begge gjelder, med terskel-/avrundingsforklaring. Gå videre viser oppfylte økonomiske krav og tilstrekkelig teknisk screeninggrunnlag, med neste handling grundigere vurdering/befaring. Behold opphav; ingen KI-omskriving, kjøpsanbefaling, teknisk godkjenning eller ekstern handling. Spor: CAP-6; AD-7/AD-8/AD-9; recommendation/issue-message; AT-1–AT-15/AT-18–AT-20.

FR-18: **Presentere et sammenhengende og gjeldende beslutningsgrunnlag.** Anbefaling/kort grunn øverst; alle beregnbare og ikke-beregnbare nøkkeltall, formler/input, alle aktive TG2/TG3/kilder, original/brukerendringer og separat TG3-avklaring er tilgjengelige. Skill fakta/opphav/usikkerhet/mangler; behold dokument-/analysefeil synlig. Tall/funn/anbefaling gjelder samme aktuelle objekt/revisjon; endring krever relevant kontroll og kan ikke gjenbruke gammel anbefaling som gjeldende. Vis steg/ufullstendighet/delgrunnlag; samme regler i demo/live, tydelig demomerking og ingen score/andre analyser. Spor: CAP-6/CAP-7; AD-2/AD-7–AD-9; basis-detail/status-label/stale-result; AT-16/AT-17; RT-4/RT-14.

### NonFunctional Requirements

NFR-1: **Stabilitet og etterprøvbar regelkjøring.** Identiske kodeberegninger/utløsere/tekst fra samme grunnlag uten nytt nettverks-/KI-kall. Gjentakelse/retting må ikke innføre standardverdier, doble poster eller gamle gjeldende resultater. Feil er synlige og gir prioritet 1. Ingen krav om varig lagring/gjenoppretting/oppetidsavtale. Spor: CAP-1–CAP-8; AD-1/AD-2/AD-4/AD-5/AD-8; AT-16/AT-18–AT-20 og feil-/overgangstester.

NFR-2: **Forståelig desktop-flyt og grunnleggende tilgjengelighet.** Synlige etiketter/enheter/perioder og lokale feltfeil. Tastatur, synlig fokus, tekstlig grad/status/opphav/anbefaling og lesbar kontrast. Eventuelle meningsbærende bilder har tekstalternativ. Tall/kilder/kontroller er tilgjengelige ved relevant desktop/zoom. Manuell kontroll av tastatur, etiketter, kontrast, feil/tomt/usikkert og de tre anbefalingene. Ingen sertifiseringspåstand eller ny mobilreise. Spor: CAP-1/CAP-3/CAP-6/CAP-7; AD-2/AD-9; hele final UX.

NFR-3: **Lokal kjørbarhet og kostnadsfri demo.** Etter dokumentert installasjon kan en annen person følge README og kjøre hele demoen og dokumenterte tester uten gruppens nøkkel, betalt konto eller særskilt infrastruktur. Demoens vurderingsflyt krever ikke eksternt nett, og aktive regler viser alle tre anbefalinger med kontrollsteg. Ingen live-nøkkel er nødvendig for demo. README dokumenterer versjonerte forutsetninger, eksakte kommandoer, data og lokal konfigurasjon for live-kjøring. Valget om å bruke live er frivillig ved kjøring; produktets evne til faktisk KI-analyse inngår fortsatt i v1. Installasjon kan kreve nett. Spor: CAP-8; AD-6/AD-9; S6.

NFR-4: **Hemmeligheter og testdata.** Lokal live-nøkkel er utenfor frontend, Git, logger/feil, fixtures/demo og dokumentasjon. Fiktive data foretrekkes; private originaler er utenfor Git og reelle publiserte data krever vurdert rettighet/personvern/anonymisering. Kontroller faktisk versjonerte filer/historikk/testrapporter ved levering. Ingen innlogging/rolle-/personvernadministrasjon opprettes. Spor: CAP-2/CAP-8; AD-6/AD-9; sensor s. 6–7.

NFR-5: **Tidsbruk i førstevurderingen.** Median hovedanalyse ≤300 s fra eksplisitt Start analyse etter gyldig bekreftet tallgrunnlag/støttet opplastet rapport til ferdig validert liste er synlig. Median menneskelig kontroll ≤600 s fra samme listehending til kontroll/retting/avvisning/TG3-håndtering og gjeldende listebekreftelse. Uavklart TG3 kan beholdes. Opplasting/registrering før start, senere kodeberegninger og videre investeringsarbeid inngår ikke. Feil/ufullført er ikke raske suksesser. Skill live/demo; bruk full S5-protokoll og samme-case manuell referanse. Ingen apptelemetri eller hard femminutters timeout innføres. Spor: CAP-2/CAP-3/CAP-4/CAP-6; AD-5/AD-10; TT-1–TT-9.

### Akseptansemål og eksisterende testfasit

| Mål | Bindende kontroll og avgrensning |
|---|---|
| S1 | Uavhengig fasit: høyst 1 kr og 0,01 prosentpoeng avvik i beregnbare tall. Manglende grunnlag testes som mangel. Terskler testes eksakt uten toleranse. F1–F4, BT-1–BT-18. |
| S2 | Opprinnelig live-uttrekk før retting: alle TG3, ≥90 % TG2 med korrekt side, ingen oppdiktede funn i kontrollert utvalg; alle eksplisitte funn i fasit. RT-5/RT-6/RT-16–RT-18. Demo er ikke live-bevis. |
| S3 | Alle låste regel-/feilvarianter, prioritet, likhet, uløste konflikter, ugyldighet/ubekreftelse og TG3; alle utløsere og identisk tekst/neste handling. Briefvarianter, sju FR-5-eksempler, RT/BT/AT. |
| S4 | Alle viste rapportfunn har korrekt dokument/PDF-side og beregningsverdier synlig opphav uten dobbelttelling. Skill original, usikkerhet, utkast, brukt retting, avvisning, kontroll og TG3-avklaring. |
| S5 | Full PRD-addendum-protokoll/TT-1–TT-9, separate medianer ≤300/600 s med gyldige målepunkter, feilede/ufullførte forsøk dokumentert, live/demo separat og manuell sammenligning av samme caser. |
| S6 | Annen person følger faktisk README i rent dokumentert miljø og fullfører demo/tester uten gruppens nøkkel/betalt konto/egen infrastruktur. Eksternt nett sperres under demo; browserbinær for E2E installeres på forhånd. |

F1: P 16 000 000, L 1 900 000, D 400 000, J 800 000, Ymin 7 %, tilstrekkelig teknisk grunnlag → 11,875 % / 1 500 000 / 9,375 % / 700 000 og Gå videre. F2: L 1 400 000 → 8,75 % / 1 000 000 / 6,25 % / 200 000 og Forkast. F3: L mangler → ingen av de fire tallene og Innhent mer informasjon. F4: F1-økonomi med uavklart TG3 «Alvorlig lekkasje i tak» på PDF-side 4 → Innhent mer informasjon. F1–F3 har planlagt TG2 på PDF-side 2; F4 har i tillegg TG3. Full fasit og varianter eies fortsatt av addenda.

K1–K3 beholdes: tidsgevinst oppnås ikke ved å hoppe over kontroll eller TG3; flere uttrekk er ikke kvalitet i seg selv; andelen Gå videre er ikke et suksessmål. Testfasit fastsettes før live-evaluering og tilpasses ikke modellsvaret.

### Additional Requirements

**Starter for første grunnstrukturarbeid:** Offisiell Vite `react-ts`, én package.json/package-lock.json, npm fra Node-installasjonen, vanlig CSS med DESIGN-tokens og React reducer/context. Dette skal være eksplisitt i Epic 1 Story 1 ved senere design. Grunnstruktur og et beviselig kjørbart appskall må ha separate akseptansekriterier/arbeidsenheter; ingen installasjon eller scaffolding utføres nå.

| ID | Eksisterende teknisk føring som videre stories skal dekke |
|---|---|
| AR-1 / AD-1 | Functional core / imperative shell. Rene domain/contracts uten React/Express/PDF/I/O/miljø; frontend bruker domain/presentation/PDF-visning, backend documents/analysis/contracts. Backend gir ingen finans/anbefaling. Felles contracts, ingen kopierte DTO-er/regler. Structural Seed og importdiagram gjelder. |
| AR-2 / AD-2 | Én frontend reducer eier aktiv økt over alle fire trinn: finans, originalbytes, immutabelt uttrekk, kontroll, utkast, gjeldende liste, separat TG3 og siste revisjonsbundne snapshot. Navigasjon muterer ikke grunnlag. Bruk korrigering opphever enkeltfunn-/listebekreftelse; Avbryt bevarer gjeldende versjon. TG3-avklaring bindes til faktisk forhold, ikke bare findingId. Sideoppdatering/lukking avslutter økt. |
| AR-3 / AD-3 | Backend validerer én PDF og leverer pages med én post per filposisjon 1..pageCount, tekst og uttrekksstatus. Ingen OCR/skjult sidefiltrering/avkorting. Upålitelig/ufullstendig lesing er dokumentfeil. Hele støttede grunnlaget sendes i ett kall; originalbytes i frontend gir ekte kildekontroll. PDF-validering og tekst-/layoutkontroll holdes atskilt. |
| AR-4 / AD-4 | contracts eier runtime-skjema/avledede typer: versjon, requestId, backendberegnet SHA-256 reportHash, modus, completed/failed, pageCount/funn/usikkerhet eller document/analysis-feil med stabil kode/mål/trygg årsak. Bare completed + findings: [] er gyldig tomliste. Uklar grad/kilde/side er usikker kandidat med opphav. Backend og frontend validerer; gyldig struktur er ingen semantisk/brukerbekreftelse. |
| AR-5 / AD-5 | Ett ventende POST /api/analysis per eksplisitt start; frontend sperrer dobbeltstart og godtar bare samsvar med aktiv økt/rapport/request/generasjon. Forlatt/erstattet analyse ugyldiggjør generasjonen; sent svar avvises også etter best effort-abort. Backend setter prosesslokal duplikatmarkør før adapterkall på økt + lokal modus + backendhash, beholder den til serverstopp også ved klientavbrudd og nekter omgåelse med ny requestId/generasjon. Ingen retry, jobb-ID, polling eller vedvarende jobbtilstand. HTTP 200 er ikke alene fullføring. |
| AR-6 / AD-6 | Demo/live deler dokumentpipeline og smal adapterkontrakt. Demo krever samsvar med faktisk PDF-hash og kontrakt-/uttrekksversjon; mismatch/manglende fixture er analysefeil uten live-fallback. Demo er lokal standard uten KI-klient. Lokal backendkonfigurasjon velger modus; UI viser den hele veien. Uendret uttrekk gjenbrukes etter finans/funn/TG3-endringer. Testadapter injiseres på samme grense. |
| AR-7 / AD-7 | Kanoniske desimalstrenger; manglende er egen tilstand. Modent big.js, ingen Number/parseFloat før eksakt aritmetikk og ingen hjemmelaget brøkaritmetikk. Yield beholder teller/nevner til visning. Terskel: 100 × NOI ≥ P × Ymin; kontantstrøm ≥ 0. Årsnormalisering/gyldighet, finans, thresholds, screening og formatering er separate testbare funksjoner. Presentasjon gir aldri regelinput. |
| AR-8 / AD-8 | Felles inputvalidering eier TG3-avklaringens anvendbarhet/binding; state/UI/screening har ingen parallelle tolkninger. Kjent motstrid/ukjent tilhørighet er utilstrekkelig, uten ny automatisk semantikk/ekstern verifisering/UX-handling. Én screening gir alle stabilt ordnede utløsere på avgjørende nivå, faste tekster og neste handling. |
| AR-9 / AD-9 | Vite-build serveres av én Express-prosess på loopback sammen med /api på samme origin. Backend PDF.js legacy-build i Node, frontend browser-build og lokalt bundlet matchende worker. Alle demo-/font-/PDF-ressurser lokale. Nøkkel/leverandørkall bare backend; trygg modusmetadata. Bytes behandles uten filnavn som serversti, midlertidige ressurser ryddes, statisk server eksponerer ikke reporot/private dokumenter. Én dev-kommando. Final UX gjennomføres uendret. |
| AR-10 / AD-10 | Offline tester bruker faktiske rene moduler og samme PDF-/adapter-/kontraktgrenser som appen. Rene reducer-tester og forhåndsdefinert uavhengig fasit. Playwright kjører bygget app med kontrolladapter uten betalt API. Separat original live-evaluering/S5/S6 og manuell UX. Stories/kode/bevis fører krav-, AD- og eksisterende test-ID. |

**Låst startstakk:** Node.js 24.21.0 LTS; React/react-dom 19.3.0; TypeScript 6.0.2; Vite 8.3.4; @vitejs/plugin-react 6.1.2; Oxlint 1.87.0; Express 5.3.0; pdfjs-dist 6.4.299; big.js 7.0.1; Zod 4.6.7; Vitest 5.0.4; Playwright 1.64.0. Pins er adoptert fra final spine, ikke verifisert gjennom installasjon her. Avvik krever avklaring fremfor stille stakkendring.

**Leveringskontrakt:** npm ci → npm run build → npm run demo; npm run dev; npm test; npm run test:e2e mot bygget app. README skal angi faktisk adresse, browserforberedelse og live-variabler uten hemmeligheter; live-konfigurasjon er ikke nødvendig for demo. Fixtures hører til tests/fixtures/property-cases/; faktiske test-/evalueringsbevis til .docs/implementation-artifacts/. Ingen slike app-scripts, fixtures eller produktbevis opprettes av kravuttaket.

### UX Design Requirements

Kilde for UX-DR1–UX-DR26 er det tilsvarende komponentparet i DESIGN.Components og EXPERIENCE.Component Patterns. Hvert par har både visuell og atferdsmessig kontrakt. UX-DR27–UX-DR41 viser tverrgående kontrakter; de oppretter ingen nye UX-beslutninger.

| ID | Komponent | Konkret arbeid og observerbar kontrakt |
|---|---|---|
| UX-DR1 | app-header | Produktnavn og trygg, synlig «Demo · lagret KI-uttrekk»/«Live analyse» gjennom hele flyten; aldri nøkkel-/innloggingsflate. |
| UX-DR2 | stepper | Sticky nummer, eksakte navn Tallgrunnlag → Tilstandsrapport → Kontroller funn → Resultat og tekstlig Gjeldende/Fullført/Gjenstår/Endret — må oppdateres. Retur til tidligere fullførte trinn; sperrede fremtidige trinn forklarer mangelen. Navigasjon alene bevarer kontroll. Fokusert innhold dekkes ikke. |
| UX-DR3 | action-primary | Navngitt gyldig lokal flythandling med petrol/hvit, synlig fokus og forklart sperre. Registrering/analyse/navigasjon erstatter ikke bekreftelse. |
| UX-DR4 | action-secondary | Synlig, tastaturtilgjengelig retur/kontroll uten hoverkrav, med bevart aktuell kontekst og forklaring på sperre. |
| UX-DR5 | value-field | Synlig P/L/D/J/Ymin-etikett, verdi/enhet/kilde og tekstlig blank/null/ubekreftet/endret/feil; ny relevant kontroll ved endring. |
| UX-DR6 | period-control | Synlig år/måned for L/D/J, årsgrunnlag/faktor; ukjent periode/ulike år blir lokale mangler uten skjult standard. |
| UX-DR7 | source-note | Lesbart og skilt rapport-/bruker-/kodeopphav; dokument/PDF-side fra 1, konflikt uten automatisk kildevalg. |
| UX-DR8 | cost-breakdown | Strukturert kontrollerbart D-/J-innhold med enheter uten dobbelttelling; ingen estimat-/låneplanfunksjon. |
| UX-DR9 | financial-confirmation | Kontrollert registrert/årlig verdi, periode/enhet/kilde før eksplisitt bekreftelse; vis berørte endrede/ubekreftede verdier. |
| UX-DR10 | report-input | Én gjeldende tekstbasert PDF ≤30 sider med filnavn, status og konkret dokumentfeil; rapportbytte gjør gammelt rapportgrunnlag ugyldig. |
| UX-DR11 | analysis-status | Eksplisitt start etter gyldig tallkontroll; faktisk Analyserer/fullført/feilet/delresultat og modus. Ingen kunstig progresjonsprosent/retry; fullført liste skal være synlig. |
| UX-DR12 | finding-list | Alle eksplisitte TG2/TG3 tilgjengelige; lesbart valgt funn og separat aktiv/usikker/avvist/kontrollstatus uten relevansfilter. |
| UX-DR13 | finding-detail | TG, kort beskrivelse, dokument/PDF-side, kjent usikkerhet og kontrollstatus; funnvalg viser korrekt originalside automatisk. |
| UX-DR14 | finding-actions | Bekreft/Korriger/Avvis ved aktuelt funn; uttrekkskontroll er atskilt fra listebekreftelse og TG3-avklaring. Avvisning beholder original og er ingen utbedring. |
| UX-DR15 | finding-edit | Rediger grad/beskrivelse/side som merket utkast. Bruk korrigering gjør gjeldende og ubekreftet funn/liste; Avbryt fjerner utkast og bevarer tidligere gjeldende versjon. Funn-/trinnretur bevarer ubrukt utkast; ingen KI-kall. |
| UX-DR16 | origin-detail | Original KI, redigert utkast, gjeldende brukerretting/avvisning og kontrollstatus kan skilles. Original forblir lesbar og tilgjengelig; på Resultat åpnes detaljene ved behov. |
| UX-DR17 | pdf-viewer | Innebygd original, automatisk korrekt PDF-side, hel side/nabosider uten standard separat fane. Dokument/side, faktisk lasting/feil og ugyldig/ukjent side vises uten gjetting. Smal flate gir valgt-funn-oppsummering og Tilbake til funnkontroll. Tekstfremheving er ikke et obligatorisk v1-krav. |
| UX-DR18 | tg3-resolution | Separat Avklart/Uavklart og begge brukeroppgitte tekster. Ugyldig Avklart får lokale feil; grad/funn beholdes. Endret status/begrunnelse/grunnlag gjør resultat straks historisk, men bevarer uendrede tall-/listebekreftelser og uttrekk. |
| UX-DR19 | list-confirmation | Egen eksplisitt bekreftelse av gjeldende kontrollerte liste med rettinger/avvisninger. Enkeltfunn og analysefullføring er ikke listen. Uavklart TG3 kan bestå etter fullført kontroll; feil blir ikke fullført analyse. |
| UX-DR20 | recommendation | Én gjeldende anbefaling øverst med kort kodegrunn, alle avgjørende utløsere og kodebundet neste handling; tekst supplerer statusfarge og historisk resultat er tydelig skilt. |
| UX-DR21 | metric-grid | Fire faste nøkkeltall med navn/verdi/enhet/år, negative tall bevart; konkret Ikke beregnbart og Delgrunnlag ved utilstrekkelig samlet grunnlag. |
| UX-DR22 | basis-detail | Skannbar behovsåpnet formel/input/kilde-/funnhistorikk/avklaring. Alvorlige funn, blokkere og regler synlige fra start; alle aktive TG2/TG3 tilgjengelige. |
| UX-DR23 | detail-disclosure | Merket åpen/lukket seksjon med tastatur/fokus/hjelpemiddeltilstand; skjult innhold utenfor fokusrekkefølge. Hovedanbefalingen forstås uten åpning. |
| UX-DR24 | issue-message | Lokal kort kjent årsak, berørt felt/funn/dokument og nødvendig handling med tekst. Resultat oppsummerer alle faktiske blokkere uten full lokal feilmeldingsduplisering; ingen gjettet årsak. |
| UX-DR25 | status-label | Separate lesbare tekstetiketter for TG-grad, kontroll, avklaring, usikkerhet, opphav, modus og gyldighet; farge/ikon supplerer. |
| UX-DR26 | stale-result | Siste snapshot er lesbart historisk med Utdatert/Må bekreftes på nytt etter relevant faktisk endring; navngi grunnlag/oppdateringsbehov. Ingen aktiv gammel konklusjon eller varig historikkfunksjon. Ubrukt utkast bruker ikke nytt screeninggrunnlag. |
| UX-DR27 | Tokens/farger | Implementer eksakte grafitt/petrol-tokenverdier og alle komponentbindinger fra DESIGN-frontmatter; kontrollkant og dekorativ kant har ulike roller. Statusfarger følger faktisk tekstlig betydning. |
| UX-DR28 | Typografi/geometri | Lokal systemfont med seks eksakte typeroller, radier og 4/8/12/16/24/32/48-skala fra DESIGN. 32 px page-gutter, 24 px hovedgap, 36 px kontrollhøyde; kilder/usikkerhet og historisk tekst forblir lesbare. |
| UX-DR29 | Tallpresentasjon | Norske skilletegn, hele NOK og tre yielddesimaler; nødvendig ekstra detaljpresisjon/forklaring ved skjult terskelbrudd/fasitkontroll. Presentasjon endrer ingen regeldata. |
| UX-DR30 | Bred/smal kontrollflate | Fra 1200 CSS px om lag 44/56 funn/PDF med 24 px gap. Under grensen behovsåpnet PDF-panel med korrekt kilde-side/kort funnkontekst, ikke standard stablet PDF. Ved zoom ombrytes tekst/stepper med alle navn/nummer/status bevart. Referanser 1440×900/1280×800. |
| UX-DR31 | Panelfokus/retur | Åpning fokuserer paneloverskriften; fokus holdes i panelkontrollene. Synlig retur/lukking og Esc gir fokus tilbake til åpner, med valgt funn, posisjon, kontekst og uferdig utkast bevart. |
| UX-DR32 | Feltvalidering/fokus | Feil vises ved eksplisitt bekreftelses-/analyseforsøk og beholdes ved felt til retting. Bevar input; ingen avbrytende modal under inntasting. Fokus på trinnoverskrift ved navigasjon og første berørte felt etter ugyldig forsøk. |
| UX-DR33 | Funnvalg/statuskunngjøring | Automatisk PDF-side beholder fokus på valgt funn. Kunngjør viktige analyse-/PDF-/gyldighetsoverganger kort én gang uten fokusflytting eller full listeopplesning; navngi dokument og forespurt/aktuell PDF-side. Gyldig tomliste kunngjøres som klar liste. |
| UX-DR34 | Tastatur/semantikk | Hele kjerneflyten med forståelig Tab-rekkefølge/standardaktivering/synlig fokus. Knytt feil, kilde, enhet og kostnadsgrunnlag til felt; hjelpemidler kan lese navn/utvalg/sperre/status/åpen-lukket. Ingen hoveravhengige handlinger eller nye spesialsnarveier. |
| UX-DR35 | Kontrast/tekstalternativ | Kontroller faktiske par mot DESIGNs praktiske mål 4,5:1 informasjonstekst og 3:1 nødvendige kontrollgrenser/fokus, også historisk tekst. Primærknappfokus har lys avstand. Meningsbærende grafikk får alternativ; dekorasjon ingen redundant opplesning. Ingen sertifiseringspåstand. |
| UX-DR36 | Lokale feil og prioritet 1 | Utilstrekkelig kritisk grunnlag gir kodebasert Innhent mer informasjon, alle berørte blokkere og nødvendig handling i problemtrinnet, også når normal videregang er sperret. Ingen nødvendig omvei til Resultat. Samlet resultat bruker samme regler. |
| UX-DR37 | Tall-/rapporttilstander | Dekk EXPERIENCE.State Patterns for Tallgrunnlag/Tilstandsrapport: tom, faktisk cold-load/validerer/analyserer, felt-/dokument-/analysefeil, ubekreftet/endret, fokus, offline/manglende live-konfigurasjon og ny rapport. Ingen kunstig venting eller skjult null. |
| UX-DR38 | Funn-/resultattilstander | Dekk EXPERIENCE.State Patterns for Kontroller funn/Resultat: gyldig tomliste kontra feil, PDF-lasting, usikker/kildefeil, utkast/korrigert/avvist/ubekreftet, TG3 ugyldig/endret, stale, offline, ikke beregnet, delgrunnlag og gjeldende etter nødvendig ny kontroll. |
| UX-DR39 | Resultathierarki | Fra start én anbefaling/kort grunn/utløste regler, alle fire nøkkeltall, alvorlige tekniske funn, mangler/uavklarte forhold og neste handling. Formler/input-/kilder/opprinnelig KI-/brukerendring åpnes ved behov; alle aktive TG2/TG3 fortsatt tilgjengelige. |
| UX-DR40 | Norsk språk/opphav | Bruk EXPERIENCE.Voice and Tone med presis tilstand/berørt grunnlag/handling. Skill KI-uttrekk, brukerforutsetning, brukerretting/avvisning, bekreftet kontroll, separat avklaring og kodebasert resultat. Ingen kjøps-/teknisk-godkjenningspåstand. |
| UX-DR41 | Flyter og manuell UX-kontroll | Bevar alle fire Key Flows: UJ-1, retting/TG3-skille, endring etter Resultat og feil/demo. Verifiser senere tastatur/fokus/status, etiketter, kontrast, tomt/usikkert/feil, original/PDF-panel/zoom og forståelse av alle tre anbefalinger mot final UX og eksisterende nøkkelmocks. |

### SPEC-kapabiliteter og videre sporbarhet

| CAP | Eksisterende intent / minste kravspor |
|---|---|
| CAP-1 | Finansgrunnlag med kilde/kostnad/kontroll: FR-1–FR-4. |
| CAP-2 | Én støttet rapport og alle eksplisitte funn/usikkerhet: FR-6–FR-9. |
| CAP-3 | Originalkontroll, retting/avvisning og bekreftelse: FR-8–FR-11. |
| CAP-4 | Separat brukerbekreftet alvorlig TG3-avklaring: FR-5. |
| CAP-5 | Fire etterprøvbare deterministiske nøkkeltall/delberegninger: FR-12–FR-14. |
| CAP-6 | Én forklarlig gjeldende regelstyrt anbefaling/resultat: FR-16–FR-18. |
| CAP-7 | Retur/endring/ny kontroll/historisk snapshot/gjenbruk: FR-5/FR-6/FR-11/FR-15/FR-18. |
| CAP-8 | Merket kostnadsfri lokal demo og live-kjøring med egen lokal konfigurasjon: NFR-3/NFR-4; S6; FR-6/FR-15–FR-18. Demo krever ikke live-nøkkel, mens faktisk KI-analyse fortsatt leveres i v1. |

Videre stories må føre konkret CAP, FR/NFR/S der relevant, AD, UX-DR og kildeoverskrift, eksisterende testeksempel-ID, avhengigheter og egne observerbare akseptansekriterier/testkrav. Arbeid med rent teknisk grunnstruktur fører relevante NFR/AD/SPEC-kontrakter fremfor oppdiktet brukerfunksjon. F1–F4/RT/BT/AT/TT erstattes ikke av nye konkurrerende fasit-ID-er.

### Videreførte gjennomføringsavklaringer

Dette er kildenes Deferred med opprinnelig eier og seneste avklaringspunkt, ikke nyåpnede produktspørsmål eller resultatet av den senere readiness-kontrollen.

| Avklaring/arbeid | Eier og senest før | Planleggingskonsekvens |
|---|---|---|
| KI-leverandør/modell/SDK, kontekst/output, pris og budsjett | Mads + live-integrasjon før live-adapterimplementering/betalte tester. | Marker separat live-avhengighet; demo/felles kontrakt avhenger ikke av leverandørvalget. Hele støttede grunnlaget i ett kall uten retry/avkorting. |
| Eksakte timeout-/uploadressursgrenser og bufferopprydding | Backendansvar før HTTP-/live-integrasjon. | Eget synlig avklaringspunkt i berørt arbeid; ingen ny 30-sidersgrense eller hard S5-timeout. Duplikatsperrens garanti beholdes. |
| Konkret PDF-lesbarhetskontroll/layoutbevaring | Dokumentkomponenten før uttrekk brukes som gyldig grunnlag. | Skill format/sidevalidering fra tekst-/layoutpålitelighet; undersøk blanke sider, tabeller/kolonner, tegnkoding og blandet tekst/bilde mot fasit. Ingen skjult OCR. |
| Detaljerte schemas/felt/prompt og endelige script-/miljøvariabelnavn | Implementering innen AD-1–AD-10 før kontraktene tas i bruk. | Felles contracts autoritet; detaljer utarbeides senere uten ny produktfunksjon/grenseendring. |
| Faktiske PDF-fixtures/fasit, installasjon/låsfil/typekontroll, tester, README og S2/S5/S6-bevis | Implementering/evaluering; fasit før KI-evaluering. | Tester knyttes til logikken i hver story. Senere samlet leveransekontroll dokumenterer faktiske resultater; ingenting regnes bestått fra planene alene. |

### Kurs- og prosessføringer

Faglærerens smale trestegskjerne, finans i kode med fasit, egne UX-referanser og rom for test/retting/README videreføres. Sensor s. 1–3 og AGENTS.md krever at viktige prompts/arbeidsøkter og plan–kode-spor bevares. Små, avgrensede faktiske commits, kvalitetssikring og avvik dokumenteres i senere arbeid; ingen historikk eller produktbevis fabrikeres nå. Sensor s. 3–7 styrer relevant testing, designkonsistens, lesbar struktur, README-basert ren kjøring og ryddig repo uten hemmeligheter/byggeartefakter. Ingen testdekningsprosent, database, roller eller integrasjoner utledes av vurderingseksemplene.

## FR Coverage Map

Tabellen viser revidert epic-dekning etter de godkjente forbedringene. «Primært ansvar» plasserer selve funksjonen; andre epics kobler den til rapport-/resultatflyten eller verifiserer den. En delt FR er komplett først når alle relevante deler er levert. Dette er ingen påstand om implementerte krav. Story-spor står i de godkjente storyene nedenfor og er kontrollert i implementation readiness-rapporten.

| FR | Primært ansvar | Supplerende integrasjon og bevis |
|---|---|---|
| FR-1 | Epic 1: manuelle verdier, definisjoner, periode/år og årsgrunnlag. | Epic 3: inputgrunnlag i resultat; Epic 5: samlet fasit/ren kjøring. |
| FR-2 | Epic 1: kilder/forutsetninger, D/J og uløste kildekonflikter. | Epic 3: tilgjengelig resultatsporbarhet; Epic 5: S4. |
| FR-3 | Epic 1: rene valideringsregler og felt-/null-/mangelbehandling. | Epic 3: ikke-beregnbart/delgrunnlag i resultat; Epic 5: feilforløp. |
| FR-4 | Epic 1: eksplisitt kontroll/bekreftelse og berørt ugyldiggjøring. | Epic 2: analysestartens forutsetning; Epic 3: retur/endret resultat. |
| FR-5 | Epic 2: separat TG3-registrering, felles anvendbarhetsvalidering og korrekt brukeropphav. | Epic 2 kobler avklaringsmangler til felles prioritet-1-vurdering etablert i Epic 1; Epic 3: komplett screening/resultat/historisk status; Epic 5: FR-5-/AT-fasit. |
| FR-6 | Epic 2: én støttet rapport, eksplisitt demoforløp, identitet/gjenbruk og ny rapport. Epic 4: ett ekte live-kall. | Epic 3: rapportbytte/gjenbruk etter resultat; Epic 5: demo uten nøkkel/nett. |
| FR-7 | Epic 2: felles uttrekkskontrakt og visning av alle funn. Epic 4: ekte uttrekk av alle eksplisitte TG2/TG3. | Epic 4: S2-evaluering av opprinnelig live-uttrekk; Epic 5: samlet dokumentasjon, uten å bruke demo som live-bevis. |
| FR-8 | Epic 2: kildekontroll og original-PDF med korrekt filside/hel side/nabosider. | Epic 3: samme kilder tilgjengelige fra resultat; Epic 5: S4/manuell UX. |
| FR-9 | Epic 2: dokument-/analysefeil, usikre kandidater, gyldig tomliste og delresultater. | Epic 2 bruker felles domain-vurdering av kritiske mangler fra Epic 1; Epic 3: samme mangler i komplett screening/resultat; Epic 4: faktiske live-feil; Epic 5: feilbevis. |
| FR-10 | Epic 2: original/utkast/Bruk/Avbryt/korrigering/avvisning uten KI-kall. | Epic 3: opphav og ubrukt utkast i resultat; Epic 5: rettingsforløp. |
| FR-11 | Epic 2: kontroll og separat bekreftelse av gjeldende liste. | Epic 3: endret liste og historisk resultat; Epic 5: fullført tomliste/ubekreftet/feilet. |
| FR-12 | Epic 3: separat ren finansmodul med de fire eksakte formlene og synlig resultat/enheter/negative tall. | Epic 1: gyldig årsnormalisert input; Epic 5: S1. |
| FR-13 | Epic 3: gyldighet per nøkkeltall, konkrete ikke-beregnbare tall og merket delgrunnlag. | Epic 1: inputgyldighet; Epic 2: rapport-/kontrollmangler; felles prioritet 1 hindrer konklusiv screening ved utilstrekkelig grunnlag; Epic 5: BT-/AT-varianter. |
| FR-14 | Epic 3: eksakte økonomiske terskler, separat nøkkeltallsformat og synlige formler/input/kilder/terskelforklaring. | Epic 1: bevar registrert verdi, periode/faktor/årsgrunnlag og kilde; Epic 5: fasit/grenser. |
| FR-15 | Epic 3: endret finansgrunnlag, ny relevant kontroll og lokal ny beregning/resultat. | Epic 1: finansbekreftelse; Epic 2: uendret rapportuttrekk bevares; Epic 5: ingen ekstra kall/alle utfall. |
| FR-16 | Epic 3: én komplett ren screening med prioritet 1–3 og alle utløsere på avgjørende nivå. | Epic 1 etablerer felles prioritet-1-vurdering for nødvendige lokale mangelutfall; Epic 2 kobler dokument-/kontroll-/TG3-mangler til samme vurdering; Epic 4: samme komplette screening etter live; Epic 5: AT-fasit. |
| FR-17 | Epic 3: full kodebegrunnelse/neste handling for alle tre anbefalinger i resultatet. | Epic 1/2 leverer nødvendig fast lokal mangelbegrunnelse/neste handling fra samme domain-autoritet; Epic 5: identisk tekst/forståelse. |
| FR-18 | Epic 3: samlet gjeldende beslutningsgrunnlag, behovsåpning og historisk snapshot. | Epic 1/2: relevant gjeldende grunnlag og opphav; Epic 4: moduslikhet; Epic 5: UJ-1, S4/S6. |

### NFR-, SPEC- og verifikasjonsdekning per epic

| Krav / kontrakt | Planlagt ansvar og kontroll |
|---|---|
| NFR-1 | Epic 1: rene deterministiske funksjoner; Epic 2: kontrakt/HTTP/duplikat/gamle svar og funnkontroll; Epic 3: revisjoner/historisk resultat; Epic 4: ingen retry; Epic 5: samlet regresjon. |
| NFR-2 | Epic 1: appskall/tall/fokus/etiketter; Epic 2: funn/PDF/panel/status; Epic 3: resultat/detaljåpning/retur. Epic 5 verifiserer hele den leverte flyten manuelt; tilgjengelighet er ikke utsatt til slutt. |
| NFR-3 | Epic 1: faktisk lokal build/start/dev; Epic 2: merket rapportbundet offline-demo; Epic 3: full demovurdering/alle utfall. Epic 5: README og annen persons rene kjøring. Epic 4 er ingen forutsetning for demo. |
| NFR-4 | Epic 1: lokal konfigurasjon/repohygiene og fiktive data; Epic 2: trygg PDF-/feilhåndtering; Epic 4: nøkkel/leverandør bare backend; Epic 5: leveransekontroll av faktiske filer/historikk. |
| NFR-5 / S5 | Epic 2/3: ekte liste-/kontrollhendelser etter uendret UX. Epic 4: separat live-måling. Epic 5: samlet S5-protokoll/TT-fasit/manuell referanse; ingen telemetrifunksjon. |
| CAP-1 | Epic 1, med etterprøvbarhet/endring i Epic 3 og bevis i Epic 5. |
| CAP-2 | Epic 2 i demo; Epic 4 for live-uttrekk; Epic 5 samler bevis. |
| CAP-3 / CAP-4 | Epic 2: kontroll/korrigering/liste og separat TG3. Epic 3: resultat/retur. |
| CAP-5 | Epic 3: rene finans-/terskelfunksjoner, beregnbarhet per nøkkeltall, format og etterprøvbar visning. Epic 1 leverer kontrollert årsgrunnlag. |
| CAP-6 | Epic 1/2: felles vurdering av kritiske mangler og nødvendige lokale kodeutfall. Epic 3: komplett screening og samlet resultat med faktisk rapportgrunnlag fra Epic 2. |
| CAP-7 | Epic 1/2: berørt grunnlagskontroll, utkast, rapportidentitet og vern. Epic 3: helhetlig endring/retur/historisk resultat. |
| CAP-8 | Epic 1–3: komplett lokal demo uten krav om nøkkel; Epic 4: faktisk live KI-analyse som del av v1; Epic 5: annen-person-verifikasjon av demo og samlet leveransekontroll. |
| AD-1–AD-10 / AR-1–AR-10 | Epic 1 etablerer importgrenser, presist input/årsgrunnlag og én kontrakt-/regelautoritet for lokale mangler. Epic 2 realiserer dokument-/adapter-/HTTP-/kontrollgrenser. Epic 3 leverer finanspresisjon, økonomiske terskler, komplett screening og snapshot/resultat. Epic 4 bruker de samme grensene for ekte KI-analyse. Epic 5 kontrollerer samsvar og bevis. Hele spine og SPEC-grensekontrakter gjelder i alle relevante stories. |
| S1 | Finans-/terskel-/formatfasit ved berørte leveranser i Epic 3; samlet resultatdokumentasjon i Epic 5. Input/årsnormalisering fra Epic 1 er grunnlag, ikke ferdige finansberegninger. |
| S3 | Lokale mangel-/kontrolltester i Epic 1/2, komplette regel-/grense-/endringstester i Epic 3 og live-feil i Epic 4; samlet fasitrapport i Epic 5. Ingen utsettelse av logikknære tester til leveransekontrollen. |
| S2 | Fasit før modellkjøring i Epic 2/4; original live-evaluering i Epic 4. Epic 5 sammenstiller faktiske resultater, aldri demotester som live-treffbevis. |
| S4 | Inputkilder i Epic 1, original/funn/TG3 i Epic 2, samlet sporbarhet i Epic 3; kontrollert i Epic 5. |
| S6 | Inkrementell kjørbarhet i Epic 1–3; faktisk README-basert ren kjøring av annen person i Epic 5. Ingen nøkkel/betalt konto/eksternt nett under demo. |

### UX-dekning per epic

| Epic | UX-DR som realiseres / videreføres |
|---|---|
| 1 | UX-DR1–UX-DR9, UX-DR20 (nødvendige lokale mangelutfall), UX-DR24/UX-DR25, UX-DR27/UX-DR28, UX-DR32/UX-DR34–UX-DR37/UX-DR40. Registrert verdi/årsgrunnlag vises etter Tallgrunnlags kontrakt; nøkkeltallenes format/visning i UX-DR21/UX-DR22/UX-DR29 leveres i Epic 3. |
| 2 | UX-DR1–UX-DR4/UX-DR7/UX-DR10–UX-DR19/UX-DR24/UX-DR25, UX-DR27/UX-DR28/UX-DR30–UX-DR38/UX-DR40; UX-DR41s rapport-/kontroll-/feilforløp. |
| 3 | UX-DR2/UX-DR4/UX-DR9/UX-DR16/UX-DR18–UX-DR26, UX-DR29/UX-DR32–UX-DR36/UX-DR38–UX-DR41. Resultatets snapshot/utkastopplysning kobles til eksisterende state, ingen ny historikkfunksjon. |
| 4 | Eksisterende UX-DR1/UX-DR10/UX-DR11/UX-DR24/UX-DR25/UX-DR33/UX-DR36–UX-DR38/UX-DR40/UX-DR41 med ekte live-status/feil. Ingen ny skjerm eller konfigurasjonsreise. |
| 5 | Verifiserer UX-DR1–UX-DR41 der de er realisert; særlig UX-DR30–UX-DR35/UX-DR41 gjennom tastatur, panel/Esc/retur, status, kontrast, zoom og anbefalingsforståelse. Retter eventuelle avvik innen låst UX. |

## Epic List

**Godkjent og låst fem-epic-struktur.** De godkjente forbedringene og presiseringen om faktisk live KI-analyse er innarbeidet. Epicene følger brukerens arbeid og leveransemottakerens kontroll. Grunnstruktur, finans, PDF, adapter og UI er atskilte arbeidsområder innen disse brukerutfallene; de er ikke egne horisontale epics. Storyoppdelingen følger i steg 3 med gjennomgang før innarbeiding.

### Epic 1: Etablere et kontrollert økonomigrunnlag i en kjørbar lokal app

Investoren kan starte den lokale appen, registrere P/L/D/J/Ymin med kilde, kostnadsinnhold og periode/år, rette feil og bekrefte grunnlaget. Nødvendige lokale mangelutfall og neste handling forstås i Tallgrunnlag gjennom felles kodebasert prioritet-1-vurdering i domain. Denne vurderingen brukes videre i komplett screening i Epic 3. Retur mellom tilgjengelige trinn bevarer gyldig kontroll.

**FRs covered:** FR-1, FR-2, FR-3, FR-4; nødvendig lokal mangelvurdering/begrunnelse/neste handling etter FR-16 og FR-17. Finansberegninger, økonomiske terskler og komplett screening leveres i Epic 3.

**Kravspor:** CAP-1, lokal mangeldel av CAP-6 og grunnlag for CAP-7/CAP-8; NFR-1–NFR-4; S3/S4 og lokal startdel av S6; AD-1/AD-2/AD-7/AD-8/AD-9/AD-10. CAP-5/S1 realiseres med finans i Epic 3. UX: Tallgrunnlag, app-header/stepper, financial-confirmation og lokale issue-message; øvrige UX-spor står i tabellen over.

**Arbeidsgrenser:** Offisiell Vite react-ts/startstakk og importstruktur etableres først; fungerende lokal build/start/dev/appskall er en separat leveranse fra mappestruktur. Registrering/kilder/kostnader, ren inputvalidering/årsnormalisering og frontendbekreftelse holdes atskilt. Desimalinput, registrert verdi, faktor, anvendt årsgrunnlag og tilhørende kilde/kostnadsinnhold bevares presist. Felles domain-vurdering av kritiske mangler leverer nødvendige lokale Innhent mer informasjon-utfall med fast begrunnelse/neste handling. Dokument-/kontrollmangler kobles til samme autoritet i Epic 2; komplett screening med finans/økonomiske terskler ferdigstilles i Epic 3. Fravær av feltfeil er ikke bevis for komplett kritisk grunnlag. Ingen UI/Express-/adapterkopi av regler eller ny økonomioversikt i Tallgrunnlag innføres.

**Separat demonstrerbar verdi:** Appen kjører, gyldig og ugyldig tallgrunnlag kan registreres/kontrolleres med tydelige lokale mangler, og gjeldende tall kan bekreftes. Dette brukerutfallet krever ikke ferdige nøkkeltallsberegninger, PDF eller live-kall. Uten fullført rapportgrunnlag kan leveransen ikke gi konklusiv økonomisk screening.

**Avhengigheter:** Ingen tidligere epic. Brukerutfallet avgrenses slik at det skal kunne leveres uten Epic 2–5; dette kontrolleres mot faktiske stories før readiness konkluderes. Nødvendige schemas etableres før første bruk innen eksisterende contracts; ingen ny produkt-/arkitekturbeslutning.

**Logikknær verifikasjon:** Rene input-/årsnormaliserings-/mangelfunksjoner kontrolleres for null/blank, ugyldige tall, år/måned/ulike år, kildekonflikter og kostnadsdeling D/J mot relevant FR-/BT-/AT-fasit. For eksempel skal svake F2-tall uten tilstrekkelig rapportgrunnlag fortsatt gi Innhent mer informasjon. Frontendbekreftelse/endring/retur har rene overgangstester; faktisk lokal start og Tallgrunnlag har relevante UI-/manuelle kontroller. Finans-, terskel- og full screening-fasit følger berørte leveranser i Epic 3. Testing og tilgjengelighet følger hver funksjonsleveranse.

### Epic 2: Kontrollere én tilstandsrapport med originalkilde i lokal demo

Investoren kan velge en støttet tilstandsrapport, eksplisitt hente et merket lagret uttrekk gjennom den ekte dokumentpipelinen og kontrollere alle funn mot original-PDF. Han kan bruke eller avbryte rettinger, avvise feilaktige KI-uttrekk, registrere separat TG3-avklaring og bekrefte gjeldende liste. Feil og usikkerhet forstås i trinnet der de oppstår.

**FRs covered:** FR-5, FR-6 (felles dokument-/analyseforløp og demo), FR-7 (felles uttrekkskontrakt/visning), FR-8, FR-9, FR-10, FR-11. Ekte KI-uttrekk i FR-6/FR-7 leveres i Epic 4 som del av v1. Felles prioritet-1-vurdering etter FR-16/FR-17 brukes for lokale blokkere.

**Kravspor:** CAP-2/CAP-3/CAP-4 og rapportdelen av CAP-7/CAP-8; NFR-1–NFR-5; S3/S4 og grunnlag for S2/S5/S6; AD-1–AD-6/AD-8–AD-10. UX: Tilstandsrapport og Kontroller funn, inklusiv side-ved-side/PDF-panel, utkast og separate kontroll-/avklaringsbegreper.

**Arbeidsgrenser:** Skill PDF-format/30-sidersvalidering fra sidemerket tekstuttrekk og lesbarhets-/layoutkontroll. Skill felles runtime-kontrakt/kildekontroll fra rapport-/versjonsbundet demo-adapter og HTTP-forløpets duplikat-/gamlesvarvern. UI for analysestart/status, original-PDF, funnkontroll, utkast/Bruk/Avbryt/avvisning, TG3 og listebekreftelse deles videre i små arbeidsenheter. Fiktive rapporter, uavhengig dokumentfasit og lagrede uttrekk er faktisk implementeringsarbeid og må leveres før bruk med riktig bytehash/versjon. Backendfeil er dokument-/analyseutfall; domain eier lokal mangelvurdering. Demo leverer lagrede svar og dokumenterer kontrollflyten, mens faktisk KI-analyse og dens kvalitet leveres/evalueres i Epic 4.

**Milepæl 1 — rapport, uttrekk og korrekt originalside:** En faktisk støttet rapport går gjennom dokumentpipeline, kontrakt og merket demo-adapter. Alle lagrede funn/usikkerheter er synlige med dokument/PDF-side, og valgt funn kan kontrolleres på korrekt originalside med tilgang til hel side/nabosider. Dokument-/analysefeil er egne synlige tilstander. Dette er ikke en brukerbekreftet funnliste eller et komplett screeningresultat.

**Milepæl 2 — korrigering, TG3-håndtering og bekreftelse av funnlisten:** Original, utkast, brukt korrigering/avvisning og kontrollstatus kan skilles. Bruk/Avbryt, separat brukerregistrert TG3-status/begrunnelse/grunnlag og gjeldende listebekreftelse fungerer etter låst UX. Uavklart TG3 kan beholdes etter kontroll og behandles fortsatt som kritisk mangel. Milepælene er demonstrasjoner innen samme brukerflyt, ikke nye skjermer/brukerhandlinger eller to store stories.

**Separat demonstrerbar verdi:** Etter Epic 1 kan først rapport/kilde og deretter hele rapport-/kontrollarbeidet demonstreres offline i demo, inklusive alvorlig TG3 som fortsatt er Uavklart etter kontroll. Original, retting, avvisning og listekontroll kan etterprøves uten Resultat-flaten i Epic 3 eller leverandørvalget i Epic 4. Dette ferdigstiller kontrollflyten for lagret uttrekk, mens produktets faktiske KI-analyse fortsatt må leveres i Epic 4.

**Avhengigheter:** Epic 1s kjørbare app, finansbekreftelse og felles contracts/domain med lokal mangellogikk. Dokument-/analyseskjema må være felles og definert før første forbruker. Dokumentansvar avklarer lesbarhetskontroll før uttrekk aksepteres som gyldig; backendansvar avklarer upload-/HTTP-timeoutgrenser og opprydding før HTTP-integrasjon. Disse eksisterende avklaringspunktene utsettes ikke til live-epicen. Demo krever ikke leverandør/modell/budsjett. Konkrete storyavhengigheter kontrolleres etter oppdelingen.

**Logikknær verifikasjon:** Faktiske PDF-bytes med 30/31 sider/format/tekst-/layoutfeil og korrekt side→tekst; kontrollerte kontrakt-/adapter-/HTTP-svar med gyldig tomliste, usikkerhet, mismatch, feil/timeout, duplikat/klientavbrudd/sent svar og fravær av fallback/ekstra kall. Rene reducer-tester for utkast/Bruk/Avbryt/avvisning, bekreftelse og TG3-binding. RT-fasit og sju FR-5-eksempler brukes der logikken leveres. PDF-/tastatur-/panelforløp kontrolleres sammen med berørt UI. Testene fordeles mellom relevante stories innen de to milepælene.

### Epic 3: Beregne, forstå og oppdatere ett samlet screeningresultat

Investoren kan fullføre demoens UJ-1, se fire etterprøvbare nøkkeltall og én begrunnet anbefaling og kontrollere tall, rapportfunn, kilder og mangler. Han kan gå tilbake og endre grunnlaget, bekrefte det som faktisk er endret og få et nytt gjeldende resultat uten ny analyse av uendret rapport.

**FRs covered:** FR-12, FR-13, FR-14, FR-15, FR-16, FR-17, FR-18. Nødvendig lokal mangellogikk fra Epic 1/2 gjenbrukes ved ferdigstillelse av komplett screening. Resultat-/returdelen av FR-5, FR-6, FR-10 og FR-11 videreføres uendret.

**Kravspor:** CAP-5/CAP-6/CAP-7/CAP-8; NFR-1/NFR-2/NFR-3/NFR-5; S1/S3/S4 og kontrollflyt til S5/S6; AD-1/AD-2/AD-6–AD-10. UX: Resultat, recommendation/metric-grid/basis-detail/detail-disclosure/stale-result og Key Flows 1–4.

**Arbeidsgrenser:** Fire rene finansberegninger og gyldighet per nøkkeltall, eksakte økonomiske thresholds og separat norsk nøkkeltallsformat er egne testbare arbeidsenheter. Registrert/normalisert grunnlag fra Epic 1 brukes uten nye fratrekk eller mellomavrunding. Komplett screening med prioritet 1–3 og fast begrunnelse/neste handling gjenbruker domain-vurderingen av kritiske mangler fra Epic 1/2 før økonomiske terskler anvendes. Resultatets nøkkeltall/formler/ikke-beregnbart holdes atskilt fra anbefalingsvisning og tilgjengelige rapport-/opphavsdetaljer. Gjeldende snapshot skilles fra faktisk endring og nødvendig ny kontroll; ubrukt korrigeringsutkast påvirker ikke grunnlaget, men opplyses. TG3-endring ugyldiggjør resultat uten å kreve ny bekreftelse av uendrede tall/liste. Bare Ymin påvirker screening, ikke de fire tallene. Ny rapport krever ny analyse/kontroll; gammel/sen analyse kan ikke bli gjeldende. Én regelautoritet i domain beholdes; backend gir ingen finansresultat eller anbefaling.

**Separat demonstrerbar verdi:** Hele lokale demovurderingen gir korrekt Gå videre/Forkast/Innhent mer informasjon med kontrollerbar begrunnelse, delberegninger og historisk/gjeldende skille. Full offline-demo kan gjennomføres før Epic 4, mens faktisk KI-analyse og live-kvalitets-/tidsbevis fortsatt gjenstår før hele v1-leveransen er verifisert.

**Avhengigheter:** Epic 1s kontrollerte årsgrunnlag og felles mangelvurdering, samt Epic 2s rapport-/kontroll-/TG3-grunnlag. Målet er ingen avhengighet til senere epics for demoutfallet; faktiske stories kontrolleres før dette konkluderes i readiness. Ingen ny navigasjonsvei som omgår låste kontrollsteg opprettes; lokale mangler er tilgjengelige i problemtrinnet selv om normal videregang er sperret.

**Logikknær verifikasjon:** Finans, beregnbarhet, thresholds, format og screening testes separat mot F1–F4 og relevant BT-/AT-/FR-5-fasit med uavhengige forventninger. Dekk negative resultater, delgrunnlag, eksakt likhet/én krone under uten toleransemargin, begge økonomiske brudd, alle prioritet-1-utløsere og identisk fast tekst/neste handling. Rene overgangstester dekker alle endringstyper kontra uendret retur. Bygget app med kontrolladapter dekker full UJ-1, ny kontroll, rapport-/funn-/TG3-endringer og ingen ekstra KI-kall; manuell test av resultatets behovsåpning/terskelforklaring/forståelse. Ingen samlet finans-/resultatstory skal erstatte separat implementerbar logikk og logikknære tester.

### Epic 4: Live KI-analyse og evaluering

Investoren kan eksplisitt starte og faktisk gjennomføre én KI-basert analyse av en ny støttet tilstandsrapport gjennom den allerede låste analyseadapteren og kontrollere uttrekket i samme flyt som demo. Integrasjon av valgt leverandør/modell og faktisk KI-analyse er del av v1. Demomodus er alternativ kjøreform for sensor/testing uten API-nøkkel og erstatter ikke dette leveransekravet. Opprinnelig live-uttrekk evalueres mot de kontrollerte casene, separat fra lagrede demosvar, for å dokumentere faktisk treffkvalitet og behandlingstid.

**FRs covered:** Live-delene av FR-6 og FR-7; live-feil i FR-9. FR-8/FR-10/FR-11/FR-15–FR-18 gjenbrukes gjennom felles kontrakt/flyt og har ingen egne live-regler.

**Kravspor:** CAP-2/CAP-8; NFR-1/NFR-4/NFR-5; S2/S5 og relevant S3/S4; AD-3–AD-6/AD-9/AD-10. Eksisterende UX for modus, analyse og feil videreføres uten ny konfigurasjonsskjerm.

**Arbeidsgrenser:** Valgt leverandør/modell integreres gjennom eksisterende smale analyseadapter med felles sidemerket input og validert kontraktretur; kontrakt/HTTP/demo får ingen konkurrerende former. Prompten omfatter alle eksplisitte TG2/TG3, uten relevansfiltrering. Én eksplisitt analysestart gir ett KI-kall med hele det støttede grunnlaget; ingen skjult avkorting, automatisk retry/SDK-retry eller live-fallback. Nøkkel/leverandørkall er bare i backend. Kontrollerte offline-adaptertester holdes atskilt fra faktisk live-evaluering av de kontrollerte casene, med uavhengig fasit før kjøring. Evalueringen måler originaluttrekket før brukerretting og dokumenterer riktige/oversette/oppdiktede funn og feil sidetall per rapport. S5 måles separat fra demo etter fast protokoll. Ingen ny leverandørplattform, regelmotor eller konfigurasjonsskjerm innføres.

**Separat demonstrerbar verdi:** Produktet kan utføre ekte KI-analyse av en støttet rapport og bruke uttrekket i eksisterende kontroll-/resultatflyt. Evalueringsbevis viser faktisk S2/S5-status. Brukeren kan velge demo uten nøkkel ved kjøring, men selve live-funksjonaliteten kan ikke utelates fra v1 eller erstattes med lagrede svar. Manglende live-konfigurasjon gir en trygg kjent feil og påvirker ikke demoens kjørbarhet.

**Avhengigheter:** Epic 1–3 for samlet vurderingsflyt. Mads + live-integrasjon avklarer valgt leverandør, modell, SDK, kontekst/output, pris/kostnadsramme og konkrete leverandør-/live-timeouter før denne integrasjonen implementeres eller betalte tester kjøres. Endelige verdier fastsettes ikke i epic-planen. De tidligere avklaringspunktene for PDF-lesbarhet, upload/HTTP-ressurser og opprydding i Epic 2 beholdes; S5s medianmål blir ikke en hard femminutters timeout. Fasit skal finnes før modellkjøring. Dette viderefører arkitekturens Deferred med brukerens presisering av live-leveransen.

**Logikknær verifikasjon:** Kontrollerte adapter-/feiltester uten betalt API, korrekt kontrakt/usikre kandidater, hele inputen, ingen ekstra kall/retry/nøkkellekkasje. Faktisk live-analyse og separat evaluering mot F1–F4 og dokumentfasit med alle eksplisitte TG2/TG3; hvert kjent TG3 kontrolleres enkeltvis. Bruk RT-16–RT-18/S2, relevante feil-/regelvarianter og TT-/S5-protokoll, med demo/live atskilt og opprinnelig uttrekk før brukerretting. Ingen påstand om bestått S2/S5 før faktiske bevis.

### Epic 5: Gjennomføre og etterprøve v1 som sensor fra README

En annen person kan installere, bygge, starte og teste appen etter README i rent dokumentert lokalt miljø, og gjennomføre hele merkede demoen uten gruppens nøkkel, betalt konto eller eksternt nett under vurderingsflyten. Gruppen kan vise hvilke krav som er verifisert, hvilke feil som er rettet og hvilke eventuelle akseptansemål som fortsatt ikke er nådd.

**FRs covered:** Samlet verifikasjon av FR-1–FR-18; denne epicen innfører ingen nye produktfunksjoner og erstatter ikke tester i de tidligere epicene.

**Kravspor:** CAP-1–CAP-8 som leveransekontroll; NFR-1–NFR-5; S1–S6/K1–K3; AD-1–AD-10; faglærer/sensor/AGENTS.md. S2 og live-delen av S5 bygger på faktiske bevis fra Epic 4, aldri demo.

**Arbeidsgrenser:** Samlet bygget-app-E2E/regresjon og manuell UX holdes atskilt fra README-/ren-miljø-kjøring og sammenstilling av evaluerings-/prosessbevis. README følger de faktiske kommandokontraktene og lokal adresse, browserforberedelse, fiktive data, lokal konfigurasjon for live-kjøring og plan-/prosesslenker. Den beskriver at demo kan kjøres uten nøkkel, mens produktets faktiske KI-analyse leveres gjennom Epic 4. Faktiske testresultater, manuelle feil/rettinger og S1–S6-status lagres i .docs/implementation-artifacts/ med kravspor. Kontroller versjonerte filer/historikk/testdata/.gitignore for hemmeligheter/private originaler/byggeartefakter. Ingen egen testportal, telemetri, CI-plattform eller revisjonsfunksjon opprettes.

**Separat demonstrerbar verdi:** Leveransen kan kjøres og etterprøves av mottakeren med dokumenterte resultater fremfor planpåstander. Offline-delen av S6 kan verifiseres selv om live-integrasjon/evaluering ennå avventer avklaring; samlet v1-leveranse kan da ikke erklæres komplett. Faktisk KI-analyse og S2/live-S5-bevis må fremgå med reell status, uten at bestått demo brukes som erstatning.

**Avhengigheter:** Epic 1–3 for README/demo/UX/finans-/regelbevis. Epic 4s faktiske kjøringer for S2/live-S5-sammenstilling. Annen person og et rent dokumentert miljø kreves for S6; dette kan ikke erstattes av at utviklingsagenten gjentar egen lokal oppskrift. Ingen senere epic.

**Logikknær verifikasjon:** Kjør dokumenterte npm-testkommandoer og bygget-app-E2E med kontrolladapter. Dokumenter manuell tastatur/fokus/PDF-panel/zoom/kontrast-/forståelseskontroll, samme-case manuell S5-referanse og faktisk annen-person-S6. Koble bevis/funn/retting til de relevante stories/krav/testeksempler; ikke krev ny dekningsprosent eller alle tenkelige testtyper.

### Rekkefølge, avhengigheter og avgrensning av felles filer

Hovedrekkefølgen er **Epic 1 → Epic 2 → Epic 3 → Epic 4 → Epic 5**. Epic 5s README-/offline-demo-/UX-kontroll kan forberedes og gjennomføres etter Epic 3; sammenstillingen av faktisk KI-funksjonalitet og live-kvalitet/-tid krever Epic 4. Målet er at ingen tidligere epic trenger en senere epic for sitt avgrensede brukerutfall. Fravær av skjulte storyavhengigheter og faktisk gjennomførbarhet skal kontrolleres etter konkret storyoppdeling og i implementation readiness; dette er ikke bevist av fem epic-overskrifter. Fullført demo etter Epic 3 erstatter ikke live-leveransen i v1.

Felles berøring av reducer/contracts/domain er nødvendig for samme aktive vurdering og betyr ikke separate eiere. Epic 1 etablerer kontrollert tallgrunnlag og nødvendig felles lokal mangelvurdering. Epic 2 føyer til dokument-/uttrekks-/kontrolltilstander og deres validering mot samme autoritet. Epic 3 leverer finans, økonomiske terskler, komplett screening og revisjonsbundet resultat ved å gjenbruke mangeldelen. Epic 4 integrerer valgt modell/leverandør ved den eksisterende analyseadapteren og leverer faktisk KI-analyse med evaluering. Epic 5 kontrollerer den leverte helheten. Kontrakter detaljeres før sin første bruk, uten to konkurrerende former. Ingen KI-genererte anbefalinger eller parallelle UI-/backendregler innføres.

PDF-mottak, analyse/status, kildekontroll og funnhåndtering er samlet i Epic 2 med to demonstrerbare milepæler og senere små stories. Finans, økonomiske terskler, komplett screening og resultat er atskilte arbeidsenheter i Epic 3. Live KI-analyse har egen epic på grunn av integrasjons-/kostnads-/evalueringsarbeidet, og er en del av v1. Sensor-epicen har annen-person-kjøring og faktiske bevis som eget mottakerutfall; tester og tilgjengelighet skal fortsatt leveres sammen med hver funksjonsdel. Ingen bestemt storymengde, tidsbruk eller gjennomførbarhet er fastslått før storyoppdelingen er vurdert.

### Epic-strukturens godkjenning og storyprogresjon

Mads' C etter innarbeiding av Apply-presiseringen låste den reviderte strukturen og startet steg 3. Fem epics dekker alle 18 FR, fem NFR, åtte CAP-er, ti AD-er, alle 41 UX-DR og S1–S6 på epic-nivå. Dette er planleggingsdekning, ikke implementation readiness eller verifisert produkt.

## Epic 1: Etablere et kontrollert økonomigrunnlag i en kjørbar lokal app

Investoren kan starte appen, registrere finansverdier med periode/år, kilde og kostnadsinnhold, forstå lokale mangler, rette og bekrefte gjeldende grunnlag. Epicen leverer nødvendig felles prioritet-1-vurdering. De fire finansberegningene, økonomiske terskler og komplett screening ligger i Epic 3. Faktisk KI-analyse ligger i Epic 4.

| Story | Avgrenset leveranse | Direkte forutsetninger |
|---|---|---|
| 1.1 | Reproduserbar startstruktur og importgrenser | Ingen |
| 1.2 | Faktisk lokal build/start og godkjent appskall | 1.1 |
| 1.3 | Manuell registrering og bevart rågrunnlag | 1.2 |
| 1.4 | Ren tallvalidering og eksakt årsnormalisering | 1.3 |
| 1.5 | Synlige kilder, kostnadsinnhold og konflikter | 1.3, 1.4 |
| 1.6 | Felles kodebasert vurdering av kritiske mangler | 1.4, 1.5 |
| 1.7 | Kontroll/bekreftelse, lokale feil og berørt ny kontroll | 1.2, 1.3, 1.5, 1.6 |

Avhengighetene går bare til tidligere stories. Hver story kan verifiseres ved sin leveransegrense uten en framtidig story. De rene modulstoryene må ikke kreve at senere UI er ferdig for å testes. Appens komplette Tallgrunnlag-flyt er epicens samlede brukerutfall, ferdig etter 1.7. Dette er foreløpig størrelses-/avhengighetsvurdering av Epic 1, ikke full implementation readiness eller et timeestimat.

### Story 1.1: Etablere reproduserbar startstruktur og importgrenser

Som utvikler,
vil jeg ha den godkjente starteren, versjonert installasjonsgrunnlag og tydelige modulgrenser,
slik at videre arbeid kan bygges på samme lokale grunnlag uten konkurrerende regel- eller kontraktkode.

**Kravspor:** NFR-3/NFR-4; lokal forutsetning for S6; AD-1/AD-9/AD-10; SPEC CAP-8 og grensekontraktens modul-/kontrakteierskap. Ingen direkte bruker-FR eller ferdig UI dekkes alene. UX-tokens tas i bruk i 1.2.

**Avhengigheter:** Ingen. **Arbeidsgrense:** Offisiell Vite react-ts, én package.json/package-lock.json, TypeScript/Oxlint og nødvendig struktur/konfigurasjon innen låst startstakk. Legg til avhengigheter ved første behov med spine-versjonen. Ingen komplett framtidig datamodell, analysekontrakt, finansmodul, database eller appserver leveres her.

**Acceptance Criteria:**

**Given** et rent dokumentert lokalt miljø med Node.js 24.21.0 og repoet
**When** utvikleren oppretter startgrunnlaget fra offisiell Vite react-ts med de nødvendige låste versjonene
**Then** én package.json og package-lock.json beskriver samme avhengighetstre, og npm ci kan gjenskape installasjonen
**And** versjonsavvik/inkompatibilitet rapporteres for avklaring; ingen låst pin byttes i stillhet. **(AC1)**

**Given** startgrunnlaget og den nødvendige TypeScript-/lintkonfigurasjonen
**When** dokumenterte type- og lintkontroller kjøres
**Then** faktisk kildekode/config kan kontrolleres uten feil i det dokumenterte miljøet
**And** kontrollen avhenger ikke av live-nøkkel, betalt tjeneste eller framtidige moduler. **(AC2)**

**Given** den etablerte strukturen
**When** importene gjennomgås
**Then** frontend, backend, domain og contracts har ansvar/importretning etter AD-1, og domain/contracts har ingen UI-, server- eller I/O-avhengighet
**And** bare nødvendig kode opprettes; framtidig finans-/PDF-/KI-logikk eller kopierte kontrakttyper bygges ikke på forskudd. **(AC3)**

**Given** installasjon og lokalt utviklingsarbeid
**When** filene klargjøres for versjonering
**Then** avhengigheter, byggeartefakter, lokale hemmeligheter og private originaler holdes utenfor Git
**And** nødvendig prosjektkonfigurasjon/låsfil og en kort faktisk installasjons-/kontrolloppskrift kan versjoneres uten hemmeligheter. **(AC4)**

**Testkrav:** Reell npm ci i dokumentert rent miljø, type/lint og konkret kontroll av import-/Git-grenser. Lagre faktiske kommandoer/funn under .docs/implementation-artifacts/ ved implementering. Ingen dummy-enhetstester eller tomme testsuksesser for mapper/konfigurasjon. Appens startbarhet er separat i 1.2; hele S6 er fortsatt senere leveransekontroll.

### Story 1.2: Starte den bygde lokale appen med godkjent appskall

Som investor,
vil jeg kunne starte appen lokalt og se hvor jeg er i vurderingsflyten,
slik at jeg kan begynne arbeidet uten nøkkel, betalt konto eller ekstern driftstjeneste.

**Kravspor:** NFR-2/NFR-3/NFR-4; lokal del av S6; AD-1/AD-2/AD-9/AD-10; SPEC CAP-8. UX-DR1–UX-DR4/UX-DR25/UX-DR27/UX-DR28/UX-DR34/UX-DR35/UX-DR40; DESIGN-tokens og EXPERIENCE Information Architecture/app-header/stepper.

**Avhengigheter:** 1.1. **Arbeidsgrense:** Faktisk lokal frontend/server, build/start/dev, systemfont og appskall. Registreringsfelt, rapportanalyse og resultater kommer i sine stories; de presenteres ikke som ferdige gjennom denne leveransen.

**Acceptance Criteria:**

**Given** installert prosjekt fra 1.1
**When** brukeren kjører npm run build og deretter npm run demo
**Then** én Express-prosess på dokumentert loopback-adresse serverer bygget frontend og gir samme origin for senere /api
**And** oppstart og appskall fungerer med eksternt nett sperret og uten API-nøkkel/KI-klient. **(AC1)**

**Given** utviklingsmiljøet
**When** npm run dev kjøres
**Then** den dokumenterte utviklingskommandoen starter nødvendig Vite/Express-forløp uten at brukeren må gjette ekstra kommandoer
**And** README/oppskriften angir faktisk adresse og forutsetninger. **(AC2)**

**Given** appskallet ved start
**When** arbeidsflaten vises
**Then** produktnavn, «Demo · lagret KI-uttrekk» og de fire eksakte trinnnavnene Tallgrunnlag → Tilstandsrapport → Kontroller funn → Resultat er synlige med nummer/tekststatus
**And** Tallgrunnlag er gjeldende, framtidige trinn er sperret med relevant forklaring, og ingen kontroll/analyse/resultat er feilaktig markert fullført. **(AC3)**

**Given** appskallet på vanlig desktop og ved zoom
**When** brukeren navigerer med tastatur eller ruller arbeidsinnhold
**Then** gjeldende status kan forstås uten farge, fokus er synlig og stepperen dekker ikke fokusert innhold
**And** DESIGNs eksakte grafitt/petrol-/font-/geometritokens brukes; ved ombryting beholdes navn/nummer/status. **(AC4)**

**Given** den statiske serveren
**When** appressurser og URL-er til reporot/private filer etterspørres
**Then** nødvendige lokale appressurser leveres, mens reporot og private dokumenter ikke eksponeres
**And** bare trygg modusmetadata kan nå frontend; ingen nøkkel vises i app eller feilutdata. **(AC5)**

**Testkrav:** Reell bygget-app-start på loopback, dev-oppstart, ekstern nettblokkering og HTTP-kontroll av ressursgrensen. Manuell tastatur/zoom/stepper-/tokenkontroll for skallet med faktisk kontrast på tekst/fokus. Kontrollen bruker ingen ennå ikke implementert rapportpipeline og krever ingen kunstig grønn npm test. Full demo og S6 bekreftes senere.

### Story 1.3: Registrere og bevare finansverdier for ett objekt

Som investor,
vil jeg registrere P, L, D, J og Ymin med tydelige enheter og perioder,
slik at mine egne tall bevares som grunnlag for kontroll.

**Kravspor:** Registreringsdelen av FR-1/FR-3; NFR-1/NFR-2; AD-1/AD-2/AD-7/AD-9; SPEC CAP-1/CAP-7 og finansverdiens registrerte grunnlag. UX-DR5/UX-DR6/UX-DR25/UX-DR32/UX-DR34/UX-DR35/UX-DR37/UX-DR40; value-field/period-control.

**Avhengigheter:** 1.2. **Arbeidsgrense:** Råregistrering og aktiv frontendøkt for ett objekt. Ren normalisering leveres i 1.4, kilde-/kostnadskontroll i 1.5 og komplett bekreftelses-/feilflyt i 1.7. Denne storyen kan verifiseres som registrering uten å hevde at grunnlaget er gyldig eller bekreftet.

**Acceptance Criteria:**

**Given** et nytt Tallgrunnlag
**When** feltene vises
**Then** P/L/D/J/Ymin er blanke og ubekreftede, med synlige etiketter og NOK/prosent
**And** P forklares som totalpris inklusive eventuell fellesgjeld uten kjøpsomkostninger, D som eierbetalt drift og J som renter/avdrag inklusive eventuell fellesgjeld. **(AC1)**

**Given** L/D/J for det aktuelle objektet
**When** brukeren registrerer tall og tilhørende år/periode
**Then** registrert verdi og eksplisitt år/måned/årstilknytning bevares uten automatisk gjetting av manglende opplysninger
**And** P og Ymin får ingen automatisk årsnormalisering. **(AC2)**

**Given** inntastet tall, eksplisitt 0 eller slettet innhold
**When** registreringen oppdateres
**Then** råverdien bevares, og blank, 0 og ubekreftet registrering er forskjellige tilstander
**And** ingen skjult standardverdi eller bekreftelse innføres for å gjøre grunnlaget komplett. **(AC3)**

**Given** registrert grunnlag i den aktive frontendøkten
**When** brukeren besøker et tilgjengelig trinn og går tilbake uten å endre data
**Then** registrert innhold og kontekst er bevart
**And** navigasjonen er ingen analyse, kontroll eller datamutasjon; lukking/sideoppdatering gir ingen lovnad om varig gjenopptak. **(AC4)**

**Testkrav:** Kontroller feltenes definisjoner/enheter/perioder og at registrering/sletting/0 skilles, med kontrollerte F1-/F3-inputverdier. Verifiser bevart innhold ved aktuell trinnretur og tydelig ubekreftet status. Ingen beregningsfasit kreves før finansmodulen; visuelle/manuelle feltkontroller og relevante rene tilstandstester brukes uten betalt API.

### Story 1.4: Validere tall og normalisere kjent månedsgrunnlag eksakt

Som investor,
vil jeg at tall og perioder vurderes konsekvent før de brukes,
slik at mangler, ugyldige verdier og blandede årsgrunnlag ikke blir beregningsgrunnlag.

**Kravspor:** FR-1/FR-3 og normaliseringsgrunnlaget til FR-12/FR-14; NFR-1; S3 og grunnlag for S1/S4; AD-1/AD-7/AD-10; SPEC CAP-1 og grensekontrakten Finans og screening. UX-DR6s anvendte årsgrunnlag og UX-DR5s feilgrunnlag; UI-integrasjon av lokale feil følger i 1.7.

**Avhengigheter:** 1.3. **Arbeidsgrense:** Én ren inputvaliderings-/årsnormaliseringsautoritet med nødvendige delte typer. Beregner ikke yield/NOI/kontantstrøm og vurderer ingen økonomisk terskel. Modulen kan testes direkte uten senere UI.

**Acceptance Criteria:**

**Given** registrerte finansverdier
**When** ren validering kjøres
**Then** P må være >0 og L/D/J/Ymin ≥0; ikke-numerisk input er ugyldig
**And** blank er manglende, mens numerisk 0 beholdes med behov for eksplisitt bekreftelse, uten at P=0 blir gyldig. **(AC1)**

**Given** kjent månedlig L/D/J for samme år
**When** grunnlaget normaliseres
**Then** hver månedsverdi multipliseres eksakt med 12, med registrert verdi/periode/år/faktor/anvendt årsverdi bevart
**And** kanoniske desimalstrenger og låst desimalbibliotek brukes uten Number/parseFloat før eksakt aritmetikk. **(AC2)**

**Given** L=120000, D=20000 og J=50000 per måned
**When** normalisering kjøres
**Then** årsverdiene er henholdsvis 1440000, 240000 og 600000
**And** årsregistrerte beløp bevares uten faktor 12; P og Ymin endres ikke. **(AC3)**

**Given** ukjent/ustøttet periode eller verdier som gjelder ulike år
**When** grunnlaget valideres
**Then** berørt grunnlag er utilstrekkelig med konkret årsak/berørt felt
**And** ingen periode, vekst, ekstra fratrekk eller sammenlignbart år gjettes. **(AC4)**

**Given** samme registrerte grunnlag flere ganger
**When** validering/normalisering gjentas
**Then** resultat og årsaker er identiske uten mutasjon av input eller kumulativ multiplikasjon
**And** de registrerte verdiene er fortsatt tilgjengelige for senere brukerkontroll. **(AC5)**

**Testkrav:** Vitest mot uavhengig inputfasit: P=0/negativ, negativ L/D/J/Ymin, ikke-numerisk, hver blankverdi og bekreftet/ubekreftet 0. Normaliseringsdelen av BT-7/BT-15/BT-16, måned/år-blanding med felles gyldig årsgrunnlag, presise desimalbeløp og gjentatt normalisering. Hele BT-eksemplets nøkkeltall/terskler testes i Epic 3. Feil og mangel må kunne konsumeres uten lokal ny valideringslogikk i UI.

### Story 1.5: Gjøre kilder, kostnadsinnhold og uløste konflikter kontrollerbare

Som investor,
vil jeg se hvor tallene kommer fra og hvilke kostnader som er inkludert,
slik at jeg kan rette kildekonflikter og unngå dobbelttelling før bekreftelse.

**Kravspor:** FR-2 og relevant FR-3/FR-4; NFR-1/NFR-2; S3/S4; AD-1/AD-2/AD-7/AD-10; SPEC CAP-1 og finansverdiens kilde/kostnadsinnhold/konflikt. UX-DR5/UX-DR7/UX-DR8/UX-DR24/UX-DR34/UX-DR35/UX-DR40; source-note/cost-breakdown.

**Avhengigheter:** 1.3 og 1.4. **Arbeidsgrense:** Kilde-/brukerforutsetning og kontrollerbart D-/J-innhold på Tallgrunnlag, med tilhørende felles validering. Ingen automatisk uthenting, kostnadsestimering, låneplan eller ekstra kostnadsmodell. Storyen bestemmer ingen ny felt-/radmekanisme utover final UX.

**Acceptance Criteria:**

**Given** P/L/D/J/Ymin i det registrerte grunnlaget
**When** brukeren oppgir kilde eller egen forutsetning
**Then** opphavet er synlig og knyttet til verdien som skal brukes
**And** forventet leie merkes ikke som dokumentert faktisk leie uten slikt grunnlag. **(AC1)**

**Given** inkluderte og overlappende driftskostnadsposter
**When** kostnadsinnholdet kontrolleres
**Then** brukeren kan se hvilke poster som allerede inngår i andre, og samme post legges ikke til to ganger
**And** gjeldsbetjening behandles i J, uten å telle den samtidig i D. **(AC2)**

**Given** felleskostnader på 120000 hvor 20000 er renter/avdrag
**When** dette innholdet registreres og vurderes
**Then** bidraget er D=100000 og J=20000 med synlig oppdeling
**And** andre registrerte kostnader/gjeldsposter endres ikke gjennom skjult standard eller nytt fratrekk. **(AC3)**

**Given** to uløste kildeverdier for samme kritiske felt
**When** det gjeldende grunnlaget vurderes
**Then** konflikten og de aktuelle kildeverdiene er synlige og berørt verdi er utilstrekkelig
**And** appen velger ikke automatisk den laveste, nyeste eller en foretrukket kilde. **(AC4)**

**Given** et kilde-/kostnadsgrunnlag som brukeren korrigerer
**When** registreringen oppdateres
**Then** gjeldende opphav, innhold og eventuell gjenværende konflikt kan etterprøves
**And** endringen er del av det finansgrunnlaget som senere må kontrolleres/bekreftes, ikke bare en kosmetisk merknad. **(AC5)**

**Testkrav:** Uavhengig FR-2-fasit 120000=100000+20000, opplyst kostnadsoverlapp uten dobbeltføring og renter/avdrag utenfor D. Test uavklart L-konflikt fra Brief-addendum/BT-14/AT-12 som utilstrekkelig input, uten å kreve finansberegning. Kontroller manuelt at fem verdier har synlig opphav og at forventet leie/kostnadsinnhold forstås. Mangler/konflikter går til samme domain-vurdering i 1.6; ingen ny UI-regelmotor.

### Story 1.6: Vurdere kritiske mangler med fast kodebegrunnelse

Som investor,
vil jeg få samme konkrete mangelgrunnlag og nødvendige handling fra samme registrerte opplysninger,
slik at mangler ikke skjules eller overstyres av antatt god eller svak økonomi.

**Kravspor:** FR-3/FR-4 og prioritet-1-delen av FR-16/FR-17; NFR-1; S3; AD-1/AD-7/AD-8/AD-10; SPEC lokal del av CAP-6 og grensekontraktens prioritet 1. UX-DR20/UX-DR24/UX-DR36/UX-DR40 er den senere UI-konsumenten i 1.7, ikke ferdig UI i denne modulstoryen.

**Avhengigheter:** 1.4 og 1.5. **Arbeidsgrense:** Ren felles domain-vurdering og faste begrunnelser/neste handling for kjente kritiske mangler, med nødvendige kontraktdata før bruk. Finans, økonomiske terskler og full screening bygges i Epic 3; dokument-/TG3-tilstandene kobles til samme autoritet i Epic 2. Ingen komplett framtidig analyse-DTO eller providerklient opprettes nå. Modulen er separat testbar.

**Acceptance Criteria:**

**Given** kjente manglende, ugyldige, konfliktfylte eller ubekreftede kritiske verdier
**When** domain-vurderingen kjøres
**Then** alle kjente kritiske utløsere samles med berørt felt og nødvendig retting/bekreftelse
**And** disse gir det kodebaserte utfallet Innhent mer informasjon uten KI-generering. **(AC1)**

**Given** L mangler, Ymin mangler og J er ubekreftet 0 samtidig
**When** grunnlaget vurderes
**Then** alle tre forholdene og deres nødvendige handling fremgår, i stabil rekkefølge
**And** vurderingen stopper ikke etter første feil eller fyller inn tall. **(AC2)**

**Given** kontrollerte finansverdier og kjent manglende/ufullført rapportgrunnlag
**When** de kjente manglene vurderes, også med F2-tall
**Then** rapportmangelen behandles som kritisk utilstrekkelig grunnlag med konkret kjent årsak
**And** fravær av feltfeil eller svake tall gir verken Gå videre eller Forkast. **(AC3)**

**Given** samme gjeldende mangelgrunnlag
**When** vurderingen kjøres gjentatte ganger uten nett eller KI
**Then** utfall, utløsere, fast begrunnelse og anbefalingsbundet neste handling er identiske
**And** frontend/backend/adapter skal kunne bruke dataene uten egne regelkopier. **(AC4)**

**Given** at et delgrunnlag ikke har noen av de kjente manglene vurderingen mottar
**When** mangellisten er tom
**Then** tom liste er ikke i seg selv en økonomisk godkjenning eller fullstendig screening
**And** komplett grunnlags-/terskelvurdering og de tre endelige regelutfallene ferdigstilles i Epic 3 uten at tidlig mangellogikk erstattes med en parallell motor. **(AC5)**

**Testkrav:** Rene Vitest-tester av alle samtidige inputmangler, blank kontra ubekreftet 0, konflikt, stabil ordning og nøyaktig samme begrunnelse/neste handling ved gjentakelse. Bruk relevant prioritet-1-grunnlag fra AT-5/AT-12/AT-18/AT-19; bare tilgjengelig del av fasiten dekkes nå. Faktiske dokumentfeil/TG3 fra AT-18 kobles inn og verifiseres i Epic 2, og økonomiske brudd/full AT-fasit i Epic 3. Ingen UI- eller betalt API-avhengighet.

### Story 1.7: Kontrollere, bekrefte og rette gjeldende tallgrunnlag

Som investor,
vil jeg se hele tallgrunnlaget, rette lokale feil og eksplisitt bekrefte det jeg har kontrollert,
slik at rapportanalysen senere kan bruke et gyldig grunnlag med korrekt bekreftelsesstatus.

**Kravspor:** FR-1–FR-4, lokal mangelvisning etter FR-16/FR-17 og finansbekreftelsesgrunnlaget til FR-15/FR-18; NFR-1/NFR-2; S3/S4 og del av S6; AD-1/AD-2/AD-7/AD-8/AD-9/AD-10; SPEC CAP-1, lokal CAP-6 og kontroll-/endringsdel av CAP-7/CAP-8. UX-DR2–UX-DR9/UX-DR20/UX-DR24/UX-DR25/UX-DR32–UX-DR37/UX-DR40; Tallgrunnlag/financial-confirmation/Interaction Primitives.

**Avhengigheter:** 1.2, 1.3, 1.5 og 1.6, med ren normalisering fra 1.4. **Arbeidsgrense:** Faktisk Tallgrunnlag-flyt med lokale kodeutfall, feltfeil, kontroll/bekreftelse og berørt ugyldiggjøring. Ingen økonomiske nøkkeltall/anbefalingsterskler, rapportkall eller historisk resultatsnapshot; disse kommer i sine godkjente epics.

**Acceptance Criteria:**

**Given** registrert grunnlag
**When** brukeren kontrollerer før bekreftelse
**Then** registrerte verdier, enheter, perioder/år, omregningsfaktorer/anvendte årsverdier, kilder/forutsetninger og kostnadsinnhold er tilgjengelige
**And** registrering alene har ikke satt noen bekreftelse. **(AC1)**

**Given** manglende/ugyldige verdier, kildekonflikt, periodeproblem eller ubekreftet null
**When** brukeren gjør et eksplisitt bekreftelsesforsøk
**Then** feltene får konkrete tilknyttede feil, input bevares, fokus går til første berørte felt og gyldig bekreftelse settes ikke
**And** kodebasert Innhent mer informasjon, berørte lokale blokkere og nødvendig handling vises i Tallgrunnlag uten omvei til Resultat, med data fra 1.6. **(AC2)**

**Given** gyldige kontrollerte verdier inklusive J=0 ved kontantkjøp
**When** brukeren eksplisitt bekrefter det aktuelle grunnlaget og nullverdien
**Then** bekreftelsen gjelder nettopp disse verdiene med periode/år/kilde/kostnadsgrunnlag, og J=0 er gyldig
**And** blank verdi og ubekreftet null får ikke samme status; bekreftet Tallgrunnlag åpner neste trinn uten å starte analyse automatisk. **(AC3)**

**Given** bekreftet tallgrunnlag
**When** en verdi eller relevant periode/år/kilde/kostnadsinnhold faktisk endres
**Then** berørt bekreftelse oppheves, endringen synliggjøres og ny relevant kontroll kreves før gyldig bruk
**And** uendrede verdier mister ikke kontrollstatus bare på grunn av navigasjon. **(AC4)**

**Given** gjeldende registrering/bekreftelser
**When** brukeren går frem til tilgjengelig trinn og tilbake uten dataendring
**Then** registrering, kontekst og gyldige bekreftelser er bevart i samme frontendøkt
**And** navigasjon endrer ingen grunnlagsrevisjon eller utløser KI-kall; sideoppdatering/lukking gir ingen varig vurderingslagring. **(AC5)**

**Given** Tallgrunnlag og lokale statusendringer
**When** kjernehandlingene gjennomføres med tastatur eller ved zoom
**Then** etiketter/enheter/kilder/feil har semantisk tilknytning, fokus er synlig, trinnnavigasjon fokuserer overskriften og sticky stepper skjuler ikke fokusert innhold
**And** status/feil formidles med tekst og relevante korte kunngjøringer uten unødvendig fokusflytting; tekst-/kontroll-/fokuskontrast følger DESIGN. **(AC6)**

**Testkrav:** Rene reducer-tester for gyldig bekreftelse, hver relevant grunnlagsendring kontra uendret retur og eksplisitt null. Bygget-app-forløp med F1-registrering, F3-manglende L, ubekreftet/bekreftet J=0, ugyldig P, L-konflikt, ulike år, retting og ny bekreftelse; ingen rapportanalyse kreves. Manuell tastatur/zoom-/etikett-/feil-/kontrastkontroll for denne flaten. Testene skal verifisere faktisk brukerflyt og status, ikke bare at en klikkhandler kalles. Senere resultatets Utdatert-snapshot og finans-/KI-gjenbruk testes i Epic 3/2.

## Epic 2: Kontrollere én tilstandsrapport med originalkilde i lokal demo

Investoren kan hente et merket lagret uttrekk gjennom den ekte dokumentpipelinen, kontrollere kilder i original-PDF, korrigere/avvise KI-feil, håndtere alvorlig TG3 separat og bekrefte gjeldende liste. Ingen feil eller usikker kandidat blir automatisk dokumentert fakta eller fullført teknisk grunnlag.

| Milepæl | Story | Avgrenset leveranse | Direkte forutsetninger |
|---|---|---|---|
| 1 | 2.1 | Felles dokument-/analysekontrakt og usikkerhets-/feilvalidering | 1.1 |
| 1 | 2.2 | PDF-format, sidegrense og originalidentitet med faktiske fixtures | 2.1 |
| 1 | 2.3 | Sidemerket tekstuttrekk og avklart lesbarhetskontroll | 2.1, 2.2 |
| 1 | 2.4 | Rapport-/versjonsbundet demo-adapter | 2.1, 2.2, 2.3 |
| 1 | 2.5 | Ett HTTP-analyseforløp med duplikatsperre og trygge feil | 1.2, 2.1, 2.2, 2.3, 2.4 |
| 1 | 2.6 | Velge rapport, starte analyse og ta imot bare gjeldende svar | 1.6, 1.7, 2.1, 2.5 |
| 1 | 2.7 | Kontrollere funn på korrekt originalside og i PDF-panel | 2.2, 2.6 |
| 2 | 2.8 | Kontrollere og korrigere funn med original/utkast/Bruk/Avbryt | 2.1, 2.6, 2.7 |
| 2 | 2.9 | Avvise feilaktig KI-funn med bevart opphav | 2.8 |
| 2 | 2.10 | Registrere og validere forholdsbundet TG3-avklaring | 1.6, 2.8, 2.9 |
| 2 | 2.11 | Bekrefte gjeldende funnliste og vise ufullstendig grunnlag riktig | 1.6, 2.6, 2.8, 2.9, 2.10 |

Milepæl 1 er demonstrerbar etter 2.7 og milepæl 2 etter 2.11. Moduler og HTTP testes direkte før senere UI finnes; ingen story krever en senere story for sin avgrensede verifikasjon. Ingen jobbkø, database, OCR, ny brukerhandling eller ekstra dokumenttype opprettes. Antallet viser reelt avgrensede arbeidsområder i en kompleks epic, ikke elleve nye produktfunksjoner eller et tidsestimat.

### Story 2.1: Dele og validere dokument-/analysekontrakten

Som utvikler,
vil jeg ha én felles versjonert kontrakt for dokumentgrunnlag, funn, usikkerhet og feil,
slik at alle moduler skiller fullføring fra feil og bruker samme kildeidentitet.

**Kravspor:** FR-6–FR-9 og kontraktgrunnlag for FR-10/FR-11; NFR-1; S3/S4; AD-1/AD-4/AD-6/AD-10; SPEC CAP-2/CAP-3/CAP-8 og grensekontraktens sidemerkede grunnlag/analyseutfall/opprinnelig uttrekk. UX-DR11–UX-DR13/UX-DR24/UX-DR25 er senere konsumenter, ikke UI levert her.

**Avhengigheter:** 1.1. **Arbeidsgrense:** Runtime-schemas med avledede typer i contracts og felles validering av retur/kilde. Detaljeres før første forbruker innen låst betydning; ingen konkurrerende frontend-/backend-DTO eller leverandørskjema som appautoritet.

**Acceptance Criteria:**

**Given** et dokumentgrunnlag og terminalt analyseutfall
**When** felles runtime-validering kjøres
**Then** kontrakt-/uttrekksversjon, requestId, reportHash, modus, sideantall og eksplisitt completed/failed behandles etter samme schemas på begge sider
**And** pages har én post per PDF-posisjon med tekst/status; nødvendige felter eller svar kan ikke mangle og likevel bety suksess. **(AC1)**

**Given** completed med findings: [], manglende findings eller failed uten funn
**When** svarene valideres som separate varianter
**Then** bare den første er gyldig fullført tomliste
**And** document-/analysis-feil har stabil kode, berørt mål når kjent og trygg kjent årsak; eventuelle delresultater er fortsatt ufullstendige. **(AC2)**

**Given** grad/kilde/side som er uklar, mangler eller er utenfor rapportens sideantall
**When** uttrekket valideres
**Then** kontrollerbare TG2/TG3 skilles fra usikre kandidater med bevart originalt opphav og konkret kjent mangel
**And** ingen side/grad gjettes, og konfidensprosent gjør ikke kandidaten til bekreftet fakta. **(AC3)**

**Given** adapterinnhold og metadata fra backend-konteksten
**When** analysens dokument-/korrelasjonsidentitet settes og kontrolleres
**Then** reportHash og dokument/request-/modusmetadata kommer fra kode og faktisk mottatt rapportkontekst, ikke fra modellvalgte verdier
**And** gyldig struktur/kildeområde påstås ikke å bevise semantisk fullstendighet eller brukerbekreftelse. **(AC4)**

**Testkrav:** Vitest mot gyldig funnliste/tomliste, manglende/ugyldige felter/versjoner/terminalstatus, feil med/uten delresultat og RT-7s usikre/umulige kilder. Test metadata som forsøkes erstattet av adapteren. Ingen betalt API, PDF-parser eller senere UI kreves; faktisk bytehash og klientkorrelasjon kobles i sine stories.

### Story 2.2: Validere PDF-format, sidegrense og originalidentitet

Som investor,
vil jeg at appen kjenner igjen støttet dokumentformat og riktig originalrapport,
slik at en feil fil eller en for lang rapport ikke brukes som analysegrunnlag.

**Kravspor:** FR-6/FR-8/FR-9; NFR-1/NFR-4; S3/S4 og fixturegrunnlag for S2; AD-3/AD-4/AD-9/AD-10; SPEC CAP-2 og rapportoriginal. UX-DR10/UX-DR24/UX-DR25 konsumerer modulutfallet i 2.6.

**Avhengigheter:** 2.1. **Arbeidsgrense:** Backend dokumentkomponent leser faktiske bytes med låst PDF.js legacy-build, teller sider og beregner SHA-256. Format/sidevalidering er ikke tekstlesbarhet eller fullført analyse. Fiktive casefiler og uavhengig dokumentfasit etableres her før de brukes; mer spesifikke feilfixtures legges til når deres logikk bygges.

**Acceptance Criteria:**

**Given** faktiske tekstbaserte PDF-er på 30 og 31 sider
**When** format-/sidesteget kjøres
**Then** 30 er innenfor grensen og 31 gir dokumentfeil med årsak
**And** ikke-PDF eller uleselig PDF-container blir ikke støttet dokumentgrunnlag eller fullført tomliste. **(AC1)**

**Given** én PDF med identiske bytes under ulike filnavn og en endret PDF med samme filnavn
**When** backend beregner rapportidentitet
**Then** identiske bytes gir samme SHA-256 og endrede bytes en ny identitet
**And** filnavn er visningsmetadata, aldri autoritativ identitet eller serversti. **(AC2)**

**Given** en PDF som består format-/sidesteget, men kan mangle tekstlag
**When** dette delutfallet returneres til dokumentpipelinen
**Then** originalbytes og korrekt sideantall er tilgjengelige for neste dokumentsteg
**And** formatgodkjenning alene blir ikke completed analyse eller påstand om lesbart/tilstrekkelig grunnlag. **(AC3)**

**Given** de låste casene F1–F4
**When** fiktive PDF-er og maskinlesbar fasit lages under tests/fixtures/property-cases/
**Then** F1–F3 har fasitmerket TG2 på PDF-side 2 uten TG3, og F4 har i tillegg «Alvorlig lekkasje i tak» som TG3 på PDF-side 4; dokumentnavn/filside/funntekst/grad og økonomisk casegrunnlag er fastsatt uavhengig av adapteren
**And** trykt sidetall som avviker fra filside kan kontrolleres i RT-5-varianten, og ingen private originaler eller faktisk KI-kjøring påstås fra fiktive data. **(AC4)**

**Testkrav:** Integrasjonstester med faktiske fixturebytes for 30/31 sider, annet format, skadet fil og hash/filnavn-varianter. RT-1s formatdel og RT-2; manuelt kryssjekket PDF-fasit før uttrekk/evaluering. Bevar F3s manglende L; dette gir ikke gyldig S5-hovedstart før tallmangelen er rettet. Finansutfallene kontrolleres i Epic 3, faktisk KI-treff i Epic 4.

### Story 2.3: Trekke ut sidemerket tekst med kontrollert lesbarhet

Som investor,
vil jeg at hele rapportens lesbare tekst beholder riktig PDF-side og kjente begrensninger,
slik at ufullstendig eller feilplassert tekst ikke brukes som et pålitelig grunnlag.

**Kravspor:** FR-6–FR-9; NFR-1; S3/S4 og dokumentgrunnlag for S2; AD-3/AD-4/AD-10; SPEC CAP-2 og sidemerket grunnlag. UX-DR11/UX-DR24/UX-DR25 konsumerer feil/usikkerhet senere.

**Avhengigheter:** 2.1 og 2.2. **Avklaringspunkt:** [R2 er lukket 2026-10-20](r2-pdf-lesbarhet-semester-v1.md) med deterministisk semester-v1-regel og forhåndsdefinerte fixtureutfall. Storyen implementerer og verifiserer denne metoden innen eksisterende Deferred; ingen OCR, vision eller manuell semantisk klassifisering av tekstløse sider.

**Acceptance Criteria:**

**Given** en formatvalidert støttet PDF
**When** backend trekker ut tekst
**Then** det finnes nøyaktig én pages-post for hver filposisjon 1..pageCount med tekst og uttrekksstatus
**And** trykte sidetall erstatter ikke filposisjon, og ingen sider filtreres eller avkortes i stillhet. **(AC1)**

**Given** kontrollerte sider med TG-tekst, tabeller, kolonner og relevante norske tegn
**When** uttrekket sammenlignes med original og uavhengig fasit
**Then** side/tekst/grad-/beskrivelseskontekst kan kontrolleres etter den dokumenterte lesbarhetsmetoden
**And** sideantall eller gyldig kontrakt alene regnes ikke som dokumentasjon på korrekt lesing. **(AC2)**

**Given** sideinnhold uten brukbart tekstlag som ikke er deterministisk bevist blankt, kjent uleselig/ufullstendig tekst eller ukjent/upålitelig lesing
**When** dokumentpipelinen vurderer grunnlaget
**Then** unreadable/unknown/incomplete blokkerer fullført dokumentanalyse med dokumentfeil og alle berørte fysiske sider, samt kjent årsak når tilgjengelig
**And** tomtekst, delresultater eller bildeinnhold fremstilles ikke som analysert; tekstløse foto-/plantegnings-/skannesider kan avvises konservativt, uten OCR, vision eller manuell semantisk klassifisering. **(AC3)**

**Given** blanke sider, blandet tekst/bilde eller tegnkodings-/layoutproblemer
**When** lesbarhetskontrollen prøves mot forhåndsdefinert originalfasit
**Then** R2s strukturelle blankregel og forventet utfall per fixture er dokumentert: bare deterministisk bevist fravær av tekst og annet innhold gir blank, som beholder fysisk side og ikke alene blokkerer analyse
**And** readable krever brukbart tekstlag; blank blandes ikke med unreadable/unknown, tvil gir unknown, og ingen vilkårlig tegn-/prosentterskel eller antatt «ufarlig» foto-/blankside godkjenner ukjent grunnlag. En helt blank PDF er fortsatt ingen støttet tekstbasert tilstandsrapport. **(AC4)**

**Testkrav:** Faktiske PDF-bytes med kjent side→tekst, tabeller/kolonner, blanke sider med/uten strøm, whitespace-strøm, annotasjoner/form/appearance, tekstløst foto/vektor/plantegning/skannet TG3, manglende tekstlag, blandet tekst/bilde og tegnkoding etter R2-fasit. Blank må skilles fra ulest innhold og fysisk side bevares etter blank/feil. RT-2/RT-5/RT-9s dokumentdel; ingen adapter kalles for kjent utilstrekkelig grunnlag. Test bare dokumentkomponenten og fasiten her, uten å hevde at S2s semantiske modelltreff er målt.

### Story 2.4: Hente lagret demo-uttrekk bundet til riktig rapport og versjon

Som investor,
vil jeg kunne bruke et tydelig merket lagret uttrekk for demorapporten,
slik at kontrollflyten kan gjennomføres uten nett, nøkkel eller nytt KI-kall.

**Kravspor:** FR-6/FR-7/FR-9; NFR-1/NFR-3/NFR-4; S3/S6; AD-1/AD-4/AD-6/AD-10; SPEC CAP-2/CAP-8. UX-DR1/UX-DR11/UX-DR25/UX-DR40 viser opphavet i senere UI.

**Avhengigheter:** 2.1, 2.2 og 2.3. **Arbeidsgrense:** Den låste smale adaptergrensen og demoimplementasjonen med lagrede kontrollsvar. Samme sidemerkede dokumentgrunnlag som senere live; ingen omgåelse av dokumentpipelinen eller separate anbefalingsregler.

**Acceptance Criteria:**

**Given** et gyldig sidemerket dokumentgrunnlag for en demorapport
**When** backend bruker demo-adapteren
**Then** lagret strukturert uttrekk hentes bare ved samsvarende PDF-bytehash og kontrakt-/uttrekksversjon og valideres etter 2.1
**And** hele det støttede dokumentgrunnlaget brukes ved samme adaptergrense som live, uten ekstern forespørsel. **(AC1)**

**Given** manglende fixture, endrede PDF-bytes eller feil versjon
**When** oppslag forsøkes
**Then** utfallet er eksplisitt analysefeil med trygg kjent årsak
**And** det gjøres ingen live-fallback, nøkkelinnlesing for modellbruk eller nytt betalt kall. **(AC2)**

**Given** lokal standardkonfigurasjon og ingen live-nøkkel
**When** demo-adapteren initialiseres og brukes
**Then** demo er standard, ingen KI-klient opprettes og trygt modusopphav følger utfallet
**And** lagrede svar med kontrollert/fiktivt opphav påstås ikke å være en ny eller gjennomført live-kjøring. **(AC3)**

**Given** kontrollerte lagrede svar med alle fasitfunn, gyldig tomliste og analysefeil
**When** de ulike svarvariantene kjøres ved adaptergrensen
**Then** opprinnelige funn/usikkerheter eller feil beholdes i korrekt kontrakttilstand
**And** demo leverer ingen finansverdi, anbefaling, reparasjonsestimat eller ny tilstandsgrad. **(AC4)**

**Testkrav:** Integrasjon med ekte rapportbytes/dokumentpipeline og lagret svar, hash-/versjonsmismatch, manglende fixture og nett sperret; kontraktens tomliste/feilvarianter. RT-15 og AD-6; kontroller fravær av modellklient/fallback/leverandørkall. Fasit forblir uavhengig av demo-output, og tester rapporteres ikke som S2/live-S5-bevis.

### Story 2.5: Gjennomføre ett HTTP-analyseforløp med duplikatsperre

Som investor,
vil jeg at en eksplisitt analysestart behandles én gang med tydelig sluttstatus,
slik at dobbeltstart, avbrudd og feil ikke lager ekstra analyser eller falsk fullføring.

**Kravspor:** FR-6/FR-9 og grunnlag for FR-18; NFR-1/NFR-4/NFR-5; S3/S6; AD-1/AD-3–AD-6/AD-9/AD-10; SPEC CAP-2/CAP-7/CAP-8 og Dokument- og analysegrense. Dette er backend-grensen, ikke klienten i 2.6.

**Avhengigheter:** 1.2, 2.1, 2.2, 2.3 og 2.4. **Avklaringspunkt:** Backendansvar dokumenterer konkrete upload-/HTTP-timeoutressurser og opprydding før HTTP-integrasjonen tas i bruk. Grenser testes mot støttet input; 30-sidersomfang og S5s medianmål endres ikke i stillhet.

**Acceptance Criteria:**

**Given** én eksplisitt POST /api/analysis med rapportbytes og aktiv korrelasjonskontekst
**When** backend behandler forespørselen
**Then** dokumentvalidering/tekstuttrekk, lokalt adaptervalg og resultatvalidering kjøres sekvensielt før ett terminalt svar
**And** backend setter rapport-/korrelasjonsmetadata i kode og returnerer ingen finansresultat eller screeninganbefaling. **(AC1)**

**Given** samme aktive økt, lokale modus og backendberegnede rapporthash
**When** to forespørsler når adaptergrensen, også med ulik requestId/analysegenerasjon
**Then** en prosesslokal markør satt før første adapterkall hindrer et andre kall og gir tydelig duplikatfeil
**And** sperren kan ikke omgås ved ny requestId eller generasjon. **(AC2)**

**Given** satt duplikatmarkør og et klientavbrudd, adapterfeil eller timeout
**When** samme nøkkel forsøkes igjen før serverstopp
**Then** markøren er fortsatt beholdt og ingen ny adapterkjøring starter
**And** det innføres ingen automatisk retry, jobb-ID, polling eller gjenopptakbart jobb-API. **(AC3)**

**Given** dokumentfeil, analysefeil, transport-/timeoutproblem eller ugyldig adapterretur
**When** HTTP-forløpet avsluttes
**Then** trygg document-/analysis-feil med stabil kode/mål/kjent årsak beholdes etter kontrakten
**And** HTTP 200, ingen funn eller eventuelle delresultater kan ikke alene regnes som fullført analyse. **(AC4)**

**Given** mottatte bytes, filnavn og midlertidige PDF-/tekstressurser
**When** normalforløp og feil/avbrudd håndteres
**Then** filnavn brukes ikke som serversti og den dokumenterte oppryddingen gjennomføres
**And** private rapporter/tekst/nøkler eksponeres ikke gjennom statisk server, feil eller logger. **(AC5)**

**Testkrav:** HTTP-integrasjon med kontrolladapter ved samme grense: normalretur, dokumentfeil før adapter, ugyldig retur, samtidige duplikater, ny requestId/generasjon, timeout og brutt klientforbindelse. Verifiser eksakt adapterkalltall, sperre til serverstopp, ressurs-/oppryddingsatferd og trygge feil med fiktive data. RT-1s forløpsdel/RT-2/RT-9/RT-19 og AD-5. Ekte leverandør/SDK testes i Epic 4, ikke her.

### Story 2.6: Velge rapport og ta imot bare gjeldende analyseutfall

Som investor,
vil jeg velge rapport, starte analysen eksplisitt og se riktig status og funnliste,
slik at ufullstendige eller gamle svar ikke blir grunnlag for kontrollen.

**Kravspor:** FR-4/FR-6–FR-9/FR-11 og gyldighetsgrunnlag for FR-18; NFR-1/NFR-2/NFR-3/NFR-5; S3/S4 og S5-målepunktenes hendelser; AD-2/AD-4–AD-6/AD-9/AD-10; SPEC CAP-2/CAP-7/CAP-8. UX-DR1–UX-DR4/UX-DR10–UX-DR13/UX-DR24/UX-DR25/UX-DR32–UX-DR38/UX-DR40.

**Avhengigheter:** 1.6, 1.7, 2.1 og 2.5. **Arbeidsgrense:** Frontendens rapport-/analyseforløp, svarvalidering og visning av alle funn/usikkerheter. Original-PDF-visning og kontrollhandlinger følger senere stories uten å være forutsetning for å verifisere mottak/status.

**Acceptance Criteria:**

**Given** gjeldende bekreftet gyldig tallgrunnlag og én valgt rapport
**When** brukeren velger Start analyse
**Then** ett POST-forløp starter med gjeldende økt/rapport/request-/generasjonskontekst, Analyserer vises og dobbeltstart sperres
**And** manglende grunnlag eller fil forklares lokalt uten skjult standard, automatisk analyse eller nødvendig omvei til Resultat. **(AC1)**

**Given** et svar fra backend
**When** frontend vurderer svaret
**Then** både runtime-struktur og samsvar med aktiv økt, rapporthash, requestId og analysegenerasjon kontrolleres før bruk
**And** manglende/ugyldig/mismatchet svar for den aktive forespørselen gir tydelig analysefeil fremfor gjeldende fullføring, selv ved HTTP 200; et svar fra en allerede forlatt generasjon håndteres etter AC3. **(AC2)**

**Given** pågående analyse som forlates eller en rapport som erstattes
**When** et sent svar kommer, også etter best effort-abort
**Then** den gamle generasjonen er ugyldig og svaret kan ikke bli gjeldende rapportgrunnlag
**And** ny rapport krever ny analyse/kontroll; tidligere uttrekk, bekreftelse og TG3-grunnlag er ikke gjeldende for den nye rapporten. **(AC3)**

**Given** validert completed, gyldig tomliste eller document-/analysis-feil
**When** utfallet vises
**Then** alle funn har grad/kort beskrivelse/dokument/PDF-side eller tydelig usikkerhet; gyldig tomliste og feil er ulike tekstlige tilstander
**And** fullføring setter ingen brukerbekreftelse; feil/delresultater forblir ufullstendige og gir lokale kodebaserte mangelutfall gjennom domain fra 1.6. **(AC4)**

**Given** eksisterende uttrekk for uendret rapport i aktiv økt
**When** brukeren går tilbake eller endrer/bekrefter finansgrunnlaget
**Then** uttrekk og fortsatt gyldig rapportkontroll gjenbrukes uten HTTP-/adapter-/KI-kall
**And** rapportens egne mangler oppheves ikke av finansendringen. **(AC5)**

**Given** analysefullføring/feil og synlig funnliste
**When** status endres og brukeren navigerer med tastatur
**Then** relevant kort status kunngjøres én gang uten unødvendig fokusflytting, og modus/ufullstendighet/trinn er tekstlig tydelig
**And** S5s ferdiglistehendelse er når den validerte listen faktisk er synlig, ikke bare når et kall er slutt; ingen timer-/telemetrifunksjon innføres. **(AC6)**

**Testkrav:** Rene reducer-/forløpstester og bygget app med kontrolladapter: manglende tall/rapport, dobbeltstart, gyldig/ugyldig/tomt/feilet svar, feil identitet, sent svar etter rapportbytte/forlatt analyse og gjenbruk. RT-3/RT-4/RT-7/RT-9/RT-10/RT-15/RT-19, relevante AT-13/AT-18 og TT-2/TT-3/TT-9-hendelser. Tell kall og kontroller faktisk synlig status; ikke mål live-tid fra demo. Original/PDF-panelet kreves ikke for denne storyens mottaks-/statusverifikasjon.

### Story 2.7: Kontrollere funnets kilde i original-PDF og smalt panel

Som investor,
vil jeg se korrekt originalside ved valgt funn og kunne lese hel side og nabosider,
slik at kildekontrollen kan gjennomføres i samme arbeidsflate.

**Kravspor:** FR-8/FR-9; NFR-2/NFR-3; S4; AD-2/AD-3/AD-4/AD-9/AD-10; SPEC CAP-3 og rapportoriginal. UX-DR7/UX-DR12/UX-DR13/UX-DR17/UX-DR27/UX-DR28/UX-DR30/UX-DR31/UX-DR33–UX-DR35/UX-DR38/UX-DR40; pdf-viewer og Responsive & Platform.

**Avhengigheter:** 2.2 og 2.6. **Arbeidsgrense:** Frontend PDF.js browser-build med lokalt bundlet matchende worker og originale bytes. Ingen ny analyse, standard separat fane eller påkrevd tekstfremhevingsfunksjon.

**Acceptance Criteria:**

**Given** et valgt kontrollerbart funn på PDF-side 4 med avvikende trykt sidetall
**When** funnet velges
**Then** riktig side i originalrapporten vises automatisk med dokumentnavn og filside telt fra 1
**And** brukeren kan lese hel side/nabosider uten å forlate kontrollflaten; trykt side erstatter ikke PDF-siden. **(AC1)**

**Given** en bred visning fra 1200 CSS px
**When** funnkontrollen vises
**Then** funn og original-PDF ligger side om side etter DESIGNs om lag 44/56-fordeling og avstander
**And** lokale worker-/PDF-/nødvendige visningsressurser fungerer uten eksternt nett. **(AC2)**

**Given** smalere visning eller tilsvarende zoom
**When** brukeren åpner PDF fra valgt funn
**Then** et behovsåpnet panel viser riktig kilde-side, kort funnkontekst og tydelig Tilbake til funnkontroll
**And** paneloverskriften får fokus, fokus holdes i panelet, og lukking/Esc returnerer til åpneren med valgt funn/posisjon/kontekst bevart; ingen standard stablet PDF. **(AC3)**

**Given** ukjent/ugyldig side, faktisk lasting eller visningsfeil
**When** kilden forsøkes vist
**Then** kjent tilstand/årsak og berørt dokument/side er synlig, uten gjettet navigasjon
**And** visningsfeil skjules ikke eller utløser ny KI-analyse; dokument-/analyseutfallet omskrives ikke til en annen påstått fullføring. **(AC4)**

**Given** tastaturstyrt funnvalg og sidekontroller
**When** PDF-siden skifter eller blir tilgjengelig/feiler
**Then** fokus beholdes på funnet ved automatisk sideskift, kontroller har semantiske navn/synlig fokus og kort kunngjøring navngir dokument/forespurt eller aktuell PDF-side
**And** zoom/stepper/fargebruk skjuler ikke kilde, tekststatus eller kontrollhandlinger. **(AC5)**

**Testkrav:** Bygget app med kontrolladapter og ekte PDF-bytes, RT-5/RT-7/RT-8, hel side/nabosider, feilside/visningsfeil, raskt funn-/sidebytte uten gammel side presentert som ny, lokal worker og nett sperret. Manuell tastatur/fokus/Esc/retur, 1440×900/1280×800/smalere panel/zoom og praktiske kontrastmål fra DESIGN. Bevaring av senere redigeringsutkast i samme panel kontrolleres i 2.8 når utkast finnes. **Milepæl 1 kan demonstreres etter denne storyen.**

### Story 2.8: Kontrollere og korrigere funn med bevart original og utkast

Som investor,
vil jeg kunne bekrefte et kontrollert funn eller rette et feilaktig uttrekk mot originalen,
slik at gjeldende funn og opprinnelig KI-feil kan skilles.

**Kravspor:** FR-8/FR-10/FR-11 og endringsgrunnlag for FR-18; NFR-1/NFR-2; S3/S4; AD-2/AD-4/AD-10; SPEC CAP-3/CAP-7. UX-DR12–UX-DR17/UX-DR24/UX-DR25/UX-DR31–UX-DR35/UX-DR38/UX-DR40; finding-actions/edit/origin-detail.

**Avhengigheter:** 2.1, 2.6 og 2.7. **Arbeidsgrense:** Enkeltfunnkontroll, gjeldende liste, immutabelt uttrekk og korrigeringsutkast. Avvisning, separat TG3-avklaring og eksplisitt listebekreftelse leveres i egne neste stories. Ingen av dem kreves for direkte verifikasjon av utkast-/bruksovergangene.

**Acceptance Criteria:**

**Given** et funn kontrollert mot originalrapporten
**When** brukeren velger Bekreft for enkeltfunnet
**Then** funnets kontrollstatus og kilde er synlig uten å endre opprinnelig grad/tekst/kilde
**And** handlingen er verken listebekreftelse eller TG3-avklaring. **(AC1)**

**Given** originalt KI-uttrekk og eventuell gjeldende brukt korrigering
**When** brukeren redigerer grad, beskrivelse eller PDF-side
**Then** endringen er et tydelig merket utkast uten virkning på gjeldende liste/grunnlag
**And** original, utkast og gjeldende versjon kan skilles; uferdig utkast bevares ved funn-/trinnretur og PDF-panellukking. **(AC2)**

**Given** et utkast med kontrollerbar rapportkilde
**When** brukeren velger Bruk korrigering
**Then** korrigeringen blir gjeldende, merkes brukerkorrigert og enkeltfunn-/listebekreftelsen oppheves
**And** opprinnelig KI-informasjon beholdes, grunnlagsrevisjonen endres og intet nytt adapter-/KI-kall skjer. **(AC3)**

**Given** et utkast eller en retting uten kontrollerbar side/kilde
**When** brukeren velger Avbryt eller forsøker å bruke ugyldig grunnlag som separate varianter
**Then** Avbryt fjerner utkastet og bevarer gjeldende versjon/status, mens ugyldig korrigering gir konkret felt-/kildemangel og ikke dokumentert rapportfakta
**And** ingen ny grad eller side gjettes. **(AC4)**

**Testkrav:** Rene reducer-tester for uendret Bekreft, utkast uten mutasjon av gjeldende grunnlag, Bruk/Avbryt, bevart original og liste-/enkeltfunnstatus. RT-11-variant med uavhengig originalfasit TG2 på side 5 og kontrollsvar TG3 på side 4; side utenfor dokumentet; tastatur/fokus og bevart utkast ved panel/funn/trinnretur. Resultatets opplysning om ubrukt utkast og historisk snapshot testes i Epic 3; tilstanden forberedes her uten å kreve den flaten.

### Story 2.9: Avvise feilaktig KI-funn med bevart opphav

Som investor,
vil jeg eksplisitt avvise et KI-funn som ikke finnes i originalrapporten,
slik at det ikke brukes som aktivt rapportfunn og KI-feilen fortsatt er etterprøvbar.

**Kravspor:** FR-10/FR-11; NFR-1/NFR-2; S3/S4; AD-2/AD-4/AD-10; SPEC CAP-3/CAP-7. UX-DR12/UX-DR14/UX-DR16/UX-DR24/UX-DR25/UX-DR34/UX-DR38/UX-DR40.

**Avhengigheter:** 2.8. **Arbeidsgrense:** Eksplisitt avvisning og gjeldende aktiv liste med tilgjengelig avvist original. Ingen ny teknisk tilstandsgrad, utbedring eller avklaringshandling.

**Acceptance Criteria:**

**Given** et KI-funn brukeren har kontrollert og mener er feilaktig
**When** brukeren velger Avvis
**Then** funnet merkes brukeravvist og holdes utenfor aktive rapportfunn
**And** original grad/tekst/kilde og brukeravvisningen forblir tilgjengelige. **(AC1)**

**Given** gjeldende liste før avvisning
**When** et aktivt funn avvises
**Then** listegrunnlaget/revisjonen endres og eventuell listebekreftelse er ikke gyldig for den endrede listen
**And** andre funns originaler/kontrollstatus endres ikke som følge av avvisningen alene. **(AC2)**

**Given** et avvist KI-uttrekk med påstått TG3
**When** avvisningen presenteres
**Then** den beskrives som brukeravvist uttrekk, ikke gyldig TG3-avklaring, utbedring eller teknisk godkjenning
**And** en dokument-/analysefeil blir ikke fullført ved at funn avvises. **(AC3)**

**Given** samme brukeravvisning eller retur til funnkontroll
**When** handling/visning gjentas
**Then** aktiv/avvist status er konsistent uten tap av original eller doble brukerendringer
**And** ingen HTTP-/adapter-/KI-analyse starter. **(AC4)**

**Testkrav:** RT-12 med faktisk dokumentfasit og kontrolladapterens oppdiktede funn; rene tilstandsoverganger for aktiv liste/original/listegyldighet og gjentakelse. UI-/manuell kontroll av tekstlig avvist opphav og tastaturhandling. Den eksplisitte listebekreftelsen kommer i 2.11; tester her kan kontrollere opphevet bekreftelsesmetadata uten den senere handlingen.

### Story 2.10: Registrere og validere separat TG3-avklaring

Som investor,
vil jeg registrere status, begrunnelse og konkret grunnlag for relevante alvorlige TG3-funn,
slik at avklaringsbehovet vurderes uten å fjerne rapportfunnet eller blande avklaring med uttrekkskontroll.

**Kravspor:** FR-5/FR-9 og lokal FR-16/FR-17; NFR-1/NFR-2; S3/S4; AD-2/AD-8/AD-10; SPEC CAP-4/CAP-7 og forholdsbundet TG3-avklaring. UX-DR14/UX-DR18/UX-DR24/UX-DR25/UX-DR32–UX-DR36/UX-DR38/UX-DR40.

**Avhengigheter:** 1.6, 2.8 og 2.9. **Arbeidsgrense:** Registrert brukeravklaring og dens anvendbarhet i felles validering/domain, med lokal mangelvisning. Ingen vedlegg, ekstern verifisering, automatisk semantisk klassifisering eller ny brukerhandling for å overføre avklaring.

**Acceptance Criteria:**

**Given** et relevant alvorlig TG3-funn
**When** brukeren registrerer Avklart
**Then** gyldig avklaring krever eksplisitt status og både ikke-tom begrunnelse og konkret avklaringsgrunnlag etter trimming
**And** ukjent/Uavklart/manglende/ugyldig status eller tekst behandles som uavklart med konkrete lokale mangler. **(AC1)**

**Given** gyldig brukerregistrert avklaring
**When** funnet vises
**Then** original TG3-grad, beskrivelse, dokument/PDF-side og separat status/begrunnelse/grunnlag er tilgjengelige
**And** avklaringen merkes brukerbekreftet for førstevurdering, ikke KI-fakta, nødvendigvis utbedret eller teknisk godkjent. **(AC2)**

**Given** to alvorlige TG3-funn, bare ett gyldig avklart
**When** gjeldende mangler vurderes gjennom domain
**Then** det andre funnet og dets avklaringsbehov gir Innhent mer informasjon
**And** gyldig avklaring av ett eller alle funn gir ikke automatisk Gå videre eller endrer finansverdier/formler. **(AC3)**

**Given** registrert TG3-avklaring og en brukt retting av funnet
**When** felles validering vurderer avklaringens binding til gjeldende rapportforhold/grunnlag
**Then** representasjonsretting av samme forhold kan bevare anvendbarhet, mens kjent motstrid/ukjent tilhørighet er utilstrekkelig
**And** samme findingId alene overfører ikke avklaring til et annet teknisk forhold; state/UI/screening har ingen konkurrerende tolkning. **(AC4)**

**Given** registrert status/begrunnelse/grunnlag
**When** en av disse faktisk endres eller nødvendig tekst blir tom
**Then** gjeldende mangler og TG3-revisjon følger det nye grunnlaget, uten ny analyse eller ugyldiggjøring av uendrede finans-/listebekreftelser alene av denne grunnen
**And** Uavklart kan beholdes som brukerens status; full økonomisk screening og historisk resultatsnapshot følger Epic 3. **(AC5)**

**Testkrav:** Sju FR-5-eksemplers avklarings-/mangeldel, blank/mellomrom/ukjent, ett av to funn uavklart og statusendring. Kontroller samme-forhold-korrigering kontra endret/ukjent forhold med stabil findingId og ny rapport. Rene validator-/reducer-tester og lokal UI med tekst/fokus. Økonomiske utfall i FR-5/AT-7–AT-9/AT-20 fullføres med Epic 3; uendrede listebekreftelser ved TG3-endring kontrolleres også med faktisk listehandling i 2.11.

### Story 2.11: Bekrefte gjeldende funnliste med tydelig tilstrekkelighet

Som investor,
vil jeg eksplisitt bekrefte den listen jeg har kontrollert og se det som fortsatt er uavklart,
slik at listekontroll, analysefullføring og TG3-avklaring ikke forveksles før screening.

**Kravspor:** FR-5/FR-9/FR-10/FR-11 og lokale FR-16/FR-17; NFR-1/NFR-2/NFR-3/NFR-5; S3/S4 og kontrollhendelsen til S5; AD-2/AD-4/AD-6/AD-8/AD-10; SPEC CAP-3/CAP-4/CAP-6/CAP-7/CAP-8. UX-DR2/UX-DR11–UX-DR19/UX-DR24/UX-DR25/UX-DR32–UX-DR38/UX-DR40/UX-DR41.

**Avhengigheter:** 1.6, 2.6, 2.8, 2.9 og 2.10. **Arbeidsgrense:** Separat bekreftelse av gjeldende liste og korrekt felles kontroll-/mangelgrunnlag. Resultatflaten, økonomiske terskler og historisk resultatsnapshot er fortsatt Epic 3; ingen ny navigasjonsvei omgår nødvendige kontrollsteg.

**Acceptance Criteria:**

**Given** fullført validert analyse med kontrollert gjeldende funnliste
**When** brukeren eksplisitt bekrefter listen
**Then** bekreftelsen er bundet til gjeldende rapport/listerevisjon med brukerens rettinger/avvisninger og synlig opphav
**And** enkeltfunnets Bekreft eller avsluttet analyse har ikke allerede satt denne listebekreftelsen. **(AC1)**

**Given** completed med findings: [] eller en manglende/feilet analyse som separate varianter
**When** brukeren kontrollerer og eventuelt bekrefter gjeldende liste
**Then** bare faktisk fullført analyse kan gi et tilstrekkelig tomt rapportgrunnlag etter nødvendig brukerbekreftelse
**And** korrigering/avvisning/bekreftelse kan aldri gjøre document-/analysis-feil, ufullstendig lesing eller uløst kritisk usikkerhet til fullført/tilstrekkelig analyse. **(AC2)**

**Given** bekreftet liste med uavklart/ugyldig alvorlig TG3
**When** kontrollen fullføres og felles mangler vurderes
**Then** listekontrollen kan være fullført samtidig som TG3 fortsatt er uavklart og gir Innhent mer informasjon med alle kjente avgjørende mangler
**And** brukeren presses ikke til Avklart for å fullføre kontrollen eller nå S5s tidsmål. **(AC3)**

**Given** bekreftet liste
**When** en korrigering brukes, et funn avvises eller rapporten erstattes
**Then** nødvendig ny listekontroll/bekreftelse og ved ny rapport ny analyse kreves; gammel status gjelder ikke nytt grunnlag
**And** uendret retur, rent utkast og separat TG3-endring følger hver sin bevaringsregel; ingen unødvendig ny analyse eller generell nullstilling av uendrede bekreftelser. **(AC4)**

**Given** demoens kontrollflyt med funn/original/brukerendringer/TG3
**When** den gjennomføres med tastatur og eksternt nett sperret
**Then** gjeldende steg/status, opphav og mangler kan forstås med lesbar tekst/fokus og lokale meldinger
**And** S5s kontrollslutthendelse er gjennomført kontroll med håndtert TG3-status og bekreftet gjeldende liste, uten ny timer-/telemetrifunksjon eller påstand om målt live-tid. **(AC5)**

**Testkrav:** RT-10–RT-14/RT-19 og relevante AT-13/AT-18, med gyldig tomliste kontra feil, kritisk usikkerhet, korrigering/avvisning etter bekreftelse, rapportbytte, ubrukt utkast og uendret retur. Ekte listehandling etter separat TG3-endring skal bevare uendrede bekreftelser korrekt. Bygget app med kontrolladapter og ekte PDF, uten betalt API; manuell tastatur/status/oppfattelse av de tre kontrollbegrepene. TT-4/TT-5/TT-6s hendelser kan kontrolleres; faktisk S5-evaluering følger senere. **Milepæl 2 kan demonstreres etter denne storyen.**

## Epic 3: Beregne, forstå og oppdatere ett samlet screeningresultat

Investoren kan fullføre den lokale demovurderingen med etterprøvbare nøkkeltall, én kodebasert anbefaling og tilgjengelig rapport-/kontrollgrunnlag. Endringer gjør tidligere resultat historisk; ny kodevurdering bruker bare gjeldende relevant kontroll uten ny analyse av uendret rapport.

| Story | Avgrenset leveranse | Direkte forutsetninger |
|---|---|---|
| 3.1 | Fire rene finansberegninger med gyldighet per nøkkeltall | 1.4, 1.5, 1.7 |
| 3.2 | Eksakte økonomiske terskler med likhet og uten toleransemargin | 1.4, 3.1 |
| 3.3 | Separat norsk tallformat og forklaring ved skjult terskelbrudd | 3.1, 3.2 |
| 3.4 | Komplett ren screening med prioritet, alle utløsere og fast tekst | 1.6, 2.10, 2.11, 3.1, 3.2 |
| 3.5 | Revisjonsbundet resultatsnapshot og ren ugyldiggjøring | 1.7, 2.6, 2.8, 2.9, 2.10, 2.11, 3.4 |
| 3.6 | Nøkkeltallskomponenter med formler, input, kilder og ikke-beregnbarhet | 3.1, 3.3, 3.5 |
| 3.7 | Første samlede Resultat med anbefaling, rapportgrunnlag og tilgjengelighet | 2.7, 2.11, 3.4, 3.5, 3.6 |
| 3.8 | Endre og bekrefte finansgrunnlag og få nytt gjeldende resultat | 1.7, 3.5, 3.7 |
| 3.9 | Oppdatere resultat etter funn-/TG3-/rapportendring og bevare ubrukt utkast | 2.6, 2.8, 2.9, 2.10, 2.11, 3.5, 3.7 |

3.1–3.5 er avgrensede moduler/tilstandsoverganger med egne direkte tester; de trenger ingen senere skjerm. 3.6 er en separat verifiserbar komponentleveranse, uten ekstra produktskjerm eller offentlig testrute. 3.7 kobler komponentene til første samlede resultat. 3.8 og 3.9 fullfører de to oppdateringsforløpene i faktisk app; snapshotvernet fra 3.5 brukes allerede i 3.7. Ingen story kan vise gammel anbefaling som gjeldende mens den venter på senere integrasjon. Antallet er en konkret arbeidsoppdeling, ikke et tidsestimat eller en påstand om endelig gjennomførbarhet.

### Story 3.1: Beregne fire nøkkeltall fra hvert sitt gyldige årsgrunnlag

Som investor,
vil jeg få de fire låste nøkkeltallene beregnet bare når hvert enkelt har gyldige bekreftede input,
slik at mangler og negative resultater behandles korrekt uten skjulte estimater.

**Kravspor:** FR-12/FR-13 og beregningsgrunnlaget til FR-14; FR-1–FR-4; NFR-1; S1/S3/S4; AD-1/AD-7/AD-10; SPEC CAP-5 og grensekontraktens Finans og screening. UX-DR21/UX-DR29/UX-DR40 er senere konsumenter; denne storyen leverer ingen resultatflate.

**Avhengigheter:** 1.4, 1.5 og 1.7. **Arbeidsgrense:** Ren domain/finance med gyldighet per nøkkeltall og kontrollerbart formel-/inputgrunnlag, basert på den eksisterende felles valideringen/årsnormaliseringen. Terskler, regelprioritet, formattering og visning er egne leveranser. Ingen React, Express, PDF, nettverk eller KI i finansmodulen.

**Acceptance Criteria:**

**Given** gyldige bekreftede verdier for relevant årsgrunnlag
**When** finansmodulen beregner
**Then** bruttoyield har grunnlaget L/P, NOI er L−D, nettoyield har grunnlaget (L−D)/P og kontantstrøm før skatt er L−D−J
**And** yield beholder eksakt teller/nevner til presentasjon, beløp er NOK/år og input-/formelgrunnlaget er tilgjengelig uten mellomavrunding. **(AC1)**

**Given** månedlige eller blandede kjente års-/månedsinput for L/D/J som gjelder samme år
**When** de validerte normaliserte verdiene brukes
**Then** bare de månedlige beløpene er ganget med 12, én gang, før beregningen
**And** registrert verdi/år/periode, faktor, årsverdi, kilde og kostnadsinnhold beholdes; ukjent/ustøttet periode eller ulike år brukes ikke som gyldig felles årsgrunnlag. **(AC2)**

**Given** manglende L, manglende J, manglende Ymin eller P=0 som separate varianter
**When** hvert nøkkeltalls grunnlag vurderes
**Then** L-mangel hindrer alle fire, J-mangel bare kontantstrøm og Ymin-mangel ingen av de fire
**And** P=0 hindrer begge yieldberegningene uten divisjon med null, mens gyldig NOI/kontantstrøm beholdes; hvert utilgjengelig tall har konkrete årsaker fremfor null eller tidligere verdi. **(AC3)**

**Given** uløst kildekonflikt, ugyldig/ubekreftet verdi eller blank kontra bekreftet/ubekreftet null
**When** et nøkkeltall bruker berørte felt
**Then** bare gyldig bekreftet input inngår, med egne krav P/L, L/D, P/L/D og L/D/J for de fire tallene
**And** bekreftet J=0 er gyldig, mens blank eller ubekreftet 0 er utilstrekkelig; alle kjente relevante årsaker følger berørte ikke-beregnbare tall. **(AC4)**

**Given** gyldige input som gir negative NOI-, yield- eller kontantstrømresultater
**When** nøkkeltallene beregnes
**Then** de negative resultatene beholdes som beregnede verdier
**And** P/D/J følger låste definisjoner uten doble gjeldsposter eller nye fratrekk for ledighet, reparasjon, skatt, kjøpsomkostninger eller verdiendring. **(AC5)**

**Given** samme finansgrunnlag, men ulikt rapportutfall, live/demo eller TG3-status
**When** finansmodulen kjøres gjentatte ganger
**Then** beregnbare nøkkeltall og deres inputgrunnlag er identiske
**And** finansmodulen avgjør ikke om teknisk grunnlag er tilstrekkelig eller om tallene kan gi en konklusiv anbefaling; den bruker kanoniske desimalstrenger og låst big.js uten Number/parseFloat før eksakt aritmetikk. **(AC6)**

**Testkrav:** Vitest mot uavhengig F1/F2/F3/F4-fasit og beregningsdelene av BT-1–BT-11/BT-14–BT-18. F1 skal gi grunnlag for 11,875 %, 1 500 000 kr/år, 9,375 % og 700 000 kr/år; F2 gir 8,75 %, 1 000 000, 6,25 % og 200 000. BT-7/BT-15 skal gi like årsresultater; BT-11 beholder −100 000, −0,625 % og −900 000. Dekk hver inputavhengighet, blank/null/konflikt/bekreftelse, år/periode og presise desimalinput. Forventningene beregnes ikke med funksjonen som testes. Visningsdivisjon/format testes i 3.3; komplette regelutfall i 3.4.

### Story 3.2: Avgjøre økonomiske terskler med eksakte verdier

Som investor,
vil jeg at yieldkrav og nullgrense vurderes uten avrundingsmargin,
slik at likhet består og selv et lite faktisk brudd behandles korrekt.

**Kravspor:** FR-14 og terskeldelen av FR-16/FR-17; NFR-1; S1/S3; AD-1/AD-7/AD-10; SPEC CAP-5/CAP-6 og Finans og screening. UX-DR29s terskelforklaring er senere visning, ikke levert UI her.

**Avhengigheter:** 1.4 og 3.1. **Arbeidsgrense:** Separate rene terskelfunksjoner, med konkrete bestått/brutt/ikke-vurderbart-grunnlag for yield og kontantstrøm. De velger ingen anbefaling og tar ikke over kritisk-mangelvurderingen. Ingen sammenligning av formatterte strenger eller avrundet yield.

**Acceptance Criteria:**

**Given** gyldig P, NOI og Ymin i prosent
**When** nettoyieldkravet vurderes
**Then** kravet avgjøres eksakt som `100 * NOI >= P * Ymin` med big.js
**And** ingen yielddivisjon, Number/parseFloat, mellomavrunding eller S1-toleranse inngår i regelavgjørelsen. **(AC1)**

**Given** P=16 000 000, D=400 000, Ymin=7 og L først 1 520 000 og deretter 1 519 999 kr/år
**When** yieldkravet vurderes
**Then** den første består ved nøyaktig likhet og den andre bryter
**And** utfallet endres ikke av at begge senere kan vises som 7,000 %. **(AC2)**

**Given** gyldig kontantstrøm først 0 og deretter −1 kr/år
**When** nullgrensen vurderes
**Then** 0 består og −1 bryter, også med presise desimalbeløp rundt null
**And** begge økonomiske vilkår kan være brutt samtidig uten at det ene overskriver det andre. **(AC3)**

**Given** manglende/ugyldig/ubekreftet terskelgrunnlag, herunder P=0 eller manglende Ymin/J
**When** terskelfunksjonene kjøres
**Then** berørt terskel er ikke vurderbar med konkret utilstrekkelig grunnlag, uten gjetting eller divisjon med null
**And** et tilgjengelig økonomisk terskelutfall kan ikke i seg selv oppheve prioritet 1 i den senere samlede screeningen. **(AC4)**

**Testkrav:** Vitest for BT-8/BT-9, terskeldelene av AT-2–AT-4/AT-10/AT-11/AT-14/AT-15 og manglende grunnlag fra BT-5/BT-6/BT-18. Test eksakt likhet, én krone under, små desimalbrudd, gyldig bekreftet Ymin=0, cash=0/negativ og begge brudd. Bruk konkrete uavhengige forventninger; terskeltester skal passere uten presentasjonsfunksjon eller KI.

### Story 3.3: Formatere nøkkeltall uten å skjule økonomiske brudd

Som investor,
vil jeg lese norske beløp og prosenter og kunne se detaljene bak et avrundet terskelbrudd,
slik at visningen er lett å lese og fortsatt kan etterprøves.

**Kravspor:** FR-12/FR-14/FR-17; NFR-1/NFR-2; S1/S4; AD-7/AD-9/AD-10; SPEC CAP-5/CAP-6 og presentasjonsdelen av Finans og screening. UX-DR21/UX-DR29/UX-DR40; DESIGNs tallformat og EXPERIENCE metric-grid/recommendation.

**Avhengigheter:** 3.1 og 3.2. **Arbeidsgrense:** Rene presentasjonsfunksjoner for tall, enheter og nødvendig terskeldetalj. Visningsdivisjon/avrunding gjøres her med låst bibliotek; funksjonene endrer aldri finansgrunnlaget eller terskelutfallet. Ingen ny full resultatflate.

**Acceptance Criteria:**

**Given** et beregnbart nøkkeltall med eksakt verdi/formelgrunnlag
**When** vanlig visning formateres
**Then** beløp vises i hele NOK per år og yield i prosent med tre desimaler og norske skilletegn
**And** negative verdier beholder sin betydning, og navn/enhet/år kan presenteres sammen med tallet. **(AC1)**

**Given** nettoyield 6,99999375 % mot Ymin=7 %, eller en negativ kontantstrøm som avrundes til synlig null
**When** et faktisk terskelbrudd ellers ville blitt skjult
**Then** presentasjonsdata inkluderer nødvendig ekstra detaljpresisjon og forklaring om uavrundet regelgrunnlag
**And** hovedvisning 7,000 % eller 0 kr fremstilles ikke som bevis på bestått terskel. **(AC2)**

**Given** ikke-beregnbart tall eller kjent delgrunnlag
**When** presentasjonsdata bygges
**Then** ikke-beregnbart får egne årsaker og ikke et tall, estimat eller gammel verdi
**And** presentasjonen bevarer informasjonen som trengs for synlig Ikke beregnbart/Delgrunnlag; den velger ingen egen anbefaling eller inputgyldighet. **(AC3)**

**Given** samme eksakte grunnlag og terskelutfall
**When** visningen formateres gjentatte ganger eller detaljpresisjonen utvides
**Then** finansverdier og terskelutfall er uendret
**And** presentasjonens avrundede eller lokaliserte verdier sendes aldri tilbake til domain-reglene. **(AC4)**

**Testkrav:** Vitest for F1/F2, negative tall fra BT-11, BT-8/BT-9 og BT-15s enhet/årsgrunnlag, samt ikke-beregnbarhet fra BT-3/BT-5/BT-6. Kontroller faktisk norsk format, tre yielddesimaler, hele NOK, skjult yield-/nullbrudd og nødvendig detaljpresisjon mot uavhengig fasit. En integrasjonskontroll med de ekte terskelfunksjonene skal vise samme avgjørelse før/etter formatering; ikke bare at formatteren returnerer en streng.

### Story 3.4: Gi én komplett regelbasert anbefaling med fast begrunnelse

Som investor,
vil jeg få én anbefaling med alle avgjørende forhold og konkret neste handling,
slik at informasjonsmangler alltid veier tyngre enn økonomiske delresultater.

**Kravspor:** FR-13/FR-16/FR-17 og screeningdelen av FR-5/FR-9/FR-11/FR-18; NFR-1; S3/S4; AD-1/AD-7/AD-8/AD-10; SPEC CAP-6 med CAP-4/CAP-5 og Finans og screening. UX-DR20/UX-DR24/UX-DR36/UX-DR40 er resultat-/lokale konsumenter; UI kommer separat.

**Avhengigheter:** 1.6, 2.10, 2.11, 3.1 og 3.2. **Arbeidsgrense:** Fullfør den ene rene domain-screeningen med prioritet 1–3, stabile regelidentifikatorer/utløsere og faste begrunnelser/neste handling. Gjenbruk felles kritisk-mangel- og TG3-anvendbarhetsvalidering. Ingen ny parallell UI-/backendmotor eller KI-generert tekst.

**Acceptance Criteria:**

**Given** minst én kritisk mangel/ugyldighet/konflikt/ubekreftelse, rapport-/analysefeil, uløst kritisk usikkerhet eller uavklart alvorlig TG3
**When** samlet screening utføres
**Then** nøyaktig én anbefaling er Innhent mer informasjon etter prioritet 1
**And** alle kjente utløsere på nivået er med, stabilt ordnet, med berørt felt/funn/dokument og konkret retting/bekreftelse/innhenting/avklaring; evalueringen stopper ikke ved første mangel. **(AC1)**

**Given** tilstrekkelig kritisk grunnlag og brutt nettoyieldkrav eller negativ kontantstrøm
**When** samlet screening utføres
**Then** nøyaktig én anbefaling er Forkast etter prioritet 2 med aktuelle verdier og grenser
**And** begge brudd er med når begge gjelder; positivt resultat for ett vilkår opphever ikke brudd på det andre. **(AC2)**

**Given** tilstrekkelig kritisk grunnlag, nettoyield ≥ Ymin og kontantstrøm ≥ 0
**When** samlet screening utføres
**Then** nøyaktig én anbefaling er Gå videre etter prioritet 3 med oppfylte økonomiske krav og tilstrekkelig teknisk screeninggrunnlag
**And** neste handling er grundigere vurdering/befaring; teksten gir ingen kjøpsanbefaling eller teknisk godkjenning. **(AC3)**

**Given** svake økonomiske delresultater sammen med en kritisk mangel eller uavklart alvorlig TG3
**When** screeningen utføres
**Then** prioritet 1 avgjør uten Forkast/Gå videre, mens gyldige beregninger kan følge som delgrunnlag
**And** en gyldig avklart TG3 beholder grad/funn og gir ingen automatisk forkastelse eller godkjenning; først tilstrekkelig grunnlag lar økonomien avgjøre. **(AC4)**

**Given** samme gjeldende input, rapportgrunnlag, kontroll-/TG3-status og faste regler
**When** screeningen kjøres flere ganger
**Then** anbefaling, avgjørende prioritet, ordnede utløsere, regelbegrunnelse og anbefalingsbundet neste handling er identiske
**And** ingen KI, nettverk, presentasjonsavrunding eller S1-margin lager eller endrer disse. **(AC5)**

**Given** lokale mangelflater og samlet screening bruker samme grunnlag
**When** kritiske mangler konsumeres fra felles domain-autoritet
**Then** de samme kjente forholdene har samme betydning og nødvendige handling uansett flate
**And** ukjent årsak/faktum gjettes ikke, mens resultatvisningen senere kan oppsummere kort uten å kopiere alle lokale feilmeldinger. **(AC6)**

**Testkrav:** Rene Vitest-tester mot alle logiske utfall i AT-1–AT-15/AT-18–AT-20, relevante BT-3–BT-6/BT-17/BT-18, sju FR-5-eksempler og briefets regelvarianter. AT-18 skal gi alle fire kjente utløsere; AT-4 begge økonomiske brudd; AT-20 fortsatt prioritet 1. AT-19 skal kontrollere identiske ordnede utløsere, full fast begrunnelse og neste handling ved F1/F2/AT-18. Test completed/tomliste/bekreftet kontra failed/ubekreftet/usikker, gyldig/ugyldig forholdsbundet TG3, eksakte grenseverdier og bekreftet null. UI-delen av AT-17 og faktiske endringsforløp i AT-16 verifiseres i senere stories, ikke regnes levert her.

### Story 3.5: Binde resultat til revisjoner og gjøre tidligere resultat historisk

Som investor,
vil jeg at resultatet bare er gjeldende for det grunnlaget det faktisk ble vurdert fra,
slik at en tidligere anbefaling aldri følger nye verdier eller en annen rapport.

**Kravspor:** FR-4/FR-5/FR-6/FR-10/FR-11/FR-15/FR-18; NFR-1; S3/S4; AD-1/AD-2/AD-4/AD-8/AD-10; SPEC CAP-7 og Screening og snapshot/hele Endring og gyldighet. UX-DR2/UX-DR15/UX-DR18/UX-DR26/UX-DR38; stale-result og Key Flow 3 er senere UI-konsumenter.

**Avhengigheter:** 1.7, 2.6, 2.8, 2.9, 2.10, 2.11 og 3.4. **Arbeidsgrense:** Resultatdata og rene reducer-/selektoroverganger i eksisterende frontendøkt. Siste snapshot inneholder sammenhengende beregnings-/screening-/grunnlagsdata og bundne finans-, liste-, TG3- og rapportrevisjoner. Ingen lagringshistorikk, database, ny brukerbekreftelse eller I/O-flyt.

**Acceptance Criteria:**

**Given** et resultat beregnes fra en bestemt gjeldende vurdering
**When** siste snapshot opprettes og leses
**Then** tall, anbefaling, utløsere og tilgjengelig kontrollgrunnlag er bundet til samme objekt og finans-/liste-/TG3-/rapportrevisjoner
**And** gjeldende-status krever samsvar med aktivt grunnlag; senere mutasjon kan ikke endre det historiske snapshotets innhold. **(AC1)**

**Given** et eksisterende snapshot
**When** en finansverdi eller relevant periode/år/kilde/kostnadsinnhold faktisk endres, en korrigering brukes, et funn avvises eller rapporten erstattes
**Then** snapshotet blir umiddelbart historisk med navngitt endring og relevant kontroll-/bekreftelses-/analysebehov
**And** berørte bekreftelser følger de eksisterende handlingene fra Epic 1/2; gamle tall/anbefalinger er aldri gyldige for det endrede grunnlaget. **(AC2)**

**Given** et snapshot og registrert separat TG3-status/begrunnelse/grunnlag
**When** denne registreringen endres
**Then** forrige snapshot blir straks historisk og ny vurdering må bruke gjeldende FR-5-validering/binding
**And** uendret finans-/listebekreftelse og rapportuttrekk bevares; ingen generell nullstilling eller ny KI-analyse opprettes. **(AC3)**

**Given** et gyldig snapshot og uendret gjeldende grunnlag
**When** brukeren navigerer, velger et annet funn, redigerer bare et korrigeringsutkast eller velger Avbryt
**Then** disse handlingene alene endrer ikke gjeldende finans-/liste-/TG3-/rapportrevisjon eller gyldig bekreftelse
**And** utkastet er separat og kan opplyses som ubrukt; Avbryt fjerner det og beholder tidligere gjeldende versjon. **(AC4)**

**Given** historisk snapshot og en senere kodevurdering etter nødvendig relevant kontroll
**When** et nytt snapshot opprettes
**Then** det nye resultatet gjelder nettopp det nye grunnlaget, med bare beregnbare tall og korrekt regelprioritet også ved fortsatt mangel
**And** en gammel/sen analysegenerasjon eller ny rapport uten fullført kontroll kan ikke gjenopplive et tidligere komplett resultat. **(AC5)**

**Given** ingen tidligere beregning eller avsluttet frontendøkt
**When** resultattilstanden leses i en ny økt
**Then** den er Ikke beregnet uten oppdiktede eller gjenopprettede tall/anbefalinger
**And** kun siste snapshot i den aktive vurderingen håndteres; navigasjon er ingen varig vurderingshistorikk. **(AC6)**

**Testkrav:** Rene reducer-/selektortester av hver rad i SPEC Endring og gyldighet, AT-16, RT-3/RT-11–RT-15 og grunnlag for BT-12/BT-13. Start fra et faktisk produsert F1-snapshot; endre ett forhold om gangen og kontroller både historisk innhold, revisjonssamsvar, berørte/uendrede bekreftelser og konkret oppdateringsbehov. Test navigasjon uten mutasjon, utkast/Avbryt/Bruk, TG3-endring, ny rapport og sent svar separat, samt ny korrekt vurdering. Ingen senere resultatkomponent kreves for å teste tilstandsreglene.

### Story 3.6: Gjøre hvert nøkkeltall og beregningsgrunnlag lesbart

Som investor,
vil jeg se hvert nøkkeltalls verdi eller konkrete mangel og kunne åpne formel og inputkilder,
slik at jeg kan etterprøve økonomien uten å lese kode.

**Kravspor:** FR-12–FR-14 og nøkkeltallsdelen av FR-18; FR-1/FR-2; NFR-2; S1/S4; AD-2/AD-7/AD-9/AD-10; SPEC CAP-5 og resultatdelen av CAP-6. UX-DR7/UX-DR8/UX-DR21–UX-DR23/UX-DR25/UX-DR27–UX-DR29/UX-DR34/UX-DR35/UX-DR39/UX-DR40; metric-grid/basis-detail/detail-disclosure.

**Avhengigheter:** 3.1, 3.3 og 3.5. **Arbeidsgrense:** Faktiske gjenbrukbare resultatkomponenter for de fire tallene med tilhørende detaljseksjoner, matet fra ett konsistent snapshot og presentasjonsfunksjonene. Komponentene verifiseres direkte ved sin grense; samlet Resultat-rute/anbefaling/rapportgrunnlag kobles i 3.7. Ingen ekstra produktskjerm eller offentlig testrute opprettes for å komme videre.

**Acceptance Criteria:**

**Given** et konsistent snapshot med økonomiske resultater
**When** nøkkeltallskomponentene rendres
**Then** de fire faste navnene bruttoyield, NOI, nettoyield og kontantstrøm før skatt vises med korrekt verdi/enhet/år fra start
**And** negativt resultat beholdes, og hver utilgjengelig beregning viser Ikke beregnbart med konkrete berørte inputårsaker fremfor null/estimat/gammel verdi. **(AC1)**

**Given** beregnbare tall samtidig som kritisk grunnlag er utilstrekkelig
**When** komponentene viser resultatet
**Then** beregningene er tydelig merket Delgrunnlag
**And** rapportfeil, ubekreftet liste eller uavklart TG3 har ikke endret formlene eller gitt tallene konklusiv status. **(AC2)**

**Given** et beregnbart nøkkeltall
**When** brukeren åpner merket beregningsgrunnlag
**Then** formel, faktisk anvendte verdier/enheter/år, registrerte perioder, omregningsfaktor/årsverdier og kilder/forutsetninger er lesbare
**And** nødvendig kostnadsinnhold og D/J-fordeling er kontrollerbar uten kodeinnsyn eller doble fratrekk. **(AC3)**

**Given** tall nær yield-/nullgrensen
**When** standardformat ville skjult et brudd
**Then** nødvendig terskelforklaring og presis detalj fra 3.3 kan leses ved det berørte nøkkeltallet
**And** hovedanbefalingen vil senere kunne forklares uten å basere seg på den avrundede verdien. **(AC4)**

**Given** detaljseksjonene i åpen/lukket tilstand
**When** de betjenes og leses
**Then** merkede standardkontroller støtter tastatur, synlig fokus og tilgjengelig åpen/lukket-tilstand; skjult innhold er ikke i fokusrekkefølgen
**And** DESIGNs tokens/typografi/kontrast og tekstlige statusetiketter brukes også for delgrunnlag og historisk innhold. **(AC5)**

**Testkrav:** Direkte render-/komponentgrensekontroll med faktiske finans-/presentasjons-/snapshotdata for BT-1/BT-3–BT-6/BT-8/BT-11/BT-15/BT-17/BT-18: fire navn, verdier/enheter/år, Ikke beregnbart/årsaker, Delgrunnlag og komplette formel-/kildedetaljer. Kontroller detaljåpning/lukking og semantisk tilstand ved komponentgrensen uten å være avhengig av 3.7 eller et betalt API. Ikke speil formatterimplementasjonen i forventningsverdiene. Samlet plassering, zoom, fokusflyt og forståelse kontrolleres dessuten i den bygde appen i 3.7.

### Story 3.7: Vise ett samlet screeningresultat med kontrollgrunnlag

Som investor,
vil jeg se én anbefaling og de avgjørende tallene, funnene og manglene samlet,
slik at jeg forstår neste handling og kan kontrollere grunnlaget ved behov.

**Kravspor:** FR-16–FR-18, FR-8–FR-11 og resultatdelen av FR-5/FR-12–FR-14; NFR-1/NFR-2/NFR-3; S3/S4 og demoens grunnlag for S6; AD-2/AD-6–AD-10; SPEC CAP-6/CAP-7/CAP-8 med CAP-3/CAP-4/CAP-5. UX-DR1–UX-DR4/UX-DR7/UX-DR12/UX-DR13/UX-DR16–UX-DR26/UX-DR27–UX-DR29/UX-DR32–UX-DR36/UX-DR38–UX-DR41; Resultat og Key Flows 1/4.

**Avhengigheter:** 2.7, 2.11, 3.4, 3.5 og 3.6. **Arbeidsgrense:** Første samlede Resultat i den eksisterende firetrinnsflyten: anbefalingsvisning, gjenbruk av nøkkeltallskomponenter, rapport-/opphavsdetaljer, historisk vern og returhandlinger. Fornyelse etter faktiske endringer fullføres i 3.8/3.9; vernet fra 3.5 gjelder allerede her. Ingen ny omvei som hopper over kontrolltrinn.

**Acceptance Criteria:**

**Given** hovedreisen har nådd Resultat etter nødvendig kontroll
**When** gjeldende snapshot vises
**Then** én kodebestemt anbefaling og kort grunn ligger øverst, med avgjørende prioritet/utløsere og konkret neste handling
**And** fire nøkkeltall, alvorlige tekniske funn og alle faktiske mangler/uavklarte forhold er synlige fra start; hovedutfallet kan forstås uten detaljåpning. **(AC1)**

**Given** et resultat med rapportgrunnlag
**When** brukeren undersøker det tilgjengelige grunnlaget
**Then** alle aktive TG2/TG3 med grad/beskrivelse/dokument/PDF-side, originalrapporten, opprinnelig KI-uttrekk og brukerrettinger/avviste originaler er tilgjengelige
**And** alvorlig TG3 og separat brukerstatus vises tydelig; avklaringsbegrunnelse/grunnlag og øvrige opphavsdetaljer åpnes ved behov med bevart skille mellom rapportfunn, brukeropplysning, kontroll og kodeutfall. **(AC2)**

**Given** kritiske mangler, dokument-/analysefeil eller ufullført kontroll er representert i beslutningsgrunnlaget
**When** et delresultat vises innen eksisterende navigasjonsregler
**Then** Innhent mer informasjon samler alle faktiske avgjørende blokkere med berørt grunnlag og nødvendig handling, mens gyldige tall merkes Delgrunnlag
**And** feil forsvinner ikke bak tomliste/tall; lokale feilmeldinger kopieres ikke i fulltekst, og problemtrinnet gir fortsatt egen lokal forklaring uten påtvunget resultatbesøk. **(AC3)**

**Given** ingen resultatberegning eller avvik mellom siste snapshot og aktivt grunnlag
**When** Resultat eller historisk resultat leses
**Then** Ikke beregnet viser nødvendig kontroll uten oppdiktet anbefaling, mens tidligere snapshot er lesbart med Utdatert/Må bekreftes på nytt og konkret oppdateringsbehov
**And** historiske tall/funn/anbefaling blandes ikke med nye verdier som ett gjeldende resultat; eksisterende ubrukt utkast opplyses uten å brukes. **(AC4)**

**Given** gjeldende resultat i lokal demo
**When** brukeren leser anbefalingen og velger Endre tallgrunnlag eller Gå tilbake til rapportfunn
**Then** modus er fortsatt tydelig Demo · lagret KI-uttrekk, retur bevarer gyldige data/kontroller og starter ingen analyse
**And** anbefaling/regeltekst/neste handling kommer fra samme kode som senere live, uten score, markedsverdi, juridisk vurdering, kjøpsbeslutning eller ekstern handling. **(AC5)**

**Given** Resultat i normal, delvis, historisk eller detaljåpnet tilstand
**When** den brukes med tastatur og ved relevante desktop-størrelser/zoom
**Then** sticky trinn/status, leserekkefølge, returfokus på trinnoverskrift, detaljkontroller, tekstlige etiketter og kontrast følger final UX
**And** viktige gyldighetsskifter kunngjøres kort én gang uten fokusstjeling; alvorlige forhold og neste handling skjules ikke av layout, fargebruk eller detaljseksjoner. **(AC6)**

**Testkrav:** Playwright på bygget app med ekte kontrollerte PDF-/adapterdata for F1 Gå videre, F2 Forkast og F4 Innhent mer informasjon etter fullført kontroll med fortsatt Uavklart TG3. AT-17 og UI-delene av AT-1/AT-2/AT-7/AT-9/AT-13/AT-18: kontroller hovedhierarki, alle avgjørende forhold, tilgang til aktive/avviste/originale funn og korrekt originalside via eksisterende kontrollflate. Tilstander som ikke kan nås gjennom normal hovedreise testes ved komponent-/tilstandsgrensen, uten ny produktsnarvei. Manuell test av de tre anbefalingene, tastatur/fokus, detail-disclosure, etiketter, kontrast og zoom mot final UX. Eksternt nett/nøkkel skal ikke kreves etter installasjon; ingen betalt API i E2E.

### Story 3.8: Oppdatere resultat etter endret og bekreftet finansgrunnlag

Som investor,
vil jeg endre tall eller avkastningskrav, kontrollere endringen og få et nytt lokalt resultat,
slik at jeg kan revidere førstevurderingen uten å analysere samme rapport på nytt.

**Kravspor:** FR-1–FR-4/FR-13/FR-15–FR-18 og gjenbruksdelen av FR-6; NFR-1/NFR-2/NFR-3; S1/S3/S4; AD-2/AD-6–AD-10; SPEC CAP-7/CAP-8 med CAP-1/CAP-5/CAP-6 og finansraden i Endring og gyldighet. UX-DR2/UX-DR4–UX-DR9/UX-DR20–UX-DR26/UX-DR32–UX-DR36/UX-DR38/UX-DR40/UX-DR41; Key Flow 3.

**Avhengigheter:** 1.7, 3.5 og 3.7. **Arbeidsgrense:** Koble eksisterende finansretur, berørt bekreftelse og ny kodeberegning til resultatets faktiske fornyelse. Ingen ny bekreftelsestype, ekstra produktskjerm, finansregel eller analysehandling. Ny beregning følger eksisterende kontroll/fremovernavigasjon.

**Acceptance Criteria:**

**Given** et gjeldende F1-resultat
**When** brukeren faktisk endrer et finansfelt eller relevant periode/år/kilde/kostnadsinnhold
**Then** berørt bekreftelse oppheves og tidligere resultat blir straks lesbart historisk med navngitt kontrollbehov
**And** endringen brukes ikke som gyldig beregningsgrunnlag før relevant ny kontroll/bekreftelse. **(AC1)**

**Given** endret P/L/D/J med gyldig ny bekreftelse
**When** brukeren fullfører eksisterende resultatflyt
**Then** berørte nøkkeltall og anbefaling beregnes fra gjeldende årsgrunnlag og bindes til nytt snapshot
**And** eksempelvis L fra F1 til F2 gir F2-tall og Forkast; gammel F1-anbefaling står ikke som gjeldende. **(AC2)**

**Given** bare Ymin endres, eller manglende Ymin registreres og bekreftes som 10 %
**When** nytt resultat dannes
**Then** de fire nøkkeltallene forblir identiske med samme P/L/D/J, mens screening bruker det nye kravet
**And** manglende/ubekreftet Ymin gir Innhent mer informasjon, mens fullstendig F1-grunnlag med bekreftet 10 % gir Forkast. **(AC3)**

**Given** uendret rapport med tidligere kontrollstatus, mangler og eventuelle TG3-avklaringer
**When** finansgrunnlaget endres og resultatet oppdateres
**Then** rapportuttrekk og fortsatt gyldig rapportkontroll gjenbrukes uten ekstra adapter-/KI-kall
**And** rapportfeil eller uavklart alvorlig TG3 består som prioritet 1 selv ved nye sterke eller svake økonomiske tall. **(AC4)**

**Given** offline demo og et eksisterende resultat
**When** brukeren returnerer uten endring, gjør et ugyldig bekreftelsesforsøk eller senere retter/bekrefter gyldig endring
**Then** uendret retur bevarer resultatets gyldighet, mens ugyldig endring gir lokale feltfeil og historisk forrige resultat til nødvendig ny kontroll er fullført
**And** retting/fornyelse fungerer uten eksternt nett eller API-nøkkel, med synlig status/fokus og uten generell nullstilling av uendret grunnlag. **(AC5)**

**Testkrav:** Bygget-app-forløp BT-12/BT-13 og finansvariantene i AT-10/AT-11/AT-14/AT-16, samt F4→endret økonomi som fortsatt gir prioritet 1. Kontroller før/etter-revisjoner, korrekt relevant bekreftelse, alle avhengige tall, Ymin-endring uten tallendring og adapterkalltall uendret. Dekning av periode/kilde/kostnadsendring og uendret navigasjon bygger på rene overgangstester fra 3.5; UI-testene verifiserer faktisk handling/status/resultat. Test ugyldig→rettet→bekreftet også med eksternt nett sperret, og gjør relevant manuell fokus-/feil-/gyldighetskontroll.

### Story 3.9: Oppdatere resultat etter rapportkontroll og separat TG3-endring

Som investor,
vil jeg kunne rette rapportfunn, endre TG3-avklaring eller velge ny rapport med korrekt ny resultatstatus,
slik at kontrollarbeid og ubrukte utkast aldri gir et misvisende gjeldende resultat.

**Kravspor:** FR-5/FR-6/FR-8–FR-11/FR-13/FR-16–FR-18; NFR-1/NFR-2/NFR-3; S3/S4; AD-2/AD-4/AD-6/AD-8–AD-10; SPEC CAP-7 med CAP-2/CAP-3/CAP-4/CAP-6/CAP-8 og rapport-/utkast-/TG3-radene i Endring og gyldighet. UX-DR2/UX-DR4/UX-DR10–UX-DR19/UX-DR20/UX-DR22–UX-DR26/UX-DR32–UX-DR36/UX-DR38–UX-DR41; Key Flows 2/3/4.

**Avhengigheter:** 2.6, 2.8, 2.9, 2.10, 2.11, 3.5 og 3.7. **Arbeidsgrense:** Koble eksisterende rapport-/funn-/TG3-handlinger til resultatets fornyelse og nødvendige kontrollretur. Gjenbruk snapshotvern og felles anvendbarhetsvalidering; ingen ny semantisk KI-kontroll, avklaringshandling, automatisk retry eller overføring av avklaring til annet rapportforhold.

**Acceptance Criteria:**

**Given** gjeldende resultat og et korrigeringsutkast
**When** brukeren redigerer, bytter funn/trinn, ser Resultat eller velger Avbryt
**Then** utkastet bevares ved retur og opplyses som ubrukt på Resultat uten å påvirke tall, gjeldende liste, anbefaling eller fortsatt gyldige bekreftelser
**And** Avbryt fjerner utkastet og beholder forrige gjeldende versjon; ingen KI-/adapterkall gjøres. **(AC1)**

**Given** gjeldende resultat
**When** brukeren velger Bruk korrigering eller avviser et feilaktig KI-funn
**Then** tidligere resultat blir straks historisk; brukt korrigering krever nødvendig ny enkeltfunn-/listekontroll, og avvisning krever ny listebekreftelse med originalen tilgjengelig
**And** ny screening etter relevant kontroll bruker gjeldende aktive liste uten nytt KI-kall; en avvisning regnes ikke som teknisk TG3-avklaring. **(AC2)**

**Given** et resultat med alvorlig TG3 og ellers uendret bekreftet grunnlag
**When** registrert TG3-status, begrunnelse eller grunnlag endres
**Then** tidligere anbefaling er umiddelbart historisk, og kodevurderingen bruker gjeldende separate registrering etter FR-5
**And** uendrede tall og liste beholder bekreftelsen; Uavklart/ukjent/ugyldig Avklart gir Innhent mer informasjon, mens gyldig Avklart bare fjerner den aktuelle mangelen og lar øvrige regler avgjøre. **(AC3)**

**Given** tidligere TG3-avklaring og en brukt funnkorrigering
**When** ny kontroll og screening vurderer avklaringens anvendbarhet
**Then** felles validering fra 2.10 kan bevare den ved representasjons-/kilderetting av samme rapportforhold, mens kjent motstrid eller ukjent tilhørighet gir utilstrekkelig grunnlag
**And** stabil findingId alene overfører ikke avklaringen; original, brukerretting og avklaringsgrunnlag er fortsatt tilgjengelige uten ny UX-handling eller teknisk godkjenning. **(AC4)**

**Given** et eksisterende resultat og eventuelt ventende analyseforløp
**When** brukeren erstatter rapporten
**Then** gammelt resultat er historisk og gammel rapports uttrekk/kontroll/TG3-avklaringer gjelder ikke ny rapport; ny eksplisitt analyse og rapportkontroll kreves
**And** gammelt/sent svar kan ikke gjenopprette tidligere resultat eller fullføre den nye rapporten; feil i den nye analysen forblir synlig utilstrekkelig grunnlag. **(AC5)**

**Given** en endret rapport-/kontroll-/TG3-tilstand med nødvendig relevant håndtering fullført
**When** resultatflyten gir et nytt snapshot
**Then** alle tall, aktive funn, kilder, avklaringer, utløsere og anbefaling gjelder samme nåværende grunnlag, også ved fortsatt prioritet 1
**And** lokale feil, bevart kontekst og tekstlig gyldighetsstatus følger UX uten KI-kall for kontrollendringer; bare ny rapport gir det nye eksplisitte analysebehovet. **(AC6)**

**Testkrav:** Bygget-app-forløp for rapport-/funn-/TG3-variantene i AT-16, AT-7–AT-9/AT-13/AT-20, RT-3/RT-11–RT-15 og de sju FR-5-eksemplene ved relevante grenser. Verifiser utkast→Resultat→retur→Avbryt kontra Bruk, avvisning/ny listebekreftelse, hver TG3-tekst/statusendring uten ny finans-/listebekreftelse og gyldig/ukjent forholdsbinding. Kontroller at uavklart TG3 kan beholdes etter fullført kontroll. Test rapportbytte med kontrollert sent svar og ny feil/fullført analyse; assert antall adapterkall, aktive revisjoner og originalbevaring. Testkall går til kontrolladapter med ekte fixtures, aldri betalt API. Manuell kontroll av retur/fokus, lokale feltfeil og forståelig historisk/gjeldende skille; full S5/S6-evaluering gjenstår i sine epics.

## Epic 4: Live KI-analyse og evaluering

Investoren kan eksplisitt starte én faktisk KI-analyse av en ny støttet rapport og kontrollere resultatet i den allerede leverte flyten. Gruppen kan dokumentere opprinnelig live-kvalitet og faktisk behandlingstid mot låste mål, atskilt fra demo, rettinger og rene finans-/regeltester.

### Gjennomføringsport før implementering

Mads + live-integrasjon avklarer og dokumenterer leverandør, eksakt modell/SDK, kontekst-/outputkapasitet, datert prisgrunnlag, prosjektbudsjett/beregnet testkostnad og konkrete leverandør-/live-timeouter før berørt implementering og før betalte tester. Dette viderefører brukerens presisering og arkitekturens Deferred; ingen verdier velges gjennom denne storygodkjenningen. Valget skal håndtere hele det støttede sidemerkede grunnlaget i ett kall uten skjult avkorting/retry. Dersom dette krever endring av låst støtte, kontrakt eller arkitektur, må Mads spørres først.

PDF-lesbarhet i 2.3 og upload-/HTTP-ressurser/opprydding i 2.5 beholder sine tidligere avklaringspunkter. De utsettes ikke til denne epicen. Live-integrasjonen må passe disse grensene. S5s medianmål er ingen hard femminutters timeout. Budsjett/kostnad følges som gjennomføringsdokumentasjon; ingen ny appfunksjon for betaling eller budsjetthåndheving bestilles.

| Story | Avgrenset leveranse | Direkte forutsetninger |
|---|---|---|
| 4.1 | Lokal live-konfigurasjon og valgt leverandørklient med trygg nøkkelgrense | 1.2, 2.4, 2.5 |
| 4.2 | Produksjonsadapter som analyserer hele rapportgrunnlaget i ett KI-kall | 2.1, 2.3, 4.1 |
| 4.3 | Live gjennom samme HTTP-/kontroll-/resultatflyt med trygge feil | 2.5, 2.6, 3.7, 3.8, 3.9, 4.1, 4.2 |
| 4.4 | Faktiske live-kjøringer og S2-evaluering av originaluttrekket | 2.2, 4.2, 4.3 |
| 4.5 | S5-måling av live/kontroll og sammenligning med manuell referanse | 4.3, 4.4 |

4.1–4.3 er separate konfigurasjons-, adapter- og appintegrasjonsleveranser med kontrollerte tester uten betalt API. 4.4 leverer faktisk live-bevis og S2-vurdering; 4.5 leverer tidsbevis etter den låste protokollen. Gyldige måledata kan gjenbrukes dersom alle nødvendige hendelser faktisk er registrert, ellers kreves planlagte nye forsøk innen avklart budsjett. Ingen tidligere story avhenger av en senere evaluering for sin avgrensede modul-/integrasjonsverifikasjon. Hele v1 kan ikke erklæres verifisert fra disse offline-testene alene.

### Story 4.1: Konfigurere valgt live-leverandør uten å eksponere nøkkelen

Som utvikler,
vil jeg koble valgt leverandørklient til eksplisitt lokal backendkonfigurasjon,
slik at live kan brukes innen avklart ramme og demo fortsatt kan kjøres uten nøkkel.

**Kravspor:** FR-6 og konfigurasjons-/feilgrunnlag for FR-9; NFR-3/NFR-4 og kallstabilitet i NFR-1; AD-1/AD-5/AD-6/AD-9/AD-10 og Deferred; SPEC CAP-2/CAP-8 og Dokument- og analysegrense. UX-DR1/UX-DR11/UX-DR24/UX-DR25/UX-DR37/UX-DR40 konsumerer trygg modus-/feilmetadata; ingen ny brukerflate leveres her.

**Avhengigheter:** 1.2, 2.4 og 2.5. **Avklaringspunkt:** Gjennomføringsporten ovenfor må være løst av Mads + live-integrasjon før Epic 4 implementeres. **Arbeidsgrense:** Én valgt leverandørklient, backendens konfigurasjonsvalidering, eksplisitt modusvalg og trygg konstruksjon/feilgrense. Ingen analyseprompt, flerleverandørrammeverk, nøkkelfelt i UI eller automatisk modellvalg.

**Acceptance Criteria:**

**Given** dokumentert valgt leverandør/modell/SDK og avklart kapasitet, pris/budsjett og timeoutgrunnlag
**When** live-konfigurasjonen tas i bruk
**Then** de avklarte verdiene brukes eksplisitt i backend, og detaljene er sporbare uten hemmeligheter
**And** hele støttede rapportgrunnlag er omfattet av kapasitets-/testvurderingen; ingen ressursverdi innfører skjult avkorting eller endret 30-sidersscope. **(AC1)**

**Given** standard demo eller manglende live-nøkkel
**When** den lokale appen startes i demo
**Then** den eksisterende demo-adapteren brukes uten at en KI-klient opprettes eller en live-nøkkel kreves
**And** manglende/ugyldig live-konfigurasjon gir ved live-bruk en trygg kjent feil uten betalt kall eller skjult fallback. **(AC2)**

**Given** eksplisitt lokal live-konfigurasjon
**When** backend oppretter leverandørklienten
**Then** nøkkel og leverandørkall forblir i backend, og automatisk SDK-retry er slått av
**And** frontend mottar bare trygg modusmetadata; nøkkelen inngår ikke i build, API-svar, logger/feil, demo, fixtures eller dokumentasjon. **(AC3)**

**Given** avklarte leverandør-/live-timeouter og eksisterende upload-/HTTP-ressursgrenser
**When** klientens tids-/avbruddsinnstillinger integreres
**Then** de er eksplisitte, forenlige med det ene HTTP-forløpet og kan testes med kontrollert transport
**And** S5s medianmål tolkes ikke som hard timeout, og klientavbrudd lover ikke at leverandørkjøringen eller kostnaden har stoppet. **(AC4)**

**Given** fiktiv testnøkkel og ugyldige konfigurasjonsvarianter
**When** konfigurasjon, oppstart og feilgrenser kontrolleres
**Then** kjente mangler kan forstås uten å røpe nøkkel eller private dokumentdata
**And** ingen test eller oppstart foretar et uannonsert leverandørkall. **(AC5)**

**Testkrav:** Vitest/integrasjon for standard demo uten nøkkel, gyldig valgt live-konfigurasjon, manglende/ugyldige påkrevde verdier og trygg feilmetadata. Bruk fiktiv nøkkel og nett sperret; kontroller faktisk bygget frontend/oppstartsmetadata og testutdata for lekkasje, samt null klientopprettelser i demo. Klientens retry-/timeoutoppsett kontrolleres her; faktisk antall transportforsøk ved leverandørfeil verifiseres med den valgte klienten i 4.2. Dette er konfigurasjonsverifikasjon, ingen live-/S2-/S5-påstand.

### Story 4.2: Analysere hele det sidemerkede rapportgrunnlaget i ett KI-kall

Som investor,
vil jeg at live-adapteren trekker ut rapportens eksplisitte TG2/TG3 med kilder og synlig usikkerhet,
slik at jeg får et faktisk KI-uttrekk som kan kontrolleres mot originalen.

**Kravspor:** FR-6/FR-7/FR-8/FR-9; NFR-1/NFR-4; uttrekksgrunnlag for S2/S4; AD-1/AD-3–AD-6/AD-9/AD-10; SPEC CAP-2/CAP-8 og sidemerket grunnlag/analyseutfall/opprinnelig uttrekk. UX-DR7/UX-DR11–UX-DR13/UX-DR24/UX-DR25/UX-DR40 er konsumenter i eksisterende UI.

**Avhengigheter:** 2.1, 2.3 og 4.1. **Arbeidsgrense:** Den faktiske valgte leverandør-/modellimplementasjonen bak eksisterende smale adapter, med versjonert prompt og mapping til felles kontrakt. Kontrollerte tester bruker den valgte klientens transportgrense. Faktiske betalte kjøringer/evaluering utføres i 4.4; de erstattes ikke med testsvar.

**Acceptance Criteria:**

**Given** et støttet og validert sidemerket dokumentgrunnlag
**When** live-adapteren kalles én gang
**Then** den valgte reelle leverandørklienten får hele grunnlaget med alle PDF-posisjoner samlet i ett KI-analysekall
**And** ingen side, tekst eller funnoppgave avkortes eller filtreres etter relevans; ingen ekstra kall, skjult fallback eller automatisk retry gjøres. **(AC1)**

**Given** versjonert uttrekksoppgave
**When** prompt og leverandørforespørsel bygges
**Then** oppgaven omfatter alle eksplisitte TG2/TG3 med kort trofast beskrivelse og PDF-side, uten å sette nye grader eller gjette hull
**And** reparasjonsestimat, finansinput/-beregninger, anbefaling, markeds-/juridisk analyse og andre dokumenttyper er ikke analyseoppgaver; rapporten endrer ikke P/L/D/J/Ymin. **(AC2)**

**Given** et leverandørsvar med funn, uklar grad/kilde/side eller forsøkt endret korrelasjonsmetadata
**When** returen mappes og valideres
**Then** felles contracts er appautoritet, og backend beholder kodebestemt requestId/reportHash/modus/dokumentidentitet/sideantall
**And** ukjent/umulig kilde eller grad bevares som eksplisitt usikkerhet/kandidat med opphav etter kontrakten, aldri gjettet gyldig eller brukerbekreftet rapportfaktum. **(AC3)**

**Given** fullført svar med findings: [], manglende/ugyldig svar eller kjent avbrutt/ufullstendig output som separate varianter
**When** terminalt utfall bygges
**Then** bare faktisk fullført, kontraktgyldig analyse kan bli completed, også ved gyldig tomliste
**And** blant annet kjent avkorting, leverandøravslag og manglende terminalt grunnlag gir analysefeil med trygg kjent årsak og eventuelt merkede delresultater; de blir ikke vellykket tomliste. **(AC4)**

**Given** leverandør-/transportfeil, timeout eller klientavbrudd
**When** den valgte klienten og adapteren avslutter forsøket
**Then** antall påbegynte modellforespørsler økes ikke av SDK-retry eller en intern omkjøring
**And** feil mappes til felles trygg analysefeil uten hemmeligheter eller falsk fullføring; eksisterende duplikatsperre/opprydding kan anvendes av HTTP-laget. **(AC5)**

**Given** samme kontraktgyldige uttrekksdata fra demo eller live
**When** dataene leveres videre
**Then** det brukes samme kontroll-/kilde-/TG3-/finans-/screeninggrunnlag etter retur, med eksplisitt riktig modus
**And** strukturvalidering beskrives ikke som bevis for korrekt semantisk uttrekk, brukerens bekreftelse eller bestått S2. **(AC6)**

**Testkrav:** Adapter-/transportintegrasjon uten betalt API: faktisk sidemerket uttrekk fra PDF-fixtures, inklusive 30 sider, skal nå den valgte klienten komplett og i riktig sidebinding. Kontroller promptens avgrensning og mapping med kjente RT-5/RT-6/RT-7/RT-9/RT-10/RT-19-svar, ufullstendig output, manglende felter/terminalstatus og identitetsoverskriving. Bruk kontrollert transport for leverandørfeil som ratebegrensning, serverfeil og timeout og tell faktiske transportforsøk, ikke bare verdien på en retry-innstilling. Verifiser felles schemas, bevart usikkerhet og uendrede finansverdier. Faktisk modelltreff og behandlingstid verifiseres separat i 4.4/4.5.

### Story 4.3: Bruke live-analysen i samme kontroll- og resultatflyt

Som investor,
vil jeg kunne starte live-analyse og kontrollere funnene i den samme appflyten som demo,
slik at reelle svar og feil får riktig status uten ekstra analyse ved kontrollendringer.

**Kravspor:** FR-6–FR-11/FR-15–FR-18 og separat FR-5-kontroll; NFR-1–NFR-4 og hendelsesgrunnlag for NFR-5; S3/S4; AD-2–AD-10 ved relevante grenser; SPEC CAP-2/CAP-8 med gjenbrukt CAP-3/CAP-4/CAP-6/CAP-7 og Dokument- og analysegrense. UX-DR1/UX-DR10/UX-DR11/UX-DR24/UX-DR25/UX-DR33/UX-DR36–UX-DR38/UX-DR40/UX-DR41; eksisterende analyse-/feil-/kontrollflyt.

**Avhengigheter:** 2.5, 2.6, 3.7, 3.8, 3.9, 4.1 og 4.2. **Arbeidsgrense:** Koble valgt produksjonsadapter til eksisterende backendkomposisjon/HTTP-forløp og verifisere live-modus i ferdig frontendflyt. Ingen ny skjerm, analyseknapp, regelmotor, jobbtilstand eller gjenopptaksmekanisme. Automatisert E2E bruker kontrolladapter ved samme grense, aldri betalt API.

**Acceptance Criteria:**

**Given** gyldig lokal live-konfigurasjon, bekreftet tallgrunnlag og støttet rapport
**When** brukeren eksplisitt velger Start analyse
**Then** det eksisterende POST-forløpet bruker produksjonsadapteren og viser Live analyse/Analyserer frem til gyldig terminalt utfall
**And** dobbeltstart/duplikat med ny requestId eller generasjon gir ingen ny modellforespørsel; backendmarkøren settes før adapterkall og beholdes til serverstopp, også etter klientavbrudd. **(AC1)**

**Given** et fullført validert live-uttrekk som matcher aktiv økt/rapport/forespørsel/generasjon
**When** listen blir synlig
**Then** alle returnerte aktive funn og usikkerheter er tilgjengelige med originalside og samme kontroll-/utkast-/avvisnings-/liste-/TG3-handlinger som demo
**And** ferdig analyse eller enkeltfunnkontroll har ikke automatisk bekreftet listen eller avklart alvorlig TG3. **(AC2)**

**Given** manglende live-konfigurasjon, leverandørfeil, timeout, ugyldig/ufullstendig svar eller kildeusikkerhet
**When** feilen/mangelen når brukerflyten
**Then** kjent årsak og ufullstendighet vises trygt i aktuelt trinn med kodebasert Innhent mer informasjon og nødvendig handling
**And** ingen automatisk omkjøring, demo-fallback, vellykket tomliste eller konklusivt økonomisk resultat skjuler feilen; nødvendig ressursopprydding følger det faktiske forløpet. **(AC3)**

**Given** ferdig live-uttrekk og kontrollstatus
**When** brukeren endrer finansgrunnlag, korrigerer/avviser funn eller registrerer TG3-endring
**Then** uendret rapportuttrekk gjenbrukes uten nytt adapter-/KI-kall, med relevant ny kontroll og korrekt historisk/gjeldende resultat
**And** samme effektive grunnlag gir identiske finansresultater, regelutfall, begrunnelse og neste handling som i demo; Live analyse-merkingen beholdes. **(AC4)**

**Given** en ventende eller tidligere fullført live-analyse
**When** rapporten erstattes eller pågående analyse forlates
**Then** generasjons-/identitetsvernet avviser gammelt/sent svar, og ny rapport krever ny eksplisitt analyse/kontroll
**And** tidligere bekreftelser/TG3-avklaringer/resultat gjenopplives ikke; klientavbrudd omgår ikke backendens kall-/duplikatgaranti. **(AC5)**

**Given** demo uten nøkkel og live-flytens fullført-/feiltilstander
**When** kjørbarhet og tilgjengelighet kontrolleres
**Then** demo fungerer fortsatt med eksternt nett sperret, mens live viser egen faktisk status uten ny konfigurasjonsreise
**And** tekstlig modus/feil/gyldighet, tastatur/fokus og korte statuskunngjøringer følger final UX; t_liste er først når ferdig validert liste faktisk er synlig, ikke ved avsluttet modellkall. **(AC6)**

**Testkrav:** HTTP-integrasjon og bygget-app-E2E med kontrolladapter ved samme grense: RT-1–RT-4/RT-7/RT-9/RT-10/RT-13–RT-15/RT-19, AT-13/AT-16/AT-17/AT-19/AT-20 og relevante FR-5-overganger. Dekk feilsvar, samtidige duplikater, klientavbrudd, sent svar, ny rapport, gjenbruk og null ekstra kall ved finans/funn/TG3. Sammenlign faktiske kodeutfall fra identisk kontrollert uttrekk i begge moduser. Test standard demo uten klient/nøkkel/nett og kjente live-konfigurasjonsfeil. Den valgte SDKens transportforsøk kontrolleres i integrasjon med 4.2; E2E skal ikke bruke betalt tjeneste. Manuell modus-/feil-/tastatur-/statuskontroll ved relevante overganger. Faktiske live-kjøringer inngår i 4.4.

### Story 4.4: Gjennomføre ekte live-analyse og evaluere opprinnelig uttrekk mot S2

Som produkteier,
vil jeg se faktisk live-uttrekk vurdert mot den forhåndsdefinerte dokumentfasiten,
slik at v1s KI-funksjonalitet og treffkvalitet dokumenteres uten hjelp fra etterfølgende rettinger.

**Kravspor:** FR-6/FR-7/FR-8/FR-9; NFR-4 og etterprøvbarhet i NFR-1; S2/S4 og K2; AD-3–AD-6/AD-9/AD-10; SPEC CAP-2/CAP-8 og verifikasjonsgrensene for S2 og live/tid/ren kjøring. UX-DR7/UX-DR12/UX-DR13/UX-DR16/UX-DR25/UX-DR40 videreføres ved kontroll av kilde/opphav; ingen evalueringsflate i produktet opprettes.

**Avhengigheter:** 2.2, 4.2 og 4.3, samt løst gjennomføringsport og tilgjengelig lokal nøkkel/budsjett. **Arbeidsgrense:** Faktiske eksplisitte kjøringer med valgt leverandør/modell og dokumentert S2-evaluering mot F1–F4-rapportene/fasit. Kontrollerte ekstra eksempler tester vurderingsmåten; de erstatter ikke reelle modelluttrekk. Bevis lagres under .docs/implementation-artifacts/ uten nøkkel/private originaler.

**Acceptance Criteria:**

**Given** fiktive rapporter og uavhengig fasit for F1–F4, fastlagt før modellkjøring
**When** evalueringsutvalget og forsøkene forberedes
**Then** alle eksplisitte TG2/TG3 er i fasiten med grad/beskrivelse/dokument/PDF-side, og utvalget omfatter både TG2 og TG3
**And** valgt kode-/kontrakt-/prompt-/modellversjon, rapporthash, planlagte forsøk og kostnadsramme er dokumentert; fasiten tilpasses ikke modellsvaret. **(AC1)**

**Given** støttet rapport og avklart live-oppsett
**When** faktiske eksplisitte analyser gjennomføres
**Then** produksjonsadapteren utfører reelle KI-kall og originale uttrekk/terminalutfall bevares før brukerretting med trygg kjøringsidentitet og konfigurasjon
**And** forsøk, feil og eventuelle senere manuelle gjentakelser er sporbare innen budsjett og duplikatregler; et lagret demosvar eller kontrollsvar kan ikke registreres som live-bevis. **(AC2)**

**Given** fasit og opprinnelig live-uttrekk
**When** hvert dokument vurderes
**Then** rapporteres antall fasitfunn, riktige, oversette, feil side og oppdiktede funn, med hvert kjent TG3 kontrollert enkeltvis for grad, beskrivelse og korrekt PDF-side
**And** feil side, usikre kandidater uten dokumentert støtte og brukerens senere rettinger teller ikke som riktige opprinnelige funn; oversett TG2 dokumenteres også når minimumet nås. **(AC3)**

**Given** fullstendig dokumentert evalueringsutvalg
**When** S2-status fastsettes
**Then** S2 er bestått bare når alle fasitmerkede TG3 og minst 90 % av TG2 er funnet med riktig PDF-side og ingen oppdiktede TG2/TG3 finnes i utvalget
**And** 90 % er et evalueringsminimum, ingen relevansfiltreringstillatelse eller generell kvalitetsgaranti; manglende/feilet analyse er ingen vellykket tomliste. **(AC4)**

**Given** påvist uttrekksfeil, ikke nådd S2 eller ufullstendig live-bevis
**When** resultatet dokumenteres og eventuell retting planlegges
**Then** reell status og berørte funn/versjoner fremgår, og manglende akseptanse kan ikke skjules bak demo eller brukerretting
**And** nye budsjettavklarte forsøk dokumenteres som nye forsøk uten automatisk retry, senket terskel, endret fasit eller utvidet scope; v1 erklæres ikke fullt verifisert med manglende nødvendig live-bevis. **(AC5)**

**Given** F3 med manglende L og øvrige dokument-/finanscaser
**When** dokumenttreff og samlet funksjonsbevis sammenstilles
**Then** F3s rapport kan vurderes for S2 ved adaptergrensen uten å fjerne den låste tallmangelen, mens F1/F2/F4 kan demonstrere faktisk live gjennom hovedflyten med korrekt kontroll/resultat
**And** F3 telles ikke som vellykket S5-hovedanalyse uten gyldig bekreftet tallgrunnlag; S1–S4 og kodeprioritet gjelder også når modellen har svart. **(AC6)**

**Testkrav:** Faktisk live-evaluering med de kontrollerte rapportene, opprinnelig uttrekk og manuell kildekontroll før rettinger teller. Bruk RT-16–RT-18 som kontroll av evalueringsmåten: 9/10 TG2 og 2/2 TG3 med riktig side og ingen oppdiktede består; oversett TG3, feil side som reduserer treff under kravet, oppdiktet funn eller 8/10 TG2 består ikke. Kontroller at manuell retting ikke endrer målt kvalitet på originaluttrekket, og at alle oversette funn registreres. Regnskapet over faktiske forsøk/kostnadsgrunnlag må samsvare med bevisene uten hemmeligheter. Evalueringsdokumentasjon er leveransebevis, ingen varig vurderingshistorikk i appen. Gyldige tidsdata kan gjenbrukes i 4.5; S2-storyen krever ingen ny timer eller fremtidig måleimplementasjon.

### Story 4.5: Måle live-analyse og menneskelig kontroll etter S5-protokollen

Som produkteier,
vil jeg ha dokumenterte tider for faktisk live-analyse og menneskelig kontroll sammenlignet med manuell førstevurdering,
slik at tidsmålet vurderes med samme kontrollkrav og uten å skjule feil.

**Kravspor:** NFR-5; S5 og K1 med S1–S4 som samtidige kontrollmål; målehendingene i FR-4/FR-5/FR-6/FR-9/FR-11; AD-5/AD-6/AD-10; SPEC CAP-2/CAP-3/CAP-4/CAP-8 og hele S5-målingen. UX-DR11/UX-DR18/UX-DR19/UX-DR33/UX-DR36–UX-DR38/UX-DR40/UX-DR41 er eksisterende hendelser/flyter, ikke ny telemetri.

**Avhengigheter:** 4.3 og 4.4, samt faktisk person til menneskelig kontroll/manuell referanse og avklart budsjett for eventuelle nye live-forsøk. **Arbeidsgrense:** Utføre og dokumentere den låste måleprotokollen. Gjenbruk bare faktiske gyldige registreringer med komplett hendelsesgrunnlag; ellers planlegg eksplisitte nye forsøk. Ingen produktfunksjon for timer, evaluering eller rapportering bygges.

**Acceptance Criteria:**

**Given** forhåndsdefinert utvalg med planlagte forsøk, gyldige bekreftede tall og ferdig opplastet støttet rapport
**When** et måleforsøk gjennomføres
**Then** t_start registreres ved Start analyse, t_liste når ferdig validert liste med sider/usikkerhet faktisk er synlig og t_bekreftet etter menneskelig kontroll og bekreftet gjeldende liste med håndtert TG3-status
**And** samme tidsgrunnlag og tilstrekkelig presisjon brukes; F3 uten rettet/bekreftet tallmangel har ikke gyldig S5-start. **(AC1)**

**Given** fullførte målepunkter
**When** varighetene beregnes
**Then** hovedanalyse er t_liste−t_start og menneskelig kontroll er t_bekreftet−t_liste
**And** registrering/opplasting før start, senere kodeberegning/anbefaling og videre investeringsarbeid holdes utenfor; avsluttet modellkall alene stopper ikke hovedanalysen. **(AC2)**

**Given** reell menneskelig kontroll med eventuelle rettinger/avvisninger og alvorlig TG3
**When** kontrollen avsluttes
**Then** nødvendig originalkontroll og gjeldende listebekreftelse er gjennomført, og TG3 kan fortsatt være Uavklart med Innhent mer informasjon
**And** raskere tid oppnås ikke ved å droppe kontrollsteg, skjule usikkerhet/TG3 eller automatisk sette Avklart; S1–S4 gjelder samtidig. **(AC3)**

**Given** vellykkede/feilede analyser, fullførte/ufullførte kontroller og eventuelle manglende målepunkter
**When** målegrunnlaget sammenstilles
**Then** case, rapport/uttrekk, modus, versjoner, relevante hendelser/varigheter, utfall og antall planlagte/målte forsøk dokumenteres med feil separat
**And** feiltid er ikke vellykket analysetid, ufullført kontroll er ikke null/rask kontroll og demo/live rapporteres separat uten utvalg som skjuler feil. **(AC4)**

**Given** gyldige målinger i det dokumenterte utvalget
**When** de to medianene og akseptansestatus beregnes
**Then** hovedanalyse og kontroll vurderes separat mot ≤300 s og ≤600 s, med gjennomsnittet av de to midterste ved partall
**And** nøyaktig likhet består uten avrunding av minutter; uten gyldige observasjoner er målet ikke verifisert, og god median alene opphever ikke feil eller kvalitetsbrudd. **(AC5)**

**Given** live-/kontrollmålinger og manuell førstevurdering av de samme casene
**When** tidsgevinst og S5-status rapporteres
**Then** den manuelle referansen har dokumenterte faktiske aktiviteter/avgrensninger og resultater, atskilt fra brukerens tidligere tidsanslag og fra lagret demo
**And** bevis og eventuelle ikke nådde mål er lagret under .docs/implementation-artifacts/ med spor til protokoll/versjoner; ingen generell tidsgevinst eller bestått live-tid utledes av demosvar/feiltid. **(AC6)**

**Testkrav:** Gjennomfør faktiske målinger med menneskelig kontroll og manuell referanse; kontroller registrering/beregning mot TT-1–TT-9. Protokollkontrollen skal blant annet gi 150 s når modellkallet slutter ved 120 s og listen vises ved 150 s, skille 20 s feiltid fra suksess, godta fullført kontroll med Uavklart TG3 og gi medianene 270/540 s for TT-7. TT-8 skal skille 300/600 fra 301/601; TT-9 skal holde rask demo og feilet live atskilt. Ingen fast mengde observasjoner, apptelemetri eller hard timeout legges til; faktisk utvalg, fullstendighet og alle forsøk skal være synlige. Åpne S5-/kvalitetsavvik kan ikke omtales som bestått i Epic 5.

## Epic 5: Gjennomføre og etterprøve v1 som sensor fra README

En annen person kan forstå prosjektet, installere, bygge, starte og teste den lokale demoen fra README uten gruppens nøkkel/betalt konto. Gruppen har etterprøvbare bevis for krav, kvalitet, faktisk KI-funksjonalitet og åpne avvik på den dokumenterte leveranseversjonen.

| Story | Avgrenset leveranse | Direkte forutsetninger |
|---|---|---|
| 5.1 | Samlet automatisk demoregresjon og relevant logikkdekning | 2.11, 3.7, 3.8, 3.9 |
| 5.2 | Dokumentert manuell kontroll av felles UX og tilgjengelighet | 2.7, 3.7, 3.8, 3.9 |
| 5.3 | Faktisk README-oppskrift for lokal demo og tester | 3.9, 5.1 |
| 5.4 | S6: en annen person følger README i rent dokumentert miljø | 5.1, 5.2, 5.3 |
| 5.5 | Samlet krav-/evalueringsbevis, live-anvisning og ryddig leveranserepo | 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4 |

5.1–5.4 kan gjennomføres etter Epic 3 for den leverte demoen, uten leverandør-/nøkkelavhengighet. 5.3 leverer en fullstendig demooppskrift; endelige live-anvisninger og samlet v1-status er uttrykkelig arbeid i 5.5 etter Epic 4. 5.2 dekker den felles brukerflyten; live-spesifikke tilstander kontrolleres i 4.3 og tas med i 5.5. Tidlige bevis gjelder den faktisk prøvde versjonen; berørte endringer krever relevant ny verifikasjon før de brukes som bevis for endelig leveranse.

Ingen story krever en senere story for sin avgrensede verifikasjon. Ingen generell omskriving eller ny testtype bestilles; konkrete avdekkede hull/rettinger spores til funksjonsstory og låst krav. Fullført offline-kjøring er verdifullt S6-bevis, men erstatter ikke produktets påkrevde live-funksjonalitet eller S2/S5-bevis.

### Story 5.1: Etterprøve den samlede demoen med meningsfulle automatiserte tester

Som utvikler,
vil jeg kjøre den leverte logikken og den bygde demoens kjerneflyter samlet mot uavhengig fasit,
slik at integrasjonsfeil og manglende testdekning oppdages før sensor følger oppskriften.

**Kravspor:** FR-1–FR-18 ved relevante demo-/modulgrenser; NFR-1/NFR-3; S1/S3/S4 og testgrunnlag for S6; AD-1–AD-10 ved leverte grenser, særlig AD-7/AD-8/AD-10; SPEC CAP-1–CAP-8 som demoverifikasjon. UX-DR2/UX-DR15/UX-DR18/UX-DR19/UX-DR26/UX-DR36–UX-DR41 knyttes til faktiske flyt-/tilstandstester; manuell UX er 5.2. Sensor s. 3–4 og faglærerens finans-/fasitføring.

**Avhengigheter:** 2.11, 3.7, 3.8 og 3.9. **Arbeidsgrense:** Kjør og sammenstill eksisterende unit-/integrasjons-/bygget-app-tester og fyll bare konkrete hull i den låste kjerneflyten. Fasit er uavhengig; kontrolladapteren bruker samme grense som produktet. Live-SDK-/HTTP-integrasjonen har egne tester i Epic 4 og tas med i samlet leveransebevis i 5.5.

**Acceptance Criteria:**

**Given** den leverte demoen med faktiske PDF-fixtures og forhåndsdefinert fasit
**When** de dokumenterte lokale testene og bygget-app-E2E kjøres
**Then** testene bruker faktiske moduler/grenser og verifiserer forventet funksjon fra kravfasiten, med versjon/kommando/resultat dokumentert
**And** automatisert E2E bruker kontrolladapter og ingen betalt KI-tjeneste; forventede verdier produseres ikke med funksjonen som testes. **(AC1)**

**Given** F1/F2/F3/F4 og relevante BT-/AT-/FR-5-varianter
**When** økonomi og screening kontrolleres
**Then** F1 gir korrekte tall/Gå videre, F2 korrekte tall/Forkast, F3 manglende L/ingen leieavhengige tall/Innhent mer informasjon og F4 uavklart TG3/delgrunnlag/Innhent mer informasjon
**And** null/blank, år/måned, kildekonflikt, negative resultater, likhet/én krone under, begge økonomiske brudd og alle samtidige prioritet-1-utløsere er dekket ved riktig testgrense. **(AC2)**

**Given** dokument-/analyse-/kontrollfeil og endringsforløp
**When** regresjonssuiten kjører
**Then** støttet/ustøttet PDF, kilde/side/usikkerhet, completed-tomliste kontra failed, utkast/Bruk/Avbryt/Avvis, separat TG3/listebekreftelse og historisk/gjeldende resultat etterprøves
**And** duplikat/sent svar/ny rapport og gjenbruk ved finans-/funn-/TG3-endring kontrolleres med faktisk kallantall og revisjon, uten falsk fullføring eller ekstra adapterkall. **(AC3)**

**Given** normal videregang er sperret ved utilstrekkelig grunnlag
**When** feilvarianter testes
**Then** brukerforløpet får korrekt lokal Innhent mer informasjon og nødvendig handling uten en ny snarvei til Resultat
**And** tilstander som ikke kan nås i hovedreisen testes ved ren modul-/reducer-/komponentgrense; testen endrer ikke produktets navigasjon eller bekreftelseskrav. **(AC4)**

**Given** en testfeil eller påvist hull
**When** funnet håndteres
**Then** det kobles til konkret krav/story/forventning, rettes innen låst funksjonsansvar og får relevant ny verifikasjon
**And** resultatet rapporterer faktisk bestått/feilet/ikke kjørt med begrensning; mange tester eller bestått demo brukes ikke som S2-/live-S5-bevis. **(AC5)**

**Testkrav:** Kjør npm test og npm run test:e2e etter faktisk build/browserforberedelse. Spor eksisterende RT-1–RT-19/BT-1–BT-18/AT-1–AT-20 og sju FR-5-eksempler til den testgrensen som faktisk dekkes; RT-16–RT-18s reelle modelltreff er fortsatt 4.4, og TT/S5 er fortsatt egen evaluering. Gjennomgå at sentrale tester kan feile på feil verdi, feil prioritet, feil status/side/revisjon eller ekstra kall, fremfor bare å observere at en handler ble kalt. Ikke innfør ny dekningsprosent, parallell testfasit eller alle tenkelige testtyper.

### Story 5.2: Etterprøve hele den felles brukerflyten og grunnleggende tilgjengelighet

Som investor,
vil jeg kunne forstå og gjennomføre de fire trinnene med lesbare tilstander, originalkontroll og tastatur,
slik at feil, korrigeringer og de tre anbefalingene kan tolkes riktig.

**Kravspor:** NFR-2; FR-1–FR-5/FR-8–FR-11/FR-14–FR-18 og lokale feil etter FR-6/FR-9; S3/S4; AD-2/AD-9/AD-10; SPEC CAP-1/CAP-3/CAP-4/CAP-6/CAP-7/CAP-8 som UX-verifikasjon. UX-DR1–UX-DR41 ved realiserte felles-/demoflater, særlig UX-DR30–UX-DR35/UX-DR39/UX-DR41. Sensor s. 4–5 og final DESIGN/EXPERIENCE.

**Avhengigheter:** 2.7, 3.7, 3.8 og 3.9. **Arbeidsgrense:** Dokumentert manuell kontroll av den leverte felles demo-/kontroll-/resultatflyten mot final UX og eksisterende mocks. Konkrete avvik rettes innen opprinnelig UX-kontrakt. Live-spesifikke konfigurasjons-/leverandørtilstander leveres/kontrolleres i 4.3 og samles i 5.5, uten å blokkere denne offline-kontrollen.

**Acceptance Criteria:**

**Given** bygget demo og de fire Key Flows i final EXPERIENCE
**When** hovedreise, korrigering/TG3-skille, endring etter Resultat og feil/demo gjennomgås manuelt
**Then** eksakte trinnnavn/status, navigasjon, lokale feil, kontroll-/bekreftelsesbegreper, resultat og neste handling stemmer med final UX
**And** utkast, opprinnelig uttrekk, brukt korrigering, avvisning og separat brukerbekreftet TG3-avklaring kan skilles, også etter retur/endring. **(AC1)**

**Given** tastaturbruk i alle fire trinn
**When** felt, funn, handlinger, PDF og detaljseksjoner brukes
**Then** forståelig fokusrekkefølge, synlig fokus, etiketter/enheter/kilder/feil og åpen/lukket-tilstander fungerer, mens skjult innhold er utenfor fokusrekkefølgen
**And** trinnnavigasjon/ugyldig bekreftelse/panelåpning-lukking følger riktig fokusforløp, og viktige statusendringer kunngjøres kort én gang uten fokusstjeling. **(AC2)**

**Given** 1440×900, 1280×800 og relevant zoom/smalere CSS-flate
**When** funn og originalrapport kontrolleres
**Then** korrekt PDF-posisjon, hel side/nabosider, side-ved-side fra 1200 CSS px og behovsåpnet panel under grensen fungerer med valgt funn/kontekst/utkast bevart
**And** Esc/synlig retur gjenoppretter fokus, sticky stepper skjuler ikke fokusert innhold og alle navn/nummer/status/tall/kilder forblir tilgjengelige. **(AC3)**

**Given** tekst, kontrollgrenser, fokus, status og historisk/delvis resultat
**When** faktisk visning sammenlignes med DESIGN
**Then** grafitt-/petroltokens, typografi/geometri og praktiske kontrastmål 4,5:1 for informasjonstekst og 3:1 for nødvendige kontrollgrenser/fokus er ivaretatt
**And** mening gis også med tekst, meningsbærende grafikk har relevant alternativtekst og dekorasjon gir ingen redundant informasjon; ingen sertifisering eller ny mobilreise påstås. **(AC4)**

**Given** de tre anbefalingene og tomt/usikkert/feilet/ubekreftet/utdatert grunnlag
**When** forståelse av resultat og nødvendig handling vurderes
**Then** anbefaling, kort grunn, alle avgjørende regler, fire tall, alvorlige forhold, mangler og neste handling kan forstås uten detaljåpning
**And** original-/formel-/kildedetaljer er tilgjengelige ved behov; Gå videre forstås som videre vurdering, og feil/tomliste/kontroll/TG3/Delgrunnlag/Utdatert blandes ikke. **(AC5)**

**Given** observerte UX-avvik
**When** kontrollen avsluttes
**Then** miljø/størrelse/zoom, case, handling, forventet/faktisk utfall, krav-/UX-spor og eventuell retting/ny kontroll dokumenteres
**And** uavklarte avvik beholder synlig status; mocks, automatisk testresultat eller egen forventning erstatter ikke den faktiske manuelle kontrollen. **(AC6)**

**Testkrav:** Utfør Key Flows 1–4 med F1/F2/F4 og relevante RT-/AT-feil/returvarianter i bygget demo. Dekk ugyldig tallbekreftelse, kildefeil/usikker kandidat, gyldig tomliste kontra analysefeil, originalside/panel/Esc, ubrukt utkast/Bruk/Avbryt, TG3-tekst/status og ny relevant bekreftelse. Registrer faktiske kontrastpar og tastatur-/fokus-/zoom-/statusobservasjoner mot DESIGN/EXPERIENCE. Uendrede kontroller gjentas bare når nye endringer eller funn gjør det nødvendig; dette er ingen ny generell brukerstudie eller testsertifisering.

### Story 5.3: Dokumentere en komplett oppskrift for lokal demo og tester

Som sensor,
vil jeg finne prosjektets formål, forutsetninger og eksakte demo-/testkommandoer i README,
slik at jeg kan kjøre den leverte demoen uten gruppens hjelp eller API-nøkkel.

**Kravspor:** NFR-3/NFR-4; S6; FR-6/FR-15–FR-18 i dokumentert demo; AD-1/AD-6/AD-9/AD-10; SPEC CAP-8 og README-/kjørbarhetsføringene. UX-DR1/UX-DR2/UX-DR36/UX-DR40/UX-DR41 spores gjennom den beskrevne demoflyten; README innfører ingen egen produktflate. Sensor s. 2 og 5–6, faglærerens kjørbarhets-/demoføring og AGENTS.md.

**Avhengigheter:** 3.9 og 5.1. **Arbeidsgrense:** Oppdater prosjektets README med faktisk fungerende installasjon/build/start/test og demooppskrift. Oppskriften skal fungere for demo uavhengig av Epic 4. Endelige detaljer for den leverte live-integrasjonen og full v1-bevisstatus innarbeides i 5.5; det er ingen forutsetning for å levere denne komplette demooppskriften.

**Acceptance Criteria:**

**Given** faktisk levert kode, pakke-/låsfil og lokale kommandokontrakter
**When** README oppdateres
**Then** formål/målgruppe, smal v1, versjonerte forutsetninger og eksakte kopierbare kommandoer for npm ci → npm run build → npm run demo, lokal loopback-adresse og npm run dev beskrives korrekt
**And** README samsvarer med faktisk oppstart og forklarer nødvendige lokale forberedelser uten særskilt infrastruktur eller skjulte globale avhengigheter. **(AC1)**

**Given** lokale tester og bygget-app-E2E
**When** testoppskriften følges
**Then** faktisk browserinstallasjon/forberedelse, npm test og npm run test:e2e med nødvendig build og kontrolladapter er dokumentert
**And** det fremgår hva testene dekker og at automatisert E2E ikke krever en betalt KI-tjeneste. **(AC2)**

**Given** fiktive casefiler og merket demo
**When** en leser følger demoveiledningen
**Then** de kan finne støttet rapport og registreringsgrunnlag, kontrollere original/funn, håndtere TG3 og bruke nødvendige bekreftelser for de tre anbefalingene
**And** blank/null, F3s tallmangel, F4s Uavklart TG3, lokal feilforklaring og retur/ny beregning beskrives uten å omgå kontrolltrinn eller kreve nøkkel/nett under flyten. **(AC3)**

**Given** demooppskriften og live som påkrevd v1-funksjonalitet med separat konfigurasjon
**When** kjøreformene omtales
**Then** demo er standard og krever ingen live-nøkkel; installasjonsnett skilles fra nett-/nøkkelfri demokjøring
**And** live-funksjonens faktiske status beskrives nøkternt, uten å kalle leveransekravet valgfritt eller påstå ferdig integrasjon/evaluering før den foreligger. **(AC4)**

**Given** prosjektets faktiske struktur og eksisterende planer/prosess-/testbevis
**When** dokumentasjonen ferdigstilles
**Then** README forklarer kode-/test-/dokumentasjonsplassering og har gyldige lenker til relevant låst grunnlag, viktige arbeidsøkter/prompts og tilgjengelige bevis
**And** eksempler/kommandoer inneholder ingen ekte hemmeligheter/private originaler, og en egen gjennomkjøring fra oppskriften avdekker manglende steg før annen-person-kontrollen. **(AC5)**

**Testkrav:** Følg de faktiske kommandoene fra README og noter miljø/resultat; kontroller demo med nøkkel fjernet og eksternt nett sperret etter installasjon/browserforberedelse. Åpne de lenkede case-/plan-/prosessfilene og gjennomfør beskrevet feil-/retur-/bekreftelsesflyt mot F1–F4. Verifiser oppskriften ved faktisk kjøring, uten nye enhetstester som bare kontrollerer README-tekst. Egen gjennomkjøring er forberedelse og teller ikke som S6; 5.4 krever en annen person.

### Story 5.4: La en annen person gjennomføre README-basert ren kjøring

Som sensor,
vil jeg at en annen person har prøvd hele oppskriften i et rent dokumentert lokalt miljø,
slik at manglende forutsetninger og feil i leveransen blir synlige før jeg overtar.

**Kravspor:** NFR-3 med NFR-1/NFR-2/NFR-4 ved faktisk kjøring; S6 og relevante S1/S3/S4; FR-6/FR-15–FR-18 og demoens kontroller; AD-6/AD-9/AD-10; SPEC CAP-8 og verifikasjonsgrensene for S6 og live/tid/ren kjøring. UX-DR1/UX-DR2/UX-DR36/UX-DR40/UX-DR41 er den faktiske demoflyten; manuell UX-dybdekontroll er 5.2. Sensor s. 2 og 5–6.

**Avhengigheter:** 5.1, 5.2 og 5.3. **Avklaringspunkt:** Mads organiserer en annen person og et rent lokalt miljø før S6-kjøringen. Personen er ikke utviklingsagenten som bare gjentar sin egen oppskrift. **Arbeidsgrense:** Faktisk annen-person-kjøring fra den dokumenterte repo-/leveranseversjonen med README som eneste oppskrift, og relevante rettinger/ny kontroll ved avvik. Ingen melding eller invitasjon sendes gjennom denne planleggingen.

**Acceptance Criteria:**

**Given** dokumentert repo-/leveranseversjon og en annen person i rent lokalt miljø
**When** installasjon og oppstart forsøkes kun etter README
**Then** miljø, forutsetninger, kommandoer og utfall registreres uten gruppens nøkkel, betalt konto eller særskilt egen infrastruktur
**And** manglende/uklare steg registreres som avvik fremfor å løses med udokumentert muntlig hjelp. **(AC1)**

**Given** dokumenterte avhengigheter og browser er installert
**When** selve demoen gjennomføres med eksternt nett sperret
**Then** lokale frontend-/API-/PDF-/worker-/font-/fixture-ressurser er tilstrekkelige for hele vurderingsflyten
**And** demoen er tydelig merket og ingen KI-klient, nøkkel eller betalt kall kreves; installasjonens eventuelle nettbehov fremstilles ikke som offline-installasjon. **(AC2)**

**Given** README-oppskriften og de kontrollerte casene
**When** personen registrerer/kontrollerer tall og rapportfunn, håndterer TG3, bekrefter grunnlaget og endrer finansverdier
**Then** alle tre anbefalinger kan demonstreres med korrekte kodeberegninger og nødvendige kontrollsteg
**And** tallmangler forstås lokalt, Uavklart TG3 kan bestå etter listekontroll og uendret rapport gjenbrukes ved ny lokal beregning uten nøkkel/nett. **(AC3)**

**Given** README-dokumenterte lokale tester
**When** personen kjører dem etter oppskriften
**Then** kommandoer og faktiske resultater registreres sammen med eventuelle feil
**And** testene bruker de lokale fasit-/kontrollgrensene og regnes ikke som live-S2-/S5-bevis. **(AC4)**

**Given** avvik i oppskrift, installasjon, demo eller tester
**When** de håndteres
**Then** funn kobles til berørt krav/story, nødvendig kode-/oppskriftsretting og faktisk ny verifikasjon av det som feilet
**And** S6 markeres bestått først når den andre personen kan gjennomføre hele demoen og de dokumenterte testene fra korrigert README; ufullført/ikke gjennomført beholdes med reell status. **(AC5)**

**Testkrav:** Utfør faktisk S6 med annen person, dokumentert rent miljø og konkret repo-/buildversjon. Bevar gjennomføringslogg med kommandoer, tre anbefalinger, kontroll-/feil-/returhandlinger og testresultater, uten hemmeligheter. En agentlaget sjekkliste, egen kjøring, tidligere utviklermiljø eller en README-gjennomlesing erstatter ikke forsøket. Demoens S6 kan verifiseres før Epic 4; det gjør ikke samlet v1/live-funksjonalitet ferdig.

### Story 5.5: Samle etterprøvbare leveransebevis og kontrollere repoet

Som sensor,
vil jeg finne sammenheng mellom låste krav, faktisk kode/tester og dokumenterte resultater i et ryddig repo,
slik at leveransen og eventuelle gjenstående mangler kan vurderes uten udokumenterte påstander.

**Kravspor:** FR-1–FR-18, NFR-1–NFR-5, S1–S6 og K1–K3 som samlet leveransekontroll; AD-1–AD-10; SPEC CAP-1–CAP-8 og kurs-/leveranse-/verifikasjonsføringer. UX-DR1–UX-DR41 spores til levert funksjon og relevante faktiske kontroller. Sensor s. 1–7, gjeldende faglæreroppfølging og AGENTS.md; ingen karakter-/sertifiseringspåstand.

**Avhengigheter:** 4.3, 4.4, 4.5, 5.1, 5.2, 5.3 og 5.4. **Arbeidsgrense:** Sammenstill faktisk krav-/test-/evalueringsstatus, oppdater README med leverte live-detaljer, kontroller sentrale arkitekturgrenser og repo-/prosessbevis. Tidlige demo-/S6-bevis må fortsatt være relevante for den faktiske leveranseversjonen. Ingen ny produktfunksjon eller omskriving av låst grunnlag.

**Acceptance Criteria:**

**Given** faktisk kode, tester og manuelle/evalueringsbevis for leveranseversjonen
**When** kravsporingen sammenstilles
**Then** FR/NFR, CAP, relevante AD/UX-DR, story, konkrete kode-/teststeder, testeksempler/kommandoer og bevis kan følges fra plan til faktisk resultat
**And** hull eller avvik har konkret berørt krav og neste arbeid/eier; en planreferanse eller testtittel alene regnes ikke som verifisert funksjon. **(AC1)**

**Given** S1–S6 og kontrollmål K1–K3
**When** akseptansestatus rapporteres
**Then** faktisk bestått/ikke bestått/ikke verifisert er dokumentert med grunnlag og begrensninger: uavhengig tallfasit, opprinnelig live-S2, regelutfall, kilder/opphav, separate S5-målinger/manuell referanse og faktisk annen-person-S6
**And** demo, brukerrettinger, lave feiltider eller andelen Gå videre brukes ikke som erstatning for de påkrevde bevisene; manglende live-leveranse eller ikke nådde mål skjules ikke. **(AC2)**

**Given** den faktisk leverte live-integrasjonen fra Epic 4 og demooppskriften fra 5.3
**When** endelig README synkroniseres med leveransen
**Then** valgt leverandør/modell, nødvendige lokale miljøvariabler/eksempelfil uten nøkkel, faktisk live-oppstart og avklart kostnads-/timeoutgrunnlag er forklart der det trengs for kjøring
**And** demo forblir en komplett selvstendig kjøreform uten nøkkel; README oppgir reell funksjons-/bevisstatus og har fungerende lenker til plan/prosess/leveransebevis. **(AC3)**

**Given** sentrale kodeområder og final arkitektur
**When** faktisk struktur/ansvar og relevant kvalitetssikring kontrolleres
**Then** kontraktautoritet, rene finans-/terskel-/screeningfunksjoner, frontendøkt/snapshot og dokument-/demo-/live-grenser stemmer med AD-ene uten dupliserte regler
**And** konkrete observasjoner fra kodegjennomgang, feil og rettinger har spor til krav/story/endring og relevant ny test; gamle/døde KI-forsøk brukes ikke som levert løsning. **(AC4)**

**Given** versjonerte filer/historikk, test-/evalueringsdata og faktisk repo-/buildinnhold
**When** leveransens repo-/datakontroll utføres
**Then** hemmeligheter/private originaler, avhengighetskataloger, lokale miljøfiler, bygge-/testråartefakter og tilfeldige rester holdes utenfor leveransen i samsvar med NFR-4/.gitignore
**And** nødvendige fiktive fixtures, låsfil og kuraterte bevis/prosessdokumenter er tilgjengelige; ekte publiserte dokumenter har vurdert rettighet/personvern/anonymisering, og eventuelle sensitive funn rapporteres uten å gjengi verdiene. **(AC5)**

**Given** plan-/prompt-/arbeidsøktshistorikk og bevis fra ulike implementeringsversjoner
**When** leveransegrunnlaget ferdigstilles
**Then** faktiske beslutninger, KI-styring, avvik og rettinger er bevart og knyttet til relevante endringer; historiske forslag og erstattet scope skilles fra gjeldende kontrakt uten oppdiktede økter/commits
**And** bevisenes versjon/relevans er kontrollert, berørte endringer har nødvendig ny verifikasjon og åpne mangler hindrer falsk påstand om fullført v1; ingen kilde eller testfasit er endret for å få leveransen til å se bestått ut. **(AC6)**

**Testkrav:** Følg konkrete spor fra hvert FR/NFR/CAP og relevante AD/UX-DR til faktisk kode, fasit/test og bevis. Kontroller S1–S6 og K1–K3 mot 4.4/4.5/5.1/5.2/5.4, og kontroller at RT-/BT-/AT-/TT- og FR-5-henvisninger angir reell testgrense. Prøv endelige README-kommandoer/live-eksempler i kontrollert konfigurasjon uten å utføre nye uavklarte betalte kall. Inspiser faktisk filinventar/historikk/.gitignore og lenker/eksempelfiler uten å skrive hemmeligheter til testutdata; bevar nyttige prosessbevis. Kjør relevante automatiserte kontroller på leveranseversjonen når nye endringer eller utdaterte bevis gjør det nødvendig, og gjenta berørt manuell/S6-kontroll ved materiell endring av den prøvde oppskriften/flyten. Dette er leveransekontroll ved senere implementering, ikke den planleggingsbaserte implementation readiness-kontrollen som skal utføres før kodearbeid.

## Valideringsstatus — 2026-10-16

Alle fem epics og 37 stories er godkjent og innarbeidet med 188 akseptansekriterier. Deknings-/strukturkontrollen i BMAD steg 4 er ferdig; ingen udekkede FR/NFR/CAP/AD/UX-DR, foreldreløse nye funksjoner eller skjulte fremtidige storyavhengigheter er funnet. 117 direkte storyavhengigheter er kontrollert uten syklus. Alle 14 låste kilder og de godkjente storytekstene er bevart uendret.

**Implementation readiness: CONCERNS.** [Rapporten](implementation-readiness.md) dokumenterer særlig leverandør/modell/budsjett/live-timeouter før Epic 4, PDF-lesbarhetsmetode før 2.3, upload-/HTTP-ressurser/opprydding før 2.5 og faktiske personer/miljø før S5/S6. Dette er ikke nye produktkrav eller anledning til å endre låst grunnlag. Første story kan være 1.1 når kodearbeid senere bestilles; de registrerte portene gjelder fortsatt.

Ingen installasjon, appkode, fixtures, produkttester, live-kjøring eller sprint-statusfil er opprettet/kjørt gjennom planleggingskontrollen. S1–S6 er akseptansemål som skal bevises ved implementering; de er ikke markert oppnådd fra planen.

Mads valgte C ved det terminale kontrollpunktet 2026-10-16. Alle fire workflow-steg er fullført, og planleggingsworkflowen er avsluttet med dokumenterte readiness-forbehold. Godkjenningen lukker ikke de fire avklaringspunktene, endrer ingen låst kilde og starter ingen implementering.

**Status: Epics og stories ferdigstilt. Implementation readiness: CONCERNS.**
