# Story 5.4 — klargjort, ekstern S6 ikke gjennomført

Dato: 2026-10-27. **Formell story: backlog. R4-S6: open.**
Dette er forberedelse etter Mads' bestilling, ikke start/lukking av den
eksterne gjennomføringsporten. Ingen testperson eller rent eksternt miljø
er identifisert i denne økten. Utviklingsagentens tester erstatter ikke S6.

Autoritet: [låste AC1–AC5](../planning-artifacts/epics.md#story-54-la-en-annen-person-gjennomføre-readme-basert-ren-kjøring),
[verifikasjonskontrakt S6](../specs/spec-IBE160/verifikasjon-og-avklaringer.md),
[sprintstatus](sprint-status.yaml). Eier for faktisk gjennomføring: **Mads**.

## Klargjort for overlevering

- [Én kort instruks](story-5-4-ekstern-instruks.md) peker til README som eneste
  kjøreoppskrift. Ingen ekstra skjult caseoppskrift eller agentutfylt resultat.
- README har låste Node-/npm-versjoner, npm ci/build/demo/dev, lokale
  fiktive F1–F4-data, alle tre anbefalinger, feil/retur/korrigering og tester.
- UI-endringene er kontrollert mot eksisterende UX. Faktisk intern kontroll
  og bevisgrense står i [reviewrapporten](sluttforing-2026-10-27-review.md).
- Mads velger den **endelige lokale leveransecommiten etter denne runden**
  og gir en ren kopi av akkurat den til personen. Personen registrerer
  full `git rev-parse HEAD` hvis Git finnes, ellers versjonsidentifikasjon
  og hash/inventar fra Mads. Arbeidskopi med gamle node_modules/.env/dist
  er ikke et rent installasjonsforsøk.

## Bevismal — ingen observasjoner registrert

Fylles av den faktiske gjennomføringen; alle felt nedenfor er **ikke registrert**.

| Felt | Verdi ved faktisk forsøk |
| --- | --- |
| Annen person, dato og rolle | Ikke registrert |
| Full repo-/leveranserevisjon, ren kopi og eventuelle lokale endringer | Ikke registrert |
| OS/arkitektur, Node, npm og browser/versjon | Ikke registrert |
| Forutsetninger og installasjon/browserforberedelse, kommando og utfall | Ikke registrert |
| Hvordan eksternt nett ble sperret, loopback og tidspunkt | Ikke registrert |
| Faktisk demo fra README: F1/F2, opprinnelig F3-mangel og F4 Uavklart | Ikke registrert |
| Tall, rapport-/PDF-kilde, enkeltfunn, liste og separat TG3-kontroll | Ikke registrert |
| Feil input/rapport, korrigering, retur og finansendring uten ny analyse | Ikke registrert |
| Typecheck, lint, unit/integrasjon, komponent og E2E: eksakt kommando/exit/antall | Ikke registrert |
| Uklarheter, feil, eventuell hjelp, berørt AC/story og faktisk rekontroll | Ikke registrert |
| Personens bekreftelse av fullført/ufullført forsøk | Ikke registrert |

Bevar faktisk terminalutdata og relevante bilder uten hemmeligheter. Hvis
en feil krever retting, kobles den til den sentrale
[deferred-work-oversikten](deferred-work.md) med konkret krav, løsning og
nytt faktisk kjørebevis. Denne malen er ikke en parallell bugliste.

## Akseptansegate

| AC | Det som mangler før godkjenning |
| --- | --- |
| AC1 | Annen persons README-baserte installasjon/oppstart i dokumentert rent miljø, uten udokumentert hjelp. |
| AC2 | Faktisk ekstern offline-demo med lokale frontend-/API-/PDF-/worker-/fontressurser. |
| AC3 | Personens tre korrekte anbefalinger, lokale tallmangler, TG3 og fornyet finansgrunnlag. |
| AC4 | Personens faktiske kjøring av alle README-testkommandoer og utfall. |
| AC5 | Registrerte avvik, nødvendig retting og faktisk ny verifikasjon av det som feilet. |

**S6 kan først markeres bestått etter dette.** 5.4 kan ikke settes done fra
denne forberedelsen. S5-W1 og Story 4.5 endres ikke av ekstern demo/S6.
