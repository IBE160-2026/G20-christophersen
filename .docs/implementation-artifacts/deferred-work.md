# Deferred work

## Deferred from: code review of spec-1-3-registrere-og-bevare-finansverdier-for-ett-objekt (2026-10-17)

- B8 (low, miljø-/bevisavgrensning): Gjenta isolert `npm ci` for gjeldende lockfil og relevante kontroller når npm-nett/SSL fungerer. Offline cache manglet Zod; to nett-forsøk ga `ERR_SSL_CIPHER_OPERATION_FAILED`. Ingen endring av TLS-/installasjonspolicy eller pins er autorisert/utført. Eksisterende installasjons 9 Vitest og 19+2 E2E består; ren installasjon er ikke påstått. Se story-1-3-review.md og råkontroller. Dette er ingen ny produkt-/readiness-port.

### B8 lukket 2026-10-19

Ren `npm ci` fra commit `1c33279deff7e081af906d4140f210ff5d6b82f6`
bestod i isolert kopi uten `node_modules` og med ny npm-cache. Node 24.21.0,
npm 11.19.0 og uendret TLS-/installasjonspolicy ble brukt. 9 Vitest,
lint, typecheck/build, 19 demo-E2E og 2 dev-tester bestod fra denne
installasjonen. Package-/lockfil forble byteidentiske. Ingen tidligere
SSL-feil er reprodusert. Historikken ovenfor beholdes som datert testbevis.
Se [råutdata](story-1-3-ren-installasjon-2026-10-19.txt) og
[gjenopptaksøkten](../process/arbeidsokter/2026-10-19-story-1-4-orkestrering.md).

- source_spec: `spec-4-3-bruke-live-analysen-i-samme-kontroll-og-resultatflyt.md`
  summary: Bevare nyttig første feilårsak eller forklare duplikatsperren ved manuell Start etter terminal analysefeil.
  evidence: B3-review bekrefter baselineoppførsel i ReportAnalysis canStart (failed tillates) og analysis-route sin varige markør. Et nytt manuelt forsøk kan erstatte første feiltekst med duplicate-analysis. Ingen automatisk retry eller ny flyt innført i 4.3; forbedringen gjelder eksisterende felles demo/live-oppførsel.
