# Fasit godkjent; count-pris fortsatt uavklart

**Senere scopeendring samme dag:** Brukeren har fjernet count som obligatorisk
avhengighet kun for første økonomitest. Se [lokal kostnadsport](lokalt-budsjett.md).
Prisundersøkelsen nedenfor bevares som historikk; den blokkerer ikke den nye
lokale prøveformen. Ingen gratispris for count er antatt.

Checkpoint etter `6bf8eaa`, 2026-10-30. Brukeren har uttrykkelig godkjent
fasitforslaget for den avgrensede økonomitesten med alle avvik og forbehold.
Dette godkjenner ikke betalte kall eller teknisk/TG-dekning.

Godkjenningen er registrert privat mot SHA-256 av det viste fasitforslaget.
Originalhash, pakke-/requestbinding, eksakte kildespenn og SDK-genereringswire
ble kontrollert lokalt. Maskinens lokale felt er ikke oppgradert til menneskelig
fasit. Historisk preflight og tidligere attestasjoner er beholdt uendret.
En separat privat klargjøringsfil angir gjeldende godkjenning og åpne porter.
Ingen omfattende testrunde var nødvendig for denne registreringen; ingen
produktkode eller finans-/screeningregel er endret.

## Dokumentert og udokumentert pris

Følgende offisielle sider ble søkt etter og åpnet på nytt:

- [Counting tokens](https://developers.openai.com/api/docs/guides/token-counting)
  beskriver telling av komplett input inkludert struktur; lokal teksttokenisering
  er ikke en nøyaktig telling av schema og hele API-inputen.
- [Get input token counts](https://developers.openai.com/api/reference/resources/responses/subresources/input_tokens/methods/count)
  bekrefter POST `/v1/responses/input_tokens` og returformatet.
- [API-priser](https://developers.openai.com/api/docs/pricing) og
  [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol)
  bekrefter modellprisene. Standard global kort input er USD 2/M,
  cache writes USD 2,50/M og output USD 10/M.

Søk etter gratispris, fakturering og count-pris etablerte ingen uttrykkelig
pris for count-endepunktet. Dette er et dokumentasjonsfunn, ikke bevis for
at tellingen koster penger eller er gratis. `COUNT_PRICE_EVIDENCE` forblir
uverifisert, og eksisterende kode stopper før nettverk. Ingen nøkkel ble lest.

Konservativ modellreserve ved 40 000 input og 8 000 output inklusive reasoning:
`40 000 * 2,50 / 1 000 000 + 8 000 * 10 / 1 000 000 = USD 0,18`.
Dette er et maksimum under de låste modellvilkårene, ikke et målt tokenantall
eller forventet faktisk forbruk. Resten på USD 0,02 er ikke godkjent som
dekning av et ukjent count-gebyr. Verktøy og automatisk retry er avskrudd.
En eventuell separat rapport må bruke samme varige USD 0,20-budsjett.

## Konkret neste handling

Få skriftlig prisbekreftelse fra OpenAI eller gjeldende kontovilkår før count
kan åpnes. Følgende henvendelse er klargjort, men **ikke sendt**:

> Please confirm billing for POST /v1/responses/input_tokens using
> gpt-6.1-sol, global Standard, text-only input with instructions and a strict
> JSON output schema. Is the count endpoint free? If not, what is the rate
> and maximum charge, including failed/aborted requests? Does token counting
> create separately billable cache writes? We need an enforceable total
> analysis allowance of USD 0.20 including counting and generation.

Et eventuelt bekreftet gebyr må bindes til prisbevis og reserveres før telling
under samme varige budsjett som genereringen. Deretter kreves en ekte
count-kvittering for uendret request og uttrykkelig betalt testgodkjenning.
Den faktiske live-transporten er fortsatt stengt; klargjøring er ikke
gjennomført live-test. Ingen modellkvalitet eller full TG-dekning er attestert.

Ingen betalte kall, private filer i Git eller push. Aktiv promptlogg bevares.
