# Leveransekontroll av PAA mot IBE160 del 1

Dato: 2026-11-06. Stabil produktreferanse: **`639291814886a6058a24adf95c69e8633b645944`**. Arbeidet viderefører referansen; ingen historikk er omskrevet. Produktfunksjoner, beregningsregler, avhengigheter og låsfil er uendret. Én privatmiljøavhengig E2E-assert er rettet, med bevart produktfasit.

**Konklusjon:** Leveransen har en fungerende, nøkkelfri offentlig demonstrasjon, relevant omfattende testgrunnlag og en konkret dokumentert KI-styringsprosess. Forbedringene gjør dette lettere for sensor å etterprøve. Det gjenstår reelle bevis-/dekningsgrenser; disse er presisert og beholdt åpne.

## Grunnlag og lesesti

Original [sensorveiledning IBE160 del 1](../../reference/course/Sensorveiledning-IBE160-Del-1.pdf), alle sju sider, er vurderingsrammen. Del 1 teller **70 % av emnekarakteren**; denne kontrollen vurderer ikke studentens refleksjonsrapport/del 2 eller en egen bachelorveiledning. [Faglærerfeedback](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md), Brief, PRD og senere uttrykkelige bestillinger setter produktomfanget. Ingen nye produktkrav er utledet fra veiledningens eksempler.

Den korteste lesestien er [README](../../../README.md) → [fiktiv demonstrasjon](demonstrasjon.md) → [krav–kode–test/avvik og arkitektur](produkt-og-sporbarhet.md) → [prosess og KI-styring](prosess-og-ki.md) → [teknisk testbevis](teknisk-og-test.md) og [ren klon](ren-klon.md). Den [uavhengige sensoragenten](uavhengig-sensor.md) vurderer kritisk med egne kilde-/kodestikkprøver. [Agentoppdrag](agentoppdrag.md) og [arbeidsøkt](../arbeidsokter/2026-11-06-leveransekontroll.md) dokumenterer ansvar og integrasjon.

## Vurdering av alle sju kriterier

Vurderingene i denne tabellen er et foreløpig skjønn over dokumentasjonen og det kontrollerte produktomfanget, ikke garantert sensur. Den uavhengige agentens daterte vurdering skiller utgangspunkt fra ny kontroll.

| Sensorkriterium | Vekt | Foreløpig | Vurdering og utført forbedring | Gjenværende grense |
| --- | ---: | --- | --- | --- |
| **1. Prosess og KI-styring** | **30 %** | **B** | Sterkt og konkret prosessgrunnlag: iterativ historikk, brukte planartefakter og menneskets presisering/avvisning/retting. Ny leseguide kobler fire faktiske casekjeder til originalprompt, beslutning, full commit-ID og testbevis. Tre agentoppdrag og integrasjon er dokumentert. | Promptloggen er brukerhendelser, ikke full samtale. Agentkontroll er ikke menneskekontroll. Del 2 må være studentens egen refleksjon. |
| **2. Funksjonalitet og omfang** | **20 %** | **B** | PDF-import, kildevisning, kodebestemt økonomi, annuitet, scenario og kontrollert screening gir et relevant og ikke-trivielt produkt. Alle FR-1–FR-18, NFR-1–NFR-5 og S1–S6 er avstemt mot kode/test. Senere utvidelser og opprinnelige ikke-mål forklares. | Generell semantisk import er deaktivert. Vilkårlige PDF-er får ikke garantert full TG-/juridisk dekning. Individuell markedsleie og full automatisk eierdrift er ikke levert. |
| **3. Kvalitetssikring og testing** | **15 %** | **B** | Finansfasit, terskler, dobbelttelling, kildehash/fysisk side, PDF-/HTTP-feil, ressursvern og revisjoner har relevante tester. Ferske unit-, komponent-, OCR- og ren-klon-prøver er bevart. Den rene klonen fant og utløste retting av to cacheavhengige testfeil. | Historisk S2 er et lite kontrollert utvalg. Privat PDF-/OCR-test er ikke en representativ kvalitetsbenchmark. S5-W1 gir ingen validert tidsbesparelse; S6 mangler. |
| **4. Design og brukeropplevelse** | **10 %** | **B** | Konsept A og kontrollflyten har dokumenterte UX-beslutninger. Ny offentlig demonstrasjon prøver økonomi, originalside, Esc/fokusretur, feil og smal visning; syntetiske desktop-/mobilbilder er visuelt kontrollert. | Ingen ny ekstern førstegangsbrukertest, full hjelpemiddeltest eller WCAG-sertifisering. Syntetisk demo viser bevisst ukjent adresse/bilde fremfor oppdiktet eiendom. |
| **5. Kodekvalitet og arkitektur** | **10 %** | **B** | Lesbar ansvarsdeling mellom contracts, domain, presentation, frontend og backend. Ny gjeldende arkitekturbeskrivelse forklarer workers, lokale referanser, UI og bevarte adaptere. Typecheck/lint består. | Importdelen er omfattende; gamle FINN-/live-/preflight-veier har lesekostnad. Ingen risikofylt sluttrefaktorering er gjort uten dokumentert feil. |
| **6. README og kjørbarhet** | **10 %** | **B** | README er kortet ned fra historisk kronologi til gjeldende installasjon, lovlig fiktiv demo, riktig navigasjon/år og forventet fasit. `.env.example` er demo-først. Ren klon med isolert HOME/cache starter uten private filer eller nøkkel. | Testet på macOS arm64; Linux/Windows og menneskelig annen-person-S6 er ikke verifisert. Nett kreves til pakke-/browserinstallasjon. |
| **7. Ryddighet i repoet** | **5 %** | **B** | Én dokumentert lesestart og én sentral utsattoversikt. Tidligere bevis/logger bevares. Mønsterskann av hele nåbare Git-historikken fant bare tre allerede kjente fiktive sikkerhetstesttreff; 209 frosne bevisfiler er uendret. Npm-audit rapporterer 0 kjente sårbarheter. | Skann dekker bestemte nøkkelmønstre, ikke alle typer hemmeligheter. Historisk dokumentmengde beholdes av hensyn til revisjon; indekser brukes for å finne gjeldende status. |

## Utførte forbedringer

README og `.env.example` viser nå én nøkkelfri standardvei. Offentlig syntetisk demonstrasjon og forventede tall er gjennomprøvd. Brief/PRD/arkitektur har datert korreksjon av det utdaterte D1–D3-banneret. Den nye avstemmingen forklarer aktivt, historisk, endret, utsatt og ikke bevist scope, inklusive semantisk KI, kilde-/lagringsgrenser og S1–S6.

Prosessguiden løfter fram faktisk menneskelig styring, blant annet Mads' stopp av misvisende S5-måling og avvisning/avgrensning av utilstrekkelig økonomi-KI. Den sentrale ledgeren har en oppdatert lesestart og en eksplisitt **åpen** annen-person-S6. Ingen tidligere sak ble lukket uten bevis.

Den eneste endringen i eksisterende tester fjerner en utilsiktet avhengighet til utviklerens private analysecache. Testen krever fortsatt riktig lokal proveniens, eksakt dokumenthash/kilde, sperret teknisk status og null kostnadsreservasjon; årsaksteksten kontrolleres mot de tre felles garantiene. Appen og økonomiske forventningsverdier er uendret.

## Testresultater og bevisstyrke

På støttet **Node 24.21.0 / npm 11.19.0**: **2 238 unit-/integrasjonsprøver bestått, 7 valgfrie OCR-skip** i hovedrepoet; **50/50 komponenter**; separat **7/7 native macOS/OCR-prøver**; lint/typecheck/build består. I ren klon består **2 237 unit-/integrasjonstester, 8 skip** (sju native OCR og én privat original); dette er 110 beståtte testfiler og to skippede filer. Skip rapporteres eksplisitt, aldri som bestått.

Ren klon: baseline ga **231 E2E bestått, 12 skip og to dokumenterte testfeil**; etter testrettingen består målrettet ny-dokument-prøve **11/11 med 6 private skip**. Endelig full kjøring består **233 bygde E2E / 12 private skip og 3/3 dev-prøver**, exit 0. README-helperen består seks kontrollpunkter med **0 eksterne browserforespørsler og 0 pageerrors**. [Ren-klon-beviset](ren-klon.md) skiller disse forsøkene fra endelig full regresjon og oppstartskontroll av lokal commit. [Npm-audit](dependency-audit.json), [historikkskann](repository-audit.json) og sju beståtte prompt-hooktester supplerer produktprøvene.

Mange grønne tester beviser de konkrete finans-, kilde-, tilstands- og feilhåndteringsreglene. De beviser ikke generell dokumentforståelse, lovlig utleie, komplett eierdrift, bankfinansiering eller investeringskvalitet. Ingen nye betalte KI-kall ble gjort, og ingen private originaler eller råuttrekk ble lagt i Git.

## Gjenværende mangler og foreløpig karakter

Gjeldende åpne forhold finnes bare i [deferred-work](../../implementation-artifacts/deferred-work.md): S6/annen person, PAA-SO2s generelle dokument-/TG-/juridiske dekning, PAA-LEIE1s individuelle markedskalibrering, format-/samlet minneavgrensning, utsatt FINN-tilgang og historisk ukjent belastning. **S5-W1 er akseptert avvik, ikke rettet eller fullt bestått.** Disse grensene er ikke skjult av implementerte funksjoner eller nye dokumenter.

Etter uavhengig rekontroll vurderes alle sju kriteriene foreløpig til **B**, som gir **4,00 / B for del 1** med veiledningens vekter. Baseline var 3,85/B; forbedringen gjelder særlig README og etterprøvbarhet. Fungerende, ikke-triviell kjerne og konkrete prosess-/testbevis støtter B. Begrenset dokumentfasit, ufullført S5/S6 og manglende ekstern førstegangsbrukertest gjør A usikkert. [Sensoragentens daterte begrunnelse](uavhengig-sensor.md) er et KI-basert skjønn, ikke garantert sensur. Del 1 teller 70 %; ingen total emne-/bachelorkarakter kan utledes uten del 2 og eventuell annen relevant veiledning.
