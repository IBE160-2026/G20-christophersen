# Story 2.4 — verifikasjon 2026-10-20

Oppfølging: Story 2.4 er **done** etter separat bestilt
[full code review](story-2-4-review.md). Leveransen til review og resultatene
nedenfor beskriver implementeringsøkten; reviewrapporten fører sluttstatus.

Implementert innen [Story 2.4 AC1–AC4](../planning-artifacts/epics.md#story-24-hente-lagret-demo-uttrekk-bundet-til-riktig-rapport-og-versjon),
AD-1/AD-4/AD-6/AD-10, SPEC CAP-2/CAP-8 og eksisterende kontrakter 2/1.
Baseline er `fa91c3fbb027be992194f7deb022de60a50acba6` (Story 2.3 done).
[Implementeringsspec](spec-2-4-hente-lagret-demo-uttrekk-bundet-til-riktig-rapport-og-versjon.md)
og [arbeidsøkt](../process/arbeidsokter/2026-10-20-story-2-4.md) bevarer spor.

## Implementasjon og rapportbinding

`src/backend/analysis/adapter.ts` definerer felles `DocumentBasis` →
`Promise<AdapterOutcome>`. `analyze-document.ts` kontrollerer dokumentstatus
før I/O og modussamsvar før adapterbruk. Adapteren får hele grunnlaget i en
separat kopi; kodekonteksten beholdes til felles `bindAnalysisOutcome`.

Standard demo leser fire eksplisitte, lokale JSON-svar under
`src/backend/analysis/data/`. Filen velges bare etter SHA-256 beregnet fra
originalbytes i `validatePdf` og kontrollert igjen i `extractPdf`.
Konvoluttens hash må matche, og både konvolutt og svar må ha dokumentets
kontrakt-/uttrekksversjon. Uttrekket valideres med `AdapterOutcomeSchema` og
bindes/valideres til `AnalysisOutcome` av eksisterende kontraktfunksjon.
Ingen requestId fra tidligere kjøring lagres. Visningsnavn er ingen filsti
eller oppslagsidentitet. Ingen runtime-avhengighet til testfasiten.

Manglende fil, hashavvik, versjonsavvik, ugyldig JSON/struktur og lesefeil gir
hver sin trygge, eksplisitte analysefeil gjennom eksisterende feilkoder.
Ingen KI-klient, nøkkelinnlesing, nettverk, live-fallback eller retry brukes.

De lagrede svarene er kontrollerte og fiktive, ikke en gjennomført live-kjøring.
Originale kilder/usikkerheter bevares. Omdøpte identiske bytes finner samme
uttrekk; avvik i originalt kildenavn blir synlig `document-mismatch` etter
allerede eksisterende kildeklassifisering. F2 under F1-navn får derfor F2s eget
hashbundne uttrekk med navneusikkerhet, aldri F1s uttrekk. En ukjent eller
endret PDF under F1-navn gir eksplisitt manglende demosvar.

## AC- og matrisedekning

| Krav/scenario | Test og observert utfall |
|---|---|
| AC1, F1–F4 happy path | Ekte bytes → formatvalidering → ekstraksjon → standard demo → felles kontrakt. Alle funn/tekster/grader/hash/fysiske sider stemmer med uendret, uavhengig `expected.json` og tekst på faktisk side. |
| AC1, reproduserbarhet | Gjentatte kall er dypt identiske; mutert retur påvirker ikke neste resultat. Én delt adapter prøves også med fire samtidige, interleavede F1/F4-kall og ulike requestId: funn/hash/korrelasjon holdes adskilt, og returene deler ikke muterbart uttrekksinnhold. |
| AC2, feil dokument/hash | F2 under F1-navn gir aldri F1-funn. Endret F1 og ukjent 30-sidersrapport under F1-navn gir eksplisitt manglende lagring. Feil hash i konvolutt gir metadata-mismatch. |
| AC2, feil versjon | Både kontrakt-/uttrekksversjon i konvolutt og inne i svar prøves separat og gir incompatible-version. |
| AC2, manglende/ugyldig lagring | Manglende fil/loaderretur, lesefeil, ugyldig JSON/konvolutt/terminalutfall, manglende findings og ugyldig confidence gir trygge feil. Rå feil/filstier lekker ikke. |
| AC3, ingen nett/nøkkel | Separat Node-prosess med tomt miljø og sperret fetch/Socket.connect fullfører ekte F4-pipeline med null nettforsøk fra hovedprosessen. OS-sperren dekker også workers; alle 49 målrettede tester består med denne sperren. |
| AC4, tomliste/usikkerhet/feil | Eksplisitt completed tomliste bevares. Uklar grad/kilde/side og rapportert usikkerhet bevarer original. Lagret failed med og uten delresultat forblir failed. Ingen finans-/anbefalingsfelter inngår i kontrakten. |
| Kilde-/sideintegritet | F4 TG3 peker til fysisk side 4, ikke trykt side 2. Ugyldige sider 0/4 utenfor 3-sidersgrunnlag/1,5/streng/null beholdes som usikre originaler. Funn på bevist blank side gir invalid-response; feil kildehash blir aldri kontrollerbart funn. |
| Dokumentsperre | Unreadable/unknown/incomplete med treffende lagring og bare blanke sider stopper før loaderkall. Ekte mixed-status-/uncertain-content-/blank-variants-PDF-er bevarer eksisterende dokumentfeil og alle berørte sider. |
| Adaptergrense | Hele grunnlaget med alle sider sendes i ett kall; adaptermutasjon endrer ikke bindekontekst. Feil modus stopper før kall; ukjent adapterunntak gir trygg feil uten nytt forsøk. |

Matrisens «annen PDF under kjent filnavn» ved manglende/feilbundet svar er
dekket med ukjent 30-sidersrapport og endret F1. En annen støttet demorapport
med eget korrekt svar skal fortsatt slå opp sitt eget hashbundne svar;
F2-under-F1-testen kontrollerer dette ekstra uten å endre kildekontrakten.

## Faktisk kjørte kontroller

Node 24.21.0 / npm 11.19.0, eksisterende prosjektavhengigheter og lokal
Playwright-browserinstallasjon. Kjørt fra reporoten 2026-10-20.

| Kommando/kontroll | Resultat |
|---|---|
| `npm test -- tests/unit/demo-analysis.test.ts tests/integration/demo-analysis.test.ts` | 49/49 bestått (35 unit + 14 integrasjon), også kjørt samlet under OS-sperren nedenfor. |
| `npm test -- tests/integration/demo-analysis.test.ts` etter målrettede review-rettinger | 14/14 bestått, inklusive delt adapterinstans. Testhelperens subprocess har nå en testlokal `execFileSync`-timeout på 15 sekunder; ingen produksjonstimeout er innført. |
| Alle 49 tester under macOS `sandbox-exec`, `(deny network*)`, miljø renset med `env -i` | 49/49 bestått. Kontrollprobe til lokal TCP-port gir EPERM; sperren er faktisk aktiv. |
| `npm test` | 436/436 bestått, 11 testfiler, ingen hoppet over. |
| `npm run typecheck` | Bestått. |
| `npm run lint` | Bestått uten advarsler. |
| `npm run build` | Bestått. |
| `npm run test:e2e` | Build + 41/41 bygget-app-tester + 2/2 dev-tester bestått. |
| Originalkontroll | Pypdf kontrollerte alle F1–F4-sider; F4-side 4 ble også rendret med PyMuPDF og inspisert visuelt. TG3/tekst/trykt 2 og fysisk 4 stemmer. |
| Diff-/grensekontroll | Autoritative plan-/SPEC-kilder, tidligere contracts/dokumentpipeline, fixturebytes/fasit og server/frontend er uendret fra baseline. |

Ordinær sandbox tillot ikke nestet macOS-sandbox eller lokal E2E-server.
Disse to kjøringene ble utført med verktøyets godkjente eskalering. Den
nettverkssperrede kjøringen tillater ingen nettverk, inkludert loopback;
E2E-kjøringen trenger separat lokal loopback-server.

Eksakte kommandoer for den faktisk kjørte OS-kontrollen, fra reporoten:

```sh
/usr/bin/sandbox-exec -p '(version 1)(allow default)(deny network*)' /private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin/node --input-type=module -e 'import net from "node:net"; const s=net.connect({host:"127.0.0.1",port:43210}); s.on("error", e=>{console.log("network probe:",e.code); if(e.code!=="EPERM")process.exitCode=1})'

/usr/bin/env -i PATH=/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:/usr/bin:/bin NO_COLOR=1 /usr/bin/sandbox-exec -p '(version 1)(allow default)(deny network*)' /private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin/node node_modules/vitest/vitest.mjs run tests/unit/demo-analysis.test.ts tests/integration/demo-analysis.test.ts
```

Profilen var `(version 1)(allow default)(deny network*)`. TCP-proben ga
`network probe: EPERM` og exit 0. Den påfølgende Vitest-kjøringen med
`env -i` ga først 48/48 og ved sluttkontroll 49/49 bestått, inklusive
testen av delt adapterinstans. På et annet miljø må den midlertidige
Node-stien erstattes med tilsvarende installasjon av låst Node 24.21.0.
Helperens JavaScript-teller dekker bare hovedprosessens `fetch` og
`Socket.connect`; den arves ikke av PDF-workers. OS-profilens nettverkssperre
gjelder hele prosessforløpet, også workers. Dette er den separate kontrollen
som dekker deres nettverkstilgang.

Under testutvikling ble fasitprojeksjonen rettet til kun rapportfeltene
(TG3-avklaringsstatus er senere brukerarbeid), og forventet usikkerhetsliste
rettet etter eksisterende kildekontrakt. Tomt subprocess-miljø måtte håndtere
macOS sin innskutte kodingsvariabel. Eval-basert oppstart arvet CLI-flagg inn
i PDF-workers og ble erstattet av en filbasert testhelper. Ingen produksjons-
kontrakt, PDF, kildefasit eller lesbarhetsregel ble endret for å få testene grønne.

## Leveransegrense og status

Story 2.4 leveres til review, ikke done. Dette er modul-/regresjonsbevis for
lagret demo; ingen fullført rapportreise i UI, faktisk KI-treff/S2, live-S5
eller annen-person-S6 er påstått. Ingen HTTP, timeout, duplikatsperre,
uploadgrense eller livekode er implementert. Ingen nye produkt-/arkitektur-
beslutninger eller åpne spørsmål ble funnet. Epic 2/SP2 pågår, Story 2.3 er
fortsatt done, Story 2.5 forblir backlog. R2 closed; R3/R1/R4 og readiness
CONCERNS er uendret. Lokal commit uten push.

Intern BMAD build-kontroll og alle triageutfall er lagret i
[build-kontrollen](story-2-4-build-check.md). Test-/dokumentasjonsrettingene
er fullført. Ingen produksjonsendring eller uløst produktfunn gjenstår.
[Kommandologgen](story-2-4-kontroller.txt) inneholder siste fullsuite,
OS-sperrede målrettede kjøring og E2E-regresjon.
