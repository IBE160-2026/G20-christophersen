# Teknisk kvalitet og testbevis – leveransekontroll

Dato: 2026-11-06. Utført av subagent `teknisk_test`, med hovedagenten som integrator.
Referanse: `639291814886a6058a24adf95c69e8633b645944`. Ingen produktkode er endret.
Etter den første tekniske kontrollen avdekket hovedagentens rene klon en
privatmiljøavhengig tekstforventning i én E2E-helper; den er korrigert som
dokumentert nedenfor. Ingen betalte KI-kall er utført.
Dette er en teknisk gjennomgang av den lokale bachelorprototypen, ikke en
produksjonsgodkjenning eller en menneskelig brukertest.

## Grunnlag og avgrensning

AGENTS.md, sensorveiledningens sju kriterier, PRD/arkitektur, gjeldende
investeringsspesifikasjon og tidligere import-/QA-bevis er brukt.
Hovedagenten gjennomfører separat ren klon, installasjon, E2E, fersk
avhengighetskontroll og repo-/historikkskann. Denne rapporten eier kode-/teststikkprøven,
full unit-/integrasjonskjøring og komponent-/native-testene.

Kritiske produktregler ble stikkprøvd i `src/domain/finance.ts`, `financing.ts`,
`financial-scenario.ts`, `source-economy.ts`, felles kontrakter og frontend state.
Dokumentkjeden ble fulgt fra HTTP-mottak gjennom isolert PDF-behandling og
lokalt uttrekk til kilder, kontroll og screening. Ingen kritisk produktfeil som
begrunner funksjonsendring ble avdekket i dette omfanget.

## Faktiske kjøringer før E2E-testkorreksjonen

Miljø: macOS arm64, Node **24.21.0**, npm **11.19.0**. Shellens standard var
Node 26.8.1; alle sluttestene brukte prosjektets pinnede Node 24 eksplisitt.
`OPENAI_API_KEY` var tom, `ANALYSIS_MODE=demo`. Integrasjonene bruker lokale
servere og kontrollerte leverandørsvar; de oppretter ingen betalte API-kall.

| Kontroll | Resultat | Etterprøvbart bevis |
| --- | --- | --- |
| `npm run lint` | Bestått, exit 0, ingen advarsler | Kommando kjørt av teknisk subagent i denne økten; hovedagentens rene kjøring er separat bevis |
| `npm run typecheck` | Bestått, exit 0 | Samme støttede runtime; `tsc -b` |
| `npm test` | **2 238 bestått, 7 skip**, 111 filer bestått / 1 fil skip, 98,34 s, exit 0 | [Fullstendig kjøresammendrag](unit-integrasjon-godkjent.txt) |
| `npm run test:components` | **50/50 bestått**, 14,1 s, exit 0 | [Komponentlogg](komponenter-godkjent.txt) |
| `PAA_TEST_LOCAL_VISION=1 npm test -- tests/integration/local-visual-native.test.ts` | **7/7 bestått**, 10,39 s, exit 0 | [Native OCR-logg](native-ocr.txt) |

De sju vanlige skipene er de valgfrie macOS/Vision-testene; de er kjørt og bestått
separat over. Hovedrepoets fulle testpakke inkluderer også én eksisterende prøve
som bare kjøres når en privat original er lokalt tilgjengelig
(`saved-economy-real.test.ts`). Den prøven vil bli skippet i en ren klon.
Det er ingen forutsetning for de offentlige syntetiske testene eller demoen.
Private originalbytes og uttrekk er ikke lagt i disse rapportene.

Playwright **1.64.0** forventer Chromium/headless shell **1248**. Denne versjonen
ble installert i en ny midlertidig mappe med
`PLAYWRIGHT_BROWSERS_PATH=/private/tmp/paa-delivery-browsers-20261106 npx playwright install chromium`.
[Installasjonslogg](playwright-installasjon.txt). Samme miljøvariabel ble brukt
ved komponentkjøringen; ingen gammel browser ble tilpasset den nye låsfilen.

To mislykkede miljøforsøk er bevart:

- [Sandbox-forsøket](unit-integrasjon-sandbox.txt) ga 2 175 bestått, 63 feilet,
  7 skip og 6 errors, med `EPERM` ved `listen 127.0.0.1` og fire tidsfristfeil.
  Samme uendrede suite bestod etter lokal loopback-/prosesstilgang. Den første
  kjøringen er ikke et bestått testbevis.
- [Komponentforsøket før browserinstallasjon](komponenter-uten-browser.txt)
  feilet fordi forventet browser 1248 manglet i brukercachen. Ny korrekt
  installasjon ga 50/50 uten produkt- eller testendring.

## Hva testene faktisk beviser

| Område | Konkret dekning og kilder | Grense for konklusjonen |
| --- | --- | --- |
| Finans og regler | [`finance.test.ts`](../../../tests/unit/finance.test.ts) bruker hardkodet PRD-fasit F1–F4/BT: F1 gir 11,875 % bruttoyield, NOI 1 500 000 kr, 9,375 % nettoyield og 700 000 kr/år før skatt. Mangler, måned/år, konflikt, ubekreftede tall, negativt resultat og én krone under terskel prøves. [`thresholds.test.ts`](../../../tests/unit/thresholds.test.ts), [`screening.test.ts`](../../../tests/unit/screening.test.ts) og [`complete-screening.test.ts`](../../../tests/unit/complete-screening.test.ts) kontrollerer prioritering og anbefaling. | Dette beviser de definerte deterministiske reglene, ikke lønnsomhet, banktilgang eller investeringskvalitet. |
| Finansiering og kapital | [`financing.test.ts`](../../../tests/unit/financing.test.ts), [`financial-scenario.test.ts`](../../../tests/unit/financial-scenario.test.ts), [`scenario-defaults.test.ts`](../../../tests/unit/scenario-defaults.test.ts): nullrente, annuitet, øreavrunding før annualisering, kontantkjøp, ugyldige vilkår, kapitalbehov, egenkapital og fellesgjeld. Eksempel: 2 000 000 kr, 6 %, 240 måneder gir 14 328,62 kr/mnd. Fellesgjeld finansieres ikke en gang til. | Årsbetalingen er månedsbetalingen ×12 også ved løpetid under ett år. Grafen er en konstant fremskriving; den er ikke skatt, salg, verdistigning eller totalavkastning. |
| Kostnader uten dobbelttelling | [`financial-basis.test.ts`](../../../tests/unit/financial-basis.test.ts), [`purchase-ledger.test.ts`](../../../tests/unit/purchase-ledger.test.ts), [`explicit-document-economy.test.tsx`](../../../tests/unit/explicit-document-economy.test.tsx): gjeldsdel skilles fra drift, underposter summeres ikke to ganger, omkostninger og dokumentavgift avstemmes, frivillige pakker påvirker ikke obligatorisk kontantbehov. | Kjent delsum er ikke fullstendig drift. Ukjent inkludering, kostnadsår eller gjeldsbetaling skal fortsatt blokkere avhengige konklusjoner. |
| Dokumentkilder | [`code-first-pdf.test.ts`](../../../tests/integration/code-first-pdf.test.ts), [`economy-references.test.ts`](../../../tests/unit/economy-references.test.ts), [`pdf-source.test.ts`](../../../tests/unit/pdf-source.test.ts): ekte PDF.js-parsing av fiktive PDF-bytes, dokumenthash, fysisk PDF-side og eksakte UTF-16-uttrekk. Korrigering, avvisning, ny rapport og foreldet resultat har egne tester. | Gyldig hash, side og tekstspenn beviser kildebinding; det beviser ikke at alle relevante forhold i alle rapporter er funnet. |
| PDF og ressurser | Format-/sidetall-/lesbarhetstestene og [`document-import.test.ts`](../../../tests/integration/document-import.test.ts), [`http-analysis.test.ts`](../../../tests/integration/http-analysis.test.ts), [`http-analysis-review.test.ts`](../../../tests/integration/http-analysis-review.test.ts), [`import-worker-heap.test.ts`](../../../tests/integration/import-worker-heap.test.ts) prøver ugyldig format, store input, samtidighet, abort, timeout, faktisk child-close og heapgrenser. | Testene viser konkrete profiler og feilbaner. En import på inntil 200 sider/50 MiB lover ikke støtte for alle PDF-formater. Gammel rapportanalyse har egen 30-sidersgrense. |
| Lokal tekst-/risikoanalyse | [`technical-summary.test.ts`](../../../tests/unit/technical-summary.test.ts), [`technical-risk.test.ts`](../../../tests/unit/technical-risk.test.ts), [`technical-reconciliation.test.ts`](../../../tests/unit/technical-reconciliation.test.ts), [`risk-grouping.test.ts`](../../../tests/unit/risk-grouping.test.ts), [`legal-risk.test.ts`](../../../tests/unit/legal-risk.test.ts): negasjon, usikkerhet, ulike rom/enheter, eksplisitt TG, detaljer mot sammendrag og konservativ gruppering. | Regulære tekst-/layoutregler er ikke generell semantisk forståelse, juridisk godkjenning eller komplett TG-dekning. |
| Native bilder/OCR | [`local-visual-native.test.ts`](../../../tests/integration/local-visual-native.test.ts) bruker ekte PDFKit/Vision på fiktive vektor-/raster-PDF-er: to kolonner, svart-hvitt, TG2/TG3, mørkerød grad, inline-heading og kolonnefortsettelse. | Beviser den testede lokale macOS-kjeden. Ikke generell OCR-kvalitet, støtte på Linux/Windows eller komplett rapportdekning. |
| Brukerflate | 50 faktiske nettleserkomponenttester prøver belåningssliderens native endepunkter og tastatur, gamle workerresponser, synlige scenariofeil, originalbildevern og screeningvisning. | Komponentharness er isolert fra hele appen. Ende-til-ende- og ren klon-bevis skal leses separat. Ingen full WCAG-revisjon påstås. |

## Arkitektur og sikkerhetsbevissthet

Den reelle lagdelingen er gjenkjennelig: delte Zod-kontrakter, rene
finans-/screeningregler, presentasjon, React-state og backend for PDF/HTTP.
`finance.ts` beholder yield som eksakt teller/nevner; terskler avgjøres før
visningsavrunding. Scenarioet er en separat, ubekreftet modell og returnerer
ingen screeninganbefaling. Funnkontroll, listebekreftelse og alvorlig TG3-avklaring
er separate handlinger. Det er en styrke mot falsk trygghet.

Sikkerhetskontrollen fant konkrete eksisterende vern:

- Serveren binder bare `127.0.0.1` og tilbyr bygget `dist/`, ikke reporoten eller
  `private/`. API og HTML har trygge feilbaner; `nosniff` settes.
- Opplastingsnavn brukes som visningsmetadata, aldri som filsti. Originalbytes
  signatur-/container-/sidetallkontrolleres. Multipart, PDF, tekst og prosessutdata
  har grenser; parseren kjører isolert og underprosessen termineres før låsen frigjøres.
- Importbarn får tomt arvet miljø. Backendnøkler går ikke inn i frontend eller PDF-barn.
  Ingen automatisk retry brukes ved usikkert betalt utfall. Økonomiruten krever
  begge samtykker og bundet dokument/request før nøkkelbruk og budsjettreservasjon.
- Kontrakter, request-/generasjonsbinding, hash og runtime-fingeravtrykk avviser
  manipulerte eller foreldede resultater. Ressurs- og livsløpstester er mer
  meningsfulle her enn bare å kontrollere at et HTTP-svar er 200.

Dette er en lokal enkeltbrukerapp, uten innlogging, flerbrukerautorisasjon eller
produksjonsdrift. `run-import.ts` måler Node-barnets RSS via `/bin/ps` som
best-effort, i tillegg til heap-/parsergrenser. OCR har separat ressursvern;
512 MiB er ikke en samlet maksimal kvote for alle prosesser. Plattformforskjeller
er ikke verifisert her. Ingen bred refaktorering eller avhengighetsoppgradering
er gjort bare for å pynte på en stabil leveranse.

## Korrekt status for KI og historiske bevis

Automatisk PDF-import bruker `createCodeFirstImport` uten semantisk transport.
`/api/document-import-config` oppgir `liveEnabled: false`, og klientens forsøk på
annen importmodus avvises. Semantikkadapteren godtar bare en eksplisitt
`offline-stub` i kontrollerte tester. Derfor er komplette uttrekk i stubtester
ikke bevis på aktiv semantisk KI i produktet.

Den separate, brukerstartede økonomi-KI-flyten er fremdeles bevart bak lokal nøkkel,
overførings-/kostnadssamtykke, requestbinding og budsjettjournal. Den eldre
`/api/analysis`-adapteren har også en valgfri live-modus. Disse må ikke forveksles
med automatisk PDF-semantikk eller fremstilles som brukt i denne kontrollen.
En tidligere privat økonomianalyse kan bare gjenbrukes etter integritets-/hashkontroll
av samme opplastede original; den finnes ikke i en ny klon. Fire offentlige,
fiktive demosvar er konstruerte uttrekk, ikke nye modellresultater.

Tidligere S2/live- og S5-bevis gjelder sine historiske versjoner. Det foreligger
ingen ny representativ semantisk kvalitetsbenchmark for dagens lokale analyse,
ingen ny validert tidsbesparelse og ingen annen-person-S6 i denne agentkjøringen.
Åpne forhold skal fortsatt føres i den [sentrale utsattoversikten](../../implementation-artifacts/deferred-work.md).

To dokumentasjonsavvik ble oversendt hovedagenten for integrasjon:
den historiske arkitekturspinen omtaler tidligere UX og ennå ikke eksisterende
app-scripts, og den opprinnelige `.env.example` foreslår live selv om demo er
standard og `.env` ikke lastes automatisk av Node. Nye statuspresiseringer må
peke til dagens flyt uten å omskrive historiske beslutninger eller testbevis.

## Privatmiljøavhengig E2E-forventning avdekket i ren klon

Hovedagentens første rene E2E-kjøring av referanseversjonen ga 231 bestått,
12 skip og 2 feil i `new-document-import.spec.ts`, begge i `localOnly`-helperen.
Testen krevde teksten «Ingen lagret analyse for dette dokumentet». Den teksten
gjelder et eksisterende arkiv som tilhører en annen PDF. En ren klon mangler
hele det private arkivet og viser korrekt «Lagret analyse finnes ikke».

Teknisk subagent kontrollerte årsaken uavhengig i
[`attachSavedEconomy`](../../../src/backend/import/saved-economy.ts):
`saved-analysis-document-mismatch` og `ENOENT` har med vilje ulike begrunnelser,
med identisk lokal fallback og uendret innholdssperre. Begge grenene finnes
allerede i `d9fd4701025ddcd54a7aa14fe72abd419e4888e0`; testens ene tekstkrav
var derfor avhengig av utviklerens private miljø. Den eksisterende
[`saved-economy.test.ts`](../../../tests/unit/saved-economy.test.ts) prøver
allerede begge feilkildene med syntetisk arkiv og kontrollert `ENOENT`.

Bare tekstasserten i
[`localOnly`](../../../tests/e2e/new-document-import.spec.ts) er endret.
Den krever nå eksplisitt alle tre felles opplysninger: «kun lokalt uttrekk
vises», «Videre KI-analyse har ikke startet» og «Ingen nye KI-API-kall er utført».
Den verifiserer dermed mer av den faktiske sluttbrukerkontrakten og godtar
begge lovlige årsaker til at arkiv ikke brukes. Proveniens `local-only`,
ingen requestdigest/observasjoner/valgte sider, sperret teknisk analyse,
null reservasjon, dokumenthash, filnavn og eksakte kildespenn er beholdt
uendret. Ingen produktkode, beløpsfasit eller krav til sikkerhet/kompletthet
er endret.

Hovedagenten eier målrettet rekjøring og ny full E2E-suite i den rene klonen.
De opprinnelige feilene og de nye resultatene skal leses sammen med det
separate klon-/leveransebeviset; første mislykkede kjøring erstattes ikke
av denne begrunnelsen.
