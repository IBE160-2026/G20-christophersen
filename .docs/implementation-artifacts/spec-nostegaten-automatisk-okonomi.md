---
title: 'Nøstegaten: dokumentert automatisk økonomi og leie'
type: 'bugfix'
created: '2026-11-05'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '71c94d28ab0960f6f948e315eed2340e78f98d61'
context: []
---

<frozen-after-approval reason="Brukerens konkrete oppdrag autoriserer retting, tester og lokal commit uten betalte kall eller push">

## Intent

Nøstegaten 65 A skal gi automatisk dokumentøkonomi, SSB-leie og foreløpig avkastning uten manuell registrering når originalen dokumenterer nødvendig grunnlag. Undersøk årsakene før retting; bruk fysiske PDF-sider, og behold sperrene mot udokumenterte opplysninger.

## Boundaries & Constraints

Alltid: bevar alle 152 sider og originaltekst/offseter; kildebelegg for hvert felt; mangler er ukjent, aldri null. Eksplisitt nullgjeld kan brukes. Dokumentverifisert tekst er ikke menneskelig bekreftet finansgrunnlag. SSB er et estimat med år/sone/metode og synlige begrensninger. Ingen betalte AI-kall eller push. Lokal commit med aktiv promptlogg. Følg sentral deferred-work for gjenværende arbeid.

Aldri: mer generell minneoptimalisering, full TG-utvikling, hardkodet adresse/hash eller FINN-tall som fasit, globale unntak for innholdslag, automatisk full netto/kontantstrøm eller falsk kostnadsfullstendighet.

## I/O & Edge-Case Matrix

| Scenario | Input | Forventet atferd | Sperre |
|---|---|---|---|
| Ekte Nøstegaten | Original 152 sider | Dokumentert pris 4050000, BRA-i40, leilighet,2 rom/1 soverom, fellesutgifter1020/mnd, gjeld0 | Faktisk OC-berørte sider forblir uavklart |
| Lag | OCProperties og sideinnhold | Bare bevist lagfri side kan leses som pålitelig | Skjult OC i tekst/Form/XObject eller uavklart struktur gir unknown |
| Ukjent gjeld/fordeling | Manglende eller motstridende kilde | Ingen oppdiktet null eller inkludering | P/foreløpig netto sperres etter eksisterende regler |
| Kostnader | Kommunale12957/år inkl skatt3942, felles1020/mnd | 25197/år kjente kostnader uten dobbelttelling når kildeavstemming tillater det | Uvisse heis/fasade/andre utgifter gir fortsatt foreløpig status |
| Rostockgata | Ekte170 sider | Tidligere kildeverdier og automatisk leie/yield bevares | Teknisk risiko fortsatt ufullstendig |

</frozen-after-approval>

## Code Map

- `src/backend/documents/pdf-extraction-worker.ts`: otherContent setter i dag alle sider unknown ved katalogens OCProperties. Lagkontroll må være per side, fail closed, følge referanser, Forms og faktisk content med eksisterende parser/kvoter. Ingen generelt synlighetsunntak. Offentlig operatorliste viste OC på1,124–131,133,141,152; sider8–12 var uten OC. Enkelte vedleggsgrupper mangler i katalogen, så isVisible-default kan ikke sertifisere dem.
- `src/backend/documents/pdf-extraction-core.ts`: extractPage og uendrede tekstoffseter/kvoter gjenbrukes. Bare readable blir kilde i sourceFor.
- `src/backend/import/local-plan.ts`, `explicit-economy.ts`: beløpsgrammatikk mangler singular Felleskostnad, Kr.-prefiks, mnd/år-varianter og relevant gjeldsledger. Bevar konflikter og alternative beløp; økonomi må ikke avhenge av TG-dekning.
- `src/domain/rental-property.ts`: bare readable; støtter allerede2-roms, etiketter og BRA-i. Verifiser faktisk kommune/bydel/identitet uten å utlede kommune fra poststed eller bruke naboprosjekt som adresse. Støtt bare konkrete nødvendige formater.
- `src/domain/source-economy.ts`: P krever pris+kjent gjeld. Foreløpig netto krever dokumentert inkludering/gjeldsdel; full D krever ytterligere fullstendighet og år. Gjenbruk disse reglene.
- `src/backend/rent/ssb-rent.ts`: faktisk gratis SSB09897. Bergenhus=03.01, ellers Bergen bredt. Ingen modellutvidelse for å tvinge resultat.
- `tests/e2e/rent-real-document.spec.ts`: erstatt gammel all-null-fasit for Nøstegaten med reelt dokumentert resultat, bevar tekst-digest, sidekart, originalkildeåpning og blokkering av betalte ruter. Rostockgata har uavhengig fersk SSB-fasit.

## Tasks & Acceptance

- [x] `src/backend/documents/pdf-extraction-worker.ts` og relevante integrasjonstester: trygg per-side kontroll av OC og regresjoner for skjult innhold, Forms og uavklarte referanser; ikke bare fjerne katalogsperre.
- [x] `src/backend/import/local-plan.ts`, `explicit-economy.ts` og relevante tester: kildebundet grammatikk for faktisk dokumentert økonomi og kostnadsavstemming uten fravær-til-null eller dobbelttelling. Vis relevante kjente kostnader/ukjente økninger.
- [x] `src/domain/rental-property.ts` og relevante tester hvis nødvendig: få dokumenterte boligfelt gjennom eksisterende validering, bevar negative/motstridsporter.
- [x] `tests/e2e/rent-real-document.spec.ts`: ekte flyt uten registrering for begge originaler, SSB-oppslag, pris/kostnad/yield og originalkilder. Bare gratis nettverk.
- [x] `.docs/process/arbeidsokter/2026-11-05-nostegaten-okonomi.md`, `README.md`, `.docs/implementation-artifacts/deferred-work.md`: dokumenter årsak, fysisk fasit, faktisk sluttresultat og resterende blokkeringer. Bevar historikk, ikke lukk generelle poster uten bevis.

Gitt originalen, når opplasting fullføres, så er alle152 sider bevart, økonomi og leie automatisk kildebelagt og de reelle forbeholdene synlige. Gitt konflikt/ukjent lagbruk, når data vurderes, så kan dette aldri bekreftes bort. Gitt Rostockgata, når samme flyt kjøres, så beholdes tidligere18 900/mnd ved uendret SSB2025 og økonomi uten registrering.

## Implementation Notes

Undersøkelse før kode: visuelt kontrollert fysiske sider8,9,10,11. Original SHA256 f33337aa0f5f2de0b64454541b0bb20bcf7732498755c4078ed1509b3a3f14e8. PDF sier1020/mnd, ikke FINN1019. Romfordeling side9: entré, stue/kjøkken, soverom, bad. Side8 har tallfestet nullgjeld, side11 eksplisitt ingen sameielån. Side10 sier kommunale avgifter inkluderer eiendomsskatt og varsler uvisst omfang for fasade/heis. Kursveiledning side2–6 og faglærertilbakemelding er lest: sporbarhet, etterprøvbare kodeformler, ekte flyt og ærlig usikkerhet. Brukerens gjennomføringsfullmakt gjelder hele oppdraget; ingen ny godkjenningsrunde for reversible lokale rettinger.

## Spec Change Log

## Review Triage Log

## Verification

- Målrettede lag-/økonomi-/leietester og negative kontroller.
- `npm test`, `npm run build`, `npm run lint` med prosjektets Node24.21.
- Ekte Nøstegaten og Rostockgata i Playwright, på isolert demoserver med tom API-nøkkel. Bevar private originaler/råbevis under ignorert private/.
- Uavhengig review av diff, kontroll av mobil/desktop og lokale kildeåpninger før lokal commit med promptlogg.

- Første ekte E2E bestått begge: Nordvik22,1s og Nøstegaten25,3s,2/2 uten skip. Faktisk leie12000/mnd,144000/år,6700–17700; brutto3,56% og foreløpig2,93%. Skatt inngår allerede i kjent delsum; fast advarsel om ukjent skatt ble omskrevet til øvrige kostnader etter visuell kontroll.

### Reviewrunde 1

Alle tre uavhengige lag er mottatt før triage. Individuelle funn:

| ID | Dom/rute | Kontrollert utfall og tiltak |
|---|---|---|
| B1 | high / patch | Negasjonen «ikke inkludert» matcher positivt mønster; rett negasjonskontroll og negativ fasit. Samme rot som E1. |
| B2 | medium / patch | Måned/kvartal kan bli tolket som år. Årsbelegg må følge kommunal årsrot og kildene; motstridende periode avvises. |
| B3 | high / patch | Linjeankeret mister faktisk ukjent gjeld i løpende tekst. Gjenopprett adverse kontroll med et konkret unntak for totalprisens syntaks. Samme rot som E2. |
| B4 | medium / patch | Uforklart avvikende totalpris må sperre P. Ekte dokument har eksplisitt alternativ total med valgfrie omkostninger på side8; kvalifikasjonen og samme beløp må beholdes som kildebevis ved unntak for side13. |
| B5 | high / patch | Fravær av kommunale avgifter fra inkluderingsliste beviser ikke separat betaling. Dokumentfeltets inkludering forblir null. En separat merket foreløpig scenarioberegning kan forutsette addisjon, men leverer aldri full D eller oppgraderte kildefakta. |
| B6 | medium / patch | Faktisk saved-economy-real-regresjon: sider38,121,122,134 endres av global ressurskontroll, og arkivet avvises korrekt. Kontroller brukte ressursbaner; behold streng arkivintegritet og OC-kontroll uten katalog. |
| B7 | low / patch | Generisk inspeksjonsfeil hevder faktisk lagbruk; skill påvist OC fra uverifisert lagfrihet i sidebegrunnelsen. |
| B8 | medium / patch | All-null-test med bare «Bevart tekst» prøver ikke økonomisperren. Legg gjenkjennelige økonomibeløp inn i negative lagfixturer. |
| B9 | low / patch | Rapport/README/deferred-work var uferdig under review; fylles ut med faktiske sluttkjøringer før commit. Ingen gammel logg eller historikk omskrives. |
| E1 | high / patch | Samme konkrete negasjonsfeil som B1, separat bevart funn. |
| E2 | high / patch | Samme konkrete inline-gjeldskonflikt som B3, separat bevart funn. |
| V1 | medium / patch | Mangler kjørte negative lagprøver uten OCProperties. Parametriser katalog tilstede/fravær og krev ubrukelig økonomigrunnlag for begge. |
| V2 | low / patch | Forsikringsinkludering i nytt format mangler UI-fasit. Utvid eksisterende positiv økonomiprøve med rendret DocumentEconomy. |

## Reviewbeslutning om foreløpig kostnadsscenario

Dokumentet oppgir begge beløp, men sier ikke eksplisitt om kommunale avgifter betales utenfor felleskostnadene. Derfor blir municipalFees.includedIn stående ukjent. Den kildevaliderte delsummen leverer ikke25197 som ubetinget fakta. Et separat kostnadsscenario kan automatisk bruke1020×12+12957, med en fremtredende tekst om at dette **forutsetter** ingen overlapping. Fradraget kan være for høyt. Full D, nettoyield, kontantstrøm og screening beholdes sperret, også ved avkrysset kostnadsfullstendighet uten avklart relasjon. Manuell drift eller retting har forrang. Dette er en tydelig foreløpig avkastningsberegning innen brukerens oppdrag, uten å gjøre en udokumentert inkludering til dokumentfakta.

### Oppfølgingsreview

| ID | Dom/rute | Kontrollert utfall og tiltak |
|---|---|---|
| V3 | high / patch | Oppfølgingsreview reproduserte OC via Type3 valgt med ExtGState.Font i gs, uten Tf. Invokert ExtGState med Font sperres inntil separat glyphkontroll finnes. Ny reell glyph-fixture kontrollerer både brukt og ubrukt ressursbane. |

Oppfølgingsreview av separat kostnadsscenario fant ingen reproduserbar feil;2/2 nye scenario-prøver bestod. Verifikasjonsreview bekreftet lukking av V1/V2 samt negative skatte-/gjelds-/totalprisprøver; V3 ble rettet før sluttkjøring.

## Sluttutfall

Alle oppgaver/akseptpunkter er kontrollert mot faktisk diff.2159 tester bestått,7 eksisterende skip; build/lint bestått. Endelig ekte E2E2/2 bestått uten skip45,1s; Nøstegaten22,8s og Rostockgata20,6s. Alle152/170 sider beholdes. Automatisk leie12000/18900kr per måned. Nøstegaten brutto3,56%, foreløpig2,93% med tydelig addisjonsforutsetning; inkludering, fullD, nettoyield, kontantstrøm og teknisk kompletthet oppgraderes ikke.13 opprinnelige reviewfunn og1 konkret oppfølgingsfunn er håndtert; ingen ny generell sak er lukket. Sluttbevis og gjenværende grenser er dokumentert i prosessrapporten og den sentrale deferred-work-oversikten.
