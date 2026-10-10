# Kildegrunnlag for PRD-arbeidet

Dato: 2026-10-10. Arbeidsnotat fra BMADs innledende kildeuttrekk; ikke en ny produktbeslutning eller ferdig PRD.

## Bestilling og prioritet

Mads bestiller BMAD PRD for Property Acquisition Agent med revidert Product Brief, addendum, revisjonskontroll, faglærertilbakemelding og sensorveiledning som grunnlag. Låst v1-scope skal ikke endres uten spørsmål. Krav skal være konkrete, testbare og kunne refereres fra UX, arkitektur, epics, stories, kode og tester.

Gjeldende beslutninger i brief/addendum og oppfølgingen 2026-10-08 i revisjonskontrollen brukes foran historiske forslag i tilbakemeldingen. Revisjonskontrollens første, erstattede tallfasit skal ikke brukes. Kildehenvisninger finnes i [prd.md](prd.md).

## Uttrekk fra brief og addendum

- Desktop-webapp for førstevurdering av ett manuelt registrert boligutleieobjekt om gangen. Én tekstbasert PDF-tilstandsrapport, maksimalt 30 sider, ingen OCR eller annonseuthenting. Kilde: brief, «Med i v1».
- Sekvensiell pipeline: KI trekker ut eksplisitte TG2/TG3-funn med beskrivelse, dokumentnavn og PDF-side telt fra 1. Brukeren kontrollerer, korrigerer og bekrefter. Vanlig kode beregner og velger anbefaling. Kilde: brief, «Med i v1»; addendum, «Kontroll mot dokumenter og KI-feil».
- P er totalpris inklusive eventuell fellesgjeld uten kjøpsomkostninger; L årlig bruttoleie; D årlige eierbetalte driftskostnader; J årlige renter og avdrag inklusive eventuell fellesgjeld; Ymin brukerens minimum nettoyield. Månedstall omregnes med 12. Bruttoyield = L/P; NOI = L−D; nettoyield = NOI/P; kontantstrøm før skatt = NOI−J. Kilde: brief, «Finansdefinisjoner for v1».
- P > 0; øvrige kritiske tall ≥ 0. Ingen skjulte standardverdier; null må bekreftes. Mangler, ubekreftede verdier, kildekonflikter, uleselig rapport, ufullført analyse og usikre kritiske funn hindrer tilstrekkelig grunnlag. Kilde: brief, «Kritisk informasjon og anbefalingsregler».
- Regelprioritet: utilstrekkelig grunnlag eller uavklart alvorlig TG3 → Innhent mer informasjon; ellers nettoyield < Ymin eller kontantstrøm < 0 → Forkast; ellers → Gå videre. Sammenligning før avrunding; likhet godtas. Ukjent TG3-status er uavklart. Ingen obligatorisk reparasjonskostnad eller teknisk godkjenning skal innføres. Kilde: samme seksjon og revisjonskontroll, «Oppfølging: låste v1-beslutninger før PRD».
- Ingen live marked, sourcing, score/rangering, DSCR, stresstesting, kapitalmodell, reparasjonsestimering, salgsoppgaveanalyse, juridisk helanalyse eller budsending i v1. Kilde: brief, «Utenfor v1 og senere produktutvikling».
- Lokal demo med lagret KI-uttrekk og aktive beregninger/regler uten nettverk, nøkkel eller betalt konto. Live KI er valgfritt. Ett eksplisitt analysekall per ny rapport; gjenbruk av uendret rapport; endrede finansverdier krever ny beregning uten nytt KI-kall. Kilde: addendum, «Kjørbarhet, kostnader og repo».

## Suksesskriterier som videreføres

Fra brief, «Troverdighet og målbar suksess»:

- S1: Alle fire nøkkeltall innen 1 kr og 0,01 prosentpoeng fra uavhengig fasit.
- S2: Alle fasitmerkede TG3 og minst 90 % TG2 med riktig PDF-side; ingen oppdiktede TG2/TG3 i utvalget.
- S3: Alle regelvarianter gir forventet utfall, inklusive feil, mangler og terskellikhet.
- S4: Korrekt dokument/side for alle TG-funn; synlig kilde/antakelse for beregningsverdier; ingen dobbelttelling.
- S5: Median hovedanalyse ≤ 5 min; median investorkontroll ≤ 10 min på komplette caser. Måles separat og sammenlignes med manuell førstevurdering. Operasjonelle start-/stoppunkter må konkretiseres uten å endre målene.
- S6: En annen person gjennomfører lokal demo og tester fra README uten gruppens nøkkel, betalt konto eller egen infrastruktur.

## Testgrunnlag og gjennomføringsarbeid

Addendum, «Minst fire kontrollerte testcaser», «Utregnet fasit» og «Regelvarianter med fasit», samt revisjonskontroll, «Ny verifikasjon», fastsetter:

- F1: P 16 000 000, L 1 900 000, D 400 000, J 800 000 og Ymin 7 % → bruttoyield 11,875 %, NOI 1 500 000, nettoyield 9,375 %, kontantstrøm 700 000; Gå videre ved komplett bekreftet grunnlag.
- F2: Bruttoyield 8,75 %, NOI 1 000 000, nettoyield 6,25 %, kontantstrøm 200 000 ved Ymin 7 % → Forkast.
- F3: Manglende L → Innhent mer informasjon; ingen leieavhengige beregninger.
- F4: Kjent TG3 «Alvorlig lekkasje i tak» på PDF-side 4, uavklart → Innhent mer informasjon.
- Grensevarianter inkluderer nettoyield nøyaktig 7 % og én krone lavere L, samt kontantstrøm 0 og −1 kr. Mangler har prioritet over økonomisk svakhet.

Begge kildegjennomgangene konkluderer med at ingen dokumenterte åpne produktbeslutninger blokkerer PRD. Faktiske test-PDF-er, maskinlesbare fasiter, UX-skisser, teknologistakk og implementering er gjenstående gjennomføringsarbeid. Modell og kostnadstak avklares før betalte live-tester. Lagrede demosvar dokumenterer ikke live KI-kvalitet.

## Faglærertilbakemelding og revisjonskontroll

Tilbakemeldingens «Samlet vurdering» og «3. Neste steg» krevde smalere v1, fastsatte formler/kritiske felt, målbar evaluering og riktig emnekontekst. Revisjonskontrollens «Kontroll av faglærerens tilbakemelding» dokumenterer planmessig oppfølging, ikke implementerte resultater. Sporbarhet fra plan til kode/test og dokumentert KI-prosess skal videreføres. Jevnlige commits er løpende praksis, ikke en allerede levert aktivitet.

## Arbeidsstatus

Uavhengige BMAD-kildeuttrekk er brukt for brief/addendum og revisjonskontroll/tilbakemelding. Sensorveiledningen trekkes ut separat. Neste steg er å velge BMAD-arbeidsform, konkretisere krav, avklare eventuelle reelle hull og gjennomføre workflowens avstemming og kvalitetskontroll. PRD skal ikke merkes ferdig før dette er gjort.
