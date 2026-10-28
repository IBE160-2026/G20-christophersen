# FINN-2 — Responses-kobling og sluttverifikasjon

Dato: 2026-10-28. Baseline: `f3b1f3053c8704e01191e5f585836ca0d1d8614c`.
[Godkjent arbeidskontrakt](../spec-finn-responses-kobling.md).

**SDK-koblingen er implementert, reviewet og offline-verifisert. Tilgangsgaten
er fortsatt stengt som standard. Ingen faktisk FINN-/modellforespørsel eller
betalt transport er brukt i denne utviklingsøkten.**

## Levert funksjonalitet

`server.ts` kobler listing-ruten til en egen backendfabrikk. Bare når alle tre
operatørverdiene er satt, kan fabrikkens nøkkellesing/klientkonstruksjon skje:

- `FINN_IMPORT_ENABLED=true`
- `FINN_IMPORT_ACCESS_REFERENCE` med en ikke-tom tilgangsgodkjenning
- `FINN_IMPORT_COST_REFERENCE` med en ikke-tom kostnadsautorisasjon

`OPENAI_API_KEY` leses bare på backend gjennom eksisterende sikre
SDK-konfigurasjon. `ANALYSIS_MODE` åpner ikke FINN-gaten og styrer fortsatt bare
rapportanalyse. Gaten kontrollerer at referanser er satt; operatøren må selv
kontrollere innholdet og at godkjenningene faktisk gjelder. Referansen er ikke
en implementert krone-/USD-grense.

Offisielt SDK 6.9.1 bruker Responses API, samme låste modell/innstillinger,
fast OpenAI-endepunkt, `maxRetries: 0`, ett verktøykall og absolutt frist.
Den **eksakte validerte innlimte URL-strengen** går til requesten; faktisk
completed `open_page` må ha samme URL. Ingen search/find, alternativ kanal
eller gjentatte tool-handlinger aksepteres. Svar leses med bytegrense også
når SDK-et selv leser en feilkropp.

Én transport kan være aktiv om gangen. Hver FINN-kode forsøkes høyst én gang
per serverstart, også etter feil eller avbrudd. Busy/gateavvisning bruker ikke
et nytt forsøk. Ved frist/abort holdes sperren til den underliggende transporten
og body-kanselleringen faktisk er avsluttet. Vellykkede utkast kan ikke hentes
igjen i UI/klient/reducer. Nytt bevisst forsøk krever serveromstart og ny
sidelasting; annonsefeltet er låst mens oppslaget pågår.

Entydig, kildestøttet P fylles automatisk i eksisterende økonomiskjema som
**ubekreftet**. Originale felt, mangler, motstrid, sitat/URL og rettinger beholdes.
P er fortsatt pris + kjent fellesgjeld, uten omkostninger. Inkludert
dokumentavgift legges ikke til omkostningene på nytt. Ukjent gjeld eller
sprik gir ingen automatisk P; usplittede/ufullstendige kostnader gir ingen
oppdiktet komplett D/J. Manuelle verdier, kilder, år og perioder bevares.

Importert J kan ikke blandes med en avvikende manuell P. Ved faktisk prisbrudd
blankes fortsatt import-eid J, mens manuell J beholdes. Avstemmingen bruker
kanoniske desimaler og bindingen til brukt snapshot, ikke et ubrukt utkast.
Tilstandsrapport lastes fortsatt opp manuelt. Finans- og screeningkjernen
er uendret; ingen overvåking, automatisk PDF eller nye estimater er lagt til.

## Faktisk verifikasjon

Node 24.21.0 / npm 11.19.0, eksisterende Chromium. Lokal loopback fikk
eskalert sandboxtilgang ved behov. FINN-gaten er eksplisitt stengt i standard
Playwright-servermiljøet, også ved arv til dev-oppsettet. SDK-testene bruker
syntetisk nøkkel og stubbet fetch, ikke faktiske kontonøkler eller tjenester.

| Kontroll | Resultat | Utskrift |
| --- | --- | --- |
| Berørte unit-/HTTP-filer etter review | 4 filer / 118 bestod | [Målrettet](review-fixes-tests.txt) |
| `npm test`, alene | 45 filer / 1224 bestod | [Full Vitest](final-vitest.txt) |
| `npm run build` inkl. typekontroll | Bestod; eksisterende bundle-advarsel | [Bygg i E2E-løpet](final-e2e-after-scroll.txt) |
| `npm run lint` | Bestod | [Lint](final-lint-after-scroll.txt) |
| `npm run test:components` | 37 bestod | [Komponenter](final-components.txt) |
| `npm run test:e2e` | 205 bygget app + 3 dev bestod | [Full E2E](final-e2e-after-scroll.txt) |
| Berørt fokus-/rullekontroll | 8 bestod | [Målrettet scrollkontroll](scroll-verification.txt) |

Første brede browserløp ga 204 bestått og ett 30 s-avbrudd i eksisterende
`scrollend`/PageDown-venting ([første utskrift](final-e2e.txt)). Lyttingen er
nå garantert registrert før tastetrykket. Testen kontrollerer faktisk rulling
fra startposisjonen, deretter scrollslutt, samt alle tidligere fokus-/geometrikrav.
Ingen tidsgrense eller forventning er svekket. Fullt ordinært løp bestod etter
rettingen, inklusive dev-delen som ikke startet i det feilede løpet.

## AC- og matrisespor

| Krav/tilfelle | Kjørbar dekning |
| --- | --- |
| FK-1 / stengt og ufullstendig gate | `listing-backend.test.ts`: getter-spioner viser ingen nøkkellesing/klient/fetch; HTTP/E2E viser trygg gatestatus og manuell reserveflyt |
| FK-2 / offisielt SDK og eksakt URL | Ekte SDK med stubbet fetch: fast endepunkt, settings og original legacy-/trackingstreng; annen åpning, gammel struktur, feilstatus og store svar avvises uten retry |
| FK-2 / strømmede svar | 200/429/500, kumulative små UTF-8-chunks, bytegrense med observert tidlig cancel og ulest rest; stanset SDK-feilkropp gir sikker fristfeil |
| FK-3 / samtidighet/forsøksvern | Backend og HTTP: busy bruker ikke annen kodes forsøk; kode/URL-varianter gir ingen ny transport; pending cancellation holder produksjonsbackend busy; klienten låser før React-oppdatering |
| FK-4 / automatisk skjema | Reducer/E2E: P=3200000 fylles ubekreftet, D/J forblir ukjent ved ufullstendighet; manuell P/D/J og kildeendringer bevares under venting og bruk |
| FK-4 / pris/J og motstrid | Kanonisk norsk P, avvik, anvendt J, manuell J og ubrukte rettinger; available + konfliktalternativer gir ingen automatisk P |
| FK-5 / opptak, mangler og eksisterende flyt | Gammelt uendret råopptak avvises gjennom SDK-stubben; syntetisk fasit er positiv testdata. Full finans-, rapport-, kontroll- og screeningregresjon bestod |

Det gamle opptaket under `finn-open-page-2026-10-28/response.json` viser
completed open_page på legacy-lenken med kode 476576649, men har et annet
feltskjema. Det er brukt uendret som negativ kompatibilitetsprøve og er ikke
omskrevet til ny feltfasit. Positive SDK-/UI-prøver bruker tydelig syntetiske
verdier; disse dokumenterer ingen faktisk annonsekvalitet.

## Review og bevaring

Tre separate kontekstfrie BMAD-reviewere undersøkte samme diff. Alle funn ble
individuelt triagert før gruppering. [Review](review.md) og
[retteloggen](review-fixes.md) viser konkrete feil, ett avvist forslag og
rettinger. Ingen reelle reviewfunn er utsatt. Hovedøkten fullførte etter avbrudd
i implementeringsagenten og etter brukerens beskjed om å fortsette.

Tolv beskyttede filer er byteidentiske med baseline: finans, kostnads-/input-
validering, terskler, screening, FinancialBasis, PDF-backendkonfigurasjon og
abortmodul, sprintstatus, S5-W1, S6-overlevering og første FINN-spec. Hele det
originale open_page-bevissettet og tidligere FINN-sluttbevis er uendret.
Tidligere innhold i deferred-work og aktiv promptlogg er bevart som prefix.
Bygget frontend ble kontrollert uten backendens nøkkel-/gatereferansenavn
eller OpenAI-endepunkt. Ingen push er utført.

## Før første faktiske FINN-lenke kan prøves i UI

1. Ha dokumentert tillatt tilgang for den faktiske integrasjonen og en
   uttrykkelig kostnadsautorisasjon for den kontrollerte prøven. Dette arbeidet
   har verken innhentet tillatelse eller autorisert et betalt oppslag.
2. Sett egen `OPENAI_API_KEY` kun i backendmiljøet og de tre gateverdiene over,
   med reelle godkjenningsreferanser. Ikke legg nøkkelen i Git, chat eller
   `VITE_*`. Koden kontrollerer ikke at referansen faktisk er godkjent.
3. Start serveren på nytt, last siden på nytt og behold gjerne
   `ANALYSIS_MODE=demo` slik at rapportprøver fortsatt bruker lagret uttrekk.
   Velg én annonse, ha originalen tilgjengelig for kontroll og klikk én gang
   på **Hent FINN-grunnlag**.
4. Under selve første prøven verifiseres den nye requesten/prompten/schemaet,
   faktisk open_page-handling, feltdekning, mangler og tall mot originalen.
   Feil skal stoppe uten automatisk nytt forsøk. Et eventuelt senere forsøk
   må være uttrykkelig autorisert og startes etter serveromstart/sidelasting.

Live-kildekvalitet og nytt relevant leverings-/S6-grunnlag gjenstår før ordinær
akseptanse av den utvidede versjonen. Historiske S5/S6-bevis erstattes ikke,
og FINN-1 forblir åpen i sentral deferred-work. S6 kreves ikke før den første
kontrollerte UI-prøven kan gjennomføres.
