---
title: 'Synlig sluttstatus for godkjent AI-forsøk'
type: 'bugfix'
created: '2026-10-31'
status: 'done'
route: 'oneshot'
baseline_commit: '7b08ab27f4eec32650d03fa03eb3f4a04ccc2627'
---

<frozen-after-approval reason="Brukerens konkrete feilrettingsoppdrag uten ny planrunde">

## Intent

Undersøk først det opprinnelige forsøket, bevar ukjent belastning og sperren mot nye betalte kall. Rett manglende synlig status ved AI-knappen: analyserer, fullført eller feilet. Gjenopprett status ved lokal lesing av eksisterende kostnadsjournal etter reload. Test med Playwright og lokale leverandørstubber, ingen nye betalte kall og ingen push.

</frozen-after-approval>

## Implementation Notes

Kjørende backend PID 42681 beholdes mens forsøket undersøkes. Journalen for ny135-siders PDF har én USD 0,15-reservasjon, state uncertain, actualUsd null, sist endret2026-10-31 kl. 03:50:13. Ingen resultatcache, journalens lås er frigitt, ingen åpne klientsockets og ingen leverandørfeil i serverutdata. Backendforsøket er avsluttet; historiske data kan ikke bevise mottak eller fakturering hos OpenAI. Ingen reservasjon eller gammelt forsøk endres.

Status/feil står før lange utdrag i dagens UI, langt over startknappen når utdrag er åpnet. Ingen klientfrist eller statusgjenoppretting, og serveren kaster bort leverandørens feilkategori. Avgrenset retting: status ved handlingen med synlig fokus/scroll, frist uten retry, lokal statuslesing av varig journal, sikker teknisk logging uten innhold/nøkkel og failclosed dobbeltkallsvern. Finans, kildevalidering og samtykker bevares. Backendarbeidet er delegert etter build-workflowens instruks.


## Review Triage Log

- Medium, rettet: lokal statusavstemming manglet etter klientfrist. Ny leserunde etter kjøreforsøk, tidsbegrenset polling ved running og test for senere fullføring uten nytt betalt kall.
- Medium, rettet: pollfeil beholdt running. Ukjent tilstand avslutter busy og kan kontrolleres gratis manuelt.
- Medium, rettet: FIFO kunne blokkere før filtypekontroll. O_NONBLOCK og descriptorvalidering, subprocess-test med frist.
- Medium, rettet: historisk kostnadsgrunnlag ble utledet. API og UI bevarer eksplisitt null, øvre estimat og eksakt bruksberegning.
- Medium, rettet: status404 mistet omstartshjelp. Sikker feilkategori beholdes og testes.
- Medium, rettet: privat test antok skjult journal. Eksplisitt forventet hash og historikk kreves; ordinære journaltester er isolerte.
- Medium, rettet: testport var hardkodet. PAA_E2E_PORT styrer frontend, backend og oppstartskontroll, verifisert på3001.
- Medium, rettet i oppfølging: innledende statusfeil sperret også etter bekreftet idle uten betalt forsøk. Innsendt forsøk og tidligere betalingsbevis spores separat; gratis gjenoppretting testes og opphever aldri sperren etter et mulig betalt kall. Feil i kjørefasen beholdes selv ved idle-status.


## Verification

Bygg/typecheck, lint og diffkontroll består. Samlet Vitest: 80 filer, 1635/1635 tester. Etter siste UI-retting: 17/17 Playwright-tester består på isolert port 3001 med tom nøkkel og stubbet betalt transport; ekte PDF og faktisk gammel usikker journal inngår. [Tester](ai-status-2026-10-31/tests.txt), [Playwright](ai-status-2026-10-31/playwright.txt), [bygg](ai-status-2026-10-31/build.txt), [lint](ai-status-2026-10-31/lint.txt).

Rettet backend er startet på port 3000 med eksisterende .env; nøkkelens tilstedeværelse er kontrollert uten innholdslogging. Lokal GET for originalhash returnerer failed, economy-previous-uncertain, reservedUsd0.15, actualUsdnull og retryAllowedfalse. Journalens SHA256 er identisk før/etter omstart og tester. Ingen nye betalte kall eller push. Faktisk historisk leverandørmottak og betaling forblir uavklart og føres eksplisitt åpent i sentral deferred-work.
