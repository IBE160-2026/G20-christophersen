# Manuell S5-klargjøring — ingen automatisk analyse

## Aktivt benchmark S5-B1-v1

Den nye inngangen er `benchmark.mjs`. Den gamle F1-inngangen nedenfor er
historisk og skal ikke brukes for benchmarken. Forsøks-ID er
`S5-2026-10-27-S5-B1-v1-01`, med separat bevismappe under
`.docs/implementation-artifacts/story-4-5/`. Ingen kommando bekrefter
finans/funn/liste/TG3 eller starter analyse automatisk.

Root sine eksplisitte kommandoer, med Node 24.21.0 og ferdig bygget app:

```sh
node tools/story-4-5/benchmark.mjs prepare
node tools/story-4-5/benchmark.mjs serve-unarmed
node tools/story-4-5/benchmark.mjs arm /absolutt/benchmark-approval.json
node tools/story-4-5/benchmark.mjs serve-armed
```

Serverne bruker samme `127.0.0.1:3000`; stopp den uarmede før den armed
startes. Uarmet POST avvises før pipeline. Root gjennomfører datert preflight
og godkjenning før `arm`; dette er en separat lokal fil, ingen nettleserrute.
Bare Mads sitt senere Start analyse kan utløse ett produksjonskall.

`prepare` binder manifestets SHA-256 og alle seks filbindinger i det fryste
caset, ekte PDF.js-grunnlag, eksakt createLiveRequest, source/build og aktuell
prosjektledger. Fasit og finansgrunnlag er bare hashbundet kontrollgrunnlag;
de legges aldri til providerinput. Alle writes er eksklusive. Endrede
benchmarkfiler eller kilde/build krever ny avklaring, ikke overskriving.

Approval-filen bruker samme felt som den historiske formen nedenfor, med
følgende casebundne verdier i tillegg. Kopier hashverdier fra den nye planen:

```json
{
  "caseId": "S5-B1-v1",
  "attemptId": "S5-2026-10-27-S5-B1-v1-01",
  "reportHash": "fra ny plan",
  "benchmarkManifestSha256": "fra ny plan",
  "oracleSha256": "fra ny plan",
  "financialSha256": "fra ny plan"
}
```

Dette objektet er et tillegg, ikke en komplett approval-fil. Behold
requestSha256/sourceFingerprint, owner=Mads, full codeCommit, checkedAt,
alle sju sanne plan-/rootgodkjenningsflagg, gateEvidence/methodEvidence/
accountEvidence med faktiske filhashreferanser, datert prisgrunnlag og
budsjettfeltene fra den historiske formen. Ingen menneskelig utføring
attesteres av disse flaggene. `checkedAt` kan ikke være eldre enn 24 timer
eller mer enn ett minutt frem i tid. Kost før forsøk må være nøyaktig lik
plan og oppdatert ledger, reservasjon USD 1.53, faktisk operativ grense USD 2.
Ved denne implementeringen var avstemt prosjektkost USD 0.023092 og
rest USD 1.976908; root må bruke faktisk preflight ved senere arming.
Godkjent full kodecommit må være ancestor til HEAD, og source/build må
fortsatt ha nøyaktig samme fingerprint. Rene bevis-/dokumentcommits tillates.

Valgfritt, etter lokal oppstart, kan root kjøre
`node tools/story-4-5/benchmark.mjs open-setup`. Dette åpner et nytt synlig
Chrome-vindu og fyller bare finansens registreringsfelt/kilder/år/leietype
fra fryst fil. Det trykkes aldri på bekreftelse, neste, filopplasting,
analyse eller noen kontrollhandling. Mads bekrefter selv. Kommandofasen
tillater bare lokale GET-forespørsler; etter forhåndsfylling fjernes dette
oppsettsfilteret, slik at normal brukerstart senere er mulig.

Kjent faktisk providerusage gir en separat `costOnly:true`-receipt før
svaret returneres til SDK/UI. Receipt har `humanControlStatus:not-recorded`
og `s5Measured:false`; ingen uiControlCompleted eller tidspunkter for Mads.
Dermed kan kost ikke forsvinne om UI/kontroll senere avbrytes. Ukjent usage,
feil og uavstemte forsøk stopper felles prosjektledger. Den globale paidlock
beholdes også etter kjent kost frem til root eksplisitt avstemmer:

```sh
node tools/story-4-5/benchmark.mjs reconcile
```

Denne offlinekommandoen validerer receipt, prosjektets kostkjede og eksakt
låseier før frigivelse. Den er idempotent, godkjenner ingen menneskelig
kontroll og utløser ingen analyse. Ikke slett låsen for å forsøke på nytt.
Den suspenderte gamle F1-planen uten dispatch/usage/receipt teller ikke kost.

Målrettede tester (API-nøkkel/modus fjernet, OS-nettsperre og bare loopback):

```sh
env -u OPENAI_API_KEY -u ANALYSIS_MODE sandbox-exec -f .docs/implementation-artifacts/story-5-3-nettprofil.sb node --test tools/story-4-5/benchmark.test.mjs tools/story-4-5/manual.test.mjs tools/story-4-4/b2-lifecycle.test.mjs tools/story-4-4/run-safety.test.mjs
```

## Historisk F1-klargjøring

Dette er et engangsverktøy uten apptelemetri, timer eller browserautomatisering.
Ingen analyse startes av kommandoene prepare/server/arm; Mads må senere trykke
Start analyse selv. Root eier preflight/arming og brukerrettet kortinstruks.
Detaljert måleskjema beholdes som internt bevis.

## Gratis lokal forberedelse

Med prosjektets Node 24.21.0 og ferdig `dist`:

```sh
node tools/story-4-5/manual.mjs prepare
node tools/story-4-5/manual.mjs serve-unarmed
```

`prepare` lager kun den nye mappen
`.docs/implementation-artifacts/story-4-5/S5-2026-10-24-F1-01/`. Den må ikke
eksistere fra før. Planen har `armed:false`, gate/account `pending`, faktisk
PDFjs-/createLiveRequest-hash og source/build-fingeravtrykk. R1-reservasjon
USD 1.53 dekker 100000 inputtokens ved USD 2.5/M inklusive mulig cachewrite
og 128000 outputtokens ved USD 10/M. Historisk kostnad valideres fra alle
4.4-receipts/preflight. Dette erstatter ikke dagens kontoavstemming.

Serveren tilbyr bare ferdigbygget `dist` og ekte router på
`http://127.0.0.1:3000`. Åpning/GET er gratis. Uarmet POST avvises **før**
uploadparser/pipeline/provider. Ingen armingrute finnes i browseren.

## Root sin eksplisitte lokale godkjenning

Etter reell gate-/konto-/pris-/regresjonsavstemming og fastlagt menneskelig
gjennomføring/metode skriver root en separat lokal approval-fil (aldri nøkkel).
Dette er formen; feltene skal fylles med faktisk grunnlag, ikke eksempeldata:

```json
{
  "attemptId": "S5-2026-10-24-F1-01",
  "requestSha256": "fra plan.json",
  "sourceFingerprint": "fra plan.json",
  "codeCommit": "full gjeldende commit",
  "owner": "Mads",
  "checkedAt": "faktisk ISO-tid",
  "gateClosed": true,
  "humanInitiationOnly": true,
  "measurementMethodDefined": true,
  "rootExplicitApproval": true,
  "regressionPassed": true,
  "accountVerified": true,
  "unknownChargesResolved": true,
  "gateEvidence": { "path": "absolutt faktisk beslutningsfil", "sha256": "faktisk filhash" },
  "methodEvidence": { "path": "absolutt faktisk metode/person/miljø/prosessbevis", "sha256": "faktisk filhash" },
  "accountEvidence": { "path": "absolutt faktisk datert internpreflight", "sha256": "faktisk filhash" },
  "priceSource": "https://developers.openai.com/api/docs/models/gpt-6.1-sol",
  "inputUsdPerMillion": 2,
  "outputUsdPerMillion": 10,
  "cachedUsdPerMillion": 0.1,
  "cacheWriteUsdPerMillion": 2.5,
  "costBeforeUsd": 0.016072,
  "reservationUsd": 1.53,
  "accountLimitUsd": 2,
  "availableUsd": 1.983928
}
```

Tallene må avstemmes igjen ved faktisk arming. Filhashene binder erklæringene
til faktisk kontrollbart bevis; verktøyet kan ikke bevise innholdets sannhet
eller at et menneske faktisk er klart. Bruk stabilt datert bevis, ikke en
fortløpende promptlogg som endres etter at hash er bundet.

Stopp uarmet server. Root kan deretter eksplisitt kjøre
`node tools/story-4-5/manual.mjs arm /absolutt/approval.json` og
`node tools/story-4-5/manual.mjs serve-armed`. Dette skal **ikke** gjøres før
de faktiske avklaringene foreligger. Ingen ny Mads-klar-erklæring eller prøveopptak kreves av verktøyet; opptak/start utføres av Mads etter instruksen. Kode/build må være uendret siden prepare;
gjeldende full commit bindes ved arming. Denne commiten må fortsatt være en
ancestor av HEAD ved senere oppstart; dokument-/beviscommits kan følge uten
ny arming når det eksakte source/build-fingeravtrykket er uendret. Endret
produktkode, helper, avhengigheter eller dist avvises fortsatt. Kun Mads
starter analysen i appen.

## Bevis og stopp

Én POST forbruker forsøket, også ved ugyldig upload; restart gir ikke ny
tillatelse. Transporten tillater bare F1 og nøyaktig forventet leverandørrequest
etter kun requestId-normalisering. Ett transportforsøk totalt; originale
request-bytes videresendes uendret gjennom produksjons-SDK med retry=0.
Request-body, dispatch, HTTP-status, fullført provider-body, usage/kostnad og
appens terminalutfall lagres med eksklusive writes. Ingen headere lagres.
Feilbody fra provider kan sitere nøkkelfragmenter og utelates derfor eksplisitt.

Historisk global paidlock gjenbrukes og frigjøres aldri automatisk her, selv
ved kjent usage. Ved timeout/abort/prosessdød/ukjent kostnad beholdes lås og
reservasjon. Root må avstemme eier/receipt/usage/konto før videre betalt arbeid;
ikke slett låsen for å prøve igjen. Ingen automatisk reconcile/retry er lagt til.
Menneskelig video/kontroll/resultatbevis innhentes separat; transportbevis er
aldri menneskelig S5-tid. Ikke bruk gamle 4.4-script eller overskriv originaler.

Offline-prøver, med API-nøkkel og modus fjernet og bare loopback tillatt:

```sh
env -u OPENAI_API_KEY -u ANALYSIS_MODE sandbox-exec -f .docs/implementation-artifacts/story-5-3-nettprofil.sb node --test tools/story-4-5/manual.test.mjs
```
