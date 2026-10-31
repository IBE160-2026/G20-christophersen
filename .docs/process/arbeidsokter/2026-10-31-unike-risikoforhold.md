# Unike risikoforhold – 2026-10-31

Brukeren ba om mindre repetisjon i Konsept A: samle samme underliggende problem med alle kilder, hold ulike forhold adskilt, skill juridisk standardtekst fra konkrete eiendomsforhold og la hvert funn åpnes. [Spesifikasjon](../../implementation-artifacts/spec-unike-risikoforhold.md). Baseline: ce16e49b9fc68db894591f6daaf2071ad4ed9452.

## Forankring og gjennomføring

AGENTS.md, godkjent UX, tidligere risikoimplementasjon, faglærertilbakemelding og tidligere leste sensorføringer brukes. De underbygger kildesporbarhet, eksplisitt usikkerhet, konsistent design og meningsfulle tester; de etablerer ingen ny grupperingsregel. Produktbestillingen eier denne endringen.

Gruppering legges i visningslaget etter eksisterende sperrer for gjeldende dokument, avvisning, retting, identitetskonflikt og kildegrunnlag. Originalt dokumentuttrekk og rå kilder endres ikke. Gruppeidentitet krever konkret subjekt og problemtype; tekstlikhet alene er utilstrekkelig. Dekningsmangler er egen informasjon, ikke risikoforhold i telleren. Generell juridisk bakgrunn bevares utenfor risikotelleren.

BMAD-build ble aktivert. En spesialist undersøkte privat kildekontekst og fallgruver; en implementeringsagent arbeider fra den lagrede spesifikasjonen. Hovedagent eier verifikasjon og review. Tidligere brukerautorisasjon til implementering uten unødvendige avklaringer og lokal commit med promptlogg videreføres. Aktiv promptlogg inneholder også den foregående omstarten; automatisk logging er uendret.

## Privat dokumentkontroll

Øvre Blekeveien 8 brukes lokalt. Side 28 navngir kjellerens utleiedel; side 58 omtaler utleid leilighet uten egen bruksenhetsgodkjenning. De skal kunne samles med begge kilder. Side 52 har også selvstendige opplysninger om loft og takterrasse som ikke skal kollapses til samme forhold. To tinglyste rettigheter på ulike sider kan heller ikke antas identiske bare fordi teksten omtaler servitutter.

Privat original og eventuelle private utdrag/skjermbilder holdes i ignorert private/ eller systemets tempmappe. Ingen betalte API-kall, eksterne dokumentoppslag eller push er autorisert.

## Review og konkrete rettinger

Tre uavhengige BMAD-reviewlag undersøkte diff og faktiske reproduksjoner. Åtte blind-funn, tre kanttilfeller og ett verifikasjonsgap ble ført individuelt i spesifikasjonens triage. Implementeringsagenten ble gjenengasjert for konkrete rettinger; hovedagent fulgte opp to ytterligere varianter av enhets-ID etter preposisjon/adverb.

- Retning og bokstavenhet inngår i identiteten, også små bokstaver og sammensatte/Unicode-himmelretninger. Kjeller øst/vest og enhet a/b blir ikke samme forhold.
- Ingen-subjekt, ukjent og motstridende subjekt er forskjellige tilstander. Ny overskrift stopper gammel etasjekontekst; anneks/garasje/tilbygg tilordnes ikke kjeller. En smal singularreferanse kan fortsatt knyttes til utleiedelen i den konkrete kontrollcasen, men en referanse «i gjestehuset» kan ikke.
- Konkrete begrensninger for leiligheten/rommet/seksjonen eller en navngitt enhet beholdes som risiko selv med lovhenvisning. Positivt gjenkjent generell standardforklaring vises nøytralt uten generert risikokonsekvens.
- Gjentatte kombinerte tillatelsesmangler og bruksendringsdokumentasjon har tydelig problemsignatur. Ulike problemtyper/grader/statuser/kildekvaliteter og kontroller holdes adskilt.
- Lukkede rader viser identifisert subjekt. Testen for kontekst er styrket med positiv samling og ugyldig offset; revieweren verifiserte at tidligere kontekstmutant nå feiler ni tester, og at fjernet offsetkontroll også fanges.

Alle opprinnelige reviewreproduksjoner og de to enhets-ID-variantene er bekreftet rettet av reviewer etter konkrete nykjøringer. Ingen endring i backend-/finans-/screeningkontrakter eller gamle dekningsporter.

## Verifikasjon og privat resultat

[100 målrettede Vitest-tester i seks filer](unike-risikoforhold-2026-10-31/vitest.txt) består: gruppering, rendering, selector, lokal juridisk/teknisk analyse og kilde-/importkontrakter. Nye tester krever riktig prioritetsrekkefølge og teller én gruppe fremfor flere kildebelegg, samtidig som bakgrunn og dekningsmetadata holdes utenfor.

Lokal privat prøve av dagens regler: ti juridiske råtreff gir åtte konkrete grupper og én bakgrunnsgruppe. Alle ti opprinnelige medlemmer er bevart. Utleiegruppen har eksplisitt subjekt Kjeller og begge fysiske sider 28 og 58. Dette er ikke en påstand om full juridisk dekning eller fullstendig semantisk samling i vilkårlige dokumenter. Konservative regler kan beholde uavklarte sammenhenger som separate funn.

Første og mellomliggende målrettede nettleserkjøring hadde 9/9 bestått, inklusive originalside 28 fra hovedsiden, side 58 fra full liste, separat rapport og samme hash med ulike filnavn. Endelig nettleser- og visuell kontroll er registrert i sluttkontrollavsnittet nedenfor. Node 24.21.0, Chromium 1248 og isolert testport 3218 med tom API-nøkkel brukes. Brukerens backend på port 3000 berøres ikke av testserverne.

En siste felleshenvisning til flere avvik ble bevart uten avgrenset stedsetikett: «Avvikene nevnt over» kan ikke tilordnes bare siste etasje. Ny enhetsprøve og uavhengig nykontroll består. Positive prøver for enhets-ID etter andre preposisjoner/adverb og Unicode-grenser hindrer at slike opplysninger forsvinner ved normalisering.

[Ni berørte Playwright-prøver](unike-risikoforhold-2026-10-31/playwright.txt) bestod etter hovedrettingene: hovedside, scenariobevaring, kontroller, separate rapporter, tastatur/fokus, mobil og fysisk originalside 28/58. Siste tre risikoprøver er kjørt på nytt etter den avgrensede felleshenvisningsvakten, se sluttkontrollen nedenfor. Build, typecheck og lint består med kun det eksisterende Vite-varselet om stor bundle.

## Sluttkontroll

[3/3 siste risikoprøver](unike-risikoforhold-2026-10-31/playwright-sluttkontroll.txt) bestod etter siste felleshenvisningsvakt. Ingen hoppede prøver i de målrettede kjøringene. Alle kravmatrisens scenarier har kjørt relevant positiv/negativ test. Hele tidligere fullsuite er ikke gjentatt; verifikasjonen er avgrenset til berørt funksjon, kilde-/importregresjon og økonomiens eksisterende oversiktsflyt, slik brukeren ba om.

Visuell kontroll: faktisk privat gruppering med side 28/58 og tydelige subjekter ble inspisert. [Desktop](unike-risikoforhold-2026-10-31/desktop.png) og [mobil med åpent funn](unike-risikoforhold-2026-10-31/mobile.png) er syntetiske bilder som kan versjoneres. Private skjermbilder/PDF-er er ikke tatt med i Git.

Den eksisterende serveren på port 3000 ble ikke restartet eller duplisert. Lytter PID 74821 og HTTP 200 er kontrollert; JS-bygg fra serveren matcher gjeldende dist-bygg med SHA-256. Endringen er frontendbasert og lastes ved ny sidelasting. Ingen betalte kall eller push. Automatisk promptlogg er uendret; nye terminalbevis har bare avsluttende whitespace normalisert.
