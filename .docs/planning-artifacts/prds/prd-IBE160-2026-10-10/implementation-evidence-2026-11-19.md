# Kildeuttrekk: implementasjon, krav og beslutninger

Dato: 2026-11-19. Lest mot `684e61d3686f83f05c3f6cb1a3720dfb3f622c68`. Full opprinnelig PRD, addendum og `.memlog.md` er gjennomgått. Dette er et kildeuttrekk til PRD-revisjonen, ikke en ny kravkilde. Kode og navngitte testasserts er kontrollert ved lesing. Historiske kjøringer er merket særskilt. Ingen nye testkjøringer, betalt transport eller produktendringer er gjort av denne kildegjennomgangen.

Kode-/teststier nedenfor er relative til reporoten. Godkjenningene i PRD-memlog gjelder 10. oktober-omfanget; senere omfang må begrunnes med senere vedtak.

## TG3: faktisk operasjonell regel

**Alle aktive funn med gjeldende eksplisitt grad TG3 omfattes av avklaringskravet.** Ingen alvorlighetsklassifikator velger en undergruppe. «Alvorlig TG3» i eldre PRD/UI er dermed en upresis betegnelse på TG3, ikke en separat KI- eller brukerklassifisering.

| Spørsmål | Verifisert kode og testassert | Konsekvens for PRD |
| --- | --- | --- |
| Hvilke funn? | `src/frontend/state/report.ts:186` `currentTg3Findings` velger alle aktive `current.grade === 'TG3'`; `domain/screening.ts` `evaluateKnownDeficiencies` prøver hver TG3. | Definer alle aktive TG3 som avklaringspliktige. Ikke be KI klassifisere alvorlighet. |
| Standard og gyldig Avklart | `src/domain/tg3-resolution.ts:18` `validateTg3Resolution` krever eksplisitt `resolved`, ikke-tom/ikke-whitespace `reason` og `basis`, gyldig binding til grad, beskrivelse, rapporthash, dokumentnavn og fysisk PDF-side. | Manglende/ukjent/ugyldig status er Uavklart. Systemet kontrollerer struktur/binding, ikke sannheten i ekstern dokumentasjon. |
| Flere funn og økonomi | `tests/unit/tg3-resolution.test.ts` FR5-5/6 og `complete-screening.test.ts:290`: ett uavklart TG3 overstyrer både F1/F2; alle avklart med F2 gir Forkast. | Alle aktive TG3 må avklares. Avklart fjerner bare den aktuelle mangelen; økonomi og øvrig grunnlag avgjør fortsatt. |
| Avvisning | `report.ts:175` `currentFinding` returnerer null ved avvisning; `finding-control.test.ts:195` og `result-snapshot.test.ts:297` bevarer original/PDF uten teknisk avklaring. | Et avvist feiluttrekk inngår ikke som aktivt TG3; avvisning dokumenterer ingen avklaring av en faktisk mangel. |
| Manglende separat registrering | `src/domain/finding-control.ts:25` `assessFindingList` løfter kjent aktivt TG3 hvis projeksjon mangler/har feil binding; `complete-screening.test.ts:448` bevarer TG3 i failed-delresultat. | Ufullstendig registrering kan ikke gi falskt tilstrekkelig grunnlag. |
| Endringer | `sameTg3Basis` godtar konservativ representasjonslikhet i tekst; side/hash/grad/endret tekstgrunnlag krever ny binding. `tg3-resolution.test.ts` dekker whitespace, endret side/grad, ny rapport og sene hendelser. | Ingen blind gjenbruk etter rapport-/funnendring. Listebekreftelse og TG3-avklaring er separate porter. |

Elektrikerkontroll er et bevart eksempel, ikke krav om elektriker for tak, våtrom eller alle TG3. TG3-graden/rapportfunnet beholdes ved Avklart. Systemet foretar ingen teknisk godkjenning. Eldre 30-sidersveiledning i `assessFindingList` tilhører legacyprofilen; ny importprofil er separat.

## Frister og behandlingsveier

| Vei | Kilde | Faktisk betydning |
| --- | --- | --- |
| Eldre separat rapport, demo | R3/R1, `backend/http/run-pipeline.ts` | Lokal 60 s-frist; lagrede fiktive uttrekk, ingen modell. |
| Eldre separat rapport, live | [R1 23. oktober](../../r1-live-ki-semester-v1.md), `backend/analysis/backend-config.ts:9`, `live-adapter.ts:21` | Lokal dokumentfase 60 s; deretter absolutt 120 s fra leverandørstart til terminalt validert adapterutfall, ikke ny frist per chunk/parse. Sol/Responses/low/Standard/SDK 6.9.1, ingen retry eller reparasjonskall. |
| Vanlig salgsoppgaveimport | `backend/http/import-route.ts:16` gir `liveEnabled:false`; timer starter før mottak, restfrist sendes til `runImport` | Samlet lokal import/OCR-rutefrist 60 s. Ingen aktiv 120 s-modellfase i hovedimporten. |
| Generell semantisk rest | [Godkjent design](../../salgsoppgave-code-first-design-2026-10-29.md), [spec](../../../implementation-artifacts/spec-salgsoppgave-code-first.md), `semantic-request.ts:7`, `semantic-adapter.ts:117` | Design viderefører 120 s semantisk frist etter lokal fase; produksjonsport er stengt. Adapteren godtar bare eksplisitt `offline-stub`. |
| Valgfri dokumentøkonomi-KI | `backend/import/economy-local-budget.ts:21`, `backend/http/economy-route.ts` | Separat forberedelse 60 s; modellforespørsel 120 s SDK-timeout/abortsignal. Etterfølgende lokal JSON-/kildevalidering/journal har ingen tilsvarende eksplisitt total elapsed-sjekk. Samtykker, nøkkel, requestbinding og varig journal kreves. Montert også i demo; demo er ingen global betalingssperre. |
| S5 | PRD NFR-5/S5, addendum TT | 300 s median hovedanalyse og 600 s median menneskekontroll er evalueringsmål, ikke API-timeout eller bevist tidsbesparelse. |

`tests/unit/live-adapter.test.ts` prøver gyldig live-svar ved 61 s uten demofrist, absolutt frist ved hengende body/parsing, sene svar, abort og ingen retry. `tests/integration/uploaded-economy-http.test.ts` prøver begge samtykker, ukjent leverandørutfall, sperret gjenforsøk, opplastingstimeout og venting på journal/transport ved stenging. Dette er kontrollert transport/asserts, ikke ferske leverandørmålinger.

## Budsjettlag og kildepresedens

1. **USD 20 samlet prosjektbudsjett:** R1 er godkjent/lukket 23. oktober. Inkluderer tidligere forsøk, feil, timeout og manuelle gjentakelser; serverstopp nullstiller ikke forbruk. Før nye betalte forsøk må konto/pris/ukjente belastninger avstemmes. Dette er gjennomføringsrutine, ikke en global apphåndhevet saldo.
2. **USD 0,20 per logisk salgsoppgaveanalyse:** godkjent 29. oktober i design/spec; deles med eventuell separat rapport. Designet tillater maksimalt ett semantisk kall per dokument, ingen chunking/retry. Beslutningen gir uttrykkelig ingen ny konto-/prosjektfullmakt. `AnalysisBudget`/`AnalysisBudgetStore` binder reservasjon til analyse-ID/requestdigest og bevarer usikre poster over omstart.
3. **Gjeldende økonomihjelper:** `LOCAL_ECONOMY_LIMITS` har høyst fem valgte lesbare sider / 12000 byte valgt tekst, 36000 inputbudsjetttokens og 6000 output inklusive reasoning. Hele SDK-bodyen budsjetteres som `2 × UTF-8-byte + 4096`; dette er lokalt konservativt estimat, ingen eksakt tokenizer/count-kvittering. Varig reservasjon USD 0,15 innen USD 0,20 med minst USD 0,05 margin. Ett Responses-kall, ingen count, retry, verktøy eller automatisk rapportkall.
4. Historisk `lokalt-budsjett.md` angir først 40000/4000; dette er erstattet av [kompakt økonomirespons](../../../implementation-artifacts/salgsoppgave-economy-trial-2026-10-30/compact-resultat.md) og nåværende kode med 36000/6000. Generell semantisk grense 40000/8000 skal ikke brukes som dagens økonomihjelpergrense.
5. Oktoberprisene er daterte beregningsgrunnlag, ikke verifiserte 19. november-priser. Ingen fersk kontosaldo er lest. [Sentral oversikt](../../../implementation-artifacts/deferred-work.md) har **PAA-AI-20261031-1 åpen**: én USD 0,15 uncertain-reservasjon, faktisk belastning ukjent. Lokal statusretting gir ingen faktureringsfasit. Ikke oppgi beregnet restbudsjett som bekreftet saldo.

Direkte asserts: `tests/unit/code-first-budget.test.ts` «USD .20 is inclusive; over-budget, reload, changed digest and separate report cannot reset the allowance» og «same logical analysis shares reservation between prospectus and separate report». `economy-local-budget.test.ts` prøver 6000/6001 output, én byte over inputgrensen, reservasjon før nøyaktig ett stubbet SDK-kall og tidligere reservasjon som stopper marginen.

## Omfangsendringer som dagens PRD må innarbeide

| Vedtak / grunn | Implementasjon og kontrollspor | Avgrensning |
| --- | --- | --- |
| 6.–10. oktober: smal screening fremfor autonome agenter/full due diligence | Brief-revisjon, PRD-memlog, opprinnelig FR1–18 og RT/BT/AT/TT | Bevar stabile ID-er/formler/prioritet. Opprinnelige ikke-mål er datert historikk. |
| 28. oktober: dokument først gir mer kontrollerbart grunnlag | [Correct Course](../../sprint-change-proposal-2026-10-28.md), D1–D3/SO-AC1–15; [offline-spec](../../../implementation-artifacts/spec-salgsoppgave-offline-build.md); egen `document-import-1`-kontrakt | Salgsoppgave hovedinngang, inntil 200 sider/50 MiB. Legacyrapport 30 sider består. Forhåndsutfylte kandidater er ubekreftede. PDF-vedlegg krever separat opplasting, ikke automatisk analyse av alle vedlegg. |
| 29.–31. oktober: lokale regler og konservativ semantikkport | `createCodeFirstImport`, lokale økonomifelt og eksakte kilder; produksjonssemantic stengt | Rest/uleste sider hindrer komplett teknisk dekning. Ingen generell TG-/KI-kompletthet; ingen funn er ikke fravær av risiko. |
| 30. oktober: Konsept A | DESIGN/EXPERIENCE under `ux-IBE160-2026-10-30`, InvestmentOverview | Oversikt/scenario er første flate. Kontrollreisen består ved siden av denne. |
| 31. oktober–4. november: lokal risiko/tekst/grafisk TG | Specs eiendomsrisiko, teknisk dokumentanalyse, grafisk TG og fortsettelser; `property-risk.ts`, `technical-risk.ts`, PDFKit/Vision | Lokale juridiske/tekniske indikasjoner, ingen juridisk godkjenning eller generell semantisk forståelse. OCR er macOS-avhengig; layoutgrenser er synlige. |
| 4.–5. november: lokalt datert leiegrunnlag | `backend/rent/published-references.ts`, `ssb-rent.ts`, JSON-data; `rent-http.test.ts` | Gruppe-/referanseleie er forutsetning, ikke individuell bekreftet markedsleie. Ingen runtime-krav om live data. |
| 5.–6. november: kapital, annuitet og scenario | Investeringsverktøy-/forhåndsutfyllingsspec; `domain/financial-scenario.ts`, `financing.ts`, `frontend/state/scenario.ts`, `domain/source-economy.ts` | Autorisert utvidelse av gamle ikke-mål. 80 % / 6 % / 360 måneder er synlige redigerbare antakelser. Scenario bekrefter ingenting og gir ingen autoritativ screeninganbefaling. Yield utelater kjøpsomkostninger; kapitalbehov inkluderer dem. |
| FINN utsatt | Correct Course; bevarte backend-/testspor og tilgangsport, ingen FINN-inngang i ny UI | Historisk/offline spor, ingen aktiv hovedreise. |

`src/domain/thresholds.ts:20` sammenligner eksakt `100 × NOI >= P × Ymin` med Big.js; kontantstrøm testes mot null før visningsavrunding. Særskilt øreavrunding i bankbetaling er dokumentert i finansierings-/scenariotestene og må ikke forveksles med avrunding av screeningterskler.

## FR-/NFR-spor og verifikasjonsgrenser

Tabellen viser avgrenset spor, ikke automatisk bestått krav. Testfilnavn uten mappe er under `tests/unit/` hvis annet ikke er angitt.

| Krav | Kodeansvar | Kontrollspor / grense |
| --- | --- | --- |
| FR-1 | `domain/financial-basis.ts`, FinancialInput | `financial-basis.test.ts`, `tests/e2e/financial-input.spec.ts`; kontrollert input ved siden av ubekreftet PDF/scenario. |
| FR-2 | `domain/common-cost-content.ts`, finansgrunnlag, source-economy | `financial-basis.test.ts`, `purchase-ledger.test.ts`, `explicit-document-economy.test.tsx`; kjent delsum er ikke full drift. |
| FR-3 | `domain/validation.ts`, kontrakter | `financial-validation.test.ts`: blank/0/ugyldig, eksplisitt nullkontroll. |
| FR-4 | session-state, FinancialInput | `financial-confirmation.test.ts`: registrering bekrefter ingenting, ny kilde opphever kontroll. |
| FR-5 | tg3-resolution, screening, report-state | TG3-tabell over, `tg3-resolution.test.ts`; ingen ekstern sannhetskontroll. |
| FR-6 | backend analysis/documents, importprofil | `tests/integration/demo-analysis.test.ts`, `pdf-format.test.ts`, `document-import.test.ts`; skill gammel 30 og ny 200. |
| FR-7 | live-request, lokal plan/semantic-adapter | `live-adapter.test.ts`, `representative-oracle.test.ts`, `tests/integration/code-first-pdf.test.ts`; syntetisk/SDK-stub er ikke ny representativ S2. |
| FR-8 | `contracts/pdf-source.ts`, originalvisning | `pdf-source.test.ts`, `economy-references.test.ts`, `tests/e2e/prospectus-import.spec.ts`; fysisk side/UTF-16/hash beviser kildebinding. |
| FR-9 | importschema/dekning, finding-control | `tests/integration/document-import.test.ts`, `limitation-review.test.ts`, `complete-screening.test.ts`; ulest/motstridende er ufullstendig. |
| FR-10 | frontend report-state | `finding-control.test.ts`: original, korrigering og avvisning holdes separate. |
| FR-11 | domain finding-control, report-state | `finding-list-control.test.ts`, `complete-screening.test.ts`; enkeltfunn, liste, importdekning og TG3 er separate porter. |
| FR-12 | `domain/finance.ts` | `finance.test.ts` mot hardkodet F1–F4/BT-fasit; scenario er separat modell. |
| FR-13 | finansvalidering/screening | `complete-screening.test.ts` F3/BT3/5/6/17/18; delberegning gir ingen konklusiv screening. |
| FR-14 | thresholds/presentation | `thresholds.test.ts`: eksakt likhet, én krone under, null/negativ kontantstrøm. |
| FR-15 | session/result-state | `financial-result-renewal.test.ts`, `result-snapshot.test.ts`; ny bekreftelse uten ny rapportanalyse. |
| FR-16 | `domain/screening.ts` | `complete-screening.test.ts` AT1–20/TG3/F2; prioritet 1/2/3 består. |
| FR-17 | faste trigger-/handlingstekster i screening | `screening.test.ts`, `complete-screening.test.ts` AT18/19: alle avgjørende utløsere og byteidentisk resultat. |
| FR-18 | result-state/skjermer | `result-snapshot.test.ts`, `tests/e2e/screening-result.spec.ts`; snapshot binder samme finans-/rapport-/kontroll-/TG3-revisjon. |
| NFR-1 | rene finans-/screeningmoduler | AT19 og revisjonsbinding; determinisme er ikke generell investeringskvalitet. |
| NFR-2 | React og komponent-/E2E-spor | Tastatur/slider/fokus/tilstander prøves; ingen full WCAG-revisjon eller uavhengig forståelsestest. |
| NFR-3 | package.json-pinning, server, README | Historisk ren klon; ekte annen-person-S6 fortsatt åpen. |
| NFR-4 | backendnøkkel, barn med tomt miljø, loopbackserver, private-ignore | Historisk sikkerhetskontroll/HTTP-/SDK-stubber; ingen allmenn produksjonssertifisering. |
| NFR-5 | ekstern måleprotokoll, TT1–9 | Gamle S5-bevis er versjonsspesifikke; ingen validert tidsbesparelse for nåværende dokument-/scenarioflyt. |

## Faktiske kjøringer og hva som fortsatt mangler

[Leveranseavstemming 6. november](../../../process/leveranse-2026-11-06/produkt-og-sporbarhet.md), [teknisk rapport](../../../process/leveranse-2026-11-06/teknisk-og-test.md) og [ren klon](../../../process/leveranse-2026-11-06/ren-klon.md) skiller lokalt produkt, historisk live og stubber. Ren klon dokumenterer oppstart av committet `6e3fbe6739eb17e007eac058ffdfae24e0306409`, installasjon/build og seks README-kontrollpunkter uten private filer/eksterne browserkall. Utført KI-assistert på utviklerens macOS; ingen annen persons brukertest.

Historisk rapport: unit/integrasjon **2237 pass / 8 skip**, E2E **233 pass / 12 private skip**, **3/3 dev**, lint uten feil/advarsler. Tallene er historiske, ikke rekjørt 19. november i dette uttrekket. Native OCR hadde separat 7/7 på klargjort macOS; ingen Windows/Linux- eller universell layoutgaranti. Private dokumenter/resultater er ikke sensors klongrunnlag.

Finans-/regelfasit og `financial-scenario.test.ts` er sterke deterministiske kontroller. De erstatter ikke annen persons bruk/forståelse, målt manuell referanse eller representativ dokumentkvalitet for dagens lokale analyse. Opprinnelig KI-kvalitetsmål S2 kan ikke ommerkes som bestått gjennom lokale/stubbede tester. Historiske S5-/S6-bevis må beholde opprinnelig versjon og status.

Ingen utsatte punkter lukkes av dette uttrekket. S6, tidsbesparelse, TG-/layoutgeneralisering og usikker belastning må beholde eksplisitt åpen status i den ene sentrale deferred-work-oversikten med lenke til planer/bevis.
