# Story 3.8 — egenverifikasjon før uavhengig review

Dato: 2026-10-22. Baseline: `49d21e185215c00c39282c132933b64038778cd1`.

Autoritet: [Story 3.8 AC1–5](../planning-artifacts/epics.md), [gyldig Epic3-kontekst](epic-3-context.md), [implementeringsspec](spec-3-8-oppdatere-resultat-etter-endret-og-bekreftet-finansgrunnlag.md), gjeldende kontrakter og [sprintstatus](sprint-status.yaml). Kontekstcache ble kontrollert mot alle planfilenes mtimes og var gyldig. Done-spec 3.7 ga kontinuitet. Kursuttrekk og faglærerfeedback er brukt til sporbarhet og meningsfulle testbevis; ingen nye produktkrav er utledet.

## Leveranse og avgrensning

Resultatnavigasjonen i `sessionReducer` fornyer eksisterende snapshot når bare finansbindingen er endret, eller en finansendring fortsatt venter etter gjenbekreftelse med identisk sluttbinding. Finansgrunnlaget må være gyldig/bekreftet og eksisterende rapportkontroll fullført. Beregning, screening, snapshot og historisk vern bruker de eksisterende autoritetene. Uendret retur bevarer samme snapshotobjekt. Ubekreftet/ugyldig endring beholder forrige historiske resultat.

Hele resten av bindingen sammenlignes (rapportidentitet/status, funnkontroll, liste og TG3). Endret rapport-/funn-/TG3-binding fornyes derfor ikke gjennom Story 3.8. Story 3.9 er fortsatt backlog. Ingen backend, kontrakt, domainregel, skjerm, ny bekreftelseshandling, testrute eller analysehandling er lagt til.

## AC-spor og fasit

| AC/testspor | Konkret bevis |
|---|---|
| AC1: faktisk verdi/metadataendring opphever relevant bekreftelse; historisk inntil ny kontroll | Ny `financial-result-renewal.test.ts`: L/P/D/J, periode, sammenlignbart år, kilde og kostnadsinnhold. Eksisterende `result-snapshot.test.ts` prøver alle finansfelt, alle perioder/år/kilder, D/J-fellesperiode og kostnadsfordeling. Bygget-app BT-12 viser historisk F1 med navngitt L-kontrollbehov ved ugyldig forsøk, og bevarte P/D-bekreftelser. |
| AC2 / BT-12 / AT-16 finans: ny bekreftelse og resultatnavigasjon | Både overgangstest og bygget app bruker L 1 900 000→1 400 000 med beholdt F1-rapport. Nytt gjeldende Forkast med håndskrevet F2-fasit 8,750 %, 1 000 000, 6,250 %, 200 000. Stateprøven verifiserer hele snapshotbindingen, økt finansrevisjon, tom endringsliste og uendret gammelt snapshot. P/D/J-prøvene kontrollerer alle berørte og uberørte beløp/brøker. |
| AC3 / BT-13 / AT-14 finans: Ymin påvirker bare screening | To nye bygget-app-forløp: bare Ymin 7→10, og Ymin blank→mislykket bekreftelse→10. Fire nøkkeltall er identiske før/etter; ubekreftet verdi lar F1 forbli historisk; bekreftet 10 gir gjeldende Forkast. Beregningsgrensens rene test viser Innhent mer informasjon ved manglende/ubekreftet Ymin uten tap av nøkkeltall. Ingen UI-port forbi finansbekreftelsen er innført. |
| AC4: gjenbruk av rapportkontroll/TG3; prioritet 1 består | Alle syv nye bygget-app-tester teller nøyaktig ett `/api/analysis`-kall gjennom første analyse og etterfølgende finansfornyelser. Uendret rapportgrunnlag vises, listebekreftelsen bevares. F4 med L 1 400 000 og 3 000 000 fornyer alle tall med fortsatt Uavklart alvorlig TG3 / prioritet 1 / Delgrunnlag. Rene tester verifiserer identisk rapportobjekt, uendret TG3-revisjon og også gjenbruk av gyldig Avklart med grunnlag. Rapportfeil testes ved state-/beregningsgrensen: feilen består som prioritet 1, mens vanlig UI-navigasjon fortsatt er sperret fra ny beregning. |
| AC5: uendret retur, ugyldig→rettet→bekreftet offline | BT-12 sperrer alle eksterne nettforespørsler før appen åpnes, observerer null eksterne forsøk og ett lokalt analysekall. Uendret retur er Gjeldende. L −1 fokuserer feltet med `aria-invalid`, lokal negativfeil og Endret-status; fremoverknappen mangler. Historisk F1 er lesbar. Rettet/bekreftet L gir Gjeldende F2 uten ny analyse. Stateprøve verifiserer identisk snapshot ved retur/gjentatt bekreftelse og bevarte revisjoner. Demo bruker eksisterende nøkkelfri pipeline. |
| AT-10: eksakt yieldgrense, ingen visningstoleranse | Ny bygget-app-test fornyer fra F1 til L 1 520 000: NOI 1 120 000, nettoyield 7,000 %, kontantstrøm 320 000 og Gå videre. Ny endring til L 1 519 999 gir NOI 1 119 999, nettoyield fortsatt vist 7,000 %, men Forkast og synlig underkravsforklaring. Ett analysekall totalt. |
| AT-11: null og én krone negativ kontantstrøm | Ny bygget-app-test fornyer J til 1 500 000: 0 kr/år og Gå videre. J til 1 500 001 gir −1 kr/år og Forkast. Alle tre øvrige tall er identiske. Ett analysekall totalt. |
| Scope: 3.9 forblir uimplementert | Tre nye overgangsprøver endrer henholdsvis TG3, brukt avvisning/ny listebekreftelse og rapportfeil, deretter finans. Resultatet forblir historisk; finansfornyelsen tar ikke over rapport-/TG3-fornyelsen. |

## Kjørte tester

Grønne kjøringer bruker pinnet Node `v24.21.0`/npm `11.19.0` fra `/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin` og Chromium fra `/private/tmp/ibe160-story-3-5-browsers`. Lokal server krevde sandboxunntak for binding til 127.0.0.1:3000; dette ble godkjent. Ingen ekstern tjeneste eller betalt API ble brukt.

| Kontroll | Resultat | Bevis |
|---|---|---|
| Nye overgangstester før produksjonsendringen | 12 røde av 17; alle ved manglende fornyelse | [Rødt bevis](story-3-8-state-rod.txt) |
| Berørte Vitest: ny finansfornyelse, snapshot, resultatnavigasjon, finansbekreftelse/-grunnlag, komplett screening | **241/241 bestått**, inkludert **18 nye** | [State/testlogg](story-3-8-state.txt) |
| Første fem nye bygget-app-forløp | **5/5 bestått** | [Første E2E](story-3-8-e2e.txt) |
| Berørt bygget-app finans/resultat inklusive nye eksakte terskelforløp | **46/46 bestått**, inkludert **7 nye** | [E2E-regresjon](story-3-8-e2e-berort.txt) |
| `npm run build` (inkludert typecheck) | Bestått | [Bygg](story-3-8-build.txt) |
| `npm run typecheck` etter siste tester | Bestått | [Typecheck](story-3-8-typecheck.txt) |
| `npm run lint` | Bestått, null feil/advarsler | [Lint](story-3-8-lint.txt) |
| `git diff --check` | Bestått | Kontrollert før checkpoint |

Bygget-app-prøvene kjører ordinær lokal PDF-/demopipeline med reelle fiktive fixtures, ikke en offentlig testrute. Fasitverdiene er håndskrevne fra de godkjente finanscasene; produksjonens formatterer brukes ikke til å generere forventningene. Logikknære mangler/rapportfeil testes ved de eksisterende stategrensene, uten ny navigasjon som omgår kontroll.

### Eksakte kommandoer og miljø

Kjør fra repositoryroten. Disse miljøverdiene ble brukt for de grønne kjøringene; Playwright starter lokal demoserver fra eksisterende konfigurasjon. Runtime- og browserstiene må finnes i miljøet som reproduserer kjøringen.

```sh
export PATH="/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:$PATH"
export PLAYWRIGHT_BROWSERS_PATH="/private/tmp/ibe160-story-3-5-browsers"
npm run build

# Faktisk første kjøring, før AT-10/AT-11-testene ble lagt til: 5 tester.
npx playwright test tests/e2e/screening-result.spec.ts --grep '3.8' --workers=2

# Faktisk berørt sluttkjøring etter tillegg av AT-10/AT-11: 46 tester.
npx playwright test tests/e2e/screening-result.spec.ts tests/e2e/financial-input.spec.ts --workers=2

# Faktisk målrettet Vitest-kjøring før review: 241 tester.
npm test -- tests/unit/financial-result-renewal.test.ts tests/unit/result-snapshot.test.ts tests/unit/screening-result-navigation.test.ts tests/unit/financial-confirmation.test.ts tests/unit/financial-basis.test.ts tests/unit/complete-screening.test.ts
npm run typecheck
npm run lint
git diff --check
```

På dagens testfil velger `--grep '3.8'` syv tester. For å reprodusere utvalget på fem i den første loggen fra dagens fil, bruk `npx playwright test tests/e2e/screening-result.spec.ts --grep '^3\.8 (BT-|AC4)' --workers=2`. Denne avgrensede reproduksjonskommandoen oppgis for etterprøvbarhet; den er ikke kjørt på nytt i patchfasen.

## Rettingsspor etter uavhengig review

R1 rettet en faktisk AC5-feil: gyldig J=0 → tilbaketrukket nullkontroll → gjenopprettet nullkontroll → ny bekreftelse kunne ha identisk binding og likevel et ventende finansendringsspor. Resultatnavigasjonen tar nå dette sporet med i vurderingen. Gyldig finans, fullført listekontroll og sammenligning av hele den ikke-finansielle bindingen består som porter. Reviewerens [røde råbevis](story-3-8-review-rod.txt) er bevart urørt. Den utvidede regresjonsprøven krever nytt snapshot etter gjenbekreftelse, og krever fortsatt historisk snapshot når et rapportfunn også er avvist og den nye listen bekreftet; 3.9-fornyelse er ikke aktivert.

R2–R5 styrker eksisterende prøver: P/D/J har direkte anbefaling/prioritet/triggerfasit; månedlig L har års-L 22 800 000, NOI 22 400 000, nettoyieldbrøk 22 400 000/16 000 000 og kontantstrøm 21 600 000; numerisk kostnad 150 000 med gjeldsdel 30 000 gir oppdatert snapshotinnhold D120 000/J30 000 uten tillegg til registrerte D/J-totaler; et faktisk manglende-Ymin-snapshot beholdes gjennom Ymin10/bekreftelse og erstattes først ved resultatnavigasjon. R6 er rettet med de eksakte kommandoene over.

Kun målrettede prøver for endret session-kode ble kjørt i patchfasen, med pinnet Node og følgende kommando:

```sh
PATH=/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:$PATH npm test -- tests/unit/financial-result-renewal.test.ts tests/unit/result-snapshot.test.ts tests/unit/screening-result-navigation.test.ts tests/unit/session.test.ts tests/unit/financial-confirmation.test.ts
```

**148/148 bestått** i fem filer, inkludert 20 finansfornyelsesprøver. [Grønt patchbevis](story-3-8-review-patch-test.txt). Full sluttregresjon og uavhengig etterkontroll utføres av forelder/reviewer etter denne patchfasen. Reviewrapport, spec og sprintstatus avgjøres ikke av implementeringsagenten.

## Agentgjennomført fokus- og visuell kontroll

Faktiske nettleserbilder fra BT-12 er åpnet og inspisert. [Ugyldig L](story-3-8-ui/ugyldig-finans-fokus.png) viser synlig feltfokus, lokal negativfeil, bekreftet P og historisk Resultat-status i sticky trinn. [Fornyet F2](story-3-8-ui/fornyet-f2.png) viser Gjeldende, Forkast/prioritet 2 med eksakt økonomisk forklaring, fire korrekte F2-tall og bevart F1-rapport/funnliste. Ingen blanding med gamle tall observeres. De automatiserte kontrollene etterprøver også første feilfokus og trinnoverskrift ved fremover-/resultatnavigasjon. Dette er agentgjennomført QA, ingen påstand om menneskelig S5/S6-/live-evaluering.

## Checkpoint

R1–R6 er rettet og klar for separat uavhengig etterkontroll. Spec er **in-review**, sprintstory er **review**. Implementeringsagenten har ikke utført review eller satt done. Forelderen kjører full siste regresjon etter review og eventuelle rettinger. Ingen ny produkt-/arkitekturbeslutning, ingen Story 3.9+, ingen push.
