# Story 3.6 — uavhengig BMAD-review

Dato: 2026-10-21. Modus: **full**. Diff: `db45d35cf8eae885b9fb4426b15ab281e227c689..a6603f1d292bc4653a491a67653439c20c0e6ba2`. 17 filer, +572/−6. Reviewagenten er separat fra implementeringsagenten.

## Autoritet og arbeidsmåte

Story 3.6 AC1–5, frozen storyspec, Epic 3-kontekst, SPEC CAP-5/resultatdelen av CAP-6, grensekontraktens Finans og screening/Endring og gyldighet, AD-1/2/7/9/10 og final DESIGN/EXPERIENCE styrer gjennomgangen. PRD-addendum gir håndskrevet BT-fasit. Faglærerfeedback og kursveiledningens sidehenviste uttrekk begrunner sporbarhet, avgrensning og relevant verifikasjon, uten nye produktkrav.

`bmad-code-review` ble lest og workflow løst med resolveren. Fire uavhengige lag kjørte **sekvensielt** med samme modellkapabilitet: Blind Hunter → Edge Case Hunter → Verification Gap Reviewer → Acceptance Auditor. Brukerens eksplisitte sekvenskrav overstyrte parallellstandarden. De tre første fikk egne instruksjoner/diffstier uten samtalekontekst; edge fikk separat claims-fil med commitmeldinger. Acceptance fikk storyspec og autoritetskilder. Ingen prosjektfiler ble endret før alle lag var ferdige. Brukerens bestilling om å rette funn autoriserte patchene, uten ny bekreftelse.

Blind-gulv: 54 922 byte / 1000 = 54,922 kB; min(floor(sqrt(54,922) + 1), 10) = 8. Åtte kandidater ble levert. Verification Gap leverte ett forhåndsverifisert gap med konkret mutasjonseksempel. Acceptance fant ingen sikre AC-avvik ved direkte komponentgrense og henviste samlet plassering til 3.7. Edge returnerte `[]`; dette er registrert som **tomt lag** etter workflowets feilregel, ingen edge-funn å triagere. Øvrige lag og egen konkret kilde-/regresjonskontroll ble gjennomført; rapporten påstår ikke fire funnbærende lag.

## Individuell triage før gruppering

| ID / lag | Kandidat og verifisert bevis | Dom / tiltak |
|---|---|---|
| B1 / blind | `.metric-grid` har bare to kolonner ved 1440 px. DESIGN Layout & Spacing sier fire tall samlet i én rad når plass tillater det. En ny direkte komponentprøve viser to ulike toppkoordinater før retting. | **low**, patch. Én avgrenset bred CSS-regel er en direkte korreksjon av komponenten; ingen samlet Resultat-rute bygges. 3.7 må fortsatt kontrollere faktisk appplassering/zoom. |
| B2 / blind | `minimumDetailValue` finnes også når numerisk Ymin er ubekreftet eller konfliktfylt. `NetYieldThreshold` har da decision unavailable med årsaker, mens komponenten likevel kaller verdien Eksakt minimumskrav uten kvalifikasjon. Begge nye prøver feiler før patch. | **medium**, patch. Konsumer eksisterende terskelavgjørelse/årsaker; vis ikke gyldig anvendt krav ved unavailable. Ingen ny gyldighetsregel. |
| B3 / blind | Ymin-registrering, kilde og bekreftelse finnes allerede i terskelgrunnlaget, men desimalvisningen utelater dem. Ny prøve finner ikke kontrollerbar registrering/opphav ved gyldig krav. | **medium**, patch. Vis bevart grunnlag sammen med eksakt verdi, også ved unavailable. Ingen ny kontrakt. |
| B4 / blind | Kostnadsdetaljen hevder ubetinget at postene allerede inngår i D/J-totalene, selv ved ugyldig oppdeling eller cost-exceeds-total. Begge tilstandene kan lages gjennom eksisterende reducer før calculate-result. | **medium**, patch. Formuler eksisterende regel som krav om at innhold skal inngå, uten påstand om gyldig faktisk inkludering. Ikke vis manglende årsfordeling som en ferdig sum. |
| B5 / blind | Ved ugyldig råbeløp viser komponenten bare Ikke avklart i den avledede fordelingen og mister registrert rawAmount/rawDebt. Ny prøve med beløp ukjent og renter/avdrag 200 feiler før patch. | **medium**, patch. Bevar registrert beløp og rentedel tydelig atskilt fra avledet fordeling. |
| B6 / blind | `includedIn` vises bare ved status included. Ved ugyldig relasjon/oppdeling er valgt forelder fortsatt bevart i kontrakten, men borte fra detaljene. Ny prøve med ugyldig Forsikring inkludert i Felleskostnader demonstrerer tapet. | **medium**, patch. Vis registrert relasjon med kontrollbehov ved annen status. |
| B7 / blind | BT-1-prøven krever bare at en formel finnes for tre av kortene. En feil formel på riktig kort kunne passert. | **medium**, patch. Fire håndskrevne eksakte formeltekster er nå knyttet til hvert sitt kort; eksisterende domeneformler endres ikke. |
| B8 / blind | Direkte komponentprøver mangler konfliktfylt/ubekreftet numerisk L og ugyldig kostnadsinkludering. Andre logikktester beviser ikke rendering av årsaker eller rågrunnlag. | **medium**, patch. Nye faktiske snapshot-/React-/Chromium-prøver bruker eksisterende reducerhandlinger og kontrollerer årsaker og ikke-anvendte normaliserte verdier. |
| V1 / verification-gap | Komponentens issue.action kan slettes uten at komponenttestene feiler; eksisterende årsaksassert og unit-test av presentasjonsdata renderer ikke handlingen. Lagets forhåndsverifiserte gap godtas etter workflowet. | **medium**, patch. Parameteriser håndskrevne handlinger for manglende L/J og ugyldig P, og assert dem i hvert berørt synlig kort. |

Alle ni individuelle kandidater er beholdt og rettet. Ingen rejected, decision-needed eller defer. B2/B3 deler terskelrendererens manglende tilstand/opphav og er håndtert samlet; øvrige punkter beholder sine individuelle utfall og bevis. Ingen ny produkt-/arkitekturbeslutning eller endring i autoritative krav.

## Retting og verifikasjon

`NetYieldBasis` viser registrert Ymin, kilde/forutsetning, eventuell konflikt og bekreftelse fra det samme snapshotet. Den bruker eksisterende decision.status og issues: unavailable viser konkret årsak/handling, mens gyldig avgjørelse viser eksakt krav. Fire finansresultater er uendret også ved ubekreftet/konfliktfylt Ymin. Ingen nye validerings- eller screeningregler er lagt i UI.

Kostnadsdetaljene bevarer råbeløp/renter-avdrag og registrert inkluderingsrelasjon også ved ugyldig oppdeling. Teksten forklarer regelen om D/J-totalene uten å godkjenne mangelfullt innhold. Manglende årsfordeling vises som kontrollbehov; gyldig innhold beholder allerede eksisterende avledede summer og fratrekkes aldri på nytt. En bred CSS-regel gir fire kolonner fra 1200 px; smal flate bruker fortsatt én kolonne.

Fasebevis på Node **24.21.0**, npm **11.19.0**, med lokal Chromium-cache `/private/tmp/ibe160-story-3-5-browsers`:

| Kjøring | Resultat / bevis |
|---|---|
| Nye komponentforventninger mot urettet produksjon | **6 feilet / 18 bestått**; [rød logg](story-3-6-review-rod.txt). Feilene gjelder bred rad, to ugyldige Ymin-tilstander, gyldig Ymin-opphav, ugyldig kostnadsspor og kostnad over total. |
| Samme komponentprøver etter retting | **24/24 bestått**; [grønn komponentlogg](story-3-6-review-komponenter.txt). Åtte nye prøver; to L-mangelgrener og skjerpede eksisterende formel/handlingsasserts består også. |
| Finans, terskler, presentasjon, snapshot og samlet screening | **333/333 i fem filer**; [målrettet Vitest](story-3-6-review-malrettet.txt). |
| Typecheck | Exit 0; [logg](story-3-6-review-typecheck.txt). |
| Lint | Exit 0; [logg](story-3-6-review-lint.txt). |
| `git diff --check` | Bestått. |

Første forsøk på lokal Chromium-start ble blokkert av sandkassens Mach-portbegrensning. Den faktiske rød/grønn-kjøringen ble deretter gjennomført med autorisert lokal kjøring utenfor sandkassen. Det krevde ingen nettjeneste, betalt API eller produktendring. Før kjøring ble håndskrevne feil-/handlingstekster avstemt mot eksisterende kontrakttekster; ingen produksjonsregel ble endret for å tilfredsstille testene.

Komponentbeviset er faktisk serverrendret React med native details/summary, ikke hydrering eller samlet appflyt. Full Vitest, bygg/bygget-app/dev-E2E, typecheck/lint og komponentprøver tas sekvensielt av orkestratoren på siste mini-sprintcheckpoint. De påstås ikke nykjørt her. Ingen live-/S2-/S5-/S6-bevis.

## AC og checkpoint

AC1: Fire faste navn/verdi/enhet/år og negativt resultat beholdes; konkrete mangler og nå eksplisitt testede rettingshandlinger vises. AC2: Faktisk rapportfeil, ubekreftet liste og uavklart TG3 beholder tallene som Delgrunnlag. AC3: Anvendte og registrerte verdier/perioder, faktor, årsverdi, kilde, råkostnader og D/J-fordeling er kontrollerbare uten nye fratrekk. AC4: Eksisterende presisjonsforklaring/uavrundet detalj/eksakt gyldig krav bevares; ugyldig Ymin utgir seg ikke for anvendt gyldig krav. AC5: Native tastatur/åpen-lukket/fokus og historiske DESIGN-tokens består; bred rad og smal ombrytning er kontrollert ved direkte grense.

**Bestått review etter retting. Ni individuelle patchpunkter lukket, null åpne eller utsatte funn. Story 3.6 settes done i spec og sprintstatus.** Samlet Resultat-rute/anbefaling/rapport og faktisk plassering/zoom/fokusflyt tilhører fortsatt 3.7. Ingen 3.7+ er implementert i denne reviewfasen, ingen push. Lokal commit rapporteres med canonical hash fra Git. Aktiv automatisk promptlogg holdes utenfor fasecommiten.
