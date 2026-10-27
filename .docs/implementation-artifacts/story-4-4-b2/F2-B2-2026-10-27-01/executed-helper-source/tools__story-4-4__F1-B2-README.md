# Ny F1 B2-sluttkontroll

Kun eksplisitt engangskjøring, aldri npm/test/live-regresjon. Root kjører. Ingen S5/tidtaking/replay. Originale F1–F4-filer og benchmark røres aldri.

Med Node 24, ferdig dist og PLAYWRIGHT_BROWSERS_PATH:

```
node tools/story-4-4/f1-b2.mjs prepare .docs/implementation-artifacts/story-4-4-b2/preflight-2026-10-27.json
node tools/story-4-4/f1-b2.mjs run
```

Prepare er gratis, starter ingen server/analyse. Stabilt datert preflight krever attemptId F1-B2-2026-10-27-01, checkedAt (under 24 timer), accountVerified/unknownChargesResolved/accessVerified/priceVerified true, costBeforeUsd0.016072, accountLimitUsd2, availableUsd1.983928, reservationUsd1.53, prices {input:2,cached:0.1,cacheWrite:2.5,output:10}, priceSource https://developers.openai.com/api/docs/models/gpt-6.1-sol. Root må dokumentere faktisk konto-/tilgangs-/prisgrunnlag i samme fil. Ikke hashbind en fortløpende promptlogg. Ikke commit eller endre kode/build etter prepare; planen krever eksakt commit og kildefingeravtrykk.

Run krever backendnøkkel, sender ett ekte kall og stopper ved originalt kildekontroll-checkpoint uten automatisk timeout under rootens kontroll. Les outcome.json/checkpoint.json og visuelt original.png/source.png i ny forsøksmappe. Bare hvis faktisk funn og alle begrensninger er kildekontrollert, skriv `limitation-approval.json` med:

```
{"attemptId":"F1-B2-2026-10-27-01","outcomeSha256":"hash av outcome.json","reportHash":"F1-PDF-hash","reviewedBy":"root-agent","originalPdfReviewed":true,"findingAssessment":{"findingId":"eksakt faktisk funn-ID","description":"eksakt faktisk beskrivelse","source":{"documentName":"F1-tilstandsrapport.pdf","reportHash":"F1-PDF-hash","pdfPage":2},"sourceSupported":true,"originalUnchanged":true},"assessments":[{"index":0,"original":"eksakt faktisk begrensning","reason":"konkret eksplisitt kildebegrunnet vurdering","controlledNonCritical":true}]}
```

Root må vurdere faktisk ny beskrivelse semantisk mot PDF-en; ingen tekstlikhet brukes som erstatning for vurderingen. findingAssessment binder eksakt funn og kilde og bekrefter at originalen ikke er korrigert. Ingen begrensninger gir tom assessments. Ingen ukjent/kritisk begrensning skal godkjennes; avbryt da med annen stdinlinje enn continue. Send først `continue` på stdin etter dokumentert faktisk vurdering. Dette er agentens akseptansekontroll, ikke Mads sin måling eller menneskelig S5-bevis. UI bruker eksplisitt erklæring og begrunnelse. Originalresponse bevares før bekreftelse. Kontroller deretter control.json, screenshots og receipt.json.

Kjent usage skrives også ved UI-feil; global paidlock beholdes alltid. Etter eksplisitt rootkontroll av provider/usage/receipt og eierskap:

```
node tools/story-4-4/f1-b2.mjs reconcile
```

Reconcile sender ingen forespørsel og frigir kun eid lås med konsistente kjente kostnader. Ved manglende receipt, ukjent usage eller prosessdød: stopp ved rootens manuelle avstemming, ingen sletting/retry. Ingen generell recovery fra ukjent kostnad tilbys.

Offlineprøver: fjern nøkkel/modus og kjør `node --test tools/story-4-4/f1-b2.test.mjs` under prosjektets OS-nettsperre. Prøvene bruker ingen server eller produksjonsadapter og er aldri live-bevis.

## Reviewrettinger og separat F2-forsøk

Den historiske faktisk utførte F1-helperen er arkivert under F1-forsøkets executed-helper-source før disse rettingene. Ikke kjør F1 på nytt. Delt `project-ledger.mjs` regner nå med alle validerte B2-kvitteringer; started/dispatch uten kjent kvittering og global paidlock blokkerer nytt arbeid. Den gamle manuelle F1/S5-helperen bruker samme regnskap og kan ikke returnere et foreldet totalbeløp.

F2 har egen identitet `F2-B2-2026-10-27-01`, egen mappe under story-4-4-b2 og uendret F2-PDF/fasit. Preflight har samme felter som ovenfor, men attemptId er F2-ID, costBeforeUsd er avstemt USD 0.019558 og availableUsd USD 1.980442 før dette forsøket. Root kontrollerer disse verdiene mot faktisk konto, ikke bare repo.

```
node tools/story-4-4/f1-b2.mjs F2 prepare .docs/implementation-artifacts/story-4-4-b2/preflight-F2-2026-10-27.json
node tools/story-4-4/f1-b2.mjs F2 run
node tools/story-4-4/f1-b2.mjs F2 reconcile
```

Checkpoint/approval følger samme schema med F2-ID, F2-rapporthash, faktisk fersk outcomehash og eksakt F2-funn/kilde/begrensninger. Forventet sluttutfall er Forkast med 8,750 %, 1 000 000 kr/år, 6,250 % og 200 000 kr/år. Ingen S5/tidtaking. Ingen ny betalt forespørsel fra prepare/reconcile.

Durable forsøksmarkører avvises før ny lås opprettes. Kjent kvittering skrives før opprydding; alle cleanup-handlinger forsøkes selv om en annen feiler. Feilbevis lagrer stadium, feiltype og begrenset, nøkkelredigert assertdiagnostikk. Reconcile kan gjenopptas etter avbrudd mellom journalføring og låsslipp, men kun med samme eier og konsistente receipt-/usage-/journaldata. Ingen generell låsfjerning eller retry.

Målrettet reviewverifikasjon: `node --test tools/story-4-4/f1-b2.test.mjs tools/story-4-4/b2-lifecycle.test.mjs tools/story-4-5/manual.test.mjs`, med nøkkel/modus fjernet og eksisterende OS-nettsperre. Kun isolerte syntetiske filesystem-/transport-/loopback-prøver, aldri leverandørkall.
