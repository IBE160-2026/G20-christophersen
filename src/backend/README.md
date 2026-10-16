# Backend og I/O

Denne grensen eier HTTP og senere dokumentbehandling og analyseadaptere etter
AD-1/AD-9. HTTP bruker dokument-/analysekomponenter og felles contracts.
Backend leverer dokument-/analyseutfall; finans og anbefaling eies av domain.

`server.ts` serverer bygget app fra `dist/` på `127.0.0.1:3000`. Utvikling
bruker Vite-middleware i samme Express-prosess. `/api` er reservert og svarer
404 inntil aktuelle ruter implementeres i sine stories. Dokument- og
KI-funksjonalitet kommer i sine godkjente stories.
