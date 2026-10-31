# Nye salgsoppgaver fra brukergrensesnittet — 30.–31. oktober 2026

Brukeroppdrag: analyser nye ukjente salgsoppgaver fra UI med den nye ekte PDF-en på 135 sider; skill dokumentmangler fra funksjonsmangler, bruk Code First og AI, bevar kilder/presisjon/finansregler, krev uttrykkelig godkjenning av kostnad og utdragsoverføring, rett falske adresser og test i Playwright. Ingen betalte API-kall i økten og ingen push.

Utgangspunkt: `c06067ce58e9bb1d1945abecfe2889a6468dd7b2`. Aktiv automatisk promptlogg beholdes uendret i prompts-mappen. Byggearbeidet følger eksisterende planretning og faglærerens krav om finans i vanlig kode, enkel pipeline, eksplisitte mangler og etterprøvbare kilder. Sensorveiledningens innhold er konsultert via det eksisterende kildeuttrekket; ingen nye kurskrav er innført.

## Årsak og dokumentgrunnlag

PDF.js leste 135 fysiske sider. Null økonomifelter skyldtes parserens krav om en komplett linje av typen «Etikett: tall kr». Dokumentet bruker valutaprefiks, egne verdilinjer og parentesetiketter. Dette var manglende funksjonalitet.

| Dokumentert felt | Beløp i NOK | Fysisk PDF-side | Periode/år |
| --- | ---: | --- | --- |
| Prisantydning | 13 990 000 | 4 og 49 | Engangsbeløp |
| Totalpris | 14 341 140 | 4 og 49 | Engangsbeløp |
| Omkostninger | 351 140 | 4 og 49 | Engangsbeløp |
| Dokumentavgift | 349 750 | 49 | Engangsbeløp |
| Kommunale avgifter | 26 072 | 49 | Årlig, 2026 |
| Eiendomsskatt | 9 699 | 49 | Årlig, 2026 |

Det er ni originale kildebelegg for de seks feltene. Ingen verdi er beregnet eller kopiert fra første eiendom. Fellesgjeld, felleskostnader og gjeldsbetaling står ukjent; fravær av uttrekk beviser ikke fravær i dokumentet. Fullt leie-/driftsgrunnlag kan ikke etableres av disse seks beløpene. Dokumentets opplysning om øvrige utgifter er ikke et komplett årsbeløp og kan ikke erstattes med et estimat. Nøkkeltall forblir sperret når grunnlaget mangler.

Adressefeilen kom fra `\s*` som krysset linjeskift etter tomme adressefelt i budskjemaet på fysisk side 134. Neste feltnavn ble feilaktig en adresse. Nå kreves gatenavn og husnummer på samme etikettlinje. Nye dokumentet har ingen støttet eksplisitt adresseetikett; UI viser ukjent adresse og ingen av de falske kandidatene.

## Levert flyt

1. Opplasting leser originaltekst lokalt og henter sikre støttede verdier med hash, fysisk side, sitat og originale UTF-16-offseter.
2. Gratis **Forbered KI-analyse** velger hele relevante økonomisider innen eksisterende konservativt requestbudsjett. Hele valgte tekst vises; utelatte relevante sider listes. Ingen ekstern tokentelling, reservasjon eller modellkall skjer her.
3. Serveren eier den uforanderlige pakken. Både kostnad og utdragsoverføring må godkjennes. Hash, requestdigest og pakke-ID må stemme før ett SDK-kall. Maksimal reservasjon USD 0,15 innen varig USD 0,20-ramme; ingen automatisk retry eller ny kvote etter reload.
4. Eksisterende compact-3 lar modellen velge lokale verdi-/kildereferanser. Kode materialiserer tall og kilder og validerer perioder, år og konflikter. Lokale sikre felter fra usendte sider beholdes. Finans- og screeningregler er uendret.
5. Vellykkede svar lagres privat og gjenopprettes bare for identisk PDF etter ny pakkeregenerering og referansevalidering. Nytt filnavn binder kildene til denne opplastingen. Annet dokument eller manipulert verdi-ID avvises. Historiske integritetspinner og første eiendoms arkiv er bevart.
6. Nye svar ugyldiggjør gamle kontroller og resultat; manuelle brukerverdier og notater bevares. Bytte av PDF nullstiller forrige eiendoms tall, forutsetninger, kilder og samtykker.

## Verifikasjon og review

[Bygg](../../implementation-artifacts/nye-salgsoppgaver-2026-10-31/build.txt), [lint](../../implementation-artifacts/nye-salgsoppgaver-2026-10-31/lint.txt), [tester](../../implementation-artifacts/nye-salgsoppgaver-2026-10-31/tests.txt), [Playwright](../../implementation-artifacts/nye-salgsoppgaver-2026-10-31/playwright.txt) og [review/triage](../../implementation-artifacts/nye-salgsoppgaver-2026-10-31/review.md) er versjonerte bevis uten originaltekst fra private dokumenter.

Playwright bruker ekte opplasting og ekte gratis forberedelse av 135-sidersdokumentet, i tom økt og etter tidligere eiendom med samme filnavn. Betalt respons er uttrykkelig stubbet; testen kontrollerer begge samtykker, oppdatert skjerm, ufullstendig teknisk dekning og originalkilder. Separat SDK-/HTTP-integrasjon bruker lokal fetch-stub og validerer faktisk compact-respons, varig kvote, ingen retry, kildebevaring, privat gjenoppretting og avvisning av endret dokument/referanse. Dette beviser programflyt og kontrollporter, ikke reell modellkvalitet.

Port 3000 var opptatt av brukerens eksisterende server. Den ble ikke stoppet. Verifikasjonen brukte isolert port 3001 med tom API-nøkkel. Valgfri PAA_PORT gjør dette mulig; servermodus-testen velger ledig lokal port. Private skjermbilder, JSON-responser og browser-rapport ligger under ignorert `private/incoming/`. Skjermbildet av økonomi og samtykke er visuelt inspisert: feltene, ukjente nøkkeltall, kostnad, valgte/utelatte sider og separate avkryssinger vises uten horisontal avkutting.

## Faktiske grenser

PAA-SO2 er fortsatt åpen. Økonomianalysen er begrenset til godkjente tekstutdrag. Den generiske tekniske AI-pipelinen er ikke åpnet for vilkårlige integrerte rapporter; den nye PDF-ens sikre rapportgrenser er ikke fastslått, og ingen komplett TG-dekning er dokumentert. Raster/OCR inngår ikke. Full analyse av vilkårlige salgsoppgaver er derfor ikke ferdig levert. Ingen grønn teknisk status, oppdiktede tall eller modellkvalitetsløfter brukes for å skjule dette.

Ingen betalte API-kall er utført. Ingen private originaler eller dokumentutdrag legges i Git. Ingen push.

Lokal implementeringsrevisjon: `0b439811f3cd5f93fef210fe9e86179be4553cf4`.
1626 tester, 23 relevante Playwright-tester, typecheck/build og lint består.
PAA-SO3 er lukket med revisjon og test-/reviewbevis i den sentrale oversikten;
PAA-SO2 forblir åpen. Ingen push.
