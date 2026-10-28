# Ett kontrollert FINN-nettsøk — 2026-10-28

Brukeren bestilte ett Responses API-forsøk med eksisterende miljønøkkel,
web_search, ingen retries, ingen direkte FINN-scraping og stopp ved manglende
tilgang. Ingen importimplementering, produktkodeendring eller push var bestilt.
Bestillingen er bevart av eksisterende automatisk promptlogging. Dette er
supplerende prosessbevis til [FINN-checkpoint](../../../implementation-artifacts/finn-import-checkpoint-2026-10-28.md),
ikke en endring av tilgangsporten eller produktkravene.

Resultat: API-et fungerte teknisk, men metoden hentet **0 av 10 felt** for
FINN-kode 476576649. Ett verktøykall sendte to søkestrenger; leverandørens
`tool_usage.web_search.num_requests` er 1. Kildelisten inneholder andre
FINN-koder, ingen samsvarende annonse. Modellen stoppet og returnerte alle
verdier/kilder som null. Ingen direkte sideåpning eller videre oppslag ble gjort.
Denne testen brukte bare indeks/cache (`external_web_access:false`) og
FINN-domenefilter; den avgjør ikke hva en annen, særskilt autorisert metode
kunne gitt. Annonsetall finnes ikke som lokal fasit, og sammenligning med
originalannonsens dokumenterte tall er derfor **ikke mulig/verifisert**.

## Bevis og kostnad

- [Kjørt engangsskript](run-once.mjs), [eksakt forespørsel/prompt/schema](request.json),
  [dispatch](dispatch.json), [råsvar](response.json), [opprinnelig kvittering](receipt.json),
  [uttrekk](extracted.json) og [endelig strukturert rapport](report.json).
- Modell `gpt-6.1-sol`, Standard/default, reasoning low, SDK 6.9.1,
  120 s frist, maxRetries 0, maksimalt tre verktøykall; faktisk én transport,
  ett Responses-kall, ett søkeverktøykall, 8,646 s.
- Faktisk rapportert bruk: 13 216 input, 452 output (inkludert 65 reasoning),
  totalt 13 668 tokens. Input inkluderer 5 166 cache-write og 0 cache-read.
- Prisberegning: 8 050 ordinære input × $2/M = $0,016100;
  5 166 cache-write × $2,50/M = $0,012915;
  452 output × $10/M = $0,004520; ett søk = $0,010000.
  **Sum $0,043535 USD.** Fakturert kontokostnad er ikke tilgjengelig/verifisert.
- Cache-write er beregnet med dokumentert standard 30m. Ingen TTL ble sendt;
  råsvaret mangler TTL-fordeling og viser det eldre `prompt_cache_retention:24h`.
  Dette er en uttrykkelig forutsetning i rapporten, ikke fakturabevis.
- Den opprinnelige skriptkvitteringen undervurderer kostnaden fordi den utelot
  cache-write-påslaget. Den er bevart som kjørehistorikk; **report.json er korrigert
  prisgrunnlag**. Ingen nytt API-kall ble gjort for rettingen.
- Tidligere prosjektregnskap ga $0,070243; med denne beregnede testkostnaden
  er summen $0,113778. Eksisterende ledgerkode leser ikke denne nye mappen;
  beløpet her må tas med før eventuelle senere budsjettvurderinger.

Offisiell dokumentasjon kontrollert samme dato:
[web_search](https://developers.openai.com/api/docs/guides/tools-web-search),
[priser](https://developers.openai.com/api/docs/pricing),
[cache-priser og standard TTL](https://developers.openai.com/api/docs/guides/prompt-caching).
Dokumentasjonsoppslag i Codex inngår ikke i API-kvitteringen over.

Verifikasjon var lokal kontroll av råsvar, felt, kilde-ID-er, faktisk transportteller,
leverandørens søketeller og prisaritmetikk. Ingen produkttester er relevante for
denne dokumenterte engangstesten. Eksisterende README/SPEC/deferred-work og
tidligere sesjonsdokumenter ble ikke endret av forsøket. Ingen commit eller push.
Skal ikke kjøres igjen: skriptet avviser eksisterende request/dispatch-filer.
