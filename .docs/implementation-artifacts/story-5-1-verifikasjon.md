# Story 5.1 — samlet automatisk demoverifikasjon

Dato: 2026-10-22. Status: done etter [separat uavhengig BMAD-review](story-5-1-review.md) og full grønn sluttregresjon. Resultatene nedenfor beskriver implementeringskjøringen; reviewrapporten dokumenterer siste tillegg/omkjøring.

## Versjon, grunnlag og avgrensning

Baseline er `8b28fa296a2f37072b8f583290e2a9ec8791be00` (git rev-parse HEAD før arbeid). Implementeringscommit er `28028b955823517607f8402151be84f04443e0f2`. Testet kode er baseline pluss `tests/integration/demo-screening.test.ts`; øvrige endringer er kontekst/spec/status og bevis. Reviewets tillegg og tester identifiseres i [reviewrapporten](story-5-1-review.md). Ingen produktkode er endret.

Autoritet: [Story 5.1 AC1–5](../planning-artifacts/epics.md), [SPEC](../specs/spec-IBE160/SPEC.md) med kompanjonger, [sprintplan](sprint-plan.md), [sprintstatus](sprint-status.yaml), final UX/arkitektur destillert i [Epic 5-kontekst](epic-5-context.md). Kursgrunnlag er eksisterende PDFKit-baserte [sensoruttrekk](../planning-artifacts/prds/prd-IBE160-2026-10-10/kildeuttrekk-sensorveiledning.md) fra den lenkede originale PDF-en og [faglærerfeedback](../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md): kjent finansfasit, kjørbare meningsfulle tester og konkrete prosess-/reviewbevis. Ingen krav om prosentdekning eller nye testtyper er lagt til.

## Påvist hull og retting

H1 (AC1/2/4, FR-12/13/16, Story 2.4 + 3.4/3.5): tidligere demo-integrasjon prøvde faktisk PDF/adapter uten screening, og snapshot-/screeningtester konstruerte analyseutfallet. Den nye [integrasjonstesten](../../tests/integration/demo-screening.test.ts) lukker koblingshullet med faktiske F1–F4 PDF-bytes, validatePdf → extractPdf → analyzeDocument ved ordinær demoadaptergrense → report/session-reducer → calculateResultSnapshot. Kilde/funn/side, kontrollport, bekreftelser, eksakte beløp/forholdstall, prioritet/avgjørende kode, delgrunnlag, revisjon/rapportbinding og ett faktisk adapterkall kontrolleres. Eksisterende håndskrevet `expected.json` og eksplisitte PRD-forventninger gir fasit; produktberegningen lager ingen forventet verdi.

F3 kan ikke starte rapportanalyse fra mangelfullt finansgrunnlag. Første prøveoppsett forventet rapportkontroll etter en korrekt sperret report-start; dette ga 1 feilet/3 bestått. Oppsettet er rettet: først bevises sperret videregang med manglende L; deretter etableres rapportkontroll med gyldig L, før L fjernes igjen. F3-snapshot prøves bare ved den rene beregningsgrensen, alle fire tall er unavailable/null med L-årsak, normal navigasjon er fortsatt sperret og intet snapshot legges i økten. Ingen port eller produktregel er endret for å få testen grønn. Første rene testkjøring brukte verts-Node 26.8.1; bestått omkjøring og alle sluttkontroller bruker repoets Node 24.21.0.

## Testgrenser og spor til forhåndsdefinert fasit

Alle kjørbare demorader nedenfor inngår i ufiltrert `npm test`, `npm run test:e2e` og/eller `npm run test:components`; ikke-kjørte live-rader er uttrykkelig merket. Det er ingen skip/only/todo i den nye testen. Kolonnen angir konkrete testfiler og søkbar testtittel/variant; hver rad er avgrenset til levert demo eller ren logikk. Live-uttak er ikke kjørt.

Forkortelser: U=`tests/unit/`, I=`tests/integration/`, E=`tests/e2e/`, K=`tests/components/`. [BT-fasit](../planning-artifacts/prds/prd-IBE160-2026-10-10/addendum.md), [fixturefasit](../../tests/fixtures/property-cases/expected.json).

| RT-ID | Faktisk testgrense og forventning |
|---|---|
| RT-1 | I/pdf-format «godtar 30 sider», I/pdf-extraction «beholder alle 30 sider», E/app-shell «faktisk demoserver analyserer én multipart-PDF»; format/fullt grunnlag/ett demokall. Live-delen ikke kjørt. |
| RT-2 | I/pdf-format 31 sider/ugyldig fil; I/pdf-extraction tekstløst/uleselig; E/report-analysis «analysefeil/delresultat og dokumentfeil»; feil uten completed. |
| RT-3 | E/screening-result «3.8 BT-12»; L→F2, historisk/gjeldende og faktisk ett POST. |
| RT-4 | E/screening-result «3.9 AC5/6: rapportbytte» og «kontrollert sent svar»; ny identitet/kontroll/analyse, gammelt svar forkastes. |
| RT-5 | I/demo-analysis fysisk TG3-side/trykt side; E/report-analysis «2.7 AC1/2/5 RT-5»; PDF-side 4, original og nettressurser. |
| RT-6 | I/demo-analysis sammenligner alle fysiske eksplisitte grader med funn; ingen ekstra TG-grad i demo. Reell modellklassifisering er ikke evaluert. |
| RT-7 | U/document-analysis kilde-/gradusikkerhet og E/report-analysis «2.7 AC4 RT-7»/«usikker kilde»; ingen gjettet side. |
| RT-8 | E/report-analysis «original fysisk side 4»/«smalt panel»; originalbytes, hel side/nabosider/kilde. |
| RT-9 | I/pdf-extraction uleselig/unknown/incomplete; E/report-analysis «analysefeil/delresultat»/«delresultat er ufullført»; feil og lokale mangler, ingen fullføring. |
| RT-10 | U/finding-list-control «completed findings: []» og E/report-analysis «RT10/12»; eksplisitt separat listekontroll. |
| RT-11 | E/report-analysis «2.8 AC1–4 RT-11» og E/screening-result «3.9 AC1/2/6»; TG2/side 5, original/utkast/Bruk/Avbryt og ett kall. |
| RT-12 | E/report-analysis «2.9 AC1–4 RT-12», E/screening-result «avvist TG3»; inaktiv original/ny listekontroll, ingen falsk avklaring. |
| RT-13 | U/finding-list-control «listebekreftelse avklarer aldri TG3», E/screening-result F4 og «3.9 AC3/6»; prioritet 1 etter bekreftet liste. |
| RT-14 | E/report-analysis «RT11/13/14/19», E/screening-result «3.9 AC1/2/6»; ny bekreftelse og historisk snapshot. |
| RT-15 | I/demo-analysis ny prosess uten miljø/nøkkel/nett; E/screening-result offline BT-12 og korrigering; ingen ekstra kall. |
| RT-16 | Ikke kjørt: faktisk opprinnelig modelltreff/S2 eies av Story 4.4. |
| RT-17 | Demoens fysiske eksplisitte funn kontrolleres i I/demo-analysis; faktisk modelltreff på alle TG2/TG3 ikke kjørt, eies av 4.4. |
| RT-18 | Ikke kjørt: faktisk live-utelatelse og S2-minimum eies av Story 4.4. Ingen demo brukes som bevis. |
| RT-19 | U/document-analysis «bare eksplisitt completed gir fullført tomliste», U/complete-screening AT-13 og E/report-analysis failed/tomliste; ingen falsk komplett liste eller Gå videre. |

| BT-ID | Faktisk testgrense og forventning |
|---|---|
| BT-1 | U/finance «F1/BT-1», I/demo-screening F1, E/screening-result F1; eksakte fire tall og viste formler/input. |
| BT-2 | U/finance «F2/BT-2», I/demo-screening F2, E/screening-result F2; fire F2-tall. |
| BT-3 | U/finance «F3/BT-3», I/demo-screening F3 og K/screening-result; fire unavailable, konkret L-mangel, ingen snarvei. |
| BT-4 | U/finance «F4/BT-4», I/demo-screening F4, E/screening-result F4; F1-tall/delgrunnlag. |
| BT-5 | U/finance avhengighetsmatrise og U/thresholds «blank J»; tre gyldige tall, cash unavailable. |
| BT-6 | U/finance «P=0», U/complete-screening «BT-6/P=0»; ingen yield/divisjon, beholdt NOI/cash. |
| BT-7 | U/finance «BT-7/15»; faktor 12 og 1440000/240000/600000-årsgrunnlag. |
| BT-8 | U/finance «BT-8», U/thresholds «nøyaktig 7 prosent», E/screening-result «3.8 AT-10»; likhet/énkronebrudd uten toleranse. |
| BT-9 | U/finance «BT-9/10», U/thresholds nullgrense, E/screening-result «3.8 AT-11»; 0 mot −1. |
| BT-10 | U/finance «BT-9/10», U/complete-screening «AT-15/BT-10»; bekreftet J=0 mot ubekreftet null. |
| BT-11 | U/finance «−100000 NOI»; negative NOI/yield/cash beholdes. |
| BT-12 | U/financial-result-renewal og E/screening-result «offline ugyldig→rettet→bekreftet L»; F2 etter kontroll, ett kall. |
| BT-13 | E/screening-result «3.8 BT-13» med manglende/bare endret Ymin; samme tall, korrekt ny regel/port. |
| BT-14 | U/finance avhengighetsmatrise, U/financial-basis, U/complete-screening AT-12; kildekonflikt/negativ/ubekreftet, ingen standardtall. |
| BT-15 | U/finance «BT-7/15», U/complete-screening «blandet kjent måned/år»; eksakt normalisering. |
| BT-16 | U/finance avhengighetsmatrise/ulike år, U/financial-basis og U/complete-screening «period/year»; konkret mangelfasit. |
| BT-17 | U/finance «F2 uten J», U/complete-screening «AT-6/BT-5/17»; delberegninger/Informasjon over svakt yield. |
| BT-18 | U/finance «Ymin-mangel», U/complete-screening «BT-18/blank Ymin»; alle fire tall/informasjon. |

| AT-ID | Faktisk testgrense og forventning |
|---|---|
| AT-1 | U/complete-screening «AT-1/F1», I/demo-screening F1, E/screening-result F1; prioritet 3/full tekst/handling. |
| AT-2 | U/complete-screening «AT-2/F2», I/demo-screening F2, E/screening-result F2; bare yieldbrudd/prioritet 2. |
| AT-3 | U/complete-screening parameter «AT-3», U/thresholds; positiv yield, cash −1/prioritet 2. |
| AT-4 | U/complete-screening parameter «AT-4», U/thresholds «både yieldbrudd»; begge eksakte utløsere i fast orden. |
| AT-5 | U/complete-screening «AT-5/F3/BT-3»; manglende L overstyrer høy J; I/demo-screening F3 prøver koblingen. |
| AT-6 | U/complete-screening «AT-6/BT-5/17»; J-mangel overstyrer F2-yield. |
| AT-7 | U/complete-screening «AT-7/F4», I/demo-screening F4, E/screening-result F4; navngitt TG3-side/delgrunnlag. |
| AT-8 | U/complete-screening FR-5 eksempel 2–4, U/tg3-resolution, E/report-analysis «negative tekstfelt»; ugyldig/ukjent status. |
| AT-9 | U/complete-screening «elektrikeravklaring», E/screening-result «3.9 AC3/6»; gyldig avklaring/Gå videre, beholdt opphav. |
| AT-10 | U/complete-screening likhet/under, E/screening-result «3.8 AT-10»; synlig forklaring ved avrundet likhet. |
| AT-11 | U/complete-screening likhet/under, E/screening-result «3.8 AT-11»; 0→−1 og ny kontroll. |
| AT-12 | U/complete-screening blank D/J/Ymin, negativ D/J, ubekreftet hvert felt/kildekonflikt; P=0/perioder ved samme funksjon. |
| AT-13 | U/complete-screening missing/ready/analysing/failed, dokument/analysis-feil/usikkerhet; E/report-analysis feil/delresultat/tomliste. |
| AT-14 | U/complete-screening «Ymin=10», E/screening-result «3.8 BT-13»; brukerterskel gjelder. |
| AT-15 | U/complete-screening «AT-15/BT-10» og U/thresholds; eksplisitt kontantkjøp gir 1500000. |
| AT-16 | U/result-snapshot endringsmatrise; U/financial-result-renewal og U/report-result-renewal; E/screening-result 3.8/3.9 historisk/gjeldende. |
| AT-17 | E/screening-result F1/F2/F4 anbefaling øverst, fast tekst/handling, input/funn/original; K/screening-result mangelfasit. Bare demoflyt prøvd. |
| AT-18 | U/complete-screening «alle fire kjente forhold»; eksakt L/Ymin/rapport/TG3, tekst/handling; E/report-analysis «delresultat er ufullført» ved lokal grense. |
| AT-19 | U/complete-screening F1/F2/AT-18 fem gjentakelser/fryst input og null fetch; full byteidentisk tekst/utløsere. |
| AT-20 | U/complete-screening «AT-7/F4/BT-4 og AT-20», E/screening-result F4 med L-varianter; TG3 overstyrer F2-økonomi. |

| FR-5-eksempel | Faktisk testgrense og forventning |
|---|---|
| 1 | U/complete-screening «elektrikeravklaring», U/tg3-resolution FR5-1 og E/screening-result 3.9; gyldig begrunnelse/basis, beholdt TG3/opphav. |
| 2 | U/complete-screening eksempel 2 og U/tg3-resolution FR5-2; Uavklart med navngitt mangel. |
| 3 | U/tg3-resolution FR5-3 begge tekstfelt/whitespace, U/complete-screening eksempel 3; konkrete feil og prioritet 1. |
| 4 | U/tg3-resolution FR5-4 inkl. null registrering/ukjent status og U/complete-screening eksempel 4; ingen automatisk Avklart. |
| 5 | U/complete-screening eksempel 5, E/report-analysis «FR5-5/6»; bare andre TG3 avgjør. |
| 6 | U/complete-screening eksempel 6, E/report-analysis «FR5-5/6»; alle avklart med F2 gir Forkast. |
| 7 | U/complete-screening eksempel 7, U/tg3-resolution FR5-7, E/screening-result «hver TG3-tekst/statusendring»; historisk→nytt informasjonsresultat uten kall. |

## AC3/4: feil, kontroll og endring ved faktisk grense

U/http-pipeline-races + I/http-analysis/review prøver faktisk duplikatlås, abort/cleanup, forsinkede svar og adapterkall. E/report-analysis prøver ordinær HTTP/kontrolladapter med kilde/usikkerhet, completed tomliste mot failed/delresultat og utkast/Bruk/Avbryt/Avvis. E/screening-result 3.8/3.9 prøver fornyelse etter finans-/funn-/TG3-endring og ny rapport, med faktisk ett/totalt to POST og historisk/gjeldende visning. E/report-analysis lokale feilprøver og U/screening-result-navigation beviser at utilstrekkelig grunnlag sperrer normal Resultat-vei. K/screening-result prøver utilgjengelige tall/mangler ved komponentgrensen. Ingen test introduserer produktnavigasjon eller omgår brukerbekreftelser i hovedreisen.

Den nye integrasjonens kallteller beviser ett adapterkall i den direkte analysepipelinen. Reducerhandlingene gjør ikke HTTP-kall; fravær av ekstra forespørsler ved kontroll/navigasjon bevises av de eksisterende HTTP-/E2E-testene ovenfor.

## Vurdering av testsensitivitet

Gjennomlesing av konkrete assertions, ikke bare testnavn: U/finance sjekker eksakte beløp/brøktellere/null og navngitt feltårsak; U/thresholds sjekker eksakt kryssprodukt/fortegn; U/complete-screening sjekker alle ordnede koder, prioritet, full fast tekst og neste handling. I/demo-analysis sammenligner faktisk fysisk PDF-tekst/side og all eksplisitt TG2/TG3 med håndskrevet fasit; ny I/demo-screening binder dette til korrekt anbefaling og kontrollport. U/result-snapshot og E/screening-result sjekker samme snapshotidentitet ved historikk og ny revisjonsbinding ved fornyelse. E/report-analysis og E/screening-result teller faktiske HTTP-/adapterkall og sjekker at sent svar ikke overtar ny rapport. Feil verdi, prioritet, status, side, revisjon eller ekstra kall gjør de respektive forventningene røde. Dette er en kildebasert sensitivitetsgjennomgang; det er ikke gjennomført en generell mutation-score eller innført dekningsprosent.

## Kommandoer og resultat

Resultater føres etter terminal fullføring; se arbeidsøkt og rålogger. Node `v24.21.0`, npm `11.19.0`, eksisterende lokalt forberedt Chromium (`PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-3-5-browsers`). Build lages av `npm run test:e2e`; ingen betalt tjeneste/nøkkel. Sandboxens første fulle Vitest-kjøring blokkerte listen på 127.0.0.1 (EPERM): 940 bestått/22 feilet og én miljøfeil, se [rålogg](story-5-1-vitest-sandbox.txt). Den er ikke et produktfunn og er gjentatt med godkjent lokal loopbacktilgang.

| Kontroll | Faktisk resultat | Råbevis |
|---|---|---|
| Ny integrasjon, repoets Node | 4/4 bestått | [integrasjon](story-5-1-integrasjon.txt) |
| Full Vitest, isolert loopback | 962/962 i 31 filer bestått (81,83 s) | [Vitest](story-5-1-vitest.txt) |
| Build + bygget-app-E2E | Build bestått, 114/114 bestått | [E2E/build](story-5-1-e2e.txt) |
| Dev-E2E | 3/3 bestått | [E2E](story-5-1-e2e.txt) |
| Komponenter, sekvensielt etter Vitest | 37/37 bestått | [komponenter](story-5-1-komponenter.txt) |
| Typecheck | Bestått, exit 0 | terminal `npm run typecheck` |
| Lint | Bestått, exit 0 | [lint](story-5-1-lint.txt) |
| Diffkontroll | Bestått | `git diff --check`, staged diff lest før commit |

Første godkjente loopbackforsøk ga 961/962 med én eksisterende F1 HTTP-test som traff 5 s under samtidig Chromium-kjøring, se [bevart forsøk](story-5-1-vitest-forste-loopback.txt). Isolert ufiltrert omkjøring er 962/962 uten kilde-, forventnings- eller timeoutendring. Samtidig Chromium/HTTP-konkurranse er en sannsynlig forklaring, ikke bevist årsak; ingen timeoutøkning er innført. De øvrige fullkontrollene er avsluttet før komponentkjøringen. Alle avsluttende tester kjørte uten filter/skip. Builds eksisterende størrelsesvarsel, NO_COLOR/FORCE_COLOR og forventede Vite-avvisninger av private stier er synlige i råloggen og ga ingen testfeil.

## Begrensninger

Dette er automatisk demobevis for levert versjon. Manuell UX/tilgjengelighet er Story 5.2, komplett README er 5.3, faktisk annen person/rent miljø er 5.4/R4-S6 og samlet leveransebevis er 5.5. Ingen live-modell, SDK, S2 eller faktisk live-S5 er kjørt; R1 er uendret åpen og Epic 4 er ikke startet. Kontrolladapterens deterministiske svar viser integrasjon/feilhåndtering, ikke modelltreff eller faktisk menneskelig tidsgevinst.
