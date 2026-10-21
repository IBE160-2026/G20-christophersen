# Story 3.7 — egenverifikasjon før uavhengig review

Dato: 2026-10-21. Baseline: `fcc87c6e4b13fdaf03271dd0b7825804ec2e6412`. Avgrensning: første samlede Resultat, ikke fornyelsesflytene i 3.8/3.9. Node 24.21.0/npm 11.19.0; Chromium er allerede installert lokalt under `/private/tmp/ibe160-story-3-5-browsers`. Ingen ekstern tjeneste, nøkkel eller betalt API brukes.

## Autoritet og utførelse

Story 3.7 AC1–6 i epics, gyldig Epic3-context, done-spec/review3.6, SPEC CAP-3–8/grensekontrakter, PRD FR-5/8–18/NFR-1–3, F1/F2/F4-fasit og final DESIGN/EXPERIENCE/AD-2/6–10 er grunnlaget. Kursuttrekk med sidehenvisninger og faglærerfeedback begrunner smal kjerne, sporbarhet og uavhengig fasit uten nye krav.

BMAD build bruker forelders allerede rendrerte workflow fra `57f4ed62cedae302de1d`; step01, step02, spec-template, oneshot og sprint-sync er lest. En sekvensiell, read-only undersøkelsesagent kontrollerte autoritet/UX/kilde- og returføring før implementering. Ingen intentgap eller ny beslutning. Den eksplisitte mini-sprintbestillingen autoriserer avgrenset implementering og lokal commit; separat uavhengig review følger etter handover. Build-implementeringen kjører derfor ingen reviewlag og setter ikke done.

## Resultatet og AC-spor

| AC | Konkret bevis |
|---|---|
| AC1 | F1/F2/F4 gjennom ekte bygget app, kontrollerte originale PDF-er og ordinær demo-/HTTP-adapter. Ett kodeutfall og prioritet øverst; alle domain-utløsere og neste handling er åpne. Fire verdier er håndskrevet i testen: F1/F4 11,875 %, 1 500 000, 9,375 %, 700 000; F2 8,750 %, 1 000 000, 6,250 %, 200 000. TG3 og uavklart brukerstatus er synlig, ingen detalj kreves for utfallet. |
| AC2 | Bygget-app-prøver betjener opphavsdetaljer, brukt korrigering og avvist original; originale KI-tekster og fysisk side bevares. Se originalside navigerer til eksisterende PDF-kontrollflate; F4 viser fysisk PDF-side 4, ikke trykt side 2. Selv uten valgt funn kan hele originalrapporten åpnes fra side 1 gjennom samme kontrollflate. Direkte komponentprøve verifiserer Avklart, faktisk begrunnelse og ekstern referanse uten å fjerne TG3 eller påstå teknisk godkjenning. |
| AC3 | Komponentgrensen produserer reell domain-screening ved manglende J og ubekreftet liste: begge blokkere/handlinger beholdes; kontantstrøm er Ikke beregnbart mens øvrige tall består. Analysefeil med lang lokal årsak og berørt side vises som kompakt kode/mål, uten full lokal årsak. Reelle begrensninger beholder eksisterende kritisk behandling. Ingen ny navigasjon til sperrede feiltilstander er laget. |
| AC4 | Komponentprøver viser Ikke beregnet uten anbefaling/tall, historisk finans, brukt retting, rapportbytte og ubrukt utkast. Snapshotets tall/funn/anbefaling endres ikke. Bygget app endrer L og viser historisk Gå videre og tidligere NOI med konkret endring/kontrollbehov. Tidligere PDF-henvisning utgis ikke for ny original. |
| AC5 | F1/F2/F4-prøvene returnerer til begge tidligere trinn og kontrollerer overskriftfokus, bevart L, bekreftet liste og samme anbefaling uten nye analyser. Nettobservasjon krever nøyaktig ett analysekall og ingen ekstern forespørsel. Demo-merking beholdes i header og analyseopphav. Ingen score, kjøps-/ekstern handling. |
| AC6 | Faktiske Enter/Space-kontroller og native details åpen/lukket; synlig fokus og beholdt fokus. MutationObserver måler én statusendring ved første beregning og én ved historisk skifte, ingen gjentakelser fra detaljer/trinnretur. 1440×900, 1280×800 og 720×450 (1440×900 ved200% tilsvarende CSS-flate) har lesbar ombrytning uten horisontalt innholdstap. Sticky stepper blir synlig under arbeidsrulling. Historisk trinn/status er navngitt også utenfor Resultat. |

## Integrasjonsfunn og retting

Første reelle F1/F2-kjøring ga feilaktig Innhent mer informasjon. Rotårsaken var de fire lagrede demo-fixturene fra 2.4: `limitations` inneholdt bare opphavsdisclaimeren «Kontrollert, fiktivt lagret demo-uttrekk; ingen ny eller gjennomført live-analyse.» Eksisterende felles `assessFindingList` behandler alle limitations som kritisk rapportmangel, slik den skal.

PRD FR-6.5/NFR-3, AD-6 og Story 3.7s eksplisitte F1/F2-fasit skiller demoopphav fra kritisk rapportmangel og krever alle tre utfall i merket demo. Den ene feilplasserte metadataopplysningen er derfor fjernet fra limitations i akkurat de fire komplette fiktive svarene. Opphavsdisclaimer er bevart ordrett i `src/backend/analysis/data/README.md`; header og analyseopphav viser fortsatt Demo · lagret KI-uttrekk. Kontrakt, adapterlogikk og kritisk mangelautoritet er uendret. Ingen runtime-filtrering eller egen demoregel er laget. Forelder fikk rotårsak/autoritet før retting og autoriserte denne nødvendige fixturekorreksjonen innen 3.7. Oppdatert integration-forventning krever tomme faktiske rapportmangler, mens eksisterende mode-/kontrakt-/originalbevis beholdes.

[Rød F1/F2-/historikk-kjøring](story-3-7-e2e-rod.txt) bevarer førtilstanden; etter korreksjon består alle tre utfall. Berørt eksisterende 2.11-E2E forventet tidligere Resultat permanent sperret selv etter fullført kontroll. Bare denne foreldede forventningen er oppdatert til 3.7s tilgjengelige trinn; sperret Resultat ved faktisk ufullført analyse består. [Førlogg](story-3-7-e2e-foreldet-test.txt) og [isolert grønn kontroll](story-3-7-e2e-kontrollport.txt) dokumenterer dette. Ingen produksjonsport er svekket for å gjøre testene grønne.

## Testresultater

- **182/182 Vitest i seks filer**: nye navigasjonsprøver, snapshot, presentasjon, funnliste, screening og ekte demo-/PDF-integrasjon. [Logg](story-3-7-malrettet.txt). Tidligere egen statekjøring:65/65 i to filer, [logg](story-3-7-state.txt).
- **31/31 Chromium-komponentprøver**:24 eksisterende nøkkeltall og 7 nye Resultatprøver. [Logg](story-3-7-komponenter.txt). Faktisk serverrendret produksjons-React/native disclosure; hydrerings-/appflyt bevises separat i E2E.
- **67/67 berørte bygget-app-E2E**: shell, rapportkontroll og 7 nye Resultatprøver. [Logg](story-3-7-e2e.txt).
- Typecheck, lint og produksjonsbygg består. [Typecheck](story-3-7-typecheck.txt), [lint](story-3-7-lint.txt), [bygg](story-3-7-build.txt). Kun kjent størrelsesvarsel for eksisterende PDF/app-bunt.
- `git diff --check` består før commit. Full siste Vitest-/bygget-app-/dev-regresjon tas av forelderen etter separat uavhengig review og påstås ikke utført her.

## Visuell og tastaturbasert QA

Agenten har inspisert faktisk produserte nettleserbilder for de tre anbefalingene, F4s synlige alvorlige funn/detaljkontroll, komponentdelgrunnlag og historisk ombrytning. Forelderen har også inspisert representative F1/F4/historisk-bilder. Dette er agentgjennomført visuell kontroll og faktiske nettleserinput; ingen separat menneskelig S6-test eller WCAG-sertifisering påstås.

- [F1 oversikt](story-3-7-ui/F1-oversikt.png), [F2 oversikt](story-3-7-ui/F2-oversikt.png), [F4 oversikt](story-3-7-ui/F4-oversikt.png): anbefaling/kort grunn/utløsere/neste handling før fire tall; etiketter, år og norske verdier beholdes. Alvorlig funn og aktiv kildereferanse ligger åpent i rapportdelen, som kan nås med normal arbeidsrulling.
- [F4 detaljkontroll](story-3-7-ui/F4-detaljkontroll.png): alvorlig TG3, separat Uavklart, fysisk side 4 og tydelig disclosure/fokus uten å skjule alvorligheten.
- [Historisk 200%](story-3-7-ui/historisk-200-prosent.png): trinnnavn/status ombrytes, historisk banner og konkret kontrollbehov beholdes. 720×450 er tilsvarende CSS-flate, ikke påstand om separat endring av OS-/nettleserzoom.
- [Delgrunnlag](story-3-7-ui/delgrunnlag.png): synlig anbefaling og begge faktiske blokkere; gyldige tall og Ikke beregnbart skilles.

Visuell kontroll fant ingen avklippet nødvendig tekst eller fokusmål. Lukkede detaljer skjuler bare detaljer, ikke anbefaling/utløsere/neste handling/TG3-status. Historisk bruker sekundærflate uten lav samlet opasitet. Beregnede kontrastpar fra de faktiske CSS-tokenene er minst 5,2061:1 for svakeste kontrollerte informasjonstekst, 5,8590:1 for fokus og 3,3314:1 for kontrollgrense. [Kontrastlogg](story-3-7-kontrast.txt); shell-E2E måler i tillegg faktisk bygget app.

**Checkpoint: in-review / review.** Ingen ny produkt-/arkitekturbeslutning eller blocker. Ingen 3.8+, push, live-kjøring, S2-/S5-/S6-bevis. Separat BMAD-review avgjør done og eventuelle funn.
