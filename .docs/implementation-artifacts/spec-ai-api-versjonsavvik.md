---
title: 'AI-knappen mot riktig backend'
type: 'bugfix'
created: '2026-10-31'
status: 'done'
route: 'oneshot'
baseline_commit: '210dfc8671da05b23bc6901e244c2ee3b6b08b12'
---

<frozen-after-approval reason="Brukerens konkrete feilrettingsoppdrag uten ny planrunde">

## Intent

Rett årsaken til at AI-knappen får tekstlig 404 fra en gammel backend. Kontroller faktisk URL, status og respons, start riktig lokal server, lever JSON ved API-feil og håndter feilformat trygt. Verifiser med den ekte 135-siders PDF-en fra knapp til separate samtykker. Ingen betalte kall og ingen push.

</frozen-after-approval>

## Implementation Notes

Bekreftet POST /api/document-economy/prepare på port 3000: HTTP 404, text/plain, «API-ruten er ikke tilgjengelig.». PID 9623 startet 2026-10-30 23:04:38 i dette repoet, før ny rute. Nåværende kildekode registrerer ruten korrekt. Begrenset retting: korrekt kjørende prosess, JSON-fallback og API-feil, trygg responslesing for begge AI-kall, regresjonstester og Playwright. Finans, kildekontroll, reservasjon og samtykkeprotokoll bevares.


## Review Triage Log

- Medium, rettet: /run404 beholdt engangssperren. Manglende rute nullstiller plan og begge samtykker, varig kostnadsjournal bevares; Playwright tester ny gratis forberedelse.
- Medium, rettet: JSON-feilkodene manglet brukervennlige meldinger. Lesbare forklaringer lagt til; JSON500 testes i UI.
- Medium, rettet: eksisterende mapping gjorde 413 til 500. 413/JSON bevares og testes mot faktisk server.

## Verification

11/11 målrettede Vitest-tester, 9/9 Playwright-tester på faktisk port3000 med ekte135-siders PDF, bygg/typecheck og lint består. Betalt svar er stubbet og forespørselens samtykker kontrolleres. Se [arbeidsøkt](../process/arbeidsokter/2026-10-31-ai-knapp-api-feil.md) og [testbevis](ai-api-fix-2026-10-31/playwright.txt). Ingen betalte kall eller push. Serveren står igjen i demo uten API-nøkkel; faktisk betalt AI er ikke verifisert.
