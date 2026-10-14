# Kildeuttrekk til BMAD UX: ferdigstilt PRD og PRD-kontroller

Dato: 2026-10-13. Arbeidsgrunnlag for UX-workflowen, ikke en ny kravkilde eller et designforslag. Ingen oppstrømsfiler er endret. Ingen arkitektur, epics, stories, implementering, produkttest eller live-analyse er gjennomført.

## Leste kilder og presedens

Alle dokumentene i `.docs/planning-artifacts/prds/prd-IBE160-2026-10-10/` er lest: `prd.md`, `addendum.md`, `.memlog.md`, `beslutningsavstemming.md`, `kildegrunnlag.md`, `kildeuttrekk-sensorveiledning.md`, de fem `reconcile-*.md`-filene, `review-rubric.md`, `review-structure.md`, `review-prose.md` og `sluttkontroll.md`.

Henvisninger nedenfor bruker filnavn innen denne PRD-mappen, seksjonsnavn og faktiske linjer. Primærhenvisning: [prd.md](../../../prds/prd-IBE160-2026-10-10/prd.md). Test-/målefasit: [addendum.md](../../../prds/prd-IBE160-2026-10-10/addendum.md).

- PRD og PRD-addendum har `status: final`, opprettet/oppdatert 2026-10-10. UJ-1, FR-5–FR-18, NFR-1–NFR-5 og S1–S6 er godkjent; FR-1–FR-4 er avledet fra låst brief og bekreftet UJ-1. Kilde: `prd.md`, § Formål og arbeidsstatus, linje 1–16; `addendum.md`, linje 1–10.
- Gjeldende revidert brief, oppfølgingen 2026-10-08 og senere godkjente PRD-presiseringer har forrang foran historiske forslag og erstattet tallfasit. PRD-memlog og kontrollfiler er prosessbevis, ikke selvstendige nye krav. Kilde: `prd.md`, § Kildegrunnlag, linje 18–26; `reconcile-revisjonskontroll.md`, linje 3–9; `beslutningsavstemming.md`, linje 17–25.
- Produktbeslutninger, scope, finansregler og anbefalingslogikk kan ikke endres gjennom UX. PRD angir at slike endringer krever avklaring med Mads. Kilde: `prd.md`, § Formål og arbeidsstatus, linje 12–16.
- Historiske omtaler av sju agenter, DSCR, score og fire risikoområder i faglærertilbakemeldingen er problemfunn fra en eldre brief; de er ikke gjeldende krav. Kilde: `reconcile-faglaerer.md`, linje 3–14.
- Fem sluttavstemminger og sluttkontrollen identifiserte ingen reelle kravhull, interne produktmotsigelser eller scope-glidning. Dette er dokumentkontroll, ikke bevis for et implementert produkt. Kilde: `sluttkontroll.md`, § Motsigelser og scope / BMAD-kvalitetskontroll, linje 13–27; `review-rubric.md`, § Overall verdict, linje 3–5.

## Produkt og kontekst som allerede er bestemt

Desktop-webapp for en privat eiendomsinvestor i Norge som allerede har funnet ett boligutleieobjekt. Primærbrukeren Mads kjenner leie, driftskostnader, lån og avkastningskrav, men er ikke bygningssakkyndig. Oppgaven er en førstevurdering: forkaste objektet, innhente mer informasjon eller bruke mer tid på grundigere vurdering. Sporbarhet, etterprøvbar økonomi og konsekvent usikkerhetshåndtering er den låste v1-verdien; tids- og kvalitetsgevinst er evalueringsmål, ikke dokumenterte fordeler. Kilde: `prd.md`, § Visjon og målgruppe, linje 28–34.

Det finnes én gjeldende vurdering av ett manuelt registrert objekt om gangen. Innlogging, varig lagring av vurderinger og lagring av investeringsbeslutning er ikke v1-leveransekrav. Nødvendig teknisk håndtering av aktuell rapport/uttrekk hører til senere arkitektur. Kilde: `prd.md`, § Låst v1-scope og ikke-mål, linje 36–42.

## Navn og stabil trace, ordrett fra PRD

| ID | Ordrett tittel | Linje i `prd.md` |
|---|---|---:|
| UJ-1 | Mads førstevurderer ett boligutleieobjekt | 76 |
| FR-1 | Registrere finansverdier for ett objekt | 107 |
| FR-2 | Synliggjøre kilder, forutsetninger og kostnadsinnhold | 118 |
| FR-3 | Validere tall og skille null fra manglende verdi | 129 |
| FR-4 | Kontrollere og bekrefte tallgrunnlaget | 141 |
| FR-5 | Registrere og anvende brukerbekreftet TG3-avklaring | 158 |
| FR-6 | Analysere én støttet tilstandsrapport | 185 |
| FR-7 | Trekke ut alle eksplisitte TG2- og TG3-funn | 197 |
| FR-8 | Vise kilde og gjøre originalrapporten tilgjengelig for kontroll | 209 |
| FR-9 | Synliggjøre usikkerhet og ufullstendig analyse | 221 |
| FR-10 | Korrigere eller avvise KI-funn med bevart opprinnelse | 235 |
| FR-11 | Bekrefte gjeldende rapportgrunnlag før screening | 248 |
| FR-12 | Beregne de fire låste økonomiske nøkkeltallene | 270 |
| FR-13 | Vise bare beregninger med gyldig grunnlag | 284 |
| FR-14 | Gjøre beregninger etterprøvbare og bevare presisjon | 297 |
| FR-15 | Beregne på nytt etter endret finansgrunnlag | 309 |
| FR-16 | Bestemme én anbefaling med låst regelprioritet | 331 |
| FR-17 | Forklare anbefaling, utløste regler og neste handling | 346 |
| FR-18 | Presentere et sammenhengende og gjeldende beslutningsgrunnlag | 358 |

Relevant kvalitetsgrunnlag: NFR-1 «Stabilitet og etterprøvbar regelkjøring» (linje 381), NFR-2 «Forståelig desktop-flyt og grunnleggende tilgjengelighet» (390), NFR-3 «Lokal kjørbarhet og kostnadsfri demo» (399), NFR-4 «Hemmeligheter og testdata» (408), NFR-5 «Tidsbruk i førstevurderingen» (416). S1 «Beregninger» (433), S2 «Dokumentfunn» (437), S3 «Mangler og regler» (441), S4 «Sporbarhet i resultatet» (445), S5 «Tidsbruk» (449), S6 «Kjørbarhet» (455).

## Den låste sekvensielle brukerreisen

UJ-1 har fire logiske steg. Stegantallet er ikke et ferdig skjermantall; navigasjon og visuell oppdeling er UX-valg. Kilde: `prd.md`, § UJ-1, linje 84–97; § Avklaringsstatus, linje 477–479.

| UJ-1-steg | Bestemt arbeid og informasjon | Kravkoblinger fra PRD |
|---|---|---|
| 1 | Registrer finansverdier manuelt og last opp tilstandsrapport. Kontroller og bekreft tall før hovedreisens rapportanalyse fortsetter. Finansieringsforutsetninger er brukerens grunnlag for J, ingen automatisk låneberegning. | FR-1–FR-4, FR-15 |
| 2 | Analyser rapporten. Vis alle eksplisitte TG2/TG3 med kort beskrivelse, dokumentnavn og PDF-side. Brukeren kontrollerer mot original, korrigerer/avviser ved behov, håndterer alvorlig TG3-status og bekrefter gjeldende liste. Ukjent TG3-status er uavklart. | FR-5–FR-11 |
| 3 | Vanlig kode beregner bruttoyield, NOI, nettoyield og kontantstrøm før skatt fra gyldige bekreftede verdier. Inputgrunnlaget er kontrollerbart. Manglende input gir ingen komplette avhengige beregninger. | FR-12–FR-15 |
| 4 | Vis én anbefaling, kort begrunnelse, regler, økonomi/input, alle aktive funn/kilder og mangler/konflikter. Brukeren avgjør videre investeringstiltak selv. | FR-16–FR-18 |

Ufullstendig grunnlag må kunne synliggjøres med «Innhent mer informasjon». Bekreftelseskravet før hovedreisen skal ikke gjøre visning av mangler umulig. Kilde: `prd.md`, § UJ-1 feilforløp, linje 95; § FR-4, linje 143–150. UX må bevare både normal sekvens og et forståelig mangel-/feilforløp; detaljert navigasjon i dette forløpet er ikke fastsatt.

## Felt- og informasjonsgrupper som UX må dekke

### Finansgrunnlag

| Felt | Låst betydning, enhet og periode | Validering |
|---|---|---|
| P | Totalpris inklusive eventuell fellesgjeld, uten kjøpsomkostninger; NOK | > 0 |
| L | Brutto leieinntekt; NOK, år eller måned med ×12 til årsgrunnlag | ≥ 0 |
| D | Eierbetalte driftskostnader; NOK, år eller måned med ×12; ingen renter/avdrag, ingen dobbelttelling | ≥ 0 |
| J | Renter og avdrag inklusive eventuell fellesgjeld; NOK, år eller måned med ×12 | ≥ 0 |
| Ymin | Brukerens minimumskrav til nettoyield; prosent; annualiseres ikke | ≥ 0 |

Kilder: `prd.md`, § Begreper, linje 50–58; § FR-1, linje 109–116; § FR-3, linje 135–139; § FR-12, linje 276–282.

- Verdiene gjelder samme objekt og samme år. Periode, omregningsfaktor og anvendt årsverdi skal være synlige. Ukjent/ustøttet periode eller ulike år er ikke gyldig felles årsgrunnlag. P og Ymin omregnes ikke med 12. Kilde: § FR-1, linje 109–115; § FR-12, linje 276–282; `addendum.md`, § Beregninger, BT-15/BT-16, linje 70–71.
- Hver verdi har synlig kilde eller brukerforutsetning. Forventet leie fremstilles ikke som dokumentert faktisk leie uten støtte. Kostnadsinnhold i D kan skilles slik at allerede inkluderte poster ikke telles på nytt. Kilde: `prd.md`, § FR-2, linje 120–127.
- Renter/avdrag i felleskostnader inngår i J og ikke samtidig i D. Eksempel i PRD: 120 000 kr felleskostnader, hvorav 20 000 gjeldsbetjening, gir 100 000 til D og 20 000 til J. Eksemplet er ikke en ny obligatorisk kalkulator. Kilde: § FR-2, linje 125–126; `.memlog.md`, linje 13.
- Ved to uløste kildeverdier for et kritisk felt vises konflikten; systemet velger ikke en kilde automatisk. Kilde: § FR-2, linje 127.
- Blank er manglende, aldri null eller skjult standard. Null krever eksplisitt bekreftelse; bekreftet J = 0 ved kontantkjøp er gyldig. Ikke-numerisk og negative L/D/J/Ymin er ugyldig. Kilde: § FR-1, linje 116; § FR-3, linje 135–139.
- Før tallbekreftelse er verdier, enheter, perioder, omregnet årsgrunnlag og kilder/forutsetninger tilgjengelige. Registrering alene er ikke bekreftelse. Kilde: § FR-4, linje 143–150.

PRD bestemmer ikke en ekstra objektmetadata-pakke, obligatorisk adressefelt, bestemte forhåndsdefinerte kostnadsposter, en finansieringskalkulator eller et separat skjemaår-felt. Det er årsgrunnlagets gyldighet og etterprøvbarhet som er låst; feltmekanismen må konkretiseres innenfor dette.

### Rapport og KI-funn

- Én tekstbasert PDF-tilstandsrapport, høyst 30 sider. Gjeldende rapport identifiseres. 30 sider godtas, 31 avvises. Andre formater, manglende lesbart tekstlag og OCR-behov er dokumentfeil. Kilde: `prd.md`, § FR-6, linje 187–195.
- Eksplisitt «Start analyse» er brukerhandlingen som starter analysen. I live-modus ett kall per ny rapport, uten automatiske omkjøringssløyfer. Uendret rapport gjenbruker uttrekket. Kilde: § FR-6, linje 194; § NFR-5, linje 420.
- Funnets informasjon: tilstandsgrad fra rapporten, kort beskrivelse uten udokumenterte konsekvenser/vurderinger, dokumentnavn og PDF-side. Alle eksplisitte TG2/TG3 omfattes; KI filtrerer ikke på investor-relevans eller setter egen grad. Rapportanalyse endrer/fyller ikke finansverdier. Kilde: § FR-7, linje 199–207.
- «KI-uttrekk fra rapport» er kildemerking, ingen brukerbekreftelse. PDF-side er filposisjon fra 1. Trykt sidetall kan vises i tillegg, tydelig skilt. Kilde: § Begreper, linje 59–65; § FR-8, linje 215–219.
- Originalrapporten er tilgjengelig under kontroll, for eksempel ved åpning eller nedlasting. Innebygd PDF-leser og automatisk sidenavigasjon er uttrykkelig ikke påkrevd. Kilde: § FR-8, linje 211–219.
- Manglende kilde, side utenfor dokumentet og kjent motstrid er mangel eller usikkert KI-uttrekk. Usikkerhet er knyttet til aktuelt funn/side, med kjent årsak. Ukjent årsak, grad, side eller beskrivelse gjettes ikke. Kilde: § FR-8, linje 218; § FR-9, linje 227–233.
- Korrigering gjelder grad, beskrivelse og PDF-side mot originalrapporten. Gjeldende korrigering er «brukerkorrigert» med rapportkilde. Opprinnelig KI-grad/beskrivelse/kilde beholdes tilgjengelig sammen med korrigeringen. Kilde: § FR-10, linje 241–246.
- Feilaktig KI-funn kan eksplisitt avvises. «Brukeravvist» og originalt uttrekk forblir tilgjengelig; avvist funn inngår ikke som aktivt bekreftet funn. Avvisning av KI-feil er ikke avklaring av en faktisk teknisk mangel. Kilde: § FR-10, linje 243–246.
- Det kreves bekreftelse av gjeldende kontrollerte liste. Fullført KI-kall er ikke bekreftelse. Listen og aktive funn viser kontrollstatus; originale KI-funn og brukerendringer kan fortsatt sees. Kilde: § FR-11, linje 250–258.

### Brukerbekreftet TG3-avklaring

- Registreres per alvorlig TG3-funn. Gyldig Avklart krever eksplisitt statusvalg, ikke-tom kort begrunnelse og ikke-tom beskrivelse av konkret avklaringsgrunnlag; bare mellomrom er tomt. Mangler identifiseres. Uavklart, ukjent, manglende eller ugyldig status behandles som Uavklart. Kilde: `prd.md`, § FR-5, linje 162–169.
- Grunnlag registreres som brukeroppgitt tekst; kan være fagperson, selger eller annen konkret dokumentasjon. V1 krever ingen ekstra opplasting eller automatisk dokumentanalyse. Systemet verifiserer ikke ekstern informasjon. Elektrikereksemplet er ikke obligatorisk fagkontroll for alle TG3. Kilde: § FR-5, linje 167 og 177; `addendum.md`, § TG3-avklaring, linje 16.
- Avklaringen vises separat som «brukerbekreftet avklaring for førstevurdering», med status, begrunnelse, grunnlag og det opprinnelige funnets beskrivelse/dokument/PDF-side. Den fjerner ikke TG3-graden og betyr ikke nødvendigvis utbedret eller teknisk godkjent. Kilde: § FR-5, linje 170–172.
- Listebekreftelse avklarer ikke TG3 automatisk. Håndtert status kan fortsatt være Uavklart; brukerens kontroll kan fullføres og resultatet bli Innhent mer informasjon. Kilde: § FR-11, linje 258; § NFR-5, linje 424; `addendum.md`, TT-5, linje 122.

## Informasjonens opprinnelse og ansvar

| Opprinnelse/aktør | Det som er låst | Det som ikke kan fremstilles som denne opprinnelsen |
|---|---|---|
| Originalrapport | Kilde for eksplisitte grader og kontrollerbare dokumentfunn | KI-gjetninger, kilde uten støtte og brukerens eksterne TG3-avklaring |
| KI | Opprinnelig rapportuttrekk og eventuell usikkerhet; beholdt før retting/avvisning | Kodeberegninger, anbefaling/regler/begrunnelse, bekreftet faktum uten kontroll |
| Bruker | Manuelle tall og kilder/forutsetninger; kontroll/bekreftelse; retting/avvisning; TG3-status/begrunnelse/grunnlag | Systemverifisert ekstern informasjon, ny faglig tilstandsgrad eller teknisk godkjenning |
| Vanlig kode | Validering, annualisering, fire formler, én prioritert anbefaling, alle utløsere på avgjørende nivå, regelbegrunnelse og anbefalingsbundet neste handling | Ny KI-generert omskriving av anbefaling, teknisk klassifisering eller investeringsbeslutning |

Kilder: `prd.md`, § Begreper, linje 61–72; § FR-5, linje 162–177; § FR-7–FR-11, linje 199–258; § FR-12, linje 278; § FR-16/FR-17, linje 337–356; § FR-18, linje 365–369.

## Kodeberegninger og etterprøving

| Nøkkeltall | Låst formel | Nødvendige gyldige bekreftede verdier | Visningsenhet |
|---|---|---|---|
| Bruttoyield | L/P | P, L | prosent (×100) |
| NOI | L−D | L, D | NOK/år |
| Nettoyield | (L−D)/P | P, L, D | prosent (×100) |
| Kontantstrøm før skatt | L−D−J | L, D, J | NOK/år |

Kilde: `prd.md`, § FR-12, linje 272–282; § FR-13, linje 290–295.

- Formel og anvendte verdier er tilgjengelige med enheter, årsgrunnlag, kilder/forutsetninger, periode, eventuell faktor og omregnet verdi. Brukeren skal forstå dette uten å lese kode. Kilde: § FR-14, linje 303–307.
- Ikke beregnbart nøkkeltall viser konkret manglende/ugyldig/motstridende/ubekreftet input, aldri null, estimat eller gammelt resultat. Manglende L hindrer alle fire. Manglende J hindrer bare kontantstrøm hvis P/L/D ellers er gyldige. Manglende Ymin hindrer screening, men ikke de fire tallene. P = 0 hindrer yield; andre gyldige beregninger kan vises som delgrunnlag. Kilde: § FR-13, linje 290–295.
- Negative gyldige resultater beholdes. Avrunding gjelder bare visning, aldri mellomregning eller regelgrunnlag. Synlig presisjon må tillate kontroll av S1 (≤1 kr / ≤0,01 prosentpoeng avvik mot fasit), uten at dette blir terskelmargin. Kilde: § FR-12, linje 280–281; § FR-14, linje 305–307; § S1, linje 435.
- Ingen kjøpsomkostninger i P, separat ledighetsfratrekk, særskilt reparasjonskostnad, skatt, verdiendring, automatisk låneplan eller kostnadsestimering inngår. Kilde: § FR-12, linje 279.

## Anbefaling og gjeldende resultatinnhold

Når screening vises, finnes nøyaktig én gjeldende anbefaling. Anbefaling, regler, begrunnelse og anbefalingsbundet neste handling produseres i kode fra samme gjeldende kontrollerte grunnlag, uten KI-generering eller omskriving. Kilde: `prd.md`, § FR-16, linje 333–344; § FR-17, linje 352–356.

| Prioritet | Låst betingelse | Utfall og innhold |
|---|---|---|
| 1 | Kritisk grunnlag mangler, er ugyldig, motstridende eller ubekreftet; rapportanalyse ufullført/feilet, kritisk KI-usikkerhet uløst, kilde utilstrekkelig, alvorlig TG3 uavklart | Innhent mer informasjon. List alle kjente utløsende forhold på dette nivået med berørt felt/funn og nødvendig korrigering, bekreftelse, innhenting eller avklaring. |
| 2 | Prioritet 1 gjelder ikke; nettoyield < Ymin eller kontantstrøm før skatt < 0 | Forkast. Vis yield mot Ymin og/eller kontantstrøm mot 0. Begge brudd vises når begge gjelder. |
| 3 | Grunnlaget er tilstrekkelig, ingen blokkerende teknisk usikkerhet og prioritet 2 gjelder ikke; nettoyield ≥ Ymin og kontantstrøm ≥ 0 | Gå videre. Vis økonomiske krav oppfylt og teknisk grunnlag tilstrekkelig for screening. Neste handling er grundigere vurdering eller befaring. |

Kilder: § FR-16, linje 338–344; § FR-17, linje 352–356. Informasjonsmangel overstyrer også svake delresultater. TG2/TG3 er ikke automatisk Forkast. Gyldig TG3-avklaring gir ikke automatisk Gå videre. Eksakt Ymin-likhet og kontantstrøm 0 passerer; regler bruker uavrundede verdier. Hvis avrundet visning skjuler et terskelbrudd, forklares dette. Kilder: § FR-5, linje 172; § FR-14, linje 305–307; § FR-16, linje 339–343; § FR-17, linje 354.

Resultatets låste innhold:

1. Anbefaling og kort regelbegrunnelse øverst.
2. Alle beregnbare nøkkeltall med tilgang til formel og input; ikke-beregnbare tall med årsak.
3. Alle aktive TG2/TG3 med grad, beskrivelse, dokumentnavn og PDF-side; originalrapport og originalt KI-uttrekk tilgjengelig.
4. Brukerens rettinger/avvisninger og TG3-avklaring tilgjengelig, skilt fra originalt KI-funn og rapportkilde.
5. Mangler, konflikter, usikkerhet og dokument-/analysefeil; feil forblir synlige selv om økonomiske delberegninger finnes.
6. Gjeldende steg og ufullført analyse/kontroll/bekreftelse; delberegninger merket som delgrunnlag.
7. Demo fortsatt tydelig merket som lagret analyse.

Kilde: `prd.md`, § FR-18, linje 364–369. Det kreves et forståelig samlet beslutningsgrunnlag, ikke et nytt generert PDF-rapportprodukt eller eksportfunksjon. Resultatet inneholder ingen investeringsscore, markedsverdipåstand, juridisk lovlighet eller samlet investeringskvalitet. Gå videre er førstevurdering, ingen kjøpsanbefaling eller teknisk godkjenning. Kilde: § FR-17, linje 355–356; § FR-18, linje 369–373.

## Endringer, bekreftelse og gjenbruk

| Endring/hendelse | Låst konsekvens |
|---|---|
| Finansverdier endres | Endrede verdier krever ny kontroll/bekreftelse. Berørte tall beregnes på nytt fra gjeldende bekreftet grunnlag. Gammelt resultat er ikke gjeldende for nye verdier. Uendret rapportuttrekk og kontrollstatus gjenbrukes uten KI-kall. |
| Bare Ymin endres | Fire nøkkeltall uendret; ny anbefaling etter kontroll/bekreftelse og ny terskelvurdering. |
| Funn korrigeres eller avvises | Originalt uttrekk beholdes; ingen KI-kjøring. Etter tidligere listebekreftelse kreves ny bekreftelse av endret liste. |
| Ny rapport erstatter gammel | Ny analyse kreves. Gammel funnliste, bekreftelser og TG3-avklaringer er ikke gjeldende for ny rapport. |
| TG3-status eller nødvendig begrunnelse/grunnlag endres | Anbefaling bygger på nytt grunnlag; tidligere anbefaling er ikke gjeldende. Uavklart eller tom nødvendig tekst kan gi prioritet 1. |
| Samme bekreftede grunnlag/regler brukes igjen | Nøyaktig samme kodeberegnede tall, anbefaling, regelgrunnlag, begrunnelse og anbefalingsbundet neste handling. Dette krever ikke deterministisk KI-uttrekk ved en ny analyse. |

Kilder: `prd.md`, § FR-5, linje 173; § FR-6, linje 193–195; § FR-10, linje 246; § FR-11, linje 256; § FR-15, linje 315–319; § FR-16, linje 344; § FR-18, linje 367; § NFR-1, linje 385–388. `addendum.md`: RT-3/RT-4/RT-14, linje 32–33/43; BT-12/BT-13, linje 67–68; AT-16/AT-19, linje 96/99.

Hvordan gammelt resultat fjernes/merkes og hvordan brukeren føres tilbake til nødvendig kontroll er en åpen UX-mekanisme. UX kan ikke bevare en gammel anbefaling som gjeldende mens den nye informasjonen er ubekreftet.

## Feil-, tom-, usikkerhets- og lastetilstander

| Tilstand | Kildebestemt betydning og konsekvens | Belegg |
|---|---|---|
| Manglende/ugyldig tall | Felt identifiseres med hva som må rettes/bekreftes. Blank er manglende. Avhengig nøkkeltall er ikke beregnbart. Innhent mer informasjon. | FR-3, linje 135–139; FR-13, 290–295 |
| Tall kildekonflikt | Begge uløste kildeverdier synliggjøres som konflikt; ingen automatisk kildevalg eller gyldig berørt beregning. | FR-2, linje 127; FR-13, 290 |
| Ingen rapport / ustøttet dokument | Dokumentfeil med kjent årsak/v1-avgrensning, ufullstendig teknisk grunnlag; ikke analyseres som støttet input. | FR-6, 192; FR-9, 229–233 |
| Én uleselig side/tekst | Dokumentfeil og ufullstendig analyse; eventuelle funn er delresultater, ingen påstand om fravær på uleselig side. | FR-9, 227–233; addendum RT-9, 38 |
| KI-kall feilet/avbrutt | Analysefeil, kjent årsak når tilgjengelig, ufullstendig grunnlag; ikke vellykket tom liste. | FR-9, 229–233; addendum RT-19, 48 |
| Manglende/tomt/ufullført KI-uttrekk | Er ikke automatisk «ingen TG2/TG3». Manglende/ufullført analyse kan ikke gi komplett teknisk grunnlag. | FR-9, 231–233 |
| Vellykket analyse uten TG2/TG3 | Må skilles fra feil. Tom liste kan først gi tilstrekkelig rapportgrunnlag etter fullført analyse uten slike feil og brukerens kontroll/bekreftelse. | FR-9, 231/233; addendum RT-10, 39 |
| Usikkert uttrekk/kilde uten støtte | Vis usikkerhet ved funn/side og kjent årsak. Ingen gjettet grad/side/beskrivelse. Uløste kritiske forhold blokkerer komplett screening. | FR-8, 218; FR-9, 227–232 |
| Avklart uten nødvendig tekst | Vis manglende avklaringsfelt; ugyldig avklaring behandles som uavklart. | FR-5, 166–169 |
| Ubekreftet funnliste | Synlig status. Innhent mer informasjon; gyldige tall bare delgrunnlag. | FR-11, 254–258 |
| Analyse/kontroll ufullført | Gjeldende steg og ufullført status synlig. Ikke fullført analyse eller bekreftet liste. | FR-18, 368; NFR-5, 421–425 |

Alle henvisninger uten annet filnavn er til `prd.md`. Dokument-/analysefeil forsvinner ikke ved korrigering, avvisning eller listebekreftelse. En KI-konfidensprosent kan ikke alene oppheve usikkerhet/konflikt/bekreftelsesbehov. Kilde: § FR-9, linje 230–232. Mangler og teknisk usikkerhet kan gi Innhent mer informasjon selv med beregnbare sterke eller svake økonomitall. Kilde: § FR-13, linje 294–295; § FR-16, linje 338–343.

PRD låser ingen prosentbasert fremdriftsindikator, estimert gjenstående analysetid, polling, animasjon, avbrytknapp, automatisk omkjøring eller detaljert gjenprøvingsknapp. Lastetilstanden må sannferdig uttrykke ufullført analyse, og fullføringstidspunktet er først når den ferdige listen er synlig. Mekanismen er UX-arbeid; tekniske detaljer er senere arkitektur.

## Tilgjengelighet, desktop og demo

- Synlige skjemaetiketter, tydelige enheter/perioder og feil som identifiserer felt og forklarer handling. Kilde: `prd.md`, § NFR-2, linje 394.
- Kjernehandlinger kan gjennomføres med tastatur og synlig fokus. Anbefaling, feil, usikkerhet og bekreftelsesstatus uttrykkes med tekst, ikke bare farge. Kilde: § NFR-2, linje 395.
- Lesbar kontrast; tekstalternativ for eventuelle meningsbærende bilder. Desktop-oppsett skjuler ikke tall, kilder og kontroller. Relevante desktop-størrelser og praktisk kontrast konkretiseres i UX. Ingen mobilapp eller standardsertifisering er innført. Kilde: § NFR-2, linje 392–397; § Avklaringsstatus, linje 479; `review-rubric.md`, § Done-ness clarity, linje 39–45.
- Manuell testplan omfatter tastaturflyt, etiketter, kontrast, feil-/tomtilstander, usikkert funn og forståelse av de tre anbefalingene. Dette er framtidig verifikasjon av UX, ikke påstått testet. Kilde: § NFR-2, linje 397.
- Lokal demo gjennomfører hele flyten med fiktivt objekt, støttet rapport, tydelig merket lagret KI-uttrekk og aktive kodeberegninger/regler, uten nettverk eller nøkkel etter installasjon. Endringer kan demonstrere alle tre anbefalinger med nødvendige kontroller/bekreftelser. Live KI er valgfritt; manglende nøkkel hindrer ikke demo. Kilde: § FR-6, linje 195; § FR-15, linje 319; § NFR-3, linje 403–406.
- Lokal live-nøkkel vises ikke i brukerflater; ingen nøkkeladministrasjonsreise eller nye roller innføres. Fiktive testdata foretrekkes, private originaler utenfor Git. Kilde: § NFR-4, linje 412–414.

## Tidsmål som påvirker kontrollflyten

S5 måler median vellykket hovedanalyse ≤5 minutter og median fullført menneskelig kontroll ≤10 minutter for dokumenterte kontrollerte caser; det er ikke en garantert maksimal responstid for hvert tilfelle. Kilde: `prd.md`, § NFR-5, linje 418–427; § S5, linje 451.

- Start analyse trykkes etter gyldige bekreftede nøkkeltall og ferdig opplastet støttet rapport.
- Analyse er ferdig først når funnlisten med beskrivelser, PDF-sider og eventuell usikkerhet er klar og synlig.
- Kontroll starter samtidig som listen blir tilgjengelig og stopper etter kontroll, eventuelle rettinger/avvisninger, håndtert TG3-status og bekreftet gjeldende liste.
- Håndtert TG3-status kan være Uavklart; kontrolltidens slutt tvinger ikke fram Avklart.
- Opplasting/tallregistrering før analyse, maskinberegning/anbefaling etter listebekreftelse og videre investeringsarbeid er utenfor tidsmålene.
- Feilet analyse og ufullført kontroll registreres separat; demo er ikke live-tidsbevis.
- Kvalitetskriterier og kontroll/bekreftelser kan ikke hoppes over for å få lav tid. Ingen apptelemetri-/tidsrapporteringsfunksjon er et krav.

Kilder: `prd.md`, § NFR-5, linje 420–427; § Q-1, linje 488–492; `addendum.md`, § S5: Måleprotokoll og TT-1–TT-9, linje 104–110/118–126.

## Kontrollerte innholdseksempler som kan gjenbrukes i UX-arbeid

Dette er fastsatt kravfasit og konstruerte caser, ikke produserte test-PDF-er eller bestått produktbevis.

| Case | Oppgitt grunnlag/utfall | Belegg |
|---|---|---|
| F1 | P 16 000 000; L 1 900 000/år; D 400 000/år; J 800 000/år; Ymin 7 %. Bruttoyield 11,875 %, NOI 1 500 000/år, nettoyield 9,375 %, kontantstrøm 700 000/år. Gå videre ved komplett bekreftet teknisk grunnlag. | `addendum.md`, linje 52/56/81 |
| F2 | L 1 400 000/år med øvrige F1-tall. Bruttoyield 8,75 %, NOI 1 000 000/år, nettoyield 6,25 %, kontantstrøm 200 000/år. Forkast ved ellers tilstrekkelig grunnlag. | linje 57/82 |
| F3 | L mangler. Ingen av de fire nøkkeltallene; Innhent mer informasjon. | linje 58/85 |
| F4 | F1-økonomi og alvorlig TG3 «Alvorlig lekkasje i tak» på PDF-side 4, trykt side 2, Uavklart. Innhent mer informasjon; teknisk og økonomisk grunnlag skilles. | linje 34/59/87 |
| Yieldgrense | L 1 520 000/år gir nøyaktig 7 % og passerer Ymin 7 %. L 1 519 999 gir et reelt brudd selv ved avrundet 7,00 %. | linje 63/90 |
| Kontantstrømgrense | J 1 500 000 gir 0 som passerer. J 1 500 001 gir −1 kr/år som bryter. | linje 64/91 |
| Samtidige mangler | Manglende L og Ymin, feilet analyse og uavklart alvorlig TG3 vises alle ved prioritet 1. | linje 98 |

## Scope som ikke skal utvides i design

Ikke med i v1: sourcing/annonseuthenting, live markedsdata, markedsanalyse, rangering/investeringsscore, DSCR, stresstesting, kapitalbehovsmodell, automatisk låneplan, reparasjons-/vedlikeholdsestimering, ekstra finansielle fratrekk, OCR, salgsoppgave eller andre dokumenttyper, juridisk analyse, teknisk godkjenning, kjøpsbeslutning, budsending, flere brukerroller, eiendomssystemintegrasjoner og samarbeidende KI-agenter. Ingen leveringstid lovet for langsiktige muligheter. Kilde: `prd.md`, § Låst v1-scope og ikke-mål, linje 38–42; § FR-10–FR-11 avgrensning, linje 262; § Beregningskrav avgrensning, linje 323; § FR-18 avgrensning, linje 373.

Et profesjonelt uttrykk som tåler videre produktutvikling kan utformes uten å vise spekulative v2-funksjoner i v1-grensesnittet. Ingen pålagt dashboard, porteføljeoversikt, chat, automatisk undersøkelsesplan, eksport, sakshistorikk, delingsfunksjon eller vedleggsflyt finnes i PRD-en. Å legge inn en slik brukerfunksjon vil kreve scopeavklaring, ikke bare en UX-beslutning.

## Reelle åpne UX-valg og grenser for dem

PRD-en sier uttrykkelig at ingen produktspørsmål blokkerer neste fase, og at skjermoppsett, navigasjon, desktop-størrelser, lesbar kontrast og originalrapportkontroll konkretiseres i UX. Kilde: `prd.md`, § Avklaringsstatus, linje 477–486; `.memlog.md`, linje 31; `sluttkontroll.md`, linje 11/25/31.

| Reelt åpent UX-valg | Allerede låst produktgrense |
|---|---|
| Antall skjermer, layout og stepper/navigasjonsmekanisme | Sekvensiell UJ-1, gjeldende steg og ufullført status synlig; kontroll/bekreftelser beholdes. |
| Tilgang til originalrapport: åpning/nedlasting, eventuelt innbygging og sidenavigasjon | Original tilgjengelig under kontroll; dokumentnavn og filposisjon som PDF-side fra 1 alltid kontrollerbart. Innbygging ikke krav. |
| Funnpresentasjon, informasjonstetthet og visning av original/korrigert/avvist innhold | Alle eksplisitte TG2/TG3 trekkes ut; alle aktive funn tilgjengelige; opprinnelse og usikkerhet tydelig; ingen KI-relevansfiltrering. |
| Interaksjon for retting, avvisning og gjeldende listebekreftelse | Disse handlingene bevarer originalt KI-uttrekk og støtter kontroll før bruk. Endret liste krever ny bekreftelse. Ingen ny faglig klassifisering. |
| Presentasjon av TG3-status og de to tekstfeltene | Gyldig Avklart krever alle tre opplysninger og separat brukermerking. Uavklart kan beholdes. Ingen vedlegg eller automatisk ekstern verifisering. |
| Tallregistrering, visning av kilder/kostnadsinnhold og feilrespons | Fem låste tall, eksplisitt null, gyldige perioder/årsgrunnlag, synlig kilde/forutsetning, kostnadsdeling uten dobbelttelling. |
| Mekanisme for eksplisitt bekreftelse av verdier og null | Registrering er ikke bekreftelse; bekreftelsen gjelder kontrollerte aktuelle verdier. Ingen skjulte standarder. |
| Tilbakenavigasjon og visning etter endringer | Gammelt resultat aldri gjeldende for endret ubekreftet grunnlag; ny rapport ugyldiggjør tidligere rapportkontroll. |
| Resultatets detaljhiearki og tallformat/presisjon | Én anbefaling og kort begrunnelse øverst; formel/input/kilder tilgjengelige, uavrundet regelpresisjon og forklaring av skjult terskelbrudd. |
| Laste-, feil- og tomtilstandenes språk/form | Fullført vs ufullført vs feilet er atskilt. Tom liste er ikke feilet analyse. Delgrunnlag merkes og feil beholdes. Ingen oppdiktet fremdrift eller garanti er låst. |
| Demo/live-inngang og merking | Offline demo uten nøkkel er mulig; lagret uttrekk tydelig merket; live valgfritt og nøkkel ikke synlig. |
| Profesjonelt uttrykk, font, farger, spacing, desktop-størrelser | Grunnleggende tilgjengelighet, synlige feltetiketter/fokus, lesbar kontrast, tekstlig status, kilder/tall/kontroller tilgjengelige. Ingen mobilleveranse eller sertifiseringskrav. |

Dette er potensielle samtalepunkter i UX-workflowen, ikke allerede valgte designløsninger. Fargeskjema, skjermantall, komponenter og originalrapportmekanisme må ikke fremstilles som valgt av Mads før en faktisk UX-beslutning foreligger.

## Oppmerksomhetspunkter uten nye krav

1. **Alvorlig TG3 vs all-TG-uttrekk:** PRD krever alle eksplisitte TG2/TG3 i uttrekket, men avklaring omtales som «alvorlig TG3»/«relevante alvorlige TG3». Begrepet betyr vesentlig usikkerhet for førstevurdering etter briefens regler; PRD gir ingen ny numerisk alvorlighetsscore eller teknisk klassifiseringsalgoritme. UX må ikke introdusere en slik regel eller utlede at et TG-funn kan skjules. Kilde: § Begreper, linje 61/66–67; § FR-5, linje 162–177; § FR-7, linje 204; `review-rubric.md`, linje 82. Eventuell ny produktdefinisjon må spørres om, ikke løses som layout.
2. **Kontrolltid er ikke løsningsgrad:** Brukeren kan bekrefte kontrollert liste med et kjent Uavklart-funn og få Innhent mer informasjon. UX må ikke gjøre Avklart obligatorisk for å avslutte kontrollen. Kilde: § NFR-5, linje 424; addendum TT-5, linje 122.
3. **Korrigering av KI-feil er ikke TG3-avklaring:** TG3 som egentlig er TG2 korrigeres mot original; reell TG3 med ny ekstern opplysning beholder grad og får separat brukeravklaring. Kilde: § FR-10, linje 241–245; § FR-5, linje 170–171; addendum RT-11, linje 40.
4. **Mangler før analyse er fortsatt synlige:** Hovedanalyse starter etter gyldige bekreftede tall, mens regel-/feilflyt fortsatt kan gi Innhent mer informasjon ved tallmangler. UX skal ikke gjemme dette bak en disabled knapp uten forklaring eller tvinge mangler til tall for å komme videre. Kilde: § FR-4, linje 150; § NFR-5, linje 420; addendum protokoll, linje 104.
5. **Skjulte produkttillegg:** PRD spesifiserer retting/avvisning av KI-funn, men ikke en separat generell funksjon for å legge til nye brukeropprettede rapportfunn, redo-/retry-policy, eksport eller vedleggsanalyse. Kildene skal ikke tolkes som automatisk bestilling av slike funksjoner. Uklarheter med behov for ny funksjon må løftes til Mads.
6. **Historisk status er historisk:** `review-rubric.md` linje 83 omtaler daværende `draft`; PRD/addendum nå har `final`, `.memlog.md` linje 33 og `sluttkontroll.md` linje 31 dokumenterer ferdigstilling. Dette er ingen reell statuskonflikt i gjeldende produktgrunnlag.

## Hva kontrollfilene tilfører UX og hva de ikke tilfører

| Kontroll | Relevant konklusjon | Kilde |
|---|---|---|
| Product Brief-avstemming | Senere all-TG-presisering har forrang foran opprinnelig «relevante»; det er ingen score/ny analyse/varig lagringsleveranse. | `reconcile-brief.md`, linje 15–20/28–33 |
| Brief-addendum-avstemming | Skillet rapportkilde, original KI-feil, brukerendring og avklaring er bevart. Lokal merket demo og gjenbruk er bevart. | `reconcile-brief-addendum.md`, linje 12–19 |
| Faglærer-avstemming | Tre prinsipielle ledd, smalt v1, vanlig kode for finans, menneskelig kontroll og egne wireframes som senere designarbeid. | `reconcile-faglaerer.md`, linje 7–15/19–26 |
| Revisjonskontroll-avstemming | Erstattet opprinnelig tallfasit anvendes ikke; gjeldende F1/F2 og likhetsgrenser videreføres. | `reconcile-revisjonskontroll.md`, linje 5/22–26 |
| Sensor-avstemming | Tydelig UX, navigasjon, informasjon, tilbakemelding, feil/tomtilstander, grunnleggende tilgjengelighet, relevante skjermstørrelser og designspor. Kurseksempler er ingen ordre om flere roller, integrasjoner, lagring eller ny produktfunksjon. | `reconcile-sensorveiledning.md`, linje 12–18/22–24; `kildeuttrekk-sensorveiledning.md`, linje 12/19–26 |
| Kvalitetsrubrikk | Ingen blokkerende produktmangel. Praktisk kontrast og desktop-størrelser er fortsatt UX-konkretisering. | `review-rubric.md`, linje 39–45/49–59 |
| Redaksjonelle kontroller | Bevarte kriterier/testdetaljer; juridisk analyse helt utenfor v1; UJ-1 steg 4 gjelder alle aktive TG2/TG3, ikke KI-relevansutvalg. | `review-structure.md`, linje 7–11; `review-prose.md`, linje 7–12 |
| Beslutnings-/sluttkontroll | Ingen godkjent produktbeslutning mistet; UX-artefakter skal videreføre stabile FR/NFR og S1–S6. Faktisk design og gjennomføringsbevis gjenstår. | `beslutningsavstemming.md`, linje 9–31; `sluttkontroll.md`, linje 15–31 |

Viktige prompts, brukerpresiseringer, KI-forslag som korrigeres og faktiske kontroller skal lagres som prosessspor. Dette er repository-/leveransearbeid, ingen egen audit-funksjon i produktet. Kilde: `prd.md`, § Testgrunnlag og prosessbevis, linje 472; `reconcile-sensorveiledning.md`, linje 11/18/22–24.
