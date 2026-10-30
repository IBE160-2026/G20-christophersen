# Nye dokumenter: automatikk og isolasjon

Brukeren ba om kontroll av en helt ny salgsoppgave, uten gjenbruk av tidligere økonomi/kilder, med full Playwright-flyt og tydelig skille mellom kode og KI. Ingen betalte API-kall eller push.

## Tilgjengelig grunnlag og grense

Ved kontroll fantes bare `private/incoming/salgsoppgave.pdf` og kopien `private/representative-cases/real-01/original.pdf`. Ingen annen ekte salgsoppgave var opprinnelig tilgjengelig. Brukeren ble spurt om filstien og oppga deretter `Downloads/Salgsoppgave.PDF`. Den er kopiert til ignorert `private/incoming/new-salgsoppgave.pdf`; SHA-256 er forskjellig fra den tidligere originalen. Første del av testene nedenfor gjelder **nye syntetiske PDF-er**; egen test av den nye ekte PDF-en følger etterpå. Testverdier er eksplisitt merket syntetiske i dokumentinnholdet og brukes aldri som erstatning for ukjente produktverdier.

## Utført test

[Ny Playwright-regresjon](../../../tests/e2e/new-document-import.spec.ts) oppretter PDF-er med unik UUID/hash ved hver kjøring via [testhjelper](../../../tests/helpers/new-prospectus-pdf.ts). De finnes ikke i demoregisteret, har ingen tidligere modellrespons og går gjennom faktisk filvalg, HTTP-opplasting, PDF-worker, lokal parser og Konsept A. Standard Playwright-konfig inkluderer nå testfilen.

Tre tilfeller kjørt i synlig lokal Chromium mot `http://localhost:3000`:

1. Tom økt med ny tekstbasert PDF: pris, fellesgjeld, omkostninger og kostnader i støttet feltformat leses fra den nye filen. Periode og år bevares. Manglende felt forblir ukjente. Kildeknappen åpner den nye PDF-en og tekstlaget har den nye verdien.
2. Ny PDF med økonomi i fritekst og fakturalignende beløp: dagens parser gir ingen økonomiske beløp eller feltkilder. Grensesnittet viser mangler og at videre KI-analyse ikke har startet. Ingen utfylling fra tidligere eiendom.
3. Den tidligere ekte PDF-en lastes først inn med lagret analyse; egne leie-/driftsforutsetninger og finansiering legges inn. Deretter lastes en helt ny syntetisk PDF opp **med samme filnavn**. Ny hash/ny økonomi brukes; tidligere hash finnes ikke i ny respons, ingen tidligere feltkildesitater gjenbrukes, manuelle forutsetninger/egenkapital nullstilles, og originalvisningen åpner den nye PDF-en. Dette tester hashbasert isolasjon utover filnavn.

Alle nye feltkilder kontrolleres mot ny hash, aktuelt dokumentnavn og nøyaktig tekstspenn i den nye PDF-ens sider. Proveniens er `local-only`, lagret requestDigest er null, ingen lagrede observasjoner/valgte analysesider følger med. Kostnadsporten er blocked og reservasjonen er null. Tekniske porter beholdes sperret. Yield/kontantstrøm blir ikke beregnet uten nødvendig grunnlag. Konsollfeil/pageerrors, eksterne nettverkskall og `/api/analysis`-kall: ingen. Kun den lokale dokumentimporten utføres.

## Hva fungerer automatisk

- Opplasting, format-/hashkontroll, fysisk sideoversikt, lesing av tilgjengelig tekstlag og kildeåpning.
- Den lokale grammatikken krever en hel feltlinje av typen `Prisantydning: 4 242 000 kr`, med enkelte støttede felt og eventuell `per måned`/`per år`/årstall. Dokumentet er autoriteten for disse testbeløpene. Dette er en snever feltparser, ikke generell forståelse av salgsoppgaver.
- Eksplisitt adresse/eierform kan foreslås ved støttede etiketter. Ukjent blir ikke antatt null eller bekreftet.

Fritekst, tabellsemantikk, inkluderingsrelasjoner, økonomiske forbehold og fullstendig kostnads-/leiegrunnlag tolkes ikke generelt av dagens automatiske kodeuttrekk. Dette krever videre KI-tolkning eller menneskelig registrering/kontroll; **ny KI-analyse er ikke aktivert i opplastingsløypen**. Visning av et modellnavn betyr ikke at modellen er kalt. Den tidligere 11/11-responsen er gjenbruk bare for identisk tidligere dokument, ikke bevis på automatisk analyse av nye dokumenter.

## Resultat og gjentakelse

`npx playwright test --config=private/incoming/new-document.config.ts --headed`: **3/3 bestått, ingen skip**. Den private lokale konfigen velger allerede installert Chromium 1243 og eksisterende localhost-server; ingen installasjon, eksterne tjenester eller API-nøkkel er brukt. Normal kjøring av den versjonerte testfilen: `npx playwright test tests/e2e/new-document-import.spec.ts` etter bygg, med standardforutsetningene i repoet. Den tredje testen markeres uttrykkelig skip i en annen checkout hvis den tidligere private originalen mangler; de to generiske testene kjører alltid.

Typecheck og lint består. Ingen produktkode eller analyseport er endret. Ingen betalte API-kall, private dokumenter i git eller push. Den nye ekte salgsoppgaven er deretter testet som beskrevet nedenfor. Dette dokumenterer nåværende begrensning, ikke godkjent fullstendig økonomiuttrekk.


## Den nye ekte salgsoppgaven

Etter at brukeren oppga filstien ble to ekstra tilfeller lagt til i samme versjonerte Playwright-testfil. `PAA_UNSEEN_PDF` velger den private nye originalen; normal checkout uten dette valget markerer bare disse to ekte-dokument-testene som eksplisitt skip. Hele testsettet ble kjørt med privat fil valgt: **5/5 består, ingen skip**, 24,4 sekunder. Begge ekte-dokument-tilfellene går gjennom den faktiske brukerflaten på localhost:3000, ikke et stubbet analysesvar.

- Tom økt: ny ekte PDF lastes opp, utfallet kontrolleres mot ny hash og faktisk lokal import, alle visbare felt har korrekt proveniens og status. Originalens første side åpnes i PDF-visningen.
- Etter tidligere ekte PDF: den gamle lagrede analysen og egne leie-/drifts-/finansieringsforutsetninger er til stede først. Deretter lastes den nye ekte PDF-en opp under **samme filnavn** som den gamle. Nye kilder/ny hash brukes, gammel hash og gamle kildeutdrag finnes ikke i nytt resultat, gamle forutsetninger tømmes og ingen lagret analyse følger med. Ny originalside kan åpnes.

**Faktisk resultat på den nye ekte PDF-en: 135 sider, null økonomiske beløpsfelt, to adresse-/identitetsbelegg.** Feltparseren klarer dermed ikke å hente økonomitallene automatisk fra denne salgsoppgaven. PDF-lesing, sidekartlegging, originalvisning, lokale identitetsbelegg og dokumentisolasjon fungerer. KI-porten er blocked, reservert beløp er null, og det er ingen konsollfeil/pageerrors, eksterne nettverkskall eller `/api/analysis`-kall. Yield/kontantstrøm er ukjent. Ingen testresultater tolkes som at økonomianalysen har lykkes bare fordi testen består.

Kjøring: `PAA_UNSEEN_PDF=private/incoming/new-salgsoppgave.pdf npx playwright test --config=private/incoming/new-document.config.ts --headed`. De to ekte tilfellene kjøres også separat med JSON-reporter for privat respons-/skjermbildebevis under `private/incoming/new-document-playwright-report.json`. Ingen dokumentverdier eller skjermbilder fra den ekte PDF-en legges i git.

Dette underbygger at [PAA-SO2 fortsatt er åpen](../../implementation-artifacts/deferred-work.md): tidligere gjenbruk av 11/11-resultatet er ingen generell ny-dokument-pipeline. Brukerens bestilling her var kontroll/verifikasjon; ingen ny KI-aktivering, parserutvidelse eller betalt analyse er utført.

## Ekstra funn ved visuell kontroll

Privat originalside og respons ble kontrollert fra JSON-rapportens vedlegg. De to identitetskandidatene er **ikke korrekte adresser**: de kommer fra tomme skjemafelt på fysisk side 134, der parseren tar med neste etikett etter `Adresse:`. Verdiene er generiske skjemaetiketter (`Oppdragsnummer:` og `Postnr.: Sted:`). Regexen i `src/backend/import/local-plan.ts` bruker `\s*`, som kan gå over linjeskift etter en tom adresseetikett. Kildehash/tekstposisjon er teknisk korrekt, men semantikken er feil. UI viser adressekonflikt og bekrefter ikke identiteten. Eierform er ukjent og har null kildebelegg.

Dette er registrert som åpen **PAA-SO3** i den sentrale oversikten. En tidlig statusmelding kalte de to beleggene eierformsbelegg; etter responskontroll ble dette uttrykkelig korrigert til identitetsbelegg, og deretter klassifisert som falske adressekandidater. Ingen korrekt adresse-/eierformsgjenkjenning hevdes for denne PDF-en.

De to ekte Playwright-tilfellene ble til slutt kjørt på nytt for lagring av privat JSON-bevis: **2/2 består**, 15 sekunder, uten eksterne kall. Testene verifiserer sikker dokumentisolasjon og ærlig sperret analyse; de er ikke en fasitgodkjenning av korrekt økonomi-/adresseuttrekk. Typecheck og lint består etter testtilleggene.
