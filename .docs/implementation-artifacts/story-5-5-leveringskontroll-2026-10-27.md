# Story 5.5 — leveringsforberedelse, delvis gjennomført

Dato: 2026-10-27. **Formell status: in-progress. Ingen fullført v1 påstås.**
Mads bestilte uttrykkelig de delene som kan utføres uten ekstern S6.
5.4/R4-S6 er fortsatt åpen, og 4.5 beholder S5-W1 og formell in-progress.
Dette dokumentet endrer ingen låste AC, fasiter eller evalueringsobservasjoner.

Kilder: [5.5 AC1–AC6](../planning-artifacts/epics.md#story-55-samle-etterprøvbare-leveransebevis-og-kontrollere-repoet),
[SPEC og kapabiliteter](../specs/spec-IBE160/SPEC.md),
[låst sporbarhetskart](../specs/spec-IBE160/sporbarhet.md),
[arkitektur](../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md),
[UX](../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md),
[sensorveiledning](../reference/course/Sensorveiledning-IBE160-Del-1.pdf)
og [faglærerfeedback](../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md).
Den godkjente smale v1-retningen med ett objekt, fire kodeberegninger og
menneskelig rapportkontroll er bevart.

## Versjon og faktisk bevisgrense

Utgangspunkt: `2dadc800daafa8b1640ccd08bf91a302fbc9cfb0`.
UI-/reviewcheckpoint: `8497fe584387636d7bd715c009682c6e72899a99`.
Leverings-/sikkerhetscheckpoint: `8a091ea3fd175706ea147b05e8d6bce90724e54f`. Sluttlukkingen identifiseres i [arbeidsøkten](../process/arbeidsokter/2026-10-27-kontrollert-sluttforing.md).
[Kildemanifestet](sluttforing-2026-10-27/tested-source-manifest.json)
knytter 188 kilde-/testfiler til prøvd innhold. Den første testkopien brukte
eksisterende node_modules og bare lokal porttilpasning 3000→3107, fordi en
eksisterende live-server brukte 3000. En oversett numerisk port i rå HTTP-test
ble rettet i kopien; både feilen og grønn rekontroll er bevart. Ingen
testforventning eller finansverdi er endret. Dette er ikke ekstern S6.

[Regresjonsindeksen](sluttforing-2026-10-27/final-regression.json) bevarer
kommandoer/exit/rålogger fra UI-kontrollen. Sikkerhetsrettingen i låsfilen
krever ny relevant regresjon; sluttkontroll og senere bevis føres i arbeidsøkten.
Gamle bevis brukes ikke som om de prøvde en senere avhengighetsversjon.

## AC-status

| AC | Faktisk utført og avgrensning |
| --- | --- |
| AC1 | Krav-/kode-/testspor nedenfor, konkret testgrense og resultater. Ekstern S6 mangler; full leveranseakseptanse er ikke klar. |
| AC2 | S1–S6/K1–K3 vurdert nedenfor med historiske originale bevis, waiver og ikke gjennomført S6 tydelig skilt. |
| AC3 | README synkronisert med 4.4, S5-W1, demo/live, hemmelighetsfri .env.example, backendmodus og at .env ikke lastes automatisk. Ingen betalt analyse utført i denne runden. |
| AC4 | Importretning og sentrale kodegrenser inspisert, uavhengig UI-review, reelle fokusfeil rettet og port-/feilgrenser prøvd. Ingen generert alternativ finans-/screeningmotor. |
| AC5 | Faktisk inventar/historikk/.gitignore, installasjon, avhengigheter og mønstersøk gjennomført. Kun fiktive nye testdata. Ingen nye private originaler. Delingsrett for eksisterende kurskilder er ikke bekreftet gjennom denne tekniske kontrollen. |
| AC6 | Originale prompts/arbeidsøkter, bevis, rettinger og checkpoints bevart. 127 S5-/historiske 4.4-filer er byteidentiske. Endelig ekstern S6 og vurdering av komplett leveranse gjenstår hos Mads. |

## Konkret funksjonsspor til kode og tester

Stiene er relative til reporoten. D=`src/domain/`, F=`src/frontend/`,
B=`src/backend/`, C=`src/contracts/`, U=`tests/unit/`, I=`tests/integration/`,
E=`tests/e2e/`, K=`tests/components/`. Testfilene nedenfor er faktisk del av
de kjørte suitene, ikke bare planreferanser. Detaljerte RT-/BT-/AT-/FR-5-
eksempler er kartlagt i [5.1-verifikasjonen](story-5-1-verifikasjon.md);
nyere live- og UI-bevis suppleres her.

| FR / story | Faktisk kodegrense | Konkret prøve/forventning |
| --- | --- | --- |
| FR-1 / 1.3–1.4 | F/screens/FinancialInput.tsx, D/validation.ts | [U/financial-validation](../../tests/unit/financial-validation.test.ts) og [E/financial-input](../../tests/e2e/financial-input.spec.ts): eksplisitt måned/år, faktor 12, blank og 0 ulike; BT-7/15/16. |
| FR-2 / 1.5 | D/financial-basis.ts, F/screens/FinancialBasisInput.tsx | [U/financial-basis](../../tests/unit/financial-basis.test.ts) og [E/financial-input](../../tests/e2e/financial-input.spec.ts): kostnadsinkludering uten dobbelttelling og uløst kildekonflikt uten automatisk kildevalg. |
| FR-3 / 1.6 | D/screening.ts evaluateKnownDeficiencies | [U/screening](../../tests/unit/screening.test.ts), [U/complete-screening](../../tests/unit/complete-screening.test.ts): P=0, manglende L/J/Ymin, negativt/ubekreftet grunnlag gir konkrete mangler. |
| FR-4 / 1.7 | F/state/session.ts confirmationCandidate/isFinancialConfirmed | [U/financial-confirmation](../../tests/unit/financial-confirmation.test.ts) og [E/financial-input](../../tests/e2e/financial-input.spec.ts) 1.7: feilfokus, særskilt nullkontroll, ingen analyse før gyldig bekreftelse. |
| FR-5 / 2.10, 3.9 | D/tg3-resolution.ts, F/screens/Tg3Resolution.tsx | [U/tg3-resolution](../../tests/unit/tg3-resolution.test.ts) og [U/complete-screening](../../tests/unit/complete-screening.test.ts): alle sju FR-5-eksempler; [E/screening-result](../../tests/e2e/screening-result.spec.ts) 3.9: hver TG3-tekst/statusendring gjør gammelt resultat historisk uten nytt kall. |
| FR-6 / 2.5–2.6, 4.1–4.3 | B/http/analysis-route.ts, B/analysis/live-adapter.ts | [I/http-analysis](../../tests/integration/http-analysis.test.ts) og [I/live-http](../../tests/integration/live-http.test.ts), [U/live-adapter](../../tests/unit/live-adapter.test.ts): én dispatch, 60/120 s, ingen retry og gamle svar avvises. Faktiske originale live-bevis eies av 4.4. |
| FR-7 / 2.1, 4.2/4.4 | C/document-analysis.ts, B/analysis/live-request.ts | [U/document-analysis](../../tests/unit/document-analysis.test.ts): eksplisitt TG/kilde eller usikker kandidat. Historisk S2 vurderer originale live-funn mot forhåndsfasit, ikke demosvar. |
| FR-8 / 2.7 | F/pdf/SourceReview.tsx/PdfViewer.tsx | [E/report-analysis](../../tests/e2e/report-analysis.spec.ts) RT-5/7/8: fysisk side 4 kontra trykt side 2, originalbytes, nabosider, smalt panel og retur. |
| FR-9 / 2.2–2.5 | B/documents/extract-pdf.ts, C/analysis-validation.ts | [I/pdf-format](../../tests/integration/pdf-format.test.ts) og [I/pdf-extraction](../../tests/integration/pdf-extraction.test.ts) og [E/report-analysis](../../tests/e2e/report-analysis.spec.ts): >30 sider, lesbarhet, delresultat/feil og ingen falsk vellykket tomliste; RT-2/9/19. |
| FR-10 / 2.8–2.9 | F/screens/FindingControl.tsx, D/finding-control.ts | [U/finding-control](../../tests/unit/finding-control.test.ts) og [E/report-analysis](../../tests/e2e/report-analysis.spec.ts) RT-11/12: original, utkast, Bruk/Avbryt, avvist opphav og ny relevant kontroll. |
| FR-11 / 2.11 | D/finding-control.ts assessFindingList, F/screens/FindingListControl.tsx | [U/finding-list-control](../../tests/unit/finding-list-control.test.ts) og [E/report-analysis](../../tests/e2e/report-analysis.spec.ts) 2.11: separat listebekreftelse, gyldig tomliste og fortsatt Uavklart TG3; RT-10/13/14. |
| FR-12 / 3.1–3.2 | D/finance.ts/thresholds.ts | [U/finance](../../tests/unit/finance.test.ts) og [U/thresholds](../../tests/unit/thresholds.test.ts), [I/demo-screening](../../tests/integration/demo-screening.test.ts): F1 11,875 % / 1500000 / 9,375 % / 700000, F2 og måned/år uavhengig fasit. |
| FR-13 / 3.1/3.4 | D/finance.ts, D/screening.ts | [U/complete-screening](../../tests/unit/complete-screening.test.ts) og [K/financial-metrics](../../tests/components/financial-metrics.spec.ts): manglende J gir egne gyldige delberegninger; manglende L gir unavailable, aldri fire nullbeløp. |
| FR-14 / 3.3/3.6 | src/presentation/finance.ts, F/components/FinancialMetrics.tsx | [U/financial-presentation](../../tests/unit/financial-presentation.test.ts) og [K/financial-metrics](../../tests/components/financial-metrics.spec.ts): formler, årsinput og kilder; nødvendig terskelforklaring ved avrundet likhet. |
| FR-15 / 3.8 | F/state/result.ts, F/state/session.ts | [U/financial-result-renewal](../../tests/unit/financial-result-renewal.test.ts) og [E/screening-result](../../tests/e2e/screening-result.spec.ts) BT-12/13: bekreftet finansendring, ny anbefaling, samme rapport og ett analyse-POST. |
| FR-16 / 3.4 | D/screening.ts evaluateScreening | [U/complete-screening](../../tests/unit/complete-screening.test.ts) AT-1–20: mangler før økonomiske brudd før Gå videre, alle utløsere på avgjørende nivå. |
| FR-17 / 3.4 | D/screening.ts og C/screening.ts | [U/complete-screening](../../tests/unit/complete-screening.test.ts) AT-18/19: fast grunn/neste handling, identisk grunnlag gir identisk tekst/utløsere uten KI. |
| FR-18 / 3.5/3.7/3.9 | F/state/result.ts, F/screens/ScreeningResult.tsx | [U/result-snapshot](../../tests/unit/result-snapshot.test.ts) og [U/report-result-renewal](../../tests/unit/report-result-renewal.test.ts) og [E/screening-result](../../tests/e2e/screening-result.spec.ts): bundet øyeblikksbilde, historisk vern, originalkilde, ett gjeldende resultat. |

| NFR | Kode, faktisk kontroll og begrensning |
| --- | --- |
| NFR-1 | Rene domenegrenser og F/state/session.ts; unit/integrasjon og E2E inkluderer feil, duplikater, abort, sene svar og revisjonsbytte. Ikke generell feilfrihetsgaranti. |
| NFR-2 | F/styles.css, App.tsx og PDF-dialog; [E/app-shell](../../tests/e2e/app-shell.spec.ts)/financial-input/report-analysis/screening-result måler fokus/ombryting/kontrast. Nye visuelle egenkontroller og reell rød/grønn fokusretting; ingen WCAG-sertifisering eller alle hjelpemidler. |
| NFR-3 | B/server.ts, lokal PDF-/demoressursgrense; ren intern npm ci/build og offline-demo er prøvd. Faktisk annen-person-S6 mangler fortsatt. |
| NFR-4 | B/analysis/backend-config.ts, bygg-/nøkkeltest, serverens private grense og repo-/historikkskann. Ingen ekte nøkkel i nytt prosessmiljø; mønstersøk er avgrenset. |
| NFR-5 | Synlig analyse/kontroll i ReportAnalysis og state/report.ts. Tekniske frister og status prøvd; menneskelig tidsgevinst er ikke validert og S5-W1 står ved lag. |

| CAP | Funksjon og faktisk bevis |
| --- | --- |
| CAP-1 | FR-1–4, financial-basis/confirmation og [E/financial-input](../../tests/e2e/financial-input.spec.ts); komplette tall, kilder, perioder og kontroll. |
| CAP-2 | FR-6–9, faktiske PDF-/HTTP-/livegrenser og originale 4.4-bevis; usikkerhet/feil beholdes. |
| CAP-3 | FR-8/10/11, FindingControl/SourceReview og RT-8/11/12; original/utkast/avvisning/PDF-panel. |
| CAP-4 | FR-5, tg3-resolution og sju FR-5-eksempler; Uavklart og forholdsbundet gyldig Avklart. |
| CAP-5 | FR-12–14, finance/thresholds/presentation og BT-1–18; uavhengig fasit og terskler uten toleranse. |
| CAP-6 | FR-16–18, complete-screening AT-1–20 og [E/screening-result](../../tests/e2e/screening-result.spec.ts); tre kodeutfall med grunn/neste handling. |
| CAP-7 | result/session/report-revisjoner, renewal-/snapshottester og [E/screening-result](../../tests/e2e/screening-result.spec.ts) 3.8/3.9; uendret uttrekk gjenbrukes. |
| CAP-8 | demo-adapter/server og [I/demo-analysis](../../tests/integration/demo-analysis.test.ts)/demo-screening, [E/dev-shell](../../tests/e2e/dev-shell.spec.ts); intern offline-funksjon består, ekstern S6 ikke verifisert. |

## Arkitektur og relevante UX-beslutninger

Faktiske imports i domain/contracts er inspisert: bare interne grenser,
Zod og/eller big.js, ingen React/Express/PDF/I/O/miljø. Finans er fortsatt i
`calculateFinancialMetrics`, eksakt terskel i `evaluateNetYieldThreshold` /
`evaluateCashFlowThreshold` og samlet prioritet i `evaluateScreening`.
Frontend viser resultat fra et isolert snapshot; leverandøren bestemmer ikke
finans eller anbefaling. Ingen nye domene-/kontraktfiler er opprettet.

| AD | Inspisert grense / konkret kontroll |
| --- | --- |
| AD-1 | Domain → contracts, backend/frontend bruker delte grenser; typecheck/lint og faktisk importinventar. |
| AD-2 | Frontend session/report/result eier økt, original/utkast, bekreftelse og fryst snapshot; session-/snapshot-/renewaltester. |
| AD-3 | PDF-bytes/hash og fysiske sider i documents; [I/pdf-format](../../tests/integration/pdf-format.test.ts) og [I/pdf-extraction](../../tests/integration/pdf-extraction.test.ts) og PDF-source-/RT-5-prøver. |
| AD-4 | Delt runtime-kontrakt og bindAnalysisOutcome; [U/document-analysis](../../tests/unit/document-analysis.test.ts) og [I/http-analysis](../../tests/integration/http-analysis.test.ts), completed/failed/usikkerhet. |
| AD-5 | Én request-eid pipeline og varige duplikatmarkører; [U/http-pipeline-races](../../tests/unit/http-pipeline-races.test.ts), [I/http-analysis](../../tests/integration/http-analysis.test.ts) og sene-svar-E2E. |
| AD-6 | Felles adapter/kontrakt, hash-/versjonsbundet demo og eksplisitt backendmodus; [I/demo-analysis](../../tests/integration/demo-analysis.test.ts)/live-pipeline-wiring. |
| AD-7 | big.js/exakte desimaler, egne gyldige input per nøkkeltall og separat format; finance/thresholds/presentation og BT-grenser. |
| AD-8 | Én screeningautoritet og egen TG3-validering; complete-screening, limitation-review, tg3-resolution og F4-E2E. |
| AD-9 | Loopback, dist-only, lokale PDF-ressurser og fire UX-trinn; [E/app-shell](../../tests/e2e/app-shell.spec.ts)/dev-shell/report-analysis og build-key-kontroll. |
| AD-10 | Fasit, originale live-uttrekk, demo/replay og faktisk ekstern tid/S6 er separate bevisgrenser; status nedenfor. |

Alle UX-DR-ID-ene nedenfor er planens egne referanser til eksisterende
komponenter/atferd. Gruppene endrer ikke beslutningene.

| UX-DR | Kode og faktisk kontroll |
| --- | --- |
| 1–4 | App.tsx/styles.css, navngitte handlinger; [E/app-shell](../../tests/e2e/app-shell.spec.ts) og financial-input: trygg modus, alle fire trinn, sperrer og fokus. |
| 5–9 | FinancialInput/FinancialBasisInput og session; [E/financial-input](../../tests/e2e/financial-input.spec.ts): felt, enhet, periode, kilde, kostnader og bekreftelse. |
| 10–13 | ReportAnalysis og state/report; [E/report-analysis](../../tests/e2e/report-analysis.spec.ts): filvalg/start, faktisk status, alle funn og kildekontekst. |
| 14–16 | FindingControl/origin-detail; [E/report-analysis](../../tests/e2e/report-analysis.spec.ts) RT-11/12 og screening-result: Bekreft/Korriger/Avvis, original/utkast og opphav. |
| 17 | PdfViewer/SourceReview; RT-5/7/8, workerfeil og hel side/nabosider. |
| 18–19 | Tg3Resolution/FindingListControl; FR-5-/2.11-prøver og nye adskilte visuelle kontrollgrupper. |
| 20–23 | ScreeningResult/FinancialMetrics; K-/E-screening-result og metrikkprøver: anbefaling først, fire tall, kilde/formel og tilgjengelige details. |
| 24–26 | Lokale mangler, tekstlig status og result-selektor; AT-12/13/16/18, historisk resultat og konkrete feil. |
| 27–28 | Eksisterende tokens/systemfont/geometri er bevart; [E/app-shell](../../tests/e2e/app-shell.spec.ts) måler faktiske farger, kontrast og fokus. Ny spacing bruker samme skala. |
| 29 | presentation/finance.ts og financial-presentation; norsk format og eksplisitt forklaring ved skjult terskelbrudd. |
| 30–31 | SourceReview 1200px/44:56 og dialog; report-analysis smal/zoom, valgt side, fokusfelle, Esc og retur. |
| 32–35 | FinancialInput/App/PdfViewer; eksisterende feilfokus, kunngjøring én gang, tastatur og kontrastprøver. Kortflate-regresjon er faktisk rettet. |
| 36–38 | evaluateKnownDeficiencies, ReportAnalysis og ScreeningResult; komplette feil-/mangel-/delgrunnlag-/stale-/offline-varianter ved de faktiske testgrensene. |
| 39–40 | Resultatets åpne hovedgrunnlag og behovsåpnete detaljer; norsk presis opprinnelsesmerking, alle tre anbefalinger i [E/screening-result](../../tests/e2e/screening-result.spec.ts). |
| 41 | De fire flytene er prøvd i [E/financial-input](../../tests/e2e/financial-input.spec.ts)/report-analysis/screening-result; nye før/etterbilder viser faktisk F4-egenkontroll og retur, ikke ekstern brukertest. Tidligere manuell 5.2 beholdes med sin dato. |

## S1–S6 og K1–K3

| Mål | Faktisk status og bevis |
| --- | --- |
| S1 | Bestått i kontrollerte F1–F4/BT-eksempler: uavhengig expected.json og eksplisitte unit-/integrasjons-/UI-forventninger. Terskellikhet/én krone under er eksakt, uten måletoleranse i reglene. |
| S2 | Bestått i det opprinnelige, avgrensede live-utvalget: 4/4 TG2, 1/1 TG3 og ingen oppdiktede. [4.4-review](story-4-4-b2-uavhengig-sluttreview-2026-10-27.md) og [opprinnelig evaluering](story-4-4-uavhengig-evaluering.md). Ingen ny måling eller generell modellkvalitet påstås. |
| S3 | Låste regel-/grensevarianter automatisk bestått; complete-screening, thresholds, kontroll og renewal; se RT-/BT-/AT-/FR-5-kart i 5.1. |
| S4 | Kilde-/opphavs-/kostnadskontroll består i kontrollerte tilfeller, inkl. fysisk side kontra trykt side, retting/avvisning og original. Struktur-/hashkontroll beviser ikke semantisk støtte i vilkårlige nye rapporter; brukeren kontrollerer originalen. |
| S5 | **Ikke formelt bestått.** Ufullstendig manuell referanse og forsøksavvik, akseptert som S5-W1. Ingen validert tidsbesparelse og ingen nye S5-tester/målinger bestilt. |
| S6 | **Ikke gjennomført.** Intern installasjon/egenkontroll erstatter ikke annen person. [5.4-pakke](story-5-4-forberedelse-2026-10-27.md); Mads organiserer person, rent miljø og faktisk logg. |
| K1 | Kontroll-/TG3-portene er prøvd. Tidsgevinst fra komplett menneskelig kontroll er fortsatt ikke validert; ufullstendig S5 brukes ikke til en slik påstand. |
| K2 | Originale live-funn er kildevurdert mot forhåndsfasit; rå antall funn brukes ikke som kvalitetsmål i seg selv. |
| K3 | Gå videre-andel er ikke suksessmål. F1/F2/F3/F4 viser forventede forskjellige utfall ut fra uavhengig grunnlag. |

## Installasjon, avhengigheter og repo

**Før body-parser-rettingen:** Ren intern `npm ci` i ny mappe med Node 24.21.0/npm 11.19.0 bestod fra
eksisterende cache. Påfølgende build og faktisk lokal F4-PDF-/TG3-/resultat-
flyt ved to skjermstørrelser bestod med eksternt nett sperret og 0 eksterne
requests. Se [installasjon](sluttforing-2026-10-27/clean-install.json),
[build](sluttforing-2026-10-27/clean-build.txt) og
[demoobservasjoner](sluttforing-2026-10-27/clean-demo-observations.json).
Dette var intern kontrolldemo med tilfeldig port, ikke hele ekstern README-kjøring.

Etter rettingen er avhengighetene installert på nytt med `npm ci` fra den
oppdaterte låsfilen: [kommando/miljø/hash](sluttforing-2026-10-27/clean-install-patched.json)
og [faktisk utdata](sluttforing-2026-10-27/clean-install-patched.txt).
Ny full regresjon spores separat fra de eldre installasjons-/UI-bevisene.

Fersk npm-audit fant high-varselet
[GHSA-27r3-jxmh-p828](https://github.com/advisories/GHSA-27r3-jxmh-p828).
Den isolerte rettingen endret bare låsfilposten `body-parser` 2.3.0→2.4.0,
innen Express 5.3.0s eksisterende `^2.3.0`. Ingen direkte pin eller øvrig
pakkeversjon er endret. Egen multipart-leser brukes; express.json/urlencoded
er ikke koblet inn. Ingen utnyttbar produktvei er påvist. [Ny audit](sluttforing-2026-10-27/dependency-audit-after.json)
rapporterer 0 kjente sårbarheter på kontrolldatoen. Før-/etterrapporter bevares.
Sikkerhetsvarselet føres og lukkes med eget bevis i den sentrale
[deferred-work-oversikten](deferred-work.md#story-55-d1--transitiv-body-parser-registrert-åpen-2026-10-27).

[Repo-/historikkontroll](sluttforing-2026-10-27/repository-hygiene.json)
omfattet 1941 historiske blobs til UI-checkpointet og OpenAI-/AWS-/privatnøkkel-
mønstre. Tre treff er uttrykkelige fiktive redigeringstester; ingen faktisk
hemmelighet er påvist innen disse mønstrene. Ingen node_modules/dist/private/
testråmapper eller ekte .env er versjonert. Ignore-prober består; bare
hemmelighetsfri .env.example legges til. Kuraterte bevis under .docs beholdes,
genererte dist/test-results holdes ignorert. Dette er ingen garanti mot
alle hemmelighetstyper eller en rettighetsgodkjenning av alle historiske kilder.

F1–F4 og øvrige fixtures beskriver fiktive data/opphav. Private originaler
er fortsatt utenfor Git. Ingen eksisterende kurskilde er fjernet eller
re-lisensiert; Mads avklarer eventuell offentlig deling av disse kildene.
[Bevaringsmanifestet](sluttforing-2026-10-27/preserved-evidence.json) viser
127 byteidentiske S5-/historiske 4.4-filer mot startrevisjonen.

## Det som faktisk gjenstår

Mads organiserer og dokumenterer ekte S6 på den endelige leveranseversjonen,
med [kort ekstern instruks](story-5-4-ekstern-instruks.md). Etter faktiske
avvik/retting/rekontroll vurderes 5.4 og deretter samlet 5.5-akseptanse.
Story 4.5/Epic4 beholdes formelt in-progress med S5-W1; ingen ny måling skal
velges fra gammel historikk. Eksisterende åpne bugs ligger bare i
[deferred-work](deferred-work.md), inkludert 4.3 B3/C2. Dette dokumentet
oppretter ingen parallell bugoversikt eller falsk done-status.

Utvidet [sluttmanifest for bevaring](sluttforing-2026-10-27/preserved-evidence-final.json)
inkluderer også de godkjente originale B2-forsøkene og tilhørende
4.4-review-/evalueringsdokumenter. Den eldre 127-filkontrollen beholdes som
et avgrenset tidligere checkpoint.

## Endelig teknisk sluttregresjon

[Post-patch-indeks](sluttforing-2026-10-27/post-patch-regression.json) og
[eksakt kilde-/låsfilmanifest](sluttforing-2026-10-27/post-patch-source-manifest.json)
gjelder body-parser 2.4.0. Alle ni kontroller har exit 0: typecheck, lint,
build, 1082 unit/integrasjon, 195 bygget-app-E2E i én full grønn kjøring,
3 dev/offline, 37 komponenter, build-/nøkkelgrense med 204 frontendfiler/0
lekkasjer og 6 build-helperprøver. Ingen tester er hoppet eller forventninger
endret. Dette supersederer den eldre E2E-portfeilen som gjeldende teknisk
status; feilloggen beholdes som historikk.

[Uavhengig leveringsreview](sluttforing-leveringsreview-2026-10-27.md) har
triage av alle 11 funn. De verifiserte dokument-/bevisfeilene er rettet,
inkludert miljøpresedens, konkrete demo-/livekommandoer, versjonsbinding og
B2-bevaring. [Sluttskann](sluttforing-2026-10-27/repository-final-scan.json)
supplerer historikkskannen for nye leveringsfiler. Ingen bestått teknisk
kontroll erstatter de åpne eksterne/akseptansemessige portene ovenfor.

## Supplerende standardportverifikasjon etter Mads' godkjenning

Den gamle serveren ble senere uttrykkelig godkjent stoppet. Hovedrepoets
uendrede `npm run test:e2e` består på standardport 3000: 195 bygget-app og
3 dev. De tre produksjonsserver-modustestene og build-/nøkkelgrensen
(204 filer, 0 lekkasjer) består også. [Kommandoer og rålogger](sluttforing-2026-10-27/standard-port-regression.json)
og [kildekontroll](sluttforing-2026-10-27/standard-port-source-check.json)
gjelder kildecommit `9fd954dd5492e5d0187ad8d8674b0383351a862e`, uten
porttilpasning eller endret kilde/test. Port 3000 er ledig etter kontrollen.
Dette supplerer de tidligere isolerte bevisene og opphever portbegrensningen
for de aktuelle prøvene. Det er fortsatt intern agentkontroll; S6 er ikke
gjennomført og 5.4/5.5 settes ikke done.

## Supplerende pre-submission gate fra be895e0

Den [uavhengige sensorsimuleringen](pre-submission-quality-gate-2026-10-27.md)
vurderer alle sju kurskriterier med stikkprøvegrunnlag og usikkerhet. Det er
ikke faktisk sensur eller en godkjenning av eksterne porter. Nye konkrete
funn og lukkebevis føres bare i [deferred-work](deferred-work.md).

| Berørt spor | Avgrenset ny retting / kontroll |
| --- | --- |
| NFR-3/NFR-4, CAP-8, AD-6/AD-9; AC3/AC6 | Playwright-serverne binder modus til demo og nøkkel til tom verdi; buildkontroll beholder egen fiktiv sentinel, men velger demo. README-devstart er eksplisitt demo. Arvet fiktiv live-konfigurasjon inngår i ny verifikasjon. |
| FR-9/FR-18, NFR-1/NFR-2, AD-2/AD-4/AD-5; AC4/AC6 | Intern rapporttilstand bevarer første feil ved duplikatavvisning, også mål/delresultat og opprinnelig transportkode uten outcome. Filbytte, ny terminalretur og gamle svar er relevante negative grenser. Backend-/HTTP-/finans-/screeningkontrakter beholdes. |
| FR-5/FR-18, CAP-4/CAP-6, NFR-2; AC4 | Generisk TG3-hjelpetekst bruker relevant fagkyndig i stedet for elektriker for alle forhold. Elektriske eksempler og alle regler/fasiter beholdes. |
| AC1/AC2/AC5/AC6 | Supplerende råtester, uavhengig endringsreview, repo-/historikkskann og commitbundet ren S6-eksport samles i den nye gate-rapporten. Dette er ikke ekstern S6. |

Tidligere tester og originale 4.4-/S5-bevis beholdes. Låsfil og dependency-
versjoner er uendret fra forrige godkjente patch; en ny installasjon/audit
uten endrede avhengigheter er ikke nødvendig for å verifisere disse
kode-/miljørettingene. Ingen betalte API-kall eller nye S5-forsøk inngår.
5.5 forblir in-progress; 5.4/R4-S6 og den ufullstendige formelle S5-
akseptansen skjules ikke av denne klargjøringen.
