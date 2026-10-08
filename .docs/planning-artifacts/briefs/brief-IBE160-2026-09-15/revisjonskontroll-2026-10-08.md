# KI-arbeidsøkt og revisjonskontroll – 2026-10-08

## Oppdrag og kilder

Brukeren ba om å lese brief, tilhørende addendum og beslutningslogg, faglærerens tilbakemelding og sensorveiledningen før endring. Oppdraget var å revidere Product Brief med faglærerens tilbakemelding som hovedgrunnlag og sensorveiledningen som kvalitetsramme, beholde den langsiktige visjonen og avgrense v1 tydelig. Brukeren presiserte følgende:

> v1 skal være klart definert og realistisk, med tydelig skille mellom v1 og senere produktutvikling. v1 skal bruke en enkel sekvensiell analysepipeline og deterministiske finansberegninger i vanlig kode. Bruttoyield, NOI, nettoyield, kontantstrøm, kritisk informasjon og testbare regler for Forkast, Innhent mer informasjon og Gå videre skal defineres. What Makes This Different, tydeligere primærbruker og målbare suksesskriterier skal legges til. Henvisninger til utilgjengelig visuelt materiale skal fjernes. Emnet er IBE160 Programmering med KI. Market Agent, automatisk sourcing, investeringsscore, stresstesting og mer avansert agentarkitektur skal beholdes utenfor v1. Ikke start PRD, UX eller arkitektur. Kontroller punkt for punkt mot faglærerens tilbakemelding og rapporter endringer, løste punkter og gjenstående avklaringer før PRD.

Dette er et konsentrert referat av brukerprompten, ikke en ordrett transkripsjon. Kildene ble lest før produktdokumentene ble endret:

- [Opprinnelig og revidert brief](brief.md), [addendum](addendum.md) og [.memlog.md](.memlog.md); tidligere innhold finnes i git-historikken.
- [Faglærerens tilbakemelding 2026-10-06](tilbakemelding-product-brief.md), inkludert samlet vurdering, gjennomførbarhet, delgjennomgang, de sju vurderingskriteriene og neste steg.
- [Sensorveiledning, del 1](../../../reference/course/Sensorveiledning-IBE160-Del-1.pdf), alle sju sider. Særlig prosess/sporbarhet (30 %), funksjonalitet (20 %), testing (15 %), design (10 %), kode/arkitektur (10 %), README (10 %) og ryddighet (5 %). Vektene er veiledende; dokumentet er ikke en mekanisk sjekkliste.

Arbeidet brukte bmad-product-brief og ferdighetens pålagte struktur-/språkkontroll gjennom bmad-review. En egen kontrollagent leste brief og addendum og rapporterte ingen vesentlige redaksjonelle funn. Den kontrollerte ingen finansiell domenekorrekthet. Tallfasit, regelgrenser, kildelenker og samsvar med tilbakemeldingen ble kontrollert separat i hovedøkten.

## Kontroll av faglærerens tilbakemelding

«Løst i brief» betyr at planen er presisert, ikke at funksjonen allerede er implementert eller testet i en app.

| Tilbakemeldingspunkt | Status og konkret behandling |
|---|---|
| Behold tre anbefalinger og menneskelig kontroll, uten automatisk bud | Beholdt i sammendrag, v1-flyt og anbefalingsregler. Mennesket velger neste undersøkelse eller forkaster. |
| Behold kilder, skillet fakta/estimater/antakelser og alvorlige feilbilder | Beholdt og konkretisert i troverdighet, S1–S4 og addendumets kontrollpunkter. |
| MVP er for omfattende for semesteret | Løst i brief: ett objekt, manuelle tall, én rapportanalyse og fire nøkkeltall. Ingen full risikoanalyse, score, DSCR eller stresstesting. |
| Velg faglærerens tre steg | Løst i «Med i v1»: registrer/bekreft → TG2/TG3-uttrekk → finans og regelstyrt anbefaling. |
| Bruk sekvensiell pipeline fremfor samarbeidende agenter | Løst i v1. Opprinnelige agentroller er bare langsiktige muligheter i addendum. |
| Finans i vanlig kode med kjente fasitsvar | Løst i brief: deterministisk kode; utregnet fiktiv fasit og regelvarianter i addendum. |
| Uavklarte nøkkeltall, formler og kritiske opplysninger | Løst i egne seksjoner med fire formler, gyldighetsgrenser, brukerbekreftelse og konkrete stoppvilkår. Kjøpesum inkluderer eventuell fellesgjeld. |
| Uavklart scoremodell | Løst gjennom avgrensning: ingen score i v1. Scoremodell kreves først ved senere scorefunksjon. |
| Konkrete anbefalingsregler | Løst: mangler først, så avkastningskrav/kontantstrøm. Likhet, null, mangler, konflikt og uavklart TG3 har forventet utfall. |
| Rett emnekonteksten | Løst i brief: IBE160 Programmering med KI. Tidligere formulering er fjernet fra gjeldende produktdokumenter. |
| Erstatt utilgjengelig visuelt grunnlag | Fjernet fra gjeldende brief/addendum; flyten beskrives med egne ord. Egne skisser gjenstår til senere designarbeid fordi brukeren uttrykkelig utelukket å starte UX nå. Punktet om faktiske wireframes er derfor fortsatt åpent. |
| Executive Summary | Beholdt og skjerpet rundt konkret v1 og beslutningsformålet. |
| The Problem | Beholdt med manuell førstevurdering og brukerens tidsanslag. |
| The Solution | Tre konkrete brukersteg og beskrivelse av resultatflaten; ingen referanse til materiale som ikke finnes. Skisser er utsatt som ovenfor. |
| What Makes This Different mangler | Løst i egen seksjon: regneark, generelle chatboter og rådgivere, med nøkternt verdiforslag og uprøvde hypoteser merket. |
| Who This Serves trenger presisering | Løst med privat investor, forkunnskaper og prioriterte nøkkeltall. Kompetansebeskrivelsen er merket som arbeidsantakelse i addendum. |
| Success Criteria er ikke målbare | Løst med S1–S6: talltoleranser, alle TG3/minst 90 % TG2 med riktige sider, ingen oppdiktede funn, regelvarianter, sporbarhet, tidsmål og lokal kjørbarhet. |
| Scope: In for v1 / Explicitly out | Løst med separate seksjoner. Automatisk sourcing, Market Agent, score, stresstesting og avansert agentarkitektur er eksplisitt utenfor. |
| Vision er god og bør beholdes | Beholdt i sammendrag og langsiktige produktambisjoner. |
| Prosess og KI-styring (30 %) | Definisjoner og suksess-ID-er gir videre sporbarhet. Revisjon og overstyrte beslutninger logges. Jevnlige commits gjennom semesteret gjenstår som løpende praksis; ingen commit er laget i denne økten. |
| Funksjonalitet og omfang (20 %) | Redusert kjerne gir rom for implementering, testing og retting. Gjennomførbarhet er en planvurdering, ikke dokumentert leveranse. |
| Kvalitetssikring/testing (15 %) | Deterministiske tester og separat KI-evaluering er skilt. Fasittall og forventede regelutfall finnes. Faktiske rapportcaser og app-tester gjenstår. |
| Design/brukeropplevelse (10 %) | Primærbruker, kontrollbehov, synlig status og resultatinnhold er presisert. Egne skisser gjenstår; UX er ikke startet. |
| Kodekvalitet/arkitektur (10 %) | Kompleksitetskravet er redusert til sekvensiell flyt og finans utenfor KI. Konkret stakk og begrunnede arkitekturvalg gjenstår til autorisert arkitekturarbeid. |
| README/kjørbarhet (10 %) | Demomodus med fiktivt objekt og lagret KI-uttrekk, aktive beregninger og regler uten nøkkel/betalt konto er definert som leveransemål (S6). Faktisk README-oppskrift og demo gjenstår til implementering. |
| Ryddighet i repo (5 %) og personvern | Testdataplassering og dokumentasjonsplassering er planlagt. Fiktive data foretrekkes; ekte dokumenter krever vurdering før publisering. Nøkler/private originaler skal holdes utenfor git. |
| API-avhengigheter, kostnad, hurtigbuffer og mock | Ett eksplisitt analysekall per ny rapport, gjenbruk ved uendret rapport og kostnadsfri demo er beskrevet. Budsjett/modellpris må avklares før betalte tester. Mock og live-evaluering holdes atskilt. |
| Unngå ustabil annonseuthenting | Ingen annonselenke eller skraping i v1. |
| Uleselige PDF-er og asynkrone feil | Tekstbasert PDF inntil 30 sider, ingen OCR. Uleselige sider/avbrutt analyse stopper komplett anbefaling og gir informasjon om hva som mangler. |
| Neste steg 1: avgrens v1 | Utført. |
| Neste steg 2: formler, regler og utregnet testobjekt | Utført som utregnet fiktivt tallobjekt med fasit i addendum. Minst fire kontrollerte caser F1–F4 med tall-, dokument- og anbefalingsfasit er nå planlagt. Tilhørende PDF-er og maskinlesbare fasitfiler gjenstår. |
| Neste steg 3: differensiering, mål, emnekontekst, deretter PRD | Briefpunktene er utført. PRD er bevisst ikke startet etter brukerens instruks. |

## Verifikasjon ved første revisjon (erstattet tallfasit)

Tallene i dette avsnittet dokumenterer første revisjon og er erstattet av produkteierens låste formler nedenfor. Den daværende fasiten ble regnet uavhengig med Python Decimal: bruttoyield 11,585365… %, NOI 1 400 000 kr, nettoyield 8,536585… %, kontantstrøm 500 000 kr. De økonomiske variantene ble også regnet: Ymin 9 % gir Forkast; T 700 000 gir −100 000 kr; T 600 000 gir null og Gå videre; leie 1 648 000 gir nøyaktig 7 %, mens én krone mindre gir Forkast før avrunding. Kontantkjøp med R=A=0 gir 1 300 000 kr. Ingen appkode eller app-tester er opprettet eller kjørt.

Lenker i brief/addendum og git diff-formatering er kontrollert. Gjeldende brief og addendum har ingen gjenværende henvisninger til tidligere utilgjengelig visuelt materiale. Kildetilbakemeldingen og historiske beslutningsposter er bevart uendret som kilder/historikk; en ny loggpost overstyrer tidligere omfang og visuelle premisser.

Etter oppfølgingsbeslutningene nedenfor gjenstår ingen reelle åpne produktbeslutninger før PRD. Faktiske testdokumenter/fasitfiler og skisser hører til videre arbeid. Modell og kostnadstak må fastsettes før betalte live-tester. Ingen nye PRD-, UX- eller arkitekturdokumenter er opprettet.

## Avstemming mot beslutningsloggen

- Investeringsformål, investorens kontroll, tre utfall, kilder, usikkerhet og evaluering er videreført i briefen.
- Eksempelet med 16 millioner/1,9 millioner og de opprinnelige agentrollene er bevart i addendum; eksempelet har nå eksplisitte forutsetninger og fasit.
- Tidligere MVP-omfang og krav om samarbeidende agenter er overstyrt med begrunnelse i appendert loggpost. Langsiktige ambisjoner er ikke slettet.
- Historiske referanser og tidligere foreslått videre arbeidsflyt er historikk, ikke gjeldende produktpremisser. Ingen brukerinnspill er forkastet uten synlig behandling.

## Oppfølging: låste v1-beslutninger før PRD

Produkteieren ba i samme arbeidsøkt om nødvendige oppdateringer i brief, addendum og revisjonskontroll, og presiserte at PRD fortsatt ikke skulle startes. Oppfølgingspromptens beslutninger er gjengitt konsentrert i tabellen. De erstatter tidligere forslag om omkostningsjustert yield, separat ledighet, førsteårstiltak i kontantstrøm og 3–5 ennå uvalgte caser.

| Beslutning fra produkteieren | Oppdatering og kontroll |
|---|---|
| Bruttoyield = årlig brutto leie / kjøpesum | Brief og fasit bruker L/P; prosentvisning er 100 × forholdstallet. Ingen kjøpsomkostninger i nevneren. |
| NOI = årlig brutto leie − årlige eierbetalte driftskostnader | Brief og fasit bruker L−D; separat ledighetsfratrekk er fjernet. |
| Nettoyield = NOI / kjøpesum | Brief og fasit bruker NOI/P; brukerens minimumskrav angis i prosent med konsekvent enhetsomregning. |
| Kontantstrøm før skatt = NOI − årlig gjeldsbetjening | Brief og fasit bruker NOI−J. J omfatter renter og avdrag. Særskilte reparasjonstiltak er fjernet fra formelen og fra obligatoriske inndata. |
| Beregninger i vanlig kode | Beholdt og uttrykkelig presisert; KI beregner ikke nøkkeltall eller bestemmer økonomisk utfall. |
| Manglende/motstridende kritisk informasjon gir Innhent mer informasjon | Kritiske tall er nå P, L, D, J og Ymin. Rapportanalyse, brukerbekreftelse og TG3-avklaringsstatus inngår fortsatt. Regel 1 har høyest prioritet. |
| Alvorlig TG3 med avklaringsbehov gir Innhent mer informasjon | Presisert med status/begrunnelse per relevant funn. Ukjent status regnes som uavklart. Ingen obligatorisk reparasjonskostnad eller teknisk godkjenning innføres. |
| Svak nettoyield eller negativ kontantstrøm gir Forkast | Regel 2 bruker nettoyield < Ymin eller kontantstrøm < 0 når informasjon og teknisk grunnlag er tilstrekkelig. |
| Tilstrekkelig grunnlag og oppfylte økonomiske krav gir Gå videre | Regel 3 bruker nettoyield ≥ Ymin og kontantstrøm ≥ 0. Likhet med grenseverdiene er dekket i fasiten. |
| Screening, ikke investeringsbeslutning | Presisert i brief og videreført menneskelig kontroll. |
| KI analyserer tilstandsrapportens relevante TG2/TG3 med beskrivelse og korrekt side | Presisert i v1-flyt og dokumentkontroll. Ingen reparasjonsestimering, markedsanalyse, juridisk analyse eller automatisert helanalyse av salgsoppgaven i v1. Disse ambisjonene er beholdt utenfor v1. |
| Minst fire kontrollerte caser med forhåndsdefinert fasit | F1 komplett/Gå videre; F2 økonomisk svakt/Forkast; F3 manglende leie/Innhent mer informasjon; F4 kjent TG3 på PDF-side 4, med uavklart alvorlig funn/Innhent mer informasjon. Alle har planlagt dokumentfasit, tallgrunnlag og forventet anbefaling. |

### Ny verifikasjon

Uavhengig kontroll med Python Decimal gir F1: bruttoyield 11,875 %, NOI 1 500 000 kr, nettoyield 9,375 %, kontantstrøm 700 000 kr. F2: bruttoyield 8,75 %, NOI 1 000 000 kr, nettoyield 6,25 %, kontantstrøm 200 000 kr, og Forkast ved Ymin 7 %. F3 har ingen leieavhengige beregninger. F4 har tall som F1, men avklaringsbehovet gir Innhent mer informasjon.

Grensekontroll: L=1 520 000 gir nøyaktig 7 % nettoyield og Gå videre; én krone mindre gir Forkast før avrunding. J=1 500 000 gir null kontantstrøm og Gå videre, mens én krone mer gir Forkast. J=0 gir 1 500 000 kr i kontantstrøm. Motstrid, mangler og uavklart TG3 prioriteres foran økonomiske utfall. Dette kontrollerer dokumentenes fasit; appkode, PDF-fixtures og app-tester er ikke laget i denne oppdateringen.

### Vurdering før PRD

Ingen reelle åpne produktbeslutninger blokkerer PRD. Formler, screeningregler, KI-omfang og minimumsopplegg for evaluering er låst. Den eksisterende inputavgrensningen til tekstbasert PDF inntil 30 sider videreføres; brukerkompetanse kan presiseres i PRD uten å endre kjernen. Å lage testdokumentene og fasitfilene, planlegge egne skisser og velge modell/kostnadsramme er gjennomføringsarbeid. PRD er ikke startet.
