# Story 4.4 — rootens sluttkontroll, 2026-10-23

S2-evalueringen er gjennomført og uavhengig bekreftet: 4/4 TG2 og 1/1 TG3,
alle med korrekt fysisk PDF-side; ingen oversette eller oppdiktede funn.
Story klargjøres til **review med åpent AC6-avvik**, ikke done eller fullt
produktgodkjent. F1/F2 har «Innhent mer informasjon» fra generelle limitations;
F1s sluttkontroll/resultat er bare fullstendig dokumentert med separat replay.
Se [uavhengig evaluering](story-4-4-uavhengig-evaluering.md),
[live-verifikasjon](story-4-4-verifikasjon.md) og
[reviewtriage i spec](spec-4-4-gjennomfore-live-og-evaluere-s2.md#review-triage-log).
Preeksisterende produktavvik er sporet i [deferred-work](deferred-work.md).

## Live og budsjett

Brukeren kontrollerte manuelt USD 2 hard spend limit, USD 0 tidligere
prosjektforbruk og USD 5 prepaid. USD 2 er fortsatt operativ grense innen R1s
maksimale USD 20. Ett minimalt preflightkall og fire sekvensielle fixturekall:
3881 input + 831 output = 4712 tokens, totalt USD 0.016072 beregnet fra faktisk
leverandørusage og kontrollert Standard-pris. Ingen cache-/cache-write-/reasoning-
tokens. Gjenværende operativ ramme USD 1.983928. Ingen ukjent belastning.
Dette er tokenbasert kostnadsavstemming, ikke etterfølgende leverandørfaktura.
Faktiske headere: 5000 RPM, 1000000 TPM. Ingen billing-/rate-feil eller retry.
Ingen nye betalte forsøk etter F4; reviewpatcher kontrolleres bare offline.

## Full produktregresjon

Root kjørte hele følgende sekvens med exitkode 0, Node 24.21.0/npm 11.19.0,
Playwright-cache `/private/tmp/ibe160-story-3-5-browsers`. `OPENAI_API_KEY` og
`ANALYSIS_MODE` var fjernet; `sandbox-exec` med prosjektets
`story-5-3-nettprofil.sb` sperret eksternt nett og tillot bare lokal loopback.

| Kommando | Faktisk resultat |
|---|---|
| `npm run typecheck` | bestått |
| `npm run lint` | bestått |
| `npm run build` | bestått; eksisterende Vite chunkstørrelsesvarsel |
| `npm test -- --maxWorkers=1` | 38 filer, 1059/1059 bestått |
| `node --test tools/story-4-4/evaluate-s2.test.mjs` før reviewpatch | 3/3 metodeprøver bestått; etterpatchkontroll følger nedenfor |
| `node node_modules/@playwright/test/cli.js test --workers=2` | 189/189 bestått |
| `node node_modules/@playwright/test/cli.js test --config playwright.dev.config.ts --workers=1` | 3/3 bestått |
| `node node_modules/@playwright/test/cli.js test --config playwright.components.config.ts --workers=2` | 37/37 bestått |
| `node tests/helpers/verify-analysis-build.mjs` | build/demooppstart bestått, 204 frontendfiler kontrollert, 0 nøkkellekkasjer |

Arbeidsmiljøets rålogg: `/private/tmp/story44-live-final-regression.txt`.
Resultatene over er bevart slik at tempfilen ikke er en leveranseavhengighet.
Ingen automatisk retry, endret testfasit eller hoppede tester. Produktkode,
package-/lockfil og fixtures er uendret; reviewpatch berører bare isolerte
engangsverktøy, og målrettet ny verifikasjon dokumenteres separat.

Root har også lest originale F1-data og visuelt kontrollert F1/F4-kontaktark,
F2-resultatskjerm og F4s TG3-kildeskjerm. Den separate evaluatoren har kontrollert
alle fire dokumenter og alle fem originalfunn. Dette er agentkildekontroll og
automatiserte UI-handlinger, ingen tidsmålt menneskelig S5-kontroll.

Ingen Story 4.5, push eller endring av låste krav inngår.

## Etter reviewpatch

Rootens egne nye målrettede kontroller bestod med exitkode 0:
`node --test tools/story-4-4/evaluate-s2.test.mjs tools/story-4-4/run-safety.test.mjs`
ga **13/13** (5 metodeprøver og 8 sikkerhetsprøver), 0 hoppet over/feilet.
`oxlint --deny-warnings tools/story-4-4` og syntakskontroll av runner, transport
og sikkerhetshjelper bestod. Nøkkel/modus var fjernet, eksternt nett OS-sperret;
et første nestet sandbox-forsøk stoppet før teststart med exit 71, og den samme
OS-sperrede kontrollen bestod med nødvendig lokal utføringstillatelse.
Rålogg: `/private/tmp/story44-post-review-tests.txt`.

Prøvene viser nå avvist F3-replay før fetch/dispatch/låsendring, låseiervern,
avvist ugyldig token-/kostnadsregnskap, fanget bind-feil og komplett uavhengig
fasitdekning i S2-telleren. Ingen ny API-request. Tre opprinnelige metodeprøver
var grønne før review, men manglende rad kunne likevel falle ut; ny kontroll
avviser dette. Den uavhengige semantiske evalueringen omfattet hele fasiten.

Root har etterregnet hvert originalt svar og hver kvittering, sjekket at
reservasjonene passet under USD 2, at alle fem kostnader summerer til
USD 0.016072, at fire analyse-response-IDer er forskjellige og at fasit/hash
og post-review-hjelpermanifest stemmer. Produktkode/fixtures er uendret, og
miljønøkkelen finnes ikke i de kontrollerte nye verktøy-/bevisfilene.
Maskinlesbart resultat: [integritetskontroll](story-4-4/root-integrity-check.json).

Reviewrettingene lukker verktøyfunnene B3–B8/E1–E3, mens dokumentasjonsfunn
B2/B9/B10 er tydelig avgrenset/rettet uten å omskrive historiske bevis. Den
preeksisterende produktfeilen B1 og ufullstendig F1-originalflyt forblir åpne
akseptanseforbehold. Status er in-review i spec og review i sprintstatus;
4.5 er fortsatt backlog. Ingen done-påstand eller push.
