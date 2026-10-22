# Epic 5 Context: Gjennomføre og etterprøve v1 som sensor fra README

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

En annen person skal kunne forstå, installere, bygge, starte og teste den lokale demoen fra README uten gruppens nøkkel, betalt konto eller særskilt infrastruktur. Etterprøvbare bevis skal knytte godkjent produktretning til faktisk kode, kvalitetssikring og leveranseversjon, med ærlig status for demo, live-funksjonalitet og åpne avvik. Dette er leveransekontroll av den smale førstevurderingen av ett boligutleieobjekt, ingen utvidelse av produktet.

## Stories

- Story 5.1: Etterprøve den samlede demoen med meningsfulle automatiserte tester
- Story 5.2: Etterprøve hele den felles brukerflyten og grunnleggende tilgjengelighet
- Story 5.3: Dokumentere en komplett oppskrift for lokal demo og tester
- Story 5.4: La en annen person gjennomføre README-basert ren kjøring
- Story 5.5: Samle etterprøvbare leveransebevis og kontrollere repoet

## Requirements & Constraints

- Verifiser faktisk funksjon mot forhåndsdefinert, uavhengig finans-/rapport-/anbefalingsfasit. F1 gir Gå videre, F2 Forkast, F3 manglende leie og F4 uavklart alvorlig TG3 gir Innhent mer informasjon. Manglende beregninger er egne tilstander, aldri oppdiktede nullverdier.
- Beregningsfasit tillater høyst 1 kr og 0,01 prosentpoeng avvik; terskelregler har ingen toleransemargin. Skill blank/null, år/måned, kildekonflikt, negative tall, likhet/én krone under, samtidige økonomiske brudd og alle avgjørende mangler.
- Spor eksisterende RT-/BT-/AT-/FR-5-eksempler til faktiske testgrenser. Kjør meningsfull regresjon av leverte moduler, grenser og bygget app; fyll konkrete hull innen opprinnelig funksjonsansvar. Ingen ny dekningsprosent, generell omskriving eller produktvei innføres for å gjøre en test mulig.
- Dokumenter versjon, miljø, kommando, forventet/faktisk resultat, krav-/storyspor, retting og relevant ny kontroll. Bevar viktige prompts, arbeidsøkter og konkrete reviewfunn. Planer, testtitler og mocks alene er ikke produktbevis.
- Demo etter installasjon/browserforberedelse fungerer med eksternt nett sperret og uten nøkkel. README skal stemme med faktisk installasjon, build, loopback-oppstart, utvikling, browserforberedelse, tester, casefiler og kontroll-/returflyt. Installasjon kan kreve nett.
- Skill bestått, feilet, ikke kjørt og ikke verifisert. Demo beviser ikke opprinnelig live-uttrekkskvalitet eller live-tid; S6 krever faktisk annen person og rent dokumentert miljø. Ingen hemmeligheter eller private originaler lagres som bevis. Bevis må fortsatt gjelde endelig leveranseversjon.

## Technical Decisions

- Test faktiske rene validerings-, finans-, terskel-, screening- og formateringsgrenser separat. Eksakte desimalverdier ligger til grunn for regler; avrunding er presentasjon. Prioritet er kritiske mangler/ubekreftelser/uavklart TG3, deretter økonomiske brudd, ellers Gå videre. Vis alle utløsere på avgjørende nivå med fast kodebegrunnelse og neste handling.
- Modul-/integrasjonstester bruker uavhengig fasit og virkelige PDF-fixtures. Automatisert E2E kjører bygget lokal app med kontrolladapter ved produktets adaptergrense, uten betalt API. Kontroller status, side, revisjon og faktiske kallantall, inklusive duplikater, sene svar og ny rapport. Ikke-nåbare hovedreisetilstander verifiseres ved relevant ren modul-/reducer-/komponentgrense.
- Én delt runtime-validert kontrakt skiller completed fra failed; gyldig tomliste krever faktisk fullføring og senere menneskelig listebekreftelse. Originalbytes og PDF-posisjon fra 1 bevarer kildeidentitet. Uleselig/usikkert/ufullstendig dokumentgrunnlag blir aldri vellykket tomliste.
- Frontend eier midlertidig økt, original, utkast, gjeldende liste, separat TG3-avklaring og revisjonsbundet resultatsnapshot. Navigasjon alene bevarer gyldighet. Brukte endringer krever relevant ny kontroll; gammelt resultat er historisk. Uendret uttrekk gjenbrukes uten nye adapterkall. Ny rapport krever ny analyse/kontroll.
- Lokal levering bruker bygget frontend og API på samme loopback-origin med lokale PDF-/worker-/font-/demoressurser. Demo er standard, oppretter ingen KI-klient og viser lagret opphav. Faktisk live-funksjonalitet er fortsatt påkrevd v1-arbeid med separat konfigurasjon/evaluering.

## UX & Interaction Patterns

- Følg Tallgrunnlag → Tilstandsrapport → Kontroller funn → Resultat med synlig stepper/status og lokale feil/nødvendig handling. Kritiske mangler forklares i problemtrinnet uten omvei til Resultat.
- Skill opprinnelig uttrekk, ubrukt utkast, Bruk/Avbryt, avvisning, enkeltfunn-/listebekreftelse og separat brukerbekreftet TG3-avklaring. Resultat viser anbefaling, kort grunn, avgjørende regler, fire tall, alvorlige forhold, mangler og neste handling uten detaljåpning. Formler, original og kilder åpnes ved behov.
- Kontroller manuelt de fire UX-flytene, tastatur, synlig fokus, etiketter/enheter/feil, korte enkeltstående statuskunngjøringer og historisk/delvis resultat. Grafitt/petrol og designets geometri/typografi gjelder; praktiske kontrastmål er 4,5:1 for informasjonstekst og 3:1 for nødvendige kontrollgrenser/fokus, uten sertifiseringspåstand.
- Prøv 1440×900, 1280×800 og relevant zoom. Fra 1200 CSS px vises funn/PDF omtrent 44/56 med 24 px gap; under grensen åpnes PDF-panel ved behov. Korrekt kilde-side, hel side/nabosider, valgt funn og utkast beholdes; Esc/retur gjenoppretter fokus. Stepper/zoom skjuler ikke innhold eller fokuserte kontroller.

## Cross-Story Dependencies

- 5.1 og 5.2 bygger på ferdig rapportkontroll og resultat-/endringsflyt i Epic 2/3. 5.3 krever 3.9 og 5.1; 5.4 krever 5.1–5.3 og organisert annen person/rent miljø. 5.5 krever 4.3–4.5 og 5.1–5.4.
- Sprintplanen tillater 5.1–5.4 før Epic 4. Felles offline-UX og komplett demooppskrift er avgrensede leveranser; live-spesifikke tilstander/anvisninger og samlet v1-bevis følger senere. R1 for live og R4 for faktisk S5/S6 er åpne gjennomføringsporter, ikke valg denne epic-konteksten lukker.
