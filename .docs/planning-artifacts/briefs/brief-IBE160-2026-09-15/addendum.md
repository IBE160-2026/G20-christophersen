# Vedlegg: Property Acquisition Agent

## Foreslått arbeidsdeling mellom agenter

Brukerens løsningsskisse, bevart som innspill til PRD og arkitektur. Flere spesialiserte AI-agenter er bekreftet som prosjektets retning. Den konkrete rollefordelingen og antallet er ikke besluttet.

- **Scout Agent:** Registrerer objektet og tilgjengelig informasjon fra en eiendomsannonse.
- **Document Agent:** Leser salgsoppgaven og strukturerer relevante data.
- **Condition Report Agent:** Leser hele tilstandsrapporten og identifiserer tekniske avvik, alvorlighetsgrad, mulig tidspunkt for tiltak og grove kostnadsintervaller der dette er forsvarlig.
- **Finance Agent:** Beregner yield, kontantstrøm, finansieringsbehov og gjeldsbetjening, og stresstester renter og andre forutsetninger.
- **Market Agent:** Vurderer leienivå og eiendommen mot markedet.
- **Risk Agent:** Samler teknisk, økonomisk, juridisk og markedsmessig risiko.
- **Supervisor Agent:** Samler analysene til et kort beslutningsgrunnlag, støttet av investeringsscore når grunnlaget tillater det. Scoren skal aldri erstatte begrunnelsen og utelates ved utilstrekkelig kritisk informasjon.

MVP starter med brukerinnsendt annonselenke og opplastede dokumenter. Scout-rollen innebærer derfor ikke automatisk eiendomssøk i første versjon.

## Konkret brukseksempel

Brukeren finner en bygård til 16 millioner kroner med 1,9 millioner kroner i oppgitte årlige leieinntekter. Tallene er et illustrerende scenario, ikke verifiserte opplysninger om en konkret eiendom.

Investoren gir objektet til systemet fremfor å lese en lang salgsoppgave og en tilstandsrapport på rundt 30 sider manuelt. Systemet skal hente ut relevante fakta, oppdage blant annet TG2- og TG3-avvik, identifisere mulig fremtidig vedlikehold og beregne konsekvensene for investeringen.

Ønsket resultat er nominell yield, justert yield, forventet kapitalbehov, hovedrisikoer, potensielle oppsider og anbefalt neste handling. Det er ikke gjort økonomiske beregninger eller fastsatt definisjoner i dette eksempelet.

## Eksempel på kort beslutningsgrunnlag

Brukerens illustrasjon av ønsket presentasjon, ikke en faktisk analyse eller fastsatt scoremodell:

- Investeringsscore: 82 av 100.
- Anbefaling: Gå videre til grundigere analyse eller befaring.
- Hovedbegrunnelse: Sterk yield og potensial for økte leieinntekter.
- Viktigste bekymring: Betydelig vedlikehold av tak.
- Manglende informasjon: To leiekontrakter er ikke levert.

## Sporbarhet fra teknisk funn til estimert konsekvens

Hvis systemet finner TG3 på taket, skal brukeren kunne se dokument og sidetall som underbygger funnet. Hvis AI deretter anslår reparasjonskostnad, skal kostnaden tydelig vises som et estimat og ikke som et faktum fra tilstandsrapporten. Økonomiske antakelser skal være synlige, og samme kostnad skal ikke telles flere ganger.

Brukerens prioriterte feilbilder for senere kvalitetsarbeid:

- Finne opp opplysninger som ikke finnes i dokumentene.
- Overse alvorlige tekniske avvik.
- Lese feil kjøpesum eller leieinntekt.
- Bruke feil tall i økonomiske beregninger.
- Presentere estimater som fakta.
- Late som manglende informasjon finnes.
- Telle samme kostnad flere ganger.

## Foreløpig evalueringsopplegg

Brukeren foreslår 3–5 grundig vurderte, virkelige eller realistiske eiendomsobjekter med dokumentasjon som grunnlag for semesterprosjektet. Antallet og utvalget fastsettes senere. Systemets analyse skal sammenlignes med en manuell vurdering av hvert objekt:

- Finner systemet riktige nøkkeltall?
- Identifiserer det viktige tekniske avvik?
- Skiller det korrekt mellom fakta og estimater?
- Oppdager det manglende informasjon?
- Utfører det økonomiske beregninger riktig?
- Gir det en rimelig og begrunnet anbefaling?

Brukerens anslag for dagens førstevurdering er 30–60 minutter, med lengre tid for kompliserte objekter. Ønsket tidsbruk er noen få minutter til systemets hovedanalyse og omtrent 5–10 minutter til investorens kontroll og forståelse. Menneskelig kontroll inngår i målbildet.

## Utilstrekkelig beslutningsgrunnlag

Manglende, motstridende eller for lite pålitelige kritiske opplysninger skal utløse «innhent mer informasjon», uten samlet investeringsscore. Resultatet skal likevel vise:

- Hva som er dokumentert.
- Hva som mangler.
- Hvilke opplysninger som motsier hverandre.
- Hvilke analyser som fortsatt kan gjennomføres.
- Hva investoren bør innhente før analysen kan fullføres.

Hva som regnes som kritisk informasjon og tilstrekkelig pålitelighet, må konkretiseres i videre kravarbeid.

## Bruksflate og konseptvideo

Tidligere konseptvideo er hovedreferanse for desktop-webappens utseende og funksjon. Videoen ble ikke funnet i prosjektet og er ikke gjennomgått i denne arbeidsøkten. Brukerens beskrivelse er grunnlaget for briefen; visuelle detaljer må verifiseres senere.

Ønsket synlig pipeline: Scout → Document extraction → Condition report analysis → Finance analysis → Risk analysis → Supervisor scoring → Human approval. Stegene beskriver brukerreisen, ikke en fastlagt teknisk kjøreplan eller et bestemt antall agenter. Markedsvurdering fra den tidligere rolleskissen bygger i MVP på tilgjengelig grunnlag, uten krav om live markedsdata.

Dashboard og objektvisning skal gi oversikt over kjøpesum, leieinntekter, gross yield, net yield, DSCR, equity need, tekniske funn, risikoer, mangler og antakelser. Detaljvisning skal støtte kontroll mot dokument og sidetall. Decision brief samler Investment score (når forsvarlig), Recommendation, Key reasons, Main concerns, Missing information og Recommended next action.

Avsluttende brukerhandlinger er Approve next step, Review manually og Reject deal. Dette er menneskelig kontroll av videre vurdering, uten automatisk budgivning, kjøp eller irreversible økonomiske handlinger.

## Datagrunnlag

Datagrunnlaget er opplastede dokumenter, annonseinformasjon, synlige brukerforutsetninger og eventuelle referanseverdier/testdata tydelig merket som estimater. Skjulte antakelser skal ikke erstatte manglende grunnlag for markedsleie eller vedlikeholdskostnader.

## Studierammer

Bekreftede studierammer: Agent Programming, bruk av BMAD Method, Project Brief som første innlevering og samarbeid mellom flere spesialiserte AI-agenter. Oppgaveteksten er ikke gjennomgått; bestemte teknologier, et bestemt antall agenter eller frister er ikke etablert som formelle krav.
