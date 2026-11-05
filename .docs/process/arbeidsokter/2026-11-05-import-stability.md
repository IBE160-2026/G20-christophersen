# Import og stabilitet – rotårsaksbevis

Dato: 2026-11-05. Baseline: `e0ad095c5a9410886ee94e3897cae3552284a7f0`.
Ansvar: subagent dokumentimport/stabilitet. Ingen kode ble endret før A/B-prøven nedenfor var fullført. Private originaler, råsvar og skjermbilder holdes i ignorert `private/stabilization-2026-11-05/`.

## Faktisk reproduksjon før endring

Eksisterende server PID 17753 hadde forelder 1, arbeidsmappe prosjektroten og kjørte pinned Node 24.21.0 med `node src/backend/server.ts`. Den lyttet på 127.0.0.1:3000 og hadde kjørt omtrent 2 timer og 46 minutter. Den var dermed startet før dagens kontraktsendringer. En sandbox-curl meldte først connection refused; reell, autorisert loopbackkontroll uten sandbox bekreftet HTTP 200. Det første svaret var nettisolasjon i verktøyet og ikke bevis på stoppet applikasjon.

Playwright lastet faktisk `http://localhost:3000`, valgte Nøstegaten-originalen via filkontrollen og lot ekte backend behandle den. Ingen API-svar ble stubbet, og ingen betalte ruter ble kalt. Resultat før endring:

- HTTP **500**, `{kind:"rejected",code:"processing-failure"}`.
- Varighet til ferdig synlig bevis **23 454 ms**.
- Synlig tekst var nøyaktig «Dokumentimporten kunne ikke fullføres. Velg en tekstbasert PDF og kontroller det nye grunnlaget.»
- Ingen JavaScript-sidefeil; etter feilen ble hverken leieanalyse eller økonomistatus startet.

Deretter ble bare den identifiserte gamle serveren stoppet med SIGTERM og startet på nytt med samme umodifiserte baseline, samme pinned Node 24.21.0, demo, tom AI-nøkkel og FINN av. Identisk ekte Playwright-opplasting ga:

- HTTP **200**, **152 sider**, ingen importfeil.
- Varighet til ferdig synlig bevis **22 971 ms**.
- Automatisk økonomistatus og leieanalyse startet, uten JavaScript-sidefeil.

## Dokumentert årsak

HTTP-hovedprosessen holder importens Zod-kontrakt og versjonskonstanter i Node-modulcachen. Hver opplasting forker derimot en ny `import-child.ts` fra de nåværende filene. Den gamle hovedprosessen beholdt derfor eldre kontekst mens barnet brukte dagens kode. Kontraktene ble endret fra `bounded-pdf-text-2` / `local-plan-1` til `bounded-pdf-text-3` / `local-plan-2` etter serveroppstart. Forelderen avviste det ferdige, nyere resultatet med den generelle `processing-failure`-grenen. Tidsbruken tilsvarer full PDF-/OCR-behandling, ikke en 20-sekunders HTTP-frist.

A/B-prøven beviser at restart alene retter denne observerte feilen. Den er ikke en påstand om at alle importfeil skyldes gamle prosesser. Node 26.8.1 er default i shell og avviker fra prosjektets pin; den gamle serveren brukte faktisk Node 24.21.0 og Node26 forklarer derfor ikke denne hendelsen. PDF-/OCR-minne er undersøkt i tidligere kildebundne målinger; her ville minnevakten gitt `memory-limit` og tidsvakten `processing-timeout`, mens den faktiske koden var `processing-failure`. Den samme PDF-en og lokale OCR-binæren fullførte umodifisert etter restart.

## Andre konkrete hinder funnet

Gratis import brukte en permanent markør per session/hash/rolle uten requestId. Etter at adapteren fikk tillatelse, sperret samme PDF nye faktiske opplastinger i resten av serverøkten, også etter lokal feil. Det er hensiktsmessig å sperre betalte gjentakelser, men denne ruten gjør bare lokal, gratis dokumentbehandling. Eksisterende integrasjonstest krevde faktisk at andre opplasting skulle gi `duplicate-analysis`. Frontend kunne dessuten gjenbruke samme-hash-resultatet uten ny HTTP-opplasting. Dermed var tidligere grønne tester utilstrekkelige for brukerens krav om reelle gjentakelser.

## Rettelser og etterkontroll

Gjennomført etter rotårsaksbeviset:

- `import-runtime.ts` fingerprinter kun repository-eid backend-/kontrakt-/domenekode, aldri privat dokumentområde eller miljøfiler. Hovedprosessen bevarer oppstartsversjonen og avviser endrede kildefiler før et parserbarn startes. Barnet kontrollerer samme revision før det leser PDF-en. Feilen heter `server-outdated` og frontend forklarer behovet for omstart etter kodeoppdatering. Git HEAD alene er ikke brukt som signal: også ikke-committede kildeendringer oppdages.
- Markøren for gratis lokal dokumentimport frigjøres først etter bekreftet prosess-`close`, også ved timeout/feil. Den globale prosesslåsen og eksisterende minne-/tids-/tekstgrenser består. Betalte økonomi-/analysebudsjetter og deres permanente sperrer er urørt.
- Appens HTML på `/` får `Cache-Control: no-store`, slik at ny sideåpning henter gjeldende byggeindeks.
- Frontendagenten retter samtidig ekte samme-fil-opplasting og nullstiller den gamle eiendommens tilstand. Det er separat fra backendens marker-retting.

Målrettede regresjoner: **44/44 bestått**, fem testfiler, 17,55 s. Det omfatter faktisk HTTP-gjentakelse med ny requestId/samme hash, vellykket nytt forsøk etter barn-timeout, ekte child-avvisning av gammel runtime før parserarbeid, kildebytes endret uten ny commit, strømgrenser, workerheap og cleanup. `npm run typecheck`, `npm run lint` og `git diff --check` bestod. Første kjøring avdekket at fem eksisterende direkte-child-tester ikke sendte den nye handshaken; de er oppdatert uten å endre forventede strømgrenseutfall, og en negativ handshakeprøve er lagt til.

Etterfølgende måling med den faktiske `runImport`-kjeden og uendrede ressursgrenser:

| Ekte original | Tid | Node RSS topp | Separat OCR RSS topp | Sideposter / teksttegn | OCR fullført | Ressursavbrutte tekstsider |
| --- | ---: | ---: | ---: | --- | --- | --- |
| Nøstegaten | 25,334 s | 360,25 MiB | 299,23 MiB | 152 / 153 005 | 16/16 | Ingen |
| Rostockgata | 19,248 s | 366,33 MiB | 305,14 MiB | 170 / 293 168 | 19/19 | Ingen |

Måleforbehold: hovedagentens fulle regresjonspakke overlappet deler av denne proben. Tallene dokumenterer fullføring og observerte topper under denne lasten, ikke isolert responstid eller absolutt maksimalminne. Samplet samtidig Node+OCR-RSS var henholdsvis 561,19 og 546,95 MiB; 512 MiB-vakten gjelder importbarnets Node-prosess, ikke summen av hele prosesstreet. Begge tekniske utfall forblir blocked/incomplete. Nøstegaten har 34 readable/115 unknown/3 unreadable sider; Rostockgata 118/50/2. Hele tekstgrunnlaget beholdes. Native OCR har eget eksisterende 512 MiB-vern og overvåker foreldretap; en drept importprosess etterlater derfor ikke en ubegrenset OCR-jobb.

Den kontrollerte A/B-testserveren PID 66525 ble stoppet med SIGTERM etter testen, slik at hovedagentens obligatoriske sluttmatrise eier localhost:3000. Ingen andre prosesser er stoppet. Ingen betalte AI-kall eller push er gjort. Godkjenningen avgjøres av hovedagentens seks faktiske nettleseropplastinger, kontrollerte feil/gjenoppretting og uavhengig QA; denne A/B-prøven og målrettede regresjonen alene gir ikke grønt lys.
