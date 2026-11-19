---
title: "PRD: Property Acquisition Agent"
status: final
created: 2026-10-10
updated: 2026-11-19
---

# PRD: Property Acquisition Agent

## Formål og gjeldende kravstatus

PAA hjelper en privat eiendomsinvestor i Norge med førstevurdering av ett boligutleieobjekt. Verdien er kontrollerbare dokumentkilder, etterprøvbar økonomi og synlige mangler før videre undersøkelser. Dette er gjeldende kravgrunnlag, avstemt 19. november mot produktkode i commit **6392918**, leveransekontroll i **6e3fbe6/3a26521** og faglærerens formative [PRD-tilbakemelding](tilbakemelding-prd.md) fra 12. november. Ingen produktkode er endret i denne revisjonen.

**Final betyr ferdig kravrevisjon, ikke bestått produktakseptanse.** Dokumentdekning, uavhengig brukertest, S5 og menneskelig S6 er fortsatt begrenset eller uutført. Gjeldende krav står nedenfor; dokumenterte avvik står i [sentral oversikt](../../../implementation-artifacts/deferred-work.md). Historisk ordlyd finnes i samme filsti i commit **684e61d** og kan hentes med git show. Opprinnelige FR-/NFR-/S-/UJ-/K-ID-er beholdes. Nummererte kriterier nedenfor er revidert tekst; eldre story-AC og RT/BT/AT/TT-ID-er endres ikke i ettertid.

### Gjeldende status per krav

«Bevart» gjelder kravets innhold, ikke en påstand om generell testdekning. Konkret kode og test per ID finnes i [krav–kode–test-avstemmingen](../../../process/leveranse-2026-11-06/produkt-og-sporbarhet.md#prd-til-implementasjon-og-tester) og [verifiserbart implementeringsgrunnlag](implementation-evidence-2026-11-19.md).

| ID | Endring fra 10. oktober | Gjeldende funksjon / avvik |
|---|---|---|
| UJ-1 | Endret 28. oktober–6. november | Salgsoppgave → oversikt/scenario → kontroll → eventuell screening; import før tallbekreftelse. |
| FR-1 | Utvidet | Manuelle felt og ubekreftede PDF-kandidater; scenario separat. |
| FR-2 | Utvidet | Flere kildebelegg, kjøpskostnader og datert lokal leiereferanse; ufullstendig drift markeres. |
| FR-3 | Bevart | Blank/null/ugyldig og eksplisitt nullbekreftelse i kontrollert grunnlag. |
| FR-4 | Endret | Tallbekreftelse før kontrollert screening; lokal dokumentanalyse kan skje tidligere. |
| FR-5 | Presisert mot kode | Alle aktive TG3 krever gyldig, funnbundet avklaring; ingen egen alvorlighetsklassifikator. |
| FR-6 | Endret | Hovedimport PDF ≤200 sider / 50 MiB; eldre separat rapportadapter ≤30 sider beholdes. Vanlig import bruker ingen språkmodell. |
| FR-7 | Mål bevart, metode endret | Alle eksplisitte TG2/TG3 er uttrekksoppgaven; lokal dekning er delvis. Generell oppfyllelse av S2 er ikke bevist. |
| FR-8 | Utvidet | Originalvisning, fysisk side, hash, tekstintervall/sitat der tilgjengelig. |
| FR-9 | Utvidet | Dekningshull, OCR-usikkerhet og separate delutfall; feil er aldri vellykket tomliste. |
| FR-10 | Bevart | Korriger/avvis i kontrollflyt med bevart opphav; gjelder også importerte kandidater. |
| FR-11 | Bevart | Bekreft gjeldende liste; ufullstendig dekning kan ikke bekreftes bort. |
| FR-12 | Kjerne bevart, utvidelse | Fire låste formler; kapital, annuitet og scenario i egne beregninger. |
| FR-13 | Bevart | Gyldige delberegninger tillates; foreløpig scenario er ikke komplett grunnlag. |
| FR-14 | Bevart | Sporbare formler, uavrundede terskler; også kilde/antakelse for scenario. |
| FR-15 | Utvidet | Nytt kontrollert grunnlag gjør resultat utdatert; scenario overskriver ikke snapshot. |
| FR-16 | Bevart | Tre anbefalinger med uendret prioritet i kode. |
| FR-17 | Bevart | Kodebestemt begrunnelse og neste handling; ingen kjøpsbeslutning. |
| FR-18 | Endret presentasjon | Investeringsoversikt først, kontrollert resultat separat; økonomi, teknisk og juridisk delgrunnlag skilles. |
| NFR-1–NFR-4 | Konkretisert | Lokal arkitektur, ressursvern, nøkkelfri demo, personvern og konfigurasjon; menneskelig S6 gjenstår. |
| NFR-5, S1–S6, K1–K3 | Mål bevart | S5-W1 er akseptert avvik, ikke bestått måling; nye planer er ikke resultater. |

## Kildepresedens og hvorfor omfanget endret seg

[Brief med addendum](../../briefs/brief-IBE160-2026-09-15/brief.md) og [revisjonskontrollen 8. oktober](../../briefs/brief-IBE160-2026-09-15/revisjonskontroll-2026-10-08.md) forklarer den opprinnelige innsnevringen: én investor, ett objekt, rapportkontroll og fire formler fremfor sju autonome produktagenter og full due diligence. Det ga rom for implementering, retting og kjørbar demo etter [brief-tilbakemeldingen](../../briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md). Godkjenninger og presiseringer er bevart i [.memlog](.memlog.md) og [beslutningsavstemming](beslutningsavstemming.md).

| Datert beslutning | Hvorfor / hva som ble gitt avkall på |
|---|---|
| [28. oktober: salgsoppgave først](../../sprint-change-proposal-2026-10-28.md), senere godkjent D1–D3 og [offline-leveranse](../../../implementation-artifacts/spec-salgsoppgave-offline-build.md) | Samle dokumentgrunnlag og redusere manuell innlegging. FINN-live utsettes; gamle stories og 30-sidersadapter beholdes som historisk/avgrenset kontrollflyt. |
| [29. oktober: lokal analyse først](../../salgsoppgave-code-first-design-2026-10-29.md) | Begrense kostnad, dataoverføring og usikker generell modellforståelse. Generell semantisk import er stengt; lokale treff er delgrunnlag, ikke full TG-dekning. |
| [30. oktober: Konsept A](../../ux-designs/ux-IBE160-2026-10-30/EXPERIENCE.md) og [lokal dokumentanalyse](../../../implementation-artifacts/spec-eiendomsrisiko-og-dokumentanalyse.md) | Gjøre økonomi, kilder og undersøkelsesbehov lettere tilgjengelig. Juridiske indikasjoner gir ingen kontroll av lovlighet. Valgfri lokal grafisk avlesning er plattformavhengig. |
| [4.–6. november: lokale leiereferanser](../../../implementation-artifacts/leieagent-lokale-referanser.md), [investeringsverktøy](../../../implementation-artifacts/spec-paa-investeringsverktoy.md), [forhåndsutfylt scenario](../../../implementation-artifacts/spec-forhandsutfylt-okonomiscenario.md) | Gjøre førstevurderingen praktisk med kapital, annuitet og justerbare antakelser. Dette utvider tidligere ikke-mål uttrykkelig; gruppestatistikk gir ikke individuell markedsleie, og scenario bekrefter ingen tall. |

Senere uttrykkelige produktbeslutninger gjelder foran eldre scope-formuleringer innen sitt område. Beslutningsdokumenter som inneholder opprinnelige «avventer»-avsnitt leses med sine daterte godkjennings-/gjennomføringstillegg. Implementasjonsbevis kan vise et avvik, men kan ikke alene omdefinere kvalitetsmål til bestått. [Leveranseavstemmingen](../../../process/leveranse-2026-11-06/produkt-og-sporbarhet.md) samler vedtak og grenser. Denne revisjonen gjør avstemmingen eksplisitt; den fremstilles ikke som opprinnelig planlegging.

[Sensorveiledningen](../../../reference/course/Sensorveiledning-IBE160-Del-1.pdf) s. 2–3 krever sammenheng plan–kode og begrunnede avvik; s. 6–7 advarer mot planleggingsdokumenter som beskriver en annen app. Alle faglærerkommentarer, også forslag som ikke følges ordrett, behandles i [oppfølgingsrapporten](oppfolging-prd-2026-11-19.md).

## Primærbruker, alternativer og avgrensning

Mads er privat investor med kjennskap til leie, drift, lån og avkastningskrav, uten å være bygningssakkyndig. Han har funnet objektet før PAA brukes. Briefen beskriver dagens arbeid som manuell lesing og sammenstilling i regneark, med generelle chatboter og rådgivere som alternativer. Brukerens anslag på 30–60 minutter er et anslag, ikke en målt referanse. PAA samler kilder, beregninger og mangler i samme kontrollflyt. Forbedret tidsbruk og forståelse er hypoteser; ingen konkurransefortrinn eller generell tidsbesparelse er dokumentert.

**Gjeldende leveranse:** lokal desktop-webapp, ett objekt per økt, salgsoppgave-PDF som hovedinngang og integrert eller separat rapport; lokale tekstregler, valgfri macOS OCR, kildebelagte kandidater, dokumenterte begrensninger, lokal datert leiereferanse og redigerbart økonomiscenario. Den bevarte kontrollflyten har tall-/funnbekreftelse, TG3-avklaring, fire kjerneberegninger og faste anbefalinger. Nøkkelfri offentlig demo bruker fiktive dokumenter og lagrede, håndskrevne demosvar; de er ikke tidligere modellresultater.

**Fortsatt utenfor:** automatisk sourcing/aktivert FINN-live, live markedsdata, individuell markedsleie eller prisprognose, rangering/score, DSCR, KI-estimerte reparasjonskostnader, skatt/verdiendring, full juridisk eller teknisk godkjenning, automatisk vedleggsutpakking, budsending, brukerkontoer, samarbeidende produktagenter og varig portefølje-/beslutningsarkiv. Kapital og annuitet er nå med som scenario; eldre forbud mot disse, salgsoppgave og all OCR gjelder ikke lenger hovedflyten.

## Begreper

| Begrep | Entydig betydning |
|---|---|
| P / L / D / J / Ymin | Totalpris inkl. eventuell fellesgjeld uten kjøpsomkostninger / årlig bruttoleie / årlig eierdrift uten renter og avdrag / årlige renter og avdrag inkl. eventuell fellesgjeld / brukerens minimumskrav til nettoyield i prosent. L/D/J gjelder samme objekt og år. |
| Dokumentgrunnlag | Originalfil med hash, fysiske PDF-sider og eksplisitt lesbarhets-/dekningsstatus. En akseptert fil er ikke automatisk en fullført rapportanalyse. |
| PDF-side | Fysisk posisjon i originalfilen, telt fra 1. Trykt sidetall kan vises i tillegg. |
| Rapportfunn | Eksplisitt TG2/TG3 med beskrivelse og kontrollerbar kilde. Kode/KI gjengir rapportens grad; appen setter ingen ny faglig grad. |
| Uttrekk / funnliste | Uttrekk er opprinnelig maskinelt resultat med metode/opphav. Funnliste er gjeldende liste med brukerens rettinger/avvisninger; aktive funn er ikke avvist. |
| Alvorlig TG3 / avklaringspliktig TG3 | I gjeldende screening behandles **hvert aktivt TG3-funn** som avklaringspliktig. Ingen egen ikke-alvorlig TG3-kategori eller automatisk vurdering av alvorlighet finnes. Dette presiserer den konservative implementasjonen av briefens avklaringsbehov, ikke en ny tilstandsfaglig definisjon. |
| TG3-avklaring | Brukerens separate status per funn: Avklart krever eksplisitt valg, begrunnelse og konkret grunnlag knyttet til gjeldende funn. Ukjent/ugyldig er Uavklart. Avklart betyr ikke utbedret. |
| Brukerbekreftet | Brukeren har kontrollert gjeldende tall eller funnliste. Import, KI-svar, scenario og listebekreftelse er ikke TG3-avklaring. |
| Kritisk grunnlag | Gyldige bekreftede P/L/D/J/Ymin, konsistente perioder, fullført kontrollerbar rapportanalyse, bekreftet funnliste og gyldig avklaring av alle aktive TG3. |
| Scenario / delberegning | Scenario bruker synlige brukerantakelser og eventuelt foreløpige dokument-/statistikkverdier. En delberegning har eget gyldig grunnlag. Ingen av dem er alene en kontrollert screening. |
| Dokumentfeil / analysefeil | Ustøttet/uleselig/manglende dokumentgrunnlag / avbrutt eller feilet analyse. Dekningshull kan også gi ufullstendig delutfall. Ingen av disse betyr «ingen avvik». |
| Anbefaling | Ett kodebestemt screeningutfall: Innhent mer informasjon, Forkast eller Gå videre. |

## UJ-1: Mads førstevurderer ett boligutleieobjekt

1. **Import og oversikt:** Mads laster opp salgsoppgaven og ser identitet, økonomiske kandidater, kilder og mangler. En separat rapport lastes opp ved behov. Dette kan skje før finansbekreftelse; den eldre rapportflyten beholder sin tallport.
2. **Økonomisk utforsking:** Han kontrollerer pris, kostnader og datert leiereferanse, justerer leie/drift og finansiering og ser foreløpige nøkkeltall og kapitalbehov. Standardene 80 % belåning, 6 % rente og 360 måneder merkes som antakelser, ikke dokumentfakta.
3. **Kontroll:** Han åpner originalkilder, retter eller avviser feil, bekrefter gyldige tall og funnliste og registrerer TG3-avklaring separat. Manglende teknisk dekning stopper komplett screening; en god scenarioøkonomi opphever ikke dette.
4. **Neste handling:** Ved tilstrekkelig grunnlag får han én anbefaling med regler og begrunnelse. Ellers ser han delgrunnlag og konkrete mangler. Gå videre betyr grundigere vurdering/befaring, ikke kjøp.

**Feilscene – manglende tall:** Blank leie gir ingen komplette leieavhengige nøkkeltall; Mads får vite hva som mangler. **Feilscene – rapport:** Ukjent gradering, ulest side, feilet analyse eller uavklart TG3 gir ingen bekreftet komplett rapport. Han må kontrollere/innhente informasjon; appen gjetter ikke.

## Funksjonelle krav

Kriteriene er normative og verifiserbare; oppnåelsesstatus må leses i kravstatusen og bevisene. Opprinnelig testfasit og overgangen mellom dokumentprofiler står i [addendum](addendum.md). UJ-1 steg 1–3 dekkes av FR-1–FR-15; steg 4 av FR-16–FR-18.

### FR-1: Registrere finansverdier for ett objekt

1. P/L/D/J/Ymin kan registreres manuelt med NOK/prosent og synlig periode/år. Månedsbeløp for L/D/J annualiseres med 12; P/Ymin annualiseres ikke.
2. PDF-felter er ubekreftede kandidater med kilde, periode og usikkerhet. Mangler forblir mangler; import er ikke samtykke til å bruke tallene i kontrollert screening.
3. Redigerbart scenario har synlige antakelser og standarder som kan endres. Det holdes separat fra bekreftede finansverdier.

### FR-2: Vise kilder, forutsetninger og kostnadsinnhold

1. Hver anvendt verdi har dokumentkilde eller merket brukerforutsetning. Forventet leie og datert lokal gruppereferanse fremstilles ikke som faktisk kontraktsleie eller individuell markedsleie.
2. Inkluderte kostnadsposter telles én gang. Felleskostnader 120 000 hvor 20 000 er gjeldsbetjening gir D-bidrag 100 000 og J-bidrag 20 000. Ukjent innhold og kildekonflikt vises.
3. Kjøpsomkostninger inngår i separat kapitalbehov, ikke i P for kjerne-yield. Dokumentert driftsdelsum merkes foreløpig når eierdrift ikke er komplett. Motstridende kritiske kilder krever avklaring før bekreftelse.

### FR-3: Validere tall og skille null fra manglende verdi

1. Kontrollert grunnlag krever P > 0 og L/D/J/Ymin ≥ 0; ikke-numerisk input er ugyldig. Feltfeil viser hva som må rettes.
2. Blank er aldri 0. Null krever eksplisitt bekreftelse, også J = 0 ved kontantkjøp.
3. Ugyldige/manglende verdier hindrer berørte beregninger; samlet anbefaling følger FR-16 prioritet 1.

### FR-4: Kontrollere og bekrefte tallgrunnlaget

1. Verdier, enheter, perioder, årsgrunnlag, kostnadsinnhold og opphav er tilgjengelige før eksplisitt bekreftelse.
2. Bekreftelse gjelder den kontrollerte revisjonen; endring krever ny bekreftelse.
3. Lokal import og scenario kan utføres før bekreftelse. Kontrollert screening krever gyldig bekreftet grunnlag etter FR-16. Den bevarte separate rapportflyten krever fortsatt tallbekreftelse før analysestart.

### FR-5: Registrere og anvende TG3-avklaring

1. Alle aktive TG3 er avklaringspliktige. Avklart krever eksplisitt status, ikke-tom begrunnelse og ikke-tomt konkret avklaringsgrunnlag; bare mellomrom er tomt.
2. Avklaringen bindes til gjeldende grad, beskrivelse, dokumentnavn, dokumenthash og PDF-side. Endret relevant funn kan ikke arve gammel gyldig avklaring.
3. Ukjent/manglende status, ugyldig Avklart eller ett gjenværende uavklart TG3 utløser FR-16 prioritet 1.
4. Funnet beholder TG3, kilde, status og brukerens tekster. Avklaring merkes brukerbekreftet for førstevurdering; appen verifiserer ikke ekstern dokumentasjon. Fagkontroll, selgeropplysning eller annen konkret dokumentasjon kan være grunnlag; elektrikereksemplet er ikke et obligatorisk beviskrav for alle funn.
5. Avvisning av feilaktige uttrekk etter FR-10 er ikke teknisk avklaring. Gyldig avklaring alene gir ikke Gå videre; øvrig grunnlag og økonomiske regler gjelder.

### FR-6: Importere støttet dokumentgrunnlag og styre analyse

1. Hovedimport aksepterer salgsoppgave og separat rapport som PDF med høyst **200 sider / 50 MiB per fil**, tekst høyst **128 KiB per side / 1 MiB samlet per fil**. Beholdte originalfiler i økten deler samtidig en **50 MiB** ramme. Overskridelse avvises, ikke stille avkortes. Innebygde vedlegg oppdages; rapportvedlegg må lastes opp separat.
2. Eldre separat rapportadapter beholder tekstbasert PDF ≤30 sider / 50 MiB. 30 godtas, 31 avvises der; denne grensen gjelder ikke hovedimporten.
3. Ny original krever nytt dokumentgrunnlag. Gammelt uttrekk, bekreftelse og TG3-avklaring blir ikke gjeldende for ny fil. Finans-/kontrollendringer utløser ikke nye modellkall.
4. Vanlig hovedimport er lokal og gjør **null språkmodellkall**. Generell semantisk transport er stengt. Eldre rapport-live gjør ett eksplisitt kall per ny rapport uten automatisk retry; valgfri økonomi-KI har egen port og ett kall per godkjent forberedelse.
5. Offentlig demo fungerer offline etter installasjon uten nøkkel og merker lagrede demosvar med korrekt opphav. Frister, budsjett og feilgrenser står samlet nedenfor.

### FR-7: Trekke ut eksplisitte TG2/TG3

1. Uttrekksoppgaven omfatter alle eksplisitte TG2/TG3 uten relevansfiltrering. Hvert dokumentert funn har grad, beskrivelse, dokument og fysisk PDF-side.
2. Kode/KI setter ingen ny faglig grad og gjetter ikke sidetall, konsekvenser eller reparasjonskostnader. Generelle graderingsforklaringer og egenerklæringens spørsmål blir ikke dokumenterte mangler.
3. S2 måler opprinnelig uttrekk før brukerretting, med riktig side. Lokal tekst-/grafikktolkning, lagret demo og historisk live evalueres separat. Delvis lokal dekning oppfyller ikke automatisk målet om alle funn.

### FR-8: Gjøre kilde og original tilgjengelig

1. Originaldokument og fysisk PDF-side kan åpnes under kontroll. Hash/dokumentidentitet følger kilden; sitat/tekstintervall og flere belegg bevares der uttrekksmetoden gir dette.
2. Dokumenterte funn, lokale tolkninger, usikre kandidater, demosvar og brukeropplysninger har synlig forskjellig opphav.
3. Manglende kilde, side utenfor filen og kjent kildekonflikt er usikkerhet etter FR-9. Kildebelegg alene beviser ikke at semantisk tolkning er riktig.

### FR-9: Vise feil, usikkerhet og ufullstendig dekning

1. Kjent usikkerhet knyttes til felt, funn, side eller rapportområde med konkret årsak. Ukjent årsak presenteres ikke som kjent.
2. Dokument-/analysefeil og ufullstendig dekning merkes tydelig; økonomi og teknisk/juridisk delutfall kan lykkes/feile separat. Skanning, ukjent format eller OCR gjør ikke automatisk rapporten komplett.
3. Feilet/ufullført analyse er aldri en vellykket tomliste. «Ingen TG2/TG3» krever faktisk fullført kontrollerbart rapportgrunnlag og brukerbekreftelse.
4. Kritiske usikkerheter følger FR-16 prioritet 1. Konfidensprosent, manuell listebekreftelse eller gode økonomitall opphever ikke dokumentfeil eller ukjent dekning.

### FR-10: Korrigere eller avvise funn med bevart opphav

1. I kontrollflyten kan brukeren rette grad, beskrivelse og PDF-side mot originalen, eller eksplisitt avvise feilaktige uttrekk. Dette er kontroll av uttrekk, ikke ny faglig klassifisering.
2. Opprinnelig maskinelt innhold og gjeldende brukerendring beholdes atskilt. Avviste funn er synlige i historikken og ikke aktive rapportfunn.
3. Uløst motstrid og korrigering uten kontrollerbar kilde er ikke dokumentert rapportfaktum. Endring krever ny listebekreftelse og relevant TG3-avklaring; ingen ny modellkjøring utløses.

### FR-11: Bekrefte gjeldende funnliste

1. Fullført uttrekk er ikke bekreftelse. Brukeren kontrollerer og eksplisitt bekrefter gjeldende liste med rettinger/avvisninger.
2. Endring gjør bekreftelsen utdatert. Ubekreftet liste eller ufullført rapportgrunnlag behandles etter FR-16 prioritet 1.
3. Listebekreftelse er separat fra TG3-avklaring og dokumentdekning. Alle tre må være tilstrekkelige før økonomiske regler kan gi konklusiv screening.

### FR-12: Beregne kjerneøkonomi og separat scenario

1. Kjerneformlene er bruttoyield = L/P, NOI = L−D, nettoyield = (L−D)/P og kontantstrøm før skatt = L−D−J. Yield vises ×100 prosent; NOI/kontantstrøm i NOK/år.
2. L/D/J må være konsistente årsverdier. Renter/avdrag føres i J, ikke også D. P inkluderer eventuell fellesgjeld og utelater kjøpsomkostninger. Ingen separat ledighets-/reparasjons-/skatte-/verdiendringspost legges til kjerneformlene.
3. Vanlig kode beregner; KI påvirker ikke formel eller terskel. Negative beregnede resultater beholdes. S1s toleranse er høyst 1 kr / 0,01 prosentpoeng, ikke en regelmargin.
4. Senere autorisert scenario beregner kapitalbehov, egenkapital/belåning og annuitet fra synlige antakelser etter [investeringsspecen](../../../implementation-artifacts/spec-paa-investeringsverktoy.md). Dette er separat fra kjerne-yield og brukerbekreftet screening.

### FR-13: Vise bare gyldige beregninger

1. Bruttoyield krever P/L, NOI L/D, nettoyield P/L/D og kontantstrøm L/D/J. Kontrollert beregning krever gyldig bekreftet grunnlag uten uløste konflikter.
2. Manglende L hindrer alle fire; manglende J hindrer kontantstrøm; manglende Ymin hindrer terskelscreening, ikke selve beregningene. P = 0 hindrer yield, ikke NOI med ellers gyldig grunnlag.
3. Uberegnelig verdi viser konkret årsak, aldri falsk null eller gammelt resultat. Scenario og foreløpig driftsdelsum merkes særskilt. Delberegninger opphever ikke FR-16 prioritet 1.

### FR-14: Bevare presisjon og etterprøvbarhet

1. Formel, anvendte verdier, kilde/antakelse, periode, faktor og årsgrunnlag er tilgjengelige. Ingen dobbelttelling skjules av annualisering.
2. Kjerneformlenes mellomregninger og screeningterskler avrundes ikke; avrunding av disse brukes bare i visning. Nettoyield = Ymin og kontantstrøm = 0 oppfyller økonomiske terskler; ett reelt underskudd gjør det ikke. Scenarioets annuitetsforslag følger en separat betalingsregel: månedsbeløp avrundes til øre før årsbeløp = månedsbeløp ×12. Dette endrer ikke uavrundet terskelvurdering.
3. Med P = 16 000 000, D = 400 000 og Ymin = 7 % oppfyller L = 1 520 000 yieldkravet; L = 1 519 999 gjør det ikke selv ved visning 7,00 %. Den avvikende anbefalingen forklares.
4. Scenario viser også beregningsgrunnlag og standardantakelser; det blir ikke dokumentfakta ved beregning.

### FR-15: Oppdatere uten å blande grunnlag

1. Endrede kontrollerte verdier krever ny bekreftelse og resultatberegning. Gammelt resultat er historisk/utdatert, ikke gyldig for nye revisjoner.
2. P/L/D/J oppdaterer avhengige nøkkeltall; bare Ymin endrer terskelvurderingen. Uendret rapport gjenbrukes uten nye modellkall.
3. Scenarioendring overskriver verken dokumentfakta, kontrollert tallgrunnlag eller screeningens snapshot. Samme regler gjelder i nøkkelfri demo.

### FR-16: Bestemme én anbefaling med fast prioritet

1. Vanlig kode bestemmer én anbefaling, alle utløsende forhold på avgjørende prioritet, begrunnelse og anbefalingsbundet neste handling. KI genererer/omskriver ingen av disse.
2. **Prioritet 1 – Innhent mer informasjon:** nødvendig kritisk grunnlag mangler, er ugyldig, motstridende eller ubekreftet; rapportanalyse/dekning er ufullstendig eller feilet; funnliste er ubekreftet; eller minst ett aktivt TG3 mangler gyldig avklaring etter FR-5. Alle kjente utløsere på dette nivået vises. Svak økonomi overstyrer ikke dette.
3. **Prioritet 2 – Forkast:** først ved tilstrekkelig kritisk grunnlag, dersom nettoyield < Ymin eller kontantstrøm < 0. Begge brudd vises hvis begge finnes.
4. **Prioritet 3 – Gå videre:** tilstrekkelig grunnlag, nettoyield ≥ Ymin og kontantstrøm ≥ 0. TG2 gir ikke automatisk Forkast; gyldig avklart TG3 består som funn.
5. Uavrundede verdier og faste regler brukes. Samme bekreftede input, uttrekk, kontroll-/avklaringsstatus og regelversjon gir identisk anbefaling, regelgrunnlag, begrunnelse og neste handling. Ny modellkjøring er ikke del av gjenskapingen.

### FR-17: Forklare anbefaling og neste handling

1. Resultatet viser avgjørende prioritet og alle utløsere der: konkrete mangler ved prioritet 1, yieldbrudd og/eller negativ kontantstrøm ved prioritet 2, begge oppfylte økonomikrav og tilstrekkelig teknisk grunnlag ved prioritet 3.
2. Brukeren ser hvilket felt/funn som må korrigeres, bekreftes eller undersøkes, og kan etterprøve tall mot terskel. Ukjent informasjon gjettes ikke.
3. Anbefaling er førstevurdering. Gå videre betyr grundigere undersøkelse, ikke teknisk/juridisk godkjenning, kjøpsanbefaling eller automatisk ekstern handling.

### FR-18: Presentere et sammenhengende beslutningsgrunnlag

1. Hovedflaten er investeringsoversikt med økonomi, scenario, tekniske/juridiske indikasjoner, kilder og synlige mangler. Den er tilgjengelig før komplett kontrollert screening. Juridiske indikasjoner beviser ikke lovlighet.
2. Kontrollert resultat viser én anbefaling med regelbegrunnelse, beregningsgrunnlag og alle aktive TG2/TG3 med kilde. Opprinnelig uttrekk, brukerendringer og TG3-avklaring er tilgjengelige hver for seg.
3. Dokumentfeil, dekningshull og ufullført kontroll forblir synlige. Tall, anbefaling og kontrollert resultat gjelder samme revisjon; scenario holdes separat.
4. Appen har ingen investeringsscore, dokumentert individuell markedsverdi eller lagret kjøpsbeslutning. Historisk firetrinnsflyt og dagens oversikt er ulike innganger til samme deterministiske kontrollkjerne.

## Tverrgående kvalitetskrav

### NFR-1: Stabilitet og regelkjøring

Identisk kontrollert grunnlag gir identiske tall/regler uten nettverk. Feil, gjentatte handlinger og sene svar skal ikke gi doble kostnader, omgått kontroll eller gamle resultater som gjeldende. Ressursgrenser og tidsfrister håndheves med avbrudd/opprydding. Tester av revisjoner, prosesslåser og feil dokumenterer avgrenset robusthet; ingen oppetidsavtale eller samlet maksimal minnekvote for Node + OCR hevdes.

### NFR-2: Forståelig desktop-flyt og tilgjengelighet

Synlige etiketter/enheter, konkrete feltfeil, tastaturbetjening med synlig fokus, lesbar kontrast og tekstlig status skal gjøre kontrollflyten forståelig. Meningsbærende bilder har tekstalternativ. Relevante desktop-størrelser og zoom kontrolleres. Automatiserte UI-/komponenttester og dokumenterte manuelle kontroller er tekniske bevis; uavhengig førstegangsforståelse undersøkes separat i [testprotokollen](../../../process/evaluering/testprotokoll-del1-2026-11-19.md). Ingen full WCAG-sertifisering hevdes.

### NFR-3: Lokal kjørbarhet og kostnadsfri demo

Etter dokumentert installasjon skal en annen person kunne følge [README](../../../../README.md), gjennomføre offentlig demo og kjøre testene uten private filer, nøkkel eller betalt konto. Demoen skal fungere uten nettverk etter installasjon. Lokal OCR er valgfri og macOS-avhengig; grunnflyten må ikke kreve OCR. Rene AI-assisterte kloner er teknisk bevis; menneskelig S6 er fortsatt åpen.

### NFR-4: Hemmeligheter, testdata og konfigurasjon

Nøkler leses kun i backend fra lokalt miljø, aldri fra frontend eller versjonerte eksempler. Fiktive data brukes offentlig; private originaler og persondata holdes utenfor Git. Kontroll av hemmeligheter omfatter også historikk. Hovedflyten bruker midlertidige data; ingen varig vurderingslagring loves. Valgfrie økonomihjelpere kan beholde forberedte data i serverminne og private resultat-/budsjettfiler; «ingenting lagres» er derfor ikke et gyldig generelt løfte. Gjeldende arkitektur-/sikkerhetsprinsipper er vurdert mot den andre produktreferansen i [teknologivurderingen](../../architecture/technology-principles-2026-11-19.md).

### NFR-5: Tidsbruk i førstevurderingen

S5s opprinnelige separate mål er median hovedanalyse ≤300 s og median menneskelig kontroll ≤600 s. Hovedanalyse måles fra Start analyse med gyldige bekreftede tall og opplastet støttet rapport til faktisk synlig ferdig funnliste. Kontroll går fra samme synlige liste til gjennomført kildekontroll, håndtert TG3-status og bekreftet gjeldende liste. Uavklart TG3 kan være korrekt håndtert uten å bli Avklart. Registrering/opplasting før start og videre investeringsarbeid inngår ikke.

Disse historiske grensene bevares med [TT-1–TT-9 og måleprotokollen](addendum.md). De er verken API-timeout eller end-to-end tidsbesparelse. Hovedinngangen er senere endret; ny sammenligning bruker egen forhåndsdefinert protokoll. S5-W1 avslutter det gamle målearbeidet med akseptert avvik, ikke bestått akseptanse.

## Analysefrister, kostnadsrammer og åpne porter

Tallene her er hentet fra vedtak og kode, ikke fra faglærerens illustrative forslag om 300 sekunder. Prisene er daterte prosjektgrunnlag, ikke verifiserte priser eller kontokvoter per 19. november.

| Analysevei | Frist / kostnad / gjeldende port |
|---|---|
| Vanlig lokal dokumentimport | **60 s** samlet lokal behandling. Null språkmodellkall. Lokal OCR gir ingen betalt KI. |
| Eldre separat rapport-live, [R1 23. oktober](../../r1-live-ki-semester-v1.md) | Lokal PDF-fase **60 s**, deretter én absolutt live-frist **120 s** fra leverandørforespørsel til terminalt validert utfall. OpenAI GPT-6.1 Sol, low/Standard, ingen fallback, SDK retry 0. Ett kall per ny rapport. |
| Generell semantisk salgsoppgaveanalyse, [vedtak 29. oktober](../../salgsoppgave-code-first-design-2026-10-29.md) | Designramme **USD 0,20 per logisk analyse**, delt med eventuell separat rapport; semantisk fase **120 s**. **Generell live-transport er deaktivert.** En nøkkel alene åpner den ikke. |
| Separat valgfri økonomi-KI, [gjeldende kompaktprøve](../../../implementation-artifacts/salgsoppgave-economy-trial-2026-10-30/compact-resultat.md) | Lokal forberedelse **60 s**, leverandørforespørsel **120 s** SDK-timeout/abortsignal; maksimalt 5 valgte sider / 12 000 tekstbytes; konservativt helt requestbudsjett **36 000 input / 6 000 output inkl. reasoning**. Lokal varig reservasjon **USD 0,15** innen USD 0,20, minst USD 0,05 margin. Inputbudsjettet er konservativt estimat, ikke eksakt tokenmåling. Ett Responses-kall, ingen automatisk retry/count-/reparasjonskall. Krever eksplisitt overførings-/kostnadssamtykke, nøkkel og ledig budsjett. |

[Implementeringsgrunnlaget](implementation-evidence-2026-11-19.md) viser konstanter og tester. Eldre rapport-live håndhever absolutt frist helt til terminalt validert adapterutfall og forkaster sent svar. Økonomihjelperens 120 s gjelder forespørselen; lokal JSON-/kildevalidering og journalføring etter svaret har ikke samme eksplisitte totale valideringsfrist. Ved timeout registreres feil/ufullført grunnlag, ikke vellykket tomliste. Timeout garanterer ikke at leverandøren stopper belastningen.

**Prosjektbudsjett:** R1 vedtok **USD 20 kumulativt** for prosjektets semester-live-testing, inklusive feil og ukjent belastning. R1s 30-siders arbeidsestimat var USD 0,16 ved 30 000 input / 10 000 output; konservativt 100 000 / 128 000 ga USD 1,48 med daværende satser. Det er estimater, ingen fastpris per 30 sider. USD 0,20/0,15 er senere, snevrere analyserammer; ingen av dem nullstiller prosjektforbruk eller gir ny tillatelse.

**Åpent før eventuell senere betalt kjøring:** Mads må avstemme faktisk konto/pris/kapasitet, historisk forbruk og ukjent reservasjon i PAA-AI-20261031-1, kontrollere rest innen prosjekt- og analyseramme og gi uttrykkelig tillatelse. Frist er **før ethvert nytt betalt forsøk**; uten avstemming forblir porten stengt. Demo-modus er ikke en global sperre for alle valgfrie økonomiruter. Denne revisjonen autoriserer og utfører ingen betalte kall.

## Suksesskriterier og testutvalg

S1–S6 er bevarte prosjektmål; terskler er ikke senket for å passe eksisterende resultater.

| Mål | Akseptanse | Hva bevisene støtter / begrenser |
|---|---|---|
| S1 Beregninger | Alle beregnbare fasitverdier: ≤1 kr / ≤0,01 prosentpoeng. Terskler testes eksakt separat. | F1–F4, grense-/kostnads- og scenariofasit tester kode; beviser ikke fullstendige forutsetninger i vilkårlig PDF. |
| S2 Dokumentfunn | Alle fasit-TG3 og minst 90 % TG2 med korrekt fysisk side; null oppdiktede funn. | Historiske kontrollerte livebevis gjelder den gamle adapteren. Lagret demo og lokale deltreff beviser ikke generell modellkvalitet eller komplett dokumentanalyse. |
| S3 Regler/mangler | Alle definerte regelvarianter gir fasit, inklusive blank/null, konflikt, feil, TG3 og likhet. | Deterministiske tester; ufullstendig dokument blir ikke komplett av få treff. |
| S4 Sporbarhet | Dokument/side og verdiopphav kan kontrolleres, endringer skilles og kostnader telles én gang. | Kildekontrakter og originalvisning prøves; kilde alene beviser ikke korrekt tolkning. |
| S5 Tidsbruk | Median hovedanalyse ≤300 s og kontroll ≤600 s med faktiske synlige hendelser; feil/ufullførte rapporteres. | Ett historisk forsøk med mangelfull manuell referanse, [S5-W1](../../../implementation-artifacts/story-4-5-s5-waiver-2026-10-27.md). Ingen validert tidsbesparelse. |
| S6 Kjørbarhet | Annen person følger README, fullfører demo og kjører lokale tester uten private filer/nøkler. | [Ren klon](../../../process/leveranse-2026-11-06/ren-klon.md) er AI-assistert teknisk bevis; annen-person-prøven er ikke utført. |

### Finansutvalg F1–F4

Beløp i NOK per år unntatt P; Ymin = 7 %. Teknisk grunnlag er fullført/kontrollert i F1–F3; F4 har uavklart TG3 på PDF-side 4. Rapportfeil testes separat og overstyrer økonomi.

| Case | P | L | D | J | Forventet fasit |
|---|---:|---:|---:|---:|---|
| F1 komplett | 16 000 000 | 1 900 000 | 400 000 | 800 000 | Brutto 11,875 %, NOI 1 500 000, netto 9,375 %, kontantstrøm 700 000; Gå videre. |
| F2 svak økonomi | 16 000 000 | 1 400 000 | 400 000 | 800 000 | Brutto 8,75 %, NOI 1 000 000, netto 6,25 %, kontantstrøm 200 000; Forkast. |
| F3 manglende leie | 16 000 000 | mangler | 400 000 | 800 000 | Ingen leieavhengige nøkkeltall; Innhent mer informasjon. |
| F4 TG3 | 16 000 000 | 1 900 000 | 400 000 | 800 000 | Tall som F1; Innhent mer informasjon. Gyldig TG3-avklaring og ellers komplett grunnlag gir Gå videre. |

Verdiene kommer fra [brief-addendum](../../briefs/brief-IBE160-2026-09-15/addendum.md#minst-fire-kontrollerte-testcaser) og [versjonert fasit](../../../../tests/fixtures/property-cases/expected.json). F1–F4 er finans-/regelvarianter; de er ikke fire uavhengige, representative rapporter.

### Dokumentutvalg og måleregler

Et **foreslått, ikke utført** utvidet lokalt dokumentutvalg skal ha minst tre ulike rapporter med samlet minst ti eksplisitte TG2 og to TG3, samt separate feilcaser for manglende rapport, uleselig/uklar grad og tomliste. Dette operasjonaliserer faglærerens forslag og RT-16s eksempel; det er en ny evalueringsplan, ikke et gammelt vedtak eller allerede oppfylt representativitetskrav. Velg tekstbasert, integrert og grafisk rapport med ulikt oppsett; manglende støtte rapporteres som begrensning, ikke fjernet fra utvalget. Offentlig materiale er fiktivt/anonymisert og rettighetsavklart.

Frys revisjon, filhash, metode, utvalg og manuelt uavhengig fasit **før** uttrekk. Fasit omfatter alle eksplisitte funn, uten relevansfiltrering. Match én-til-én på forhold, grad og fysisk side; duplikater gir ikke ekstra treff. Rapporter per rapport og samlet antall fasitfunn, riktige, oversette, feil side og oppdiktede, med TG2/TG3 separat. TG2-dekning = riktige / alle fasit-TG2; TG3 = 100 %. Minst 90 % betyr minst ceil(0,9 × N), ikke avrunding opp fra lavere prosent. Null fasit i en grad gir «ikke vurderbar», ikke 100 %. Ti TG2 tillater ett bortfall, to TG3 ingen; et så lite utvalg beviser ikke generell treffsikkerhet.

Opprinnelig uttrekk måles før retting. Historisk live, lokal tekst, lokal OCR og lagrede demosvar rapporteres separat; ingen nye liveforsøk inngår i planen. [Testprotokollen](../../../process/evaluering/testprotokoll-del1-2026-11-19.md) beskriver uavhengige deltakere, balansert manuell/PAA-sammenligning, tidsgrenser, kvalitet, råskjema og begrensninger. Utvalgsstørrelser der er planvalg, ikke gjennomførte tester eller sensorpålagte tall. Gammel S5 er fortsatt avsluttet; forberedelsen starter den ikke igjen.

### Kontrollmål og prosessbevis

- **K1:** Tidsgevinst godtas ikke ved oversette TG3, skjulte mangler eller droppet kildekontroll/bekreftelse. S1–S4 vurderes samtidig.
- **K2:** Flere uttrekk er ikke bedre i seg selv; feil side, duplikater og oppdiktede registreres. S2 tillater ingen oppdiktede funn.
- **K3:** Andel Gå videre er ikke suksessmål. Alle tre utfall må følge fasit og prioritetsreglene.

[PRD-addendum](addendum.md) bevarer historiske test-ID-er; dagens testfiler og prosessbevis knyttes via kravstatusen. Målgruppe/finansformler og menneskelige avklaringer har kilde i brief/promptlogger. KI-formulerte testpresiseringer er ikke i seg selv uavhengig fasit; [oppfølgingsrapporten](oppfolging-prd-2026-11-19.md) beskriver opphav og kritisk kontroll. Alle gjenstående forbedringer følges bare i [deferred-work](../../../implementation-artifacts/deferred-work.md). Denne PRD-en lukker ingen historisk åpen post.
