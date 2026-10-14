# Kildeuttrekk: Product Brief, addendum og faglærer

Opprettet 2026-10-13 for BMAD UX. Dette er et referat av kilder, ikke et designforslag eller nye krav. Oppstrøms dokumenter er kun lest. Linjenumre viser dokumentene slik de foreligger i denne økten. Den ferdigstilte PRD-en har forrang ved konflikt.

## Kildehierarki og faktisk leveransestatus

- [PRD](../../../prds/prd-IBE160-2026-10-10/prd.md), «Formål og arbeidsstatus», linje 1–16 og «Kildegrunnlag», linje 18–26: status **final**, stabile FR/NFR/S-ID-er, låste produktbeslutninger og senere godkjente PRD-presiseringer. Endring av låst retning krever avklaring med Mads. En ferdig PRD er ikke bevis på implementert eller testet produkt.
- [Product Brief](../../../briefs/brief-IBE160-2026-09-15/brief.md), «Sammendrag og visjon», linje 10–14; «Emnekontekst og videre avklaringer», linje 88–94: revidert, ferdig plan med låst kjerne fra 2026-10-08. Nåværende UX må bygge på ferdigstilt PRD, ikke på briefens daværende formulering om at PRD/UX ikke er startet.
- [Revisjonskontroll](../../../briefs/brief-IBE160-2026-09-15/revisjonskontroll-2026-10-08.md), «Kontroll av faglærerens tilbakemelding», linje 17–19: «løst i brief» betyr presisert plan; funksjonen er ikke dermed implementert eller testet. Samme forbehold står i [brief-addendum](../../../briefs/brief-IBE160-2026-09-15/addendum.md), «Kjørbarhet, kostnader og repo», linje 66–75.

## Produktvisjon, bruker og brukssituasjon

- **Beslutningsformål:** hjelpe investoren å prioritere hvilke objekter som fortjener videre undersøkelse. Langsiktig skal dokumenter, økonomi, marked og risiko sammenstilles til et sporbart beslutningsgrunnlag for løpende avkastning og forbedringspotensial. v1 leverer førstevurdering og tre anbefalinger; investoren tar neste handling. Kilde: brief, linje 12–14.
- **Primærbruker:** Mads/produkteieren som privat eiendomsinvestor i Norge, med kjennskap til leieinntekter, driftskostnader, lån og avkastningskrav, uten å være bygningssakkyndig. Briefen nevner utleieboliger og mindre bygårder; PRD begrenser denne reisen til ett allerede funnet boligutleieobjekt. Kilder: brief «Problemet og primærbrukeren», linje 16–20; PRD «Visjon og målgruppe», linje 28–34 og UJ-1, linje 76–82.
- **Arbeidskontekst:** desktop-webapp, ett objekt om gangen. Ved start har Mads kjøpesum, forventet leie, driftskostnader, finansieringsforutsetninger, minimumskrav og rapport tilgjengelig. Ingen dokumentert antakelse om mobil bruk, teamarbeid, innlogging eller varig lagring. Kilde: PRD «Låst v1-scope», linje 36–42; UJ-1, linje 80–89.
- **Nåværende belastning:** manuell lesing av annonser, salgsoppgaver og rapporter, sammenstilling av tall og 30–60 minutter per førstevurdering etter brukerens anslag. Rapport kan være rundt 30 sider. v1 skal redusere sammenstillingsarbeid og lette kontroll, uten å erstatte bygningsfaglig vurdering eller full due diligence. Kilde: brief, linje 18–20.

## Kvalitative UX-føringer som allerede er forankret

- **Sekvens og orientering:** registrer/bekreft → kontroller kildebelagte TG2/TG3 → les beregninger/anbefaling → forstå neste handling. Gjeldende steg og ufullstendighet skal være synlig. Anbefaling og begrunnelse først i resultatet, med tallgrunnlag, funn og mangler tilgjengelige for kontroll. Kilder: brief «Med i v1», linje 28–34; addendum «Bruksflate på briefnivå», linje 77–81. PRD UJ-1 konkretiserer kontroll og beregning, linje 84–97.
- **Troverdighet gjennom opphav:** rapportopplysning skal ha dokumentnavn og PDF-side; brukerforutsetning, mangel og KI-tolkning merkes separat. PDF-side er filposisjon fra 1, eventuelt trykt sidetall kun i tillegg. Korrigering synliggjøres med kilde. TG3-avklaringsstatus og begrunnelse er separate fra rapportfunnet. Kilder: brief «Troverdighet», linje 67–69; addendum «Kontroll mot dokumenter og KI-feil», linje 58–64; PRD FR-5/FR-8/FR-18.
- **Usikkerhet skal kunne forstås:** manglende uttrekk betyr ikke ingen avvik; uleselig side eller avbrutt analyse er mangel, aldri ferdig analyse. KI setter ikke nye tilstandsgrader eller reparasjonskostnader. Ukjent TG3-status er uavklart. Kilder: brief, linje 30–34 og 53–65; addendum, linje 44–49 og 60–64.
- **Etterprøvbarhet:** kilder og årsgrunnlag for verdier, etterprøvbare formler og konsekvent usikkerhetshåndtering er v1s verdiforslag. Tids- og kvalitetsgevinst er hypoteser, ikke dokumenterte konkurransefortrinn. Kilder: brief «What Makes This Different», linje 22–26; «Troverdighet og målbar suksess», linje 71–82.
- **Demo/live:** demo må merkes som lagret analyse og gi aktive beregninger/regler uten nett/API-nøkkel. Ny finansverdi gir ingen ny KI-analyse; uendret rapport gjenbruker uttrekk. Kilder: addendum, linje 68–72; PRD FR-6.
- **Grunnleggende tilgjengelighet:** konkrete feltetiketter/enheter, lokaliserte feil, tastaturhandlinger og synlig fokus, lesbar kontrast og meningsbærende status med tekst. Kilde: PRD NFR-2, linje 390–397. Det er ikke innført sertifiseringskrav.

## Langsiktig identitet og grensen mot v1

Produktet skal kunne vokse fra kontrollert førstevurdering til bredere eiendomsbeslutningsstøtte. Kildene fastsetter **ikke** logo, fargepalett, typografi, merkevarepersonlighet eller et bestemt visuelt referanseprodukt. Profesjonelt visuelt uttrykk er dermed en reell UX-avklaring fra dagens brukeroppdrag, ikke et låst krav i briefen.

Sourcing, flere dokumenttyper, teknisk kostnadsestimering, marked, DSCR/stresstesting, bred risiko, score/rangering, andre brukere og integrasjoner er kun langsiktige muligheter. De må ikke gjøres til v1-krav gjennom skjermbilder. Kilder: brief «Utenfor v1», linje 84–86; addendum «Langsiktige produktambisjoner», linje 83–97; PRD linje 36–42.

Historisk dashboard med Scout/Document/Condition/Finance/Risk/Supervisor/Human approval i [briefens memlog](../../../briefs/brief-IBE160-2026-09-15/.memlog.md), linje 10, er overstyrt av linje 12 og 15. Ugjennomgått konseptvideo og gamle scorepremisser er ikke gyldig designgrunnlag. Revisjonskontroll «Avstemming mot beslutningsloggen», linje 64–69, bekrefter dette.

## Faglærerens føringer og behandling

- [Tilbakemelding](../../../briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md), «Samlet vurdering», linje 16–25: behold menneskelig kontroll, kildehenvisninger, skillet fakta/estimater/antakelser og eksplisitt usikkerhet; avgrens omfang og lag egne skisser fremfor utilgjengelig video.
- «Forslag til justering», linje 70–73: tre sekvensielle steg og vanlige kodeberegninger, fremfor samarbeidende KI-agenter. Dette er allerede behandlet i brief/PRD; det skal ikke gjenåpnes som UX-alternativ.
- «Gjennomgang av briefens deler», linje 83–90 og «Utgangspunkt for del 1», linje 98–104: konkrete brukere, egne wireframes i repo, sporbarhet fra plan til app og kjørbar demo. Ønske om tidligere dashbord/objektvisning/decision brief skal tolkes innen den nyere, låste enkeltobjektflyten, uten ny objektoversikt eller historikkfunksjon.
- Revisjonskontroll, linje 33, 45 og 49–51: egne skisser gjensto bevisst til UX; synlig status, ufullstendighet og kostnadsfri demo er sentrale. Det historiske vurderingsgrunnlaget beskriver bredere funksjoner; det gir ikke pålegg om å gjeninnføre dem.

## Reelle, uløste UX-beslutninger til samtalen

1. Ønsket profesjonell visuell identitet: hvor nøkternt, kompakt eller visuelt uttrykksfullt skal kontrollarbeidet presenteres? Ingen konkret designreferanse er godkjent i kildene.
2. Mekanisme for rapportkontroll: tilgang via åpning/nedlasting eller PDF i arbeidsflaten? Begge kan dekke FR-8; innebygd leser og automatisk sidenavigering er ikke obligatorisk (PRD FR-8, linje 209–219).
3. Skjermoppdeling, navigasjon og desktop-størrelser: sekvensiell kjerne er låst, men antall skjermflater og detaljpresentasjon er ikke bestemt (PRD «Avklaringsstatus», linje 475–480).
4. Hvor mye beregnings-, kilde- og endringsdetalj skal være åpent ved første visning, og hva skal åpnes ved kontroll? All påkrevd informasjon må være tilgjengelig, men standard tetthet er ikke spesifisert.

Spørsmål om nye analyser, innlogging, varig lagring, score, endrede formler eller anbefalingsregler er produktendringer og faller utenfor dette kildeuttrekket og autorisert UX-arbeid.
