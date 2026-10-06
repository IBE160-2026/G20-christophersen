# Tilbakemelding på product brief

| | |
|---|---|
| **Gruppe** | G20 – G20-christophersen |
| **Product brief** | `.docs/planning-artifacts/briefs/brief-IBE160-2026-09-15/brief.md` (commit `3ac6267`) |
| **Tilbakemelding fra** | Faglærer i IBE160 (utarbeidet med KI-støtte) |
| **Dato** | 2026-10-06 |

## Samlet vurdering

- **Bør revideres før dere går videre.** Rett punktene markert «Endre» før dere lager PRD og arkitektur.

Vi har vurdert `brief.md` for «Property Acquisition Agent» sammen med `addendum.md` i samme mappe.

**Det som er bra:**

1. Beslutningen systemet skal støtte, er svært tydelig: tre begrunnede anbefalinger (forkast, innhent mer informasjon, gå videre), og et menneskelig godkjenningssteg (Approve next step / Review manually / Reject deal) uten automatisk budgivning. Det er god og ansvarlig KI-design.
2. Kravene til troverdighet er gjennomtenkte. Kildehenvisning til dokument og sidetall, tydelig skille mellom fakta, estimater og antakelser, «heller eksplisitt usikker enn falskt presis» og listen over alvorlige feilbilder (oppdiktede tall, dobbelttelling, estimater som fakta) er et godt grunnlag for kvalitetssikring.

**De viktigste endringene:**

1. Omfanget i MVP er for stort for et semester. Det omfatter flere samarbeidende KI-agenter, lesing av 30 siders tilstandsrapporter, TG2/TG3-analyse med kostnadsestimater, yield, kontantstrøm, DSCR, stresstesting, risikovurdering på fire områder og en investeringsscore. Velg en mye smalere kjerne for v1.
2. Mange sentrale ting er fortsatt uavklart: scoremodell, nøkkeltalldefinisjoner, formler, hva som er «kritisk informasjon», og akseptansekriterier. Briefen sier selv at «målbare akseptansekriterier gjenstår». Fastsett definisjoner og formler for det som skal være med i v1 før dere lager PRD.
3. Briefen omtaler prosjektet som en del av «Agent Programming», og den bygger på en konseptvideo som ikke er gjennomgått. Rett emnekonteksten til IBE160, og beskriv utseende og flyt med egne skisser i stedet for en video som ikke ligger i repoet.

## Vanskelighetsgrad og gjennomførbarhet

### Vurdert vanskelighetsgrad

- **Vanskelig**

**Sammenlignbart med:** 5) KI-styrt sensurering av eksamensoppgaver (vanskelig). Begge forslagene lar KI lese lange dokumenter og gi en begrunnet anbefaling med strenge krav til korrekthet. Finansberegningene minner i tillegg om domenelogikken i 4) KI-støttet MRP II.

**Begrunnelse:**

| Faktor | Nivå (lav / middels / høy) | Kommentar |
|---|---|---|
| Domenelogikk – hvor mange og hvor kompliserte regler og beregninger må stemme? | høy | Brutto- og nettoyield, kontantstrøm, gjeldsbetjening, DSCR, egenkapitalbehov, stresstesting og score. Alt må være faglig riktig, og ingenting kan telles dobbelt. |
| Datamodell – antall entiteter og relasjoner mellom dem | middels | Objekt, dokumenter, funn med kildehenvisning, forutsetninger, beregninger, anbefaling og godkjenning. Det er overkommelig, men hvert funn må spores. |
| Brukere, roller og innlogging | lav | Én bruker (investoren). Innlogging er ikke nevnt. |
| KI-funksjonalitet i appen, f.eks. kall til språkmodell, prompts i koden og håndtering av usikre svar | høy | Opptil sju spesialiserte agenter, uttrekk med sidehenvisning, usikkerhetsnivå og eksplisitt håndtering av manglende og motstridende opplysninger. |
| Integrasjoner og eksterne tjenester, f.eks. API-er, betaling og e-post | middels | Språkmodell-API. Å lime inn en annonselenke kan innebære skraping av Finn.no, som er ustabilt og bør unngås. |
| Sanntid, samtidighet eller flere brukere som påvirker hverandre | lav | Ingen samtidighet. En synlig pipeline med status per steg krever likevel noe asynkron håndtering. |
| Filhåndtering, f.eks. opplasting, PDF-lesing og eksport | høy | Salgsoppgaver og tilstandsrapporter er lange PDF-er med tabeller. Pålitelig uttrekk med sidetall er krevende. |
| Sikkerhet og personvern | middels | Økonomiske opplysninger og dokumenter om reelle eiendommer. Ekte salgsoppgaver bør ikke ligge i et offentlig repo uten vurdering. |

**Hva vanskelighetsgraden betyr for dere:**

- _Vanskelig:_ Et vanskelig prosjekt gir større mulighet for toppkarakter, men også større risiko. Definer en minimal versjon som sikkert kan bli ferdig, og legg resten i tydelige trinn etterpå.

### Gjennomførbarhet med BMAD og Claude Code

Dere skal planlegge med BMAD (product brief → PRD → arkitektur → epics og stories) og implementere med Claude Code. Vurderingen under tar hensyn til at det må være tid til hele denne flyten, og til testing, retting og README til slutt.

| Spørsmål | Vurdering (OK / risiko / stor risiko) | Kommentar |
|---|---|---|
| **Tid og omfang** – kan v1 realistisk bli ferdig og stabil i løpet av semesteret, med tid til flere iterasjoner? | stor risiko | Sju pipeline-steg med hver sin analyse er for mye for v1, særlig når repoet foreløpig bare inneholder briefen. |
| **BMAD-flyten** – er briefen konkret nok til at PRD, arkitektur og stories kan lages uten store hull, og blir det overkommelig mange stories? | risiko | Problemet og beslutningen er konkrete, men scoremodell, formler, kritiske felt og akseptansekriterier er utsatt. Da får PRD-en store hull. |
| **Egnet for Claude Code** – bruker løsningen en vanlig, godt dokumentert teknologistakk som Claude Code håndterer godt, eller krever den nisjeteknologi, spesialmaskinvare eller mye manuell konfigurasjon? | risiko | En webapp med LLM-kall er greit. Agentrammeverk for flere agenter og PDF-uttrekk med sidetall er mer krevende å få stabilt. |
| **Kontroll på KI-ens arbeid** – kan gruppen selv avgjøre om koden gjør det riktige? Krever domenet kunnskap gruppen ikke har, f.eks. avanserte beregninger eller fagregler, så er det vanskelig å kvalitetssikre. | risiko | Det er en styrke at dere selv er investor og har domenekunnskap. Finansberegningene må likevel legges i vanlig kode med kjente fasitsvar, ikke overlates til språkmodellen. |
| **Testbarhet** – finnes det tydelige regler og forventede resultater som tester kan skrives mot? | risiko | Beregningene er godt egnet for enhetstester når formlene er fastsatt. Uttrekk og anbefalinger fra KI kan bare evalueres mot de 3–5 casene, og det må planlegges som en egen testmetode. |
| **Kjørbar for sensor** – kan appen kjøres lokalt etter README, uten gruppens nøkler, betalte kontoer eller egen infrastruktur? | risiko | Ikke omtalt. Sensor trenger enten egen nøkkel eller en demomodus med lagrede analyseresultater for et testobjekt. |
| **Avhengigheter og kostnader** – krever løsningen betalte API-er, f.eks. språkmodeller, og finnes det en plan for kostnad, testmodus eller mock-data? | risiko | Flere agenter som leser lange PDF-er gir mange og dyre kall. Lag en plan for kostnad, hurtigbuffer og mock-svar. |

**Konklusjon om gjennomførbarhet:**

- **Lite realistisk uten vesentlige endringer.** Se forslagene under.

**Forslag til justering av omfang eller vanskelighetsgrad:**

1. Avgrens v1 til tre steg: (a) investoren legger inn eller bekrefter nøkkeltall som kjøpesum, leieinntekter, felleskostnader og lån, (b) én KI-analyse av tilstandsrapporten som lister TG2/TG3-avvik med sidetall, og (c) en finansmodul i vanlig kode som beregner brutto- og nettoyield og kontantstrøm, med de tre anbefalingene etter faste regler. Market Agent, stresstesting, investeringsscore og annonselenke kan komme i trinn 2.
2. Behandle «agentene» som steg i en enkel, sekvensiell pipeline i stedet for et rammeverk med samarbeidende agenter. Det gir samme synlige pipeline i brukergrensesnittet og er mye enklere å teste og feilsøke.

## Hvorfor product brief er viktig for mappen

Product brief er utgangspunktet for PRD, arkitektur, stories og til slutt koden. Del 1 av mappen vurderes blant annet på om sensor kan følge en sporbar vei fra plan til ferdig app. Den vurderes også på om appen gjør det dere har beskrevet, om den er testet, om den er godt designet, og om den kan kjøres etter README. Et uklart, for stort eller for lite brief gjør alt dette vanskeligere senere. Det er mye enklere å rette nå enn sent i semesteret.

## 1. Gjennomgang av briefens deler

| Del av brief | Status | Kommentar |
|---|---|---|
| Executive Summary – er det klart hva appen er, og hvilket problem den løser? | OK | «Sammendrag» forklarer tydelig at appen automatiserer første analysefase for utleieeiendommer, og at investoren alltid tar beslutningen. |
| The Problem – er problemet konkret, med reelle situasjoner og brukere? | OK | Konkret: mange annonser, en tilstandsrapport på rundt 30 sider og 30–60 minutter per førstevurdering. |
| The Solution – beskriver løsningen brukeropplevelsen, ikke bare teknologi? | Juster | Analyseflyten og objektvisningen er godt beskrevet, men utseendet viser til en konseptvideo som ikke er gjennomgått. Lag egne skisser av dashbord, objektvisning og decision brief. |
| What Makes This Different – er vurderingen ærlig og realistisk? | Endre | Delen mangler. Beskriv kort hva investoren bruker i dag (regneark, generelle chatboter, rådgivere), og hvorfor dette er bedre, for eksempel sporbarhet til sidetall og skillet mellom fakta og estimat. |
| Who This Serves – er primærbrukerne tydelige, og vet vi hva de trenger? | Juster | Primærbrukeren er produkteieren selv som investor. Det er tydelig, men beskriv behovene og forkunnskapene eksplisitt, for eksempel hvilke nøkkeltall investoren alltid ser på først. |
| Success Criteria – kan kriteriene faktisk sjekkes eller testes? | Endre | Evalueringsopplegget med 3–5 caser er en god idé, men det finnes ingen målbare kriterier ennå. Legg til kriterier som «nettoyield beregnes likt med fasit i regneark for alle testcasene», «alle TG3-avvik i testrapporten blir funnet og vist med riktig sidetall» og «mangler leieinntekt, gis ingen score, og anbefalingen blir ‹innhent mer informasjon›». |
| Scope – er det klart hva som er med i første versjon, og hva som ikke er det? | Endre | Det er klart at automatisk eiendomssøk og live markedsdata er ute. Men «MVP» inneholder fortsatt alle agentene og alle nøkkeltallene. Del dette i «In for v1» og «Explicitly out» etter forslaget over. |
| Vision – henger visjonen sammen med resten uten å blåse opp omfanget? | OK | Automatisk søk, rangering og bruk for andre investorer er tydelig merket som mulig videreutvikling. |

## 2. Utgangspunkt for del 1 av mappen

Punktene følger kriteriene i sensorveiledningen for del 1. Vektene i parentes viser hvor mye hvert kriterium teller i del 1.

| Kriterium i del 1 | Hva briefen bør legge til rette for | Status | Kommentar |
|---|---|---|---|
| **1. Prosess og KI-styring** (30 %) | Brief som er presis nok til at PRD og stories kan bygges direkte på den, slik at krav kan spores fra brief til kode. | Juster | Feilbildene og troverdighetskravene kan spores godt videre. De uavklarte definisjonene må fastsettes før PRD. Commit jevnlig fremover, siden repoet bare har én innholdscommit. |
| **2. Funksjonalitet og omfang** (20 %) | Realistisk omfang for gruppen og semesteret: en tydelig kjerneflyt som kan bli ferdig og stabil, og nok innhold til å vise reell funksjonalitet. | Endre | Kjerneflyten er tydelig, men for omfattende. Med en avgrenset v1 vil det fortsatt være nok reell funksjonalitet. |
| **3. Kvalitetssikring og testing** (15 %) | Suksesskriterier og funksjoner som er konkrete nok til å bli testtilfeller. | Juster | Feilbildelisten og evalueringscasene er et godt utgangspunkt. Gjør dem om til konkrete testtilfeller med fasit. |
| **4. Design og brukeropplevelse** (10 %) | Tydelige brukere og brukssituasjoner som designet kan bygges rundt, gjerne med de viktigste skjermbildene eller flytene skissert. | Juster | Pipeline-visning og decision brief er gode designideer. Erstatt henvisningen til konseptvideoen med egne wireframes i repoet. |
| **5. Kodekvalitet og arkitektur** (10 %) | Teknologivalg som er begrunnet og ikke mer komplekse enn appen trenger. | Juster | Et rammeverk for flere agenter kan fort bli mer komplekst enn nødvendig. Begrunn valget i arkitekturen, og hold beregningene utenfor språkmodellen. |
| **6. README og kjørbarhet** (10 %) | Løsning som andre kan kjøre lokalt uten betalte kontoer, og uten tilgang til gruppens egne tjenester og nøkler. | Juster | Planlegg en demomodus med et ferdig testobjekt og lagrede KI-svar, slik at sensor kan se hele flyten uten nøkkel. |
| **7. Ryddighet i repoet** (5 %) | En plan for hvor hemmeligheter, testdata og dokumentasjon skal ligge. | Juster | Bestem hvor testcasene skal ligge, og om ekte salgsoppgaver kan publiseres i et offentlig repo. Anonymiser eller lag fiktive dokumenter ved behov. |

## 3. Neste steg for gruppen

1. Skriv en avgrenset v1 i Scope: nøkkeltall inn, KI-analyse av tilstandsrapporten med sidetall, og finansberegninger i kode. Flytt resten til senere trinn.
2. Fastsett formler for nøkkeltallene i v1 og reglene for de tre anbefalingene, og lag ett ferdig utregnet testobjekt (gjerne med fiktive tall, som eksempelet med 16 mill. kr og 1,9 mill. kr) som fasit.
3. Legg til «What Makes This Different» og målbare suksesskriterier, rett emnekonteksten til IBE160, og gå så videre til PRD.

Oppdater product brief i repoet når dere har gjort endringene, slik at historikken viser hvordan planen utviklet seg. Det er en del av prosessen sensor ser etter.
