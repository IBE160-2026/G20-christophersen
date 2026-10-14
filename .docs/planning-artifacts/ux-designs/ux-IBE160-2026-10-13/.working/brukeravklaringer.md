# Brukeravklaringer — BMAD UX

Dato: 2026-10-13. Mottatte svar lagres for sporbarhet. Beslutninger utledes i `.memlog.md` via `memlog.py`.

## Dokumentkontroll

Spørsmål:

> Når du kontrollerer ett TG2/TG3-funn, hva trenger du å se samtidig for å føle deg trygg på å bekrefte eller korrigere det? Jeg trenger særlig din preferanse for hvordan original-PDF-en og den konkrete siden skal være tilgjengelig mens du arbeider med funnet.

Svar fra Mads:

> Når jeg kontrollerer et TG2/TG3-funn ønsker jeg å se selve funnet og originalrapporten samtidig.
>
> På den ene siden skal jeg se funnkortet med
>
> tilstandsgrad TG2 eller TG3
>
> kort beskrivelse av hva KI har hentet ut
>
> PDF-side
>
> eventuell markert usikkerhet
>
> status for funnet
>
> handlingene Bekreft, Korriger og Avvis
>
> For alvorlige TG3-funn skal jeg også kunne se og sette avklaringsstatus slik PRD-en allerede krever.
>
> På den andre siden skal original-PDF-en være synlig direkte i appen.
>
> Når jeg åpner eller velger et funn skal PDF-visningen automatisk gå til siden som funnet viser til. Jeg skal kunne lese hele siden og bla til sidene rundt dersom jeg trenger mer kontekst.
>
> Hvis det er teknisk enkelt å markere eller fremheve den konkrete teksten funnet bygger på, er det ønskelig. Det skal likevel ikke være et krav i v1 dersom dette gjør løsningen vesentlig mer kompleks. Minimumskravet er at riktig PDF-side åpnes automatisk.
>
> Jeg ønsker ikke at originalrapporten åpnes i en separat nettleserfane som standard, fordi jeg da mister sammenhengen mellom funnet og kilden.
>
> Når jeg korrigerer et funn skal det fortsatt være tydelig hva KI opprinnelig hentet ut og hva jeg har endret.
>
> Målet er at jeg skal kunne gjøre hele kontrollen uten å forlate denne visningen.
>
> For desktop ser jeg derfor for meg en delt arbeidsflate med funnlisten/funndetaljer og PDF side om side. På mindre vindusbredde kan PDF-visningen eventuelt åpnes som et eget panel, men desktop-opplevelsen er hovedprioritet.

## Firetrinns-navigasjon

Spørsmål:

> Hvordan ønsker du å navigere gjennom de fire trinnene? Hva vil du se av framdrift og tidligere trinn, og hvordan vil du gå tilbake fra resultatet for å rette tall eller funn?

Svar fra Mads (bestilling i neste brukerturn):

> Jeg ønsker en tydelig firetrinns navigasjon øverst i arbeidsflaten.
>
> Trinnene skal vises som en horisontal stepper med navn, nummer og status.
>
> Forslag til struktur
>
> 1. Tallgrunnlag
> 2. Tilstandsrapport
> 3. Kontroller funn
> 4. Resultat
>
> Jeg vil alltid kunne se
>
> hvilket trinn jeg er på
>
> hvilke trinn som er fullført
>
> hvilke trinn som fortsatt gjenstår
>
> om et tidligere fullført trinn senere er endret slik at deler av resultatet må beregnes på nytt
>
> Tidligere fullførte trinn skal være klikkbare slik at jeg kan gå tilbake og rette noe.
>
> Fremtidige trinn skal ikke kunne hoppes til dersom nødvendig grunnlag mangler. Systemet bør heller forklare kort hva som må fullføres først.
>
> Når jeg går tilbake skal tidligere input og bekreftelser beholdes. Jeg skal ikke måtte starte hele vurderingen på nytt.
>
> Fra resultatet ønsker jeg tydelige handlinger som for eksempel
>
> Endre tallgrunnlag
>
> Gå tilbake til rapportfunn
>
> Hvis jeg endrer bare økonomiske tall, skal finansberegningene og anbefalingen oppdateres deterministisk uten nytt KI-kall.
>
> Hvis jeg korrigerer eller endrer et eksisterende rapportfunn, skal anbefalingen oppdateres ut fra den nye bekreftede funnlisten uten at hele rapporten analyseres på nytt.
>
> Hvis jeg bytter selve tilstandsrapporten, skal tidligere rapportanalyse ikke lenger regnes som gyldig, og ny analyse må gjennomføres.
>
> Jeg ønsker ikke en fri dashboard-navigasjon i selve v1-flyten. Hovedopplevelsen skal være sekvensiell og tydelig, men med mulighet til å gå tilbake til tidligere trinn.
>
> På resultatsteget skal stepperen fortsatt være synlig slik at jeg enkelt kan forstå hele flyten og gå tilbake til det som må rettes.

## Utdatert resultat

Spørsmål:

> Når du endrer tall eller funn etter å ha sett resultatet, krever PRD-en ny bekreftelse av det berørte grunnlaget. Hva ønsker du å se på Resultat mens dette pågår? Skal de berørte gamle tallene og anbefalingen skjules, eller beholdes tydelig merket som utdaterte fram til ny bekreftelse?

Svar fra Mads:

> Behold tidligere resultat synlig, men aldri som om det fortsatt er gyldig.
>
> Når jeg endrer tallgrunnlag eller bekreftede rapportfunn etter at Resultat er beregnet, skal Resultat gå over i en tydelig «Utdatert» eller «Må bekreftes på nytt»-tilstand.
>
> Jeg ønsker da å se
>
> den tidligere anbefalingen
>
> de tidligere nøkkeltallene
>
> hvilket grunnlag som er endret
>
> at resultatet ikke lenger er gjeldende
>
> Det skal være visuelt tydelig at dette er historisk informasjon, for eksempel gjennom dempet visning og en klar statusmelding.
>
> Den gamle anbefalingen skal ikke fremstå som aktiv eller beslutningsklar.
>
> Primærhandlinger som «Gå videre» skal ikke kunne brukes basert på et utdatert resultat.
>
> Systemet skal vise hva som må bekreftes på nytt før nytt gyldig resultat kan beregnes.
>
> Hvis bare økonomiske tall er endret, skal det være tydelig at tallgrunnlaget må bekreftes på nytt før finansberegninger og anbefaling blir gyldige igjen.
>
> Hvis rapportfunn er endret, skal det være tydelig at den gjeldende funnlisten må bekreftes på nytt før screening kan fullføres.
>
> Når nødvendig grunnlag er bekreftet på nytt, skal systemet beregne nytt resultat og erstatte den utdaterte statusen med et nytt gyldig resultat.
>
> Målet er å bevare sporbarhet og sammenheng uten at brukeren kan forveksle gamle resultater med gjeldende resultat.

## Visuell retning

Spørsmål:

> Hvilket visuelt uttrykk ønsker du for Property Acquisition Agent? Beskriv gjerne hvordan det skal kjennes å arbeide i appen, og eventuelle apper, nettsider, farger eller uttrykk du vil hente inspirasjon fra eller unngå.

Svar fra Mads:

> Jeg ønsker et profesjonelt, rolig og institusjonelt visuelt uttrykk.
>
> Appen skal føles som et seriøst arbeidsverktøy for eiendomsinvestering og førstevurdering, ikke som en typisk AI-chat eller et fargerikt SaaS-produkt.
>
> Jeg ønsker at opplevelsen skal kjennes
>
> presis
>
> ryddig
>
> tillitsskapende
>
> analytisk
>
> moderne
>
> effektiv å arbeide i over tid
>
> Visuelt ønsker jeg en lys hovedflate med mye luft, tydelig typografisk hierarki og relativt kompakte informasjonsflater der det er naturlig.
>
> Fargepaletten bør være dempet og profesjonell.
>
> Bruk gjerne
>
> mørk marineblå, grafitt eller nesten svart til navigasjon, overskrifter og viktige strukturelementer
>
> hvitt og lyse gråtoner som hovedbakgrunn
>
> én diskret aksentfarge til aktive elementer og primærhandlinger
>
> grønt, gult/oransje og rødt kun der fargen faktisk kommuniserer status, risiko eller anbefaling
>
> Fargene Forkast, Innhent mer informasjon og Gå videre skal være tydelige, men ikke så sterke at resten av grensesnittet føles som et trafikklys.
>
> Jeg liker prinsippene fra produkter som Linear og Stripe Dashboard
>
> tydelig struktur
>
> god spacing
>
> presis typografi
>
> lite visuell støy
>
> informasjonstett uten å bli rotete
>
> raske og tydelige interaksjoner
>
> Jeg ønsker samtidig at uttrykket skal passe bedre til eiendom og investering enn til programvareutvikling.
>
> Viktige tall som nettoyield, NOI og kontantstrøm skal være enkle å skanne, men løsningen skal ikke se ut som en tradingplattform.
>
> Tilstandsrapportdelen kan være mer arbeidsflatepreget, særlig i den delte visningen med funn på den ene siden og PDF på den andre.
>
> Resultatsiden skal føles som et kort investeringsnotat eller underwriting-sammendrag
>
> tydelig anbefaling øverst
>
> viktigste begrunnelse direkte under
>
> økonomiske nøkkeltall
>
> tekniske funn
>
> mangler og usikkerhet
>
> sporbarhet til grunnlaget
>
> Jeg vil unngå
>
> store gradienter
>
> neonfarger
>
> unødvendige animasjoner
>
> chatbot-estetikk
>
> AI-glød eller «magiske» effekter
>
> store illustrasjoner som tar plass fra data
>
> for mange kort og bokser uten tydelig informasjonsstruktur
>
> overdrevent mørkt dashboard-uttrykk
>
> UI som ligner kryptohandel eller gaming
>
> AI skal visuelt behandles som én del av analyseprosessen, ikke som produktets hovedperson.
>
> Designet bør også kunne utvikles videre senere når produktet får flere eiendommer, pipeline, Market Agent og øvrige analysefunksjoner, uten at v1 trenger disse funksjonene nå.
>
> Bruk dette som visuell retning i UX-arbeidet. Ikke utvid produkt-scope.

## Fargevalg

Spørsmål:

> Hvilket fargealternativ i den åpne forhåndsvisningen ønsker du som grunnlag for designet? Du kan også beskrive en kombinasjon eller justering.

Svar fra Mads:

> 2. Grafitt og petrol

Referanser: [fargeprøver](color-themes-1.html), [kontrastpar](fargekontraster-1.json), [valgt palett](valgt-palett.json).

## Endelig avklaring: feilplassering og detaljsporbarhet

Spørsmålene gjaldt plassering av mangler/feil når hovedflyten sperres, og standard detaljåpning på Resultat.

Svar fra Mads (neste brukerturn):

> Jeg velger følgende:
>
> 1. Mangler og analysefeil skal vises direkte i det aktuelle trinnet.
>
> Hvis et nødvendig tall mangler, skal dette være tydelig i Tallgrunnlag.
>
> Hvis dokumentet ikke kan analyseres eller analysen feiler, skal dette være tydelig i Tilstandsrapport eller Kontroller funn, avhengig av hvor feilen oppstår.
>
> Brukeren skal ikke måtte gå til Resultat for å forstå at grunnlaget er ufullstendig.
>
> Hvis brukeren likevel kommer til Resultat med et grunnlag som fører til Innhent mer informasjon, skal Resultat vise en samlet og tydelig oppsummering av hva som mangler eller må avklares.
>
> Dette skal ikke duplisere hele feilmeldingen, men samle de forholdene som faktisk blokkerer screeningen.
>
> 2. På Resultat skal detaljsporbarhet åpnes ved behov.
>
> Synlig fra start:
>
> anbefaling
>
> kort begrunnelse
>
> utløste regler
>
> bruttoyield
>
> NOI
>
> nettoyield
>
> kontantstrøm før skatt
>
> alvorlige tekniske funn
>
> mangler og uavklarte forhold
>
> tydelig neste handling
>
> Åpnes ved behov:
>
> fullstendige formler
>
> inputkilder og forutsetninger
>
> detaljerte beregningsgrunnlag
>
> opprinnelig KI-uttrekk
>
> brukerkorrigert versjon
>
> ytterligere sporbarhetsinformasjon
>
> Bruk progressive disclosure, for eksempel seksjoner eller accordions, slik at informasjonen er lett tilgjengelig uten å gjøre Resultat-siden tung.
>
> Hovedregelen er at jeg skal kunne forstå anbefalingen uten å åpne noen detaljer, men jeg skal kunne etterprøve hele grunnlaget dersom jeg ønsker det.
>
> Bruk dette som endelig UX-beslutning for disse to punktene.

## Endelig PDF-fallback — 14. oktober 2026

Svar fra Mads:

> Velg alternativ 1: PDF-panel ved behov.
>
> Når vinduet blir for smalt til at funn og PDF kan vises side om side på en lesbar måte, skal funnkontrollen fortsatt være hovedflaten.
>
> Valgt funn skal vises med en kort oppsummering som inkluderer
>
> tilstandsgrad
>
> kort beskrivelse
>
> PDF-side
>
> status
>
> eventuell usikkerhet
>
> Brukeren skal kunne åpne PDF-en i et eget panel fra det valgte funnet.
>
> PDF-panelet skal åpne direkte på riktig side og ha en tydelig handling for å gå tilbake til funnkontrollen.
>
> Når brukeren lukker PDF-panelet, skal valgt funn og arbeidskontekst beholdes.
>
> Ikke bruk stablet funn + PDF som standard fallback, fordi dette gir unødvendig lang side og svakere kobling mellom funn og kilde.
>
> Vanlig desktop-visning beholder funn og PDF side om side.
>
> Bruk denne løsningen som endelig UX-beslutning for smale desktop-vinduer og zoom.

## Endelig korrigeringsmekanisme — 14. oktober 2026

Spørsmål:

> UX-kontrollen avdekket ett reelt valg ved korrigering av KI-funn: Når skal rettingen bli gjeldende? Originaluttrekket bevares, og endret funnliste må fortsatt bekreftes etter PRD-en.

Svar fra Mads:

> Velg alternativ 1.
>
> Når jeg korrigerer et KI-funn skal endringen først være et utkast.
>
> Jeg skal kunne redigere funnet uten at den nye versjonen umiddelbart blir gjeldende i den bekreftede funnlisten.
>
> Det skal finnes to tydelige handlinger
>
> Bruk korrigering
>
> Avbryt
>
> Bruk korrigering gjør den redigerte versjonen til gjeldende, men funnet og funnlisten skal fortsatt være markert som ubekreftet fram til nødvendig bekreftelse etter PRD-en er gjennomført.
>
> Avbryt forkaster redigeringen og beholder tidligere gjeldende versjon.
>
> Det opprinnelige KI-uttrekket skal fortsatt bevares for sporbarhet.
>
> Det skal være tydelig skille mellom
>
> opprinnelig KI-uttrekk
>
> redigert utkast
>
> gjeldende korrigert funn
>
> bekreftet funn
>
> Målet er å unngå at en halvferdig redigering påvirker screeninggrunnlaget.
>
> Bruk dette som endelig UX-beslutning for korrigering av KI-funn.
