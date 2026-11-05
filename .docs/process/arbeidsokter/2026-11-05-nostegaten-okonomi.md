# Nøstegaten 65 A: automatisk dokumentøkonomi og leie

Utgangspunkt: `71c94d28ab0960f6f948e315eed2340e78f98d61`. Oppdraget autoriserer konkret retting, gratis SSB, ekte brukerflyt og lokal commit med aktiv promptlogg. Ingen push eller betalte AI-kall. [Spesifikasjon](../../implementation-artifacts/spec-nostegaten-automatisk-okonomi.md). Automatisk promptlogg: `../prompts/session-01a1ab57-bec6-79a0-93b0-61ed9fa0ca6f.jsonl`.

Kursforankring: Sensorveiledning IBE160 Del1, fysiske sider2–6, og faglærers brief-tilbakemelding2026-10-06 er lest. Relevant er faktisk endeprøve, kildehenvisninger, kodeberegnet finans, eksplisitt usikkerhet og sporbar prosess. Ingen nye kurskrav innføres.

## Undersøkelse før kodeendring

Originalen `private/incoming/nostegaten-65-a.pdf` er privat og holdes utenfor Git. SHA256 `f33337aa0f5f2de0b64454541b0bb20bcf7732498755c4078ed1509b3a3f14e8`,152 fysiske sider. Tidligere uendrede tekstfasit er153005 tegn og SHA256 av side/tekst-listen `6392291608dc91b47cbc91126f74821a7d9a363992b81eb8b2042519ce4b4935`.

1. `pdf-extraction-worker.ts/otherContent` gjør alle sider unknown alene ved katalogens OCProperties. Den ene kataloggruppen367R heter Hidden og er OFF for visning/utskrift. En lokal uavhengig public PDF.js-operatorprøve fant faktisk OC på1,124–131,133,141,152, men ikke økonomisidene8–12 eller rapportside86. Enkelte vedleggsgrupper mangler i katalogen: public isVisible sin åpne standard er ikke tilstrekkelig bevis. Derfor kreves faktisk per-side kontroll; katalogsperren kan ikke bare slettes.
2. `createLocalPlan`, `sourceFor`, `enrichExplicitEconomy`, `extractRentalProperty` krever readable. Dermed blir alt økonomi-/leiegrunnlag borte selv om teksten er bevart. Tekstmangel og uverifisert lagbruk er ulike årsaker.
3. En privat diagnose med hypotetisk readable-status (aldri brukt som import/UI-resultat) viste at eksisterende parser allerede finner pris4050000, BRA-i40,2rom,1soverom og Bergen kommune. Den mangler flere Kr.-/periode-/etikettformater og eksplisitt gjeldsledger. Den opprinnelige adverse-regexen plukker dessuten delstrengen «fellesgjeld kr.4165330» ut av totalprislinjen på side13 og skaper falsk gjeldskonflikt. Adressekandidatene er motstridende og må skilles fra kontakt-/vedleggsadresser uten å ignorere reell objektkonflikt.
4. P krever kjent pris og gjeld. Foreløpig netto krever kildeavklart inkludering og gjeldsdel. Full D krever i tillegg komplett kostnadsinnhold og kjent år. Disse reglene skal beholdes.

## Uavhengig fysisk PDF-fasit

Originalsider8,9,10,11,98,116 er rendret lokalt og visuelt kontrollert før retting. PNG-er ligger privat under `private/incoming/nostegaten-economy-check/`.

| Opplysning | Verifisert innhold | Fysisk PDF-side |
|---|---|---|
| Objekt | Nøstegaten65 A,5011 Bergen, eierseksjon/leilighet |8,98 |
| Prisantydning |4050000kr |8 |
| Internt areal |40m² BRA-i; total43 og ekstern bod3 er andre arealbegreper |8,9 |
| Rom |2-roms eierleilighet, ett soverom |8,90 |
| Romfordeling |Entré, stue/kjøkken, soverom, bad; bod er ekstern |9 |
| Fellesutgifter |1020kr/måned; FINN1019 bekreftes ikke av PDF |8,10 |
| Fellesgjeld |kr0 i egen ledgerlinje; «Sameiet har ikke lån.» |8,11 |
| Kommunale avgifter |12957kr/år |8,10 |
| Eiendomsskatt |3942kr, uttrykkelig inkludert i kommunale avgifter |10 |
| Kjente fellesposter |Felles byggforsikring, drift/vedlikehold, bank, fellesstrøm, brann-/sprinklerkontroll |8,10 |
| Uvisse økninger |Fasadepanel og heis i ustand; omfang uvisst, mulig økning i felleskostnadene |10,11 |
| Andre løpende poster |Strøm etter forbruk, kabel-TV/bredbånd og forsikringer omtales uten beløp |10 |
| Kommune |Eksplisitt matrikkelkommune4601 BERGEN, ikke utledet fra poststed |98,116 |

## Uavhengig SSB-fasit

Gratis metadata og avgrensede celler ble hentet direkte fra SSB09897 etter at sandbox-DNS avviste første forsøk. Forespørselen gjelder Soner2=03.01,03.02 / AntRomBRA=2.040 / ContentsCode=Husleie / Tid=2025. Oppdatert2025-12-22T07:00:00Z;2025 er nyeste publiserte år. Private svar og separat beregningsfasit er lagret før sluttprøven. Ingen betalt modelltransport.

Publiserte referanser er12600kr/mnd for Bergenhus og11300kr/mnd for øvrige bydeler. Dokumentert kommune gir eksisterende brede Bergen-modell når bydel ikke kan kildebelegges sikkert. Midtpunkt11950 avrundes til12000kr/mnd,144000kr/år. Dette er et PAA-estimat fra SSB-celler, ikke en adressebasert SSB-prediksjon eller dokumentert oppnådd leie. Eksakt arealpunkt40m² krever ingen arealtilnærming. Eksisterende produktmargin er40% ved uavklart bydel og ett år siden statistikkåret: lav11300×0,60 avrundes ned til6700; høy12600×1,40 avrundes opp til17700. Intervallet er ikke empirisk kalibrert og har ingen påstått sannsynlighetsdekning.

Uavhengig beregningsfasit med PDF-beløp: P4050000+0, scenariofradrag1020×12+12957=25197kr/år (skatt teller ikke igjen). Addisjonen forutsetter at kommunale avgifter kommer i tillegg til felleskostnadene. PDF-en gir ikke eksplisitt avklaring av eventuell overlapping; denne forutsetningen vises separat og inkluderingen beholdes ukjent i dokumentdata. Årsleie144000 gir brutto3,55555…%=3,56%. Foreløpig etter kjente kostnader118803kr/år,2,933407…%=2,93%. Kjøpsomkostninger inngår ikke i denne P-definisjonen; prisantydning er ikke avtalt kjøpesum. Leie har2025-nivå; kostnadsår er ukjent. Full netto, finansiering og kontantstrøm har fortsatt egne porter.

## Gjennomføring og verifikasjon

Resultater fylles inn etter faktisk kjøring; fasiten over er beregnet uavhengig av implementasjonen og er ikke en påstand om at brukerflyten allerede bestod.

## Rettelser og review

Bmad-build-undersøkelsen ble delegert som lesende sporarbeid; implementasjonen ble deretter utført fra spesifikasjonen. Hovedagenten kontrollerte selv originalsidene, den faktiske importen, SSB-cellene, økonomiformlene og visningen. Ingen forhåndsregistrering ble brukt i Nøstegaten-flyten.

Lagkontrollen følger faktisk innholdsstrøm og brukte XObjects, Forms og soft masks med begrenset dybde/arbeid. OC i tekst, objekt eller annotasjon sperrer. Uverifiserte mønstre/Type3 og fontvalg fra ExtGState sperrer, også uten katalogregistrering. Ubrukte ressurser får ikke sperre andre sider. Begrunnelsen skiller påvist OC fra annen uverifisert struktur. Hele tekstgrunnlaget beholdes; ingen skjult gruppesynlighet godkjennes og PDF.js sin default-visible brukes ikke som fasit.

Økonomigrammatikken støtter de faktisk dokumenterte Kr.-prefiksene, singular felleskostnad, måneds-/årsperioder og gjeldsledger. Et totalprisbeløp tolkes ikke som gjeld. Uforklarte motstridende totalpriser sperrer; den høyere alternative totalen på side8 og13 beholdes med eksplisitt kvalifikasjon om valgfrie omkostninger. Ukjent gjeld i løpende tekst og negerte inkluderingssetninger sperrer fortsatt. Eiendomsskattens årsgrunnlag krever dokumentert årlig kommunal forelder og bevarer dette kildebelegget.

EIENDOM-adressen på side8 gjenkjennes uten å utlede kommune fra poststed. Kommune kommer fra eksplisitt sameiematrikkel på side116. Husbokstav med og uten mellomrom normaliseres bare for sammenligning; ordrette sitater/offseter beholdes. Ingen bydel gjettes fra plannavn eller nabotiltak. Uttrekket er versjonert `bounded-pdf-text-3`; lokalplan er `local-plan-2`, slik at eldre resultater ikke feilaktig brukes som dagens uttrekk.

Tre uavhengige reviewlag leverte13 individuelle funn; hvert er triagert i spesifikasjonen. Rettelsene omfatter negert skatt, periodebelegg, inline gjeldsmotstrid, alternativ totalpris, uavklart kommunal inkludering, ekte negative lagprøver med økonomibeløp og katalog tilstede/fravær, forsikringsvisning og presis sidebegrunnelse. Oppfølgingsreview reproduserte også OC i en Type3-glyph valgt via ExtGState.Font uten Tf. Denne konkrete banen er nå sperret og dekket med brukt/ubrukt-kontroll. Et separat oppfølgingsreview av kostnadsscenarioet fant ingen reproduserbar feil;2/2 nye scenario-prøver bestod.

Den første fulle testpakken hadde2151 bestått,7 eksisterende skip og2 feil: en tidlig iteratorfeil i ny Pattern-kontroll og en reell arkivregresjon. Pattern-feilen ble rettet før målrettet nykjøring. Arkivdiagnosen viste at fire gamle sider fikk endret status/begrunnelse på grunn av ressurskontroll; den integritetsbundne arkivleseren avviste korrekt. Rettelsen følger bare brukte ressurser og kontrollerer den brukte soft-mask-strømmen. Arkivvalideringen ble ikke svekket. Privat original for arkivtesten bestod deretter igjen. En senere full pakke bestod2158 tester med7 eksisterende skip før den siste ExtGState.Font-regresjonen ble lagt til; denne og øvrige berørte prøver bestod deretter54/54.

## Faktiske endeprøver

Første ekte nettleserkjøring bestod2/2 uten skip: Rostockgata22,1s og Nøstegaten25,3s (49,5s samlet). Ingen registrering ble gjort i Nøstegaten. Dokumentøkonomi, gratis SSB, automatisk brutto og foreløpig netto, originalkildeåpning, teknisk sperre og mobil uten horisontal overflow ble kontrollert. Råbevis og bilder ligger i ignorert `private/incoming/nostegaten-economy-results/`. Hovedagenten inspiserte desktop og mobil visuelt. En misvisende fast advarsel om ukjent eiendomsskatt ble oppdaget her og erstattet med presis omtale av øvrige kostnader.

Den første visningen av25197 som ubetinget delsum ble under review erstattet av et eksplisitt scenario. Dokumentdata beholder `municipalFees.includedIn=null`. `economySuggestions.preliminaryOperatingSubtotal` er derfor null for dette dokumentet; en separat `preliminaryCostScenario` bærer beløp og forutsetning. Kun urørt scenariodrift kan bruke denne projeksjonen. Full D, faktisk nettoyield, kontantstrøm og screening får ingen slik verdi. Selv en avkrysning for kostnadsfullstendighet omgår ikke den uavklarte relasjonen. Tester kontrollerer at manuelt arbeid har forrang og at faktaobjektene forblir uendret.

## Sluttverifikasjon etter alle rettinger

- `npm test` med Node24.21.0: **2159 bestått,7 eksisterende skip**,105 beståtte filer og én eksisterende skipfil,82,82s. Ingen feil eller timeout. Logg `/private/tmp/paa-nostegaten-final2-vitest.txt`.
- `npm run build`: TypeScript og produksjonsbygg bestått. Eksisterende bundle-størrelsesadvarsel består. Logg `/private/tmp/paa-nostegaten-final2-build.txt`.
- `npm run lint`: bestått, ingen advarsler. Logg `/private/tmp/paa-nostegaten-final2-lint.txt`.
- Målrettet sluttpakke etter siste ExtGState-retting: **54/54** bestått. Logg `/private/tmp/paa-nostegaten-final-targeted.txt`. Den uavhengige eksakte ExtGState-font-reproduksjonen returnerer nå unknown med bevart tekst, ikke readable.
- Endelig ekte nettleserprøve: **2/2 bestått uten skip**,45,1s samlet. Rostockgata20,6s; Nøstegaten22,8s. Logg `/private/tmp/paa-nostegaten-final-e2e.txt`.

Nettleserkommando fra repoet, med Node24.21 på PATH:

```bash
PAA_TEST_NORDVIK_REQUIRED=1 PAA_TEST_NOSTEGATEN_REQUIRED=1 PAA_TEST_SSB_NETWORK=1 npx playwright test --config private/incoming/nostegaten-economy.config.ts tests/e2e/rent-real-document.spec.ts --grep 'ekte Nordvik|ekte Nøstegaten' --output=private/incoming/nostegaten-economy-final-results
```

Den private configen gjenbruker prosjektets Playwright-konfigurasjon på isolert port3111, demoserver `node src/backend/server.ts`, tom OPENAI_API_KEY, FINN_IMPORT_ENABLED=false, én Chromium-worker og installert Chromium1243. Den endrer ikke prosjektets konfigurasjon eller miljøfiler. Portabel kommando med standard installert Playwright-browser finnes i README. Produksjonsbygget som testes ble laget etter alle kodeendringer.

Endelig råbevis: `private/incoming/nostegaten-economy-final-results/`, med separate undertre for begge ekte dokumenter, import/leie-respons, fersk uavhengig SSB-fasit og mobil-/desktopbilder. Begge prøver krever tom liste for sidefeil og forsøk på betalte ruter. Disse assertions bestod. Ingen manuell økonomiregistrering skjer i Nøstegaten. Rostockgatas automatiske tall kontrolleres før de gamle, separate prioritetstestene med manuell leie.

Nøstegaten beholder152/152 sider og153005 tegn, med uendret tekst-digest. Økonomisidene8–11 er readable. Sluttkartet har34 readable,115 unknown og3 unreadable; alle poster og tekster er bevart. Dette er **ikke** en påstand om full dokumentlesbarhet: uverifiserte sidebaner, herunder fontvalg via grafikktilstand, forblir sperret. Rapport-OCR86–101 har16/16 feilfrie sider med rasterdigest/tekstlinjer, men teknisk status er fortsatt blocked/incomplete. Ingen generell TG-kvalitet oppgraderes.

Endelige automatisk kildebelagte boligverdier: adresse8[18,54), kommune116[363,397), BRA-i9[1955,1969),2rom8[1478,1498),1soverom8[206,222), leilighet8[103,122) og8[1478,1498). Alle hash-/navn-/readable-/UTF16-sjekker består mot originalens faktiske sideposter. Prisantydning er kildebelagt på8 og12, nullgjeld på8 og11, fellesutgifter på8 og10 med varsel10 og11, kommunale avgifter på8 og10 og skatteinkludering10. Total4152340 og alternativ valgfri total4165330 forveksles ikke.

**Faktisk sluttresultat:**12000kr/mnd,144000kr/år,6700–17700kr/mnd som ukalibrerte scenarioer. SSB2025,03.01/03.02, eksakt2.040; celler12600/11300. Brutto3,56%. Foreløpig118803kr/år og2,93% er betinget av at de dokumenterte kommunale avgiftene kommer i tillegg til fellesutgiftene. Dette vises eksplisitt ved nøkkeltallet, med mulig for høyt fradrag ved overlapping. Dokumentets inkludering forblir null. Hovedagenten inspiserte de ferske sluttbildene visuelt i både1440px og390px; forutsetning, formel og kildeknapper er lesbare uten horisontal overflow.

Rostockgata beholder170 sider, uendret tekstfasit,19/19 OCR-sider og de tidligere kildebelagte tallene. Faktisk SSB-prøve gir18900kr/mnd,226800kr/år, brutto2,64% og foreløpig2,13% etter43920kr/år i kjent delsum. Full netto og kontantstrøm står fortsatt ukjent.

Gjenværende grenser: uavklart inkludering mellom fellesutgifter og kommunale avgifter, kostnadsår, øvrig drift og eier/leietaker-fordeling, uvisst fasade-/heisbeløp, faktisk markedsleie, eksakt bydel og teknisk fullstendighet. Kontantbehov/finansiering har fortsatt krav om kontrollert eierform/engangskostnader og fullstendig grunnlag. Disse blokkeringene erstattes ikke med null. Ingen eksisterende generell sak er lukket. README og sentral deferred-work er oppdatert, uten endringer i tidligere logger eller automatisk promptlogging. Ingen private PDF-er, råresponser eller bilder stages. Ingen betalte AI-API-kall eller push.
