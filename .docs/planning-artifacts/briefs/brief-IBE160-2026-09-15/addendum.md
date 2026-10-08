# Vedlegg: Property Acquisition Agent

Oppdatert 2026-10-08. Gjeldende v1 er definert i [brief.md](brief.md). Vedlegget bevarer eksempler, evalueringsgrunnlag og langsiktige produktinnspill. Det er ikke en PRD, UX-spesifikasjon eller arkitektur.

## Utregnet fasit

Fiktivt eksempel basert på brukerens opprinnelige scenario med pris 16 millioner og årlig leie 1,9 millioner. Øvrige tall er kontrollerte testforutsetninger, ikke dokumenterte markedsverdier. Formlene er låst av produkteieren 2026-10-08. Rapporten antas ferdig analysert og bekreftet, uten uavklart alvorlig TG3.

| Inndata | NOK / verdi |
|---|---:|
| P: kjøpesum | 16 000 000 |
| L: årlig brutto leieinntekt | 1 900 000 |
| D: årlige eierbetalte driftskostnader | 400 000 |
| J: årlig gjeldsbetjening (renter og avdrag) | 800 000 |
| Ymin: brukerens minste nettoyield | 7 % |

Driftskostnadene i eksempelet består av felleskostnader 120 000, kommunale avgifter/eiendomsskatt 80 000, forsikring 40 000, forvaltning 60 000 og løpende vedlikehold 100 000. Ingen post er inkludert i en annen post. Gjeldsbetjeningen består av renter 600 000 og avdrag 200 000, og ligger utenfor D.

- **Bruttoyield:** 1 900 000 / 16 000 000 = **0,11875**, vist som **11,875 %** (11,88 % med to desimaler).
- **NOI:** 1 900 000 − 400 000 = **1 500 000 kr/år**.
- **Nettoyield:** 1 500 000 / 16 000 000 = **0,09375**, vist som **9,375 %** (9,38 % med to desimaler).
- **Kontantstrøm før skatt:** 1 500 000 − 800 000 = **700 000 kr/år**.
- **Anbefaling:** Gå videre; nødvendig informasjon finnes, teknisk grunnlag er tilstrekkelig, nettoyield ≥ 7 % og kontantstrøm før skatt ≥ 0.

Begge yieldmål bruker kjøpesum, uten tillegg for kjøpsomkostninger. Det gjøres ikke separate fratrekk for ledighet eller særskilte reparasjonstiltak i v1-formlene. Avdrag inngår i gjeldsbetjeningen, men er ingen driftskostnad. Skatt og verdiendringer er utelatt. Alle beløp omregnes til år før beregning; månedlige beløp multipliseres med 12, uten automatisk antakelse om opptrapping eller leievekst. Beregninger og screeningregler utføres i vanlig kode; KI leverer dokumentfunn.

### Minst fire kontrollerte testcaser

Dette er planlagte fiktive testcaser med forhåndsdefinert fasit. Tilhørende PDF-er og maskinlesbare fasitfiler skal utarbeides før evaluering; de finnes ikke ennå. Hvert case får egen rapport og fasit med dokumentnavn, funntekst, TG-grad, PDF-side, avklaringsstatus, inndata og forventet anbefaling. F1–F3 planlegges med et kjent TG2-funn på PDF-side 2 og ingen TG3; F4 får i tillegg det angitte TG3-funnet. Rapportinnholdet skal samsvare med fasiten, ikke tilpasses KI-svaret i etterkant.

| Case | Kontrollerte inndata og dokumentgrunnlag | Forhåndsdefinert fasit |
|---|---|---|
| F1 Komplett | Tallene i hovedeksempelet; fullført og bekreftet rapportanalyse, ingen uavklart alvorlig TG3. | Bruttoyield 11,875 %, NOI 1 500 000, nettoyield 9,375 %, kontantstrøm 700 000. **Gå videre**. |
| F2 Økonomisk svakt | Som F1, men L = 1 400 000; teknisk grunnlag tilstrekkelig. | Bruttoyield 8,75 %, NOI 1 000 000, nettoyield 6,25 %, kontantstrøm 200 000. **Forkast** fordi nettoyield < 7 %. |
| F3 Kritisk mangel | Som F1, men L mangler; rapportgrunnlaget er tilstrekkelig. | Ingen av de fire leieavhengige nøkkeltallene beregnes. Manglende leie identifiseres. **Innhent mer informasjon**. |
| F4 Kjent TG3 | Tall som F1. Rapporten inneholder TG3 «Alvorlig lekkasje i tak» på **PDF-side 4**; funnet krever videre avklaring før forsvarlig screening. | KI finner TG3 med korrekt beskrivelse, dokument og side 4, uten reparasjonsestimat. Økonomiske nøkkeltall som F1, men **Innhent mer informasjon** på grunn av uavklart alvorlig TG3. |

### Regelvarianter med fasit

Øvrige forutsetninger er som i F1. Kritiske mangler og uavklart alvorlig TG3 prioriteres alltid foran økonomiske terskler. Uavrundede tall brukes i regelvurderingen.

| Variant | Forventet resultat |
|---|---|
| L har to uløste kildeverdier | Innhent mer informasjon; konflikten vises, ingen automatisk kildeprioritering. |
| P = 0 eller negativ D/J | Valideringsfeil og Innhent mer informasjon; ingen beregning med ugyldig grunnlag. |
| D, J eller Ymin er blank | Innhent mer informasjon; blank betyr ikke null. |
| Uleselig side, manglende rapport, avbrutt KI-kall eller ubekreftet funnliste | Innhent mer informasjon; teknisk grunnlag er utilstrekkelig. |
| F4 med ukjent avklaringsstatus | Innhent mer informasjon; ukjent betyr ikke avklart. |
| F4 etter dokumentert avklaring og brukerbekreftet tilstrekkelig teknisk grunnlag | Gå videre etter de samme økonomiske reglene; funnet og begrunnelsen for avklaringen vises fortsatt. |
| Ymin = 10 % | Forkast fordi nettoyield er lavere enn kravet. |
| J = 1 500 001 | Kontantstrøm = −1 kr; Forkast. |
| J = 1 500 000, Ymin = 7 % | Kontantstrøm = 0; Gå videre. |
| L = 1 520 000, Ymin = 7 % | NOI = 1 120 000, nettoyield = nøyaktig 7 %, kontantstrøm = 320 000; Gå videre. |
| L = 1 519 999, Ymin = 7 % | Nettoyield like under 7 %; Forkast selv om visningen avrunder til 7,00 %. |
| J = 0, eksplisitt bekreftet kontantkjøp | Gyldig grunnlag; kontantstrøm = 1 500 000; Gå videre. |
| L mangler samtidig som J = 1 500 001 | Innhent mer informasjon; informasjonsmangel har prioritet foran økonomisk screening. |

## Kontroll mot dokumenter og KI-feil

PDF-sidetall er sidens posisjon i filen, med første side som 1. Eventuelt trykt sidetall kan vises i tillegg. Funn må kunne kontrolleres mot originaltekst. Ved motstrid mellom KI-uttrekk og rapport markeres funnet som uavklart til investoren har korrigert og bekreftet det. Manuell korrigering skal være synlig som korrigering, med kilde.

KI skal trekke ut eksisterende TG2/TG3-vurderinger, ikke sette nye tilstandsgrader eller anslå reparasjonskostnader. Et alvorlig TG3-funn på taket som krever videre avklaring, stopper screening med Innhent mer informasjon. Avklaringsbehov, status og brukerens begrunnelse dokumenteres separat fra selve rapportfunnet. KI vurderer ikke objektet som teknisk godkjent. At ingen TG3 finnes, må bygge på fullført analyse og kontroll; manglende uttrekk betyr ikke fravær av avvik.

De opprinnelige alvorlige feilbildene videreføres som kontrollpunkter: oppdiktede opplysninger, oversette alvorlige avvik, feil kjøpesum/leie, regnefeil, estimater som fakta, skjulte mangler og dobbelttelling. S1–S4 i briefen gjør dem etterprøvbare. For S2 dokumenteres antall fasitfunn, antall riktige funn, oversette funn, feil sidetall og oppdiktede funn per rapport; utvalget skal inneholde både TG2 og TG3. Live KI-evaluering skilles fra demo med lagrede svar.

## Kjørbarhet, kostnader og repo

Dette er leveransemål for v1, ikke funksjoner som allerede finnes:

- **Demomodus:** et fiktivt objekt med tekstbasert rapport og lagret KI-uttrekk. Brukeren skal kunne endre nøkkeltall, beregne på nytt og se alle tre utfall uten nettverk eller API-nøkkel. Demo merkes som lagret analyse, slik at den ikke forveksles med et nytt KI-kall.
- **Live KI:** egen nøkkel fra lokal konfigurasjon; ingen nøkkel i repoet. Ett analysekall per ny rapport, uten automatiske omkjøringssløyfer. Lagret uttrekk gjenbrukes når rapporten er uendret; nye finansverdier utløser ikke KI-kall. Ny rapport krever ny analyse. Ved feil vises ufullført analyse og manuell videre håndtering.
- **Kostnader:** et prosjektbudsjett fastsettes før første betalte test. Modell, prisgrunnlag og beregnet kostnad per rapport på 30 sider må kontrolleres mot antall planlagte kall; hvis rammen ikke holder, må utvalg/modell eller budsjett avklares, uten å fremstille mock-resultater som live-testing. Demo og finans-/regeltester krever ingen betalte kall.
- **Testdata:** planlagt plassering `tests/fixtures/property-cases/`, med fiktive rapporter, strukturerte inndata, fasit og lagrede KI-svar. Evalueringsresultater og manuell testdokumentasjon legges under `.docs/implementation-artifacts/` når implementeringen starter. Ingen slike testfiler er opprettet her.
- **Personvern:** fiktive data foretrekkes. Reelle dokumenter publiseres ikke før personopplysninger, publiseringsrett og anonymisering er vurdert. Private originaler holdes utenfor git. Hemmeligheter, lokale filer og byggeartefakter holdes ute med `.gitignore`.
- **README og prosess:** senere README skal beskrive forutsetninger, installasjon, lokal demostart, valgfri live-konfigurasjon og testkommandoer. Krav og suksesskriterier kobles videre til stories, kode og tester. Små, beskrivende commits og lagrede prompts/beslutninger skal vise faktisk utvikling over tid.

## Bruksflate på briefnivå

Arbeidsflaten beskrives med egne ord: registrer objekt og nøkkeltall → kontroller rapportfunn med sider → les beregninger og anbefaling → velg neste handling. Status viser gjeldende steg og om noe er ufullført. Resultatet samler anbefaling og begrunnelse øverst, med tallgrunnlag, funn og mangler tilgjengelig for kontroll.

Egne skisser av oversikt, objektvisning og beslutningsgrunnlag gjenstår til senere designarbeid. Ingen UX-spesifikasjon er startet nå.

## Langsiktige produktambisjoner, utenfor v1

Den opprinnelige rolleskissen bevares som muligheter, ikke som krav til implementering eller antall agenter:

| Mulig rolle/funksjon | Videre produktutvikling |
|---|---|
| Scout Agent / sourcing | Automatisk søk, annonseuthenting og registrering av nye objekter. |
| Document Agent | Analyse av salgsoppgaver, leiekontrakter og flere dokumenttyper. |
| Condition Report Agent | Bredere teknisk vurdering og underbygde kostnadsintervaller utover v1s TG-uttrekk. |
| Finance Agent | DSCR, finansierings- og egenkapitalbehov, kapitalbehov og stresstesting av rente, ledighet og kostnader. Beregninger skal fortsatt være etterprøvbare. |
| Market Agent | Markedsleie, sammenlignbare eiendommer og markedsrisiko med tilstrekkelig datagrunnlag. |
| Risk Agent | Sammenstilling av teknisk, økonomisk, juridisk og markedsmessig risiko. |
| Supervisor Agent | Samlet investeringsscore og rangering, først når scoremodell og evaluering er definert. |

Mer avansert agentarkitektur kan vurderes dersom den senere gir dokumenterbar nytte. Andre investorer, flere brukerroller og integrasjoner i større eiendomssystemer er langsiktig retning. Ingen av disse ambisjonene skal gjøres til v1-krav indirekte gjennom skjermbilder eller evaluering.

## Produktbeslutninger låst før PRD

Produkteierens beslutninger 2026-10-08 erstatter de tidligere beregningsforslagene: bruttoyield L/P, NOI L−D, nettoyield NOI/P og kontantstrøm før skatt NOI−J. Minimumskravet til nettoyield oppgis av brukeren. Mangler, motstrid og alvorlig TG3 med avklaringsbehov har prioritet foran økonomiske screeningregler. Grensen for KI-analysen er TG2/TG3-funn i tilstandsrapporten med beskrivelse og korrekt sidetall; reparasjonsestimater, markedsanalyse, juridisk analyse og automatisert analyse av hele salgsoppgaven er senere produktutvikling. Minst fire kontrollerte caser med forhåndsdefinert fasit er planlagt ovenfor.

Ingen reelle åpne produktbeslutninger må løses før PRD. Den eksisterende tekniske inputavgrensningen til tekstbasert PDF inntil 30 sider videreføres. Brukerkompetanse er fortsatt en arbeidsantakelse som kan presiseres i PRD, uten å blokkere kjerneflyten. Utarbeiding av rapporter og fasitfiler for F1–F4, eventuelle tilleggscaser, egne skisser, modellvalg og kostnadsramme er videre planleggings- og gjennomføringsarbeid. Modell og budsjett skal kontrolleres før betalte live-tester. PRD er ikke startet.
