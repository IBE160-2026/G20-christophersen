# Story 3.1 — uavhengig BMAD code review

Dato: 2026-10-21. **Bestått. Story 3.1 done.** Review av kun Story 3.1, implementeringsdiff
`b143d4ba5e4efe48d040852065f64eda87cdc1cc..99d47837d8597f67317bee1c7c7581caaddf60d7`:
14 filer, 858 tilføyelser og 12 slettinger. Autoritet er Story 3.1 AC1–AC6 i
epics, final UX, AD-1/7/10, SPEC CAP-5 og grensekontraktens finansregler,
kortspec og sprintplan/status. Sensorveiledningens kildeuttrekk og
faglærerfeedback brukes for avgrensning, vanlig deterministisk finanskode,
uavhengig fasit og etterprøvbart prosesspor; ingen nye kurskrav er innført.

## Sekvensielle uavhengige lag

Ny reviewagent kjørte fire separate barn én om gangen, og ventet uten egne
filendringer mens barn var aktive. Blind Hunter ga ni kandidater
(73,712 kB → min(floor(sqrt(73,712)+1),10)=9). Edge Case Hunter returnerte
`[]`; tomt lag er registrert etter workflowregelen, uten påstand om edge-funn.
Verification Gap fant ingen hull. Acceptance Auditor bekreftet alle seks AC
og ingen ulåst utvidelse. Deretter fulgte reviewer selv alle aktuelle kallere,
la til egne negative/grensetester og kjørte regresjon sekvensielt.

## Triage — alle ni kandidater

| ID / kilde | Verdikt og bevis | Behandling |
|---|---|---|
| 1 Blind: resultatskjema godtar null/negativ yieldnevner | low som kontraktforbedring. Skjemaet alene tillater dette, men eneste resultatprodusent er calculateFinancialMetrics; den bruker validateFinancialBasis og returnerer unavailable før ratio når P≤0. Ingen nåværende konsument tar imot eksterne finansresultater. P=0/negativ er prøvd. | Forkastet: ekstra semantisk vakthold for konstruert output uten aktuell produsent/innlesingsgrense er ikke en nåværende feil. |
| 2 Blind: alle metrikkfelter tillater begge verdityper | low som typeforbedring. De fire eksplisitte domenekallene produserer riktig kind/enhet. Ingen nåværende konsument skriver feil type eller bruker resultatene uten diskriminering. AC1-fasit kontrollerer de faktiske fire utfallene. | Forkastet: nye metrikkspesifikke outputtyper er ikke nødvendig for korrekt nåværende oppførsel. Ingen senere terskel-/presentasjonskonsument bygges her. |
| 3 Blind: inputmetadata er ikke diskriminert per felt | low som kontraktforbedring. Konstruksjonen henter registered og source med samme field fra skjemavalidert FinancialBasis. L mangler derfor aldri period/year/rentNature i faktisk retur; AC2 prøver identitet med registrerte kilder og verdier. | Forkastet: ingen demonstrert feil vei til ufullstendige metadata; ingen ny parallell validering. |
| 4 Blind: inputlisten godtar feil/tomme/dupliserte avhengigheter | low som kontraktforbedring. Eneste produsent har eksplisitte P/L, L/D, P/L/D, L/D/J-lister og testen kontrollerer disse direkte. Ingen ytre innlesing av et fritt finansresultat finnes. | Forkastet: ingen aktuell feil produsent/konsument; ekstra avhengighetsvalidering ville legge ny regelduplisering til kontrakten. |
| 5 Blind: available-skjema godtar ubekreftet/null grunnlag | low som kontraktforbedring. Produksjonen samler relevante feltfeil før available; alle input/perioder/kilder/bekreftelser og nulltilfeller er prøvd. Rå runtime-null er kontraktfeil i henhold til kortspec. | Forkastet: domenet eier semantisk gyldighet; håndlaget umulig output er ikke en påvist feil i nåværende bruk. |
| 6 Blind: formula er en fri streng | low som kontraktforbedring. Produsenten bruker fire faste formelstrenger; F1-prøven sjekker alle fire. Ingen nåværende flyt mottar eller redigerer formeltekst. | Forkastet: å innføre nye literals/typer ville ikke rette en faktisk feil. |
| 7 Blind: avgrenset årssjekk kan mistolkes som full kontroll | false som aktuell feil. Funksjonens eksplisitte argument angir årsomfang. Bare calculateFinancialMetrics bruker argumentet og leser bare egne felter/commonYear. Alle UI-, session- og mangelvurderingskall bruker default L/D/J; de beholder ulikt-år-feilen. Ingen caller bruker den avgrensede returen som helhetlig bekreftelse. | Forkastet etter kontroll av alle kallere og egne negative default-/delgrunnlagsprøver. |
| 8 Blind: unaffected-test sjekker bare value | low verifikasjonshull. Kontrollgrunnlaget inngår også i kravet om uavhengighet; testen ville ha oversett utilsiktet endring av disse metadataene. | Rettet direkte: assertAffected sammenlikner hele upåvirkede metrikkobjekter. Egne prøver med samtidige J-feil og P/J/Ymin-feil bekrefter full isolasjon. |
| 9 Blind: mangler negative tester av håndlagde resultatkontrakter | low som testforslag. Det er ingen nåværende innlesingsgrense som skal avvise de konstruerte semantiske kombinasjonene fra 1–6; eksisterende skjema eier strukturen, domenet eier beregning/gyldighet. Negative inputprøver treffer den reelle grensen. | Forkastet: ikke innfør nye semantiske outputkrav for å teste hypotetiske outputprodusenter. |

Én direkte testretting, åtte forkastede kandidater, ingen defer eller
decision-needed. Ingen produksjonskode, låst kontrakt, UX eller arkitektur
ble endret. Brukerens forhåndsbestilling autoriserer retting, status og lokal
commit uten ny rutinegodkjenning.

## AC mot faktisk kode og egne prøver

| AC | Etterprøvd bevis |
|---|---|
| AC1 | finance.ts bruker L/P, L−D, (L−D)/P og L−D−J med privat strict big.js. Yield lagrer kanonisk teller/nevner uten divisjon. F1/F2 og 1/3 har faste uavhengige forventninger; formel, enhet og riktige input følger hvert resultat. |
| AC2 | Felles normalisering ganger bare måned med 12 og bevarer registrert tekst, år/periode, faktor, årsverdi og kilde/kostnader. Egen negativ prøve kombinerer blank J, ubekreftelse, ukestøttet periode, annet år og kildekonflikt: de tre uavhengige tallene er helt identiske, cash får alle relevante feil. Defaultkontrollen er fortsatt utilstrekkelig ved ulike år. |
| AC3 | Avhengighetsmatrisen prøver alle fem felt; blank er ingen skjult null, Ymin rammer ingen tall og P=0 rammer bare yield. Egen prøve med samtidig P=0, manglende P-kilde, ubekreftet J=0/ukjent periode/blankt år og ugyldig Ymin bevarer hele gyldig NOI uten gammel verdi for de andre tallene. |
| AC4 | Hver avhengighet prøves for konflikt, ubekreftelse, ugyldig/blank verdi og eksplisitt null. Relevante feil akkumuleres i stabil feltrekkefølge med melding/handling. Runtime-null kastes som strukturell kontraktfeil, ikke konvertert til 0. |
| AC5 | Negative NOI/yield/cash beholdes. Egen prøve annualiserer 0.333333333333333333333333333 til 3.999999999999999999999999996, trekker fra 4 og beholder −0.000000000000000000000000004. Gjeldsplitt og inkluderte kostnader trekkes ikke fra på nytt; ingen nye fratrekk. |
| AC6 | Finansgrensen tar kun FinancialBasis. Rapport/live/demo/TG3 er ikke parametre/importer. Gjentatt fryst input er identisk uten mutasjon; outputobjekter deler ikke inputgrunnlag. Ingen Number/parseFloat/divisjonsavrunding, I/O, KI, terskler, formatering eller anbefaling. |

3.1 endrer ingen interaktiv flate. Tastatur/fokus er derfor kontrollert som
regresjon gjennom den eksisterende bygde appens E2E; det er ingen ny
finansflate eller senere Story 3.6/3.7-UX å prøve i denne storyen.

## Sluttkontroller

Målrettet finance + financial-validation + financial-basis: **150/150**.
67 finansprøver inkluderer tre nye uavhengige reviewerprøver; eksisterende
avhengighetsprøver verifiserer nå hele uberørte resultater.
Full sluttregresjon ble kjørt sekvensielt etter siste testretting:

- `npm test`: **649/649** i 23 filer, 80,84 s. Lokal loopback ble tillatt fra
  første forsøk, i tråd med kjent HTTP-testbehov; ingen ny EPERM-runde.
  [Rålogg](story-3-1-review-unit-kontroller.txt).
- `npm run typecheck` og `npm run lint`: bestått uten feil/advarsler.
- `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-1-2-browsers npm run test:e2e`:
  typecheck/build bestått, **89/89** bygget-app (34,4 s), deretter **3/3** dev
  (1,7 s). [Bygg-/E2E-rålogg](story-3-1-review-e2e-kontroller.txt).
- `git diff --check`: bestått. Eksisterende Vite-varsel om stor PDF-bundle og
  Node-fargevarsler består; ingen ny buildfeil eller runtime-endring.

Storyspec og sprintnøkkel er **done**; Epic 2 er fortsatt **done**, Epic 3 er
**in-progress**. Ingen åpne funn, blockers eller nye beslutninger. R1/R4 og
senere porter er uendret. 3.2–3.9 står i backlog. Neste tillatte steg er bare
ny implementeringsagent for 3.2, deretter separat review/sluttregresjon, og
stopp før 3.3. Ingen push; aktiv løpende JSONL-promptlogg holdes utenfor commit.
