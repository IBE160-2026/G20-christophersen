# Code-first salgsoppgave: verifikasjon og leveringsgrense

Dato: 2026-10-29. [Godkjent arbeidsplan og AC](../spec-salgsoppgave-code-first.md),
[design/kostnadsgrunnlag](../../planning-artifacts/salgsoppgave-code-first-design-2026-10-29.md),
[arbeidsøkt](../../process/arbeidsokter/2026-10-29-salgsoppgave-code-first-build.md).
**Godkjent offline-scope er ferdig implementert og sluttverifisert. Ingen
live-test eller betalt API-kall er utført. PAA-SO2 er fortsatt åpen for live/kvalitet.**

## Levert kodegrunnlag

Den eksisterende 200-siders PDF.js-/worker-/childflyten gjenbrukes. Kjente
syntetiske PDF-er beholder tidligere demonstrasjonsuttrekk. Ukjente PDF-er
får lokal struktur-/økonomi-/TG-analyse og manifest over alle originale
tekstintervaller. Ufullstendig grunnlag eller uløst semantikk sperrer teknisk
bekreftelse, mens kildebelagte økonomifelter kan kontrolleres separat.

Semantisk adapter bruker kompakte blokk-/kandidat-ID-er og materialiserer
eksisterende kilder etter svarvalidering. Den offisielle SDK-grensen er
prøvd med obligatorisk injisert offline-fetch, fiktiv nøkkel, ingen nett og
merkede testtellere/priser. Opplastingsruten har ingen produksjonstransport.
Eksisterende `ANALYSIS_MODE=live` åpner ikke ny import.

## Faktiske prøver

Alle nedenstående kommandoer bruker pinned Node 24.21.0/npm 11.19.0,
`OPENAI_API_KEY=` og `ANALYSIS_MODE=demo`. Loopback-/RSS-prøver bruker
sandboxeskalering for lokale servere/prosessmåling. Ingen eksponert nøkkel,
betalt transport, ekstern filhenting eller push inngår.

| Prøve | Resultat | Råbevis |
| --- | --- | --- |
| Hovedagentens første nye unit-prøver | 36 bestått | [initial-targeted.txt](initial-targeted.txt) |
| Lokal analyse, budsjett, klient/state og PDF/SDK | 73 bestått | [targeted-core.txt](targeted-core.txt) |
| Faktisk HTTP/child og bevarte ressursgrenser | 14 bestått | [targeted-http.txt](targeted-http.txt) |
| PDF.js → SDK-stub → menneskelig kontroll → screening | 2 bestått | [targeted-pdf-screening.txt](targeted-pdf-screening.txt) |
| Implementeringsbygg/typekontroll | Bestått, kjent Vite-chunk-varsel | [build-implementation.txt](build-implementation.txt) |
| Implementeringslint | Bestått | [lint-implementation.txt](lint-implementation.txt) |
| Berørt faktisk salgsoppgaveflyt i nettleser | 11 bestått | [e2e-prospectus-implementation.txt](e2e-prospectus-implementation.txt) |
| Første full unit/integrasjon | 1356 bestått, 53 filer | [full-tests.txt](full-tests.txt) |

## Endelig akseptanse etter reviewrettinger

| Sluttkontroll | Faktisk resultat | Råbevis |
| --- | --- | --- |
| Full unit/integrasjon etter alle produktrettinger | **1384 bestått i 53 filer** | [final-acceptance-tests.txt](final-acceptance-tests.txt) |
| Første reviewrettinger | 96 målrettede bestått | [review-fixes-targeted.txt](review-fixes-targeted.txt) |
| Siste reviewrettinger, inklusive faktisk 200-siders PDF | 85 målrettede bestått | [review-round-two-targeted.txt](review-round-two-targeted.txt) |
| Full nettleserregresjon etter produktrettinger | **218 bygget + 3 dev bestått** | [final-e2e-complete.txt](final-e2e-complete.txt) |
| Siste kostnads-/modus-/restpresentasjon | **11 berørte E2E bestått**, separat fra fullrunden | [final-presentation-e2e.txt](final-presentation-e2e.txt) |
| Runtime etter typeretting og siste UI-tekst | **58 bestått** | [final-ui-runtime-recheck.txt](final-ui-runtime-recheck.txt) |
| Komponentregresjon | **37 bestått**; disse komponentene er ikke endret av senere parser-/presentasjonsrettinger | [full-components.txt](full-components.txt) |
| Endelig bygg/typekontroll | **Bestått**, kjent Vite-chunk-varsel | [final-build-complete.txt](final-build-complete.txt) |
| Endelig lint | **Bestått** | [final-lint-complete.txt](final-lint-complete.txt) |
| Uavhengig BMAD-review | Alle 20 registrerte funn rettet; **tre siste nykontroller uten restfunn** | [review.md](review.md), [kildebinding og `[]`](review-recheck.json) |
| Bevarte regler og historikk | **78 låste filer byteidentiske**, opprinnelig deferred-work/prompt bevart som prefix | [preservation.json](preservation.json) |

Fullrunden ovenfor ble kjørt etter siste parser-/adapterretting. Deretter ble
kun presentasjon presisert: lokalt uttrekk får korrekt toppetikett,
stoppårsaker/tokenstatus forklares og identiske hovedmeldinger samles.
Den fulle fysiske restlisten er bevart. Egen sluttprøve av alle 11 berørte
nettlesertilfeller, 58 runtime-/UI-prøver og nytt bygg/lint gjelder denne siste
presentasjonen. Dette ommerkes ikke til en ny full 218-runde.

Første siste-byggforsøk fant `never[]` i teststubbens tomme limitations-liste
([bevart feil](final-acceptance-e2e.txt)). Listen fikk eksplisitt `string[]`;
ingen runtime/testforventning ble endret. Verifikasjonsrevieweren bekreftet
den rene typerettingen separat. Alle endelige produktkilder samsvarer med
den kildebundne reviewen; den senere type-/presentasjonsdeltaen er registrert
og uavhengig kontrollert i review-recheck.json.

[Siste faktiske UI-bilde](code-first-generic-blocked.png) er visuelt kontrollert:
lesbar kilde-/områdevisning, korrekt offline-opphav og deaktivert områdebekreftelse
ved uløst rapporttekst. Ingen rå blokk-ID-er eller gjentatte hovedforklaringer.

## AC-spor

- **AC1:** `code-first-import.test.ts` kontrollerer komplett manifest og at
  tekst uten markør/final side blir sendt; blokk-/kandidatfjerning gir sperre.
- **AC2:** negative kilde-/hash-/side-/raster-/identitets-/områdeprøver,
  kontraktens selvstendige manifestkontroll og eksisterende importgate.
- **AC3:** `code-first-budget.test.ts` prøver inkluderte grenser, samlet
  reservasjon, separat rapport, ukjent pris/teller/historikk og endret digest.
- **AC4:** `code-first-pdf.test.ts` bruker ekte PDF.js, offisielt SDK med
  stubbet transport, eksisterende kilde-/økonomigrenser, menneskelig kontroll
  og uendret screening. Ny faktisk nettleserprøve viser sperret semantikk
  og samme-hash-gjenbruk uten ekstra POST.

## Bevisgrense før live

USD 0,20 er analysetaket; opptil 40k input og 8k output inklusive reasoning.
Ved referansepris gir 10k/2k USD 0,04 og 20k/4k USD 0,08. Dette er
aritmetiske scenarier, ikke målt dokumentgjennomsnitt. Testteller er eksplisitt
`test-only`. Ingen verifisert lokal modell-/framingteller er levert eller
påstått; manglende teller og prisgrunnlag sperrer live. Budsjettprøver beviser
kodegrensen med injiserte data, ikke kontoens tilgjengelige saldo.

Manifestet sikrer at ubehandlet relevant tekst ikke forsvinner i filtrering;
det beviser ikke universell semantisk TG-recall. Ustøttet layout og grafisk
innhold kan fortsatt kreve et annet tekstbasert originalgrunnlag. Reell
modellkvalitet, tilgang, tokenframing og første live-forsøk må avklares og
godkjennes separat. Historiske S5/S6-bevis endres ikke.

AC1–4 og alle fire I/O-matriselinjer er akseptert for dette offline-scope.
Live-porten forblir ubetinget stengt; lokal verifisert token-/framingteller,
gjeldende pris-/forbrukshistorikk, produksjonstransport og reell kvalitetsprøve
er ikke aktivert eller bevist av stubtestene. Ingen betalte API-kall eller push.
