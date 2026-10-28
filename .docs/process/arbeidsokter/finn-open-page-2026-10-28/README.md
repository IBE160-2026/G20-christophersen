# Live open_page — ett API-forsøk 2026-10-28

Brukeren autoriserte én ny begrenset test med eksisterende modell og nøkkel,
live web_search, eksplisitt open_page på eksakt URL, uten forventede økonomitall,
retries, omgåelse, produktendringer eller push. Kostnadsramme USD 0.15.
Bestillingen lagres av eksisterende automatisk promptlogging.

**Resultat:** Responses fullførte med én faktisk handling:
`open_page` på `https://www.finn.no/realestate/homes/ad.html?finnkode=476576649`.
Ingen search eller find_in_page. Handlingsstatus completed; modellen rapporterte
available og seks dokumenterte felt, to nuller. Dette viser at direkte åpning
gjennom denne web_search-kanalen fungerte i dette forsøket, til forskjell fra
[forrige indeksbaserte søk](../finn-web-search-2026-10-28/README.md).
Det beviser ikke en stabil generell importkanal eller rettigheter til produktbruk.

Bevis: [kjørt skript](run-once.mjs), [request/prompt/schema](request.json),
[dispatch](dispatch.json), [råsvar](response.json), [strukturert rapport](report.json).
Modellen fikk bare oppgave, feltdefinisjoner og URL, ingen forventede beløp.
Råsvaret inneholder handling, modellens uttrekk og forbruk, men ikke hele
verktøyets returnerte sidetekst; tallene er derfor modellrapporterte med URL-kilder,
uten uavhengig kontroll mot originaltekst. Ingen nye nettforespørsler ble gjort
for kontroll. Ukjente øvrige kjøpsomkostninger og leieinntekter beholdes som null.
Samlede omkostninger var ikke et separat felt i dette forsøkets schema og er
ikke verifisert; ingen differanseberegning er brukt som annonseopplysning.

## Bruk og kostnad

- Modell gpt-6.1-sol, Standard/default, reasoning low; SDK 6.9.1.
- Ett API-forsøk, én faktisk transport; maxRetries 0; 120 s frist.
- Live external_web_access=true, low søkekontekst, max_tool_calls=1,
  max_output_tokens=1600. Faktisk varighet 8,272 s.
- Input 8 148 tokens, herav 4 926 cache-write og 0 cache-read.
  Output 525, inkludert 68 reasoning; totalt 8 673.
- 3 222 ordinær input × $2/M + 4 926 cache-write × $2.50/M +
  525 output × $10/M = **USD 0.024009**. Forutsetter dokumentert standard
  30m cache-write-pris der TTL-fordeling mangler.
- Leverandørens tool_usage.web_search.num_requests=0 samsvarer med null
  search-handlinger. Ett open_page-kall er likevel dokumentert; ingen separat
  søkeavgift lagt til. Offisiell veiledning knytter søkeavgift til search-handlinger.
- Under USD 0.15. Fakturert kontobeløp er ikke uavhengig kontrollert.
  API-et har ikke en eksakt USD-grense per kall; verktøy-/outputgrenser og lav
  søkekontekst begrenset forventet forbruk, uten hard grense på returnerte inputtokens.
- Tidligere beregnet prosjektsum $0.113778 + denne testen $0.024009 =
  **$0.137787**. Eksisterende prosjektledgerkode leser ikke disse forsøksmappene;
  begge nye forsøk må inkluderes før senere budsjettvurderinger.

Kilder for beregning og handlingssemantikk:
[priser](https://developers.openai.com/api/docs/pricing),
[cache](https://developers.openai.com/api/docs/guides/prompt-caching),
[web_search](https://developers.openai.com/api/docs/guides/tools-web-search).
Codex-dokumentasjonsoppslag er utenfor denne API-kvitteringen.

Lokal kontroll av råsvaret bekreftet eksakt URL, bare én completed open_page,
én transport, seks beløp med eksakt URL og to nullverdier, og kostnadsaritmetikk.
Ingen produktkode, tidligere bevis eller eksisterende dokumentendringer endret.
Ingen commit/push. Engangsskriptet avviser eksisterende requestfil ved ny kjøring.
