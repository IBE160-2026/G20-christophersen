# Kildeavstemming: ferdigstilt Product Brief og addendum

Dato: 2026-10-14. Uavhengig avstemming av [brief](../../../briefs/brief-IBE160-2026-09-15/brief.md) og [addendum](../../../briefs/brief-IBE160-2026-09-15/addendum.md) mot [ARCHITECTURE-SPINE](../ARCHITECTURE-SPINE.md), med [beslutningsloggen](../.memlog.md) og brukerens Q-1–Q-7 som bindinger.

**Vurdering: Forenlig med dette kildegrunnlaget. Ingen blokkerende eller vesentlige kravkonflikter; ett lavt presiseringspunkt.** Rapporten verifiserer dokumentkonsistens, ikke produktkode eller teknologistakkens kjørbarhet. Ingen kilder eller arkitekturbeslutninger er endret.

## Funn B-1 — Lav: gjør kostnadsavgrensningen eksplisitt ved finansgrensen

- **Kilde:** Briefens «Finansdefinisjoner for v1» og addendumets «Utregnet fasit»: P inkluderer eventuell fellesgjeld og utelater kjøpsomkostninger; renter/avdrag, også fra felleskostnader, inngår i J og skal ikke dobbelttelles i D. Det trekkes ikke fra separat ledighet eller særskilte reparasjonstiltak i v1-formlene.
- **Spineplassering:** AD-7, særlig regelavsnittet på linje 106; `domain/validation` i Structural Seed og verifikasjon av input/finans.
- **Observasjon:** AD-7 bevarer kostnadsinnhold og kildegrunnlag og binder FR-1–FR-4. Kravene er derfor arvet og motsies ikke. Den korte regelen sier likevel ikke konkret hvilke kostnadsavgrensninger validerings-/normaliseringsmodulen skal bevare. En implementatør som leser spinen isolert kan bruke et feilaktig P eller et dobbelttelt D/J og fortsatt følge de oppgitte regneformlene.
- **Anbefaling:** Legg eventuelt én kort regel i AD-7 som gjør de allerede godkjente avgrensningene eksplisitte og plasserer ansvaret i validering av brukerens kostnadsgrunnlag. Dette krever verken ny finansregel, automatiske kostnadsestimater eller et nytt produktvalg. Eksisterende PRD-/fasitbindinger er tilstrekkelig kilde for detaljene.

## Avstemte bindinger

| Brief/addendum | Ivaretatt i spinen |
| --- | --- |
| Ett brukerregistrert boligutleieobjekt, én tekstbasert PDF på høyst 30 sider; enkel sekvensiell pipeline | Design Paradigm, AD-1, AD-3, pipeline-diagrammet og Structural Seed |
| KI har dokumentuttrekksansvar; kode eier finans og anbefaling; ingen agentrammeverk | AD-1, AD-3, AD-6–AD-8; frontend/backend har ulike eiere og kontraktgrenser |
| Dokumentnavn/PDF-side, originalkilde, synlige mangler, brukerretting og separat avklaring | AD-2–AD-4, AD-8; Consistency Conventions bevarer funnidentitet og opphav |
| Mangler/konflikter/uleselig eller avbrutt rapport og uavklart alvorlig TG3 prioriteres foran økonomi | AD-4, AD-7–AD-8; fullføring skilles fra gyldig tomliste og brukerbekreftelse |
| L/P, L−D, NOI/P og NOI−J; P>0, øvrige verdier ikke-negative; blank er ikke null; uavrundede terskler | AD-7; eksakt kryssmultiplikasjon er ekvivalent med låst yieldregel og samsvarer med Q-5 |
| Ingen automatisk forkastelse av TG2/TG3; ingen score/kjøpsbeslutning | AD-8 og bindende v1-/PRD-scope |
| Aktiv omberegning ved brukerendring; uendret rapportuttrekk gjenbrukes uten nytt KI-kall | AD-2, AD-6–AD-8; resultatversjon bindes til gjeldende grunnlag |
| Demo uten nøkkel/nett, tydelig lagret analyse; live valgfritt, ett kall uten automatisk omkjøring | AD-5–AD-6, AD-9; rapportbundet fixture og identisk etterfølgende flyt følger Q-4 |
| Minst fire kontrollerte caser og uavhengig fasit; finans/regler og live uttrekk evalueres separat | AD-10 og Verifikasjonsgrenser inkluderer F1–F4, grensevarianter og særskilt S2/S5/S6-bevis |
| Sensor kan kjøre demo og tester etter README uten gruppens nøkler eller kontoer | AD-9, Structural Seed og ren lokal kjøring; én bygget app/server følger Q-6 |
| Budsjett/modell/pris vurderes før betalte tester; private originaler/hemmeligheter utenfor Git; kravspor og prosess lagres | AD-9–AD-10, Deferred og beslutningsloggen; disse er gjennomføringsarbeid, ikke påståtte leveranser |
| OCR, sourcing, markeds-/juridisk analyse, reparasjonsestimater og utvidet finans utenfor v1 | Bindende kilde-/scopearv; AD-3 og AD-8 gjør flere av grensene eksplisitte; ingen modul eller beslutning innfører øvrige ambisjoner |

## Kildepresedens og avgrensning

Briefens historiske formulering «relevante, eksplisitte» TG2/TG3 brukes ikke til å gjeninnføre relevansfiltrering: beslutningsloggen presiserer at final PRD gjelder og krever alle eksplisitte TG2/TG3. AD-3 forbyr skjult bortfiltrering. Endelig PRD/UX kan konkretisere briefnivået uten at det utgjør en konflikt; Q-1–Q-7 gjenåpnes ikke.

Detaljer som KI-leverandør, timeout, lesbarhetskontroll og faktisk utarbeidede fixtures er korrekt merket som gjenstående gjennomføringsarbeid. Brief/addendum gir ingen hjemmel for å starte epics, stories, implementering eller betalte tester i denne avstemmingen.
