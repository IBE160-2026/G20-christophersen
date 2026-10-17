# Deferred work

## Deferred from: code review of spec-1-3-registrere-og-bevare-finansverdier-for-ett-objekt (2026-10-17)

- B8 (low, miljø-/bevisavgrensning): Gjenta isolert `npm ci` for gjeldende lockfil og relevante kontroller når npm-nett/SSL fungerer. Offline cache manglet Zod; to nett-forsøk ga `ERR_SSL_CIPHER_OPERATION_FAILED`. Ingen endring av TLS-/installasjonspolicy eller pins er autorisert/utført. Eksisterende installasjons 9 Vitest og 19+2 E2E består; ren installasjon er ikke påstått. Se story-1-3-review.md og råkontroller. Dette er ingen ny produkt-/readiness-port.
