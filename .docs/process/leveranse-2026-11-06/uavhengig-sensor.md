# Uavhengig sensorgjennomgang av PAA

Dato: 2026-11-06. Referanse: `639291814886a6058a24adf95c69e8633b645944`.
Utført av subagenten `uavhengig_sensor`, separat fra implementeringsoppgavene.
Dette er en KI-basert faglig stikkprøve, ikke ekstern sensor, menneskelig brukertest eller studentens refleksjonsrapport.
Gjennomgangen bygger på kilde-/dokumentlesing og kode-/testinspeksjon; denne agenten har ikke gjennomført de andre agentenes testkjøringer.

## Vurderingsgrunnlag

[Sensorveiledningen](../../reference/course/Sensorveiledning-IBE160-Del-1.pdf), alle sju sider, er lest gjennom tekstuttrekk fra originalen.
Den gjelder **IBE160 del 1**, som teller 70 % av emnekarakteren. Brukerens betegnelse «bachelorleveranse» gir ikke grunnlag for å anvende andre bachelor- eller oppgavekrav.
Vurderingen bruker også [faglærerens briefvurdering](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md),
[brief og addendum](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/brief.md),
[PRD](../../planning-artifacts/prds/prd-IBE160-2026-10-10/prd.md) med addendum,
[arkitektur](../../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md),
[opprinnelig kravspor](../../specs/spec-IBE160/sporbarhet.md),
[5.5-leveringskontroll](../../implementation-artifacts/story-5-5-leveringskontroll-2026-10-27.md),
[nyeste økonomiøkt](../arbeidsokter/2026-11-06-okonomistandarder.md),
[investeringsverktøyets QA](../arbeidsokter/2026-11-05-investeringsverktoy-uavhengig-qa.md),
[README](../../../README.md), promptloggenes mekanisme og git-historikken.
Sentrale stikkprøver er finans/finansiering, appens to arbeidsflater, importkonfigurasjon, økonomiruten og offentlige/private E2E-prøver.

## Hvert kriterium ved referansecommit

Karakterkolonnen er et forsiktig, foreløpig skjønn over det undersøkte grunnlaget. Den er ikke en ny akseptanse av alle stories.

| Kriterium | Vekt | Foreløpig | Begrunnelse og grense |
| --- | ---: | --- | --- |
| 1. Prosess og KI-styring | 30 % | B | Reell utviklingskjede fra første brief 15. september, faglærerfeedback 6. oktober og revidert brief til PRD, UX, arkitektur, stories, mange avgrensede rettinger og promptlogger. Menneskelig avgrensning og kritisk korreksjon finnes. Bevismengden er stor, men sensor må selv sammenstille hva som gjelder etter utvidelsene 28. oktober–6. november. Nye toppbannere og gammel låst v1 peker delvis i forskjellige retninger. |
| 2. Funksjonalitet og omfang | 20 % | B | Ikke-trivielle kodeberegninger, kontrollporter, originalkilder, gjentatt import og økonomiscenario gir rimelig kompleksitet uten behov for flere funksjoner. Generisk dokumentforståelse er begrenset. Komplett teknisk kontroll av vilkårlige PDF-er er ikke levert, og dagens bredere investeringsoversikt må skilles fra den gamle kontrollerte demoflyten. Dokumentert begrunnelse for avvik er viktigere enn mer funksjonalitet. |
| 3. Kvalitetssikring og testing | 15 % | B | Uavhengig forhåndsfasit, eksakte økonomigrenser, faktiske PDF-fixtures, HTTP-/tilstands-/UI-prøver og konkrete rød–grønn-feilkjeder er vesentlige styrker. Historiske testantall er versjonsbundne. Ekte PDF-prøver bruker private originaler og kan ikke gjentas fra Git alene. Fersk full regresjon og offentlig demonstrasjon må vurderes separat. S2 er bare et lite historisk live-utvalg; S5 er ikke formelt bestått, S6 ikke gjennomført av annen person. |
| 4. Design og brukeropplevelse | 10 % | B | Egne UX-dokumenter og bevis for iterasjon finnes. Ny QA beskriver mobil, tastatur, originalside, usikkerhet og konkrete feilrettinger. Det er ingen grunn til å kreve full mobilapp eller formell WCAG-sertifisering. Denne dokument-/kodegjennomgangen alene beviser ikke at dagens komplette flyt er intuitiv for en førstegangsbruker. |
| 5. Kodekvalitet og arkitektur | 10 % | B | Faktisk skille mellom contracts, domain, backend, frontend og presentation; finans og screening er kode, ikke modelltekst. Eksakt desimalaritmetikk og separate gyldighetsgrenser er gjennomtenkt. Bevarte FINN-/live-/preflight-veier og en stadig større importdel øker lesekostnad. Det bør forklares hva som er aktivt fremfor å gjøre risikofylt opprydding nå. |
| 6. README og kjørbarhet | 10 % | C | Eksakte kommandoer, versjoner og syntetiske data finnes. Innledningen er en lang kronologi; dagens lokale produkt, historisk live og avanserte private prøver blandes. F1–F4 starter i Tallgrunnlag uten å si hvordan sensor åpner flaten. Utdaterte påstander om KI og lagring kan føre til feil forventninger. Ren klon av gjeldende versjon er ikke prøvd av denne agenten. |
| 7. Ryddighet i repoet | 5 % | C | Kode, dokumentasjon, testdata og private filer har tydelige hovedgrenser, og gitignore dekker byggeutdata/hemmeligheter. Omfattende historisk dokumentasjon og en sentral ledger på nær 900 linjer gjør status vanskelig å finne. Historiske sikkerhetsskann er nyttige, men de beviser ikke alene hele dagens historie. Bevar historien og gi sensor en kort, oppdatert inngang. |

Vektet skår for denne foreløpige vurderingen: `0,30×4 + 0,20×4 + 0,15×4 + 0,10×4 + 0,10×4 + 0,10×3 + 0,05×3 = 3,85`, altså **B for del 1** etter veiledningens terskler.
Dette er ikke en total emnekarakter eller en garantert karakter. Del 2/refleksjonsrapport og den faktiske innleveringsrevisjonen er ikke vurdert.

## Konkrete avvik som bør integreres i leveransekontrollen

Dette er gjennomgangsbevis. Eventuell videre oppfølging hører bare hjemme i [sentral deferred-work](../../implementation-artifacts/deferred-work.md).

1. **Gjeldende scope mangler en samlet avstemming.** PRD og brief har et toppbanner om at D1–D3 avventer avklaring før produktimplementering. Samtidig finnes ferdig implementert PDF-import, OCR, lokal risiko, leiereferanser, kapitalbehov og annuitet. Briefens nyere finansbanner forklarer ett av avvikene, men ikke hele kjeden. En kort gjeldende leveranseavstemming må peke til de faktiske bestillingene og begrunne hvilke opprinnelige avgrensninger som er endret. Gamle krav og historier skal dateres, ikke omskrives som om de alltid beskrev dagens app.
2. **Semantisk KI må beskrives presist.** `import-route.ts` oppgir `liveEnabled:false`, og generisk semantisk import er sperret. Dette betyr ikke at alle betalte kodeveier er fjernet: serveren monterer økonomiruten uavhengig av `ANALYSIS_MODE`; `economy-route.ts` kan bruke lokal API-nøkkel og uttrykkelig kostnads-/overføringssamtykke. Den eldre separate rapportveien har også live-modus. Standardoppskriften uten nøkkel er lokal. Generell påstand om at «all KI er deaktivert» er feil. Lokal OCR er heller ikke en aktivert språkmodell.
3. **Lagringspåstander trenger avgrensning.** README sier at backend ikke beholder originaler eller tekst mellom requests. Den vanlige dokumentimporten er requestbundet, men `economy-route.ts` beholder forberedte pakker og outcome i prosessminne i opptil 15 minutter; godkjent økonomi-KI har private resultat-/budsjettfiler. Beskriv standard lokal import og historiske/valgfrie hjelpere hver for seg.
4. **Offentlig demonstrasjon må stå først.** De fiktive F1–F4- og salgsoppgavefilene er allerede i Git og trenger ingen publisering av private dokumenter. Forklar hvordan de åpnes fra dagens oversikt, demonstrer kilder og økonomi og gi forventet utfall. Verktøyet `real-prototype.mjs` er en privat tilleggsprøve, ikke sensors startoppskrift.
5. **Bevisstyrken må følge påstanden.** `investment-tool-real.spec.ts` skipper uten private originaler med mindre et særskilt krav settes. `investment-overview.spec.ts` gir offentlige prøver av lokal import/scenario/kontrollporter. Rapporter antall bestått/skip, hvilke prøver som brukte stubb og hva som faktisk ble sett. Mange grønne prøver beviser ikke generell semantisk presisjon, lovlig utleie eller full dokumentdekning.
6. **Menneskelig kontroll må være faktisk.** Promptlogger viser brukerbeslutninger; utførte agentprøver viser maskinell kontroll. De er ikke i seg selv bevis for at Mads leste alle PDF-sider eller at en annen person fullførte README. Bevar S5-W1 og åpen S6 fremfor å produsere slike bevis i ettertid.

## Hva som skiller fra en svært god besvarelse

En svært god leveranse gjør den allerede sterke prosessen lett å kontrollere: noen få konkrete kjeder fra menneskelig prompt via beslutning/avvisning til diff, commit og prøvd resultat. Den gir ett tydelig kart fra dagens scope til implementasjon og test, en reproduserbar kostnadsfri demo fra ren klon og en ærlig status over hva som ikke er bevist. Det krever dokumentasjonsarbeid og fersk verifikasjon, ikke flere produktfunksjoner.

En ekstern førstegangsbruker ville styrke S6 og UX-bevisene. Den kan ikke erstattes av agentens egen klon. S5 er avsluttet med akseptert avvik og skal ikke startes på nytt som en skjult ny oppgave. Selv ved god teknisk kontroll bør A ikke hevdes ut fra testantall alene; generell PDF-/OCR-kvalitet, brukerforståelse og refleksjonsdelen er ikke etablert av denne gjennomgangen.

## Ny kontroll etter forbedringene

### Datert sluttvurdering 2026-11-06

Baselinevurderingen ovenfor gjelder referansecommiten og beholdes. Denne nye vurderingen gjelder dokumentasjons-/testdiffen etter integrasjon, med uendret produktkode og økonomisk fasit. Det er en videreføring av samme sensoragents kildebaserte kontroll, ikke en kontekstfri blind gjennomgang. Lokal sluttcommit og oppstart i en ny klon av akkurat den commiten gjenstår på vurderingstidspunktet; hovedagenten dokumenterer utfallet separat.

Jeg har lest den faktiske sluttdiffen, README, demonstrasjonsoppskriften, scope-/arkitektur-/kravmatrisen, prosessguiden, agentoppdragene og rapporten. De opprinnelige funnene er behandlet med daterte presiseringer og bevarte kilder. De syntetiske [desktopbildene](oversikt-desktop.png) og [mobiløkonomien](okonomi-mobil.png) er sett visuelt: konsistent uttrykk, lesbar oppdeling, tydelige forutsetninger og ingen observert avklipping i disse bildene. Dette er bildeinspeksjon, ikke egen gjennomføring av brukerreisen.

To nye funn fra min sluttdiffkontroll er rettet og kontrollert mot kildekoden: 15 minutter er økonomipakkens **gyldighet**, ikke automatisk sletting fra serverminnet; og rapporten viser nå til «Vurderingene», ikke karakterbokstaver som mangler i tabellen. Den tidligere formuleringen «opptil 15 minutter» i punkt 3 ovenfor var også upresis og skal leses med denne rettelsen. README og gjeldende arkitekturbeskrivelse forklarer nå retensjonen korrekt. Jeg har også kontrollert de tre andre dokumentrettingene: backendens README-anker, eksplisitt nytt eierskap til E2E-testrettingen og fire tidsfristfeil i sandboxreferatet.

[Den fullstendige rene E2E-loggen](ren-klon-e2e-godkjent.txt) viser **233 bestått, 12 skip** og deretter **3/3 dev-tester bestått**. Jeg har kontrollert de faktiske sammendragene og testsporene, ikke bare sluttrapportens påstand. De to tidligere feilene er bevart og den ene årsakstekstassertens endring er begrunnet i to eksisterende lovlige fallbackgrener; dokumenthash, kildebinding, sperret teknisk status og kostnadskrav er beholdt. [Demoresultatet](demo-resultat.json) oppgir seks kontrollpunkter, null eksterne browserforespørsler og null sidefeil. Nettgrensen er uttrykkelig browserbasert, ikke et bevist OS-nettforbud. [Teknisk rapport](teknisk-og-test.md) og rålogger underbygger 2 238 unit-/integrasjonsprøver med sju ordinære OCR-skip, 50 komponentprøver og separat sju native OCR-prøver. Den senere [unit-kjøringen i ren klon](ren-klon-unit-integrasjon.txt) er også kontrollert: **2 237 bestått, 8 skip**, 110 filer bestått og to filer skip, 82,62 s. Forskjellen fra hovedrepoets 2 238 er én privat-original-betinget prøve; ingen testfeil skjules som skip. [Integritetskontrollen](product-integrity.json) har identisk digest for 173 runtimekildefiler ved baseline og arbeidsinnholdet; package-/lockfil og `.nvmrc` er uendret.

| Sensorkriterium | Vekt | Ny foreløpig karakter | Begrunnelse |
| --- | ---: | --- | --- |
| Prosess og KI-styring | 30 % | **B** | Konkret menneskelig styring, avviste modellresultater, beslutnings-/commit-/testkjeder og tre dokumenterte agentansvar er nå lette å finne. Loggernes grenser og forskjellen mellom menneske og agent er tydelige. Omfattende sen scopeutvikling krever fortsatt at flere historiske underlag leses sammen; ny dokumentasjon er en leseguide, ikke nye samtidige menneskebevis. |
| Funksjonalitet og omfang | 20 % | **B** | Relevant og betydelig funksjonelt omfang, med sporbar økonomi, originalkontroll og tre prioriterte anbefalinger demonstrert i offentlige prøver. Endringer fra smal v1 er forklart. Generell semantisk dokumentforståelse og komplett analyse av vilkårlige rapporter er fortsatt ikke levert eller bevist. |
| Kvalitetssikring og testing | 15 % | **B** | Ferske relevante tester, uavhengige regnefasiter, feilbevarende rød–grønn-dokumentasjon og faktisk ren-klon-funn gir sterkt bevis. Den offentlige demonstrasjonen er reproduserbar uten private dokumenter. Begrenset dokumentutvalg, private tilleggsprøver og ufullført S5/S6 gir grunn til et konservativt skjønn; testantall er ikke generell kvalitetsdekning. |
| Design og brukeropplevelse | 10 % | **B** | Konsistent Konsept A, behovsåpnede kilder/kontroller, eksplisitte mangler og faktisk prøvd fokus/tastatur/responsivitet. Nye syntetiske bilder støtter at dagens flater er gjennomarbeidet. Ingen ny ekstern førstegangsbruker eller bred hjelpemiddeltest er observert. |
| Kodekvalitet og arkitektur | 10 % | **B** | Lagdeling, desimalregning, autoritative kontrollregler og separate scenario-/resultatrevisjoner er tydelige. Gjeldende arkitektur dokumenterer nå lokale hjelpere og bevarte gamle veier. Importkompleksitet og historiske adaptere gir fortsatt vedlikeholdskostnad; ingen udokumentert sluttrefaktorering er gjort. |
| README og kjørbarhet | 10 % | **B** | Ny README gir eksakte kommandoer, offentlig fiktiv prøve, riktig navigasjon/år og kontrollerbar tallfasit. Ren installasjon, build, demo og full E2E er dokumentert uten prosjektets private miljø. Dette styrker vurderingen fra C. Prøven deler vertens macOS; andre OS og faktisk annen-person-S6 er ikke verifisert. |
| Ryddighet i repoet | 5 % | **B** | Oppdatert lesestart, gyldige interne filmål, én sentral utsattoversikt, bevarte originalbevis og presis status gjør materialet enklere å etterprøve. Audit viser tre kjente fiktive nøkkelmønstertreff blant 3 308 historiske blobs og 209 uendrede frosne bevisfiler. Dette styrker vurderingen fra C. Dokumentmengden og mønsterskannens begrensninger består. |

Ny vektet skår: `0,30×4 + 0,20×4 + 0,15×4 + 0,10×4 + 0,10×4 + 0,10×4 + 0,05×4 = 4,00`, altså **foreløpig B for del 1**. Sensorveiledningen beskriver A–B samlet i nivåkjennetegnene; denne agentgjennomgangen gir ikke grunnlag for å opphøye alle styrkene til A. Forbedringen fra 3,85 gjelder særlig kjørbarhet og etterprøvbarhet, ikke et endret produkt eller ny generell KI-kvalitet.

Jeg finner ingen gjenstående blokkende feil i den gjennomgåtte dokumentasjons-/testdiffen etter rettingene. S5-W1, manglende faktisk annen-person-S6, generell dokument-/TG-dekning, individuell leiekalibrering og plattformgrenser beholdes. Ingen ekstra funksjonsutvikling er nødvendig for å gjøre denne vurderingen mer redelig. Karakteren er et begrunnet skjønn over det tilgjengelige del-1-grunnlaget, ikke sensur, total emne-/bachelorkarakter eller en garanti. Sluttcommitens faktiske innhold og oppstart må fortsatt kontrolleres av hovedagenten.
