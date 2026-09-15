---
title: "Product Brief: Property Acquisition Agent"
status: complete
created: 2026-09-15
updated: 2026-09-15
---

# Product Brief: Property Acquisition Agent

## Sammendrag

Property Acquisition Agent skal automatisere den første analysefasen ved vurdering av eiendomsinvesteringer i Norge. Første versjon skal primært støtte produkteierens egne investeringer i utleieeiendommer, mindre bygårder og andre boligeiendommer. Systemet skal sammenstille eiendomsinformasjon, dokumentanalyse, økonomiske beregninger og risikovurderinger til et kort beslutningsgrunnlag med anbefalt neste handling.

Investeringsstrategien er god løpende avkastning kombinert med forbedringspotensial: høyere leieinntekter, bedre drift, utviklingsmuligheter eller en attraktiv kjøpspris sett opp mot risikoen. Investoren tar alltid den endelige beslutningen.

## Problemet

Investoren må i dag manuelt gjennomgå mange annonser og dokumenter. Pris, leieinntekter, areal, antall enheter og oppgitt yield vurderes først. Deretter leses salgsoppgave, leieinformasjon, tilstandsrapport og annen dokumentasjon. En tilstandsrapport kan alene være rundt 30 sider med tekniske detaljer som er tidkrevende å tolke og knytte til investeringens økonomi.

## Beslutningen systemet skal støtte

Systemet skal hjelpe investoren å avgjøre om objektet er verdt å bruke mer tid på. Analysen avsluttes med én av tre begrunnede anbefalinger:

- **Forkast objektet.**
- **Innhent mer informasjon.**
- **Gå videre til grundigere analyse eller befaring.**

Supervisor samler analysene i et kort beslutningsgrunnlag (decision brief) med investeringsscore når grunnlaget tillater det, anbefaling, hovedbegrunnelser, potensielle oppsider, viktigste bekymringer, manglende informasjon og anbefalt neste handling. Scoren skal støtte anbefalingen og ikke erstatte begrunnelsen. Scoremodellen er ikke fastlagt. Systemet skal ikke gi en endelig kjøpsbeslutning.

Hvis kritiske opplysninger mangler, motsier hverandre eller har for lav pålitelighet, skal systemet anbefale **innhent mer informasjon** og ikke gi en samlet investeringsscore. Det skal fortsatt vise dokumenterte opplysninger, mangler, motstridende opplysninger, hvilke analyser som kan gjennomføres, og hva investoren bør innhente før analysen kan fullføres. Systemet skal heller være eksplisitt usikkert enn falskt presist.

Det avsluttende menneskelige godkjenningssteget gir handlingene **Approve next step**, **Review manually** og **Reject deal**. Godkjenning gjelder neste steg i vurderingen, ikke bud eller kjøp. Systemet skal ikke automatisk sende bud.

## Desktop-webapp og analyseflyt

Førsteversjonen skal være en desktop-webapp med et oversiktlig dashboard og en synlig pipeline som viser hvor objektet befinner seg: **Scout → Document extraction → Condition report analysis → Finance analysis → Risk analysis → Supervisor scoring → Human approval**. Tidligere konseptvideo for Property Acquisition Agent er brukerens hovedreferanse for utseende og funksjon. Videoen er ikke gjennomgått; briefen bygger på brukerens gjengivelse.


Investoren sender inn ett eiendomsobjekt ved å lime inn en annonselenke og laste opp relevante dokumenter. Systemet leser og strukturerer dokumentene, analyserer hele tilstandsrapporten, identifiserer tekniske avvik og mulig vedlikeholdsbehov, og kobler funnene til mulige økonomiske konsekvenser. Risiko og oppside vurderes. Grove kostnadsintervaller skal bare gis der dette er forsvarlig, og merkes som estimater.

Objektvisningen skal samle investeringsdata, økonomiske nøkkeltall, tekniske funn, risikoer, mangler og antakelser, med mulighet til å undersøke dokumentfunn og kildehenvisninger. Ønsket innsikt omfatter brutto- og nettoyield, kontantstrøm, finansiering, gjeldsbetjening, kapitalbehov og stresstesting. Feltlisten er bevart i vedlegget. Endelig funksjonsliste, definisjoner og beregningsgrunnlag avklares videre.

## Troverdighet og sporbarhet

- Alle viktige dokumentfunn skal ha kildehenvisning til dokument og sidetall.
- Dokumenterte fakta, AI-genererte estimater, brukeroppgitte antakelser og manglende informasjon skal være tydelig atskilt.
- Alle økonomiske antakelser skal være synlige.
- Manglende informasjon skal vises eksplisitt; systemet skal aldri skjule usikkerhet eller fylle mangler med gjetninger.
- Viktige funn bør ha et synlig usikkerhetsnivå. Hvordan dette uttrykkes og underbygges, avklares videre.

Særlig alvorlige feil er oppdiktet informasjon, oversette alvorlige tekniske avvik, feiltolket kjøpesum eller leieinntekt, feil tall i beregninger, estimater presentert som fakta, skjulte informasjonsmangler og dobbelttelling av kostnader. Dette skal styre senere kvalitetskrav og evaluering; målbare akseptansekriterier gjenstår.

## Omfang og grenser

Bekreftet fokus er første analysefase og vurdering av teknisk, økonomisk, juridisk og markedsmessig risiko. Systemet skal være beslutningsstøtte og skal ikke kjøpe eiendom eller gjøre irreversible økonomiske handlinger autonomt.

MVP omfatter analyse av ett brukerinnsendt objekt med relevante dokumenter og en begrunnet anbefaling om neste steg. Automatisk eiendomssøk er utenfor MVP. Flere spesialiserte AI-agenter skal samarbeide om analysen. De foreslåtte rollene er dokumentert i vedlegget; nøyaktig antall agenter, koblingen mellom visuelle steg og agenter, teknisk arkitektur og endelig funksjonsliste er ikke besluttet.

Datagrunnlaget er primært opplastede dokumenter, annonseinformasjon og synlige brukeroppgitte forutsetninger. Eventuelle referanseverdier og testdata skal tydelig merkes som estimater. MVP skal ikke være avhengig av live markedsdata eller omfattende eksterne integrasjoner. Utilstrekkelig grunnlag for markedsleie eller vedlikeholdskostnader skal vises som usikkert eller manglende.

## Langsiktig retning

Automatisk eiendomssøk og rangering på tvers av muligheter kan komme senere. På lengre sikt kan løsningen brukes av andre investorer eller inngå i større eiendomssystemer. Dette er mulige videreutviklinger, ikke leveransekrav for første versjon.

## Suksess og evaluering

Brukeren anslår at en første manuell vurdering normalt tar 30–60 minutter, og lenger for kompliserte objekter. Målet er at systemet gjennomfører hovedanalysen på noen få minutter, og at investoren deretter kan kontrollere og forstå resultatet på omtrent 5–10 minutter. Dette er mål som skal prøves i evaluering, ikke dokumentert ytelse. Verdien er å flytte menneskets tid fra dokumentlesing, datauttrekk og enkle beregninger til kontroll, vurdering og beslutning; menneskelig kontroll skal fortsatt inngå.

Semesterprosjektet skal evalueres med noen få virkelige eller realistiske eiendomscaser med dokumentasjon, sammenlignet med grundige manuelle vurderinger. Foreløpig siktes det mot 3–5 objekter; antallet er ikke låst. Evalueringen skal undersøke riktige nøkkeltall, viktige tekniske avvik, skillet mellom fakta og estimater, oppdagelse av manglende informasjon, korrekte økonomiske beregninger og rimelige, begrunnede anbefalinger. Et slikt begrenset utvalg gir innsikt i de undersøkte casene, ikke dokumentasjon på generell treffsikkerhet.

## Formål med dokumentet

Prosjektet gjennomføres i Agent Programming med BMAD Method, og Project Brief er første innlevering. Målet er å demonstrere en fungerende agentisk arbeidsflyt der flere spesialiserte agenter gjør eiendomsanalysen raskere, mer strukturert og mer sporbar. Ingen bestemte teknologier eller bestemt antall agenter er oppgitt som formelle krav. Denne briefen avslutter den veiledede produktavklaringen på konseptnivå. Detaljer fra brukeren bevares i [addendum.md](addendum.md) for senere krav- og arkitekturarbeid.

## Videre avklaringer i PRD og UX

Konseptvideoen må gjøres tilgjengelig for visuell verifisering og UX-arbeid. Videre kravarbeid konkretiserer nøkkeltalldefinisjoner, investorforutsetninger, scoremodell, kritiske opplysninger og pålitelighet, samt evalueringscaser og akseptansekriterier. Beregningsformler og teknisk arkitektur er ikke låst. Eventuelle ytterligere formelle krav og frister må hentes fra oppgaveteksten.
