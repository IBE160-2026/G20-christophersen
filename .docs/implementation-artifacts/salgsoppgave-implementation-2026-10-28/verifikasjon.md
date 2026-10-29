# PAA-SO1 — faktisk offline-implementering og verifikasjon

Arbeidsplan: [godkjent, frosset build-spec](../spec-salgsoppgave-offline-build.md).
Normative krav: [SO-AC1–15](../spec-salgsoppgave-input.md).
Godkjenningen av D1–D3 er registrert i build-specen og aktiv promptlogg;
avventende formuleringer i tidligere Correct Course/spec er historikk.
**Sluttstatus 2026-10-29: offline implementert, reviewet og verifisert.**
Statusavsnittene fra utvikleroverleveringen nedenfor er prosesshistorikk.
Hovedagentens sluttakseptanse gjelder de 15 AC innen godkjent offline-scope.
Lukking av PAA-SO1 føres i sentral oversikt etter lokal løsningscommit.
Ingen commit/push er utført av utvikleragenten.

## Leveransen

Ny `/api/document-import` og envelope `document-import-1` har egen 200-sidersprofil.
Legacy kontrakt 2/1, `/api/analysis` og standard PDF-profil forblir 30 sider.
Alle fysiske sidestatuser, originalhash, vedleggsmetadata og eksakte tekstbelegg
bevares. Ny envelope skiller tekstlagets lesbarhet fra `rasterUnprocessed`:
en liten rasterlogo kan sameksistere med brukbart økonomitekstlag, mens raster
inne i rapportområdet sperrer komplett teknisk dekning uten OCR.

Økonomi bruker kildeuavhengig faktorering av FINN-reglene og eksisterende
finansieringsmotor. P-forslaget er dokumentets prisantydning + eksplisitt
fellesgjeld, aldri avtalt pris. Inkludert dokumentavgift summeres ikke på nytt.
60 000 er kjent driftssubtotal; full D krever kontrollert komplett innhold.
L/avkastningskrav kreves fra brukeren. Finansieringsbasert J er forutsetning.
Importen bekrefter ingen felt, og manuelle rettinger er beskyttet.

Rapportområdet/tilhørigheten har egen uoverstyrbar gate i felles funnkontroll
og screening. Samme takforhold får flere belegg, mens to ulike bad bevares.
Nytt objekt tømmer hele vurderingen; separat rapport bevarer økonomi og
nullstiller teknisk kontroll/TG3. Gamle og nye dokumenthendelser er
kontekst-/generasjonsbundet. Ingen ny finans-, terskel- eller screeningregel.

## Ressurs- og live-grense

50 MiB per fil og samlet beholdt frontendgrunnlag, 1 MiB mottaksmetadata,
én aktiv PDF-prosess i faktisk appserver (delt gammel/ny inngang), hard lokal
60 s-frist, 128 KiB/side og 1 MiB samlet UTF-8, samt 8 MiB svar. Parserbarn og
worker har hver 256 MiB V8-grense. Forelderen måler prosess-RSS med `/bin/ps`
og stopper ved >512 MiB, også ved blokkert child-eventloop. RSS er best effort,
ikke en hard OS-grense mot korte native allokeringstopper. Barnet termineres
og faktisk close avventes før låsfrislipp på suksess, feil, abort og timeout.
Backend spoler ikke til disk og beholder ingen dokument-/tekstcache.

Kombinert strict request inkluderer økonomi, eiendomsidentitet, rapportområder
og de samme TG-reglene som legacy. Inputdigest er kanonisk og binder det
valgte grunnlaget til prompt/schema/modell/metadata. `bounded-200.pdf` velger
bare [1,2,5,6,7,8,9,10,11,12], og beholder alle 200 lokale sidestatuser.

Ren lokal preflight har maksimum 100000 inputtokens for hele endelige requesten
inkl. prompt/schema/metadata/framing og 16000 samlet output inkl. reasoning.
Manglende/ukjent/upålitelig teller eller modell, overskridelse og ukomplett
svar avvises eksplisitt. Testtellere er injiserte syntetiske tellere og beviser
**ikke** en faktisk modelltilpasset tokenizer. Ingen produksjonsteller er
installert/godkjent. Ny live-rute er stengt uansett `ANALYSIS_MODE`; ingen
klient, nettbasert telling, retry, modellbytte eller betalt kall er utført.

## Verifikasjonsstatus og råbevis

Pinned Node 24.21.0 / npm 11.19.0, tom `OPENAI_API_KEY`, offline adaptersvar,
Chromium i `/private/tmp/ibe160-story-3-5-browsers`. HTTP-/RSS-/nettlesertester
fikk sandboxeskalering for lokal loopback/prosessmåling; ingen ekstern tjeneste.

- [Full regresjon](full-tests.txt): **48 filer / 1274 tester bestått**, før siste
  token-/rasterlogo-/FINN-tverrflytrettelser. Dette er bevis for den prøvde
  mellomversjonen, ikke en påstand om full ny kjøring på siste diff.
- [Siste målrettede tester](final-targeted-tests.txt): **5 filer / 98 tester bestått**
  etter alle siste produktrettelser. Dekker importkontrakt/PDF, økonomi,
  token-/svargrenser, session/FINN-regresjon og faktisk HTTP/lifecycle/RSS.
- [Build](build.txt): **bestått** på siste produktkode. Vite gir fortsatt kjent
  stor-chunk-varsel. [Lint](lint.txt): **bestått** på siste produktkode.
- [Ny hovedflyt før siste tverrflyt/rasterrettelser](prospectus-e2e.txt): **9/9 bestått**,
  inklusive faktisk automatisk P/D/J-kontroll/finansiering og alle tre anbefalinger.
- [Siste avgrensede E2E](final-e2e.txt): **48/48 bestått** etter siste
  produktrettelser. Ny import, FINN-alternativ og finansfelt/fokus inngår.
- Full Playwright-suite på siste diff og ny full `npm test` etter siste rettelser
  er **ikke ferdigkjørt** av implementeringsagenten. Hovedagenten overtar relevant
  sluttreview og eventuelle gjenværende regresjonskjøringer. Ingen testfasit er
  endret for å følge implementasjonsfeil.

Tidligere feilutskrifter bevares som prosessbevis: samtidig serverkonkurranse
på port 3000, ressurskonkurranse før fire Vitest-workers og oppdaget/rettet
legacy-låsregresjon. En første full E2E-start ble avbrutt da build avdekket en
manglende async-markering i en ny test. Ingen delvis kjøring telles som bestått.

## SO-AC og matriselinjer

| Krav | Faktisk test / observerbart bevis |
|---|---|
| SO-AC1 | Ny E2E og faktisk HTTP starter ved filvalg uten finansinput; P vises ubekreftet. |
| SO-AC2 | `document-import.test.ts` prøver 30/31/50/100/150/200/201 i ny PDF-profil og legacy30/31. HTTP prøver separat31/200/201, samlet eksakt50MiB/+1 og overstor fil. Felles mottakers eksisterende eksakt50MiB/+1-regresjoner er bevart. |
| SO-AC3 | Foto, skannet rapport, raster + digital bunntekst og rasterlogo. Alle fysiske sider beholdes; økonomitekst kan brukes separat; ulest teknisk innhold sperrer. Legacy blank-/parserfeiltester deler ekstraksjonskjernen. |
| SO-AC4 | Integrert/manglende/vedlagt/flere rapporter. PDF-vedlegg har bare metadata; manuelt faktisk separat vedlegg går gjennom ny import. Uklart/ulest/tom liste kan ikke bekrefte bort dekning. |
| SO-AC5 | Eksakt hash/navn/fysisk side/quote/start/end valideres, fysisk10/trykt6 og separat3/trykt1 åpnes i faktisk original. TG-korrigering til side utenfor område eller med ulest raster avvises. |
| SO-AC6 | Ett tak, belegg fysisk10+2; to bad med samme beskrivelse har ulike forholdsidentiteter. Duplisert forhold i envelope avvises. |
| SO-AC7 | P3200000 og kontantbehov3075000 fra uavhengig fasit; konflikt og ukjent gjeld gir ikke komplett prisforslag. |
| SO-AC8 | Inkludert dokumentavgift75000 gir ingen ekstra påslag. Borettslag/manglende avgift og ukjent eierform gir ingen automatisk beregning/0. |
| SO-AC9 | 12×(5000−1000)+6000+6000=60000, fellesgjeld12000. Full D er ukjent uten kontroll. Ukjent periode/år/inkludering/gjeldsdel sperrer forslag. |
| SO-AC10 | Blank/motstrid/oppgitt estimat og originalbelegg bevares. Ingen automatisk leie-, drifts- eller avgiftstolkning. |
| SO-AC11 | Ny E2E kontrollerer importfelt, komplett innhold, slider, rente, måneder og år; P3200000/D60000/J135000.00 fylles uten manuell overføring og forblir ubekreftet. Manuelle rettinger testes separat. |
| SO-AC12 | Samme hash/nytt navn gjenbruker; ny hash tømmer; sen retur avvises. Separat rapport bevarer økonomi og nullstiller TG3. Ukjent identitet krever kontroll, kjent konflikt sperrer. FINN-bytte tømmer aktiv import; legacy-hendelser kan ikke flytte gates. |
| SO-AC13 | UTF-8 per-side/samlet, lokale token-/output-/svargrenser, frist, abort, blokkert child, RSS og faktisk close før låsfrislipp. Ingen rå dokument-/parser-/leverandørlogging. |
| SO-AC14 | Hash-/versjonsbundet syntetisk demo uten nøkkel/nett/fallback; faktisk UI gir alle tre anbefalinger. Ny live avvises uavhengig av gammel modus. |
| SO-AC15 | Eksisterende finans/TG3/listescreening gir håndskrevet anbefalingsfasit. Historisk S5/S6 og gamle finansfasiter er uendret. |

Testfiler: `tests/unit/{document-import,combined-import-budget,import-session,listing-session}.test.ts`,
`tests/integration/document-import.test.ts`, `tests/e2e/prospectus-import.spec.ts` og
berørte eksisterende FINN-/finans-/rapportregresjoner. Matrisens dokument, dekning,
kilde/funn, økonomi, økt, ressurs og fullflyt-rader er dekket av disse testgruppene.
Manglende sluttkjøring/review må fortsatt avklares før endelig AC-akseptanse.

## Originaler, visuell kontroll og prosess

De opprinnelige 13 originalhashene er
[verifisert uendret](original-fixture-integrity.json). `expected.json` og
`sha256.json` er ikke omskrevet. Sju nye syntetiske originaler bruker egen
håndskrevet `extended-expected.json`, generator og `extended-sha256.json`.
Hovedagenten har uavhengig rendret relevante sider og kontrollert lesbarhet,
sidegrenser, rastertekst og fravær av klipping/overlapp:
[sideantall/hash-kontroll](independent-pdf-check.json),
[rapportstart](paa-bounded-200.pdf-5.png), [rapportslutt](paa-bounded-200.pdf-12.png),
[raster med digital bunntekst](paa-raster-footer-12.pdf-10.png),
[rasterlogo med lesbar økonomi](paa-logo-economy-12.pdf-1.png).

UI-bilder: [hovedinngang](salgsoppgave-hovedinngang.png),
[importert 200-sidersgrunnlag](salgsoppgave-bounded200.png),
[automatisk dokumentøkonomi og finansiering til resultat](dokument-finansiering-resultat.png).
Disse kurateres på nytt fra siste E2E når den er ferdig.
[Arbeidsøkt og presiseringer](../../process/arbeidsokter/2026-10-28-salgsoppgave-offline-build.md).
Sentral status og senere lukking eies av [PAA-SO1](../deferred-work.md), ikke dette
bevisdokumentet. Reell live-kvalitet/tokenizer/kostnadsautorisasjon og nytt
relevant S6-leveringsgrunnlag er fortsatt senere bestillinger.

## Hovedagentens sluttkontroll 2026-10-29

Uavhengig BMAD-review kjører med tre separate linser. [Bevaringskontrollen](preservation.json)
viser 73 låste finans-/screening- og historiske S5/S6-filer byteidentiske med
baseline, samt uendret opprinnelig prefix i deferred-work og aktiv promptlogg.
Det er ikke utført betalte API-kall eller push.

## Etter reviewrettelser

- [Målrettede reviewtester](review-fixes-targeted.txt): **136 tester i 5 filer bestått**.
- [Full sluttregresjon](final-full-tests.txt): **1314 tester i 50 filer bestått** etter produktrettelsene.
- [Build/typekontroll etter testprosjekt-retting](final-build-after-test-project-fix.txt): **bestått**.
  [Første buildforsøk](final-build.txt) avdekket en UI-test i backendens prosjekt uten JSX;
  den er nå `.test.tsx` i eksisterende frontend-testprosjekt. Backend får ikke DOM/JSX-globaler.
- [Uavhengig review og triage](review.md), [tre fokuserte nykontroller](review-recheck.json): **ingen restfunn**.
- Sju nye PDF-er er [uavhengig hash-/sidekontrollert](independent-pdf-check.json).
  [Inline-raster med gyldig footer](paa-inline-raster-footer-12.pdf-10.png) og
  [konflikt på fysisk5](paa-integrated-identity-conflict-12.pdf-5.png) er visuelt kontrollert.

Samlet nettleserregresjon og siste testoppsett-/komponentkontroll pågår; terminale
resultater føres før endelig akseptanse og commit.

## Endelig akseptanse 2026-10-29

SO-AC1–15 og alle sju matriselinjer er verifisert for den godkjente **offline**
leveransen. Produksjonsekstraksjon fra vilkårlige kundedokumenter eller modellens
reelle kvalitet er ikke verifisert eller aktivert; ukjent original gir eksplisitt
utilgjengelig demo. Ingen nye vesentlige produktvalg gjenstår i denne leveransen.

| Sluttkontroll | Resultat / råbevis |
| --- | --- |
| Full unit/integrasjon etter produktrettelser | [1314/1314, 50 filer](final-full-tests.txt) |
| UI-test etter korrigert JSX-prosjekt/filtype | [5/5](final-ui-unit-project.txt); samme testinnhold, ingen test fjernet |
| Full nettleserrunde | [215/217 bestått](final-all-e2e.txt); to RT-12-tester forventet åpen hash |
| RT-12 etter eksplisitt åpning av identitetsdetaljer | [2/2 bestått](final-rt12-recheck.txt), med uendrede hash-/original-/tastaturasserts. Samlet er alle 217 tilfeller verifisert; den fulle runden alene var ikke grønn. Ingen produktkode ble endret for denne testtilpasningen. |
| Utviklingsstart / privat ressursgrense | [3/3 bestått](final-dev-e2e.txt) |
| Berørt screeningkomponent | [13/13 bestått](final-components.txt) |
| Endelig build/typekontroll | [Bestått](final-build-complete.txt); kjent Vite-chunk-varsel |
| Endelig lint | [Bestått](final-lint-complete.txt) |
| Uavhengig review | [Alle tre fokuserte rechecks uten restfunn](review-recheck.json) |
| Historikk/finans/originaler | [Bevaringskontroll](preservation.json), [opprinnelige 13 fixturer](original-fixture-integrity.json), [sju nye originaler](independent-pdf-check.json) |

De endelige UI-bildene ovenfor er tatt fra siste fulle nettleserrunde og visuelt
kontrollert. Lokal commit og sentral lukking føres etter siste stagingkontroll.
