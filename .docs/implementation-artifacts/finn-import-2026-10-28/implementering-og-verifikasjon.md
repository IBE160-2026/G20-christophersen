# FINN-1 — implementering og første verifikasjon 2026-10-28

Implementeringsagenten har laget delte runtimekontrakter, FINN-URL-kontroll,
separat original/korrigert/brukte importgrunnlag, kontrollerte P/D/J-forslag,
Big.js-finansiering, injisert Responses-adapter, deaktivert HTTP-rute og frontend
for kontroll og manuell reserveflyt. PDF-livekonfigurasjonen er uendret.
Produksjonsserveren gir verken aktivering eller adapter til FINN-ruten.

Alle Node-kommandoer under sluttverifikasjonen brukte:

```sh
PATH=/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:$PATH
```

Typekontroll/lint/build: se [typecheck.txt](typecheck.txt), [lint.txt](lint.txt)
og [build.txt](build.txt). Build har den eksisterende størrelsesadvarselen om
JavaScript-bundle over 500 kB, men avslutter med kode 0.

Målrettede tester (sluttutskrift i [targeted-tests.txt](targeted-tests.txt)):

```sh
npm exec vitest run tests/unit/listing.test.ts tests/unit/financing.test.ts tests/unit/listing-session.test.ts tests/integration/listing-http.test.ts
```

Kommandoen ble kjørt med eskalert sandboxtilgang fordi vanlig sandbox avviste
lytting på 127.0.0.1 med EPERM. Ingen betalt eller ekstern transport ble brukt.
Alle adapter-/HTTP-kall er injiserte syntetiske responser. Testfasiten er skrevet
fra specen og er ingen påstand om innholdet i en faktisk FINN-annonse.

En første samlet `npm test` med samme Node24 og eskalert lokal lytting bestod:

```text
 Test Files  44 passed (44)
      Tests  1143 passed (1143)
   Start at  11:34:38
   Duration  87.17s (tests 95%, import 4%, transform 1%)
```

Dette løpet var før de siste tilleggene om brukt importbevis, strengere
requestbudsjett og fetch-retting. Root kjører endelig samlet regresjon/review.

De første `npm run test:components` / `npm run test:e2e` fant ikke Chromium1248 i
standardbrukerens cache. Feilen var `browserType.launch: Executable doesn't
exist ... chromium_headless_shell-1248/.../chrome-headless-shell`.
Ingen produktkonklusjon er trukket fra disse miljøfeilene. Eksisterende Chromium
ble deretter funnet i `/private/tmp/ibe160-story-3-5-browsers`.

Målrettet nettleserkjøring:

```sh
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-3-5-browsers npm exec playwright test tests/e2e/listing-import.spec.ts
```

Den første kjøringen med riktig nettleser ga 1 bestått / 1 feil: importen viste
manuell fallback uten HTTP-kall. Årsaken var at `fetch` lå som objektmetode på
ListingClient og fikk feil receiver i nettleseren. Kallet er rettet til en lokal
funksjonsreferanse før invokasjon. Neste kjøring bestod 2/2 (1,6 s), og endelig
utskrift etter siste bygg lagres i [listing-e2e.txt](listing-e2e.txt).

Ingen commit eller push er utført av implementeringsagenten. README, specsporing,
FINN-1-lukking og uavhengig review håndteres av hovedagenten. FINN-1 forblir åpen;
syntetiske tester dokumenterer ikke live-kildekvalitet eller tillatt tilgang.
